-- ============================================================================
-- Migration: Create Job Card Task Templates System
-- Description: Adds tables for managing reusable task templates with subtasks and parts
-- Date: 2025-01-24
-- ============================================================================

-- ============================================================================
-- Table: job_card_templates
-- Purpose: Stores reusable task templates for garage operations
-- ============================================================================
CREATE TABLE job_card_templates (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Garage ownership (each garage has their own templates)
  garage_id UUID NOT NULL,

  -- Template identification
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,

  -- Classification
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',

  -- Labor costs
  estimated_minutes INTEGER NOT NULL DEFAULT 30,
  labor_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Organization
  tags TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  is_system_template BOOLEAN DEFAULT FALSE,

  -- Metadata
  usage_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT job_card_templates_garage_slug_unique UNIQUE (garage_id, slug),
  CONSTRAINT job_card_templates_category_check
    CHECK (category IN ('Engine', 'Electrical', 'Body', 'Maintenance', 'Diagnostic', 'Custom')),
  CONSTRAINT job_card_templates_priority_check
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT job_card_templates_time_check
    CHECK (estimated_minutes > 0)
);

-- Indexes
CREATE INDEX idx_templates_garage ON job_card_templates(garage_id);
CREATE INDEX idx_templates_category ON job_card_templates(category);
CREATE INDEX idx_templates_active ON job_card_templates(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_templates_tags ON job_card_templates USING GIN(tags);
CREATE INDEX idx_templates_popularity ON job_card_templates(usage_count DESC);

-- Foreign key references garages table
ALTER TABLE job_card_templates
  ADD CONSTRAINT fk_templates_garage
  FOREIGN KEY (garage_id)
  REFERENCES public.garages(garage_uid)
  ON DELETE CASCADE;

-- ============================================================================
-- Table: job_card_template_subtasks
-- Purpose: Stores subtasks for each template
-- ============================================================================
CREATE TABLE job_card_template_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_minutes INTEGER NOT NULL DEFAULT 15,
  display_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT template_subtasks_time_check CHECK (estimated_minutes > 0),
  CONSTRAINT template_subtasks_order_check CHECK (display_order >= 0)
);

CREATE INDEX idx_template_subtasks_template ON job_card_template_subtasks(template_id);
CREATE INDEX idx_template_subtasks_order ON job_card_template_subtasks(template_id, display_order);

ALTER TABLE job_card_template_subtasks
  ADD CONSTRAINT fk_template_subtasks_template
  FOREIGN KEY (template_id)
  REFERENCES job_card_templates(id)
  ON DELETE CASCADE;

-- ============================================================================
-- Table: job_card_template_parts
-- Purpose: Stores parts commonly used in templates
-- ============================================================================
CREATE TABLE job_card_template_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,

  part_name VARCHAR(255) NOT NULL,
  part_number VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,

  is_optional BOOLEAN DEFAULT FALSE,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT template_parts_quantity_check CHECK (quantity > 0),
  CONSTRAINT template_parts_cost_check CHECK (unit_cost >= 0)
);

CREATE INDEX idx_template_parts_template ON job_card_template_parts(template_id);
CREATE INDEX idx_template_parts_part_number ON job_card_template_parts(part_number);

ALTER TABLE job_card_template_parts
  ADD CONSTRAINT fk_template_parts_template
  FOREIGN KEY (template_id)
  REFERENCES job_card_templates(id)
  ON DELETE CASCADE;

-- ============================================================================
-- Views for convenient querying
-- ============================================================================

CREATE VIEW v_job_card_templates_summary AS
SELECT
  t.id,
  t.garage_id,
  t.name,
  t.slug,
  t.description,
  t.category,
  t.priority,
  t.estimated_minutes,
  t.labor_rate,
  t.tags,
  t.usage_count,
  t.is_active,
  COUNT(DISTINCT ts.id) as subtask_count,
  COUNT(DISTINCT tp.id) as parts_count,
  t.created_at
FROM job_card_templates t
LEFT JOIN job_card_template_subtasks ts ON ts.template_id = t.id
LEFT JOIN job_card_template_parts tp ON tp.template_id = t.id
WHERE t.is_active = TRUE
GROUP BY t.id;

-- ============================================================================
-- Rollback (DOWN migration)
-- ============================================================================
-- DROP VIEW IF EXISTS v_job_card_templates_summary;
-- DROP TABLE IF EXISTS job_card_template_parts;
-- DROP TABLE IF EXISTS job_card_template_subtasks;
-- DROP TABLE IF EXISTS job_card_templates;
