/**
 * AL AMIN Portfolio — Global Configuration & Central Personal Brand System (Phases 1–21)
 * Single source of truth for personal brand identity, visual tokens, contact channels,
 * availability, resume, navigation, services, and integrations.
 */

const portfolioConfig = {
  brand: {
    name: "AL AMIN",
    displayName: "AL AMIN",
    monogram: "AA",
    professionalTitle: "Full-Stack Developer & Creative Designer",
    shortTagline: "Engineering scalable web systems with refined interface craft.",
    longTagline:
      "I design and engineer modern full-stack web applications, SaaS architectures, and responsive digital products built for clarity, reliability, and speed.",
    description:
      "Personal engineering brand of AL AMIN — specializing in full-stack MERN architecture, Next.js product interfaces, RESTful APIs, and human-centered design systems.",
    location: "Bangladesh",
    email: "your-email@example.com",
    phone: "",
    profileImage: "assets/images/profile.jpg",
    profileFallbackImage: "assets/images/profile-placeholder.svg",
    favicon: "assets/icons/favicon.svg",
    logo: {
      ariaLabel: "AL AMIN — Personal Brand Home",
      badgeText: "Engineer · Designer",
      showSubtitleInFooter: true
    },
    colors: {
      primary: "#6366F1",
      secondary: "#8B5CF6",
      accentCyan: "#06B6D4",
      accentPink: "#EC4899",
      lightPrimary: "#4F46E5",
      lightSecondary: "#7C3AED",
      lightAccentCyan: "#0891B2",
      lightAccentPink: "#DB2777"
    },
    social: {
      github: "",
      linkedin: "",
      facebook: "",
      fiverr: "",
      upwork: "",
      email: "your-email@example.com"
    },
    resume: {
      url: "assets/documents/resume.pdf",
      filename: "AL_AMIN_Resume.pdf",
      label: "Download Resume"
    },
    availability: {
      status: "freelance", // Supported: "freelance" | "projects" | "remote" | "busy"
      label: "Open to Freelance & Full-Stack Roles",
      shortLabel: "Open to Freelance",
      note: "Available for international remote product builds, SaaS systems, and full-stack engineering."
    },
    currentFocus: "Full-Stack MERN, Next.js & Design Systems"
  },

  // Backward-compatible top-level aliases kept synchronized with portfolioConfig.brand
  name: "AL AMIN",
  role: "Full-Stack Developer & Creative Designer",
  location: "Bangladesh",
  email: "your-email@example.com",
  phone: "",
  bio: "I build modern, scalable and user-focused web applications.",
  profileImage: "assets/images/profile.jpg",
  resumeUrl: "assets/documents/resume.pdf",
  availabilityStatus: "freelance", // Supported: "freelance" | "projects" | "remote" | "busy"
  websiteStatus: "freelance", // Supported: "available" | "freelance" | "working" | "updated"
  websiteStatusUpdated: "2026-11-19",
  websiteStatusOptions: {
    available: { label: "Available for Projects", tone: "emerald" },
    freelance: { label: "Open to Freelance", tone: "cyan" },
    working: { label: "Currently Working", tone: "indigo" },
    updated: { label: "Portfolio Updated Recently", tone: "violet" }
  },
  github: {
    username: "octocat", // Replace with your GitHub username (or "" to prompt configuration)
    featuredRepos: ["SLIDEVERSE", "AstraPulse", "Hello-World", "Spoon-Knife"],
    excludeForksFromLanguages: true,
    perPage: 100,
    initialDisplayCount: 6,
    loadMoreStep: 6,
    cacheTtlMinutes: 15,
    eventsLimit: 8,
    apiBaseUrl: "https://api.github.com"
  },
  socialLinks: {
    github: "",
    linkedin: "",
    facebook: "",
    fiverr: "",
    upwork: ""
  },
  contactForm: {
    provider: "demo", // Supported: "formspree" | "emailjs" | "api" | "demo"
    formspreeEndpoint: "",
    emailjsServiceId: "",
    emailjsTemplateId: "",
    emailjsPublicKey: "",
    backendApiUrl: ""
  },
  assistant: {
    mode: "local", // Supported: "local" (rule-based static engine) | "backend" (future server proxy)
    backendEndpoint: "" // Point to your own server route (e.g. "/api/assistant"), never store API keys here
  },
  architect: {
    mode: "local", // Supported: "local" (rule-based engine) | "backend" (future server proxy)
    backendEndpoint: "" // Optional server route (e.g. "/api/architect"), never store API keys here
  },
  estimator: {
    currencySymbol: "$",
    rangeSpreadFactor: 0.22
  },
  projectRequest: {
    budgetRanges: [
      { id: "under-1k", label: "Under $1,000", note: "Focused landing page or lean MVP validation" },
      { id: "1k-2500", label: "$1,000 – $2,500", note: "Custom multi-page site or core web application" },
      { id: "2500-5k", label: "$2,500 – $5,000", note: "Full-stack platform with auth, database & admin UI" },
      { id: "5k-10k", label: "$5,000 – $10,000", note: "Comprehensive SaaS, e-commerce, or multi-integration product" },
      { id: "10k-plus", label: "$10,000+", note: "Scalable multi-phase engineering engagement" },
      { id: "discuss", label: "Flexible / Need Proposal", note: "Finalize budget tier after discovery call" }
    ]
  },
  // Optional: Configure service pricing packages here if you wish to publish rates in Client Mode.
  // Leave empty ([]) to show custom project-based scoping instead of fixed pricing cards.
  pricing: [],
  // Phase 54: Configurable real browser-verifiable system health checks
  systemChecks: [
    { name: "Portfolio Home Shell", url: "index.html", category: "Portfolio Pages", enabled: true },
    { name: "Interactive Resume Sheet", url: "resume.html", category: "Portfolio Pages", enabled: true },
    { name: "Developer Dashboard", url: "dashboard.html", category: "Portfolio Pages", enabled: true },
    { name: "Brand Vector Favicon", url: "assets/icons/favicon.svg", category: "Static Assets", enabled: true },
    { name: "PWA Web Manifest", url: "site.webmanifest", category: "Static Assets", enabled: true },
    { name: "GitHub Public Rate-Limit API", url: "https://api.github.com/rate_limit", category: "Public APIs", enabled: true },
    { name: "Custom Private Backend Endpoint", url: "", category: "Configured Endpoint", enabled: false }
  ]
};

