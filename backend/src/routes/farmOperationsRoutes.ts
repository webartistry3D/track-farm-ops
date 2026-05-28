import { Router } from 'express';
import {
  getPestControlData,
  getEquipmentStatusData,
  getFieldActivityData,
  getCropsData,
  getSoilMetricsData,
  getWeatherData,
  getIrrigationStatusData
} from '../controllers/farmOperationsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Pest Control endpoints
router.get('/pest-control', getPestControlData);

// Equipment Status endpoints
router.get('/equipment-status', getEquipmentStatusData);

// Field Activity endpoints
router.get('/field-activity', getFieldActivityData);

// Crops endpoints
router.get('/crops', getCropsData);

// Soil Metrics endpoints
router.get('/soil-metrics', getSoilMetricsData);

// Weather Data endpoints
router.get('/weather-data', getWeatherData);

// Irrigation Status endpoints
router.get('/irrigation-status', getIrrigationStatusData);

export default router;
