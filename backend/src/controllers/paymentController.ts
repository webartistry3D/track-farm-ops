import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const planPrices: Record<string, { monthly: number; annual: number }> = {
  starter: { monthly: 10000, annual: 96000 },
  growth: { monthly: 39000, annual: 374400 },
  pro: { monthly: 99000, annual: 950400 }
};

const getBankDetails = () => ({
  bankName: process.env.BANK_NAME || 'Providus Bank',
  accountName: process.env.BANK_ACCOUNT_NAME || 'WebArtistry Creations',
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890'
});

const generatePaymentReference = (planId: string): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  const planCode = planId.substring(0, 2).toUpperCase();
  return `TFO-${planCode}-${date}-${random}`;
};

const calculateSubscriptionExpiry = (billingCycle: string, fromDate: Date = new Date()): Date => {
  const expiry = new Date(fromDate);
  if (billingCycle === 'monthly') {
    expiry.setMonth(expiry.getMonth() + 1);
  } else if (billingCycle === 'annual') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  }
  return expiry;
};

const calculatePaymentRequestExpiry = (hours: number = 48): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
};

const auditLog = async (
  req: AuthRequest,
  action: string,
  entityType: string,
  entityId: number | null,
  oldValue?: string,
  newValue?: string,
  metadata?: Record<string, any>
) => {
  try {
    const user = req.user;
    if (!user) return;

    await prisma.subscriptionAuditLog.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId || null,
        action,
        entityType,
        entityId,
        oldValue,
        newValue,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: Array.isArray(req.headers['user-agent']) ? req.headers['user-agent'][0] : req.headers['user-agent'] || 'unknown',
        endpoint: req.originalUrl,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

const createPaymentNotifications = async (
  organizationId: number,
  title: string,
  message: string,
  type: string,
  relatedEntity: string,
  relatedEntityId: number,
  excludeUserId?: number,
  includeUserIds?: number[],
  metadata?: Record<string, any>
) => {
  try {
    const recipients = await prisma.user.findMany({
      where: {
        organizationId,
        role: { in: ['OWNER', 'MANAGER'] }
      },
      select: { id: true }
    });

    let recipientIds = recipients.map(u => u.id);
    if (includeUserIds) {
      recipientIds = Array.from(new Set([...recipientIds, ...includeUserIds]));
    }

    recipientIds = recipientIds.filter(id => id !== excludeUserId);

    if (recipientIds.length === 0) return;

    await prisma.notification.createMany({
      data: recipientIds.map(userId => ({
        userId,
        organizationId,
        title,
        message,
        type: type as any,
        relatedEntity,
        relatedEntityId,
        metadata: metadata ? JSON.stringify(metadata) : null
      }))
    });
  } catch (error) {
    console.error('Failed to create payment notifications:', error);
  }
};

export const initiateManualPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, billingCycle } = req.body;
    const currentUser = req.user!;

    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { organizationId: true }
    });

    if (!currentUserOrg || !currentUserOrg.organizationId) {
      return res.status(403).json({ error: 'Access denied. User must be assigned to an organization.', code: 'NO_ORGANIZATION' });
    }

    if (!['OWNER', 'MANAGER'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Access denied. Only owners and managers can initiate payments.', code: 'INSUFFICIENT_ROLE' });
    }

    const validPlans = ['starter', 'growth', 'pro'];
    if (!validPlans.includes(planId)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    if (!['monthly', 'annual'].includes(billingCycle)) {
      return res.status(400).json({ error: 'Invalid billing cycle' });
    }

    const amount = planPrices[planId][billingCycle as 'monthly' | 'annual'];
    const organizationId = currentUserOrg.organizationId;

    const existingPending = await prisma.paymentRequest.findFirst({
      where: {
        organizationId,
        status: { in: ['PENDING', 'UNDER_REVIEW'] }
      }
    });

    if (existingPending) {
      return res.status(400).json({
        error: 'You already have a pending payment request. Please complete or cancel it before creating a new one.',
        code: 'DUPLICATE_PAYMENT_REQUEST',
        existingRequest: {
          reference: existingPending.paymentReference,
          status: existingPending.status
        }
      });
    }

    let paymentReference = generatePaymentReference(planId);
    let attempts = 0;
    while (await prisma.paymentRequest.findUnique({ where: { paymentReference } })) {
      paymentReference = generatePaymentReference(planId);
      attempts++;
      if (attempts > 10) {
        return res.status(500).json({ error: 'Failed to generate unique payment reference' });
      }
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: currentUser.id,
        organizationId,
        plan: planId,
        status: 'pending_payment',
        billingCycle,
        price: amount
      }
    });

    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        userId: currentUser.id,
        organizationId,
        subscriptionId: subscription.id,
        planId,
        billingCycle,
        paymentReference,
        amount,
        paymentMethod: 'BANK_TRANSFER',
        status: 'PENDING',
        paymentRequestExpiresAt: calculatePaymentRequestExpiry(Number(process.env.PAYMENT_REQUEST_EXPIRY_HOURS) || 48)
      }
    });

    await auditLog(req, 'PAYMENT_INITIATED', 'PaymentRequest', paymentRequest.id, undefined, 'PENDING', {
      planId,
      billingCycle,
      amount,
      reference: paymentReference
    });

    res.json({
      success: true,
      subscription,
      paymentRequest,
      bankDetails: getBankDetails(),
      message: 'Payment request created. Please transfer the amount and click "I\'ve Sent the Money".'
    });
  } catch (error) {
    console.error('Initiate manual payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitManualPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentRequestId } = req.body;
    const currentUser = req.user!;

    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { organizationId: true }
    });

    if (!currentUserOrg || !currentUserOrg.organizationId) {
      return res.status(403).json({ error: 'Access denied. User must be assigned to an organization.', code: 'NO_ORGANIZATION' });
    }

    const paymentRequest = await prisma.paymentRequest.findFirst({
      where: {
        id: paymentRequestId,
        organizationId: currentUserOrg.organizationId,
        status: 'PENDING'
      },
      include: { subscription: true }
    });

    if (!paymentRequest) {
      return res.status(404).json({ error: 'Payment request not found or already submitted', code: 'PAYMENT_NOT_FOUND' });
    }

    if (paymentRequest.paymentRequestExpiresAt && new Date() > paymentRequest.paymentRequestExpiresAt) {
      await prisma.paymentRequest.update({
        where: { id: paymentRequest.id },
        data: { status: 'EXPIRED' }
      });
      return res.status(400).json({ error: 'Payment request has expired. Please create a new one.', code: 'PAYMENT_EXPIRED' });
    }

    const [updatedPaymentRequest] = await prisma.$transaction([
      prisma.paymentRequest.update({
        where: { id: paymentRequest.id },
        data: {
          status: 'UNDER_REVIEW',
          submittedAt: new Date()
        }
      }),
      prisma.subscription.update({
        where: { id: paymentRequest.subscriptionId! },
        data: { status: 'pending_payment' }
      })
    ]);

    await auditLog(req, 'PAYMENT_SUBMITTED', 'PaymentRequest', paymentRequest.id, 'PENDING', 'UNDER_REVIEW');

    await createPaymentNotifications(
      paymentRequest.organizationId,
      'Payment Submitted for Review',
      `Payment reference ${paymentRequest.paymentReference} has been submitted and is awaiting verification.`,
      'INFO',
      'PaymentRequest',
      paymentRequest.id,
      currentUser.id,
      undefined,
      { reference: paymentRequest.paymentReference, amount: paymentRequest.amount.toString(), planId: paymentRequest.planId }
    );

    res.json({
      success: true,
      paymentRequest: updatedPaymentRequest,
      message: 'Payment submitted for verification. You will be notified once reviewed.'
    });
  } catch (error) {
    console.error('Submit manual payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;

    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { organizationId: true }
    });

    if (!currentUserOrg || !currentUserOrg.organizationId) {
      return res.status(403).json({ error: 'Access denied. User must be assigned to an organization.', code: 'NO_ORGANIZATION' });
    }

    const paymentRequests = await prisma.paymentRequest.findMany({
      where: { organizationId: currentUserOrg.organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: { select: { plan: true, status: true, expiresAt: true } },
        reviewer: { select: { name: true } }
      }
    });

    res.json({ success: true, paymentRequests });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPendingPayments = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;

    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    const status = req.query.status as string | undefined;
    const where: any = {};
    if (status && ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED'].includes(status)) {
      where.status = status;
    } else {
      where.status = { in: ['PENDING', 'UNDER_REVIEW'] };
    }

    const paymentRequests = await prisma.paymentRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true } },
        subscription: { select: { id: true, plan: true, status: true } }
      }
    });

    res.json({ success: true, paymentRequests });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approvePayment = async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { note } = req.body;
    const currentUser = req.user!;

    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    const paymentRequestId = parseInt(id, 10);
    if (isNaN(paymentRequestId)) {
      return res.status(400).json({ error: 'Invalid payment request ID' });
    }

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: paymentRequestId },
      include: { subscription: true }
    });

    if (!paymentRequest) {
      return res.status(404).json({ error: 'Payment request not found' });
    }

    if (paymentRequest.status === 'APPROVED') {
      return res.status(400).json({ error: 'Payment request already approved' });
    }

    if (paymentRequest.userId === currentUser.id) {
      return res.status(403).json({ error: 'Cannot review your own payment request' });
    }

    if (!paymentRequest.subscription) {
      return res.status(400).json({ error: 'No linked subscription found' });
    }

    const expiresAt = calculateSubscriptionExpiry(paymentRequest.billingCycle);
    const activatedAt = new Date();

    await prisma.$transaction([
      prisma.paymentRequest.update({
        where: { id: paymentRequest.id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: currentUser.id,
          reviewerNote: note || null
        }
      }),
      prisma.subscription.update({
        where: { id: paymentRequest.subscriptionId! },
        data: {
          status: 'active',
          paymentMethod: 'BANK_TRANSFER',
          activatedAt,
          expiresAt
        }
      })
    ]);

    await auditLog(req, 'PAYMENT_APPROVED', 'PaymentRequest', paymentRequest.id, 'UNDER_REVIEW', 'APPROVED', {
      amount: paymentRequest.amount.toString(),
      planId: paymentRequest.planId,
      reviewerNote: note
    });

    await createPaymentNotifications(
      paymentRequest.organizationId,
      'Payment Approved',
      `Your payment reference ${paymentRequest.paymentReference} has been approved and your subscription is now active.`,
      'SUCCESS',
      'PaymentRequest',
      paymentRequest.id,
      currentUser.id,
      [paymentRequest.userId],
      { reference: paymentRequest.paymentReference, amount: paymentRequest.amount.toString(), planId: paymentRequest.planId, reviewerNote: note }
    );

    res.json({
      success: true,
      message: 'Payment approved and subscription activated'
    });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectPayment = async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { note } = req.body;
    const currentUser = req.user!;

    if (currentUser.role !== 'SUPERUSER') {
      return res.status(403).json({ error: 'Superuser access required' });
    }

    const paymentRequestId = parseInt(id, 10);
    if (isNaN(paymentRequestId)) {
      return res.status(400).json({ error: 'Invalid payment request ID' });
    }

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: paymentRequestId },
      include: { subscription: true }
    });

    if (!paymentRequest) {
      return res.status(404).json({ error: 'Payment request not found' });
    }

    if (paymentRequest.status === 'REJECTED') {
      return res.status(400).json({ error: 'Payment request already rejected' });
    }

    if (paymentRequest.userId === currentUser.id) {
      return res.status(403).json({ error: 'Cannot review your own payment request' });
    }

    if (!note) {
      return res.status(400).json({ error: 'Rejection note is required' });
    }

    await prisma.$transaction([
      prisma.paymentRequest.update({
        where: { id: paymentRequest.id },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: currentUser.id,
          reviewerNote: note
        }
      }),
      prisma.subscription.update({
        where: { id: paymentRequest.subscriptionId! },
        data: {
          status: 'cancelled',
          cancelledAt: new Date()
        }
      })
    ]);

    await auditLog(req, 'PAYMENT_REJECTED', 'PaymentRequest', paymentRequest.id, paymentRequest.status, 'REJECTED', {
      reason: note
    });

    await createPaymentNotifications(
      paymentRequest.organizationId,
      'Payment Rejected',
      `Your payment reference ${paymentRequest.paymentReference} has been rejected. Reason: ${note}`,
      'ERROR',
      'PaymentRequest',
      paymentRequest.id,
      currentUser.id,
      [paymentRequest.userId],
      { reference: paymentRequest.paymentReference, reason: note }
    );

    res.json({
      success: true,
      message: 'Payment rejected and subscription cancelled'
    });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBankDetailsPublic = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, bankDetails: getBankDetails() });
  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrentPaymentRequest = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;

    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { organizationId: true }
    });

    if (!currentUserOrg || !currentUserOrg.organizationId) {
      return res.status(403).json({ error: 'Access denied. User must be assigned to an organization.', code: 'NO_ORGANIZATION' });
    }

    const paymentRequest = await prisma.paymentRequest.findFirst({
      where: {
        organizationId: currentUserOrg.organizationId,
        status: { in: ['PENDING', 'UNDER_REVIEW'] }
      },
      include: {
        subscription: { select: { plan: true, status: true } }
      }
    });

    res.json({ success: true, paymentRequest });
  } catch (error) {
    console.error('Get current payment request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
