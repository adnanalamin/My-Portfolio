/**
 * AL AMIN Admin CMS — Main Application Controller (Phases 61–65)
 * Handles login.html authentication, dashboard.html shell, sidebar, breadcrumbs,
 * Overview metrics, Global Search, generic schema CRUD, Blog sanitized preview,
 * Media Library, Contact Messages + CSV, Backup & Restore, Security, and Audit Logs.
 */
(() => {
  const THEME_KEY = "alamin_admin_theme_v1";
  const STATE = {
    session: null,
    adminProfile: null,
    globalSearchQuery: "",
    crudState: {
      routeKey: "",
      page: 1,
      pageSize: 12,
      search: "",
      status: "all",
      category: "all",
      sortBy: "updated_at",
      ascending: false,
      selectedIds: new Set()
    }
  };

  function getEsc() {
    return window.AdminComponents ? window.AdminComponents.escapeHtml : (v) => String(v ?? "");
  }

  function notify(msg, type = "info") {
    if (window.AdminNotifications) window.AdminNotifications.notify(msg, type);
  }

  function applyTheme(nextTheme) {
    const clean = nextTheme === "light" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(clean);
    window.localStorage.setItem(THEME_KEY, clean);
    const label = document.getElementById("admin-theme-label");
    if (label) label.textContent = clean === "dark" ? "Light Mode" : "Dark Mode";
  }

  function initTheme() {
    const saved = window.localStorage.getItem(THEME_KEY);
    applyTheme(saved === "light" ? "light" : "dark");
    const btn = document.getElementById("admin-theme-toggle");
    if (btn) {
      btn.addEventListener("click", () => {
        const current = document.documentElement.classList.contains("light") ? "light" : "dark";
        applyTheme(current === "light" ? "dark" : "light");
      });
    }
  }

  function initMediaPicker(onPick) {
    const C = window.AdminComponents;
    const DB = window.AdminDatabase;
    C.showModal({
      title: "Select Media Asset",
      maxWidth: "820px",
      bodyHtml: `<div id="media-picker-body">${C.renderSkeleton(4)}</div>`,
      onMount: async ({ bodyEl, close }) => {
        const mount = bodyEl.querySelector("#media-picker-body");
        try {
          const { rows } = await DB.listRecords("media_assets", { page: 1, pageSize: 40, sortBy: "created_at", ascending: false });
          if (!rows.length) {
            mount.innerHTML = C.renderEmptyState({
              icon: "images",
              title: "No uploaded media assets yet",
              description: "Upload images or PDFs in the Media Library section first, or paste a relative assets/ path directly."
            });
            C.refreshIcons();
            return;
          }
          mount.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${rows
                .map(
                  (m) => `
                  <div class="admin-panel p-3 flex flex-col justify-between gap-2.5">
                    <div class="space-y-2">
                      ${
                        m.mime_type && m.mime_type.startsWith("image/")
                          ? `<img src="${C.escapeHtml(m.public_url)}" alt="${C.escapeHtml(m.alt_text || m.file_name)}" class="w-full h-28 object-cover rounded border border-[var(--admin-border)]">`
                          : `<div class="w-full h-28 rounded border border-[var(--admin-border)] flex items-center justify-center bg-[var(--admin-bg)]"><i data-lucide="file-text" class="w-7 h-7 text-[var(--admin-primary)]"></i></div>`
                      }
                      <p class="text-xs font-semibold truncate" title="${C.escapeHtml(m.file_name)}">${C.escapeHtml(m.file_name)}</p>
                      <p class="text-[11px] font-mono-tech text-[var(--admin-muted)]">${C.escapeHtml(m.asset_kind)} · ${(Number(m.file_size_bytes || 0) / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" class="btn-primary text-xs w-full" data-pick-url="${C.escapeHtml(m.public_url)}">Use Asset</button>
                  </div>
                `
                )
                .join("")}
            </div>
          `;
          C.refreshIcons();
          mount.querySelectorAll("[data-pick-url]").forEach((btn) => {
            btn.addEventListener("click", () => {
              const url = btn.getAttribute("data-pick-url");
              close();
              if (typeof onPick === "function") onPick(url);
            });
          });
        } catch (err) {
          mount.innerHTML = C.renderErrorState({ message: err.message });
          C.refreshIcons();
        }
      }
    });
  }

  // =========================================================================
  // LOGIN PAGE CONTROLLER (admin/login.html)
  // =========================================================================
  async function initLoginPage() {
    const loginRoot = document.getElementById("admin-login-root");
    if (!loginRoot) return;
    initTheme();

    const C = window.AdminComponents;
    const Auth = window.AdminAuth;

    const statusBanner = document.getElementById("login-status-banner");
    const setupBanner = document.getElementById("login-setup-banner");
    const form = document.getElementById("admin-login-form");
    const emailInput = document.getElementById("login-email");
    const passInput = document.getElementById("login-password");
    const submitBtn = document.getElementById("login-submit-btn");
    const togglePassBtn = document.getElementById("toggle-password-visibility");
    const resetTrigger = document.getElementById("forgot-password-trigger");
    const resetBox = document.getElementById("password-reset-box");
    const resetEmail = document.getElementById("reset-email-input");
    const resetSendBtn = document.getElementById("send-reset-btn");
    const cfgOpenBtn = document.getElementById("open-supabase-setup-btn");

    const showBanner = (msg, tone = "error") => {
      if (!statusBanner) return;
      if (!msg) {
        statusBanner.classList.add("hidden");
        statusBanner.textContent = "";
        return;
      }
      statusBanner.className = `p-3 rounded-lg border text-xs sm:text-sm ${
        tone === "success"
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : tone === "info"
          ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
          : "border-rose-500/40 bg-rose-500/10 text-rose-300"
      }`;
      statusBanner.textContent = msg;
      statusBanner.classList.remove("hidden");
    };

    const storedErr = window.sessionStorage.getItem("admin_auth_error");
    if (storedErr) {
      showBanner(storedErr, "error");
      window.sessionStorage.removeItem("admin_auth_error");
    }
    const logoutReason = window.sessionStorage.getItem("admin_logout_reason");
    if (logoutReason) {
      showBanner(logoutReason, "info");
      window.sessionStorage.removeItem("admin_logout_reason");
    }

    const syncConfigBanner = () => {
      const configured = Auth.isConfigured();
      if (setupBanner) setupBanner.classList.toggle("hidden", configured);
      if (submitBtn) submitBtn.disabled = !configured;
    };

    syncConfigBanner();

    if (Auth.isConfigured()) {
      const current = await Auth.getCurrentAdminSession().catch(() => null);
      if (current && current.session && current.adminProfile) {
        window.location.replace("dashboard.html");
        return;
      }
    }

    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener("click", () => {
        const nextType = passInput.type === "password" ? "text" : "password";
        passInput.type = nextType;
        togglePassBtn.textContent = nextType === "password" ? "Show" : "Hide";
      });
    }

    if (resetTrigger && resetBox) {
      resetTrigger.addEventListener("click", () => {
        resetBox.classList.toggle("hidden");
        if (resetEmail && emailInput && !resetEmail.value) {
          resetEmail.value = emailInput.value;
        }
      });
    }

    if (resetSendBtn && resetEmail) {
      resetSendBtn.addEventListener("click", async () => {
        try {
          resetSendBtn.disabled = true;
          await Auth.sendPasswordReset(resetEmail.value);
          showBanner("Password reset instructions sent if this admin email is registered in Supabase Auth.", "success");
        } catch (err) {
          showBanner(err.message || "Failed to trigger password reset.", "error");
        } finally {
          resetSendBtn.disabled = false;
        }
      });
    }

    if (cfgOpenBtn) {
      cfgOpenBtn.addEventListener("click", () => {
        const cur = Auth.getRuntimeConfig();
        C.showModal({
          title: "Connect Supabase Project (Public Anon Config)",
          maxWidth: "540px",
          bodyHtml: `
            <form id="supabase-cfg-form" class="space-y-4">
              <div class="admin-panel p-3 text-xs text-[var(--admin-text-secondary)]">
                Enter your <strong>Supabase Project URL</strong> and <strong>public anon key</strong>. Never enter a <code class="font-mono-tech">service_role</code> key in the browser. For permanent production deployment, also place these values in <code class="font-mono-tech">js/config.js</code>.
              </div>
              <div>
                <label class="admin-label" for="sb-url-input">Supabase Project URL</label>
                <input id="sb-url-input" type="url" class="admin-input font-mono-tech" placeholder="https://your-project-id.supabase.co" value="${C.escapeHtml(cur.url)}" required>
              </div>
              <div>
                <label class="admin-label" for="sb-anon-input">Supabase Public Anon Key</label>
                <textarea id="sb-anon-input" class="admin-textarea font-mono-tech text-xs" placeholder="eyJhbGciOi..." required>${C.escapeHtml(cur.anonKey)}</textarea>
              </div>
              <div>
                <label class="admin-label" for="sb-bucket-input">Storage Bucket Name</label>
                <input id="sb-bucket-input" type="text" class="admin-input font-mono-tech" value="${C.escapeHtml(cur.storageBucket || "portfolio-media")}">
              </div>
            </form>
          `,
          footerHtml: `
            <div class="flex justify-end gap-2">
              <button type="button" class="btn-secondary" id="sb-cfg-cancel">Cancel</button>
              <button type="submit" form="supabase-cfg-form" class="btn-primary">Save Connection</button>
            </div>
          `,
          onMount: ({ bodyEl, footerEl, close }) => {
            footerEl.querySelector("#sb-cfg-cancel").addEventListener("click", close);
            bodyEl.querySelector("#supabase-cfg-form").addEventListener("submit", (e) => {
              e.preventDefault();
              try {
                Auth.saveRuntimeConfig({
                  url: bodyEl.querySelector("#sb-url-input").value,
                  anonKey: bodyEl.querySelector("#sb-anon-input").value,
                  storageBucket: bodyEl.querySelector("#sb-bucket-input").value
                });
                close();
                syncConfigBanner();
                showBanner("Supabase project connection saved locally. You can now sign in with your admin account.", "success");
              } catch (err) {
                showBanner(err.message, "error");
              }
            });
          }
        });
      });
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        showBanner("", "info");
        if (!Auth.isConfigured()) {
          showBanner("Configure Supabase URL & public anon key first.", "error");
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = "Verifying Admin Session...";
        try {
          await Auth.signIn(emailInput.value, passInput.value);
          window.location.replace("dashboard.html");
        } catch (err) {
          showBanner(err.message || "Invalid credentials or unauthorized user.", "error");
          submitBtn.disabled = false;
          submitBtn.textContent = "Sign In to Admin CMS";
        }
      });
    }
  }

  // =========================================================================
  // DASHBOARD OVERVIEW (Phase 61)
  // =========================================================================
  async function renderOverview(mount) {
    const C = window.AdminComponents;
    const DB = window.AdminDatabase;
    mount.innerHTML = C.renderSkeleton(6);

    try {
      const { counts, recentProjects, recentPosts, recentAudits } = await DB.getDashboardStats();
      const cards = [
        { label: "Total Projects", value: counts.totalProjects, sub: `${counts.publishedProjects ?? 0} published · ${counts.draftProjects ?? 0} draft`, route: "projects", icon: "folder-kanban" },
        { label: "Blog Posts", value: counts.totalPosts, sub: `${counts.publishedPosts ?? 0} published`, route: "blog_posts", icon: "file-text" },
        { label: "Skills & Tech", value: counts.totalSkills, sub: "Configured stack items", route: "skills", icon: "cpu" },
        { label: "Services", value: counts.totalServices, sub: "Service offerings", route: "services", icon: "layers" },
        { label: "Certificates", value: counts.totalCertificates, sub: "Verified credentials", route: "certificates", icon: "award" },
        { label: "Testimonials", value: counts.totalTestimonials, sub: "Client reviews", route: "testimonials", icon: "message-square-quote" },
        { label: "Unread Inquiries", value: counts.unreadContacts, sub: "Awaiting reply", route: "contact_submissions", icon: "mail" }
      ];

      mount.innerHTML = `
        <div class="space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 class="text-xl sm:text-2xl font-bold tracking-tight">Portfolio CMS Overview</h1>
              <p class="text-xs sm:text-sm text-[var(--admin-muted)] mt-0.5">Live metrics queried directly from Supabase PostgreSQL.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="btn-primary text-xs" data-quick-route="projects">+ Manage Projects</button>
              <button type="button" class="btn-secondary text-xs" data-quick-route="blog_posts">Write Blog Post</button>
              <button type="button" class="btn-secondary text-xs" data-quick-route="media_library">Media Library</button>
              <a href="../index.html" target="_blank" rel="noopener noreferrer" class="btn-ghost text-xs">View Public Site ↗</a>
            </div>
          </div>

          <section aria-label="Database Metrics" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            ${cards
              .map(
                (card) => `
                <button type="button" data-quick-route="${C.escapeHtml(card.route)}" class="admin-card p-4 text-left hover:border-[var(--admin-primary)] transition-colors">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-medium text-[var(--admin-muted)]">${C.escapeHtml(card.label)}</span>
                    <i data-lucide="${C.escapeHtml(card.icon)}" class="w-4 h-4 text-[var(--admin-primary)]"></i>
                  </div>
                  <p class="text-2xl font-bold font-mono-tech tabular-nums mt-2">${card.value === null ? "—" : C.escapeHtml(card.value)}</p>
                  <p class="text-xs text-[var(--admin-muted)] mt-1">${C.escapeHtml(card.sub)}</p>
                </button>
              `
              )
              .join("")}
          </section>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section class="admin-card p-4 sm:p-5 space-y-3">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold">Recent Project &amp; Article Updates</h2>
                <button type="button" class="btn-ghost text-xs py-1 min-h-0" data-quick-route="projects">Open Projects</button>
              </div>
              <div class="space-y-2">
                ${
                  [...recentProjects.map((p) => ({ ...p, kind: "Project", route: "projects" })), ...recentPosts.map((b) => ({ ...b, kind: "Article", route: "blog_posts" }))]
                    .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
                    .slice(0, 6)
                    .map(
                      (item) => `
                      <div class="admin-panel px-3 py-2.5 flex items-center justify-between gap-3">
                        <div class="min-w-0">
                          <p class="text-xs sm:text-sm font-semibold truncate">${C.escapeHtml(item.title)}</p>
                          <p class="text-[11px] text-[var(--admin-muted)]">${C.escapeHtml(item.kind)} · ${item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ""}</p>
                        </div>
                        ${C.statusBadge(item.status)}
                      </div>
                    `
                    )
                    .join("") || `<p class="text-xs text-[var(--admin-muted)]">No project or blog updates recorded yet.</p>`
                }
              </div>
            </section>

            <section class="admin-card p-4 sm:p-5 space-y-3">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold">Recent Admin Activity</h2>
                <button type="button" class="btn-ghost text-xs py-1 min-h-0" data-quick-route="audit_logs">Full Audit Log</button>
              </div>
              <div class="space-y-2">
                ${
                  recentAudits
                    .map(
                      (log) => `
                      <div class="admin-panel px-3 py-2 flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <p class="text-xs font-semibold">${C.escapeHtml(log.summary || `${log.action} · ${log.module}`)}</p>
                          <p class="text-[11px] text-[var(--admin-muted)] font-mono-tech truncate">${C.escapeHtml(log.admin_email || "admin")} · ${C.escapeHtml(log.module)}</p>
                        </div>
                        <span class="text-[11px] font-mono-tech text-[var(--admin-muted)] tabular-nums shrink-0">${log.created_at ? new Date(log.created_at).toLocaleDateString() : ""}</span>
                      </div>
                    `
                    )
                    .join("") || `<p class="text-xs text-[var(--admin-muted)]">No audit events recorded yet. Every create, update, delete, or backup action is logged automatically.</p>`
                }
              </div>
            </section>
          </div>
        </div>
      `;

      mount.querySelectorAll("[data-quick-route]").forEach((btn) => {
        btn.addEventListener("click", () => {
          window.AdminRouter.navigateTo(btn.getAttribute("data-quick-route"));
        });
      });
      C.refreshIcons();
    } catch (err) {
      mount.innerHTML = C.renderErrorState({ title: "Dashboard Metrics Unavailable", message: err.message, retryId: "overview-retry" });
      const retry = document.getElementById("overview-retry");
      if (retry) retry.addEventListener("click", () => renderOverview(mount));
      C.refreshIcons();
    }
  }

  // =========================================================================
  // GLOBAL SEARCH ACROSS MODULES
  // =========================================================================
  async function renderGlobalSearch(mount, initialQuery = "") {
    const C = window.AdminComponents;
    const DB = window.AdminDatabase;
    const seedQuery = initialQuery || STATE.globalSearchQuery || "";
    mount.innerHTML = `
      <div class="space-y-5">
        <div>
          <h1 class="text-xl font-bold">Global Portfolio CMS Search</h1>
          <p class="text-xs sm:text-sm text-[var(--admin-muted)]">Search across Projects, Skills, Services, Blog Posts, Certificates, and Contact Inquiries.</p>
        </div>
        <form id="global-search-form" class="admin-card p-4 flex flex-col sm:flex-row gap-2.5">
          <input id="global-search-input" type="search" class="admin-input" placeholder="Search titles, slugs, technologies, emails..." value="${C.escapeHtml(seedQuery)}">
          <button type="submit" class="btn-primary">Search</button>
        </form>
        <div id="global-search-results"></div>
      </div>
    `;

    const resultsMount = document.getElementById("global-search-results");
    const input = document.getElementById("global-search-input");

    async function runSearch(term) {
      const q = String(term || "").trim();
      STATE.globalSearchQuery = q;
      if (!q) {
        resultsMount.innerHTML = C.renderEmptyState({ icon: "search", title: "Enter a keyword", description: "Search titles, slugs, emails, skills, or technical terms across your Supabase tables." });
        C.refreshIcons();
        return;
      }
      resultsMount.innerHTML = C.renderSkeleton(4);
      const targets = [
        { route: "projects", label: "Projects", cols: ["title", "slug", "short_description"] },
        { route: "blog_posts", label: "Blog Posts", cols: ["title", "slug", "excerpt"] },
        { route: "skills", label: "Skills", cols: ["name", "category", "description"] },
        { route: "services", label: "Services", cols: ["title", "description"] },
        { route: "certificates", label: "Certificates", cols: ["title", "issuer", "credential_id"] },
        { route: "contact_submissions", label: "Contacts", cols: ["name", "email", "subject"] }
      ];
      try {
        const batches = await Promise.all(
          targets.map(async (t) => {
            const schema = window.AdminSchemas.getSchema(t.route);
            const res = await DB.listRecords(schema.table, { page: 1, pageSize: 8, search: q, searchColumns: t.cols });
            return { ...t, rows: res.rows };
          })
        );
        const nonEmpty = batches.filter((b) => b.rows.length > 0);
        if (!nonEmpty.length) {
          resultsMount.innerHTML = C.renderEmptyState({ icon: "search-x", title: `No matches for "${q}"`, description: "Try a broader keyword or check another CMS module." });
          C.refreshIcons();
          return;
        }
        resultsMount.innerHTML = nonEmpty
          .map(
            (b) => `
            <section class="admin-card p-4 space-y-2.5 mb-3">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold">${C.escapeHtml(b.label)} (${b.rows.length})</h2>
                <button type="button" class="btn-ghost text-xs py-1 min-h-0" data-jump-route="${C.escapeHtml(b.route)}">Open Module →</button>
              </div>
              <div class="space-y-1.5">
                ${b.rows
                  .map(
                    (r) => `
                    <div class="admin-panel px-3 py-2 flex items-center justify-between gap-2 text-xs">
                      <span class="font-medium truncate">${C.escapeHtml(r.title || r.name || r.subject || r.id)}</span>
                      ${r.status ? C.statusBadge(r.status) : ""}
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </section>
          `
          )
          .join("");
        resultsMount.querySelectorAll("[data-jump-route]").forEach((btn) => {
          btn.addEventListener("click", () => window.AdminRouter.navigateTo(btn.getAttribute("data-jump-route")));
        });
        C.refreshIcons();
      } catch (err) {
        resultsMount.innerHTML = C.renderErrorState({ message: err.message });
        C.refreshIcons();
      }
    }

    document.getElementById("global-search-form").addEventListener("submit", (e) => {
      e.preventDefault();
      runSearch(input.value);
    });

    if (seedQuery) runSearch(seedQuery);
    else runSearch("");
  }

  // =========================================================================
  // RECORD FORM VALUE EXTRACTION & MODAL EDITOR (Phases 62–63)
  // =========================================================================
  function formatFieldValue(field, record, jsonContainerField) {
    let raw = record ? (jsonContainerField ? (record[jsonContainerField] || {})[field.name] : record[field.name]) : undefined;
    if (raw === undefined || raw === null) {
      if (field.type === "checkbox") return false;
      if (field.type === "json") return field.label.includes("Object") ? "{}" : "[]";
      return "";
    }
    if (field.type === "json") return JSON.stringify(raw, null, 2);
    if (field.type === "tags") return Array.isArray(raw) ? raw.join(", ") : String(raw);
    if (field.type === "datetime" && typeof raw === "string") return raw.slice(0, 16);
    return raw;
  }

  function renderFieldInput(field, value) {
    const C = window.AdminComponents;
    const id = `field-${field.name}`;
    if (field.type === "checkbox") {
      return `
        <label class="flex items-center gap-2.5 cursor-pointer py-1">
          <input id="${C.escapeHtml(id)}" name="${C.escapeHtml(field.name)}" type="checkbox" class="w-4 h-4 accent-indigo-500" ${value ? "checked" : ""}>
          <span class="text-sm font-medium">${C.escapeHtml(field.label)}</span>
        </label>
      `;
    }
    if (field.type === "select") {
      return `
        <div>
          <label class="admin-label" for="${C.escapeHtml(id)}">${C.escapeHtml(field.label)}${field.required ? " *" : ""}</label>
          <select id="${C.escapeHtml(id)}" name="${C.escapeHtml(field.name)}" class="admin-select" ${field.required ? "required" : ""}>
            ${(field.options || [])
              .map((opt) => `<option value="${C.escapeHtml(opt)}" ${String(value) === String(opt) ? "selected" : ""}>${C.escapeHtml(opt)}</option>`)
              .join("")}
          </select>
        </div>
      `;
    }
    if (field.type === "textarea" || field.type === "json") {
      return `
        <div>
          <label class="admin-label" for="${C.escapeHtml(id)}">${C.escapeHtml(field.label)}${field.required ? " *" : ""}</label>
          <textarea id="${C.escapeHtml(id)}" name="${C.escapeHtml(field.name)}" class="admin-textarea ${field.type === "json" ? "font-mono-tech text-xs" : ""}" ${field.required ? "required" : ""}>${C.escapeHtml(value)}</textarea>
        </div>
      `;
    }
    if (field.type === "media") {
      return `
        <div>
          <label class="admin-label" for="${C.escapeHtml(id)}">${C.escapeHtml(field.label)}</label>
          <div class="flex gap-2">
            <input id="${C.escapeHtml(id)}" name="${C.escapeHtml(field.name)}" type="text" class="admin-input font-mono-tech text-xs" value="${C.escapeHtml(value)}" placeholder="assets/... or Supabase Media URL">
            <button type="button" class="btn-secondary shrink-0" data-open-media-for="${C.escapeHtml(id)}">Browse Media</button>
          </div>
        </div>
      `;
    }
    if (field.type === "color") {
      return `
        <div>
          <label class="admin-label" for="${C.escapeHtml(id)}">${C.escapeHtml(field.label)}</label>
          <div class="flex items-center gap-2">
            <input id="${C.escapeHtml(id)}" name="${C.escapeHtml(field.name)}" type="color" class="h-10 w-14 rounded border border-[var(--admin-border-strong)] bg-transparent cursor-pointer" value="${C.escapeHtml(value || "#6366F1")}">
            <span class="text-xs font-mono-tech text-[var(--admin-muted)]">${C.escapeHtml(value || "#6366F1")}</span>
          </div>
        </div>
      `;
    }
    const inputType = field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "url" ? "url" : field.type === "datetime" ? "datetime-local" : "text";
    return `
      <div>
        <label class="admin-label" for="${C.escapeHtml(id)}">${C.escapeHtml(field.label)}${field.required ? " *" : ""}</label>
        <input id="${C.escapeHtml(id)}" name="${C.escapeHtml(field.name)}" type="${inputType}" class="admin-input" value="${C.escapeHtml(value)}" ${field.required ? "required" : ""}>
      </div>
    `;
  }

  function parseFormPayload(schema, formEl) {
    const payload = {};
    schema.fields.forEach((field) => {
      const el = formEl.querySelector(`[name="${field.name}"]`);
      if (!el) return;
      if (field.type === "checkbox") {
        payload[field.name] = Boolean(el.checked);
      } else if (field.type === "number") {
        const raw = el.value.trim();
        payload[field.name] = raw === "" ? null : Number(raw);
      } else if (field.type === "json") {
        const raw = el.value.trim();
        if (!raw) {
          payload[field.name] = field.label.includes("Object") ? {} : [];
        } else {
          try {
            payload[field.name] = JSON.parse(raw);
          } catch (_err) {
            throw new Error(`Invalid JSON in field "${field.label}".`);
          }
        }
      } else if (field.type === "tags") {
        const raw = el.value.trim();
        if (!raw) payload[field.name] = [];
        else if (raw.startsWith("[")) {
          try {
            payload[field.name] = JSON.parse(raw);
          } catch (_err) {
            throw new Error(`Invalid JSON array in field "${field.label}".`);
          }
        } else payload[field.name] = raw.split(",").map((s) => s.trim()).filter(Boolean);
      } else if (field.type === "datetime") {
        payload[field.name] = el.value ? new Date(el.value).toISOString() : null;
      } else {
        payload[field.name] = el.value.trim();
      }
    });
    return payload;
  }

  function openRecordEditorModal(schema, existingRecord, onSaved) {
    const C = window.AdminComponents;
    const DB = window.AdminDatabase;
    const isEdit = Boolean(existingRecord && existingRecord.id);

    const fieldsHtml = schema.fields
      .map((field) => renderFieldInput(field, formatFieldValue(field, existingRecord, schema.jsonContainerField)))
      .join("");

    const blogPreviewHtml =
      schema.customEditor === "blog"
        ? `
        <div class="admin-panel p-4 space-y-2 mt-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Sanitized Article Preview</h3>
            <button type="button" id="refresh-blog-preview" class="btn-secondary text-xs py-1 min-h-0">Update Preview</button>
          </div>
          <div id="blog-sanitized-preview" class="prose prose-invert max-w-none text-sm leading-relaxed"></div>
        </div>
      `
        : "";

    C.showModal({
      title: `${isEdit ? "Edit" : "Create"} — ${schema.title}`,
      maxWidth: "820px",
      bodyHtml: `
        <form id="schema-editor-form" class="space-y-4">
          ${schema.notice ? `<div class="admin-panel p-3 text-xs text-amber-300 border-amber-500/30">${C.escapeHtml(schema.notice)}</div>` : ""}
          <div class="grid grid-cols-1 gap-3.5">${fieldsHtml}</div>
          ${blogPreviewHtml}
        </form>
      `,
      footerHtml: `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span id="editor-form-error" class="text-xs text-rose-400"></span>
          <div class="flex items-center gap-2 ml-auto">
            <button type="button" id="editor-cancel-btn" class="btn-secondary">Cancel</button>
            <button type="submit" form="schema-editor-form" id="editor-save-btn" class="btn-primary">${isEdit ? "Save Changes" : "Create Record"}</button>
          </div>
        </div>
      `,
      onMount: ({ bodyEl, footerEl, close }) => {
        const formEl = bodyEl.querySelector("#schema-editor-form");
        const errEl = footerEl.querySelector("#editor-form-error");
        const saveBtn = footerEl.querySelector("#editor-save-btn");

        footerEl.querySelector("#editor-cancel-btn").addEventListener("click", close);

        bodyEl.querySelectorAll("[data-open-media-for]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-open-media-for");
            const targetInput = bodyEl.querySelector(`#${targetId}`);
            initMediaPicker((pickedUrl) => {
              if (targetInput) targetInput.value = pickedUrl;
            });
          });
        });

        // Auto-generate slug when creating new records if slug is empty
        if (!isEdit && schema.titleField && schema.slugField) {
          const titleIn = bodyEl.querySelector(`[name="${schema.titleField}"]`);
          const slugIn = bodyEl.querySelector(`[name="${schema.slugField}"]`);
          if (titleIn && slugIn) {
            titleIn.addEventListener("input", () => {
              if (!slugIn.dataset.touched) {
                slugIn.value = titleIn.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
              }
            });
            slugIn.addEventListener("input", () => {
              slugIn.dataset.touched = "1";
            });
          }
        }

        const previewEl = bodyEl.querySelector("#blog-sanitized-preview");
        const previewBtn = bodyEl.querySelector("#refresh-blog-preview");
        if (previewEl) {
          const updatePreview = () => {
            const rawContent = bodyEl.querySelector('[name="content"]')?.value || "";
            previewEl.innerHTML = C.sanitizeHtml(rawContent) || `<p class="text-xs text-[var(--admin-muted)]">Enter HTML or article text above to inspect sanitized preview.</p>`;
          };
          updatePreview();
          if (previewBtn) previewBtn.addEventListener("click", updatePreview);
        }

        formEl.addEventListener("submit", async (e) => {
          e.preventDefault();
          errEl.textContent = "";
          saveBtn.disabled = true;
          try {
            const payload = parseFormPayload(schema, formEl);
            if (isEdit) {
              await DB.updateRecord(schema.table, existingRecord.id, payload);
              notify(`${schema.title} updated successfully.`, "success");
            } else {
              await DB.createRecord(schema.table, payload);
              notify(`Created new entry in ${schema.title}.`, "success");
            }
            close();
            if (typeof onSaved === "function") onSaved();
          } catch (err) {
            errEl.textContent = err.message || "Failed to save record.";
            saveBtn.disabled = false;
          }
        });
      }
    });
  }

  // =========================================================================
  // SINGLETON FORM MODULE (Profile, GitHub Config, Settings, SEO, Theme)
  // =========================================================================
  async function renderSingletonModule(mount, schema) {
    const C = window.AdminComponents;
    const DB = window.AdminDatabase;
    mount.innerHTML = C.renderSkeleton(5);

    try {
      const record = await DB.getSingleton(schema.table);
      const fieldsHtml = schema.fields
        .map((f) => renderFieldInput(f, formatFieldValue(f, record, schema.jsonContainerField)))
        .join("");

      mount.innerHTML = `
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 class="text-xl font-bold">${C.escapeHtml(schema.title)}</h1>
              <p class="text-xs sm:text-sm text-[var(--admin-muted)] mt-0.5">${C.escapeHtml(schema.subtitle)}</p>
            </div>
          </div>
          <form id="singleton-form" class="admin-card p-5 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${fieldsHtml}</div>
            <div class="pt-3 border-t border-[var(--admin-border)] flex flex-wrap items-center justify-between gap-3">
              <span id="singleton-status" class="text-xs text-[var(--admin-muted)]">${record ? `Record ID: ${C.escapeHtml(record.id)}` : "Creating initial settings row on save"}</span>
              <button type="submit" id="singleton-save-btn" class="btn-primary">Save Settings</button>
            </div>
          </form>
        </div>
      `;

      const formEl = document.getElementById("singleton-form");
      formEl.querySelectorAll("[data-open-media-for]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const targetInput = formEl.querySelector(`#${btn.getAttribute("data-open-media-for")}`);
          initMediaPicker((url) => {
            if (targetInput) targetInput.value = url;
          });
        });
      });

      formEl.addEventListener("submit", async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById("singleton-save-btn");
        saveBtn.disabled = true;
        try {
          const parsed = parseFormPayload(schema, formEl);
          const payload = schema.jsonContainerField
            ? { [schema.jsonContainerField]: { ...((record && record[schema.jsonContainerField]) || {}), ...parsed } }
            : parsed;
          await DB.upsertSingleton(schema.table, record ? record.id : null, payload);
          notify(`${schema.title} saved successfully.`, "success");
          renderSingletonModule(mount, schema);
        } catch (err) {
          notify(err.message || "Failed to save settings.", "error");
          saveBtn.disabled = false;
        }
      });
      C.refreshIcons();
    } catch (err) {
      mount.innerHTML = C.renderErrorState({ message: err.message });
      C.refreshIcons();
    }
  }

  // =========================================================================
  // GENERIC DATA TABLE + MOBILE CARDS CRUD CONTROLLER
  // =========================================================================
  async function renderCrudModule(mount, routeKey, schema) {
    const C = window.AdminComponents;
    const DB = window.AdminDatabase;
    const Perms = window.AdminPermissions;

    if (STATE.crudState.routeKey !== routeKey) {
      STATE.crudState.routeKey = routeKey;
      STATE.crudState.page = 1;
      STATE.crudState.search = "";
      STATE.crudState.status = "all";
      STATE.crudState.category = "all";
      STATE.crudState.sortBy = "updated_at";
      STATE.crudState.ascending = false;
      STATE.crudState.selectedIds = new Set();
    }

    const st = STATE.crudState;

    mount.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold">${C.escapeHtml(schema.title)}</h1>
            <p class="text-xs sm:text-sm text-[var(--admin-muted)] mt-0.5">${C.escapeHtml(schema.subtitle)}</p>
          </div>
          <button type="button" id="crud-create-btn" class="btn-primary">+ New Entry</button>
        </div>

        ${schema.notice ? `<div class="admin-panel p-3 text-xs text-amber-300 border-amber-500/35">${C.escapeHtml(schema.notice)}</div>` : ""}

        <div class="admin-card p-3.5 flex flex-col lg:flex-row lg:items-center gap-2.5 justify-between">
          <div class="flex flex-col sm:flex-row gap-2 flex-1">
            <input id="crud-search-input" type="search" class="admin-input sm:max-w-xs" placeholder="Search ${C.escapeHtml(schema.title)}..." value="${C.escapeHtml(st.search)}">
            <select id="crud-status-filter" class="admin-select sm:w-40" aria-label="Filter by status">
              <option value="all">All Statuses</option>
              ${window.AdminSchemas.STATUS_OPTIONS.map((s) => `<option value="${s}" ${st.status === s ? "selected" : ""}>${s}</option>`).join("")}
            </select>
            ${
              schema.categories
                ? `<select id="crud-cat-filter" class="admin-select sm:w-44" aria-label="Filter by category">
                    <option value="all">All Categories</option>
                    ${schema.categories.map((cat) => `<option value="${C.escapeHtml(cat)}" ${st.category === cat ? "selected" : ""}>${C.escapeHtml(cat)}</option>`).join("")}
                  </select>`
                : ""
            }
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <select id="crud-sort-select" class="admin-select w-40" aria-label="Sort records">
              <option value="updated_at:desc" ${st.sortBy === "updated_at" && !st.ascending ? "selected" : ""}>Recently Updated</option>
              <option value="created_at:desc" ${st.sortBy === "created_at" && !st.ascending ? "selected" : ""}>Newest Created</option>
              ${schema.titleField ? `<option value="${C.escapeHtml(schema.titleField)}:asc" ${st.sortBy === schema.titleField && st.ascending ? "selected" : ""}>Title A–Z</option>` : ""}
            </select>
          </div>
        </div>

        <div id="crud-bulk-bar" class="hidden admin-panel px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <span id="crud-bulk-count" class="text-xs font-semibold">0 selected</span>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="btn-secondary text-xs py-1.5 min-h-0" data-bulk-status="published">Publish Selected</button>
            <button type="button" class="btn-secondary text-xs py-1.5 min-h-0" data-bulk-status="draft">Move to Draft</button>
            <button type="button" class="btn-secondary text-xs py-1.5 min-h-0" data-bulk-status="archived">Archive</button>
            <button type="button" class="btn-danger text-xs py-1.5 min-h-0" id="crud-bulk-delete">Delete Selected</button>
          </div>
        </div>

        <div id="crud-list-mount">${C.renderSkeleton(5)}</div>
      </div>
    `;

    const listMount = document.getElementById("crud-list-mount");
    const bulkBar = document.getElementById("crud-bulk-bar");
    const bulkCount = document.getElementById("crud-bulk-count");

    const syncBulkUi = () => {
      const count = st.selectedIds.size;
      bulkBar.classList.toggle("hidden", count === 0);
      if (bulkCount) bulkCount.textContent = `${count} selected`;
    };

    async function loadRows() {
      listMount.innerHTML = C.renderSkeleton(4);
      try {
        const { rows, totalCount } = await DB.listRecords(schema.table, {
          page: st.page,
          pageSize: st.pageSize,
          search: st.search,
          searchColumns: schema.searchColumns || [],
          status: st.status,
          category: st.category,
          categoryColumn: schema.categoryColumn,
          sortBy: st.sortBy,
          ascending: st.ascending
        });

        if (rows.length === 0) {
          listMount.innerHTML = C.renderEmptyState({
            icon: schema.icon || "inbox",
            title: `No entries in ${schema.title}`,
            description: "Create your first record or clear your active filters.",
            actionLabel: "+ Create Entry",
            actionId: "empty-create-btn"
          });
          const emptyBtn = document.getElementById("empty-create-btn");
          if (emptyBtn) emptyBtn.addEventListener("click", () => openRecordEditorModal(schema, null, loadRows));
          C.refreshIcons();
          return;
        }

        const totalPages = Math.max(1, Math.ceil(totalCount / st.pageSize));
        const cols = schema.columns || [{ key: schema.titleField || "id", label: "Record" }, { key: "status", label: "Status", type: "status" }];

        const desktopRowsHtml = rows
          .map((row) => {
            const checked = st.selectedIds.has(row.id) ? "checked" : "";
            const cells = cols
              .map((col) => {
                const raw = row[col.key];
                if (col.type === "status") return `<td>${C.statusBadge(raw)}</td>`;
                if (col.type === "boolean") return `<td>${raw ? "Yes" : "No"}</td>`;
                return `<td class="max-w-[240px] truncate">${C.escapeHtml(raw ?? "—")}</td>`;
              })
              .join("");

            return `
              <tr>
                <td class="w-10"><input type="checkbox" class="row-select-cb w-4 h-4 accent-indigo-500" data-row-id="${C.escapeHtml(row.id)}" ${checked} aria-label="Select row"></td>
                ${cells}
                <td class="text-right whitespace-nowrap">
                  <div class="inline-flex items-center gap-1.5">
                    <button type="button" class="btn-secondary text-xs py-1 px-2.5 min-h-[30px]" data-edit-id="${C.escapeHtml(row.id)}">Edit</button>
                    ${schema.allowDuplicate ? `<button type="button" class="btn-ghost text-xs py-1 px-2 min-h-[30px]" data-dup-id="${C.escapeHtml(row.id)}" title="Duplicate">Duplicate</button>` : ""}
                    <button type="button" class="btn-danger text-xs py-1 px-2.5 min-h-[30px]" data-del-id="${C.escapeHtml(row.id)}">Delete</button>
                  </div>
                </td>
              </tr>
            `;
          })
          .join("");

        const mobileCardsHtml = rows
          .map((row) => {
            const titleVal = row[schema.titleField] || row.title || row.name || row.label || row.id;
            return `
              <div class="admin-card p-3.5 space-y-2.5">
                <div class="flex items-start justify-between gap-2">
                  <label class="flex items-start gap-2 min-w-0">
                    <input type="checkbox" class="row-select-cb w-4 h-4 mt-0.5 accent-indigo-500" data-row-id="${C.escapeHtml(row.id)}" ${st.selectedIds.has(row.id) ? "checked" : ""}>
                    <span class="font-semibold text-sm break-words">${C.escapeHtml(titleVal)}</span>
                  </label>
                  ${row.status ? C.statusBadge(row.status) : ""}
                </div>
                <div class="flex flex-wrap gap-2 pt-1">
                  <button type="button" class="btn-secondary text-xs flex-1" data-edit-id="${C.escapeHtml(row.id)}">Edit</button>
                  ${schema.allowDuplicate ? `<button type="button" class="btn-secondary text-xs" data-dup-id="${C.escapeHtml(row.id)}">Duplicate</button>` : ""}
                  <button type="button" class="btn-danger text-xs" data-del-id="${C.escapeHtml(row.id)}">Delete</button>
                </div>
              </div>
            `;
          })
          .join("");

        listMount.innerHTML = `
          <div class="admin-card overflow-hidden admin-desktop-table">
            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th class="w-10"><input type="checkbox" id="crud-select-all" class="w-4 h-4 accent-indigo-500" aria-label="Select all on page"></th>
                    ${cols.map((c) => `<th>${C.escapeHtml(c.label)}</th>`).join("")}
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>${desktopRowsHtml}</tbody>
              </table>
            </div>
          </div>

          <div class="admin-mobile-cards">${mobileCardsHtml}</div>

          <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--admin-muted)]">
            <span class="tabular-nums">Showing page ${st.page} of ${totalPages} (${totalCount} total)</span>
            <div class="flex items-center gap-2">
              <button type="button" id="crud-prev-page" class="btn-secondary text-xs" ${st.page <= 1 ? "disabled" : ""}>Previous</button>
              <button type="button" id="crud-next-page" class="btn-secondary text-xs" ${st.page >= totalPages ? "disabled" : ""}>Next</button>
            </div>
          </div>
        `;

        const selectAll = document.getElementById("crud-select-all");
        if (selectAll) {
          selectAll.checked = rows.length > 0 && rows.every((r) => st.selectedIds.has(r.id));
          selectAll.addEventListener("change", () => {
            rows.forEach((r) => {
              if (selectAll.checked) st.selectedIds.add(r.id);
              else st.selectedIds.delete(r.id);
            });
            listMount.querySelectorAll(".row-select-cb").forEach((cb) => {
              cb.checked = st.selectedIds.has(cb.getAttribute("data-row-id"));
            });
            syncBulkUi();
          });
        }

        listMount.querySelectorAll(".row-select-cb").forEach((cb) => {
          cb.addEventListener("change", () => {
            const id = cb.getAttribute("data-row-id");
            if (cb.checked) st.selectedIds.add(id);
            else st.selectedIds.delete(id);
            syncBulkUi();
          });
        });

        listMount.querySelectorAll("[data-edit-id]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const row = rows.find((r) => String(r.id) === String(btn.getAttribute("data-edit-id")));
            if (row) openRecordEditorModal(schema, row, loadRows);
          });
        });

        listMount.querySelectorAll("[data-dup-id]").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const row = rows.find((r) => String(r.id) === String(btn.getAttribute("data-dup-id")));
            if (!row) return;
            try {
              await DB.duplicateRecord(schema.table, row, schema.titleField, schema.slugField);
              notify("Record duplicated as draft.", "success");
              loadRows();
            } catch (err) {
              notify(err.message, "error");
            }
          });
        });

        listMount.querySelectorAll("[data-del-id]").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const row = rows.find((r) => String(r.id) === String(btn.getAttribute("data-del-id")));
            if (!row) return;
            const permCheck = Perms.canDeleteRecord(schema.table, row);
            const label = row[schema.titleField] || row.title || row.name || row.slug || row.id;
            const confirmed = await C.confirmDialog({
              title: "Confirm Deletion",
              message: permCheck.warning || `Permanently delete "${label}" from ${schema.title}? You can archive or move to draft instead.`,
              confirmLabel: "Delete",
              danger: true,
              requireTypedText: permCheck.requiresTypedConfirm ? permCheck.confirmToken : ""
            });
            if (!confirmed) return;
            try {
              await DB.deleteRecord(schema.table, row.id, label);
              st.selectedIds.delete(row.id);
              syncBulkUi();
              notify(`Deleted "${label}".`, "success");
              loadRows();
            } catch (err) {
              notify(err.message, "error");
            }
          });
        });

        const prevBtn = document.getElementById("crud-prev-page");
        const nextBtn = document.getElementById("crud-next-page");
        if (prevBtn) prevBtn.addEventListener("click", () => { st.page = Math.max(1, st.page - 1); loadRows(); });
        if (nextBtn) nextBtn.addEventListener("click", () => { st.page = Math.min(totalPages, st.page + 1); loadRows(); });

        syncBulkUi();
        C.refreshIcons();
      } catch (err) {
        listMount.innerHTML = C.renderErrorState({ message: err.message, retryId: "crud-retry-btn" });
        const retry = document.getElementById("crud-retry-btn");
        if (retry) retry.addEventListener("click", loadRows);
        C.refreshIcons();
      }
    }

    document.getElementById("crud-create-btn").addEventListener("click", () => openRecordEditorModal(schema, null, loadRows));
    document.getElementById("crud-search-input").addEventListener("input", (e) => {
      st.search = e.target.value;
      st.page = 1;
      loadRows();
    });
    document.getElementById("crud-status-filter").addEventListener("change", (e) => {
      st.status = e.target.value;
      st.page = 1;
      loadRows();
    });
    const catSelect = document.getElementById("crud-cat-filter");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => {
        st.category = e.target.value;
        st.page = 1;
        loadRows();
      });
    }
    document.getElementById("crud-sort-select").addEventListener("change", (e) => {
      const [col, dir] = e.target.value.split(":");
      st.sortBy = col;
      st.ascending = dir === "asc";
      st.page = 1;
      loadRows();
    });

    mount.querySelectorAll("[data-bulk-status]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const nextStatus = btn.getAttribute("data-bulk-status");
        const ids = Array.from(st.selectedIds);
        try {
          await DB.bulkUpdateStatus(schema.table, ids, nextStatus);
          st.selectedIds.clear();
          syncBulkUi();
          notify(`Updated ${ids.length} items to "${nextStatus}".`, "success");
          loadRows();
        } catch (err) {
          notify(err.message, "error");
        }
      });
    });

    document.getElementById("crud-bulk-delete").addEventListener("click", async () => {
      const ids = Array.from(st.selectedIds);
      const confirmed = await C.confirmDialog({
        title: "Bulk Delete Confirmation",
        message: `Delete ${ids.length} selected records permanently?`,
        confirmLabel: "Delete All Selected",
        danger: true
      });
      if (!confirmed) return;
      try {
        await DB.bulkDelete(schema.table, ids);
        st.selectedIds.clear();
        syncBulkUi();
        notify(`Deleted ${ids.length} records.`, "success");
        loadRows();
      } catch (err) {
        notify(err.message, "error");
      }
    });

    await loadRows();
  }

  // =========================================================================
  // MEDIA LIBRARY CONTROLLER (Phase 64)
  // =========================================================================
  async function renderMediaLibrary(mount) {
    const C = window.AdminComponents;
    const DB = window.AdminDatabase;

    mount.innerHTML = `
      <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold">Media Library (Supabase Storage)</h1>
            <p class="text-xs sm:text-sm text-[var(--admin-muted)] mt-0.5">Allowed formats: JPEG, PNG, WebP, SVG, PDF, TXT, Markdown (max 10 MB). Executables/scripts blocked.</p>
          </div>
        </div>

        <form id="media-upload-form" class="admin-card p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label class="admin-label" for="media-file-input">Choose File</label>
            <input id="media-file-input" type="file" accept=".jpg,.jpeg,.png,.webp,.svg,.pdf,.txt,.md" class="admin-input text-xs" required>
          </div>
          <div>
            <label class="admin-label" for="media-kind-select">Asset Folder / Kind</label>
            <select id="media-kind-select" class="admin-select">
              <option value="image">Image</option>
              <option value="certificate">Certificate</option>
              <option value="resume">Resume PDF</option>
              <option value="document">Document</option>
            </select>
          </div>
          <div>
            <label class="admin-label" for="media-alt-input">Alt Text / Label</label>
            <input id="media-alt-input" type="text" class="admin-input" placeholder="e.g. AstraPulse Analytics UI">
          </div>
          <button type="submit" id="media-upload-btn" class="btn-primary w-full">Upload to Storage</button>
        </form>

        <div id="media-grid-mount">${C.renderSkeleton(4)}</div>
      </div>
    `;

    const gridMount = document.getElementById("media-grid-mount");

    async function loadMedia() {
      gridMount.innerHTML = C.renderSkeleton(3);
      try {
        const { rows } = await DB.listRecords("media_assets", { page: 1, pageSize: 60, sortBy: "created_at", ascending: false });
        if (!rows.length) {
          gridMount.innerHTML = C.renderEmptyState({
            icon: "images",
            title: "No media uploaded yet",
            description: "Upload your first image, certificate SVG, or resume PDF above."
          });
          C.refreshIcons();
          return;
        }
        gridMount.innerHTML = `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${rows
              .map(
                (asset) => `
                <article class="admin-card p-3.5 flex flex-col justify-between gap-3">
                  <div class="space-y-2.5">
                    ${
                      asset.mime_type && asset.mime_type.startsWith("image/")
                        ? `<img src="${C.escapeHtml(asset.public_url)}" alt="${C.escapeHtml(asset.alt_text || asset.file_name)}" class="w-full h-36 object-cover rounded-lg border border-[var(--admin-border)]">`
                        : `<div class="w-full h-36 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-2)] flex items-center justify-center"><i data-lucide="file-text" class="w-8 h-8 text-[var(--admin-primary)]"></i></div>`
                    }
                    <div>
                      <p class="text-sm font-semibold truncate" title="${C.escapeHtml(asset.file_name)}">${C.escapeHtml(asset.file_name)}</p>
                      <p class="text-xs font-mono-tech text-[var(--admin-muted)]">${C.escapeHtml(asset.asset_kind)} · ${(Number(asset.file_size_bytes || 0) / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2 pt-2 border-t border-[var(--admin-border)]">
                    <button type="button" class="btn-secondary text-xs flex-1" data-copy-media="${C.escapeHtml(asset.public_url)}">Copy URL</button>
                    <button type="button" class="btn-danger text-xs" data-del-media="${C.escapeHtml(asset.id)}">Delete</button>
                  </div>
                </article>
              `
              )
              .join("")}
          </div>
        `;

        gridMount.querySelectorAll("[data-copy-media]").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const url = btn.getAttribute("data-copy-media");
            await navigator.clipboard.writeText(url).catch(() => {});
            notify("Public media URL copied to clipboard.", "success");
          });
        });

        gridMount.querySelectorAll("[data-del-media]").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const asset = rows.find((r) => String(r.id) === String(btn.getAttribute("data-del-media")));
            if (!asset) return;
            const refs = await DB.checkMediaReferences(asset).catch(() => []);
            const warning = refs.length
              ? `WARNING: This file appears referenced in ${refs.join(", ")}. Deleting it may break active portfolio images.`
              : `Permanently delete "${asset.file_name}" from Supabase Storage and metadata?`;

            const ok = await C.confirmDialog({
              title: "Delete Media Asset",
              message: warning,
              confirmLabel: "Delete Asset",
              danger: true,
              requireTypedText: refs.length ? "DELETE" : ""
            });
            if (!ok) return;
            try {
              await DB.deleteMediaAsset(asset);
              notify("Media asset deleted.", "success");
              loadMedia();
            } catch (err) {
              notify(err.message, "error");
            }
          });
        });

        C.refreshIcons();
      } catch (err) {
        gridMount.innerHTML = C.renderErrorState({ message: err.message });
        C.refreshIcons();
      }
    }

    document.getElementById("media-upload-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById("media-file-input");
      const kindSelect = document.getElementById("media-kind-select");
      const altInput = document.getElementById("media-alt-input");
      const btn = document.getElementById("media-upload-btn");
      const file = fileInput.files && fileInput.files[0];
      btn.disabled = true;
      btn.textContent = "Uploading...";
      try {
        await DB.uploadMedia(file, {
          assetKind: kindSelect.value,
          altText: altInput.value
        });
        notify(`Uploaded "${file.name}".`, "success");
        e.target.reset();
        loadMedia();
      } catch (err) {
        notify(err.message, "error");
      } finally {
        btn.disabled = false;
        btn.textContent = "Upload to Storage";
      }
    });

    await loadMedia();
  }

  // =========================================================================
  // CONTACT SUBMISSION MANAGER + CSV EXPORT (Phase 64)
  // =========================================================================
  async function renderContactInbox(mount) {
    const C = window.AdminComponents;
    const DB = window.AdminDatabase;
    let statusFilter = "all";
    let searchQuery = "";

    mount.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold">Contact Submissions Inbox</h1>
            <p class="text-xs sm:text-sm text-[var(--admin-muted)] mt-0.5">Messages submitted on contact.html are stored behind strict RLS (admin-read only).</p>
          </div>
          <button type="button" id="contacts-export-csv" class="btn-secondary text-xs">Export CSV</button>
        </div>

        <div class="admin-card p-3.5 flex flex-col sm:flex-row gap-2.5">
          <input id="contacts-search" type="search" class="admin-input sm:max-w-xs" placeholder="Search sender, email, subject...">
          <select id="contacts-status" class="admin-select sm:w-44">
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div id="contacts-list-mount">${C.renderSkeleton(4)}</div>
      </div>
    `;

    const listMount = document.getElementById("contacts-list-mount");
    let currentRows = [];

    async function loadContacts() {
      listMount.innerHTML = C.renderSkeleton(3);
      try {
        const { rows } = await DB.listRecords("contact_submissions", {
          page: 1,
          pageSize: 60,
          search: searchQuery,
          searchColumns: ["name", "email", "subject", "message"],
          status: statusFilter,
          sortBy: "created_at",
          ascending: false
        });
        currentRows = rows;
        if (!rows.length) {
          listMount.innerHTML = C.renderEmptyState({
            icon: "mail",
            title: "No contact submissions found",
            description: "Visitor inquiries from contact.html will appear here once Supabase public submission is enabled."
          });
          C.refreshIcons();
          return;
        }
        listMount.innerHTML = `
          <div class="space-y-3">
            ${rows
              .map(
                (msg) => `
                <article class="admin-card p-4 space-y-2.5">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div class="min-w-0">
                      <h2 class="text-sm font-bold">${C.escapeHtml(msg.subject)}</h2>
                      <p class="text-xs text-[var(--admin-muted)]">${C.escapeHtml(msg.name)} &lt;${C.escapeHtml(msg.email)}&gt; · ${new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                    ${C.statusBadge(msg.status)}
                  </div>
                  <p class="text-xs sm:text-sm text-[var(--admin-text-secondary)] whitespace-pre-wrap">${C.escapeHtml(msg.message)}</p>
                  <div class="flex flex-wrap gap-2 pt-2 border-t border-[var(--admin-border)]">
                    ${msg.status !== "read" ? `<button type="button" class="btn-secondary text-xs py-1 min-h-0" data-msg-status="read" data-msg-id="${C.escapeHtml(msg.id)}">Mark Read</button>` : `<button type="button" class="btn-secondary text-xs py-1 min-h-0" data-msg-status="unread" data-msg-id="${C.escapeHtml(msg.id)}">Mark Unread</button>`}
                    ${msg.status !== "archived" ? `<button type="button" class="btn-secondary text-xs py-1 min-h-0" data-msg-status="archived" data-msg-id="${C.escapeHtml(msg.id)}">Archive</button>` : ""}
                    <button type="button" class="btn-danger text-xs py-1 min-h-0 ml-auto" data-msg-del="${C.escapeHtml(msg.id)}">Delete</button>
                  </div>
                </article>
              `
              )
              .join("")}
          </div>
        `;

        listMount.querySelectorAll("[data-msg-status]").forEach((btn) => {
          btn.addEventListener("click", async () => {
            try {
              await DB.updateRecord("contact_submissions", btn.getAttribute("data-msg-id"), {
                status: btn.getAttribute("data-msg-status")
              });
              notify("Message status updated.", "success");
              loadContacts();
            } catch (err) {
              notify(err.message, "error");
            }
          });
        });

        listMount.querySelectorAll("[data-msg-del]").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const ok = await C.confirmDialog({
              title: "Delete Contact Message",
              message: "Permanently remove this contact inquiry?",
              confirmLabel: "Delete",
              danger: true
            });
            if (!ok) return;
            try {
              await DB.deleteRecord("contact_submissions", btn.getAttribute("data-msg-del"), "contact message");
              notify("Contact submission deleted.", "success");
              loadContacts();
            } catch (err) {
              notify(err.message, "error");
            }
          });
        });

        C.refreshIcons();
      } catch (err) {
        listMount.innerHTML = C.renderErrorState({ message: err.message });
        C.refreshIcons();
      }
    }

    document.getElementById("contacts-search").addEventListener("input", (e) => {
      searchQuery = e.target.value;
      loadContacts();
    });
    document.getElementById("contacts-status").addEventListener("change", (e) => {
      statusFilter = e.target.value;
      loadContacts();
    });
    document.getElementById("contacts-export-csv").addEventListener("click", () => {
      const csv = DB.buildContactsCsv(currentRows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alamin-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notify(`Exported ${currentRows.length} messages to CSV.`, "success");
    });

    await loadContacts();
  }

  // =========================================================================
  // SECURITY, AUDIT LOGS & BACKUP/RESTORE (Phase 64)
  // =========================================================================
  async function renderSecurityModule(mount) {
    const C = window.AdminComponents;
    const DB = window.AdminDatabase;
    mount.innerHTML = C.renderSkeleton(4);

    try {
      const { rows } = await DB.listRecords("security_events", { page: 1, pageSize: 30, sortBy: "created_at", ascending: false });
      mount.innerHTML = `
        <div class="space-y-5">
          <div>
            <h1 class="text-xl font-bold">Security &amp; RLS Verification</h1>
            <p class="text-xs sm:text-sm text-[var(--admin-muted)] mt-0.5">Session verification uses Supabase Auth + PostgreSQL Row Level Security (<code class="font-mono-tech">public.admin_users</code>).</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div class="admin-card p-4 space-y-1">
              <p class="text-xs text-[var(--admin-muted)]">Authenticated Admin</p>
              <p class="text-sm font-bold">${C.escapeHtml(STATE.adminProfile.email)}</p>
            </div>
            <div class="admin-card p-4 space-y-1">
              <p class="text-xs text-[var(--admin-muted)]">Database Role</p>
              <p class="text-sm font-bold">${C.escapeHtml(STATE.adminProfile.role)}</p>
            </div>
            <div class="admin-card p-4 space-y-1">
              <p class="text-xs text-[var(--admin-muted)]">Public Signup Status</p>
              <p class="text-sm font-bold text-emerald-400">Disabled in Admin UI</p>
            </div>
          </div>

          <section class="admin-card p-4 sm:p-5 space-y-3">
            <h2 class="text-sm font-bold">Recent Security Events</h2>
            <div class="space-y-2">
              ${
                rows
                  .map(
                    (ev) => `
                    <div class="admin-panel px-3 py-2 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <p class="font-semibold">${C.escapeHtml(ev.event_type)} · ${C.escapeHtml(ev.actor_email || "system")}</p>
                        <p class="text-[var(--admin-muted)]">${C.escapeHtml(JSON.stringify(ev.details || {}))}</p>
                      </div>
                      <span class="font-mono-tech text-[var(--admin-muted)] tabular-nums">${new Date(ev.created_at).toLocaleString()}</span>
                    </div>
                  `
                  )
                  .join("") || `<p class="text-xs text-[var(--admin-muted)]">No security events recorded yet.</p>`
              }
            </div>
          </section>
        </div>
      `;
      C.refreshIcons();
    } catch (err) {
      mount.innerHTML = C.renderErrorState({ message: err.message });
      C.refreshIcons();
    }
  }

  async function renderAuditLogs(mount) {
    const C = window.AdminComponents;
    const DB = window.AdminDatabase;
    mount.innerHTML = C.renderSkeleton(5);
    try {
      const { rows } = await DB.listRecords("admin_audit_logs", { page: 1, pageSize: 50, sortBy: "created_at", ascending: false });
      mount.innerHTML = `
        <div class="space-y-4">
          <div>
            <h1 class="text-xl font-bold">Admin Audit Log</h1>
            <p class="text-xs sm:text-sm text-[var(--admin-muted)] mt-0.5">Chronological history of administrative actions recorded in PostgreSQL.</p>
          </div>
          <div class="admin-card overflow-hidden">
            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead><tr><th>Timestamp</th><th>Admin</th><th>Action</th><th>Module</th><th>Summary</th></tr></thead>
                <tbody>
                  ${
                    rows
                      .map(
                        (r) => `
                        <tr>
                          <td class="font-mono-tech text-xs tabular-nums whitespace-nowrap">${new Date(r.created_at).toLocaleString()}</td>
                          <td class="text-xs">${C.escapeHtml(r.admin_email || "admin")}</td>
                          <td class="font-mono-tech text-xs">${C.escapeHtml(r.action)}</td>
                          <td class="font-mono-tech text-xs">${C.escapeHtml(r.module)}</td>
                          <td class="text-xs">${C.escapeHtml(r.summary)}</td>
                        </tr>
                      `
                      )
                      .join("") || `<tr><td colspan="5" class="text-center text-xs text-[var(--admin-muted)] py-6">No audit entries recorded yet.</td></tr>`
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      mount.innerHTML = C.renderErrorState({ message: err.message });
      C.refreshIcons();
    }
  }

  function renderBackupRestore(mount) {
    const C = window.AdminComponents;
    const DB = window.AdminDatabase;

    mount.innerHTML = `
      <div class="space-y-5">
        <div>
          <h1 class="text-xl font-bold">Backup &amp; Restore</h1>
          <p class="text-xs sm:text-sm text-[var(--admin-muted)] mt-0.5">Export or validate JSON content backups. Full PostgreSQL schema and Storage binary backups should also be managed in your Supabase dashboard.</p>
        </div>

        <div class="admin-panel p-3.5 text-xs text-amber-300 border-amber-500/35">
          <strong>Important notice:</strong> JSON backups contain structured portfolio table rows only (not SQL DDL schemas, RLS policies, Storage binary files, or auth credentials). Restoring never silently overwrites records unless you explicitly choose upsert mode.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section class="admin-card p-5 space-y-3">
            <h2 class="text-base font-bold">Export JSON Content Backup</h2>
            <p class="text-xs text-[var(--admin-muted)]">Downloads all configured CMS tables cleanly as a timestamped JSON snapshot.</p>
            <button type="button" id="backup-export-btn" class="btn-primary">Download JSON Backup</button>
          </section>

          <section class="admin-card p-5 space-y-3">
            <h2 class="text-base font-bold">Validate &amp; Import Backup</h2>
            <p class="text-xs text-[var(--admin-muted)]">Choose a JSON snapshot exported by this CMS. Schema format is validated before any import.</p>
            <input id="backup-file-input" type="file" accept=".json,application/json" class="admin-input text-xs">
            <select id="backup-mode-select" class="admin-select text-xs">
              <option value="insert_missing">Safe: Insert missing IDs only (no overwrite)</option>
              <option value="upsert">Overwrite matching IDs (explicit upsert)</option>
            </select>
            <button type="button" id="backup-import-btn" class="btn-secondary">Validate &amp; Restore</button>
          </section>
        </div>
      </div>
    `;

    document.getElementById("backup-export-btn").addEventListener("click", async () => {
      const btn = document.getElementById("backup-export-btn");
      btn.disabled = true;
      try {
        const snapshot = await DB.exportBackupJson();
        const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `alamin-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        notify("JSON content backup downloaded.", "success");
      } catch (err) {
        notify(err.message, "error");
      } finally {
        btn.disabled = false;
      }
    });

    document.getElementById("backup-import-btn").addEventListener("click", async () => {
      const fileIn = document.getElementById("backup-file-input");
      const modeIn = document.getElementById("backup-mode-select");
      const file = fileIn.files && fileIn.files[0];
      if (!file) {
        notify("Please select a JSON backup file first.", "warning");
        return;
      }
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const { validTables, totalRows } = DB.validateBackupPayload(parsed);
        const confirmed = await C.confirmDialog({
          title: "Confirm Backup Import",
          message: `Validated ${totalRows} rows across ${Object.keys(validTables).length} tables. Proceed with mode: ${modeIn.value === "upsert" ? "Overwrite matching IDs" : "Insert missing IDs only"}?`,
          confirmLabel: "Import Backup",
          danger: modeIn.value === "upsert"
        });
        if (!confirmed) return;
        await DB.importBackupJson(parsed, { mode: modeIn.value });
        notify("Backup imported cleanly.", "success");
      } catch (err) {
        notify(err.message || "Backup validation failed.", "error");
      }
    });
  }

  function renderAccountProfile(mount) {
    const C = window.AdminComponents;
    const p = STATE.adminProfile || {};
    mount.innerHTML = `
      <div class="space-y-4">
        <div>
          <h1 class="text-xl font-bold">Admin Account &amp; Session</h1>
          <p class="text-xs sm:text-sm text-[var(--admin-muted)] mt-0.5">Verified via Supabase Auth &amp; <code class="font-mono-tech">public.admin_users</code>.</p>
        </div>
        <div class="admin-card p-5 space-y-3 max-w-xl">
          <div class="flex justify-between text-sm"><span class="text-[var(--admin-muted)]">Full Name</span><span class="font-semibold">${C.escapeHtml(p.full_name || "AL AMIN")}</span></div>
          <div class="flex justify-between text-sm"><span class="text-[var(--admin-muted)]">Email</span><span class="font-mono-tech">${C.escapeHtml(p.email || "")}</span></div>
          <div class="flex justify-between text-sm"><span class="text-[var(--admin-muted)]">Role</span><span class="font-semibold">${C.escapeHtml(p.role || "admin")}</span></div>
          <div class="flex justify-between text-sm"><span class="text-[var(--admin-muted)]">Last Login</span><span class="font-mono-tech">${p.last_login_at ? new Date(p.last_login_at).toLocaleString() : "Current session"}</span></div>
          <div class="pt-3 border-t border-[var(--admin-border)]">
            <button type="button" id="account-logout-btn" class="btn-danger">Sign Out</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById("account-logout-btn").addEventListener("click", async () => {
      await window.AdminAuth.signOut("You have signed out securely.");
      window.location.replace("login.html");
    });
  }

  // =========================================================================
  // DASHBOARD SHELL CONTROLLER (admin/dashboard.html)
  // =========================================================================
  async function initDashboardPage() {
    const shell = document.getElementById("admin-shell");
    if (!shell) return;

    initTheme();
    const sessionState = await window.AdminPermissions.requireAuthorizedAdmin({ loginUrl: "login.html" });
    if (!sessionState) return;

    STATE.session = sessionState.session;
    STATE.adminProfile = sessionState.adminProfile;

    window.AdminAuth.watchSession((msg) => {
      window.sessionStorage.setItem("admin_logout_reason", msg);
      window.location.replace("login.html");
    });

    const C = window.AdminComponents;
    const Router = window.AdminRouter;

    const emailLabel = document.getElementById("admin-profile-email");
    const roleLabel = document.getElementById("admin-profile-role");
    if (emailLabel) emailLabel.textContent = STATE.adminProfile.email || "Admin";
    if (roleLabel) roleLabel.textContent = window.AdminPermissions.formatRoleBadge(STATE.adminProfile.role);

    // Render Sidebar Navigation
    const navMount = document.getElementById("admin-sidebar-nav");
    if (navMount) {
      navMount.innerHTML = Router.NAV_SECTIONS.map(
        (section) => `
        <div class="sidebar-section">
          <p class="sidebar-section-title">${C.escapeHtml(section.title)}</p>
          <div class="space-y-0.5">
            ${section.items
              .map(
                (item) => `
                <button type="button" class="admin-nav-link" data-admin-route="${C.escapeHtml(item.key)}">
                  <i data-lucide="${C.escapeHtml(item.icon)}" class="w-4 h-4 shrink-0"></i>
                  <span class="sidebar-label truncate">${C.escapeHtml(item.label)}</span>
                </button>
              `
              )
              .join("")}
          </div>
        </div>
      `
      ).join("");

      navMount.querySelectorAll("[data-admin-route]").forEach((btn) => {
        btn.addEventListener("click", () => {
          shell.classList.remove("is-mobile-open");
          Router.navigateTo(btn.getAttribute("data-admin-route"));
        });
      });
    }

    // Sidebar collapse & mobile drawer
    const collapseBtn = document.getElementById("admin-collapse-btn");
    const mobileMenuBtn = document.getElementById("admin-mobile-menu-btn");
    const mobileBackdrop = document.getElementById("admin-mobile-backdrop");
    if (collapseBtn) collapseBtn.addEventListener("click", () => shell.classList.toggle("is-collapsed"));
    if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", () => shell.classList.toggle("is-mobile-open"));
    if (mobileBackdrop) mobileBackdrop.addEventListener("click", () => shell.classList.remove("is-mobile-open"));

    // Topbar Notification Popover
    const notifBtn = document.getElementById("admin-notif-btn");
    const notifPop = document.getElementById("admin-notif-popover");
    const notifReadBtn = document.getElementById("admin-notif-mark-read");
    if (notifBtn && notifPop) {
      notifBtn.addEventListener("click", () => notifPop.classList.toggle("hidden"));
    }
    if (notifReadBtn && window.AdminNotifications) {
      notifReadBtn.addEventListener("click", () => window.AdminNotifications.markAllRead());
    }

    // Topbar Quick Global Search
    const topSearchForm = document.getElementById("topbar-search-form");
    const topSearchInput = document.getElementById("topbar-search-input");
    if (topSearchForm && topSearchInput) {
      topSearchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        STATE.globalSearchQuery = topSearchInput.value.trim();
        Router.navigateTo("global-search");
      });
    }

    // Logout action
    const logoutBtn = document.getElementById("admin-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await window.AdminAuth.signOut("Signed out cleanly.");
        window.location.replace("login.html");
      });
    }

    async function handleRouteChange() {
      const routeKey = Router.getActiveRouteKey();
      const meta = Router.findRouteMeta(routeKey);
      const breadcrumbEl = document.getElementById("admin-breadcrumb");
      if (breadcrumbEl) {
        breadcrumbEl.innerHTML = `<span>${C.escapeHtml(meta.sectionTitle)}</span> <span class="text-[var(--admin-muted)]">/</span> <span class="font-semibold text-[var(--admin-text)]">${C.escapeHtml(meta.label)}</span>`;
      }

      if (navMount) {
        navMount.querySelectorAll("[data-admin-route]").forEach((btn) => {
          btn.classList.toggle("is-active", btn.getAttribute("data-admin-route") === routeKey);
        });
      }

      const mount = document.getElementById("admin-workspace");
      if (!mount) return;

      if (routeKey === "overview") return renderOverview(mount);
      if (routeKey === "global-search") return renderGlobalSearch(mount);
      if (routeKey === "account_profile") return renderAccountProfile(mount);

      const schema = window.AdminSchemas.getSchema(routeKey);
      if (!schema) return renderOverview(mount);

      if (schema.customModule === "media") return renderMediaLibrary(mount);
      if (schema.customModule === "contacts") return renderContactInbox(mount);
      if (schema.customModule === "security") return renderSecurityModule(mount);
      if (schema.customModule === "audit") return renderAuditLogs(mount);
      if (schema.customModule === "backup") return renderBackupRestore(mount);
      if (schema.singleton) return renderSingletonModule(mount, schema);

      return renderCrudModule(mount, routeKey, schema);
    }

    window.addEventListener("hashchange", handleRouteChange);
    C.refreshIcons();
    await handleRouteChange();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLoginPage();
    initDashboardPage();
  });
})();
