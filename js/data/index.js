/**
 * AL AMIN Portfolio OS — Unified Data Architecture & Core Systems Registry (Phase 40)
 * Centralizes all 30 Core Systems and unified read helpers under window.PortfolioData
 * without duplicating module logic or breaking standalone HTML routes.
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  const CORE_SYSTEMS = [
    { id: "personal-brand", num: 1, title: "Personal Brand", category: "Identity", href: "index.html", icon: "sparkles" },
    { id: "client-mode", num: 2, title: "Client Mode", category: "User Modes", action: "mode:client", href: "index.html?mode=client", icon: "briefcase" },
    { id: "recruiter-mode", num: 3, title: "Recruiter Mode", category: "User Modes", action: "mode:recruiter", href: "index.html?mode=recruiter", icon: "user-check" },
    { id: "developer-dashboard", num: 4, title: "Developer Dashboard", category: "Engineering", href: "dashboard.html", icon: "layout-dashboard" },
    { id: "github-integration", num: 5, title: "GitHub Integration", category: "Open Source", href: "github.html", icon: "github" },
    { id: "project-case-studies", num: 6, title: "Project Case Studies", category: "Showcase", href: "projects.html", icon: "folder-kanban" },
    { id: "project-architect", num: 7, title: "Project Architect", category: "Planning", href: "project-architect.html", icon: "compass" },
    { id: "project-estimator", num: 8, title: "Project Estimator", category: "Planning", href: "project-estimator.html", icon: "calculator" },
    { id: "project-request", num: 9, title: "Project Request Wizard", category: "Client Intake", href: "project-request.html", icon: "send" },
    { id: "skills-graph", num: 10, title: "Skills Graph", category: "Engineering", href: "skills.html#skills-graph-section", icon: "network" },
    { id: "developer-journey", num: 11, title: "Developer Journey", category: "Background", href: "experience.html#developer-journey-section", icon: "milestone" },
    { id: "build-in-public", num: 12, title: "Build in Public", category: "Engineering", href: "build.html", icon: "hammer" },
    { id: "engineering-decisions", num: 13, title: "Engineering Decision Log", category: "Engineering", href: "decisions.html", icon: "git-branch" },
    { id: "security-center", num: 14, title: "Security Center", category: "Quality", href: "security.html", icon: "shield-check" },
    { id: "performance-center", num: 15, title: "Performance Center", category: "Quality", href: "performance.html", icon: "gauge" },
    { id: "system-architecture", num: 16, title: "System Architecture", category: "Engineering", href: "architecture.html", icon: "cpu" },
    { id: "api-explorer", num: 17, title: "API Explorer", category: "Developer Tools", href: "api-explorer.html", icon: "webhook" },
    { id: "component-laboratory", num: 18, title: "Component Laboratory", category: "Design & UI", href: "components.html", icon: "blocks" },
    { id: "design-playground", num: 19, title: "Design Playground", category: "Design & UI", href: "design-playground.html", icon: "palette" },
    { id: "proposal-generator", num: 20, title: "Proposal Generator", category: "Client Intake", href: "proposal-generator.html", icon: "file-spreadsheet" },
    { id: "resume-builder", num: 21, title: "Resume Builder", category: "Career", href: "resume.html", icon: "file-text" },
    { id: "recruiter-search", num: 22, title: "Recruiter Search", category: "Career", href: "recruiter-search.html", icon: "search-check" },
    { id: "knowledge-base", num: 23, title: "Knowledge Base", category: "Documentation", href: "knowledge.html", icon: "book-marked" },
    { id: "open-source-hub", num: 24, title: "Open Source Hub", category: "Open Source", href: "opensource.html", icon: "git-fork" },
    { id: "portfolio-assistant", num: 25, title: "Portfolio Assistant", category: "Navigation", href: "career-assistant.html", icon: "message-square" },
    { id: "code-playground", num: 26, title: "Code Playground", category: "Developer Tools", href: "playground.html", icon: "code-2" },
    { id: "command-palette", num: 27, title: "Command Palette", category: "Navigation", action: "cmd", href: "#command-palette", icon: "command" },
    { id: "accessibility-system", num: 28, title: "Accessibility System", category: "Quality", action: "prefs", href: "#accessibility", icon: "accessibility" },
    { id: "performance-mode", num: 29, title: "Performance Mode", category: "Quality", action: "prefs", href: "#performance-mode", icon: "zap" },
    { id: "theme-system", num: 30, title: "Theme System", category: "Design & UI", action: "theme", href: "#theme", icon: "sun-moon" }
  ];

  ns.coreSystems = CORE_SYSTEMS;
  ns.getSystemsDirectory = () => CORE_SYSTEMS;
  ns.getSummary = () => ({
    systemsCount: CORE_SYSTEMS.length,
    projectsCount: typeof ns.getProjects === "function" ? ns.getProjects().length : 0,
    skillsCount: typeof ns.getSkills === "function" ? ns.getSkills().length : 0,
    servicesCount: typeof ns.getServices === "function" ? ns.getServices().length : 0,
    blogCount: typeof ns.getBlogPosts === "function" ? ns.getBlogPosts().length : 0,
    knowledgeCount: typeof ns.getKnowledgeEntries === "function" ? ns.getKnowledgeEntries().length : 0,
    componentsCount: typeof ns.getComponentCategories === "function" ? ns.getComponentCategories().length : 0,
    decisionsCount: typeof ns.getDecisions === "function" ? ns.getDecisions().length : 0
  });
})();
