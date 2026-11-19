/**
 * AL AMIN Portfolio — Global Configuration (Phase 1 + Phase 2)
 * Single source of truth for identity, contact, navigation, services, and social channels.
 */

const portfolioConfig = {
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
  // Optional: Configure service pricing packages here if you wish to publish rates in Client Mode.
  // Leave empty ([]) to show custom project-based scoping instead of fixed pricing cards.
  pricing: []
};

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
      "contact.html"
    ],
    client: [
      "index.html",
      "services.html",
      "projects.html",
      "testimonials.html",
      "contact.html",
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
      "contact.html",
      "services.html",
      "blog.html",
      "testimonials.html"
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
    { label: "GitHub", href: "github.html" },
    { label: "Playground", href: "playground.html" },
    { label: "Resume", href: "resume.html" },
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
