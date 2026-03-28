-- create_pricing_table.sql
CREATE TABLE pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price text NOT NULL,
  description text NOT NULL,
  features_list jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_popular boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read pricing plans"
  ON pricing_plans FOR SELECT
  USING (true);

-- Allow authenticated users to manage pricing plans
CREATE POLICY "Admins can manage pricing plans"
  ON pricing_plans FOR ALL
  USING (auth.role() = 'authenticated');
