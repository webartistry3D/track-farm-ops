import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const getPestControlData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required'
      });
    }

    // Get latest pest control data for the organization
    const latestPestControl = await prisma.pestControl.findFirst({
      where: {
        organizationId: organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Count active treatments
    const activeTreatmentsCount = await prisma.pestControl.count({
      where: {
        organizationId: organizationId,
        applicationDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    const pestControlData = {
      threatLevel: latestPestControl?.threatLevel || 'LOW',
      activeTreatments: activeTreatmentsCount,
      nextSpray: latestPestControl?.nextSpray ? 
        new Date(latestPestControl.nextSpray).toLocaleDateString() : 'No scheduled spray',
      treatmentEfficacy: latestPestControl?.treatmentEfficacy || 0,
      lastCheck: latestPestControl?.lastCheck || new Date().toISOString()
    };

    res.json({
      success: true,
      pestControlData
    });
  } catch (error) {
    console.error('Error fetching pest control data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pest control data'
    });
  }
};

const getEquipmentStatusData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required'
      });
    }

    // Get all equipment status records for the organization
    const equipment = await prisma.equipmentStatus.findMany({
      where: {
        organizationId: organizationId
      }
    });

    const operationalCount = equipment.filter(eq => eq.status === 'OPERATIONAL').length;
    const MAINTENANCECount = equipment.filter(eq => eq.status === 'MAINTENANCE' || eq.status === 'REPAIR').length;
    const totalCount = equipment.length;
    const avgutilization = totalCount > 0 ? Math.round((operationalCount / totalCount) * 100) : 0;

    const nextServiceDates = equipment
      .filter(eq => eq.nextMaintenance)
      .map(eq => new Date(eq.nextMaintenance!))
      .sort((a, b) => a.getTime() - b.getTime());
    
    const nextService = nextServiceDates.length > 0 
      ? `In ${Math.ceil((nextServiceDates[0].getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
      : 'No scheduled service';

    const equipmentStatusData = {
      operational: operationalCount,
      total: totalCount,
      MAINTENANCE: MAINTENANCECount,
      utilization: avgutilization,
      nextService: nextService,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      equipmentStatusData
    });
  } catch (error) {
    console.error('Error fetching equipment status data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch equipment status data'
    });
  }
};

const getFieldActivityData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's field activities
    const todayActivities = await prisma.fieldActivity.findMany({
      where: {
        organizationId: organizationId,
        startTime: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get yesterday's activities for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayActivities = await prisma.fieldActivity.findMany({
      where: {
        organizationId: organizationId,
        startTime: {
          gte: yesterday,
          lt: today
        }
      }
    });

    const activeWorkers = todayActivities.filter(a => a.status === 'IN_PROGRESS').length;
    const tasksCompleted = todayActivities.filter(a => a.status === 'COMPLETED').length;
    const tasksTotal = todayActivities.length;

    const efficiencyPercentage = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
    let efficiency = 'LOW';
    if (efficiencyPercentage >= 80) efficiency = 'HIGH';
    else if (efficiencyPercentage >= 50) efficiency = 'MEDIUM';

    const yesterdayCompleted = yesterdayActivities.filter(a => a.status === 'COMPLETED').length;
    const productivityChange = yesterdayCompleted > 0 ? ((tasksCompleted - yesterdayCompleted) / yesterdayCompleted) * 100 : 0;

    const fieldActivityData = {
      activeWorkers,
      tasksCompleted,
      tasksTotal,
      efficiency,
      productivity: productivityChange >= 0 ? `+${Math.round(productivityChange)}%` : `${Math.round(productivityChange)}%`,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      fieldActivityData
    });
  } catch (error) {
    console.error('Error fetching field activity data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch field activity data'
    });
  }
};

const getCropsData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required'
      });
    }

    const crops = await prisma.crop.findMany({
      where: {
        organizationId: organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      crops
    });
  } catch (error) {
    console.error('Error fetching crops data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crops data'
    });
  }
};

const getSoilMetricsData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    console.log('🧪 Soil metrics request - orgId:', organizationId);

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required'
      });
    }

    const latestSoilAnalysis = await prisma.soilAnalysis.findFirst({
      where: {
        organizationId: organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('🧪 Soil analysis result:', latestSoilAnalysis);

    const soilData = {
      moistureLevel: latestSoilAnalysis?.moistureLevel || 0,
      phLevel: latestSoilAnalysis?.phLevel || 0,
      nitrogenLevel: latestSoilAnalysis?.nitrogenLevel || 0,
      phosphorusLevel: latestSoilAnalysis?.phosphorusLevel || 0,
      potassiumLevel: latestSoilAnalysis?.potassiumLevel || 0,
      zone: latestSoilAnalysis?.zone || 'No data',
      lastTested: latestSoilAnalysis?.createdAt?.toISOString() || new Date().toISOString(),
      recommendations: latestSoilAnalysis?.treatmentType || 'No recommendations'
    };

    res.json({
      success: true,
      soilData
    });
  } catch (error) {
    console.error('Error fetching soil metrics data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch soil metrics data'
    });
  }
};

const getWeatherData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required'
      });
    }

    const latestWeather = await prisma.weatherData.findFirst({
      where: {
        organizationId: organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const weatherData = {
      temperature: latestWeather?.temperature || 0,
      humidity: latestWeather?.humidity || 0,
      windSpeed: latestWeather?.windSpeed || 0,
      rainfall: latestWeather?.rainfall || 0,
      forecast: latestWeather?.forecast || 'No data',
      lastUpdated: latestWeather?.createdAt?.toISOString() || new Date().toISOString()
    };

    res.json({
      success: true,
      weatherData
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data'
    });
  }
};

const getIrrigationStatusData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required'
      });
    }

    const latestIrrigationSchedule = await prisma.irrigationSchedule.findFirst({
      where: {
        organizationId: organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const irrigationData = {
      zone: latestIrrigationSchedule?.zone || 'No data',
      duration: latestIrrigationSchedule?.duration || 0,
      waterAmount: latestIrrigationSchedule?.waterAmount || 0,
      efficiency: 0,
      nextSchedule: latestIrrigationSchedule?.nextRun ? 
        new Date(latestIrrigationSchedule.nextRun).toLocaleString() : 'No schedule',
      lastUpdated: latestIrrigationSchedule?.updatedAt?.toISOString() || new Date().toISOString()
    };

    res.json({
      success: true,
      irrigationData
    });
  } catch (error) {
    console.error('Error fetching irrigation status data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch irrigation status data'
    });
  }
};

// ============ POST CONTROLLERS ============

const createCrop = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({ success: false, error: 'Organization ID is required' });
    }

    const { name, variety, plantingDate, expectedHarvest, zoneAssignment, notes } = req.body;

    if (!name || !plantingDate || !expectedHarvest || !zoneAssignment) {
      return res.status(400).json({ success: false, error: 'Missing required fields: name, plantingDate, expectedHarvest, zoneAssignment' });
    }

    const crop = await prisma.crop.create({
      data: {
        name,
        variety: variety || null,
        plantingDate: new Date(plantingDate),
        expectedHarvest: new Date(expectedHarvest),
        zone: zoneAssignment,
        notes: notes || null,
        organizationId
      }
    });

    res.status(201).json({ success: true, data: crop });
  } catch (error) {
    console.error('Error creating crop:', error);
    res.status(500).json({ success: false, error: 'Failed to create crop' });
  }
};

const createSoilAnalysis = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({ success: false, error: 'Organization ID is required' });
    }

    const { moistureLevel, phLevel, nitrogenLevel, phosphorusLevel, potassiumLevel, zone, treatmentType, treatmentDate } = req.body;

    if (moistureLevel === undefined || phLevel === undefined || nitrogenLevel === undefined || phosphorusLevel === undefined || potassiumLevel === undefined || !zone) {
      return res.status(400).json({ success: false, error: 'Missing required fields: moistureLevel, phLevel, nitrogenLevel, phosphorusLevel, potassiumLevel, zone' });
    }

    const soilAnalysis = await prisma.soilAnalysis.create({
      data: {
        zone,
        sampleDate: new Date(),
        moistureLevel: parseFloat(moistureLevel),
        phLevel: parseFloat(phLevel),
        nitrogenLevel: parseFloat(nitrogenLevel),
        phosphorusLevel: parseFloat(phosphorusLevel),
        potassiumLevel: parseFloat(potassiumLevel),
        organicMatter: 0,
        treatmentType: treatmentType || null,
        treatmentDate: treatmentDate ? new Date(treatmentDate) : null,
        organizationId
      }
    });

    res.status(201).json({ success: true, data: soilAnalysis });
  } catch (error) {
    console.error('Error creating soil analysis:', error);
    res.status(500).json({ success: false, error: 'Failed to create soil analysis' });
  }
};

const createIrrigationSchedule = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({ success: false, error: 'Organization ID is required' });
    }

    const { zone, duration, startTime, waterAmount, frequency } = req.body;

    if (!zone || duration === undefined || !startTime || waterAmount === undefined || !frequency) {
      return res.status(400).json({ success: false, error: 'Missing required fields: zone, duration, startTime, waterAmount, frequency' });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + parseFloat(duration) * 60000);

    const irrigationSchedule = await prisma.irrigationSchedule.create({
      data: {
        zone,
        startTime: start,
        endTime: end,
        duration: parseFloat(duration),
        waterAmount: parseFloat(waterAmount),
        frequency,
        nextRun: start,
        organizationId
      }
    });

    res.status(201).json({ success: true, data: irrigationSchedule });
  } catch (error) {
    console.error('Error creating irrigation schedule:', error);
    res.status(500).json({ success: false, error: 'Failed to create irrigation schedule' });
  }
};

const createPestControl = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({ success: false, error: 'Organization ID is required' });
    }

    const { pestType, severity, treatmentMethod, applicationDate, followUpDate, notes } = req.body;

    if (!pestType || !severity || !treatmentMethod || !applicationDate || !followUpDate) {
      return res.status(400).json({ success: false, error: 'Missing required fields: pestType, severity, treatmentMethod, applicationDate, followUpDate' });
    }

    const pestControl = await prisma.pestControl.create({
      data: {
        pestType,
        severity,
        treatmentMethod,
        applicationDate: new Date(applicationDate),
        followUpDate: new Date(followUpDate),
        nextSpray: new Date(followUpDate),
        notes: notes || null,
        organizationId
      }
    });

    res.status(201).json({ success: true, data: pestControl });
  } catch (error) {
    console.error('Error creating pest control record:', error);
    res.status(500).json({ success: false, error: 'Failed to create pest control record' });
  }
};

const createEquipmentStatus = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({ success: false, error: 'Organization ID is required' });
    }

    const { equipmentName, maintenanceType, scheduledDate, estimatedCost, technician, notes } = req.body;

    if (!equipmentName || !maintenanceType || !scheduledDate) {
      return res.status(400).json({ success: false, error: 'Missing required fields: equipmentName, maintenanceType, scheduledDate' });
    }

    const equipmentStatus = await prisma.equipmentStatus.create({
      data: {
        equipmentId: 0,
        name: equipmentName,
        type: maintenanceType,
        status: 'MAINTENANCE' as const,
        nextMaintenance: new Date(scheduledDate),
        assignedWorker: technician || null,
        condition: notes || 'scheduled maintenance',
        organizationId
      }
    });

    res.status(201).json({ success: true, data: equipmentStatus });
  } catch (error) {
    console.error('Error creating equipment status record:', error);
    res.status(500).json({ success: false, error: 'Failed to create equipment status record' });
  }
};

const createFieldActivity = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({ success: false, error: 'Organization ID is required' });
    }

    const { workerName, assignedTask, startTime, estimatedDuration, priority, notes } = req.body;

    if (!workerName || !assignedTask || !startTime) {
      return res.status(400).json({ success: false, error: 'Missing required fields: workerName, assignedTask, startTime' });
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const priorityValue = validPriorities.includes(priority) ? priority : 'MEDIUM';

    const fieldActivity = await prisma.fieldActivity.create({
      data: {
        workerName,
        task: assignedTask,
        startTime: new Date(startTime),
        duration: estimatedDuration ? parseFloat(estimatedDuration) : null,
        priority: priorityValue as any,
        notes: notes || null,
        organizationId
      }
    });

    res.status(201).json({ success: true, data: fieldActivity });
  } catch (error) {
    console.error('Error creating field activity record:', error);
    res.status(500).json({ success: false, error: 'Failed to create field activity record' });
  }
};

export {
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
};
