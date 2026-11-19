/**
 * AL AMIN Portfolio — Phase 17: Interactive Rule-Based Portfolio Assistant
 * Conversational guide grounded in portfolio data (config, projects, skills,
 * services, experience, testimonials, resume, and contact info).
 *
 * Future AI Integration Note:
 * Static mode uses deterministic rule-based intent matching & keyword search.
 * Never store private LLM/OpenAI API keys in client JavaScript. To connect a
 * real AI model later, point `portfolioConfig.assistant.backendEndpoint` to a
 * secure server route (e.g. "/api/assistant") and switch `mode` to "backend".
 */

const PortfolioAssistant = (() => {
  const STORAGE_KEY = "alamin_portfolio_assistant_history_v1";
  const MAX_HISTORY_ITEMS = 40;
  const MAX_QUERY_LENGTH = 600;

  const quickPrompts = [
    "Who is Al Amin?",
    "What technologies does he use?",
    "What projects has he built?",
    "What services does he offer?",
    "Can I hire him?",
    "Is he available for freelance work?",
    "How can I contact him?",
    "Where can I find his GitHub?",
    "Can I download his resume?"
  ];

  // Canonical synchronized knowledge base complementing live window.portfolio* objects
  const fallbackKnowledge = {
    projects: [
      {
        id: "astrapulse",
        title: "AstraPulse",
        category: "SaaS",
        technologies: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "REST API"],
        description: "Real-time full-stack telemetry and product analytics workspace for monitoring API latency, funnels, and uptime."
      },
      {
        id: "nexora",
        title: "Nexora",
        category: "E-commerce",
        technologies: ["MongoDB", "Express", "React", "Redux", "Node.js", "Tailwind CSS"],
        description: "Modular headless commerce storefront and instant slide-over checkout drawer with filterable product discovery."
      },
      {
        id: "slideverse",
        title: "SLIDEVERSE",
        category: "UI/UX",
        technologies: ["JavaScript", "HTML5", "CSS3", "React", "Tailwind CSS", "Node.js"],
        description: "Interactive browser-based presentation studio with live typography controls and keyboard presentation mode."
      },
      {
        id: "school-management-system",
        title: "School Management System",
        category: "Dashboard",
        technologies: ["MongoDB", "Mongoose", "Express", "React", "Node.js", "Tailwind CSS"],
        description: "Role-based academic operations portal handling student directories, weekly attendance, and GPA analytics."
      },
      {
        id: "portfolio-system",
        title: "Portfolio System",
        category: "Web Apps",
        technologies: ["HTML5", "CSS3", "Tailwind CSS", "JavaScript", "SEO", "Responsive Design"],
        description: "Zero-framework config-driven multi-page portfolio architecture with dark/light themes, dashboard, GitHub explorer, and sandbox."
      },
      {
        id: "ecommerce-saas",
        title: "E-commerce SaaS",
        category: "SaaS",
        technologies: ["Next.js", "React", "Node.js", "Express", "MongoDB", "PostgreSQL"],
        description: "Multi-tenant merchant storefront builder and revenue analytics console with PostgreSQL order ledgers."
      }
    ],
    skillsByGroup: {
      Frontend: ["HTML5", "CSS3", "Tailwind CSS", "JavaScript (ES2024)", "React", "Redux", "Next.js"],
      Backend: ["Node.js", "Express", "REST API", "JWT & Session Authentication"],
      Database: ["MongoDB", "Mongoose ODM", "PostgreSQL"],
      "Tools & Design": ["Git", "GitHub", "VS Code", "Postman", "Figma", "UI Architecture", "Design Systems"],
      Quality: ["SEO", "Responsive Design (320px–2560px)", "Web Security", "Performance"]
    },
    services: [
      "Full-Stack Web Development",
      "MERN Stack Development",
      "Frontend Development",
      "Backend API Development",
      "Admin Dashboard Development",
      "E-commerce Development",
      "SaaS Development",
      "Website Redesign",
      "Responsive Web Design",
      "Performance Optimization",
      "SEO-Friendly Development",
      "UI/UX Implementation"
    ],
    experience: [
      {
        title: "Full-Stack MERN Developer",
        organization: "Independent Product Studio",
        date: "2025 – Present",
        summary: "Architecting full-stack SaaS analytics, commerce, and presentation web platforms with React, Next.js, Node.js, Express, and MongoDB."
      },
      {
        title: "Frontend & UI Engineer",
        organization: "Digital Web Solutions",
        date: "2024 – 2025",
        summary: "Built responsive component systems, converted Figma prototypes into accessible production UI, and improved Core Web Vitals."
      },
      {
        title: "Freelance Web Developer & UI Designer",
        organization: "Fiverr, Upwork & Direct Clients",
        date: "2023 – Present",
        summary: "Delivered custom storefronts, admin dashboards, and SEO-friendly responsive website redesigns."
      },
      {
        title: "B.Sc. in Computer Science & Engineering",
        organization: "University Studies · Bangladesh",
        date: "2021 – 2025",
        summary: "Focused on software engineering, algorithms, data structures, and relational/non-relational DBMS."
      }
    ],
    certificates: [
      "Full-Stack MERN Web Development (2025)",
      "Node.js API & Database Systems (2025)",
      "React & Frontend Architecture (2024)",
      "Responsive Web & UI Systems (2024)"
    ],
    languages: ["Bengali (Native)", "English (Professional Working Proficiency)"]
  };

  const state = {
    isOpen: false,
    isMinimized: false,
    isTyping: false,
    messages: [],
    backendConfig: {
      mode: "local", // "local" | "backend"
      backendEndpoint: "" // Future server proxy URL (e.g. "/api/assistant"), never put API keys here
    },
    lastFocusedElement: null
  };

  function escapeHtml(value) {
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

  function formatTime(dateInput) {
    const d = dateInput ? new Date(dateInput) : new Date();
    const valid = Number.isNaN(d.getTime()) ? new Date() : d;
    return [valid.getHours(), valid.getMinutes()]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");
  }

  function getLiveKnowledge() {
    const cfg = window.portfolioConfig || {};
    const projects =
      window.PortfolioProjects && Array.isArray(window.PortfolioProjects.projectsData)
        ? window.PortfolioProjects.projectsData
        : fallbackKnowledge.projects;

    const skillsCatalog =
      window.PortfolioSkills && Array.isArray(window.PortfolioSkills.skillsCatalog)
        ? window.PortfolioSkills.skillsCatalog
        : null;

    const testimonials =
      window.PortfolioTestimonials && Array.isArray(window.PortfolioTestimonials.testimonialsData)
        ? window.PortfolioTestimonials.testimonialsData
        : [];

    const articles =
      window.PortfolioBlog && Array.isArray(window.PortfolioBlog.articlesData)
        ? window.PortfolioBlog.articlesData
        : [];

    return {
      name: cfg.name || "AL AMIN",
      role: cfg.role || "Full-Stack Developer & Creative Designer",
      location: cfg.location || "Bangladesh",
      email: cfg.email || "your-email@example.com",
      phone: String(cfg.phone || "").trim(),
      bio: cfg.bio || "I build modern, scalable and user-focused web applications.",
      resumeUrl: cfg.resumeUrl || "assets/documents/resume.pdf",
      availabilityStatus: cfg.availabilityStatus || "freelance",
      githubCfg: cfg.github || {},
      socialLinks: cfg.socialLinks || {},
      projects,
      skillsCatalog,
      testimonials,
      articles
    };
  }

  function buildWelcomeMessage() {
    const kb = getLiveKnowledge();
    return {
      id: `msg-welcome-${Date.now()}`,
      role: "assistant",
      text: `Hi! I'm the rule-based Portfolio Assistant for ${kb.name} (${kb.role}). Ask me about his technical stack, case studies, 12 development services, experience, freelance availability, GitHub, resume download, or how to get in touch.`,
      links: [
        { label: "Explore Projects", href: "projects.html" },
        { label: "Developer Dashboard", href: "dashboard.html" }
      ],
      suggestions: [
        "Who is Al Amin?",
        "What technologies does he use?",
        "What projects has he built?",
        "Is he available for freelance work?"
      ],
      timestamp: new Date().toISOString()
    };
  }

  function loadHistory() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [buildWelcomeMessage()];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [buildWelcomeMessage()];
      }
      return parsed.slice(-MAX_HISTORY_ITEMS);
    } catch (_err) {
      return [buildWelcomeMessage()];
    }
  }

  function saveHistory() {
    try {
      const trimmed = state.messages.slice(-MAX_HISTORY_ITEMS);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (_err) {
      // Ignore storage quota or private mode errors gracefully
    }
  }

  function clearHistory() {
    state.messages = [buildWelcomeMessage()];
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (_err) {}
    renderMessages();
    if (typeof window.showToast === "function") {
      window.showToast("Conversation history cleared", "info");
    }
  }

  /* ========================================================================
     Rule-Based Intent Matching & Portfolio Content Search Engine
     ======================================================================== */

  function normalizeQuery(text) {
    return String(text || "")
      .slice(0, MAX_QUERY_LENGTH)
      .toLowerCase()
      .replace(/[^\w\s.+/-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getAvailabilityDescription(statusKey) {
    const map = {
      freelance: "Available for Freelance work (custom full-stack builds, SaaS interfaces, and responsive redesigns)",
      projects: "Open to Projects (collaborating on product MVPs, dashboards, and MERN applications)",
      remote: "Open to Remote Work (remote frontend, backend, or full-stack engineering roles)",
      busy: "Currently Busy on active sprint milestones, though upcoming inquiries are welcomed"
    };
    return map[statusKey] || map.freelance;
  }

  function searchPortfolioContent(normQuery, kb) {
    const tokens = normQuery
      .split(" ")
      .filter((w) => w.length >= 3 && !["what", "does", "have", "that", "this", "with", "from", "about", "where", "how", "can", "his", "the", "are", "you", "for", "use", "built"].includes(w));

    if (tokens.length === 0) return null;

    const matchedProjects = kb.projects.filter((proj) => {
      const hay = `${proj.title} ${proj.category} ${proj.description} ${(proj.technologies || []).join(" ")}`.toLowerCase();
      return tokens.some((t) => hay.includes(t));
    });

    const matchedServices = fallbackKnowledge.services.filter((svc) =>
      tokens.some((t) => svc.toLowerCase().includes(t))
    );

    const matchedSkills = [];
    Object.entries(fallbackKnowledge.skillsByGroup).forEach(([group, list]) => {
      list.forEach((s) => {
        if (tokens.some((t) => s.toLowerCase().includes(t))) {
          matchedSkills.push(`${s} (${group})`);
        }
      });
    });

    if (matchedProjects.length === 0 && matchedServices.length === 0 && matchedSkills.length === 0) {
      return null;
    }

    const parts = [];
    const links = [];

    if (matchedSkills.length > 0) {
      parts.push(`Matching skills: ${matchedSkills.slice(0, 6).join(", ")}.`);
      links.push({ label: "Skills Matrix", href: "skills.html" });
    }
    if (matchedProjects.length > 0) {
      parts.push(
        `Matching projects: ${matchedProjects
          .slice(0, 4)
          .map((p) => `${p.title} (${p.category})`)
          .join(", ")}.`
      );
      links.push({
        label: `View ${matchedProjects[0].title}`,
        href: `project-details.html?id=${encodeURIComponent(matchedProjects[0].id)}`
      });
    }
    if (matchedServices.length > 0) {
      parts.push(`Matching services: ${matchedServices.slice(0, 4).join(", ")}.`);
      links.push({ label: "Explore Services", href: "services.html" });
    }

    return {
      text: `Here is what matches across ${kb.name}'s portfolio: ${parts.join(" ")}`,
      links,
      suggestions: [
        "What technologies does he use?",
        "What projects has he built?",
        "How can I contact him?"
      ]
    };
  }

  function generateRuleBasedReply(rawQuery) {
    const kb = getLiveKnowledge();
    const q = normalizeQuery(rawQuery);

    if (!q) {
      return {
        text: "Please enter a question or select one of the quick prompts above to explore AL AMIN's portfolio.",
        links: [],
        suggestions: ["Who is Al Amin?", "What projects has he built?"]
      };
    }

    // 1. Direct lookup for a specific flagship project
    const specificProject = kb.projects.find((p) => q.includes(p.title.toLowerCase()) || q.includes(p.id.toLowerCase()));
    if (specificProject && !q.includes("what projects")) {
      const stack = (specificProject.technologies || []).join(", ");
      return {
        text: `${specificProject.title} (${specificProject.category}) — ${specificProject.description} Built with: ${stack}. You can inspect its interactive system architecture, timeline, and gallery on its full case study page.`,
        links: [
          { label: `${specificProject.title} Case Study`, href: `project-details.html?id=${encodeURIComponent(specificProject.id)}` },
          { label: "All Projects", href: "projects.html" }
        ],
        suggestions: ["What other projects has he built?", "What technologies does he use?", "Can I hire him?"]
      };
    }

    // 2. Greetings / Thank you
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b/.test(q) || q === "help") {
      return {
        text: `Hello! Welcome to ${kb.name}'s portfolio. You can ask me about his skills, featured projects, services, freelance availability, resume, GitHub repos, or contact channels.`,
        links: [
          { label: "About AL AMIN", href: "about.html" },
          { label: "Projects", href: "projects.html" },
          { label: "Contact", href: "contact.html" }
        ],
        suggestions: ["Who is Al Amin?", "What technologies does he use?", "Can I hire him?"]
      };
    }

    if (/\b(thank|thanks|thx|appreciate)\b/.test(q)) {
      return {
        text: `You're welcome! Let me know if you want to inspect ${kb.name}'s case studies, try the live HTML/CSS/JS Playground, or reach out for a project.`,
        links: [
          { label: "Code Playground", href: "playground.html" },
          { label: "Contact Page", href: "contact.html" }
        ],
        suggestions: ["How can I contact him?", "Can I download his resume?"]
      };
    }

    // 3. Resume / CV
    if (/\b(resume|cv|curriculum vitae|print resume)\b/.test(q)) {
      return {
        text: `Yes — you can view ${kb.name}'s formatted interactive resume (with A4 print layout) or download the PDF file directly (${kb.resumeUrl}).`,
        links: [
          { label: "Open Resume Page", href: "resume.html" },
          { label: "Download Resume PDF", href: kb.resumeUrl, download: "AL_AMIN_Resume.pdf" }
        ],
        suggestions: ["Who is Al Amin?", "What is his experience?", "How can I contact him?"]
      };
    }

    // 4. GitHub / Open source / Code Playground
    if (/\b(github|repo|repos|repository|repositories|open source|git)\b/.test(q)) {
      const ghUser = kb.githubCfg.username || "configured in js/config.js";
      const customGh = kb.socialLinks.github ? ` Configured profile link: ${kb.socialLinks.github}.` : "";
      return {
        text: `${kb.name}'s live GitHub integration is available on the GitHub Explorer page (currently configured for username "${ghUser}" in js/config.js), where you can browse public repositories, language statistics, and recent public events.${customGh} You can also test live frontend code on the Code Playground page.`,
        links: [
          { label: "Open GitHub Explorer", href: "github.html" },
          { label: "Developer Dashboard", href: "dashboard.html" },
          { label: "Code Playground", href: "playground.html" }
        ],
        suggestions: ["What projects has he built?", "What technologies does he use?"]
      };
    }

    // 5. Hire / Freelance / Availability
    if (/\b(hire|freelance|available|availability|work with|book|collaborate|fiverr|upwork|remote|contract)\b/.test(q)) {
      const statusDesc = getAvailabilityDescription(kb.availabilityStatus);
      return {
        text: `Yes! ${kb.name} is currently ${statusDesc}. Direct contact channels include email (${kb.email}) plus links for Fiverr, Upwork, LinkedIn, and GitHub configurable on the Contact page.`,
        links: [
          { label: "Hire / Send Inquiry", href: "contact.html?intent=quote" },
          { label: "View Services", href: "services.html" },
          { label: "Availability Dashboard", href: "dashboard.html" }
        ],
        suggestions: ["What services does he offer?", "How can I contact him?", "Can I download his resume?"]
      };
    }

    // 6. Contact Information
    if (/\b(contact|email|phone|reach|message|mail|linkedin|location|social)\b/.test(q)) {
      const phoneNote = kb.phone ? kb.phone : "Available upon email request";
      return {
        text: `You can contact ${kb.name} via the inquiry form on the Contact page or directly by email at ${kb.email}. Location: ${kb.location}. Phone: ${phoneNote}.`,
        links: [
          { label: "Go to Contact Page", href: "contact.html" },
          { label: `Email ${kb.name}`, href: `mailto:${kb.email}` }
        ],
        suggestions: ["Can I hire him?", "What services does he offer?", "Where can I find his GitHub?"]
      };
    }

    // 7. Technologies / Skills
    if (/\b(tech|technologies|technology|stack|skill|skills|tools|framework|programming|language|frontend|backend|database)\b/.test(q)) {
      return {
        text: `${kb.name} works primarily with the MERN stack and modern web tooling — Frontend: ${fallbackKnowledge.skillsByGroup.Frontend.join(", ")}; Backend: ${fallbackKnowledge.skillsByGroup.Backend.join(", ")}; Databases: ${fallbackKnowledge.skillsByGroup.Database.join(", ")}; Tools & Design: ${fallbackKnowledge.skillsByGroup["Tools & Design"].join(", ")}.`,
        links: [
          { label: "Explore Skills Matrix", href: "skills.html" },
          { label: "Try Code Playground", href: "playground.html" }
        ],
        suggestions: ["What projects has he built?", "What services does he offer?", "Where can I find his GitHub?"]
      };
    }

    // 8. Projects Overview
    if (/\b(project|projects|built|build|case study|case studies|portfolio|showcase|apps|work)\b/.test(q)) {
      const listText = kb.projects
        .map((p) => `${p.title} (${p.category})`)
        .join(", ");
      return {
        text: `${kb.name} has 6 documented engineering case studies across SaaS, E-commerce, Dashboards, and Web Apps: ${listText}. Each includes architecture breakdowns, technical challenges, timelines, and screenshot galleries.`,
        links: [
          { label: "Browse All Projects", href: "projects.html" },
          { label: "AstraPulse Case Study", href: "project-details.html?id=astrapulse" },
          { label: "Nexora Case Study", href: "project-details.html?id=nexora" }
        ],
        suggestions: ["Tell me about AstraPulse", "What technologies does he use?", "Can I hire him?"]
      };
    }

    // 9. Services
    if (/\b(service|services|offer|offers|develop|redesign|optimization|seo|ui\/ux|dashboard)\b/.test(q)) {
      return {
        text: `${kb.name} offers 12 core web development services including: ${fallbackKnowledge.services.join(", ")}. Every service card on the Services page expands into deliverables, tech stack, and workflow details.`,
        links: [
          { label: "View All 12 Services", href: "services.html" },
          { label: "Request a Quote", href: "contact.html?intent=quote" }
        ],
        suggestions: ["Can I hire him?", "What projects has he built?", "How can I contact him?"]
      };
    }

    // 10. Experience / Education / Certificates
    if (/\b(experience|education|degree|university|certificate|certificates|certification|career|background|timeline|study)\b/.test(q)) {
      return {
        text: `${kb.name} holds a B.Sc. in Computer Science & Engineering (2021–2025) and works as a Full-Stack MERN Developer (2025–Present), previously Frontend & UI Engineer (2024–2025) and Freelance Web Developer (2023–Present). He also lists 4 technical certificates covering MERN, React, Node.js APIs, and Responsive UI.`,
        links: [
          { label: "Experience Timeline", href: "experience.html" },
          { label: "Certificates Gallery", href: "certificates.html" },
          { label: "Resume Page", href: "resume.html" }
        ],
        suggestions: ["What technologies does he use?", "Can I download his resume?"]
      };
    }

    // 11. About / Who is Al Amin
    if (/\b(who is|about|al amin|alamin|bio|developer|designer|bangladesh)\b/.test(q)) {
      return {
        text: `${kb.name} is a ${kb.role} based in ${kb.location}. ${kb.bio} He holds a B.Sc. in Computer Science & Engineering, specializes in MERN & Next.js web applications, speaks ${fallbackKnowledge.languages.join(" & ")}, and maintains interactive showcase tools right on this site.`,
        links: [
          { label: "Read Full About Page", href: "about.html" },
          { label: "View Resume", href: "resume.html" },
          { label: "Developer Dashboard", href: "dashboard.html" }
        ],
        suggestions: ["What technologies does he use?", "What projects has he built?", "Can I hire him?"]
      };
    }

    // 12. Testimonials / Blog / Playground / Dashboard
    if (/\b(testimonial|testimonials|review|reviews|client|clients|feedback)\b/.test(q)) {
      return {
        text: `The Testimonials page displays clearly labeled sample/demo review entries illustrating collaboration across SaaS, commerce, and UI engineering until verified client testimonials are added.`,
        links: [
          { label: "Testimonials Page", href: "testimonials.html" },
          { label: "Projects Case Studies", href: "projects.html" }
        ],
        suggestions: ["What projects has he built?", "Can I hire him?"]
      };
    }

    if (/\b(blog|article|articles|post|posts|read|tutorial)\b/.test(q)) {
      return {
        text: `${kb.name}'s Developer Blog covers JavaScript, React, Node.js, MERN performance, AI workflows, and web architecture with search, category filters, and table-of-contents reading mode.`,
        links: [{ label: "Read Blog Articles", href: "blog.html" }],
        suggestions: ["What technologies does he use?", "What projects has he built?"]
      };
    }

    if (/\b(playground|sandbox|live editor|code editor|try)\b/.test(q)) {
      return {
        text: `You can experiment with HTML, CSS, and JavaScript directly in the browser on the Live Code Playground page, complete with an isolated iframe sandbox, console capture, and 8 starter examples.`,
        links: [{ label: "Open Code Playground", href: "playground.html" }],
        suggestions: ["Where can I find his GitHub?", "What projects has he built?"]
      };
    }

    // 13. Portfolio-wide keyword search before final fallback
    const searchMatch = searchPortfolioContent(q, kb);
    if (searchMatch) {
      return searchMatch;
    }

    // 14. Honest Rule-Based Fallback
    return {
      text: `I'm a rule-based static portfolio guide, so I couldn't find a direct match for that question. Try asking about ${kb.name}'s skills, MERN projects, services, freelance availability, experience, GitHub, resume, or contact details—or jump straight to a section below.`,
      links: [
        { label: "Projects", href: "projects.html" },
        { label: "Skills", href: "skills.html" },
        { label: "Services", href: "services.html" },
        { label: "Contact", href: "contact.html" }
      ],
      suggestions: [
        "Who is Al Amin?",
        "What technologies does he use?",
        "What projects has he built?",
        "How can I contact him?"
      ]
    };
  }

  /**
   * Clean future backend AI adapter interface.
   * Never handles private API keys in the browser—only talks to a configured server endpoint.
   */
  async function resolveAssistantReply(userText) {
    const cfg = (window.portfolioConfig && window.portfolioConfig.assistant) || {};
    const mode = state.backendConfig.overridden
      ? state.backendConfig.mode
      : (cfg.mode || state.backendConfig.mode);
    const endpoint = state.backendConfig.overridden
      ? state.backendConfig.backendEndpoint
      : (cfg.backendEndpoint || state.backendConfig.backendEndpoint);

    if (mode === "backend" && endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: String(userText).slice(0, MAX_QUERY_LENGTH),
            history: state.messages.slice(-8).map((m) => ({ role: m.role, text: m.text }))
          })
        });
        if (response.ok) {
          const payload = await response.json();
          if (payload && typeof payload.text === "string" && payload.text.trim()) {
            return {
              text: payload.text.trim(),
              links: Array.isArray(payload.links) ? payload.links : [],
              suggestions: Array.isArray(payload.suggestions) ? payload.suggestions : []
            };
          }
        }
      } catch (_err) {
        // Gracefully fall back to local rule-based matching if backend is unreachable
      }
    }

    return generateRuleBasedReply(userText);
  }

  function configureBackend(options = {}) {
    state.backendConfig.overridden = true;
    if (options.mode === "backend" || options.mode === "local") {
      state.backendConfig.mode = options.mode;
    }
    if (typeof options.backendEndpoint === "string") {
      state.backendConfig.backendEndpoint = options.backendEndpoint.trim();
    }
  }

  /* ========================================================================
     DOM Rendering & UI Interactions
     ======================================================================== */

  function mountAssistantShell() {
    if (document.getElementById("portfolio-assistant-root")) return;

    const root = document.createElement("div");
    root.id = "portfolio-assistant-root";
    root.className = "pa-root";

    const quickButtonsMarkup = quickPrompts
      .map(
        (promptText) => `
          <button type="button" class="pa-quick-btn" data-pa-prompt="${escapeHtml(promptText)}">
            ${escapeHtml(promptText)}
          </button>
        `
      )
      .join("");

    root.innerHTML = `
      <button
        type="button"
        id="pa-launcher-btn"
        class="pa-launcher"
        aria-label="Open Portfolio Assistant"
        aria-expanded="false"
        aria-controls="pa-window"
      >
        <i data-lucide="message-square" class="w-4 h-4 shrink-0" aria-hidden="true"></i>
        <span class="hidden sm:inline">Assistant</span>
      </button>

      <section
        id="pa-window"
        class="pa-window"
        role="dialog"
        aria-label="AL AMIN Portfolio Assistant"
        aria-hidden="true"
      >
        <header class="pa-header">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="pa-header-icon" aria-hidden="true">
              <i data-lucide="bot" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0">
              <h2 class="text-sm font-bold text-[var(--text)] truncate">Portfolio Assistant</h2>
              <p class="text-[11px] text-[var(--muted)] truncate">Rule-Based Portfolio Guide</p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button type="button" id="pa-clear-btn" class="pa-header-btn" aria-label="Clear conversation" title="Clear conversation">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
            <button type="button" id="pa-minimize-btn" class="pa-header-btn" aria-label="Minimize assistant" aria-pressed="false" title="Minimize window">
              <i data-lucide="minus" class="w-4 h-4"></i>
            </button>
            <button type="button" id="pa-close-btn" class="pa-header-btn" aria-label="Close assistant" title="Close assistant">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
        </header>

        <div class="pa-quick-tray">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[11px] font-semibold text-[var(--muted)]">Quick Questions</span>
            <span class="text-[10px] font-mono-tech text-[var(--muted)]">Scroll →</span>
          </div>
          <div class="pa-quick-scroll" role="group" aria-label="Quick portfolio questions">
            ${quickButtonsMarkup}
          </div>
        </div>

        <div id="pa-messages" class="pa-messages" role="log" aria-live="polite" aria-label="Assistant conversation history"></div>

        <form id="pa-form" class="pa-input-bar" novalidate>
          <label for="pa-input" class="sr-only">Ask a question about AL AMIN's portfolio</label>
          <input
            id="pa-input"
            type="text"
            class="pa-input"
            maxlength="${MAX_QUERY_LENGTH}"
            placeholder="Ask about skills, projects, hiring..."
            autocomplete="off"
          >
          <button type="submit" id="pa-send-btn" class="pa-send-btn" aria-label="Send message">
            <i data-lucide="send" class="w-4 h-4"></i>
          </button>
        </form>

        <div class="pa-footer-note">
          <span>Static portfolio search · History saved locally</span>
          <button type="button" id="pa-reset-link" class="text-indigo-400 hover:underline font-semibold cursor-pointer bg-transparent border-0 p-0">
            Reset chat
          </button>
        </div>
      </section>
    `;

    document.body.appendChild(root);
    refreshIcons();
  }

  function renderMessages() {
    const container = document.getElementById("pa-messages");
    if (!container) return;

    const bubblesHtml = state.messages
      .map((msg) => {
        const isUser = msg.role === "user";
        const linksHtml =
          !isUser && Array.isArray(msg.links) && msg.links.length > 0
            ? `<div class="pa-links-row">
                ${msg.links
                  .map((lnk) => {
                    const dlAttr = lnk.download ? ` download="${escapeHtml(lnk.download)}"` : "";
                    return `
                      <a href="${escapeHtml(lnk.href)}"${dlAttr} class="pa-link-chip">
                        <span>${escapeHtml(lnk.label)}</span>
                        <i data-lucide="arrow-up-right" class="w-3 h-3"></i>
                      </a>
                    `;
                  })
                  .join("")}
              </div>`
            : "";

        const suggestionsHtml =
          !isUser && Array.isArray(msg.suggestions) && msg.suggestions.length > 0
            ? `<div class="pa-suggestions-row">
                ${msg.suggestions
                  .map(
                    (s) => `
                      <button type="button" class="pa-suggest-btn" data-pa-prompt="${escapeHtml(s)}">
                        ${escapeHtml(s)}
                      </button>
                    `
                  )
                  .join("")}
              </div>`
            : "";

        const copyBtnHtml = !isUser
          ? `<button type="button" class="pa-copy-btn" data-pa-copy="${escapeHtml(msg.id)}" aria-label="Copy response">
               <i data-lucide="copy" class="w-3 h-3"></i>
               <span>Copy</span>
             </button>`
          : "";

        return `
          <div class="pa-msg ${isUser ? "is-user" : "is-assistant"}">
            <div class="pa-bubble">
              <p>${escapeHtml(msg.text)}</p>
              ${linksHtml}
            </div>
            ${suggestionsHtml}
            <div class="pa-msg-meta">
              <span>${escapeHtml(formatTime(msg.timestamp))}</span>
              ${copyBtnHtml}
            </div>
          </div>
        `;
      })
      .join("");

    const typingHtml = state.isTyping
      ? `<div class="pa-typing" aria-label="Assistant is preparing response" role="status">
           <span class="pa-typing-dot"></span>
           <span class="pa-typing-dot"></span>
           <span class="pa-typing-dot"></span>
         </div>`
      : "";

    container.innerHTML = bubblesHtml + typingHtml;
    container.scrollTop = container.scrollHeight;

    container.querySelectorAll("[data-pa-copy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const msgId = btn.getAttribute("data-pa-copy");
        const found = state.messages.find((m) => m.id === msgId);
        if (found) copyReplyText(found.text);
      });
    });

    container.querySelectorAll("[data-pa-prompt]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const promptText = btn.getAttribute("data-pa-prompt") || "";
        sendMessage(promptText);
      });
    });

    refreshIcons();
  }

  function copyReplyText(text) {
    const notifyDone = () => {
      if (typeof window.showToast === "function") {
        window.showToast("Response copied to clipboard", "success");
      }
    };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).then(notifyDone).catch(fallback);
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
        notifyDone();
      } catch (_err) {
        if (typeof window.showToast === "function") {
          window.showToast("Unable to copy response automatically", "error");
        }
      }
    }
  }

  function setWindowOpen(open) {
    const win = document.getElementById("pa-window");
    const launcher = document.getElementById("pa-launcher-btn");
    const input = document.getElementById("pa-input");
    if (!win || !launcher) return;

    state.isOpen = Boolean(open);
    if (state.isOpen) {
      state.lastFocusedElement = document.activeElement;
      state.isMinimized = false;
      win.classList.remove("is-minimized");
      win.classList.add("is-open");
      win.setAttribute("aria-hidden", "false");
      launcher.classList.add("is-hidden");
      launcher.setAttribute("aria-expanded", "true");
      renderMessages();
      if (input) window.setTimeout(() => input.focus(), 50);
    } else {
      win.classList.remove("is-open", "is-minimized");
      win.setAttribute("aria-hidden", "true");
      launcher.classList.remove("is-hidden");
      launcher.setAttribute("aria-expanded", "false");
      if (launcher && typeof launcher.focus === "function") {
        launcher.focus();
      }
    }
  }

  function toggleMinimize() {
    const win = document.getElementById("pa-window");
    const minBtn = document.getElementById("pa-minimize-btn");
    if (!win) return;

    state.isMinimized = !state.isMinimized;
    win.classList.toggle("is-minimized", state.isMinimized);
    if (minBtn) {
      minBtn.setAttribute("aria-pressed", state.isMinimized ? "true" : "false");
      minBtn.setAttribute("aria-label", state.isMinimized ? "Restore assistant" : "Minimize assistant");
    }
  }

  function sendMessage(rawText) {
    const text = String(rawText || "").trim().slice(0, MAX_QUERY_LENGTH);
    const input = document.getElementById("pa-input");

    if (!text) {
      if (input && typeof input.focus === "function") input.focus();
      return;
    }

    if (!state.isOpen) {
      setWindowOpen(true);
    } else if (state.isMinimized) {
      toggleMinimize();
    }

    const userMsg = {
      id: `msg-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: "user",
      text,
      timestamp: new Date().toISOString()
    };

    state.messages.push(userMsg);
    state.isTyping = true;
    saveHistory();
    renderMessages();

    if (input) input.value = "";

    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delayMs = reducedMotion ? 0 : 240;

    window.setTimeout(async () => {
      const reply = await resolveAssistantReply(text);
      state.isTyping = false;
      state.messages.push({
        id: `msg-bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: "assistant",
        text: reply.text,
        links: reply.links || [],
        suggestions: reply.suggestions || [],
        timestamp: new Date().toISOString()
      });
      saveHistory();
      renderMessages();
    }, delayMs);
  }

  function init() {
    if (init.initialized) return;
    init.initialized = true;

    state.messages = loadHistory();
    mountAssistantShell();
    renderMessages();

    const launcher = document.getElementById("pa-launcher-btn");
    const closeBtn = document.getElementById("pa-close-btn");
    const minBtn = document.getElementById("pa-minimize-btn");
    const clearBtn = document.getElementById("pa-clear-btn");
    const resetLink = document.getElementById("pa-reset-link");
    const form = document.getElementById("pa-form");
    const input = document.getElementById("pa-input");

    if (launcher) launcher.addEventListener("click", () => setWindowOpen(true));
    if (closeBtn) closeBtn.addEventListener("click", () => setWindowOpen(false));
    if (minBtn) minBtn.addEventListener("click", toggleMinimize);
    if (clearBtn) clearBtn.addEventListener("click", clearHistory);
    if (resetLink) resetLink.addEventListener("click", clearHistory);

    if (form && input) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        sendMessage(input.value);
      });
    }

    document.querySelectorAll(".pa-quick-tray [data-pa-prompt]").forEach((btn) => {
      btn.addEventListener("click", () => {
        sendMessage(btn.getAttribute("data-pa-prompt") || "");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.isOpen) {
        setWindowOpen(false);
      }
    });
  }

  return {
    init,
    quickPrompts,
    state,
    sendMessage,
    clearHistory,
    setWindowOpen,
    toggleMinimize,
    generateRuleBasedReply,
    resolveAssistantReply,
    configureBackend
  };
})();

window.PortfolioAssistant = PortfolioAssistant;
