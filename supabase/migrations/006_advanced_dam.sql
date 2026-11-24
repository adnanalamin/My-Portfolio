-- ============================================================================
-- AL AMIN Portfolio OS — Supabase Migration 006: Advanced Digital Asset Management (Phase 68)
-- Adds media_folders hierarchy, rich DAM metadata on media_assets, executable upload guards,
-- expanded safe Storage bucket policies (Images, Videos, PDFs, Documents up to 50 MB),
-- and server-side published-content usage tracking RPC.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Media Folders Hierarchy
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 80),
  slug text NOT NULL,
  parent_id uuid REFERENCES public.media_folders(id) ON DELETE CASCADE,
  description text NOT NULL DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_media_folders_parent_name
  ON public.media_folders (COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(trim(name)));

ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage media_folders" ON public.media_folders;
CREATE POLICY "Admins manage media_folders"
  ON public.media_folders FOR ALL
  TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());

DROP TRIGGER IF EXISTS trg_media_folders_updated_at ON public.media_folders;
CREATE TRIGGER trg_media_folders_updated_at
  BEFORE UPDATE ON public.media_folders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed baseline DAM folders safely
INSERT INTO public.media_folders (name, slug, description)
VALUES
  ('Images', 'images', 'Portfolio thumbnails, hero artwork, avatars, and UI screenshots'),
  ('Videos', 'videos', 'Product demos, walkthrough recordings, and motion previews'),
  ('PDFs', 'pdfs', 'Resumes, case-study decks, and downloadable brochures'),
  ('Documents', 'documents', 'Markdown specs, notes, and text resources'),
  ('Certificates', 'certificates', 'Verified credentials and achievement badges')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Upgrade public.media_assets for Full DAM Capabilities
-- ----------------------------------------------------------------------------
ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES public.media_folders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS caption text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS width int,
  ADD COLUMN IF NOT EXISTS height int,
  ADD COLUMN IF NOT EXISTS duration_seconds numeric,
  ADD COLUMN IF NOT EXISTS optimization_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.media_assets DROP CONSTRAINT IF EXISTS media_assets_asset_kind_check;
ALTER TABLE public.media_assets
  ADD CONSTRAINT media_assets_asset_kind_check
  CHECK (asset_kind IN ('image', 'video', 'pdf', 'document', 'certificate', 'resume'));

ALTER TABLE public.media_assets DROP CONSTRAINT IF EXISTS media_assets_file_size_bytes_check;
ALTER TABLE public.media_assets
  ADD CONSTRAINT media_assets_file_size_bytes_check
  CHECK (file_size_bytes > 0 AND file_size_bytes <= 52428800);

CREATE INDEX IF NOT EXISTS idx_media_assets_folder_id ON public.media_assets (folder_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_asset_kind ON public.media_assets (asset_kind);
CREATE INDEX IF NOT EXISTS idx_media_assets_tags_gin ON public.media_assets USING gin (tags);

DROP TRIGGER IF EXISTS trg_media_assets_updated_at ON public.media_assets;
CREATE TRIGGER trg_media_assets_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-assign seeded folder_id for legacy uploads without a folder
UPDATE public.media_assets ma
SET folder_id = mf.id
FROM public.media_folders mf
WHERE ma.folder_id IS NULL
  AND (
    (ma.asset_kind = 'image' AND mf.slug = 'images') OR
    (ma.asset_kind = 'video' AND mf.slug = 'videos') OR
    (ma.asset_kind IN ('pdf', 'resume') AND mf.slug = 'pdfs') OR
    (ma.asset_kind = 'document' AND mf.slug = 'documents') OR
    (ma.asset_kind = 'certificate' AND mf.slug = 'certificates')
  );

-- ----------------------------------------------------------------------------
-- 3. Server-Side Guard Blocking Executable Uploads & Disallowed MIME Types
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_media_asset_safety()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  allowed_mimes text[] := ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'application/pdf',
    'text/plain', 'text/markdown', 'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
BEGIN
  IF NEW.file_name ~* '\.(exe|sh|bash|bat|cmd|ps1|js|mjs|cjs|php|py|rb|pl|dll|so|msi|html|htm|apk|app|vbs|scr|com|jar|wasm|svgz)$'
     OR NEW.storage_path ~* '\.(exe|sh|bash|bat|cmd|ps1|js|mjs|cjs|php|py|rb|pl|dll|so|msi|html|htm|apk|app|vbs|scr|com|jar|wasm|svgz)$' THEN
    RAISE EXCEPTION 'Executable, script, or HTML file uploads are strictly prohibited (%).', NEW.file_name;
  END IF;

  IF NOT (NEW.mime_type = ANY(allowed_mimes)) THEN
    RAISE EXCEPTION 'Disallowed media MIME type "%".', NEW.mime_type;
  END IF;

  IF NEW.file_size_bytes IS NULL OR NEW.file_size_bytes <= 0 OR NEW.file_size_bytes > 52428800 THEN
    RAISE EXCEPTION 'Media file size must be between 1 byte and 50 MB.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_media_asset_safety ON public.media_assets;
CREATE TRIGGER trg_validate_media_asset_safety
  BEFORE INSERT OR UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.validate_media_asset_safety();

-- ----------------------------------------------------------------------------
-- 4. Update Supabase Storage Bucket (50 MB limit + Safe MIME Allowlist) & RLS
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-media',
  'portfolio-media',
  true,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read portfolio-media" ON storage.objects;
CREATE POLICY "Public read portfolio-media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Admins upload portfolio-media" ON storage.objects;
CREATE POLICY "Admins upload portfolio-media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-media'
    AND public.is_authorized_admin()
    AND NOT (name ~* '\.(exe|sh|bash|bat|cmd|ps1|js|mjs|cjs|php|py|rb|pl|dll|so|msi|html|htm|apk|app|vbs|scr|com|jar|wasm|svgz)$')
  );

