/**
 * AL AMIN Portfolio OS — Centralized Data: GitHub & Open Source Metadata
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  function getGitHubData() {
    const cfg = window.portfolioConfig || {};
    const ghCfg = cfg.github || {};
    const username = ghCfg.username || "";

    return {
      username,
      apiBaseUrl: ghCfg.apiBaseUrl || "https://api.github.com",
      featuredRepos: Array.isArray(ghCfg.featuredRepos) ? ghCfg.featuredRepos : ["SLIDEVERSE", "AstraPulse"],
      flagship: {
        name: "SLIDEVERSE",
        category: "UI/UX & Open Source",
        description:
          "Browser-based presentation studio engineered with clean vanilla JavaScript, keyboard navigation, responsive slide canvas scaling, and design token theming.",
        technologies: ["JavaScript", "HTML5", "CSS3", "Tailwind CSS"],
        liveUrl: "project-details.html?id=slideverse",
        hubUrl: "opensource.html"
      }
    };
  }

  ns.getGitHubData = getGitHubData;
})();
