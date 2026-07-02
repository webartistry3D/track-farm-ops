import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import SubscriptionAuditLogger from '../utils/subscriptionAuditLogger';

export const getCurrentSubscription = async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `sub_${Date.now()}`;
  
  try {
    const currentUser = req.user!;
    
    // Validate user exists
    if (!currentUser || !currentUser.id) {
      console.log(`❌ [${requestId}] Invalid user - getCurrentSubscription`);
      return res.status(401).json({ 
        error: 'Invalid user session',
        code: 'INVALID_USER',
        requestId
      });
    }

    // Get current user's organization
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log(`❌ [${requestId}] User ${currentUser.id} not assigned to organization - getCurrentSubscription`);
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION',
        requestId
      });
    }

    console.log(`📄 [${requestId}] Fetching subscription for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    // Check if organization has an active subscription (organization-wide access)
    let subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: currentUserOrg.organizationId,
        status: 'active'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // If no active subscription, check for trial
    if (!subscription) {
      const trialSubscription = await prisma.subscription.findFirst({
        where: {
          organizationId: currentUserOrg.organizationId,
          status: 'trial'
        }
      });

      if (!trialSubscription) {
        // Create a trial subscription for new users
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30); // 30-day trial

        subscription = await prisma.subscription.create({
          data: {
            userId: currentUser.id,
            organizationId: currentUserOrg.organizationId,
            plan: 'freemium',
            status: 'trial',
            billingCycle: 'monthly',
            price: 0,
            expiresAt: trialEndDate
          }
        });

        console.log(`✅ [${requestId}] Trial subscription created for user ${currentUser.id} in organization ${currentUserOrg.organizationId}`);
        
        // Log trial activation
        SubscriptionAuditLogger.logTrialActivation(req, 'freemium', Date.now() - startTime);
      } else {
        subscription = trialSubscription;
      }
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ [${requestId}] Subscription access granted: User ${currentUser.id}, Plan: ${subscription?.plan || 'none'}, Organization: ${currentUserOrg.organizationId}, Duration: ${responseTime}ms`);

    // Log successful subscription access
    SubscriptionAuditLogger.logAccess(req, 'SUBSCRIPTION_VIEW', {
      success: true,
      plan: subscription?.plan,
      status: subscription?.status,
      billingCycle: subscription?.billingCycle,
      price: subscription?.price ? parseFloat(subscription.price.toString()) : undefined,
      responseTime
    });

    res.json({
      success: true,
      subscription,
      requestId,
      meta: {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Log subscription access error
    SubscriptionAuditLogger.logError(req, error as Error, responseTime);
    
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      requestId,
      meta: {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, billingCycle, amount } = req.body;
    const currentUser = req.user!;

    // Get current user's organization
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log('⚠️ User not assigned to any organization - access denied for subscription creation');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`📝 Creating subscription for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    // Check user role - only owners and managers can create subscriptions
    if (!['OWNER', 'MANAGER'].includes(currentUser.role)) {
      console.log(`🚫 Subscription creation denied: User ${currentUser.id} has insufficient role ${currentUser.role}`);
      return res.status(403).json({ 
        error: 'Access denied. Only owners and managers can create subscriptions.',
        code: 'INSUFFICIENT_ROLE'
      });
    }

    // Validate plan
    const validPlans = ['starter', 'growth', 'pro'];
    if (!validPlans.includes(planId)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Calculate price based on plan and billing cycle
    const planPrices: Record<string, { monthly: number; annual: number }> = {
      starter: { monthly: 10000, annual: 96000 },
      growth: { monthly: 39000, annual: 374400 },
      pro: { monthly: 99000, annual: 950400 }
    };

    const expectedAmount = planPrices[planId as keyof typeof planPrices][billingCycle as keyof typeof planPrices[string]];
    if (amount !== expectedAmount) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Cancel any existing active subscriptions for this user in the same organization
    await prisma.subscription.updateMany({
      where: {
        userId: currentUser.id,
        organizationId: currentUserOrg.organizationId,
        status: 'active'
      },
      data: {
        status: 'cancelled'
      }
    });

    // Create new subscription (pending payment)
    const subscription = await prisma.subscription.create({
      data: {
        userId: currentUser.id,
        organizationId: currentUserOrg.organizationId,
        plan: planId,
        status: 'pending',
        billingCycle,
        price: amount
      }
    });

    console.log(`✅ Subscription created: User ${currentUser.id}, Plan: ${planId}, Organization: ${currentUserOrg.organizationId}`);

    res.json(subscription);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { reference, planId, billingCycle, amount } = req.body;
    const currentUser = req.user!;

    // Get current user's organization
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log('⚠️ User not assigned to any organization - access denied for payment verification');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`💳 Verifying payment for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    // In a real implementation, you would verify the payment with Paystack API
    // For now, we'll simulate successful verification
    
    // Verify payment with Paystack (test implementation)
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY is not configured');
      return res.status(500).json({ error: 'Payment provider not configured' });
    }
    
    try {
      // In production, make actual API call to Paystack
      // const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      //   headers: {
      //     Authorization: `Bearer ${paystackSecretKey}`
      //   }
      // });

      // For testing, we'll simulate a successful response
      const mockPaystackResponse = {
        status: true,
        data: {
          status: 'success',
          reference: reference,
          amount: amount * 100, // Paystack returns amount in kobo
          currency: 'NGN',
          paid_at: new Date().toISOString()
        }
      };

      if (mockPaystackResponse.data.status === 'success') {
        // Update subscription to active
        const expiresAt = new Date();
        if (billingCycle === 'monthly') {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }

        // First, cancel any existing active subscriptions
        await prisma.subscription.updateMany({
          where: {
            userId: currentUser.id,
            status: 'active'
          },
          data: {
            status: 'cancelled',
            cancelledAt: new Date()
          }
        });

        // Create new active subscription
        const subscription = await prisma.subscription.create({
          data: {
            userId: currentUser.id,
            organizationId: currentUserOrg.organizationId,
            plan: planId,
            status: 'active',
            billingCycle,
            price: amount,
            paystackReference: reference,
            expiresAt,
            activatedAt: new Date()
          }
        });

        console.log(`✅ Payment verified and subscription activated: User ${currentUser.id}, Plan: ${planId}, Organization: ${currentUserOrg.organizationId}`);

        res.json({
          success: true,
          subscription: subscription
        });
      } else {
        console.log(`❌ Payment verification failed for user ${currentUser.id}, reference: ${reference}`);
        res.status(400).json({ error: 'Payment verification failed' });
      }
    } catch (paystackError) {
      console.error('Paystack verification error:', paystackError);
      res.status(500).json({ error: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;

    // Get current user's organization
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log('⚠️ User not assigned to any organization - access denied for subscription cancellation');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`❌ Cancelling subscription for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    // Check user role - only owners and managers can cancel subscriptions
    if (!['OWNER', 'MANAGER'].includes(currentUser.role)) {
      console.log(`🚫 Subscription cancellation denied: User ${currentUser.id} has insufficient role ${currentUser.role}`);
      return res.status(403).json({ 
        error: 'Access denied. Only owners and managers can cancel subscriptions.',
        code: 'INSUFFICIENT_ROLE'
      });
    }

    // Find active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: currentUser.id,
        status: 'active'
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Update subscription to cancelled
    const updatedSubscription = await prisma.subscription.update({
      where: {
        id: subscription.id
      },
      data: {
        status: 'cancelled',
        cancelledAt: new Date()
      }
    });

    console.log(`✅ Subscription cancelled: User ${currentUser.id}, Plan: ${subscription.plan}, Organization: ${currentUserOrg.organizationId}`);

    res.json({
      success: true,
      subscription: updatedSubscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, billingCycle } = req.body;
    const currentUser = req.user!;

    // Get current user's organization
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!currentUserOrg || !currentUserOrg.organizationId) {
      console.log('⚠️ User not assigned to any organization - access denied for subscription update');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`📝 Updating subscription for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    // Check user role - only owners and managers can update subscriptions
    if (!['OWNER', 'MANAGER'].includes(currentUser.role)) {
      console.log(`🚫 Subscription update denied: User ${currentUser.id} has insufficient role ${currentUser.role}`);
      return res.status(403).json({ 
        error: 'Access denied. Only owners and managers can update subscriptions.',
        code: 'INSUFFICIENT_ROLE'
      });
    }

    // Validate plan
    const validPlans = ['starter', 'growth', 'pro'];
    if (!validPlans.includes(planId)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Find current subscription
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId: currentUser.id,
        status: 'active'
      }
    });

    if (!currentSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Update subscription (this would typically involve a payment process)
    const updatedSubscription = await prisma.subscription.update({
      where: {
        id: currentSubscription.id
      },
      data: {
        plan: planId,
        billingCycle
      }
    });

    console.log(`✅ Subscription updated: User ${currentUser.id}, Plan: ${planId}, Organization: ${currentUserOrg.organizationId}`);

    res.json({
      success: true,
      subscription: updatedSubscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
