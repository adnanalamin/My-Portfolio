/**
 * AL AMIN Portfolio OS — Phase 57: Technology Learning Roadmap
 * Statuses: Completed, Active, Planned, Exploring
 * Honest project-linked learning roadmap from centralized PortfolioData.getLearningRoadmap().
 */
(() => {
  const STATUSES = ["Completed", "Active", "Planned", "Exploring"];

  const state = {
    category: "All",
    status: "All",
    query: "",
    selectedId: ""
  };

  function esc(val) {
    if (typeof window.escapeHtml === "function") return window.escapeHtml(val);
    return String(val ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function refreshIcons() {
    if (typeof window.refreshIcons === "function") window.refreshIcons();
    else if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
  }

  function getRoadmap() {
    if (window.PortfolioData && typeof window.PortfolioData.getLearningRoadmap === "function") {
      return window.PortfolioData.getLearningRoadmap();
    }
    return [];
  }

  function getFiltered() {
    const q = state.query.trim().toLowerCase();
    return getRoadmap().filter((item) => {
      if (state.category !== "All" && item.category !== state.category) return false;
      if (state.status !== "All" && item.currentStatus !== state.status) return false;
      if (!q) return true;
      const hay = [
        item.technology,
        item.category,
        item.currentStatus,
        item.relatedProject,
        item.learningObjective,
        item.notes,
        ...(item.resources || [])
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function renderSummary() {
    const mount = document.getElementById("lr-progress-summary");
    if (!mount) return;
    const all = getRoadmap();

    mount.innerHTML = STATUSES.map((st) => {
      const count = all.filter((i) => i.currentStatus === st).length;
      const pct = all.length > 0 ? Math.round((count / all.length) * 100) : 0;
      return `
        <div class="lr-card space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="lr-status-badge" data-status="${esc(st)}">${esc(st)}</span>
            <span class="text-sm font-bold font-mono-tech text-[var(--text)] tabular-nums">${count}</span>
          </div>
          <div class="lr-progress-track" aria-hidden="true">
            <div class="lr-progress-fill" style="width:${pct}%"></div>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderDetail(item) {
    const detailMount = document.getElementById("lr-detail-panel");
    if (!detailMount) return;
    if (!item) {
      detailMount.innerHTML = `<p class="text-sm text-[var(--muted)]">Select a roadmap track to view connected project goals and resources.</p>`;
      return;
    }

    const resHtml = (item.resources || [])
      .map((r) => `<li class="text-xs sm:text-sm text-[var(--text-secondary)]">• ${esc(r)}</li>`)
      .join("");

    const projectUrl = item.relatedProjectId
      ? `project-details.html?id=${encodeURIComponent(item.relatedProjectId)}`
      : "projects.html";

    detailMount.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-mono-tech text-cyan-400">${esc(item.category)}</span>
          <span class="lr-status-badge" data-status="${esc(item.currentStatus)}">${esc(item.currentStatus)}</span>
        </div>

        <h2 class="text-lg sm:text-xl font-bold text-[var(--text)]">${esc(item.technology)}</h2>

        <div class="space-y-1">
          <p class="text-xs font-mono-tech uppercase text-[var(--muted)]">Learning Objective</p>
          <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${esc(item.learningObjective)}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs font-mono-tech uppercase text-[var(--muted)]">Engineering Notes</p>
          <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${esc(item.notes)}</p>
        </div>

        <div class="space-y-1.5">
          <p class="text-xs font-mono-tech uppercase text-[var(--muted)]">Study References</p>
          <ul class="space-y-1 list-none p-0 m-0">${resHtml}</ul>
        </div>

        <div class="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="text-[11px] font-mono-tech text-[var(--muted)]">Connected Real Project</p>
            <p class="text-sm font-semibold text-[var(--text)]">${esc(item.relatedProject)}</p>
          </div>
          <a href="${esc(projectUrl)}" class="secondary-button text-xs py-2 px-3.5 min-h-[38px]">
            <span>View Project</span>
            <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      </div>
    `;
    refreshIcons();
  }

  function renderTimeline() {
    const timelineEl = document.getElementById("lr-timeline");
    const countEl = document.getElementById("lr-count");
    if (!timelineEl) return;

    const filtered = getFiltered();
    if (countEl) {
      countEl.textContent = `${filtered.length} learning ${filtered.length === 1 ? "track" : "tracks"}`;
    }

    if (!state.selectedId || !filtered.some((i) => i.id === state.selectedId)) {
      state.selectedId = filtered[0] ? filtered[0].id : "";
    }

    const selected = filtered.find((i) => i.id === state.selectedId) || null;

    if (filtered.length === 0) {
      timelineEl.innerHTML = `<div class="lr-card text-sm text-[var(--muted)]">No roadmap entries match your filters.</div>`;
      renderDetail(null);
      return;
    }

    timelineEl.innerHTML = filtered
      .map((item) => {
        const isSel = item.id === state.selectedId;
        const hasProgress = typeof item.progress === "number";
        const projectHref = item.relatedProjectId
          ? `project-details.html?id=${encodeURIComponent(item.relatedProjectId)}`
          : "projects.html";

        return `
          <article class="lr-item">
            <span class="lr-node" data-status="${esc(item.currentStatus)}" aria-hidden="true"></span>
            <div class="lr-card space-y-3 ${isSel ? "border-cyan-400/70" : ""}">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="lr-status-badge" data-status="${esc(item.currentStatus)}">${esc(item.currentStatus)}</span>
                  <span class="text-xs font-mono-tech text-[var(--muted)]">${esc(item.category)}</span>
                </div>
                <button type="button" class="text-xs font-semibold text-cyan-400 hover:underline bg-transparent border-0 p-0 cursor-pointer" data-lr-select="${esc(item.id)}">
                  ${isSel ? "Inspecting" : "Inspect Details"}
                </button>
              </div>

              <div class="space-y-1">
                <h3 class="text-base sm:text-lg font-bold text-[var(--text)]">${esc(item.technology)}</h3>
                <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${esc(item.learningObjective)}</p>
              </div>

              ${
                hasProgress
                  ? `<div class="space-y-1">
                      <div class="flex items-center justify-between text-[11px] font-mono-tech text-[var(--muted)]">
                        <span>Configured Progress</span>
                        <span class="tabular-nums">${item.progress}%</span>
                      </div>
                      <div class="lr-progress-track"><div class="lr-progress-fill" style="width:${item.progress}%"></div></div>
                    </div>`
                  : `<p class="text-[11px] font-mono-tech text-[var(--muted)]">Progress: Exploratory / Unmeasured</p>`
              }

              <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)] text-xs">
                <span class="text-[var(--muted)]">Project: <strong class="text-[var(--text)]">${esc(item.relatedProject)}</strong></span>
                <a href="${esc(projectHref)}" class="text-indigo-400 hover:underline font-semibold">Case Study →</a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    timelineEl.querySelectorAll("[data-lr-select]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedId = btn.getAttribute("data-lr-select") || "";
        renderTimeline();
      });
    });

    renderDetail(selected);
  }

  function bindEvents() {
    const catEl = document.getElementById("lr-category-filter");
    const statusEl = document.getElementById("lr-status-filter");
    const searchEl = document.getElementById("lr-search");
    const resetEl = document.getElementById("lr-reset");

    if (catEl) {
      catEl.addEventListener("change", () => {
        state.category = catEl.value || "All";
        renderTimeline();
      });
    }
    if (statusEl) {
      statusEl.addEventListener("change", () => {
        state.status = statusEl.value || "All";
        renderTimeline();
      });
    }
    if (searchEl) {
      searchEl.addEventListener("input", () => {
        state.query = searchEl.value || "";
        renderTimeline();
      });
    }
    if (resetEl) {
      resetEl.addEventListener("click", () => {
        state.category = "All";
        state.status = "All";
        state.query = "";
        if (catEl) catEl.value = "All";
        if (statusEl) statusEl.value = "All";
        if (searchEl) searchEl.value = "";
        renderTimeline();
      });
    }
  }

  function init() {
    const root = document.getElementById("learning-roadmap-root");
    if (!root) return;
    bindEvents();
    renderSummary();
    renderTimeline();
  }

  window.PortfolioLearningRoadmap = {
    init,
    STATUSES,
    getFiltered
  };
})();
