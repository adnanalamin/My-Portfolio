/**
 * AL AMIN Portfolio — Main Application Entry (Phase 1 + Phase 2 + Phase 3)
 * Initializes global components, theme, navigation, feedback systems, and page modules.
 */

(() => {
  function bindConfigValues() {
    const config = window.portfolioConfig;
    if (!config) return;

    const fields = document.querySelectorAll("[data-config]");
    fields.forEach((node) => {
      const key = node.getAttribute("data-config");
      if (!key) return;

      const value = key.split(".").reduce((acc, part) => {
        if (acc && typeof acc === "object" && part in acc) {
          return acc[part];
        }
        return undefined;
      }, config);

      if (typeof value === "string" && value.trim() !== "") {
        node.textContent = value;
      }
    });
  }

  function bindResumeDownload() {
    const resumeLinks = document.querySelectorAll("[data-resume-download]");
    const config = window.portfolioConfig || {};
    const resumeHref = config.resumeUrl || "assets/documents/resume.pdf";

    resumeLinks.forEach((link) => {
      link.setAttribute("href", resumeHref);
      if (link.dataset.resumeBound === "true") return;
      link.dataset.resumeBound = "true";
      link.addEventListener("click", () => {
        if (typeof window.showToast === "function") {
          window.showToast("Downloading AL AMIN Resume (PDF)", "success");
        }
      });
    });
  }

  function escHtml(value) {
    if (typeof window.escapeHtml === "function") {
      return window.escapeHtml(value);
    }
    return String(value)
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

  function initServicesPage() {
    const root = document.getElementById("services-root");
    if (!root) return;

    const servicesData = [
      {
        slug: "full-stack-web-development",
        title: "Full-Stack Web Development",
        icon: "layers",
        summary: "End-to-end web applications engineered from responsive frontend interfaces to scalable server architectures and databases.",
        features: [
          "Frontend & backend unified architecture",
          "Clean RESTful data flow & validation",
          "Production deployment & CI readiness"
        ],
        provide: "Complete ownership of client UI, backend business logic, database modeling, and cloud deployment pipelines.",
        technology: ["HTML5", "CSS3", "Tailwind CSS", "JavaScript", "React", "Node.js", "MongoDB", "PostgreSQL"],
        process: "Requirement scoping, schema modeling, component-driven frontend build, API integration, and end-to-end QA.",
        deliverables: "Tested production repository, environment configuration, responsive UI across 320px–2560px, and deployment setup."
      },
      {
        slug: "mern-stack-development",
        title: "MERN Stack Development",
        icon: "database",
        summary: "Modern single-page and full-stack products powered by MongoDB, Express, React, and Node.js with predictable state management.",
        features: [
          "MongoDB & Mongoose schema design",
          "Express middleware & JWT auth",
          "React hooks & Redux state architecture"
        ],
        provide: "Custom MERN applications engineered for speed, modular maintainability, and real-time or high-concurrency workflows.",
        technology: ["MongoDB", "Mongoose", "Express", "React", "Redux", "Node.js", "REST API"],
        process: "Data modeling, API contract definition, modular Express controllers, React UI assembly, and load testing.",
        deliverables: "Full MERN codebase, Postman API collection, secure auth flows, and documented database schemas."
      },
      {
        slug: "frontend-development",
        title: "Frontend Development",
        icon: "code-2",
        summary: "Fast, accessible, and interactive client applications built with semantic markup, modern JavaScript, and React/Next.js.",
        features: [
          "Semantic HTML5 & WCAG accessibility",
          "Modular React & Next.js components",
          "Smooth compositor-only micro-interactions"
        ],
        provide: "Pixel-accurate frontend engineering focused on crisp typography, keyboard navigation, and zero layout shift.",
        technology: ["HTML5", "CSS3", "JavaScript", "React", "Next.js", "Tailwind CSS"],
        process: "Design token setup, reusable component library creation, state wiring, and cross-browser responsive audits.",
        deliverables: "Reusable component architecture, responsive styles, optimized assets, and clean interactive DOM logic."
      },
      {
        slug: "backend-api-development",
        title: "Backend API Development",
        icon: "server",
        summary: "Secure, well-structured REST APIs with authentication, role-based access control, validation, and reliable error handling.",
        features: [
          "Versioned REST endpoint architecture",
          "JWT & session authentication flows",
          "Input sanitization & rate limiting"
        ],
        provide: "Resilient server-side services, database integrations, webhook handlers, and third-party API connectors.",
        technology: ["Node.js", "Express", "MongoDB", "PostgreSQL", "JWT", "Postman"],
        process: "Endpoint specification, middleware security hardening, query optimization, and automated request verification.",
        deliverables: "Production API service, validation schemas, Postman documentation, and structured error handling."
      },
      {
        slug: "admin-dashboard-development",
        title: "Admin Dashboard Development",
        icon: "layout-dashboard",
        summary: "Data-rich operational portals featuring role permissions, sortable tables, analytics views, and streamlined CRUD workflows.",
        features: [
          "Role-based access & audit views",
          "Filterable tables & tabular metrics",
          "Responsive sidebar & mobile drawer UX"
        ],
        provide: "Custom internal tools and management consoles built to help teams monitor metrics and manage operations effortlessly.",
        technology: ["React", "Tailwind CSS", "Node.js", "Express", "MongoDB", "PostgreSQL"],
        process: "Workflow mapping, KPI layout hierarchy, API pagination/filtering integration, and usability verification.",
        deliverables: "Multi-role admin interface, export-ready data views, and protected administrative endpoints."
      },
      {
        slug: "ecommerce-development",
        title: "E-commerce Development",
        icon: "shopping-bag",
        summary: "Conversion-focused online storefronts with fast product discovery, persistent carts, checkout flows, and inventory control.",
        features: [
          "Filterable catalog & instant search",
          "Persistent cart & checkout validation",
          "Order tracking & inventory dashboard"
        ],
        provide: "Complete storefront and merchant management systems designed for smooth mobile shopping and fast checkout.",
        technology: ["React", "Next.js", "Node.js", "Express", "MongoDB", "REST API"],
        process: "Catalog modeling, cart/checkout state design, payment gateway integration, and mobile conversion testing.",
        deliverables: "Customer storefront, merchant admin panel, order lifecycle handlers, and responsive product templates."
      },
      {
        slug: "saas-development",
        title: "SaaS Development",
        icon: "rocket",
        summary: "Multi-tenant software platforms with onboarding flows, team workspaces, subscription readiness, and clean product UX.",
        features: [
          "Multi-tenant data isolation",
          "Workspace & team permission flows",
          "Scalable modular feature architecture"
        ],
        provide: "MVP-to-production SaaS engineering combining clean dashboard interfaces with dependable backend architecture.",
        technology: ["Next.js", "React", "Node.js", "Express", "MongoDB", "PostgreSQL", "Tailwind CSS"],
        process: "Product scoping, tenant architecture, core workflow build, billing/webhook wiring, and launch readiness.",
        deliverables: "SaaS web application, user onboarding flows, account settings, and scalable API foundation."
      },
      {
        slug: "website-redesign",
        title: "Website Redesign",
        icon: "refresh-cw",
        summary: "Transforming dated or cluttered websites into modern, cohesive digital experiences with stronger clarity and conversion.",
        features: [
          "Modern visual hierarchy & typography",
          "Mobile usability & navigation overhaul",
          "Cleaner CSS & faster asset loading"
        ],
        provide: "Complete visual and technical modernization while preserving existing brand equity and search rankings.",
        technology: ["HTML5", "CSS3", "Tailwind CSS", "JavaScript", "Figma", "SEO"],
        process: "UX & performance audit, wireframe refresh, design system upgrade, and seamless content migration.",
        deliverables: "Redesigned responsive pages, updated style architecture, redirect/SEO preservation, and speed improvements."
      },
      {
        slug: "responsive-web-design",
        title: "Responsive Web Design",
        icon: "smartphone",
        summary: "Mobile-first layouts engineered to adapt fluidly across phones, tablets, laptops, and ultra-wide monitors with zero overflow.",
        features: [
          "Tested from 320px to 2560px widths",
          "Touch-friendly 44px+ interactive targets",
          "Fluid clamp() typography & grids"
        ],
        provide: "Layouts crafted purposefully for mobile, tablet, and desktop breakpoints rather than shrinking desktop views.",
        technology: ["CSS3", "Tailwind CSS", "Flexbox", "CSS Grid", "HTML5"],
        process: "Mobile-first wireframing, breakpoint grid mapping, touch target auditing, and multi-viewport QA.",
        deliverables: "Zero-overflow responsive templates, fluid spacing tokens, and device-tested navigation patterns."
      },
      {
        slug: "performance-optimization",
        title: "Performance Optimization",
        icon: "gauge",
        summary: "Eliminating render bottlenecks, layout shifts, and heavy bundles so pages feel instantaneous across desktop and mobile networks.",
        features: [
          "Core Web Vitals & CLS reduction",
          "Compositor-only GPU animations",
          "Asset compression & lazy loading"
        ],
        provide: "Targeted profiling and refactoring of CSS, JavaScript execution, and media delivery for faster load and interaction times.",
        technology: ["JavaScript", "CSS3", "HTML5", "Browser DevTools", "Lighthouse"],
        process: "Baseline profiling, bottleneck isolation, script/asset optimization, and before/after benchmark verification.",
        deliverables: "Optimized bundle & media pipeline, reduced main-thread blocking, and documented speed audit."
      },
      {
        slug: "seo-friendly-development",
        title: "SEO-Friendly Development",
        icon: "search",
        summary: "Search-engine-ready site structure featuring clean semantic headings, structured metadata, fast crawlability, and social cards.",
        features: [
          "Semantic landmark & heading hierarchy",
          "Open Graph & meta tag architecture",
          "Clean URLs & fast initial render"
        ],
        provide: "Technical on-page SEO foundations baked directly into HTML structure, routing, and performance.",
        technology: ["HTML5", "Next.js", "Metadata APIs", "Open Graph", "Semantic Markup"],
        process: "Crawl & heading audit, metadata templating, internal linking structure, and mobile usability validation.",
        deliverables: "SEO-structured templates, social share tags, accessible markup, and clean sitemap/robots readiness."
      },
      {
        slug: "ui-ux-implementation",
        title: "UI/UX Implementation",
        icon: "pen-tool",
        summary: "Translating Figma concepts and product wireframes into living, interactive interfaces with meticulous attention to detail.",
        features: [
          "Figma-to-code component fidelity",
          "Dark & light theme token parity",
          "Keyboard focus & ARIA compliance"
        ],
        provide: "Accurate translation of visual mockups into maintainable code with thoughtful hover, focus, empty, and error states.",
        technology: ["Figma", "CSS3", "Tailwind CSS", "JavaScript", "React", "Lucide Icons"],
        process: "Design handoff review, token extraction, interactive state implementation, and visual QA pass.",
        deliverables: "Production UI components, interactive states, theme support, and accessible keyboard navigation."
      }
    ];

    const processSteps = [
      { step: "01", title: "Discovery", icon: "compass", summary: "Clarify business goals, target users, technical constraints, and success criteria." },
      { step: "02", title: "Planning", icon: "map", summary: "Define system architecture, data schemas, milestones, and responsive layout structure." },
      { step: "03", title: "Design", icon: "pen-tool", summary: "Establish visual tokens, component hierarchy, and interactive user flows." },
      { step: "04", title: "Development", icon: "code-2", summary: "Build modular frontend interfaces, backend APIs, and database integrations cleanly." },
      { step: "05", title: "Testing", icon: "check-circle-2", summary: "Verify responsiveness (320px–2560px), accessibility, edge cases, and zero console errors." },
      { step: "06", title: "Deployment", icon: "cloud-upload", summary: "Configure production environment, optimize assets, and ship with clean monitoring." },
      { step: "07", title: "Support", icon: "life-buoy", summary: "Provide post-launch refinements, feature iterations, and ongoing technical guidance." }
    ];

    const gridMount = document.getElementById("services-grid");
    const processMount = document.getElementById("work-process-timeline");
    const modalBackdrop = document.getElementById("service-modal-backdrop");
    const modalBody = document.getElementById("service-modal-body");
    const modalTitle = document.getElementById("service-modal-title");
    const modalCloseBtn = document.getElementById("service-modal-close");
    let lastTrigger = null;

    if (gridMount) {
      gridMount.innerHTML = servicesData
        .map((svc, idx) => {
          const delay = idx % 4 === 1 ? "delay-100" : idx % 4 === 2 ? "delay-200" : idx % 4 === 3 ? "delay-300" : "";
          const featureItems = svc.features
            .map(
              (f) => `
                <li class="flex items-start gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <i data-lucide="check" class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5"></i>
                  <span>${escHtml(f)}</span>
                </li>
              `
            )
            .join("");

          return `
            <article class="glass-card service-card hover-lift glow-effect p-6 flex flex-col justify-between gap-5 reveal ${delay}">
              <div class="space-y-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="service-icon-box" aria-hidden="true">
                    <i data-lucide="${escHtml(svc.icon)}" class="w-5 h-5"></i>
                  </div>
                  <span class="text-xs font-mono-tech text-[var(--muted)] tabular-nums">${String(idx + 1).padStart(2, "0")}</span>
                </div>

                <div class="space-y-2">
                  <h2 class="text-lg sm:text-xl font-bold text-[var(--text)]">${escHtml(svc.title)}</h2>
                  <p class="text-sm text-[var(--muted)] leading-relaxed">${escHtml(svc.summary)}</p>
                </div>

                <ul class="space-y-1.5 list-none p-0 m-0 pt-1">
                  ${featureItems}
                </ul>
              </div>

              <div class="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  class="primary-button text-xs sm:text-sm py-2 px-4 min-h-[40px]"
                  data-service-open="${escHtml(svc.slug)}"
                >
                  <span>Service Details</span>
                  <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
                </button>
                <a
                  href="contact.html?service=${encodeURIComponent(svc.slug)}"
                  class="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-cyan-400 transition-colors"
                >
                  Request a Quote
                </a>
              </div>
            </article>
          `;
        })
        .join("");
    }

    if (processMount) {
      processMount.innerHTML = processSteps
        .map((item, idx) => {
          const delay = idx % 4 === 1 ? "delay-100" : idx % 4 === 2 ? "delay-200" : idx % 4 === 3 ? "delay-300" : "";
          return `
            <article class="process-step reveal ${delay}">
              <div class="process-node tabular-nums">${escHtml(item.step)}</div>
              <div class="glass-card hover-lift p-5 space-y-2 h-full">
                <div class="flex items-center justify-between gap-2">
                  <h3 class="text-base sm:text-lg font-bold text-[var(--text)]">${escHtml(item.title)}</h3>
                  <i data-lucide="${escHtml(item.icon)}" class="w-4 h-4 text-indigo-400 shrink-0"></i>
                </div>
                <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escHtml(item.summary)}</p>
              </div>
            </article>
          `;
        })
        .join("");
    }

    function closeModal() {
      if (!modalBackdrop) return;
      modalBackdrop.classList.remove("is-open");
      modalBackdrop.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
      if (lastTrigger && typeof lastTrigger.focus === "function") {
        lastTrigger.focus();
      }
    }

    function openModal(slug, triggerEl) {
      const svc = servicesData.find((item) => item.slug === slug);
      if (!svc || !modalBackdrop || !modalBody || !modalTitle) return;

      lastTrigger = triggerEl || null;
      modalTitle.textContent = svc.title;
      const techList = svc.technology.map((t) => `<span class="tech-badge-item">${escHtml(t)}</span>`).join("");

      modalBody.innerHTML = `
        <div class="space-y-6">
          <p class="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">${escHtml(svc.summary)}</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="card p-4 sm:p-5 space-y-2">
              <h3 class="text-sm font-bold text-indigo-400">What I provide</h3>
              <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escHtml(svc.provide)}</p>
            </div>
            <div class="card p-4 sm:p-5 space-y-2">
              <h3 class="text-sm font-bold text-cyan-400">Process</h3>
              <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escHtml(svc.process)}</p>
            </div>
          </div>

          <div class="space-y-2.5">
            <h3 class="text-sm font-bold text-[var(--text)]">Technology</h3>
            <div class="flex flex-wrap gap-2">${techList}</div>
          </div>

          <div class="card p-4 sm:p-5 space-y-2">
            <h3 class="text-sm font-bold text-violet-400">Deliverables</h3>
            <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escHtml(svc.deliverables)}</p>
          </div>

          <div class="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <a href="contact.html?service=${encodeURIComponent(svc.slug)}" class="primary-button w-full sm:w-auto">
              <span>Request a Quote</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
            <button type="button" class="secondary-button w-full sm:w-auto" data-modal-dismiss>
              Close Details
            </button>
          </div>
        </div>
      `;

      modalBackdrop.classList.add("is-open");
      modalBackdrop.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");

      refreshIcons();

      const dismissBtn = modalBody.querySelector("[data-modal-dismiss]");
      if (dismissBtn) {
        dismissBtn.addEventListener("click", closeModal);
      }

      if (modalCloseBtn) {
        window.setTimeout(() => modalCloseBtn.focus(), 40);
      }
    }

    if (gridMount) {
      gridMount.querySelectorAll("[data-service-open]").forEach((btn) => {
        btn.addEventListener("click", () => {
          openModal(btn.getAttribute("data-service-open"), btn);
        });
      });
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", closeModal);
    }

    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", (event) => {
        if (event.target === modalBackdrop) {
          closeModal();
        }
      });
    }

    if (!initServicesPage.keyBound) {
      initServicesPage.keyBound = true;
      document.addEventListener("keydown", (event) => {
        if (!modalBackdrop || !modalBackdrop.classList.contains("is-open")) return;
        if (event.key === "Escape") {
          closeModal();
        } else if (event.key === "Tab" && typeof window.trapDialogFocus === "function") {
          window.trapDialogFocus(modalBackdrop, event);
        }
      });
    }
  }

  function initExperiencePage() {
    const root = document.getElementById("experience-root");
    if (!root) return;

    const timelineItems = [
      {
        section: "Work Experience",
        date: "2025 – Present",
        title: "Full-Stack MERN Developer",
        organization: "Independent Product Studio",
        icon: "briefcase",
        description:
          "Architecting and shipping full-stack web applications, SaaS analytics portals, and RESTful APIs with React, Next.js, Node.js, Express, and MongoDB.",
        skills: ["React", "Next.js", "Node.js", "Express", "MongoDB", "Tailwind CSS"]
      },
      {
        section: "Work Experience",
        date: "2024 – 2025",
        title: "Frontend & UI Engineer",
        organization: "Digital Web Solutions",
        icon: "layout",
        description:
          "Built responsive component systems, converted Figma prototypes into accessible production UI, and improved Core Web Vitals across client web apps.",
        skills: ["HTML5", "CSS3", "JavaScript", "React", "Figma", "Performance"]
      },
      {
        section: "Freelance",
        date: "2023 – Present",
        title: "Freelance Web Developer & UI Designer",
        organization: "Fiverr, Upwork & Direct Clients",
        icon: "globe",
        description:
          "Partnered with startups and founders to deliver custom websites, e-commerce storefronts, admin dashboards, and SEO-friendly responsive redesigns.",
        skills: ["MERN Stack", "E-commerce", "REST API", "Responsive Design", "SEO"]
      },
      {
        section: "Education",
        date: "2021 – 2025",
        title: "B.Sc. in Computer Science & Engineering",
        organization: "University Studies · Bangladesh",
        icon: "graduation-cap",
        description:
          "Focused on software engineering principles, algorithms, data structures, relational/non-relational databases, and web architecture.",
        skills: ["Data Structures", "Algorithms", "DBMS", "Software Engineering"]
      },
      {
        section: "Learning Journey",
        date: "2022 – Present",
        title: "Modern Full-Stack & Cloud Craft",
        organization: "Continuous Self-Directed Mastery",
        icon: "sparkles",
        description:
          "Deepened practical skills in JWT authentication, PostgreSQL, Mongoose modeling, multi-tenant SaaS patterns, accessibility, and automated testing.",
        skills: ["TypeScript", "PostgreSQL", "Mongoose", "JWT Auth", "Git", "Security"]
      }
    ];

    const sections = ["All", "Work Experience", "Freelance", "Education", "Learning Journey"];
    let activeSection = "All";

    const tabsMount = document.getElementById("experience-filter-tabs");
    const timelineMount = document.getElementById("experience-timeline-grid");
    const countEl = document.getElementById("experience-count");

    function renderTabs() {
      if (!tabsMount) return;
      tabsMount.setAttribute("role", "tablist");
      tabsMount.innerHTML = sections
        .map((sec) => {
          const isActive = activeSection === sec;
          return `
            <button
              type="button"
              role="tab"
              aria-selected="${isActive ? "true" : "false"}"
              data-exp-section="${escHtml(sec)}"
              class="skill-tab-btn ${isActive ? "is-active" : ""}"
            >
              ${escHtml(sec)}
            </button>
          `;
        })
        .join("");

      tabsMount.querySelectorAll("[data-exp-section]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const next = btn.getAttribute("data-exp-section") || "All";
          if (next === activeSection) return;
          activeSection = next;
          renderTabs();
          renderTimeline(true);
        });
      });
    }

    function renderTimeline(animate = false) {
      if (!timelineMount) return;

      const filtered =
        activeSection === "All"
          ? timelineItems
          : timelineItems.filter((item) => item.section === activeSection);

      if (countEl) {
        countEl.textContent = `${filtered.length} ${filtered.length === 1 ? "milestone" : "milestones"}`;
      }

      timelineMount.innerHTML = filtered
        .map((item, idx) => {
          const animClass = animate ? "skill-card-enter" : "reveal";
          const delayStyle = animate ? `style="--card-delay: ${idx * 40}ms;"` : "";
          const skillTags = item.skills
            .map((s) => `<span class="tech-badge-item text-xs py-1 px-2.5">${escHtml(s)}</span>`)
            .join("");

          return `
            <article class="exp-item ${animClass}" ${delayStyle}>
              <div class="exp-node" aria-hidden="true">
                <i data-lucide="${escHtml(item.icon)}" class="w-4 h-4"></i>
              </div>
              <div class="glass-card hover-lift p-5 sm:p-6 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span class="font-semibold text-indigo-400">${escHtml(item.section)}</span>
                  <span class="font-mono-tech text-[var(--muted)] tabular-nums">${escHtml(item.date)}</span>
                </div>

                <div class="space-y-1">
                  <h2 class="text-lg sm:text-xl font-bold text-[var(--text)]">${escHtml(item.title)}</h2>
                  <p class="text-xs sm:text-sm font-medium text-cyan-400">${escHtml(item.organization)}</p>
                </div>

                <p class="text-sm text-[var(--muted)] leading-relaxed">${escHtml(item.description)}</p>

                <div class="flex flex-wrap gap-1.5 pt-1">${skillTags}</div>
              </div>
            </article>
          `;
        })
        .join("");

      refreshIcons();
      if (!animate && window.PortfolioAnimations) {
        window.PortfolioAnimations.initScrollReveal();
      }
    }

    renderTabs();
    renderTimeline(false);
  }

  function initCertificatesPage() {
    const root = document.getElementById("certificates-root");
    if (!root) return;

    const certificatesData = [
      {
        id: "cert-fullstack-mern",
        title: "Full-Stack MERN Web Development",
        category: "Full-Stack",
        issuer: "Engineering Bootcamp & Applied Labs",
        date: "2025",
        credentialId: "MERN-2025-01",
        image: "assets/images/certificates/fullstack-mern.svg",
        downloadFile: "AL_AMIN_FullStack_MERN_Certificate.svg",
        description:
          "Completed intensive full-stack engineering training covering MongoDB data modeling, Express REST APIs, React UI architecture, and Node.js deployment.",
        skills: ["MongoDB", "Express", "React", "Node.js", "JWT Auth", "REST API"]
      },
      {
        id: "cert-frontend-react",
        title: "React & Frontend Architecture",
        category: "Frontend",
        issuer: "Modern Web Engineering Track",
        date: "2024",
        credentialId: "FE-2024-08",
        image: "assets/images/certificates/frontend-react.svg",
        downloadFile: "AL_AMIN_Frontend_React_Certificate.svg",
        description:
          "Focused on modern ES2024 JavaScript, React component composition, Redux state workflows, and clean modular CSS systems.",
        skills: ["HTML5", "CSS3", "JavaScript", "React", "Redux", "Tailwind CSS"]
      },
      {
        id: "cert-backend-api",
        title: "Node.js API & Database Systems",
        category: "Backend",
        issuer: "Backend Architecture Specialization",
        date: "2025",
        credentialId: "BE-2025-04",
        image: "assets/images/certificates/backend-api.svg",
        downloadFile: "AL_AMIN_Backend_API_Certificate.svg",
        description:
          "Verified mastery of scalable Express services, Mongoose schemas, PostgreSQL relational queries, validation, and API security.",
        skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "Postman", "Security"]
      },
      {
        id: "cert-responsive-ui",
        title: "Responsive Web & UI Systems",
        category: "UI/UX",
        issuer: "Design Systems & Accessibility Program",
        date: "2024",
        credentialId: "UI-2024-11",
        image: "assets/images/certificates/responsive-ui.svg",
        downloadFile: "AL_AMIN_Responsive_UI_Certificate.svg",
        description:
          "Built multi-breakpoint responsive layouts (320px–2560px), accessible keyboard navigation, and dark/light design tokens.",
        skills: ["Responsive Design", "Figma", "CSS Grid", "WCAG", "Performance"]
      }
    ];

    const categories = ["All", "Full-Stack", "Frontend", "Backend", "UI/UX"];
    let activeCat = "All";
    let searchQuery = "";

    const tabsMount = document.getElementById("cert-filter-tabs");
    const gridMount = document.getElementById("certificates-grid");
    const countEl = document.getElementById("cert-results-count");
    const searchInput = document.getElementById("cert-search-input");
    const searchClear = document.getElementById("cert-search-clear");

    const lightbox = document.getElementById("cert-lightbox");
    const lightboxImg = document.getElementById("cert-lightbox-image");
    const lightboxCaption = document.getElementById("cert-lightbox-caption");
    const lightboxDownload = document.getElementById("cert-lightbox-download");
    const lightboxClose = document.getElementById("cert-lightbox-close");
    const lightboxPrev = document.getElementById("cert-lightbox-prev");
    const lightboxNext = document.getElementById("cert-lightbox-next");

    const detailsModal = document.getElementById("cert-details-modal");
    const detailsTitle = document.getElementById("cert-details-title");
    const detailsBody = document.getElementById("cert-details-body");
    const detailsClose = document.getElementById("cert-details-close");

    let currentFiltered = certificatesData.slice();
    let lightboxIdx = 0;
    let lastFocus = null;

    function getFilteredCerts() {
      return certificatesData.filter((cert) => {
        const matchCat = activeCat === "All" || cert.category === activeCat;
        if (!matchCat) return false;
        if (!searchQuery) return true;
        const hay = [cert.title, cert.category, cert.issuer, cert.credentialId, ...cert.skills]
          .join(" ")
          .toLowerCase();
        return hay.includes(searchQuery);
      });
    }

    function renderTabs() {
      if (!tabsMount) return;
      tabsMount.setAttribute("role", "tablist");
      tabsMount.innerHTML = categories
        .map((cat) => {
          const isActive = activeCat === cat;
          return `
            <button
              type="button"
              role="tab"
              aria-selected="${isActive ? "true" : "false"}"
              data-cert-cat="${escHtml(cat)}"
              class="skill-tab-btn ${isActive ? "is-active" : ""}"
            >
              ${escHtml(cat)}
            </button>
          `;
        })
        .join("");

      tabsMount.querySelectorAll("[data-cert-cat]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const next = btn.getAttribute("data-cert-cat") || "All";
          if (next === activeCat) return;
          activeCat = next;
          renderTabs();
          renderGrid(true);
        });
      });
    }

    function openLightbox(idx, trigger) {
      if (!lightbox || !lightboxImg || currentFiltered.length === 0) return;
      lastFocus = trigger || null;
      lightboxIdx = (idx + currentFiltered.length) % currentFiltered.length;
      const cert = currentFiltered[lightboxIdx];
      lightboxImg.src = cert.image;
      lightboxImg.alt = `${cert.title} certificate`;
      if (lightboxCaption) lightboxCaption.textContent = `${cert.title} · ${cert.credentialId}`;
      if (lightboxDownload) {
        lightboxDownload.href = cert.image;
        lightboxDownload.setAttribute("download", cert.downloadFile);
      }
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
      if (lightboxClose) window.setTimeout(() => lightboxClose.focus(), 40);
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    function openDetails(certId, trigger) {
      const cert = certificatesData.find((c) => c.id === certId);
      if (!cert || !detailsModal || !detailsBody || !detailsTitle) return;
      lastFocus = trigger || null;
      detailsTitle.textContent = cert.title;

      const skillsChips = cert.skills
        .map((s) => `<span class="tech-badge-item">${escHtml(s)}</span>`)
        .join("");

      detailsBody.innerHTML = `
        <div class="space-y-5">
          <div class="rounded-xl overflow-hidden border border-[var(--border)]">
            <img src="${escHtml(cert.image)}" alt="${escHtml(cert.title)}" class="w-full aspect-[4/3] object-cover">
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div class="card p-3.5">
              <p class="text-[var(--muted)]">Issuer</p>
              <p class="font-semibold text-[var(--text)] mt-0.5">${escHtml(cert.issuer)}</p>
            </div>
            <div class="card p-3.5">
              <p class="text-[var(--muted)]">Issued</p>
              <p class="font-semibold text-[var(--text)] tabular-nums mt-0.5">${escHtml(cert.date)}</p>
            </div>
            <div class="card p-3.5">
              <p class="text-[var(--muted)]">Credential ID</p>
              <p class="font-mono-tech font-semibold text-indigo-400 mt-0.5">${escHtml(cert.credentialId)}</p>
            </div>
          </div>
          <p class="text-sm text-[var(--muted)] leading-relaxed">${escHtml(cert.description)}</p>
          <div class="space-y-2">
            <h3 class="text-sm font-bold text-[var(--text)]">Covered Skills</h3>
            <div class="flex flex-wrap gap-2">${skillsChips}</div>
          </div>
          <div class="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <a
              href="${escHtml(cert.image)}"
              download="${escHtml(cert.downloadFile)}"
              data-cert-download
              class="primary-button w-full sm:w-auto"
            >
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>Download Certificate</span>
            </a>
            <button type="button" class="secondary-button w-full sm:w-auto" data-cert-modal-dismiss>
              Close
            </button>
          </div>
        </div>
      `;

      detailsModal.classList.add("is-open");
      detailsModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
      refreshIcons();

      const dismiss = detailsBody.querySelector("[data-cert-modal-dismiss]");
      if (dismiss) dismiss.addEventListener("click", closeDetails);
      detailsBody.querySelectorAll("[data-cert-download]").forEach((dl) => {
        dl.addEventListener("click", () => {
          if (typeof window.showToast === "function") {
            window.showToast(`Downloading ${cert.title}`, "success");
          }
        });
      });

      if (detailsClose) window.setTimeout(() => detailsClose.focus(), 40);
    }

    function closeDetails() {
      if (!detailsModal) return;
      detailsModal.classList.remove("is-open");
      detailsModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    function renderGrid(animate = false) {
      if (!gridMount) return;
      currentFiltered = getFilteredCerts();

      if (countEl) {
        countEl.textContent = `${currentFiltered.length} ${currentFiltered.length === 1 ? "certificate" : "certificates"}`;
      }

      if (currentFiltered.length === 0) {
        gridMount.innerHTML = `
          <div class="glass-card p-8 text-center space-y-4 col-span-full">
            <i data-lucide="award" class="w-8 h-8 text-indigo-400 mx-auto"></i>
            <p class="text-sm text-[var(--muted)]">No certificates match your current filter or search query.</p>
            <button type="button" id="cert-reset-btn" class="secondary-button mx-auto">Reset Filters</button>
          </div>
        `;
        const resetBtn = document.getElementById("cert-reset-btn");
        if (resetBtn) {
          resetBtn.addEventListener("click", () => {
            activeCat = "All";
            searchQuery = "";
            if (searchInput) searchInput.value = "";
            if (searchClear) searchClear.classList.add("hidden");
            renderTabs();
            renderGrid(true);
          });
        }
        refreshIcons();
        return;
      }

      gridMount.innerHTML = currentFiltered
        .map((cert, idx) => {
          const animClass = animate ? "skill-card-enter" : "reveal";
          const delayStyle = animate ? `style="--card-delay: ${idx * 35}ms;"` : "";
          return `
            <article class="glass-card project-card hover-lift flex flex-col justify-between overflow-hidden ${animClass}" ${delayStyle}>
              <div>
                <button
                  type="button"
                  class="project-media-box w-full text-left cursor-pointer border-0 p-0 block"
                  data-cert-lightbox="${idx}"
                  aria-label="Preview ${escHtml(cert.title)} in lightbox"
                >
                  <img src="${escHtml(cert.image)}" alt="${escHtml(cert.title)} certificate" loading="lazy" class="w-full h-full object-cover">
                  <div class="project-media-gradient"></div>
                  <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                    <span class="font-semibold">${escHtml(cert.category)}</span>
                    <span class="tabular-nums">${escHtml(cert.date)}</span>
                  </div>
                </button>

                <div class="p-5 space-y-2">
                  <h2 class="text-lg font-bold text-[var(--text)]">${escHtml(cert.title)}</h2>
                  <p class="text-xs text-[var(--muted)]">${escHtml(cert.issuer)} · <span class="font-mono-tech text-indigo-400">${escHtml(cert.credentialId)}</span></p>
                </div>
              </div>

              <div class="px-5 pb-5 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  class="primary-button text-xs py-2 px-3.5 min-h-[38px]"
                  data-cert-details="${escHtml(cert.id)}"
                >
                  <span>Details</span>
                </button>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="outline-button text-xs py-2 px-3 min-h-[38px]"
                    data-cert-lightbox="${idx}"
                    aria-label="Open lightbox for ${escHtml(cert.title)}"
                  >
                    <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
                    <span>View</span>
                  </button>
                  <a
                    href="${escHtml(cert.image)}"
                    download="${escHtml(cert.downloadFile)}"
                    data-cert-download
                    class="outline-button text-xs py-2 px-3 min-h-[38px]"
                    aria-label="Download ${escHtml(cert.title)}"
                  >
                    <i data-lucide="download" class="w-3.5 h-3.5"></i>
                  </a>
                </div>
              </div>
            </article>
          `;
        })
        .join("");

      gridMount.querySelectorAll("[data-cert-lightbox]").forEach((btn) => {
        btn.addEventListener("click", () => {
          openLightbox(Number(btn.getAttribute("data-cert-lightbox") || "0"), btn);
        });
      });

      gridMount.querySelectorAll("[data-cert-details]").forEach((btn) => {
        btn.addEventListener("click", () => {
          openDetails(btn.getAttribute("data-cert-details"), btn);
        });
      });

      gridMount.querySelectorAll("[data-cert-download]").forEach((dl) => {
        dl.addEventListener("click", () => {
          if (typeof window.showToast === "function") {
            window.showToast("Downloading certificate", "success");
          }
        });
      });

      refreshIcons();
      if (!animate && window.PortfolioAnimations) {
        window.PortfolioAnimations.initScrollReveal();
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value.trim().toLowerCase();
        if (searchClear) searchClear.classList.toggle("hidden", searchQuery === "");
        renderGrid(true);
      });
    }

    if (searchClear) {
      searchClear.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
        }
        searchQuery = "";
        searchClear.classList.add("hidden");
        renderGrid(true);
      });
    }

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxPrev) {
      lightboxPrev.addEventListener("click", () => openLightbox(lightboxIdx - 1, lightboxPrev));
    }
    if (lightboxNext) {
      lightboxNext.addEventListener("click", () => openLightbox(lightboxIdx + 1, lightboxNext));
    }
    if (lightbox) {
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
      });
    }

    if (detailsClose) detailsClose.addEventListener("click", closeDetails);
    if (detailsModal) {
      detailsModal.addEventListener("click", (e) => {
        if (e.target === detailsModal) closeDetails();
      });
    }

    if (!initCertificatesPage.keyBound) {
      initCertificatesPage.keyBound = true;
      document.addEventListener("keydown", (event) => {
        const lightboxOpen = lightbox && lightbox.classList.contains("is-open");
        const detailsOpen = detailsModal && detailsModal.classList.contains("is-open");
        if (!lightboxOpen && !detailsOpen) return;

        if (event.key === "Escape") {
          if (lightboxOpen) closeLightbox();
          if (detailsOpen) closeDetails();
        } else if (lightboxOpen) {
          if (event.key === "ArrowLeft") openLightbox(lightboxIdx - 1);
          else if (event.key === "ArrowRight") openLightbox(lightboxIdx + 1);
          else if (event.key === "Tab" && typeof window.trapDialogFocus === "function") {
            window.trapDialogFocus(lightbox, event);
          }
        } else if (detailsOpen && event.key === "Tab" && typeof window.trapDialogFocus === "function") {
          window.trapDialogFocus(detailsModal, event);
        }
      });
    }

    renderTabs();
    renderGrid(false);
  }

  function initResumePage() {
    const printBtn = document.getElementById("print-resume-btn");
    if (!printBtn) return;

    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  function initTablistKeyboardNav() {
    if (initTablistKeyboardNav.bound) return;
    initTablistKeyboardNav.bound = true;

    document.addEventListener("keydown", (event) => {
      const targetTab = event.target && event.target.closest ? event.target.closest('[role="tab"]') : null;
      if (!targetTab) return;
      const tablist = targetTab.closest('[role="tablist"]');
      if (!tablist) return;

      const tabs = Array.from(tablist.querySelectorAll('[role="tab"]:not([disabled])'));
      const currentIdx = tabs.indexOf(targetTab);
      if (currentIdx === -1 || tabs.length < 2) return;

      let nextIdx = -1;
      if (event.key === "ArrowRight") {
        nextIdx = (currentIdx + 1) % tabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIdx = 0;
      } else if (event.key === "End") {
        nextIdx = tabs.length - 1;
      }

      if (nextIdx >= 0) {
        event.preventDefault();
        tabs[nextIdx].click();
        const refreshed = tablist.querySelectorAll('[role="tab"]:not([disabled])')[nextIdx];
        if (refreshed && typeof refreshed.focus === "function") {
          refreshed.focus();
        }
      }
    });
  }

  function bootstrap() {
    if (typeof window.initTheme === "function") window.initTheme();
    if (window.PortfolioBrand && typeof window.PortfolioBrand.init === "function") {
      window.PortfolioBrand.init();
    }
    if (typeof window.initLoader === "function") window.initLoader();
    if (typeof window.loadNavbar === "function") window.loadNavbar();
    if (typeof window.initMobileMenu === "function") window.initMobileMenu();
    if (typeof window.loadFooter === "function") window.loadFooter();
    if (typeof window.initScrollProgress === "function") window.initScrollProgress();
    if (typeof window.initBackToTop === "function") window.initBackToTop();
    if (typeof window.initPageTransitions === "function") window.initPageTransitions();
    if (window.PortfolioModes) window.PortfolioModes.init();

    if (window.PortfolioProjects) window.PortfolioProjects.init();
    if (window.PortfolioSkills) window.PortfolioSkills.init();
    if (window.PortfolioSkillsGraph) window.PortfolioSkillsGraph.init();
    if (window.PortfolioJourney) window.PortfolioJourney.init();
    if (window.PortfolioBlog) window.PortfolioBlog.init();
    if (window.PortfolioTestimonials) window.PortfolioTestimonials.init();
    if (window.PortfolioContact) window.PortfolioContact.init();
    if (window.PortfolioDashboard) window.PortfolioDashboard.init();
    if (window.PortfolioGitHub) window.PortfolioGitHub.init();
    if (window.PortfolioPlayground) window.PortfolioPlayground.init();
    if (window.PortfolioExplorer) window.PortfolioExplorer.init();
    if (window.PortfolioArchitect) window.PortfolioArchitect.init();
    if (window.PortfolioEstimator) window.PortfolioEstimator.init();
    if (window.PortfolioRequest) window.PortfolioRequest.init();
    if (window.PortfolioBuild) window.PortfolioBuild.init();
    if (window.PortfolioDecisions) window.PortfolioDecisions.init();
    if (window.PortfolioSecurity) window.PortfolioSecurity.init();
    if (window.PortfolioPerformance) window.PortfolioPerformance.init();
    if (window.PortfolioSystemArchitecture) window.PortfolioSystemArchitecture.init();
    if (window.PortfolioApiExplorer) window.PortfolioApiExplorer.init();
    if (window.PortfolioComponentLab) window.PortfolioComponentLab.init();
    if (window.PortfolioDesignPlayground) window.PortfolioDesignPlayground.init();
    if (window.PortfolioProposalGenerator) window.PortfolioProposalGenerator.init();
    if (window.PortfolioResumeBuilder) window.PortfolioResumeBuilder.init();
    if (window.PortfolioRecruiterSearch) window.PortfolioRecruiterSearch.init();
    if (window.PortfolioKnowledge) window.PortfolioKnowledge.init();
    if (window.PortfolioOpenSourceHub) window.PortfolioOpenSourceHub.init();
    if (window.PortfolioOffice) window.PortfolioOffice.init();
    if (window.PortfolioWorkspace) window.PortfolioWorkspace.init();
    if (window.PortfolioTour) window.PortfolioTour.init();
    if (window.PortfolioCareerAssistant) window.PortfolioCareerAssistant.init();
    if (window.PortfolioRequirementAnalyzer) window.PortfolioRequirementAnalyzer.init();
    if (window.PortfolioResumeMatcher) window.PortfolioResumeMatcher.init();
    if (window.PortfolioDependencyMap) window.PortfolioDependencyMap.init();
    if (window.PortfolioGitHubUniverse) window.PortfolioGitHubUniverse.init();
    if (window.PortfolioCodingActivity) window.PortfolioCodingActivity.init();
    if (window.PortfolioSystemMonitor) window.PortfolioSystemMonitor.init();
    if (window.PortfolioTerminalEngine) {
      window.PortfolioTerminalEngine.init();
    } else if (typeof document !== "undefined") {
      if (!document.querySelector('link[href="css/terminal.css"]')) {
        const tLink = document.createElement("link");
        tLink.rel = "stylesheet";
        tLink.href = "css/terminal.css";
        document.head.appendChild(tLink);
      }
      const tScript = document.createElement("script");
      tScript.src = "js/terminal.js";
      tScript.onload = () => {
        if (window.PortfolioTerminalEngine) window.PortfolioTerminalEngine.init();
      };
      document.body.appendChild(tScript);
    }
    if (window.PortfolioAssistant) window.PortfolioAssistant.init();
    if (window.PortfolioUX) window.PortfolioUX.init();
    initServicesPage();
    initExperiencePage();
    initCertificatesPage();
    initResumePage();
    initTablistKeyboardNav();

    bindConfigValues();
    bindResumeDownload();
    if (window.PortfolioBrand) {
      if (typeof window.PortfolioBrand.bindBrandDom === "function") {
        window.PortfolioBrand.bindBrandDom(document);
      }
      if (typeof window.PortfolioBrand.mountSignatures === "function") {
        window.PortfolioBrand.mountSignatures(document);
      }
    }
    refreshIcons();

    if (window.PortfolioAnimations) {
      window.PortfolioAnimations.init();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
