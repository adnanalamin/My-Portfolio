/**
 * AL AMIN Admin CMS — Role & Record Permissions Guard (Phase 61 & 63)
 * Enforces session verification redirects and destructive-action protections.
 */
(() => {
  async function requireAuthorizedAdmin({ loginUrl = "login.html" } = {}) {
    if (!window.AdminAuth) {
      window.location.replace(loginUrl);
      return null;
    }

    const state = await window.AdminAuth.getCurrentAdminSession();
    if (!state.configured || !state.session || !state.adminProfile) {
      if (state.error) {
        window.sessionStorage.setItem("admin_auth_error", state.error);
      }
      window.location.replace(loginUrl);
      return null;
    }

    return state;
  }

  function isSuperAdmin(adminProfile) {
    return Boolean(adminProfile && adminProfile.role === "super_admin" && adminProfile.is_active);
  }

  function canDeleteRecord(table, record) {
    if (table === "site_pages" && record && record.is_system === true) {
      return {
        allowed: true,
        requiresTypedConfirm: true,
        confirmToken: String(record.slug || "SYSTEM").trim(),
        warning: `System page "${record.slug}" is protected by a database trigger. Unpublishing/hiding it is strongly recommended instead of deleting.`
      };
    }
    return {
      allowed: true,
      requiresTypedConfirm: false,
      confirmToken: "",
      warning: ""
    };
  }

  function formatRoleBadge(role) {
    const clean = role === "super_admin" ? "Super Admin" : "Admin";
    return clean;
  }

  window.AdminPermissions = {
    requireAuthorizedAdmin,
    isSuperAdmin,
    canDeleteRecord,
    formatRoleBadge
  };
})();
