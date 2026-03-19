import { Router } from 'express';
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetById
} from '../controllers/assetsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Asset routes
router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', authorize(['OWNER', 'MANAGER']), createAsset);
router.put('/:id', authorize(['OWNER', 'MANAGER']), updateAsset);
router.delete('/:id', authorize(['OWNER', 'MANAGER']), deleteAsset);

export default router;
