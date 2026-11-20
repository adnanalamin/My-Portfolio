/**
 * AL AMIN Portfolio — Phase 36: Dynamic Resume Builder (resume.html)
 * Synthesizes role-tailored resumes cleanly from centralized portfolio data:
 * window.portfolioConfig, window.PortfolioSkills, window.PortfolioProjects,
 * and verified portfolio Experience, Education, and Certificate records.
 * STRICT RULE: Never fabricate experience, dates, credentials, or employers.
 */

(() => {
  const SECTIONS_META = [
    { id: "summary", label: "Summary" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "education", label: "Education" },
    { id: "certificates", label: "Certificates" },
    { id: "github", label: "GitHub" },
    { id: "contact", label: "Contact" }
  ];

  // Grounded records synchronized strictly with portfolio Experience, Education, and Certificates
  const VERIFIED_EXPERIENCE = [
    {
      id: "exp-mern-studio",
      date: "2025 – Present",
      title: "Full-Stack MERN Developer",
      organization: "Independent Product Studio",
      tags: ["developer", "fullstack", "recruiter"],
      bullets: [
        "Architecting and shipping full-stack web applications, SaaS analytics portals, and RESTful APIs with React, Next.js, Node.js, Express, and MongoDB.",
        "Implementing modular dark/light design systems, JWT/RBAC permissions, and responsive layouts from 320px to 2560px."
      ]
    },
    {
      id: "exp-fe-engineer",
      date: "2024 – 2025",
      title: "Frontend & UI Engineer",
      organization: "Digital Web Solutions",
      tags: ["developer", "frontend", "designer", "recruiter"],
      bullets: [
        "Built reusable component libraries, converted Figma design systems into accessible production UI, and optimized Core Web Vitals.",
        "Applied semantic HTML5, modern CSS Grid/Flexbox, and WCAG contrast and keyboard accessibility standards."
      ]
    },
    {
      id: "exp-freelance",
      date: "2023 – Present",
      title: "Freelance Web Developer & UI Designer",
      organization: "Fiverr, Upwork & Direct Clients",
      tags: ["developer", "fullstack", "frontend", "designer", "recruiter"],
      bullets: [
        "Partnered with startup founders and clients to deliver custom storefronts, admin dashboards, and responsive website redesigns.",
        "Delivered semantic SEO metadata, structured client inquiry workflows, and maintainable modular codebases."
      ]
    }
  ];

  const VERIFIED_EDUCATION = [
    {
      degree: "B.Sc. in Computer Science & Engineering",
      institution: "University Studies · Bangladesh",
      period: "2021 – 2025",
      focus: "Algorithms, Data Structures, Database Management Systems (DBMS), and Software Architecture"
    }
  ];

  const VERIFIED_CERTIFICATES = [
    { id: "cert-fullstack-mern", title: "Full-Stack MERN Web Development", issuer: "Engineering Bootcamp & Applied Labs", date: "2025", credentialId: "MERN-2025-01", tags: ["developer", "fullstack", "recruiter"] },
    { id: "cert-backend-api", title: "Node.js API & Database Systems", issuer: "Backend Architecture Specialization", date: "2025", credentialId: "BE-2025-04", tags: ["developer", "fullstack", "recruiter"] },
    { id: "cert-frontend-react", title: "React & Frontend Architecture", issuer: "Modern Web Engineering Track", date: "2024", credentialId: "FE-2024-08", tags: ["developer", "frontend", "fullstack", "recruiter"] },
    { id: "cert-responsive-ui", title: "Responsive Web & UI Systems", issuer: "Design Systems & Accessibility Program", date: "2024", credentialId: "UI-2024-11", tags: ["developer", "frontend", "designer", "recruiter"] }
  ];

  const VERIFIED_LANGUAGES = [
    { name: "Bengali", level: "Native Proficiency" },
    { name: "English", level: "Professional Working Proficiency" }
  ];

  const ROLE_PRESETS = {
    developer: {
      id: "developer",
      label: "Developer Resume",
      icon: "code-2",
      headline: "Full-Stack & Software Developer",
      summary:
        "Software Developer and CS graduate specializing in modern JavaScript, React, Node.js, REST APIs, MongoDB, PostgreSQL, and maintainable frontend design systems built for clarity and responsive speed.",
      skillCategories: ["Frontend", "Backend", "Database", "Tools", "Other"],
      projectSlugs: ["astrapulse", "nexora", "slideverse", "school-management-system"],
      experienceTags: ["developer"],
      certTags: ["developer"],
      sections: ["summary", "skills", "experience", "projects", "education", "certificates", "github", "contact"]
    },
    fullstack: {
      id: "fullstack",
      label: "Full-Stack Resume",
      icon: "layers",
      headline: "Full-Stack MERN & API Systems Developer",
      summary:
        "Full-Stack MERN Developer focused on end-to-end web architecture—designing normalized MongoDB & PostgreSQL schemas, versioned Express REST APIs, JWT/RBAC authorization, and responsive React/Next.js interfaces.",
      skillCategories: ["Backend", "Database", "Frontend", "Tools", "Other"],
      projectSlugs: ["astrapulse", "ecommerce-saas", "school-management-system", "nexora"],
      experienceTags: ["fullstack"],
      certTags: ["fullstack"],
      sections: ["summary", "skills", "experience", "projects", "education", "certificates", "github", "contact"]
    },
    frontend: {
      id: "frontend",
      label: "Frontend Resume",
      icon: "layout",
      headline: "Frontend & UI Systems Engineer",
      summary:
        "Frontend Engineer crafting responsive, accessible, theme-aware web interfaces using React, Next.js, TypeScript/ES2024 JavaScript, Tailwind CSS, and modular component architecture verified from 320px to 2560px.",
      skillCategories: ["Frontend", "Design", "Tools", "Other"],
      projectSlugs: ["slideverse", "nexora", "portfolio-system", "astrapulse"],
      experienceTags: ["frontend"],
      certTags: ["frontend"],
      sections: ["summary", "skills", "experience", "projects", "certificates", "education", "github", "contact"]
    },
    designer: {
      id: "designer",
      label: "Designer Resume",
      icon: "palette",
      headline: "Creative UI/UX & Design Systems Engineer",
      summary:
        "UI/UX Designer & Frontend Crafter bridging Figma visual systems, adaptive dark/light design tokens, interactive prototyping, and clean semantic implementation across desktop and mobile viewports.",
      skillCategories: ["Design", "Frontend", "Tools"],
      projectSlugs: ["slideverse", "portfolio-system", "ecommerce-saas", "nexora"],
      experienceTags: ["designer"],
      certTags: ["designer"],
      sections: ["summary", "projects", "skills", "experience", "certificates", "education", "contact"]
    },
    recruiter: {
      id: "recruiter",
      label: "Recruiter Summary",
      icon: "user-check",
      headline: "Engineering Snapshot — Full-Stack MERN & Frontend",
      summary:
        "Concise hiring overview highlighting verified MERN/Next.js capabilities, active product studio & freelance delivery since 2023, B.Sc. in CSE (2021–2025), and immediate availability for remote full-stack or frontend roles.",
      skillCategories: ["Frontend", "Backend", "Database", "Tools"],
      projectSlugs: ["astrapulse", "nexora", "ecommerce-saas"],
      experienceTags: ["recruiter"],
      certTags: ["recruiter"],
      sections: ["summary", "experience", "skills", "projects", "education", "certificates", "contact"]
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

  function gatherCentralizedData() {
    const cfg = window.portfolioConfig || {};
    const brand = cfg.brand || {};
    const github = cfg.github || {};
    const social = cfg.socialLinks || brand.social || {};

    const profile = {
      name: brand.displayName || brand.name || cfg.name || "AL AMIN",
      title: brand.professionalTitle || cfg.role || "Full-Stack Developer & Creative Designer",
      location: brand.location || cfg.location || "Bangladesh",
      email: brand.email || cfg.email || "your-email@example.com",
      phone: brand.phone || cfg.phone || "",
      availability:
        (brand.availability && brand.availability.label) ||
        "Open to Freelance & Full-Stack Roles",
      profileImage: brand.profileImage || cfg.profileImage || "assets/images/profile.jpg",
      fallbackImage: brand.profileFallbackImage || "assets/images/profile-placeholder.svg"
    };

    const allSkills =
      window.PortfolioSkills && Array.isArray(window.PortfolioSkills.skillsCatalog)
        ? window.PortfolioSkills.skillsCatalog
        : [
            { name: "HTML5", category: "Frontend" },
            { name: "CSS3", category: "Frontend" },
            { name: "Tailwind", category: "Frontend" },
            { name: "JavaScript", category: "Frontend" },
            { name: "React", category: "Frontend" },
            { name: "Redux", category: "Frontend" },
            { name: "Next.js", category: "Frontend" },
            { name: "Node.js", category: "Backend" },
            { name: "Express", category: "Backend" },
            { name: "REST API", category: "Backend" },
            { name: "MongoDB", category: "Database" },
            { name: "Mongoose", category: "Database" },
            { name: "PostgreSQL", category: "Database" },
            { name: "Git", category: "Tools" },
            { name: "GitHub", category: "Tools" },
            { name: "VS Code", category: "Tools" },
            { name: "Postman", category: "Tools" },
            { name: "Figma", category: "Design" },
            { name: "SEO", category: "Other" },
            { name: "Responsive Design", category: "Other" },
            { name: "Performance Optimization", category: "Other" }
          ];

    const allProjects =
      window.PortfolioProjects && Array.isArray(window.PortfolioProjects.projectsData)
        ? window.PortfolioProjects.projectsData
        : [
            {
              slug: "astrapulse",
              title: "AstraPulse",
              category: "SaaS",
              year: "2026",
              description: "Real-time full-stack telemetry and product analytics workspace built for engineering teams to monitor API latency, funnels, and uptime.",
              technologies: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "REST API"]
            },
            {
              slug: "nexora",
              title: "Nexora",
              category: "E-commerce",
              year: "2026",
              description: "Headless commerce storefront featuring instant search, Redux cart synchronization, and slide-over checkout UX.",
              technologies: ["React", "Redux", "Node.js", "MongoDB", "Tailwind CSS"]
            },
            {
              slug: "slideverse",
              title: "SLIDEVERSE",
              category: "Web Apps",
              year: "2025",
              description: "Interactive browser slide builder with live typography controls and keyboard-first presentation mode.",
              technologies: ["JavaScript", "HTML5", "CSS3", "Tailwind CSS"]
            },
            {
              slug: "school-management-system",
              title: "School Management System",
              category: "Dashboard",
              year: "2025",
              description: "Role-based academic portal handling student rosters, attendance matrices, and GPA analytics.",
              technologies: ["React", "Node.js", "Express", "MongoDB", "REST API"]
            },
            {
              slug: "ecommerce-saas",
              title: "E-commerce SaaS",
              category: "SaaS",
              year: "2026",
              description: "Multi-tenant merchant store builder pairing PostgreSQL order ledgers with MongoDB storefront themes.",
              technologies: ["Next.js", "React", "Node.js", "PostgreSQL", "MongoDB"]
            },
            {
              slug: "portfolio-system",
              title: "AL AMIN Portfolio System",
              category: "UI/UX",
              year: "2026",
              description: "Centralized static engineering portfolio system spanning interactive architecture, API docs, and UI labs.",
              technologies: ["HTML5", "CSS3", "Tailwind CSS", "JavaScript"]
            }
          ];

    const githubUsername =
      typeof github.username === "string" && github.username.trim()
        ? github.username.trim().replace(/^@+/, "")
        : "Configured in js/config.js";

    const githubSummary = {
      username: githubUsername,
      profileUrl:
        social.github && social.github.trim()
          ? social.github.trim()
          : github.username
          ? `https://github.com/${encodeURIComponent(github.username.trim())}`
          : "",
      featuredRepos: Array.isArray(github.featuredRepos) ? github.featuredRepos : []
    };

    return {
      profile,
      allSkills,
      allProjects,
      githubSummary,
      experience: VERIFIED_EXPERIENCE,
      education: VERIFIED_EDUCATION,
      certificates: VERIFIED_CERTIFICATES,
      languages: VERIFIED_LANGUAGES
    };
  }

  function buildPlainTextResume(preset, enabledSections, data) {
    const lines = [
      `${data.profile.name} — ${preset.headline}`,
      `${data.profile.location} | ${data.profile.email} | ${data.profile.availability}`,
      ""
    ];

    if (enabledSections.has("summary")) {
      lines.push("SUMMARY", preset.summary, "");
    }
    if (enabledSections.has("skills")) {
      lines.push("SKILLS");
      preset.skillCategories.forEach((cat) => {
        const list = data.allSkills.filter((s) => s.category === cat).map((s) => s.name);
        if (list.length > 0) lines.push(`  ${cat}: ${list.join(", ")}`);
      });
      lines.push("");
    }
    if (enabledSections.has("experience")) {
      lines.push("EXPERIENCE");
      data.experience
        .filter((e) => e.tags.some((t) => preset.experienceTags.includes(t)))
        .forEach((e) => {
          lines.push(`  ${e.title} — ${e.organization} (${e.date})`);
          e.bullets.forEach((b) => lines.push(`    • ${b}`));
        });
      lines.push("");
    }
    if (enabledSections.has("projects")) {
      lines.push("PROJECTS");
      const picks = preset.projectSlugs
        .map((slug) => data.allProjects.find((p) => p.slug === slug))
        .filter(Boolean);
      picks.forEach((p) => {
        lines.push(`  ${p.title} (${p.year}) — ${(p.technologies || []).slice(0, 5).join(", ")}`);
        lines.push(`    ${p.description}`);
      });
      lines.push("");
    }
    if (enabledSections.has("education")) {
      lines.push("EDUCATION");
      data.education.forEach((ed) => {
        lines.push(`  ${ed.degree} — ${ed.institution} (${ed.period})`);
        lines.push(`    ${ed.focus}`);
      });
      lines.push("");
    }
    if (enabledSections.has("certificates")) {
      lines.push("CERTIFICATES");
      data.certificates
        .filter((c) => c.tags.some((t) => preset.certTags.includes(t)))
        .forEach((c) => {
          lines.push(`  - ${c.title} (${c.date}, ID: ${c.credentialId})`);
        });
      lines.push("");
    }
    if (enabledSections.has("github")) {
      lines.push("GITHUB");
      lines.push(`  Handle: @${data.githubSummary.username}`);
      if (data.githubSummary.featuredRepos.length > 0) {
        lines.push(`  Featured Repositories: ${data.githubSummary.featuredRepos.join(", ")}`);
      }
      lines.push("");
    }
    if (enabledSections.has("contact")) {
      lines.push("CONTACT & LANGUAGES");
      lines.push(`  Email: ${data.profile.email}`);
      lines.push(`  Location: ${data.profile.location}`);
      lines.push(`  Languages: ${data.languages.map((l) => `${l.name} (${l.level})`).join(", ")}`);
    }

    return lines.join("\n").trim();
  }

  function init() {
    const root = document.getElementById("resume-builder-root");
    if (!root) return;

    const data = gatherCentralizedData();
    const state = {
      roleId: "developer",
      enabledSections: new Set(ROLE_PRESETS.developer.sections),
      compactMode: false
    };

    const roleTabsEl = document.getElementById("rb-role-tabs");
    const sectionTogglesEl = document.getElementById("rb-section-toggles");
    const compactBtn = document.getElementById("rb-compact-toggle");
    const resetBtn = document.getElementById("rb-reset-btn");
    const copyTextBtn = document.getElementById("rb-copy-text-btn");
    const exportTextBtn = document.getElementById("rb-export-txt-btn");
    const sheetEl = document.getElementById("resume-dynamic-sheet");

    function getPreset() {
      return ROLE_PRESETS[state.roleId] || ROLE_PRESETS.developer;
    }

    function renderRoleTabs() {
      if (!roleTabsEl) return;
      roleTabsEl.innerHTML = Object.values(ROLE_PRESETS)
        .map((preset) => {
          const active = preset.id === state.roleId;
          return `
            <button
              type="button"
              role="tab"
              class="rb-role-btn ${active ? "is-active" : ""}"
              aria-selected="${active ? "true" : "false"}"
              data-rb-role="${escHtml(preset.id)}"
            >
              <i data-lucide="${escHtml(preset.icon)}" class="w-4 h-4"></i>
              <span>${escHtml(preset.label)}</span>
            </button>
          `;
        })
        .join("");

      roleTabsEl.querySelectorAll("[data-rb-role]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-rb-role");
          if (!id || !ROLE_PRESETS[id]) return;
          state.roleId = id;
          state.enabledSections = new Set(ROLE_PRESETS[id].sections);
          renderAll();
        });
      });
    }

    function renderSectionToggles() {
      if (!sectionTogglesEl) return;
      sectionTogglesEl.innerHTML = SECTIONS_META.map((sec) => {
        const enabled = state.enabledSections.has(sec.id);
        return `
          <button
            type="button"
            class="rb-toggle-chip ${enabled ? "is-enabled" : ""}"
            aria-pressed="${enabled ? "true" : "false"}"
            data-rb-sec="${escHtml(sec.id)}"
          >
            <i data-lucide="${enabled ? "check" : "sliders-horizontal"}" class="w-3.5 h-3.5"></i>
            <span>${escHtml(sec.label)}</span>
          </button>
        `;
      }).join("");

      sectionTogglesEl.querySelectorAll("[data-rb-sec]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-rb-sec");
          if (!id) return;
          if (state.enabledSections.has(id)) {
            if (state.enabledSections.size <= 1) {
              toast("Keep at least one resume section visible.", "info");
              return;
            }
            state.enabledSections.delete(id);
          } else {
            state.enabledSections.add(id);
          }
          renderSectionToggles();
          renderResumeSheet();
        });
      });
    }

    function renderResumeSheet() {
      if (!sheetEl) return;
      const preset = getPreset();
      sheetEl.classList.toggle("is-compact", state.compactMode);

      const spaceY = state.compactMode ? "space-y-5" : "space-y-7";
      const paddingCls = state.compactMode ? "p-5 sm:p-7" : "p-5 sm:p-8 lg:p-10";
      sheetEl.className = `resume-sheet ${state.compactMode ? "is-compact" : ""} ${paddingCls} ${spaceY}`;

      const parts = [];

      // Always render Top Resume Identity Header
      parts.push(`
        <header class="resume-block pb-5 border-b border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <img
              src="${escHtml(data.profile.profileImage)}"
              alt="${escHtml(data.profile.name)} portrait"
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[var(--border-strong)] shrink-0"
              onerror="this.src='${escHtml(data.profile.fallbackImage)}'"
            >
            <div class="min-w-0 space-y-1">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-[var(--text)]">${escHtml(data.profile.name)}</h2>
              <p class="text-sm sm:text-base font-semibold text-indigo-400">${escHtml(preset.headline)}</p>
              <p class="text-xs sm:text-sm text-[var(--muted)]">
                <span>${escHtml(data.profile.location)}</span> ·
                <span class="font-mono-tech">${escHtml(data.profile.email)}</span>
              </p>
            </div>
          </div>
          <div class="text-xs font-mono-tech text-[var(--muted)] sm:text-right shrink-0">
            <p class="text-[var(--text-secondary)] font-semibold">${escHtml(preset.label)}</p>
            <p>${escHtml(data.profile.availability)}</p>
          </div>
        </header>
      `);

      // Summary
      if (state.enabledSections.has("summary")) {
        parts.push(`
          <section class="resume-block space-y-2">
            <h3 class="text-base sm:text-lg font-bold text-[var(--text)] border-b border-[var(--border)] pb-1">Summary</h3>
            <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(preset.summary)}</p>
          </section>
        `);
      }

      // Skills (Grouped strictly from centralized PortfolioSkills)
      if (state.enabledSections.has("skills")) {
        const skillBlocks = preset.skillCategories
          .map((cat) => {
            const list = data.allSkills.filter((s) => s.category === cat).map((s) => s.name);
            if (list.length === 0) return "";
            return `
              <div class="space-y-1">
                <p class="font-semibold text-[var(--text)] text-sm">${escHtml(cat)}</p>
                <p class="text-xs sm:text-sm text-[var(--muted)]">${escHtml(list.join(", "))}</p>
              </div>
            `;
          })
          .filter(Boolean)
          .join("");

        parts.push(`
          <section class="resume-block space-y-3">
            <h3 class="text-base sm:text-lg font-bold text-[var(--text)] border-b border-[var(--border)] pb-1">Skills</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">${skillBlocks}</div>
          </section>
        `);
      }

      // Experience
      if (state.enabledSections.has("experience")) {
        const expItems = data.experience
          .filter((item) => item.tags.some((t) => preset.experienceTags.includes(t)))
          .map(
            (item) => `
              <div class="space-y-1.5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 class="text-sm sm:text-base font-bold text-[var(--text)]">${escHtml(item.title)} — ${escHtml(item.organization)}</h4>
                  <span class="text-xs font-mono-tech text-[var(--muted)] tabular-nums">${escHtml(item.date)}</span>
                </div>
                <ul class="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[var(--muted)]">
                  ${item.bullets.map((b) => `<li>${escHtml(b)}</li>`).join("")}
                </ul>
              </div>
            `
          )
          .join("");

        parts.push(`
          <section class="resume-block space-y-3.5">
            <h3 class="text-base sm:text-lg font-bold text-[var(--text)] border-b border-[var(--border)] pb-1">Experience</h3>
            <div class="space-y-4">${expItems}</div>
          </section>
        `);
      }

      // Projects (Strictly from PortfolioProjects)
      if (state.enabledSections.has("projects")) {
        const projectCards = preset.projectSlugs
          .map((slug) => data.allProjects.find((p) => p.slug === slug))
          .filter(Boolean)
          .map(
            (p) => `
              <div class="space-y-1">
                <div class="flex items-center justify-between gap-2">
                  <h4 class="font-bold text-sm text-[var(--text)]">${escHtml(p.title)}</h4>
                  <span class="text-xs font-mono-tech text-[var(--muted)] tabular-nums">${escHtml(p.year || "")}</span>
                </div>
                <p class="text-xs sm:text-sm text-[var(--muted)]">${escHtml(p.description)}</p>
                <p class="text-[11px] font-mono-tech text-[var(--text-secondary)]">${escHtml((p.technologies || []).slice(0, 5).join(" · "))}</p>
              </div>
            `
          )
          .join("");

        parts.push(`
          <section class="resume-block space-y-3">
            <h3 class="text-base sm:text-lg font-bold text-[var(--text)] border-b border-[var(--border)] pb-1">Selected Projects</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${projectCards}</div>
          </section>
        `);
      }

      // Education
      if (state.enabledSections.has("education")) {
        const edMarkup = data.education
          .map(
            (ed) => `
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 class="text-sm sm:text-base font-bold text-[var(--text)]">${escHtml(ed.degree)}</h4>
                  <p class="text-xs sm:text-sm text-[var(--muted)]">${escHtml(ed.institution)} · ${escHtml(ed.focus)}</p>
                </div>
                <span class="text-xs font-mono-tech text-[var(--muted)] tabular-nums">${escHtml(ed.period)}</span>
              </div>
            `
          )
          .join("");

        parts.push(`
          <section class="resume-block space-y-2.5">
            <h3 class="text-base sm:text-lg font-bold text-[var(--text)] border-b border-[var(--border)] pb-1">Education</h3>
            ${edMarkup}
          </section>
        `);
      }

      // Certificates
      if (state.enabledSections.has("certificates")) {
        const certs = data.certificates
          .filter((c) => c.tags.some((t) => preset.certTags.includes(t)))
          .map(
            (c) =>
              `<li><strong class="text-[var(--text)]">${escHtml(c.title)}</strong> — ${escHtml(c.issuer)} (${escHtml(c.date)} · ID: <span class="font-mono-tech">${escHtml(c.credentialId)}</span>)</li>`
          )
          .join("");

        parts.push(`
          <section class="resume-block space-y-2.5">
            <h3 class="text-base sm:text-lg font-bold text-[var(--text)] border-b border-[var(--border)] pb-1">Certificates</h3>
            <ul class="space-y-1 text-xs sm:text-sm text-[var(--muted)] list-disc pl-5">${certs}</ul>
          </section>
        `);
      }

      // GitHub & Contact
      if (state.enabledSections.has("github") || state.enabledSections.has("contact")) {
        const twoCol = [];
        if (state.enabledSections.has("github")) {
          twoCol.push(`
            <section class="resume-block space-y-2">
              <h3 class="text-base sm:text-lg font-bold text-[var(--text)] border-b border-[var(--border)] pb-1">GitHub Profile</h3>
              <p class="text-xs sm:text-sm text-[var(--text-secondary)]">
                Handle: <span class="font-mono-tech font-semibold">@${escHtml(data.githubSummary.username)}</span>
              </p>
              ${
                data.githubSummary.featuredRepos.length > 0
                  ? `<p class="text-xs text-[var(--muted)]">Configured repositories: <span class="font-mono-tech">${escHtml(data.githubSummary.featuredRepos.join(", "))}</span></p>`
                  : ""
              }
              <a href="github.html" class="no-print inline-block text-xs font-semibold text-cyan-400 hover:underline">Open GitHub Explorer →</a>
            </section>
          `);
        }
        if (state.enabledSections.has("contact")) {
          twoCol.push(`
            <section class="resume-block space-y-2">
              <h3 class="text-base sm:text-lg font-bold text-[var(--text)] border-b border-[var(--border)] pb-1">Contact &amp; Languages</h3>
              <p class="text-xs sm:text-sm text-[var(--text-secondary)]">
                Email: <span class="font-mono-tech">${escHtml(data.profile.email)}</span> · Location: ${escHtml(data.profile.location)}
              </p>
              <ul class="space-y-0.5 text-xs sm:text-sm text-[var(--muted)]">
                ${data.languages.map((l) => `<li><strong class="text-[var(--text)]">${escHtml(l.name)}</strong> — ${escHtml(l.level)}</li>`).join("")}
              </ul>
            </section>
          `);
        }

        parts.push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-6">${twoCol.join("")}</div>`);
      }

      sheetEl.innerHTML = parts.join("");
      refreshIcons();
    }

    function renderAll() {
      renderRoleTabs();
      renderSectionToggles();
      renderResumeSheet();
    }

    if (compactBtn) {
      compactBtn.addEventListener("click", () => {
        state.compactMode = !state.compactMode;
        compactBtn.setAttribute("aria-pressed", state.compactMode ? "true" : "false");
        compactBtn.textContent = state.compactMode ? "Standard Spacing" : "Compact A4 Fit";
        renderResumeSheet();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.roleId = "developer";
        state.compactMode = false;
        state.enabledSections = new Set(ROLE_PRESETS.developer.sections);
        if (compactBtn) {
          compactBtn.setAttribute("aria-pressed", "false");
          compactBtn.textContent = "Compact A4 Fit";
        }
        renderAll();
        toast("Resume builder reset to Developer Resume.", "info");
      });
    }

    if (copyTextBtn) {
      copyTextBtn.addEventListener("click", async () => {
        const txt = buildPlainTextResume(getPreset(), state.enabledSections, data);
        const ok = await copyText(txt);
        if (ok) toast("Formatted plain-text resume copied.", "success");
      });
    }

    if (exportTextBtn) {
      exportTextBtn.addEventListener("click", () => {
        const preset = getPreset();
        const txt = buildPlainTextResume(preset, state.enabledSections, data);
        const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `AL_AMIN_${preset.id}_resume.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast(`Downloaded AL_AMIN_${preset.id}_resume.txt.`, "success");
      });
    }

    renderAll();
  }

  window.PortfolioResumeBuilder = {
    init,
    ROLE_PRESETS,
    SECTIONS_META,
    VERIFIED_EXPERIENCE,
    VERIFIED_EDUCATION,
    VERIFIED_CERTIFICATES,
    gatherCentralizedData,
    buildPlainTextResume
  };
})();
