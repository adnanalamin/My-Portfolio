/**
 * AL AMIN Portfolio — Phase 19: Project Comparison & Technology Explorer
 * Built exclusively on centralized PortfolioSkills.skillsCatalog &
 * PortfolioProjects.projectsData (zero duplicated datasets).
 */

const PortfolioExplorer = (() => {
  const MAX_COMPARE = 3;

  // Service directory aligned with js/main.js servicesData
  const servicesCatalog = [
    "Full-Stack Web Development",
    "MERN Stack Development",
    "Frontend Development",
    "Backend API Development",
    "Admin Dashboard Development",
    "E-commerce Development",
    "SaaS Development",
    "Website Redesign",
    "Responsive Web Design",
    "Performance Optimization",
    "SEO-Friendly Development",
    "UI/UX Implementation"
  ];

  // Alias normalization connecting PortfolioSkills names <-> PortfolioProjects technologies
  const techMetaRules = {
    HTML5: {
      displayName: "HTML5",
      aliases: ["html5", "html"],
      services: ["Frontend Development", "Responsive Web Design", "SEO-Friendly Development", "Website Redesign"],
      learningNote: "Core Web foundation from B.Sc. CSE coursework and semantic accessibility architecture across static and React apps."
    },
    CSS3: {
      displayName: "CSS3",
      aliases: ["css3", "css"],
      services: ["Frontend Development", "Responsive Web Design", "UI/UX Implementation", "Website Redesign"],
      learningNote: "Applied in fluid clamp() typography scales, compositor-only keyframe animations, and dark/light theme tokens."
    },
    Tailwind: {
      displayName: "Tailwind CSS",
      aliases: ["tailwind", "tailwind css"],
      services: ["Frontend Development", "Responsive Web Design", "UI/UX Implementation", "SaaS Development"],
      learningNote: "Daily utility workflow combined with custom CSS properties for 320px–2560px multi-breakpoint grids."
    },
    JavaScript: {
      displayName: "JavaScript",
      aliases: ["javascript", "es2024", "js"],
      services: ["Full-Stack Web Development", "Frontend Development", "Performance Optimization"],
      learningNote: "Modular Vanilla JS IIFE architecture, async REST integration, and modern ES2024 browser engineering."
    },
    React: {
      displayName: "React",
      aliases: ["react"],
      services: ["MERN Stack Development", "Full-Stack Web Development", "Frontend Development", "SaaS Development"],
      learningNote: "Primary UI library across AstraPulse, Nexora, SLIDEVERSE, School Management System, and E-commerce SaaS."
    },
    Redux: {
      displayName: "Redux",
      aliases: ["redux", "redux toolkit"],
      services: ["MERN Stack Development", "E-commerce Development", "Frontend Development"],
      learningNote: "Predictable client cart and multi-filter state management demonstrated in Nexora."
    },
    "Next.js": {
      displayName: "Next.js",
      aliases: ["next.js", "nextjs"],
      services: ["SaaS Development", "E-commerce Development", "SEO-Friendly Development", "Full-Stack Web Development"],
      learningNote: "Dynamic tenant storefront routing and SEO metadata workflows used in E-commerce SaaS."
    },
    "Node.js": {
      displayName: "Node.js",
      aliases: ["node.js", "nodejs"],
      services: ["MERN Stack Development", "Backend API Development", "Full-Stack Web Development", "SaaS Development"],
      learningNote: "Asynchronous JavaScript runtime powering REST services and ingestion pipelines across MERN apps."
    },
    Express: {
      displayName: "Express.js",
      aliases: ["express", "express.js"],
      services: ["MERN Stack Development", "Backend API Development", "Admin Dashboard Development"],
      learningNote: "Modular middleware architecture for validation, tenant isolation, and JWT role-based guards."
    },
    "REST API": {
      displayName: "REST APIs",
      aliases: ["rest api", "rest apis", "restful"],
      services: ["Backend API Development", "Full-Stack Web Development", "MERN Stack Development"],
      learningNote: "Versioned resource endpoints, cursor logs, and clean request/response validation contracts."
    },
    Authentication: {
      displayName: "Authentication & RBAC",
      aliases: ["authentication", "jwt", "rbac"],
      services: ["Backend API Development", "SaaS Development", "Admin Dashboard Development"],
      learningNote: "Stateless JWT verification and workspace/class role authorization across multi-user portals."
    },
    MongoDB: {
      displayName: "MongoDB",
      aliases: ["mongodb"],
      services: ["MERN Stack Development", "SaaS Development", "Admin Dashboard Development"],
      learningNote: "Document schemas, time-bucket aggregations, and compound indexing for fast analytics queries."
    },
    Mongoose: {
      displayName: "Mongoose",
      aliases: ["mongoose"],
      services: ["MERN Stack Development", "Backend API Development", "Admin Dashboard Development"],
      learningNote: "Strict ODM schema validation and normalized model population in School Management System & Nexora."
    },
    PostgreSQL: {
      displayName: "PostgreSQL",
      aliases: ["postgresql", "postgres", "sql"],
      services: ["SaaS Development", "Backend API Development", "E-commerce Development"],
      learningNote: "Configured relational database skill — applied for ACID-safe financial order ledgers in E-commerce SaaS paired with DBMS studies."
    },
    Git: {
      displayName: "Git",
      aliases: ["git"],
      services: ["Full-Stack Web Development", "MERN Stack Development"],
      learningNote: "Version control branching, atomic commits, and release workflow management across all projects."
    },
    GitHub: {
      displayName: "GitHub",
      aliases: ["github"],
      services: ["Full-Stack Web Development", "Backend API Development"],
      learningNote: "Repository hosting, pull requests, issue workflows, and public GitHub REST API integration."
    },
    "VS Code": {
      displayName: "VS Code",
      aliases: ["vs code", "vscode"],
      services: ["Frontend Development", "Full-Stack Web Development"],
      learningNote: "Primary code editor configured for TypeScript checking, formatting, debugging, and REST testing."
    },
    Postman: {
      displayName: "Postman",
      aliases: ["postman"],
      services: ["Backend API Development", "MERN Stack Development"],
      learningNote: "API endpoint verification, environment token presets, and payload edge-case testing."
    },
    Figma: {
      displayName: "Figma",
      aliases: ["figma"],
      services: ["UI/UX Implementation", "Website Redesign", "Responsive Web Design"],
      learningNote: "Component frames, design tokens, and visual prototyping prior to HTML/React implementation."
    }
  };

  const state = {
    activeTechCategory: "All",
    selectedTechKey: "",
    searchQuery: "",
    filterTech: "All",
    filterType: "All",
    filterCategory: "All",
    filterStatus: "All",
    featuredOnly: false,
    compareIds: []
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

  function getConfiguredSkills() {
    if (!window.PortfolioSkills || !Array.isArray(window.PortfolioSkills.skillsCatalog)) {
      return [];
    }
    // Limit Explorer strictly to configured technologies in Frontend, Backend, Database, Tools
    const allowedCategories = new Set(["Frontend", "Backend", "Database", "Tools"]);
    return window.PortfolioSkills.skillsCatalog
      .filter((s) => allowedCategories.has(s.category))
      .map((s) => {
        const meta = techMetaRules[s.name] || {};
        return {
          key: s.name,
          displayName: meta.displayName || s.name,
          category: s.category,
          level: s.level,
          icon: s.icon || "cpu",
          summary: s.summary,
          aliases: meta.aliases || [s.name.toLowerCase()],
          services: meta.services || ["Full-Stack Web Development", "Frontend Development"],
          learningNote: meta.learningNote || `Configured under ${s.category} engineering workflow.`
        };
      });
  }

  function getProjects() {
    if (!window.PortfolioProjects || !Array.isArray(window.PortfolioProjects.projectsData)) {
      return [];
    }
    return window.PortfolioProjects.projectsData;
  }

  function projectUsesTech(project, techItem) {
    if (!project || !techItem) return false;
    const aliases = techItem.aliases || [techItem.key.toLowerCase()];
    const projectTechs = (project.technologies || []).map((t) => t.toLowerCase());
    const archText = project.systemArchitecture
      ? Object.values(project.systemArchitecture)
          .map((n) => `${n.title || ""} ${n.tech || ""}`)
          .join(" ")
          .toLowerCase()
      : "";
    const selectionText = Array.isArray(project.technologySelection)
      ? project.technologySelection.map((t) => `${t.name || ""} ${t.rationale || ""}`).join(" ").toLowerCase()
      : "";

    return aliases.some(
      (alias) =>
        projectTechs.some((pt) => pt === alias || pt.includes(alias)) ||
        archText.includes(alias) ||
        selectionText.includes(alias)
    );
  }

  function projectMatchesTechLabel(project, techLabel) {
    if (!techLabel || techLabel === "All") return true;
    const configured = getConfiguredSkills().find(
      (s) => s.displayName.toLowerCase() === techLabel.toLowerCase() || s.key.toLowerCase() === techLabel.toLowerCase()
    );
    if (configured) {
      return projectUsesTech(project, configured);
    }
    const lower = techLabel.toLowerCase();
    return (project.technologies || []).some((t) => t.toLowerCase() === lower || t.toLowerCase().includes(lower));
  }

  /* ========================================================================
     1 & 2. Technology Explorer & Technology Details
     ======================================================================== */

  function renderTechExplorer() {
    const tabsMount = document.getElementById("exp-tech-tabs");
    const gridMount = document.getElementById("exp-tech-grid");
    const detailsMount = document.getElementById("exp-tech-details");
    if (!tabsMount || !gridMount || !detailsMount) return;

    const skills = getConfiguredSkills();
    const projects = getProjects();
    const categories = ["All", "Frontend", "Backend", "Database", "Tools"].filter(
      (cat) => cat === "All" || skills.some((s) => s.category === cat)
    );

    if (!categories.includes(state.activeTechCategory)) {
      state.activeTechCategory = "All";
    }

    tabsMount.setAttribute("role", "tablist");
    tabsMount.setAttribute("aria-label", "Filter technologies by domain");
    tabsMount.innerHTML = categories
      .map((cat) => {
        const active = state.activeTechCategory === cat;
        return `
          <button
            type="button"
            role="tab"
            aria-selected="${active ? "true" : "false"}"
            class="skill-tab-btn ${active ? "is-active" : ""}"
            data-exp-tech-cat="${escHtml(cat)}"
          >
            ${escHtml(cat === "All" ? "All Stack" : cat)}
          </button>
        `;
      })
      .join("");

    tabsMount.querySelectorAll("[data-exp-tech-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeTechCategory = btn.getAttribute("data-exp-tech-cat") || "All";
        renderTechExplorer();
      });
    });

    const visibleSkills =
      state.activeTechCategory === "All"
        ? skills
        : skills.filter((s) => s.category === state.activeTechCategory);

    if (visibleSkills.length === 0) {
      gridMount.innerHTML = `<div class="card p-6 text-sm text-[var(--muted)] col-span-full">No technologies configured in this category.</div>`;
      detailsMount.innerHTML = "";
      return;
    }

    if (!state.selectedTechKey || !visibleSkills.some((s) => s.key === state.selectedTechKey)) {
      state.selectedTechKey = visibleSkills[0].key;
    }

    gridMount.innerHTML = visibleSkills
      .map((tech) => {
        const isSelected = tech.key === state.selectedTechKey;
        const matchCount = projects.filter((p) => projectUsesTech(p, tech)).length;
        return `
          <button
            type="button"
            class="exp-tech-card ${isSelected ? "is-selected" : ""}"
            data-exp-select-tech="${escHtml(tech.key)}"
            aria-pressed="${isSelected ? "true" : "false"}"
          >
            <div class="flex items-start justify-between gap-2 w-full">
              <div class="w-9 h-9 rounded-lg border border-[var(--border-strong)] bg-[var(--background)] flex items-center justify-center text-indigo-400 shrink-0">
                <i data-lucide="${escHtml(tech.icon)}" class="w-4 h-4" aria-hidden="true"></i>
              </div>
              <span class="text-[11px] font-mono-tech text-[var(--muted)]">${escHtml(tech.category)}</span>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-bold text-[var(--text)]">${escHtml(tech.displayName)}</p>
              <p class="text-xs text-[var(--muted)] tabular-nums">${escHtml(tech.level)} · ${matchCount} ${matchCount === 1 ? "project" : "projects"}</p>
            </div>
          </button>
        `;
      })
      .join("");

    gridMount.querySelectorAll("[data-exp-select-tech]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedTechKey = btn.getAttribute("data-exp-select-tech") || "";
        renderTechExplorer();
      });
    });

    const selectedTech = visibleSkills.find((s) => s.key === state.selectedTechKey) || visibleSkills[0];
    renderTechDetailsPanel(selectedTech, projects);
    refreshIcons();
  }

  function renderTechDetailsPanel(tech, projects) {
    const panel = document.getElementById("exp-tech-details");
    if (!panel || !tech) return;

    const relatedProjects = projects.filter((p) => projectUsesTech(p, tech));
    const projectRationales = relatedProjects
      .map((p) => {
        const hit = Array.isArray(p.technologySelection)
          ? p.technologySelection.find((ts) =>
              tech.aliases.some((al) => ts.name.toLowerCase().includes(al))
            )
          : null;
        return hit ? `${p.title}: ${hit.rationale}` : null;
      })
      .filter(Boolean);

    const validServices = (tech.services || []).filter((s) => servicesCatalog.includes(s));

    panel.innerHTML = `
      <div class="glass-card p-6 sm:p-7 space-y-5 exp-panel-animate">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl border border-cyan-500/35 bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
              <i data-lucide="${escHtml(tech.icon)}" class="w-6 h-6" aria-hidden="true"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs font-mono-tech text-[var(--muted)]">
                ${escHtml(tech.category)} · <span class="text-cyan-400 font-semibold">${escHtml(tech.level)}</span>
              </p>
              <h3 class="text-xl sm:text-2xl font-extrabold text-[var(--text)]">${escHtml(tech.displayName)}</h3>
            </div>
          </div>

          <button
            type="button"
            id="exp-apply-tech-filter-btn"
            class="primary-button text-xs sm:text-sm py-2.5 px-4 shrink-0"
          >
            <i data-lucide="filter" class="w-4 h-4" aria-hidden="true"></i>
            <span>Filter Projects by ${escHtml(tech.displayName)}</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-6 space-y-4">
            <div class="space-y-1.5">
              <h4 class="text-sm font-bold text-[var(--text)]">Technical Overview</h4>
              <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(tech.summary)}</p>
            </div>

            <div class="space-y-1.5">
              <h4 class="text-sm font-bold text-[var(--text)]">Usage &amp; Learning Context</h4>
              <p class="text-sm text-[var(--muted)] leading-relaxed">${escHtml(tech.learningNote)}</p>
              ${
                projectRationales.length > 0
                  ? `<ul class="space-y-1.5 text-xs sm:text-sm text-[var(--text-secondary)] list-disc pl-5 pt-1">
                      ${projectRationales.map((r) => `<li>${escHtml(r)}</li>`).join("")}
                    </ul>`
                  : ""
              }
            </div>

            <div class="space-y-2 pt-2 border-t border-[var(--border)]">
              <div class="flex items-center justify-between gap-2">
                <h4 class="text-sm font-bold text-[var(--text)]">Related Services</h4>
                <a href="services.html" class="text-xs font-semibold text-indigo-400 hover:underline">All Services →</a>
              </div>
              <p class="text-sm text-[var(--muted)]">${escHtml(validServices.join(" · "))}</p>
            </div>
          </div>

          <div class="lg:col-span-6 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <h4 class="text-sm font-bold text-[var(--text)]">Related Portfolio Projects (${relatedProjects.length})</h4>
              <span class="text-xs font-mono-tech text-[var(--muted)]">Live Stack Match</span>
            </div>

            ${
              relatedProjects.length > 0
                ? `<div class="space-y-2.5">
                    ${relatedProjects
                      .map((proj) => {
                        const isCompared = state.compareIds.includes(proj.id);
                        return `
                          <div class="card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div class="min-w-0 space-y-0.5">
                              <a href="project-details.html?id=${encodeURIComponent(proj.id)}" class="text-sm font-bold text-[var(--text)] hover:text-cyan-400 transition-colors">
                                ${escHtml(proj.title)}
                              </a>
                              <p class="text-xs text-[var(--muted)]">${escHtml(proj.category)} · ${escHtml(proj.projectType || proj.category)} · ${escHtml(proj.status)}</p>
                            </div>
                            <div class="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                class="exp-compare-btn ${isCompared ? "is-selected" : ""}"
                                data-exp-compare-toggle="${escHtml(proj.id)}"
                                aria-pressed="${isCompared ? "true" : "false"}"
                              >
                                <i data-lucide="${isCompared ? "check" : "git-compare"}" class="w-3.5 h-3.5" aria-hidden="true"></i>
                                <span>${isCompared ? "In Compare" : "Compare"}</span>
                              </button>
                              <a href="project-details.html?id=${encodeURIComponent(proj.id)}" class="outline-button text-xs py-1.5 px-3 min-h-[38px]">
                                <span>Case Study</span>
                              </a>
                            </div>
                          </div>
                        `;
                      })
                      .join("")}
                  </div>`
                : `<div class="card p-5 text-sm text-[var(--muted)]">
                    Used as part of core engineering workflow &amp; environment tooling across builds, though not listed as a primary card badge on a standalone case study.
                  </div>`
            }
          </div>
        </div>
      </div>
    `;

    const applyBtn = document.getElementById("exp-apply-tech-filter-btn");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        state.filterTech = tech.displayName;
        syncFilterControlsUi();
        renderFilteredProjects();
        const filterAnchor = document.getElementById("exp-projects-filter-section");
        if (filterAnchor && typeof filterAnchor.scrollIntoView === "function") {
          filterAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    panel.querySelectorAll("[data-exp-compare-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleCompareProject(btn.getAttribute("data-exp-compare-toggle"));
      });
    });
  }

  /* ========================================================================
     3. Multi-Faceted Project Filtering + Search + Active Filter Chips
     ======================================================================== */

  function populateFilterSelectOptions() {
    const projects = getProjects();
    const techSel = document.getElementById("exp-filter-tech");
    const typeSel = document.getElementById("exp-filter-type");
    const catSel = document.getElementById("exp-filter-category");
    const statusSel = document.getElementById("exp-filter-status");
    if (!techSel || !typeSel || !catSel || !statusSel) return;

    const configuredSkills = getConfiguredSkills();
    const canonicalTechLabel = (rawTech) => {
      const lower = String(rawTech || "").trim().toLowerCase();
      const hit = configuredSkills.find(
        (s) =>
          s.key.toLowerCase() === lower ||
          s.displayName.toLowerCase() === lower ||
          (Array.isArray(s.aliases) && s.aliases.some((al) => al === lower))
      );
      return hit ? hit.displayName : String(rawTech || "").trim();
    };

    const techSet = new Set();
    configuredSkills.forEach((s) => techSet.add(s.displayName));
    projects.forEach((p) =>
      (p.technologies || []).forEach((t) => {
        const label = canonicalTechLabel(t);
        if (label) techSet.add(label);
      })
    );

    const types = Array.from(new Set(projects.map((p) => p.projectType).filter(Boolean)));
    const cats = Array.from(new Set(projects.flatMap((p) => [p.category, ...(p.filterCategories || [])]).filter(Boolean)));
    const statuses = Array.from(new Set(projects.map((p) => p.status).filter(Boolean)));

    techSel.innerHTML = `<option value="All">All Technologies</option>` + Array.from(techSet).map((t) => `<option value="${escHtml(t)}">${escHtml(t)}</option>`).join("");
    typeSel.innerHTML = `<option value="All">All Project Types</option>` + types.map((t) => `<option value="${escHtml(t)}">${escHtml(t)}</option>`).join("");
    catSel.innerHTML = `<option value="All">All Categories</option>` + cats.map((c) => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join("");
    statusSel.innerHTML = `<option value="All">All Statuses</option>` + statuses.map((s) => `<option value="${escHtml(s)}">${escHtml(s)}</option>`).join("");
  }

  function syncFilterControlsUi() {
    const searchInput = document.getElementById("exp-search-input");
    const searchClear = document.getElementById("exp-search-clear");
    const techSel = document.getElementById("exp-filter-tech");
    const typeSel = document.getElementById("exp-filter-type");
    const catSel = document.getElementById("exp-filter-category");
    const statusSel = document.getElementById("exp-filter-status");
    const featBtn = document.getElementById("exp-filter-featured");

    if (searchInput && searchInput.value !== state.searchQuery) searchInput.value = state.searchQuery;
    if (searchClear) searchClear.classList.toggle("hidden", state.searchQuery.trim() === "");
    if (techSel) techSel.value = state.filterTech;
    if (typeSel) typeSel.value = state.filterType;
    if (catSel) catSel.value = state.filterCategory;
    if (statusSel) statusSel.value = state.filterStatus;
    if (featBtn) {
      featBtn.classList.toggle("is-active", state.featuredOnly);
      featBtn.setAttribute("aria-pressed", state.featuredOnly ? "true" : "false");
    }
  }

  function getFilteredProjects() {
    const projects = getProjects();
    const q = state.searchQuery.trim().toLowerCase();

    return projects.filter((p) => {
      if (state.featuredOnly && !p.featured) return false;
      if (state.filterCategory !== "All") {
        const cats = new Set([p.category, ...(p.filterCategories || [])]);
        if (!cats.has(state.filterCategory)) return false;
      }
      if (state.filterType !== "All" && p.projectType !== state.filterType) return false;
      if (state.filterStatus !== "All" && p.status !== state.filterStatus) return false;
      if (!projectMatchesTechLabel(p, state.filterTech)) return false;

      if (q) {
        const hay = [
          p.title,
          p.category,
          p.projectType,
          p.developmentRole,
          p.status,
          p.description,
          ...(p.technologies || []),
          ...(p.features || [])
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function clearAllFilters() {
    state.searchQuery = "";
    state.filterTech = "All";
    state.filterType = "All";
    state.filterCategory = "All";
    state.filterStatus = "All";
    state.featuredOnly = false;
    syncFilterControlsUi();
    renderFilteredProjects();
  }

  function renderActiveFilterChips() {
    const mount = document.getElementById("exp-active-filters");
    if (!mount) return;

    const chips = [];
    if (state.searchQuery.trim()) chips.push({ key: "search", label: `Search: "${state.searchQuery.trim()}"` });
    if (state.filterTech !== "All") chips.push({ key: "tech", label: `Tech: ${state.filterTech}` });
    if (state.filterType !== "All") chips.push({ key: "type", label: `Type: ${state.filterType}` });
    if (state.filterCategory !== "All") chips.push({ key: "category", label: `Category: ${state.filterCategory}` });
    if (state.filterStatus !== "All") chips.push({ key: "status", label: `Status: ${state.filterStatus}` });
    if (state.featuredOnly) chips.push({ key: "featured", label: "Featured Only" });

    if (chips.length === 0) {
      mount.innerHTML = "";
      mount.classList.add("hidden");
      return;
    }

    mount.classList.remove("hidden");
    mount.innerHTML =
      chips
        .map(
          (ch) => `
          <button type="button" class="exp-filter-chip" data-exp-remove-filter="${escHtml(ch.key)}" aria-label="Remove filter ${escHtml(ch.label)}">
            <span>${escHtml(ch.label)}</span>
            <i data-lucide="x" class="w-3.5 h-3.5" aria-hidden="true"></i>
          </button>
        `
        )
        .join("") +
      `<button type="button" id="exp-chips-clear-all" class="text-xs font-semibold text-indigo-400 hover:underline bg-transparent border-0 p-1 cursor-pointer">Clear All Filters</button>`;

    mount.querySelectorAll("[data-exp-remove-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-exp-remove-filter");
        if (key === "search") state.searchQuery = "";
        else if (key === "tech") state.filterTech = "All";
        else if (key === "type") state.filterType = "All";
        else if (key === "category") state.filterCategory = "All";
        else if (key === "status") state.filterStatus = "All";
        else if (key === "featured") state.featuredOnly = false;
        syncFilterControlsUi();
        renderFilteredProjects();
      });
    });

    const clearBtn = document.getElementById("exp-chips-clear-all");
    if (clearBtn) {
      clearBtn.addEventListener("click", clearAllFilters);
    }
  }

  function renderFilteredProjects() {
    const grid = document.getElementById("exp-projects-grid");
    const countEl = document.getElementById("exp-results-count");
    if (!grid) return;

    const allProjects = getProjects();
    const filtered = getFilteredProjects();
    renderActiveFilterChips();

    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${allProjects.length} projects`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="glass-card p-8 sm:p-10 text-center space-y-4 col-span-full">
          <i data-lucide="search-x" class="w-8 h-8 text-indigo-400 mx-auto" aria-hidden="true"></i>
          <h3 class="text-lg font-bold text-[var(--text)]">No matching projects found</h3>
          <p class="text-sm text-[var(--muted)] max-w-md mx-auto">
            Try removing one of the active filters or clearing your search query to inspect all 6 configured portfolio projects.
          </p>
          <button type="button" id="exp-empty-reset-btn" class="secondary-button mx-auto">
            Reset All Filters
          </button>
        </div>
      `;
      const resetBtn = document.getElementById("exp-empty-reset-btn");
      if (resetBtn) {
        resetBtn.addEventListener("click", clearAllFilters);
      }
      refreshIcons();
      return;
    }

    grid.innerHTML = filtered
      .map((project) => {
        const isCompared = state.compareIds.includes(project.id);
        return `
          <article class="glass-card project-card flex flex-col justify-between overflow-hidden">
            <div>
              <div class="project-media-box">
                <img
                  src="${escHtml(project.image)}"
                  alt="${escHtml(project.title)} preview"
                  loading="lazy"
                  onerror="this.src='assets/images/profile-placeholder.svg'"
                >
                <div class="project-media-gradient"></div>
                <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                  <span class="font-semibold">${escHtml(project.category)} · ${escHtml(project.status)}</span>
                  <span class="font-mono-tech tabular-nums">${escHtml(project.year)}</span>
                </div>
              </div>

              <div class="p-5 space-y-3">
                <div class="space-y-1">
                  <p class="text-xs font-mono-tech text-cyan-400">${escHtml(project.projectType || project.category)}${project.featured ? " · Featured" : ""}</p>
                  <h3 class="text-lg font-bold text-[var(--text)]">${escHtml(project.title)}</h3>
                  <p class="text-xs sm:text-sm text-[var(--muted)] line-clamp-2">${escHtml(project.description)}</p>
                </div>

                <p class="text-xs text-[var(--text-secondary)]">
                  ${escHtml((project.technologies || []).join(" · "))}
                </p>
              </div>
            </div>

            <div class="px-5 pb-5 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                class="exp-compare-btn ${isCompared ? "is-selected" : ""}"
                data-exp-compare-toggle="${escHtml(project.id)}"
                aria-pressed="${isCompared ? "true" : "false"}"
              >
                <i data-lucide="${isCompared ? "check" : "git-compare"}" class="w-3.5 h-3.5" aria-hidden="true"></i>
                <span>${isCompared ? "Selected" : "Add to Compare"}</span>
              </button>

              <a href="project-details.html?id=${encodeURIComponent(project.id)}" class="outline-button text-xs py-2 px-3 min-h-[38px]">
                <span>Case Study</span>
                <i data-lucide="arrow-up-right" class="w-3.5 h-3.5" aria-hidden="true"></i>
              </a>
            </div>
          </article>
        `;
      })
      .join("");

    grid.querySelectorAll("[data-exp-compare-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleCompareProject(btn.getAttribute("data-exp-compare-toggle"));
      });
    });

    refreshIcons();
  }

  /* ========================================================================
     4, 5 & 6. Project Comparison Matrix (Shared / Unique Tech, Features & Responsive Views)
     ======================================================================== */

  function toggleCompareProject(projectId) {
    if (!projectId) return;
    const existsIdx = state.compareIds.indexOf(projectId);
    if (existsIdx >= 0) {
      state.compareIds.splice(existsIdx, 1);
    } else {
      if (state.compareIds.length >= MAX_COMPARE) {
        if (typeof window.showToast === "function") {
          window.showToast(`You can compare up to ${MAX_COMPARE} projects at a time. Remove one to add another.`, "warning");
        }
        return;
      }
      state.compareIds.push(projectId);
    }

    renderCompareTray();
    renderComparisonMatrix();
    renderFilteredProjects();
    // Keep tech details comparison buttons synced
    const techSkills = getConfiguredSkills();
    const activeTech = techSkills.find((s) => s.key === state.selectedTechKey);
    if (activeTech) renderTechDetailsPanel(activeTech, getProjects());
    refreshIcons();
  }

  function clearCompareSelection() {
    state.compareIds = [];
    renderCompareTray();
    renderComparisonMatrix();
    renderFilteredProjects();
    const techSkills = getConfiguredSkills();
    const activeTech = techSkills.find((s) => s.key === state.selectedTechKey);
    if (activeTech) renderTechDetailsPanel(activeTech, getProjects());
    refreshIcons();
  }

  function selectComparePreset(ids) {
    const validIds = getProjects().map((p) => p.id);
    state.compareIds = ids.filter((id) => validIds.includes(id)).slice(0, MAX_COMPARE);
    renderCompareTray();
    renderComparisonMatrix();
    renderFilteredProjects();
    const techSkills = getConfiguredSkills();
    const activeTech = techSkills.find((s) => s.key === state.selectedTechKey);
    if (activeTech) renderTechDetailsPanel(activeTech, getProjects());
    refreshIcons();
  }

  function analyzeComparison(selectedProjects) {
    if (selectedProjects.length < 2) {
      return { sharedTechs: [], uniqueByProject: {}, sharedThemes: [], differences: [] };
    }

    const techCounts = new Map();
    selectedProjects.forEach((proj) => {
      new Set(proj.technologies || []).forEach((t) => {
        techCounts.set(t, (techCounts.get(t) || 0) + 1);
      });
    });

    const sharedTechs = [];
    techCounts.forEach((count, tech) => {
      if (count === selectedProjects.length) sharedTechs.push(tech);
    });

    const uniqueByProject = {};
    selectedProjects.forEach((proj) => {
      uniqueByProject[proj.id] = (proj.technologies || []).filter((t) => techCounts.get(t) === 1);
    });

    // Derive shared architectural feature themes dynamically from actual features/architecture data
    const capabilityDetectors = [
      { label: "Responsive Mobile-to-Desktop UI", pattern: /responsive|mobile|tablet|320px|breakpoints|card|grid/i },
      { label: "Search, Filtering & Instant Discovery", pattern: /search|filter|preset|discovery/i },
      { label: "Role-Based Access Control (RBAC / JWT)", pattern: /role|rbac|jwt|permission|auth|tenant|guard/i },
      { label: "REST API Backend Architecture", pattern: /rest|api|express|endpoint|node\.js/i },
      { label: "Database Indexing & Schema Validation", pattern: /mongodb|mongoose|postgresql|index|schema|bucket|ledger/i },
      { label: "Real-Time Analytics & Trend Visualization", pattern: /latency|telemetry|analytics|revenue|gpa|trend|aov/i }
    ];

    const sharedThemes = capabilityDetectors
      .filter((det) =>
        selectedProjects.every((proj) => {
          const hay = [
            proj.description,
            proj.architecture,
            ...(proj.features || []),
            ...(proj.technologies || []),
            JSON.stringify(proj.systemArchitecture || {})
          ].join(" ");
          return det.pattern.test(hay);
        })
      )
      .map((d) => d.label);

    const differences = [];
    const categories = new Set(selectedProjects.map((p) => p.category));
    if (categories.size > 1) {
      differences.push(`Categories span ${Array.from(categories).join(" vs ")}`);
    }
    const statuses = new Set(selectedProjects.map((p) => p.status));
    if (statuses.size > 1) {
      differences.push(`Lifecycle states vary (${selectedProjects.map((p) => `${p.title}: ${p.status}`).join(" · ")})`);
    }
    const dbNotes = selectedProjects.map((p) => {
      const dbs = (p.technologies || []).filter((t) => /mongo|mongoose|postgre/i.test(t));
      return `${p.title}: ${dbs.length > 0 ? dbs.join(" + ") : "Browser / Static JSON"}`;
    });
    differences.push(`Persistence approach (${dbNotes.join(" · ")})`);

    return { sharedTechs, uniqueByProject, sharedThemes, differences };
  }

  function renderCompareTray() {
    const tray = document.getElementById("exp-compare-tray");
    if (!tray) return;

    const projects = getProjects();
    const selected = state.compareIds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);

    const chipsHtml = selected
      .map(
        (proj) => `
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--background)] text-xs font-semibold text-[var(--text)]">
          <span>${escHtml(proj.title)}</span>
          <button
            type="button"
            class="text-[var(--muted)] hover:text-rose-400 cursor-pointer bg-transparent border-0 p-0 inline-flex items-center"
            data-exp-remove-compare="${escHtml(proj.id)}"
            aria-label="Remove ${escHtml(proj.title)} from comparison"
          >
            <i data-lucide="x" class="w-3.5 h-3.5" aria-hidden="true"></i>
          </button>
        </div>
      `
      )
      .join("");

    tray.innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <i data-lucide="git-compare" class="w-4 h-4 text-cyan-400" aria-hidden="true"></i>
            <span class="text-sm font-bold text-[var(--text)]">Comparison Selection</span>
            <span class="text-xs font-mono-tech tabular-nums text-indigo-400">${selected.length} / ${MAX_COMPARE} selected</span>
          </div>
          <p class="text-xs text-[var(--muted)]">
            Select up to 3 projects from above (or pick a quick preset) to inspect shared technologies, unique stacks, and feature differences.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          ${chipsHtml}
          ${
            selected.length > 0
              ? `<button type="button" id="exp-clear-compare-btn" class="outline-button text-xs py-1.5 px-3 min-h-[36px]">Clear Selection</button>`
              : `<button type="button" id="exp-preset-two-btn" class="outline-button text-xs py-1.5 px-3 min-h-[36px]">Compare AstraPulse vs Nexora</button>
                 <button type="button" id="exp-preset-three-btn" class="primary-button text-xs py-1.5 px-3 min-h-[36px]">Compare 3 Featured</button>`
          }
        </div>
      </div>
    `;

    tray.querySelectorAll("[data-exp-remove-compare]").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleCompareProject(btn.getAttribute("data-exp-remove-compare"));
      });
    });

    const clearBtn = document.getElementById("exp-clear-compare-btn");
    if (clearBtn) clearBtn.addEventListener("click", clearCompareSelection);

    const p2Btn = document.getElementById("exp-preset-two-btn");
    if (p2Btn) p2Btn.addEventListener("click", () => selectComparePreset(["astrapulse", "nexora"]));

    const p3Btn = document.getElementById("exp-preset-three-btn");
    if (p3Btn) p3Btn.addEventListener("click", () => selectComparePreset(["astrapulse", "nexora", "slideverse"]));
  }

  function formatLinkCell(url, fallbackText, label) {
    if (url && String(url).trim() !== "") {
      const isExternal = /^https?:\/\//i.test(url);
      const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${escHtml(url)}"${attrs} class="text-xs font-semibold text-cyan-400 hover:underline inline-flex items-center gap-1">${escHtml(label)} <i data-lucide="external-link" class="w-3 h-3" aria-hidden="true"></i></a>`;
    }
    return `<span class="text-xs text-[var(--muted)]">${escHtml(fallbackText)}</span>`;
  }

  function renderComparisonMatrix() {
    const mount = document.getElementById("exp-comparison-matrix");
    if (!mount) return;

    const projects = getProjects();
    const selected = state.compareIds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);

    if (selected.length === 0) {
      mount.innerHTML = `
        <div class="glass-card p-8 sm:p-10 text-center space-y-4">
          <i data-lucide="git-compare" class="w-9 h-9 text-indigo-400 mx-auto" aria-hidden="true"></i>
          <h3 class="text-lg font-bold text-[var(--text)]">Select Projects to Compare</h3>
          <p class="text-sm text-[var(--muted)] max-w-lg mx-auto">
            Click <strong class="text-[var(--text-secondary)]">Add to Compare</strong> on up to 3 project cards above, or load a sample comparison right away.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button type="button" id="exp-matrix-preset-two" class="secondary-button text-xs sm:text-sm">Compare AstraPulse &amp; Nexora</button>
            <button type="button" id="exp-matrix-preset-three" class="primary-button text-xs sm:text-sm">Compare 3 Featured Projects</button>
          </div>
        </div>
      `;
      const b2 = document.getElementById("exp-matrix-preset-two");
      const b3 = document.getElementById("exp-matrix-preset-three");
      if (b2) b2.addEventListener("click", () => selectComparePreset(["astrapulse", "nexora"]));
      if (b3) b3.addEventListener("click", () => selectComparePreset(["astrapulse", "nexora", "slideverse"]));
      return;
    }

    const analysis = analyzeComparison(selected);
    const sharedSet = new Set(analysis.sharedTechs);

    const highlightsHtml =
      selected.length >= 2
        ? `
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div class="card p-5 space-y-2">
            <p class="text-xs font-semibold text-cyan-400">Shared Technologies</p>
            <p class="text-sm font-medium text-[var(--text)]">
              ${analysis.sharedTechs.length > 0 ? escHtml(analysis.sharedTechs.join(" · ")) : "No identical stack overlap across all selected projects"}
            </p>
          </div>

          <div class="card p-5 space-y-2">
            <p class="text-xs font-semibold text-indigo-400">Unique Technologies</p>
            <ul class="space-y-1 text-xs text-[var(--muted)] list-none p-0 m-0">
              ${selected
                .map((p) => {
                  const uniq = analysis.uniqueByProject[p.id] || [];
                  return `<li><strong class="text-[var(--text)]">${escHtml(p.title)}:</strong> ${escHtml(uniq.length > 0 ? uniq.join(", ") : "All shared")}</li>`;
                })
                .join("")}
            </ul>
          </div>

          <div class="card p-5 space-y-2">
            <p class="text-xs font-semibold text-violet-400">Shared Capabilities</p>
            <p class="text-xs sm:text-sm text-[var(--text-secondary)]">
              ${analysis.sharedThemes.length > 0 ? escHtml(analysis.sharedThemes.join(" · ")) : "Focused single-domain implementations"}
            </p>
          </div>

          <div class="card p-5 space-y-2">
            <p class="text-xs font-semibold text-amber-400">Project Differences</p>
            <ul class="space-y-1 text-xs text-[var(--muted)] list-none p-0 m-0">
              ${analysis.differences.map((d) => `<li>· ${escHtml(d)}</li>`).join("")}
            </ul>
          </div>
        </div>
      `
        : `<div class="card p-4 text-sm text-[var(--muted)]">
            <strong class="text-[var(--text)]">1 project selected:</strong> Add 1 or 2 more projects above to highlight shared technologies, unique stacks, and differences.
          </div>`;

    const desktopHeadCols = selected
      .map(
        (proj) => `
        <th>
          <div class="flex items-start justify-between gap-2">
            <div>
              <a href="project-details.html?id=${encodeURIComponent(proj.id)}" class="text-base font-bold text-[var(--text)] hover:text-cyan-400">
                ${escHtml(proj.title)}
              </a>
              <p class="text-xs font-mono-tech text-[var(--muted)] mt-0.5">${escHtml(proj.year)}${proj.featured ? " · Featured" : ""}</p>
            </div>
            <button
              type="button"
              class="icon-button w-8 h-8 min-w-[32px] min-h-[32px]"
              data-exp-remove-compare="${escHtml(proj.id)}"
              aria-label="Remove ${escHtml(proj.title)} from comparison"
              title="Remove"
            >
              <i data-lucide="x" class="w-3.5 h-3.5" aria-hidden="true"></i>
            </button>
          </div>
        </th>
      `
      )
      .join("");

    const desktopTableRows = `
      <tr>
        <th scope="row">Category</th>
        ${selected.map((p) => `<td>${escHtml(p.category)}</td>`).join("")}
      </tr>
      <tr>
        <th scope="row">Project Type</th>
        ${selected.map((p) => `<td>${escHtml(p.projectType || p.category)}</td>`).join("")}
      </tr>
      <tr>
        <th scope="row">Technologies</th>
        ${selected
          .map((p) => {
            const items = (p.technologies || []).map((t) => {
              const cls = sharedSet.has(t) ? "exp-tech-shared" : "exp-tech-unique";
              const tag = sharedSet.has(t) ? " (shared)" : selected.length >= 2 ? " (unique)" : "";
              return `<span class="${cls}">${escHtml(t)}${tag ? `<span class="text-[11px] text-[var(--muted)] font-normal">${tag}</span>` : ""}</span>`;
            });
            return `<td><div class="flex flex-col gap-1">${items.join("")}</div></td>`;
          })
          .join("")}
      </tr>
      <tr>
        <th scope="row">Main Features</th>
        ${selected
          .map(
            (p) => `
          <td>
            <ul class="space-y-1.5 list-disc pl-4 m-0 text-xs sm:text-[13px] text-[var(--text-secondary)]">
              ${(p.features || []).map((f) => `<li>${escHtml(f)}</li>`).join("")}
            </ul>
          </td>
        `
          )
          .join("")}
      </tr>
      <tr>
        <th scope="row">Development Role</th>
        ${selected.map((p) => `<td>${escHtml(p.developmentRole || "Full-Stack Developer")}</td>`).join("")}
      </tr>
      <tr>
        <th scope="row">Project Status</th>
        ${selected
          .map(
            (p) => `<td>${escHtml(p.status)}${p.duration ? ` · <span class="text-[var(--muted)]">${escHtml(p.duration)}</span>` : ""}</td>`
          )
          .join("")}
      </tr>
      <tr>
        <th scope="row">Live Demo</th>
        ${selected
          .map((p) => `<td>${formatLinkCell(p.liveUrl, "Not configured in projects.js", "Open Live Demo")}</td>`)
          .join("")}
      </tr>
      <tr>
        <th scope="row">GitHub Repository</th>
        ${selected
          .map((p) => `<td>${formatLinkCell(p.githubUrl, "Not configured — see GitHub Explorer", "Open Repository")}</td>`)
          .join("")}
      </tr>
    `;

    // Stacked comparison cards for mobile/tablet (< 1024px) — zero horizontal scrolling
    const mobileCardsHtml = selected
      .map((p) => {
        const uniq = analysis.uniqueByProject[p.id] || [];
        return `
          <article class="glass-card p-5 space-y-4">
            <div class="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div class="space-y-1">
                <p class="text-xs font-mono-tech text-cyan-400">${escHtml(p.category)} · ${escHtml(p.year)}</p>
                <h3 class="text-lg font-bold text-[var(--text)]">${escHtml(p.title)}</h3>
                <p class="text-xs text-[var(--muted)]">${escHtml(p.projectType || p.category)}</p>
              </div>
              <button
                type="button"
                class="outline-button text-xs py-1.5 px-2.5 min-h-[38px]"
                data-exp-remove-compare="${escHtml(p.id)}"
                aria-label="Remove ${escHtml(p.title)} from comparison"
              >
                <i data-lucide="x" class="w-3.5 h-3.5" aria-hidden="true"></i>
                <span>Remove</span>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <p class="font-semibold text-[var(--text-secondary)]">Development Role</p>
                <p class="text-[var(--muted)]">${escHtml(p.developmentRole || "Full-Stack Developer")}</p>
              </div>
              <div>
                <p class="font-semibold text-[var(--text-secondary)]">Project Status</p>
                <p class="text-[var(--muted)]">${escHtml(p.status)}${p.duration ? ` · ${escHtml(p.duration)}` : ""}</p>
              </div>
            </div>

            <div class="space-y-1.5 text-xs sm:text-sm">
              <p class="font-semibold text-[var(--text-secondary)]">Technologies</p>
              <p class="text-[var(--muted)]">${escHtml((p.technologies || []).join(" · "))}</p>
              ${
                selected.length >= 2 && uniq.length > 0
                  ? `<p class="text-xs text-cyan-400">Unique here: ${escHtml(uniq.join(", "))}</p>`
                  : ""
              }
            </div>

            <div class="space-y-1.5 text-xs sm:text-sm">
              <p class="font-semibold text-[var(--text-secondary)]">Main Features</p>
              <ul class="space-y-1 list-disc pl-4 m-0 text-[var(--muted)]">
                ${(p.features || []).map((f) => `<li>${escHtml(f)}</li>`).join("")}
              </ul>
            </div>

            <div class="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-3">
                <span>Live Demo: ${formatLinkCell(p.liveUrl, "Not configured", "Open Demo")}</span>
                <span>GitHub: ${formatLinkCell(p.githubUrl, "Not configured", "Open Repo")}</span>
              </div>
              <a href="project-details.html?id=${encodeURIComponent(p.id)}" class="text-xs font-semibold text-indigo-400 hover:underline">
                Full Case Study →
              </a>
            </div>
          </article>
        `;
      })
      .join("");

    mount.innerHTML = `
      <div class="space-y-6 exp-panel-animate">
        ${highlightsHtml}

        <!-- Desktop Structured Table Comparison (>= 1024px) -->
        <div class="hidden lg:block exp-compare-table-wrap">
          <table class="exp-compare-table" aria-label="Side-by-side project comparison matrix">
            <thead>
              <tr>
                <th scope="col" class="w-[190px] text-xs font-mono-tech text-[var(--muted)]">Dimension</th>
                ${desktopHeadCols}
              </tr>
            </thead>
            <tbody>
              ${desktopTableRows}
            </tbody>
          </table>
        </div>

        <!-- Mobile & Tablet Stacked Comparison Cards (< 1024px) -->
        <div class="lg:hidden space-y-4" aria-label="Stacked mobile project comparison cards">
          ${mobileCardsHtml}
        </div>
      </div>
    `;

    mount.querySelectorAll("[data-exp-remove-compare]").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleCompareProject(btn.getAttribute("data-exp-remove-compare"));
      });
    });

    refreshIcons();
  }

  function bindFilterListeners() {
    const searchInput = document.getElementById("exp-search-input");
    const searchClear = document.getElementById("exp-search-clear");
    const techSel = document.getElementById("exp-filter-tech");
    const typeSel = document.getElementById("exp-filter-type");
    const catSel = document.getElementById("exp-filter-category");
    const statusSel = document.getElementById("exp-filter-status");
    const featBtn = document.getElementById("exp-filter-featured");
    const resetAllBtn = document.getElementById("exp-reset-all-btn");

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.searchQuery = searchInput.value;
        syncFilterControlsUi();
        renderFilteredProjects();
      });
    }

    if (searchClear) {
      searchClear.addEventListener("click", () => {
        state.searchQuery = "";
        syncFilterControlsUi();
        renderFilteredProjects();
        if (searchInput && typeof searchInput.focus === "function") searchInput.focus();
      });
    }

    if (techSel) {
      techSel.addEventListener("change", () => {
        state.filterTech = techSel.value || "All";
        renderFilteredProjects();
      });
    }

    if (typeSel) {
      typeSel.addEventListener("change", () => {
        state.filterType = typeSel.value || "All";
        renderFilteredProjects();
      });
    }

    if (catSel) {
      catSel.addEventListener("change", () => {
        state.filterCategory = catSel.value || "All";
        renderFilteredProjects();
      });
    }

    if (statusSel) {
      statusSel.addEventListener("change", () => {
        state.filterStatus = statusSel.value || "All";
        renderFilteredProjects();
      });
    }

    if (featBtn) {
      featBtn.addEventListener("click", () => {
        state.featuredOnly = !state.featuredOnly;
        syncFilterControlsUi();
        renderFilteredProjects();
      });
    }

    if (resetAllBtn) {
      resetAllBtn.addEventListener("click", clearAllFilters);
    }
  }

  function applyQueryPreset() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const techParam = (params.get("tech") || "").trim();
      const compareParam = (params.get("compare") || "").trim();
      if (techParam) {
        const match = getConfiguredSkills().find(
          (s) => s.key.toLowerCase() === techParam.toLowerCase() || s.displayName.toLowerCase() === techParam.toLowerCase()
        );
        if (match) {
          state.selectedTechKey = match.key;
          state.activeTechCategory = match.category;
          state.filterTech = match.displayName;
        }
      }
      if (compareParam) {
        const validIds = getProjects().map((p) => p.id);
        state.compareIds = compareParam
          .split(",")
          .map((s) => s.trim())
          .filter((id) => validIds.includes(id))
          .slice(0, MAX_COMPARE);
      }
    } catch (_err) {
      // Ignore query string errors
    }
  }

  function init() {
    const root = document.getElementById("explorer-root");
    if (!root) return;
    root.dataset.moduleReady = "true";

    applyQueryPreset();
    renderTechExplorer();
    populateFilterSelectOptions();
    syncFilterControlsUi();
    bindFilterListeners();
    renderCompareTray();
    renderFilteredProjects();
    renderComparisonMatrix();
    refreshIcons();
  }

  return {
    init,
    state,
    getConfiguredSkills,
    getProjects,
    getFilteredProjects,
    projectUsesTech,
    toggleCompareProject,
    clearCompareSelection,
    selectComparePreset,
    analyzeComparison,
    clearAllFilters,
    renderTechExplorer,
    renderFilteredProjects,
    renderComparisonMatrix
  };
})();

window.PortfolioExplorer = PortfolioExplorer;
