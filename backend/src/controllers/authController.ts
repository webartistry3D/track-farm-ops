import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateToken, hashPassword, comparePassword } from '../utils/auth';
import { AuthRequest, getReqBody } from '../middleware/auth';
import { autoSeedIfEmpty } from '../utils/autoSeeding';

export const signup = async (req: Request, res: Response) => {
  try {
    const body = getReqBody(req);
    const { name, email, password, role, farmName, farmType } = body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with OWNER role (only owners can create new accounts)
    const defaultRole = 'OWNER';
    
    let newUser;
    
    if (defaultRole === 'OWNER' && farmName) {
      // Create organization first for owners
      const organization = await prisma.organization.create({
        data: {
          name: farmName,
          description: `Organization for ${name}`
        }
      });
      
      // Create user linked to organization
      newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: defaultRole,
          organizationId: organization.id
        }
      });
      
      console.log(`✅ Created owner ${name} with organization: ${farmName} (Farm Type: ${farmType || 'Not specified'})`);
      
      // 🌾 SAFE AUTO-SEED NIGERIAN MIXED FARM PRESET ONLY FOR EMPTY ORGANIZATIONS
      const seedingSuccess = await autoSeedIfEmpty(organization.id, farmName);
      
      if (seedingSuccess) {
        console.log(`🎉 Successfully applied Nigerian Mixed Farm presets to ${farmName}`);
      } else {
        console.log(`📋 ${farmName} already has inventory or seeding failed - preserving existing data`);
      }
      
    } else {
      // Create user without organization (non-owners)
      newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: defaultRole
        }
      });
      
      console.log(`✅ Created user ${name} without organization`);
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Account created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  // 🚫 USER CREATION DISABLED - This endpoint can no longer create users
  console.log('❌ USER CREATION DISABLED - createUser endpoint blocked');
  return res.status(403).json({ 
    error: 'User creation has been permanently disabled for security reasons',
    code: 'USER_CREATION_DISABLED'
  });
  
  try {
    const body = getReqBody(req);
    const { name, email, password, role } = body;
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
      console.log('⚠️ User not assigned to any organization - access denied for user creation');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`👤 Creating user for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    // Only owners can create users
    if (currentUser.role !== 'OWNER') {
      console.log(`🚫 User creation denied: ${currentUser.role} ${currentUser.name} not authorized to create users`);
      return res.status(403).json({ error: 'Only owners can create users' });
    }

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate role
    if (!['OWNER', 'MANAGER', 'WORKER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists within the organization
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        organizationId: currentUserOrg.organizationId
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists in your organization' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with organization assignment
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as any, // Type assertion for UserRole enum
        organizationId: currentUserOrg.organizationId,
        createdBy: currentUser.id
      }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    console.log(`✅ User created successfully: ${newUser.name} (ID: ${newUser.id}) by ${currentUser.name} (ID: ${currentUser.id}) in organization ${currentUserOrg.organizationId}`);

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    const userIdToDelete = parseInt(Array.isArray(id) ? id[0] : id);

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
      console.log('⚠️ User not assigned to any organization - access denied for user deletion');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`🗑️ Deleting user ${userIdToDelete} for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    // Only owners can delete users
    if (currentUser.role !== 'OWNER') {
      console.log(`🚫 User deletion denied: ${currentUser.role} ${currentUser.name} not authorized to delete users`);
      return res.status(403).json({ error: 'Only owners can delete users' });
    }

    // Prevent self-deletion
    if (userIdToDelete === currentUser.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Check if user exists within the organization
    const userToDelete = await prisma.user.findFirst({
      where: { 
        id: userIdToDelete,
        organizationId: currentUserOrg.organizationId
      }
    });

    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found in your organization' });
    }

    // Check if user has associated records
    const [incomeCount, expenseCount, invoiceCount] = await Promise.all([
      prisma.incomeEntry.count({ where: { userId: userIdToDelete } }),
      prisma.expenseEntry.count({ where: { userId: userIdToDelete } }),
      prisma.invoice.count({ where: { userId: userIdToDelete } })
    ]);

    const totalRecords = incomeCount + expenseCount + invoiceCount;
    
    if (totalRecords > 0) {
      return res.status(400).json({ 
        error: `Cannot delete ${userToDelete.name} - user has ${totalRecords} associated records (${incomeCount} income, ${expenseCount} expenses, ${invoiceCount} invoices). Please delete records first.` 
      });
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userIdToDelete }
    });

    console.log(`✅ User ${userToDelete.name} (ID: ${userIdToDelete}) deleted by ${currentUser.name} (ID: ${currentUser.id}) in organization ${currentUserOrg.organizationId}`);
    
    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: userToDelete.id,
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
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
      console.log('⚠️ User not assigned to any organization - access denied for user listing');
      return res.status(403).json({ 
        error: 'Access denied. User must be assigned to an organization.',
        code: 'NO_ORGANIZATION'
      });
    }

    console.log(`👥 Fetching users for ${currentUser.role} ${currentUser.name} in organization ${currentUserOrg.organization?.name}`);

    // Only owners can view users
    if (currentUser.role !== 'OWNER') {
      console.log(`🚫 User listing denied: ${currentUser.role} ${currentUser.name} not authorized to view users`);
      return res.status(403).json({ error: 'Only owners can view users' });
    }

    // Get all users in the organization (multi-tenant isolation)
    const users = await prisma.user.findMany({
      where: {
        organizationId: currentUserOrg.organizationId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Retrieved ${users.length} users for organization ${currentUserOrg.organizationId}`);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Fetch fresh user data from database to ensure all fields are present
    const freshUserData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastPasswordChange: true,
        passwordChangeCount: true,
        requiresPasswordChange: true,
        profileImageUrl: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!freshUserData) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(freshUserData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTestUsers = async (req: Request, res: Response) => {
  // 🚫 USER CREATION DISABLED - This endpoint can no longer create users
  console.log('❌ USER CREATION DISABLED - createTestUsers endpoint blocked');
  return res.status(403).json({ 
    error: 'User creation has been permanently disabled for security reasons',
    code: 'USER_CREATION_DISABLED'
  });
  
  try {
    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@trackfarmops.com' },
      update: {},
      create: {
        name: 'Farm Owner',
        email: 'admin@trackfarmops.com',
        password: adminPassword,
        role: 'OWNER'
      }
    });

    // Create worker user
    const workerPassword = await hashPassword('worker123');
    const workerUser = await prisma.user.upsert({
      where: { email: 'worker@trackfarmops.com' },
      update: {},
      create: {
        name: 'Farm Worker',
        email: 'worker@trackfarmops.com',
        password: workerPassword,
        role: 'WORKER'
      }
    });

    res.json({
      message: 'Test users created successfully',
      users: [
        { email: adminUser.email, password: 'admin123', role: adminUser.role },
        { email: workerUser.email, password: 'worker123', role: workerUser.role }
      ]
    });
  } catch (error) {
    console.error('Create test users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