DROP POLICY IF EXISTS "Admins update portfolio-media" ON storage.objects;
CREATE POLICY "Admins update portfolio-media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio-media' AND public.is_authorized_admin())
  WITH CHECK (
    bucket_id = 'portfolio-media'
    AND public.is_authorized_admin()
    AND NOT (name ~* '\.(exe|sh|bash|bat|cmd|ps1|js|mjs|cjs|php|py|rb|pl|dll|so|msi|html|htm|apk|app|vbs|scr|com|jar|wasm|svgz)$')
  );

DROP POLICY IF EXISTS "Admins delete portfolio-media" ON storage.objects;
CREATE POLICY "Admins delete portfolio-media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio-media' AND public.is_authorized_admin());

-- ----------------------------------------------------------------------------
-- 5. Usage Tracking RPC (Checks Published & Draft Portfolio Content)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_media_usage(
  p_public_url text,
  p_storage_path text DEFAULT ''
)
RETURNS TABLE (
  module_table text,
  module_label text,
  record_id text,
  record_title text,
  record_status text,
  is_published boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url text := trim(COALESCE(p_public_url, ''));
  v_path text := trim(COALESCE(p_storage_path, ''));
  item record;
  sql_stmt text;
BEGIN
  IF NOT public.is_authorized_admin() THEN
    RAISE EXCEPTION 'Unauthorized: active admin role required.';
  END IF;

  IF v_url = '' AND v_path = '' THEN
    RETURN;
  END IF;

  FOR item IN
    SELECT * FROM (VALUES
      ('profile', 'Personal Profile', 'name'),
      ('projects', 'Projects', 'title'),
      ('blog_posts', 'Blog Posts', 'title'),
      ('certificates', 'Certificates', 'title'),
      ('testimonials', 'Testimonials', 'client_name'),
      ('achievements', 'Achievements', 'title'),
      ('website_settings', 'Website Settings', 'website_name'),
      ('services', 'Services', 'title'),
      ('experiences', 'Experiences', 'position'),
      ('office_areas', 'Digital Office', 'object_name'),
      ('workspace_objects', '3D Workspace', 'object_name'),
      ('tour_steps', 'Portfolio Tour', 'step_title'),
      ('site_pages', 'Site Pages', 'title'),
      ('page_sections', 'Visual Page Sections', 'title')
    ) AS t(tbl, lbl, title_col)
  LOOP
    sql_stmt := format(
      $q$
      SELECT
        %1$L::text AS module_table,
        %2$L::text AS module_label,
        r.id::text AS record_id,
        COALESCE(NULLIF(trim(r.%3$I::text), ''), r.id::text) AS record_title,
        COALESCE(r.status::text, 'published') AS record_status,
        (COALESCE(r.status::text, 'published') = 'published') AS is_published
      FROM public.%4$I r
      WHERE (
        (%5$L <> '' AND strpos(lower(to_jsonb(r)::text), lower(%5$L)) > 0)
        OR
        (%6$L <> '' AND strpos(lower(to_jsonb(r)::text), lower(%6$L)) > 0)
      )
      LIMIT 50
      $q$,
      item.tbl,
      item.lbl,
      item.title_col,
      item.tbl,
      v_url,
      v_path
    );
    RETURN QUERY EXECUTE sql_stmt;
  END LOOP;
END;
$$;
