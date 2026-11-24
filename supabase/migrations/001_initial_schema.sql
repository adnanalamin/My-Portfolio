-- ============================================================================
-- AL AMIN Portfolio OS — Supabase Migration 001: Core Schema & Row Level Security
-- Target: PostgreSQL 15+ (Supabase)
-- Security Model:
--   1. Public visitors (anon) can ONLY read published, active, visible content.
--   2. Contact submissions allow public INSERT with strict constraints, NO public SELECT/UPDATE/DELETE.
--   3. Admin authorization is enforced exclusively at DB level via public.admin_users + is_authorized_admin().
--   4. Passwords and tokens are NEVER stored in custom tables (handled by Supabase Auth).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Admin Authorization Table & Security Definer Guard
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT 'AL AMIN',
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_authorized_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
      AND au.is_active = true
      AND au.role IN ('admin', 'super_admin')
  );
$$;

REVOKE ALL ON FUNCTION public.is_authorized_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_authorized_admin() TO anon, authenticated;

-- Admin users policies: never readable by public visitors; admins can read own/active roster
DROP POLICY IF EXISTS "Admins read admin roster" ON public.admin_users;
CREATE POLICY "Admins read admin roster"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND is_active = true);

DROP POLICY IF EXISTS "Super admins manage admin users" ON public.admin_users;
CREATE POLICY "Super admins manage admin users"
  ON public.admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = true AND au.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = true AND au.role = 'super_admin'
    )
  );

