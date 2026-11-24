-- ============================================================================
-- AL AMIN Portfolio OS — Supabase Migration 005:
-- Universal Version History, Immutable Audit Trail & Server-Side Scheduled Publishing
-- Target: PostgreSQL 15+ (Supabase)
-- Guarantees:
--   1. Every content module records full version history (content_id, content_type,
--      previous_version, new_version, admin_id, updated_timestamp, change_summary).
--   2. content_version_history and admin_audit_logs are strictly append-only (UPDATE/DELETE blocked).
--   3. Public visitors ONLY read rows where status = 'published' (never status = 'scheduled').
--   4. Scheduled publishing runs strictly server-side via publish_due_scheduled_content()
--      scheduled through Supabase Cron (pg_cron) or an authorized cron Edge Function,
--      never depending on a visitor opening the website.
--   5. Previous published versions are preserved atomically on every update/publish/restore.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Universal Version History Table (All Content Modules)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_version_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  content_type text NOT NULL,
  version_number int NOT NULL DEFAULT 1,
  action text NOT NULL CHECK (
    action IN (
      'create',
      'update',
      'publish',
      'schedule',
      'scheduled_publish',
      'archive',
      'restore',
      'delete'
    )
  ),
  previous_version jsonb,
  new_version jsonb,
  previous_status text NOT NULL DEFAULT '',
  new_status text NOT NULL DEFAULT '',
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text NOT NULL DEFAULT '',
  updated_timestamp timestamptz NOT NULL DEFAULT now(),
  change_summary text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_cvh_type_id_ver
  ON public.content_version_history (content_type, content_id, version_number DESC);

CREATE INDEX IF NOT EXISTS idx_cvh_updated_ts
  ON public.content_version_history (updated_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_cvh_admin_id
  ON public.content_version_history (admin_id, updated_timestamp DESC);

ALTER TABLE public.content_version_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read content_version_history" ON public.content_version_history;
CREATE POLICY "Admins read content_version_history"
  ON public.content_version_history FOR SELECT
  TO authenticated
  USING (public.is_authorized_admin());

DROP POLICY IF EXISTS "Admins insert content_version_history" ON public.content_version_history;
CREATE POLICY "Admins insert content_version_history"
  ON public.content_version_history FOR INSERT
  TO authenticated
  WITH CHECK (public.is_authorized_admin());

-- Harden admin_audit_logs so audit logs are strictly read + append-only
DROP POLICY IF EXISTS "Admins manage admin_audit_logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Admins read admin_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "Admins read admin_audit_logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_authorized_admin());

DROP POLICY IF EXISTS "Admins insert admin_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "Admins insert admin_audit_logs"
  ON public.admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_authorized_admin());

-- Block silent UPDATE or DELETE on both history & audit logs
CREATE OR REPLACE FUNCTION public.prevent_history_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION '% is append-only and cannot be modified or deleted', TG_TABLE_NAME;
END;
$$;

DROP TRIGGER IF EXISTS trg_immutable_content_version_history ON public.content_version_history;
CREATE TRIGGER trg_immutable_content_version_history
  BEFORE UPDATE OR DELETE ON public.content_version_history
  FOR EACH ROW EXECUTE FUNCTION public.prevent_history_mutation();

DROP TRIGGER IF EXISTS trg_immutable_admin_audit_logs ON public.admin_audit_logs;
CREATE TRIGGER trg_immutable_admin_audit_logs
  BEFORE UPDATE OR DELETE ON public.admin_audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_history_mutation();

-- ----------------------------------------------------------------------------
-- 2. Ensure Scheduled Status, publish_at, published_at & last_change_summary
--    Exist Across All 30 Content & Feature Tables + Tighten Public RLS
-- ----------------------------------------------------------------------------
ALTER TABLE public.page_sections
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_change_summary text NOT NULL DEFAULT '';

ALTER TABLE public.page_sections DROP CONSTRAINT IF EXISTS page_sections_status_check;
ALTER TABLE public.page_sections
  ADD CONSTRAINT page_sections_status_check
  CHECK (status IN ('draft', 'published', 'scheduled', 'archived'));

