-- Create site_content table
CREATE TABLE IF NOT EXISTS site_content (
  section TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  image TEXT,
  data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Create access policies
-- Everyone can read the content
CREATE POLICY "Public Read" ON site_content 
  FOR SELECT 
  USING (true);

-- Authenticated users (or for this demo, everyone until we add Auth properly) can modify
CREATE POLICY "Authenticated Update" ON site_content 
  FOR ALL 
  USING (true); 
