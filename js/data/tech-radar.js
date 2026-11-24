/**
 * AL AMIN Portfolio OS — Centralized Data: Technology Radar (Phase 56)
 * Derived strictly from configured portfolio skills, projects, ADRs, and experience.
 * Never fabricates proficiency.
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  const TECH_RADAR_DATA = [
    // Frontend Quadrant
    {
      name: "React",
      category: "Frontend",
      status: "Core",
      relatedProjects: ["AstraPulse", "Nexora", "SLIDEVERSE", "School Management System", "E-commerce SaaS"],
      relatedSkills: ["JavaScript", "Redux", "Next.js", "Tailwind CSS"],
      description: "Primary UI library used across dashboards, headless storefronts, and SaaS interfaces (Core Stack)."
    },
    {
      name: "JavaScript",
      category: "Frontend",
      status: "Core",
      relatedProjects: ["SLIDEVERSE", "AL AMIN Portfolio OS", "AstraPulse", "Nexora"],
      relatedSkills: ["HTML5", "CSS3", "React", "Node.js"],
      description: "ES2024 client and server language powering modular UI engines and APIs (Core Stack)."
    },
    {
      name: "HTML5 & CSS3",
      category: "Frontend",
      status: "Core",
      relatedProjects: ["AL AMIN Portfolio OS", "SLIDEVERSE"],
      relatedSkills: ["Responsive Design", "Tailwind CSS", "SEO"],
      description: "Semantic landmarks, WCAG structure, CSS custom properties, Grid, and Flexbox (Core Stack)."
    },
    {
      name: "Tailwind CSS",
      category: "Frontend",
      status: "Core",
      relatedProjects: ["AstraPulse", "Nexora", "SLIDEVERSE", "School Management System", "AL AMIN Portfolio OS"],
      relatedSkills: ["CSS3", "Responsive Design", "Figma"],
      description: "Utility-first styling paired with design tokens across dark and light modes (Core Stack)."
    },
    {
      name: "Responsive Design",
      category: "Frontend",
      status: "Core",
      relatedProjects: ["AL AMIN Portfolio OS", "AstraPulse", "Nexora"],
      relatedSkills: ["HTML5", "CSS3", "Tailwind CSS", "Performance Optimization"],
      description: "Fluid layouts validated from 320px to 2560px viewports with accessible touch targets (Core Stack)."
    },
    {
      name: "Next.js",
      category: "Frontend",
      status: "Active",
      relatedProjects: ["E-commerce SaaS"],
      relatedSkills: ["React", "SEO", "Node.js"],
      description: "React meta-framework used for multi-tenant SaaS storefronts and SEO-friendly routes (Production)."
    },
    {
      name: "Redux",
      category: "Frontend",
      status: "Active",
      relatedProjects: ["Nexora"],
      relatedSkills: ["React", "JavaScript"],
      description: "Predictable storefront cart synchronization and client state slice architecture (Production)."
    },
    {
      name: "TypeScript",
      category: "Frontend",
      status: "Learning",
      relatedProjects: ["AL AMIN Portfolio OS"],
      relatedSkills: ["JavaScript", "React", "Next.js"],
      description: "Listed in continuous learning timeline; applied for compile-time static linting while primary projects use ES2024 JS."
    },

    // Backend Quadrant
    {
      name: "Node.js",
      category: "Backend",
      status: "Core",
      relatedProjects: ["AstraPulse", "Nexora", "SLIDEVERSE", "School Management System", "E-commerce SaaS"],
      relatedSkills: ["Express", "REST API", "JavaScript"],
      description: "Asynchronous JavaScript runtime backing telemetry, commerce, and operations services (Core Stack)."
    },
    {
      name: "Express",
      category: "Backend",
      status: "Core",
      relatedProjects: ["AstraPulse", "Nexora", "School Management System", "E-commerce SaaS"],
      relatedSkills: ["Node.js", "REST API", "Authentication"],
      description: "Minimal REST routing, validation middleware, and role-based access layer (Core Stack)."
    },
    {
      name: "REST API",
      category: "Backend",
      status: "Core",
      relatedProjects: ["AstraPulse", "Nexora", "School Management System"],
      relatedSkills: ["Express", "Node.js", "Postman"],
      description: "Versioned JSON endpoint contracts (/api/v1/*) documented in ADRs (Core Stack)."
    },
    {
      name: "Authentication (JWT & RBAC)",
      category: "Backend",
      status: "Active",
      relatedProjects: ["AstraPulse", "Nexora", "School Management System"],
      relatedSkills: ["Express", "REST API"],
      description: "Stateless token verification and role permissions for multi-workspace portals (Production)."
    },
    {
      name: "WebSockets / SSE Streams",
      category: "Backend",
      status: "Exploring",
      relatedProjects: ["AstraPulse"],
      relatedSkills: ["Node.js", "REST API"],
      description: "Documented future enhancement in AstraPulse case study for live tailing logs."
    },

    // Database Quadrant
    {
      name: "MongoDB",
      category: "Database",
      status: "Core",
      relatedProjects: ["AstraPulse", "Nexora", "School Management System", "E-commerce SaaS"],
      relatedSkills: ["Mongoose", "Node.js", "Express"],
      description: "Document database for time-bucket telemetry, product catalogs, and academic records (Core Stack)."
    },
    {
      name: "Mongoose",
      category: "Database",
      status: "Active",
      relatedProjects: ["School Management System", "Nexora"],
      relatedSkills: ["MongoDB", "Node.js"],
      description: "Schema modeling, validation hooks, and compound index definitions (Production)."
    },
    {
      name: "PostgreSQL",
      category: "Database",
      status: "Learning",
      relatedProjects: ["E-commerce SaaS"],
      relatedSkills: ["MongoDB", "Node.js"],
      description: "Relational SQL storage applied to transactional order ledgers in E-commerce SaaS (Working Knowledge)."
    },

    // DevOps / Tools Quadrant
    {
      name: "Git & GitHub",
      category: "DevOps / Tools",
      status: "Active",
      relatedProjects: ["AL AMIN Portfolio OS", "SLIDEVERSE", "AstraPulse"],
      relatedSkills: ["VS Code"],
      description: "Version control, branching workflows, and public repository management (Daily Workflow)."
    },
    {
      name: "Postman & API Testing",
      category: "DevOps / Tools",
      status: "Active",
      relatedProjects: ["AstraPulse", "Nexora", "School Management System"],
      relatedSkills: ["REST API", "Express"],
      description: "Endpoint contract testing, payload verification, and auth header debugging (Daily Workflow)."
    },
    {
      name: "Figma",
      category: "DevOps / Tools",
      status: "Active",
      relatedProjects: ["AL AMIN Portfolio OS", "SLIDEVERSE", "Nexora"],
      relatedSkills: ["Tailwind CSS", "Responsive Design"],
      description: "UI prototyping and translating design specs into accessible semantic code (Production)."
    },
    {
      name: "Performance & SEO Tooling",
      category: "DevOps / Tools",
      status: "Active",
      relatedProjects: ["AL AMIN Portfolio OS", "E-commerce SaaS"],
      relatedSkills: ["HTML5", "SEO", "Performance Optimization"],
      description: "Canonical tags, Open Graph, deferred script execution, and zero-CLS layouts (Production)."
    },
    {
      name: "Automated E2E & Browser QA",
      category: "DevOps / Tools",
      status: "Exploring",
      relatedProjects: ["AL AMIN Portfolio OS", "AstraPulse"],
      relatedSkills: ["JavaScript", "Git"],
      description: "Exploring browser-level regression automation alongside existing static and VM checks."
    }
  ];

  ns.techRadar = TECH_RADAR_DATA;
  ns.getTechRadar = () => TECH_RADAR_DATA;
})();
