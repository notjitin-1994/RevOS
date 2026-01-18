-- RESTORE EMPLOYEES TABLE
-- This script recreates the employees table structure based on the application's data model
-- Run this in Supabase SQL Editor or via psql

-- IMPORTANT: Based on the codebase analysis, employees are stored in the 'users' table,
-- not in a separate 'employees' table. The employees are distinguished by the 'user_role' field.

-- Step 1: Verify if you need to restore the users table or if employee data still exists
-- ================================================================

-- Check current state of tables
SELECT
    table_name,
    table_type,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('users', 'garage_auth')
ORDER BY table_name;

-- Step 2: If 'users' table exists, check if employee records are there
-- ================================================================

-- If the above query shows the 'users' table exists, run this to check for employees:
-- Uncomment the query below to run it:

/*
SELECT
    user_uid,
    first_name,
    last_name,
    employee_id,
    login_id,
    email,
    phone_number,
    user_role,
    is_active,
    garage_name,
    created_at
FROM users
WHERE user_role IN ('employee', 'mechanic', 'service_advisor', 'manager', 'admin')
ORDER BY created_at DESC;
*/

-- Step 3: If you need to recreate the USERS table (backup scenario)
-- ================================================================

-- WARNING: Only run this if the 'users' table is completely deleted!
-- This will create the table with the correct structure based on the codebase

-- Uncomment and run ONLY if the table is completely missing:

/*
CREATE TABLE IF NOT EXISTS users (
    user_uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garage_uid UUID NOT NULL,
    garage_id TEXT NOT NULL,
    garage_name TEXT NOT NULL,

    -- Employee Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    employee_id TEXT,
    login_id TEXT UNIQUE NOT NULL,
    email TEXT,
    phone_number TEXT NOT NULL,
    alternate_phone TEXT,

    -- Additional Details
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    date_of_birth DATE,
    date_of_joining DATE,
    blood_group TEXT,
    department TEXT,

    -- Role and Status
    user_role TEXT NOT NULL DEFAULT 'employee',
    -- Valid roles: 'owner', 'admin', 'manager', 'service_advisor', 'mechanic', 'employee'

    is_active BOOLEAN DEFAULT true,
    profile_picture TEXT,

    -- JSON fields for flexible data
    certifications JSONB DEFAULT '[]'::jsonb,
    specializations JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on commonly queried fields
CREATE INDEX IF NOT EXISTS idx_users_garage_uid ON users(garage_uid);
CREATE INDEX IF NOT EXISTS idx_users_garage_id ON users(garage_id);
CREATE INDEX IF NOT EXISTS idx_users_login_id ON users(login_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_role ON users(user_role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Create index on employee_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id) WHERE employee_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
-- Policy: Users can only see records from their own garage
CREATE POLICY "Users can view their garage employees"
    ON users FOR SELECT
    USING (garage_uid = (SELECT garage_uid FROM users WHERE user_uid = auth.uid()));

-- Policy: Only garage owners/admins can insert employees
CREATE POLICY "Owners can insert employees"
    ON users FOR INSERT
    WITH CHECK (
        garage_uid = (SELECT garage_uid FROM users WHERE user_uid = auth.uid())
        AND user_role IN ('owner', 'admin')
    );

-- Policy: Users can update their own record
CREATE POLICY "Users can update own record"
    ON users FOR UPDATE
    USING (user_uid = auth.uid());

-- Policy: Owners/admins can update employees in their garage
CREATE POLICY "Owners can update employees"
    ON users FOR UPDATE
    USING (
        garage_uid = (SELECT garage_uid FROM users WHERE user_uid = auth.uid())
        AND user_role IN ('owner', 'admin')
    );

-- Policy: Only owners/admins can delete employees
CREATE POLICY "Owners can delete employees"
    ON users FOR DELETE
    USING (
        garage_uid = (SELECT garage_uid FROM users WHERE user_uid = auth.uid())
        AND user_role IN ('owner', 'admin')
    );

-- Grant permissions
GRANT ALL ON users TO authenticated;
GRANT SELECT ON users TO anon;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
*/

-- Step 4: Verify restoration
-- ================================================================

-- After running the restoration, verify the table structure:
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Count total users by role
SELECT
    user_role,
    COUNT(*) as count
FROM users
GROUP BY user_role
ORDER BY count DESC;

-- Step 5: Sample data check
-- ================================================================

-- Check if you have any employees
SELECT
    user_uid,
    first_name,
    last_name,
    user_role,
    email,
    login_id,
    is_active
FROM users
ORDER BY created_at DESC
LIMIT 5;

NOTES:
------
1. This application uses Supabase (PostgreSQL) as the database
2. Employees are stored in the 'users' table, identified by their 'user_role' field
3. Valid user roles include: 'owner', 'admin', 'manager', 'service_advisor', 'mechanic', 'employee'
4. Authentication data is stored in a separate 'garage_auth' table linked by user_uid
5. If you need to recover lost data, check if you have a database backup in Supabase

To check for backups in Supabase:
- Go to your Supabase project dashboard
- Navigate to Database > Backups
- Look for point-in-time recovery options

If you have a recent backup, you can restore specific tables from there.
