import { Router } from 'express';
import { signup, createUser, getUsers, getProfile, createTestUsers, deleteUser } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const router = Router();

// Public routes
router.post('/login', async (req, res) => {
  try {
    const startTime = Date.now();
    const requestId = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(` [${requestId}] Login attempt started`);
    console.log(` [${requestId}] Email: ${req.body.email}`);
    console.log(` [${requestId}] IP: ${req.ip}`);
    console.log(` [${requestId}] User-Agent: ${req.headers['user-agent']}`);
    console.log(` [${requestId}] Request body keys:`, Object.keys(req.body));
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log(` [${requestId}] Missing credentials - Email: ${!!email}, Password: ${!!password}`);
      return res.status(400).json({ 
        error: 'Email and password are required',
        requestId,
        debug: {
          emailProvided: !!email,
          passwordProvided: !!password,
          requestBodyKeys: Object.keys(req.body)
        }
      });
    }

    console.log(` [${requestId}] Looking up user: ${email}`);
    
    // Find user with organization
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(` [${requestId}] User found: ${!!user}`);
    if (user) {
      console.log(` [${requestId}] User details:`, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        hasOrganization: !!user.organization,
        organizationName: user.organization?.name
      });
    }

    if (!user) {
      console.log(` [${requestId}] User not found: ${email}`);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        requestId,
        debug: {
          email,
          userFound: false,
          lookupTime: Date.now() - startTime
        }
      });
    }

    console.log(` [${requestId}] Comparing password for user: ${user.id}`);
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(` [${requestId}] Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log(` [${requestId}] Invalid password for user: ${email}`);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        requestId,
        debug: {
          email,
          userFound: true,
          passwordValid: false,
          lookupTime: Date.now() - startTime
        }
      });
    }

    console.log(` [${requestId}] Authentication successful for: ${user.name} (${user.role})`);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name,
        organizationId: user.organizationId
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    console.log(` [${requestId}] Token generated successfully`);

    const responseTime = Date.now() - startTime;
    console.log(` [${requestId}] Login completed in ${responseTime}ms`);

    // Return user data and token
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
        createdAt: user.createdAt
      },
      token,
      requestId,
      debug: {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    });

    console.log(` [${requestId}] Login response sent successfully`);

  } catch (error) {
    const requestId = req.body.email ? `error_${Date.now()}` : 'unknown';
    console.error(` [${requestId}] Login error:`, {
      error: (error as Error).message,
      stack: (error as Error).stack,
      email: req.body.email,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(500).json({ 
      error: 'Internal server error',
      requestId,
      debug: {
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Superuser signup - system administrator account creation
router.post('/superuser-signup', async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;

    // Validate admin key (this should be a secure environment variable in production)
    const SUPERUSER_ADMIN_KEY = process.env.SUPERUSER_ADMIN_KEY || 'trackfarmops-superuser-2024';
    
    if (!adminKey || adminKey !== SUPERUSER_ADMIN_KEY) {
      console.log(`🚫 Superuser signup failed: Invalid admin key for ${email}`);
      return res.status(403).json({ 
        error: 'Invalid admin key',
        code: 'INVALID_ADMIN_KEY'
      });
    }

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create superuser (no organization required)
    const superuser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'SUPERUSER'
        // No organizationId for superusers
      }
    });

    console.log(`✅ Superuser created: ${superuser.name} (${superuser.email})`);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: superuser.id, 
        email: superuser.email, 
        role: superuser.role,
        name: superuser.name,
        organizationId: null // Superusers don't have organizations
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Superuser account created successfully',
      user: {
        id: superuser.id,
        name: superuser.name,
        email: superuser.email,
        role: superuser.role,
        organizationId: null,
        organizationName: null,
        createdAt: superuser.createdAt
      },
      token
    });

  } catch (error) {
    console.error('Superuser signup error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

router.post('/signup', signup);
router.post('/setup-test-users', createTestUsers);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.get('/users', authenticate, getUsers);
router.post('/users', authenticate, createUser);
router.delete('/users/:id', authenticate, deleteUser);

export default router;
