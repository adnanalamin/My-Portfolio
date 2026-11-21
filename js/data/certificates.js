/**
 * AL AMIN Portfolio OS — Centralized Data: Certificates & Credentials
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  const CERTIFICATES_DATA = [
    {
      id: "cert-fullstack-mern",
      title: "Full-Stack MERN Web Development",
      category: "Full-Stack",
      issuer: "Engineering Bootcamp & Applied Labs",
      date: "2025",
      credentialId: "MERN-2025-01",
      image: "assets/images/certificates/fullstack-mern.svg",
      downloadFile: "AL_AMIN_FullStack_MERN_Certificate.svg",
      skills: ["MongoDB", "Express", "React", "Node.js", "JWT Auth", "REST API"]
    },
    {
      id: "cert-backend-api",
      title: "Node.js API & Database Systems",
      category: "Backend",
      issuer: "Backend Architecture Specialization",
      date: "2025",
      credentialId: "BE-2025-04",
      image: "assets/images/certificates/backend-api.svg",
      downloadFile: "AL_AMIN_Backend_API_Certificate.svg",
      skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "Postman", "Security"]
    },
    {
      id: "cert-frontend-react",
      title: "React & Frontend Architecture",
      category: "Frontend",
      issuer: "Modern Web Engineering Track",
      date: "2024",
      credentialId: "FE-2024-08",
      image: "assets/images/certificates/frontend-react.svg",
      downloadFile: "AL_AMIN_Frontend_React_Certificate.svg",
      skills: ["HTML5", "CSS3", "JavaScript", "React", "Redux", "Tailwind CSS"]
    },
    {
      id: "cert-responsive-ui",
      title: "Responsive Web & UI Systems",
      category: "UI/UX",
      issuer: "Design Systems & Accessibility Program",
      date: "2024",
      credentialId: "UI-2024-11",
      image: "assets/images/certificates/responsive-ui.svg",
      downloadFile: "AL_AMIN_Responsive_UI_Certificate.svg",
      skills: ["Responsive Design", "Figma", "CSS Grid", "WCAG", "Performance"]
    }
  ];

  ns.certificates = CERTIFICATES_DATA;
  ns.getCertificates = () => CERTIFICATES_DATA;
})();