-- ----------------------------------------------------------------------------
-- 2. Shared Timestamp Trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Content Tables (Phase 62)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'AL AMIN',
  professional_title text NOT NULL DEFAULT 'Full-Stack Developer & Creative Designer',
  short_bio text NOT NULL DEFAULT '',
  full_bio text NOT NULL DEFAULT '',
  profile_image text NOT NULL DEFAULT 'assets/images/profile.jpg',
  location text NOT NULL DEFAULT 'Bangladesh',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  availability_status text NOT NULL DEFAULT 'freelance',
  resume_url text NOT NULL DEFAULT 'assets/documents/resume.pdf',
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  hero_headline text NOT NULL DEFAULT 'Full-Stack Developer & Creative Designer',
  hero_description text NOT NULL DEFAULT '',
  cta_buttons jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  short_description text NOT NULL DEFAULT '',
  full_description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Web Apps',
  project_type text NOT NULL DEFAULT 'Full-Stack Web Application',
  development_role text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '2026',
  technologies jsonb NOT NULL DEFAULT '[]'::jsonb,
  thumbnail text NOT NULL DEFAULT '',
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  live_demo_url text NOT NULL DEFAULT '',
  github_url text NOT NULL DEFAULT '',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  challenges jsonb NOT NULL DEFAULT '[]'::jsonb,
  solutions jsonb NOT NULL DEFAULT '[]'::jsonb,
  architecture jsonb NOT NULL DEFAULT '{}'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  publish_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Frontend',
  proficiency_level text NOT NULL DEFAULT 'Production',
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'code-2',
  related_projects jsonb NOT NULL DEFAULT '[]'::jsonb,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'layers',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  technology jsonb NOT NULL DEFAULT '[]'::jsonb,
  pricing_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position text NOT NULL,
  company text NOT NULL DEFAULT '',
  employment_type text NOT NULL DEFAULT 'Full-Time',
  section text NOT NULL DEFAULT 'Work Experience',
  start_date text NOT NULL DEFAULT '',
  end_date text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  responsibilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  technologies jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_current boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text NOT NULL DEFAULT '',
  issue_date text NOT NULL DEFAULT '',
  expiration_date text NOT NULL DEFAULT '',
  credential_id text NOT NULL DEFAULT '',
  verification_url text NOT NULL DEFAULT '',
  certificate_image text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Full-Stack',
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT 'AL AMIN',
  category text NOT NULL DEFAULT 'Web Development',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  publication_date text NOT NULL DEFAULT '',
  reading_time text NOT NULL DEFAULT '5 min read',
  seo_title text NOT NULL DEFAULT '',
  meta_description text NOT NULL DEFAULT '',
  related_slugs jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  publish_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_role text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  client_image text NOT NULL DEFAULT '',
  testimonial_text text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  project_reference text NOT NULL DEFAULT '',
  is_demo boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'globe',
  display_order int NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. Pages & Feature Management Tables (Phase 63)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  visible boolean NOT NULL DEFAULT true,
  nav_visible boolean NOT NULL DEFAULT true,
  is_system boolean NOT NULL DEFAULT false,
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement text NOT NULL DEFAULT 'main' CHECK (placement IN ('main', 'footer', 'dropdown')),
  label text NOT NULL,
  href text NOT NULL,
  icon text NOT NULL DEFAULT 'link',
  is_external boolean NOT NULL DEFAULT false,
  parent_label text NOT NULL DEFAULT '',
  display_order int NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.office_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name text NOT NULL,
  object_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'monitor',
  image_url text NOT NULL DEFAULT '',
  destination_url text NOT NULL DEFAULT 'projects.html',
  display_order int NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspace_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_key text UNIQUE NOT NULL,
  object_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  position_x numeric NOT NULL DEFAULT 0,
  position_y numeric NOT NULL DEFAULT 0,
  position_z numeric NOT NULL DEFAULT 0,
  destination_url text NOT NULL DEFAULT 'projects.html',
  visible boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tour_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_title text NOT NULL DEFAULT 'AL AMIN Interactive Portfolio Tour',
  tour_description text NOT NULL DEFAULT '',
  step_title text NOT NULL,
  step_description text NOT NULL DEFAULT '',
  step_image text NOT NULL DEFAULT '',
  hotspot_label text NOT NULL DEFAULT '',
  destination_url text NOT NULL DEFAULT 'index.html',
  step_order int NOT NULL DEFAULT 1,
  visible boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.career_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_projects jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  category text NOT NULL DEFAULT 'Overview',
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.requirement_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type text NOT NULL CHECK (rule_type IN ('category', 'technology', 'feature', 'complexity', 'risk', 'phase')),
  rule_key text NOT NULL,
  label text NOT NULL,
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  config_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resume_matcher_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  related_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_projects jsonb NOT NULL DEFAULT '[]'::jsonb,
  weight numeric NOT NULL DEFAULT 1,
  explanation text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug text NOT NULL,
  recommendation_tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_projects jsonb NOT NULL DEFAULT '[]'::jsonb,
  technologies jsonb NOT NULL DEFAULT '[]'::jsonb,
  category text NOT NULL DEFAULT 'SaaS',
  weight numeric NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug text UNIQUE NOT NULL,
  project_title text NOT NULL,
  frontend jsonb NOT NULL DEFAULT '[]'::jsonb,
  backend jsonb NOT NULL DEFAULT '[]'::jsonb,
  database_layer jsonb NOT NULL DEFAULT '[]'::jsonb,
  authentication jsonb NOT NULL DEFAULT '[]'::jsonb,
  storage jsonb NOT NULL DEFAULT '[]'::jsonb,
  apis jsonb NOT NULL DEFAULT '[]'::jsonb,
  deployment jsonb NOT NULL DEFAULT '[]'::jsonb,
  security jsonb NOT NULL DEFAULT '[]'::jsonb,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.github_settings (
  id int PRIMARY KEY DEFAULT 1,
  username text NOT NULL DEFAULT 'octocat',
  visibility_mode text NOT NULL DEFAULT 'public_only',
  hidden_repos jsonb NOT NULL DEFAULT '[]'::jsonb,
  featured_repos jsonb NOT NULL DEFAULT '[]'::jsonb,
  exclude_forks boolean NOT NULL DEFAULT true,
  display_limit int NOT NULL DEFAULT 12,
  cache_minutes int NOT NULL DEFAULT 15,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coding_activity_settings (
  id int PRIMARY KEY DEFAULT 1,
  display_enabled boolean NOT NULL DEFAULT true,
  event_types jsonb NOT NULL DEFAULT '["PushEvent","PullRequestEvent","IssuesEvent","CreateEvent","ReleaseEvent"]'::jsonb,
  repo_filters jsonb NOT NULL DEFAULT '[]'::jsonb,
  refresh_interval_sec int NOT NULL DEFAULT 300,
  display_limit int NOT NULL DEFAULT 8,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.terminal_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  command text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  alias text NOT NULL DEFAULT '',
  response_type text NOT NULL DEFAULT 'text' CHECK (response_type IN ('text', 'route', 'list', 'action')),
  response_payload text NOT NULL DEFAULT '',
  destination_url text NOT NULL DEFAULT '',
  visible boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quadrant text NOT NULL DEFAULT 'Frontend' CHECK (quadrant IN ('Frontend', 'Backend', 'Database', 'DevOps / Tools')),
  ring text NOT NULL DEFAULT 'Core' CHECK (ring IN ('Core', 'Active', 'Learning', 'Exploring')),
  description text NOT NULL DEFAULT '',
  related_projects jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technology text NOT NULL,
  category text NOT NULL DEFAULT 'Frontend',
  current_status text NOT NULL DEFAULT 'Active' CHECK (current_status IN ('Completed', 'Active', 'Planned', 'Exploring')),
  progress int CHECK (progress IS NULL OR (progress BETWEEN 0 AND 100)),
  resources jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_project text NOT NULL DEFAULT '',
  related_project_id text NOT NULL DEFAULT '',
  learning_objective text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coding_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'Core',
  category text NOT NULL DEFAULT 'JavaScript' CHECK (category IN ('HTML', 'CSS', 'JavaScript')),
  starter_html text NOT NULL DEFAULT '',
  starter_css text NOT NULL DEFAULT '',
  starter_js text NOT NULL DEFAULT '',
  hints jsonb NOT NULL DEFAULT '[]'::jsonb,
  test_cases jsonb NOT NULL DEFAULT '[]'::jsonb,
  solution_code text NOT NULL DEFAULT '',
  solution_explanation text NOT NULL DEFAULT '',
  visible boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Portfolio Pages',
  check_interval_sec int NOT NULL DEFAULT 60,
  enabled boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Engineering',
  issuer text NOT NULL DEFAULT '',
  achieved_date text NOT NULL DEFAULT '',
  credential_id text NOT NULL DEFAULT '',
  verification_url text NOT NULL DEFAULT '',
  badge_image text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  is_verified boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. Media, Settings, Submissions & Security Tables (Phase 64)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  storage_path text UNIQUE NOT NULL,
  public_url text NOT NULL DEFAULT '',
  mime_type text NOT NULL,
  file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760),
  alt_text text NOT NULL DEFAULT '',
  asset_kind text NOT NULL DEFAULT 'image' CHECK (asset_kind IN ('image', 'document', 'certificate', 'resume')),
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.website_settings (
  id int PRIMARY KEY DEFAULT 1,
  website_name text NOT NULL DEFAULT 'AL AMIN Portfolio',
  website_logo text NOT NULL DEFAULT 'assets/icons/favicon.svg',
  favicon text NOT NULL DEFAULT 'assets/icons/favicon.svg',
  tagline text NOT NULL DEFAULT 'Full-Stack Developer & Creative Designer',
  default_theme text NOT NULL DEFAULT 'dark' CHECK (default_theme IN ('dark', 'light')),
  primary_color text NOT NULL DEFAULT '#6366F1',
  secondary_color text NOT NULL DEFAULT '#8B5CF6',
  accent_color text NOT NULL DEFAULT '#06B6D4',
  default_language text NOT NULL DEFAULT 'en',
  contact_email text NOT NULL DEFAULT 'your-email@example.com',
  footer_text text NOT NULL DEFAULT 'Engineering scalable web systems with refined interface craft.',
  copyright_text text NOT NULL DEFAULT 'AL AMIN. All rights reserved.',
  maintenance_mode boolean NOT NULL DEFAULT false,
  theme_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 180),
  subject text NOT NULL CHECK (char_length(trim(subject)) BETWEEN 3 AND 200),
  message text NOT NULL CHECK (char_length(trim(message)) BETWEEN 10 AND 4000),
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  source_page text NOT NULL DEFAULT 'contact.html',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text NOT NULL DEFAULT '',
  action text NOT NULL,
  module text NOT NULL,
  record_id text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  actor_email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'recorded',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. Apply Row Level Security Policies Across All Managed Tables
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  tbl text;
  public_tables text[] := ARRAY[
    'profile', 'projects', 'skills', 'services', 'experiences', 'certificates',
    'blog_posts', 'testimonials', 'faqs', 'social_links', 'site_pages',
    'navigation_items', 'office_areas', 'workspace_objects', 'tour_steps',
    'career_knowledge', 'requirement_rules', 'resume_matcher_rules',
    'project_recommendations', 'project_dependencies', 'github_settings',
    'coding_activity_settings', 'terminal_commands', 'technologies',
    'learning_items', 'coding_challenges', 'system_endpoints', 'achievements', 'website_settings'
  ];
BEGIN
  FOREACH tbl IN ARRAY public_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public read published %1$s" ON public.%1$s', tbl);
    IF tbl IN ('projects', 'blog_posts') THEN
      EXECUTE format(
        'CREATE POLICY "Public read published %1$s" ON public.%1$s FOR SELECT TO anon, authenticated USING (status = ''published'' OR (status = ''scheduled'' AND publish_at IS NOT NULL AND publish_at <= now()))',
        tbl
      );
    ELSE
      EXECUTE format(
        'CREATE POLICY "Public read published %1$s" ON public.%1$s FOR SELECT TO anon, authenticated USING (status = ''published'')',
        tbl
      );
    END IF;

    EXECUTE format('DROP POLICY IF EXISTS "Admins manage %1$s" ON public.%1$s', tbl);
    EXECUTE format(
      'CREATE POLICY "Admins manage %1$s" ON public.%1$s FOR ALL TO authenticated USING (public.is_authorized_admin()) WITH CHECK (public.is_authorized_admin())',
      tbl
    );
  END LOOP;
END $$;

-- Media Assets: public read allowed for uploaded assets; admin-only mutations
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read media metadata" ON public.media_assets;
CREATE POLICY "Public read media metadata"
  ON public.media_assets FOR SELECT
  TO anon, authenticated
  USING (true);
DROP POLICY IF EXISTS "Admins manage media_assets" ON public.media_assets;
CREATE POLICY "Admins manage media_assets"
  ON public.media_assets FOR ALL
  TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());

