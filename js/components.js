/**
 * AL AMIN Portfolio — Global Reusable Components (Phase 2)
 * Exposes: loadNavbar, loadFooter, initTheme, initMobileMenu, initLoader,
 * initScrollProgress, initBackToTop, initPageTransitions, showToast
 */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCurrentPageName() {
  const cleanPath = window.location.pathname.replace(/\/+$/, "");
  const segment = cleanPath.split("/").pop();
  if (!segment) {
    return "index.html";
  }
  return segment.includes(".") ? segment : `${segment}.html`;
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function trapDialogFocus(container, event) {
  if (!container || event.key !== "Tab") return;
  const focusables = Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);

  if (focusables.length === 0) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/* ==========================================================================
   1. Floating Sticky Navbar
   ========================================================================== */

function loadNavbar() {
  const headerMount = document.getElementById("site-header");
  if (!headerMount) return;

  const config = window.portfolioConfig || { name: "AL AMIN" };
  const routes = window.siteRoutes || {};
  const rawNavItems = routes.navLinks || routes.primaryNav || [];
  const navItems =
    window.PortfolioModes && typeof window.PortfolioModes.getPrioritizedNavLinks === "function"
      ? window.PortfolioModes.getPrioritizedNavLinks(rawNavItems)
      : rawNavItems;
  const headerCta =
    window.PortfolioModes && typeof window.PortfolioModes.getHeaderPrimaryAction === "function"
      ? window.PortfolioModes.getHeaderPrimaryAction()
      : { label: "Resume", href: "resume.html", icon: "file-text" };
  const currentPage = getCurrentPageName();

  const desktopLinksMarkup = navItems
    .map((item) => {
      const isActive = currentPage === item.href;
      const ariaCurrent = isActive ? ' aria-current="page"' : "";
      const priorityAttr = item.isPriority ? ' data-mode-priority="true"' : "";
      return `<a href="${escapeHtml(item.href)}" class="nav-link ${isActive ? "is-active" : ""}"${priorityAttr}${ariaCurrent}>${escapeHtml(item.label)}</a>`;
    })
    .join("");

  const brand =
    window.PortfolioBrand && typeof window.PortfolioBrand.getBrand === "function"
      ? window.PortfolioBrand.getBrand()
      : {
          displayName: config.name || "AL AMIN",
          logo: { ariaLabel: `${config.name || "AL AMIN"} Home` }
        };
  const brandMarkup =
    window.PortfolioBrand && typeof window.PortfolioBrand.getLogoMarkup === "function"
      ? window.PortfolioBrand.getLogoMarkup({ size: "sm" })
      : `<span class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/35 bg-indigo-500/12 text-sm font-extrabold text-indigo-400">A</span><span>${escapeHtml(brand.displayName)}</span>`;

  headerMount.className = "site-header";
  headerMount.innerHTML = `
    <div class="container">
      <div class="site-header-shell">
        <a href="index.html" class="brand-mark" aria-label="${escapeHtml(brand.logo.ariaLabel || `${brand.displayName} Home`)}">
          ${brandMarkup}
        </a>

        <nav class="desktop-nav-list" aria-label="Primary navigation">
          ${desktopLinksMarkup}
        </nav>

        <div class="flex items-center gap-2 shrink-0">
          <a href="${escapeHtml(headerCta.href)}" class="primary-button nav-resume-btn hidden sm:inline-flex">
            <i data-lucide="${escapeHtml(headerCta.icon)}" class="w-4 h-4"></i>
            <span>${escapeHtml(headerCta.label)}</span>
          </a>

          <button
            type="button"
            data-theme-toggle
            class="icon-button"
            aria-label="Toggle color theme"
          >
            <i data-lucide="sun" data-theme-icon="sun" class="w-4 h-4"></i>
            <i data-lucide="moon" data-theme-icon="moon" class="w-4 h-4 hidden"></i>
          </button>

          <button
            type="button"
            id="mobile-menu-toggle"
            class="icon-button lg:hidden"
            aria-label="Open navigation menu"
            aria-expanded="false"
            aria-controls="mobile-fullscreen-menu"
          >
            <span class="hamburger-box" aria-hidden="true">
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </span>
          </button>
        </div>
      </div>
    </div>
  `;

  if (!loadNavbar.scrollBound) {
    loadNavbar.scrollBound = true;
    const syncScrollState = () => {
      const header = document.getElementById("site-header");
      if (header) {
        header.classList.toggle("is-scrolled", window.scrollY > 18);
      }
    };
    window.addEventListener("scroll", syncScrollState, { passive: true });
    syncScrollState();
  }

  refreshIcons();
}

/* ==========================================================================
   2. Full-Screen Mobile Navigation
   ========================================================================== */

function initMobileMenu() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  if (!toggleBtn) return;

  let overlay = document.getElementById("mobile-fullscreen-menu");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "mobile-fullscreen-menu";
    overlay.className = "mobile-fullscreen-menu lg:hidden";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Mobile navigation menu");
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
  }

  const config = window.portfolioConfig || { name: "AL AMIN" };
  const routes = window.siteRoutes || {};
  const rawNavItems = routes.navLinks || [];
  const navItems =
    window.PortfolioModes && typeof window.PortfolioModes.getPrioritizedNavLinks === "function"
      ? window.PortfolioModes.getPrioritizedNavLinks(rawNavItems)
      : rawNavItems;
  const activeMode =
    window.PortfolioModes && typeof window.PortfolioModes.getMode === "function"
      ? window.PortfolioModes.getMode()
      : "default";
  const currentPage = getCurrentPageName();

  const linksMarkup = navItems
    .map((item, idx) => {
      const isActive = currentPage === item.href;
      const ariaCurrent = isActive ? ' aria-current="page"' : "";
      const priorityAttr = item.isPriority ? ' data-mode-priority="true"' : "";
      const delay = idx * 35;
      return `
        <a
          href="${escapeHtml(item.href)}"
          class="mobile-menu-link ${isActive ? "is-active" : ""}"
          style="--stagger-delay: ${delay}ms;"
          ${priorityAttr}
          ${ariaCurrent}
        >
          <span>${escapeHtml(item.label)}</span>
          <i data-lucide="arrow-up-right" class="w-4 h-4 opacity-60 shrink-0"></i>
        </a>
      `;
    })
    .join("");

  const mobileBrandMarkup =
    window.PortfolioBrand && typeof window.PortfolioBrand.getLogoMarkup === "function"
      ? window.PortfolioBrand.getLogoMarkup({ size: "sm" })
      : `<span class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/35 bg-indigo-500/12 text-sm font-extrabold text-indigo-400">A</span><span>${escapeHtml(config.name || "AL AMIN")}</span>`;

  overlay.innerHTML = `
    <div class="container flex flex-col justify-between min-h-full py-4 sm:py-6 gap-6">
      <div class="flex items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
        <a href="index.html" class="brand-mark" aria-label="${escapeHtml(config.name || "AL AMIN")} Home">
          ${mobileBrandMarkup}
        </a>
        <div class="flex items-center gap-2">
          <button
            type="button"
            data-theme-toggle
            class="icon-button"
            aria-label="Toggle color theme"
          >
            <i data-lucide="sun" data-theme-icon="sun" class="w-4 h-4"></i>
            <i data-lucide="moon" data-theme-icon="moon" class="w-4 h-4 hidden"></i>
          </button>
          <button
            type="button"
            id="mobile-menu-close"
            class="icon-button"
            aria-label="Close navigation menu"
          >
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
      </div>

      <nav class="grid grid-cols-1 sm:grid-cols-2 gap-2 my-auto" aria-label="Full screen mobile navigation">
        ${linksMarkup}
      </nav>

      <div class="pt-4 border-t border-[var(--border)] space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-semibold text-[var(--muted)]">Visitor Experience</span>
          <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Mobile visitor experience mode">
            <button type="button" class="visitor-mode-switch-btn ${activeMode === "client" ? "is-active" : ""}" data-set-visitor-mode="client" aria-pressed="${activeMode === "client" ? "true" : "false"}">Client</button>
            <button type="button" class="visitor-mode-switch-btn ${activeMode === "recruiter" ? "is-active" : ""}" data-set-visitor-mode="recruiter" aria-pressed="${activeMode === "recruiter" ? "true" : "false"}">Recruiter</button>
            <button type="button" class="visitor-mode-switch-btn ${activeMode === "default" ? "is-active" : ""}" data-set-visitor-mode="default" aria-pressed="${activeMode === "default" ? "true" : "false"}">Default</button>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button type="button" class="visitor-mode-switch-btn flex-1 justify-center" data-open-command-palette>
            <i data-lucide="search" class="w-3.5 h-3.5" aria-hidden="true"></i>
            <span>Command Search (⌘K)</span>
          </button>
          <button type="button" class="visitor-mode-switch-btn flex-1 justify-center" data-open-ux-prefs>
            <i data-lucide="accessibility" class="w-3.5 h-3.5" aria-hidden="true"></i>
            <span>A11y &amp; Perf</span>
          </button>
          <button type="button" class="visitor-mode-switch-btn hidden" data-pwa-install-btn>
            <i data-lucide="download" class="w-3.5 h-3.5" aria-hidden="true"></i>
            <span>Install App</span>
          </button>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <a href="resume.html" class="primary-button justify-center">
            <i data-lucide="file-text" class="w-4 h-4"></i>
            <span>View Resume</span>
          </a>
          <a href="contact.html" class="secondary-button justify-center">
            <i data-lucide="mail" class="w-4 h-4"></i>
            <span>Get in Touch</span>
          </a>
        </div>
      </div>
    </div>
  `;

  const closeBtn = document.getElementById("mobile-menu-close");

  function setMenuOpen(open) {
    overlay.classList.toggle("is-open", open);
    overlay.setAttribute("aria-hidden", String(!open));
    toggleBtn.setAttribute("aria-expanded", String(open));
    toggleBtn.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    document.body.classList.toggle("menu-open", open);

    if (open && closeBtn) {
      window.setTimeout(() => closeBtn.focus(), 60);
    }
  }

  if (toggleBtn.dataset.menuBound !== "true") {
    toggleBtn.dataset.menuBound = "true";
    toggleBtn.addEventListener("click", () => {
      const isOpen = overlay.classList.contains("is-open");
      setMenuOpen(!isOpen);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      setMenuOpen(false);
      toggleBtn.focus();
    });
  }

  overlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuOpen(false);
    });
  });

  overlay.querySelectorAll("[data-open-command-palette], [data-open-ux-prefs]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setMenuOpen(false);
    });
  });

  if (window.PortfolioUX && typeof window.PortfolioUX.bindGlobalActionTriggers === "function") {
    window.PortfolioUX.bindGlobalActionTriggers(overlay);
  }

  if (!initMobileMenu.globalBound) {
    initMobileMenu.globalBound = true;

    document.addEventListener("keydown", (event) => {
      const activeOverlay = document.getElementById("mobile-fullscreen-menu");
      const activeToggle = document.getElementById("mobile-menu-toggle");
      if (!activeOverlay || !activeOverlay.classList.contains("is-open")) return;

      if (event.key === "Escape") {
        activeOverlay.classList.remove("is-open");
        activeOverlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("menu-open");
        if (activeToggle) {
          activeToggle.setAttribute("aria-expanded", "false");
          activeToggle.setAttribute("aria-label", "Open navigation menu");
          activeToggle.focus();
        }
      } else if (event.key === "Tab") {
        trapDialogFocus(activeOverlay, event);
      }
    });

    window.addEventListener("resize", () => {
      const activeOverlay = document.getElementById("mobile-fullscreen-menu");
      const activeToggle = document.getElementById("mobile-menu-toggle");
      if (window.innerWidth >= 1024 && activeOverlay && activeOverlay.classList.contains("is-open")) {
        activeOverlay.classList.remove("is-open");
        activeOverlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("menu-open");
        if (activeToggle) {
          activeToggle.setAttribute("aria-expanded", "false");
          activeToggle.setAttribute("aria-label", "Open navigation menu");
        }
      }
    });
  }

  if (window.PortfolioTheme) {
    window.PortfolioTheme.bindToggleHandlers();
  }
  refreshIcons();
}

