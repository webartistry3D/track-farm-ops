import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCameras,
  getCameraById,
  updateCameraStatus,
  createCamera,
  deleteCamera,
  getCameraSnapshot
} from '../controllers/cctvController';

const router = express.Router();

// Get all cameras
router.get('/cameras', authenticate, getCameras);

// Get specific camera by ID
router.get('/cameras/:id', authenticate, getCameraById);

// Create new camera
router.post('/cameras', authenticate, createCamera);

// Delete camera
router.delete('/cameras/:id', authenticate, deleteCamera);

// Update camera status (recording, etc.)
router.put('/cameras/:id/status', authenticate, updateCameraStatus);

// Get camera snapshot
router.get('/cameras/:id/snapshot', authenticate, getCameraSnapshot);

export default router;
