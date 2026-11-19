/**
 * AL AMIN Portfolio — Scroll, Role Cycler, Counters & Desktop Workspace Interactions (Phase 1 + Phase 3)
 */

const PortfolioAnimations = (() => {
  function prefersReducedMotion() {
    const root = document.documentElement;
    if (root && root.classList.contains("a11y-reduce-motion")) {
      return true;
    }
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function isPerformanceMode() {
    const root = document.documentElement;
    return Boolean(root && root.classList.contains("perf-mode"));
  }

  function isDesktopFinePointer() {
    return (
      window.innerWidth >= 1024 &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !prefersReducedMotion() &&
      !isPerformanceMode()
    );
  }

  function revealAll(elements) {
    elements.forEach((el) => el.classList.add("is-visible"));
  }

  function initScrollReveal() {
    const revealElements = Array.from(document.querySelectorAll(".reveal"));
    if (revealElements.length === 0) return;

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      revealAll(revealElements);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -24px 0px"
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  /* ========================================================================
     Phase 3: Role Typing / Cycling Animation (Vanilla JS)
     ======================================================================== */

  function initRoleCycler() {
    const el = document.getElementById("hero-role-cycler");
    if (!el || el.dataset.cyclerInit === "true") return;
    el.dataset.cyclerInit = "true";

    const roles = [
      "Full-Stack Developer",
      "MERN Stack Developer",
      "Frontend Developer",
      "Backend Developer",
      "Creative Designer"
    ];

    if (prefersReducedMotion()) {
      el.textContent = roles[0];
      return;
    }

    let roleIndex = 0;
    let charIndex = roles[0].length;
    let isDeleting = false;

    el.textContent = roles[0];

    function tick() {
      const currentRole = roles[roleIndex];

      if (!isDeleting) {
        charIndex += 1;
        el.textContent = currentRole.slice(0, charIndex);

        if (charIndex >= currentRole.length) {
          isDeleting = true;
          window.setTimeout(tick, 1850);
          return;
        }
        window.setTimeout(tick, 58);
      } else {
        charIndex -= 1;
        el.textContent = currentRole.slice(0, Math.max(0, charIndex));

        if (charIndex <= 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          window.setTimeout(tick, 280);
          return;
        }
        window.setTimeout(tick, 32);
      }
    }

    window.setTimeout(() => {
      isDeleting = true;
      tick();
    }, 1850);
  }

  /* ========================================================================
     Phase 3: Animated Stat Counters
     ======================================================================== */

  function animateCounter(node) {
    if (node.dataset.counted === "true") return;
    node.dataset.counted = "true";

    const target = Number(node.getAttribute("data-counter-target") || "0");
    const suffix = node.getAttribute("data-counter-suffix") || "";

    if (prefersReducedMotion() || Number.isNaN(target)) {
      node.textContent = `${target}${suffix}`;
      return;
    }

    const duration = 1100;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(target * eased);
      node.textContent = `${currentValue}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        node.textContent = `${target}${suffix}`;
      }
    }

    window.requestAnimationFrame(step);
  }

  function initStatCounters() {
    const counters = Array.from(document.querySelectorAll("[data-counter-target]"));
    if (counters.length === 0) return;

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  /* ========================================================================
     Phase 3: Desktop-Only Hero Mouse Glow, Parallax & 3D Tilt
     ======================================================================== */

  function initHeroInteractions() {
    const heroSection = document.getElementById("hero-section");
    const mouseGlow = document.getElementById("hero-mouse-glow");
    const tiltStage = document.getElementById("hero-tilt-stage");
    const parallaxNodes = Array.from(document.querySelectorAll("[data-parallax-depth]"));

    if (!heroSection || heroSection.dataset.interactionsInit === "true") return;
    heroSection.dataset.interactionsInit = "true";

    let rafId = null;
    let pointerX = 0;
    let pointerY = 0;
    let activeRect = null;

    function resetEffects() {
      if (mouseGlow) {
        mouseGlow.style.opacity = "0";
      }
      if (tiltStage) {
        tiltStage.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg)";
      }
      parallaxNodes.forEach((node) => {
        node.style.transform = "translate3d(0px, 0px, 0px)";
      });
    }

    function applyFrame() {
      rafId = null;
      if (!isDesktopFinePointer() || !activeRect) {
        resetEffects();
        return;
      }

      const relX = pointerX - activeRect.left;
      const relY = pointerY - activeRect.top;
      const normX = (relX / activeRect.width - 0.5) * 2;
      const normY = (relY / activeRect.height - 0.5) * 2;

      if (mouseGlow) {
        mouseGlow.style.opacity = "1";
        mouseGlow.style.transform = `translate3d(${relX - 220}px, ${relY - 220}px, 0)`;
      }

      if (tiltStage) {
        const rotateY = (normX * 4.5).toFixed(2);
        const rotateX = (-normY * 4.5).toFixed(2);
        tiltStage.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }

      parallaxNodes.forEach((node) => {
        const depth = Number(node.getAttribute("data-parallax-depth") || "10");
        const moveX = (normX * depth).toFixed(2);
        const moveY = (normY * depth).toFixed(2);
        node.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });
    }

    heroSection.addEventListener(
      "mousemove",
      (event) => {
        if (!isDesktopFinePointer()) return;
        activeRect = heroSection.getBoundingClientRect();
        pointerX = event.clientX;
        pointerY = event.clientY;

        if (!rafId) {
          rafId = window.requestAnimationFrame(applyFrame);
        }
      },
      { passive: true }
    );

    heroSection.addEventListener("mouseleave", () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      resetEffects();
    });

    window.addEventListener("resize", () => {
      if (!isDesktopFinePointer()) {
        resetEffects();
      }
    });
  }

  /* ========================================================================
     Phase 4: Animated Skill Progress Bars & Circular SVG Indicators
     ======================================================================== */

  function activateProgressNode(node) {
    if (node.dataset.progressActivated === "true") return;
    node.dataset.progressActivated = "true";

    const rawRatio = Number(node.getAttribute("data-progress") || "0.8");
    const ratio = Math.max(0, Math.min(1, Number.isNaN(rawRatio) ? 0.8 : rawRatio));

    if (node.classList.contains("skill-progress-fill")) {
      node.style.setProperty("--target-scale", String(ratio));
      node.classList.add("is-filled");
    } else if (node.classList.contains("circular-ring-fill")) {
      const circumference = 201.06;
      const offset = circumference * (1 - ratio);
      node.style.strokeDashoffset = offset.toFixed(2);
    }
  }

  function initProgressIndicators(scopeRoot = document) {
    const nodes = Array.from(
      scopeRoot.querySelectorAll(".skill-progress-fill[data-progress], .circular-ring-fill[data-progress]")
    );
    if (nodes.length === 0) return;

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      nodes.forEach(activateProgressNode);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activateProgressNode(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    nodes.forEach((node) => observer.observe(node));
  }

  function init() {
    initScrollReveal();
    initRoleCycler();
    initStatCounters();
    initHeroInteractions();
    initProgressIndicators();
  }

  return {
    init,
    initScrollReveal,
    initRoleCycler,
    initStatCounters,
    initHeroInteractions,
    initProgressIndicators
  };
})();

window.PortfolioAnimations = PortfolioAnimations;
