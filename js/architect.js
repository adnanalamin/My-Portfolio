/**
 * AL AMIN Portfolio — Phase 22: Interactive Project Architect
 * Rule-based deterministic architecture engine with a clean async adapter
 * ready for future server-side AI proxy integration (no client API keys).
 */

(() => {
  const FEATURE_CATALOG = [
    { id: "search", label: "Search & Multi-Faceted Filtering", category: "Discovery" },
    { id: "notifications", label: "Email / Transactional Notifications", category: "Messaging" },
    { id: "analytics", label: "Usage Metrics & Analytics Reports", category: "Insights" },
    { id: "uploads", label: "File, Media & Document Uploads", category: "Storage" },
    { id: "realtime", label: "Live Sync / Real-Time Updates", category: "Realtime" },
    { id: "audit", label: "Activity History & Audit Logs", category: "Compliance" },
    { id: "i18n", label: "Multi-Language / Localization", category: "Global" },
    { id: "booking", label: "Scheduling / Calendar Booking", category: "Operations" }
  ];

  const PRESETS = [
    {
      id: "saas-analytics",
      label: "B2B SaaS Workspace",
      spec: {
        projectName: "MetricPulse Workspace",
        projectType: "saas",
        businessCategory: "saas-productivity",
        targetUsers: "b2b-teams",
        features: ["search", "notifications", "analytics", "audit"],
        customFeatures: "Team workspaces, CSV export, API keys",
        authRequirement: "sso-rbac",
        paymentRequirement: "subscriptions",
        adminRequirement: "full-crud",
        aiRequirement: "summarization",
        mobileRequirement: "responsive-only",
        expectedScale: "growth"
      }
    },
    {
      id: "ecommerce-store",
      label: "Modern E-Commerce Store",
      spec: {
        projectName: "Veloce Commerce Storefront",
        projectType: "ecommerce",
        businessCategory: "retail-ecommerce",
        targetUsers: "b2c-consumers",
        features: ["search", "notifications", "uploads", "analytics"],
        customFeatures: "Wishlist persistence, promo codes, order tracking",
        authRequirement: "oauth-jwt",
        paymentRequirement: "one-time",
        adminRequirement: "full-crud",
        aiRequirement: "recommendations",
        mobileRequirement: "pwa",
        expectedScale: "growth"
      }
    },
    {
      id: "edtech-portal",
      label: "Interactive EdTech Portal",
      spec: {
        projectName: "SkillBridge Learning Hub",
        projectType: "community-edtech",
        businessCategory: "edtech",
        targetUsers: "students-instructors",
        features: ["search", "notifications", "uploads", "realtime", "booking"],
        customFeatures: "Progress certificates, cohort quizzes",
        authRequirement: "oauth-jwt",
        paymentRequirement: "subscriptions",
        adminRequirement: "full-crud",
        aiRequirement: "workflow-automation",
        mobileRequirement: "mobile-companion",
        expectedScale: "high"
      }
    },
    {
      id: "mvp-launch",
      label: "Lean Marketing & Booking MVP",
      spec: {
        projectName: "StudioNova Client Portal",
        projectType: "marketing-portfolio",
        businessCategory: "agency-creative",
        targetUsers: "b2c-consumers",
        features: ["notifications", "booking"],
        customFeatures: "Case study showcase, lead intake form",
        authRequirement: "none",
        paymentRequirement: "none",
        adminRequirement: "basic-cms",
        aiRequirement: "none",
        mobileRequirement: "responsive-only",
        expectedScale: "mvp"
      }
    }
  ];

  const LABELS = {
    projectType: {
      "saas": "SaaS Platform",
      "ecommerce": "E-Commerce Storefront",
      "marketing-portfolio": "Company / Portfolio Web App",
      "admin-portal": "Admin / Internal Operations Portal",
      "community-edtech": "EdTech / Community Platform",
      "realtime-collab": "Real-Time Collaborative Tool",
      "api-service": "API / Headless Service"
    },
    businessCategory: {
      "saas-productivity": "SaaS & Productivity",
      "retail-ecommerce": "Retail & E-Commerce",
      "edtech": "Education & Training",
      "healthcare": "Healthcare & Wellness",
      "fintech-ops": "FinTech & Operations",
      "agency-creative": "Agency & Creative Services",
      "developer-tools": "Developer Tools"
    },
    targetUsers: {
      "b2c-consumers": "B2C General Consumers",
      "b2b-teams": "B2B Teams & Organizations",
      "students-instructors": "Students & Instructors",
      "internal-staff": "Internal Operations Staff",
      "marketplace-multi": "Buyers & Sellers (Multi-Role)"
    },
    authRequirement: {
      "none": "No Login Required (Public Access)",
      "basic-email": "Email & Password Sessions",
      "oauth-jwt": "OAuth 2.0 Social + JWT Refresh Tokens",
      "sso-rbac": "Enterprise SSO + Multi-Role RBAC"
    },
    paymentRequirement: {
      "none": "No Online Payments",
      "one-time": "One-Time Checkout (Stripe / SSLCommerz)",
      "subscriptions": "Recurring Subscriptions + Billing Webhooks",
      "marketplace": "Marketplace Split Payouts & Escrow"
    },
    adminRequirement: {
      "none": "No Admin Dashboard",
      "basic-cms": "Lightweight Content Manager",
      "full-crud": "Full Operations, Analytics & User CRUD Console"
    },
    aiRequirement: {
      "none": "None Required",
      "recommendations": "Smart Search & Content Recommendations",
      "summarization": "Conversational Assistant / Summarization (Server Proxy)",
      "workflow-automation": "Document Parsing & Workflow Automation (Server Proxy)"
    },
    mobileRequirement: {
      "responsive-only": "Responsive Web Only (320px–2560px)",
      "pwa": "Installable PWA + Offline App Shell",
      "mobile-companion": "API-First Web + Native/React Native Companion"
    },
    expectedScale: {
      "mvp": "MVP / Early Validation (< 1k users)",
      "growth": "Growth Stage (1k – 25k monthly users)",
      "high": "High Scale / Multi-Region (25k+ concurrent demand)"
    }
  };

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

  function parseCustomFeatures(raw) {
    return String(raw || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  function hasFeature(spec, id) {
    return Array.isArray(spec.features) && spec.features.includes(id);
  }

  /**
   * Deterministic rule-based architecture engine.
   * Produces a cohesive, grounded technical specification based directly on visitor selections.
   */
  function runRuleBasedArchitect(rawSpec) {
    const spec = {
      projectName: String(rawSpec.projectName || "Untitled Project").trim() || "Untitled Project",
      projectType: rawSpec.projectType || "saas",
      businessCategory: rawSpec.businessCategory || "saas-productivity",
      targetUsers: rawSpec.targetUsers || "b2b-teams",
      features: Array.isArray(rawSpec.features) ? rawSpec.features.slice() : [],
      customFeatures: String(rawSpec.customFeatures || "").trim(),
      authRequirement: rawSpec.authRequirement || "oauth-jwt",
      paymentRequirement: rawSpec.paymentRequirement || "none",
      adminRequirement: rawSpec.adminRequirement || "full-crud",
      aiRequirement: rawSpec.aiRequirement || "none",
      mobileRequirement: rawSpec.mobileRequirement || "responsive-only",
      expectedScale: rawSpec.expectedScale || "mvp"
    };

    const isStaticEligible =
      spec.projectType === "marketing-portfolio" &&
      spec.authRequirement === "none" &&
      spec.paymentRequirement === "none" &&
      spec.aiRequirement === "none" &&
      !hasFeature(spec, "realtime") &&
      !hasFeature(spec, "uploads");

    const needsRelationalIntegrity =
      spec.paymentRequirement !== "none" ||
      spec.businessCategory === "fintech-ops" ||
      spec.authRequirement === "sso-rbac" ||
      spec.projectType === "ecommerce" ||
      spec.projectType === "saas" ||
      spec.expectedScale === "high";

    const needsRealtime =
      spec.projectType === "realtime-collab" || hasFeature(spec, "realtime");

    const needsObjectStorage =
      hasFeature(spec, "uploads") ||
      spec.projectType === "ecommerce" ||
      spec.projectType === "community-edtech" ||
      spec.aiRequirement === "workflow-automation";

    const customList = parseCustomFeatures(spec.customFeatures);
    const selectedFeatureLabels = spec.features
      .map((id) => {
        const match = FEATURE_CATALOG.find((item) => item.id === id);
        return match ? match.label : id;
      })
      .concat(customList);

    /* ---------- 1. Frontend Architecture ---------- */
    let frontendTech = "React 19 + TypeScript + Tailwind CSS (Vite SPA)";
    let uiArchitecture =
      "Modular feature-slice layout with design tokens, accessible keyboard primitives, and optimistic UI states.";

    if (spec.projectType === "ecommerce" || spec.projectType === "marketing-portfolio" || spec.projectType === "community-edtech") {
      frontendTech = "Next.js (App Router) + React + TypeScript + Tailwind CSS";
      uiArchitecture =
        "Hybrid SSR/SSG rendering for fast SEO indexing and crawlable pages, paired with interactive client islands.";
    } else if (spec.projectType === "api-service") {
      frontendTech = "Next.js Developer Portal + OpenAPI Docs UI + Tailwind CSS";
      uiArchitecture =
        "Documentation-first portal with interactive endpoint explorer, token management console, and usage logs.";
    } else if (isStaticEligible) {
      frontendTech = "HTML5 / Tailwind CSS / Modular ES2024 JavaScript (or Astro)";
      uiArchitecture =
        "Zero-runtime-bloat static multi-page shell with progressive enhancement and instant CDN edge delivery.";
    }

    if (spec.mobileRequirement === "pwa") {
      frontendTech += " + Service Worker & Web Manifest (PWA)";
      uiArchitecture += " Includes app-shell precaching, install prompt flow, and offline fallback view.";
    } else if (spec.mobileRequirement === "mobile-companion") {
      frontendTech += " + Shared API Client for React Native / Expo";
      uiArchitecture += " Contracts shared via typed API DTOs across Web UI and mobile screens.";
    }

    const componentStructure = [
      "src/",
      "├── app/ or pages/        # Route entrypoints & SEO metadata",
      "├── components/ui/        # Accessible primitives (buttons, modals, tables)",
      `├── features/${spec.projectType}/ # Domain views (${LABELS.projectType[spec.projectType]})`,
      spec.adminRequirement !== "none" ? "├── features/admin/       # Protected management & moderation views" : null,
      spec.paymentRequirement !== "none" ? "├── features/billing/     # Checkout, invoices & plan selectors" : null,
      spec.aiRequirement !== "none" ? "├── features/ai-proxy/    # Safe prompt UI calling backend /api/ai/*" : null,
      "├── hooks/ & lib/         # Auth guard, fetch wrapper, schema validators",
      "└── styles/tokens.css     # Dark/Light theme tokens & print rules"
    ]
      .filter(Boolean)
      .join("\n");

    /* ---------- 2. Backend Architecture ---------- */
    let backendTech = "Node.js 20+ (LTS) + Express.js + TypeScript + Zod Validation";
    if (isStaticEligible) {
      backendTech = "Serverless Form/CMS Webhook Handler (Lightweight Edge Functions)";
    } else if (spec.expectedScale === "high" || needsRealtime) {
      backendTech = "Node.js (Fastify / NestJS Architecture) + TypeScript + Redis Pub/Sub";
    } else if (spec.projectType === "ecommerce" || spec.projectType === "community-edtech") {
      backendTech = "Next.js Route Handlers + Express Microservice Workers (TypeScript)";
    }

    const apiRoutes = ["/api/v1/health          # Liveness & dependency readiness"];
    if (spec.authRequirement !== "none") {
      apiRoutes.push("/api/v1/auth/*          # Login, token refresh, logout, profile");
    }
    if (spec.projectType === "ecommerce") {
      apiRoutes.push("/api/v1/catalog/*       # Filtered products, variants & stock");
      apiRoutes.push("/api/v1/orders/*        # Cart validation & order lifecycle");
    } else {
      apiRoutes.push("/api/v1/workspace/*     # Core domain resources & filtering");
    }
    if (spec.paymentRequirement !== "none") {
      apiRoutes.push("/api/v1/billing/webhook # Signed Stripe/payment webhook verification");
    }
    if (spec.adminRequirement !== "none") {
      apiRoutes.push("/api/v1/admin/*         # Role-guarded CRUD & moderation endpoints");
    }
    if (spec.aiRequirement !== "none") {
      apiRoutes.push("/api/v1/ai/assist       # Server-proxied AI requests (key kept server-side)");
    }
    if (needsObjectStorage) {
      apiRoutes.push("/api/v1/media/presign   # Signed upload URLs with MIME validation");
    }
    if (needsRealtime) {
      apiRoutes.push("/ws/stream              # Authenticated WebSocket / SSE channel");
    }

    let backendAuth = "Public read endpoints with optional signed contact token.";
    if (spec.authRequirement === "basic-email") {
      backendAuth = "Argon2id/bcrypt password hashing + HttpOnly secure session cookies.";
    } else if (spec.authRequirement === "oauth-jwt") {
      backendAuth = "OAuth 2.0 (Google/GitHub) + short-lived JWT access tokens & rotating HttpOnly refresh tokens.";
    } else if (spec.authRequirement === "sso-rbac") {
      backendAuth = "OIDC / SAML Enterprise SSO + scoped JWT claims enforcing organization & role RBAC middleware.";
    }

    /* ---------- 3. Database Architecture ---------- */
    let databaseEngine = needsRelationalIntegrity
      ? "PostgreSQL (Managed Cloud SQL / Neon) + Prisma / Drizzle ORM"
      : "MongoDB Atlas + Mongoose Schema Modeling";

    if (isStaticEligible) {
      databaseEngine = "Structured JSON/Markdown Content + PostgreSQL only when CRM leads grow";
    } else if (spec.expectedScale === "growth") {
      databaseEngine += " + Upstash Redis (Session & Query Cache)";
    } else if (spec.expectedScale === "high") {
      databaseEngine += " + Read Replicas + Redis Cluster Cache & Job Queue (BullMQ)";
    }

    const tables = [];
    if (spec.authRequirement !== "none") {
      tables.push({ name: "users", fields: "id, email, password_hash, role, status, created_at" });
      tables.push({ name: "sessions", fields: "id, user_id, refresh_token_hash, expires_at, ip_agent" });
    }
    if (spec.targetUsers === "b2b-teams" || spec.authRequirement === "sso-rbac") {
      tables.push({ name: "organizations", fields: "id, slug, plan_tier, owner_id, settings_json" });
      tables.push({ name: "memberships", fields: "id, org_id, user_id, role_permission, invited_at" });
    }

    if (spec.projectType === "ecommerce") {
      tables.push({ name: "products", fields: "id, slug, title, price_cents, stock_count, category_id" });
      tables.push({ name: "orders", fields: "id, user_id, status, total_cents, payment_intent_id" });
    } else if (spec.projectType === "community-edtech") {
      tables.push({ name: "courses_modules", fields: "id, title, instructor_id, published, syllabus_json" });
      tables.push({ name: "enrollments", fields: "id, user_id, course_id, progress_pct, completed_at" });
    } else {
      tables.push({ name: "records", fields: "id, owner_id, title, status, payload_json, updated_at" });
    }

    if (spec.paymentRequirement !== "none") {
      tables.push({ name: "billing_events", fields: "id, customer_id, provider_event_id, status, amount_cents" });
    }
    if (hasFeature(spec, "audit") || spec.adminRequirement === "full-crud") {
      tables.push({ name: "audit_logs", fields: "id, actor_id, action, target_type, target_id, created_at" });
    }
    if (needsObjectStorage) {
      tables.push({ name: "media_assets", fields: "id, owner_id, storage_key, mime_type, size_bytes" });
    }
    if (spec.aiRequirement !== "none") {
      tables.push({ name: "ai_jobs", fields: "id, user_id, prompt_hash, status, token_usage, created_at" });
    }

    /* ---------- 4. Infrastructure Architecture ---------- */
    const scaleHostingMap = {
      mvp: isStaticEligible
        ? "Vercel / Cloudflare Pages (Static Global Edge, Zero-Ops)"
        : "Vercel (Frontend) + Render / Railway Container Service (Backend)",
      growth: "Vercel / Cloudflare Pages + Managed Cloud Run / ECS Auto-Scaling Containers",
      high: "Multi-Region Cloud Run / Kubernetes behind Load Balancer + Health Checks"
    };

    const storageDesc = needsObjectStorage
      ? "S3-Compatible Object Storage (Cloudflare R2 / AWS S3) with private bucket policies & presigned URLs."
      : "Built-in static asset bundling with immutable content hashes on CDN edge.";

    const cdnDesc =
      spec.expectedScale === "high"
        ? "Cloudflare Enterprise / CloudFront Edge CDN with Geo-routing, Brotli compression & edge image resizing."
        : "Cloudflare / Vercel Edge CDN with HTTP/3, Brotli compression & stale-while-revalidate caching.";

    const deploymentDesc =
      "GitHub Actions CI/CD (Type-check -> Lint -> Integration Tests -> Preview Deploy -> Tagged Production Release + Automated DB Migrations).";

    /* ---------- 5. Security Architecture ---------- */
    const security = {
      authentication:
        spec.authRequirement === "none"
          ? "No user credentials stored; signed CSRF/honeypot verification on public submission forms."
          : backendAuth,
      authorization:
        spec.authRequirement === "sso-rbac" || spec.adminRequirement === "full-crud"
          ? "Strict server-side RBAC + ownership guards per resource (never trust client-submitted role/userId)."
          : "Resource ownership verification inside service layer before every read/write operation.",
      validation:
        "Strict Zod / JSON-Schema runtime validation on all bodies, query params & MIME file types before DB access.",
      rateLimiting:
        spec.aiRequirement !== "none" || spec.authRequirement !== "none"
          ? "Sliding-window Redis rate limiting per IP & user tier (strictest caps on /auth/* and /api/v1/ai/*)."
          : "Edge WAF rate limiting + DDoS surge protection on public endpoints.",
      headers:
        "Helmet / Edge Security Headers: Content-Security-Policy (CSP), HSTS, X-Content-Type-Options: nosniff, Referrer-Policy, strict CORS allowlist." +
        (spec.aiRequirement !== "none"
          ? " AI API secrets isolated exclusively inside server environment variables — zero client exposure."
          : "")
    };

    /* ---------- 6. 7-Phase Development Roadmap ---------- */
    const featureNote =
      selectedFeatureLabels.length > 0
        ? selectedFeatureLabels.slice(0, 3).join(", ")
        : "core user flows";

    const roadmap = [
      {
        phase: "Phase 1",
        title: "Planning",
        duration: spec.expectedScale === "high" ? "Week 1–2" : "Days 1–4",
        deliverables: [
          `Finalize functional scope for ${spec.projectName} (${LABELS.projectType[spec.projectType]}).`,
          `Define API contracts, user roles (${LABELS.targetUsers[spec.targetUsers]}), and acceptance criteria.`,
          "Lock technology stack, hosting budget tier, and non-functional performance targets."
        ]
      },
      {
        phase: "Phase 2",
        title: "UI/UX",
        duration: spec.adminRequirement === "full-crud" ? "Week 2–3" : "Days 5–10",
        deliverables: [
          "Build accessible wireframes, responsive breakpoints (320px–2560px), and Dark/Light design tokens.",
          `Design primary flows for ${featureNote}.`,
          spec.mobileRequirement === "pwa"
            ? "Create PWA app icon set, install affordances, and offline state mockups."
            : "Verify interactive states (loading skeletons, empty states, validation errors)."
        ]
      },
      {
        phase: "Phase 3",
        title: "Frontend",
        duration: spec.expectedScale === "high" ? "Week 4–6" : "Week 2–3",
        deliverables: [
          `Implement ${frontendTech} with modular accessible components.`,
          "Connect typed API client, optimistic UI states, and client-side form feedback.",
          spec.adminRequirement !== "none"
            ? `Build ${LABELS.adminRequirement[spec.adminRequirement]} views and navigation guards.`
            : "Complete responsive navigation, metadata tags, and SEO structure."
        ]
      },
      {
        phase: "Phase 4",
        title: "Backend",
        duration: isStaticEligible ? "Days 1–3" : "Week 3–5",
        deliverables: [
          `Build ${backendTech} with structured validation and centralized error handling.`,
          spec.paymentRequirement !== "none"
            ? `Implement ${LABELS.paymentRequirement[spec.paymentRequirement]} checkout & verified webhook handlers.`
            : "Configure REST route controllers, logging middleware, and rate limiting.",
          spec.aiRequirement !== "none"
            ? `Build server-side proxy (/api/v1/ai/assist) for ${LABELS.aiRequirement[spec.aiRequirement]} with token quotas.`
            : "Implement transactional email hooks and background task handlers."
        ]
      },
      {
        phase: "Phase 5",
        title: "Database",
        duration: isStaticEligible ? "Days 1–2" : "Week 3–4",
        deliverables: [
          `Provision ${databaseEngine} and implement ${tables.length} core entities (${tables.slice(0, 3).map((t) => t.name).join(", ")}).`,
          "Add composite indexes for search/filter queries and transactional integrity constraints.",
          "Configure automated daily backups, migration scripts, and seed fixtures."
        ]
      },
      {
        phase: "Phase 6",
        title: "Testing",
        duration: "Week 5–6",
        deliverables: [
          "Run unit tests on rule/validation logic and integration tests across auth & API routes.",
          "Audit WCAG AA contrast, keyboard navigation, and mobile viewport layouts (320px–2560px).",
          "Perform security checklist verification (CORS, headers, rate limits, webhook signatures)."
        ]
      },
      {
        phase: "Phase 7",
        title: "Deployment",
        duration: "Final Milestone",
        deliverables: [
          `Deploy via ${deploymentDesc.split("(")[0].trim()} onto ${scaleHostingMap[spec.expectedScale]}.`,
          "Verify SSL/TLS certificates, CDN cache policies, error monitoring, and health checks.",
          "Deliver technical handoff documentation and post-launch maintenance runbook."
        ]
      }
    ];

    /* ---------- 7. Interactive Diagram Topology ---------- */
    const diagramNodes = [
      {
        id: "edge",
        targetCard: "infrastructure",
        stepNum: "01",
        title: "Client & Edge CDN",
        subtitle: spec.mobileRequirement === "pwa" ? "Browser + PWA Shell" : "320px–2560px Clients",
        active: true,
        items: ["HTTPS / TLS 1.3 + WAF", "Cloudflare / Vercel CDN", spec.mobileRequirement === "mobile-companion" ? "Mobile App API Consumer" : "Responsive Web Viewport"]
      },
      {
        id: "frontend",
        targetCard: "frontend",
        stepNum: "02",
        title: "Frontend Layer",
        subtitle: frontendTech.split("+")[0].trim(),
        active: true,
        items: [
          uiArchitecture.split(".")[0],
          spec.adminRequirement !== "none" ? "Admin Console Module" : "Public & User Views",
          "Client State & Validation"
        ]
      },
      {
        id: "backend",
        targetCard: "backend",
        stepNum: "03",
        title: "API & Auth Gateway",
        subtitle: isStaticEligible ? "Edge Form / Webhooks" : "Versioned REST / API",
        active: !isStaticEligible,
        items: [
          spec.authRequirement === "none" ? "Public Read Endpoints" : LABELS.authRequirement[spec.authRequirement].split("+")[0].trim(),
          "Zod Schema Validation",
          "Rate Limiting & CORS"
        ]
      },
      {
        id: "services",
        targetCard: "security",
        stepNum: "04",
        title: "Domain Integrations",
        subtitle: spec.paymentRequirement !== "none" || spec.aiRequirement !== "none" ? "Server-Side Workers" : "Optional Modules",
        active: spec.paymentRequirement !== "none" || spec.aiRequirement !== "none" || needsRealtime,
        items: [
          spec.paymentRequirement !== "none" ? "Payment Checkout & Webhooks" : "No Payment Gateway Selected",
          spec.aiRequirement !== "none" ? "Server-Proxied AI Route (/api/ai)" : "No AI Integration Selected",
          needsRealtime ? "WebSocket / SSE Event Bus" : "Async Email / Webhook Jobs"
        ]
      },
      {
        id: "data",
        targetCard: "database",
        stepNum: "05",
        title: "Data & Storage",
        subtitle: databaseEngine.split("+")[0].trim(),
        active: true,
        items: [
          `${tables.length} Modeled Entities`,
          needsObjectStorage ? "Private Object Storage (R2/S3)" : "Hashed Static Bundle Assets",
          spec.expectedScale === "mvp" ? "Automated Daily Snapshots" : "Redis Cache + Automated Backups"
        ]
      }
    ];

    return {
      engineType: "rule-based",
      generatedAt: new Date().toISOString().slice(0, 10),
      spec,
      summaryTags: [
        LABELS.projectType[spec.projectType],
        LABELS.businessCategory[spec.businessCategory],
        LABELS.expectedScale[spec.expectedScale]
      ],
      selectedFeatureLabels,
      diagramNodes,
      frontend: {
        recommendedTech: frontendTech,
        uiArchitecture,
        componentStructure
      },
      backend: {
        technology: backendTech,
        apiStructure: apiRoutes,
        authentication: backendAuth
      },
      database: {
        recommendation: databaseEngine,
        collectionsOrTables: tables
      },
      infrastructure: {
        hosting: scaleHostingMap[spec.expectedScale],
        storage: storageDesc,
        cdn: cdnDesc,
        deployment: deploymentDesc
      },
      security,
      roadmap
    };
  }

  /**
   * Future-ready async resolution hook.
   * Defaults to deterministic client-side rules engine (`mode: "local"`).
   * If the portfolio owner configures `portfolioConfig.architect.mode = "backend"` and a valid
   * `backendEndpoint` (server proxy route), posts the spec cleanly without client API keys,
   * automatically falling back to the rule-based engine if unavailable.
   */
  async function resolveArchitecturePlan(spec) {
    const cfg = (window.portfolioConfig && window.portfolioConfig.architect) || {};
    if (cfg.mode === "backend" && cfg.backendEndpoint) {
      const controller = typeof AbortController === "function" ? new AbortController() : null;
      const timer = controller ? window.setTimeout(() => controller.abort(), 8000) : null;
      try {
        const res = await fetch(cfg.backendEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spec }),
          signal: controller ? controller.signal : undefined
        });
        if (timer) window.clearTimeout(timer);
        if (res.ok) {
          const payload = await res.json();
          if (payload && payload.frontend && payload.backend && Array.isArray(payload.roadmap)) {
            return { ...payload, engineType: "server-proxy" };
          }
        }
      } catch (_err) {
        if (timer) window.clearTimeout(timer);
      }
    }
    return runRuleBasedArchitect(spec);
  }

  function buildMarkdownExport(plan) {
    const { spec } = plan;
    const lines = [
      `# Technical Architecture Blueprint: ${spec.projectName}`,
      "",
      `- **Generated Date**: ${plan.generatedAt}`,
      `- **Project Type**: ${LABELS.projectType[spec.projectType]}`,
      `- **Business Category**: ${LABELS.businessCategory[spec.businessCategory]}`,
      `- **Target Users**: ${LABELS.targetUsers[spec.targetUsers]}`,
      `- **Authentication**: ${LABELS.authRequirement[spec.authRequirement]}`,
      `- **Payments**: ${LABELS.paymentRequirement[spec.paymentRequirement]}`,
      `- **Admin Console**: ${LABELS.adminRequirement[spec.adminRequirement]}`,
      `- **AI Integration**: ${LABELS.aiRequirement[spec.aiRequirement]}`,
      `- **Mobile Strategy**: ${LABELS.mobileRequirement[spec.mobileRequirement]}`,
      `- **Expected Scale**: ${LABELS.expectedScale[spec.expectedScale]}`,
      `- **Selected Features**: ${plan.selectedFeatureLabels.join(", ") || "Core MVP Flow"}`,
      "",
      "## 1. Frontend Architecture",
      `- **Recommended Technology**: ${plan.frontend.recommendedTech}`,
      `- **UI Architecture**: ${plan.frontend.uiArchitecture}`,
      "",
      "```text",
      plan.frontend.componentStructure,
      "```",
      "",
      "## 2. Backend Architecture",
      `- **Backend Technology**: ${plan.backend.technology}`,
      `- **Authentication**: ${plan.backend.authentication}`,
      "- **API Endpoints**:",
      ...plan.backend.apiStructure.map((r) => `  - \`${r}\``),
      "",
      "## 3. Database Design",
      `- **Database Recommendation**: ${plan.database.recommendation}`,
      "- **Core Collections / Tables**:",
      ...plan.database.collectionsOrTables.map((t) => `  - **${t.name}**: \`${t.fields}\``),
      "",
      "## 4. Infrastructure & Deployment",
      `- **Hosting**: ${plan.infrastructure.hosting}`,
      `- **Object Storage**: ${plan.infrastructure.storage}`,
      `- **CDN**: ${plan.infrastructure.cdn}`,
      `- **Deployment**: ${plan.infrastructure.deployment}`,
      "",
      "## 5. Security Controls",
      `- **Authentication**: ${plan.security.authentication}`,
      `- **Authorization**: ${plan.security.authorization}`,
      `- **Validation**: ${plan.security.validation}`,
      `- **Rate Limiting**: ${plan.security.rateLimiting}`,
      `- **Security Headers**: ${plan.security.headers}`,
      "",
      "## 6. 7-Phase Development Roadmap",
      ...plan.roadmap.flatMap((phase) => [
        `### ${phase.phase}: ${phase.title} (${phase.duration})`,
        ...phase.deliverables.map((d) => `- ${d}`),
        ""
      ]),
      "---",
      "_Generated via AL AMIN Portfolio Project Architect (Rule-Based Architecture Demo)._"
    ];
    return lines.join("\n");
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function init() {
    const root = document.getElementById("architect-root");
    if (!root) return;

    const wizardSteps = [
      { step: 1, title: "Project Basics", shortTitle: "Basics" },
      { step: 2, title: "Core Features", shortTitle: "Features" },
      { step: 3, title: "Auth, Payments & AI", shortTitle: "Integrations" },
      { step: 4, title: "Mobile & Scale", shortTitle: "Scale & Review" }
    ];

    let currentStep = 1;
    let activePresetId = PRESETS[0].id;
    let focusedCardKey = null;
    let currentSpec = { ...PRESETS[0].spec, features: [...PRESETS[0].spec.features] };
    let currentPlan = runRuleBasedArchitect(currentSpec);

    const presetsMount = document.getElementById("arch-presets-row");
    const stepperMount = document.getElementById("arch-stepper");
    const progressFill = document.getElementById("arch-progress-fill");
    const progressText = document.getElementById("arch-progress-text");
    const stepBodyMount = document.getElementById("arch-step-body");
    const prevBtn = document.getElementById("arch-prev-btn");
    const nextBtn = document.getElementById("arch-next-btn");
    const generateBtn = document.getElementById("arch-generate-btn");
    const resetBtn = document.getElementById("arch-reset-btn");
    const validationMsg = document.getElementById("arch-validation-msg");
    const outputMount = document.getElementById("arch-output-root");

    function setValidationMessage(msg) {
      if (!validationMsg) return;
      if (!msg) {
        validationMsg.textContent = "";
        validationMsg.classList.add("hidden");
      } else {
        validationMsg.textContent = msg;
        validationMsg.classList.remove("hidden");
      }
    }

    function renderPresets() {
      if (!presetsMount) return;
      presetsMount.innerHTML = PRESETS.map((preset) => {
        const isActive = preset.id === activePresetId;
        return `
          <button
            type="button"
            class="arch-preset-btn ${isActive ? "is-active" : ""}"
            data-arch-preset="${escHtml(preset.id)}"
          >
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-cyan-400"></i>
            <span>${escHtml(preset.label)}</span>
          </button>
        `;
      }).join("");

      presetsMount.querySelectorAll("[data-arch-preset]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const preset = PRESETS.find((p) => p.id === btn.getAttribute("data-arch-preset"));
          if (!preset) return;
          activePresetId = preset.id;
          currentSpec = { ...preset.spec, features: [...preset.spec.features] };
          setValidationMessage("");
          renderPresets();
          renderStepper();
          renderStepBody();
          await regenerateAndRender(false);
          if (typeof window.showToast === "function") {
            window.showToast(`Loaded "${preset.label}" template`, "info");
          }
        });
      });
    }

    function renderStepper() {
      if (stepperMount) {
        stepperMount.innerHTML = wizardSteps
          .map((item) => {
            const isActive = currentStep === item.step;
            const isComplete = item.step < currentStep;
            return `
              <button
                type="button"
                class="arch-step-btn ${isActive ? "is-active" : ""} ${isComplete ? "is-complete" : ""}"
                data-arch-goto-step="${item.step}"
                aria-current="${isActive ? "step" : "false"}"
              >
                <span class="arch-step-index">${isComplete ? "✓" : `0${item.step}`}</span>
                <span class="min-w-0">
                  <span class="block text-xs font-bold truncate">${escHtml(item.title)}</span>
                  <span class="block text-[11px] text-[var(--muted)] truncate">Step ${item.step} of 4</span>
                </span>
              </button>
            `;
          })
          .join("");

        stepperMount.querySelectorAll("[data-arch-goto-step]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const targetStep = Number(btn.getAttribute("data-arch-goto-step") || "1");
            if (targetStep > 1 && !String(currentSpec.projectName || "").trim()) {
              setValidationMessage("Please enter a project name before advancing.");
              currentStep = 1;
              renderStepper();
              renderStepBody();
              return;
            }
            setValidationMessage("");
            currentStep = targetStep;
            renderStepper();
            renderStepBody();
          });
        });
      }

      const pct = Math.round((currentStep / 4) * 100);
      if (progressFill) progressFill.style.width = `${pct}%`;
      if (progressText) progressText.textContent = `Step ${currentStep} of 4 · ${pct}% Complete`;

      if (prevBtn) prevBtn.disabled = currentStep === 1;
      if (nextBtn) nextBtn.classList.toggle("hidden", currentStep === 4);
      if (generateBtn) generateBtn.classList.toggle("hidden", currentStep !== 4);
    }

    function renderSelectOptions(optionsObj, selectedVal) {
      return Object.entries(optionsObj)
        .map(
          ([value, label]) =>
            `<option value="${escHtml(value)}" ${value === selectedVal ? "selected" : ""}>${escHtml(label)}</option>`
        )
        .join("");
    }

    function renderStepBody() {
      if (!stepBodyMount) return;

      if (currentStep === 1) {
        stepBodyMount.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 arch-animate-in">
            <div>
              <label for="arch-project-name" class="arch-field-label">Project Name <span class="text-cyan-400">*</span></label>
              <input
                id="arch-project-name"
                type="text"
                class="arch-input"
                maxlength="80"
                value="${escHtml(currentSpec.projectName)}"
                placeholder="e.g. FinFlow Analytics SaaS"
              >
            </div>

            <div>
              <label for="arch-project-type" class="arch-field-label">Project Type</label>
              <select id="arch-project-type" class="arch-select">
                ${renderSelectOptions(LABELS.projectType, currentSpec.projectType)}
              </select>
            </div>

            <div>
              <label for="arch-business-category" class="arch-field-label">Business Category</label>
              <select id="arch-business-category" class="arch-select">
                ${renderSelectOptions(LABELS.businessCategory, currentSpec.businessCategory)}
              </select>
            </div>

            <div>
              <label for="arch-target-users" class="arch-field-label">Target Users</label>
              <select id="arch-target-users" class="arch-select">
                ${renderSelectOptions(LABELS.targetUsers, currentSpec.targetUsers)}
              </select>
            </div>
          </div>
        `;

        const nameInput = document.getElementById("arch-project-name");
        const typeSelect = document.getElementById("arch-project-type");
        const catSelect = document.getElementById("arch-business-category");
        const usersSelect = document.getElementById("arch-target-users");

        if (nameInput) {
          nameInput.addEventListener("input", () => {
            activePresetId = "";
            currentSpec.projectName = nameInput.value;
            if (nameInput.value.trim()) setValidationMessage("");
          });
        }
        if (typeSelect) {
          typeSelect.addEventListener("change", () => {
            activePresetId = "";
            currentSpec.projectType = typeSelect.value;
            renderPresets();
          });
        }
        if (catSelect) {
          catSelect.addEventListener("change", () => {
            activePresetId = "";
            currentSpec.businessCategory = catSelect.value;
            renderPresets();
          });
        }
        if (usersSelect) {
          usersSelect.addEventListener("change", () => {
            activePresetId = "";
            currentSpec.targetUsers = usersSelect.value;
            renderPresets();
          });
        }
      } else if (currentStep === 2) {
        const checkboxes = FEATURE_CATALOG.map((feat) => {
          const checked = hasFeature(currentSpec, feat.id);
          return `
            <label class="arch-choice-card ${checked ? "is-checked" : ""}">
              <input
                type="checkbox"
                data-arch-feature="${escHtml(feat.id)}"
                ${checked ? "checked" : ""}
              >
              <span class="min-w-0">
                <span class="block text-xs sm:text-sm font-semibold text-[var(--text)]">${escHtml(feat.label)}</span>
                <span class="block text-[11px] text-[var(--muted)]">${escHtml(feat.category)}</span>
              </span>
            </label>
          `;
        }).join("");

        stepBodyMount.innerHTML = `
          <div class="space-y-4 arch-animate-in">
            <div>
              <p class="arch-field-label">Required Functional Modules</p>
              <div class="arch-option-grid">${checkboxes}</div>
            </div>

            <div>
              <label for="arch-custom-features" class="arch-field-label">Additional Custom Features (comma-separated, optional)</label>
              <input
                id="arch-custom-features"
                type="text"
                class="arch-input"
                maxlength="160"
                value="${escHtml(currentSpec.customFeatures)}"
                placeholder="e.g. Webhook integrations, PDF invoice generator, Saved filters"
              >
            </div>
          </div>
        `;

        stepBodyMount.querySelectorAll("[data-arch-feature]").forEach((box) => {
          box.addEventListener("change", () => {
            activePresetId = "";
            const id = box.getAttribute("data-arch-feature");
            const card = box.closest(".arch-choice-card");
            if (box.checked) {
              if (!currentSpec.features.includes(id)) currentSpec.features.push(id);
              if (card) card.classList.add("is-checked");
            } else {
              currentSpec.features = currentSpec.features.filter((f) => f !== id);
              if (card) card.classList.remove("is-checked");
            }
            renderPresets();
          });
        });

        const customInput = document.getElementById("arch-custom-features");
        if (customInput) {
          customInput.addEventListener("input", () => {
            activePresetId = "";
            currentSpec.customFeatures = customInput.value;
          });
        }
      } else if (currentStep === 3) {
        stepBodyMount.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 arch-animate-in">
            <div>
              <label for="arch-auth-req" class="arch-field-label">Authentication Requirement</label>
              <select id="arch-auth-req" class="arch-select">
                ${renderSelectOptions(LABELS.authRequirement, currentSpec.authRequirement)}
              </select>
            </div>

            <div>
              <label for="arch-payment-req" class="arch-field-label">Payment &amp; Billing Requirement</label>
              <select id="arch-payment-req" class="arch-select">
                ${renderSelectOptions(LABELS.paymentRequirement, currentSpec.paymentRequirement)}
              </select>
            </div>

            <div>
              <label for="arch-admin-req" class="arch-field-label">Admin Dashboard Requirement</label>
              <select id="arch-admin-req" class="arch-select">
                ${renderSelectOptions(LABELS.adminRequirement, currentSpec.adminRequirement)}
              </select>
            </div>

            <div>
              <label for="arch-ai-req" class="arch-field-label">AI Capabilities Requirement</label>
              <select id="arch-ai-req" class="arch-select">
                ${renderSelectOptions(LABELS.aiRequirement, currentSpec.aiRequirement)}
              </select>
            </div>
          </div>
        `;

        const bindSelect = (id, key) => {
          const el = document.getElementById(id);
          if (el) {
            el.addEventListener("change", () => {
              activePresetId = "";
              currentSpec[key] = el.value;
              renderPresets();
            });
          }
        };
        bindSelect("arch-auth-req", "authRequirement");
        bindSelect("arch-payment-req", "paymentRequirement");
        bindSelect("arch-admin-req", "adminRequirement");
        bindSelect("arch-ai-req", "aiRequirement");
      } else if (currentStep === 4) {
        const featSummary =
          currentSpec.features
            .map((id) => {
              const found = FEATURE_CATALOG.find((item) => item.id === id);
              return found ? found.label : id;
            })
            .concat(parseCustomFeatures(currentSpec.customFeatures))
            .join(" · ") || "Core MVP Flow";

        stepBodyMount.innerHTML = `
          <div class="space-y-4 arch-animate-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="arch-mobile-req" class="arch-field-label">Mobile &amp; Platform Strategy</label>
                <select id="arch-mobile-req" class="arch-select">
                  ${renderSelectOptions(LABELS.mobileRequirement, currentSpec.mobileRequirement)}
                </select>
              </div>

              <div>
                <label for="arch-scale-req" class="arch-field-label">Expected Traffic &amp; Data Scale</label>
                <select id="arch-scale-req" class="arch-select">
                  ${renderSelectOptions(LABELS.expectedScale, currentSpec.expectedScale)}
                </select>
              </div>
            </div>

            <div class="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 space-y-2 text-xs sm:text-sm">
              <p class="font-semibold text-[var(--text)]">Configuration Summary Ready to Generate</p>
              <p class="text-[var(--muted)]">
                <strong class="text-[var(--text-secondary)]">${escHtml(currentSpec.projectName || "Untitled Project")}</strong>
                · ${escHtml(LABELS.projectType[currentSpec.projectType])}
                · ${escHtml(LABELS.authRequirement[currentSpec.authRequirement])}
                · ${escHtml(LABELS.paymentRequirement[currentSpec.paymentRequirement])}
              </p>
              <p class="text-[var(--muted)]">Modules: ${escHtml(featSummary)}</p>
            </div>
          </div>
        `;

        const mobEl = document.getElementById("arch-mobile-req");
        const scaleEl = document.getElementById("arch-scale-req");
        if (mobEl) {
          mobEl.addEventListener("change", () => {
            activePresetId = "";
            currentSpec.mobileRequirement = mobEl.value;
            renderPresets();
          });
        }
        if (scaleEl) {
          scaleEl.addEventListener("change", () => {
            activePresetId = "";
            currentSpec.expectedScale = scaleEl.value;
            renderPresets();
          });
        }
      }

      refreshIcons();
    }

    function renderArchitectureOutput() {
      if (!outputMount || !currentPlan) return;
      const plan = currentPlan;
      const { spec } = plan;

      const engineNotice =
        plan.engineType === "server-proxy"
          ? "Server-Proxied Architecture Engine"
          : "Rule-Based Architecture Engine (Client Demo)";

      const diagramHtml = plan.diagramNodes
        .map((node) => {
          const isFocused = focusedCardKey === node.targetCard;
          return `
            <button
              type="button"
              class="arch-tier-node ${isFocused ? "is-focused" : ""} ${node.active ? "" : "is-inactive"}"
              data-arch-focus-card="${escHtml(node.targetCard)}"
            >
              <div class="space-y-1.5">
                <div class="flex items-center justify-between gap-2 text-xs">
                  <span class="font-mono-tech text-cyan-400 font-bold tabular-nums">${escHtml(node.stepNum)}</span>
                  <span class="text-[11px] text-[var(--muted)]">${node.active ? "Active Tier" : "Lightweight / Off"}</span>
                </div>
                <p class="text-sm font-bold text-[var(--text)]">${escHtml(node.title)}</p>
                <p class="text-xs font-medium text-indigo-400">${escHtml(node.subtitle)}</p>
              </div>
              <ul class="arch-node-list pt-2 border-t border-[var(--border)]">
                ${node.items
                  .map(
                    (it) => `
                    <li>
                      <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5"></i>
                      <span>${escHtml(it)}</span>
                    </li>
                  `
                  )
                  .join("")}
              </ul>
            </button>
          `;
        })
        .join("");

      const apiListHtml = plan.backend.apiStructure
        .map(
          (line) =>
            `<li class="font-mono-tech text-xs text-[var(--text-secondary)] py-1.5 border-b border-[var(--border)] last:border-b-0">${escHtml(line)}</li>`
        )
        .join("");

      const tablesHtml = plan.database.collectionsOrTables
        .map(
          (tbl) => `
          <div class="py-2 border-b border-[var(--border)] last:border-b-0">
            <p class="font-mono-tech text-xs font-bold text-indigo-400">${escHtml(tbl.name)}</p>
            <p class="font-mono-tech text-[11px] text-[var(--muted)] mt-0.5 break-words">${escHtml(tbl.fields)}</p>
          </div>
        `
        )
        .join("");

      const roadmapHtml = plan.roadmap
        .map(
          (phase, idx) => `
          <article class="arch-roadmap-phase">
            <div class="flex items-center justify-between gap-2">
              <span class="arch-phase-num">${escHtml(phase.phase)} · ${escHtml(phase.duration)}</span>
              <span class="font-mono-tech text-xs text-[var(--muted)] tabular-nums">0${idx + 1}</span>
            </div>
            <h4 class="text-base font-bold text-[var(--text)]">${escHtml(phase.title)}</h4>
            <ul class="space-y-1.5 list-none p-0 m-0 text-xs sm:text-sm text-[var(--text-secondary)]">
              ${phase.deliverables
                .map(
                  (item) => `
                  <li class="flex items-start gap-2">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-1"></i>
                    <span>${escHtml(item)}</span>
                  </li>
                `
                )
                .join("")}
            </ul>
          </article>
        `
        )
        .join("");

      outputMount.innerHTML = `
        <div class="space-y-10 arch-animate-in">
          <!-- Blueprint Header & Export Controls -->
          <div class="glass-card p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                <span class="font-semibold text-cyan-400">${escHtml(engineNotice)}</span>
                <span aria-hidden="true">·</span>
                <span class="tabular-nums">Updated ${escHtml(plan.generatedAt)}</span>
                <span aria-hidden="true">·</span>
                <span>${escHtml(plan.summaryTags.join(" · "))}</span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-[var(--text)]">${escHtml(spec.projectName)} — System Architecture</h2>
              <p class="text-sm text-[var(--muted)]">
                Targeted for <strong class="text-[var(--text-secondary)]">${escHtml(LABELS.targetUsers[spec.targetUsers])}</strong>
                ${plan.selectedFeatureLabels.length ? ` · Modules: ${escHtml(plan.selectedFeatureLabels.join(", "))}` : ""}
              </p>
            </div>

            <div class="arch-export-actions flex flex-wrap items-center gap-2.5 shrink-0">
              <button type="button" id="arch-print-btn" class="primary-button text-xs sm:text-sm py-2.5 px-4">
                <i data-lucide="printer" class="w-4 h-4"></i>
                <span>Print / Save PDF</span>
              </button>
              <button type="button" id="arch-copy-md-btn" class="outline-button text-xs sm:text-sm py-2.5 px-4">
                <i data-lucide="copy" class="w-4 h-4"></i>
                <span>Copy Summary</span>
              </button>
              <button type="button" id="arch-download-md-btn" class="outline-button text-xs sm:text-sm py-2.5 px-4">
                <i data-lucide="download" class="w-4 h-4"></i>
                <span>Download .MD</span>
              </button>
              <button type="button" id="arch-download-json-btn" class="outline-button text-xs sm:text-sm py-2.5 px-4">
                <i data-lucide="file-code-2" class="w-4 h-4"></i>
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          <!-- Layered System Architecture Diagram -->
          <section aria-labelledby="arch-diagram-heading" class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div class="space-y-1">
                <h3 id="arch-diagram-heading" class="text-xl sm:text-2xl font-bold text-[var(--text)]">Architecture Visualization</h3>
                <p class="text-xs sm:text-sm text-[var(--muted)]">Click any tier node below to highlight its matching technical specification card.</p>
              </div>
              <span class="text-xs font-mono-tech text-cyan-400">Request Flow · Left to Right (Stacked on Mobile)</span>
            </div>

            <div class="arch-diagram-canvas space-y-4">
              <div class="arch-diagram-tiers">${diagramHtml}</div>
            </div>
          </section>

          <!-- 5 Core Technical Stack Cards -->
          <section aria-labelledby="arch-cards-heading" class="space-y-4">
            <h3 id="arch-cards-heading" class="text-xl sm:text-2xl font-bold text-[var(--text)]">Technical Architecture Specifications</h3>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Frontend Card -->
              <article id="arch-card-frontend" class="arch-output-card ${focusedCardKey === "frontend" ? "is-highlighted" : ""}">
                <div class="flex items-center gap-3">
                  <div class="service-icon-box" aria-hidden="true"><i data-lucide="layers" class="w-5 h-5"></i></div>
                  <div>
                    <h4 class="text-lg font-bold text-[var(--text)]">Frontend Architecture</h4>
                    <p class="text-xs text-cyan-400 font-medium">${escHtml(plan.frontend.recommendedTech)}</p>
                  </div>
                </div>
                <div class="space-y-2 text-xs sm:text-sm">
                  <p class="font-semibold text-[var(--text-secondary)]">UI Architecture Pattern</p>
                  <p class="text-[var(--muted)] leading-relaxed">${escHtml(plan.frontend.uiArchitecture)}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">Component &amp; Directory Structure</p>
                  <pre class="arch-tree-pre">${escHtml(plan.frontend.componentStructure)}</pre>
                </div>
              </article>

              <!-- Backend Card -->
              <article id="arch-card-backend" class="arch-output-card ${focusedCardKey === "backend" ? "is-highlighted" : ""}">
                <div class="flex items-center gap-3">
                  <div class="service-icon-box" aria-hidden="true"><i data-lucide="server" class="w-5 h-5"></i></div>
                  <div>
                    <h4 class="text-lg font-bold text-[var(--text)]">Backend &amp; API Architecture</h4>
                    <p class="text-xs text-cyan-400 font-medium">${escHtml(plan.backend.technology)}</p>
                  </div>
                </div>
                <div class="space-y-1.5 text-xs sm:text-sm">
                  <p class="font-semibold text-[var(--text-secondary)]">Authentication Flow</p>
                  <p class="text-[var(--muted)] leading-relaxed">${escHtml(plan.backend.authentication)}</p>
                </div>
                <div class="space-y-1.5">
                  <p class="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">Primary API Structure</p>
                  <ul class="list-none p-0 m-0">${apiListHtml}</ul>
                </div>
              </article>

              <!-- Database Card -->
              <article id="arch-card-database" class="arch-output-card ${focusedCardKey === "database" ? "is-highlighted" : ""}">
                <div class="flex items-center gap-3">
                  <div class="service-icon-box" aria-hidden="true"><i data-lucide="database" class="w-5 h-5"></i></div>
                  <div>
                    <h4 class="text-lg font-bold text-[var(--text)]">Database Design</h4>
                    <p class="text-xs text-cyan-400 font-medium">${escHtml(plan.database.recommendation)}</p>
                  </div>
                </div>
                <div class="space-y-1">
                  <p class="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">Recommended Collections / Tables</p>
                  <div class="divide-y divide-[var(--border)]">${tablesHtml}</div>
                </div>
              </article>

              <!-- Infrastructure Card -->
              <article id="arch-card-infrastructure" class="arch-output-card ${focusedCardKey === "infrastructure" ? "is-highlighted" : ""}">
                <div class="flex items-center gap-3">
                  <div class="service-icon-box" aria-hidden="true"><i data-lucide="cloud" class="w-5 h-5"></i></div>
                  <div>
                    <h4 class="text-lg font-bold text-[var(--text)]">Infrastructure &amp; Deployment</h4>
                    <p class="text-xs text-cyan-400 font-medium">${escHtml(LABELS.expectedScale[spec.expectedScale])}</p>
                  </div>
                </div>
                <dl class="space-y-3 text-xs sm:text-sm m-0">
                  <div>
                    <dt class="font-semibold text-[var(--text-secondary)]">Hosting</dt>
                    <dd class="text-[var(--muted)] m-0 mt-0.5">${escHtml(plan.infrastructure.hosting)}</dd>
                  </div>
                  <div>
                    <dt class="font-semibold text-[var(--text-secondary)]">Object &amp; Asset Storage</dt>
                    <dd class="text-[var(--muted)] m-0 mt-0.5">${escHtml(plan.infrastructure.storage)}</dd>
                  </div>
                  <div>
                    <dt class="font-semibold text-[var(--text-secondary)]">CDN &amp; Edge Caching</dt>
                    <dd class="text-[var(--muted)] m-0 mt-0.5">${escHtml(plan.infrastructure.cdn)}</dd>
                  </div>
                  <div>
                    <dt class="font-semibold text-[var(--text-secondary)]">CI/CD Deployment</dt>
                    <dd class="text-[var(--muted)] m-0 mt-0.5">${escHtml(plan.infrastructure.deployment)}</dd>
                  </div>
                </dl>
              </article>

              <!-- Security Card (Full Width) -->
              <article id="arch-card-security" class="arch-output-card lg:col-span-2 ${focusedCardKey === "security" ? "is-highlighted" : ""}">
                <div class="flex items-center gap-3">
                  <div class="service-icon-box" aria-hidden="true"><i data-lucide="shield-check" class="w-5 h-5"></i></div>
                  <div>
                    <h4 class="text-lg font-bold text-[var(--text)]">Security Hardening Blueprint</h4>
                    <p class="text-xs text-cyan-400 font-medium">Defense-in-Depth Controls &amp; Secret Isolation</p>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div class="space-y-1">
                    <p class="font-semibold text-[var(--text-secondary)]">Authentication</p>
                    <p class="text-[var(--muted)] leading-relaxed">${escHtml(plan.security.authentication)}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="font-semibold text-[var(--text-secondary)]">Authorization</p>
                    <p class="text-[var(--muted)] leading-relaxed">${escHtml(plan.security.authorization)}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="font-semibold text-[var(--text-secondary)]">Input Validation</p>
                    <p class="text-[var(--muted)] leading-relaxed">${escHtml(plan.security.validation)}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="font-semibold text-[var(--text-secondary)]">Rate Limiting</p>
                    <p class="text-[var(--muted)] leading-relaxed">${escHtml(plan.security.rateLimiting)}</p>
                  </div>
                  <div class="md:col-span-2 space-y-1">
                    <p class="font-semibold text-[var(--text-secondary)]">Security Headers &amp; Key Safety</p>
                    <p class="text-[var(--muted)] leading-relaxed">${escHtml(plan.security.headers)}</p>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- 7-Phase Development Roadmap -->
          <section aria-labelledby="arch-roadmap-heading" class="space-y-4">
            <div class="space-y-1">
              <h3 id="arch-roadmap-heading" class="text-xl sm:text-2xl font-bold text-[var(--text)]">7-Phase Development Roadmap</h3>
              <p class="text-xs sm:text-sm text-[var(--muted)]">Sequential execution milestones from technical scoping through tested deployment.</p>
            </div>
            <div class="arch-roadmap-list">${roadmapHtml}</div>
          </section>

          <!-- Discuss With AL AMIN CTA -->
          <div class="glass-card p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 arch-export-actions">
            <div class="space-y-1">
              <h3 class="text-lg sm:text-xl font-bold text-[var(--text)]">Want AL AMIN to build this system for your team?</h3>
              <p class="text-xs sm:text-sm text-[var(--muted)]">
                Send your generated requirements directly via the contact page to discuss implementation timelines.
              </p>
            </div>
            <a
              href="contact.html?service=full-stack-web-development&subject=${encodeURIComponent(`Project Architecture Inquiry: ${spec.projectName}`)}"
              class="primary-button text-xs sm:text-sm shrink-0"
            >
              <span>Discuss This Blueprint</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
          </div>
        </div>
      `;

      // Bind interactive node-to-card focus links
      outputMount.querySelectorAll("[data-arch-focus-card]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const targetKey = btn.getAttribute("data-arch-focus-card");
          focusedCardKey = focusedCardKey === targetKey ? null : targetKey;
          renderArchitectureOutput();
          if (focusedCardKey) {
            const cardEl = document.getElementById(`arch-card-${focusedCardKey}`);
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          }
        });
      });

      const printBtn = document.getElementById("arch-print-btn");
      if (printBtn) {
        printBtn.addEventListener("click", () => window.print());
      }

      const copyBtn = document.getElementById("arch-copy-md-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
          const md = buildMarkdownExport(currentPlan);
          try {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
              await navigator.clipboard.writeText(md);
            }
            if (typeof window.showToast === "function") {
              window.showToast("Architecture blueprint copied to clipboard", "success");
            }
          } catch (_err) {
            if (typeof window.showToast === "function") {
              window.showToast("Use Download .MD to save the blueprint", "info");
            }
          }
        });
      }

      const downloadMdBtn = document.getElementById("arch-download-md-btn");
      if (downloadMdBtn) {
        downloadMdBtn.addEventListener("click", () => {
          const slug = (currentPlan.spec.projectName || "project")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          downloadFile(`${slug || "project"}-architecture.md`, buildMarkdownExport(currentPlan), "text/markdown;charset=utf-8");
        });
      }

      const downloadJsonBtn = document.getElementById("arch-download-json-btn");
      if (downloadJsonBtn) {
        downloadJsonBtn.addEventListener("click", () => {
          const slug = (currentPlan.spec.projectName || "project")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          downloadFile(
            `${slug || "project"}-architecture.json`,
            JSON.stringify(currentPlan, null, 2),
            "application/json;charset=utf-8"
          );
        });
      }

      refreshIcons();
    }

    async function regenerateAndRender(shouldScroll) {
      if (!String(currentSpec.projectName || "").trim()) {
        setValidationMessage("Please enter a project name so your architecture blueprint can be generated.");
        currentStep = 1;
        renderStepper();
        renderStepBody();
        return;
      }
      setValidationMessage("");
      currentPlan = await resolveArchitecturePlan(currentSpec);
      renderArchitectureOutput();
      if (shouldScroll && outputMount) {
        outputMount.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentStep > 1) {
          currentStep -= 1;
          setValidationMessage("");
          renderStepper();
          renderStepBody();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentStep === 1 && !String(currentSpec.projectName || "").trim()) {
          setValidationMessage("Please enter a project name before proceeding to Step 2.");
          return;
        }
        setValidationMessage("");
        if (currentStep < 4) {
          currentStep += 1;
          renderStepper();
          renderStepBody();
        }
      });
    }

    if (generateBtn) {
      generateBtn.addEventListener("click", async () => {
        await regenerateAndRender(true);
        if (typeof window.showToast === "function") {
          window.showToast(`Architecture blueprint generated for ${currentSpec.projectName}`, "success");
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", async () => {
        activePresetId = PRESETS[0].id;
        currentStep = 1;
        focusedCardKey = null;
        currentSpec = { ...PRESETS[0].spec, features: [...PRESETS[0].spec.features] };
        setValidationMessage("");
        renderPresets();
        renderStepper();
        renderStepBody();
        await regenerateAndRender(false);
        if (typeof window.showToast === "function") {
          window.showToast("Wizard reset to default workspace specification", "info");
        }
      });
    }

    renderPresets();
    renderStepper();
    renderStepBody();
    renderArchitectureOutput();
  }

  window.PortfolioArchitect = {
    init,
    runRuleBasedArchitect,
    resolveArchitecturePlan,
    buildMarkdownExport,
    FEATURE_CATALOG,
    PRESETS
  };
})();
