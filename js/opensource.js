/**
 * AL AMIN Portfolio — Phase 39: Open Source Hub (opensource.html)
 * Integrates Phase 14 PortfolioGitHub REST API & cache helpers with curated
 * portfolio open-source builds (highlighting SLIDEVERSE), repo/tech filters,
 * search, live statistics, and strictly non-fabricated public contributions.
 */

(() => {
  const CACHE_PREFIX = "alamin_gh_cache_v1_";

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

  function safeUrl(raw) {
    if (window.PortfolioGitHub && typeof window.PortfolioGitHub.safeHttpUrl === "function") {
      return window.PortfolioGitHub.safeHttpUrl(raw);
    }
    if (typeof raw !== "string") return "";
    const trimmed = raw.trim();
    if (!trimmed) return "";
    try {
      const u = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
      return u.protocol === "http:" || u.protocol === "https:" ? u.href : "";
    } catch (_) {
      return "";
    }
  }

  function formatShortDate(iso) {
    if (!iso) return "N/A";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function getSlideverseRecord() {
    const projects =
      window.PortfolioProjects && Array.isArray(window.PortfolioProjects.projectsData)
        ? window.PortfolioProjects.projectsData
        : [];
    const found = projects.find((p) => p.slug === "slideverse" || p.id === "slideverse");
    if (found) {
      return {
        id: "slideverse",
        name: found.title || "SLIDEVERSE",
        fullName: "Portfolio Open-Source Showcase · SLIDEVERSE",
        description: found.description || found.longDescription || "",
        longDescription: found.longDescription || found.overview || found.description || "",
        technologies: Array.isArray(found.technologies) ? found.technologies : ["JavaScript", "HTML5", "CSS3", "React", "Tailwind CSS", "Node.js"],
        year: found.year || "2025",
        caseStudyUrl: "project-details.html?id=slideverse",
        liveUrl: safeUrl(found.liveUrl || ""),
        githubUrl: safeUrl(found.githubUrl || ""),
        results: Array.isArray(found.results) ? found.results : [],
        isCuratedSpotlight: true
      };
    }

    return {
      id: "slideverse",
      name: "SLIDEVERSE",
      fullName: "Portfolio Open-Source Showcase · SLIDEVERSE",
      description:
        "Interactive browser-based presentation studio enabling creators to compose typography-first slide decks with live layout controls.",
      longDescription:
        "Browser-native slide authoring tool with scoped CSS custom property updates, keyboard presentation navigation, and portable JSON deck serialization.",
      technologies: ["JavaScript", "HTML5", "CSS3", "React", "Tailwind CSS", "Node.js"],
      year: "2025",
      caseStudyUrl: "project-details.html?id=slideverse",
      liveUrl: "",
      githubUrl: "",
      results: [
        "Zero-lag live preview for font scale, spacing, and alignment changes",
        "Keyboard shortcuts for rapid slide creation and presentation",
        "Clean exportable JSON deck format for portable sharing"
      ],
      isCuratedSpotlight: true
    };
  }

  function getPortfolioOpenSourceEntries(cfg, username) {
    const projects =
      window.PortfolioProjects && Array.isArray(window.PortfolioProjects.projectsData)
        ? window.PortfolioProjects.projectsData
        : [];

    const socialGh =
      window.portfolioConfig &&
      window.portfolioConfig.socialLinks &&
      window.portfolioConfig.socialLinks.github
        ? safeUrl(window.portfolioConfig.socialLinks.github)
        : "";

    const baseProfileUrl = socialGh || (username ? `https://github.com/${encodeURIComponent(username)}` : "");

    return projects.slice(0, 4).map((p) => {
      const liveDemo = safeUrl(p.liveUrl || "");
      const repoLink = safeUrl(p.githubUrl || "");
      return {
        id: `curated-${p.id}`,
        name: p.title,
        description: p.description || "",
        sourceKind: "portfolio",
        featured: p.id === "slideverse" || Boolean(p.featured),
        fork: false,
        language: (p.technologies && p.technologies[0]) || "JavaScript",
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
        stars: null,
        forks: null,
        openIssues: null,
        updatedAt: p.year || "",
        githubUrl: repoLink || (baseProfileUrl ? `${baseProfileUrl}` : ""),
        githubLabel: repoLink ? "GitHub Repo" : username ? `GitHub (@${username})` : "Not configured",
        liveUrl: liveDemo,
        caseStudyUrl: `project-details.html?id=${encodeURIComponent(p.id || p.slug)}`
      };
    });
  }

  async function fetchGitHubSnapshot(username, cfg, forceRefresh = false) {
    const cleanUser = String(username || "").trim().replace(/^@+/, "");
    if (!cleanUser) {
      return {
        ok: false,
        kind: "empty_user",
        message: "No GitHub username configured in js/config.js.",
        profile: null,
        repos: [],
        events: []
      };
    }

    const cacheKey = `${CACHE_PREFIX}${cleanUser.toLowerCase()}`;
    let cached = null;
    try {
      if (window.localStorage) {
        const raw = window.localStorage.getItem(cacheKey);
        if (raw) cached = JSON.parse(raw);
      }
    } catch (_) {
      cached = null;
    }

    if (!forceRefresh && cached && cached.profile && Date.now() < Number(cached.expiresAt || 0)) {
      return {
        ok: true,
        fromCache: true,
        cachedAt: cached.cachedAt,
        profile: cached.profile,
        repos: Array.isArray(cached.repos) ? cached.repos : [],
        events: Array.isArray(cached.events) ? cached.events : []
      };
    }

    const apiBase = (cfg.apiBaseUrl || "https://api.github.com").replace(/\/+$/, "");
    const enc = encodeURIComponent(cleanUser);
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? window.setTimeout(() => controller.abort(), 9500) : null;

    try {
      const fetchJson = async (url) => {
        const res = await fetch(url, {
          headers: { Accept: "application/vnd.github+json" },
          signal: controller ? controller.signal : undefined
        });
        if (!res.ok) {
          const err = new Error(`GitHub HTTP ${res.status}`);
          err.status = res.status;
          throw err;
        }
        return res.json();
      };

      const [profile, repos, events] = await Promise.all([
        fetchJson(`${apiBase}/users/${enc}`),
        fetchJson(`${apiBase}/users/${enc}/repos?per_page=${cfg.perPage || 100}&sort=updated`),
        fetchJson(`${apiBase}/users/${enc}/events/public?per_page=${cfg.eventsLimit || 8}`).catch(() => [])
      ]);

      const now = Date.now();
      const ttl = Number(cfg.cacheTtlMinutes >= 0 ? cfg.cacheTtlMinutes : 15) * 60 * 1000;
      try {
        if (window.localStorage) {
          window.localStorage.setItem(
            cacheKey,
            JSON.stringify({
              profile,
              repos: Array.isArray(repos) ? repos : [],
              events: Array.isArray(events) ? events : [],
              cachedAt: now,
              expiresAt: now + ttl
            })
          );
        }
      } catch (_) {
        // Ignore storage write errors
      }

      return {
        ok: true,
        fromCache: false,
        cachedAt: now,
        profile,
        repos: Array.isArray(repos) ? repos : [],
        events: Array.isArray(events) ? events : []
      };
    } catch (err) {
      if (cached && cached.profile) {
        return {
          ok: true,
          fromCache: true,
          stale: true,
          warning: `Could not reach live GitHub API (${err.message}). Showing cached snapshot.`,
          cachedAt: cached.cachedAt,
          profile: cached.profile,
          repos: Array.isArray(cached.repos) ? cached.repos : [],
          events: Array.isArray(cached.events) ? cached.events : []
        };
      }
      return {
        ok: false,
        kind: err.status === 404 ? "not_found" : "network",
        message:
          err.status === 404
            ? `GitHub user "@${cleanUser}" was not found.`
            : "Live GitHub API unavailable in this environment. Curated portfolio open-source builds remain accessible below.",
        profile: null,
        repos: [],
        events: []
      };
    } finally {
      if (timer) window.clearTimeout(timer);
    }
  }

  function init() {
    const root = document.getElementById("opensource-hub-root");
    if (!root) return;

    const ghApi = window.PortfolioGitHub || {};
    const cfg = typeof ghApi.getConfig === "function" ? ghApi.getConfig() : (window.portfolioConfig && window.portfolioConfig.github) || {};
    const initialUser =
      typeof ghApi.resolveUsername === "function"
        ? ghApi.resolveUsername()
        : (cfg.username || "").replace(/^@+/, "");

    const slideverse = getSlideverseRecord();

    const state = {
      username: initialUser,
      loading: true,
      apiNotice: "",
      profile: null,
      ghRepos: [],
      ghEvents: [],
      curatedRepos: getPortfolioOpenSourceEntries(cfg, initialUser),
      repoFilter: "All", // "All" | "Featured" | "Portfolio Builds" | "GitHub Sources" | "Forks"
      techFilter: "All",
      searchQuery: "",
      sortBy: "stars" // "stars" | "updated" | "name"
    };

    const spotlightEl = document.getElementById("os-featured-spotlight");
    const statsEl = document.getElementById("os-stats-strip");
    const userForm = document.getElementById("os-user-form");
    const userInput = document.getElementById("os-username-input");
    const refreshBtn = document.getElementById("os-refresh-btn");
    const noticeEl = document.getElementById("os-api-notice");
    const searchInput = document.getElementById("os-search-input");
    const repoFiltersEl = document.getElementById("os-repo-filters");
    const techFiltersEl = document.getElementById("os-tech-filters");
    const sortSelect = document.getElementById("os-sort-select");
    const resetBtn = document.getElementById("os-reset-btn");
    const repoGridEl = document.getElementById("os-repo-grid");
    const repoCountEl = document.getElementById("os-repo-count");
    const techPanelEl = document.getElementById("os-tech-stats-panel");
    const contribPanelEl = document.getElementById("os-contributions-panel");

    if (userInput) userInput.value = state.username;

    function normalizeCombinedRepositories() {
      const ghFeaturedNames = new Set((cfg.featuredRepos || []).map((n) => String(n).toLowerCase()));

      const liveMapped = state.ghRepos.map((repo) => {
        const topics = Array.isArray(repo.topics) ? repo.topics : [];
        const techSet = [];
        if (repo.language) techSet.push(repo.language);
        topics.forEach((t) => {
          if (!techSet.includes(t)) techSet.push(t);
        });
        return {
          id: `gh-${repo.id || repo.name}`,
          name: repo.name || "Untitled Repo",
          description: repo.description || "Public repository hosted on GitHub.",
          sourceKind: "github",
          featured: ghFeaturedNames.has(String(repo.name || "").toLowerCase()),
          fork: Boolean(repo.fork),
          language: repo.language || "Markdown",
          technologies: techSet,
          stars: typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0,
          forks: typeof repo.forks_count === "number" ? repo.forks_count : 0,
          openIssues: typeof repo.open_issues_count === "number" ? repo.open_issues_count : 0,
          updatedAt: formatShortDate(repo.pushed_at || repo.updated_at),
          updatedRaw: repo.pushed_at || repo.updated_at || "",
          githubUrl: safeUrl(repo.html_url || ""),
          githubLabel: "GitHub Repository",
          liveUrl: safeUrl(repo.homepage || ""),
          caseStudyUrl: ""
        };
      });

      return [...state.curatedRepos, ...liveMapped];
    }

    function renderSpotlight() {
      if (!spotlightEl) return;
      const ghMatch = state.ghRepos.find((r) => String(r.name || "").toLowerCase() === "slideverse");
      const ghLink = ghMatch
        ? safeUrl(ghMatch.html_url)
        : slideverse.githubUrl || (state.username ? `https://github.com/${encodeURIComponent(state.username)}` : "");
      const demoLink = (ghMatch && safeUrl(ghMatch.homepage)) || slideverse.liveUrl;

      const techLine = slideverse.technologies.map((t) => escHtml(t)).join(" · ");
      const resultsMarkup = slideverse.results
        .slice(0, 3)
        .map((r) => `<li class="text-xs sm:text-sm text-[var(--text-secondary)]">• ${escHtml(r)}</li>`)
        .join("");

      spotlightEl.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div class="lg:col-span-8 space-y-3">
            <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              <span class="font-semibold text-cyan-400">Featured Open-Source Repository</span>
              <span aria-hidden="true">·</span>
              <span>Creative Web Tooling (${escHtml(slideverse.year)})</span>
              ${
                ghMatch
                  ? `<span aria-hidden="true">·</span><span class="font-mono-tech tabular-nums text-[var(--text-secondary)]">${ghMatch.stargazers_count || 0} stars on GitHub</span>`
                  : ""
              }
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-[var(--text)]">${escHtml(slideverse.name)}</h2>
            <p class="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">${escHtml(slideverse.longDescription)}</p>
            <p class="text-xs font-mono-tech text-[var(--muted)]">Stack: ${techLine}</p>
            <ul class="space-y-1 list-none p-0 m-0 pt-1">${resultsMarkup}</ul>
          </div>

          <div class="lg:col-span-4 flex flex-col gap-2.5">
            ${
              ghLink
                ? `<a href="${escHtml(ghLink)}" target="_blank" rel="noopener noreferrer" class="primary-button justify-center min-h-[42px]">
                     <i data-lucide="github" class="w-4 h-4"></i>
                     <span>${ghMatch ? "View SLIDEVERSE on GitHub" : `GitHub Profile (@${escHtml(state.username || "github")})`}</span>
                   </a>`
                : `<a href="github.html" class="primary-button justify-center min-h-[42px]">
                     <i data-lucide="github" class="w-4 h-4"></i>
                     <span>Open GitHub Explorer</span>
                   </a>`
            }
            ${
              demoLink
                ? `<a href="${escHtml(demoLink)}" target="_blank" rel="noopener noreferrer" class="secondary-button justify-center min-h-[42px]">
                     <i data-lucide="external-link" class="w-4 h-4"></i>
                     <span>Live Demo</span>
                   </a>`
                : `<a href="playground.html" class="secondary-button justify-center min-h-[42px]">
                     <i data-lucide="terminal" class="w-4 h-4"></i>
                     <span>Interactive Browser Sandbox</span>
                   </a>`
            }
            <a href="${escHtml(slideverse.caseStudyUrl)}" class="outline-button justify-center min-h-[42px]">
              <i data-lucide="book-open" class="w-4 h-4"></i>
              <span>Architecture Case Study</span>
            </a>
          </div>
        </div>
      `;
    }

    function renderStatsStrip(allRepos) {
      if (!statsEl) return;
      const liveRepos = state.ghRepos;
      const totalStars = liveRepos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
      const totalForks = liveRepos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
      const langStats =
        typeof ghApi.computeLanguageStats === "function"
          ? ghApi.computeLanguageStats(liveRepos, true)
          : { totalAnalyzed: 0, entries: [] };
      const topLang = langStats.entries.length > 0 ? langStats.entries[0].language : slideverse.technologies[0];

      statsEl.innerHTML = `
        <div class="os-stat-card">
          <span class="text-xs text-[var(--muted)]">GitHub Public Repos</span>
          <span class="text-xl font-extrabold font-mono-tech tabular-nums text-[var(--text)]">${state.loading ? "..." : liveRepos.length}</span>
        </div>
        <div class="os-stat-card">
          <span class="text-xs text-[var(--muted)]">Curated Showcase Builds</span>
          <span class="text-xl font-extrabold font-mono-tech tabular-nums text-[var(--text)]">${state.curatedRepos.length}</span>
        </div>
        <div class="os-stat-card">
          <span class="text-xs text-[var(--muted)]">GitHub Repo Stars</span>
          <span class="text-xl font-extrabold font-mono-tech tabular-nums text-[var(--text)]">${state.loading ? "..." : totalStars}</span>
        </div>
        <div class="os-stat-card">
          <span class="text-xs text-[var(--muted)]">GitHub Forks</span>
          <span class="text-xl font-extrabold font-mono-tech tabular-nums text-[var(--text)]">${state.loading ? "..." : totalForks}</span>
        </div>
        <div class="os-stat-card col-span-2 md:col-span-1">
          <span class="text-xs text-[var(--muted)]">Primary Language</span>
          <span class="text-base font-bold text-cyan-400 truncate">${escHtml(topLang)}</span>
        </div>
      `;
    }

    function renderFilterControls(allRepos) {
      if (repoFiltersEl) {
        const categories = ["All", "Featured", "Portfolio Builds", "GitHub Sources", "Forks"];
        repoFiltersEl.innerHTML = categories
          .map((cat) => {
            const active = state.repoFilter === cat;
            return `
              <button
                type="button"
                role="tab"
                aria-selected="${active ? "true" : "false"}"
                class="os-filter-btn ${active ? "is-active" : ""}"
                data-os-repo-filter="${escHtml(cat)}"
              >
                ${escHtml(cat)}
              </button>
            `;
          })
          .join("");

        repoFiltersEl.querySelectorAll("[data-os-repo-filter]").forEach((btn) => {
          btn.addEventListener("click", () => {
            state.repoFilter = btn.getAttribute("data-os-repo-filter") || "All";
            renderDynamicViews();
          });
        });
      }

      if (techFiltersEl) {
        const techCounts = new Map();
        allRepos.forEach((r) => {
          (r.technologies || []).forEach((t) => {
            techCounts.set(t, (techCounts.get(t) || 0) + 1);
          });
        });
        const topTechs = [
          "All",
          ...Array.from(techCounts.entries())
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .slice(0, 11)
            .map((e) => e[0])
        ];

        techFiltersEl.innerHTML = topTechs
          .map((tech) => {
            const active = state.techFilter === tech;
            return `
              <button
                type="button"
                aria-pressed="${active ? "true" : "false"}"
                class="os-filter-btn ${active ? "is-active" : ""}"
                data-os-tech-filter="${escHtml(tech)}"
              >
                ${escHtml(tech)}
              </button>
            `;
          })
          .join("");

        techFiltersEl.querySelectorAll("[data-os-tech-filter]").forEach((btn) => {
          btn.addEventListener("click", () => {
            state.techFilter = btn.getAttribute("data-os-tech-filter") || "All";
            renderDynamicViews();
          });
        });
      }
    }

    function getFilteredRepositories(allRepos) {
      const q = state.searchQuery.trim().toLowerCase();
      const filtered = allRepos.filter((repo) => {
        if (state.repoFilter === "Featured" && !repo.featured) return false;
        if (state.repoFilter === "Portfolio Builds" && repo.sourceKind !== "portfolio") return false;
        if (state.repoFilter === "GitHub Sources" && (repo.sourceKind !== "github" || repo.fork)) return false;
        if (state.repoFilter === "Forks" && !repo.fork) return false;

        if (state.techFilter !== "All") {
          const tTarget = state.techFilter.toLowerCase();
          const hasTech =
            String(repo.language || "").toLowerCase() === tTarget ||
            (repo.technologies || []).some((t) => String(t).toLowerCase() === tTarget);
          if (!hasTech) return false;
        }

        if (!q) return true;
        const hay = `${repo.name} ${repo.description} ${repo.language} ${(repo.technologies || []).join(" ")}`.toLowerCase();
        return hay.includes(q);
      });

      filtered.sort((a, b) => {
        if (state.sortBy === "name") return a.name.localeCompare(b.name);
        if (state.sortBy === "updated") {
          return new Date(b.updatedRaw || b.updatedAt || 0).getTime() - new Date(a.updatedRaw || a.updatedAt || 0).getTime();
        }
        return (b.stars ?? -1) - (a.stars ?? -1) || (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });

      return filtered;
    }

    function renderRepositoriesGrid(filtered) {
      if (repoCountEl) {
        repoCountEl.textContent = `${filtered.length} ${filtered.length === 1 ? "repository" : "repositories"}`;
      }
      if (!repoGridEl) return;

      if (state.loading && filtered.length === 0) {
        repoGridEl.innerHTML = `<div class="os-panel md:col-span-2 text-sm text-[var(--muted)]">Fetching public GitHub repositories...</div>`;
        return;
      }

      if (filtered.length === 0) {
        repoGridEl.innerHTML = `
          <div class="os-panel md:col-span-2 text-center space-y-3 py-8">
            <p class="text-base font-bold text-[var(--text)]">No matching repositories found</p>
            <p class="text-xs sm:text-sm text-[var(--muted)]">Clear the active technology filter or search query to inspect all repositories.</p>
          </div>
        `;
        return;
      }

      repoGridEl.innerHTML = filtered
        .map((repo) => {
          const sourceLabel =
            repo.sourceKind === "portfolio"
              ? "Portfolio Project"
              : repo.fork
              ? "GitHub Fork"
              : "GitHub Repository";

          const statsText =
            repo.sourceKind === "github"
              ? `${repo.stars} stars · ${repo.forks} forks · Updated ${repo.updatedAt}`
              : `Release ${repo.updatedAt || "2025"}`;

          const techLine = (repo.technologies || []).slice(0, 6).map((t) => escHtml(t)).join(" · ");

          return `
            <article class="os-repo-card">
              <div class="space-y-2.5">
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
                  <span class="font-semibold text-cyan-400">${escHtml(sourceLabel)}${repo.featured ? " · Featured" : ""}</span>
                  <span class="font-mono-tech tabular-nums">${escHtml(statsText)}</span>
                </div>

                <h3 class="text-lg font-bold text-[var(--text)]">${escHtml(repo.name)}</h3>
                <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(repo.description)}</p>
                <p class="text-xs font-mono-tech text-[var(--muted)]">${techLine || escHtml(repo.language)}</p>
              </div>

              <div class="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--border)]">
                ${
                  repo.githubUrl
                    ? `<a href="${escHtml(repo.githubUrl)}" target="_blank" rel="noopener noreferrer" class="outline-button text-xs min-h-[36px]">
                         <i data-lucide="github" class="w-3.5 h-3.5"></i>
                         <span>${escHtml(repo.githubLabel)}</span>
                       </a>`
                    : `<span class="text-xs text-[var(--muted)] font-mono-tech">GitHub link: Configure in js/config.js</span>`
                }
                ${
                  repo.liveUrl
                    ? `<a href="${escHtml(repo.liveUrl)}" target="_blank" rel="noopener noreferrer" class="secondary-button text-xs min-h-[36px]">
                         <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                         <span>Live Demo</span>
                       </a>`
                    : repo.caseStudyUrl
                    ? `<a href="${escHtml(repo.caseStudyUrl)}" class="secondary-button text-xs min-h-[36px]">
                         <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                         <span>Case Study</span>
                       </a>`
                    : ""
                }
              </div>
            </article>
          `;
        })
        .join("");
    }

    function renderTechnologyStats() {
      if (!techPanelEl) return;
      const stats =
        typeof ghApi.computeLanguageStats === "function"
          ? ghApi.computeLanguageStats(state.ghRepos, true)
          : { totalAnalyzed: 0, entries: [] };

      if (stats.entries.length === 0) {
        techPanelEl.innerHTML = `
          <div class="space-y-2">
            <h2 class="text-base font-bold text-[var(--text)]">Repository Technology Breakdown</h2>
            <p class="text-xs sm:text-sm text-[var(--muted)]">
              ${state.loading ? "Analyzing repository languages..." : "Live GitHub repository language metrics appear once connected to a public GitHub profile with non-forked repositories."}
            </p>
          </div>
        `;
        return;
      }

      const topEntries = stats.entries.slice(0, 6);
      const segments = topEntries
        .map(
          (entry) =>
            `<span style="width: ${entry.percent}%; background-color: ${escHtml(entry.color)};" title="${escHtml(entry.language)}: ${entry.percent}%"></span>`
        )
        .join("");

      const rows = topEntries
        .map(
          (entry) => `
            <div class="os-lang-row">
              <span class="flex items-center gap-2 font-semibold text-[var(--text-secondary)]">
                <span class="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style="background-color: ${escHtml(entry.color)};"></span>
                <span>${escHtml(entry.language)}</span>
              </span>
              <span class="font-mono-tech tabular-nums text-[var(--muted)]">${entry.count} repos (${entry.percent}%)</span>
            </div>
          `
        )
        .join("");

      techPanelEl.innerHTML = `
        <div class="space-y-1">
          <h2 class="text-base font-bold text-[var(--text)]">GitHub Language Distribution</h2>
          <p class="text-xs text-[var(--muted)]">Calculated from ${stats.totalAnalyzed} live non-forked public repositories.</p>
        </div>
        <div class="os-lang-bar" aria-hidden="true">${segments}</div>
        <div class="space-y-2">${rows}</div>
      `;
    }

    function renderContributionsPanel() {
      if (!contribPanelEl) return;

      const events = state.ghEvents || [];
      let feedHtml = "";

      if (state.loading) {
        feedHtml = `<p class="text-xs sm:text-sm text-[var(--muted)]">Loading public GitHub events...</p>`;
      } else if (events.length === 0) {
        feedHtml = `
          <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            No recent public events were returned from <code class="font-mono-tech">api.github.com/users/${escHtml(state.username || "username")}/events/public</code>. Only live GitHub API events are shown—synthetic contribution counts are intentionally excluded.
          </p>
        `;
      } else {
        feedHtml = events
          .slice(0, 6)
          .map((ev) => {
            const summary =
              typeof ghApi.formatEventSummary === "function"
                ? ghApi.formatEventSummary(ev)
                : { icon: "activity", action: (ev && ev.type) || "Public activity" };
            const repoName = (ev && ev.repo && ev.repo.name) || "repository";
            const repoHref = `https://github.com/${repoName}`;
            return `
              <div class="os-event-item">
                <div class="space-y-0.5 min-w-0">
                  <p class="text-xs sm:text-sm font-semibold text-[var(--text)]">${escHtml(summary.action)}</p>
                  <a href="${escHtml(repoHref)}" target="_blank" rel="noopener noreferrer" class="text-xs font-mono-tech text-cyan-400 hover:underline truncate block">${escHtml(repoName)}</a>
                </div>
                <span class="text-xs font-mono-tech tabular-nums text-[var(--muted)] shrink-0">${formatShortDate(ev.created_at)}</span>
              </div>
            `;
          })
          .join("");
      }

      contribPanelEl.innerHTML = `
        <div class="space-y-1">
          <h2 class="text-base font-bold text-[var(--text)]">Public Contribution Activity &amp; Guidelines</h2>
          <p class="text-xs text-[var(--muted)]">Live GitHub public events feed (never fabricated) and contribution standards.</p>
        </div>

        <div>${feedHtml}</div>

        <div class="pt-3 border-t border-[var(--border)] space-y-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-indigo-400">Open-Source Contribution Workflow</h3>
          <ul class="space-y-1 text-xs text-[var(--muted)] list-disc pl-4 m-0">
            <li>Open an issue describing bug reproduction steps or architecture scope before large PRs.</li>
            <li>Keep commits focused, test across mobile (320px) and desktop viewports, and avoid unverified dependencies.</li>
            <li>Verify accessibility focus states and zero leaked credentials before submitting changes.</li>
          </ul>
        </div>
      `;
    }

    function renderDynamicViews() {
      const allRepos = normalizeCombinedRepositories();
      if (noticeEl) {
        noticeEl.textContent = state.apiNotice || "";
        noticeEl.classList.toggle("hidden", !state.apiNotice);
      }
      renderSpotlight();
      renderStatsStrip(allRepos);
      renderFilterControls(allRepos);
      const filtered = getFilteredRepositories(allRepos);
      renderRepositoriesGrid(filtered);
      renderTechnologyStats();
      renderContributionsPanel();
      refreshIcons();
    }

    async function loadHubData(username, forceRefresh = false) {
      state.loading = true;
      state.apiNotice = "";
      state.username = String(username || "").trim().replace(/^@+/, "");
      state.curatedRepos = getPortfolioOpenSourceEntries(cfg, state.username);
      renderDynamicViews();

      const snap = await fetchGitHubSnapshot(state.username, cfg, forceRefresh);
      state.loading = false;
      if (snap.ok) {
        state.profile = snap.profile;
        state.ghRepos = snap.repos;
        state.ghEvents = snap.events;
        state.apiNotice = snap.stale
          ? snap.warning
          : `Connected to GitHub user @${state.username}${snap.fromCache ? " (cached snapshot)" : " (live API)"}.`;
      } else {
        state.profile = null;
        state.ghRepos = [];
        state.ghEvents = [];
        state.apiNotice = snap.message;
      }

      renderDynamicViews();
    }

    if (userForm && userInput) {
      userForm.addEventListener("submit", (event) => {
        event.preventDefault();
        loadHubData(userInput.value, false);
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        loadHubData(state.username, true);
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.searchQuery = searchInput.value;
        const allRepos = normalizeCombinedRepositories();
        renderRepositoriesGrid(getFilteredRepositories(allRepos));
        refreshIcons();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        state.sortBy = sortSelect.value || "stars";
        renderDynamicViews();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.repoFilter = "All";
        state.techFilter = "All";
        state.searchQuery = "";
        state.sortBy = "stars";
        if (searchInput) searchInput.value = "";
        if (sortSelect) sortSelect.value = "stars";
        renderDynamicViews();
      });
    }

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "/" &&
        searchInput &&
        document.activeElement !== searchInput &&
        !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement && document.activeElement.tagName) || "")
      ) {
        event.preventDefault();
        searchInput.focus();
      }
    });

    loadHubData(state.username, false);
  }

  window.PortfolioOpenSourceHub = {
    init,
    getSlideverseRecord
  };
})();
