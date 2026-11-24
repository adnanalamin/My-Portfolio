/**
 * AL AMIN Admin CMS — Sidebar Sections & Hash Router (Phase 61 & 65)
 * Organizes all modules cleanly into 4 primary sections + Account footer controls.
 */
(() => {
  const NAV_SECTIONS = [
    {
      title: "Overview",
      items: [
        { key: "overview", label: "Command Center", icon: "layout-dashboard" },
        { key: "global-search", label: "Global Search", icon: "search" }
      ]
    },
    {
      title: "Content",
      items: [
        { key: "profile", label: "Profile", icon: "user-circle" },
        { key: "projects", label: "Projects", icon: "folder-kanban" },
        { key: "skills", label: "Skills", icon: "cpu" },
        { key: "services", label: "Services", icon: "layers" },
        { key: "experiences", label: "Experience", icon: "briefcase" },
        { key: "certificates", label: "Certificates", icon: "award" },
        { key: "blog_posts", label: "Blog", icon: "file-text" },
        { key: "testimonials", label: "Testimonials", icon: "message-square-quote" },
        { key: "faqs", label: "FAQ", icon: "help-circle" },
        { key: "social_links", label: "Social Links", icon: "share-2" }
      ]
    },
    {
      title: "Pages & Features",
      items: [
        { key: "page_builder", label: "Visual Page Builder", icon: "layout-template", href: "page-builder.html" },
        { key: "section_manager", label: "Section Manager", icon: "rows-3", href: "section-manager.html" },
        { key: "site_pages", label: "Page Manager", icon: "file-cog" },
        { key: "navigation_items", label: "Navigation Manager", icon: "menu" },
        { key: "office_areas", label: "Digital Office", icon: "building-2" },
        { key: "workspace_objects", label: "3D Workspace", icon: "box" },
        { key: "tour_steps", label: "Portfolio Tour", icon: "compass" },
        { key: "career_knowledge", label: "Career Assistant", icon: "bot" },
        { key: "requirement_rules", label: "Requirement Analyzer", icon: "clipboard-list" },
        { key: "resume_matcher_rules", label: "Resume Matcher", icon: "file-check-2" },
        { key: "project_recommendations", label: "Recommendations", icon: "sparkles" },
        { key: "project_dependencies", label: "Dependency Map", icon: "git-branch" },
        { key: "github_settings", label: "GitHub Config", icon: "github" },
        { key: "coding_activity_settings", label: "Coding Activity", icon: "activity" },
        { key: "terminal_commands", label: "Terminal Commands", icon: "terminal" },
        { key: "technologies", label: "Tech Radar", icon: "radar" },
        { key: "learning_items", label: "Learning Roadmap", icon: "map" },
        { key: "coding_challenges", label: "Coding Lab", icon: "code-2" },
        { key: "achievements", label: "Achievements", icon: "trophy" },
        { key: "system_endpoints", label: "System Monitor", icon: "heart-pulse" }
      ]
    },
    {
      title: "System",
      items: [
        { key: "media_library", label: "Media Library", icon: "images" },
        { key: "contact_submissions", label: "Contact Messages", icon: "mail" },
        { key: "version_history", label: "Version History", icon: "history" },
        { key: "scheduled_publishing", label: "Scheduled Publishing", icon: "clock" },
        { key: "website_settings", label: "Website Settings", icon: "sliders" },
        { key: "seo_settings", label: "SEO Manager", icon: "search-check" },
        { key: "theme_settings", label: "Theme Manager", icon: "palette" },
        { key: "security_settings", label: "Security", icon: "shield-check" },
        { key: "audit_logs", label: "Audit Log", icon: "scroll-text" },
        { key: "backup_restore", label: "Backup & Recovery", icon: "hard-drive-download", href: "backup.html" }
      ]
    },
    {
      title: "Account",
      items: [
        { key: "account_profile", label: "Admin Profile", icon: "user-check" }
      ]
    }
  ];

  function findRouteMeta(routeKey) {
    for (const section of NAV_SECTIONS) {
      const found = section.items.find((it) => it.key === routeKey);
      if (found) {
        return { sectionTitle: section.title, ...found };
      }
    }
    return { sectionTitle: "Overview", key: "overview", label: "Command Center", icon: "layout-dashboard" };
  }

  function parseHash() {
    const raw = String(window.location.hash || "").replace(/^#\/?/, "").trim();
    const qIdx = raw.indexOf("?");
    if (qIdx === -1) {
      return { routePart: raw, params: new URLSearchParams() };
    }
    return {
      routePart: raw.slice(0, qIdx).trim(),
      params: new URLSearchParams(raw.slice(qIdx + 1))
    };
  }

  function getActiveRouteKey() {
    const { routePart } = parseHash();
    if (!routePart) return "overview";
    const meta = findRouteMeta(routePart);
    return meta.key;
  }

  function getRouteParams() {
    return parseHash().params;
  }

  function navigateTo(routeKey, paramsObj = null) {
    const clean = findRouteMeta(routeKey).key;
    let queryStr = "";
    if (paramsObj && typeof paramsObj === "object") {
      const sp = new URLSearchParams();
      Object.entries(paramsObj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v) !== "") sp.set(k, String(v));
      });
      const serialized = sp.toString();
      if (serialized) queryStr = `?${serialized}`;
    }
    const targetHash = `#/${clean}${queryStr}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }

  window.AdminRouter = {
    NAV_SECTIONS,
    findRouteMeta,
    getActiveRouteKey,
    getRouteParams,
    navigateTo
  };
})();
