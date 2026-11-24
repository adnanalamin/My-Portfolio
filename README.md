# AL AMIN — Multi-Page Portfolio OS

A production-ready, pure-frontend multi-page developer portfolio and engineering OS built for **AL AMIN — Full-Stack / MERN Stack Developer & Creative Designer** using semantic **HTML5**, **CSS3**, **Tailwind CSS (CDN)**, and **Vanilla JavaScript (ES2024)** with Vite multi-page bundling and zero runtime backend requirements.

---

## Project Overview

This portfolio spans **50 responsive HTML routes** designed mobile-first and verified from `320px` mobile viewports up to `2560px` wide displays:

- **Core Showcase Pages**: `index.html` (Home + Hero Quick-Entry Controls), `about.html`, `skills.html` (with Interactive Skills Graph), `services.html`, `projects.html`, `project-details.html`, `experience.html`, `certificates.html`, `achievements.html`, `resume.html`, `blog.html`, `blog-details.html`, `testimonials.html`, `contact.html`.
- **Interactive Discovery & Visitor Modes**: `tour.html` (Guided Portfolio Tour with keyboard/swipe navigation & text-only accessible mode), `office.html` (Interactive Digital Office), `workspace.html` (Lightweight CSS 3D Developer Workspace with Reduced Motion & Performance Mode), `career-assistant.html` (Rule-based Portfolio Career Assistant), `requirement-analyzer.html` (Client Requirement Analyzer), `resume-matcher.html` (Job Description Resume Matcher), `proposal-generator.html`, `project-architect.html`, `project-estimator.html`, `project-request.html`.
- **Developer & Architecture Center**: `dashboard.html`, `explorer.html`, `architecture.html`, `dependency-map.html`, `api-explorer.html`, `components.html`, `design-playground.html`, `playground.html`, `coding-lab.html`, `decisions.html`, `build.html`, `security.html`, `performance.html`, `tech-radar.html`, `learning-roadmap.html`, `knowledge.html`, `opensource.html`, `github.html`, `github-universe.html`, `coding-activity.html`, `recruiter-search.html`, `terminal.html`, `system-monitor.html`, `health.html`, `404.html`, `offline.html`.

---

## Technology Stack

- **HTML5**: Semantic landmarks, ARIA roles, canonical tags, Open Graph / Twitter Cards, and Schema.org JSON-LD.
- **CSS3**: Centralized dark/light design tokens (`css/style.css`), compositor-safe keyframes (`css/animations.css`), dedicated module stylesheets (`css/*.css`), and `@media print` layouts.
- **Tailwind CSS (CDN)**: Responsive utility grid and spacing system.
- **Vanilla JavaScript (ES2024)**: Modular IIFE architecture (`js/*.js`) plus centralized domain datasets (`js/data/*.js`).
- **Google Fonts & Lucide Icons**: `Plus Jakarta Sans`, `JetBrains Mono`, and Lucide SVG icons.
- **Vite**: Static multi-page production build (`npm run build`) producing optimized output under `dist/`.

---

## Folder Structure

```text
/
├── *.html                      # 50 semantic responsive portfolio & tool pages
├── assets/
│   ├── documents/              # resume.pdf & asset instructions
│   ├── icons/                  # favicon.svg, apple-touch-icon.png, pwa-*.png
│   └── images/                 # profile.jpg, avatars/, blog/, certificates/, projects/
├── css/
│   ├── style.css               # Global tokens, header/footer, A11y/Performance Mode, print rules
│   ├── animations.css          # Scroll reveal, marquee & prefers-reduced-motion handling
│   └── *.css                   # Per-module scoped stylesheets
├── js/
│   ├── config.js               # Brand identity, social URLs, GitHub handle, routes & status checks
│   ├── theme.js                # Dark/light theme + persisted Accessibility & Performance Mode
│   ├── brand.js                # Central monogram, SVG emblem & animated signature binder
│   ├── modes.js                # Visitor Mode selector (Default, Client, Recruiter, Developer)
│   ├── components.js           # Navbar, mobile menu, footer, loader, toasts & focus trap
│   ├── animations.js           # Scroll reveal, counters, role cycler & touch-safe tilt/cursor
│   ├── ux.js                   # Global Command Palette (Ctrl+K/⌘K), keyboard chords, A11y & PWA
│   ├── terminal.js             # Global CLI drawer & interactive terminal engine
│   ├── assistant.js            # Rule-based portfolio assistant drawer
│   ├── data/                   # Centralized source-of-truth modules (projects, skills, radar, certs, etc.)
│   ├── main.js                 # Page bootstrap & module initializer
│   └── *.js                    # Individual interactive tool controllers
├── site.webmanifest            # PWA Web App Manifest
├── sw.js                       # Static UI shell Service Worker (alamin-portfolio-shell-v11)
├── sitemap.xml                 # XML sitemap of indexable HTML routes
├── robots.txt                  # Crawler rules & sitemap location
└── package.json                # Vite build & TypeScript check scripts
```

