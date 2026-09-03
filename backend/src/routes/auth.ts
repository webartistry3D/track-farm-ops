import { Router } from 'express';
import { signup, createUser, getUsers, getProfile, createTestUsers, deleteUser } from '../controllers/authController';
import { authenticate, AuthRequest } from '../middleware/auth';
import { passwordChangeRateLimiter, authRateLimiter } from '../middleware/rateLimiter';
import { logPasswordChange } from '../utils/auditLogger';
import { logSystemEvent } from '../utils/auditLogger';
import { uploadProfileImage, uploadProfileImageMiddleware } from './profileImage';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { generateToken } from '../utils/auth';
import PasswordValidator from '../utils/passwordValidation';
import { sendPasswordResetEmail } from '../utils/emailService';

const router = Router();

// Public routes
router.post('/login', authRateLimiter.middleware, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with organization
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: {
          select: { id: true, name: true }
        }
      }
    });

    if (!user) {
      await logSystemEvent({
        type: 'security',
        message: `Failed login attempt for email: ${email}`,
        severity: 'warning',
        action: 'failed_login',
        ip: req.ip || req.connection?.remoteAddress || 'unknown',
        metadata: { email },
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await logSystemEvent({
        type: 'security',
        message: `Failed login attempt for user: ${user.name} (${user.email})`,
        severity: 'warning',
        action: 'failed_login',
        ip: req.ip || req.connection?.remoteAddress || 'unknown',
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        metadata: { email },
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token using shared utility (ensures consistent secret)
    const token = generateToken(user);

    await logSystemEvent({
      type: 'auth',
      message: `User ${user.name} (${user.email}) logged in successfully`,
      severity: 'info',
      action: 'login',
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      resource: 'Authentication',
      metadata: { organizationId: user.organizationId },
    });

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
      token
    });

  } catch (error) {
    console.error('Login error:', (error as Error).message);
    res.status(500).json({ error: 'Internal server error' });
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

    await logSystemEvent({
      type: 'security',
      message: `New superuser account created: ${superuser.name} (${superuser.email})`,
      severity: 'critical',
      action: 'superuser_signup',
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userId: superuser.id,
      userName: superuser.name,
      userRole: superuser.role,
      resource: 'Authentication',
    });

    // Generate JWT token using shared utility (ensures consistent secret)
    const token = generateToken(superuser);

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

// Forgot password — generates reset token and emails the user
router.post('/forgot-password', authRateLimiter.middleware, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent user enumeration
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiry: expiry }
    });

    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (emailError) {
      console.error('Failed to send password reset email:', (emailError as Error).message);
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', (error as Error).message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password — validates token and sets new password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const passwordValidation = PasswordValidator.validate(newPassword, user.email);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        feedback: passwordValidation.feedback
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
        lastPasswordChange: new Date()
      }
    });

    res.json({ message: 'Password reset successfully. You can now log in.' });

  } catch (error) {
    console.error('Reset password error:', (error as Error).message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify email address via token from welcome email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or already used verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null }
    });

    res.json({ message: 'Email verified successfully. You can now log in.' });

  } catch (error) {
    console.error('Email verification error:', (error as Error).message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/signup', signup);

if (process.env.NODE_ENV !== 'production') {
  router.post('/setup-test-users', createTestUsers);
} else {
  router.post('/setup-test-users', (_req, res) => res.status(404).json({ error: 'Not found' }));
}

// Protected routes
router.get('/profile', authenticate, getProfile);
router.get('/users', authenticate, getUsers);
router.post('/users', authenticate, createUser);
router.delete('/users/:id', authenticate, deleteUser);

// Change password endpoint
router.post('/change-password', authenticate, passwordChangeRateLimiter.middleware, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const currentUser = req.user!;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
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
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    // Validate new password strength
    const passwordValidation = PasswordValidator.validate(newPassword, user.email);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'New password does not meet security requirements',
        feedback: passwordValidation.feedback,
        strength: passwordValidation.strength
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

// Profile update route
router.put('/profile', authenticate, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        phone: phone && phone.trim() ? phone.trim() : null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImageUrl: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message 
    });
  }
});

export default router;
