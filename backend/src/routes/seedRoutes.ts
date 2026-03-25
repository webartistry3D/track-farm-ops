import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
const { seedProduction } = require('../scripts/seed-production');

const router = Router();

// Seed production data (admin only)
router.post('/seed-production', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Only allow admin/owner users to seed data
    if (req.user?.role !== 'OWNER' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Forbidden: Only admin users can seed production data' 
      });
    }

    console.log('🌱 Manual production seeding triggered by admin user...');
    await seedProduction();
    
    res.json({ 
      message: 'Production seeding completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Manual production seeding failed:', error);
    res.status(500).json({ 
      error: 'Failed to seed production data',
      details: error.message 
    });
  }
});

export default router;
