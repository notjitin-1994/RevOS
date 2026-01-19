-- Create table to track dropdown option usage for smart sorting
-- This will make dropdowns show the most commonly used options first

CREATE TABLE IF NOT EXISTS inventory_field_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id TEXT NOT NULL,
  field_name VARCHAR(100) NOT NULL, -- e.g., 'category', 'usedFor', 'make', etc.
  field_value VARCHAR(255) NOT NULL, -- e.g., 'Engine', 'Brakes', 'Motul', etc.
  usage_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(garage_id, field_name, field_value)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_inventory_field_usage_garage_field ON inventory_field_usage(garage_id, field_name);
CREATE INDEX IF NOT EXISTS idx_inventory_field_usage_count ON inventory_field_usage(usage_count DESC);

-- Add comment
COMMENT ON TABLE inventory_field_usage IS 'Tracks usage frequency of dropdown options to enable smart sorting based on popularity';

-- Function to update usage count (upsert)
CREATE OR REPLACE FUNCTION increment_field_usage(
  p_garage_id TEXT,
  p_field_name VARCHAR(100),
  p_field_value VARCHAR(255)
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO inventory_field_usage (garage_id, field_name, field_value, usage_count, last_used_at)
  VALUES (p_garage_id, p_field_name, p_field_value, 1, CURRENT_TIMESTAMP)
  ON CONFLICT (garage_id, field_name, field_value)
  DO UPDATE SET
    usage_count = inventory_field_usage.usage_count + 1,
    last_used_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION increment_field_usage IS 'Increments the usage count for a field value, creating the record if it doesn''t exist';
