/**
 * AL AMIN Portfolio — Projects Catalog, Filters, Search & Agency Case Studies (Phase 1 + 3 + 6 + 15)
 * Centralized single source of truth for all project archive & case study data.
 */

const PortfolioProjects = (() => {
  const categories = [
    "All",
    "Web Apps",
    "MERN",
    "SaaS",
    "E-commerce",
    "Dashboard",
    "UI/UX"
  ];

  const projectsData = [
    {
      id: "astrapulse",
      slug: "astrapulse",
      title: "AstraPulse",
      category: "SaaS",
      projectType: "Full-Stack Web Application",
      developmentRole: "Lead Full-Stack MERN Developer",
      filterCategories: ["SaaS", "Dashboard", "MERN", "Web Apps"],
      year: "2026",
      status: "Active Iteration",
      duration: "8 Weeks",
      featured: true,
      description:
        "Real-time full-stack telemetry and product analytics workspace built for engineering teams to monitor API latency, funnels, and uptime.",
      longDescription:
        "AstraPulse is a multi-workspace observability and SaaS analytics platform engineered to surface API latency trends, regional traffic distribution, and service health in one unified control center.",
      overview:
        "AstraPulse was designed as a unified developer observability console replacing fragmented monitoring tabs. It brings endpoint health, error diagnostics, workspace permissions, and regional event trends together inside a crisp, responsive dark-mode-first interface.",
      image: "assets/images/projects/astrapulse.jpg",
      gallery: [
        {
          src: "assets/images/projects/astrapulse.jpg",
          caption: "AstraPulse — Global latency, throughput & uptime telemetry overview"
        },
        {
          src: "assets/images/projects/ecommerce-saas.jpg",
          caption: "AstraPulse — Funnel conversion & regional event stream diagnostics"
        },
        {
          src: "assets/images/projects/school-management.jpg",
          caption: "AstraPulse — Tabular workspace audit logs & role access grid"
        }
      ],
      technologies: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "REST API"],
      problem:
        "Growing engineering teams often split latency tracking, error rates, and funnel analytics across disconnected tools with slow, cluttered dashboards that break on smaller viewports.",
      goals: [
        "Consolidate request latency, error streams, and service health into one predictable workspace",
        "Keep multi-metric tables and chart grids scannable from 320px mobile screens to wide desktop monitors",
        "Maintain sub-second query responsiveness on rolling 24-hour telemetry aggregations",
        "Enforce clean workspace isolation with role-based access control"
      ],
      researchPlanning: [
        "Audited common developer observability dashboards to eliminate redundant navigation chrome and floating scorecards",
        "Mapped primary developer triage flows: Anomaly detection -> Endpoint isolation -> Payload/log inspection",
        "Planned time-bucketed MongoDB aggregation pipelines before implementing UI components"
      ],
      userRequirements: [
        "Workspace admins need invite controls and per-environment alert thresholds",
        "Engineers need instant time-window presets (1h, 24h, 7d) and endpoint search",
        "On-call developers need readable alert views directly on mobile devices"
      ],
      designStrategy:
        "Adopted a single-elevation dark slate canvas with subtle 1px structural borders, strict tabular numerals across every latency metric, and cyan/indigo semantic contrast reserved strictly for interactive signals and health states.",
      architecture:
        "Modular React client communicating with an Express REST & streaming layer backed by MongoDB time-series documents and JWT workspace authentication.",
      systemArchitecture: {
        frontend: {
          title: "React + Tailwind SPA",
          tech: "React, Tailwind CSS, Tabular UI",
          description: "Component-driven telemetry dashboard with responsive chart wrappers, instant filter state, and zero-CLS skeleton loaders."
        },
        backend: {
          title: "Node.js + Express Service",
          tech: "Node.js, Express Middleware",
          description: "Modular REST controllers handling telemetry ingestion, workspace scoping, validation, and alert threshold checks."
        },
        api: {
          title: "Versioned REST Endpoints",
          tech: "JSON REST API (/api/v1/*)",
          description: "Structured query endpoints supporting time-window filters, status codes, pagination, and cursor-based event logs."
        },
        database: {
          title: "MongoDB Time-Bucket Store",
          tech: "MongoDB, Compound Indexes",
          description: "Pre-aggregated hourly/daily telemetry bucket documents paired with indexed raw event collections."
        },
        authentication: {
          title: "JWT + RBAC Guard",
          tech: "JWT, Role Middleware",
          description: "Stateless access token verification enforcing Admin, Developer, and Viewer permissions per workspace."
        },
        integrations: {
          title: "Webhook & Alert Dispatch",
          tech: "HTTP Webhooks, Email Adapter",
          description: "Configurable threshold alert dispatcher notifying team channels when error spikes or latency thresholds trigger."
        }
      },
      technologySelection: [
        { name: "React", role: "Frontend UI", rationale: "Predictable component state for multi-filter telemetry views and reusable workspace panels." },
        { name: "Tailwind CSS", role: "Styling System", rationale: "Fast responsive grid composition and dark/light surface consistency." },
        { name: "Node.js & Express", role: "API Runtime", rationale: "Lightweight asynchronous I/O well suited for concurrent telemetry queries and middleware auth." },
        { name: "MongoDB", role: "Telemetry Store", rationale: "Flexible document schema accommodates varied event payloads and pre-aggregated time buckets." }
      ],
      databaseStructure: [
        { entity: "Workspaces", fields: "_id, name, slug, ownerId, alertThresholds, createdAt", purpose: "Top-level tenant boundary and team configuration." },
        { entity: "MetricBuckets", fields: "_id, workspaceId, endpoint, windowStart, p95Ms, errorCount, totalCount", purpose: "Pre-aggregated telemetry buckets for fast chart rendering." },
        { entity: "EventLogs", fields: "_id, workspaceId, level, route, statusCode, durationMs, timestamp", purpose: "Indexed granular request traces for diagnostic drill-downs." }
      ],
      developmentProcess: [
        "Defined MongoDB bucket schemas and Express query contracts first",
        "Built reusable KPI strip, tabular event stream, and filter bar components",
        "Added JWT workspace middleware and role permission checks",
        "Validated responsive breakpoints and keyboard accessibility across viewports"
      ],
      features: [
        "Real-time 24-hour API latency and throughput visualization",
        "Role-based workspace permissions and team alert thresholds",
        "Event stream filtering with instant search and date presets",
        "Responsive multi-breakpoint dashboard grid from mobile to 4K"
      ],
      challenges: [
        "Aggregating high-frequency request telemetry without slowing down MongoDB reads",
        "Keeping complex metric grids readable and non-overlapping on smaller viewports"
      ],
      solutions: [
        "Implemented pre-aggregated time-bucket collections in MongoDB with compound indexes on workspaceId and windowStart",
        "Designed progressive single-column metric stacking on mobile with horizontally contained table wrappers"
      ],
      solution:
        "Implemented pre-aggregated time-bucket collections in MongoDB with indexed Express endpoints and a responsive React card layout using tabular numerals.",
      results: [
        "Consolidated 5 fragmented monitoring views into one unified workspace",
        "Pre-aggregated bucket architecture minimizes full-collection scans on 24-hour chart queries",
        "Clean zero-overflow rendering across mobile, tablet, and wide desktop screens"
      ],
      lessonsLearned: [
        "Pre-aggregating time buckets during ingestion keeps dashboard reads dramatically simpler than ad-hoc runtime grouping",
        "Tabular numeral alignment is essential whenever live telemetry numbers refresh in place"
      ],
      futureImprovements: [
        "Add WebSocket / Server-Sent Events live stream toggle for real-time tailing",
        "Expand CSV/JSON diagnostic export for filtered incident windows"
      ],
      timeline: [
        { phase: "Planning", dates: "Week 1", description: "Scoped observability workflows, tenant roles, and bucket schema strategy." },
        { phase: "UI/UX", dates: "Week 2", description: "Designed dark-mode hierarchy, tabular metric cards, and responsive breakpoints." },
        { phase: "Frontend", dates: "Weeks 3–4", description: "Built React telemetry panels, date preset filters, and log search." },
        { phase: "Backend", dates: "Weeks 5–6", description: "Implemented Express REST APIs, JWT RBAC middleware, and MongoDB indexes." },
        { phase: "Testing", dates: "Week 7", description: "Verified query edge cases, empty states, and 320px–2560px viewport parity." },
        { phase: "Deployment", dates: "Week 8", description: "Hardened environment config, production build checks, and documentation." }
      ],
      liveUrl: "",
      githubUrl: ""
    },
    {
      id: "nexora",
      slug: "nexora",
      title: "Nexora",
      category: "E-commerce",
      projectType: "Headless E-Commerce Platform",
      developmentRole: "Full-Stack MERN & Redux Engineer",
      filterCategories: ["E-commerce", "MERN", "Web Apps", "UI/UX"],
      year: "2025",
      status: "Completed Build",
      duration: "6 Weeks",
      featured: true,
      description:
        "Modular headless commerce storefront and instant checkout drawer featuring filterable product discovery and real-time cart sync.",
      longDescription:
        "Nexora delivers a high-speed storefront architecture combining sleek product grids, slide-over cart management, and structured order summaries engineered on the MERN stack.",
      overview:
        "Nexora streamlines digital retail browsing by keeping category discovery, instant search, and slide-over cart adjustments inside a single fluid interface without disruptive page reloads.",
      image: "assets/images/projects/nexora.jpg",
      gallery: [
        {
          src: "assets/images/projects/nexora.jpg",
          caption: "Nexora — Product catalog grid and instant checkout drawer"
        },
        {
          src: "assets/images/projects/ecommerce-saas.jpg",
          caption: "Nexora — Merchant order & revenue analytics view"
        },
        {
          src: "assets/images/projects/slideverse.jpg",
          caption: "Nexora — Editorial product merchandising layout tokens"
        }
      ],
      technologies: ["MongoDB", "Express", "React", "Redux", "Node.js", "Tailwind CSS"],
      problem:
        "Traditional storefronts frequently force full-page reloads for cart updates and filter changes, creating friction and abandoned checkouts on mobile networks.",
      goals: [
        "Deliver instant client-side catalog filtering paired with validated backend stock checks",
        "Create an accessible, keyboard-trapped slide-over cart drawer for effortless quantity updates",
        "Ensure all product cards and checkout controls meet mobile touch-target guidelines"
      ],
      researchPlanning: [
        "Evaluated mobile checkout drop-off points caused by multi-step cart redirects",
        "Structured normalized catalog, cart, and order schemas to support guest-to-account cart merging"
      ],
      userRequirements: [
        "Shoppers need fast category/price filtering and instant keyword search",
        "Users need live subtotal, quantity, and stock feedback inside a persistent drawer",
        "Merchants need reliable transactional stock validation at order submission"
      ],
      designStrategy:
        "Paired crisp 4:3 product photography frames with uncluttered price/variant typography, high-contrast Add-to-Cart CTAs, and an unobtrusive right-hand drawer.",
      architecture:
        "Headless React + Redux storefront consuming normalized REST endpoints for catalog, pricing rules, and order creation in MongoDB.",
      systemArchitecture: {
        frontend: {
          title: "React + Redux Storefront",
          tech: "React, Redux Toolkit, Tailwind CSS",
          description: "Handles catalog filtering, optimistic cart slice state, and accessible slide-over checkout drawer UI."
        },
        backend: {
          title: "Express Commerce Engine",
          tech: "Node.js, Express",
          description: "Validates product availability, computes server-authoritative order totals, and handles checkout endpoints."
        },
        api: {
          title: "Storefront REST API",
          tech: "Catalog, Cart & Order Routes",
          description: "Paginated product search, category queries, cart synchronization, and order creation endpoints."
        },
        database: {
          title: "MongoDB Catalog & Orders",
          tech: "MongoDB, Mongoose",
          description: "Normalized collections for products, inventory stock counts, user carts, and immutable order snapshots."
        },
        authentication: {
          title: "Session & JWT Customer Auth",
          tech: "JWT, Guest Token Sync",
          description: "Supports browsing as a guest with seamless cart merge upon customer sign-in."
        },
        integrations: {
          title: "Payment & Media Adapters",
          tech: "Webhook Checkout Adapter, CDN Images",
          description: "Modular payment intent abstraction and lazy-loaded optimized product media."
        }
      },
      technologySelection: [
        { name: "Redux", role: "Cart State", rationale: "Centralized deterministic cart calculations and optimistic UI updates across components." },
        { name: "React", role: "Storefront UI", rationale: "Responsive modular product cards and smooth drawer state transitions." },
        { name: "Express & MongoDB", role: "Commerce Backend", rationale: "Flexible product attribute schemas and clean transactional order recording." }
      ],
      databaseStructure: [
        { entity: "Products", fields: "_id, title, slug, category, price, stock, images", purpose: "Indexed catalog metadata and inventory levels." },
        { entity: "Carts", fields: "_id, userId, guestToken, items[{productId, qty}], updatedAt", purpose: "Persistent shopping bag state across sessions." },
        { entity: "Orders", fields: "_id, orderNumber, userId, lineItems, totalAmount, status", purpose: "Immutable checkout record capturing historical item pricing." }
      ],
      developmentProcess: [
        "Modeled catalog and immutable order line-item schemas",
        "Implemented Redux cart slice with debounced backend persistence",
        "Built accessible focus-trapped slide-over cart drawer",
        "Tested mobile swipe/tap interactions and out-of-stock edge cases"
      ],
      features: [
        "Instant category filtering, keyword search, and price sorting",
        "Slide-over checkout drawer with live quantity & tax calculation",
        "Persistent cart state synced cleanly between guest and signed-in sessions",
        "Touch-friendly mobile product cards and accessible drawer controls"
      ],
      challenges: [
        "Synchronizing optimistic cart quantities with backend inventory limits",
        "Keeping drawer navigation smooth and keyboard-trapped for accessibility"
      ],
      solutions: [
        "Built an optimistic Redux cart layer that reconciles cleanly with server stock validation responses",
        "Added accessible focus trapping, Escape-key dismissal, and ARIA dialog attributes on the cart drawer"
      ],
      solution:
        "Built an optimistic Redux cart layer backed by transactional stock checks in Express/MongoDB and an accessible slide-over drawer.",
      results: [
        "Eliminated multi-page cart reloads during product browsing",
        "Streamlined checkout preview down to a single drawer interaction",
        "Consistent 44px+ touch targets across mobile shopping journeys"
      ],
      lessonsLearned: [
        "Order line items must snapshot price and title at checkout so future catalog edits never alter past receipts",
        "Focus restoration on drawer close makes keyboard shopping noticeably smoother"
      ],
      futureImprovements: [
        "Add saved wishlist collections and recently viewed history",
        "Introduce faceted multi-attribute filtering (size, color, stock status)"
      ],
      timeline: [
        { phase: "Planning", dates: "Week 1", description: "Defined headless commerce flows and guest-to-user cart merge specs." },
        { phase: "UI/UX", dates: "Week 2", description: "Designed product cards, filter bars, and slide-over checkout drawer." },
        { phase: "Frontend", dates: "Weeks 3–4", description: "Engineered React catalog views and Redux Toolkit cart synchronization." },
        { phase: "Backend", dates: "Week 5", description: "Built Express order validation, stock checks, and MongoDB schemas." },
        { phase: "Testing", dates: "Week 6", description: "Audited keyboard drawer traps, mobile touch ergonomics, and edge cases." },
        { phase: "Deployment", dates: "Week 6", description: "Bundled static storefront assets and documented API contracts." }
      ],
      liveUrl: "",
      githubUrl: ""
    },
    {
      id: "slideverse",
      slug: "slideverse",
      title: "SLIDEVERSE",
      category: "UI/UX",
      projectType: "Interactive Web Studio",
      developmentRole: "Frontend & UI Architecture Lead",
      filterCategories: ["UI/UX", "Web Apps", "SaaS"],
      year: "2025",
      status: "Completed Build",
      duration: "5 Weeks",
      featured: true,
      description:
        "Interactive browser-based presentation studio enabling creators to compose typography-first slide decks with live layout controls.",
      longDescription:
        "SLIDEVERSE is a creative web application built for founders, designers, and developers to author, style, and present modern slide decks directly inside the browser.",
      overview:
        "SLIDEVERSE brings editorial typographic precision to web-native slide authoring. Instead of bloated desktop ribbons, creators control font scale, spacing, alignment, and presentation order in a clean multi-pane browser studio.",
      image: "assets/images/projects/slideverse.jpg",
      gallery: [
        {
          src: "assets/images/projects/slideverse.jpg",
          caption: "SLIDEVERSE — Interactive canvas, slide rail, and typography inspector"
        },
        {
          src: "assets/images/projects/portfolio-system.jpg",
          caption: "SLIDEVERSE — Design token & responsive layout presets"
        },
        {
          src: "assets/images/projects/astrapulse.jpg",
          caption: "SLIDEVERSE — Structured dark-canvas slide preview mode"
        }
      ],
      technologies: ["JavaScript", "HTML5", "CSS3", "React", "Tailwind CSS", "Node.js"],
      problem:
        "Desktop slide tools feel heavy for quick technical decks, while basic web editors lack fine-grained typographic and spacing controls.",
      goals: [
        "Render instant zero-lag visual feedback for font scale, line-height, and layout presets",
        "Support full keyboard navigation during live presentation mode",
        "Store decks in a clean, portable JSON schema for effortless export and persistence"
      ],
      researchPlanning: [
        "Studied creator bottlenecks when formatting code-heavy or typography-led pitch slides",
        "Designed a CSS-variable-driven slide frame so inspector controls mutate properties without full DOM re-renders"
      ],
      userRequirements: [
        "Creators need live drag/reorder slide rails and instant theme presets",
        "Presenters need fullscreen keyboard arrow navigation",
        "Teams need portable JSON deck import/export"
      ],
      designStrategy:
        "Structured a three-zone studio workspace on desktop (Slide Rail · Live Canvas · Typography Inspector) that collapses gracefully into tabbed drawers on tablet and mobile.",
      architecture:
        "Component-based editor state tree paired with CSS variable styling engine and Node.js deck persistence endpoints.",
      systemArchitecture: {
        frontend: {
          title: "React Studio Canvas",
          tech: "React, CSS Custom Properties",
          description: "Live slide canvas updating typographic scale, spacing, and alignment via scoped CSS variables."
        },
        backend: {
          title: "Node.js Deck Service",
          tech: "Node.js, Express",
          description: "Handles deck JSON serialization, preset validation, and saved presentation persistence."
        },
        api: {
          title: "Deck Persistence API",
          tech: "JSON REST Endpoints",
          description: "CRUD routes for saving, cloning, and exporting structured slide deck documents."
        },
        database: {
          title: "JSON Document Store",
          tech: "Structured Deck Schema",
          description: "Stores ordered slide arrays, theme token overrides, and presenter notes."
        },
        authentication: {
          title: "Creator Session Guard",
          tech: "Token-Based Author Access",
          description: "Separates private deck editing rights from read-only presentation share links."
        },
        integrations: {
          title: "Browser Fullscreen & Font APIs",
          tech: "Fullscreen API, Google Fonts",
          description: "Native browser presentation mode paired with curated editorial font families."
        }
      },
      technologySelection: [
        { name: "CSS Custom Properties", role: "Live Theme Engine", rationale: "Allows smooth slider adjustments on the active slide frame without layout thrashing." },
        { name: "React", role: "Editor State", rationale: "Clean separation between slide order rail, active selection, and inspector controls." },
        { name: "Node.js", role: "Deck Persistence", rationale: "Seamless JSON handling for saving and exporting structured slide manifests." }
      ],
      databaseStructure: [
        { entity: "Decks", fields: "_id, title, themeTokens, slides[], updatedAt", purpose: "Stores presentation metadata and ordered slide array." },
        { entity: "SlideNodes", fields: "id, layoutType, heading, body, styleOverrides", purpose: "Self-contained slide configuration supporting JSON export." }
      ],
      developmentProcess: [
        "Designed portable JSON deck schema and CSS variable mapping",
        "Built slide thumbnail rail and active slide canvas",
        "Added live typography inspector and keyboard presentation mode",
        "Adapted inspector panels into mobile-friendly bottom sheets"
      ],
      features: [
        "Real-time typography weight, alignment, and spacing inspector",
        "Draggable slide order rail with live thumbnail previews",
        "Keyboard-driven presentation mode with smooth 60fps transitions",
        "JSON deck serialization for instant saving and sharing"
      ],
      challenges: [
        "Maintaining 60fps canvas responsiveness while updating live typography properties",
        "Designing a multi-pane studio layout that degrades gracefully on tablets"
      ],
      solutions: [
        "Scoped state updates to targeted CSS custom properties on the active slide frame rather than re-mounting sibling thumbnails",
        "Converted desktop sidebars into collapsible responsive drawer controls below 1024px"
      ],
      solution:
        "Scoped state updates to targeted CSS custom properties on the active slide frame and added collapsible side panels for smaller screens.",
      results: [
        "Zero-lag live preview for font scale, spacing, and alignment changes",
        "Keyboard shortcuts for rapid slide creation and presentation",
        "Clean exportable JSON deck format for portable sharing"
      ],
      lessonsLearned: [
        "Isolating live canvas styling inside CSS custom properties keeps React reconciliation light during rapid input scrubbing"
      ],
      futureImprovements: [
        "Add Markdown-to-slide quick import parser",
        "Include speaker notes timer view in presentation mode"
      ],
      timeline: [
        { phase: "Planning", dates: "Week 1", description: "Defined slide JSON data model and studio pane architecture." },
        { phase: "UI/UX", dates: "Week 2", description: "Crafted editorial canvas ratios and typography inspector controls." },
        { phase: "Frontend", dates: "Weeks 3–4", description: "Implemented live CSS variable engine, slide rail, and presentation mode." },
        { phase: "Backend", dates: "Week 4", description: "Added Node.js JSON deck persistence and export serialization." },
        { phase: "Testing", dates: "Week 5", description: "Verified keyboard presentation navigation and tablet/mobile studio adaptation." },
        { phase: "Deployment", dates: "Week 5", description: "Finalized bundle optimization and JSON schema docs." }
      ],
      liveUrl: "",
      githubUrl: ""
    },
    {
      id: "school-management-system",
      slug: "school-management-system",
      title: "School Management System",
      category: "Dashboard",
      projectType: "Role-Based Management Portal",
      developmentRole: "Full-Stack & RBAC Systems Developer",
      filterCategories: ["Dashboard", "MERN", "Web Apps"],
      year: "2025",
      status: "Completed Build",
      duration: "7 Weeks",
      featured: false,
      description:
        "Comprehensive academic operations portal managing student directories, daily attendance schedules, grades, and staff workflows.",
      longDescription:
        "A full-stack academic administration dashboard crafted to replace spreadsheet-heavy school workflows with role-based portals for administrators, teachers, and students.",
      overview:
        "Built to centralize day-to-day school operations, this platform replaces fragmented spreadsheets with unified student directories, weekly attendance matrices, GPA computation, and role-scoped academic dashboards.",
      image: "assets/images/projects/school-management.jpg",
      gallery: [
        {
          src: "assets/images/projects/school-management.jpg",
          caption: "School Management System — Student directory, attendance matrix & GPA overview"
        },
        {
          src: "assets/images/projects/astrapulse.jpg",
          caption: "School Management System — Attendance trend analytics module"
        },
        {
          src: "assets/images/projects/ecommerce-saas.jpg",
          caption: "School Management System — Administrative role management & summary view"
        }
      ],
      technologies: ["MongoDB", "Mongoose", "Express", "React", "Node.js", "Tailwind CSS"],
      problem:
        "Schools relying on disconnected spreadsheets face attendance errors, delayed grade reporting, and difficulty auditing student records across departments.",
      goals: [
        "Replace scattered attendance and grade spreadsheets with one role-protected portal",
        "Keep dense weekly attendance matrices scannable and usable on tablets and phones",
        "Enforce strict validation on enrollment, attendance updates, and grade entries"
      ],
      researchPlanning: [
        "Outlined core daily tasks for three distinct roles: Admin, Teacher, and Student",
        "Designed Mongoose reference structures with compound indexes on classId and date"
      ],
      userRequirements: [
        "Admins require class roster creation, teacher assignment, and overview metrics",
        "Teachers require fast one-click daily attendance marking and grade entry",
        "Students require clean read-only access to personal schedules, attendance, and GPA"
      ],
      designStrategy:
        "Prioritized high-contrast status indicators pairing color with explicit text labels (Present, Late, Absent), crisp tabular GPA alignment, and predictable sidebar/drawer navigation.",
      architecture:
        "MERN stack application with JWT role middleware, Mongoose validation schemas, and a modular React dashboard shell.",
      systemArchitecture: {
        frontend: {
          title: "Role-Aware React Portal",
          tech: "React, Tailwind CSS",
          description: "Renders Admin, Teacher, and Student workspace views with filterable tables and attendance matrices."
        },
        backend: {
          title: "Express Academic Services",
          tech: "Node.js, Express, Mongoose",
          description: "Implements GPA calculations, attendance batch updates, and schema validation."
        },
        api: {
          title: "Protected Academic REST API",
          tech: "Role-Scoped REST Endpoints",
          description: "Dedicated routes for rosters, attendance logs, subject grades, and term summaries."
        },
        database: {
          title: "MongoDB Relational References",
          tech: "MongoDB, Mongoose ODM",
          description: "Structured collections for Users, Classes, Enrollments, Attendance, and Grades with compound indexes."
        },
        authentication: {
          title: "JWT + Multi-Role RBAC",
          tech: "JWT, Middleware Guards",
          description: "Restricts write operations to authorized Admins and assigned class Teachers."
        },
        integrations: {
          title: "Print & Report Export",
          tech: "Browser Print Stylesheet",
          description: "Structured print styling for generating clean student attendance and GPA summary sheets."
        }
      },
      technologySelection: [
        { name: "Mongoose", role: "ODM Validation", rationale: "Strict schema validation and clean population across student, class, and attendance collections." },
        { name: "React", role: "Dashboard UI", rationale: "Reusable data table, status badge, and modal patterns across Admin/Teacher/Student views." },
        { name: "Express", role: "Middleware Guarding", rationale: "Clean separation of authentication and role authorization before controller execution." }
      ],
      databaseStructure: [
        { entity: "Students & Staff", fields: "_id, role, fullName, rollNumber, classId", purpose: "Unified identity directory with role metadata." },
        { entity: "AttendanceLogs", fields: "_id, classId, date, records[{studentId, status}]", purpose: "Indexed daily class attendance sheet." },
        { entity: "GradeRecords", fields: "_id, studentId, subject, term, score, gradePoint", purpose: "Tracks per-subject scores for automated GPA computation." }
      ],
      developmentProcess: [
        "Defined role matrix (Admin, Teacher, Student) and Mongoose schemas",
        "Built attendance matrix and GPA calculation endpoints",
        "Implemented searchable student directory and responsive table wrappers",
        "Tested authorization boundaries across every protected route"
      ],
      features: [
        "Searchable student & class directory with status filtering",
        "One-click weekly attendance matrix with late/absent indicators",
        "Automated GPA calculation and academic trend reporting",
        "Role-protected Admin, Teacher, and Student views"
      ],
      challenges: [
        "Structuring relational-style student, class, and attendance records cleanly in MongoDB",
        "Making dense weekly attendance tables usable on tablet and mobile viewports"
      ],
      solutions: [
        "Designed normalized Mongoose references with compound indexes for fast class-date lookups",
        "Wrapped wide weekly matrices in touch-scrollable containers paired with compact mobile summary rows"
      ],
      solution:
        "Designed normalized Mongoose references with compound indexes for fast class-date lookups and horizontally scrollable table wrappers on mobile.",
      results: [
        "Centralized attendance, grading, and roster lookups in one portal",
        "Indexed class-date lookups across simulated student enrollment datasets",
        "Clear visual attendance markers paired with accessible text labels"
      ],
      lessonsLearned: [
        "Compound indexes on classId + date prevent slow scans as daily attendance logs grow",
        "Never rely on color alone for Present/Late/Absent markers—pair icons and clear text"
      ],
      futureImprovements: [
        "Add parent guardian read-only digest notifications",
        "Add CSV bulk student roster import validation"
      ],
      timeline: [
        { phase: "Planning", dates: "Week 1", description: "Mapped Admin, Teacher, and Student permissions and academic workflows." },
        { phase: "UI/UX", dates: "Week 2", description: "Designed attendance grid states, GPA cards, and responsive sidebar navigation." },
        { phase: "Frontend", dates: "Weeks 3–4", description: "Implemented directory search, attendance matrix UI, and role views." },
        { phase: "Backend", dates: "Weeks 5–6", description: "Built Express APIs, JWT RBAC middleware, and Mongoose models." },
        { phase: "Testing", dates: "Week 7", description: "Validated role permissions, edge cases, and mobile table scrolling." },
        { phase: "Deployment", dates: "Week 7", description: "Prepared production seed scripts and environment documentation." }
      ],
      liveUrl: "",
      githubUrl: ""
    },
    {
      id: "portfolio-system",
      slug: "portfolio-system",
      title: "Portfolio System",
      category: "Web Apps",
      projectType: "Config-Driven Multi-Page Web App",
      developmentRole: "UI Systems & Vanilla JS Architect",
      filterCategories: ["Web Apps", "UI/UX"],
      year: "2026",
      status: "Active Iteration",
      // duration intentionally omitted to demonstrate conditional metadata rendering
      featured: false,
      description:
        "Config-driven multi-page portfolio architecture with reusable design tokens, dual dark/light themes, and modular page scripts.",
      longDescription:
        "A zero-framework, high-performance multi-page portfolio engine engineered with semantic HTML5, custom CSS variables, Tailwind utilities, and modular Vanilla JavaScript.",
      overview:
        "This portfolio system proves that modern multi-page web experiences do not require heavy client frameworks. Built with pure semantic HTML5, custom CSS variables, and modular Vanilla JavaScript, it powers 16 coordinated routes from a single configuration file.",
      image: "assets/images/projects/portfolio-system.jpg",
      gallery: [
        {
          src: "assets/images/projects/portfolio-system.jpg",
          caption: "Portfolio System — Multi-page design tokens and layout system"
        },
        {
          src: "assets/images/projects/slideverse.jpg",
          caption: "Portfolio System — Typography scale and component architecture"
        },
        {
          src: "assets/images/projects/astrapulse.jpg",
          caption: "Portfolio System — Developer Dashboard & live GitHub analytics integration"
        }
      ],
      technologies: ["HTML5", "CSS3", "Tailwind CSS", "JavaScript", "SEO", "Responsive Design"],
      problem:
        "Many developer portfolios ship as fragile single-page templates with tangled inline styles, duplicated headers, and broken mobile responsiveness.",
      goals: [
        "Eliminate duplicated navigation and footer markup across 16 static HTML pages",
        "Provide seamless dark/light theme persistence without flash of unstyled theme",
        "Guarantee full keyboard accessibility and zero horizontal overflow from 320px to 2560px"
      ],
      researchPlanning: [
        "Architected a central js/config.js file feeding identity, navigation links, social channels, and GitHub settings",
        "Designed CSS custom properties in css/style.css so dark and light modes share unified semantic tokens"
      ],
      userRequirements: [
        "Visitors need consistent navigation, search, filtering, and fast transitions across pages",
        "Portfolio owner needs one central config file to update personal metadata and external links",
        "Recruiters need a dedicated print-optimized resume and printable case studies"
      ],
      designStrategy:
        "Combined deep slate surfaces with indigo/cyan accent gradients, fluid clamp() headings, generous breathing room, and strict reduced-motion accessibility.",
      architecture:
        "Multi-page semantic HTML5 routes sharing centralized CSS variables, global component injectors, and modular Vanilla JavaScript page controllers.",
      systemArchitecture: {
        frontend: {
          title: "Semantic HTML5 + CSS Tokens",
          tech: "HTML5, CSS3, Tailwind CDN",
          description: "16 coordinated static routes sharing fluid typography, dark/light tokens, and print stylesheets."
        },
        backend: {
          title: "Static Edge Delivery",
          tech: "Zero-Backend Architecture",
          description: "Pure static files engineered to deploy cleanly on any CDN or static host without server runtime overhead."
        },
        api: {
          title: "Browser & Public REST APIs",
          tech: "GitHub REST API, Web Share, Clipboard",
          description: "Integrates live public GitHub data and native browser sharing with resilient fallbacks."
        },
        database: {
          title: "Centralized JS Data Modules",
          tech: "config.js, projects.js, blog.js",
          description: "Structured client-side data modules replacing hard-coded HTML copy (no external database required)."
        },
        authentication: {
          title: "Public Read-Only Access",
          tech: "Unauthenticated Public Client",
          description: "Zero private keys or login gates—safe public client execution with localStorage theme & cache state."
        },
        integrations: {
          title: "Lucide Icons & Google Fonts",
          tech: "Lucide CDN, Plus Jakarta Sans, JetBrains Mono",
          description: "Deferred icon hydration paired with crisp geometric sans and monospace tabular typography."
        }
      },
      technologySelection: [
        { name: "Vanilla JavaScript", role: "Modular Logic", rationale: "Zero bundle bloat, direct DOM control, and transparent debuggability across independent page modules." },
        { name: "CSS Custom Properties", role: "Theme Engine", rationale: "Instant dark/light mode parity and clean print stylesheet overrides." },
        { name: "Semantic HTML5 & JSON-LD", role: "SEO & Accessibility", rationale: "Ensures every route exposes clear landmarks, skip links, and structured metadata." }
      ],
      // databaseStructure intentionally omitted for static architecture to demonstrate conditional section rendering
      developmentProcess: [
        "Established base design tokens, typography, and global component injectors",
        "Built individual page modules for skills, services, projects, experience, blog, and testimonials",
        "Added Developer Dashboard, Live GitHub REST integration, and agency-style case studies",
        "Verified responsive breakpoints, keyboard traps, and print layouts"
      ],
      features: [
        "Centralized js/config.js driving identity, navigation, and social metadata",
        "Persistent dark/light theme engine with OS preference detection",
        "Full-screen accessible mobile navigation and subtle page transitions",
        "Tested responsiveness across 320px–2560px with zero horizontal scroll"
      ],
      challenges: [
        "Delivering app-like navigation transitions and reusable components in pure Vanilla JS",
        "Ensuring 11+ navigation links fit cleanly across desktop and mobile without overflow"
      ],
      solutions: [
        "Built a modular component injector (navbar, footer, toast, loader, scroll progress) paired with fluid clamp() typography",
        "Tuned multi-tier desktop navbar spacing at 1024px–1536px and switched smoothly to a fullscreen grid drawer below 1024px"
      ],
      solution:
        "Built a modular component injector (navbar, footer, toast, loader, scroll progress) paired with fluid clamp() typography and CSS tokens.",
      results: [
        "Zero external framework runtime overhead",
        "Instant dark/light theme parity across all pages",
        "Complete keyboard navigation and reduced-motion accessibility"
      ],
      lessonsLearned: [
        "Separating data modules from HTML templates makes multi-page maintenance nearly as clean as a component framework without runtime cost"
      ],
      futureImprovements: [
        "Add automated visual regression screenshots in CI when headless Chromium is available",
        "Add RSS feed generation alongside static blog articles"
      ],
      timeline: [
        { phase: "Planning", dates: "Phase 1–2", description: "Established file architecture, design tokens, and shared navbar/footer injectors." },
        { phase: "UI/UX", dates: "Phase 3–5", description: "Crafted responsive hero, about, skills, and service modal systems." },
        { phase: "Frontend", dates: "Phase 6–9", description: "Built filterable projects, blog reader, testimonials slider, and contact validation." },
        { phase: "Testing", dates: "Phase 11–12", description: "Audited SEO, JSON-LD, keyboard navigation, print CSS, and 320px–2560px layouts." },
        { phase: "Deployment", dates: "Phase 13–15", description: "Added Developer Dashboard, Live GitHub API explorer, and case study architecture." }
      ],
      liveUrl: "index.html",
      githubUrl: ""
    },
    {
      id: "ecommerce-saas",
      slug: "ecommerce-saas",
      title: "E-commerce SaaS",
      category: "SaaS",
      projectType: "Multi-Tenant SaaS Platform",
      developmentRole: "Full-Stack & Database Architect",
      filterCategories: ["SaaS", "E-commerce", "Dashboard", "MERN"],
      year: "2026",
      status: "Completed Build",
      duration: "9 Weeks",
      featured: false,
      description:
        "Multi-tenant merchant storefront builder and revenue analytics platform empowering sellers to launch custom online stores.",
      longDescription:
        "E-commerce SaaS combines a visual storefront customizer with a real-time merchant operations console tracking net revenue, order fulfillment, and average order value.",
      overview:
        "Designed for independent merchants who want customizable branded storefronts paired with clear fulfillment pipelines, E-commerce SaaS merges a live theme preview studio and an operational order analytics portal.",
      image: "assets/images/projects/ecommerce-saas.jpg",
      gallery: [
        {
          src: "assets/images/projects/ecommerce-saas.jpg",
          caption: "E-commerce SaaS — Merchant revenue analytics & storefront builder"
        },
        {
          src: "assets/images/projects/nexora.jpg",
          caption: "E-commerce SaaS — Generated customer storefront preview"
        },
        {
          src: "assets/images/projects/astrapulse.jpg",
          caption: "E-commerce SaaS — Storefront conversion & traffic metrics view"
        }
      ],
      technologies: ["Next.js", "React", "Node.js", "Express", "MongoDB", "PostgreSQL"],
      problem:
        "Small merchants struggle to manage storefront customization and real-time order analytics without juggling costly, disconnected third-party plugins.",
      goals: [
        "Isolate tenant catalogs, themes, and orders cleanly across shared SaaS infrastructure",
        "Enable live storefront branding previews using lightweight CSS variable injection",
        "Provide clear order fulfillment tracking and tabular KPI summaries for merchants"
      ],
      researchPlanning: [
        "Compared single-tenant vs. shared multi-tenant data partitioning models for scalability",
        "Separated transactional order ledgers (PostgreSQL) from flexible catalog & theme documents (MongoDB)"
      ],
      userRequirements: [
        "Merchants need to update colors, hero copy, and product listings with instant live preview",
        "Fulfillment staff need status transitions (Paid, Processing, Shipped, Delivered)",
        "Storefronts must inherit tenant custom domains or slugs cleanly"
      ],
      designStrategy:
        "Used a clean split-pane studio layout for theme editing alongside structured high-density operational tables for order management.",
      architecture:
        "Next.js merchant studio + storefront renderer backed by Express multi-tenant APIs, MongoDB catalog documents, and PostgreSQL order ledgers.",
      systemArchitecture: {
        frontend: {
          title: "Next.js Studio & Storefront",
          tech: "Next.js, React, Tailwind CSS",
          description: "Dual-surface UI rendering the merchant customizer console and live themed customer storefronts."
        },
        backend: {
          title: "Multi-Tenant Express Core",
          tech: "Node.js, Express",
          description: "Resolves tenant context from request headers/subdomains and orchestrates catalog + ledger mutations."
        },
        api: {
          title: "Tenant-Scoped REST API",
          tech: "Merchant & Storefront Endpoints",
          description: "Enforces tenantId filtering across product updates, theme tokens, and order fulfillment states."
        },
        database: {
          title: "Polyglot Persistence",
          tech: "MongoDB + PostgreSQL",
          description: "MongoDB stores flexible product/theme JSON; PostgreSQL guarantees ACID integrity for financial order ledgers."
        },
        authentication: {
          title: "Tenant JWT + Role Claims",
          tech: "JWT, Tenant Isolation Middleware",
          description: "Verifies merchant ownership before allowing storefront theme writes or order status transitions."
        },
        integrations: {
          title: "Payment & Fulfillment Hooks",
          tech: "Webhook Handlers",
          description: "Event hooks updating order payment/shipping state asynchronously."
        }
      },
      technologySelection: [
        { name: "Next.js", role: "Storefront Rendering", rationale: "Clean dynamic route resolution for tenant storefront slugs and SEO metadata." },
        { name: "PostgreSQL", role: "Order Ledgers", rationale: "Strict relational integrity and transactional guarantees for order line items and totals." },
        { name: "MongoDB", role: "Catalog & Themes", rationale: "Flexible schema for varied merchant product attributes and nested branding token objects." }
      ],
      databaseStructure: [
        { entity: "Tenants (MongoDB)", fields: "_id, slug, storeName, themeVariables, ownerId", purpose: "Stores merchant store metadata and CSS branding overrides." },
        { entity: "CatalogItems (MongoDB)", fields: "_id, tenantId, sku, title, attributes, priceCents", purpose: "Tenant-scoped product documents supporting flexible attributes." },
        { entity: "OrderLedgers (PostgreSQL)", fields: "id, tenant_id, order_ref, status, total_cents, created_at", purpose: "Transactional financial ledger for fulfillment and revenue summaries." }
      ],
      developmentProcess: [
        "Architected polyglot MongoDB + PostgreSQL schema boundaries",
        "Built tenant middleware isolating every API query by authenticated tenantId",
        "Implemented dynamic CSS variable theme previewer",
        "Added responsive order fulfillment pipeline tables and status filters"
      ],
      features: [
        "Multi-tenant store isolation with custom merchant branding tokens",
        "Live revenue, order count, and AOV analytics cards",
        "Order status workflow (Paid, Shipped, Processing, Delivered)",
        "Tablet & desktop split storefront layout previewer"
      ],
      challenges: [
        "Enforcing strict tenant data isolation across shared API routes",
        "Rendering live storefront theme previews without duplicating styles"
      ],
      solutions: [
        "Centralized tenant resolution inside Express middleware so controllers never rely on unverified client tenant IDs",
        "Injected serialized merchant branding tokens as CSS custom properties on the preview wrapper"
      ],
      solution:
        "Scoped every backend query by authenticated tenant ID and drove the live store previewer via dynamic CSS variable injection.",
      results: [
        "Unified store customization and order management into one workspace",
        "Reduced merchant store setup friction through live variable-driven theme previews",
        "Mobile-ready order management tables and KPI summaries"
      ],
      lessonsLearned: [
        "Mixing PostgreSQL for order ledgers and MongoDB for dynamic storefront schemas plays to each database's strengths when cleanly abstracted behind services"
      ],
      futureImprovements: [
        "Add automated custom domain SSL verification workflow",
        "Support multi-currency formatting preferences per storefront"
      ],
      timeline: [
        { phase: "Planning", dates: "Weeks 1–2", description: "Designed multi-tenant isolation model and polyglot database boundaries." },
        { phase: "UI/UX", dates: "Week 3", description: "Designed split storefront customizer and merchant analytics console." },
        { phase: "Frontend", dates: "Weeks 4–5", description: "Built Next.js storefront templates, live theme previewer, and order tables." },
        { phase: "Backend", dates: "Weeks 6–7", description: "Implemented Express tenant middleware, MongoDB catalogs, and PostgreSQL ledgers." },
        { phase: "Testing", dates: "Week 8", description: "Tested cross-tenant authorization boundaries and responsive table layouts." },
        { phase: "Deployment", dates: "Week 9", description: "Finalized migration docs and production environment templates." }
      ],
      liveUrl: "",
      githubUrl: ""
    }
  ];

  const state = {
    activeCategory: "All",
    searchQuery: "",
    items: projectsData
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getSelectedProjectSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || params.get("slug") || "";
  }

  function getFeaturedProjects() {
    return projectsData.filter((project) => project.featured);
  }

  function getAllProjects() {
    return projectsData.slice();
  }

  function getProjectBySlug(idOrSlug) {
    return (
      projectsData.find(
        (project) => project.id === idOrSlug || project.slug === idOrSlug
      ) || null
    );
  }

  function getRelatedProjects(currentProject, limit = 3) {
    if (!currentProject) return [];
    const currentTechs = new Set((currentProject.technologies || []).map((t) => t.toLowerCase()));
    const currentCats = new Set([
      currentProject.category,
      ...(currentProject.filterCategories || [])
    ]);

    return projectsData
      .filter((candidate) => candidate.id !== currentProject.id)
      .map((candidate) => {
        const sharedTech = (candidate.technologies || []).filter((t) =>
          currentTechs.has(t.toLowerCase())
        ).length;
        const sharedCat =
          (candidate.category === currentProject.category ? 2 : 0) +
          (candidate.filterCategories || []).filter((c) => currentCats.has(c)).length;
        return { project: candidate, score: sharedTech * 2 + sharedCat };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.project);
  }

  function renderProjectImage(src, alt) {
    return `
      <img
        src="${escapeHtml(src)}"
        alt="${escapeHtml(alt)}"
        loading="lazy"
        onerror="this.style.display='none'; this.parentElement.classList.add('flex','items-center','justify-center');"
      >
    `;
  }

  function buildActionButton(url, label, icon, unavailableTitle) {
    if (url && String(url).trim() !== "") {
      const isExternal = /^https?:\/\//i.test(url);
      const externalAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `
        <a href="${escapeHtml(url)}"${externalAttrs} class="outline-button text-xs py-2 px-3 min-h-[38px]">
          <i data-lucide="${escapeHtml(icon)}" class="w-3.5 h-3.5"></i>
          <span>${escapeHtml(label)}</span>
        </a>
      `;
    }

    return `
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="${escapeHtml(unavailableTitle)}"
        class="outline-button button-disabled text-xs py-2 px-3 min-h-[38px]"
      >
        <i data-lucide="${escapeHtml(icon)}" class="w-3.5 h-3.5"></i>
        <span>${escapeHtml(label)}</span>
      </button>
    `;
  }

  /* ========================================================================
     Home Page: Featured Projects Renderer (AstraPulse, Nexora, SLIDEVERSE)
     ======================================================================== */

  function renderFeaturedProjects(targetId = "featured-projects-grid") {
    const container = document.getElementById(targetId);
    if (!container) return;

    const featured = getFeaturedProjects();
    if (!featured.length) {
      container.innerHTML = `
        <div class="glass-card p-6 text-center text-sm text-[var(--muted)] col-span-full">
          No featured projects available right now.
        </div>
      `;
      return;
    }

    container.innerHTML = featured
      .map((project, index) => {
        const delayClass = index === 1 ? "delay-100" : index === 2 ? "delay-200" : "";
        const stackLine = project.technologies.slice(0, 4).join(" · ");
        return `
          <article class="glass-card project-card hover-lift flex flex-col justify-between overflow-hidden reveal ${delayClass}" data-tilt-card>
            <div>
              <div class="project-media-box">
                ${renderProjectImage(project.image, `${project.title} preview`)}
                <div class="project-media-gradient"></div>
                <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-xs text-slate-200">
                  <span class="font-medium">${escapeHtml(project.category)}</span>
                  <span class="tabular-nums text-slate-300">${escapeHtml(project.year)}</span>
                </div>
              </div>

              <div class="p-5 sm:p-6 space-y-2.5">
                <h3 class="text-xl font-bold text-[var(--text)]">${escapeHtml(project.title)}</h3>
                <p class="text-sm text-[var(--muted)] leading-relaxed">${escapeHtml(project.description)}</p>
              </div>
            </div>

            <div class="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-[var(--border)] flex flex-col gap-4">
              <p class="text-xs font-mono-tech text-[var(--text-secondary)]">${escapeHtml(stackLine)}</p>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <a href="project-details.html?id=${encodeURIComponent(project.id)}" class="primary-button text-xs sm:text-sm py-2 px-4 min-h-[40px]">
                  <span>Case Study</span>
                  <i data-lucide="arrow-up-right" class="w-4 h-4 btn-icon-slide"></i>
                </a>
                <a href="projects.html" class="text-xs sm:text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                  All Projects
                </a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    attachDesktopCardTilt(container);
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  /* ========================================================================
     Phase 6: Projects Archive (Filters, Search & Cards)
     ======================================================================== */

  function attachDesktopCardTilt(scopeRoot) {
    const root = document.documentElement;
    const motionBlocked =
      (root && (root.classList.contains("a11y-reduce-motion") || root.classList.contains("perf-mode"))) ||
      (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const canTilt =
      window.innerWidth >= 1024 &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !motionBlocked;

    if (!canTilt) return;

    scopeRoot.querySelectorAll("[data-tilt-card]").forEach((card) => {
      if (card.dataset.tiltBound === "true") return;
      card.dataset.tiltBound = "true";

      card.addEventListener("mousemove", (event) => {
        if (
          window.innerWidth < 1024 ||
          root.classList.contains("perf-mode") ||
          root.classList.contains("a11y-reduce-motion")
        ) {
          card.style.transform = "";
          return;
        }
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const rotY = (x * 5).toFixed(2);
        const rotX = (-y * 5).toFixed(2);
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  function renderProjectFilters() {
    const mount = document.getElementById("projects-filter-tabs");
    if (!mount) return;

    mount.setAttribute("role", "tablist");
    mount.setAttribute("aria-label", "Filter projects by category");

    mount.innerHTML = categories
      .map((cat) => {
        const isActive = state.activeCategory === cat;
        return `
          <button
            type="button"
            role="tab"
            aria-selected="${isActive ? "true" : "false"}"
            data-project-category="${escapeHtml(cat)}"
            class="skill-tab-btn ${isActive ? "is-active" : ""}"
          >
            ${escapeHtml(cat)}
          </button>
        `;
      })
      .join("");

    mount.querySelectorAll("[data-project-category]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextCat = btn.getAttribute("data-project-category") || "All";
        if (nextCat === state.activeCategory) return;
        state.activeCategory = nextCat;
        renderProjectFilters();
        renderProjectsArchive(true);
      });
    });
  }

  function bindProjectSearch() {
    const input = document.getElementById("project-search-input");
    const clearBtn = document.getElementById("project-search-clear");
    if (!input) return;

    const syncClearBtn = () => {
      if (clearBtn) {
        clearBtn.classList.toggle("hidden", input.value.trim() === "");
      }
    };

    input.addEventListener("input", () => {
      state.searchQuery = input.value.trim().toLowerCase();
      syncClearBtn();
      renderProjectsArchive(true);
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        input.value = "";
        state.searchQuery = "";
        syncClearBtn();
        renderProjectsArchive(true);
        input.focus();
      });
    }

    syncClearBtn();
  }

  function filterProjects() {
    return projectsData.filter((project) => {
      const matchesCategory =
        state.activeCategory === "All" ||
        project.category === state.activeCategory ||
        (Array.isArray(project.filterCategories) &&
          project.filterCategories.includes(state.activeCategory));

      if (!matchesCategory) return false;

      if (!state.searchQuery) return true;

      const haystack = [
        project.title,
        project.category,
        project.description,
        ...(project.technologies || []),
        ...(project.filterCategories || [])
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(state.searchQuery);
    });
  }

  function renderProjectsArchive(animate = false) {
    const grid = document.getElementById("projects-archive-grid");
    const countEl = document.getElementById("projects-results-count");
    if (!grid) return;

    const matched = filterProjects();

    if (countEl) {
      countEl.textContent = `${matched.length} ${matched.length === 1 ? "project" : "projects"}`;
    }

    if (matched.length === 0) {
      grid.innerHTML = `
        <div class="glass-card p-8 sm:p-10 text-center space-y-4 col-span-full">
          <i data-lucide="search-x" class="w-8 h-8 text-indigo-400 mx-auto"></i>
          <div class="space-y-1">
            <h2 class="text-lg font-bold text-[var(--text)]">No matching projects found</h2>
            <p class="text-sm text-[var(--muted)]">Try clearing your search term or switching back to All categories.</p>
          </div>
          <button type="button" id="projects-reset-filters" class="secondary-button mx-auto">
            Reset Filters
          </button>
        </div>
      `;

      const resetBtn = document.getElementById("projects-reset-filters");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          state.activeCategory = "All";
          state.searchQuery = "";
          const searchInput = document.getElementById("project-search-input");
          const clearBtn = document.getElementById("project-search-clear");
          if (searchInput) searchInput.value = "";
          if (clearBtn) clearBtn.classList.add("hidden");
          renderProjectFilters();
          renderProjectsArchive(true);
        });
      }

      if (window.lucide) window.lucide.createIcons();
      return;
    }

    grid.innerHTML = matched
      .map((project, idx) => {
        const cardDelay = Math.min(idx * 35, 210);
        const animClass = animate ? "skill-card-enter" : "reveal";
        const visibleTech = project.technologies.slice(0, 4);
        const extraCount = project.technologies.length - visibleTech.length;
        const techBadges =
          visibleTech
            .map((t) => `<span class="tech-badge-item text-xs py-1 px-2.5">${escapeHtml(t)}</span>`)
            .join("") +
          (extraCount > 0 ? `<span class="tech-badge-item text-xs py-1 px-2.5 tabular-nums">+${extraCount}</span>` : "");

        return `
          <article
            class="glass-card project-card hover-lift flex flex-col justify-between overflow-hidden ${animClass}"
            style="--card-delay: ${cardDelay}ms;"
            data-tilt-card
          >
            <div>
              <div class="project-media-box">
                ${renderProjectImage(project.image, `${project.title} showcase`)}
                <div class="project-media-gradient"></div>
                <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-xs text-slate-200">
                  <span class="font-semibold">${escapeHtml(project.category)}</span>
                  <span class="tabular-nums text-slate-300">${escapeHtml(project.year)}</span>
                </div>
              </div>

              <div class="p-5 sm:p-6 space-y-3">
                <h2 class="text-xl font-bold text-[var(--text)]">${escapeHtml(project.title)}</h2>
                <p class="text-sm text-[var(--muted)] leading-relaxed">${escapeHtml(project.description)}</p>
                <div class="flex flex-wrap gap-1.5 pt-1">${techBadges}</div>
              </div>
            </div>

            <div class="px-5 pb-5 sm:px-6 sm:pb-6 pt-3.5 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-2">
                ${buildActionButton(project.liveUrl, "Live Demo", "external-link", "Live demo URL not published yet")}
                ${buildActionButton(project.githubUrl, "GitHub", "github", "Repository is private or unpublished")}
              </div>
              <a
                href="project-details.html?id=${encodeURIComponent(project.id)}"
                class="primary-button text-xs py-2 px-3.5 min-h-[38px]"
              >
                <span>Details</span>
                <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 btn-icon-slide"></i>
              </a>
            </div>
          </article>
        `;
      })
      .join("");

    attachDesktopCardTilt(grid);
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
    if (!animate && window.PortfolioAnimations) {
      window.PortfolioAnimations.initScrollReveal();
    }
  }

  /* ========================================================================
     Phase 15: Premium Agency Project Case Study Helpers
     ======================================================================== */

  function renderBulletList(items, icon, colorClass) {
    const arr = Array.isArray(items) ? items : items ? [items] : [];
    return `
      <ul class="space-y-2.5 list-none p-0 m-0">
        ${arr
          .map(
            (text) => `
              <li class="flex items-start gap-2.5 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                <i data-lucide="${escapeHtml(icon)}" class="w-4 h-4 ${colorClass} shrink-0 mt-1"></i>
                <span>${escapeHtml(text)}</span>
              </li>
            `
          )
          .join("")}
      </ul>
    `;
  }

  function renderArchitectureDiagram(project) {
    const arch = project.systemArchitecture;
    if (!arch || typeof arch !== "object") return "";

    const layerDefs = [
      { key: "frontend", label: "Frontend", icon: "layout" },
      { key: "api", label: "API Layer", icon: "route" },
      { key: "backend", label: "Backend", icon: "server" },
      { key: "authentication", label: "Authentication", icon: "shield-check" },
      { key: "database", label: "Database", icon: "database" },
      { key: "integrations", label: "Integrations", icon: "plug" }
    ].filter((def) => arch[def.key]);

    if (layerDefs.length === 0) return "";

    const firstLayer = arch[layerDefs[0].key];

    const nodesHtml = layerDefs
      .map((def, idx) => {
        const layer = arch[def.key];
        const isFirst = idx === 0;
        return `
          <button
            type="button"
            class="arch-node-btn ${isFirst ? "is-active" : ""}"
            data-arch-layer="${escapeHtml(def.key)}"
            aria-pressed="${isFirst ? "true" : "false"}"
          >
            <div class="flex items-center justify-between gap-2 w-full">
              <span class="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider text-cyan-400">
                <i data-lucide="${escapeHtml(def.icon)}" class="w-3.5 h-3.5"></i>
                <span>${escapeHtml(def.label)}</span>
              </span>
              <span class="text-[11px] font-mono-tech text-[var(--muted)] tabular-nums">0${idx + 1}</span>
            </div>
            <p class="text-sm font-bold text-[var(--text)]">${escapeHtml(layer.title)}</p>
            <p class="text-xs text-[var(--muted)]">${escapeHtml(layer.tech)}</p>
          </button>
        `;
      })
      .join("");

    return `
      <div class="arch-diagram-shell space-y-3" id="arch-diagram-shell">
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <span class="font-semibold text-[var(--text-secondary)]">Interactive System Flow</span>
          <span>Select any layer node to inspect responsibilities</span>
        </div>

        <svg class="arch-svg-backdrop" viewBox="0 0 900 46" fill="none" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <linearGradient id="archFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#6366F1" />
              <stop offset="50%" stop-color="#8B5CF6" />
              <stop offset="100%" stop-color="#06B6D4" />
            </linearGradient>
          </defs>
          <path d="M40 23 H860" stroke="url(#archFlowGrad)" stroke-width="2" stroke-dasharray="6 5" opacity="0.7" />
          <circle cx="40" cy="23" r="5" fill="#6366F1" />
          <circle cx="290" cy="23" r="5" fill="#8B5CF6" />
          <circle cx="570" cy="23" r="5" fill="#06B6D4" />
          <circle cx="860" cy="23" r="5" fill="#06B6D4" />
        </svg>

        <div class="arch-flow-grid" role="group" aria-label="System architecture layers">
          ${nodesHtml}
        </div>

        <div id="arch-node-inspector" class="arch-inspector" aria-live="polite">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <h3 id="arch-inspector-title" class="text-sm sm:text-base font-bold text-[var(--text)]">${escapeHtml(firstLayer.title)}</h3>
            <span id="arch-inspector-tech" class="text-xs font-mono-tech text-cyan-400">${escapeHtml(firstLayer.tech)}</span>
          </div>
          <p id="arch-inspector-desc" class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escapeHtml(firstLayer.description)}</p>
        </div>
      </div>
    `;
  }

  function buildCaseStudySections(project) {
    const sections = [];

    const addSection = (id, title, bodyHtml) => {
      if (!bodyHtml) return;
      sections.push({ id, title, bodyHtml });
    };

    const overviewText = project.overview || project.longDescription;
    if (overviewText) {
      addSection("cs-overview", "Project Overview", `<p class="case-study-prose">${escapeHtml(overviewText)}</p>`);
    }

    if (project.problem) {
      addSection("cs-problem", "The Problem", `<p class="case-study-prose">${escapeHtml(project.problem)}</p>`);
    }

    if (Array.isArray(project.goals) && project.goals.length > 0) {
      addSection("cs-goals", "Project Goals", renderBulletList(project.goals, "target", "text-cyan-400"));
    }

    if (Array.isArray(project.researchPlanning) && project.researchPlanning.length > 0) {
      addSection("cs-research", "Research & Planning", renderBulletList(project.researchPlanning, "compass", "text-indigo-400"));
    }

    if (Array.isArray(project.userRequirements) && project.userRequirements.length > 0) {
      addSection("cs-requirements", "User Requirements", renderBulletList(project.userRequirements, "users", "text-violet-400"));
    }

    if (project.designStrategy) {
      addSection("cs-design", "Design Strategy", `<p class="case-study-prose">${escapeHtml(project.designStrategy)}</p>`);
    }

    if (project.architecture || project.systemArchitecture) {
      const archIntro = project.architecture
        ? `<p class="case-study-prose mb-5">${escapeHtml(project.architecture)}</p>`
        : "";
      const diagramHtml = renderArchitectureDiagram(project);
      addSection("cs-architecture", "System Architecture", `${archIntro}${diagramHtml}`);
    }

    if (Array.isArray(project.technologySelection) && project.technologySelection.length > 0) {
      const cardsHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          ${project.technologySelection
            .map(
              (item) => `
                <div class="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-1.5">
                  <div class="flex items-center justify-between gap-2">
                    <h3 class="text-sm sm:text-base font-bold text-[var(--text)]">${escapeHtml(item.name)}</h3>
                    <span class="text-[11px] font-mono-tech text-cyan-400">${escapeHtml(item.role)}</span>
                  </div>
                  <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escapeHtml(item.rationale)}</p>
                </div>
              `
            )
            .join("")}
        </div>
      `;
      addSection("cs-tech-selection", "Technology Selection", cardsHtml);
    }

    if (Array.isArray(project.databaseStructure) && project.databaseStructure.length > 0) {
      const dbHtml = `
        <div class="space-y-3">
          ${project.databaseStructure
            .map(
              (tbl) => `
                <div class="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-1.5">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <h3 class="text-sm font-bold text-[var(--text)]">${escapeHtml(tbl.entity)}</h3>
                    <code class="text-xs font-mono-tech text-indigo-400 break-all">${escapeHtml(tbl.fields)}</code>
                  </div>
                  <p class="text-xs sm:text-sm text-[var(--muted)]">${escapeHtml(tbl.purpose)}</p>
                </div>
              `
            )
            .join("")}
        </div>
      `;
      addSection("cs-database", "Database Structure", dbHtml);
    }

    if (Array.isArray(project.developmentProcess) && project.developmentProcess.length > 0) {
      addSection(
        "cs-process",
        "Development Process",
        `<ol class="space-y-2.5 list-none p-0 m-0">
          ${project.developmentProcess
            .map(
              (step, idx) => `
                <li class="flex items-start gap-3 text-sm sm:text-base text-[var(--text-secondary)]">
                  <span class="font-mono-tech text-xs font-bold text-indigo-400 mt-1 tabular-nums">${String(idx + 1).padStart(2, "0")}.</span>
                  <span>${escapeHtml(step)}</span>
                </li>
              `
            )
            .join("")}
        </ol>`
      );
    }

    if (Array.isArray(project.features) && project.features.length > 0) {
      addSection("cs-features", "Major Features", renderBulletList(project.features, "check-circle-2", "text-cyan-400"));
    }

    if (Array.isArray(project.challenges) && project.challenges.length > 0) {
      addSection("cs-challenges", "Challenges", renderBulletList(project.challenges, "alert-circle", "text-amber-400"));
    }

    const solutionsData = project.solutions && project.solutions.length ? project.solutions : project.solution;
    if (solutionsData && (!Array.isArray(solutionsData) || solutionsData.length > 0)) {
      addSection(
        "cs-solutions",
        "Solutions",
        Array.isArray(solutionsData)
          ? renderBulletList(solutionsData, "wrench", "text-indigo-400")
          : `<p class="case-study-prose">${escapeHtml(solutionsData)}</p>`
      );
    }

    if (Array.isArray(project.results) && project.results.length > 0) {
      addSection("cs-results", "Results & Engineering Outcomes", renderBulletList(project.results, "trending-up", "text-emerald-400"));
    }

    if (Array.isArray(project.lessonsLearned) && project.lessonsLearned.length > 0) {
      addSection("cs-lessons", "Lessons Learned", renderBulletList(project.lessonsLearned, "lightbulb", "text-amber-400"));
    }

    if (Array.isArray(project.futureImprovements) && project.futureImprovements.length > 0) {
      addSection("cs-future", "Future Improvements", renderBulletList(project.futureImprovements, "sparkles", "text-cyan-400"));
    }

    if (Array.isArray(project.timeline) && project.timeline.length > 0) {
      const timelineHtml = `
        <div class="cs-timeline">
          ${project.timeline
            .map(
              (item, idx) => `
                <article class="cs-timeline-step">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-mono-tech font-bold text-indigo-400 tabular-nums">0${idx + 1} · ${escapeHtml(item.phase)}</span>
                    <span class="text-xs font-mono-tech text-cyan-400 tabular-nums">${escapeHtml(item.dates)}</span>
                  </div>
                  <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escapeHtml(item.description)}</p>
                </article>
              `
            )
            .join("")}
        </div>
      `;
      addSection("cs-timeline", "Project Timeline", timelineHtml);
    }

    return sections;
  }

  function updateCaseStudySeo(project) {
    document.title = `${project.title} — Case Study | AL AMIN`;

    const setMeta = (selector, attr, val) => {
      const node = document.querySelector(selector);
      if (node && val) node.setAttribute(attr, val);
    };

    setMeta('meta[name="description"]', "content", `${project.title} engineering case study: ${project.description}`);
    setMeta('meta[property="og:title"]', "content", `${project.title} — Case Study | AL AMIN`);
    setMeta('meta[property="og:description"]', "content", project.description);
    setMeta('meta[property="og:image"]', "content", project.image);
    setMeta('meta[name="twitter:title"]', "content", `${project.title} — Case Study | AL AMIN`);
    setMeta('meta[name="twitter:description"]', "content", project.description);
    setMeta('meta[name="twitter:image"]', "content", project.image);

    const ldNode = document.getElementById("project-jsonld");
    if (ldNode) {
      ldNode.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: `${project.title} — Case Study`,
        description: project.description,
        datePublished: project.year,
        author: { "@type": "Person", name: "AL AMIN" },
        keywords: (project.technologies || []).join(", ")
      });
    }
  }

  function renderProjectDetailsPage() {
    const mount = document.getElementById("project-details-container");
    if (!mount) return;

    const requestedSlug = getSelectedProjectSlug();
    let activeIndex = projectsData.findIndex(
      (p) => p.id === requestedSlug || p.slug === requestedSlug
    );
    if (activeIndex === -1) {
      activeIndex = 0;
    }

    const project = projectsData[activeIndex];
    const prevProject = projectsData[(activeIndex - 1 + projectsData.length) % projectsData.length];
    const nextProject = projectsData[(activeIndex + 1) % projectsData.length];
    const relatedProjects = getRelatedProjects(project, 3);

    updateCaseStudySeo(project);
    const breadcrumbEl = document.getElementById("project-breadcrumb-title");
    if (breadcrumbEl) breadcrumbEl.textContent = project.title;

    const techChips = (project.technologies || [])
      .map((t) => `<span class="tech-badge-item">${escapeHtml(t)}</span>`)
      .join("");

    const caseSections = buildCaseStudySections(project);

    const tocLinksHtml = [
      ...caseSections.map(
        (sec, idx) => `
          <li>
            <a href="#${escapeHtml(sec.id)}" class="case-study-toc-link ${idx === 0 ? "is-active" : ""}" data-cs-toc-link="${escapeHtml(sec.id)}">
              <span class="truncate">${escapeHtml(sec.title)}</span>
              <span class="font-mono-tech text-[11px] opacity-75 tabular-nums">${String(idx + 1).padStart(2, "0")}</span>
            </a>
          </li>
        `
      ),
      `<li>
        <a href="#cs-gallery" class="case-study-toc-link" data-cs-toc-link="cs-gallery">
          <span class="truncate">Project Gallery</span>
          <span class="font-mono-tech text-[11px] opacity-75 tabular-nums">${String(caseSections.length + 1).padStart(2, "0")}</span>
        </a>
      </li>`
    ].join("");

    const mobileSelectOptionsHtml = [
      ...caseSections.map(
        (sec, idx) => `<option value="${escapeHtml(sec.id)}">${String(idx + 1).padStart(2, "0")}. ${escapeHtml(sec.title)}</option>`
      ),
      `<option value="cs-gallery">${String(caseSections.length + 1).padStart(2, "0")}. Project Gallery</option>`
    ].join("");

    const sectionsMarkup = caseSections
      .map(
        (sec, idx) => `
          <article id="${escapeHtml(sec.id)}" class="case-study-section space-y-4 reveal">
            <div class="space-y-1">
              <p class="case-study-section-index">Section ${String(idx + 1).padStart(2, "0")}</p>
              <h2 class="text-xl sm:text-2xl font-bold text-[var(--text)]">${escapeHtml(sec.title)}</h2>
            </div>
            ${sec.bodyHtml}
          </article>
        `
      )
      .join("");

    const galleryItems = (project.gallery || [{ src: project.image, caption: project.title }])
      .map(
        (item, idx) => `
          <button
            type="button"
            class="gallery-thumb-btn group"
            data-lightbox-index="${idx}"
            aria-label="Open image: ${escapeHtml(item.caption)}"
          >
            <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.caption)}" loading="lazy">
            <div class="p-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
              <span class="text-xs text-[var(--text-secondary)] truncate">${escapeHtml(item.caption)}</span>
              <i data-lucide="zoom-in" class="w-3.5 h-3.5 text-indigo-400 shrink-0"></i>
            </div>
          </button>
        `
      )
      .join("");

    const relatedMarkup = relatedProjects
      .map((rel) => {
        const relStack = (rel.technologies || []).slice(0, 3).join(" · ");
        return `
          <article class="glass-card project-card hover-lift overflow-hidden flex flex-col justify-between">
            <div>
              <div class="project-media-box">
                ${renderProjectImage(rel.image, `${rel.title} preview`)}
                <div class="project-media-gradient"></div>
                <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                  <span>${escapeHtml(rel.category)}</span>
                  <span class="tabular-nums">${escapeHtml(rel.year)}</span>
                </div>
              </div>
              <div class="p-5 space-y-2">
                <h3 class="text-lg font-bold text-[var(--text)]">${escapeHtml(rel.title)}</h3>
                <p class="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">${escapeHtml(rel.description)}</p>
              </div>
            </div>
            <div class="px-5 pb-5 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
              <span class="text-xs font-mono-tech text-[var(--muted)] truncate">${escapeHtml(relStack)}</span>
              <a href="project-details.html?id=${encodeURIComponent(rel.id)}" class="primary-button text-xs py-1.5 px-3 min-h-[36px] shrink-0">
                <span>Read</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </a>
            </div>
          </article>
        `;
      })
      .join("");

    mount.innerHTML = `
      <!-- 1. Case Study Hero -->
      <div class="space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div class="lg:col-span-6 space-y-5 animate-fade-in-up">
            <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[var(--muted)]">
              <span class="badge">${escapeHtml(project.category)}</span>
              ${project.status ? `<span class="badge badge-cyan">${escapeHtml(project.status)}</span>` : ""}
              <span class="font-mono-tech tabular-nums">${escapeHtml(project.year)}</span>
            </div>

            <h1 class="case-study-hero-title">${escapeHtml(project.title)}</h1>
            <p class="case-study-lead">${escapeHtml(project.longDescription || project.description)}</p>

            <div class="case-study-meta-grid ${project.duration ? "has-duration" : ""}">
              <div class="case-study-meta-item">
                <p class="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold">Category</p>
                <p class="text-xs sm:text-sm font-bold text-[var(--text)] mt-0.5">${escapeHtml(project.category)}</p>
              </div>
              <div class="case-study-meta-item">
                <p class="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold">Status</p>
                <p class="text-xs sm:text-sm font-bold text-[var(--text)] mt-0.5">${escapeHtml(project.status || "Completed")}</p>
              </div>
              ${
                project.duration
                  ? `<div class="case-study-meta-item col-span-2 sm:col-span-1">
                       <p class="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold">Duration</p>
                       <p class="text-xs sm:text-sm font-bold text-[var(--text)] tabular-nums mt-0.5">${escapeHtml(project.duration)}</p>
                     </div>`
                  : ""
              }
            </div>

            <div class="flex flex-wrap gap-1.5">${techChips}</div>

            <div class="case-study-hero-actions flex flex-wrap items-center gap-2.5 pt-1">
              ${buildActionButton(project.liveUrl, "Live Demo", "external-link", "Live demo URL not published yet")}
              ${buildActionButton(project.githubUrl, "GitHub Repo", "github", "Repository is private or unpublished")}
              <a href="contact.html?project=${encodeURIComponent(project.id)}" class="primary-button text-xs sm:text-sm py-2 px-4 min-h-[40px]">
                <span>Request Similar Build</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>
          </div>

          <div class="lg:col-span-6 animate-fade-in-up delay-100">
            <div class="glass-card glow-effect overflow-hidden">
              <div class="project-media-box">
                ${renderProjectImage(project.image, `${project.title} cover showcase`)}
              </div>
            </div>
          </div>
        </div>

        <!-- Print & Share Utility Bar -->
        <div class="case-study-share-bar glass-card p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p class="text-xs sm:text-sm text-[var(--muted)]">
            Share or save this engineering breakdown for architecture review.
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" id="cs-copy-link-btn" class="outline-button text-xs py-2 px-3 min-h-[38px]">
              <i data-lucide="link" class="w-3.5 h-3.5"></i>
              <span>Copy URL</span>
            </button>
            <button type="button" id="cs-native-share-btn" class="outline-button text-xs py-2 px-3 min-h-[38px]">
              <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
              <span>Share</span>
            </button>
            <button type="button" id="cs-print-btn" class="secondary-button text-xs py-2 px-3.5 min-h-[38px]">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>Print Case Study</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Dropdown Table of Contents -->
      <div class="case-study-mobile-nav lg:hidden sticky top-[4.5rem] z-30">
        <div class="flex items-center gap-2">
          <label for="case-study-mobile-toc" class="sr-only">Jump to case study section</label>
          <select id="case-study-mobile-toc" class="case-study-mobile-select flex-1 min-w-0" aria-label="Jump to case study section">
            ${mobileSelectOptionsHtml}
          </select>
          <span
            id="cs-mobile-reading-percent"
            class="shrink-0 min-h-[44px] px-3 inline-flex items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-xs font-mono-tech font-semibold text-cyan-400 tabular-nums"
            aria-hidden="true"
          >0%</span>
        </div>
      </div>

      <!-- Sticky Desktop TOC + Main Case Study Body -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <aside class="case-study-toc-sidebar hidden lg:block lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div class="glass-card case-study-toc-card p-5 space-y-4">
            <div class="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
              <h2 class="text-sm font-bold text-[var(--text)]">Case Study Contents</h2>
              <span id="cs-reading-percent" class="text-xs font-mono-tech text-cyan-400 tabular-nums">0%</span>
            </div>
            <nav aria-label="Case study table of contents">
              <ul id="case-study-toc-list" class="space-y-1 list-none p-0 m-0">
                ${tocLinksHtml}
              </ul>
            </nav>
          </div>
        </aside>

        <div id="case-study-body" class="lg:col-span-8 space-y-6">
          ${sectionsMarkup}

          <!-- Gallery Section -->
          <article id="cs-gallery" class="case-study-section space-y-5 reveal">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div class="space-y-1">
                <p class="case-study-section-index">Section ${String(caseSections.length + 1).padStart(2, "0")}</p>
                <h2 class="text-xl sm:text-2xl font-bold text-[var(--text)]">Project Gallery</h2>
                <p class="text-xs sm:text-sm text-[var(--muted)]">Click any screenshot to inspect in full zoomable lightbox view.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${galleryItems}
            </div>
          </article>
        </div>
      </div>

      <!-- Related Projects -->
      ${
        relatedProjects.length > 0
          ? `<section aria-labelledby="cs-related-heading" class="pt-6 border-t border-[var(--border)] space-y-5 reveal">
               <div class="flex flex-wrap items-end justify-between gap-3">
                 <div>
                   <h2 id="cs-related-heading" class="text-xl sm:text-2xl font-bold text-[var(--text)]">Related Projects</h2>
                   <p class="text-xs sm:text-sm text-[var(--muted)] mt-0.5">Projects sharing core stack technologies or domain architecture.</p>
                 </div>
                 <a href="projects.html" class="text-xs sm:text-sm font-semibold text-cyan-400 hover:underline">All Projects</a>
               </div>
               <div class="grid grid-cols-1 md:grid-cols-3 gap-5">${relatedMarkup}</div>
             </section>`
          : ""
      }

      <!-- Previous / Next / Back Navigation -->
      <nav aria-label="Project pagination" class="case-study-pagination pt-8 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 gap-4 reveal">
        <a href="project-details.html?id=${encodeURIComponent(prevProject.id)}" class="glass-card hover-lift p-5 flex items-center gap-3 min-w-0">
          <i data-lucide="arrow-left" class="w-5 h-5 text-indigo-400 shrink-0"></i>
          <div class="min-w-0">
            <p class="text-xs text-[var(--muted)]">Previous Project</p>
            <p class="text-sm sm:text-base font-bold text-[var(--text)] truncate">${escapeHtml(prevProject.title)}</p>
          </div>
        </a>

        <a href="projects.html" class="glass-card hover-lift p-5 flex items-center justify-center gap-2 text-center font-bold text-sm text-[var(--text)]">
          <i data-lucide="grid" class="w-4 h-4 text-cyan-400"></i>
          <span>Back to Projects</span>
        </a>

        <a href="project-details.html?id=${encodeURIComponent(nextProject.id)}" class="glass-card hover-lift p-5 flex items-center justify-end gap-3 sm:text-right min-w-0">
          <div class="min-w-0 flex-1">
            <p class="text-xs text-[var(--muted)]">Next Project</p>
            <p class="text-sm sm:text-base font-bold text-[var(--text)] truncate">${escapeHtml(nextProject.title)}</p>
          </div>
          <i data-lucide="arrow-right" class="w-5 h-5 text-cyan-400 shrink-0"></i>
        </a>
      </nav>
    `;

    initArchitectureDiagram(project);
    initCaseStudyNavigation();
    initCaseStudyShareAndPrint(project);
    initLightbox(project.gallery || [{ src: project.image, caption: project.title }]);

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
    if (window.PortfolioAnimations) {
      window.PortfolioAnimations.initScrollReveal();
    }
  }

  function initArchitectureDiagram(project) {
    const shell = document.getElementById("arch-diagram-shell");
    const arch = project && project.systemArchitecture;
    if (!shell || !arch) return;

    const titleEl = document.getElementById("arch-inspector-title");
    const techEl = document.getElementById("arch-inspector-tech");
    const descEl = document.getElementById("arch-inspector-desc");
    const nodeButtons = Array.from(shell.querySelectorAll("[data-arch-layer]"));

    nodeButtons.forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-arch-layer");
        const data = arch[key];
        if (!data) return;

        nodeButtons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", active ? "true" : "false");
        });

        if (titleEl) titleEl.textContent = data.title;
        if (techEl) techEl.textContent = data.tech;
        if (descEl) descEl.textContent = data.description;
      });

      btn.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          const next = nodeButtons[(idx + 1) % nodeButtons.length];
          next.focus();
          next.click();
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          const prev = nodeButtons[(idx - 1 + nodeButtons.length) % nodeButtons.length];
          prev.focus();
          prev.click();
        }
      });
    });
  }

  function initCaseStudyNavigation() {
    const progressBar = document.getElementById("case-study-progress-bar");
    const percentEl = document.getElementById("cs-reading-percent");
    const mobilePercentEl = document.getElementById("cs-mobile-reading-percent");
    const tocLinks = Array.from(document.querySelectorAll("[data-cs-toc-link]"));
    const mobileSelect = document.getElementById("case-study-mobile-toc");
    const sectionNodes = Array.from(document.querySelectorAll(".case-study-section"));

    if (sectionNodes.length === 0) return;

    const setActiveId = (id) => {
      tocLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("data-cs-toc-link") === id);
      });
      if (mobileSelect && mobileSelect.value !== id) {
        mobileSelect.value = id;
      }
    };

    const scrollToSection = (id) => {
      const target = document.getElementById(id);
      if (!target) return;
      const reduced =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      setActiveId(id);
    };

    tocLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const id = link.getAttribute("data-cs-toc-link");
        if (id) scrollToSection(id);
      });
    });

    if (mobileSelect) {
      mobileSelect.addEventListener("change", () => {
        scrollToSection(mobileSelect.value);
      });
    }

    const syncProgressAndActive = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const pct = Math.round(ratio * 100);

      if (progressBar) {
        progressBar.style.transform = `scaleX(${ratio})`;
        progressBar.setAttribute("aria-valuenow", String(pct));
      }
      if (percentEl) {
        percentEl.textContent = `${pct}%`;
      }
      if (mobilePercentEl) {
        mobilePercentEl.textContent = `${pct}%`;
      }

      let currentId = sectionNodes[0].id;
      for (const sec of sectionNodes) {
        if (sec.getBoundingClientRect().top <= 140) {
          currentId = sec.id;
        }
      }
      setActiveId(currentId);
    };

    window.addEventListener("scroll", syncProgressAndActive, { passive: true });
    syncProgressAndActive();
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const helper = document.createElement("textarea");
        helper.value = text;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        document.body.removeChild(helper);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  function initCaseStudyShareAndPrint(project) {
    const copyBtn = document.getElementById("cs-copy-link-btn");
    const shareBtn = document.getElementById("cs-native-share-btn");
    const printBtn = document.getElementById("cs-print-btn");

    const handleCopy = () => {
      copyTextToClipboard(window.location.href)
        .then(() => {
          if (typeof window.showToast === "function") {
            window.showToast("Case study link copied to clipboard", "success");
          }
        })
        .catch(() => {
          if (typeof window.showToast === "function") {
            window.showToast("Unable to copy URL automatically", "error");
          }
        });
    };

    if (copyBtn) copyBtn.addEventListener("click", handleCopy);

    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        if (typeof navigator.share === "function") {
          navigator
            .share({
              title: `${project.title} — Case Study | AL AMIN`,
              text: project.description,
              url: window.location.href
            })
            .catch(() => {});
        } else {
          handleCopy();
        }
      });
    }

    if (printBtn) {
      printBtn.addEventListener("click", () => {
        window.print();
      });
    }
  }

  /* ========================================================================
     Upgraded Lightbox: Zoom + Touch Swipe + Keyboard Nav
     ======================================================================== */

  function initLightbox(gallery) {
    const backdrop = document.getElementById("project-lightbox");
    const viewport = document.getElementById("lightbox-viewport");
    const imgEl = document.getElementById("lightbox-image");
    const captionEl = document.getElementById("lightbox-caption");
    const counterEl = document.getElementById("lightbox-counter");
    const zoomBtn = document.getElementById("lightbox-zoom-toggle");
    const zoomLabel = document.getElementById("lightbox-zoom-label");
    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");

    if (!backdrop || !imgEl || !gallery || gallery.length === 0) return;

    let currentIdx = 0;
    let isZoomed = false;
    let lastFocus = null;
    let touchStartX = 0;
    let touchStartY = 0;

    function setZoom(zoomState) {
      isZoomed = Boolean(zoomState);
      if (viewport) viewport.classList.toggle("is-zoomed", isZoomed);
      if (zoomBtn) zoomBtn.setAttribute("aria-pressed", isZoomed ? "true" : "false");
      if (zoomLabel) zoomLabel.textContent = isZoomed ? "Reset" : "Zoom";
    }

    function showIndex(idx) {
      setZoom(false);
      currentIdx = (idx + gallery.length) % gallery.length;
      const item = gallery[currentIdx];
      imgEl.src = item.src;
      imgEl.alt = item.caption || "Project screenshot";
      if (captionEl) captionEl.textContent = item.caption || "";
      if (counterEl) counterEl.textContent = `Image ${currentIdx + 1} of ${gallery.length}`;
    }

    function openLightbox(idx, trigger) {
      lastFocus = trigger || null;
      showIndex(idx);
      backdrop.classList.add("is-open");
      backdrop.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
      if (closeBtn) window.setTimeout(() => closeBtn.focus(), 40);
    }

    function closeLightbox() {
      setZoom(false);
      backdrop.classList.remove("is-open");
      backdrop.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    document.querySelectorAll("[data-lightbox-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-lightbox-index") || "0");
        openLightbox(idx, btn);
      });
    });

    if (zoomBtn) zoomBtn.addEventListener("click", () => setZoom(!isZoomed));
    imgEl.addEventListener("click", () => setZoom(!isZoomed));

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", () => showIndex(currentIdx - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => showIndex(currentIdx + 1));

    if (viewport) {
      viewport.addEventListener(
        "touchstart",
        (event) => {
          if (isZoomed || !event.changedTouches || !event.changedTouches[0]) return;
          touchStartX = event.changedTouches[0].clientX;
          touchStartY = event.changedTouches[0].clientY;
        },
        { passive: true }
      );

      viewport.addEventListener(
        "touchend",
        (event) => {
          if (isZoomed || !event.changedTouches || !event.changedTouches[0]) return;
          const dx = event.changedTouches[0].clientX - touchStartX;
          const dy = event.changedTouches[0].clientY - touchStartY;
          if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) showIndex(currentIdx + 1);
            else showIndex(currentIdx - 1);
          }
        },
        { passive: true }
      );
    }

    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeLightbox();
    });

    if (!initLightbox.keyBound) {
      initLightbox.keyBound = true;
      document.addEventListener("keydown", (event) => {
        if (!backdrop.classList.contains("is-open")) return;
        if (event.key === "Escape") closeLightbox();
        else if (event.key === "ArrowLeft") showIndex(currentIdx - 1);
        else if (event.key === "ArrowRight") showIndex(currentIdx + 1);
        else if (event.key === "z" || event.key === "Z" || event.key === "+") setZoom(!isZoomed);
        else if (event.key === "-" && isZoomed) setZoom(false);
        else if (event.key === "Tab" && typeof window.trapDialogFocus === "function") {
          window.trapDialogFocus(backdrop, event);
        }
      });
    }
  }

  function init() {
    const mount = document.getElementById("projects-root");
    if (mount) {
      mount.dataset.moduleReady = "true";
    }

    if (document.getElementById("featured-projects-grid")) {
      renderFeaturedProjects("featured-projects-grid");
    }

    if (document.getElementById("projects-archive-grid")) {
      renderProjectFilters();
      bindProjectSearch();
      renderProjectsArchive(false);
    }

    if (document.getElementById("project-details-container")) {
      renderProjectDetailsPage();
    }
  }

  return {
    init,
    state,
    categories,
    projectsData,
    getFeaturedProjects,
    getAllProjects,
    getProjectBySlug,
    getRelatedProjects,
    getSelectedProjectSlug,
    renderFeaturedProjects,
    renderProjectDetailsPage,
    buildCaseStudySections
  };
})();

window.PortfolioProjects = PortfolioProjects;
