/**
 * AL AMIN Portfolio — Centralized Personal Brand System (Phase 21)
 * Manages visual brand identity, custom geometric emblem & logo mark, animated SVG signature,
 * centralized color token sync (dark/light + high-contrast safe), favicon sync, and DOM bindings.
 */

const PortfolioBrand = (() => {
  let instanceCounter = 0;
  let signatureObserver = null;

  function nextUid(prefix = "brand") {
    instanceCounter += 1;
    return `${prefix}-${instanceCounter}`;
  }

  function escHtml(value) {
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

  function getBrand() {
    const cfg = window.portfolioConfig || {};
    const b = cfg.brand || {};

    return {
      name: b.name || cfg.name || "AL AMIN",
      displayName: b.displayName || b.name || cfg.name || "AL AMIN",
      monogram: b.monogram || "AA",
      professionalTitle: b.professionalTitle || cfg.role || "Full-Stack Developer & Creative Designer",
      shortTagline: b.shortTagline || cfg.bio || "I build modern, scalable and user-focused web applications.",
      longTagline:
        b.longTagline ||
        cfg.bio ||
        "I design and engineer modern full-stack web applications, SaaS architectures, and responsive digital products.",
      description:
        b.description ||
        "Personal engineering brand of AL AMIN — full-stack MERN engineering, Next.js product interfaces, and responsive design systems.",
      location: b.location || cfg.location || "Bangladesh",
      email: b.email || cfg.email || "your-email@example.com",
      phone: b.phone !== undefined ? b.phone : cfg.phone || "",
      profileImage: b.profileImage || cfg.profileImage || "assets/images/profile.jpg",
      profileFallbackImage: b.profileFallbackImage || "assets/images/profile-placeholder.svg",
      favicon: b.favicon || "assets/icons/favicon.svg",
      logo: {
        ariaLabel: (b.logo && b.logo.ariaLabel) || `${b.displayName || cfg.name || "AL AMIN"} Home`,
        badgeText: (b.logo && b.logo.badgeText) || "Engineer · Designer",
        showSubtitleInFooter:
          b.logo && typeof b.logo.showSubtitleInFooter === "boolean" ? b.logo.showSubtitleInFooter : true
      },
      colors: {
        primary: (b.colors && b.colors.primary) || "#6366F1",
        secondary: (b.colors && b.colors.secondary) || "#8B5CF6",
        accentCyan: (b.colors && b.colors.accentCyan) || "#06B6D4",
        accentPink: (b.colors && b.colors.accentPink) || "#EC4899",
        lightPrimary: (b.colors && b.colors.lightPrimary) || "#4F46E5",
        lightSecondary: (b.colors && b.colors.lightSecondary) || "#7C3AED",
        lightAccentCyan: (b.colors && b.colors.lightAccentCyan) || "#0891B2",
        lightAccentPink: (b.colors && b.colors.lightAccentPink) || "#DB2777"
      },
      social: {
        github: (b.social && b.social.github) || (cfg.socialLinks && cfg.socialLinks.github) || "",
        linkedin: (b.social && b.social.linkedin) || (cfg.socialLinks && cfg.socialLinks.linkedin) || "",
        facebook: (b.social && b.social.facebook) || (cfg.socialLinks && cfg.socialLinks.facebook) || "",
        fiverr: (b.social && b.social.fiverr) || (cfg.socialLinks && cfg.socialLinks.fiverr) || "",
        upwork: (b.social && b.social.upwork) || (cfg.socialLinks && cfg.socialLinks.upwork) || "",
        email: (b.social && b.social.email) || b.email || cfg.email || "your-email@example.com"
      },
      resume: {
        url: (b.resume && b.resume.url) || cfg.resumeUrl || "assets/documents/resume.pdf",
        filename: (b.resume && b.resume.filename) || "AL_AMIN_Resume.pdf",
        label: (b.resume && b.resume.label) || "Download Resume"
      },
      availability: {
        status: (b.availability && b.availability.status) || cfg.availabilityStatus || "freelance",
        label: (b.availability && b.availability.label) || "Open to Freelance & Full-Stack Roles",
        shortLabel: (b.availability && b.availability.shortLabel) || "Open to Freelance",
        note:
          (b.availability && b.availability.note) ||
          "Available for international remote product builds, SaaS systems, and full-stack engineering."
      },
      currentFocus: b.currentFocus || "Full-Stack MERN, Next.js & Design Systems"
    };
  }

  function isReducedMotionActive() {
    const root = document.documentElement;
    return (
      (root && (root.classList.contains("a11y-reduce-motion") || root.classList.contains("perf-mode"))) ||
      (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    );
  }

  function applyBrandThemeVariables() {
    const root = document.documentElement;
    if (!root) return;

    const brand = getBrand();
    const isHighContrast = root.classList.contains("a11y-high-contrast");

    if (isHighContrast) {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--accent-cyan");
      root.style.removeProperty("--accent-pink");
      return;
    }

    const isLight = root.classList.contains("light");
    const c = brand.colors;

    root.style.setProperty("--primary", isLight ? c.lightPrimary : c.primary);
    root.style.setProperty("--secondary", isLight ? c.lightSecondary : c.secondary);
    root.style.setProperty("--accent-cyan", isLight ? c.lightAccentCyan : c.accentCyan);
    root.style.setProperty("--accent-pink", isLight ? c.lightAccentPink : c.accentPink);
  }

  function syncFavicon() {
    const brand = getBrand();
    if (!brand.favicon) return;
    const iconLink = document.querySelector('link[rel="icon"]');
    if (iconLink && iconLink.getAttribute("href") !== brand.favicon) {
      iconLink.setAttribute("href", brand.favicon);
    }
  }

  function getEmblemSvg(options = {}) {
    const size = Number(options.size) || 34;
    const brand = getBrand();
    const c = brand.colors;
    const gradId = nextUid("brand-emblem-grad");

    return `
      <svg
        width="${size}"
        height="${size}"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="brand-emblem-svg"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="2" y="2" width="60" height="60" rx="14" class="brand-emblem-plate" stroke="url(#${gradId})" stroke-width="2.2"/>
        <path d="M15 14H21.5M15 14V20.5M49 50H42.5M49 50V43.5" stroke="${escHtml(c.accentCyan)}" stroke-opacity="0.72" stroke-width="2" stroke-linecap="round"/>
        <path d="M20.5 45L30.2 18.5H34.4L44.1 45H39.1L37.1 39.2H27.4L25.4 45H20.5ZM28.7 35H35.8L32.3 24.4L28.7 35Z" fill="url(#${gradId})"/>
        <circle cx="45.5" cy="18.5" r="2.9" fill="${escHtml(c.accentCyan)}"/>
        <defs>
          <linearGradient id="${gradId}" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stop-color="${escHtml(c.primary)}"/>
            <stop offset="0.52" stop-color="${escHtml(c.secondary)}"/>
            <stop offset="1" stop-color="${escHtml(c.accentCyan)}"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }

  function getLogoMarkup(options = {}) {
    const brand = getBrand();
    const size = options.size === "md" ? 38 : 34;
    const showSubtitle = Boolean(options.showSubtitle);

    return `
      <span class="brand-emblem-box" aria-hidden="true">
        ${getEmblemSvg({ size })}
      </span>
      <span class="brand-lockup">
        <span class="brand-lockup-title">${escHtml(brand.displayName)}</span>
        ${
          showSubtitle
            ? `<span class="brand-lockup-sub">${escHtml(brand.logo.badgeText)}</span>`
            : ""
        }
      </span>
    `;
  }

  function getSignatureMarkup(variant = "default", options = {}) {
    const brand = getBrand();
    const c = brand.colors;
    const gradId = nextUid("sig-grad");
    const glowGradId = nextUid("sig-glow");
    const isDecorative = Boolean(options.decorative);
    const ariaAttrs = isDecorative
      ? 'aria-hidden="true"'
      : `role="img" aria-label="${escHtml(brand.displayName)} animated brand signature"`;
    const drawnClass = isReducedMotionActive() ? "is-drawn" : "";

    return `
      <div class="brand-signature-box brand-signature-${escHtml(variant)} ${drawnClass}" data-signature-variant="${escHtml(variant)}" ${ariaAttrs}>
        <svg
          viewBox="0 0 284 78"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="brand-signature-svg"
          focusable="false"
        >
          <defs>
            <linearGradient id="${gradId}" x1="16" y1="14" x2="268" y2="62" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="${escHtml(c.primary)}"/>
              <stop offset="50%" stop-color="${escHtml(c.secondary)}"/>
              <stop offset="100%" stop-color="${escHtml(c.accentCyan)}"/>
            </linearGradient>
            <linearGradient id="${glowGradId}" x1="20" y1="60" x2="262" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="${escHtml(c.primary)}" stop-opacity="0.25"/>
              <stop offset="50%" stop-color="${escHtml(c.accentCyan)}" stop-opacity="0.95"/>
              <stop offset="100%" stop-color="${escHtml(c.accentPink)}" stop-opacity="0.6"/>
            </linearGradient>
          </defs>

          <!-- Architectural Monogram Guide Line -->
          <path
            d="M20 63 Q142 54 264 60"
            pathLength="100"
            class="brand-signature-flourish"
            stroke="url(#${glowGradId})"
            stroke-width="2"
            stroke-linecap="round"
          />

          <!-- Primary Calligraphic Vector Stroke: "Al" -->
          <path
            d="M22 52 C28 31 36 16 44 12 C47 10 49 14 50 51 M26 39 C38 36 53 33 63 29 C69 24 73 14 71 11 C69 9 65 21 65 37 C65 49 71 52 79 47"
            pathLength="100"
            class="brand-signature-stroke brand-signature-stroke-primary"
            stroke="url(#${gradId})"
            stroke-width="3.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Secondary Calligraphic Vector Stroke: "Amin" -->
          <path
            d="M99 52 C106 31 115 15 122 12 C125 10 127 16 128 50 M103 38 C115 36 128 33 137 31 C141 31 143 48 144 48 C147 36 153 31 157 32 C160 33 160 48 161 48 C165 36 171 31 175 32 C178 33 178 48 182 48 C186 48 190 40 192 33 C193 43 195 48 199 48 C204 48 208 35 213 33 C216 32 218 48 219 48 C223 36 230 32 235 33 C239 34 239 47 244 47 C251 47 259 41 266 36"
            pathLength="100"
            class="brand-signature-stroke brand-signature-stroke-secondary"
            stroke="url(#${gradId})"
            stroke-width="3.1"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Precision Dot & Terminal Registration Mark -->
          <circle cx="192.5" cy="21.5" r="2.7" class="brand-signature-dot" fill="${escHtml(c.accentCyan)}"/>
          <circle cx="266" cy="59.5" r="2.2" class="brand-signature-dot" fill="${escHtml(c.accentPink)}"/>
        </svg>
      </div>
    `;
  }

  function revealSignatureBox(box) {
    if (!box) return;
    if (isReducedMotionActive()) {
      box.classList.add("is-drawn");
      return;
    }
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          box.classList.add("is-drawn");
        });
      });
    } else {
      box.classList.add("is-drawn");
    }
  }

  function ensureSignatureObserver() {
    if (signatureObserver || typeof window.IntersectionObserver !== "function") {
      return signatureObserver;
    }

    signatureObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targetBox = entry.target.querySelector(".brand-signature-box") || entry.target;
            revealSignatureBox(targetBox);
            signatureObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -20px 0px" }
    );

    return signatureObserver;
  }

  function mountSignatures(scopeRoot = document) {
    if (!scopeRoot || !scopeRoot.querySelectorAll) return;

    const slots = scopeRoot.querySelectorAll("[data-brand-signature]");
    if (slots.length === 0) return;

    const observer = ensureSignatureObserver();

    slots.forEach((slot) => {
      const variant = slot.getAttribute("data-brand-signature") || "default";
      const isDecorative = slot.getAttribute("data-signature-decorative") === "true";
      slot.innerHTML = getSignatureMarkup(variant, { decorative: isDecorative });

      const box = slot.querySelector(".brand-signature-box");
      if (!box) return;

      if (variant === "hero" || variant === "loader" || !observer || isReducedMotionActive()) {
        revealSignatureBox(box);
      } else {
        observer.observe(slot);
      }
    });
  }

  function resolveConfigPath(pathKey) {
    const cfg = window.portfolioConfig;
    if (!cfg || !pathKey) return undefined;

    return pathKey.split(".").reduce((acc, part) => {
      if (acc && typeof acc === "object" && part in acc) {
        return acc[part];
      }
      return undefined;
    }, cfg);
  }

  function bindBrandDom(scopeRoot = document) {
    if (!scopeRoot || !scopeRoot.querySelectorAll) return;
    const brand = getBrand();

    scopeRoot.querySelectorAll("[data-config]").forEach((node) => {
      const key = node.getAttribute("data-config");
      const value = resolveConfigPath(key);
      if (typeof value === "string" && value.trim() !== "") {
        node.textContent = value;
      }
    });

    scopeRoot.querySelectorAll("[data-brand-src]").forEach((img) => {
      const key = img.getAttribute("data-brand-src") || "profileImage";
      const val = brand[key] || resolveConfigPath(key);
      if (typeof val === "string" && val.trim() !== "") {
        img.setAttribute("src", val);
      }
    });

    scopeRoot.querySelectorAll("[data-brand-mailto]").forEach((link) => {
      link.setAttribute("href", `mailto:${brand.email}`);
    });

    scopeRoot.querySelectorAll("[data-resume-download]").forEach((link) => {
      link.setAttribute("href", brand.resume.url);
      if (link.hasAttribute("download")) {
        link.setAttribute("download", brand.resume.filename);
      }
    });

    scopeRoot.querySelectorAll("[data-brand-emblem]").forEach((slot) => {
      const size = Number(slot.getAttribute("data-emblem-size")) || 34;
      slot.innerHTML = getEmblemSvg({ size });
    });
  }

  function init() {
    applyBrandThemeVariables();
    syncFavicon();
    bindBrandDom(document);
    mountSignatures(document);

    if (!init.eventsBound) {
      init.eventsBound = true;
      window.addEventListener("portfolio:theme-changed", applyBrandThemeVariables);
      window.addEventListener("portfolio:prefs-changed", () => {
        applyBrandThemeVariables();
        if (isReducedMotionActive()) {
          document.querySelectorAll(".brand-signature-box").forEach((box) => {
            box.classList.add("is-drawn");
          });
        }
      });
    }
  }

  // Apply brand tokens and favicon cleanly as early as possible
  applyBrandThemeVariables();
  syncFavicon();

  return {
    init,
    getBrand,
    getEmblemSvg,
    getLogoMarkup,
    getSignatureMarkup,
    mountSignatures,
    bindBrandDom,
    applyBrandThemeVariables,
    syncFavicon
  };
})();

window.PortfolioBrand = PortfolioBrand;
