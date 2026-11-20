/**
 * AL AMIN Portfolio — Phase 31: Interactive System Architecture Page
 * Visualizes system layers:
 * Core Flow: Browser -> Frontend -> API -> Backend -> Database
 * Supporting Layers: Authentication, Storage, External APIs, Deployment
 * Across Portfolio System and real full-stack builds.
 */

(() => {
  const CORE_FLOW_ORDER = ["browser", "frontend", "api", "backend", "database"];
  const SUPPORT_ORDER = ["authentication", "storage", "external-apis", "deployment"];

  // Node coordinates on 860x580 responsive SVG viewBox
  const NODE_LAYOUT = {
    browser: { x: 310, y: 20, w: 240, h: 72, tier: "primary", label: "01 · Client Edge" },
    frontend: { x: 310, y: 132, w: 240, h: 72, tier: "primary", label: "02 · Presentation" },
    api: { x: 310, y: 244, w: 240, h: 72, tier: "primary", label: "03 · Transport" },
    backend: { x: 310, y: 356, w: 240, h: 72, tier: "primary", label: "04 · Business Logic" },
    database: { x: 310, y: 468, w: 240, h: 72, tier: "primary", label: "05 · Persistence" },
    "external-apis": { x: 24, y: 188, w: 220, h: 74, tier: "support", label: "External Services" },
    deployment: { x: 24, y: 396, w: 220, h: 74, tier: "support", label: "Delivery & CDN" },
    authentication: { x: 616, y: 188, w: 220, h: 74, tier: "support", label: "Access Control" },
    storage: { x: 616, y: 396, w: 220, h: 74, tier: "support", label: "Object & State Store" }
  };

  const DIAGRAM_EDGES = [
    // Primary vertical pipeline
    { id: "e-browser-frontend", from: "browser", to: "frontend", kind: "primary" },
    { id: "e-frontend-api", from: "frontend", to: "api", kind: "primary" },
    { id: "e-api-backend", from: "api", to: "backend", kind: "primary" },
    { id: "e-backend-database", from: "backend", to: "database", kind: "primary" },
    // Cross-cutting supporting infrastructure
    { id: "e-ext-api", from: "external-apis", to: "api", kind: "support" },
    { id: "e-auth-api", from: "authentication", to: "api", kind: "support" },
    { id: "e-auth-backend", from: "authentication", to: "backend", kind: "support" },
    { id: "e-backend-storage", from: "backend", to: "storage", kind: "support" },
    { id: "e-deploy-frontend", from: "deployment", to: "frontend", kind: "support" },
    { id: "e-deploy-backend", from: "deployment", to: "backend", kind: "support" }
  ];

  const DEFAULT_ARCHITECTURES = [
    {
      id: "portfolio-system",
      title: "AL AMIN Portfolio System",
      subtitle: "Zero-framework static multi-page architecture driven by centralized config",
      href: "project-details.html?id=portfolio-system",
      nodes: {
        browser: {
          title: "Browser",
          shortTech: "Chrome / Safari / Edge · PWA",
          icon: "globe",
          purpose: "Renders HTML documents, manages dark/light/high-contrast CSS tokens, and registers the static offline service worker.",
          technology: "HTML5, CSS Custom Properties, localStorage, Service Worker API",
          responsibility: "Zero-flicker theme application, keyboard focus management, and smooth IntersectionObserver transitions.",
          relatedProject: { title: "Portfolio System", href: "project-details.html?id=portfolio-system" }
        },
        frontend: {
          title: "Frontend",
          shortTech: "Vanilla JS · Tailwind CDN",
          icon: "layout",
          purpose: "Delivers 27 coordinated static pages sharing one brand/navigation system without heavyweight client framework bundles.",
          technology: "Semantic HTML5, Tailwind CSS CDN, Vanilla JavaScript ES2024, Lucide Icons",
          responsibility: "Component injection (navbar, footer, command palette, theme switches) and scoped interactive utilities.",
          relatedProject: { title: "Portfolio System", href: "project-details.html?id=portfolio-system" }
        },
        api: {
          title: "API",
          shortTech: "Fetch REST · Optional Proxy",
          icon: "webhook",
          purpose: "Connects client widgets safely to public read endpoints and prepares optional server-proxy endpoints without client secrets.",
          technology: "Browser Fetch API, JSON Contracts, Optional /api/* Adapter Hooks",
          responsibility: "GitHub rate-limit header tracking, Web Share / Clipboard API wrappers, and graceful network fallbacks.",
          relatedProject: { title: "GitHub Explorer", href: "github.html" }
        },
        backend: {
          title: "Backend",
          shortTech: "Static Host · Vite Build",
          icon: "server",
          purpose: "Eliminates unnecessary server runtime overhead for public portfolio routes while remaining ready for Express or Formspree adapters.",
          technology: "Static File Delivery, Vite Dev/Build Pipeline, Deterministic Rule Engines",
          responsibility: "Running local rule engines (Project Architect, Estimator, Assistant) directly in memory without leaking keys.",
          relatedProject: { title: "Project Architect", href: "project-architect.html" }
        },
        database: {
          title: "Database",
          shortTech: "Centralized JS Data Modules",
          icon: "database",
          purpose: "Acts as a deterministic structured content store replacing hard-coded copy across pages.",
          technology: "js/config.js, js/projects.js, js/blog.js, js/decisions.js",
          responsibility: "Single source of truth for case studies, engineering ADRs, build logs, and personal brand settings.",
          relatedProject: { title: "Engineering Decision Log", href: "decisions.html" }
        },
        authentication: {
          title: "Authentication",
          shortTech: "Public Unauthenticated Posture",
          icon: "shield-check",
          purpose: "Keeps the public portfolio completely open to recruiters and clients while exposing zero private admin endpoints.",
          technology: "No-Credential Static Access, Sandboxed Iframe Isolation",
          responsibility: "Validating contact & project-request inputs client-side and escaping rendered strings cleanly.",
          relatedProject: { title: "Security Center", href: "security.html" }
        },
        storage: {
          title: "Storage",
          shortTech: "Cache API · localStorage · Assets",
          icon: "hard-drive",
          purpose: "Stores non-sensitive UI preferences, temporary GitHub API caches, and offline shell assets locally.",
          technology: "Service Worker Cache Storage (sw.js), localStorage, sessionStorage",
          responsibility: "15-minute GitHub cache TTL, offline HTML/CSS/SVG fallback, and draft quote handoff between pages.",
          relatedProject: { title: "Performance Center", href: "performance.html" }
        },
        "external-apis": {
          title: "External APIs",
          shortTech: "GitHub REST · Google Fonts",
          icon: "cloud",
          purpose: "Fetches live repository metadata and loads geometric/monospace typography cleanly with fallback resilience.",
          technology: "api.github.com (Public REST), Google Fonts CDN, Unpkg Lucide CDN",
          responsibility: "Surfacing live GitHub activity in github.html & dashboard.html without exposing private OAuth tokens.",
          relatedProject: { title: "Developer Dashboard", href: "dashboard.html" }
        },
        deployment: {
          title: "Deployment",
          shortTech: "Static Edge / Vite Dist",
          icon: "rocket",
          purpose: "Packages verified HTML, CSS, JS, and SVG/JPG assets cleanly for instant CDN edge distribution.",
          technology: "Vite Static Bundle (dist/), sitemap.xml, site.webmanifest",
          responsibility: "Fast static delivery across mobile and desktop viewports with zero Node server dependency required in production.",
          relatedProject: { title: "Build in Public", href: "build.html" }
        }
      }
    },
    {
      id: "astrapulse",
      title: "AstraPulse (MERN SaaS)",
      subtitle: "Multi-workspace API telemetry & time-bucketed observability architecture",
      href: "project-details.html?id=astrapulse",
      nodes: {
        browser: {
          title: "Browser",
          shortTech: "SPA Client · Mobile/4K",
          icon: "globe",
          purpose: "Hosts the interactive observability workspace for engineers inspecting latency, uptime, and error spikes.",
          technology: "Modern Evergreen Browsers, Responsive Viewports (320px–2560px)",
          responsibility: "Maintaining responsive tabular alignment and interactive time-window filtering.",
          relatedProject: { title: "AstraPulse Case Study", href: "project-details.html?id=astrapulse" }
        },
        frontend: {
          title: "Frontend",
          shortTech: "React + Tailwind CSS",
          icon: "layout",
          purpose: "Presents 24-hour API latency charts, regional breakdowns, and searchable event logs.",
          technology: "React Components, Tailwind CSS, Tabular Metrics UI",
          responsibility: "Managing filter state (1h, 24h, 7d), zero-CLS loading skeletons, and mobile dashboard stacking.",
          relatedProject: { title: "AstraPulse Case Study", href: "project-details.html?id=astrapulse" }
        },
        api: {
          title: "API",
          shortTech: "JSON REST (/api/v1/*)",
          icon: "webhook",
          purpose: "Exposes versioned endpoints for telemetry ingestion, rolling time-window queries, and cursor-paginated logs.",
          technology: "REST API, JSON Envelopes, Query Filter Parameters",
          responsibility: "Validating ingestion payloads and scoping every metric query strictly to authorized workspace IDs.",
          relatedProject: { title: "Engineering Decisions (ADR-004)", href: "decisions.html" }
        },
        backend: {
          title: "Backend",
          shortTech: "Node.js + Express Service",
          icon: "server",
          purpose: "Processes telemetry events, enforces alert thresholds, and runs workspace aggregation queries.",
          technology: "Node.js, Express Middleware & Modular Controllers",
          responsibility: "Threshold evaluation checks and pre-aggregated bucket updates during metric ingestion.",
          relatedProject: { title: "AstraPulse Case Study", href: "project-details.html?id=astrapulse" }
        },
        database: {
          title: "Database",
          shortTech: "MongoDB Time-Buckets",
          icon: "database",
          purpose: "Stores workspaces, pre-aggregated hourly/daily metric buckets, and indexed raw request logs.",
          technology: "MongoDB, Compound Indexes (workspaceId + windowStart)",
          responsibility: "Eliminating slow full-collection scans when rendering 24-hour latency trend dashboards.",
          relatedProject: { title: "Engineering Decisions (ADR-001)", href: "decisions.html" }
        },
        authentication: {
          title: "Authentication",
          shortTech: "JWT + Workspace RBAC",
          icon: "shield-check",
          purpose: "Protects multi-workspace telemetry streams by verifying user identity and workspace role permissions.",
          technology: "Stateless JWT Middleware, Role Guards (Admin / Developer / Viewer)",
          responsibility: "Enforcing least-privilege read/write access on workspace settings and alert thresholds.",
          relatedProject: { title: "Security Center", href: "security.html" }
        },
        storage: {
          title: "Storage",
          shortTech: "Aggregated Snapshots",
          icon: "hard-drive",
          purpose: "Persists structured metric history and prepared incident diagnostic windows for team triage.",
          technology: "MongoDB MetricBuckets & EventLogs Collections",
          responsibility: "Clean separation between hot rolling analytics buckets and historical trace records.",
          relatedProject: { title: "AstraPulse Case Study", href: "project-details.html?id=astrapulse" }
        },
        "external-apis": {
          title: "External APIs",
          shortTech: "HTTP Webhooks · Email Alerts",
          icon: "cloud",
          purpose: "Dispatches automated notifications when latency or error-rate alert thresholds are breached.",
          technology: "Outbound Webhook Dispatcher, Email Adapter",
          responsibility: "Delivering timely operational alerts to engineering notification channels.",
          relatedProject: { title: "AstraPulse Case Study", href: "project-details.html?id=astrapulse" }
        },
        deployment: {
          title: "Deployment",
          shortTech: "Containerized Node + Managed DB",
          icon: "rocket",
          purpose: "Runs Express API services alongside managed MongoDB clusters with strict environment variable isolation.",
          technology: "Environment Variables (.env), Managed MongoDB, Edge CDN",
          responsibility: "Consistent API availability and TLS-secured workspace traffic.",
          relatedProject: { title: "Build in Public", href: "build.html" }
        }
      }
    },
    {
      id: "ecommerce-saas",
      title: "E-commerce SaaS (Hybrid SQL + NoSQL)",
      subtitle: "Multi-tenant store customizer with PostgreSQL ledgers & MongoDB themes",
      href: "project-details.html?id=ecommerce-saas",
      nodes: {
        browser: {
          title: "Browser",
          shortTech: "Merchant Studio & Storefront",
          icon: "globe",
          purpose: "Serves both merchant customization studios and branded customer storefronts across custom tenant slugs.",
          technology: "Desktop/Mobile Browsers, CSS Custom Properties",
          responsibility: "Instant theme color/layout live preview via scoped CSS variables.",
          relatedProject: { title: "E-commerce SaaS Case Study", href: "project-details.html?id=ecommerce-saas" }
        },
        frontend: {
          title: "Frontend",
          shortTech: "Next.js + React + Tailwind",
          icon: "layout",
          purpose: "Renders storefront customization panels, operational order tables, and responsive shopping catalogs.",
          technology: "Next.js, React, Tailwind CSS",
          responsibility: "Split-pane studio editing UX and SEO-structured public merchant storefront pages.",
          relatedProject: { title: "E-commerce SaaS Case Study", href: "project-details.html?id=ecommerce-saas" }
        },
        api: {
          title: "API",
          shortTech: "Multi-Tenant Express API",
          icon: "webhook",
          purpose: "Routes tenant storefront lookups, catalog updates, fulfillment state changes, and analytics queries.",
          technology: "REST API, Tenant Slug Middleware",
          responsibility: "Attaching strict tenant scoping to every incoming storefront and admin request.",
          relatedProject: { title: "E-commerce SaaS Case Study", href: "project-details.html?id=ecommerce-saas" }
        },
        backend: {
          title: "Backend",
          shortTech: "Node.js + Express Engine",
          icon: "server",
          purpose: "Coordinates flexible theme/catalog updates alongside ACID-safe order creation and revenue rollups.",
          technology: "Node.js, Express Controllers",
          responsibility: "Server-side order total computation, stock decrement rules, and fulfillment transitions (Paid -> Delivered).",
          relatedProject: { title: "E-commerce SaaS Case Study", href: "project-details.html?id=ecommerce-saas" }
        },
        database: {
          title: "Database",
          shortTech: "PostgreSQL + MongoDB Hybrid",
          icon: "database",
          purpose: "Matches relational ACID integrity to financial order ledgers while keeping merchant theme configs flexible.",
          technology: "PostgreSQL (Orders/Revenue) + MongoDB (Catalogs/Themes)",
          responsibility: "Workload-matched data isolation so catalog theme schema evolution never complicates financial reporting.",
          relatedProject: { title: "Engineering Decisions (ADR-006)", href: "decisions.html" }
        },
        authentication: {
          title: "Authentication",
          shortTech: "JWT + Multi-Tenant RBAC",
          icon: "shield-check",
          purpose: "Isolates merchant store admin actions cleanly from other tenants and storefront shoppers.",
          technology: "JWT Access Tokens, Merchant Ownership Guards",
          responsibility: "Preventing cross-tenant data leakage across shared SaaS infrastructure.",
          relatedProject: { title: "Security Center", href: "security.html" }
        },
        storage: {
          title: "Storage",
          shortTech: "Object Media Bucket (Planned)",
          icon: "hard-drive",
          purpose: "Delivers product photography across merchant storefronts cleanly.",
          technology: "Static CDN Media + Planned Pre-Signed Upload Storage",
          responsibility: "Separating merchant product imagery from transactional database servers.",
          relatedProject: { title: "Security Center", href: "security.html" }
        },
        "external-apis": {
          title: "External APIs",
          shortTech: "Payment Gateway Adapters",
          icon: "cloud",
          purpose: "Connects checkout flows to external payment processors via server-verified webhooks.",
          technology: "Webhook Checkout Adapters, Currency/Shipping Interfaces",
          responsibility: "Confirming authoritative payment events before marking PostgreSQL orders as Paid.",
          relatedProject: { title: "E-commerce SaaS Case Study", href: "project-details.html?id=ecommerce-saas" }
        },
        deployment: {
          title: "Deployment",
          shortTech: "Next.js Edge + API Cluster",
          icon: "rocket",
          purpose: "Hosts SSR storefront rendering near shoppers while keeping API & PostgreSQL clusters secured.",
          technology: "Cloud Edge Hosting, TLS Termination, Env Secrets",
          responsibility: "Sub-second storefront page delivery with isolated merchant environments.",
          relatedProject: { title: "E-commerce SaaS Case Study", href: "project-details.html?id=ecommerce-saas" }
        }
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

  function getArchitectures() {
    const cfg = (window.portfolioConfig && window.portfolioConfig.systemArchitectures) || null;
    if (Array.isArray(cfg) && cfg.length > 0) {
      return cfg;
    }
    return DEFAULT_ARCHITECTURES;
  }

  function getAnchorPoint(nodeId, edgeKind, isSource) {
    const box = NODE_LAYOUT[nodeId];
    if (!box) return { x: 0, y: 0 };
    if (edgeKind === "primary") {
      return {
        x: box.x + box.w / 2,
        y: isSource ? box.y + box.h : box.y
      };
    }
    // Support horizontal anchors connecting side columns cleanly to central spine
    const isLeftSide = box.x < 300;
    const isRightSide = box.x > 550;
    if (isLeftSide) {
      return { x: box.x + box.w, y: box.y + box.h / 2 };
    }
    if (isRightSide) {
      return { x: box.x, y: box.y + box.h / 2 };
    }
    // Center node receiving support edge from left or right
    return { x: box.x, y: box.y + box.h / 2 };
  }

  function computeEdgePath(edge) {
    if (edge.kind === "primary") {
      const a = getAnchorPoint(edge.from, "primary", true);
      const b = getAnchorPoint(edge.to, "primary", false);
      return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
    }

    const fromBox = NODE_LAYOUT[edge.from];
    const toBox = NODE_LAYOUT[edge.to];
    if (!fromBox || !toBox) return "";

    const fromCenterX = fromBox.x + fromBox.w / 2;
    const toCenterX = toBox.x + toBox.w / 2;

    let x1;
    let x2;
    if (fromCenterX < toCenterX) {
      x1 = fromBox.x + fromBox.w;
      x2 = toBox.x;
    } else {
      x1 = fromBox.x;
      x2 = toBox.x + toBox.w;
    }
    const y1 = fromBox.y + fromBox.h / 2;
    const y2 = toBox.y + toBox.h / 2;
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  }

  function init() {
    const root = document.getElementById("architecture-page-root");
    if (!root) return;

    const architectures = getArchitectures();
    let activeProjId = architectures[0].id;
    let activeNodeId = "browser";

    const projBarMount = document.getElementById("arch-project-bar");
    const desktopSvgMount = document.getElementById("arch-svg-diagram");
    const mobileStackMount = document.getElementById("arch-mobile-stack");
    const inspectorMount = document.getElementById("arch-inspector-panel");
    const activeSummaryEl = document.getElementById("arch-active-subtitle");
    const resetBtn = document.getElementById("arch-reset-view");

    function getActiveBlueprint() {
      return architectures.find((a) => a.id === activeProjId) || architectures[0];
    }

    function renderProjectBar() {
      if (!projBarMount) return;
      projBarMount.innerHTML = architectures
        .map((arch) => {
          const isSelected = arch.id === activeProjId;
          return `
            <button
              type="button"
              class="arch-proj-btn ${isSelected ? "is-active" : ""}"
              data-arch-proj="${escHtml(arch.id)}"
              aria-pressed="${isSelected ? "true" : "false"}"
            >
              ${escHtml(arch.title)}
            </button>
          `;
        })
        .join("");

      projBarMount.querySelectorAll("[data-arch-proj]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-arch-proj");
          if (!id || id === activeProjId) return;
          activeProjId = id;
          renderProjectBar();
          renderDiagram();
          renderMobileStack();
          renderInspector();
        });
      });
    }

    function renderDiagram() {
      if (!desktopSvgMount) return;
      const bp = getActiveBlueprint();
      if (activeSummaryEl) activeSummaryEl.textContent = bp.subtitle;

      const connectedNodeIds = new Set([activeNodeId]);
      DIAGRAM_EDGES.forEach((edge) => {
        if (edge.from === activeNodeId) connectedNodeIds.add(edge.to);
        if (edge.to === activeNodeId) connectedNodeIds.add(edge.from);
      });

      const edgesSvg = DIAGRAM_EDGES.map((edge) => {
        const d = computeEdgePath(edge);
        const isHit = edge.from === activeNodeId || edge.to === activeNodeId;
        const cls = [
          "arch-edge",
          edge.kind === "support" ? "arch-edge--support" : "",
          isHit ? "is-highlighted" : "is-dimmed"
        ]
          .filter(Boolean)
          .join(" ");
        return `<path d="${d}" class="${cls}" marker-end="url(#${isHit ? "arch-arrow-active" : "arch-arrow"})" />`;
      }).join("");

      const allNodeIds = [...CORE_FLOW_ORDER, ...SUPPORT_ORDER];
      const nodesSvg = allNodeIds
        .map((nodeId) => {
          const pos = NODE_LAYOUT[nodeId];
          const info = bp.nodes[nodeId];
          if (!pos || !info) return "";
          const isSelected = nodeId === activeNodeId;
          const isConnected = connectedNodeIds.has(nodeId);
          const cls = [
            "arch-node",
            pos.tier === "primary" ? "arch-node--primary" : "arch-node--support",
            isSelected ? "is-selected" : "",
            !isConnected ? "is-dimmed" : ""
          ]
            .filter(Boolean)
            .join(" ");

          return `
            <g
              class="${cls}"
              data-arch-node="${escHtml(nodeId)}"
              role="button"
              tabindex="0"
              aria-pressed="${isSelected ? "true" : "false"}"
              aria-label="${escHtml(info.title)} layer: ${escHtml(info.shortTech)}"
            >
              <rect x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${pos.h}" class="arch-node-box" />
              <text x="${pos.x + 14}" y="${pos.y + 20}" class="arch-node-kicker">${escHtml(pos.label)}</text>
              <text x="${pos.x + 14}" y="${pos.y + 41}" class="arch-node-title">${escHtml(info.title)}</text>
              <text x="${pos.x + 14}" y="${pos.y + 59}" class="arch-node-tech">${escHtml(info.shortTech)}</text>
            </g>
          `;
        })
        .join("");

      desktopSvgMount.innerHTML = `
        <svg
          class="arch-svg"
          viewBox="0 0 860 564"
          role="img"
          aria-label="Interactive system architecture diagram for ${escHtml(bp.title)}"
        >
          <defs>
            <marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="currentColor" opacity="0.45"></path>
            </marker>
            <marker id="arch-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#06b6d4"></path>
            </marker>
          </defs>
          <g aria-hidden="true">${edgesSvg}</g>
          <g>${nodesSvg}</g>
        </svg>
      `;

      desktopSvgMount.querySelectorAll("[data-arch-node]").forEach((nodeEl) => {
        const selectHandler = () => {
          const id = nodeEl.getAttribute("data-arch-node");
          if (!id) return;
          activeNodeId = id;
          renderDiagram();
          renderMobileStack();
          renderInspector();
        };
        nodeEl.addEventListener("click", selectHandler);
        nodeEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectHandler();
          }
        });
      });
    }

    function renderMobileStack() {
      if (!mobileStackMount) return;
      const bp = getActiveBlueprint();

      const primaryCards = CORE_FLOW_ORDER.map((nodeId, idx) => {
        const info = bp.nodes[nodeId];
        if (!info) return "";
        const isSelected = nodeId === activeNodeId;
        const card = `
          <button
            type="button"
            class="arch-stack-card ${isSelected ? "is-selected" : ""}"
            data-arch-stack-node="${escHtml(nodeId)}"
            aria-pressed="${isSelected ? "true" : "false"}"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-cyan-400 inline-flex items-center justify-center shrink-0" aria-hidden="true">
                <i data-lucide="${escHtml(info.icon)}" class="w-4 h-4"></i>
              </span>
              <div class="min-w-0">
                <p class="text-[11px] font-mono-tech text-cyan-400">Layer 0${idx + 1}</p>
                <p class="text-sm font-bold text-[var(--text)]">${escHtml(info.title)}</p>
                <p class="text-xs font-mono-tech text-[var(--muted)] truncate">${escHtml(info.shortTech)}</p>
              </div>
            </div>
            <i data-lucide="arrow-right" class="w-4 h-4 text-[var(--muted)] shrink-0" aria-hidden="true"></i>
          </button>
        `;
        const arrow =
          idx < CORE_FLOW_ORDER.length - 1
            ? `<div class="arch-flow-arrow" aria-hidden="true"><i data-lucide="arrow-down" class="w-4 h-4"></i></div>`
            : "";
        return card + arrow;
      }).join("");

      const supportCards = SUPPORT_ORDER.map((nodeId) => {
        const info = bp.nodes[nodeId];
        if (!info) return "";
        const isSelected = nodeId === activeNodeId;
        return `
          <button
            type="button"
            class="arch-stack-card ${isSelected ? "is-selected" : ""}"
            data-arch-stack-node="${escHtml(nodeId)}"
            aria-pressed="${isSelected ? "true" : "false"}"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-indigo-400 inline-flex items-center justify-center shrink-0" aria-hidden="true">
                <i data-lucide="${escHtml(info.icon)}" class="w-4 h-4"></i>
              </span>
              <div class="min-w-0">
                <p class="text-sm font-bold text-[var(--text)]">${escHtml(info.title)}</p>
                <p class="text-xs font-mono-tech text-[var(--muted)] truncate">${escHtml(info.shortTech)}</p>
              </div>
            </div>
            <i data-lucide="arrow-right" class="w-4 h-4 text-[var(--muted)] shrink-0" aria-hidden="true"></i>
          </button>
        `;
      }).join("");

      mobileStackMount.innerHTML = `
        <div class="space-y-2">
          <p class="text-xs font-mono-tech font-bold text-cyan-400">Primary Request Flow</p>
          <div class="arch-mobile-stack">${primaryCards}</div>
        </div>

        <div class="space-y-2 pt-3 border-t border-[var(--border)]">
          <p class="text-xs font-mono-tech font-bold text-indigo-400">Cross-Cutting Infrastructure</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">${supportCards}</div>
        </div>
      `;

      mobileStackMount.querySelectorAll("[data-arch-stack-node]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-arch-stack-node");
          if (!id) return;
          activeNodeId = id;
          renderDiagram();
          renderMobileStack();
          renderInspector();
          if (inspectorMount && window.innerWidth < 1024) {
            inspectorMount.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });
      });

      refreshIcons();
    }

    function renderInspector() {
      if (!inspectorMount) return;
      const bp = getActiveBlueprint();
      const node = bp.nodes[activeNodeId] || bp.nodes.browser;
      if (!node) return;

      const rel = node.relatedProject || { title: bp.title, href: bp.href };

      inspectorMount.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-10 h-10 rounded-lg border border-cyan-500/35 bg-cyan-500/10 text-cyan-400 inline-flex items-center justify-center shrink-0" aria-hidden="true">
              <i data-lucide="${escHtml(node.icon)}" class="w-5 h-5"></i>
            </span>
            <div class="min-w-0">
              <p class="text-xs font-mono-tech text-cyan-400">${escHtml(bp.title)}</p>
              <h2 class="text-xl font-bold text-[var(--text)]">${escHtml(node.title)}</h2>
            </div>
          </div>
        </div>

        <div class="arch-detail-row">
          <h3 class="text-xs font-mono-tech font-bold text-indigo-400">Purpose</h3>
          <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(node.purpose)}</p>
        </div>

        <div class="arch-detail-row">
          <h3 class="text-xs font-mono-tech font-bold text-cyan-400">Technology</h3>
          <p class="text-sm font-mono-tech text-[var(--text)] leading-relaxed">${escHtml(node.technology)}</p>
        </div>

        <div class="arch-detail-row">
          <h3 class="text-xs font-mono-tech font-bold text-[var(--text)]">Responsibility</h3>
          <p class="text-sm text-[var(--muted)] leading-relaxed">${escHtml(node.responsibility)}</p>
        </div>

        <div class="arch-detail-row">
          <h3 class="text-xs font-mono-tech font-bold text-emerald-400">Related Project</h3>
          ${
            rel && rel.href
              ? `
                <a href="${escHtml(rel.href)}" class="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:underline w-fit">
                  <span>${escHtml(rel.title)}</span>
                  <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </a>
              `
              : `<p class="text-sm text-[var(--text)]">${escHtml((rel && rel.title) || bp.title)}</p>`
          }
        </div>
      `;

      refreshIcons();
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        activeProjId = architectures[0].id;
        activeNodeId = "browser";
        renderProjectBar();
        renderDiagram();
        renderMobileStack();
        renderInspector();
      });
    }

    renderProjectBar();
    renderDiagram();
    renderMobileStack();
    renderInspector();
  }

  window.PortfolioSystemArchitecture = {
    init,
    CORE_FLOW_ORDER,
    SUPPORT_ORDER,
    NODE_LAYOUT,
    DIAGRAM_EDGES,
    DEFAULT_ARCHITECTURES,
    getArchitectures,
    computeEdgePath
  };
})();
