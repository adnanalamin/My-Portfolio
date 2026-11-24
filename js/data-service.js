/**
 * AL AMIN Portfolio OS — Unified Public Data Service (Phase 65)
 * Fetches published records from Supabase when configured, caches safe public data,
 * and falls back gracefully to cached snapshots or static PortfolioData defaults.
 */
(() => {
  const PRIVATE_TABLES = new Set([
    "contact_submissions",
    "admin_users",
    "admin_audit_logs",
    "security_events"
  ]);

  function getFallbackStatic(table) {
    const pd = window.PortfolioData || {};
    switch (table) {
      case "projects":
        return typeof pd.getProjects === "function" ? pd.getProjects() : [];
      case "skills":
        return typeof pd.getSkills === "function" ? pd.getSkills() : [];
      case "services":
        return typeof pd.getServices === "function" ? pd.getServices() : [];
      case "experiences":
        return typeof pd.getExperience === "function" ? pd.getExperience() : [];
      case "certificates":
        return typeof pd.getCertificates === "function" ? pd.getCertificates() : [];
      case "blog_posts":
        return typeof pd.getBlogPosts === "function" ? pd.getBlogPosts() : [];
      case "technologies":
        return typeof pd.getTechRadar === "function" ? pd.getTechRadar() : [];
      case "learning_items":
        return typeof pd.getLearningRoadmap === "function" ? pd.getLearningRoadmap() : [];
      default:
        return [];
    }
  }

  function normalizeRow(table, row) {
    if (!row || typeof row !== "object") return row;
    switch (table) {
      case "projects":
        return {
          ...row,
          id: row.slug || row.id,
          description: row.short_description || row.description || "",
          href: `project-details.html?id=${encodeURIComponent(row.slug || row.id)}`
        };
      case "skills":
        return {
          ...row,
          level: row.proficiency_level || row.level || "Production"
        };
      case "certificates":
        return {
          ...row,
          date: row.issue_date || row.date || "",
          credentialId: row.credential_id || row.credentialId || "",
          verificationUrl: row.verification_url || row.verificationUrl || "",
          image: row.certificate_image || row.image || "assets/images/certificates/fullstack-mern.svg"
        };
      case "technologies":
        return {
          ...row,
          category: row.quadrant || row.category || "Frontend",
          status: row.ring || row.status || "Core",
          relatedProjects: Array.isArray(row.related_projects) ? row.related_projects : [],
          relatedSkills: Array.isArray(row.related_skills) ? row.related_skills : []
        };
      case "learning_items":
        return {
          ...row,
          relatedProject: row.related_project || row.relatedProject || "",
          relatedProjectId: row.related_project_id || row.relatedProjectId || "",
          learningObjective: row.learning_objective || row.learningObjective || ""
        };
      default:
        return row;
    }
  }

  async function fetchPublicCollection(table, options = {}) {
    if (PRIVATE_TABLES.has(table)) {
      throw new Error(`Access denied: "${table}" is not a public dataset.`);
    }

    const cache = window.PortfolioCache;
    const sb = window.PortfolioSupabase;
    const cacheKey = `table_${table}`;
    const ttl = (sb && sb.readRuntimeConfig().cacheTtlMinutes) || 5;

    if (!sb || !sb.isConfigured()) {
      return {
        source: "static",
        offline: false,
        data: getFallbackStatic(table)
      };
    }

    const freshCached = cache ? cache.get(cacheKey) : null;
    if (Array.isArray(freshCached) && !options.forceRefresh) {
      return {
        source: "cache",
        offline: false,
        data: freshCached
      };
    }

    try {
      const orderBy = options.orderBy !== undefined ? options.orderBy : table === "website_settings" || table === "profile" ? "updated_at" : "display_order";
      const rows = await sb.selectPublished(table, { orderBy, ascending: options.ascending !== false });
      const normalized = rows.map((r) => normalizeRow(table, r));
      if (cache) cache.set(cacheKey, normalized, ttl);
      return {
        source: "supabase",
        offline: false,
        data: normalized
      };
    } catch (err) {
      const staleCached = cache ? cache.get(cacheKey, { allowStale: true }) : null;
      if (Array.isArray(staleCached) && staleCached.length > 0) {
        return {
          source: "stale-cache",
          offline: true,
          error: err.message,
          data: staleCached
        };
      }
      return {
        source: "fallback-static",
        offline: true,
        error: err.message,
        data: getFallbackStatic(table)
      };
    }
  }

  window.PortfolioDataService = {
    fetchPublicCollection,
    normalizeRow
  };
})();
