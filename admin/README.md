# AL AMIN Portfolio OS — Admin CMS Guide (`/admin/`)

Centralized SaaS-style Content Management System for the AL AMIN multi-page portfolio.

## Modules Included

1. **Global Admin Command Center & `Ctrl + K / Cmd + K` Palette (Phase 70)**: Unified command interface across `/admin/` (`dashboard.html#/overview`, `page-builder.html`, `section-manager.html`, `backup.html`) featuring global permission-enforced search across all 11 CMS categories (**Pages**, **Projects**, **Blog Posts**, **Skills**, **Services**, **Certificates**, **Testimonials**, **Media**, **Settings**, **Features**, **Contact Messages**), Quick Create / Edit / Publish / Unpublish / Archive / Restore actions, deep linking directly into exact editors & modals, operational queues (Draft Content, Pending Reviews, Scheduled Releases, Unread Contact Messages, Recent Edits, Recent Activity, Real System Alerts), and keyboard-navigable shortcuts.
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
4. **System & Security (Phase 64 & Phase 68)**:
   - Digital Asset Management (`media_assets` + `media_folders` + `portfolio-media` bucket via `admin/js/media-manager.js`): Folder create/rename/delete, drag-and-drop & bulk uploads for Images/Videos/PDFs/Documents, client-side Canvas image optimization (WebP/JPEG resizing), rich image/video/PDF/document previews, alt/caption/description/tag editing, binary file replacement, search/filter/sort/pagination, bulk move/delete, executable/SVG-script blocking, Supabase Storage RLS policies, and live published-content usage warnings before deletion.
   - Contact Messages Inbox (`contact_submissions` with read/unread/archive filters and CSV export)
   - Website Settings, SEO Manager, and Theme Manager (`website_settings`)
   - Security & RLS Diagnostics (`security_events`) & Audit Log (`admin_audit_logs`)
   - Backup, Restore & Version Recovery Center (`admin/backup.html` + `admin/js/backup.js`): Full content JSON export, single-module exports (Projects, Blog, Skills, Services, Certificates, Settings), custom selected-table exports, JSON schema validation, field-level change diff preview, selective table/record restore without silent overwrites, pre-restore backup recommendations, backup audit history, version recovery, and complete Supabase PostgreSQL/Storage disaster recovery instructions.
5. **Visual Website Builder & Section Manager (Phase 66)**:
   - Visual Page Builder (`admin/page-builder.html`): 3-pane studio with Desktop/Tablet/Mobile viewport previews, 16 safe predefined components (`hero`, `about`, `skills`, `services`, `projects`, `experience`, `statistics`, `testimonials`, `blog`, `faq`, `contact`, `cta`, `logo_grid`, `image_gallery`, `video`, `custom_content`), drag-and-drop & keyboard section ordering, typography/color/background/spacing/layout/animation/responsive-visibility inspectors, Supabase Storage image picker, Save Draft, Publish, Schedule (`publish_at`), and Restore Previous Version (`page_builder_versions`).
   - Section Manager (`admin/section-manager.html`): Cross-page inventory table for `page_sections` with page/type/status filters, per-section version history modal, bulk enable/disable/publish/draft/delete actions, duplication, and direct links into the visual studio.
6. **Version History, Publishing Confirmation & Server-Side Scheduled Publishing**:
   - Universal Version History (`#/version_history` + per-record **History** buttons across all CRUD modules, singletons, and sections): Immutable `content_version_history` storing `content_id`, `content_type`, `previous_version`, `new_version`, `admin_id`, `updated_timestamp`, and `change_summary`, with field-level diff inspection and non-destructive Restore Draft / confirmed Restore & Publish.
   - Publishing Confirmation: Explicit confirmation dialog before publishing, scheduling, restoring live content, or updating already-published records.
   - Server-Side Scheduled Publishing (`#/scheduled_publishing`): Supports `scheduled` status + `publish_at` timestamps across all versioned modules; published strictly server-side by `pg_cron` (`publish_due_scheduled_content()`) or the authenticated `publish-scheduled-content` Edge Function (never visitor-triggered).

## Security Highlights

- Zero `service_role` keys anywhere in frontend JavaScript.
- Zero public account registration (`auth.signUp` excluded).
- Database-enforced authorization via `public.is_authorized_admin()` and `public.admin_users`.
- Append-only `content_version_history` and `admin_audit_logs` protected by database triggers rejecting `UPDATE`/`DELETE`.
- Public RLS policies restrict anonymous reads strictly to `status = 'published'` so scheduled items remain private until published server-side.
- Service Worker (`/sw.js`) bypasses caching for `/admin/*` so admin state is never served from stale offline HTML caches.
