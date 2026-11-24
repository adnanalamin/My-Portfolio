/**
 * AL AMIN Admin CMS — Backup, Restore & Version Recovery Center (Phase 69)
 * Enforces authorized admin session, scoped & full JSON content exports (clearly distinguished
 * from full PostgreSQL backups), JSON validation, pre-import field-diff previews, selective table/record
 * restoration without silent overwrites, pre-restore backup recommendations, backup audit history,
 * individual version recovery, and Supabase PostgreSQL disaster recovery documentation.
 */
(() => {
  const THEME_KEY = "alamin_admin_theme_v1";
  const STATE = {
    adminProfile: null,
    selectedExportTables: new Set(),
    parsedPayload: null,
    previewData: null,
    selectedRestoreByTable: {},
    preRestoreDownloadedAt: null,
    activeHistoryTab: "backup_logs"
  };

  function C() {
    return window.AdminComponents;
  }

  function DB() {
    return window.AdminDatabase;
  }

  function notify(msg, type = "info") {
    if (window.AdminNotifications) window.AdminNotifications.notify(msg, type);
  }

  function initTheme() {
    const saved = window.localStorage.getItem(THEME_KEY);
    const clean = saved === "light" ? "light" : "dark";
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(clean);
    const label = document.getElementById("backup-theme-label");
    if (label) label.textContent = clean === "dark" ? "Light Mode" : "Dark Mode";

    document.getElementById("backup-theme-toggle")?.addEventListener("click", () => {
      const next = document.documentElement.classList.contains("light") ? "dark" : "light";
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(next);
      window.localStorage.setItem(THEME_KEY, next);
      if (label) label.textContent = next === "dark" ? "Light Mode" : "Dark Mode";
    });
  }

  function triggerJsonDownload(snapshot, fileSlug) {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alamin-cms-${fileSlug}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function showStatusBanner(type, title, detailsHtml = "") {
    const banner = document.getElementById("backup-status-banner");
    if (!banner) return;
    const esc = C().escapeHtml;
    const styles =
      type === "success"
        ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-200"
        : type === "error"
        ? "border-rose-500/45 bg-rose-500/10 text-rose-200"
        : "border-amber-500/45 bg-amber-500/10 text-amber-200";

    banner.className = `admin-card p-4 text-xs space-y-1.5 ${styles}`;
    banner.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <strong class="text-sm">${esc(title)}</strong>
        <button type="button" id="backup-banner-close" class="btn-ghost p-1 min-h-0 text-xs">Dismiss</button>
      </div>
      ${detailsHtml ? `<div class="leading-relaxed">${detailsHtml}</div>` : ""}
    `;
    banner.classList.remove("hidden");
    banner.querySelector("#backup-banner-close")?.addEventListener("click", () => banner.classList.add("hidden"));
  }

  async function runExport(tables, scopeLabel, fileSlug, triggerBtn = null) {
    if (triggerBtn) triggerBtn.disabled = true;
    try {
      const snapshot = await DB().exportBackupJson({ tables, scopeLabel });
      triggerJsonDownload(snapshot, fileSlug);
      if (scopeLabel === "Full Content Export" || (Array.isArray(tables) && tables.length === DB().BACKUP_TABLES.length)) {
        STATE.preRestoreDownloadedAt = new Date().toISOString();
      }
      const totalRows = Object.values(snapshot.tables || {}).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
      showStatusBanner(
        "success",
        `${scopeLabel} Completed`,
        `Exported <strong>${totalRows}</strong> row(s) across <strong>${Object.keys(snapshot.tables || {}).length}</strong> table(s) as JSON. Reminder: this JSON export covers CMS table rows only—it is not a complete PostgreSQL database backup.`
      );
      notify(`${scopeLabel} downloaded cleanly.`, "success");
      loadHistorySection();
    } catch (err) {
      showStatusBanner("error", `${scopeLabel} Failed`, C().escapeHtml(err.message || "Unexpected export error."));
      notify(err.message || "Export failed.", "error");
    } finally {
      if (triggerBtn) triggerBtn.disabled = false;
    }
  }

  function renderRestorePreviewArea() {
    const mount = document.getElementById("backup-preview-mount");
    if (!mount) return;
    const esc = C().escapeHtml;

    if (!STATE.previewData) {
      mount.innerHTML = `
        <div class="admin-panel p-4 text-xs text-[var(--admin-muted)]">
          Select a <code class="font-mono-tech">.json</code> export file above and click <strong>Validate &amp; Preview Changes</strong> to inspect new records, conflicts, and field-level diffs before restoring anything.
        </div>
      `;
      return;
    }

    const { validation, tablePreviews } = STATE.previewData;
    const mode = document.getElementById("backup-restore-mode")?.value || "insert_missing";

    let totalNew = 0;
    let totalMod = 0;
    let totalUnchanged = 0;
    let selectedNew = 0;
    let selectedMod = 0;

    tablePreviews.forEach((tp) => {
      totalNew += tp.newRows.length;
      totalMod += tp.modifiedRows.length;
      totalUnchanged += tp.unchangedRows.length;
      const selSet = STATE.selectedRestoreByTable[tp.table] || new Set();
      tp.newRows.forEach((r) => {
        if (selSet.has(r.id)) selectedNew += 1;
      });
      tp.modifiedRows.forEach((r) => {
        if (selSet.has(r.id)) selectedMod += 1;
      });
    });

    mount.innerHTML = `
      <div class="space-y-4">
        <!-- Validation Summary -->
        <div class="admin-panel p-4 space-y-2 text-xs">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="status-badge status-published">Schema Validated</span>
              <strong>${esc(validation.scopeLabel)}</strong>
              <span class="font-mono-tech text-[var(--admin-muted)]">Format: ${esc(validation.format)}</span>
            </div>
            <span class="font-mono-tech text-[var(--admin-muted)]">
              Exported: ${validation.exportedAt ? esc(new Date(validation.exportedAt).toLocaleString()) : "Unknown timestamp"}
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono-tech">
            <div class="p-2 rounded bg-[var(--admin-bg)] border border-[var(--admin-border)]">Incoming Rows: <strong>${validation.totalRows}</strong></div>
            <div class="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">New (Missing): <strong>${totalNew}</strong></div>
            <div class="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">Modified (Diff): <strong>${totalMod}</strong></div>
            <div class="p-2 rounded bg-[var(--admin-bg)] border border-[var(--admin-border)]">Unchanged: <strong>${totalUnchanged}</strong></div>
          </div>
          ${
            validation.unknownTables.length
              ? `<p class="text-amber-300">Ignored unrecognized tables: ${esc(validation.unknownTables.join(", "))}</p>`
              : ""
          }
          ${
            validation.warnings.length
              ? `<p class="text-amber-300">${esc(validation.warnings.slice(0, 3).join(" "))}</p>`
              : ""
          }
        </div>

        <!-- Pre-Restore Recommendation -->
        <div class="admin-panel p-3.5 border-amber-500/40 bg-amber-500/10 text-xs flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-0.5 text-amber-100">
            <p class="font-semibold">Pre-Restore Backup Recommendation</p>
            <p class="text-amber-200/90">
              ${
                STATE.preRestoreDownloadedAt
                  ? `Pre-restore snapshot downloaded cleanly in this session (${esc(new Date(STATE.preRestoreDownloadedAt).toLocaleTimeString())}).`
                  : "Always download a fresh Full Content JSON export before restoring records so you have an immediate local rollback file."
              }
            </p>
          </div>
          <button type="button" id="backup-prerestore-dl" class="btn-secondary text-xs shrink-0">Download Pre-Restore Backup Now</button>
        </div>

        <!-- Selective Table & Record Restore Tree -->
        <div class="space-y-3">
          ${tablePreviews
            .map((tp) => {
              const selSet = STATE.selectedRestoreByTable[tp.table] || new Set();
              const actionableRows = [...tp.newRows, ...tp.modifiedRows];
              const allSelected = actionableRows.length > 0 && actionableRows.every((r) => selSet.has(r.id));
              return `
              <details class="admin-card overflow-hidden" ${actionableRows.length > 0 ? "open" : ""}>
                <summary class="px-4 py-3 cursor-pointer flex flex-wrap items-center justify-between gap-2 bg-[var(--admin-surface-2)]">
                  <div class="flex items-center gap-2.5">
                    <input type="checkbox" class="backup-table-cb w-4 h-4 accent-indigo-500" data-btbl="${esc(tp.table)}" ${allSelected ? "checked" : ""} ${actionableRows.length === 0 ? "disabled" : ""}>
                    <span class="font-mono-tech text-xs font-bold">${esc(tp.table)}</span>
                  </div>
                  <div class="flex flex-wrap gap-2 text-[11px] font-mono-tech">
                    <span class="text-emerald-300">+${tp.newRows.length} new</span>
                    <span class="text-amber-300">~${tp.modifiedRows.length} modified</span>
                    <span class="text-[var(--admin-muted)]">${tp.unchangedRows.length} identical</span>
                  </div>
                </summary>
                <div class="p-3.5 space-y-2 border-t border-[var(--admin-border)]">
                  ${
                    actionableRows.length === 0
                      ? `<p class="text-xs text-[var(--admin-muted)]">All ${tp.unchangedRows.length} row(s) already match live database values.</p>`
                      : actionableRows
                          .map((item) => {
                            const isChecked = selSet.has(item.id);
                            const isModified = item.status === "modified";
                            const blockedByMode = isModified && mode === "insert_missing";
                            return `
                            <div class="rounded-lg border border-[var(--admin-border)] p-2.5 space-y-2 bg-[var(--admin-bg)]/60">
                              <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <label class="flex items-center gap-2 min-w-0 cursor-pointer">
                                  <input type="checkbox" class="backup-row-cb w-4 h-4 accent-indigo-500" data-rtbl="${esc(tp.table)}" data-rid="${esc(item.id)}" ${isChecked ? "checked" : ""}>
                                  <span class="font-semibold truncate">${esc(item.label)}</span>
                                  <span class="font-mono-tech text-[10px] text-[var(--admin-muted)]">${esc(item.id)}</span>
                                </label>
                                <span class="status-badge ${isModified ? "status-scheduled" : "status-published"}">
                                  ${isModified ? (blockedByMode ? `Modified (skipped in insert-only mode)` : `Overwrite (${item.diffs.length} fields)`) : "New Record"}
                                </span>
                              </div>
                              ${
                                isModified && item.diffs.length
                                  ? `
                                  <div class="overflow-x-auto">
                                    <table class="w-full text-[11px] font-mono-tech border-collapse">
                                      <thead>
                                        <tr class="text-left text-[var(--admin-muted)] border-b border-[var(--admin-border)]">
                                          <th class="py-1 pr-2">Field</th>
                                          <th class="py-1 pr-2">Current Live DB</th>
                                          <th class="py-1">Incoming Backup</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        ${item.diffs
                                          .slice(0, 8)
                                          .map(
                                            (d) => `
                                          <tr class="border-b border-[var(--admin-border)]/40 align-top">
                                            <td class="py-1 pr-2 font-semibold">${esc(d.field)}</td>
                                            <td class="py-1 pr-2 text-rose-300 break-all max-w-[260px]">${esc(String(d.before).slice(0, 140))}</td>
                                            <td class="py-1 text-emerald-300 break-all max-w-[260px]">${esc(String(d.after).slice(0, 140))}</td>
                                          </tr>
                                        `
                                          )
                                          .join("")}
                                      </tbody>
                                    </table>
                                  </div>
                                `
                                  : ""
                              }
                            </div>
                          `;
                          })
                          .join("")
                  }
                </div>
              </details>
            `;
            })
            .join("")}
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--admin-border)]">
          <div class="text-xs text-[var(--admin-muted)]">
            Selected for restore: <strong class="text-[var(--admin-text)]">${selectedNew}</strong> new + <strong class="${mode === "upsert" ? "text-amber-300" : "text-[var(--admin-muted)]"}">${mode === "upsert" ? `${selectedMod} overwrite(s)` : `0 overwrites (${selectedMod} skipped safely)`}</strong>
          </div>
          <button type="button" id="backup-execute-restore-btn" class="${mode === "upsert" ? "btn-danger" : "btn-primary"}">
            Restore Selected Content
          </button>
        </div>
      </div>
    `;

    mount.querySelector("#backup-prerestore-dl")?.addEventListener("click", (e) => {
      runExport(DB().BACKUP_TABLES, "Pre-Restore Full Content Snapshot", "pre-restore-backup", e.currentTarget);
    });

    mount.querySelectorAll(".backup-table-cb").forEach((cb) => {
      cb.addEventListener("change", () => {
        const tbl = cb.getAttribute("data-btbl");
        const tp = tablePreviews.find((t) => t.table === tbl);
        if (!tp) return;
        const set = new Set();
        if (cb.checked) {
          tp.newRows.forEach((r) => set.add(r.id));
          tp.modifiedRows.forEach((r) => set.add(r.id));
        }
        STATE.selectedRestoreByTable[tbl] = set;
        renderRestorePreviewArea();
      });
    });

    mount.querySelectorAll(".backup-row-cb").forEach((cb) => {
      cb.addEventListener("change", () => {
        const tbl = cb.getAttribute("data-rtbl");
        const id = cb.getAttribute("data-rid");
        if (!STATE.selectedRestoreByTable[tbl]) STATE.selectedRestoreByTable[tbl] = new Set();
        if (cb.checked) STATE.selectedRestoreByTable[tbl].add(id);
        else STATE.selectedRestoreByTable[tbl].delete(id);
        renderRestorePreviewArea();
      });
    });

    mount.querySelector("#backup-execute-restore-btn")?.addEventListener("click", () => openRestoreConfirmationModal());
  }

  async function openRestoreConfirmationModal() {
    if (!STATE.parsedPayload || !STATE.previewData) return;
    const esc = C().escapeHtml;
    const mode = document.getElementById("backup-restore-mode")?.value || "insert_missing";
    const { tablePreviews } = STATE.previewData;

    const selectedTables = [];
    const selectedRecordIdsByTable = {};
    let newCount = 0;
    let overwriteCount = 0;

    tablePreviews.forEach((tp) => {
      const selSet = STATE.selectedRestoreByTable[tp.table] || new Set();
      if (!selSet.size) return;
      const applicableIds = new Set();
      tp.newRows.forEach((r) => {
        if (selSet.has(r.id)) {
          applicableIds.add(r.id);
          newCount += 1;
        }
      });
      if (mode === "upsert") {
        tp.modifiedRows.forEach((r) => {
          if (selSet.has(r.id)) {
            applicableIds.add(r.id);
            overwriteCount += 1;
          }
        });
      }
      if (applicableIds.size > 0) {
        selectedTables.push(tp.table);
        selectedRecordIdsByTable[tp.table] = applicableIds;
      }
    });

    if (selectedTables.length === 0) {
      notify("No applicable records selected for the current restore mode.", "warning");
      return;
    }

    const requiresTypedRestore = mode === "upsert" && overwriteCount > 0;

    C().showModal({
      title: requiresTypedRestore ? "Confirm Restore With Record Overwrite" : "Confirm Selective Content Restore",
      maxWidth: "560px",
      bodyHtml: `
        <div class="space-y-3.5 text-xs">
          <div class="admin-panel p-3.5 space-y-1">
            <p><span class="text-[var(--admin-muted)]">Restore Mode:</span> <strong>${mode === "upsert" ? "Explicit Upsert (Overwrites matching IDs)" : "Safe Insert Missing Only (No overwrites)"}</strong></p>
            <p><span class="text-[var(--admin-muted)]">Target Tables (${selectedTables.length}):</span> <span class="font-mono-tech">${esc(selectedTables.join(", "))}</span></p>
            <p><span class="text-[var(--admin-muted)]">Changes to Apply:</span> <strong>${newCount}</strong> insertion(s), <strong class="${overwriteCount ? "text-amber-300" : ""}">${overwriteCount}</strong> overwrite(s)</p>
          </div>

          <div class="admin-panel p-3 border-amber-500/40 bg-amber-500/10 text-amber-200 space-y-2">
            <p class="font-semibold">Pre-Restore Backup Recommendation</p>
            <p>${
              STATE.preRestoreDownloadedAt
                ? `Pre-restore backup downloaded at ${esc(new Date(STATE.preRestoreDownloadedAt).toLocaleTimeString())}. Existing overwritten rows are also preserved in Version History.`
                : "You have not downloaded a full pre-restore content backup in this session. Downloading one takes one click and protects against accidental overwrites."
            }</p>
            <button type="button" id="modal-prerestore-dl" class="btn-secondary text-xs py-1 min-h-0">Download Pre-Restore Content Backup</button>
          </div>

          <div>
            <label class="admin-label" for="restore-change-summary">Audit &amp; Version History Summary</label>
            <input id="restore-change-summary" type="text" class="admin-input text-xs" value="Restored selected content from JSON snapshot">
          </div>

          ${
            requiresTypedRestore
              ? `
              <div>
                <label class="admin-label" for="restore-typed-confirm">Type <span class="font-mono-tech text-rose-400">RESTORE</span> to confirm overwriting ${overwriteCount} live record(s)</label>
                <input id="restore-typed-confirm" type="text" class="admin-input text-xs" placeholder="RESTORE" autocomplete="off">
              </div>
            `
              : ""
          }
        </div>
      `,
      footerHtml: `
        <div class="flex flex-wrap items-center justify-end gap-2">
          <button type="button" id="restore-modal-cancel" class="btn-secondary">Cancel</button>
          <button type="button" id="restore-modal-confirm" class="${requiresTypedRestore ? "btn-danger" : "btn-primary"}" ${requiresTypedRestore ? "disabled" : ""}>Confirm Restore</button>
        </div>
      `,
      onMount: ({ bodyEl, footerEl, close }) => {
        const confirmBtn = footerEl.querySelector("#restore-modal-confirm");
        const cancelBtn = footerEl.querySelector("#restore-modal-cancel");
        const typedIn = bodyEl.querySelector("#restore-typed-confirm");
        const summaryIn = bodyEl.querySelector("#restore-change-summary");

        bodyEl.querySelector("#modal-prerestore-dl")?.addEventListener("click", (e) => {
          runExport(DB().BACKUP_TABLES, "Pre-Restore Full Content Snapshot", "pre-restore-backup", e.currentTarget);
        });

        if (typedIn && confirmBtn) {
          typedIn.addEventListener("input", () => {
            confirmBtn.disabled = typedIn.value.trim() !== "RESTORE";
          });
        }

        cancelBtn.addEventListener("click", close);
        confirmBtn.addEventListener("click", async () => {
          confirmBtn.disabled = true;
          confirmBtn.textContent = "Restoring...";
          try {
            const res = await DB().importBackupJson(STATE.parsedPayload, {
              mode,
              selectedTables,
              selectedRecordIdsByTable,
              changeSummary: summaryIn ? summaryIn.value.trim() : "Restored content from JSON snapshot"
            });
            close();
            showStatusBanner(
              "success",
              "Content Restore Completed Successfully",
              `Applied <strong>${res.totalApplied}</strong> record(s) across <strong>${Object.keys(res.summary).length}</strong> table(s). Audit trail and Version History snapshots updated.`
            );
            notify(`Restored ${res.totalApplied} record(s) cleanly.`, "success");
            // Refresh diff preview so user sees updated Live DB state
            STATE.previewData = await DB().previewBackupDiff(STATE.parsedPayload);
            renderRestorePreviewArea();
            loadHistorySection();
          } catch (err) {
            close();
            showStatusBanner("error", "Content Restore Failed", esc(err.message || "Unexpected restore error."));
            notify(err.message || "Restore failed.", "error");
          }
        });
      }
    });
  }

  async function loadHistorySection() {
    const mount = document.getElementById("backup-history-mount");
    if (!mount) return;
    const esc = C().escapeHtml;
    mount.innerHTML = C().renderSkeleton(3);

    try {
      if (STATE.activeHistoryTab === "backup_logs") {
        const logs = await DB().listBackupHistory(30);
        if (!logs.length) {
          mount.innerHTML = C().renderEmptyState({
            icon: "history",
            title: "No backup or restore events recorded yet",
            description: "Exported snapshots and JSON restore operations appear here automatically."
          });
          C().refreshIcons();
          return;
        }
        mount.innerHTML = `
          <div class="space-y-2.5">
            ${logs
              .map(
                (log) => `
              <article class="admin-panel p-3.5 flex flex-wrap items-start justify-between gap-2 text-xs">
                <div class="space-y-0.5 min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="status-badge ${log.action === "export_backup" ? "status-published" : "status-scheduled"}">${esc(log.action === "export_backup" ? "Export" : "Restore")}</span>
                    <strong class="text-sm">${esc(log.summary)}</strong>
                  </div>
                  <p class="font-mono-tech text-[11px] text-[var(--admin-muted)]">
                    Admin: ${esc(log.admin_email || "Authorized Admin")} · ${esc(new Date(log.created_at).toLocaleString())}
                  </p>
                </div>
              </article>
            `
              )
              .join("")}
          </div>
        `;
      } else {
        const { rows } = await DB().listVersionHistory({ page: 1, pageSize: 20 });
        if (!rows.length) {
          mount.innerHTML = C().renderEmptyState({
            icon: "git-commit",
            title: "No version snapshots recorded yet",
            description: "Apply Migration 005 and edit or restore any CMS item to browse immutable record snapshots here."
          });
          C().refreshIcons();
          return;
        }
        mount.innerHTML = `
          <div class="space-y-2.5">
            ${rows
              .map(
                (v) => `
              <article class="admin-panel p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div class="min-w-0 space-y-0.5">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-mono-tech font-bold text-indigo-300">v${esc(v.version_number)}</span>
                    <span class="font-mono-tech px-2 py-0.5 rounded bg-[var(--admin-bg)] border border-[var(--admin-border)]">${esc(v.content_type)}</span>
                    ${C().statusBadge(v.new_status || v.action)}
                    <span class="font-semibold">${esc(v.change_summary || v.action)}</span>
                  </div>
                  <p class="font-mono-tech text-[11px] text-[var(--admin-muted)]">
                    ID: ${esc(v.content_id)} · Admin: ${esc(v.admin_email || "system")} · ${esc(new Date(v.updated_timestamp).toLocaleString())}
                  </p>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" class="btn-secondary text-xs py-1 min-h-0" data-vh-restore-draft="${esc(v.id)}">Restore Draft</button>
                  <button type="button" class="btn-primary text-xs py-1 min-h-0" data-vh-restore-pub="${esc(v.id)}">Restore &amp; Publish</button>
                </div>
              </article>
            `
              )
              .join("")}
          </div>
        `;

        mount.querySelectorAll("[data-vh-restore-draft]").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const vid = btn.getAttribute("data-vh-restore-draft");
            const ok = await C().confirmDialog({
              title: "Recover Version as Draft",
              message: "Recover this historical snapshot as Draft? Your previous version stays preserved in Version History.",
              confirmLabel: "Restore as Draft"
            });
            if (!ok) return;
            try {
              await DB().restoreContentVersion(vid, { targetStatus: "draft", changeSummary: "Recovered version as draft from Recovery Center" });
              showStatusBanner("success", "Version Recovered as Draft", "The selected historical snapshot has been restored safely as draft.");
              notify("Version recovered as draft.", "success");
              loadHistorySection();
            } catch (err) {
              showStatusBanner("error", "Version Recovery Failed", esc(err.message));
              notify(err.message, "error");
            }
          });
        });

        mount.querySelectorAll("[data-vh-restore-pub]").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const vid = btn.getAttribute("data-vh-restore-pub");
            const conf = await C().confirmPublishDialog({
              moduleTitle: "Version Recovery",
              recordLabel: `Snapshot ${vid}`,
              targetStatus: "published",
              currentlyPublished: true,
              defaultSummary: "Recovered historical version live from Recovery Center"
            });
            if (!conf.confirmed) return;
            try {
              await DB().restoreContentVersion(vid, { targetStatus: "published", changeSummary: conf.changeSummary });
              showStatusBanner("success", "Version Recovered & Published Live", "Previous live content was preserved automatically in Version History.");
              notify("Version recovered and published.", "success");
              loadHistorySection();
            } catch (err) {
              showStatusBanner("error", "Version Recovery Failed", esc(err.message));
              notify(err.message, "error");
            }
          });
        });
      }
      C().refreshIcons();
    } catch (err) {
      mount.innerHTML = C().renderErrorState({ message: err.message });
      C().refreshIcons();
    }
  }

  function renderMainWorkspace() {
    const mount = document.getElementById("backup-workspace");
    if (!mount) return;
    const esc = C().escapeHtml;
    const allTables = DB().BACKUP_TABLES;

    mount.innerHTML = `
      <div class="space-y-6">
        <!-- Scope Warning Banner -->
        <div class="admin-card p-4 border-amber-500/40 bg-amber-500/10 text-xs text-amber-100 space-y-1.5">
          <div class="flex items-center gap-2 font-bold text-sm text-amber-300">
            <i data-lucide="alert-triangle" class="w-4 h-4 shrink-0"></i>
            <span>Scope Notice: Content JSON Export Is NOT a Complete Database Backup</span>
          </div>
          <p class="leading-relaxed text-amber-100/90">
            JSON snapshots exported here back up <strong>structured CMS content rows only</strong>. They do <strong>not</strong> include PostgreSQL DDL schemas, triggers, Row Level Security (RLS) policies, Supabase Auth users, or Supabase Storage media files. Always rely on automated Supabase Database Backups / <code class="font-mono-tech">pg_dump</code> (instructions below) for disaster recovery.
          </p>
        </div>

        <div id="backup-status-banner" class="hidden"></div>

        <!-- 1. Export Studio -->
        <section class="admin-card p-5 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold">1. Export Content JSON Snapshots</h2>
              <p class="text-xs text-[var(--admin-muted)] mt-0.5">Download a full CMS content export, individual portfolio module exports, or a custom multi-table selection.</p>
            </div>
            <button type="button" id="exp-full-btn" class="btn-primary">
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>Full Content JSON Export (${allTables.length} tables)</span>
            </button>
          </div>

          <!-- Dedicated One-Click Module Exports -->
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)] mb-2.5">Single-Module Content Exports</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <button type="button" class="btn-secondary text-xs justify-start" data-export-preset="projects"><i data-lucide="folder-kanban" class="w-3.5 h-3.5"></i><span>Projects Export</span></button>
              <button type="button" class="btn-secondary text-xs justify-start" data-export-preset="blog"><i data-lucide="file-text" class="w-3.5 h-3.5"></i><span>Blog Export</span></button>
              <button type="button" class="btn-secondary text-xs justify-start" data-export-preset="skills"><i data-lucide="cpu" class="w-3.5 h-3.5"></i><span>Skills Export</span></button>
              <button type="button" class="btn-secondary text-xs justify-start" data-export-preset="services"><i data-lucide="layers" class="w-3.5 h-3.5"></i><span>Services Export</span></button>
              <button type="button" class="btn-secondary text-xs justify-start" data-export-preset="certificates"><i data-lucide="award" class="w-3.5 h-3.5"></i><span>Certificates Export</span></button>
              <button type="button" class="btn-secondary text-xs justify-start" data-export-preset="settings"><i data-lucide="sliders" class="w-3.5 h-3.5"></i><span>Settings Export</span></button>
            </div>
          </div>

          <!-- Selected Content Custom Export -->
          <div class="admin-panel p-4 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p class="text-xs font-bold">Selected Content Export</p>
                <p class="text-[11px] text-[var(--admin-muted)]">Choose specific CMS tables to bundle into a custom JSON export.</p>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" id="exp-sel-all" class="btn-ghost text-xs py-1 min-h-0">Select All</button>
                <button type="button" id="exp-sel-none" class="btn-ghost text-xs py-1 min-h-0">Clear</button>
                <button type="button" id="exp-selected-btn" class="btn-secondary text-xs">Export Selected Content</button>
              </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              ${allTables
                .map(
                  (tbl) => `
                <label class="flex items-center gap-2 text-xs font-mono-tech px-2 py-1.5 rounded border border-[var(--admin-border)] bg-[var(--admin-bg)] cursor-pointer">
                  <input type="checkbox" class="exp-tbl-cb w-3.5 h-3.5 accent-indigo-500" value="${esc(tbl)}" ${STATE.selectedExportTables.has(tbl) ? "checked" : ""}>
                  <span class="truncate" title="${esc(tbl)}">${esc(tbl)}</span>
                </label>
              `
                )
                .join("")}
            </div>
          </div>
        </section>

        <!-- 2. Import, Validation, Preview & Selective Restore -->
        <section class="admin-card p-5 space-y-4">
          <div>
            <h2 class="text-lg font-bold">2. Import JSON, Preview Changes &amp; Selective Restore</h2>
            <p class="text-xs text-[var(--admin-muted)] mt-0.5">Validates schema format, diffs incoming rows against live PostgreSQL data, lets you pick exact tables/records, and confirms before any restore.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div class="md:col-span-5">
              <label class="admin-label" for="backup-file-input">Choose CMS Content JSON File</label>
              <input id="backup-file-input" type="file" accept=".json,application/json" class="admin-input text-xs">
            </div>
            <div class="md:col-span-4">
              <label class="admin-label" for="backup-restore-mode">Conflict Handling Mode</label>
              <select id="backup-restore-mode" class="admin-select text-xs">
                <option value="insert_missing">Safe: Insert Missing IDs Only (Never overwrite existing)</option>
                <option value="upsert">Explicit Upsert: Overwrite Selected Conflicting Records</option>
              </select>
            </div>
            <div class="md:col-span-3">
              <button type="button" id="backup-validate-btn" class="btn-primary w-full text-xs">Validate &amp; Preview Changes</button>
            </div>
          </div>

          <div id="backup-preview-mount"></div>
        </section>

        <!-- 3. Backup History & Version Recovery Center -->
        <section class="admin-card p-5 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold">3. Backup History &amp; Version Recovery</h2>
              <p class="text-xs text-[var(--admin-muted)] mt-0.5">Review recent JSON exports/restores or recover individual record snapshots from immutable Version History.</p>
            </div>
            <div class="inline-flex rounded-lg border border-[var(--admin-border)] overflow-hidden">
              <button type="button" id="tab-backup-logs" class="btn-primary text-xs py-1.5 px-3 rounded-none">Backup History</button>
              <button type="button" id="tab-version-recovery" class="btn-ghost text-xs py-1.5 px-3 rounded-none">Version Recovery</button>
            </div>
          </div>
          <div id="backup-history-mount"></div>
        </section>

        <!-- 4. Proper Supabase Database Backup & Recovery Guide -->
        <section class="admin-card p-5 space-y-4">
          <div>
            <h2 class="text-lg font-bold">4. Complete Supabase PostgreSQL &amp; Storage Recovery Instructions</h2>
            <p class="text-xs text-[var(--admin-muted)] mt-0.5">Follow these official infrastructure procedures for full database, schema, RLS, Auth, and Storage binary disaster recovery.</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs leading-relaxed">
            <article class="admin-panel p-4 space-y-2">
              <h3 class="font-bold text-sm text-indigo-300">A. Supabase Dashboard &amp; PITR</h3>
              <p class="text-[var(--admin-text-secondary)]">
                In your Supabase project, open <strong>Database → Backups</strong> to access automated daily physical backups (or Point-in-Time Recovery on Pro plans). These restore PostgreSQL tables, RLS policies, functions, triggers, and Auth records consistently.
              </p>
            </article>
            <article class="admin-panel p-4 space-y-2">
              <h3 class="font-bold text-sm text-indigo-300">B. Full Logical CLI Dump &amp; Restore</h3>
              <p class="text-[var(--admin-text-secondary)]">Use the Supabase CLI or <code class="font-mono-tech">pg_dump</code> against your direct Postgres connection string (never in browser code):</p>
              <pre class="p-2.5 rounded bg-[var(--admin-bg)] border border-[var(--admin-border)] font-mono-tech text-[11px] overflow-x-auto">supabase db dump -f schema.sql
