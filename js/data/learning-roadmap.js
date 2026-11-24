/**
 * AL AMIN Portfolio OS — Centralized Data: Technology Learning Roadmap (Phase 57)
 * Honest learning objectives connected to real portfolio projects.
 * Never fabricates completion dates or unconfigured mastery.
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  const LEARNING_ROADMAP_DATA = [
    {
      id: "lr-html-css-a11y",
      technology: "Semantic HTML5, CSS3 & Responsive Craft",
      category: "Frontend",
      currentStatus: "Completed",
      relatedProject: "AL AMIN Portfolio OS & SLIDEVERSE",
      relatedProjectId: "portfolio-system",
      learningObjective: "Ship responsive 320px–2560px layouts with semantic landmarks, keyboard navigation, and dark/light CSS tokens.",
      resources: ["MDN Web Docs (HTML & CSS Grid)", "WCAG Accessibility Guidelines"],
      notes: "Applied directly across multi-page responsive architecture and print views (configured Core Stack).",
      progress: 100
    },
    {
      id: "lr-mern-core",
      technology: "Full-Stack MERN Engineering (MongoDB, Express, React, Node.js)",
      category: "Full-Stack",
      currentStatus: "Completed",
      relatedProject: "AstraPulse & Nexora",
      relatedProjectId: "astrapulse",
      learningObjective: "Design versioned REST APIs, JWT workspace authorization, and indexed MongoDB collections paired with modular React UI.",
      resources: ["Official React & Node.js Documentation", "Applied Full-Stack Lab Projects"],
      notes: "Documented across AstraPulse, Nexora, and School Management System case studies (configured Core Stack).",
      progress: 100
    },
    {
      id: "lr-nextjs-saas",
      technology: "Next.js Multi-Tenant SaaS Patterns",
      category: "Frontend",
      currentStatus: "Active",
      relatedProject: "E-commerce SaaS",
      relatedProjectId: "ecommerce-saas",
      learningObjective: "Deepen SSR/hybrid routing patterns, merchant storefront isolation, and SEO metadata orchestration.",
      resources: ["Next.js App Architecture Guides", "Project Case Study ADRs"],
      notes: "Used in Production tier on E-commerce SaaS architecture.",
      progress: 80
    },
    {
      id: "lr-postgresql",
      technology: "PostgreSQL Relational Modeling & Order Ledgers",
      category: "Database",
      currentStatus: "Active",
      relatedProject: "E-commerce SaaS",
      relatedProjectId: "ecommerce-saas",
      learningObjective: "Combine relational ledger integrity in PostgreSQL with flexible catalog storage in MongoDB.",
      resources: ["PostgreSQL Indexing & Transactions Docs", "ADR-006 Architecture Note"],
      notes: "Configured honestly as 'Working Knowledge' in skills.js; continuing deeper query tuning.",
      progress: 65
    },
    {
      id: "lr-typescript",
      technology: "TypeScript Strict Application Typing",
      category: "Frontend",
      currentStatus: "Active",
      relatedProject: "AL AMIN Portfolio OS Build Pipeline",
      relatedProjectId: "portfolio-system",
      learningObjective: "Adopt strict TypeScript interfaces and generics across full-stack React and API contracts.",
      resources: ["TypeScript Handbook", "Local tsc --noEmit verification"],
      notes: "Currently listed under Modern Full-Stack & Cloud Craft continuous learning; primary shipped apps remain ES2024 JS.",
      progress: 60
    },
    {
      id: "lr-realtime-streams",
      technology: "WebSockets & Server-Sent Events (SSE) Telemetry",
      category: "Backend",
      currentStatus: "Planned",
      relatedProject: "AstraPulse",
      relatedProjectId: "astrapulse",
      learningObjective: "Extend REST polling with low-overhead push streams for real-time endpoint latency tailing.",
      resources: ["WebSockets MDN Specification", "AstraPulse Future Improvements Backlog"],
      notes: "Explicitly logged as a planned enhancement in AstraPulse case study.",
      progress: null
    },
    {
      id: "lr-container-cicd",
      technology: "Containerization & Automated E2E Regression Testing",
      category: "DevOps / Tools",
      currentStatus: "Exploring",
      relatedProject: "AstraPulse & E-commerce SaaS",
      relatedProjectId: "astrapulse",
      learningObjective: "Evaluate reproducible Docker dev environments and headless browser regression suites for release confidence.",
      resources: ["Browser Automation Guides", "Portfolio QA Checklists"],
      notes: "Exploratory phase—not claimed as production DevOps expertise yet.",
      progress: null
    }
  ];

  ns.learningRoadmap = LEARNING_ROADMAP_DATA;
  ns.getLearningRoadmap = () => LEARNING_ROADMAP_DATA;
})();
