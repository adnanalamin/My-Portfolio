/**
 * AL AMIN Portfolio OS — Phase 54: Real-Time Browser System Monitor
 * Monitors only endpoints verifiable from the browser configured in portfolioConfig.systemChecks.
 * Status values: ONLINE | DEGRADED | OFFLINE | UNKNOWN.
 * Never fakes ONLINE status; CORS-opaque or disabled checks resolve honestly as UNKNOWN.
 */
(() => {
  const DEGRADED_MS = 1500;
  let timerId = null;
  let lastResults = [];
  let isChecking = false;

  function esc(val) {
    return String(val == null ? "" : val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getChecksConfig() {
    const cfg = window.portfolioConfig || {};
    return Array.isArray(cfg.systemChecks) ? cfg.systemChecks : [];
  }

  function isSameOriginUrl(url) {
    try {
      const parsed = new URL(url, window.location.href);
      return parsed.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  async function probeEndpoint(item) {
    const checkedAt = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    if (!item || item.enabled === false || !item.url || !String(item.url).trim()) {
      return {
        name: (item && item.name) || "Unconfigured Check",
        url: (item && item.url) || "Not set",
        category: (item && item.category) || "General",
        status: "UNKNOWN",
        latencyMs: null,
        detail: !item || item.enabled === false ? "Check disabled in js/config.js (systemChecks)." : "No URL configured in systemChecks.",
        checkedAt
      };
    }

    const url = String(item.url).trim();
    const sameOrigin = isSameOriginUrl(url);
    const start = typeof performance !== "undefined" ? performance.now() : Date.now();
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? window.setTimeout(() => controller.abort(), 6500) : null;

    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) window.clearTimeout(timeoutId);
      const latencyMs = Math.max(1, Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - start));

      if (response.status >= 200 && response.status < 400) {
        if (latencyMs >= DEGRADED_MS) {
          return {
            name: item.name,
            url,
            category: item.category || "Endpoint",
            status: "DEGRADED",
            latencyMs,
            detail: `HTTP ${response.status} (${latencyMs} ms exceeds ${DEGRADED_MS} ms threshold)`,
            checkedAt
          };
        }
        return {
          name: item.name,
          url,
          category: item.category || "Endpoint",
          status: "ONLINE",
          latencyMs,
          detail: `HTTP ${response.status} verified from browser`,
          checkedAt
        };
      }

      if (response.status === 429 || response.status === 403) {
        return {
          name: item.name,
          url,
          category: item.category || "Endpoint",
          status: "DEGRADED",
          latencyMs,
          detail: `HTTP ${response.status} rate-limited / restricted public quota`,
          checkedAt
        };
      }

      return {
        name: item.name,
        url,
        category: item.category || "Endpoint",
        status: "OFFLINE",
        latencyMs,
        detail: `HTTP ${response.status} error response`,
        checkedAt
      };
    } catch (err) {
      if (timeoutId) window.clearTimeout(timeoutId);
      const latencyMs = Math.max(1, Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - start));
      const isAbort = err && err.name === "AbortError";

      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        return {
          name: item.name,
          url,
          category: item.category || "Endpoint",
          status: "OFFLINE",
          latencyMs: null,
          detail: "Browser reports offline state (navigator.onLine = false).",
          checkedAt
        };
      }

      // Cross-origin fetch failures without readable status could be CORS or network blocks -> UNKNOWN rather than faking
      if (!sameOrigin && !isAbort) {
        return {
          name: item.name,
          url,
          category: item.category || "Endpoint",
          status: "UNKNOWN",
          latencyMs: null,
          detail: "Cross-origin browser fetch blocked or unreachable (cannot verify without server proxy).",
          checkedAt
        };
      }

      return {
        name: item.name,
        url,
        category: item.category || "Endpoint",
        status: isAbort ? "DEGRADED" : "OFFLINE",
        latencyMs,
        detail: isAbort ? "Probe timed out after 6500 ms." : (err && err.message) || "Fetch failed.",
        checkedAt
      };
    }
  }

  function renderResults(results) {
    const summaryEl = document.getElementById("sm-summary-mount");
    const gridEl = document.getElementById("sm-cards-mount");
    const lastRunEl = document.getElementById("sm-last-run");

    const counts = {
      ONLINE: results.filter((r) => r.status === "ONLINE").length,
      DEGRADED: results.filter((r) => r.status === "DEGRADED").length,
      OFFLINE: results.filter((r) => r.status === "OFFLINE").length,
      UNKNOWN: results.filter((r) => r.status === "UNKNOWN").length
    };

    if (lastRunEl) {
      lastRunEl.textContent = results.length ? `Last suite check: ${results[0].checkedAt}` : "Pending checks...";
    }

    if (summaryEl) {
      summaryEl.innerHTML = [
        { key: "ONLINE", label: "ONLINE", cls: "text-emerald-400" },
        { key: "DEGRADED", label: "DEGRADED", cls: "text-amber-400" },
        { key: "OFFLINE", label: "OFFLINE", cls: "text-rose-400" },
        { key: "UNKNOWN", label: "UNKNOWN", cls: "text-slate-400" }
      ]
        .map(
          (s) => `
          <div class="sm-panel text-center">
            <div class="text-2xl font-extrabold font-mono-tech ${s.cls}">${counts[s.key]}</div>
            <div class="text-xs font-mono-tech text-[var(--muted)] mt-0.5">${s.label}</div>
          </div>`
        )
        .join("");
    }

    if (gridEl) {
      gridEl.innerHTML = results
        .map(
          (r) => `
          <article class="sm-card">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 space-y-0.5">
                <span class="text-[11px] font-mono-tech uppercase tracking-wider text-indigo-400">${esc(r.category)}</span>
                <h2 class="text-base font-bold text-[var(--text)]">${esc(r.name)}</h2>
              </div>
              <span class="sm-status-pill shrink-0" data-status="${esc(r.status)}">${esc(r.status)}</span>
            </div>

            <div class="text-xs font-mono-tech text-[var(--muted)] break-all">${esc(r.url)}</div>

            <p class="text-xs text-[var(--text-secondary)] leading-relaxed">${esc(r.detail)}</p>

            <div class="pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)] font-mono-tech">
              <span>Response: ${r.latencyMs !== null ? `${r.latencyMs} ms` : "N/A"}</span>
              <span>Checked: ${esc(r.checkedAt)}</span>
            </div>
          </article>`
        )
        .join("");
    }
  }

  async function runAllChecks() {
    if (isChecking) return;
    isChecking = true;

    const refreshBtn = document.getElementById("sm-refresh-btn");
    if (refreshBtn) refreshBtn.disabled = true;

    const list = getChecksConfig();
    const results = [];
    for (const item of list) {
      // Run sequentially so we do not burst public endpoints simultaneously
      results.push(await probeEndpoint(item));
    }

    lastResults = results;
    renderResults(lastResults);
    isChecking = false;
    if (refreshBtn) refreshBtn.disabled = false;
  }

  function scheduleAutoRefresh(seconds) {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
    const sec = Number(seconds);
    if (sec >= 30) {
      timerId = window.setInterval(runAllChecks, sec * 1000);
    }
  }

  function init() {
    const root = document.getElementById("system-monitor-root");
    if (!root || root.dataset.smInit === "1") return;
    root.dataset.smInit = "1";

    const refreshBtn = document.getElementById("sm-refresh-btn");
    const intervalSel = document.getElementById("sm-interval-select");

    if (refreshBtn) {
      refreshBtn.addEventListener("click", runAllChecks);
    }
    if (intervalSel) {
      intervalSel.addEventListener("change", () => {
        scheduleAutoRefresh(intervalSel.value);
      });
      scheduleAutoRefresh(intervalSel.value);
    } else {
      scheduleAutoRefresh(60);
    }

    window.addEventListener("beforeunload", () => scheduleAutoRefresh(0));
    runAllChecks();
  }

  window.PortfolioSystemMonitor = {
    init,
    runAllChecks,
    probeEndpoint
  };
})();
