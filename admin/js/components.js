/**
 * AL AMIN Admin CMS — Shared UI Components, Sanitization & Modals (Phase 61)
 * Provides XSS-safe HTML escaping, sanitized HTML previewing for blog posts,
 * accessible modal/confirm dialogs, loading skeletons, empty states, and tables.
 */
(() => {
  let activeModalClose = null;
  let lastFocusEl = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Sanitizes HTML strings for safe blog/rich-text previewing.
   * Strips <script>, <iframe>, <object>, <embed>, <style>, <link>, inline event handlers,
   * and unsafe javascript:/vbscript:/data:text/html URLs.
   */
  function sanitizeHtml(rawHtml) {
    const input = String(rawHtml || "");
    if (!input.trim()) return "";

    if (typeof window.DOMParser === "function") {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(input, "text/html");
      const forbidden = doc.querySelectorAll(
        "script, iframe, object, embed, link, meta, style, form, input, button, textarea"
      );
      forbidden.forEach((node) => node.remove());

      doc.querySelectorAll("*").forEach((el) => {
        Array.from(el.attributes).forEach((attr) => {
          const name = attr.name.toLowerCase();
          const val = String(attr.value || "").trim();
          if (name.startsWith("on") || name === "srcdoc") {
            el.removeAttribute(attr.name);
            return;
          }
          if (
            (name === "href" || name === "src" || name === "xlink:href") &&
            /^\s*(javascript|vbscript|data:text\/html)/i.test(val)
          ) {
            el.removeAttribute(attr.name);
          }
        });
      });

      return doc.body.innerHTML;
    }

    // Fallback conservative stripping when DOMParser is unavailable (e.g., Node VM)
    return input
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
      .replace(/\son\w+\s*=\s*(?:(['"])[\s\S]*?\1|[^\s>]+)/gi, "")
      .replace(/javascript:/gi, "");
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function statusBadge(status) {
    const clean = String(status || "draft").toLowerCase();
    const cssSlug = clean.replace(/[^a-z0-9_-]/g, "");
    return `<span class="status-badge status-${escapeHtml(cssSlug)}">${escapeHtml(clean)}</span>`;
  }

  function renderSkeleton(rows = 5) {
    const lines = Array.from({ length: rows })
      .map(
        () => `
        <div class="admin-card p-4 space-y-2.5">
          <div class="skeleton-line w-1/3"></div>
          <div class="skeleton-line w-2/3"></div>
        </div>
      `
      )
      .join("");
    return `<div class="space-y-3" aria-busy="true" aria-label="Loading content">${lines}</div>`;
  }

  function renderEmptyState({ icon = "inbox", title = "No records found", description = "", actionLabel = "", actionId = "" } = {}) {
    return `
      <div class="admin-card p-8 text-center space-y-3">
        <div class="w-11 h-11 rounded-xl bg-[var(--admin-surface-2)] border border-[var(--admin-border)] flex items-center justify-center mx-auto">
          <i data-lucide="${escapeHtml(icon)}" class="w-5 h-5 text-[var(--admin-primary)]"></i>
        </div>
        <h3 class="text-base font-bold text-[var(--admin-text)]">${escapeHtml(title)}</h3>
        ${description ? `<p class="text-xs sm:text-sm text-[var(--admin-muted)] max-w-md mx-auto">${escapeHtml(description)}</p>` : ""}
        ${actionLabel && actionId ? `<button type="button" id="${escapeHtml(actionId)}" class="btn-primary mx-auto">${escapeHtml(actionLabel)}</button>` : ""}
      </div>
    `;
  }

  function renderErrorState({ title = "Unable to load records", message = "", retryId = "" } = {}) {
    return `
      <div class="admin-card p-6 border-rose-500/40 space-y-3">
        <div class="flex items-start gap-3">
          <i data-lucide="alert-triangle" class="w-5 h-5 text-rose-400 shrink-0 mt-0.5"></i>
          <div class="space-y-1">
            <h3 class="text-sm font-bold text-rose-400">${escapeHtml(title)}</h3>
            <p class="text-xs sm:text-sm text-[var(--admin-text-secondary)]">${escapeHtml(message || "Check your Supabase connection, authentication, or RLS rules.")}</p>
          </div>
        </div>
        ${retryId ? `<button type="button" id="${escapeHtml(retryId)}" class="btn-secondary text-xs">Retry</button>` : ""}
      </div>
    `;
  }

  function closeModal() {
    const backdrop = document.getElementById("admin-modal-backdrop");
    if (!backdrop) return;
    backdrop.classList.remove("is-open");
    backdrop.setAttribute("aria-hidden", "true");
    const body = document.getElementById("admin-modal-body");
    if (body) body.innerHTML = "";
    activeModalClose = null;
    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
      lastFocusEl.focus();
    }
    lastFocusEl = null;
  }

  function showModal({ title = "Dialog", bodyHtml = "", footerHtml = "", maxWidth = "760px", onMount = null } = {}) {
    const backdrop = document.getElementById("admin-modal-backdrop");
    const panel = document.getElementById("admin-modal-panel");
    const titleEl = document.getElementById("admin-modal-title");
    const bodyEl = document.getElementById("admin-modal-body");
    const footerEl = document.getElementById("admin-modal-footer");
    if (!backdrop || !titleEl || !bodyEl || !footerEl) return;

    lastFocusEl = document.activeElement;
    if (panel) panel.style.maxWidth = maxWidth;
    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHtml;
    footerEl.innerHTML = footerHtml;
    footerEl.classList.toggle("hidden", !footerHtml);

    backdrop.classList.add("is-open");
    backdrop.setAttribute("aria-hidden", "false");
    activeModalClose = closeModal;
    refreshIcons();

    if (typeof onMount === "function") {
      onMount({ backdrop, bodyEl, footerEl, close: closeModal });
    }
  }

  function confirmDialog({
    title = "Confirm Action",
    message = "Are you sure you want to continue?",
    confirmLabel = "Confirm",
    danger = false,
    requireTypedText = ""
  } = {}) {
    return new Promise((resolve) => {
      const needsText = String(requireTypedText || "").trim();
      const bodyHtml = `
        <div class="space-y-4">
          <p class="text-sm text-[var(--admin-text-secondary)] leading-relaxed">${escapeHtml(message)}</p>
          ${
            needsText
              ? `
              <div class="space-y-1.5">
                <label class="admin-label" for="confirm-typed-input">Type <span class="font-mono-tech text-rose-400">${escapeHtml(needsText)}</span> to confirm:</label>
                <input id="confirm-typed-input" type="text" class="admin-input" placeholder="${escapeHtml(needsText)}" autocomplete="off">
              </div>
            `
              : ""
          }
        </div>
      `;
      const footerHtml = `
        <div class="flex flex-wrap items-center justify-end gap-2">
          <button type="button" id="admin-confirm-cancel" class="btn-secondary">Cancel</button>
          <button type="button" id="admin-confirm-ok" class="${danger ? "btn-danger" : "btn-primary"}" ${needsText ? "disabled" : ""}>${escapeHtml(confirmLabel)}</button>
        </div>
      `;

      showModal({
        title,
        bodyHtml,
        footerHtml,
        maxWidth: "480px",
        onMount: ({ bodyEl, footerEl, close }) => {
          const okBtn = footerEl.querySelector("#admin-confirm-ok");
          const cancelBtn = footerEl.querySelector("#admin-confirm-cancel");
          const typedInput = bodyEl.querySelector("#confirm-typed-input");

          if (typedInput && okBtn) {
            typedInput.addEventListener("input", () => {
              okBtn.disabled = typedInput.value.trim() !== needsText;
            });
          }

          const finish = (accepted) => {
            close();
            resolve(accepted);
          };

          if (cancelBtn) cancelBtn.addEventListener("click", () => finish(false));
          if (okBtn) okBtn.addEventListener("click", () => finish(true));
        }
      });
    });
  }

  function confirmPublishDialog({
    moduleTitle = "Content",
    recordLabel = "this record",
    targetStatus = "published",
    currentlyPublished = false,
    existingUpdatedAt = "",
    publishAt = "",
    defaultSummary = "",
    itemCount = 1
  } = {}) {
    return new Promise((resolve) => {
      const isSchedule = targetStatus === "scheduled";
      const isBulk = Number(itemCount) > 1;
      const actionHeading = isSchedule
        ? "Confirm Scheduled Publishing"
        : currentlyPublished
        ? "Confirm Update to Live Published Content"
        : isBulk
        ? `Confirm Publishing ${itemCount} Records`
        : "Confirm Publishing";

      const actionBtnLabel = isSchedule
        ? "Confirm Schedule"
        : currentlyPublished
        ? "Preserve Snapshot & Publish"
        : "Confirm & Publish";

      let scheduleLine = "";
      if (isSchedule && publishAt) {
        const dt = new Date(publishAt);
        const validDate = !Number.isNaN(dt.getTime());
        scheduleLine = `
          <div class="admin-panel p-3 text-xs border-indigo-500/35 bg-indigo-500/10 space-y-1">
            <p class="font-semibold text-indigo-300">Server-Side Scheduled Publishing</p>
            <p class="text-[var(--admin-text-secondary)]">
              Scheduled for: <strong class="font-mono-tech">${escapeHtml(validDate ? dt.toLocaleString() : publishAt)}</strong>
              ${validDate ? `<span class="text-[var(--admin-muted)]">(${escapeHtml(dt.toISOString())})</span>` : ""}
            </p>
            <p class="text-[var(--admin-muted)]">
              Executed automatically by trusted server-side Supabase Cron without relying on visitors opening the site.
            </p>
          </div>
        `;
      }

      const overwriteWarning = currentlyPublished
        ? `
          <div class="admin-panel p-3 text-xs border-amber-500/40 bg-amber-500/10 text-amber-200 space-y-1">
            <p class="font-semibold">Previous Published Content Will Be Preserved</p>
            <p>
              "${escapeHtml(recordLabel)}" is currently live${existingUpdatedAt ? ` (last updated ${escapeHtml(new Date(existingUpdatedAt).toLocaleString())})` : ""}.
              Its previous version is saved automatically to Version History before applying this update.
            </p>
          </div>
        `
        : "";

      const bodyHtml = `
        <div class="space-y-3.5">
          <div class="admin-panel p-3 text-xs space-y-1">
            <p><span class="text-[var(--admin-muted)]">Module:</span> <strong>${escapeHtml(moduleTitle)}</strong></p>
            <p><span class="text-[var(--admin-muted)]">Target:</span> <strong>${escapeHtml(isBulk ? `${itemCount} selected records` : recordLabel)}</strong></p>
            <p><span class="text-[var(--admin-muted)]">New Status:</span> ${statusBadge(targetStatus)}</p>
          </div>
          ${overwriteWarning}
          ${scheduleLine}
          <div>
            <label class="admin-label" for="publish-confirm-summary">Change Summary (recorded in Version History &amp; Audit Trail)</label>
            <input id="publish-confirm-summary" type="text" class="admin-input text-xs" value="${escapeHtml(defaultSummary)}" placeholder="Describe what changed and why...">
          </div>
        </div>
      `;

      const footerHtml = `
        <div class="flex flex-wrap items-center justify-end gap-2">
          <button type="button" id="pub-confirm-cancel" class="btn-secondary">Cancel</button>
          <button type="button" id="pub-confirm-ok" class="btn-primary">${escapeHtml(actionBtnLabel)}</button>
        </div>
      `;

      showModal({
        title: actionHeading,
        bodyHtml,
        footerHtml,
        maxWidth: "540px",
        onMount: ({ bodyEl, footerEl, close }) => {
          const summaryIn = bodyEl.querySelector("#publish-confirm-summary");
          const okBtn = footerEl.querySelector("#pub-confirm-ok");
          const cancelBtn = footerEl.querySelector("#pub-confirm-cancel");
          const finish = (confirmed) => {
            const changeSummary = summaryIn ? summaryIn.value.trim() : "";
            close();
            resolve({ confirmed, changeSummary });
          };
          if (cancelBtn) cancelBtn.addEventListener("click", () => finish(false));
          if (okBtn) okBtn.addEventListener("click", () => finish(true));
        }
      });
    });
  }

  function computeJsonDiff(prevObj, nextObj) {
    const prev = prevObj && typeof prevObj === "object" ? prevObj : {};
    const next = nextObj && typeof nextObj === "object" ? nextObj : {};
    const skip = new Set(["updated_at", "created_at", "last_change_summary"]);
    const keys = Array.from(new Set([...Object.keys(prev), ...Object.keys(next)])).filter((k) => !skip.has(k));
    const diffs = [];
    keys.forEach((key) => {
      const a = JSON.stringify(prev[key] ?? null);
      const b = JSON.stringify(next[key] ?? null);
      if (a !== b) {
        diffs.push({
          field: key,
          before: prev[key] === undefined ? "—" : typeof prev[key] === "object" ? JSON.stringify(prev[key]) : String(prev[key]),
          after: next[key] === undefined ? "—" : typeof next[key] === "object" ? JSON.stringify(next[key]) : String(next[key])
        });
      }
    });
    return diffs;
  }

  function bindGlobalModalControls() {
    if (bindGlobalModalControls.bound) return;
    bindGlobalModalControls.bound = true;

    const closeBtn = document.getElementById("admin-modal-close");
    const backdrop = document.getElementById("admin-modal-backdrop");
    if (closeBtn) closeBtn.addEventListener("click", () => closeModal());
    if (backdrop) {
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) closeModal();
      });
    }
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && typeof activeModalClose === "function") {
        activeModalClose();
      }
    });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bindGlobalModalControls);
    } else {
      bindGlobalModalControls();
    }
  }

  window.AdminComponents = {
    escapeHtml,
    sanitizeHtml,
    refreshIcons,
    statusBadge,
    renderSkeleton,
    renderEmptyState,
    renderErrorState,
    showModal,
    closeModal,
    confirmDialog,
    confirmPublishDialog,
    computeJsonDiff
  };
})();