/* ==========================================================================
   3. Responsive Multi-Column Footer
   ========================================================================== */

function loadFooter() {
  const footerMount = document.getElementById("site-footer");
  if (!footerMount) return;

  const config = window.portfolioConfig || {};
  const routes = window.siteRoutes || {};
  const navLinks = routes.navLinks || [];
  const servicesList = routes.servicesList || [];
  const socialChannels = routes.socialChannels || [];
  const year = new Date().getFullYear();

  const navMarkup = navLinks
    .map((item) => `<li><a href="${escapeHtml(item.href)}" class="footer-link">${escapeHtml(item.label)}</a></li>`)
    .join("");

  const servicesMarkup = servicesList
    .map((item) => `<li><a href="${escapeHtml(item.href)}" class="footer-link">${escapeHtml(item.label)}</a></li>`)
    .join("");

  const socialMarkup = socialChannels
    .map((channel) => {
      if (channel.key === "email") {
        const emailAddress = config.email || "your-email@example.com";
        return `
          <a href="mailto:${escapeHtml(emailAddress)}" class="social-chip-link" aria-label="Email ${escapeHtml(config.name || "AL AMIN")}">
            <i data-lucide="${escapeHtml(channel.icon)}" class="w-4 h-4 text-indigo-400"></i>
            <span>${escapeHtml(channel.label)}</span>
          </a>
        `;
      }

      const rawUrl = config.socialLinks ? config.socialLinks[channel.key] : "";
      if (rawUrl && String(rawUrl).trim() !== "") {
        return `
          <a
            href="${escapeHtml(rawUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="social-chip-link"
            aria-label="${escapeHtml(channel.label)} profile"
          >
            <i data-lucide="${escapeHtml(channel.icon)}" class="w-4 h-4 text-indigo-400"></i>
            <span>${escapeHtml(channel.label)}</span>
          </a>
        `;
      }

      return `
        <button
          type="button"
          class="social-chip-link"
          data-social-placeholder="${escapeHtml(channel.label)}"
          aria-label="${escapeHtml(channel.label)} profile link"
        >
          <i data-lucide="${escapeHtml(channel.icon)}" class="w-4 h-4 text-indigo-400"></i>
          <span>${escapeHtml(channel.label)}</span>
        </button>
      `;
    })
    .join("");

  const statusMeta =
    window.PortfolioUX && typeof window.PortfolioUX.getWebsiteStatusMeta === "function"
      ? window.PortfolioUX.getWebsiteStatusMeta()
      : {
          label: (config.websiteStatusOptions && config.websiteStatusOptions[config.websiteStatus] && config.websiteStatusOptions[config.websiteStatus].label) || "Open to Freelance",
          tone: (config.websiteStatusOptions && config.websiteStatusOptions[config.websiteStatus] && config.websiteStatusOptions[config.websiteStatus].tone) || "cyan"
        };

  const footerBrand =
    window.PortfolioBrand && typeof window.PortfolioBrand.getBrand === "function"
      ? window.PortfolioBrand.getBrand()
      : {
          displayName: config.name || "AL AMIN",
          professionalTitle: config.role || "",
          description: config.bio || "",
          location: config.location || "Bangladesh",
          email: config.email || "",
          currentFocus: "Full-Stack MERN & Design Systems"
        };
  const footerBrandMarkup =
    window.PortfolioBrand && typeof window.PortfolioBrand.getLogoMarkup === "function"
      ? window.PortfolioBrand.getLogoMarkup({ size: "md", showSubtitle: true })
      : `<span class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/35 bg-indigo-500/12 text-sm font-extrabold text-indigo-400">A</span><span>${escapeHtml(footerBrand.displayName)}</span>`;

  footerMount.className = "site-footer";
  footerMount.innerHTML = `
    <div class="container">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-[var(--border)]">
        <div class="lg:col-span-4 space-y-4">
          <a href="index.html" class="brand-mark" aria-label="${escapeHtml(footerBrand.displayName)} Home">
            ${footerBrandMarkup}
          </a>
          <div>
            <span class="website-status-pill" data-status-tone="${escapeHtml(statusMeta.tone)}">
              <span class="website-status-dot" aria-hidden="true"></span>
              <span>${escapeHtml(statusMeta.label)}</span>
            </span>
          </div>
          <p class="text-sm font-medium text-[var(--text-secondary)]">${escapeHtml(footerBrand.professionalTitle || config.role || "")}</p>
          <p class="text-sm text-[var(--muted)] max-w-sm">${escapeHtml(footerBrand.description || config.bio || "")}</p>
          <p class="text-xs text-[var(--muted)]">${escapeHtml(footerBrand.location || config.location || "Bangladesh")} · <span class="font-mono-tech text-indigo-400">${escapeHtml(footerBrand.email || config.email || "")}</span></p>
          <div class="pt-1" data-brand-signature="footer"></div>
        </div>

        <div class="lg:col-span-3 space-y-3">
          <h2 class="text-sm font-semibold text-[var(--text)]">Navigation</h2>
          <ul class="grid grid-cols-2 gap-x-4 gap-y-1.5 list-none p-0 m-0">
            ${navMarkup}
          </ul>
        </div>

        <div class="lg:col-span-2 space-y-3">
          <h2 class="text-sm font-semibold text-[var(--text)]">Services</h2>
          <ul class="space-y-1.5 list-none p-0 m-0">
            ${servicesMarkup}
          </ul>
        </div>

        <div class="lg:col-span-3 space-y-3">
          <h2 class="text-sm font-semibold text-[var(--text)]">Connect</h2>
          <div class="flex flex-wrap gap-2">
            ${socialMarkup}
          </div>
        </div>
      </div>

      <div class="pt-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs text-[var(--muted)]">
        <p>&copy; <span class="tabular-nums">${year}</span> ${escapeHtml(config.name || "AL AMIN")}. All rights reserved.</p>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button type="button" data-open-command-palette class="hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 cursor-pointer text-xs text-cyan-400 font-semibold">Command Palette (⌘K)</button>
          <button type="button" data-open-ux-prefs class="hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 cursor-pointer text-xs text-[var(--text-secondary)] font-semibold">Accessibility &amp; Perf</button>
          <button type="button" data-open-mode-selector class="hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 cursor-pointer text-xs text-[var(--text-secondary)] font-semibold">Visitor Modes</button>
          <button type="button" data-share-portfolio class="hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 cursor-pointer text-xs">Share Portfolio</button>
          <button type="button" data-copy-portfolio-url class="hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 cursor-pointer text-xs">Copy URL</button>
          <button type="button" data-copy-email class="hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 cursor-pointer text-xs">Copy Email</button>
          <button type="button" data-pwa-install-btn class="hidden hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 cursor-pointer text-xs text-indigo-400 font-semibold">Install App</button>
          <a href="explorer.html" class="hover:text-[var(--text)] transition-colors">Explorer</a>
          <a href="project-architect.html" class="hover:text-[var(--text)] transition-colors">Architect</a>
          <a href="project-estimator.html" class="hover:text-[var(--text)] transition-colors">Estimator</a>
          <a href="project-request.html" class="hover:text-[var(--text)] transition-colors">Request Brief</a>
          <a href="build.html" class="hover:text-[var(--text)] transition-colors">Build Log</a>
          <a href="decisions.html" class="hover:text-[var(--text)] transition-colors">Decisions</a>
          <a href="security.html" class="hover:text-[var(--text)] transition-colors">Security</a>
          <a href="performance.html" class="hover:text-[var(--text)] transition-colors">Performance</a>
          <a href="architecture.html" class="hover:text-[var(--text)] transition-colors">Architecture</a>
          <a href="api-explorer.html" class="hover:text-[var(--text)] transition-colors">API Explorer</a>
          <a href="components.html" class="hover:text-[var(--text)] transition-colors">Component Lab</a>
          <a href="design-playground.html" class="hover:text-[var(--text)] transition-colors">Design Playground</a>
          <a href="proposal-generator.html" class="hover:text-[var(--text)] transition-colors">Proposal</a>
          <a href="playground.html" class="hover:text-[var(--text)] transition-colors">Playground</a>
          <a href="github.html" class="hover:text-[var(--text)] transition-colors">GitHub</a>
          <a href="resume.html" class="hover:text-[var(--text)] transition-colors">Resume</a>
          <a href="recruiter-search.html" class="hover:text-[var(--text)] transition-colors">Recruiter Search</a>
          <a href="knowledge.html" class="hover:text-[var(--text)] transition-colors">Knowledge Base</a>
          <a href="contact.html" class="hover:text-[var(--text)] transition-colors">Contact</a>
          <a href="404.html" class="hover:text-[var(--text)] transition-colors">404</a>
        </div>
      </div>
    </div>
  `;

  footerMount.querySelectorAll("[data-social-placeholder]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const label = btn.getAttribute("data-social-placeholder") || "Social";
      showToast(`${label} URL can be added in js/config.js.`, "info");
    });
  });

  if (window.PortfolioUX && typeof window.PortfolioUX.bindGlobalActionTriggers === "function") {
    window.PortfolioUX.bindGlobalActionTriggers(footerMount);
  }

  if (window.PortfolioBrand && typeof window.PortfolioBrand.mountSignatures === "function") {
    window.PortfolioBrand.mountSignatures(footerMount);
  }

  refreshIcons();
}

