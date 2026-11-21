/**
 * AL AMIN Portfolio OS — Centralized Data: Personal Knowledge Base Index
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  const CANONICAL_KNOWLEDGE = [
    { id: "js-event-loop-abort-controllers", type: "Article", category: "JavaScript", title: "Coordinating Async Fetch Lifecycles with AbortController & Microtasks" },
    { id: "react-predictable-filter-state", type: "Article", category: "React", title: "Derived Filter State Without Redundant useEffect Synchronization" },
    { id: "node-structured-rest-errors", type: "Article", category: "Node.js", title: "Normalized Error Envelope & Async Boundaries in Express APIs" },
    { id: "mongodb-compound-index-rules", type: "Article", category: "MongoDB", title: "ESR Rule for Compound MongoDB Indexes in Multi-Tenant Queries" },
    { id: "css-fluid-grid-zero-cls", type: "Article", category: "CSS", title: "Intrinsic Grid Systems & Fluid Typography Across 320px to 2560px" },
    { id: "webdev-resilient-client-cache", type: "Article", category: "Web Development", title: "Network-First HTML & Safe Shell Precaching in Static Service Workers" },
    { id: "security-jwt-cookie-hardening", type: "Note", category: "Security", title: "Session Hygiene Note: Input Validation, CORS Allowlists & Secret Scope" },
    { id: "uiux-scannable-filter-bars", type: "Note", category: "UI/UX", title: "Design System Note: Clean Typography vs. Pill Enclosure Clutter" },
    { id: "ai-prompt-boundaries-note", type: "Note", category: "AI", title: "Engineering Note: Deterministic Fallbacks & Output Validation for AI UIs" },
    { id: "career-technical-case-studies", type: "Article", category: "Career", title: "Writing Engineering Case Studies Hiring Managers Actually Read" },
    { id: "devnotes-explain-checklist", type: "Note", category: "Development Notes", title: "Pre-Ship Verification Checklist (HTML, Accessibility, CSS & Build)" }
  ].map((entry) => ({
    ...entry,
    href: `knowledge.html?entry=${encodeURIComponent(entry.id)}`
  }));

  function getKnowledgeEntries() {
    if (window.PortfolioKnowledge && Array.isArray(window.PortfolioKnowledge.ENTRIES) && window.PortfolioKnowledge.ENTRIES.length) {
      return window.PortfolioKnowledge.ENTRIES.map((e) => ({
        ...e,
        href: `knowledge.html?entry=${encodeURIComponent(e.id)}`
      }));
    }
    return CANONICAL_KNOWLEDGE;
  }

  ns.knowledge = CANONICAL_KNOWLEDGE;
  ns.getKnowledgeEntries = getKnowledgeEntries;
})();