-- Contact Submissions: public can ONLY insert new unread messages; ONLY admins read/update/delete
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public submit contact message" ON public.contact_submissions;
CREATE POLICY "Public submit contact message"
  ON public.contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'unread');

DROP POLICY IF EXISTS "Admins read manage contact_submissions" ON public.contact_submissions;
CREATE POLICY "Admins read manage contact_submissions"
  ON public.contact_submissions FOR ALL
  TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());

-- Audit Logs & Security Events: admin-only read/insert (no public access)
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage admin_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "Admins manage admin_audit_logs"
  ON public.admin_audit_logs FOR ALL
  TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage security_events" ON public.security_events;
CREATE POLICY "Admins manage security_events"
  ON public.security_events FOR ALL
  TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());

-- Attach touch_updated_at trigger to tables with updated_at column
DO $$
DECLARE
  tbl text;
  ts_tables text[] := ARRAY[
    'admin_users', 'profile', 'projects', 'skills', 'services', 'experiences',
    'certificates', 'blog_posts', 'testimonials', 'faqs', 'social_links',
    'site_pages', 'navigation_items', 'office_areas', 'workspace_objects',
    'tour_steps', 'career_knowledge', 'requirement_rules', 'resume_matcher_rules',
    'project_recommendations', 'project_dependencies', 'github_settings',
    'coding_activity_settings', 'terminal_commands', 'technologies',
    'learning_items', 'coding_challenges', 'system_endpoints', 'achievements', 'website_settings'
  ];
BEGIN
  FOREACH tbl IN ARRAY ts_tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_touch_%1$s ON public.%1$s', tbl);
    EXECUTE format(
      'CREATE TRIGGER trg_touch_%1$s BEFORE UPDATE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()',
      tbl
    );
  END LOOP;
END $$;
