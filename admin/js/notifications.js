/**
 * AL AMIN Admin CMS — Notifications & Toast Center (Phase 61)
 * Manages accessible toast notifications and persistent notification popover history.
 */
(() => {
  const MAX_HISTORY = 25;
  const history = [];

  function escapeText(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function ensureStack() {
    let stack = document.getElementById("admin-toast-stack");
    if (!stack && document.body) {
      stack = document.createElement("div");
      stack.id = "admin-toast-stack";
      stack.className = "admin-toast-stack";
      stack.setAttribute("aria-live", "polite");
      stack.setAttribute("aria-atomic", "false");
      document.body.appendChild(stack);
    }
    return stack;
  }

  function updateBellBadge() {
    const badge = document.getElementById("admin-notif-badge");
    const listEl = document.getElementById("admin-notif-list");
    const unread = history.filter((item) => !item.read).length;

    if (badge) {
      badge.textContent = unread > 9 ? "9+" : String(unread);
      badge.classList.toggle("hidden", unread === 0);
    }

    if (listEl) {
      if (history.length === 0) {
        listEl.innerHTML = `<p class="text-xs text-[var(--admin-muted)] p-3 text-center">No recent admin notifications.</p>`;
        return;
      }
      listEl.innerHTML = history
        .slice(0, 12)
        .map(
          (item) => `
          <div class="px-3 py-2.5 border-b border-[var(--admin-border)] last:border-b-0 ${item.read ? "opacity-75" : ""}">
            <div class="flex items-center justify-between gap-2 text-xs">
              <span class="font-semibold capitalize">${escapeText(item.type)}</span>
              <span class="font-mono-tech text-[11px] text-[var(--admin-muted)] tabular-nums">${escapeText(item.timeLabel)}</span>
            </div>
            <p class="text-xs text-[var(--admin-text-secondary)] mt-0.5">${escapeText(item.message)}</p>
          </div>
        `
        )
        .join("");
    }
  }

  function notify(message, type = "info", durationMs = 4200) {
    const cleanMsg = String(message || "").trim();
    if (!cleanMsg) return;

    const cleanType = ["success", "error", "warning", "info"].includes(type) ? type : "info";
    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    history.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      message: cleanMsg,
      type: cleanType,
      timeLabel,
      read: false
    });
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    updateBellBadge();

    const stack = ensureStack();
    if (!stack) return;

    const toast = document.createElement("div");
    toast.className = `admin-toast is-${cleanType}`;
    toast.setAttribute("role", cleanType === "error" ? "alert" : "status");
    toast.innerHTML = `
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-xs uppercase tracking-wider text-[var(--admin-muted)]">${escapeText(cleanType)}</p>
        <p class="mt-0.5 text-sm leading-snug">${escapeText(cleanMsg)}</p>
      </div>
      <button type="button" class="btn-ghost p-1 min-h-0 text-xs" aria-label="Dismiss notification">&times;</button>
    `;

    const dismiss = () => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    };

    const closeBtn = toast.querySelector("button");
    if (closeBtn) closeBtn.addEventListener("click", dismiss);

    stack.appendChild(toast);
    if (durationMs > 0) {
      window.setTimeout(dismiss, durationMs);
    }
  }

  function markAllRead() {
    history.forEach((item) => {
      item.read = true;
    });
    updateBellBadge();
  }

  function clearHistory() {
    history.length = 0;
    updateBellBadge();
  }

  window.AdminNotifications = {
    notify,
    markAllRead,
    clearHistory,
    getHistory: () => history.slice()
  };
})();
