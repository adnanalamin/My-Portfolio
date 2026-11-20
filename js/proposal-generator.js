/**
 * AL AMIN Portfolio — Phase 35: Client Proposal Generator (proposal-generator.html)
 * Collects structured client & project parameters and renders a complete
 * 10-section non-binding proposal outline with Preview, Print, Download, and Copy.
 */

(() => {
  const DEFAULT_TECH_STACK = [
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Node.js",
    "Express",
    "MongoDB",
    "PostgreSQL",
    "REST API"
  ];

  const DEFAULT_STATE = {
    clientName: "Jordan Vance",
    company: "Northwind Digital",
    project: "Customer Analytics & Operations Portal",
    scope:
      "Design and engineer a responsive multi-role web application consolidating client reporting, account settings, and REST API data workflows.",
    features:
      "Role-based authentication (JWT + RBAC), Interactive analytics dashboard, Search & filterable records table, Responsive UI across 320px–2560px, Admin management panel",
    timeline: "6–8 Weeks (Full-Stack Build)",
    technologies: ["React", "Tailwind CSS", "Node.js", "Express", "MongoDB", "REST API"],
    customTech: "",
    budget: "$1,600 – $2,400",
    maintenance: "Standard Monthly Support (Monitoring, Bug Fixes & Dependency Updates)"
  };

  const PROPOSAL_PRESETS = [
    {
      id: "saas-portal",
      label: "MERN SaaS Portal",
      data: { ...DEFAULT_STATE }
    },
    {
      id: "ecommerce-store",
      label: "E-Commerce Platform",
      data: {
        clientName: "Elena Brooks",
        company: "Atelier Commerce",
        project: "Custom Multi-Merchant Storefront",
        scope:
          "Build a fast branded e-commerce storefront with dynamic theme customization, inventory filtering, and merchant order tracking.",
        features:
          "Product catalog & attribute filters, Persistent shopping cart, Merchant order fulfillment tracker, Payment webhook integration, Mobile-first checkout UX",
        timeline: "6–8 Weeks (Full-Stack Build)",
        technologies: ["Next.js", "Tailwind CSS", "Node.js", "Express", "PostgreSQL", "MongoDB"],
        customTech: "",
        budget: "$2,200 – $3,200",
        maintenance: "Retainer Engineering & Priority Iterations"
      }
    },
    {
      id: "brand-web",
      label: "Marketing Website & Brief Intake",
      data: {
        clientName: "Marcus Reid",
        company: "Horizon Studio",
        project: "High-Conversion Brand & Case Study Site",
        scope:
          "Deliver a responsive marketing website and interactive case-study showcase engineered for performance, accessibility, and clean lead intake.",
        features:
          "Responsive landing & service pages, Interactive case study archive, Validated project request form, Dark & light theme support, SEO metadata & sitemap",
        timeline: "3–4 Weeks (Focused Launch)",
        technologies: ["React", "TypeScript", "Tailwind CSS"],
        customTech: "Static Edge Hosting",
        budget: "$850 – $1,250",
        maintenance: "Launch Handoff Only (No Ongoing Retainer)"
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

  function toast(msg, tone) {
    if (typeof window.showToast === "function") {
      window.showToast(msg, tone || "success");
    }
  }

  async function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        // fallback below
      }
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  function getProviderContact() {
    const cfg = window.portfolioConfig || {};
    const brand = cfg.brand || {};
    return {
      name: brand.name || cfg.name || "AL AMIN",
      title: brand.professionalTitle || cfg.role || "Full-Stack Developer & Creative Designer",
      email: brand.email || cfg.email || "your-email@example.com",
      location: brand.location || cfg.location || "Bangladesh",
      availability:
        (brand.availability && brand.availability.label) ||
        "Open to Freelance & Full-Stack Roles"
    };
  }

  function parseFeaturesList(raw) {
    return String(raw || "")
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function buildTimelinePhases(timelineStr) {
    const label = String(timelineStr || "6–8 Weeks");
    if (label.includes("2–3") || label.includes("3–4")) {
      return [
        { phase: "Phase 1 · Discovery & UI Structure", window: "Week 1", focus: "Wireframes, design tokens, and scope sign-off." },
        { phase: "Phase 2 · Core Implementation", window: "Weeks 2–3", focus: "Responsive views, interactive components, and integrations." },
        { phase: "Phase 3 · QA & Production Launch", window: "Week 4", focus: "Cross-breakpoint verification (320px–2560px) and handoff." }
      ];
    }
    if (label.includes("8–12") || label.includes("10–12")) {
      return [
        { phase: "Phase 1 · Architecture & UX Spec", window: "Weeks 1–2", focus: "System blueprint, DB schemas, API contracts, and UI kit." },
        { phase: "Phase 2 · Backend API & Auth", window: "Weeks 3–5", focus: "Core REST endpoints, RBAC permissions, and data models." },
        { phase: "Phase 3 · Frontend Modules", window: "Weeks 6–9", focus: "Dashboards, workflows, validation, and responsive views." },
        { phase: "Phase 4 · Security Audit & Launch", window: "Weeks 10–12", focus: "End-to-end verification, documentation, and deployment." }
      ];
    }
    return [
      { phase: "Phase 1 · Architecture & UI Alignment", window: "Week 1", focus: "Requirements confirmation, routes, and data schema design." },
      { phase: "Phase 2 · Frontend & API Core", window: "Weeks 2–4", focus: "UI views, REST endpoints, authentication, and core workflows." },
      { phase: "Phase 3 · Integration & Refinement", window: "Weeks 5–6", focus: "Dashboard/admin workflows, responsive polish, and edge states." },
      { phase: "Phase 4 · Testing & Deployment", window: "Weeks 7–8", focus: "Validation across mobile/desktop viewports and delivery handoff." }
    ];
  }

  function buildProposalData(state) {
    const contact = getProviderContact();
    const clientName = (state.clientName || "").trim() || "Prospective Client";
    const company = (state.company || "").trim() || "Client Organization";
    const project = (state.project || "").trim() || "Custom Web Application";
    const scope =
      (state.scope || "").trim() ||
      "Design and implement a maintainable, responsive digital product aligned with business goals.";
    const featuresList = parseFeaturesList(state.features);
    const activeFeatures =
      featuresList.length > 0
        ? featuresList
        : ["Responsive web interface (320px–2560px)", "Clean modular codebase", "Deployment & documentation handoff"];

    const stack = [...(Array.isArray(state.technologies) ? state.technologies : [])];
    if (state.customTech && state.customTech.trim()) {
      state.customTech
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((x) => {
          if (!stack.includes(x)) stack.push(x);
        });
    }
    const techList = stack.length > 0 ? stack : ["HTML5", "Tailwind CSS", "JavaScript"];

    const timeline = (state.timeline || "").trim() || "6–8 Weeks (Full-Stack Build)";
    const budget = (state.budget || "").trim() || "$1,500 – $2,400";
    const maintenance = (state.maintenance || "").trim() || "Launch Handoff Only";
    const generatedDate = new Date().toISOString().slice(0, 10);

    const objectives = [
      `Deliver ${project} for ${company} with predictable performance across mobile and desktop viewports (320px–2560px).`,
      `Establish clear architecture boundaries using ${techList.slice(0, 4).join(", ")} for long-term maintainability.`,
      `Prioritize clean usability, accessible markup, and validated user input flows from initial release.`
    ];

    const phases = buildTimelinePhases(timeline);

    const termsPlaceholder =
      "[Non-Binding Terms Placeholder — Draft Outline Only] Formal payment milestones, intellectual property ownership, revision limits, acceptance criteria, and support SLA terms are not generated automatically here and must be reviewed and agreed upon in a separate formal Statement of Work before work begins.";

    return {
      cover: {
        title: project,
        clientName,
        company,
        preparedBy: contact.name,
        preparedTitle: contact.title,
        date: generatedDate,
        status: "Draft Proposal Outline (Non-Binding)"
      },
      overview: `This proposal outlines a structured engineering plan prepared for ${clientName} (${company}) to design and deliver ${project}. ${scope}`,
      objectives,
      scope,
      features: activeFeatures,
      technologies: techList,
      timeline,
      phases,
      pricing: {
        estimatedRange: budget,
        maintenance,
        disclaimer: "Illustrative estimate only — final pricing depends on confirmed discovery requirements."
      },
      termsPlaceholder,
      contact
    };
  }

  function formatProposalAsText(proposal) {
    const lines = [
      "============================================================",
      `PROJECT PROPOSAL DRAFT — ${proposal.cover.title}`,
      "============================================================",
      `Status:      ${proposal.cover.status}`,
      `Prepared For: ${proposal.cover.clientName} (${proposal.cover.company})`,
      `Prepared By:  ${proposal.cover.preparedBy} — ${proposal.cover.preparedTitle}`,
      `Date:         ${proposal.cover.date}`,
      "",
      "1. PROJECT OVERVIEW",
      proposal.overview,
      "",
      "2. OBJECTIVES",
      ...proposal.objectives.map((o, idx) => `   ${idx + 1}. ${o}`),
      "",
      "3. SCOPE",
      proposal.scope,
      "",
      "4. FEATURES",
      ...proposal.features.map((f) => `   - ${f}`),
      "",
      "5. TECHNOLOGY",
      `   ${proposal.technologies.join(", ")}`,
      "",
      `6. TIMELINE (${proposal.timeline})`,
      ...proposal.phases.map((p) => `   - ${p.phase} [${p.window}]: ${p.focus}`),
      "",
      "7. ESTIMATED PRICING",
      `   Estimated Build Range: ${proposal.pricing.estimatedRange}`,
      `   Maintenance Option:    ${proposal.pricing.maintenance}`,
      `   Note:                  ${proposal.pricing.disclaimer}`,
      "",
      "8. TERMS PLACEHOLDER",
      `   ${proposal.termsPlaceholder}`,
      "",
      "9. CONTACT INFORMATION",
      `   Name:         ${proposal.contact.name}`,
      `   Role:         ${proposal.contact.title}`,
      `   Email:        ${proposal.contact.email}`,
      `   Location:     ${proposal.contact.location}`,
      `   Availability: ${proposal.contact.availability}`
    ];
    return lines.join("\n");
  }

  function init() {
    const root = document.getElementById("proposal-generator-root");
    if (!root) return;

    let state = {
      ...DEFAULT_STATE,
      technologies: [...DEFAULT_STATE.technologies]
    };

    const formEl = document.getElementById("prop-builder-form");
    const clientIn = document.getElementById("prop-client-name");
    const companyIn = document.getElementById("prop-company");
    const projectIn = document.getElementById("prop-project-title");
    const scopeIn = document.getElementById("prop-scope");
    const featuresIn = document.getElementById("prop-features");
    const timelineIn = document.getElementById("prop-timeline");
    const techChipsEl = document.getElementById("prop-tech-chips");
    const customTechIn = document.getElementById("prop-custom-tech");
    const budgetIn = document.getElementById("prop-budget");
    const maintenanceIn = document.getElementById("prop-maintenance");
    const presetsMount = document.getElementById("prop-presets-row");
    const previewDocEl = document.getElementById("prop-document-preview");

    const previewBtn = document.getElementById("prop-action-preview");
    const printBtn = document.getElementById("prop-action-print");
    const downloadBtn = document.getElementById("prop-action-download");
    const copyBtn = document.getElementById("prop-action-copy");
    const resetBtn = document.getElementById("prop-action-reset");

    function syncInputsFromState() {
      if (clientIn) clientIn.value = state.clientName;
      if (companyIn) companyIn.value = state.company;
      if (projectIn) projectIn.value = state.project;
      if (scopeIn) scopeIn.value = state.scope;
      if (featuresIn) featuresIn.value = state.features;
      if (timelineIn) timelineIn.value = state.timeline;
      if (customTechIn) customTechIn.value = state.customTech;
      if (budgetIn) budgetIn.value = state.budget;
      if (maintenanceIn) maintenanceIn.value = state.maintenance;
      renderTechChips();
    }

    function renderTechChips() {
      if (!techChipsEl) return;
      techChipsEl.innerHTML = DEFAULT_TECH_STACK.map((tech) => {
        const active = state.technologies.includes(tech);
        return `
          <button
            type="button"
            class="prop-chip-btn ${active ? "is-active" : ""}"
            data-prop-tech="${escHtml(tech)}"
            aria-pressed="${active ? "true" : "false"}"
          >
            ${escHtml(tech)}
          </button>
        `;
      }).join("");

      techChipsEl.querySelectorAll("[data-prop-tech]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const t = btn.getAttribute("data-prop-tech");
          if (!t) return;
          if (state.technologies.includes(t)) {
            state.technologies = state.technologies.filter((x) => x !== t);
          } else {
            state.technologies = [...state.technologies, t];
          }
          renderTechChips();
          renderPreview();
        });
      });
    }

    function renderPreview() {
      if (!previewDocEl) return;
      const p = buildProposalData(state);

      previewDocEl.innerHTML = `
        <!-- 1. Cover -->
        <div class="prop-doc-cover">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
            <span class="font-mono-tech font-semibold text-cyan-400">${escHtml(p.cover.status)}</span>
            <span class="font-mono-tech tabular-nums">Date: ${escHtml(p.cover.date)}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[var(--text)] leading-tight">
            ${escHtml(p.cover.title)}
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
            <div>
              <p class="text-[var(--muted)]">Prepared For</p>
              <p class="font-semibold text-[var(--text)]">${escHtml(p.cover.clientName)} · ${escHtml(p.cover.company)}</p>
            </div>
            <div>
              <p class="text-[var(--muted)]">Prepared By</p>
              <p class="font-semibold text-[var(--text)]">${escHtml(p.cover.preparedBy)} · ${escHtml(p.cover.preparedTitle)}</p>
            </div>
          </div>
        </div>

        <div class="prop-doc-body">
          <!-- 2. Project Overview -->
          <section class="prop-section">
            <h3 class="prop-section-title"><span class="prop-section-num">01</span><span>Project Overview</span></h3>
            <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(p.overview)}</p>
          </section>

          <!-- 3. Objectives -->
          <section class="prop-section">
            <h3 class="prop-section-title"><span class="prop-section-num">02</span><span>Objectives</span></h3>
            <ul class="space-y-1.5 text-sm text-[var(--text-secondary)] list-disc pl-5">
              ${p.objectives.map((o) => `<li>${escHtml(o)}</li>`).join("")}
            </ul>
          </section>

          <!-- 4. Scope -->
          <section class="prop-section">
            <h3 class="prop-section-title"><span class="prop-section-num">03</span><span>Scope</span></h3>
            <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(p.scope)}</p>
          </section>

          <!-- 5. Features -->
          <section class="prop-section">
            <h3 class="prop-section-title"><span class="prop-section-num">04</span><span>Features</span></h3>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-[var(--text-secondary)] list-disc pl-5">
              ${p.features.map((f) => `<li>${escHtml(f)}</li>`).join("")}
            </ul>
          </section>

          <!-- 6. Technology -->
          <section class="prop-section">
            <h3 class="prop-section-title"><span class="prop-section-num">05</span><span>Technology</span></h3>
            <p class="text-sm font-mono-tech text-[var(--text)]">${escHtml(p.technologies.join(" · "))}</p>
          </section>

          <!-- 7. Timeline -->
          <section class="prop-section">
            <h3 class="prop-section-title">
              <span class="prop-section-num">06</span>
              <span>Timeline (${escHtml(p.timeline)})</span>
            </h3>
            <div class="overflow-x-auto border border-[var(--border)] rounded-lg bg-[var(--background)]">
              <table class="prop-table">
                <thead>
                  <tr>
                    <th>Milestone</th>
                    <th>Window</th>
                    <th>Focus</th>
                  </tr>
                </thead>
                <tbody>
                  ${p.phases
                    .map(
                      (ph) => `
                        <tr>
                          <td class="font-semibold text-[var(--text)]">${escHtml(ph.phase)}</td>
                          <td class="font-mono-tech whitespace-nowrap tabular-nums">${escHtml(ph.window)}</td>
                          <td>${escHtml(ph.focus)}</td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </section>

          <!-- 8. Estimated Pricing -->
          <section class="prop-section">
            <h3 class="prop-section-title"><span class="prop-section-num">07</span><span>Estimated Pricing</span></h3>
            <div class="p-4 rounded-lg border border-[var(--border)] bg-[var(--background)] space-y-2 text-sm">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-[var(--muted)]">Estimated Build Range</span>
                <span class="font-mono-tech font-bold text-cyan-400 tabular-nums">${escHtml(p.pricing.estimatedRange)}</span>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[var(--border)]">
                <span class="text-[var(--muted)]">Maintenance Option</span>
                <span class="text-[var(--text)] font-medium text-right">${escHtml(p.pricing.maintenance)}</span>
              </div>
              <p class="text-xs text-[var(--muted)] pt-1.5 border-t border-[var(--border)]">
                ${escHtml(p.pricing.disclaimer)}
              </p>
            </div>
          </section>

          <!-- 9. Terms Placeholder -->
          <section class="prop-section">
            <h3 class="prop-section-title"><span class="prop-section-num">08</span><span>Terms Placeholder (Non-Binding)</span></h3>
            <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed p-3.5 rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--background)]">
              ${escHtml(p.termsPlaceholder)}
            </p>
          </section>

          <!-- 10. Contact Information -->
          <section class="prop-section">
            <h3 class="prop-section-title"><span class="prop-section-num">09</span><span>Contact Information</span></h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[var(--text-secondary)]">
              <div>
                <p class="font-bold text-[var(--text)]">${escHtml(p.contact.name)}</p>
                <p>${escHtml(p.contact.title)}</p>
              </div>
              <div class="space-y-0.5">
                <p>Email: <span class="font-mono-tech text-cyan-400">${escHtml(p.contact.email)}</span></p>
                <p>Location: ${escHtml(p.contact.location)} · ${escHtml(p.contact.availability)}</p>
              </div>
            </div>
          </section>
        </div>
      `;
    }

    if (presetsMount) {
      presetsMount.innerHTML = PROPOSAL_PRESETS.map(
        (pr) => `
          <button type="button" class="prop-chip-btn" data-prop-preset="${escHtml(pr.id)}">
            ${escHtml(pr.label)}
          </button>
        `
      ).join("");

      presetsMount.querySelectorAll("[data-prop-preset]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-prop-preset");
          const match = PROPOSAL_PRESETS.find((x) => x.id === id);
          if (!match) return;
          state = {
            ...match.data,
            technologies: [...match.data.technologies]
          };
          syncInputsFromState();
          renderPreview();
        });
      });
    }

    function bindInput(el, key) {
      if (!el) return;
      el.addEventListener("input", () => {
        state[key] = el.value;
        renderPreview();
      });
      el.addEventListener("change", () => {
        state[key] = el.value;
        renderPreview();
      });
    }

    bindInput(clientIn, "clientName");
    bindInput(companyIn, "company");
    bindInput(projectIn, "project");
    bindInput(scopeIn, "scope");
    bindInput(featuresIn, "features");
    bindInput(timelineIn, "timeline");
    bindInput(customTechIn, "customTech");
    bindInput(budgetIn, "budget");
    bindInput(maintenanceIn, "maintenance");

    if (formEl) {
      formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        renderPreview();
        if (previewDocEl) {
          previewDocEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        renderPreview();
        if (previewDocEl) {
          previewDocEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        toast("Proposal preview updated.", "info");
      });
    }

    if (printBtn) {
      printBtn.addEventListener("click", () => {
        renderPreview();
        if (typeof window.print === "function") {
          window.print();
        }
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        const data = buildProposalData(state);
        const text = formatProposalAsText(data);
        const slug = String(data.cover.title || "project")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "proposal";
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `proposal-${slug}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast("Proposal draft downloaded.", "success");
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        const text = formatProposalAsText(buildProposalData(state));
        const ok = await copyText(text);
        if (ok) {
          toast("Proposal draft copied to clipboard.", "success");
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state = {
          ...DEFAULT_STATE,
          technologies: [...DEFAULT_STATE.technologies]
        };
        syncInputsFromState();
        renderPreview();
        toast("Proposal fields reset to sample default.", "info");
      });
    }

    syncInputsFromState();
    renderPreview();
    refreshIcons();
  }

  window.PortfolioProposalGenerator = {
    init,
    DEFAULT_STATE,
    DEFAULT_TECH_STACK,
    PROPOSAL_PRESETS,
    buildProposalData,
    formatProposalAsText
  };
})();