// Keep top-level aliases synchronized with portfolioConfig.brand so editing brand.* updates all modules
(() => {
  const b = portfolioConfig.brand;
  if (!b) return;

  portfolioConfig.name = b.displayName || b.name || portfolioConfig.name;
  portfolioConfig.role = b.professionalTitle || portfolioConfig.role;
  portfolioConfig.location = b.location || portfolioConfig.location;
  portfolioConfig.email = b.email || (b.social && b.social.email) || portfolioConfig.email;
  portfolioConfig.phone = b.phone !== undefined ? b.phone : portfolioConfig.phone;
  portfolioConfig.bio = b.shortTagline || portfolioConfig.bio;
  portfolioConfig.profileImage = b.profileImage || portfolioConfig.profileImage;
  portfolioConfig.resumeUrl = (b.resume && b.resume.url) || portfolioConfig.resumeUrl;
  portfolioConfig.availabilityStatus =
    (b.availability && b.availability.status) || portfolioConfig.availabilityStatus;

  if (b.social) {
    portfolioConfig.socialLinks = {
      ...portfolioConfig.socialLinks,
      github: b.social.github ?? portfolioConfig.socialLinks.github,
      linkedin: b.social.linkedin ?? portfolioConfig.socialLinks.linkedin,
      facebook: b.social.facebook ?? portfolioConfig.socialLinks.facebook,
      fiverr: b.social.fiverr ?? portfolioConfig.socialLinks.fiverr,
      upwork: b.social.upwork ?? portfolioConfig.socialLinks.upwork
    };
    if (!b.social.email) {
      b.social.email = portfolioConfig.email;
    }
  }
})();

