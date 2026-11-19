/**
 * AL AMIN Portfolio — Live GitHub REST API Integration (Phase 14)
 * Reads configuration exclusively from window.portfolioConfig.github (js/config.js).
 * Supports caching with TTL, rate-limit handling, stale-cache fallback, featured repo
 * verification, language statistics, repository search/filter/sort/load-more, and recent public activity.
 */

const PortfolioGitHub = (() => {
  const CACHE_PREFIX = "alamin_gh_cache_v1_";
  const memoryFallbackCache = new Map();

  const LANGUAGE_COLORS = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    HTML: "#e34c26",
    CSS: "#563d7c",
    SCSS: "#c6538c",
    Python: "#3572a5",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    "C#": "#178600",
    Go: "#00add8",
    Rust: "#dea584",
    PHP: "#4f5d95",
    Ruby: "#701516",
    Shell: "#89e051",
    Dart: "#00b4ab",
    Kotlin: "#a97bff",
    Swift: "#f05138",
    Vue: "#41b883",
    Svelte: "#ff3e00",
    Jupyter: "#da5b0b"
  };

  let state = {
    activeUsername: "",
    loading: false,
    error: null, // { kind: 'not_found'|'rate_limit'|'network'|'empty_user'|'api', message: string, resetAt?: string }
    staleWarning: "",
    fromCache: false,
    cachedAt: null,
    rateLimit: null, // { limit, remaining, reset }
    profile: null,
    repos: [],
    events: [],
    searchQuery: "",
    languageFilter: "All",
    sortBy: "stars", // "stars" | "updated" | "forks" | "name"
    excludeForksInLangs: true,
    visibleCount: 6
  };

  function getConfig() {
    const rootCfg = window.portfolioConfig || {};
    const gh = rootCfg.github || {};
    return {
      username: typeof gh.username === "string" ? gh.username.trim() : "",
      featuredRepos: Array.isArray(gh.featuredRepos) ? gh.featuredRepos : [],
      excludeForksFromLanguages: gh.excludeForksFromLanguages !== false,
      perPage: Number(gh.perPage) > 0 ? Math.min(100, Number(gh.perPage)) : 100,
      initialDisplayCount: Number(gh.initialDisplayCount) > 0 ? Number(gh.initialDisplayCount) : 6,
      loadMoreStep: Number(gh.loadMoreStep) > 0 ? Number(gh.loadMoreStep) : 6,
      cacheTtlMinutes: Number(gh.cacheTtlMinutes) >= 0 ? Number(gh.cacheTtlMinutes) : 15,
      eventsLimit: Number(gh.eventsLimit) > 0 ? Math.min(30, Number(gh.eventsLimit)) : 8,
      apiBaseUrl: typeof gh.apiBaseUrl === "string" && gh.apiBaseUrl ? gh.apiBaseUrl.replace(/\/+$/, "") : "https://api.github.com"
    };
  }

  function resolveUsername(overrideUsername) {
    if (typeof overrideUsername === "string") {
      return overrideUsername.trim().replace(/^@+/, "");
    }
    const cfg = getConfig();
    if (cfg.username) {
      return cfg.username.replace(/^@+/, "");
    }
    const socialUrl = window.portfolioConfig && window.portfolioConfig.socialLinks && window.portfolioConfig.socialLinks.github;
    if (typeof socialUrl === "string" && socialUrl.includes("github.com/")) {
      const cleaned = socialUrl.split("github.com/")[1] || "";
      return cleaned.split(/[/?#]/)[0].trim();
    }
    return "";
  }

  function esc(value) {
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

  function safeHttpUrl(raw) {
    if (typeof raw !== "string") return "";
    const trimmed = raw.trim();
    if (!trimmed) return "";
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.href;
      }
    } catch {
      return "";
    }
    return "";
  }

  function formatDate(isoString) {
    if (!isoString) return "N/A";
    const dt = new Date(isoString);
    if (Number.isNaN(dt.getTime())) return "N/A";
    return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function formatRelativeTime(isoString) {
    if (!isoString) return "";
    const dt = new Date(isoString);
    if (Number.isNaN(dt.getTime())) return "";
    const diffSec = Math.max(0, Math.floor((Date.now() - dt.getTime()) / 1000));
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return formatDate(isoString);
  }

  function getLanguageColor(language) {
    return LANGUAGE_COLORS[language] || "#6366F1";
  }

  /* ========================================================================
     Storage Cache Layer (localStorage + safe memory fallback)
     ======================================================================== */
  function readCache(username) {
    const key = `${CACHE_PREFIX}${username.toLowerCase()}`;
    try {
      if (window.localStorage) {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.profile) return parsed;
        }
      }
    } catch {
      // Fall back to in-memory cache
    }
    return memoryFallbackCache.get(key) || null;
  }

  function writeCache(username, payload, ttlMinutes) {
    const key = `${CACHE_PREFIX}${username.toLowerCase()}`;
    const now = Date.now();
    const record = {
      ...payload,
      cachedAt: now,
      expiresAt: now + Math.max(0, ttlMinutes) * 60 * 1000
    };
    memoryFallbackCache.set(key, record);
    try {
      if (window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(record));
      }
    } catch {
      // Ignore quota / privacy mode errors cleanly
    }
    return record;
  }

  function clearCache(username) {
    if (!username) return;
    const key = `${CACHE_PREFIX}${username.toLowerCase()}`;
    memoryFallbackCache.delete(key);
    try {
      if (window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignore storage access errors
    }
  }

  /* ========================================================================
     Fetch Layer with Timeout & Rate-Limit Parsing
     ======================================================================== */
  async function fetchJsonWithTimeout(url, timeoutMs = 10000) {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : null;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json"
        },
        signal: controller ? controller.signal : undefined
      });

      const rateLimit = {
        limit: response.headers && typeof response.headers.get === "function" ? response.headers.get("x-ratelimit-limit") : null,
        remaining: response.headers && typeof response.headers.get === "function" ? response.headers.get("x-ratelimit-remaining") : null,
        reset: response.headers && typeof response.headers.get === "function" ? response.headers.get("x-ratelimit-reset") : null
      };

      let body = null;
      try {
        body = await response.json();
      } catch {
        body = null;
      }

      if (!response.ok) {
        const msg = body && body.message ? String(body.message) : `HTTP ${response.status}`;
        const isRateLimit =
          response.status === 429 ||
          (response.status === 403 && (rateLimit.remaining === "0" || msg.toLowerCase().includes("rate limit")));

        const err = new Error(msg);
        err.status = response.status;
        err.kind = response.status === 404 ? "not_found" : isRateLimit ? "rate_limit" : "api";
        err.rateLimit = rateLimit;
        throw err;
      }

      return { data: body, rateLimit };
    } catch (err) {
      if (err && err.name === "AbortError") {
        const timeoutErr = new Error("Request timed out while contacting GitHub API.");
        timeoutErr.kind = "network";
        throw timeoutErr;
      }
      if (err && !err.kind) {
        err.kind = "network";
      }
      throw err;
    } finally {
      if (timer) window.clearTimeout(timer);
    }
  }

  function formatResetTime(resetUnix) {
    const ts = Number(resetUnix);
    if (!ts || Number.isNaN(ts)) return "shortly";
    return new Date(ts * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  async function loadUser(usernameInput, options = {}) {
    const forceRefresh = Boolean(options.forceRefresh);
    const cfg = getConfig();
    const username = resolveUsername(usernameInput);

    state.activeUsername = username;
    state.languageFilter = "All";
    state.searchQuery = "";
    state.visibleCount = cfg.initialDisplayCount;
    state.staleWarning = "";

    if (!username) {
      state.loading = false;
      state.profile = null;
      state.repos = [];
      state.events = [];
      state.fromCache = false;
      state.error = {
        kind: "empty_user",
        message: "No GitHub username is configured. Enter a username above or set portfolioConfig.github.username in js/config.js."
      };
      render();
      return;
    }

    const cached = readCache(username);
    if (!forceRefresh && cached && Date.now() < cached.expiresAt) {
      state.loading = false;
      state.error = null;
      state.profile = cached.profile;
      state.repos = Array.isArray(cached.repos) ? cached.repos : [];
      state.events = Array.isArray(cached.events) ? cached.events : [];
      state.rateLimit = cached.rateLimit || null;
      state.cachedAt = cached.cachedAt;
      state.fromCache = true;
      render();
      return;
    }

    state.loading = true;
    state.error = null;
    state.fromCache = false;
    render();

    try {
      const encodedUser = encodeURIComponent(username);
      const userUrl = `${cfg.apiBaseUrl}/users/${encodedUser}`;
      const reposUrl = `${cfg.apiBaseUrl}/users/${encodedUser}/repos?per_page=${cfg.perPage}&sort=updated`;
      const eventsUrl = `${cfg.apiBaseUrl}/users/${encodedUser}/events/public?per_page=${cfg.eventsLimit}`;

      const userRes = await fetchJsonWithTimeout(userUrl);
      const [reposRes, eventsRes] = await Promise.all([
        fetchJsonWithTimeout(reposUrl),
        fetchJsonWithTimeout(eventsUrl).catch(() => ({ data: [], rateLimit: userRes.rateLimit }))
      ]);

      const reposList = Array.isArray(reposRes.data) ? reposRes.data : [];
      const eventsList = Array.isArray(eventsRes.data) ? eventsRes.data : [];
      const latestRateLimit = (eventsRes && eventsRes.rateLimit) || reposRes.rateLimit || userRes.rateLimit;

      const saved = writeCache(
        username,
        {
          profile: userRes.data,
          repos: reposList,
          events: eventsList,
          rateLimit: latestRateLimit
        },
        cfg.cacheTtlMinutes
      );

      state.loading = false;
      state.error = null;
      state.profile = saved.profile;
      state.repos = saved.repos;
      state.events = saved.events;
      state.rateLimit = saved.rateLimit;
      state.cachedAt = saved.cachedAt;
      state.fromCache = false;
      render();
    } catch (err) {
      state.loading = false;
      state.rateLimit = err.rateLimit || state.rateLimit;

      if (cached && cached.profile && err.kind !== "not_found") {
        state.profile = cached.profile;
        state.repos = Array.isArray(cached.repos) ? cached.repos : [];
        state.events = Array.isArray(cached.events) ? cached.events : [];
        state.cachedAt = cached.cachedAt;
        state.fromCache = true;
        state.error = null;
        if (err.kind === "rate_limit") {
          const resetLabel = formatResetTime(err.rateLimit && err.rateLimit.reset);
          state.staleWarning = `GitHub API rate limit reached (resets around ${resetLabel}). Showing cached snapshot from ${formatRelativeTime(new Date(cached.cachedAt).toISOString())}.`;
        } else {
          state.staleWarning = `Unable to refresh live GitHub data (${err.message}). Showing cached snapshot from ${formatRelativeTime(new Date(cached.cachedAt).toISOString())}.`;
        }
        render();
        return;
      }

      state.profile = null;
      state.repos = [];
      state.events = [];

      if (err.kind === "not_found") {
        state.error = {
          kind: "not_found",
          message: `GitHub user "@${username}" was not found. Verify the username or update portfolioConfig.github.username in js/config.js.`
        };
      } else if (err.kind === "rate_limit") {
        const resetLabel = formatResetTime(err.rateLimit && err.rateLimit.reset);
        state.error = {
          kind: "rate_limit",
          message: `GitHub public API rate limit reached. Unauthenticated requests reset around ${resetLabel}. Please retry shortly.`,
          resetAt: resetLabel
        };
      } else {
        state.error = {
          kind: err.kind || "network",
          message: err.message || "Network error while contacting GitHub API. Check your connection and retry."
        };
      }

      render();
    }
  }

  /* ========================================================================
     Pure Data Aggregation Helpers (Unit-Testable)
     ======================================================================== */
  function computeLanguageStats(repos, excludeForks = true) {
    const source = Array.isArray(repos)
      ? repos.filter((r) => (excludeForks ? !r.fork : true) && r.language)
      : [];

    const counts = new Map();
    source.forEach((repo) => {
      counts.set(repo.language, (counts.get(repo.language) || 0) + 1);
    });

    const total = source.length;
    const entries = Array.from(counts.entries())
      .map(([language, count]) => ({
        language,
        count,
        percent: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
        color: getLanguageColor(language)
      }))
      .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language));

    return { totalAnalyzed: total, entries };
  }

  function filterAndSortRepos(repos, { searchQuery = "", languageFilter = "All", sortBy = "stars" } = {}) {
    const q = String(searchQuery).trim().toLowerCase();
    const list = (Array.isArray(repos) ? repos : []).filter((repo) => {
      const langMatch = languageFilter === "All" || repo.language === languageFilter;
      if (!langMatch) return false;
      if (!q) return true;
      const topics = Array.isArray(repo.topics) ? repo.topics.join(" ") : "";
      const hay = `${repo.name || ""} ${repo.description || ""} ${repo.language || ""} ${topics}`.toLowerCase();
      return hay.includes(q);
    });

    const sorted = list.slice();
    sorted.sort((a, b) => {
      if (sortBy === "updated") {
        return new Date(b.pushed_at || b.updated_at || 0) - new Date(a.pushed_at || a.updated_at || 0);
      }
      if (sortBy === "forks") {
        return (b.forks_count || 0) - (a.forks_count || 0) || (b.stargazers_count || 0) - (a.stargazers_count || 0);
      }
      if (sortBy === "name") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }
      return (b.stargazers_count || 0) - (a.stargazers_count || 0) || (b.forks_count || 0) - (a.forks_count || 0);
    });

    return sorted;
  }

  function formatEventSummary(ev) {
    const payload = ev && ev.payload ? ev.payload : {};
    const type = ev && ev.type ? ev.type : "Event";

    switch (type) {
      case "PushEvent": {
        const count = Array.isArray(payload.commits) ? payload.commits.length : payload.size || 1;
        const ref = payload.ref ? String(payload.ref).replace("refs/heads/", "") : "branch";
        return {
          icon: "git-commit-horizontal",
          action: `Pushed ${count} ${count === 1 ? "commit" : "commits"} to ${ref}`
        };
      }
      case "CreateEvent":
        return {
          icon: "git-branch-plus",
          action: `Created ${payload.ref_type || "resource"}${payload.ref ? ` (${payload.ref})` : ""}`
        };
      case "WatchEvent":
        return { icon: "star", action: "Starred repository" };
      case "ForkEvent":
        return { icon: "git-fork", action: "Forked repository" };
      case "PullRequestEvent":
        return {
          icon: "git-pull-request",
          action: `${payload.action ? payload.action.charAt(0).toUpperCase() + payload.action.slice(1) : "Updated"} pull request #${payload.number || ""}`
        };
      case "IssuesEvent":
        return {
          icon: "circle-dot",
          action: `${payload.action ? payload.action.charAt(0).toUpperCase() + payload.action.slice(1) : "Updated"} issue #${(payload.issue && payload.issue.number) || ""}`
        };
      case "IssueCommentEvent":
        return {
          icon: "message-square",
          action: `Commented on issue #${(payload.issue && payload.issue.number) || ""}`
        };
      case "ReleaseEvent":
        return {
          icon: "tag",
          action: `Published release ${(payload.release && payload.release.tag_name) || ""}`.trim()
        };
      case "PublicEvent":
        return { icon: "globe", action: "Made repository public" };
      default:
        return { icon: "activity", action: type.replace(/Event$/, "") };
    }
  }

  /* ========================================================================
     UI Renderers
     ======================================================================== */
  function renderControlsBar(cfg) {
    const configuredUsername = resolveUsername();
    const isCustomUser = state.activeUsername && configuredUsername && state.activeUsername.toLowerCase() !== configuredUsername.toLowerCase();
    const isDemoHandle = state.activeUsername.toLowerCase() === "octocat" && cfg.username.toLowerCase() === "octocat";

    const quotaInfo =
      state.rateLimit && state.rateLimit.remaining !== null && state.rateLimit.remaining !== undefined
        ? `API Quota: ${state.rateLimit.remaining}/${state.rateLimit.limit || 60}`
        : "";

    const cacheInfo = state.fromCache && state.cachedAt
      ? `Cached (${formatRelativeTime(new Date(state.cachedAt).toISOString())})`
      : state.profile
        ? "Live API"
        : "";

    return `
      <div class="gh-controls-bar">
        <form id="gh-username-form" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:max-w-lg" novalidate>
          <div class="relative flex-1 min-w-0">
            <label for="gh-username-input" class="sr-only">GitHub username</label>
            <input
              id="gh-username-input"
              type="text"
              class="gh-input font-mono-tech"
              placeholder="Enter GitHub username (e.g. octocat)"
              value="${esc(state.activeUsername)}"
              autocomplete="off"
              spellcheck="false"
            >
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="submit" class="primary-button text-xs sm:text-sm py-2 px-4 min-h-[42px]">
              <i data-lucide="search" class="w-4 h-4"></i>
              <span>Load Profile</span>
            </button>
            ${
              isCustomUser
                ? `<button type="button" id="gh-reset-user-btn" class="outline-button text-xs py-2 px-3 min-h-[42px]" title="Reset to configured username in js/config.js">Reset</button>`
                : ""
            }
          </div>
        </form>

        <div class="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 text-xs text-[var(--muted)]">
          ${
            isDemoHandle
              ? `<span class="dash-status-chip" data-tone="indigo">Demo Handle (@octocat) — Configurable in js/config.js</span>`
              : ""
          }
          ${cacheInfo ? `<span class="font-mono-tech tabular-nums">${esc(cacheInfo)}</span>` : ""}
          ${quotaInfo ? `<span class="font-mono-tech tabular-nums">${esc(quotaInfo)}</span>` : ""}
          <button
            type="button"
            id="gh-force-refresh-btn"
            class="outline-button text-xs py-1.5 px-3 min-h-[36px]"
            aria-label="Refresh GitHub data from live API"
            ${state.loading ? "disabled" : ""}
          >
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>
    `;
  }

  function renderLoadingSkeleton() {
    return `
      <div class="space-y-6" aria-busy="true" aria-label="Loading live GitHub data">
        <div class="gh-surface-card p-6 space-y-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div class="dash-skeleton-block w-24 h-24 rounded-2xl shrink-0"></div>
            <div class="space-y-2.5 flex-1 w-full">
              <div class="dash-skeleton-block h-6 w-52 max-w-full"></div>
              <div class="dash-skeleton-block h-4 w-80 max-w-full"></div>
              <div class="dash-skeleton-block h-4 w-64 max-w-full"></div>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div class="dash-skeleton-block h-14 w-full"></div>
            <div class="dash-skeleton-block h-14 w-full"></div>
            <div class="dash-skeleton-block h-14 w-full"></div>
            <div class="dash-skeleton-block h-14 w-full"></div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div class="gh-surface-card p-5"><div class="dash-skeleton-block h-36 w-full"></div></div>
          <div class="gh-surface-card p-5"><div class="dash-skeleton-block h-36 w-full"></div></div>
          <div class="gh-surface-card p-5"><div class="dash-skeleton-block h-36 w-full"></div></div>
        </div>
      </div>
    `;
  }

  function renderErrorState(err) {
    const iconName =
      err.kind === "rate_limit"
        ? "clock-alert"
        : err.kind === "not_found"
          ? "user-x"
          : err.kind === "empty_user"
            ? "settings"
            : "wifi-off";

    const title =
      err.kind === "rate_limit"
        ? "GitHub API Rate Limit Reached"
        : err.kind === "not_found"
          ? "GitHub Profile Not Found"
          : err.kind === "empty_user"
            ? "GitHub Username Not Configured"
            : "Unable to Reach GitHub API";

    const configuredDefault = resolveUsername();
    const showResetBtn =
      configuredDefault && state.activeUsername.toLowerCase() !== configuredDefault.toLowerCase();

    return `
      <div class="gh-banner" data-kind="${err.kind === "empty_user" ? "warning" : "error"}" role="alert">
        <div class="flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center shrink-0 text-rose-400">
            <i data-lucide="${esc(iconName)}" class="w-5 h-5"></i>
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-bold text-[var(--text)]">${esc(title)}</h3>
            <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${esc(err.message)}</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 shrink-0">
          ${
            err.kind !== "empty_user"
              ? `<button type="button" id="gh-retry-btn" class="primary-button text-xs py-2 px-4 min-h-[40px]">
                   <i data-lucide="rotate-cw" class="w-4 h-4"></i>
                   <span>Retry</span>
                 </button>`
              : ""
          }
          ${
            showResetBtn
              ? `<button type="button" id="gh-error-reset-btn" class="secondary-button text-xs py-2 px-4 min-h-[40px]">Use Configured (@${esc(configuredDefault)})</button>`
              : ""
          }
        </div>
      </div>
    `;
  }

  function renderProfileSection(profile) {
    const blogUrl = safeHttpUrl(profile.blog);
    const metaDetails = [];

    if (profile.location) {
      metaDetails.push(
        `<span class="inline-flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-cyan-400"></i>${esc(profile.location)}</span>`
      );
    }
    if (profile.company) {
      metaDetails.push(
        `<span class="inline-flex items-center gap-1.5"><i data-lucide="building-2" class="w-3.5 h-3.5 text-indigo-400"></i>${esc(profile.company)}</span>`
      );
    }
    if (blogUrl) {
      metaDetails.push(
        `<a href="${esc(blogUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-cyan-400 hover:underline"><i data-lucide="link" class="w-3.5 h-3.5"></i><span>Website</span></a>`
      );
    }
    if (profile.created_at) {
      metaDetails.push(
        `<span class="inline-flex items-center gap-1.5 tabular-nums"><i data-lucide="calendar" class="w-3.5 h-3.5 text-violet-400"></i>Joined ${esc(formatDate(profile.created_at))}</span>`
      );
    }

    return `
      <section aria-labelledby="gh-profile-heading">
        <div class="gh-surface-card gh-profile-card space-y-5">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
              <div class="gh-avatar-frame">
                <img
                  src="${esc(profile.avatar_url || "assets/images/profile-placeholder.svg")}"
                  alt="${esc(profile.login)} GitHub avatar"
                  loading="lazy"
                  class="w-full h-full object-cover"
                  onerror="this.src='assets/images/profile-placeholder.svg'"
                >
              </div>
              <div class="space-y-1.5 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 id="gh-profile-heading" class="text-xl sm:text-2xl font-extrabold text-[var(--text)]">
                    ${esc(profile.name || profile.login)}
                  </h2>
                  <span class="gh-visibility-pill">@${esc(profile.login)}</span>
                </div>
                <p class="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                  ${esc(profile.bio || "No public bio provided on this GitHub profile.")}
                </p>
                ${
                  metaDetails.length > 0
                    ? `<div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-[var(--muted)]">${metaDetails.join("")}</div>`
                    : ""
                }
              </div>
            </div>

            <a
              href="${esc(safeHttpUrl(profile.html_url) || `https://github.com/${encodeURIComponent(profile.login)}`)}"
              target="_blank"
              rel="noopener noreferrer"
              class="primary-button whitespace-nowrap shrink-0 self-start md:self-center"
            >
              <i data-lucide="github" class="w-4 h-4"></i>
              <span>View on GitHub</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[var(--border)]">
            <div class="gh-metric-box">
              <p class="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold">Public Repos</p>
              <p class="text-lg sm:text-xl font-extrabold text-[var(--text)] tabular-nums mt-0.5">${esc(profile.public_repos ?? 0)}</p>
            </div>
            <div class="gh-metric-box">
              <p class="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold">Followers</p>
              <p class="text-lg sm:text-xl font-extrabold text-[var(--text)] tabular-nums mt-0.5">${esc(profile.followers ?? 0)}</p>
            </div>
            <div class="gh-metric-box">
              <p class="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold">Following</p>
              <p class="text-lg sm:text-xl font-extrabold text-[var(--text)] tabular-nums mt-0.5">${esc(profile.following ?? 0)}</p>
            </div>
            <div class="gh-metric-box">
              <p class="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold">Public Gists</p>
              <p class="text-lg sm:text-xl font-extrabold text-[var(--text)] tabular-nums mt-0.5">${esc(profile.public_gists ?? 0)}</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderRepoCardMarkup(repo, index = 0, featuredBadge = false) {
    const langColor = getLanguageColor(repo.language);
    const delayStyle = `--gh-delay: ${Math.min(index, 8) * 35}ms;`;
    const repoUrl = safeHttpUrl(repo.html_url);

    return `
      <article class="gh-repo-card" style="${delayStyle}">
        <div class="space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h3 class="text-base font-bold text-[var(--text)] truncate">
                <a href="${esc(repoUrl)}" target="_blank" rel="noopener noreferrer" class="hover:text-cyan-400 transition-colors">
                  ${esc(repo.name)}
                </a>
              </h3>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              ${featuredBadge ? `<span class="dash-status-chip py-0.5 px-2 text-[11px]" data-tone="cyan">Verified</span>` : ""}
              <span class="gh-visibility-pill">${esc(repo.visibility || "public")}</span>
              ${repo.fork ? `<span class="gh-visibility-pill">Fork</span>` : ""}
            </div>
          </div>

          <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed line-clamp-3">
            ${esc(repo.description || "No description provided in repository settings.")}
          </p>
        </div>

        <div class="space-y-3 pt-2 border-t border-[var(--border)]">
          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
            <div class="flex flex-wrap items-center gap-3">
              ${
                repo.language
                  ? `<span class="inline-flex items-center gap-1.5 text-[var(--text-secondary)] font-medium">
                       <span class="gh-lang-dot" style="--lang-color: ${esc(langColor)};"></span>
                       <span>${esc(repo.language)}</span>
                     </span>`
                  : `<span>No primary language</span>`
              }
              <span class="inline-flex items-center gap-1 tabular-nums" title="Stars">
                <i data-lucide="star" class="w-3.5 h-3.5 text-amber-400"></i>
                <span>${esc(repo.stargazers_count ?? 0)}</span>
              </span>
              <span class="inline-flex items-center gap-1 tabular-nums" title="Forks">
                <i data-lucide="git-fork" class="w-3.5 h-3.5 text-indigo-400"></i>
                <span>${esc(repo.forks_count ?? 0)}</span>
              </span>
            </div>
            <span class="font-mono-tech text-[11px] tabular-nums">Updated ${esc(formatDate(repo.pushed_at || repo.updated_at))}</span>
          </div>

          <div class="flex items-center justify-between gap-2">
            <a
              href="${esc(repoUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              class="outline-button text-xs py-1.5 px-3 min-h-[36px]"
            >
              <i data-lucide="github" class="w-3.5 h-3.5"></i>
              <span>Open Repository</span>
            </a>
            ${
              safeHttpUrl(repo.homepage)
                ? `<a
                     href="${esc(safeHttpUrl(repo.homepage))}"
                     target="_blank"
                     rel="noopener noreferrer"
                     class="text-xs font-semibold text-cyan-400 hover:underline inline-flex items-center gap-1"
                   >
                     <span>Demo</span>
                     <i data-lucide="external-link" class="w-3 h-3"></i>
                   </a>`
                : ""
            }
          </div>
        </div>
      </article>
    `;
  }

  function renderFeaturedSection(cfg, repos) {
    if (!cfg.featuredRepos || cfg.featuredRepos.length === 0) return "";

    const cards = cfg.featuredRepos
      .map((targetName, idx) => {
        const match = repos.find((r) => String(r.name || "").toLowerCase() === String(targetName).toLowerCase());
        if (match) {
          return renderRepoCardMarkup(match, idx, true);
        }
        return `
          <article class="gh-repo-card is-unavailable">
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-base font-bold text-[var(--text)]">${esc(targetName)}</h3>
                <span class="dash-status-chip py-0.5 px-2 text-[11px]" data-tone="amber">Unavailable</span>
              </div>
              <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Configured featured repository was not found among <strong>@${esc(state.activeUsername)}</strong>&apos;s public GitHub repositories.
              </p>
            </div>
            <p class="text-[11px] font-mono-tech text-[var(--muted)] pt-2 border-t border-[var(--border)]">
              Private, renamed, or hosted under a different handle.
            </p>
          </article>
        `;
      })
      .join("");

    return `
      <section aria-labelledby="gh-featured-heading" class="space-y-4">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="gh-featured-heading" class="text-lg sm:text-xl font-bold text-[var(--text)]">Featured Repositories</h2>
            <p class="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
              Configured highlights verified live against public repositories in <code class="font-mono-tech">portfolioConfig.github.featuredRepos</code>.
            </p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          ${cards}
        </div>
      </section>
    `;
  }

  function renderLanguageStatsSection(repos) {
    const { totalAnalyzed, entries } = computeLanguageStats(repos, state.excludeForksInLangs);
    const maxCount = entries.length > 0 ? entries[0].count : 1;

    const stackedSegments =
      totalAnalyzed > 0
        ? entries
            .slice(0, 8)
            .map((e) => {
              const widthPct = Math.max(3, e.percent);
              return `<span class="gh-lang-segment" style="--seg-width: ${widthPct}%; --lang-color: ${esc(e.color)};" title="${esc(e.language)}: ${e.percent}%"></span>`;
            })
            .join("")
        : "";

    const rowsHtml =
      entries.length === 0
        ? `<p class="text-xs sm:text-sm text-[var(--muted)] py-3">No primary language metadata found across the analyzed repositories.</p>`
        : entries
            .slice(0, 10)
            .map((entry) => {
              const isSelected = state.languageFilter === entry.language;
              const scale = Math.max(0.08, entry.count / maxCount);
              return `
                <button
                  type="button"
                  class="gh-lang-row-btn ${isSelected ? "is-active" : ""}"
                  data-gh-lang-select="${esc(entry.language)}"
                  aria-pressed="${isSelected ? "true" : "false"}"
                >
                  <div class="flex items-center justify-between gap-2 text-xs mb-1.5">
                    <span class="inline-flex items-center gap-2 font-bold text-[var(--text)]">
                      <span class="gh-lang-dot" style="--lang-color: ${esc(entry.color)};"></span>
                      <span>${esc(entry.language)}</span>
                    </span>
                    <span class="font-mono-tech text-[var(--muted)] tabular-nums">
                      ${esc(entry.count)} ${entry.count === 1 ? "repo" : "repos"} (${esc(entry.percent)}%)
                    </span>
                  </div>
                  <div class="gh-lang-bar-track" aria-hidden="true">
                    <div class="gh-lang-bar-fill" style="--lang-scale: ${esc(scale)}; --lang-color: ${esc(entry.color)};"></div>
                  </div>
                </button>
              `;
            })
            .join("");

    return `
      <section aria-labelledby="gh-languages-heading" class="gh-surface-card p-5 sm:p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div>
            <h2 id="gh-languages-heading" class="text-lg sm:text-xl font-bold text-[var(--text)]">Language Statistics</h2>
            <p class="text-xs text-[var(--muted)] mt-0.5 tabular-nums">
              Derived from ${esc(totalAnalyzed)} public ${state.excludeForksInLangs ? "non-forked " : ""}repositories · click any language to filter repos
            </p>
          </div>
          <label class="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] cursor-pointer select-none">
            <input
              type="checkbox"
              id="gh-exclude-forks-toggle"
              class="w-4 h-4 accent-indigo-500 rounded"
              ${state.excludeForksInLangs ? "checked" : ""}
            >
            <span>Exclude forked repos</span>
          </label>
        </div>

        ${stackedSegments ? `<div class="gh-lang-stacked-bar" aria-hidden="true">${stackedSegments}</div>` : ""}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          ${rowsHtml}
        </div>
      </section>
    `;
  }

  function renderEventsSection(events) {
    const itemsHtml =
      !events || events.length === 0
        ? `
          <div class="p-5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-center space-y-2">
            <i data-lucide="history" class="w-6 h-6 text-indigo-400 mx-auto"></i>
            <p class="text-xs sm:text-sm text-[var(--muted)]">
              No recent public GitHub events were returned for <strong>@${esc(state.activeUsername)}</strong> (GitHub retains public activity for ~90 days).
            </p>
          </div>
        `
        : events
            .map((ev) => {
              const summary = formatEventSummary(ev);
              const repoName = ev && ev.repo && ev.repo.name ? ev.repo.name : "";
              const repoHref = repoName ? `https://github.com/${repoName.split("/").map(encodeURIComponent).join("/")}` : "";
              return `
                <article class="gh-event-item">
                  <div class="gh-event-icon" aria-hidden="true">
                    <i data-lucide="${esc(summary.icon)}" class="w-4 h-4"></i>
                  </div>
                  <div class="min-w-0 flex-1 space-y-1">
                    <p class="text-xs sm:text-sm font-semibold text-[var(--text)]">${esc(summary.action)}</p>
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                      ${
                        repoHref
                          ? `<a href="${esc(repoHref)}" target="_blank" rel="noopener noreferrer" class="font-mono-tech text-cyan-400 hover:underline truncate max-w-full">${esc(repoName)}</a>`
                          : ""
                      }
                      <time datetime="${esc(ev.created_at || "")}" class="tabular-nums">${esc(formatRelativeTime(ev.created_at))}</time>
                    </div>
                  </div>
                </article>
              `;
            })
            .join("");

    return `
      <section aria-labelledby="gh-activity-heading" class="gh-surface-card p-5 sm:p-6 space-y-4">
        <div class="flex items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div>
            <h2 id="gh-activity-heading" class="text-lg sm:text-xl font-bold text-[var(--text)]">Recent Public GitHub Activity</h2>
            <p class="text-xs text-[var(--muted)] mt-0.5">Public events feed from <code class="font-mono-tech">/events/public</code></p>
          </div>
          <i data-lucide="activity" class="w-5 h-5 text-indigo-400 shrink-0" aria-hidden="true"></i>
        </div>
        <div>${itemsHtml}</div>
      </section>
    `;
  }

  function renderRepositoryExplorer(cfg, repos) {
    const langCounts = new Map();
    repos.forEach((r) => {
      if (r.language) langCounts.set(r.language, (langCounts.get(r.language) || 0) + 1);
    });
    const sortedLangs = Array.from(langCounts.entries()).sort((a, b) => b[1] - a[1]);

    const filtered = filterAndSortRepos(repos, {
      searchQuery: state.searchQuery,
      languageFilter: state.languageFilter,
      sortBy: state.sortBy
    });

    const displayed = filtered.slice(0, state.visibleCount);
    const remaining = Math.max(0, filtered.length - displayed.length);

    const pillsHtml = [
      `<button type="button" class="gh-lang-pill ${state.languageFilter === "All" ? "is-active" : ""}" data-gh-filter-lang="All">All (${repos.length})</button>`,
      ...sortedLangs.map(
        ([lang, count]) => `
          <button type="button" class="gh-lang-pill ${state.languageFilter === lang ? "is-active" : ""}" data-gh-filter-lang="${esc(lang)}">
            <span class="gh-lang-dot" style="--lang-color: ${esc(getLanguageColor(lang))};"></span>
            <span>${esc(lang)} (${count})</span>
          </button>
        `
      )
    ].join("");

    let gridContent = "";
    if (repos.length === 0) {
      gridContent = `
        <div class="gh-surface-card p-8 text-center space-y-3 col-span-full">
          <i data-lucide="folder-open" class="w-8 h-8 text-indigo-400 mx-auto"></i>
          <h3 class="text-base font-bold text-[var(--text)]">No Public Repositories Found</h3>
          <p class="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto">
            <strong>@${esc(state.activeUsername)}</strong> currently has 0 public repositories visible through the GitHub REST API.
          </p>
        </div>
      `;
    } else if (filtered.length === 0) {
      gridContent = `
        <div class="gh-surface-card p-8 text-center space-y-3 col-span-full">
          <i data-lucide="search-x" class="w-8 h-8 text-indigo-400 mx-auto"></i>
          <h3 class="text-base font-bold text-[var(--text)]">No Repositories Match Your Filters</h3>
          <p class="text-xs sm:text-sm text-[var(--muted)]">Try clearing your search query or selecting &quot;All&quot; languages.</p>
          <button type="button" id="gh-repo-filters-reset" class="secondary-button mx-auto">Reset Repo Filters</button>
        </div>
      `;
    } else {
      gridContent = displayed.map((repo, idx) => renderRepoCardMarkup(repo, idx, false)).join("");
    }

    return `
      <section aria-labelledby="gh-repos-heading" class="space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 id="gh-repos-heading" class="text-lg sm:text-xl font-bold text-[var(--text)]">Repository Explorer</h2>
            <p class="text-xs sm:text-sm text-[var(--muted)] mt-0.5 tabular-nums">
              Showing ${displayed.length} of ${filtered.length} matching public repositories
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div class="md:col-span-8">
              <div class="project-search-wrap">
                <i data-lucide="search" class="w-4 h-4 text-[var(--muted)] absolute left-3.5 pointer-events-none"></i>
                <label for="gh-repo-search" class="sr-only">Search GitHub repositories</label>
                <input
                  id="gh-repo-search"
                  type="search"
                  class="project-search-input"
                  placeholder="Search repositories by name, description, or topic..."
                  value="${esc(state.searchQuery)}"
                  autocomplete="off"
                >
              </div>
            </div>
            <div class="md:col-span-4">
              <label for="gh-repo-sort" class="sr-only">Sort repositories</label>
              <select id="gh-repo-sort" class="gh-select w-full">
                <option value="stars" ${state.sortBy === "stars" ? "selected" : ""}>Sort: Most Stars</option>
                <option value="updated" ${state.sortBy === "updated" ? "selected" : ""}>Sort: Recently Updated</option>
                <option value="forks" ${state.sortBy === "forks" ? "selected" : ""}>Sort: Most Forks</option>
                <option value="name" ${state.sortBy === "name" ? "selected" : ""}>Sort: Name (A–Z)</option>
              </select>
            </div>
          </div>

          <div class="gh-filter-wrap" role="group" aria-label="Filter repositories by programming language">
            ${pillsHtml}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          ${gridContent}
        </div>

        ${
          remaining > 0
            ? `<div class="pt-2 flex justify-center">
                 <button type="button" id="gh-load-more-btn" class="secondary-button">
                   <i data-lucide="plus-circle" class="w-4 h-4"></i>
                   <span>Load More Repositories (${remaining} remaining)</span>
                 </button>
               </div>`
            : ""
        }
      </section>
    `;
  }

  function render() {
    const mount = document.getElementById("github-integration-root");
    if (!mount) return;

    const cfg = getConfig();
    let bodyHtml = "";

    if (state.loading) {
      bodyHtml = renderLoadingSkeleton();
    } else if (state.error) {
      bodyHtml = renderErrorState(state.error);
    } else if (state.profile) {
      bodyHtml = `
        ${
          state.staleWarning
            ? `<div class="gh-banner" data-kind="warning" role="status">
                 <p class="text-xs sm:text-sm text-[var(--text-secondary)]">${esc(state.staleWarning)}</p>
                 <button type="button" id="gh-retry-btn" class="outline-button text-xs py-1.5 px-3 shrink-0">Retry Live</button>
               </div>`
            : ""
        }
        ${renderProfileSection(state.profile)}
        ${renderFeaturedSection(cfg, state.repos)}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div class="lg:col-span-7">${renderLanguageStatsSection(state.repos)}</div>
          <div class="lg:col-span-5">${renderEventsSection(state.events)}</div>
        </div>
        ${renderRepositoryExplorer(cfg, state.repos)}
      `;
    }

    mount.innerHTML = `
      <div class="gh-shell">
        ${renderControlsBar(cfg)}
        ${bodyHtml}
      </div>
    `;

    bindEvents(mount, cfg);
    refreshIcons();
  }

  function bindEvents(mount, cfg) {
    const form = document.getElementById("gh-username-form");
    const usernameInput = document.getElementById("gh-username-input");
    if (form && usernameInput) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        loadUser(usernameInput.value);
      });
    }

    const resetUserBtn = document.getElementById("gh-reset-user-btn");
    const errorResetBtn = document.getElementById("gh-error-reset-btn");
    [resetUserBtn, errorResetBtn].forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", () => loadUser(resolveUsername()));
      }
    });

    const forceRefreshBtn = document.getElementById("gh-force-refresh-btn");
    if (forceRefreshBtn) {
      forceRefreshBtn.addEventListener("click", () => {
        clearCache(state.activeUsername);
        loadUser(state.activeUsername, { forceRefresh: true });
      });
    }

    const retryBtn = document.getElementById("gh-retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        loadUser(state.activeUsername, { forceRefresh: true });
      });
    }

    const excludeForksToggle = document.getElementById("gh-exclude-forks-toggle");
    if (excludeForksToggle) {
      excludeForksToggle.addEventListener("change", () => {
        state.excludeForksInLangs = excludeForksToggle.checked;
        render();
      });
    }

    mount.querySelectorAll("[data-gh-lang-select], [data-gh-filter-lang]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-gh-lang-select") || btn.getAttribute("data-gh-filter-lang") || "All";
        state.languageFilter = state.languageFilter === lang && btn.hasAttribute("data-gh-lang-select") ? "All" : lang;
        state.visibleCount = cfg.initialDisplayCount;
        render();
      });
    });

    const searchInput = document.getElementById("gh-repo-search");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const pos = searchInput.selectionStart;
        state.searchQuery = searchInput.value;
        state.visibleCount = cfg.initialDisplayCount;
        render();
        const refreshed = document.getElementById("gh-repo-search");
        if (refreshed) {
          refreshed.focus();
          if (typeof pos === "number") refreshed.setSelectionRange(pos, pos);
        }
      });
    }

    const sortSelect = document.getElementById("gh-repo-sort");
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        state.sortBy = sortSelect.value;
        state.visibleCount = cfg.initialDisplayCount;
        render();
      });
    }

    const resetRepoFilters = document.getElementById("gh-repo-filters-reset");
    if (resetRepoFilters) {
      resetRepoFilters.addEventListener("click", () => {
        state.searchQuery = "";
        state.languageFilter = "All";
        state.visibleCount = cfg.initialDisplayCount;
        render();
      });
    }

    const loadMoreBtn = document.getElementById("gh-load-more-btn");
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        state.visibleCount += cfg.loadMoreStep;
        render();
      });
    }
  }

  function init() {
    const mount = document.getElementById("github-integration-root");
    if (!mount || mount.dataset.githubInit === "true") return;
    mount.dataset.githubInit = "true";

    const cfg = getConfig();
    state.excludeForksInLangs = cfg.excludeForksFromLanguages;
    state.visibleCount = cfg.initialDisplayCount;
    loadUser(resolveUsername());
  }

  return {
    init,
    loadUser,
    getConfig,
    resolveUsername,
    computeLanguageStats,
    filterAndSortRepos,
    formatEventSummary,
    safeHttpUrl,
    clearCache
  };
})();

window.PortfolioGitHub = PortfolioGitHub;
