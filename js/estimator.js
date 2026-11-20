/**
 * AL AMIN Portfolio — Phase 23: Project Scope & Cost Estimator
 * Configurable client-side scope & estimation engine with live updates,
 * export utilities, print styling, and contact quote integration.
 */

(() => {
  /**
   * Configurable Pricing & Scope Estimation Engine
   * Adjust base prices, option add-ons, complexity points, and timeline days cleanly here.
   * All monetary outputs are displayed strictly as non-binding ranges ("Estimated project scope").
   */
  const ESTIMATOR_PRICING_CONFIG = {
    currencySymbol: "$",
    rangeSpreadFactor: 0.22, // Produces clean min/max range (+/- ~11% around midpoint)
    hourlyEffortWeeksDivisor: 30, // Used internally to suggest realistic delivery windows
    requiredHeadline: "Estimated project scope",
    requiredDisclaimer: "Final pricing depends on project requirements.",

    dimensions: {
      websiteType: {
        label: "Website Type",
        icon: "layout",
        group: "foundation",
        options: {
          "landing-portfolio": { label: "Landing Page / Personal Brand", cost: 350, days: 5, points: 2 },
          "business-site": { label: "Company / Agency Website", cost: 650, days: 9, points: 4 },
          "ecommerce": { label: "E-Commerce Storefront", cost: 1350, days: 18, points: 8 },
          "saas-app": { label: "SaaS Web Application", cost: 1800, days: 24, points: 10 },
          "custom-portal": { label: "EdTech / Community / Client Portal", cost: 1550, days: 20, points: 9 },
          "api-platform": { label: "Headless API & Dashboard System", cost: 1450, days: 17, points: 8 }
        }
      },
      pageCount: {
        label: "Number of Pages",
        icon: "layers",
        group: "foundation",
        options: {
          "1-5": { label: "1–5 Pages (Focused Launch)", cost: 0, days: 2, points: 1 },
          "6-12": { label: "6–12 Pages (Standard Multi-Page)", cost: 300, days: 5, points: 3 },
          "13-25": { label: "13–25 Pages (Multi-Section Platform)", cost: 650, days: 9, points: 5 },
          "25-plus": { label: "25+ Dynamic Views & Templates", cost: 1100, days: 14, points: 7 }
        }
      },
      responsiveDesign: {
        label: "Responsive Design",
        icon: "smartphone",
        group: "foundation",
        options: {
          "standard-fluid": { label: "Full Responsive (320px–2560px)", cost: 150, days: 2, points: 1 },
          "design-system-dark-light": { label: "Responsive + Dark/Light Design System", cost: 320, days: 4, points: 3 },
          "pwa-offline": { label: "Responsive + Installable PWA Shell", cost: 520, days: 6, points: 4 }
        }
      },
      authentication: {
        label: "Authentication",
        icon: "lock",
        group: "backend",
        options: {
          "none": { label: "None (Public Access Only)", cost: 0, days: 0, points: 0 },
          "email-password": { label: "Email & Password Sessions", cost: 280, days: 3, points: 3 },
          "oauth-jwt": { label: "OAuth (Google/GitHub) + JWT", cost: 480, days: 5, points: 5 },
          "rbac-sso": { label: "Multi-Role RBAC + Team Permissions", cost: 780, days: 8, points: 7 }
        }
      },
      adminDashboard: {
        label: "Admin Dashboard",
        icon: "sliders-horizontal",
        group: "backend",
        options: {
          "none": { label: "None Required", cost: 0, days: 0, points: 0 },
          "basic-cms": { label: "Basic Content & Inquiry Manager", cost: 380, days: 4, points: 3 },
          "full-crud-analytics": { label: "Full CRUD, Moderation & Metrics Console", cost: 850, days: 9, points: 7 }
        }
      },
      database: {
        label: "Database",
        icon: "database",
        group: "backend",
        options: {
          "none": { label: "None (Static JSON / Content)", cost: 0, days: 0, points: 0 },
          "mongodb": { label: "MongoDB + Mongoose Schemas", cost: 300, days: 3, points: 3 },
          "postgresql": { label: "PostgreSQL Relational Schema (ORM)", cost: 420, days: 4, points: 4 },
          "multi-tier-cache": { label: "PostgreSQL + Redis Cache Layer", cost: 680, days: 7, points: 6 }
        }
      },
      api: {
        label: "API",
        icon: "server",
        group: "backend",
        options: {
          "none": { label: "None (Static Only)", cost: 0, days: 0, points: 0 },
          "rest-core": { label: "Standard REST API Endpoints", cost: 340, days: 4, points: 3 },
          "rest-webhooks": { label: "Versioned REST + 3rd-Party Webhooks", cost: 580, days: 6, points: 5 },
          "realtime-ws": { label: "REST API + Real-Time WebSockets", cost: 890, days: 9, points: 7 }
        }
      },
      paymentGateway: {
        label: "Payment Gateway",
        icon: "credit-card",
        group: "features",
        options: {
          "none": { label: "None Required", cost: 0, days: 0, points: 0 },
          "one-time": { label: "One-Time Checkout Integration", cost: 380, days: 4, points: 4 },
          "subscriptions": { label: "Recurring Subscriptions & Webhooks", cost: 650, days: 6, points: 6 },
          "marketplace-split": { label: "Marketplace Split Payouts", cost: 980, days: 9, points: 8 }
        }
      },
      search: {
        label: "Search",
        icon: "search",
        group: "features",
        options: {
          "none": { label: "None Required", cost: 0, days: 0, points: 0 },
          "keyword-basic": { label: "Instant Client/API Keyword Search", cost: 180, days: 2, points: 2 },
          "indexed-fulltext": { label: "Indexed Full-Text & Highlight Search", cost: 420, days: 4, points: 4 }
        }
      },
      filters: {
        label: "Filters",
        icon: "sliders-horizontal",
        group: "features",
        options: {
          "none": { label: "None Required", cost: 0, days: 0, points: 0 },
          "category-tabs": { label: "Category Tabs & Sort Controls", cost: 140, days: 2, points: 1 },
          "multi-facet-url": { label: "Multi-Faceted Filters + URL Sync", cost: 320, days: 3, points: 3 }
        }
      },
      notifications: {
        label: "Notifications",
        icon: "bell",
        group: "features",
        options: {
          "none": { label: "None Required", cost: 0, days: 0, points: 0 },
          "transactional-email": { label: "Transactional Email Alerts", cost: 220, days: 2, points: 2 },
          "in-app-push-email": { label: "In-App Bell Feed + Email + Alerts", cost: 480, days: 5, points: 4 }
        }
      },
      aiFeatures: {
        label: "AI Features",
        icon: "cpu",
        group: "features",
        options: {
          "none": { label: "None Required", cost: 0, days: 0, points: 0 },
          "rule-recommendations": { label: "Smart Rule-Based Recommendations", cost: 260, days: 3, points: 2 },
          "assistant-proxy": { label: "Server-Proxied Chat / Summarizer", cost: 680, days: 7, points: 6 },
          "workflow-automation": { label: "Document Parsing & AI Workflow Proxy", cost: 960, days: 9, points: 8 }
        }
      },
      analytics: {
        label: "Analytics",
        icon: "bar-chart-2",
        group: "operations",
        options: {
          "none": { label: "None Required", cost: 0, days: 0, points: 0 },
          "privacy-events": { label: "Lightweight Page & Conversion Events", cost: 180, days: 2, points: 2 },
          "custom-kpi-dashboard": { label: "Custom Event Pipeline & KPI Charts", cost: 460, days: 5, points: 4 }
        }
      },
      deployment: {
        label: "Deployment",
        icon: "cloud",
        group: "operations",
        options: {
          "static-edge": { label: "Edge CDN Hosting (Vercel / Cloudflare)", cost: 120, days: 1, points: 1 },
          "fullstack-cicd": { label: "Full-Stack Cloud + Automated CI/CD", cost: 320, days: 3, points: 3 },
          "staging-prod-ops": { label: "Staging + Production + Monitoring Setup", cost: 580, days: 5, points: 5 }
        }
      },
      maintenance: {
        label: "Maintenance",
        icon: "wrench",
        group: "operations",
        options: {
          "handover": { label: "Clean Code Handover (Self-Managed)", cost: 0, days: 0, points: 0 },
          "launch-care-30d": { label: "30-Day Post-Launch Care & Fixes", cost: 240, days: 0, points: 1 },
          "ongoing-retainer": { label: "Ongoing Updates & Performance Care Plan", cost: 520, days: 0, points: 2 }
        }
      }
    }
  };

  const DEFAULT_STATE = {
    websiteType: "business-site",
    pageCount: "6-12",
    responsiveDesign: "design-system-dark-light",
    authentication: "email-password",
    adminDashboard: "basic-cms",
    database: "mongodb",
    api: "rest-core",
    paymentGateway: "none",
    search: "keyword-basic",
    filters: "category-tabs",
    notifications: "transactional-email",
    aiFeatures: "none",
    analytics: "privacy-events",
    deployment: "fullstack-cicd",
    maintenance: "launch-care-30d"
  };

  const PRESETS = [
    {
      id: "starter-presence",
      label: "Lean Brand Website",
      state: {
        ...DEFAULT_STATE,
        websiteType: "landing-portfolio",
        pageCount: "1-5",
        responsiveDesign: "standard-fluid",
        authentication: "none",
        adminDashboard: "none",
        database: "none",
        api: "none",
        paymentGateway: "none",
        search: "none",
        filters: "category-tabs",
        notifications: "transactional-email",
        aiFeatures: "none",
        analytics: "privacy-events",
        deployment: "static-edge",
        maintenance: "handover"
      }
    },
    {
      id: "ecommerce-growth",
      label: "Full-Stack E-Commerce",
      state: {
        ...DEFAULT_STATE,
        websiteType: "ecommerce",
        pageCount: "13-25",
        responsiveDesign: "pwa-offline",
        authentication: "oauth-jwt",
        adminDashboard: "full-crud-analytics",
        database: "postgresql",
        api: "rest-webhooks",
        paymentGateway: "one-time",
        search: "indexed-fulltext",
        filters: "multi-facet-url",
        notifications: "transactional-email",
        aiFeatures: "rule-recommendations",
        analytics: "custom-kpi-dashboard",
        deployment: "fullstack-cicd",
        maintenance: "launch-care-30d"
      }
    },
    {
      id: "saas-platform",
      label: "Multi-Tenant SaaS MVP",
      state: {
        ...DEFAULT_STATE,
        websiteType: "saas-app",
        pageCount: "13-25",
        responsiveDesign: "design-system-dark-light",
        authentication: "rbac-sso",
        adminDashboard: "full-crud-analytics",
        database: "multi-tier-cache",
        api: "realtime-ws",
        paymentGateway: "subscriptions",
        search: "indexed-fulltext",
        filters: "multi-facet-url",
        notifications: "in-app-push-email",
        aiFeatures: "assistant-proxy",
        analytics: "custom-kpi-dashboard",
        deployment: "staging-prod-ops",
        maintenance: "ongoing-retainer"
      }
    }
  ];

  const GROUPS = [
    {
      id: "foundation",
      step: "01",
      title: "Foundation & Responsive Scope",
      subtitle: "Core site structure, page count, and responsive device coverage."
    },
    {
      id: "backend",
      step: "02",
      title: "Authentication, Admin & Data Layer",
      subtitle: "User accounts, operational dashboards, database modeling, and APIs."
    },
    {
      id: "features",
      step: "03",
      title: "Interactive Capabilities & Integrations",
      subtitle: "Payments, search, filtering, notifications, and optional server-proxied AI."
    },
    {
      id: "operations",
      step: "04",
      title: "Analytics, Deployment & Maintenance",
      subtitle: "Telemetry visibility, cloud release pipeline, and post-launch care."
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

  function getMergedPricingConfig() {
    const custom = (window.portfolioConfig && window.portfolioConfig.estimator) || {};
    return {
      ...ESTIMATOR_PRICING_CONFIG,
      ...custom,
      dimensions: ESTIMATOR_PRICING_CONFIG.dimensions
    };
  }

  function roundToNearest50(val) {
    return Math.max(100, Math.round(val / 50) * 50);
  }

  function formatCurrency(val, symbol = "$") {
    return `${symbol}${Number(val).toLocaleString("en-US")}`;
  }

  function calculateEstimate(rawState) {
    const cfg = getMergedPricingConfig();
    const state = { ...DEFAULT_STATE, ...(rawState || {}) };

    let totalBaseCost = 0;
    let totalDays = 0;
    let complexityPoints = 0;
    const selectedFeatures = [];

    Object.keys(cfg.dimensions).forEach((dimKey) => {
      const dim = cfg.dimensions[dimKey];
      const selectedKey = state[dimKey];
      const opt = dim.options[selectedKey] || Object.values(dim.options)[0];

      totalBaseCost += opt.cost;
      totalDays += opt.days;
      complexityPoints += opt.points;

      const isActiveFeature = selectedKey !== "none" && selectedKey !== "handover";
      selectedFeatures.push({
        key: dimKey,
        category: dim.label,
        valueKey: selectedKey,
        valueLabel: opt.label,
        isActive: isActiveFeature,
        points: opt.points
      });
    });

    // Calculate estimated range (+/- spread around midpoint)
    const halfSpread = cfg.rangeSpreadFactor / 2;
    const minEstimate = roundToNearest50(totalBaseCost * (1 - halfSpread));
    const maxEstimate = roundToNearest50(totalBaseCost * (1 + halfSpread));

    // Determine Complexity Classification
    let complexityLabel = "Low · Focused Scope";
    let complexityDescription = "Streamlined architecture ideal for rapid validation and clean deployment.";
    if (complexityPoints >= 46) {
      complexityLabel = "Enterprise · Multi-System";
      complexityDescription = "High-assurance multi-layer system with advanced auth, scale caching, and integrations.";
    } else if (complexityPoints >= 28) {
      complexityLabel = "High · Full-Stack System";
      complexityDescription = "Comprehensive product engineering covering relational/API orchestration and admin controls.";
    } else if (complexityPoints >= 14) {
      complexityLabel = "Moderate · Modular Full-Stack";
      complexityDescription = "Balanced web application combining custom UI architecture with structured data and workflows.";
    }

    // Determine Suggested Timeline Range
    const minWeeks = Math.max(1, Math.floor(totalDays / 5));
    const maxWeeks = Math.max(minWeeks + 1, Math.ceil((totalDays * 1.25) / 5));
    const timelineLabel = `${minWeeks} – ${maxWeeks} Weeks`;

    // Determine Recommended Technology Stack from choices
    const techSet = [];
    if (state.websiteType === "landing-portfolio" && state.database === "none" && state.authentication === "none") {
      techSet.push("HTML5 / Tailwind CSS / Modular JavaScript");
    } else if (state.websiteType === "ecommerce" || state.websiteType === "business-site" || state.websiteType === "custom-portal") {
      techSet.push("Next.js (React) + TypeScript + Tailwind CSS");
    } else {
      techSet.push("React + TypeScript + Tailwind CSS");
    }

    if (state.responsiveDesign === "pwa-offline") {
      techSet.push("Service Worker & Web App Manifest (PWA)");
    }

    if (state.api !== "none" || state.authentication !== "none" || state.paymentGateway !== "none") {
      techSet.push(state.api === "realtime-ws" ? "Node.js + Express + WebSockets" : "Node.js + Express REST API");
    }

    if (state.database === "mongodb") {
      techSet.push("MongoDB + Mongoose");
    } else if (state.database === "postgresql") {
      techSet.push("PostgreSQL + Drizzle/Prisma");
    } else if (state.database === "multi-tier-cache") {
      techSet.push("PostgreSQL + Redis Cache");
    }

    if (state.paymentGateway !== "none") {
      techSet.push("Stripe Checkout & Webhook Handlers");
    }
    if (state.aiFeatures === "assistant-proxy" || state.aiFeatures === "workflow-automation") {
      techSet.push("Server-Proxied AI API Route (Secrets Server-Side)");
    }

    if (state.deployment === "static-edge") {
      techSet.push("Vercel / Cloudflare Edge CDN");
    } else {
      techSet.push("Managed Cloud Hosting + GitHub Actions CI/CD");
    }

    const activeSelections = selectedFeatures.filter((item) => item.isActive);
    const scopeSummary =
      `This ${complexityLabel.toLowerCase()} ${cfg.dimensions.websiteType.options[state.websiteType].label.toLowerCase()} encompasses ` +
      `${cfg.dimensions.pageCount.options[state.pageCount].label.toLowerCase()} with ${cfg.dimensions.responsiveDesign.options[state.responsiveDesign].label.toLowerCase()}. ` +
      `It includes ${activeSelections.length} active technical modules spanning ${techSet.slice(0, 3).join(", ")}, ` +
      `targeting an estimated ${timelineLabel} delivery schedule. Final pricing depends on project requirements.`;

    return {
      headline: cfg.requiredHeadline,
      disclaimer: cfg.requiredDisclaimer,
      currencySymbol: cfg.currencySymbol,
      minEstimate,
      maxEstimate,
      formattedRange: `${formatCurrency(minEstimate, cfg.currencySymbol)} – ${formatCurrency(maxEstimate, cfg.currencySymbol)}`,
      complexityLabel,
      complexityPoints,
      complexityDescription,
      timelineLabel,
      totalDays,
      recommendedTech: techSet,
      selectedFeatures,
      activeCount: activeSelections.length,
      scopeSummary,
      state
    };
  }

  function buildTextSummary(estimate) {
    const lines = [
      `PROJECT SCOPE SUMMARY — AL AMIN PORTFOLIO`,
      `Notice: ${estimate.headline}. ${estimate.disclaimer}`,
      ``,
      `Estimated Development Range: ${estimate.formattedRange}`,
      `Estimated Complexity: ${estimate.complexityLabel} (${estimate.complexityPoints} scope points)`,
      `Suggested Timeline: ${estimate.timelineLabel}`,
      ``,
      `Recommended Technology:`,
      ...estimate.recommendedTech.map((t) => `- ${t}`),
      ``,
      `Selected Configuration:`,
      ...estimate.selectedFeatures.map((item) => `- ${item.category}: ${item.valueLabel}`),
      ``,
      `Project Scope Overview:`,
      estimate.scopeSummary,
      ``,
      `Disclaimer: ${estimate.disclaimer}`
    ];
    return lines.join("\n");
  }

  function saveContactDraft(estimate, intent) {
    const draft = {
      intent,
      subject:
        intent === "quote"
          ? `Project Quote Request: ${estimate.selectedFeatures[0].valueLabel} (${estimate.formattedRange})`
          : `Start Project: ${estimate.selectedFeatures[0].valueLabel}`,
      message:
        `Hello AL AMIN,\n\nI used the Project Scope Estimator and would like to ${
          intent === "quote" ? "request a detailed project quote" : "start a project discussion"
        }.\n\n` +
        `--- ${estimate.headline} ---\n` +
        `Estimated Range: ${estimate.formattedRange}\n` +
        `Complexity: ${estimate.complexityLabel}\n` +
        `Suggested Timeline: ${estimate.timelineLabel}\n` +
        `Recommended Stack: ${estimate.recommendedTech.join(", ")}\n\n` +
        `Selected Modules:\n` +
        estimate.selectedFeatures
          .filter((f) => f.isActive)
          .map((f) => `- ${f.category}: ${f.valueLabel}`)
          .join("\n") +
        `\n\n(Note: ${estimate.disclaimer})\n\nAdditional details about my timeline & goals:\n`
    };

    try {
      window.sessionStorage.setItem("portfolio_quote_draft", JSON.stringify(draft));
    } catch (_err) {
      // Ignore storage failures in restricted contexts
    }
    return draft;
  }

  function downloadSummaryFile(estimate) {
    const slug = (estimate.state.websiteType || "project-scope").replace(/[^a-z0-9-]+/gi, "-");
    const blob = new Blob([buildTextSummary(estimate)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `alamin-${slug}-estimated-scope.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function init() {
    const root = document.getElementById("estimator-root");
    if (!root) return;

    const cfg = getMergedPricingConfig();
    let state = { ...DEFAULT_STATE };
    let activePresetId = "";

    const presetsMount = document.getElementById("est-presets-bar");
    const groupsMount = document.getElementById("est-groups-mount");
    const summaryMount = document.getElementById("est-summary-mount");
    const resetBtn = document.getElementById("est-reset-btn");

    function renderPresets() {
      if (!presetsMount) return;
      presetsMount.innerHTML = PRESETS.map((preset) => {
        const isActive = activePresetId === preset.id;
        return `
          <button
            type="button"
            class="est-preset-btn ${isActive ? "is-active" : ""}"
            data-est-preset="${escHtml(preset.id)}"
          >
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-cyan-400"></i>
            <span>${escHtml(preset.label)}</span>
          </button>
        `;
      }).join("");

      presetsMount.querySelectorAll("[data-est-preset]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const found = PRESETS.find((p) => p.id === btn.getAttribute("data-est-preset"));
          if (!found) return;
          activePresetId = found.id;
          state = { ...found.state };
          renderPresets();
          renderGroups();
          renderOutput();
          if (typeof window.showToast === "function") {
            window.showToast(`Loaded "${found.label}" scope preset`, "info");
          }
        });
      });
    }

    function renderGroups() {
      if (!groupsMount) return;

      groupsMount.innerHTML = GROUPS.map((group) => {
        const keys = Object.keys(cfg.dimensions).filter((k) => cfg.dimensions[k].group === group.id);
        const fieldsHtml = keys
          .map((dimKey) => {
            const dim = cfg.dimensions[dimKey];
            const selectedVal = state[dimKey];
            const isConfigured = selectedVal !== "none" && selectedVal !== "handover";
            const optionsHtml = Object.entries(dim.options)
              .map(
                ([optKey, optVal]) =>
                  `<option value="${escHtml(optKey)}" ${optKey === selectedVal ? "selected" : ""}>${escHtml(optVal.label)}</option>`
              )
              .join("");

            return `
              <div class="est-option-tile ${isConfigured ? "is-configured" : ""}">
                <label for="est-select-${escHtml(dimKey)}" class="est-label mb-0">
                  <i data-lucide="${escHtml(dim.icon)}" class="w-4 h-4 text-cyan-400 shrink-0"></i>
                  <span>${escHtml(dim.label)}</span>
                </label>
                <select
                  id="est-select-${escHtml(dimKey)}"
                  data-est-key="${escHtml(dimKey)}"
                  class="est-select"
                >
                  ${optionsHtml}
                </select>
              </div>
            `;
          })
          .join("");

        return `
          <section class="est-group-card" aria-labelledby="est-group-${escHtml(group.id)}">
            <div class="space-y-1">
              <div class="flex items-center justify-between gap-2">
                <h2 id="est-group-${escHtml(group.id)}" class="text-lg sm:text-xl font-bold text-[var(--text)]">
                  ${escHtml(group.step)}. ${escHtml(group.title)}
                </h2>
              </div>
              <p class="text-xs sm:text-sm text-[var(--muted)]">${escHtml(group.subtitle)}</p>
            </div>
            <div class="est-field-grid">${fieldsHtml}</div>
          </section>
        `;
      }).join("");

      groupsMount.querySelectorAll("[data-est-key]").forEach((selectEl) => {
        selectEl.addEventListener("change", () => {
          const key = selectEl.getAttribute("data-est-key");
          if (!key) return;
          activePresetId = "";
          state[key] = selectEl.value;
          const tile = selectEl.closest(".est-option-tile");
          if (tile) {
            tile.classList.toggle(
              "is-configured",
              selectEl.value !== "none" && selectEl.value !== "handover"
            );
          }
          renderPresets();
          renderOutput();
        });
      });

      refreshIcons();
    }

    function renderOutput() {
      if (!summaryMount) return;
      const estimate = calculateEstimate(state);

      const activeFeatureItems = estimate.selectedFeatures
        .map(
          (item) => `
          <li class="est-feature-row">
            <span class="font-medium text-[var(--text-secondary)] shrink-0">${escHtml(item.category)}</span>
            <span class="text-right ${item.isActive ? "text-[var(--text)] font-medium" : "text-[var(--muted)]"}">${escHtml(item.valueLabel)}</span>
          </li>
        `
        )
        .join("");

      const techItems = estimate.recommendedTech
        .map(
          (t) => `
          <li class="flex items-start gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
            <i data-lucide="check" class="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-1"></i>
            <span>${escHtml(t)}</span>
          </li>
        `
        )
        .join("");

      summaryMount.innerHTML = `
        <aside class="est-summary-sticky" aria-labelledby="est-output-heading">
          <div class="space-y-1.5">
            <p class="text-xs font-mono-tech font-bold text-cyan-400">${escHtml(estimate.headline)}</p>
            <h2 id="est-output-heading" class="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tabular-nums">
              ${escHtml(estimate.formattedRange)}
            </h2>
            <p class="text-xs text-[var(--muted)]">${escHtml(estimate.disclaimer)}</p>
          </div>

          <div class="est-disclaimer-note flex items-start gap-2.5">
            <i data-lucide="info" class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5"></i>
            <div>
              <strong class="block">${escHtml(estimate.headline)} (Non-Binding)</strong>
              <span class="text-[var(--text-secondary)]">${escHtml(estimate.disclaimer)}</span>
            </div>
          </div>

          <!-- Key Estimation Metrics -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="est-metric-box">
              <span class="text-[11px] font-semibold text-[var(--muted)]">Estimated Complexity</span>
              <span class="text-sm font-bold text-[var(--text)]">${escHtml(estimate.complexityLabel)}</span>
              <span class="text-[11px] text-[var(--muted)] leading-snug">${escHtml(estimate.complexityDescription)}</span>
            </div>

            <div class="est-metric-box">
              <span class="text-[11px] font-semibold text-[var(--muted)]">Suggested Timeline</span>
              <span class="text-sm font-bold text-indigo-400 tabular-nums">${escHtml(estimate.timelineLabel)}</span>
              <span class="text-[11px] text-[var(--muted)] tabular-nums">${estimate.activeCount} active modules configured</span>
            </div>
          </div>

          <!-- Recommended Technology -->
          <div class="space-y-2">
            <h3 class="text-sm font-bold text-[var(--text)]">Recommended Technology</h3>
            <ul class="space-y-1.5 list-none p-0 m-0">${techItems}</ul>
          </div>

          <!-- Project Scope Summary -->
          <div class="space-y-2">
            <h3 class="text-sm font-bold text-[var(--text)]">Project Scope Summary</h3>
            <p class="est-scope-box">${escHtml(estimate.scopeSummary)}</p>
          </div>

          <!-- Selected Features Breakdown -->
          <div class="space-y-2">
            <h3 class="text-sm font-bold text-[var(--text)]">Selected Features (${estimate.selectedFeatures.length})</h3>
            <ul class="est-feature-list">${activeFeatureItems}</ul>
          </div>

          <!-- Primary & Export Actions -->
          <div id="est-action-buttons" class="pt-3 border-t border-[var(--border)] space-y-2.5 est-no-print">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href="contact.html?intent=quote"
                id="est-request-quote-btn"
                class="primary-button text-xs sm:text-sm min-h-[44px] w-full"
              >
                <i data-lucide="send" class="w-4 h-4"></i>
                <span>Request Quote</span>
              </a>
              <a
                href="contact.html?intent=project"
                id="est-start-project-btn"
                class="secondary-button text-xs sm:text-sm min-h-[44px] w-full"
              >
                <span>Start Project</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                id="est-copy-summary-btn"
                class="outline-button text-xs min-h-[42px] px-3 w-full whitespace-nowrap"
              >
                <i data-lucide="copy" class="w-3.5 h-3.5 shrink-0"></i>
                <span>Copy Summary</span>
              </button>
              <button
                type="button"
                id="est-print-summary-btn"
                class="outline-button text-xs min-h-[42px] px-3 w-full whitespace-nowrap"
              >
                <i data-lucide="printer" class="w-3.5 h-3.5 shrink-0"></i>
                <span>Print Summary</span>
              </button>
              <button
                type="button"
                id="est-download-summary-btn"
                class="outline-button text-xs min-h-[42px] px-3 w-full whitespace-nowrap"
              >
                <i data-lucide="download" class="w-3.5 h-3.5 shrink-0"></i>
                <span>Download Summary</span>
              </button>
            </div>
          </div>
        </aside>
      `;

      const quoteBtn = document.getElementById("est-request-quote-btn");
      if (quoteBtn) {
        quoteBtn.addEventListener("click", () => {
          saveContactDraft(estimate, "quote");
        });
      }

      const startBtn = document.getElementById("est-start-project-btn");
      if (startBtn) {
        startBtn.addEventListener("click", () => {
          saveContactDraft(estimate, "project");
        });
      }

      const copyBtn = document.getElementById("est-copy-summary-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
          const text = buildTextSummary(estimate);
          try {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
              await navigator.clipboard.writeText(text);
            } else {
              const temp = document.createElement("textarea");
              temp.value = text;
              temp.setAttribute("readonly", "");
              temp.style.position = "fixed";
              temp.style.opacity = "0";
              document.body.appendChild(temp);
              temp.select();
              document.execCommand("copy");
              document.body.removeChild(temp);
            }
            if (typeof window.showToast === "function") {
              window.showToast("Estimated scope summary copied", "success");
            }
          } catch (_err) {
            if (typeof window.showToast === "function") {
              window.showToast("Use Print or Save to export summary", "info");
            }
          }
        });
      }

      const printBtn = document.getElementById("est-print-summary-btn");
      if (printBtn) {
        printBtn.addEventListener("click", () => window.print());
      }

      const downloadBtn = document.getElementById("est-download-summary-btn");
      if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
          downloadSummaryFile(estimate);
          if (typeof window.showToast === "function") {
            window.showToast("Downloaded project scope summary (.txt)", "success");
          }
        });
      }

      refreshIcons();
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        activePresetId = "";
        state = { ...DEFAULT_STATE };
        renderPresets();
        renderGroups();
        renderOutput();
        if (typeof window.showToast === "function") {
          window.showToast("Estimator reset to default configuration", "info");
        }
      });
    }

    renderPresets();
    renderGroups();
    renderOutput();
  }

  window.PortfolioEstimator = {
    init,
    ESTIMATOR_PRICING_CONFIG,
    calculateEstimate,
    buildTextSummary,
    saveContactDraft,
    PRESETS
  };
})();
