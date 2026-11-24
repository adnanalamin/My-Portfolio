/**
 * AL AMIN Admin CMS — Supabase Database, Media Storage, Audit Log & Backup Service (Phases 61–65)
 * All mutations enforce authenticated Supabase client + RLS + audit trail logging.
 */
(() => {
  const ALLOWED_MEDIA_MIMES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/svg+xml",
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "application/pdf",
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ]);

  const EXT_TO_ALLOWED_MIMES = {
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    png: ["image/png"],
    webp: ["image/webp"],
    gif: ["image/gif"],
    avif: ["image/avif"],
    svg: ["image/svg+xml"],
    mp4: ["video/mp4"],
    webm: ["video/webm"],
    ogv: ["video/ogg"],
    ogg: ["video/ogg"],
    mov: ["video/quicktime"],
    pdf: ["application/pdf"],
    txt: ["text/plain"],
    md: ["text/markdown", "text/plain"],
    markdown: ["text/markdown", "text/plain"],
    csv: ["text/csv", "text/plain", "application/vnd.ms-excel"],
    doc: ["application/msword"],
    docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
  };

  const BLOCKED_EXTENSIONS = new Set([
    "exe", "sh", "bash", "bat", "cmd", "ps1", "js", "mjs", "cjs",
    "php", "py", "rb", "pl", "dll", "so", "msi", "html", "htm",
    "apk", "app", "vbs", "scr", "com", "jar", "wasm", "svgz"
  ]);

  const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB (bucket & DB enforced)

  function getClientOrThrow() {
    const client = window.AdminAuth && window.AdminAuth.getClient();
    if (!client) throw new Error("Supabase client is not initialized.");
    return client;
  }

  async function logAudit({ action, module, recordId = "", summary = "", details = {} }) {
    try {
      const client = window.AdminAuth && window.AdminAuth.getClient();
      if (!client) return;
      const { data: userRes } = await client.auth.getUser();
      const user = userRes && userRes.user;
      await client.from("admin_audit_logs").insert([{
        admin_user_id: user ? user.id : null,
        admin_email: user ? user.email || "" : "",
        action: String(action || "update"),
        module: String(module || "system"),
        record_id: String(recordId || ""),
        summary: String(summary || ""),
        details
      }]);
    } catch (_err) {
      // Audit failures must not crash the UI, but stay clean
    }
  }

  async function listRecords(
    table,
    {
      page = 1,
      pageSize = 15,
      search = "",
      searchColumns = [],
      status = "all",
      category = "all",
      categoryColumn = "category",
      sortBy = "created_at",
      ascending = false
    } = {}
  ) {
    const client = getClientOrThrow();
    const cleanPage = Math.max(1, Number(page) || 1);
    const cleanSize = Math.max(1, Math.min(100, Number(pageSize) || 15));
    const from = (cleanPage - 1) * cleanSize;
    const to = from + cleanSize - 1;

    let query = client.from(table).select("*", { count: "exact" });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (category && category !== "all" && categoryColumn) {
      query = query.eq(categoryColumn, category);
    }

    const q = String(search || "").trim();
    if (q && Array.isArray(searchColumns) && searchColumns.length > 0) {
      const safeTerm = q.replace(/[,%()]/g, " ").trim();
      if (safeTerm) {
        const orExpr = searchColumns.map((col) => `${col}.ilike.%${safeTerm}%`).join(",");
        query = query.or(orExpr);
      }
    }

    if (sortBy) {
      query = query.order(sortBy, { ascending: Boolean(ascending) });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message || `Failed to query ${table}`);
    return {
      rows: Array.isArray(data) ? data : [],
      totalCount: typeof count === "number" ? count : (Array.isArray(data) ? data.length : 0)
    };
  }

  async function getSingleton(table, defaultId = null) {
    const client = getClientOrThrow();
    let query = client.from(table).select("*");
    if (defaultId !== null) {
      query = query.eq("id", defaultId);
    }
    const { data, error } = await query.limit(1);
    if (error) throw new Error(error.message || `Failed to fetch ${table}`);
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  }

  const VERSIONED_TABLES = new Set([
    "profile", "projects", "skills", "services", "experiences", "certificates",
    "blog_posts", "testimonials", "faqs", "social_links", "site_pages",
    "navigation_items", "office_areas", "workspace_objects", "tour_steps",
    "career_knowledge", "requirement_rules", "resume_matcher_rules",
    "project_recommendations", "project_dependencies", "github_settings",
    "coding_activity_settings", "terminal_commands", "technologies",
    "learning_items", "coding_challenges", "system_endpoints", "achievements",
    "website_settings", "page_sections"
  ]);

  function withChangeSummary(table, payload, changeSummary) {
    if (!VERSIONED_TABLES.has(table)) return payload;
    const next = { ...payload };
    if (typeof changeSummary === "string" && changeSummary.trim()) {
      next.last_change_summary = changeSummary.trim();
    }
    return next;
  }

  async function createRecord(table, payload, summaryPrefix = "Created", options = {}) {
    const client = getClientOrThrow();
    const cleanPayload = withChangeSummary(table, payload, options.changeSummary);
    const { data, error } = await client.from(table).insert([cleanPayload]).select().single();
    if (error) throw new Error(error.message || `Create failed on ${table}`);
    if (!VERSIONED_TABLES.has(table)) {
      await logAudit({
        action: "create",
        module: table,
        recordId: data && data.id ? String(data.id) : "",
        summary: options.changeSummary || `${summaryPrefix} record in ${table}`,
        details: { slug: data && data.slug ? data.slug : undefined, title: data && (data.title || data.name || data.label) }
      });
    }
    return data;
  }

  async function updateRecord(table, id, payload, summaryPrefix = "Updated", options = {}) {
    const client = getClientOrThrow();
    const cleanPayload = withChangeSummary(table, payload, options.changeSummary);
    const { data, error } = await client.from(table).update(cleanPayload).eq("id", id).select().single();
    if (error) throw new Error(error.message || `Update failed on ${table}`);
    if (!VERSIONED_TABLES.has(table)) {
      await logAudit({
        action: "update",
        module: table,
        recordId: String(id),
        summary: options.changeSummary || `${summaryPrefix} record in ${table}`,
        details: { title: data && (data.title || data.name || data.label) }
      });
    }
    return data;
  }

  async function upsertSingleton(table, id, payload, options = {}) {
    if (id) {
      return updateRecord(table, id, payload, "Updated settings", options);
    }
    return createRecord(table, payload, "Created settings", options);
  }

  async function deleteRecord(table, id, recordLabel = "") {
    const client = getClientOrThrow();
    const { error } = await client.from(table).delete().eq("id", id);
    if (error) throw new Error(error.message || `Delete failed on ${table}`);
    if (!VERSIONED_TABLES.has(table)) {
      await logAudit({
        action: "delete",
        module: table,
        recordId: String(id),
        summary: `Deleted ${recordLabel || "record"} from ${table}`
      });
    }
    return true;
  }

  async function bulkUpdateStatus(table, ids, nextStatus, options = {}) {
    if (!Array.isArray(ids) || ids.length === 0) return 0;
    const client = getClientOrThrow();
    const patch = { status: nextStatus };
    if (nextStatus === "archived") {
      if (table === "projects" || table === "blog_posts") {
        patch.archived_at = new Date().toISOString();
      }
    }
    if (nextStatus === "scheduled" && options.publishAt) {
      patch.publish_at = options.publishAt;
    }
    const cleanPatch = withChangeSummary(table, patch, options.changeSummary);
    const { error } = await client.from(table).update(cleanPatch).in("id", ids);
    if (error) throw new Error(error.message || `Bulk status update failed on ${table}`);
    if (!VERSIONED_TABLES.has(table)) {
      await logAudit({
        action: "bulk_status",
        module: table,
        summary: options.changeSummary || `Updated ${ids.length} records to "${nextStatus}"`,
        details: { count: ids.length, status: nextStatus }
      });
    }
    return ids.length;
  }

  async function bulkDelete(table, ids) {
    if (!Array.isArray(ids) || ids.length === 0) return 0;
    const client = getClientOrThrow();
    const { error } = await client.from(table).delete().in("id", ids);
    if (error) throw new Error(error.message || `Bulk delete failed on ${table}`);
    if (!VERSIONED_TABLES.has(table)) {
      await logAudit({
        action: "bulk_delete",
        module: table,
        summary: `Deleted ${ids.length} records from ${table}`,
        details: { count: ids.length }
      });
    }
    return ids.length;
  }

  async function duplicateRecord(table, row, titleField = "title", slugField = "slug") {
    const clone = { ...row };
    delete clone.id;
    delete clone.created_at;
    delete clone.updated_at;
    delete clone.archived_at;
    delete clone.published_at;
    delete clone.last_change_summary;
    if (titleField && clone[titleField]) {
      clone[titleField] = `${clone[titleField]} (Copy)`;
    }
    if (slugField && clone[slugField]) {
      clone[slugField] = `${clone[slugField]}-copy-${Date.now().toString(36).slice(-4)}`;
    }
    if ("status" in clone) clone.status = "draft";
    return createRecord(table, clone, "Duplicated", { changeSummary: "Duplicated record as draft" });
  }

  async function countTable(client, table, filters = []) {
    let q = client.from(table).select("*", { count: "exact", head: true });
    filters.forEach(([col, val]) => {
      q = q.eq(col, val);
    });
    const { count, error } = await q;
    if (error) return null;
    return typeof count === "number" ? count : 0;
  }

  async function getDashboardStats() {
    const client = getClientOrThrow();
    const [
      totalProjects,
      publishedProjects,
      draftProjects,
      totalPosts,
      publishedPosts,
      totalSkills,
      totalServices,
      totalCertificates,
      totalTestimonials,
      unreadContacts,
      recentProjectsRes,
      recentPostsRes,
      recentAuditsRes
    ] = await Promise.all([
      countTable(client, "projects"),
      countTable(client, "projects", [["status", "published"]]),
      countTable(client, "projects", [["status", "draft"]]),
      countTable(client, "blog_posts"),
      countTable(client, "blog_posts", [["status", "published"]]),
      countTable(client, "skills"),
      countTable(client, "services"),
      countTable(client, "certificates"),
      countTable(client, "testimonials"),
      countTable(client, "contact_submissions", [["status", "unread"]]),
      client.from("projects").select("id, title, slug, status, updated_at").order("updated_at", { ascending: false }).limit(5),
      client.from("blog_posts").select("id, title, slug, status, updated_at").order("updated_at", { ascending: false }).limit(5),
      client.from("admin_audit_logs").select("id, admin_email, action, module, summary, created_at").order("created_at", { ascending: false }).limit(10)
    ]);

    return {
      counts: {
        totalProjects,
        publishedProjects,
        draftProjects,
        totalPosts,
        publishedPosts,
        totalSkills,
        totalServices,
        totalCertificates,
        totalTestimonials,
        unreadContacts
      },
      recentProjects: recentProjectsRes.data || [],
      recentPosts: recentPostsRes.data || [],
      recentAudits: recentAuditsRes.data || []
    };
  }

  function inferAssetKindFromMime(mime, fallback = "document") {
    const clean = String(mime || "").toLowerCase();
    if (clean.startsWith("image/")) return "image";
    if (clean.startsWith("video/")) return "video";
    if (clean === "application/pdf") return "pdf";
    if (clean.startsWith("text/") || clean.includes("word")) return "document";
    return fallback;
  }

  function validateMediaFile(file) {
    if (!file) throw new Error("No file selected.");
    const name = String(file.name || "").trim();
    if (!name || !name.includes(".")) {
      throw new Error("Uploaded file must include a valid file extension.");
    }
    const parts = name.toLowerCase().split(".");
    const ext = parts.pop();
    if (!ext || BLOCKED_EXTENSIONS.has(ext)) {
      throw new Error(`Blocked file extension ".${ext || "unknown"}". Executable and script files are strictly prohibited.`);
    }
    // Block deceptive double-extensions such as payload.exe.png or shell.php.jpg
    const highRiskInner = new Set([
      "exe", "sh", "bash", "bat", "cmd", "ps1", "php", "py", "rb", "pl",
      "dll", "so", "msi", "vbs", "scr", "com", "jar", "wasm", "html", "htm"
    ]);
    const suspiciousInner = parts.slice(1).find((segment) => highRiskInner.has(segment));
    if (suspiciousInner) {
      throw new Error(`Blocked deceptive filename containing ".${suspiciousInner}" inside "${name}".`);
    }

    const expectedMimes = EXT_TO_ALLOWED_MIMES[ext];
    if (!expectedMimes) {
      throw new Error(`Unsupported file extension ".${ext}". Allowed: Images, Videos (MP4/WebM/OGG/MOV), PDFs, and Documents (TXT/MD/CSV/DOC/DOCX).`);
    }

    let effectiveMime = String(file.type || "").toLowerCase();
    if (!effectiveMime && (ext === "md" || ext === "markdown")) effectiveMime = "text/markdown";
    if (!effectiveMime && ext === "txt") effectiveMime = "text/plain";
    if (!effectiveMime && ext === "csv") effectiveMime = "text/csv";

    if (!ALLOWED_MEDIA_MIMES.has(effectiveMime) || !expectedMimes.includes(effectiveMime)) {
      throw new Error(`MIME type "${effectiveMime || "unknown"}" does not match allowed types for ".${ext}" (${expectedMimes.join(", ")}).`);
    }
    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      throw new Error("File size must be between 1 byte and 50 MB.");
    }
    return {
      extension: ext,
      effectiveMime,
      inferredKind: inferAssetKindFromMime(effectiveMime)
    };
  }

  async function validateSvgSafety(file) {
    if (!file || String(file.type || "").toLowerCase() !== "image/svg+xml") return;
    if (typeof file.text !== "function") return;
    const svgText = await file.text();
    if (/<script\b|<foreignObject\b|<iframe\b|<object\b|<embed\b|\son\w+\s*=|javascript:/i.test(svgText)) {
      throw new Error(`Blocked unsafe SVG "${file.name}": executable scripts or event handlers are not allowed inside SVG files.`);
    }
  }

  async function extractImageDimensions(file) {
    if (typeof Image === "undefined" || typeof URL === "undefined" || !URL.createObjectURL) {
      return { width: null, height: null };
    }
    return new Promise((resolve) => {
      const objUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || null;
        const height = img.naturalHeight || null;
        URL.revokeObjectURL(objUrl);
        resolve({ width, height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve({ width: null, height: null });
      };
      img.src = objUrl;
    });
  }

  async function extractVideoMetadata(file) {
    if (typeof document === "undefined" || typeof URL === "undefined" || !URL.createObjectURL) {
      return { width: null, height: null, durationSeconds: null };
    }
    return new Promise((resolve) => {
      const objUrl = URL.createObjectURL(file);
      const vid = document.createElement("video");
      vid.preload = "metadata";
      vid.onloadedmetadata = () => {
        const width = vid.videoWidth || null;
        const height = vid.videoHeight || null;
        const durationSeconds = Number.isFinite(vid.duration) ? Number(vid.duration.toFixed(2)) : null;
        URL.revokeObjectURL(objUrl);
        resolve({ width, height, durationSeconds });
      };
      vid.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve({ width: null, height: null, durationSeconds: null });
      };
      vid.src = objUrl;
    });
  }

  async function optimizeImageFile(file, { enabled = true, maxDimension = 1920, quality = 0.82, targetFormat = "auto" } = {}) {
    const mime = String(file.type || "").toLowerCase();
    const dims = await extractImageDimensions(file);
    const baseInfo = {
      optimized: false,
      originalBytes: file.size,
      finalBytes: file.size,
      savedPercent: 0,
      originalMime: mime,
      finalMime: mime
    };

    const optimizableMimes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!enabled || !optimizableMimes.has(mime) || typeof document === "undefined") {
      return { file, width: dims.width, height: dims.height, optimizationInfo: baseInfo };
    }

    const imgUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = imgUrl;
      });
      const srcW = img.naturalWidth || dims.width || 0;
      const srcH = img.naturalHeight || dims.height || 0;
      if (!srcW || !srcH) {
        return { file, width: dims.width, height: dims.height, optimizationInfo: baseInfo };
      }

      const maxDim = Number(maxDimension) > 0 ? Number(maxDimension) : 0;
      let outW = srcW;
      let outH = srcH;
      if (maxDim > 0 && Math.max(srcW, srcH) > maxDim) {
        const ratio = maxDim / Math.max(srcW, srcH);
        outW = Math.max(1, Math.round(srcW * ratio));
        outH = Math.max(1, Math.round(srcH * ratio));
      }

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return { file, width: srcW, height: srcH, optimizationInfo: baseInfo };
      }
      ctx.drawImage(img, 0, 0, outW, outH);

      let outMime = mime;
      if (targetFormat === "webp" || targetFormat === "auto") {
        outMime = "image/webp";
      } else if (targetFormat === "jpeg") {
        outMime = "image/jpeg";
      }
      const cleanQuality = Math.min(0.98, Math.max(0.4, Number(quality) || 0.82));

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, outMime, cleanQuality));
      if (!blob || blob.size <= 0) {
        return { file, width: srcW, height: srcH, optimizationInfo: baseInfo };
      }

      // Only swap to optimized output if it actually reduced bytes OR resized dimensions down
      const resized = outW < srcW || outH < srcH;
      if (!resized && blob.size >= file.size) {
        return { file, width: srcW, height: srcH, optimizationInfo: baseInfo };
      }

      const extMap = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
      const nextExt = extMap[blob.type] || extMap[outMime] || "webp";
      const stem = String(file.name || "image").replace(/\.[^.]+$/, "");
      const optimizedFile = new File([blob], `${stem}.${nextExt}`, { type: blob.type || outMime });
      const savedPct = Math.max(0, Math.round(((file.size - optimizedFile.size) / file.size) * 100));

      return {
        file: optimizedFile,
        width: outW,
        height: outH,
        optimizationInfo: {
          optimized: true,
          originalBytes: file.size,
          finalBytes: optimizedFile.size,
          savedPercent: savedPct,
          originalMime: mime,
          finalMime: optimizedFile.type,
          resized
        }
      };
    } catch (_err) {
      return { file, width: dims.width, height: dims.height, optimizationInfo: baseInfo };
    } finally {
      URL.revokeObjectURL(imgUrl);
    }
  }

  function normalizeTagsInput(tags) {
    if (Array.isArray(tags)) {
      return Array.from(new Set(tags.map((t) => String(t || "").trim()).filter(Boolean)));
    }
    return Array.from(
      new Set(
        String(tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );
  }

  async function listMediaFolders() {
    const client = getClientOrThrow();
    const { data, error } = await client
      .from("media_folders")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message || "Failed to load media folders.");
    return Array.isArray(data) ? data : [];
  }

  async function createMediaFolder({ name, parentId = null, description = "" }) {
    const cleanName = String(name || "").trim();
    if (!cleanName) throw new Error("Folder name is required.");
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "folder";
    const client = getClientOrThrow();
    const { data: userRes } = await client.auth.getUser();
    const { data, error } = await client
      .from("media_folders")
      .insert([{
        name: cleanName,
        slug,
        parent_id: parentId || null,
        description: String(description || "").trim(),
        created_by: userRes && userRes.user ? userRes.user.id : null
      }])
      .select()
      .single();
    if (error) throw new Error(error.message || "Failed to create folder.");
    await logAudit({
      action: "create_folder",
      module: "media_folders",
      recordId: data && data.id ? String(data.id) : "",
      summary: `Created media folder "${cleanName}"`
    });
    return data;
  }

  async function renameMediaFolder(folderId, { name, description }) {
    const cleanName = String(name || "").trim();
    if (!cleanName) throw new Error("Folder name is required.");
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "folder";
    const patch = { name: cleanName, slug };
    if (description !== undefined) patch.description = String(description || "").trim();
    const client = getClientOrThrow();
    const { data, error } = await client
      .from("media_folders")
      .update(patch)
      .eq("id", folderId)
      .select()
      .single();
    if (error) throw new Error(error.message || "Failed to rename folder.");
    await logAudit({
      action: "rename_folder",
      module: "media_folders",
      recordId: String(folderId),
      summary: `Renamed media folder to "${cleanName}"`
    });
    return data;
  }

  async function deleteMediaFolder(folderId, folderName = "") {
    const client = getClientOrThrow();
    // Move assets out of the folder safely so Storage binaries & URLs are preserved
    const { error: detachErr } = await client
      .from("media_assets")
      .update({ folder_id: null })
      .eq("folder_id", folderId);
    if (detachErr) throw new Error(detachErr.message || "Failed to detach assets from folder.");

    const { error } = await client.from("media_folders").delete().eq("id", folderId);
    if (error) throw new Error(error.message || "Failed to delete folder.");
    await logAudit({
      action: "delete_folder",
      module: "media_folders",
      recordId: String(folderId),
      summary: `Deleted media folder "${folderName || folderId}" (contained assets preserved as unfiled)`
    });
    return true;
  }

  async function listMediaAssets({
    page = 1,
    pageSize = 24,
    search = "",
    assetKind = "all",
    folderId = "all",
    tag = "all",
    sortBy = "created_at",
    ascending = false
  } = {}) {
    const client = getClientOrThrow();
    const cleanPage = Math.max(1, Number(page) || 1);
    const cleanSize = Math.max(1, Math.min(100, Number(pageSize) || 24));
    const from = (cleanPage - 1) * cleanSize;
    const to = from + cleanSize - 1;

    let query = client.from("media_assets").select("*", { count: "exact" });

    if (assetKind && assetKind !== "all") {
      query = query.eq("asset_kind", assetKind);
    }
    if (folderId === "unfiled") {
      query = query.is("folder_id", null);
    } else if (folderId && folderId !== "all") {
      query = query.eq("folder_id", folderId);
    }
    if (tag && tag !== "all") {
      query = query.contains("tags", [tag]);
    }

    const q = String(search || "").trim();
    if (q) {
      const safeTerm = q.replace(/[,%()]/g, " ").trim();
      if (safeTerm) {
        query = query.or(
          `file_name.ilike.%${safeTerm}%,alt_text.ilike.%${safeTerm}%,caption.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%`
        );
      }
    }

    const allowedSort = new Set(["created_at", "updated_at", "file_name", "file_size_bytes"]);
    const cleanSort = allowedSort.has(sortBy) ? sortBy : "created_at";
    query = query.order(cleanSort, { ascending: Boolean(ascending) }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message || "Failed to load media assets.");
    return {
      rows: Array.isArray(data) ? data : [],
      totalCount: typeof count === "number" ? count : (Array.isArray(data) ? data.length : 0)
    };
  }

  async function uploadMedia(
    file,
    {
      altText = "",
      caption = "",
      description = "",
      tags = [],
      assetKind = "auto",
      folderId = null,
      optimizeImage = true,
      optimizeOptions = {}
    } = {}
  ) {
    const metaCheck = validateMediaFile(file);
    await validateSvgSafety(file);

    const client = getClientOrThrow();
    const cfg = window.AdminAuth.getRuntimeConfig();
    const bucket = cfg.storageBucket || "portfolio-media";

    let finalFile = file;
    let effectiveMime = metaCheck.effectiveMime;
    let width = null;
    let height = null;
    let durationSeconds = null;
    let optimizationInfo = {};

    if (metaCheck.effectiveMime.startsWith("image/")) {
      const optRes = await optimizeImageFile(file, {
        enabled: optimizeImage,
        ...optimizeOptions
      });
      finalFile = optRes.file;
      effectiveMime = String(finalFile.type || metaCheck.effectiveMime).toLowerCase();
      width = optRes.width;
      height = optRes.height;
      optimizationInfo = optRes.optimizationInfo || {};
    } else if (metaCheck.effectiveMime.startsWith("video/")) {
      const vidMeta = await extractVideoMetadata(file);
      width = vidMeta.width;
      height = vidMeta.height;
      durationSeconds = vidMeta.durationSeconds;
    }

    const resolvedKind =
      assetKind && assetKind !== "auto"
        ? assetKind
        : inferAssetKindFromMime(effectiveMime, metaCheck.inferredKind);

    const safeFileName = String(finalFile.name || "asset")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const folderPrefix = folderId ? `folder-${String(folderId).slice(0, 8)}` : resolvedKind;
    const storagePath = `${folderPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${safeFileName}`;

    const { error: uploadErr } = await client.storage.from(bucket).upload(storagePath, finalFile, {
      contentType: effectiveMime,
      upsert: false
    });
    if (uploadErr) throw new Error(uploadErr.message || "Storage upload failed.");

    const { data: pubData } = client.storage.from(bucket).getPublicUrl(storagePath);
    const publicUrl = pubData && pubData.publicUrl ? pubData.publicUrl : "";

    const { data: userRes } = await client.auth.getUser();
    const cleanTags = normalizeTagsInput(tags);
    const insertPayload = {
      file_name: finalFile.name,
      storage_path: storagePath,
      public_url: publicUrl,
      mime_type: effectiveMime,
      file_size_bytes: finalFile.size,
      alt_text: String(altText || "").trim(),
      caption: String(caption || "").trim(),
      description: String(description || "").trim(),
      tags: cleanTags,
      asset_kind: resolvedKind,
      folder_id: folderId || null,
      width,
      height,
      duration_seconds: durationSeconds,
      optimization_info: optimizationInfo,
      uploaded_by: userRes && userRes.user ? userRes.user.id : null
    };

    const { data: row, error: dbErr } = await client
      .from("media_assets")
      .insert([insertPayload])
      .select()
      .single();

    if (dbErr) {
      await client.storage.from(bucket).remove([storagePath]).catch(() => {});
      throw new Error(dbErr.message || "Media metadata save failed.");
    }
    await logAudit({
      action: "upload_media",
      module: "media_assets",
      recordId: row && row.id ? String(row.id) : "",
      summary: `Uploaded media "${finalFile.name}" (${resolvedKind})`
    });
    return row;
  }

  async function updateMediaMetadata(assetId, updates = {}) {
    const client = getClientOrThrow();
    const patch = {};
    if (updates.fileName !== undefined) patch.file_name = String(updates.fileName || "").trim();
    if (updates.folderId !== undefined) patch.folder_id = updates.folderId || null;
    if (updates.assetKind !== undefined) patch.asset_kind = updates.assetKind;
    if (updates.altText !== undefined) patch.alt_text = String(updates.altText || "").trim();
    if (updates.caption !== undefined) patch.caption = String(updates.caption || "").trim();
    if (updates.description !== undefined) patch.description = String(updates.description || "").trim();
    if (updates.tags !== undefined) patch.tags = normalizeTagsInput(updates.tags);

    const { data, error } = await client
      .from("media_assets")
      .update(patch)
      .eq("id", assetId)
      .select()
      .single();
    if (error) throw new Error(error.message || "Failed to update media metadata.");

    await logAudit({
      action: "update_media_metadata",
      module: "media_assets",
      recordId: String(assetId),
      summary: `Updated metadata for "${data.file_name}"`
    });
    return data;
  }

  async function bulkMoveMediaFolder(assetIds, folderId = null) {
    if (!Array.isArray(assetIds) || !assetIds.length) return 0;
    const client = getClientOrThrow();
    const { error } = await client
      .from("media_assets")
      .update({ folder_id: folderId || null })
      .in("id", assetIds);
    if (error) throw new Error(error.message || "Failed to move selected assets.");
    await logAudit({
      action: "move_media_folder",
      module: "media_assets",
      summary: `Moved ${assetIds.length} asset(s) to ${folderId ? `folder ${folderId}` : "Unfiled"}`,
      details: { count: assetIds.length, folder_id: folderId || null }
    });
    return assetIds.length;
  }

  async function replaceMediaFile(asset, newFile, { optimizeImage = false, optimizeOptions = {} } = {}) {
    if (!asset || !asset.id) throw new Error("Existing media asset record is required.");
    const metaCheck = validateMediaFile(newFile);
    await validateSvgSafety(newFile);

    const client = getClientOrThrow();
    const cfg = window.AdminAuth.getRuntimeConfig();
    const bucket = cfg.storageBucket || "portfolio-media";

    let finalFile = newFile;
    let effectiveMime = metaCheck.effectiveMime;
    let width = null;
    let height = null;
    let durationSeconds = null;
    let optimizationInfo = {};

    if (effectiveMime.startsWith("image/")) {
      const optRes = await optimizeImageFile(newFile, { enabled: optimizeImage, ...optimizeOptions });
      finalFile = optRes.file;
      effectiveMime = String(finalFile.type || effectiveMime).toLowerCase();
      width = optRes.width;
      height = optRes.height;
      optimizationInfo = optRes.optimizationInfo || {};
    } else if (effectiveMime.startsWith("video/")) {
      const vidMeta = await extractVideoMetadata(newFile);
      width = vidMeta.width;
      height = vidMeta.height;
      durationSeconds = vidMeta.durationSeconds;
    }

    const oldExt = String(asset.storage_path || "").split(".").pop().toLowerCase();
    const nextExt = String(finalFile.name || "").split(".").pop().toLowerCase();
    const canOverwriteInPlace = Boolean(asset.storage_path) && oldExt === nextExt;

    let nextPath = asset.storage_path;
    if (canOverwriteInPlace) {
      const { error: upErr } = await client.storage.from(bucket).upload(nextPath, finalFile, {
        contentType: effectiveMime,
        upsert: true
      });
      if (upErr) throw new Error(upErr.message || "Failed to replace storage object.");
    } else {
      const safeName = String(finalFile.name || "asset")
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      nextPath = `${asset.asset_kind || "asset"}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${safeName}`;
      const { error: upErr } = await client.storage.from(bucket).upload(nextPath, finalFile, {
        contentType: effectiveMime,
        upsert: false
      });
      if (upErr) throw new Error(upErr.message || "Failed to upload replacement asset.");
      if (asset.storage_path && asset.storage_path !== nextPath) {
        await client.storage.from(bucket).remove([asset.storage_path]).catch(() => {});
      }
    }

    const { data: pubData } = client.storage.from(bucket).getPublicUrl(nextPath);
    const nextPublicUrl = pubData && pubData.publicUrl ? pubData.publicUrl : asset.public_url;

    const { data: updated, error: dbErr } = await client
      .from("media_assets")
      .update({
        file_name: finalFile.name,
        storage_path: nextPath,
        public_url: nextPublicUrl,
        mime_type: effectiveMime,
        file_size_bytes: finalFile.size,
        width,
        height,
        duration_seconds: durationSeconds,
        optimization_info: optimizationInfo
      })
      .eq("id", asset.id)
      .select()
      .single();

    if (dbErr) throw new Error(dbErr.message || "Failed to update replaced asset metadata.");

    await logAudit({
      action: "replace_media",
      module: "media_assets",
      recordId: String(asset.id),
      summary: `Replaced file "${asset.file_name}" with "${finalFile.name}"`,
      details: { previous_path: asset.storage_path, new_path: nextPath }
    });
    return updated;
  }

  async function checkMediaReferences(asset) {
    const client = getClientOrThrow();
    const needleList = [asset.public_url, asset.storage_path].filter(Boolean);
    if (needleList.length === 0) return [];

    // Try fast server-side RPC from Migration 006 first
    try {
      const { data: rpcRows, error: rpcErr } = await client.rpc("check_media_usage", {
        p_public_url: asset.public_url || "",
        p_storage_path: asset.storage_path || ""
      });
      if (!rpcErr && Array.isArray(rpcRows)) {
        return rpcRows.map((r) => ({
          table: r.module_table,
          label: r.module_label,
          recordId: r.record_id,
          title: r.record_title,
          status: r.record_status || "published",
          isPublished: Boolean(r.is_published)
        }));
      }
    } catch (_ignored) {
      // Fall back to direct queries when migration 006 RPC is not yet installed
    }

    const checks = [
      { table: "profile", label: "Personal Profile", cols: ["name", "status", "profile_image", "resume_url"] },
      { table: "projects", label: "Projects", cols: ["title", "status", "thumbnail", "images"] },
      { table: "blog_posts", label: "Blog Posts", cols: ["title", "status", "cover_image", "content"] },
      { table: "certificates", label: "Certificates", cols: ["title", "status", "certificate_image"] },
      { table: "testimonials", label: "Testimonials", cols: ["client_name", "status", "client_image"] },
      { table: "website_settings", label: "Website Settings", cols: ["website_name", "status", "website_logo", "favicon"] },
      { table: "achievements", label: "Achievements", cols: ["title", "status", "badge_image"] },
      { table: "page_sections", label: "Visual Page Sections", cols: ["title", "status", "config"] }
    ];

    const references = [];
    await Promise.all(
      checks.map(async (chk) => {
        const { data } = await client.from(chk.table).select(`id, ${chk.cols.join(", ")}`).limit(150);
        if (!Array.isArray(data)) return;
        data.forEach((row) => {
          const serialized = JSON.stringify(row).toLowerCase();
          if (needleList.some((n) => serialized.includes(String(n).toLowerCase()))) {
            const st = String(row.status || "published").toLowerCase();
            references.push({
              table: chk.table,
              label: chk.label,
              recordId: String(row.id),
              title: row.title || row.name || row.client_name || row.website_name || String(row.id),
              status: st,
              isPublished: st === "published"
            });
          }
        });
      })
    );
    return references;
  }

  async function deleteMediaAsset(asset) {
    const client = getClientOrThrow();
    const cfg = window.AdminAuth.getRuntimeConfig();
    const bucket = cfg.storageBucket || "portfolio-media";

    if (asset.storage_path) {
      const { error: remErr } = await client.storage.from(bucket).remove([asset.storage_path]);
      if (remErr) throw new Error(remErr.message || "Failed to remove object from Supabase Storage.");
    }
    const { error } = await client.from("media_assets").delete().eq("id", asset.id);
    if (error) throw new Error(error.message || "Failed to delete media metadata.");

    await logAudit({
      action: "delete_media",
      module: "media_assets",
      recordId: String(asset.id),
      summary: `Deleted media "${asset.file_name}"`
    });
    return true;
  }

  async function bulkDeleteMediaAssets(assets = []) {
    const list = Array.isArray(assets) ? assets.filter(Boolean) : [];
    if (!list.length) return 0;
    const client = getClientOrThrow();
    const cfg = window.AdminAuth.getRuntimeConfig();
    const bucket = cfg.storageBucket || "portfolio-media";

    const paths = list.map((a) => a.storage_path).filter(Boolean);
    if (paths.length) {
      const { error: remErr } = await client.storage.from(bucket).remove(paths);
      if (remErr) throw new Error(remErr.message || "Failed to delete storage objects.");
    }

    const ids = list.map((a) => a.id).filter(Boolean);
    if (ids.length) {
      const { error: dbErr } = await client.from("media_assets").delete().in("id", ids);
      if (dbErr) throw new Error(dbErr.message || "Failed to delete media records.");
    }

    await logAudit({
      action: "bulk_delete_media",
      module: "media_assets",
      summary: `Bulk deleted ${list.length} media asset(s)`,
      details: { count: list.length, files: list.map((a) => a.file_name) }
    });
    return list.length;
  }

  function escapeCsvCell(value) {
    let text = String(value ?? "");
    // Prevent CSV formula injection when opened in spreadsheets
    if (/^[=+\-@\t\r]/.test(text)) {
      text = `'${text}`;
    }
    return `"${text.replace(/"/g, '""')}"`;
  }

  function buildContactsCsv(rows) {
    const headers = ["ID", "Name", "Email", "Subject", "Message", "Status", "Source Page", "Created At"];
    const lines = [headers.map(escapeCsvCell).join(",")];
    (rows || []).forEach((r) => {
      lines.push(
        [r.id, r.name, r.email, r.subject, r.message, r.status, r.source_page, r.created_at]
          .map(escapeCsvCell)
          .join(",")
      );
    });
    return lines.join("\r\n");
  }

  const BACKUP_TABLES = [
    "website_settings",
    "profile",
    "projects",
    "skills",
    "services",
    "experiences",
    "certificates",
    "blog_posts",
    "testimonials",
    "faqs",
    "social_links",
    "site_pages",
    "navigation_items",
    "office_areas",
    "workspace_objects",
    "tour_steps",
    "career_knowledge",
    "requirement_rules",
    "resume_matcher_rules",
    "project_recommendations",
    "project_dependencies",
    "github_settings",
    "coding_activity_settings",
    "terminal_commands",
    "technologies",
    "learning_items",
    "coding_challenges",
    "achievements",
    "system_endpoints",
    "page_sections",
    "page_builder_versions"
  ];

  const BACKUP_EXPORT_PRESETS = {
    full: {
      label: "Full Content Export (All CMS Tables)",
      tables: BACKUP_TABLES
    },
    projects: {
      label: "Projects Export",
      tables: ["projects", "project_recommendations", "project_dependencies"]
    },
    blog: {
      label: "Blog Export",
      tables: ["blog_posts"]
    },
    skills: {
      label: "Skills Export",
      tables: ["skills"]
    },
    services: {
      label: "Services Export",
      tables: ["services"]
    },
    certificates: {
      label: "Certificates Export",
      tables: ["certificates"]
    },
    settings: {
      label: "Settings Export",
      tables: [
        "website_settings",
        "profile",
        "site_pages",
        "navigation_items",
        "github_settings",
        "coding_activity_settings"
      ]
    }
  };

  function sanitizeJsonObjectKeys(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
    const clean = {};
    Object.keys(obj).forEach((key) => {
      if (key === "__proto__" || key === "constructor" || key === "prototype") return;
      clean[key] = obj[key];
    });
    return clean;
  }

  async function exportBackupJson({ tables = null, scopeLabel = "Full Content Export" } = {}) {
    const client = getClientOrThrow();
    const targetTables =
      Array.isArray(tables) && tables.length > 0
        ? tables.filter((t) => BACKUP_TABLES.includes(t))
        : BACKUP_TABLES;

    if (targetTables.length === 0) {
      throw new Error("Select at least one valid CMS content module to export.");
    }

    const tablesData = {};
    let totalRows = 0;

    for (const tbl of targetTables) {
      const { data, error } = await client.from(tbl).select("*");
      if (error) {
        throw new Error(`Export failed while reading "${tbl}": ${error.message}`);
      }
      const rows = Array.isArray(data) ? data : [];
      tablesData[tbl] = rows;
      totalRows += rows.length;
    }

    await logAudit({
      action: "export_backup",
      module: "backup_restore",
      summary: `${scopeLabel}: exported ${totalRows} rows across ${targetTables.length} table(s)`,
      details: {
        scope: scopeLabel,
        tables: targetTables,
        totalRows
      }
    });

    return {
      format: "alamin-portfolio-cms-backup-v1",
      scopeLabel,
      exportedAt: new Date().toISOString(),
      notice: "Content-only JSON export. This is NOT a complete PostgreSQL database backup—it excludes SQL DDL schemas, RLS policies, auth accounts, and Supabase Storage binary files.",
      tables: tablesData
    };
  }

  function validateBackupPayload(parsed) {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Backup file is not a valid JSON object.");
    }
    if (parsed.format !== "alamin-portfolio-cms-backup-v1" || !parsed.tables || typeof parsed.tables !== "object" || Array.isArray(parsed.tables)) {
      throw new Error("Unrecognized backup schema. Expected format: alamin-portfolio-cms-backup-v1 with a valid tables object.");
    }

    const validTables = {};
    const unknownTables = [];
    const warnings = [];
    let totalRows = 0;

    Object.entries(parsed.tables).forEach(([tbl, rows]) => {
      if (!BACKUP_TABLES.includes(tbl)) {
        unknownTables.push(tbl);
        return;
      }
      if (!Array.isArray(rows)) {
        warnings.push(`Ignored "${tbl}": expected an array of rows.`);
        return;
      }
      const cleanRows = [];
      rows.forEach((row, idx) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) {
          warnings.push(`Skipped invalid row #${idx + 1} in "${tbl}".`);
          return;
        }
        const safeRow = sanitizeJsonObjectKeys(row);
        if (safeRow.id === undefined || safeRow.id === null || safeRow.id === "") {
          warnings.push(`Row #${idx + 1} in "${tbl}" has no primary "id" field and was skipped.`);
          return;
        }
        cleanRows.push(safeRow);
      });
      validTables[tbl] = cleanRows;
      totalRows += cleanRows.length;
    });

    if (Object.keys(validTables).length === 0) {
      throw new Error("Backup JSON contains zero recognized CMS content tables.");
    }

    return {
      format: parsed.format,
      scopeLabel: String(parsed.scopeLabel || "CMS Content JSON Export"),
      exportedAt: parsed.exportedAt || "",
      validTables,
      unknownTables,
      warnings,
      totalRows
    };
  }

  async function previewBackupDiff(parsed) {
    const client = getClientOrThrow();
    const validation = validateBackupPayload(parsed);
    const computeDiff =
      window.AdminComponents && typeof window.AdminComponents.computeJsonDiff === "function"
        ? window.AdminComponents.computeJsonDiff
        : (a, b) => (JSON.stringify(a) === JSON.stringify(b) ? [] : [{ field: "record", before: "...", after: "..." }]);

    const tablePreviews = [];

    for (const [tbl, incomingRows] of Object.entries(validation.validTables)) {
      const { data: liveRows, error } = await client.from(tbl).select("*");
      if (error) {
        throw new Error(`Unable to inspect current "${tbl}" records for preview: ${error.message}`);
      }
      const liveById = new Map((Array.isArray(liveRows) ? liveRows : []).map((r) => [String(r.id), r]));
      const newRows = [];
      const modifiedRows = [];
      const unchangedRows = [];

      incomingRows.forEach((row) => {
        const key = String(row.id);
        const existing = liveById.get(key);
        const label = row.title || row.name || row.position || row.question || row.label || row.website_name || row.slug || key;
        if (!existing) {
          newRows.push({ id: key, label: String(label), row, status: "new", diffs: [] });
        } else {
          const diffs = computeDiff(existing, row);
          if (diffs.length > 0) {
            modifiedRows.push({ id: key, label: String(label), row, existing, status: "modified", diffs });
          } else {
            unchangedRows.push({ id: key, label: String(label), row, existing, status: "unchanged", diffs: [] });
          }
        }
      });

      tablePreviews.push({
        table: tbl,
        totalIncoming: incomingRows.length,
        newRows,
        modifiedRows,
        unchangedRows
      });
    }

    return {
      validation,
      tablePreviews
    };
  }

  async function importBackupJson(
    parsed,
    {
      mode = "insert_missing",
      selectedTables = null,
      selectedRecordIdsByTable = null,
      changeSummary = "Restored content from JSON backup snapshot"
    } = {}
  ) {
    const client = getClientOrThrow();
    const { validTables } = validateBackupPayload(parsed);
    const targetTableSet = Array.isArray(selectedTables) ? new Set(selectedTables) : null;
    const summary = {};
    let totalApplied = 0;

    for (const [tbl, rows] of Object.entries(validTables)) {
      if (targetTableSet && !targetTableSet.has(tbl)) continue;

      let chosenRows = rows;
      if (selectedRecordIdsByTable && selectedRecordIdsByTable[tbl] instanceof Set) {
        const allowedIds = selectedRecordIdsByTable[tbl];
        chosenRows = rows.filter((r) => allowedIds.has(String(r.id)));
      } else if (selectedRecordIdsByTable && Array.isArray(selectedRecordIdsByTable[tbl])) {
        const allowedIds = new Set(selectedRecordIdsByTable[tbl].map(String));
        chosenRows = rows.filter((r) => allowedIds.has(String(r.id)));
      }

      if (chosenRows.length === 0) {
        summary[tbl] = 0;
        continue;
      }

      const payloadRows = VERSIONED_TABLES.has(tbl)
        ? chosenRows.map((r) => ({ ...r, last_change_summary: changeSummary }))
        : chosenRows;

      if (mode === "upsert") {
        const { error } = await client.from(tbl).upsert(payloadRows, { onConflict: "id" });
        if (error) throw new Error(`Restore failed on "${tbl}": ${error.message}`);
        summary[tbl] = chosenRows.length;
        totalApplied += chosenRows.length;
      } else {
        const { error } = await client.from(tbl).upsert(payloadRows, { onConflict: "id", ignoreDuplicates: true });
        if (error) throw new Error(`Restore failed on "${tbl}": ${error.message}`);
        summary[tbl] = chosenRows.length;
        totalApplied += chosenRows.length;
      }
    }

    await logAudit({
      action: "import_backup",
      module: "backup_restore",
      summary: `Restored ${totalApplied} record(s) (${mode === "upsert" ? "explicit upsert" : "insert missing only"}) across ${Object.keys(summary).length} table(s)`,
      details: { mode, totalApplied, tables: summary }
    });

    return { summary, totalApplied };
  }

  async function listBackupHistory(limit = 40) {
    const client = getClientOrThrow();
    const { data, error } = await client
      .from("admin_audit_logs")
      .select("*")
      .eq("module", "backup_restore")
      .order("created_at", { ascending: false })
      .limit(Math.max(1, Math.min(100, Number(limit) || 40)));
    if (error) throw new Error(error.message || "Failed to load backup history.");
    return Array.isArray(data) ? data : [];
  }

  async function listVersionHistory({
    contentType = "all",
    contentId = "",
    search = "",
    page = 1,
    pageSize = 30
  } = {}) {
    const client = getClientOrThrow();
    const cleanPage = Math.max(1, Number(page) || 1);
    const cleanSize = Math.max(1, Math.min(100, Number(pageSize) || 30));
    const from = (cleanPage - 1) * cleanSize;
    const to = from + cleanSize - 1;

    let query = client.from("content_version_history").select("*", { count: "exact" });
    if (contentType && contentType !== "all") {
      query = query.eq("content_type", contentType);
    }
    if (contentId) {
      query = query.eq("content_id", String(contentId));
    }
    const q = String(search || "").trim();
    if (q) {
      const safeTerm = q.replace(/[,%()]/g, " ").trim();
      if (safeTerm) {
        query = query.or(
          `change_summary.ilike.%${safeTerm}%,content_type.ilike.%${safeTerm}%,content_id.ilike.%${safeTerm}%,admin_email.ilike.%${safeTerm}%`
        );
      }
    }

    const { data, count, error } = await query
      .order("updated_timestamp", { ascending: false })
      .order("version_number", { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message || "Failed to load version history.");
    return {
      rows: Array.isArray(data) ? data : [],
      totalCount: typeof count === "number" ? count : (Array.isArray(data) ? data.length : 0)
    };
  }

  async function restoreContentVersion(versionId, { targetStatus = "draft", changeSummary = "" } = {}) {
    const client = getClientOrThrow();
    const { data, error } = await client.rpc("restore_content_version", {
      p_version_id: versionId,
      p_target_status: targetStatus,
      p_change_summary: changeSummary || ""
    });
    if (error) throw new Error(error.message || "Failed to restore content version.");
    return data;
  }

  async function getSchedulerStatus() {
    const client = getClientOrThrow();
    const { data, error } = await client.rpc("get_scheduler_status");
    if (error) throw new Error(error.message || "Failed to query scheduler status.");
    return data;
  }

  async function listScheduledContent() {
    const client = getClientOrThrow();
    const { data, error } = await client.rpc("list_scheduled_content");
    if (error) throw new Error(error.message || "Failed to query scheduled content.");
    return Array.isArray(data) ? data : [];
  }

  async function triggerScheduledPublish() {
    const client = getClientOrThrow();
    const { data, error } = await client.rpc("publish_due_scheduled_content");
    if (error) throw new Error(error.message || "Failed to execute scheduled publisher.");
    return data;
  }

  // =========================================================================
  // PHASE 70 — GLOBAL ADMIN COMMAND CENTER CATALOG, SEARCH & QUEUES
  // =========================================================================
  const GLOBAL_SEARCH_CATEGORIES = [
    { key: "all", label: "All Categories" },
    { key: "pages", label: "Pages" },
    { key: "projects", label: "Projects" },
    { key: "blog", label: "Blog Posts" },
    { key: "skills", label: "Skills" },
    { key: "services", label: "Services" },
    { key: "certificates", label: "Certificates" },
    { key: "testimonials", label: "Testimonials" },
    { key: "media", label: "Media" },
    { key: "settings", label: "Settings" },
    { key: "features", label: "Features" },
    { key: "contacts", label: "Contact Messages" }
  ];

  const GLOBAL_SEARCH_CATALOG = [
    { category: "pages", categoryLabel: "Pages", table: "site_pages", routeKey: "site_pages", labelField: "title", subLabelField: "slug", searchColumns: ["title", "slug", "description"], hasStatus: true },
    { category: "pages", categoryLabel: "Pages", table: "page_sections", routeKey: "page_builder", labelField: "title", subLabelField: "page_slug", searchColumns: ["title", "section_key", "section_type", "page_slug"], hasStatus: true, isPageBuilder: true },
    { category: "projects", categoryLabel: "Projects", table: "projects", routeKey: "projects", labelField: "title", subLabelField: "category", searchColumns: ["title", "slug", "category", "short_description"], hasStatus: true },
    { category: "blog", categoryLabel: "Blog Posts", table: "blog_posts", routeKey: "blog_posts", labelField: "title", subLabelField: "category", searchColumns: ["title", "slug", "category", "excerpt"], hasStatus: true },
    { category: "skills", categoryLabel: "Skills", table: "skills", routeKey: "skills", labelField: "name", subLabelField: "category", searchColumns: ["name", "category", "description"], hasStatus: true },
    { category: "services", categoryLabel: "Services", table: "services", routeKey: "services", labelField: "title", subLabelField: "slug", searchColumns: ["title", "slug", "description"], hasStatus: true },
    { category: "certificates", categoryLabel: "Certificates", table: "certificates", routeKey: "certificates", labelField: "title", subLabelField: "issuer", searchColumns: ["title", "issuer", "credential_id"], hasStatus: true },
    { category: "testimonials", categoryLabel: "Testimonials", table: "testimonials", routeKey: "testimonials", labelField: "client_name", subLabelField: "company", searchColumns: ["client_name", "company", "testimonial_text"], hasStatus: true },
    { category: "media", categoryLabel: "Media", table: "media_assets", routeKey: "media_library", labelField: "file_name", subLabelField: "asset_kind", searchColumns: ["file_name", "alt_text", "caption", "description", "asset_kind"], hasStatus: false, isMedia: true },
    { category: "settings", categoryLabel: "Settings", table: "website_settings", routeKey: "website_settings", labelField: "website_name", subLabelField: "tagline", searchColumns: ["website_name", "tagline", "footer_text", "contact_email"], hasStatus: true, singleton: true },
    { category: "settings", categoryLabel: "Settings", table: "profile", routeKey: "profile", labelField: "name", subLabelField: "professional_title", searchColumns: ["name", "professional_title", "email", "location"], hasStatus: true, singleton: true },
    { category: "settings", categoryLabel: "Settings", table: "navigation_items", routeKey: "navigation_items", labelField: "label", subLabelField: "href", searchColumns: ["label", "href", "placement"], hasStatus: true },
    { category: "settings", categoryLabel: "Settings", table: "github_settings", routeKey: "github_settings", labelField: "username", subLabelField: "visibility_mode", searchColumns: ["username", "visibility_mode"], hasStatus: true, singleton: true },
    { category: "settings", categoryLabel: "Settings", table: "coding_activity_settings", routeKey: "coding_activity_settings", labelField: "status", subLabelField: "status", searchColumns: ["status"], hasStatus: true, singleton: true },
    { category: "features", categoryLabel: "Features", table: "technologies", routeKey: "technologies", labelField: "name", subLabelField: "quadrant", searchColumns: ["name", "quadrant", "ring", "description"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "learning_items", routeKey: "learning_items", labelField: "technology", subLabelField: "current_status", searchColumns: ["technology", "category", "current_status", "learning_objective"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "coding_challenges", routeKey: "coding_challenges", labelField: "title", subLabelField: "difficulty", searchColumns: ["title", "slug", "category", "difficulty"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "achievements", routeKey: "achievements", labelField: "title", subLabelField: "issuer", searchColumns: ["title", "issuer", "credential_id", "category"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "terminal_commands", routeKey: "terminal_commands", labelField: "command", subLabelField: "description", searchColumns: ["command", "description", "alias"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "career_knowledge", routeKey: "career_knowledge", labelField: "question", subLabelField: "category", searchColumns: ["question", "answer", "category"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "requirement_rules", routeKey: "requirement_rules", labelField: "label", subLabelField: "rule_type", searchColumns: ["label", "rule_key", "rule_type"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "resume_matcher_rules", routeKey: "resume_matcher_rules", labelField: "keyword", subLabelField: "explanation", searchColumns: ["keyword", "explanation"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "project_recommendations", routeKey: "project_recommendations", labelField: "project_slug", subLabelField: "category", searchColumns: ["project_slug", "category"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "project_dependencies", routeKey: "project_dependencies", labelField: "project_title", subLabelField: "project_slug", searchColumns: ["project_title", "project_slug"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "office_areas", routeKey: "office_areas", labelField: "area_name", subLabelField: "object_name", searchColumns: ["area_name", "object_name", "description"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "workspace_objects", routeKey: "workspace_objects", labelField: "object_name", subLabelField: "object_key", searchColumns: ["object_name", "object_key", "description"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "tour_steps", routeKey: "tour_steps", labelField: "step_title", subLabelField: "tour_title", searchColumns: ["step_title", "tour_title", "hotspot_label"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "system_endpoints", routeKey: "system_endpoints", labelField: "label", subLabelField: "url", searchColumns: ["label", "url", "category"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "faqs", routeKey: "faqs", labelField: "question", subLabelField: "category", searchColumns: ["question", "answer", "category"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "experiences", routeKey: "experiences", labelField: "position", subLabelField: "company", searchColumns: ["position", "company", "location"], hasStatus: true },
    { category: "features", categoryLabel: "Features", table: "social_links", routeKey: "social_links", labelField: "platform", subLabelField: "url", searchColumns: ["platform", "url"], hasStatus: true },
    { category: "contacts", categoryLabel: "Contact Messages", table: "contact_submissions", routeKey: "contact_submissions", labelField: "subject", subLabelField: "email", searchColumns: ["name", "email", "subject", "message"], hasStatus: true, isContact: true }
  ];

  function resolveCatalogRoute(table) {
    const entry = GLOBAL_SEARCH_CATALOG.find((c) => c.table === table);
    return entry || { category: "features", categoryLabel: "Module", table, routeKey: table, labelField: "title", subLabelField: "id", hasStatus: true };
  }

  function formatCatalogRecord(entry, row) {
    const rawLabel = row[entry.labelField] || row.title || row.name || row.subject || row.file_name || row.website_name || row.label || row.id;
    const rawSub = entry.subLabelField ? row[entry.subLabelField] : "";
    const subParts = [entry.table === "page_sections" && row.page_slug ? `Page: ${row.page_slug}` : rawSub, entry.categoryLabel].filter(Boolean);
    return {
      id: String(row.id),
      table: entry.table,
      routeKey: entry.routeKey,
      category: entry.category,
      categoryLabel: entry.categoryLabel,
      label: String(rawLabel || row.id),
      subLabel: subParts.join(" · "),
      status: row.status ? String(row.status) : "",
      updatedAt: row.updated_at || row.created_at || "",
      hasStatus: Boolean(entry.hasStatus),
      singleton: Boolean(entry.singleton),
      isPageBuilder: Boolean(entry.isPageBuilder),
      isMedia: Boolean(entry.isMedia),
      isContact: Boolean(entry.isContact),
      raw: row
    };
  }

  async function globalCommandSearch(query, { category = "all", limitPerTable = 6, adminProfile = null } = {}) {
    if (window.AdminPermissions && typeof window.AdminPermissions.canPerformAction === "function") {
      const check = window.AdminPermissions.canPerformAction(adminProfile, "search");
      if (!check.allowed) {
        throw new Error(check.reason || "Unauthorized search request blocked.");
      }
    }
    const client = getClientOrThrow();
    const rawTerm = String(query || "").trim();
    const safeTerm = rawTerm.replace(/[,%()]/g, " ").trim();
    if (!safeTerm) {
      return { query: rawTerm, category, groups: [], totalResults: 0 };
    }

    const targets = category && category !== "all"
      ? GLOBAL_SEARCH_CATALOG.filter((item) => item.category === category)
      : GLOBAL_SEARCH_CATALOG;

    const cleanLimit = Math.max(1, Math.min(20, Number(limitPerTable) || 6));

    const resultsByEntry = await Promise.all(
      targets.map(async (entry) => {
        try {
          const orExpr = entry.searchColumns.map((col) => `${col}.ilike.%${safeTerm}%`).join(",");
          let q = client.from(entry.table).select("*").or(orExpr);
          q = q.order("updated_at", { ascending: false }).limit(cleanLimit);
          const { data, error } = await q;
          if (error) {
            // Retry without updated_at ordering for tables that only have created_at
            const fallback = await client.from(entry.table).select("*").or(orExpr).limit(cleanLimit);
            if (fallback.error) return { entry, items: [] };
            const rows = Array.isArray(fallback.data) ? fallback.data : [];
            return { entry, items: rows.map((r) => formatCatalogRecord(entry, r)) };
          }
          const rows = Array.isArray(data) ? data : [];
          return { entry, items: rows.map((r) => formatCatalogRecord(entry, r)) };
        } catch (_err) {
          return { entry, items: [] };
        }
      })
    );

    const groupedMap = new Map();
    let totalResults = 0;
    resultsByEntry.forEach(({ entry, items }) => {
      if (!items.length) return;
      totalResults += items.length;
      if (!groupedMap.has(entry.category)) {
        groupedMap.set(entry.category, {
          category: entry.category,
          categoryLabel: entry.categoryLabel,
          items: []
        });
      }
      groupedMap.get(entry.category).items.push(...items);
    });

    return {
      query: rawTerm,
      category,
      groups: Array.from(groupedMap.values()),
      totalResults
    };
  }

  async function getCommandCenterSnapshot(adminProfile = null) {
    if (window.AdminPermissions && typeof window.AdminPermissions.canPerformAction === "function") {
      const check = window.AdminPermissions.canPerformAction(adminProfile, "read");
      if (!check.allowed) {
        throw new Error(check.reason || "Unauthorized dashboard access blocked.");
      }
    }
    const client = getClientOrThrow();

    const draftTables = [
      "projects",
      "blog_posts",
      "services",
      "skills",
      "certificates",
      "testimonials",
      "site_pages",
      "page_sections"
    ];

    const [
      dashStats,
      mediaCount,
      scheduledItems,
      schedulerStatus,
      unreadContactsRes,
      demoTestimonialsRes,
      websiteSettingsRes,
      securityEventsRes,
      recentEditsRes,
      draftBatches
    ] = await Promise.all([
      getDashboardStats(),
      countTable(client, "media_assets"),
      listScheduledContent().catch(() => []),
      getSchedulerStatus().catch(() => null),
      client.from("contact_submissions").select("*").eq("status", "unread").order("created_at", { ascending: false }).limit(12),
      client.from("testimonials").select("*").eq("is_demo", true).eq("status", "published").limit(10),
      client.from("website_settings").select("*").limit(1),
      client.from("security_events").select("*").order("created_at", { ascending: false }).limit(10),
      client.from("content_version_history").select("*").order("updated_timestamp", { ascending: false }).order("version_number", { ascending: false }).limit(14),
      Promise.all(
        draftTables.map(async (tbl) => {
          const entry = resolveCatalogRoute(tbl);
          const { data } = await client.from(tbl).select("*").eq("status", "draft").order("updated_at", { ascending: false }).limit(8);
          return (Array.isArray(data) ? data : []).map((row) => formatCatalogRecord(entry, row));
        })
      )
    ]);

    const draftItems = draftBatches
      .flat()
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

    const unreadContacts = Array.isArray(unreadContactsRes.data) ? unreadContactsRes.data : [];
    const demoTestimonials = Array.isArray(demoTestimonialsRes.data) ? demoTestimonialsRes.data : [];
    const recentEdits = Array.isArray(recentEditsRes.data) ? recentEditsRes.data : [];
    const securityEvents = Array.isArray(securityEventsRes.data) ? securityEventsRes.data : [];
    const settingsRow = Array.isArray(websiteSettingsRes.data) && websiteSettingsRes.data[0] ? websiteSettingsRes.data[0] : null;

    // Pending reviews = genuinely queued operational reviews (draft testimonials awaiting approval,
    // flagged live demo testimonials, and unread visitor inquiries awaiting response)
    const pendingReviews = [
      ...draftItems
        .filter((d) => d.table === "testimonials")
        .map((d) => ({
          id: d.id,
          kind: "Testimonial Draft",
          title: d.label,
          meta: d.subLabel || "Awaiting publish review",
          routeKey: "testimonials",
          table: "testimonials",
          status: d.status,
          timestamp: d.updatedAt,
          raw: d.raw
        })),
      ...demoTestimonials.map((t) => ({
        id: String(t.id),
        kind: "Published Demo Placeholder",
        title: t.client_name || String(t.id),
        meta: `${t.company || "Demo"} · Replace with verified client review or unpublish`,
        routeKey: "testimonials",
        table: "testimonials",
        status: "published",
        timestamp: t.updated_at || t.created_at,
        raw: t
      })),
      ...unreadContacts.slice(0, 6).map((c) => ({
        id: String(c.id),
        kind: "Unread Contact Review",
        title: c.subject || "Visitor Inquiry",
        meta: `${c.name} <${c.email}>`,
        routeKey: "contact_submissions",
        table: "contact_submissions",
        status: "unread",
        timestamp: c.created_at,
        raw: c,
        isContact: true
      }))
    ].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    const formattedScheduled = (Array.isArray(scheduledItems) ? scheduledItems : []).map((item) => {
      const entry = resolveCatalogRoute(item.content_type);
      return {
        id: String(item.content_id),
        table: item.content_type,
        routeKey: entry.routeKey,
        categoryLabel: entry.categoryLabel,
        label: item.label || String(item.content_id),
        pageSlug: item.page_slug || "",
        publishAt: item.publish_at || "",
        isPageBuilder: entry.isPageBuilder,
        status: "scheduled"
      };
    });

    // Real System Alerts derived strictly from database & scheduler telemetry
    const systemAlerts = [];
    if (settingsRow && settingsRow.maintenance_mode === true) {
      systemAlerts.push({
        severity: "warning",
        title: "Public Maintenance Banner Enabled",
        message: "website_settings.maintenance_mode is currently ON for visitors.",
        routeKey: "website_settings"
      });
    }
    if (schedulerStatus && Number(schedulerStatus.due_count || 0) > 0) {
      systemAlerts.push({
        severity: "warning",
        title: `${schedulerStatus.due_count} Scheduled Release(s) Due`,
        message: "Scheduled items are awaiting the next pg_cron run or manual trigger.",
        routeKey: "scheduled_publishing"
      });
    }
    if (schedulerStatus && schedulerStatus.pg_cron_installed && !schedulerStatus.cron_job_active) {
      systemAlerts.push({
        severity: "warning",
        title: "pg_cron Scheduler Job Inactive",
        message: "Server-side scheduled publishing job is paused. Enable or trigger via Scheduled Publishing.",
        routeKey: "scheduled_publishing"
      });
    }
    if (demoTestimonials.length > 0) {
      systemAlerts.push({
        severity: "info",
        title: `${demoTestimonials.length} Demo Testimonial(s) Published`,
        message: "Placeholder testimonials flagged with is_demo=true are visible until replaced or unpublished.",
        routeKey: "testimonials"
      });
    }
    if (unreadContacts.length > 0) {
      systemAlerts.push({
        severity: "info",
        title: `${unreadContacts.length} Unread Contact Inquiry(s)`,
        message: "New visitor inquiries submitted via contact.html are awaiting review.",
        routeKey: "contact_submissions"
      });
    }
    securityEvents
      .filter((ev) => /warn|fail|error|block|denied/i.test(String(ev.status || "") + " " + String(ev.event_type || "")))
      .slice(0, 3)
      .forEach((ev) => {
        systemAlerts.push({
          severity: "danger",
          title: `Security Event: ${ev.event_type || "Alert"}`,
          message: ev.summary || ev.details || "Inspect recent security audit event.",
          routeKey: "security_settings",
          timestamp: ev.created_at
        });
      });

    return {
      counts: {
        ...dashStats.counts,
        mediaCount,
        draftTotal: draftItems.length,
        scheduledCount: formattedScheduled.length,
        pendingReviewCount: pendingReviews.length,
        alertCount: systemAlerts.length
      },
      draftItems,
      pendingReviews,
      scheduledItems: formattedScheduled,
      schedulerStatus,
      unreadContacts,
      recentEdits,
      recentActivity: dashStats.recentAudits || [],
      systemAlerts
    };
  }

  window.AdminDatabase = {
    ALLOWED_MEDIA_MIMES,
    EXT_TO_ALLOWED_MIMES,
    BLOCKED_EXTENSIONS,
    MAX_UPLOAD_BYTES,
    BACKUP_TABLES,
    BACKUP_EXPORT_PRESETS,
    VERSIONED_TABLES,
    GLOBAL_SEARCH_CATEGORIES,
    GLOBAL_SEARCH_CATALOG,
    logAudit,
    listRecords,
    getSingleton,
    createRecord,
    updateRecord,
    upsertSingleton,
    deleteRecord,
    bulkUpdateStatus,
    bulkDelete,
    duplicateRecord,
    getDashboardStats,
    resolveCatalogRoute,
    globalCommandSearch,
    getCommandCenterSnapshot,
    validateMediaFile,
    validateSvgSafety,
    optimizeImageFile,
    listMediaFolders,
    createMediaFolder,
    renameMediaFolder,
    deleteMediaFolder,
    listMediaAssets,
    uploadMedia,
    updateMediaMetadata,
    bulkMoveMediaFolder,
    replaceMediaFile,
    checkMediaReferences,
    deleteMediaAsset,
    bulkDeleteMediaAssets,
    buildContactsCsv,
    exportBackupJson,
    validateBackupPayload,
    previewBackupDiff,
    importBackupJson,
    listBackupHistory,
    listVersionHistory,
    restoreContentVersion,
    getSchedulerStatus,
    listScheduledContent,
    triggerScheduledPublish
  };
})();
