/**
 * AL AMIN Portfolio OS — Centralized Data: Blog Articles
 */
(() => {
  const ns = (window.PortfolioData = window.PortfolioData || {});

  const CANONICAL_BLOG_POSTS = [
    {
      slug: "architecting-multi-tenant-mern-apps",
      title: "Architecting Multi-Tenant MERN Applications for Sub-200ms Latency",
      category: "MERN",
      readingTime: "7 min read"
    },
    {
      slug: "composable-react-ui-systems",
      title: "Composable React UI Systems Without Prop-Drilling Bloat",
      category: "React",
      readingTime: "6 min read"
    },
    {
      slug: "node-rest-api-validation-patterns",
      title: "Production Node.js REST Validation & Structured Error Handling",
      category: "Node.js",
      readingTime: "6 min read"
    },
    {
      slug: "event-loop-async-concurrency-javascript",
      title: "Understanding the Event Loop and Async Concurrency in Modern JavaScript",
      category: "JavaScript",
      readingTime: "5 min read"
    },
    {
      slug: "zero-layout-shift-responsive-design",
      title: "Engineering Zero-Layout-Shift Responsive Grids from 320px to 2560px",
      category: "Web Development",
      readingTime: "5 min read"
    },
    {
      slug: "practical-ai-assisted-engineering-workflows",
      title: "Practical AI-Assisted Workflows Without Compromising Code Ownership",
      category: "AI",
      readingTime: "5 min read"
    },
    {
      slug: "database-indexing-mental-models",
      title: "Database Indexing Mental Models for Full-Stack Developers",
      category: "Programming",
      readingTime: "6 min read"
    },
    {
      slug: "writing-engineering-case-studies-that-convert",
      title: "Writing Engineering Case Studies That Impress Technical Hiring Teams",
      category: "Career",
      readingTime: "4 min read"
    }
  ].map((post) => ({
    ...post,
    href: `blog-details.html?article=${encodeURIComponent(post.slug)}`
  }));

  function getBlogPosts() {
    if (window.PortfolioBlog && Array.isArray(window.PortfolioBlog.articlesData) && window.PortfolioBlog.articlesData.length) {
      return window.PortfolioBlog.articlesData.map((p) => ({
        ...p,
        href: `blog-details.html?article=${encodeURIComponent(p.slug)}`
      }));
    }
    return CANONICAL_BLOG_POSTS;
  }

  ns.blog = CANONICAL_BLOG_POSTS;
  ns.getBlogPosts = getBlogPosts;
})();
