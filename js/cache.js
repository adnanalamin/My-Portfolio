/**
 * AL AMIN Portfolio OS — Public Content TTL Cache (Phase 65)
 * Stores ONLY public published portfolio snapshots in localStorage.
 * Never caches admin credentials, tokens, or private contact submissions.
 */
(() => {
  const PREFIX = "alamin_pub_cache_v1_";
  const BLOCKED_KEYS = new Set(["contact_submissions", "admin_users", "admin_audit_logs", "security_events"]);

  function isAllowedKey(key) {
    const clean = String(key || "").trim().toLowerCase();
    return Boolean(clean) && !BLOCKED_KEYS.has(clean);
  }

  function set(key, value, ttlMinutes = 5) {
    if (!isAllowedKey(key)) return false;
    try {
      const ttlMs = Math.max(1, Number(ttlMinutes) || 5) * 60 * 1000;
      const payload = {
        ts: Date.now(),
        exp: Date.now() + ttlMs,
        data: value
      };
      window.localStorage.setItem(PREFIX + key, JSON.stringify(payload));
      return true;
    } catch (_err) {
      return false;
    }
  }

  function get(key, { allowStale = false } = {}) {
    if (!isAllowedKey(key)) return null;
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      if (!allowStale && typeof parsed.exp === "number" && Date.now() > parsed.exp) {
        return null;
      }
      return parsed.data;
    } catch (_err) {
      return null;
    }
  }

  function invalidate(key) {
    if (!key) return;
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch (_err) {}
  }

  function clearAll() {
    try {
      const toRemove = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(PREFIX)) toRemove.push(k);
      }
      toRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch (_err) {}
  }

  window.PortfolioCache = {
    set,
    get,
    invalidate,
    clearAll
  };
})();
