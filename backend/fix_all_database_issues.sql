-- COMPREHENSIVE DATABASE FIX SCRIPT
-- This script fixes all missing enums and columns

-- 1. CREATE ALL MISSING ENUMS
CREATE TYPE IF NOT EXISTS "public"."UserRole" AS ENUM ('OWNER', 'MANAGER', 'WORKER', 'SUPERUSER');
CREATE TYPE IF NOT EXISTS "public"."ActivityStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE IF NOT EXISTS "public"."FieldPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE IF NOT EXISTS "public"."FieldEfficiency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE IF NOT EXISTS "public"."PestThreatLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');
CREATE TYPE IF NOT EXISTS "public"."CropStatus" AS ENUM ('PLANTED', 'GROWING', 'READY', 'HARVESTED', 'FAILED');
CREATE TYPE IF NOT EXISTS "public"."CropHealth" AS ENUM ('POOR', 'FAIR', 'GOOD', 'EXCELLENT');
CREATE TYPE IF NOT EXISTS "public"."EquipmentStatus" AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'REPAIR', 'RETIRED');
CREATE TYPE IF NOT EXISTS "public"."WeatherForecast" AS ENUM ('SUNNY', 'CLOUDY', 'RAINY', 'STORMY', 'PARTLY_CLOUDY', 'SNOWY', 'FOGGY');

-- 2. FIX FIELD_ACTIVITY TABLE - ADD MISSING COLUMNS
ALTER TABLE field_activity 
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'MEDIUM',
ADD COLUMN IF NOT EXISTS efficiency TEXT DEFAULT 'MEDIUM',
ADD COLUMN IF NOT EXISTS tasks_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tasks_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS productivity DECIMAL DEFAULT 0;

-- 3. FIX SOIL_ANALYSIS TABLE - ADD MISSING COLUMNS
ALTER TABLE soil_analysis 
ADD COLUMN IF NOT EXISTS treatment_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS treatment_type TEXT;

-- 4. FIX IRRIGATION_STATUS TABLE - ADD MISSING COLUMNS
ALTER TABLE irrigation_status 
ADD COLUMN IF NOT EXISTS water_amount DECIMAL,
ADD COLUMN IF NOT EXISTS frequency TEXT,
ADD COLUMN IF NOT EXISTS active_zones INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_zones INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS water_usage_today DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_schedule TIMESTAMP;

-- 5. FIX USERS TABLE - ENSURE ALL COLUMNS EXIST
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP,
ADD COLUMN IF NOT EXISTS password_changed_by INTEGER,
ADD COLUMN IF NOT EXISTS password_change_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- 6. FIX EQUIPMENT TABLE - ENSURE ALL COLUMNS EXIST
ALTER TABLE equipment 
ADD COLUMN IF NOT EXISTS utilization INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_service TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_service TIMESTAMP,
ADD COLUMN IF NOT EXISTS maintenance_count INTEGER DEFAULT 0;

-- 7. FIX PEST_CONTROL TABLE - ENSURE ALL COLUMNS EXIST
ALTER TABLE pest_control 
ADD COLUMN IF NOT EXISTS threat_level TEXT DEFAULT 'LOW',
ADD COLUMN IF NOT EXISTS active_treatments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_spray TIMESTAMP,
ADD COLUMN IF NOT EXISTS treatment_efficacy INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 8. FIX CROPS TABLE - ENSURE ALL COLUMNS EXIST
ALTER TABLE crops 
ADD COLUMN IF NOT EXISTS zone_assignment TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PLANTED',
ADD COLUMN IF NOT EXISTS health TEXT DEFAULT 'GOOD';

-- 9. FIX WEATHER_DATA TABLE - ENSURE ALL COLUMNS EXIST
ALTER TABLE weather_data 
ADD COLUMN IF NOT EXISTS forecast TEXT DEFAULT 'SUNNY';

-- 10. UPDATE COLUMN TYPES TO MATCH ENUMS
ALTER TABLE users ALTER COLUMN role TYPE "public"."UserRole" USING role::"public"."UserRole";
ALTER TABLE field_activity ALTER COLUMN status TYPE "public"."ActivityStatus" USING status::"public"."ActivityStatus";
ALTER TABLE field_activity ALTER COLUMN priority TYPE "public"."FieldPriority" USING priority::"public"."FieldPriority";
ALTER TABLE field_activity ALTER COLUMN efficiency TYPE "public"."FieldEfficiency" USING efficiency::"public"."FieldEfficiency";
ALTER TABLE pest_control ALTER COLUMN threat_level TYPE "public"."PestThreatLevel" USING threat_level::"public"."PestThreatLevel";
ALTER TABLE crops ALTER COLUMN status TYPE "public"."CropStatus" USING status::"public"."CropStatus";
ALTER TABLE crops ALTER COLUMN health TYPE "public"."CropHealth" USING health::"public"."CropHealth";
ALTER TABLE equipment ALTER COLUMN status TYPE "public"."EquipmentStatus" USING status::"public"."EquipmentStatus";
ALTER TABLE weather_data ALTER COLUMN forecast TYPE "public"."WeatherForecast" USING forecast::"public"."WeatherForecast";

-- 11. SET DEFAULT VALUES FOR NEW COLUMNS
UPDATE field_activity SET priority = 'MEDIUM' WHERE priority IS NULL;
UPDATE field_activity SET efficiency = 'MEDIUM' WHERE efficiency IS NULL;
UPDATE field_activity SET tasks_completed = 0 WHERE tasks_completed IS NULL;
UPDATE field_activity SET tasks_total = 0 WHERE tasks_total IS NULL;
UPDATE field_activity SET productivity = 0 WHERE productivity IS NULL;

UPDATE soil_analysis SET treatment_type = 'No treatment' WHERE treatment_type IS NULL;

UPDATE irrigation_status SET active_zones = 0 WHERE active_zones IS NULL;
UPDATE irrigation_status SET total_zones = 0 WHERE total_zones IS NULL;
UPDATE irrigation_status SET water_usage_today = 0 WHERE water_usage_today IS NULL;

UPDATE users SET password_change_count = 0 WHERE password_change_count IS NULL;
UPDATE users SET requires_password_change = false WHERE requires_password_change IS NULL;

UPDATE equipment SET utilization = 0 WHERE utilization IS NULL;
UPDATE equipment SET maintenance_count = 0 WHERE maintenance_count IS NULL;

UPDATE pest_control SET threat_level = 'LOW' WHERE threat_level IS NULL;
UPDATE pest_control SET active_treatments = 0 WHERE active_treatments IS NULL;
UPDATE pest_control SET treatment_efficacy = 0 WHERE treatment_efficacy IS NULL;

UPDATE crops SET zone_assignment = 'Default Zone' WHERE zone_assignment IS NULL;
UPDATE crops SET notes = 'No notes' WHERE notes IS NULL;
UPDATE crops SET status = 'PLANTED' WHERE status IS NULL;
UPDATE crops SET health = 'GOOD' WHERE health IS NULL;

UPDATE weather_data SET forecast = 'SUNNY' WHERE forecast IS NULL;

COMMIT;
