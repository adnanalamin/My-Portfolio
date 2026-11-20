/**
 * AL AMIN Portfolio — Theme Manager (Phase 1 + Phase 2)
 * Supports localStorage persistence, system color-scheme detection, and cross-page sync.
 */

const PortfolioTheme = (() => {
  const STORAGE_KEY = "alamin-portfolio-theme";
  const DEFAULT_THEME = "dark";

  function detectSystemTheme() {
    if (typeof window.matchMedia === "function") {
      if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light";
      }
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return DEFAULT_THEME;
  }

  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch (_err) {
      // Storage unavailable in restricted browsing contexts
    }
    return null;
  }

  function getResolvedTheme() {
    return getSavedTheme() || detectSystemTheme() || DEFAULT_THEME;
  }

  function updateToggleButtons(theme) {
    const buttons = document.querySelectorAll("[data-theme-toggle]");
    buttons.forEach((btn) => {
      const nextLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
      btn.setAttribute("aria-label", nextLabel);
      btn.setAttribute("title", nextLabel);
      btn.setAttribute("aria-pressed", String(theme === "light"));
      const sunIcon = btn.querySelector("[data-theme-icon='sun']");
      const moonIcon = btn.querySelector("[data-theme-icon='moon']");
      if (sunIcon && moonIcon) {
        sunIcon.classList.toggle("hidden", theme === "light");
        moonIcon.classList.toggle("hidden", theme === "dark");
      }
    });
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    const isLight = theme === "light";

    root.classList.toggle("light", isLight);
    root.classList.toggle("dark", !isLight);
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = isLight ? "light" : "dark";

    updateToggleButtons(theme);

    try {
      window.dispatchEvent(new CustomEvent("portfolio:theme-changed", { detail: { theme } }));
    } catch (_err) {
      // Ignore event dispatch errors in restricted contexts
    }
  }

  function toggleTheme() {
    const current = document.documentElement.classList.contains("light") ? "light" : "dark";
    const next = current === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (_err) {
      // Ignore storage write failure
    }
    applyTheme(next);

    if (typeof window.showToast === "function") {
      window.showToast(
        next === "light" ? "Switched to light theme" : "Switched to dark theme",
        "info"
      );
    }
  }

  function bindToggleHandlers() {
    const buttons = document.querySelectorAll("[data-theme-toggle]");
    buttons.forEach((btn) => {
      if (btn.dataset.themeBound === "true") return;
      btn.dataset.themeBound = "true";
      btn.addEventListener("click", toggleTheme);
    });
    updateToggleButtons(getResolvedTheme());
  }

  function watchSystemPreference() {
    if (typeof window.matchMedia !== "function" || watchSystemPreference.bound) return;
    watchSystemPreference.bound = true;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (event) => {
      if (!getSavedTheme()) {
        applyTheme(event.matches ? "light" : "dark");
      }
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
    }
  }

  const PREFS_KEY = "alamin_portfolio_prefs_v1";

  function osPrefersReducedMotion() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function getDefaultPrefs() {
    return {
      reduceMotion: null, // null = follow OS prefers-reduced-motion
      highContrast: false,
      largeText: false,
      strongFocus: false,
      noDecor: false,
      perfMode: false
    };
  }

  function getSavedPrefs() {
    const defaults = getDefaultPrefs();
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return defaults;
      return {
        reduceMotion: typeof parsed.reduceMotion === "boolean" ? parsed.reduceMotion : null,
        highContrast: Boolean(parsed.highContrast),
        largeText: Boolean(parsed.largeText),
        strongFocus: Boolean(parsed.strongFocus),
        noDecor: Boolean(parsed.noDecor),
        perfMode: Boolean(parsed.perfMode)
      };
    } catch (_err) {
      return defaults;
    }
  }

  function applyPrefs(prefsInput) {
    const prefs = prefsInput || getSavedPrefs();
    const root = document.documentElement;
    if (!root) return prefs;

    const effectiveReduceMotion =
      prefs.reduceMotion === null ? osPrefersReducedMotion() : Boolean(prefs.reduceMotion);

    root.classList.toggle("a11y-reduce-motion", Boolean(prefs.reduceMotion));
    root.classList.toggle("a11y-high-contrast", Boolean(prefs.highContrast));
    root.classList.toggle("a11y-large-text", Boolean(prefs.largeText));
    root.classList.toggle("a11y-strong-focus", Boolean(prefs.strongFocus));
    root.classList.toggle("a11y-no-decor", Boolean(prefs.noDecor));
    root.classList.toggle("perf-mode", Boolean(prefs.perfMode));
    root.setAttribute("data-reduce-motion", String(effectiveReduceMotion));
    return prefs;
  }

  function saveAndApplyPrefs(nextPrefs) {
    const normalized = {
      reduceMotion: typeof nextPrefs.reduceMotion === "boolean" ? nextPrefs.reduceMotion : null,
      highContrast: Boolean(nextPrefs.highContrast),
      largeText: Boolean(nextPrefs.largeText),
      strongFocus: Boolean(nextPrefs.strongFocus),
      noDecor: Boolean(nextPrefs.noDecor),
      perfMode: Boolean(nextPrefs.perfMode)
    };
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(normalized));
    } catch (_err) {
      // Ignore storage write failure
    }
    applyPrefs(normalized);
    try {
      window.dispatchEvent(new CustomEvent("portfolio:prefs-changed", { detail: normalized }));
    } catch (_err) {
      // Ignore CustomEvent issues in constrained environments
    }
    return normalized;
  }

  function init() {
    applyTheme(getResolvedTheme());
    applyPrefs(getSavedPrefs());
    bindToggleHandlers();
    watchSystemPreference();
  }

  // Apply immediately on script execution to prevent theme & preference flicker
  applyTheme(getResolvedTheme());
  applyPrefs(getSavedPrefs());

  return {
    init,
    toggleTheme,
    bindToggleHandlers,
    detectSystemTheme,
    getCurrentTheme: getResolvedTheme,
    getSavedPrefs,
    saveAndApplyPrefs,
    getDefaultPrefs,
    applyPrefs,
    osPrefersReducedMotion
  };
})();

window.PortfolioTheme = PortfolioTheme;
