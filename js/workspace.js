/**
 * AL AMIN Portfolio OS — Phase 42: 3D Developer Workspace
 * Lightweight CSS 3D perspective studio using inline SVG illustrations,
 * throttled rAF pointer camera tilt on desktop only, clean 2D mobile grid,
 * full Performance Mode + Reduced Motion + Camera Reset + Enter/Exit controls,
 * and an accessible HTML directory list for all 13 workspace objects.
 */
const PortfolioWorkspace = (() => {
  const PERF_STORAGE_KEY = "alamin-workspace-perf-mode";
  const MOTION_STORAGE_KEY = "alamin-workspace-reduced-motion";

  const state = {
    selectedId: null,
    entered: false,
    perfMode: false,
    reducedMotion: false,
    lastTrigger: null,
    camRx: 6,
    camRy: -4,
    lightX: 50,
    lightY: 35,
    rafPending: false
  };

  function esc(value) {
    if (typeof window.escapeHtml === "function") {
      return window.escapeHtml(value);
    }
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function refreshIcons() {
    if (typeof window.refreshIcons === "function") {
      window.refreshIcons();
    } else if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function announce(msg) {
    const el = document.getElementById("ws-live-region");
    if (el) el.textContent = msg;
  }

  function getPortfolioContext() {
    const cfg = window.portfolioConfig || {};
    const data = window.PortfolioData || {};
    const projects =
      typeof data.getProjects === "function" ? data.getProjects() : Array.isArray(data.projects) ? data.projects : [];
    const skills =
      typeof data.getSkills === "function" ? data.getSkills() : Array.isArray(data.skills) ? data.skills : [];
    const knowledge =
      typeof data.getKnowledgeEntries === "function"
        ? data.getKnowledgeEntries()
        : Array.isArray(data.knowledge)
        ? data.knowledge
        : [];
    const certificates =
      typeof data.getCertificates === "function"
        ? data.getCertificates()
        : Array.isArray(data.certificates)
        ? data.certificates
        : [];
    const blog =
      typeof data.getBlogPosts === "function" ? data.getBlogPosts() : Array.isArray(data.blog) ? data.blog : [];
    const decisions =
      typeof data.getDecisions === "function"
        ? data.getDecisions()
        : Array.isArray(data.decisions)
        ? data.decisions
        : [];
    return { cfg, projects, skills, knowledge, certificates, blog, decisions };
  }

  function buildWorkspaceObjects() {
    const { cfg, projects, skills, knowledge, certificates, blog, decisions } = getPortfolioContext();
    const backendSkills = skills.filter((s) => s.category === "Backend" || s.category === "Database");
    const githubUsername = (cfg.github && cfg.github.username) || "octocat";
    const featuredRepos = (cfg.github && Array.isArray(cfg.github.featuredRepos) ? cfg.github.featuredRepos : []).slice(0, 4);

    return [
      {
        id: "cloud",
        order: 1,
        name: "Cloud",
        destination: "Deployment & Delivery",
        tooltip: "Inspect deployment setup, PWA caching, performance budgets, and security hygiene.",
        spanClass: "ws-span-3 ws-obj-row-top",
        depthClass: "ws-obj-depth-high is-floating",
        floatDelay: "0s",
        icon: "cloud",
        svgArt: `
          <svg viewBox="0 0 120 42" class="w-full h-9" aria-hidden="true">
            <path d="M32 32h54a10 10 0 0 0 2-19.8A15 15 0 0 0 59 8a13 13 0 0 0-25.2 4.5A9.5 9.5 0 0 0 32 32Z" fill="#06b6d4" fill-opacity="0.16" stroke="#22d3ee" stroke-width="1.6"/>
          </svg>
        `,
        summary: "Static multi-page distribution bundle (Vite + Tailwind + Service Worker v4 shell) built for HTTPS edge deployment.",
        items: [
          { label: "Deployment Readiness", detail: "vite build outputs standalone HTML, CSS, JS, assets, sitemap.xml & sw.js into dist/" },
          { label: "Quality Modules", detail: "Security Center (CSP/XSS/iframe hygiene) & Performance Center (rAF + reduced-motion)" }
        ],
        actions: [
          { label: "Performance Center", href: "performance.html", icon: "gauge", variant: "primary" },
          { label: "Security Center", href: "security.html", icon: "shield-check", variant: "secondary" }
        ]
      },
      {
        id: "github",
        order: 2,
        name: "GitHub",
        destination: "Open Source & Repositories",
        tooltip: "View GitHub repositories, SLIDEVERSE open source hub, and live REST activity.",
        spanClass: "ws-span-3 ws-obj-row-top",
        depthClass: "ws-obj-depth-high is-floating",
        floatDelay: "0.7s",
        icon: "github",
        svgArt: `
          <svg viewBox="0 0 120 42" class="w-full h-9" aria-hidden="true">
            <g fill="#6366f1">
              <rect x="14" y="8" width="12" height="10" rx="2" fill-opacity="0.35"/>
              <rect x="30" y="8" width="12" height="10" rx="2" fill-opacity="0.75"/>
              <rect x="46" y="8" width="12" height="10" rx="2" fill-opacity="0.5"/>
              <rect x="62" y="8" width="12" height="10" rx="2" fill-opacity="0.9"/>
              <rect x="78" y="8" width="12" height="10" rx="2" fill-opacity="0.45"/>
              <rect x="94" y="8" width="12" height="10" rx="2" fill-opacity="0.8"/>
              <rect x="14" y="22" width="12" height="10" rx="2" fill-opacity="0.65"/>
              <rect x="30" y="22" width="12" height="10" rx="2" fill-opacity="0.25"/>
              <rect x="46" y="22" width="12" height="10" rx="2" fill-opacity="0.85"/>
              <rect x="62" y="22" width="12" height="10" rx="2" fill-opacity="0.4"/>
              <rect x="78" y="22" width="12" height="10" rx="2" fill-opacity="0.75"/>
              <rect x="94" y="22" width="12" height="10" rx="2" fill-opacity="0.55"/>
            </g>
          </svg>
        `,
        summary: `Connected to configured GitHub profile @${githubUsername} with cached REST fetches and SLIDEVERSE flagship open source showcase.`,
        items: [
          { label: "Configured Account", detail: `@${githubUsername} · Featured: ${featuredRepos.join(", ") || "SLIDEVERSE"}` },
          { label: "Open Source Modules", detail: "Repository browser, language breakdown, and live activity timeline" }
        ],
        actions: [
          { label: "Open GitHub Explorer", href: "github.html", icon: "github", variant: "primary" },
          { label: "Open Source Hub", href: "opensource.html", icon: "git-fork", variant: "secondary" }
        ]
      },
      {
        id: "server",
        order: 3,
        name: "Server",
        destination: "System Architecture",
        tooltip: "Explore backend architecture diagrams, REST API Explorer, and ADR decision records.",
        spanClass: "ws-span-3 ws-obj-row-top",
        depthClass: "ws-obj-depth-mid",
        floatDelay: "0s",
        icon: "server",
        svgArt: `
          <svg viewBox="0 0 120 42" class="w-full h-9" aria-hidden="true">
            <rect x="14" y="6" width="92" height="13" rx="3" fill="#6366f1" fill-opacity="0.2" stroke="#818cf8" stroke-opacity="0.5"/>
            <rect x="14" y="23" width="92" height="13" rx="3" fill="#06b6d4" fill-opacity="0.18" stroke="#22d3ee" stroke-opacity="0.5"/>
          </svg>
        `,
        summary: `Modular MERN service layers, Express API conventions, and ${decisions.length} documented Architecture Decision Records.`,
        items: [
          { label: "Architecture Diagrams", detail: "Interactive request/response pipeline across React, Express, and database layers" },
          { label: "Recorded ADRs", detail: decisions.slice(0, 2).map((d) => `${d.code}: ${d.title}`).join(" · ") }
        ],
        actions: [
          { label: "System Architecture", href: "architecture.html", icon: "cpu", variant: "primary" },
          { label: "API Explorer", href: "api-explorer.html", icon: "webhook", variant: "secondary" },
          { label: "Engineering Decisions", href: "decisions.html", icon: "git-branch", variant: "outline" }
        ]
      },
      {
        id: "database",
        order: 4,
        name: "Database",
        destination: "Backend & Database Skills",
        tooltip: "Inspect MongoDB, Mongoose, PostgreSQL, Node.js, and REST API skills.",
        spanClass: "ws-span-3 ws-obj-row-top",
        depthClass: "ws-obj-depth-mid",
        floatDelay: "0s",
        icon: "database",
        svgArt: `
          <svg viewBox="0 0 120 42" class="w-full h-9" aria-hidden="true">
            <ellipse cx="60" cy="11" rx="30" ry="6" fill="#6366f1" fill-opacity="0.25" stroke="#818cf8" stroke-width="1.4"/>
            <path d="M30 11v10c0 3.3 13.4 6 30 6s30-2.7 30-6V11" fill="none" stroke="#818cf8" stroke-width="1.4"/>
            <path d="M30 21v10c0 3.3 13.4 6 30 6s30-2.7 30-6V21" fill="none" stroke="#22d3ee" stroke-width="1.4"/>
          </svg>
        `,
        summary: `Backend & data modeling foundation across ${backendSkills.length} verified database/server capabilities.`,
        items: backendSkills.slice(0, 4).map((s) => ({
          label: `${s.name} (${s.category})`,
          detail: `Configured tier: ${s.level}`
        })),
        actions: [
          { label: "Explore Backend & DB Skills", href: "skills.html", icon: "database", variant: "primary" },
          { label: "Tech Explorer", href: "explorer.html", icon: "cpu", variant: "secondary" }
        ]
      },
      {
        id: "monitor",
        order: 5,
        name: "Monitor",
        destination: "Developer Dashboard",
        tooltip: "Launch the Developer Command Dashboard, activity overview, and stack visualization.",
        spanClass: "ws-span-6",
        depthClass: "ws-obj-depth-high",
        floatDelay: "0s",
        icon: "monitor",
        svgArt: `
          <svg viewBox="0 0 220 56" class="w-full h-12" aria-hidden="true">
            <rect x="8" y="4" width="204" height="42" rx="6" fill="#06b6d4" fill-opacity="0.08" stroke="#22d3ee" stroke-opacity="0.6" stroke-width="1.5"/>
            <rect x="18" y="12" width="84" height="26" rx="3" fill="#6366f1" fill-opacity="0.2"/>
            <path d="M116 32 L138 22 L160 27 L198 13" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round"/>
            <rect x="92" y="48" width="36" height="5" rx="2" fill="currentColor" fill-opacity="0.35"/>
          </svg>
        `,
        summary: "Central command screen displaying developer dashboard panels, 30 core OS systems, and availability status.",
        items: [
          { label: "Developer Command Dashboard", detail: "Overview of projects, sample contribution calendar, core technologies & timeline" },
          { label: "Status", detail: (cfg.brand && cfg.brand.availability && cfg.brand.availability.label) || "Open to Freelance" }
        ],
        actions: [
          { label: "Open Dashboard", href: "dashboard.html", icon: "layout-dashboard", variant: "primary" },
          { label: "Build in Public Log", href: "build.html", icon: "hammer", variant: "secondary" }
        ]
      },
      {
        id: "code-editor",
        order: 6,
        name: "Code editor",
        destination: "Live Code & Design Sandboxes",
        tooltip: "Open the sandboxed HTML/CSS/JS Code Playground or UI Component Laboratory.",
        spanClass: "ws-span-6",
        depthClass: "ws-obj-depth-high",
        floatDelay: "0s",
        icon: "code-2",
        svgArt: `
          <svg viewBox="0 0 220 56" class="w-full h-12" aria-hidden="true">
            <rect x="8" y="4" width="204" height="48" rx="6" fill="#6366f1" fill-opacity="0.1" stroke="#818cf8" stroke-opacity="0.55" stroke-width="1.5"/>
            <line x1="20" y1="16" x2="96" y2="16" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="30" y1="26" x2="148" y2="26" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="30" y1="36" x2="122" y2="36" stroke="currentColor" stroke-opacity="0.35" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="20" y1="44" x2="72" y2="44" stroke="#818cf8" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        `,
        summary: "Sandboxed HTML/CSS/JS editor paired with live UI component laboratory and real-time design token playground.",
        items: [
          { label: "Code Playground", detail: "Safe sandboxed iframe preview with curated HTML/CSS/JS experiments" },
          { label: "UI Laboratories", detail: "16 live interactive components & real-time visual CSS generator" }
        ],
        actions: [
          { label: "Open Code Playground", href: "playground.html", icon: "code-2", variant: "primary" },
          { label: "Component Lab", href: "components.html", icon: "blocks", variant: "secondary" },
          { label: "Design Playground", href: "design-playground.html", icon: "palette", variant: "outline" }
        ]
      },
      {
        id: "laptop",
        order: 7,
        name: "Laptop",
        destination: "Projects Archive",
        tooltip: "Open all full-stack & frontend builds (AstraPulse, Nexora, SLIDEVERSE, SaaS).",
        spanClass: "ws-span-4",
        depthClass: "ws-obj-depth-mid",
        floatDelay: "0s",
        icon: "laptop",
        svgArt: `
          <svg viewBox="0 0 140 44" class="w-full h-9" aria-hidden="true">
            <rect x="26" y="4" width="88" height="28" rx="4" fill="#6366f1" fill-opacity="0.14" stroke="#818cf8" stroke-width="1.5"/>
            <path d="M16 34h108l6 6H10l6-6Z" fill="currentColor" fill-opacity="0.22"/>
          </svg>
        `,
        summary: `Showcases ${projects.length} featured software builds across MERN SaaS, headless commerce, and browser tooling.`,
        items: projects.slice(0, 3).map((p) => ({
          label: `${p.title} (${p.year})`,
          detail: `${p.category} · ${p.status}`
        })),
        actions: [
          { label: "Open Projects", href: "projects.html", icon: "folder-kanban", variant: "primary" },
          { label: "Project Architect", href: "project-architect.html", icon: "compass", variant: "secondary" }
        ]
      },
      {
        id: "keyboard",
        order: 8,
        name: "Keyboard",
        destination: "Command Palette & Shortcuts",
        tooltip: "Launch global Ctrl+K / Cmd+K Command Center or explore fast keyboard workflows.",
        spanClass: "ws-span-4",
        depthClass: "ws-obj-depth-low",
        floatDelay: "0s",
        icon: "keyboard",
        svgArt: `
          <svg viewBox="0 0 140 40" class="w-full h-9" aria-hidden="true">
            <rect x="12" y="8" width="116" height="24" rx="5" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.4"/>
            <rect x="20" y="13" width="14" height="5" rx="1.5" fill="#818cf8"/>
            <rect x="38" y="13" width="14" height="5" rx="1.5" fill="currentColor" fill-opacity="0.3"/>
            <rect x="56" y="13" width="14" height="5" rx="1.5" fill="currentColor" fill-opacity="0.3"/>
            <rect x="74" y="13" width="14" height="5" rx="1.5" fill="currentColor" fill-opacity="0.3"/>
            <rect x="92" y="13" width="26" height="5" rx="1.5" fill="#22d3ee"/>
            <rect x="28" y="22" width="84" height="5" rx="1.5" fill="currentColor" fill-opacity="0.25"/>
          </svg>
        `,
        summary: "Keyboard-first navigation system supporting Cmd/Ctrl+K search, route chords (G + H/P/A/C/R), and modal focus trapping.",
        items: [
          { label: "Ctrl+K / Cmd+K", detail: "Searches Pages, Projects, Case Studies, Skills, Technologies, Blog, Knowledge & Components" },
          { label: "G + Route Chord", detail: "Press G then H (Home), P (Projects), A (About), C (Contact), or R (Resume)" }
        ],
        actions: [
          { label: "Open Command Palette", action: "cmd", icon: "command", variant: "primary" },
          { label: "Recruiter Search", href: "recruiter-search.html", icon: "search-check", variant: "secondary" }
        ]
      },
      {
        id: "terminal",
        order: 9,
        name: "Terminal",
        destination: "Developer Terminal",
        tooltip: "Open the runtime Developer Stack Inspector terminal dialog.",
        spanClass: "ws-span-4",
        depthClass: "ws-obj-depth-mid",
        floatDelay: "0s",
        icon: "terminal",
        svgArt: `
          <svg viewBox="0 0 140 40" class="w-full h-9" aria-hidden="true">
            <rect x="14" y="6" width="112" height="28" rx="5" fill="#06b6d4" fill-opacity="0.1" stroke="#22d3ee" stroke-opacity="0.55" stroke-width="1.4"/>
            <path d="M24 16l8 5-8 5" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="38" y1="26" x2="64" y2="26" stroke="#818cf8" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `,
        summary: "Interactive stack inspection terminal reporting live runtime state, mode, theme, viewport width, and quick jump commands.",
        items: [
          { label: "Developer Stack Inspector", detail: "Inspect active portfolio runtime mode, accessibility flags & navigation chords" },
          { label: "Browser DevTools Focus", detail: "Pair with Code Playground for live JavaScript execution" }
        ],
        actions: [
          { label: "Open Developer Terminal", action: "terminal", icon: "terminal", variant: "primary" },
          { label: "Code Playground", href: "playground.html", icon: "code-2", variant: "secondary" }
        ]
      },
      {
        id: "project-cards",
        order: 10,
        name: "Project cards",
        destination: "Case Studies",
        tooltip: "Browse detailed engineering case studies with problem, architecture, and outcomes.",
        spanClass: "ws-span-3",
        depthClass: "ws-obj-depth-high is-floating",
        floatDelay: "1.1s",
        icon: "folder-kanban",
        svgArt: `
          <svg viewBox="0 0 120 42" class="w-full h-9" aria-hidden="true">
            <rect x="14" y="10" width="54" height="24" rx="4" fill="#6366f1" fill-opacity="0.22" stroke="#818cf8" stroke-width="1.2"/>
            <rect x="50" y="6" width="56" height="26" rx="4" fill="#06b6d4" fill-opacity="0.2" stroke="#22d3ee" stroke-width="1.3"/>
          </svg>
        `,
        summary: "Interactive project cards linking to deep case study pages with architecture tradeoffs and technology filters.",
        items: projects.slice(0, 2).map((p) => ({
          label: `${p.title} Case Study`,
          detail: p.description
        })),
        actions: [
          { label: "AstraPulse Case Study", href: "project-details.html?id=astrapulse", icon: "book-open", variant: "primary" },
          { label: "All Projects", href: "projects.html", icon: "folder-kanban", variant: "secondary" }
        ]
      },
      {
        id: "books",
        order: 11,
        name: "Books",
        destination: "Knowledge Base & Blog",
        tooltip: "Read personal engineering notes, MERN guides, and technical articles.",
        spanClass: "ws-span-3",
        depthClass: "ws-obj-depth-mid",
        floatDelay: "0s",
        icon: "book-open",
        svgArt: `
          <svg viewBox="0 0 120 42" class="w-full h-9" aria-hidden="true">
            <rect x="20" y="8" width="16" height="26" rx="2" fill="#6366f1" fill-opacity="0.55"/>
            <rect x="40" y="12" width="16" height="22" rx="2" fill="#06b6d4" fill-opacity="0.55"/>
            <rect x="60" y="7" width="18" height="27" rx="2" fill="#8b5cf6" fill-opacity="0.55"/>
            <rect x="82" y="11" width="18" height="23" rx="2" fill="currentColor" fill-opacity="0.25"/>
          </svg>
        `,
        summary: `Documentation shelf containing ${knowledge.length} Knowledge Base notes and ${blog.length} long-form articles.`,
        items: knowledge.slice(0, 2).map((k) => ({
          label: `${k.category} (${k.type})`,
          detail: k.title
        })),
        actions: [
          { label: "Open Knowledge Base", href: "knowledge.html", icon: "book-marked", variant: "primary" },
          { label: "Engineering Blog", href: "blog.html", icon: "file-text", variant: "secondary" }
        ]
      },
      {
        id: "certificates",
        order: 12,
        name: "Certificates",
        destination: "Certificates & Credentials",
        tooltip: "Verify completed engineering certificates and computer science academic record.",
        spanClass: "ws-span-3",
        depthClass: "ws-obj-depth-mid",
        floatDelay: "0s",
        icon: "award",
        svgArt: `
          <svg viewBox="0 0 120 42" class="w-full h-9" aria-hidden="true">
            <rect x="22" y="6" width="76" height="30" rx="4" fill="none" stroke="#22d3ee" stroke-opacity="0.6" stroke-width="1.4"/>
            <line x1="32" y1="15" x2="72" y2="15" stroke="#818cf8" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="32" y1="23" x2="62" y2="23" stroke="currentColor" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round"/>
            <circle cx="84" cy="24" r="5" fill="#06b6d4" fill-opacity="0.45"/>
          </svg>
        `,
        summary: `${certificates.length} tracked technical credentials across Full-Stack MERN, Backend APIs, React UI, and Responsive Systems.`,
        items: certificates.slice(0, 2).map((c) => ({
          label: `${c.title} (${c.date})`,
          detail: `${c.issuer} · Credential ID ${c.credentialId}`
        })),
        actions: [
          { label: "View All Certificates", href: "certificates.html", icon: "award", variant: "primary" },
          { label: "Resume Builder", href: "resume.html", icon: "file-text", variant: "secondary" }
        ]
      },
      {
        id: "coffee-cup",
        order: 13,
        name: "Coffee cup",
        destination: "About & Collaboration",
        tooltip: "Learn about AL AMIN's background, engineering philosophy, and contact details.",
        spanClass: "ws-span-3",
        depthClass: "ws-obj-depth-low",
        floatDelay: "0s",
        icon: "coffee",
        svgArt: `
          <svg viewBox="0 0 120 42" class="w-full h-9" aria-hidden="true">
            <rect x="42" y="14" width="30" height="22" rx="5" fill="#8b5cf6" fill-opacity="0.22" stroke="#a78bfa" stroke-width="1.4"/>
            <path d="M72 18h6a4 4 0 0 1 0 8h-6" fill="none" stroke="#a78bfa" stroke-width="1.4"/>
            <path d="M51 7c0 2 3 2 3 4M61 6c0 2 3 2 3 4" fill="none" stroke="#22d3ee" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        `,
        summary: (cfg.brand && cfg.brand.longTagline) || "Human-centered engineering story, location, availability, and direct contact channels.",
        items: [
          { label: "Location & Role", detail: `${(cfg.brand && cfg.brand.location) || "Bangladesh"} · ${(cfg.brand && cfg.brand.professionalTitle) || "Full-Stack Developer"}` },
          { label: "Direct Channels", detail: "Start a conversation, request a project brief, or generate a scope proposal" }
        ],
        actions: [
          { label: "About AL AMIN", href: "about.html", icon: "user", variant: "primary" },
          { label: "Contact", href: "contact.html", icon: "mail", variant: "secondary" }
        ]
      }
    ];
  }

  function applyToggleClasses() {
    document.documentElement.classList.toggle("ws-perf-mode", state.perfMode);
    document.documentElement.classList.toggle("ws-reduced-motion", state.reducedMotion);

    const perfBtn = document.getElementById("ws-perf-toggle");
    if (perfBtn) {
      perfBtn.setAttribute("aria-pressed", state.perfMode ? "true" : "false");
      perfBtn.classList.toggle("is-active", state.perfMode);
    }

    const motionBtn = document.getElementById("ws-motion-toggle");
    if (motionBtn) {
      motionBtn.setAttribute("aria-pressed", state.reducedMotion ? "true" : "false");
      motionBtn.classList.toggle("is-active", state.reducedMotion);
    }
  }

  function initToggleDefaults() {
    const globalPerf = document.documentElement.classList.contains("perf-mode");
    const globalReduced =
      document.documentElement.classList.contains("a11y-reduce-motion") ||
      (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    state.perfMode = globalPerf;
    state.reducedMotion = globalReduced || globalPerf;

    try {
      const p = window.localStorage.getItem(PERF_STORAGE_KEY);
      const m = window.localStorage.getItem(MOTION_STORAGE_KEY);
      if (p === "1") state.perfMode = true;
      else if (p === "0" && !globalPerf) state.perfMode = false;
      if (m === "1") state.reducedMotion = true;
      else if (m === "0" && !globalReduced) state.reducedMotion = false;
    } catch (_err) {
      // Ignore storage errors
    }
    applyToggleClasses();
  }

  function renderDesktop3DStage(objects) {
    const mount = document.getElementById("ws-desktop-stage");
    if (!mount) return;

    const cardsHtml = objects
      .map(
        (obj, idx) => `
          <button
            type="button"
            class="ws-obj-card ${esc(obj.spanClass)} ${esc(obj.depthClass)} ${state.selectedId === obj.id ? "is-selected" : ""}"
            style="--obj-float-delay: ${esc(obj.floatDelay)};"
            data-ws-object="${esc(obj.id)}"
            data-ws-index="${idx}"
            aria-label="${esc(obj.name)} — ${esc(obj.destination)}. Open details."
            aria-pressed="${state.selectedId === obj.id ? "true" : "false"}"
          >
            <span class="ws-tooltip" role="tooltip">
              <span class="block text-xs font-bold text-[var(--text)]">${esc(obj.name)} → ${esc(obj.destination)}</span>
              <span class="block text-[11px] text-[var(--muted)] mt-0.5 leading-snug">${esc(obj.tooltip)}</span>
            </span>

            <div class="flex items-center justify-between gap-2 w-full">
              <span class="inline-flex items-center gap-2 text-xs font-bold text-[var(--text)] min-w-0">
                <i data-lucide="${esc(obj.icon)}" class="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true"></i>
                <span class="truncate">${esc(obj.name)}</span>
              </span>
              <span class="font-mono-tech text-[10px] text-[var(--muted)] tabular-nums shrink-0">${String(obj.order).padStart(2, "0")}</span>
            </div>

            ${obj.svgArt}

            <p class="text-[11px] text-cyan-400 font-semibold truncate w-full">${esc(obj.destination)}</p>
          </button>
        `
      )
      .join("");

    mount.innerHTML = `
      <div id="ws-stage-viewport" class="ws-stage-viewport ${state.entered ? "is-entered" : ""}">
        <div id="ws-grid-floor" class="ws-grid-floor">
          <div class="ws-desk-layers">
            ${cardsHtml}
          </div>
        </div>
      </div>
    `;
  }

  function renderMobile2DWorkspace(objects) {
    const mount = document.getElementById("ws-mobile-stage");
    if (!mount) return;

    mount.innerHTML = objects
      .map(
        (obj) => `
          <button
            type="button"
            class="ws-mobile-card ${state.selectedId === obj.id ? "is-selected" : ""}"
            data-ws-object="${esc(obj.id)}"
            aria-label="${esc(obj.name)} — ${esc(obj.destination)}"
            aria-pressed="${state.selectedId === obj.id ? "true" : "false"}"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] flex items-center justify-center text-cyan-400 shrink-0" aria-hidden="true">
                <i data-lucide="${esc(obj.icon)}" class="w-5 h-5"></i>
              </span>
              <div class="min-w-0">
                <p class="text-sm font-bold text-[var(--text)] truncate">${esc(obj.name)}</p>
                <p class="text-xs text-[var(--muted)] truncate">${esc(obj.destination)}</p>
              </div>
            </div>
            <i data-lucide="chevron-right" class="w-4 h-4 text-[var(--muted)] shrink-0" aria-hidden="true"></i>
          </button>
        `
      )
      .join("");
  }

  function renderAccessibleList(objects) {
    const listMount = document.getElementById("workspace-accessible-list");
    if (!listMount) return;

    listMount.innerHTML = objects
      .map(
        (obj) => `
          <li>
            <button
              type="button"
              class="ws-a11y-item-btn ${state.selectedId === obj.id ? "is-selected" : ""}"
              data-ws-object="${esc(obj.id)}"
              aria-label="${esc(obj.name)} leads to ${esc(obj.destination)}"
              aria-pressed="${state.selectedId === obj.id ? "true" : "false"}"
            >
              <span class="flex items-center gap-2.5 min-w-0">
                <i data-lucide="${esc(obj.icon)}" class="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true"></i>
                <span class="min-w-0">
                  <span class="block text-xs sm:text-sm font-bold text-[var(--text)] truncate">${esc(obj.name)}</span>
                  <span class="block text-[11px] text-[var(--muted)] truncate">${esc(obj.destination)}</span>
                </span>
              </span>
              <span class="font-mono-tech text-[11px] text-[var(--muted)] tabular-nums shrink-0">${String(obj.order).padStart(2, "0")}</span>
            </button>
          </li>
        `
      )
      .join("");
  }

  function syncCameraVariables() {
    const viewport = document.getElementById("ws-stage-viewport");
    if (!viewport) return;
    viewport.style.setProperty("--cam-rx", `${state.camRx.toFixed(2)}deg`);
    viewport.style.setProperty("--cam-ry", `${state.camRy.toFixed(2)}deg`);
    viewport.style.setProperty("--light-x", `${state.lightX.toFixed(1)}%`);
    viewport.style.setProperty("--light-y", `${state.lightY.toFixed(1)}%`);
  }

  function bindMousePerspective() {
    const viewport = document.getElementById("ws-stage-viewport");
    if (!viewport || viewport.dataset.mouseBound === "true") return;
    viewport.dataset.mouseBound = "true";

    viewport.addEventListener("mousemove", (event) => {
      if (state.perfMode || state.reducedMotion || window.innerWidth < 768) return;
      const rect = viewport.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;

      state.camRy = (nx - 0.5) * 10;
      state.camRx = (0.5 - ny) * 8 + 4;
      state.lightX = nx * 100;
      state.lightY = ny * 100;

      if (!state.rafPending) {
        state.rafPending = true;
        window.requestAnimationFrame(() => {
          state.rafPending = false;
          syncCameraVariables();
        });
      }
    });

    viewport.addEventListener("mouseleave", () => {
      if (state.perfMode || state.reducedMotion) return;
      state.camRx = 6;
      state.camRy = -4;
      state.lightX = 50;
      state.lightY = 35;
      syncCameraVariables();
    });
  }

  function openObjectModal(objectId, objects, triggerEl) {
    const obj = objects.find((o) => o.id === objectId);
    const modal = document.getElementById("ws-details-modal");
    const kicker = document.getElementById("ws-modal-kicker");
    const title = document.getElementById("ws-modal-title");
    const body = document.getElementById("ws-modal-body");
    const closeBtn = document.getElementById("ws-modal-close");

    if (!obj || !modal || !title || !body) return;

    state.selectedId = obj.id;
    state.lastTrigger = triggerEl || document.activeElement;
    syncAllViews(objects);

    if (kicker) kicker.textContent = `${obj.destination} · Object ${String(obj.order).padStart(2, "0")} of ${objects.length}`;
    title.textContent = obj.name;

    const itemsHtml = obj.items
      .map(
        (it) => `
          <div class="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
            <h3 class="text-sm font-bold text-[var(--text)]">${esc(it.label)}</h3>
            <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${esc(it.detail)}</p>
          </div>
        `
      )
      .join("");

    const actionsHtml = obj.actions
      .map((act) => {
        const cls =
          act.variant === "primary"
            ? "primary-button"
            : act.variant === "secondary"
            ? "secondary-button"
            : "outline-button";
        if (act.action) {
          return `
            <button type="button" data-ws-special-action="${esc(act.action)}" class="${cls} text-xs sm:text-sm py-2.5 px-4 min-h-[42px]">
              <i data-lucide="${esc(act.icon)}" class="w-4 h-4" aria-hidden="true"></i>
              <span>${esc(act.label)}</span>
            </button>
          `;
        }
        return `
          <a href="${esc(act.href)}" class="${cls} text-xs sm:text-sm py-2.5 px-4 min-h-[42px]">
            <i data-lucide="${esc(act.icon)}" class="w-4 h-4" aria-hidden="true"></i>
            <span>${esc(act.label)}</span>
          </a>
        `;
      })
      .join("");

    body.innerHTML = `
      <div class="space-y-5">
        <p class="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">${esc(obj.summary)}</p>
        <div class="space-y-2.5">${itemsHtml}</div>
        <div class="pt-4 border-t border-[var(--border)] flex flex-wrap items-center gap-2.5">
          ${actionsHtml}
        </div>
      </div>
    `;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    refreshIcons();

    body.querySelectorAll("[data-ws-special-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.getAttribute("data-ws-special-action");
        closeModal();
        if (act === "cmd" && window.PortfolioUX && typeof window.PortfolioUX.openCommandPalette === "function") {
          window.PortfolioUX.openCommandPalette(btn);
        } else if (act === "terminal" && window.PortfolioUX && typeof window.PortfolioUX.openEasterEggModal === "function") {
          window.PortfolioUX.openEasterEggModal(btn);
        }
      });
    });

    if (closeBtn) window.setTimeout(() => closeBtn.focus(), 35);
    announce(`Opened ${obj.name}: ${obj.destination}`);
  }

  function closeModal() {
    const modal = document.getElementById("ws-details-modal");
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    if (state.lastTrigger && typeof state.lastTrigger.focus === "function") {
      state.lastTrigger.focus();
    }
  }

  function bindObjectInteractions(objects) {
    document.querySelectorAll("[data-ws-object]").forEach((el) => {
      if (el.dataset.wsBound === "true") return;
      el.dataset.wsBound = "true";

      el.addEventListener("click", () => {
        const id = el.getAttribute("data-ws-object");
        openObjectModal(id, objects, el);
      });

      el.addEventListener("keydown", (event) => {
        const idx = objects.findIndex((o) => o.id === el.getAttribute("data-ws-object"));
        if (idx === -1) return;
        let nextIdx = -1;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIdx = (idx + 1) % objects.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIdx = (idx - 1 + objects.length) % objects.length;
        } else if (event.key === "Home") {
          nextIdx = 0;
        } else if (event.key === "End") {
          nextIdx = objects.length - 1;
        }
        if (nextIdx >= 0) {
          event.preventDefault();
          const targetId = objects[nextIdx].id;
          state.selectedId = targetId;
          syncAllViews(objects);
          const candidate = document.querySelector(`#ws-desktop-stage [data-ws-object="${targetId}"]`);
          const fallback = document.querySelector(`#workspace-accessible-list [data-ws-object="${targetId}"]`);
          const target = candidate && candidate.offsetParent !== null ? candidate : fallback;
          if (target && typeof target.focus === "function") target.focus();
          announce(`Focused ${objects[nextIdx].name}`);
        }
      });
    });
  }

  function syncAllViews(objects) {
    renderDesktop3DStage(objects);
    renderMobile2DWorkspace(objects);
    renderAccessibleList(objects);
    syncCameraVariables();
    bindMousePerspective();
    bindObjectInteractions(objects);
    refreshIcons();
  }

  function resetCamera(objects) {
    state.selectedId = null;
    state.camRx = 6;
    state.camRy = -4;
    state.lightX = 50;
    state.lightY = 35;
    closeModal();
    syncAllViews(objects);
    announce("3D workspace camera reset to default view.");
    if (typeof window.showToast === "function") {
      window.showToast("Workspace camera reset", "info");
    }
  }

  function init() {
    const root = document.getElementById("workspace-root");
    if (!root || root.dataset.wsInit === "true") return;
    root.dataset.wsInit = "true";

    const objects = buildWorkspaceObjects();
    initToggleDefaults();
    syncAllViews(objects);

    document.getElementById("ws-enter-btn")?.addEventListener("click", () => {
      state.entered = true;
      state.camRx = 8;
      state.camRy = 0;
      syncAllViews(objects);
      const firstObj =
        document.querySelector('#ws-desktop-stage [data-ws-object="laptop"]') ||
        document.querySelector('#workspace-accessible-list [data-ws-object="laptop"]');
      if (firstObj && firstObj.offsetParent !== null && typeof firstObj.focus === "function") {
        firstObj.focus();
      }
      announce("Entered interactive developer workspace. Use Tab or Arrow keys to explore objects.");
    });

    document.getElementById("ws-reset-cam-btn")?.addEventListener("click", () => resetCamera(objects));

    document.getElementById("ws-perf-toggle")?.addEventListener("click", () => {
      state.perfMode = !state.perfMode;
      try {
        window.localStorage.setItem(PERF_STORAGE_KEY, state.perfMode ? "1" : "0");
      } catch (_err) {
        // Ignore storage restrictions
      }
      applyToggleClasses();
      announce(state.perfMode ? "Performance Mode enabled." : "Performance Mode disabled.");
    });

    document.getElementById("ws-motion-toggle")?.addEventListener("click", () => {
      state.reducedMotion = !state.reducedMotion;
      try {
        window.localStorage.setItem(MOTION_STORAGE_KEY, state.reducedMotion ? "1" : "0");
      } catch (_err) {
        // Ignore storage restrictions
      }
      applyToggleClasses();
      announce(state.reducedMotion ? "Reduced Motion enabled." : "Reduced Motion disabled.");
    });

    document.getElementById("ws-modal-close")?.addEventListener("click", closeModal);
    document.getElementById("ws-details-modal")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) closeModal();
    });

    if (!init.keyBound) {
      init.keyBound = true;
      document.addEventListener("keydown", (event) => {
        const modal = document.getElementById("ws-details-modal");
        if (!modal || !modal.classList.contains("is-open")) return;
        if (event.key === "Escape") {
          event.preventDefault();
          closeModal();
        } else if (event.key === "Tab" && typeof window.trapDialogFocus === "function") {
          window.trapDialogFocus(modal, event);
        }
      });
    }
  }

  return {
    init,
    buildWorkspaceObjects,
    resetCamera
  };
})();

window.PortfolioWorkspace = PortfolioWorkspace;
