-- ============================================================================
-- AL AMIN Portfolio OS — Supabase Migration 004: Visual Website Builder (Phase 66)
-- Structured storage for visual page sections and version snapshots.
-- Enforces strict RLS:
--   - Public visitors read ONLY enabled + published sections.
--   - Authenticated active admins verified via is_authorized_admin() manage all drafts,
--     published sections, and version history snapshots.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL DEFAULT 'index.html',
  section_key text NOT NULL DEFAULT '',
  section_type text NOT NULL CHECK (
    section_type IN (
      'hero', 'about', 'skills', 'services', 'projects', 'experience',
      'statistics', 'testimonials', 'blog', 'faq', 'contact', 'cta',
      'logo_grid', 'image_gallery', 'video', 'custom_content'
    )
  ),
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  style_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  layout_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  animation_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility_config jsonb NOT NULL DEFAULT '{"desktop":true,"tablet":true,"mobile":true}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_sections_slug_order
  ON public.page_sections (page_slug, sort_order ASC);

CREATE TABLE IF NOT EXISTS public.page_builder_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  version_number int NOT NULL DEFAULT 1,
  version_label text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  snapshot_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_builder_versions_slug_created
  ON public.page_builder_versions (page_slug, created_at DESC);

ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_builder_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published enabled page_sections" ON public.page_sections;
CREATE POLICY "Public read published enabled page_sections"
  ON public.page_sections FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND enabled = true);

DROP POLICY IF EXISTS "Admins manage page_sections" ON public.page_sections;
CREATE POLICY "Admins manage page_sections"
  ON public.page_sections FOR ALL
  TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());

DROP POLICY IF EXISTS "Admins manage page_builder_versions" ON public.page_builder_versions;
CREATE POLICY "Admins manage page_builder_versions"
  ON public.page_builder_versions FOR ALL
  TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());

DROP TRIGGER IF EXISTS trg_touch_page_sections ON public.page_sections;
CREATE TRIGGER trg_touch_page_sections
  BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
