/**
 * AL AMIN Admin CMS — Centralized Module Schemas (Phases 62–64)
 * Defines every Content, Pages & Features, and System CMS table schema,
 * field validation rules, preview labels, and security notices.
 */
(() => {
  const STATUS_OPTIONS = ["draft", "published", "scheduled", "archived"];

  const SCHEMAS = {
    // ------------------------------------------------------------------
    // CONTENT MODULES (Phase 62)
    // ------------------------------------------------------------------
    profile: {
      table: "profile",
      title: "Personal Profile",
      subtitle: "Manage personal bio, brand headline, availability, resume URL, and social links.",
      singleton: true,
      icon: "user-circle",
      fields: [
        { name: "name", label: "Display Name", type: "text", required: true },
        { name: "professional_title", label: "Professional Title", type: "text", required: true },
        { name: "short_bio", label: "Short Bio / Tagline", type: "textarea" },
        { name: "full_bio", label: "Full Bio", type: "textarea" },
        { name: "profile_image", label: "Profile Image URL / Media", type: "media", assetKind: "image" },
        { name: "location", label: "Location", type: "text" },
        { name: "email", label: "Public Contact Email", type: "email", required: true },
        { name: "phone", label: "Phone (optional)", type: "text" },
        { name: "availability_status", label: "Availability Status", type: "select", options: ["freelance", "projects", "remote", "busy"] },
        { name: "resume_url", label: "Resume Document URL / Media", type: "media", assetKind: "resume" },
        { name: "hero_headline", label: "Hero Headline", type: "text" },
        { name: "hero_description", label: "Hero Description", type: "textarea" },
        { name: "social_links", label: "Social Links (JSON Object)", type: "json" },
        { name: "cta_buttons", label: "Hero CTA Buttons (JSON Array)", type: "json" },
        { name: "status", label: "Visibility Status", type: "select", options: ["published", "draft"] }
      ]
    },

    projects: {
      table: "projects",
      title: "Projects",
      subtitle: "Manage portfolio projects, case studies, image galleries, and publish status.",
      icon: "folder-kanban",
      titleField: "title",
      slugField: "slug",
      searchColumns: ["title", "slug", "category", "short_description"],
      categoryColumn: "category",
      categories: ["SaaS", "E-commerce", "Dashboard", "UI/UX", "Web Apps"],
      allowDuplicate: true,
      columns: [
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "year", label: "Year" },
        { key: "featured", label: "Featured", type: "boolean" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "title", label: "Project Title", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", required: true },
        { name: "category", label: "Category", type: "select", options: ["SaaS", "E-commerce", "Dashboard", "UI/UX", "Web Apps"] },
        { name: "project_type", label: "Project Type", type: "text" },
        { name: "development_role", label: "Development Role", type: "text" },
        { name: "year", label: "Year", type: "text" },
        { name: "short_description", label: "Short Description", type: "textarea" },
        { name: "full_description", label: "Full Case Study Description", type: "textarea" },
        { name: "technologies", label: "Technologies (comma-separated or JSON array)", type: "tags" },
        { name: "thumbnail", label: "Primary Thumbnail", type: "media", assetKind: "image" },
        { name: "images", label: "Project Gallery Images (JSON Array of URLs)", type: "json" },
        { name: "live_demo_url", label: "Live Demo URL", type: "url" },
        { name: "github_url", label: "GitHub URL", type: "url" },
        { name: "features", label: "Key Features (JSON Array)", type: "json" },
        { name: "challenges", label: "Technical Challenges (JSON Array)", type: "json" },
        { name: "solutions", label: "Engineering Solutions (JSON Array)", type: "json" },
        { name: "architecture", label: "Architecture Notes (JSON Object)", type: "json" },
        { name: "seo_title", label: "SEO Title", type: "text" },
        { name: "seo_description", label: "SEO Description", type: "textarea" },
        { name: "display_order", label: "Display Order", type: "number" },
        { name: "featured", label: "Featured on Home", type: "checkbox" },
        { name: "status", label: "Publish Status", type: "select", options: STATUS_OPTIONS },
        { name: "publish_at", label: "Scheduled Publish At (ISO timestamp)", type: "datetime" }
      ]
    },

    skills: {
      table: "skills",
      title: "Skills & Technologies",
      subtitle: "Organize frontend, backend, database, and tooling capabilities.",
      icon: "cpu",
      titleField: "name",
      searchColumns: ["name", "category", "description"],
      categoryColumn: "category",
      categories: ["Frontend", "Backend", "Database", "UI/UX", "Tools"],
      columns: [
        { key: "name", label: "Skill" },
        { key: "category", label: "Category" },
        { key: "proficiency_level", label: "Level" },
        { key: "display_order", label: "Order" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "name", label: "Skill Name", type: "text", required: true },
        { name: "category", label: "Category", type: "select", options: ["Frontend", "Backend", "Database", "UI/UX", "Tools"] },
        { name: "proficiency_level", label: "Proficiency Label", type: "select", options: ["Core", "Production", "Active", "Learning"] },
        { name: "icon", label: "Lucide Icon Key", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "related_projects", label: "Related Project Slugs (JSON Array)", type: "json" },
        { name: "display_order", label: "Display Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    services: {
      table: "services",
      title: "Services",
      subtitle: "Configure engineering service cards, feature lists, and optional pricing metadata.",
      icon: "layers",
      titleField: "title",
      slugField: "slug",
      searchColumns: ["title", "slug", "description"],
      columns: [
        { key: "title", label: "Service" },
        { key: "slug", label: "Slug" },
        { key: "featured", label: "Featured", type: "boolean" },
        { key: "display_order", label: "Order" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "title", label: "Service Title", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", required: true },
        { name: "icon", label: "Lucide Icon", type: "text" },
        { name: "description", label: "Summary Description", type: "textarea" },
        { name: "features", label: "Features (JSON Array)", type: "json" },
        { name: "technology", label: "Technologies (comma-separated or JSON array)", type: "tags" },
        { name: "pricing_config", label: "Optional Pricing Config (JSON Object)", type: "json" },
        { name: "display_order", label: "Display Order", type: "number" },
        { name: "featured", label: "Featured Service", type: "checkbox" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    experiences: {
      table: "experiences",
      title: "Experience Timeline",
      subtitle: "Manage work experience, freelance milestones, education, and learning timeline.",
      icon: "briefcase",
      titleField: "position",
      searchColumns: ["position", "company", "section", "description"],
      categoryColumn: "section",
      categories: ["Work Experience", "Freelance", "Education", "Learning Journey"],
      columns: [
        { key: "position", label: "Role / Title" },
        { key: "company", label: "Organization" },
        { key: "section", label: "Section" },
        { key: "start_date", label: "Start" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "position", label: "Position / Role", type: "text", required: true },
        { name: "company", label: "Organization / Company", type: "text", required: true },
        { name: "section", label: "Timeline Section", type: "select", options: ["Work Experience", "Freelance", "Education", "Learning Journey"] },
        { name: "employment_type", label: "Employment Type", type: "select", options: ["Full-Time", "Freelance", "Contract", "Academic", "Self-Directed"] },
        { name: "start_date", label: "Start Date", type: "text" },
        { name: "end_date", label: "End Date (or Present)", type: "text" },
        { name: "is_current", label: "Current Role", type: "checkbox" },
        { name: "description", label: "Summary", type: "textarea" },
        { name: "responsibilities", label: "Responsibilities (JSON Array)", type: "json" },
        { name: "technologies", label: "Technologies (JSON Array)", type: "json" },
        { name: "display_order", label: "Display Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    certificates: {
      table: "certificates",
      title: "Certificates",
      subtitle: "Manage verified technical certificates, credential IDs, and downloadable images.",
      icon: "award",
      titleField: "title",
      searchColumns: ["title", "issuer", "credential_id", "category"],
      categoryColumn: "category",
      categories: ["Full-Stack", "Frontend", "Backend", "UI/UX"],
      columns: [
        { key: "title", label: "Certificate" },
        { key: "issuer", label: "Issuer" },
        { key: "credential_id", label: "Credential ID" },
        { key: "issue_date", label: "Date" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "title", label: "Certificate Title", type: "text", required: true },
        { name: "category", label: "Category", type: "select", options: ["Full-Stack", "Frontend", "Backend", "UI/UX"] },
        { name: "issuer", label: "Issuer", type: "text" },
        { name: "issue_date", label: "Issue Date", type: "text" },
        { name: "expiration_date", label: "Expiration Date", type: "text" },
        { name: "credential_id", label: "Credential ID", type: "text" },
        { name: "verification_url", label: "Verification URL (only if real)", type: "url" },
        { name: "certificate_image", label: "Certificate Image / SVG", type: "media", assetKind: "certificate" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "skills", label: "Covered Skills (JSON Array)", type: "json" },
        { name: "display_order", label: "Display Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    blog_posts: {
      table: "blog_posts",
      title: "Blog & Engineering Notes",
      subtitle: "Write, sanitize-preview, schedule, and publish technical articles.",
      icon: "file-text",
      titleField: "title",
      slugField: "slug",
      searchColumns: ["title", "slug", "category", "excerpt"],
      categoryColumn: "category",
      categories: ["Web Development", "System Design", "Frontend", "Backend", "DevOps"],
      customEditor: "blog",
      allowDuplicate: true,
      columns: [
        { key: "title", label: "Article Title" },
        { key: "category", label: "Category" },
        { key: "reading_time", label: "Read Time" },
        { key: "publication_date", label: "Date" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "title", label: "Post Title", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", required: true },
        { name: "category", label: "Category", type: "select", options: ["Web Development", "System Design", "Frontend", "Backend", "DevOps"] },
        { name: "author", label: "Author", type: "text" },
        { name: "publication_date", label: "Publication Date Label", type: "text" },
        { name: "reading_time", label: "Reading Time", type: "text" },
        { name: "cover_image", label: "Cover Image", type: "media", assetKind: "image" },
        { name: "excerpt", label: "Excerpt", type: "textarea" },
        { name: "content", label: "Article Body (Sanitized HTML Preview Enabled)", type: "textarea" },
        { name: "tags", label: "Tags (comma-separated or JSON array)", type: "tags" },
        { name: "seo_title", label: "SEO Title", type: "text" },
        { name: "meta_description", label: "Meta Description", type: "textarea" },
        { name: "related_slugs", label: "Related Post Slugs (JSON Array)", type: "json" },
        { name: "status", label: "Publish Status", type: "select", options: STATUS_OPTIONS },
        { name: "publish_at", label: "Scheduled Publish At (ISO timestamp)", type: "datetime" }
      ]
    },

    testimonials: {
      table: "testimonials",
      title: "Testimonials",
      subtitle: "Manage verified client feedback. Never invent fake client reviews; mark demo items or keep empty until real reviews exist.",
      icon: "message-square-quote",
      titleField: "client_name",
      searchColumns: ["client_name", "company", "testimonial_text"],
      notice: "Integrity rule: Never publish fabricated testimonials. Only publish genuine client reviews or explicitly mark demo placeholders.",
      columns: [
        { key: "client_name", label: "Client" },
        { key: "company", label: "Company" },
        { key: "rating", label: "Rating" },
        { key: "is_demo", label: "Demo?", type: "boolean" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "client_name", label: "Client Name", type: "text", required: true },
        { name: "client_role", label: "Role / Title", type: "text" },
        { name: "company", label: "Company", type: "text" },
        { name: "client_image", label: "Client Avatar", type: "media", assetKind: "image" },
        { name: "testimonial_text", label: "Testimonial Quote", type: "textarea", required: true },
        { name: "rating", label: "Rating (1–5)", type: "number" },
        { name: "project_reference", label: "Project Reference", type: "text" },
        { name: "is_demo", label: "Mark as Demo Placeholder", type: "checkbox" },
        { name: "display_order", label: "Display Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    faqs: {
      table: "faqs",
      title: "FAQ",
      subtitle: "Manage structured questions and answers for Services and Contact pages.",
      icon: "help-circle",
      titleField: "question",
      searchColumns: ["question", "answer", "category"],
      categoryColumn: "category",
      categories: ["General", "Projects", "Tech Stack", "Pricing & Process"],
      columns: [
        { key: "question", label: "Question" },
        { key: "category", label: "Category" },
        { key: "display_order", label: "Order" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "question", label: "Question", type: "text", required: true },
        { name: "answer", label: "Answer", type: "textarea", required: true },
        { name: "category", label: "Category", type: "select", options: ["General", "Projects", "Tech Stack", "Pricing & Process"] },
        { name: "display_order", label: "Display Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    social_links: {
      table: "social_links",
      title: "Social Links",
      subtitle: "Control social platforms, URLs, display order, and visibility.",
      icon: "share-2",
      titleField: "platform",
      searchColumns: ["platform", "url"],
      columns: [
        { key: "platform", label: "Platform" },
        { key: "url", label: "URL" },
        { key: "visible", label: "Visible", type: "boolean" },
        { key: "display_order", label: "Order" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "platform", label: "Platform Name", type: "text", required: true },
        { name: "url", label: "Profile URL", type: "url" },
        { name: "icon", label: "Lucide Icon", type: "text" },
        { name: "visible", label: "Visible on Public Site", type: "checkbox" },
        { name: "display_order", label: "Display Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    // ------------------------------------------------------------------
    // PAGES & FEATURE MANAGEMENT MODULES (Phase 63)
    // ------------------------------------------------------------------
    site_pages: {
      table: "site_pages",
      title: "Page Manager",
      subtitle: "Control page visibility, navigation inclusion, and page-level SEO metadata. Core system pages are protected from accidental deletion.",
      icon: "file-cog",
      titleField: "title",
      slugField: "slug",
      searchColumns: ["title", "slug", "description"],
      columns: [
        { key: "title", label: "Page" },
        { key: "slug", label: "Path / Slug" },
        { key: "visible", label: "Visible", type: "boolean" },
        { key: "is_system", label: "System Protected", type: "boolean" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "title", label: "Page Title", type: "text", required: true },
        { name: "slug", label: "Filename / Slug (e.g. projects.html)", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "visible", label: "Page Visible", type: "checkbox" },
        { name: "nav_visible", label: "Show in Navigation", type: "checkbox" },
        { name: "is_system", label: "System Page Protected", type: "checkbox" },
        { name: "seo_title", label: "SEO Title", type: "text" },
        { name: "seo_description", label: "SEO Description", type: "textarea" },
        { name: "display_order", label: "Display Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    navigation_items: {
      table: "navigation_items",
      title: "Navigation Manager",
      subtitle: "Manage main navigation, footer links, dropdown items, and external link flags.",
      icon: "menu",
      titleField: "label",
      searchColumns: ["label", "href", "placement"],
      categoryColumn: "placement",
      categories: ["main", "footer", "dropdown"],
      columns: [
        { key: "label", label: "Label" },
        { key: "href", label: "Destination" },
        { key: "placement", label: "Placement" },
        { key: "visible", label: "Visible", type: "boolean" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "label", label: "Link Label", type: "text", required: true },
        { name: "href", label: "Target Path / URL", type: "text", required: true },
        { name: "placement", label: "Placement", type: "select", options: ["main", "footer", "dropdown"] },
        { name: "icon", label: "Lucide Icon", type: "text" },
        { name: "parent_label", label: "Parent Group Label (if dropdown)", type: "text" },
        { name: "is_external", label: "Opens External Site", type: "checkbox" },
        { name: "visible", label: "Visible", type: "checkbox" },
        { name: "display_order", label: "Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    office_areas: {
      table: "office_areas",
      title: "Digital Office",
      subtitle: "Configure interactive studio stations and destination portfolio routes.",
      icon: "building-2",
      titleField: "area_name",
      searchColumns: ["area_name", "object_name", "description"],
      columns: [
        { key: "area_name", label: "Station / Area" },
        { key: "object_name", label: "Object" },
        { key: "destination_url", label: "Destination" },
        { key: "visible", label: "Visible", type: "boolean" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "area_name", label: "Area Name", type: "text", required: true },
        { name: "object_name", label: "Interactive Object", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "icon", label: "Lucide Icon", type: "text" },
        { name: "image_url", label: "Station Image", type: "media", assetKind: "image" },
        { name: "destination_url", label: "Destination Page URL", type: "text" },
        { name: "visible", label: "Visible", type: "checkbox" },
        { name: "display_order", label: "Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    workspace_objects: {
      table: "workspace_objects",
      title: "3D Workspace",
      subtitle: "Configure 3D studio objects, coordinates, descriptions, and destination links.",
      icon: "box",
      titleField: "object_name",
      slugField: "object_key",
      searchColumns: ["object_name", "object_key", "description"],
      columns: [
        { key: "object_name", label: "3D Object" },
        { key: "object_key", label: "Key" },
        { key: "destination_url", label: "Destination" },
        { key: "visible", label: "Visible", type: "boolean" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "object_key", label: "Unique Object Key", type: "text", required: true },
        { name: "object_name", label: "Object Name", type: "text", required: true },
        { name: "description", label: "Inspection Description", type: "textarea" },
        { name: "position_x", label: "Position X", type: "number" },
        { name: "position_y", label: "Position Y", type: "number" },
        { name: "position_z", label: "Position Z", type: "number" },
        { name: "destination_url", label: "Destination URL", type: "text" },
        { name: "visible", label: "Visible", type: "checkbox" },
        { name: "display_order", label: "Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    tour_steps: {
      table: "tour_steps",
      title: "Portfolio Tour",
      subtitle: "Manage guided portfolio tour steps, hotspot labels, order, and links.",
      icon: "compass",
      titleField: "step_title",
      searchColumns: ["step_title", "tour_title", "hotspot_label"],
      columns: [
        { key: "step_order", label: "Step #" },
        { key: "step_title", label: "Step Title" },
        { key: "hotspot_label", label: "Hotspot" },
        { key: "destination_url", label: "Link" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "tour_title", label: "Tour Title", type: "text" },
        { name: "tour_description", label: "Tour Description", type: "textarea" },
        { name: "step_order", label: "Step Order", type: "number", required: true },
        { name: "step_title", label: "Step Title", type: "text", required: true },
        { name: "step_description", label: "What Visitor Sees & Why It Matters", type: "textarea" },
        { name: "hotspot_label", label: "Hotspot Label", type: "text" },
        { name: "step_image", label: "Step Preview Image", type: "media", assetKind: "image" },
        { name: "destination_url", label: "Portfolio Page Link", type: "text" },
        { name: "visible", label: "Visible", type: "checkbox" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    career_knowledge: {
      table: "career_knowledge",
      title: "Career Assistant",
      subtitle: "Maintain grounded Q&A entries used by career-assistant.html without external LLM secrets.",
      icon: "bot",
      titleField: "question",
      searchColumns: ["question", "answer", "category"],
      columns: [
        { key: "question", label: "Question" },
        { key: "category", label: "Category" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "question", label: "Prompt / Question", type: "text", required: true },
        { name: "answer", label: "Verified Portfolio Answer", type: "textarea", required: true },
        { name: "category", label: "Category", type: "text" },
        { name: "keywords", label: "Match Keywords (JSON Array)", type: "json" },
        { name: "related_projects", label: "Related Project Slugs (JSON Array)", type: "json" },
        { name: "related_skills", label: "Related Skills (JSON Array)", type: "json" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    requirement_rules: {
      table: "requirement_rules",
      title: "Requirement Analyzer",
      subtitle: "Manage local rule-based detection rules for client project briefs.",
      icon: "clipboard-list",
      titleField: "label",
      searchColumns: ["label", "rule_key", "rule_type"],
      categoryColumn: "rule_type",
      categories: ["category", "technology", "feature", "complexity", "risk", "phase"],
      columns: [
        { key: "label", label: "Rule Label" },
        { key: "rule_type", label: "Rule Type" },
        { key: "rule_key", label: "Key" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "rule_type", label: "Rule Type", type: "select", options: ["category", "technology", "feature", "complexity", "risk", "phase"] },
        { name: "rule_key", label: "Rule Key", type: "text", required: true },
        { name: "label", label: "Display Label", type: "text", required: true },
        { name: "keywords", label: "Trigger Keywords (JSON Array)", type: "json" },
        { name: "config_payload", label: "Recommendation Payload (JSON Object)", type: "json" },
        { name: "display_order", label: "Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    resume_matcher_rules: {
      table: "resume_matcher_rules",
      title: "Resume Matcher",
      subtitle: "Configure transparent keyword-to-skill matching weights without inventing experience.",
      icon: "file-check-2",
      titleField: "keyword",
      searchColumns: ["keyword", "explanation"],
      columns: [
        { key: "keyword", label: "Keyword" },
        { key: "weight", label: "Weight" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "keyword", label: "Target Keyword", type: "text", required: true },
        { name: "weight", label: "Scoring Weight", type: "number" },
        { name: "related_skills", label: "Related Skills (JSON Array)", type: "json" },
        { name: "related_projects", label: "Related Projects (JSON Array)", type: "json" },
        { name: "explanation", label: "Scoring Explanation", type: "textarea" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    project_recommendations: {
      table: "project_recommendations",
      title: "Recommendations",
      subtitle: "Configure project matching tags, weights, and related case study suggestions.",
      icon: "sparkles",
      titleField: "project_slug",
      searchColumns: ["project_slug", "category"],
      columns: [
        { key: "project_slug", label: "Project Slug" },
        { key: "category", label: "Category" },
        { key: "weight", label: "Weight" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "project_slug", label: "Project Slug", type: "text", required: true },
        { name: "category", label: "Category", type: "text" },
        { name: "weight", label: "Weight", type: "number" },
        { name: "recommendation_tags", label: "Recommendation Tags (JSON Array)", type: "json" },
        { name: "related_projects", label: "Related Project Slugs (JSON Array)", type: "json" },
        { name: "technologies", label: "Technologies (JSON Array)", type: "json" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    project_dependencies: {
      table: "project_dependencies",
      title: "Dependency Map",
      subtitle: "Manage verified project dependency layers (Frontend, Backend, DB, Auth, Storage, APIs, Deployment, Security).",
      icon: "git-branch",
      titleField: "project_title",
      slugField: "project_slug",
      searchColumns: ["project_title", "project_slug"],
      columns: [
        { key: "project_title", label: "Project" },
        { key: "project_slug", label: "Slug" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "project_slug", label: "Project Slug", type: "text", required: true },
        { name: "project_title", label: "Project Title", type: "text", required: true },
        { name: "frontend", label: "Frontend (JSON Array)", type: "json" },
        { name: "backend", label: "Backend (JSON Array)", type: "json" },
        { name: "database_layer", label: "Database Layer (JSON Array)", type: "json" },
        { name: "authentication", label: "Authentication (JSON Array)", type: "json" },
        { name: "storage", label: "Storage (JSON Array)", type: "json" },
        { name: "apis", label: "APIs (JSON Array)", type: "json" },
        { name: "deployment", label: "Deployment (JSON Array)", type: "json" },
        { name: "security", label: "Security (JSON Array)", type: "json" },
        { name: "display_order", label: "Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    github_settings: {
      table: "github_settings",
      title: "GitHub Config",
      subtitle: "Configure public GitHub username, featured repos, fork filtering, and cache TTL (never stores tokens).",
      singleton: true,
      icon: "github",
      fields: [
        { name: "username", label: "Public GitHub Username", type: "text", required: true },
        { name: "visibility_mode", label: "Visibility Mode", type: "select", options: ["public_only", "featured_only"] },
        { name: "featured_repos", label: "Featured Repositories (JSON Array)", type: "json" },
        { name: "hidden_repos", label: "Hidden Repositories (JSON Array)", type: "json" },
        { name: "exclude_forks", label: "Exclude Forked Repositories", type: "checkbox" },
        { name: "display_limit", label: "Display Limit", type: "number" },
        { name: "cache_minutes", label: "Cache Duration (minutes)", type: "number" },
        { name: "status", label: "Status", type: "select", options: ["published", "draft"] }
      ]
    },

    coding_activity_settings: {
      table: "coding_activity_settings",
      title: "Coding Activity",
      subtitle: "Configure public GitHub event feed types, repository filters, and refresh intervals.",
      singleton: true,
      icon: "activity",
      fields: [
        { name: "display_enabled", label: "Show Live Public Coding Activity", type: "checkbox" },
        { name: "event_types", label: "Enabled Event Types (JSON Array)", type: "json" },
        { name: "repo_filters", label: "Included Repos Filter (JSON Array, empty = all)", type: "json" },
        { name: "refresh_interval_sec", label: "Refresh Interval (seconds)", type: "number" },
        { name: "display_limit", label: "Max Events Displayed", type: "number" },
        { name: "status", label: "Status", type: "select", options: ["published", "draft"] }
      ]
    },

    terminal_commands: {
      table: "terminal_commands",
      title: "Terminal Commands",
      subtitle: "Define safe declarative CLI responses, aliases, and route navigation commands (no dynamic shell execution).",
      icon: "terminal",
      titleField: "command",
      searchColumns: ["command", "description", "alias"],
      columns: [
        { key: "command", label: "Command" },
        { key: "response_type", label: "Type" },
        { key: "alias", label: "Alias" },
        { key: "visible", label: "Visible", type: "boolean" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "command", label: "Command Keyword", type: "text", required: true },
        { name: "alias", label: "Alias", type: "text" },
        { name: "description", label: "Help Description", type: "text" },
        { name: "response_type", label: "Safe Response Type", type: "select", options: ["text", "route", "list", "action"] },
        { name: "response_payload", label: "Response Text / Items", type: "textarea" },
        { name: "destination_url", label: "Destination URL (if route)", type: "text" },
        { name: "visible", label: "Visible in Help", type: "checkbox" },
        { name: "display_order", label: "Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    technologies: {
      table: "technologies",
      title: "Technology Radar",
      subtitle: "Manage Tech Radar quadrants and rings backed strictly by configured portfolio data.",
      icon: "radar",
      titleField: "name",
      searchColumns: ["name", "quadrant", "ring", "description"],
      categoryColumn: "quadrant",
      categories: ["Frontend", "Backend", "Database", "DevOps / Tools"],
      columns: [
        { key: "name", label: "Technology" },
        { key: "quadrant", label: "Quadrant" },
        { key: "ring", label: "Ring" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "name", label: "Technology Name", type: "text", required: true },
        { name: "quadrant", label: "Quadrant", type: "select", options: ["Frontend", "Backend", "Database", "DevOps / Tools"] },
        { name: "ring", label: "Ring", type: "select", options: ["Core", "Active", "Learning", "Exploring"] },
        { name: "description", label: "Notes / Description", type: "textarea" },
        { name: "related_projects", label: "Related Projects (JSON Array)", type: "json" },
        { name: "related_skills", label: "Related Skills (JSON Array)", type: "json" },
        { name: "display_order", label: "Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    learning_items: {
      table: "learning_items",
      title: "Learning Roadmap",
      subtitle: "Track Completed, Active, Planned, and Exploring developer learning goals cleanly.",
      icon: "map",
      titleField: "technology",
      searchColumns: ["technology", "category", "current_status", "learning_objective"],
      categoryColumn: "current_status",
      categories: ["Completed", "Active", "Planned", "Exploring"],
      columns: [
        { key: "technology", label: "Technology" },
        { key: "category", label: "Category" },
        { key: "current_status", label: "Progress Stage" },
        { key: "progress", label: "%" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "technology", label: "Technology", type: "text", required: true },
        { name: "category", label: "Category", type: "text" },
        { name: "current_status", label: "Roadmap Stage", type: "select", options: ["Completed", "Active", "Planned", "Exploring"] },
        { name: "progress", label: "Optional Progress % (leave blank if unconfigured)", type: "number" },
        { name: "related_project", label: "Related Project Name", type: "text" },
        { name: "related_project_id", label: "Related Project Slug", type: "text" },
        { name: "learning_objective", label: "Learning Objective", type: "textarea" },
        { name: "resources", label: "Verified Resources (JSON Array of {label,url})", type: "json" },
        { name: "notes", label: "Notes", type: "textarea" },
        { name: "display_order", label: "Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    coding_challenges: {
      table: "coding_challenges",
      title: "Coding Challenge Lab",
      subtitle: "Manage interactive sandboxed browser challenges. Challenges execute strictly in sandboxed srcdoc iframes.",
      icon: "code-2",
      titleField: "title",
      slugField: "slug",
      searchColumns: ["title", "slug", "category", "difficulty"],
      categoryColumn: "category",
      categories: ["HTML", "CSS", "JavaScript"],
      columns: [
        { key: "title", label: "Challenge" },
        { key: "category", label: "Track" },
        { key: "difficulty", label: "Level" },
        { key: "visible", label: "Visible", type: "boolean" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "title", label: "Challenge Title", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", required: true },
        { name: "category", label: "Track", type: "select", options: ["HTML", "CSS", "JavaScript"] },
        { name: "difficulty", label: "Difficulty Label", type: "select", options: ["Starter", "Core", "Intermediate"] },
        { name: "description", label: "Problem Description", type: "textarea" },
        { name: "starter_html", label: "Starter HTML", type: "textarea" },
        { name: "starter_css", label: "Starter CSS", type: "textarea" },
        { name: "starter_js", label: "Starter JavaScript", type: "textarea" },
        { name: "hints", label: "Hints (JSON Array)", type: "json" },
        { name: "test_cases", label: "Test Cases (JSON Array)", type: "json" },
        { name: "solution_code", label: "Reference Solution", type: "textarea" },
        { name: "solution_explanation", label: "Explanation", type: "textarea" },
        { name: "visible", label: "Visible", type: "checkbox" },
        { name: "display_order", label: "Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    achievements: {
      table: "achievements",
      title: "Achievements",
      subtitle: "Manage verified technical achievements, milestones, and credential metadata.",
      icon: "trophy",
      titleField: "title",
      searchColumns: ["title", "issuer", "credential_id", "category"],
      columns: [
        { key: "title", label: "Achievement" },
        { key: "category", label: "Category" },
        { key: "issuer", label: "Issuer" },
        { key: "achieved_date", label: "Date" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "title", label: "Achievement Title", type: "text", required: true },
        { name: "category", label: "Category", type: "text" },
        { name: "issuer", label: "Issuer / Body", type: "text" },
        { name: "achieved_date", label: "Date", type: "text" },
        { name: "credential_id", label: "Credential ID", type: "text" },
        { name: "verification_url", label: "Verification URL (real links only)", type: "url" },
        { name: "badge_image", label: "Badge / Certificate Media", type: "media", assetKind: "certificate" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_verified", label: "Verified Credential", type: "checkbox" },
        { name: "display_order", label: "Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    system_endpoints: {
      table: "system_endpoints",
      title: "System Monitor",
      subtitle: "Configure real endpoints monitored via browser-verifiable fetch latency checks in system-monitor.html.",
      icon: "activity",
      titleField: "label",
      searchColumns: ["label", "url", "category"],
      columns: [
        { key: "label", label: "Endpoint Label" },
        { key: "url", label: "URL / Path" },
        { key: "category", label: "Category" },
        { key: "enabled", label: "Enabled", type: "boolean" },
        { key: "status", label: "Status", type: "status" }
      ],
      fields: [
        { name: "label", label: "Endpoint Label", type: "text", required: true },
        { name: "url", label: "URL / Relative Path", type: "text", required: true },
        { name: "category", label: "Category", type: "select", options: ["Portfolio Pages", "Static Assets", "Public APIs", "Configured Endpoint"] },
        { name: "check_interval_sec", label: "Check Interval (sec)", type: "number" },
        { name: "enabled", label: "Monitoring Enabled", type: "checkbox" },
        { name: "display_order", label: "Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS }
      ]
    },

    // ------------------------------------------------------------------
    // SYSTEM MODULES (Phase 64)
    // ------------------------------------------------------------------
    website_settings: {
      table: "website_settings",
      title: "Website Settings",
      subtitle: "Configure site identity, footer copy, default theme, and maintenance notice mode.",
      singleton: true,
      icon: "sliders",
      fields: [
        { name: "website_name", label: "Website Name", type: "text", required: true },
        { name: "tagline", label: "Site Tagline", type: "text" },
        { name: "website_logo", label: "Logo URL / SVG", type: "media", assetKind: "image" },
        { name: "favicon", label: "Favicon URL", type: "media", assetKind: "image" },
        { name: "default_theme", label: "Default Theme", type: "select", options: ["dark", "light"] },
        { name: "default_language", label: "Language Code", type: "text" },
        { name: "contact_email", label: "Primary Contact Email", type: "email" },
        { name: "footer_text", label: "Footer Tagline", type: "textarea" },
        { name: "copyright_text", label: "Copyright Line", type: "text" },
        { name: "maintenance_mode", label: "Show Maintenance Banner on Public Site", type: "checkbox" },
        { name: "status", label: "Status", type: "select", options: ["published", "draft"] }
      ]
    },

    seo_settings: {
      table: "website_settings",
      title: "SEO Manager",
      subtitle: "Configure global Open Graph metadata, default social share image, canonical base, and robots directives.",
      singleton: true,
      icon: "search-check",
      jsonContainerField: "seo_config",
      fields: [
        { name: "default_seo_title", label: "Default SEO Title", type: "text" },
        { name: "default_meta_description", label: "Default Meta Description", type: "textarea" },
        { name: "canonical_base_url", label: "Canonical Base URL (e.g. https://yourdomain.com/)", type: "url" },
        { name: "og_image", label: "Default Open Graph Image URL", type: "text" },
        { name: "twitter_card", label: "Twitter Card Type", type: "select", options: ["summary_large_image", "summary"] },
        { name: "robots_directive", label: "Default Robots Meta", type: "select", options: ["index, follow", "noindex, nofollow"] }
      ]
    },

    theme_settings: {
      table: "website_settings",
      title: "Theme Manager",
      subtitle: "Adjust CSS variable accent colors, animation toggles, and font family configuration.",
      singleton: true,
      icon: "palette",
      fields: [
        { name: "primary_color", label: "Primary Color (Hex)", type: "color" },
        { name: "secondary_color", label: "Secondary Color (Hex)", type: "color" },
        { name: "accent_color", label: "Accent Cyan (Hex)", type: "color" },
        { name: "default_theme", label: "Default Public Theme", type: "select", options: ["dark", "light"] },
        { name: "theme_config", label: "Extended Theme Tokens (JSON Object)", type: "json" }
      ]
    },

    contact_submissions: {
      table: "contact_submissions",
      title: "Contact Messages",
      subtitle: "Review visitor inquiries stored safely behind Supabase RLS. Export verified leads to CSV.",
      icon: "mail",
      customModule: "contacts"
    },

    media_library: {
      table: "media_assets",
      title: "Media Library",
      subtitle: "Upload validated images, certificates, and PDFs to Supabase Storage with usage reference checks.",
      icon: "images",
      customModule: "media"
    },

    security_settings: {
      table: "security_events",
      title: "Security & Sessions",
      subtitle: "Inspect active session verification, DB RLS status, and recent security events.",
      icon: "shield-check",
      customModule: "security"
    },

    audit_logs: {
      table: "admin_audit_logs",
      title: "Audit Log",
      subtitle: "Immutable trail of admin creates, updates, deletions, media operations, and backups.",
      icon: "scroll-text",
      customModule: "audit"
    },

    backup_restore: {
      table: "website_settings",
      title: "Backup & Restore",
      subtitle: "Export JSON content snapshots or validate and restore content without silent overwrites.",
      icon: "hard-drive-download",
      customModule: "backup"
    }
  };

  window.AdminSchemas = {
    STATUS_OPTIONS,
    SCHEMAS,
    getSchema: (routeKey) => SCHEMAS[routeKey] || null
  };
})();
