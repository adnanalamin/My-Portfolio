/**
 * AL AMIN Portfolio — Phase 30: Performance Center
 * Displays verified workspace asset weights, live Browser Navigation/Resource Timing
 * telemetry (or "Measurement not configured." when unavailable), optimization checklist,
 * and synchronized Performance Mode + Reduced Motion Mode controls.
 */

(() => {
  const AUDIT_DATE = "2026-11-20";
  const AUDIT_METHOD = "Node.js Static Filesystem Byte Inspection (fs.statSync)";
  const NOT_CONFIGURED = "Measurement not configured.";

  // Grounded static inventory measured directly on 2026-11-20
  const DEFAULT_ASSET_INVENTORY = {
    auditDate: AUDIT_DATE,
    auditMethod: AUDIT_METHOD,
    categories: [
      {
        id: "images",
        label: "Images & Diagrams",
        fileCount: 24,
        totalKB: 7523.5,
        method: "24 local assets across project JPGs & blog/certificate SVGs (lazy-loaded below the fold)",
        highlights: [
          { name: "assets/images/blog/ai-engineering.jpg", kb: 899.9 },
          { name: "assets/images/projects/portfolio-system.jpg", kb: 692.1 },
          { name: "assets/images/projects/astrapulse.jpg", kb: 641.5 }
        ]
      },
      {
        id: "js",
        label: "JavaScript Modules",
        fileCount: 27,
        totalKB: 1007.6,
        method: "27 deferred modular Vanilla JS files loaded strictly per route (zero React/Vue runtime)",
        highlights: [
          { name: "js/projects.js", kb: 102.1 },
          { name: "js/architect.js", kb: 66.0 },
          { name: "js/main.js", kb: 48.3 }
        ]
      },
      {
        id: "html",
        label: "HTML Documents",
        fileCount: 26,
        totalKB: 275.5,
        method: "26 standalone static HTML5 pages (index.html: 30.6 KB uncompressed)",
        highlights: [
          { name: "index.html", kb: 30.6 },
          { name: "resume.html", kb: 12.1 },
          { name: "playground.html", kb: 11.4 }
        ]
      },
      {
        id: "css",
        label: "Stylesheets",
        fileCount: 15,
        totalKB: 180.4,
        method: "Core css/style.css (91.8 KB) + css/animations.css (5.7 KB) + page-scoped stylesheets",
        highlights: [
          { name: "css/style.css", kb: 91.8 },
          { name: "css/playground.css", kb: 10.9 },
          { name: "css/animations.css", kb: 5.7 }
        ]
      },
      {
        id: "icons",
        label: "App Icons",
        fileCount: 5,
        totalKB: 46.4,
        method: "Favicon SVG & PNG PWA manifest icon set",
        highlights: [
          { name: "assets/icons/pwa-512x512.png", kb: 21.8 },
          { name: "assets/icons/pwa-192x192.png", kb: 12.4 },
          { name: "assets/icons/favicon.svg", kb: 1.2 }
        ]
      }
    ]
  };

  // All 10 required sections from Phase 30 brief
  const DEFAULT_PERFORMANCE_SECTIONS = [
    {
      id: "page-weight",
      title: "Page weight",
      icon: "gauge",
      measuredValue: "index.html: 30.6 KB · Core shell CSS: 97.5 KB (uncompressed)",
      date: AUDIT_DATE,
      method: AUDIT_METHOD,
      status: "Measured",
      details:
        "Each route ships a compact semantic HTML file alongside shared style/component layers instead of a single monolithic bundle. External Lighthouse payload scores: Measurement not configured."
    },
    {
      id: "javascript",
      title: "JavaScript",
      icon: "file-code-2",
      measuredValue: "27 modular files · 1,007.6 KB total across all 26 routes (defer-loaded)",
      date: AUDIT_DATE,
      method: AUDIT_METHOD,
      status: "Measured",
      details:
        "Scripts use the HTML5 defer attribute and are loaded only on pages that need them (e.g., js/decisions.js loads only on decisions.html; js/build.js only on build.html), avoiding dead feature weight on initial load."
    },
    {
      id: "css",
      title: "CSS",
      icon: "palette",
      measuredValue: "15 stylesheets · 180.4 KB total (style.css: 91.8 KB, animations.css: 5.7 KB)",
      date: AUDIT_DATE,
      method: AUDIT_METHOD,
      status: "Measured",
      details:
        "Global custom properties drive dark, light, high-contrast, and print themes in a single design system paired with route-specific CSS files and Tailwind CDN utility classes."
    },
    {
      id: "images",
      title: "Images",
      icon: "image",
      measuredValue: "24 local assets · 7,523.5 KB (mix of lightweight SVGs and raster JPGs)",
      date: AUDIT_DATE,
      method: AUDIT_METHOD,
      status: "Measured",
      details:
        "Vector diagrams (blog & certificate graphics) ship as lightweight SVGs, while showcase cards define explicit aspect-ratio frames and fallback placeholders to eliminate cumulative layout shift."
    },
    {
      id: "fonts",
      title: "Fonts",
      icon: "type",
      measuredValue: "2 font families (Plus Jakarta Sans & JetBrains Mono) with preconnect + swap",
      date: AUDIT_DATE,
      method: "HTML <link rel='preconnect'> & display=swap inspection",
      status: "Verified",
      details:
        "Preconnect hints warm fonts.googleapis.com and fonts.gstatic.com early while display=swap renders readable fallback system typography immediately without blocking text visibility."
    },
    {
      id: "api-requests",
      title: "API requests",
      icon: "globe",
      measuredValue: "0 blocking external API requests on core routes · 15-min GitHub cache TTL",
      date: AUDIT_DATE,
      method: "js/config.js & js/github.js inspection",
      status: "Verified",
      details:
        "Portfolio copy and project showcases resolve synchronously from local JS data without network stalls. Live GitHub fetches only run on github.html/dashboard.html with localStorage 15-minute caching and rate-limit awareness."
    },
    {
      id: "lazy-loading",
      title: "Lazy loading",
      icon: "loader",
      measuredValue: "loading='lazy' enforced on secondary galleries, cards, updates & timeline media",
      date: AUDIT_DATE,
      method: "HTML & JS template attribute audit",
      status: "Verified",
      details:
        "Above-the-fold spotlight visuals prioritize eager loading while archive cards, timeline milestones, gallery tiles, and changelog screenshots defer decoding until scrolled near the viewport."
    },
    {
      id: "caching",
      title: "Caching",
      icon: "hard-drive",
      measuredValue: "sw.js (alamin-portfolio-shell-v2) network-first code + SWR media cache",
      date: AUDIT_DATE,
      method: "sw.js fetch & install handler inspection",
      status: "Verified",
      details:
        "Safe static service worker precaches the app shell, keeps HTML/CSS/JS fresh via network-first with offline.html fallback, applies stale-while-revalidate for static local images, and bypasses /api/* traffic."
    },
    {
      id: "animation-optimization",
      title: "Animation optimization",
      icon: "sparkles",
      measuredValue: "Compositor-only transform/opacity transitions + rAF scroll throttling",
      date: AUDIT_DATE,
      method: "css/animations.css & js/components.js inspection",
      status: "Verified",
      details:
        "Scroll reveal, hover elevation, and scroll progress bars animate compositor properties (transform & opacity) inside requestAnimationFrame loops instead of layout-triggering top/left/width geometry."
    },
    {
      id: "responsive-performance",
      title: "Responsive performance",
      icon: "smartphone",
      measuredValue: "320px–2560px responsive grids · Mobile simplified skills graph flow",
      date: AUDIT_DATE,
      method: "Multi-breakpoint CSS & js/skills-graph.js audit",
      status: "Verified",
      details:
        "Heavy interactive canvases like the Desktop SVG Skills Graph transform cleanly into lightweight linear card chains on narrow viewports (< 768px), avoiding cramped pan/zoom overhead on mobile phones."
    }
  ];

  const DEFAULT_OPTIMIZATION_CHECKLIST = [
    {
      id: "chk-defer",
      domain: "JavaScript",
      practice: "All page scripts load with defer attribute without blocking HTML parsing",
      state: "Verified"
    },
    {
      id: "chk-sw",
      domain: "Caching",
      practice: "Service Worker (sw.js) precaches shell & skips cross-origin/API calls cleanly",
      state: "Verified"
    },
    {
      id: "chk-lazy",
      domain: "Images",
      practice: "Below-the-fold media uses loading='lazy' and fallback SVG error handlers",
      state: "Verified"
    },
    {
      id: "chk-fonts",
      domain: "Fonts",
      practice: "Google Fonts paired with rel='preconnect' and display=swap",
      state: "Verified"
    },
    {
      id: "chk-gpu",
      domain: "Animations",
      practice: "Reduced Motion & Performance Mode CSS classes disable heavy blurs and transitions",
      state: "Verified"
    },
    {
      id: "chk-lighthouse",
      domain: "Lab Audit",
      practice: "Automated external Google Lighthouse CI lab run across all 26 routes",
      state: NOT_CONFIGURED
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

  function getPerformanceConfig() {
    const cfg = (window.portfolioConfig && window.portfolioConfig.performanceCenter) || null;
    return {
      sections:
        cfg && Array.isArray(cfg.sections) && cfg.sections.length > 0
          ? cfg.sections
          : DEFAULT_PERFORMANCE_SECTIONS,
      inventory:
        cfg && cfg.inventory && Array.isArray(cfg.inventory.categories)
          ? cfg.inventory
          : DEFAULT_ASSET_INVENTORY,
      checklist:
        cfg && Array.isArray(cfg.checklist) && cfg.checklist.length > 0
          ? cfg.checklist
          : DEFAULT_OPTIMIZATION_CHECKLIST,
      externalMetrics: (cfg && cfg.externalMetrics) || null
    };
  }

  function readRuntimeTelemetry() {
    const today = new Date().toISOString().slice(0, 10);
    if (typeof window === "undefined" || !window.performance) {
      return {
        available: false,
        date: today,
        method: "Browser Performance API",
        domReadyMs: NOT_CONFIGURED,
        loadCompleteMs: NOT_CONFIGURED,
        resourceCount: NOT_CONFIGURED,
        transferLabel: NOT_CONFIGURED,
        resources: []
      };
    }

    const navEntries =
      typeof window.performance.getEntriesByType === "function"
        ? window.performance.getEntriesByType("navigation")
        : [];
    const resEntries =
      typeof window.performance.getEntriesByType === "function"
        ? window.performance.getEntriesByType("resource")
        : [];

    const nav = navEntries && navEntries[0] ? navEntries[0] : null;
    const domReadyVal =
      nav && typeof nav.domContentLoadedEventEnd === "number" && nav.domContentLoadedEventEnd > 0
        ? `${Math.round(nav.domContentLoadedEventEnd)} ms`
        : NOT_CONFIGURED;
    const loadCompleteVal =
      nav && typeof nav.loadEventEnd === "number" && nav.loadEventEnd > 0
        ? `${Math.round(nav.loadEventEnd)} ms`
        : NOT_CONFIGURED;

    let measuredBytes = 0;
    if (nav && typeof nav.transferSize === "number" && nav.transferSize > 0) {
      measuredBytes += nav.transferSize;
    }
    resEntries.forEach((r) => {
      if (typeof r.transferSize === "number" && r.transferSize > 0) {
        measuredBytes += r.transferSize;
      }
    });

    const mappedResources = resEntries.slice(0, 18).map((r) => {
      let shortName = r.name || "resource";
      try {
        const u = new URL(r.name, window.location.href);
        shortName = u.origin === window.location.origin ? u.pathname : `${u.hostname}${u.pathname}`;
      } catch (_err) {
        // Keep original string
      }
      return {
        name: shortName,
        type: r.initiatorType || "other",
        duration: typeof r.duration === "number" && r.duration > 0 ? `${Math.round(r.duration)} ms` : "0 ms",
        size:
          typeof r.transferSize === "number" && r.transferSize > 0
            ? `${(r.transferSize / 1024).toFixed(1)} KB`
            : "Cross-origin / Cached"
      };
    });

    return {
      available: Boolean(nav || resEntries.length),
      date: today,
      method: "Live Browser PerformanceNavigationTiming & ResourceTiming API",
      domReadyMs: domReadyVal,
      loadCompleteMs: loadCompleteVal,
      resourceCount: resEntries.length ? `${resEntries.length} loaded on this route` : NOT_CONFIGURED,
      transferLabel: measuredBytes > 0 ? `${(measuredBytes / 1024).toFixed(1)} KB` : NOT_CONFIGURED,
      resources: mappedResources
    };
  }

  function init() {
    const root = document.getElementById("performance-center-root");
    if (!root) return;

    const { sections, inventory, checklist, externalMetrics } = getPerformanceConfig();
    let activeAssetCategory = "All";

    const kpiMount = document.getElementById("perf-kpi-grid");
    const perfToggleBtn = document.getElementById("perf-mode-toggle");
    const motionToggleBtn = document.getElementById("perf-reduced-motion-toggle");
    const perfStateText = document.getElementById("perf-mode-state-label");
    const motionStateText = document.getElementById("perf-motion-state-label");
    const refreshTelemetryBtn = document.getElementById("perf-refresh-telemetry");
    const assetTabsMount = document.getElementById("perf-asset-tabs");
    const assetBarsMount = document.getElementById("perf-asset-overview");
    const sectionsGridMount = document.getElementById("perf-sections-grid");
    const checklistMount = document.getElementById("perf-checklist-list");
    const resourcesBodyMount = document.getElementById("perf-runtime-resources-body");
    const telemetryMetaMount = document.getElementById("perf-telemetry-meta");

    function renderRuntimeKPIs() {
      const rt = readRuntimeTelemetry();
      const labScore =
        externalMetrics && externalMetrics.lighthouseScore
          ? `${externalMetrics.lighthouseScore}`
          : NOT_CONFIGURED;
      const labDate = (externalMetrics && externalMetrics.date) || "Not scheduled";
      const labMethod = (externalMetrics && externalMetrics.method) || "Configured external Lighthouse report";

      if (telemetryMetaMount) {
        telemetryMetaMount.textContent = `Measured: ${rt.date} · Method: ${rt.method}`;
      }

      if (kpiMount) {
        const cards = [
          {
            label: "DOM Content Loaded",
            value: rt.domReadyMs,
            sub: `Measured ${rt.date} · NavigationTiming`,
            icon: "zap"
          },
          {
            label: "Measured Page Transfer",
            value: rt.transferLabel,
            sub: `Resources observed: ${rt.resourceCount}`,
            icon: "activity"
          },
          {
            label: "Repo CSS + HTML Shell",
            value: "455.9 KB",
            sub: `26 HTML (275.5 KB) + 15 CSS (180.4 KB) · ${inventory.auditDate}`,
            icon: "layers"
          },
          {
            label: "External Lab Score (Lighthouse)",
            value: labScore,
            sub: labScore === NOT_CONFIGURED ? "No fabricated lab scores shown" : `${labDate} · ${labMethod}`,
            icon: "shield-check"
          }
        ];

        kpiMount.innerHTML = cards
          .map(
            (c) => `
            <div class="perf-kpi-card">
              <div class="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                <span>${escHtml(c.label)}</span>
                <i data-lucide="${escHtml(c.icon)}" class="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true"></i>
              </div>
              <p class="text-lg sm:text-xl font-extrabold font-mono-tech tabular-nums text-[var(--text)]">${escHtml(c.value)}</p>
              <p class="text-[11px] text-[var(--muted)] leading-snug">${escHtml(c.sub)}</p>
            </div>
          `
          )
          .join("");
      }

      if (resourcesBodyMount) {
        if (!rt.resources.length) {
          resourcesBodyMount.innerHTML = `
            <tr>
              <td colspan="4" class="text-center text-[var(--muted)] py-6">${escHtml(NOT_CONFIGURED)}</td>
            </tr>
          `;
        } else {
          resourcesBodyMount.innerHTML = rt.resources
            .map(
              (r) => `
              <tr>
                <td class="font-mono-tech text-[var(--text)] max-w-[260px] truncate" title="${escHtml(r.name)}">${escHtml(r.name)}</td>
                <td class="text-[var(--text-secondary)]">${escHtml(r.type)}</td>
                <td class="font-mono-tech tabular-nums text-cyan-400">${escHtml(r.duration)}</td>
                <td class="font-mono-tech tabular-nums text-[var(--muted)]">${escHtml(r.size)}</td>
              </tr>
            `
            )
            .join("");
        }
      }

      refreshIcons();
    }

    function syncModeSwitches() {
      const hasThemeMgr = window.PortfolioTheme && typeof window.PortfolioTheme.getSavedPrefs === "function";
      const prefs = hasThemeMgr
        ? window.PortfolioTheme.getSavedPrefs()
        : { perfMode: false, reduceMotion: null };
      const osReduced = hasThemeMgr && window.PortfolioTheme.osPrefersReducedMotion();
      const effectiveReduced =
        prefs.reduceMotion === null ? osReduced : Boolean(prefs.reduceMotion);

      if (perfToggleBtn) {
        perfToggleBtn.setAttribute("aria-checked", String(Boolean(prefs.perfMode)));
      }
      if (perfStateText) {
        perfStateText.textContent = prefs.perfMode ? "Enabled (Low-Overhead Mode Active)" : "Standard Visual Quality";
      }

      if (motionToggleBtn) {
        motionToggleBtn.setAttribute("aria-checked", String(effectiveReduced));
      }
      if (motionStateText) {
        motionStateText.textContent =
          osReduced && prefs.reduceMotion === null
            ? "Following OS Reduced Motion (Active)"
            : effectiveReduced
            ? "Reduced Motion Enabled"
            : "Standard Motion Active";
      }
    }

    function bindModeSwitches() {
      if (perfToggleBtn) {
        perfToggleBtn.addEventListener("click", () => {
          if (!window.PortfolioTheme) return;
          const cur = window.PortfolioTheme.getSavedPrefs();
          const nextVal = !cur.perfMode;
          window.PortfolioTheme.saveAndApplyPrefs({ ...cur, perfMode: nextVal });
          syncModeSwitches();
          if (typeof window.showToast === "function") {
            window.showToast(
              nextVal ? "Performance Mode enabled" : "Performance Mode disabled",
              "info"
            );
          }
        });
      }

      if (motionToggleBtn) {
        motionToggleBtn.addEventListener("click", () => {
          if (!window.PortfolioTheme) return;
          const cur = window.PortfolioTheme.getSavedPrefs();
          const osReduced = window.PortfolioTheme.osPrefersReducedMotion();
          const effective = cur.reduceMotion === null ? osReduced : Boolean(cur.reduceMotion);
          const nextVal = !effective;
          window.PortfolioTheme.saveAndApplyPrefs({ ...cur, reduceMotion: nextVal });
          syncModeSwitches();
          if (typeof window.showToast === "function") {
            window.showToast(
              nextVal ? "Reduced Motion Mode enabled" : "Reduced Motion Mode disabled",
              "info"
            );
          }
        });
      }

      window.addEventListener("portfolio:prefs-changed", syncModeSwitches);
    }

    function renderAssetOverview() {
      const cats = inventory.categories || [];
      const tabNames = ["All", ...cats.map((c) => c.label)];

      if (assetTabsMount) {
        assetTabsMount.innerHTML = tabNames
          .map((label) => {
            const isActive = activeAssetCategory === label;
            return `
              <button
                type="button"
                class="perf-tab-btn ${isActive ? "is-active" : ""}"
                data-perf-asset-tab="${escHtml(label)}"
                aria-pressed="${isActive ? "true" : "false"}"
              >
                ${escHtml(label)}
              </button>
            `;
          })
          .join("");

        assetTabsMount.querySelectorAll("[data-perf-asset-tab]").forEach((btn) => {
          btn.addEventListener("click", () => {
            activeAssetCategory = btn.getAttribute("data-perf-asset-tab") || "All";
            renderAssetOverview();
          });
        });
      }

      if (assetBarsMount) {
        const totalRepoKB = cats.reduce((acc, c) => acc + Number(c.totalKB || 0), 0) || 1;
        const visibleCats =
          activeAssetCategory === "All"
            ? cats
            : cats.filter((c) => c.label === activeAssetCategory);

        assetBarsMount.innerHTML = visibleCats
          .map((cat) => {
            const pct = Math.min(100, Math.max(1, (cat.totalKB / totalRepoKB) * 100));
            const topFilesHtml = (cat.highlights || [])
              .map(
                (h) => `
                <li class="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                  <span class="font-mono-tech truncate">${escHtml(h.name)}</span>
                  <span class="font-mono-tech tabular-nums text-[var(--muted)] shrink-0">${escHtml(String(h.kb))} KB</span>
                </li>
              `
              )
              .join("");

            return `
              <article class="perf-card p-5 space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="space-y-0.5">
                    <h3 class="text-base sm:text-lg font-bold text-[var(--text)]">${escHtml(cat.label)}</h3>
                    <p class="text-xs text-[var(--muted)]">${escHtml(cat.method)}</p>
                  </div>
                  <div class="text-right font-mono-tech tabular-nums">
                    <p class="text-base font-extrabold text-cyan-400">${escHtml(String(cat.totalKB))} KB</p>
                    <p class="text-[11px] text-[var(--muted)]">${escHtml(String(cat.fileCount))} files · ${pct.toFixed(1)}%</p>
                  </div>
                </div>

                <div class="perf-meter-track" aria-hidden="true">
                  <div class="perf-meter-fill" style="transform: scaleX(${pct / 100});"></div>
                </div>

                <ul class="space-y-1.5 list-none p-0 m-0 pt-1 border-t border-[var(--border)]">
                  ${topFilesHtml}
                </ul>
              </article>
            `;
          })
          .join("");
      }
    }

    function renderSections() {
      if (!sectionsGridMount) return;
      sectionsGridMount.innerHTML = sections
        .map(
          (sec) => `
          <article class="perf-card p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div class="space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="perf-icon-box" aria-hidden="true">
                    <i data-lucide="${escHtml(sec.icon)}" class="w-4 h-4"></i>
                  </span>
                  <div class="min-w-0">
                    <h3 class="text-base sm:text-lg font-bold text-[var(--text)]">${escHtml(sec.title)}</h3>
                    <p class="text-[11px] font-mono-tech text-[var(--muted)] tabular-nums">${escHtml(sec.date)}</p>
                  </div>
                </div>
                <span class="text-xs font-mono-tech font-bold text-cyan-400 shrink-0">${escHtml(sec.status)}</span>
              </div>

              <div class="space-y-1">
                <p class="text-xs font-semibold text-indigo-400">Measured Value</p>
                <p class="text-sm font-mono-tech font-semibold text-[var(--text)] tabular-nums">${escHtml(sec.measuredValue)}</p>
              </div>

              <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escHtml(sec.details)}</p>
            </div>

            <p class="pt-3 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
              <span class="font-semibold text-[var(--text-secondary)]">Method:</span> ${escHtml(sec.method)}
            </p>
          </article>
        `
        )
        .join("");
    }

    function renderChecklist() {
      if (!checklistMount) return;
      checklistMount.innerHTML = checklist
        .map((row) => {
          const isMissing = row.state === NOT_CONFIGURED;
          return `
            <div class="perf-check-row">
              <div class="space-y-0.5 min-w-0">
                <p class="text-xs font-mono-tech text-cyan-400">${escHtml(row.domain)}</p>
                <p class="text-xs sm:text-sm font-medium text-[var(--text)]">${escHtml(row.practice)}</p>
              </div>
              <span class="inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold shrink-0 ${
                isMissing ? "text-amber-400" : "text-emerald-400"
              }">
                <i data-lucide="${isMissing ? "clock" : "check-circle-2"}" class="w-3.5 h-3.5" aria-hidden="true"></i>
                <span>${escHtml(row.state)}</span>
              </span>
            </div>
          `;
        })
        .join("");
    }

    if (refreshTelemetryBtn) {
      refreshTelemetryBtn.addEventListener("click", () => {
        renderRuntimeKPIs();
        if (typeof window.showToast === "function") {
          window.showToast("Refreshed browser NavigationTiming snapshot", "info");
        }
      });
    }

    bindModeSwitches();
    syncModeSwitches();
    renderRuntimeKPIs();
    renderAssetOverview();
    renderSections();
    renderChecklist();
    refreshIcons();
  }

  window.PortfolioPerformance = {
    init,
    NOT_CONFIGURED,
    DEFAULT_ASSET_INVENTORY,
    DEFAULT_PERFORMANCE_SECTIONS,
    DEFAULT_OPTIMIZATION_CHECKLIST,
    getPerformanceConfig,
    readRuntimeTelemetry
  };
})();
