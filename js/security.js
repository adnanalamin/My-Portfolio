/**
 * AL AMIN Portfolio — Phase 29: Security Center
 * Honest, verifiable inventory of security mechanisms across AL AMIN's portfolio
 * and documented projects using explicit status labels:
 * Implemented | Experimental | Planned
 */

(() => {
  const ALLOWED_STATUSES = ["Implemented", "Planned", "Experimental"];

  const STATUS_META = {
    Implemented: { icon: "check-circle-2", label: "Implemented" },
    Experimental: { icon: "flask-conical", label: "Experimental" },
    Planned: { icon: "clock", label: "Planned" }
  };

  const DEFAULT_SECURITY_CONTROLS = [
    {
      id: "authentication",
      code: "SEC-01",
      title: "Authentication",
      icon: "lock",
      status: "Implemented",
      summary:
        "Documented token-based user authentication across full-stack MERN builds, paired with unauthenticated read-only posture on public portfolio pages.",
      implementationDetails:
        "Nexora supports guest session tracking with cart merge upon sign-in, while School Management System and AstraPulse authenticate accounts before granting tenant or portal access. The public static portfolio avoids password gates completely.",
      projects: ["AstraPulse", "Nexora", "School Management System", "SLIDEVERSE"]
    },
    {
      id: "authorization",
      code: "SEC-02",
      title: "Authorization",
      icon: "shield-check",
      status: "Implemented",
      summary:
        "Role-Based Access Control (RBAC) middleware restricting protected operations by user role and tenant ownership.",
      implementationDetails:
        "School Management System separates Admin, Teacher, and Student capabilities (read-only grade/schedule views for students, class-scoped writes for teachers). AstraPulse isolates workspaces by Admin, Developer, and Viewer roles.",
      projects: ["School Management System", "AstraPulse", "E-commerce SaaS"]
    },
    {
      id: "password-hashing",
      code: "SEC-03",
      title: "Password Hashing",
      icon: "key-round",
      status: "Planned",
      summary:
        "Per-user salted adaptive hashing (bcrypt / Argon2id) specified for backend credential storage—not active in this static browser bundle.",
      implementationDetails:
        "Because this portfolio runs purely statically with zero credential database, no live password hashing endpoint executes here. Full-stack production templates require per-user salted Argon2id or bcrypt (cost >= 12) and zero plaintext storage.",
      projects: ["School Management System", "Nexora", "E-commerce SaaS"]
    },
    {
      id: "jwt",
      code: "SEC-04",
      title: "JWT",
      icon: "key",
      status: "Implemented",
      summary:
        "Stateless signed JSON Web Token verification modeled inside Express middleware guards for API authorization.",
      implementationDetails:
        "Express route guards validate JWT signatures and inspect role/workspace claims prior to executing protected controllers in AstraPulse, School Management System, and Nexora designs.",
      projects: ["AstraPulse", "School Management System", "Nexora"]
    },
    {
      id: "input-validation",
      code: "SEC-05",
      title: "Input Validation",
      icon: "file-check-2",
      status: "Implemented",
      summary:
        "Active client-side field validation, HTML output escaping (escapeHtml), URL hostname checks, and Mongoose schema enforcement.",
      implementationDetails:
        "Implemented live across js/contact.js, js/request.js (per-step validation & URL verification), js/architect.js, and global DOM output escaping via window.escapeHtml() across every dynamic template, plus Mongoose schema validation in MERN backends.",
      projects: ["Portfolio System", "School Management System", "Nexora"]
    },
    {
      id: "rate-limiting",
      code: "SEC-06",
      title: "Rate Limiting",
      icon: "gauge",
      status: "Planned",
      summary:
        "Graceful client handling of upstream GitHub API rate-limit headers is active; backend per-IP request throttling remains planned for server deployments.",
      implementationDetails:
        "js/github.js inspects x-ratelimit-limit and x-ratelimit-remaining headers and caches responses locally for 15 minutes to avoid quota exhaustion. Server-side sliding-window throttling on /auth/* and /api/* endpoints is scoped as Planned for live backends.",
      projects: ["Portfolio System", "AstraPulse"]
    },
    {
      id: "cors",
      code: "SEC-07",
      title: "CORS",
      icon: "globe",
      status: "Planned",
      summary:
        "Explicit origin allowlisting defined for decoupled Express backend deployments; currently planned rather than active on static origins.",
      implementationDetails:
        "Full-stack API designs restrict cross-origin credentialed requests to explicit frontend origins instead of wildcard origins. The static portfolio only fetches public CORS-enabled read endpoints such as api.github.com.",
      projects: ["AstraPulse", "E-commerce SaaS"]
    },
    {
      id: "security-headers",
      code: "SEC-08",
      title: "Security Headers",
      icon: "shield",
      status: "Experimental",
      summary:
        "Sandbox iframe isolation, external link rel=noopener noreferrer, referrer policies, and SW origin scoping are active; full HTTP CSP/HSTS headers depend on edge hosting.",
      implementationDetails:
        "playground.html renders user snippets inside a sandboxed iframe without leaking parent storage, external anchors enforce rel='noopener noreferrer', and images specify referrerpolicy='no-referrer'. Server response headers (CSP, HSTS, X-Frame-Options) are being tested across deployment targets.",
      projects: ["Portfolio System", "Browser Code Playground"]
    },
    {
      id: "environment-variables",
      code: "SEC-09",
      title: "Environment Variables",
      icon: "eye-off",
      status: "Implemented",
      summary:
        "Strict zero-secret client bundle hygiene with Vite envPrefix isolation and server-proxy adapter boundaries.",
      implementationDetails:
        "vite.config.ts and js/config.js store zero third-party API secrets. Integrations like assistant and project-architect default to local rule engines with clean backendEndpoint hooks pointing only to trusted server routes.",
      projects: ["Portfolio System", "E-commerce SaaS", "AstraPulse"]
    },
    {
      id: "api-security",
      code: "SEC-10",
      title: "API Security",
      icon: "server",
      status: "Implemented",
      summary:
        "Server-authoritative pricing/stock checks, versioned /api/v1/* endpoints, and explicit payload validation boundaries.",
      implementationDetails:
        "Nexora recomputes cart subtotals and verifies inventory server-side during order checkout rather than trusting client prices. Portfolio service workers bypass cross-origin and /api/* routes completely.",
      projects: ["Nexora", "AstraPulse", "School Management System", "Portfolio System"]
    },
    {
      id: "error-handling",
      code: "SEC-11",
      title: "Error Handling",
      icon: "alert-triangle",
      status: "Implemented",
      summary:
        "Graceful non-leaking user error states and offline fallbacks ensuring internal traces never surface in the UI.",
      implementationDetails:
        "Verified in js/github.js (network/quota banners), js/contact.js & js/request.js (inline field messages), 404.html, and sw.js offline fallbacks without exposing raw paths or credentials.",
      projects: ["Portfolio System", "AstraPulse", "Nexora"]
    },
    {
      id: "audit-logging",
      code: "SEC-12",
      title: "Audit Logging",
      icon: "scroll-text",
      status: "Planned",
      summary:
        "Telemetry and request log data schemas are modeled in AstraPulse; immutable security audit streaming is planned for backend deployment.",
      implementationDetails:
        "AstraPulse includes EventLogs document designs capturing workspaceId, level, route, statusCode, and timestamp, while persistent administrative security audit trails remain planned alongside backend runtime infrastructure.",
      projects: ["AstraPulse", "E-commerce SaaS"]
    },
    {
      id: "secure-file-uploads",
      code: "SEC-13",
      title: "Secure File Uploads",
      icon: "upload-cloud",
      status: "Planned",
      summary:
        "No user file upload routes exist currently; pre-signed object storage, MIME inspection, and size limits are planned when uploads are introduced.",
      implementationDetails:
        "All portfolio assets are static curated local files. Future SaaS merchant or academic portals introducing file uploads require strict MIME allowlists, size bounds, randomized keys, and pre-signed storage URLs outside web roots.",
      projects: ["E-commerce SaaS", "School Management System"]
    },
    {
      id: "database-security",
      code: "SEC-14",
      title: "Database Security",
      icon: "database",
      status: "Implemented",
      summary:
        "Tenant isolation keys, compound indexing, ODM schema constraints, and ledger separation in multi-tenant designs.",
      implementationDetails:
        "E-commerce SaaS separates ACID PostgreSQL financial order ledgers from MongoDB catalog/theme documents. School Management System applies strict Mongoose schema validation and compound indexes, while Nexora snapshots order pricing at checkout.",
      projects: ["E-commerce SaaS", "School Management System", "AstraPulse", "Nexora"]
    }
  ];

  const DEFAULT_PROJECT_SECURITY = [
    {
      id: "portfolio-system",
      title: "Portfolio System",
      type: "Static Multi-Page Web App",
      href: "project-details.html?id=portfolio-system",
      features: [
        { name: "XSS Output Escaping (window.escapeHtml) across dynamic templates", status: "Implemented" },
        { name: "Step & Field Input Validation (contact.js, request.js, architect.js)", status: "Implemented" },
        { name: "Zero Client Secrets / Empty Backend Proxy Config Posture", status: "Implemented" },
        { name: "Sandboxed Playground Iframe + rel=noopener noreferrer Link Hardening", status: "Experimental" },
        { name: "GitHub x-ratelimit Awareness & Non-Leaking Offline/404 Fallbacks", status: "Implemented" }
      ]
    },
    {
      id: "astrapulse",
      title: "AstraPulse",
      type: "SaaS Telemetry & Analytics",
      href: "project-details.html?id=astrapulse",
      features: [
        { name: "JWT Authentication & Workspace Role Guard (Admin / Developer / Viewer)", status: "Implemented" },
        { name: "Tenant-Scoped Time-Bucket Queries & Indexed Workspaces", status: "Implemented" },
        { name: "Structured EventLogs Telemetry Schema Design", status: "Implemented" },
        { name: "Per-Workspace API Rate Limiting & Edge CORS Allowlist", status: "Planned" }
      ]
    },
    {
      id: "nexora",
      title: "Nexora",
      type: "Headless MERN E-Commerce",
      href: "project-details.html?id=nexora",
      features: [
        { name: "Server-Authoritative Order Totals & Inventory Stock Validation", status: "Implemented" },
        { name: "Immutable Line-Item Price Snapshots at Checkout", status: "Implemented" },
        { name: "JWT Customer Auth with Safe Guest-to-User Cart Merge", status: "Implemented" },
        { name: "Salted Backend Password Hashing (Argon2id / bcrypt)", status: "Planned" }
      ]
    },
    {
      id: "school-management-system",
      title: "School Management System",
      type: "Role-Based Academic Portal",
      href: "project-details.html?id=school-management-system",
      features: [
        { name: "Multi-Role RBAC Middleware (Admin, Teacher, Student)", status: "Implemented" },
        { name: "Mongoose ODM Schema Validation & Compound Class-Date Indexes", status: "Implemented" },
        { name: "Protected Write Endpoints with JWT Verification", status: "Implemented" },
        { name: "Staff Credential Hashing & Signed Student Document Uploads", status: "Planned" }
      ]
    },
    {
      id: "ecommerce-saas",
      title: "E-commerce SaaS",
      type: "Multi-Tenant Store Builder",
      href: "project-details.html?id=ecommerce-saas",
      features: [
        { name: "Hybrid Database Isolation (PostgreSQL Order Ledgers + MongoDB Themes)", status: "Implemented" },
        { name: "Tenant Storefront Boundary & Role-Scoped Fulfillment Actions", status: "Implemented" },
        { name: "Multi-Tenant CORS Policy & Immutable Audit Streaming", status: "Planned" },
        { name: "Pre-Signed Merchant Product Image Upload Pipeline", status: "Planned" }
      ]
    },
    {
      id: "slideverse",
      title: "SLIDEVERSE",
      type: "Interactive Presentation Studio",
      href: "project-details.html?id=slideverse",
      features: [
        { name: "Creator Editing Rights Separated from Read-Only Presentation Links", status: "Implemented" },
        { name: "Validated JSON Deck Serialization & Scoped CSS Variable Updates", status: "Implemented" }
      ]
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

  function getSecurityConfigData() {
    const cfg = (window.portfolioConfig && window.portfolioConfig.securityCenter) || null;
    const controls =
      cfg && Array.isArray(cfg.controls) && cfg.controls.length > 0
        ? cfg.controls
        : DEFAULT_SECURITY_CONTROLS;
    const projectProfiles =
      cfg && Array.isArray(cfg.projectProfiles) && cfg.projectProfiles.length > 0
        ? cfg.projectProfiles
        : DEFAULT_PROJECT_SECURITY;
    return { controls, projectProfiles };
  }

  function renderStatusBadge(status) {
    const safeStatus = ALLOWED_STATUSES.includes(status) ? status : "Planned";
    const meta = STATUS_META[safeStatus] || STATUS_META.Planned;
    return `
      <span class="sec-status-label" data-sec-status="${escHtml(safeStatus)}">
        <i data-lucide="${escHtml(meta.icon)}" class="w-3.5 h-3.5 shrink-0" aria-hidden="true"></i>
        <span>${escHtml(meta.label)}</span>
      </span>
    `;
  }

  function filterControls(controls, { status = "All", query = "" } = {}) {
    const q = String(query || "").trim().toLowerCase();
    return (controls || []).filter((item) => {
      const matchStatus = status === "All" || item.status === status;
      if (!matchStatus) return false;
      if (!q) return true;
      const hay = [
        item.code,
        item.title,
        item.status,
        item.summary,
        item.implementationDetails,
        ...(item.projects || [])
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function filterProjectProfiles(profiles, { projectId = "All" } = {}) {
    if (!projectId || projectId === "All") return profiles || [];
    return (profiles || []).filter((p) => p.id === projectId);
  }

  function init() {
    const root = document.getElementById("security-center-root");
    if (!root) return;

    const { controls, projectProfiles } = getSecurityConfigData();

    let activeStatus = "All";
    let searchQuery = "";
    let selectedProjectId = "All";
    const expandedIds = new Set();

    const summaryMount = document.getElementById("sec-summary-strip");
    const searchInput = document.getElementById("sec-search-input");
    const searchClear = document.getElementById("sec-search-clear");
    const filterTabsMount = document.getElementById("sec-status-tabs");
    const resetBtn = document.getElementById("sec-reset-btn");
    const countEl = document.getElementById("sec-count-label");
    const controlsGridMount = document.getElementById("sec-controls-grid");
    const projectSelect = document.getElementById("sec-project-select");
    const projectGridMount = document.getElementById("sec-projects-grid");

    function renderSummary() {
      if (!summaryMount) return;
      const total = controls.length;
      const implementedCount = controls.filter((c) => c.status === "Implemented").length;
      const experimentalCount = controls.filter((c) => c.status === "Experimental").length;
      const plannedCount = controls.filter((c) => c.status === "Planned").length;

      const cards = [
        { label: "Documented Domains", count: total, status: "Total", icon: "shield-check", tone: "text-[var(--text)]" },
        { label: "Implemented", count: implementedCount, status: "Implemented", icon: "check-circle-2", tone: "text-emerald-400" },
        { label: "Experimental", count: experimentalCount, status: "Experimental", icon: "flask-conical", tone: "text-cyan-400" },
        { label: "Planned", count: plannedCount, status: "Planned", icon: "clock", tone: "text-amber-400" }
      ];

      summaryMount.innerHTML = cards
        .map(
          (c) => `
          <div class="sec-stat-card">
            <div class="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
              <span>${escHtml(c.label)}</span>
              <i data-lucide="${escHtml(c.icon)}" class="w-4 h-4 ${c.tone} shrink-0" aria-hidden="true"></i>
            </div>
            <p class="text-2xl font-extrabold font-mono-tech tabular-nums ${c.tone}">${escHtml(String(c.count))}</p>
          </div>
        `
        )
        .join("");
    }

    function renderFilterTabs() {
      if (!filterTabsMount) return;
      const tabs = ["All", ...ALLOWED_STATUSES];
      filterTabsMount.innerHTML = tabs
        .map((st) => {
          const isActive = activeStatus === st;
          return `
            <button
              type="button"
              class="sec-filter-btn ${isActive ? "is-active" : ""}"
              data-sec-filter="${escHtml(st)}"
              aria-pressed="${isActive ? "true" : "false"}"
            >
              ${st === "All" ? "All Controls" : escHtml(st)}
            </button>
          `;
        })
        .join("");

      filterTabsMount.querySelectorAll("[data-sec-filter]").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeStatus = btn.getAttribute("data-sec-filter") || "All";
          renderFilterTabs();
          renderControlsGrid();
        });
      });
    }

    function syncControlExpand(id) {
      const btn = document.querySelector(`[data-sec-expand="${id}"]`);
      const panel = document.getElementById(`sec-evidence-${id}`);
      const isOpen = expandedIds.has(id);
      if (btn) {
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        btn.innerHTML = isOpen
          ? `<i data-lucide="chevron-up" class="w-4 h-4"></i><span>Hide Verification Notes</span>`
          : `<i data-lucide="chevron-down" class="w-4 h-4"></i><span>Verification Notes</span>`;
      }
      if (panel) {
        panel.classList.toggle("hidden", !isOpen);
      }
      refreshIcons();
    }

    function renderControlsGrid() {
      if (!controlsGridMount) return;
      const filtered = filterControls(controls, { status: activeStatus, query: searchQuery });

      if (countEl) {
        countEl.textContent = `${filtered.length} of ${controls.length} security controls`;
      }

      if (filtered.length === 0) {
        controlsGridMount.innerHTML = `
          <div class="sec-card p-8 text-center space-y-3 col-span-full">
            <i data-lucide="shield-alert" class="w-8 h-8 text-cyan-400 mx-auto"></i>
            <p class="text-sm text-[var(--muted)]">No security controls match your active filter or search term.</p>
            <button type="button" id="sec-empty-reset" class="outline-button text-xs mx-auto">Reset Filters</button>
          </div>
        `;
        const emptyBtn = document.getElementById("sec-empty-reset");
        if (emptyBtn) emptyBtn.addEventListener("click", resetFilters);
        refreshIcons();
        return;
      }

      controlsGridMount.innerHTML = filtered
        .map((item) => {
          const isOpen = expandedIds.has(item.id);
          const projectsLine = (item.projects || []).join(" · ");
          return `
            <article class="sec-card p-5 sm:p-6 flex flex-col justify-between gap-4">
              <div class="space-y-3.5">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="sec-icon-frame" aria-hidden="true">
                      <i data-lucide="${escHtml(item.icon)}" class="w-4 h-4"></i>
                    </span>
                    <div class="min-w-0">
                      <p class="text-[11px] font-mono-tech text-[var(--muted)] tabular-nums">${escHtml(item.code)}</p>
                      <h3 class="text-base sm:text-lg font-bold text-[var(--text)] truncate">${escHtml(item.title)}</h3>
                    </div>
                  </div>
                  ${renderStatusBadge(item.status)}
                </div>

                <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escHtml(item.summary)}</p>

                <p class="text-xs text-[var(--text-secondary)]">
                  <span class="text-[var(--muted)]">Applies to:</span> ${escHtml(projectsLine)}
                </p>
              </div>

              <div>
                <div class="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    class="outline-button text-xs py-1.5 px-3 min-h-[38px]"
                    data-sec-expand="${escHtml(item.id)}"
                    aria-expanded="${isOpen ? "true" : "false"}"
                  >
                    <i data-lucide="${isOpen ? "chevron-up" : "chevron-down"}" class="w-4 h-4"></i>
                    <span>${isOpen ? "Hide Verification Notes" : "Verification Notes"}</span>
                  </button>
                </div>

                <div id="sec-evidence-${escHtml(item.id)}" class="sec-evidence-panel ${isOpen ? "" : "hidden"}">
                  <p class="text-xs font-semibold text-cyan-400">Implementation Reality &amp; Scope</p>
                  <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(item.implementationDetails)}</p>
                </div>
              </div>
            </article>
          `;
        })
        .join("");

      controlsGridMount.querySelectorAll("[data-sec-expand]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-sec-expand");
          if (!id) return;
          if (expandedIds.has(id)) {
            expandedIds.delete(id);
          } else {
            expandedIds.add(id);
          }
          syncControlExpand(id);
        });
      });

      refreshIcons();
    }

    function populateProjectSelect() {
      if (!projectSelect) return;
      const options = [{ id: "All", title: "All Projects" }, ...projectProfiles];
      projectSelect.innerHTML = options
        .map(
          (p) =>
            `<option value="${escHtml(p.id)}" ${p.id === selectedProjectId ? "selected" : ""}>${escHtml(
              p.title
            )}</option>`
        )
        .join("");
    }

    function renderProjectProfiles() {
      if (!projectGridMount) return;
      const visible = filterProjectProfiles(projectProfiles, { projectId: selectedProjectId });

      projectGridMount.innerHTML = visible
        .map((proj) => {
          const rows = (proj.features || [])
            .map(
              (f) => `
              <li class="flex items-start justify-between gap-3 py-2 border-t border-[var(--border)] text-xs sm:text-sm">
                <span class="text-[var(--text-secondary)] leading-snug">${escHtml(f.name)}</span>
                ${renderStatusBadge(f.status)}
              </li>
            `
            )
            .join("");

          return `
            <article class="sec-card p-5 sm:p-6 flex flex-col justify-between gap-4">
              <div class="space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p class="text-xs font-mono-tech text-cyan-400">${escHtml(proj.type)}</p>
                    <h3 class="text-lg font-bold text-[var(--text)]">${escHtml(proj.title)}</h3>
                  </div>
                  ${
                    proj.href
                      ? `
                        <a href="${escHtml(proj.href)}" class="text-xs font-semibold text-cyan-400 hover:underline inline-flex items-center gap-1">
                          <span>Case Study</span>
                          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                        </a>
                      `
                      : ""
                  }
                </div>

                <ul class="list-none p-0 m-0">${rows}</ul>
              </div>
            </article>
          `;
        })
        .join("");

      refreshIcons();
    }

    function resetFilters() {
      activeStatus = "All";
      searchQuery = "";
      if (searchInput) searchInput.value = "";
      if (searchClear) searchClear.classList.add("hidden");
      renderFilterTabs();
      renderControlsGrid();
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value.trim();
        if (searchClear) searchClear.classList.toggle("hidden", searchQuery === "");
        renderControlsGrid();
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
        renderControlsGrid();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", resetFilters);
    }

    if (projectSelect) {
      projectSelect.addEventListener("change", () => {
        selectedProjectId = projectSelect.value || "All";
        renderProjectProfiles();
      });
    }

    renderSummary();
    renderFilterTabs();
    renderControlsGrid();
    populateProjectSelect();
    renderProjectProfiles();
  }

  window.PortfolioSecurity = {
    init,
    ALLOWED_STATUSES,
    DEFAULT_SECURITY_CONTROLS,
    DEFAULT_PROJECT_SECURITY,
    getSecurityConfigData,
    filterControls,
    filterProjectProfiles
  };
})();
