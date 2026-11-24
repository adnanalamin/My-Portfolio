/**
 * AL AMIN Admin CMS — Section Manager Controller (Phase 66)
 * Centralized console to create, filter, search, reorder, enable/disable,
 * duplicate (same or target page), quick-edit, bulk-publish, and delete sections.
 */
(() => {
  const THEME_KEY = "alamin_admin_theme_v1";
  const STATE = {
    rows: [],
    selectedIds: new Set(),
    pageFilter: "all",
    typeFilter: "all",
    statusFilter: "all",
    enabledFilter: "all",
    search: ""
  };

  function C() {
    return window.AdminComponents;
  }

  function R() {
    return window.PortfolioSectionRegistry;
  }

  function notify(msg, type = "info") {
    if (window.AdminNotifications) window.AdminNotifications.notify(msg, type);
  }

  function initTheme() {
    const saved = window.localStorage.getItem(THEME_KEY);
    const clean = saved === "light" ? "light" : "dark";
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(clean);
    const label = document.getElementById("sm-theme-label");
    if (label) label.textContent = clean === "dark" ? "Light Mode" : "Dark Mode";
    document.getElementById("sm-theme-toggle")?.addEventListener("click", () => {
      const next = document.documentElement.classList.contains("light") ? "dark" : "light";
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(next);
      window.localStorage.setItem(THEME_KEY, next);
      if (label) label.textContent = next === "dark" ? "Light Mode" : "Dark Mode";
    });
  }

  function getFilteredRows() {
    const q = STATE.search.trim().toLowerCase();
    return STATE.rows.filter((r) => {
      if (STATE.pageFilter !== "all" && r.page_slug !== STATE.pageFilter) return false;
      if (STATE.typeFilter !== "all" && r.section_type !== STATE.typeFilter) return false;
      if (STATE.statusFilter !== "all" && r.status !== STATE.statusFilter) return false;
      if (STATE.enabledFilter === "enabled" && !r.enabled) return false;
      if (STATE.enabledFilter === "disabled" && r.enabled) return false;
      if (q) {
        const hay = `${r.title} ${r.subtitle} ${r.page_slug} ${r.section_type} ${r.section_key}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  async function fetchSections() {
    const mount = document.getElementById("sm-list-mount");
    if (mount) mount.innerHTML = C().renderSkeleton(5);

    const client = window.AdminAuth.getClient();
    const { data, error } = await client
      .from("page_sections")
      .select("*")
      .order("page_slug", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      if (mount) mount.innerHTML = C().renderErrorState({ message: error.message });
      return;
    }

    STATE.rows = Array.isArray(data) ? data : [];
    populatePageFilterOptions();
    renderTable();
  }

  function populatePageFilterOptions() {
    const sel = document.getElementById("sm-page-filter");
    if (!sel) return;
    const knownPages = Array.from(
      new Set([
        "index.html", "about.html", "skills.html", "services.html",
        "projects.html", "experience.html", "certificates.html", "blog.html", "contact.html",
        ...STATE.rows.map((r) => r.page_slug).filter(Boolean)
      ])
    );
    const cur = STATE.pageFilter;
    sel.innerHTML = `<option value="all">All Pages</option>${knownPages
      .map((slug) => `<option value="${C().escapeHtml(slug)}" ${cur === slug ? "selected" : ""}>${C().escapeHtml(slug)}</option>`)
      .join("")}`;
  }

  function syncBulkBar() {
    const bar = document.getElementById("sm-bulk-bar");
    const count = document.getElementById("sm-bulk-count");
    if (!bar) return;
    bar.classList.toggle("hidden", STATE.selectedIds.size === 0);
    if (count) count.textContent = `${STATE.selectedIds.size} selected`;
  }

  function openSectionModal(existingRow = null) {
    const isEdit = Boolean(existingRow && existingRow.id);
    const row = existingRow || R().createDefaultSection("hero", STATE.pageFilter !== "all" ? STATE.pageFilter : "index.html", STATE.rows.length);
    const vis = row.visibility_config || { desktop: true, tablet: true, mobile: true };
    const st = row.style_config || {};
    const ly = row.layout_config || {};
    const an = row.animation_config || {};

    C().showModal({
      title: isEdit ? `Edit Section — ${row.title || row.section_type}` : "Create New Page Section",
      maxWidth: "700px",
      bodyHtml: `
        <form id="sm-modal-form" class="space-y-3.5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="admin-label" for="sm-f-page">Target Page Slug</label>
              <input id="sm-f-page" class="admin-input text-xs font-mono-tech" value="${C().escapeHtml(row.page_slug || "index.html")}" required>
            </div>
            <div>
              <label class="admin-label" for="sm-f-type">Safe Section Type</label>
              <select id="sm-f-type" class="admin-select text-xs" ${isEdit ? "disabled" : ""}>
                ${R().SECTION_TYPES.map((t) => `<option value="${t.type}" ${row.section_type === t.type ? "selected" : ""}>${C().escapeHtml(t.label)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="admin-label" for="sm-f-title">Section Title</label>
              <input id="sm-f-title" class="admin-input text-xs" value="${C().escapeHtml(row.title || "")}" required>
            </div>
            <div>
              <label class="admin-label" for="sm-f-key">Anchor Key</label>
              <input id="sm-f-key" class="admin-input text-xs font-mono-tech" value="${C().escapeHtml(row.section_key || "")}">
            </div>
          </div>

          <div>
            <label class="admin-label" for="sm-f-subtitle">Subtitle</label>
            <textarea id="sm-f-subtitle" class="admin-textarea text-xs min-h-[70px]">${C().escapeHtml(row.subtitle || "")}</textarea>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label class="admin-label" for="sm-f-status">Status</label>
              <select id="sm-f-status" class="admin-select text-xs">
                ${["draft", "published", "scheduled", "archived"].map((s) => `<option value="${s}" ${row.status === s ? "selected" : ""}>${s}</option>`).join("")}
              </select>
            </div>
            <div>
              <label class="admin-label" for="sm-f-order">Sort Order</label>
              <input id="sm-f-order" type="number" class="admin-input text-xs" value="${C().escapeHtml(row.sort_order ?? 0)}">
            </div>
            <div>
              <label class="admin-label" for="sm-f-variant">Layout</label>
              <select id="sm-f-variant" class="admin-select text-xs">
                ${["grid", "list", "split", "centered"].map((v) => `<option value="${v}" ${ly.variant === v ? "selected" : ""}>${v}</option>`).join("")}
              </select>
            </div>
            <div>
              <label class="admin-label" for="sm-f-anim">Animation</label>
              <select id="sm-f-anim" class="admin-select text-xs">
                ${["none", "fade-up", "fade-in", "slide-left", "slide-right", "zoom-in"].map((a) => `<option value="${a}" ${an.preset === a ? "selected" : ""}>${a}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="admin-label" for="sm-f-publish-at">Scheduled Publish At (if status = scheduled)</label>
              <input id="sm-f-publish-at" type="datetime-local" class="admin-input text-xs" value="${C().escapeHtml(row.publish_at ? String(row.publish_at).slice(0, 16) : "")}">
            </div>
            <div>
              <label class="admin-label" for="sm-f-summary">Change Summary (Version History)</label>
              <input id="sm-f-summary" type="text" class="admin-input text-xs" placeholder="Summarize section update...">
            </div>
          </div>

          <div class="admin-panel p-3 flex flex-wrap gap-4 text-xs">
            <label class="flex items-center gap-2"><input id="sm-f-enabled" type="checkbox" class="accent-indigo-500" ${row.enabled !== false ? "checked" : ""}> Enabled</label>
            <label class="flex items-center gap-2"><input id="sm-f-vd" type="checkbox" class="accent-indigo-500" ${vis.desktop !== false ? "checked" : ""}> Desktop</label>
            <label class="flex items-center gap-2"><input id="sm-f-vt" type="checkbox" class="accent-indigo-500" ${vis.tablet !== false ? "checked" : ""}> Tablet</label>
            <label class="flex items-center gap-2"><input id="sm-f-vm" type="checkbox" class="accent-indigo-500" ${vis.mobile !== false ? "checked" : ""}> Mobile</label>
          </div>
        </form>
      `,
      footerHtml: `
        <div class="flex justify-end gap-2">
          <button type="button" id="sm-modal-cancel" class="btn-secondary">Cancel</button>
          <button type="submit" form="sm-modal-form" class="btn-primary">${isEdit ? "Save Changes" : "Create Section"}</button>
        </div>
      `,
      onMount: ({ bodyEl, footerEl, close }) => {
        footerEl.querySelector("#sm-modal-cancel").addEventListener("click", close);
        bodyEl.querySelector("#sm-modal-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const DB = window.AdminDatabase;
          const type = bodyEl.querySelector("#sm-f-type").value;
          const base = isEdit ? row : R().createDefaultSection(type, bodyEl.querySelector("#sm-f-page").value.trim(), 0);
          const nextStatus = bodyEl.querySelector("#sm-f-status").value;
          const publishAtRaw = bodyEl.querySelector("#sm-f-publish-at").value;
          const publishAtIso = publishAtRaw ? new Date(publishAtRaw).toISOString() : null;
          if (nextStatus === "scheduled" && !publishAtIso) {
            notify("Scheduled publishing requires a valid Publish Date & Time.", "warning");
            return;
          }

          let changeSummary = bodyEl.querySelector("#sm-f-summary").value.trim();
          const payload = {
            page_slug: bodyEl.querySelector("#sm-f-page").value.trim() || "index.html",
            section_type: isEdit ? row.section_type : type,
            section_key: bodyEl.querySelector("#sm-f-key").value.trim() || `${type}-${Date.now().toString(36).slice(-4)}`,
            title: bodyEl.querySelector("#sm-f-title").value.trim(),
            subtitle: bodyEl.querySelector("#sm-f-subtitle").value.trim(),
            status: nextStatus,
            publish_at: publishAtIso,
            sort_order: Number(bodyEl.querySelector("#sm-f-order").value) || 0,
            enabled: bodyEl.querySelector("#sm-f-enabled").checked,
            content: base.content || {},
            style_config: st,
            layout_config: { ...ly, variant: bodyEl.querySelector("#sm-f-variant").value },
            animation_config: { ...an, preset: bodyEl.querySelector("#sm-f-anim").value },
            visibility_config: {
              desktop: bodyEl.querySelector("#sm-f-vd").checked,
              tablet: bodyEl.querySelector("#sm-f-vt").checked,
              mobile: bodyEl.querySelector("#sm-f-vm").checked
            }
          };

          const currentlyPublished = Boolean(isEdit && row.status === "published");
          if (nextStatus === "published" || nextStatus === "scheduled" || currentlyPublished) {
            const conf = await C().confirmPublishDialog({
              moduleTitle: "Page Section",
              recordLabel: payload.title || payload.section_type,
              targetStatus: nextStatus,
              currentlyPublished,
              existingUpdatedAt: row.updated_at || "",
              publishAt: publishAtIso || "",
              defaultSummary: changeSummary || `${isEdit ? "Updated" : "Created"} section "${payload.title}"`
            });
            if (!conf.confirmed) return;
            if (conf.changeSummary) changeSummary = conf.changeSummary;
          }

          try {
            if (isEdit) {
              await DB.updateRecord("page_sections", row.id, payload, "Updated", { changeSummary });
              notify("Section updated and snapshot recorded.", "success");
            } else {
              await DB.createRecord("page_sections", payload, "Created", { changeSummary });
              notify("Section created.", "success");
            }
            if (window.PortfolioCache) window.PortfolioCache.invalidate("table_page_sections");
            close();
            fetchSections();
          } catch (err) {
            notify(err.message, "error");
          }
        });
      }
    });
  }

  function openSectionHistoryModal(row) {
    const DB = window.AdminDatabase;
    C().showModal({
      title: `Section Version History — ${row.title || row.section_type}`,
      maxWidth: "760px",
      bodyHtml: `<div id="sm-hist-mount">${C().renderSkeleton(4)}</div>`,
      onMount: async ({ bodyEl, close }) => {
        const mount = bodyEl.querySelector("#sm-hist-mount");
        try {
          const { rows } = await DB.listVersionHistory({
            contentType: "page_sections",
            contentId: String(row.id),
            page: 1,
            pageSize: 30
          });
          if (!rows.length) {
            mount.innerHTML = C().renderEmptyState({
              icon: "history",
              title: "No version snapshots yet",
              description: "Updates, publishes, and schedules automatically record snapshots."
            });
            C().refreshIcons();
            return;
          }
          mount.innerHTML = `<div class="space-y-2.5">${rows
            .map(
              (v) => `
              <div class="admin-panel p-3 flex flex-wrap items-center justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-xs sm:text-sm font-bold">v${C().escapeHtml(v.version_number)} ${C().statusBadge(v.new_status || v.action)} · ${C().escapeHtml(v.change_summary || v.action)}</p>
                  <p class="text-[11px] font-mono-tech text-[var(--admin-muted)]">Admin ID: ${C().escapeHtml(v.admin_id || "system-cron")} (${C().escapeHtml(v.admin_email || "system")}) · ${new Date(v.updated_timestamp).toLocaleString()}</p>
                </div>
                <div class="flex items-center gap-1.5">
                  <button type="button" class="btn-secondary text-xs py-1 min-h-0" data-sm-restore="${C().escapeHtml(v.id)}" data-sm-rstatus="draft">Restore Draft</button>
                  <button type="button" class="btn-primary text-xs py-1 min-h-0" data-sm-restore="${C().escapeHtml(v.id)}" data-sm-rstatus="published">Restore &amp; Publish</button>
                </div>
              </div>
            `
            )
            .join("")}</div>`;

          mount.querySelectorAll("[data-sm-restore]").forEach((btn) => {
            btn.addEventListener("click", async () => {
              const verId = btn.getAttribute("data-sm-restore");
              const targetStatus = btn.getAttribute("data-sm-rstatus") || "draft";
              const ver = rows.find((x) => String(x.id) === String(verId));
              if (!ver) return;
              close();
              let summary = `Restored section v${ver.version_number} as ${targetStatus}`;
              if (targetStatus === "published") {
                const conf = await C().confirmPublishDialog({
                  moduleTitle: "Page Section",
                  recordLabel: row.title || row.section_type,
                  targetStatus: "published",
                  currentlyPublished: row.status === "published",
                  defaultSummary: summary
                });
                if (!conf.confirmed) return;
                if (conf.changeSummary) summary = conf.changeSummary;
              }
              try {
                await DB.restoreContentVersion(verId, { targetStatus, changeSummary: summary });
                if (window.PortfolioCache) window.PortfolioCache.invalidate("table_page_sections");
                notify(`Restored section v${ver.version_number} (${targetStatus}).`, "success");
                fetchSections();
              } catch (err) {
                notify(err.message, "error");
              }
            });
          });
          C().refreshIcons();
        } catch (err) {
          mount.innerHTML = C().renderErrorState({ message: err.message });
          C().refreshIcons();
        }
      }
    });
  }

  function renderTable() {
    const mount = document.getElementById("sm-list-mount");
    if (!mount) return;
    const filtered = getFilteredRows();

    if (!filtered.length) {
      mount.innerHTML = C().renderEmptyState({
        icon: "layers",
        title: "No Page Sections Found",
        description: "Create a section directly or open the Visual Website Builder to compose any portfolio page.",
        actionLabel: "+ Create Section",
        actionId: "sm-empty-create"
      });
      document.getElementById("sm-empty-create")?.addEventListener("click", () => openSectionModal(null));
      C().refreshIcons();
      return;
    }

    const desktopRows = filtered
      .map((r) => {
        const checked = STATE.selectedIds.has(r.id) ? "checked" : "";
        const vis = r.visibility_config || { desktop: true, tablet: true, mobile: true };
        const visSummary = ["D", "T", "M"]
          .filter((k, idx) => (idx === 0 ? vis.desktop !== false : idx === 1 ? vis.tablet !== false : vis.mobile !== false))
          .join(" · ") || "Hidden";

        return `
          <tr>
            <td class="w-10"><input type="checkbox" class="sm-cb w-4 h-4 accent-indigo-500" data-sm-id="${C().escapeHtml(r.id)}" ${checked}></td>
            <td class="font-mono-tech text-xs tabular-nums">${C().escapeHtml(r.sort_order)}</td>
            <td class="font-medium max-w-[220px] truncate">${C().escapeHtml(r.title || r.section_type)}</td>
            <td class="font-mono-tech text-xs">${C().escapeHtml(r.page_slug)}</td>
            <td class="font-mono-tech text-xs">${C().escapeHtml(r.section_type)}</td>
            <td class="text-xs font-mono-tech">${C().escapeHtml(visSummary)}</td>
            <td>
              <button type="button" class="btn-ghost text-xs py-1 px-2 min-h-0" data-sm-toggle="${C().escapeHtml(r.id)}">${r.enabled ? "Enabled" : "Disabled"}</button>
            </td>
            <td>${C().statusBadge(r.status)}</td>
            <td class="text-right whitespace-nowrap">
              <div class="inline-flex items-center gap-1.5">
                <a href="page-builder.html?page=${encodeURIComponent(r.page_slug)}&section=${encodeURIComponent(r.id)}" class="btn-secondary text-xs py-1 px-2 min-h-[30px]">Design</a>
                <button type="button" class="btn-secondary text-xs py-1 px-2 min-h-[30px]" data-sm-edit="${C().escapeHtml(r.id)}">Edit</button>
                <button type="button" class="btn-ghost text-xs py-1 px-2 min-h-[30px]" data-sm-hist="${C().escapeHtml(r.id)}">History</button>
                <button type="button" class="btn-ghost text-xs py-1 px-2 min-h-[30px]" data-sm-dup="${C().escapeHtml(r.id)}">Duplicate</button>
                <button type="button" class="btn-danger text-xs py-1 px-2 min-h-[30px]" data-sm-del="${C().escapeHtml(r.id)}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    const mobileCards = filtered
      .map(
        (r) => `
        <article class="admin-card p-3.5 space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <label class="flex items-start gap-2 min-w-0">
              <input type="checkbox" class="sm-cb w-4 h-4 mt-0.5 accent-indigo-500" data-sm-id="${C().escapeHtml(r.id)}" ${STATE.selectedIds.has(r.id) ? "checked" : ""}>
              <div class="min-w-0">
                <p class="font-semibold text-sm truncate">${C().escapeHtml(r.title || r.section_type)}</p>
                <p class="text-xs font-mono-tech text-[var(--admin-muted)]">${C().escapeHtml(r.page_slug)} · ${C().escapeHtml(r.section_type)}</p>
              </div>
            </label>
            ${C().statusBadge(r.status)}
          </div>
          <div class="flex flex-wrap gap-2">
            <a href="page-builder.html?page=${encodeURIComponent(r.page_slug)}&section=${encodeURIComponent(r.id)}" class="btn-secondary text-xs flex-1">Visual Builder</a>
            <button type="button" class="btn-secondary text-xs" data-sm-edit="${C().escapeHtml(r.id)}">Edit</button>
            <button type="button" class="btn-secondary text-xs" data-sm-hist="${C().escapeHtml(r.id)}">History</button>
            <button type="button" class="btn-secondary text-xs" data-sm-toggle="${C().escapeHtml(r.id)}">${r.enabled ? "Disable" : "Enable"}</button>
            <button type="button" class="btn-danger text-xs" data-sm-del="${C().escapeHtml(r.id)}">Delete</button>
          </div>
        </article>
      `
      )
      .join("");

    mount.innerHTML = `
      <div class="admin-card overflow-hidden admin-desktop-table">
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th class="w-10"><input type="checkbox" id="sm-select-all" class="w-4 h-4 accent-indigo-500"></th>
                <th>Order</th>
                <th>Title</th>
                <th>Page</th>
                <th>Type</th>
                <th>Devices</th>
                <th>Active</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>${desktopRows}</tbody>
          </table>
        </div>
      </div>
      <div class="admin-mobile-cards">${mobileCards}</div>
    `;

    document.getElementById("sm-select-all")?.addEventListener("change", (e) => {
      filtered.forEach((r) => {
        if (e.target.checked) STATE.selectedIds.add(r.id);
        else STATE.selectedIds.delete(r.id);
      });
      renderTable();
      syncBulkBar();
    });

    mount.querySelectorAll(".sm-cb").forEach((cb) => {
      cb.addEventListener("change", () => {
        const id = cb.getAttribute("data-sm-id");
        if (cb.checked) STATE.selectedIds.add(id);
        else STATE.selectedIds.delete(id);
        syncBulkBar();
      });
    });

    mount.querySelectorAll("[data-sm-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const row = STATE.rows.find((r) => String(r.id) === String(btn.getAttribute("data-sm-edit")));
        if (row) openSectionModal(row);
      });
    });

    mount.querySelectorAll("[data-sm-hist]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const row = STATE.rows.find((r) => String(r.id) === String(btn.getAttribute("data-sm-hist")));
        if (row) openSectionHistoryModal(row);
      });
    });

    mount.querySelectorAll("[data-sm-toggle]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const row = STATE.rows.find((r) => String(r.id) === String(btn.getAttribute("data-sm-toggle")));
        if (!row) return;
        try {
          await window.AdminDatabase.updateRecord("page_sections", row.id, { enabled: !row.enabled });
          if (window.PortfolioCache) window.PortfolioCache.invalidate("table_page_sections");
          notify(`Section ${!row.enabled ? "enabled" : "disabled"}.`, "success");
          fetchSections();
        } catch (err) {
          notify(err.message, "error");
        }
      });
    });

    mount.querySelectorAll("[data-sm-dup]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const row = STATE.rows.find((r) => String(r.id) === String(btn.getAttribute("data-sm-dup")));
        if (!row) return;
        try {
          const clone = { ...row };
          delete clone.id;
          delete clone.created_at;
          delete clone.updated_at;
          clone.title = `${clone.title || clone.section_type} (Copy)`;
          clone.status = "draft";
          clone.sort_order = Number(row.sort_order || 0) + 1;
          await window.AdminDatabase.createRecord("page_sections", clone, "Duplicated section");
          notify("Section duplicated as draft.", "success");
          fetchSections();
        } catch (err) {
          notify(err.message, "error");
        }
      });
    });

    mount.querySelectorAll("[data-sm-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const row = STATE.rows.find((r) => String(r.id) === String(btn.getAttribute("data-sm-del")));
        if (!row) return;
        const ok = await C().confirmDialog({
          title: "Delete Section",
          message: `Permanently delete "${row.title || row.section_type}" from ${row.page_slug}?`,
          confirmLabel: "Delete",
          danger: true
        });
        if (!ok) return;
        try {
          await window.AdminDatabase.deleteRecord("page_sections", row.id, row.title || row.section_type);
          if (window.PortfolioCache) window.PortfolioCache.invalidate("table_page_sections");
          STATE.selectedIds.delete(row.id);
          syncBulkBar();
          notify("Section deleted.", "success");
          fetchSections();
        } catch (err) {
          notify(err.message, "error");
        }
      });
    });

    syncBulkBar();
    C().refreshIcons();
  }

  async function init() {
    initTheme();
    const state = await window.AdminPermissions.requireAuthorizedAdmin({ loginUrl: "login.html" });
    if (!state) return;

    const typeSel = document.getElementById("sm-type-filter");
    if (typeSel) {
      typeSel.innerHTML = `<option value="all">All Section Types</option>${R().SECTION_TYPES.map((t) => `<option value="${t.type}">${C().escapeHtml(t.label)}</option>`).join("")}`;
    }

    document.getElementById("sm-create-btn")?.addEventListener("click", () => openSectionModal(null));
    document.getElementById("sm-search")?.addEventListener("input", (e) => { STATE.search = e.target.value; renderTable(); });
    document.getElementById("sm-page-filter")?.addEventListener("change", (e) => { STATE.pageFilter = e.target.value; renderTable(); });
    document.getElementById("sm-type-filter")?.addEventListener("change", (e) => { STATE.typeFilter = e.target.value; renderTable(); });
    document.getElementById("sm-status-filter")?.addEventListener("change", (e) => { STATE.statusFilter = e.target.value; renderTable(); });
    document.getElementById("sm-enabled-filter")?.addEventListener("change", (e) => { STATE.enabledFilter = e.target.value; renderTable(); });

    document.querySelectorAll("[data-sm-bulk]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const action = btn.getAttribute("data-sm-bulk");
        const ids = Array.from(STATE.selectedIds);
        const client = window.AdminAuth.getClient();
        try {
          if (action === "delete") {
            const ok = await C().confirmDialog({
              title: "Bulk Delete Sections",
              message: `Delete ${ids.length} selected sections permanently?`,
              confirmLabel: "Delete All",
              danger: true
            });
            if (!ok) return;
            await window.AdminDatabase.bulkDelete("page_sections", ids);
          } else if (action === "enable" || action === "disable") {
            const summary = action === "enable"
              ? `Bulk enabled ${ids.length} section(s)`
              : `Bulk disabled ${ids.length} section(s)`;
            const { error } = await client
              .from("page_sections")
              .update({ enabled: action === "enable", last_change_summary: summary })
              .in("id", ids);
            if (error) throw error;
          } else {
            let changeSummary = `Bulk updated ${ids.length} section(s) to ${action}`;
            if (action === "published") {
              const conf = await C().confirmPublishDialog({
                moduleTitle: "Page Sections",
                targetStatus: "published",
                itemCount: ids.length,
                defaultSummary: changeSummary
              });
              if (!conf.confirmed) return;
              if (conf.changeSummary) changeSummary = conf.changeSummary;
            }
            await window.AdminDatabase.bulkUpdateStatus("page_sections", ids, action, { changeSummary });
          }
          if (window.PortfolioCache) window.PortfolioCache.invalidate("table_page_sections");
          STATE.selectedIds.clear();
          syncBulkBar();
          notify("Bulk section update applied.", "success");
          fetchSections();
        } catch (err) {
          notify(err.message, "error");
        }
      });
    });

    await fetchSections();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
