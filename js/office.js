/**
 * AL AMIN Portfolio OS — Phase 41: Interactive Digital Office
 * Powers the interactive developer studio room, simplified mobile map & accessible directory,
 * guided "Explore Office" tour, keyboard arrow navigation, reduced-motion mode, and
 * inspection modal bound strictly to real portfolio data (no fake stats or achievements).
 */
const PortfolioOffice = (() => {
  const MOTION_STORAGE_KEY = "alamin-office-reduced-motion";

  const state = {
    selectedId: null,
    tourActive: false,
    tourIndex: 0,
    reducedMotion: false,
    lastTrigger: null
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

  function announceStatus(message) {
    const liveEl = document.getElementById("office-live-region");
    if (liveEl) {
      liveEl.textContent = message;
    }
  }

  function getPortfolioData() {
    const cfg = window.portfolioConfig || {};
    const data = window.PortfolioData || {};
    const projects =
      typeof data.getProjects === "function" ? data.getProjects() : Array.isArray(data.projects) ? data.projects : [];
    const certificates =
      typeof data.getCertificates === "function"
        ? data.getCertificates()
        : Array.isArray(data.certificates)
        ? data.certificates
        : [];
    const knowledge =
      typeof data.getKnowledgeEntries === "function"
        ? data.getKnowledgeEntries()
        : Array.isArray(data.knowledge)
        ? data.knowledge
        : [];
    const blog =
      typeof data.getBlogPosts === "function" ? data.getBlogPosts() : Array.isArray(data.blog) ? data.blog : [];
    const experience =
      typeof data.getExperience === "function"
        ? data.getExperience()
        : Array.isArray(data.experience)
        ? data.experience
        : [];
    const education = data.education || {
      degree: "B.Sc. in Computer Science & Engineering",
      institution: "University Studies · Bangladesh",
      period: "2021 – 2025",
      focus: "Software Engineering, Algorithms & Database Systems"
    };
    const decisions =
      typeof data.getDecisions === "function"
        ? data.getDecisions()
        : Array.isArray(data.decisions)
        ? data.decisions
        : [];
    const skills =
      typeof data.getSkills === "function" ? data.getSkills() : Array.isArray(data.skills) ? data.skills : [];

    return { cfg, projects, certificates, knowledge, blog, experience, education, decisions, skills };
  }

  function buildStations() {
    const { cfg, projects, certificates, knowledge, blog, experience, education, decisions, skills } = getPortfolioData();
    const githubUsername = (cfg.github && cfg.github.username) || "octocat";
    const featuredRepos = (cfg.github && Array.isArray(cfg.github.featuredRepos) ? cfg.github.featuredRepos : []).slice(0, 4);
    const activeProjects = projects.filter((p) => String(p.status || "").toLowerCase().includes("active")).slice(0, 3);
    const recentExperience = experience.slice(0, 3);

    return [
      {
        id: "certificates-wall",
        order: 1,
        zoneGroup: "Wall & Showcase",
        className: "office-obj-certificates",
        title: "Certificates Wall",
        shortLabel: "Certificates",
        subtitle: "Verified credentials & academic milestones",
        tooltip: "Inspect completed technical certificates and B.Sc. CSE academic foundation.",
        icon: "award",
        miniSvg: `
          <svg viewBox="0 0 180 68" class="mini-svg-graphic" aria-hidden="true">
            <rect x="6" y="8" width="48" height="52" rx="4" fill="none" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.5"/>
            <rect x="13" y="16" width="34" height="6" rx="2" fill="#6366f1" fill-opacity="0.65"/>
            <rect x="13" y="27" width="26" height="4" rx="2" fill="currentColor" fill-opacity="0.3"/>
            <circle cx="40" cy="46" r="6" fill="#06b6d4" fill-opacity="0.45"/>
            <rect x="66" y="8" width="48" height="52" rx="4" fill="none" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.5"/>
            <rect x="73" y="16" width="34" height="6" rx="2" fill="#8b5cf6" fill-opacity="0.65"/>
            <rect x="73" y="27" width="24" height="4" rx="2" fill="currentColor" fill-opacity="0.3"/>
            <circle cx="100" cy="46" r="6" fill="#6366f1" fill-opacity="0.45"/>
            <rect x="126" y="8" width="48" height="52" rx="4" fill="none" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.5"/>
            <rect x="133" y="16" width="34" height="6" rx="2" fill="#06b6d4" fill-opacity="0.65"/>
            <rect x="133" y="27" width="28" height="4" rx="2" fill="currentColor" fill-opacity="0.3"/>
            <circle cx="160" cy="46" r="6" fill="#8b5cf6" fill-opacity="0.45"/>
          </svg>
        `,
        summary:
          "Formal Computer Science degree and tracked specialization credentials across full-stack MERN architecture, APIs, React UI, and responsive design.",
        highlights: [
          {
            heading: `${education.degree} (${education.period})`,
            meta: `${education.institution} · ${education.focus}`
          },
          ...certificates.slice(0, 3).map((cert) => ({
            heading: cert.title,
            meta: `${cert.issuer} · ${cert.date} · ID ${cert.credentialId}`
          }))
        ],
        actions: [
          { label: "Open Certificates", href: "certificates.html", icon: "award", variant: "primary" },
          { label: "Academic & Career Timeline", href: "experience.html", icon: "graduation-cap", variant: "secondary" }
        ]
      },
      {
        id: "whiteboard",
        order: 2,
        zoneGroup: "Wall & Showcase",
        className: "office-obj-whiteboard",
        title: "Whiteboard",
        shortLabel: "Whiteboard",
        subtitle: "Goals · Roadmap · Build in Public",
        tooltip: "Inspect engineering goals, career roadmap, and Build in Public sprint notes.",
        icon: "pen-tool",
        miniSvg: `
          <svg viewBox="0 0 280 78" class="mini-svg-graphic" aria-hidden="true">
            <rect x="4" y="4" width="272" height="70" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.5"/>
            <rect x="16" y="14" width="76" height="46" rx="4" fill="#6366f1" fill-opacity="0.14" stroke="#6366f1" stroke-opacity="0.4"/>
            <line x1="24" y1="26" x2="78" y2="26" stroke="#818cf8" stroke-width="2" stroke-linecap="round"/>
            <line x1="24" y1="36" x2="66" y2="36" stroke="currentColor" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round"/>
            <line x1="24" y1="46" x2="72" y2="46" stroke="currentColor" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round"/>
            <path d="M92 37 L106 37" stroke="#06b6d4" stroke-width="2" stroke-dasharray="3 3"/>
            <rect x="108" y="14" width="76" height="46" rx="4" fill="#06b6d4" fill-opacity="0.12" stroke="#06b6d4" stroke-opacity="0.4"/>
            <line x1="116" y1="26" x2="170" y2="26" stroke="#22d3ee" stroke-width="2" stroke-linecap="round"/>
            <line x1="116" y1="36" x2="162" y2="36" stroke="currentColor" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round"/>
            <line x1="116" y1="46" x2="152" y2="46" stroke="currentColor" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round"/>
            <path d="M184 37 L198 37" stroke="#06b6d4" stroke-width="2" stroke-dasharray="3 3"/>
            <rect x="200" y="14" width="64" height="46" rx="4" fill="#8b5cf6" fill-opacity="0.14" stroke="#8b5cf6" stroke-opacity="0.4"/>
            <line x1="208" y1="26" x2="252" y2="26" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/>
            <line x1="208" y1="36" x2="246" y2="36" stroke="currentColor" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `,
        summary:
          "Studio whiteboard mapping current engineering priorities, continuous skill development, and transparent Build in Public iteration logs.",
        highlights: [
          {
            heading: "Current Engineering Focus",
            meta: (cfg.brand && cfg.brand.currentFocus) || "Full-Stack MERN, Next.js & Design Systems"
          },
          ...recentExperience.map((item) => ({
            heading: `${item.title} · ${item.date}`,
            meta: `${item.organization} — ${item.description}`
          }))
        ],
        actions: [
          { label: "Build in Public Log", href: "build.html", icon: "hammer", variant: "primary" },
          { label: "Developer Roadmap & Experience", href: "experience.html", icon: "milestone", variant: "secondary" },
          { label: "About & Studio Goals", href: "about.html", icon: "target", variant: "outline" }
        ]
      },
      {
        id: "github-wall",
        order: 3,
        zoneGroup: "Wall & Showcase",
        className: "office-obj-github",
        title: "GitHub Wall",
        shortLabel: "GitHub Wall",
        subtitle: "Open Source & Repository Activity",
        tooltip: "Browse SLIDEVERSE, open source repositories, and live GitHub integration.",
        icon: "github",
        miniSvg: `
          <svg viewBox="0 0 180 68" class="mini-svg-graphic" aria-hidden="true">
            <rect x="6" y="8" width="168" height="52" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.5"/>
            <g fill="#6366f1">
              <rect x="16" y="18" width="10" height="10" rx="2" fill-opacity="0.25"/>
              <rect x="30" y="18" width="10" height="10" rx="2" fill-opacity="0.65"/>
              <rect x="44" y="18" width="10" height="10" rx="2" fill-opacity="0.4"/>
              <rect x="58" y="18" width="10" height="10" rx="2" fill-opacity="0.85"/>
              <rect x="72" y="18" width="10" height="10" rx="2" fill-opacity="0.5"/>
              <rect x="86" y="18" width="10" height="10" rx="2" fill-opacity="0.9"/>
              <rect x="100" y="18" width="10" height="10" rx="2" fill-opacity="0.3"/>
              <rect x="114" y="18" width="10" height="10" rx="2" fill-opacity="0.7"/>
              <rect x="128" y="18" width="10" height="10" rx="2" fill-opacity="0.45"/>
              <rect x="142" y="18" width="10" height="10" rx="2" fill-opacity="0.8"/>
            </g>
            <g fill="#06b6d4">
              <rect x="16" y="34" width="10" height="10" rx="2" fill-opacity="0.55"/>
              <rect x="30" y="34" width="10" height="10" rx="2" fill-opacity="0.3"/>
              <rect x="44" y="34" width="10" height="10" rx="2" fill-opacity="0.85"/>
              <rect x="58" y="34" width="10" height="10" rx="2" fill-opacity="0.4"/>
              <rect x="72" y="34" width="10" height="10" rx="2" fill-opacity="0.75"/>
              <rect x="86" y="34" width="10" height="10" rx="2" fill-opacity="0.25"/>
              <rect x="100" y="34" width="10" height="10" rx="2" fill-opacity="0.6"/>
              <rect x="114" y="34" width="10" height="10" rx="2" fill-opacity="0.9"/>
              <rect x="128" y="34" width="10" height="10" rx="2" fill-opacity="0.35"/>
              <rect x="142" y="34" width="10" height="10" rx="2" fill-opacity="0.65"/>
            </g>
          </svg>
        `,
        summary:
          "Repository showcase connected to the portfolio's GitHub REST client and SLIDEVERSE open source tooling hub.",
        highlights: [
          {
            heading: `Configured GitHub Profile: @${githubUsername}`,
            meta: "Public GitHub API integration configured in portfolioConfig.github with 15-minute local caching"
          },
          {
            heading: "Featured Showcase Repositories",
            meta: featuredRepos.length ? featuredRepos.join(" · ") : "Configured via portfolioConfig.github.featuredRepos"
          },
          {
            heading: "Open Source Flagship · SLIDEVERSE",
            meta: "Interactive browser-based presentation studio with live typography controls and slide mode"
          }
        ],
        actions: [
          { label: "Open Source Hub", href: "opensource.html", icon: "git-fork", variant: "primary" },
          { label: "GitHub Activity Explorer", href: "github.html", icon: "github", variant: "secondary" }
        ]
      },
      {
        id: "bookshelf",
        order: 4,
        zoneGroup: "Infrastructure & Knowledge",
        className: "office-obj-bookshelf",
        title: "Bookshelf",
        shortLabel: "Bookshelf",
        subtitle: "Knowledge Base · Roadmap · Blog",
        tooltip: "Browse technical articles, engineering study notes, and learning roadmap.",
        icon: "book-open",
        miniSvg: `
          <svg viewBox="0 0 110 150" class="mini-svg-graphic" aria-hidden="true">
            <line x1="10" y1="45" x2="100" y2="45" stroke="currentColor" stroke-opacity="0.35" stroke-width="2"/>
            <rect x="16" y="14" width="14" height="30" rx="2" fill="#6366f1" fill-opacity="0.65"/>
            <rect x="33" y="18" width="12" height="26" rx="2" fill="#06b6d4" fill-opacity="0.65"/>
            <rect x="48" y="12" width="15" height="32" rx="2" fill="#8b5cf6" fill-opacity="0.65"/>
            <rect x="68" y="20" width="16" height="24" rx="2" fill="currentColor" fill-opacity="0.25"/>
            <line x1="10" y1="95" x2="100" y2="95" stroke="currentColor" stroke-opacity="0.35" stroke-width="2"/>
            <rect x="16" y="64" width="16" height="30" rx="2" fill="#06b6d4" fill-opacity="0.55"/>
            <rect x="36" y="68" width="13" height="26" rx="2" fill="#6366f1" fill-opacity="0.55"/>
            <rect x="54" y="62" width="14" height="32" rx="2" fill="currentColor" fill-opacity="0.25"/>
            <rect x="72" y="66" width="18" height="28" rx="2" fill="#8b5cf6" fill-opacity="0.55"/>
            <line x1="10" y1="140" x2="100" y2="140" stroke="currentColor" stroke-opacity="0.35" stroke-width="2"/>
            <rect x="20" y="108" width="28" height="31" rx="3" fill="#6366f1" fill-opacity="0.28"/>
            <rect x="54" y="114" width="34" height="25" rx="3" fill="#06b6d4" fill-opacity="0.28"/>
          </svg>
        `,
        summary:
          "Curated engineering reference library housing documented MERN notes, JavaScript deep dives, CSS layout architecture, and technical articles.",
        highlights: [
          {
            heading: `Personal Knowledge Base (${knowledge.length} documented entries)`,
            meta: knowledge.slice(0, 3).map((k) => `${k.category}: ${k.title}`).join(" · ")
          },
          {
            heading: `Engineering Blog (${blog.length} articles)`,
            meta: blog.slice(0, 2).map((b) => b.title).join(" · ")
          }
        ],
        actions: [
          { label: "Knowledge Base", href: "knowledge.html", icon: "book-marked", variant: "primary" },
          { label: "Learning Roadmap", href: "experience.html#developer-journey-section", icon: "map", variant: "secondary" },
          { label: "Engineering Blog", href: "blog.html", icon: "file-text", variant: "outline" }
        ]
      },
      {
        id: "monitor",
        order: 5,
        zoneGroup: "Core Workstation",
        className: "office-obj-monitor",
        title: "Widescreen Monitor",
        shortLabel: "Monitor",
        subtitle: "Project Dashboard · Live Projects",
        tooltip: "Launch the Developer Dashboard or inspect shipped full-stack projects.",
        icon: "monitor",
        miniSvg: `
          <svg viewBox="0 0 220 82" class="mini-svg-graphic" aria-hidden="true">
            <rect x="10" y="6" width="200" height="58" rx="6" fill="none" stroke="#06b6d4" stroke-opacity="0.6" stroke-width="2"/>
            <rect x="20" y="15" width="84" height="40" rx="3" fill="#6366f1" fill-opacity="0.16"/>
            <rect x="28" y="23" width="52" height="5" rx="2" fill="#818cf8"/>
            <rect x="28" y="33" width="66" height="4" rx="2" fill="currentColor" fill-opacity="0.35"/>
            <rect x="28" y="42" width="44" height="4" rx="2" fill="currentColor" fill-opacity="0.25"/>
            <rect x="112" y="15" width="88" height="40" rx="3" fill="#06b6d4" fill-opacity="0.14"/>
            <path d="M122 46 L140 34 L158 40 L188 22" fill="none" stroke="#22d3ee" stroke-width="2.2" stroke-linecap="round"/>
            <rect x="96" y="64" width="28" height="8" rx="2" fill="currentColor" fill-opacity="0.35"/>
            <rect x="76" y="72" width="68" height="4" rx="2" fill="currentColor" fill-opacity="0.45"/>
          </svg>
        `,
        summary:
          "Primary dual-pane engineering monitor connecting directly to the Developer Command Dashboard and the interactive project archive.",
        highlights: projects.slice(0, 4).map((p) => ({
          heading: `${p.title} (${p.year})`,
          meta: `${p.category} · ${Array.isArray(p.technologies) ? p.technologies.slice(0, 4).join(", ") : ""}`
        })),
        actions: [
          { label: "Open Project Dashboard", href: "dashboard.html", icon: "layout-dashboard", variant: "primary" },
          { label: "Open Live Projects", href: "projects.html", icon: "folder-kanban", variant: "secondary" }
        ]
      },
      {
        id: "desk",
        order: 6,
        zoneGroup: "Core Workstation",
        className: "office-obj-desk",
        title: "Developer Desk",
        shortLabel: "Developer Desk",
        subtitle: "Projects · Current Work · Tools",
        tooltip: "Inspect active software projects, current engineering focus, and development tools.",
        icon: "laptop",
        miniSvg: `
          <svg viewBox="0 0 320 76" class="mini-svg-graphic" aria-hidden="true">
            <rect x="14" y="16" width="292" height="14" rx="4" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-opacity="0.3"/>
            <rect x="82" y="34" width="118" height="22" rx="4" fill="#6366f1" fill-opacity="0.22" stroke="#818cf8" stroke-opacity="0.5"/>
            <rect x="212" y="36" width="22" height="18" rx="6" fill="#06b6d4" fill-opacity="0.28"/>
            <rect x="28" y="34" width="38" height="24" rx="4" fill="#8b5cf6" fill-opacity="0.2"/>
            <line x1="34" y1="30" x2="34" y2="70" stroke="currentColor" stroke-opacity="0.3" stroke-width="3"/>
            <line x1="286" y1="30" x2="286" y2="70" stroke="currentColor" stroke-opacity="0.3" stroke-width="3"/>
          </svg>
        `,
        summary:
          "Core engineering desk hosting active builds, code sandbox environments, and the daily frontend/backend toolset.",
        highlights: [
          {
            heading: `Active Showcase Builds (${activeProjects.length})`,
            meta: activeProjects.map((p) => `${p.title} (${p.status})`).join(" · ") || "AstraPulse · SLIDEVERSE · AL AMIN Portfolio OS"
          },
          {
            heading: `Configured Skillset (${skills.length} tracked capabilities)`,
            meta: "React, Next.js, Node.js, Express, MongoDB, PostgreSQL, Tailwind CSS, Figma & Postman"
          }
        ],
        actions: [
          { label: "View All Projects", href: "projects.html", icon: "folder-kanban", variant: "primary" },
          { label: "Open Code Playground", href: "playground.html", icon: "code-2", variant: "secondary" },
          { label: "Tech & Tools Explorer", href: "explorer.html", icon: "cpu", variant: "outline" }
        ]
      },
      {
        id: "phone",
        order: 7,
        zoneGroup: "Core Workstation",
        className: "office-obj-phone",
        title: "Mobile Showcase Phone",
        shortLabel: "Phone",
        subtitle: "Responsive Showcase",
        tooltip: "Preview responsive mobile architecture, component patterns, and design tokens.",
        icon: "smartphone",
        miniSvg: `
          <svg viewBox="0 0 64 78" class="mini-svg-graphic" aria-hidden="true">
            <rect x="14" y="4" width="36" height="68" rx="7" fill="none" stroke="#06b6d4" stroke-opacity="0.65" stroke-width="2"/>
            <rect x="26" y="9" width="12" height="3" rx="1.5" fill="currentColor" fill-opacity="0.35"/>
            <rect x="20" y="18" width="24" height="16" rx="3" fill="#6366f1" fill-opacity="0.32"/>
            <rect x="20" y="38" width="24" height="10" rx="2" fill="currentColor" fill-opacity="0.22"/>
            <rect x="20" y="52" width="18" height="10" rx="2" fill="#06b6d4" fill-opacity="0.32"/>
          </svg>
        `,
        summary:
          "Mobile viewport test stand demonstrating fluid layouts, touch-accessible controls (44px+ targets), and zero horizontal overflow across 320px to 480px screens.",
        highlights: [
          {
            heading: "Verified Mobile Breakpoints",
            meta: "Designed specifically for 320px, 375px, 390px, 412px, and 480px viewports without desktop shrinking"
          },
          {
            heading: "Interactive UI Systems",
            meta: "Reusable mobile drawers, component laboratory, and visual design token playground"
          }
        ],
        actions: [
          { label: "Component Laboratory", href: "components.html", icon: "blocks", variant: "primary" },
          { label: "Design Playground", href: "design-playground.html", icon: "palette", variant: "secondary" },
          { label: "Browse Projects", href: "projects.html", icon: "smartphone", variant: "outline" }
        ]
      },
      {
        id: "server-rack",
        order: 8,
        zoneGroup: "Infrastructure & Knowledge",
        className: "office-obj-server",
        title: "Server Rack",
        shortLabel: "Server Rack",
        subtitle: "Architecture · Security · Performance",
        tooltip: "Inspect system architecture, security hygiene controls, performance center, and ADRs.",
        icon: "server",
        miniSvg: `
          <svg viewBox="0 0 110 150" class="mini-svg-graphic" aria-hidden="true">
            <rect x="14" y="10" width="82" height="130" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.5"/>
            <rect x="22" y="20" width="66" height="22" rx="3" fill="#6366f1" fill-opacity="0.2" stroke="#818cf8" stroke-opacity="0.45"/>
            <line x1="28" y1="31" x2="64" y2="31" stroke="currentColor" stroke-opacity="0.35" stroke-width="2"/>
            <rect x="22" y="50" width="66" height="22" rx="3" fill="#06b6d4" fill-opacity="0.18" stroke="#22d3ee" stroke-opacity="0.45"/>
            <line x1="28" y1="61" x2="68" y2="61" stroke="currentColor" stroke-opacity="0.35" stroke-width="2"/>
            <rect x="22" y="80" width="66" height="22" rx="3" fill="#8b5cf6" fill-opacity="0.18" stroke="#a78bfa" stroke-opacity="0.45"/>
            <line x1="28" y1="91" x2="60" y2="91" stroke="currentColor" stroke-opacity="0.35" stroke-width="2"/>
            <rect x="22" y="110" width="66" height="20" rx="3" fill="currentColor" fill-opacity="0.12"/>
          </svg>
        `,
        summary:
          "Systems engineering rack housing backend data modeling diagrams, client-side application security checks, runtime performance controls, and recorded Architecture Decision Records.",
        highlights: [
          {
            heading: `Architecture Decision Log (${decisions.length} recorded ADRs)`,
            meta: decisions.slice(0, 2).map((d) => d.title).join(" · ") || "MERN Layering · Client Security Controls"
          },
          {
            heading: "Security & Performance Modules",
            meta: "Strict XSS HTML escaping, sandboxed code previews, passive rAF scroll listeners, and Service Worker caching"
          }
        ],
        actions: [
          { label: "System Architecture", href: "architecture.html", icon: "cpu", variant: "primary" },
          { label: "Security Center", href: "security.html", icon: "shield-check", variant: "secondary" },
          { label: "Performance Center", href: "performance.html", icon: "gauge", variant: "outline" }
        ]
      }
    ];
  }

  function applyReducedMotionState(enabled) {
    state.reducedMotion = Boolean(enabled);
    document.documentElement.classList.toggle("office-reduced-motion", state.reducedMotion);
    try {
      window.localStorage.setItem(MOTION_STORAGE_KEY, state.reducedMotion ? "1" : "0");
    } catch (_err) {
      // Ignore storage failures in restricted modes
    }
    const btn = document.getElementById("office-motion-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", state.reducedMotion ? "true" : "false");
      btn.classList.toggle("is-active", state.reducedMotion);
      const label = btn.querySelector("[data-motion-label]");
      if (label) {
        label.textContent = state.reducedMotion ? "Reduced Motion: On" : "Reduced Motion";
      }
    }
  }

  function initReducedMotionState() {
    let initial =
      document.documentElement.classList.contains("a11y-reduce-motion") ||
      document.documentElement.classList.contains("perf-mode") ||
      (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    try {
      const saved = window.localStorage.getItem(MOTION_STORAGE_KEY);
      if (saved === "1") initial = true;
      else if (saved === "0") initial = false;
    } catch (_err) {
      // Ignore storage errors
    }
    applyReducedMotionState(initial);
  }

  function renderDesktopStudio(stations) {
    const mount = document.getElementById("office-desktop-stage");
    if (!mount) return;

    const hotspotsHtml = stations
      .map(
        (station, idx) => `
          <button
            type="button"
            class="office-hotspot ${esc(station.className)} ${state.selectedId === station.id ? "is-selected" : ""}"
            data-office-station="${esc(station.id)}"
            data-station-index="${idx}"
            aria-label="${esc(station.title)} — ${esc(station.subtitle)}. Press Enter to open details."
            aria-pressed="${state.selectedId === station.id ? "true" : "false"}"
          >
            <span class="office-tooltip" role="tooltip">
              <span class="office-tooltip-title">${esc(station.title)}</span>
              <span class="office-tooltip-desc">${esc(station.tooltip)}</span>
            </span>
            <div class="office-hotspot-visual">
              <div class="office-hotspot-label">
                <span class="inline-flex items-center gap-1.5 truncate">
                  <i data-lucide="${esc(station.icon)}" class="w-3.5 h-3.5 text-cyan-400 shrink-0" aria-hidden="true"></i>
                  <span class="truncate">${esc(station.shortLabel)}</span>
                </span>
                <span class="font-mono-tech text-[10px] text-[var(--muted)] tabular-nums shrink-0">0${station.order}</span>
              </div>
              ${station.miniSvg}
              <span class="office-hotspot-sub">${esc(station.subtitle)}</span>
            </div>
          </button>
        `
      )
      .join("");

    mount.innerHTML = `
      <div class="office-stage-card">
        <div class="office-room-canvas" role="region" aria-label="Interactive architectural studio map with 8 stations">
          <svg class="office-room-backdrop-svg" viewBox="0 0 1200 690" preserveAspectRatio="none" aria-hidden="true">
            <!-- Studio back wall & floor perspective -->
            <line x1="0" y1="455" x2="1200" y2="455" stroke="rgba(148,163,184,0.16)" stroke-width="1.5" />
            <line x1="250" y1="0" x2="250" y2="455" stroke="rgba(148,163,184,0.10)" stroke-width="1" />
            <line x1="950" y1="0" x2="950" y2="455" stroke="rgba(148,163,184,0.10)" stroke-width="1" />
            <!-- Under-desk studio floor shadow -->
            <ellipse cx="600" cy="618" rx="340" ry="34" fill="rgba(99,102,241,0.08)" />
          </svg>
          ${hotspotsHtml}
        </div>
      </div>
    `;
  }

  function renderMobileOffice(stations) {
    const mapMount = document.getElementById("office-mobile-map");
    const listMount = document.getElementById("office-mobile-list");

    if (mapMount) {
      const grouped = [
        { zone: "Wall & Showcase", ids: ["certificates-wall", "whiteboard", "github-wall"] },
        { zone: "Core Workstation", ids: ["desk", "monitor", "phone"] },
        { zone: "Infrastructure & Knowledge", ids: ["bookshelf", "server-rack"] }
      ];

      mapMount.innerHTML = grouped
        .map((grp) => {
          const zoneButtons = grp.ids
            .map((id) => stations.find((s) => s.id === id))
            .filter(Boolean)
            .map(
              (s) => `
                <button
                  type="button"
                  class="office-mobile-zone ${state.selectedId === s.id ? "is-selected" : ""}"
                  data-office-station="${esc(s.id)}"
                  aria-label="Open ${esc(s.title)}: ${esc(s.subtitle)}"
                  aria-pressed="${state.selectedId === s.id ? "true" : "false"}"
                >
                  <span class="inline-flex items-center justify-between w-full gap-2">
                    <i data-lucide="${esc(s.icon)}" class="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true"></i>
                    <span class="font-mono-tech text-[11px] text-[var(--muted)] tabular-nums">0${s.order}</span>
                  </span>
                  <span class="text-xs font-bold leading-snug">${esc(s.shortLabel)}</span>
                </button>
              `
            )
            .join("");

          return `
            <div class="space-y-2">
              <p class="text-xs font-semibold text-[var(--muted)]">${esc(grp.zone)}</p>
              <div class="grid grid-cols-2 gap-2.5">
                ${zoneButtons}
              </div>
            </div>
          `;
        })
        .join("");
    }

    if (listMount) {
      listMount.innerHTML = stations
        .map(
          (s) => `
            <button
              type="button"
              class="office-mobile-row ${state.selectedId === s.id ? "is-selected" : ""}"
              data-office-station="${esc(s.id)}"
              aria-label="${esc(s.title)} — ${esc(s.subtitle)}"
              aria-pressed="${state.selectedId === s.id ? "true" : "false"}"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span class="w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] flex items-center justify-center text-cyan-400 shrink-0" aria-hidden="true">
                  <i data-lucide="${esc(s.icon)}" class="w-5 h-5"></i>
                </span>
                <div class="min-w-0">
                  <p class="text-sm font-bold text-[var(--text)] truncate">${esc(s.title)}</p>
                  <p class="text-xs text-[var(--muted)] truncate">${esc(s.subtitle)}</p>
                </div>
              </div>
              <i data-lucide="chevron-right" class="w-4 h-4 text-[var(--muted)] shrink-0" aria-hidden="true"></i>
            </button>
          `
        )
        .join("");
    }
  }

  function renderInspector(stations) {
    const mount = document.getElementById("office-inspector-bar");
    if (!mount) return;

    const active = stations.find((s) => s.id === state.selectedId);
    if (!active) {
      mount.innerHTML = `
        <div class="space-y-1 min-w-0">
          <p class="text-xs font-semibold text-cyan-400">Studio Overview</p>
          <p class="text-sm font-bold text-[var(--text)]">Select any object in the studio or press Explore Office for a guided tour</p>
          <p class="text-xs text-[var(--muted)]">Keyboard tip: Use Tab or Arrow keys between stations, Enter to inspect, and Escape to close panels.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button type="button" id="office-inspector-explore-btn" class="primary-button text-xs py-2 px-4 min-h-[40px]">
            <i data-lucide="compass" class="w-4 h-4" aria-hidden="true"></i>
            <span>Start Office Tour</span>
          </button>
        </div>
      `;
      const startTourBtn = document.getElementById("office-inspector-explore-btn");
      if (startTourBtn) {
        startTourBtn.addEventListener("click", () => startGuidedTour(stations, startTourBtn));
      }
      return;
    }

    const actionLinks = active.actions
      .slice(0, 2)
      .map(
        (act) => `
          <a href="${esc(act.href)}" class="secondary-button text-xs py-2 px-3.5 min-h-[40px]">
            <i data-lucide="${esc(act.icon)}" class="w-3.5 h-3.5" aria-hidden="true"></i>
            <span>${esc(act.label)}</span>
          </a>
        `
      )
      .join("");

    mount.innerHTML = `
      <div class="space-y-1 min-w-0">
        <p class="text-xs font-semibold text-cyan-400">${esc(active.zoneGroup)} · Station 0${active.order}</p>
        <h2 class="text-base sm:text-lg font-bold text-[var(--text)]">${esc(active.title)}</h2>
        <p class="text-xs sm:text-sm text-[var(--muted)]">${esc(active.summary)}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 shrink-0">
        <button type="button" id="office-open-selected-modal" class="primary-button text-xs py-2 px-4 min-h-[40px]">
          <i data-lucide="maximize-2" class="w-3.5 h-3.5" aria-hidden="true"></i>
          <span>Inspect Details</span>
        </button>
        ${actionLinks}
      </div>
    `;

    const openBtn = document.getElementById("office-open-selected-modal");
    if (openBtn) {
      openBtn.addEventListener("click", () => openStationModal(active.id, stations, openBtn));
    }
  }

  function renderTourBar(stations) {
    const bar = document.getElementById("office-tour-bar");
    if (!bar) return;

    if (!state.tourActive) {
      bar.classList.add("hidden");
      bar.innerHTML = "";
      return;
    }

    const current = stations[state.tourIndex] || stations[0];
    bar.classList.remove("hidden");
    bar.innerHTML = `
      <div class="space-y-0.5 min-w-0">
        <p class="text-xs font-semibold text-cyan-400 tabular-nums">
          Guided Studio Tour · Step ${state.tourIndex + 1} of ${stations.length}
        </p>
        <p class="text-sm font-bold text-[var(--text)] truncate">${esc(current.title)} — ${esc(current.subtitle)}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 shrink-0">
        <button type="button" id="office-tour-prev" class="office-ctrl-btn">Previous</button>
        <button type="button" id="office-tour-inspect" class="office-ctrl-btn office-ctrl-btn-primary">Open Station</button>
        <button type="button" id="office-tour-next" class="office-ctrl-btn">Next</button>
        <button type="button" id="office-tour-stop" class="office-ctrl-btn">End Tour</button>
      </div>
    `;

    document.getElementById("office-tour-prev")?.addEventListener("click", () => {
      stepTour(stations, -1);
    });
    document.getElementById("office-tour-next")?.addEventListener("click", () => {
      stepTour(stations, 1);
    });
    document.getElementById("office-tour-inspect")?.addEventListener("click", (e) => {
      openStationModal(current.id, stations, e.currentTarget);
    });
    document.getElementById("office-tour-stop")?.addEventListener("click", () => {
      state.tourActive = false;
      syncUI(stations);
      announceStatus("Guided studio tour closed.");
    });
  }

  function syncUI(stations) {
    renderDesktopStudio(stations);
    renderMobileOffice(stations);
    renderInspector(stations);
    renderTourBar(stations);
    bindStationEvents(stations);
    refreshIcons();
  }

  function stepTour(stations, delta) {
    state.tourIndex = (state.tourIndex + delta + stations.length) % stations.length;
    const station = stations[state.tourIndex];
    state.selectedId = station.id;
    syncUI(stations);
    announceStatus(`Tour step ${state.tourIndex + 1} of ${stations.length}: ${station.title}`);
  }

  function startGuidedTour(stations, triggerEl) {
    state.tourActive = true;
    const currentIdx = stations.findIndex((s) => s.id === state.selectedId);
    state.tourIndex = currentIdx >= 0 ? currentIdx : 0;
    state.selectedId = stations[state.tourIndex].id;
    state.lastTrigger = triggerEl || null;
    syncUI(stations);
    announceStatus(`Guided studio tour started at ${stations[state.tourIndex].title}`);
  }

  function openStationModal(stationId, stations, triggerEl) {
    const station = stations.find((s) => s.id === stationId);
    const modal = document.getElementById("office-details-modal");
    const titleEl = document.getElementById("office-modal-title");
    const kickerEl = document.getElementById("office-modal-kicker");
    const bodyEl = document.getElementById("office-modal-body");
    const closeBtn = document.getElementById("office-modal-close");

    if (!station || !modal || !titleEl || !bodyEl) return;

    state.selectedId = station.id;
    state.lastTrigger = triggerEl || document.activeElement;
    syncUI(stations);

    if (kickerEl) {
      kickerEl.textContent = `${station.zoneGroup} · Station 0${station.order} of ${stations.length}`;
    }
    titleEl.textContent = station.title;

    const highlightsHtml = station.highlights
      .map(
        (h) => `
          <div class="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
            <h3 class="text-sm font-bold text-[var(--text)]">${esc(h.heading)}</h3>
            <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${esc(h.meta)}</p>
          </div>
        `
      )
      .join("");

    const actionsHtml = station.actions
      .map((act) => {
        const cls =
          act.variant === "primary"
            ? "primary-button"
            : act.variant === "secondary"
            ? "secondary-button"
            : "outline-button";
        return `
          <a href="${esc(act.href)}" class="${cls} text-xs sm:text-sm py-2.5 px-4 min-h-[42px]">
            <i data-lucide="${esc(act.icon)}" class="w-4 h-4" aria-hidden="true"></i>
            <span>${esc(act.label)}</span>
          </a>
        `;
      })
      .join("");

    bodyEl.innerHTML = `
      <div class="space-y-5">
        <p class="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">${esc(station.summary)}</p>

        <div class="space-y-2.5">
          <p class="text-xs font-semibold text-cyan-400">Configured Workspace Records</p>
          <div class="space-y-2.5">
            ${highlightsHtml}
          </div>
        </div>

        <div class="pt-4 border-t border-[var(--border)] flex flex-wrap items-center gap-2.5">
          ${actionsHtml}
        </div>

        <div class="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
          <button type="button" id="office-modal-prev-station" class="office-ctrl-btn">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5" aria-hidden="true"></i>
            <span>Previous Area</span>
          </button>
          <button type="button" id="office-modal-next-station" class="office-ctrl-btn">
            <span>Next Area</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    refreshIcons();

    const idx = stations.findIndex((s) => s.id === station.id);
    document.getElementById("office-modal-prev-station")?.addEventListener("click", () => {
      const prev = stations[(idx - 1 + stations.length) % stations.length];
      openStationModal(prev.id, stations, state.lastTrigger);
    });
    document.getElementById("office-modal-next-station")?.addEventListener("click", () => {
      const next = stations[(idx + 1) % stations.length];
      openStationModal(next.id, stations, state.lastTrigger);
    });

    if (closeBtn) {
      window.setTimeout(() => closeBtn.focus(), 35);
    }
    announceStatus(`Opened details for ${station.title}`);
  }

  function closeModal() {
    const modal = document.getElementById("office-details-modal");
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    if (state.lastTrigger && typeof state.lastTrigger.focus === "function") {
      state.lastTrigger.focus();
    }
  }

  function resetView(stations) {
    state.selectedId = null;
    state.tourActive = false;
    state.tourIndex = 0;
    closeModal();
    syncUI(stations);
    announceStatus("Digital Office view reset to studio overview.");
    if (typeof window.showToast === "function") {
      window.showToast("Office view reset to studio overview", "info");
    }
  }

  function bindStationEvents(stations) {
    document.querySelectorAll("[data-office-station]").forEach((btn) => {
      if (btn.dataset.officeBound === "true") return;
      btn.dataset.officeBound = "true";

      btn.addEventListener("click", () => {
        const stationId = btn.getAttribute("data-office-station");
        openStationModal(stationId, stations, btn);
      });

      btn.addEventListener("keydown", (event) => {
        const currentIdx = stations.findIndex((s) => s.id === btn.getAttribute("data-office-station"));
        if (currentIdx === -1) return;

        let nextIdx = -1;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIdx = (currentIdx + 1) % stations.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIdx = (currentIdx - 1 + stations.length) % stations.length;
        } else if (event.key === "Home") {
          nextIdx = 0;
        } else if (event.key === "End") {
          nextIdx = stations.length - 1;
        }

        if (nextIdx >= 0) {
          event.preventDefault();
          const targetId = stations[nextIdx].id;
          state.selectedId = targetId;
          syncUI(stations);
          const desktopCandidate = document.querySelector(`.office-room-canvas [data-office-station="${targetId}"]`);
          const fallbackCandidate = document.querySelector(`[data-office-station="${targetId}"]`);
          const targetBtn =
            desktopCandidate && desktopCandidate.offsetParent !== null ? desktopCandidate : fallbackCandidate;
          if (targetBtn && typeof targetBtn.focus === "function") {
            targetBtn.focus();
          }
          announceStatus(`Focused ${stations[nextIdx].title}`);
        }
      });
    });
  }

  function init() {
    const root = document.getElementById("office-root");
    if (!root || root.dataset.officeInit === "true") return;
    root.dataset.officeInit = "true";

    const stations = buildStations();
    initReducedMotionState();
    syncUI(stations);

    const exploreBtn = document.getElementById("office-explore-btn");
    const resetBtn = document.getElementById("office-reset-btn");
    const motionBtn = document.getElementById("office-motion-toggle");
    const modal = document.getElementById("office-details-modal");
    const modalClose = document.getElementById("office-modal-close");

    if (exploreBtn) {
      exploreBtn.addEventListener("click", () => startGuidedTour(stations, exploreBtn));
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", () => resetView(stations));
    }
    if (motionBtn) {
      motionBtn.addEventListener("click", () => {
        applyReducedMotionState(!state.reducedMotion);
        announceStatus(state.reducedMotion ? "Reduced motion enabled." : "Reduced motion disabled.");
      });
    }
    if (modalClose) {
      modalClose.addEventListener("click", closeModal);
    }
    if (modal) {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
      });
    }

    if (!init.keyBound) {
      init.keyBound = true;
      document.addEventListener("keydown", (event) => {
        const activeModal = document.getElementById("office-details-modal");
        if (!activeModal || !activeModal.classList.contains("is-open")) return;
        if (event.key === "Escape") {
          event.preventDefault();
          closeModal();
        } else if (event.key === "Tab" && typeof window.trapDialogFocus === "function") {
          window.trapDialogFocus(activeModal, event);
        }
      });
    }
  }

  return {
    init,
    buildStations,
    resetView
  };
})();

window.PortfolioOffice = PortfolioOffice;
