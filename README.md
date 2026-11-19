# AL AMIN — Multi-Page Portfolio Website

A complete, pure-frontend multi-page developer portfolio built for **AL AMIN — Full-Stack / MERN Stack Developer & Creative Designer** using semantic **HTML5**, **CSS3**, **Tailwind CSS (CDN)**, and **Vanilla JavaScript (ES2024)**—with zero frontend framework dependencies and zero runtime backend requirement.

---

## Project Overview

This portfolio spans **19 responsive HTML files** designed mobile-first and verified across viewports from `320px` phones through `2560px` ultra-wide monitors:

- **Home (`index.html`)** — Interactive hero workspace, role typing animation, desktop cursor glow/tilt, visitor mode selector, featured projects, stats counters, services preview, about showcase, and technology marquee.
- **About (`about.html`)** — Developer story, engineering principles, animated counters, and a responsive personal journey timeline.
- **Skills (`skills.html`)** — Circular domain gauges, category-filtered skills catalog (`All`, `Frontend`, `Backend`, `Database`, `Tools`, `Design`, `Other`), progress indicators, and workflow badges.
- **Tech Explorer & Comparison (`explorer.html`)** — Interactive technology explorer sourced from configured skills data, detailed proficiency & project mappings, multi-filter project search, URL shareable filters, and side-by-side comparison of up to 3 projects.
- **Services (`services.html`)** — 12 engineering & design services with hover accents, accessible details modal, 7-step delivery process timeline, and quote CTAs.
- **Projects (`projects.html`) & Case Study (`project-details.html`)** — Category filtering, real-time keyword search, 6 agency-level engineering case studies (`AstraPulse`, `Nexora`, `SLIDEVERSE`, `School Management System`, `Portfolio System`, `E-commerce SaaS`), interactive architecture sections, project timeline, reading progress bar, sticky TOC, print/share controls, and keyboard/touch lightbox.
- **Experience (`experience.html`)** — Section-filtered timeline covering Work Experience, Freelance, Education, and Learning Journey.
- **Certificates (`certificates.html`)** — Searchable, category-filtered certificate gallery with lightbox preview, credential details modal, and SVG download support.
- **Resume (`resume.html`)** — Interactive Curriculum Vitae with PDF download, native share button, and clean white-background `@media print` A4 formatting.
- **Blog (`blog.html`) & Article Reader (`blog-details.html`)** — Featured article showcase, 8 technical categories, full-text/tag search, pagination, top reading progress indicator, sticky Table of Contents, copyable code blocks, share actions, related posts, and dynamic `BlogPosting` JSON-LD.
- **Testimonials (`testimonials.html`)** — Touch-swipeable, keyboard-accessible slider with auto-play, pause on hover/focus, and clearly labeled sample/demo review entries.
- **Developer Dashboard (`dashboard.html`)** — Config-driven developer overview, animated stats counters, skill breakdown gauges, project status summaries, and current engineering focus cards.
- **GitHub Explorer (`github.html`)** — Live public GitHub REST API v3 integration displaying profile card, repository explorer (search, language filter, sort by stars/updated, featured repos, Load More), language distribution, and recent public events with session caching & rate-limit awareness.
- **Code Playground (`playground.html`)** — Browser-based HTML, CSS, and JavaScript live coding playground executing user code strictly inside a sandboxed `iframe` (zero `eval()` on the portfolio page), with presets, copy buttons, HTML download, and fullscreen preview.
- **Contact (`contact.html`)** — Inline-validated inquiry form, URL-parameter subject pre-fill (`?service=`, `?project=`, `?intent=`), copy-to-clipboard email, and configurable delivery adapters.
- **Custom 404 (`404.html`)** — Animated `404` typography, developer terminal route diagnostic block, recovery buttons (`Back to Home`, `View Projects`, `Contact Me`, `Search (⌘K)`), and helpful directory links.
- **Offline Fallback (`offline.html`)** — Lightweight offline shell page served gracefully when offline with retry and cached navigation links.

---

## Core Features

