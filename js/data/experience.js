/**
 * AL AMIN Portfolio OS — Centralized Data: Experience & Education Timeline
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  const EXPERIENCE_DATA = [
    {
      id: "exp-mern-studio",
      section: "Work Experience",
      date: "2025 – Present",
      title: "Full-Stack MERN Developer",
      organization: "Independent Product Studio",
      icon: "briefcase",
      description:
        "Architecting and shipping full-stack web applications, SaaS analytics portals, and RESTful APIs with React, Next.js, Node.js, Express, and MongoDB.",
      skills: ["React", "Next.js", "Node.js", "Express", "MongoDB", "Tailwind CSS", "REST API", "JWT Auth"]
    },
    {
      id: "exp-fe-engineer",
      section: "Work Experience",
      date: "2024 – 2025",
      title: "Frontend & UI Engineer",
      organization: "Digital Web Solutions",
      icon: "layout",
      description:
        "Built responsive component systems, converted Figma prototypes into accessible production UI, and improved Core Web Vitals across client web apps.",
      skills: ["HTML5", "CSS3", "JavaScript", "React", "Figma", "Tailwind CSS", "Responsive Design"]
    },
    {
      id: "exp-freelance",
      section: "Freelance",
      date: "2023 – Present",
      title: "Freelance Web Developer & UI Designer",
      organization: "Fiverr, Upwork & Direct Clients",
      icon: "globe",
      description:
        "Partnered with startups and founders to deliver custom websites, e-commerce storefronts, admin dashboards, and SEO-friendly responsive redesigns.",
      skills: ["MERN Stack", "E-commerce", "REST API", "Responsive Design", "SEO"]
    },
    {
      id: "exp-education",
      section: "Education",
      date: "2021 – 2025",
      title: "B.Sc. in Computer Science & Engineering",
      organization: "University Studies · Bangladesh",
      icon: "graduation-cap",
      description:
        "Focused on software engineering principles, algorithms, data structures, relational/non-relational databases, and web architecture.",
      skills: ["Data Structures", "Algorithms", "DBMS", "PostgreSQL", "MongoDB", "Software Engineering"]
    },
    {
      id: "exp-learning",
      section: "Learning Journey",
      date: "2022 – Present",
      title: "Modern Full-Stack & Cloud Craft",
      organization: "Continuous Self-Directed Mastery",
      icon: "sparkles",
      description:
        "Deepened practical skills in JWT authentication, PostgreSQL, Mongoose modeling, multi-tenant SaaS patterns, accessibility, and automated QA.",
      skills: ["TypeScript", "PostgreSQL", "Mongoose", "JWT Auth", "Git", "Security"]
    }
  ];

  const EDUCATION_DATA = {
    degree: "B.Sc. in Computer Science & Engineering",
    institution: "University Studies · Bangladesh",
    period: "2021 – 2025",
    focus: "Algorithms, Data Structures, Database Management Systems (DBMS), and Software Architecture"
  };

  ns.experience = EXPERIENCE_DATA;
  ns.education = EDUCATION_DATA;
  ns.getExperience = () => EXPERIENCE_DATA;
})();
