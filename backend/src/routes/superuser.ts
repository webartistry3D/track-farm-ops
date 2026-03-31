import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { 
  getSystemStats, 
  getAllUsers, 
  getAllOrganizations, 
  toggleUserStatus, 
  deleteUserAccount 
} from '../controllers/superuserController';

const router = Router();

// All superuser routes require authentication and superuser role
router.use(authenticate);

// Superuser middleware to check role
router.use((req: AuthRequest, res, next) => {
  if (req.user?.role !== 'SUPERUSER') {
    return res.status(403).json({ error: 'Superuser access required' });
  }
  next();
});

// System statistics
router.get('/stats', getSystemStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId/status', toggleUserStatus);
router.delete('/users/:userId', deleteUserAccount);

// Organization management
router.get('/organizations', getAllOrganizations);

// System logs (placeholder for now)
router.get('/logs', (req: AuthRequest, res) => {
  res.json([
    {
      id: '1',
      type: 'security',
      message: 'Superuser login detected',
      timestamp: new Date().toISOString(),
      severity: 'info'
    },
    {
      id: '2',
      type: 'system',
      message: 'Database backup completed',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: 'success'
    }
  ]);
});

// System activity (placeholder for now)
router.get('/activity', (req: AuthRequest, res) => {
  res.json([
    {
      id: '1',
      action: 'user_created',
      description: 'New superuser account created',
      timestamp: new Date().toISOString(),
      userId: req.user?.id,
      userName: req.user?.name
    },
    {
      id: '2',
      action: 'user_login',
      description: 'Superuser dashboard accessed',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      userId: req.user?.id,
      userName: req.user?.name
    }
  ]);
});

export default router;
