/**
 * AL AMIN Portfolio — Phase 37: Recruiter-Focused Search System (recruiter-search.html)
 * Fast, scannable multi-entity search across centralized Skills, Projects, Experience,
 * Certificates, Technologies, Case Studies, and Blog Articles with mobile filter drawer.
 * STRICT RULE: Use only real/configured portfolio data. Zero fabricated experience or scores.
 */

(() => {
  const QUICK_QUERIES = [
    { id: "react-node", label: "React & Node.js", tech: "React", query: "" },
    { id: "mern-saas", label: "MERN SaaS", tech: "MongoDB", query: "SaaS" },
    { id: "rest-api", label: "REST API & JWT", tech: "REST API", query: "" },
    { id: "tailwind-ui", label: "Tailwind & UI Systems", tech: "Tailwind", query: "" },
    { id: "postgresql", label: "PostgreSQL", tech: "PostgreSQL", query: "" }
  ];

  // Grounded experience & certificates synchronized with experience.html, certificates.html, and js/main.js
  const VERIFIED_EXPERIENCE = [
    {
      id: "exp-mern-studio",
      category: "Work Experience",
      date: "2025 – Present",
      title: "Full-Stack MERN Developer",
      organization: "Independent Product Studio",
      availability: ["open-freelance", "fullstack-roles", "immediate-remote"],
      description:
        "Architecting and shipping full-stack SaaS analytics portals, headless commerce engines, and RESTful APIs with React, Next.js, Node.js, Express, and MongoDB.",
      technologies: ["React", "Next.js", "Node.js", "Express", "MongoDB", "Tailwind CSS", "REST API", "JWT Auth"],
      href: "experience.html"
    },
    {
      id: "exp-fe-engineer",
      category: "Work Experience",
      date: "2024 – 2025",
      title: "Frontend & UI Engineer",
      organization: "Digital Web Solutions",
      availability: ["open-freelance", "fullstack-roles", "immediate-remote"],
      description:
        "Built reusable component libraries, converted Figma design systems into accessible production UI, and improved responsive layout stability across 320px–2560px.",
      technologies: ["HTML5", "CSS3", "JavaScript", "React", "Figma", "Tailwind CSS", "Responsive Design"],
      href: "experience.html"
    },
    {
      id: "exp-freelance",
      category: "Freelance",
      date: "2023 – Present",
      title: "Freelance Web Developer & UI Designer",
      organization: "Fiverr, Upwork & Direct Clients",
      availability: ["open-freelance", "immediate-remote"],
      description:
        "Partnered with startup founders and clients to deliver custom websites, e-commerce storefronts, admin dashboards, and SEO-friendly responsive redesigns.",
      technologies: ["MERN Stack", "React", "Node.js", "MongoDB", "E-commerce", "REST API", "SEO"],
      href: "experience.html"
    },
    {
      id: "exp-education",
      category: "Education",
      date: "2021 – 2025",
      title: "B.Sc. in Computer Science & Engineering",
      organization: "University Studies · Bangladesh",
      availability: ["fullstack-roles", "immediate-remote", "open-freelance"],
      description:
        "Focused on software engineering principles, algorithms, data structures, relational/non-relational database systems (DBMS), and web architecture.",
      technologies: ["Algorithms", "Data Structures", "PostgreSQL", "MongoDB", "Software Engineering"],
      href: "experience.html"
    }
  ];

  const VERIFIED_CERTIFICATES = [
    {
      id: "cert-fullstack-mern",
      title: "Full-Stack MERN Web Development",
      category: "Work Experience",
      skillCategory: "Backend",
      issuer: "Engineering Bootcamp & Applied Labs",
      date: "2025",
      credentialId: "MERN-2025-01",
      description:
        "Completed intensive full-stack engineering training covering MongoDB data modeling, Express REST APIs, React UI architecture, and Node.js deployment.",
      technologies: ["MongoDB", "Express", "React", "Node.js", "JWT Auth", "REST API"],
      href: "certificates.html"
    },
    {
      id: "cert-backend-api",
      title: "Node.js API & Database Systems",
      category: "Work Experience",
      skillCategory: "Database",
      issuer: "Backend Architecture Specialization",
      date: "2025",
      credentialId: "BE-2025-04",
      description:
        "Verified mastery of scalable Express services, Mongoose schemas, PostgreSQL relational queries, validation, and API security.",
      technologies: ["Node.js", "Express", "MongoDB", "PostgreSQL", "Postman", "REST API"],
      href: "certificates.html"
    },
    {
      id: "cert-frontend-react",
      title: "React & Frontend Architecture",
      category: "Work Experience",
      skillCategory: "Frontend",
      issuer: "Modern Web Engineering Track",
      date: "2024",
      credentialId: "FE-2024-08",
      description:
        "Focused on modern ES2024 JavaScript, React component composition, Redux state workflows, and clean modular CSS systems.",
      technologies: ["HTML5", "CSS3", "JavaScript", "React", "Redux", "Tailwind"],
      href: "certificates.html"
    },
    {
      id: "cert-responsive-ui",
      title: "Responsive Web & UI Systems",
      category: "Freelance",
      skillCategory: "Design",
      issuer: "Design Systems & Accessibility Program",
      date: "2024",
      credentialId: "UI-2024-11",
      description:
        "Built multi-breakpoint responsive layouts (320px–2560px), accessible keyboard navigation, and dark/light design tokens.",
      technologies: ["Responsive Design", "Figma", "CSS3", "HTML5", "Performance Optimization"],
      href: "certificates.html"
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

  function highlightText(text, query) {
    const raw = String(text == null ? "" : text);
    const q = String(query || "").trim();
    if (!q) return escHtml(raw);
    const lower = raw.toLowerCase();
    const lowerQ = q.toLowerCase();
    const idx = lower.indexOf(lowerQ);
    if (idx === -1) return escHtml(raw);
    return (
      escHtml(raw.slice(0, idx)) +
      `<mark class="rs-mark">${escHtml(raw.slice(idx, idx + q.length))}</mark>` +
      escHtml(raw.slice(idx + q.length))
    );
  }

  function normalizeTechName(t) {
    return String(t || "").trim().toLowerCase();
  }

  function techMatches(list, selectedTech) {
    if (!selectedTech || selectedTech === "All") return true;
    const target = normalizeTechName(selectedTech);
    return (list || []).some((item) => {
      const n = normalizeTechName(item);
      if (n === target) return true;
      if (target === "tailwind" && n.includes("tailwind")) return true;
      if (target === "tailwind css" && n.includes("tailwind")) return true;
      return n.includes(target) || target.includes(n);
    });
  }

  function refreshIcons() {
    if (typeof window.refreshIcons === "function") {
      window.refreshIcons();
    } else if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function gatherCentralizedCorpus() {
    const cfg = window.portfolioConfig || {};
    const brand = cfg.brand || {};
    const avail = brand.availability || {};

    const availabilityConfig = {
      statusKey: avail.status || cfg.availabilityStatus || "freelance",
      label: avail.label || "Open to Freelance & Full-Stack Roles",
      shortLabel: avail.shortLabel || "Open to Freelance",
      note: avail.note || ""
    };

    const skills =
      window.PortfolioSkills && Array.isArray(window.PortfolioSkills.skillsCatalog)
        ? window.PortfolioSkills.skillsCatalog.map((s) => ({
            name: s.name,
            category: s.category || "Other",
            level: s.level || "Core Stack",
            summary: s.summary || "",
            href: `explorer.html?tech=${encodeURIComponent(s.queryName || s.name)}`
          }))
        : [];

    const projects =
      window.PortfolioProjects && Array.isArray(window.PortfolioProjects.projectsData)
        ? window.PortfolioProjects.projectsData.map((p) => ({
            id: p.id || p.slug,
            slug: p.slug || p.id,
            title: p.title,
            category: p.category || "Web Apps",
            projectType: p.projectType || p.category || "Web Application",
            developmentRole: p.developmentRole || "Full-Stack Developer",
            filterCategories: Array.isArray(p.filterCategories) ? p.filterCategories : [p.category],
            year: p.year || "",
            status: p.status || "",
            duration: p.duration || "",
            description: p.description || "",
            longDescription: p.longDescription || p.overview || "",
            architecture: p.architecture || "",
            technologies: Array.isArray(p.technologies) ? p.technologies : [],
            results: Array.isArray(p.results) ? p.results : [],
            hasCaseStudy: Boolean(p.problem || p.architecture || p.systemArchitecture || p.longDescription),
            href: `project-details.html?id=${encodeURIComponent(p.id || p.slug)}`
          }))
        : [];

    const articles =
      window.PortfolioBlog && Array.isArray(window.PortfolioBlog.articlesData)
        ? window.PortfolioBlog.articlesData.map((a) => ({
            id: a.id || a.slug,
            slug: a.slug,
            title: a.title,
            category: a.category || "Engineering",
            date: a.date || "",
            readingTime: a.readingTime || "",
            excerpt: a.excerpt || "",
            technologies: Array.isArray(a.tags) ? a.tags : [],
            href: `blog-details.html?article=${encodeURIComponent(a.slug)}`
          }))
        : [];

    // Aggregate top distinct technologies from skills & projects for filter controls
    const techCounts = new Map();
    skills.forEach((s) => {
      const k = s.name;
      techCounts.set(k, (techCounts.get(k) || 0) + 2);
    });
    projects.forEach((p) => {
      (p.technologies || []).forEach((t) => {
        techCounts.set(t, (techCounts.get(t) || 0) + 1);
      });
    });

    const topTechnologies = Array.from(techCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14)
      .map((entry) => entry[0]);

    const projectTypes = [
      "All",
      ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))
    ];

    const skillCategories = [
      "All",
      ...Array.from(new Set(skills.map((s) => s.category).filter(Boolean)))
    ];

    return {
      availabilityConfig,
      skills,
      projects,
      experience: VERIFIED_EXPERIENCE,
      certificates: VERIFIED_CERTIFICATES,
      articles,
      topTechnologies,
      projectTypes,
      skillCategories
    };
  }

  function init() {
    const root = document.getElementById("recruiter-search-root");
    if (!root) return;

    const corpus = gatherCentralizedCorpus();
    const state = {
      query: "",
      technology: "All",
      experienceCategory: "All",
      projectType: "All",
      skillCategory: "All",
      availability: "All",
      resultScope: "all" // "all" | "projects" | "skills" | "experience" | "case-studies"
    };

    const searchInput = document.getElementById("rs-search-input");
    const clearSearchBtn = document.getElementById("rs-search-clear");
    const quickQueriesEl = document.getElementById("rs-quick-queries");
    const kpiStripEl = document.getElementById("rs-kpi-strip");
    const scopeTabsEl = document.getElementById("rs-scope-tabs");
    const resultsEl = document.getElementById("rs-results-mount");

    const techSelect = document.getElementById("rs-filter-tech");
    const techCloudEl = document.getElementById("rs-tech-cloud");
    const expCatSelect = document.getElementById("rs-filter-exp-cat");
    const projTypeSelect = document.getElementById("rs-filter-proj-type");
    const skillCatSelect = document.getElementById("rs-filter-skill-cat");
    const availSelect = document.getElementById("rs-filter-availability");
    const resetFiltersBtn = document.getElementById("rs-reset-filters");

    const drawerToggleBtn = document.getElementById("rs-drawer-open");
    const drawerCloseBtn = document.getElementById("rs-drawer-close");
    const drawerApplyBtn = document.getElementById("rs-drawer-apply");
    const drawerPanel = document.getElementById("rs-filter-drawer");
    const drawerBackdrop = document.getElementById("rs-drawer-backdrop");
    const mobileFilterCountBadge = document.getElementById("rs-mobile-filter-count");

    let lastFocusTrigger = null;

    function checkAvailabilityMatch(itemAvailabilityList) {
      if (state.availability === "All") return true;
      if (!itemAvailabilityList || itemAvailabilityList.length === 0) return true;
      return itemAvailabilityList.includes(state.availability);
    }

    function computeMatches() {
      const q = state.query.trim().toLowerCase();

      // 1. Matching Projects
      const matchingProjects = corpus.projects.filter((p) => {
        if (!techMatches(p.technologies, state.technology)) return false;
        if (state.projectType !== "All") {
          const cats = [p.category, p.projectType, ...(p.filterCategories || [])].map((x) =>
            String(x || "").toLowerCase()
          );
          if (!cats.includes(state.projectType.toLowerCase())) return false;
        }
        if (state.skillCategory !== "All") {
          const mapCat = state.skillCategory.toLowerCase();
          const joinedTech = p.technologies.join(" ").toLowerCase();
          if (mapCat === "backend" && !/(node|express|rest|api|jwt|auth)/.test(joinedTech)) return false;
          if (mapCat === "database" && !/(mongo|mongoose|postgres|sql)/.test(joinedTech)) return false;
          if (mapCat === "design" && !/(tailwind|css|figma|ui)/.test(joinedTech + " " + p.category.toLowerCase())) return false;
        }
        if (!q) return true;
        const hay = [
          p.title,
          p.category,
          p.projectType,
          p.developmentRole,
          p.description,
          p.longDescription,
          p.architecture,
          ...(p.technologies || [])
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });

      // 2. Matching Skills
      const matchingSkills = corpus.skills.filter((s) => {
        if (state.skillCategory !== "All" && s.category !== state.skillCategory) return false;
        if (state.technology !== "All") {
          const n = normalizeTechName(s.name);
          const target = normalizeTechName(state.technology);
          if (!(n === target || n.includes(target) || target.includes(n))) return false;
        }
        if (!q) return true;
        const hay = `${s.name} ${s.category} ${s.level} ${s.summary}`.toLowerCase();
        return hay.includes(q);
      });

      // 3. Relevant Experience
      const matchingExperience = corpus.experience.filter((e) => {
        if (state.experienceCategory !== "All" && e.category !== state.experienceCategory) return false;
        if (!checkAvailabilityMatch(e.availability)) return false;
        if (!techMatches(e.technologies, state.technology)) return false;
        if (state.skillCategory !== "All") {
          const catL = state.skillCategory.toLowerCase();
          const techL = e.technologies.join(" ").toLowerCase();
          if (catL === "database" && !/(mongo|postgres|dbms)/.test(techL)) return false;
          if (catL === "design" && !/(figma|ui|css)/.test(techL + " " + e.title.toLowerCase())) return false;
        }
        if (!q) return true;
        const hay = [e.title, e.organization, e.category, e.description, ...e.technologies]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });

      // 4. Matching Certificates
      const matchingCertificates = corpus.certificates.filter((c) => {
        if (state.experienceCategory !== "All" && c.category !== state.experienceCategory) return false;
        if (state.skillCategory !== "All" && c.skillCategory !== state.skillCategory) return false;
        if (!techMatches(c.technologies, state.technology)) return false;
        if (!q) return true;
        const hay = [c.title, c.issuer, c.credentialId, c.description, ...c.technologies]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });

      // 5. Related Case Studies & Technical Blog Articles
      const relatedCaseStudies = matchingProjects.filter((p) => p.hasCaseStudy);
      const matchingArticles = corpus.articles.filter((a) => {
        if (!techMatches([...a.technologies, a.category], state.technology)) return false;
        if (!q) return true;
        const hay = [a.title, a.category, a.excerpt, ...a.technologies].join(" ").toLowerCase();
        return hay.includes(q);
      });

      return {
        projects: matchingProjects,
        skills: matchingSkills,
        experience: matchingExperience,
        certificates: matchingCertificates,
        caseStudies: relatedCaseStudies,
        articles: matchingArticles
      };
    }

    function countActiveFilters() {
      let count = 0;
      if (state.query.trim()) count++;
      if (state.technology !== "All") count++;
      if (state.experienceCategory !== "All") count++;
      if (state.projectType !== "All") count++;
      if (state.skillCategory !== "All") count++;
      if (state.availability !== "All") count++;
      return count;
    }

    function populateFilterControls() {
      if (techSelect) {
        const allTech = ["All", ...corpus.topTechnologies];
        techSelect.innerHTML = allTech
          .map((t) => `<option value="${escHtml(t)}">${escHtml(t === "All" ? "All Technologies" : t)}</option>`)
          .join("");
        techSelect.value = state.technology;
      }

      if (techCloudEl) {
        techCloudEl.innerHTML = ["All", ...corpus.topTechnologies.slice(0, 10)]
          .map((t) => {
            const active = state.technology === t;
            return `<button type="button" class="rs-tech-btn ${active ? "is-active" : ""}" data-rs-tech="${escHtml(t)}" aria-pressed="${active ? "true" : "false"}">${escHtml(t)}</button>`;
          })
          .join("");
        techCloudEl.querySelectorAll("[data-rs-tech]").forEach((btn) => {
          btn.addEventListener("click", () => {
            state.technology = btn.getAttribute("data-rs-tech") || "All";
            if (techSelect) techSelect.value = state.technology;
            renderAll();
          });
        });
      }

      if (expCatSelect) {
        const cats = ["All", "Work Experience", "Freelance", "Education"];
        expCatSelect.innerHTML = cats
          .map((c) => `<option value="${escHtml(c)}">${escHtml(c === "All" ? "All Experience Categories" : c)}</option>`)
          .join("");
        expCatSelect.value = state.experienceCategory;
      }

      if (projTypeSelect) {
        projTypeSelect.innerHTML = corpus.projectTypes
          .map((pt) => `<option value="${escHtml(pt)}">${escHtml(pt === "All" ? "All Project Types" : pt)}</option>`)
          .join("");
        projTypeSelect.value = state.projectType;
      }

      if (skillCatSelect) {
        skillCatSelect.innerHTML = corpus.skillCategories
          .map((sc) => `<option value="${escHtml(sc)}">${escHtml(sc === "All" ? "All Skill Categories" : sc)}</option>`)
          .join("");
        skillCatSelect.value = state.skillCategory;
      }

      if (availSelect) {
        const availOpts = [
          { value: "All", label: `All (${corpus.availabilityConfig.shortLabel})` },
          { value: "open-freelance", label: "Open to Freelance Contracts" },
          { value: "fullstack-roles", label: "Full-Stack Product Roles" },
          { value: "immediate-remote", label: "Immediate Remote Collaboration" }
        ];
        availSelect.innerHTML = availOpts
          .map((o) => `<option value="${escHtml(o.value)}">${escHtml(o.label)}</option>`)
          .join("");
        availSelect.value = state.availability;
      }
    }

    function renderQuickQueries() {
      if (!quickQueriesEl) return;
      quickQueriesEl.innerHTML = QUICK_QUERIES.map((qq) => {
        const active =
          state.technology === qq.tech &&
          state.query.trim().toLowerCase() === qq.query.toLowerCase();
        return `
          <button
            type="button"
            class="rs-quick-btn ${active ? "is-active" : ""}"
            data-rs-quick="${escHtml(qq.id)}"
          >
            ${escHtml(qq.label)}
          </button>
        `;
      }).join("");

      quickQueriesEl.querySelectorAll("[data-rs-quick]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-rs-quick");
          const preset = QUICK_QUERIES.find((item) => item.id === id);
          if (!preset) return;
          state.technology = preset.tech;
          state.query = preset.query;
          if (searchInput) searchInput.value = preset.query;
          if (techSelect) techSelect.value = preset.tech;
          renderAll();
        });
      });
    }

    function renderOverviewAndTabs(matches) {
      if (kpiStripEl) {
        const totalExpCert = matches.experience.length + matches.certificates.length;
        const totalCaseBlog = matches.caseStudies.length + matches.articles.length;
        kpiStripEl.innerHTML = `
          <div class="rs-kpi-cell">
            <span class="text-xs text-[var(--muted)]">Matching Projects</span>
            <span class="text-xl font-extrabold font-mono-tech tabular-nums text-[var(--text)]">${matches.projects.length}</span>
          </div>
          <div class="rs-kpi-cell">
            <span class="text-xs text-[var(--muted)]">Matching Skills</span>
            <span class="text-xl font-extrabold font-mono-tech tabular-nums text-[var(--text)]">${matches.skills.length}</span>
          </div>
          <div class="rs-kpi-cell">
            <span class="text-xs text-[var(--muted)]">Experience &amp; Certs</span>
            <span class="text-xl font-extrabold font-mono-tech tabular-nums text-[var(--text)]">${totalExpCert}</span>
          </div>
          <div class="rs-kpi-cell">
            <span class="text-xs text-[var(--muted)]">Case Studies &amp; Posts</span>
            <span class="text-xl font-extrabold font-mono-tech tabular-nums text-[var(--text)]">${totalCaseBlog}</span>
          </div>
          <div class="rs-kpi-cell col-span-2 md:col-span-1">
            <span class="text-xs text-[var(--muted)]">Current Status</span>
            <span class="text-sm font-bold text-cyan-400 truncate">${escHtml(corpus.availabilityConfig.shortLabel)}</span>
          </div>
        `;
      }

      if (scopeTabsEl) {
        const scopes = [
          { id: "all", label: "All Matches" },
          { id: "projects", label: `Projects (${matches.projects.length})` },
          { id: "skills", label: `Skills (${matches.skills.length})` },
          { id: "experience", label: `Experience & Certs (${matches.experience.length + matches.certificates.length})` },
          { id: "case-studies", label: `Case Studies & Writing (${matches.caseStudies.length + matches.articles.length})` }
        ];
        scopeTabsEl.innerHTML = scopes
          .map((sc) => {
            const active = state.resultScope === sc.id;
            return `
              <button
                type="button"
                role="tab"
                aria-selected="${active ? "true" : "false"}"
                class="rs-scope-btn ${active ? "is-active" : ""}"
                data-rs-scope="${escHtml(sc.id)}"
              >
                ${escHtml(sc.label)}
              </button>
            `;
          })
          .join("");

        scopeTabsEl.querySelectorAll("[data-rs-scope]").forEach((btn) => {
          btn.addEventListener("click", () => {
            state.resultScope = btn.getAttribute("data-rs-scope") || "all";
            renderResultsOnly();
          });
        });
      }

      if (mobileFilterCountBadge) {
        const activeCount = countActiveFilters();
        mobileFilterCountBadge.textContent = activeCount > 0 ? `(${activeCount})` : "";
      }
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle("hidden", state.query.trim().length === 0);
      }
    }

    function renderResultsList(matches) {
      if (!resultsEl) return;
      const q = state.query.trim();
      const blocks = [];

      const totalCount =
        matches.projects.length +
        matches.skills.length +
        matches.experience.length +
        matches.certificates.length +
        matches.articles.length;

      if (totalCount === 0) {
        resultsEl.innerHTML = `
          <div class="rs-group-block p-8 text-center space-y-3">
            <h2 class="text-lg font-bold text-[var(--text)]">No exact portfolio matches found</h2>
            <p class="text-sm text-[var(--muted)] max-w-md mx-auto">
              Try clearing one of the active filters or searching a core technology like React, Node.js, MongoDB, PostgreSQL, or Tailwind.
            </p>
            <div>
              <button type="button" id="rs-empty-reset" class="primary-button text-xs sm:text-sm">
                <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                <span>Reset Search &amp; Filters</span>
              </button>
            </div>
          </div>
        `;
        const emptyReset = document.getElementById("rs-empty-reset");
        if (emptyReset) emptyReset.addEventListener("click", resetAll);
        refreshIcons();
        return;
      }

      // 1. Matching Projects
      if ((state.resultScope === "all" || state.resultScope === "projects") && matches.projects.length > 0) {
        const rows = matches.projects
          .map(
            (p) => `
              <article class="rs-result-row space-y-2">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div class="space-y-0.5 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                      <span class="font-semibold text-indigo-400">${escHtml(p.category)}</span>
                      <span aria-hidden="true">·</span>
                      <span>${escHtml(p.projectType)}</span>
                      <span aria-hidden="true">·</span>
                      <span class="font-mono-tech tabular-nums">${escHtml(p.year)}</span>
                    </div>
                    <h3 class="text-base sm:text-lg font-bold text-[var(--text)]">${highlightText(p.title, q)}</h3>
                  </div>
                  <a href="${escHtml(p.href)}" class="outline-button text-xs min-h-[38px] shrink-0">
                    <span>Case Study</span>
                    <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                  </a>
                </div>
                <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${highlightText(p.description, q)}</p>
                <p class="text-xs font-mono-tech text-[var(--muted)]">
                  Role: <span class="text-[var(--text)]">${highlightText(p.developmentRole, q)}</span> · Stack: ${highlightText(p.technologies.join(" / "), q)}
                </p>
              </article>
            `
          )
          .join("");

        blocks.push(`
          <section class="rs-group-block" aria-label="Matching Projects">
            <header class="rs-group-head">
              <div class="flex items-center gap-2">
                <i data-lucide="folder-kanban" class="w-4 h-4 text-indigo-400"></i>
                <h2 class="text-base font-bold text-[var(--text)]">Matching Projects</h2>
              </div>
              <span class="text-xs font-mono-tech tabular-nums text-[var(--muted)]">${matches.projects.length} matched</span>
            </header>
            <div>${rows}</div>
          </section>
        `);
      }

      // 2. Matching Skills & Technologies
      if ((state.resultScope === "all" || state.resultScope === "skills") && matches.skills.length > 0) {
        const skillCells = matches.skills
          .map(
            (s) => `
              <div class="rs-skill-cell">
                <div class="flex items-center justify-between gap-2">
                  <a href="${escHtml(s.href)}" class="font-bold text-sm text-[var(--text)] hover:text-cyan-400 transition-colors">
                    ${highlightText(s.name, q)}
                  </a>
                  <span class="text-xs text-[var(--muted)]">${escHtml(s.category)} · ${escHtml(s.level)}</span>
                </div>
                <p class="text-xs text-[var(--muted)] leading-relaxed">${highlightText(s.summary, q)}</p>
              </div>
            `
          )
          .join("");

        blocks.push(`
          <section class="rs-group-block" aria-label="Matching Skills">
            <header class="rs-group-head">
              <div class="flex items-center gap-2">
                <i data-lucide="cpu" class="w-4 h-4 text-cyan-400"></i>
                <h2 class="text-base font-bold text-[var(--text)]">Matching Skills &amp; Technologies</h2>
              </div>
              <span class="text-xs font-mono-tech tabular-nums text-[var(--muted)]">${matches.skills.length} matched</span>
            </header>
            <div class="rs-skill-grid">${skillCells}</div>
          </section>
        `);
      }

      // 3. Relevant Experience & Certificates
      if (
        (state.resultScope === "all" || state.resultScope === "experience") &&
        (matches.experience.length > 0 || matches.certificates.length > 0)
      ) {
        const expRows = matches.experience
          .map(
            (e) => `
              <article class="rs-result-row space-y-1.5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                    <span class="font-semibold text-emerald-400">${escHtml(e.category)}</span>
                    <span aria-hidden="true">·</span>
                    <span>${highlightText(e.organization, q)}</span>
                  </div>
                  <span class="text-xs font-mono-tech tabular-nums text-[var(--muted)]">${escHtml(e.date)}</span>
                </div>
                <h3 class="text-base font-bold text-[var(--text)]">${highlightText(e.title, q)}</h3>
                <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${highlightText(e.description, q)}</p>
                <p class="text-xs font-mono-tech text-[var(--muted)]">${highlightText(e.technologies.join(" · "), q)}</p>
              </article>
            `
          )
          .join("");

        const certRows = matches.certificates
          .map(
            (c) => `
              <article class="rs-result-row space-y-1">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                    <span class="font-semibold text-violet-400">Verified Certificate</span>
                    <span aria-hidden="true">·</span>
                    <span>${highlightText(c.issuer, q)}</span>
                    <span aria-hidden="true">·</span>
                    <span class="font-mono-tech">ID: ${highlightText(c.credentialId, q)}</span>
                  </div>
                  <span class="text-xs font-mono-tech tabular-nums text-[var(--muted)]">${escHtml(c.date)}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <h3 class="text-sm sm:text-base font-bold text-[var(--text)]">${highlightText(c.title, q)}</h3>
                  <a href="${escHtml(c.href)}" class="text-xs font-semibold text-cyan-400 hover:underline shrink-0">Verify →</a>
                </div>
                <p class="text-xs sm:text-sm text-[var(--muted)]">${highlightText(c.description, q)}</p>
              </article>
            `
          )
          .join("");

        blocks.push(`
          <section class="rs-group-block" aria-label="Relevant Experience and Certificates">
            <header class="rs-group-head">
              <div class="flex items-center gap-2">
                <i data-lucide="briefcase" class="w-4 h-4 text-emerald-400"></i>
                <h2 class="text-base font-bold text-[var(--text)]">Relevant Experience &amp; Certificates</h2>
              </div>
              <span class="text-xs font-mono-tech tabular-nums text-[var(--muted)]">${matches.experience.length + matches.certificates.length} matched</span>
            </header>
            <div>${expRows}${certRows}</div>
          </section>
        `);
      }

      // 4. Related Case Studies & Technical Blog Articles
      if (
        (state.resultScope === "all" || state.resultScope === "case-studies") &&
        (matches.caseStudies.length > 0 || matches.articles.length > 0)
      ) {
        const csRows = matches.caseStudies
          .map(
            (cs) => `
              <article class="rs-result-row space-y-1.5">
                <div class="flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-xs text-cyan-400 font-semibold">Architecture Case Study · ${escHtml(cs.category)}</p>
                    <h3 class="text-base font-bold text-[var(--text)] truncate">${highlightText(cs.title, q)} — System Deep Dive</h3>
                  </div>
                  <a href="${escHtml(cs.href)}" class="text-xs font-semibold text-cyan-400 hover:underline shrink-0">Read Case Study →</a>
                </div>
                <p class="text-sm text-[var(--muted)] leading-relaxed">${highlightText(cs.architecture || cs.longDescription, q)}</p>
              </article>
            `
          )
          .join("");

        const blogRows = matches.articles
          .map(
            (a) => `
              <article class="rs-result-row space-y-1.5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                    <span class="font-semibold text-indigo-400">Blog Article · ${escHtml(a.category)}</span>
                    <span aria-hidden="true">·</span>
                    <span>${escHtml(a.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span>${escHtml(a.readingTime)}</span>
                  </div>
                  <a href="${escHtml(a.href)}" class="text-xs font-semibold text-cyan-400 hover:underline shrink-0">Read Article →</a>
                </div>
                <h3 class="text-sm sm:text-base font-bold text-[var(--text)]">${highlightText(a.title, q)}</h3>
                <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${highlightText(a.excerpt, q)}</p>
              </article>
            `
          )
          .join("");

        blocks.push(`
          <section class="rs-group-block" aria-label="Related Case Studies and Articles">
            <header class="rs-group-head">
              <div class="flex items-center gap-2">
                <i data-lucide="book-open" class="w-4 h-4 text-violet-400"></i>
                <h2 class="text-base font-bold text-[var(--text)]">Related Case Studies &amp; Engineering Writing</h2>
              </div>
              <span class="text-xs font-mono-tech tabular-nums text-[var(--muted)]">${matches.caseStudies.length + matches.articles.length} matched</span>
            </header>
            <div>${csRows}${blogRows}</div>
          </section>
        `);
      }

      resultsEl.innerHTML = blocks.join("");
      refreshIcons();
    }

    function renderResultsOnly() {
      const matches = computeMatches();
      renderOverviewAndTabs(matches);
      renderResultsList(matches);
    }

    function renderAll() {
      populateFilterControls();
      renderQuickQueries();
      renderResultsOnly();
    }

    function resetAll() {
      state.query = "";
      state.technology = "All";
      state.experienceCategory = "All";
      state.projectType = "All";
      state.skillCategory = "All";
      state.availability = "All";
      state.resultScope = "all";
      if (searchInput) searchInput.value = "";
      renderAll();
    }

    function openDrawer(trigger) {
      lastFocusTrigger = trigger || document.activeElement;
      if (drawerPanel) {
        drawerPanel.classList.add("is-open");
        drawerPanel.setAttribute("aria-hidden", "false");
      }
      if (drawerBackdrop) drawerBackdrop.classList.add("is-open");
      if (drawerToggleBtn) drawerToggleBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
      if (drawerCloseBtn) window.setTimeout(() => drawerCloseBtn.focus(), 40);
    }

    function closeDrawer() {
      if (drawerPanel) {
        drawerPanel.classList.remove("is-open");
        if (window.innerWidth < 1024) {
          drawerPanel.setAttribute("aria-hidden", "true");
        }
      }
      if (drawerBackdrop) drawerBackdrop.classList.remove("is-open");
      if (drawerToggleBtn) drawerToggleBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      if (lastFocusTrigger && typeof lastFocusTrigger.focus === "function") {
        lastFocusTrigger.focus();
      }
    }

    // Bind Search & Filter Controls
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.query = searchInput.value;
        renderQuickQueries();
        renderResultsOnly();
      });
    }
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        state.query = "";
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
        }
        renderQuickQueries();
        renderResultsOnly();
      });
    }

    if (techSelect) {
      techSelect.addEventListener("change", () => {
        state.technology = techSelect.value || "All";
        renderAll();
      });
    }
    if (expCatSelect) {
      expCatSelect.addEventListener("change", () => {
        state.experienceCategory = expCatSelect.value || "All";
        renderResultsOnly();
      });
    }
    if (projTypeSelect) {
      projTypeSelect.addEventListener("change", () => {
        state.projectType = projTypeSelect.value || "All";
        renderResultsOnly();
      });
    }
    if (skillCatSelect) {
      skillCatSelect.addEventListener("change", () => {
        state.skillCategory = skillCatSelect.value || "All";
        renderResultsOnly();
      });
    }
    if (availSelect) {
      availSelect.addEventListener("change", () => {
        state.availability = availSelect.value || "All";
        renderResultsOnly();
      });
    }
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener("click", resetAll);
    }

    // Mobile Filter Drawer Controls
    if (drawerToggleBtn) {
      drawerToggleBtn.addEventListener("click", () => openDrawer(drawerToggleBtn));
    }
    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener("click", closeDrawer);
    }
    if (drawerApplyBtn) {
      drawerApplyBtn.addEventListener("click", closeDrawer);
    }
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener("click", closeDrawer);
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drawerPanel && drawerPanel.classList.contains("is-open")) {
        closeDrawer();
      } else if (
        event.key === "/" &&
        searchInput &&
        document.activeElement !== searchInput &&
        !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement && document.activeElement.tagName) || "")
      ) {
        event.preventDefault();
        searchInput.focus();
      }
    });

    renderAll();
  }

  window.PortfolioRecruiterSearch = {
    init,
    VERIFIED_EXPERIENCE,
    VERIFIED_CERTIFICATES,
    gatherCentralizedCorpus
  };
})();
