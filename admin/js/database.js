/**
 * AL AMIN Admin CMS — Supabase Database, Media Storage, Audit Log & Backup Service (Phases 61–65)
 * All mutations enforce authenticated Supabase client + RLS + audit trail logging.
 */
(() => {
  const ALLOWED_MEDIA_MIMES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "text/plain",
    "text/markdown"
  ]);

  const BLOCKED_EXTENSIONS = new Set([
    "exe", "sh", "bash", "bat", "cmd", "ps1", "js", "mjs", "cjs",
    "php", "py", "rb", "pl", "dll", "so", "msi", "html", "htm"
  ]);

  const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

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

  async function createRecord(table, payload, summaryPrefix = "Created") {
    const client = getClientOrThrow();
    const { data, error } = await client.from(table).insert([payload]).select().single();
    if (error) throw new Error(error.message || `Create failed on ${table}`);
    await logAudit({
      action: "create",
      module: table,
      recordId: data && data.id ? String(data.id) : "",
      summary: `${summaryPrefix} record in ${table}`,
      details: { slug: data && data.slug ? data.slug : undefined, title: data && (data.title || data.name || data.label) }
    });
    return data;
  }

  async function updateRecord(table, id, payload, summaryPrefix = "Updated") {
    const client = getClientOrThrow();
    const { data, error } = await client.from(table).update(payload).eq("id", id).select().single();
    if (error) throw new Error(error.message || `Update failed on ${table}`);
    await logAudit({
      action: "update",
      module: table,
      recordId: String(id),
      summary: `${summaryPrefix} record in ${table}`,
      details: { title: data && (data.title || data.name || data.label) }
    });
    return data;
  }

  async function upsertSingleton(table, id, payload) {
    const client = getClientOrThrow();
    if (id) {
      return updateRecord(table, id, payload, "Updated settings");
    }
    return createRecord(table, payload, "Created settings");
  }

  async function deleteRecord(table, id, recordLabel = "") {
    const client = getClientOrThrow();
    const { error } = await client.from(table).delete().eq("id", id);
    if (error) throw new Error(error.message || `Delete failed on ${table}`);
    await logAudit({
      action: "delete",
      module: table,
      recordId: String(id),
      summary: `Deleted ${recordLabel || "record"} from ${table}`
    });
    return true;
  }

  async function bulkUpdateStatus(table, ids, nextStatus) {
    if (!Array.isArray(ids) || ids.length === 0) return 0;
    const client = getClientOrThrow();
    const patch = { status: nextStatus };
    if (nextStatus === "archived") {
      if (table === "projects" || table === "blog_posts") {
        patch.archived_at = new Date().toISOString();
      }
    }
    const { error } = await client.from(table).update(patch).in("id", ids);
    if (error) throw new Error(error.message || `Bulk status update failed on ${table}`);
    await logAudit({
      action: "bulk_status",
      module: table,
      summary: `Updated ${ids.length} records to "${nextStatus}"`,
      details: { count: ids.length, status: nextStatus }
    });
    return ids.length;
  }

  async function bulkDelete(table, ids) {
    if (!Array.isArray(ids) || ids.length === 0) return 0;
    const client = getClientOrThrow();
    const { error } = await client.from(table).delete().in("id", ids);
    if (error) throw new Error(error.message || `Bulk delete failed on ${table}`);
    await logAudit({
      action: "bulk_delete",
      module: table,
      summary: `Deleted ${ids.length} records from ${table}`,
      details: { count: ids.length }
    });
    return ids.length;
  }

  async function duplicateRecord(table, row, titleField = "title", slugField = "slug") {
    const clone = { ...row };
    delete clone.id;
    delete clone.created_at;
    delete clone.updated_at;
    delete clone.archived_at;
    if (titleField && clone[titleField]) {
      clone[titleField] = `${clone[titleField]} (Copy)`;
    }
    if (slugField && clone[slugField]) {
      clone[slugField] = `${clone[slugField]}-copy-${Date.now().toString(36).slice(-4)}`;
    }
    if ("status" in clone) clone.status = "draft";
    return createRecord(table, clone, "Duplicated");
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

  function validateMediaFile(file) {
    if (!file) throw new Error("No file selected.");
    const name = String(file.name || "");
    const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
    if (BLOCKED_EXTENSIONS.has(ext)) {
      throw new Error(`Blocked file extension ".${ext}". Executable and script uploads are strictly prohibited.`);
    }
    if (!ALLOWED_MEDIA_MIMES.has(file.type)) {
      throw new Error(`Unsupported MIME type "${file.type || "unknown"}". Allowed: JPEG, PNG, WebP, SVG, PDF, TXT, Markdown.`);
    }
    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      throw new Error("File size must be between 1 byte and 10 MB.");
    }
  }

  async function uploadMedia(file, { altText = "", assetKind = "image" } = {}) {
    validateMediaFile(file);
    const client = getClientOrThrow();
    const cfg = window.AdminAuth.getRuntimeConfig();
    const bucket = cfg.storageBucket || "portfolio-media";

    const safeFileName = String(file.name || "asset")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const storagePath = `${assetKind}/${Date.now()}-${safeFileName}`;

    const { error: uploadErr } = await client.storage.from(bucket).upload(storagePath, file, {
      contentType: file.type,
      upsert: false
    });
    if (uploadErr) throw new Error(uploadErr.message || "Storage upload failed.");

    const { data: pubData } = client.storage.from(bucket).getPublicUrl(storagePath);
    const publicUrl = pubData && pubData.publicUrl ? pubData.publicUrl : "";

    const { data: userRes } = await client.auth.getUser();
    const { data: row, error: dbErr } = await client
      .from("media_assets")
      .insert([{
        file_name: file.name,
        storage_path: storagePath,
        public_url: publicUrl,
        mime_type: file.type,
        file_size_bytes: file.size,
        alt_text: String(altText || "").trim(),
        asset_kind: assetKind,
        uploaded_by: userRes && userRes.user ? userRes.user.id : null
      }])
      .select()
      .single();

    if (dbErr) throw new Error(dbErr.message || "Media metadata save failed.");
    await logAudit({
      action: "upload_media",
      module: "media_assets",
      recordId: row && row.id ? String(row.id) : "",
      summary: `Uploaded media "${file.name}" (${assetKind})`
    });
    return row;
  }

  async function checkMediaReferences(asset) {
    const client = getClientOrThrow();
    const needleList = [asset.public_url, asset.storage_path].filter(Boolean);
    const references = [];
    if (needleList.length === 0) return references;

    const checks = [
      { table: "profile", label: "Profile", cols: ["profile_image", "resume_url"] },
      { table: "projects", label: "Projects", cols: ["thumbnail", "images"] },
      { table: "blog_posts", label: "Blog Posts", cols: ["cover_image"] },
      { table: "certificates", label: "Certificates", cols: ["certificate_image"] },
      { table: "testimonials", label: "Testimonials", cols: ["client_image"] },
      { table: "website_settings", label: "Website Settings", cols: ["website_logo", "favicon"] },
      { table: "achievements", label: "Achievements", cols: ["badge_image"] }
    ];

    await Promise.all(
      checks.map(async (chk) => {
        const { data } = await client.from(chk.table).select(`id, ${chk.cols.join(", ")}`).limit(100);
        if (!Array.isArray(data)) return;
        data.forEach((row) => {
          const serialized = JSON.stringify(row);
          if (needleList.some((n) => serialized.includes(n))) {
            references.push(`${chk.label} (ID: ${row.id})`);
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
      await client.storage.from(bucket).remove([asset.storage_path]);
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
    "system_endpoints"
  ];

  async function exportBackupJson() {
    const client = getClientOrThrow();
    const tablesData = {};

    for (const tbl of BACKUP_TABLES) {
      const { data, error } = await client.from(tbl).select("*");
      if (!error && Array.isArray(data)) {
        tablesData[tbl] = data;
      }
    }

    await logAudit({
      action: "export_backup",
      module: "backup_restore",
      summary: `Exported JSON content backup (${Object.keys(tablesData).length} tables)`
    });

    return {
      format: "alamin-portfolio-cms-backup-v1",
      exportedAt: new Date().toISOString(),
      notice: "Content-only JSON snapshot. Does not include PostgreSQL DDL schema, Storage binary blobs, or auth secrets.",
      tables: tablesData
    };
  }

  function validateBackupPayload(parsed) {
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Backup file is not a valid JSON object.");
    }
    if (parsed.format !== "alamin-portfolio-cms-backup-v1" || !parsed.tables || typeof parsed.tables !== "object") {
      throw new Error("Unrecognized backup schema. Expected format: alamin-portfolio-cms-backup-v1.");
    }
    const validTables = {};
    let totalRows = 0;
    Object.entries(parsed.tables).forEach(([tbl, rows]) => {
      if (BACKUP_TABLES.includes(tbl) && Array.isArray(rows)) {
        validTables[tbl] = rows;
        totalRows += rows.length;
      }
    });
    return { validTables, totalRows };
  }

  async function importBackupJson(parsed, { mode = "insert_missing" } = {}) {
    const client = getClientOrThrow();
    const { validTables } = validateBackupPayload(parsed);
    const summary = {};

    for (const [tbl, rows] of Object.entries(validTables)) {
      if (rows.length === 0) {
        summary[tbl] = 0;
        continue;
      }
      if (mode === "upsert") {
        const { error } = await client.from(tbl).upsert(rows, { onConflict: "id" });
        if (error) throw new Error(`Import error on "${tbl}": ${error.message}`);
        summary[tbl] = rows.length;
      } else {
        const { error } = await client.from(tbl).upsert(rows, { onConflict: "id", ignoreDuplicates: true });
        if (error) throw new Error(`Import error on "${tbl}": ${error.message}`);
        summary[tbl] = rows.length;
      }
    }

    await logAudit({
      action: "import_backup",
      module: "backup_restore",
      summary: `Imported JSON backup (${mode}) across ${Object.keys(summary).length} tables`,
      details: summary
    });

    return summary;
  }

  window.AdminDatabase = {
    ALLOWED_MEDIA_MIMES,
    BLOCKED_EXTENSIONS,
    MAX_UPLOAD_BYTES,
    BACKUP_TABLES,
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
    validateMediaFile,
    uploadMedia,
    checkMediaReferences,
    deleteMediaAsset,
    buildContactsCsv,
    exportBackupJson,
    validateBackupPayload,
    importBackupJson
  };
})();
