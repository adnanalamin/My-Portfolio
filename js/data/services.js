/**
 * AL AMIN Portfolio OS — Centralized Data: Development Services & Delivery Process
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  const SERVICES_DATA = [
    {
      slug: "full-stack-web-development",
      title: "Full-Stack Web Development",
      icon: "layers",
      summary: "End-to-end web applications engineered from responsive frontend interfaces to scalable server architectures and databases.",
      features: ["Frontend & backend unified architecture", "Clean RESTful data flow & validation", "Production deployment & CI readiness"],
      technology: ["HTML5", "CSS3", "Tailwind CSS", "JavaScript", "React", "Node.js", "MongoDB", "PostgreSQL"]
    },
    {
      slug: "mern-stack-development",
      title: "MERN Stack Development",
      icon: "database",
      summary: "Modern single-page and full-stack products powered by MongoDB, Express, React, and Node.js with predictable state management.",
      features: ["MongoDB & Mongoose schema design", "Express middleware & JWT auth", "React hooks & Redux state architecture"],
      technology: ["MongoDB", "Mongoose", "Express", "React", "Redux", "Node.js", "REST API"]
    },
    {
      slug: "frontend-development",
      title: "Frontend Development",
      icon: "code-2",
      summary: "Fast, accessible, and interactive client applications built with semantic markup, modern JavaScript, and React/Next.js.",
      features: ["Semantic HTML5 & WCAG accessibility", "Modular React & Next.js components", "Smooth compositor-only micro-interactions"],
      technology: ["HTML5", "CSS3", "JavaScript", "React", "Next.js", "Tailwind CSS"]
    },
    {
      slug: "backend-api-development",
      title: "Backend API Development",
      icon: "server",
      summary: "Secure, well-structured REST APIs with authentication, role-based access control, validation, and reliable error handling.",
      features: ["Versioned REST endpoint architecture", "JWT & session authentication flows", "Input sanitization & rate limiting"],
      technology: ["Node.js", "Express", "MongoDB", "PostgreSQL", "JWT", "Postman"]
    },
    {
      slug: "admin-dashboard-development",
      title: "Admin Dashboard Development",
      icon: "layout-dashboard",
      summary: "Data-rich operational portals featuring role permissions, sortable tables, analytics views, and streamlined CRUD workflows.",
      features: ["Role-based access & audit views", "Filterable tables & tabular metrics", "Responsive sidebar & mobile drawer UX"],
      technology: ["React", "Tailwind CSS", "Node.js", "Express", "MongoDB", "PostgreSQL"]
    },
    {
      slug: "ecommerce-development",
      title: "E-commerce Development",
      icon: "shopping-bag",
      summary: "Conversion-focused online storefronts with fast product discovery, persistent carts, checkout flows, and inventory control.",
      features: ["Filterable catalog & instant search", "Persistent cart & checkout validation", "Order tracking & inventory dashboard"],
      technology: ["React", "Next.js", "Node.js", "Express", "MongoDB", "REST API"]
    },
    {
      slug: "saas-development",
      title: "SaaS Development",
      icon: "rocket",
      summary: "Multi-tenant software platforms with onboarding flows, team workspaces, subscription readiness, and clean product UX.",
      features: ["Multi-tenant data isolation", "Workspace & team permission flows", "Scalable modular feature architecture"],
      technology: ["Next.js", "React", "Node.js", "Express", "MongoDB", "PostgreSQL", "Tailwind CSS"]
    },
    {
      slug: "website-redesign",
      title: "Website Redesign",
      icon: "refresh-cw",
      summary: "Transforming dated or cluttered websites into modern, cohesive digital experiences with stronger clarity and conversion.",
      features: ["Modern visual hierarchy & typography", "Mobile usability & navigation overhaul", "Cleaner CSS & faster asset loading"],
      technology: ["HTML5", "CSS3", "Tailwind CSS", "JavaScript", "Figma", "SEO"]
    },
    {
      slug: "responsive-web-design",
      title: "Responsive Web Design",
      icon: "smartphone",
      summary: "Mobile-first layouts engineered to adapt fluidly across phones, tablets, laptops, and ultra-wide monitors with zero overflow.",
      features: ["Tested from 320px to 2560px widths", "Touch-friendly 44px+ interactive targets", "Fluid clamp() typography & grids"],
      technology: ["CSS3", "Tailwind CSS", "Flexbox", "CSS Grid", "HTML5"]
    },
    {
      slug: "performance-optimization",
      title: "Performance Optimization",
      icon: "gauge",
      summary: "Eliminating render bottlenecks, layout shifts, and heavy bundles so pages feel instantaneous across desktop and mobile networks.",
      features: ["Core Web Vitals & CLS reduction", "Compositor-only GPU animations", "Asset compression & lazy loading"],
      technology: ["JavaScript", "CSS3", "HTML5", "Browser DevTools", "Lighthouse"]
    },
    {
      slug: "seo-friendly-development",
      title: "SEO-Friendly Development",
      icon: "search",
      summary: "Search-engine-ready site structure featuring clean semantic headings, structured metadata, fast crawlability, and social cards.",
      features: ["Semantic landmark & heading hierarchy", "Open Graph & meta tag architecture", "Clean URLs & fast initial render"],
      technology: ["HTML5", "Next.js", "Metadata APIs", "Open Graph", "Semantic Markup"]
    },
    {
      slug: "ui-ux-implementation",
      title: "UI/UX Implementation",
      icon: "pen-tool",
      summary: "Translating Figma concepts and product wireframes into living, interactive interfaces with meticulous attention to detail.",
      features: ["Figma-to-code component fidelity", "Dark & light theme token parity", "Keyboard focus & ARIA compliance"],
      technology: ["Figma", "CSS3", "Tailwind CSS", "JavaScript", "React", "Lucide Icons"]
    }
  ];

  const DELIVERY_PROCESS = [
    { step: "01", title: "Discovery", icon: "compass", summary: "Clarify business goals, target users, technical constraints, and success criteria." },
    { step: "02", title: "Planning", icon: "map", summary: "Define system architecture, data schemas, milestones, and responsive layout structure." },
    { step: "03", title: "Design", icon: "pen-tool", summary: "Establish visual tokens, component hierarchy, and interactive user flows." },
    { step: "04", title: "Development", icon: "code-2", summary: "Build modular frontend interfaces, backend APIs, and database integrations cleanly." },
    { step: "05", title: "Testing", icon: "check-circle-2", summary: "Verify responsiveness (320px–2560px), accessibility, edge cases, and zero console errors." },
    { step: "06", title: "Deployment", icon: "cloud-upload", summary: "Configure production environment, optimize assets, and ship with clean monitoring." },
    { step: "07", title: "Support", icon: "life-buoy", summary: "Provide post-launch refinements, feature iterations, and ongoing technical guidance." }
  ];

  ns.services = SERVICES_DATA;
  ns.deliveryProcess = DELIVERY_PROCESS;
  ns.getServices = () => SERVICES_DATA;
})();
