/**
 * AL AMIN Portfolio — Phase 26: Interactive Developer Journey
 * Configurable 10-stage chronological developer story grounded in real portfolio data.
 * Features: scroll reveal + scroll-spy navigation, year & category filters, expand/collapse details.
 */

(() => {
  const DEFAULT_JOURNEY_DATA = [
    {
      id: "beginning",
      order: "01",
      category: "Beginning",
      year: "2021",
      date: "2021",
      icon: "compass",
      title: "Engineering Foundations & Curiosity",
      description:
        "Began Computer Science & Engineering studies and wrote first structured HTML, CSS, and programming logic exercises to understand how software works beneath the browser.",
      details: [
        "Built foundational fluency in problem decomposition, algorithms, data structures, and relational concepts through B.Sc. CSE coursework.",
        "Practiced translating static visual layouts into semantic document structures before introducing frameworks."
      ],
      skills: ["HTML5", "CSS3", "Algorithms", "Programming Logic"],
      project: {
        title: "Explore Foundation Resume",
        href: "resume.html"
      },
      image: {
        src: "assets/images/blog/programming-patterns.svg",
        alt: "Structured code patterns and programming foundations illustration"
      }
    },
    {
      id: "learning",
      order: "02",
      category: "Learning",
      year: "2022",
      date: "2022",
      icon: "book-open",
      title: "Deep Dive into JavaScript & Responsive CSS",
      description:
        "Focused on modern ES2024 JavaScript, CSS Grid, Flexbox, asynchronous fetch patterns, and UI systems built cleanly from first principles.",
      details: [
        "Practiced DOM manipulation, keyboard accessibility focus management, form validation, and multi-breakpoint responsiveness (320px–2560px).",
        "Established disciplined coding habits around clean component naming, debugging, and modular scripts."
      ],
      skills: ["JavaScript", "CSS Grid", "Flexbox", "Responsive Design"],
      project: {
        title: "Interactive Code Playground",
        href: "playground.html"
      },
      image: {
        src: "assets/images/blog/js-async.svg",
        alt: "Asynchronous JavaScript execution flow diagram"
      }
    },
    {
      id: "first-projects",
      order: "03",
      category: "First Projects",
      year: "2023",
      date: "2023",
      icon: "layout",
      title: "Shipping First Real Interactive Builds",
      description:
        "Moved from tutorials into shipping complete multi-page portfolio interfaces, responsive showcases, and structured static systems designed for real visitors.",
      details: [
        "Built reusable navigation headers, light/dark theme switching tokens, metadata templates, and accessible modals without bloat.",
        "Measured responsiveness and page load performance directly in browser DevTools across phone and desktop breakpoints."
      ],
      skills: ["HTML5", "CSS3", "Tailwind CSS", "SEO", "UI Architecture"],
      project: {
        id: "portfolio-system",
        title: "Portfolio System Case Study",
        href: "project-details.html?id=portfolio-system"
      },
      image: {
        src: "assets/images/projects/portfolio-system.jpg",
        alt: "Portfolio System responsive web interface preview"
      }
    },
    {
      id: "frontend-development",
      order: "04",
      category: "Frontend Development",
      year: "2024",
      date: "2024",
      icon: "layers",
      title: "React Architecture & Design Systems",
      description:
        "Advanced into component-driven React interfaces, Redux Toolkit state flows, Figma-to-code handoffs, and polished interactive UI craftsmanship.",
      details: [
        "Delivered Figma-accurate frontend templates and improved visual clarity, semantic structure, and Core Web Vitals.",
        "Built SLIDEVERSE—an interactive visual presentation studio built cleanly with JavaScript, HTML5, CSS3, React, and Tailwind CSS."
      ],
      skills: ["React", "Redux", "Next.js", "Tailwind CSS", "Figma"],
      project: {
        id: "slideverse",
        title: "SLIDEVERSE Case Study",
        href: "project-details.html?id=slideverse"
      },
      image: {
        src: "assets/images/projects/slideverse.jpg",
        alt: "SLIDEVERSE interactive web presentation studio"
      }
    },
    {
      id: "backend-development",
      order: "05",
      category: "Backend Development",
      year: "2024",
      date: "2024 – 2025",
      icon: "server",
      title: "Node.js, Express & Secure REST APIs",
      description:
        "Expanded into server-side engineering—building versioned Express REST APIs, JWT authentication middleware, role-based access control, and structured validation.",
      details: [
        "Architected backend schemas with MongoDB, Mongoose, and PostgreSQL, verifying API contracts cleanly with Postman collections.",
        "Applied Mongoose schema validation and role-based permissions inside the School Management System portal."
      ],
      skills: ["Node.js", "Express", "REST API", "MongoDB", "Mongoose", "PostgreSQL"],
      project: {
        id: "school-management-system",
        title: "School Management System Case Study",
        href: "project-details.html?id=school-management-system"
      },
      image: {
        src: "assets/images/projects/school-management.jpg",
        alt: "School Management System role-based dashboard"
      }
    },
    {
      id: "fullstack-development",
      order: "06",
      category: "Full-Stack Development",
      year: "2025",
      date: "2025",
      icon: "cpu",
      title: "Unified MERN & SaaS Engineering",
      description:
        "Combined frontend craft and backend services into cohesive full-stack MERN and Next.js commerce platforms built for predictable state and reliable scale.",
      details: [
        "Engineered Nexora (headless storefront with filterable catalog and persistent checkout drawer) and multi-tenant E-commerce SaaS workflows.",
        "Connected client UI components with transactional API endpoints, indexed queries, and clean deployment pipelines."
      ],
      skills: ["MERN Stack", "React", "Next.js", "Node.js", "MongoDB", "PostgreSQL"],
      project: {
        id: "nexora",
        title: "Nexora Commerce Case Study",
        href: "project-details.html?id=nexora"
      },
      image: {
        src: "assets/images/projects/nexora.jpg",
        alt: "Nexora full-stack MERN e-commerce showcase"
      }
    },
    {
      id: "freelancing",
      order: "07",
      category: "Freelancing",
      year: "2025",
      date: "2023 – Present",
      icon: "briefcase",
      title: "Client Delivery & Product Consulting",
      description:
        "Partnered with startup founders and direct clients to deliver custom websites, admin dashboards, redesigns, and conversion-focused e-commerce platforms.",
      details: [
        "Managed end-to-end delivery from requirement scoping and UI planning through responsive QA, SEO structure, and post-launch handover.",
        "Maintained transparent communication focused on practical maintainability and fast load performance."
      ],
      skills: ["Client Scoping", "E-commerce", "Admin Dashboards", "SEO", "UI/UX"],
      project: {
        id: "ecommerce-saas",
        title: "E-commerce SaaS Case Study",
        href: "project-details.html?id=ecommerce-saas"
      },
      image: {
        src: "assets/images/projects/ecommerce-saas.jpg",
        alt: "E-commerce SaaS multi-store dashboard"
      }
    },
    {
      id: "open-source",
      order: "08",
      category: "Open Source",
      year: "2025",
      date: "2024 – Present",
      icon: "git-branch",
      title: "Open Tooling & GitHub Engineering",
      description:
        "Published structured codebases, utility templates, and transparent developer workflows using disciplined Git branching and GitHub repository documentation.",
      details: [
        "Built live GitHub profile inspection integrations and browser-based code experimentation workflows inside this portfolio ecosystem.",
        "Focused on readable Vanilla JS and clean React repository patterns without fragile build dependencies."
      ],
      skills: ["Git", "GitHub", "Documentation", "REST Integration", "Clean Code"],
      project: {
        title: "GitHub Repositories Explorer",
        href: "github.html"
      },
      image: {
        src: "assets/images/blog/web-perf.svg",
        alt: "Web performance and open source tooling illustration"
      }
    },
    {
      id: "current-projects",
      order: "09",
      category: "Current Projects",
      year: "2026",
      date: "2026 – Present",
      icon: "rocket",
      title: "AstraPulse & Interactive Portfolio Tools",
      description:
        "Iterating on the AstraPulse real-time API observability platform while crafting interactive technical utilities—Architect, Scope Estimator, and Skills Knowledge Graph.",
      details: [
        "Engineering time-bucketed telemetry views, multi-workspace access patterns, and accessible browser-first engineering tools.",
        "Refining unified personal brand design systems with complete light/dark/high-contrast theme parity."
      ],
      skills: ["React", "Node.js", "MongoDB", "Tailwind CSS", "Design Systems"],
      project: {
        id: "astrapulse",
        title: "AstraPulse Case Study",
        href: "project-details.html?id=astrapulse"
      },
      image: {
        src: "assets/images/projects/astrapulse.jpg",
        alt: "AstraPulse real-time analytics SaaS workspace"
      }
    },
    {
      id: "future-goals",
      order: "10",
      category: "Future Goals",
      year: "Ongoing",
      date: "Next Chapter",
      icon: "target",
      title: "Distributed Systems & Product Leadership",
      description:
        "Continuously deepening backend scalability, resilient cloud architectures, automated testing rigor, and collaborative full-stack product delivery with international teams.",
      details: [
        "Focusing on server-proxied intelligent workflows, fault-tolerant PostgreSQL/Redis architectures, and zero-friction developer tooling.",
        "Open to long-term product engineering roles and impactful international freelance engagements."
      ],
      skills: ["Cloud Architecture", "PostgreSQL", "TypeScript", "Security", "System Design"],
      project: {
        title: "Start a Project With AL AMIN",
        href: "project-request.html"
      },
      image: {
        src: "assets/images/blog/ai-engineering.jpg",
        alt: "Modern full-stack architecture and cloud systems theme"
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

  function getJourneyEntries() {
    const cfg = (window.portfolioConfig && window.portfolioConfig.developerJourney) || null;
    if (Array.isArray(cfg) && cfg.length > 0) {
      return cfg;
    }
    return DEFAULT_JOURNEY_DATA;
  }

  function filterJourneyEntries(entries, { year = "All", category = "All" } = {}) {
    return (entries || []).filter((item) => {
      const matchYear = year === "All" || item.year === year;
      const matchCategory = category === "All" || item.category === category;
      return matchYear && matchCategory;
    });
  }

  function init() {
    const root = document.getElementById("developer-journey-section");
    if (!root) return;

    const entries = getJourneyEntries();
    const years = ["All", ...Array.from(new Set(entries.map((e) => e.year)))];
    const categories = ["All", ...Array.from(new Set(entries.map((e) => e.category)))];

    let activeYear = "All";
    let activeCategory = "All";
    let activeAnchorId = entries[0] ? entries[0].id : "";
    const expandedIds = new Set([entries[0] ? entries[0].id : ""]);

    const catTabsMount = document.getElementById("jr-category-tabs");
    const yearSelect = document.getElementById("jr-year-select");
    const toggleAllBtn = document.getElementById("jr-toggle-all-btn");
    const resetBtn = document.getElementById("jr-reset-btn");
    const countEl = document.getElementById("jr-count-label");
    const navRailMount = document.getElementById("jr-nav-rail");
    const timelineMount = document.getElementById("jr-timeline-track");

    let revealObserver = null;
    let spyObserver = null;

    function populateYearSelect() {
      if (!yearSelect) return;
      yearSelect.innerHTML = years
        .map(
          (yr) =>
            `<option value="${escHtml(yr)}" ${yr === activeYear ? "selected" : ""}>${
              yr === "All" ? "All Years" : escHtml(yr)
            }</option>`
        )
        .join("");
    }

    function renderCategoryTabs() {
      if (!catTabsMount) return;
      catTabsMount.innerHTML = categories
        .map((cat) => {
          const isActive = activeCategory === cat;
          return `
            <button
              type="button"
              class="jr-filter-btn ${isActive ? "is-active" : ""}"
              data-jr-cat="${escHtml(cat)}"
              aria-pressed="${isActive ? "true" : "false"}"
            >
              ${cat === "All" ? "All Stages" : escHtml(cat)}
            </button>
          `;
        })
        .join("");

      catTabsMount.querySelectorAll("[data-jr-cat]").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeCategory = btn.getAttribute("data-jr-cat") || "All";
          renderCategoryTabs();
          renderTimelineAndNav();
        });
      });
    }

    function renderNavRail(filtered) {
      if (!navRailMount) return;
      if (filtered.length === 0) {
        navRailMount.innerHTML = `<p class="text-xs text-[var(--muted)] p-2">No stages match active filters.</p>`;
        return;
      }

      navRailMount.innerHTML = `
        <p class="text-xs font-mono-tech font-bold text-cyan-400 px-2 pb-1">Journey Chapters</p>
        ${filtered
          .map((item) => {
            const isActive = activeAnchorId === item.id;
            return `
              <button
                type="button"
                class="jr-nav-link ${isActive ? "is-active" : ""}"
                data-jr-jump="${escHtml(item.id)}"
              >
                <span class="truncate">${escHtml(item.order)}. ${escHtml(item.category)}</span>
                <span class="font-mono-tech text-[11px] text-[var(--muted)] tabular-nums shrink-0">${escHtml(item.year)}</span>
              </button>
            `;
          })
          .join("")}
      `;

      navRailMount.querySelectorAll("[data-jr-jump]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const targetId = btn.getAttribute("data-jr-jump");
          if (!targetId) return;
          activeAnchorId = targetId;
          expandedIds.add(targetId);
          renderNavRail(filtered);
          syncExpandedCard(targetId);
          const targetEl = document.getElementById(`jr-entry-${targetId}`);
          if (targetEl) {
            targetEl.classList.add("is-in-view");
            targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
      });
    }

    function syncExpandedCard(id) {
      const btn = document.querySelector(`[data-jr-expand="${id}"]`);
      const panel = document.getElementById(`jr-details-${id}`);
      const isOpen = expandedIds.has(id);
      if (btn) {
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        btn.innerHTML = isOpen
          ? `<i data-lucide="chevron-up" class="w-4 h-4"></i><span>Hide Details</span>`
          : `<i data-lucide="chevron-down" class="w-4 h-4"></i><span>Expand Details</span>`;
      }
      if (panel) {
        panel.classList.toggle("hidden", !isOpen);
      }
      updateToggleAllButtonLabel();
      refreshIcons();
    }

    function updateToggleAllButtonLabel() {
      if (!toggleAllBtn) return;
      const filtered = filterJourneyEntries(entries, { year: activeYear, category: activeCategory });
      const allOpen = filtered.length > 0 && filtered.every((item) => expandedIds.has(item.id));
      toggleAllBtn.innerHTML = allOpen
        ? `<i data-lucide="chevrons-up" class="w-4 h-4"></i><span>Collapse All</span>`
        : `<i data-lucide="chevrons-down" class="w-4 h-4"></i><span>Expand All</span>`;
    }

    function bindObservers(filtered) {
      if (revealObserver) revealObserver.disconnect();
      if (spyObserver) spyObserver.disconnect();

      const cards = timelineMount ? timelineMount.querySelectorAll(".jr-entry") : [];
      if (!cards.length) return;

      if (typeof IntersectionObserver === "undefined") {
        cards.forEach((c) => c.classList.add("is-in-view"));
        return;
      }

      revealObserver = new IntersectionObserver(
        (list) => {
          list.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in-view");
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
      );

      spyObserver = new IntersectionObserver(
        (list) => {
          const visible = list.find((e) => e.isIntersecting);
          if (visible) {
            const id = visible.target.getAttribute("data-jr-id");
            if (id && id !== activeAnchorId) {
              activeAnchorId = id;
              renderNavRail(filtered);
            }
          }
        },
        { threshold: 0.45 }
      );

      cards.forEach((card, idx) => {
        if (idx < 2) card.classList.add("is-in-view");
        revealObserver.observe(card);
        spyObserver.observe(card);
      });
    }

    function renderTimelineAndNav() {
      if (!timelineMount) return;
      const filtered = filterJourneyEntries(entries, { year: activeYear, category: activeCategory });

      if (countEl) {
        countEl.textContent = `${filtered.length} ${filtered.length === 1 ? "stage" : "stages"}`;
      }

      if (filtered.length && !filtered.some((e) => e.id === activeAnchorId)) {
        activeAnchorId = filtered[0].id;
      }

      renderNavRail(filtered);
      updateToggleAllButtonLabel();

      if (filtered.length === 0) {
        timelineMount.innerHTML = `
          <div class="glass-card p-8 text-center space-y-4">
            <i data-lucide="compass" class="w-8 h-8 text-cyan-400 mx-auto"></i>
            <p class="text-sm text-[var(--muted)]">No journey stages match the selected year and category.</p>
            <button type="button" id="jr-empty-reset" class="secondary-button mx-auto text-xs sm:text-sm">Reset Filters</button>
          </div>
        `;
        const emptyReset = document.getElementById("jr-empty-reset");
        if (emptyReset) {
          emptyReset.addEventListener("click", () => {
            activeYear = "All";
            activeCategory = "All";
            populateYearSelect();
            renderCategoryTabs();
            renderTimelineAndNav();
          });
        }
        refreshIcons();
        return;
      }

      timelineMount.innerHTML = filtered
        .map((item) => {
          const isOpen = expandedIds.has(item.id);
          const skillsList = (item.skills || [])
            .map((sk) => `<span class="tech-badge-item text-xs py-1 px-2.5">${escHtml(sk)}</span>`)
            .join("");

          const detailBullets = (item.details || [])
            .map(
              (d) => `
              <li class="flex items-start gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5"></i>
                <span>${escHtml(d)}</span>
              </li>
            `
            )
            .join("");

          return `
            <article id="jr-entry-${escHtml(item.id)}" data-jr-id="${escHtml(item.id)}" class="jr-entry">
              <div class="jr-node-dot" aria-hidden="true">
                <i data-lucide="${escHtml(item.icon || "compass")}" class="w-4 h-4"></i>
              </div>

              <div class="jr-card">
                <div class="jr-card-media">
                  <img
                    src="${escHtml(item.image.src)}"
                    alt="${escHtml(item.image.alt)}"
                    loading="lazy"
                    onerror="this.src='assets/images/profile-placeholder.svg'"
                  >
                </div>

                <div class="p-5 sm:p-6 space-y-4">
                  <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span class="font-semibold text-cyan-400">${escHtml(item.order)} · ${escHtml(item.category)}</span>
                    <span class="font-mono-tech text-[var(--muted)] tabular-nums">${escHtml(item.date)}</span>
                  </div>

                  <div class="space-y-1.5">
                    <h3 class="text-lg sm:text-xl font-bold text-[var(--text)]">${escHtml(item.title)}</h3>
                    <p class="text-sm text-[var(--muted)] leading-relaxed">${escHtml(item.description)}</p>
                  </div>

                  <div class="flex flex-wrap gap-1.5">${skillsList}</div>

                  <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
                    <button
                      type="button"
                      class="outline-button text-xs py-2 px-3 min-h-[38px]"
                      data-jr-expand="${escHtml(item.id)}"
                      aria-expanded="${isOpen ? "true" : "false"}"
                    >
                      <i data-lucide="${isOpen ? "chevron-up" : "chevron-down"}" class="w-4 h-4"></i>
                      <span>${isOpen ? "Hide Details" : "Expand Details"}</span>
                    </button>

                    ${
                      item.project && item.project.href
                        ? `
                          <a href="${escHtml(item.project.href)}" class="text-xs sm:text-sm font-semibold text-cyan-400 hover:underline inline-flex items-center gap-1.5">
                            <span>${escHtml(item.project.title)}</span>
                            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                          </a>
                        `
                        : ""
                    }
                  </div>

                  <div id="jr-details-${escHtml(item.id)}" class="jr-details-panel ${isOpen ? "" : "hidden"}">
                    <p class="text-xs font-semibold text-[var(--text)]">Engineering Highlights &amp; Takeaways</p>
                    <ul class="space-y-2 list-none p-0 m-0">${detailBullets}</ul>
                  </div>
                </div>
              </div>
            </article>
          `;
        })
        .join("");

      timelineMount.querySelectorAll("[data-jr-expand]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-jr-expand");
          if (!id) return;
          if (expandedIds.has(id)) {
            expandedIds.delete(id);
          } else {
            expandedIds.add(id);
          }
          syncExpandedCard(id);
        });
      });

      refreshIcons();
      bindObservers(filtered);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", () => {
        activeYear = yearSelect.value || "All";
        renderTimelineAndNav();
      });
    }

    if (toggleAllBtn) {
      toggleAllBtn.addEventListener("click", () => {
        const filtered = filterJourneyEntries(entries, { year: activeYear, category: activeCategory });
        const allOpen = filtered.length > 0 && filtered.every((item) => expandedIds.has(item.id));
        if (allOpen) {
          filtered.forEach((item) => expandedIds.delete(item.id));
        } else {
          filtered.forEach((item) => expandedIds.add(item.id));
        }
        renderTimelineAndNav();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        activeYear = "All";
        activeCategory = "All";
        populateYearSelect();
        renderCategoryTabs();
        renderTimelineAndNav();
      });
    }

    populateYearSelect();
    renderCategoryTabs();
    renderTimelineAndNav();
  }

  window.PortfolioJourney = {
    init,
    DEFAULT_JOURNEY_DATA,
    getJourneyEntries,
    filterJourneyEntries
  };
})();
