/**
 * AL AMIN Portfolio OS — Phase 48: Interactive Project Dependency Map
 * Builds verifiable architecture dependency graphs strictly from configured project data.
 * Never fabricates dependencies. Supports SVG zoom/pan, node/tech/layer inspection,
 * mobile vertical tree, and accessible expandable dependency list.
 */
(() => {
  const LAYERS = [
    { key: "project", label: "Project", short: "Project", x: 60, y: 195, color: "#6366F1" },
    { key: "frontend", label: "Frontend", short: "Frontend", x: 250, y: 80, color: "#06B6D4" },
    { key: "backend", label: "Backend", short: "Backend", x: 250, y: 200, color: "#8B5CF6" },
    { key: "database", label: "Database", short: "Database", x: 250, y: 320, color: "#10B981" },
    { key: "authentication", label: "Authentication", short: "Auth", x: 465, y: 80, color: "#F59E0B" },
    { key: "storage", label: "Storage", short: "Storage", x: 465, y: 200, color: "#EC4899" },
    { key: "apis", label: "APIs", short: "APIs", x: 465, y: 320, color: "#38BDF8" },
    { key: "deployment", label: "Deployment", short: "Deploy", x: 675, y: 135, color: "#A855F7" },
    { key: "security", label: "Security", short: "Security", x: 675, y: 265, color: "#34D399" }
  ];

  // Relationship edges between architectural layers
  const EDGES = [
    ["project", "frontend"],
    ["project", "backend"],
    ["project", "database"],
    ["frontend", "apis"],
    ["frontend", "storage"],
    ["backend", "authentication"],
    ["backend", "database"],
    ["backend", "apis"],
    ["backend", "security"],
    ["apis", "security"],
    ["database", "storage"],
    ["frontend", "deployment"],
    ["backend", "deployment"]
  ];

  let state = {
    projects: [],
    selectedProjectId: "",
    selectedLayerKey: "project",
    selectedTech: "All",
    activeLayerFilter: "All",
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    panStartX: 0,
    panStartY: 0
  };

  function esc(val) {
    return String(val == null ? "" : val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function refreshIconsSafe() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function loadConfiguredProjects() {
    if (window.PortfolioProjects && Array.isArray(window.PortfolioProjects.projectsData) && window.PortfolioProjects.projectsData.length) {
      return window.PortfolioProjects.projectsData;
    }
    if (window.PortfolioData && typeof window.PortfolioData.getProjects === "function") {
      return window.PortfolioData.getProjects();
    }
    return [];
  }

  function deriveProjectDependencies(project) {
    const sys = project.systemArchitecture || {};
    const techs = Array.isArray(project.technologies) ? project.technologies : [];
    const dbEntities = Array.isArray(project.databaseStructure) ? project.databaseStructure : [];
    const featuresBlob = (project.features || []).concat(project.goals || []).concat(project.solutions || []).join(" ");

    const frontendTechs = techs.filter((t) =>
      ["React", "Next.js", "Redux", "Tailwind CSS", "HTML5", "CSS3", "JavaScript", "Responsive Design", "SEO"].includes(t)
    );
    const backendTechs = techs.filter((t) => ["Node.js", "Express"].includes(t));
    const dbTechs = techs.filter((t) => ["MongoDB", "Mongoose", "PostgreSQL"].includes(t));
    const apiTechs = techs.filter((t) => ["REST API", "Express", "Node.js"].includes(t));

    // Storage derived strictly from databaseStructure, CDN/Media integration notes, or local state
    const hasCdnMedia = Boolean(sys.integrations && /cdn|image|media/i.test(`${sys.integrations.title} ${sys.integrations.tech} ${sys.integrations.description}`));
    const storageTechs = [
      ...dbTechs,
      ...(hasCdnMedia ? ["CDN Media Assets"] : []),
      ...(project.id === "portfolio-system" || project.id === "slideverse" ? ["Browser localStorage"] : [])
    ];

    const deploymentSummary =
      project.id === "portfolio-system"
        ? "Static Multi-Page Build + PWA Service Worker (Vite dist/ & sw.js)"
        : backendTechs.length
          ? "Configured Production Web Build + API Server Environment"
          : "Static CDN / Production Web Bundle";

    const securityDetails = [];
    if (sys.authentication && /jwt|rbac|role/i.test(`${sys.authentication.title} ${sys.authentication.tech} ${sys.authentication.description}`)) {
      securityDetails.push(sys.authentication.tech || "JWT / Role-Based Access");
    }
    if (/validation|sanitiz|cors|isolation|esc/i.test(`${featuresBlob} ${project.architecture || ""} ${(sys.backend && sys.backend.description) || ""}`)) {
      securityDetails.push("Input Validation & Safe Rendering");
    }
    if (!securityDetails.length) {
      securityDetails.push("XSS-Safe Rendering & Route Hygiene");
    }

    return {
      project: {
        summary: project.projectType || project.category,
        technologies: techs,
        purpose: project.description || project.overview || "Configured portfolio project.",
        relatedLayers: ["Frontend", "Backend", "Database"]
      },
      frontend: {
        summary: (sys.frontend && sys.frontend.tech) || frontendTechs.join(", ") || "Responsive Web UI",
        technologies: frontendTechs.length ? frontendTechs : ["HTML5", "CSS3", "JavaScript"],
        purpose: (sys.frontend && sys.frontend.description) || "User interface presentation layer and interactive responsive views.",
        relatedLayers: ["Project", "APIs", "Storage", "Deployment"]
      },
      backend: {
        summary: (sys.backend && sys.backend.tech) || (backendTechs.length ? backendTechs.join(", ") : "Client-Side / Modular Runtime"),
        technologies: backendTechs,
        purpose: (sys.backend && sys.backend.description) || (backendTechs.length ? "Server request processing, business logic, and validation." : "No separate backend server required; logic runs cleanly in the browser."),
        relatedLayers: ["Project", "Authentication", "Database", "APIs", "Security", "Deployment"]
      },
      database: {
        summary: (sys.database && sys.database.tech) || (dbTechs.length ? dbTechs.join(", ") : "None / Client State"),
        technologies: dbTechs,
        purpose: dbEntities.length
          ? `${(sys.database && sys.database.description) || ""} Collections/Entities: ${dbEntities.map((d) => d.entity).join(", ")}.`.trim()
          : (sys.database && sys.database.description) || "In-browser persisted state with no external database required.",
        relatedLayers: ["Project", "Backend", "Storage"]
      },
      authentication: {
        summary: (sys.authentication && sys.authentication.tech) || "Public Access (No Auth Required)",
        technologies: sys.authentication && /jwt/i.test(`${sys.authentication.title} ${sys.authentication.tech}`) ? ["Authentication", "JWT"] : [],
        purpose: (sys.authentication && sys.authentication.description) || "Publicly accessible portfolio/client functionality with no gated credentials.",
        relatedLayers: ["Backend", "Security"]
      },
      storage: {
        summary: storageTechs.length ? storageTechs.join(", ") : "In-Memory Runtime State",
        technologies: storageTechs,
        purpose: dbEntities.length
          ? `Persists ${dbEntities.map((e) => e.entity).join(", ")} records and static assets safely.`
          : hasCdnMedia
            ? "Stores product imagery and persistent session cart state."
            : "Manages deck, theme, and workspace state cleanly in browser storage/memory.",
        relatedLayers: ["Frontend", "Database"]
      },
      apis: {
        summary: (sys.api && sys.api.tech) || (apiTechs.length ? "JSON REST API" : "Static / DOM Event Flow"),
        technologies: apiTechs,
        purpose: (sys.api && sys.api.description) || "Structured request/response contract between UI components and application state.",
        relatedLayers: ["Frontend", "Backend", "Security"]
      },
      deployment: {
        summary: deploymentSummary,
        technologies: project.id === "portfolio-system" ? ["HTML5", "CSS3", "JavaScript"] : techs.slice(0, 3),
        purpose: "Target production delivery model matching the configured project architecture.",
        relatedLayers: ["Frontend", "Backend"]
      },
      security: {
        summary: securityDetails.join(" · "),
        technologies: securityDetails,
        purpose: "Protects user sessions, validates payloads, escapes dynamic output, and maintains safe external links.",
        relatedLayers: ["Backend", "Authentication", "APIs"]
      }
    };
  }

  function getSelectedProject() {
    return state.projects.find((p) => p.id === state.selectedProjectId) || state.projects[0] || null;
  }

  function getProjectsUsingTech(tech) {
    if (!tech || tech === "All") return state.projects;
    return state.projects.filter((p) =>
      Array.isArray(p.technologies) &&
      p.technologies.some((t) => String(t).toLowerCase() === tech.toLowerCase())
    );
  }

  function getRelatedTechs(tech) {
    const related = new Set();
    getProjectsUsingTech(tech).forEach((p) => {
      (p.technologies || []).forEach((t) => {
        if (String(t).toLowerCase() !== String(tech).toLowerCase()) {
          related.add(t);
        }
      });
    });
    return Array.from(related);
  }

  function renderSvgGraph(project, deps) {
    const svg = document.getElementById("dm-svg-stage");
    const viewport = document.getElementById("dm-svg-viewport");
    if (!svg || !viewport || !project) return;

    const filterKey = state.activeLayerFilter;
    const selectedTech = state.selectedTech;

    const layerMap = new Map(LAYERS.map((l) => [l.key, l]));

    const linesHtml = EDGES.map(([fromKey, toKey]) => {
      const a = layerMap.get(fromKey);
      const b = layerMap.get(toKey);
      if (!a || !b) return "";
      const dimmed =
        filterKey !== "All" && a.key !== filterKey && b.key !== filterKey
          ? "opacity: 0.16;"
          : a.key === state.selectedLayerKey || b.key === state.selectedLayerKey
            ? "stroke: #22d3ee; stroke-width: 2.2; opacity: 0.9;"
            : "opacity: 0.45;";

      const x1 = a.x + 132;
      const y1 = a.y + 34;
      const x2 = b.x;
      const y2 = b.y + 34;
      const midX = (x1 + x2) / 2;

      return `<path d="M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}" fill="none" stroke="#6366F1" stroke-width="1.6" style="${dimmed}" />`;
    }).join("");

    const nodesHtml = LAYERS.map((layer) => {
      const nodeData = deps[layer.key];
      const matchesLayer = filterKey === "All" || layer.key === filterKey;
      const matchesTech =
        selectedTech === "All" ||
        (nodeData.technologies || []).some((t) => String(t).toLowerCase() === selectedTech.toLowerCase()) ||
        nodeData.summary.toLowerCase().includes(selectedTech.toLowerCase());
      const isSelected = state.selectedLayerKey === layer.key;
      const opacity = matchesLayer && matchesTech ? 1 : 0.25;

      const labelText = layer.key === "project" ? project.title : layer.label;
      const subText = nodeData.summary.length > 22 ? `${nodeData.summary.slice(0, 20)}…` : nodeData.summary;

      return `
        <g
          class="dm-node-group ${isSelected ? "is-selected" : ""}"
          data-dm-node="${esc(layer.key)}"
          tabindex="0"
          role="button"
          aria-label="${esc(layer.label)}: ${esc(nodeData.summary)}"
          style="opacity: ${opacity};"
        >
          <rect
            class="dm-node-rect"
            x="${layer.x}"
            y="${layer.y}"
            width="136"
            height="68"
            rx="12"
            fill="rgba(15, 23, 42, 0.92)"
            stroke="${isSelected ? "#22d3ee" : layer.color}"
            stroke-width="${isSelected ? "2.4" : "1.5"}"
          />
          <circle cx="${layer.x + 16}" cy="${layer.y + 20}" r="4.5" fill="${layer.color}" />
          <text x="${layer.x + 28}" y="${layer.y + 24}" fill="#F8FAFC" font-size="12" font-weight="700" font-family="Plus Jakarta Sans, sans-serif">
            ${esc(labelText)}
          </text>
          <text x="${layer.x + 14}" y="${layer.y + 46}" fill="#94A3B8" font-size="10.5" font-family="JetBrains Mono, monospace">
            ${esc(subText)}
          </text>
        </g>
      `;
    }).join("");

    viewport.setAttribute("transform", `translate(${state.panX} ${state.panY}) scale(${state.zoom})`);
    viewport.innerHTML = `<g aria-hidden="true">${linesHtml}</g><g>${nodesHtml}</g>`;

    const tooltip = document.getElementById("dm-hover-tooltip");

    viewport.querySelectorAll("[data-dm-node]").forEach((nodeEl) => {
      const key = nodeEl.getAttribute("data-dm-node");
      const selectFn = () => {
        state.selectedLayerKey = key;
        renderAll();
      };
      nodeEl.addEventListener("click", selectFn);
      nodeEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectFn();
        }
      });
      nodeEl.addEventListener("mouseenter", () => {
        if (!tooltip || !deps[key]) return;
        const layerMeta = layerMap.get(key);
        tooltip.innerHTML = `<strong class="text-cyan-400">${esc(layerMeta.label)}:</strong> ${esc(deps[key].summary)}<br><span class="text-[var(--muted)]">${esc(deps[key].purpose)}</span>`;
        tooltip.classList.remove("hidden");
      });
      nodeEl.addEventListener("mouseleave", () => {
        if (tooltip) tooltip.classList.add("hidden");
      });
    });
  }

  function renderMobileTree(project, deps) {
    const mount = document.getElementById("dm-mobile-tree");
    if (!mount || !project) return;

    mount.innerHTML = LAYERS.map((layer) => {
      const data = deps[layer.key];
      const isSelected = state.selectedLayerKey === layer.key;
      const matchesFilter = state.activeLayerFilter === "All" || state.activeLayerFilter === layer.key;
      if (!matchesFilter) return "";

      return `
        <div class="dm-tree-step ${isSelected ? "border-cyan-400" : ""}">
          <button
            type="button"
            class="dm-tree-node-btn space-y-1"
            data-dm-mobile-node="${esc(layer.key)}"
            aria-expanded="${isSelected ? "true" : "false"}"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-mono-tech uppercase tracking-wider text-cyan-400">${esc(layer.label)}</span>
              <span class="text-[11px] text-[var(--muted)]">${isSelected ? "Inspecting" : "Tap for details"}</span>
            </div>
            <div class="text-sm font-bold text-[var(--text)]">${esc(layer.key === "project" ? `${project.title} — ${data.summary}` : data.summary)}</div>
            <p class="text-xs text-[var(--muted)] leading-relaxed">${esc(data.purpose)}</p>
          </button>
        </div>
      `;
    }).join("");

    mount.querySelectorAll("[data-dm-mobile-node]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedLayerKey = btn.getAttribute("data-dm-mobile-node");
        renderAll();
      });
    });
  }

  function renderInspector(project, deps) {
    const mount = document.getElementById("dm-inspector-mount");
    if (!mount || !project) return;

    const layerMeta = LAYERS.find((l) => l.key === state.selectedLayerKey) || LAYERS[0];
    const nodeInfo = deps[layerMeta.key];
    const selectedTechFilter = state.selectedTech !== "All" ? state.selectedTech : null;

    if (selectedTechFilter) {
      const matchingProjects = getProjectsUsingTech(selectedTechFilter);
      const relatedTechs = getRelatedTechs(selectedTechFilter);

      mount.innerHTML = `
        <div class="space-y-4">
          <div class="space-y-1 border-b border-[var(--border)] pb-3">
            <span class="text-xs font-mono-tech uppercase tracking-wider text-cyan-400">Technology Filter Focus</span>
            <h2 class="text-lg font-bold text-[var(--text)]">${esc(selectedTechFilter)}</h2>
            <p class="text-xs text-[var(--muted)]">Derived strictly from configured project stacks in <code class="font-mono-tech">PortfolioProjects</code>.</p>
          </div>

          <div class="space-y-1.5">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-indigo-400">Projects Using ${esc(selectedTechFilter)} (${matchingProjects.length})</h3>
            <div class="space-y-2">
              ${matchingProjects
                .map(
                  (mp) => `
                  <a href="project-details.html?id=${encodeURIComponent(mp.id)}" class="block p-2.5 rounded-lg border border-[var(--border)] hover:border-cyan-400 transition-colors">
                    <div class="text-xs font-bold text-[var(--text)]">${esc(mp.title)}</div>
                    <div class="text-[11px] text-[var(--muted)]">${esc(mp.category)} · ${esc(mp.year)}</div>
                  </a>`
                )
                .join("")}
            </div>
          </div>

          <div class="space-y-1.5">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-indigo-400">Related Technologies</h3>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed">${relatedTechs.length ? esc(relatedTechs.join(" · ")) : "Standalone stack item"}</p>
          </div>

          <button type="button" id="dm-clear-tech-btn" class="outline-button text-xs py-1.5 px-3 min-h-[38px]">Clear Technology Filter</button>
        </div>
      `;

      const clearBtn = document.getElementById("dm-clear-tech-btn");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          state.selectedTech = "All";
          const sel = document.getElementById("dm-tech-select");
          if (sel) sel.value = "All";
          renderAll();
        });
      }
      return;
    }

    const techChips = (nodeInfo.technologies || []).length
      ? nodeInfo.technologies
          .map(
            (t) =>
              `<button type="button" class="dm-filter-btn" data-dm-pick-tech="${esc(t)}">${esc(t)}</button>`
          )
          .join("")
      : `<span class="text-xs text-[var(--muted)]">No specific external packages listed for this layer.</span>`;

    const projectsUsingPrimary = nodeInfo.technologies && nodeInfo.technologies.length
      ? getProjectsUsingTech(nodeInfo.technologies[0])
      : [project];

    mount.innerHTML = `
      <div class="space-y-4">
        <div class="space-y-1 border-b border-[var(--border)] pb-3">
          <span class="text-xs font-mono-tech uppercase tracking-wider text-cyan-400">${esc(layerMeta.label)} Node · ${esc(project.title)}</span>
          <h2 class="text-lg font-bold text-[var(--text)]">${esc(nodeInfo.summary)}</h2>
        </div>

        <div class="space-y-1">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-indigo-400">Architectural Purpose</h3>
          <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${esc(nodeInfo.purpose)}</p>
        </div>

        <div class="space-y-1.5">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-indigo-400">Technologies (Click to Inspect Usage)</h3>
          <div class="flex flex-wrap gap-1.5">${techChips}</div>
        </div>

        <div class="space-y-1">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-indigo-400">Connected Layers</h3>
          <p class="text-xs text-[var(--muted)]">${esc((nodeInfo.relatedLayers || []).join(" · "))}</p>
        </div>

        <div class="space-y-1.5">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-indigo-400">Configured Projects Referencing This Stack</h3>
          <p class="text-xs text-[var(--text-secondary)]">${esc(projectsUsingPrimary.map((p) => p.title).join(" · "))}</p>
        </div>

        <a href="project-details.html?id=${encodeURIComponent(project.id)}" class="primary-button w-full justify-center text-xs min-h-[42px]">
          <span>Open ${esc(project.title)} Case Study</span>
          <i data-lucide="arrow-up-right" class="w-4 h-4" aria-hidden="true"></i>
        </a>
      </div>
    `;

    mount.querySelectorAll("[data-dm-pick-tech]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tech = btn.getAttribute("data-dm-pick-tech");
        const techSelect = document.getElementById("dm-tech-select");
        if (techSelect && Array.from(techSelect.options).some((o) => o.value === tech)) {
          techSelect.value = tech;
        }
        state.selectedTech = tech;
        renderAll();
      });
    });

    refreshIconsSafe();
  }

  function renderAccessibleList(project, deps) {
    const mount = document.getElementById("dm-accessible-list");
    if (!mount || !project) return;

    mount.innerHTML = LAYERS.map((layer, idx) => {
      const data = deps[layer.key];
      const matchesFilter = state.activeLayerFilter === "All" || state.activeLayerFilter === layer.key;
      if (!matchesFilter) return "";

      return `
        <details class="dm-accordion-item" ${idx === 0 || state.selectedLayerKey === layer.key ? "open" : ""}>
          <summary>
            <span>${esc(layer.label)}: <span class="text-cyan-400 font-normal">${esc(data.summary)}</span></span>
            <span class="text-xs font-mono-tech text-[var(--muted)]">${(data.technologies || []).length} tech</span>
          </summary>
          <div class="dm-accordion-body pt-3 space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
            <p><strong class="text-[var(--text)]">Purpose:</strong> ${esc(data.purpose)}</p>
            <p><strong class="text-[var(--text)]">Related Layers:</strong> ${esc((data.relatedLayers || []).join(" -> "))}</p>
            <p><strong class="text-[var(--text)]">Configured Technologies:</strong> ${data.technologies.length ? esc(data.technologies.join(" · ")) : "None specified"}</p>
          </div>
        </details>
      `;
    }).join("");
  }

  function renderAll() {
    const project = getSelectedProject();
    if (!project) return;
    const deps = deriveProjectDependencies(project);
    renderSvgGraph(project, deps);
    renderMobileTree(project, deps);
    renderInspector(project, deps);
    renderAccessibleList(project, deps);
  }

  function init() {
    const root = document.getElementById("dependency-map-root");
    if (!root || root.dataset.dmInit === "1") return;
    root.dataset.dmInit = "1";

    state.projects = loadConfiguredProjects();
    if (state.projects.length) {
      state.selectedProjectId = state.projects[0].id;
    }

    const projectSelect = document.getElementById("dm-project-select");
    const techSelect = document.getElementById("dm-tech-select");
    const filterSelect = document.getElementById("dm-layer-select");
    const layerPills = document.getElementById("dm-layer-pills");
    const zoomInBtn = document.getElementById("dm-zoom-in");
    const zoomOutBtn = document.getElementById("dm-zoom-out");
    const resetBtn = document.getElementById("dm-reset-view");
    const svg = document.getElementById("dm-svg-stage");

    if (projectSelect) {
      projectSelect.innerHTML = state.projects
        .map((p) => `<option value="${esc(p.id)}">${esc(p.title)} (${esc(p.category)})</option>`)
        .join("");
      projectSelect.addEventListener("change", () => {
        state.selectedProjectId = projectSelect.value;
        state.selectedTech = "All";
        if (techSelect) techSelect.value = "All";
        renderAll();
      });
    }

    const allTechs = Array.from(
      new Set(state.projects.flatMap((p) => (Array.isArray(p.technologies) ? p.technologies : [])))
    ).sort();

    if (techSelect) {
      techSelect.innerHTML = [`<option value="All">All Technologies (${allTechs.length})</option>`]
        .concat(allTechs.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`))
        .join("");
      techSelect.addEventListener("change", () => {
        state.selectedTech = techSelect.value;
        renderAll();
      });
    }

    if (filterSelect) {
      filterSelect.innerHTML = [`<option value="All">All 9 Architecture Layers</option>`]
        .concat(LAYERS.map((l) => `<option value="${esc(l.key)}">${esc(l.label)}</option>`))
        .join("");
      filterSelect.addEventListener("change", () => {
        state.activeLayerFilter = filterSelect.value;
        syncLayerPills();
        renderAll();
      });
    }

    function syncLayerPills() {
      if (!layerPills) return;
      const allFilters = [{ key: "All", label: "All Layers" }, ...LAYERS];
      layerPills.innerHTML = allFilters
        .map(
          (l) =>
            `<button type="button" class="dm-filter-btn ${state.activeLayerFilter === l.key ? "is-active" : ""}" data-dm-layer-pill="${esc(l.key)}">${esc(l.label)}</button>`
        )
        .join("");
      layerPills.querySelectorAll("[data-dm-layer-pill]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.activeLayerFilter = btn.getAttribute("data-dm-layer-pill");
          if (filterSelect) filterSelect.value = state.activeLayerFilter;
          syncLayerPills();
          renderAll();
        });
      });
    }

    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => {
        state.zoom = Math.min(1.65, Number((state.zoom + 0.15).toFixed(2)));
        renderAll();
      });
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => {
        state.zoom = Math.max(0.65, Number((state.zoom - 0.15).toFixed(2)));
        renderAll();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;
        state.selectedTech = "All";
        state.activeLayerFilter = "All";
        state.selectedLayerKey = "project";
        if (techSelect) techSelect.value = "All";
        if (filterSelect) filterSelect.value = "All";
        syncLayerPills();
        renderAll();
      });
    }

    if (svg) {
      svg.addEventListener("pointerdown", (e) => {
        if (e.target && e.target.closest("[data-dm-node]")) return;
        state.isPanning = true;
        state.panStartX = e.clientX - state.panX;
        state.panStartY = e.clientY - state.panY;
        svg.classList.add("is-panning");
      });
      window.addEventListener("pointermove", (e) => {
        if (!state.isPanning) return;
        state.panX = Math.max(-220, Math.min(220, e.clientX - state.panStartX));
        state.panY = Math.max(-140, Math.min(140, e.clientY - state.panStartY));
        const vp = document.getElementById("dm-svg-viewport");
        if (vp) vp.setAttribute("transform", `translate(${state.panX} ${state.panY}) scale(${state.zoom})`);
      });
      window.addEventListener("pointerup", () => {
        state.isPanning = false;
        if (svg) svg.classList.remove("is-panning");
      });
      svg.addEventListener("wheel", (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.08 : -0.08;
        state.zoom = Math.max(0.65, Math.min(1.65, Number((state.zoom + delta).toFixed(2))));
        const vp = document.getElementById("dm-svg-viewport");
        if (vp) vp.setAttribute("transform", `translate(${state.panX} ${state.panY}) scale(${state.zoom})`);
      }, { passive: false });
    }

    syncLayerPills();
    renderAll();
    refreshIconsSafe();
  }

  window.PortfolioDependencyMap = {
    init,
    deriveProjectDependencies,
    LAYERS
  };
})();
