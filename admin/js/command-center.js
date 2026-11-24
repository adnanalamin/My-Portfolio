/**
 * AL AMIN Admin CMS — Global Admin Command Center & Ctrl+K Palette (Phase 70)
 * Provides unified command dashboard, Ctrl/Cmd+K command palette across all admin pages,
 * permission-checked 11-category global search, operational queues (drafts, pending reviews,
 * scheduled posts, unread contacts, recent edits, recent activity, real system alerts),
 * and quick create/edit/publish/unpublish/archive/restore actions.
 */
(() => {
  const PALETTE_STATE = {
    isOpen: false,
    query: "",
    category: "all",
    items: [],
    selectedIndex: 0,
    debounceTimer: null,
    activeSessionProfile: null
  };

  const QUICK_CREATE_SHORTCUTS = [
    { label: "+ New Project", routeKey: "projects", icon: "folder-kanban", create: true },
    { label: "+ New Blog Post", routeKey: "blog_posts", icon: "file-text", create: true },
    { label: "+ New Skill", routeKey: "skills", icon: "cpu", create: true },
    { label: "+ New Service", routeKey: "services", icon: "layers", create: true },
    { label: "+ New Certificate", routeKey: "certificates", icon: "award", create: true },
    { label: "+ New Testimonial", routeKey: "testimonials", icon: "message-square-quote", create: true },
    { label: "+ New Page", routeKey: "site_pages", icon: "file-cog", create: true },
    { label: "Visual Page Builder", href: "page-builder.html", icon: "layout-template" },
    { label: "Upload Media", routeKey: "media_library", icon: "images" }
  ];

  const ADMIN_SHORTCUTS = [
    { label: "Visual Page Builder", sub: "Drag & drop sections", href: "page-builder.html", icon: "layout-template" },
    { label: "Section Manager", sub: "Global page sections", href: "section-manager.html", icon: "rows-3" },
    { label: "Backup & Recovery", sub: "JSON export & restore", href: "backup.html", icon: "hard-drive-download" },
    { label: "Media Library (DAM)", sub: "Folders & asset usage", routeKey: "media_library", icon: "images" },
    { label: "Version History", sub: "Snapshots & rollback", routeKey: "version_history", icon: "history" },
    { label: "Scheduled Publishing", sub: "Server-side cron queue", routeKey: "scheduled_publishing", icon: "clock" },
    { label: "Contact Inbox", sub: "Visitor inquiries", routeKey: "contact_submissions", icon: "mail" },
    { label: "Website & SEO", sub: "Identity & Open Graph", routeKey: "website_settings", icon: "sliders" },
    { label: "Security & RLS", sub: "Audit & sessions", routeKey: "security_settings", icon: "shield-check" },
    { label: "View Public Portfolio", sub: "Opens index.html", href: "../index.html", external: true, icon: "external-link" }
  ];

  function C() {
    return window.AdminComponents;
  }

  function DB() {
    return window.AdminDatabase;
  }

  function Perms() {
    return window.AdminPermissions;
  }

  function notify(msg, type = "info") {
    if (window.AdminNotifications) window.AdminNotifications.notify(msg, type);
  }

  async function verifyAdminAction(action = "read") {
    let profile = window.AdminApp && typeof window.AdminApp.getAdminProfile === "function"
      ? window.AdminApp.getAdminProfile()
      : PALETTE_STATE.activeSessionProfile;

    if (!profile && window.AdminAuth && typeof window.AdminAuth.getCurrentAdminSession === "function") {
      const sess = await window.AdminAuth.getCurrentAdminSession();
      if (sess && sess.configured && sess.session && sess.adminProfile) {
        profile = sess.adminProfile;
        PALETTE_STATE.activeSessionProfile = profile;
      }
    }

    if (!Perms() || typeof Perms().canPerformAction !== "function") {
      return { allowed: false, profile: null, reason: "Permission module not available." };
    }
    const res = Perms().canPerformAction(profile, action);
    return { allowed: res.allowed, profile, reason: res.reason };
  }

  function isOnDashboardPage() {
    return Boolean(document.getElementById("admin-workspace") && window.AdminApp && window.AdminRouter);
  }

  function buildTargetHref({ table, routeKey, id, pageSlug = "", create = false, inspect = false }) {
    if (table === "page_sections" || routeKey === "page_builder") {
      const slug = pageSlug || "index.html";
      return `page-builder.html?page=${encodeURIComponent(slug)}${id ? `&section=${encodeURIComponent(id)}` : ""}`;
    }
    const resolvedRoute = routeKey || (DB() ? DB().resolveCatalogRoute(table).routeKey : table);
    const params = new URLSearchParams();
    if (create) params.set("create", "1");
    else if (inspect && id) params.set("inspect", id);
    else if (id && resolvedRoute !== "website_settings" && resolvedRoute !== "profile") params.set("edit", id);
    const qs = params.toString();
    return `dashboard.html#/${resolvedRoute}${qs ? `?${qs}` : ""}`;
  }

  async function openTargetRecord({ table, routeKey, id, pageSlug = "", create = false, inspect = false, onRefresh = null }) {
    const perm = await verifyAdminAction(create ? "create" : "edit");
    if (!perm.allowed) {
      notify(perm.reason || "Permission denied.", "error");
      return;
    }

    if (table === "page_sections" || routeKey === "page_builder") {
      window.location.href = buildTargetHref({ table, routeKey, id, pageSlug });
      return;
    }

    if (!isOnDashboardPage()) {
      window.location.href = buildTargetHref({ table, routeKey, id, pageSlug, create, inspect });
      return;
    }

    if (create) {
      await window.AdminApp.openCreateForRoute(routeKey, onRefresh);
      return;
    }

    if (inspect || table === "media_assets" || routeKey === "media_library") {
      await window.AdminApp.openRecordByTarget({ table: "media_assets", routeKey: "media_library", id, onSaved: onRefresh });
      return;
    }

    await window.AdminApp.openRecordByTarget({ table, routeKey, id, pageSlug, onSaved: onRefresh });
  }

  async function runQuickStatusAction({ table, id, label, nextStatus, currentlyPublished = false, onRefresh = null }) {
    const actionMap = { published: "publish", draft: "unpublish", archived: "archive", read: "edit", unread: "edit" };
    const perm = await verifyAdminAction(actionMap[nextStatus] || "edit");
    if (!perm.allowed) {
      notify(perm.reason || "Permission denied.", "error");
      return false;
    }

    if (window.AdminApp && typeof window.AdminApp.quickTransitionStatus === "function") {
      return window.AdminApp.quickTransitionStatus({
        table,
        id,
        label,
        nextStatus,
        currentlyPublished,
        onDone: onRefresh
      });
    }

    // Portable fallback when invoked from page-builder.html, section-manager.html, or backup.html
    let summary = `Command Palette update → ${nextStatus}`;
    if (nextStatus === "published") {
      const conf = await C().confirmPublishDialog({
        moduleTitle: table,
        recordLabel: label || id,
        targetStatus: "published",
        currentlyPublished: Boolean(currentlyPublished),
        defaultSummary: `Published "${label || id}" via Command Palette`
      });
      if (!conf.confirmed) return false;
      if (conf.changeSummary) summary = conf.changeSummary;
    } else if (nextStatus === "archived") {
      const ok = await C().confirmDialog({
        title: "Archive Record",
        message: `Archive "${label || id}"?`,
        confirmLabel: "Archive"
      });
      if (!ok) return false;
    }

    const patch = { status: nextStatus };
    if (nextStatus === "archived" && (table === "projects" || table === "blog_posts")) {
      patch.archived_at = new Date().toISOString();
    }
    await DB().updateRecord(table, id, patch, `Set ${nextStatus}`, { changeSummary: summary });
    notify(`Updated "${label || id}" to ${nextStatus}.`, "success");
    if (typeof onRefresh === "function") await onRefresh();
    return true;
  }

  async function runQuickRestoreVersion(versionRow, targetStatus = "draft", onRefresh = null) {
    const perm = await verifyAdminAction("restore");
    if (!perm.allowed) {
      notify(perm.reason || "Restore permission denied.", "error");
      return false;
    }
    const label = `${versionRow.content_type} (${versionRow.content_id})`;
    let summary = `Restored snapshot v${versionRow.version_number} as ${targetStatus}`;
    if (targetStatus === "published") {
      const conf = await C().confirmPublishDialog({
        moduleTitle: versionRow.content_type,
        recordLabel: label,
        targetStatus: "published",
        currentlyPublished: true,
        defaultSummary: summary
      });
      if (!conf.confirmed) return false;
      if (conf.changeSummary) summary = conf.changeSummary;
    } else {
      const ok = await C().confirmDialog({
        title: "Quick Restore Snapshot",
        message: `Restore v${versionRow.version_number} of ${label} as Draft? Current state stays preserved in Version History.`,
        confirmLabel: "Restore Draft"
      });
      if (!ok) return false;
    }

    await DB().restoreContentVersion(versionRow.id, { targetStatus, changeSummary: summary });
    notify(`Restored ${label} to v${versionRow.version_number} (${targetStatus}).`, "success");
    if (typeof onRefresh === "function") await onRefresh();
    return true;
  }

  // =========================================================================
  // CTRL+K / CMD+K COMMAND PALETTE MODAL
  // =========================================================================
  function ensurePaletteDom() {
    let backdrop = document.getElementById("cmd-palette-backdrop");
    if (backdrop) return backdrop;

    backdrop = document.createElement("div");
    backdrop.id = "cmd-palette-backdrop";
    backdrop.className = "fixed inset-0 z-[90] hidden items-start justify-center p-3 sm:p-8 bg-slate-950/75 backdrop-blur-sm";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-label", "Global Admin Command Palette");

    backdrop.innerHTML = `
      <div id="cmd-palette-panel" class="w-full max-w-3xl admin-card shadow-2xl overflow-hidden border border-[var(--admin-border-strong)] flex flex-col max-h-[85vh]">
        <div class="p-3.5 border-b border-[var(--admin-border)] flex items-center gap-2.5 bg-[var(--admin-surface)]">
          <i data-lucide="search" class="w-4 h-4 text-[var(--admin-primary)] shrink-0"></i>
          <input id="cmd-palette-input" type="search" autocomplete="off" class="flex-1 bg-transparent text-sm outline-none text-[var(--admin-text)] placeholder:text-[var(--admin-muted)]" placeholder="Search Pages, Projects, Blog, Skills, Services, Media, Settings, Contacts... (↑↓ navigate, Enter open)">
          <span class="hidden sm:inline-flex text-[10px] font-mono-tech px-2 py-0.5 rounded border border-[var(--admin-border)] text-[var(--admin-muted)]">ESC</span>
          <button type="button" id="cmd-palette-close" class="btn-ghost p-1 min-h-0 text-base leading-none" aria-label="Close Command Palette">&times;</button>
        </div>

        <div id="cmd-palette-cats" class="px-3.5 py-2 border-b border-[var(--admin-border)] flex items-center gap-1.5 overflow-x-auto bg-[var(--admin-bg)]/60"></div>

        <div id="cmd-palette-body" class="flex-1 overflow-y-auto p-3 space-y-3 bg-[var(--admin-surface)]"></div>

        <div class="px-3.5 py-2 border-t border-[var(--admin-border)] bg-[var(--admin-bg)]/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--admin-muted)]">
          <span>Permission-checked global CMS search &amp; quick actions</span>
          <span class="font-mono-tech">Ctrl+K / ⌘K · ↑↓ Move · Enter Open</span>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeCommandPalette();
    });
    backdrop.querySelector("#cmd-palette-close").addEventListener("click", closeCommandPalette);

    const inputEl = backdrop.querySelector("#cmd-palette-input");
    inputEl.addEventListener("input", () => {
      PALETTE_STATE.query = inputEl.value;
      clearTimeout(PALETTE_STATE.debounceTimer);
      PALETTE_STATE.debounceTimer = setTimeout(() => {
        refreshPaletteResults();
      }, 170);
    });

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (PALETTE_STATE.items.length) {
          PALETTE_STATE.selectedIndex = (PALETTE_STATE.selectedIndex + 1) % PALETTE_STATE.items.length;
          highlightPaletteSelection();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (PALETTE_STATE.items.length) {
          PALETTE_STATE.selectedIndex = (PALETTE_STATE.selectedIndex - 1 + PALETTE_STATE.items.length) % PALETTE_STATE.items.length;
          highlightPaletteSelection();
        }
      } else if (e.key === "Enter") {
        const active = PALETTE_STATE.items[PALETTE_STATE.selectedIndex];
        if (active) {
          e.preventDefault();
          executePaletteEntry(active);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeCommandPalette();
      }
    });

    return backdrop;
  }

  function renderPaletteCategoryPills() {
    const mount = document.getElementById("cmd-palette-cats");
    if (!mount) return;
    const esc = C().escapeHtml;
    const cats = DB() ? DB().GLOBAL_SEARCH_CATEGORIES : [];
    mount.innerHTML = cats
      .map((cat) => {
        const active = PALETTE_STATE.category === cat.key;
        return `<button type="button" data-cp-cat="${esc(cat.key)}" class="px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium transition ${
          active
            ? "bg-[var(--admin-primary)] text-white"
            : "bg-[var(--admin-surface-2)] text-[var(--admin-text-secondary)] hover:border-[var(--admin-primary)] border border-[var(--admin-border)]"
        }">${esc(cat.label)}</button>`;
      })
      .join("");

    mount.querySelectorAll("[data-cp-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        PALETTE_STATE.category = btn.getAttribute("data-cp-cat");
        renderPaletteCategoryPills();
        refreshPaletteResults();
      });
    });
  }

  function highlightPaletteSelection() {
    const body = document.getElementById("cmd-palette-body");
    if (!body) return;
    body.querySelectorAll("[data-cp-idx]").forEach((row) => {
      const idx = Number(row.getAttribute("data-cp-idx"));
      const isSelected = idx === PALETTE_STATE.selectedIndex;
      row.classList.toggle("border-[var(--admin-primary)]", isSelected);
      row.classList.toggle("bg-indigo-500/10", isSelected);
      if (isSelected) row.scrollIntoView({ block: "nearest" });
    });
  }

  async function executePaletteEntry(entry) {
    closeCommandPalette();
    if (entry.kind === "shortcut") {
      if (entry.href) {
        if (entry.external) window.open(entry.href, "_blank", "noopener,noreferrer");
        else window.location.href = entry.href;
        return;
      }
      if (entry.create) {
        await openTargetRecord({ routeKey: entry.routeKey, create: true });
        return;
      }
      if (isOnDashboardPage()) window.AdminRouter.navigateTo(entry.routeKey);
      else window.location.href = `dashboard.html#/${entry.routeKey}`;
      return;
    }

    await openTargetRecord({
      table: entry.table,
      routeKey: entry.routeKey,
      id: entry.id,
      pageSlug: entry.raw && entry.raw.page_slug ? entry.raw.page_slug : "",
      inspect: entry.isMedia
    });
  }

  async function refreshPaletteResults() {
    const body = document.getElementById("cmd-palette-body");
    if (!body) return;
    const esc = C().escapeHtml;

    const perm = await verifyAdminAction("search");
    if (!perm.allowed) {
      PALETTE_STATE.items = [];
      body.innerHTML = C().renderErrorState({
        title: "Authorized Admin Session Required",
        message: perm.reason || "Sign in with an active admin profile before querying CMS records."
      });
      return;
    }

    const q = String(PALETTE_STATE.query || "").trim();
    if (!q) {
      const defaultItems = [
        ...QUICK_CREATE_SHORTCUTS.map((s) => ({ ...s, kind: "shortcut", group: "Quick Create" })),
        ...ADMIN_SHORTCUTS.map((s) => ({ ...s, kind: "shortcut", group: "Admin Shortcuts" }))
      ];
      PALETTE_STATE.items = defaultItems;
      PALETTE_STATE.selectedIndex = 0;

      const renderGroup = (title, list, startOffset) => `
        <div class="space-y-1.5">
          <p class="text-[11px] font-bold uppercase tracking-wider text-[var(--admin-muted)] px-1">${esc(title)}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            ${list
              .map((item, i) => {
                const idx = startOffset + i;
                return `
                  <button type="button" data-cp-idx="${idx}" class="admin-panel px-3 py-2 flex items-center justify-between gap-2 text-left hover:border-[var(--admin-primary)] transition">
                    <div class="flex items-center gap-2 min-w-0">
                      <i data-lucide="${esc(item.icon || "arrow-right")}" class="w-4 h-4 text-[var(--admin-primary)] shrink-0"></i>
                      <div class="min-w-0">
                        <p class="text-xs font-semibold truncate">${esc(item.label)}</p>
                        ${item.sub ? `<p class="text-[10px] text-[var(--admin-muted)] truncate">${esc(item.sub)}</p>` : ""}
                      </div>
                    </div>
                    <span class="text-[10px] font-mono-tech text-[var(--admin-muted)] shrink-0">↵</span>
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>
      `;

      body.innerHTML =
        renderGroup("Quick Create", defaultItems.slice(0, QUICK_CREATE_SHORTCUTS.length), 0) +
        renderGroup("Admin Shortcuts", defaultItems.slice(QUICK_CREATE_SHORTCUTS.length), QUICK_CREATE_SHORTCUTS.length);

      body.querySelectorAll("[data-cp-idx]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = PALETTE_STATE.items[Number(btn.getAttribute("data-cp-idx"))];
          if (item) executePaletteEntry(item);
        });
      });
      highlightPaletteSelection();
      C().refreshIcons();
      return;
    }

    body.innerHTML = C().renderSkeleton(3);
    try {
      const searchRes = await DB().globalCommandSearch(q, {
        category: PALETTE_STATE.category,
        limitPerTable: 5,
        adminProfile: perm.profile
      });

      const lowerQ = q.toLowerCase();
      const matchedShortcuts =
        PALETTE_STATE.category === "all"
          ? [...QUICK_CREATE_SHORTCUTS, ...ADMIN_SHORTCUTS]
              .filter((s) => `${s.label} ${s.sub || ""}`.toLowerCase().includes(lowerQ))
              .slice(0, 6)
              .map((s) => ({ ...s, kind: "shortcut" }))
          : [];

      const flatRecords = [];
      searchRes.groups.forEach((g) => {
        g.items.forEach((item) => flatRecords.push({ ...item, kind: "record" }));
      });

      PALETTE_STATE.items = [...matchedShortcuts, ...flatRecords];
      PALETTE_STATE.selectedIndex = 0;

      if (!PALETTE_STATE.items.length) {
        body.innerHTML = C().renderEmptyState({
          icon: "search-x",
          title: `No authorized records matched "${q}"`,
          description: "Try a different keyword or switch back to All Categories."
        });
        C().refreshIcons();
        return;
      }

      let cursor = 0;
      const sectionsHtml = [];

      if (matchedShortcuts.length) {
        const shortcutRows = matchedShortcuts
          .map((s) => {
            const idx = cursor++;
            return `
              <button type="button" data-cp-idx="${idx}" class="admin-panel w-full px-3 py-2 flex items-center justify-between gap-2 text-left hover:border-[var(--admin-primary)]">
                <span class="flex items-center gap-2 min-w-0 text-xs font-semibold">
                  <i data-lucide="${esc(s.icon || "zap")}" class="w-4 h-4 text-[var(--admin-primary)] shrink-0"></i>
                  <span class="truncate">${esc(s.label)}</span>
                </span>
                <span class="text-[10px] font-mono-tech text-[var(--admin-muted)]">Command</span>
              </button>
            `;
          })
          .join("");
        sectionsHtml.push(`<div class="space-y-1.5"><p class="text-[11px] font-bold uppercase tracking-wider text-[var(--admin-muted)] px-1">Admin Commands</p>${shortcutRows}</div>`);
      }

      searchRes.groups.forEach((group) => {
        const rowsHtml = group.items
          .map((rec) => {
            const idx = cursor++;
            const canPublish = rec.hasStatus && !rec.isContact && rec.status !== "published";
            const canUnpublish = rec.hasStatus && !rec.isContact && rec.status === "published";
            const canArchive = rec.hasStatus && rec.status !== "archived";
            return `
              <div data-cp-idx="${idx}" class="admin-panel px-3 py-2 flex flex-wrap items-center justify-between gap-2 hover:border-[var(--admin-primary)] transition">
                <button type="button" data-cp-open="${idx}" class="flex-1 min-w-[200px] text-left">
                  <p class="text-xs font-semibold truncate">${esc(rec.label)}</p>
                  <p class="text-[11px] text-[var(--admin-muted)] truncate">${esc(rec.subLabel || rec.table)}</p>
                </button>
                <div class="flex flex-wrap items-center gap-1.5 shrink-0">
                  ${rec.status ? C().statusBadge(rec.status) : ""}
                  <button type="button" data-cp-open="${idx}" class="btn-secondary text-[11px] py-1 px-2 min-h-[26px]">Edit / Open</button>
                  ${canPublish ? `<button type="button" data-cp-status="published" data-cp-rec="${idx}" class="btn-primary text-[11px] py-1 px-2 min-h-[26px]">Publish</button>` : ""}
                  ${canUnpublish ? `<button type="button" data-cp-status="draft" data-cp-rec="${idx}" class="btn-secondary text-[11px] py-1 px-2 min-h-[26px]">Unpublish</button>` : ""}
                  ${canArchive ? `<button type="button" data-cp-status="archived" data-cp-rec="${idx}" class="btn-ghost text-[11px] py-1 px-2 min-h-[26px]">Archive</button>` : ""}
                </div>
              </div>
            `;
          })
          .join("");
        sectionsHtml.push(`<div class="space-y-1.5"><p class="text-[11px] font-bold uppercase tracking-wider text-[var(--admin-muted)] px-1">${esc(group.categoryLabel)} (${group.items.length})</p>${rowsHtml}</div>`);
      });

      body.innerHTML = sectionsHtml.join("");

      body.querySelectorAll("[data-cp-open]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = PALETTE_STATE.items[Number(btn.getAttribute("data-cp-open"))];
          if (item) executePaletteEntry(item);
        });
      });

      body.querySelectorAll("[data-cp-status]").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const item = PALETTE_STATE.items[Number(btn.getAttribute("data-cp-rec"))];
          const nextStatus = btn.getAttribute("data-cp-status");
          if (!item) return;
          closeCommandPalette();
          await runQuickStatusAction({
            table: item.table,
            id: item.id,
            label: item.label,
            nextStatus,
            currentlyPublished: item.status === "published",
            onRefresh: () => {
              if (isOnDashboardPage() && window.AdminRouter.getActiveRouteKey() === "overview") {
                const ws = document.getElementById("admin-workspace");
                if (ws) renderDashboard(ws);
              }
            }
          });
        });
      });

      highlightPaletteSelection();
      C().refreshIcons();
    } catch (err) {
      body.innerHTML = C().renderErrorState({ message: err.message });
      C().refreshIcons();
    }
  }

  async function openCommandPalette(seedQuery = "") {
    const perm = await verifyAdminAction("search");
    if (!perm.allowed) {
      notify(perm.reason || "Authorized admin access required for Command Palette.", "error");
      return;
    }

    const backdrop = ensurePaletteDom();
    PALETTE_STATE.isOpen = true;
    if (typeof seedQuery === "string" && seedQuery) {
      PALETTE_STATE.query = seedQuery;
    }

    backdrop.classList.remove("hidden");
    backdrop.classList.add("flex");
    const input = document.getElementById("cmd-palette-input");
    if (input) {
      input.value = PALETTE_STATE.query;
      setTimeout(() => input.focus(), 10);
    }
    renderPaletteCategoryPills();
    await refreshPaletteResults();
    C().refreshIcons();
  }

  function closeCommandPalette() {
    const backdrop = document.getElementById("cmd-palette-backdrop");
    if (!backdrop) return;
    backdrop.classList.add("hidden");
    backdrop.classList.remove("flex");
    PALETTE_STATE.isOpen = false;
  }

  // =========================================================================
  // UNIFIED COMMAND CENTER OVERVIEW DASHBOARD (#/overview)
  // =========================================================================
  async function renderDashboard(mount) {
    const esc = C().escapeHtml;
    const perm = await verifyAdminAction("read");
    if (!perm.allowed) {
      mount.innerHTML = C().renderErrorState({ title: "Access Denied", message: perm.reason || "Active admin permission required." });
      C().refreshIcons();
      return;
    }

    mount.innerHTML = C().renderSkeleton(6);

    try {
      const snap = await DB().getCommandCenterSnapshot(perm.profile);
      const { counts } = snap;

      const statCards = [
        { label: "Projects", value: counts.totalProjects, sub: `${counts.publishedProjects ?? 0} live · ${counts.draftProjects ?? 0} draft`, route: "projects", icon: "folder-kanban" },
        { label: "Blog Posts", value: counts.totalPosts, sub: `${counts.publishedPosts ?? 0} published`, route: "blog_posts", icon: "file-text" },
        { label: "Skills & Services", value: (counts.totalSkills ?? 0) + (counts.totalServices ?? 0), sub: `${counts.totalSkills ?? 0} skills · ${counts.totalServices ?? 0} services`, route: "skills", icon: "cpu" },
        { label: "Media Assets", value: counts.mediaCount, sub: "Supabase Storage DAM", route: "media_library", icon: "images" },
        { label: "Draft Content", value: counts.draftTotal, sub: "Ready for publish", tab: "drafts", icon: "file-edit" },
        { label: "Pending Reviews", value: counts.pendingReviewCount, sub: "Testimonials & inquiries", tab: "reviews", icon: "clipboard-check" },
        { label: "Scheduled Releases", value: counts.scheduledCount, sub: snap.schedulerStatus && snap.schedulerStatus.cron_job_active ? "pg_cron active" : "Managed queue", tab: "scheduled", icon: "clock" },
        { label: "Unread Messages", value: counts.unreadContacts, sub: `${counts.alertCount} system alert(s)`, tab: "contacts", icon: "mail" }
      ];

      mount.innerHTML = `
        <div class="space-y-6">
          <!-- Command Center Header + Search Launcher -->
          <section class="admin-card p-4 sm:p-5 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 class="text-xl sm:text-2xl font-bold tracking-tight">Admin Command Center</h1>
                <p class="text-xs sm:text-sm text-[var(--admin-muted)] mt-0.5">
                  Unified operations hub for content queues, scheduled publishing, unread inquiries, version recovery, and global search.
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" id="cc-launch-palette" class="btn-primary text-xs">
                  <i data-lucide="command" class="w-3.5 h-3.5"></i>
                  <span>Command Palette (Ctrl+K)</span>
                </button>
                <a href="page-builder.html" class="btn-secondary text-xs">Visual Page Builder</a>
                <a href="backup.html" class="btn-secondary text-xs">Backup Center</a>
              </div>
            </div>

            <form id="cc-inline-search-form" class="flex flex-col sm:flex-row gap-2">
              <input id="cc-inline-search-input" type="search" class="admin-input flex-1 text-xs sm:text-sm" placeholder="Search all 11 modules: Pages, Projects, Blog, Skills, Services, Certificates, Testimonials, Media, Settings, Features, Contacts...">
              <button type="submit" class="btn-secondary text-xs shrink-0">Search All Modules</button>
            </form>

            <!-- Quick Create Strip -->
            <div class="flex flex-wrap items-center gap-1.5 pt-1">
              <span class="text-[11px] font-bold uppercase tracking-wider text-[var(--admin-muted)] mr-1">Quick Create:</span>
              ${QUICK_CREATE_SHORTCUTS.map((sc, i) =>
                sc.href
                  ? `<a href="${esc(sc.href)}" class="btn-ghost text-xs py-1 px-2.5 min-h-[28px] border border-[var(--admin-border)]">${esc(sc.label)}</a>`
                  : `<button type="button" data-cc-create="${i}" class="btn-ghost text-xs py-1 px-2.5 min-h-[28px] border border-[var(--admin-border)]">${esc(sc.label)}</button>`
              ).join("")}
            </div>
          </section>

          <!-- Live Operational Metrics -->
          <section aria-label="Operational Metrics" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            ${statCards
              .map(
                (card) => `
              <button type="button" ${card.route ? `data-cc-route="${esc(card.route)}"` : `data-cc-scroll-tab="${esc(card.tab)}"`} class="admin-card p-4 text-left hover:border-[var(--admin-primary)] transition">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-medium text-[var(--admin-muted)]">${esc(card.label)}</span>
                  <i data-lucide="${esc(card.icon)}" class="w-4 h-4 text-[var(--admin-primary)]"></i>
                </div>
                <p class="text-2xl font-bold font-mono-tech tabular-nums mt-1.5">${card.value === null || card.value === undefined ? "—" : esc(card.value)}</p>
                <p class="text-[11px] text-[var(--admin-muted)] mt-1 truncate">${esc(card.sub)}</p>
              </button>
            `
              )
              .join("")}
          </section>

          <!-- System Alerts (when real alerts exist) -->
          ${
            snap.systemAlerts.length
              ? `<section class="admin-card p-4 space-y-2.5 border-amber-500/35">
                  <div class="flex items-center justify-between">
                    <h2 class="text-sm font-bold flex items-center gap-2">
                      <i data-lucide="bell-ring" class="w-4 h-4 text-amber-400"></i>
                      <span>System Alerts (${snap.systemAlerts.length})</span>
                    </h2>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    ${snap.systemAlerts
                      .map(
                        (al) => `
                      <div class="admin-panel p-3 flex items-start justify-between gap-2.5 ${al.severity === "danger" ? "border-rose-500/40" : al.severity === "warning" ? "border-amber-500/40" : "border-sky-500/35"}">
                        <div class="min-w-0 space-y-0.5">
                          <p class="text-xs font-bold">${esc(al.title)}</p>
                          <p class="text-[11px] text-[var(--admin-muted)]">${esc(al.message)}</p>
                        </div>
                        <button type="button" data-cc-route="${esc(al.routeKey)}" class="btn-secondary text-[11px] py-1 px-2 min-h-[26px] shrink-0">Resolve</button>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </section>`
              : `<section class="admin-card p-3.5 flex items-center justify-between gap-2 border-emerald-500/30">
                  <span class="text-xs text-emerald-400 font-medium flex items-center gap-2">
                    <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                    No active system, scheduler, or security alerts detected.
                  </span>
                  <button type="button" data-cc-route="security_settings" class="btn-ghost text-xs py-1 min-h-0">Security Center</button>
                </section>`
          }

          <!-- Operational Queues Grid -->
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <!-- Draft Content -->
            <section id="cc-sec-drafts" class="admin-card p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold">Draft Content (${snap.draftItems.length})</h2>
                <span class="text-[11px] text-[var(--admin-muted)]">Quick Edit · Publish · Archive</span>
              </div>
              <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                ${
                  snap.draftItems.length
                    ? snap.draftItems
                        .slice(0, 12)
                        .map(
                          (item, idx) => `
                        <div class="admin-panel px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
                          <div class="min-w-0">
                            <p class="text-xs font-semibold truncate">${esc(item.label)}</p>
                            <p class="text-[11px] text-[var(--admin-muted)] truncate">${esc(item.categoryLabel)}${item.subLabel ? ` · ${esc(item.subLabel)}` : ""}</p>
                          </div>
                          <div class="flex flex-wrap items-center gap-1.5 shrink-0">
                            <button type="button" data-draft-edit="${idx}" class="btn-secondary text-[11px] py-1 px-2 min-h-[26px]">Edit</button>
                            <button type="button" data-draft-publish="${idx}" class="btn-primary text-[11px] py-1 px-2 min-h-[26px]">Publish</button>
                            <button type="button" data-draft-archive="${idx}" class="btn-ghost text-[11px] py-1 px-2 min-h-[26px]">Archive</button>
                          </div>
                        </div>
                      `
                        )
                        .join("")
                    : `<p class="text-xs text-[var(--admin-muted)] py-3">All checked modules have zero unpublished drafts.</p>`
                }
              </div>
            </section>

            <!-- Pending Reviews -->
            <section id="cc-sec-reviews" class="admin-card p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold">Pending Reviews (${snap.pendingReviews.length})</h2>
                <span class="text-[11px] text-[var(--admin-muted)]">Testimonials &amp; Visitor Inquiries</span>
              </div>
              <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                ${
                  snap.pendingReviews.length
                    ? snap.pendingReviews
                        .slice(0, 12)
                        .map(
                          (rev, idx) => `
                        <div class="admin-panel px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
                          <div class="min-w-0">
                            <div class="flex items-center gap-1.5">
                              <span class="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-[var(--admin-surface-2)] border border-[var(--admin-border)]">${esc(rev.kind)}</span>
                              <p class="text-xs font-semibold truncate">${esc(rev.title)}</p>
                            </div>
                            <p class="text-[11px] text-[var(--admin-muted)] truncate mt-0.5">${esc(rev.meta)}</p>
                          </div>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" data-rev-open="${idx}" class="btn-secondary text-[11px] py-1 px-2 min-h-[26px]">Inspect</button>
                            ${
                              rev.isContact
                                ? `<button type="button" data-rev-markread="${idx}" class="btn-primary text-[11px] py-1 px-2 min-h-[26px]">Mark Read</button>`
                                : rev.status === "draft"
                                ? `<button type="button" data-rev-publish="${idx}" class="btn-primary text-[11px] py-1 px-2 min-h-[26px]">Approve</button>`
                                : `<button type="button" data-rev-unpub="${idx}" class="btn-secondary text-[11px] py-1 px-2 min-h-[26px]">Unpublish</button>`
                            }
                          </div>
                        </div>
                      `
                        )
                        .join("")
                    : `<p class="text-xs text-[var(--admin-muted)] py-3">No testimonials or inquiries awaiting review.</p>`
                }
              </div>
            </section>

            <!-- Scheduled Posts & Releases -->
            <section id="cc-sec-scheduled" class="admin-card p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold">Scheduled Releases (${snap.scheduledItems.length})</h2>
                <button type="button" data-cc-route="scheduled_publishing" class="btn-ghost text-xs py-1 min-h-0">Scheduler Queue →</button>
              </div>
              <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                ${
                  snap.scheduledItems.length
                    ? snap.scheduledItems
                        .slice(0, 10)
                        .map(
                          (item, idx) => `
                        <div class="admin-panel px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
                          <div class="min-w-0">
                            <p class="text-xs font-semibold truncate">${esc(item.label)}</p>
                            <p class="text-[11px] font-mono-tech text-[var(--admin-muted)] truncate">
                              ${esc(item.categoryLabel)} · ${item.publishAt ? new Date(item.publishAt).toLocaleString() : "Unset"}
                            </p>
                          </div>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" data-sched-open="${idx}" class="btn-secondary text-[11px] py-1 px-2 min-h-[26px]">Edit</button>
                            <button type="button" data-sched-pubnow="${idx}" class="btn-primary text-[11px] py-1 px-2 min-h-[26px]">Publish Now</button>
                            <button type="button" data-sched-unsched="${idx}" class="btn-ghost text-[11px] py-1 px-2 min-h-[26px]">Draft</button>
                          </div>
                        </div>
                      `
                        )
                        .join("")
                    : `<p class="text-xs text-[var(--admin-muted)] py-3">No scheduled posts or section releases queued.</p>`
                }
              </div>
            </section>

            <!-- Unread Contact Messages -->
            <section id="cc-sec-contacts" class="admin-card p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold">Unread Contact Messages (${snap.unreadContacts.length})</h2>
                <button type="button" data-cc-route="contact_submissions" class="btn-ghost text-xs py-1 min-h-0">Open Inbox →</button>
              </div>
              <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                ${
                  snap.unreadContacts.length
                    ? snap.unreadContacts
                        .map(
                          (msg, idx) => `
                        <div class="admin-panel px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
                          <div class="min-w-0 flex-1">
                            <p class="text-xs font-semibold truncate">${esc(msg.subject || "Visitor Inquiry")}</p>
                            <p class="text-[11px] text-[var(--admin-muted)] truncate">${esc(msg.name)} &lt;${esc(msg.email)}&gt;</p>
                          </div>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" data-msg-open="${idx}" class="btn-secondary text-[11px] py-1 px-2 min-h-[26px]">Open</button>
                            <button type="button" data-msg-read="${idx}" class="btn-primary text-[11px] py-1 px-2 min-h-[26px]">Read</button>
                            <button type="button" data-msg-arch="${idx}" class="btn-ghost text-[11px] py-1 px-2 min-h-[26px]">Archive</button>
                          </div>
                        </div>
                      `
                        )
                        .join("")
                    : `<p class="text-xs text-[var(--admin-muted)] py-3">Inbox clear — zero unread visitor inquiries.</p>`
                }
              </div>
            </section>
          </div>

          <!-- Recent Edits (Version History) & Recent Activity (Audit Log) -->
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <section class="admin-card p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold">Recent Edits &amp; Version Snapshots</h2>
                <button type="button" data-cc-route="version_history" class="btn-ghost text-xs py-1 min-h-0">Version History →</button>
              </div>
              <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                ${
                  snap.recentEdits.length
                    ? snap.recentEdits
                        .map(
                          (ver, idx) => `
                        <div class="admin-panel px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                          <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-1.5">
                              <span class="font-mono-tech text-[11px] font-bold text-indigo-300">v${esc(ver.version_number)}</span>
                              <span class="font-mono-tech text-[10px] px-1.5 py-0.5 rounded bg-[var(--admin-surface-2)]">${esc(ver.content_type)}</span>
                              ${C().statusBadge(ver.new_status || ver.action)}
                            </div>
                            <p class="text-xs font-medium truncate mt-0.5">${esc(ver.change_summary || ver.action)}</p>
                            <p class="text-[10px] font-mono-tech text-[var(--admin-muted)]">${esc(ver.admin_email || "system")} · ${ver.updated_timestamp ? new Date(ver.updated_timestamp).toLocaleString() : ""}</p>
                          </div>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" data-edit-ver-open="${idx}" class="btn-secondary text-[11px] py-1 px-2 min-h-[26px]">Edit</button>
                            ${
                              ver.action !== "delete" && (ver.new_version || ver.previous_version)
                                ? `<button type="button" data-edit-ver-restore="${idx}" class="btn-ghost text-[11px] py-1 px-2 min-h-[26px]">Restore</button>`
                                : ""
                            }
                          </div>
                        </div>
                      `
                        )
                        .join("")
                    : `<p class="text-xs text-[var(--admin-muted)] py-3">No version snapshots recorded yet.</p>`
                }
              </div>
            </section>

            <section class="admin-card p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold">Recent Admin Activity</h2>
                <button type="button" data-cc-route="audit_logs" class="btn-ghost text-xs py-1 min-h-0">Full Audit Log →</button>
              </div>
              <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                ${
                  snap.recentActivity.length
                    ? snap.recentActivity
                        .map(
                          (log) => `
                        <div class="admin-panel px-3 py-2 flex items-start justify-between gap-3">
                          <div class="min-w-0">
                            <p class="text-xs font-semibold truncate">${esc(log.summary || `${log.action} · ${log.module}`)}</p>
                            <p class="text-[11px] font-mono-tech text-[var(--admin-muted)] truncate">${esc(log.admin_email || "admin")} · ${esc(log.module)}</p>
                          </div>
                          <span class="text-[10px] font-mono-tech text-[var(--admin-muted)] shrink-0 tabular-nums">${log.created_at ? new Date(log.created_at).toLocaleDateString() : ""}</span>
                        </div>
                      `
                        )
                        .join("")
                    : `<p class="text-xs text-[var(--admin-muted)] py-3">No recent activity logged yet.</p>`
                }
              </div>
            </section>
          </div>

          <!-- Admin Shortcuts Grid -->
          <section class="admin-card p-4 space-y-3">
            <h2 class="text-sm font-bold">Admin Shortcuts</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              ${ADMIN_SHORTCUTS.map((sc) =>
                sc.href
                  ? `<a href="${esc(sc.href)}" ${sc.external ? 'target="_blank" rel="noopener noreferrer"' : ""} class="admin-panel p-3 flex items-center gap-2.5 hover:border-[var(--admin-primary)] transition">
                      <i data-lucide="${esc(sc.icon)}" class="w-4 h-4 text-[var(--admin-primary)] shrink-0"></i>
                      <div class="min-w-0">
                        <p class="text-xs font-semibold truncate">${esc(sc.label)}</p>
                        <p class="text-[10px] text-[var(--admin-muted)] truncate">${esc(sc.sub)}</p>
                      </div>
                    </a>`
                  : `<button type="button" data-cc-route="${esc(sc.routeKey)}" class="admin-panel p-3 flex items-center gap-2.5 text-left hover:border-[var(--admin-primary)] transition">
                      <i data-lucide="${esc(sc.icon)}" class="w-4 h-4 text-[var(--admin-primary)] shrink-0"></i>
                      <div class="min-w-0">
                        <p class="text-xs font-semibold truncate">${esc(sc.label)}</p>
                        <p class="text-[10px] text-[var(--admin-muted)] truncate">${esc(sc.sub)}</p>
                      </div>
                    </button>`
              ).join("")}
            </div>
          </section>
        </div>
      `;

      const refreshView = () => renderDashboard(mount);

      document.getElementById("cc-launch-palette")?.addEventListener("click", () => openCommandPalette());
      document.getElementById("cc-inline-search-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const q = document.getElementById("cc-inline-search-input")?.value.trim() || "";
        window.AdminRouter.navigateTo("global-search", q ? { q } : null);
      });

      mount.querySelectorAll("[data-cc-route]").forEach((btn) => {
        btn.addEventListener("click", () => window.AdminRouter.navigateTo(btn.getAttribute("data-cc-route")));
      });

      mount.querySelectorAll("[data-cc-scroll-tab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = `cc-sec-${btn.getAttribute("data-cc-scroll-tab")}`;
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });

      mount.querySelectorAll("[data-cc-create]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const sc = QUICK_CREATE_SHORTCUTS[Number(btn.getAttribute("data-cc-create"))];
          if (sc) openTargetRecord({ routeKey: sc.routeKey, create: Boolean(sc.create), onRefresh: refreshView });
        });
      });

      // Draft item actions
      mount.querySelectorAll("[data-draft-edit]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = snap.draftItems[Number(btn.getAttribute("data-draft-edit"))];
          if (item) openTargetRecord({ table: item.table, routeKey: item.routeKey, id: item.id, pageSlug: item.raw && item.raw.page_slug, onRefresh: refreshView });
        });
      });
      mount.querySelectorAll("[data-draft-publish]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = snap.draftItems[Number(btn.getAttribute("data-draft-publish"))];
          if (item) runQuickStatusAction({ table: item.table, id: item.id, label: item.label, nextStatus: "published", onRefresh: refreshView });
        });
      });
      mount.querySelectorAll("[data-draft-archive]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = snap.draftItems[Number(btn.getAttribute("data-draft-archive"))];
          if (item) runQuickStatusAction({ table: item.table, id: item.id, label: item.label, nextStatus: "archived", onRefresh: refreshView });
        });
      });

      // Pending review actions
      mount.querySelectorAll("[data-rev-open]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const rev = snap.pendingReviews[Number(btn.getAttribute("data-rev-open"))];
          if (rev) openTargetRecord({ table: rev.table, routeKey: rev.routeKey, id: rev.id, onRefresh: refreshView });
        });
      });
      mount.querySelectorAll("[data-rev-markread]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const rev = snap.pendingReviews[Number(btn.getAttribute("data-rev-markread"))];
          if (rev) runQuickStatusAction({ table: "contact_submissions", id: rev.id, label: rev.title, nextStatus: "read", onRefresh: refreshView });
        });
      });
      mount.querySelectorAll("[data-rev-publish]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const rev = snap.pendingReviews[Number(btn.getAttribute("data-rev-publish"))];
          if (rev) runQuickStatusAction({ table: rev.table, id: rev.id, label: rev.title, nextStatus: "published", onRefresh: refreshView });
        });
      });
      mount.querySelectorAll("[data-rev-unpub]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const rev = snap.pendingReviews[Number(btn.getAttribute("data-rev-unpub"))];
          if (rev) runQuickStatusAction({ table: rev.table, id: rev.id, label: rev.title, nextStatus: "draft", currentlyPublished: true, onRefresh: refreshView });
        });
      });

      // Scheduled actions
      mount.querySelectorAll("[data-sched-open]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = snap.scheduledItems[Number(btn.getAttribute("data-sched-open"))];
          if (item) openTargetRecord({ table: item.table, routeKey: item.routeKey, id: item.id, pageSlug: item.pageSlug, onRefresh: refreshView });
        });
      });
      mount.querySelectorAll("[data-sched-pubnow]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = snap.scheduledItems[Number(btn.getAttribute("data-sched-pubnow"))];
          if (item) runQuickStatusAction({ table: item.table, id: item.id, label: item.label, nextStatus: "published", onRefresh: refreshView });
        });
      });
      mount.querySelectorAll("[data-sched-unsched]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = snap.scheduledItems[Number(btn.getAttribute("data-sched-unsched"))];
          if (item) runQuickStatusAction({ table: item.table, id: item.id, label: item.label, nextStatus: "draft", onRefresh: refreshView });
        });
      });

      // Contact inbox actions
      mount.querySelectorAll("[data-msg-open]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const msg = snap.unreadContacts[Number(btn.getAttribute("data-msg-open"))];
          if (msg && window.AdminApp) window.AdminApp.openContactDetailModal(msg, refreshView);
        });
      });
      mount.querySelectorAll("[data-msg-read]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const msg = snap.unreadContacts[Number(btn.getAttribute("data-msg-read"))];
          if (msg) runQuickStatusAction({ table: "contact_submissions", id: msg.id, label: msg.subject, nextStatus: "read", onRefresh: refreshView });
        });
      });
      mount.querySelectorAll("[data-msg-arch]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const msg = snap.unreadContacts[Number(btn.getAttribute("data-msg-arch"))];
          if (msg) runQuickStatusAction({ table: "contact_submissions", id: msg.id, label: msg.subject, nextStatus: "archived", onRefresh: refreshView });
        });
      });

      // Recent version edits actions
      mount.querySelectorAll("[data-edit-ver-open]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const ver = snap.recentEdits[Number(btn.getAttribute("data-edit-ver-open"))];
          if (!ver) return;
          const entry = DB().resolveCatalogRoute(ver.content_type);
          openTargetRecord({
            table: ver.content_type,
            routeKey: entry.routeKey,
            id: ver.content_id,
            pageSlug: ver.new_version && ver.new_version.page_slug ? ver.new_version.page_slug : "",
            onRefresh: refreshView
          });
        });
      });
      mount.querySelectorAll("[data-edit-ver-restore]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const ver = snap.recentEdits[Number(btn.getAttribute("data-edit-ver-restore"))];
          if (ver) runQuickRestoreVersion(ver, "draft", refreshView);
        });
      });

      C().refreshIcons();
    } catch (err) {
      mount.innerHTML = C().renderErrorState({ title: "Command Center Unavailable", message: err.message, retryId: "cc-retry" });
      document.getElementById("cc-retry")?.addEventListener("click", () => renderDashboard(mount));
      C().refreshIcons();
    }
  }

  // =========================================================================
  // ENHANCED 11-CATEGORY GLOBAL SEARCH PAGE (#/global-search)
  // =========================================================================
  async function renderGlobalSearch(mount, initialQuery = "") {
    const esc = C().escapeHtml;
    const perm = await verifyAdminAction("search");
    if (!perm.allowed) {
      mount.innerHTML = C().renderErrorState({ title: "Search Access Denied", message: perm.reason || "Active admin permissions required." });
      C().refreshIcons();
      return;
    }

    const cats = DB().GLOBAL_SEARCH_CATEGORIES;
    let activeCategory = "all";
    let seedQuery = String(initialQuery || "").trim();

    mount.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 class="text-xl font-bold">Global Portfolio CMS Search</h1>
            <p class="text-xs sm:text-sm text-[var(--admin-muted)]">Search across all 11 modules: Pages, Projects, Blog, Skills, Services, Certificates, Testimonials, Media, Settings, Features &amp; Contacts.</p>
          </div>
          <button type="button" id="gs-open-palette" class="btn-secondary text-xs">Open Ctrl+K Palette</button>
        </div>

        <form id="gs-form" class="admin-card p-3.5 flex flex-col sm:flex-row gap-2.5">
          <input id="gs-input" type="search" class="admin-input flex-1" placeholder="Search titles, slugs, skills, issuers, filenames, emails..." value="${esc(seedQuery)}">
          <select id="gs-category" class="admin-select sm:w-48" aria-label="Search category filter">
            ${cats.map((c) => `<option value="${esc(c.key)}">${esc(c.label)}</option>`).join("")}
          </select>
          <button type="submit" class="btn-primary">Search</button>
        </form>

        <div id="gs-results"></div>
      </div>
    `;

    const resultsMount = document.getElementById("gs-results");
    const inputEl = document.getElementById("gs-input");
    const catSelect = document.getElementById("gs-category");

    async function runSearch(term) {
      const q = String(term || "").trim();
      seedQuery = q;
      if (!q) {
        resultsMount.innerHTML = C().renderEmptyState({
          icon: "search",
          title: "Search Across All CMS Records",
          description: "Enter a keyword above or press Ctrl+K / Cmd+K anywhere in the Admin Panel."
        });
        C().refreshIcons();
        return;
      }

      const authCheck = await verifyAdminAction("search");
      if (!authCheck.allowed) {
        resultsMount.innerHTML = C().renderErrorState({ message: authCheck.reason });
        C().refreshIcons();
        return;
      }

      resultsMount.innerHTML = C().renderSkeleton(4);
      try {
        const res = await DB().globalCommandSearch(q, { category: activeCategory, limitPerTable: 10, adminProfile: authCheck.profile });
        if (!res.groups.length) {
          resultsMount.innerHTML = C().renderEmptyState({
            icon: "search-x",
            title: `No authorized records matched "${q}"`,
            description: "Try broadening your query or switching to All Categories."
          });
          C().refreshIcons();
          return;
        }

        const flatList = [];
        resultsMount.innerHTML = res.groups
          .map((group) => {
            const rowsHtml = group.items
              .map((rec) => {
                const idx = flatList.length;
                flatList.push(rec);
                const canPublish = rec.hasStatus && !rec.isContact && rec.status !== "published";
                const canUnpublish = rec.hasStatus && !rec.isContact && rec.status === "published";
                const canArchive = rec.hasStatus && rec.status !== "archived";
                return `
                  <div class="admin-panel px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <p class="text-xs sm:text-sm font-semibold truncate">${esc(rec.label)}</p>
                      <p class="text-[11px] text-[var(--admin-muted)] truncate">${esc(rec.subLabel || rec.table)}</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5 shrink-0">
                      ${rec.status ? C().statusBadge(rec.status) : ""}
                      <button type="button" data-gs-open="${idx}" class="btn-secondary text-xs py-1 px-2.5 min-h-[28px]">Open / Edit</button>
                      ${canPublish ? `<button type="button" data-gs-status="published" data-gs-idx="${idx}" class="btn-primary text-xs py-1 px-2.5 min-h-[28px]">Publish</button>` : ""}
                      ${canUnpublish ? `<button type="button" data-gs-status="draft" data-gs-idx="${idx}" class="btn-secondary text-xs py-1 px-2.5 min-h-[28px]">Unpublish</button>` : ""}
                      ${canArchive ? `<button type="button" data-gs-status="archived" data-gs-idx="${idx}" class="btn-ghost text-xs py-1 px-2.5 min-h-[28px]">Archive</button>` : ""}
                    </div>
                  </div>
                `;
              })
              .join("");

            return `
              <section class="admin-card p-4 space-y-2.5 mb-3">
                <div class="flex items-center justify-between">
                  <h2 class="text-sm font-bold">${esc(group.categoryLabel)} (${group.items.length})</h2>
                </div>
                <div class="space-y-1.5">${rowsHtml}</div>
              </section>
            `;
          })
          .join("");

        resultsMount.querySelectorAll("[data-gs-open]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const rec = flatList[Number(btn.getAttribute("data-gs-open"))];
            if (rec) {
              openTargetRecord({
                table: rec.table,
                routeKey: rec.routeKey,
                id: rec.id,
                pageSlug: rec.raw && rec.raw.page_slug ? rec.raw.page_slug : "",
                inspect: rec.isMedia,
                onRefresh: () => runSearch(seedQuery)
              });
            }
          });
        });

        resultsMount.querySelectorAll("[data-gs-status]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const rec = flatList[Number(btn.getAttribute("data-gs-idx"))];
            const nextStatus = btn.getAttribute("data-gs-status");
            if (rec) {
              runQuickStatusAction({
                table: rec.table,
                id: rec.id,
                label: rec.label,
                nextStatus,
                currentlyPublished: rec.status === "published",
                onRefresh: () => runSearch(seedQuery)
              });
            }
          });
        });

        C().refreshIcons();
      } catch (err) {
        resultsMount.innerHTML = C().renderErrorState({ message: err.message });
        C().refreshIcons();
      }
    }

    document.getElementById("gs-open-palette")?.addEventListener("click", () => openCommandPalette(inputEl.value));
    document.getElementById("gs-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      runSearch(inputEl.value);
    });
    catSelect?.addEventListener("change", () => {
      activeCategory = catSelect.value;
      if (inputEl.value.trim()) runSearch(inputEl.value);
    });

    await runSearch(seedQuery);
  }

  // =========================================================================
  // GLOBAL KEYBOARD SHORTCUT (Ctrl+K / Cmd+K) & TOPBAR TRIGGERS
  // =========================================================================
  function bindGlobalCommandCenterShortcuts() {
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && String(e.key || "").toLowerCase() === "k") {
        e.preventDefault();
        if (PALETTE_STATE.isOpen) closeCommandPalette();
        else openCommandPalette();
      }
    });

    document.querySelectorAll("[data-open-command-palette]").forEach((btn) => {
      btn.addEventListener("click", () => openCommandPalette());
    });
  }

  document.addEventListener("DOMContentLoaded", bindGlobalCommandCenterShortcuts);

  window.AdminCommandCenter = {
    openCommandPalette,
    closeCommandPalette,
    renderDashboard,
    renderGlobalSearch,
    verifyAdminAction,
    buildTargetHref,
    QUICK_CREATE_SHORTCUTS,
    ADMIN_SHORTCUTS
  };
})();
