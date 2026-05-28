-- Seed preset inventory categories and items for all organizations (organization_id = null)

-- Insert preset inventory categories (8 total)
INSERT INTO inventory_categories (name, description, icon, color, organization_id) VALUES
('Seeds & Planting', 'Planting materials, seeds, and seedlings for crop production', 'seed', 'green', NULL),
('Fertilizers & Nutrients', 'Soil amendments, fertilizers, and nutrient supplements', 'package', 'blue', NULL),
('Pest Control', 'Crop protection chemicals and pest management supplies', 'shield', 'red', NULL),
('Livestock', 'Animals, animal feed, and livestock care supplies', 'cow', 'brown', NULL),
('Equipment & Tools', 'Farm machinery, tools, and maintenance supplies', 'wrench', 'gray', NULL),
('Irrigation Supplies', 'Water management, irrigation systems, and components', 'droplet', 'cyan', NULL),
('Storage Materials', 'Containers, packaging, and storage solutions', 'archive', 'orange', NULL),
('Safety & Protective', 'Personal protective equipment and safety supplies', 'shield-check', 'purple', NULL);

-- Insert preset inventory items (25 total)
INSERT INTO inventory_items (name, type, unit, quantity, initial_quantity, category_id, organization_id, description, minimum_stock, price_per_unit) VALUES
-- Seeds & Planting (4 items)
('Corn Seeds', 'PRODUCE', 'kg', 0, 0, 1, NULL, 'High-quality hybrid corn seeds for planting', 100, 45.00),
('Wheat Seeds', 'PRODUCE', 'kg', 0, 0, 1, NULL, 'Premium wheat seeds for grain production', 80, 38.00),
('Tomato Seeds', 'PRODUCE', 'packets', 0, 0, 1, NULL, 'Hybrid tomato seeds for greenhouse and field', 20, 15.00),
('Vegetable Seedlings', 'PRODUCE', 'trays', 0, 0, 1, NULL, 'Mixed vegetable seedlings ready for transplant', 10, 25.00),

-- Fertilizers & Nutrients (4 items)
('NPK Fertilizer', 'CONSUMABLES', 'bags', 0, 0, 2, NULL, 'Balanced NPK fertilizer 20-20-20 for general use', 15, 120.00),
('Urea', 'CONSUMABLES', 'bags', 0, 0, 2, NULL, 'Urea fertilizer 46-0-0 for nitrogen boost', 12, 95.00),
('Compost', 'CONSUMABLES', 'cubic_meters', 0, 0, 2, NULL, 'Organic compost for soil improvement', 5, 60.00),
('Agricultural Lime', 'CONSUMABLES', 'tons', 0, 0, 2, NULL, 'Agricultural lime for soil pH adjustment', 2, 180.00),

-- Pest Control (3 items)
('Insecticide', 'CONSUMABLES', 'liters', 0, 0, 3, NULL, 'Broad-spectrum insecticide for crop protection', 8, 150.00),
('Fungicide', 'CONSUMABLES', 'liters', 0, 0, 3, NULL, 'Systemic fungicide for disease control', 6, 180.00),
('Herbicide', 'CONSUMABLES', 'liters', 0, 0, 3, NULL, 'Selective herbicide for weed management', 10, 120.00),

-- Livestock (4 items)
('Chicken Feed', 'CONSUMABLES', 'bags', 0, 0, 4, NULL, 'Complete feed formula for broiler chickens', 20, 35.00),
('Cattle Feed', 'CONSUMABLES', 'bags', 0, 0, 4, NULL, 'Nutritional feed for dairy and beef cattle', 15, 55.00),
('Veterinary Medicine', 'CONSUMABLES', 'bottles', 0, 0, 4, NULL, 'Essential veterinary medicines for livestock', 5, 85.00),
('Vaccines', 'CONSUMABLES', 'doses', 0, 0, 4, NULL, 'Livestock vaccines for disease prevention', 10, 12.00),

-- Equipment & Tools (4 items)
('Tractor Fuel', 'CONSUMABLES', 'liters', 0, 0, 5, NULL, 'Diesel fuel for farm tractors and equipment', 200, 1.20),
('Oil Lubricant', 'CONSUMABLES', 'liters', 0, 0, 5, NULL, 'Engine oil for machinery maintenance', 25, 15.00),
('Spare Parts', 'EQUIPMENT', 'units', 0, 0, 5, NULL, 'Common spare parts for farm equipment', 30, 45.00),
('Hand Tools', 'EQUIPMENT', 'sets', 0, 0, 5, NULL, 'Essential hand tools for farm work', 8, 75.00),

-- Irrigation Supplies (3 items)
('Water Pipes', 'EQUIPMENT', 'meters', 0, 0, 6, NULL, 'PVC water pipes for irrigation systems', 50, 8.50),
('Sprinkler Nozzles', 'EQUIPMENT', 'units', 0, 0, 6, NULL, 'Adjustable sprinkler nozzles for irrigation', 40, 12.00),
('Water Pump Parts', 'EQUIPMENT', 'kits', 0, 0, 6, NULL, 'Maintenance kits for water pumps', 6, 120.00),

-- Storage Materials (2 items)
('Storage Bags', 'CONSUMABLES', 'bundles', 0, 0, 7, NULL, 'Durable bags for grain and produce storage', 100, 3.50),
('Plastic Containers', 'EQUIPMENT', 'units', 0, 0, 7, NULL, 'Food-grade plastic containers for storage', 25, 18.00),

-- Safety & Protective (1 item)
('Safety Gloves', 'CONSUMABLES', 'pairs', 0, 0, 8, NULL, 'Heavy-duty safety gloves for farm work', 15, 8.00);

-- Update timestamps
UPDATE inventory_categories SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;
UPDATE inventory_items SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;

-- Display summary
SELECT 
    'Preset Inventory Summary' as summary,
    (SELECT COUNT(*) FROM inventory_categories WHERE organization_id IS NULL) as categories_added,
    (SELECT COUNT(*) FROM inventory_items WHERE organization_id IS NULL) as items_added;