/* ==========================================================================
   4. Theme Initialization
   ========================================================================== */

function initTheme() {
  if (window.PortfolioTheme && typeof window.PortfolioTheme.init === "function") {
    window.PortfolioTheme.init();
  }
}

/* ==========================================================================
   5. Fast Animated Loader
   ========================================================================== */

function initLoader() {
  if (document.getElementById("page-loader")) return;

  const prefersReducedMotion =
    document.documentElement.classList.contains("a11y-reduce-motion") ||
    document.documentElement.classList.contains("perf-mode") ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  if (prefersReducedMotion) return;

  const config = window.portfolioConfig || { name: "AL AMIN" };
  const loaderBrand =
    window.PortfolioBrand && typeof window.PortfolioBrand.getBrand === "function"
      ? window.PortfolioBrand.getBrand()
      : { displayName: config.name || "AL AMIN", professionalTitle: config.role || "" };
  const loaderEmblem =
    window.PortfolioBrand && typeof window.PortfolioBrand.getEmblemSvg === "function"
      ? window.PortfolioBrand.getEmblemSvg({ size: 38 })
      : "";
  const loaderSig =
    window.PortfolioBrand && typeof window.PortfolioBrand.getSignatureMarkup === "function"
      ? window.PortfolioBrand.getSignatureMarkup("loader", { decorative: true })
      : "";

  const loader = document.createElement("div");
  loader.id = "page-loader";
  loader.className = "page-loader";
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-label", `Loading ${loaderBrand.displayName} portfolio`);
  loader.innerHTML = `
    <div class="loader-content">
      <div class="loader-brand-lockup">
        ${loaderEmblem}
        <div class="loader-wordmark gradient-text">${escapeHtml(loaderBrand.displayName)}</div>
      </div>
      ${loaderSig}
      <div class="loader-track" aria-hidden="true">
        <div class="loader-sweep"></div>
      </div>
    </div>
  `;

  document.body.appendChild(loader);
  if (window.PortfolioBrand && typeof window.PortfolioBrand.mountSignatures === "function") {
    const loaderBox = loader.querySelector(".brand-signature-box");
    if (loaderBox) loaderBox.classList.add("is-drawn");
  }

  const dismiss = () => {
    loader.classList.add("is-hidden");
    loader.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 300);
  };

  window.setTimeout(dismiss, 220);
}

