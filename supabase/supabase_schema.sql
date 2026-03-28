-- Create a table for site content
CREATE TABLE site_content (
  id integer PRIMARY KEY DEFAULT 1,
  hero jsonb NOT NULL DEFAULT '{}'::jsonb,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  pricing jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure only one row exists (id = 1)
ALTER TABLE site_content ADD CONSTRAINT single_row CHECK (id = 1);

-- Insert default row
INSERT INTO site_content (id, hero, features, pricing)
VALUES (
  1,
  '{"headlinePrefix": "Get discovered", "headlineGradient": "by AI", "description": "Search engines used to crawl your HTML...", "buttons": {"primary": "Start Optimizing"}}',
  '[{"title": "Feature 1", "description": "Desc 1"}, {"title": "Feature 2", "description": "Desc 2"}]',
  '[{"plan": "Basic", "price": "$9"}, {"plan": "Pro", "price": "$29"}, {"plan": "Enterprise", "price": "$49"}]'
) ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site_content
CREATE POLICY "Public can read site content"
  ON site_content FOR SELECT
  USING (true);

-- Allow authenticated users (Admin) to update site content
CREATE POLICY "Admins can update site content"
  ON site_content FOR UPDATE
  USING (auth.role() = 'authenticated');
