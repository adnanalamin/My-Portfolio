-- ============================================================================
-- AL AMIN Portfolio OS — Supabase Migration 003: Initial Baseline Seed
-- Idempotent seed matching configured public portfolio records (no fake testimonials or metrics).
-- ============================================================================

INSERT INTO public.website_settings (
  id, website_name, website_logo, favicon, tagline, default_theme,
  primary_color, secondary_color, accent_color, default_language,
  contact_email, footer_text, copyright_text, maintenance_mode, status
) VALUES (
  1,
  'AL AMIN Portfolio',
  'assets/icons/favicon.svg',
  'assets/icons/favicon.svg',
  'Full-Stack Developer & Creative Designer',
  'dark',
  '#6366F1',
  '#8B5CF6',
  '#06B6D4',
  'en',
  'your-email@example.com',
  'Engineering scalable web systems with refined interface craft.',
  'AL AMIN. All rights reserved.',
  false,
  'published'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profile (
  name, professional_title, short_bio, full_bio, profile_image, location,
  email, availability_status, resume_url, hero_headline, hero_description,
  social_links, cta_buttons, status
)
SELECT
  'AL AMIN',
  'Full-Stack Developer & Creative Designer',
  'Engineering scalable web systems with refined interface craft.',
  'I design and engineer modern full-stack web applications, SaaS architectures, and responsive digital products built for clarity, reliability, and speed.',
  'assets/images/profile.jpg',
  'Bangladesh',
  'your-email@example.com',
  'freelance',
  'assets/documents/resume.pdf',
  'Full-Stack Developer & Creative Designer',
  'I design and engineer modern full-stack web applications, SaaS architectures, and responsive digital products built for clarity, reliability, and speed.',
  '{"github":"","linkedin":"","facebook":"","fiverr":"","upwork":""}'::jsonb,
  '[{"label":"View Projects","href":"#featured-projects"},{"label":"Hire Me","href":"contact.html"}]'::jsonb,
  'published'
WHERE NOT EXISTS (SELECT 1 FROM public.profile);

INSERT INTO public.github_settings (id, username, featured_repos, exclude_forks, display_limit, cache_minutes, status)
VALUES (1, 'octocat', '["SLIDEVERSE","AstraPulse"]'::jsonb, true, 12, 15, 'published')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.coding_activity_settings (id, display_enabled, refresh_interval_sec, display_limit, status)
VALUES (1, true, 300, 8, 'published')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects (
  title, slug, short_description, full_description, category, project_type,
  development_role, year, technologies, featured, display_order, status
) VALUES
  (
    'AstraPulse', 'astrapulse',
    'Real-time full-stack telemetry and product analytics workspace built for engineering teams to monitor API latency, funnels, and uptime.',
    'Full-stack SaaS analytics workspace built with React, Node.js, Express, and MongoDB featuring workspace RBAC and time-bucket metrics.',
    'SaaS', 'Full-Stack Web Application', 'Lead Full-Stack MERN Developer', '2026',
    '["React","Node.js","Express","MongoDB","Tailwind CSS","REST API"]'::jsonb,
    true, 1, 'published'
  ),
  (
    'Nexora', 'nexora',
    'Modular headless commerce storefront and instant slide-over checkout drawer engineered for fast catalog filtering and mobile conversion.',
    'MERN headless e-commerce platform using Redux cart orchestration, catalog search, and order lifecycle APIs.',
    'E-commerce', 'Headless Commerce Storefront', 'Full-Stack MERN & State Architect', '2026',
    '["MongoDB","Express","React","Redux","Node.js","Tailwind CSS"]'::jsonb,
    true, 2, 'published'
  ),
  (
    'SLIDEVERSE', 'slideverse',
    'Interactive browser-based presentation studio with live typography controls, slide transitions, and keyboard presentation mode.',
    'Creative browser presentation application featuring live canvas typography styling and keyboard deck controls.',
    'UI/UX', 'Interactive Web Application', 'Creator & Frontend Architect', '2026',
    '["JavaScript","HTML5","CSS3","React","Tailwind CSS","Node.js"]'::jsonb,
    true, 3, 'published'
  ),
  (
    'School Management System', 'school-management-system',
    'Role-based academic operations portal handling student directories, weekly attendance matrices, and GPA analytics.',
    'Operations dashboard with role-based permissions built using Mongoose schemas, Express routes, and React tables.',
    'Dashboard', 'Role-Based Operations Portal', 'Full-Stack Backend & Dashboard Engineer', '2025',
    '["MongoDB","Mongoose","Express","React","Node.js","Tailwind CSS"]'::jsonb,
    false, 4, 'published'
  ),
  (
    'AL AMIN Portfolio OS', 'portfolio-system',
    'Zero-framework config-driven developer platform unifying interactive systems across Client, Recruiter, and Developer modes.',
    'Multi-page static HTML5/CSS3/ES2024 architecture engineered for speed, accessibility, and Supabase CMS extensibility.',
    'Web Apps', 'Modular Static Developer Platform', 'System Architect & UI Engineer', '2026',
    '["HTML5","CSS3","Tailwind CSS","JavaScript","SEO","Responsive Design"]'::jsonb,
    true, 5, 'published'
  ),
  (
    'E-commerce SaaS', 'ecommerce-saas',
    'Multi-tenant merchant storefront builder and revenue analytics console with PostgreSQL order ledgers.',
    'Multi-tenant SaaS engine pairing Next.js storefronts with hybrid MongoDB catalogs and PostgreSQL transactional ledgers.',
    'SaaS', 'Multi-Tenant Commerce Engine', 'Full-Stack Next.js & Database Engineer', '2025',
    '["Next.js","React","Node.js","Express","MongoDB","PostgreSQL"]'::jsonb,
    false, 6, 'published'
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.site_pages (title, slug, description, visible, nav_visible, is_system, display_order, status) VALUES
  ('Home', 'index.html', 'Main portfolio landing showcase', true, true, true, 1, 'published'),
  ('About', 'about.html', 'Developer background and principles', true, true, true, 2, 'published'),
  ('Skills', 'skills.html', 'Technical stack and domain gauges', true, true, true, 3, 'published'),
  ('Services', 'services.html', 'Full-stack and UI engineering services', true, true, true, 4, 'published'),
  ('Projects', 'projects.html', 'Filterable case studies archive', true, true, true, 5, 'published'),
  ('Contact', 'contact.html', 'Project inquiry form and direct channels', true, true, true, 6, 'published'),
  ('Certificates', 'certificates.html', 'Credentials and downloads', true, true, false, 7, 'published'),
  ('Blog', 'blog.html', 'Technical articles and engineering notes', true, true, false, 8, 'published')
ON CONFLICT (slug) DO NOTHING;
