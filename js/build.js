/**
 * AL AMIN Portfolio — Phase 27: Build-in-Public System
 * Displays currently active builds, 6-stage project statuses, milestones,
 * filterable build logs (All, Active, Completed, Experiments), and screenshot previews.
 */

(() => {
  const PROJECT_STATUSES = [
    "Planning",
    "Design",
    "Development",
    "Testing",
    "Deployment",
    "Completed"
  ];

  const FILTER_OPTIONS = ["All", "Active", "Completed", "Experiments"];

  const STATUS_ICONS = {
    Planning: "compass",
    Design: "pen-tool",
    Development: "code-2",
    Testing: "check-circle-2",
    Deployment: "cloud-upload",
    Completed: "award"
  };

  const DEFAULT_BUILD_PROJECTS = [
    {
      id: "astrapulse",
      title: "AstraPulse",
      category: "Active",
      status: "Development",
      progress: 78,
      isCurrentFeatured: true,
      summary:
        "Real-time API telemetry, regional throughput analytics, and multi-workspace alerting console engineered on the MERN stack.",
      currentMilestone: "Time-Bucketed MongoDB Aggregation & Workspace RBAC Guard",
      nextMilestone: "Server-Sent Events Live Tailing & Filtered Incident CSV Export",
      technologies: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "REST API"],
      href: "project-details.html?id=astrapulse",
      screenshot: "assets/images/projects/astrapulse.jpg"
    },
    {
      id: "portfolio-system",
      title: "Portfolio System & Engineering Utilities",
      category: "Active",
      status: "Testing",
      progress: 92,
      isCurrentFeatured: false,
      summary:
        "Expanding the AL AMIN static portfolio ecosystem with browser-first engineering tools: Architect, Scope Estimator, Request Wizard, Skills Graph, and Build-in-Public Log.",
      currentMilestone: "Multi-Viewport QA & Light/Dark/High-Contrast Token Parity",
      nextMilestone: "Service Worker Precache Optimization & Final Accessibility Audit",
      technologies: ["HTML5", "CSS3", "Tailwind CSS", "JavaScript", "SVG"],
      href: "project-details.html?id=portfolio-system",
      screenshot: "assets/images/projects/portfolio-system.jpg"
    },
    {
      id: "playground-sandbox",
      title: "Browser Code Playground Lab",
      category: "Experiments",
      status: "Design",
      progress: 64,
      isCurrentFeatured: false,
      summary:
        "Experimenting with multi-pane HTML/CSS/JS live preview presets, instant console diagnostics, and clean split-screen mobile ergonomics.",
      currentMilestone: "Split-Pane Ergonomics & Starter Template Library",
      nextMilestone: "Exportable Single-File HTML Snippet Download",
      technologies: ["JavaScript", "HTML5", "CSS3", "Tailwind CSS"],
      href: "playground.html",
      screenshot: "assets/images/blog/js-async.svg"
    },
    {
      id: "rule-architect-engine",
      title: "Deterministic Architecture Rule Engine",
      category: "Experiments",
      status: "Planning",
      progress: 45,
      isCurrentFeatured: false,
      summary:
        "Prototyping structured client-to-server adapter interfaces that convert rule-based architecture specs into scoped project request briefs.",
      currentMilestone: "Specifying Clean Client Adapter Contract for Backend Proxy",
      nextMilestone: "One-Click Handoff From Project Architect to Request Brief",
      technologies: ["JavaScript", "SVG", "REST API", "Tailwind CSS"],
      href: "project-architect.html",
      screenshot: "assets/images/blog/programming-patterns.svg"
    },
    {
      id: "nexora",
      title: "Nexora",
      category: "Completed",
      status: "Completed",
      progress: 100,
      isCurrentFeatured: false,
      summary:
        "Modular headless e-commerce storefront with instant category discovery, search filtering, and persistent slide-over checkout drawer.",
      currentMilestone: "Shipped Production Storefront & Persistent Cart Flows",
      nextMilestone: "Post-Launch Performance & Search UX Refinements",
      technologies: ["React", "Redux", "Node.js", "Express", "MongoDB", "REST API"],
      href: "project-details.html?id=nexora",
      screenshot: "assets/images/projects/nexora.jpg"
    },
    {
      id: "slideverse",
      title: "SLIDEVERSE",
      category: "Completed",
      status: "Completed",
      progress: 100,
      isCurrentFeatured: false,
      summary:
        "Interactive visual presentation studio crafted for clean slide deck composition, keyboard navigation, and crisp typography.",
      currentMilestone: "Shipped Interactive Presentation Canvas & Controls",
      nextMilestone: "Keyboard Shortcut Polish",
      technologies: ["React", "JavaScript", "HTML5", "CSS3", "Tailwind CSS"],
      href: "project-details.html?id=slideverse",
      screenshot: "assets/images/projects/slideverse.jpg"
    },
    {
      id: "school-management-system",
      title: "School Management System",
      category: "Completed",
      status: "Completed",
      progress: 100,
      isCurrentFeatured: false,
      summary:
        "Role-based academic administration portal with validated Mongoose schemas, attendance workflows, and structured CRUD views.",
      currentMilestone: "Shipped Role-Based Dashboards & Validated Endpoints",
      nextMilestone: "Completed Showcase Release",
      technologies: ["React", "Node.js", "Express", "MongoDB", "Mongoose"],
      href: "project-details.html?id=school-management-system",
      screenshot: "assets/images/projects/school-management.jpg"
    },
    {
      id: "ecommerce-saas",
      title: "E-commerce SaaS",
      category: "Completed",
      status: "Completed",
      progress: 100,
      isCurrentFeatured: false,
      summary:
        "Multi-tenant merchant operations platform uniting storefront inventory management, order workflows, and revenue summaries.",
      currentMilestone: "Shipped Multi-Store Admin & Inventory System",
      nextMilestone: "Completed Case Study Archive",
      technologies: ["Next.js", "React", "Node.js", "PostgreSQL", "Tailwind CSS"],
      href: "project-details.html?id=ecommerce-saas",
      screenshot: "assets/images/projects/ecommerce-saas.jpg"
    }
  ];

  const DEFAULT_BUILD_UPDATES = [
    {
      id: "upd-astrapulse-buckets",
      date: "2026-11-18",
      projectId: "astrapulse",
      project: "AstraPulse",
      category: "Active",
      status: "Development",
      title: "Time-Bucketed Aggregation Pipelines & Compound Indexing",
      description:
        "Implemented hourly and daily metric bucket documents with compound indexes on workspaceId and windowStart so 24-hour API latency charts avoid full collection scans.",
      technologies: ["MongoDB", "Node.js", "Express", "REST API"],
      progress: 78,
      screenshot: {
        src: "assets/images/projects/astrapulse.jpg",
        alt: "AstraPulse real-time latency and throughput dashboard screenshot"
      }
    },
    {
      id: "upd-portfolio-journey",
      date: "2026-11-16",
      projectId: "portfolio-system",
      project: "Portfolio System & Engineering Utilities",
      category: "Active",
      status: "Testing",
      title: "Interactive Developer Journey, Skills Graph & Build-in-Public Module",
      description:
        "Built modular SVG skill dependency mapping, a 10-stage interactive developer timeline, and responsive dark/light contrast verification across 320px–2560px viewports.",
      technologies: ["HTML5", "CSS3", "Tailwind CSS", "JavaScript", "SVG"],
      progress: 92,
      screenshot: {
        src: "assets/images/projects/portfolio-system.jpg",
        alt: "Portfolio System interactive tools showcase screenshot"
      }
    },
    {
      id: "upd-playground-split",
      date: "2026-11-12",
      projectId: "playground-sandbox",
      project: "Browser Code Playground Lab",
      category: "Experiments",
      status: "Design",
      title: "Responsive Sandboxed Frame & Starter Snippets",
      description:
        "Designed a clean layout pairing instant HTML/CSS/JS live previewing with structured console output capture without external bundler dependencies.",
      technologies: ["JavaScript", "HTML5", "CSS3"],
      progress: 64,
      screenshot: {
        src: "assets/images/blog/js-async.svg",
        alt: "Browser Code Playground async execution concept diagram"
      }
    },
    {
      id: "upd-architect-spec",
      date: "2026-11-08",
      projectId: "rule-architect-engine",
      project: "Deterministic Architecture Rule Engine",
      category: "Experiments",
      status: "Planning",
      title: "Clean Client-to-Proxy Spec Handoff Contract",
      description:
        "Outlined a deterministic JSON blueprint contract enabling the Project Architect tool to emit structured stack recommendations and optionally forward them to future server endpoints.",
      technologies: ["JavaScript", "SVG", "REST API"],
      progress: 45,
      screenshot: {
        src: "assets/images/blog/programming-patterns.svg",
        alt: "Deterministic architecture blueprint patterns diagram"
      }
    },
    {
      id: "upd-ecommerce-deployment",
      date: "2026-10-28",
      projectId: "ecommerce-saas",
      project: "E-commerce SaaS",
      category: "Completed",
      status: "Deployment",
      title: "Production Readiness & Multi-Tenant Environment Hardening",
      description:
        "Completed deployment checklist covering environment configuration, PostgreSQL query tuning, and clean responsive validation prior to case study publication.",
      technologies: ["Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
      progress: 96,
      screenshot: {
        src: "assets/images/projects/ecommerce-saas.jpg",
        alt: "E-commerce SaaS merchant dashboard screenshot"
      }
    },
    {
      id: "upd-nexora-release",
      date: "2026-09-20",
      projectId: "nexora",
      project: "Nexora",
      category: "Completed",
      status: "Completed",
      title: "Headless Storefront & Slide-Over Cart Launch",
      description:
        "Finalized instant category filters, search synchronization, and persistent cart drawer state across desktop and mobile checkout breakpoints.",
      technologies: ["React", "Redux", "Node.js", "MongoDB"],
      progress: 100,
      screenshot: {
        src: "assets/images/projects/nexora.jpg",
        alt: "Nexora headless e-commerce storefront screenshot"
      }
    },
    {
      id: "upd-school-release",
      date: "2026-08-14",
      projectId: "school-management-system",
      project: "School Management System",
      category: "Completed",
      status: "Completed",
      title: "Role-Based Academic Dashboards & Schema Validation Complete",
      description:
        "Completed admin, teacher, and student access controls backed by strict Mongoose schema rules and Postman-verified REST API endpoints.",
      technologies: ["React", "Node.js", "Express", "MongoDB", "Mongoose"],
      progress: 100,
      screenshot: {
        src: "assets/images/projects/school-management.jpg",
        alt: "School Management System administration portal screenshot"
      }
    },
    {
      id: "upd-slideverse-release",
      date: "2026-07-05",
      projectId: "slideverse",
      project: "SLIDEVERSE",
      category: "Completed",
      status: "Completed",
      title: "Interactive Presentation Workspace Completed",
      description:
        "Wrapped responsive slide previewing, keyboard stage transitions, and structured typography controls cleanly inside the SLIDEVERSE build.",
      technologies: ["React", "JavaScript", "HTML5", "CSS3", "Tailwind CSS"],
      progress: 100,
      screenshot: {
        src: "assets/images/projects/slideverse.jpg",
        alt: "SLIDEVERSE presentation studio screenshot"
      }
    }
  ];

  function escHtml(value) {
    if (typeof window.escapeHtml === "function") {
      return window.escapeHtml(value);
    }
    return String(value == null ? "" : value)
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

  function getBuildConfigData() {
    const cfg = (window.portfolioConfig && window.portfolioConfig.buildInPublic) || null;
    const projects =
      cfg && Array.isArray(cfg.projects) && cfg.projects.length > 0
        ? cfg.projects
        : DEFAULT_BUILD_PROJECTS;
    const updates =
      cfg && Array.isArray(cfg.updates) && cfg.updates.length > 0
        ? cfg.updates
        : DEFAULT_BUILD_UPDATES;
    return { projects, updates };
  }

  function filterProjects(projects, { category = "All", status = "All" } = {}) {
    return (projects || []).filter((proj) => {
      const matchCat = category === "All" || proj.category === category;
      const matchStatus = status === "All" || proj.status === status;
      return matchCat && matchStatus;
    });
  }

  function filterUpdates(updates, { category = "All", status = "All", projectId = "All" } = {}) {
    return (updates || []).filter((upd) => {
      const matchCat = category === "All" || upd.category === category;
      const matchStatus = status === "All" || upd.status === status;
      const matchProject = projectId === "All" || upd.projectId === projectId;
      return matchCat && matchStatus && matchProject;
    });
  }

  function renderStatusTag(status) {
    const safeStatus = PROJECT_STATUSES.includes(status) ? status : "Development";
    const icon = STATUS_ICONS[safeStatus] || "code-2";
    return `
      <span class="bip-status-tag" data-status="${escHtml(safeStatus)}">
        <i data-lucide="${escHtml(icon)}" class="w-3.5 h-3.5 shrink-0" aria-hidden="true"></i>
        <span>${escHtml(safeStatus)}</span>
      </span>
    `;
  }

  function renderPipelineSteps(currentStatus) {
    const activeIdx = Math.max(0, PROJECT_STATUSES.indexOf(currentStatus));
    return `
      <div class="bip-stage-track" role="list" aria-label="Project development lifecycle stages">
        ${PROJECT_STATUSES.map((stage, idx) => {
          const isCurrent = idx === activeIdx;
          const isDone = idx < activeIdx || (currentStatus === "Completed" && idx === activeIdx);
          const stateClass = isCurrent ? "is-current" : isDone ? "is-done" : "";
          const stateText = isCurrent ? "Current stage" : isDone ? "Completed stage" : "Upcoming stage";
          return `
            <div class="bip-stage-step ${stateClass}" role="listitem" aria-label="${escHtml(stage)} — ${stateText}">
              <span class="bip-stage-dot" aria-hidden="true"></span>
              <span class="truncate">${escHtml(stage)}</span>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function init() {
    const root = document.getElementById("build-public-root");
    if (!root) return;

    const { projects, updates } = getBuildConfigData();

    let activeCategory = "All";
    let activeStatus = "All";
    let selectedProjectId = "All";

    const spotlightMount = document.getElementById("bip-spotlight-mount");
    const categoryTabsMount = document.getElementById("bip-category-tabs");
    const statusSelect = document.getElementById("bip-status-select");
    const resetBtn = document.getElementById("bip-reset-btn");
    const countEl = document.getElementById("bip-count-label");
    const projectsGridMount = document.getElementById("bip-projects-grid");
    const updatesListMount = document.getElementById("bip-updates-list");

    // Screenshot Preview Modal Elements
    const modal = document.getElementById("bip-screenshot-modal");
    const modalTitle = document.getElementById("bip-modal-title");
    const modalImg = document.getElementById("bip-modal-image");
    const modalMeta = document.getElementById("bip-modal-meta");
    const modalClose = document.getElementById("bip-modal-close");
    let lastFocus = null;

    function openScreenshotModal(src, alt, title, metaText, triggerEl) {
      if (!modal || !modalImg) return;
      lastFocus = triggerEl || document.activeElement;
      if (modalTitle) modalTitle.textContent = title || "Build Screenshot";
      modalImg.src = src || "assets/images/profile-placeholder.svg";
      modalImg.alt = alt || title || "Project build screenshot";
      if (modalMeta) modalMeta.textContent = metaText || "";

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
      if (modalClose) window.setTimeout(() => modalClose.focus(), 30);
    }

    function closeScreenshotModal() {
      if (!modal || !modal.classList.contains("is-open")) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    if (modalClose) modalClose.addEventListener("click", closeScreenshotModal);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeScreenshotModal();
      });
    }
    if (!init.modalKeyBound) {
      init.modalKeyBound = true;
      document.addEventListener("keydown", (e) => {
        if (!modal || !modal.classList.contains("is-open")) return;
        if (e.key === "Escape") {
          closeScreenshotModal();
        } else if (e.key === "Tab" && typeof window.trapDialogFocus === "function") {
          window.trapDialogFocus(modal, e);
        }
      });
    }

    function renderSpotlight() {
      if (!spotlightMount) return;
      const featured =
        projects.find((p) => p.isCurrentFeatured) ||
        projects.find((p) => p.category === "Active") ||
        projects[0];
      if (!featured) return;

      const latestUpdate =
        updates.find((u) => u.projectId === featured.id) || updates[0] || null;

      const stackTags = (featured.technologies || [])
        .map((t) => `<span class="tech-badge-item text-xs py-1 px-2.5">${escHtml(t)}</span>`)
        .join("");

      const latestHtml = latestUpdate
        ? `
          <div class="pt-4 border-t border-[var(--border)] space-y-2.5">
            <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span class="font-semibold text-cyan-400">Latest Update</span>
              <span class="font-mono-tech text-[var(--muted)] tabular-nums">${escHtml(latestUpdate.date)}</span>
            </div>
            <p class="text-sm font-bold text-[var(--text)]">${escHtml(latestUpdate.title)}</p>
            <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escHtml(latestUpdate.description)}</p>
          </div>
        `
        : "";

      spotlightMount.innerHTML = `
        <article class="bip-spotlight p-5 sm:p-7 space-y-6" aria-labelledby="bip-featured-heading">
          <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div class="space-y-2.5 max-w-2xl">
              <div class="flex flex-wrap items-center gap-2.5 text-xs">
                <span class="font-semibold text-cyan-400">Currently Building</span>
                <span class="text-[var(--muted)]" aria-hidden="true">·</span>
                ${renderStatusTag(featured.status)}
                <span class="text-[var(--muted)]" aria-hidden="true">·</span>
                <span class="font-mono-tech font-bold text-[var(--text)] tabular-nums">${escHtml(String(featured.progress))}% Complete</span>
              </div>
              <h2 id="bip-featured-heading" class="text-2xl sm:text-3xl font-extrabold text-[var(--text)]">
                ${escHtml(featured.title)}
              </h2>
              <p class="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                ${escHtml(featured.summary)}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2.5 shrink-0">
              ${
                featured.href
                  ? `
                    <a href="${escHtml(featured.href)}" class="primary-button text-xs sm:text-sm min-h-[42px]">
                      <span>Inspect Case Study</span>
                      <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
                    </a>
                  `
                  : ""
              }
              <button type="button" class="outline-button text-xs sm:text-sm min-h-[42px]" data-bip-focus-updates="${escHtml(featured.id)}">
                <i data-lucide="layers" class="w-4 h-4"></i>
                <span>Filter Updates</span>
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>Status Pipeline</span>
              <span class="font-mono-tech tabular-nums">${escHtml(String(featured.progress))}%</span>
            </div>
            <div class="bip-progress-track" aria-hidden="true">
              <div class="bip-progress-fill" style="transform: scaleX(${Math.min(1, Math.max(0, Number(featured.progress || 0) / 100))});"></div>
            </div>
            ${renderPipelineSteps(featured.status)}
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div class="lg:col-span-7 space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <p class="text-xs font-semibold text-indigo-400">Current Milestone</p>
                  <p class="text-sm font-semibold text-[var(--text)] leading-snug">${escHtml(featured.currentMilestone)}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-xs font-semibold text-cyan-400">Next Milestone</p>
                  <p class="text-sm font-semibold text-[var(--text)] leading-snug">${escHtml(featured.nextMilestone)}</p>
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-xs font-semibold text-[var(--text-secondary)]">Technology Stack</p>
                <div class="flex flex-wrap gap-1.5">${stackTags}</div>
              </div>

              ${latestHtml}
            </div>

            <div class="lg:col-span-5">
              <button
                type="button"
                class="bip-update-media text-left p-0"
                data-bip-preview-src="${escHtml(featured.screenshot)}"
                data-bip-preview-alt="${escHtml(featured.title)} active build preview"
                data-bip-preview-title="${escHtml(featured.title)} — Current Build"
                data-bip-preview-meta="${escHtml(featured.status)} · ${escHtml(String(featured.progress))}% Complete"
                aria-label="Inspect full screenshot for ${escHtml(featured.title)}"
              >
                <img
                  src="${escHtml(featured.screenshot)}"
                  alt="${escHtml(featured.title)} current milestone preview"
                  loading="eager"
                  referrerpolicy="no-referrer"
                  onerror="this.src='assets/images/profile-placeholder.svg'"
                >
                <span class="bip-media-zoom-badge">
                  <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
                  <span>Preview</span>
                </span>
              </button>
            </div>
          </div>
        </article>
      `;

      const focusBtn = spotlightMount.querySelector("[data-bip-focus-updates]");
      if (focusBtn) {
        focusBtn.addEventListener("click", () => {
          const targetId = focusBtn.getAttribute("data-bip-focus-updates") || "All";
          selectedProjectId = selectedProjectId === targetId ? "All" : targetId;
          activeCategory = "All";
          activeStatus = "All";
          syncFilterControls();
          renderProjectsAndUpdates();
          const feedAnchor = document.getElementById("bip-updates-heading");
          if (feedAnchor) feedAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }

    function syncFilterControls() {
      if (statusSelect) {
        statusSelect.value = activeStatus;
      }
      renderCategoryTabs();
    }

    function populateStatusSelect() {
      if (!statusSelect) return;
      const options = ["All", ...PROJECT_STATUSES];
      statusSelect.innerHTML = options
        .map(
          (st) =>
            `<option value="${escHtml(st)}" ${st === activeStatus ? "selected" : ""}>${
              st === "All" ? "All Statuses" : escHtml(st)
            }</option>`
        )
        .join("");
    }

    function renderCategoryTabs() {
      if (!categoryTabsMount) return;
      categoryTabsMount.innerHTML = FILTER_OPTIONS.map((cat) => {
        const isActive = activeCategory === cat;
        return `
          <button
            type="button"
            class="bip-filter-btn ${isActive ? "is-active" : ""}"
            data-bip-cat="${escHtml(cat)}"
            aria-pressed="${isActive ? "true" : "false"}"
          >
            ${escHtml(cat)}
          </button>
        `;
      }).join("");

      categoryTabsMount.querySelectorAll("[data-bip-cat]").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeCategory = btn.getAttribute("data-bip-cat") || "All";
          selectedProjectId = "All";
          renderCategoryTabs();
          renderProjectsAndUpdates();
        });
      });
    }

    function bindPreviewTriggers(scopeEl) {
      if (!scopeEl) return;
      scopeEl.querySelectorAll("[data-bip-preview-src]").forEach((btn) => {
        btn.addEventListener("click", () => {
          openScreenshotModal(
            btn.getAttribute("data-bip-preview-src"),
            btn.getAttribute("data-bip-preview-alt"),
            btn.getAttribute("data-bip-preview-title"),
            btn.getAttribute("data-bip-preview-meta"),
            btn
          );
        });
      });
    }

    function renderProjectsAndUpdates() {
      const visibleProjects = filterProjects(projects, {
        category: activeCategory,
        status: activeStatus
      });
      const visibleUpdates = filterUpdates(updates, {
        category: activeCategory,
        status: activeStatus,
        projectId: selectedProjectId
      });

      if (countEl) {
        const projectSuffix = selectedProjectId !== "All" ? ` · Filtered by project` : "";
        countEl.textContent = `${visibleProjects.length} ${
          visibleProjects.length === 1 ? "project" : "projects"
        } · ${visibleUpdates.length} ${visibleUpdates.length === 1 ? "update" : "updates"}${projectSuffix}`;
      }

      if (projectsGridMount) {
        if (visibleProjects.length === 0) {
          projectsGridMount.innerHTML = `
            <div class="bip-card p-7 text-center space-y-3 col-span-full">
              <i data-lucide="folder-kanban" class="w-7 h-7 text-cyan-400 mx-auto"></i>
              <p class="text-sm text-[var(--muted)]">No tracked builds match the selected filter and status.</p>
              <button type="button" class="outline-button text-xs mx-auto" data-bip-empty-reset>Reset Filters</button>
            </div>
          `;
        } else {
          projectsGridMount.innerHTML = visibleProjects
            .map((proj) => {
              const isSelected = selectedProjectId === proj.id;
              const pct = Math.min(100, Math.max(0, Number(proj.progress || 0)));
              const techHtml = (proj.technologies || [])
                .slice(0, 4)
                .map((t) => `<span class="tech-badge-item text-[11px] py-0.5 px-2">${escHtml(t)}</span>`)
                .join("");

              return `
                <article class="bip-card p-5 flex flex-col justify-between gap-4 ${isSelected ? "is-selected" : ""}">
                  <div class="space-y-3">
                    <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                      ${renderStatusTag(proj.status)}
                      <span class="text-[var(--muted)]">${escHtml(proj.category)} · <span class="font-mono-tech tabular-nums text-[var(--text)]">${escHtml(String(pct))}%</span></span>
                    </div>

                    <div class="space-y-1.5">
                      <h3 class="text-lg font-bold text-[var(--text)]">${escHtml(proj.title)}</h3>
                      <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escHtml(proj.summary)}</p>
                    </div>

                    <div class="bip-progress-track" aria-hidden="true">
                      <div class="bip-progress-fill" style="transform: scaleX(${pct / 100});"></div>
                    </div>

                    <div class="space-y-1 text-xs">
                      <p class="text-[var(--text-secondary)]"><span class="text-[var(--muted)]">Current:</span> ${escHtml(proj.currentMilestone)}</p>
                      <p class="text-[var(--text-secondary)]"><span class="text-[var(--muted)]">Next:</span> ${escHtml(proj.nextMilestone)}</p>
                    </div>

                    <div class="flex flex-wrap gap-1.5">${techHtml}</div>
                  </div>

                  <div class="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      class="outline-button text-xs py-1.5 px-3 min-h-[38px]"
                      data-bip-select-project="${escHtml(proj.id)}"
                      aria-pressed="${isSelected ? "true" : "false"}"
                    >
                      <span>${isSelected ? "Showing Updates" : "View Updates"}</span>
                    </button>

                    ${
                      proj.href
                        ? `
                          <a href="${escHtml(proj.href)}" class="text-xs font-semibold text-cyan-400 hover:underline inline-flex items-center gap-1">
                            <span>Open</span>
                            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                          </a>
                        `
                        : ""
                    }
                  </div>
                </article>
              `;
            })
            .join("");
        }

        projectsGridMount.querySelectorAll("[data-bip-select-project]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-bip-select-project");
            if (!id) return;
            selectedProjectId = selectedProjectId === id ? "All" : id;
            renderProjectsAndUpdates();
          });
        });
      }

      if (updatesListMount) {
        if (visibleUpdates.length === 0) {
          updatesListMount.innerHTML = `
            <div class="bip-card p-8 text-center space-y-3">
              <i data-lucide="git-branch" class="w-7 h-7 text-indigo-400 mx-auto"></i>
              <p class="text-sm text-[var(--muted)]">No project updates match the current filter selection.</p>
              <button type="button" class="outline-button text-xs mx-auto" data-bip-empty-reset>Show All Updates</button>
            </div>
          `;
        } else {
          updatesListMount.innerHTML = visibleUpdates
            .map((upd) => {
              const pct = Math.min(100, Math.max(0, Number(upd.progress || 0)));
              const techHtml = (upd.technologies || [])
                .map((t) => `<span class="tech-badge-item text-xs py-1 px-2.5">${escHtml(t)}</span>`)
                .join("");

              return `
                <article class="bip-card p-5 sm:p-6">
                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div class="lg:col-span-5">
                      <button
                        type="button"
                        class="bip-update-media text-left p-0"
                        data-bip-preview-src="${escHtml(upd.screenshot.src)}"
                        data-bip-preview-alt="${escHtml(upd.screenshot.alt)}"
                        data-bip-preview-title="${escHtml(upd.project)} — ${escHtml(upd.title)}"
                        data-bip-preview-meta="${escHtml(upd.date)} · ${escHtml(upd.status)} · ${escHtml(String(pct))}%"
                        aria-label="Enlarge screenshot for ${escHtml(upd.title)}"
                      >
                        <img
                          src="${escHtml(upd.screenshot.src)}"
                          alt="${escHtml(upd.screenshot.alt)}"
                          loading="lazy"
                          referrerpolicy="no-referrer"
                          onerror="this.src='assets/images/profile-placeholder.svg'"
                        >
                        <span class="bip-media-zoom-badge">
                          <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
                          <span>Inspect</span>
                        </span>
                      </button>
                    </div>

                    <div class="lg:col-span-7 space-y-4">
                      <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div class="flex flex-wrap items-center gap-2">
                          <span class="font-mono-tech text-[var(--muted)] tabular-nums">${escHtml(upd.date)}</span>
                          <span class="text-[var(--muted)]" aria-hidden="true">·</span>
                          <span class="font-semibold text-indigo-400">${escHtml(upd.project)}</span>
                          <span class="text-[var(--muted)]" aria-hidden="true">·</span>
                          ${renderStatusTag(upd.status)}
                        </div>
                        <span class="text-xs text-[var(--muted)]">${escHtml(upd.category)}</span>
                      </div>

                      <div class="space-y-1.5">
                        <h3 class="text-lg sm:text-xl font-bold text-[var(--text)]">${escHtml(upd.title)}</h3>
                        <p class="text-sm text-[var(--muted)] leading-relaxed">${escHtml(upd.description)}</p>
                      </div>

                      <div class="space-y-1.5">
                        <div class="flex items-center justify-between text-xs">
                          <span class="text-[var(--text-secondary)] font-medium">Milestone Progress</span>
                          <span class="font-mono-tech font-bold text-cyan-400 tabular-nums">${escHtml(String(pct))}%</span>
                        </div>
                        <div class="bip-progress-track" aria-hidden="true">
                          <div class="bip-progress-fill" style="transform: scaleX(${pct / 100});"></div>
                        </div>
                      </div>

                      <div class="flex flex-wrap gap-1.5 pt-1">${techHtml}</div>
                    </div>
                  </div>
                </article>
              `;
            })
            .join("");
        }
      }

      root.querySelectorAll("[data-bip-empty-reset]").forEach((btn) => {
        btn.addEventListener("click", resetAllFilters);
      });

      bindPreviewTriggers(spotlightMount);
      bindPreviewTriggers(updatesListMount);
      refreshIcons();
    }

    function resetAllFilters() {
      activeCategory = "All";
      activeStatus = "All";
      selectedProjectId = "All";
      syncFilterControls();
      renderProjectsAndUpdates();
    }

    if (statusSelect) {
      statusSelect.addEventListener("change", () => {
        activeStatus = statusSelect.value || "All";
        renderProjectsAndUpdates();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", resetAllFilters);
    }

    populateStatusSelect();
    renderCategoryTabs();
    renderSpotlight();
    renderProjectsAndUpdates();
  }

  window.PortfolioBuild = {
    init,
    PROJECT_STATUSES,
    FILTER_OPTIONS,
    DEFAULT_BUILD_PROJECTS,
    DEFAULT_BUILD_UPDATES,
    getBuildConfigData,
    filterProjects,
    filterUpdates
  };
})();
