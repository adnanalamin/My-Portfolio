/**
 * AL AMIN Portfolio — Sample/Demo Testimonials & Touch Slider (Phase 9)
 * Clearly marked demo data ready to be replaced with verified client feedback.
 */

const PortfolioTestimonials = (() => {
  const testimonialsData = [
    {
      id: "demo-1",
      name: "Sample Reviewer A",
      role: "Product Lead (Demo)",
      company: "Demo SaaS Workspace",
      image: "assets/images/avatars/demo-1.svg",
      rating: 5,
      review:
        "Sample testimonial illustrating full-stack collaboration feedback: structured REST API delivery, clean React component architecture, and responsive dashboard performance across mobile and desktop screens.",
      isDemo: true
    },
    {
      id: "demo-2",
      name: "Sample Reviewer B",
      role: "Operations Director (Demo)",
      company: "Demo Commerce Studio",
      image: "assets/images/avatars/demo-2.svg",
      rating: 5,
      review:
        "Sample testimonial illustrating storefront engineering feedback: rebuilt product filtering, streamlined checkout drawer interactions, and improved mobile load speed without sacrificing visual polish.",
      isDemo: true
    },
    {
      id: "demo-3",
      name: "Sample Reviewer C",
      role: "Academic Coordinator (Demo)",
      company: "Demo Education Portal",
      image: "assets/images/avatars/demo-3.svg",
      rating: 5,
      review:
        "Sample testimonial illustrating portal development feedback: clear role-based workflows, readable attendance and reporting tables on tablets, and dependable release milestones.",
      isDemo: true
    },
    {
      id: "demo-4",
      name: "Sample Reviewer D",
      role: "Creative Director (Demo)",
      company: "Demo Design Collective",
      image: "assets/images/avatars/demo-4.svg",
      rating: 5,
      review:
        "Sample testimonial illustrating UI/UX implementation feedback: faithful translation of Figma tokens into semantic HTML/CSS, dark and light theme consistency, and accessible keyboard navigation.",
      isDemo: true
    }
  ];

  const state = {
    items: testimonialsData,
    activeIndex: 0,
    isPaused: false,
    userPaused: false,
    intervalMs: 5500,
    timerId: null
  };

  function escHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function renderStars(rating) {
    const clamped = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
    const stars = Array.from({ length: 5 }, (_, idx) => {
      const filled = idx < clamped;
      return `<i data-lucide="star" class="w-4 h-4 ${filled ? "text-amber-400 fill-amber-400" : "text-[var(--muted)]"}" aria-hidden="true"></i>`;
    }).join("");

    return `
      <div class="inline-flex items-center gap-1" aria-label="Rated ${clamped} out of 5 stars">
        ${stars}
        <span class="ml-1.5 text-xs font-mono-tech text-[var(--muted)] tabular-nums">${clamped}.0 / 5</span>
      </div>
    `;
  }

  function init() {
    const root = document.getElementById("testimonials-root");
    if (!root) return;

    const sliderRegion = document.getElementById("testimonial-slider-region");
    const slideMount = document.getElementById("testimonial-slide-mount");
    const dotsMount = document.getElementById("testimonial-dots");
    const prevBtn = document.getElementById("testimonial-prev");
    const nextBtn = document.getElementById("testimonial-next");
    const pauseBtn = document.getElementById("testimonial-pause-btn");
    const counterEl = document.getElementById("testimonial-counter");
    const gridMount = document.getElementById("testimonials-overview-grid");

    function updatePauseButton() {
      if (!pauseBtn) return;
      const iconName = state.userPaused ? "play" : "pause";
      const label = state.userPaused ? "Resume Auto-Play" : "Pause Auto-Play";
      pauseBtn.setAttribute("aria-pressed", state.userPaused ? "true" : "false");
      pauseBtn.setAttribute("aria-label", label);
      pauseBtn.innerHTML = `
        <i data-lucide="${iconName}" class="w-4 h-4"></i>
        <span class="hidden sm:inline">${state.userPaused ? "Paused" : "Auto-Play"}</span>
      `;
    }

    function renderActiveSlide() {
      if (!slideMount) return;
      const item = testimonialsData[state.activeIndex];
      if (!item) return;

      slideMount.innerHTML = `
        <article class="testimonial-slide-card space-y-6 animate-fade-in">
          <div class="flex flex-wrap items-center justify-between gap-3">
            ${renderStars(item.rating)}
            <span class="text-xs font-mono-tech text-[var(--muted)]">Sample / Demo Entry</span>
          </div>

          <blockquote class="text-base sm:text-xl lg:text-2xl font-medium text-[var(--text)] leading-relaxed max-w-3xl">
            &ldquo;${escHtml(item.review)}&rdquo;
          </blockquote>

          <div class="pt-4 border-t border-[var(--border)] flex items-center gap-4">
            <img
              src="${escHtml(item.image)}"
              alt="${escHtml(item.name)}"
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-[var(--border-strong)] shrink-0"
              onerror="this.src='assets/images/profile-placeholder.svg'"
            >
            <div class="min-w-0">
              <h2 class="text-base sm:text-lg font-bold text-[var(--text)] truncate">${escHtml(item.name)}</h2>
              <p class="text-xs sm:text-sm text-[var(--muted)] truncate">
                <span>${escHtml(item.role)}</span>
                <span aria-hidden="true"> · </span>
                <span class="text-indigo-400 font-medium">${escHtml(item.company)}</span>
              </p>
            </div>
          </div>
        </article>
      `;

      if (dotsMount) {
        dotsMount.innerHTML = testimonialsData
          .map((t, idx) => {
            const isActive = idx === state.activeIndex;
            return `
              <button
                type="button"
                data-slide-dot="${idx}"
                aria-label="Show testimonial ${idx + 1}: ${escHtml(t.name)}"
                aria-current="${isActive ? "true" : "false"}"
                class="testimonial-dot ${isActive ? "is-active" : ""}"
              ></button>
            `;
          })
          .join("");

        dotsMount.querySelectorAll("[data-slide-dot]").forEach((dot) => {
          dot.addEventListener("click", () => {
            const idx = Number(dot.getAttribute("data-slide-dot") || "0");
            goToSlide(idx);
          });
        });
      }

      if (counterEl) {
        counterEl.textContent = `${state.activeIndex + 1} / ${testimonialsData.length}`;
      }

      updatePauseButton();
      refreshIcons();
    }

    function renderOverviewGrid() {
      if (!gridMount) return;
      gridMount.innerHTML = testimonialsData
        .map(
          (item, idx) => `
          <article class="glass-card hover-lift p-5 sm:p-6 flex flex-col justify-between gap-4 reveal">
            <div class="space-y-3">
              <div class="flex items-center justify-between gap-2">
                ${renderStars(item.rating)}
                <span class="text-xs font-mono-tech text-[var(--muted)]">Demo</span>
              </div>
              <p class="text-sm text-[var(--text-secondary)] leading-relaxed">
                &ldquo;${escHtml(item.review)}&rdquo;
              </p>
            </div>
            <div class="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <img
                  src="${escHtml(item.image)}"
                  alt="${escHtml(item.name)}"
                  loading="lazy"
                  class="w-10 h-10 rounded-full object-cover border border-[var(--border)] shrink-0"
                  onerror="this.src='assets/images/profile-placeholder.svg'"
                >
                <div class="min-w-0">
                  <p class="text-sm font-bold text-[var(--text)] truncate">${escHtml(item.name)}</p>
                  <p class="text-xs text-[var(--muted)] truncate">${escHtml(item.role)} · ${escHtml(item.company)}</p>
                </div>
              </div>
              <button
                type="button"
                class="text-xs font-semibold text-indigo-400 hover:text-cyan-400 shrink-0"
                data-focus-slide="${idx}"
              >
                Spotlight
              </button>
            </div>
          </article>
        `
        )
        .join("");

      gridMount.querySelectorAll("[data-focus-slide]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.getAttribute("data-focus-slide") || "0");
          goToSlide(idx);
          if (sliderRegion) {
            sliderRegion.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
      });
    }

    function goToSlide(index) {
      const len = testimonialsData.length;
      state.activeIndex = ((index % len) + len) % len;
      renderActiveSlide();
      restartAutoPlay();
    }

    function nextSlide() {
      goToSlide(state.activeIndex + 1);
    }

    function prevSlide() {
      goToSlide(state.activeIndex - 1);
    }

    function stopAutoPlay() {
      if (state.timerId) {
        window.clearInterval(state.timerId);
        state.timerId = null;
      }
    }

    function startAutoPlay() {
      stopAutoPlay();
      if (prefersReducedMotion() || state.isPaused || state.userPaused) return;
      state.timerId = window.setInterval(() => {
        state.activeIndex = (state.activeIndex + 1) % testimonialsData.length;
        renderActiveSlide();
      }, state.intervalMs);
    }

    function restartAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    if (prevBtn) prevBtn.addEventListener("click", prevSlide);
    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        state.userPaused = !state.userPaused;
        updatePauseButton();
        refreshIcons();
        if (state.userPaused) {
          stopAutoPlay();
        } else {
          startAutoPlay();
        }
      });
    }

    if (sliderRegion) {
      sliderRegion.addEventListener("mouseenter", () => {
        state.isPaused = true;
        stopAutoPlay();
      });
      sliderRegion.addEventListener("mouseleave", () => {
        state.isPaused = false;
        startAutoPlay();
      });
      sliderRegion.addEventListener("focusin", () => {
        state.isPaused = true;
        stopAutoPlay();
      });
      sliderRegion.addEventListener("focusout", (event) => {
        if (event.relatedTarget && sliderRegion.contains(event.relatedTarget)) {
          return;
        }
        state.isPaused = false;
        startAutoPlay();
      });

      sliderRegion.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          prevSlide();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          nextSlide();
        }
      });

      // Touch Swipe Support for Mobile & Tablets
      let touchStartX = 0;
      let touchStartY = 0;
      let touchDeltaX = 0;
      let touchDeltaY = 0;

      sliderRegion.addEventListener(
        "touchstart",
        (event) => {
          if (!event.touches || event.touches.length !== 1) return;
          touchStartX = event.touches[0].clientX;
          touchStartY = event.touches[0].clientY;
          touchDeltaX = 0;
          touchDeltaY = 0;
          state.isPaused = true;
          stopAutoPlay();
        },
        { passive: true }
      );

      sliderRegion.addEventListener(
        "touchmove",
        (event) => {
          if (!event.touches || event.touches.length !== 1) return;
          touchDeltaX = event.touches[0].clientX - touchStartX;
          touchDeltaY = event.touches[0].clientY - touchStartY;
        },
        { passive: true }
      );

      sliderRegion.addEventListener(
        "touchend",
        () => {
          const absX = Math.abs(touchDeltaX);
          const absY = Math.abs(touchDeltaY);
          if (absX >= 42 && absX > absY * 1.2) {
            if (touchDeltaX < 0) {
              nextSlide();
            } else {
              prevSlide();
            }
          }
          state.isPaused = false;
          startAutoPlay();
        },
        { passive: true }
      );
    }

    renderActiveSlide();
    renderOverviewGrid();
    startAutoPlay();
    mountScrollReveal();
  }

  function mountScrollReveal() {
    if (window.PortfolioAnimations) {
      window.PortfolioAnimations.initScrollReveal();
    }
  }

  return {
    init,
    state,
    testimonialsData
  };
})();

window.PortfolioTestimonials = PortfolioTestimonials;
