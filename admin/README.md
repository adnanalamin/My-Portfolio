# AL AMIN Portfolio OS — Admin CMS Guide (`/admin/`)

Centralized SaaS-style Content Management System for the AL AMIN multi-page portfolio.

## Modules Included

1. **Overview & Global Search**: Real PostgreSQL counts (`projects`, `blog_posts`, `skills`, `services`, `certificates`, `testimonials`, unread `contact_submissions`), recent updates, quick actions, and cross-table search.
2. **Content Management (Phase 62)**:
   - Profile (`profile`)
   - Projects (`projects`) with gallery URLs, case-study fields, slug generation, duplicate, and draft/publish/schedule/archive workflow
   - Skills (`skills`), Services (`services`), Experience (`experiences`), Certificates (`certificates`)
   - Blog (`blog_posts`) with sanitized HTML preview (`AdminComponents.sanitizeHtml`), tags, reading time, and SEO metadata
   - Testimonials (`testimonials` — includes strict anti-fabrication warning)
   - FAQ (`faqs`) & Social Links (`social_links`)
3. **Pages & Features (Phase 63)**:
   - Page Manager (`site_pages` — system pages protected from accidental deletion)
   - Navigation Manager (`navigation_items`)
   - Digital Office (`office_areas`) & 3D Workspace (`workspace_objects`)
   - Portfolio Tour (`tour_steps`)
   - Career Assistant Knowledge (`career_knowledge`), Requirement Analyzer Rules (`requirement_rules`), Resume Matcher Rules (`resume_matcher_rules`)
   - Recommendations (`project_recommendations`), Dependency Map (`project_dependencies`)
   - GitHub Config (`github_settings`), Coding Activity (`coding_activity_settings`)
   - Terminal Commands (`terminal_commands` — declarative safe responses only)
   - Tech Radar (`technologies`), Learning Roadmap (`learning_items`), Coding Challenge Lab (`coding_challenges`), Achievements (`achievements`), System Monitor (`system_endpoints`)
4. **System & Security (Phase 64)**:
   - Media Library (`media_assets` + `portfolio-media` bucket with extension/MIME/size validation and reference checks before deletion)
   - Contact Messages Inbox (`contact_submissions` with read/unread/archive filters and CSV export)
   - Website Settings, SEO Manager, and Theme Manager (`website_settings`)
   - Security & RLS Diagnostics (`security_events`) & Audit Log (`admin_audit_logs`)
   - Backup & Restore (validated JSON snapshot export/import with explicit content-only scope notice)

## Security Highlights

- Zero `service_role` keys anywhere in frontend JavaScript.
- Zero public account registration (`auth.signUp` excluded).
- Database-enforced authorization via `public.is_authorized_admin()` and `public.admin_users`.
- Service Worker (`/sw.js`) bypasses caching for `/admin/*` so admin state is never served from stale offline HTML caches.
