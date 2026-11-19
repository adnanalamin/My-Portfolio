/**
 * AL AMIN Portfolio — Blog Catalog, Search, Pagination & Article Reader (Phase 8)
 */

const PortfolioBlog = (() => {
  const categories = [
    "All",
    "JavaScript",
    "React",
    "Node.js",
    "MERN",
    "Web Development",
    "AI",
    "Programming",
    "Career"
  ];

  const articlesData = [
    {
      id: "mern-multi-tenant-latency",
      title: "Architecting Multi-Tenant MERN Applications for Sub-200ms Latency",
      slug: "architecting-multi-tenant-mern-apps",
      category: "MERN",
      date: "March 14, 2026",
      readingTime: "7 min read",
      author: "AL AMIN",
      featured: true,
      image: "assets/images/blog/mern-architecture.jpg",
      excerpt:
        "How compound indexing, lean Mongoose projections, and edge-friendly REST caching cut SaaS dashboard response times below 200ms.",
      tags: ["MongoDB", "Express", "React", "Node.js", "SaaS", "Performance"],
      content: [
        {
          id: "why-multi-tenant-queries-slow-down",
          heading: "Why Multi-Tenant Queries Slow Down at Scale",
          paragraphs: [
            "Most MERN applications start fast with a single collection scan and full Mongoose document hydration. Once a workspace table grows past hundreds of thousands of tenant records, unindexed filters and unnecessary virtual getters quickly push p95 latency past 800ms.",
            "The fastest fix rarely requires rewriting your stack. Putting tenant isolation keys first in every compound index and separating read-heavy projections from write transactions removes the primary bottleneck before any caching layer is added."
          ]
        },
        {
          id: "compound-indexes-and-lean-reads",
          heading: "Compound Indexes and Lean Mongoose Projections",
          paragraphs: [
            "Every workspace-scoped endpoint should query with workspaceId as the leading equality predicate, followed by status filters and timestamp sort order. Pairing that index with .lean() skips Mongoose change-tracking overhead and cuts memory churn during list serialization."
          ],
          code: {
            lang: "javascript",
            filename: "models/MetricEvent.js",
            snippet: `const metricEventSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: { type: String, enum: ["ok", "warn", "error"], default: "ok" },
  latencyMs: { type: Number, required: true },
  recordedAt: { type: Date, default: Date.now }
});

// Lead with tenant key, then filter field, then sort order
metricEventSchema.index({ workspaceId: 1, status: 1, recordedAt: -1 });

export async function getRecentEvents(workspaceId) {
  return MetricEvent.find({ workspaceId })
    .select("status latencyMs recordedAt")
    .sort({ recordedAt: -1 })
    .limit(50)
    .lean();
}`
          }
        },
        {
          id: "pre-aggregated-rollups",
          heading: "Pre-Aggregated Time Buckets for Dashboards",
          paragraphs: [
            "Avoid running real-time $group pipelines over raw event logs every time a user switches dashboard tabs. Writing hourly rollup documents alongside raw inserts allows your analytics UI to render 24-hour and 30-day charts in a single indexed range scan."
          ],
          list: [
            "Keep raw logs write-optimized with TTL retention windows.",
            "Store hourly rollups containing request count, error count, and latency percentiles.",
            "Validate tenant ownership inside middleware before executing database queries."
          ]
        }
      ]
    },
    {
      id: "composable-react-ui-systems",
      title: "Composable React UI Systems Without Prop-Drilling Bloat",
      slug: "composable-react-ui-systems",
      category: "React",
      date: "March 04, 2026",
      readingTime: "6 min read",
      author: "AL AMIN",
      featured: false,
      image: "assets/images/blog/react-frontend.jpg",
      excerpt:
        "Using compound components, explicit slot composition, and predictable state boundaries to keep React interfaces clean as features grow.",
      tags: ["React", "Design Systems", "TypeScript", "Frontend", "UI/UX"],
      content: [
        {
          id: "the-configuration-prop-trap",
          heading: "Escaping the Configuration Prop Trap",
          paragraphs: [
            "A component that starts with title and variant flags almost always evolves into a monolith accepting twenty optional booleans like showFooterDivider, iconPosition, and customHeaderClass. Every new requirement forces conditional branching inside one fragile file.",
            "Instead of passing layout flags down through props, invert control back to the caller through JSX composition and dedicated sub-components."
          ]
        },
        {
          id: "compound-component-pattern",
          heading: "Compound Components with Scoped Context",
          paragraphs: [
            "Sharing active tab state or modal open controls through a lightweight local context lets parent containers stay flexible while keeping assistive ARIA wiring synchronized automatically."
          ],
          code: {
            lang: "tsx",
            filename: "components/FilterTabs.tsx",
            snippet: `const TabsContext = createContext<{ active: string; onSelect: (id: string) => void } | null>(null);

export function FilterTabs({ value, onChange, children }) {
  return (
    <TabsContext.Provider value={{ active: value, onSelect: onChange }}>
      <div role="tablist" className="flex flex-wrap gap-2">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

FilterTabs.Item = function TabItem({ id, label }) {
  const ctx = useContext(TabsContext);
  const selected = ctx?.active === id;
  return (
    <button
      role="tab"
      aria-selected={selected}
      onClick={() => ctx?.onSelect(id)}
      className={selected ? "is-active" : ""}
    >
      {label}
    </button>
  );
};`
          }
        },
        {
          id: "keep-state-close-to-usage",
          heading: "Colocating State Where It Changes",
          paragraphs: [
            "Before hoisting UI state to a global store, verify whether two distant branches genuinely read it. Keeping search inputs, drawer toggles, and optimistic edits close to their owning subtrees eliminates unrelated re-renders across the page."
          ]
        }
      ]
    },
    {
      id: "event-loop-microtasks-abort",
      title: "Mastering the Event Loop, Microtasks, and AbortController in Modern JS",
      slug: "mastering-event-loop-microtasks-js",
      category: "JavaScript",
      date: "February 21, 2026",
      readingTime: "8 min read",
      author: "AL AMIN",
      featured: false,
      image: "assets/images/blog/js-async.svg",
      excerpt:
        "A practical breakdown of browser scheduling priorities, race-condition prevention in live search, and cancellable fetch pipelines.",
      tags: ["JavaScript", "Async", "Event Loop", "Fetch API", "Browser"],
      content: [
        {
          id: "microtasks-vs-macrotasks",
          heading: "Microtasks Drain Before the Next Paint",
          paragraphs: [
            "JavaScript executes synchronously on a single call stack, then flushes the entire microtask queue—including resolved Promise callbacks—before handing control back to rendering or macrotasks such as setTimeout.",
            "Because chained microtasks starve frame painting if queued recursively, heavy client calculations should be chunked across animation frames or offloaded to a Web Worker."
          ]
        },
        {
          id: "cancelling-stale-requests",
          heading: "Preventing Out-of-Order Responses with AbortController",
          paragraphs: [
            "Live search bars often suffer from race conditions when an earlier, slower network request resolves after a newer keystroke. Attaching an AbortSignal cancels stale requests cleanly and avoids rendering outdated results."
          ],
          code: {
            lang: "javascript",
            filename: "utils/liveSearch.js",
            snippet: `let activeController = null;

export async function searchCatalog(query) {
  if (activeController) {
    activeController.abort();
  }

  activeController = new AbortController();

  try {
    const response = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`, {
      signal: activeController.signal
    });
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
    return await response.json();
  } catch (err) {
    if (err.name === "AbortError") return null;
    throw err;
  }
}`
          }
        },
        {
          id: "concurrent-batches",
          heading: "Independent Work with Promise.allSettled",
          paragraphs: [
            "When loading non-critical dashboard widgets in parallel, prefer Promise.allSettled over Promise.all so a single degraded endpoint shows a localized fallback without breaking the entire screen."
          ]
        }
      ]
    },
    {
      id: "resilient-express-apis",
      title: "Building Resilient Express APIs with Structured Validation & Error Boundaries",
      slug: "resilient-express-apis-node",
      category: "Node.js",
      date: "February 10, 2026",
      readingTime: "6 min read",
      author: "AL AMIN",
      featured: false,
      image: "assets/images/blog/node-api.svg",
      excerpt:
        "Standardize request parsing, async route wrappers, consistent JSON error envelopes, and graceful process shutdowns in Node.js.",
      tags: ["Node.js", "Express", "REST API", "Backend", "Security"],
      content: [
        {
          id: "never-trust-unvalidated-bodies",
          heading: "Validate Inputs at the Transport Boundary",
          paragraphs: [
            "Allowing unvalidated req.body fields straight into database updates creates mass-assignment bugs and confusing 500 crashes. A strict schema validation middleware strips unknown properties and returns clear 400 field diagnostics immediately."
          ]
        },
        {
          id: "central-error-middleware",
          heading: "Centralized Error Envelopes",
          paragraphs: [
            "Frontend clients work best when every failure shares one predictable JSON shape containing an error code, safe message, and optional validation details—while internal stack traces stay strictly in server logs."
          ],
          code: {
            lang: "javascript",
            filename: "middleware/errorHandler.js",
            snippet: `export class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const payload = {
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: status >= 500 ? "Unexpected server error" : err.message
    }
  };
  res.status(status).json(payload);
}`
          }
        },
        {
          id: "graceful-shutdowns",
          heading: "Graceful SIGTERM Handling",
          paragraphs: [
            "Cloud deployments send SIGTERM before recycling containers. Stop accepting new HTTP connections, let in-flight requests drain, and close database pools cleanly so zero client checkouts get severed mid-write."
          ]
        }
      ]
    },
    {
      id: "structured-llm-pipelines",
      title: "Integrating Structured LLM Pipelines into Full-Stack Web Apps",
      slug: "structured-llm-pipelines-web-apps",
      category: "AI",
      date: "January 29, 2026",
      readingTime: "7 min read",
      author: "AL AMIN",
      featured: false,
      image: "assets/images/blog/ai-engineering.jpg",
      excerpt:
        "Designing server-side AI proxy endpoints with strict JSON schemas, streaming UX feedback, and deterministic fallbacks.",
      tags: ["AI", "LLM", "Node.js", "JSON Schema", "Streaming"],
      content: [
        {
          id: "keep-credentials-server-side",
          heading: "Keep Model Credentials Strictly Server-Side",
          paragraphs: [
            "Never expose model provider keys in browser bundles. Route AI features through thin backend API endpoints where rate limits, prompt templates, and token budgets can be enforced safely before forwarding requests."
          ]
        },
        {
          id: "enforce-typed-json-outputs",
          heading: "Enforce Deterministic JSON Schemas",
          paragraphs: [
            "Unstructured prose breaks automated UI workflows. Request schema-constrained JSON responses and verify parsed payloads on the server before updating application state."
          ],
          code: {
            lang: "typescript",
            filename: "server/routes/summarize.ts",
            snippet: `import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractActionItems(notes: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: \`Extract concise engineering action items:\n\n\${notes}\`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["items"]
      }
    }
  });
  return JSON.parse(response.text || '{"items":[]}');
}`
          }
        },
        {
          id: "design-for-latency",
          heading: "Designing Calm UI States for Model Latency",
          paragraphs: [
            "Model inference takes noticeably longer than standard CRUD reads. Provide clear loading indicators, disable duplicate submits, and stream incremental chunks whenever generating long-form content."
          ]
        }
      ]
    },
    {
      id: "zero-bloat-core-web-vitals",
      title: "Zero-Bloat Performance: Achieving Crisp Core Web Vitals Across 320px–2560px",
      slug: "zero-bloat-core-web-vitals",
      category: "Web Development",
      date: "January 18, 2026",
      readingTime: "5 min read",
      author: "AL AMIN",
      featured: false,
      image: "assets/images/blog/web-perf.svg",
      excerpt:
        "Practical layout stability, compositor-only motion, fluid clamp() typography, and responsive image sizing without heavy runtime bundles.",
      tags: ["Web Development", "Performance", "CSS3", "Responsive Design", "SEO"],
      content: [
        {
          id: "reserve-aspect-ratios-early",
          heading: "Reserve Media Dimensions to Eliminate Layout Shift",
          paragraphs: [
            "Cumulative Layout Shift happens mostly because images load without reserved vertical space. Setting explicit aspect-ratio rules on media containers keeps cards locked steady before network bytes arrive."
          ]
        },
        {
          id: "compositor-transforms-only",
          heading: "Animate Transform and Opacity Only",
          paragraphs: [
            "Animating width, height, top, or margin forces the browser to recalculate geometry on every frame. Stick strictly to transform and opacity transitions—and always honor prefers-reduced-motion."
          ],
          code: {
            lang: "css",
            filename: "css/motion.css",
            snippet: `.card-media img {
  aspect-ratio: 4 / 3;
  width: 100%;
  object-fit: cover;
  transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.card:hover .card-media img {
  transform: scale(1.05);
}

@media (prefers-reduced-motion: reduce) {
  .card-media img {
    transition: none;
  }
}`
          }
        },
        {
          id: "fluid-typography-without-clipping",
          heading: "Fluid Typography Across Mobile and 4K Viewports",
          paragraphs: [
            "Using clamp() lets headlines scale smoothly between 320px phones and 2560px monitors without awkward breakpoint jumps or horizontal overflow."
          ]
        }
      ]
    },
    {
      id: "clean-module-boundaries",
      title: "Clean Module Boundaries: Separating Domain Logic from Framework Glue",
      slug: "clean-module-boundaries-architecture",
      category: "Programming",
      date: "January 05, 2026",
      readingTime: "6 min read",
      author: "AL AMIN",
      featured: false,
      image: "assets/images/blog/programming-patterns.svg",
      excerpt:
        "Why keeping business rules inside pure framework-agnostic modules makes testing, refactoring, and UI rewrites effortless.",
      tags: ["Programming", "Architecture", "Clean Code", "TypeScript", "Testing"],
      content: [
        {
          id: "framework-churn-vs-domain-rules",
          heading: "Separate What Changes Slowly From What Churns",
          paragraphs: [
            "UI libraries, routing conventions, and ORMs evolve every couple of years. Pricing formulas, permission checks, and state transitions rarely do. Keeping pure business functions free of HTTP or React imports protects your core logic from framework churn."
          ]
        },
        {
          id: "pure-domain-functions",
          heading: "Testing Pure Domain Functions in Milliseconds",
          paragraphs: [
            "When tax totals, discount eligibility, or scheduling rules accept plain JavaScript objects and return plain results, unit tests require zero mocked databases or DOM environments."
          ],
          code: {
            lang: "typescript",
            filename: "domain/invoiceTotals.ts",
            snippet: `export function calculateInvoiceSummary(items, taxRate = 0.08) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  return {
    subtotal,
    tax,
    total: Math.round((subtotal + tax) * 100) / 100
  };
}`
          }
        }
      ]
    },
    {
      id: "freelancer-to-product-engineer",
      title: "From Solo Freelancer to Full-Stack Product Engineer: Lessons From Shipping Real Apps",
      slug: "solo-freelancer-to-product-engineer",
      category: "Career",
      date: "December 19, 2025",
      readingTime: "5 min read",
      author: "AL AMIN",
      featured: false,
      image: "assets/images/blog/career-craft.jpg",
      excerpt:
        "What building client dashboards, storefronts, and end-to-end MVPs taught me about scoping, communication, and maintainable delivery.",
      tags: ["Career", "Freelancing", "Full-Stack", "Product Engineering"],
      content: [
        {
          id: "clarify-outcomes-before-code",
          heading: "Clarify Business Outcomes Before Writing Code",
          paragraphs: [
            "Early in my freelance work, I focused purely on shipping requested screens as fast as possible. Over time I learned the highest-leverage skill is asking why a feature exists first—often simplifying three complex workflows into one intuitive view."
          ],
          list: [
            "Document acceptance criteria and edge cases before sprint kickoff.",
            "Demo working increments early rather than hiding behind silent weeks.",
            "Treat mobile responsiveness and accessibility as baseline craftsmanship."
          ]
        },
        {
          id: "build-reusable-starters",
          heading: "Compound Velocity Through Reusable Architecture",
          paragraphs: [
            "Every project teaches patterns worth keeping: clean authentication guards, structured error handlers, accessible modal focus management, and semantic design tokens. Turning those lessons into clean checklists compounds delivery speed without sacrificing quality."
          ]
        }
      ]
    },
    {
      id: "mongodb-indexing-saas",
      title: "MongoDB Indexing & Aggregation Patterns for SaaS Dashboards",
      slug: "mongodb-indexing-aggregation-saas",
      category: "MERN",
      date: "December 02, 2025",
      readingTime: "7 min read",
      author: "AL AMIN",
      featured: false,
      image: "assets/images/projects/astrapulse.jpg",
      excerpt:
        "Designing ESR-ordered indexes, cursor pagination, and lightweight aggregation stages for fast MongoDB-backed admin dashboards.",
      tags: ["MongoDB", "MERN", "Database", "Backend", "Dashboard"],
      content: [
        {
          id: "esr-rule-for-indexes",
          heading: "Follow the Equality, Sort, Range (ESR) Rule",
          paragraphs: [
            "Ordering index keys deliberately—equality fields first, sort keys second, range predicates last—ensures MongoDB fulfills queries directly from B-tree order instead of performing expensive in-memory sorts."
          ]
        },
        {
          id: "cursor-pagination-over-skip",
          heading: "Cursor Pagination Beats Large skip() Offsets",
          paragraphs: [
            "Calling .skip(10000) forces the database engine to scan and discard ten thousand index entries before returning twenty rows. Passing the last seen _id or timestamp keeps page-fifty queries as fast as page one."
          ],
          code: {
            lang: "javascript",
            filename: "services/auditFeed.js",
            snippet: `export async function fetchAuditPage({ workspaceId, cursorDate, limit = 20 }) {
  const query = { workspaceId };
  if (cursorDate) {
    query.createdAt = { $lt: new Date(cursorDate) };
  }

  return AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("actor action createdAt")
    .lean();
}`
          }
        }
      ]
    }
  ];

  const state = {
    activeCategory: "All",
    activeTag: "",
    searchQuery: "",
    currentPage: 1,
    perPage: 6,
    articles: articlesData
  };

  function escHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function getArticlePlainText(article) {
    const parts = [
      article.title,
      article.category,
      article.excerpt,
      ...(article.tags || [])
    ];
    (article.content || []).forEach((block) => {
      if (block.heading) parts.push(block.heading);
      if (Array.isArray(block.paragraphs)) parts.push(...block.paragraphs);
      if (Array.isArray(block.list)) parts.push(...block.list);
      if (block.code && block.code.snippet) parts.push(block.code.snippet);
    });
    return parts.join(" ").toLowerCase();
  }

  function getSelectedArticleSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get("article") || "";
  }

  function getFilteredArticles() {
    return articlesData.filter((article) => {
      const catMatch =
        state.activeCategory === "All" || article.category === state.activeCategory;
      if (!catMatch) return false;

      if (state.activeTag) {
        const tagLower = state.activeTag.toLowerCase();
        const hasTag = (article.tags || []).some((t) => t.toLowerCase() === tagLower);
        if (!hasTag) return false;
      }

      if (state.searchQuery) {
        return getArticlePlainText(article).includes(state.searchQuery);
      }

      return true;
    });
  }

  /* ========================================================================
     Blog Index Page (blog.html)
     ======================================================================== */

  function initBlogIndex() {
    const root = document.getElementById("blog-index-root");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const paramCat = params.get("category");
    const paramTag = params.get("tag");
    if (paramCat && categories.includes(paramCat)) {
      state.activeCategory = paramCat;
    }
    if (paramTag) {
      state.activeTag = paramTag;
    }

    const featuredMount = document.getElementById("blog-featured-mount");
    const tabsMount = document.getElementById("blog-filter-tabs");
    const gridMount = document.getElementById("blog-articles-grid");
    const countEl = document.getElementById("blog-results-count");
    const activeTagBanner = document.getElementById("blog-active-tag-banner");
    const paginationMount = document.getElementById("blog-pagination");
    const searchInput = document.getElementById("blog-search-input");
    const searchClear = document.getElementById("blog-search-clear");

    function renderFeatured() {
      if (!featuredMount) return;
      const featured = articlesData.find((a) => a.featured) || articlesData[0];
      if (!featured) return;

      const tagsLine = featured.tags.slice(0, 4).map((t) => `#${escHtml(t)}`).join(" · ");

      featuredMount.innerHTML = `
        <article class="glass-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <a
            href="blog-details.html?article=${encodeURIComponent(featured.slug)}"
            class="lg:col-span-6 block overflow-hidden bg-[var(--surface)] relative group"
            aria-label="Read featured article: ${escHtml(featured.title)}"
          >
            <img
              src="${escHtml(featured.image)}"
              alt="${escHtml(featured.title)}"
              decoding="async"
              referrerpolicy="no-referrer"
              onerror="this.src='assets/images/projects/portfolio-system.jpg'"
              class="w-full h-full aspect-[4/3] lg:aspect-auto object-cover transition-transform duration-500 group-hover:scale-105"
            >
          </a>
          <div class="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
            <div class="space-y-4">
              <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                <span class="font-semibold text-indigo-400">Featured</span>
                <span aria-hidden="true">·</span>
                <span class="font-medium text-cyan-400">${escHtml(featured.category)}</span>
                <span aria-hidden="true">·</span>
                <span class="tabular-nums">${escHtml(featured.date)}</span>
                <span aria-hidden="true">·</span>
                <span class="tabular-nums">${escHtml(featured.readingTime)}</span>
              </div>

              <h2 class="text-2xl sm:text-3xl font-bold text-[var(--text)] leading-tight text-balance">
                <a href="blog-details.html?article=${encodeURIComponent(featured.slug)}" class="hover:text-indigo-400 transition-colors">
                  ${escHtml(featured.title)}
                </a>
              </h2>

              <p class="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                ${escHtml(featured.excerpt)}
              </p>

              <p class="text-xs font-mono-tech text-[var(--muted)]">${tagsLine}</p>
            </div>

            <div class="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
                <img
                  src="assets/images/profile.jpg"
                  alt="${escHtml(featured.author)}"
                  class="w-7 h-7 rounded-full object-cover border border-[var(--border)]"
                  onerror="this.src='assets/images/profile-placeholder.svg'"
                >
                <span class="font-medium">${escHtml(featured.author)}</span>
              </div>

              <a href="blog-details.html?article=${encodeURIComponent(featured.slug)}" class="primary-button text-xs sm:text-sm py-2 px-4 min-h-[40px]">
                <span>Read Featured Article</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
            </div>
          </div>
        </article>
      `;
    }

    function renderTabs() {
      if (!tabsMount) return;
      tabsMount.setAttribute("role", "tablist");
      tabsMount.innerHTML = categories
        .map((cat) => {
          const isActive = state.activeCategory === cat;
          return `
            <button
              type="button"
              role="tab"
              aria-selected="${isActive ? "true" : "false"}"
              data-blog-cat="${escHtml(cat)}"
              class="skill-tab-btn ${isActive ? "is-active" : ""}"
            >
              ${escHtml(cat)}
            </button>
          `;
        })
        .join("");

      tabsMount.querySelectorAll("[data-blog-cat]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const next = btn.getAttribute("data-blog-cat") || "All";
          if (next === state.activeCategory) return;
          state.activeCategory = next;
          state.currentPage = 1;
          renderTabs();
          renderArticles(true);
        });
      });
    }

    function renderActiveTagBanner() {
      if (!activeTagBanner) return;
      if (!state.activeTag) {
        activeTagBanner.innerHTML = "";
        activeTagBanner.classList.add("hidden");
        return;
      }
      activeTagBanner.classList.remove("hidden");
      activeTagBanner.innerHTML = `
        <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
          <span>Filtered by tag: <strong class="text-indigo-400">#${escHtml(state.activeTag)}</strong></span>
          <button type="button" id="blog-clear-tag-btn" class="outline-button text-xs py-1 px-2.5 min-h-[30px]">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
            <span>Clear tag</span>
          </button>
        </div>
      `;
      const clearTagBtn = document.getElementById("blog-clear-tag-btn");
      if (clearTagBtn) {
        clearTagBtn.addEventListener("click", () => {
          state.activeTag = "";
          state.currentPage = 1;
          const url = new URL(window.location.href);
          url.searchParams.delete("tag");
          window.history.replaceState({}, "", url.toString());
          renderActiveTagBanner();
          renderArticles(true);
        });
      }
    }

    function renderPagination(totalItems) {
      if (!paginationMount) return;
      const totalPages = Math.ceil(totalItems / state.perPage);
      if (totalPages <= 1) {
        paginationMount.innerHTML = "";
        return;
      }

      if (state.currentPage > totalPages) state.currentPage = totalPages;

      const pageButtons = [];
      for (let i = 1; i <= totalPages; i += 1) {
        const isCurrent = i === state.currentPage;
        pageButtons.push(`
          <button
            type="button"
            data-blog-page="${i}"
            aria-label="Page ${i}"
            aria-current="${isCurrent ? "page" : "false"}"
            class="pagination-btn tabular-nums ${isCurrent ? "is-active" : ""}"
          >
            ${i}
          </button>
        `);
      }

      paginationMount.innerHTML = `
        <nav aria-label="Blog pagination" class="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            id="blog-page-prev"
            class="secondary-button text-xs sm:text-sm py-2 px-4 min-h-[40px]"
            ${state.currentPage === 1 ? "disabled" : ""}
          >
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
            <span>Previous</span>
          </button>

          <div class="flex items-center gap-1.5">${pageButtons.join("")}</div>

          <button
            type="button"
            id="blog-page-next"
            class="secondary-button text-xs sm:text-sm py-2 px-4 min-h-[40px]"
            ${state.currentPage === totalPages ? "disabled" : ""}
          >
            <span>Next</span>
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
        </nav>
      `;

      const scrollToGrid = () => {
        const section = document.getElementById("blog-articles-anchor");
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      };

      paginationMount.querySelectorAll("[data-blog-page]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const targetPage = Number(btn.getAttribute("data-blog-page") || "1");
          if (targetPage === state.currentPage) return;
          state.currentPage = targetPage;
          renderArticles(true);
          scrollToGrid();
        });
      });

      const prevBtn = document.getElementById("blog-page-prev");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (state.currentPage <= 1) return;
          state.currentPage -= 1;
          renderArticles(true);
          scrollToGrid();
        });
      }

      const nextBtn = document.getElementById("blog-page-next");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (state.currentPage >= totalPages) return;
          state.currentPage += 1;
          renderArticles(true);
          scrollToGrid();
        });
      }
    }

    function renderArticles(animate = false) {
      if (!gridMount) return;

      const filtered = getFilteredArticles();
      const totalItems = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / state.perPage));
      if (state.currentPage > totalPages) state.currentPage = 1;

      const startIdx = (state.currentPage - 1) * state.perPage;
      const pageItems = filtered.slice(startIdx, startIdx + state.perPage);

      if (countEl) {
        countEl.textContent = `${totalItems} ${totalItems === 1 ? "article" : "articles"}`;
      }

      renderActiveTagBanner();

      if (totalItems === 0) {
        gridMount.innerHTML = `
          <div class="glass-card p-8 sm:p-10 text-center space-y-4 col-span-full">
            <i data-lucide="book-open" class="w-8 h-8 text-indigo-400 mx-auto"></i>
            <h3 class="text-lg font-bold text-[var(--text)]">No matching articles found</h3>
            <p class="text-sm text-[var(--muted)] max-w-md mx-auto">
              Try clearing your search terms or switching back to all engineering categories.
            </p>
            <button type="button" id="blog-reset-btn" class="secondary-button mx-auto">
              Reset Search &amp; Filters
            </button>
          </div>
        `;
        renderPagination(0);
        const resetBtn = document.getElementById("blog-reset-btn");
        if (resetBtn) {
          resetBtn.addEventListener("click", () => {
            state.activeCategory = "All";
            state.activeTag = "";
            state.searchQuery = "";
            state.currentPage = 1;
            if (searchInput) searchInput.value = "";
            if (searchClear) searchClear.classList.add("hidden");
            renderTabs();
            renderArticles(true);
          });
        }
        refreshIcons();
        return;
      }

      gridMount.innerHTML = pageItems
        .map((article, idx) => {
          const animClass = animate ? "skill-card-enter" : "reveal";
          const delayStyle = animate ? `style="--card-delay: ${idx * 35}ms;"` : "";
          const tagsPreview = article.tags
            .slice(0, 3)
            .map((tag) => `#${escHtml(tag)}`)
            .join(" · ");

          return `
            <article class="glass-card project-card hover-lift flex flex-col justify-between overflow-hidden ${animClass}" ${delayStyle}>
              <div>
                <a
                  href="blog-details.html?article=${encodeURIComponent(article.slug)}"
                  class="project-media-box block"
                  aria-label="Read ${escHtml(article.title)}"
                >
                  <img
                    src="${escHtml(article.image)}"
                    alt="${escHtml(article.title)}"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    onerror="this.src='assets/images/projects/portfolio-system.jpg'"
                    class="w-full h-full object-cover"
                  >
                  <div class="project-media-gradient"></div>
                </a>

                <div class="p-5 sm:p-6 space-y-3">
                  <div class="flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted)]">
                    <span class="font-semibold text-indigo-400">${escHtml(article.category)}</span>
                    <span aria-hidden="true">·</span>
                    <span class="tabular-nums">${escHtml(article.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span class="tabular-nums">${escHtml(article.readingTime)}</span>
                  </div>

                  <h3 class="text-lg sm:text-xl font-bold text-[var(--text)] leading-snug">
                    <a href="blog-details.html?article=${encodeURIComponent(article.slug)}" class="hover:text-indigo-400 transition-colors">
                      ${escHtml(article.title)}
                    </a>
                  </h3>

                  <p class="text-sm text-[var(--muted)] leading-relaxed">
                    ${escHtml(article.excerpt)}
                  </p>
                </div>
              </div>

              <div class="px-5 sm:px-6 pb-5 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
                <span class="text-xs font-mono-tech text-[var(--muted)] truncate">${tagsPreview}</span>
                <a
                  href="blog-details.html?article=${encodeURIComponent(article.slug)}"
                  class="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-cyan-400 inline-flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors"
                >
                  <span>Read</span>
                  <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </a>
              </div>
            </article>
          `;
        })
        .join("");

      renderPagination(totalItems);
      refreshIcons();

      if (!animate && window.PortfolioAnimations) {
        window.PortfolioAnimations.initScrollReveal();
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.searchQuery = searchInput.value.trim().toLowerCase();
        state.currentPage = 1;
        if (searchClear) searchClear.classList.toggle("hidden", state.searchQuery === "");
        renderArticles(true);
      });
    }

    if (searchClear) {
      searchClear.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
        }
        state.searchQuery = "";
        state.currentPage = 1;
        searchClear.classList.add("hidden");
        renderArticles(true);
      });
    }

    renderFeatured();
    renderTabs();
    renderArticles(false);
  }

  /* ========================================================================
     Blog Details Page (blog-details.html)
     ======================================================================== */

  function initReadingProgress(articleBodyEl) {
    const bar = document.getElementById("blog-reading-progress-bar");
    const percentLabel = document.getElementById("reading-progress-percent");
    if (!bar || !articleBodyEl) return;

    let ticking = false;

    function update() {
      ticking = false;
      const rect = articleBodyEl.getBoundingClientRect();
      const totalScrollable = Math.max(1, articleBodyEl.offsetHeight - window.innerHeight * 0.55);
      const passed = Math.max(0, window.innerHeight * 0.35 - rect.top);
      const ratio = Math.min(1, Math.max(0, passed / totalScrollable));
      const pct = Math.round(ratio * 100);

      bar.style.transform = `scaleX(${ratio})`;
      bar.setAttribute("aria-valuenow", String(pct));
      if (percentLabel) {
        percentLabel.textContent = `${pct}% read`;
      }
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );

    window.addEventListener("resize", update, { passive: true });
    update();
  }

  function initBlogDetails() {
    const root = document.getElementById("blog-details-root");
    if (!root) return;

    const slug = getSelectedArticleSlug();
    const currentIndex = slug
      ? articlesData.findIndex((a) => a.slug === slug)
      : 0;
    const articleIndex = currentIndex >= 0 ? currentIndex : 0;
    const article = articlesData[articleIndex];
    if (!article) return;

    document.title = `${article.title} — AL AMIN`;
    const breadcrumbEl = document.getElementById("blog-breadcrumb-title");
    if (breadcrumbEl) breadcrumbEl.textContent = article.title;

    const jsonLdEl = document.getElementById("blog-posting-jsonld");
    if (jsonLdEl) {
      jsonLdEl.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.title,
        description: article.excerpt,
        image: article.image,
        datePublished: article.date,
        keywords: (article.tags || []).join(", "),
        author: {
          "@type": "Person",
          name: article.author || "AL AMIN"
        },
        publisher: {
          "@type": "Person",
          name: "AL AMIN"
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://example.com/blog-details.html?article=${encodeURIComponent(article.slug)}`
        }
      });
    }

    const headerMount = document.getElementById("article-header-mount");
    const mediaMount = document.getElementById("article-featured-media");
    const tocMount = document.getElementById("article-toc-list");
    const contentMount = document.getElementById("article-prose-body");
    const tagsMount = document.getElementById("article-tags-mount");
    const shareMount = document.getElementById("article-share-mount");
    const prevNextMount = document.getElementById("article-prev-next-mount");
    const relatedMount = document.getElementById("article-related-mount");

    if (headerMount) {
      headerMount.innerHTML = `
        <div class="space-y-4 max-w-3xl">
          <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[var(--muted)]">
            <a href="blog.html?category=${encodeURIComponent(article.category)}" class="font-semibold text-indigo-400 hover:text-cyan-400 transition-colors">
              ${escHtml(article.category)}
            </a>
            <span aria-hidden="true">·</span>
            <time class="tabular-nums">${escHtml(article.date)}</time>
            <span aria-hidden="true">·</span>
            <span class="tabular-nums">${escHtml(article.readingTime)}</span>
          </div>

          <h1 class="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] leading-tight text-balance">
            ${escHtml(article.title)}
          </h1>

          <p class="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
            ${escHtml(article.excerpt)}
          </p>

          <div class="flex items-center gap-3 pt-2">
            <img
              src="assets/images/profile.jpg"
              alt="${escHtml(article.author)}"
              class="w-10 h-10 rounded-full object-cover border border-[var(--border-strong)]"
              onerror="this.src='assets/images/profile-placeholder.svg'"
            >
            <div class="text-xs sm:text-sm">
              <p class="font-semibold text-[var(--text)]">${escHtml(article.author)}</p>
              <p class="text-[var(--muted)]">Full-Stack Developer &amp; Creative Designer</p>
            </div>
          </div>
        </div>
      `;
    }

    if (mediaMount) {
      mediaMount.innerHTML = `
        <figure class="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <img
            src="${escHtml(article.image)}"
            alt="${escHtml(article.title)}"
            decoding="async"
            referrerpolicy="no-referrer"
            onerror="this.src='assets/images/projects/portfolio-system.jpg'"
            class="w-full max-h-[520px] aspect-[16/9] sm:aspect-[16/9] object-cover"
          >
        </figure>
      `;
    }

    if (tocMount) {
      tocMount.innerHTML = (article.content || [])
        .map(
          (sec, idx) => `
          <li>
            <a
              href="#${escHtml(sec.id)}"
              data-toc-target="${escHtml(sec.id)}"
              class="blog-toc-link ${idx === 0 ? "is-active" : ""}"
            >
              ${escHtml(sec.heading)}
            </a>
          </li>
        `
        )
        .join("");
    }

    if (contentMount) {
      contentMount.innerHTML = (article.content || [])
        .map((sec) => {
          const paras = (sec.paragraphs || [])
            .map((p) => `<p>${escHtml(p)}</p>`)
            .join("");

          const listHtml = Array.isArray(sec.list)
            ? `<ul>${sec.list.map((li) => `<li>${escHtml(li)}</li>`).join("")}</ul>`
            : "";

          const codeHtml = sec.code
            ? `
              <div class="blog-code-block my-6">
                <div class="blog-code-header">
                  <div class="flex items-center gap-2 text-xs font-mono-tech text-slate-300 truncate">
                    <span class="text-cyan-400 font-semibold">${escHtml(sec.code.lang)}</span>
                    <span aria-hidden="true">·</span>
                    <span class="truncate">${escHtml(sec.code.filename)}</span>
                  </div>
                  <button
                    type="button"
                    class="blog-copy-btn"
                    data-copy-code
                    aria-label="Copy code snippet"
                  >
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                    <span>Copy</span>
                  </button>
                </div>
                <pre><code>${escHtml(sec.code.snippet)}</code></pre>
              </div>
            `
            : "";

          return `
            <section id="${escHtml(sec.id)}" class="blog-article-section space-y-4">
              <h2>${escHtml(sec.heading)}</h2>
              ${paras}
              ${listHtml}
              ${codeHtml}
            </section>
          `;
        })
        .join("");

      contentMount.querySelectorAll("[data-copy-code]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const pre = btn.closest(".blog-code-block")?.querySelector("pre code");
          if (!pre) return;
          const text = pre.textContent || "";
          try {
            await navigator.clipboard.writeText(text);
            const label = btn.querySelector("span");
            if (label) label.textContent = "Copied";
            if (typeof window.showToast === "function") {
              window.showToast("Code copied to clipboard", "success");
            }
            window.setTimeout(() => {
              if (label) label.textContent = "Copy";
            }, 1800);
          } catch (_err) {
            if (typeof window.showToast === "function") {
              window.showToast("Unable to copy automatically", "warning");
            }
          }
        });
      });
    }

    if (tagsMount) {
      tagsMount.innerHTML = (article.tags || [])
        .map(
          (tag) => `
          <a
            href="blog.html?tag=${encodeURIComponent(tag)}"
            class="outline-button text-xs py-1.5 px-3 min-h-[34px]"
          >
            #${escHtml(tag)}
          </a>
        `
        )
        .join("");
    }

    if (shareMount) {
      const shareUrl = window.location.href;
      const encodedUrl = encodeURIComponent(shareUrl);
      const encodedText = encodeURIComponent(`${article.title} by ${article.author}`);

      shareMount.innerHTML = `
        <button type="button" id="share-copy-link-btn" class="secondary-button text-xs sm:text-sm py-2 px-3.5 min-h-[40px]">
          <i data-lucide="link-2" class="w-4 h-4"></i>
          <span>Copy Link</span>
        </button>
        <a
          href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}"
          target="_blank"
          rel="noopener noreferrer"
          class="outline-button text-xs sm:text-sm py-2 px-3.5 min-h-[40px]"
        >
          <i data-lucide="share-2" class="w-4 h-4"></i>
          <span>Share on X</span>
        </a>
        <a
          href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="outline-button text-xs sm:text-sm py-2 px-3.5 min-h-[40px]"
        >
          <i data-lucide="linkedin" class="w-4 h-4"></i>
          <span>LinkedIn</span>
        </a>
      `;

      const copyLinkBtn = document.getElementById("share-copy-link-btn");
      if (copyLinkBtn) {
        copyLinkBtn.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            if (typeof window.showToast === "function") {
              window.showToast("Article link copied", "success");
            }
          } catch (_err) {
            if (typeof window.showToast === "function") {
              window.showToast("Copy link from address bar", "info");
            }
          }
        });
      }
    }

    if (prevNextMount) {
      const prevArticle =
        articlesData[(articleIndex - 1 + articlesData.length) % articlesData.length];
      const nextArticle =
        articlesData[(articleIndex + 1) % articlesData.length];

      prevNextMount.innerHTML = `
        <a href="blog-details.html?article=${encodeURIComponent(prevArticle.slug)}" class="glass-card hover-lift p-5 space-y-1.5 block">
          <span class="text-xs font-mono-tech text-[var(--muted)] inline-flex items-center gap-1">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
            Previous Article
          </span>
          <p class="text-sm sm:text-base font-bold text-[var(--text)]">${escHtml(prevArticle.title)}</p>
        </a>
        <a href="blog-details.html?article=${encodeURIComponent(nextArticle.slug)}" class="glass-card hover-lift p-5 space-y-1.5 block sm:text-right">
          <span class="text-xs font-mono-tech text-[var(--muted)] inline-flex items-center gap-1 sm:justify-end">
            Next Article
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </span>
          <p class="text-sm sm:text-base font-bold text-[var(--text)]">${escHtml(nextArticle.title)}</p>
        </a>
      `;
    }

    if (relatedMount) {
      const related = articlesData
        .filter((other) => other.slug !== article.slug)
        .map((other) => {
          const sameCategory = other.category === article.category ? 3 : 0;
          const sharedTags = (other.tags || []).filter((t) =>
            (article.tags || []).includes(t)
          ).length;
          return { item: other, score: sameCategory + sharedTags };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((entry) => entry.item);

      relatedMount.innerHTML = related
        .map(
          (rel) => `
          <article class="glass-card project-card hover-lift flex flex-col justify-between overflow-hidden">
            <div>
              <a href="blog-details.html?article=${encodeURIComponent(rel.slug)}" class="project-media-box block">
                <img
                  src="${escHtml(rel.image)}"
                  alt="${escHtml(rel.title)}"
                  loading="lazy"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  onerror="this.src='assets/images/projects/portfolio-system.jpg'"
                  class="w-full h-full object-cover"
                >
                <div class="project-media-gradient"></div>
              </a>
              <div class="p-5 space-y-2">
                <div class="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <span class="font-semibold text-indigo-400">${escHtml(rel.category)}</span>
                  <span aria-hidden="true">·</span>
                  <span class="tabular-nums">${escHtml(rel.readingTime)}</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-[var(--text)] leading-snug">
                  <a href="blog-details.html?article=${encodeURIComponent(rel.slug)}" class="hover:text-indigo-400 transition-colors">
                    ${escHtml(rel.title)}
                  </a>
                </h3>
              </div>
            </div>
            <div class="px-5 pb-4 pt-2 flex justify-end">
              <a href="blog-details.html?article=${encodeURIComponent(rel.slug)}" class="text-xs font-semibold text-indigo-400 hover:text-cyan-400 inline-flex items-center gap-1">
                <span>Read Article</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </a>
            </div>
          </article>
        `
        )
        .join("");
    }

    // Highlight active Table of Contents section on scroll
    if (contentMount && tocMount && "IntersectionObserver" in window) {
      const tocLinks = Array.from(tocMount.querySelectorAll("[data-toc-target]"));
      const sections = Array.from(contentMount.querySelectorAll(".blog-article-section"));
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            tocLinks.forEach((link) => {
              link.classList.toggle("is-active", link.getAttribute("data-toc-target") === id);
            });
          });
        },
        { rootMargin: "-20% 0px -65% 0px", threshold: 0.01 }
      );
      sections.forEach((sec) => observer.observe(sec));
    }

    initReadingProgress(contentMount);
    refreshIcons();
  }

  function init() {
    initBlogIndex();
    initBlogDetails();
  }

  return {
    init,
    state,
    categories,
    articlesData,
    getSelectedArticleSlug
  };
})();

window.PortfolioBlog = PortfolioBlog;
