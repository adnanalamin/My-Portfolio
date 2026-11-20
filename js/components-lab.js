/**
 * AL AMIN Portfolio — Phase 33: Premium UI Component Lab (components.html)
 * 16 interactive component categories built on the AL AMIN design system.
 * Every category supports live working Preview, source Code inspection,
 * clipboard Copy, and deterministic state Reset across 320px–2560px.
 */

(() => {
  const GROUPS = ["All", "Actions & Forms", "Overlays & Feedback", "Layout & Nav", "Data & Commerce"];

  const DEFAULT_COMPONENTS = [
    {
      id: "buttons",
      number: "01",
      title: "Buttons",
      group: "Actions & Forms",
      summary: "Primary gradient CTA, secondary/outline surfaces, stateful async loading toggle, and disabled state.",
      code: `<div class="flex flex-wrap items-center gap-3">
  <button type="button" class="primary-button">Primary Action</button>
  <button type="button" class="secondary-button">Secondary</button>
  <button type="button" class="outline-button">Outline</button>
  <button type="button" class="outline-button" disabled>Disabled</button>
</div>`,
      renderPreview: () => `
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="primary-button text-xs sm:text-sm" data-lab-btn-counter>
              <span>Primary Action</span>
              <span class="tabular-nums font-mono-tech text-xs opacity-90" data-lab-btn-count>(0)</span>
            </button>
            <button type="button" class="secondary-button text-xs sm:text-sm" data-lab-btn-secondary>Secondary</button>
            <button type="button" class="outline-button text-xs sm:text-sm" data-lab-btn-loading>
              <i data-lucide="loader-2" class="w-4 h-4 hidden animate-spin" data-lab-btn-spinner></i>
              <span data-lab-btn-loading-label>Run Action</span>
            </button>
            <button type="button" class="outline-button text-xs sm:text-sm" disabled>Disabled</button>
          </div>
          <p class="text-xs font-mono-tech text-[var(--muted)]" data-lab-btn-status>
            Click Primary Action to increment or Run Action to test async button lock.
          </p>
        </div>
      `,
      bind: (stage) => {
        let clicks = 0;
        let timer = null;
        const primaryBtn = stage.querySelector("[data-lab-btn-counter]");
        const countEl = stage.querySelector("[data-lab-btn-count]");
        const secBtn = stage.querySelector("[data-lab-btn-secondary]");
        const loadBtn = stage.querySelector("[data-lab-btn-loading]");
        const spinnerEl = stage.querySelector("[data-lab-btn-spinner]");
        const loadLabel = stage.querySelector("[data-lab-btn-loading-label]");
        const statusEl = stage.querySelector("[data-lab-btn-status]");

        if (primaryBtn) {
          primaryBtn.addEventListener("click", () => {
            clicks += 1;
            if (countEl) countEl.textContent = `(${clicks})`;
            if (statusEl) statusEl.textContent = `Primary clicked ${clicks} time${clicks === 1 ? "" : "s"}.`;
          });
        }
        if (secBtn) {
          secBtn.addEventListener("click", () => {
            if (statusEl) statusEl.textContent = "Secondary button triggered.";
          });
        }
        if (loadBtn) {
          loadBtn.addEventListener("click", () => {
            if (loadBtn.disabled) return;
            loadBtn.disabled = true;
            if (spinnerEl) spinnerEl.classList.remove("hidden");
            if (loadLabel) loadLabel.textContent = "Processing...";
            if (statusEl) statusEl.textContent = "Async button state active (900ms simulation)...";
            timer = setTimeout(() => {
              if (!stage.isConnected) return;
              loadBtn.disabled = false;
              if (spinnerEl) spinnerEl.classList.add("hidden");
              if (loadLabel) loadLabel.textContent = "Run Action";
              if (statusEl) statusEl.textContent = "Async action complete.";
            }, 900);
          });
        }

        return () => {
          if (timer) clearTimeout(timer);
        };
      }
    },
    {
      id: "cards",
      number: "02",
      title: "Cards",
      group: "Data & Commerce",
      summary: "Single-elevation portfolio showcase and system module cards with bookmark interaction and hairline borders.",
      code: `<article class="card p-5 space-y-3 hover-lift">
  <div class="flex items-center justify-between text-xs text-[var(--muted)]">
    <span class="font-semibold text-cyan-400">SaaS Architecture</span>
    <span class="tabular-nums">2026</span>
  </div>
  <h3 class="text-lg font-bold text-[var(--text)]">AstraPulse Telemetry</h3>
  <p class="text-sm text-[var(--text-secondary)]">Real-time latency observability across multi-region APIs.</p>
</article>`,
      renderPreview: () => `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <article class="card p-5 space-y-3">
            <div class="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
              <span class="font-semibold text-cyan-400">MERN SaaS</span>
              <span class="font-mono-tech tabular-nums">2026</span>
            </div>
            <h3 class="text-base font-bold text-[var(--text)]">AstraPulse Telemetry</h3>
            <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Time-bucketed latency and uptime inspection built with Express &amp; MongoDB.
            </p>
            <div class="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-2">
              <button type="button" class="lab-tool-btn" data-lab-card-save aria-pressed="false">
                <span data-lab-card-save-text>Save Specimen</span>
              </button>
              <a href="project-details.html?id=astrapulse" class="text-xs font-semibold text-cyan-400 hover:underline inline-flex items-center gap-1">
                <span>Case Study</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </a>
            </div>
          </article>

          <article class="card p-5 space-y-3">
            <div class="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
              <span class="font-semibold text-indigo-400">System Pattern</span>
              <span class="font-mono-tech">Modular</span>
            </div>
            <h3 class="text-base font-bold text-[var(--text)]">Single-Elevation Surface</h3>
            <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Hairline border separation keeps nested controls crisp across dark, light, and high-contrast palettes.
            </p>
            <p class="pt-2 border-t border-[var(--border)] text-xs font-mono-tech text-[var(--muted)]" data-lab-card-note>
              Saved state: false
            </p>
          </article>
        </div>
      `,
      bind: (stage) => {
        let saved = false;
        const saveBtn = stage.querySelector("[data-lab-card-save]");
        const saveTxt = stage.querySelector("[data-lab-card-save-text]");
        const noteEl = stage.querySelector("[data-lab-card-note]");
        if (saveBtn) {
          saveBtn.addEventListener("click", () => {
            saved = !saved;
            saveBtn.setAttribute("aria-pressed", saved ? "true" : "false");
            if (saveTxt) saveTxt.textContent = saved ? "Saved" : "Save Specimen";
            if (noteEl) noteEl.textContent = `Saved state: ${saved}`;
          });
        }
      }
    },
    {
      id: "forms",
      number: "03",
      title: "Forms",
      group: "Actions & Forms",
      summary: "Client-validated project inquiry form with required field feedback and clean inline submission state.",
      code: `<form class="space-y-3">
  <div>
    <label for="demo-name" class="text-xs font-semibold">Full Name</label>
    <input id="demo-name" type="text" class="lab-demo-input" required placeholder="Alex Morgan" />
  </div>
  <div>
    <label for="demo-email" class="text-xs font-semibold">Work Email</label>
    <input id="demo-email" type="email" class="lab-demo-input" required placeholder="alex@company.com" />
  </div>
  <button type="submit" class="primary-button">Validate &amp; Submit</button>
</form>`,
      renderPreview: () => `
        <form class="space-y-4 max-w-lg" data-lab-demo-form novalidate>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label for="lab-form-name" class="block text-xs font-semibold text-[var(--text-secondary)]">Full Name *</label>
              <input id="lab-form-name" type="text" class="lab-demo-input" placeholder="Alex Morgan" autocomplete="off">
            </div>
            <div class="space-y-1">
              <label for="lab-form-email" class="block text-xs font-semibold text-[var(--text-secondary)]">Work Email *</label>
              <input id="lab-form-email" type="email" class="lab-demo-input" placeholder="alex@example.com" autocomplete="off">
            </div>
          </div>
          <div class="space-y-1">
            <label for="lab-form-scope" class="block text-xs font-semibold text-[var(--text-secondary)]">Engagement Type</label>
            <select id="lab-form-scope" class="lab-demo-input">
              <option value="Full-Stack Web App">Full-Stack Web App</option>
              <option value="SaaS Architecture">SaaS Architecture</option>
              <option value="Design System">Design System</option>
            </select>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button type="submit" class="primary-button text-xs sm:text-sm min-h-[40px]">Validate &amp; Submit</button>
            <p class="text-xs text-[var(--muted)]" data-lab-form-msg aria-live="polite">Fill required fields and submit to test validation.</p>
          </div>
        </form>
      `,
      bind: (stage) => {
        const form = stage.querySelector("[data-lab-demo-form]");
        const nameInput = stage.querySelector("#lab-form-name");
        const emailInput = stage.querySelector("#lab-form-email");
        const scopeSelect = stage.querySelector("#lab-form-scope");
        const msgEl = stage.querySelector("[data-lab-form-msg]");
        if (!form) return;

        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const name = (nameInput && nameInput.value.trim()) || "";
          const email = (emailInput && emailInput.value.trim()) || "";
          const scope = (scopeSelect && scopeSelect.value) || "";
          if (name.length < 2) {
            if (msgEl) {
              msgEl.className = "text-xs font-semibold text-rose-400";
              msgEl.textContent = "Please enter at least 2 characters for Full Name.";
            }
            return;
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            if (msgEl) {
              msgEl.className = "text-xs font-semibold text-rose-400";
              msgEl.textContent = "Please enter a valid email address.";
            }
            return;
          }
          if (msgEl) {
            msgEl.className = "text-xs font-semibold text-emerald-400";
            msgEl.textContent = `Validated cleanly for ${name} (${scope}). Demo only—not transmitted.`;
          }
        });
      }
    },
    {
      id: "inputs",
      number: "04",
      title: "Inputs",
      group: "Actions & Forms",
      summary: "Search field with live character telemetry, masked credential field with visibility toggle, and accessible switch.",
      code: `<div class="space-y-3">
  <input type="search" class="lab-demo-input" placeholder="Search endpoints or components..." />
  <button type="button" class="lab-switch" role="switch" aria-checked="true">
    <span class="lab-switch-thumb"></span>
  </button>
</div>`,
      renderPreview: () => `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label for="lab-in-search" class="block text-xs font-semibold text-[var(--text-secondary)]">Search Input</label>
            <div class="relative flex items-center">
              <i data-lucide="search" class="w-4 h-4 absolute left-3 text-[var(--muted)] pointer-events-none"></i>
              <input id="lab-in-search" type="search" class="lab-demo-input pl-9 pr-14" placeholder="Filter tokens..." autocomplete="off">
              <span class="absolute right-3 text-[11px] font-mono-tech text-[var(--muted)] tabular-nums" data-lab-in-len>0 ch</span>
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="lab-in-secret" class="block text-xs font-semibold text-[var(--text-secondary)]">Masked Field Toggle</label>
            <div class="flex items-center gap-2">
              <input id="lab-in-secret" type="password" class="lab-demo-input" value="demo-passphrase-value" autocomplete="off">
              <button type="button" class="lab-tool-btn shrink-0" data-lab-in-eye aria-pressed="false">
                <i data-lucide="eye" class="w-4 h-4"></i>
                <span data-lab-in-eye-txt>Show</span>
              </button>
            </div>
          </div>

          <div class="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <div class="space-y-0.5">
              <p class="text-sm font-semibold text-[var(--text)]">Accessible Switch Toggle</p>
              <p class="text-xs text-[var(--muted)]" data-lab-switch-state>Status: Enabled</p>
            </div>
            <button type="button" class="lab-switch" role="switch" aria-checked="true" aria-label="Toggle notification preference" data-lab-in-switch>
              <span class="lab-switch-thumb"></span>
            </button>
          </div>
        </div>
      `,
      bind: (stage) => {
        const searchEl = stage.querySelector("#lab-in-search");
        const lenEl = stage.querySelector("[data-lab-in-len]");
        const secretEl = stage.querySelector("#lab-in-secret");
        const eyeBtn = stage.querySelector("[data-lab-in-eye]");
        const eyeTxt = stage.querySelector("[data-lab-in-eye-txt]");
        const swBtn = stage.querySelector("[data-lab-in-switch]");
        const swState = stage.querySelector("[data-lab-switch-state]");

        if (searchEl && lenEl) {
          searchEl.addEventListener("input", () => {
            lenEl.textContent = `${searchEl.value.length} ch`;
          });
        }
        if (eyeBtn && secretEl) {
          eyeBtn.addEventListener("click", () => {
            const isText = secretEl.type === "text";
            secretEl.type = isText ? "password" : "text";
            eyeBtn.setAttribute("aria-pressed", !isText ? "true" : "false");
            if (eyeTxt) eyeTxt.textContent = isText ? "Show" : "Hide";
          });
        }
        if (swBtn) {
          swBtn.addEventListener("click", () => {
            const checked = swBtn.getAttribute("aria-checked") === "true";
            const next = !checked;
            swBtn.setAttribute("aria-checked", next ? "true" : "false");
            if (swState) swState.textContent = `Status: ${next ? "Enabled" : "Disabled"}`;
          });
        }
      }
    },
    {
      id: "navbar",
      number: "05",
      title: "Navbar",
      group: "Layout & Nav",
      summary: "Responsive 3-zone top bar contract with single-line nav links, primary action button, and working mobile menu drawer.",
      code: `<header class="flex items-center justify-between gap-6 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
  <span class="font-extrabold tracking-tight text-[var(--text)] whitespace-nowrap">AL AMIN</span>
  <nav class="hidden sm:flex items-center gap-5 text-sm">
    <a href="#" class="text-cyan-400 font-semibold">Home</a>
    <a href="#" class="text-[var(--text-secondary)]">Projects</a>
    <a href="#" class="text-[var(--text-secondary)]">Services</a>
  </nav>
  <button type="button" class="primary-button text-xs min-h-[38px]">Hire Me</button>
</header>`,
      renderPreview: () => `
        <div class="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div class="px-4 py-3 flex items-center justify-between gap-4">
            <span class="text-sm font-extrabold tracking-tight text-[var(--text)] whitespace-nowrap shrink-0">AL AMIN</span>
            <nav class="hidden sm:flex items-center gap-4 text-xs font-medium" aria-label="Sample navbar links">
              <button type="button" class="bg-transparent border-0 p-0 cursor-pointer text-cyan-400 font-semibold whitespace-nowrap" data-lab-nav-item="Overview">Overview</button>
              <button type="button" class="bg-transparent border-0 p-0 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text)] whitespace-nowrap" data-lab-nav-item="Projects">Projects</button>
              <button type="button" class="bg-transparent border-0 p-0 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text)] whitespace-nowrap" data-lab-nav-item="Architecture">Architecture</button>
              <button type="button" class="bg-transparent border-0 p-0 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text)] whitespace-nowrap" data-lab-nav-item="Contact">Contact</button>
            </nav>
            <div class="flex items-center gap-2 shrink-0">
              <button type="button" class="primary-button text-xs min-h-[36px] px-3 py-1.5 whitespace-nowrap" data-lab-nav-cta>Get Quote</button>
              <button type="button" class="lab-tool-btn sm:hidden px-2" data-lab-nav-burger aria-expanded="false" aria-label="Toggle demo mobile navigation">
                <i data-lucide="menu" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <div class="hidden sm:hidden border-t border-[var(--border)] p-3 space-y-1.5 bg-[var(--background)]" data-lab-nav-drawer>
            <button type="button" class="block w-full text-left px-3 py-2 rounded-md text-xs font-semibold text-cyan-400 bg-[var(--surface)]" data-lab-nav-item="Overview">Overview</button>
            <button type="button" class="block w-full text-left px-3 py-2 rounded-md text-xs text-[var(--text-secondary)]" data-lab-nav-item="Projects">Projects</button>
            <button type="button" class="block w-full text-left px-3 py-2 rounded-md text-xs text-[var(--text-secondary)]" data-lab-nav-item="Architecture">Architecture</button>
            <button type="button" class="block w-full text-left px-3 py-2 rounded-md text-xs text-[var(--text-secondary)]" data-lab-nav-item="Contact">Contact</button>
          </div>

          <div class="px-4 py-2 border-t border-[var(--border)] bg-[var(--background)] text-xs font-mono-tech text-[var(--muted)]" data-lab-nav-status>
            Active route: Overview
          </div>
        </div>
      `,
      bind: (stage) => {
        const burger = stage.querySelector("[data-lab-nav-burger]");
        const drawer = stage.querySelector("[data-lab-nav-drawer]");
        const statusEl = stage.querySelector("[data-lab-nav-status]");
        const items = stage.querySelectorAll("[data-lab-nav-item]");
        const cta = stage.querySelector("[data-lab-nav-cta]");

        if (burger && drawer) {
          burger.addEventListener("click", () => {
            const isHidden = drawer.classList.contains("hidden");
            drawer.classList.toggle("hidden", !isHidden);
            burger.setAttribute("aria-expanded", isHidden ? "true" : "false");
          });
        }
        items.forEach((btn) => {
          btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-lab-nav-item") || "Overview";
            items.forEach((other) => {
              const match = other.getAttribute("data-lab-nav-item") === target;
              other.classList.toggle("text-cyan-400", match);
              other.classList.toggle("font-semibold", match);
            });
            if (statusEl) statusEl.textContent = `Active route: ${target}`;
            if (drawer) drawer.classList.add("hidden");
            if (burger) burger.setAttribute("aria-expanded", "false");
          });
        });
        if (cta) {
          cta.addEventListener("click", () => {
            if (statusEl) statusEl.textContent = "Primary Header Action triggered (Get Quote).";
          });
        }
      }
    },
    {
      id: "modal",
      number: "06",
      title: "Modal",
      group: "Overlays & Feedback",
      summary: "Accessible dialog overlay supporting Escape dismissal, backdrop click close, and explicit confirm/cancel controls.",
      code: `<div class="lab-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="lab-modal-dialog">
    <h3 id="modal-title" class="text-lg font-bold">Confirm Action</h3>
    <p class="text-sm text-[var(--text-secondary)]">Changes apply cleanly to the active preview workspace.</p>
    <div class="flex justify-end gap-2">
      <button type="button" class="outline-button">Cancel</button>
      <button type="button" class="primary-button">Confirm</button>
    </div>
  </div>
</div>`,
      renderPreview: () => `
        <div class="flex flex-wrap items-center justify-between gap-3">
          <button type="button" class="primary-button text-xs sm:text-sm min-h-[42px]" data-lab-modal-open>
            <i data-lucide="layers" class="w-4 h-4"></i>
            <span>Open Interactive Modal</span>
          </button>
          <p class="text-xs font-mono-tech text-[var(--muted)]" data-lab-modal-result>Modal status: Closed</p>
        </div>
      `,
      bind: (stage) => {
        const openBtn = stage.querySelector("[data-lab-modal-open]");
        const resultEl = stage.querySelector("[data-lab-modal-result]");
        let dialogBackdrop = null;
        let escHandler = null;

        function closeModal(statusText) {
          if (dialogBackdrop && dialogBackdrop.parentNode) {
            dialogBackdrop.parentNode.removeChild(dialogBackdrop);
          }
          dialogBackdrop = null;
          if (escHandler) {
            document.removeEventListener("keydown", escHandler);
            escHandler = null;
          }
          if (resultEl && statusText) resultEl.textContent = statusText;
        }

        if (openBtn) {
          openBtn.addEventListener("click", () => {
            closeModal();
            dialogBackdrop = document.createElement("div");
            dialogBackdrop.className = "lab-modal-backdrop";
            dialogBackdrop.setAttribute("role", "dialog");
            dialogBackdrop.setAttribute("aria-modal", "true");
            dialogBackdrop.setAttribute("aria-labelledby", "lab-live-modal-title");
            dialogBackdrop.innerHTML = `
              <div class="lab-modal-dialog">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-mono-tech text-cyan-400">Component Lab Dialog</p>
                    <h3 id="lab-live-modal-title" class="text-lg font-bold text-[var(--text)] mt-0.5">Publish Architecture Preset</h3>
                  </div>
                  <button type="button" class="lab-tool-btn px-2" data-lab-modal-close aria-label="Close modal">
                    <i data-lucide="x" class="w-4 h-4"></i>
                  </button>
                </div>
                <p class="text-sm text-[var(--text-secondary)] leading-relaxed">
                  This live modal supports Escape-key closure, backdrop click dismissal, and accessible confirm feedback.
                </p>
                <div class="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
                  <button type="button" class="outline-button text-xs min-h-[40px]" data-lab-modal-cancel>Cancel</button>
                  <button type="button" class="primary-button text-xs min-h-[40px]" data-lab-modal-confirm>Confirm Preset</button>
                </div>
              </div>
            `;
            document.body.appendChild(dialogBackdrop);
            if (window.lucide && typeof window.lucide.createIcons === "function") {
              window.lucide.createIcons();
            }
            if (resultEl) resultEl.textContent = "Modal status: Open";

            dialogBackdrop.addEventListener("click", (ev) => {
              if (ev.target === dialogBackdrop) {
                closeModal("Modal status: Dismissed via backdrop");
              }
            });
            const closeBtn = dialogBackdrop.querySelector("[data-lab-modal-close]");
            const cancelBtn = dialogBackdrop.querySelector("[data-lab-modal-cancel]");
            const confirmBtn = dialogBackdrop.querySelector("[data-lab-modal-confirm]");
            if (closeBtn) closeBtn.addEventListener("click", () => closeModal("Modal status: Closed"));
            if (cancelBtn) cancelBtn.addEventListener("click", () => closeModal("Modal status: Cancelled"));
            if (confirmBtn) {
              confirmBtn.addEventListener("click", () => closeModal("Modal status: Confirmed"));
            }
            escHandler = (ev) => {
              if (ev.key === "Escape") closeModal("Modal status: Closed via Escape");
            };
            document.addEventListener("keydown", escHandler);
          });
        }

        return () => closeModal();
      }
    },
    {
      id: "dropdown",
      number: "07",
      title: "Dropdown",
      group: "Overlays & Feedback",
      summary: "Keyboard-dismissible option menu with outside-click closing and live selection readout.",
      code: `<div class="relative inline-block">
  <button type="button" class="secondary-button" aria-expanded="false">
    <span>Select Runtime</span>
    <i data-lucide="chevron-down" class="w-4 h-4"></i>
  </button>
  <div class="absolute mt-2 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-lg">
    <button type="button" class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-[var(--background)]">Node.js + Express</button>
  </div>
</div>`,
      renderPreview: () => `
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="relative inline-block">
            <button type="button" class="secondary-button text-xs sm:text-sm min-h-[42px]" data-lab-dd-trigger aria-haspopup="listbox" aria-expanded="false">
              <span data-lab-dd-label>Select Architecture Stack</span>
              <i data-lucide="chevron-down" class="w-4 h-4"></i>
            </button>
            <div class="hidden absolute left-0 mt-2 w-60 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] p-1.5 shadow-lg z-30" role="listbox" data-lab-dd-menu>
              <button type="button" role="option" class="block w-full text-left px-3 py-2 rounded-md text-xs sm:text-sm text-[var(--text)] hover:bg-[var(--background)]" data-lab-dd-opt="MERN Full-Stack">MERN Full-Stack</button>
              <button type="button" role="option" class="block w-full text-left px-3 py-2 rounded-md text-xs sm:text-sm text-[var(--text)] hover:bg-[var(--background)]" data-lab-dd-opt="Next.js + PostgreSQL">Next.js + PostgreSQL</button>
              <button type="button" role="option" class="block w-full text-left px-3 py-2 rounded-md text-xs sm:text-sm text-[var(--text)] hover:bg-[var(--background)]" data-lab-dd-opt="Static Vanilla Jamstack">Static Vanilla Jamstack</button>
            </div>
          </div>
          <p class="text-xs font-mono-tech text-[var(--muted)]" data-lab-dd-selected>Selected: None</p>
        </div>
      `,
      bind: (stage) => {
        const trigger = stage.querySelector("[data-lab-dd-trigger]");
        const labelEl = stage.querySelector("[data-lab-dd-label]");
        const menu = stage.querySelector("[data-lab-dd-menu]");
        const selectedEl = stage.querySelector("[data-lab-dd-selected]");

        function setMenu(open) {
          if (!menu || !trigger) return;
          menu.classList.toggle("hidden", !open);
          trigger.setAttribute("aria-expanded", open ? "true" : "false");
        }

        if (trigger && menu) {
          trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            setMenu(menu.classList.contains("hidden"));
          });
        }
        stage.querySelectorAll("[data-lab-dd-opt]").forEach((opt) => {
          opt.addEventListener("click", () => {
            const val = opt.getAttribute("data-lab-dd-opt") || "";
            if (labelEl) labelEl.textContent = val;
            if (selectedEl) selectedEl.textContent = `Selected: ${val}`;
            setMenu(false);
          });
        });

        const docClick = (e) => {
          if (!stage.contains(e.target)) setMenu(false);
        };
        document.addEventListener("click", docClick);
        return () => document.removeEventListener("click", docClick);
      }
    },
    {
      id: "tabs",
      number: "08",
      title: "Tabs",
      group: "Layout & Nav",
      summary: "Segmented ARIA tablist switching structured specifications and contextual content cleanly.",
      code: `<div role="tablist" class="lab-view-tabs">
  <button type="button" role="tab" aria-selected="true" class="lab-view-tab is-active">Overview</button>
  <button type="button" role="tab" aria-selected="false" class="lab-view-tab">API Contract</button>
  <button type="button" role="tab" aria-selected="false" class="lab-view-tab">Deployment</button>
</div>`,
      renderPreview: () => `
        <div class="space-y-3">
          <div class="lab-view-tabs" role="tablist" aria-label="Sample component specification tabs">
            <button type="button" role="tab" class="lab-view-tab is-active" aria-selected="true" data-lab-tab-btn="overview">Overview</button>
            <button type="button" role="tab" class="lab-view-tab" aria-selected="false" data-lab-tab-btn="tokens">Design Tokens</button>
            <button type="button" role="tab" class="lab-view-tab" aria-selected="false" data-lab-tab-btn="a11y">Accessibility</button>
          </div>
          <div class="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text-secondary)]">
            <div role="tabpanel" data-lab-tab-panel="overview">
              Overview panel: Displays architecture goals, primary surface tokens, and responsive breakpoint strategy.
            </div>
            <div role="tabpanel" data-lab-tab-panel="tokens" hidden>
              Design Tokens panel: Maps semantic variables (--surface, --background, --border, --accent-cyan) cleanly across themes.
            </div>
            <div role="tabpanel" data-lab-tab-panel="a11y" hidden>
              Accessibility panel: Enforces aria-selected state updates, visible focus rings, and 44px minimum touch height.
            </div>
          </div>
        </div>
      `,
      bind: (stage) => {
        const btns = stage.querySelectorAll("[data-lab-tab-btn]");
        const panels = stage.querySelectorAll("[data-lab-tab-panel]");
        btns.forEach((btn) => {
          btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-lab-tab-btn");
            btns.forEach((b) => {
              const active = b.getAttribute("data-lab-tab-btn") === target;
              b.classList.toggle("is-active", active);
              b.setAttribute("aria-selected", active ? "true" : "false");
            });
            panels.forEach((p) => {
              p.hidden = p.getAttribute("data-lab-tab-panel") !== target;
            });
          });
        });
      }
    },
    {
      id: "accordion",
      number: "09",
      title: "Accordion",
      group: "Layout & Nav",
      summary: "Expandable disclosure panels with aria-expanded synchronization and clean hairline dividers.",
      code: `<div class="rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
  <button type="button" aria-expanded="true" class="w-full p-4 text-left font-semibold flex justify-between">
    <span>How are tokens shared across pages?</span>
    <i data-lucide="chevron-up" class="w-4 h-4"></i>
  </button>
</div>`,
      renderPreview: () => `
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
          <div>
            <button type="button" class="w-full px-4 py-3.5 text-left text-xs sm:text-sm font-semibold text-[var(--text)] flex items-center justify-between gap-2" aria-expanded="true" data-lab-acc-btn="0">
              <span>How are design tokens shared across all portfolio modules?</span>
              <i data-lucide="chevron-up" class="w-4 h-4 shrink-0 text-[var(--muted)]" data-lab-acc-ico="0"></i>
            </button>
            <div class="px-4 pb-3.5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed" data-lab-acc-panel="0">
              Global CSS variables in css/style.css automatically drive dark, light, and high-contrast themes without rewriting component classes.
            </div>
          </div>
          <div>
            <button type="button" class="w-full px-4 py-3.5 text-left text-xs sm:text-sm font-semibold text-[var(--text)] flex items-center justify-between gap-2" aria-expanded="false" data-lab-acc-btn="1">
              <span>Can interactive widgets adapt cleanly at 320px viewports?</span>
              <i data-lucide="chevron-down" class="w-4 h-4 shrink-0 text-[var(--muted)]" data-lab-acc-ico="1"></i>
            </button>
            <div class="px-4 pb-3.5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed" data-lab-acc-panel="1" hidden>
              Yes—flex-wrap toolbars, single-column mobile grid fallbacks, and horizontally contained code blocks prevent viewport overflow.
            </div>
          </div>
        </div>
      `,
      bind: (stage) => {
        stage.querySelectorAll("[data-lab-acc-btn]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-lab-acc-btn");
            const panel = stage.querySelector(`[data-lab-acc-panel="${id}"]`);
            const icon = stage.querySelector(`[data-lab-acc-ico="${id}"]`);
            const isOpen = btn.getAttribute("aria-expanded") === "true";
            btn.setAttribute("aria-expanded", !isOpen ? "true" : "false");
            if (panel) panel.hidden = isOpen;
            if (icon) {
              icon.setAttribute("data-lucide", isOpen ? "chevron-down" : "chevron-up");
              if (window.lucide && typeof window.lucide.createIcons === "function") {
                window.lucide.createIcons();
              }
            }
          });
        });
      }
    },
    {
      id: "toast",
      number: "10",
      title: "Toast",
      group: "Overlays & Feedback",
      summary: "Real toast notification triggers pushing live global feedback and inline dismissible status banners.",
      code: `<button type="button" onclick="window.showToast('Changes saved cleanly.', 'success')" class="primary-button">
  Trigger Success Toast
</button>`,
      renderPreview: () => `
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-2.5">
            <button type="button" class="primary-button text-xs min-h-[40px]" data-lab-toast-trigger="success">Success Toast</button>
            <button type="button" class="secondary-button text-xs min-h-[40px]" data-lab-toast-trigger="info">Info Toast</button>
            <button type="button" class="outline-button text-xs min-h-[40px]" data-lab-toast-trigger="error">Error Toast</button>
          </div>
          <div class="space-y-2" data-lab-toast-stack aria-live="polite">
            <p class="text-xs font-mono-tech text-[var(--muted)]">Click any trigger button to emit both a global and inline toast notification.</p>
          </div>
        </div>
      `,
      bind: (stage) => {
        const stack = stage.querySelector("[data-lab-toast-stack]");
        const labels = {
          success: "Success: Component configuration saved cleanly.",
          info: "Info: Synced component preview preferences.",
          error: "Notice: Simulated validation warning triggered."
        };
        stage.querySelectorAll("[data-lab-toast-trigger]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const tone = btn.getAttribute("data-lab-toast-trigger") || "info";
            const msg = labels[tone] || labels.info;
            if (typeof window.showToast === "function") {
              window.showToast(msg, tone);
            }
            if (!stack) return;
            if (stack.querySelector("p.font-mono-tech")) {
              stack.innerHTML = "";
            }
            const item = document.createElement("div");
            item.className = "p-3 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] flex items-center justify-between gap-2 text-xs text-[var(--text)]";
            item.innerHTML = `<span>${escHtml(msg)}</span><button type="button" class="text-[var(--muted)] hover:text-[var(--text)]" aria-label="Dismiss notification">&times;</button>`;
            item.querySelector("button").addEventListener("click", () => item.remove());
            stack.prepend(item);
            if (stack.children.length > 3) stack.lastElementChild.remove();
          });
        });
      }
    },
    {
      id: "alerts",
      number: "11",
      title: "Alerts",
      group: "Overlays & Feedback",
      summary: "Semantic inline alert callouts pairing icon + text meaning with clean all-around hairline borders and dismissal.",
      code: `<div role="alert" class="p-3.5 rounded-lg border border-emerald-500/35 bg-emerald-500/10 flex items-center gap-3 text-sm">
  <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i>
  <span>Security checks passed with zero exposed secrets.</span>
</div>`,
      renderPreview: () => `
        <div class="space-y-2.5" data-lab-alerts-box>
          <div role="status" class="p-3.5 rounded-lg border border-cyan-500/35 bg-cyan-500/10 flex items-center justify-between gap-3 text-xs sm:text-sm text-[var(--text)]" data-lab-alert-item>
            <span class="flex items-center gap-2.5"><i data-lucide="info" class="w-4 h-4 text-cyan-400 shrink-0"></i><span><strong>Info:</strong> Static documentation preset loaded.</span></span>
            <button type="button" class="lab-tool-btn px-2 min-h-[30px]" data-lab-alert-close aria-label="Dismiss info alert"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
          </div>
          <div role="status" class="p-3.5 rounded-lg border border-emerald-500/35 bg-emerald-500/10 flex items-center justify-between gap-3 text-xs sm:text-sm text-[var(--text)]" data-lab-alert-item>
            <span class="flex items-center gap-2.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0"></i><span><strong>Success:</strong> Responsive layout verified at 320px and 1440px.</span></span>
            <button type="button" class="lab-tool-btn px-2 min-h-[30px]" data-lab-alert-close aria-label="Dismiss success alert"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
          </div>
          <div role="alert" class="p-3.5 rounded-lg border border-amber-500/35 bg-amber-500/10 flex items-center justify-between gap-3 text-xs sm:text-sm text-[var(--text)]" data-lab-alert-item>
            <span class="flex items-center gap-2.5"><i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400 shrink-0"></i><span><strong>Warning:</strong> Dismiss all alerts and click Reset above to restore them.</span></span>
            <button type="button" class="lab-tool-btn px-2 min-h-[30px]" data-lab-alert-close aria-label="Dismiss warning alert"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
          </div>
        </div>
      `,
      bind: (stage) => {
        const box = stage.querySelector("[data-lab-alerts-box]");
        stage.querySelectorAll("[data-lab-alert-close]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const card = btn.closest("[data-lab-alert-item]");
            if (card) card.remove();
            if (box && box.children.length === 0) {
              box.innerHTML = `<p class="text-xs font-mono-tech text-[var(--muted)]">All alerts dismissed. Click Reset on this card to restore.</p>`;
            }
          });
        });
      }
    },
    {
      id: "loaders",
      number: "12",
      title: "Loaders",
      group: "Overlays & Feedback",
      summary: "CSS circular spinner, interactive determinate progress bar, and zero-CLS content skeleton preview.",
      code: `<div class="flex items-center gap-3">
  <span class="lab-spinner" aria-hidden="true"></span>
  <div class="w-full h-2 rounded-full bg-[var(--surface)] overflow-hidden">
    <div class="h-full bg-cyan-400" style="width: 65%"></div>
  </div>
</div>`,
      renderPreview: () => `
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="lab-spinner" aria-hidden="true"></span>
              <span class="text-xs sm:text-sm font-mono-tech text-[var(--text-secondary)] tabular-nums" data-lab-load-pct>Progress: 45%</span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" class="lab-tool-btn" data-lab-load-step>+25% Step</button>
              <button type="button" class="lab-tool-btn" data-lab-load-skel aria-pressed="false">Toggle Skeleton</button>
            </div>
          </div>

          <div class="w-full h-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-200" style="width: 45%" data-lab-load-bar></div>
          </div>

          <div class="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)]" data-lab-load-content>
            <p class="text-sm font-semibold text-[var(--text)]">Loaded Module State</p>
            <p class="text-xs text-[var(--muted)] mt-1">Toggle Skeleton to inspect placeholder geometry before async hydration.</p>
          </div>
        </div>
      `,
      bind: (stage) => {
        let pct = 45;
        let skel = false;
        const pctEl = stage.querySelector("[data-lab-load-pct]");
        const barEl = stage.querySelector("[data-lab-load-bar]");
        const stepBtn = stage.querySelector("[data-lab-load-step]");
        const skelBtn = stage.querySelector("[data-lab-load-skel]");
        const box = stage.querySelector("[data-lab-load-content]");

        if (stepBtn) {
          stepBtn.addEventListener("click", () => {
            pct = pct >= 100 ? 20 : Math.min(100, pct + 25);
            if (pctEl) pctEl.textContent = `Progress: ${pct}%`;
            if (barEl) barEl.style.width = `${pct}%`;
          });
        }
        if (skelBtn && box) {
          skelBtn.addEventListener("click", () => {
            skel = !skel;
            skelBtn.setAttribute("aria-pressed", skel ? "true" : "false");
            box.innerHTML = skel
              ? `<div class="space-y-2 animate-pulse"><div class="h-4 w-1/3 rounded bg-[var(--border)]"></div><div class="h-3 w-4/5 rounded bg-[var(--border)]"></div></div>`
              : `<p class="text-sm font-semibold text-[var(--text)]">Loaded Module State</p><p class="text-xs text-[var(--muted)] mt-1">Toggle Skeleton to inspect placeholder geometry before async hydration.</p>`;
          });
        }
      }
    },
    {
      id: "sliders",
      number: "13",
      title: "Sliders",
      group: "Actions & Forms",
      summary: "Range sliders with live tabular numeric readouts controlling card radius and grid spacing dynamically.",
      code: `<input type="range" min="0" max="24" value="12" class="lab-slider" aria-label="Border radius" />`,
      renderPreview: () => `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div class="space-y-3">
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <label for="lab-sl-rad" class="font-semibold text-[var(--text-secondary)]">Border Radius</label>
                <span class="font-mono-tech tabular-nums text-cyan-400" data-lab-sl-rad-val>12px</span>
              </div>
              <input id="lab-sl-rad" type="range" min="0" max="28" value="12" class="lab-slider">
            </div>
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <label for="lab-sl-pad" class="font-semibold text-[var(--text-secondary)]">Inner Padding</label>
                <span class="font-mono-tech tabular-nums text-indigo-400" data-lab-sl-pad-val>18px</span>
              </div>
              <input id="lab-sl-pad" type="range" min="10" max="32" value="18" class="lab-slider">
            </div>
          </div>

          <div class="border border-[var(--border-strong)] bg-[var(--surface)] transition-none" style="border-radius: 12px; padding: 18px;" data-lab-sl-preview>
            <p class="text-sm font-bold text-[var(--text)]">Live Token Specimen</p>
            <p class="text-xs text-[var(--muted)] mt-1">Drag either range slider to adjust radius &amp; spacing live.</p>
          </div>
        </div>
      `,
      bind: (stage) => {
        const radIn = stage.querySelector("#lab-sl-rad");
        const padIn = stage.querySelector("#lab-sl-pad");
        const radVal = stage.querySelector("[data-lab-sl-rad-val]");
        const padVal = stage.querySelector("[data-lab-sl-pad-val]");
        const box = stage.querySelector("[data-lab-sl-preview]");
        if (radIn && box) {
          radIn.addEventListener("input", () => {
            const v = `${radIn.value}px`;
            box.style.borderRadius = v;
            if (radVal) radVal.textContent = v;
          });
        }
        if (padIn && box) {
          padIn.addEventListener("input", () => {
            const v = `${padIn.value}px`;
            box.style.padding = v;
            if (padVal) padVal.textContent = v;
          });
        }
      }
    },
    {
      id: "pricing-cards",
      number: "14",
      title: "Pricing Cards",
      group: "Data & Commerce",
      summary: "Scope-based service engagement tiers with a working billing cadence switch and plan selection state.",
      code: `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <article class="card p-5 space-y-3">
    <p class="text-xs text-cyan-400 font-semibold">For Landing &amp; MVP Builds</p>
    <h3 class="text-lg font-bold">Frontend Sprint</h3>
    <p class="text-2xl font-extrabold tabular-nums">$850</p>
    <button type="button" class="outline-button w-full">Select Scope</button>
  </article>
</div>`,
      renderPreview: () => `
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="lab-view-tabs" role="group" aria-label="Select engagement billing cadence">
              <button type="button" class="lab-view-tab is-active" data-lab-price-mode="project">Per Milestone</button>
              <button type="button" class="lab-view-tab" data-lab-price-mode="retainer">Monthly Retainer (-15%)</button>
            </div>
            <span class="text-xs font-mono-tech text-[var(--muted)]" data-lab-price-picked>Selected tier: None</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <article class="card p-5 space-y-3">
              <p class="text-xs font-semibold text-cyan-400">For Fast UI Sprints</p>
              <h3 class="text-base font-bold text-[var(--text)]">Frontend Architecture</h3>
              <p class="text-2xl font-extrabold text-[var(--text)] tabular-nums" data-lab-price-val="frontend">$850</p>
              <ul class="text-xs text-[var(--text-secondary)] space-y-1.5 pt-1 border-t border-[var(--border)]">
                <li>Up to 5 responsive views (320px–2560px)</li>
                <li>Accessible theme tokens &amp; keyboard nav</li>
              </ul>
              <button type="button" class="outline-button w-full text-xs min-h-[38px]" data-lab-price-select="Frontend Architecture">Choose Tier</button>
            </article>

            <article class="card p-5 space-y-3 border-[var(--border-strong)]">
              <p class="text-xs font-semibold text-indigo-400">For Full-Stack SaaS Products</p>
              <h3 class="text-base font-bold text-[var(--text)]">MERN / API System</h3>
              <p class="text-2xl font-extrabold text-[var(--text)] tabular-nums" data-lab-price-val="fullstack">$1,850</p>
              <ul class="text-xs text-[var(--text-secondary)] space-y-1.5 pt-1 border-t border-[var(--border)]">
                <li>React/Next UI + Express REST &amp; Auth</li>
                <li>Database schema + Admin Dashboard</li>
              </ul>
              <button type="button" class="primary-button w-full text-xs min-h-[38px]" data-lab-price-select="MERN / API System">Choose Tier</button>
            </article>
          </div>
        </div>
      `,
      bind: (stage) => {
        const rates = {
          project: { frontend: "$850", fullstack: "$1,850" },
          retainer: { frontend: "$720/mo", fullstack: "$1,570/mo" }
        };
        const modeBtns = stage.querySelectorAll("[data-lab-price-mode]");
        const feVal = stage.querySelector('[data-lab-price-val="frontend"]');
        const fsVal = stage.querySelector('[data-lab-price-val="fullstack"]');
        const pickedEl = stage.querySelector("[data-lab-price-picked]");

        modeBtns.forEach((btn) => {
          btn.addEventListener("click", () => {
            const m = btn.getAttribute("data-lab-price-mode") || "project";
            modeBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
            if (feVal) feVal.textContent = rates[m].frontend;
            if (fsVal) fsVal.textContent = rates[m].fullstack;
          });
        });
        stage.querySelectorAll("[data-lab-price-select]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const name = btn.getAttribute("data-lab-price-select");
            if (pickedEl) pickedEl.textContent = `Selected tier: ${name} (Illustrative scope)`;
          });
        });
      }
    },
    {
      id: "dashboard-cards",
      number: "15",
      title: "Dashboard Cards",
      group: "Data & Commerce",
      summary: "Compact KPI metric cards with tabular numerals and interactive time-window filtering.",
      code: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
  <div class="card p-4 space-y-1">
    <p class="text-xs text-[var(--muted)]">Handled Endpoints</p>
    <p class="text-2xl font-extrabold tabular-nums">18</p>
  </div>
</div>`,
      renderPreview: () => `
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-semibold text-[var(--text-secondary)]">Telemetry Sample Window</span>
            <div class="lab-view-tabs" role="group" aria-label="Select sample time range">
              <button type="button" class="lab-view-tab" data-lab-dash-win="7d">7d</button>
              <button type="button" class="lab-view-tab is-active" data-lab-dash-win="30d">30d</button>
              <button type="button" class="lab-view-tab" data-lab-dash-win="90d">90d</button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="card p-4 space-y-1.5">
              <p class="text-xs text-[var(--muted)]">Sample Deployments</p>
              <p class="text-2xl font-extrabold text-[var(--text)] tabular-nums font-mono-tech" data-lab-kpi="deploys">14</p>
              <p class="text-[11px] text-emerald-400">0 rollbacks</p>
            </div>
            <div class="card p-4 space-y-1.5">
              <p class="text-xs text-[var(--muted)]">API Endpoints Spec'd</p>
              <p class="text-2xl font-extrabold text-[var(--text)] tabular-nums font-mono-tech" data-lab-kpi="routes">24</p>
              <p class="text-[11px] text-cyan-400">REST JSON contracts</p>
            </div>
            <div class="card p-4 space-y-1.5">
              <p class="text-xs text-[var(--muted)]">UI Lab Components</p>
              <p class="text-2xl font-extrabold text-[var(--text)] tabular-nums font-mono-tech" data-lab-kpi="widgets">16</p>
              <p class="text-[11px] text-indigo-400">320px–2560px verified</p>
            </div>
          </div>
        </div>
      `,
      bind: (stage) => {
        const snapshots = {
          "7d": { deploys: "4", routes: "8", widgets: "16" },
          "30d": { deploys: "14", routes: "24", widgets: "16" },
          "90d": { deploys: "39", routes: "62", widgets: "16" }
        };
        const btns = stage.querySelectorAll("[data-lab-dash-win]");
        const deploys = stage.querySelector('[data-lab-kpi="deploys"]');
        const routes = stage.querySelector('[data-lab-kpi="routes"]');
        const widgets = stage.querySelector('[data-lab-kpi="widgets"]');
        btns.forEach((b) => {
          b.addEventListener("click", () => {
            const w = b.getAttribute("data-lab-dash-win") || "30d";
            btns.forEach((other) => other.classList.toggle("is-active", other === b));
            const s = snapshots[w] || snapshots["30d"];
            if (deploys) deploys.textContent = s.deploys;
            if (routes) routes.textContent = s.routes;
            if (widgets) widgets.textContent = s.widgets;
          });
        });
      }
    },
    {
      id: "navigation",
      number: "16",
      title: "Navigation",
      group: "Layout & Nav",
      summary: "Breadcrumb trail, interactive numbered pagination controls, and multi-step workflow stepper.",
      code: `<nav aria-label="Pagination" class="flex items-center gap-1.5">
  <button type="button" class="lab-tool-btn">Prev</button>
  <button type="button" class="lab-filter-btn is-active">1</button>
  <button type="button" class="lab-filter-btn">2</button>
  <button type="button" class="lab-tool-btn">Next</button>
</nav>`,
      renderPreview: () => `
        <div class="space-y-4">
          <nav aria-label="Sample breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted)]">
            <span>Workspace</span>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            <span>Projects</span>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            <span class="font-semibold text-[var(--text)]" data-lab-bc-leaf>Page 1</span>
          </nav>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
            <nav aria-label="Sample pagination" class="flex items-center gap-1.5">
              <button type="button" class="lab-tool-btn" data-lab-pg-dir="-1">Prev</button>
              <button type="button" class="lab-filter-btn is-active tabular-nums" data-lab-pg-num="1">1</button>
              <button type="button" class="lab-filter-btn tabular-nums" data-lab-pg-num="2">2</button>
              <button type="button" class="lab-filter-btn tabular-nums" data-lab-pg-num="3">3</button>
              <button type="button" class="lab-tool-btn" data-lab-pg-dir="1">Next</button>
            </nav>

            <div class="flex items-center gap-2 text-xs font-mono-tech">
              <span class="text-[var(--muted)]" data-lab-step-label>Step 1 / 3: Discovery</span>
              <button type="button" class="lab-tool-btn" data-lab-step-next>Next Step</button>
            </div>
          </div>
        </div>
      `,
      bind: (stage) => {
        let page = 1;
        let step = 1;
        const stepNames = ["", "Discovery", "Architecture", "Delivery"];
        const bcLeaf = stage.querySelector("[data-lab-bc-leaf]");
        const numBtns = stage.querySelectorAll("[data-lab-pg-num]");
        const stepLabel = stage.querySelector("[data-lab-step-label]");
        const stepBtn = stage.querySelector("[data-lab-step-next]");

        function syncPage() {
          numBtns.forEach((b) => b.classList.toggle("is-active", Number(b.getAttribute("data-lab-pg-num")) === page));
          if (bcLeaf) bcLeaf.textContent = `Page ${page}`;
        }

        numBtns.forEach((b) => {
          b.addEventListener("click", () => {
            page = Number(b.getAttribute("data-lab-pg-num")) || 1;
            syncPage();
          });
        });
        stage.querySelectorAll("[data-lab-pg-dir]").forEach((b) => {
          b.addEventListener("click", () => {
            const delta = Number(b.getAttribute("data-lab-pg-dir")) || 0;
            page = Math.max(1, Math.min(3, page + delta));
            syncPage();
          });
        });
        if (stepBtn && stepLabel) {
          stepBtn.addEventListener("click", () => {
            step = step >= 3 ? 1 : step + 1;
            stepLabel.textContent = `Step ${step} / 3: ${stepNames[step]}`;
          });
        }
      }
    }
  ];

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

  function toast(msg, tone) {
    if (typeof window.showToast === "function") {
      window.showToast(msg, tone || "success");
    }
  }

  async function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        // fallback below
      }
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  function init() {
    const root = document.getElementById("component-lab-root");
    if (!root) return;

    const components = DEFAULT_COMPONENTS;
    const state = {
      group: "All",
      query: "",
      activeView: {}, // { [id]: "preview" | "code" }
      activeCategoryId: components[0].id
    };
    const cleanups = new Map();

    const searchInput = document.getElementById("lab-search-input");
    const searchClear = document.getElementById("lab-search-clear");
    const groupTabsEl = document.getElementById("lab-group-tabs");
    const quickJumpSelect = document.getElementById("lab-mobile-jump");
    const resetAllBtn = document.getElementById("lab-reset-all");
    const countLabelEl = document.getElementById("lab-count-label");
    const indexRailEl = document.getElementById("lab-index-rail");
    const cardsGridEl = document.getElementById("lab-cards-list");

    function getFiltered() {
      const q = state.query.trim().toLowerCase();
      return components.filter((c) => {
        if (state.group !== "All" && c.group !== state.group) return false;
        if (!q) return true;
        return `${c.number} ${c.title} ${c.group} ${c.summary}`.toLowerCase().includes(q);
      });
    }

    function runCleanup(id) {
      const fn = cleanups.get(id);
      if (typeof fn === "function") {
        fn();
        cleanups.delete(id);
      }
    }

    function clearAllCleanups() {
      cleanups.forEach((fn) => {
        if (typeof fn === "function") fn();
      });
      cleanups.clear();
    }

    function mountComponentPreview(comp, cardEl) {
      const stage = cardEl.querySelector("[data-lab-preview-stage]");
      if (!stage) return;
      runCleanup(comp.id);
      stage.innerHTML = comp.renderPreview();
      if (typeof comp.bind === "function") {
        const cleanupFn = comp.bind(stage);
        if (typeof cleanupFn === "function") {
          cleanups.set(comp.id, cleanupFn);
        }
      }
      refreshIcons();
    }

    function renderGroupTabs() {
      if (!groupTabsEl) return;
      groupTabsEl.innerHTML = GROUPS.map((g) => {
        const cnt = g === "All" ? components.length : components.filter((c) => c.group === g).length;
        const active = state.group === g;
        return `
          <button
            type="button"
            class="lab-filter-btn ${active ? "is-active" : ""}"
            data-lab-group="${escHtml(g)}"
            aria-pressed="${active ? "true" : "false"}"
          >
            <span>${escHtml(g)}</span>
            <span class="text-[var(--muted)] tabular-nums">(${cnt})</span>
          </button>
        `;
      }).join("");

      groupTabsEl.querySelectorAll("[data-lab-group]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.group = btn.getAttribute("data-lab-group") || "All";
          render();
        });
      });
    }

    function renderMobileJump(filtered) {
      if (!quickJumpSelect) return;
      quickJumpSelect.innerHTML = [
        `<option value="">Jump to category (${filtered.length})</option>`,
        ...filtered.map((c) => `<option value="${escHtml(c.id)}">${escHtml(c.number)}. ${escHtml(c.title)}</option>`)
      ].join("");
    }

    function renderIndexRail(filtered) {
      if (!indexRailEl) return;
      if (filtered.length === 0) {
        indexRailEl.innerHTML = `<p class="text-xs text-[var(--muted)] p-2">No matching components.</p>`;
        return;
      }

      indexRailEl.innerHTML = `
        <p class="px-2 py-1 text-xs font-semibold text-[var(--muted)]">Categories (${filtered.length})</p>
        ${filtered
          .map((c) => {
            const isActive = state.activeCategoryId === c.id;
            return `
              <button
                type="button"
                class="lab-index-link ${isActive ? "is-active" : ""}"
                data-lab-jump="${escHtml(c.id)}"
              >
                <span class="truncate">${escHtml(c.number)}. ${escHtml(c.title)}</span>
                <span class="text-[11px] text-[var(--muted)] shrink-0">${escHtml(c.group.split(" ")[0])}</span>
              </button>
            `;
          })
          .join("")}
      `;

      indexRailEl.querySelectorAll("[data-lab-jump]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-lab-jump");
          if (!id) return;
          state.activeCategoryId = id;
          renderIndexRail(filtered);
          const card = document.getElementById(`lab-comp-${id}`);
          if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      });
    }

    function renderCards(filtered) {
      if (!cardsGridEl) return;
      clearAllCleanups();

      if (countLabelEl) {
        countLabelEl.textContent = `${filtered.length} of ${components.length} components`;
      }

      if (filtered.length === 0) {
        cardsGridEl.innerHTML = `
          <div class="lab-card p-8 text-center space-y-3">
            <p class="text-base font-bold text-[var(--text)]">No matching UI components</p>
            <p class="text-sm text-[var(--muted)]">Clear your search filter or switch back to All categories.</p>
            <button type="button" id="lab-empty-reset" class="outline-button text-xs min-h-[40px]">Reset Filter</button>
          </div>
        `;
        const emptyBtn = document.getElementById("lab-empty-reset");
        if (emptyBtn) emptyBtn.addEventListener("click", resetFilters);
        return;
      }

      cardsGridEl.innerHTML = filtered
        .map((comp) => {
          const mode = state.activeView[comp.id] || "preview";
          return `
            <article id="lab-comp-${escHtml(comp.id)}" class="lab-card">
              <div class="lab-card-head">
                <div class="space-y-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                    <span class="font-mono-tech font-bold text-cyan-400 tabular-nums">${escHtml(comp.number)}</span>
                    <span aria-hidden="true">·</span>
                    <span>${escHtml(comp.group)}</span>
                  </div>
                  <h2 class="text-lg font-bold text-[var(--text)]">${escHtml(comp.title)}</h2>
                  <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escHtml(comp.summary)}</p>
                </div>

                <div class="lab-actions-row shrink-0">
                  <div class="lab-view-tabs" role="tablist" aria-label="${escHtml(comp.title)} view switcher">
                    <button
                      type="button"
                      role="tab"
                      class="lab-view-tab ${mode === "preview" ? "is-active" : ""}"
                      aria-selected="${mode === "preview" ? "true" : "false"}"
                      data-lab-mode="${escHtml(comp.id)}:preview"
                    >
                      <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      class="lab-view-tab ${mode === "code" ? "is-active" : ""}"
                      aria-selected="${mode === "code" ? "true" : "false"}"
                      data-lab-mode="${escHtml(comp.id)}:code"
                    >
                      <i data-lucide="code-2" class="w-3.5 h-3.5"></i>
                      <span>Code</span>
                    </button>
                  </div>

                  <button type="button" class="lab-tool-btn" data-lab-copy="${escHtml(comp.id)}" aria-label="Copy ${escHtml(comp.title)} snippet">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                    <span>Copy</span>
                  </button>

                  <button type="button" class="lab-tool-btn" data-lab-reset="${escHtml(comp.id)}" aria-label="Reset ${escHtml(comp.title)} preview state">
                    <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div class="lab-preview-stage" data-lab-preview-stage ${mode === "preview" ? "" : "hidden"}></div>

              <div class="lab-code-stage" data-lab-code-stage ${mode === "code" ? "" : "hidden"}>
                <pre class="lab-code-pre"><code>${escHtml(comp.code)}</code></pre>
              </div>
            </article>
          `;
        })
        .join("");

      filtered.forEach((comp) => {
        const cardEl = document.getElementById(`lab-comp-${comp.id}`);
        if (!cardEl) return;

        mountComponentPreview(comp, cardEl);

        cardEl.querySelectorAll("[data-lab-mode]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const raw = btn.getAttribute("data-lab-mode") || "";
            const [, nextMode] = raw.split(":");
            if (!nextMode) return;
            state.activeView[comp.id] = nextMode;
            state.activeCategoryId = comp.id;

            const prevEl = cardEl.querySelector("[data-lab-preview-stage]");
            const codeEl = cardEl.querySelector("[data-lab-code-stage]");
            if (prevEl) prevEl.hidden = nextMode !== "preview";
            if (codeEl) codeEl.hidden = nextMode !== "code";

            cardEl.querySelectorAll("[data-lab-mode]").forEach((tb) => {
              const active = tb.getAttribute("data-lab-mode") === `${comp.id}:${nextMode}`;
              tb.classList.toggle("is-active", active);
              tb.setAttribute("aria-selected", active ? "true" : "false");
            });
          });
        });

        const copyBtn = cardEl.querySelector(`[data-lab-copy="${comp.id}"]`);
        if (copyBtn) {
          copyBtn.addEventListener("click", async () => {
            const ok = await copyText(comp.code);
            if (ok) {
              copyBtn.classList.add("is-copied");
              copyBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i><span>Copied</span>`;
              refreshIcons();
              toast(`${comp.title} code copied.`, "success");
              setTimeout(() => {
                if (!copyBtn.isConnected) return;
                copyBtn.classList.remove("is-copied");
                copyBtn.innerHTML = `<i data-lucide="copy" class="w-3.5 h-3.5"></i><span>Copy</span>`;
                refreshIcons();
              }, 1600);
            }
          });
        }

        const resetBtn = cardEl.querySelector(`[data-lab-reset="${comp.id}"]`);
        if (resetBtn) {
          resetBtn.addEventListener("click", () => {
            mountComponentPreview(comp, cardEl);
            toast(`${comp.title} preview reset.`, "info");
          });
        }
      });

      refreshIcons();
    }

    function resetFilters() {
      state.group = "All";
      state.query = "";
      state.activeView = {};
      if (searchInput) searchInput.value = "";
      if (searchClear) searchClear.classList.add("hidden");
      render();
    }

    function render() {
      renderGroupTabs();
      const filtered = getFiltered();
      renderMobileJump(filtered);
      renderIndexRail(filtered);
      renderCards(filtered);
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.query = searchInput.value || "";
        if (searchClear) {
          searchClear.classList.toggle("hidden", state.query.length === 0);
        }
        render();
      });
    }

    if (searchClear && searchInput) {
      searchClear.addEventListener("click", () => {
        searchInput.value = "";
        state.query = "";
        searchClear.classList.add("hidden");
        searchInput.focus();
        render();
      });
    }

    if (quickJumpSelect) {
      quickJumpSelect.addEventListener("change", () => {
        const id = quickJumpSelect.value;
        if (!id) return;
        state.activeCategoryId = id;
        const card = document.getElementById(`lab-comp-${id}`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }

    if (resetAllBtn) {
      resetAllBtn.addEventListener("click", () => {
        resetFilters();
        toast("All components and filters reset.", "info");
      });
    }

    render();
  }

  window.PortfolioComponentLab = {
    init,
    GROUPS,
    DEFAULT_COMPONENTS
  };
})();
