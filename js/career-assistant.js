/**
 * AL AMIN Portfolio OS — Phase 44: Dedicated Portfolio Career Assistant
 * Rule-based local engine strictly grounded in configured PortfolioData.
 * Never exposes API keys or invents employment, clients, awards, salary,
 * certifications, or project metrics. Includes a clean server-proxy adapter
 * point (`portfolioConfig.assistant.backendEndpoint`) for future backend AI.
 */

const PortfolioCareerAssistant = (() => {
  const STORAGE_KEY = "alamin_career_assistant_history_v1";
  const MAX_HISTORY = 50;
  const MAX_QUERY_LEN = 600;

  const SUGGESTED_QUESTIONS = [
    "Who is AL AMIN?",
    "What technologies does he use?",
    "What projects has he built?",
    "What services does he provide?",
    "What type of developer is he?",
    "What kind of projects can he build?",
    "What technologies are strongest?",
    "What projects demonstrate MERN skills?",
    "How can I contact him?",
    "Show relevant projects",
    "Show relevant skills"
  ];

  const state = {
    initialized: false,
    isTyping: false,
    messages: [],
    backendOverride: {
      enabled: false,
      mode: "local",
      backendEndpoint: ""
    }
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

  function showToast(msg, type = "info") {
    if (typeof window.showToast === "function") {
      window.showToast(msg, type);
    }
  }

  function formatTime(iso) {
    const d = iso ? new Date(iso) : new Date();
    const safe = Number.isNaN(d.getTime()) ? new Date() : d;
    return [safe.getHours(), safe.getMinutes()].map((n) => String(n).padStart(2, "0")).join(":");
  }

  function reducedMotionEnabled() {
    return (
      document.documentElement.classList.contains("a11y-reduce-motion") ||
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    );
  }

  function readConfiguredData() {
    const cfg = window.portfolioConfig || {};
    const brand = cfg.brand || {};
    const dataNs = window.PortfolioData || {};

    const profile =
      typeof dataNs.getProfile === "function"
        ? dataNs.getProfile()
        : {
            name: brand.displayName || cfg.name || "AL AMIN",
            role: brand.professionalTitle || cfg.role || "Full-Stack Developer & Creative Designer",
            shortTagline: brand.shortTagline || cfg.bio || "Engineering scalable web systems with refined interface craft.",
            location: brand.location || cfg.location || "Bangladesh",
            email: brand.email || cfg.email || "your-email@example.com",
            resumeUrl: cfg.resumeUrl || "assets/documents/resume.pdf",
            currentFocus: brand.currentFocus || "Full-Stack MERN, Next.js & Design Systems",
            languages: [
              { name: "Bengali", level: "Native Proficiency" },
              { name: "English", level: "Professional Working Proficiency" }
            ]
          };

    const projects = typeof dataNs.getProjects === "function" ? dataNs.getProjects() : [];
    const skills = typeof dataNs.getSkills === "function" ? dataNs.getSkills() : [];
    const services = typeof dataNs.getServices === "function" ? dataNs.getServices() : [];
    const experience = typeof dataNs.getExperience === "function" ? dataNs.getExperience() : [];
    const certificates = typeof dataNs.getCertificates === "function" ? dataNs.getCertificates() : [];
    const github = typeof dataNs.getGitHubData === "function" ? dataNs.getGitHubData() : {};

    return {
      profile,
      projects,
      skills,
      services,
      experience,
      certificates,
      github,
      brand
    };
  }

  function groupSkills(skills) {
    const grouped = {};
    skills.forEach((skill) => {
      const cat = skill.category || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(skill);
    });
    return grouped;
  }

  function buildWelcomeMessage() {
    const data = readConfiguredData();
    const { profile, projects, skills, services } = data;
    return {
      id: `ca-welcome-${Date.now()}`,
      role: "assistant",
      text: `Hello! I am the rule-based Portfolio Assistant for ${profile.name} (${profile.role}). Every answer I give comes strictly from configured portfolio records (${projects.length} projects, ${skills.length} skills, ${services.length} services, experience & certificates)—never invented data.`,
      actions: [
        { label: "View Projects", href: "projects.html" },
        { label: "Skills Matrix", href: "skills.html" },
        { label: "Resume Builder", href: "resume.html" },
        { label: "Contact", href: "contact.html" }
      ],
      suggestions: [
        "Who is AL AMIN?",
        "What technologies are strongest?",
        "What projects demonstrate MERN skills?",
        "Show relevant projects"
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
      return parsed.slice(-MAX_HISTORY);
    } catch (_err) {
      return [buildWelcomeMessage()];
    }
  }

  function saveHistory() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages.slice(-MAX_HISTORY)));
    } catch (_err) {
      // Ignore storage write errors cleanly
    }
  }

  function clearChat() {
    state.messages = [buildWelcomeMessage()];
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (_err) {}
    renderMessages();
    showToast("Conversation history cleared", "info");
  }

  function normalizeQuery(text) {
    return String(text || "")
      .slice(0, MAX_QUERY_LEN)
      .toLowerCase()
      .replace(/[^\w\s.+/-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function generateGroundedReply(rawQuery) {
    const data = readConfiguredData();
    const { profile, projects, skills, services, experience, certificates, brand } = data;
    const q = normalizeQuery(rawQuery);
    const groupedSkills = groupSkills(skills);
    const coreStackSkills = skills.filter((s) => s.level === "Core Stack");
    const mernProjects = projects.filter((p) => {
      const techs = (p.technologies || []).join(" ").toLowerCase();
      return (
        techs.includes("mongodb") ||
        techs.includes("express") ||
        techs.includes("node.js") ||
        (techs.includes("react") && techs.includes("node.js"))
      );
    });

    if (!q) {
      return {
        text: "Enter a question or select any suggested prompt to query configured portfolio data.",
        actions: [{ label: "Browse Projects", href: "projects.html" }],
        suggestions: ["Who is AL AMIN?", "Show relevant projects", "Show relevant skills"]
      };
    }

    // Honest refusal for data intentionally NOT configured (salary, awards, unconfigured metrics)
    if (/\b(salary|rate|hourly|compensation|pay|wage|award|awards|prize|prizes|revenue|mrr|arr|users count)\b/.test(q)) {
      return {
        text: `Specific salary expectations, private client engagement fees, unpublished project usage metrics, and awards are not stored in the configured portfolio dataset. For project scoping or role discussions, please use the configured Project Estimator or contact ${profile.name} directly at ${profile.email}.`,
        actions: [
          { label: "Contact AL AMIN", href: "contact.html" },
          { label: "Project Estimator", href: "project-estimator.html" },
          { label: "Experience Timeline", href: "experience.html" }
        ],
        suggestions: [
          "What services does he provide?",
          "What projects demonstrate MERN skills?",
          "How can I contact him?"
        ]
      };
    }

    // 1. Specific project match by title/id
    const directProject = projects.find(
      (p) => q.includes(p.title.toLowerCase()) || q.includes(p.id.toLowerCase())
    );
    if (directProject && !q.includes("what projects") && !q.includes("show relevant")) {
      return {
        text: `${directProject.title} (${directProject.category} · ${directProject.projectType}) — ${directProject.description} Configured role: ${directProject.developmentRole}. Status: ${directProject.status}.`,
        projectCards: [directProject],
        actions: [
          { label: `Open ${directProject.title}`, href: directProject.href || `project-details.html?id=${encodeURIComponent(directProject.id)}` },
          { label: "All Projects", href: "projects.html" }
        ],
        suggestions: [
          "What projects demonstrate MERN skills?",
          "What technologies are strongest?",
          "How can I contact him?"
        ]
      };
    }

    // 2. MERN projects
    if (/\b(mern|mongodb|express|full-stack project|fullstack project)\b/.test(q) && /\b(project|projects|demonstrate|build|built|show|skills)\b/.test(q)) {
      return {
        text: `${mernProjects.length} projects in the configured portfolio directly demonstrate MERN / Node.js full-stack engineering: ${mernProjects
          .map((p) => p.title)
          .join(", ")}.`,
        projectCards: mernProjects.slice(0, 4),
        actions: [
          { label: "All Projects", href: "projects.html" },
          { label: "System Architecture", href: "architecture.html" },
          { label: "Open Source Hub", href: "opensource.html" }
        ],
        suggestions: [
          "What technologies are strongest?",
          "What kind of projects can he build?",
          "How can I contact him?"
        ]
      };
    }

    // 3. Strongest technologies / Core stack
    if (/\b(strongest|core stack|best at|primary tech|strongest tech|main stack)\b/.test(q)) {
      return {
        text: `In the configured skills catalog, ${coreStackSkills.length} technologies are marked at the "Core Stack" level: ${coreStackSkills
          .map((s) => s.name)
          .join(", ")}. Current primary focus is ${profile.currentFocus}.`,
        skillGroups: {
          "Core Stack": coreStackSkills,
          Production: skills.filter((s) => s.level === "Production")
        },
        actions: [
          { label: "Interactive Skills Graph", href: "skills.html#skills-graph-section" },
          { label: "Tech Explorer", href: "explorer.html" }
        ],
        suggestions: [
          "What projects demonstrate MERN skills?",
          "Show relevant projects",
          "What type of developer is he?"
        ]
      };
    }

    // 4. Show relevant skills / What technologies does he use
    if (/\b(show relevant skills|what technologies|technologies does he use|tech stack|skills)\b/.test(q)) {
      const catSummary = Object.entries(groupedSkills)
        .map(([cat, list]) => `${cat}: ${list.map((s) => s.name).join(", ")}`)
        .join(" | ");
      return {
        text: `${profile.name}'s configured skills catalog spans ${skills.length} capabilities across ${Object.keys(groupedSkills).length} categories — ${catSummary}.`,
        skillGroups: groupedSkills,
        actions: [
          { label: "Open Skills Matrix", href: "skills.html" },
          { label: "Code Playground", href: "playground.html" }
        ],
        suggestions: [
          "What technologies are strongest?",
          "What projects demonstrate MERN skills?",
          "Show relevant projects"
        ]
      };
    }

    // 5. Type of developer
    if (/\b(type of developer|what kind of developer|developer role|specialization|profile)\b/.test(q)) {
      return {
        text: `Configured role: ${profile.role}, currently focused on ${profile.currentFocus}. Experience milestones span Product Studio Full-Stack MERN development, Frontend & UI Engineering, and freelance delivery across SaaS, E-commerce, Admin Dashboards, and UI systems.`,
        actions: [
          { label: "About AL AMIN", href: "about.html" },
          { label: "Experience Timeline", href: "experience.html" },
          { label: "Resume Builder", href: "resume.html" }
        ],
        suggestions: [
          "What kind of projects can he build?",
          "What technologies are strongest?",
          "Who is AL AMIN?"
        ]
      };
    }

    // 6. What kind of projects can he build / Services
    if (/\b(kind of projects|what can he build|services|provide|offer|capabilities)\b/.test(q)) {
      const featuredServices = services.slice(0, 6).map((s) => s.title).join(", ");
      return {
        text: `Based on configured services (${services.length} offerings) and case studies, ${profile.name} builds multi-page full-stack web apps, MERN platforms, multi-tenant SaaS applications, headless e-commerce storefronts, role-based admin dashboards, REST APIs, and responsive UI redesigns. Core service areas include: ${featuredServices}.`,
        projectCards: projects.filter((p) => p.featured).slice(0, 2),
        actions: [
          { label: "All 12 Services", href: "services.html" },
          { label: "Project Estimator", href: "project-estimator.html" },
          { label: "Request Project", href: "project-request.html" }
        ],
        suggestions: [
          "What projects has he built?",
          "What projects demonstrate MERN skills?",
          "How can I contact him?"
        ]
      };
    }

    // 7. What projects has he built / Show relevant projects
    if (/\b(show relevant projects|what projects|projects built|case studies|portfolio work|projects)\b/.test(q)) {
      return {
        text: `Configured portfolio case studies include ${projects.length} projects across SaaS, E-commerce, UI/UX, Dashboards, and Web Apps: ${projects
          .map((p) => `${p.title} (${p.category})`)
          .join(", ")}.`,
        projectCards: projects.slice(0, 4),
        actions: [
          { label: "Browse All Projects", href: "projects.html" },
          { label: "Open Source Hub", href: "opensource.html" },
          { label: "Project Architect", href: "project-architect.html" }
        ],
        suggestions: [
          "What projects demonstrate MERN skills?",
          "What technologies are strongest?",
          "How can I contact him?"
        ]
      };
    }

    // 8. Who is AL AMIN
    if (/\b(who is|al amin|alamin|about|bio|background|introduce)\b/.test(q)) {
      const availLabel = (brand.availability && brand.availability.label) || "Open to Freelance & Full-Stack Roles";
      const langs = (profile.languages || []).map((l) => `${l.name} (${l.level})`).join(", ");
      return {
        text: `${profile.name} is a ${profile.role} based in ${profile.location}. ${profile.shortTagline} Current focus: ${profile.currentFocus}. Availability: ${availLabel}. Languages configured: ${langs}. Education: ${experience.find((e) => e.section === "Education")?.title || "B.Sc. in Computer Science & Engineering"}.`,
        actions: [
          { label: "About Page", href: "about.html" },
          { label: "Experience & Education", href: "experience.html" },
          { label: "Interactive Resume", href: "resume.html" }
        ],
        suggestions: [
          "What technologies does he use?",
          "What projects has he built?",
          "How can I contact him?"
        ]
      };
    }

    // 9. How can I contact him / Hiring / Availability
    if (/\b(contact|reach|email|hire|freelance|available|message|collaborate)\b/.test(q)) {
      const availNote = (brand.availability && brand.availability.note) || "Available for remote product builds and full-stack engineering.";
      return {
        text: `You can reach ${profile.name} via the Contact page inquiry form or email (${profile.email}). Location: ${profile.location}. Status note: ${availNote}`,
        actions: [
          { label: "Open Contact Page", href: "contact.html" },
          { label: `Email ${profile.email}`, href: `mailto:${profile.email}` },
          { label: "Project Request Wizard", href: "project-request.html" },
          { label: "Proposal Generator", href: "proposal-generator.html" }
        ],
        suggestions: [
          "What services does he provide?",
          "Show relevant projects",
          "What technologies are strongest?"
        ]
      };
    }

    // 10. Certificates / Experience
    if (/\b(certificate|certificates|certification|education|degree|experience|work history)\b/.test(q)) {
      return {
        text: `Configured timeline includes ${experience.length} milestones (${experience
          .slice(0, 3)
          .map((e) => `${e.title} · ${e.date}`)
          .join("; ")}) and ${certificates.length} configured certificates (${certificates
          .map((c) => `${c.title} (${c.date})`)
          .join(", ")}).`,
        actions: [
          { label: "Experience Timeline", href: "experience.html" },
          { label: "Certificates", href: "certificates.html" },
          { label: "Printable Resume", href: "resume.html" }
        ],
        suggestions: [
          "Who is AL AMIN?",
          "Show relevant skills",
          "How can I contact him?"
        ]
      };
    }

    // 11. Token search across configured projects, skills, and services
    const tokens = q
      .split(" ")
      .filter((t) => t.length >= 2 && !["what", "how", "can", "does", "has", "is", "he", "the", "show", "me"].includes(t));

    const matchedProjects = projects.filter((p) => {
      const hay = `${p.title} ${p.category} ${p.description} ${(p.technologies || []).join(" ")}`.toLowerCase();
      return tokens.some((tok) => hay.includes(tok));
    });
    const matchedSkills = skills.filter((s) =>
      tokens.some((tok) => `${s.name} ${s.category} ${s.level}`.toLowerCase().includes(tok))
    );
    const matchedServices = services.filter((sv) =>
      tokens.some((tok) => `${sv.title} ${sv.summary} ${(sv.technology || []).join(" ")}`.toLowerCase().includes(tok))
    );

    if (matchedProjects.length || matchedSkills.length || matchedServices.length) {
      const parts = [];
      if (matchedProjects.length) {
        parts.push(`Matching projects: ${matchedProjects.map((p) => p.title).join(", ")}.`);
      }
      if (matchedSkills.length) {
        parts.push(`Matching skills: ${matchedSkills.map((s) => `${s.name} (${s.level})`).join(", ")}.`);
      }
      if (matchedServices.length) {
        parts.push(`Matching services: ${matchedServices.slice(0, 4).map((s) => s.title).join(", ")}.`);
      }

      return {
        text: `Search across configured portfolio data found: ${parts.join(" ")}`,
        projectCards: matchedProjects.slice(0, 4),
        skillGroups: matchedSkills.length ? groupSkills(matchedSkills) : undefined,
        actions: [
          { label: "Recruiter Search", href: "recruiter-search.html" },
          { label: "Projects", href: "projects.html" },
          { label: "Skills", href: "skills.html" }
        ],
        suggestions: [
          "Show relevant projects",
          "Show relevant skills",
          "How can I contact him?"
        ]
      };
    }

    // 12. Honest grounded fallback
    return {
      text: `I could not find a direct match in configured portfolio records for that query. Because this Portfolio Assistant never invents data, try asking about ${profile.name}'s identity, core technologies, MERN projects, services, experience, certificates, or contact details.`,
      actions: [
        { label: "Projects", href: "projects.html" },
        { label: "Skills", href: "skills.html" },
        { label: "Services", href: "services.html" },
        { label: "Contact", href: "contact.html" }
      ],
      suggestions: [
        "Who is AL AMIN?",
        "What technologies are strongest?",
        "What projects demonstrate MERN skills?",
        "How can I contact him?"
      ]
    };
  }

  /**
   * Clean future backend AI adapter interface.
   * Never stores or sends private AI API keys from the frontend browser.
   */
  async function resolveReply(userText) {
    const cfg = (window.portfolioConfig && window.portfolioConfig.assistant) || {};
    const activeMode = state.backendOverride.enabled ? state.backendOverride.mode : (cfg.mode || "local");
    const endpoint = state.backendOverride.enabled
      ? state.backendOverride.backendEndpoint
      : (cfg.backendEndpoint || "");

    if (activeMode === "backend" && endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: String(userText || "").slice(0, MAX_QUERY_LEN),
            history: state.messages.slice(-8).map((m) => ({ role: m.role, text: m.text }))
          })
        });
        if (res.ok) {
          const payload = await res.json();
          if (payload && typeof payload.text === "string" && payload.text.trim()) {
            return {
              text: payload.text.trim(),
              projectCards: Array.isArray(payload.projectCards) ? payload.projectCards : undefined,
              skillGroups: payload.skillGroups && typeof payload.skillGroups === "object" ? payload.skillGroups : undefined,
              actions: Array.isArray(payload.actions) ? payload.actions : [],
              suggestions: Array.isArray(payload.suggestions) ? payload.suggestions : []
            };
          }
        }
      } catch (_err) {
        // Gracefully fall back to local rule-based portfolio engine
      }
    }

    return generateGroundedReply(userText);
  }

  function configureBackend(options = {}) {
    state.backendOverride.enabled = true;
    if (options.mode === "backend" || options.mode === "local") {
      state.backendOverride.mode = options.mode;
    }
    if (typeof options.backendEndpoint === "string") {
      state.backendOverride.backendEndpoint = options.backendEndpoint.trim();
    }
  }

  function renderProjectCardsMarkup(projectCards) {
    if (!Array.isArray(projectCards) || projectCards.length === 0) return "";
    return `
      <div class="ca-project-grid" aria-label="Relevant project cards">
        ${projectCards
          .map((proj) => {
            const techLine = (proj.technologies || []).slice(0, 4).join(" · ");
            const href = proj.href || `project-details.html?id=${encodeURIComponent(proj.id)}`;
            return `
              <article class="ca-project-card">
                <div class="space-y-1.5">
                  <p class="text-[11px] font-medium text-cyan-400">${escHtml(proj.category)} · <span class="tabular-nums">${escHtml(proj.year || "")}</span></p>
                  <h3 class="text-sm font-bold text-[var(--text)]">${escHtml(proj.title)}</h3>
                  <p class="text-xs text-[var(--muted)] leading-relaxed">${escHtml(proj.description)}</p>
                </div>
                <div class="pt-2 border-t border-[var(--border)] space-y-2">
                  <p class="text-[11px] font-mono-tech text-[var(--text-secondary)]">${escHtml(techLine)}</p>
                  <a href="${escHtml(href)}" class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-cyan-400 transition-colors">
                    <span>View Case Study</span>
                    <i data-lucide="arrow-up-right" class="w-3.5 h-3.5" aria-hidden="true"></i>
                  </a>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderSkillGroupsMarkup(skillGroups) {
    if (!skillGroups || typeof skillGroups !== "object") return "";
    const entries = Object.entries(skillGroups).filter(([, list]) => Array.isArray(list) && list.length > 0);
    if (entries.length === 0) return "";
    return `
      <div class="ca-skill-grid" aria-label="Relevant portfolio skills">
        ${entries
          .map(([groupName, list]) => {
            const line = list.map((s) => `${s.name}`).join(" · ");
            return `
              <div class="ca-skill-card space-y-1">
                <h3 class="text-xs font-bold text-cyan-400">${escHtml(groupName)} (${list.length})</h3>
                <p class="text-xs text-[var(--text-secondary)] leading-relaxed">${escHtml(line)}</p>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderMessages() {
    const container = document.getElementById("ca-messages");
    if (!container) return;

    const html = state.messages
      .map((msg) => {
        const isUser = msg.role === "user";
        const projectsMarkup = !isUser ? renderProjectCardsMarkup(msg.projectCards) : "";
        const skillsMarkup = !isUser ? renderSkillGroupsMarkup(msg.skillGroups) : "";

        const actionsMarkup =
          !isUser && Array.isArray(msg.actions) && msg.actions.length > 0
            ? `<div class="ca-reply-links">
                ${msg.actions
                  .map(
                    (act) => `
                      <a href="${escHtml(act.href)}" class="ca-reply-link">
                        <span>${escHtml(act.label)}</span>
                        <i data-lucide="arrow-up-right" class="w-3.5 h-3.5" aria-hidden="true"></i>
                      </a>
                    `
                  )
                  .join("")}
              </div>`
            : "";

        const followUpsMarkup =
          !isUser && Array.isArray(msg.suggestions) && msg.suggestions.length > 0
            ? `<div class="ca-followups" role="group" aria-label="Suggested follow-up questions">
                ${msg.suggestions
                  .map(
                    (sug) => `
                      <button type="button" class="ca-followup-btn" data-ca-prompt="${escHtml(sug)}">
                        ${escHtml(sug)}
                      </button>
                    `
                  )
                  .join("")}
              </div>`
            : "";

        const copyBtnMarkup = !isUser
          ? `<button type="button" class="ca-copy-btn" data-ca-copy="${escHtml(msg.id)}" aria-label="Copy assistant response">
               <i data-lucide="copy" class="w-3 h-3" aria-hidden="true"></i>
               <span>Copy Response</span>
             </button>`
          : "";

        return `
          <div class="ca-msg ${isUser ? "is-user" : "is-assistant"}">
            <div class="ca-bubble">
              <p>${escHtml(msg.text)}</p>
              ${projectsMarkup}
              ${skillsMarkup}
              ${actionsMarkup}
            </div>
            ${followUpsMarkup}
            <div class="ca-msg-meta">
              <span class="tabular-nums">${escapeSafeTime(msg.timestamp)}</span>
              ${!isUser ? '<span>Portfolio Assistant</span>' : ""}
              ${copyBtnMarkup}
            </div>
          </div>
        `;
      })
      .join("");

    const typingMarkup = state.isTyping
      ? `<div class="ca-typing" role="status" aria-label="Portfolio Assistant is preparing grounded response">
           <span class="ca-typing-dot" aria-hidden="true"></span>
           <span class="ca-typing-dot" aria-hidden="true"></span>
           <span class="ca-typing-dot" aria-hidden="true"></span>
           <span class="text-xs text-[var(--muted)] ml-1">Checking portfolio data…</span>
         </div>`
      : "";

    container.innerHTML = html + typingMarkup;
    container.scrollTop = container.scrollHeight;

    container.querySelectorAll("[data-ca-copy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-ca-copy");
        const found = state.messages.find((m) => m.id === id);
        if (found) copyResponseText(found.text);
      });
    });

    container.querySelectorAll("[data-ca-prompt]").forEach((btn) => {
      btn.addEventListener("click", () => {
        sendMessage(btn.getAttribute("data-ca-prompt") || "");
      });
    });

    refreshIcons();
  }

  function escapeSafeTime(iso) {
    return escHtml(formatTime(iso));
  }

  function copyResponseText(text) {
    const done = () => showToast("Response copied to clipboard", "success");
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
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
        done();
      } catch (_err) {
        showToast("Unable to copy response automatically", "error");
      }
    }
  }

  function renderSidebar() {
    const listMount = document.getElementById("ca-suggested-list");
    if (listMount) {
      listMount.innerHTML = SUGGESTED_QUESTIONS.map(
        (promptText) => `
          <button type="button" class="ca-prompt-btn" data-ca-prompt="${escHtml(promptText)}">
            <span>${escHtml(promptText)}</span>
            <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 text-[var(--muted)] shrink-0" aria-hidden="true"></i>
          </button>
        `
      ).join("");

      listMount.querySelectorAll("[data-ca-prompt]").forEach((btn) => {
        btn.addEventListener("click", () => {
          sendMessage(btn.getAttribute("data-ca-prompt") || "");
        });
      });
    }

    const summaryMount = document.getElementById("ca-grounding-summary");
    if (summaryMount) {
      const data = readConfiguredData();
      summaryMount.textContent = `${data.projects.length} projects · ${data.skills.length} skills · ${data.services.length} services · ${data.experience.length} milestones · ${data.certificates.length} certificates`;
    }
  }

  function sendMessage(rawText) {
    const text = String(rawText || "").trim().slice(0, MAX_QUERY_LEN);
    const input = document.getElementById("ca-input");
    if (!text) {
      if (input && typeof input.focus === "function") input.focus();
      return;
    }

    state.messages.push({
      id: `ca-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: "user",
      text,
      timestamp: new Date().toISOString()
    });
    state.isTyping = true;
    saveHistory();
    renderMessages();

    if (input) input.value = "";

    const delayMs = reducedMotionEnabled() ? 0 : 260;
    window.setTimeout(async () => {
      const reply = await resolveReply(text);
      state.isTyping = false;
      state.messages.push({
        id: `ca-bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: "assistant",
        text: reply.text,
        projectCards: reply.projectCards,
        skillGroups: reply.skillGroups,
        actions: reply.actions || [],
        suggestions: reply.suggestions || [],
        timestamp: new Date().toISOString()
      });
      saveHistory();
      renderMessages();
    }, delayMs);
  }

  function init() {
    const root = document.getElementById("career-assistant-root");
    if (!root || state.initialized) return;
    state.initialized = true;

    state.messages = loadHistory();
    renderSidebar();
    renderMessages();

    const clearBtn = document.getElementById("ca-clear-btn");
    const form = document.getElementById("ca-form");
    const input = document.getElementById("ca-input");

    if (clearBtn) clearBtn.addEventListener("click", clearChat);

    if (form && input) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        sendMessage(input.value);
      });
    }

    // Optional initial query via URL (?q=...)
    try {
      const params = new URLSearchParams(window.location.search || "");
      const initialQ = params.get("q");
      if (initialQ && initialQ.trim()) {
        sendMessage(initialQ.trim());
      }
    } catch (_err) {
      // Ignore query parsing issues cleanly
    }

    refreshIcons();
  }

  return {
    init,
    sendMessage,
    clearChat,
    generateGroundedReply,
    resolveReply,
    configureBackend,
    SUGGESTED_QUESTIONS
  };
})();

window.PortfolioCareerAssistant = PortfolioCareerAssistant;
