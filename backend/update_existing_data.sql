-- Update existing inventory items to have default values for new required columns
UPDATE inventory_items SET 
  type = 'CONSUMABLES',
  unit = COALESCE(unit, 'units'),
  description = COALESCE(description, 'No description'),
  minimum_stock = COALESCE(minimum_stock, 0),
  price_per_unit = COALESCE(price_per_unit, 0)
WHERE type IS NULL OR unit IS NULL;