/* ==========================================================================
   6. Top Scroll Progress Indicator
   ========================================================================== */

function initScrollProgress() {
  let track = document.getElementById("scroll-progress-track");
  if (!track) {
    track = document.createElement("div");
    track.id = "scroll-progress-track";
    track.className = "scroll-progress-track";
    track.setAttribute("aria-hidden", "true");
    track.innerHTML = `<div id="scroll-progress-bar" class="scroll-progress-bar"></div>`;
    document.body.appendChild(track);
  }

  const bar = document.getElementById("scroll-progress-bar");
  if (!bar || initScrollProgress.bound) return;
  initScrollProgress.bound = true;

  let ticking = false;
  const updateProgress = () => {
    ticking = false;
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    bar.style.transform = `scaleX(${ratio})`;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();
}

/* ==========================================================================
   7. Floating Back-to-Top Button
   ========================================================================== */

function initBackToTop() {
  let btn = document.getElementById("back-to-top-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "back-to-top-btn";
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.setAttribute("title", "Back to top");
    btn.innerHTML = `<i data-lucide="arrow-up" class="w-4 h-4"></i>`;
    document.body.appendChild(btn);
  }

  if (btn.dataset.bound !== "true") {
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const syncVisibility = () => {
      btn.classList.toggle("is-visible", window.scrollY > 280);
    };
    window.addEventListener("scroll", syncVisibility, { passive: true });
    syncVisibility();
  }

  refreshIcons();
}

/* ==========================================================================
   8. Subtle Page Transitions (fade, blur, scale)
   ========================================================================== */

function initPageTransitions() {
  const main = document.getElementById("main-content");
  if (!main) return;

  main.classList.add("page-transition-target");

  const prefersReducedMotion =
    document.documentElement.classList.contains("a11y-reduce-motion") ||
    document.documentElement.classList.contains("perf-mode") ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  if (prefersReducedMotion) return;

  if (!initPageTransitions.bound) {
    initPageTransitions.bound = true;

    window.addEventListener("pageshow", () => {
      main.classList.remove("is-page-leaving", "is-page-entering");
    });

    document.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target.closest("a[href]");
      if (!anchor) return;

      const rawHref = anchor.getAttribute("href");
      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      let targetUrl;
      try {
        targetUrl = new URL(anchor.href, window.location.href);
      } catch (_err) {
        return;
      }

      if (targetUrl.origin !== window.location.origin) return;
      if (targetUrl.pathname === window.location.pathname && targetUrl.hash) return;

      event.preventDefault();
      main.classList.add("is-page-leaving");

      window.setTimeout(() => {
        window.location.href = targetUrl.href;
      }, 160);
    });
  }
}