const siteRoutes = {
  navLinks: [
    { label: "Home", href: "index.html" },
    { label: "About", href: "about.html" },
    { label: "Skills", href: "skills.html" },
    { label: "Services", href: "services.html" },
    { label: "Projects", href: "projects.html" },
    { label: "Experience", href: "experience.html" },
    { label: "Certificates", href: "certificates.html" },
    { label: "Blog", href: "blog.html" },
    { label: "Testimonials", href: "testimonials.html" },
    { label: "Dashboard", href: "dashboard.html" },
    { label: "Office", href: "office.html" },
    { label: "Contact", href: "contact.html" }
  ],
  modeNavOrder: {
    default: [
      "index.html",
      "about.html",
      "skills.html",
      "services.html",
      "projects.html",
      "experience.html",
      "certificates.html",
      "blog.html",
      "testimonials.html",
      "dashboard.html",
      "office.html",
      "contact.html"
    ],
    client: [
      "index.html",
      "services.html",
      "projects.html",
      "testimonials.html",
      "contact.html",
      "office.html",
      "dashboard.html",
      "about.html",
      "skills.html",
      "experience.html",
      "certificates.html",
      "blog.html"
    ],
    recruiter: [
      "index.html",
      "about.html",
      "skills.html",
      "experience.html",
      "projects.html",
      "certificates.html",
      "dashboard.html",
      "office.html",
      "contact.html",
      "services.html",
      "blog.html",
      "testimonials.html"
    ],
    developer: [
      "index.html",
      "projects.html",
      "skills.html",
      "dashboard.html",
      "office.html",
      "blog.html",
      "experience.html",
      "about.html",
      "services.html",
      "certificates.html",
      "testimonials.html",
      "contact.html"
    ]
  },
  modePriorities: {
    client: [
      { label: "Services", href: "services.html", icon: "layers" },
      { label: "Projects", href: "projects.html", icon: "folder-kanban" },
      { label: "Case Studies", href: "project-details.html?id=astrapulse", icon: "book-open" },
      { label: "Project Estimator", href: "project-estimator.html", icon: "calculator" },
      { label: "Project Request", href: "project-request.html", icon: "send" },
      { label: "Contact", href: "contact.html", icon: "mail" }
    ],
    recruiter: [
      { label: "Resume", href: "resume.html", icon: "file-text" },
      { label: "Experience", href: "experience.html", icon: "briefcase" },
      { label: "Skills", href: "skills.html", icon: "cpu" },
      { label: "GitHub", href: "github.html", icon: "github" },
      { label: "Projects", href: "projects.html", icon: "folder-kanban" },
      { label: "Certificates", href: "certificates.html", icon: "award" },
      { label: "Recruiter Search", href: "recruiter-search.html", icon: "search" }
    ],
    developer: [
      { label: "Architecture", href: "architecture.html", icon: "cpu" },
      { label: "Code Playground", href: "playground.html", icon: "code-2" },
      { label: "API Explorer", href: "api-explorer.html", icon: "webhook" },
      { label: "Components", href: "components.html", icon: "blocks" },
      { label: "Engineering Decisions", href: "decisions.html", icon: "git-branch" },
      { label: "Security", href: "security.html", icon: "shield-check" }
    ]
  },
  primaryNav: [
    { label: "Home", href: "index.html" },
    { label: "About", href: "about.html" },
    { label: "Skills", href: "skills.html" },
    { label: "Services", href: "services.html" },
    { label: "Projects", href: "projects.html" }
  ],
  secondaryNav: [
    { label: "Experience", href: "experience.html" },
    { label: "Certificates", href: "certificates.html" },
    { label: "Blog", href: "blog.html" },
    { label: "Testimonials", href: "testimonials.html" },
    { label: "Dashboard", href: "dashboard.html" },
    { label: "Tech Explorer", href: "explorer.html" },
    { label: "Project Architect", href: "project-architect.html" },
    { label: "Project Estimator", href: "project-estimator.html" },
    { label: "Project Request", href: "project-request.html" },
    { label: "Build in Public", href: "build.html" },
    { label: "Engineering Decisions", href: "decisions.html" },
    { label: "Security Center", href: "security.html" },
    { label: "Performance Center", href: "performance.html" },
    { label: "System Architecture", href: "architecture.html" },
    { label: "API Explorer", href: "api-explorer.html" },
    { label: "Component Lab", href: "components.html" },
    { label: "Design Playground", href: "design-playground.html" },
    { label: "Proposal Generator", href: "proposal-generator.html" },
    { label: "GitHub", href: "github.html" },
    { label: "Playground", href: "playground.html" },
    { label: "Resume", href: "resume.html" },
    { label: "Recruiter Search", href: "recruiter-search.html" },
    { label: "Knowledge Base", href: "knowledge.html" },
    { label: "Open Source Hub", href: "opensource.html" },
    { label: "Digital Office", href: "office.html" },
    { label: "3D Workspace", href: "workspace.html" },
    { label: "Guided Tour", href: "tour.html" },
    { label: "Career Assistant", href: "career-assistant.html" },
    { label: "Requirement Analyzer", href: "requirement-analyzer.html" },
    { label: "Resume Matcher", href: "resume-matcher.html" },
    { label: "Dependency Map", href: "dependency-map.html" },
    { label: "GitHub Universe", href: "github-universe.html" },
    { label: "Coding Activity", href: "coding-activity.html" },
    { label: "CLI Portfolio", href: "terminal.html" },
    { label: "System Monitor", href: "system-monitor.html" },
    { label: "Contact", href: "contact.html" }
  ],
  detailRoutes: [
    { label: "Project Details", href: "project-details.html" },
    { label: "Blog Details", href: "blog-details.html" },
    { label: "404 Page", href: "404.html" }
  ],
  servicesList: [
    { label: "Full-Stack MERN Development", href: "services.html" },
    { label: "UI/UX & Design Systems", href: "services.html" },
    { label: "REST API & Database Architecture", href: "services.html" },
    { label: "Performance & Responsive Optimization", href: "services.html" }
  ],
  socialChannels: [
    { key: "github", label: "GitHub", icon: "github" },
    { key: "linkedin", label: "LinkedIn", icon: "linkedin" },
    { key: "facebook", label: "Facebook", icon: "facebook" },
    { key: "fiverr", label: "Fiverr", icon: "briefcase" },
    { key: "upwork", label: "Upwork", icon: "globe" },
    { key: "email", label: "Email", icon: "mail" }
  ]
};

window.portfolioConfig = portfolioConfig;
window.siteRoutes = siteRoutes;
