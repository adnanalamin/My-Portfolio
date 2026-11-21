/**
 * AL AMIN Portfolio OS — Centralized Data: Engineering Decision Log (ADRs)
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  const CANONICAL_DECISIONS = [
    { id: "adr-001-mongodb", code: "ADR-001", title: "Why MongoDB for Telemetry Buckets & Dynamic Product Catalogs?", technologies: ["MongoDB", "Mongoose", "Node.js"] },
    { id: "adr-002-nodejs", code: "ADR-002", title: "Why Node.js & Express as the Core Backend Runtime?", technologies: ["Node.js", "Express", "JavaScript"] },
    { id: "adr-003-jwt", code: "ADR-003", title: "Why Stateless JWT with Role-Based Access Control (RBAC)?", technologies: ["JWT", "Express", "Security"] },
    { id: "adr-004-rest-api", code: "ADR-004", title: "Why Versioned REST API (/api/v1/*) Over GraphQL?", technologies: ["REST API", "Express", "Postman"] },
    { id: "adr-005-tailwind", code: "ADR-005", title: "Why Tailwind CSS + CSS Custom Properties Over Component Suites?", technologies: ["Tailwind CSS", "CSS3", "Design Systems"] },
    { id: "adr-006-hybrid-postgres-mongo", code: "ADR-006", title: "Why Hybrid PostgreSQL Order Ledgers + MongoDB Catalogs in SaaS?", technologies: ["PostgreSQL", "MongoDB", "Next.js"] },
    { id: "adr-007-redux-cart", code: "ADR-007", title: "Why Centralized Redux Toolkit State for Storefront Cart Sync?", technologies: ["React", "Redux", "JavaScript"] },
    { id: "adr-008-modular-vanilla", code: "ADR-008", title: "Why Zero-Framework Modular Vanilla JS Over an SPA Bundler?", technologies: ["JavaScript", "HTML5", "CSS3"] }
  ].map((d) => ({
    ...d,
    href: "decisions.html"
  }));

  function getDecisions() {
    if (window.PortfolioDecisions && typeof window.PortfolioDecisions.getDecisionsData === "function") {
      return window.PortfolioDecisions.getDecisionsData();
    }
    return CANONICAL_DECISIONS;
  }

  ns.decisions = CANONICAL_DECISIONS;
  ns.getDecisions = getDecisions;
})();