/* ==========================================================================
   9. Toast Notification System
   ========================================================================== */

function showToast(message, type = "info") {
  const allowedTypes = ["success", "error", "warning", "info"];
  const safeType = allowedTypes.includes(type) ? type : "info";

  const typeMeta = {
    success: { label: "Success", icon: "check-circle-2" },
    error: { label: "Error", icon: "alert-circle" },
    warning: { label: "Warning", icon: "alert-triangle" },
    info: { label: "Notice", icon: "info" }
  };

  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "false");
    document.body.appendChild(container);
  }

  const meta = typeMeta[safeType];
  const toast = document.createElement("div");
  toast.className = `toast-item toast-${safeType}`;
  toast.setAttribute("role", safeType === "error" ? "alert" : "status");
  toast.innerHTML = `
    <i data-lucide="${meta.icon}" class="w-5 h-5 toast-icon"></i>
    <div class="min-w-0 flex-1 space-y-0.5">
      <p class="text-xs font-semibold toast-label">${meta.label}</p>
      <p class="text-sm text-[var(--text)]">${escapeHtml(message)}</p>
    </div>
    <button type="button" class="toast-close" aria-label="Dismiss notification">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  let removed = false;
  const dismissToast = () => {
    if (removed) return;
    removed = true;
    toast.classList.add("is-leaving");
    window.setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 180);
  };

  const closeBtn = toast.querySelector(".toast-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", dismissToast);
  }

  container.appendChild(toast);
  refreshIcons();

  window.setTimeout(dismissToast, 4200);
  return toast;
}

/* ==========================================================================
   Global Exports
   ========================================================================== */

const PortfolioComponents = {
  loadNavbar,
  loadFooter,
  initTheme,
  initMobileMenu,
  initLoader,
  initScrollProgress,
  initBackToTop,
  initPageTransitions,
  showToast,
  getCurrentPage: getCurrentPageName
};

window.escapeHtml = escapeHtml;
window.refreshIcons = refreshIcons;
window.trapDialogFocus = trapDialogFocus;
window.loadNavbar = loadNavbar;
window.loadFooter = loadFooter;
window.initTheme = initTheme;
window.initMobileMenu = initMobileMenu;
window.initLoader = initLoader;
window.initScrollProgress = initScrollProgress;
window.initBackToTop = initBackToTop;
window.initPageTransitions = initPageTransitions;
window.showToast = showToast;
window.PortfolioComponents = PortfolioComponents;
