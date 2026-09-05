# Farm Operations Analytics — Execution Plan

## Overview

Wire up the Farm Operations Analytics section on the Analytics page to display real data from the backend, and enable form submissions for creating new records.

---

## Phase 1: Backend — Add POST Routes & Controllers

### 1.1 Add POST endpoints to `farmOperationsRoutes.ts`

File: `backend/src/routes/farmOperationsRoutes.ts`

Add the following routes:

```ts
router.post('/crops', createCrop);
router.post('/soil-metrics', createSoilAnalysis);
router.post('/irrigation-status', createIrrigationSchedule);
router.post('/pest-control', createPestControl);
router.post('/equipment-status', createEquipmentStatus);
router.post('/field-activity', createFieldActivity);
```

### 1.2 Add POST controllers to `farmOperationsController.ts`

File: `backend/src/controllers/farmOperationsController.ts`

Implement 6 new controller functions:

- **`createCrop`** — Accept `{ name, variety, plantingDate, expectedHarvest, zoneAssignment, notes }`, create `prisma.crop.create()` with `organizationId` from auth
- **`createSoilAnalysis`** — Accept `{ moistureLevel, phLevel, nitrogenLevel, phosphorusLevel, potassiumLevel, zone, treatmentType, treatmentDate }`, create `prisma.soilAnalysis.create()`
- **`createIrrigationSchedule`** — Accept `{ zone, duration, startTime, waterAmount, frequency }`, create `prisma.irrigationSchedule.create()`
- **`createPestControl`** — Accept `{ pestType, severity, treatmentMethod, applicationDate, followUpDate, notes }`, create `prisma.pestControl.create()`
- **`createEquipmentStatus`** — Accept `{ equipmentName, maintenanceType, scheduledDate, estimatedCost, technician, notes }`, create `prisma.equipmentStatus.create()`
- **`createFieldActivity`** — Accept `{ workerName, assignedTask, startTime, estimatedDuration, priority, notes }`, create `prisma.fieldActivity.create()`

Each controller should:
1. Extract `organizationId` from `req.user`
2. Validate required fields
3. Create the Prisma record with `organizationId`
4. Return `{ success: true, data }` on success
5. Return `{ success: false, error }` on failure

### 1.3 Add WeatherData model to Prisma schema

File: `backend/prisma/schema.prisma`

```prisma
model WeatherData {
  id              Int      @id @default(autoincrement())
  organizationId  Int      @map("organization_id")
  temperature     Float
  humidity        Float
  windSpeed       Float    @map("wind_speed")
  rainfall        Float
  forecast        String?
  createdAt       DateTime @default(now()) @map("created_at")

  organization    Organization @relation(fields: [organizationId], references: [id])

  @@map("weather_data")
}
```

Then run:
```bash
cd backend
npx prisma migrate dev --name add_weather_data_model
```

### 1.4 Update `getWeatherData` controller

Replace the placeholder return with a real `prisma.weatherData.findFirst()` query (same pattern as soil metrics).

---

## Phase 2: Frontend — Fix Broken State

### 2.1 Fix unnamed state variables

File: `frontend/src/components/Analytics.tsx` (lines 140-156)

Replace:
```ts
const [] = useState({ equipmentName: '', ... });
const [] = useState({ workerName: '', ... });
```

With:
```ts
const [equipmentData, setEquipmentData] = useState({ equipmentName: '', maintenanceType: '', scheduledDate: '', estimatedCost: '', technician: '', notes: '' });
const [fieldActivityData, setFieldActivityData] = useState({ workerName: '', assignedTask: '', startTime: '', estimatedDuration: '', priority: '', notes: '' });
```

---

## Phase 3: Frontend — Fetch & Display Real Data

### 3.1 Add farm operations state

```ts
const [farmOpsData, setFarmOpsData] = useState({
  crops: [],
  soilMetrics: null,
  weather: null,
  irrigation: null,
  pestControl: null,
  equipmentStatus: null,
  fieldActivity: null,
});
const [farmOpsLoading, setFarmOpsLoading] = useState(false);
```

### 3.2 Add fetch function

