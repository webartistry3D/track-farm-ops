import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { buildRoleBasedWhereClause, canUserAccessRecord } from '../utils/roleAccess';
import { NotificationService } from '../services/notificationService';
import { notificationSSE } from '../services/notificationSSE';

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
        vatAmount: vatAmount ? parseFloat(vatAmount) : (enableVAT ? (parseFloat(amount) * (vatRate ? parseFloat(vatRate) : 7.5)) / 100 : null),
        subtotal: subtotal ? parseFloat(subtotal) : (enableVAT ? (parseFloat(amount) / (1 + (vatRate ? parseFloat(vatRate) : 7.5) / 100)) : null),
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

    // Create and send notification for new income
    try {
      const notification = await NotificationService.notifyIncomeRecorded(
        currentUser.id,
        currentUserOrg.organizationId,
        parseFloat(amount),
        category
      );

      // Send real-time notification via SSE
      notificationSSE.sendToUser(currentUser.id, currentUserOrg.organizationId, notification);
      
      console.log('🔔 Income notification created and sent:', notification.id);
    } catch (notificationError) {
      console.error('❌ Failed to create income notification:', notificationError);
      // Don't fail the request if notification fails
    }

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
    console.error('Get VAT records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFinancialSummary = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🚀 getFinancialSummary API called');
    console.log('👤 Request user:', req.user);
    console.log('📅 Query params:', req.query);
    
    const { startDate, endDate } = req.query;
    const currentUser = req.user!;

    console.log(`📊 Processing request for user ${currentUser.id}, role: ${currentUser.role}`);
    console.log(`📊 Date range: ${startDate} to ${endDate}`);

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      // Set endDate to end of the day (23:59:59.999)
      const endOfDay = new Date(endDate as string);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.lte = new Date(endOfDay); // Convert back to Date object
    }

    console.log(`🔍 Final date filter:`, dateFilter);

    // Multi-tenant: Get user IDs that the current user should see WITHIN THEIR ORGANIZATION
    let userIds: number[];
    
    // Get current user's organization first
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: { select: { name: true } }
      }
    });

    console.log(`🏢 User organization:`, currentUserOrg);

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

    console.log(`👥 User IDs to include:`, userIds);

    const whereClause = {
      userId: { in: userIds },
      organizationId: currentUserOrg.organizationId, // CRITICAL: Add organization filter
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    };

    console.log(`🔍 Final where clause:`, whereClause);

    // Get income entries
    const incomeEntries = await prisma.incomeEntry.findMany({
      where: whereClause,
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

    // Get expense entries
    const expenseEntries = await prisma.expenseEntry.findMany({
      where: whereClause,
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

    console.log(`📊 Found entries:`, {
      incomeCount: incomeEntries.length,
      expenseCount: expenseEntries.length
    });

    // Calculate totals
    const totalIncome = incomeEntries.reduce((sum, entry) => sum + parseFloat(entry.amount.toString()), 0);
    const totalExpenses = expenseEntries.reduce((sum, entry) => sum + parseFloat(entry.amount.toString()), 0);
    const netProfit = totalIncome - totalExpenses;

    console.log(`💰 Financial summary:`, {
      totalIncome,
      totalExpenses,
      netProfit,
      incomeCount: incomeEntries.length,
      expenseCount: expenseEntries.length
    });

    res.json({
      totalIncome,
      totalExpenses,
      netProfit,
      incomeCount: incomeEntries.length,
      expenseCount: expenseEntries.length
    });
  } catch (error) {
    console.error('Get financial summary error:', error);
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

    // Create and send notification for new expense
    try {
      const notification = await NotificationService.notifyExpenseRecorded(
        currentUser.id,
        currentUserOrg.organizationId,
        parseFloat(amount),
        category
      );

      // Send real-time notification via SSE
      notificationSSE.sendToUser(currentUser.id, currentUserOrg.organizationId, notification);
      
      console.log('🔔 Expense notification created and sent:', notification.id);
    } catch (notificationError) {
      console.error('❌ Failed to create expense notification:', notificationError);
      // Don't fail the request if notification fails
    }

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

export const getVATRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, limit = 50, offset = 0 } = req.query;
    const currentUser = req.user!;

    console.log(`📄 Fetching VAT records for ${currentUser.role} ${currentUser.name} (ID: ${currentUser.id})`);
    console.log(`🔍 DEBUG: VAT API called with:`, { startDate, endDate, limit, offset });
    console.log(`🔍 DEBUG: Parsed date ranges:`, {
      startDateObj: startDate ? new Date(startDate as string) : null,
      endDateObj: endDate ? new Date(endDate as string) : null,
      startDateUTC: startDate ? new Date(startDate as string).toUTCString() : null,
      endDateUTC: endDate ? new Date(endDate as string).toUTCString() : null
    });

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
    const allIncomeEntries = await prisma.incomeEntry.findMany({
      where: {
        // If startDate and endDate are provided, filter by date range
        // If they're empty strings (allTime), don't filter by date
        ...(startDate && endDate && startDate !== '' && endDate !== '' && {
          date: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string + 'T23:59:59.999Z') // Include full end day
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

    // Get all expense entries first, then filter based on access rights
    const allExpenseEntries = await prisma.expenseEntry.findMany({
      where: {
        // If startDate and endDate are provided, filter by date range
        // If they're empty strings (allTime), don't filter by date
        ...(startDate && endDate && startDate !== '' && endDate !== '' && {
          date: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string + 'T23:59:59.999Z') // Include full end day
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

    console.log(`🔍 DEBUG: Found ${allIncomeEntries.length} income entries and ${allExpenseEntries.length} expense entries in database`);

    // Filter entries based on user access rights
    const accessibleIncomeEntries = [];
    const accessibleExpenseEntries = [];

    for (const entry of allIncomeEntries) {
      const hasAccess = await canUserAccessRecord(currentUser, entry.userId, entry.createdBy || undefined);
      if (hasAccess) {
        accessibleIncomeEntries.push(entry);
      }
    }

    for (const entry of allExpenseEntries) {
      const hasAccess = await canUserAccessRecord(currentUser, entry.userId, entry.createdBy || undefined);
      if (hasAccess) {
        accessibleExpenseEntries.push(entry);
      }
    }

    console.log(`🔍 DEBUG: User ${currentUser.name} has access to ${accessibleIncomeEntries.length} income entries and ${accessibleExpenseEntries.length} expense entries`);

    // Debug: Log ALL income entries before VAT filtering
    console.log('🔍 DEBUG: ALL income entries before VAT filter:', accessibleIncomeEntries.map(e => ({
      id: e.id,
      date: e.date,
      enableVAT: e.enableVAT,
      vatAmount: e.vatAmount,
      amount: e.amount,
      description: e.description?.substring(0, 50) + '...'
    })));

    // Combine all entries for VAT calculation
    const allEntries = [...accessibleIncomeEntries, ...accessibleExpenseEntries];

    console.log(`🔍 DEBUG: All entries before VAT filter:`, {
      totalEntries: allEntries.length,
      incomeEntries: accessibleIncomeEntries.length,
      expenseEntries: accessibleExpenseEntries.length,
      sampleIncome: accessibleIncomeEntries.slice(0, 3).map(e => ({
        id: e.id,
        date: e.date,
        enableVAT: e.enableVAT,
        vatAmount: e.vatAmount,
        amount: e.amount,
        description: e.description?.substring(0, 60) + '...'
      })),
      sampleExpense: accessibleExpenseEntries.slice(0, 2).map(e => ({
        id: e.id,
        date: e.date,
        enableVAT: e.enableVAT,
        vatAmount: e.vatAmount,
        amount: e.amount,
        description: e.description?.substring(0, 60) + '...'
      }))
    });

    // Return all entries (like Income Records API) - frontend will handle VAT filtering
    const paginatedRecords = allEntries.slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    const totalCount = allEntries.length;

    console.log('📊 VAT Records (All Entries):', {
      count: paginatedRecords.length,
      total: totalCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      records: paginatedRecords,
      total: totalCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Get VAT records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
