-- Corrected seed data matching the schema

INSERT INTO organizations (name, description, created_at, updated_at) 
VALUES ('Default Farm Organization', 'Default organization for farm operations', NOW(), NOW());

INSERT INTO users (name, email, password, role, organization_id, created_by, created_at, updated_at)
VALUES ('Farm Admin', 'admin@farm.com', '$2b$10$8V4iEm2ymKJO92qFHg80B.k2D1ikmX6P9Gh6pOzGqhAJArfjGUXkW', 'OWNER', 1, 1, NOW(), NOW());

INSERT INTO crops (name, planting_date, expected_harvest, zone_assignment, notes, status, health, organization_id, created_by, created_at, updated_at)
VALUES 
  ('Corn', '2024-03-15', '2024-07-15', 'Field A', 'Sample corn crop', 'GROWING', 'GOOD', 1, 1, NOW(), NOW()),
  ('Tomatoes', '2024-04-01', '2024-06-30', 'Greenhouse 1', 'Sample tomatoes', 'FLOWERING', 'EXCELLENT', 1, 1, NOW(), NOW());

INSERT INTO equipment (name, type, status, utilization, last_service, next_service, maintenance_count, organization_id, created_by, created_at, updated_at)
VALUES 
  ('Tractor 1', 'Agricultural Machinery', 'OPERATIONAL', 85, NOW(), NOW() + INTERVAL '30 days', 0, 1, 1, NOW(), NOW()),
  ('Irrigation Pump', 'Water System', 'OPERATIONAL', 92, NOW(), NOW() + INTERVAL '15 days', 1, 1, 1, NOW(), NOW());

INSERT INTO pest_control (pest_type, severity, treatment_method, application_date, follow_up_date, threat_level, active_treatments, next_spray, treatment_efficacy, last_check, notes, organization_id, created_by, created_at, updated_at)
VALUES 
  ('Aphids', 'MODERATE', 'Organic Spray', NOW(), NOW() + INTERVAL '7 days', 'MODERATE', 1, NOW() + INTERVAL '3 days', 85, NOW(), 'Sample pest control record', 1, 1, NOW(), NOW()),
  ('Spider Mites', 'LOW', 'Natural Predators', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 'LOW', 0, NOW() + INTERVAL '10 days', 92, NOW() - INTERVAL '2 days', 'Biological control working well', 1, 1, NOW(), NOW());

INSERT INTO field_activity (worker_name, assigned_task, start_time, end_time, status, priority, efficiency, organization_id, created_by, created_at, updated_at)
VALUES 
  ('John Doe', 'Plowing Field A', NOW(), NOW() + INTERVAL '4 hours', 'COMPLETED', 'HIGH', 'HIGH', 1, 1, NOW(), NOW()),
  ('Jane Smith', 'Planting Corn', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '3 hours', 'IN_PROGRESS', 'MEDIUM', 'MEDIUM', 1, 1, NOW(), NOW()),
  ('Mike Johnson', 'Equipment Maintenance', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours', 'COMPLETED', 'LOW', 'HIGH', 1, 1, NOW(), NOW());

INSERT INTO soil_analysis (moisture_level, ph_level, nitrogen_level, phosphorus_level, potassium_level, zone, organization_id, created_by, created_at, updated_at)
VALUES 
  (65.5, 6.8, 120.5, 45.2, 180.3, 'Field A', 1, 1, NOW(), NOW()),
  (72.1, 7.2, 98.7, 38.9, 165.4, 'Greenhouse 1', 1, 1, NOW(), NOW());

INSERT INTO weather_data (temperature, humidity, wind_speed, rainfall, forecast, organization_id, created_by, created_at, updated_at)
VALUES 
  (24.5, 68, 12, 0, 'Partly cloudy', 1, 1, NOW(), NOW()),
  (26.8, 72, 8, 2.5, 'Sunny', 1, 1, NOW(), NOW());

INSERT INTO irrigation_status (zone, duration, start_time, end_time, water_usage, efficiency, organization_id, created_by, created_at, updated_at)
VALUES 
  ('Zone 1', 120, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 hour', 450.5, 87.2, 1, 1, NOW(), NOW()),
  ('Zone 2', 90, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', 320.8, 92.1, 1, 1, NOW(), NOW());