```ts
const fetchFarmOperations = async () => {
  setFarmOpsLoading(true);
  try {
    const [crops, soil, weather, irrigation, pest, equipment, field] = await Promise.allSettled([
      api.get('/farm-operations/crops'),
      api.get('/farm-operations/soil-metrics'),
      api.get('/farm-operations/weather-data'),
      api.get('/farm-operations/irrigation-status'),
      api.get('/farm-operations/pest-control'),
      api.get('/farm-operations/equipment-status'),
      api.get('/farm-operations/field-activity'),
    ]);

    setFarmOpsData({
      crops: crops.status === 'fulfilled' ? crops.value.data.crops : [],
      soilMetrics: soil.status === 'fulfilled' ? soil.value.data.soilData : null,
      weather: weather.status === 'fulfilled' ? weather.value.data.weatherData : null,
      irrigation: irrigation.status === 'fulfilled' ? irrigation.value.data.irrigationData : null,
      pestControl: pest.status === 'fulfilled' ? pest.value.data.pestControlData : null,
      equipmentStatus: equipment.status === 'fulfilled' ? equipment.value.data.equipmentStatusData : null,
      fieldActivity: field.status === 'fulfilled' ? field.value.data.fieldActivityData : null,
    });
  } catch (error) {
    console.error('Farm operations fetch error:', error);
  } finally {
    setFarmOpsLoading(false);
  }
};
```

### 3.3 Call on mount

Add to existing `useEffect` or create a new one:
```ts
useEffect(() => {
  fetchFarmOperations();
}, []);
```

### 3.4 Replace hardcoded "N/A" values in widgets

#### Crop Management Widget (line ~1091)
- "Planted Crops" → `farmOpsData.crops.length` or "No crops configured"
- "Health Status" → derive from crop health field
- "Next Harvest" → nearest `expectedHarvest` date from crops array
- "Yield Forecast" → from crop data or "N/A"

#### Soil Management Widget (line ~1126)
- "Moisture Level" → `farmOpsData.soilMetrics?.moistureLevel ?? 'N/A'`
- "pH Level" → `farmOpsData.soilMetrics?.phLevel ?? 'N/A'`
- "Nutrient Status" → combine N/P/K values
- "Last Treatment" → `farmOpsData.soilMetrics?.recommendations ?? 'N/A'`

#### Weather Impact Widget (line ~1161)
- "Temperature" → `farmOpsData.weather?.temperature ?? 'N/A'`
- "Rainfall" → `farmOpsData.weather?.rainfall ?? 'N/A'`
- "Wind Speed" → `farmOpsData.weather?.windSpeed ?? 'N/A'`
- "Growth Conditions" → `farmOpsData.weather?.forecast ?? 'N/A'`

#### Irrigation Status Card (line ~1208)
- "Zone A/B/C" → from `farmOpsData.irrigation` or keep zone-based structure
- "Water Usage Today" → `farmOpsData.irrigation?.waterAmount ?? 'N/A'`

#### Pest Control Card (line ~1242)
- "Threat Level" → `farmOpsData.pestControl?.threatLevel ?? 'N/A'`
- "Active Treatments" → `farmOpsData.pestControl?.activeTreatments ?? 'N/A'`
- "Next Spray" → `farmOpsData.pestControl?.nextSpray ?? 'N/A'`
- "Treatment Efficacy" → `farmOpsData.pestControl?.treatmentEfficacy ?? 'N/A'`

#### Equipment Status Card (line ~1272)
- "Operational" → `farmOpsData.equipmentStatus?.operational ?? 'N/A'`
- "Maintenance" → `farmOpsData.equipmentStatus?.MAINTENANCE ?? 'N/A'`
- "Utilization" → `farmOpsData.equipmentStatus?.utilization ?? 'N/A'`
- "Next Service" → `farmOpsData.equipmentStatus?.nextService ?? 'N/A'`

#### Field Activity Card (line ~1304)
- "Active Workers" → `farmOpsData.fieldActivity?.activeWorkers ?? 'N/A'`
- "Tasks Today" → `farmOpsData.fieldActivity?.tasksTotal ?? 'N/A'`
- "Efficiency" → `farmOpsData.fieldActivity?.efficiency ?? 'N/A'`
- "Productivity" → `farmOpsData.fieldActivity?.productivity ?? 'N/A'`