- **Global Command Palette (`Ctrl+K` / `Cmd+K`)**: Instant search and keyboard navigation (`↑`, `↓`, `Enter`, `Esc`) with highlighted matches across pages, projects, skills, blog articles, theme toggles, visitor modes, share/copy actions, and accessibility settings. Strictly ignores keystrokes inside inputs, textareas, selects, and `contenteditable` fields.
- **Keyboard Navigation Shortcuts**: Press `G` then `H` (Home), `P` (Projects), `A` (About), `C` (Contact), or `R` (Resume) with non-interfering input guards and floating key-hint feedback.
- **Developer Easter Egg**: Subtle terminal diagnostic modal unlocked via the Konami code (`↑ ↑ ↓ ↓ ← → ← → B A`) or Command Palette (`Open Developer Stack Inspector`).
- **Accessibility Mode & Performance Mode**: Persistent settings panel (`Alt+A` or footer/bar trigger) supporting **Reduce Motion** (synced with OS `prefers-reduced-motion`), **High Contrast Mode**, **Larger Text Scale**, **Stronger Focus Indicators**, **Disable Decorative Effects**, and **Performance Mode** (disables backdrop blur filters, mouse glow, 3D card tilt/parallax, and ambient background animations).
- **Client Mode & Recruiter Mode**: Persistent visitor experience selector tailoring navigation priority, hero focus, and curated homepage blocks without hiding content permanently.
- **Portfolio Assistant**: Rule-based conversational drawer (`js/assistant.js`) grounded strictly in configured portfolio data (`config.js`, `projects.js`, `skills.js`, `testimonials.js`), quick prompt chips, keyboard support, and zero fabricated claims.
- **Website Status Indicator**: Configurable real status badge (`Available for Projects`, `Open to Freelance`, `Currently Working`, `Portfolio Updated Recently`) driven from `js/config.js`.
- **Share & Print Actions**: Native `navigator.share` with clipboard fallbacks (`Share Portfolio`, `Copy URL`, `Copy Email`) and clean `@media print` layouts for `resume.html` and `project-details.html`.
- **Optional PWA Readiness**: Includes `site.webmanifest`, PNG icons (`192x192`, `512x512`, maskable `512x512`, `180x180` Apple touch icon), safe static-shell `sw.js` (zero API caching), `offline.html`, and an optional install prompt button when supported.
- **Dark & Light Themes**: `localStorage`-persisted theme switcher with flicker-free initialization in `js/theme.js`.
- **SEO & Structured Data**: Unique page titles, meta descriptions, keywords, canonical tags, Open Graph & Twitter cards, `sitemap.xml`, `robots.txt`, and Schema.org JSON-LD.

---

## Technology Stack

- **HTML5** — Semantic multi-page markup & Schema.org JSON-LD
- **CSS3** — Design tokens (`css/style.css`), compositor-only animations (`css/animations.css`), modular view stylesheets (`case-study.css`, `explorer.css`, `github.css`, `playground.css`), and `@media print` rules
- **Tailwind CSS (Play CDN)** — Utility-first responsive layout system
- **Vanilla JavaScript (ES2024)** — Modular IIFE architecture (`js/*.js`) with `IntersectionObserver`, `requestAnimationFrame`, `fetch`, and `localStorage`
- **Google Fonts** — `Plus Jakarta Sans` & `JetBrains Mono`
- **Lucide Icons (CDN)** — Crisp vector UI iconography

*(Zero React, Vue, Angular, Bootstrap, jQuery, or runtime backend dependencies required.)*

---

## Project Structure

