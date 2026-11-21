/**
 * AL AMIN Portfolio OS — Phase 45: Rule-Based Client Requirement Analyzer
 * Deterministic local keyword & pattern extraction across pasted client briefs.
 * Does NOT claim actual AI when operating locally and never exposes API keys.
 * Includes a clean server-proxy adapter hook for future backend AI integration.
 */

const PortfolioRequirementAnalyzer = (() => {
  const MAX_BRIEF_LENGTH = 5000;

  const SAMPLE_BRIEFS = [
    {
      id: "b2b-saas",
      label: "B2B SaaS Platform",
      text:
        "We need a multi-tenant B2B SaaS web platform for operations teams to manage workflows, track team analytics, and export CSV reports. Users should sign up via Google OAuth or email/password with role-based permissions. We require Stripe recurring monthly subscriptions, an internal admin dashboard for tenant billing and user moderation, REST API endpoints with Slack webhooks, strong input security, and fast responsive mobile support for deployment on cloud infrastructure."
    },
    {
      id: "ecommerce-store",
      label: "Headless E-Commerce",
      text:
        "Looking to build an online e-commerce storefront for our retail apparel brand. Customers need fast product search and category filters, cart persistence, Stripe checkout payments, order tracking accounts, and email order confirmations. Our staff also needs an admin dashboard to manage product inventory and fulfill orders. Must load cleanly on mobile devices (320px+) and support SEO product pages."
    },
    {
      id: "edtech-portal",
      label: "Student & Course Portal",
      text:
        "Our academy wants a responsive academic portal and admin dashboard for 500 students and instructors. Required features include student profiles, attendance logging, downloadable study materials/file uploads, course enrollment search, and REST APIs backed by PostgreSQL or MongoDB. No online card checkout is required in phase 1, only email login and strict role permissions."
    }
  ];

  const state = {
    initialized: false,
    briefText: "",
    lastAnalysis: null,
    backendOverride: {
      enabled: false,
      mode: "local",
      backendEndpoint: ""
    }
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

  function showToast(msg, type = "info") {
    if (typeof window.showToast === "function") {
      window.showToast(msg, type);
    }
  }

  function analyzeBriefLocally(rawInput) {
    const raw = String(rawInput || "").trim().slice(0, MAX_BRIEF_LENGTH);
    const text = raw.toLowerCase();

    if (!raw) {
      return null;
    }

    const hasAny = (patterns) => patterns.some((re) => re.test(text));

    // 1. Project Type
    let projectType = "Custom Web Application";
    if (hasAny([/\bsaas\b/, /\bmulti[- ]tenant\b/, /\bsubscription platform\b/])) {
      projectType = "Multi-Tenant SaaS Web Application";
    } else if (hasAny([/\be[- ]?commerce\b/, /\bstorefront\b/, /\bshop\b/, /\bcart\b/, /\bcheckout\b/])) {
      projectType = "E-Commerce Storefront & Order Platform";
    } else if (hasAny([/\bdashboard\b/, /\badmin portal\b/, /\binternal tool\b/, /\bcrm\b/])) {
      projectType = "Operational Web Portal & Admin Dashboard";
    } else if (hasAny([/\blanding page\b/, /\bmarketing site\b/, /\bbrochure\b/, /\bcompany website\b/])) {
      projectType = "Marketing & Conversion Website";
    } else if (hasAny([/\bapi\b/, /\bbackend\b/, /\bmicroservice\b/]) && !hasAny([/\bui\b/, /\bfrontend\b/, /\bwebsite\b/])) {
      projectType = "Backend API & Service Layer";
    }

    // 2. Business Type
    let businessType = "Digital Product / Startup";
    if (hasAny([/\bb2b\b/, /\benterprise\b/, /\bteams\b/, /\boperations\b/])) {
      businessType = "B2B Operations & Team Software";
    } else if (hasAny([/\bretail\b/, /\bbrand\b/, /\bstore\b/, /\bapparel\b/, /\bmerchandise\b/, /\be[- ]?commerce\b/])) {
      businessType = "Retail & D2C E-Commerce";
    } else if (hasAny([/\bedtech\b/, /\bschool\b/, /\bacademy\b/, /\bstudent\b/, /\bcourse\b/, /\blearning\b/])) {
      businessType = "Education & EdTech";
    } else if (hasAny([/\bhealth\b/, /\bclinic\b/, /\bpatient\b/, /\bfitness\b/, /\bmedical\b/])) {
      businessType = "Healthcare & Wellness";
    } else if (hasAny([/\bfintech\b/, /\bbilling\b/, /\binvoic\b/, /\bfinance\b/, /\bledger\b/])) {
      businessType = "FinTech & Financial Operations";
    } else if (hasAny([/\bagency\b/, /\bportfolio\b/, /\bcreative\b/])) {
      businessType = "Agency & Creative Services";
    }

    // 3. Required Features
    const featureMatchers = [
      { label: "User Accounts & Profiles", re: /\b(user|account|profile|sign up|signup|login|member)\b/ },
      { label: "Search & Multi-Faceted Filtering", re: /\b(search|filter|catalog|directory)\b/ },
      { label: "Analytics & Reporting / Exports", re: /\b(analytics|report|metrics|chart|csv|export|kpi)\b/ },
      { label: "Shopping Cart & Checkout Flow", re: /\b(cart|checkout|catalog|inventory|order tracking)\b/ },
      { label: "File & Media Uploads", re: /\b(upload|file|image|pdf|document|media|storage)\b/ },
      { label: "Notifications & Email Alerts", re: /\b(notification|email|alert|reminder|slack)\b/ },
      { label: "Booking & Scheduling", re: /\b(book|booking|schedule|calendar|appointment)\b/ },
      { label: "Real-Time Updates / Live Sync", re: /\b(real[- ]?time|live|websocket|socket|instant sync)\b/ },
      { label: "Multi-Language (i18n)", re: /\b(multi[- ]?language|i18n|localization|translation)\b/ },
      { label: "Workflow & Task Management", re: /\b(workflow|task|attendance|crud|manage)\b/ }
    ];
    const requiredFeatures = featureMatchers.filter((f) => f.re.test(text)).map((f) => f.label);
    if (requiredFeatures.length === 0) {
      requiredFeatures.push("Core Responsive Views", "Structured Content Navigation", "Contact / Lead Capture Flow");
    }

    // 4. Frontend Technologies
    const frontendTechnologies = [];
    if (hasAny([/\bnext\.?js\b/, /\bseo\b/, /\bssr\b/, /\be[- ]?commerce\b/])) {
      frontendTechnologies.push("Next.js", "React");
    } else {
      frontendTechnologies.push("React");
    }
    if (hasAny([/\btypescript\b/, /\bts\b/])) frontendTechnologies.push("TypeScript");
    frontendTechnologies.push("Tailwind CSS");
    if (hasAny([/\bredux\b/, /\bcart\b/, /\bmulti[- ]?tenant\b/, /\bcomplex state\b/])) {
      frontendTechnologies.push("Redux / Structured Client State");
    }
    if (hasAny([/\bhtml\b/, /\bstatic\b/, /\blanding page\b/])) {
      frontendTechnologies.push("Semantic HTML5 / CSS3");
    }

    // 5. Backend Technologies
    const needsBackend =
      hasAny([/\bapi\b/, /\bbackend\b/, /\bnode\b/, /\bexpress\b/, /\bdatabase\b/, /\bmongodb\b/, /\bpostgres\b/, /\bauth\b/, /\blogin\b/, /\bpayment\b/, /\bstripe\b/, /\bdashboard\b/, /\bsaas\b/, /\bupload\b/, /\border\b/]);
    const backendTechnologies = needsBackend
      ? ["Node.js", "Express REST API", "Schema Validation Middleware (Zod / Joi)"]
      : ["Lightweight Serverless / Static Form Handler"];
    if (hasAny([/\bwebhook\b/, /\bslack\b/, /\bemail\b/, /\bstripe\b/])) {
      backendTechnologies.push("Webhook & Async Job Handlers");
    }

    // 6. Database Requirements
    let databaseRequirements = "None required if strictly static informational content";
    if (hasAny([/\bpostgres\b/, /\bsql\b/, /\bledger\b/, /\bfinance\b/, /\binvoic\b/, /\brelational\b/]) && hasAny([/\bmongo\b/])) {
      databaseRequirements = "Hybrid PostgreSQL (transactional ledgers) + MongoDB (flexible documents)";
    } else if (hasAny([/\bpostgres\b/, /\bsql\b/, /\bledger\b/, /\binvoic\b/, /\border\b/])) {
      databaseRequirements = "PostgreSQL relational schema with indexed foreign-key constraints";
    } else if (needsBackend) {
      databaseRequirements = "MongoDB + Mongoose ODM with compound tenant/query indexes";
    }

    // 7. Authentication
    let authentication = "Public access (no account login specified)";
    const hasOAuth = hasAny([/\boauth\b/, /\bgoogle\b/, /\bgithub\b/, /\bsso\b/]);
    const hasRBAC = hasAny([/\brole\b/, /\bpermission\b/, /\brbac\b/, /\binstructor\b/, /\bstaff\b/, /\bmoderation\b/, /\btenant\b/]);
    const hasLogin = hasAny([/\blogin\b/, /\bsign ?up\b/, /\bauth\b/, /\baccount\b/, /\bprofile\b/]);
    if (hasRBAC && hasOAuth) {
      authentication = "Email/Password + OAuth (Google/GitHub) + JWT & Role-Based Access Control (RBAC)";
    } else if (hasRBAC) {
      authentication = "Session / JWT Authentication with strict Role-Based Access Control (RBAC)";
    } else if (hasOAuth) {
      authentication = "Email/Password + OAuth 2.0 Social Login with HTTP-only session cookies";
    } else if (hasLogin) {
      authentication = "Email & Password authentication with hashed credentials and session/JWT tokens";
    }

    // 8. Payment Requirements
    let paymentRequirements = "No online payment gateway detected in brief";
    if (hasAny([/\brecurring\b/, /\bsubscription\b/, /\bbilling\b/, /\bsaas\b/]) && hasAny([/\bstripe\b/, /\bpayment\b/, /\bcheckout\b/, /\bpay\b/])) {
      paymentRequirements = "Recurring SaaS Subscriptions & Billing Portal (Stripe Subscriptions + Webhook Sync)";
    } else if (hasAny([/\bstripe\b/, /\bcheckout\b/, /\bpayment\b/, /\bcart\b/, /\border\b/])) {
      paymentRequirements = "One-time Checkout & Verified Payment Webhook Processing (Stripe / Gateway)";
    } else if (hasAny([/\bsaas\b/])) {
      paymentRequirements = "Optional future Stripe subscription tiers (not explicitly requested in phase 1)";
    }

    // 9. Admin Dashboard
    let adminDashboard = "Not explicitly requested (optional lightweight content editor)";
    if (hasAny([/\badmin\b/, /\bmoderation\b/, /\binventory\b/, /\btenant\b/, /\bstaff\b/, /\bfulfill\b/, /\battendance\b/])) {
      adminDashboard = "Dedicated Operations Admin Console (user/role management, CRUD workflows, reporting)";
    } else if (hasAny([/\bdashboard\b/])) {
      adminDashboard = "Interactive Management Dashboard with KPI views and filterable records";
    }

    // 10. API Requirements
    let apiRequirements = "Minimal contact / inquiry endpoint only";
    const apiParts = [];
    if (needsBackend) apiParts.push("Versioned REST API (`/api/v1/*`)");
    if (hasAny([/\bwebhook\b/, /\bslack\b/, /\bstripe\b/, /\bthird[- ]?party\b/, /\bintegration\b/])) {
      apiParts.push("Verified Inbound/Outbound Webhooks");
    }
    if (hasAny([/\breal[- ]?time\b/, /\bwebsocket\b/, /\blive\b/])) {
      apiParts.push("WebSocket / Server-Sent Events (SSE) Stream");
    }
    if (apiParts.length > 0) {
      apiRequirements = apiParts.join(" + ");
    }

    // 11. Security Requirements
    const securityList = [
      "Strict request schema validation & server-side authorization checks",
      "XSS output sanitization & CSRF-safe session handling"
    ];
    if (needsBackend) securityList.push("Environment-isolated secrets (zero client API keys) & rate limiting");
    if (hasAny([/\bpayment\b/, /\bstripe\b/, /\bcheckout\b/])) {
      securityList.push("Signed webhook verification & PCI-compliant hosted payment fields");
    }
    if (hasRBAC) {
      securityList.push("Tenant/role boundary enforcement on every database query");
    }
    const securityRequirements = securityList.join("; ");

    // 12. Responsive Requirements
    const responsiveRequirements = hasAny([/\bmobile\b/, /\b320px\b/, /\bresponsive\b/, /\bphone\b/])
      ? "Explicitly required mobile-first responsive UI tested cleanly from 320px to 2560px with 44px+ touch targets"
      : "Standard responsive breakpoints (mobile, tablet, desktop) with zero horizontal overflow";

    // 13. Deployment Requirements
    const deploymentRequirements = needsBackend
      ? "Containerized/managed Node.js API service, managed cloud database (MongoDB Atlas / PostgreSQL), CDN frontend delivery, environment separation (staging/prod), and health checks"
      : "Global CDN static asset deployment with HTTPS, cache headers, and SEO metadata validation";

    // Complexity Scoring (Transparent Engineering Signal Count, not a price quote)
    let signalScore = 0;
    if (needsBackend) signalScore += 2;
    if (hasLogin || hasOAuth) signalScore += 1;
    if (hasRBAC) signalScore += 2;
    if (/Recurring|One-time/.test(paymentRequirements)) signalScore += 2;
    if (/Dedicated|Interactive/.test(adminDashboard)) signalScore += 2;
    if (hasAny([/\bwebhook\b/, /\bslack\b/, /\breal[- ]?time\b/, /\bupload\b/, /\bmulti[- ]?tenant\b/])) signalScore += 2;
    if (requiredFeatures.length >= 4) signalScore += 1;

    let complexityLevel = "Low / Focused MVP";
    let complexityReason = "Primarily static or single-workflow scope with minimal stateful integrations.";
    if (signalScore >= 7) {
      complexityLevel = "High / Multi-Module Full-Stack System";
      complexityReason = "Combines stateful backend persistence, RBAC/authentication, external integrations/webhooks, and dedicated administrative interfaces.";
    } else if (signalScore >= 3) {
      complexityLevel = "Moderate / Standard Full-Stack Build";
      complexityReason = "Includes custom client workflows backed by structured APIs, database schemas, and responsive views.";
    }

    // Architecture Layers
    const suggestedArchitecture = {
      client: `${frontendTechnologies.slice(0, 3).join(" + ")} modular UI layer with accessible keyboard/mobile navigation and validated form state.`,
      api: needsBackend
        ? `${backendTechnologies.join(" + ")} enforcing auth/RBAC middleware and clean JSON envelopes.`
        : "Static progressive enhancement with lightweight form/endpoint integration.",
      dataSecurity: `${databaseRequirements}. Guarded by ${securityList[0].toLowerCase()}.`
    };

    // Suggested Development Phases
    const developmentPhases = [
      {
        phase: "01",
        title: "Discovery, Wireframes & Data Modeling",
        detail: `Finalize user roles, database schemas (${needsBackend ? "entities & indexes" : "content models"}), and core acceptance criteria.`
      },
      {
        phase: "02",
        title: "Frontend Interface & Responsive System",
        detail: `Build core ${frontendTechnologies[0]} components across mobile (320px+) and desktop viewports with accessible navigation.`
      },
      {
        phase: "03",
        title: needsBackend ? "Backend APIs, Auth & Integrations" : "SEO, Metadata & Interactive Enhancements",
        detail: needsBackend
          ? `Implement ${apiRequirements}, ${authentication}, and ${/No online/.test(paymentRequirements) ? "core CRUD workflows" : paymentRequirements}.`
          : "Configure Open Graph metadata, sitemap/robots, accessible interactive states, and static asset optimization."
      },
      {
        phase: "04",
        title: "Security QA, Cross-Device Audit & Deployment",
        detail: `Verify input validation, RBAC edge cases, Core Web Vitals, and deploy via ${deploymentRequirements.split(",")[0]}.`
      }
    ];

    // Potential Risks
    const potentialRisks = [];
    if (hasAny([/\bmulti[- ]?tenant\b/])) {
      potentialRisks.push("Tenant data isolation bugs if every query does not strictly scope by workspace/tenant ID.");
    }
    if (/Recurring|One-time/.test(paymentRequirements)) {
      potentialRisks.push("Out-of-sync subscription/payment states if payment gateway webhooks fail or arrive out of order without idempotency keys.");
    }
    if (hasAny([/\bupload\b/, /\bmedia\b/, /\bfile\b/])) {
      potentialRisks.push("Large binary upload costs or MIME spoofing without signed direct-to-object-storage URLs and file validation.");
    }
    if (requiredFeatures.length >= 5) {
      potentialRisks.push("Phase 1 timeline expansion if secondary convenience features are bundled before validating the core user loop.");
    }
    if (!hasLogin && hasAny([/\badmin\b/, /\bdashboard\b/])) {
      potentialRisks.push("Admin portal mentioned without explicit staff login/role boundary rules.");
    }
    if (potentialRisks.length === 0) {
      potentialRisks.push("Under-specified content structure or third-party integration constraints prior to sprint kickoff.");
    }

    // Questions for Client
    const clientQuestions = [];
    if (!hasAny([/\bdeadline\b/, /\bweek\b/, /\bmonth\b/, /\bq[1-4]\b/, /\blaunch\b/])) {
      clientQuestions.push("What is your target launch window or phase-1 MVP milestone date?");
    }
    if (!hasAny([/\bpostgres\b/, /\bmongo\b/, /\bhosting\b/, /\baws\b/, /\bvercel\b/])) {
      clientQuestions.push("Do you have preferred hosting infrastructure or existing cloud/database accounts?");
    }
    if (/No online payment/.test(paymentRequirements)) {
      clientQuestions.push("Will monetization or invoicing remain offline for phase 1, or should payment hooks be prepared?");
    } else {
      clientQuestions.push("Which regional payment gateway currencies, tax rules, or invoice formats must be supported at launch?");
    }
    if (hasAny([/\bbranding\b/, /\bdesign\b/, /\bfigma\b/])) {
      clientQuestions.push("Are existing brand guidelines or Figma wireframes already available for UI implementation?");
    } else {
      clientQuestions.push("Do you have an existing brand guide/Figma mockup, or should UI design be included from scratch?");
    }
    clientQuestions.push("Who will maintain content/operations post-launch and what permissions do non-technical admins need?");

    const projectSummary = `This brief outlines a ${projectType.toLowerCase()} for the ${businessType.toLowerCase()} domain. Key technical scope centers on ${requiredFeatures
      .slice(0, 3)
      .join(", ")} with ${/Public access/.test(authentication) ? "public user access" : authentication.toLowerCase()} and ${complexityLevel.toLowerCase()} engineering complexity.`;

    return {
      analyzedAt: new Date().toISOString(),
      wordCount: raw.split(/\s+/).filter(Boolean).length,
      engineLabel: "Rule-Based Local Analyzer (Deterministic Pattern Extraction)",
      projectSummary,
      extracted: {
        projectType,
        businessType,
        requiredFeatures,
        frontendTechnologies,
        backendTechnologies,
        databaseRequirements,
        authentication,
        paymentRequirements,
        adminDashboard,
        apiRequirements,
        securityRequirements,
        responsiveRequirements,
        deploymentRequirements
      },
      recommendedTechnology: [
        ...frontendTechnologies,
        ...backendTechnologies.slice(0, 2),
        databaseRequirements.split(" ")[0] === "None" ? "Static Build" : databaseRequirements.split(" ")[0]
      ],
      suggestedArchitecture,
      estimatedComplexity: {
        level: complexityLevel,
        signalScore,
        reason: complexityReason
      },
      developmentPhases,
      potentialRisks,
      clientQuestions,
      suggestedNextStep:
        "Review the clarifying questions above, optionally explore the Scope Estimator for rough phase ranges, and submit a structured brief via the Project Request Wizard."
    };
  }

  /**
   * Future secure backend-AI integration hook.
   * Calls only a user-configured server route (`/api/...`) — zero API keys in browser JS.
   */
  async function analyzeWithOptionalBackend(rawInput) {
    const cfg = (window.portfolioConfig && (window.portfolioConfig.analyzer || window.portfolioConfig.assistant)) || {};
    const mode = state.backendOverride.enabled ? state.backendOverride.mode : (cfg.mode || "local");
    const endpoint = state.backendOverride.enabled
      ? state.backendOverride.backendEndpoint
      : (cfg.backendEndpoint || "");

    if (mode === "backend" && endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief: String(rawInput || "").slice(0, MAX_BRIEF_LENGTH) })
        });
        if (res.ok) {
          const payload = await res.json();
          if (payload && payload.extracted && payload.projectSummary) {
            return payload;
          }
        }
      } catch (_err) {
        // Fall back safely to local rule-based analysis
      }
    }

    return analyzeBriefLocally(rawInput);
  }

  function configureBackend(options = {}) {
    state.backendOverride.enabled = true;
    if (options.mode === "backend" || options.mode === "local") {
      state.backendOverride.mode = options.mode;
    }
    if (typeof options.backendEndpoint === "string") {
      state.backendOverride.backendEndpoint = options.backendEndpoint.trim();
    }
  }

  function formatAnalysisAsText(analysis) {
    if (!analysis) return "";
    const ex = analysis.extracted;
    return [
      "AL AMIN PORTFOLIO OS — CLIENT REQUIREMENT ANALYSIS",
      `Engine: ${analysis.engineLabel}`,
      "Note: Exploratory technical analysis only — not an official price quote or contract.",
      "",
      "1. PROJECT SUMMARY",
      analysis.projectSummary,
      "",
      "2. DETECTED REQUIREMENTS",
      `- Project Type: ${ex.projectType}`,
      `- Business Type: ${ex.businessType}`,
      `- Required Features: ${ex.requiredFeatures.join(", ")}`,
      `- Frontend Technologies: ${ex.frontendTechnologies.join(", ")}`,
      `- Backend Technologies: ${ex.backendTechnologies.join(", ")}`,
      `- Database Requirements: ${ex.databaseRequirements}`,
      `- Authentication: ${ex.authentication}`,
      `- Payment Requirements: ${ex.paymentRequirements}`,
      `- Admin Dashboard: ${ex.adminDashboard}`,
      `- API Requirements: ${ex.apiRequirements}`,
      `- Security Requirements: ${ex.securityRequirements}`,
      `- Responsive Requirements: ${ex.responsiveRequirements}`,
      `- Deployment Requirements: ${ex.deploymentRequirements}`,
      "",
      "3. RECOMMENDED TECHNOLOGY",
      analysis.recommendedTechnology.join(" · "),
      "",
      "4. SUGGESTED ARCHITECTURE",
      `- Client Layer: ${analysis.suggestedArchitecture.client}`,
      `- API Layer: ${analysis.suggestedArchitecture.api}`,
      `- Data & Security: ${analysis.suggestedArchitecture.dataSecurity}`,
      "",
      "5. ESTIMATED COMPLEXITY",
      `${analysis.estimatedComplexity.level} — ${analysis.estimatedComplexity.reason}`,
      "",
      "6. SUGGESTED DEVELOPMENT PHASES",
      ...analysis.developmentPhases.map((p) => `- Phase ${p.phase} (${p.title}): ${p.detail}`),
      "",
      "7. POTENTIAL RISKS",
      ...analysis.potentialRisks.map((r) => `- ${r}`),
      "",
      "8. QUESTIONS FOR CLIENT",
      ...analysis.clientQuestions.map((q) => `- ${q}`),
      "",
      "9. SUGGESTED NEXT STEP",
      analysis.suggestedNextStep
    ].join("\n");
  }

  function renderAnalysisResults(analysis) {
    const mount = document.getElementById("ra-results-mount");
    const emptyState = document.getElementById("ra-empty-state");
    const actionButtons = document.querySelectorAll("[data-ra-requires-output]");
    if (!mount) return;

    const hasResult = Boolean(analysis);
    actionButtons.forEach((btn) => {
      btn.disabled = !hasResult;
    });

    if (!hasResult) {
      mount.innerHTML = "";
      mount.classList.add("hidden");
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    mount.classList.remove("hidden");

    const ex = analysis.extracted;
    const reqEntries = [
      ["Project Type", ex.projectType],
      ["Business Type", ex.businessType],
      ["Required Features", ex.requiredFeatures.join(" · ")],
      ["Frontend Technologies", ex.frontendTechnologies.join(" · ")],
      ["Backend Technologies", ex.backendTechnologies.join(" · ")],
      ["Database Requirements", ex.databaseRequirements],
      ["Authentication", ex.authentication],
      ["Payment Requirements", ex.paymentRequirements],
      ["Admin Dashboard", ex.adminDashboard],
      ["API Requirements", ex.apiRequirements],
      ["Security Requirements", ex.securityRequirements],
      ["Responsive Requirements", ex.responsiveRequirements],
      ["Deployment Requirements", ex.deploymentRequirements]
    ];

    mount.innerHTML = `
      <div class="space-y-6">
        <!-- Non-Quote Disclaimer & Complexity Header -->
        <div class="ra-panel space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
            <span class="font-semibold text-cyan-400">${escHtml(analysis.engineLabel)}</span>
            <span class="font-mono-tech tabular-nums">${escHtml(String(analysis.wordCount))} words analyzed</span>
          </div>
          <h2 class="text-lg sm:text-xl font-bold text-[var(--text)]">Project Summary</h2>
          <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(analysis.projectSummary)}</p>
          <p class="text-xs text-amber-400/95 font-medium pt-1">
            Advisory Note: This automated rule-based breakdown supports technical scoping only and is not an official quote, fixed price, or commercial proposal.
          </p>
        </div>

        <!-- Detected 13 Requirement Dimensions -->
        <section class="ra-panel space-y-4" aria-labelledby="ra-detected-heading">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 id="ra-detected-heading" class="text-base sm:text-lg font-bold text-[var(--text)]">Detected Requirements (13 Dimensions)</h2>
            <span class="text-xs font-mono-tech text-[var(--muted)]">Rule-Based Extraction</span>
          </div>
          <div class="ra-output-grid">
            ${reqEntries
              .map(
                ([label, val]) => `
                  <div class="ra-kv-card space-y-1">
                    <p class="text-[11px] font-bold uppercase tracking-wider text-indigo-400">${escHtml(label)}</p>
                    <p class="text-xs sm:text-sm text-[var(--text)] leading-relaxed">${escHtml(val)}</p>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>

        <!-- Recommended Technology & Estimated Complexity -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section class="ra-panel space-y-2.5" aria-labelledby="ra-tech-heading">
            <h2 id="ra-tech-heading" class="text-base font-bold text-[var(--text)]">Recommended Technology</h2>
            <p class="text-sm font-mono-tech text-cyan-400 leading-relaxed">${escHtml(analysis.recommendedTechnology.join(" · "))}</p>
            <p class="text-xs text-[var(--muted)]">Aligned with AL AMIN's production full-stack MERN and Next.js stack.</p>
          </section>

          <section class="ra-panel space-y-2.5" aria-labelledby="ra-complexity-heading">
            <h2 id="ra-complexity-heading" class="text-base font-bold text-[var(--text)]">Estimated Complexity</h2>
            <p class="text-base font-bold text-indigo-400">${escHtml(analysis.estimatedComplexity.level)}</p>
            <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(analysis.estimatedComplexity.reason)}</p>
          </section>
        </div>

        <!-- Suggested Architecture -->
        <section class="ra-panel space-y-3" aria-labelledby="ra-arch-heading">
          <h2 id="ra-arch-heading" class="text-base sm:text-lg font-bold text-[var(--text)]">Suggested Architecture</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="ra-kv-card space-y-1">
              <p class="text-xs font-bold text-cyan-400">Client UI Layer</p>
              <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(analysis.suggestedArchitecture.client)}</p>
            </div>
            <div class="ra-kv-card space-y-1">
              <p class="text-xs font-bold text-indigo-400">API &amp; Logic Layer</p>
              <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(analysis.suggestedArchitecture.api)}</p>
            </div>
            <div class="ra-kv-card space-y-1">
              <p class="text-xs font-bold text-violet-400">Data &amp; Security Layer</p>
              <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(analysis.suggestedArchitecture.dataSecurity)}</p>
            </div>
          </div>
        </section>

        <!-- Suggested Development Phases -->
        <section class="ra-panel space-y-3" aria-labelledby="ra-phases-heading">
          <h2 id="ra-phases-heading" class="text-base sm:text-lg font-bold text-[var(--text)]">Suggested Development Phases</h2>
          <div class="space-y-2.5">
            ${analysis.developmentPhases
              .map(
                (p) => `
                  <div class="ra-phase-row">
                    <span class="ra-phase-badge">P${escHtml(p.phase)}</span>
                    <div class="space-y-0.5 min-w-0">
                      <h3 class="text-sm font-bold text-[var(--text)]">${escHtml(p.title)}</h3>
                      <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escHtml(p.detail)}</p>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>

        <!-- Potential Risks & Questions for Client -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section class="ra-panel space-y-3" aria-labelledby="ra-risks-heading">
            <h2 id="ra-risks-heading" class="text-base font-bold text-[var(--text)]">Potential Risks</h2>
            <ul class="space-y-2 list-none p-0 m-0">
              ${analysis.potentialRisks
                .map(
                  (risk) => `
                    <li class="flex items-start gap-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true"></i>
                      <span>${escHtml(risk)}</span>
                    </li>
                  `
                )
                .join("")}
            </ul>
          </section>

          <section class="ra-panel space-y-3" aria-labelledby="ra-questions-heading">
            <h2 id="ra-questions-heading" class="text-base font-bold text-[var(--text)]">Questions for Client</h2>
            <ul class="space-y-2 list-none p-0 m-0">
              ${analysis.clientQuestions
                .map(
                  (q) => `
                    <li class="flex items-start gap-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      <i data-lucide="help-circle" class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true"></i>
                      <span>${escHtml(q)}</span>
                    </li>
                  `
                )
                .join("")}
            </ul>
          </section>
        </div>

        <!-- Suggested Next Step -->
        <section class="ra-panel space-y-4" aria-labelledby="ra-next-heading">
          <div class="space-y-1.5">
            <h2 id="ra-next-heading" class="text-base sm:text-lg font-bold text-[var(--text)]">Suggested Next Step</h2>
            <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(analysis.suggestedNextStep)}</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <a href="project-request.html" class="primary-button text-xs sm:text-sm min-h-[44px]">
              <span>Start Project Request</span>
              <i data-lucide="arrow-right" class="w-4 h-4" aria-hidden="true"></i>
            </a>
            <a href="project-estimator.html" class="outline-button text-xs sm:text-sm min-h-[44px]">
              <span>Scope Estimator</span>
            </a>
            <a href="contact.html" class="outline-button text-xs sm:text-sm min-h-[44px]">
              <span>Direct Contact</span>
            </a>
          </div>
        </section>
      </div>
    `;

    refreshIcons();
  }

  function copyAnalysis() {
    if (!state.lastAnalysis) {
      showToast("Analyze a brief first before copying", "warning");
      return;
    }
    const text = formatAnalysisAsText(state.lastAnalysis);
    const done = () => showToast("Requirement analysis copied to clipboard", "success");
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
    function fallback() {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch (_err) {
        showToast("Unable to copy analysis automatically", "error");
      }
    }
  }

  function downloadAnalysis() {
    if (!state.lastAnalysis) {
      showToast("Analyze a brief first before downloading", "warning");
      return;
    }
    const text = formatAnalysisAsText(state.lastAnalysis);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "AL_AMIN_Requirement_Analysis.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Downloaded AL_AMIN_Requirement_Analysis.txt", "success");
  }

  async function runAnalyze() {
    const input = document.getElementById("ra-brief-input");
    const errorEl = document.getElementById("ra-input-error");
    const raw = input ? input.value.trim() : state.briefText.trim();

    if (!raw || raw.length < 15) {
      if (errorEl) {
        errorEl.textContent = "Please paste a project brief (at least 15 characters) or select a sample brief below.";
        errorEl.classList.remove("hidden");
      }
      if (input && typeof input.focus === "function") input.focus();
      return;
    }

    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.add("hidden");
    }

    state.briefText = raw;
    const result = await analyzeWithOptionalBackend(raw);
    state.lastAnalysis = result;
    renderAnalysisResults(result);
    showToast("Requirement breakdown generated", "success");
  }

  function init() {
    const root = document.getElementById("requirement-analyzer-root");
    if (!root || state.initialized) return;
    state.initialized = true;

    const input = document.getElementById("ra-brief-input");
    const analyzeBtn = document.getElementById("ra-analyze-btn");
    const clearBtn = document.getElementById("ra-clear-btn");
    const copyBtn = document.getElementById("ra-copy-btn");
    const printBtn = document.getElementById("ra-print-btn");
    const downloadBtn = document.getElementById("ra-download-btn");
    const samplesMount = document.getElementById("ra-samples-mount");

    if (samplesMount) {
      samplesMount.innerHTML = SAMPLE_BRIEFS.map(
        (s) => `
          <button type="button" class="ra-sample-btn" data-ra-sample="${escHtml(s.id)}">
            ${escHtml(s.label)}
          </button>
        `
      ).join("");

      samplesMount.querySelectorAll("[data-ra-sample]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-ra-sample");
          const found = SAMPLE_BRIEFS.find((s) => s.id === id);
          if (found && input) {
            input.value = found.text;
            runAnalyze();
          }
        });
      });
    }

    if (analyzeBtn) analyzeBtn.addEventListener("click", runAnalyze);
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (input) input.value = "";
        state.briefText = "";
        state.lastAnalysis = null;
        renderAnalysisResults(null);
        const errorEl = document.getElementById("ra-input-error");
        if (errorEl) errorEl.classList.add("hidden");
      });
    }
    if (copyBtn) copyBtn.addEventListener("click", copyAnalysis);
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        if (!state.lastAnalysis) {
          showToast("Analyze a brief first before printing", "warning");
          return;
        }
        if (typeof window.print === "function") window.print();
      });
    }
    if (downloadBtn) downloadBtn.addEventListener("click", downloadAnalysis);

    renderAnalysisResults(null);
    refreshIcons();
  }

  return {
    init,
    analyzeBriefLocally,
    analyzeWithOptionalBackend,
    formatAnalysisAsText,
    configureBackend,
    SAMPLE_BRIEFS
  };
})();

window.PortfolioRequirementAnalyzer = PortfolioRequirementAnalyzer;