### 3.5 Update modal dashboards with real data

Each modal (Crop, Soil, Weather, Irrigation, Pest, Equipment, Field) has a dashboard section showing "N/A" — replace with the fetched data.

---

## Phase 4: Frontend — Wire Up Form Submissions

### 4.1 Crop form handler

```ts
const handleAddCrop = async () => {
  if (!cropData.newCrop || !cropData.plantingDate || !cropData.expectedHarvest) {
    alert('Please fill in all required fields');
    return;
  }
  try {
    await api.post('/farm-operations/crops', cropData);
    setShowCropModal(false);
    fetchFarmOperations(); // Refresh data
    setCropData({ newCrop: '', plantingDate: '', expectedHarvest: '', zoneAssignment: '', notes: '' });
  } catch (error) {
    console.error('Failed to add crop:', error);
    alert('Failed to add crop. Please try again.');
  }
};
```

### 4.2 Soil form handler

Replace `handleUpdateSoilAnalysis` — change `console.log` + `alert` to `api.post('/farm-operations/soil-metrics', soilData)` then refresh.

### 4.3 Irrigation form handler

Replace `handleScheduleIrrigation` — change to `api.post('/farm-operations/irrigation-status', irrigationData)` then refresh.

### 4.4 Pest form handler

Replace `handleCreateTreatmentPlan` — change to `api.post('/farm-operations/pest-control', pestData)` then refresh.

### 4.5 Equipment form handler

Create `handleScheduleMaintenance` — `api.post('/farm-operations/equipment-status', equipmentData)` then refresh.

### 4.6 Field activity form handler

Create `handleAssignFieldTask` — `api.post('/farm-operations/field-activity', fieldActivityData)` then refresh.

### 4.7 Wire buttons to handlers

Update the modal submit buttons to call the new handlers instead of having no `onClick`.

---

## Phase 5: Testing & Verification

### 5.1 Backend tests
- [ ] Each POST endpoint returns 201 with created record
- [ ] Each GET endpoint returns data after POST
- [ ] Organization scoping works (can't see other orgs' data)
- [ ] Validation errors return 400 with message

### 5.2 Frontend tests
- [ ] Widgets show "N/A" when no data exists
- [ ] Widgets show real data after records are created
- [ ] Modal forms submit and create records
- [ ] Data refreshes after form submission
- [ ] Error states handled gracefully (toast/alert)

### 5.3 Integration tests
- [ ] Create crop via modal → appears in widget
- [ ] Create soil analysis → appears in widget
- [ ] Schedule irrigation → appears in widget
- [ ] Create pest treatment → appears in widget
- [ ] Add equipment → appears in widget
- [ ] Assign field task → appears in widget

---

## Execution Order

| Step | Task | Effort |
|------|------|--------|
| 1 | Fix broken state variables (Phase 2) | 5 min |
| 2 | Add POST controllers (Phase 1.2) | 45 min |
| 3 | Add POST routes (Phase 1.1) | 10 min |
| 4 | Add WeatherData model + migrate (Phase 1.3-1.4) | 15 min |
| 5 | Add fetch function + state (Phase 3.1-3.3) | 20 min |
| 6 | Replace N/A values in widgets (Phase 3.4) | 30 min |
| 7 | Update modal dashboards (Phase 3.5) | 20 min |
| 8 | Wire form submissions (Phase 4) | 30 min |
| 9 | Test end-to-end (Phase 5) | 30 min |
| **Total** | | **~3.5 hrs** |

---

## File Inventory

| File | Changes |
|------|---------|
| `backend/src/routes/farmOperationsRoutes.ts` | Add 6 POST routes |
| `backend/src/controllers/farmOperationsController.ts` | Add 6 POST controllers, update getWeatherData |
| `backend/prisma/schema.prisma` | Add WeatherData model |
| `frontend/src/components/Analytics.tsx` | Fix state, add fetch, replace N/A, wire forms |
