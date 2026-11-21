/**
 * AL AMIN Portfolio OS — Phase 43: Guided Portfolio Tour
 * Features:
 * - Non-coercive guided walkthrough ("Start Tour", "Explore Freely", "Skip Tour", "Restart Tour")
 * - Interactive blueprint hotspots with accessible tooltips, step counter & progress indicator
 * - Previous / Next / Jump step controls with keyboard navigation & mobile horizontal swipe
 * - Every stop explains: What you are viewing, Why it matters, Live portfolio facts, & Page link
 * - Accessible Text-Only Tour mode + strict prefers-reduced-motion support
 */

const PortfolioTour = (() => {
  const STORAGE_KEY = "alamin_portfolio_tour_state_v1";

  const state = {
    initialized: false,
    activeIndex: 0,
    visitedIndices: new Set([0]),
    mode: "idle", // "idle" | "guided" | "explore" | "skipped"
    textOnly: false,
    reducedMotion: false,
    openTooltipId: null,
    swipeStartX: 0,
    swipeStartY: 0,
    swipeTracking: false
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

  function announce(message) {
    const region = document.getElementById("tour-live-region");
    if (region) {
      region.textContent = message;
    }
  }

  function showToast(message, type = "info") {
    if (typeof window.showToast === "function") {
      window.showToast(message, type);
    }
  }

  function systemPrefersReducedMotion() {
    return (
      document.documentElement.classList.contains("a11y-reduce-motion") ||
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    );
  }

  function loadPersistedState() {
    const prefs = {
      activeIndex: 0,
      mode: "idle",
      textOnly: false,
      reducedMotion: systemPrefersReducedMotion()
    };

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          if (typeof parsed.activeIndex === "number" && parsed.activeIndex >= 0) {
            prefs.activeIndex = parsed.activeIndex;
          }
          if (["idle", "guided", "explore", "skipped"].includes(parsed.mode)) {
            prefs.mode = parsed.mode;
          }
          if (typeof parsed.textOnly === "boolean") {
            prefs.textOnly = parsed.textOnly;
          }
          if (typeof parsed.reducedMotion === "boolean") {
            prefs.reducedMotion = parsed.reducedMotion || systemPrefersReducedMotion();
          }
        }
      }
    } catch (_err) {
      // Ignore storage access errors safely
    }

    try {
      const params = new URLSearchParams(window.location.search || "");
      const stepParam = params.get("step");
      const modeParam = params.get("mode");
      const autoplay = params.get("autoplay");
      if (stepParam) {
        const idx = Number(stepParam) - 1;
        if (!Number.isNaN(idx) && idx >= 0 && idx < 8) {
          prefs.activeIndex = idx;
        }
      }
      if (modeParam === "text") {
        prefs.textOnly = true;
      } else if (modeParam === "explore") {
        prefs.mode = "explore";
      }
      if (autoplay === "1" || autoplay === "true") {
        prefs.mode = "guided";
      }
    } catch (_err) {
      // Ignore URLSearchParams errors safely
    }

    return prefs;
  }

  function persistState() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activeIndex: state.activeIndex,
          mode: state.mode,
          textOnly: state.textOnly,
          reducedMotion: state.reducedMotion
        })
      );
    } catch (_err) {
      // Ignore storage write errors
    }
  }

  function getTourSteps() {
    const cfg = window.portfolioConfig || {};
    const brand = cfg.brand || {};
    const dataNs = window.PortfolioData || {};
    const summary = typeof dataNs.getSummary === "function" ? dataNs.getSummary() : {};
    const projects = typeof dataNs.getProjects === "function" ? dataNs.getProjects() : [];
    const skills = typeof dataNs.getSkills === "function" ? dataNs.getSkills() : [];
    const experience = typeof dataNs.getExperience === "function" ? dataNs.getExperience() : [];
    const decisions = typeof dataNs.getDecisions === "function" ? dataNs.getDecisions() : [];
    const githubData = typeof dataNs.getGitHubData === "function" ? dataNs.getGitHubData() : {};

    const featuredTitles = projects
      .filter((p) => p.featured)
      .slice(0, 3)
      .map((p) => p.title)
      .join(", ") || "AstraPulse, Nexora, SLIDEVERSE";

    const skillSample = skills
      .slice(0, 5)
      .map((s) => s.name)
      .join(" · ") || "HTML5 · CSS3 · JavaScript · React · Node.js";

    const latestRole = experience[0]
      ? `${experience[0].title} (${experience[0].date})`
      : "Full-Stack MERN Developer (2025 – Present)";

    const availabilityLabel =
      (brand.availability && brand.availability.label) || "Open to Freelance & Full-Stack Roles";

    const flagshipName = (githubData.flagship && githubData.flagship.name) || "SLIDEVERSE";

    return [
      {
        id: "overview",
        stepNum: "01",
        title: "Overview & Personal Brand",
        shortLabel: "Overview",
        category: "Portfolio Entry",
        icon: "compass",
        x: 16,
        y: 26,
        isLower: false,
        tooltipText: "Start here: Brand identity, availability status, and tailored Client / Recruiter / Developer visitor modes.",
        whatViewing:
          "The central homepage and personal engineering brand identity of AL AMIN, including live availability status and tailored Visitor Modes (Client, Recruiter, Developer).",
        whyMatters:
          "Helps technical recruiters, product founders, and fellow engineers immediately orient themselves and switch views without sifting through irrelevant sections.",
        facts: [
          `Brand Focus: ${brand.currentFocus || "Full-Stack MERN, Next.js & Design Systems"}`,
          `Availability: ${availabilityLabel}`,
          `Integrated Systems: ${summary.systemsCount || 30} core portfolio modules`
        ],
        primaryHref: "index.html",
        primaryLabel: "Open Portfolio Home",
        secondaryHref: "about.html",
        secondaryLabel: "About AL AMIN"
      },
      {
        id: "projects",
        stepNum: "02",
        title: "Projects & Case Studies",
        shortLabel: "Projects",
        category: "Product Engineering",
        icon: "folder-kanban",
        x: 38,
        y: 22,
        isLower: false,
        tooltipText: "Inspect full-stack case studies including AstraPulse, Nexora, and SLIDEVERSE with problem, stack, and outcomes.",
        whatViewing:
          "Filterable full-stack and UI engineering case studies complete with problem framing, stack breakdowns, responsive screenshots, and technical architecture notes.",
        whyMatters:
          "Case studies prove real engineering execution—showing how data modeling, state architecture, and responsive UI decisions translate into shipped software.",
        facts: [
          `Featured Works: ${featuredTitles}`,
          `Catalog Size: ${projects.length || 6} documented project case studies`,
          "Includes interactive Architect & Scope Estimator workflows"
        ],
        primaryHref: "projects.html",
        primaryLabel: "Explore Projects",
        secondaryHref: "project-details.html?id=astrapulse",
        secondaryLabel: "View AstraPulse Case Study"
      },
      {
        id: "skills",
        stepNum: "03",
        title: "Skills & Technical Stack",
        shortLabel: "Skills",
        category: "Capabilities",
        icon: "cpu",
        x: 62,
        y: 22,
        isLower: false,
        tooltipText: "Frontend, Backend, Database, and Dev Tooling matrix paired with an interactive Skills Relationship Graph.",
        whatViewing:
          "Categorized technical proficiencies spanning Frontend, Backend, Database, and Tooling, linked interactively with a visual Skills Relationship Graph.",
        whyMatters:
          "Demonstrates not just isolated keywords, but how technologies work together inside full-stack MERN and Next.js production pipelines.",
        facts: [
          `Core Stack: ${skillSample}`,
          `Cataloged Skills: ${skills.length || 22} verified capabilities`,
          "Includes interactive Skills Graph & Tech Comparison Explorer"
        ],
        primaryHref: "skills.html",
        primaryLabel: "View Skills & Graph",
        secondaryHref: "explorer.html",
        secondaryLabel: "Open Tech Explorer"
      },
      {
        id: "experience",
        stepNum: "04",
        title: "Experience & Developer Journey",
        shortLabel: "Experience",
        category: "Background",
        icon: "briefcase",
        x: 84,
        y: 28,
        isLower: false,
        tooltipText: "Chronological work experience, freelance collaborations, B.Sc. CS background, and dynamic resume builder.",
        whatViewing:
          "Chronological engineering milestones across product studio work, freelance builds, B.Sc. Computer Science studies, and printable role-tailored resumes.",
        whyMatters:
          "Gives hiring managers and clients transparent, non-fabricated visibility into hands-on delivery history and continuous technical growth.",
        facts: [
          `Latest Role: ${latestRole}`,
          `Milestones Recorded: ${experience.length || 5} career & education stages`,
          "Pairs directly with A4 printable Resume Builder & Recruiter Search"
        ],
        primaryHref: "experience.html",
        primaryLabel: "View Experience",
        secondaryHref: "resume.html",
        secondaryLabel: "Open Resume Builder"
      },
      {
        id: "opensource",
        stepNum: "05",
        title: "Open Source & Repositories",
        shortLabel: "Open Source",
        category: "Community & Code",
        icon: "git-fork",
        x: 20,
        y: 72,
        isLower: true,
        tooltipText: "Explore SLIDEVERSE, public GitHub repositories, live API stats, and verified open-source contributions.",
        whatViewing:
          "The Open Source Hub & GitHub Explorer featuring flagship browser projects like SLIDEVERSE alongside live public repository metadata and technology filters.",
        whyMatters:
          "Public source repositories let reviewers verify real commit discipline, code readability, modular structure, and authentic open-source contributions without fabricated stats.",
        facts: [
          `Flagship Project: ${flagshipName}`,
          "Connected to live GitHub REST API integration with cache TTL",
          "Filterable by repository type, language, and search keyword"
        ],
        primaryHref: "opensource.html",
        primaryLabel: "Open Source Hub",
        secondaryHref: "github.html",
        secondaryLabel: "GitHub Explorer"
      },
      {
        id: "architecture",
        stepNum: "06",
        title: "System Architecture & Decisions",
        shortLabel: "Architecture",
        category: "Systems Engineering",
        icon: "network",
        x: 43,
        y: 74,
        isLower: true,
        tooltipText: "Inspect full-stack request flows, centralized data layers, API Explorer endpoints, and Architecture Decision Records.",
        whatViewing:
          "Interactive system architecture diagrams, centralized data layer boundaries, API contract explorer, and Engineering Decision Records (ADRs).",
        whyMatters:
          "Senior engineering is defined by intentional trade-offs—showing why specific state patterns, modular vanilla ES modules, and layered APIs were chosen.",
        facts: [
          `Engineering Decisions Documented: ${decisions.length || 6} ADRs`,
          "Includes interactive API Explorer & Component Laboratory",
          "Zero-duplication centralized data bus under window.PortfolioData"
        ],
        primaryHref: "architecture.html",
        primaryLabel: "Inspect Architecture",
        secondaryHref: "decisions.html",
        secondaryLabel: "Decision Log"
      },
      {
        id: "security",
        stepNum: "07",
        title: "Security Center & Hardening",
        shortLabel: "Security",
        category: "Trust & Reliability",
        icon: "shield-check",
        x: 66,
        y: 74,
        isLower: true,
        tooltipText: "Audit defensive client & API practices: XSS escaping, zero exposed secrets, safe iframe sandboxing, and CSP hygiene.",
        whatViewing:
          "The portfolio Security Center detailing XSS output encoding, zero client-side API secrets, safe external link attributes, and sandboxed code execution controls.",
        whyMatters:
          "Demonstrates security-first engineering hygiene across both user-facing web apps and backend API workflows—critical for SaaS and enterprise builds.",
        facts: [
          "HTML-escaped rendering via shared escapeHtml sanitization",
          "No hardcoded API keys or private credentials in client code",
          "Paired with Performance Center benchmarks & reduced-motion support"
        ],
        primaryHref: "security.html",
        primaryLabel: "Open Security Center",
        secondaryHref: "performance.html",
        secondaryLabel: "Performance Center"
      },
      {
        id: "contact",
        stepNum: "08",
        title: "Contact & Project Collaboration",
        shortLabel: "Contact",
        category: "Start Working Together",
        icon: "mail",
        x: 86,
        y: 70,
        isLower: true,
        tooltipText: "Reach out directly via contact form, guided Project Request Wizard, or interactive Client Proposal Generator.",
        whatViewing:
          "Direct communication channels, the structured Project Request Wizard, Scope Estimator, and Client Proposal Generator.",
        whyMatters:
          "Gives prospective clients and hiring teams an effortless path to share scope, timeline, or interview requests and start a productive conversation immediately.",
        facts: [
          `Location: ${brand.location || "Bangladesh"} (International Remote Ready)`,
          "Tools: Contact Form, Project Request Wizard & Proposal Generator",
          "Copyable email & instant share helpers built into the UI"
        ],
        primaryHref: "contact.html",
        primaryLabel: "Go to Contact",
        secondaryHref: "project-request.html",
        secondaryLabel: "Start Project Request"
      }
    ];
  }

  function applyMotionPreference() {
    document.documentElement.classList.toggle("tour-reduced-motion", Boolean(state.reducedMotion));
    const btn = document.getElementById("tour-motion-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", state.reducedMotion ? "true" : "false");
    }
  }

  function syncToolbarState() {
    const startBtn = document.getElementById("tour-start-btn");
    const freeBtn = document.getElementById("tour-free-btn");
    const textBtn = document.getElementById("tour-text-mode-btn");
    const modePill = document.getElementById("tour-mode-status");

    if (startBtn) {
      startBtn.setAttribute("aria-pressed", state.mode === "guided" ? "true" : "false");
    }
    if (freeBtn) {
      freeBtn.setAttribute(
        "aria-pressed",
        state.mode === "explore" || state.mode === "skipped" ? "true" : "false"
      );
    }
    if (textBtn) {
      textBtn.setAttribute("aria-pressed", state.textOnly ? "true" : "false");
    }
    if (modePill) {
      const labelMap = {
        idle: "Ready · Choose Start Tour or Explore Freely",
        guided: "Guided Tour Active",
        explore: "Explore Freely Mode · Self-Paced",
        skipped: "Tour Skipped · Exploring Freely"
      };
      modePill.textContent = labelMap[state.mode] || labelMap.idle;
    }

    const visualSection = document.getElementById("tour-visual-workspace");
    const textSection = document.getElementById("tour-text-only-view");
    if (visualSection) visualSection.classList.toggle("hidden", state.textOnly);
    if (textSection) textSection.classList.toggle("hidden", !state.textOnly);
  }

  function renderProgressAndControls(steps) {
    const step = steps[state.activeIndex] || steps[0];
    const total = steps.length;
    const currentNumber = state.activeIndex + 1;
    const ratio = Math.max(0.05, Math.min(1, currentNumber / total));

    const counterEl = document.getElementById("tour-step-counter");
    if (counterEl) {
      counterEl.textContent = `Step ${currentNumber} of ${total}`;
    }

    const activeNameEl = document.getElementById("tour-active-stop-label");
    if (activeNameEl) {
      activeNameEl.textContent = step.title;
    }

    const progressTrack = document.getElementById("tour-progress-track");
    const progressFill = document.getElementById("tour-progress-fill");
    if (progressTrack) {
      progressTrack.setAttribute("aria-valuenow", String(currentNumber));
      progressTrack.setAttribute("aria-valuemin", "1");
      progressTrack.setAttribute("aria-valuemax", String(total));
      progressTrack.setAttribute(
        "aria-valuetext",
        `Step ${currentNumber} of ${total}: ${step.title}`
      );
    }
    if (progressFill) {
      progressFill.style.transform = `scaleX(${ratio})`;
    }

    const stepperDots = document.getElementById("tour-stepper-dots");
    if (stepperDots) {
      stepperDots.innerHTML = steps
        .map((item, idx) => {
          const isActive = idx === state.activeIndex;
          const isVisited = state.visitedIndices.has(idx);
          return `
            <button
              type="button"
              class="tour-step-pill-btn ${isActive ? "is-active" : ""} ${isVisited ? "is-visited" : ""}"
              data-tour-jump="${idx}"
              ${isActive ? 'aria-current="step"' : ""}
              aria-label="Go to step ${idx + 1}: ${escHtml(item.title)}"
            >
              <span class="font-mono-tech tabular-nums text-[11px] opacity-80">${escHtml(item.stepNum)}</span>
              <span class="truncate">${escHtml(item.shortLabel)}</span>
            </button>
          `;
        })
        .join("");

      stepperDots.querySelectorAll("[data-tour-jump]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.getAttribute("data-tour-jump") || "0");
          goToStep(idx, { activateGuided: state.mode !== "explore" && state.mode !== "skipped" });
        });
      });
    }

    const prevBtns = document.querySelectorAll("[data-tour-prev]");
    const nextBtns = document.querySelectorAll("[data-tour-next]");
    prevBtns.forEach((btn) => {
      btn.disabled = state.activeIndex === 0;
    });
    nextBtns.forEach((btn) => {
      const labelSpan = btn.querySelector("[data-next-label]");
      if (state.activeIndex === total - 1) {
        if (labelSpan) labelSpan.textContent = "Finish / Restart";
      } else {
        if (labelSpan) labelSpan.textContent = "Next";
      }
    });
  }

  function renderDesktopHotspots(steps) {
    const stage = document.getElementById("tour-map-canvas");
    if (!stage) return;

    const svgLines = [];
    for (let i = 0; i < steps.length - 1; i++) {
      const a = steps[i];
      const b = steps[i + 1];
      const isHighlighted =
        i === state.activeIndex - 1 || i === state.activeIndex;
      svgLines.push(
        `<line x1="${a.x}%" y1="${a.y}%" x2="${b.x}%" y2="${b.y}%" class="tour-map-connection ${
          isHighlighted ? "is-active-path" : ""
        }" />`
      );
    }

    const hotspotsMarkup = steps
      .map((step, idx) => {
        const isActive = idx === state.activeIndex;
        const isLower = Boolean(step.isLower);
        const tooltipId = `tour-tip-${step.id}`;
        return `
          <button
            type="button"
            class="tour-hotspot ${isActive ? "is-active" : ""} ${isLower ? "is-lower" : ""} ${
              state.openTooltipId === step.id ? "is-tooltip-open" : ""
            }"
            style="--hx: ${step.x}%; --hy: ${step.y}%;"
            data-tour-hotspot="${idx}"
            aria-describedby="${tooltipId}"
            ${isActive ? 'aria-current="step"' : ""}
            aria-label="Step ${idx + 1}: ${escHtml(step.title)}"
          >
            <span class="tour-hotspot-pulse" aria-hidden="true"></span>
            <span class="tour-hotspot-badge" aria-hidden="true">${escHtml(step.stepNum)}</span>
            <i data-lucide="${escHtml(step.icon)}" class="w-4 h-4 shrink-0" aria-hidden="true"></i>
            <span>${escHtml(step.shortLabel)}</span>
            <span id="${tooltipId}" role="tooltip" class="tour-tooltip">
              <strong class="block text-cyan-300 font-semibold mb-0.5">${escHtml(step.stepNum)} · ${escHtml(
          step.title
        )}</strong>
              <span>${escHtml(step.tooltipText)}</span>
            </span>
          </button>
        `;
      })
      .join("");

    stage.innerHTML = `
      <div class="tour-map-grid" aria-hidden="true"></div>
      <svg class="tour-map-svg" aria-hidden="true" preserveAspectRatio="none">
        ${svgLines.join("")}
      </svg>
      ${hotspotsMarkup}
    `;

    stage.querySelectorAll("[data-tour-hotspot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-tour-hotspot") || "0");
        const chosen = steps[idx];
        state.openTooltipId = chosen ? chosen.id : null;
        goToStep(idx);
      });
    });
  }

  function renderMobileHotspots(steps) {
    const mount = document.getElementById("tour-mobile-hotspots");
    if (!mount) return;

    mount.innerHTML = steps
      .map((step, idx) => {
        const isActive = idx === state.activeIndex;
        return `
          <button
            type="button"
            class="tour-mobile-hotspot-btn ${isActive ? "is-active" : ""}"
            data-tour-mobile-hotspot="${idx}"
            ${isActive ? 'aria-current="step"' : ""}
          >
            <span class="tour-hotspot-badge shrink-0" aria-hidden="true">${escHtml(step.stepNum)}</span>
            <span class="min-w-0">
              <span class="block text-xs font-bold text-[var(--text)] truncate">${escHtml(step.shortLabel)}</span>
              <span class="block text-[11px] text-[var(--muted)] truncate">${escHtml(step.category)}</span>
            </span>
          </button>
        `;
      })
      .join("");

    mount.querySelectorAll("[data-tour-mobile-hotspot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-tour-mobile-hotspot") || "0");
        goToStep(idx);
      });
    });
  }

  function renderSpotlightCard(steps, animateTransition = false) {
    const card = document.getElementById("tour-spotlight-card");
    const body = document.getElementById("tour-spotlight-body");
    if (!card || !body) return;

    const step = steps[state.activeIndex] || steps[0];
    const total = steps.length;
    card.classList.toggle("is-guided-highlight", state.mode === "guided");

    const factsList = step.facts
      .map(
        (fact) => `
          <li class="flex items-start gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
            <i data-lucide="check" class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true"></i>
            <span>${escHtml(fact)}</span>
          </li>
        `
      )
      .join("");

    body.classList.remove("is-transitioning");
    if (animateTransition && !state.reducedMotion && !systemPrefersReducedMotion()) {
      void body.offsetWidth;
      body.classList.add("is-transitioning");
    }

    body.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <span class="font-semibold text-cyan-400">${escHtml(step.category)}</span>
          <span class="font-mono-tech tabular-nums">Stop ${state.activeIndex + 1} of ${total}</span>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-11 h-11 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0" aria-hidden="true">
            <i data-lucide="${escHtml(step.icon)}" class="w-5 h-5"></i>
          </div>
          <div class="space-y-1 min-w-0">
            <h2 id="tour-step-heading" class="text-xl sm:text-2xl font-bold text-[var(--text)]">${escHtml(
              step.title
            )}</h2>
            <p class="text-xs text-[var(--muted)]">Route · <span class="font-mono-tech text-indigo-400">${escHtml(
              step.primaryHref
            )}</span></p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <div class="tour-explain-block space-y-1">
            <h3 class="text-xs font-bold uppercase tracking-wider text-indigo-400">What You Are Viewing</h3>
            <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(step.whatViewing)}</p>
          </div>

          <div class="tour-explain-block space-y-1">
            <h3 class="text-xs font-bold uppercase tracking-wider text-cyan-400">Why It Matters</h3>
            <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(step.whyMatters)}</p>
          </div>
        </div>

        <div class="space-y-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Portfolio Highlights</h3>
          <ul class="space-y-1.5 list-none p-0 m-0">${factsList}</ul>
        </div>
      </div>

      <div class="pt-4 mt-2 border-t border-[var(--border)] flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2.5">
        <a href="${escHtml(step.primaryHref)}" class="primary-button w-full sm:w-auto justify-center">
          <span>${escHtml(step.primaryLabel)}</span>
          <i data-lucide="arrow-up-right" class="w-4 h-4" aria-hidden="true"></i>
        </a>
        ${
          step.secondaryHref
            ? `
              <a href="${escHtml(step.secondaryHref)}" class="outline-button w-full sm:w-auto justify-center">
                <span>${escHtml(step.secondaryLabel)}</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5" aria-hidden="true"></i>
              </a>
            `
            : ""
        }
      </div>
    `;
  }

  function renderTextOnlyView(steps) {
    const mount = document.getElementById("tour-text-only-list");
    if (!mount) return;

    mount.innerHTML = steps
      .map((step, idx) => {
        const isActive = idx === state.activeIndex;
        const factsMarkup = step.facts
          .map((fact) => `<li>${escHtml(fact)}</li>`)
          .join("");

        return `
          <article
            id="tour-text-step-${idx + 1}"
            class="tour-text-only-card space-y-3 ${isActive ? "is-active" : ""}"
            ${isActive ? 'aria-current="step"' : ""}
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-xs font-semibold text-cyan-400">
                <span class="font-mono-tech tabular-nums">Step ${idx + 1} of ${steps.length}</span> · ${escHtml(
          step.category
        )}
              </p>
              <button
                type="button"
                class="tour-ctrl-btn min-h-[36px] py-1 px-3 text-xs"
                data-tour-text-focus="${idx}"
              >
                ${isActive ? "Active Step" : "Focus Step"}
              </button>
            </div>

            <h2 class="text-lg sm:text-xl font-bold text-[var(--text)]">${escHtml(step.stepNum)}. ${escHtml(
          step.title
        )}</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div class="space-y-1">
                <h3 class="text-xs font-bold uppercase tracking-wider text-indigo-400">What You Are Viewing</h3>
                <p class="text-[var(--text-secondary)] leading-relaxed">${escHtml(step.whatViewing)}</p>
              </div>
              <div class="space-y-1">
                <h3 class="text-xs font-bold uppercase tracking-wider text-cyan-400">Why It Matters</h3>
                <p class="text-[var(--text-secondary)] leading-relaxed">${escHtml(step.whyMatters)}</p>
              </div>
            </div>

            <ul class="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[var(--muted)] m-0">
              ${factsMarkup}
            </ul>

            <div class="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold">
              <a href="${escHtml(step.primaryHref)}" class="text-cyan-400 hover:underline inline-flex items-center gap-1.5">
                <span>${escHtml(step.primaryLabel)}</span>
                <i data-lucide="arrow-up-right" class="w-4 h-4" aria-hidden="true"></i>
              </a>
              ${
                step.secondaryHref
                  ? `<a href="${escHtml(step.secondaryHref)}" class="text-[var(--text-secondary)] hover:text-[var(--text)] underline-offset-4 hover:underline">${escHtml(
                      step.secondaryLabel
                    )}</a>`
                  : ""
              }
            </div>
          </article>
        `;
      })
      .join("");

    mount.querySelectorAll("[data-tour-text-focus]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-tour-text-focus") || "0");
        goToStep(idx);
      });
    });
  }

  function renderExploreDirectory(steps) {
    const mount = document.getElementById("tour-explore-grid");
    if (!mount) return;

    mount.innerHTML = steps
      .map((step, idx) => {
        const isActive = idx === state.activeIndex;
        return `
          <article class="tour-explore-card ${isActive ? "is-active" : ""}">
            <div class="space-y-2.5">
              <div class="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                <span class="font-mono-tech tabular-nums text-cyan-400 font-semibold">${escHtml(step.stepNum)}</span>
                <span>${escHtml(step.category)}</span>
              </div>
              <div class="flex items-center gap-2.5">
                <span class="w-9 h-9 rounded-lg border border-indigo-500/25 bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0" aria-hidden="true">
                  <i data-lucide="${escHtml(step.icon)}" class="w-4 h-4"></i>
                </span>
                <h3 class="text-base font-bold text-[var(--text)]">${escHtml(step.shortLabel)}</h3>
              </div>
              <p class="text-xs text-[var(--muted)] leading-relaxed">${escHtml(step.tooltipText)}</p>
            </div>

            <div class="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                class="text-xs font-semibold text-cyan-400 hover:underline bg-transparent border-0 p-0 cursor-pointer"
                data-tour-dir-select="${idx}"
              >
                Inspect Step
              </button>
              <a href="${escHtml(step.primaryHref)}" class="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text)] inline-flex items-center gap-1">
                <span>Open Page</span>
                <i data-lucide="arrow-up-right" class="w-3.5 h-3.5" aria-hidden="true"></i>
              </a>
            </div>
          </article>
        `;
      })
      .join("");

    mount.querySelectorAll("[data-tour-dir-select]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-tour-dir-select") || "0");
        goToStep(idx);
        const target = state.textOnly
          ? document.getElementById(`tour-text-step-${idx + 1}`)
          : document.getElementById("tour-spotlight-card");
        if (target && typeof target.scrollIntoView === "function") {
          target.scrollIntoView({
            behavior: state.reducedMotion || systemPrefersReducedMotion() ? "auto" : "smooth",
            block: "nearest"
          });
        }
      });
    });
  }

  function renderAll(animateTransition = false) {
    const steps = getTourSteps();
    if (state.activeIndex >= steps.length) state.activeIndex = 0;

    applyMotionPreference();
    syncToolbarState();
    renderProgressAndControls(steps);
    renderDesktopHotspots(steps);
    renderMobileHotspots(steps);
    renderSpotlightCard(steps, animateTransition);
    renderTextOnlyView(steps);
    renderExploreDirectory(steps);
    refreshIcons();
  }

  function goToStep(index, opts = {}) {
    const steps = getTourSteps();
    const clamped = Math.max(0, Math.min(steps.length - 1, index));
    state.activeIndex = clamped;
    state.visitedIndices.add(clamped);
    if (opts.activateGuided) {
      state.mode = "guided";
    }
    persistState();
    renderAll(true);

    const step = steps[clamped];
    announce(`Step ${clamped + 1} of ${steps.length}: ${step.title}. ${step.whatViewing}`);
  }

  function nextStep() {
    const steps = getTourSteps();
    if (state.activeIndex >= steps.length - 1) {
      restartTour();
      return;
    }
    goToStep(state.activeIndex + 1, { activateGuided: state.mode !== "explore" });
  }

  function prevStep() {
    if (state.activeIndex <= 0) return;
    goToStep(state.activeIndex - 1, { activateGuided: state.mode !== "explore" });
  }

  function startTour() {
    state.mode = "guided";
    state.visitedIndices.add(state.activeIndex);
    persistState();
    renderAll(true);

    const steps = getTourSteps();
    const step = steps[state.activeIndex] || steps[0];
    announce(`Guided tour started. Step ${state.activeIndex + 1} of ${steps.length}: ${step.title}.`);
    showToast("Guided tour active — use Previous/Next or arrow keys", "info");

    const spotlight = document.getElementById("tour-spotlight-card");
    if (spotlight && typeof spotlight.focus === "function") {
      spotlight.focus({ preventScroll: true });
    }
  }

  function exploreFreely() {
    state.mode = "explore";
    state.openTooltipId = null;
    persistState();
    renderAll(false);
    announce("Explore Freely mode active. Click any hotspot or directory card at your own pace.");
    showToast("Explore Freely mode active — no tour steps required", "info");
  }

  function skipTour() {
    state.mode = "skipped";
    state.openTooltipId = null;
    persistState();
    renderAll(false);
    announce("Tour skipped. You can explore freely or restart the tour anytime.");
    showToast("Tour skipped — explore any section freely", "info");
  }

  function restartTour() {
    state.activeIndex = 0;
    state.visitedIndices = new Set([0]);
    state.mode = "guided";
    state.openTooltipId = null;
    persistState();
    renderAll(true);
    announce("Tour restarted at Step 1 of 8: Overview & Personal Brand.");
    showToast("Tour restarted at Step 1", "success");
  }

  function setTextOnlyMode(enabled) {
    state.textOnly = Boolean(enabled);
    persistState();
    renderAll(false);
    announce(
      state.textOnly
        ? "Accessible text-only tour mode enabled."
        : "Visual hotspot map tour mode enabled."
    );
  }

  function setReducedMotion(enabled) {
    state.reducedMotion = Boolean(enabled);
    persistState();
    applyMotionPreference();
    announce(
      state.reducedMotion
        ? "Reduced motion enabled for guided tour."
        : "Standard tour transitions enabled."
    );
  }

  function bindEvents() {
    const startBtn = document.getElementById("tour-start-btn");
    const freeBtn = document.getElementById("tour-free-btn");
    const skipBtns = document.querySelectorAll("[data-tour-skip]");
    const restartBtns = document.querySelectorAll("[data-tour-restart]");
    const prevBtns = document.querySelectorAll("[data-tour-prev]");
    const nextBtns = document.querySelectorAll("[data-tour-next]");
    const textBtn = document.getElementById("tour-text-mode-btn");
    const visualBtn = document.getElementById("tour-visual-mode-btn");
    const motionBtn = document.getElementById("tour-motion-toggle");

    if (startBtn) startBtn.addEventListener("click", startTour);
    if (freeBtn) freeBtn.addEventListener("click", exploreFreely);
    skipBtns.forEach((btn) => btn.addEventListener("click", skipTour));
    restartBtns.forEach((btn) => btn.addEventListener("click", restartTour));
    prevBtns.forEach((btn) => btn.addEventListener("click", prevStep));
    nextBtns.forEach((btn) => btn.addEventListener("click", nextStep));

    if (textBtn) {
      textBtn.addEventListener("click", () => setTextOnlyMode(!state.textOnly));
    }
    if (visualBtn) {
      visualBtn.addEventListener("click", () => setTextOnlyMode(false));
    }
    if (motionBtn) {
      motionBtn.addEventListener("click", () => setReducedMotion(!state.reducedMotion));
    }

    // Mobile Swipe Support (horizontal swipe on Spotlight Card or Map Stage)
    const swipeTargets = [
      document.getElementById("tour-spotlight-card"),
      document.getElementById("tour-map-canvas")
    ].filter(Boolean);

    swipeTargets.forEach((el) => {
      el.addEventListener(
        "touchstart",
        (event) => {
          if (!event.changedTouches || !event.changedTouches.length) return;
          const touch = event.changedTouches[0];
          state.swipeStartX = touch.clientX;
          state.swipeStartY = touch.clientY;
          state.swipeTracking = true;
        },
        { passive: true }
      );

      el.addEventListener(
        "touchend",
        (event) => {
          if (!state.swipeTracking || !event.changedTouches || !event.changedTouches.length) return;
          state.swipeTracking = false;
          const touch = event.changedTouches[0];
          const deltaX = touch.clientX - state.swipeStartX;
          const deltaY = touch.clientY - state.swipeStartY;

          if (Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
            if (deltaX < 0) {
              nextStep();
            } else {
              prevStep();
            }
          }
        },
        { passive: true }
      );
    });

    if (!bindEvents.keyboardBound) {
      bindEvents.keyboardBound = true;
      document.addEventListener("keydown", (event) => {
        const root = document.getElementById("tour-root");
        if (!root) return;

        const target = event.target;
        const tag = target && target.tagName ? target.tagName.toUpperCase() : "";
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (target && target.isContentEditable)) {
          return;
        }
        if (event.metaKey || event.ctrlKey || event.altKey) return;

        // Ignore if a global overlay modal (like Command Palette) is open
        if (document.querySelector(".ux-modal-backdrop.is-open")) return;

        if (event.key === "ArrowRight") {
          event.preventDefault();
          nextStep();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          prevStep();
        } else if (event.key === "Home") {
          event.preventDefault();
          goToStep(0);
        } else if (event.key === "End") {
          const steps = getTourSteps();
          event.preventDefault();
          goToStep(steps.length - 1);
        } else if (event.key === "Escape") {
          if (state.openTooltipId) {
            state.openTooltipId = null;
            renderAll(false);
          } else if (state.mode === "guided") {
            skipTour();
          }
        }
      });
    }
  }

  function init() {
    const root = document.getElementById("tour-root");
    if (!root || state.initialized) return;
    state.initialized = true;

    const restored = loadPersistedState();
    state.activeIndex = restored.activeIndex;
    state.mode = restored.mode;
    state.textOnly = restored.textOnly;
    state.reducedMotion = restored.reducedMotion;
    state.visitedIndices.add(state.activeIndex);

    renderAll(false);
    bindEvents();
  }

  return {
    init,
    startTour,
    exploreFreely,
    skipTour,
    restartTour,
    goToStep,
    nextStep,
    prevStep,
    setTextOnlyMode,
    setReducedMotion,
    getSteps: getTourSteps
  };
})();

window.PortfolioTour = PortfolioTour;
