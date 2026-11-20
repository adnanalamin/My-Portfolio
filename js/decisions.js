/**
 * AL AMIN Portfolio — Phase 28: Engineering Decision Log (ADR System)
 * Documents real technical decisions grounded in portfolio builds with:
 * Problem, Context, Options, Selected solution, Reason, Trade-offs, Result, and Date.
 * Includes expandable ADR cards, search, technology filters, and project filtering.
 */

(() => {
  const DEFAULT_ENGINEERING_DECISIONS = [
    {
      id: "adr-001-mongodb",
      code: "ADR-001",
      title: "Why MongoDB for Telemetry Buckets & Dynamic Product Catalogs?",
      date: "2026-09-12",
      projects: [
        { id: "astrapulse", title: "AstraPulse" },
        { id: "nexora", title: "Nexora" },
        { id: "school-management-system", title: "School Management System" }
      ],
      technologies: ["MongoDB", "Mongoose", "Node.js"],
      problem:
        "AstraPulse ingests varied API event payloads and hourly latency buckets, while Nexora stores product SKUs with differing attributes and category metadata.",
      context:
        "Enforcing rigid schema migrations for evolving telemetry metrics and heterogeneous catalog attributes during rapid MVP iteration slowed delivery and required wide sparse join tables.",
      options: [
        {
          name: "MongoDB (Selected)",
          selected: true,
          summary: "Document store with Mongoose schemas and compound indexes on workspaceId + windowStart."
        },
        {
          name: "PostgreSQL Only",
          selected: false,
          summary: "Normalized relational tables with JSONB columns for event payloads."
        },
        {
          name: "Flat File / Embedded JSON",
          selected: false,
          summary: "Zero external DB server, unsuitable for concurrent multi-workspace writes."
        }
      ],
      selectedSolution: "MongoDB with Pre-Aggregated Time-Bucket Documents & Compound Indexes",
      reason:
        "Document arrays map directly to hourly/daily metric buckets and nested order line items without complex multi-table joins on hot dashboard read paths.",
      tradeOffs:
        "Requires disciplined Mongoose application-level schema validation and explicit snapshot fields on immutable orders instead of database-enforced foreign key constraints.",
      result:
        "Rolling 24-hour AstraPulse telemetry queries scan indexed bucket documents directly instead of raw event logs, keeping catalog and dashboard schemas flexible.",
      href: "project-details.html?id=astrapulse"
    },
    {
      id: "adr-002-nodejs",
      code: "ADR-002",
      title: "Why Node.js & Express as the Core Backend Runtime?",
      date: "2026-08-25",
      projects: [
        { id: "astrapulse", title: "AstraPulse" },
        { id: "nexora", title: "Nexora" },
        { id: "school-management-system", title: "School Management System" },
        { id: "slideverse", title: "SLIDEVERSE" }
      ],
      technologies: ["Node.js", "Express", "JavaScript"],
      problem:
        "Needed a responsive I/O-capable backend runtime capable of serving concurrent dashboard telemetry queries, stock checks, and JSON deck persistence with minimal context switching.",
      context:
        "The frontend across React, Redux, and Next.js already runs on JavaScript. Maintaining an unrelated backend runtime language increases validation duplication and onboarding overhead.",
      options: [
        {
          name: "Node.js + Express (Selected)",
          selected: true,
          summary: "Event-driven non-blocking I/O with composable middleware and shared JS tooling."
        },
        {
          name: "Python + Django",
          selected: false,
          summary: "Batteries-included MVC framework adding a separate runtime and ORM paradigm."
        },
        {
          name: "Serverless Edge Functions Only",
          selected: false,
          summary: "Zero server maintenance, but cold starts and connection pooling require extra orchestration."
        }
      ],
      selectedSolution: "Unified Node.js Runtime with Modular Express Controllers & Middleware",
      reason:
        "Non-blocking asynchronous I/O handles JSON API payloads and database connections efficiently while enabling shared validation helpers between client and API teams.",
      tradeOffs:
        "Single-threaded event loop is suboptimal for heavy CPU-bound media transcoding or ML inference without worker threads or offloading.",
      result:
        "Delivered consistent Express controller architecture across AstraPulse, Nexora, School Management System, and SLIDEVERSE with clean Postman-verified endpoints.",
      href: "project-details.html?id=nexora"
    },
    {
      id: "adr-003-jwt",
      code: "ADR-003",
      title: "Why Stateless JWT with Role-Based Access Control (RBAC)?",
      date: "2026-08-04",
      projects: [
        { id: "school-management-system", title: "School Management System" },
        { id: "astrapulse", title: "AstraPulse" },
        { id: "nexora", title: "Nexora" }
      ],
      technologies: ["JWT", "Node.js", "Express"],
      problem:
        "Multi-role applications (Admin, Teacher, Student in School Management; Owner, Developer, Viewer in AstraPulse) require verifiable identity and permission checks on every API call.",
      context:
        "Needed lightweight route-level authorization middleware in Express without forcing sticky server memory sessions across stateless client requests.",
      options: [
        {
          name: "Stateless JWT + RBAC Middleware (Selected)",
          selected: true,
          summary: "Signed access tokens verified in middleware before role-scoped Express controllers run."
        },
        {
          name: "In-Memory Server Sessions",
          selected: false,
          summary: "Simple per-instance session store, breaks horizontally without centralized session storage."
        },
        {
          name: "OAuth-Only External Provider",
          selected: false,
          summary: "Delegates credential management externally, adding friction for school-issued roll accounts."
        }
      ],
      selectedSolution: "Signed JWT Tokens Paired with Express Role Guard Middleware",
      reason:
        "Enforces strict Admin, Teacher, Student, and Workspace role boundaries directly inside route pipelines cleanly and deterministically.",
      tradeOffs:
        "Immediate token revocation prior to expiry requires short token lifetimes paired with refresh rotation or a revocation check, rather than deleting a single server session row.",
      result:
        "Protected write routes in School Management System and tenant endpoints in AstraPulse consistently enforce least-privilege access per role.",
      href: "project-details.html?id=school-management-system"
    },
    {
      id: "adr-004-rest-api",
      code: "ADR-004",
      title: "Why Versioned REST API (/api/v1/*) Over GraphQL?",
      date: "2026-07-19",
      projects: [
        { id: "astrapulse", title: "AstraPulse" },
        { id: "nexora", title: "Nexora" },
        { id: "school-management-system", title: "School Management System" }
      ],
      technologies: ["REST API", "Express", "Node.js"],
      problem:
        "Client dashboards, catalog storefronts, and academic portals need predictable endpoint contracts, HTTP caching semantics, and clear error status codes.",
      context:
        "Frontend data needs map directly to well-defined resources (workspaces, metric buckets, products, attendance logs) tested cleanly via Postman collections.",
      options: [
        {
          name: "Versioned JSON REST API (Selected)",
          selected: true,
          summary: "Resource-oriented /api/v1/* endpoints using standard HTTP verbs, status codes, and cursor/page params."
        },
        {
          name: "GraphQL Single Endpoint",
          selected: false,
          summary: "Flexible client field selection, adds query complexity analysis, schema stitching, and custom caching setup."
        },
        {
          name: "RPC / Unstructured POST Actions",
          selected: false,
          summary: "Quick action handlers lacking uniform HTTP caching and resource semantics."
        }
      ],
      selectedSolution: "Versioned RESTful Endpoints (/api/v1/*) with Explicit Validation & Error Envelopes",
      reason:
        "HTTP status codes (200, 201, 400, 401, 403, 404), Postman contract verification, and standard CDN/browser caching require zero extra abstraction layers.",
      tradeOffs:
        "Clients assembling composite screens from unrelated entities may trigger multiple requests or require dedicated aggregate endpoints unless curated summary routes are exposed.",
      result:
        "Clean, self-documenting endpoint suites across AstraPulse, Nexora, and School Management System with uniform JSON error responses.",
      href: "project-details.html?id=astrapulse"
    },
    {
      id: "adr-005-tailwind",
      code: "ADR-005",
      title: "Why Tailwind CSS + CSS Custom Properties Over Component Suites?",
      date: "2026-09-30",
      projects: [
        { id: "portfolio-system", title: "Portfolio System" },
        { id: "slideverse", title: "SLIDEVERSE" },
        { id: "astrapulse", title: "AstraPulse" },
        { id: "ecommerce-saas", title: "E-commerce SaaS" }
      ],
      technologies: ["Tailwind CSS", "CSS3", "React"],
      problem:
        "Consistent spacing, dual dark/light/high-contrast themes, and zero-overflow responsive grids (320px–2560px) needed to work uniformly across static and React UIs.",
      context:
        "Heavy component frameworks impose rigid visual opinions and deep CSS specificity overrides whenever custom engineering aesthetics or print modes are required.",
      options: [
        {
          name: "Tailwind Utilities + CSS Custom Properties (Selected)",
          selected: true,
          summary: "Semantic theme variables (--surface, --text, --border) paired with Tailwind responsive grid utilities."
        },
        {
          name: "Material UI / Bootstrap Suite",
          selected: false,
          summary: "Pre-built widgets that carry recognizable default styling and heavier CSS specificity overrides."
        },
        {
          name: "Hand-Written Stylesheets Only",
          selected: false,
          summary: "High control, but slows layout iteration across dozens of responsive grid variations."
        }
      ],
      selectedSolution: "Semantic CSS Design Tokens Combined with Tailwind Utility Composition",
      reason:
        "Keeps SLIDEVERSE's live typography inspector instant via CSS variable updates and allows Portfolio System's theme toggles to repaint dark, light, and high-contrast modes reliably.",
      tradeOffs:
        "HTML markup becomes more verbose with utility classes unless recurring visual surfaces (.glass-card, .primary-button) are extracted cleanly into shared token rules.",
      result:
        "Zero-overflow layouts from 320px to 2560px, clean print stylesheets, and instant theme switching across all 20+ portfolio pages.",
      href: "project-details.html?id=portfolio-system"
    },
    {
      id: "adr-006-hybrid-postgres-mongo",
      code: "ADR-006",
      title: "Why Hybrid PostgreSQL Order Ledgers + MongoDB Catalogs in SaaS?",
      date: "2026-10-14",
      projects: [
        { id: "ecommerce-saas", title: "E-commerce SaaS" }
      ],
      technologies: ["PostgreSQL", "MongoDB", "Node.js"],
      problem:
        "Multi-tenant stores require both flexible visual theme/product configurations and strictly consistent financial order ledgers with multi-item ACID integrity.",
      context:
        "Forcing customizable storefront JSON blocks into strict relational tables causes awkward migrations, whereas purely eventual document writes risk ledger discrepancies.",
      options: [
        {
          name: "PostgreSQL Ledgers + MongoDB Storefront Docs (Selected)",
          selected: true,
          summary: "ACID relational tables for orders/payments paired with flexible document storage for themes & catalogs."
        },
        {
          name: "Single PostgreSQL + Heavy JSONB",
          selected: false,
          summary: "Simplified single engine, requires indexing discipline on deeply nested storefront theme blobs."
        },
        {
          name: "MongoDB Transactions Only",
          selected: false,
          summary: "Single database stack, less natural for relational revenue reporting and SQL aggregate rollups."
        }
      ],
      selectedSolution: "Workload-Matched Split: PostgreSQL for Financial Orders, MongoDB for Themes & Catalogs",
      reason:
        "Matches ACID relational constraints and SQL aggregations to revenue analytics while keeping merchant theme customization fluid and schema-flexible.",
      tradeOffs:
        "Operating two database engines increases infrastructure setup, backup coordination, and cross-store reference discipline.",
      result:
        "Clean separation between merchant visual theme live previews and auditable PostgreSQL fulfillment and revenue records.",
      href: "project-details.html?id=ecommerce-saas"
    },
    {
      id: "adr-007-redux-cart",
      code: "ADR-007",
      title: "Why Centralized Redux Toolkit State for Storefront Cart Sync?",
      date: "2025-11-18",
      projects: [
        { id: "nexora", title: "Nexora" }
      ],
      technologies: ["Redux", "React", "JavaScript"],
      problem:
        "Navbar bag counters, product card Add-to-Cart buttons, and the slide-over checkout drawer all mutate and read live subtotal, quantity, and stock alerts simultaneously.",
      context:
        "Passing callbacks through deeply nested component trees caused stale counts and inconsistent optimistic updates when guest carts merged on login.",
      options: [
        {
          name: "Redux Toolkit Cart Slice (Selected)",
          selected: true,
          summary: "Single deterministic store slice reconciling optimistic UI updates with server inventory checks."
        },
        {
          name: "React Context + Prop Drilling",
          selected: false,
          summary: "Zero extra dependency, but triggers broad tree re-renders across large product grids on cart change."
        },
        {
          name: "Full-Page Checkout Redirects",
          selected: false,
          summary: "Avoids client state sync entirely, degrading mobile shopping flow with repeated page reloads."
        }
      ],
      selectedSolution: "Centralized Redux Toolkit Cart Slice with Debounced API Persistence",
      reason:
        "Provides predictable reducers for quantity reconciliation, guest-to-account cart merging, and isolated selector subscriptions so unrelated cards do not re-render.",
      tradeOffs:
        "Introduces Redux boilerplate compared to lighter atomic state libraries for simpler single-screen views.",
      result:
        "Eliminated cart synchronization bugs between header badges, catalog tiles, and the accessible slide-over checkout drawer in Nexora.",
      href: "project-details.html?id=nexora"
    },
    {
      id: "adr-008-modular-vanilla",
      code: "ADR-008",
      title: "Why Zero-Framework Modular Vanilla JS Over an SPA Bundler?",
      date: "2026-10-05",
      projects: [
        { id: "portfolio-system", title: "Portfolio System" }
      ],
      technologies: ["JavaScript", "HTML5", "CSS3"],
      problem:
        "Client-side SPA frameworks often ship large hydration bundles and delay first paint for content-driven multi-page developer portfolios and documentation portals.",
      context:
        "The AL AMIN portfolio spans 20+ independent pages requiring fast static edge delivery, SEO-ready HTML per route, print support, and shared interactive widgets.",
      options: [
        {
          name: "Modular Vanilla JS + Shared Component Injectors (Selected)",
          selected: true,
          summary: "Independent page HTML files powered by centralized config.js, shared navbar/footer injectors, and scoped feature modules."
        },
        {
          name: "Client-Side React SPA Only",
          selected: false,
          summary: "Rich component model, adds bundle weight and requires SSR/prerendering for per-route HTML metadata."
        },
        {
          name: "Copy-Pasted Static HTML Files",
          selected: false,
          summary: "Simple at 3 pages, unmaintainable once navigation, theme, and footer links span 20+ routes."
        }
      ],
      selectedSolution: "Multi-Page Semantic HTML5 Driven by Central Brand Config & IIFE Feature Modules",
      reason:
        "Each page loads only the scripts it needs, stays inspectable without complex runtime abstractions, and works directly on static hosting or Vite dev/build pipelines.",
      tradeOffs:
        "Requires disciplined HTML escaping helpers and explicit DOM rebinding after dynamic renders instead of declarative virtual DOM diffing.",
      result:
        "Fast initial paint across every portfolio route with zero framework runtime overhead and centralized brand configuration in js/config.js.",
      href: "project-details.html?id=portfolio-system"
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

  function getDecisionsData() {
    const cfg = (window.portfolioConfig && window.portfolioConfig.engineeringDecisions) || null;
    if (Array.isArray(cfg) && cfg.length > 0) {
      return cfg;
    }
    return DEFAULT_ENGINEERING_DECISIONS;
  }

  function filterDecisions(entries, { tech = "All", project = "All", query = "" } = {}) {
    const q = String(query || "").trim().toLowerCase();
    return (entries || []).filter((item) => {
      const matchTech =
        tech === "All" ||
        (Array.isArray(item.technologies) &&
          item.technologies.some((t) => t.toLowerCase() === tech.toLowerCase()));

      const matchProject =
        project === "All" ||
        (Array.isArray(item.projects) &&
          item.projects.some((p) => p.id === project || p.title === project));

      if (!matchTech || !matchProject) return false;
      if (!q) return true;

      const optionsText = (item.options || [])
        .map((o) => `${o.name} ${o.summary}`)
        .join(" ");
      const projectsText = (item.projects || []).map((p) => p.title).join(" ");
      const haystack = [
        item.code,
        item.title,
        item.problem,
        item.context,
        optionsText,
        item.selectedSolution,
        item.reason,
        item.tradeOffs,
        item.result,
        item.date,
        projectsText,
        ...(item.technologies || [])
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }

  function collectTechFilters(entries) {
    const set = new Set();
    (entries || []).forEach((item) => {
      (item.technologies || []).forEach((t) => set.add(t));
    });
    return ["All", ...Array.from(set)];
  }

  function collectProjectFilters(entries) {
    const map = new Map();
    (entries || []).forEach((item) => {
      (item.projects || []).forEach((p) => {
        if (p && p.id && !map.has(p.id)) {
          map.set(p.id, p.title || p.id);
        }
      });
    });
    return [
      { id: "All", title: "All Projects" },
      ...Array.from(map.entries()).map(([id, title]) => ({ id, title }))
    ];
  }

  function init() {
    const root = document.getElementById("decisions-log-root");
    if (!root) return;

    const decisions = getDecisionsData();
    const techList = collectTechFilters(decisions);
    const projectList = collectProjectFilters(decisions);

    let activeTech = "All";
    let activeProject = "All";
    let searchQuery = "";
    let activeIndexId = decisions[0] ? decisions[0].id : "";
    const expandedIds = new Set([decisions[0] ? decisions[0].id : ""]);

    const searchInput = document.getElementById("adr-search-input");
    const searchClear = document.getElementById("adr-search-clear");
    const projectSelect = document.getElementById("adr-project-select");
    const techTabsMount = document.getElementById("adr-tech-tabs");
    const toggleAllBtn = document.getElementById("adr-toggle-all-btn");
    const resetBtn = document.getElementById("adr-reset-btn");
    const countEl = document.getElementById("adr-count-label");
    const indexRailMount = document.getElementById("adr-index-rail");
    const cardsMount = document.getElementById("adr-cards-list");

    function populateProjectSelect() {
      if (!projectSelect) return;
      projectSelect.innerHTML = projectList
        .map(
          (p) =>
            `<option value="${escHtml(p.id)}" ${p.id === activeProject ? "selected" : ""}>${escHtml(
              p.title
            )}</option>`
        )
        .join("");
    }

    function renderTechTabs() {
      if (!techTabsMount) return;
      techTabsMount.innerHTML = techList
        .map((tech) => {
          const isActive = activeTech === tech;
          return `
            <button
              type="button"
              class="adr-filter-btn ${isActive ? "is-active" : ""}"
              data-adr-tech="${escHtml(tech)}"
              aria-pressed="${isActive ? "true" : "false"}"
            >
              ${tech === "All" ? "All Technologies" : escHtml(tech)}
            </button>
          `;
        })
        .join("");

      techTabsMount.querySelectorAll("[data-adr-tech]").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeTech = btn.getAttribute("data-adr-tech") || "All";
          renderTechTabs();
          renderWorkspace();
        });
      });
    }

    function updateToggleAllLabel(filtered) {
      if (!toggleAllBtn) return;
      const allOpen = filtered.length > 0 && filtered.every((d) => expandedIds.has(d.id));
      toggleAllBtn.innerHTML = allOpen
        ? `<i data-lucide="chevrons-up" class="w-4 h-4"></i><span>Collapse All</span>`
        : `<i data-lucide="chevrons-down" class="w-4 h-4"></i><span>Expand All</span>`;
    }

    function syncExpandedCard(id) {
      const btn = document.querySelector(`[data-adr-expand="${id}"]`);
      const body = document.getElementById(`adr-body-${id}`);
      const isOpen = expandedIds.has(id);
      if (btn) {
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        btn.innerHTML = isOpen
          ? `<i data-lucide="chevron-up" class="w-4 h-4"></i><span>Collapse Record</span>`
          : `<i data-lucide="chevron-down" class="w-4 h-4"></i><span>Expand Decision Record</span>`;
      }
      if (body) {
        body.classList.toggle("hidden", !isOpen);
      }
      const filtered = filterDecisions(decisions, {
        tech: activeTech,
        project: activeProject,
        query: searchQuery
      });
      updateToggleAllLabel(filtered);
      refreshIcons();
    }

    function renderIndexRail(filtered) {
      if (!indexRailMount) return;
      if (filtered.length === 0) {
        indexRailMount.innerHTML = `<p class="text-xs text-[var(--muted)] p-2">No decision records match active filters.</p>`;
        return;
      }

      indexRailMount.innerHTML = `
        <p class="text-xs font-mono-tech font-bold text-cyan-400 px-2 pb-1">Decision Index (${filtered.length})</p>
        ${filtered
          .map((item) => {
            const isActive = activeIndexId === item.id;
            return `
              <button
                type="button"
                class="adr-index-link ${isActive ? "is-active" : ""}"
                data-adr-jump="${escHtml(item.id)}"
              >
                <span class="flex items-center justify-between gap-2 text-[11px] font-mono-tech text-[var(--muted)] tabular-nums">
                  <span class="font-bold text-indigo-400">${escHtml(item.code)}</span>
                  <span>${escHtml(item.date)}</span>
                </span>
                <span class="text-xs font-semibold text-[var(--text)] leading-snug">${escHtml(item.title)}</span>
              </button>
            `;
          })
          .join("")}
      `;

      indexRailMount.querySelectorAll("[data-adr-jump]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-adr-jump");
          if (!id) return;
          activeIndexId = id;
          expandedIds.add(id);
          renderIndexRail(filtered);
          syncExpandedCard(id);
          const cardEl = document.getElementById(`adr-card-${id}`);
          if (cardEl) {
            cardEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });
    }

    function renderWorkspace() {
      const filtered = filterDecisions(decisions, {
        tech: activeTech,
        project: activeProject,
        query: searchQuery
      });

      if (countEl) {
        countEl.textContent = `${filtered.length} ${filtered.length === 1 ? "decision record" : "decision records"}`;
      }

      if (filtered.length && !filtered.some((d) => d.id === activeIndexId)) {
        activeIndexId = filtered[0].id;
      }

      renderIndexRail(filtered);
      updateToggleAllLabel(filtered);

      if (!cardsMount) return;

      if (filtered.length === 0) {
        cardsMount.innerHTML = `
          <div class="adr-card p-8 text-center space-y-4">
            <i data-lucide="file-search" class="w-8 h-8 text-cyan-400 mx-auto"></i>
            <p class="text-sm text-[var(--muted)]">No engineering decisions match your current search, technology, or project filters.</p>
            <button type="button" id="adr-empty-reset" class="outline-button text-xs mx-auto">Reset Filters</button>
          </div>
        `;
        const emptyReset = document.getElementById("adr-empty-reset");
        if (emptyReset) {
          emptyReset.addEventListener("click", resetFilters);
        }
        refreshIcons();
        return;
      }

      cardsMount.innerHTML = filtered
        .map((item) => {
          const isOpen = expandedIds.has(item.id);
          const projectsSummary = (item.projects || []).map((p) => p.title).join(", ");
          const techHtml = (item.technologies || [])
            .map((t) => `<span class="tech-badge-item text-xs py-1 px-2.5">${escHtml(t)}</span>`)
            .join("");

          const optionsHtml = (item.options || [])
            .map(
              (opt) => `
              <div class="adr-option-cell ${opt.selected ? "is-selected" : ""}">
                <div class="flex items-center justify-between gap-2 text-xs font-bold">
                  <span class="${opt.selected ? "text-cyan-400" : "text-[var(--text)]"}">${escHtml(opt.name)}</span>
                  ${
                    opt.selected
                      ? `<i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-cyan-400 shrink-0" aria-label="Selected option"></i>`
                      : ""
                  }
                </div>
                <p class="text-xs text-[var(--muted)] leading-relaxed">${escHtml(opt.summary)}</p>
              </div>
            `
            )
            .join("");

          return `
            <article id="adr-card-${escHtml(item.id)}" class="adr-card p-5 sm:p-6">
              <div class="space-y-4">
                <!-- Clean Metadata Bar -->
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-mono-tech font-bold text-indigo-400">${escHtml(item.code)}</span>
                    <span class="text-[var(--muted)]" aria-hidden="true">·</span>
                    <span class="font-semibold text-[var(--text-secondary)]">${escHtml(projectsSummary)}</span>
                  </div>
                  <span class="font-mono-tech text-[var(--muted)] tabular-nums">${escHtml(item.date)}</span>
                </div>

                <!-- Title & Selected Solution Summary -->
                <div class="space-y-2">
                  <h2 class="text-lg sm:text-xl font-bold text-[var(--text)]">${escHtml(item.title)}</h2>
                  <p class="text-sm text-[var(--muted)] leading-relaxed">
                    <span class="font-semibold text-[var(--text-secondary)]">Problem:</span>
                    ${escHtml(item.problem)}
                  </p>
                </div>

                <!-- Highlighted Decision Summary -->
                <div class="text-xs sm:text-sm text-[var(--text-secondary)] space-y-1">
                  <p>
                    <span class="font-semibold text-cyan-400">Selected Solution:</span>
                    ${escHtml(item.selectedSolution)}
                  </p>
                </div>

                <div class="flex flex-wrap gap-1.5">${techHtml}</div>

                <!-- Action Bar -->
                <div class="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    class="outline-button text-xs py-2 px-3 min-h-[38px]"
                    data-adr-expand="${escHtml(item.id)}"
                    aria-expanded="${isOpen ? "true" : "false"}"
                  >
                    <i data-lucide="${isOpen ? "chevron-up" : "chevron-down"}" class="w-4 h-4"></i>
                    <span>${isOpen ? "Collapse Record" : "Expand Decision Record"}</span>
                  </button>

                  ${
                    item.href
                      ? `
                        <a href="${escHtml(item.href)}" class="text-xs sm:text-sm font-semibold text-cyan-400 hover:underline inline-flex items-center gap-1.5">
                          <span>Inspect Related Case Study</span>
                          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                        </a>
                      `
                      : ""
                  }
                </div>
              </div>

              <!-- Expandable Full ADR Specification -->
              <div id="adr-body-${escHtml(item.id)}" class="adr-details-body ${isOpen ? "" : "hidden"}">
                <div class="adr-spec-grid">
                  <div class="adr-spec-block">
                    <h3 class="text-xs font-mono-tech font-bold text-indigo-400">Context</h3>
                    <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(item.context)}</p>
                  </div>
                  <div class="adr-spec-block">
                    <h3 class="text-xs font-mono-tech font-bold text-cyan-400">Reason</h3>
                    <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(item.reason)}</p>
                  </div>
                </div>

                <div class="space-y-2">
                  <h3 class="text-xs font-mono-tech font-bold text-[var(--text)]">Options Considered</h3>
                  <div class="adr-options-table">${optionsHtml}</div>
                </div>

                <div class="adr-spec-grid">
                  <div class="adr-spec-block">
                    <h3 class="text-xs font-mono-tech font-bold text-amber-400">Trade-Offs</h3>
                    <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(item.tradeOffs)}</p>
                  </div>
                  <div class="adr-spec-block">
                    <h3 class="text-xs font-mono-tech font-bold text-emerald-400">Result</h3>
                    <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(item.result)}</p>
                  </div>
                </div>
              </div>
            </article>
          `;
        })
        .join("");

      cardsMount.querySelectorAll("[data-adr-expand]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-adr-expand");
          if (!id) return;
          if (expandedIds.has(id)) {
            expandedIds.delete(id);
          } else {
            expandedIds.add(id);
            activeIndexId = id;
            renderIndexRail(filtered);
          }
          syncExpandedCard(id);
        });
      });

      refreshIcons();
    }

    function resetFilters() {
      activeTech = "All";
      activeProject = "All";
      searchQuery = "";
      if (searchInput) searchInput.value = "";
      if (searchClear) searchClear.classList.add("hidden");
      populateProjectSelect();
      renderTechTabs();
      renderWorkspace();
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value.trim();
        if (searchClear) searchClear.classList.toggle("hidden", searchQuery === "");
        renderWorkspace();
      });
    }

    if (searchClear) {
      searchClear.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
        }
        searchQuery = "";
        searchClear.classList.add("hidden");
        renderWorkspace();
      });
    }

    if (projectSelect) {
      projectSelect.addEventListener("change", () => {
        activeProject = projectSelect.value || "All";
        renderWorkspace();
      });
    }

    if (toggleAllBtn) {
      toggleAllBtn.addEventListener("click", () => {
        const filtered = filterDecisions(decisions, {
          tech: activeTech,
          project: activeProject,
          query: searchQuery
        });
        const allOpen = filtered.length > 0 && filtered.every((d) => expandedIds.has(d.id));
        if (allOpen) {
          filtered.forEach((d) => expandedIds.delete(d.id));
        } else {
          filtered.forEach((d) => expandedIds.add(d.id));
        }
        renderWorkspace();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", resetFilters);
    }

    populateProjectSelect();
    renderTechTabs();
    renderWorkspace();
  }

  window.PortfolioDecisions = {
    init,
    DEFAULT_ENGINEERING_DECISIONS,
    getDecisionsData,
    filterDecisions,
    collectTechFilters,
    collectProjectFilters
  };
})();
