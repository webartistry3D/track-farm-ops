-- Inventory Usage Tracking Schema
-- Add to existing Prisma schema or execute as SQL

-- Inventory Transactions Table
CREATE TABLE inventory_transactions (
  id SERIAL PRIMARY KEY,
  itemId INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transactionType VARCHAR(20) NOT NULL CHECK (
    transactionType IN ('USED', 'ADDED', 'ADJUSTED', 'WASTED', 'SOLD', 'RETURNED', 'TRANSFER_IN', 'TRANSFER_OUT')
  ),
  quantity DECIMAL(10,2) NOT NULL, -- Positive for additions, negative for usage
  unit VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  referenceType VARCHAR(50), -- 'ORDER', 'JOB', 'WASTE', 'SAMPLE', 'INTERNAL', 'OTHER'
  referenceId VARCHAR(100), -- Order #, Job ID, etc.
  performedBy INTEGER NOT NULL REFERENCES users(id),
  performedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location VARCHAR(255),
  organizationId INTEGER NOT NULL REFERENCES organizations(id),
  metadata JSONB DEFAULT '{}',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_inventory_transactions_itemId ON inventory_transactions(itemId);
CREATE INDEX idx_inventory_transactions_organizationId ON inventory_transactions(organizationId);
CREATE INDEX idx_inventory_transactions_performedAt ON inventory_transactions(performedAt);
CREATE INDEX idx_inventory_transactions_transactionType ON inventory_transactions(transactionType);
CREATE INDEX idx_inventory_transactions_referenceType ON inventory_transactions(referenceType);

-- Trigger to update item quantity automatically
CREATE OR REPLACE FUNCTION update_item_quantity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update item quantity based on transaction
  UPDATE inventory_items 
  SET quantity = (
    SELECT COALESCE(SUM(quantity), 0) 
    FROM inventory_transactions 
    WHERE itemId = NEW.itemId
  ),
  updatedAt = CURRENT_TIMESTAMP
  WHERE id = NEW.itemId;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_item_quantity
  AFTER INSERT OR UPDATE OR DELETE ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_item_quantity();

-- View for current inventory status
CREATE VIEW inventory_status AS
SELECT 
  ii.id,
  ii.name,
  ii.categoryId,
  COALESCE(SUM(it.quantity), 0) as currentQuantity,
  ii.unit,
  ii.pricePerUnit,
  ii.minimumStock,
  ii.organizationId,
  ii.createdAt,
  ii.updatedAt,
  -- Usage statistics
  (SELECT COALESCE(SUM(CASE WHEN it.transactionType = 'USED' THEN ABS(it.quantity) ELSE 0 END), 0) 
   FROM inventory_transactions it2 
   WHERE it2.itemId = ii.id) as totalUsed,
  (SELECT COALESCE(SUM(CASE WHEN it.transactionType = 'ADDED' THEN it.quantity ELSE 0 END), 0) 
   FROM inventory_transactions it3 
   WHERE it3.itemId = ii.id) as totalAdded
FROM inventory_items ii
LEFT JOIN inventory_transactions it ON ii.id = it.itemId
WHERE ii.deletedAt IS NULL
GROUP BY ii.id, ii.name, ii.categoryId, ii.unit, ii.pricePerUnit, ii.minimumStock, ii.organizationId, ii.createdAt, ii.updatedAt;
