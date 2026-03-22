import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { buildRoleBasedWhereClause, canUserAccessRecord } from '../utils/roleAccess';

export const createIncomeEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      amount, 
      category, 
      paymentMethod, 
      date, 
      description,
      quantity,
      unitPrice,
      enableVAT,
      vatRate,
      vatAmount,
      subtotal
    } = req.body;

    console.log('📝 Creating income entry with data:', JSON.stringify(req.body, null, 2));

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
      console.log('⚠️ User not assigned to any organization - access denied for income entry creation');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`💰 Creating income entry for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    if (!amount || !category || !paymentMethod) {
      return res.status(400).json({ error: 'Amount, category, and payment method are required' });
    }

    // Get the user's full data to check createdBy
    const userWithCreatedBy = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { createdBy: true }
    });

    const incomeEntry = await prisma.incomeEntry.create({
      data: {
        amount: parseFloat(amount),
        category,
        paymentMethod,
        date: date ? new Date(date) : new Date(),
        description: description || null,
        quantity: quantity ? parseFloat(quantity) : null,
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        enableVAT: enableVAT !== undefined ? enableVAT : false,
        vatRate: vatRate ? parseFloat(vatRate) : 7.5,
        vatAmount: vatAmount ? parseFloat(vatAmount) : null,
        subtotal: subtotal ? parseFloat(subtotal) : null,
        userId: currentUser.id,
        organizationId: currentUserOrg.organizationId,
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

    console.log('✅ Income entry created successfully:', JSON.stringify(incomeEntry, null, 2));
    res.status(201).json(incomeEntry);
  } catch (error) {
    console.error('Create income entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getIncomeEntries = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, limit = 50, offset = 0 } = req.query;
    const currentUser = req.user!;

    console.log(`📄 FETCHING INCOME ENTRIES - NEW REQUEST`);
    console.log(`📄 User: ${currentUser.role} ${currentUser.name} (ID: ${currentUser.id})`);
    console.log(`🔍 DEBUG: Income query params:`, { startDate, endDate, limit, offset });
    console.log(`🔍 DEBUG: Request headers:`, req.headers);
    console.log(`🔍 DEBUG: Request URL:`, req.url);
    console.log(`🔍 DEBUG: Request method:`, req.method);
    
    // Completely disable all caching mechanisms
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    
    // Disable ETag generation
    res.removeHeader('ETag');
    res.set('ETag', 'disabled');
    
    // Always return 200 to prevent 304
    res.status(200);
    
    console.log('🔍 DEBUG: Cache headers set, proceeding with database query');

    // Get all income entries first, then filter based on access rights
    const allEntries = await prisma.incomeEntry.findMany({
      where: {
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdBy: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log(`🔍 DEBUG: Found ${allEntries.length} total income entries in database`);
    
    // Debug: Check for KEL-11116 entries in ALL entries
    const kel11116AllEntries = allEntries.filter(entry => 
      entry.description?.includes('KEL-11116')
    );
    
    if (kel11116AllEntries.length > 0) {
      console.log('🔍 DEBUG: ALL KEL-11116 entries in database:', kel11116AllEntries.map(entry => ({
        id: entry.id,
        description: entry.description,
        userId: entry.userId,
        userName: entry.user?.name,
        createdAt: entry.createdAt
      })));
    }

    // Filter entries based on user access rights
    const accessibleEntries = [];
    for (const entry of allEntries) {
      const hasAccess = await canUserAccessRecord(currentUser, entry.userId, entry.createdBy || undefined);
      if (hasAccess) {
        accessibleEntries.push(entry);
      }
    }

    console.log(`🔍 DEBUG: User ${currentUser.name} has access to ${accessibleEntries.length} entries`);
    
    // Debug: Check for KEL-11116 entries in ACCESSIBLE entries
    const kel11116AccessibleEntries = accessibleEntries.filter(entry => 
      entry.description?.includes('KEL-11116')
    );
    
    if (kel11116AccessibleEntries.length > 0) {
      console.log('🔍 DEBUG: ACCESSIBLE KEL-11116 entries:', kel11116AccessibleEntries.map(entry => ({
        id: entry.id,
        description: entry.description,
        userId: entry.userId,
        userName: entry.user?.name,
        createdAt: entry.createdAt
      })));
    }

    // Apply pagination
    const entries = accessibleEntries.slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    const totalCount = accessibleEntries.length;

    console.log('📊 Role-based Income Entries:', {
      count: entries.length,
      totalAccessible: totalCount,
      sampleEntry: entries[0],
      hasQuantity: entries[0]?.quantity !== null,
      hasDescription: entries[0]?.description !== null
    });
    
    // Debug: Check for KEL-11116 entries specifically
    const kel11116Entries = entries.filter(entry => 
      entry.description?.includes('KEL-11116')
    );
    
    if (kel11116Entries.length > 0) {
      console.log('🔍 DEBUG: FINAL KEL-11116 entries being sent to frontend:', kel11116Entries.map(entry => ({
        id: entry.id,
        description: entry.description,
        userId: entry.userId,
        userName: entry.user?.name,
        createdAt: entry.createdAt
      })));
    }

    // Disable caching to ensure fresh data
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    // Add timestamp to break browser cache
    const responseData = {
      entries,
      total: totalCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      _timestamp: Date.now() // Force cache invalidation
    };

    console.log('🔍 DEBUG: Sending response with', entries.length, 'entries');
    res.json(responseData);
  } catch (error) {
    console.error('Get income entries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createExpenseEntry = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📝 Creating expense entry with data:', JSON.stringify(req.body, null, 2));
    
    const { amount, category, note, date, merchant, hasReceipt, ocrConfidence, ocrSource } = req.body;

    if (!amount || !category) {
      console.log('❌ Validation failed: Missing amount or category');
      return res.status(400).json({ error: 'Amount and category are required' });
    }

    console.log('✅ Validation passed, creating expense entry...');
    
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
      console.log('⚠️ User not assigned to any organization - access denied for expense entry creation');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`💳 Creating expense entry for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);
    
    // Get the user's full data to check createdBy
    const userWithCreatedBy = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { createdBy: true }
    });

    const expenseData: any = {
      amount: parseFloat(amount),
      category,
      note: note || null,
      date: date ? new Date(date) : new Date(),
      userId: req.user!.id,
      organizationId: currentUserOrg.organizationId, // CRITICAL: Add organization ID
      merchant: merchant || 'Manual Entry',
      hasReceipt: hasReceipt || false,
      ocrConfidence: ocrConfidence ? parseInt(ocrConfidence) : null,
      ocrSource: ocrSource || null,
      createdBy: userWithCreatedBy?.createdBy || req.user!.id
    };

    const expenseEntry = await prisma.expenseEntry.create({
      data: expenseData,
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

    console.log('✅ Expense entry created successfully:', JSON.stringify(expenseEntry, null, 2));
    res.status(201).json(expenseEntry);
  } catch (error) {
    console.error('❌ Create expense entry error:', error);
    console.error('❌ Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      body: req.body
    });
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
};

