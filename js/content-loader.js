/**
 * AL AMIN Portfolio OS — Public Content Loader & Live Hydration (Phase 65)
 * Synchronizes published Supabase website_settings, profile, and datasets with
 * public DOM slots & PortfolioData getters without breaking static layouts.
 */
(() => {
  function esc(val) {
    if (typeof window.escapeHtml === "function") return window.escapeHtml(val);
    return String(val ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function applyWebsiteSettings(settings) {
    if (!settings || typeof settings !== "object") return;
    const root = document.documentElement;
    if (settings.primary_color) root.style.setProperty("--primary", settings.primary_color);
    if (settings.secondary_color) root.style.setProperty("--secondary", settings.secondary_color);
    if (settings.accent_color) root.style.setProperty("--accent", settings.accent_color);

    if (settings.maintenance_mode === true) {
      let banner = document.getElementById("cms-maintenance-banner");
      if (!banner) {
        banner = document.createElement("div");
        banner.id = "cms-maintenance-banner";
        banner.setAttribute("role", "status");
        banner.className =
          "w-full px-4 py-2 text-center text-xs font-medium bg-amber-500/15 border-b border-amber-400/35 text-amber-300";
        banner.innerHTML = `<span>Scheduled portfolio maintenance notice: ${esc(settings.tagline || "Updates in progress.")}</span>`;
        document.body.insertBefore(banner, document.body.firstChild);
      }
    }
  }

  function applyProfileOverrides(profileRow) {
    if (!profileRow || typeof profileRow !== "object") return;
    const cfg = window.portfolioConfig;
    if (!cfg || !cfg.brand) return;

    if (profileRow.name) {
      cfg.name = profileRow.name;
      cfg.brand.name = profileRow.name;
      cfg.brand.displayName = profileRow.name;
    }
    if (profileRow.professional_title) {
      cfg.role = profileRow.professional_title;
      cfg.brand.professionalTitle = profileRow.professional_title;
    }
    if (profileRow.short_bio) {
      cfg.bio = profileRow.short_bio;
      cfg.brand.shortTagline = profileRow.short_bio;
    }
    if (profileRow.full_bio) cfg.brand.longTagline = profileRow.full_bio;
    if (profileRow.location) {
      cfg.location = profileRow.location;
      cfg.brand.location = profileRow.location;
    }
    if (profileRow.email) {
      cfg.email = profileRow.email;
      cfg.brand.email = profileRow.email;
    }
    if (profileRow.resume_url) {
      cfg.resumeUrl = profileRow.resume_url;
      if (cfg.brand.resume) cfg.brand.resume.url = profileRow.resume_url;
    }
    if (profileRow.social_links && typeof profileRow.social_links === "object") {
      cfg.socialLinks = { ...cfg.socialLinks, ...profileRow.social_links };
      cfg.brand.social = { ...cfg.brand.social, ...profileRow.social_links };
    }
  }

  function showOfflineBannerIfNeeded(isOffline) {
    if (!isOffline) return;
    if (document.getElementById("cms-offline-notice")) return;
    const notice = document.createElement("div");
    notice.id = "cms-offline-notice";
    notice.setAttribute("role", "status");
    notice.className =
      "fixed bottom-4 left-4 z-40 max-w-xs px-3.5 py-2 rounded-lg border border-amber-400/35 bg-[#0b1120]/95 text-xs text-amber-200 shadow-lg";
    notice.textContent = "Live CMS connection unavailable — displaying cached public portfolio content.";
    document.body.appendChild(notice);
    window.setTimeout(() => {
      if (notice.parentNode) notice.parentNode.removeChild(notice);
    }, 6000);
  }

  async function hydrate() {
    const ds = window.PortfolioDataService;
    const sb = window.PortfolioSupabase;
    if (!ds || !sb || !sb.isConfigured()) return;

    const pd = (window.PortfolioData = window.PortfolioData || {});
    let offlineHit = false;

    const [settingsRes, profileRes, projRes, skillRes, certRes, techRes, roadRes, pageSectionsRes] = await Promise.all([
      ds.fetchPublicCollection("website_settings", { orderBy: "id" }),
      ds.fetchPublicCollection("profile", { orderBy: "updated_at", ascending: false }),
      ds.fetchPublicCollection("projects"),
      ds.fetchPublicCollection("skills"),
      ds.fetchPublicCollection("certificates"),
      ds.fetchPublicCollection("technologies"),
      ds.fetchPublicCollection("learning_items"),
      ds.fetchPublicCollection("page_sections", { orderBy: "sort_order", ascending: true })
    ]);

    [settingsRes, profileRes, projRes, skillRes, certRes, techRes, roadRes, pageSectionsRes].forEach((r) => {
      if (r && r.offline) offlineHit = true;
    });

    if (settingsRes.data && settingsRes.data[0]) applyWebsiteSettings(settingsRes.data[0]);
    if (profileRes.data && profileRes.data[0]) applyProfileOverrides(profileRes.data[0]);

    if (Array.isArray(projRes.data) && projRes.data.length > 0 && projRes.source !== "static") {
      pd.projects = projRes.data;
      pd.getProjects = () => projRes.data;
    }
    if (Array.isArray(skillRes.data) && skillRes.data.length > 0 && skillRes.source !== "static") {
      pd.skills = skillRes.data;
      pd.getSkills = () => skillRes.data;
    }
    if (Array.isArray(certRes.data) && certRes.data.length > 0 && certRes.source !== "static") {
      pd.certificates = certRes.data;
      pd.getCertificates = () => certRes.data;
    }
    if (Array.isArray(techRes.data) && techRes.data.length > 0 && techRes.source !== "static") {
      pd.techRadar = techRes.data;
      pd.getTechRadar = () => techRes.data;
    }
    if (Array.isArray(roadRes.data) && roadRes.data.length > 0 && roadRes.source !== "static") {
      pd.learningRoadmap = roadRes.data;
      pd.getLearningRoadmap = () => roadRes.data;
    }

    if (
      Array.isArray(pageSectionsRes.data) &&
      pageSectionsRes.data.length > 0 &&
      window.PortfolioSectionRegistry
    ) {
      const currentPageSlug = window.location.pathname.split("/").pop() || "index.html";
      const pageSections = pageSectionsRes.data.filter(
        (s) => s.page_slug === currentPageSlug && s.enabled !== false && s.status === "published"
      );
      if (pageSections.length > 0) {
        let region = document.getElementById("cms-dynamic-sections");
        if (!region) {
          const mainEl = document.getElementById("main-content") || document.querySelector("main") || document.body;
          region = document.createElement("div");
          region.id = "cms-dynamic-sections";
          region.className = "pb-dynamic-sections-region";
          mainEl.appendChild(region);
        }
        region.innerHTML = window.PortfolioSectionRegistry.renderPage(pageSections, {
          previewMode: "live",
          interactive: false
        });
      }
    }

    if (offlineHit) {
      showOfflineBannerIfNeeded(true);
    }

    document.dispatchEvent(new CustomEvent("portfolio:cms-hydrated", { detail: { offline: offlineHit } }));
  }

  window.PortfolioContentLoader = {
    hydrate,
    applyWebsiteSettings,
    applyProfileOverrides
  };
})();
