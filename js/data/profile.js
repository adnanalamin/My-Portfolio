/**
 * AL AMIN Portfolio OS — Centralized Data: Profile & System Configuration
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  function getProfile() {
    const cfg = window.portfolioConfig || {};
    const brand = cfg.brand || {};
    const routes = window.siteRoutes || {};

    return {
      name: brand.displayName || cfg.name || "AL AMIN",
      role: brand.professionalTitle || cfg.role || "Full-Stack Developer & Creative Designer",
      shortTagline: brand.shortTagline || cfg.bio || "Engineering scalable web systems with refined interface craft.",
      location: brand.location || cfg.location || "Bangladesh",
      email: brand.email || cfg.email || "your-email@example.com",
      resumeUrl: (brand.resume && brand.resume.url) || cfg.resumeUrl || "assets/documents/resume.pdf",
      availabilityStatus: cfg.availabilityStatus || "freelance",
      websiteStatus: cfg.websiteStatus || "freelance",
      currentFocus: brand.currentFocus || "Full-Stack MERN, Next.js & Design Systems",
      languages: [
        { name: "Bengali", level: "Native Proficiency" },
        { name: "English", level: "Professional Working Proficiency" }
      ],
      social: {
        ...(cfg.socialLinks || {}),
        ...(brand.social || {})
      },
      github: {
        ...(cfg.github || {})
      },
      modes: ["default", "client", "recruiter", "developer"],
      routes
    };
  }

  ns.getProfile = getProfile;
})();
