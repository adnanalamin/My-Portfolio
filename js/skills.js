/**
 * AL AMIN Portfolio — Skills Matrix & Interactive Categories (Phase 1 + Phase 4)
 * Renders circular domain indicators, interactive category filters, skill cards,
 * animated progress bars, and technology badges without fake percentage claims.
 */

const PortfolioSkills = (() => {
  const categories = [
    { id: "all", label: "All Skills" },
    { id: "Frontend", label: "Frontend" },
    { id: "Backend", label: "Backend" },
    { id: "Database", label: "Database" },
    { id: "Tools", label: "Tools" },
    { id: "Design", label: "Design" },
    { id: "Other", label: "Other" }
  ];

  const circularHighlights = [
    {
      title: "Frontend Engineering",
      tier: "Core Stack",
      focus: "React, Next.js, Tailwind CSS, semantic HTML5 & accessible DOM systems.",
      ratio: 0.92,
      stroke: "#6366F1",
      icon: "layout"
    },
    {
      title: "Backend & APIs",
      tier: "Production",
      focus: "Node.js, Express, RESTful architecture & token-based authentication.",
      ratio: 0.88,
      stroke: "#06B6D4",
      icon: "server"
    },
    {
      title: "Data Modeling",
      tier: "Production",
      focus: "MongoDB document schemas, Mongoose ODM & PostgreSQL relational design.",
      ratio: 0.85,
      stroke: "#8B5CF6",
      icon: "database"
    },
    {
      title: "UI Craft & Tooling",
      tier: "Daily Workflow",
      focus: "Figma design systems, Git workflows, performance & responsive testing.",
      ratio: 0.9,
      stroke: "#EC4899",
      icon: "sparkles"
    }
  ];

  const skillsCatalog = [
    // Frontend
    {
      name: "HTML5",
      category: "Frontend",
      level: "Core Stack",
      scale: 0.95,
      icon: "code",
      summary: "Semantic landmarks, accessible forms, and SEO-friendly document structure."
    },
    {
      name: "CSS3",
      category: "Frontend",
      level: "Core Stack",
      scale: 0.93,
      icon: "palette",
      summary: "Grid, Flexbox, custom properties, fluid clamp() typography, and 60fps transitions."
    },
    {
      name: "Tailwind",
      category: "Frontend",
      level: "Core Stack",
      scale: 0.94,
      icon: "wind",
      summary: "Rapid utility-first responsive layouts and scalable design token integration."
    },
    {
      name: "JavaScript",
      category: "Frontend",
      level: "Core Stack",
      scale: 0.92,
      icon: "braces",
      summary: "Modern ES2024+, async flows, modular architecture, and DOM engineering."
    },
    {
      name: "React",
      category: "Frontend",
      level: "Core Stack",
      scale: 0.91,
      icon: "atom",
      summary: "Component-driven interfaces, custom hooks, state composition, and SPAs."
    },
    {
      name: "Redux",
      category: "Frontend",
      level: "Proficient",
      scale: 0.82,
      icon: "git-merge",
      summary: "Predictable global state management and RTK async data workflows."
    },
    {
      name: "Next.js",
      category: "Frontend",
      level: "Production",
      scale: 0.86,
      icon: "layers",
      summary: "App Router, server-rendered routes, metadata optimization, and full-stack React."
    },

    // Backend
    {
      name: "Node.js",
      category: "Backend",
      level: "Production",
      scale: 0.89,
      icon: "server",
      summary: "Event-driven backend services, middleware pipelines, and scalable runtime architecture."
    },
    {
      name: "Express",
      category: "Backend",
      level: "Production",
      scale: 0.9,
      icon: "cpu",
      summary: "Modular routing, validation middleware, error boundaries, and API controllers."
    },
    {
      name: "REST API",
      category: "Backend",
      level: "Core Stack",
      scale: 0.91,
      icon: "webhook",
      summary: "Resource-oriented endpoints, clean status contracts, pagination, and filtering."
    },
    {
      name: "Authentication",
      category: "Backend",
      level: "Production",
      scale: 0.86,
      icon: "shield-check",
      summary: "JWT sessions, HTTP-only cookies, OAuth flows, and role-based access control."
    },

    // Database
    {
      name: "MongoDB",
      category: "Database",
      level: "Production",
      scale: 0.88,
      icon: "database",
      summary: "Document schema design, aggregation pipelines, and indexed query tuning."
    },
    {
      name: "Mongoose",
      category: "Database",
      level: "Production",
      scale: 0.87,
      icon: "boxes",
      summary: "Typed schema validation, hooks, population, and clean model abstractions."
    },
    {
      name: "PostgreSQL",
      category: "Database",
      level: "Proficient",
      scale: 0.81,
      icon: "table-2",
      summary: "Relational modeling, joins, constraints, and normalized transactional data."
    },

    // Tools
    {
      name: "Git",
      category: "Tools",
      level: "Daily Workflow",
      scale: 0.92,
      icon: "git-branch",
      summary: "Clean branching strategies, rebasing, and disciplined commit history."
    },
    {
      name: "GitHub",
      category: "Tools",
      level: "Daily Workflow",
      scale: 0.91,
      icon: "github",
      summary: "Pull request reviews, issue tracking, Actions CI, and repository management."
    },
    {
      name: "VS Code",
      category: "Tools",
      level: "Daily Workflow",
      scale: 0.95,
      icon: "terminal",
      summary: "Custom snippets, debugging profiles, linting workflows, and workspace efficiency."
    },
    {
      name: "Postman",
      category: "Tools",
      level: "Daily Workflow",
      scale: 0.89,
      icon: "send",
      summary: "API endpoint collections, environment variables, and payload verification."
    },
    {
      name: "Figma",
      category: "Tools",
      level: "Production",
      scale: 0.86,
      icon: "figma",
      summary: "Component libraries, auto-layout frames, token handoff, and interface mockups."
    },

    // Design
    {
      name: "UI Architecture",
      category: "Design",
      level: "Production",
      scale: 0.9,
      icon: "pen-tool",
      summary: "Clear visual hierarchy, balanced spacing math, and scannable layouts."
    },
    {
      name: "Design Systems",
      category: "Design",
      level: "Production",
      scale: 0.88,
      icon: "swatch-book",
      summary: "Reusable tokens, dark/light surfaces, typography scales, and state consistency."
    },
    {
      name: "Prototyping",
      category: "Design",
      level: "Proficient",
      scale: 0.84,
      icon: "frame",
      summary: "Interactive user flows and responsive wireframes before writing production code."
    },

    // Other
    {
      name: "SEO",
      category: "Other",
      level: "Production",
      scale: 0.86,
      icon: "search",
      summary: "Semantic headings, Open Graph tags, metadata structure, and crawl clarity."
    },
    {
      name: "Responsive Design",
      category: "Other",
      level: "Core Stack",
      scale: 0.95,
      icon: "smartphone",
      summary: "Mobile-first engineering tested cleanly from 320px viewports to 2560px displays."
    },
    {
      name: "Security",
      category: "Other",
      level: "Production",
      scale: 0.84,
      icon: "lock",
      summary: "Input sanitization, CORS hygiene, protected routes, and safe credential handling."
    },
    {
      name: "Performance",
      category: "Other",
      level: "Production",
      scale: 0.89,
      icon: "gauge",
      summary: "Compositor-only animations, asset optimization, and zero layout thrashing."
    },
    {
      name: "API Integration",
      category: "Other",
      level: "Core Stack",
      scale: 0.91,
      icon: "plug",
      summary: "Third-party SDKs, payment webhooks, OAuth clients, and resilient error handling."
    }
  ];

  const technologyBadges = [
    "HTML5", "CSS3", "Tailwind CSS", "JavaScript ES2024", "TypeScript", "React",
    "Redux", "Next.js", "Node.js", "Express", "REST API", "JWT Auth",
    "MongoDB", "Mongoose", "PostgreSQL", "Git", "GitHub", "VS Code",
    "Postman", "Figma", "SEO", "Responsive Design", "Web Security", "Performance"
  ];

  const state = {
    activeGroup: "all",
    groups: categories
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderCircularHighlights() {
    const mount = document.getElementById("skills-circular-grid");
    if (!mount) return;

    mount.innerHTML = circularHighlights
      .map((item, idx) => {
        const delayClass = idx === 1 ? "delay-100" : idx === 2 ? "delay-200" : idx === 3 ? "delay-300" : "";
        return `
          <article class="glass-card hover-lift p-5 sm:p-6 flex items-center gap-4 reveal ${delayClass}">
            <div class="circular-gauge" aria-hidden="true">
              <svg viewBox="0 0 80 80">
                <circle class="circular-ring-track" cx="40" cy="40" r="32"></circle>
                <circle
                  class="circular-ring-fill"
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="${escapeHtml(item.stroke)}"
                  data-progress="${item.ratio}"
                ></circle>
              </svg>
              <div class="circular-gauge-center">
                <i data-lucide="${escapeHtml(item.icon)}" class="w-5 h-5"></i>
              </div>
            </div>
            <div class="min-w-0 space-y-1">
              <p class="text-xs font-mono-tech text-indigo-400">${escapeHtml(item.tier)}</p>
              <h2 class="text-base font-bold text-[var(--text)]">${escapeHtml(item.title)}</h2>
              <p class="text-xs text-[var(--muted)] leading-relaxed">${escapeHtml(item.focus)}</p>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderCategoryTabs() {
    const mount = document.getElementById("skills-category-tabs");
    if (!mount) return;

    mount.setAttribute("role", "tablist");
    mount.setAttribute("aria-label", "Filter skills by category");

    mount.innerHTML = categories
      .map((cat) => {
        const isActive = state.activeGroup === cat.id;
        return `
          <button
            type="button"
            role="tab"
            aria-selected="${isActive ? "true" : "false"}"
            data-skill-category="${escapeHtml(cat.id)}"
            class="skill-tab-btn ${isActive ? "is-active" : ""}"
          >
            ${escapeHtml(cat.label)}
          </button>
        `;
      })
      .join("");

    mount.querySelectorAll("[data-skill-category]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextCat = btn.getAttribute("data-skill-category") || "all";
        if (nextCat === state.activeGroup) return;
        state.activeGroup = nextCat;
        renderCategoryTabs();
        renderSkillsGrid(true);
      });
    });
  }

  function renderSkillsGrid(animateCards = false) {
    const grid = document.getElementById("skills-grid");
    const countLabel = document.getElementById("skills-active-count");
    if (!grid) return;

    const filtered =
      state.activeGroup === "all"
        ? skillsCatalog
        : skillsCatalog.filter((item) => item.category === state.activeGroup);

    if (countLabel) {
      countLabel.textContent = `${filtered.length} ${filtered.length === 1 ? "skill" : "skills"}`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="glass-card p-8 text-center text-sm text-[var(--muted)] col-span-full">
          No skills found in this category.
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered
      .map((skill, idx) => {
        const cardDelay = Math.min(idx * 25, 220);
        const enterClass = animateCards ? "skill-card-enter" : "reveal";
        return `
          <article
            class="glass-card hover-lift p-5 sm:p-6 flex flex-col justify-between gap-4 ${enterClass}"
            style="--card-delay: ${cardDelay}ms;"
          >
            <div class="space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div class="w-10 h-10 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] flex items-center justify-center text-indigo-400 shrink-0">
                  <i data-lucide="${escapeHtml(skill.icon)}" class="w-5 h-5"></i>
                </div>
                <span class="text-xs font-mono-tech text-[var(--muted)]">${escapeHtml(skill.category)}</span>
              </div>

              <div class="space-y-1.5">
                <h3 class="text-lg font-bold text-[var(--text)]">${escapeHtml(skill.name)}</h3>
                <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escapeHtml(skill.summary)}</p>
              </div>
            </div>

            <div class="space-y-2 pt-2 border-t border-[var(--border)]">
              <div class="flex items-center justify-between gap-2 text-xs">
                <span class="text-[var(--muted)]">Focus Tier</span>
                <span class="font-semibold text-cyan-400">${escapeHtml(skill.level)}</span>
              </div>
              <div class="skill-progress-track" aria-hidden="true">
                <div class="skill-progress-fill" data-progress="${skill.scale}"></div>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }

    if (window.PortfolioAnimations) {
      if (animateCards) {
        grid.querySelectorAll(".skill-progress-fill").forEach((bar) => {
          const ratio = Number(bar.getAttribute("data-progress") || "0.8");
          bar.style.setProperty("--target-scale", String(ratio));
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              bar.classList.add("is-filled");
            });
          });
        });
      } else {
        window.PortfolioAnimations.initScrollReveal();
        window.PortfolioAnimations.initProgressIndicators(grid);
      }
    }
  }

  function renderTechBadges() {
    const mount = document.getElementById("skills-tech-badges");
    if (!mount) return;

    mount.innerHTML = technologyBadges
      .map(
        (tech) => `
          <span class="tech-badge-item">
            <i data-lucide="check" class="w-3.5 h-3.5 text-cyan-400"></i>
            <span>${escapeHtml(tech)}</span>
          </span>
        `
      )
      .join("");
  }

  function init() {
    const mount = document.getElementById("skills-root");
    if (!mount) return;
    mount.dataset.moduleReady = "true";

    renderCircularHighlights();
    renderCategoryTabs();
    renderSkillsGrid(false);
    renderTechBadges();
  }

  return {
    init,
    state,
    categories,
    skillsCatalog
  };
})();

window.PortfolioSkills = PortfolioSkills;
