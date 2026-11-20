/**
 * AL AMIN Portfolio — Phase 25: Interactive Skills Graph
 * Interactive SVG knowledge map connecting Frontend, Backend, Database, and Tools
 * with zoom/pan/reset, hover & click highlighting, mobile Technology -> Related Tech -> Projects
 * transformation, and a full keyboard-accessible semantic list alternative.
 */

(() => {
  const NODES = [
    // Category Hubs (Row 1 / Top Roots)
    {
      id: "cat-frontend",
      kind: "category",
      label: "Frontend",
      category: "Frontend",
      x: 130,
      y: 64,
      w: 165,
      h: 48,
      description: "Client-side rendering, responsive layouts, accessible DOM interfaces, and interactive state.",
      relatedTechs: ["React", "JavaScript", "HTML", "CSS"],
      services: ["Frontend Development", "Responsive Web Design", "UI/UX Implementation"],
      projectTags: ["React", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Next.js"],
      learningPath: [
        "Master semantic HTML5 document landmarks and accessibility roles.",
        "Build fluid CSS3 layouts with Grid, Flexbox, custom properties, and responsive tokens.",
        "Apply modern JavaScript (ES2024) DOM control and asynchronous API integration.",
        "Scale interfaces using React component composition and hooks."
      ]
    },
    {
      id: "cat-backend",
      kind: "category",
      label: "Backend",
      category: "Backend",
      x: 380,
      y: 64,
      w: 165,
      h: 48,
      description: "Server-side business logic, secure authentication guards, validation middleware, and API orchestration.",
      relatedTechs: ["Node.js", "Express", "REST API"],
      services: ["Backend API Development", "Full-Stack Web Development", "SaaS Development"],
      projectTags: ["Node.js", "Express", "REST API"],
      learningPath: [
        "Learn asynchronous Node.js runtime streams, environment isolation, and error handling.",
        "Structure Express middleware pipelines for validation, routing, and JWT auth.",
        "Design consistent versioned REST API contracts with predictable pagination and status codes."
      ]
    },
    {
      id: "cat-database",
      kind: "category",
      label: "Database",
      category: "Database",
      x: 630,
      y: 64,
      w: 165,
      h: 48,
      description: "Persistent data modeling, schema validation, query indexing, and multi-entity relationships.",
      relatedTechs: ["MongoDB", "Mongoose"],
      services: ["MERN Stack Development", "Backend API Development", "Admin Dashboard Development"],
      projectTags: ["MongoDB", "Mongoose", "PostgreSQL"],
      learningPath: [
        "Understand document collections vs normalized relational tables and primary/foreign keys.",
        "Model MongoDB documents and compound indexes for fast analytical reads.",
        "Enforce strict runtime validation and hooks with Mongoose ODM schemas."
      ]
    },
    {
      id: "cat-tools",
      kind: "category",
      label: "Tools",
      category: "Tools",
      x: 855,
      y: 64,
      w: 155,
      h: 48,
      description: "Daily engineering workflow tools for source control, team collaboration, and delivery hygiene.",
      relatedTechs: ["Git", "GitHub"],
      services: ["Full-Stack Web Development", "Website Redesign", "Performance Optimization"],
      projectTags: ["Git", "GitHub"],
      learningPath: [
        "Adopt clean Git branching, staging, atomic commit messages, and conflict resolution.",
        "Collaborate on GitHub via pull requests, code reviews, Actions CI, and issue tracking."
      ]
    },

    // Frontend Chain: Frontend -> React -> JavaScript -> HTML -> CSS
    {
      id: "React",
      kind: "tech",
      label: "React",
      subtitle: "UI Library",
      category: "Frontend",
      x: 130,
      y: 165,
      w: 165,
      h: 52,
      description: "Declarative component library powering single-page applications, interactive dashboards, and modular state hooks.",
      relatedTechs: ["JavaScript", "HTML", "CSS", "Node.js", "REST API"],
      services: ["MERN Stack Development", "Frontend Development", "SaaS Development", "Full-Stack Web Development"],
      projectTags: ["React", "Redux", "Next.js"],
      learningPath: [
        "Start with solid ES2024 JavaScript, HTML, and CSS fundamentals.",
        "Learn JSX, props, component composition, and core hooks (useState, useEffect, useMemo).",
        "Integrate REST APIs cleanly with predictable loading, empty, and error states.",
        "Combine React UI with Node.js/Express backends inside full-stack MERN projects."
      ]
    },
    {
      id: "JavaScript",
      kind: "tech",
      label: "JavaScript",
      subtitle: "ES2024 Logic",
      category: "Frontend",
      x: 130,
      y: 265,
      w: 165,
      h: 52,
      description: "Core browser and runtime scripting language handling interactive DOM state, async Fetch pipelines, and business logic.",
      relatedTechs: ["React", "HTML", "CSS", "Node.js"],
      services: ["Frontend Development", "Full-Stack Web Development", "Performance Optimization"],
      projectTags: ["JavaScript", "React", "Node.js"],
      learningPath: [
        "Master variables, scope, closures, array transforms, and ES module structure.",
        "Practice DOM event delegation, accessibility focus trapping, and clean async/await flows.",
        "Advance simultaneously into React UI components on the browser and Node.js on the server."
      ]
    },
    {
      id: "HTML",
      kind: "tech",
      label: "HTML",
      subtitle: "Semantic Markup",
      category: "Frontend",
      x: 130,
      y: 365,
      w: 165,
      h: 52,
      description: "Semantic HTML5 foundation delivering accessible landmarks, clean heading hierarchy, ARIA attributes, and SEO discoverability.",
      relatedTechs: ["CSS", "JavaScript", "React"],
      services: ["SEO-Friendly Development", "Frontend Development", "Responsive Web Design"],
      projectTags: ["HTML5", "SEO", "Responsive Design"],
      learningPath: [
        "Learn semantic landmarks (header, main, nav, section, article, footer).",
        "Build accessible forms with paired labels, aria-describedby hints, and validation alerts.",
        "Pair semantic markup with structured Open Graph and JSON-LD metadata."
      ]
    },
    {
      id: "CSS",
      kind: "tech",
      label: "CSS",
      subtitle: "Layout & Tokens",
      category: "Frontend",
      x: 130,
      y: 465,
      w: 165,
      h: 52,
      description: "Modern styling architecture utilizing CSS Grid, Flexbox, custom theme variables, clamp() typography, and compositor animations.",
      relatedTechs: ["HTML", "JavaScript", "React"],
      services: ["Responsive Web Design", "UI/UX Implementation", "Website Redesign"],
      projectTags: ["CSS3", "Tailwind CSS", "Responsive Design"],
      learningPath: [
        "Master box model, specificity, CSS custom properties, Flexbox, and Grid.",
        "Engineer mobile-first fluid layouts verified cleanly from 320px to 2560px.",
        "Implement Dark/Light/High-Contrast token parity and prefers-reduced-motion rules."
      ]
    },

    // Backend Chain: Backend -> Node.js -> Express -> REST API
    {
      id: "Node.js",
      kind: "tech",
      label: "Node.js",
      subtitle: "JS Runtime",
      category: "Backend",
      x: 380,
      y: 185,
      w: 165,
      h: 52,
      description: "Event-driven asynchronous JavaScript server runtime executing scalable API handlers, file workflows, and middleware pipelines.",
      relatedTechs: ["Express", "REST API", "JavaScript", "MongoDB"],
      services: ["Backend API Development", "MERN Stack Development", "SaaS Development"],
      projectTags: ["Node.js"],
      learningPath: [
        "Understand non-blocking event loop, npm ecosystem, and environment configuration.",
        "Build HTTP servers, handle JSON payloads, and structure modular backend folders.",
        "Pair Node.js with Express middleware and MongoDB/PostgreSQL connection pools."
      ]
    },
    {
      id: "Express",
      kind: "tech",
      label: "Express",
      subtitle: "Web Framework",
      category: "Backend",
      x: 380,
      y: 300,
      w: 165,
      h: 52,
      description: "Minimalist Node.js framework orchestrating modular route controllers, JWT verification middleware, validation, and centralized errors.",
      relatedTechs: ["Node.js", "REST API", "Mongoose"],
      services: ["Backend API Development", "MERN Stack Development", "Admin Dashboard Development"],
      projectTags: ["Express"],
      learningPath: [
        "Create modular routers, controllers, and request/response middleware chains.",
        "Add Zod/Joi input validation, rate limiting, Helmet headers, and CORS policies.",
        "Connect Express controllers cleanly with Mongoose models and REST routes."
      ]
    },
    {
      id: "REST API",
      kind: "tech",
      label: "REST API",
      subtitle: "Data Contracts",
      category: "Backend",
      x: 380,
      y: 415,
      w: 165,
      h: 52,
      description: "Resource-oriented HTTP endpoint design supporting versioned CRUD operations, status hygiene, filtering, and JWT role permissions.",
      relatedTechs: ["Express", "Node.js", "React", "MongoDB"],
      services: ["Backend API Development", "Full-Stack Web Development", "E-commerce Development"],
      projectTags: ["REST API", "Express", "Node.js"],
      learningPath: [
        "Design clear resource endpoints, HTTP verbs, and consistent error envelope shapes.",
        "Add server-side pagination, search filtering, and webhook verification.",
        "Document and verify every endpoint flow cleanly via Postman collections."
      ]
    },

    // Database Chain: Database -> MongoDB -> Mongoose
    {
      id: "MongoDB",
      kind: "tech",
      label: "MongoDB",
      subtitle: "NoSQL Document",
      category: "Database",
      x: 630,
      y: 215,
      w: 165,
      h: 52,
      description: "Flexible NoSQL document database engineered for high-throughput JSON records, aggregation pipelines, and compound query indexes.",
      relatedTechs: ["Mongoose", "Node.js", "REST API"],
      services: ["MERN Stack Development", "SaaS Development", "Admin Dashboard Development"],
      projectTags: ["MongoDB"],
      learningPath: [
        "Model document schemas balancing embedded sub-documents vs referenced ObjectIds.",
        "Design compound indexes matching frequent read filter predicates.",
        "Build aggregation pipelines for time-bucket analytics and summary dashboards."
      ]
    },
    {
      id: "Mongoose",
      kind: "tech",
      label: "Mongoose",
      subtitle: "ODM Schemas",
      category: "Database",
      x: 630,
      y: 350,
      w: 165,
      h: 52,
      description: "Object Data Modeling layer for MongoDB enforcing schema types, validation rules, lifecycle hooks, and clean relational population.",
      relatedTechs: ["MongoDB", "Express", "Node.js"],
      services: ["MERN Stack Development", "Backend API Development", "Admin Dashboard Development"],
      projectTags: ["Mongoose", "MongoDB"],
      learningPath: [
        "Define strict Mongoose schemas with required constraints, enums, and unique indexes.",
        "Implement pre-save hooks, virtual helpers, and lean() read optimizations.",
        "Use reference population carefully in multi-role Express API controllers."
      ]
    },

    // Tools Chain: Tools -> Git -> GitHub
    {
      id: "Git",
      kind: "tech",
      label: "Git",
      subtitle: "Version Control",
      category: "Tools",
      x: 855,
      y: 215,
      w: 155,
      h: 52,
      description: "Distributed version control workflow supporting feature branches, atomic commits, safe rebasing, and reliable rollback history.",
      relatedTechs: ["GitHub", "JavaScript", "Node.js"],
      services: ["Full-Stack Web Development", "MERN Stack Development"],
      projectTags: ["React", "Node.js", "JavaScript"],
      learningPath: [
        "Track local history cleanly with stage, commit, diff, branch, and merge workflows.",
        "Maintain feature branches paired with focused commit hygiene before pushing upstream.",
        "Resolve merge conflicts methodically without losing team commits."
      ]
    },
    {
      id: "GitHub",
      kind: "tech",
      label: "GitHub",
      subtitle: "Repos & CI",
      category: "Tools",
      x: 855,
      y: 350,
      w: 155,
      h: 52,
      description: "Collaborative code hosting, pull request code review platform, Actions CI automation, and live repository portfolio integration.",
      relatedTechs: ["Git", "REST API"],
      services: ["Full-Stack Web Development", "Performance Optimization"],
      projectTags: ["React", "JavaScript", "HTML5"],
      learningPath: [
        "Publish clean repositories with informative README documentation and .env.example templates.",
        "Automate build, lint, and TypeScript checks with GitHub Actions workflows.",
        "Connect live repository telemetry safely through read-only GitHub REST endpoints."
      ]
    }
  ];

  // Primary vertical chain edges exactly matching specification + subtle cross-stack bridges
  const EDGES = [
    // Frontend chain
    { from: "cat-frontend", to: "React", type: "primary" },
    { from: "React", to: "JavaScript", type: "primary" },
    { from: "JavaScript", to: "HTML", type: "primary" },
    { from: "HTML", to: "CSS", type: "primary" },

    // Backend chain
    { from: "cat-backend", to: "Node.js", type: "primary" },
    { from: "Node.js", to: "Express", type: "primary" },
    { from: "Express", to: "REST API", type: "primary" },

    // Database chain
    { from: "cat-database", to: "MongoDB", type: "primary" },
    { from: "MongoDB", to: "Mongoose", type: "primary" },

    // Tools chain
    { from: "cat-tools", to: "Git", type: "primary" },
    { from: "Git", to: "GitHub", type: "primary" },

    // Subtle full-stack cross connections
    { from: "JavaScript", to: "Node.js", type: "cross" },
    { from: "React", to: "REST API", type: "cross" },
    { from: "REST API", to: "MongoDB", type: "cross" },
    { from: "Express", to: "Mongoose", type: "cross" }
  ];

  const SVG_WIDTH = 980;
  const SVG_HEIGHT = 530;

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

  function findNode(id) {
    return NODES.find((n) => n.id === id) || NODES.find((n) => n.id === "React") || NODES[0];
  }

  function getConnectedNodeIds(nodeId) {
    const connected = new Set([nodeId]);
    EDGES.forEach((edge) => {
      if (edge.from === nodeId) connected.add(edge.to);
      if (edge.to === nodeId) connected.add(edge.from);
    });
    return connected;
  }

  function getProjectsForNode(node) {
    const allProjects =
      window.PortfolioProjects && Array.isArray(window.PortfolioProjects.projectsData)
        ? window.PortfolioProjects.projectsData
        : [];
    if (!allProjects.length || !node) return [];

    const tags = (node.projectTags || [node.label]).map((t) => String(t).toLowerCase());
    return allProjects.filter((proj) => {
      const pTechs = (proj.technologies || []).map((t) => String(t).toLowerCase());
      return tags.some((tag) =>
        pTechs.some((pt) => pt === tag || pt.includes(tag) || tag.includes(pt))
      );
    });
  }

  function computeEdgePath(fromNode, toNode) {
    const dx = Math.abs(fromNode.x - toNode.x);
    if (dx < 20) {
      // Straight vertical hierarchy connector
      const x1 = fromNode.x;
      const y1 = fromNode.y + fromNode.h / 2;
      const x2 = toNode.x;
      const y2 = toNode.y - toNode.h / 2 - 4;
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    // Smooth curved cross-stack bridge
    const startX = fromNode.x < toNode.x ? fromNode.x + fromNode.w / 2 : fromNode.x - fromNode.w / 2;
    const startY = fromNode.y;
    const endX = fromNode.x < toNode.x ? toNode.x - toNode.w / 2 - 5 : toNode.x + toNode.w / 2 + 5;
    const endY = toNode.y;
    const midX = (startX + endX) / 2;
    return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  }

  function init() {
    const root = document.getElementById("skills-graph-section");
    if (!root) return;

    let selectedId = "React";
    let hoveredId = null;
    let desktopMode = "graph"; // "graph" | "list"
    let zoom = 1;
    let panX = 0;
    let panY = 0;

    const svgMount = document.getElementById("sg-svg-container");
    const listMount = document.getElementById("sg-list-container");
    const mobileMount = document.getElementById("sg-mobile-container");
    const inspectorMount = document.getElementById("sg-inspector-mount");
    const modeGraphBtn = document.getElementById("sg-mode-graph");
    const modeListBtn = document.getElementById("sg-mode-list");
    const zoomInBtn = document.getElementById("sg-zoom-in");
    const zoomOutBtn = document.getElementById("sg-zoom-out");
    const zoomLabelEl = document.getElementById("sg-zoom-label");
    const resetViewBtn = document.getElementById("sg-reset-view");
    const zoomControlsWrap = document.getElementById("sg-zoom-controls");

    function updateZoomLabel() {
      if (zoomLabelEl) {
        zoomLabelEl.textContent = `${Math.round(zoom * 100)}%`;
      }
    }

    function applySvgTransform() {
      const viewport = document.getElementById("sg-svg-viewport");
      if (!viewport) return;
      const cx = SVG_WIDTH / 2;
      const cy = SVG_HEIGHT / 2;
      viewport.setAttribute(
        "transform",
        `translate(${cx + panX}, ${cy + panY}) scale(${zoom}) translate(${-cx}, ${-cy})`
      );
      updateZoomLabel();
    }

    function renderSvgGraph() {
      if (!svgMount) return;
      const activeFocusId = hoveredId || selectedId;
      const connectedSet = getConnectedNodeIds(activeFocusId);

      const edgesHtml = EDGES.map((edge) => {
        const fromNode = findNode(edge.from);
        const toNode = findNode(edge.to);
        const isHighlighted = edge.from === activeFocusId || edge.to === activeFocusId;
        const isDimmed = hoveredId ? !isHighlighted : false;
        const pathD = computeEdgePath(fromNode, toNode);
        return `
          <path
            d="${pathD}"
            class="sg-edge ${edge.type === "cross" ? "sg-edge--cross" : ""} ${isHighlighted ? "is-highlighted" : ""} ${isDimmed ? "is-dimmed" : ""}"
            marker-end="url(#${isHighlighted ? "sg-arrow-active" : "sg-arrow-muted"})"
          ></path>
        `;
      }).join("");

      const nodesHtml = NODES.map((node) => {
        const left = node.x - node.w / 2;
        const top = node.y - node.h / 2;
        const isSelected = node.id === selectedId;
        const isDimmed = hoveredId ? !connectedSet.has(node.id) : false;

        return `
          <g
            class="sg-node-group sg-node-group--${node.kind} ${isSelected ? "is-selected" : ""} ${isDimmed ? "is-dimmed" : ""}"
            data-sg-node="${escHtml(node.id)}"
            role="button"
            tabindex="0"
            aria-pressed="${isSelected ? "true" : "false"}"
            aria-label="${escHtml(`${node.label} (${node.category})`)}"
          >
            <rect
              class="sg-node-rect"
              x="${left}"
              y="${top}"
              width="${node.w}"
              height="${node.h}"
            ></rect>
            <text
              class="sg-node-title"
              x="${node.x}"
              y="${node.subtitle ? node.y - 4 : node.y + 4}"
              text-anchor="middle"
            >${escHtml(node.label)}</text>
            ${
              node.subtitle
                ? `<text class="sg-node-sub" x="${node.x}" y="${node.y + 13}" text-anchor="middle">${escHtml(node.subtitle)}</text>`
                : ""
            }
          </g>
        `;
      }).join("");

      svgMount.innerHTML = `
        <svg
          id="sg-svg-canvas"
          class="sg-svg"
          viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}"
          role="img"
          aria-label="Interactive technology dependency graph connecting Frontend, Backend, Database, and Tools"
        >
          <defs>
            <marker id="sg-arrow-muted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="currentColor" class="text-[var(--border-strong)]"></path>
            </marker>
            <marker id="sg-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#06B6D4"></path>
            </marker>
          </defs>
          <g id="sg-svg-viewport">
            <g class="sg-edges-layer">${edgesHtml}</g>
            <g class="sg-nodes-layer">${nodesHtml}</g>
          </g>
        </svg>
      `;

      applySvgTransform();

      const svgEl = document.getElementById("sg-svg-canvas");
      svgMount.querySelectorAll("[data-sg-node]").forEach((gEl) => {
        const nodeId = gEl.getAttribute("data-sg-node");
        gEl.addEventListener("click", (e) => {
          e.stopPropagation();
          selectNode(nodeId);
        });
        gEl.addEventListener("mouseenter", () => {
          hoveredId = nodeId;
          updateGraphHighlights();
        });
        gEl.addEventListener("mouseleave", () => {
          hoveredId = null;
          updateGraphHighlights();
        });
        gEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectNode(nodeId);
          }
        });
      });

      // Pointer drag-to-pan on SVG canvas
      if (svgEl) {
        let dragging = false;
        let startX = 0;
        let startY = 0;
        let basePanX = panX;
        let basePanY = panY;

        svgEl.addEventListener("pointerdown", (e) => {
          if (e.target.closest && e.target.closest("[data-sg-node]")) return;
          dragging = true;
          startX = e.clientX;
          startY = e.clientY;
          basePanX = panX;
          basePanY = panY;
          svgEl.classList.add("is-panning");
        });

        window.addEventListener("pointermove", (e) => {
          if (!dragging) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          panX = Math.max(-220, Math.min(220, basePanX + dx));
          panY = Math.max(-140, Math.min(140, basePanY + dy));
          applySvgTransform();
        });

        window.addEventListener("pointerup", () => {
          if (!dragging) return;
          dragging = false;
          svgEl.classList.remove("is-panning");
        });
      }
    }

    function updateGraphHighlights() {
      const svgEl = document.getElementById("sg-svg-canvas");
      if (!svgEl) return;
      const activeFocusId = hoveredId || selectedId;
      const connectedSet = getConnectedNodeIds(activeFocusId);

      svgEl.querySelectorAll(".sg-edge").forEach((edgeEl, idx) => {
        const edge = EDGES[idx];
        if (!edge) return;
        const isHighlighted = edge.from === activeFocusId || edge.to === activeFocusId;
        const isDimmed = hoveredId ? !isHighlighted : false;
        edgeEl.classList.toggle("is-highlighted", isHighlighted);
        edgeEl.classList.toggle("is-dimmed", isDimmed);
        edgeEl.setAttribute("marker-end", `url(#${isHighlighted ? "sg-arrow-active" : "sg-arrow-muted"})`);
      });

      svgEl.querySelectorAll("[data-sg-node]").forEach((gEl) => {
        const id = gEl.getAttribute("data-sg-node");
        const isSelected = id === selectedId;
        const isDimmed = hoveredId ? !connectedSet.has(id) : false;
        gEl.classList.toggle("is-selected", isSelected);
        gEl.classList.toggle("is-dimmed", isDimmed);
        gEl.setAttribute("aria-pressed", isSelected ? "true" : "false");
      });
    }

    function renderAccessibleList() {
      if (!listMount) return;
      const groups = ["Frontend", "Backend", "Database", "Tools"];

      listMount.innerHTML = `
        <div class="sg-accessible-grid">
          ${groups
            .map((catName) => {
              const catHub = NODES.find((n) => n.kind === "category" && n.category === catName);
              const items = NODES.filter((n) => n.kind === "tech" && n.category === catName);
              return `
                <div class="sg-acc-branch">
                  <div class="flex items-center justify-between gap-2">
                    <h3 class="text-sm font-bold text-[var(--text)]">${escHtml(catName)} Stack Chain</h3>
                    ${
                      catHub
                        ? `<button type="button" class="sg-chip-btn text-xs min-h-[34px] ${selectedId === catHub.id ? "is-active" : ""}" data-sg-pick="${escHtml(catHub.id)}">${escHtml(catHub.label)} Hub</button>`
                        : ""
                    }
                  </div>
                  <ol class="flex flex-wrap items-center gap-2 list-none p-0 m-0">
                    ${items
                      .map(
                        (item, idx) => `
                        <li class="inline-flex items-center gap-2">
                          <button
                            type="button"
                            class="sg-chip-btn ${selectedId === item.id ? "is-active" : ""}"
                            data-sg-pick="${escHtml(item.id)}"
                            aria-pressed="${selectedId === item.id ? "true" : "false"}"
                          >
                            <span>${escHtml(item.label)}</span>
                          </button>
                          ${
                            idx < items.length - 1
                              ? `<span class="text-xs text-[var(--muted)]" aria-hidden="true">→</span>`
                              : ""
                          }
                        </li>
                      `
                      )
                      .join("")}
                  </ol>
                </div>
              `;
            })
            .join("")}
        </div>
      `;

      listMount.querySelectorAll("[data-sg-pick]").forEach((btn) => {
        btn.addEventListener("click", () => selectNode(btn.getAttribute("data-sg-pick")));
      });
    }

    function renderMobileFlow() {
      if (!mobileMount) return;
      const node = findNode(selectedId);
      const relatedProjects = getProjectsForNode(node);
      const techNodes = NODES.filter((n) => n.kind === "tech");

      const selectorPills = techNodes
        .map(
          (item) => `
          <button
            type="button"
            class="sg-chip-btn ${item.id === node.id ? "is-active" : ""}"
            data-sg-pick="${escHtml(item.id)}"
            aria-pressed="${item.id === node.id ? "true" : "false"}"
          >
            ${escHtml(item.label)}
          </button>
        `
        )
        .join("");

      const relatedTechBtns = (node.relatedTechs || [])
        .map(
          (rel) => `
          <button type="button" class="sg-chip-btn" data-sg-pick="${escHtml(rel)}">
            <span>${escHtml(rel)}</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-cyan-400"></i>
          </button>
        `
        )
        .join("");

      const projectsHtml =
        relatedProjects.length > 0
          ? relatedProjects
              .map(
                (p) => `
                <a
                  href="project-details.html?id=${encodeURIComponent(p.id)}"
                  class="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-cyan-400 transition-colors"
                >
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-[var(--text)] truncate">${escHtml(p.title)}</p>
                    <p class="text-xs text-[var(--muted)] truncate">${escHtml(p.category)} · ${escHtml(p.year)}</p>
                  </div>
                  <i data-lucide="arrow-right" class="w-4 h-4 text-cyan-400 shrink-0"></i>
                </a>
              `
              )
              .join("")
          : `<a href="github.html" class="text-xs font-semibold text-cyan-400 hover:underline">Inspect GitHub Repositories →</a>`;

      mobileMount.innerHTML = `
        <div class="space-y-4">
          <div class="space-y-2">
            <p class="text-xs font-semibold text-[var(--text-secondary)]">Select Technology</p>
            <div class="flex flex-wrap gap-2">${selectorPills}</div>
          </div>

          <!-- Mobile Structured Transformation: Technology -> Related Technologies -> Projects -->
          <div class="sg-mobile-flow">
            <div class="sg-flow-step">
              <div class="flex items-center justify-between gap-2 text-xs">
                <span class="font-mono-tech font-bold text-cyan-400">1. Technology</span>
                <span class="text-[var(--muted)]">${escHtml(node.category)}</span>
              </div>
              <p class="text-base font-bold text-[var(--text)]">${escHtml(node.label)}</p>
              <p class="text-xs text-[var(--muted)] leading-relaxed">${escHtml(node.description)}</p>
            </div>

            <div class="sg-flow-connector" aria-hidden="true">
              <i data-lucide="arrow-down" class="w-4 h-4"></i>
              <span>Related Technologies</span>
            </div>

            <div class="sg-flow-step">
              <span class="text-xs font-mono-tech font-bold text-indigo-400">2. Related Technologies</span>
              <div class="flex flex-wrap gap-2">${relatedTechBtns}</div>
            </div>

            <div class="sg-flow-connector" aria-hidden="true">
              <i data-lucide="arrow-down" class="w-4 h-4"></i>
              <span>Projects</span>
            </div>

            <div class="sg-flow-step">
              <span class="text-xs font-mono-tech font-bold text-cyan-400">3. Related Projects</span>
              <div class="space-y-2">${projectsHtml}</div>
            </div>
          </div>
        </div>
      `;

      mobileMount.querySelectorAll("[data-sg-pick]").forEach((btn) => {
        btn.addEventListener("click", () => selectNode(btn.getAttribute("data-sg-pick")));
      });
    }

    function renderInspector() {
      if (!inspectorMount) return;
      const node = findNode(selectedId);
      const relatedProjects = getProjectsForNode(node);

      const relatedTechBtns = (node.relatedTechs || [])
        .map(
          (techName) => `
          <button
            type="button"
            class="sg-chip-btn"
            data-sg-jump="${escHtml(techName)}"
          >
            <span>${escHtml(techName)}</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-cyan-400"></i>
          </button>
        `
        )
        .join("");

      const projectsMarkup =
        relatedProjects.length > 0
          ? relatedProjects
              .map(
                (proj) => `
                <a
                  href="project-details.html?id=${encodeURIComponent(proj.id)}"
                  class="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-cyan-400 transition-colors"
                >
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-[var(--text)] truncate">${escHtml(proj.title)}</p>
                    <p class="text-xs text-[var(--muted)] truncate">${escHtml(proj.category)} · ${escHtml(proj.developmentRole || proj.year)}</p>
                  </div>
                  <i data-lucide="external-link" class="w-4 h-4 text-cyan-400 shrink-0"></i>
                </a>
              `
              )
              .join("")
          : `
            <a
              href="github.html"
              class="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-cyan-400 transition-colors"
            >
              <div class="min-w-0">
                <p class="text-sm font-bold text-[var(--text)]">GitHub Engineering Explorer</p>
                <p class="text-xs text-[var(--muted)]">Applied across all repository branches and CI workflows</p>
              </div>
              <i data-lucide="external-link" class="w-4 h-4 text-cyan-400 shrink-0"></i>
            </a>
          `;

      const servicesMarkup = (node.services || [])
        .map(
          (svc) => `
          <a
            href="services.html"
            class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-cyan-400 transition-colors py-1"
          >
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-cyan-400 shrink-0"></i>
            <span>${escHtml(svc)}</span>
          </a>
        `
        )
        .join("");

      const learningMarkup = (node.learningPath || [])
        .map(
          (stepText, idx) => `
          <li class="sg-learning-step">
            <span class="sg-step-badge">0${idx + 1}</span>
            <span>${escHtml(stepText)}</span>
          </li>
        `
        )
        .join("");

      inspectorMount.innerHTML = `
        <div class="sg-inspector">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span class="font-mono-tech font-bold text-cyan-400">Category: ${escHtml(node.category)}</span>
                <span aria-hidden="true">·</span>
                <span>${escHtml(node.subtitle || "Technology Domain Hub")}</span>
              </div>
              <h3 class="text-xl sm:text-2xl font-extrabold text-[var(--text)]">${escHtml(node.label)}</h3>
              <p class="text-sm text-[var(--muted)] max-w-3xl leading-relaxed">${escHtml(node.description)}</p>
            </div>
            <a
              href="explorer.html?tech=${encodeURIComponent(node.label)}"
              class="outline-button text-xs sm:text-sm shrink-0 self-start sm:self-center"
            >
              <span>Inspect in Tech Explorer</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column: Related Techs & Learning Path -->
            <div class="space-y-5">
              <div class="space-y-2.5">
                <h4 class="text-sm font-bold text-[var(--text)]">Related Technologies</h4>
                <div class="flex flex-wrap gap-2">${relatedTechBtns}</div>
              </div>

              <div class="space-y-2.5">
                <h4 class="text-sm font-bold text-[var(--text)]">Learning Path</h4>
                <ol class="sg-learning-steps">${learningMarkup}</ol>
              </div>
            </div>

            <!-- Right Column: Related Projects & Related Services -->
            <div class="space-y-5">
              <div class="space-y-2.5">
                <h4 class="text-sm font-bold text-[var(--text)]">Related Projects (${relatedProjects.length || 1})</h4>
                <div class="space-y-2">${projectsMarkup}</div>
              </div>

              <div class="space-y-2">
                <h4 class="text-sm font-bold text-[var(--text)]">Related Services</h4>
                <div class="flex flex-col gap-1">${servicesMarkup}</div>
              </div>
            </div>
          </div>
        </div>
      `;

      inspectorMount.querySelectorAll("[data-sg-jump]").forEach((btn) => {
        btn.addEventListener("click", () => {
          selectNode(btn.getAttribute("data-sg-jump"));
        });
      });

      refreshIcons();
    }

    function selectNode(nodeId) {
      if (!nodeId) return;
      selectedId = findNode(nodeId).id;
      hoveredId = null;
      updateGraphHighlights();
      renderAccessibleList();
      renderMobileFlow();
      renderInspector();
    }

    function setDesktopViewMode(nextMode) {
      desktopMode = nextMode === "list" ? "list" : "graph";
      if (modeGraphBtn) {
        modeGraphBtn.classList.toggle("is-active", desktopMode === "graph");
        modeGraphBtn.setAttribute("aria-pressed", desktopMode === "graph" ? "true" : "false");
      }
      if (modeListBtn) {
        modeListBtn.classList.toggle("is-active", desktopMode === "list");
        modeListBtn.setAttribute("aria-pressed", desktopMode === "list" ? "true" : "false");
      }
      if (svgMount) svgMount.classList.toggle("hidden", desktopMode !== "graph");
      if (listMount) listMount.classList.toggle("hidden", desktopMode !== "list");
      if (zoomControlsWrap) zoomControlsWrap.classList.toggle("hidden", desktopMode !== "graph");
    }

    if (modeGraphBtn) modeGraphBtn.addEventListener("click", () => setDesktopViewMode("graph"));
    if (modeListBtn) modeListBtn.addEventListener("click", () => setDesktopViewMode("list"));

    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => {
        zoom = Math.min(1.45, Number((zoom + 0.15).toFixed(2)));
        applySvgTransform();
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => {
        zoom = Math.max(0.75, Number((zoom - 0.15).toFixed(2)));
        applySvgTransform();
      });
    }

    if (resetViewBtn) {
      resetViewBtn.addEventListener("click", () => {
        zoom = 1;
        panX = 0;
        panY = 0;
        hoveredId = null;
        selectedId = "React";
        applySvgTransform();
        updateGraphHighlights();
        renderAccessibleList();
        renderMobileFlow();
        renderInspector();
        if (typeof window.showToast === "function") {
          window.showToast("Skills graph view reset", "info");
        }
      });
    }

    renderSvgGraph();
    renderAccessibleList();
    renderMobileFlow();
    renderInspector();
    setDesktopViewMode("graph");
  }

  window.PortfolioSkillsGraph = {
    init,
    NODES,
    EDGES,
    findNode,
    getConnectedNodeIds,
    getProjectsForNode
  };
})();
