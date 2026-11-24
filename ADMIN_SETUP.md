# AL AMIN Portfolio OS — Supabase Admin CMS Setup Guide

Complete setup guide for connecting the centralized Admin CMS (`/admin/`) and live public portfolio hydration (`js/supabase-client.js`) to a free-tier Supabase project.

---

## 1. Architecture Overview

- **Public Portfolio**: Root `*.html` static pages powered by HTML5, CSS3, Tailwind CSS CDN, Vanilla ES2024 JS (`js/config.js`, `js/data/*`), with optional live Supabase hydration (`js/cache.js` → `js/supabase-client.js` → `js/data-service.js` → `js/content-loader.js`). When Supabase is unconfigured or offline, the public site falls back seamlessly to cached data or `window.PortfolioData`.
- **Admin CMS (`/admin/`)**: Dedicated Vanilla JS SaaS admin console secured via **Supabase Authentication** and **PostgreSQL Row Level Security (RLS)**.
- **Never expose `service_role` keys**: Only the **Project URL** and **public `anon` key** belong in `js/config.js` or browser localStorage.

---

## 2. Create a Supabase Project (Free Tier)

1. Sign in to [Supabase](https://supabase.com/) and click **New Project**.
2. Choose your organization, set a strong database password, and select a nearby region.
3. Open **Project Settings → API** and note:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **`anon` / `public` key** (safe for browser/public reads covered by RLS)

> Do **not** copy the `service_role` secret into any frontend file.

---

## 3. Run SQL Migrations (Tables, RLS, Storage, Triggers)

In your Supabase Dashboard, open **SQL Editor → New Query** and run these six scripts in exact order:

1. `supabase/migrations/001_initial_schema.sql`
   - Creates all portfolio content, feature, settings, media, inquiry, security, and audit log tables.
   - Creates `public.is_authorized_admin()` (`SECURITY DEFINER`) and enables strict RLS policies across every table.
2. `supabase/migrations/002_storage_and_security.sql`
   - Creates the `portfolio-media` Storage bucket (10 MB limit, safe image/SVG/PDF/TXT/Markdown MIME allowlist).
   - Configures admin-only Storage upload/update/delete policies.
   - Adds DB-level `prevent_contact_spam()` trigger on `contact_submissions` and `protect_system_pages()` trigger on `site_pages`.
3. `supabase/migrations/003_seed_initial_data.sql`
   - Seeds baseline `website_settings`, `profile`, `github_settings`, `coding_activity_settings`, core `projects`, and core `site_pages`.
4. `supabase/migrations/004_visual_page_builder.sql`
   - Creates `public.page_sections` (16-component CHECK constraint, structured JSONB config, public read restricted to `status = 'published' AND enabled = true`) and `public.page_builder_versions` (immutable version history snapshots for draft/publish/restore workflows).
5. `supabase/migrations/005_version_history_and_scheduled_publishing.sql`
   - Creates immutable `public.content_version_history` and enforces append-only immutability on `content_version_history` and `admin_audit_logs`.
   - Attaches automatic `capture_content_version()` and `sync_publish_timestamps()` triggers across all 30 CMS tables, tightens all public reads strictly to `status = 'published'`, and creates `publish_due_scheduled_content()`, `restore_content_version()`, `get_scheduler_status()`, and `list_scheduled_content()`.
   - Registers the `pg_cron` job `alamin-publish-scheduled-content` (every minute) if `pg_cron` is enabled.
6. `supabase/migrations/006_advanced_dam.sql`
   - Creates `public.media_folders` (folder organization with admin-only RLS), upgrades `public.media_assets` with DAM metadata (`caption`, `description`, `tags`, `width`, `height`, `duration_seconds`, `optimization_info`, `folder_id`), enforces `validate_media_asset_safety()` blocking executables, expands `portfolio-media` Storage policies (Images, Videos, PDFs, Documents up to 50 MB), and adds `check_media_usage()` for published-content deletion warnings.

### Optional: Trusted Scheduled Edge Function (if `pg_cron` is unavailable on your plan)

If `pg_cron` is not enabled in your Supabase project, deploy `supabase/functions/publish-scheduled-content/index.ts` and trigger it on a cron schedule (Supabase Scheduled Functions, GitHub Actions cron, etc.):

1. Set secrets in Supabase Edge Functions: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a strong random `CRON_PUBLISH_SECRET`.
2. Deploy: `supabase functions deploy publish-scheduled-content`
3. Invoke with header `Authorization: Bearer <CRON_PUBLISH_SECRET>` on a 1–5 minute schedule.

> Scheduled content is **never** published by public visitors opening the website—it is always published server-side by an authorized database job or scheduled backend call.

---

## 4. Configure Supabase Auth (Disable Public Signup)

1. In Supabase Dashboard, go to **Authentication → Providers → Email**.
2. Keep **Email** enabled.
3. Under **Authentication → Settings / User Signups**, **disable "Allow new users to sign up"** (recommended so arbitrary visitors cannot create Auth accounts).
4. Under **Authentication → URL Configuration**:
   - Set **Site URL** to your production domain (e.g. `https://yourdomain.com`).
   - Add your admin callback URLs under **Redirect URLs** (e.g. `https://yourdomain.com/admin/login.html`, `http://localhost:3000/admin/login.html`).

---

## 5. Create Your First Admin User

1. Go to **Authentication → Users → Add user → Create new user**.
2. Enter your admin email + strong password and confirm creation.
3. Copy the new user's **UUID** (`id` column in `auth.users`).
4. Run this SQL in **SQL Editor**, replacing `<USER_UUID>` and `<ADMIN_EMAIL>`:

```sql
INSERT INTO public.admin_users (user_id, email, full_name, role, is_active)
VALUES ('<USER_UUID>', '<ADMIN_EMAIL>', 'AL AMIN', 'super_admin', true)
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  is_active = true;
```

---

## 6. Connect the Frontend (`js/config.js`)

Open `js/config.js` and populate `portfolioConfig.supabase`:

```js
supabase: {
  url: "https://YOUR-PROJECT-REF.supabase.co",
  anonKey: "YOUR-PUBLIC-ANON-KEY",
  storageBucket: "portfolio-media",
  cacheTtlMinutes: 5
}
```

Optionally update `portfolioConfig.contactForm.provider` to `"supabase"` so `contact.html` stores visitor inquiries directly in `public.contact_submissions` (already automatic when `supabase.url` and `supabase.anonKey` are configured).

> You can also test connection settings interactively on `admin/login.html` via **Configure Supabase Connection** without editing code first.

---

## 7. Local Development & Free Static Deployment

- **Local dev server**: `npm run dev` (serves root portfolio + `/admin/` at `http://localhost:3000/admin/`).
- **Production static build**: `npm run build` compiles cleanly into `dist/`, including all public `.html` pages, `css/`, `js/`, `assets/`, `admin/`, and `supabase/`.
- **Deploy anywhere static**: Upload `dist/` (or connect repo) to **GitHub Pages**, **Netlify**, **Vercel**, or **Cloudflare Pages** — no Node backend server required in production!

---

## 8. Troubleshooting

| Symptom | Cause & Resolution |
| --- | --- |
| *"not registered as an active administrator"* on login | Ensure `public.admin_users` has a row matching your `auth.users.id` with `is_active = true`. |
| Upload rejected in Media Library | File exceeds 10 MB, MIME is outside allowed types (JPEG, PNG, WebP, SVG, PDF, TXT, MD), or bucket `portfolio-media` migration `002` was skipped. |
| Contact form fails with rate-limit error | DB trigger `prevent_contact_spam()` allows max 2 submissions per 60 seconds from the same email. |
| Public site shows cached static data | Verify `js/config.js` `supabase.url` + `anonKey`, and confirm rows have `status = 'published'`. |
