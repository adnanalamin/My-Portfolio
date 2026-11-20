/**
 * AL AMIN Portfolio — Phase 24: Smart Project Request Wizard
 * 7-step interactive project brief system + Final Summary & Submission.
 * Security: strict field validation, zero credential exposure, in-memory state only (no sensitive localStorage persistence).
 */

(() => {
  const PROJECT_TYPES = [
    { id: "Website", description: "Corporate, brand, or informational multi-page site" },
    { id: "Web Application", description: "Interactive stateful app with custom user workflows" },
    { id: "SaaS", description: "Multi-tenant software platform with subscriptions" },
    { id: "E-commerce", description: "Online store with cart, catalog, and checkout" },
    { id: "Dashboard", description: "Operational analytics, CRUD, and reporting console" },
    { id: "Landing Page", description: "Focused conversion or product launch page" },
    { id: "Custom Software", description: "Bespoke internal tool, portal, or automation system" },
    { id: "Other", description: "Specify custom project scope in your own words" }
  ];

  const INDUSTRIES = [
    "SaaS & Technology",
    "E-Commerce & Retail",
    "Education & EdTech",
    "Healthcare & Wellness",
    "FinTech & Operations",
    "Agency & Creative Studio",
    "Real Estate & Services",
    "Other"
  ];

  const FEATURE_OPTIONS = [
    "Responsive Mobile-First UI",
    "User Accounts & Profiles",
    "Search & Multi-Faceted Filtering",
    "Booking / Scheduling",
    "Analytics & Reporting",
    "File / Media Uploads",
    "Email / Push Notifications",
    "Multi-Language (i18n)"
  ];

  const TECH_OPTIONS = {
    authentication: [
      "Not Needed (Public Site)",
      "Email & Password Login",
      "Social OAuth (Google/GitHub) + JWT",
      "Enterprise SSO + Role Permissions (RBAC)"
    ],
    payment: [
      "None",
      "One-Time Checkout (Stripe / Gateway)",
      "Recurring Subscriptions & Invoices",
      "Marketplace Split Payouts"
    ],
    database: [
      "None (Static Content)",
      "MongoDB Document Database",
      "PostgreSQL Relational Database",
      "Unsure — Recommend Best Fit"
    ],
    adminPanel: [
      "None Needed",
      "Basic Content & Inquiry Editor",
      "Full Operations, Users & Analytics CRUD"
    ],
    api: [
      "None",
      "REST API Endpoints",
      "REST API + External Webhooks",
      "Real-Time WebSockets / Live Updates"
    ],
    ai: [
      "None",
      "Smart Search & Recommendations",
      "Conversational Assistant (Server-Proxied)",
      "Document / Workflow AI Automation (Server-Proxied)"
    ],
    integrations: [
      "Stripe / Billing",
      "Google Analytics / Telemetry",
      "Email Provider (Resend / SendGrid)",
      "Object Storage (AWS S3 / R2)",
      "Slack / Webhook Alerts",
      "CRM / Zapier Connector"
    ]
  };

  const DEFAULT_BUDGET_RANGES = [
    { id: "under-1k", label: "Under $1,000", note: "Focused landing page or lean MVP validation" },
    { id: "1k-2500", label: "$1,000 – $2,500", note: "Custom multi-page site or core web application" },
    { id: "2500-5k", label: "$2,500 – $5,000", note: "Full-stack platform with auth, database & admin UI" },
    { id: "5k-10k", label: "$5,000 – $10,000", note: "Comprehensive SaaS, e-commerce, or multi-integration product" },
    { id: "10k-plus", label: "$10,000+", note: "Scalable multi-phase engineering engagement" },
    { id: "discuss", label: "Flexible / Need Proposal", note: "Finalize budget tier after discovery call" }
  ];

  const TIMELINE_OPTIONS = [
    { id: "ASAP", description: "Priority kickoff within days with focused MVP scope" },
    { id: "1–2 months", description: "Standard end-to-end delivery cadence" },
    { id: "2–3 months", description: "Comprehensive multi-milestone full-stack build" },
    { id: "Flexible", description: "Open schedule aligned around quality & scope" }
  ];

  const CONTACT_METHODS = [
    "Email",
    "Video Call (Google Meet / Zoom)",
    "WhatsApp / Direct Message",
    "LinkedIn"
  ];

  const WIZARD_STEPS = [
    { step: 1, label: "Project Type", icon: "layers" },
    { step: 2, label: "Business Info", icon: "briefcase" },
    { step: 3, label: "Requirements", icon: "list-checks" },
    { step: 4, label: "Technical", icon: "cpu" },
    { step: 5, label: "Budget", icon: "wallet" },
    { step: 6, label: "Timeline", icon: "clock" },
    { step: 7, label: "Contact", icon: "mail" }
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

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  function isValidOptionalUrl(url) {
    const trimmed = String(url || "").trim();
    if (!trimmed) return true;
    try {
      const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      return (
        (parsed.protocol === "http:" || parsed.protocol === "https:") &&
        parsed.hostname.includes(".")
      );
    } catch (_err) {
      return false;
    }
  }

  function getConfiguredBudgetRanges() {
    const cfg = (window.portfolioConfig && window.portfolioConfig.projectRequest) || {};
    if (Array.isArray(cfg.budgetRanges) && cfg.budgetRanges.length > 0) {
      return cfg.budgetRanges;
    }
    return DEFAULT_BUDGET_RANGES;
  }

  function createInitialState() {
    const budgetRanges = getConfiguredBudgetRanges();
    return {
      projectType: "Web Application",
      customProjectType: "",
      businessName: "",
      industry: INDUSTRIES[0],
      targetAudience: "",
      mainGoal: "",
      requiredFeatures: ["Responsive Mobile-First UI"],
      customFeatures: "",
      existingWebsite: "",
      referenceWebsites: "",
      authentication: TECH_OPTIONS.authentication[1],
      payment: TECH_OPTIONS.payment[0],
      database: TECH_OPTIONS.database[2],
      adminPanel: TECH_OPTIONS.adminPanel[1],
      api: TECH_OPTIONS.api[1],
      ai: TECH_OPTIONS.ai[0],
      integrations: [],
      customIntegration: "",
      budget: budgetRanges[1] ? budgetRanges[1].label : budgetRanges[0].label,
      timeline: "1–2 months",
      contactName: "",
      contactEmail: "",
      company: "",
      preferredContact: "Email"
    };
  }

  /**
   * Pure step validator returning `{ valid: boolean, message: string, fieldId?: string }`
   */
  function validateStep(stepNumber, state) {
    if (stepNumber === 1) {
      if (!state.projectType) {
        return { valid: false, message: "Please select a project type." };
      }
      if (state.projectType === "Other" && String(state.customProjectType || "").trim().length < 2) {
        return {
          valid: false,
          message: "Please specify your project type when selecting Other.",
          fieldId: "req-custom-type"
        };
      }
      return { valid: true, message: "" };
    }

    if (stepNumber === 2) {
      if (String(state.businessName || "").trim().length < 2) {
        return {
          valid: false,
          message: "Please enter your business or project name (at least 2 characters).",
          fieldId: "req-business-name"
        };
      }
      if (!String(state.industry || "").trim()) {
        return {
          valid: false,
          message: "Please select an industry.",
          fieldId: "req-industry"
        };
      }
      if (String(state.targetAudience || "").trim().length < 4) {
        return {
          valid: false,
          message: "Please briefly describe your target audience.",
          fieldId: "req-target-audience"
        };
      }
      return { valid: true, message: "" };
    }

    if (stepNumber === 3) {
      if (String(state.mainGoal || "").trim().length < 10) {
        return {
          valid: false,
          message: "Please describe your main project goal (at least 10 characters).",
          fieldId: "req-main-goal"
        };
      }
      const totalFeatures =
        (Array.isArray(state.requiredFeatures) ? state.requiredFeatures.length : 0) +
        (String(state.customFeatures || "").trim() ? 1 : 0);
      if (totalFeatures === 0) {
        return {
          valid: false,
          message: "Please select or enter at least one required feature."
        };
      }
      if (!isValidOptionalUrl(state.existingWebsite)) {
        return {
          valid: false,
          message: "Please enter a valid URL for your existing website (e.g. https://example.com) or leave blank.",
          fieldId: "req-existing-site"
        };
      }
      return { valid: true, message: "" };
    }

    if (stepNumber === 4) {
      return { valid: true, message: "" };
    }

    if (stepNumber === 5) {
      if (!String(state.budget || "").trim()) {
        return { valid: false, message: "Please select an estimated budget range." };
      }
      return { valid: true, message: "" };
    }

    if (stepNumber === 6) {
      if (!String(state.timeline || "").trim()) {
        return { valid: false, message: "Please select your preferred project timeline." };
      }
      return { valid: true, message: "" };
    }

    if (stepNumber === 7) {
      if (String(state.contactName || "").trim().length < 2) {
        return {
          valid: false,
          message: "Please enter your full name (at least 2 characters).",
          fieldId: "req-contact-name"
        };
      }
      if (!isValidEmail(state.contactEmail)) {
        return {
          valid: false,
          message: "Please enter a valid email address (e.g. name@company.com).",
          fieldId: "req-contact-email"
        };
      }
      if (!String(state.preferredContact || "").trim()) {
        return {
          valid: false,
          message: "Please choose your preferred contact method."
        };
      }
      return { valid: true, message: "" };
    }

    return { valid: true, message: "" };
  }

  function validateAllSteps(state) {
    for (let s = 1; s <= 7; s += 1) {
      const result = validateStep(s, state);
      if (!result.valid) {
        return { ...result, failedStep: s };
      }
    }
    return { valid: true, message: "", failedStep: null };
  }

  function buildProjectBriefText(state) {
    const resolvedType =
      state.projectType === "Other" && state.customProjectType.trim()
        ? `Other (${state.customProjectType.trim()})`
        : state.projectType;

    const allFeatures = [
      ...(state.requiredFeatures || []),
      ...String(state.customFeatures || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ];

    const allIntegrations = [
      ...(state.integrations || []),
      ...String(state.customIntegration || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ];

    const lines = [
      `PROJECT BRIEF — ${state.businessName.trim() || "New Project Request"}`,
      `====================================================`,
      ``,
      `1. PROJECT & BUSINESS OVERVIEW`,
      `- Project Type: ${resolvedType}`,
      `- Business Name: ${state.businessName.trim()}`,
      `- Industry: ${state.industry}`,
      `- Target Audience: ${state.targetAudience.trim()}`,
      ``,
      `2. PROJECT GOALS & FEATURES`,
      `- Main Goal: ${state.mainGoal.trim()}`,
      `- Required Features: ${allFeatures.join(", ") || "Standard MVP"}`,
      `- Existing Website: ${state.existingWebsite.trim() || "None specified"}`,
      `- Reference Websites: ${state.referenceWebsites.trim() || "None specified"}`,
      ``,
      `3. TECHNICAL REQUIREMENTS`,
      `- Authentication: ${state.authentication}`,
      `- Payment: ${state.payment}`,
      `- Database: ${state.database}`,
      `- Admin Panel: ${state.adminPanel}`,
      `- API: ${state.api}`,
      `- AI Capabilities: ${state.ai}`,
      `- Third-Party Integrations: ${allIntegrations.join(", ") || "None specified"}`,
      ``,
      `4. BUDGET & TIMELINE`,
      `- Budget Range: ${state.budget}`,
      `- Target Timeline: ${state.timeline}`,
      ``,
      `5. CONTACT DETAILS`,
      `- Name: ${state.contactName.trim()}`,
      `- Email: ${state.contactEmail.trim()}`,
      `- Company: ${state.company.trim() || "Not specified"}`,
      `- Preferred Contact Method: ${state.preferredContact}`
    ];

    return lines.join("\n");
  }

  function downloadBriefFile(state) {
    const text = buildProjectBriefText(state);
    const slug = String(state.businessName || "project")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug || "project"}-brief.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Reuses PortfolioContact.submitInquiry if loaded or clean configurable fetch fallback.
   * Never exposes credentials in client source.
   */
  async function submitProjectBrief(state) {
    const briefText = buildProjectBriefText(state);
    const payload = {
      name: state.contactName.trim(),
      email: state.contactEmail.trim(),
      subject: `Project Brief: ${state.businessName.trim()} (${state.projectType} · ${state.budget})`,
      message: briefText
    };

    if (window.PortfolioContact && typeof window.PortfolioContact.submitInquiry === "function") {
      return window.PortfolioContact.submitInquiry(payload);
    }

    const config = window.portfolioConfig || {};
    const formCfg = config.contactForm || {};
    const provider = String(formCfg.provider || "demo").toLowerCase();

    if (provider === "formspree" && formCfg.formspreeEndpoint) {
      const response = await fetch(formCfg.formspreeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Formspree returned HTTP ${response.status}`);
      return { mode: "formspree", delivered: true };
    }

    if (provider === "api" && formCfg.backendApiUrl) {
      const response = await fetch(formCfg.backendApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
      return { mode: "api", delivered: true };
    }

    const recipient = (config.email || "your-email@example.com").trim();
    const mailtoHref = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
      payload.subject
    )}&body=${encodeURIComponent(briefText)}`;
    return { mode: "demo", delivered: false, mailtoHref };
  }

  function init() {
    const root = document.getElementById("project-request-root");
    if (!root) return;

    const budgetRanges = getConfiguredBudgetRanges();
    let currentStep = 1;
    let isSummaryMode = false;
    let state = createInitialState();

    const chromeEl = document.getElementById("req-wizard-chrome");
    const stepsNavMount = document.getElementById("req-steps-nav");
    const progressFillEl = document.getElementById("req-progress-fill");
    const progressLabelEl = document.getElementById("req-progress-label");
    const stepBodyMount = document.getElementById("req-step-body");
    const validationBanner = document.getElementById("req-validation-banner");
    const prevBtn = document.getElementById("req-prev-btn");
    const nextBtn = document.getElementById("req-next-btn");
    const finishBtn = document.getElementById("req-finish-btn");
    const resetBtn = document.getElementById("req-reset-btn");
    const summaryMount = document.getElementById("req-summary-root");

    function showError(msg) {
      if (!validationBanner) return;
      if (!msg) {
        validationBanner.textContent = "";
        validationBanner.classList.add("hidden");
      } else {
        validationBanner.textContent = msg;
        validationBanner.classList.remove("hidden");
      }
    }

    function renderChrome() {
      if (stepsNavMount) {
        stepsNavMount.innerHTML = WIZARD_STEPS.map((item) => {
          const isActive = !isSummaryMode && currentStep === item.step;
          const isDone = isSummaryMode || item.step < currentStep;
          return `
            <button
              type="button"
              class="req-step-pill ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}"
              data-req-goto="${item.step}"
              aria-current="${isActive ? "step" : "false"}"
            >
              <span class="req-step-num">${isDone && !isActive ? "✓" : `0${item.step}`}</span>
              <span class="min-w-0">
                <span class="block text-xs font-bold truncate">${escHtml(item.label)}</span>
              </span>
            </button>
          `;
        }).join("");

        stepsNavMount.querySelectorAll("[data-req-goto]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const target = Number(btn.getAttribute("data-req-goto") || "1");
            if (!isSummaryMode && target > currentStep) {
              for (let s = currentStep; s < target; s += 1) {
                const check = validateStep(s, state);
                if (!check.valid) {
                  currentStep = s;
                  renderChrome();
                  renderStepBody();
                  showError(check.message);
                  return;
                }
              }
            }
            isSummaryMode = false;
            currentStep = target;
            showError("");
            updateViews();
          });
        });
      }

      const pct = isSummaryMode ? 100 : Math.round((currentStep / 7) * 100);
      if (progressFillEl) progressFillEl.style.width = `${pct}%`;
      if (progressLabelEl) {
        progressLabelEl.textContent = isSummaryMode
          ? "Final Brief Ready · 100% Complete"
          : `Step ${currentStep} of 7 · ${pct}%`;
      }

      if (prevBtn) prevBtn.disabled = !isSummaryMode && currentStep === 1;
      if (nextBtn) nextBtn.classList.toggle("hidden", isSummaryMode || currentStep === 7);
      if (finishBtn) finishBtn.classList.toggle("hidden", isSummaryMode || currentStep !== 7);
    }

    function renderStepBody() {
      if (!stepBodyMount) return;

      if (currentStep === 1) {
        const cardsHtml = PROJECT_TYPES.map((pt) => {
          const selected = state.projectType === pt.id;
          return `
            <label class="req-choice-card ${selected ? "is-selected" : ""}">
              <input type="radio" name="req-project-type" value="${escHtml(pt.id)}" ${selected ? "checked" : ""}>
              <span class="min-w-0">
                <span class="block text-sm font-bold text-[var(--text)]">${escHtml(pt.id)}</span>
                <span class="block text-xs text-[var(--muted)] mt-0.5">${escHtml(pt.description)}</span>
              </span>
            </label>
          `;
        }).join("");

        stepBodyMount.innerHTML = `
          <div class="space-y-4 req-step-animate">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-[var(--text)]">Step 1 · Select Project Type</h2>
              <p class="text-xs sm:text-sm text-[var(--muted)]">Choose the category that best describes what you want to build.</p>
            </div>
            <div class="req-choice-grid">${cardsHtml}</div>
            <div id="req-custom-type-wrap" class="${state.projectType === "Other" ? "" : "hidden"}">
              <label for="req-custom-type" class="req-label">Specify Project Type <span class="text-rose-400">*</span></label>
              <input
                id="req-custom-type"
                type="text"
                class="req-input"
                maxlength="80"
                value="${escHtml(state.customProjectType)}"
                placeholder="e.g. Chrome extension, internal CLI dashboard..."
              >
            </div>
          </div>
        `;

        stepBodyMount.querySelectorAll('input[name="req-project-type"]').forEach((radio) => {
          radio.addEventListener("change", () => {
            state.projectType = radio.value;
            stepBodyMount.querySelectorAll(".req-choice-card").forEach((c) => c.classList.remove("is-selected"));
            const card = radio.closest(".req-choice-card");
            if (card) card.classList.add("is-selected");
            const customWrap = document.getElementById("req-custom-type-wrap");
            if (customWrap) customWrap.classList.toggle("hidden", state.projectType !== "Other");
            showError("");
          });
        });

        const customInput = document.getElementById("req-custom-type");
        if (customInput) {
          customInput.addEventListener("input", () => {
            state.customProjectType = customInput.value;
            if (customInput.value.trim().length >= 2) showError("");
          });
        }
      } else if (currentStep === 2) {
        const industryOptions = INDUSTRIES.map(
          (ind) => `<option value="${escHtml(ind)}" ${ind === state.industry ? "selected" : ""}>${escHtml(ind)}</option>`
        ).join("");

        stepBodyMount.innerHTML = `
          <div class="space-y-4 req-step-animate">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-[var(--text)]">Step 2 · Business Information</h2>
              <p class="text-xs sm:text-sm text-[var(--muted)]">Share context on your brand, domain, and end users.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="req-business-name" class="req-label">Business / Project Name <span class="text-rose-400">*</span></label>
                <input id="req-business-name" type="text" class="req-input" maxlength="90" value="${escHtml(state.businessName)}" placeholder="e.g. Acme Commerce">
              </div>
              <div>
                <label for="req-industry" class="req-label">Industry <span class="text-rose-400">*</span></label>
                <select id="req-industry" class="req-select">${industryOptions}</select>
              </div>
            </div>
            <div>
              <label for="req-target-audience" class="req-label">Target Audience <span class="text-rose-400">*</span></label>
              <textarea id="req-target-audience" class="req-textarea" maxlength="320" placeholder="Who will use this product? e.g. Small SaaS teams, retail shoppers in Europe, students...">${escHtml(state.targetAudience)}</textarea>
            </div>
          </div>
        `;

        const bindVal = (id, key) => {
          const el = document.getElementById(id);
          if (el) {
            el.addEventListener("input", () => {
              state[key] = el.value;
              showError("");
            });
            el.addEventListener("change", () => {
              state[key] = el.value;
              showError("");
            });
          }
        };
        bindVal("req-business-name", "businessName");
        bindVal("req-industry", "industry");
        bindVal("req-target-audience", "targetAudience");
      } else if (currentStep === 3) {
        const featChecks = FEATURE_OPTIONS.map((feat) => {
          const checked = state.requiredFeatures.includes(feat);
          return `
            <label class="req-choice-card ${checked ? "is-selected" : ""}">
              <input type="checkbox" data-req-feature="${escHtml(feat)}" ${checked ? "checked" : ""}>
              <span class="text-xs sm:text-sm font-semibold text-[var(--text)]">${escHtml(feat)}</span>
            </label>
          `;
        }).join("");

        stepBodyMount.innerHTML = `
          <div class="space-y-4 req-step-animate">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-[var(--text)]">Step 3 · Project Requirements</h2>
              <p class="text-xs sm:text-sm text-[var(--muted)]">Define your primary objective, key features, and any reference inspiration.</p>
            </div>

            <div>
              <label for="req-main-goal" class="req-label">Main Goal <span class="text-rose-400">*</span></label>
              <textarea id="req-main-goal" class="req-textarea" maxlength="500" placeholder="Describe the primary business problem or user outcome this project must solve...">${escHtml(state.mainGoal)}</textarea>
            </div>

            <div>
              <p class="req-label">Required Features <span class="text-rose-400">*</span></p>
              <div class="req-choice-grid">${featChecks}</div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="req-custom-features" class="req-label">Additional Custom Features (Optional)</label>
                <input id="req-custom-features" type="text" class="req-input" maxlength="180" value="${escHtml(state.customFeatures)}" placeholder="e.g. PDF export, loyalty points">
              </div>
              <div>
                <label for="req-existing-site" class="req-label">Existing Website URL (Optional)</label>
                <input id="req-existing-site" type="url" class="req-input" maxlength="160" value="${escHtml(state.existingWebsite)}" placeholder="https://example.com">
              </div>
            </div>

            <div>
              <label for="req-reference-sites" class="req-label">Reference Websites / Design Inspiration (Optional)</label>
              <input id="req-reference-sites" type="text" class="req-input" maxlength="200" value="${escHtml(state.referenceWebsites)}" placeholder="e.g. linear.app, stripe.com (visual direction or UX benchmarks)">
            </div>
          </div>
        `;

        stepBodyMount.querySelectorAll("[data-req-feature]").forEach((box) => {
          box.addEventListener("change", () => {
            const label = box.getAttribute("data-req-feature");
            const card = box.closest(".req-choice-card");
            if (box.checked) {
              if (!state.requiredFeatures.includes(label)) state.requiredFeatures.push(label);
              if (card) card.classList.add("is-selected");
            } else {
              state.requiredFeatures = state.requiredFeatures.filter((f) => f !== label);
              if (card) card.classList.remove("is-selected");
            }
            showError("");
          });
        });

        [
          ["req-main-goal", "mainGoal"],
          ["req-custom-features", "customFeatures"],
          ["req-existing-site", "existingWebsite"],
          ["req-reference-sites", "referenceWebsites"]
        ].forEach(([id, key]) => {
          const el = document.getElementById(id);
          if (el) {
            el.addEventListener("input", () => {
              state[key] = el.value;
              showError("");
            });
          }
        });
      } else if (currentStep === 4) {
        const makeOpts = (arr, current) =>
          arr.map((o) => `<option value="${escHtml(o)}" ${o === current ? "selected" : ""}>${escHtml(o)}</option>`).join("");

        const intChecks = TECH_OPTIONS.integrations
          .map((item) => {
            const checked = state.integrations.includes(item);
            return `
              <label class="req-choice-card ${checked ? "is-selected" : ""}">
                <input type="checkbox" data-req-integration="${escHtml(item)}" ${checked ? "checked" : ""}>
                <span class="text-xs font-semibold text-[var(--text)]">${escHtml(item)}</span>
              </label>
            `;
          })
          .join("");

        stepBodyMount.innerHTML = `
          <div class="space-y-4 req-step-animate">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-[var(--text)]">Step 4 · Technical Requirements</h2>
              <p class="text-xs sm:text-sm text-[var(--muted)]">Select architecture preferences and external service integrations.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label for="req-tech-auth" class="req-label">Authentication</label>
                <select id="req-tech-auth" class="req-select">${makeOpts(TECH_OPTIONS.authentication, state.authentication)}</select>
              </div>
              <div>
                <label for="req-tech-payment" class="req-label">Payment</label>
                <select id="req-tech-payment" class="req-select">${makeOpts(TECH_OPTIONS.payment, state.payment)}</select>
              </div>
              <div>
                <label for="req-tech-db" class="req-label">Database</label>
                <select id="req-tech-db" class="req-select">${makeOpts(TECH_OPTIONS.database, state.database)}</select>
              </div>
              <div>
                <label for="req-tech-admin" class="req-label">Admin Panel</label>
                <select id="req-tech-admin" class="req-select">${makeOpts(TECH_OPTIONS.adminPanel, state.adminPanel)}</select>
              </div>
              <div>
                <label for="req-tech-api" class="req-label">API</label>
                <select id="req-tech-api" class="req-select">${makeOpts(TECH_OPTIONS.api, state.api)}</select>
              </div>
              <div>
                <label for="req-tech-ai" class="req-label">AI Features</label>
                <select id="req-tech-ai" class="req-select">${makeOpts(TECH_OPTIONS.ai, state.ai)}</select>
              </div>
            </div>

            <div class="space-y-2">
              <p class="req-label">Third-Party Integrations (Optional)</p>
              <div class="req-choice-grid">${intChecks}</div>
            </div>

            <div>
              <label for="req-custom-int" class="req-label">Other Integrations (Optional)</label>
              <input id="req-custom-int" type="text" class="req-input" maxlength="160" value="${escHtml(state.customIntegration)}" placeholder="e.g. HubSpot, Twilio SMS, Zoom API">
            </div>
          </div>
        `;

        [
          ["req-tech-auth", "authentication"],
          ["req-tech-payment", "payment"],
          ["req-tech-db", "database"],
          ["req-tech-admin", "adminPanel"],
          ["req-tech-api", "api"],
          ["req-tech-ai", "ai"]
        ].forEach(([id, key]) => {
          const el = document.getElementById(id);
          if (el) {
            el.addEventListener("change", () => {
              state[key] = el.value;
            });
          }
        });

        stepBodyMount.querySelectorAll("[data-req-integration]").forEach((box) => {
          box.addEventListener("change", () => {
            const label = box.getAttribute("data-req-integration");
            const card = box.closest(".req-choice-card");
            if (box.checked) {
              if (!state.integrations.includes(label)) state.integrations.push(label);
              if (card) card.classList.add("is-selected");
            } else {
              state.integrations = state.integrations.filter((i) => i !== label);
              if (card) card.classList.remove("is-selected");
            }
          });
        });

        const customInt = document.getElementById("req-custom-int");
        if (customInt) {
          customInt.addEventListener("input", () => {
            state.customIntegration = customInt.value;
          });
        }
      } else if (currentStep === 5) {
        const cardsHtml = budgetRanges
          .map((rng) => {
            const selected = state.budget === rng.label;
            return `
              <label class="req-choice-card ${selected ? "is-selected" : ""}">
                <input type="radio" name="req-budget-range" value="${escHtml(rng.label)}" ${selected ? "checked" : ""}>
                <span class="min-w-0">
                  <span class="block text-sm font-bold text-[var(--text)] tabular-nums">${escHtml(rng.label)}</span>
                  <span class="block text-xs text-[var(--muted)] mt-0.5">${escHtml(rng.note)}</span>
                </span>
              </label>
            `;
          })
          .join("");

        stepBodyMount.innerHTML = `
          <div class="space-y-4 req-step-animate">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-[var(--text)]">Step 5 · Target Budget Range</h2>
              <p class="text-xs sm:text-sm text-[var(--muted)]">Select an indicative budget bracket to align technical architecture and scope.</p>
            </div>
            <div class="req-choice-grid">${cardsHtml}</div>
          </div>
        `;

        stepBodyMount.querySelectorAll('input[name="req-budget-range"]').forEach((radio) => {
          radio.addEventListener("change", () => {
            state.budget = radio.value;
            stepBodyMount.querySelectorAll(".req-choice-card").forEach((c) => c.classList.remove("is-selected"));
            const card = radio.closest(".req-choice-card");
            if (card) card.classList.add("is-selected");
            showError("");
          });
        });
      } else if (currentStep === 6) {
        const cardsHtml = TIMELINE_OPTIONS.map((tm) => {
          const selected = state.timeline === tm.id;
          return `
            <label class="req-choice-card ${selected ? "is-selected" : ""}">
              <input type="radio" name="req-timeline" value="${escHtml(tm.id)}" ${selected ? "checked" : ""}>
              <span class="min-w-0">
                <span class="block text-sm font-bold text-[var(--text)]">${escHtml(tm.id)}</span>
                <span class="block text-xs text-[var(--muted)] mt-0.5">${escHtml(tm.description)}</span>
              </span>
            </label>
          `;
        }).join("");

        stepBodyMount.innerHTML = `
          <div class="space-y-4 req-step-animate">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-[var(--text)]">Step 6 · Target Timeline</h2>
              <p class="text-xs sm:text-sm text-[var(--muted)]">Let us know your desired launch window.</p>
            </div>
            <div class="req-choice-grid">${cardsHtml}</div>
          </div>
        `;

        stepBodyMount.querySelectorAll('input[name="req-timeline"]').forEach((radio) => {
          radio.addEventListener("change", () => {
            state.timeline = radio.value;
            stepBodyMount.querySelectorAll(".req-choice-card").forEach((c) => c.classList.remove("is-selected"));
            const card = radio.closest(".req-choice-card");
            if (card) card.classList.add("is-selected");
            showError("");
          });
        });
      } else if (currentStep === 7) {
        const contactOpts = CONTACT_METHODS.map(
          (m) => `<option value="${escHtml(m)}" ${m === state.preferredContact ? "selected" : ""}>${escHtml(m)}</option>`
        ).join("");

        stepBodyMount.innerHTML = `
          <div class="space-y-4 req-step-animate">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-[var(--text)]">Step 7 · Contact Details</h2>
              <p class="text-xs sm:text-sm text-[var(--muted)]">Provide your details to generate and submit your complete project brief.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="req-contact-name" class="req-label">Full Name <span class="text-rose-400">*</span></label>
                <input id="req-contact-name" type="text" autocomplete="name" class="req-input" maxlength="90" value="${escHtml(state.contactName)}" placeholder="Your name">
              </div>
              <div>
                <label for="req-contact-email" class="req-label">Email Address <span class="text-rose-400">*</span></label>
                <input id="req-contact-email" type="email" autocomplete="email" class="req-input" maxlength="120" value="${escHtml(state.contactEmail)}" placeholder="you@company.com">
              </div>
              <div>
                <label for="req-contact-company" class="req-label">Company / Organization (Optional)</label>
                <input id="req-contact-company" type="text" autocomplete="organization" class="req-input" maxlength="100" value="${escHtml(state.company)}" placeholder="Company name">
              </div>
              <div>
                <label for="req-preferred-contact" class="req-label">Preferred Contact Method <span class="text-rose-400">*</span></label>
                <select id="req-preferred-contact" class="req-select">${contactOpts}</select>
              </div>
            </div>

            <p class="text-xs text-[var(--muted)] flex items-center gap-2 pt-1">
              <i data-lucide="shield-check" class="w-4 h-4 text-cyan-400 shrink-0"></i>
              <span>Privacy notice: Form data stays in active session memory only and is not saved to localStorage.</span>
            </p>
          </div>
        `;

        [
          ["req-contact-name", "contactName"],
          ["req-contact-email", "contactEmail"],
          ["req-contact-company", "company"],
          ["req-preferred-contact", "preferredContact"]
        ].forEach(([id, key]) => {
          const el = document.getElementById(id);
          if (el) {
            el.addEventListener("input", () => {
              state[key] = el.value;
              showError("");
            });
            el.addEventListener("change", () => {
              state[key] = el.value;
              showError("");
            });
          }
        });
      }

      refreshIcons();
    }

    function renderFinalSummary() {
      if (!summaryMount) return;

      const resolvedType =
        state.projectType === "Other" && state.customProjectType.trim()
          ? `Other (${state.customProjectType.trim()})`
          : state.projectType;

      const allFeatures = [
        ...(state.requiredFeatures || []),
        ...String(state.customFeatures || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      ];

      const allIntegrations = [
        ...(state.integrations || []),
        ...String(state.customIntegration || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      ];

      summaryMount.innerHTML = `
        <div class="space-y-6 req-step-animate">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
            <div class="space-y-1">
              <p class="text-xs font-mono-tech font-bold text-cyan-400">FINAL PROJECT BRIEF</p>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-[var(--text)]">${escHtml(state.businessName)} — Project Scope</h2>
              <p class="text-xs sm:text-sm text-[var(--muted)]">${escHtml(resolvedType)} · ${escHtml(state.industry)} · Target: ${escHtml(state.timeline)}</p>
            </div>

            <div class="flex flex-wrap items-center gap-2 req-no-print">
              <button type="button" id="req-edit-brief-btn" class="outline-button text-xs sm:text-sm min-h-[44px]">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
                <span>Edit Steps</span>
              </button>
              <button type="button" id="req-copy-brief-btn" class="outline-button text-xs sm:text-sm min-h-[44px]">
                <i data-lucide="copy" class="w-4 h-4"></i>
                <span>Copy</span>
              </button>
              <button type="button" id="req-print-brief-btn" class="outline-button text-xs sm:text-sm min-h-[44px]">
                <i data-lucide="printer" class="w-4 h-4"></i>
                <span>Print</span>
              </button>
              <button type="button" id="req-download-brief-btn" class="outline-button text-xs sm:text-sm min-h-[44px]">
                <i data-lucide="download" class="w-4 h-4"></i>
                <span>Download</span>
              </button>
              <button type="button" id="req-submit-brief-btn" class="primary-button text-xs sm:text-sm min-h-[44px]">
                <i data-lucide="send" class="w-4 h-4"></i>
                <span>Submit Brief</span>
              </button>
            </div>
          </div>

          <div id="req-submit-status" class="hidden" aria-live="polite"></div>

          <div class="req-brief-grid">
            <article class="req-brief-card">
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-base font-bold text-[var(--text)]">Business &amp; Vision</h3>
                <button type="button" class="text-xs font-semibold text-cyan-400 hover:underline req-no-print" data-req-jump="2">Edit</button>
              </div>
              <div class="req-kv-row">
                <span class="text-xs text-[var(--muted)]">Project Type</span>
                <span class="text-sm font-medium text-[var(--text)]">${escHtml(resolvedType)}</span>
              </div>
              <div class="req-kv-row">
                <span class="text-xs text-[var(--muted)]">Business Name &amp; Industry</span>
                <span class="text-sm font-medium text-[var(--text)]">${escHtml(state.businessName)} · ${escHtml(state.industry)}</span>
              </div>
              <div class="req-kv-row">
                <span class="text-xs text-[var(--muted)]">Target Audience</span>
                <span class="text-sm text-[var(--text-secondary)]">${escHtml(state.targetAudience)}</span>
              </div>
            </article>

            <article class="req-brief-card">
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-base font-bold text-[var(--text)]">Requirements &amp; References</h3>
                <button type="button" class="text-xs font-semibold text-cyan-400 hover:underline req-no-print" data-req-jump="3">Edit</button>
              </div>
              <div class="req-kv-row">
                <span class="text-xs text-[var(--muted)]">Main Goal</span>
                <span class="text-sm text-[var(--text-secondary)]">${escHtml(state.mainGoal)}</span>
              </div>
              <div class="req-kv-row">
                <span class="text-xs text-[var(--muted)]">Required Features</span>
                <span class="text-sm text-[var(--text)]">${escHtml(allFeatures.join(" · ") || "Standard Scope")}</span>
              </div>
              <div class="req-kv-row">
                <span class="text-xs text-[var(--muted)]">Existing / Reference Sites</span>
                <span class="text-sm text-[var(--text-secondary)]">${escHtml(
                  [state.existingWebsite.trim(), state.referenceWebsites.trim()].filter(Boolean).join(" | ") || "None provided"
                )}</span>
              </div>
            </article>

            <article class="req-brief-card">
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-base font-bold text-[var(--text)]">Technical Specification</h3>
                <button type="button" class="text-xs font-semibold text-cyan-400 hover:underline req-no-print" data-req-jump="4">Edit</button>
              </div>
              <div class="req-kv-row">
                <span class="text-xs text-[var(--muted)]">Authentication &amp; Admin</span>
                <span class="text-sm text-[var(--text)]">${escHtml(state.authentication)} · ${escHtml(state.adminPanel)}</span>
              </div>
              <div class="req-kv-row">
                <span class="text-xs text-[var(--muted)]">Database &amp; API</span>
                <span class="text-sm text-[var(--text)]">${escHtml(state.database)} · ${escHtml(state.api)}</span>
              </div>
              <div class="req-kv-row">
                <span class="text-xs text-[var(--muted)]">Payments &amp; AI</span>
                <span class="text-sm text-[var(--text)]">${escHtml(state.payment)} · ${escHtml(state.ai)}</span>
              </div>
              <div class="req-kv-row">
                <span class="text-xs text-[var(--muted)]">Third-Party Integrations</span>
                <span class="text-sm text-[var(--text-secondary)]">${escHtml(allIntegrations.join(" · ") || "None specified")}</span>
              </div>
            </article>

            <article class="req-brief-card">
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-base font-bold text-[var(--text)]">Budget, Timeline &amp; Contact</h3>
                <button type="button" class="text-xs font-semibold text-cyan-400 hover:underline req-no-print" data-req-jump="7">Edit</button>
              </div>
              <div class="req-kv-row">
                <span class="text-xs text-[var(--muted)]">Budget Range &amp; Timeline</span>
                <span class="text-sm font-bold text-indigo-400 tabular-nums">${escHtml(state.budget)} · ${escHtml(state.timeline)}</span>
              </div>
              <div class="req-kv-row">
                <span class="text-xs text-[var(--muted)]">Primary Contact</span>
                <span class="text-sm font-medium text-[var(--text)]">${escHtml(state.contactName)} (${escHtml(state.contactEmail)})</span>
              </div>
              <div class="req-kv-row">
                <span class="text-xs text-[var(--muted)]">Company &amp; Channel</span>
                <span class="text-sm text-[var(--text-secondary)]">${escHtml(state.company.trim() || "Not specified")} · Preferred: ${escHtml(state.preferredContact)}</span>
              </div>
            </article>
          </div>
        </div>
      `;

      summaryMount.querySelectorAll("[data-req-jump]").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentStep = Number(btn.getAttribute("data-req-jump") || "1");
          isSummaryMode = false;
          updateViews();
        });
      });

      const editBtn = document.getElementById("req-edit-brief-btn");
      if (editBtn) {
        editBtn.addEventListener("click", () => {
          isSummaryMode = false;
          updateViews();
        });
      }

      const copyBtn = document.getElementById("req-copy-brief-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
          const text = buildProjectBriefText(state);
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
              window.showToast("Project brief copied to clipboard", "success");
            }
          } catch (_err) {
            if (typeof window.showToast === "function") {
              window.showToast("Use Print or Download to export brief", "info");
            }
          }
        });
      }

      const printBtn = document.getElementById("req-print-brief-btn");
      if (printBtn) {
        printBtn.addEventListener("click", () => window.print());
      }

      const downloadBtn = document.getElementById("req-download-brief-btn");
      if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
          downloadBriefFile(state);
          if (typeof window.showToast === "function") {
            window.showToast("Downloaded project brief (.txt)", "success");
          }
        });
      }

      const submitBtn = document.getElementById("req-submit-brief-btn");
      const statusBox = document.getElementById("req-submit-status");
      if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
          const check = validateAllSteps(state);
          if (!check.valid) {
            isSummaryMode = false;
            currentStep = check.failedStep || 1;
            updateViews();
            showError(check.message);
            return;
          }

          submitBtn.disabled = true;
          submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Submitting...</span>`;
          refreshIcons();

          try {
            const res = await submitProjectBrief(state);
            if (statusBox) {
              statusBox.classList.remove("hidden");
              if (res.delivered) {
                statusBox.innerHTML = `
                  <div class="glass-card p-5 border-emerald-500/40 space-y-1.5 text-sm">
                    <p class="font-semibold text-emerald-400">Project brief submitted successfully</p>
                    <p class="text-[var(--muted)]">Thank you, ${escHtml(state.contactName)}. AL AMIN will reply via ${escHtml(state.preferredContact)}.</p>
                  </div>
                `;
                if (typeof window.showToast === "function") {
                  window.showToast("Project brief submitted successfully!", "success");
                }
              } else {
                statusBox.innerHTML = `
                  <div class="glass-card p-5 space-y-3 text-sm">
                    <div class="space-y-1">
                      <p class="font-semibold text-cyan-400">Brief Validated &amp; Email Draft Ready</p>
                      <p class="text-[var(--muted)]">
                        No live backend delivery provider is enabled in <code class="font-mono-tech text-indigo-400">js/config.js</code>. Open your email client below with your complete brief pre-filled, or Download/Copy the brief directly.
                      </p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <a href="${escHtml(res.mailtoHref)}" class="primary-button text-xs py-2 px-4 min-h-[40px]">
                        <i data-lucide="mail" class="w-4 h-4"></i>
                        <span>Open Brief in Email App</span>
                      </a>
                    </div>
                  </div>
                `;
                if (typeof window.showToast === "function") {
                  window.showToast("Project brief validated & ready to send", "success");
                }
              }
            }
          } catch (err) {
            if (statusBox) {
              statusBox.classList.remove("hidden");
              statusBox.innerHTML = `
                <div class="glass-card p-5 border-rose-500/40 text-sm space-y-1">
                  <p class="font-semibold text-rose-400">Submission Error</p>
                  <p class="text-[var(--muted)]">${escHtml(err.message || "Unable to submit brief right now.")}</p>
                </div>
              `;
            }
            if (typeof window.showToast === "function") {
              window.showToast("Submission failed — use Download or Copy as backup", "error");
            }
          } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i data-lucide="send" class="w-4 h-4"></i><span>Submit Brief</span>`;
            refreshIcons();
          }
        });
      }

      refreshIcons();
    }

    function updateViews() {
      renderChrome();
      if (stepBodyMount) stepBodyMount.classList.toggle("hidden", isSummaryMode);
      const navFooter = document.getElementById("req-step-footer");
      if (navFooter) navFooter.classList.toggle("hidden", isSummaryMode);
      if (summaryMount) summaryMount.classList.toggle("hidden", !isSummaryMode);

      if (isSummaryMode) {
        renderFinalSummary();
      } else {
        renderStepBody();
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        showError("");
        if (isSummaryMode) {
          isSummaryMode = false;
          currentStep = 7;
          updateViews();
          return;
        }
        if (currentStep > 1) {
          currentStep -= 1;
          updateViews();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const res = validateStep(currentStep, state);
        if (!res.valid) {
          showError(res.message);
          if (res.fieldId) {
            const targetEl = document.getElementById(res.fieldId);
            if (targetEl) targetEl.focus();
          }
          return;
        }
        showError("");
        if (currentStep < 7) {
          currentStep += 1;
          updateViews();
        }
      });
    }

    if (finishBtn) {
      finishBtn.addEventListener("click", () => {
        const fullCheck = validateAllSteps(state);
        if (!fullCheck.valid) {
          currentStep = fullCheck.failedStep || currentStep;
          isSummaryMode = false;
          updateViews();
          showError(fullCheck.message);
          if (fullCheck.fieldId) {
            const targetEl = document.getElementById(fullCheck.fieldId);
            if (targetEl) targetEl.focus();
          }
          return;
        }
        showError("");
        isSummaryMode = true;
        updateViews();
        if (typeof window.showToast === "function") {
          window.showToast("Project brief generated — review and submit", "success");
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state = createInitialState();
        currentStep = 1;
        isSummaryMode = false;
        showError("");
        updateViews();
        if (typeof window.showToast === "function") {
          window.showToast("Wizard reset to Step 1", "info");
        }
      });
    }

    if (chromeEl) chromeEl.classList.remove("hidden");
    updateViews();
  }

  window.PortfolioRequest = {
    init,
    createInitialState,
    validateStep,
    validateAllSteps,
    buildProjectBriefText,
    PROJECT_TYPES,
    DEFAULT_BUDGET_RANGES,
    TIMELINE_OPTIONS
  };
})();
