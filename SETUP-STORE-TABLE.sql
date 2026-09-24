-- ============================================================
-- SQL Script to create the missing ldc_clinic_store table
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Create the table used by the frontend for cloud sync
CREATE TABLE IF NOT EXISTS ldc_clinic_store (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE ldc_clinic_store ENABLE ROW LEVEL SECURITY;

-- Enable Realtime for automatic syncing across devices
ALTER PUBLICATION supabase_realtime ADD TABLE ldc_clinic_store;

-- Create a policy that allows the frontend (using anon key) to read and write to this table
-- Note: This is an open policy for demonstration/sync purposes.
CREATE POLICY "Allow anonymous read/write on ldc_clinic_store"
    ON ldc_clinic_store
    FOR ALL
    USING (true)
    WITH CHECK (true);