supabase db dump --data-only -f data.sql
psql "$SUPABASE_DB_URL" -f schema.sql</pre>
            </article>
            <article class="admin-panel p-4 space-y-2">
              <h3 class="font-bold text-sm text-indigo-300">C. Migrations &amp; Storage Binaries</h3>
              <p class="text-[var(--admin-text-secondary)]">
                To rebuild a fresh project cleanly, run migrations <code class="font-mono-tech">001</code> through <code class="font-mono-tech">006</code> inside <code class="font-mono-tech">supabase/migrations/</code> in order, recreate your <code class="font-mono-tech">admin_users</code> Super Admin row, and sync objects inside the <code class="font-mono-tech">portfolio-media</code> bucket before importing JSON content rows.
              </p>
            </article>
          </div>
        </section>
      </div>
    `;

    document.getElementById("exp-full-btn").addEventListener("click", (e) => {
      runExport(DB().BACKUP_TABLES, "Full Content JSON Export", "full-content", e.currentTarget);
    });

    mount.querySelectorAll("[data-export-preset]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const key = btn.getAttribute("data-export-preset");
        const preset = DB().BACKUP_EXPORT_PRESETS[key];
        if (!preset) return;
        runExport(preset.tables, preset.label, key, e.currentTarget);
      });
    });

    mount.querySelectorAll(".exp-tbl-cb").forEach((cb) => {
      cb.addEventListener("change", () => {
        if (cb.checked) STATE.selectedExportTables.add(cb.value);
        else STATE.selectedExportTables.delete(cb.value);
      });
    });

    document.getElementById("exp-sel-all").addEventListener("click", () => {
      DB().BACKUP_TABLES.forEach((t) => STATE.selectedExportTables.add(t));
      mount.querySelectorAll(".exp-tbl-cb").forEach((cb) => { cb.checked = true; });
    });

    document.getElementById("exp-sel-none").addEventListener("click", () => {
      STATE.selectedExportTables.clear();
      mount.querySelectorAll(".exp-tbl-cb").forEach((cb) => { cb.checked = false; });
    });

    document.getElementById("exp-selected-btn").addEventListener("click", (e) => {
      const chosen = Array.from(STATE.selectedExportTables);
      if (!chosen.length) {
        notify("Select at least one CMS table under Selected Content Export.", "warning");
        return;
      }
      runExport(chosen, `Selected Content Export (${chosen.length} tables)`, "selected-content", e.currentTarget);
    });

    document.getElementById("backup-restore-mode").addEventListener("change", () => {
      if (STATE.previewData) renderRestorePreviewArea();
    });

    document.getElementById("backup-validate-btn").addEventListener("click", async () => {
      const fileIn = document.getElementById("backup-file-input");
      const btn = document.getElementById("backup-validate-btn");
      const file = fileIn.files && fileIn.files[0];
      if (!file) {
        notify("Please select a JSON export file first.", "warning");
        return;
      }
      btn.disabled = true;
      btn.textContent = "Validating & Diffing...";
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const preview = await DB().previewBackupDiff(parsed);
        STATE.parsedPayload = parsed;
        STATE.previewData = preview;
        STATE.selectedRestoreByTable = {};
        preview.tablePreviews.forEach((tp) => {
          const set = new Set();
          tp.newRows.forEach((r) => set.add(r.id));
          tp.modifiedRows.forEach((r) => set.add(r.id));
          STATE.selectedRestoreByTable[tp.table] = set;
        });
        showStatusBanner(
          "success",
          "Backup JSON Validated & Diff Preview Ready",
          `Review the new and modified records below, select which items to restore, and download a pre-restore backup before confirming.`
        );
        renderRestorePreviewArea();
      } catch (err) {
        STATE.parsedPayload = null;
        STATE.previewData = null;
        renderRestorePreviewArea();
        showStatusBanner("error", "Backup JSON Validation Failed", esc(err.message || "Invalid JSON backup file."));
        notify(err.message || "Backup validation failed.", "error");
      } finally {
        btn.disabled = false;
        btn.textContent = "Validate & Preview Changes";
      }
    });

    const tabLogs = document.getElementById("tab-backup-logs");
    const tabVer = document.getElementById("tab-version-recovery");
    tabLogs.addEventListener("click", () => {
      STATE.activeHistoryTab = "backup_logs";
      tabLogs.className = "btn-primary text-xs py-1.5 px-3 rounded-none";
      tabVer.className = "btn-ghost text-xs py-1.5 px-3 rounded-none";
      loadHistorySection();
    });
    tabVer.addEventListener("click", () => {
      STATE.activeHistoryTab = "version_recovery";
      tabVer.className = "btn-primary text-xs py-1.5 px-3 rounded-none";
      tabLogs.className = "btn-ghost text-xs py-1.5 px-3 rounded-none";
      loadHistorySection();
    });

    renderRestorePreviewArea();
    loadHistorySection();
    C().refreshIcons();
  }

  async function init() {
    initTheme();
    const state = await window.AdminPermissions.requireAuthorizedAdmin({ loginUrl: "login.html" });
    if (!state) return;

    STATE.adminProfile = state.adminProfile;
    const idEl = document.getElementById("backup-admin-identity");
    if (idEl) {
      idEl.textContent = `${state.adminProfile.email || "Admin"} (${window.AdminPermissions.formatRoleBadge(state.adminProfile.role)})`;
    }

    window.AdminAuth.watchSession((msg) => {
      window.sessionStorage.setItem("admin_logout_reason", msg);
      window.location.replace("login.html");
    });

    renderMainWorkspace();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
