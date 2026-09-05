import { Router } from 'express';
import {
  getPestControlData,
  getEquipmentStatusData,
  getFieldActivityData,
  getCropsData,
  getSoilMetricsData,
  getWeatherData,
  getIrrigationStatusData,
  createCrop,
  createSoilAnalysis,
  createIrrigationSchedule,
  createPestControl,
  createEquipmentStatus,
  createFieldActivity
} from '../controllers/farmOperationsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Pest Control endpoints
router.get('/pest-control', getPestControlData);
router.post('/pest-control', createPestControl);

// Equipment Status endpoints
router.get('/equipment-status', getEquipmentStatusData);
router.post('/equipment-status', createEquipmentStatus);

// Field Activity endpoints
router.get('/field-activity', getFieldActivityData);
router.post('/field-activity', createFieldActivity);

// Crops endpoints
router.get('/crops', getCropsData);
router.post('/crops', createCrop);

// Soil Metrics endpoints
router.get('/soil-metrics', getSoilMetricsData);
router.post('/soil-metrics', createSoilAnalysis);

// Weather Data endpoints
router.get('/weather-data', getWeatherData);

// Irrigation Status endpoints
router.get('/irrigation-status', getIrrigationStatusData);
router.post('/irrigation-status', createIrrigationSchedule);

export default router;
