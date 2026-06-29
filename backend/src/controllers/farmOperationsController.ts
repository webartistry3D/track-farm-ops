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

    // Weather data model not yet implemented in schema — return placeholder
    const weatherData = {
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      rainfall: 0,
      forecast: 'Weather integration not available',
      lastUpdated: new Date().toISOString()
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

export {
  getPestControlData,
  getEquipmentStatusData,
  getFieldActivityData,
  getCropsData,
  getSoilMetricsData,
  getWeatherData,
  getIrrigationStatusData
};
