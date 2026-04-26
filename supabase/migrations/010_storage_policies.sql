-- Migration 010 — Storage buckets + RLS policies
--
-- Creates the three buckets used by the app (public read, authenticated write).
-- Without these, any storage.objects INSERT throws "new row violates row-level
-- security policy" because no policy grants the upload.

-- ─── Buckets ─────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars',            'avatars',            true),
  ('property-images',    'property-images',    true),
  ('maintenance-images', 'maintenance-images', true)
ON CONFLICT (id) DO NOTHING;

-- ─── avatars ─────────────────────────────────────────────────────────────────
CREATE POLICY "avatars: authenticated upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars: authenticated update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "avatars: public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND owner = auth.uid());

-- ─── property-images ─────────────────────────────────────────────────────────
CREATE POLICY "property-images: authenticated upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "property-images: authenticated update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'property-images' AND owner = auth.uid());

CREATE POLICY "property-images: public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'property-images');

CREATE POLICY "property-images: owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'property-images' AND owner = auth.uid());

-- ─── maintenance-images ──────────────────────────────────────────────────────
CREATE POLICY "maintenance-images: authenticated upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'maintenance-images');

CREATE POLICY "maintenance-images: authenticated update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'maintenance-images' AND owner = auth.uid());

CREATE POLICY "maintenance-images: public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'maintenance-images');

CREATE POLICY "maintenance-images: owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'maintenance-images' AND owner = auth.uid());