```text
/
├── index.html                  # Home hero, stats, visitor mode selector, featured projects
├── about.html                  # Story, principles, counters, journey timeline
├── skills.html                 # Interactive skill matrix & circular domain gauges
├── explorer.html               # Technology explorer & side-by-side project comparison
├── services.html               # 12 services, details modal & 7-step delivery process
├── projects.html               # Searchable & filterable projects showcase
├── project-details.html        # Full project case study, timeline, TOC & lightbox
├── experience.html             # Career, freelance, education, and learning timeline
├── certificates.html           # Searchable credentials gallery & lightbox
├── resume.html                 # Interactive & print-ready Curriculum Vitae
├── blog.html                   # Blog index with featured post, filters & pagination
├── blog-details.html           # Article reader with TOC, code copy & progress bar
├── testimonials.html           # Sample/demo client slider with touch swipe
├── dashboard.html              # Interactive developer overview & activity summary
├── github.html                 # Live GitHub profile, repo explorer & activity feed
├── playground.html             # Sandboxed HTML/CSS/JS interactive code playground
├── contact.html                # Validated inquiry form & direct contact channels
├── 404.html                    # Custom animated 404 & developer terminal recovery page
├── offline.html                # Graceful offline fallback page for PWA shell
├── site.webmanifest            # Web App Manifest with static relative paths
├── sw.js                       # Safe Service Worker for static UI shell only
├── sitemap.xml                 # XML sitemap of indexable portfolio routes
├── robots.txt                  # Search engine crawl directives & sitemap link
├── assets/
│   ├── documents/              # resume.pdf & document replacement guide
│   ├── icons/                  # favicon.svg, apple-touch-icon.png, pwa-*.png
│   └── images/
│       ├── profile.jpg         # Main developer headshot
│       ├── profile-placeholder.svg
│       ├── avatars/            # Sample reviewer SVG avatars (demo-1..4.svg)
│       ├── blog/               # Editorial article covers & SVG diagrams
│       ├── certificates/       # Printable/downloadable SVG certificates
│       └── projects/           # Project showcase visuals
├── css/
│   ├── style.css               # Core tokens, layout, components, A11y/Perf & print CSS
│   ├── animations.css          # Keyframes, scroll reveal, marquee & reduced motion
│   ├── case-study.css          # Case study progress bar, sticky TOC & print rules
│   ├── explorer.css            # Tech explorer & comparison table layout
│   ├── github.css              # GitHub profile cards, language bars & repo controls
│   └── playground.css          # Split editor, preview frame & responsive panes
└── js/
    ├── config.js               # Global identity, status, GitHub, routes & contact config
    ├── theme.js                # Theme + A11y/Performance mode persistence
    ├── modes.js                # Client Mode & Recruiter Mode engine + status pill bar
    ├── components.js           # Navbar, mobile menu, footer, loader, toast & focus trap
    ├── animations.js           # Scroll reveal, role cycler, counters & hero tilt
    ├── skills.js               # Circular gauges, categories & skills catalog
    ├── projects.js             # Project catalog, search, filters, case studies & lightbox
    ├── explorer.js             # Technology details & multi-project comparison logic
    ├── blog.js                 # Articles data, search, pagination, TOC & reader logic
    ├── testimonials.js         # Sample/demo testimonial data & touch-swipe carousel
    ├── dashboard.js            # Developer dashboard stats & overview rendering
    ├── github.js               # GitHub REST API client, cache, filters & activity feed
    ├── playground.js           # Sandboxed iframe HTML/CSS/JS preview & editor controls
    ├── contact.js              # Form validation, clipboard copy & delivery adapter
    ├── assistant.js            # Rule-based conversational portfolio assistant drawer
    ├── ux.js                   # Command Palette, G+key nav, Easter egg, A11y/Perf & PWA
    └── main.js                 # Application bootstrap & page module orchestrator
```

---

## Configuration & Content Management

1. **Identity, Website Status & Navigation (`js/config.js`)**:
   - Edit `portfolioConfig`: `name`, `role`, `location`, `email`, `phone`, `bio`, `profileImage`, `resumeUrl`, `availabilityStatus`, `websiteStatus` (`"available" | "freelance" | "working" | "updated"`), and optional `pricing`.
   - Edit `siteRoutes.navLinks`, `servicesList`, and `socialChannels` to customize navigation and footer structure.
2. **GitHub API Integration (`js/config.js` → `portfolioConfig.github`)**:
   - Set `username` to your public GitHub handle (e.g. `"your-github-username"`), adjust `featuredRepos`, `cacheTtlMinutes`, `initialDisplayCount`, and `eventsLimit`.
   - *(Note: `sw.js` never caches cross-origin GitHub API responses, preserving fresh client-side TTL caching inside `js/github.js`.)*