---

## Core Features

- **Global Command Center (`Ctrl+K` / `Cmd+K`)**: Fuzzy search with category filters (`All`, `Actions`, `Pages`, `Projects`, `Skills`, `Services`, `Blog`, `Tools`), recent actions memory, and instant navigation/mode switching.
- **Floating & Full-Page Developer Terminal**: Launch via hero `Open Terminal` CTA, footer button, Command Center, or `terminal.html`.
- **Accessibility & Performance Mode (`Alt+A`)**: Supports OS-synced Reduce Motion, High Contrast Mode, Larger Text Scale, Stronger Focus Indicators, Disable Decorative Effects, and Performance Mode (disables blurs, 3D transforms, and hover glow). Touch screens automatically skip desktop cursor/tilt overhead.
- **Sandboxed Interactive Execution (`playground.html` & `coding-lab.html`)**: Executes HTML, CSS, and JavaScript inside `<iframe sandbox="allow-scripts">` (`srcdoc`) using token-validated `postMessage` channels—zero parent-window `eval()` and zero `allow-same-origin`.
- **Honest Diagnostics (`health.html`, `system-monitor.html`, `tech-radar.html`, `learning-roadmap.html`, `achievements.html`)**: Real DOM/meta/asset checks, live Navigation & Resource Timing (`"Not available"` when unmeasurable), zero fake Lighthouse scores, and strictly configured credential records.

---

## Configuration & Customization Guide

1. **Identity & Contact (`js/config.js`)**: Update `portfolioConfig.brand`, `email`, `phone`, `location`, `availability`, `socialLinks`, `github.username`, and `systemChecks`.
2. **Centralized Portfolio Datasets (`js/data/*.js`)**:
   - `js/data/projects.js`, `js/data/skills.js`, `js/data/services.js`, `js/data/experience.js`
   - `js/data/certificates.js` (leave `verificationUrl: ""` unless pointing to a real external verification URL)
   - `js/data/tech-radar.js` and `js/data/learning-roadmap.js`
3. **Production Domain & SEO**: Replace `https://example.com/` inside `*.html` (`rel="canonical"`, `og:url`) and `sitemap.xml` / `robots.txt` with your live domain.
4. **Media Assets**: Replace `assets/images/profile.jpg` (`1:1`), `assets/documents/resume.pdf`, and SVG assets in `assets/images/certificates/` or `assets/images/projects/`.

---

## Deployment Guide

### Run Locally
```bash
npm install
npm run dev     # Serves static dev preview on port 3000
npm run build   # Builds multi-page production bundle in dist/
```

### GitHub Pages
1. Push repository to GitHub (`main` branch).
2. Enable **Settings → Pages → Deploy from a branch** (`main` / `/(root)`) or publish `dist/` via GitHub Actions. Relative links ensure subpath repositories work cleanly.

### Netlify
1. Import repository in Netlify or drag-and-drop `dist/`.
2. Set Build Command: `npm run build` and Publish Directory: `dist` (or deploy root `.` directly).

### Vercel
1. Import repository with Framework Preset `Vite` (or `Other` for raw static).
2. Build Command: `npm run build`, Output Directory: `dist` (or `.`).

### Cloudflare Pages
1. Connect repository in **Workers & Pages → Pages**.
2. Build Command: `npm run build`, Build Output Directory: `dist`.

---

## Security & Performance Notes

- **Security**: Zero frontend API secrets or private tokens. `playground.html` and `coding-lab.html` execute user code strictly in `<iframe sandbox="allow-scripts">` (`srcdoc`, without `allow-same-origin`). Contact and assistant configs provide optional `backendEndpoint` proxy hooks without client-side keys.
- **Performance**: Deferred JS modules, compositor-safe CSS transitions, `prefers-reduced-motion` compliance, touch detection disabling desktop tilt/glow listeners, and `sw.js` caching strictly limited to same-origin static assets (never cross-origin APIs).
