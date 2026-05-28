-- Seed inventory categories and items

-- Insert inventory categories
INSERT INTO inventory_categories (name, description, icon, color, organization_id) VALUES
('Seeds', 'Planting seeds and seedlings', 'seed', 'green', 1),
('Fertilizers', 'Soil nutrients and fertilizers', 'package', 'blue', 1),
('Pesticides', 'Crop protection chemicals', 'shield', 'red', 1),
('Equipment', 'Farm tools and equipment', 'wrench', 'gray', 1),
('Livestock', 'Animals and livestock', 'cow', 'brown', 1);

-- Insert inventory items
INSERT INTO inventory_items (name, type, unit, quantity, initial_quantity, category_id, organization_id, description, minimum_stock, price_per_unit) VALUES
('Corn Seeds', 'PRODUCE', 'kg', 500, 1000, 1, 1, 'High quality corn seeds for planting', 100, 50.00),
('Wheat Seeds', 'PRODUCE', 'kg', 300, 800, 1, 1, 'Premium wheat seeds', 80, 45.00),
('NPK Fertilizer', 'CONSUMABLES', 'bags', 25, 50, 2, 1, 'Nitrogen-Phosphorus-Potassium fertilizer', 10, 120.00),
('Urea Fertilizer', 'CONSUMABLES', 'bags', 40, 60, 2, 1, 'Urea fertilizer for nitrogen boost', 15, 85.00),
('Pesticide Spray', 'CONSUMABLES', 'liters', 15, 30, 3, 1, 'Broad spectrum pesticide', 5, 200.00),
('Tractor', 'EQUIPMENT', 'units', 2, 2, 4, 1, 'Farm tractor for plowing', 1, 50000.00),
('Plow', 'EQUIPMENT', 'units', 4, 4, 4, 1, 'Agricultural plow', 2, 1500.00),
('Chicken', 'LIVESTOCK', 'pieces', 100, 150, 5, 1, 'Broiler chickens', 20, 25.00),
('Goats', 'LIVESTOCK', 'pieces', 25, 30, 5, 1, 'Dairy goats', 5, 150.00);

-- Update timestamps for created_at and updated_at
UPDATE inventory_categories SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;
UPDATE inventory_items SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;
