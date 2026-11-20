/**
 * AL AMIN Portfolio — Phase 34: Interactive Visual Design Playground
 * Safe CSS custom-property synthesizer updating live Navbar, Heading,
 * Button, Card, and Form previews without executing arbitrary code.
 */

(() => {
  const DEFAULTS = {
    primary: "#6366f1",
    secondary: "#06b6d4",
    background: "#050816",
    radius: 12,
    shadow: "elevated", // "none" | "subtle" | "elevated" | "ring"
    fontSize: 15,
    spacing: 20,
    gradient: "linear", // "linear" | "diagonal" | "radial" | "solid"
    buttonStyle: "gradient", // "gradient" | "solid" | "outline" | "pill"
    cardStyle: "elevated" // "bordered" | "elevated" | "tinted" | "minimal"
  };

  const ALLOWED_SHADOWS = {
    none: "none",
    subtle: "0 4px 14px -4px rgba(2, 6, 23, 0.28)",
    elevated: "0 18px 40px -14px rgba(2, 6, 23, 0.55)",
    ring: "0 0 0 2px rgba(6, 182, 212, 0.35), 0 10px 24px -10px rgba(2, 6, 23, 0.45)"
  };

  const ALLOWED_GRADIENTS = ["linear", "diagonal", "radial", "solid"];
  const ALLOWED_BUTTON_STYLES = ["gradient", "solid", "outline", "pill"];
  const ALLOWED_CARD_STYLES = ["bordered", "elevated", "tinted", "minimal"];

  const PRESETS = [
    {
      id: "alamin-dark",
      label: "AL AMIN Slate",
      config: { ...DEFAULTS }
    },
    {
      id: "emerald-ops",
      label: "Emerald Console",
      config: {
        primary: "#10b981",
        secondary: "#0ea5e9",
        background: "#090f1a",
        radius: 8,
        shadow: "subtle",
        fontSize: 14,
        spacing: 18,
        gradient: "linear",
        buttonStyle: "solid",
        cardStyle: "bordered"
      }
    },
    {
      id: "editorial-light",
      label: "Clean Daylight",
      config: {
        primary: "#4f46e5",
        secondary: "#0891b2",
        background: "#f8fafc",
        radius: 14,
        shadow: "subtle",
        fontSize: 15,
        spacing: 22,
        gradient: "diagonal",
        buttonStyle: "gradient",
        cardStyle: "elevated"
      }
    },
    {
      id: "brutal-sharp",
      label: "Crisp Architectural",
      config: {
        primary: "#8b5cf6",
        secondary: "#f59e0b",
        background: "#111827",
        radius: 2,
        shadow: "ring",
        fontSize: 15,
        spacing: 16,
        gradient: "solid",
        buttonStyle: "outline",
        cardStyle: "bordered"
      }
    }
  ];

  function sanitizeHex(val, fallback) {
    if (typeof val === "string" && /^#[0-9a-fA-F]{6}$/.test(val.trim())) {
      return val.trim().toLowerCase();
    }
    return fallback;
  }

  function clampInt(val, min, max, fallback) {
    const n = Number(val);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
  }

  function sanitizeConfig(raw) {
    const src = raw && typeof raw === "object" ? raw : {};
    return {
      primary: sanitizeHex(src.primary, DEFAULTS.primary),
      secondary: sanitizeHex(src.secondary, DEFAULTS.secondary),
      background: sanitizeHex(src.background, DEFAULTS.background),
      radius: clampInt(src.radius, 0, 28, DEFAULTS.radius),
      shadow: Object.prototype.hasOwnProperty.call(ALLOWED_SHADOWS, src.shadow) ? src.shadow : DEFAULTS.shadow,
      fontSize: clampInt(src.fontSize, 13, 20, DEFAULTS.fontSize),
      spacing: clampInt(src.spacing, 12, 34, DEFAULTS.spacing),
      gradient: ALLOWED_GRADIENTS.includes(src.gradient) ? src.gradient : DEFAULTS.gradient,
      buttonStyle: ALLOWED_BUTTON_STYLES.includes(src.buttonStyle) ? src.buttonStyle : DEFAULTS.buttonStyle,
      cardStyle: ALLOWED_CARD_STYLES.includes(src.cardStyle) ? src.cardStyle : DEFAULTS.cardStyle
    };
  }

  function hexLuminance(hex) {
    const clean = sanitizeHex(hex, "#050816").slice(1);
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    const chan = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
  }

  function buildGradientCss(cfg) {
    if (cfg.gradient === "diagonal") {
      return `linear-gradient(155deg, ${cfg.primary} 0%, ${cfg.secondary} 100%)`;
    }
    if (cfg.gradient === "radial") {
      return `radial-gradient(circle at top left, ${cfg.primary} 0%, ${cfg.secondary} 100%)`;
    }
    if (cfg.gradient === "solid") {
      return cfg.primary;
    }
    return `linear-gradient(135deg, ${cfg.primary}, ${cfg.secondary})`;
  }

  function buildSurfaceTokens(cfg) {
    const isLightBg = hexLuminance(cfg.background) > 0.42;
    return {
      isLightBg,
      surface: isLightBg ? "#ffffff" : "#0b1020",
      text: isLightBg ? "#0f172a" : "#f8fafc",
      muted: isLightBg ? "#475569" : "#94a3b8",
      border: isLightBg ? "rgba(15, 23, 42, 0.14)" : "rgba(148, 163, 184, 0.22)",
      shadowCss: ALLOWED_SHADOWS[cfg.shadow] || ALLOWED_SHADOWS.elevated,
      gradientCss: buildGradientCss(cfg),
      bgOverlay:
        cfg.gradient === "radial"
          ? `radial-gradient(circle at 85% 15%, ${cfg.secondary}1f, transparent 45%)`
          : "none"
    };
  }

  function generateCssOutput(rawCfg) {
    const cfg = sanitizeConfig(rawCfg);
    const surf = buildSurfaceTokens(cfg);
    const btnRadius = cfg.buttonStyle === "pill" ? "999px" : `${cfg.radius}px`;
    return `:root {
  --color-primary: ${cfg.primary};
  --color-secondary: ${cfg.secondary};
  --color-background: ${cfg.background};
  --color-surface: ${surf.surface};
  --color-text: ${surf.text};
  --color-muted: ${surf.muted};
  --color-border: ${surf.border};
  --radius-base: ${cfg.radius}px;
  --shadow-token: ${surf.shadowCss};
  --font-size-base: ${cfg.fontSize}px;
  --spacing-unit: ${cfg.spacing}px;
  --accent-gradient: ${surf.gradientCss};
}

.ui-button {
  border-radius: ${btnRadius};
  padding: ${Math.round(cfg.spacing * 0.45)}px ${Math.round(cfg.spacing * 0.95)}px;
  font-size: ${Math.round(cfg.fontSize * 0.9)}px;
  box-shadow: var(--shadow-token);
  background: ${cfg.buttonStyle === "outline" ? "transparent" : cfg.buttonStyle === "solid" ? "var(--color-primary)" : "var(--accent-gradient)"};
  color: ${cfg.buttonStyle === "outline" ? "var(--color-primary)" : "#ffffff"};
  border: 1px solid ${cfg.buttonStyle === "outline" ? "var(--color-primary)" : "transparent"};
}

.ui-card {
  background-color: ${cfg.cardStyle === "minimal" ? "transparent" : "var(--color-surface)"};
  border: 1px ${cfg.cardStyle === "minimal" ? "dashed" : "solid"} var(--color-border);
  border-radius: var(--radius-base);
  padding: var(--spacing-unit);
  box-shadow: ${cfg.cardStyle === "bordered" || cfg.cardStyle === "minimal" ? "none" : "var(--shadow-token)"};
}`;
  }

  function encodeShareParams(rawCfg) {
    const cfg = sanitizeConfig(rawCfg);
    const params = new URLSearchParams();
    params.set("p", cfg.primary.slice(1));
    params.set("s", cfg.secondary.slice(1));
    params.set("bg", cfg.background.slice(1));
    params.set("r", String(cfg.radius));
    params.set("sh", cfg.shadow);
    params.set("fs", String(cfg.fontSize));
    params.set("sp", String(cfg.spacing));
    params.set("gr", cfg.gradient);
    params.set("bs", cfg.buttonStyle);
    params.set("cs", cfg.cardStyle);
    return params.toString();
  }

  function parseShareParams(searchStr) {
    if (!searchStr || typeof searchStr !== "string") return null;
    const params = new URLSearchParams(searchStr.replace(/^\?/, ""));
    if (!params.has("p") && !params.has("bg") && !params.has("r")) return null;
    return sanitizeConfig({
      primary: params.get("p") ? `#${params.get("p")}` : DEFAULTS.primary,
      secondary: params.get("s") ? `#${params.get("s")}` : DEFAULTS.secondary,
      background: params.get("bg") ? `#${params.get("bg")}` : DEFAULTS.background,
      radius: params.get("r"),
      shadow: params.get("sh"),
      fontSize: params.get("fs"),
      spacing: params.get("sp"),
      gradient: params.get("gr"),
      buttonStyle: params.get("bs"),
      cardStyle: params.get("cs")
    });
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
    const root = document.getElementById("design-playground-root");
    if (!root) return;

    const loadedFromUrl = parseShareParams(window.location.search);
    let state = sanitizeConfig(loadedFromUrl || DEFAULTS);

    // Control inputs
    const primaryIn = document.getElementById("dp-primary-color");
    const secondaryIn = document.getElementById("dp-secondary-color");
    const bgIn = document.getElementById("dp-bg-color");
    const primaryHex = document.getElementById("dp-primary-hex");
    const secondaryHex = document.getElementById("dp-secondary-hex");
    const bgHex = document.getElementById("dp-bg-hex");

    const radiusIn = document.getElementById("dp-radius-range");
    const radiusVal = document.getElementById("dp-radius-val");
    const fontIn = document.getElementById("dp-font-range");
    const fontVal = document.getElementById("dp-font-val");
    const spacingIn = document.getElementById("dp-spacing-range");
    const spacingVal = document.getElementById("dp-spacing-val");

    const shadowGroup = document.getElementById("dp-shadow-group");
    const gradientGroup = document.getElementById("dp-gradient-group");
    const buttonGroup = document.getElementById("dp-button-group");
    const cardGroup = document.getElementById("dp-card-group");
    const presetsMount = document.getElementById("dp-presets-row");

    // Live preview targets
    const previewCanvas = document.getElementById("dp-preview-canvas");
    const prevPrimaryBtn = document.getElementById("dp-prev-primary-btn");
    const prevCard = document.getElementById("dp-prev-card");
    const prevForm = document.getElementById("dp-prev-form");
    const prevFormSubmitBtn = document.getElementById("dp-prev-form-submit");
    const prevFormMsg = document.getElementById("dp-prev-form-msg");
    const prevNavLinks = root.querySelectorAll("[data-dp-nav]");
    const prevBtnStatus = document.getElementById("dp-prev-btn-status");

    // Code & Action buttons
    const cssCodeEl = document.getElementById("dp-generated-css");
    const resetBtn = document.getElementById("dp-reset-btn");
    const copyCssBtn = document.getElementById("dp-copy-css-btn");
    const exportCssBtn = document.getElementById("dp-export-css-btn");
    const shareBtn = document.getElementById("dp-share-btn");

    function renderSegmentedButtons() {
      root.querySelectorAll("[data-dp-shadow]").forEach((b) => {
        const active = b.getAttribute("data-dp-shadow") === state.shadow;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      root.querySelectorAll("[data-dp-gradient]").forEach((b) => {
        const active = b.getAttribute("data-dp-gradient") === state.gradient;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      root.querySelectorAll("[data-dp-button]").forEach((b) => {
        const active = b.getAttribute("data-dp-button") === state.buttonStyle;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      root.querySelectorAll("[data-dp-card]").forEach((b) => {
        const active = b.getAttribute("data-dp-card") === state.cardStyle;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function applyStateToControls() {
      if (primaryIn) primaryIn.value = state.primary;
      if (secondaryIn) secondaryIn.value = state.secondary;
      if (bgIn) bgIn.value = state.background;
      if (primaryHex) primaryHex.textContent = state.primary.toUpperCase();
      if (secondaryHex) secondaryHex.textContent = state.secondary.toUpperCase();
      if (bgHex) bgHex.textContent = state.background.toUpperCase();

      if (radiusIn) radiusIn.value = String(state.radius);
      if (radiusVal) radiusVal.textContent = `${state.radius}px`;
      if (fontIn) fontIn.value = String(state.fontSize);
      if (fontVal) fontVal.textContent = `${state.fontSize}px`;
      if (spacingIn) spacingIn.value = String(state.spacing);
      if (spacingVal) spacingVal.textContent = `${state.spacing}px`;

      renderSegmentedButtons();
    }

    function applyStateToPreview() {
      const cfg = sanitizeConfig(state);
      state = cfg;
      const surf = buildSurfaceTokens(cfg);

      if (previewCanvas) {
        previewCanvas.style.setProperty("--dp-primary", cfg.primary);
        previewCanvas.style.setProperty("--dp-secondary", cfg.secondary);
        previewCanvas.style.setProperty("--dp-bg", cfg.background);
        previewCanvas.style.setProperty("--dp-surface", surf.surface);
        previewCanvas.style.setProperty("--dp-text", surf.text);
        previewCanvas.style.setProperty("--dp-muted", surf.muted);
        previewCanvas.style.setProperty("--dp-border", surf.border);
        previewCanvas.style.setProperty("--dp-radius", `${cfg.radius}px`);
        previewCanvas.style.setProperty("--dp-shadow", surf.shadowCss);
        previewCanvas.style.setProperty("--dp-font-size", `${cfg.fontSize}px`);
        previewCanvas.style.setProperty("--dp-spacing", `${cfg.spacing}px`);
        previewCanvas.style.setProperty("--dp-gradient", surf.gradientCss);
        previewCanvas.style.setProperty("--dp-bg-overlay", surf.bgOverlay);
      }

      const btnClass = `dp-prev-btn dp-prev-btn--${cfg.buttonStyle}`;
      if (prevPrimaryBtn) prevPrimaryBtn.className = btnClass;
      if (prevFormSubmitBtn) prevFormSubmitBtn.className = btnClass;

      if (prevCard) {
        prevCard.className = `dp-prev-card dp-prev-card--${cfg.cardStyle}`;
      }

      if (cssCodeEl) {
        cssCodeEl.textContent = generateCssOutput(cfg);
      }
    }

    function updateAll() {
      applyStateToControls();
      applyStateToPreview();
    }

    if (presetsMount) {
      presetsMount.innerHTML = PRESETS.map(
        (pr) => `
          <button type="button" class="dp-preset-btn" data-dp-preset="${pr.id}">
            <span class="w-3 h-3 rounded-full shrink-0" style="background: linear-gradient(135deg, ${pr.config.primary}, ${pr.config.secondary});"></span>
            <span>${pr.label}</span>
          </button>
        `
      ).join("");

      presetsMount.querySelectorAll("[data-dp-preset]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-dp-preset");
          const found = PRESETS.find((p) => p.id === id);
          if (!found) return;
          state = sanitizeConfig(found.config);
          updateAll();
        });
      });
    }

    if (primaryIn) {
      primaryIn.addEventListener("input", () => {
        state.primary = sanitizeHex(primaryIn.value, state.primary);
        updateAll();
      });
    }
    if (secondaryIn) {
      secondaryIn.addEventListener("input", () => {
        state.secondary = sanitizeHex(secondaryIn.value, state.secondary);
        updateAll();
      });
    }
    if (bgIn) {
      bgIn.addEventListener("input", () => {
        state.background = sanitizeHex(bgIn.value, state.background);
        updateAll();
      });
    }
    if (radiusIn) {
      radiusIn.addEventListener("input", () => {
        state.radius = clampInt(radiusIn.value, 0, 28, state.radius);
        updateAll();
      });
    }
    if (fontIn) {
      fontIn.addEventListener("input", () => {
        state.fontSize = clampInt(fontIn.value, 13, 20, state.fontSize);
        updateAll();
      });
    }
    if (spacingIn) {
      spacingIn.addEventListener("input", () => {
        state.spacing = clampInt(spacingIn.value, 12, 34, state.spacing);
        updateAll();
      });
    }

    if (shadowGroup) {
      shadowGroup.querySelectorAll("[data-dp-shadow]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.shadow = btn.getAttribute("data-dp-shadow") || DEFAULTS.shadow;
          updateAll();
        });
      });
    }
    if (gradientGroup) {
      gradientGroup.querySelectorAll("[data-dp-gradient]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.gradient = btn.getAttribute("data-dp-gradient") || DEFAULTS.gradient;
          updateAll();
        });
      });
    }
    if (buttonGroup) {
      buttonGroup.querySelectorAll("[data-dp-button]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.buttonStyle = btn.getAttribute("data-dp-button") || DEFAULTS.buttonStyle;
          updateAll();
        });
      });
    }
    if (cardGroup) {
      cardGroup.querySelectorAll("[data-dp-card]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.cardStyle = btn.getAttribute("data-dp-card") || DEFAULTS.cardStyle;
          updateAll();
        });
      });
    }

    // Live interactive specimens inside preview canvas
    prevNavLinks.forEach((linkBtn) => {
      linkBtn.addEventListener("click", () => {
        prevNavLinks.forEach((other) => other.classList.toggle("is-active", other === linkBtn));
      });
    });

    if (prevPrimaryBtn && prevBtnStatus) {
      prevPrimaryBtn.addEventListener("click", () => {
        prevBtnStatus.textContent = `Button preview clicked (${state.buttonStyle} style, ${state.radius}px radius).`;
      });
    }

    if (prevForm && prevFormMsg) {
      prevForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailField = document.getElementById("dp-prev-email");
        const val = (emailField && emailField.value.trim()) || "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          prevFormMsg.textContent = "Enter a valid sample email to test form feedback.";
          return;
        }
        prevFormMsg.textContent = `Form validated safely for ${val} (local preview only).`;
      });
    }

    // Main Playground Actions: Reset, Copy CSS, Export CSS, Share Configuration
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state = { ...DEFAULTS };
        updateAll();
        if (window.history && typeof window.history.replaceState === "function" && window.location.search) {
          window.history.replaceState({}, "", window.location.pathname);
        }
        if (prevBtnStatus) prevBtnStatus.textContent = "Click any preview control to test hover, focus, and validation.";
        if (prevFormMsg) prevFormMsg.textContent = "Local preview only—nothing is sent externally.";
        toast("Design tokens reset to default.", "info");
      });
    }

    if (copyCssBtn) {
      copyCssBtn.addEventListener("click", async () => {
        const ok = await copyText(generateCssOutput(state));
        if (ok) {
          toast("Generated CSS variables copied.", "success");
        }
      });
    }

    if (exportCssBtn) {
      exportCssBtn.addEventListener("click", () => {
        const cssText = generateCssOutput(state);
        const blob = new Blob([cssText], { type: "text/css;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "alamin-design-tokens.css";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast("Exported alamin-design-tokens.css.", "success");
      });
    }

    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        const qs = encodeShareParams(state);
        const shareUrl = `${window.location.origin}${window.location.pathname}?${qs}`;
        if (window.history && typeof window.history.replaceState === "function") {
          window.history.replaceState({}, "", `?${qs}`);
        }
        const ok = await copyText(shareUrl);
        if (ok) {
          toast("Shareable configuration URL copied.", "success");
        }
      });
    }

    updateAll();
  }

  window.PortfolioDesignPlayground = {
    init,
    DEFAULTS,
    PRESETS,
    sanitizeConfig,
    generateCssOutput,
    encodeShareParams,
    parseShareParams
  };
})();
