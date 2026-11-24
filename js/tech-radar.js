/**
 * AL AMIN Portfolio OS — Phase 56: Interactive Technology Radar
 * Quadrants: Frontend, Backend, Database, DevOps / Tools
 * Rings: Core, Active, Learning, Exploring
 * Renders strictly from centralized PortfolioData.getTechRadar(). Zero fabricated proficiency.
 */
(() => {
  const QUADRANTS = ["Frontend", "Backend", "Database", "DevOps / Tools"];
  const RINGS = ["Core", "Active", "Learning", "Exploring"];
  const RING_RADII = { Core: 78, Active: 146, Learning: 214, Exploring: 278 };
  const RING_COLORS = {
    Core: "#34d399",
    Active: "#22d3ee",
    Learning: "#818cf8",
    Exploring: "#fbbf24"
  };

  const QUADRANT_ANGLES = {
    Frontend: [188, 262], // top-left
    Backend: [278, 352], // top-right
    Database: [98, 172], // bottom-left
    "DevOps / Tools": [8, 82] // bottom-right
  };

  const state = {
    query: "",
    quadrant: "All",
    ring: "All",
    selectedName: ""
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

  function getData() {
    if (window.PortfolioData && typeof window.PortfolioData.getTechRadar === "function") {
      return window.PortfolioData.getTechRadar();
    }
    return [];
  }

  function getFilteredItems() {
    const q = state.query.trim().toLowerCase();
    return getData().filter((item) => {
      if (state.quadrant !== "All" && item.category !== state.quadrant) return false;
      if (state.ring !== "All" && item.status !== state.ring) return false;
      if (!q) return true;
      const hay = [
        item.name,
        item.category,
        item.status,
        item.description || "",
        ...(item.relatedProjects || []),
        ...(item.relatedSkills || [])
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function computeCoordinates(items) {
    const buckets = {};
    items.forEach((item) => {
      const key = `${item.category}|${item.status}`;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(item);
    });

    const positioned = [];
    Object.entries(buckets).forEach(([, group]) => {
      group.forEach((item, idx) => {
        const range = QUADRANT_ANGLES[item.category] || [10, 80];
        const baseR = RING_RADII[item.status] || 146;
        const innerOffset = item.status === "Core" ? -18 : -22;
        const step = (range[1] - range[0]) / (group.length + 1);
        const angleDeg = range[0] + step * (idx + 1);
        const radius = baseR + innerOffset + (idx % 2 === 0 ? -8 : 10);
        const rad = (angleDeg * Math.PI) / 180;
        positioned.push({
          ...item,
          x: Number((320 + radius * Math.cos(rad)).toFixed(1)),
          y: Number((320 + radius * Math.sin(rad)).toFixed(1))
        });
      });
    });

    return positioned;
  }

  function renderDetailPanel(selectedItem) {
    const mount = document.getElementById("tr-detail-panel");
    if (!mount) return;
    if (!selectedItem) {
      mount.innerHTML = `<p class="text-sm text-[var(--muted)]">Select any technology node on the radar or accessible list to inspect projects and skills.</p>`;
      return;
    }

    const projectsHtml = (selectedItem.relatedProjects || [])
      .map((p) => `<span class="tech-badge-item text-xs py-1 px-2.5">${esc(p)}</span>`)
      .join("");
    const skillsHtml = (selectedItem.relatedSkills || [])
      .map((s) => `<span class="tech-badge-item text-xs py-1 px-2.5">${esc(s)}</span>`)
      .join("");

    mount.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="text-xs font-mono-tech text-cyan-400">${esc(selectedItem.category)}</p>
            <h2 class="text-xl font-bold text-[var(--text)]">${esc(selectedItem.name)}</h2>
          </div>
          <span class="tr-ring-badge" data-ring="${esc(selectedItem.status)}">${esc(selectedItem.status)}</span>
        </div>

        <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${esc(selectedItem.description || "Configured portfolio stack technology.")}</p>

        <div class="space-y-1.5">
          <h3 class="text-xs font-mono-tech uppercase text-[var(--muted)]">Connected Projects</h3>
          <div class="flex flex-wrap gap-1.5">${projectsHtml || `<span class="text-xs text-[var(--muted)]">General workflow</span>`}</div>
        </div>

        <div class="space-y-1.5">
          <h3 class="text-xs font-mono-tech uppercase text-[var(--muted)]">Related Configured Skills</h3>
          <div class="flex flex-wrap gap-1.5">${skillsHtml || `<span class="text-xs text-[var(--muted)]">Core capability</span>`}</div>
        </div>

        <div class="pt-3 border-t border-[var(--border)] flex flex-wrap gap-2">
          <a href="explorer.html?tech=${encodeURIComponent(selectedItem.name)}" class="secondary-button text-xs py-2 px-3.5 min-h-[38px]">
            <span>Open in Tech Explorer</span>
            <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      </div>
    `;
    refreshIcons();
  }

  function renderRadarSvg(positioned, selectedName) {
    const svg = document.getElementById("tr-radar-svg");
    const tooltip = document.getElementById("tr-tooltip");
    if (!svg) return;

    const ringCircles = RINGS.map((ring) => {
      const r = RING_RADII[ring];
      return `
        <circle cx="320" cy="320" r="${r}" fill="none" stroke="rgba(148,163,184,0.2)" stroke-dasharray="${ring === "Exploring" ? "4 4" : "none"}" />
        <text x="326" y="${320 - r + 14}" fill="rgba(148,163,184,0.78)" font-size="11" font-family="JetBrains Mono, monospace">${esc(ring)}</text>
      `;
    }).join("");

    const blips = positioned
      .map((item) => {
        const fill = RING_COLORS[item.status] || "#22d3ee";
        const isSel = item.name === selectedName;
        return `
          <g
            class="tr-blip ${isSel ? "is-selected" : ""}"
            role="button"
            tabindex="0"
            data-tr-name="${esc(item.name)}"
            aria-label="${esc(item.name)} — ${esc(item.category)}, ${esc(item.status)} ring"
          >
            ${isSel ? `<circle cx="${item.x}" cy="${item.y}" r="14" fill="none" stroke="${fill}" stroke-width="2" opacity="0.65" />` : ""}
            <circle cx="${item.x}" cy="${item.y}" r="8" fill="${fill}" stroke="#050816" stroke-width="2" />
            <text x="${item.x}" y="${item.y + 18}" text-anchor="middle" fill="#cbd5e1" font-size="10" font-weight="600">${esc(item.name.slice(0, 14))}</text>
          </g>
        `;
      })
      .join("");

    svg.innerHTML = `
      <rect width="640" height="640" rx="20" fill="rgba(5, 8, 22, 0.45)" />
      ${ringCircles}
      <line x1="320" y1="24" x2="320" y2="616" stroke="rgba(148,163,184,0.22)" />
      <line x1="24" y1="320" x2="616" y2="320" stroke="rgba(148,163,184,0.22)" />
      <text x="40" y="42" fill="#818cf8" font-size="12" font-weight="700">FRONTEND</text>
      <text x="600" y="42" text-anchor="end" fill="#22d3ee" font-size="12" font-weight="700">BACKEND</text>
      <text x="40" y="610" fill="#34d399" font-size="12" font-weight="700">DATABASE</text>
      <text x="600" y="610" text-anchor="end" fill="#fbbf24" font-size="12" font-weight="700">DEVOPS / TOOLS</text>
      ${blips}
    `;

    svg.querySelectorAll("[data-tr-name]").forEach((node) => {
      const name = node.getAttribute("data-tr-name") || "";
      const select = () => {
        state.selectedName = name;
        render();
      };
      node.addEventListener("click", select);
      node.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select();
        }
      });
      node.addEventListener("mouseenter", () => {
        const hit = positioned.find((p) => p.name === name);
        if (!hit || !tooltip) return;
        tooltip.textContent = `${hit.name} · ${hit.category} (${hit.status})`;
        tooltip.classList.remove("hidden");
        tooltip.style.left = `${Math.min(82, (hit.x / 640) * 100)}%`;
        tooltip.style.top = `${Math.max(4, (hit.y / 640) * 100 - 8)}%`;
      });
      node.addEventListener("mouseleave", () => {
        if (tooltip) tooltip.classList.add("hidden");
      });
    });
  }

  function renderAccessibleList(items, selectedName) {
    const listMount = document.getElementById("tr-accessible-list");
    if (!listMount) return;

    if (items.length === 0) {
      listMount.innerHTML = `<div class="tr-list-card text-sm text-[var(--muted)]">No configured technologies match your current filter.</div>`;
      return;
    }

    listMount.innerHTML = items
      .map(
        (item) => `
          <button
            type="button"
            class="tr-list-card space-y-1.5 ${item.name === selectedName ? "is-selected" : ""}"
            data-tr-list-name="${esc(item.name)}"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-sm text-[var(--text)]">${esc(item.name)}</span>
              <span class="tr-ring-badge" data-ring="${esc(item.status)}">${esc(item.status)}</span>
            </div>
            <p class="text-xs text-cyan-400">${esc(item.category)}</p>
            <p class="text-xs text-[var(--muted)] line-clamp-2">${esc(item.description || "")}</p>
          </button>
        `
      )
      .join("");

    listMount.querySelectorAll("[data-tr-list-name]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedName = btn.getAttribute("data-tr-list-name") || "";
        render();
      });
    });
  }

  function render() {
    const filtered = getFilteredItems();
    const countEl = document.getElementById("tr-count");
    if (countEl) {
      countEl.textContent = `${filtered.length} configured ${filtered.length === 1 ? "technology" : "technologies"}`;
    }

    if (!state.selectedName || !filtered.some((i) => i.name === state.selectedName)) {
      state.selectedName = filtered[0] ? filtered[0].name : "";
    }

    const selectedItem = filtered.find((i) => i.name === state.selectedName) || null;
    const positioned = computeCoordinates(filtered);

    renderRadarSvg(positioned, state.selectedName);
    renderAccessibleList(filtered, state.selectedName);
    renderDetailPanel(selectedItem);
  }

  function bindEvents() {
    const searchEl = document.getElementById("tr-search");
    const quadEl = document.getElementById("tr-quadrant-filter");
    const ringEl = document.getElementById("tr-ring-filter");
    const resetEl = document.getElementById("tr-reset");

    if (searchEl) {
      searchEl.addEventListener("input", () => {
        state.query = searchEl.value || "";
        render();
      });
    }
    if (quadEl) {
      quadEl.addEventListener("change", () => {
        state.quadrant = quadEl.value || "All";
        render();
      });
    }
    if (ringEl) {
      ringEl.addEventListener("change", () => {
        state.ring = ringEl.value || "All";
        render();
      });
    }
    if (resetEl) {
      resetEl.addEventListener("click", () => {
        state.query = "";
        state.quadrant = "All";
        state.ring = "All";
        if (searchEl) searchEl.value = "";
        if (quadEl) quadEl.value = "All";
        if (ringEl) ringEl.value = "All";
        render();
      });
    }
  }

  function init() {
    const root = document.getElementById("tech-radar-root");
    if (!root) return;
    bindEvents();
    render();
  }

  window.PortfolioTechRadar = {
    init,
    QUADRANTS,
    RINGS,
    getFilteredItems,
    computeCoordinates
  };
})();
