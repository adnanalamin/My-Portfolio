/**
 * AL AMIN Portfolio OS — Phase 46: Client-Side Resume & Job Description Matcher
 * Privacy-first: 100% in-browser deterministic matching against window.PortfolioData.
 * Never transmits pasted job descriptions over the network and never invents skills or experience.
 */
(() => {
  const MAX_INPUT_LEN = 8000;

  const SAMPLE_JDS = [
    {
      id: "mern-fullstack",
      label: "Full-Stack MERN Engineer",
      text: [
        "Role: Full-Stack MERN Developer",
        "We are hiring a Full-Stack Developer to build scalable SaaS dashboards and e-commerce web applications.",
        "Required Skills & Technologies:",
        "- Strong proficiency with React, Redux, JavaScript (ES6+), HTML5, CSS3, and Tailwind CSS",
        "- Backend REST API development using Node.js, Express, and JWT Authentication",
        "- Database modeling with MongoDB and Mongoose",
        "- Responsive design, cross-browser accessibility (WCAG), SEO, and performance optimization",
        "- Daily Git / GitHub workflow, Postman API testing, and Figma handoff",
        "Nice to Have:",
        "- Next.js, PostgreSQL, and SaaS multi-tenant architecture experience",
        "- TypeScript or automated end-to-end testing (Cypress)"
      ].join("\n")
    },
    {
      id: "frontend-nextjs",
      label: "Frontend React / Next.js UI",
      text: [
        "Role: Frontend & UI Systems Engineer",
        "Looking for a Frontend Engineer focused on modern design systems, dashboard UI, and storefront performance.",
        "Requirements:",
        "- Production experience with React, Next.js, JavaScript, HTML5, CSS3, and Tailwind CSS",
        "- Converting Figma designs into responsive, WCAG-compliant interfaces",
        "- State management with Redux and integration with REST API endpoints",
        "- Core Web Vitals optimization and SEO metadata structure",
        "- Experience with GraphQL, TypeScript, and Jest unit testing preferred"
      ].join("\n")
    },
    {
      id: "python-cloud",
      label: "Python & Kubernetes Backend",
      text: [
        "Role: Senior Cloud Backend Engineer (Python / Kubernetes)",
        "Responsibilities & Requirements:",
        "- 5+ years building microservices in Python, Django, or Go",
        "- Container orchestration with Docker and Kubernetes on AWS or GCP",
        "- PostgreSQL query tuning, Redis caching, and GraphQL federation",
        "- Infrastructure as Code using Terraform and CI/CD pipelines",
        "- REST API design, Git workflows, and security best practices"
      ].join("\n")
    }
  ];

  // Canonical skill & technology patterns mapped to configured PortfolioData entities
  const CONFIGURED_TECH_RULES = [
    { name: "HTML5", aliases: ["html5", "html", "semantic html"], category: "Frontend" },
    { name: "CSS3", aliases: ["css3", "css", "css grid", "flexbox"], category: "Frontend" },
    { name: "Tailwind CSS", aliases: ["tailwind css", "tailwindcss", "tailwind"], category: "Frontend" },
    { name: "JavaScript", aliases: ["javascript", "es6", "es2024", "vanilla js", "ecmascript"], category: "Frontend" },
    { name: "React", aliases: ["react", "react.js", "reactjs", "react hooks"], category: "Frontend" },
    { name: "Redux", aliases: ["redux", "redux toolkit", "rtk"], category: "Frontend" },
    { name: "Next.js", aliases: ["next.js", "nextjs"], category: "Frontend" },
    { name: "Node.js", aliases: ["node.js", "nodejs", "node js"], category: "Backend" },
    { name: "Express", aliases: ["express", "express.js", "expressjs"], category: "Backend" },
    { name: "REST API", aliases: ["rest api", "restful", "rest apis", "restful api", "api development"], category: "Backend" },
    { name: "Authentication", aliases: ["authentication", "auth", "jwt", "jwt auth", "rbac", "role-based access", "role based access"], category: "Backend" },
    { name: "MongoDB", aliases: ["mongodb", "mongo"], category: "Database" },
    { name: "Mongoose", aliases: ["mongoose"], category: "Database" },
    { name: "PostgreSQL", aliases: ["postgresql", "postgres"], category: "Database" },
    { name: "Git", aliases: ["git"], category: "Tools" },
    { name: "GitHub", aliases: ["github"], category: "Tools" },
    { name: "VS Code", aliases: ["vs code", "vscode", "visual studio code"], category: "Tools" },
    { name: "Postman", aliases: ["postman"], category: "Tools" },
    { name: "Figma", aliases: ["figma", "figma handoff", "figma-to-code"], category: "Design" },
    { name: "Responsive Design", aliases: ["responsive design", "responsive web", "responsive ui", "mobile-first", "mobile first", "cross-device"], category: "Design" },
    { name: "SEO", aliases: ["seo", "search engine optimization", "open graph", "metadata"], category: "Other" },
    { name: "Performance Optimization", aliases: ["performance optimization", "web performance", "core web vitals", "lighthouse", "lazy loading", "optimization"], category: "Other" },
    { name: "MERN Stack", aliases: ["mern", "mern stack"], category: "Full-Stack", virtualMatchFrom: ["MongoDB", "Express", "React", "Node.js"] },
    { name: "WCAG / Accessibility", aliases: ["wcag", "accessibility", "a11y", "aria", "keyboard navigation", "screen reader"], category: "Design", evidenceType: "partial-or-strong" }
  ];

  // Adjacent / partially covered items grounded strictly in Experience/Learning/Architecture notes
  const PARTIAL_CONCEPT_RULES = [
    {
      name: "TypeScript",
      aliases: ["typescript", "ts"],
      reason: "Listed under Modern Full-Stack & Cloud Craft continuous learning in Experience, but primary shipped projects in PortfolioData use ES2024 JavaScript rather than TypeScript."
    },
    {
      name: "UI/UX & Design Systems",
      aliases: ["ui/ux", "design system", "design systems", "component library", "wireframes", "prototyping"],
      reason: "Covered through Figma UI/UX implementation, Tailwind token systems, and Component Lab, rather than standalone UX research."
    },
    {
      name: "Security Engineering",
      aliases: ["security", "owasp", "sanitization", "xss", "rate limiting", "input validation"],
      reason: "Covered via JWT authentication, input validation, and static client hardening, though not enterprise SecOps."
    }
  ];

  // External technologies / credentials explicitly recognized if requested in a JD so gaps are surfaced honestly
  const EXTERNAL_GAP_RULES = [
    { name: "Python", aliases: ["python"], category: "Language / Backend" },
    { name: "Django", aliases: ["django"], category: "Backend Framework" },
    { name: "Flask / FastAPI", aliases: ["flask", "fastapi"], category: "Backend Framework" },
    { name: "GraphQL", aliases: ["graphql", "apollo"], category: "API Layer" },
    { name: "Docker", aliases: ["docker", "containerization", "containers"], category: "DevOps" },
    { name: "Kubernetes", aliases: ["kubernetes", "k8s"], category: "DevOps" },
    { name: "AWS", aliases: ["aws", "amazon web services", "ec2", "s3", "lambda"], category: "Cloud Platform" },
    { name: "GCP / Azure", aliases: ["gcp", "google cloud", "azure"], category: "Cloud Platform" },
    { name: "Terraform", aliases: ["terraform", "infrastructure as code", "iac"], category: "DevOps" },
    { name: "CI/CD Pipelines", aliases: ["ci/cd", "github actions", "jenkins", "gitlab ci"], category: "DevOps" },
    { name: "Redis", aliases: ["redis"], category: "Database / Cache" },
    { name: "MySQL", aliases: ["mysql"], category: "Database" },
    { name: "Prisma / SQL ORMs", aliases: ["prisma", "drizzle", "sequelize", "typeorm"], category: "Database ORM" },
    { name: "Vue.js", aliases: ["vue", "vue.js", "vuejs", "nuxt"], category: "Frontend Framework" },
    { name: "Angular", aliases: ["angular"], category: "Frontend Framework" },
    { name: "Java / Spring Boot", aliases: ["java", "spring boot", "spring"], category: "Language / Backend" },
    { name: "Go (Golang)", aliases: ["golang", "go microservices"], category: "Language / Backend" },
    { name: "C# / .NET", aliases: ["c#", ".net", "asp.net"], category: "Language / Backend" },
    { name: "PHP / Laravel", aliases: ["php", "laravel"], category: "Language / Backend" },
    { name: "Ruby on Rails", aliases: ["ruby", "rails", "ruby on rails"], category: "Language / Backend" },
    { name: "Rust", aliases: ["rust"], category: "Language" },
    { name: "Jest / Vitest", aliases: ["jest", "vitest", "unit testing"], category: "Testing" },
    { name: "Cypress / Playwright", aliases: ["cypress", "playwright", "e2e testing"], category: "Testing" },
    { name: "Microservices Architecture", aliases: ["microservices", "service mesh", "kafka", "rabbitmq"], category: "Architecture" },
    { name: "React Native / Flutter", aliases: ["react native", "flutter", "ios", "android", "swift", "kotlin"], category: "Mobile" },
    { name: "Stripe / Payment Gateway Integration", aliases: ["stripe", "payment gateway", "paypal"], category: "Payments" },
    { name: "5+ Years Senior Experience", aliases: ["5+ years", "6+ years", "7+ years", "8+ years", "10+ years", "staff engineer", "principal engineer"], category: "Seniority" }
  ];

  // Domain, project type, service, and keyword rules mapped against Projects / Services / Experience / Certificates
  const DOMAIN_KEYWORD_RULES = [
    { key: "SaaS Platforms", aliases: ["saas", "multi-tenant", "multi tenant", "subscription", "analytics"] },
    { key: "E-commerce & Storefronts", aliases: ["e-commerce", "ecommerce", "storefront", "checkout", "cart", "catalog", "inventory"] },
    { key: "Admin Dashboards & Portals", aliases: ["dashboard", "dashboards", "admin panel", "admin portal", "crud", "telemetry", "operations portal"] },
    { key: "Full-Stack Web Apps", aliases: ["full-stack", "full stack", "web application", "web applications", "end-to-end"] },
    { key: "Frontend & UI Systems", aliases: ["frontend", "front-end", "ui system", "component", "redesign", "conversion"] },
    { key: "Backend & REST APIs", aliases: ["backend", "back-end", "api", "endpoints", "middleware", "validation", "database modeling", "query tuning"] }
  ];

  const CERT_DEMAND_RULES = [
    { key: "Full-Stack / MERN Credentials", aliases: ["full-stack", "full stack", "mern", "bootcamp"], matchedCertIds: ["cert-fullstack-mern"] },
    { key: "Backend & API Credentials", aliases: ["backend", "api", "node.js", "database", "security", "jwt"], matchedCertIds: ["cert-backend-api"] },
    { key: "Frontend & React Credentials", aliases: ["frontend", "react", "redux", "javascript"], matchedCertIds: ["cert-frontend-react"] },
    { key: "Responsive UI & Accessibility Credentials", aliases: ["responsive", "ui", "figma", "wcag", "accessibility", "css grid"], matchedCertIds: ["cert-responsive-ui"] }
  ];

  let lastReport = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToastSafe(message, type) {
    if (window.PortfolioComponents && typeof window.PortfolioComponents.showToast === "function") {
      window.PortfolioComponents.showToast(message, type || "info");
    }
  }

  function refreshIconsSafe() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function matchesAlias(lowerText, alias) {
    const clean = String(alias || "").trim().toLowerCase();
    if (!clean) return false;
    // Escape regex special characters and enforce non-alphanumeric boundaries when safe
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const startsWord = /^[a-z0-9]/.test(clean);
    const endsWord = /[a-z0-9]$/.test(clean);
    const prefix = startsWord ? "(?<![a-z0-9])" : "";
    const suffix = endsWord ? "(?![a-z0-9])" : "";
    try {
      const regex = new RegExp(`${prefix}${escaped}${suffix}`, "i");
      return regex.test(lowerText);
    } catch {
      return lowerText.includes(clean);
    }
  }

  function anyAliasMatches(lowerText, aliases) {
    return (aliases || []).some((a) => matchesAlias(lowerText, a));
  }

  function getConfiguredPortfolioSnapshot() {
    const data = window.PortfolioData || {};
    const skills = typeof data.getSkills === "function" ? data.getSkills() : Array.isArray(data.skills) ? data.skills : [];
    const projects = typeof data.getProjects === "function" ? data.getProjects() : Array.isArray(data.projects) ? data.projects : [];
    const services = typeof data.getServices === "function" ? data.getServices() : Array.isArray(data.services) ? data.services : [];
    const experience = typeof data.getExperience === "function" ? data.getExperience() : Array.isArray(data.experience) ? data.experience : [];
    const certificates = typeof data.getCertificates === "function" ? data.getCertificates() : Array.isArray(data.certificates) ? data.certificates : [];
    const decisions = typeof data.getDecisions === "function" ? data.getDecisions() : Array.isArray(data.decisions) ? data.decisions : [];

    return {
      skills,
      projects,
      services,
      experience,
      certificates,
      decisions,
      education: data.education || null,
      profile: data.profile || (window.portfolioConfig && window.portfolioConfig.brand) || { displayName: "AL AMIN" }
    };
  }

  function countSkillProjects(skillName, projects) {
    const target = String(skillName || "").toLowerCase();
    return projects.filter((p) =>
      Array.isArray(p.technologies) &&
      p.technologies.some((t) => String(t || "").toLowerCase() === target)
    );
  }

  function analyzeJobDescription(rawText) {
    const text = String(rawText || "").trim().slice(0, MAX_INPUT_LEN);
    const lowerText = text.toLowerCase();
    const snapshot = getConfiguredPortfolioSnapshot();

    const skillByName = new Map();
    snapshot.skills.forEach((s) => {
      skillByName.set(String(s.name || "").toLowerCase(), s);
    });

    const strongMatches = [];
    const partialMatches = [];
    const missingRequirements = [];
    const relevantSkillNames = new Set();

    // 1. Evaluate Configured Technical Skills against the pasted JD
    CONFIGURED_TECH_RULES.forEach((rule) => {
      if (!anyAliasMatches(lowerText, rule.aliases)) return;

      if (rule.virtualMatchFrom) {
        const subSkills = rule.virtualMatchFrom.map((n) => skillByName.get(n.toLowerCase())).filter(Boolean);
        if (subSkills.length === rule.virtualMatchFrom.length) {
          subSkills.forEach((s) => relevantSkillNames.add(s.name));
          strongMatches.push({
            label: rule.name,
            dimension: "Technologies & Stack",
            evidence: `Configured across ${rule.virtualMatchFrom.join(", ")} with full-stack MERN projects and Full-Stack MERN certificate.`,
            level: "Core Stack"
          });
          return;
        }
      }

      if (rule.evidenceType === "partial-or-strong") {
        // WCAG / Accessibility: verified in Responsive Web & UI Systems certificate + Responsive Design services,
        // not listed as a standalone Core Stack row in skills.js, or partially covered across frontend craft.
        const certHit = snapshot.certificates.find((c) =>
          (c.skills || []).some((s) => String(s).toLowerCase().includes("wcag"))
        );
        const respSkill = skillByName.get("responsive design");
        if (respSkill) relevantSkillNames.add(respSkill.name);
        if (certHit) {
          strongMatches.push({
            label: rule.name,
            dimension: "Skills & Accessibility",
            evidence: `Verified in "${certHit.title}" credential (${certHit.credentialId}) and Responsive Design practices.`,
            level: "Production"
          });
        } else {
          partialMatches.push({
            label: rule.name,
            dimension: "Skills & Accessibility",
            evidence: "Supported in UI implementation & responsive services, though not broken out as a standalone core skill.",
            level: "Supporting"
          });
        }
        return;
      }

      const configuredSkill = skillByName.get(rule.name.toLowerCase());
      if (!configuredSkill) return;

      relevantSkillNames.add(configuredSkill.name);
      const linkedProjects = countSkillProjects(configuredSkill.name, snapshot.projects);
      const level = configuredSkill.level || "Configured";

      if (level === "Working Knowledge") {
        partialMatches.push({
          label: configuredSkill.name,
          dimension: "Skills & Databases",
          evidence: `Configured at "${level}" (${configuredSkill.category})${linkedProjects.length ? `; used in ${linkedProjects.map((p) => p.title).join(", ")}` : ""}.`,
          level
        });
      } else {
        strongMatches.push({
          label: configuredSkill.name,
          dimension: `Skills · ${configuredSkill.category}`,
          evidence: `Configured at "${level}"${linkedProjects.length ? ` and demonstrated in ${linkedProjects.length} project${linkedProjects.length > 1 ? "s" : ""} (${linkedProjects.slice(0, 3).map((p) => p.title).join(", ")})` : ""}.`,
          level
        });
      }
    });

    // 2. Evaluate Partially Covered Engineering Concepts (Strict honesty)
    PARTIAL_CONCEPT_RULES.forEach((rule) => {
      if (!anyAliasMatches(lowerText, rule.aliases)) return;
      // Avoid double-counting Authentication/Security if Authentication already matched strongly
      if (rule.name === "Security Engineering" && strongMatches.some((m) => m.label === "Authentication")) {
        partialMatches.push({
          label: "Deep AppSec / Audits",
          dimension: "Security",
          evidence: rule.reason,
          level: "Partial"
        });
        return;
      }
      partialMatches.push({
        label: rule.name,
        dimension: "Partial / Learning Alignment",
        evidence: rule.reason,
        level: "Working / Learning"
      });
    });

    // 3. Evaluate External / Unconfigured Requirements (Missing Requirements)
    EXTERNAL_GAP_RULES.forEach((rule) => {
      if (!anyAliasMatches(lowerText, rule.aliases)) return;
      // Double check configured skills dynamically just in case a skill gets added later in data/skills.js
      const existsInSkills = snapshot.skills.some((s) =>
        rule.aliases.some((a) => String(s.name || "").toLowerCase() === a.toLowerCase())
      );
      if (existsInSkills) return;

      missingRequirements.push({
        label: rule.name,
        dimension: rule.category,
        note: `Requested in job description, but not listed as a configured skill or shipped project stack in AL AMIN's portfolio data.`
      });
    });

    // 4. Analyze Relevant Projects (strictly scored from overlap with JD text + matched skills)
    const projectMatches = snapshot.projects
      .map((proj) => {
        const techs = Array.isArray(proj.technologies) ? proj.technologies : [];
        const matchedTechs = techs.filter((t) => {
          const rule = CONFIGURED_TECH_RULES.find((r) => r.name.toLowerCase() === String(t).toLowerCase());
          return (rule && anyAliasMatches(lowerText, rule.aliases)) || matchesAlias(lowerText, t);
        });

        const textBlob = `${proj.title} ${proj.category} ${proj.projectType} ${proj.description}`.toLowerCase();
        const domainHits = DOMAIN_KEYWORD_RULES.filter(
          (d) => anyAliasMatches(lowerText, d.aliases) && anyAliasMatches(textBlob, d.aliases)
        ).map((d) => d.key);

        const score = matchedTechs.length * 2 + domainHits.length * 2;
        return {
          project: proj,
          matchedTechs,
          domainHits,
          score
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // 5. Analyze Services & Domain Keywords
    const detectedDomains = DOMAIN_KEYWORD_RULES.filter((d) => anyAliasMatches(lowerText, d.aliases));
    const serviceMatches = snapshot.services
      .map((srv) => {
        const srvBlob = `${srv.title} ${srv.summary} ${(srv.features || []).join(" ")} ${(srv.technology || []).join(" ")}`.toLowerCase();
        const overlappingTech = (srv.technology || []).filter((t) =>
          matchesAlias(lowerText, t) ||
          CONFIGURED_TECH_RULES.some((r) => r.name.toLowerCase() === String(t).toLowerCase() && anyAliasMatches(lowerText, r.aliases))
        );
        const titleMatched = detectedDomains.some((d) => anyAliasMatches(srvBlob, d.aliases) && anyAliasMatches(lowerText, d.aliases));
        const score = overlappingTech.length + (titleMatched ? 2 : 0);
        return { service: srv, overlappingTech, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // 6. Analyze Experience & Education alignment
    const experienceMatches = snapshot.experience
      .map((exp) => {
        const expBlob = `${exp.title} ${exp.section} ${exp.description} ${(exp.skills || []).join(" ")}`.toLowerCase();
        const overlappingSkills = (exp.skills || []).filter((s) =>
          matchesAlias(lowerText, s) ||
          CONFIGURED_TECH_RULES.some((r) => r.name.toLowerCase() === String(s).toLowerCase() && anyAliasMatches(lowerText, r.aliases))
        );
        const roleHits = DOMAIN_KEYWORD_RULES.filter(
          (d) => anyAliasMatches(lowerText, d.aliases) && anyAliasMatches(expBlob, d.aliases)
        ).length;
        const score = overlappingSkills.length * 2 + roleHits;
        return { experience: exp, overlappingSkills, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // 7. Analyze Certifications
    const certDemands = CERT_DEMAND_RULES.filter((rule) => anyAliasMatches(lowerText, rule.aliases));
    const matchedCertIds = new Set();
    certDemands.forEach((d) => d.matchedCertIds.forEach((id) => matchedCertIds.add(id)));
    const matchedCertificates = snapshot.certificates.filter((c) => matchedCertIds.has(c.id));

    // 8. Keyword Overlap Summary across all 7 required comparison axes
    const keywordMatches = Array.from(
      new Set([
        ...strongMatches.map((m) => m.label),
        ...partialMatches.map((m) => m.label),
        ...detectedDomains.map((d) => d.key)
      ])
    );

    // 9. Transparent Scoring Model
    // Weights total 100 across 4 measurable categories; only active categories (where JD stated requirements) enter normalization
    const techDetectedCount = strongMatches.length + partialMatches.length + missingRequirements.length;
    const techPoints = strongMatches.length * 1.0 + partialMatches.length * 0.5;
    const techRawRatio = techDetectedCount > 0 ? techPoints / techDetectedCount : 0;

    // Project & Services Alignment bucket (scaled by stack alignment when JD specifies core tech)
    const domainDemandCount = detectedDomains.length;
    const domainMatchedCount = detectedDomains.filter((d) =>
      projectMatches.some((pm) => pm.domainHits.includes(d.key)) || serviceMatches.length > 0
    ).length;
    const rawDomainRatio =
      domainDemandCount > 0
        ? Math.min(1, (domainMatchedCount + (projectMatches.length >= 2 ? 0.5 : projectMatches.length * 0.25)) / (domainDemandCount + 0.5))
        : projectMatches.length > 0
          ? Math.min(1, projectMatches.length / 3)
          : 0;
    const stackFactor = techDetectedCount > 0 ? (0.3 + 0.7 * techRawRatio) : 1;
    const projectServiceRatio = rawDomainRatio * stackFactor;

    // Experience & Education Alignment bucket
    const seniorGapPresent = missingRequirements.some((m) => m.dimension === "Seniority");
    let expRatio = 0;
    if (experienceMatches.length > 0) {
      expRatio = Math.min(1, experienceMatches.length / 2) * stackFactor;
      if (seniorGapPresent) expRatio = Math.min(expRatio, 0.5); // Cap honestly if JD asks for 5+ years senior tenure
    } else if (techDetectedCount > 0 && snapshot.experience.length > 0) {
      expRatio = 0;
    }

    // Certifications & Workflow Keywords bucket
    const rawCertRatio =
      certDemands.length > 0
        ? Math.min(1, matchedCertificates.length / certDemands.length)
        : matchedCertificates.length > 0
          ? 1
          : 0;
    const certRatio = rawCertRatio * stackFactor;

    const rawBuckets = [
      {
        id: "skills-tech",
        name: "Skills & Technologies",
        baseWeight: 55,
        active: techDetectedCount > 0,
        ratio: techRawRatio,
        detail: `${strongMatches.length} strong (1.0 pt) + ${partialMatches.length} partial (0.5 pt) out of ${techDetectedCount} detected requirements`
      },
      {
        id: "projects-services",
        name: "Project Experience & Services",
        baseWeight: 25,
        active: domainDemandCount > 0 || projectMatches.length > 0,
        ratio: projectServiceRatio,
        detail: `${projectMatches.length} relevant project${projectMatches.length === 1 ? "" : "s"} & ${serviceMatches.length} aligned service${serviceMatches.length === 1 ? "" : "s"} (stack-adjusted by ${Math.round(stackFactor * 100)}%)`
      },
      {
        id: "experience",
        name: "Experience & Education Fit",
        baseWeight: 10,
        active: experienceMatches.length > 0 || seniorGapPresent,
        ratio: expRatio,
        detail: seniorGapPresent
          ? `${experienceMatches.length} role match(es); stack-adjusted & capped <= 50% due to 5+ years seniority requirement`
          : `${experienceMatches.length} matching timeline entry(ies) from configured Experience (stack-adjusted)`
      },
      {
        id: "certs-keywords",
        name: "Certifications & Domain Keywords",
        baseWeight: 10,
        active: certDemands.length > 0,
        ratio: certRatio,
        detail: `${matchedCertificates.length} matching certificate${matchedCertificates.length === 1 ? "" : "s"} across ${certDemands.length} JD domain area${certDemands.length === 1 ? "" : "s"} (stack-adjusted)`
      }
    ];

    const activeWeightTotal = rawBuckets.reduce((sum, b) => sum + (b.active ? b.baseWeight : 0), 0);
    const hasEnoughSignals = techDetectedCount + domainDemandCount >= 2;

    const breakdown = rawBuckets.map((b) => {
      const normalizedWeight = b.active && activeWeightTotal > 0 ? (b.baseWeight / activeWeightTotal) * 100 : 0;
      const categoryPct = Math.round(b.ratio * 100);
      const weightedPoints = hasEnoughSignals ? (b.ratio * normalizedWeight) : 0;
      return {
        ...b,
        normalizedWeight: Number(normalizedWeight.toFixed(1)),
        categoryPct,
        weightedPoints: Number(weightedPoints.toFixed(1))
      };
    });

    const overallScore = hasEnoughSignals
      ? Math.max(0, Math.min(100, Math.round(breakdown.reduce((sum, b) => sum + b.weightedPoints, 0))))
      : 0;

    const formulaExpression = hasEnoughSignals
      ? breakdown
          .filter((b) => b.active)
          .map((b) => `(${b.categoryPct}% × ${b.normalizedWeight}%)`)
          .join(" + ") + ` = ${overallScore}%`
      : "Insufficient recognizable technical requirements detected (at least 2 tech/domain requirements needed).";

    const verdict = getScoreVerdict(overallScore, hasEnoughSignals);

    // 10. Relevant Skills list sorted by confidence (Core Stack first)
    const relevantSkills = snapshot.skills
      .filter((s) => relevantSkillNames.has(s.name))
      .sort((a, b) => {
        const rank = (lvl) => (lvl === "Core Stack" ? 0 : lvl === "Production" ? 1 : lvl === "Daily Workflow" ? 2 : 3);
        return rank(a.level) - rank(b.level);
      });

    // 11. Recommended Portfolio Pages tailored to JD signals
    const recommendedPages = buildRecommendedPages({
      projectMatches,
      strongMatches,
      missingRequirements,
      matchedCertificates,
      experienceMatches,
      lowerText
    });

    // 12. Suggested Resume Focus
    const suggestedResumeFocus = buildSuggestedResumeFocus({
      overallScore,
      hasEnoughSignals,
      strongMatches,
      partialMatches,
      missingRequirements,
      projectMatches,
      matchedCertificates,
      experienceMatches,
      lowerText
    });

    return {
      analyzedAt: new Date().toISOString(),
      inputCharCount: text.length,
      hasEnoughSignals,
      overallScore,
      verdict,
      formulaExpression,
      breakdown,
      dimensionsSummary: {
        skillsMatched: strongMatches.filter((m) => m.dimension.startsWith("Skills")).length,
        technologiesMatched: strongMatches.length + partialMatches.length,
        projectsMatched: projectMatches.length,
        servicesMatched: serviceMatches.length,
        experienceMatched: experienceMatches.length,
        certificatesMatched: matchedCertificates.length,
        keywordsMatched: keywordMatches.length
      },
      strongMatches,
      partialMatches,
      missingRequirements,
      projectMatches,
      relevantSkills,
      serviceMatches: serviceMatches.slice(0, 4),
      experienceMatches,
      matchedCertificates,
      keywordMatches,
      recommendedPages,
      suggestedResumeFocus
    };
  }

  function getScoreVerdict(score, hasEnoughSignals) {
    if (!hasEnoughSignals) {
      return {
        label: "Insufficient Signals",
        badgeClass: "border-slate-500/40 bg-slate-500/10 text-slate-300",
        summary: "Paste a fuller job description listing specific skills, tools, or project responsibilities."
      };
    }
    if (score >= 75) {
      return {
        label: "Strong Fit",
        badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
        summary: "High alignment with AL AMIN's configured Core Stack, shipped projects, and documented experience."
      };
    }
    if (score >= 45) {
      return {
        label: "Moderate / Transferable Fit",
        badgeClass: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
        summary: "Meaningful overlap across core web technologies, with some secondary tools or unconfigured requirements to bridge."
      };
    }
    if (score >= 20) {
      return {
        label: "Partial Fit (Notable Gaps)",
        badgeClass: "border-amber-500/40 bg-amber-500/10 text-amber-400",
        summary: "Some shared engineering fundamentals, while several primary JD technologies sit outside AL AMIN's configured stack."
      };
    }
    return {
      label: "Low Direct Stack Overlap",
      badgeClass: "border-rose-500/40 bg-rose-500/10 text-rose-400",
      summary: "Most requirements in this description target technologies outside AL AMIN's configured web/MERN portfolio."
    };
  }

  function buildRecommendedPages(ctx) {
    const pages = [
      { title: "Interactive Resume Builder", href: "resume.html", reason: "Tailor role presets and print A4 CV grounded in portfolio data." },
      { title: "Projects & Case Studies", href: "projects.html", reason: `${ctx.projectMatches.length || "Configured"} full-stack and frontend case studies.` },
      { title: "Skills & Tech Stack Matrix", href: "skills.html", reason: "Full proficiency tiers across Frontend, Backend, Database, and Tools." }
    ];

    if (ctx.experienceMatches.length > 0) {
      pages.push({ title: "Work Experience & Education", href: "experience.html", reason: "Review full-stack, frontend, freelance, and B.Sc. CSE timeline." });
    }
    if (ctx.matchedCertificates.length > 0) {
      pages.push({ title: "Certificates & Credentials", href: "certificates.html", reason: `${ctx.matchedCertificates.length} matching certificate(s) with credential IDs.` });
    }
    if (/architecture|scalab|database|system|api/.test(ctx.lowerText)) {
      pages.push({ title: "System Architecture & ADRs", href: "decisions.html", reason: "Inspect ADR trade-offs for MongoDB, PostgreSQL, REST API, and JWT." });
    }
    if (/open source|github|git|slideverse/.test(ctx.lowerText)) {
      pages.push({ title: "Open Source Hub", href: "opensource.html", reason: "Inspect live GitHub repository telemetry and SLIDEVERSE." });
    }

    return pages.slice(0, 6);
  }

  function buildSuggestedResumeFocus(ctx) {
    if (!ctx.hasEnoughSignals) {
      return {
        recommendedPreset: "Full-Stack MERN (Default)",
        leadProjects: ["AstraPulse", "Nexora", "SLIDEVERSE"],
        bullets: [
          "Paste a job description with clear technical requirements to generate tailored emphasis.",
          "Start with the Full-Stack or Recruiter Summary preset on resume.html for a broad overview."
        ]
      };
    }

    const frontendSignals = ctx.strongMatches.filter((m) => /Frontend|Design|Accessibility/i.test(m.dimension)).length;
    const backendSignals = ctx.strongMatches.filter((m) => /Backend|Database/i.test(m.dimension)).length;

    let recommendedPreset = "Full-Stack MERN";
    if (frontendSignals > backendSignals + 1 && !/\bnode\.js\b|\bmongodb\b|\bexpress\b/.test(ctx.lowerText)) {
      recommendedPreset = "Frontend & UI Engineer";
    } else if (backendSignals > frontendSignals) {
      recommendedPreset = "Backend & API Systems Focus";
    }

    const leadProjects = ctx.projectMatches.slice(0, 3).map((pm) => pm.project.title);
    const bullets = [];

    if (ctx.strongMatches.length > 0) {
      bullets.push(
        `Lead the top skills & summary block with verified matches: ${ctx.strongMatches.slice(0, 6).map((m) => m.label).join(", ")}.`
      );
    }
    if (leadProjects.length > 0) {
      bullets.push(
        `Highlight ${leadProjects.join(" and ")} in Selected Projects with exact technologies (${ctx.projectMatches[0].matchedTechs.slice(0, 4).join(", ") || "configured stack"}).`
      );
    }
    if (ctx.matchedCertificates.length > 0) {
      bullets.push(
        `Feature ${ctx.matchedCertificates.slice(0, 2).map((c) => `"${c.title}" (${c.credentialId})`).join(" and ")} under Credentials.`
      );
    }
    if (ctx.partialMatches.length > 0) {
      bullets.push(
        `Present ${ctx.partialMatches.slice(0, 3).map((p) => p.label).join(", ")} transparently as working/learning foundations rather than primary production claims.`
      );
    }
    if (ctx.missingRequirements.length > 0) {
      bullets.push(
        `Prepare to address ${ctx.missingRequirements.length} unconfigured JD requirement(s) (${ctx.missingRequirements.slice(0, 4).map((m) => m.label).join(", ")}) honestly via transferable engineering fundamentals.`
      );
    }

    return {
      recommendedPreset,
      leadProjects: leadProjects.length ? leadProjects : ["AstraPulse", "Nexora"],
      bullets
    };
  }

  function renderResults(report, mountEl, emptyEl) {
    if (!mountEl || !emptyEl) return;

    emptyEl.classList.add("hidden");
    mountEl.classList.remove("hidden");

    const scoreRatio = Math.max(0, Math.min(1, report.overallScore / 100));

    const strongHtml = report.strongMatches.length
      ? report.strongMatches
          .map(
            (m) => `
          <div class="rm-match-card border-emerald-500/25 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <strong class="text-sm text-[var(--text)]">${escapeHtml(m.label)}</strong>
              <span class="text-[11px] font-mono-tech text-emerald-400 shrink-0">${escapeHtml(m.level)}</span>
            </div>
            <p class="text-xs text-[var(--muted)] leading-relaxed">${escapeHtml(m.evidence)}</p>
          </div>`
          )
          .join("")
      : `<p class="text-xs text-[var(--muted)]">No strong direct skill matches detected from the pasted text.</p>`;

    const partialHtml = report.partialMatches.length
      ? report.partialMatches
          .map(
            (m) => `
          <div class="rm-match-card border-amber-500/25 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <strong class="text-sm text-[var(--text)]">${escapeHtml(m.label)}</strong>
              <span class="text-[11px] font-mono-tech text-amber-400 shrink-0">${escapeHtml(m.level)}</span>
            </div>
            <p class="text-xs text-[var(--muted)] leading-relaxed">${escapeHtml(m.evidence)}</p>
          </div>`
          )
          .join("")
      : `<p class="text-xs text-[var(--muted)]">No partial/adjacent requirements flagged in this description.</p>`;

    const missingHtml = report.missingRequirements.length
      ? report.missingRequirements
          .map(
            (m) => `
          <div class="rm-match-card border-rose-500/25 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <strong class="text-sm text-[var(--text)]">${escapeHtml(m.label)}</strong>
              <span class="text-[11px] font-mono-tech text-rose-400 shrink-0">${escapeHtml(m.dimension)}</span>
            </div>
            <p class="text-xs text-[var(--muted)] leading-relaxed">${escapeHtml(m.note)}</p>
          </div>`
          )
          .join("")
      : `<p class="text-xs text-[var(--muted)]">No unconfigured external tools/languages from our missing-requirements lexicon were detected.</p>`;

    const formulaRowsHtml = report.breakdown
      .map(
        (b) => `
        <tr>
          <td>
            <div class="font-semibold text-[var(--text)]">${escapeHtml(b.name)}</div>
            <div class="text-xs text-[var(--muted)]">${escapeHtml(b.detail)}</div>
          </td>
          <td class="whitespace-nowrap text-[var(--text-secondary)]">${b.active ? `${b.categoryPct}%` : "N/A"}</td>
          <td class="whitespace-nowrap text-[var(--muted)]">${b.active ? `${b.normalizedWeight}%` : "0%"}</td>
          <td class="font-semibold text-cyan-400">${b.weightedPoints.toFixed(1)} pts</td>
        </tr>`
      )
      .join("");

    const projectsHtml = report.projectMatches.length
      ? report.projectMatches
          .map(
            (pm) => `
          <a href="${escapeHtml(pm.project.href)}" class="rm-match-card block hover:border-cyan-400 transition-colors space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <strong class="text-sm text-[var(--text)]">${escapeHtml(pm.project.title)}</strong>
              <span class="text-[11px] text-cyan-400 font-semibold">${escapeHtml(pm.project.category)}</span>
            </div>
            <p class="text-xs text-[var(--muted)] line-clamp-2">${escapeHtml(pm.project.description)}</p>
            <p class="text-[11px] font-mono-tech text-emerald-400">
              Matched: ${escapeHtml(pm.matchedTechs.concat(pm.domainHits).join(" · "))}
            </p>
          </a>`
          )
          .join("")
      : `<p class="text-xs text-[var(--muted)]">No matching portfolio projects found for this specific stack.</p>`;

    const relevantSkillsHtml = report.relevantSkills.length
      ? report.relevantSkills
          .map(
            (s) => `
          <div class="rm-match-card flex items-center justify-between gap-2">
            <div>
              <div class="text-xs sm:text-sm font-semibold text-[var(--text)]">${escapeHtml(s.name)}</div>
              <div class="text-[11px] text-[var(--muted)]">${escapeHtml(s.category)}</div>
            </div>
            <span class="text-[11px] font-mono-tech text-indigo-400 shrink-0">${escapeHtml(s.level)}</span>
          </div>`
          )
          .join("")
      : `<p class="text-xs text-[var(--muted)]">No configured skills matched the pasted description directly.</p>`;

    const experienceCertHtml = `
      <div class="rm-two-col">
        <div class="space-y-2">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-indigo-400">Aligned Experience &amp; Services</h4>
          ${
            report.experienceMatches.length
              ? report.experienceMatches
                  .map(
                    (em) => `
                <div class="rm-match-card space-y-1">
                  <div class="text-xs font-bold text-[var(--text)]">${escapeHtml(em.experience.title)}</div>
                  <div class="text-[11px] text-[var(--muted)]">${escapeHtml(em.experience.organization)} · ${escapeHtml(em.experience.date)}</div>
                  ${
                    em.overlappingSkills.length
                      ? `<div class="text-[11px] font-mono-tech text-cyan-400">${escapeHtml(em.overlappingSkills.join(" · "))}</div>`
                      : ""
                  }
                </div>`
                  )
                  .join("")
              : `<p class="text-xs text-[var(--muted)]">No direct experience milestone overlap identified.</p>`
          }
          ${
            report.serviceMatches.length
              ? `<div class="text-xs text-[var(--muted)] pt-1">Aligned Services: <span class="text-[var(--text-secondary)]">${escapeHtml(report.serviceMatches.map((s) => s.service.title).join(" · "))}</span></div>`
              : ""
          }
        </div>
        <div class="space-y-2">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-indigo-400">Matching Certificates &amp; Keywords</h4>
          ${
            report.matchedCertificates.length
              ? report.matchedCertificates
                  .map(
                    (cert) => `
                <div class="rm-match-card space-y-1">
                  <div class="text-xs font-bold text-[var(--text)]">${escapeHtml(cert.title)}</div>
                  <div class="text-[11px] text-[var(--muted)]">${escapeHtml(cert.issuer)} · ${escapeHtml(cert.date)} · ${escapeHtml(cert.credentialId)}</div>
                </div>`
                  )
                  .join("")
              : `<p class="text-xs text-[var(--muted)]">No specific certificate match triggered by JD keywords.</p>`
          }
          <div class="rm-match-card space-y-1">
            <div class="text-xs font-semibold text-[var(--text)]">Matched Keywords (${report.keywordMatches.length})</div>
            <p class="text-xs text-[var(--muted)] leading-relaxed">${
              report.keywordMatches.length ? escapeHtml(report.keywordMatches.join(" · ")) : "None detected"
            }</p>
          </div>
        </div>
      </div>
    `;

    const recommendedPagesHtml = report.recommendedPages
      .map(
        (pg) => `
        <a href="${escapeHtml(pg.href)}" class="rm-match-card block hover:border-cyan-400 transition-colors space-y-1">
          <div class="flex items-center justify-between gap-2 text-xs font-bold text-cyan-400">
            <span>${escapeHtml(pg.title)}</span>
            <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 shrink-0" aria-hidden="true"></i>
          </div>
          <p class="text-xs text-[var(--muted)]">${escapeHtml(pg.reason)}</p>
        </a>`
      )
      .join("");

    const resumeBulletsHtml = report.suggestedResumeFocus.bullets
      .map((b) => `<li class="flex items-start gap-2"><span class="text-cyan-400 font-bold" aria-hidden="true">›</span><span>${escapeHtml(b)}</span></li>`)
      .join("");

    mountEl.innerHTML = `
      <div class="space-y-5">

        <!-- 1. Match Score + Verdict -->
        <section class="rm-panel space-y-4" aria-label="Match Score Summary">
          <div class="rm-score-header">
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-base sm:text-lg font-bold text-[var(--text)]">Overall Match Score</h2>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border ${escapeHtml(report.verdict.badgeClass)}">${escapeHtml(report.verdict.label)}</span>
              </div>
              <p class="text-xs sm:text-sm text-[var(--muted)]">${escapeHtml(report.verdict.summary)}</p>
            </div>
            <div class="rm-score-readout shrink-0">
              <span class="text-3xl sm:text-4xl font-extrabold text-[var(--text)]">${report.overallScore}</span>
              <span class="text-base font-semibold text-cyan-400">%</span>
            </div>
          </div>

          <div class="rm-score-track" role="progressbar" aria-valuenow="${report.overallScore}" aria-valuemin="0" aria-valuemax="100" aria-label="Job match score">
            <div class="rm-score-fill" style="transform: scaleX(${scoreRatio});"></div>
          </div>

          <div class="grid grid-cols-3 gap-2 pt-1 text-center">
            <div class="rm-match-card border-emerald-500/20">
              <div class="text-lg font-bold font-mono-tech text-emerald-400">${report.strongMatches.length}</div>
              <div class="text-[11px] text-[var(--muted)]">Strong Matches</div>
            </div>
            <div class="rm-match-card border-amber-500/20">
              <div class="text-lg font-bold font-mono-tech text-amber-400">${report.partialMatches.length}</div>
              <div class="text-[11px] text-[var(--muted)]">Partial Matches</div>
            </div>
            <div class="rm-match-card border-rose-500/20">
              <div class="text-lg font-bold font-mono-tech text-rose-400">${report.missingRequirements.length}</div>
              <div class="text-[11px] text-[var(--muted)]">Missing Requirements</div>
            </div>
          </div>
        </section>

        <!-- 2. Transparent Scoring Calculation Explanation -->
        <section class="rm-panel space-y-3" aria-label="Transparent Score Formula">
          <div class="space-y-1">
            <h3 class="text-sm sm:text-base font-bold text-[var(--text)]">How This Score Is Calculated (Transparent Formula)</h3>
            <p class="text-xs text-[var(--muted)]">
              Weighted average over categories mentioned in your pasted JD, grounded strictly in <span class="font-mono-tech text-[var(--text-secondary)]">PortfolioData</span> (Strong = 1.0 pt, Partial = 0.5 pt, Missing = 0.0 pt). Active weights normalize to 100% so unmentioned categories never inflate or penalize the result.
            </p>
          </div>
          <div class="overflow-x-auto">
            <table class="rm-formula-table">
              <thead>
                <tr>
                  <th>Evaluation Dimension</th>
                  <th>Raw Fit</th>
                  <th>Weight</th>
                  <th>Contribution</th>
                </tr>
              </thead>
              <tbody>
                ${formulaRowsHtml}
              </tbody>
            </table>
          </div>
          <p class="text-xs font-mono-tech text-cyan-400 bg-slate-950/50 border border-[var(--border)] rounded-lg px-3 py-2 break-words">
            Formula: ${escapeHtml(report.formulaExpression)}
          </p>
        </section>

        <!-- 3. Strong, Partial & Missing Requirements -->
        <section class="rm-panel space-y-4" aria-label="Requirement Match Details">
          <h3 class="text-sm sm:text-base font-bold text-[var(--text)]">Requirements Breakdown</h3>
          <div class="rm-three-col">
            <div class="space-y-2.5">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-emerald-400">Strong Matches</h4>
              ${strongHtml}
            </div>
            <div class="space-y-2.5">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-amber-400">Partial Matches</h4>
              ${partialHtml}
            </div>
            <div class="space-y-2.5">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-rose-400">Missing Requirements</h4>
              ${missingHtml}
            </div>
          </div>
        </section>

        <!-- 4. Relevant Projects & Relevant Skills -->
        <section class="rm-panel space-y-4" aria-label="Relevant Projects and Skills">
          <div class="space-y-2.5">
            <h3 class="text-sm sm:text-base font-bold text-[var(--text)]">Relevant Projects</h3>
            <div class="rm-two-col">${projectsHtml}</div>
          </div>

          <div class="pt-3 border-t border-[var(--border)] space-y-2.5">
            <h3 class="text-sm sm:text-base font-bold text-[var(--text)]">Relevant Configured Skills</h3>
            <div class="rm-two-col">${relevantSkillsHtml}</div>
          </div>
        </section>

        <!-- 5. Experience, Services, Certificates & Keywords -->
        <section class="rm-panel space-y-3" aria-label="Experience, Certifications, and Keywords">
          <h3 class="text-sm sm:text-base font-bold text-[var(--text)]">Experience, Services, Certifications &amp; Keywords</h3>
          ${experienceCertHtml}
        </section>

        <!-- 6. Suggested Resume Focus & Recommended Portfolio Pages -->
        <section class="rm-panel space-y-4" aria-label="Resume Focus and Recommended Pages">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h3 class="text-sm sm:text-base font-bold text-[var(--text)]">Suggested Resume Focus</h3>
              <a href="resume.html" class="text-xs font-semibold text-cyan-400 hover:underline">
                Suggested Preset: ${escapeHtml(report.suggestedResumeFocus.recommendedPreset)} →
              </a>
            </div>
            <ul class="space-y-1.5 text-xs sm:text-sm text-[var(--text-secondary)]">
              ${resumeBulletsHtml}
            </ul>
          </div>

          <div class="pt-3 border-t border-[var(--border)] space-y-2.5">
            <h3 class="text-sm sm:text-base font-bold text-[var(--text)]">Recommended Portfolio Pages</h3>
            <div class="rm-two-col">${recommendedPagesHtml}</div>
          </div>
        </section>

      </div>
    `;

    refreshIconsSafe();
  }

  function formatPlainTextReport(report) {
    if (!report) return "";
    const lines = [
      "AL AMIN PORTFOLIO OS — JOB DESCRIPTION RESUME MATCH REPORT",
      "Processed locally in-browser strictly against configured portfolio data (zero fabrication).",
      "================================================================",
      `Overall Match Score: ${report.overallScore}% (${report.verdict.label})`,
      `Summary: ${report.verdict.summary}`,
      `Formula: ${report.formulaExpression}`,
      "",
      "SCORE BREAKDOWN:",
      ...report.breakdown.map((b) => `- ${b.name}: ${b.active ? `${b.categoryPct}% fit × ${b.normalizedWeight}% weight = ${b.weightedPoints.toFixed(1)} pts` : "Not present in JD (0% weight)"} (${b.detail})`),
      "",
      `STRONG MATCHES (${report.strongMatches.length}):`,
      ...(report.strongMatches.length ? report.strongMatches.map((m) => `- ${m.label} [${m.level}]: ${m.evidence}`) : ["- None detected"]),
      "",
      `PARTIAL MATCHES (${report.partialMatches.length}):`,
      ...(report.partialMatches.length ? report.partialMatches.map((m) => `- ${m.label} [${m.level}]: ${m.evidence}`) : ["- None detected"]),
      "",
      `MISSING REQUIREMENTS (${report.missingRequirements.length}):`,
      ...(report.missingRequirements.length ? report.missingRequirements.map((m) => `- ${m.label} (${m.dimension}): ${m.note}`) : ["- None detected"]),
      "",
      `RELEVANT PROJECTS (${report.projectMatches.length}):`,
      ...(report.projectMatches.length ? report.projectMatches.map((p) => `- ${p.project.title} (${p.project.category}): ${p.matchedTechs.concat(p.domainHits).join(", ")}`) : ["- None detected"]),
      "",
      `RELEVANT SKILLS (${report.relevantSkills.length}):`,
      ...(report.relevantSkills.length ? report.relevantSkills.map((s) => `- ${s.name} (${s.level})`) : ["- None detected"]),
      "",
      `CERTIFICATES (${report.matchedCertificates.length}):`,
      ...(report.matchedCertificates.length ? report.matchedCertificates.map((c) => `- ${c.title} (${c.credentialId}, ${c.date})`) : ["- None detected"]),
      "",
      `SUGGESTED RESUME FOCUS (${report.suggestedResumeFocus.recommendedPreset}):`,
      ...report.suggestedResumeFocus.bullets.map((b) => `- ${b}`),
      "",
      "RECOMMENDED PORTFOLIO PAGES:",
      ...report.recommendedPages.map((p) => `- ${p.title} (${p.href}): ${p.reason}`)
    ];
    return lines.join("\n");
  }

  function setActionButtonsEnabled(enabled) {
    document.querySelectorAll("[data-rm-requires-output]").forEach((btn) => {
      btn.disabled = !enabled;
    });
  }

  function init() {
    const root = document.getElementById("resume-matcher-root");
    if (!root || root.dataset.rmInit === "1") return;
    root.dataset.rmInit = "1";

    const textarea = document.getElementById("rm-jd-input");
    const errorEl = document.getElementById("rm-input-error");
    const analyzeBtn = document.getElementById("rm-analyze-btn");
    const clearBtn = document.getElementById("rm-clear-btn");
    const samplesMount = document.getElementById("rm-samples-mount");
    const emptyEl = document.getElementById("rm-empty-state");
    const resultsMount = document.getElementById("rm-results-mount");
    const copyBtn = document.getElementById("rm-copy-btn");
    const printBtn = document.getElementById("rm-print-btn");
    const downloadBtn = document.getElementById("rm-download-btn");

    // Render Sample JD quick buttons
    if (samplesMount) {
      samplesMount.innerHTML = SAMPLE_JDS.map(
        (s) =>
          `<button type="button" class="rm-preset-btn" data-rm-sample="${escapeHtml(s.id)}">${escapeHtml(s.label)}</button>`
      ).join("");

      samplesMount.querySelectorAll("[data-rm-sample]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-rm-sample");
          const sample = SAMPLE_JDS.find((s) => s.id === id);
          if (!sample || !textarea) return;
          textarea.value = sample.text;
          if (errorEl) errorEl.classList.add("hidden");
          runAnalysis();
        });
      });
    }

    function runAnalysis() {
      if (!textarea) return;
      const val = textarea.value.trim();
      if (val.length < 15) {
        if (errorEl) {
          errorEl.textContent = "Please paste at least a short job description (15+ characters) or select a sample JD below.";
          errorEl.classList.remove("hidden");
        }
        return;
      }
      if (errorEl) errorEl.classList.add("hidden");

      const report = analyzeJobDescription(val);
      lastReport = report;
      renderResults(report, resultsMount, emptyEl);
      setActionButtonsEnabled(true);
    }

    if (analyzeBtn) {
      analyzeBtn.addEventListener("click", runAnalysis);
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (textarea) textarea.value = "";
        if (errorEl) errorEl.classList.add("hidden");
        lastReport = null;
        if (resultsMount) {
          resultsMount.innerHTML = "";
          resultsMount.classList.add("hidden");
        }
        if (emptyEl) emptyEl.classList.remove("hidden");
        setActionButtonsEnabled(false);
        showToastSafe("Job description and match report cleared from memory.", "info");
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        if (!lastReport) return;
        const text = formatPlainTextReport(lastReport);
        try {
          await navigator.clipboard.writeText(text);
          showToastSafe("Match report copied to clipboard.", "success");
        } catch {
          showToastSafe("Unable to access clipboard automatically.", "warning");
        }
      });
    }

    if (printBtn) {
      printBtn.addEventListener("click", () => {
        if (!lastReport) return;
        window.print();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        if (!lastReport) return;
        const text = formatPlainTextReport(lastReport);
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "AL_AMIN_Resume_Match_Report.txt";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToastSafe("Downloaded AL_AMIN_Resume_Match_Report.txt", "success");
      });
    }

    refreshIconsSafe();
  }

  window.PortfolioResumeMatcher = {
    init,
    analyzeJobDescription,
    formatPlainTextReport,
    SAMPLE_JDS
  };
})();
