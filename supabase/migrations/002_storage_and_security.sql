-- ============================================================================
-- AL AMIN Portfolio OS — Supabase Migration 002: Storage Bucket & Spam Protection
-- ============================================================================

-- 1. Create portfolio-media storage bucket (public read for published media, strict MIME & size limits)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-media',
  'portfolio-media',
  true,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'text/markdown'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies on storage.objects
DROP POLICY IF EXISTS "Public read portfolio-media" ON storage.objects;
CREATE POLICY "Public read portfolio-media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Admins upload portfolio-media" ON storage.objects;
CREATE POLICY "Admins upload portfolio-media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio-media' AND public.is_authorized_admin());

DROP POLICY IF EXISTS "Admins update portfolio-media" ON storage.objects;
CREATE POLICY "Admins update portfolio-media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio-media' AND public.is_authorized_admin())
  WITH CHECK (bucket_id = 'portfolio-media' AND public.is_authorized_admin());

DROP POLICY IF EXISTS "Admins delete portfolio-media" ON storage.objects;
CREATE POLICY "Admins delete portfolio-media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio-media' AND public.is_authorized_admin());

-- 2. Database-level spam protection for public contact_submissions
CREATE OR REPLACE FUNCTION public.prevent_contact_spam()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count int;
BEGIN
  -- Reject obvious script injection patterns or empty fields
  IF NEW.message ~* '<script\b|javascript:' THEN
    RAISE EXCEPTION 'Invalid characters detected in contact message.';
  END IF;

  -- Limit repeat submissions from same email within 60 seconds
  SELECT count(*) INTO recent_count
  FROM public.contact_submissions cs
  WHERE lower(cs.email) = lower(NEW.email)
    AND cs.created_at > now() - interval '60 seconds';

  IF recent_count >= 2 THEN
    RAISE EXCEPTION 'Please wait a minute before sending another inquiry.';
  END IF;

  NEW.status := 'unread';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_contact_spam ON public.contact_submissions;
CREATE TRIGGER trg_prevent_contact_spam
  BEFORE INSERT ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_contact_spam();

-- 3. Prevent accidental deletion of system pages unless explicitly archived or flagged
CREATE OR REPLACE FUNCTION public.protect_system_pages()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.is_system = true AND current_setting('app.allow_system_page_delete', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'System page "%" is protected. Unpublish/hide it instead of deleting.', OLD.slug;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_system_pages ON public.site_pages;
CREATE TRIGGER trg_protect_system_pages
  BEFORE DELETE ON public.site_pages
  FOR EACH ROW EXECUTE FUNCTION public.protect_system_pages();
