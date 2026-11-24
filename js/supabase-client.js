/**
 * AL AMIN Portfolio OS — Public Supabase Client (Phase 65)
 * Connects public portfolio pages to Supabase REST / JS client using ONLY public anon credentials.
 * Never embeds or accepts service-role keys.
 */
(() => {
  const RUNTIME_CFG_KEY = "alamin_supabase_public_cfg_v1";
  let cachedClient = null;
  let cachedKeySig = "";

  function readRuntimeConfig() {
    const cfg = (window.portfolioConfig && window.portfolioConfig.supabase) || {};
    let stored = {};
    try {
      const raw = window.localStorage.getItem(RUNTIME_CFG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") stored = parsed;
      }
    } catch (_err) {}

    const url = String(cfg.url || stored.url || "").trim().replace(/\/+$/, "");
    const anonKey = String(cfg.anonKey || stored.anonKey || "").trim();
    const storageBucket = String(cfg.storageBucket || stored.storageBucket || "portfolio-media").trim();
    const cacheTtlMinutes = Number(cfg.cacheTtlMinutes || stored.cacheTtlMinutes || 5);

    return { url, anonKey, storageBucket, cacheTtlMinutes };
  }

  function isValidUrl(url) {
    return typeof url === "string" && /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}/i.test(url);
  }

  function isConfigured() {
    const { url, anonKey } = readRuntimeConfig();
    return isValidUrl(url) && anonKey.length > 20;
  }

  function getClient() {
    if (!isConfigured()) return null;
    const { url, anonKey } = readRuntimeConfig();
    const sig = `${url}|${anonKey.slice(0, 16)}`;
    if (cachedClient && cachedKeySig === sig) return cachedClient;

    if (window.supabase && typeof window.supabase.createClient === "function") {
      cachedClient = window.supabase.createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      cachedKeySig = sig;
      return cachedClient;
    }
    return null;
  }

  async function selectPublished(table, { orderBy = "display_order", ascending = true, limit = 100 } = {}) {
    if (!isConfigured()) return null;
    const { url, anonKey } = readRuntimeConfig();
    const client = getClient();

    if (client) {
      let query = client.from(table).select("*").eq("status", "published");
      if (orderBy) {
        query = query.order(orderBy, { ascending });
      }
      if (limit) {
        query = query.limit(limit);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message || `Failed to query ${table}`);
      return Array.isArray(data) ? data : [];
    }

    // Fallback direct REST GET using public anon key when CDN script is deferred/offline
    const params = new URLSearchParams();
    params.set("select", "*");
    params.set("status", "eq.published");
    if (orderBy) params.set("order", `${orderBy}.${ascending ? "asc" : "desc"}`);
    if (limit) params.set("limit", String(limit));

    const res = await window.fetch(`${url}/rest/v1/${encodeURIComponent(table)}?${params.toString()}`, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: "application/json"
      }
    });
    if (!res.ok) {
      throw new Error(`Supabase REST ${res.status} on ${table}`);
    }
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  }

  async function submitContact(payload) {
    if (!isConfigured()) {
      throw new Error("Supabase is not configured.");
    }
    const record = {
      name: String(payload.name || "").trim().slice(0, 120),
      email: String(payload.email || "").trim().slice(0, 180),
      subject: String(payload.subject || "").trim().slice(0, 200),
      message: String(payload.message || "").trim().slice(0, 4000),
      status: "unread",
      source_page: String(payload.sourcePage || "contact.html").slice(0, 80)
    };

    const { url, anonKey } = readRuntimeConfig();
    const client = getClient();
    if (client) {
      const { error } = await client.from("contact_submissions").insert([record]);
      if (error) throw new Error(error.message || "Contact submission rejected.");
      return { delivered: true, mode: "supabase" };
    }

    const res = await window.fetch(`${url}/rest/v1/contact_submissions`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(record)
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(errBody || `Contact submission failed (${res.status})`);
    }
    return { delivered: true, mode: "supabase" };
  }

  function getPublicAssetUrl(storagePath) {
    if (!storagePath) return "";
    if (/^https?:\/\//i.test(storagePath) || storagePath.startsWith("assets/")) return storagePath;
    const { url, storageBucket } = readRuntimeConfig();
    if (!isValidUrl(url)) return storagePath;
    const cleanPath = String(storagePath).replace(/^\/+/, "");
    return `${url}/storage/v1/object/public/${encodeURIComponent(storageBucket)}/${cleanPath}`;
  }

  window.PortfolioSupabase = {
    RUNTIME_CFG_KEY,
    readRuntimeConfig,
    isConfigured,
    getClient,
    selectPublished,
    submitContact,
    getPublicAssetUrl
  };
})();
