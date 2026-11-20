/**
 * AL AMIN Portfolio — Phase 20: World-Class Final Experience & Advanced Features
 * Provides:
 * - Global Command Palette (Ctrl+K / Cmd+K) with highlighted results across pages,
 *   projects, skills, blog posts, and quick actions
 * - Optional Vim-style Keyboard Navigation (G then H / P / A / C / R)
 * - Subtle Developer Terminal Easter Egg (Konami code or Palette action)
 * - Persisted Accessibility Mode & Performance Mode settings panel
 * - Configurable Website Status indicator (from portfolioConfig)
 * - Global Share Portfolio, Copy URL, Copy Email Address & Print helpers
 * - Optional Progressive Web App registration & Install App prompt
 */

const PortfolioUX = (() => {
  const MAX_COMMAND_RESULTS = 24;
  const CHORD_TIMEOUT_MS = 1000;
  const KONAMI_SEQUENCE = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a"
  ];

  // Canonical fallback index so global search works seamlessly on pages
  // where projects.js, skills.js, or blog.js are not loaded individually.
  const fallbackProjects = [
    { id: "astrapulse", title: "AstraPulse", category: "SaaS Analytics" },
    { id: "nexora", title: "Nexora", category: "E-Commerce MERN" },
    { id: "slideverse", title: "SLIDEVERSE", category: "Creative Tooling" },
    { id: "school-management-system", title: "School Management System", category: "Admin Dashboard" },
    { id: "portfolio-system", title: "Portfolio System", category: "Architecture" },
    { id: "ecommerce-saas", title: "E-commerce SaaS", category: "Multi-Tenant SaaS" }
  ];

  const fallbackSkills = [
    { name: "HTML5", category: "Frontend" },
    { name: "CSS3", category: "Frontend" },
    { name: "Tailwind CSS", category: "Frontend", queryName: "Tailwind" },
    { name: "JavaScript", category: "Frontend" },
    { name: "React", category: "Frontend" },
    { name: "Redux", category: "Frontend" },
    { name: "Next.js", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "Express", category: "Backend" },
    { name: "REST API", category: "Backend" },
    { name: "Authentication", category: "Backend" },
    { name: "MongoDB", category: "Database" },
    { name: "Mongoose", category: "Database" },
    { name: "PostgreSQL", category: "Database" },
    { name: "Git", category: "Tools" },
    { name: "GitHub", category: "Tools" },
    { name: "VS Code", category: "Tools" },
    { name: "Postman", category: "Tools" },
    { name: "Figma", category: "Tools" }
  ];

  const fallbackBlogPosts = [
    {
      slug: "architecting-multi-tenant-mern-apps",
      title: "Architecting Multi-Tenant MERN Applications for Sub-200ms Latency",
      category: "MERN"
    },
    {
      slug: "composable-react-ui-systems",
      title: "Composable React UI Systems Without Prop-Drilling Bloat",
      category: "React"
    },
    {
      slug: "node-rest-api-validation-patterns",
      title: "Production Node.js REST Validation & Structured Error Handling",
      category: "Node.js"
    },
    {
      slug: "event-loop-async-concurrency-javascript",
      title: "Understanding the Event Loop and Async Concurrency in Modern JavaScript",
      category: "JavaScript"
    },
    {
      slug: "zero-layout-shift-responsive-design",
      title: "Engineering Zero-Layout-Shift Responsive Grids from 320px to 2560px",
      category: "Web Development"
    },
    {
      slug: "practical-ai-assisted-engineering-workflows",
      title: "Practical AI-Assisted Workflows Without Compromising Code Ownership",
      category: "AI"
    },
    {
      slug: "database-indexing-mental-models",
      title: "Database Indexing Mental Models for Full-Stack Developers",
      category: "Programming"
    },
    {
      slug: "writing-engineering-case-studies-that-convert",
      title: "Writing Engineering Case Studies That Impress Technical Hiring Teams",
      category: "Career"
    }
  ];

  const state = {
    cmdOpen: false,
    prefsOpen: false,
    easterOpen: false,
    iosInstallOpen: false,
    activeIndex: 0,
    filteredItems: [],
    lastTrigger: null,
    gPressedAt: 0,
    chordTimer: null,
    konamiBuffer: [],
    deferredInstallPrompt: null,
    isInstalled: false
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

  function showToast(msg, type = "info") {
    if (typeof window.showToast === "function") {
      window.showToast(msg, type);
    }
  }

  function isEditableTarget(target) {
    if (!target) return false;
    const tag = (target.tagName || "").toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (target.isContentEditable) return true;
    if (typeof target.closest === "function" && target.closest('[contenteditable="true"], [role="textbox"]')) {
      return true;
    }
    return false;
  }

  /* ========================================================================
     1. Configured Website Status Indicator
     ======================================================================== */

  function getWebsiteStatusMeta() {
    const cfg = window.portfolioConfig || {};
    const statusKey = (cfg.websiteStatus || cfg.availabilityStatus || "available").toLowerCase();
    const map = cfg.websiteStatusOptions || {
      available: { label: "Available for Projects", tone: "emerald" },
      freelance: { label: "Open to Freelance", tone: "cyan" },
      working: { label: "Currently Working", tone: "indigo" },
      updated: { label: "Portfolio Updated Recently", tone: "violet" }
    };
    const chosen = map[statusKey] || map.available || { label: "Available for Projects", tone: "emerald" };
    return {
      key: statusKey,
      label: chosen.label,
      tone: chosen.tone || "emerald",
      updated: cfg.websiteStatusUpdated || ""
    };
  }

  /* ========================================================================
     2. Clipboard, Share & Print Utilities
     ======================================================================== */

  function copyTextToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  function copyPortfolioUrl(customUrl) {
    const targetUrl = customUrl || window.location.href;
    return copyTextToClipboard(targetUrl)
      .then(() => {
        showToast("Portfolio URL copied to clipboard", "success");
        return true;
      })
      .catch(() => {
        showToast("Could not access clipboard automatically", "warning");
        return false;
      });
  }

  function copyEmailAddress() {
    const cfg = window.portfolioConfig || {};
    const email = cfg.email || "your-email@example.com";
    return copyTextToClipboard(email)
      .then(() => {
        showToast(`Email copied: ${email}`, "success");
        return true;
      })
      .catch(() => {
        showToast(`Email: ${email}`, "info");
        return false;
      });
  }

  function sharePortfolio(opts = {}) {
    const cfg = window.portfolioConfig || {};
    const title = opts.title || document.title || `${cfg.name || "AL AMIN"} Portfolio`;
    const text = opts.text || cfg.bio || "Explore AL AMIN's Full-Stack Developer Portfolio";
    const url = opts.url || window.location.href;

    if (typeof navigator.share === "function") {
      return navigator
        .share({ title, text, url })
        .then(() => true)
        .catch((err) => {
          if (err && err.name === "AbortError") return false;
          return copyPortfolioUrl(url);
        });
    }
    return copyPortfolioUrl(url);
  }

  /* ========================================================================
     3. Command Palette (Ctrl+K / Cmd+K) + Highlighted Search Index
     ======================================================================== */

  function navigateTo(href) {
    if (!href) return;
    window.location.href = href;
  }

  function buildSearchItems() {
    const items = [];
    const routes = window.siteRoutes || {};
    const pageList = [
      ...(routes.navLinks || []),
      { label: "Tech & Project Comparison Explorer", href: "explorer.html" },
      { label: "Interactive Project Architect", href: "project-architect.html" },
      { label: "Project Scope & Cost Estimator", href: "project-estimator.html" },
      { label: "Smart Project Request Wizard", href: "project-request.html" },
      { label: "Interactive Skills Graph", href: "skills.html#skills-graph-section" },
      { label: "Interactive Developer Journey", href: "experience.html#developer-journey-section" },
      { label: "Build in Public", href: "build.html" },
      { label: "Engineering Decision Log", href: "decisions.html" },
      { label: "Security Center", href: "security.html" },
      { label: "Performance Center", href: "performance.html" },
      { label: "Interactive System Architecture", href: "architecture.html" },
      { label: "Interactive API Explorer", href: "api-explorer.html" },
      { label: "UI Component Lab", href: "components.html" },
      { label: "Visual Design Playground", href: "design-playground.html" },
      { label: "Client Proposal Generator", href: "proposal-generator.html" },
      { label: "GitHub Explorer", href: "github.html" },
      { label: "HTML/CSS/JS Code Playground", href: "playground.html" },
      { label: "Interactive Resume / CV", href: "resume.html" },
      { label: "Recruiter Search System", href: "recruiter-search.html" },
      { label: "Personal Knowledge Base", href: "knowledge.html" }
    ];

    const seenPages = new Set();
    pageList.forEach((p) => {
      if (!p || !p.href || seenPages.has(p.href)) return;
      seenPages.add(p.href);
      items.push({
        id: `page-${p.href}`,
        group: "Pages",
        title: p.label,
        subtitle: p.href,
        keywords: `${p.label} ${p.href} page navigate`,
        icon: "compass",
        action: () => navigateTo(p.href)
      });
    });

    // Projects (live from PortfolioProjects or synchronized fallback)
    const projectsList =
      window.PortfolioProjects && Array.isArray(window.PortfolioProjects.projectsData)
        ? window.PortfolioProjects.projectsData
        : fallbackProjects;

    projectsList.forEach((proj) => {
      const techs = Array.isArray(proj.technologies) ? proj.technologies.join(" ") : "";
      items.push({
        id: `proj-${proj.id}`,
        group: "Projects",
        title: proj.title,
        subtitle: `${proj.category} · Case Study`,
        keywords: `${proj.title} ${proj.category} ${techs} case study project`,
        icon: "folder-kanban",
        action: () => navigateTo(`project-details.html?id=${encodeURIComponent(proj.id)}`)
      });
    });

    // Skills (live from PortfolioSkills or synchronized fallback)
    const skillsList =
      window.PortfolioSkills && Array.isArray(window.PortfolioSkills.skillsCatalog)
        ? window.PortfolioSkills.skillsCatalog
        : fallbackSkills;

    skillsList.forEach((sk) => {
      const targetTech = sk.queryName || sk.name;
      items.push({
        id: `skill-${sk.name}`,
        group: "Skills & Tech",
        title: sk.name,
        subtitle: `${sk.category} · Inspect in Explorer`,
        keywords: `${sk.name} ${sk.category} ${sk.level || ""} skill technology`,
        icon: "cpu",
        action: () => navigateTo(`explorer.html?tech=${encodeURIComponent(targetTech)}`)
      });
    });

    // Blog Posts (live from PortfolioBlog or synchronized fallback)
    const postsList =
      window.PortfolioBlog && Array.isArray(window.PortfolioBlog.articlesData)
        ? window.PortfolioBlog.articlesData
        : fallbackBlogPosts;

    postsList.forEach((post) => {
      const tags = Array.isArray(post.tags) ? post.tags.join(" ") : "";
      items.push({
        id: `blog-${post.slug}`,
        group: "Blog Posts",
        title: post.title,
        subtitle: `${post.category} Article`,
        keywords: `${post.title} ${post.category} ${tags} blog article`,
        icon: "book-open",
        action: () => navigateTo(`blog-details.html?article=${encodeURIComponent(post.slug)}`)
      });
    });

    // Quick Actions
    const isLight = document.documentElement.classList.contains("light");
    items.push(
      {
        id: "act-theme",
        group: "Actions",
        title: isLight ? "Switch to Dark Theme" : "Switch to Light Theme",
        subtitle: "Toggle global light / dark appearance",
        keywords: "theme dark light mode toggle appearance",
        icon: isLight ? "moon" : "sun",
        action: () => {
          if (window.PortfolioTheme && typeof window.PortfolioTheme.toggleTheme === "function") {
            window.PortfolioTheme.toggleTheme();
          }
        }
      },
      {
        id: "act-a11y",
        group: "Actions",
        title: "Open Accessibility & Performance Settings",
        subtitle: "Reduce motion, high contrast, larger text, focus & perf mode",
        keywords: "accessibility a11y performance mode contrast motion font blur",
        icon: "accessibility",
        shortcut: "Alt A",
        action: () => openPrefsModal()
      },
      {
        id: "act-share",
        group: "Actions",
        title: "Share Portfolio / Current Page",
        subtitle: "Native share sheet or clipboard link fallback",
        keywords: "share portfolio link url project",
        icon: "share-2",
        action: () => sharePortfolio()
      },
      {
        id: "act-copy-url",
        group: "Actions",
        title: "Copy Portfolio URL",
        subtitle: window.location.href,
        keywords: "copy url link permalink",
        icon: "link",
        action: () => copyPortfolioUrl()
      },
      {
        id: "act-copy-email",
        group: "Actions",
        title: "Copy Email Address",
        subtitle: (window.portfolioConfig && window.portfolioConfig.email) || "your-email@example.com",
        keywords: "copy email contact address hire",
        icon: "mail",
        action: () => copyEmailAddress()
      },
      {
        id: "act-print",
        group: "Actions",
        title: "Print Current Page / Resume / Case Study",
        subtitle: "Opens clean white-background print layout",
        keywords: "print pdf resume case study export",
        icon: "printer",
        action: () => {
          if (typeof window.print === "function") window.print();
        }
      },
      {
        id: "act-client-mode",
        group: "Actions",
        title: "Switch to Client Mode",
        subtitle: "Emphasize services, case studies, and inquiries",
        keywords: "client mode hire project visitor",
        icon: "briefcase",
        action: () => {
          if (window.PortfolioModes) window.PortfolioModes.setMode("client");
        }
      },
      {
        id: "act-recruiter-mode",
        group: "Actions",
        title: "Switch to Recruiter Mode",
        subtitle: "Emphasize skills, experience, resume & GitHub",
        keywords: "recruiter mode resume hiring cv",
        icon: "user-check",
        action: () => {
          if (window.PortfolioModes) window.PortfolioModes.setMode("recruiter");
        }
      },
      {
        id: "act-easter-egg",
        group: "Actions",
        title: "Open Developer Stack Inspector (Easter Egg)",
        subtitle: "Diagnostic modal unlocked via Konami sequence or command",
        keywords: "easter egg developer terminal konami debug inspector",
        icon: "terminal",
        action: () => openEasterEggModal()
      }
    );

    if (state.deferredInstallPrompt || isIOSDevice()) {
      items.push({
        id: "act-pwa-install",
        group: "Actions",
        title: "Install Portfolio Web App",
        subtitle: "Add AL AMIN Portfolio to your home screen or desktop",
        keywords: "install pwa app offline",
        icon: "download",
        action: () => triggerPWAInstall()
      });
    }

    return items;
  }

  function highlightMatch(text, query) {
    const safeText = String(text ?? "");
    const q = String(query || "").trim();
    if (!q) return escHtml(safeText);

    const lowerText = safeText.toLowerCase();
    const lowerQ = q.toLowerCase();
    const matchIdx = lowerText.indexOf(lowerQ);
    if (matchIdx === -1) return escHtml(safeText);

    const before = safeText.slice(0, matchIdx);
    const hit = safeText.slice(matchIdx, matchIdx + q.length);
    const after = safeText.slice(matchIdx + q.length);
    return `${escHtml(before)}<mark class="cmd-highlight">${escHtml(hit)}</mark>${escHtml(after)}`;
  }

  function ensureCommandPaletteModal() {
    let modal = document.getElementById("cmd-palette-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "cmd-palette-modal";
    modal.className = "ux-modal-backdrop cmd-modal-backdrop";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "cmd-palette-title");
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="cmd-panel">
        <h2 id="cmd-palette-title" class="sr-only">Global Command Palette</h2>
        <div class="cmd-search-row">
          <i data-lucide="search" class="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true"></i>
          <input
            id="cmd-palette-input"
            type="search"
            class="cmd-search-input"
            placeholder="Search pages, projects, skills, articles, or actions..."
            autocomplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="cmd-palette-results"
          >
          <button type="button" id="cmd-palette-close" class="icon-button w-8 h-8" aria-label="Close command palette">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div id="cmd-palette-results" class="cmd-list" role="listbox" aria-label="Command results"></div>

        <div class="cmd-footer">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span><kbd class="cmd-kbd">G</kbd> <kbd class="cmd-kbd">H</kbd> Home</span>
            <span><kbd class="cmd-kbd">G</kbd> <kbd class="cmd-kbd">P</kbd> Projects</span>
            <span><kbd class="cmd-kbd">G</kbd> <kbd class="cmd-kbd">A</kbd> About</span>
            <span><kbd class="cmd-kbd">G</kbd> <kbd class="cmd-kbd">C</kbd> Contact</span>
            <span><kbd class="cmd-kbd">G</kbd> <kbd class="cmd-kbd">R</kbd> Resume</span>
          </div>
          <div class="flex items-center gap-2 font-mono-tech">
            <span><kbd class="cmd-kbd">↑↓</kbd> Navigate</span>
            <span><kbd class="cmd-kbd">↵</kbd> Select</span>
            <span><kbd class="cmd-kbd">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const inputEl = document.getElementById("cmd-palette-input");
    const closeBtn = document.getElementById("cmd-palette-close");

    if (closeBtn) closeBtn.addEventListener("click", closeCommandPalette);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeCommandPalette();
    });

    if (inputEl) {
      inputEl.addEventListener("input", () => {
        state.activeIndex = 0;
        renderCommandResults(inputEl.value);
      });

      inputEl.addEventListener("keydown", (event) => {
        const total = state.filteredItems.length;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          if (total > 0) {
            state.activeIndex = (state.activeIndex + 1) % total;
            renderCommandResults(inputEl.value);
          }
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          if (total > 0) {
            state.activeIndex = (state.activeIndex - 1 + total) % total;
            renderCommandResults(inputEl.value);
          }
        } else if (event.key === "Enter") {
          event.preventDefault();
          const chosen = state.filteredItems[state.activeIndex];
          if (chosen) executeCommandItem(chosen);
        }
      });
    }

    refreshIcons();
    return modal;
  }

  function executeCommandItem(item) {
    closeCommandPalette();
    if (item && typeof item.action === "function") {
      item.action();
    }
  }

  function renderCommandResults(rawQuery) {
    const mount = document.getElementById("cmd-palette-results");
    const inputEl = document.getElementById("cmd-palette-input");
    if (!mount) return;

    const query = String(rawQuery || "").trim().toLowerCase();
    const catalog = buildSearchItems();

    const matches = query
      ? catalog.filter((item) => {
          const hay = `${item.title} ${item.subtitle} ${item.group} ${item.keywords}`.toLowerCase();
          return hay.includes(query);
        })
      : catalog.slice(0, MAX_COMMAND_RESULTS);

    state.filteredItems = matches.slice(0, MAX_COMMAND_RESULTS);
    if (state.activeIndex >= state.filteredItems.length) {
      state.activeIndex = 0;
    }

    if (state.filteredItems.length === 0) {
      mount.innerHTML = `
        <div class="p-8 text-center space-y-2">
          <p class="text-sm font-semibold text-[var(--text)]">No matching routes, projects, or actions</p>
          <p class="text-xs text-[var(--muted)]">Try searching "AstraPulse", "React", "Resume", "Theme", or "Contrast".</p>
        </div>
      `;
      if (inputEl) inputEl.removeAttribute("aria-activedescendant");
      return;
    }

    let html = "";
    let lastGroup = "";
    state.filteredItems.forEach((item, idx) => {
      if (item.group !== lastGroup) {
        lastGroup = item.group;
        html += `<div class="cmd-group-label">${escHtml(lastGroup)}</div>`;
      }
      const isSelected = idx === state.activeIndex;
      const optionId = `cmd-opt-${idx}`;
      html += `
        <button
          type="button"
          id="${optionId}"
          role="option"
          aria-selected="${isSelected ? "true" : "false"}"
          class="cmd-item ${isSelected ? "is-active" : ""}"
          data-cmd-index="${idx}"
        >
          <span class="flex items-center gap-3 min-w-0">
            <i data-lucide="${escHtml(item.icon)}" class="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true"></i>
            <span class="min-w-0">
              <span class="block text-sm font-semibold text-[var(--text)] truncate">${highlightMatch(item.title, rawQuery)}</span>
              <span class="block text-xs text-[var(--muted)] truncate">${highlightMatch(item.subtitle, rawQuery)}</span>
            </span>
          </span>
          ${item.shortcut ? `<span class="cmd-kbd shrink-0">${escHtml(item.shortcut)}</span>` : `<i data-lucide="corner-down-left" class="w-3.5 h-3.5 text-[var(--muted)] shrink-0" aria-hidden="true"></i>`}
        </button>
      `;
    });

    mount.innerHTML = html;
    if (inputEl && state.filteredItems[state.activeIndex]) {
      inputEl.setAttribute("aria-activedescendant", `cmd-opt-${state.activeIndex}`);
    }

    mount.querySelectorAll("[data-cmd-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-cmd-index") || "0");
        const item = state.filteredItems[idx];
        if (item) executeCommandItem(item);
      });
    });

    refreshIcons();
  }

  function openCommandPalette(triggerEl) {
    closeAllUxModals("cmd");
    state.lastTrigger = triggerEl || document.activeElement;
    const modal = ensureCommandPaletteModal();
    state.cmdOpen = true;
    state.activeIndex = 0;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");

    const inputEl = document.getElementById("cmd-palette-input");
    if (inputEl) {
      inputEl.value = "";
      renderCommandResults("");
      window.setTimeout(() => inputEl.focus(), 30);
    } else {
      renderCommandResults("");
    }
  }

  function closeCommandPalette() {
    const modal = document.getElementById("cmd-palette-modal");
    if (!modal || !state.cmdOpen) return;
    state.cmdOpen = false;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    if (state.lastTrigger && typeof state.lastTrigger.focus === "function") {
      state.lastTrigger.focus();
    }
  }

  /* ========================================================================
     4 & 5. Accessibility & Performance Settings Panel (Persisted)
     ======================================================================== */

  function getPrefsSnapshot() {
    if (window.PortfolioTheme && typeof window.PortfolioTheme.getSavedPrefs === "function") {
      return window.PortfolioTheme.getSavedPrefs();
    }
    return {
      reduceMotion: null,
      highContrast: false,
      largeText: false,
      strongFocus: false,
      noDecor: false,
      perfMode: false
    };
  }

  function updatePref(key, value) {
    if (!window.PortfolioTheme || typeof window.PortfolioTheme.saveAndApplyPrefs !== "function") return;
    const current = getPrefsSnapshot();
    const updated = { ...current, [key]: value };
    window.PortfolioTheme.saveAndApplyPrefs(updated);
    renderPrefsBody();
  }

  function resetAllPrefs() {
    if (!window.PortfolioTheme || typeof window.PortfolioTheme.saveAndApplyPrefs !== "function") return;
    const defaults = window.PortfolioTheme.getDefaultPrefs();
    window.PortfolioTheme.saveAndApplyPrefs(defaults);
    renderPrefsBody();
    showToast("Accessibility and performance preferences reset to defaults", "info");
  }

  function renderPrefsBody() {
    const body = document.getElementById("ux-prefs-body");
    if (!body) return;

    const prefs = getPrefsSnapshot();
    const osReduced =
      window.PortfolioTheme && typeof window.PortfolioTheme.osPrefersReducedMotion === "function"
        ? window.PortfolioTheme.osPrefersReducedMotion()
        : false;
    const effectiveReduceMotion = prefs.reduceMotion === null ? osReduced : Boolean(prefs.reduceMotion);

    const rows = [
      {
        key: "reduceMotion",
        title: "Reduce Motion",
        desc: osReduced && prefs.reduceMotion === null
          ? "Following your OS prefers-reduced-motion setting (active)."
          : "Minimize page transitions, reveal slides, typing loops, and floating animations.",
        checked: effectiveReduceMotion,
        group: "Accessibility Mode"
      },
      {
        key: "highContrast",
        title: "High Contrast Mode",
        desc: "Increase border definition, background separation, and text contrast across cards.",
        checked: Boolean(prefs.highContrast),
        group: "Accessibility Mode"
      },
      {
        key: "largeText",
        title: "Larger Text Scale",
        desc: "Scale base typography size smoothly for comfortable long-form reading.",
        checked: Boolean(prefs.largeText),
        group: "Accessibility Mode"
      },
      {
        key: "strongFocus",
        title: "Stronger Focus Indicators",
        desc: "Display prominent high-visibility keyboard focus rings around active elements.",
        checked: Boolean(prefs.strongFocus),
        group: "Accessibility Mode"
      },
      {
        key: "noDecor",
        title: "Disable Decorative Effects",
        desc: "Hide ambient radial gradients, grid lines, and card glow borders.",
        checked: Boolean(prefs.noDecor),
        group: "Accessibility Mode"
      },
      {
        key: "perfMode",
        title: "Performance Mode",
        desc: "Disable backdrop blur filters, hero mouse glow, 3D tilt/parallax, and background animations for low-end mobile devices.",
        checked: Boolean(prefs.perfMode),
        group: "Performance Mode"
      }
    ];

    let html = "";
    let lastGroup = "";
    rows.forEach((row) => {
      if (row.group !== lastGroup) {
        lastGroup = row.group;
        html += `<p class="text-xs font-mono-tech uppercase tracking-wider text-cyan-400 pt-2">${escHtml(lastGroup)}</p>`;
      }
      html += `
        <div class="ux-pref-row">
          <div class="min-w-0 space-y-0.5">
            <p class="text-sm font-bold text-[var(--text)]">${escHtml(row.title)}</p>
            <p class="text-xs text-[var(--muted)] leading-relaxed">${escHtml(row.desc)}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked="${row.checked ? "true" : "false"}"
            aria-label="${escHtml(row.title)}"
            class="ux-switch"
            data-ux-pref-toggle="${escHtml(row.key)}"
          >
            <span class="ux-switch-thumb" aria-hidden="true"></span>
          </button>
        </div>
      `;
    });

    body.innerHTML = html;

    body.querySelectorAll("[data-ux-pref-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-ux-pref-toggle");
        const cur = getPrefsSnapshot();
        if (key === "reduceMotion") {
          const next = !(cur.reduceMotion === null ? osReduced : Boolean(cur.reduceMotion));
          updatePref("reduceMotion", next);
        } else {
          updatePref(key, !cur[key]);
        }
      });
    });
  }

  function ensurePrefsModal() {
    let modal = document.getElementById("ux-prefs-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "ux-prefs-modal";
    modal.className = "ux-modal-backdrop";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "ux-prefs-title");
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="ux-modal-panel p-5 sm:p-7 space-y-5">
        <div class="flex items-start justify-between gap-4 pb-3 border-b border-[var(--border)]">
          <div class="space-y-1">
            <h2 id="ux-prefs-title" class="text-lg sm:text-xl font-extrabold text-[var(--text)]">Accessibility &amp; Performance Settings</h2>
            <p class="text-xs sm:text-sm text-[var(--muted)]">Preferences are saved automatically in your browser and persist across all pages.</p>
          </div>
          <button type="button" id="ux-prefs-close" class="icon-button" aria-label="Close accessibility and performance settings">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div id="ux-prefs-body" class="space-y-3"></div>

        <div class="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
          <button type="button" id="ux-prefs-reset" class="outline-button text-xs sm:text-sm">
            <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
            <span>Reset Preferences</span>
          </button>
          <button type="button" id="ux-prefs-done" class="primary-button text-xs sm:text-sm">Done</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("ux-prefs-close").addEventListener("click", closePrefsModal);
    document.getElementById("ux-prefs-done").addEventListener("click", closePrefsModal);
    document.getElementById("ux-prefs-reset").addEventListener("click", resetAllPrefs);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closePrefsModal();
    });

    refreshIcons();
    return modal;
  }

  function openPrefsModal(triggerEl) {
    closeAllUxModals("prefs");
    state.lastTrigger = triggerEl || document.activeElement;
    const modal = ensurePrefsModal();
    renderPrefsBody();
    state.prefsOpen = true;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    const closeBtn = document.getElementById("ux-prefs-close");
    if (closeBtn) window.setTimeout(() => closeBtn.focus(), 30);
  }

  function closePrefsModal() {
    const modal = document.getElementById("ux-prefs-modal");
    if (!modal || !state.prefsOpen) return;
    state.prefsOpen = false;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    if (state.lastTrigger && typeof state.lastTrigger.focus === "function") {
      state.lastTrigger.focus();
    }
  }

  /* ========================================================================
     6. Subtle Developer-Themed Easter Egg Modal
     ======================================================================== */

  function ensureEasterEggModal() {
    let modal = document.getElementById("dev-easter-egg-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "dev-easter-egg-modal";
    modal.className = "ux-modal-backdrop";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "ee-modal-title");
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="ux-modal-panel p-5 sm:p-7 space-y-5">
        <div class="flex items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
          <div class="flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-lg border border-cyan-500/35 bg-cyan-500/12 text-cyan-400 inline-flex items-center justify-center">
              <i data-lucide="terminal" class="w-5 h-5"></i>
            </span>
            <div>
              <h2 id="ee-modal-title" class="text-base sm:text-lg font-extrabold text-[var(--text)] font-mono-tech">// Developer Stack Inspector</h2>
              <p class="text-xs text-[var(--muted)]">Subtle Engineering Diagnostic View (Unlocked cleanly via Konami or ⌘K)</p>
            </div>
          </div>
          <button type="button" id="ee-modal-close" class="icon-button" aria-label="Close Developer Inspector">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div id="ee-terminal-body" class="terminal-panel space-y-2 text-xs leading-relaxed"></div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div class="flex flex-wrap gap-2">
            <a href="playground.html" class="secondary-button text-xs py-2 px-3 min-h-[38px]">Open Playground</a>
            <a href="explorer.html" class="outline-button text-xs py-2 px-3 min-h-[38px]">Tech Explorer</a>
          </div>
          <button type="button" id="ee-modal-dismiss" class="primary-button text-xs py-2 px-4 min-h-[38px]">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.getElementById("ee-modal-close").addEventListener("click", closeEasterEggModal);
    document.getElementById("ee-modal-dismiss").addEventListener("click", closeEasterEggModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeEasterEggModal();
    });

    refreshIcons();
    return modal;
  }

  function openEasterEggModal(triggerEl) {
    closeAllUxModals("easter");
    state.lastTrigger = triggerEl || document.activeElement;
    const modal = ensureEasterEggModal();
    const status = getWebsiteStatusMeta();
    const prefs = getPrefsSnapshot();
    const mode =
      window.PortfolioModes && typeof window.PortfolioModes.getMode === "function"
        ? window.PortfolioModes.getMode()
        : "default";
    const theme = document.documentElement.classList.contains("light") ? "light" : "dark";

    const bodyEl = document.getElementById("ee-terminal-body");
    if (bodyEl) {
      bodyEl.innerHTML = `
        <p><span class="text-cyan-400">$ portfolio inspect --runtime</span></p>
        <p><span class="text-slate-400">stack:</span> HTML5 + CSS3 + Tailwind CDN + Modular Vanilla JS (Zero frameworks)</p>
        <p><span class="text-slate-400">status:</span> ${escHtml(status.label)}</p>
        <p><span class="text-slate-400">theme / mode:</span> ${escHtml(theme)} / ${escHtml(mode)}</p>
        <p><span class="text-slate-400">viewport:</span> ${escHtml(String(window.innerWidth || 0))}px x ${escHtml(String(window.innerHeight || 0))}px</p>
        <p><span class="text-slate-400">perf / contrast:</span> ${prefs.perfMode ? "enabled" : "off"} / ${prefs.highContrast ? "enabled" : "off"}</p>
        <p class="text-indigo-300 pt-1">Tip: Press G then H/P/A/C/R to jump routes instantly, or Ctrl/Cmd + K to search everything.</p>
      `;
    }

    state.easterOpen = true;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    const closeBtn = document.getElementById("ee-modal-close");
    if (closeBtn) window.setTimeout(() => closeBtn.focus(), 30);
  }

  function closeEasterEggModal() {
    const modal = document.getElementById("dev-easter-egg-modal");
    if (!modal || !state.easterOpen) return;
    state.easterOpen = false;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    if (state.lastTrigger && typeof state.lastTrigger.focus === "function") {
      state.lastTrigger.focus();
    }
  }

  function closeAllUxModals(except) {
    if (except !== "cmd") closeCommandPalette();
    if (except !== "prefs") closePrefsModal();
    if (except !== "easter") closeEasterEggModal();
  }

  /* ========================================================================
     7. Keyboard Shortcuts (Ctrl/Cmd+K, G+H/P/A/C/R, Konami Easter Egg)
     ======================================================================== */

  function ensureChordHint() {
    let el = document.getElementById("kbd-chord-hint");
    if (!el) {
      el = document.createElement("div");
      el.id = "kbd-chord-hint";
      el.className = "kbd-chord-hint font-mono-tech";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    return el;
  }

  function showChordHint() {
    const el = ensureChordHint();
    el.innerHTML = `Go to: <kbd class="cmd-kbd">H</kbd> Home · <kbd class="cmd-kbd">P</kbd> Projects · <kbd class="cmd-kbd">A</kbd> About · <kbd class="cmd-kbd">C</kbd> Contact · <kbd class="cmd-kbd">R</kbd> Resume`;
    el.classList.add("is-open");
    if (state.chordTimer) window.clearTimeout(state.chordTimer);
    state.chordTimer = window.setTimeout(hideChordHint, CHORD_TIMEOUT_MS);
  }

  function hideChordHint() {
    state.gPressedAt = 0;
    const el = document.getElementById("kbd-chord-hint");
    if (el) el.classList.remove("is-open");
    if (state.chordTimer) {
      window.clearTimeout(state.chordTimer);
      state.chordTimer = null;
    }
  }

  function bindGlobalKeyboard() {
    if (bindGlobalKeyboard.bound) return;
    bindGlobalKeyboard.bound = true;

    document.addEventListener("keydown", (event) => {
      // Handle open Phase 20 modals first
      if (state.cmdOpen || state.prefsOpen || state.easterOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeAllUxModals("");
          return;
        }
        if (event.key === "Tab" && typeof window.trapDialogFocus === "function") {
          const activeModal = state.cmdOpen
            ? document.getElementById("cmd-palette-modal")
            : state.prefsOpen
            ? document.getElementById("ux-prefs-modal")
            : document.getElementById("dev-easter-egg-modal");
          if (activeModal) window.trapDialogFocus(activeModal, event);
        }
        return;
      }

      // Never intercept keyboard shortcuts while typing inside inputs/textareas/contenteditable
      if (isEditableTarget(event.target)) {
        hideChordHint();
        return;
      }

      // Ctrl+K or Cmd+K -> Command Palette
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openCommandPalette();
        return;
      }

      // Alt+A -> Accessibility & Performance Settings
      if (event.altKey && !event.ctrlKey && !event.metaKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        openPrefsModal();
        return;
      }

      // Ignore other modified key presses for single-key shortcuts
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      // Track Konami Easter Egg sequence
      const keyNorm = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      state.konamiBuffer.push(keyNorm);
      if (state.konamiBuffer.length > KONAMI_SEQUENCE.length) {
        state.konamiBuffer.shift();
      }
      if (
        state.konamiBuffer.length === KONAMI_SEQUENCE.length &&
        KONAMI_SEQUENCE.every((expected, idx) => state.konamiBuffer[idx] === expected)
      ) {
        state.konamiBuffer = [];
        hideChordHint();
        openEasterEggModal();
        return;
      }

      const now = Date.now();
      const lower = event.key.toLowerCase();

      // Second key after G within timeout
      if (state.gPressedAt && now - state.gPressedAt <= CHORD_TIMEOUT_MS) {
        const chordMap = {
          h: "index.html",
          p: "projects.html",
          a: "about.html",
          c: "contact.html",
          r: "resume.html"
        };
        if (chordMap[lower]) {
          event.preventDefault();
          hideChordHint();
          navigateTo(chordMap[lower]);
          return;
        }
      }

      if (lower === "g" && !event.shiftKey) {
        state.gPressedAt = now;
        showChordHint();
      } else {
        hideChordHint();
      }
    });
  }

  /* ========================================================================
     8. Optional Safe PWA Registration & In-App Install Prompt
     ======================================================================== */

  function isIOSDevice() {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent || "");
  }

  function isStandaloneMode() {
    const matchStand =
      typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches;
    return Boolean(matchStand || window.navigator.standalone === true);
  }

  function syncInstallButtonsVisibility() {
    const buttons = document.querySelectorAll("[data-pwa-install-btn]");
    const installed = isStandaloneMode() || state.isInstalled;
    const canShow = !installed && (Boolean(state.deferredInstallPrompt) || isIOSDevice());
    buttons.forEach((btn) => {
      btn.classList.toggle("hidden", !canShow);
    });
  }

  function triggerPWAInstall() {
    if (state.deferredInstallPrompt && typeof state.deferredInstallPrompt.prompt === "function") {
      state.deferredInstallPrompt.prompt();
      Promise.resolve(state.deferredInstallPrompt.userChoice)
        .then((choice) => {
          if (choice && choice.outcome === "accepted") {
            state.isInstalled = true;
            state.deferredInstallPrompt = null;
            syncInstallButtonsVisibility();
            showToast("Portfolio installed for quick access", "success");
          }
        })
        .catch(() => {});
      return;
    }
    if (isIOSDevice()) {
      showToast('In Safari: tap Share then choose "Add to Home Screen"', "info");
    }
  }

  function initPWA() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      state.deferredInstallPrompt = event;
      syncInstallButtonsVisibility();
    });

    window.addEventListener("appinstalled", () => {
      state.isInstalled = true;
      state.deferredInstallPrompt = null;
      syncInstallButtonsVisibility();
    });

    if (
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator &&
      window.isSecureContext
    ) {
      try {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      } catch (_err) {
        // Service worker optional — site continues normally if blocked
      }
    }

    syncInstallButtonsVisibility();
  }

  /* ========================================================================
     9. Bind Declarative UI Triggers Across Pages
     ======================================================================== */

  function bindGlobalActionTriggers(scopeRoot = document) {
    scopeRoot.querySelectorAll("[data-open-command-palette]").forEach((btn) => {
      if (btn.dataset.cmdBound === "true") return;
      btn.dataset.cmdBound = "true";
      btn.addEventListener("click", () => openCommandPalette(btn));
    });

    scopeRoot.querySelectorAll("[data-open-ux-prefs]").forEach((btn) => {
      if (btn.dataset.prefsBound === "true") return;
      btn.dataset.prefsBound = "true";
      btn.addEventListener("click", () => openPrefsModal(btn));
    });

    scopeRoot.querySelectorAll("[data-share-portfolio]").forEach((btn) => {
      if (btn.dataset.shareBound === "true") return;
      btn.dataset.shareBound = "true";
      btn.addEventListener("click", () => sharePortfolio());
    });

    scopeRoot.querySelectorAll("[data-copy-portfolio-url]").forEach((btn) => {
      if (btn.dataset.copyUrlBound === "true") return;
      btn.dataset.copyUrlBound = "true";
      btn.addEventListener("click", () => copyPortfolioUrl());
    });

    scopeRoot.querySelectorAll("[data-copy-email]").forEach((btn) => {
      if (btn.dataset.copyEmailBound === "true") return;
      btn.dataset.copyEmailBound = "true";
      btn.addEventListener("click", () => copyEmailAddress());
    });

    scopeRoot.querySelectorAll("[data-pwa-install-btn]").forEach((btn) => {
      if (btn.dataset.pwaBound === "true") return;
      btn.dataset.pwaBound = "true";
      btn.addEventListener("click", triggerPWAInstall);
    });

    syncInstallButtonsVisibility();
  }

  function init() {
    if (window.PortfolioTheme && typeof window.PortfolioTheme.applyPrefs === "function") {
      window.PortfolioTheme.applyPrefs();
    }
    bindGlobalKeyboard();
    bindGlobalActionTriggers(document);
    initPWA();
  }

  return {
    init,
    openCommandPalette,
    closeCommandPalette,
    openPrefsModal,
    closePrefsModal,
    openEasterEggModal,
    closeEasterEggModal,
    updatePref,
    resetAllPrefs,
    getPrefsSnapshot,
    getWebsiteStatusMeta,
    sharePortfolio,
    copyPortfolioUrl,
    copyEmailAddress,
    buildSearchItems,
    highlightMatch,
    bindGlobalActionTriggers,
    isEditableTarget
  };
})();

window.PortfolioUX = PortfolioUX;
