-- Create basic organization and admin user for testing
INSERT INTO organizations (name, description, created_at, updated_at) 
VALUES ('Default Farm Organization', 'Default organization for farm operations', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create admin user with password 'admin123' (bcrypt hash)
INSERT INTO users (name, email, password, role, organization_id, created_at, updated_at)
VALUES ('Farm Admin', 'admin@farm.com', '$2b$10$rQ8W8Q8Q8Q8Q8Q8Q8Q8Q8O8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8', 'OWNER', 1, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create sample farm operations data
INSERT INTO crops (name, planting_date, expected_harvest, zone_assignment, notes, status, health, organization_id, created_by, created_at, updated_at)
VALUES 
  ('Corn', '2024-03-15', '2024-07-15', 'Field A', 'Sample corn crop', 'GROWING', 'GOOD', 1, 1, NOW(), NOW()),
  ('Tomatoes', '2024-04-01', '2024-06-30', 'Greenhouse 1', 'Sample tomatoes', 'FLOWERING', 'EXCELLENT', 1, 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO equipment (name, type, status, utilization, last_service, next_service, maintenance_count, organization_id, created_by, created_at, updated_at)
VALUES 
  ('Tractor 1', 'Agricultural Machinery', 'OPERATIONAL', 85, NOW(), NOW() + INTERVAL '30 days', 0, 1, 1, NOW(), NOW()),
  ('Irrigation Pump', 'Water System', 'OPERATIONAL', 92, NOW(), NOW() + INTERVAL '15 days', 1, 1, 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO pest_control (pest_type, severity, treatment_method, application_date, follow_up_date, threat_level, active_treatments, next_spray, treatment_efficacy, last_check, notes, organization_id, created_by, created_at, updated_at)
VALUES 
  ('Aphids', 'MODERATE', 'Organic Spray', NOW(), NOW() + INTERVAL '7 days', 'MODERATE', 1, NOW() + INTERVAL '3 days', 85, NOW(), 'Sample pest control record', 1, 1, NOW(), NOW()),
  ('Whiteflies', 'LOW', 'Natural Predators', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 'LOW', 1, NOW() + INTERVAL '7 days', 90, NOW() - INTERVAL '2 days', 'Sample whitefly treatment', 1, 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO field_activity (worker_name, assigned_task, start_time, end_time, estimated_duration, priority, status, efficiency, tasks_completed, tasks_total, productivity, notes, organization_id, created_by, created_at, updated_at)
VALUES 
  ('John Farmer', 'Irrigation Check', NOW(), NOW() + INTERVAL '2 hours', 120, 'MEDIUM', 'IN_PROGRESS', 'HIGH', 3, 5, 15, 'Sample field activity', 1, 1, NOW(), NOW()),
  ('Mary Worker', 'Crop Inspection', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', 60, 'HIGH', 'COMPLETED', 'HIGH', 5, 5, 100, 'Completed crop inspection', 1, 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO soil_analysis (moisture_level, ph_level, nitrogen_level, phosphorus_level, potassium_level, zone, treatment_type, treatment_date, notes, organization_id, created_by, created_at, updated_at)
VALUES 
  (65, 6.8, 45, 30, 40, 'Field A', 'Nitrogen Fertilizer', NOW() - INTERVAL '1 day', 'Add nitrogen fertilizer', 1, 1, NOW(), NOW()),
  (70, 6.5, 50, 35, 45, 'Field B', 'Balanced NPK', NOW() - INTERVAL '2 days', 'Balanced fertilizer applied', 1, 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO weather_data (temperature, humidity, wind_speed, rainfall, forecast, organization_id, created_at, updated_at)
VALUES 
  (24, 68, 12, 0, 'Partly cloudy', 1, NOW(), NOW()),
  (26, 65, 8, 2, 'Sunny', 1, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;

INSERT INTO irrigation_status (zone, duration, start_time, water_amount, frequency, active_zones, total_zones, water_usage_today, next_schedule, efficiency, organization_id, created_by, created_at, updated_at)
VALUES 
  ('Field A', 30, NOW(), 150, 'Daily', 3, 5, 1250, NOW() + INTERVAL '8 hours', 85, 1, 1, NOW(), NOW()),
  ('Greenhouse 1', 15, NOW() - INTERVAL '2 hours', 75, 'Twice daily', 2, 2, 300, NOW() + INTERVAL '6 hours', 92, 1, 1, NOW(), NOW())
ON CONFLICT DO NOTHING;
