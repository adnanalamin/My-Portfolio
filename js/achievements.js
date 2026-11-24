/**
 * AL AMIN Portfolio OS — Phase 59: Achievement & Certification System
 * Reads strictly from centralized PortfolioData.getCertificates().
 * Never invents awards, clients, or verification URLs; omits verify button when unconfigured.
 */
(() => {
  const state = {
    category: "All",
    year: "All",
    query: "",
    lightboxIdx: 0
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

  function getCertificates() {
    if (window.PortfolioData && typeof window.PortfolioData.getCertificates === "function") {
      return window.PortfolioData.getCertificates();
    }
    return [];
  }

  function isSafeExternalUrl(url) {
    const raw = String(url || "").trim();
    return raw.startsWith("https://") || raw.startsWith("http://");
  }

  function getFiltered() {
    const q = state.query.trim().toLowerCase();
    return getCertificates().filter((cert) => {
      if (state.category !== "All" && cert.category !== state.category) return false;
      if (state.year !== "All" && String(cert.date) !== state.year) return false;
      if (!q) return true;
      const hay = [
        cert.title,
        cert.category,
        cert.issuer,
        cert.date,
        cert.credentialId,
        cert.description || "",
        ...(cert.skills || [])
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function openLightbox(idx) {
    const filtered = getFiltered();
    const modal = document.getElementById("ach-lightbox");
    const img = document.getElementById("ach-lightbox-img");
    const titleEl = document.getElementById("ach-lightbox-caption");
    const dlEl = document.getElementById("ach-lightbox-download");
    if (!modal || !img || filtered.length === 0) return;

    state.lightboxIdx = (idx + filtered.length) % filtered.length;
    const cert = filtered[state.lightboxIdx];
    img.src = cert.image;
    img.alt = `${cert.title} certificate preview`;
    if (titleEl) titleEl.textContent = `${cert.title} · ${cert.credentialId}`;
    if (dlEl) {
      dlEl.href = cert.image;
      dlEl.setAttribute("download", cert.downloadFile || "certificate.svg");
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  }

  function closeLightbox() {
    const modal = document.getElementById("ach-lightbox");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  }

  function render() {
    const gridEl = document.getElementById("ach-grid");
    const countEl = document.getElementById("ach-count");
    if (!gridEl) return;

    const filtered = getFiltered();
    if (countEl) {
      countEl.textContent = `${filtered.length} verified ${filtered.length === 1 ? "credential" : "credentials"} from configured records`;
    }

    if (filtered.length === 0) {
      gridEl.innerHTML = `<div class="ach-panel col-span-full text-sm text-[var(--muted)]">No configured certificates match your search or filters.</div>`;
      return;
    }

    gridEl.innerHTML = filtered
      .map((cert, idx) => {
        const skillsHtml = (cert.skills || [])
          .map((s) => `<span class="tech-badge-item text-[11px] py-0.5 px-2">${esc(s)}</span>`)
          .join("");
        const verifyHtml = isSafeExternalUrl(cert.verificationUrl)
          ? `<a href="${esc(cert.verificationUrl)}" target="_blank" rel="noopener noreferrer" class="outline-button text-xs py-1.5 px-3 min-h-[36px]">
              <span>Verify</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>`
          : "";

        return `
          <article class="ach-badge-card">
            <div>
              <button type="button" class="w-full block border-0 p-0 bg-transparent cursor-pointer" data-ach-preview="${idx}" aria-label="Open preview for ${esc(cert.title)}">
                <div class="aspect-[4/3] overflow-hidden border-b border-[var(--border)] bg-[#060a14]">
                  <img src="${esc(cert.image)}" alt="${esc(cert.title)}" loading="lazy" class="w-full h-full object-cover">
                </div>
              </button>

              <div class="p-4 sm:p-5 space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="ach-seal" aria-hidden="true">
                    <i data-lucide="award" class="w-4 h-4"></i>
                  </div>
                  <div class="text-right text-xs font-mono-tech text-[var(--muted)]">
                    <p class="text-cyan-400 font-semibold">${esc(cert.category)}</p>
                    <p class="tabular-nums">${esc(cert.date)}</p>
                  </div>
                </div>

                <div class="space-y-1">
                  <h2 class="text-base sm:text-lg font-bold text-[var(--text)]">${esc(cert.title)}</h2>
                  <p class="text-xs text-[var(--muted)]">${esc(cert.issuer)} · <span class="font-mono-tech text-indigo-400">${esc(cert.credentialId)}</span></p>
                </div>

                <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">${esc(cert.description || "")}</p>
                <div class="flex flex-wrap gap-1.5">${skillsHtml}</div>
              </div>
            </div>

            <div class="px-4 sm:px-5 pb-4 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 ach-no-print">
              <button type="button" class="secondary-button text-xs py-1.5 px-3 min-h-[36px]" data-ach-preview="${idx}">
                <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
                <span>Preview</span>
              </button>
              <div class="flex items-center gap-2">
                ${verifyHtml}
                <a href="${esc(cert.image)}" download="${esc(cert.downloadFile || "certificate.svg")}" class="primary-button text-xs py-1.5 px-3 min-h-[36px]">
                  <i data-lucide="download" class="w-3.5 h-3.5"></i>
                  <span>Download</span>
                </a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    gridEl.querySelectorAll("[data-ach-preview]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openLightbox(Number(btn.getAttribute("data-ach-preview") || "0"));
      });
    });

    refreshIcons();
  }

  function bindEvents() {
    const searchEl = document.getElementById("ach-search");
    const catEl = document.getElementById("ach-category-filter");
    const yearEl = document.getElementById("ach-year-filter");
    const printBtn = document.getElementById("ach-print-btn");
    const closeBtn = document.getElementById("ach-lightbox-close");
    const prevBtn = document.getElementById("ach-lightbox-prev");
    const nextBtn = document.getElementById("ach-lightbox-next");
    const modal = document.getElementById("ach-lightbox");

    if (searchEl) searchEl.addEventListener("input", () => { state.query = searchEl.value || ""; render(); });
    if (catEl) catEl.addEventListener("change", () => { state.category = catEl.value || "All"; render(); });
    if (yearEl) yearEl.addEventListener("change", () => { state.year = yearEl.value || "All"; render(); });
    if (printBtn) printBtn.addEventListener("click", () => { if (typeof window.print === "function") window.print(); });

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", () => openLightbox(state.lightboxIdx - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => openLightbox(state.lightboxIdx + 1));
    if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) closeLightbox(); });

    if (!bindEvents.keyBound) {
      bindEvents.keyBound = true;
      document.addEventListener("keydown", (e) => {
        if (!modal || !modal.classList.contains("is-open")) return;
        if (e.key === "Escape") closeLightbox();
        else if (e.key === "ArrowLeft") openLightbox(state.lightboxIdx - 1);
        else if (e.key === "ArrowRight") openLightbox(state.lightboxIdx + 1);
      });
    }
  }

  function init() {
    const root = document.getElementById("achievements-root");
    if (!root) return;
    bindEvents();
    render();
  }

  window.PortfolioAchievements = {
    init,
    getFiltered,
    isSafeExternalUrl
  };
})();
