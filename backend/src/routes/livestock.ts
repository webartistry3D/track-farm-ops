import { Router } from 'express';
import {
  getLivestock,
  createLivestock,
  updateLivestock,
  deleteLivestock,
  getHealthRecords,
  createHealthRecord,
  getVaccinations,
  createVaccination
} from '../controllers/livestockController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Livestock routes
router.get('/', getLivestock);
router.post('/', authorize(['OWNER', 'MANAGER', 'VETERINARIAN']), createLivestock);
router.put('/:id', authorize(['OWNER', 'MANAGER', 'VETERINARIAN']), updateLivestock);
router.delete('/:id', authorize(['OWNER', 'MANAGER']), deleteLivestock);

// Health records routes
router.get('/health-records', getHealthRecords);
router.post('/health-records', authorize(['OWNER', 'MANAGER', 'VETERINARIAN']), createHealthRecord);

// Vaccinations routes
router.get('/vaccinations', getVaccinations);
router.post('/vaccinations', authorize(['OWNER', 'MANAGER', 'VETERINARIAN']), createVaccination);

export default router;
