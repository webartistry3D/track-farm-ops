-- Create missing enum types for Prisma schema

-- Create UserRole enum
CREATE TYPE "public"."UserRole" AS ENUM ('OWNER', 'MANAGER', 'WORKER', 'SUPERUSER');

-- Create ActivityStatus enum  
CREATE TYPE "public"."ActivityStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Create FieldPriority enum
CREATE TYPE "public"."FieldPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Create FieldEfficiency enum
CREATE TYPE "public"."FieldEfficiency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Create PestThreatLevel enum
CREATE TYPE "public"."PestThreatLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- Create CropStatus enum
CREATE TYPE "public"."CropStatus" AS ENUM ('PLANTED', 'GROWING', 'READY', 'HARVESTED', 'FAILED');

-- Create CropHealth enum
CREATE TYPE "public"."CropHealth" AS ENUM ('POOR', 'FAIR', 'GOOD', 'EXCELLENT');

-- Create EquipmentStatus enum
CREATE TYPE "public"."EquipmentStatus" AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'REPAIR', 'RETIRED');

-- Create WeatherForecast enum
CREATE TYPE "public"."WeatherForecast" AS ENUM ('SUNNY', 'CLOUDY', 'RAINY', 'STORMY', 'PARTLY_CLOUDY', 'SNOWY', 'FOGGY');
