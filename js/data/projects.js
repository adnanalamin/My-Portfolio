/**
 * AL AMIN Portfolio OS — Centralized Data: Projects & Case Studies
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  const CANONICAL_PROJECTS = [
    {
      id: "astrapulse",
      slug: "astrapulse",
      title: "AstraPulse",
      category: "SaaS",
      projectType: "Full-Stack Web Application",
      developmentRole: "Lead Full-Stack MERN Developer",
      year: "2026",
      status: "Active Iteration",
      featured: true,
      technologies: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "REST API"],
      description:
        "Real-time full-stack telemetry and product analytics workspace built for engineering teams to monitor API latency, funnels, and uptime.",
      href: "project-details.html?id=astrapulse"
    },
    {
      id: "nexora",
      slug: "nexora",
      title: "Nexora",
      category: "E-commerce",
      projectType: "Headless Commerce Storefront",
      developmentRole: "Full-Stack MERN & State Architect",
      year: "2026",
      status: "Shipped Production UI",
      featured: true,
      technologies: ["MongoDB", "Express", "React", "Redux", "Node.js", "Tailwind CSS"],
      description:
        "Modular headless commerce storefront and instant slide-over checkout drawer engineered for fast catalog filtering and mobile conversion.",
      href: "project-details.html?id=nexora"
    },
    {
      id: "slideverse",
      slug: "slideverse",
      title: "SLIDEVERSE",
      category: "UI/UX",
      projectType: "Interactive Web Application",
      developmentRole: "Creator & Frontend Architect",
      year: "2026",
      status: "Active Flagship",
      featured: true,
      technologies: ["JavaScript", "HTML5", "CSS3", "React", "Tailwind CSS", "Node.js"],
      description:
        "Interactive browser-based presentation studio with live typography controls, slide transitions, and keyboard presentation mode.",
      href: "project-details.html?id=slideverse"
    },
    {
      id: "school-management-system",
      slug: "school-management-system",
      title: "School Management System",
      category: "Dashboard",
      projectType: "Role-Based Operations Portal",
      developmentRole: "Full-Stack Backend & Dashboard Engineer",
      year: "2025",
      status: "Completed System",
      featured: false,
      technologies: ["MongoDB", "Mongoose", "Express", "React", "Node.js", "Tailwind CSS"],
      description:
        "Role-based academic operations portal handling student directories, weekly attendance matrices, and GPA analytics.",
      href: "project-details.html?id=school-management-system"
    },
    {
      id: "portfolio-system",
      slug: "portfolio-system",
      title: "AL AMIN Portfolio OS",
      category: "Web Apps",
      projectType: "Modular Static Developer Platform",
      developmentRole: "System Architect & UI Engineer",
      year: "2026",
      status: "Active Platform",
      featured: true,
      technologies: ["HTML5", "CSS3", "Tailwind CSS", "JavaScript", "SEO", "Responsive Design"],
      description:
        "Zero-framework config-driven developer platform unifying 30 interactive systems across Client, Recruiter, and Developer modes.",
      href: "project-details.html?id=portfolio-system"
    },
    {
      id: "ecommerce-saas",
      slug: "ecommerce-saas",
      title: "E-commerce SaaS",
      category: "SaaS",
      projectType: "Multi-Tenant Commerce Engine",
      developmentRole: "Full-Stack Next.js & Database Engineer",
      year: "2025",
      status: "Architecture Complete",
      featured: false,
      technologies: ["Next.js", "React", "Node.js", "Express", "MongoDB", "PostgreSQL"],
      description:
        "Multi-tenant merchant storefront builder and revenue analytics console with PostgreSQL order ledgers.",
      href: "project-details.html?id=ecommerce-saas"
    }
  ];

  function getProjects() {
    if (window.PortfolioProjects && Array.isArray(window.PortfolioProjects.projectsData) && window.PortfolioProjects.projectsData.length) {
      return window.PortfolioProjects.projectsData.map((p) => ({
        ...p,
        href: p.href || `project-details.html?id=${encodeURIComponent(p.id)}`
      }));
    }
    return CANONICAL_PROJECTS;
  }

  ns.projects = CANONICAL_PROJECTS;
  ns.getProjects = getProjects;
})();
