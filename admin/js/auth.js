/**
 * AL AMIN Admin CMS — Supabase Authentication & DB-Verified Admin Check (Phase 61)
 * Security rules:
 * - Zero public account registration is exposed in the admin frontend.
 * - Uses Supabase Auth session tokens (anon key only; never stores service_role key).
 * - Admin authorization verified via public.admin_users RLS lookup, never client-only booleans.
 */
(() => {
  let adminClient = null;
  let clientSig = "";

  function getRuntimeConfig() {
    if (window.PortfolioSupabase && typeof window.PortfolioSupabase.readRuntimeConfig === "function") {
      return window.PortfolioSupabase.readRuntimeConfig();
    }
    let stored = {};
    try {
      const raw = window.localStorage.getItem("alamin_supabase_public_cfg_v1");
      if (raw) stored = JSON.parse(raw) || {};
    } catch (_err) {}
    const cfg = (window.portfolioConfig && window.portfolioConfig.supabase) || {};
    return {
      url: String(cfg.url || stored.url || "").trim().replace(/\/+$/, ""),
      anonKey: String(cfg.anonKey || stored.anonKey || "").trim(),
      storageBucket: String(cfg.storageBucket || stored.storageBucket || "portfolio-media").trim()
    };
  }

  function saveRuntimeConfig({ url, anonKey, storageBucket = "portfolio-media" }) {
    const cleanUrl = String(url || "").trim().replace(/\/+$/, "");
    const cleanAnon = String(anonKey || "").trim();
    if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}/i.test(cleanUrl)) {
      throw new Error("Please enter a valid HTTPS Supabase Project URL.");
    }
    if (cleanAnon.length < 20) {
      throw new Error("Please enter a valid Supabase anon public key.");
    }
    if (cleanAnon.toLowerCase().includes("service_role")) {
      throw new Error("Never paste a service_role key into frontend configuration. Use only the public anon key.");
    }
    window.localStorage.setItem(
      "alamin_supabase_public_cfg_v1",
      JSON.stringify({
        url: cleanUrl,
        anonKey: cleanAnon,
        storageBucket: String(storageBucket || "portfolio-media").trim(),
        cacheTtlMinutes: 5
      })
    );
    adminClient = null;
    clientSig = "";
  }

  function isConfigured() {
    const { url, anonKey } = getRuntimeConfig();
    return /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}/i.test(url) && anonKey.length > 20;
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("Supabase JS client failed to load from CDN.");
    }
    const { url, anonKey } = getRuntimeConfig();
    const sig = `${url}|${anonKey.slice(0, 16)}`;
    if (adminClient && clientSig === sig) return adminClient;

    adminClient = window.supabase.createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    clientSig = sig;
    return adminClient;
  }

  async function verifyAdminAuthorization(user) {
    const client = getClient();
    if (!client || !user || !user.id) {
      return { authorized: false, adminProfile: null, reason: "No active authenticated session." };
    }

    const { data, error } = await client
      .from("admin_users")
      .select("user_id, email, full_name, role, is_active, last_login_at")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      return {
        authorized: false,
        adminProfile: null,
        reason: error.message || "Unable to verify admin role via database RLS."
      };
    }

    if (!data || !["admin", "super_admin"].includes(data.role)) {
      return {
        authorized: false,
        adminProfile: null,
        reason: "Account is authenticated but not registered as an active administrator in public.admin_users."
      };
    }

    return { authorized: true, adminProfile: data, reason: "" };
  }

  async function signIn(email, password) {
    const client = getClient();
    if (!client) {
      throw new Error("Supabase project URL and public anon key must be configured first.");
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: String(email || "").trim(),
      password: String(password || "")
    });
    if (error) throw new Error(error.message || "Authentication failed.");

    const verification = await verifyAdminAuthorization(data.user);
    if (!verification.authorized) {
      await client.auth.signOut().catch(() => {});
      throw new Error(verification.reason || "Access denied: unauthorized account.");
    }

    await client
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("user_id", data.user.id)
      .catch(() => {});

    await client
      .from("security_events")
      .insert([{
        event_type: "admin_login_success",
        actor_email: data.user.email || "",
        status: "verified",
        details: { role: verification.adminProfile.role }
      }])
      .catch(() => {});

    return {
      session: data.session,
      user: data.user,
      adminProfile: verification.adminProfile
    };
  }

  async function sendPasswordReset(email) {
    const client = getClient();
    if (!client) throw new Error("Supabase is not configured.");
    const cleanEmail = String(email || "").trim();
    if (!cleanEmail) throw new Error("Please enter your admin email address.");
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await client.auth.resetPasswordForEmail(cleanEmail, { redirectTo });
    if (error) throw new Error(error.message || "Unable to send password reset email.");
    return true;
  }

  async function signOut(reason = "") {
    const client = getClient();
    if (client) {
      await client.auth.signOut().catch(() => {});
    }
    if (reason) {
      window.sessionStorage.setItem("admin_logout_reason", reason);
    }
  }

  async function getCurrentAdminSession() {
    if (!isConfigured()) {
      return { configured: false, session: null, user: null, adminProfile: null, error: "Supabase not configured." };
    }
    const client = getClient();
    const { data, error } = await client.auth.getSession();
    if (error || !data || !data.session || !data.session.user) {
      return { configured: true, session: null, user: null, adminProfile: null, error: error ? error.message : "" };
    }
    const verification = await verifyAdminAuthorization(data.session.user);
    if (!verification.authorized) {
      await client.auth.signOut().catch(() => {});
      return {
        configured: true,
        session: null,
        user: null,
        adminProfile: null,
        error: verification.reason
      };
    }
    return {
      configured: true,
      session: data.session,
      user: data.session.user,
      adminProfile: verification.adminProfile,
      error: ""
    };
  }

  function watchSession(onExpired) {
    const client = getClient();
    if (!client) return null;
    const { data } = client.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && typeof onExpired === "function") {
        onExpired("Session signed out or expired. Please sign in again.");
      }
    });
    return data && data.subscription ? data.subscription : null;
  }

  window.AdminAuth = {
    getRuntimeConfig,
    saveRuntimeConfig,
    isConfigured,
    getClient,
    verifyAdminAuthorization,
    signIn,
    sendPasswordReset,
    signOut,
    getCurrentAdminSession,
    watchSession
  };
})();
