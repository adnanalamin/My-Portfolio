/**
 * AL AMIN Portfolio OS — Safe Visual Website Builder Component Registry & Renderer (Phase 66)
 * Shared by BOTH the Admin Visual Page Builder preview AND the Public Frontend.
 *
 * Security invariants:
 * - Strict predefined 16-component registry; unknown section_type values are ignored safely.
 * - Zero dynamic JS execution; zero arbitrary HTML parsing/injection.
 * - All text strings escaped via escapeHtml().
 * - All URLs checked by isSafeUrl() (relative, http:, https:, mailto:, tel:, # only).
 * - Video embeds restricted to YouTube, Vimeo, or direct HTTPS MP4/WebM media URLs.
 */
(() => {
  const SECTION_TYPES = [
    { type: "hero", label: "Hero", category: "Core", icon: "sparkles", description: "Primary headline, intro copy, media, and action buttons." },
    { type: "about", label: "About", category: "Core", icon: "user-circle", description: "Developer bio, highlights, and studio image." },
    { type: "skills", label: "Skills", category: "Portfolio", icon: "cpu", description: "Technical capabilities grouped by domain." },
    { type: "services", label: "Services", category: "Portfolio", icon: "layers", description: "Service cards with deliverables and quote links." },
    { type: "projects", label: "Projects", category: "Portfolio", icon: "folder-kanban", description: "Featured or custom case study grid." },
    { type: "experience", label: "Experience", category: "Portfolio", icon: "briefcase", description: "Work, freelance, and education timeline." },
    { type: "statistics", label: "Statistics", category: "Data", icon: "bar-chart-3", description: "Verified numeric metrics with labels." },
    { type: "testimonials", label: "Testimonials", category: "Social Proof", icon: "message-square-quote", description: "Client testimonials with attribution." },
    { type: "blog", label: "Blog", category: "Content", icon: "file-text", description: "Recent or curated technical articles." },
    { type: "faq", label: "FAQ", category: "Content", icon: "help-circle", description: "Expandable frequently asked questions." },
    { type: "contact", label: "Contact", category: "Conversion", icon: "mail", description: "Direct inquiry prompt and contact links." },
    { type: "cta", label: "CTA", category: "Conversion", icon: "megaphone", description: "Focused call-to-action banner with buttons." },
    { type: "logo_grid", label: "Logo Grid", category: "Showcase", icon: "grid", description: "Partner, tool, or client wordmark grid." },
    { type: "image_gallery", label: "Image Gallery", category: "Media", icon: "images", description: "Responsive showcase gallery with captions." },
    { type: "video", label: "Video", category: "Media", icon: "play-circle", description: "Safe YouTube, Vimeo, or MP4 presentation block." },
    { type: "custom_content", label: "Custom Content", category: "Layout", icon: "layout-template", description: "Structured safe text, bullet, callout, and button blocks." }
  ];

  const TYPE_SET = new Set(SECTION_TYPES.map((s) => s.type));

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isSafeUrl(rawUrl) {
    const url = String(rawUrl || "").trim();
    if (!url) return false;
    if (url.startsWith("#") || url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
      return !/^\s*(javascript|vbscript|data):/i.test(url);
    }
    if (/^[a-z0-9][a-z0-9/_.-]*(\?[^#\s]*)?(#[^\s]*)?$/i.test(url) && !url.includes(":")) {
      return true;
    }
    return /^https?:\/\//i.test(url) || /^mailto:/i.test(url) || /^tel:/i.test(url);
  }

  function sanitizeCssColor(val, fallback = "") {
    const clean = String(val || "").trim();
    if (!clean) return fallback;
    if (/^#[0-9a-f]{3,8}$/i.test(clean)) return clean;
    if (/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i.test(clean)) {
      return clean;
    }
    return fallback;
  }

  function sanitizeGradient(val) {
    const clean = String(val || "").trim();
    if (!clean) return "";
    if (/^linear-gradient\([a-z0-9\s,%#().-]+\)$/i.test(clean)) return clean;
    return "";
  }

  function parseSafeVideoUrl(rawUrl) {
    const clean = String(rawUrl || "").trim();
    if (!clean) return null;
    try {
      const parsed = new URL(clean);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
      const host = parsed.hostname.toLowerCase();
      if (host === "youtu.be" && parsed.pathname.length > 1) {
        const id = parsed.pathname.slice(1).replace(/[^a-zA-Z0-9_-]/g, "");
        return id ? { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
      }
      if ((host === "www.youtube.com" || host === "youtube.com") && parsed.searchParams.get("v")) {
        const id = parsed.searchParams.get("v").replace(/[^a-zA-Z0-9_-]/g, "");
        return id ? { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
      }
      if ((host === "www.youtube.com" || host === "youtube.com" || host === "www.youtube-nocookie.com") && parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.replace("/embed/", "").split("/")[0].replace(/[^a-zA-Z0-9_-]/g, "");
        return id ? { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
      }
      if (host === "vimeo.com" || host === "player.vimeo.com") {
        const idMatch = parsed.pathname.match(/(\d+)/);
        return idMatch ? { kind: "iframe", src: `https://player.vimeo.com/video/${idMatch[1]}` } : null;
      }
      if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(parsed.pathname)) {
        return { kind: "video", src: parsed.toString() };
      }
    } catch (_err) {
      return null;
    }
    return null;
  }

  function createDefaultSection(sectionType, pageSlug = "index.html", sortOrder = 0) {
    const cleanType = TYPE_SET.has(sectionType) ? sectionType : "custom_content";
    const meta = SECTION_TYPES.find((s) => s.type === cleanType) || SECTION_TYPES[0];
    const base = {
      id: `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      page_slug: pageSlug,
      section_key: `${cleanType}-${sortOrder + 1}`,
      section_type: cleanType,
      title: `${meta.label} Section`,
      subtitle: meta.description,
      enabled: true,
      sort_order: sortOrder,
      status: "draft",
      content: {
        eyebrow: meta.category,
        body: "",
        imageUrl: "",
        imageAlt: "",
        buttons: [],
        links: [],
        items: [],
        videoUrl: ""
      },
      style_config: {
        backgroundType: "transparent",
        backgroundColor: "#0d1424",
        backgroundGradient: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.08))",
        backgroundImage: "",
        textColor: "",
        accentColor: "#6366f1",
        headingFont: "Plus Jakarta Sans",
        bodyFont: "Plus Jakarta Sans",
        headingSize: "lg",
        alignment: "left",
        paddingY: "64",
        maxWidth: "1200",
        gap: "24"
      },
      layout_config: {
        variant: "grid",
        columnsDesktop: 3,
        columnsTablet: 2,
        columnsMobile: 1,
        mediaPosition: "right"
      },
      animation_config: {
        preset: "fade-up",
        durationMs: 320,
        delayMs: 0
      },
      visibility_config: {
        desktop: true,
        tablet: true,
        mobile: true
      }
    };

    // Populate clean section-appropriate defaults
    switch (cleanType) {
      case "hero":
        base.title = "Full-Stack Developer & Creative Designer";
        base.subtitle = "Engineering scalable web systems with refined interface craft.";
        base.layout_config.variant = "split";
        base.content.body = "Modern MERN applications, SaaS platforms, and accessible frontend architectures crafted from Bangladesh.";
        base.content.imageUrl = "assets/images/profile.jpg";
        base.content.imageAlt = "AL AMIN portrait";
        base.content.buttons = [
          { label: "View Projects", href: "projects.html", variant: "primary" },
          { label: "Contact Me", href: "contact.html", variant: "secondary" }
        ];
        break;
      case "about":
        base.title = "Engineering With Clarity & Craft";
        base.subtitle = "Bridging backend dependability with modern interface architecture.";
        base.content.body = "Focused on React, Next.js, Node.js, Express, MongoDB, PostgreSQL, and responsive design systems.";
        base.content.items = [
          { title: "Full-Stack Architecture", description: "End-to-end REST APIs, database schemas, and modular UI." },
          { title: "Accessibility & Speed", description: "WCAG-compliant semantic markup and zero layout shift." }
        ];
        base.content.buttons = [{ label: "Read Full Story", href: "about.html", variant: "secondary" }];
        break;
      case "skills":
        base.title = "Core Engineering Stack";
        base.subtitle = "Configured technical stack synchronized from portfolio records.";
        base.content.usePortfolioData = true;
        base.content.items = [
          { title: "React & Next.js", category: "Frontend", description: "Component systems and SSR/SPA architecture" },
          { title: "Node.js & Express", category: "Backend", description: "REST APIs, JWT auth, and middleware" },
          { title: "MongoDB & PostgreSQL", category: "Database", description: "Schema design and RLS security" }
        ];
        break;
      case "services":
        base.title = "Services & Engineering Capabilities";
        base.subtitle = "How I help teams ship reliable digital products.";
        base.content.usePortfolioData = true;
        base.content.items = [
          { title: "Full-Stack Web Apps", description: "MERN & Next.js production builds with database integration." },
          { title: "Admin Dashboards & SaaS", description: "Multi-role operational tools and analytics interfaces." },
          { title: "UI/UX Implementation", description: "Responsive Figma-to-code systems built for speed." }
        ];
        break;
      case "projects":
        base.title = "Featured Case Studies";
        base.subtitle = "Selected software architecture and interface builds.";
        base.content.usePortfolioData = true;
        base.content.items = [
          { title: "AstraPulse", category: "SaaS", description: "Full-stack telemetry and analytics workspace.", href: "project-details.html?id=astrapulse" },
          { title: "Nexora", category: "E-commerce", description: "Modular headless commerce storefront.", href: "project-details.html?id=nexora" },
          { title: "SLIDEVERSE", category: "UI/UX", description: "Interactive browser presentation studio.", href: "project-details.html?id=slideverse" }
        ];
        break;
      case "experience":
        base.title = "Experience & Education";
        base.subtitle = "Professional milestones and continuous craft.";
        base.layout_config.variant = "list";
        base.content.items = [
          { title: "Full-Stack MERN Developer", subtitle: "Independent Product Studio · 2025 – Present", description: "Architecting full-stack web apps and RESTful APIs." },
          { title: "Frontend & UI Engineer", subtitle: "Digital Web Solutions · 2024 – 2025", description: "Responsive component libraries and Core Web Vitals optimization." }
        ];
        break;
      case "statistics":
        base.title = "Verified Portfolio Scope";
        base.subtitle = "Key delivery figures based on active portfolio capabilities.";
        base.layout_config.columnsDesktop = 4;
        base.content.items = [
          { value: "4+", label: "Production Stacks", note: "MERN, Next.js, PostgreSQL, Vanilla ES" },
          { value: "100%", label: "Responsive Target", note: "320px to 2560px tested" },
          { value: "REST", label: "API Architecture", note: "Validated schemas & RBAC" },
          { value: "AA", label: "Accessibility Baseline", note: "Semantic & keyboard-navigable" }
        ];
        break;
      case "testimonials":
        base.title = "Client Feedback";
        base.subtitle = "Add verified client reviews or keep hidden until real client quotes are recorded.";
        base.content.items = [];
        break;
      case "blog":
        base.title = "Engineering Notes & Articles";
        base.subtitle = "Technical write-ups on frontend architecture and API design.";
        base.content.usePortfolioData = true;
        base.content.items = [
          { title: "Designing Modular Design Tokens Without CSS Bloat", category: "Frontend", href: "blog.html" },
          { title: "Securing Static Sites with Supabase RLS", category: "Security", href: "blog.html" }
        ];
        break;
      case "faq":
        base.title = "Frequently Asked Questions";
        base.subtitle = "Common questions about collaboration, stack, and delivery.";
        base.layout_config.variant = "list";
        base.content.items = [
          { title: "What technologies do you specialize in?", description: "Full-stack JavaScript/TypeScript with React, Next.js, Node.js, Express, MongoDB, PostgreSQL, and Tailwind CSS." },
          { title: "Do you handle both frontend UI and backend APIs?", description: "Yes, from responsive Figma implementation through database design and deployment." }
        ];
        break;
      case "contact":
        base.title = "Start a Conversation";
        base.subtitle = "Share your project scope or role details.";
        base.content.body = "Available for freelance full-stack builds, SaaS dashboards, and remote engineering collaboration.";
        base.content.buttons = [{ label: "Open Contact Form", href: "contact.html", variant: "primary" }];
        base.content.links = [{ label: "View Direct Channels", href: "contact.html#contact-root" }];
        break;
      case "cta":
        base.title = "Ready to Build Your Next Web Product?";
        base.subtitle = "Let us scope clean architecture, timeline, and deliverables together.";
        base.style_config.backgroundType = "gradient";
        base.style_config.alignment = "center";
        base.content.buttons = [
          { label: "Request a Project Quote", href: "project-request.html", variant: "primary" },
          { label: "Estimate Scope", href: "project-estimator.html", variant: "secondary" }
        ];
        break;
      case "logo_grid":
        base.title = "Core Ecosystem & Tooling";
        base.subtitle = "Technologies powering daily builds.";
        base.layout_config.columnsDesktop = 4;
        base.content.items = [
          { title: "React", note: "UI Architecture" },
          { title: "Node.js", note: "API Runtime" },
          { title: "PostgreSQL", note: "Relational DB" },
          { title: "Supabase", note: "Auth & Storage" }
        ];
        break;
      case "image_gallery":
        base.title = "Interface Visual Showcase";
        base.subtitle = "Selected UI compositions and project previews.";
        base.content.items = [
          { title: "Workspace System", imageUrl: "assets/images/profile.jpg", caption: "Responsive portfolio visual frame" }
        ];
        break;
      case "video":
        base.title = "Product Architecture Walkthrough";
        base.subtitle = "Attach a verified YouTube, Vimeo, or MP4 showcase URL.";
        base.content.videoUrl = "";
        base.content.body = "Add a YouTube, Vimeo, or direct MP4 URL in the Video inspector to display a responsive player.";
        break;
      case "custom_content":
        base.title = "Custom Structured Section";
        base.subtitle = "Safe, structured heading, prose, bullet list, and action blocks.";
        base.content.body = "Compose structured copy, bullet highlights, and verified action buttons without unsafe HTML or scripts.";
        base.content.items = [
          { title: "Structured Block 1", description: "Clean typographic paragraph rendered safely from JSON data." }
        ];
        base.content.buttons = [{ label: "Explore Portfolio", href: "projects.html", variant: "secondary" }];
        break;
      default:
        break;
    }
    return base;
  }

  function renderButtonsHtml(buttons = [], accentColor = "#6366f1") {
    if (!Array.isArray(buttons) || buttons.length === 0) return "";
    const safeAccent = sanitizeCssColor(accentColor, "#6366f1");
    return `
      <div class="flex flex-wrap gap-3 pt-2">
        ${buttons
          .map((btn) => {
            const label = escapeHtml(btn && btn.label ? btn.label : "Learn More");
            const href = btn && isSafeUrl(btn.href) ? escapeHtml(btn.href) : "#";
            const variant = btn && btn.variant === "secondary" ? "secondary" : btn && btn.variant === "outline" ? "outline" : "primary";
            const cls =
              variant === "primary"
                ? "inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                : variant === "outline"
                ? "inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-500/40 hover:border-indigo-400 transition-colors"
                : "inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-slate-800/80 text-slate-100 border border-slate-700 hover:bg-slate-700 transition-colors";
            const style = variant === "primary" ? `style="background:${safeAccent};"` : "";
            return `<a href="${href}" class="${cls}" ${style}>${label}</a>`;
          })
          .join("")}
      </div>
    `;
  }

  function renderLinksHtml(links = []) {
    if (!Array.isArray(links) || links.length === 0) return "";
    return `
      <div class="flex flex-wrap gap-4 pt-2 text-xs sm:text-sm">
        ${links
          .map((lnk) => {
            const label = escapeHtml(lnk && lnk.label ? lnk.label : "View Link");
            const href = lnk && isSafeUrl(lnk.href) ? escapeHtml(lnk.href) : "#";
            return `<a href="${href}" class="underline underline-offset-4 opacity-85 hover:opacity-100">${label}</a>`;
          })
          .join("")}
      </div>
    `;
  }

  function resolveLiveItems(section) {
    const c = section.content || {};
    const customItems = Array.isArray(c.items) ? c.items : [];
    if (!c.usePortfolioData || !window.PortfolioData) return customItems;

    const pd = window.PortfolioData;
    if (section.section_type === "projects" && typeof pd.getProjects === "function") {
      const rows = pd.getProjects().slice(0, 6);
      if (rows.length > 0) {
        return rows.map((p) => ({
          title: p.title,
          category: p.category || "Project",
          description: p.description || p.short_description || "",
          imageUrl: p.thumbnail || "",
          href: p.href || `project-details.html?id=${encodeURIComponent(p.slug || p.id || "")}`
        }));
      }
    }
    if (section.section_type === "skills" && typeof pd.getSkills === "function") {
      const rows = pd.getSkills().slice(0, 8);
      if (rows.length > 0) {
        return rows.map((s) => ({
          title: s.name || s.title,
          category: s.category || "Skill",
          description: s.description || s.level || ""
        }));
      }
    }
    if (section.section_type === "services" && typeof pd.getServices === "function") {
      const rows = pd.getServices().slice(0, 6);
      if (rows.length > 0) {
        return rows.map((sv) => ({
          title: sv.title,
          description: sv.summary || sv.description || "",
          href: `contact.html?service=${encodeURIComponent(sv.slug || "")}`
        }));
      }
    }
    if (section.section_type === "blog" && typeof pd.getBlogPosts === "function") {
      const rows = pd.getBlogPosts().slice(0, 3);
      if (rows.length > 0) {
        return rows.map((b) => ({
          title: b.title,
          category: b.category || "Article",
          description: b.excerpt || "",
          href: `blog-details.html?slug=${encodeURIComponent(b.slug || "")}`
        }));
      }
    }
    return customItems;
  }

  function buildResponsiveGridClass(layout = {}) {
    const d = Math.max(1, Math.min(4, Number(layout.columnsDesktop) || 3));
    const t = Math.max(1, Math.min(3, Number(layout.columnsTablet) || 2));
    const m = Math.max(1, Math.min(2, Number(layout.columnsMobile) || 1));
    const mapM = { 1: "grid-cols-1", 2: "grid-cols-2" }[m] || "grid-cols-1";
    const mapT = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" }[t] || "sm:grid-cols-2";
    const mapD = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" }[d] || "lg:grid-cols-3";
    return `grid ${mapM} ${mapT} ${mapD}`;
  }

  function renderSectionBody(section) {
    const type = section.section_type;
    const c = section.content || {};
    const st = section.style_config || {};
    const layout = section.layout_config || {};
    const align = st.alignment === "center" ? "text-center mx-auto" : st.alignment === "right" ? "text-right ml-auto" : "text-left";
    const headingSizeCls =
      st.headingSize === "xl"
        ? "text-3xl sm:text-4xl lg:text-5xl"
        : st.headingSize === "md"
        ? "text-xl sm:text-2xl"
        : "text-2xl sm:text-3xl";

    const eyebrow = c.eyebrow
      ? `<p class="text-xs font-semibold uppercase tracking-widest mb-2" style="color:${sanitizeCssColor(st.accentColor, "#818cf8")}">${escapeHtml(c.eyebrow)}</p>`
      : "";
    const heading = section.title
      ? `<h2 class="${headingSizeCls} font-bold tracking-tight leading-tight">${escapeHtml(section.title)}</h2>`
      : "";
    const subheading = section.subtitle
      ? `<p class="text-sm sm:text-base opacity-80 leading-relaxed mt-2 max-w-2xl ${st.alignment === "center" ? "mx-auto" : ""}">${escapeHtml(section.subtitle)}</p>`
      : "";
    const bodyCopy = c.body
      ? `<p class="text-sm opacity-75 leading-relaxed mt-3 max-w-2xl ${st.alignment === "center" ? "mx-auto" : ""}">${escapeHtml(c.body)}</p>`
      : "";

    const items = resolveLiveItems(section);
    const gridCls = buildResponsiveGridClass(layout);
    const gapStyle = `gap:${Math.max(8, Math.min(48, Number(st.gap) || 24))}px;`;

    if (type === "hero") {
      const hasImg = c.imageUrl && isSafeUrl(c.imageUrl);
      const isSplit = layout.variant === "split" && hasImg;
      const mediaOrder = layout.mediaPosition === "left" ? "lg:order-first" : "lg:order-last";
      if (isSplit) {
        return `
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-7 space-y-2 ${align}">
              ${eyebrow}
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">${escapeHtml(section.title)}</h1>
              ${subheading}
              ${bodyCopy}
              ${renderButtonsHtml(c.buttons, st.accentColor)}
              ${renderLinksHtml(c.links)}
            </div>
            <div class="lg:col-span-5 ${mediaOrder}">
              <img src="${escapeHtml(c.imageUrl)}" alt="${escapeHtml(c.imageAlt || section.title)}" referrerpolicy="no-referrer" class="w-full max-h-[380px] object-cover rounded-xl border border-slate-500/25">
            </div>
          </div>
        `;
      }
      return `
        <div class="space-y-3 ${align}">
          ${eyebrow}
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">${escapeHtml(section.title)}</h1>
          ${subheading}
          ${bodyCopy}
          ${hasImg ? `<div class="pt-3"><img src="${escapeHtml(c.imageUrl)}" alt="${escapeHtml(c.imageAlt || section.title)}" referrerpolicy="no-referrer" class="w-full max-h-[360px] object-cover rounded-xl border border-slate-500/25"></div>` : ""}
          ${renderButtonsHtml(c.buttons, st.accentColor)}
          ${renderLinksHtml(c.links)}
        </div>
      `;
    }

    if (type === "cta") {
      return `
        <div class="rounded-2xl border border-slate-500/25 p-6 sm:p-10 space-y-3 ${align}">
          ${eyebrow}
          ${heading}
          ${subheading}
          ${bodyCopy}
          <div class="${st.alignment === "center" ? "flex justify-center" : ""}">${renderButtonsHtml(c.buttons, st.accentColor)}</div>
          ${renderLinksHtml(c.links)}
        </div>
      `;
    }

    if (type === "video") {
      const parsed = parseSafeVideoUrl(c.videoUrl);
      const player = parsed
        ? parsed.kind === "iframe"
          ? `<div class="aspect-video w-full rounded-xl overflow-hidden border border-slate-500/25 bg-black"><iframe src="${escapeHtml(parsed.src)}" title="${escapeHtml(section.title)}" class="w-full h-full" sandbox="allow-scripts allow-same-origin allow-presentation" allowfullscreen loading="lazy"></iframe></div>`
          : `<video controls class="w-full max-h-[460px] rounded-xl border border-slate-500/25 bg-black"><source src="${escapeHtml(parsed.src)}"></video>`
        : `<div class="rounded-xl border border-dashed border-slate-500/35 p-8 text-center text-sm opacity-75">Configure a valid YouTube, Vimeo, or direct MP4 URL to display the video player.</div>`;
      return `
        <div class="space-y-5">
          <div class="${align}">${eyebrow}${heading}${subheading}${bodyCopy}</div>
          ${player}
          ${renderButtonsHtml(c.buttons, st.accentColor)}
        </div>
      `;
    }

    if (type === "image_gallery") {
      const gallery = items.filter((it) => it && isSafeUrl(it.imageUrl));
      return `
        <div class="space-y-6">
          <div class="${align}">${eyebrow}${heading}${subheading}</div>
          ${
            gallery.length > 0
              ? `<div class="${gridCls}" style="${gapStyle}">
                  ${gallery
                    .map(
                      (img) => `
                      <figure class="rounded-xl overflow-hidden border border-slate-500/20 bg-slate-900/40">
                        <img src="${escapeHtml(img.imageUrl)}" alt="${escapeHtml(img.title || img.caption || "Gallery image")}" referrerpolicy="no-referrer" class="w-full h-52 object-cover">
                        ${img.caption || img.title ? `<figcaption class="p-3 text-xs opacity-80">${escapeHtml(img.caption || img.title)}</figcaption>` : ""}
                      </figure>
                    `
                    )
                    .join("")}
                </div>`
              : `<div class="rounded-xl border border-dashed border-slate-500/30 p-6 text-center text-xs opacity-75">No gallery images configured yet. Add images from your Media Library.</div>`
          }
        </div>
      `;
    }

    if (type === "statistics") {
      return `
        <div class="space-y-6">
          <div class="${align}">${eyebrow}${heading}${subheading}</div>
          <div class="${gridCls}" style="${gapStyle}">
            ${items
              .map(
                (stat) => `
                <div class="rounded-xl border border-slate-500/20 p-5 bg-slate-900/35">
                  <p class="text-2xl sm:text-3xl font-bold font-mono-tech tabular-nums" style="color:${sanitizeCssColor(st.accentColor, "#818cf8")}">${escapeHtml(stat.value || "0")}</p>
                  <p class="text-sm font-semibold mt-1">${escapeHtml(stat.label || stat.title || "Metric")}</p>
                  ${stat.note ? `<p class="text-xs opacity-70 mt-1">${escapeHtml(stat.note)}</p>` : ""}
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    if (type === "testimonials") {
      return `
        <div class="space-y-6">
          <div class="${align}">${eyebrow}${heading}${subheading}</div>
          ${
            items.length > 0
              ? `<div class="${gridCls}" style="${gapStyle}">
                  ${items
                    .map(
                      (t) => `
                      <blockquote class="rounded-xl border border-slate-500/20 p-5 bg-slate-900/35 space-y-3">
                        <p class="text-sm leading-relaxed opacity-90">&ldquo;${escapeHtml(t.description || t.quote || "")}&rdquo;</p>
                        <footer class="text-xs opacity-75">
                          <strong class="opacity-100">${escapeHtml(t.title || t.name || "Client")}</strong>
                          ${t.subtitle || t.role ? ` · ${escapeHtml(t.subtitle || t.role)}` : ""}
                        </footer>
                      </blockquote>
                    `
                    )
                    .join("")}
                </div>`
              : `<div class="rounded-xl border border-dashed border-slate-500/30 p-5 text-xs opacity-75">No verified testimonials added to this section yet.</div>`
          }
        </div>
      `;
    }

    if (type === "faq") {
      return `
        <div class="space-y-5">
          <div class="${align}">${eyebrow}${heading}${subheading}</div>
          <div class="space-y-3">
            ${items
              .map(
                (qa) => `
                <details class="rounded-xl border border-slate-500/20 p-4 bg-slate-900/30">
                  <summary class="font-semibold text-sm cursor-pointer">${escapeHtml(qa.title || qa.question || "Question")}</summary>
                  <p class="text-xs sm:text-sm opacity-80 mt-2 leading-relaxed">${escapeHtml(qa.description || qa.answer || "")}</p>
                </details>
              `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    if (type === "logo_grid") {
      return `
        <div class="space-y-5">
          <div class="${align}">${eyebrow}${heading}${subheading}</div>
          <div class="${gridCls}" style="${gapStyle}">
            ${items
              .map(
                (lg) => `
                <div class="rounded-xl border border-slate-500/20 px-4 py-5 text-center bg-slate-900/30">
                  ${lg.imageUrl && isSafeUrl(lg.imageUrl) ? `<img src="${escapeHtml(lg.imageUrl)}" alt="${escapeHtml(lg.title)}" class="h-8 mx-auto mb-2 object-contain" referrerpolicy="no-referrer">` : ""}
                  <p class="text-sm font-bold">${escapeHtml(lg.title || "Partner")}</p>
                  ${lg.note ? `<p class="text-xs opacity-65 mt-0.5">${escapeHtml(lg.note)}</p>` : ""}
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    if (type === "contact") {
      return `
        <div class="rounded-2xl border border-slate-500/25 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="space-y-2 max-w-xl">
            ${eyebrow}${heading}${subheading}${bodyCopy}
            ${renderLinksHtml(c.links)}
          </div>
          <div class="shrink-0">${renderButtonsHtml(c.buttons, st.accentColor)}</div>
        </div>
      `;
    }

    // Standard grid / list sections (about, skills, services, projects, experience, blog, custom_content)
    const isList = layout.variant === "list";
    const itemsHtml = items.length
      ? `<div class="${isList ? "space-y-3" : gridCls}" style="${gapStyle}">
          ${items
            .map((it) => {
              const linkOpen = it.href && isSafeUrl(it.href) ? `<a href="${escapeHtml(it.href)}" class="text-xs font-semibold underline underline-offset-4 inline-block pt-1" style="color:${sanitizeCssColor(st.accentColor, "#818cf8")}">Explore &rarr;</a>` : "";
              return `
                <article class="rounded-xl border border-slate-500/20 p-5 bg-slate-900/35 space-y-2">
                  ${it.imageUrl && isSafeUrl(it.imageUrl) ? `<img src="${escapeHtml(it.imageUrl)}" alt="${escapeHtml(it.title || "")}" referrerpolicy="no-referrer" class="w-full h-36 object-cover rounded-lg mb-2 border border-slate-500/20">` : ""}
                  ${it.category ? `<p class="text-[11px] font-semibold uppercase tracking-wider opacity-70">${escapeHtml(it.category)}</p>` : ""}
                  <h3 class="text-base font-bold">${escapeHtml(it.title || "Item")}</h3>
                  ${it.subtitle ? `<p class="text-xs opacity-75 font-medium">${escapeHtml(it.subtitle)}</p>` : ""}
                  ${it.description ? `<p class="text-xs sm:text-sm opacity-80 leading-relaxed">${escapeHtml(it.description)}</p>` : ""}
                  ${linkOpen}
                </article>
              `;
            })
            .join("")}
        </div>`
      : "";

    const mainImage =
      c.imageUrl && isSafeUrl(c.imageUrl)
        ? `<img src="${escapeHtml(c.imageUrl)}" alt="${escapeHtml(c.imageAlt || section.title)}" referrerpolicy="no-referrer" class="w-full max-h-[360px] object-cover rounded-xl border border-slate-500/20">`
        : "";

    return `
      <div class="space-y-6">
        <div class="${align}">${eyebrow}${heading}${subheading}${bodyCopy}</div>
        ${mainImage}
        ${itemsHtml}
        ${renderButtonsHtml(c.buttons, st.accentColor)}
        ${renderLinksHtml(c.links)}
      </div>
    `;
  }

  function buildSectionWrapperStyle(section) {
    const st = section.style_config || {};
    const anim = section.animation_config || {};
    const styles = [];

    if (st.backgroundType === "solid") {
      styles.push(`background-color:${sanitizeCssColor(st.backgroundColor, "#0d1424")}`);
    } else if (st.backgroundType === "gradient") {
      const grad = sanitizeGradient(st.backgroundGradient);
      if (grad) styles.push(`background:${grad}`);
    } else if (st.backgroundType === "image" && isSafeUrl(st.backgroundImage)) {
      const safeCssImg = String(st.backgroundImage).trim().replace(/['"()\\;\s\r\n]/g, "");
      if (safeCssImg) {
        styles.push(
          `background-image:linear-gradient(rgba(5,8,22,0.72),rgba(5,8,22,0.72)),url('${escapeHtml(safeCssImg)}')`,
          "background-size:cover",
          "background-position:center"
        );
      }
    }

    if (st.textColor) styles.push(`color:${sanitizeCssColor(st.textColor, "inherit")}`);
    const padY = Math.max(16, Math.min(140, Number(st.paddingY) || 64));
    styles.push(`padding-top:${padY}px`, `padding-bottom:${padY}px`, "padding-left:16px", "padding-right:16px");
    const safeFont = String(st.bodyFont || "").replace(/[^a-zA-Z0-9\s-]/g, "").trim();
    if (safeFont) styles.push(`font-family:'${safeFont}',sans-serif`);
    if (anim.durationMs) styles.push(`--pb-anim-ms:${Math.max(100, Math.min(1500, Number(anim.durationMs)))}ms`);
    if (anim.delayMs) styles.push(`--pb-anim-delay:${Math.max(0, Math.min(1200, Number(anim.delayMs)))}ms`);
    return styles.join(";");
  }

  function buildVisibilityClasses(vis = {}, previewMode = "live") {
    const desktop = vis.desktop !== false;
    const tablet = vis.tablet !== false;
    const mobile = vis.mobile !== false;
    if (previewMode === "desktop") return desktop ? "" : "hidden";
    if (previewMode === "tablet") return tablet ? "" : "hidden";
    if (previewMode === "mobile") return mobile ? "" : "hidden";

    const cls = [];
    if (!mobile) cls.push("max-sm:hidden");
    if (!tablet) cls.push("sm:max-lg:hidden");
    if (!desktop) cls.push("lg:hidden");
    return cls.join(" ");
  }

  function renderSection(section, { previewMode = "live", interactive = false, selectedId = "" } = {}) {
    if (!section || !TYPE_SET.has(section.section_type)) return "";
    if (!interactive && section.enabled === false) return "";

    const st = section.style_config || {};
    const maxW = Math.max(640, Math.min(1600, Number(st.maxWidth) || 1200));
    const visCls = buildVisibilityClasses(section.visibility_config || {}, previewMode);
    const animPreset = (section.animation_config && section.animation_config.preset) || "none";
    const isSelected = interactive && String(selectedId) === String(section.id);

    const inner = renderSectionBody(section);
    const disabledNotice = interactive && section.enabled === false
      ? `<div class="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/35">Disabled on public site</div>`
      : "";

    const outlineCls = interactive
      ? `relative group cursor-pointer transition-all border ${isSelected ? "border-indigo-500 ring-2 ring-indigo-500/40" : "border-transparent hover:border-indigo-400/45"}`
      : "";

    return `
      <section
        id="pb-sec-${escapeHtml(section.section_key || section.id)}"
        data-pb-section-id="${escapeHtml(section.id)}"
        data-pb-section-type="${escapeHtml(section.section_type)}"
        data-pb-anim="${escapeHtml(animPreset)}"
        class="pb-rendered-section ${visCls} ${outlineCls}"
        style="${buildSectionWrapperStyle(section)}"
      >
        <div class="mx-auto" style="max-width:${maxW}px;">
          ${disabledNotice}
          ${inner}
        </div>
      </section>
    `;
  }

  function renderPage(sections = [], options = {}) {
    if (!Array.isArray(sections) || sections.length === 0) return "";
    return sections
      .slice()
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map((sec) => renderSection(sec, options))
      .join("\n");
  }

  window.PortfolioSectionRegistry = {
    SECTION_TYPES,
    TYPE_SET,
    escapeHtml,
    isSafeUrl,
    parseSafeVideoUrl,
    createDefaultSection,
    renderSection,
    renderPage
  };
})();
