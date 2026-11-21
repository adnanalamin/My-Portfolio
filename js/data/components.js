/**
 * AL AMIN Portfolio OS — Centralized Data: UI Component Laboratory Index
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  const CANONICAL_COMPONENTS = [
    { id: "buttons", number: "01", title: "Buttons", group: "Actions & Forms" },
    { id: "cards", number: "02", title: "Cards", group: "Data & Commerce" },
    { id: "forms", number: "03", title: "Forms", group: "Actions & Forms" },
    { id: "inputs", number: "04", title: "Inputs", group: "Actions & Forms" },
    { id: "navbar", number: "05", title: "Navbar", group: "Layout & Nav" },
    { id: "modal", number: "06", title: "Modal", group: "Overlays & Feedback" },
    { id: "dropdown", number: "07", title: "Dropdown", group: "Overlays & Feedback" },
    { id: "tabs", number: "08", title: "Tabs", group: "Layout & Nav" },
    { id: "accordion", number: "09", title: "Accordion", group: "Layout & Nav" },
    { id: "toast", number: "10", title: "Toast", group: "Overlays & Feedback" },
    { id: "alerts", number: "11", title: "Alerts", group: "Overlays & Feedback" },
    { id: "loaders", number: "12", title: "Loaders", group: "Overlays & Feedback" },
    { id: "sliders", number: "13", title: "Sliders", group: "Actions & Forms" },
    { id: "pricing-cards", number: "14", title: "Pricing Cards", group: "Data & Commerce" },
    { id: "dashboard-cards", number: "15", title: "Dashboard Cards", group: "Data & Commerce" },
    { id: "navigation", number: "16", title: "Navigation", group: "Layout & Nav" }
  ].map((c) => ({
    ...c,
    href: `components.html#lab-comp-${encodeURIComponent(c.id)}`
  }));

  function getComponentCategories() {
    if (window.PortfolioComponentLab && Array.isArray(window.PortfolioComponentLab.DEFAULT_COMPONENTS) && window.PortfolioComponentLab.DEFAULT_COMPONENTS.length) {
      return window.PortfolioComponentLab.DEFAULT_COMPONENTS.map((c) => ({
        id: c.id,
        number: c.number,
        title: c.title,
        group: c.group,
        summary: c.summary,
        href: `components.html#lab-comp-${encodeURIComponent(c.id)}`
      }));
    }
    return CANONICAL_COMPONENTS;
  }

  ns.components = CANONICAL_COMPONENTS;
  ns.getComponentCategories = getComponentCategories;
})();
