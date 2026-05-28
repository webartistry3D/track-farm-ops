-- Fix enum casting issues by dropping defaults first

-- 1. Drop defaults that conflict with enum casting
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
ALTER TABLE field_activity ALTER COLUMN status DROP DEFAULT;
ALTER TABLE field_activity ALTER COLUMN priority DROP DEFAULT;
ALTER TABLE field_activity ALTER COLUMN efficiency DROP DEFAULT;
ALTER TABLE pest_control ALTER COLUMN threat_level DROP DEFAULT;
ALTER TABLE crops ALTER COLUMN status DROP DEFAULT;
ALTER TABLE crops ALTER COLUMN health DROP DEFAULT;
ALTER TABLE equipment ALTER COLUMN status DROP DEFAULT;
ALTER TABLE weather_data ALTER COLUMN forecast DROP DEFAULT;

-- 2. Update column types to match enums
ALTER TABLE users ALTER COLUMN role TYPE "public"."UserRole" USING role::"public"."UserRole";
ALTER TABLE field_activity ALTER COLUMN status TYPE "public"."ActivityStatus" USING status::"public"."ActivityStatus";
ALTER TABLE field_activity ALTER COLUMN priority TYPE "public"."FieldPriority" USING priority::"public"."FieldPriority";
ALTER TABLE field_activity ALTER COLUMN efficiency TYPE "public"."FieldEfficiency" USING efficiency::"public"."FieldEfficiency";
ALTER TABLE pest_control ALTER COLUMN threat_level TYPE "public"."PestThreatLevel" USING threat_level::"public"."PestThreatLevel";
ALTER TABLE crops ALTER COLUMN status TYPE "public"."CropStatus" USING status::"public"."CropStatus";
ALTER TABLE crops ALTER COLUMN health TYPE "public"."CropHealth" USING health::"public"."CropHealth";
ALTER TABLE equipment ALTER COLUMN status TYPE "public"."EquipmentStatus" USING status::"public"."EquipmentStatus";
ALTER TABLE weather_data ALTER COLUMN forecast TYPE "public"."WeatherForecast" USING forecast::"public"."WeatherForecast";

-- 3. Set new defaults
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'WORKER';
ALTER TABLE field_activity ALTER COLUMN status SET DEFAULT 'PENDING';
ALTER TABLE field_activity ALTER COLUMN priority SET DEFAULT 'MEDIUM';
ALTER TABLE field_activity ALTER COLUMN efficiency SET DEFAULT 'MEDIUM';
ALTER TABLE pest_control ALTER COLUMN threat_level SET DEFAULT 'LOW';
ALTER TABLE crops ALTER COLUMN status SET DEFAULT 'PLANTED';
ALTER TABLE crops ALTER COLUMN health SET DEFAULT 'GOOD';
ALTER TABLE equipment ALTER COLUMN status SET DEFAULT 'OPERATIONAL';
ALTER TABLE weather_data ALTER COLUMN forecast SET DEFAULT 'SUNNY';

-- 4. Update any remaining NULL values
UPDATE users SET role = 'WORKER' WHERE role IS NULL;
UPDATE field_activity SET status = 'PENDING' WHERE status IS NULL;
UPDATE field_activity SET priority = 'MEDIUM' WHERE priority IS NULL;
UPDATE field_activity SET efficiency = 'MEDIUM' WHERE efficiency IS NULL;
UPDATE pest_control SET threat_level = 'LOW' WHERE threat_level IS NULL;
UPDATE crops SET status = 'PLANTED' WHERE status IS NULL;
UPDATE crops SET health = 'GOOD' WHERE health IS NULL;
UPDATE equipment SET status = 'OPERATIONAL' WHERE status IS NULL;
UPDATE weather_data SET forecast = 'SUNNY' WHERE forecast IS NULL;
