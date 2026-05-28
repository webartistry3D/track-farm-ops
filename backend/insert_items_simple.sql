-- Insert inventory items without category constraints first
INSERT INTO inventory_items (name, type, unit, quantity, initial_quantity, organization_id, description, minimum_stock, price_per_unit) VALUES
('Corn Seeds', 'PRODUCE', 'kg', 0, 0, 1, 'High-quality hybrid corn seeds for planting', 100, 45.00),
('Wheat Seeds', 'PRODUCE', 'kg', 0, 0, 1, 'Premium wheat seeds for grain production', 80, 38.00),
('Tomato Seeds', 'PRODUCE', 'packets', 0, 0, 1, 'Hybrid tomato seeds for greenhouse and field', 20, 15.00),
('Vegetable Seedlings', 'PRODUCE', 'trays', 0, 0, 1, 'Mixed vegetable seedlings ready for transplant', 10, 25.00),
('NPK Fertilizer', 'CONSUMABLES', 'bags', 0, 0, 1, 'Balanced NPK fertilizer 20-20-20 for general use', 15, 120.00),
('Urea', 'CONSUMABLES', 'bags', 0, 0, 1, 'Urea fertilizer 46-0-0 for nitrogen boost', 12, 95.00),
('Compost', 'CONSUMABLES', 'cubic_meters', 0, 0, 1, 'Organic compost for soil improvement', 5, 60.00),
('Agricultural Lime', 'CONSUMABLES', 'tons', 0, 0, 1, 'Agricultural lime for soil pH adjustment', 2, 180.00),
('Insecticide', 'CONSUMABLES', 'liters', 0, 0, 1, 'Broad-spectrum insecticide for crop protection', 8, 150.00),
('Fungicide', 'CONSUMABLES', 'liters', 0, 0, 1, 'Systemic fungicide for disease control', 6, 180.00),
('Herbicide', 'CONSUMABLES', 'liters', 0, 0, 1, 'Selective herbicide for weed management', 10, 120.00),
('Chicken Feed', 'CONSUMABLES', 'bags', 0, 0, 1, 'Complete feed formula for broiler chickens', 20, 35.00),
('Cattle Feed', 'CONSUMABLES', 'bags', 0, 0, 1, 'Nutritional feed for dairy and beef cattle', 15, 55.00),
('Veterinary Medicine', 'CONSUMABLES', 'bottles', 0, 0, 1, 'Essential veterinary medicines for livestock', 5, 85.00),
('Vaccines', 'CONSUMABLES', 'doses', 0, 0, 1, 'Livestock vaccines for disease prevention', 10, 12.00),
('Tractor Fuel', 'CONSUMABLES', 'liters', 0, 0, 1, 'Diesel fuel for farm tractors and equipment', 200, 1.20),
('Oil Lubricant', 'CONSUMABLES', 'liters', 0, 0, 1, 'Engine oil for machinery maintenance', 25, 15.00),
('Spare Parts', 'EQUIPMENT', 'units', 0, 0, 1, 'Common spare parts for farm equipment', 30, 45.00),
('Hand Tools', 'EQUIPMENT', 'sets', 0, 0, 1, 'Essential hand tools for farm work', 8, 75.00),
('Water Pipes', 'EQUIPMENT', 'meters', 0, 0, 1, 'PVC water pipes for irrigation systems', 50, 8.50),
('Sprinkler Nozzles', 'EQUIPMENT', 'units', 0, 0, 1, 'Adjustable sprinkler nozzles for irrigation', 40, 12.00),
('Water Pump Parts', 'EQUIPMENT', 'kits', 0, 0, 1, 'Maintenance kits for water pumps', 6, 120.00),
('Storage Bags', 'CONSUMABLES', 'bundles', 0, 0, 1, 'Durable bags for grain and produce storage', 100, 3.50),
('Plastic Containers', 'EQUIPMENT', 'units', 0, 0, 1, 'Food-grade plastic containers for storage', 25, 18.00),
('Safety Gloves', 'CONSUMABLES', 'pairs', 0, 0, 1, 'Heavy-duty safety gloves for farm work', 15, 8.00);

-- Update timestamps
UPDATE inventory_items SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;

-- Display summary
SELECT 
    'Items Inserted' as summary,
    (SELECT COUNT(*) FROM inventory_items) as total_items;