3. **Social Links (`js/config.js` → `portfolioConfig.socialLinks`)**:
   ```js
   socialLinks: {
     github: "https://github.com/your-username",
     linkedin: "https://linkedin.com/in/your-username",
     facebook: "https://facebook.com/your-username",
     fiverr: "https://fiverr.com/your-username",
     upwork: "https://upwork.com/freelancers/your-username"
   }
   ```
   Empty strings (`""`) render graceful toast notices instead of broken links.
4. **Adding or Editing Projects (`js/projects.js`)**:
   Add or update objects inside `projectsData` (`id`, `slug`, `title`, `category`, `filterCategories`, `year`, `featured`, `technologies`, `problem`, `goals`, `architecture`, `databaseStructure`, `features`, `challenges`, `solutions`, `results`, `timeline`, `liveUrl`, `githubUrl`). All project cards, Case Studies, Command Palette entries, Technology Explorer mappings, and the Portfolio Assistant automatically consume this single source of truth.
5. **Updating Skills (`js/skills.js`)**:
   Edit `skillsCatalog` (`name`, `category`, `level`, `scale`, `icon`, `summary`). Both `skills.html` and `explorer.html` read directly from `PortfolioSkills.skillsCatalog`.
6. **Adding Blog Posts (`js/blog.js`)**:
   Add or edit entries in `articlesData`. Supported categories: `JavaScript`, `React`, `Node.js`, `MERN`, `Web Development`, `AI`, `Programming`, and `Career`.
7. **Contact Form Delivery (`js/config.js` → `portfolioConfig.contactForm`)**:
   Set `provider` to `"formspree"`, `"emailjs"`, `"api"`, or keep `"demo"` (pre-filled `mailto:` draft fallback). Never place private secrets inside client-side files.
8. **Canonical URLs & Sitemap (`*.html`, `sitemap.xml`, `robots.txt`, `js/blog.js`)**:
   Replace `https://example.com/` placeholders with your production domain before publishing.

---

## Asset Replacement Guide

- **Profile Photo**: Replace `assets/images/profile.jpg` (recommended `1:1` square, `>= 600x600px`). Fallback points to `assets/images/profile-placeholder.svg`.
- **Resume PDF**: Replace `assets/documents/resume.pdf` with your exported PDF resume.
- **PWA & App Icons**: Customize `assets/icons/favicon.svg`, `apple-touch-icon.png` (`180x180`), `pwa-192x192.png`, `pwa-512x512.png`, and `pwa-maskable-512x512.png`.
- **Project Screenshots**: Replace files inside `assets/images/projects/` (recommended `4:3` aspect ratio).
- **Certificates**: Update SVG/image assets inside `assets/images/certificates/` and entries inside `initCertificatesPage()` in `js/main.js`.

---

## Local Preview & Deployment Instructions

Because this portfolio uses pure static files (`HTML5`, `CSS3`, `Vanilla JS`) with **no backend requirement**, it runs and deploys directly anywhere:

### Run Locally
```bash
# Option 1: Static Python server (port 3000)
python3 -m http.server 3000

# Option 2: Vite static dev/build preview
npm run dev
```

### GitHub Pages
1. Push the repository to GitHub (`main` branch).
2. Open **Settings → Pages → Build and deployment**.
3. Select **Deploy from a branch** → Branch: `main`, Folder: `/ (root)` → **Save**.
*(All HTML, CSS, JS, manifest, and Service Worker paths are relative, so both custom domains and `username.github.io/repo-name/` subpaths work cleanly.)*

### Netlify
1. Drag and drop the repository folder into Netlify Drop, **or** connect your Git repository.
2. Leave **Build command** blank and set **Publish directory** to `.` (or run `npm run build` with publish directory `dist`).
3. Configure `404.html` automatically via Netlify's default custom 404 handling.

### Vercel
1. Import the Git repository in Vercel.
2. Select **Framework Preset: Other**.
3. Leave **Build Command** empty and **Output Directory** as `.` (or `npm run build` → `dist`), then click **Deploy**.

### Cloudflare Pages
1. Connect your repository in **Workers & Pages → Create application → Pages**.
2. Choose **Framework preset: None**, leave build command blank, and set **Build output directory** to `/` (or `npm run build` → `dist`).
3. Deploy globally across Cloudflare's edge network.

