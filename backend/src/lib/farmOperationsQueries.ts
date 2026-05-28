// Production-grade farm operations database queries
// Using raw SQL for reliability and performance

export const FARM_OPERATIONS_QUERIES = {
  // Pest Control Queries
  PEST_CONTROL: {
    LATEST: `
      SELECT threat_level, next_spray, treatment_efficacy, last_check 
      FROM pest_control 
      WHERE organization_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `,
    ACTIVE_TREATMENTS: `
      SELECT COUNT(*) as count
      FROM pest_control 
      WHERE organization_id = $1 
      AND application_date >= NOW() - INTERVAL '30 days'
    `
  },

  // Equipment Status Queries
  EQUIPMENT: {
    ALL: `
      SELECT status, utilization, next_service 
      FROM equipment 
      WHERE organization_id = $1
    `
  },

  // Field Activity Queries
  FIELD_ACTIVITY: {
    TODAY: `
      SELECT status, tasks_completed, tasks_total 
      FROM field_activity 
      WHERE organization_id = $1 
      AND DATE(start_time) = CURRENT_DATE
    `,
    YESTERDAY: `
      SELECT status 
      FROM field_activity 
      WHERE organization_id = $1 
      AND DATE(start_time) = CURRENT_DATE - INTERVAL '1 day'
    `
  },

  // Crops Queries
  CROPS: {
    ALL: `
      SELECT id, name, planting_date, expected_harvest, zone_assignment, notes, status, health, created_at, updated_at
      FROM crops 
      WHERE organization_id = $1 
      ORDER BY created_at DESC
    `
  },

  // Soil Analysis Queries
  SOIL_ANALYSIS: {
    LATEST: `
      SELECT moisture_level, ph_level, nitrogen_level, phosphorus_level, potassium_level, zone, treatment_type, created_at
      FROM soil_analysis 
      WHERE organization_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `
  },

  // Weather Data Queries
  WEATHER: {
    LATEST: `
      SELECT temperature, humidity, wind_speed, rainfall, forecast, created_at
      FROM weather_data 
      WHERE organization_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `
  },

  // Irrigation Status Queries
  IRRIGATION: {
    LATEST: `
      SELECT active_zones, total_zones, water_usage_today, next_schedule, efficiency, created_at
      FROM irrigation_status 
      WHERE organization_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `
  }
};

// Helper functions for data transformation
export const transformData = {
  pestControl: (result: any[]) => ({
    threatLevel: result[0]?.threat_level || 'LOW',
    activeTreatments: Number(result[0]?.count) || 0,
    nextSpray: result[0]?.next_spray ? 
      new Date(result[0].next_spray).toLocaleDateString() : 'No scheduled spray',
    treatmentEfficacy: Number(result[0]?.treatment_efficacy) || 0,
    lastCheck: result[0]?.last_check || new Date().toISOString()
  }),

  equipment: (result: any[]) => {
    const equipment = result || [];
    const operationalCount = equipment.filter(eq => eq.status === 'OPERATIONAL').length;
    const maintenanceCount = equipment.filter(eq => eq.status === 'MAINTENANCE' || eq.status === 'REPAIR').length;
    const totalCount = equipment.length;
    const avgUtilization = totalCount > 0 
      ? Math.round(equipment.reduce((sum, eq) => sum + Number(eq.utilization), 0) / totalCount)
      : 0;
    
    const nextServiceDates = equipment
      .filter(eq => eq.next_service)
      .map(eq => new Date(eq.next_service))
      .sort((a, b) => a.getTime() - b.getTime()) || [];
    
    const nextService = nextServiceDates.length > 0 
      ? `In ${Math.ceil((nextServiceDates[0].getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
      : 'No scheduled service';

    return {
      operational: operationalCount,
      total: totalCount,
      maintenance: maintenanceCount,
      utilization: avgUtilization,
      nextService: nextService,
      lastUpdated: new Date().toISOString()
    };
  },

  fieldActivity: (todayResult: any[], yesterdayResult: any[]) => {
    const todayActivities = todayResult || [];
    const yesterdayActivities = yesterdayResult || [];

    const activeWorkers = todayActivities.filter(a => a.status === 'IN_PROGRESS').length;
    const tasksCompleted = todayActivities.filter(a => a.status === 'COMPLETED').length;
    const tasksTotal = todayActivities.length;

    const efficiencyPercentage = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
    let efficiency = 'LOW';
    if (efficiencyPercentage >= 80) efficiency = 'HIGH';
    else if (efficiencyPercentage >= 50) efficiency = 'MEDIUM';

    const yesterdayCompleted = yesterdayActivities.filter(a => a.status === 'COMPLETED').length;
    const productivityChange = yesterdayCompleted > 0 ? 
      ((tasksCompleted - yesterdayCompleted) / yesterdayCompleted) * 100 : 0;

    return {
      activeWorkers,
      tasksCompleted,
      tasksTotal,
      efficiency,
      productivity: productivityChange >= 0 ? `+${Math.round(productivityChange)}%` : `${Math.round(productivityChange)}%`,
      lastUpdated: new Date().toISOString()
    };
  },

  soilAnalysis: (result: any[]) => ({
    moistureLevel: Number(result[0]?.moisture_level) || 0,
    phLevel: Number(result[0]?.ph_level) || 0,
    nitrogenLevel: Number(result[0]?.nitrogen_level) || 0,
    phosphorusLevel: Number(result[0]?.phosphorus_level) || 0,
    potassiumLevel: Number(result[0]?.potassium_level) || 0,
    zone: result[0]?.zone || 'No data',
    lastTested: result[0]?.created_at || new Date().toISOString(),
    recommendations: result[0]?.treatment_type || 'No recommendations'
  }),

  weather: (result: any[]) => ({
    temperature: Number(result[0]?.temperature) || 0,
    humidity: Number(result[0]?.humidity) || 0,
    windSpeed: Number(result[0]?.wind_speed) || 0,
    rainfall: Number(result[0]?.rainfall) || 0,
    forecast: result[0]?.forecast || 'No data',
    lastUpdated: result[0]?.created_at || new Date().toISOString()
  }),

  irrigation: (result: any[]) => ({
    activeZones: Number(result[0]?.active_zones) || 0,
    totalZones: Number(result[0]?.total_zones) || 0,
    waterUsageToday: Number(result[0]?.water_usage_today) || 0,
    nextSchedule: result[0]?.next_schedule ? 
      new Date(result[0].next_schedule).toLocaleString() : 'No schedule',
    efficiency: Number(result[0]?.efficiency) || 0,
    lastUpdated: result[0]?.created_at || new Date().toISOString()
  })
};
