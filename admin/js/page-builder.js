/**
 * AL AMIN Admin CMS — Visual Website Page Builder (Phase 66)
 * Powered by PortfolioSectionRegistry + Supabase PostgreSQL (page_sections & page_builder_versions)
 * + Supabase Storage Media Picker. Zero unsafe HTML or arbitrary JS execution.
 */
(() => {
  const DEFAULT_PAGES = [
    { slug: "index.html", label: "Home (index.html)" },
    { slug: "about.html", label: "About (about.html)" },
    { slug: "skills.html", label: "Skills (skills.html)" },
    { slug: "services.html", label: "Services (services.html)" },
    { slug: "projects.html", label: "Projects (projects.html)" },
    { slug: "experience.html", label: "Experience (experience.html)" },
    { slug: "certificates.html", label: "Certificates (certificates.html)" },
    { slug: "blog.html", label: "Blog (blog.html)" },
    { slug: "contact.html", label: "Contact (contact.html)" }
  ];

  const THEME_KEY = "alamin_admin_theme_v1";
  const STATE = {
    adminProfile: null,
    pages: DEFAULT_PAGES.slice(),
    currentPageSlug: "index.html",
    sections: [],
    deletedIds: [],
    selectedId: "",
    viewport: "desktop", // desktop | tablet | mobile
    inspectorTab: "content", // content | style | motion
    dirty: false,
    dragSourceId: ""
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
    const label = document.getElementById("pb-theme-label");
    if (label) label.textContent = clean === "dark" ? "Light Mode" : "Dark Mode";

    const btn = document.getElementById("pb-theme-toggle");
    if (btn) {
      btn.addEventListener("click", () => {
        const next = document.documentElement.classList.contains("light") ? "dark" : "light";
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(next);
        window.localStorage.setItem(THEME_KEY, next);
        if (label) label.textContent = next === "dark" ? "Light Mode" : "Dark Mode";
      });
    }
  }

  function getSelectedSection() {
    return STATE.sections.find((s) => String(s.id) === String(STATE.selectedId)) || null;
  }

  function markDirty() {
    STATE.dirty = true;
    const badge = document.getElementById("pb-dirty-badge");
    if (badge) {
      badge.textContent = "Unsaved edits";
      badge.className = "status-badge status-scheduled";
    }
  }

  function markClean(statusText = "Synchronized") {
    STATE.dirty = false;
    const badge = document.getElementById("pb-dirty-badge");
    if (badge) {
      badge.textContent = statusText;
      badge.className = "status-badge status-published";
    }
  }

  function normalizeSectionRow(row, idx) {
    const defaults = R().createDefaultSection(row.section_type || "custom_content", row.page_slug || STATE.currentPageSlug, idx);
    return {
      ...defaults,
      ...row,
      isNew: Boolean(row.isNew),
      sort_order: typeof row.sort_order === "number" ? row.sort_order : idx,
      content: { ...defaults.content, ...(row.content || {}) },
      style_config: { ...defaults.style_config, ...(row.style_config || {}) },
      layout_config: { ...defaults.layout_config, ...(row.layout_config || {}) },
      animation_config: { ...defaults.animation_config, ...(row.animation_config || {}) },
      visibility_config: { ...defaults.visibility_config, ...(row.visibility_config || {}) }
    };
  }

  async function loadPageOptionsFromDb() {
    const client = window.AdminAuth && window.AdminAuth.getClient();
    if (!client) return;
    const { data } = await client.from("site_pages").select("slug, title").order("display_order", { ascending: true });
    if (Array.isArray(data) && data.length > 0) {
      const seen = new Set(STATE.pages.map((p) => p.slug));
      data.forEach((row) => {
        if (row.slug && !seen.has(row.slug)) {
          seen.add(row.slug);
          STATE.pages.push({ slug: row.slug, label: `${row.title} (${row.slug})` });
        }
      });
    }
    const selectEl = document.getElementById("pb-page-select");
    if (selectEl) {
      selectEl.innerHTML = STATE.pages
        .map((p) => `<option value="${C().escapeHtml(p.slug)}" ${p.slug === STATE.currentPageSlug ? "selected" : ""}>${C().escapeHtml(p.label)}</option>`)
        .join("");
    }
  }

  async function loadSectionsForPage(pageSlug) {
    STATE.currentPageSlug = pageSlug;
    STATE.deletedIds = [];
    const client = window.AdminAuth.getClient();
    const canvasMount = document.getElementById("pb-canvas-frame");
    if (canvasMount) canvasMount.innerHTML = C().renderSkeleton(4);

    const { data, error } = await client
      .from("page_sections")
      .select("*")
      .eq("page_slug", pageSlug)
      .neq("status", "archived")
      .order("sort_order", { ascending: true });

    if (error) {
      notify(error.message || "Failed to load sections.", "error");
      STATE.sections = [];
    } else {
      STATE.sections = (data || []).map((r, i) => normalizeSectionRow(r, i));
    }

    const urlParams = new URLSearchParams(window.location.search);
    const requestedSection = urlParams.get("section");
    if (requestedSection && STATE.sections.some((s) => String(s.id) === String(requestedSection))) {
      STATE.selectedId = requestedSection;
    } else {
      STATE.selectedId = STATE.sections[0] ? STATE.sections[0].id : "";
    }

    markClean(STATE.sections.length ? `${STATE.sections.length} loaded` : "Empty Page");
    renderAll();
  }

  function openMediaPickerForInput(onPick) {
    const DB = window.AdminDatabase;
    C().showModal({
      title: "Select or Upload Media Asset",
      maxWidth: "880px",
      bodyHtml: `
        <div class="space-y-3">
          <div class="flex flex-wrap gap-2">
            <input id="pb-mp-search" type="search" class="admin-input text-xs flex-1 min-w-[160px]" placeholder="Search assets...">
            <select id="pb-mp-kind" class="admin-select text-xs w-36">
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="pdf">PDFs</option>
              <option value="document">Documents</option>
            </select>
          </div>
          <form id="pb-quick-upload" class="admin-panel p-3 flex flex-col sm:flex-row gap-2 items-center">
            <input id="pb-upload-file" type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.avif,.svg,.mp4,.webm,.pdf,.txt,.md" class="admin-input text-xs flex-1" required>
            <button type="submit" id="pb-upload-btn" class="btn-primary text-xs shrink-0">Upload &amp; Optimize</button>
          </form>
          <div id="pb-media-modal">${C().renderSkeleton(3)}</div>
        </div>
      `,
      onMount: ({ bodyEl, close }) => {
        const mount = bodyEl.querySelector("#pb-media-modal");
        const searchIn = bodyEl.querySelector("#pb-mp-search");
        const kindSel = bodyEl.querySelector("#pb-mp-kind");

        async function loadAssets() {
          mount.innerHTML = C().renderSkeleton(3);
          try {
            const { rows } = await DB.listMediaAssets({
              page: 1,
              pageSize: 36,
              search: searchIn.value,
              assetKind: kindSel.value,
              sortBy: "created_at",
              ascending: false
            });
            mount.innerHTML = `
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                ${
                  rows
                    .map(
                      (m) => `
                    <div class="admin-panel p-2.5 space-y-2">
                      ${
                        m.mime_type && m.mime_type.startsWith("image/")
                          ? `<img src="${C().escapeHtml(m.public_url)}" alt="${C().escapeHtml(m.alt_text || m.file_name)}" class="w-full h-24 object-cover rounded border border-[var(--admin-border)]">`
                          : `<div class="w-full h-24 rounded border border-[var(--admin-border)] flex flex-col items-center justify-center text-xs bg-[var(--admin-bg)]"><span class="font-mono-tech uppercase text-[10px] text-[var(--admin-primary)]">${C().escapeHtml(m.asset_kind || "file")}</span><span class="truncate max-w-full px-2 mt-1">${C().escapeHtml(m.file_name)}</span></div>`
                      }
                      <p class="text-xs truncate" title="${C().escapeHtml(m.file_name)}">${C().escapeHtml(m.file_name)}</p>
                      <button type="button" class="btn-secondary text-xs w-full" data-pb-pick="${C().escapeHtml(m.public_url)}">Insert</button>
                    </div>
                  `
                    )
                    .join("") || `<p class="col-span-full text-xs text-[var(--admin-muted)]">No matching assets found. Upload above or enter a relative assets/ path.</p>`
                }
              </div>
            `;
            mount.querySelectorAll("[data-pb-pick]").forEach((btn) => {
              btn.addEventListener("click", () => {
                const url = btn.getAttribute("data-pb-pick");
                close();
                onPick(url);
              });
            });
          } catch (err) {
            mount.innerHTML = C().renderErrorState({ message: err.message });
          }
        }

        searchIn.addEventListener("input", loadAssets);
        kindSel.addEventListener("change", loadAssets);
        bodyEl.querySelector("#pb-quick-upload").addEventListener("submit", async (e) => {
          e.preventDefault();
          const f = bodyEl.querySelector("#pb-upload-file").files[0];
          if (!f) return;
          const btn = bodyEl.querySelector("#pb-upload-btn");
          btn.disabled = true;
          try {
            const uploaded = await DB.uploadMedia(f, { altText: f.name, optimizeImage: true });
            notify("Asset uploaded to Supabase Storage.", "success");
            close();
            onPick(uploaded.public_url);
          } catch (err) {
            notify(err.message, "error");
            btn.disabled = false;
          }
        });

        loadAssets();
      }
    });
  }

  function reindexSortOrder() {
    STATE.sections.forEach((sec, idx) => {
      sec.sort_order = idx;
    });
  }

  function addSection(sectionType) {
    const newSec = R().createDefaultSection(sectionType, STATE.currentPageSlug, STATE.sections.length);
    newSec.isNew = true;
    STATE.sections.push(newSec);
    reindexSortOrder();
    STATE.selectedId = newSec.id;
    markDirty();
    renderAll();
    notify(`Added "${newSec.title}" section.`, "success");
  }

  function moveSection(id, delta) {
    const idx = STATE.sections.findIndex((s) => String(s.id) === String(id));
    const nextIdx = idx + delta;
    if (idx === -1 || nextIdx < 0 || nextIdx >= STATE.sections.length) return;
    const [moved] = STATE.sections.splice(idx, 1);
    STATE.sections.splice(nextIdx, 0, moved);
    reindexSortOrder();
    markDirty();
    renderAll();
  }

  function reorderByDrag(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const srcIdx = STATE.sections.findIndex((s) => String(s.id) === String(sourceId));
    const tgtIdx = STATE.sections.findIndex((s) => String(s.id) === String(targetId));
    if (srcIdx === -1 || tgtIdx === -1) return;
    const [moved] = STATE.sections.splice(srcIdx, 1);
    STATE.sections.splice(tgtIdx, 0, moved);
    reindexSortOrder();
    markDirty();
    renderAll();
  }

  function duplicateSection(id) {
    const src = STATE.sections.find((s) => String(s.id) === String(id));
    if (!src) return;
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    copy.isNew = true;
    copy.status = "draft";
    copy.title = `${copy.title} (Copy)`;
    copy.section_key = `${copy.section_type}-${STATE.sections.length + 1}`;
    const idx = STATE.sections.findIndex((s) => String(s.id) === String(id));
    STATE.sections.splice(idx + 1, 0, copy);
    reindexSortOrder();
    STATE.selectedId = copy.id;
    markDirty();
    renderAll();
    notify("Section duplicated.", "success");
  }

  async function deleteSection(id) {
    const sec = STATE.sections.find((s) => String(s.id) === String(id));
    if (!sec) return;
    const ok = await C().confirmDialog({
      title: "Delete Section",
      message: `Remove "${sec.title || sec.section_type}" from ${STATE.currentPageSlug}? Changes take effect cleanly when you save or publish.`,
      confirmLabel: "Remove Section",
      danger: true
    });
    if (!ok) return;
    if (!sec.isNew && !String(sec.id).startsWith("sec_")) {
      STATE.deletedIds.push(sec.id);
    }
    STATE.sections = STATE.sections.filter((s) => String(s.id) !== String(id));
    reindexSortOrder();
    if (String(STATE.selectedId) === String(id)) {
      STATE.selectedId = STATE.sections[0] ? STATE.sections[0].id : "";
    }
    markDirty();
    renderAll();
  }

  function renderPaletteAndOutline() {
    const paletteMount = document.getElementById("pb-palette-list");
    const outlineMount = document.getElementById("pb-outline-list");
    const searchVal = (document.getElementById("pb-palette-search")?.value || "").trim().toLowerCase();

    if (paletteMount) {
      const filtered = R().SECTION_TYPES.filter(
        (t) => !searchVal || t.label.toLowerCase().includes(searchVal) || t.category.toLowerCase().includes(searchVal)
      );
      paletteMount.innerHTML = filtered
        .map(
          (t) => `
          <button type="button" class="admin-panel p-2 text-left hover:border-[var(--admin-primary)] transition-colors flex items-center gap-2" data-add-type="${C().escapeHtml(t.type)}" title="${C().escapeHtml(t.description)}">
            <i data-lucide="${C().escapeHtml(t.icon)}" class="w-4 h-4 text-[var(--admin-primary)] shrink-0"></i>
            <span class="text-xs font-medium truncate">${C().escapeHtml(t.label)}</span>
          </button>
        `
        )
        .join("");

      paletteMount.querySelectorAll("[data-add-type]").forEach((btn) => {
        btn.addEventListener("click", () => addSection(btn.getAttribute("data-add-type")));
      });
    }

    if (outlineMount) {
      if (!STATE.sections.length) {
        outlineMount.innerHTML = `<p class="text-xs text-[var(--admin-muted)] p-3 text-center">No sections on this page yet. Add any component above to start designing.</p>`;
      } else {
        outlineMount.innerHTML = STATE.sections
          .map((sec, idx) => {
            const active = String(sec.id) === String(STATE.selectedId);
            return `
              <div
                draggable="true"
                data-outline-id="${C().escapeHtml(sec.id)}"
                class="admin-panel p-2.5 space-y-2 cursor-grab active:cursor-grabbing ${active ? "border-[var(--admin-primary)] ring-1 ring-indigo-500/40" : ""}"
              >
                <div class="flex items-center justify-between gap-2">
                  <button type="button" class="text-left min-w-0 flex-1" data-select-sec="${C().escapeHtml(sec.id)}">
                    <p class="text-xs font-semibold truncate">${idx + 1}. ${C().escapeHtml(sec.title || sec.section_type)}</p>
                    <p class="text-[11px] font-mono-tech text-[var(--admin-muted)]">${C().escapeHtml(sec.section_type)} · ${sec.enabled ? "Visible" : "Disabled"}</p>
                  </button>
                  ${C().statusBadge(sec.status)}
                </div>
                <div class="flex flex-wrap items-center gap-1 pt-1 border-t border-[var(--admin-border)]">
                  <button type="button" class="btn-ghost text-[11px] py-0.5 px-1.5 min-h-0" data-move-up="${C().escapeHtml(sec.id)}" ${idx === 0 ? "disabled" : ""} title="Move Up">&uarr;</button>
                  <button type="button" class="btn-ghost text-[11px] py-0.5 px-1.5 min-h-0" data-move-down="${C().escapeHtml(sec.id)}" ${idx === STATE.sections.length - 1 ? "disabled" : ""} title="Move Down">&darr;</button>
                  <button type="button" class="btn-ghost text-[11px] py-0.5 px-1.5 min-h-0" data-toggle-sec="${C().escapeHtml(sec.id)}">${sec.enabled ? "Disable" : "Enable"}</button>
                  <button type="button" class="btn-ghost text-[11px] py-0.5 px-1.5 min-h-0" data-dup-sec="${C().escapeHtml(sec.id)}">Duplicate</button>
                  <button type="button" class="btn-ghost text-[11px] py-0.5 px-1.5 min-h-0 text-rose-400 ml-auto" data-del-sec="${C().escapeHtml(sec.id)}">Delete</button>
                </div>
              </div>
            `;
          })
          .join("");

        outlineMount.querySelectorAll("[data-outline-id]").forEach((card) => {
          const id = card.getAttribute("data-outline-id");
          card.addEventListener("dragstart", () => { STATE.dragSourceId = id; card.classList.add("opacity-50"); });
          card.addEventListener("dragend", () => { card.classList.remove("opacity-50"); });
          card.addEventListener("dragover", (e) => { e.preventDefault(); });
          card.addEventListener("drop", (e) => {
            e.preventDefault();
            reorderByDrag(STATE.dragSourceId, id);
          });
        });

        outlineMount.querySelectorAll("[data-select-sec]").forEach((btn) => {
          btn.addEventListener("click", () => {
            STATE.selectedId = btn.getAttribute("data-select-sec");
            renderPreview();
            renderInspector();
            renderPaletteAndOutline();
          });
        });
        outlineMount.querySelectorAll("[data-move-up]").forEach((btn) => {
          btn.addEventListener("click", () => moveSection(btn.getAttribute("data-move-up"), -1));
        });
        outlineMount.querySelectorAll("[data-move-down]").forEach((btn) => {
          btn.addEventListener("click", () => moveSection(btn.getAttribute("data-move-down"), 1));
        });
        outlineMount.querySelectorAll("[data-toggle-sec]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const sec = STATE.sections.find((s) => String(s.id) === String(btn.getAttribute("data-toggle-sec")));
            if (!sec) return;
            sec.enabled = !sec.enabled;
            markDirty();
            renderAll();
          });
        });
        outlineMount.querySelectorAll("[data-dup-sec]").forEach((btn) => {
          btn.addEventListener("click", () => duplicateSection(btn.getAttribute("data-dup-sec")));
        });
        outlineMount.querySelectorAll("[data-del-sec]").forEach((btn) => {
          btn.addEventListener("click", () => deleteSection(btn.getAttribute("data-del-sec")));
        });
      }
    }
  }

  function renderPreview() {
    const frame = document.getElementById("pb-canvas-frame");
    if (!frame) return;

    const widthMap = {
      desktop: "100%",
      tablet: "768px",
      mobile: "375px"
    };
    frame.style.maxWidth = widthMap[STATE.viewport] || "100%";

    if (!STATE.sections.length) {
      frame.innerHTML = C().renderEmptyState({
        icon: "layout-template",
        title: `No Visual Sections on ${STATE.currentPageSlug}`,
        description: "Click any component in the Section Library (Hero, About, Projects, Statistics, Video, Custom Content...) to compose this page visually.",
        actionLabel: "+ Add Hero Section",
        actionId: "pb-empty-add-hero"
      });
      const btn = document.getElementById("pb-empty-add-hero");
      if (btn) btn.addEventListener("click", () => addSection("hero"));
      C().refreshIcons();
      return;
    }

    frame.innerHTML = R().renderPage(STATE.sections, {
      previewMode: STATE.viewport,
      interactive: true,
      selectedId: STATE.selectedId
    });

    frame.querySelectorAll("[data-pb-section-id]").forEach((node) => {
      node.addEventListener("click", (e) => {
        if (e.target.closest("a")) e.preventDefault();
        STATE.selectedId = node.getAttribute("data-pb-section-id");
        renderPreview();
        renderInspector();
        renderPaletteAndOutline();
      });
    });
    C().refreshIcons();
  }

  function renderInspector() {
    const mount = document.getElementById("pb-inspector-body");
    if (!mount) return;
    const sec = getSelectedSection();
    if (!sec) {
      mount.innerHTML = `<p class="text-xs text-[var(--admin-muted)] p-4 text-center">Select a section in the canvas or outline to edit content, layout, colors, spacing, animations, and responsive visibility.</p>`;
      return;
    }

    const tabsHtml = ["content", "style", "motion"]
      .map(
        (t) => `
        <button type="button" data-insp-tab="${t}" class="flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
          STATE.inspectorTab === t ? "bg-[var(--admin-primary)] text-white" : "text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
        }">${t === "content" ? "Content" : t === "style" ? "Style & Layout" : "Motion & Visibility"}</button>
      `
      )
      .join("");

    let bodyHtml = "";
    if (STATE.inspectorTab === "content") {
      const items = Array.isArray(sec.content.items) ? sec.content.items : [];
      const buttons = Array.isArray(sec.content.buttons) ? sec.content.buttons : [];
      const links = Array.isArray(sec.content.links) ? sec.content.links : [];

      bodyHtml = `
        <div class="space-y-3.5">
          <div>
            <label class="admin-label" for="insp-eyebrow">Eyebrow Label</label>
            <input id="insp-eyebrow" class="admin-input text-xs" value="${C().escapeHtml(sec.content.eyebrow || "")}">
          </div>
          <div>
            <label class="admin-label" for="insp-title">Section Heading</label>
            <input id="insp-title" class="admin-input text-xs" value="${C().escapeHtml(sec.title || "")}">
          </div>
          <div>
            <label class="admin-label" for="insp-subtitle">Subtitle</label>
            <textarea id="insp-subtitle" class="admin-textarea text-xs min-h-[68px]">${C().escapeHtml(sec.subtitle || "")}</textarea>
          </div>
          <div>
            <label class="admin-label" for="insp-body">Body Copy (plain text — safe escaped rendering)</label>
            <textarea id="insp-body" class="admin-textarea text-xs min-h-[80px]">${C().escapeHtml(sec.content.body || "")}</textarea>
          </div>

          ${
            ["skills", "services", "projects", "blog"].includes(sec.section_type)
              ? `<label class="flex items-center gap-2 text-xs cursor-pointer">
                  <input id="insp-use-portfolio-data" type="checkbox" class="w-4 h-4 accent-indigo-500" ${sec.content.usePortfolioData ? "checked" : ""}>
                  <span>Pull live items automatically from Portfolio Database</span>
                </label>`
              : ""
          }

          ${
            sec.section_type === "video"
              ? `<div>
                  <label class="admin-label" for="insp-video-url">Video URL (YouTube, Vimeo, or HTTPS MP4)</label>
                  <input id="insp-video-url" type="url" class="admin-input text-xs font-mono-tech" placeholder="https://www.youtube.com/watch?v=..." value="${C().escapeHtml(sec.content.videoUrl || "")}">
                </div>`
              : ""
          }

          <div>
            <label class="admin-label" for="insp-img-url">Section Image URL</label>
            <div class="flex gap-1.5">
              <input id="insp-img-url" class="admin-input text-xs font-mono-tech" value="${C().escapeHtml(sec.content.imageUrl || "")}" placeholder="assets/images/...">
              <button type="button" id="insp-pick-img" class="btn-secondary text-xs shrink-0">Media</button>
            </div>
          </div>
          <div>
            <label class="admin-label" for="insp-img-alt">Image Alt Text</label>
            <input id="insp-img-alt" class="admin-input text-xs" value="${C().escapeHtml(sec.content.imageAlt || "")}">
          </div>

          <!-- Items List Editor -->
          <div class="pt-3 border-t border-[var(--admin-border)] space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold">Section Items (${items.length})</span>
              <button type="button" id="insp-add-item" class="btn-secondary text-[11px] py-1 px-2 min-h-0">+ Add Item</button>
            </div>
            ${items
              .map(
                (it, idx) => `
                <div class="admin-panel p-2.5 space-y-2" data-item-idx="${idx}">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="font-semibold">Item #${idx + 1}</span>
                    <button type="button" class="text-rose-400 hover:underline" data-rm-item="${idx}">Remove</button>
                  </div>
                  ${
                    sec.section_type === "statistics"
                      ? `<div class="grid grid-cols-2 gap-1.5">
                          <input class="admin-input text-xs" data-item-field="value" placeholder="Value (e.g. 12+)" value="${C().escapeHtml(it.value || "")}">
                          <input class="admin-input text-xs" data-item-field="label" placeholder="Label" value="${C().escapeHtml(it.label || "")}">
                        </div>`
                      : `<input class="admin-input text-xs" data-item-field="title" placeholder="Title / Name / Question" value="${C().escapeHtml(it.title || "")}">`
                  }
                  <input class="admin-input text-xs" data-item-field="description" placeholder="Description / Answer / Caption" value="${C().escapeHtml(it.description || it.caption || "")}">
                  <div class="flex gap-1.5">
                    <input class="admin-input text-xs font-mono-tech" data-item-field="imageUrl" placeholder="Optional Image URL" value="${C().escapeHtml(it.imageUrl || "")}">
                    <button type="button" class="btn-secondary text-[11px] shrink-0" data-pick-item-img="${idx}">Img</button>
                  </div>
                  <input class="admin-input text-xs font-mono-tech" data-item-field="href" placeholder="Optional Link (e.g. projects.html)" value="${C().escapeHtml(it.href || "")}">
                </div>
              `
              )
              .join("")}
          </div>

          <!-- Buttons Editor -->
          <div class="pt-3 border-t border-[var(--admin-border)] space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold">Buttons (${buttons.length})</span>
              <button type="button" id="insp-add-btn" class="btn-secondary text-[11px] py-1 px-2 min-h-0">+ Add Button</button>
            </div>
            ${buttons
              .map(
                (b, idx) => `
                <div class="admin-panel p-2 space-y-1.5" data-btn-idx="${idx}">
                  <div class="flex justify-between text-[11px]">
                    <span>Button #${idx + 1}</span>
                    <button type="button" class="text-rose-400" data-rm-btn="${idx}">Remove</button>
                  </div>
                  <div class="grid grid-cols-2 gap-1.5">
                    <input class="admin-input text-xs" data-btn-field="label" placeholder="Label" value="${C().escapeHtml(b.label || "")}">
                    <select class="admin-select text-xs" data-btn-field="variant">
                      <option value="primary" ${b.variant === "primary" ? "selected" : ""}>Primary</option>
                      <option value="secondary" ${b.variant === "secondary" ? "selected" : ""}>Secondary</option>
                      <option value="outline" ${b.variant === "outline" ? "selected" : ""}>Outline</option>
                    </select>
                  </div>
                  <input class="admin-input text-xs font-mono-tech" data-btn-field="href" placeholder="Destination URL / page.html" value="${C().escapeHtml(b.href || "")}">
                </div>
              `
              )
              .join("")}
          </div>

          <!-- Links Editor -->
          <div class="pt-3 border-t border-[var(--admin-border)] space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold">Inline Links (${links.length})</span>
              <button type="button" id="insp-add-link" class="btn-secondary text-[11px] py-1 px-2 min-h-0">+ Add Link</button>
            </div>
            ${links
              .map(
                (l, idx) => `
                <div class="admin-panel p-2 space-y-1.5" data-link-idx="${idx}">
                  <div class="flex justify-between text-[11px]">
                    <span>Link #${idx + 1}</span>
                    <button type="button" class="text-rose-400" data-rm-link="${idx}">Remove</button>
                  </div>
                  <input class="admin-input text-xs" data-link-field="label" placeholder="Link Text" value="${C().escapeHtml(l.label || "")}">
                  <input class="admin-input text-xs font-mono-tech" data-link-field="href" placeholder="URL (e.g. contact.html)" value="${C().escapeHtml(l.href || "")}">
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `;
    } else if (STATE.inspectorTab === "style") {
      const st = sec.style_config;
      const ly = sec.layout_config;
      bodyHtml = `
        <div class="space-y-3.5">
          <div>
            <label class="admin-label" for="insp-bg-type">Background Style</label>
            <select id="insp-bg-type" class="admin-select text-xs">
              ${["transparent", "solid", "gradient", "image"].map((opt) => `<option value="${opt}" ${st.backgroundType === opt ? "selected" : ""}>${opt}</option>`).join("")}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="admin-label" for="insp-bg-color">Background Color</label>
              <input id="insp-bg-color" type="color" class="h-9 w-full rounded cursor-pointer" value="${C().escapeHtml(st.backgroundColor || "#0d1424")}">
            </div>
            <div>
              <label class="admin-label" for="insp-accent-color">Accent Color</label>
              <input id="insp-accent-color" type="color" class="h-9 w-full rounded cursor-pointer" value="${C().escapeHtml(st.accentColor || "#6366f1")}">
            </div>
          </div>
          <div>
            <label class="admin-label" for="insp-text-color">Text Color Override (Hex or blank for default)</label>
            <input id="insp-text-color" class="admin-input text-xs font-mono-tech" placeholder="#f1f5f9" value="${C().escapeHtml(st.textColor || "")}">
          </div>
          <div>
            <label class="admin-label" for="insp-bg-gradient">Linear Gradient CSS</label>
            <input id="insp-bg-gradient" class="admin-input text-xs font-mono-tech" value="${C().escapeHtml(st.backgroundGradient || "")}">
          </div>
          <div>
            <label class="admin-label" for="insp-bg-image">Background Image URL</label>
            <div class="flex gap-1.5">
              <input id="insp-bg-image" class="admin-input text-xs font-mono-tech" value="${C().escapeHtml(st.backgroundImage || "")}">
              <button type="button" id="insp-pick-bg-img" class="btn-secondary text-xs shrink-0">Media</button>
            </div>
          </div>

          <div class="pt-2 border-t border-[var(--admin-border)] grid grid-cols-2 gap-2">
            <div>
              <label class="admin-label" for="insp-font">Font Family</label>
              <select id="insp-font" class="admin-select text-xs">
                ${["Plus Jakarta Sans", "Outfit", "Manrope", "DM Sans"].map((f) => `<option value="${f}" ${st.bodyFont === f ? "selected" : ""}>${f}</option>`).join("")}
              </select>
            </div>
            <div>
              <label class="admin-label" for="insp-head-size">Heading Size</label>
              <select id="insp-head-size" class="admin-select text-xs">
                ${["md", "lg", "xl"].map((sz) => `<option value="${sz}" ${st.headingSize === sz ? "selected" : ""}>${sz.toUpperCase()}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="admin-label" for="insp-align">Alignment</label>
              <select id="insp-align" class="admin-select text-xs">
                ${["left", "center", "right"].map((a) => `<option value="${a}" ${st.alignment === a ? "selected" : ""}>${a}</option>`).join("")}
              </select>
            </div>
            <div>
              <label class="admin-label" for="insp-pady">Pad Y (px)</label>
              <input id="insp-pady" type="number" min="16" max="140" class="admin-input text-xs" value="${C().escapeHtml(st.paddingY || 64)}">
            </div>
            <div>
              <label class="admin-label" for="insp-maxw">Max W (px)</label>
              <input id="insp-maxw" type="number" min="640" max="1600" class="admin-input text-xs" value="${C().escapeHtml(st.maxWidth || 1200)}">
            </div>
          </div>

          <div class="pt-2 border-t border-[var(--admin-border)] space-y-2">
            <p class="text-xs font-bold">Layout Structure</p>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="admin-label" for="insp-layout-var">Variant</label>
                <select id="insp-layout-var" class="admin-select text-xs">
                  ${["grid", "list", "split", "centered"].map((v) => `<option value="${v}" ${ly.variant === v ? "selected" : ""}>${v}</option>`).join("")}
                </select>
              </div>
              <div>
                <label class="admin-label" for="insp-media-pos">Media Side</label>
                <select id="insp-media-pos" class="admin-select text-xs">
                  ${["right", "left"].map((m) => `<option value="${m}" ${ly.mediaPosition === m ? "selected" : ""}>${m}</option>`).join("")}
                </select>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="admin-label" for="insp-cols-d">Desktop Cols</label>
                <input id="insp-cols-d" type="number" min="1" max="4" class="admin-input text-xs" value="${C().escapeHtml(ly.columnsDesktop || 3)}">
              </div>
              <div>
                <label class="admin-label" for="insp-cols-t">Tablet Cols</label>
                <input id="insp-cols-t" type="number" min="1" max="3" class="admin-input text-xs" value="${C().escapeHtml(ly.columnsTablet || 2)}">
              </div>
              <div>
                <label class="admin-label" for="insp-cols-m">Mobile Cols</label>
                <input id="insp-cols-m" type="number" min="1" max="2" class="admin-input text-xs" value="${C().escapeHtml(ly.columnsMobile || 1)}">
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      const an = sec.animation_config;
      const vs = sec.visibility_config;
      bodyHtml = `
        <div class="space-y-3.5">
          <div>
            <label class="admin-label" for="insp-sec-key">Section Anchor Key</label>
            <input id="insp-sec-key" class="admin-input text-xs font-mono-tech" value="${C().escapeHtml(sec.section_key || "")}">
          </div>
          <label class="flex items-center gap-2 text-xs cursor-pointer admin-panel p-3">
            <input id="insp-enabled" type="checkbox" class="w-4 h-4 accent-indigo-500" ${sec.enabled !== false ? "checked" : ""}>
            <span class="font-semibold">Section Enabled on Public Site</span>
          </label>

          <div class="pt-2 border-t border-[var(--admin-border)] space-y-2">
            <p class="text-xs font-bold">Responsive Device Visibility</p>
            <label class="flex items-center gap-2 text-xs cursor-pointer">
              <input id="insp-vis-desktop" type="checkbox" class="w-4 h-4 accent-indigo-500" ${vs.desktop !== false ? "checked" : ""}>
              <span>Show on Desktop (&ge;1024px)</span>
            </label>
            <label class="flex items-center gap-2 text-xs cursor-pointer">
              <input id="insp-vis-tablet" type="checkbox" class="w-4 h-4 accent-indigo-500" ${vs.tablet !== false ? "checked" : ""}>
              <span>Show on Tablet (640px–1023px)</span>
            </label>
            <label class="flex items-center gap-2 text-xs cursor-pointer">
              <input id="insp-vis-mobile" type="checkbox" class="w-4 h-4 accent-indigo-500" ${vs.mobile !== false ? "checked" : ""}>
              <span>Show on Mobile (&lt;640px)</span>
            </label>
          </div>

          <div class="pt-2 border-t border-[var(--admin-border)] space-y-2.5">
            <p class="text-xs font-bold">Entrance Animation</p>
            <div>
              <label class="admin-label" for="insp-anim-preset">Animation Preset</label>
              <select id="insp-anim-preset" class="admin-select text-xs">
                ${["none", "fade-up", "fade-in", "slide-left", "slide-right", "zoom-in"].map((p) => `<option value="${p}" ${an.preset === p ? "selected" : ""}>${p}</option>`).join("")}
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="admin-label" for="insp-anim-dur">Duration (ms)</label>
                <input id="insp-anim-dur" type="number" min="100" max="1500" class="admin-input text-xs" value="${C().escapeHtml(an.durationMs || 320)}">
              </div>
              <div>
                <label class="admin-label" for="insp-anim-delay">Delay (ms)</label>
                <input id="insp-anim-delay" type="number" min="0" max="1000" class="admin-input text-xs" value="${C().escapeHtml(an.delayMs || 0)}">
              </div>
            </div>
          </div>
        </div>
      `;
    }

    mount.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center gap-1 p-1 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)]">
          ${tabsHtml}
        </div>
        ${bodyHtml}
      </div>
    `;

    mount.querySelectorAll("[data-insp-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        STATE.inspectorTab = btn.getAttribute("data-insp-tab");
        renderInspector();
      });
    });

    const syncLive = () => {
      markDirty();
      renderPreview();
      renderPaletteAndOutline();
    };

    if (STATE.inspectorTab === "content") {
      const bindVal = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", () => { fn(el.value); syncLive(); });
      };
      bindVal("insp-eyebrow", (v) => { sec.content.eyebrow = v; });
      bindVal("insp-title", (v) => { sec.title = v; });
      bindVal("insp-subtitle", (v) => { sec.subtitle = v; });
      bindVal("insp-body", (v) => { sec.content.body = v; });
      bindVal("insp-video-url", (v) => { sec.content.videoUrl = v; });
      bindVal("insp-img-url", (v) => { sec.content.imageUrl = v; });
      bindVal("insp-img-alt", (v) => { sec.content.imageAlt = v; });

      const useDataCb = document.getElementById("insp-use-portfolio-data");
      if (useDataCb) {
        useDataCb.addEventListener("change", () => {
          sec.content.usePortfolioData = useDataCb.checked;
          syncLive();
        });
      }

      const pickImg = document.getElementById("insp-pick-img");
      if (pickImg) {
        pickImg.addEventListener("click", () => {
          openMediaPickerForInput((url) => {
            sec.content.imageUrl = url;
            syncLive();
            renderInspector();
          });
        });
      }

      document.getElementById("insp-add-item")?.addEventListener("click", () => {
        sec.content.items = Array.isArray(sec.content.items) ? sec.content.items : [];
        sec.content.items.push(
          sec.section_type === "statistics"
            ? { value: "100%", label: "New Metric", note: "" }
            : { title: "New Item", description: "Describe this entry.", imageUrl: "", href: "" }
        );
        markDirty();
        renderAll();
      });

      mount.querySelectorAll("[data-item-idx]").forEach((box) => {
        const idx = Number(box.getAttribute("data-item-idx"));
        box.querySelectorAll("[data-item-field]").forEach((inp) => {
          inp.addEventListener("input", () => {
            const field = inp.getAttribute("data-item-field");
            sec.content.items[idx][field] = inp.value;
            if (field === "description" && sec.section_type === "image_gallery") {
              sec.content.items[idx].caption = inp.value;
            }
            syncLive();
          });
        });
      });

      mount.querySelectorAll("[data-rm-item]").forEach((btn) => {
        btn.addEventListener("click", () => {
          sec.content.items.splice(Number(btn.getAttribute("data-rm-item")), 1);
          markDirty();
          renderAll();
        });
      });

      mount.querySelectorAll("[data-pick-item-img]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.getAttribute("data-pick-item-img"));
          openMediaPickerForInput((url) => {
            sec.content.items[idx].imageUrl = url;
            markDirty();
            renderAll();
          });
        });
      });

      document.getElementById("insp-add-btn")?.addEventListener("click", () => {
        sec.content.buttons = Array.isArray(sec.content.buttons) ? sec.content.buttons : [];
        sec.content.buttons.push({ label: "Action Button", href: "contact.html", variant: "primary" });
        markDirty();
        renderAll();
      });

      mount.querySelectorAll("[data-btn-idx]").forEach((box) => {
        const idx = Number(box.getAttribute("data-btn-idx"));
        box.querySelectorAll("[data-btn-field]").forEach((inp) => {
          inp.addEventListener("input", () => {
            sec.content.buttons[idx][inp.getAttribute("data-btn-field")] = inp.value;
            syncLive();
          });
          inp.addEventListener("change", () => {
            sec.content.buttons[idx][inp.getAttribute("data-btn-field")] = inp.value;
            syncLive();
          });
        });
      });

      mount.querySelectorAll("[data-rm-btn]").forEach((btn) => {
        btn.addEventListener("click", () => {
          sec.content.buttons.splice(Number(btn.getAttribute("data-rm-btn")), 1);
          markDirty();
          renderAll();
        });
      });

      document.getElementById("insp-add-link")?.addEventListener("click", () => {
        sec.content.links = Array.isArray(sec.content.links) ? sec.content.links : [];
        sec.content.links.push({ label: "Explore More", href: "projects.html" });
        markDirty();
        renderAll();
      });

      mount.querySelectorAll("[data-link-idx]").forEach((box) => {
        const idx = Number(box.getAttribute("data-link-idx"));
        box.querySelectorAll("[data-link-field]").forEach((inp) => {
          inp.addEventListener("input", () => {
            sec.content.links[idx][inp.getAttribute("data-link-field")] = inp.value;
            syncLive();
          });
        });
      });

      mount.querySelectorAll("[data-rm-link]").forEach((btn) => {
        btn.addEventListener("click", () => {
          sec.content.links.splice(Number(btn.getAttribute("data-rm-link")), 1);
          markDirty();
          renderAll();
        });
      });
    } else if (STATE.inspectorTab === "style") {
      const bindSt = (id, fn, ev = "input") => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(ev, () => { fn(el.value); syncLive(); });
      };
      bindSt("insp-bg-type", (v) => { sec.style_config.backgroundType = v; }, "change");
      bindSt("insp-bg-color", (v) => { sec.style_config.backgroundColor = v; });
      bindSt("insp-accent-color", (v) => { sec.style_config.accentColor = v; });
      bindSt("insp-text-color", (v) => { sec.style_config.textColor = v; });
      bindSt("insp-bg-gradient", (v) => { sec.style_config.backgroundGradient = v; });
      bindSt("insp-bg-image", (v) => { sec.style_config.backgroundImage = v; });
      bindSt("insp-font", (v) => { sec.style_config.bodyFont = v; sec.style_config.headingFont = v; }, "change");
      bindSt("insp-head-size", (v) => { sec.style_config.headingSize = v; }, "change");
      bindSt("insp-align", (v) => { sec.style_config.alignment = v; }, "change");
      bindSt("insp-pady", (v) => { sec.style_config.paddingY = Number(v) || 64; });
      bindSt("insp-maxw", (v) => { sec.style_config.maxWidth = Number(v) || 1200; });
      bindSt("insp-layout-var", (v) => { sec.layout_config.variant = v; }, "change");
      bindSt("insp-media-pos", (v) => { sec.layout_config.mediaPosition = v; }, "change");
      bindSt("insp-cols-d", (v) => { sec.layout_config.columnsDesktop = Number(v) || 3; });
      bindSt("insp-cols-t", (v) => { sec.layout_config.columnsTablet = Number(v) || 2; });
      bindSt("insp-cols-m", (v) => { sec.layout_config.columnsMobile = Number(v) || 1; });

      document.getElementById("insp-pick-bg-img")?.addEventListener("click", () => {
        openMediaPickerForInput((url) => {
          sec.style_config.backgroundImage = url;
          sec.style_config.backgroundType = "image";
          markDirty();
          renderAll();
        });
      });
    } else {
      const bindM = (id, fn, ev = "change") => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(ev, () => { fn(el); syncLive(); });
      };
      bindM("insp-sec-key", (el) => { sec.section_key = el.value.trim(); }, "input");
      bindM("insp-enabled", (el) => { sec.enabled = el.checked; });
      bindM("insp-vis-desktop", (el) => { sec.visibility_config.desktop = el.checked; });
      bindM("insp-vis-tablet", (el) => { sec.visibility_config.tablet = el.checked; });
      bindM("insp-vis-mobile", (el) => { sec.visibility_config.mobile = el.checked; });
      bindM("insp-anim-preset", (el) => { sec.animation_config.preset = el.value; });
      bindM("insp-anim-dur", (el) => { sec.animation_config.durationMs = Number(el.value) || 320; }, "input");
      bindM("insp-anim-delay", (el) => { sec.animation_config.delayMs = Number(el.value) || 0; }, "input");
    }
  }

  function renderAll() {
    renderPaletteAndOutline();
    renderPreview();
    renderInspector();
    C().refreshIcons();
  }

  async function savePageSections(targetStatus, { changeSummary = "", publishAt = null } = {}) {
    const client = window.AdminAuth.getClient();
    const DB = window.AdminDatabase;
    reindexSortOrder();

    if (targetStatus === "scheduled" && !publishAt) {
      throw new Error("Scheduled publishing requires a valid future date and time.");
    }

    const summaryText =
      String(changeSummary || "").trim() ||
      (targetStatus === "published"
        ? `Published ${STATE.currentPageSlug} (${STATE.sections.length} sections)`
        : targetStatus === "scheduled"
        ? `Scheduled ${STATE.currentPageSlug} for ${publishAt}`
        : `Saved draft for ${STATE.currentPageSlug}`);

    if (STATE.deletedIds.length > 0) {
      await client.from("page_sections").delete().in("id", STATE.deletedIds);
      STATE.deletedIds = [];
    }

    for (let i = 0; i < STATE.sections.length; i += 1) {
      const sec = STATE.sections[i];
      const payload = {
        page_slug: STATE.currentPageSlug,
        section_key: sec.section_key || `${sec.section_type}-${i + 1}`,
        section_type: sec.section_type,
        title: sec.title || "",
        subtitle: sec.subtitle || "",
        enabled: sec.enabled !== false,
        sort_order: i,
        status: targetStatus,
        publish_at: targetStatus === "scheduled" ? publishAt : null,
        last_change_summary: summaryText,
        content: sec.content || {},
        style_config: sec.style_config || {},
        layout_config: sec.layout_config || {},
        animation_config: sec.animation_config || {},
        visibility_config: sec.visibility_config || { desktop: true, tablet: true, mobile: true }
      };

      if (sec.isNew || String(sec.id).startsWith("sec_")) {
        const { data, error } = await client.from("page_sections").insert([payload]).select().single();
        if (error) throw new Error(error.message);
        STATE.sections[i] = normalizeSectionRow(data, i);
        if (String(STATE.selectedId) === String(sec.id)) STATE.selectedId = data.id;
      } else {
        const { data, error } = await client.from("page_sections").update(payload).eq("id", sec.id).select().single();
        if (error) throw new Error(error.message);
        STATE.sections[i] = normalizeSectionRow(data, i);
      }
    }

    const { data: latestVer } = await client
      .from("page_builder_versions")
      .select("version_number")
      .eq("page_slug", STATE.currentPageSlug)
      .order("version_number", { ascending: false })
      .limit(1);

    const nextVer = latestVer && latestVer[0] ? Number(latestVer[0].version_number) + 1 : 1;
    await client.from("page_builder_versions").insert([{
      page_slug: STATE.currentPageSlug,
      version_number: nextVer,
      version_label: `${targetStatus === "published" ? "Published" : targetStatus === "scheduled" ? "Scheduled" : "Draft"} v${nextVer}${summaryText ? ` — ${summaryText}` : ""}`,
      status: targetStatus,
      snapshot_sections: STATE.sections.map((s) => ({
        section_key: s.section_key,
        section_type: s.section_type,
        title: s.title,
        subtitle: s.subtitle,
        enabled: s.enabled,
        sort_order: s.sort_order,
        content: s.content,
        style_config: s.style_config,
        layout_config: s.layout_config,
        animation_config: s.animation_config,
        visibility_config: s.visibility_config
      })),
      created_by: STATE.adminProfile ? STATE.adminProfile.user_id : null,
      created_by_email: STATE.adminProfile ? STATE.adminProfile.email || "" : ""
    }]);

    if (window.PortfolioCache) {
      window.PortfolioCache.invalidate("table_page_sections");
    }

    await DB.logAudit({
      action: targetStatus === "published" ? "publish_page" : targetStatus === "scheduled" ? "schedule_page" : "save_page_draft",
      module: "page_builder",
      recordId: STATE.currentPageSlug,
      summary: `${summaryText} (v${nextVer})`,
      details: { version_number: nextVer, section_count: STATE.sections.length, publish_at: publishAt || null }
    });

    markClean(
      targetStatus === "published"
        ? `Published v${nextVer}`
        : targetStatus === "scheduled"
        ? `Scheduled v${nextVer}`
        : `Draft v${nextVer} saved`
    );
    renderAll();
  }

  function openVersionHistoryModal() {
    const client = window.AdminAuth.getClient();
    C().showModal({
      title: `Version History — ${STATE.currentPageSlug}`,
      maxWidth: "740px",
      bodyHtml: `<div id="pb-versions-mount">${C().renderSkeleton(4)}</div>`,
      onMount: async ({ bodyEl, close }) => {
        const mount = bodyEl.querySelector("#pb-versions-mount");
        try {
          const { data, error } = await client
            .from("page_builder_versions")
            .select("*")
            .eq("page_slug", STATE.currentPageSlug)
            .order("created_at", { ascending: false })
            .limit(30);
          if (error) throw new Error(error.message);
          if (!data || !data.length) {
            mount.innerHTML = C().renderEmptyState({
              icon: "history",
              title: "No saved versions yet",
              description: "Click Save Draft, Schedule, or Publish to record immutable version snapshots."
            });
            C().refreshIcons();
            return;
          }
          mount.innerHTML = `
            <div class="space-y-2.5">
              ${data
                .map(
                  (v) => `
                  <div class="admin-panel p-3 flex flex-wrap items-center justify-between gap-2">
                    <div class="min-w-0">
                      <p class="text-sm font-bold">${C().escapeHtml(v.version_label || `Version ${v.version_number}`)} ${C().statusBadge(v.status)}</p>
                      <p class="text-xs text-[var(--admin-muted)]">${Array.isArray(v.snapshot_sections) ? v.snapshot_sections.length : 0} sections · Admin ID: ${C().escapeHtml(v.created_by || "admin")} (${C().escapeHtml(v.created_by_email || "admin")}) · ${new Date(v.created_at).toLocaleString()}</p>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <button type="button" class="btn-secondary text-xs" data-restore-ver="${C().escapeHtml(v.id)}" data-restore-mode="draft">Restore as Draft</button>
                      <button type="button" class="btn-primary text-xs" data-restore-ver="${C().escapeHtml(v.id)}" data-restore-mode="publish">Restore &amp; Publish</button>
                    </div>
                  </div>
                `
                )
                .join("")}
            </div>
          `;
          mount.querySelectorAll("[data-restore-ver]").forEach((btn) => {
            btn.addEventListener("click", async () => {
              const ver = data.find((x) => String(x.id) === String(btn.getAttribute("data-restore-ver")));
              const mode = btn.getAttribute("data-restore-mode") || "draft";
              if (!ver) return;
              close();

              const currentlyPublished = STATE.sections.some((s) => s.status === "published");
              let summary = `Restored snapshot v${ver.version_number}`;

              if (mode === "publish") {
                const conf = await C().confirmPublishDialog({
                  moduleTitle: "Visual Page Builder",
                  recordLabel: `${STATE.currentPageSlug} (Restore v${ver.version_number})`,
                  targetStatus: "published",
                  currentlyPublished,
                  defaultSummary: summary
                });
                if (!conf.confirmed) return;
                if (conf.changeSummary) summary = conf.changeSummary;
              } else {
                const confirmed = await C().confirmDialog({
                  title: "Restore Previous Version as Draft",
                  message: `Load v${ver.version_number} into the builder canvas as Draft? Previously published live sections remain preserved until you explicitly publish.`,
                  confirmLabel: "Load into Draft Canvas"
                });
                if (!confirmed) return;
              }

              STATE.sections.forEach((cur) => {
                if (!cur.isNew && !String(cur.id).startsWith("sec_")) {
                  STATE.deletedIds.push(cur.id);
                }
              });
              STATE.sections = (ver.snapshot_sections || []).map((s, idx) =>
                normalizeSectionRow({ ...s, page_slug: STATE.currentPageSlug, isNew: true, status: "draft" }, idx)
              );
              STATE.selectedId = STATE.sections[0] ? STATE.sections[0].id : "";

              if (mode === "publish") {
                try {
                  await savePageSections("published", { changeSummary: summary });
                  notify(`Restored and published v${ver.version_number} on ${STATE.currentPageSlug}.`, "success");
                } catch (err) {
                  notify(err.message, "error");
                }
                return;
              }

              markDirty();
              renderAll();
              notify(`Loaded v${ver.version_number} into canvas. Click Save Draft or Publish to persist.`, "info");
            });
          });
        } catch (err) {
          mount.innerHTML = C().renderErrorState({ message: err.message });
        }
      }
    });
  }

  function openSchedulePageModal() {
    const currentlyPublished = STATE.sections.some((s) => s.status === "published");
    const defaultDt = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
    C().showModal({
      title: `Schedule Publishing — ${STATE.currentPageSlug}`,
      maxWidth: "520px",
      bodyHtml: `
        <form id="pb-schedule-form" class="space-y-3.5">
          <div class="admin-panel p-3 text-xs border-indigo-500/35 bg-indigo-500/10 space-y-1">
            <p class="font-semibold text-indigo-300">Server-Side Scheduled Release</p>
            <p class="text-[var(--admin-muted)]">Scheduled publishing runs automatically via Supabase Cron without depending on visitors opening the website.</p>
          </div>
          ${
            currentlyPublished
              ? `<div class="admin-panel p-3 text-xs border-amber-500/40 bg-amber-500/10 text-amber-200">
                  Existing published versions are preserved safely in Version History before transitioning at the scheduled time.
                </div>`
              : ""
          }
          <div>
            <label class="admin-label" for="pb-sched-dt">Publish Date &amp; Time</label>
            <input id="pb-sched-dt" type="datetime-local" class="admin-input text-xs" value="${C().escapeHtml(defaultDt)}" required>
          </div>
          <div>
            <label class="admin-label" for="pb-sched-summary">Change Summary</label>
            <input id="pb-sched-summary" type="text" class="admin-input text-xs" value="Scheduled page layout release for ${C().escapeHtml(STATE.currentPageSlug)}" required>
          </div>
        </form>
      `,
      footerHtml: `
        <div class="flex justify-end gap-2">
          <button type="button" id="pb-sched-cancel" class="btn-secondary">Cancel</button>
          <button type="submit" form="pb-schedule-form" class="btn-primary">Confirm Schedule</button>
        </div>
      `,
      onMount: ({ bodyEl, footerEl, close }) => {
        footerEl.querySelector("#pb-sched-cancel").addEventListener("click", close);
        bodyEl.querySelector("#pb-schedule-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const dtRaw = bodyEl.querySelector("#pb-sched-dt").value;
          const summary = bodyEl.querySelector("#pb-sched-summary").value.trim();
          if (!dtRaw) return;
          const iso = new Date(dtRaw).toISOString();
          close();
          try {
            await savePageSections("scheduled", { publishAt: iso, changeSummary: summary });
            notify(`Scheduled "${STATE.currentPageSlug}" for ${new Date(iso).toLocaleString()}.`, "success");
          } catch (err) {
            notify(err.message, "error");
          }
        });
      }
    });
  }

  async function init() {
    initTheme();
    const state = await window.AdminPermissions.requireAuthorizedAdmin({ loginUrl: "login.html" });
    if (!state) return;
    STATE.adminProfile = state.adminProfile;

    await loadPageOptionsFromDb();

    const params = new URLSearchParams(window.location.search);
    const paramPage = params.get("page");
    if (paramPage) {
      if (!STATE.pages.some((p) => p.slug === paramPage)) {
        STATE.pages.push({ slug: paramPage, label: paramPage });
      }
      STATE.currentPageSlug = paramPage;
    }

    const pageSelect = document.getElementById("pb-page-select");
    if (pageSelect) {
      pageSelect.innerHTML = STATE.pages
        .map((p) => `<option value="${C().escapeHtml(p.slug)}" ${p.slug === STATE.currentPageSlug ? "selected" : ""}>${C().escapeHtml(p.label)}</option>`)
        .join("");
      pageSelect.addEventListener("change", () => loadSectionsForPage(pageSelect.value));
    }

    document.getElementById("pb-palette-search")?.addEventListener("input", renderPaletteAndOutline);

    document.querySelectorAll("[data-pb-viewport]").forEach((btn) => {
      btn.addEventListener("click", () => {
        STATE.viewport = btn.getAttribute("data-pb-viewport");
        document.querySelectorAll("[data-pb-viewport]").forEach((b) => {
          b.classList.toggle("bg-[var(--admin-primary)]", b === btn);
          b.classList.toggle("text-white", b === btn);
        });
        renderPreview();
      });
    });

    document.getElementById("pb-save-draft")?.addEventListener("click", async () => {
      const btn = document.getElementById("pb-save-draft");
      btn.disabled = true;
      try {
        await savePageSections("draft", { changeSummary: `Saved draft of ${STATE.currentPageSlug}` });
        notify("Draft saved cleanly.", "success");
      } catch (err) {
        notify(err.message, "error");
      } finally {
        btn.disabled = false;
      }
    });

    document.getElementById("pb-schedule-btn")?.addEventListener("click", openSchedulePageModal);

    document.getElementById("pb-publish-btn")?.addEventListener("click", async () => {
      const btn = document.getElementById("pb-publish-btn");
      const currentlyPublished = STATE.sections.some((s) => s.status === "published");
      const conf = await C().confirmPublishDialog({
        moduleTitle: "Visual Page Builder",
        recordLabel: `${STATE.currentPageSlug} (${STATE.sections.length} sections)`,
        targetStatus: "published",
        currentlyPublished,
        defaultSummary: `Published updated layout for ${STATE.currentPageSlug}`
      });
      if (!conf.confirmed) return;

      btn.disabled = true;
      try {
        await savePageSections("published", { changeSummary: conf.changeSummary });
        notify(`Published "${STATE.currentPageSlug}" live.`, "success");
      } catch (err) {
        notify(err.message, "error");
      } finally {
        btn.disabled = false;
      }
    });

    document.getElementById("pb-versions-btn")?.addEventListener("click", openVersionHistoryModal);

    await loadSectionsForPage(STATE.currentPageSlug);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
