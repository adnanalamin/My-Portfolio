/**
 * AL AMIN Portfolio OS — Phase 49: GitHub Contribution Universe
 * Public GitHub REST API only (zero tokens), cached with TTL + rate-limit handling,
 * plus honest configured open-source fallback UI when GitHub data is unavailable.
 */
(() => {
  const CACHE_PREFIX = "alamin_gh_universe_v1_";
  const LANG_COLORS = {
    JavaScript: "#F1E05A",
    TypeScript: "#3178C6",
    HTML: "#E34C26",
    CSS: "#563D7C",
    Python: "#3572A5",
    Go: "#00ADD8",
    Java: "#B07219",
    Rust: "#DEA584",
    Other: "#6366F1"
  };

  let state = {
    username: "",
    loading: false,
    usingFallback: false,
    fromCache: false,
    notice: "",
    repos: [],
    languageFilter: "All",
    selectedRepoId: null
  };

  function esc(val) {
    return String(val == null ? "" : val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeUrl(raw) {
    if (!raw || typeof raw !== "string") return "";
    try {
      const parsed = new URL(raw);
      return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : "";
    } catch {
      return "";
    }
  }

  function formatDate(iso) {
    if (!iso) return "Configured Snapshot";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "Unknown";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function getGithubConfig() {
    const cfg = (window.portfolioConfig && window.portfolioConfig.github) || {};
    return {
      username: typeof cfg.username === "string" ? cfg.username.trim().replace(/^@+/, "") : "",
      apiBaseUrl: typeof cfg.apiBaseUrl === "string" && cfg.apiBaseUrl ? cfg.apiBaseUrl.replace(/\/+$/, "") : "https://api.github.com",
      cacheTtlMinutes: Number(cfg.cacheTtlMinutes) >= 0 ? Number(cfg.cacheTtlMinutes) : 15
    };
  }

  function getConfiguredFallbackRepos() {
    const projects = window.PortfolioData && typeof window.PortfolioData.getProjects === "function"
      ? window.PortfolioData.getProjects()
      : [];
    const ghData = window.PortfolioData && typeof window.PortfolioData.getGitHubData === "function"
      ? window.PortfolioData.getGitHubData()
      : null;

    const list = [];
    if (ghData && ghData.flagship) {
      list.push({
        id: "fallback-slideverse",
        name: ghData.flagship.name,
        language: "JavaScript",
        stargazers_count: null,
        forks_count: null,
        pushed_at: null,
        html_url: ghData.flagship.liveUrl || "opensource.html",
        description: ghData.flagship.description,
        isFallback: true
      });
    }
    projects.forEach((p) => {
      if (p.id === "slideverse") return;
      const primaryLang =
        (p.technologies || []).find((t) => ["JavaScript", "HTML5", "CSS3", "React", "Next.js", "Node.js"].includes(t)) || "JavaScript";
      list.push({
        id: `fallback-${p.id}`,
        name: p.title,
        language: primaryLang === "HTML5" ? "HTML" : primaryLang === "CSS3" ? "CSS" : primaryLang === "React" || primaryLang === "Next.js" || primaryLang === "Node.js" ? "JavaScript" : primaryLang,
        stargazers_count: null,
        forks_count: null,
        pushed_at: null,
        html_url: `project-details.html?id=${encodeURIComponent(p.id)}`,
        description: p.description,
        isFallback: true
      });
    });
    return list;
  }

  function readCache(username) {
    try {
      const raw = window.localStorage.getItem(`${CACHE_PREFIX}${username.toLowerCase()}`);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function writeCache(username, repos, ttlMinutes) {
    try {
      const record = {
        repos,
        cachedAt: Date.now(),
        expiresAt: Date.now() + ttlMinutes * 60 * 1000
      };
      window.localStorage.setItem(`${CACHE_PREFIX}${username.toLowerCase()}`, JSON.stringify(record));
    } catch {
      // Ignore storage quota errors
    }
  }

  function computeActivityWeight(repo) {
    if (repo.isFallback) return 18;
    const stars = Number(repo.stargazers_count || 0);
    const forks = Number(repo.forks_count || 0);
    let recency = 0;
    if (repo.pushed_at) {
      const days = Math.max(0, (Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24));
      recency = days < 30 ? 10 : days < 180 ? 5 : 1;
    }
    return Math.min(34, 12 + Math.sqrt(stars * 3 + forks * 4) * 3 + recency * 0.4);
  }

  function render() {
    const statusEl = document.getElementById("ghu-status-banner");
    const filtersEl = document.getElementById("ghu-lang-filters");
    const svgEl = document.getElementById("ghu-svg");
    const listEl = document.getElementById("ghu-list-grid");
    const detailEl = document.getElementById("ghu-inspector-mount");

    if (statusEl) {
      if (state.loading) {
        statusEl.innerHTML = `<p class="text-xs sm:text-sm text-cyan-400">Loading public GitHub universe for <strong>@${esc(state.username)}</strong>...</p>`;
      } else {
        const badge = state.usingFallback
          ? `<span class="text-amber-400 font-semibold">Configured Portfolio Fallback</span>`
          : state.fromCache
            ? `<span class="text-cyan-400 font-semibold">Cached Public GitHub Snapshot</span>`
            : `<span class="text-emerald-400 font-semibold">Live Public GitHub API</span>`;
        statusEl.innerHTML = `
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span>${badge} · ${state.repos.length} repositories mapped</span>
            ${state.notice ? `<span class="text-[var(--muted)]">${esc(state.notice)}</span>` : ""}
          </div>
        `;
      }
    }

    const langs = Array.from(new Set(state.repos.map((r) => r.language || "Other")));
    const filtered = state.languageFilter === "All"
      ? state.repos
      : state.repos.filter((r) => (r.language || "Other") === state.languageFilter);

    if (filtersEl) {
      filtersEl.innerHTML = [`All`, ...langs]
        .map(
          (l) =>
            `<button type="button" class="ghu-lang-filter ${state.languageFilter === l ? "is-active" : ""}" data-ghu-lang="${esc(l)}">${esc(l)}</button>`
        )
        .join("");
      filtersEl.querySelectorAll("[data-ghu-lang]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.languageFilter = btn.getAttribute("data-ghu-lang");
          render();
        });
      });
    }

    if (!filtered.some((r) => String(r.id) === String(state.selectedRepoId)) && filtered.length) {
      state.selectedRepoId = filtered[0].id;
    }

    // Group planets into orbital rings by language cluster
    if (svgEl) {
      const cx = 360;
      const cy = 240;
      const orbitRadii = [85, 138, 190];

      const orbitsSvg = orbitRadii
        .map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(148, 163, 184, 0.16)" stroke-dasharray="4 5" />`)
        .join("");

      const starSvg = `
        <circle cx="${cx}" cy="${cy}" r="28" fill="rgba(99, 102, 241, 0.24)" stroke="#818CF8" stroke-width="1.5" />
        <text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="#F8FAFC" font-size="11" font-weight="700" font-family="JetBrains Mono, monospace">
          @${esc((state.username || "github").slice(0, 11))}
        </text>
      `;

      const planetsSvg = filtered.slice(0, 18).map((repo, idx) => {
        const ringIdx = idx % orbitRadii.length;
        const radius = orbitRadii[ringIdx];
        const ringCount = Math.ceil(Math.min(filtered.length, 18) / orbitRadii.length);
        const angle = (Math.floor(idx / orbitRadii.length) / Math.max(1, ringCount)) * Math.PI * 2 + ringIdx * 0.7;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * (radius * 0.86);
        const rSize = computeActivityWeight(repo);
        const color = LANG_COLORS[repo.language] || LANG_COLORS.Other;
        const isSelected = String(repo.id) === String(state.selectedRepoId);

        return `
          <g
            class="ghu-planet ${isSelected ? "is-selected" : ""}"
            data-ghu-planet="${esc(repo.id)}"
            tabindex="0"
            role="button"
            aria-label="${esc(repo.name)} (${esc(repo.language || "Code")})"
          >
            <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(rSize + 6).toFixed(1)}" fill="${color}" fill-opacity="0.14" />
            <circle class="ghu-planet-core" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${rSize.toFixed(1)}" fill="${color}" stroke="#0F172A" stroke-width="1.5" />
            <text x="${px.toFixed(1)}" y="${(py + rSize + 13).toFixed(1)}" text-anchor="middle" fill="#CBD5E1" font-size="10.5" font-family="JetBrains Mono, monospace">
              ${esc(repo.name.length > 16 ? `${repo.name.slice(0, 14)}..` : repo.name)}
            </text>
          </g>
        `;
      }).join("");

      svgEl.innerHTML = orbitsSvg + starSvg + planetsSvg;
      svgEl.querySelectorAll("[data-ghu-planet]").forEach((pEl) => {
        const select = () => {
          state.selectedRepoId = pEl.getAttribute("data-ghu-planet");
          render();
        };
        pEl.addEventListener("click", select);
        pEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            select();
          }
        });
      });
    }

    if (listEl) {
      listEl.innerHTML = filtered
        .map((repo) => {
          const isSelected = String(repo.id) === String(state.selectedRepoId);
          return `
            <button type="button" class="ghu-planet-list-card ${isSelected ? "is-selected" : ""}" data-ghu-card="${esc(repo.id)}">
              <div class="flex items-center justify-between gap-2">
                <strong class="text-sm text-[var(--text)] truncate">${esc(repo.name)}</strong>
                <span class="text-[11px] font-mono-tech text-cyan-400 shrink-0">${esc(repo.language || "Other")}</span>
              </div>
              <p class="text-xs text-[var(--muted)] mt-1">
                ${repo.stargazers_count !== null ? `★ ${repo.stargazers_count} · Forks ${repo.forks_count}` : "Configured portfolio fallback"}
              </p>
            </button>
          `;
        })
        .join("");

      listEl.querySelectorAll("[data-ghu-card]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.selectedRepoId = btn.getAttribute("data-ghu-card");
          render();
        });
      });
    }

    if (detailEl) {
      const selected = filtered.find((r) => String(r.id) === String(state.selectedRepoId)) || filtered[0];
      if (!selected) {
        detailEl.innerHTML = `<p class="text-xs text-[var(--muted)]">No repository selected.</p>`;
      } else {
        const href = selected.isFallback ? selected.html_url : safeUrl(selected.html_url) || "#";
        const isExternal = !selected.isFallback && /^https?:\/\//i.test(href);
        detailEl.innerHTML = `
          <div class="space-y-4">
            <div class="space-y-1 border-b border-[var(--border)] pb-3">
              <span class="text-xs font-mono-tech uppercase tracking-wider text-cyan-400">${selected.isFallback ? "Configured Fallback Node" : "Repository Planet"}</span>
              <h2 class="text-lg font-bold text-[var(--text)]">${esc(selected.name)}</h2>
              <p class="text-xs text-[var(--muted)] leading-relaxed">${esc(selected.description || "No public repository description provided.")}</p>
            </div>

            <div class="grid grid-cols-2 gap-2.5 text-xs">
              <div class="p-2.5 rounded-lg border border-[var(--border)]">
                <div class="text-[var(--muted)]">Language</div>
                <div class="font-bold text-[var(--text)] mt-0.5">${esc(selected.language || "Not set")}</div>
              </div>
              <div class="p-2.5 rounded-lg border border-[var(--border)]">
                <div class="text-[var(--muted)]">Stars</div>
                <div class="font-bold font-mono-tech text-[var(--text)] mt-0.5">${selected.stargazers_count !== null ? esc(selected.stargazers_count) : "Unavailable"}</div>
              </div>
              <div class="p-2.5 rounded-lg border border-[var(--border)]">
                <div class="text-[var(--muted)]">Forks</div>
                <div class="font-bold font-mono-tech text-[var(--text)] mt-0.5">${selected.forks_count !== null ? esc(selected.forks_count) : "Unavailable"}</div>
              </div>
              <div class="p-2.5 rounded-lg border border-[var(--border)]">
                <div class="text-[var(--muted)]">Updated</div>
                <div class="font-bold text-[var(--text)] mt-0.5">${esc(formatDate(selected.pushed_at || selected.updated_at))}</div>
              </div>
            </div>

            <a href="${esc(href)}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ""} class="primary-button w-full justify-center text-xs min-h-[42px]">
              <span>${selected.isFallback ? "Inspect Project Case Study" : "Open on GitHub"}</span>
              <i data-lucide="external-link" class="w-4 h-4" aria-hidden="true"></i>
            </a>
          </div>
        `;
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons();
        }
      }
    }
  }

  async function fetchUniverse(usernameInput, forceRefresh = false) {
    const cfg = getGithubConfig();
    const username = (typeof usernameInput === "string" && usernameInput.trim() ? usernameInput : cfg.username).replace(/^@+/, "");
    state.username = username;

    if (!username) {
      state.usingFallback = true;
      state.fromCache = false;
      state.notice = "No GitHub username set in js/config.js; displaying configured fallback repositories.";
      state.repos = getConfiguredFallbackRepos();
      render();
      return;
    }

    const cached = readCache(username);
    if (!forceRefresh && cached && Array.isArray(cached.repos) && Date.now() < cached.expiresAt) {
      state.usingFallback = false;
      state.fromCache = true;
      state.notice = `Cached snapshot for @${username}`;
      state.repos = cached.repos;
      render();
      return;
    }

    state.loading = true;
    state.notice = "";
    render();

    try {
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timer = controller ? window.setTimeout(() => controller.abort(), 8000) : null;
      const res = await fetch(`${cfg.apiBaseUrl}/users/${encodeURIComponent(username)}/repos?per_page=30&sort=updated`, {
        headers: { Accept: "application/vnd.github+json" },
        signal: controller ? controller.signal : undefined
      });
      if (timer) window.clearTimeout(timer);

      if (!res.ok) {
        const isRate = res.status === 403 || res.status === 429;
        throw new Error(isRate ? `GitHub public API rate limit reached (HTTP ${res.status}).` : `GitHub returned HTTP ${res.status}.`);
      }

      const data = await res.json();
      const repos = Array.isArray(data) ? data : [];
      writeCache(username, repos, cfg.cacheTtlMinutes);

      state.loading = false;
      state.usingFallback = false;
      state.fromCache = false;
      state.notice = `Public GitHub API data for @${username}`;
      state.repos = repos.length ? repos : getConfiguredFallbackRepos();
      if (!repos.length) {
        state.usingFallback = true;
        state.notice = `@${username} returned 0 public repositories; showing configured fallback.`;
      }
      render();
    } catch (err) {
      state.loading = false;
      if (cached && Array.isArray(cached.repos) && cached.repos.length) {
        state.usingFallback = false;
        state.fromCache = true;
        state.notice = `${err.message} Showing cached GitHub snapshot.`;
        state.repos = cached.repos;
      } else {
        state.usingFallback = true;
        state.fromCache = false;
        state.notice = `${err.message} Showing configured portfolio fallback list.`;
        state.repos = getConfiguredFallbackRepos();
      }
      render();
    }
  }

  function init() {
    const root = document.getElementById("github-universe-root");
    if (!root || root.dataset.ghuInit === "1") return;
    root.dataset.ghuInit = "1";

    const form = document.getElementById("ghu-user-form");
    const input = document.getElementById("ghu-user-input");
    const refreshBtn = document.getElementById("ghu-refresh-btn");
    const cfg = getGithubConfig();
    if (input) input.value = cfg.username;

    if (form && input) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        fetchUniverse(input.value, false);
      });
    }
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        fetchUniverse(input ? input.value : cfg.username, true);
      });
    }

    fetchUniverse(cfg.username, false);
  }

  window.PortfolioGitHubUniverse = {
    init,
    fetchUniverse
  };
})();