export const getExpenseEntries = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, limit = 50, offset = 0 } = req.query;
    const currentUser = req.user!;

    console.log(`📄 Fetching expense entries for ${currentUser.role} ${currentUser.name} (ID: ${currentUser.id})`);

    // Get all expense entries first, then filter based on access rights
    const allEntries = await prisma.expenseEntry.findMany({
      where: {
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdBy: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Filter entries based on user access rights
    const accessibleEntries = [];
    for (const entry of allEntries) {
      const hasAccess = await canUserAccessRecord(currentUser, entry.userId, entry.createdBy || undefined);
      if (hasAccess) {
        accessibleEntries.push(entry);
      }
    }

    // Apply pagination
    const entries = accessibleEntries.slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    const totalCount = accessibleEntries.length;

    console.log('📊 Role-based Expense Entries:', {
      count: entries.length,
      total: totalCount
    });

    res.json({
      entries,
      total: totalCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Get expense entries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFinancialSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const currentUser = req.user!;

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    // Multi-tenant: Get user IDs that the current user should see WITHIN THEIR ORGANIZATION
    let userIds: number[];
    
    // Get current user's organization first
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
      console.log('⚠️ User not assigned to any organization - access denied for financial summary');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }
    
    console.log(`📊 Generating financial summary for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);
    
    if (currentUser.role === 'OWNER') {
      // Owners see data from themselves and all users they created WITHIN THEIR ORGANIZATION
      const users = await prisma.$queryRaw`
        SELECT id FROM users 
        WHERE (id = ${currentUser.id} OR created_by = ${currentUser.id})
        AND organization_id = ${currentUserOrg.organizationId}
      `;
      userIds = (users as any[]).map(u => u.id);
    } else {
      // Workers and managers see only their own data
      userIds = [currentUser.id];
    }

    const whereClause = {
      userId: { in: userIds },
      organizationId: currentUserOrg.organizationId, // CRITICAL: Add organization filter
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    };

    const totalIncome = await prisma.incomeEntry.aggregate({
      where: whereClause,
      _sum: { amount: true }
    });

    const totalExpenses = await prisma.expenseEntry.aggregate({
      where: whereClause,
      _sum: { amount: true }
    });

    const incomeByCategory = await prisma.incomeEntry.groupBy({
      by: ['category'],
      where: whereClause,
      _sum: { amount: true }
    });

    const expensesByCategory = await prisma.expenseEntry.groupBy({
      by: ['category'],
      where: whereClause,
      _sum: { amount: true }
    });

    const netProfit = Number(totalIncome._sum.amount || 0) - Number(totalExpenses._sum.amount || 0);

    res.json({
      totalIncome: Number(totalIncome._sum.amount || 0),
      totalExpenses: Number(totalExpenses._sum.amount || 0),
      netProfit,
      incomeByCategory: incomeByCategory.map((item: any) => ({
        category: item.category,
        amount: Number(item._sum.amount || 0)
      })),
      expensesByCategory: expensesByCategory.map((item: any) => ({
        category: item.category,
        amount: Number(item._sum.amount || 0)
      }))
    });
  } catch (error) {
    console.error('Get financial summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteIncomeEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    console.log(`🗑️ Deleting income entry ${id} by ${currentUser.role} ${currentUser.name}`);

    // Find the income entry with user details
    const incomeEntry = await prisma.incomeEntry.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            createdBy: true
          }
        }
      }
    });

    if (!incomeEntry) {
      return res.status(404).json({ error: 'Income entry not found' });
    }

    // Check if user has permission to delete this entry using the new access control
    const hasAccess = await canUserAccessRecord(currentUser, incomeEntry.userId, incomeEntry.user.createdBy || undefined);
    
    if (!hasAccess) {
      console.log(`🚫 Delete denied: ${currentUser.role} ${currentUser.name} cannot delete income entry belonging to ${incomeEntry.user.role} ${incomeEntry.user.name}`);
      return res.status(403).json({ error: 'Access denied: insufficient privileges to delete this income entry' });
    }

    console.log(`✅ Delete granted: ${currentUser.role} ${currentUser.name} deleting income entry of ${incomeEntry.user.role} ${incomeEntry.user.name}`);

    await prisma.incomeEntry.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ message: 'Income entry deleted successfully' });
  } catch (error) {
    console.error('Delete income entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteExpenseEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    console.log(`🗑️ Deleting expense entry ${id} by ${currentUser.role} ${currentUser.name}`);

    // Find the expense entry with user details
    const expenseEntry = await prisma.expenseEntry.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            createdBy: true
          }
        }
      }
    });

    if (!expenseEntry) {
      return res.status(404).json({ error: 'Expense entry not found' });
    }

    // Check if user has permission to delete this entry using the new access control
    const hasAccess = await canUserAccessRecord(currentUser, expenseEntry.userId, expenseEntry.user.createdBy || undefined);
    
    if (!hasAccess) {
      console.log(`🚫 Delete denied: ${currentUser.role} ${currentUser.name} cannot delete expense entry belonging to ${expenseEntry.user.role} ${expenseEntry.user.name}`);
      return res.status(403).json({ error: 'Access denied: insufficient privileges to delete this expense entry' });
    }

    console.log(`✅ Delete granted: ${currentUser.role} ${currentUser.name} deleting expense entry of ${expenseEntry.user.role} ${expenseEntry.user.name}`);

    await prisma.expenseEntry.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ message: 'Expense entry deleted successfully' });
  } catch (error) {
    console.error('Delete expense entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
