/**
 * AL AMIN Portfolio OS — Phase 50: Verified Public Live Coding Activity
 * Fetches GitHub public events strictly with caching, rate-limit handling,
 * loading/error/empty states, relative time, and accessible exact timestamps.
 * Never fabricates activity.
 */
(() => {
  const CACHE_PREFIX = "alamin_coding_activity_v1_";

  let state = {
    username: "",
    loading: false,
    error: "",
    fromCache: false,
    cachedAt: null,
    filter: "All",
    events: []
  };

  function esc(val) {
    return String(val == null ? "" : val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getConfig() {
    const cfg = (window.portfolioConfig && window.portfolioConfig.github) || {};
    return {
      username: typeof cfg.username === "string" ? cfg.username.trim().replace(/^@+/, "") : "",
      apiBaseUrl: typeof cfg.apiBaseUrl === "string" && cfg.apiBaseUrl ? cfg.apiBaseUrl.replace(/\/+$/, "") : "https://api.github.com",
      cacheTtlMinutes: Number(cfg.cacheTtlMinutes) >= 0 ? Number(cfg.cacheTtlMinutes) : 15
    };
  }

  function formatRelativeTime(iso) {
    if (!iso) return "Unknown time";
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return "Unknown time";
    const diffSec = Math.max(0, Math.floor((Date.now() - dt.getTime()) / 1000));
    if (diffSec < 60) return "just now";
    const min = Math.floor(diffSec / 60);
    if (min < 60) return `${min} ${min === 1 ? "minute" : "minutes"} ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} ${hr === 1 ? "hour" : "hours"} ago`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `${day} ${day === 1 ? "day" : "days"} ago`;
    return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function formatExactTimestamp(iso) {
    if (!iso) return "Unknown timestamp";
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return "Unknown timestamp";
    return dt.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short"
    });
  }

  function normalizeEvent(ev) {
    const type = (ev && ev.type) || "Event";
    const payload = (ev && ev.payload) || {};
    const repoName = (ev && ev.repo && ev.repo.name) || "repository";
    const repoUrl = `https://github.com/${repoName.split("/").map(encodeURIComponent).join("/")}`;

    switch (type) {
      case "PushEvent": {
        const commits = Array.isArray(payload.commits) ? payload.commits.length : payload.size || 1;
        const branch = payload.ref ? String(payload.ref).replace("refs/heads/", "") : "default branch";
        return {
          category: "Push",
          eventType: "PushEvent",
          icon: "git-commit-horizontal",
          action: `Pushed ${commits} commit${commits === 1 ? "" : "s"} to ${branch}`,
          repoName,
          link: repoUrl,
          createdAt: ev.created_at || ""
        };
      }
      case "PullRequestEvent":
        return {
          category: "Pull Requests",
          eventType: "PullRequestEvent",
          icon: "git-pull-request",
          action: `${payload.action || "Updated"} pull request #${payload.number || ""}`,
          repoName,
          link: (payload.pull_request && payload.pull_request.html_url) || repoUrl,
          createdAt: ev.created_at || ""
        };
      case "IssuesEvent":
      case "IssueCommentEvent":
        return {
          category: "Issues",
          eventType: type,
          icon: "circle-dot",
          action:
            type === "IssuesEvent"
              ? `${payload.action || "Updated"} issue #${(payload.issue && payload.issue.number) || ""}`
              : `Commented on issue #${(payload.issue && payload.issue.number) || ""}`,
          repoName,
          link: (payload.issue && payload.issue.html_url) || repoUrl,
          createdAt: ev.created_at || ""
        };
      case "ReleaseEvent":
        return {
          category: "Releases",
          eventType: "ReleaseEvent",
          icon: "tag",
          action: `Published release ${(payload.release && payload.release.tag_name) || ""}`.trim(),
          repoName,
          link: (payload.release && payload.release.html_url) || repoUrl,
          createdAt: ev.created_at || ""
        };
      default:
        return {
          category: "Repository Activity",
          eventType: type,
          icon: "activity",
          action:
            type === "CreateEvent"
              ? `Created ${payload.ref_type || "resource"}${payload.ref ? ` (${payload.ref})` : ""}`
              : type === "ForkEvent"
                ? "Forked repository"
                : type === "WatchEvent"
                  ? "Starred repository"
                  : type.replace(/Event$/, ""),
          repoName,
          link: repoUrl,
          createdAt: ev.created_at || ""
        };
    }
  }

  function readCache(username) {
    try {
      const raw = window.localStorage.getItem(`${CACHE_PREFIX}${username.toLowerCase()}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeCache(username, events, ttlMinutes) {
    try {
      window.localStorage.setItem(
        `${CACHE_PREFIX}${username.toLowerCase()}`,
        JSON.stringify({
          events,
          cachedAt: Date.now(),
          expiresAt: Date.now() + ttlMinutes * 60 * 1000
        })
      );
    } catch {
      // Ignore storage errors
    }
  }

  function render() {
    const statusMount = document.getElementById("ca-state-banner");
    const filtersMount = document.getElementById("ca-filters");
    const feedMount = document.getElementById("ca-feed-mount");

    if (statusMount) {
      if (state.loading) {
        statusMount.innerHTML = `<span class="text-xs text-cyan-400 font-semibold">Fetching live public activity for @${esc(state.username)}...</span>`;
      } else if (state.error) {
        statusMount.innerHTML = `<span class="text-xs text-rose-400 font-semibold">${esc(state.error)}</span>`;
      } else if (state.fromCache && state.cachedAt) {
        statusMount.innerHTML = `<span class="text-xs text-cyan-400 font-semibold">Cached State · Loaded ${esc(formatRelativeTime(new Date(state.cachedAt).toISOString()))} for @${esc(state.username)}</span>`;
      } else {
        statusMount.innerHTML = `<span class="text-xs text-emerald-400 font-semibold">Verified Live Public Feed · @${esc(state.username)}</span>`;
      }
    }

    const categories = ["All", "Push", "Pull Requests", "Issues", "Releases", "Repository Activity"];
    if (filtersMount) {
      filtersMount.innerHTML = categories
        .map(
          (cat) =>
            `<button type="button" class="ca-filter-btn ${state.filter === cat ? "is-active" : ""}" data-ca-cat="${esc(cat)}">${esc(cat)}</button>`
        )
        .join("");
      filtersMount.querySelectorAll("[data-ca-cat]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.filter = btn.getAttribute("data-ca-cat");
          render();
        });
      });
    }

    if (!feedMount) return;

    if (state.loading) {
      feedMount.innerHTML = `
        <div class="space-y-3" aria-busy="true" aria-label="Loading coding activity">
          <div class="ca-panel h-20 dash-skeleton-block"></div>
          <div class="ca-panel h-20 dash-skeleton-block"></div>
          <div class="ca-panel h-20 dash-skeleton-block"></div>
        </div>
      `;
      return;
    }

    if (state.error) {
      feedMount.innerHTML = `
        <div class="ca-panel p-8 text-center space-y-3" role="alert">
          <i data-lucide="wifi-off" class="w-8 h-8 text-rose-400 mx-auto" aria-hidden="true"></i>
          <h2 class="text-base font-bold text-[var(--text)]">Unable to Load Live Public Activity</h2>
          <p class="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto">${esc(state.error)}</p>
          <button type="button" id="ca-retry-inline" class="primary-button mx-auto text-xs min-h-[40px]">Retry Refresh</button>
        </div>
      `;
      const retryInline = document.getElementById("ca-retry-inline");
      if (retryInline) retryInline.addEventListener("click", () => loadActivity(state.username, true));
      if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
      return;
    }

    const normalized = state.events.map(normalizeEvent);
    const filtered = state.filter === "All" ? normalized : normalized.filter((e) => e.category === state.filter);

    if (filtered.length === 0) {
      feedMount.innerHTML = `
        <div class="ca-panel p-8 text-center space-y-2.5">
          <i data-lucide="history" class="w-8 h-8 text-indigo-400 mx-auto" aria-hidden="true"></i>
          <h2 class="text-base font-bold text-[var(--text)]">No Recent Public Coding Activity Available</h2>
          <p class="text-xs sm:text-sm text-[var(--muted)] max-w-lg mx-auto">
            GitHub returned 0 matching public events for <strong>@${esc(state.username)}</strong>${state.filter !== "All" ? ` under filter "${esc(state.filter)}"` : ""} (GitHub only retains public activity events for ~90 days). Activity is never fabricated when unavailable.
          </p>
        </div>
      `;
      if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
      return;
    }

    feedMount.innerHTML = filtered
      .map((item) => {
        const relTime = formatRelativeTime(item.createdAt);
        const exactTime = formatExactTimestamp(item.createdAt);
        return `
          <article class="ca-event-card">
            <div class="flex items-start gap-3 min-w-0">
              <div class="ca-event-icon" aria-hidden="true">
                <i data-lucide="${esc(item.icon)}" class="w-4 h-4"></i>
              </div>
              <div class="min-w-0 space-y-1">
                <div class="flex flex-wrap items-center gap-2 text-xs">
                  <span class="font-mono-tech text-cyan-400 font-semibold">${esc(item.eventType)}</span>
                  <span class="text-[var(--muted)]">·</span>
                  <a href="${esc(item.link)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-[var(--text)] hover:text-cyan-400 transition-colors truncate">${esc(item.repoName)}</a>
                </div>
                <p class="text-xs sm:text-sm text-[var(--text-secondary)]">${esc(item.action)}</p>
              </div>
            </div>

            <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
              <time datetime="${esc(item.createdAt)}" title="${esc(exactTime)}" class="text-xs font-mono-tech text-[var(--muted)]">
                ${esc(relTime)}<span class="sr-only"> (${esc(exactTime)})</span>
              </time>
              <a href="${esc(item.link)}" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-cyan-400 hover:underline inline-flex items-center gap-1">
                <span>View on GitHub</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5" aria-hidden="true"></i>
              </a>
            </div>
          </article>
        `;
      })
      .join("");

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  async function loadActivity(usernameInput, forceRefresh = false) {
    const cfg = getConfig();
    const username = (typeof usernameInput === "string" && usernameInput.trim() ? usernameInput : cfg.username).replace(/^@+/, "");
    state.username = username;

    if (!username) {
      state.loading = false;
      state.error = "No GitHub username configured in portfolioConfig.github.username.";
      state.events = [];
      render();
      return;
    }

    const cached = readCache(username);
    if (!forceRefresh && cached && Array.isArray(cached.events) && Date.now() < cached.expiresAt) {
      state.loading = false;
      state.error = "";
      state.fromCache = true;
      state.cachedAt = cached.cachedAt;
      state.events = cached.events;
      render();
      return;
    }

    state.loading = true;
    state.error = "";
    state.fromCache = false;
    render();

    try {
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timer = controller ? window.setTimeout(() => controller.abort(), 8000) : null;
      const res = await fetch(`${cfg.apiBaseUrl}/users/${encodeURIComponent(username)}/events/public?per_page=20`, {
        headers: { Accept: "application/vnd.github+json" },
        signal: controller ? controller.signal : undefined
      });
      if (timer) window.clearTimeout(timer);

      if (!res.ok) {
        const isRate = res.status === 403 || res.status === 429;
        throw new Error(isRate ? `GitHub public API rate limit reached (HTTP ${res.status}).` : `GitHub API returned HTTP ${res.status}.`);
      }

      const data = await res.json();
      const events = Array.isArray(data) ? data : [];
      writeCache(username, events, cfg.cacheTtlMinutes);

      state.loading = false;
      state.error = "";
      state.fromCache = false;
      state.events = events;
      render();
    } catch (err) {
      state.loading = false;
      if (cached && Array.isArray(cached.events)) {
        state.fromCache = true;
        state.cachedAt = cached.cachedAt;
        state.error = "";
        state.events = cached.events;
      } else {
        state.error = err.message || "Network error while requesting GitHub public events.";
        state.events = [];
      }
      render();
    }
  }

  function init() {
    const root = document.getElementById("coding-activity-root");
    if (!root || root.dataset.caInit === "1") return;
    root.dataset.caInit = "1";

    const cfg = getConfig();
    const form = document.getElementById("ca-user-form");
    const input = document.getElementById("ca-user-input");
    const refreshBtn = document.getElementById("ca-refresh-btn");
    if (input) input.value = cfg.username;

    if (form && input) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        loadActivity(input.value, false);
      });
    }
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        loadActivity(input ? input.value : cfg.username, true);
      });
    }

    loadActivity(cfg.username, false);
  }

  window.PortfolioCodingActivity = {
    init,
    loadActivity,
    normalizeEvent,
    formatRelativeTime
  };
})();
