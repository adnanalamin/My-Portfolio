/**
 * AL AMIN Portfolio — Interactive Developer Dashboard (Phase 13)
 * Data configuration is strictly separated from HTML markup below.
 * Update DASHBOARD_CONFIG or window.portfolioConfig to customize metrics,
 * availability, activity, technologies, timeline, and sample contribution data.
 */

const PortfolioDashboard = (() => {
  /* ========================================================================
     Centralized Editable Dashboard Configuration
     ======================================================================== */
  const DASHBOARD_CONFIG = {
    overview: {
      welcomeHeading: "Developer Command Dashboard",
      welcomeMessage:
        "A centralized view of engineering output, active learning tracks, core stack fluency, featured builds, and project availability.",
      lastUpdated: "2026-05-18",
      lastUpdatedLabel: "May 18, 2026"
    },

    availabilityOptions: [
      {
        key: "freelance",
        label: "Available for Freelance",
        tone: "emerald",
        icon: "check-circle-2",
        responseTime: "Usually within 24 hours",
        summary: "Accepting custom full-stack web builds, SaaS interfaces, and responsive redesigns."
      },
      {
        key: "projects",
        label: "Open to Projects",
        tone: "cyan",
        icon: "folder-git-2",
        responseTime: "1–2 business days",
        summary: "Open to collaborating on scoped product MVPs, dashboards, and MERN applications."
      },
      {
        key: "remote",
        label: "Open to Remote Work",
        tone: "indigo",
        icon: "globe",
        responseTime: "Flexible async & overlap",
        summary: "Available for remote frontend, backend, or full-stack engineering roles."
      },
      {
        key: "busy",
        label: "Currently Busy",
        tone: "amber",
        icon: "clock",
        responseTime: "Limited weekly capacity",
        summary: "Focused on active sprint milestones — new inquiries are queued for the next opening."
      }
    ],

    stats: [
      {
        id: "total-projects",
        label: "Total Projects",
        value: 25,
        suffix: "+",
        note: "Includes 6 published case studies",
        icon: "folder-kanban"
      },
      {
        id: "completed-projects",
        label: "Completed Projects",
        value: 22,
        suffix: "+",
        note: "Shipped client & personal builds",
        icon: "check-circle-2"
      },
      {
        id: "technologies-used",
        label: "Technologies Used",
        value: 18,
        suffix: "+",
        note: "Frontend, backend, DB & tooling",
        icon: "cpu"
      },
      {
        id: "learning-experience",
        label: "Years of Learning / Experience",
        value: 3,
        suffix: "+ Yrs",
        note: "Continuous full-stack craft",
        icon: "calendar-clock"
      },
      {
        id: "current-projects",
        label: "Current Projects",
        value: 2,
        suffix: "",
        note: "Active builds in iteration",
        icon: "code-2"
      },
      {
        id: "open-source",
        label: "Open Source Contributions",
        value: 12,
        suffix: "+",
        note: "Configurable starter repos & PRs",
        icon: "git-pull-request"
      }
    ],

    currentActivity: [
      {
        id: "working-on",
        label: "Currently Working On",
        icon: "laptop",
        tone: "indigo",
        detail: "Interactive Developer Dashboard, AstraPulse UI refinements, and modular MERN API templates."
      },
      {
        id: "learning",
        label: "Currently Learning",
        icon: "book-open",
        tone: "cyan",
        detail: "Advanced TypeScript patterns, Next.js App Router architecture, and PostgreSQL indexing."
      },
      {
        id: "next-goals",
        label: "Next Development Goals",
        icon: "target",
        tone: "indigo",
        detail: "Connect live GitHub activity integration, expand automated UI checks, and publish open-source starters."
      },
      {
        id: "availability-track",
        label: "Current Availability",
        icon: "calendar-check",
        tone: "emerald",
        detail: "Synced with active availability status below."
      },
      {
        id: "portfolio-updates",
        label: "Latest Portfolio Updates",
        icon: "sparkles",
        tone: "cyan",
        detail: "Released Phase 13 Developer Dashboard alongside Blog Reader, Testimonials, and Print Resume."
      }
    ],

    contributionDemo: {
      isSampleData: true,
      badgeLabel: "Sample Contribution Data (Static Demo)",
      disclaimer:
        "Illustrative contribution calendar shown for portfolio demonstration until connected to a live GitHub API source.",
      years: [2024, 2025, 2026],
      defaultYear: 2026,
      cutoffYear: 2026,
      cutoffMonth: 4, // 0-indexed: May
      cutoffDay: 18
    },

    technologies: [
      {
        id: "html",
        name: "HTML",
        category: "Frontend",
        tier: "Core Daily Stack",
        ratingLabel: "5 / 5",
        scale: 0.95,
        icon: "code",
        focus: "Semantic document landmarks, accessible forms, SEO metadata, and structured schemas.",
        relatedProjects: ["Portfolio System", "SLIDEVERSE", "AstraPulse", "Nexora"]
      },
      {
        id: "css",
        name: "CSS",
        category: "Frontend",
        tier: "Core Daily Stack",
        ratingLabel: "5 / 5",
        scale: 0.93,
        icon: "palette",
        focus: "CSS Grid, Flexbox, design tokens, fluid clamp() typography, and print stylesheets.",
        relatedProjects: ["Portfolio System", "SLIDEVERSE", "Nexora", "AstraPulse"]
      },
      {
        id: "javascript",
        name: "JavaScript",
        category: "Frontend",
        tier: "Core Daily Stack",
        ratingLabel: "5 / 5",
        scale: 0.92,
        icon: "braces",
        focus: "ES2024+ modular engineering, async data workflows, DOM state, and keyboard accessibility.",
        relatedProjects: ["Portfolio System", "SLIDEVERSE", "AstraPulse", "E-commerce SaaS"]
      },
      {
        id: "tailwind-css",
        name: "Tailwind CSS",
        category: "Frontend",
        tier: "Core Daily Stack",
        ratingLabel: "5 / 5",
        scale: 0.94,
        icon: "wind",
        focus: "Mobile-first responsive layout grids, consistent spacing scales, and dual-theme UI utilities.",
        relatedProjects: ["AstraPulse", "Nexora", "SLIDEVERSE", "School Management System"]
      },
      {
        id: "react",
        name: "React",
        category: "Frontend",
        tier: "Production Ready",
        ratingLabel: "4.5 / 5",
        scale: 0.9,
        icon: "atom",
        focus: "Reusable component systems, custom hooks, state composition, and single-page workflows.",
        relatedProjects: ["AstraPulse", "Nexora", "SLIDEVERSE", "School Management System"]
      },
      {
        id: "nodejs",
        name: "Node.js",
        category: "Backend & DB",
        tier: "Production Ready",
        ratingLabel: "4.5 / 5",
        scale: 0.88,
        icon: "server",
        focus: "REST API runtimes, authentication services, request validation, and scalable server modules.",
        relatedProjects: ["AstraPulse", "Nexora", "School Management System", "E-commerce SaaS"]
      },
      {
        id: "expressjs",
        name: "Express.js",
        category: "Backend & DB",
        tier: "Production Ready",
        ratingLabel: "4.5 / 5",
        scale: 0.87,
        icon: "route",
        focus: "Versioned REST routing, JWT middleware guards, structured error handlers, and controllers.",
        relatedProjects: ["AstraPulse", "Nexora", "School Management System", "E-commerce SaaS"]
      },
      {
        id: "mongodb",
        name: "MongoDB",
        category: "Backend & DB",
        tier: "Production Ready",
        ratingLabel: "4.5 / 5",
        scale: 0.86,
        icon: "database",
        focus: "Document data modeling, Mongoose schemas, compound indexing, and analytical queries.",
        relatedProjects: ["AstraPulse", "Nexora", "School Management System", "E-commerce SaaS"]
      },
      {
        id: "git",
        name: "Git",
        category: "Tools & VCS",
        tier: "Daily Workflow",
        ratingLabel: "4.5 / 5",
        scale: 0.9,
        icon: "git-branch",
        focus: "Branching strategies, atomic commits, conflict resolution, and clean version history.",
        relatedProjects: ["AstraPulse", "Nexora", "Portfolio System", "E-commerce SaaS"]
      },
      {
        id: "github",
        name: "GitHub",
        category: "Tools & VCS",
        tier: "Daily Workflow",
        ratingLabel: "4.5 / 5",
        scale: 0.9,
        icon: "github",
        focus: "Repository organization, pull requests, issue workflows, documentation, and deployments.",
        relatedProjects: ["AstraPulse", "Nexora", "SLIDEVERSE", "Portfolio System"]
      }
    ],

    projectStatuses: {
      astrapulse: "Active",
      nexora: "Completed",
      slideverse: "Completed",
      "school-management-system": "Completed",
      "portfolio-system": "Active",
      "ecommerce-saas": "Completed"
    },

    timeline: [
      {
        period: "2026",
        title: "Developer Dashboard & Multi-Page Portfolio Architecture",
        subtitle: "System Engineering · Responsive QA",
        icon: "layout-dashboard",
        description:
          "Engineered a 15-page portfolio platform with centralized configuration, interactive developer dashboard, blog reader, print resume, and 320px–2560px accessibility."
      },
      {
        period: "2025",
        title: "Full-Stack SaaS & Management Platforms",
        subtitle: "AstraPulse, School Management System & E-commerce SaaS",
        icon: "layers",
        description:
          "Built multi-role dashboards, pre-aggregated MongoDB analytics workflows, and merchant commerce portals focused on clarity and sub-200ms query responsiveness."
      },
      {
        period: "2024",
        title: "MERN Stack & Interactive UI Engineering",
        subtitle: "Nexora & SLIDEVERSE",
        icon: "atom",
        description:
          "Deepened full-stack architecture across React, Redux, Node.js, Express, and MongoDB while crafting keyboard-accessible slide editors and storefront drawers."
      },
      {
        period: "2023",
        title: "Freelance Web Delivery & Client Collaboration",
        subtitle: "Frontend & Custom Web Systems",
        icon: "globe",
        description:
          "Delivered responsive landing pages, SEO-structured business websites, and UI modernizations for startups and independent founders."
      },
      {
        period: "2021 – 2022",
        title: "Computer Science & Core Web Foundations",
        subtitle: "HTML5, CSS3, JavaScript & DBMS",
        icon: "graduation-cap",
        description:
          "Established core software engineering fundamentals in data structures, algorithms, semantic HTML, modern CSS layouts, and JavaScript."
      }
    ]
  };

  /* ========================================================================
     State & Helpers
     ======================================================================== */
  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const TONE_TEXT_CLASS = {
    emerald: "text-emerald-400",
    cyan: "text-cyan-400",
    indigo: "text-indigo-400",
    amber: "text-amber-400"
  };

  let state = {
    availabilityKey: "freelance",
    contribView: "year", // "year" | "month"
    contribYear: 2026,
    contribMonth: 4, // 0-indexed May
    selectedDateKey: "",
    techCategory: "All",
    techSearch: "",
    selectedTechId: "javascript",
    projectFilter: "All",
    isContribLoading: false
  };

  let contributionCache = {};

  function esc(value) {
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

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function getAvailabilityOption(key) {
    return (
      DASHBOARD_CONFIG.availabilityOptions.find((opt) => opt.key === key) ||
      DASHBOARD_CONFIG.availabilityOptions[0]
    );
  }

  function formatDateKey(year, monthIndex, day) {
    const mm = String(monthIndex + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  function getActivityLevel(count) {
    if (count <= 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
  }

  function getLevelLabel(level) {
    switch (level) {
      case 0:
        return "No activity";
      case 1:
        return "Light activity";
      case 2:
        return "Moderate activity";
      case 3:
        return "High activity";
      case 4:
        return "Peak sprint";
      default:
        return "Activity";
    }
  }

  // Deterministic pseudo-random sample generator per calendar date
  function buildSampleYearData(year) {
    if (contributionCache[year]) return contributionCache[year];

    const demo = DASHBOARD_CONFIG.contributionDemo;
    const days = [];
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const m = cursor.getMonth();
      const d = cursor.getDate();
      const dow = cursor.getDay();

      const isAfterCutoff =
        year > demo.cutoffYear ||
        (year === demo.cutoffYear && (m > demo.cutoffMonth || (m === demo.cutoffMonth && d > demo.cutoffDay)));

      let count = 0;
      if (!isAfterCutoff) {
        const seed = (year * 379 + (m + 1) * 97 + d * 43 + dow * 19) % 100;
        const weekdayBoost = dow >= 1 && dow <= 5 ? 12 : 0;
        const score = (seed + weekdayBoost) % 100;

        if (score >= 34 && score < 58) count = 1 + (seed % 2);
        else if (score >= 58 && score < 78) count = 3 + (seed % 2);
        else if (score >= 78 && score < 91) count = 5 + (seed % 2);
        else if (score >= 91) count = 7 + (seed % 3);
      }

      const level = getActivityLevel(count);
      const dateKey = formatDateKey(year, m, d);
      const readableDate = `${MONTH_SHORT[m]} ${d}, ${year}`;

      days.push({
        dateKey,
        year,
        month: m,
        day: d,
        dow,
        count,
        level,
        future: isAfterCutoff,
        readableDate
      });
    }

    contributionCache[year] = days;
    return days;
  }

  function calculateStreak(days) {
    let best = 0;
    let current = 0;
    for (const day of days) {
      if (day.count > 0) {
        current += 1;
        if (current > best) best = current;
      } else {
        current = 0;
      }
    }
    return best;
  }

  /* ========================================================================
     Section Renderers
     ======================================================================== */

  function renderOverview() {
    const mount = document.getElementById("dash-overview-mount");
    if (!mount) return;

    const siteCfg = window.portfolioConfig || {};
    const name = siteCfg.name || "AL AMIN";
    const role = siteCfg.role || "Full-Stack Developer & Creative Designer";
    const location = siteCfg.location || "Bangladesh";
    const avatar = siteCfg.profileImage || "assets/images/profile.jpg";
    const bio = siteCfg.bio || "I build modern, scalable and user-focused web applications.";
    const activeAvailability = getAvailabilityOption(state.availabilityKey);
    const overview = DASHBOARD_CONFIG.overview;

    mount.innerHTML = `
      <div class="dash-panel p-5 sm:p-7 lg:p-8 space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 min-w-0">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-[var(--border-strong)] shrink-0 bg-[var(--background)]">
              <img
                src="${esc(avatar)}"
                alt="${esc(name)} profile portrait"
                class="w-full h-full object-cover"
                onerror="this.src='assets/images/profile-placeholder.svg'"
              >
            </div>

            <div class="space-y-1.5 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="dash-status-chip" data-tone="${esc(activeAvailability.tone)}">
                  <i data-lucide="${esc(activeAvailability.icon)}" class="w-3.5 h-3.5 shrink-0"></i>
                  <span>${esc(activeAvailability.label)}</span>
                </span>
                <span class="text-xs font-mono-tech text-[var(--muted)] tabular-nums">
                  Updated <time datetime="${esc(overview.lastUpdated)}">${esc(overview.lastUpdatedLabel)}</time>
                </span>
              </div>

              <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text)]">
                Welcome back, <span data-config="name">${esc(name)}</span>
              </h2>

              <p class="text-sm sm:text-base font-semibold text-indigo-400">
                ${esc(role)}
              </p>
              <p class="text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
                ${esc(overview.welcomeMessage)} ${esc(bio)}
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <a href="projects.html" class="primary-button whitespace-nowrap shrink-0">
              <i data-lucide="folder-kanban" class="w-4 h-4"></i>
              <span>Browse Projects</span>
            </a>
            <a href="contact.html" class="secondary-button whitespace-nowrap shrink-0">
              <i data-lucide="mail" class="w-4 h-4"></i>
              <span>Hire / Contact</span>
            </a>
          </div>
        </div>

        <div class="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[var(--muted)]">
          <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span class="inline-flex items-center gap-1.5">
              <i data-lucide="map-pin" class="w-4 h-4 text-cyan-400"></i>
              <strong class="text-[var(--text-secondary)]">Location:</strong> ${esc(location)}
            </span>
            <span class="inline-flex items-center gap-1.5">
              <i data-lucide="briefcase" class="w-4 h-4 text-indigo-400"></i>
              <strong class="text-[var(--text-secondary)]">Role:</strong> ${esc(role)}
            </span>
          </div>

          <nav class="dash-quick-nav" aria-label="Dashboard sections">
            <a href="#dash-stats-section" class="dash-quick-link">Stats</a>
            <a href="#dash-contrib-section" class="dash-quick-link">Activity Graph</a>
            <a href="#dash-tech-section" class="dash-quick-link">Tech Stack</a>
            <a href="#dash-projects-section" class="dash-quick-link">Projects</a>
            <a href="#dash-github-section" class="dash-quick-link">Live GitHub</a>
            <a href="#dash-availability-section" class="dash-quick-link">Availability</a>
          </nav>
        </div>
      </div>
    `;
  }

  function renderStats() {
    const mount = document.getElementById("dash-stats-mount");
    if (!mount) return;

    mount.innerHTML = DASHBOARD_CONFIG.stats
      .map((stat, idx) => {
        const delayClass = idx % 3 === 1 ? "delay-100" : idx % 3 === 2 ? "delay-200" : "";
        const initialDisplay = `${stat.value}${stat.suffix}`;
        return `
          <article class="dash-stat-card reveal ${delayClass}">
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1 min-w-0">
                <p class="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">${esc(stat.label)}</p>
                <p
                  class="text-2xl sm:text-3xl font-extrabold tabular-nums gradient-text"
                  data-counter-target="${esc(stat.value)}"
                  data-counter-suffix="${esc(stat.suffix)}"
                >${esc(initialDisplay)}</p>
              </div>
              <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0" aria-hidden="true">
                <i data-lucide="${esc(stat.icon)}" class="w-5 h-5"></i>
              </div>
            </div>
            <p class="text-xs text-[var(--muted)] mt-2.5">${esc(stat.note)}</p>
          </article>
        `;
      })
      .join("");
  }

  function renderCurrentActivity() {
    const mount = document.getElementById("dash-activity-mount");
    if (!mount) return;

    const activeAvailability = getAvailabilityOption(state.availabilityKey);

    mount.innerHTML = DASHBOARD_CONFIG.currentActivity
      .map((item) => {
        const detailText =
          item.id === "availability-track"
            ? `${activeAvailability.label} — ${activeAvailability.summary}`
            : item.detail;
        const tone = item.id === "availability-track" ? activeAvailability.tone : item.tone;
        const iconColorClass = TONE_TEXT_CLASS[tone] || "text-indigo-400";

        return `
          <div class="py-3.5 first:pt-0 last:pb-0 border-b last:border-b-0 border-[var(--border)] flex items-start gap-3.5">
            <div class="w-9 h-9 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center shrink-0 ${iconColorClass}" aria-hidden="true">
              <i data-lucide="${esc(item.icon)}" class="w-4 h-4"></i>
            </div>
            <div class="space-y-0.5 min-w-0">
              <h3 class="text-xs sm:text-sm font-bold text-[var(--text)]">${esc(item.label)}</h3>
              <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${esc(detailText)}</p>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderContributionGraph() {
    const mount = document.getElementById("dash-contrib-mount");
    if (!mount) return;

    const demo = DASHBOARD_CONFIG.contributionDemo;

    if (state.isContribLoading) {
      mount.innerHTML = `
        <div class="space-y-4" aria-busy="true" aria-label="Loading contribution graph">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="dash-skeleton-block h-8 w-56"></div>
            <div class="dash-skeleton-block h-9 w-48"></div>
          </div>
          <div class="dash-skeleton-block h-36 w-full"></div>
        </div>
      `;
      return;
    }

    const days = buildSampleYearData(state.contribYear);
    const activePeriodDays =
      state.contribView === "month"
        ? days.filter((d) => d.month === state.contribMonth)
        : days;

    const totalContributions = activePeriodDays.reduce((sum, d) => sum + d.count, 0);
    const activeDaysCount = activePeriodDays.filter((d) => d.count > 0).length;
    const longestStreak = calculateStreak(activePeriodDays);

    if (!state.selectedDateKey || !activePeriodDays.some((d) => d.dateKey === state.selectedDateKey)) {
      const latestActive = [...activePeriodDays].reverse().find((d) => d.count > 0) || activePeriodDays[0];
      state.selectedDateKey = latestActive ? latestActive.dateKey : "";
    }

    const selectedEntry = activePeriodDays.find((d) => d.dateKey === state.selectedDateKey) || activePeriodDays[0];

    const yearIdx = demo.years.indexOf(state.contribYear);
    const canPrev =
      state.contribView === "year"
        ? yearIdx > 0
        : !(state.contribYear === demo.years[0] && state.contribMonth === 0);
    const canNext =
      state.contribView === "year"
        ? yearIdx < demo.years.length - 1
        : !(state.contribYear === demo.years[demo.years.length - 1] && state.contribMonth === 11);

    const periodHeading =
      state.contribView === "month"
        ? `${MONTH_NAMES[state.contribMonth]} ${state.contribYear}`
        : `Year ${state.contribYear}`;

    let calendarMarkup = "";
    if (activePeriodDays.length === 0) {
      calendarMarkup = `
        <div class="p-6 rounded-xl border border-[var(--border)] bg-[var(--background)] text-center space-y-3">
          <p class="text-sm text-[var(--muted)]">No sample contribution records exist for this period.</p>
          <button type="button" id="contrib-reset-btn" class="secondary-button mx-auto">Reset to ${esc(demo.defaultYear)}</button>
        </div>
      `;
    } else if (state.contribView === "year") {
      // Organize into 53 Sunday-Saturday columns matching GitHub layout
      const firstDow = days[0].dow;
      const paddedSlots = [];
      for (let i = 0; i < firstDow; i += 1) {
        paddedSlots.push(null);
      }
      days.forEach((d) => paddedSlots.push(d));
      while (paddedSlots.length < 53 * 7) {
        paddedSlots.push(null);
      }

      const monthHeaders = [];
      const columnsMarkup = [];
      let lastMonthShown = -1;

      for (let w = 0; w < 53; w += 1) {
        const colSlots = paddedSlots.slice(w * 7, w * 7 + 7);
        const firstReal = colSlots.find((s) => s !== null);
        let monthLabel = "";
        if (firstReal && firstReal.month !== lastMonthShown) {
          monthLabel = MONTH_SHORT[firstReal.month];
          lastMonthShown = firstReal.month;
        }
        monthHeaders.push(`<span class="truncate">${esc(monthLabel)}</span>`);

        const cellHtml = colSlots
          .map((slot) => {
            if (!slot) {
              return `<span class="contrib-cell-spacer" aria-hidden="true"></span>`;
            }
            const selectedClass = slot.dateKey === state.selectedDateKey ? "is-selected" : "";
            const statusSuffix = slot.future ? " (Upcoming / unlogged)" : "";
            const aria = `${slot.readableDate}: ${slot.count} sample ${slot.count === 1 ? "contribution" : "contributions"} (${getLevelLabel(slot.level)})${statusSuffix}`;
            return `
              <button
                type="button"
                class="contrib-cell ${selectedClass}"
                data-level="${slot.level}"
                data-date-key="${esc(slot.dateKey)}"
                aria-label="${esc(aria)}"
                aria-pressed="${slot.dateKey === state.selectedDateKey ? "true" : "false"}"
              ></button>
            `;
          })
          .join("");

        columnsMarkup.push(`<div class="contrib-week-col">${cellHtml}</div>`);
      }

      calendarMarkup = `
        <div class="contrib-scroll-wrap" role="region" aria-label="Yearly sample contribution calendar scroll container" tabindex="0">
          <div class="contrib-year-grid">
            <div class="contrib-weekdays" aria-hidden="true">
              <span></span>
              <span>Mon</span>
              <span></span>
              <span>Wed</span>
              <span></span>
              <span>Fri</span>
              <span></span>
            </div>
            <div>
              <div class="contrib-months-row" aria-hidden="true">${monthHeaders.join("")}</div>
              <div class="contrib-weeks-grid" role="grid" aria-label="Sample contributions for ${esc(state.contribYear)}">
                ${columnsMarkup.join("")}
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // Monthly Calendar Grid — naturally responsive at 320px+ with zero horizontal scroll
      const firstDow = activePeriodDays[0].dow;
      const cells = [];
      for (let i = 0; i < firstDow; i += 1) {
        cells.push(`<span class="contrib-month-cell is-empty" aria-hidden="true"></span>`);
      }
      activePeriodDays.forEach((slot) => {
        const selectedClass = slot.dateKey === state.selectedDateKey ? "is-selected" : "";
        const aria = `${slot.readableDate}: ${slot.count} sample ${slot.count === 1 ? "contribution" : "contributions"}`;
        cells.push(`
          <button
            type="button"
            class="contrib-cell contrib-month-cell ${selectedClass}"
            data-level="${slot.level}"
            data-date-key="${esc(slot.dateKey)}"
            aria-label="${esc(aria)}"
            aria-pressed="${slot.dateKey === state.selectedDateKey ? "true" : "false"}"
          >
            <span class="tabular-nums">${slot.day}</span>
            <span class="text-[10px] opacity-75 tabular-nums">${slot.count}</span>
          </button>
        `);
      });

      calendarMarkup = `
        <div>
          <div class="contrib-month-weekdays" aria-hidden="true">
            ${WEEKDAY_SHORT.map((w) => `<span>${w}</span>`).join("")}
          </div>
          <div class="contrib-month-grid" role="grid" aria-label="Sample contributions for ${esc(periodHeading)}">
            ${cells.join("")}
          </div>
        </div>
      `;
    }

    const readoutText = selectedEntry
      ? `${selectedEntry.readableDate} · ${selectedEntry.count} sample ${selectedEntry.count === 1 ? "contribution" : "contributions"} (${getLevelLabel(selectedEntry.level)})`
      : "Hover or select a day cell to inspect sample activity";

    mount.innerHTML = `
      <div class="space-y-5">
        <!-- Header & Controls -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="space-y-1.5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="dash-status-chip" data-tone="indigo">
                <i data-lucide="flask-conical" class="w-3.5 h-3.5"></i>
                <span>${esc(demo.badgeLabel)}</span>
              </span>
              <span class="text-xs font-mono-tech text-[var(--muted)] tabular-nums">${esc(periodHeading)}</span>
            </div>
            <p class="text-xs sm:text-sm text-[var(--muted)]">${esc(demo.disclaimer)}</p>
          </div>

          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <div class="inline-flex rounded-lg border border-[var(--border)] bg-[var(--background)] p-1" role="tablist" aria-label="Contribution calendar view mode">
              <button
                type="button"
                role="tab"
                aria-selected="${state.contribView === "year" ? "true" : "false"}"
                data-contrib-view="year"
                class="skill-tab-btn py-1.5 px-3 min-h-[34px] text-xs ${state.contribView === "year" ? "is-active" : ""}"
              >Yearly</button>
              <button
                type="button"
                role="tab"
                aria-selected="${state.contribView === "month" ? "true" : "false"}"
                data-contrib-view="month"
                class="skill-tab-btn py-1.5 px-3 min-h-[34px] text-xs ${state.contribView === "month" ? "is-active" : ""}"
              >Monthly</button>
            </div>

            <div class="inline-flex items-center gap-1.5">
              <button
                type="button"
                id="contrib-prev-btn"
                class="icon-button w-9 h-9"
                aria-label="Previous ${state.contribView === "year" ? "year" : "month"}"
                ${canPrev ? "" : "disabled"}
              >
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
              </button>
              <span class="text-xs font-mono-tech font-semibold text-[var(--text)] min-w-[78px] text-center tabular-nums">${esc(periodHeading)}</span>
              <button
                type="button"
                id="contrib-next-btn"
                class="icon-button w-9 h-9"
                aria-label="Next ${state.contribView === "year" ? "year" : "month"}"
                ${canNext ? "" : "disabled"}
              >
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Summary Metrics Strip -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
            <p class="text-xs text-[var(--muted)]">Sample Contributions (${esc(periodHeading)})</p>
            <p class="text-lg sm:text-xl font-bold text-[var(--text)] tabular-nums mt-0.5">${esc(totalContributions)}</p>
          </div>
          <div class="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
            <p class="text-xs text-[var(--muted)]">Sample Active Days</p>
            <p class="text-lg sm:text-xl font-bold text-[var(--text)] tabular-nums mt-0.5">${esc(activeDaysCount)}</p>
          </div>
          <div class="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
            <p class="text-xs text-[var(--muted)]">Sample Longest Streak</p>
            <p class="text-lg sm:text-xl font-bold text-[var(--text)] tabular-nums mt-0.5">${esc(longestStreak)} ${longestStreak === 1 ? "day" : "days"}</p>
          </div>
        </div>

        <!-- Interactive Heatmap / Calendar -->
        ${calendarMarkup}

        <!-- Detail Readout & Intensity Legend -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
          <p id="contrib-detail-readout" class="text-xs sm:text-sm font-mono-tech text-[var(--text-secondary)] tabular-nums" aria-live="polite">
            ${esc(readoutText)}
          </p>
          <div class="flex items-center gap-1.5 text-xs text-[var(--muted)] shrink-0" aria-label="Contribution intensity legend">
            <span>Less</span>
            <span class="contrib-legend-swatch contrib-cell" data-level="0" aria-hidden="true"></span>
            <span class="contrib-legend-swatch contrib-cell" data-level="1" aria-hidden="true"></span>
            <span class="contrib-legend-swatch contrib-cell" data-level="2" aria-hidden="true"></span>
            <span class="contrib-legend-swatch contrib-cell" data-level="3" aria-hidden="true"></span>
            <span class="contrib-legend-swatch contrib-cell" data-level="4" aria-hidden="true"></span>
            <span>More</span>
          </div>
        </div>
      </div>
    `;

    // Bind View Switch
    mount.querySelectorAll("[data-contrib-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextView = btn.getAttribute("data-contrib-view");
        if (!nextView || nextView === state.contribView) return;
        state.contribView = nextView;
        triggerContribTransition();
      });
    });

    const prevBtn = document.getElementById("contrib-prev-btn");
    const nextBtn = document.getElementById("contrib-next-btn");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (state.contribView === "year") {
          const idx = demo.years.indexOf(state.contribYear);
          if (idx > 0) state.contribYear = demo.years[idx - 1];
        } else {
          if (state.contribMonth > 0) {
            state.contribMonth -= 1;
          } else {
            const idx = demo.years.indexOf(state.contribYear);
            if (idx > 0) {
              state.contribYear = demo.years[idx - 1];
              state.contribMonth = 11;
            }
          }
        }
        triggerContribTransition();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (state.contribView === "year") {
          const idx = demo.years.indexOf(state.contribYear);
          if (idx < demo.years.length - 1) state.contribYear = demo.years[idx + 1];
        } else {
          if (state.contribMonth < 11) {
            state.contribMonth += 1;
          } else {
            const idx = demo.years.indexOf(state.contribYear);
            if (idx < demo.years.length - 1) {
              state.contribYear = demo.years[idx + 1];
              state.contribMonth = 0;
            }
          }
        }
        triggerContribTransition();
      });
    }

    const resetBtn = document.getElementById("contrib-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.contribYear = demo.defaultYear;
        state.contribMonth = demo.cutoffMonth;
        renderContributionGraph();
      });
    }

    // Bind cell hover/focus/click/keyboard navigation
    const cells = Array.from(mount.querySelectorAll(".contrib-cell[data-date-key]"));
    const readoutEl = document.getElementById("contrib-detail-readout");

    function highlightCell(cellEl, commitSelect = false) {
      const key = cellEl.getAttribute("data-date-key");
      const entry = activePeriodDays.find((d) => d.dateKey === key);
      if (!entry) return;
      if (readoutEl) {
        readoutEl.textContent = `${entry.readableDate} · ${entry.count} sample ${entry.count === 1 ? "contribution" : "contributions"} (${getLevelLabel(entry.level)})`;
      }
      if (commitSelect) {
        state.selectedDateKey = key;
        cells.forEach((c) => {
          const isMatch = c.getAttribute("data-date-key") === key;
          c.classList.toggle("is-selected", isMatch);
          c.setAttribute("aria-pressed", isMatch ? "true" : "false");
        });
      }
    }

    cells.forEach((cell, index) => {
      cell.addEventListener("mouseenter", () => highlightCell(cell, false));
      cell.addEventListener("focus", () => highlightCell(cell, true));
      cell.addEventListener("click", () => highlightCell(cell, true));
      cell.addEventListener("keydown", (event) => {
        let nextIndex = -1;
        const stepVertical = state.contribView === "month" ? 7 : 1;
        const stepHorizontal = state.contribView === "month" ? 1 : 7;

        if (event.key === "ArrowRight") nextIndex = index + stepHorizontal;
        else if (event.key === "ArrowLeft") nextIndex = index - stepHorizontal;
        else if (event.key === "ArrowDown") nextIndex = index + stepVertical;
        else if (event.key === "ArrowUp") nextIndex = index - stepVertical;

        if (nextIndex >= 0 && nextIndex < cells.length) {
          event.preventDefault();
          cells[nextIndex].focus();
        }
      });
    });

    refreshIcons();
  }

  function triggerContribTransition() {
    if (prefersReducedMotion()) {
      renderContributionGraph();
      return;
    }
    state.isContribLoading = true;
    renderContributionGraph();
    window.setTimeout(() => {
      state.isContribLoading = false;
      renderContributionGraph();
    }, 140);
  }

  function renderTechVisualization() {
    const mount = document.getElementById("dash-tech-mount");
    if (!mount) return;

    const categories = ["All", "Frontend", "Backend & DB", "Tools & VCS"];
    const filtered = DASHBOARD_CONFIG.technologies.filter((tech) => {
      const catMatch = state.techCategory === "All" || tech.category === state.techCategory;
      if (!catMatch) return false;
      if (!state.techSearch) return true;
      const q = state.techSearch.toLowerCase();
      return (
        tech.name.toLowerCase().includes(q) ||
        tech.category.toLowerCase().includes(q) ||
        tech.focus.toLowerCase().includes(q)
      );
    });

    if (filtered.length > 0 && !filtered.some((t) => t.id === state.selectedTechId)) {
      state.selectedTechId = filtered[0].id;
    }

    const activeTech =
      filtered.find((t) => t.id === state.selectedTechId) ||
      DASHBOARD_CONFIG.technologies.find((t) => t.id === state.selectedTechId) ||
      DASHBOARD_CONFIG.technologies[0];

    const tabsHtml = categories
      .map((cat) => {
        const isActive = state.techCategory === cat;
        return `
          <button
            type="button"
            role="tab"
            aria-selected="${isActive ? "true" : "false"}"
            data-tech-cat="${esc(cat)}"
            class="skill-tab-btn ${isActive ? "is-active" : ""}"
          >${esc(cat)}</button>
        `;
      })
      .join("");

    const chartRowsHtml =
      filtered.length === 0
        ? `
          <div class="p-6 rounded-xl border border-[var(--border)] bg-[var(--background)] text-center space-y-3">
            <i data-lucide="search-x" class="w-7 h-7 text-indigo-400 mx-auto"></i>
            <p class="text-sm text-[var(--muted)]">No technologies matched "${esc(state.techSearch)}".</p>
            <button type="button" id="dash-tech-reset" class="secondary-button mx-auto">Reset Tech Filters</button>
          </div>
        `
        : filtered
            .map((tech) => {
              const isSelected = tech.id === state.selectedTechId;
              return `
                <button
                  type="button"
                  class="dash-tech-row ${isSelected ? "is-active" : ""}"
                  data-tech-select="${esc(tech.id)}"
                  aria-pressed="${isSelected ? "true" : "false"}"
                >
                  <div class="flex items-center justify-between gap-2 mb-1.5">
                    <span class="inline-flex items-center gap-2 text-sm font-bold text-[var(--text)]">
                      <i data-lucide="${esc(tech.icon)}" class="w-4 h-4 text-cyan-400 shrink-0"></i>
                      <span>${esc(tech.name)}</span>
                    </span>
                    <span class="text-xs font-mono-tech text-[var(--muted)] tabular-nums">
                      ${esc(tech.tier)} · ${esc(tech.ratingLabel)}
                    </span>
                  </div>
                  <div class="dash-tech-bar-track" aria-hidden="true">
                    <div class="dash-tech-bar-fill" style="--bar-scale: ${esc(tech.scale)};"></div>
                  </div>
                </button>
              `;
            })
            .join("");

    const cardsHtml =
      filtered.length === 0
        ? ""
        : filtered
            .map((tech) => {
              const isSelected = tech.id === state.selectedTechId;
              return `
                <button
                  type="button"
                  data-tech-select="${esc(tech.id)}"
                  class="text-left p-4 rounded-xl border transition-colors ${
                    isSelected
                      ? "border-[var(--border-strong)] bg-indigo-500/10"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--border-strong)]"
                  }"
                  aria-pressed="${isSelected ? "true" : "false"}"
                >
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="inline-flex items-center gap-2 text-sm font-bold text-[var(--text)]">
                      <i data-lucide="${esc(tech.icon)}" class="w-4 h-4 text-indigo-400"></i>
                      <span>${esc(tech.name)}</span>
                    </span>
                    <span class="text-[11px] font-mono-tech text-cyan-400 tabular-nums">${esc(tech.ratingLabel)}</span>
                  </div>
                  <p class="text-xs text-[var(--muted)]">${esc(tech.category)} · ${esc(tech.tier)}</p>
                </button>
              `;
            })
            .join("");

    mount.innerHTML = `
      <div class="space-y-6">
        <!-- Category Tabs + Search -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div class="lg:col-span-8">
            <div class="skill-tabs-bar" role="tablist" aria-label="Filter dashboard technologies">
              ${tabsHtml}
            </div>
          </div>
          <div class="lg:col-span-4">
            <div class="project-search-wrap">
              <i data-lucide="search" class="w-4 h-4 text-[var(--muted)] absolute left-3.5 pointer-events-none"></i>
              <label for="dash-tech-search" class="sr-only">Filter core technologies</label>
              <input
                id="dash-tech-search"
                type="search"
                class="project-search-input"
                placeholder="Filter tech (React, MongoDB...)"
                value="${esc(state.techSearch)}"
                autocomplete="off"
              >
            </div>
          </div>
        </div>

        <p class="text-xs text-[var(--muted)]">
          Showing <strong class="text-[var(--text-secondary)] tabular-nums">${filtered.length}</strong> of 10 core stack technologies. Tiers &amp; scales are configurable portfolio self-assessments — select any technology to inspect applied project context.
        </p>

        <!-- Stacked Mobile / Split Desktop Chart + Inspector -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div class="lg:col-span-7 space-y-2">
            ${chartRowsHtml}
          </div>

          <aside class="lg:col-span-5 p-5 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-4" aria-live="polite">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-indigo-500/12 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <i data-lucide="${esc(activeTech.icon)}" class="w-5 h-5"></i>
                </div>
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-[var(--text)]">${esc(activeTech.name)}</h3>
                  <p class="text-xs text-[var(--muted)]">${esc(activeTech.category)}</p>
                </div>
              </div>
              <span class="dash-status-chip" data-tone="cyan">${esc(activeTech.tier)} (${esc(activeTech.ratingLabel)})</span>
            </div>

            <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${esc(activeTech.focus)}</p>

            <div class="space-y-2 pt-2 border-t border-[var(--border)]">
              <p class="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Applied in Showcase Projects</p>
              <div class="flex flex-wrap gap-1.5">
                ${activeTech.relatedProjects
                  .map((proj) => `<span class="tech-badge-item text-xs py-1 px-2.5">${esc(proj)}</span>`)
                  .join("")}
              </div>
            </div>
          </aside>
        </div>

        <!-- Interactive Technology Cards Grid -->
        ${cardsHtml ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">${cardsHtml}</div>` : ""}
      </div>
    `;

    mount.querySelectorAll("[data-tech-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextCat = btn.getAttribute("data-tech-cat") || "All";
        if (nextCat === state.techCategory) return;
        state.techCategory = nextCat;
        renderTechVisualization();
      });
    });

    const techSearchEl = document.getElementById("dash-tech-search");
    if (techSearchEl) {
      techSearchEl.addEventListener("input", () => {
        const cursorPos = techSearchEl.selectionStart;
        state.techSearch = techSearchEl.value.trimStart();
        renderTechVisualization();
        const refreshed = document.getElementById("dash-tech-search");
        if (refreshed) {
          refreshed.focus();
          if (typeof cursorPos === "number") {
            refreshed.setSelectionRange(cursorPos, cursorPos);
          }
        }
      });
    }

    const resetBtn = document.getElementById("dash-tech-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.techCategory = "All";
        state.techSearch = "";
        renderTechVisualization();
      });
    }

    mount.querySelectorAll("[data-tech-select]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextId = btn.getAttribute("data-tech-select");
        if (!nextId || nextId === state.selectedTechId) return;
        state.selectedTechId = nextId;
        renderTechVisualization();
      });
    });

    refreshIcons();
  }

  function renderFeaturedProjects() {
    const mount = document.getElementById("dash-projects-mount");
    if (!mount) return;

    const sourceProjects =
      window.PortfolioProjects && Array.isArray(window.PortfolioProjects.projectsData)
        ? window.PortfolioProjects.projectsData
        : [];

    const enriched = sourceProjects.map((project) => ({
      ...project,
      status: DASHBOARD_CONFIG.projectStatuses[project.id] || "Completed"
    }));

    const filtered = enriched.filter((p) => {
      if (state.projectFilter === "All") return true;
      return p.status === state.projectFilter;
    });

    const filters = ["All", "Completed", "Active"];
    const filterTabsHtml = filters
      .map((f) => {
        const isActive = state.projectFilter === f;
        return `
          <button
            type="button"
            role="tab"
            aria-selected="${isActive ? "true" : "false"}"
            data-dash-proj-filter="${esc(f)}"
            class="skill-tab-btn ${isActive ? "is-active" : ""}"
          >${esc(f)}</button>
        `;
      })
      .join("");

    let gridHtml = "";
    if (filtered.length === 0) {
      gridHtml = `
        <div class="dash-panel p-8 text-center space-y-3 col-span-full">
          <i data-lucide="folder-open" class="w-8 h-8 text-indigo-400 mx-auto"></i>
          <p class="text-sm text-[var(--muted)]">No projects currently match the "${esc(state.projectFilter)}" status filter.</p>
          <button type="button" id="dash-proj-reset" class="secondary-button mx-auto">Show All Projects</button>
        </div>
      `;
    } else {
      gridHtml = filtered
        .map((proj) => {
          const tone = proj.status === "Active" ? "cyan" : "emerald";
          const statusIcon = proj.status === "Active" ? "sparkles" : "check-circle-2";
          const techChips = (proj.technologies || [])
            .slice(0, 4)
            .map((t) => `<span class="tech-badge-item text-[11px] py-1 px-2">${esc(t)}</span>`)
            .join("");

          const liveAction = proj.liveUrl
            ? `<a href="${esc(proj.liveUrl)}" target="_blank" rel="noopener noreferrer" class="outline-button text-xs py-2 px-3 min-h-[38px]">
                 <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                 <span>Live Demo</span>
               </a>`
            : `<button type="button" class="outline-button button-disabled text-xs py-2 px-3 min-h-[38px]" disabled title="Live demo URL can be added in js/projects.js">
                 <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                 <span>Demo Pending</span>
               </button>`;

          const githubAction = proj.githubUrl
            ? `<a href="${esc(proj.githubUrl)}" target="_blank" rel="noopener noreferrer" class="outline-button text-xs py-2 px-3 min-h-[38px]">
                 <i data-lucide="github" class="w-3.5 h-3.5"></i>
                 <span>GitHub</span>
               </a>`
            : `<button type="button" class="outline-button button-disabled text-xs py-2 px-3 min-h-[38px]" disabled title="GitHub repository URL can be added in js/projects.js">
                 <i data-lucide="github" class="w-3.5 h-3.5"></i>
                 <span>Repo Pending</span>
               </button>`;

          return `
            <article class="dash-panel project-card overflow-hidden flex flex-col justify-between">
              <div>
                <div class="project-media-box">
                  <img
                    src="${esc(proj.image)}"
                    alt="${esc(proj.title)} project preview"
                    loading="lazy"
                    onerror="this.src='assets/images/profile-placeholder.svg'"
                  >
                  <div class="project-media-gradient"></div>
                  <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span class="dash-status-chip bg-[var(--background)]/90 backdrop-blur" data-tone="${esc(tone)}">
                      <i data-lucide="${esc(statusIcon)}" class="w-3 h-3"></i>
                      <span>${esc(proj.status)}</span>
                    </span>
                    <span class="text-xs font-mono-tech text-slate-200 bg-slate-950/70 px-2 py-1 rounded tabular-nums">${esc(proj.year)}</span>
                  </div>
                </div>

                <div class="p-5 space-y-3">
                  <div class="space-y-1">
                    <p class="text-xs font-medium text-indigo-400">${esc(proj.category)}</p>
                    <h3 class="text-lg font-bold text-[var(--text)]">${esc(proj.title)}</h3>
                  </div>
                  <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${esc(proj.description)}</p>
                  <div class="flex flex-wrap gap-1.5 pt-1">${techChips}</div>
                </div>
              </div>

              <div class="px-5 pb-5 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
                <a href="project-details.html?id=${encodeURIComponent(proj.id)}" class="primary-button text-xs py-2 px-3.5 min-h-[38px]">
                  <span>Case Study</span>
                  <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                </a>
                <div class="flex flex-wrap items-center gap-2">
                  ${liveAction}
                  ${githubAction}
                </div>
              </div>
            </article>
          `;
        })
        .join("");
    }

    mount.innerHTML = `
      <div class="space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="skill-tabs-bar" role="tablist" aria-label="Filter featured projects by status">
            ${filterTabsHtml}
          </div>
          <a href="projects.html" class="text-xs sm:text-sm font-semibold text-cyan-400 hover:underline inline-flex items-center gap-1.5 whitespace-nowrap">
            <span>Full Projects Archive</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          ${gridHtml}
        </div>
      </div>
    `;

    mount.querySelectorAll("[data-dash-proj-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.getAttribute("data-dash-proj-filter") || "All";
        if (next === state.projectFilter) return;
        state.projectFilter = next;
        renderFeaturedProjects();
      });
    });

    const resetBtn = document.getElementById("dash-proj-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.projectFilter = "All";
        renderFeaturedProjects();
      });
    }

    refreshIcons();
  }

  function renderTimeline() {
    const mount = document.getElementById("dash-timeline-mount");
    if (!mount) return;

    mount.innerHTML = `
      <div class="dash-timeline">
        ${DASHBOARD_CONFIG.timeline
          .map(
            (item) => `
              <article class="dash-timeline-item">
                <div class="dash-timeline-node" aria-hidden="true">
                  <i data-lucide="${esc(item.icon)}" class="w-3.5 h-3.5"></i>
                </div>
                <div class="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-1.5">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <h3 class="text-sm sm:text-base font-bold text-[var(--text)]">${esc(item.title)}</h3>
                    <span class="text-xs font-mono-tech text-cyan-400 tabular-nums">${esc(item.period)}</span>
                  </div>
                  <p class="text-xs font-semibold text-indigo-400">${esc(item.subtitle)}</p>
                  <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${esc(item.description)}</p>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    `;

    refreshIcons();
  }

  function renderAvailabilityCard() {
    const mount = document.getElementById("dash-availability-mount");
    if (!mount) return;

    const configuredDefault = (window.portfolioConfig && window.portfolioConfig.availabilityStatus) || "freelance";
    const activeOpt = getAvailabilityOption(state.availabilityKey);
    const isPreviewingCustom = state.availabilityKey !== configuredDefault;

    mount.innerHTML = `
      <div class="space-y-5">
        <div class="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--background)] space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="dash-status-chip" data-tone="${esc(activeOpt.tone)}">
              <i data-lucide="${esc(activeOpt.icon)}" class="w-3.5 h-3.5"></i>
              <span>${esc(activeOpt.label)}</span>
            </span>
            <span class="text-xs font-mono-tech text-[var(--muted)]">${esc(activeOpt.responseTime)}</span>
          </div>
          <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${esc(activeOpt.summary)}</p>
          ${
            isPreviewingCustom
              ? `<div class="pt-1 flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                   <span>Previewing interactive status</span>
                   <button type="button" id="dash-availability-reset" class="text-cyan-400 font-semibold hover:underline">Reset to default</button>
                 </div>`
              : `<p class="text-[11px] text-[var(--muted)]">Configured via <code class="font-mono-tech">portfolioConfig.availabilityStatus</code></p>`
          }
        </div>

        <div class="space-y-2" role="radiogroup" aria-label="Availability status modes">
          ${DASHBOARD_CONFIG.availabilityOptions
            .map((opt) => {
              const isActive = opt.key === state.availabilityKey;
              const optIconClass = TONE_TEXT_CLASS[opt.tone] || "text-indigo-400";
              return `
                <button
                  type="button"
                  role="radio"
                  aria-checked="${isActive ? "true" : "false"}"
                  data-availability-key="${esc(opt.key)}"
                  class="dash-availability-btn ${isActive ? "is-active" : ""}"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--text)]">
                      <i data-lucide="${esc(opt.icon)}" class="w-4 h-4 ${optIconClass} shrink-0"></i>
                      <span>${esc(opt.label)}</span>
                    </span>
                    <span class="text-[11px] font-mono-tech text-[var(--muted)]">${isActive ? "Active" : "Select"}</span>
                  </div>
                </button>
              `;
            })
            .join("")}
        </div>

        <div class="pt-2 flex flex-col sm:flex-row gap-2.5">
          <a href="contact.html" class="primary-button w-full justify-center">
            <i data-lucide="send" class="w-4 h-4"></i>
            <span>Start a Conversation</span>
          </a>
          <a href="resume.html" class="secondary-button w-full justify-center">
            <i data-lucide="file-text" class="w-4 h-4"></i>
            <span>View Resume</span>
          </a>
        </div>
      </div>
    `;

    mount.querySelectorAll("[data-availability-key]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextKey = btn.getAttribute("data-availability-key");
        if (!nextKey || nextKey === state.availabilityKey) return;
        state.availabilityKey = nextKey;
        renderOverview();
        renderCurrentActivity();
        renderAvailabilityCard();
        refreshIcons();
      });
    });

    const resetBtn = document.getElementById("dash-availability-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.availabilityKey = configuredDefault;
        renderOverview();
        renderCurrentActivity();
        renderAvailabilityCard();
        refreshIcons();
      });
    }

    refreshIcons();
  }

  /* ========================================================================
     Initialization
     ======================================================================== */
  function init() {
    const root = document.getElementById("dashboard-root");
    if (!root || root.dataset.dashboardInit === "true") return;
    root.dataset.dashboardInit = "true";

    const siteCfg = window.portfolioConfig || {};
    state.availabilityKey = siteCfg.availabilityStatus || "freelance";
    state.contribYear = DASHBOARD_CONFIG.contributionDemo.defaultYear;
    state.contribMonth = DASHBOARD_CONFIG.contributionDemo.cutoffMonth;
    state.contribView = window.innerWidth < 640 ? "month" : "year";

    renderOverview();
    renderStats();
    renderCurrentActivity();
    renderContributionGraph();
    renderTechVisualization();
    renderFeaturedProjects();
    renderTimeline();
    renderAvailabilityCard();
    refreshIcons();

    if (window.PortfolioAnimations) {
      window.PortfolioAnimations.initStatCounters();
      window.PortfolioAnimations.initScrollReveal();
    }
  }

  return {
    config: DASHBOARD_CONFIG,
    init,
    buildSampleYearData
  };
})();

window.PortfolioDashboard = PortfolioDashboard;
