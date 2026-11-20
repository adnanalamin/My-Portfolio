/**
 * AL AMIN Portfolio — Phase 38: Personal Knowledge Base (knowledge.html)
 * Single source of truth for all Knowledge Base Categories, Tags, Engineering
 * Articles, Development Notes, Related Links, and Reading Progress state.
 * Content lives strictly here in knowledge.js (zero duplication in HTML).
 */

(() => {
  const STORAGE_READ_KEY = "alamin_kb_read_entries_v1";

  const CATEGORIES = [
    "All",
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB",
    "CSS",
    "Web Development",
    "Security",
    "UI/UX",
    "AI",
    "Career",
    "Development Notes"
  ];

  const ENTRIES = [
    {
      id: "js-event-loop-abort-controllers",
      type: "Article",
      category: "JavaScript",
      title: "Coordinating Async Fetch Lifecycles with AbortController & Microtasks",
      summary:
        "How browser fetch cancellation prevents stale race conditions inside high-frequency search inputs and route transitions.",
      readingTime: "6 min read",
      updated: "2026-11-12",
      tags: ["async", "fetch", "abort-controller", "performance"],
      relatedIds: ["react-predictable-filter-state", "webdev-resilient-client-cache"],
      sections: [
        {
          heading: "Why Out-of-Order Responses Corrupt Search UIs",
          body: [
            "When a visitor types quickly into a live search box, multiple network requests overlap in flight. If an earlier slow response resolves after a faster newer response, the UI overwrites fresh results with stale data.",
            "Canceling superseded requests with AbortController guarantees deterministic ordering while immediately freeing browser connection slots."
          ]
        },
        {
          heading: "Reusable Request Coordinator Pattern",
          body: [
            "Keep a reference to the active controller per query stream, call controller.abort() before issuing the next request, and silently ignore AbortError inside catch blocks while surfacing genuine transport failures."
          ],
          code: {
            filename: "utils/abortableFetch.js",
            snippet: `let activeController = null;

export async function querySafely(url) {
  if (activeController) activeController.abort();
  activeController = new AbortController();

  const res = await fetch(url, { signal: activeController.signal });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}`
          }
        }
      ]
    },
    {
      id: "react-predictable-filter-state",
      type: "Article",
      category: "React",
      title: "Derived Filter State Without Redundant useEffect Synchronization",
      summary:
        "Keeping multi-filter tables fast and bug-free by computing filtered projections during render instead of duplicating synced arrays.",
      readingTime: "5 min read",
      updated: "2026-11-10",
      tags: ["hooks", "state", "components", "performance"],
      relatedIds: ["js-event-loop-abort-controllers", "uiux-scannable-filter-bars"],
      sections: [
        {
          heading: "Eliminating State Mirroring Bugs",
          body: [
            "Storing both rawItems and filteredItems inside component state forces manual synchronization effects whenever search query, sort direction, or tab filters change—causing double renders and stale frames.",
            "Instead, store only minimal source inputs (searchText, activeCategory, sortOrder) and compute the filtered list deterministically inside render or useMemo."
          ],
          code: {
            filename: "hooks/useDerivedCatalog.ts",
            snippet: `const visibleItems = useMemo(() => {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchCat = category === "All" || item.category === category;
    const matchQuery = !q || item.title.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });
}, [items, category, query]);`
          }
        },
        {
          heading: "Colocating URL Query Parameters",
          body: [
            "Persisting selected filters in URLSearchParams makes shared recruiter and client links open directly on the filtered slice without local storage drift."
          ]
        }
      ]
    },
    {
      id: "node-structured-rest-errors",
      type: "Article",
      category: "Node.js",
      title: "Normalized Error Envelope & Async Boundaries in Express APIs",
      summary:
        "Designing consistent JSON error responses across Express controllers without leaking internal stack traces to API consumers.",
      readingTime: "7 min read",
      updated: "2026-11-08",
      tags: ["express", "rest-api", "error-handling", "validation"],
      relatedIds: ["security-jwt-cookie-hardening", "mongodb-compound-index-rules"],
      sections: [
        {
          heading: "Contract-First Error Structure",
          body: [
            "Frontend clients handle failures cleanly when every 4xx and 5xx response shares one predictable shape: error code, human-readable message, field details array, and request ID.",
            "Centralizing formatting inside the final Express error middleware keeps controllers focused exclusively on domain logic."
          ],
          code: {
            filename: "middleware/errorHandler.js",
            snippet: `export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  res.status(status).json({
    ok: false,
    code: err.code || "INTERNAL_ERROR",
    message: status >= 500 ? "Unexpected server error." : err.message
  });
}`
          }
        },
        {
          heading: "Separating Operational vs Programmer Faults",
          body: [
            "Validation errors and missing resources are safe operational 4xx messages; unhandled promise rejections or database socket failures must log privately server-side and return generic 500 payloads externally."
          ]
        }
      ]
    },
    {
      id: "mongodb-compound-index-rules",
      type: "Article",
      category: "MongoDB",
      title: "ESR Rule for Compound MongoDB Indexes in Multi-Tenant Queries",
      summary:
        "Applying Equality -> Sort -> Range index ordering paired with lean projections to eliminate collection scans.",
      readingTime: "6 min read",
      updated: "2026-11-05",
      tags: ["indexes", "mongoose", "queries", "performance"],
      relatedIds: ["node-structured-rest-errors", "devnotes-explain-checklist"],
      sections: [
        {
          heading: "Why Field Order Inside createIndex Matters",
          body: [
            "MongoDB traverses compound B-tree indexes strictly from left to right. Placing a range predicate ($gte/$lte) before an equality field forces the engine to scan unnecessary key branches.",
            "Following the Equality-Sort-Range rule narrows results to the tenant boundary first, preserves natural sort order without an in-memory sort limit, and evaluates range filters last."
          ],
          code: {
            filename: "models/EventLog.js",
            snippet: `// Equality: workspaceId -> Sort: createdAt -> Range: latencyMs
eventLogSchema.index({ workspaceId: 1, createdAt: -1, latencyMs: 1 });

export function querySlowEvents(workspaceId, minMs) {
  return EventLog.find({ workspaceId, latencyMs: { $gte: minMs } })
    .sort({ createdAt: -1 })
    .select("route latencyMs statusCode createdAt")
    .lean();
}`
          }
        }
      ]
    },
    {
      id: "css-fluid-grid-zero-cls",
      type: "Article",
      category: "CSS",
      title: "Intrinsic Grid Systems & Fluid Typography Across 320px to 2560px",
      summary:
        "Replacing brittle pixel breakpoints with CSS Grid auto-fit tracks, clamp() type scales, and explicit aspect ratios.",
      readingTime: "5 min read",
      updated: "2026-11-02",
      tags: ["grid", "responsive", "typography", "a11y"],
      relatedIds: ["uiux-scannable-filter-bars", "webdev-resilient-client-cache"],
      sections: [
        {
          heading: "Preventing Cumulative Layout Shift on Media Cards",
          body: [
            "Every thumbnail and media container must reserve its geometry before fonts or images finish decoding using CSS aspect-ratio paired with object-fit: cover.",
            "Combining repeat(auto-fit, minmax(min(100%, 280px), 1fr)) adapts effortlessly from narrow 320px mobile viewports to ultrawide monitors without horizontal overflow."
          ],
          code: {
            filename: "styles/layout.css",
            snippet: `.responsive-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
}

.media-frame {
  aspect-ratio: 16 / 10;
  overflow: hidden;
}`
          }
        }
      ]
    },
    {
      id: "webdev-resilient-client-cache",
      type: "Article",
      category: "Web Development",
      title: "Network-First HTML & Safe Shell Precaching in Static Service Workers",
      summary:
        "Structuring offline fallbacks for multi-page web portfolios without accidentally serving stale API data or trapping updates.",
      readingTime: "6 min read",
      updated: "2026-10-29",
      tags: ["pwa", "service-worker", "caching", "offline"],
      relatedIds: ["css-fluid-grid-zero-cls", "js-event-loop-abort-controllers"],
      sections: [
        {
          heading: "Separating Document Navigation from Asset Caching",
          body: [
            "Serving cached HTML navigation first causes visitors to miss updated deployments until hard reloads. Using network-first with an offline fallback page delivers fresh HTML whenever online while preserving graceful offline browsing.",
            "Cross-origin API requests (GitHub REST calls, form submissions) must bypass the Service Worker cache entirely."
          ]
        }
      ]
    },
    {
      id: "security-jwt-cookie-hardening",
      type: "Note",
      category: "Security",
      title: "Session Hygiene Note: Input Validation, CORS Allowlists & Secret Scope",
      summary:
        "Compact engineering checklist covering fail-closed CORS origins, strict schema sanitization, and environment variable boundaries.",
      readingTime: "3 min read",
      updated: "2026-10-25",
      tags: ["jwt", "cors", "validation", "security"],
      relatedIds: ["node-structured-rest-errors", "ai-prompt-boundaries-note"],
      sections: [
        {
          heading: "Four Non-Negotiable API Security Rules",
          body: [
            "1. Validate and strip unknown payload keys at the route boundary using an explicit schema before calling database drivers.",
            "2. Configure CORS with an explicit origin allowlist rather than wildcard origins when credentials or custom auth headers are present.",
            "3. Never ship private signing keys, database URIs, or third-party secret tokens inside client-side JavaScript bundles.",
            "4. Normalize 401/403 error copy so invalid logins do not reveal whether a specific account email exists."
          ]
        }
      ]
    },
    {
      id: "uiux-scannable-filter-bars",
      type: "Note",
      category: "UI/UX",
      title: "Design System Note: Clean Typography vs. Pill Enclosure Clutter",
      summary:
        "Why reserving enclosed interactive borders strictly for clickable controls makes technical cards far faster to scan.",
      readingTime: "3 min read",
      updated: "2026-10-22",
      tags: ["design-systems", "a11y", "typography", "components"],
      relatedIds: ["css-fluid-grid-zero-cls", "react-predictable-filter-state"],
      sections: [
        {
          heading: "Visual Hierarchy Through Typographic Restraint",
          body: [
            "Wrapping every timestamp, category, and technology name inside bordered capsule badges creates dozens of competing visual targets on screen. Visitors lose sight of interactive buttons.",
            "Separate static metadata cleanly with middle-dot separators (Frontend · 6 min read · 2026), keeping explicit boundaries and hover focus states exclusively for clickable filter buttons and navigation actions."
          ]
        }
      ]
    },
    {
      id: "ai-prompt-boundaries-note",
      type: "Note",
      category: "AI",
      title: "Engineering Note: Deterministic Fallbacks & Output Validation for AI UIs",
      summary:
        "Keeping developer tools reliable by validating model schemas, handling timeouts cleanly, and isolating server-side keys.",
      readingTime: "4 min read",
      updated: "2026-10-18",
      tags: ["prompts", "validation", "architecture", "security"],
      relatedIds: ["security-jwt-cookie-hardening", "node-structured-rest-errors"],
      sections: [
        {
          heading: "Designing Predictable Assisted Workflows",
          body: [
            "Whenever an interface integrates LLM endpoints through a server proxy, treat returned text or JSON as untrusted external input.",
            "Parse structured responses safely with explicit fallback states, show clear retry actions on rate limits or timeouts, and keep sensitive API keys strictly in server environment variables."
          ]
        }
      ]
    },
    {
      id: "career-technical-case-studies",
      type: "Article",
      category: "Career",
      title: "Writing Engineering Case Studies Hiring Managers Actually Read",
      summary:
        "Structuring portfolio write-ups around concrete architecture problems, rejected alternatives, trade-offs, and honest outcomes.",
      readingTime: "5 min read",
      updated: "2026-10-14",
      tags: ["portfolio", "architecture", "career", "case-studies"],
      relatedIds: ["devnotes-explain-checklist", "react-predictable-filter-state"],
      sections: [
        {
          heading: "Replace Generic Feature Lists with Engineering Rationale",
          body: [
            "Senior reviewers care far more about why you chose normalized PostgreSQL tables over embedded documents—or why you avoided unnecessary global state—than reading a bullet list of libraries installed.",
            "Lead every project breakdown with the real bottleneck solved, the explicit schema or API trade-off accepted, and verifiable architectural proof."
          ]
        }
      ]
    },
    {
      id: "devnotes-explain-checklist",
      type: "Note",
      category: "Development Notes",
      title: "Pre-Ship Verification Checklist (HTML, Accessibility, CSS & Build)",
      summary:
        "Quick personal release checklist run before shipping static modules, interactive tools, and responsive breakpoints.",
      readingTime: "2 min read",
      updated: "2026-11-16",
      tags: ["checklist", "a11y", "queries", "architecture"],
      relatedIds: ["mongodb-compound-index-rules", "career-technical-case-studies"],
      sections: [
        {
          heading: "Release Verification Sequence",
          body: [
            "• Confirm zero duplicate DOM IDs and valid semantic landmarks (header, nav, main, footer).",
            "• Verify keyboard navigation (Tab, Shift+Tab, Escape closes dialogs, focus-visible ring crisp on dark and light themes).",
            "• Test layout integrity at 320px narrow mobile and 1440px+ desktop without horizontal overflow.",
            "• Verify zero unescaped user input rendered via innerHTML and run syntax/build/lint checks cleanly."
          ]
        }
      ]
    }
  ];

  function escHtml(value) {
    if (typeof window.escapeHtml === "function") {
      return window.escapeHtml(value);
    }
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function refreshIcons() {
    if (typeof window.refreshIcons === "function") {
      window.refreshIcons();
    } else if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function toast(msg, tone) {
    if (typeof window.showToast === "function") {
      window.showToast(msg, tone || "success");
    }
  }

  function loadReadIds() {
    try {
      const raw = window.localStorage ? window.localStorage.getItem(STORAGE_READ_KEY) : null;
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (_) {
      return new Set();
    }
  }

  function saveReadIds(set) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(STORAGE_READ_KEY, JSON.stringify(Array.from(set)));
      }
    } catch (_) {
      // Ignore storage quota errors safely
    }
  }

  function getAllTags() {
    const counts = new Map();
    ENTRIES.forEach((e) => {
      e.tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
    });
    return [
      "All",
      ...Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map((pair) => pair[0])
    ];
  }

  async function copyCodeText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        // fallback below
      }
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  function init() {
    const root = document.getElementById("knowledge-base-root");
    if (!root) return;

    const params = new URLSearchParams(window.location ? window.location.search : "");
    const requestedId = params.get("entry");

    const state = {
      query: "",
      category: "All",
      tag: "All",
      type: "All", // "All" | "Article" | "Note"
      selectedId: ENTRIES.some((e) => e.id === requestedId) ? requestedId : ENTRIES[0].id,
      readIds: loadReadIds(),
      scrollPercent: 0
    };

    const allTags = getAllTags();

    const searchInput = document.getElementById("kb-search-input");
    const clearSearchBtn = document.getElementById("kb-search-clear");
    const typeTabsEl = document.getElementById("kb-type-tabs");
    const categoryBarEl = document.getElementById("kb-category-bar");
    const tagBarEl = document.getElementById("kb-tag-bar");
    const entriesListEl = document.getElementById("kb-entries-list");
    const readerPaneEl = document.getElementById("kb-reader-pane");
    const countLabelEl = document.getElementById("kb-results-count");
    const overallProgressEl = document.getElementById("kb-overall-progress");
    const resetBtn = document.getElementById("kb-reset-btn");
    const scrollProgressFill = document.getElementById("kb-reading-progress-fill");
    const scrollProgressLabel = document.getElementById("kb-scroll-progress-label");

    function getFilteredEntries() {
      const q = state.query.trim().toLowerCase();
      return ENTRIES.filter((entry) => {
        if (state.category !== "All" && entry.category !== state.category) return false;
        if (state.type !== "All" && entry.type !== state.type) return false;
        if (state.tag !== "All" && !entry.tags.includes(state.tag)) return false;
        if (!q) return true;
        const bodyText = entry.sections
          .map((s) => `${s.heading} ${(s.body || []).join(" ")}`)
          .join(" ");
        const hay = `${entry.title} ${entry.category} ${entry.type} ${entry.summary} ${entry.tags.join(" ")} ${bodyText}`.toLowerCase();
        return hay.includes(q);
      });
    }

    function updateOverallProgress() {
      const done = state.readIds.size;
      const total = ENTRIES.length;
      if (overallProgressEl) {
        overallProgressEl.textContent = `${done} / ${total} read`;
      }
    }

    function updateScrollProgress() {
      if (!readerPaneEl || !scrollProgressFill) return;
      const rect = readerPaneEl.getBoundingClientRect ? readerPaneEl.getBoundingClientRect() : null;
      if (!rect) return;
      const vh = window.innerHeight || 800;
      const totalScrollable = Math.max(1, rect.height - vh * 0.45);
      const progressed = Math.min(totalScrollable, Math.max(0, vh * 0.35 - rect.top));
      const pct = Math.min(100, Math.max(0, Math.round((progressed / totalScrollable) * 100)));
      state.scrollPercent = pct;
      scrollProgressFill.style.width = `${pct}%`;
      if (scrollProgressLabel) {
        scrollProgressLabel.textContent = `${pct}% scrolled`;
      }
    }

    function renderFilters() {
      if (typeTabsEl) {
        const types = ["All", "Article", "Note"];
        typeTabsEl.innerHTML = types
          .map((t) => {
            const active = state.type === t;
            const label = t === "All" ? "All Entries" : t === "Article" ? "Articles" : "Notes";
            return `
              <button
                type="button"
                role="tab"
                aria-selected="${active ? "true" : "false"}"
                class="kb-filter-btn ${active ? "is-active" : ""}"
                data-kb-type="${escHtml(t)}"
              >
                ${escHtml(label)}
              </button>
            `;
          })
          .join("");

        typeTabsEl.querySelectorAll("[data-kb-type]").forEach((btn) => {
          btn.addEventListener("click", () => {
            state.type = btn.getAttribute("data-kb-type") || "All";
            renderAll();
          });
        });
      }

      if (categoryBarEl) {
        categoryBarEl.innerHTML = CATEGORIES.map((cat) => {
          const active = state.category === cat;
          const catCount =
            cat === "All" ? ENTRIES.length : ENTRIES.filter((e) => e.category === cat).length;
          return `
            <button
              type="button"
              role="tab"
              aria-selected="${active ? "true" : "false"}"
              class="kb-filter-btn ${active ? "is-active" : ""}"
              data-kb-cat="${escHtml(cat)}"
            >
              <span>${escHtml(cat)}</span>
              <span class="font-mono-tech tabular-nums opacity-70">${catCount}</span>
            </button>
          `;
        }).join("");

        categoryBarEl.querySelectorAll("[data-kb-cat]").forEach((btn) => {
          btn.addEventListener("click", () => {
            state.category = btn.getAttribute("data-kb-cat") || "All";
            renderAll();
          });
        });
      }

      if (tagBarEl) {
        tagBarEl.innerHTML = allTags
          .slice(0, 14)
          .map((tg) => {
            const active = state.tag === tg;
            return `
              <button
                type="button"
                aria-pressed="${active ? "true" : "false"}"
                class="kb-tag-btn ${active ? "is-active" : ""}"
                data-kb-tag="${escHtml(tg)}"
              >
                ${escHtml(tg === "All" ? "All Tags" : `#${tg}`)}
              </button>
            `;
          })
          .join("");

        tagBarEl.querySelectorAll("[data-kb-tag]").forEach((btn) => {
          btn.addEventListener("click", () => {
            state.tag = btn.getAttribute("data-kb-tag") || "All";
            renderAll();
          });
        });
      }

      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle("hidden", state.query.trim().length === 0);
      }
    }

    function renderCatalog(filtered) {
      if (countLabelEl) {
        countLabelEl.textContent = `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"} shown`;
      }

      if (!entriesListEl) return;

      if (filtered.length === 0) {
        entriesListEl.innerHTML = `
          <div class="p-6 text-center space-y-2">
            <p class="text-sm font-bold text-[var(--text)]">No matching knowledge entries</p>
            <p class="text-xs text-[var(--muted)]">Clear filters or search another keyword.</p>
          </div>
        `;
        return;
      }

      if (!filtered.some((e) => e.id === state.selectedId)) {
        state.selectedId = filtered[0].id;
      }

      entriesListEl.innerHTML = filtered
        .map((entry) => {
          const isSelected = entry.id === state.selectedId;
          const isRead = state.readIds.has(entry.id);
          return `
            <button
              type="button"
              class="kb-entry-card ${isSelected ? "is-selected" : ""}"
              aria-current="${isSelected ? "true" : "false"}"
              data-kb-select="${escHtml(entry.id)}"
            >
              <div class="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                <span>
                  <strong class="text-cyan-400 font-semibold">${escHtml(entry.type)}</strong>
                  <span aria-hidden="true"> · </span>
                  <span>${escHtml(entry.category)}</span>
                </span>
                <span class="font-mono-tech tabular-nums">
                  ${isRead ? "Read · " : ""}${escHtml(entry.readingTime)}
                </span>
              </div>
              <span class="text-sm sm:text-base font-bold text-[var(--text)] leading-snug">${escHtml(entry.title)}</span>
              <span class="text-xs text-[var(--muted)] leading-relaxed">${escHtml(entry.summary)}</span>
            </button>
          `;
        })
        .join("");

      entriesListEl.querySelectorAll("[data-kb-select]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-kb-select");
          if (!id) return;
          state.selectedId = id;
          renderCatalog(filtered);
          renderReader();
        });
      });
    }

    function renderReader() {
      if (!readerPaneEl) return;
      const entry = ENTRIES.find((e) => e.id === state.selectedId) || ENTRIES[0];
      if (!entry) return;

      const isRead = state.readIds.has(entry.id);
      const relatedEntries = (entry.relatedIds || [])
        .map((rid) => ENTRIES.find((item) => item.id === rid))
        .filter(Boolean);

      const sectionsHtml = entry.sections
        .map(
          (sec, idx) => `
            <section class="space-y-3">
              <h3 class="text-base sm:text-lg font-bold text-[var(--text)]">${escHtml(sec.heading)}</h3>
              ${(sec.body || [])
                .map((p) => `<p class="text-sm sm:text-[15px] text-[var(--text-secondary)] leading-relaxed">${escHtml(p)}</p>`)
                .join("")}
              ${
                sec.code
                  ? `
                    <div class="kb-code-block">
                      <div class="kb-code-head">
                        <span class="text-xs font-mono-tech text-[var(--muted)]">${escHtml(sec.code.filename)}</span>
                        <button
                          type="button"
                          class="text-xs font-semibold text-cyan-400 hover:underline bg-transparent border-0 p-1 cursor-pointer"
                          data-kb-copy-code="${idx}"
                        >
                          Copy snippet
                        </button>
                      </div>
                      <pre class="kb-code-pre"><code>${escHtml(sec.code.snippet)}</code></pre>
                    </div>
                  `
                  : ""
              }
            </section>
          `
        )
        .join("");

      const relatedHtml =
        relatedEntries.length > 0
          ? `
            <div class="pt-5 border-t border-[var(--border)] space-y-3">
              <h3 class="text-sm font-bold text-[var(--text)]">Related Knowledge Entries</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${relatedEntries
                  .map(
                    (rel) => `
                      <button
                        type="button"
                        class="kb-related-card space-y-1"
                        data-kb-related="${escHtml(rel.id)}"
                      >
                        <span class="block text-xs text-cyan-400 font-semibold">${escHtml(rel.category)} · ${escHtml(rel.type)}</span>
                        <span class="block text-sm font-bold text-[var(--text)] leading-snug">${escHtml(rel.title)}</span>
                      </button>
                    `
                  )
                  .join("")}
              </div>
            </div>
          `
          : "";

      readerPaneEl.innerHTML = `
        <header class="pb-5 border-b border-[var(--border)] space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
            <span>
              <strong class="text-indigo-400 font-semibold">${escHtml(entry.category)}</strong>
              <span aria-hidden="true"> · </span>
              <span>${escHtml(entry.type)}</span>
              <span aria-hidden="true"> · </span>
              <span class="font-mono-tech tabular-nums">${escHtml(entry.readingTime)}</span>
              <span aria-hidden="true"> · </span>
              <span class="font-mono-tech tabular-nums">Updated ${escHtml(entry.updated)}</span>
            </span>

            <button
              type="button"
              id="kb-mark-read-btn"
              aria-pressed="${isRead ? "true" : "false"}"
              class="${isRead ? "secondary-button" : "outline-button"} text-xs min-h-[36px]"
            >
              <i data-lucide="${isRead ? "check" : "bookmark"}" class="w-3.5 h-3.5"></i>
              <span>${isRead ? "Marked as Read" : "Mark as Read"}</span>
            </button>
          </div>

          <h2 class="text-xl sm:text-2xl font-extrabold text-[var(--text)] leading-tight">${escHtml(entry.title)}</h2>
          <p class="text-sm sm:text-base text-[var(--muted)] leading-relaxed">${escHtml(entry.summary)}</p>

          <p class="text-xs font-mono-tech text-[var(--muted)]">
            Tags: ${entry.tags.map((t) => `#${escHtml(t)}`).join(" · ")}
          </p>
        </header>

        <div class="space-y-6">${sectionsHtml}</div>

        ${relatedHtml}
      `;

      const markBtn = document.getElementById("kb-mark-read-btn");
      if (markBtn) {
        markBtn.addEventListener("click", () => {
          if (state.readIds.has(entry.id)) {
            state.readIds.delete(entry.id);
          } else {
            state.readIds.add(entry.id);
          }
          saveReadIds(state.readIds);
          updateOverallProgress();
          renderCatalog(getFilteredEntries());
          renderReader();
        });
      }

      readerPaneEl.querySelectorAll("[data-kb-copy-code]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const secIdx = Number(btn.getAttribute("data-kb-copy-code"));
          const sec = entry.sections[secIdx];
          if (sec && sec.code && sec.code.snippet) {
            const ok = await copyCodeText(sec.code.snippet);
            if (ok) toast(`Copied ${sec.code.filename}`, "success");
          }
        });
      });

      readerPaneEl.querySelectorAll("[data-kb-related]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const relId = btn.getAttribute("data-kb-related");
          if (!relId) return;
          state.selectedId = relId;
          state.query = "";
          if (searchInput) searchInput.value = "";
          state.category = "All";
          state.tag = "All";
          state.type = "All";
          renderAll();
        });
      });

      updateScrollProgress();
      refreshIcons();
    }

    function renderAll() {
      renderFilters();
      const filtered = getFilteredEntries();
      renderCatalog(filtered);
      renderReader();
      updateOverallProgress();
    }

    function resetAll() {
      state.query = "";
      state.category = "All";
      state.tag = "All";
      state.type = "All";
      state.selectedId = ENTRIES[0].id;
      if (searchInput) searchInput.value = "";
      renderAll();
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.query = searchInput.value;
        renderFilters();
        const filtered = getFilteredEntries();
        renderCatalog(filtered);
        renderReader();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        state.query = "";
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
        }
        renderAll();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", resetAll);
    }

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress, { passive: true });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "/" &&
        searchInput &&
        document.activeElement !== searchInput &&
        !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement && document.activeElement.tagName) || "")
      ) {
        event.preventDefault();
        searchInput.focus();
      }
    });

    renderAll();
  }

  window.PortfolioKnowledge = {
    init,
    CATEGORIES,
    ENTRIES
  };
})();
