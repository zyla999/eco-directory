-- Storage bucket and policies for logos
-- Run this in the Supabase SQL Editor

-- Create the logos bucket (public so images are accessible without auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  2097152,  -- 2MB
  ARRAY['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];

-- Allow anyone to read logos (they're public)
CREATE POLICY "Public read logos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'logos');

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated upload logos" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- Allow authenticated users to update/overwrite logos
CREATE POLICY "Authenticated update logos" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete logos
CREATE POLICY "Authenticated delete logos" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'logos' AND auth.role() = 'authenticated');
