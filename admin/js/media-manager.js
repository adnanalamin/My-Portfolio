/**
 * AL AMIN Admin CMS — Advanced Digital Asset Management (Phase 68)
 * Handles Folders (create/rename/delete), Multi-type Uploads (Images, Videos, PDFs, Documents),
 * Client-side Image Optimization, Bulk Upload & Bulk Delete, File Replacement,
 * Rich Previews, Metadata Editing (Alt, Caption, Description, Tags), Search/Filter/Sort/Pagination,
 * and Published-Content Usage Reference Checks prior to deletion.
 */
(() => {
  const DAM_STATE = {
    folders: [],
    rows: [],
    totalCount: 0,
    page: 1,
    pageSize: 18,
    search: "",
    folderId: "all",
    assetKind: "all",
    tag: "all",
    sortBy: "created_at",
    ascending: false,
    viewMode: "grid",
    selectedIds: new Set(),
    selectedMap: new Map(),
    availableTags: []
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

  function formatBytes(bytes) {
    const n = Number(bytes || 0);
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  }

  function sanitizeExternalMediaUrl(url) {
    const raw = String(url || "").trim();
    if (!raw) return "";
    try {
      const parsed = new URL(raw, window.location ? window.location.origin : "https://localhost");
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.href;
      }
      return "";
    } catch (_e) {
      return "";
    }
  }

  function getMediaCategory(asset) {
    const mime = String(asset.mime_type || "").toLowerCase();
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime === "application/pdf") return "pdf";
    return "document";
  }

  function renderCardThumb(asset) {
    const esc = C().escapeHtml;
    const cat = getMediaCategory(asset);
    const safeUrl = sanitizeExternalMediaUrl(asset.public_url);

    if (cat === "image" && safeUrl) {
      return `<img src="${esc(safeUrl)}" alt="${esc(asset.alt_text || asset.file_name)}" loading="lazy" class="w-full h-36 object-cover rounded-lg border border-[var(--admin-border)] bg-slate-900/40">`;
    }
    if (cat === "video" && safeUrl) {
      return `
        <div class="relative w-full h-36 rounded-lg border border-[var(--admin-border)] bg-slate-950 overflow-hidden flex items-center justify-center">
          <video src="${esc(safeUrl)}#t=0.5" preload="metadata" muted playsinline class="w-full h-full object-cover opacity-80"></video>
          <span class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span class="w-9 h-9 rounded-full bg-slate-950/75 border border-white/25 flex items-center justify-center text-white">
              <i data-lucide="play" class="w-4 h-4"></i>
            </span>
          </span>
        </div>
      `;
    }
    if (cat === "pdf") {
      return `
        <div class="w-full h-36 rounded-lg border border-[var(--admin-border)] bg-rose-500/5 flex flex-col items-center justify-center gap-1.5">
          <i data-lucide="file-text" class="w-8 h-8 text-rose-400"></i>
          <span class="text-[10px] font-mono-tech uppercase tracking-wider text-rose-300">PDF Document</span>
        </div>
      `;
    }
    return `
      <div class="w-full h-36 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-2)] flex flex-col items-center justify-center gap-1.5">
        <i data-lucide="file-code-2" class="w-8 h-8 text-[var(--admin-primary)]"></i>
        <span class="text-[10px] font-mono-tech uppercase tracking-wider text-[var(--admin-muted)]">${esc(asset.asset_kind || "Document")}</span>
      </div>
    `;
  }

  function renderRichPreviewHtml(asset) {
    const esc = C().escapeHtml;
    const cat = getMediaCategory(asset);
    const safeUrl = sanitizeExternalMediaUrl(asset.public_url);
    if (!safeUrl) {
      return `<div class="admin-panel p-6 text-center text-xs text-[var(--admin-muted)]">Invalid or unavailable media URL.</div>`;
    }
    if (cat === "image") {
      return `
        <div class="rounded-xl border border-[var(--admin-border)] bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:20px_20px] p-3 flex items-center justify-center max-h-[360px] overflow-hidden">
          <img src="${esc(safeUrl)}" alt="${esc(asset.alt_text || asset.file_name)}" class="max-h-[330px] max-w-full object-contain rounded">
        </div>
      `;
    }
    if (cat === "video") {
      return `
        <div class="rounded-xl border border-[var(--admin-border)] bg-black overflow-hidden">
          <video src="${esc(safeUrl)}" controls preload="metadata" playsinline class="w-full max-h-[360px]">
            Your browser does not support video playback.
          </video>
        </div>
      `;
    }
    if (cat === "pdf") {
      return `
        <div class="rounded-xl border border-[var(--admin-border)] overflow-hidden bg-slate-900">
          <iframe src="${esc(safeUrl)}" title="${esc(asset.file_name)}" class="w-full h-[360px] border-0"></iframe>
          <div class="px-3 py-2 border-t border-[var(--admin-border)] flex items-center justify-between text-xs bg-[var(--admin-surface-2)]">
            <span class="text-[var(--admin-muted)]">PDF Inline Preview</span>
            <a href="${esc(safeUrl)}" target="_blank" rel="noopener noreferrer" class="text-[var(--admin-primary)] hover:underline font-medium">Open PDF in New Tab ↗</a>
          </div>
        </div>
      `;
    }
    return `
      <div class="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 text-xs font-semibold">
            <i data-lucide="file-text" class="w-4 h-4 text-[var(--admin-primary)]"></i>
            <span>${esc(asset.file_name)}</span>
          </div>
          <a href="${esc(safeUrl)}" target="_blank" rel="noopener noreferrer" class="btn-secondary text-xs py-1 min-h-0">Open File ↗</a>
        </div>
        <div id="dam-doc-text-preview" class="text-xs font-mono-tech whitespace-pre-wrap max-h-56 overflow-y-auto p-3 rounded border border-[var(--admin-border)] bg-[var(--admin-bg)] text-[var(--admin-text-secondary)]">Loading document preview...</div>
      </div>
    `;
  }

  async function hydrateDocumentTextPreview(asset, bodyEl) {
    const box = bodyEl.querySelector("#dam-doc-text-preview");
    if (!box) return;
    const mime = String(asset.mime_type || "").toLowerCase();
    const safeUrl = sanitizeExternalMediaUrl(asset.public_url);
    if (!safeUrl || !(mime.startsWith("text/") || mime === "image/svg+xml")) {
      box.textContent = `Binary document (${mime || "unknown"}). Use "Open File" above to download or inspect.`;
      return;
    }
    try {
      const resp = await fetch(safeUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      box.textContent = text.slice(0, 8000) + (text.length > 8000 ? "\n\n... (preview truncated)" : "");
    } catch (_err) {
      box.textContent = "Preview could not be fetched inline. Use Open File above.";
    }
  }

  function openFolderDialog(mode, folder = null, onSaved = null) {
    const esc = C().escapeHtml;
    const isRename = mode === "rename" && folder;
    const parentOptions = [
      `<option value="">Root (Top Level)</option>`,
      ...DAM_STATE.folders
        .filter((f) => !isRename || String(f.id) !== String(folder.id))
        .map(
          (f) =>
            `<option value="${esc(f.id)}" ${
              isRename && String(folder.parent_id || "") === String(f.id) ? "selected" : ""
            }>${esc(f.name)}</option>`
        )
    ].join("");

    C().showModal({
      title: isRename ? `Rename Folder — ${folder.name}` : "Create Media Folder",
      maxWidth: "460px",
      bodyHtml: `
        <form id="dam-folder-form" class="space-y-3.5">
          <div>
            <label class="admin-label" for="dam-folder-name">Folder Name</label>
            <input id="dam-folder-name" type="text" class="admin-input" value="${esc(isRename ? folder.name : "")}" required maxlength="80" placeholder="e.g. Case Studies 2026">
          </div>
          ${
            !isRename
              ? `<div>
                  <label class="admin-label" for="dam-folder-parent">Parent Folder (optional)</label>
                  <select id="dam-folder-parent" class="admin-select">${parentOptions}</select>
                </div>`
              : ""
          }
          <div>
            <label class="admin-label" for="dam-folder-desc">Description</label>
            <textarea id="dam-folder-desc" rows="2" class="admin-textarea text-xs" placeholder="Optional purpose notes...">${esc(isRename ? folder.description || "" : "")}</textarea>
          </div>
        </form>
      `,
      footerHtml: `
        <div class="flex items-center justify-end gap-2">
          <button type="button" id="dam-folder-cancel" class="btn-secondary">Cancel</button>
          <button type="submit" form="dam-folder-form" id="dam-folder-save" class="btn-primary">${isRename ? "Save Folder" : "Create Folder"}</button>
        </div>
      `,
      onMount: ({ bodyEl, footerEl, close }) => {
        footerEl.querySelector("#dam-folder-cancel").addEventListener("click", close);
        bodyEl.querySelector("#dam-folder-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const btn = footerEl.querySelector("#dam-folder-save");
          btn.disabled = true;
          try {
            const name = bodyEl.querySelector("#dam-folder-name").value.trim();
            const description = bodyEl.querySelector("#dam-folder-desc").value.trim();
            if (isRename) {
              await DB().renameMediaFolder(folder.id, { name, description });
              notify(`Folder renamed to "${name}".`, "success");
            } else {
              const parentId = bodyEl.querySelector("#dam-folder-parent")?.value || null;
              const created = await DB().createMediaFolder({ name, parentId, description });
              if (created && created.id) DAM_STATE.folderId = created.id;
              notify(`Created folder "${name}".`, "success");
            }
            close();
            if (typeof onSaved === "function") onSaved();
          } catch (err) {
            notify(err.message || "Folder update failed.", "error");
            btn.disabled = false;
          }
        });
      }
    });
  }

  async function confirmSafeMediaDeletion(assets) {
    const list = Array.isArray(assets) ? assets : [assets];
    const allRefs = [];
    await Promise.all(
      list.map(async (asset) => {
        const refs = await DB().checkMediaReferences(asset).catch(() => []);
        refs.forEach((r) => allRefs.push({ assetName: asset.file_name, ...r }));
      })
    );

    const publishedRefs = allRefs.filter((r) => r.isPublished);
    const nonPublishedRefs = allRefs.filter((r) => !r.isPublished);

    if (publishedRefs.length > 0) {
      const refPreview = publishedRefs
        .slice(0, 6)
        .map((r) => `${r.assetName} → ${r.label}: "${r.title}" (${r.status})`)
        .join("; ");
      const extraCount = publishedRefs.length > 6 ? ` (+${publishedRefs.length - 6} more)` : "";
      return C().confirmDialog({
        title: "Warning: Asset Used in Published Content",
        message: `This deletion affects live published portfolio content: ${refPreview}${extraCount}. Deleting ${list.length > 1 ? "these files" : "this file"} will break live URLs on your public site.`,
        confirmLabel: list.length > 1 ? `Delete ${list.length} Assets Anyway` : "Delete Asset Anyway",
        danger: true,
        requireTypedText: "DELETE"
      });
    }

    if (nonPublishedRefs.length > 0) {
      const refPreview = nonPublishedRefs
        .slice(0, 5)
        .map((r) => `${r.label}: "${r.title}" (${r.status})`)
        .join("; ");
      return C().confirmDialog({
        title: "Referenced in Draft / Archived Content",
        message: `Referenced by unpublished items (${refPreview}). Permanently delete ${list.length > 1 ? `${list.length} selected assets` : `"${list[0].file_name}"`} from Supabase Storage?`,
        confirmLabel: "Delete",
        danger: true
      });
    }

    return C().confirmDialog({
      title: list.length > 1 ? `Delete ${list.length} Media Assets` : "Delete Media Asset",
      message:
        list.length > 1
          ? `Permanently delete ${list.length} unused assets from Supabase Storage and metadata?`
          : `Permanently delete unused asset "${list[0].file_name}" from Supabase Storage and metadata?`,
      confirmLabel: list.length > 1 ? "Delete Selected" : "Delete Asset",
      danger: true
    });
  }

  function openAssetInspectorModal(asset, onChanged) {
    const esc = C().escapeHtml;
    const tagsArr = Array.isArray(asset.tags) ? asset.tags : [];
    const folderOptions = [
      `<option value="">Unfiled (Root)</option>`,
      ...DAM_STATE.folders.map(
        (f) => `<option value="${esc(f.id)}" ${String(asset.folder_id || "") === String(f.id) ? "selected" : ""}>${esc(f.name)}</option>`
      )
    ].join("");
    const kindOptions = ["image", "video", "pdf", "document", "certificate", "resume"]
      .map((k) => `<option value="${k}" ${asset.asset_kind === k ? "selected" : ""}>${esc(k)}</option>`)
      .join("");

    const optInfo = asset.optimization_info && typeof asset.optimization_info === "object" ? asset.optimization_info : {};
    const optSummary = optInfo.optimized
      ? `Optimized (${optInfo.savedPercent || 0}% saved: ${formatBytes(optInfo.originalBytes)} → ${formatBytes(optInfo.finalBytes)})`
      : "Original binary";

    C().showModal({
      title: `Asset Inspector — ${asset.file_name}`,
      maxWidth: "960px",
      bodyHtml: `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div class="lg:col-span-7 space-y-4">
            ${renderRichPreviewHtml(asset)}

            <div class="admin-panel p-3.5 space-y-2 text-xs">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="font-semibold text-[var(--admin-text)]">File Metadata</span>
                <button type="button" id="dam-insp-copy" class="btn-secondary text-xs py-1 min-h-0">Copy URL</button>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono-tech text-[11px]">
                <div><span class="text-[var(--admin-muted)]">MIME:</span> ${esc(asset.mime_type)}</div>
                <div><span class="text-[var(--admin-muted)]">Size:</span> ${esc(formatBytes(asset.file_size_bytes))}</div>
                <div><span class="text-[var(--admin-muted)]">Dimensions:</span> ${asset.width && asset.height ? `${esc(asset.width)}×${esc(asset.height)}` : "N/A"}</div>
                <div><span class="text-[var(--admin-muted)]">Duration:</span> ${asset.duration_seconds ? `${esc(asset.duration_seconds)}s` : "N/A"}</div>
                <div class="col-span-2"><span class="text-[var(--admin-muted)]">Optimization:</span> ${esc(optSummary)}</div>
                <div class="col-span-full truncate" title="${esc(asset.storage_path)}"><span class="text-[var(--admin-muted)]">Storage Path:</span> ${esc(asset.storage_path)}</div>
                <div class="col-span-full truncate" title="${esc(asset.public_url)}"><span class="text-[var(--admin-muted)]">Public URL:</span> ${esc(asset.public_url)}</div>
              </div>
            </div>

            <div class="admin-panel p-3.5 space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-semibold">Usage Tracking Across Portfolio Content</span>
                <button type="button" id="dam-insp-rescan" class="btn-ghost text-xs py-1 min-h-0">Rescan Usage</button>
              </div>
              <div id="dam-insp-usage" class="text-xs text-[var(--admin-muted)]">Scanning portfolio modules...</div>
            </div>
          </div>

          <div class="lg:col-span-5 space-y-4">
            <form id="dam-insp-meta-form" class="admin-panel p-4 space-y-3">
              <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Edit Metadata</h3>
              <div>
                <label class="admin-label" for="dam-m-filename">File Name</label>
                <input id="dam-m-filename" type="text" class="admin-input text-xs" value="${esc(asset.file_name)}" required>
              </div>
              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="admin-label" for="dam-m-folder">Folder</label>
                  <select id="dam-m-folder" class="admin-select text-xs">${folderOptions}</select>
                </div>
                <div>
                  <label class="admin-label" for="dam-m-kind">Asset Kind</label>
                  <select id="dam-m-kind" class="admin-select text-xs">${kindOptions}</select>
                </div>
              </div>
              <div>
                <label class="admin-label" for="dam-m-alt">Alt Text</label>
                <input id="dam-m-alt" type="text" class="admin-input text-xs" value="${esc(asset.alt_text || "")}" placeholder="Accessible description for screen readers">
              </div>
              <div>
                <label class="admin-label" for="dam-m-caption">Caption</label>
                <input id="dam-m-caption" type="text" class="admin-input text-xs" value="${esc(asset.caption || "")}" placeholder="Short caption shown under galleries or cards">
              </div>
              <div>
                <label class="admin-label" for="dam-m-desc">Description</label>
                <textarea id="dam-m-desc" rows="3" class="admin-textarea text-xs" placeholder="Internal or contextual asset notes...">${esc(asset.description || "")}</textarea>
              </div>
              <div>
                <label class="admin-label" for="dam-m-tags">Tags (comma-separated)</label>
                <input id="dam-m-tags" type="text" class="admin-input text-xs" value="${esc(tagsArr.join(", "))}" placeholder="hero, dashboard, case-study">
              </div>
              <button type="submit" id="dam-m-save" class="btn-primary text-xs w-full">Save Metadata</button>
            </form>

            <form id="dam-insp-replace-form" class="admin-panel p-4 space-y-2.5 border-indigo-500/30">
              <h3 class="text-xs font-bold uppercase tracking-wider text-indigo-300">Replace Underlying File</h3>
              <p class="text-[11px] text-[var(--admin-muted)]">Same extension replaces the Storage object in place so existing live URLs stay intact.</p>
              <input id="dam-replace-input" type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.avif,.svg,.mp4,.webm,.ogv,.ogg,.mov,.pdf,.txt,.md,.csv,.doc,.docx" class="admin-input text-xs" required>
              <label class="flex items-center gap-2 text-xs text-[var(--admin-text-secondary)]">
                <input id="dam-replace-optimize" type="checkbox" class="w-4 h-4 accent-indigo-500">
                <span>Optimize raster image on replace (may convert to WebP)</span>
              </label>
              <button type="submit" id="dam-replace-btn" class="btn-secondary text-xs w-full">Replace File Binary</button>
            </form>
          </div>
        </div>
      `,
      footerHtml: `
        <div class="flex flex-wrap items-center justify-between gap-2 w-full">
          <button type="button" id="dam-insp-delete" class="btn-danger text-xs">Delete Asset</button>
          <button type="button" id="dam-insp-close" class="btn-secondary text-xs">Close</button>
        </div>
      `,
      onMount: ({ bodyEl, footerEl, close }) => {
        hydrateDocumentTextPreview(asset, bodyEl);

        const usageMount = bodyEl.querySelector("#dam-insp-usage");
        async function loadUsage() {
          usageMount.innerHTML = `<span class="text-xs text-[var(--admin-muted)]">Scanning portfolio content...</span>`;
          try {
            const refs = await DB().checkMediaReferences(asset);
            if (!refs.length) {
              usageMount.innerHTML = `<p class="text-xs text-emerald-400">Safe to delete: not currently referenced by any scanned portfolio content.</p>`;
              return;
            }
            const pubCount = refs.filter((r) => r.isPublished).length;
            usageMount.innerHTML = `
              <div class="space-y-2">
                ${
                  pubCount > 0
                    ? `<p class="text-xs font-semibold text-amber-300">In use by ${pubCount} published record(s). Deletion is guarded.</p>`
                    : `<p class="text-xs text-sky-300">Referenced only by ${refs.length} draft/archived record(s).</p>`
                }
                <ul class="space-y-1 max-h-36 overflow-y-auto">
                  ${refs
                    .map(
                      (r) => `
                    <li class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded border border-[var(--admin-border)] bg-[var(--admin-bg)] text-[11px]">
                      <span class="truncate"><strong>${esc(r.label)}:</strong> ${esc(r.title)}</span>
                      ${C().statusBadge(r.status)}
                    </li>
                  `
                    )
                    .join("")}
                </ul>
              </div>
            `;
          } catch (err) {
            usageMount.innerHTML = `<p class="text-xs text-rose-400">${esc(err.message)}</p>`;
          }
        }
        loadUsage();

        bodyEl.querySelector("#dam-insp-rescan").addEventListener("click", loadUsage);
        footerEl.querySelector("#dam-insp-close").addEventListener("click", close);

        bodyEl.querySelector("#dam-insp-copy").addEventListener("click", async () => {
          await navigator.clipboard.writeText(asset.public_url || "").catch(() => {});
          notify("Asset public URL copied.", "success");
        });

        bodyEl.querySelector("#dam-insp-meta-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const btn = bodyEl.querySelector("#dam-m-save");
          btn.disabled = true;
          try {
            const updated = await DB().updateMediaMetadata(asset.id, {
              fileName: bodyEl.querySelector("#dam-m-filename").value,
              folderId: bodyEl.querySelector("#dam-m-folder").value || null,
              assetKind: bodyEl.querySelector("#dam-m-kind").value,
              altText: bodyEl.querySelector("#dam-m-alt").value,
              caption: bodyEl.querySelector("#dam-m-caption").value,
              description: bodyEl.querySelector("#dam-m-desc").value,
              tags: bodyEl.querySelector("#dam-m-tags").value
            });
            notify("Asset metadata updated.", "success");
            close();
            if (typeof onChanged === "function") onChanged(updated);
          } catch (err) {
            notify(err.message || "Metadata save failed.", "error");
            btn.disabled = false;
          }
        });

        bodyEl.querySelector("#dam-insp-replace-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fileIn = bodyEl.querySelector("#dam-replace-input");
          const newFile = fileIn.files && fileIn.files[0];
          if (!newFile) return;
          const btn = bodyEl.querySelector("#dam-replace-btn");
          btn.disabled = true;
          btn.textContent = "Replacing...";
          try {
            const optimize = Boolean(bodyEl.querySelector("#dam-replace-optimize")?.checked);
            const updated = await DB().replaceMediaFile(asset, newFile, { optimizeImage: optimize });
            notify(`Replaced "${asset.file_name}" cleanly.`, "success");
            close();
            if (typeof onChanged === "function") onChanged(updated);
          } catch (err) {
            notify(err.message || "Replacement failed.", "error");
            btn.disabled = false;
            btn.textContent = "Replace File Binary";
          }
        });

        footerEl.querySelector("#dam-insp-delete").addEventListener("click", async () => {
          const ok = await confirmSafeMediaDeletion([asset]);
          if (!ok) return;
          try {
            await DB().deleteMediaAsset(asset);
            DAM_STATE.selectedIds.delete(asset.id);
            notify(`Deleted "${asset.file_name}".`, "success");
            close();
            if (typeof onChanged === "function") onChanged();
          } catch (err) {
            notify(err.message || "Delete failed.", "error");
          }
        });

        C().refreshIcons();
      }
    });
  }

  async function render(mount) {
    const esc = C().escapeHtml;
    mount.innerHTML = `
      <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold">Digital Asset Management (Supabase Storage)</h1>
            <p class="text-xs sm:text-sm text-[var(--admin-muted)] mt-0.5">
              Organize folders, optimize images, preview video/PDF/documents, tag metadata, replace files, and protect published assets (max 50 MB; executables blocked).
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" id="dam-new-folder-btn" class="btn-secondary text-xs">
              <i data-lucide="folder-plus" class="w-3.5 h-3.5"></i>
              <span>New Folder</span>
            </button>
          </div>
        </div>

        <!-- Multi-File / Drag-and-Drop Uploader + Optimization Controls -->
        <section class="admin-card p-4 sm:p-5 space-y-4">
          <div id="dam-dropzone" tabindex="0" class="rounded-xl border-2 border-dashed border-[var(--admin-border)] hover:border-[var(--admin-primary)] transition p-5 text-center space-y-2 cursor-pointer bg-[var(--admin-bg)]/50">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center mx-auto text-indigo-300">
              <i data-lucide="upload-cloud" class="w-5 h-5"></i>
            </div>
            <p class="text-sm font-semibold">Drag &amp; drop files here, or click to select single or bulk files</p>
            <p class="text-xs text-[var(--admin-muted)]">
              Supported: Images (JPEG, PNG, WebP, GIF, AVIF, Safe SVG), Videos (MP4, WebM, OGG, MOV), PDF, Documents (TXT, MD, CSV, DOC, DOCX)
            </p>
            <input id="dam-file-input" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.gif,.avif,.svg,.mp4,.webm,.ogv,.ogg,.mov,.pdf,.txt,.md,.csv,.doc,.docx" class="hidden">
            <div id="dam-queued-label" class="text-xs font-mono-tech text-indigo-300"></div>
          </div>

          <form id="dam-upload-form" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div>
              <label class="admin-label" for="dam-up-folder">Target Folder</label>
              <select id="dam-up-folder" class="admin-select text-xs"></select>
            </div>
            <div>
              <label class="admin-label" for="dam-up-kind">Asset Kind</label>
              <select id="dam-up-kind" class="admin-select text-xs">
                <option value="auto">Auto-detect by MIME</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="document">Document</option>
                <option value="certificate">Certificate</option>
                <option value="resume">Resume</option>
              </select>
            </div>
            <div>
              <label class="admin-label" for="dam-up-alt">Default Alt Text</label>
              <input id="dam-up-alt" type="text" class="admin-input text-xs" placeholder="Optional alt text">
            </div>
            <div>
              <label class="admin-label" for="dam-up-tags">Tags (comma-separated)</label>
              <input id="dam-up-tags" type="text" class="admin-input text-xs" placeholder="e.g. portfolio, hero">
            </div>
            <div>
              <label class="admin-label" for="dam-opt-preset">Image Optimization</label>
              <select id="dam-opt-preset" class="admin-select text-xs">
                <option value="webp-1920">Optimize → WebP (1920px, 82%)</option>
                <option value="webp-1280">Compact → WebP (1280px, 78%)</option>
                <option value="jpeg-1920">Optimize → JPEG (1920px, 85%)</option>
                <option value="off">Keep Original (No Compression)</option>
              </select>
            </div>
            <button type="submit" id="dam-upload-submit" class="btn-primary text-xs w-full">Upload Queued Files</button>
          </form>

          <div id="dam-upload-progress" class="hidden space-y-1.5 text-xs"></div>
        </section>

        <!-- Folder Sidebar + Asset Grid/Table Workspace -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <aside class="lg:col-span-3 admin-card p-3.5 space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Folders</h2>
              <button type="button" id="dam-folder-refresh" class="btn-ghost p-1 min-h-0 text-xs" title="Refresh folders">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              </button>
            </div>
            <div id="dam-folder-list" class="space-y-1"></div>
          </aside>

          <section class="lg:col-span-9 space-y-4">
            <!-- Filter, Search, Sort, View Bar -->
            <div class="admin-card p-3.5 flex flex-wrap items-center gap-2.5">
              <input id="dam-search" type="search" class="admin-input text-xs flex-1 min-w-[180px]" placeholder="Search filename, alt text, caption, description..." value="${esc(DAM_STATE.search)}">
              <select id="dam-filter-kind" class="admin-select text-xs w-36">
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="pdf">PDFs</option>
                <option value="document">Documents</option>
                <option value="certificate">Certificates</option>
                <option value="resume">Resumes</option>
              </select>
              <select id="dam-filter-tag" class="admin-select text-xs w-36">
                <option value="all">All Tags</option>
              </select>
              <select id="dam-sort" class="admin-select text-xs w-44">
                <option value="created_at:desc">Newest First</option>
                <option value="created_at:asc">Oldest First</option>
                <option value="file_name:asc">Name (A–Z)</option>
                <option value="file_name:desc">Name (Z–A)</option>
                <option value="file_size_bytes:desc">Largest File First</option>
                <option value="file_size_bytes:asc">Smallest File First</option>
                <option value="updated_at:desc">Recently Updated</option>
              </select>
              <div class="inline-flex rounded-lg border border-[var(--admin-border)] overflow-hidden">
                <button type="button" id="dam-view-grid" class="btn-ghost text-xs px-2.5 py-1.5 min-h-0 rounded-none" title="Grid View">Grid</button>
                <button type="button" id="dam-view-list" class="btn-ghost text-xs px-2.5 py-1.5 min-h-0 rounded-none" title="List View">List</button>
              </div>
            </div>

            <!-- Bulk Actions Bar -->
            <div id="dam-bulk-bar" class="hidden admin-card p-3 flex flex-wrap items-center justify-between gap-2.5 border-indigo-500/40 bg-indigo-500/5">
              <div class="flex items-center gap-2 text-xs">
                <span id="dam-bulk-count" class="font-semibold text-indigo-300">0 selected</span>
                <button type="button" id="dam-bulk-clear" class="text-[var(--admin-muted)] hover:underline">Clear</button>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <select id="dam-bulk-move-folder" class="admin-select text-xs w-44">
                  <option value="">Move to folder...</option>
                </select>
                <button type="button" id="dam-bulk-move-btn" class="btn-secondary text-xs py-1 min-h-0">Move</button>
                <button type="button" id="dam-bulk-delete-btn" class="btn-danger text-xs py-1 min-h-0">Bulk Delete</button>
              </div>
            </div>

            <div id="dam-assets-mount">${C().renderSkeleton(4)}</div>
          </section>
        </div>
      </div>
    `;

    let queuedFiles = [];
    const dropzone = document.getElementById("dam-dropzone");
    const fileInput = document.getElementById("dam-file-input");
    const queuedLabel = document.getElementById("dam-queued-label");
    const progressMount = document.getElementById("dam-upload-progress");

    function updateQueuedLabel() {
      if (!queuedFiles.length) {
        queuedLabel.textContent = "";
        return;
      }
      const totalBytes = queuedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
      queuedLabel.textContent = `${queuedFiles.length} file(s) queued (${formatBytes(totalBytes)} total): ${queuedFiles
        .slice(0, 3)
        .map((f) => f.name)
        .join(", ")}${queuedFiles.length > 3 ? ` +${queuedFiles.length - 3} more` : ""}`;
    }

    dropzone.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput.click();
      }
    });
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("border-[var(--admin-primary)]");
    });
    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("border-[var(--admin-primary)]");
    });
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("border-[var(--admin-primary)]");
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length) {
        queuedFiles = files;
        updateQueuedLabel();
      }
    });
    fileInput.addEventListener("change", () => {
      queuedFiles = Array.from(fileInput.files || []);
      updateQueuedLabel();
    });

    async function loadFolders() {
      try {
        DAM_STATE.folders = await DB().listMediaFolders();
      } catch (_err) {
        DAM_STATE.folders = [];
      }
      renderFolderUi();
    }

    function renderFolderUi() {
      const folderList = document.getElementById("dam-folder-list");
      const upFolder = document.getElementById("dam-up-folder");
      const bulkMoveSel = document.getElementById("dam-bulk-move-folder");

      const folderSelectOptions = [
        `<option value="">Unfiled (Root)</option>`,
        ...DAM_STATE.folders.map((f) => `<option value="${esc(f.id)}">${esc(f.name)}</option>`)
      ].join("");

      if (upFolder) {
        const prev = upFolder.value;
        upFolder.innerHTML = folderSelectOptions;
        if (DAM_STATE.folderId !== "all" && DAM_STATE.folderId !== "unfiled") {
          upFolder.value = DAM_STATE.folderId;
        } else if (prev) {
          upFolder.value = prev;
        }
      }
      if (bulkMoveSel) {
        bulkMoveSel.innerHTML = `<option value="">Move to folder...</option>${folderSelectOptions}`;
      }

      const itemBtn = (id, label, icon, allowActions = false, folderObj = null) => {
        const active = String(DAM_STATE.folderId) === String(id);
        return `
          <div class="flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-xs ${
            active ? "bg-indigo-500/20 text-indigo-200 border border-indigo-400/40" : "hover:bg-[var(--admin-surface-2)] text-[var(--admin-text-secondary)]"
          }">
            <button type="button" class="flex items-center gap-2 flex-1 min-w-0 text-left" data-folder-pick="${esc(id)}">
              <i data-lucide="${esc(icon)}" class="w-3.5 h-3.5 shrink-0"></i>
              <span class="truncate">${esc(label)}</span>
            </button>
            ${
              allowActions && folderObj
                ? `
                <div class="flex items-center gap-1 shrink-0">
                  <button type="button" class="btn-ghost p-1 min-h-0" title="Rename folder" data-folder-rename="${esc(folderObj.id)}"><i data-lucide="pencil" class="w-3 h-3"></i></button>
                  <button type="button" class="btn-ghost p-1 min-h-0 text-rose-400" title="Delete folder" data-folder-del="${esc(folderObj.id)}"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
                </div>
              `
                : ""
            }
          </div>
        `;
      };

      folderList.innerHTML = [
        itemBtn("all", "All Assets", "layers"),
        itemBtn("unfiled", "Unfiled", "inbox"),
        ...DAM_STATE.folders.map((f) => itemBtn(f.id, f.name, "folder", true, f))
      ].join("");

      folderList.querySelectorAll("[data-folder-pick]").forEach((btn) => {
        btn.addEventListener("click", () => {
          DAM_STATE.folderId = btn.getAttribute("data-folder-pick");
          DAM_STATE.page = 1;
          renderFolderUi();
          loadAssets();
        });
      });

      folderList.querySelectorAll("[data-folder-rename]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const folder = DAM_STATE.folders.find((f) => String(f.id) === String(btn.getAttribute("data-folder-rename")));
          if (folder) openFolderDialog("rename", folder, () => loadFolders());
        });
      });

      folderList.querySelectorAll("[data-folder-del]").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const folder = DAM_STATE.folders.find((f) => String(f.id) === String(btn.getAttribute("data-folder-del")));
          if (!folder) return;
          const ok = await C().confirmDialog({
            title: "Delete Media Folder",
            message: `Delete folder "${folder.name}"? Files inside will NOT be deleted—they will move cleanly to Unfiled.`,
            confirmLabel: "Delete Folder",
            danger: true
          });
          if (!ok) return;
          try {
            await DB().deleteMediaFolder(folder.id, folder.name);
            if (String(DAM_STATE.folderId) === String(folder.id)) DAM_STATE.folderId = "all";
            notify(`Deleted folder "${folder.name}".`, "success");
            await loadFolders();
            await loadAssets();
          } catch (err) {
            notify(err.message, "error");
          }
        });
      });

      C().refreshIcons();
    }

    function syncBulkBar() {
      const bar = document.getElementById("dam-bulk-bar");
      const countEl = document.getElementById("dam-bulk-count");
      const n = DAM_STATE.selectedIds.size;
      bar.classList.toggle("hidden", n === 0);
      if (countEl) countEl.textContent = `${n} selected`;
    }

    function syncTagFilterOptions(rows) {
      const tagSet = new Set(DAM_STATE.availableTags);
      rows.forEach((r) => {
        if (Array.isArray(r.tags)) r.tags.forEach((t) => tagSet.add(t));
      });
      DAM_STATE.availableTags = Array.from(tagSet).sort();
      const sel = document.getElementById("dam-filter-tag");
      if (!sel) return;
      const cur = DAM_STATE.tag;
      sel.innerHTML = `<option value="all">All Tags</option>${DAM_STATE.availableTags
        .map((t) => `<option value="${esc(t)}" ${t === cur ? "selected" : ""}>#${esc(t)}</option>`)
        .join("")}`;
    }

    async function loadAssets() {
      const assetsMount = document.getElementById("dam-assets-mount");
      assetsMount.innerHTML = C().renderSkeleton(4);
      try {
        const { rows, totalCount } = await DB().listMediaAssets({
          page: DAM_STATE.page,
          pageSize: DAM_STATE.pageSize,
          search: DAM_STATE.search,
          assetKind: DAM_STATE.assetKind,
          folderId: DAM_STATE.folderId,
          tag: DAM_STATE.tag,
          sortBy: DAM_STATE.sortBy,
          ascending: DAM_STATE.ascending
        });

        DAM_STATE.rows = rows;
        DAM_STATE.totalCount = totalCount;
        syncTagFilterOptions(rows);

        if (!rows.length) {
          assetsMount.innerHTML = C().renderEmptyState({
            icon: "images",
            title: "No assets match your filters",
            description: "Upload images, videos, PDFs, or documents above, or adjust your folder, search, or tag filters."
          });
          syncBulkBar();
          C().refreshIcons();
          return;
        }

        const totalPages = Math.max(1, Math.ceil(totalCount / DAM_STATE.pageSize));
        const folderMap = Object.fromEntries(DAM_STATE.folders.map((f) => [String(f.id), f.name]));

        const cardsHtml =
          DAM_STATE.viewMode === "list"
            ? `
            <div class="admin-card overflow-hidden">
              <div class="admin-table-wrap">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th class="w-10"><input type="checkbox" id="dam-select-all" class="w-4 h-4 accent-indigo-500"></th>
                      <th>File</th>
                      <th>Kind</th>
                      <th>Folder</th>
                      <th>Size / Meta</th>
                      <th>Tags</th>
                      <th class="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows
                      .map((a) => {
                        const checked = DAM_STATE.selectedIds.has(a.id) ? "checked" : "";
                        const tags = Array.isArray(a.tags) ? a.tags : [];
                        return `
                        <tr>
                          <td><input type="checkbox" class="dam-cb w-4 h-4 accent-indigo-500" data-dam-id="${esc(a.id)}" ${checked}></td>
                          <td class="max-w-[240px]">
                            <p class="font-semibold truncate text-xs" title="${esc(a.file_name)}">${esc(a.file_name)}</p>
                            <p class="text-[11px] text-[var(--admin-muted)] truncate">${esc(a.alt_text || a.caption || a.mime_type)}</p>
                          </td>
                          <td><span class="status-badge status-published">${esc(a.asset_kind)}</span></td>
                          <td class="text-xs">${esc(folderMap[String(a.folder_id || "")] || "Unfiled")}</td>
                          <td class="text-xs font-mono-tech">${esc(formatBytes(a.file_size_bytes))}${a.width && a.height ? ` · ${a.width}×${a.height}` : ""}</td>
                          <td class="text-xs">${tags.slice(0, 3).map((t) => `<span class="inline-block px-1.5 py-0.5 rounded bg-[var(--admin-surface-2)] mr-1">#${esc(t)}</span>`).join("")}</td>
                          <td class="text-right">
                            <div class="inline-flex gap-1.5">
                              <button type="button" class="btn-secondary text-xs py-1 min-h-0" data-dam-inspect="${esc(a.id)}">Preview / Edit</button>
                              <button type="button" class="btn-ghost text-xs py-1 min-h-0" data-dam-copy="${esc(a.public_url)}">Copy URL</button>
                              <button type="button" class="btn-danger text-xs py-1 min-h-0" data-dam-del="${esc(a.id)}">Delete</button>
                            </div>
                          </td>
                        </tr>
                      `;
                      })
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>
          `
            : `
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              ${rows
                .map((a) => {
                  const checked = DAM_STATE.selectedIds.has(a.id) ? "checked" : "";
                  const tags = Array.isArray(a.tags) ? a.tags : [];
                  const optSaved = a.optimization_info && a.optimization_info.optimized ? a.optimization_info.savedPercent : 0;
                  return `
                  <article class="admin-card p-3.5 flex flex-col justify-between gap-3">
                    <div class="space-y-2.5">
                      <div class="relative">
                        ${renderCardThumb(a)}
                        <label class="absolute top-2 left-2 w-6 h-6 rounded-md bg-slate-950/75 border border-white/20 flex items-center justify-center cursor-pointer">
                          <input type="checkbox" class="dam-cb w-3.5 h-3.5 accent-indigo-500" data-dam-id="${esc(a.id)}" ${checked}>
                        </label>
                        ${optSaved > 0 ? `<span class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500/90 text-slate-950 text-[10px] font-mono-tech font-bold">-${optSaved}%</span>` : ""}
                      </div>
                      <div>
                        <p class="text-sm font-semibold truncate" title="${esc(a.file_name)}">${esc(a.file_name)}</p>
                        <p class="text-[11px] font-mono-tech text-[var(--admin-muted)]">
                          ${esc(a.asset_kind)} · ${esc(formatBytes(a.file_size_bytes))}${a.width && a.height ? ` · ${a.width}×${a.height}` : ""}${a.duration_seconds ? ` · ${a.duration_seconds}s` : ""}
                        </p>
                        <p class="text-[11px] text-[var(--admin-muted)] truncate">
                          Folder: ${esc(folderMap[String(a.folder_id || "")] || "Unfiled")}
                        </p>
                      </div>
                      ${
                        tags.length
                          ? `<div class="flex flex-wrap gap-1">${tags
                              .slice(0, 4)
                              .map((t) => `<span class="px-1.5 py-0.5 rounded bg-[var(--admin-surface-2)] text-[10px] font-mono-tech">#${esc(t)}</span>`)
                              .join("")}</div>`
                          : ""
                      }
                    </div>
                    <div class="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--admin-border)]">
                      <button type="button" class="btn-primary text-xs py-1 min-h-0 flex-1" data-dam-inspect="${esc(a.id)}">Preview / Edit</button>
                      <button type="button" class="btn-secondary text-xs py-1 min-h-0" data-dam-copy="${esc(a.public_url)}">Copy URL</button>
                      <button type="button" class="btn-danger text-xs py-1 min-h-0" data-dam-del="${esc(a.id)}">Delete</button>
                    </div>
                  </article>
                `;
                })
                .join("")}
            </div>
          `;

        assetsMount.innerHTML = `
          ${cardsHtml}
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--admin-muted)]">
            <span class="tabular-nums">Page ${DAM_STATE.page} of ${totalPages} (${totalCount} total assets)</span>
            <div class="flex items-center gap-2">
              <button type="button" id="dam-prev-page" class="btn-secondary text-xs" ${DAM_STATE.page <= 1 ? "disabled" : ""}>Previous</button>
              <button type="button" id="dam-next-page" class="btn-secondary text-xs" ${DAM_STATE.page >= totalPages ? "disabled" : ""}>Next</button>
            </div>
          </div>
        `;

        const selectAll = document.getElementById("dam-select-all");
        if (selectAll) {
          selectAll.checked = rows.length > 0 && rows.every((r) => DAM_STATE.selectedIds.has(r.id));
          selectAll.addEventListener("change", () => {
            rows.forEach((r) => {
              if (selectAll.checked) {
                DAM_STATE.selectedIds.add(r.id);
                DAM_STATE.selectedMap.set(r.id, r);
              } else {
                DAM_STATE.selectedIds.delete(r.id);
                DAM_STATE.selectedMap.delete(r.id);
              }
            });
            loadAssets();
          });
        }

        assetsMount.querySelectorAll(".dam-cb").forEach((cb) => {
          cb.addEventListener("change", () => {
            const id = cb.getAttribute("data-dam-id");
            const matched = rows.find((r) => String(r.id) === String(id));
            if (cb.checked) {
              DAM_STATE.selectedIds.add(id);
              if (matched) DAM_STATE.selectedMap.set(id, matched);
            } else {
              DAM_STATE.selectedIds.delete(id);
              DAM_STATE.selectedMap.delete(id);
            }
            syncBulkBar();
          });
        });

        assetsMount.querySelectorAll("[data-dam-inspect]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const asset = rows.find((r) => String(r.id) === String(btn.getAttribute("data-dam-inspect")));
            if (asset) openAssetInspectorModal(asset, () => loadAssets());
          });
        });

        assetsMount.querySelectorAll("[data-dam-copy]").forEach((btn) => {
          btn.addEventListener("click", async () => {
            await navigator.clipboard.writeText(btn.getAttribute("data-dam-copy") || "").catch(() => {});
            notify("Public URL copied to clipboard.", "success");
          });
        });

        assetsMount.querySelectorAll("[data-dam-del]").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const asset = rows.find((r) => String(r.id) === String(btn.getAttribute("data-dam-del")));
            if (!asset) return;
            const ok = await confirmSafeMediaDeletion([asset]);
            if (!ok) return;
            try {
              await DB().deleteMediaAsset(asset);
              DAM_STATE.selectedIds.delete(asset.id);
              DAM_STATE.selectedMap.delete(asset.id);
              notify(`Deleted "${asset.file_name}".`, "success");
              loadAssets();
            } catch (err) {
              notify(err.message, "error");
            }
          });
        });

        document.getElementById("dam-prev-page")?.addEventListener("click", () => {
          DAM_STATE.page = Math.max(1, DAM_STATE.page - 1);
          loadAssets();
        });
        document.getElementById("dam-next-page")?.addEventListener("click", () => {
          DAM_STATE.page = Math.min(totalPages, DAM_STATE.page + 1);
          loadAssets();
        });

        syncBulkBar();
        C().refreshIcons();
      } catch (err) {
        assetsMount.innerHTML = C().renderErrorState({ message: err.message });
        C().refreshIcons();
      }
    }

    // Bind top toolbar & upload controls
    document.getElementById("dam-new-folder-btn").addEventListener("click", () => openFolderDialog("create", null, loadFolders));
    document.getElementById("dam-folder-refresh").addEventListener("click", loadFolders);

    document.getElementById("dam-search").addEventListener("input", (e) => {
      DAM_STATE.search = e.target.value;
      DAM_STATE.page = 1;
      loadAssets();
    });
    document.getElementById("dam-filter-kind").addEventListener("change", (e) => {
      DAM_STATE.assetKind = e.target.value;
      DAM_STATE.page = 1;
      loadAssets();
    });
    document.getElementById("dam-filter-tag").addEventListener("change", (e) => {
      DAM_STATE.tag = e.target.value;
      DAM_STATE.page = 1;
      loadAssets();
    });
    document.getElementById("dam-sort").addEventListener("change", (e) => {
      const [col, dir] = e.target.value.split(":");
      DAM_STATE.sortBy = col;
      DAM_STATE.ascending = dir === "asc";
      DAM_STATE.page = 1;
      loadAssets();
    });
    document.getElementById("dam-view-grid").addEventListener("click", () => {
      DAM_STATE.viewMode = "grid";
      loadAssets();
    });
    document.getElementById("dam-view-list").addEventListener("click", () => {
      DAM_STATE.viewMode = "list";
      loadAssets();
    });

    document.getElementById("dam-bulk-clear").addEventListener("click", () => {
      DAM_STATE.selectedIds.clear();
      DAM_STATE.selectedMap.clear();
      loadAssets();
    });
    document.getElementById("dam-bulk-move-btn").addEventListener("click", async () => {
      const ids = Array.from(DAM_STATE.selectedIds);
      const targetFolder = document.getElementById("dam-bulk-move-folder").value || null;
      if (!ids.length) return;
      try {
        await DB().bulkMoveMediaFolder(ids, targetFolder);
        DAM_STATE.selectedIds.clear();
        DAM_STATE.selectedMap.clear();
        notify(`Moved ${ids.length} asset(s).`, "success");
        loadAssets();
      } catch (err) {
        notify(err.message, "error");
      }
    });
    document.getElementById("dam-bulk-delete-btn").addEventListener("click", async () => {
      const ids = Array.from(DAM_STATE.selectedIds);
      const targets = ids.map((id) => DAM_STATE.selectedMap.get(id) || DAM_STATE.rows.find((r) => r.id === id)).filter(Boolean);
      if (!targets.length) return;
      const ok = await confirmSafeMediaDeletion(targets);
      if (!ok) return;
      try {
        await DB().bulkDeleteMediaAssets(targets);
        DAM_STATE.selectedIds.clear();
        DAM_STATE.selectedMap.clear();
        notify(`Deleted ${targets.length} asset(s).`, "success");
        loadAssets();
      } catch (err) {
        notify(err.message, "error");
      }
    });

    document.getElementById("dam-upload-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!queuedFiles.length) {
        notify("Select or drop at least one file to upload.", "warning");
        return;
      }
      const btn = document.getElementById("dam-upload-submit");
      const folderId = document.getElementById("dam-up-folder").value || null;
      const assetKind = document.getElementById("dam-up-kind").value;
      const altText = document.getElementById("dam-up-alt").value;
      const tags = document.getElementById("dam-up-tags").value;
      const preset = document.getElementById("dam-opt-preset").value;

      const optMap = {
        "webp-1920": { enabled: true, targetFormat: "webp", maxDimension: 1920, quality: 0.82 },
        "webp-1280": { enabled: true, targetFormat: "webp", maxDimension: 1280, quality: 0.78 },
        "jpeg-1920": { enabled: true, targetFormat: "jpeg", maxDimension: 1920, quality: 0.85 },
        off: { enabled: false }
      };
      const optCfg = optMap[preset] || optMap["webp-1920"];

      btn.disabled = true;
      btn.textContent = `Uploading 0/${queuedFiles.length}...`;
      progressMount.classList.remove("hidden");
      progressMount.innerHTML = "";

      let okCount = 0;
      let failCount = 0;

      for (let i = 0; i < queuedFiles.length; i += 1) {
        const f = queuedFiles[i];
        btn.textContent = `Uploading ${i + 1}/${queuedFiles.length}...`;
        try {
          const uploaded = await DB().uploadMedia(f, {
            folderId,
            assetKind,
            altText: altText || f.name.replace(/\.[^.]+$/, ""),
            tags,
            optimizeImage: optCfg.enabled,
            optimizeOptions: optCfg
          });
          okCount += 1;
          const savedPct = uploaded?.optimization_info?.optimized ? ` · optimized -${uploaded.optimization_info.savedPercent}%` : "";
          progressMount.innerHTML += `<p class="text-emerald-400">✓ Uploaded ${esc(uploaded.file_name)} (${esc(formatBytes(uploaded.file_size_bytes))}${savedPct})</p>`;
        } catch (err) {
          failCount += 1;
          progressMount.innerHTML += `<p class="text-rose-400">✕ Rejected ${esc(f.name)}: ${esc(err.message)}</p>`;
        }
      }

      btn.disabled = false;
      btn.textContent = "Upload Queued Files";
      queuedFiles = [];
      fileInput.value = "";
      updateQueuedLabel();
      if (okCount > 0) notify(`Uploaded ${okCount} file(s) to Supabase Storage.`, "success");
      if (failCount > 0) notify(`${failCount} file(s) failed validation or upload.`, "warning");
      loadAssets();
    });

    await loadFolders();
    await loadAssets();

    const routeParams = window.AdminRouter && typeof window.AdminRouter.getRouteParams === "function"
      ? window.AdminRouter.getRouteParams()
      : null;
    const inspectId = routeParams ? routeParams.get("inspect") : "";
    if (inspectId) {
      openInspectorById(inspectId, () => loadAssets());
    }
  }

  async function openInspectorById(assetId, onChanged = null) {
    if (!assetId) return;
    const cached = DAM_STATE.rows.find((r) => String(r.id) === String(assetId));
    if (cached) {
      openAssetInspectorModal(cached, onChanged);
      return;
    }
    try {
      const client = window.AdminAuth && window.AdminAuth.getClient();
      if (!client) return;
      const { data, error } = await client.from("media_assets").select("*").eq("id", assetId).single();
      if (!error && data) {
        openAssetInspectorModal(data, onChanged);
      }
    } catch (_err) {
      // ignore missing asset
    }
  }

  window.AdminMediaManager = {
    render,
    openInspectorById,
    formatBytes,
    sanitizeExternalMediaUrl,
    getMediaCategory
  };
})();
