import { Router } from 'express';
import { signup, createUser, getUsers, getProfile, createTestUsers, deleteUser } from '../controllers/authController';
import { authenticate, AuthRequest } from '../middleware/auth';
import { passwordChangeRateLimiter } from '../middleware/rateLimiter';
import { logPasswordChange } from '../utils/auditLogger';
import { uploadProfileImage, uploadProfileImageMiddleware } from './profileImage';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import PasswordValidator from '../utils/passwordValidation';

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

// Change password endpoint
router.post('/change-password', authenticate, passwordChangeRateLimiter.middleware, async (req: AuthRequest, res) => {
  try {
    const startTime = Date.now();
    const requestId = `pwd_change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[${requestId}] Password change request started`);
    console.log(`[${requestId}] User ID: ${req.user?.id}`);
    console.log(`[${requestId}] Email: ${req.user?.email}`);
    console.log(`[${requestId}] IP: ${req.ip}`);

    const { currentPassword, newPassword } = req.body;
    const currentUser = req.user!;

    // Validate input
    if (!currentPassword || !newPassword) {
      console.log(`[${requestId}] Missing required fields`);
      return res.status(400).json({ 
        error: 'Current password and new password are required',
        requestId
      });
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      console.log(`[${requestId}] User not found`);
      return res.status(404).json({ 
        error: 'User not found',
        requestId
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      console.log(`[${requestId}] Invalid current password`);
      return res.status(400).json({ 
        error: 'Current password is incorrect',
        requestId
      });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      console.log(`[${requestId}] New password is same as current`);
      return res.status(400).json({ 
        error: 'New password must be different from current password',
        requestId
      });
    }

    // Validate new password strength
    const passwordValidation = PasswordValidator.validate(newPassword, user.email);
    if (!passwordValidation.isValid) {
      console.log(`[${requestId}] Password validation failed`);
      return res.status(400).json({ 
        error: 'New password does not meet security requirements',
        feedback: passwordValidation.feedback,
        strength: passwordValidation.strength,
        requestId
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    // Log the password change
    console.log(`[${requestId}] Password changed successfully for user ${user.email} (${user.name})`);
    console.log(`[${requestId}] Password strength: ${passwordValidation.strength}`);
    console.log(`[${requestId}] Processing time: ${Date.now() - startTime}ms`);

    // Log successful password change
    logPasswordChange(
      user.id,
      user.organizationId || 0,
      user.role,
      user.organization?.name || 'No Organization',
      true,
      passwordValidation.strength,
      undefined,
      req
    );

    res.json({
      message: 'Password changed successfully',
      requestId,
      strength: passwordValidation.strength,
      changedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Password change error:', error);
    
    // Log failed password change attempt
    const currentUser = req.user!;
    logPasswordChange(
      currentUser.id,
      currentUser.organizationId || 0,
      currentUser.role,
      'Unknown Organization',
      false,
      undefined,
      error instanceof Error ? error.message : 'Unknown error',
      req
    );
    
    res.status(500).json({ 
      error: 'Internal server error',
      requestId: req.body.requestId || 'unknown'
    });
  }
});

// Profile image upload route
router.post('/upload-profile-image', authenticate, uploadProfileImageMiddleware, uploadProfileImage);

export default router;
