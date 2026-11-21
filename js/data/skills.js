/**
 * AL AMIN Portfolio OS — Centralized Data: Skills & Core Stack
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  const CANONICAL_SKILLS = [
    { name: "HTML5", category: "Frontend", level: "Core Stack" },
    { name: "CSS3", category: "Frontend", level: "Core Stack" },
    { name: "Tailwind CSS", queryName: "Tailwind", category: "Frontend", level: "Core Stack" },
    { name: "JavaScript", category: "Frontend", level: "Core Stack" },
    { name: "React", category: "Frontend", level: "Core Stack" },
    { name: "Redux", category: "Frontend", level: "Production" },
    { name: "Next.js", category: "Frontend", level: "Production" },
    { name: "Node.js", category: "Backend", level: "Core Stack" },
    { name: "Express", category: "Backend", level: "Core Stack" },
    { name: "REST API", category: "Backend", level: "Core Stack" },
    { name: "Authentication", category: "Backend", level: "Production" },
    { name: "MongoDB", category: "Database", level: "Core Stack" },
    { name: "Mongoose", category: "Database", level: "Production" },
    { name: "PostgreSQL", category: "Database", level: "Working Knowledge" },
    { name: "Git", category: "Tools", level: "Daily Workflow" },
    { name: "GitHub", category: "Tools", level: "Daily Workflow" },
    { name: "VS Code", category: "Tools", level: "Daily Workflow" },
    { name: "Postman", category: "Tools", level: "Daily Workflow" },
    { name: "Figma", category: "Design", level: "Production" },
    { name: "Responsive Design", category: "Design", level: "Core Stack" },
    { name: "SEO", category: "Other", level: "Production" },
    { name: "Performance Optimization", category: "Other", level: "Production" }
  ];

  function getSkills() {
    if (window.PortfolioSkills && Array.isArray(window.PortfolioSkills.skillsCatalog) && window.PortfolioSkills.skillsCatalog.length) {
      return window.PortfolioSkills.skillsCatalog;
    }
    return CANONICAL_SKILLS;
  }

  ns.skills = CANONICAL_SKILLS;
  ns.getSkills = getSkills;
})();
