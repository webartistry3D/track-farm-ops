import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { buildRoleBasedWhereClause, canUserAccessRecord, getAccessibleUserIds } from '../utils/roleAccess';

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const {
      invoiceNumber,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      businessName,
      businessEmail,
      businessPhone,
      businessAddress,
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
      dueDate,
      notes
    } = req.body;

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
      console.log('⚠️ User not assigned to any organization - access denied for invoice creation');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`📝 Creating invoice for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    if (!clientName || !items || !total) {
      return res.status(400).json({ error: 'Client name, items, and total are required' });
    }

    // Generate unique invoice number if not provided
    const finalInvoiceNumber = invoiceNumber || `INV-${Date.now()}`;

    // Check if invoice number already exists within the organization
    const existingInvoice = await prisma.invoice.findFirst({
      where: { 
        invoiceNumber: finalInvoiceNumber,
        user: {
          organizationId: currentUserOrg.organizationId
        }
      }
    });

    if (existingInvoice) {
      return res.status(400).json({ error: 'Invoice number already exists in your organization' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: finalInvoiceNumber,
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        businessName: businessName || currentUser.name,
        businessEmail: businessEmail || currentUser.email,
        businessPhone: businessPhone || '+234-XXX-XXX-XXXX',
        businessAddress: businessAddress || 'Farm Location, Nigeria',
        items: items,
        subtotal: parseFloat(subtotal.toString()),
        tax: parseFloat(tax.toString()),
        total: parseFloat(total.toString()),
        paymentMethod: paymentMethod || 'TRANSFER',
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
        userId: currentUser.id,
        createdBy: currentUser.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`✅ Invoice created successfully: User ${currentUser.id}, Invoice: ${invoice.id}, Organization: ${currentUserOrg.organizationId}`);
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      requestBody: req.body,
      user: req.user
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 10, offset = 0, status } = req.query;
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
      console.log('⚠️ User not assigned to any organization - access denied for invoice retrieval');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`📄 Fetching invoices for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    // Multi-tenant: Get user IDs that the current user should see within their organization
    let userIds: number[];
    if (currentUser.role === 'OWNER') {
      // Owners see data from all users in their organization
      const orgUsers = await prisma.user.findMany({
        where: { organizationId: currentUserOrg.organizationId },
        select: { id: true }
      });
      userIds = orgUsers.map(u => u.id);
    } else if (currentUser.role === 'MANAGER') {
      // Managers see data from OWNER, MANAGER, and WORKER in their organization
      const orgUsers = await prisma.user.findMany({
        where: { 
          organizationId: currentUserOrg.organizationId,
          role: { in: ['SUPERUSER', 'OWNER', 'MANAGER', 'WORKER', 'ACCOUNTANT', 'INVENTORY', 'VETERINARIAN'] }
        },
        select: { id: true }
      });
      userIds = orgUsers.map(u => u.id);
    } else if (currentUser.role === 'WORKER') {
      // Workers see data from OWNER, MANAGER, and WORKER in their organization (organization-wide access)
      const orgUsers = await prisma.user.findMany({
        where: { 
          organizationId: currentUserOrg.organizationId,
          role: { in: ['SUPERUSER', 'OWNER', 'MANAGER', 'WORKER', 'ACCOUNTANT', 'INVENTORY', 'VETERINARIAN'] }
        },
        select: { id: true }
      });
      userIds = orgUsers.map(u => u.id);
    } else {
      // Default: only user's own data
      userIds = [currentUser.id];
    }

    // Build where clause with organization-based filtering
    const whereClause = {
      userId: { in: userIds },
      ...(status && { status: status as any })
    };

    // Get invoices with organization-based filtering at database level
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    // Get total count for pagination
    const totalCount = await prisma.invoice.count({
      where: whereClause
    });

    console.log(`✅ Organization-based invoice filtering: Found ${invoices.length} invoices for ${currentUser.role} ${currentUser.name} (total: ${totalCount}) in organization ${currentUserOrg.organizationId}`);

    res.json({
      entries: invoices,
      total: totalCount
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const invoiceId = parseInt(Array.isArray(id) ? id[0] : id);
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
      console.log('⚠️ User not assigned to any organization - access denied for invoice details');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`📄 Fetching invoice ${invoiceId} for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    // Get invoice with organization-based filtering
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        user: {
          organizationId: currentUserOrg.organizationId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Check if user has access based on role and organization membership
    let hasAccess = false;
    if (currentUser.role === 'OWNER') {
      // Owners can access all invoices in their organization
      hasAccess = true;
    } else if (currentUser.role === 'MANAGER') {
      // Managers can access invoices from OWNER, MANAGER, and WORKER roles
      hasAccess = ['SUPERUSER', 'OWNER', 'MANAGER', 'WORKER', 'ACCOUNTANT', 'INVENTORY', 'VETERINARIAN'].includes(invoice.user?.role || '');
    } else if (currentUser.role === 'WORKER') {
      // Workers can access invoices from OWNER, MANAGER, and WORKER roles (organization-wide access)
      hasAccess = ['SUPERUSER', 'OWNER', 'MANAGER', 'WORKER', 'ACCOUNTANT', 'INVENTORY', 'VETERINARIAN'].includes(invoice.user?.role || '');
    } else {
      // Users can only access their own invoices
      hasAccess = invoice.userId === currentUser.id;
    }
    
    if (!hasAccess) {
      console.log(`🚫 Access denied: ${currentUser.role} ${currentUser.name} cannot access invoice belonging to ${invoice.user?.role} ${invoice.user?.name}`);
      return res.status(403).json({ error: 'Access denied: insufficient privileges' });
    }

    console.log(`✅ Access granted: ${currentUser.role} ${currentUser.name} accessing invoice of ${invoice.user?.role} ${invoice.user?.name} in organization ${currentUserOrg.organizationId}`);
    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const invoiceId = parseInt(Array.isArray(id) ? id[0] : id);
    const currentUser = req.user!;
    const {
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      businessName,
      businessEmail,
      businessPhone,
      businessAddress,
      items,
      subtotal,
      tax,
      total,
      status,
      paymentMethod,
      dueDate,
      notes
    } = req.body;

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
      console.log('⚠️ User not assigned to any organization - access denied for invoice update');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`📝 Updating invoice ${invoiceId} for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    // First check if invoice exists within the organization
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        user: {
          organizationId: currentUserOrg.organizationId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Check if user has access based on role and organization membership
    let hasAccess = false;
    if (currentUser.role === 'OWNER') {
      // Owners can update all invoices in their organization
      hasAccess = true;
    } else if (currentUser.role === 'MANAGER') {
      // Managers can update invoices from OWNER, MANAGER, and WORKER roles
      hasAccess = ['OWNER', 'MANAGER', 'WORKER'].includes(existingInvoice.user?.role || '');
    } else {
      // Users can only update their own invoices
      hasAccess = existingInvoice.userId === currentUser.id;
    }
    
    if (!hasAccess) {
      console.log(`🚫 Update denied: ${currentUser.role} ${currentUser.name} cannot update invoice belonging to ${existingInvoice.user?.role} ${existingInvoice.user?.name}`);
      return res.status(403).json({ error: 'Access denied: insufficient privileges to update this invoice' });
    }

    // Update the invoice
    const updatedInvoice = await prisma.invoice.update({
      where: {
        id: invoiceId
      },
      data: {
        ...(clientName && { clientName }),
        ...(clientEmail && { clientEmail }),
        ...(clientPhone && { clientPhone }),
        ...(clientAddress && { clientAddress }),
        ...(businessName && { businessName }),
        ...(businessEmail && { businessEmail }),
        ...(businessPhone && { businessPhone }),
        ...(businessAddress && { businessAddress }),
        ...(items && { items }),
        ...(subtotal !== undefined && { subtotal: parseFloat(subtotal.toString()) }),
        ...(tax !== undefined && { tax: parseFloat(tax.toString()) }),
        ...(total !== undefined && { total: parseFloat(total.toString()) }),
        ...(status && { status }),
        ...(paymentMethod && { paymentMethod }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(notes !== undefined && { notes })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    console.log(`✅ Invoice updated successfully: User ${currentUser.id}, Invoice: ${invoiceId}, Organization: ${currentUserOrg.organizationId}`);
    res.json(updatedInvoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const invoiceId = parseInt(Array.isArray(id) ? id[0] : id);
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
      console.log('⚠️ User not assigned to any organization - access denied for invoice deletion');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`🗑️ Deleting invoice ${invoiceId} for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    // First check if invoice exists within the organization
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        user: {
          organizationId: currentUserOrg.organizationId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Check if user has access based on role and organization membership
    let hasAccess = false;
    if (currentUser.role === 'OWNER') {
      // Owners can delete all invoices in their organization
      hasAccess = true;
    } else if (currentUser.role === 'MANAGER') {
      // Managers can delete invoices from OWNER, MANAGER, and WORKER roles
      hasAccess = ['OWNER', 'MANAGER', 'WORKER'].includes(existingInvoice.user?.role || '');
    } else {
      // Users can only delete their own invoices
      hasAccess = existingInvoice.userId === currentUser.id;
    }
    
    if (!hasAccess) {
      console.log(`🚫 Delete denied: ${currentUser.role} ${currentUser.name} cannot delete invoice belonging to ${existingInvoice.user?.role} ${existingInvoice.user?.name}`);
      return res.status(403).json({ error: 'Access denied: insufficient privileges to delete this invoice' });
    }

    await prisma.invoice.delete({
      where: {
        id: invoiceId
      }
    });

    console.log(`✅ Invoice deleted successfully: User ${currentUser.id}, Invoice: ${existingInvoice.invoiceNumber}, Organization: ${currentUserOrg.organizationId}`);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markInvoiceAsPaid = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const invoiceId = parseInt(Array.isArray(id) ? id[0] : id);
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
      console.log('⚠️ User not assigned to any organization - access denied for invoice payment marking');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`💳 Marking invoice ${invoiceId} as paid for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    // First check if invoice exists within organization
    console.log(`🔍 DEBUG: Looking for invoice ${invoiceId} in organization ${currentUserOrg.organizationId}`);
    
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        user: {
          organizationId: currentUserOrg.organizationId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            organizationId: true
          }
        }
      }
    });

    console.log(`🔍 DEBUG: Invoice found:`, existingInvoice ? {
      id: existingInvoice.id,
      invoiceNumber: existingInvoice.invoiceNumber,
      creatorId: existingInvoice.userId,
      creatorName: existingInvoice.user?.name,
      creatorRole: existingInvoice.user?.role,
      creatorOrgId: existingInvoice.user?.organizationId
    } : 'NOT FOUND');

    if (!existingInvoice) {
      console.log(`🚫 Invoice not found - likely organization mismatch`);
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Check if user has access based on organization membership (organization-wide access)
    // All organization members (OWNER, MANAGER, WORKER) can mark any invoice as paid
    console.log(`🔍 DEBUG: Checking access - Current user: ${currentUser.role} ${currentUser.name}, Invoice creator: ${existingInvoice.user?.role} ${existingInvoice.user?.name}`);
    
    let hasAccess = false;
    if (currentUser.role === 'OWNER') {
      // Owners can mark all invoices in their organization as paid
      hasAccess = true;
      console.log(`🔍 DEBUG: OWNER access granted`);
    } else if (currentUser.role === 'MANAGER') {
      // Managers can mark invoices from OWNER, MANAGER, and WORKER roles as paid
      const allowedRoles = ['SUPERUSER', 'OWNER', 'MANAGER', 'WORKER', 'ACCOUNTANT', 'INVENTORY', 'VETERINARIAN'];
      hasAccess = allowedRoles.includes(existingInvoice.user?.role || '');
      console.log(`🔍 DEBUG: MANAGER access check - Allowed roles: [${allowedRoles.join(', ')}], Invoice creator role: ${existingInvoice.user?.role}, Access granted: ${hasAccess}`);
    } else if (currentUser.role === 'WORKER') {
      // Workers can mark any invoice in their organization as paid (organization-wide access)
      hasAccess = existingInvoice.user?.organizationId === currentUserOrg.organizationId;
      console.log(`🔍 DEBUG: WORKER access check - Same organization: ${hasAccess}`);
    } else {
      // Default: deny access
      hasAccess = false;
      console.log(`🔍 DEBUG: Unknown role - access denied`);
    }
    
    if (!hasAccess) {
      console.log(`🚫 Mark-paid denied: ${currentUser.role} ${currentUser.name} cannot mark invoice belonging to ${existingInvoice.user?.role} ${existingInvoice.user?.name}`);
      return res.status(403).json({ error: 'Access denied: insufficient privileges to mark this invoice as paid' });
    }

    if (existingInvoice.status === 'PAID') {
      return res.status(400).json({ error: 'Invoice is already marked as paid' });
    }

    // Update invoice status to paid and store who marked it
    const updatedInvoice = await prisma.invoice.update({
      where: {
        id: invoiceId
      },
      data: {
        status: 'PAID',
        paidDate: new Date(),
        paidBy: currentUser.id, // Store who marked this invoice as paid
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        paidByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Create income entry from the paid invoice
    const totalQuantity = existingInvoice.items ? 
      (existingInvoice.items as any[]).reduce((total: number, item: any) => total + (item.quantity || 0), 0) : 0;
    
    const invoiceCreator = existingInvoice.user?.name || 'Unknown';
    const description = `Payment for invoice #${existingInvoice.invoiceNumber} - ${existingInvoice.clientName} [Invoice Creator: ${invoiceCreator}]`;
    
    console.log(`🔍 DEBUG: Marking invoice as paid:`, {
      invoiceId: existingInvoice.id,
      invoiceNumber: existingInvoice.invoiceNumber,
      currentStatus: existingInvoice.status,
      currentUser: currentUser.id,
      description: description
    });
    
    if (String(existingInvoice.status) === 'PAID') {
      console.log(`⚠️ Invoice ${existingInvoice.invoiceNumber} is already marked as paid`);
      return res.status(400).json({ 
        error: 'Invoice is already marked as paid',
        code: 'ALREADY_PAID'
      });
    }
    
    // Check if income entry already exists for this invoice (more robust check)
    console.log(`🔍 DEBUG: Checking for existing income entry with description: ${description}`);
    
    const existingIncome = await prisma.incomeEntry.findFirst({
      where: {
        description: {
          startsWith: `Payment for invoice #${existingInvoice.invoiceNumber}`
        }
      }
    });
    
    console.log(`🔍 DEBUG: Existing income entry found:`, existingIncome ? {
      id: existingIncome.id,
      description: existingIncome.description,
      userId: existingIncome.userId
    } : 'NONE');
    
    if (existingIncome) {
      console.log(`⚠️ Income entry already exists for invoice ${existingInvoice.invoiceNumber}`);
      return res.status(400).json({ 
        error: 'Income entry already exists for this invoice',
        code: 'DUPLICATE_INCOME',
        existingIncome: existingIncome
      });
    }
    
    try {
      console.log(`🔍 DEBUG: Creating income entry for invoice ${existingInvoice.invoiceNumber}`);
      
      // Use invoice subtotal directly (already calculated correctly in invoice)
      const subtotal = existingInvoice.subtotal ? Number(existingInvoice.subtotal) : 0;
      const vatAmount = subtotal > 0 ? (subtotal * 0.075) : 0;
      
      console.log(`🔍 DEBUG: Invoice ${existingInvoice.invoiceNumber} - Using invoice subtotal: ₦${subtotal}, VAT: ₦${vatAmount}, Total: ₦${subtotal + vatAmount}`);
      console.log(`🔍 DEBUG: Saving income entry with amount (invoice subtotal): ₦${subtotal}`);
      
      const incomeEntry = await prisma.incomeEntry.create({
        data: {
          amount: subtotal, // Use invoice subtotal directly
          category: 'Sales',
          paymentMethod: existingInvoice.paymentMethod || 'TRANSFER',
          date: new Date(),
          description: description,
          quantity: totalQuantity > 0 ? totalQuantity : null,
          unitPrice: totalQuantity > 0 ? (subtotal / totalQuantity) : null, // Use subtotal for unit price
          vatAmount: vatAmount, // Store VAT separately
          userId: currentUser.id, // User who marked invoice as paid
          organizationId: currentUserOrg.organizationId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      console.log(`✅ Income entry created from invoice: ${incomeEntry.id}`, {
        incomeId: incomeEntry.id,
        description: incomeEntry.description,
        userId: incomeEntry.userId,
        createdAt: incomeEntry.createdAt
      });
      
      res.json({
        invoice: updatedInvoice,
        income: incomeEntry
      });
    } catch (error: any) {
      console.error('🔍 DEBUG: Income creation error:', {
        error: error.message,
        code: error.code,
        invoiceNumber: existingInvoice.invoiceNumber
      });
      
      res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Mark invoice as paid error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