ALTER TABLE public.page_builder_versions DROP CONSTRAINT IF EXISTS page_builder_versions_status_check;
ALTER TABLE public.page_builder_versions
  ADD CONSTRAINT page_builder_versions_status_check
  CHECK (status IN ('draft', 'published', 'scheduled'));

DO $$
DECLARE
  tbl text;
  all_tables text[] := ARRAY[
    'profile', 'projects', 'skills', 'services', 'experiences', 'certificates',
    'blog_posts', 'testimonials', 'faqs', 'social_links', 'site_pages',
    'navigation_items', 'office_areas', 'workspace_objects', 'tour_steps',
    'career_knowledge', 'requirement_rules', 'resume_matcher_rules',
    'project_recommendations', 'project_dependencies', 'github_settings',
    'coding_activity_settings', 'terminal_commands', 'technologies',
    'learning_items', 'coding_challenges', 'system_endpoints', 'achievements',
    'website_settings', 'page_sections'
  ];
BEGIN
  FOREACH tbl IN ARRAY all_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS publish_at timestamptz', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS published_at timestamptz', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS last_change_summary text NOT NULL DEFAULT ''''', tbl);

    IF tbl <> 'page_sections' THEN
      EXECUTE format('DROP POLICY IF EXISTS "Public read published %1$s" ON public.%1$s', tbl);
      EXECUTE format(
        'CREATE POLICY "Public read published %1$s" ON public.%1$s FOR SELECT TO anon, authenticated USING (status = ''published'')',
        tbl
      );
    END IF;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 3. Publish Timestamp & Schedule Validation Trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_publish_timestamps()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'scheduled' AND NEW.publish_at IS NULL THEN
    RAISE EXCEPTION 'Scheduled publishing requires a valid publish_at timestamp for %', TG_TABLE_NAME;
  END IF;

  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    NEW.published_at := COALESCE(NEW.published_at, now());
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.last_change_summary IS NOT DISTINCT FROM OLD.last_change_summary THEN
    -- Prevent stale change summaries from carrying over on unrelated partial updates
    NEW.last_change_summary := '';
  END IF;

  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. Automatic Version History + Audit Trail Trigger Across All Content Modules
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.capture_content_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_content_type text := TG_TABLE_NAME;
  v_prev jsonb := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END;
  v_next jsonb := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END;
  v_content_id text := COALESCE((CASE WHEN TG_OP = 'DELETE' THEN v_prev->>'id' ELSE v_next->>'id' END), '');
  v_prev_status text := COALESCE(v_prev->>'status', '');
  v_next_status text := COALESCE(v_next->>'status', '');
  v_actor_source text := COALESCE(NULLIF(current_setting('app.actor_source', true), ''), 'admin_ui');
  v_action_override text := NULLIF(current_setting('app.action_override', true), '');
  v_ctx_summary text := NULLIF(trim(COALESCE(current_setting('app.change_summary', true), '')), '');
  v_row_summary text := NULLIF(trim(COALESCE(v_next->>'last_change_summary', '')), '');
  v_summary text;
  v_action text;
  v_admin_id uuid := auth.uid();
  v_admin_email text := '';
  v_next_ver int := 1;
  v_title text := COALESCE(
    NULLIF(v_next->>'title', ''),
    NULLIF(v_next->>'name', ''),
    NULLIF(v_next->>'position', ''),
    NULLIF(v_next->>'question', ''),
    NULLIF(v_next->>'label', ''),
    NULLIF(v_next->>'platform', ''),
    NULLIF(v_next->>'command', ''),
    NULLIF(v_next->>'technology', ''),
    NULLIF(v_next->>'client_name', ''),
    NULLIF(v_next->>'website_name', ''),
    NULLIF(v_next->>'slug', ''),
    NULLIF(v_prev->>'title', ''),
    NULLIF(v_prev->>'name', ''),
    v_content_id
  );
BEGIN
  IF v_admin_id IS NOT NULL THEN
    SELECT COALESCE(email, '') INTO v_admin_email
    FROM public.admin_users
    WHERE user_id = v_admin_id
    LIMIT 1;
  ELSIF v_actor_source = 'supabase_cron' THEN
    v_admin_email := 'system-cron@supabase.pg_cron';
  ELSE
    v_admin_email := 'system';
  END IF;

  IF v_action_override IS NOT NULL AND v_action_override IN ('create','update','publish','schedule','scheduled_publish','archive','restore','delete') THEN
    v_action := v_action_override;
  ELSIF TG_OP = 'INSERT' THEN
    v_action := CASE
      WHEN v_next_status = 'published' THEN 'publish'
      WHEN v_next_status = 'scheduled' THEN 'schedule'
      ELSE 'create'
    END;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
  ELSIF v_actor_source IN ('supabase_cron', 'admin_manual_cron_trigger')
        AND v_prev_status = 'scheduled'
        AND v_next_status = 'published' THEN
    v_action := 'scheduled_publish';
  ELSIF v_next_status = 'published' AND v_prev_status IS DISTINCT FROM 'published' THEN
    v_action := 'publish';
  ELSIF v_next_status = 'scheduled' AND v_prev_status IS DISTINCT FROM 'scheduled' THEN
    v_action := 'schedule';
  ELSIF v_next_status = 'archived' AND v_prev_status IS DISTINCT FROM 'archived' THEN
    v_action := 'archive';
  ELSE
    v_action := 'update';
  END IF;

  v_summary := COALESCE(
    v_ctx_summary,
    v_row_summary,
    CASE v_action
      WHEN 'scheduled_publish' THEN format('Server-side scheduled publish of "%s" in %s', v_title, v_content_type)
      WHEN 'publish' THEN format('Published "%s" in %s', v_title, v_content_type)
      WHEN 'schedule' THEN format('Scheduled "%s" in %s for %s', v_title, v_content_type, COALESCE(v_next->>'publish_at', 'future publish'))
      WHEN 'archive' THEN format('Archived "%s" in %s', v_title, v_content_type)
      WHEN 'restore' THEN format('Restored previous version of "%s" in %s', v_title, v_content_type)
      WHEN 'delete' THEN format('Deleted "%s" from %s', v_title, v_content_type)
      WHEN 'create' THEN format('Created "%s" in %s', v_title, v_content_type)
      ELSE
        CASE WHEN v_prev_status = 'published'
          THEN format('Updated published "%s" in %s (previous published version preserved)', v_title, v_content_type)
          ELSE format('Updated "%s" in %s', v_title, v_content_type)
        END
    END
  );

  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_next_ver
  FROM public.content_version_history
  WHERE content_type = v_content_type
    AND content_id = v_content_id;

  INSERT INTO public.content_version_history (
    content_id,
    content_type,
    version_number,
    action,
    previous_version,
    new_version,
    previous_status,
    new_status,
    admin_id,
    admin_email,
    updated_timestamp,
    change_summary
  ) VALUES (
    v_content_id,
    v_content_type,
    v_next_ver,
    v_action,
    v_prev,
    v_next,
    v_prev_status,
    v_next_status,
    v_admin_id,
    v_admin_email,
    now(),
    v_summary
  );

  INSERT INTO public.admin_audit_logs (
    admin_user_id,
    admin_email,
    action,
    module,
    record_id,
    summary,
    details,
    created_at
  ) VALUES (
    v_admin_id,
    v_admin_email,
    v_action,
    v_content_type,
    v_content_id,
    v_summary,
    jsonb_build_object(
      'version_number', v_next_ver,
      'previous_status', v_prev_status,
      'new_status', v_next_status,
      'actor_source', v_actor_source
    ),
    now()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DO $$
DECLARE
  tbl text;
  all_tables text[] := ARRAY[
    'profile', 'projects', 'skills', 'services', 'experiences', 'certificates',
    'blog_posts', 'testimonials', 'faqs', 'social_links', 'site_pages',
    'navigation_items', 'office_areas', 'workspace_objects', 'tour_steps',
    'career_knowledge', 'requirement_rules', 'resume_matcher_rules',
    'project_recommendations', 'project_dependencies', 'github_settings',
    'coding_activity_settings', 'terminal_commands', 'technologies',
    'learning_items', 'coding_challenges', 'system_endpoints', 'achievements',
    'website_settings', 'page_sections'
  ];
BEGIN
  FOREACH tbl IN ARRAY all_tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_sync_publish_ts_%1$s ON public.%1$s', tbl);
    EXECUTE format(
      'CREATE TRIGGER trg_sync_publish_ts_%1$s BEFORE INSERT OR UPDATE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.sync_publish_timestamps()',
      tbl
    );

    EXECUTE format('DROP TRIGGER IF EXISTS trg_capture_version_%1$s ON public.%1$s', tbl);
    EXECUTE format(
      'CREATE TRIGGER trg_capture_version_%1$s AFTER INSERT OR UPDATE OR DELETE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.capture_content_version()',
      tbl
    );
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 5. Server-Side Scheduled Publishing Function (Supabase Cron / Backend RPC)
--    Never relies on public visitors opening the website.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.publish_due_scheduled_content()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tbl text;
  v_row_count int;
  v_total int := 0;
  v_breakdown jsonb := '{}'::jsonb;
  v_tables text[] := ARRAY[
    'profile', 'projects', 'skills', 'services', 'experiences', 'certificates',
    'blog_posts', 'testimonials', 'faqs', 'social_links', 'site_pages',
    'navigation_items', 'office_areas', 'workspace_objects', 'tour_steps',
    'career_knowledge', 'requirement_rules', 'resume_matcher_rules',
    'project_recommendations', 'project_dependencies', 'github_settings',
    'coding_activity_settings', 'terminal_commands', 'technologies',
    'learning_items', 'coding_challenges', 'system_endpoints', 'achievements',
    'website_settings', 'page_sections'
  ];
BEGIN
  IF current_user NOT IN ('postgres', 'supabase_admin', 'service_role')
     AND NOT public.is_authorized_admin() THEN
    RAISE EXCEPTION 'Unauthorized: scheduled publisher requires trusted server cron, service role, or active admin';
  END IF;

  PERFORM set_config(
    'app.actor_source',
    CASE WHEN auth.uid() IS NULL THEN 'supabase_cron' ELSE 'admin_manual_cron_trigger' END,
    true
  );
  PERFORM set_config(
    'app.change_summary',
    'Scheduled publishing executed automatically by server scheduler',
    true
  );

  FOREACH tbl IN ARRAY v_tables LOOP
    EXECUTE format(
      'UPDATE public.%1$I SET status = ''published'', published_at = COALESCE(published_at, now()), last_change_summary = $1 WHERE status = ''scheduled'' AND publish_at IS NOT NULL AND publish_at <= now()',
      tbl
    ) USING 'Scheduled publishing executed automatically by server scheduler';

    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count > 0 THEN
      v_total := v_total + v_row_count;
      v_breakdown := v_breakdown || jsonb_build_object(tbl, v_row_count);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'executed_at', now(),
    'published_count', v_total,
    'tables', v_breakdown
  );
END;
$$;

REVOKE ALL ON FUNCTION public.publish_due_scheduled_content() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_due_scheduled_content() TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 6. Safe Restore RPC (Preserves Current Version in History Before Restoring)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.restore_content_version(
  p_version_id uuid,
  p_target_status text DEFAULT 'draft',
  p_change_summary text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hist public.content_version_history%ROWTYPE;
  v_snapshot jsonb;
  v_set_clause text;
  v_col_list text;
  v_summary text;
  v_allowed_tables text[] := ARRAY[
    'profile', 'projects', 'skills', 'services', 'experiences', 'certificates',
    'blog_posts', 'testimonials', 'faqs', 'social_links', 'site_pages',
    'navigation_items', 'office_areas', 'workspace_objects', 'tour_steps',
    'career_knowledge', 'requirement_rules', 'resume_matcher_rules',
    'project_recommendations', 'project_dependencies', 'github_settings',
    'coding_activity_settings', 'terminal_commands', 'technologies',
    'learning_items', 'coding_challenges', 'system_endpoints', 'achievements',
    'website_settings', 'page_sections'
  ];
BEGIN
  IF NOT public.is_authorized_admin() THEN
    RAISE EXCEPTION 'Unauthorized: active administrator required to restore versions';
  END IF;

  IF p_target_status NOT IN ('draft', 'published') THEN
    RAISE EXCEPTION 'Target restore status must be draft or published';
  END IF;

  SELECT * INTO v_hist
  FROM public.content_version_history
  WHERE id = p_version_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Version snapshot % not found', p_version_id;
  END IF;

  IF NOT (v_hist.content_type = ANY(v_allowed_tables)) THEN
    RAISE EXCEPTION 'Unsupported content_type %', v_hist.content_type;
  END IF;

  v_snapshot := COALESCE(v_hist.new_version, v_hist.previous_version);
  IF v_snapshot IS NULL THEN
    RAISE EXCEPTION 'Selected history record contains no restorable payload';
  END IF;

  v_summary := COALESCE(
    NULLIF(trim(COALESCE(p_change_summary, '')), ''),
    format('Restored v%s (%s) as %s', v_hist.version_number, v_hist.content_type, p_target_status)
  );

  PERFORM set_config('app.action_override', 'restore', true);
  PERFORM set_config('app.change_summary', v_summary, true);
  PERFORM set_config('app.actor_source', 'admin_ui', true);

  SELECT
    string_agg(format('%1$I = r.%1$I', column_name), ', '),
    string_agg(format('%1$I', column_name), ', ')
  INTO v_set_clause, v_col_list
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = v_hist.content_type
    AND column_name NOT IN ('id', 'created_at', 'updated_at', 'status', 'published_at', 'last_change_summary');

  EXECUTE format(
    'UPDATE public.%1$I t SET %2$s, status = $2, published_at = CASE WHEN $2 = ''published'' THEN COALESCE(t.published_at, now()) ELSE t.published_at END, last_change_summary = $3 FROM jsonb_populate_record(NULL::public.%1$I, $1) r WHERE t.id::text = $4',
    v_hist.content_type,
    v_set_clause
  ) USING v_snapshot, p_target_status, v_summary, v_hist.content_id;

  IF NOT FOUND THEN
    EXECUTE format(
      'INSERT INTO public.%1$I (id, %2$s, status, last_change_summary) SELECT r.id, %3$s, $2, $3 FROM jsonb_populate_record(NULL::public.%1$I, $1) r',
      v_hist.content_type,
      v_col_list,
      (SELECT string_agg(format('r.%1$I', column_name), ', ')
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = v_hist.content_type
         AND column_name NOT IN ('id', 'created_at', 'updated_at', 'status', 'published_at', 'last_change_summary'))
    ) USING v_snapshot, p_target_status, v_summary;
  END IF;

  RETURN jsonb_build_object(
    'restored', true,
    'content_type', v_hist.content_type,
    'content_id', v_hist.content_id,
    'from_version', v_hist.version_number,
    'status', p_target_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.restore_content_version(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.restore_content_version(uuid, text, text) TO authenticated;

-- ----------------------------------------------------------------------------
-- 7. Scheduler Diagnostics & Cross-Module Scheduled Queue RPC (Admin Only)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_scheduler_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pg_cron_installed boolean := false;
  v_job_active boolean := false;
  v_job_schedule text := '';
  v_due_count int := 0;
  v_upcoming_count int := 0;
  v_tbl text;
  v_c1 int;
  v_c2 int;
  v_tables text[] := ARRAY[
    'profile', 'projects', 'skills', 'services', 'experiences', 'certificates',
    'blog_posts', 'testimonials', 'faqs', 'social_links', 'site_pages',
    'navigation_items', 'office_areas', 'workspace_objects', 'tour_steps',
    'career_knowledge', 'requirement_rules', 'resume_matcher_rules',
    'project_recommendations', 'project_dependencies', 'github_settings',
    'coding_activity_settings', 'terminal_commands', 'technologies',
    'learning_items', 'coding_challenges', 'system_endpoints', 'achievements',
    'website_settings', 'page_sections'
  ];
BEGIN
  IF NOT public.is_authorized_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') INTO v_pg_cron_installed;
  IF v_pg_cron_installed THEN
    BEGIN
      EXECUTE 'SELECT active, schedule FROM cron.job WHERE jobname = ''alamin-publish-scheduled-content'' LIMIT 1'
        INTO v_job_active, v_job_schedule;
    EXCEPTION WHEN OTHERS THEN
      v_job_active := false;
    END;
  END IF;

  FOREACH tbl IN ARRAY v_tables LOOP
    EXECUTE format(
      'SELECT COUNT(*) FILTER (WHERE status = ''scheduled'' AND publish_at IS NOT NULL AND publish_at <= now()), COUNT(*) FILTER (WHERE status = ''scheduled'' AND publish_at IS NOT NULL AND publish_at > now()) FROM public.%I',
      tbl
    ) INTO v_c1, v_c2;
    v_due_count := v_due_count + COALESCE(v_c1, 0);
    v_upcoming_count := v_upcoming_count + COALESCE(v_c2, 0);
  END LOOP;

  RETURN jsonb_build_object(
    'server_time', now(),
    'pg_cron_installed', v_pg_cron_installed,
    'cron_job_active', COALESCE(v_job_active, false),
    'cron_schedule', COALESCE(v_job_schedule, ''),
    'due_count', v_due_count,
    'upcoming_count', v_upcoming_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_scheduler_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_scheduler_status() TO authenticated;

CREATE OR REPLACE FUNCTION public.list_scheduled_content()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tbl text;
  v_rows jsonb := '[]'::jsonb;
  v_part jsonb;
  v_tables text[] := ARRAY[
    'profile', 'projects', 'skills', 'services', 'experiences', 'certificates',
    'blog_posts', 'testimonials', 'faqs', 'social_links', 'site_pages',
    'navigation_items', 'office_areas', 'workspace_objects', 'tour_steps',
    'career_knowledge', 'requirement_rules', 'resume_matcher_rules',
    'project_recommendations', 'project_dependencies', 'github_settings',
    'coding_activity_settings', 'terminal_commands', 'technologies',
    'learning_items', 'coding_challenges', 'system_endpoints', 'achievements',
    'website_settings', 'page_sections'
  ];
BEGIN
  IF NOT public.is_authorized_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  FOREACH tbl IN ARRAY v_tables LOOP
    EXECUTE format(
      'SELECT COALESCE(jsonb_agg(jsonb_build_object(
         ''content_type'', %L,
         ''content_id'', id::text,
         ''label'', COALESCE(NULLIF(to_jsonb(t)->>''title'', ''''), NULLIF(to_jsonb(t)->>''name'', ''''), NULLIF(to_jsonb(t)->>''position'', ''''), NULLIF(to_jsonb(t)->>''question'', ''''), NULLIF(to_jsonb(t)->>''label'', ''''), NULLIF(to_jsonb(t)->>''platform'', ''''), NULLIF(to_jsonb(t)->>''command'', ''''), NULLIF(to_jsonb(t)->>''technology'', ''''), NULLIF(to_jsonb(t)->>''client_name'', ''''), NULLIF(to_jsonb(t)->>''website_name'', ''''), id::text),
         ''publish_at'', publish_at,
         ''updated_at'', updated_at,
         ''page_slug'', COALESCE(to_jsonb(t)->>''page_slug'', '''')
       )), ''[]''::jsonb)
       FROM public.%1$I t WHERE status = ''scheduled''',
      tbl, tbl
    ) INTO v_part;
    v_rows := v_rows || COALESCE(v_part, '[]'::jsonb);
  END LOOP;

  RETURN v_rows;
END;
$$;

REVOKE ALL ON FUNCTION public.list_scheduled_content() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_scheduled_content() TO authenticated;

-- ----------------------------------------------------------------------------
-- 8. Register Supabase pg_cron Job Every Minute (Graceful if pg_cron disabled)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    BEGIN
      PERFORM cron.unschedule('alamin-publish-scheduled-content');
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    PERFORM cron.schedule(
      'alamin-publish-scheduled-content',
      '* * * * *',
      $cron$SELECT public.publish_due_scheduled_content();$cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron not enabled yet (%). Enable pg_cron in Supabase Dashboard -> Extensions or deploy supabase/functions/publish-scheduled-content with a cron trigger.', SQLERRM;
END $$;
