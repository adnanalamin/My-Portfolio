/**
 * AL AMIN Portfolio OS — Phases 51 & 52: Safe Developer Terminal & Interactive CLI
 * Strict security: Zero eval(), zero OS/shell execution, interacts exclusively with
 * configured portfolio data (PortfolioData, portfolioConfig, PortfolioTheme).
 */
(() => {
  const SAFE_COMMANDS = [
    "help",
    "about",
    "whoami",
    "skills",
    "projects",
    "project",
    "services",
    "experience",
    "certificates",
    "github",
    "blog",
    "resume",
    "contact",
    "theme",
    "clear",
    "cls",
    "ls",
    "exit"
  ];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getPortfolioDataSnapshot() {
    const data = window.PortfolioData || {};
    const cfg = window.portfolioConfig || {};
    return {
      brand: cfg.brand || { displayName: "AL AMIN", professionalTitle: "Full-Stack Developer", location: "Bangladesh", email: "your-email@example.com" },
      github: cfg.github || { username: "octocat" },
      skills: typeof data.getSkills === "function" ? data.getSkills() : Array.isArray(data.skills) ? data.skills : [],
      projects: typeof data.getProjects === "function" ? data.getProjects() : Array.isArray(data.projects) ? data.projects : [],
      services: typeof data.getServices === "function" ? data.getServices() : Array.isArray(data.services) ? data.services : [],
      experience: typeof data.getExperience === "function" ? data.getExperience() : Array.isArray(data.experience) ? data.experience : [],
      certificates: typeof data.getCertificates === "function" ? data.getCertificates() : Array.isArray(data.certificates) ? data.certificates : [],
      blog: typeof data.getBlogPosts === "function" ? data.getBlogPosts() : Array.isArray(data.blogPosts) ? data.blogPosts : []
    };
  }

  function executeSafeCommand(rawInput, hooks = {}) {
    const input = String(rawInput || "").trim();
    if (!input) return { type: "noop", text: "" };

    const parts = input.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ").trim();
    const snap = getPortfolioDataSnapshot();

    switch (cmd) {
      case "help":
        return {
          type: "output",
          text: [
            "Available commands (portfolio-only safe parser):",
            "  about | whoami      Profile & engineering overview",
            "  skills              Configured technical stack & tiers",
            "  projects            Configured portfolio projects",
            "  project <name>      Inspect project (e.g. 'project astra')",
            "  services            Client & engineering services",
            "  experience          Work timeline & B.Sc. CSE",
            "  certificates        Verified credential items",
            "  github              GitHub username & links",
            "  blog                Published engineering articles",
            "  resume              Interactive CV summary & link",
            "  contact             Email & contact route",
            "  theme [dark|light]  Inspect or toggle color theme",
            "  ls                  List commands & core routes",
            "  clear | cls         Clear terminal screen",
            "  exit                Close terminal / return home"
          ].join("\n")
        };

      case "whoami":
      case "about":
        return {
          type: "output",
          text: [
            `${snap.brand.displayName || "AL AMIN"} — ${snap.brand.professionalTitle || "Full-Stack Developer"}`,
            `Location: ${snap.brand.location || "Bangladesh"}`,
            `Focus: ${snap.brand.currentFocus || "Full-Stack MERN, Next.js & Design Systems"}`,
            snap.brand.description || "Engineering scalable web systems with refined interface craft."
          ].join("\n")
        };

      case "skills":
        return {
          type: "output",
          text: snap.skills.length
            ? snap.skills.map((s) => `- ${s.name} [${s.category} · ${s.level}]`).join("\n")
            : "No skills data loaded."
        };

      case "projects":
        return {
          type: "output",
          text: snap.projects.length
            ? snap.projects
                .map((p) => `- ${p.title} (${p.category}, ${p.year}) -> ${(p.technologies || []).join(", ")}`)
                .concat(["", "Tip: run 'project astra' or 'project slideverse' for details."])
                .join("\n")
            : "No projects data loaded."
        };

      case "project": {
        if (!arg) {
          return {
            type: "output",
            text: "Usage: project <name>  (e.g. project astra, project nexora, project slideverse)"
          };
        }
        const q = arg.toLowerCase();
        const matches = snap.projects.filter(
          (p) =>
            String(p.title || "").toLowerCase().includes(q) ||
            String(p.id || "").toLowerCase().includes(q)
        );
        if (!matches.length) {
          return {
            type: "output",
            text: `No configured project matched "${arg}". Run 'projects' to list available projects.`
          };
        }
        const p = matches[0];
        return {
          type: "output",
          text: [
            `${p.title} (${p.category} · ${p.status || p.year})`,
            `Role: ${p.developmentRole || "Developer"}`,
            `Stack: ${(p.technologies || []).join(", ")}`,
            `Summary: ${p.description}`,
            `Route: project-details.html?id=${p.id}`
          ].join("\n")
        };
      }

      case "services":
        return {
          type: "output",
          text: snap.services.length
            ? snap.services.map((s, idx) => `${idx + 1}. ${s.title} — ${s.summary}`).join("\n")
            : "Services catalog: see services.html"
        };

      case "experience":
        return {
          type: "output",
          text: snap.experience.length
            ? snap.experience.map((e) => `- ${e.date}: ${e.title} @ ${e.organization}\n  ${e.description}`).join("\n")
            : "Experience timeline: see experience.html"
        };

      case "certificates":
        return {
          type: "output",
          text: snap.certificates.length
            ? snap.certificates.map((c) => `- ${c.title} (${c.issuer}, ${c.date} · ID: ${c.credentialId})`).join("\n")
            : "Certificates showcase: see certificates.html"
        };

      case "github":
        return {
          type: "output",
          text: [
            `Configured GitHub Handle: @${snap.github.username || "not-configured"}`,
            `Featured Repos: ${(snap.github.featuredRepos || []).join(", ")}`,
            "Pages: github.html | github-universe.html | coding-activity.html | opensource.html"
          ].join("\n")
        };

      case "blog":
        return {
          type: "output",
          text: snap.blog.length
            ? snap.blog.slice(0, 8).map((b) => `- [${b.category}] ${b.title}`).join("\n")
            : "Articles list available at blog.html"
        };

      case "resume":
        return {
          type: "output",
          text: [
            `Interactive Resume Builder: resume.html (Presets: Developer, Full-Stack, Frontend, Designer, Recruiter)`,
            `PDF Path: ${(snap.brand.resume && snap.brand.resume.url) || "assets/documents/resume.pdf"}`,
            `Job Description Matcher: resume-matcher.html`
          ].join("\n")
        };

      case "contact":
        return {
          type: "output",
          text: [
            `Email: ${snap.brand.email || "your-email@example.com"}`,
            `Location: ${snap.brand.location || "Bangladesh"}`,
            `Contact Form: contact.html | Scope Estimator: project-estimator.html | Project Request: project-request.html`
          ].join("\n")
        };

      case "theme": {
        const currentIsLight = document.documentElement.classList.contains("light");
        if (window.PortfolioTheme) {
          if (arg === "dark" && currentIsLight && typeof window.PortfolioTheme.toggleTheme === "function") {
            window.PortfolioTheme.toggleTheme();
          } else if (arg === "light" && !currentIsLight && typeof window.PortfolioTheme.toggleTheme === "function") {
            window.PortfolioTheme.toggleTheme();
          } else if (!arg && typeof window.PortfolioTheme.toggleTheme === "function") {
            window.PortfolioTheme.toggleTheme();
          }
        }
        const nowLight = document.documentElement.classList.contains("light");
        return {
          type: "output",
          text: `Theme set to ${nowLight ? "light" : "dark"} mode.`
        };
      }

      case "ls":
        return {
          type: "output",
          text: [
            "Sections: about/  skills/  projects/  services/  experience/  certificates/",
            "Tools:    github/  github-universe/  coding-activity/  dependency-map/  system-monitor/",
            "Commands: " + SAFE_COMMANDS.join("  ")
          ].join("\n")
        };

      case "cls":
      case "clear":
        return { type: "clear", text: "" };

      case "exit":
        if (typeof hooks.onExit === "function") {
          hooks.onExit();
        }
        return { type: "exit", text: "Closing terminal session." };

      default:
        return {
          type: "output",
          text: `Unknown command "${cmd}". Type 'help' for supported portfolio commands.`
        };
    }
  }

  function autocompleteCommand(partial) {
    const clean = String(partial || "").trim().toLowerCase();
    if (!clean) return SAFE_COMMANDS.slice(0, 6);
    if (clean.startsWith("project ")) {
      const arg = clean.slice(8);
      const snap = getPortfolioDataSnapshot();
      return snap.projects
        .map((p) => `project ${p.id}`)
        .filter((cmd) => cmd.startsWith(`project ${arg}`));
    }
    return SAFE_COMMANDS.filter((c) => c.startsWith(clean));
  }

  /* ========================================================================
     Floating Global Terminal Widget (Phase 51)
     ======================================================================== */
  const floatState = {
    open: false,
    minimized: false,
    maximized: false,
    history: [],
    historyIdx: -1
  };

  function appendOutputLine(bodyEl, cmdText, resultText) {
    if (!bodyEl) return;
    if (cmdText) {
      const cmdEl = document.createElement("div");
      cmdEl.className = "dt-entry-cmd";
      cmdEl.textContent = `alamin@portfolio:~$ ${cmdText}`;
      bodyEl.appendChild(cmdEl);
    }
    if (resultText) {
      const resEl = document.createElement("div");
      resEl.className = "dt-entry-output";
      resEl.textContent = resultText;
      bodyEl.appendChild(resEl);
    }
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function mountFloatingTerminal() {
    if (document.getElementById("dev-terminal-root")) return;

    const root = document.createElement("div");
    root.id = "dev-terminal-root";
    root.className = "dt-root";
    root.innerHTML = `
      <button type="button" id="dt-launcher-btn" class="dt-launcher" aria-label="Open Developer Terminal">
        <i data-lucide="terminal" class="w-4 h-4 text-cyan-400" aria-hidden="true"></i>
        <span class="hidden sm:inline">&gt;_ Terminal</span>
      </button>

      <section
        id="dt-window"
        class="dt-window"
        role="dialog"
        aria-modal="false"
        aria-labelledby="dt-window-title"
        aria-hidden="true"
      >
        <header class="dt-titlebar">
          <div class="flex items-center gap-2 min-w-0">
            <i data-lucide="terminal" class="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true"></i>
            <h2 id="dt-window-title" class="text-xs font-mono-tech font-bold text-slate-100 truncate">developer-terminal · portfolio</h2>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button type="button" id="dt-clear-btn" class="dt-chrome-btn text-[11px] font-mono-tech px-2" aria-label="Clear terminal output" title="Clear">cls</button>
            <button type="button" id="dt-min-btn" class="dt-chrome-btn" aria-label="Minimize terminal" aria-pressed="false" title="Minimize">
              <i data-lucide="minus" class="w-3.5 h-3.5" aria-hidden="true"></i>
            </button>
            <button type="button" id="dt-max-btn" class="dt-chrome-btn hidden sm:inline-flex" aria-label="Maximize terminal" aria-pressed="false" title="Maximize">
              <i data-lucide="maximize-2" class="w-3.5 h-3.5" aria-hidden="true"></i>
            </button>
            <button type="button" id="dt-close-btn" class="dt-chrome-btn" aria-label="Close terminal" title="Close">
              <i data-lucide="x" class="w-3.5 h-3.5" aria-hidden="true"></i>
            </button>
          </div>
        </header>

        <div id="dt-body" class="dt-body" aria-live="polite" role="log"></div>
        <div id="dt-suggestions" class="dt-suggestions" aria-label="Command suggestions"></div>

        <form id="dt-form" class="dt-form" novalidate>
          <span class="font-mono-tech text-xs text-cyan-400 shrink-0" aria-hidden="true">~$</span>
          <label for="dt-input" class="sr-only">Enter portfolio terminal command</label>
          <input
            id="dt-input"
            type="text"
            class="dt-input"
            placeholder="Type 'help', 'projects', 'skills', or press Tab..."
            autocomplete="off"
            spellcheck="false"
          >
          <button type="submit" class="dt-chip-btn text-cyan-300" aria-label="Run command">Run</button>
        </form>
      </section>
    `;

    document.body.appendChild(root);

    const launcher = document.getElementById("dt-launcher-btn");
    const win = document.getElementById("dt-window");
    const body = document.getElementById("dt-body");
    const suggestions = document.getElementById("dt-suggestions");
    const form = document.getElementById("dt-form");
    const input = document.getElementById("dt-input");
    const clearBtn = document.getElementById("dt-clear-btn");
    const minBtn = document.getElementById("dt-min-btn");
    const maxBtn = document.getElementById("dt-max-btn");
    const closeBtn = document.getElementById("dt-close-btn");

    appendOutputLine(body, "", "Developer Terminal ready. Type 'help' to inspect configured portfolio data.");

    function updateSuggestions(val) {
      if (!suggestions) return;
      const matches = autocompleteCommand(val).slice(0, 6);
      suggestions.innerHTML = matches
        .map((m) => `<button type="button" class="dt-chip-btn" data-dt-suggest="${esc(m)}">${esc(m)}</button>`)
        .join("");
      suggestions.querySelectorAll("[data-dt-suggest]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const picked = btn.getAttribute("data-dt-suggest");
          if (picked === "project") {
            input.value = "project ";
            input.focus();
            updateSuggestions(input.value);
          } else {
            runFloatingCommand(picked);
          }
        });
      });
    }

    function syncWindowState() {
      win.classList.toggle("is-open", floatState.open);
      win.classList.toggle("is-minimized", floatState.minimized);
      win.classList.toggle("is-maximized", floatState.maximized);
      win.setAttribute("aria-hidden", String(!floatState.open));
      launcher.classList.toggle("is-hidden", floatState.open);
      if (minBtn) minBtn.setAttribute("aria-pressed", String(floatState.minimized));
      if (maxBtn) maxBtn.setAttribute("aria-pressed", String(floatState.maximized));
    }

    function runFloatingCommand(rawCmd) {
      const trimmed = String(rawCmd || "").trim();
      if (!trimmed) return;
      floatState.history.unshift(trimmed);
      if (floatState.history.length > 40) floatState.history.pop();
      floatState.historyIdx = -1;

      const res = executeSafeCommand(trimmed, {
        onExit: () => {
          floatState.open = false;
          syncWindowState();
          launcher.focus();
        }
      });

      if (res.type === "clear") {
        body.innerHTML = "";
      } else if (res.type !== "exit") {
        appendOutputLine(body, trimmed, res.text);
      }

      input.value = "";
      updateSuggestions("");
    }

    launcher.addEventListener("click", () => {
      floatState.open = true;
      floatState.minimized = false;
      syncWindowState();
      window.setTimeout(() => input && input.focus(), 30);
    });

    closeBtn.addEventListener("click", () => {
      floatState.open = false;
      syncWindowState();
      launcher.focus();
    });

    minBtn.addEventListener("click", () => {
      floatState.minimized = !floatState.minimized;
      if (floatState.minimized) floatState.maximized = false;
      syncWindowState();
    });

    if (maxBtn) {
      maxBtn.addEventListener("click", () => {
        floatState.maximized = !floatState.maximized;
        if (floatState.maximized) floatState.minimized = false;
        syncWindowState();
      });
    }

    clearBtn.addEventListener("click", () => {
      body.innerHTML = "";
      input.focus();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      runFloatingCommand(input.value);
    });

    input.addEventListener("input", () => updateSuggestions(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (floatState.history.length) {
          floatState.historyIdx = Math.min(floatState.history.length - 1, floatState.historyIdx + 1);
          input.value = floatState.history[floatState.historyIdx];
          updateSuggestions(input.value);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (floatState.historyIdx > 0) {
          floatState.historyIdx -= 1;
          input.value = floatState.history[floatState.historyIdx];
        } else {
          floatState.historyIdx = -1;
          input.value = "";
        }
        updateSuggestions(input.value);
      } else if (e.key === "Tab") {
        const matches = autocompleteCommand(input.value);
        if (matches.length) {
          e.preventDefault();
          input.value = matches[0] === "project" ? "project " : matches[0];
          updateSuggestions(input.value);
        }
      } else if (e.key === "Escape") {
        floatState.open = false;
        syncWindowState();
        launcher.focus();
      }
    });

    updateSuggestions("");
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }

    window.PortfolioTerminal = {
      open: () => {
        floatState.open = true;
        floatState.minimized = false;
        syncWindowState();
        window.setTimeout(() => input && input.focus(), 30);
      },
      close: () => {
        floatState.open = false;
        syncWindowState();
      },
      run: runFloatingCommand
    };
  }

  /* ========================================================================
     Dedicated CLI Portfolio Page Controller (Phase 52: terminal.html)
     ======================================================================== */
  function initDedicatedCliPage() {
    const root = document.getElementById("cli-portfolio-root");
    if (!root || root.dataset.cliInit === "1") return;
    root.dataset.cliInit = "1";

    const body = document.getElementById("cli-body");
    const suggestions = document.getElementById("cli-suggestions");
    const form = document.getElementById("cli-form");
    const input = document.getElementById("cli-input");
    const clearBtn = document.getElementById("cli-clear-btn");

    const history = [];
    let historyIdx = -1;

    appendOutputLine(
      body,
      "",
      "Welcome to AL AMIN Interactive Portfolio.\nType 'help' for available commands, 'projects' or 'project astra' to explore case studies, or 'exit' to return to Home."
    );

    function syncSuggestions(val) {
      if (!suggestions) return;
      const list = autocompleteCommand(val).slice(0, 8);
      suggestions.innerHTML = list
        .map((m) => `<button type="button" class="dt-chip-btn" data-cli-suggest="${esc(m)}">${esc(m)}</button>`)
        .join("");
      suggestions.querySelectorAll("[data-cli-suggest]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const picked = btn.getAttribute("data-cli-suggest");
          if (picked === "project") {
            input.value = "project ";
            input.focus();
            syncSuggestions(input.value);
          } else {
            runPageCommand(picked);
          }
        });
      });
    }

    function runPageCommand(raw) {
      const trimmed = String(raw || "").trim();
      if (!trimmed) return;
      history.unshift(trimmed);
      if (history.length > 50) history.pop();
      historyIdx = -1;

      const res = executeSafeCommand(trimmed, {
        onExit: () => {
          window.location.href = "index.html";
        }
      });

      if (res.type === "clear") {
        body.innerHTML = "";
      } else {
        appendOutputLine(body, trimmed, res.text);
      }
      input.value = "";
      syncSuggestions("");
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        body.innerHTML = "";
        input.focus();
      });
    }

    if (form && input) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        runPageCommand(input.value);
      });
      input.addEventListener("input", () => syncSuggestions(input.value));
      input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          if (history.length) {
            historyIdx = Math.min(history.length - 1, historyIdx + 1);
            input.value = history[historyIdx];
            syncSuggestions(input.value);
          }
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (historyIdx > 0) {
            historyIdx -= 1;
            input.value = history[historyIdx];
          } else {
            historyIdx = -1;
            input.value = "";
          }
          syncSuggestions(input.value);
        } else if (e.key === "Tab") {
          const matches = autocompleteCommand(input.value);
          if (matches.length) {
            e.preventDefault();
            input.value = matches[0] === "project" ? "project " : matches[0];
            syncSuggestions(input.value);
          }
        }
      });
    }

    syncSuggestions("");
  }

  function init() {
    mountFloatingTerminal();
    initDedicatedCliPage();
  }

  window.PortfolioTerminalEngine = {
    init,
    executeSafeCommand,
    autocompleteCommand,
    SAFE_COMMANDS
  };
})();
