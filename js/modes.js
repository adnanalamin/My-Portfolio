/**
 * AL AMIN Portfolio — Phase 18: Client Mode & Recruiter Mode
 * Dual visitor experience engine with localStorage persistence, smart navigation
 * prioritization, mode switcher controls, accessible selector modal, and tailored
 * homepage emphasis — with zero fabricated data.
 */

const PortfolioModes = (() => {
  const STORAGE_KEY = "alamin_portfolio_visitor_mode_v1";
  const VALID_MODES = ["default", "client", "recruiter", "developer"];

  const modeMeta = {
    default: {
      id: "default",
      label: "Default Portfolio",
      shortLabel: "Default",
      icon: "layout-grid",
      tagline: "Complete developer platform across services, case studies, skills, tools, and knowledge."
    },
    client: {
      id: "client",
      label: "Client Mode",
      shortLabel: "Client",
      icon: "briefcase",
      cardPrompt: "I want to hire Al Amin for a project.",
      tagline: "Prioritizing services, projects, case studies, project estimator, request wizard, and contact."
    },
    recruiter: {
      id: "recruiter",
      label: "Recruiter Mode",
      shortLabel: "Recruiter",
      icon: "user-check",
      cardPrompt: "I want to evaluate his engineering background.",
      tagline: "Prioritizing resume, experience, skills, GitHub, projects, certificates, and recruiter search."
    },
    developer: {
      id: "developer",
      label: "Developer Mode",
      shortLabel: "Developer",
      icon: "terminal",
      cardPrompt: "I want to inspect architecture, APIs & code.",
      tagline: "Prioritizing system architecture, code playground, API explorer, component lab, ADRs, and security."
    }
  };

  // Canonical synchronized content from portfolio pages (no invented metrics or clients)
  const knowledge = {
    clientCapabilities: [
      {
        title: "SaaS & Multi-Tenant Applications",
        projectTitle: "AstraPulse",
        projectId: "astrapulse",
        problem: "Replacing slow, fragmented operational spreadsheets and disconnected analytics tools with one predictable control panel.",
        solution: "Modular React and Next.js interfaces backed by Node.js, Express, REST APIs, JWT RBAC security, and MongoDB/PostgreSQL schemas."
      },
      {
        title: "E-Commerce & Operational Portals",
        projectTitle: "Nexora & School Portal",
        projectId: "nexora",
        problem: "Improving catalog discovery speed, mobile checkout conversion, and multi-role administrative workflows across devices.",
        solution: "Filterable storefront state, slide-over checkout flows, inventory ledgers, and responsive 320px–2560px data views."
      },
      {
        title: "Interactive UI Systems & Website Redesigns",
        projectTitle: "SLIDEVERSE",
        projectId: "slideverse",
        problem: "Turning dated or cluttered web interfaces into cohesive, fast-loading digital products that perform well on mobile.",
        solution: "Clean design tokens, accessible keyboard navigation, compositor-only motion, and SEO-ready semantic HTML."
      }
    ],
    clientProcessSteps: [
      {
        step: "01",
        title: "Discovery & Scope",
        detail: "Align on business goals, core user flows, technical architecture, and realistic delivery milestones."
      },
      {
        step: "02",
        title: "Design & Data Modeling",
        detail: "Establish UI hierarchy, responsive breakpoints, API contracts, and database schemas before coding."
      },
      {
        step: "03",
        title: "Iterative Full-Stack Build",
        detail: "Ship clean, modular frontend components and hardened backend endpoints with transparent progress checks."
      },
      {
        step: "04",
        title: "QA, Launch & Handover",
        detail: "Test across 320px–2560px viewports, verify accessibility and speed, and deliver documented source code."
      }
    ],
    sampleTestimonialsFallback: [
      {
        name: "Sample Reviewer A",
        role: "Product Lead (Demo)",
        company: "Demo SaaS Workspace",
        rating: 5,
        review:
          "Sample testimonial illustrating full-stack collaboration feedback: structured REST API delivery, clean React component architecture, and responsive dashboard performance across mobile and desktop screens.",
        isDemo: true
      },
      {
        name: "Sample Reviewer B",
        role: "Operations Director (Demo)",
        company: "Demo Commerce Studio",
        rating: 5,
        review:
          "Sample testimonial illustrating storefront engineering feedback: rebuilt product filtering, streamlined checkout drawer interactions, and improved mobile load speed without sacrificing visual polish.",
        isDemo: true
      },
      {
        name: "Sample Reviewer D",
        role: "Creative Director (Demo)",
        company: "Demo Design Collective",
        rating: 5,
        review:
          "Sample testimonial illustrating UI/UX implementation feedback: faithful translation of Figma tokens into semantic HTML/CSS, dark and light theme consistency, and accessible keyboard navigation.",
        isDemo: true
      }
    ],
    recruiterSkills: [
      {
        group: "Frontend Engineering",
        items: ["HTML5", "CSS3", "Tailwind CSS", "JavaScript (ES2024)", "React", "Redux", "Next.js"]
      },
      {
        group: "Backend & APIs",
        items: ["Node.js", "Express.js", "REST API Design", "JWT & Session Auth", "Input Validation"]
      },
      {
        group: "Databases & Modeling",
        items: ["MongoDB", "Mongoose ODM", "PostgreSQL", "Schema & Index Design"]
      },
      {
        group: "Tools, UI & Quality",
        items: ["Git", "GitHub", "VS Code", "Postman", "Figma", "Responsive QA (320px–2560px)", "SEO"]
      }
    ],
    recruiterExperience: [
      {
        period: "2025 – Present",
        role: "Full-Stack MERN Developer",
        org: "Independent Product Studio",
        summary: "Building end-to-end SaaS analytics, headless commerce, and interactive web applications using React, Next.js, Node.js, Express, MongoDB, and PostgreSQL."
      },
      {
        period: "2024 – 2025",
        role: "Frontend & UI Engineer",
        org: "Digital Web Solutions",
        summary: "Engineered accessible component systems, responsive multi-breakpoint layouts, and clean UI/UX implementations from Figma specs."
      },
      {
        period: "2023 – Present",
        role: "Freelance Web Developer & UI Designer",
        org: "Fiverr, Upwork & Direct Clients",
        summary: "Delivered custom business websites, management dashboards, storefront features, and SEO-friendly responsive redesigns."
      }
    ],
    recruiterEducation: {
      degree: "B.Sc. in Computer Science & Engineering",
      institution: "University Studies · Bangladesh",
      period: "2021 – 2025",
      focus: "Software Engineering, Data Structures & Algorithms, Web Technologies, Database Management Systems (DBMS)."
    },
    recruiterCertificates: [
      { title: "Full-Stack MERN Web Development", issuer: "Meta / Coursera Verified Track", year: "2025", id: "CERT-MERN-2025" },
      { title: "Node.js API & Database Systems", issuer: "Backend Systems Track", year: "2025", id: "CERT-NODE-2025" },
      { title: "React & Frontend Architecture", issuer: "Modern Frontend Track", year: "2024", id: "CERT-REACT-2024" },
      { title: "Responsive Web & UI Systems", issuer: "Design & Accessibility Track", year: "2024", id: "CERT-UI-2024" }
    ]
  };

  const state = {
    currentMode: "default",
    heroSnapshot: null,
    lastModalTrigger: null
  };

  function escHtml(value) {
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

  function isValidMode(mode) {
    return VALID_MODES.includes(mode);
  }

  function readQueryMode() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const m = (params.get("mode") || "").trim().toLowerCase();
      return isValidMode(m) ? m : null;
    } catch (_err) {
      return null;
    }
  }

  function loadStoredMode() {
    const queryMode = readQueryMode();
    if (queryMode) {
      saveStoredMode(queryMode);
      return queryMode;
    }
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return isValidMode(saved) ? saved : "default";
    } catch (_err) {
      return "default";
    }
  }

  function saveStoredMode(mode) {
    try {
      if (mode === "default") {
        window.localStorage.setItem(STORAGE_KEY, "default");
      } else {
        window.localStorage.setItem(STORAGE_KEY, mode);
      }
    } catch (_err) {
      // Ignore storage restrictions gracefully
    }
  }

  function getMode() {
    return state.currentMode;
  }

  function getPrioritizedNavLinks(rawLinks) {
    const links = Array.isArray(rawLinks) ? rawLinks.slice() : [];
    const routes = window.siteRoutes || {};
    const orderMap = routes.modeNavOrder || {};
    const modeOrder = orderMap[state.currentMode];

    const clientHighlight = new Set(["services.html", "projects.html", "testimonials.html", "contact.html"]);
    const recruiterHighlight = new Set(["about.html", "skills.html", "experience.html", "projects.html", "certificates.html"]);
    const developerHighlight = new Set(["projects.html", "skills.html", "dashboard.html", "blog.html"]);

    const sorted = Array.isArray(modeOrder) && modeOrder.length > 0
      ? links.sort((a, b) => {
          const ia = modeOrder.indexOf(a.href);
          const ib = modeOrder.indexOf(b.href);
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        })
      : links;

    return sorted.map((item) => {
      let isPriority = false;
      if (state.currentMode === "client") {
        isPriority = clientHighlight.has(item.href);
      } else if (state.currentMode === "recruiter") {
        isPriority = recruiterHighlight.has(item.href);
      } else if (state.currentMode === "developer") {
        isPriority = developerHighlight.has(item.href);
      }
      return { ...item, isPriority };
    });
  }

  function getHeaderPrimaryAction() {
    if (state.currentMode === "client") {
      return {
        label: "Hire / Quote",
        href: "project-request.html",
        icon: "send"
      };
    }
    if (state.currentMode === "developer") {
      return {
        label: "Architecture",
        href: "architecture.html",
        icon: "cpu"
      };
    }
    return {
      label: "Resume",
      href: "resume.html",
      icon: "file-text"
    };
  }

  function getAvailabilityCopy(statusKey) {
    const map = {
      freelance: {
        label: "Available for Freelance",
        detail: "Currently open for international remote product builds, SaaS interfaces, and full-stack MERN projects."
      },
      projects: {
        label: "Open to Select Projects",
        detail: "Accepting scoped web application, dashboard, and UI engineering engagements."
      },
      remote: {
        label: "Open to Remote Collaboration",
        detail: "Available for remote product engineering and contract partnerships across global time zones."
      },
      busy: {
        label: "Booked for Current Sprint",
        detail: "Currently focused on active milestones, but happy to scope upcoming project timelines."
      }
    };
    return map[statusKey] || map.freelance;
  }

  /* ========================================================================
     1. Top Inline Mode Indicator & Switcher Bar (All Pages)
     ======================================================================== */

  function renderModeBar() {
    const main = document.getElementById("main-content");
    if (!main) return;

    let bar = document.getElementById("visitor-mode-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "visitor-mode-bar";
      bar.className = "visitor-mode-bar no-print";
      main.insertBefore(bar, main.firstChild);
    }

    const mode = state.currentMode;
    const meta = modeMeta[mode];
    const cfg = window.portfolioConfig || {};
    const statusMeta =
      window.PortfolioUX && typeof window.PortfolioUX.getWebsiteStatusMeta === "function"
        ? window.PortfolioUX.getWebsiteStatusMeta()
        : {
            label: (cfg.websiteStatusOptions && cfg.websiteStatusOptions[cfg.websiteStatus] && cfg.websiteStatusOptions[cfg.websiteStatus].label) || "Open to Freelance",
            tone: (cfg.websiteStatusOptions && cfg.websiteStatusOptions[cfg.websiteStatus] && cfg.websiteStatusOptions[cfg.websiteStatus].tone) || "cyan"
          };

    bar.setAttribute("data-mode", mode);
    bar.innerHTML = `
      <div class="container">
        <div class="visitor-mode-bar-inner">
          <div class="flex flex-wrap items-center gap-2 min-w-0">
            <span class="website-status-pill" data-status-tone="${escHtml(statusMeta.tone)}" title="Portfolio availability status">
              <span class="website-status-dot" aria-hidden="true"></span>
              <span>${escHtml(statusMeta.label)}</span>
            </span>
            <div class="flex items-center gap-1.5 min-w-0">
              <i data-lucide="${escHtml(meta.icon)}" class="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true"></i>
              <p class="text-xs sm:text-[13px] font-medium text-[var(--text-secondary)] truncate">
                <span class="font-semibold text-[var(--text)]">${escHtml(meta.label)}</span>
                <span class="hidden xl:inline text-[var(--muted)]"> · ${escHtml(meta.tagline)}</span>
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-1.5 shrink-0" role="group" aria-label="Visitor experience and quick tools">
            <button
              type="button"
              class="visitor-mode-switch-btn ${mode === "client" ? "is-active" : ""}"
              data-set-visitor-mode="client"
              aria-pressed="${mode === "client" ? "true" : "false"}"
            >
              <i data-lucide="briefcase" class="w-3.5 h-3.5" aria-hidden="true"></i>
              <span>Client</span>
            </button>
            <button
              type="button"
              class="visitor-mode-switch-btn ${mode === "recruiter" ? "is-active" : ""}"
              data-set-visitor-mode="recruiter"
              aria-pressed="${mode === "recruiter" ? "true" : "false"}"
            >
              <i data-lucide="user-check" class="w-3.5 h-3.5" aria-hidden="true"></i>
              <span>Recruiter</span>
            </button>
            <button
              type="button"
              class="visitor-mode-switch-btn ${mode === "developer" ? "is-active" : ""}"
              data-set-visitor-mode="developer"
              aria-pressed="${mode === "developer" ? "true" : "false"}"
            >
              <i data-lucide="terminal" class="w-3.5 h-3.5" aria-hidden="true"></i>
              <span>Developer</span>
            </button>
            <button
              type="button"
              class="visitor-mode-switch-btn ${mode === "default" ? "is-active" : ""}"
              data-set-visitor-mode="default"
              aria-pressed="${mode === "default" ? "true" : "false"}"
            >
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5" aria-hidden="true"></i>
              <span>${mode === "default" ? "Default" : "Reset"}</span>
            </button>
            <button
              type="button"
              class="visitor-mode-switch-btn"
              data-open-mode-selector
              aria-label="Open Mode Selector Overview"
            >
              <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5" aria-hidden="true"></i>
              <span class="hidden sm:inline">Guide</span>
            </button>
            <button
              type="button"
              class="visitor-mode-switch-btn"
              data-open-command-palette
              aria-label="Open Global Command Palette (Ctrl+K or Cmd+K)"
              title="Search &amp; Commands (Ctrl+K / Cmd+K)"
            >
              <i data-lucide="search" class="w-3.5 h-3.5" aria-hidden="true"></i>
              <span class="hidden sm:inline font-mono-tech">⌘K</span>
            </button>
            <button
              type="button"
              class="visitor-mode-switch-btn"
              data-open-ux-prefs
              aria-label="Open Accessibility and Performance Settings (Alt+A)"
              title="Accessibility &amp; Performance Settings"
            >
              <i data-lucide="accessibility" class="w-3.5 h-3.5" aria-hidden="true"></i>
              <span class="hidden md:inline">A11y</span>
            </button>
          </div>
        </div>
      </div>
    `;

    bindModeActionTriggers(bar);
    if (window.PortfolioUX && typeof window.PortfolioUX.bindGlobalActionTriggers === "function") {
      window.PortfolioUX.bindGlobalActionTriggers(bar);
    }
    refreshIcons();
  }

  /* ========================================================================
     2. Interactive Mode Selector Cards (Homepage + Accessible Modal)
     ======================================================================== */

  function buildSelectorCardsMarkup(context) {
    const mode = state.currentMode;
    const isModal = context === "modal";

    return `
      <div class="space-y-6">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div class="space-y-2 max-w-2xl">
            <p class="text-xs font-semibold text-cyan-400 tracking-wide">Visitor Experience Selector</p>
            <h2 class="${isModal ? "text-xl sm:text-2xl" : "section-title"} font-extrabold text-[var(--text)]">
              Choose Your <span class="gradient-text">Portfolio View</span>
            </h2>
            <p class="text-sm sm:text-base text-[var(--muted)]">
              Tailor navigation emphasis and homepage highlights to what you need right now, or switch freely at any time.
            </p>
          </div>

          <button
            type="button"
            class="outline-button self-start md:self-auto shrink-0"
            data-set-visitor-mode="default"
            ${mode === "default" ? 'aria-pressed="true"' : 'aria-pressed="false"'}
          >
            <i data-lucide="layout-grid" class="w-4 h-4" aria-hidden="true"></i>
            <span>Continue with Default Portfolio</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <!-- Client Mode Card -->
          <article class="glass-card mode-card ${mode === "client" ? "is-selected" : ""} p-6 flex flex-col justify-between gap-6">
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-4">
                <div class="mode-card-icon">
                  <i data-lucide="briefcase" class="w-5 h-5" aria-hidden="true"></i>
                </div>
                <span class="text-xs font-mono-tech text-[var(--muted)]">
                  ${mode === "client" ? "Active View" : "For Founders & Teams"}
                </span>
              </div>

              <div class="space-y-2">
                <h3 class="text-xl font-bold text-[var(--text)]">Client Mode</h3>
                <p class="text-sm font-medium text-cyan-400">
                  "I want to hire Al Amin for a project."
                </p>
              </div>

              <ul class="space-y-2 text-sm text-[var(--muted)] list-none p-0 m-0">
                <li class="flex items-start gap-2.5">
                  <i data-lucide="check" class="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>Services, projects &amp; engineering case studies</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <i data-lucide="check" class="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>Project Estimator &amp; Proposal Generator</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <i data-lucide="check" class="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>Smart Project Request Wizard &amp; direct contact</span>
                </li>
              </ul>
            </div>

            <div class="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                class="${mode === "client" ? "secondary-button" : "primary-button"} w-full sm:w-auto"
                data-set-visitor-mode="client"
                aria-pressed="${mode === "client" ? "true" : "false"}"
              >
                <span>${mode === "client" ? "Client Mode Active" : "Enter Client Mode"}</span>
                <i data-lucide="arrow-right" class="w-4 h-4" aria-hidden="true"></i>
              </button>
              <a href="project-estimator.html" class="text-xs font-semibold text-cyan-400 hover:underline whitespace-nowrap">
                Estimator →
              </a>
            </div>
          </article>

          <!-- Recruiter Mode Card -->
          <article class="glass-card mode-card ${mode === "recruiter" ? "is-selected" : ""} p-6 flex flex-col justify-between gap-6">
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-4">
                <div class="mode-card-icon mode-card-icon-recruiter">
                  <i data-lucide="user-check" class="w-5 h-5" aria-hidden="true"></i>
                </div>
                <span class="text-xs font-mono-tech text-[var(--muted)]">
                  ${mode === "recruiter" ? "Active View" : "For Hiring Managers"}
                </span>
              </div>

              <div class="space-y-2">
                <h3 class="text-xl font-bold text-[var(--text)]">Recruiter Mode</h3>
                <p class="text-sm font-medium text-indigo-400">
                  "I want to explore his professional background."
                </p>
              </div>

              <ul class="space-y-2 text-sm text-[var(--muted)] list-none p-0 m-0">
                <li class="flex items-start gap-2.5">
                  <i data-lucide="check" class="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>Dynamic Resume Builder &amp; A4 PDF print</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <i data-lucide="check" class="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>Experience timeline, skills graph &amp; certificates</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <i data-lucide="check" class="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>Recruiter Search &amp; live GitHub repositories</span>
                </li>
              </ul>
            </div>

            <div class="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                class="${mode === "recruiter" ? "secondary-button" : "primary-button"} w-full sm:w-auto"
                data-set-visitor-mode="recruiter"
                aria-pressed="${mode === "recruiter" ? "true" : "false"}"
              >
                <span>${mode === "recruiter" ? "Recruiter Mode Active" : "Enter Recruiter Mode"}</span>
                <i data-lucide="arrow-right" class="w-4 h-4" aria-hidden="true"></i>
              </button>
              <a href="recruiter-search.html" class="text-xs font-semibold text-indigo-400 hover:underline whitespace-nowrap">
                Search →
              </a>
            </div>
          </article>

          <!-- Developer Mode Card -->
          <article class="glass-card mode-card ${mode === "developer" ? "is-selected" : ""} p-6 flex flex-col justify-between gap-6 md:col-span-2 lg:col-span-1">
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-4">
                <div class="mode-card-icon mode-card-icon-developer">
                  <i data-lucide="terminal" class="w-5 h-5" aria-hidden="true"></i>
                </div>
                <span class="text-xs font-mono-tech text-[var(--muted)]">
                  ${mode === "developer" ? "Active View" : "For Engineers & Peers"}
                </span>
              </div>

              <div class="space-y-2">
                <h3 class="text-xl font-bold text-[var(--text)]">Developer Mode</h3>
                <p class="text-sm font-medium text-emerald-400">
                  "I want to inspect architecture, APIs &amp; code."
                </p>
              </div>

              <ul class="space-y-2 text-sm text-[var(--muted)] list-none p-0 m-0">
                <li class="flex items-start gap-2.5">
                  <i data-lucide="check" class="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>System Architecture, API Explorer &amp; ADRs</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <i data-lucide="check" class="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>Live Code Playground &amp; UI Component Lab</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <i data-lucide="check" class="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>Security Center, Performance &amp; Knowledge Base</span>
                </li>
              </ul>
            </div>

            <div class="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                class="${mode === "developer" ? "secondary-button" : "primary-button"} w-full sm:w-auto"
                data-set-visitor-mode="developer"
                aria-pressed="${mode === "developer" ? "true" : "false"}"
              >
                <span>${mode === "developer" ? "Developer Mode Active" : "Enter Developer Mode"}</span>
                <i data-lucide="arrow-right" class="w-4 h-4" aria-hidden="true"></i>
              </button>
              <a href="architecture.html" class="text-xs font-semibold text-emerald-400 hover:underline whitespace-nowrap">
                Architecture →
              </a>
            </div>
          </article>
        </div>
      </div>
    `;
  }

  function renderHomepageSelectorSection() {
    const mount = document.getElementById("mode-selector-mount");
    if (!mount) return;

    mount.innerHTML = buildSelectorCardsMarkup("page");
    bindModeActionTriggers(mount);
    refreshIcons();
  }

  function ensureSelectorModal() {
    let modal = document.getElementById("mode-selector-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "mode-selector-modal";
      modal.className = "mode-modal-backdrop no-print";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-label", "Choose Visitor Experience Mode");
      modal.setAttribute("aria-hidden", "true");
      document.body.appendChild(modal);

      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          closeModal();
        }
      });
    }

    modal.innerHTML = `
      <div class="mode-modal-panel p-5 sm:p-7 space-y-5">
        <div class="flex items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div class="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
            <i data-lucide="sliders-horizontal" class="w-4 h-4 text-indigo-400" aria-hidden="true"></i>
            <span>Visitor Mode Selector</span>
          </div>
          <button
            type="button"
            id="mode-modal-close-btn"
            class="icon-button"
            aria-label="Close mode selector"
          >
            <i data-lucide="x" class="w-4 h-4" aria-hidden="true"></i>
          </button>
        </div>
        ${buildSelectorCardsMarkup("modal")}
      </div>
    `;

    const closeBtn = document.getElementById("mode-modal-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    bindModeActionTriggers(modal);
    refreshIcons();
  }

  function openModal(triggerEl) {
    ensureSelectorModal();
    const modal = document.getElementById("mode-selector-modal");
    if (!modal) return;

    state.lastModalTrigger = triggerEl || document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");

    const closeBtn = document.getElementById("mode-modal-close-btn");
    if (closeBtn) {
      window.setTimeout(() => closeBtn.focus(), 40);
    }
  }

  function closeModal() {
    const modal = document.getElementById("mode-selector-modal");
    if (!modal || !modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");

    if (state.lastModalTrigger && typeof state.lastModalTrigger.focus === "function") {
      state.lastModalTrigger.focus();
    }
  }

  /* ========================================================================
     3. Mode-Specific Homepage Hero & Curated Content
     ======================================================================== */

  function captureHeroSnapshot() {
    if (state.heroSnapshot) return;
    const kicker = document.getElementById("hero-kicker-row");
    const headline = document.getElementById("hero-headline");
    const subtitle = document.getElementById("hero-subtitle");
    const ctaGroup = document.getElementById("hero-cta-group");
    if (!kicker || !headline || !subtitle || !ctaGroup) return;

    state.heroSnapshot = {
      kickerHtml: kicker.innerHTML,
      headlineHtml: headline.innerHTML,
      subtitleText: subtitle.textContent,
      ctaHtml: ctaGroup.innerHTML
    };
  }

  function updateHomepageHero() {
    const kicker = document.getElementById("hero-kicker-row");
    const headline = document.getElementById("hero-headline");
    const subtitle = document.getElementById("hero-subtitle");
    const ctaGroup = document.getElementById("hero-cta-group");
    if (!kicker || !headline || !subtitle || !ctaGroup) return;

    captureHeroSnapshot();
    const cfg = window.portfolioConfig || {};
    const brandName = (cfg.brand && cfg.brand.displayName) || cfg.name || "AL AMIN";
    const resumeHref = (cfg.brand && cfg.brand.resume && cfg.brand.resume.url) || cfg.resumeUrl || "assets/documents/resume.pdf";
    const resumeFilename = (cfg.brand && cfg.brand.resume && cfg.brand.resume.filename) || "AL_AMIN_Resume.pdf";
    const location = (cfg.brand && cfg.brand.location) || cfg.location || "Bangladesh";

    if (state.currentMode === "client") {
      kicker.innerHTML = `
        <span class="badge">Client View · International Remote</span>
        <span class="hidden sm:inline text-[var(--muted)]" aria-hidden="true">·</span>
        <span class="hidden sm:inline text-[var(--muted)]">Full-Stack Delivery Partner</span>
      `;
      headline.innerHTML = `Scalable Web Apps &amp; <span class="gradient-text">SaaS Products Built to Ship</span>`;
      subtitle.textContent =
        "What I can build for your team: custom SaaS platforms, fast storefronts, admin dashboards, and responsive redesigns engineered from clean React UI to secure Node.js APIs.";
      ctaGroup.innerHTML = `
        <a href="contact.html?intent=project" class="primary-button w-full sm:w-auto">
          <span>Request a Project</span>
          <i data-lucide="send" class="w-4 h-4" aria-hidden="true"></i>
        </a>
        <a href="services.html" class="secondary-button w-full sm:w-auto">
          <span>Explore Services</span>
          <i data-lucide="layers" class="w-4 h-4" aria-hidden="true"></i>
        </a>
        <a href="projects.html" class="outline-button w-full sm:w-auto">
          <span>Case Studies</span>
          <i data-lucide="arrow-up-right" class="w-4 h-4" aria-hidden="true"></i>
        </a>
      `;
    } else if (state.currentMode === "recruiter") {
      kicker.innerHTML = `
        <span class="badge">Recruiter View · B.Sc. CSE</span>
        <span class="hidden sm:inline text-[var(--muted)]" aria-hidden="true">·</span>
        <span class="hidden sm:inline text-[var(--muted)]">${escHtml(location)}</span>
      `;
      headline.innerHTML = `${escHtml(brandName)} — <span class="gradient-text">Full-Stack MERN Engineer</span>`;
      subtitle.textContent =
        "Computer Science & Engineering graduate specializing in React, Next.js, Node.js, Express, MongoDB, and PostgreSQL—focused on clean architecture, maintainable code, and accessible responsive interfaces.";
      ctaGroup.innerHTML = `
        <a href="${escHtml(resumeHref)}" download="${escHtml(resumeFilename)}" data-resume-download class="primary-button w-full sm:w-auto">
          <i data-lucide="download" class="w-4 h-4" aria-hidden="true"></i>
          <span>Download Resume</span>
        </a>
        <a href="resume.html" class="secondary-button w-full sm:w-auto">
          <i data-lucide="file-text" class="w-4 h-4" aria-hidden="true"></i>
          <span>Interactive Resume</span>
        </a>
        <a href="github.html" class="outline-button w-full sm:w-auto">
          <i data-lucide="github" class="w-4 h-4" aria-hidden="true"></i>
          <span>GitHub Profile</span>
        </a>
      `;
    } else if (state.currentMode === "developer") {
      kicker.innerHTML = `
        <span class="badge">Developer View · Engineering OS</span>
        <span class="hidden sm:inline text-[var(--muted)]" aria-hidden="true">·</span>
        <span class="hidden sm:inline text-[var(--muted)]">Architecture, APIs &amp; Tooling</span>
      `;
      headline.innerHTML = `Inspect the <span class="gradient-text">Engineering Platform</span>`;
      subtitle.textContent =
        "Explore interactive system architecture blueprints, live HTML/CSS/JS code sandbox, documented REST endpoints, reusable UI components, ADR decisions, and security practices.";
      ctaGroup.innerHTML = `
        <a href="architecture.html" class="primary-button w-full sm:w-auto">
          <i data-lucide="cpu" class="w-4 h-4" aria-hidden="true"></i>
          <span>System Architecture</span>
        </a>
        <a href="playground.html" class="secondary-button w-full sm:w-auto">
          <i data-lucide="code-2" class="w-4 h-4" aria-hidden="true"></i>
          <span>Code Playground</span>
        </a>
        <a href="api-explorer.html" class="outline-button w-full sm:w-auto">
          <i data-lucide="webhook" class="w-4 h-4" aria-hidden="true"></i>
          <span>API Explorer</span>
        </a>
      `;
    } else if (state.heroSnapshot) {
      kicker.innerHTML = state.heroSnapshot.kickerHtml;
      headline.innerHTML = state.heroSnapshot.headlineHtml;
      subtitle.textContent = state.heroSnapshot.subtitleText;
      ctaGroup.innerHTML = state.heroSnapshot.ctaHtml;
    }

    refreshIcons();
  }

  function renderClientDynamicSections(cfg) {
    const availability = getAvailabilityCopy(cfg.availabilityStatus || "freelance");
    const email = cfg.email || "your-email@example.com";
    const pricingList = Array.isArray(cfg.pricing) ? cfg.pricing : [];
    const testimonialsSource =
      window.PortfolioTestimonials && Array.isArray(window.PortfolioTestimonials.testimonialsData)
        ? window.PortfolioTestimonials.testimonialsData.slice(0, 3)
        : knowledge.sampleTestimonialsFallback;

    const capabilitiesHtml = knowledge.clientCapabilities
      .map(
        (cap) => `
        <article class="glass-card p-6 flex flex-col justify-between gap-4">
          <div class="space-y-3">
            <h3 class="text-lg font-bold text-[var(--text)]">${escHtml(cap.title)}</h3>
            <p class="text-sm text-[var(--muted)] leading-relaxed">
              <strong class="text-[var(--text-secondary)] font-semibold">Problem solved:</strong> ${escHtml(cap.problem)}
            </p>
            <p class="text-sm text-[var(--muted)] leading-relaxed">
              <strong class="text-[var(--text-secondary)] font-semibold">Engineering approach:</strong> ${escHtml(cap.solution)}
            </p>
          </div>
          <div class="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
            <span class="text-xs font-mono-tech text-[var(--muted)]">Example: ${escHtml(cap.projectTitle)}</span>
            <a href="project-details.html?id=${encodeURIComponent(cap.projectId)}" class="text-xs font-semibold text-cyan-400 hover:underline whitespace-nowrap">
              Case Study →
            </a>
          </div>
        </article>
      `
      )
      .join("");

    const processHtml = knowledge.clientProcessSteps
      .map(
        (item) => `
        <div class="card p-5 space-y-2">
          <span class="text-xs font-mono-tech font-bold text-indigo-400 tabular-nums">${escHtml(item.step)}</span>
          <h3 class="text-base font-bold text-[var(--text)]">${escHtml(item.title)}</h3>
          <p class="text-sm text-[var(--muted)] leading-relaxed">${escHtml(item.detail)}</p>
        </div>
      `
      )
      .join("");

    const testimonialsHtml = testimonialsSource
      .map((item) => {
        const stars = "★".repeat(Math.max(1, Math.min(5, Number(item.rating) || 5)));
        return `
          <article class="card p-5 space-y-3 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                <span class="text-amber-400 tracking-wider" aria-label="${escHtml(item.rating)} out of 5 stars">${stars}</span>
                <span>${item.isDemo ? "Sample / Demo Entry" : "Client Review"}</span>
              </div>
              <p class="text-sm text-[var(--text-secondary)] leading-relaxed">"${escHtml(item.review)}"</p>
            </div>
            <div class="pt-3 border-t border-[var(--border)] text-xs">
              <p class="font-bold text-[var(--text)]">${escHtml(item.name)}</p>
              <p class="text-[var(--muted)]">${escHtml(item.role)} · ${escHtml(item.company)}</p>
            </div>
          </article>
        `;
      })
      .join("");

    const pricingBlockHtml =
      pricingList.length > 0
        ? `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${pricingList
              .map(
                (tier) => `
              <div class="card p-5 space-y-2">
                <h4 class="text-base font-bold text-[var(--text)]">${escHtml(tier.name || "")}</h4>
                <p class="text-2xl font-extrabold gradient-text tabular-nums">${escHtml(tier.price || "")}</p>
                <p class="text-xs sm:text-sm text-[var(--muted)]">${escHtml(tier.description || "")}</p>
              </div>
            `
              )
              .join("")}
          </div>`
        : `<div class="card p-5 space-y-2">
            <h4 class="text-sm font-bold text-[var(--text)]">Transparent Project Scoping</h4>
            <p class="text-sm text-[var(--muted)]">
              Fixed pricing tiers are not pre-published here—every project quote is prepared based on feature scope, backend complexity, and target delivery timeline.
            </p>
          </div>`;

    return `
      <section class="section border-t border-[var(--border)] mode-transition-fade" aria-label="Client Mode Overview">
        <div class="container space-y-12 sm:space-y-14">
          <!-- 1. What I Can Build & Problem Solving -->
          <div class="space-y-6">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div class="space-y-2 max-w-2xl">
                <p class="text-xs font-semibold text-cyan-400">Client Focus · Outcomes &amp; Architecture</p>
                <h2 class="section-title">What I Can Build for <span class="gradient-text">Your Product</span></h2>
                <p class="section-subtitle">
                  End-to-end engineering combining clear UI design, clean full-stack codebases, and documented case studies.
                </p>
              </div>
              <a href="projects.html" class="outline-button self-start md:self-auto shrink-0">
                <span>Browse All Case Studies</span>
                <i data-lucide="arrow-right" class="w-4 h-4" aria-hidden="true"></i>
              </a>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
              ${capabilitiesHtml}
            </div>
          </div>

          <!-- 2. Streamlined Development Process -->
          <div class="space-y-6 pt-4 border-t border-[var(--border)]">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div class="space-y-2 max-w-2xl">
                <h2 class="text-2xl sm:text-3xl font-extrabold text-[var(--text)]">Development Process</h2>
                <p class="text-sm sm:text-base text-[var(--muted)]">
                  Structured remote collaboration built for international clients with clear checkpoints.
                </p>
              </div>
              <a href="services.html" class="text-sm font-semibold text-indigo-400 hover:underline whitespace-nowrap">
                Inspect all 12 services →
              </a>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              ${processHtml}
            </div>
          </div>

          <!-- 3. Testimonials & Demo Proof Transparency -->
          <div class="space-y-6 pt-4 border-t border-[var(--border)]">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div class="space-y-2 max-w-2xl">
                <h2 class="text-2xl sm:text-3xl font-extrabold text-[var(--text)]">Client Testimonials Preview</h2>
                <p class="text-sm sm:text-base text-[var(--muted)]">
                  Sample/demo collaboration previews displayed transparently until verified client quotes are published.
                </p>
              </div>
              <a href="testimonials.html" class="outline-button self-start md:self-auto shrink-0">
                <span>Testimonials Page</span>
                <i data-lucide="arrow-right" class="w-4 h-4" aria-hidden="true"></i>
              </a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              ${testimonialsHtml}
            </div>
          </div>

          <!-- 4. Freelance Availability, Pricing Status & Direct CTA -->
          <div class="glass-card p-6 sm:p-8 space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div class="lg:col-span-7 space-y-3">
                <p class="text-xs font-semibold text-cyan-400">${escHtml(availability.label)} · Remote Worldwide</p>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-[var(--text)]">
                  Ready to Scope <span class="gradient-text">Your Next Build?</span>
                </h2>
                <p class="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                  ${escHtml(availability.detail)} Reach out via the inquiry form or email <span class="font-mono-tech text-indigo-400">${escHtml(email)}</span>.
                </p>
              </div>
              <div class="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-stretch justify-end gap-3">
                <a href="project-estimator.html" class="primary-button justify-center">
                  <span>Project Estimator</span>
                  <i data-lucide="calculator" class="w-4 h-4" aria-hidden="true"></i>
                </a>
                <a href="project-request.html" class="secondary-button justify-center">
                  <span>Request Wizard</span>
                  <i data-lucide="send" class="w-4 h-4" aria-hidden="true"></i>
                </a>
                <a href="contact.html" class="outline-button justify-center">
                  <span>Contact</span>
                  <i data-lucide="mail" class="w-4 h-4" aria-hidden="true"></i>
                </a>
              </div>
            </div>
            ${pricingBlockHtml}
          </div>
        </div>
      </section>
    `;
  }

  function renderRecruiterDynamicSections(cfg) {
    const email = cfg.email || "your-email@example.com";
    const location = cfg.location || "Bangladesh";
    const resumeHref = cfg.resumeUrl || "assets/documents/resume.pdf";
    const githubUser = (cfg.github && cfg.github.username) || "";

    const skillsHtml = knowledge.recruiterSkills
      .map(
        (grp) => `
        <div class="card p-5 space-y-3">
          <h3 class="text-sm font-bold text-[var(--text)]">${escHtml(grp.group)}</h3>
          <ul class="space-y-1.5 text-sm text-[var(--muted)] list-none p-0 m-0">
            ${grp.items.map((item) => `<li>· ${escHtml(item)}</li>`).join("")}
          </ul>
        </div>
      `
      )
      .join("");

    const expHtml = knowledge.recruiterExperience
      .map(
        (exp) => `
        <article class="card p-5 space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
            <span class="font-semibold text-[var(--text)]">${escHtml(exp.org)}</span>
            <span class="font-mono-tech tabular-nums text-indigo-400">${escHtml(exp.period)}</span>
          </div>
          <h3 class="text-base font-bold text-[var(--text)]">${escHtml(exp.role)}</h3>
          <p class="text-sm text-[var(--muted)] leading-relaxed">${escHtml(exp.summary)}</p>
        </article>
      `
      )
      .join("");

    const certHtml = knowledge.recruiterCertificates
      .map(
        (cert) => `
        <div class="card p-4 space-y-1">
          <p class="text-sm font-bold text-[var(--text)]">${escHtml(cert.title)}</p>
          <p class="text-xs text-[var(--muted)]">${escHtml(cert.issuer)} · <span class="font-mono-tech tabular-nums text-indigo-400">${escHtml(cert.year)}</span></p>
        </div>
      `
      )
      .join("");

    return `
      <section class="section border-t border-[var(--border)] mode-transition-fade" aria-label="Recruiter Mode Candidate Brief">
        <div class="container space-y-12 sm:space-y-14">
          <!-- 1. Professional Summary & Career Goals -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div class="lg:col-span-7 glass-card p-6 sm:p-8 space-y-4">
              <p class="text-xs font-semibold text-indigo-400">Recruiter Summary · Quick Scan</p>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-[var(--text)]">
                Who I Am &amp; <span class="gradient-text">Career Focus</span>
              </h2>
              <p class="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                Full-Stack &amp; MERN Developer holding a B.Sc. in Computer Science &amp; Engineering (2021–2025) based in ${escHtml(location)}. Focused on joining engineering teams where I can contribute across React/Next.js frontends, modular Node.js/Express APIs, and MongoDB or PostgreSQL data layers.
              </p>
              <div class="pt-2 border-t border-[var(--border)] space-y-1.5">
                <h3 class="text-sm font-bold text-[var(--text)]">Career Goals</h3>
                <p class="text-sm text-[var(--muted)] leading-relaxed">
                  Growing within collaborative full-stack or frontend product engineering teams, shipping accessible production software, and deepening distributed backend &amp; TypeScript architecture skills.
                </p>
              </div>
            </div>

            <div class="lg:col-span-5 glass-card p-6 sm:p-8 flex flex-col justify-between gap-5">
              <div class="space-y-3">
                <h3 class="text-base font-bold text-[var(--text)]">Direct Recruiter Actions</h3>
                <div class="space-y-2 text-xs sm:text-sm text-[var(--muted)]">
                  <p>Location: <strong class="text-[var(--text)]">${escHtml(location)}</strong> (Remote Ready)</p>
                  <p>Languages: <strong class="text-[var(--text)]">Bengali (Native) · English (Working)</strong></p>
                  <p>Email: <strong class="font-mono-tech text-indigo-400">${escHtml(email)}</strong></p>
                  ${githubUser ? `<p>GitHub Handle: <strong class="font-mono-tech text-cyan-400">@${escHtml(githubUser)}</strong></p>` : ""}
                </div>
              </div>

              <div class="flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <a href="${escHtml(resumeHref)}" download="AL_AMIN_Resume.pdf" data-resume-download class="primary-button justify-center">
                  <i data-lucide="download" class="w-4 h-4" aria-hidden="true"></i>
                  <span>Download Resume (PDF)</span>
                </a>
                <div class="grid grid-cols-3 gap-2">
                  <a href="resume.html" class="secondary-button justify-center text-xs">
                    <i data-lucide="file-text" class="w-4 h-4" aria-hidden="true"></i>
                    <span>Resume</span>
                  </a>
                  <a href="recruiter-search.html" class="outline-button justify-center text-xs">
                    <i data-lucide="search" class="w-4 h-4" aria-hidden="true"></i>
                    <span>Search</span>
                  </a>
                  <a href="github.html" class="outline-button justify-center text-xs">
                    <i data-lucide="github" class="w-4 h-4" aria-hidden="true"></i>
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Scannable Technical Skills -->
          <div class="space-y-5 pt-4 border-t border-[var(--border)]">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-[var(--text)]">Technical Skills</h2>
                <p class="text-sm text-[var(--muted)]">Core languages, frameworks, databases, and engineering tooling.</p>
              </div>
              <a href="skills.html" class="text-sm font-semibold text-indigo-400 hover:underline whitespace-nowrap">
                Full Skills Matrix →
              </a>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              ${skillsHtml}
            </div>
          </div>

          <!-- 3. Experience & Education -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-[var(--border)]">
            <div class="lg:col-span-7 space-y-4">
              <div class="flex items-center justify-between gap-3">
                <h2 class="text-2xl font-extrabold text-[var(--text)]">Work Experience</h2>
                <a href="experience.html" class="text-xs font-semibold text-indigo-400 hover:underline whitespace-nowrap">
                  Full Timeline →
                </a>
              </div>
              <div class="space-y-4">
                ${expHtml}
              </div>
            </div>

            <div class="lg:col-span-5 space-y-5">
              <div class="space-y-4">
                <h2 class="text-2xl font-extrabold text-[var(--text)]">Education</h2>
                <div class="card p-5 space-y-2">
                  <div class="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                    <span>${escHtml(knowledge.recruiterEducation.institution)}</span>
                    <span class="font-mono-tech tabular-nums text-cyan-400">${escHtml(knowledge.recruiterEducation.period)}</span>
                  </div>
                  <h3 class="text-base font-bold text-[var(--text)]">${escHtml(knowledge.recruiterEducation.degree)}</h3>
                  <p class="text-sm text-[var(--muted)]">${escHtml(knowledge.recruiterEducation.focus)}</p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-lg font-bold text-[var(--text)]">Certificates</h3>
                  <a href="certificates.html" class="text-xs font-semibold text-indigo-400 hover:underline whitespace-nowrap">
                    View Gallery →
                  </a>
                </div>
                <div class="grid grid-cols-1 gap-3">
                  ${certHtml}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderDeveloperDynamicSections() {
    const primaryModules = [
      {
        title: "System Architecture",
        desc: "Interactive multi-layer diagrams across frontend, API gateway, authentication, databases, and client sandbox boundaries.",
        href: "architecture.html",
        icon: "cpu",
        badge: "Blueprints"
      },
      {
        title: "Code Playground",
        desc: "Isolated HTML, CSS & JavaScript live sandbox with console capture, templates, and responsive viewport switcher.",
        href: "playground.html",
        icon: "code-2",
        badge: "Live Sandbox"
      },
      {
        title: "API Explorer",
        desc: "Interactive REST documentation for GET, POST, PUT, PATCH, and DELETE contracts with request/response inspection.",
        href: "api-explorer.html",
        icon: "webhook",
        badge: "REST Contracts"
      },
      {
        title: "UI Component Lab",
        desc: "16 interactive, production-tested components with live preview, source code tabs, copy actions, and state reset.",
        href: "components.html",
        icon: "blocks",
        badge: "16 Categories"
      },
      {
        title: "Engineering Decisions",
        desc: "Architecture Decision Records (ADRs) documenting trade-offs behind MongoDB, Node.js, JWT RBAC, and modular UI.",
        href: "decisions.html",
        icon: "git-branch",
        badge: "ADR Log"
      },
      {
        title: "Security Center",
        desc: "Verification of client-side XSS escaping, iframe sandboxing, secret hygiene, and safe external link policies.",
        href: "security.html",
        icon: "shield-check",
        badge: "AppSec"
      }
    ];

    const secondaryModules = [
      { title: "Performance Center", href: "performance.html", icon: "gauge" },
      { title: "Knowledge Base", href: "knowledge.html", icon: "book-marked" },
      { title: "Open Source Hub", href: "opensource.html", icon: "git-fork" },
      { title: "Design Playground", href: "design-playground.html", icon: "palette" },
      { title: "Build in Public", href: "build.html", icon: "hammer" },
      { title: "Developer Dashboard", href: "dashboard.html", icon: "layout-dashboard" }
    ];

    const cardsHtml = primaryModules
      .map(
        (mod) => `
        <a href="${escHtml(mod.href)}" class="glass-card hover-lift p-6 flex flex-col justify-between gap-4 group">
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <span class="mode-card-icon mode-card-icon-developer">
                <i data-lucide="${escHtml(mod.icon)}" class="w-5 h-5" aria-hidden="true"></i>
              </span>
              <span class="text-xs font-mono-tech text-emerald-400">${escHtml(mod.badge)}</span>
            </div>
            <h3 class="text-lg font-bold text-[var(--text)] group-hover:text-cyan-400 transition-colors">${escHtml(mod.title)}</h3>
            <p class="text-sm text-[var(--muted)] leading-relaxed">${escHtml(mod.desc)}</p>
          </div>
          <div class="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-cyan-400">
            <span>Open Module</span>
            <i data-lucide="arrow-up-right" class="w-4 h-4" aria-hidden="true"></i>
          </div>
        </a>
      `
      )
      .join("");

    const secondaryHtml = secondaryModules
      .map(
        (m) => `
        <a href="${escHtml(m.href)}" class="card hover-lift p-3.5 flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-[var(--text)]">
          <span class="inline-flex items-center gap-2 min-w-0">
            <i data-lucide="${escHtml(m.icon)}" class="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true"></i>
            <span class="truncate">${escHtml(m.title)}</span>
          </span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-[var(--muted)] shrink-0" aria-hidden="true"></i>
        </a>
      `
      )
      .join("");

    return `
      <section class="section border-t border-[var(--border)] mode-transition-fade" aria-label="Developer Mode Systems">
        <div class="container space-y-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div class="space-y-2 max-w-2xl">
              <p class="text-xs font-semibold text-emerald-400">Developer Focus · Engineering Workbench</p>
              <h2 class="section-title">Explore the <span class="gradient-text">Developer Systems</span></h2>
              <p class="section-subtitle">
                Direct entry points to system architecture, interactive sandboxes, component code, engineering ADRs, and security controls.
              </p>
            </div>
            <a href="knowledge.html" class="outline-button self-start md:self-auto shrink-0">
              <span>Knowledge Base</span>
              <i data-lucide="book-marked" class="w-4 h-4" aria-hidden="true"></i>
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            ${cardsHtml}
          </div>

          <div class="space-y-3 pt-4 border-t border-[var(--border)]">
            <p class="text-xs font-mono-tech uppercase tracking-wider text-[var(--muted)]">Companion Engineering Modules</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${secondaryHtml}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderHomepageDynamicExperience() {
    const container = document.getElementById("mode-dynamic-experience");
    const flowRoot = document.getElementById("homepage-sections-flow");
    if (!container) return;

    const mode = state.currentMode;
    if (flowRoot) {
      flowRoot.setAttribute("data-active-mode", mode);
    }

    if (mode === "default") {
      container.innerHTML = "";
      container.classList.add("hidden");
      return;
    }

    const cfg = window.portfolioConfig || {};
    container.classList.remove("hidden");
    container.innerHTML =
      mode === "client"
        ? renderClientDynamicSections(cfg)
        : mode === "developer"
        ? renderDeveloperDynamicSections()
        : renderRecruiterDynamicSections(cfg);

    // Bind resume links inside injected recruiter hero/sections
    const resumeLinks = document.querySelectorAll("[data-resume-download]");
    const resumeHref = cfg.resumeUrl || "assets/documents/resume.pdf";
    resumeLinks.forEach((link) => {
      link.setAttribute("href", resumeHref);
      if (link.dataset.resumeBound === "true") return;
      link.dataset.resumeBound = "true";
      link.addEventListener("click", () => {
        if (typeof window.showToast === "function") {
          window.showToast("Downloading AL AMIN Resume (PDF)", "success");
        }
      });
    });

    refreshIcons();
  }

  /* ========================================================================
     4. Mode Application, Switching & Event Binding
     ======================================================================== */

  function syncDomWithMode() {
    document.documentElement.dataset.visitorMode = state.currentMode;
    if (document.body) {
      document.body.dataset.visitorMode = state.currentMode;
    }

    if (typeof window.loadNavbar === "function") window.loadNavbar();
    if (typeof window.initMobileMenu === "function") window.initMobileMenu();
    if (typeof window.loadFooter === "function") window.loadFooter();

    renderModeBar();
    renderHomepageSelectorSection();
    updateHomepageHero();
    renderHomepageDynamicExperience();

    // Ensure footer or custom mode triggers update
    bindModeActionTriggers(document);

    if (window.PortfolioBrand) {
      if (typeof window.PortfolioBrand.bindBrandDom === "function") {
        window.PortfolioBrand.bindBrandDom(document);
      }
      if (typeof window.PortfolioBrand.mountSignatures === "function") {
        window.PortfolioBrand.mountSignatures(document);
      }
    }

    // Ensure reordered homepage sections remain immediately visible across mode switches
    if (state.currentMode !== "default") {
      document.querySelectorAll("#homepage-sections-flow .reveal").forEach((el) => {
        el.classList.add("is-visible");
      });
    } else if (window.PortfolioAnimations && typeof window.PortfolioAnimations.initScrollReveal === "function") {
      window.PortfolioAnimations.initScrollReveal();
    }
  }

  function setMode(nextMode, options = {}) {
    if (!isValidMode(nextMode)) return;
    const { notify = true, closeDialog = true } = options;

    state.currentMode = nextMode;
    saveStoredMode(nextMode);
    if (closeDialog) {
      closeModal();
    }

    syncDomWithMode();

    if (notify && typeof window.showToast === "function") {
      const msgMap = {
        client: "Switched to Client Mode — highlighting services, case studies, estimator & project requests.",
        recruiter: "Switched to Recruiter Mode — highlighting resume, experience, skills, GitHub & certificates.",
        developer: "Switched to Developer Mode — highlighting architecture, playground, APIs, components & security.",
        default: "Restored Default Portfolio view."
      };
      window.showToast(msgMap[nextMode], "info");
    }
  }

  function resetMode() {
    setMode("default", { notify: true, closeDialog: true });
  }

  function bindModeActionTriggers(scopeRoot = document) {
    if (!scopeRoot || !scopeRoot.querySelectorAll) return;

    scopeRoot.querySelectorAll("[data-set-visitor-mode]").forEach((btn) => {
      if (btn.dataset.modeBound === "true") return;
      btn.dataset.modeBound = "true";
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-set-visitor-mode");
        setMode(target, { notify: true, closeDialog: true });
      });
    });

    scopeRoot.querySelectorAll("[data-open-mode-selector]").forEach((btn) => {
      if (btn.dataset.modeModalBound === "true") return;
      btn.dataset.modeModalBound = "true";
      btn.addEventListener("click", () => openModal(btn));
    });
  }

  function init() {
    state.currentMode = loadStoredMode();
    captureHeroSnapshot();
    syncDomWithMode();

    if (!init.globalKeyBound) {
      init.globalKeyBound = true;
      document.addEventListener("keydown", (event) => {
        const modal = document.getElementById("mode-selector-modal");
        if (!modal || !modal.classList.contains("is-open")) return;
        if (event.key === "Escape") {
          closeModal();
        } else if (event.key === "Tab" && typeof window.trapDialogFocus === "function") {
          window.trapDialogFocus(modal, event);
        }
      });
    }
  }

  return {
    init,
    state,
    modeMeta,
    knowledge,
    getMode,
    setMode,
    resetMode,
    openModal,
    closeModal,
    getPrioritizedNavLinks,
    getHeaderPrimaryAction,
    syncDomWithMode
  };
})();

window.PortfolioModes = PortfolioModes;
