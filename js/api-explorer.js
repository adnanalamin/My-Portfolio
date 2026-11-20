/**
 * AL AMIN Portfolio — Phase 32: Interactive API Explorer
 * Static reference REST API contracts + safe public GitHub read endpoint docs.
 * Security rule: NEVER include real API keys, JWT secrets, private hosts, or DB credentials.
 */

(() => {
  const METHODS = ["ALL", "GET", "POST", "PUT", "PATCH", "DELETE"];

  const BASE_REFERENCE_URL = "https://api.example.com";

  const DEFAULT_ENDPOINTS = [
    {
      id: "github-public-repos",
      method: "GET",
      domain: "Public GitHub REST",
      baseUrl: "https://api.github.com",
      endpoint: "/users/{username}/repos",
      summary: "List Public Repositories",
      description:
        "Safe read-only public endpoint configured in js/config.js (portfolioConfig.github) used by GitHub Explorer and Dashboard to inspect public repository stars, forks, and languages.",
      authRequirement: "None (Public Unauthenticated Read · 60 req/hr per IP)",
      authLevel: "public",
      isPublicLiveSafe: true,
      relatedHref: "github.html",
      relatedLabel: "GitHub Explorer",
      request: {
        params: [
          { name: "username", location: "path", type: "string", required: true, notes: "Public GitHub handle (e.g. octocat)" },
          { name: "per_page", location: "query", type: "integer", required: false, notes: "Max results per page (1–100)" },
          { name: "sort", location: "query", type: "string", required: false, notes: "updated | created | pushed | full_name" }
        ],
        headers: {
          Accept: "application/vnd.github+json"
        },
        body: null
      },
      response: {
        defaultStatus: "200 OK",
        payload: [
          {
            id: 1296269,
            name: "Hello-World",
            full_name: "octocat/Hello-World",
            private: false,
            html_url: "https://github.com/octocat/Hello-World",
            description: "My first repository on GitHub.",
            language: "JavaScript",
            stargazers_count: 2540,
            forks_count: 1920,
            updated_at: "2026-11-10T14:22:00Z"
          }
        ]
      },
      statusCodes: [
        { code: 200, label: "OK", meaning: "Public repository array returned cleanly." },
        { code: 304, label: "Not Modified", meaning: "Cached ETag matches latest repository state." },
        { code: 403, label: "Forbidden", meaning: "Unauthenticated public rate limit exceeded (check X-RateLimit-Reset)." },
        { code: 404, label: "Not Found", meaning: "Requested GitHub user handle does not exist." }
      ]
    },
    {
      id: "astrapulse-get-metrics",
      method: "GET",
      domain: "AstraPulse SaaS API",
      baseUrl: BASE_REFERENCE_URL,
      endpoint: "/api/v1/workspaces/{workspaceId}/metrics",
      summary: "Query Rolling API Latency & Throughput",
      description:
        "Reads pre-aggregated hourly time-bucket metrics for an authenticated engineering workspace across 1h, 24h, or 7d rolling windows.",
      authRequirement: "Bearer JWT · Workspace Member (Admin, Developer, or Viewer)",
      authLevel: "jwt",
      isPublicLiveSafe: false,
      relatedHref: "project-details.html?id=astrapulse",
      relatedLabel: "AstraPulse Case Study",
      request: {
        params: [
          { name: "workspaceId", location: "path", type: "string", required: true, notes: "Workspace identifier (e.g. ws_sample_01)" },
          { name: "window", location: "query", type: "enum", required: false, notes: "1h | 24h | 7d (defaults to 24h)" },
          { name: "route", location: "query", type: "string", required: false, notes: "Optional normalized API route prefix" }
        ],
        headers: {
          Authorization: "Bearer <access_token>",
          Accept: "application/json"
        },
        body: null
      },
      response: {
        defaultStatus: "200 OK",
        payload: {
          workspaceId: "ws_sample_01",
          window: "24h",
          summary: {
            totalRequests: 48290,
            errorRatePercent: 0.38,
            p95LatencyMs: 118,
            uptimePercent: 99.94
          },
          buckets: [
            { windowStart: "2026-11-20T00:00:00Z", requests: 2140, p95Ms: 112, errors: 7 },
            { windowStart: "2026-11-20T01:00:00Z", requests: 2295, p95Ms: 121, errors: 9 }
          ]
        }
      },
      statusCodes: [
        { code: 200, label: "OK", meaning: "Time-bucketed telemetry metrics returned." },
        { code: 400, label: "Bad Request", meaning: "Unsupported window query parameter." },
        { code: 401, label: "Unauthorized", meaning: "Missing or expired Bearer access token." },
        { code: 403, label: "Forbidden", meaning: "Authenticated user does not belong to target workspace." },
        { code: 404, label: "Not Found", meaning: "Workspace ID not found." },
        { code: 429, label: "Too Many Requests", meaning: "Workspace query rate limit reached." }
      ]
    },
    {
      id: "astrapulse-post-event",
      method: "POST",
      domain: "AstraPulse SaaS API",
      baseUrl: BASE_REFERENCE_URL,
      endpoint: "/api/v1/telemetry/events",
      summary: "Ingest Telemetry Event Batch",
      description:
        "Validates and writes normalized request latency traces into indexed MongoDB EventLogs while updating rolling hourly metric buckets.",
      authRequirement: "Scoped Ingestion Credential (Header Redacted · Server Verified)",
      authLevel: "scoped",
      isPublicLiveSafe: false,
      relatedHref: "architecture.html",
      relatedLabel: "System Architecture",
      request: {
        params: [],
        headers: {
          "Content-Type": "application/json",
          "X-Workspace-Token": "<workspace_ingest_credential>"
        },
        body: {
          workspaceId: "ws_sample_01",
          route: "/api/v1/checkout/confirm",
          method: "POST",
          statusCode: 201,
          durationMs: 94,
          region: "ap-south-1",
          timestamp: "2026-11-20T02:10:15Z"
        }
      },
      response: {
        defaultStatus: "201 Created",
        payload: {
          accepted: true,
          eventId: "evt_demo_90421",
          bucketWindow: "2026-11-20T02:00:00Z",
          thresholdAlertTriggered: false
        }
      },
      statusCodes: [
        { code: 201, label: "Created", meaning: "Telemetry event validated and recorded cleanly." },
        { code: 400, label: "Bad Request", meaning: "Schema validation failed (e.g. negative durationMs or invalid method)." },
        { code: 401, label: "Unauthorized", meaning: "Missing or invalid workspace ingestion token." },
        { code: 413, label: "Payload Too Large", meaning: "Event payload exceeds 64 KB ingestion cap." },
        { code: 429, label: "Too Many Requests", meaning: "Ingestion burst threshold exceeded; retry after Backoff header." }
      ]
    },
    {
      id: "astrapulse-put-alerts",
      method: "PUT",
      domain: "AstraPulse SaaS API",
      baseUrl: BASE_REFERENCE_URL,
      endpoint: "/api/v1/workspaces/{workspaceId}/alert-policy",
      summary: "Replace Workspace Alert Policy",
      description:
        "Idempotently replaces the complete threshold configuration object (p95 latency ceiling, 5xx error threshold, cooldown window) for a monitored workspace.",
      authRequirement: "Bearer JWT · Workspace Admin Only (RBAC Enforced)",
      authLevel: "jwt",
      isPublicLiveSafe: false,
      relatedHref: "security.html",
      relatedLabel: "Security Center",
      request: {
        params: [
          { name: "workspaceId", location: "path", type: "string", required: true, notes: "Target workspace ID" }
        ],
        headers: {
          Authorization: "Bearer <admin_access_token>",
          "Content-Type": "application/json"
        },
        body: {
          p95ThresholdMs: 350,
          maxErrorRatePercent: 2.5,
          cooldownMinutes: 15,
          channels: ["email_ops", "webhook_primary"],
          enabled: true
        }
      },
      response: {
        defaultStatus: "200 OK",
        payload: {
          workspaceId: "ws_sample_01",
          updatedAt: "2026-11-20T02:11:04Z",
          alertPolicy: {
            p95ThresholdMs: 350,
            maxErrorRatePercent: 2.5,
            cooldownMinutes: 15,
            channels: ["email_ops", "webhook_primary"],
            enabled: true
          }
        }
      },
      statusCodes: [
        { code: 200, label: "OK", meaning: "Complete alert policy replaced and persisted." },
        { code: 400, label: "Bad Request", meaning: "Required threshold fields missing (PUT requires full representation)." },
        { code: 401, label: "Unauthorized", meaning: "Authentication token missing or invalid." },
        { code: 403, label: "Forbidden", meaning: "Viewer/Developer roles cannot modify workspace alert policies." },
        { code: 404, label: "Not Found", meaning: "Workspace ID does not exist." }
      ]
    },
    {
      id: "ecommerce-patch-order",
      method: "PATCH",
      domain: "E-commerce SaaS API",
      baseUrl: BASE_REFERENCE_URL,
      endpoint: "/api/v1/storefront/orders/{orderId}/fulfillment",
      summary: "Update Order Fulfillment Stage",
      description:
        "Partially updates a PostgreSQL transactional order status along a validated state machine (Paid -> Packed -> Shipped -> Delivered) without overwriting financial totals.",
      authRequirement: "Bearer JWT · Verified Tenant Merchant Owner",
      authLevel: "jwt",
      isPublicLiveSafe: false,
      relatedHref: "project-details.html?id=ecommerce-saas",
      relatedLabel: "E-commerce SaaS Case Study",
      request: {
        params: [
          { name: "orderId", location: "path", type: "string", required: true, notes: "Merchant order reference ID" }
        ],
        headers: {
          Authorization: "Bearer <merchant_access_token>",
          "Content-Type": "application/json"
        },
        body: {
          fulfillmentStatus: "shipped",
          carrierCode: "standard_courier",
          trackingReference: "TRK-DEMO-4409"
        }
      },
      response: {
        defaultStatus: "200 OK",
        payload: {
          orderId: "ord_demo_7182",
          tenantSlug: "atelier-goods",
          previousStatus: "packed",
          fulfillmentStatus: "shipped",
          trackingReference: "TRK-DEMO-4409",
          updatedAt: "2026-11-20T02:12:40Z"
        }
      },
      statusCodes: [
        { code: 200, label: "OK", meaning: "Fulfillment stage transitioned cleanly." },
        { code: 400, label: "Bad Request", meaning: "Unknown fulfillment state supplied." },
        { code: 401, label: "Unauthorized", meaning: "Merchant session required." },
        { code: 403, label: "Forbidden", meaning: "Cross-tenant access denied; order belongs to another merchant." },
        { code: 404, label: "Not Found", meaning: "Order ID not found for this merchant." },
        { code: 409, label: "Conflict", meaning: "Invalid transition (e.g. cannot ship a cancelled or unpaid order)." }
      ]
    },
    {
      id: "nexora-patch-task",
      method: "PATCH",
      domain: "Nexora Workspace API",
      baseUrl: BASE_REFERENCE_URL,
      endpoint: "/api/v1/tasks/{taskId}",
      summary: "Move Kanban Task Column or Priority",
      description:
        "Applies partial optimistic card updates (board column, sort index, or priority level) and records an audit trail entry for the workspace.",
      authRequirement: "Bearer JWT · Workspace Member",
      authLevel: "jwt",
      isPublicLiveSafe: false,
      relatedHref: "project-details.html?id=nexora",
      relatedLabel: "Nexora Case Study",
      request: {
        params: [
          { name: "taskId", location: "path", type: "string", required: true, notes: "Task card ID" }
        ],
        headers: {
          Authorization: "Bearer <access_token>",
          "Content-Type": "application/json"
        },
        body: {
          column: "in_review",
          priority: "high"
        }
      },
      response: {
        defaultStatus: "200 OK",
        payload: {
          taskId: "tsk_demo_308",
          title: "Validate Express rate limiter headers",
          column: "in_review",
          priority: "high",
          updatedAt: "2026-11-20T02:13:02Z"
        }
      },
      statusCodes: [
        { code: 200, label: "OK", meaning: "Task fields patched cleanly." },
        { code: 400, label: "Bad Request", meaning: "Invalid column or priority value." },
        { code: 401, label: "Unauthorized", meaning: "Missing or expired Bearer token." },
        { code: 403, label: "Forbidden", meaning: "User lacks write access in target board." },
        { code: 404, label: "Not Found", meaning: "Task card not found." }
      ]
    },
    {
      id: "astrapulse-delete-webhook",
      method: "DELETE",
      domain: "AstraPulse SaaS API",
      baseUrl: BASE_REFERENCE_URL,
      endpoint: "/api/v1/workspaces/{workspaceId}/webhooks/{webhookId}",
      summary: "Revoke Outbound Alert Webhook",
      description:
        "Permanently removes an alert webhook integration from a workspace and stops any queued threshold retry dispatches.",
      authRequirement: "Bearer JWT · Workspace Admin Only",
      authLevel: "jwt",
      isPublicLiveSafe: false,
      relatedHref: "decisions.html",
      relatedLabel: "Engineering Decisions",
      request: {
        params: [
          { name: "workspaceId", location: "path", type: "string", required: true, notes: "Workspace identifier" },
          { name: "webhookId", location: "path", type: "string", required: true, notes: "Registered webhook ID" }
        ],
        headers: {
          Authorization: "Bearer <admin_access_token>"
        },
        body: null
      },
      response: {
        defaultStatus: "200 OK",
        payload: {
          deleted: true,
          workspaceId: "ws_sample_01",
          webhookId: "wh_demo_19",
          revokedAt: "2026-11-20T02:13:30Z"
        }
      },
      statusCodes: [
        { code: 200, label: "OK", meaning: "Webhook removed and confirmation JSON returned." },
        { code: 204, label: "No Content", meaning: "Alternative silent success for minimal clients." },
        { code: 401, label: "Unauthorized", meaning: "Authentication token missing or invalid." },
        { code: 403, label: "Forbidden", meaning: "Admin permission required to revoke webhooks." },
        { code: 404, label: "Not Found", meaning: "Webhook ID already removed or does not exist." }
      ]
    },
    {
      id: "portfolio-post-inquiry",
      method: "POST",
      domain: "Client Intake Spec",
      baseUrl: BASE_REFERENCE_URL,
      endpoint: "/api/v1/inquiries",
      summary: "Submit Structured Project Brief",
      description:
        "Reference backend contract for project-request.html and contact.html: validates sanitized brief fields server-side with rate limiting so external email/CRM credentials stay strictly off the client.",
      authRequirement: "Public Endpoint · Input Validation + IP Rate Limited (5 req / 15 min)",
      authLevel: "public",
      isPublicLiveSafe: false,
      relatedHref: "project-request.html",
      relatedLabel: "Smart Project Request",
      request: {
        params: [],
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          projectType: "SaaS",
          businessName: "Northwind Analytics",
          industry: "B2B Software",
          timeline: "1-2 months",
          requirements: ["Authentication", "Admin dashboard", "REST API"],
          contact: {
            name: "Jordan Lee",
            email: "contact@example.com",
            preferredMethod: "Email"
          }
        }
      },
      response: {
        defaultStatus: "201 Created",
        payload: {
          submitted: true,
          referenceCode: "PRJ-DEMO-2026-08",
          message: "Project brief validated and queued safely."
        }
      },
      statusCodes: [
        { code: 201, label: "Created", meaning: "Project brief accepted with zero sensitive fields echoed." },
        { code: 400, label: "Bad Request", meaning: "Malformed JSON payload." },
        { code: 422, label: "Unprocessable Entity", meaning: "Invalid email format or missing required project goal fields." },
        { code: 429, label: "Too Many Requests", meaning: "Anti-spam submission rate limit exceeded." }
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

  async function copyText(text) {
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

  function getEndpoints() {
    const cfg = window.portfolioConfig && window.portfolioConfig.apiExplorerSpecs;
    if (Array.isArray(cfg) && cfg.length > 0) {
      return cfg;
    }
    return DEFAULT_ENDPOINTS;
  }

  function formatFullEndpoint(ep) {
    const base = String(ep.baseUrl || BASE_REFERENCE_URL).replace(/\/+$/, "");
    let pathStr = String(ep.endpoint || "");
    if (ep.id === "github-public-repos" && window.portfolioConfig && window.portfolioConfig.github) {
      const gh = window.portfolioConfig.github;
      if (gh.apiBaseUrl) {
        const cleanGh = String(gh.apiBaseUrl).replace(/\/+$/, "");
        const user = typeof gh.username === "string" && gh.username.trim() ? gh.username.trim() : "{username}";
        return `${cleanGh}${pathStr.replace("{username}", encodeURIComponent(user))}`;
      }
    }
    return `${base}${pathStr}`;
  }

  function getMethodClass(method) {
    const m = String(method || "GET").toLowerCase();
    return `api-method-tag api-method-tag--${m}`;
  }

  function init() {
    const root = document.getElementById("api-explorer-root");
    if (!root) return;

    const endpoints = getEndpoints();
    const state = {
      method: "ALL",
      domain: "ALL",
      query: "",
      expandedCards: new Set([endpoints[0] ? endpoints[0].id : ""]),
      activeTabs: {}, // { [id]: "response" | "request" | "status" }
      expandedJson: new Set(),
      liveSamples: {} // { [id]: { loading, data, error } }
    };

    const searchInput = document.getElementById("api-search-input");
    const searchClear = document.getElementById("api-search-clear");
    const domainSelect = document.getElementById("api-domain-select");
    const methodTabsEl = document.getElementById("api-method-tabs");
    const resetBtn = document.getElementById("api-reset-btn");
    const toggleAllBtn = document.getElementById("api-toggle-all-btn");
    const countLabelEl = document.getElementById("api-count-label");
    const indexRailEl = document.getElementById("api-index-rail");
    const cardsListEl = document.getElementById("api-cards-list");

    const domains = ["ALL", ...Array.from(new Set(endpoints.map((ep) => ep.domain).filter(Boolean)))];

    function getFiltered() {
      const q = state.query.trim().toLowerCase();
      return endpoints.filter((ep) => {
        if (state.method !== "ALL" && ep.method !== state.method) return false;
        if (state.domain !== "ALL" && ep.domain !== state.domain) return false;
        if (!q) return true;
        const hay = [
          ep.method,
          ep.endpoint,
          ep.summary,
          ep.description,
          ep.domain,
          ep.authRequirement,
          (ep.statusCodes || []).map((s) => `${s.code} ${s.label}`).join(" ")
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    function renderDomainOptions() {
      if (!domainSelect) return;
      domainSelect.innerHTML = domains
        .map((d) => `<option value="${escHtml(d)}">${d === "ALL" ? "All API Domains" : escHtml(d)}</option>`)
        .join("");
      domainSelect.value = state.domain;
    }

    function renderMethodFilters() {
      if (!methodTabsEl) return;
      methodTabsEl.innerHTML = METHODS.map((m) => {
        const count =
          m === "ALL"
            ? endpoints.length
            : endpoints.filter((e) => e.method === m).length;
        const isActive = state.method === m;
        return `
          <button
            type="button"
            class="api-method-filter-btn ${isActive ? "is-active" : ""}"
            data-api-method="${escHtml(m)}"
            aria-pressed="${isActive ? "true" : "false"}"
          >
            <span>${escHtml(m)}</span>
            <span class="text-[var(--muted)] tabular-nums">(${count})</span>
          </button>
        `;
      }).join("");

      methodTabsEl.querySelectorAll("[data-api-method]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.method = btn.getAttribute("data-api-method") || "ALL";
          render();
        });
      });
    }

    function getJsonTextForTab(ep, tab) {
      if (tab === "request") {
        if (ep.request && ep.request.body) {
          return JSON.stringify(ep.request.body, null, 2);
        }
        return JSON.stringify(
          {
            note: `No request body required for ${ep.method} requests.`,
            headers: (ep.request && ep.request.headers) || {}
          },
          null,
          2
        );
      }
      const live = state.liveSamples[ep.id];
      const payload = live && live.data ? live.data : ep.response ? ep.response.payload : {};
      return JSON.stringify(payload, null, 2);
    }

    function renderIndexRail(filtered) {
      if (!indexRailEl) return;
      if (filtered.length === 0) {
        indexRailEl.innerHTML = `<p class="text-xs text-[var(--muted)] p-2">No matching endpoints.</p>`;
        return;
      }

      indexRailEl.innerHTML = `
        <p class="px-2 py-1 text-xs font-semibold text-[var(--muted)]">Endpoints (${filtered.length})</p>
        ${filtered
          .map((ep) => {
            const isOpen = state.expandedCards.has(ep.id);
            return `
              <button
                type="button"
                class="api-index-link ${isOpen ? "is-active" : ""}"
                data-api-jump="${escHtml(ep.id)}"
              >
                <span class="flex items-center gap-2 min-w-0">
                  <span class="${getMethodClass(ep.method)}">${escHtml(ep.method)}</span>
                  <span class="text-xs font-semibold text-[var(--text)] truncate">${escHtml(ep.summary)}</span>
                </span>
                <span class="text-[11px] font-mono-tech text-[var(--muted)] truncate">${escHtml(ep.endpoint)}</span>
              </button>
            `;
          })
          .join("")}
      `;

      indexRailEl.querySelectorAll("[data-api-jump]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-api-jump");
          if (!id) return;
          state.expandedCards.add(id);
          renderCards(filtered);
          renderIndexRail(filtered);
          const cardEl = document.getElementById(`api-card-${id}`);
          if (cardEl) {
            cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });
      });
    }

    function renderCards(filtered) {
      if (!cardsListEl) return;

      if (countLabelEl) {
        countLabelEl.textContent = `${filtered.length} of ${endpoints.length} endpoints`;
      }

      if (toggleAllBtn) {
        const allOpen = filtered.length > 0 && filtered.every((ep) => state.expandedCards.has(ep.id));
        toggleAllBtn.innerHTML = allOpen
          ? `<i data-lucide="chevron-up" class="w-4 h-4"></i><span>Collapse All</span>`
          : `<i data-lucide="chevron-down" class="w-4 h-4"></i><span>Expand All</span>`;
      }

      if (filtered.length === 0) {
        cardsListEl.innerHTML = `
          <div class="api-card p-8 text-center space-y-3">
            <p class="text-base font-bold text-[var(--text)]">No matching endpoints found</p>
            <p class="text-sm text-[var(--muted)]">Try clearing your search filter or switching back to ALL HTTP methods.</p>
            <button type="button" id="api-empty-reset" class="outline-button text-xs min-h-[40px]">Reset Filters</button>
          </div>
        `;
        const emptyReset = document.getElementById("api-empty-reset");
        if (emptyReset) {
          emptyReset.addEventListener("click", resetFilters);
        }
        refreshIcons();
        return;
      }

      cardsListEl.innerHTML = filtered
        .map((ep) => {
          const isOpen = state.expandedCards.has(ep.id);
          const activeTab = state.activeTabs[ep.id] || "response";
          const isJsonExpanded = state.expandedJson.has(ep.id);
          const fullUrl = formatFullEndpoint(ep);
          const jsonText = getJsonTextForTab(ep, activeTab === "request" ? "request" : "response");
          const live = state.liveSamples[ep.id] || {};

          const paramsRows =
            ep.request && Array.isArray(ep.request.params) && ep.request.params.length > 0
              ? `
                <div class="overflow-x-auto border border-[var(--border)] rounded-lg bg-[var(--background)]">
                  <table class="api-spec-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>In</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${ep.request.params
                        .map(
                          (p) => `
                            <tr>
                              <td class="font-mono-tech font-semibold text-[var(--text)]">${escHtml(p.name)}</td>
                              <td class="font-mono-tech">${escHtml(p.location)}</td>
                              <td class="font-mono-tech">${escHtml(p.type)}</td>
                              <td class="font-mono-tech">${p.required ? "Yes" : "No"}</td>
                              <td>${escHtml(p.notes)}</td>
                            </tr>
                          `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : `<p class="text-xs text-[var(--muted)]">No URL path or query parameters defined for this endpoint.</p>`;

          const headersMarkup = Object.entries((ep.request && ep.request.headers) || {})
            .map(
              ([k, v]) => `
                <div class="flex flex-wrap items-center justify-between gap-2 py-1.5 border-b border-[var(--border)] last:border-b-0 text-xs font-mono-tech">
                  <span class="text-[var(--text)] font-semibold">${escHtml(k)}</span>
                  <span class="text-[var(--muted)]">${escHtml(v)}</span>
                </div>
              `
            )
            .join("");

          const statusRows = (ep.statusCodes || [])
            .map(
              (sc) => `
                <tr>
                  <td class="font-mono-tech font-bold tabular-nums text-[var(--text)]">${escHtml(sc.code)}</td>
                  <td class="font-mono-tech">${escHtml(sc.label)}</td>
                  <td>${escHtml(sc.meaning)}</td>
                </tr>
              `
            )
            .join("");

          return `
            <article id="api-card-${escHtml(ep.id)}" class="api-card ${isOpen ? "is-expanded" : ""}">
              <div class="api-card-head">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="flex flex-wrap items-center gap-2.5 min-w-0">
                    <span class="${getMethodClass(ep.method)}">${escHtml(ep.method)}</span>
                    <code class="text-xs sm:text-sm font-mono-tech font-semibold text-[var(--text)] break-all">${escHtml(ep.endpoint)}</code>
                  </div>

                  <div class="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      class="api-mini-btn"
                      data-copy-endpoint="${escHtml(ep.id)}"
                      aria-label="Copy endpoint ${escHtml(ep.endpoint)}"
                    >
                      <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                      <span>Copy Endpoint</span>
                    </button>
                    <button
                      type="button"
                      class="api-mini-btn"
                      data-toggle-card="${escHtml(ep.id)}"
                      aria-expanded="${isOpen ? "true" : "false"}"
                    >
                      <span>${isOpen ? "Hide Docs" : "Inspect"}</span>
                      <i data-lucide="${isOpen ? "chevron-up" : "chevron-down"}" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <h2 class="text-base sm:text-lg font-bold text-[var(--text)]">${escHtml(ep.summary)}</h2>
                  <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${escHtml(ep.description)}</p>
                </div>

                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)] pt-1">
                  <span class="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <i data-lucide="${ep.authLevel === "public" ? "unlock" : "lock"}" class="w-3.5 h-3.5 text-cyan-400" aria-hidden="true"></i>
                    <span>${escHtml(ep.authRequirement)}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>${escHtml(ep.domain)}</span>
                  <span aria-hidden="true">·</span>
                  <span class="font-mono-tech tabular-nums">Statuses: ${(ep.statusCodes || []).map((s) => s.code).join(", ")}</span>
                </div>
              </div>

              <div class="api-card-body" ${isOpen ? "" : "hidden"}>
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
                  <span class="font-mono-tech break-all">Target URI: <strong class="text-[var(--text-secondary)]">${escHtml(fullUrl)}</strong></span>
                  ${
                    ep.relatedHref
                      ? `<a href="${escHtml(ep.relatedHref)}" class="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:underline whitespace-nowrap"><span>${escHtml(ep.relatedLabel || "Related Page")}</span><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></a>`
                      : ""
                  }
                </div>

                <div class="api-tabs-bar">
                  <div class="api-tabs-group" role="tablist" aria-label="Endpoint documentation tabs for ${escHtml(ep.summary)}">
                    <button
                      type="button"
                      role="tab"
                      class="api-tab-btn ${activeTab === "response" ? "is-active" : ""}"
                      aria-selected="${activeTab === "response" ? "true" : "false"}"
                      data-api-tab="${escHtml(ep.id)}:response"
                    >
                      Response
                    </button>
                    <button
                      type="button"
                      role="tab"
                      class="api-tab-btn ${activeTab === "request" ? "is-active" : ""}"
                      aria-selected="${activeTab === "request" ? "true" : "false"}"
                      data-api-tab="${escHtml(ep.id)}:request"
                    >
                      Request
                    </button>
                    <button
                      type="button"
                      role="tab"
                      class="api-tab-btn ${activeTab === "status" ? "is-active" : ""}"
                      aria-selected="${activeTab === "status" ? "true" : "false"}"
                      data-api-tab="${escHtml(ep.id)}:status"
                    >
                      Status Codes
                    </button>
                  </div>

                  <div class="flex flex-wrap items-center gap-2">
                    ${
                      ep.isPublicLiveSafe
                        ? `
                          <button
                            type="button"
                            class="api-mini-btn"
                            data-try-public="${escHtml(ep.id)}"
                          >
                            <i data-lucide="globe" class="w-3.5 h-3.5 text-cyan-400"></i>
                            <span>${live.loading ? "Fetching..." : "Fetch Public GitHub GET"}</span>
                          </button>
                        `
                        : ""
                    }
                  </div>
                </div>

                <!-- Response Tab Panel -->
                <div role="tabpanel" ${activeTab === "response" ? "" : "hidden"} class="space-y-2.5">
                  ${
                    live.error
                      ? `<p class="text-xs text-amber-400">${escHtml(live.error)}</p>`
                      : ""
                  }
                  <div class="api-json-shell">
                    <div class="api-json-toolbar">
                      <span class="text-xs font-mono-tech font-semibold text-emerald-400 tabular-nums">
                        ${live.data ? "Live Public Response · 200 OK" : `Mock Response · ${escHtml((ep.response && ep.response.defaultStatus) || "200 OK")}`}
                      </span>
                      <div class="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          class="api-mini-btn"
                          data-expand-json="${escHtml(ep.id)}"
                          aria-pressed="${isJsonExpanded ? "true" : "false"}"
                        >
                          <i data-lucide="${isJsonExpanded ? "chevron-up" : "chevron-down"}" class="w-3.5 h-3.5"></i>
                          <span>${isJsonExpanded ? "Collapse Response" : "Expand Response"}</span>
                        </button>
                        <button
                          type="button"
                          class="api-mini-btn"
                          data-copy-json="${escHtml(ep.id)}:response"
                        >
                          <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                          <span>Copy JSON</span>
                        </button>
                      </div>
                    </div>
                    <pre class="api-json-pre ${isJsonExpanded ? "is-expanded-json" : ""}"><code>${escHtml(getJsonTextForTab(ep, "response"))}</code></pre>
                  </div>
                </div>

                <!-- Request Tab Panel -->
                <div role="tabpanel" ${activeTab === "request" ? "" : "hidden"} class="space-y-4">
                  <div class="space-y-1.5">
                    <h3 class="text-xs font-semibold text-[var(--text-secondary)]">Parameters</h3>
                    ${paramsRows}
                  </div>

                  <div class="space-y-1.5">
                    <h3 class="text-xs font-semibold text-[var(--text-secondary)]">Sanitized Request Headers</h3>
                    <div class="px-3.5 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]">
                      ${headersMarkup}
                    </div>
                  </div>

                  <div class="api-json-shell">
                    <div class="api-json-toolbar">
                      <span class="text-xs font-mono-tech font-semibold text-cyan-400">Request JSON Example</span>
                      <button
                        type="button"
                        class="api-mini-btn"
                        data-copy-json="${escHtml(ep.id)}:request"
                      >
                        <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                        <span>Copy JSON</span>
                      </button>
                    </div>
                    <pre class="api-json-pre ${isJsonExpanded ? "is-expanded-json" : ""}"><code>${escHtml(jsonText)}</code></pre>
                  </div>
                </div>

                <!-- Status Codes Tab Panel -->
                <div role="tabpanel" ${activeTab === "status" ? "" : "hidden"}>
                  <div class="overflow-x-auto border border-[var(--border)] rounded-lg bg-[var(--background)]">
                    <table class="api-spec-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Status</th>
                          <th>Meaning</th>
                        </tr>
                      </thead>
                      <tbody>${statusRows}</tbody>
                    </table>
                  </div>
                </div>
              </div>
            </article>
          `;
        })
        .join("");

      bindCardEvents(filtered);
      refreshIcons();
    }

    function markCopiedButton(btn, labelText) {
      if (!btn) return;
      btn.classList.add("is-copied");
      btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i><span>Copied</span>`;
      refreshIcons();
      setTimeout(() => {
        if (!btn.isConnected) return;
        btn.classList.remove("is-copied");
        btn.innerHTML = `<i data-lucide="copy" class="w-3.5 h-3.5"></i><span>${escHtml(labelText)}</span>`;
        refreshIcons();
      }, 1600);
    }

    function bindCardEvents(filtered) {
      if (!cardsListEl) return;

      cardsListEl.querySelectorAll("[data-toggle-card]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-toggle-card");
          if (!id) return;
          if (state.expandedCards.has(id)) {
            state.expandedCards.delete(id);
          } else {
            state.expandedCards.add(id);
          }
          renderCards(filtered);
          renderIndexRail(filtered);
        });
      });

      cardsListEl.querySelectorAll("[data-api-tab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const raw = btn.getAttribute("data-api-tab") || "";
          const [id, tab] = raw.split(":");
          if (!id || !tab) return;
          state.activeTabs[id] = tab;
          renderCards(filtered);
        });
      });

      cardsListEl.querySelectorAll("[data-expand-json]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-expand-json");
          if (!id) return;
          if (state.expandedJson.has(id)) {
            state.expandedJson.delete(id);
          } else {
            state.expandedJson.add(id);
          }
          renderCards(filtered);
        });
      });

      cardsListEl.querySelectorAll("[data-copy-endpoint]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-copy-endpoint");
          const ep = endpoints.find((item) => item.id === id);
          if (!ep) return;
          const text = `${ep.method} ${formatFullEndpoint(ep)}`;
          const ok = await copyText(text);
          if (ok) {
            markCopiedButton(btn, "Copy Endpoint");
            toast("Endpoint URL copied.", "success");
          }
        });
      });

      cardsListEl.querySelectorAll("[data-copy-json]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const raw = btn.getAttribute("data-copy-json") || "";
          const [id, part] = raw.split(":");
          const ep = endpoints.find((item) => item.id === id);
          if (!ep) return;
          const jsonStr = getJsonTextForTab(ep, part === "request" ? "request" : "response");
          const ok = await copyText(jsonStr);
          if (ok) {
            markCopiedButton(btn, "Copy JSON");
            toast("JSON payload copied.", "success");
          }
        });
      });

      cardsListEl.querySelectorAll("[data-try-public]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-try-public");
          const ep = endpoints.find((item) => item.id === id && item.isPublicLiveSafe);
          if (!ep) return;
          const url = `${formatFullEndpoint(ep)}?per_page=3&sort=updated`;
          state.liveSamples[id] = { loading: true, data: null, error: "" };
          renderCards(filtered);
          try {
            const resp = await fetch(url, {
              headers: { Accept: "application/vnd.github+json" }
            });
            if (!resp.ok) {
              throw new Error(`Public GitHub endpoint returned HTTP ${resp.status}. Showing static sample instead.`);
            }
            const data = await resp.json();
            const trimmed = Array.isArray(data)
              ? data.slice(0, 3).map((r) => ({
                  id: r.id,
                  name: r.name,
                  full_name: r.full_name,
                  private: Boolean(r.private),
                  html_url: r.html_url,
                  language: r.language,
                  stargazers_count: r.stargazers_count,
                  forks_count: r.forks_count,
                  updated_at: r.updated_at
                }))
              : data;
            state.liveSamples[id] = { loading: false, data: trimmed, error: "" };
          } catch (err) {
            state.liveSamples[id] = {
              loading: false,
              data: null,
              error: (err && err.message) || "Unable to reach public GitHub API. Showing static documentation payload."
            };
          }
          renderCards(getFiltered());
        });
      });
    }

    function resetFilters() {
      state.method = "ALL";
      state.domain = "ALL";
      state.query = "";
      if (searchInput) searchInput.value = "";
      if (domainSelect) domainSelect.value = "ALL";
      if (searchClear) searchClear.classList.add("hidden");
      render();
    }

    function render() {
      renderMethodFilters();
      const filtered = getFiltered();
      renderIndexRail(filtered);
      renderCards(filtered);
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.query = searchInput.value || "";
        if (searchClear) {
          searchClear.classList.toggle("hidden", state.query.length === 0);
        }
        render();
      });
    }

    if (searchClear && searchInput) {
      searchClear.addEventListener("click", () => {
        searchInput.value = "";
        state.query = "";
        searchClear.classList.add("hidden");
        searchInput.focus();
        render();
      });
    }

    if (domainSelect) {
      domainSelect.addEventListener("change", () => {
        state.domain = domainSelect.value || "ALL";
        render();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", resetFilters);
    }

    if (toggleAllBtn) {
      toggleAllBtn.addEventListener("click", () => {
        const filtered = getFiltered();
        const allOpen = filtered.length > 0 && filtered.every((ep) => state.expandedCards.has(ep.id));
        if (allOpen) {
          filtered.forEach((ep) => state.expandedCards.delete(ep.id));
        } else {
          filtered.forEach((ep) => state.expandedCards.add(ep.id));
        }
        render();
      });
    }

    renderDomainOptions();
    render();
  }

  window.PortfolioApiExplorer = {
    init,
    METHODS,
    DEFAULT_ENDPOINTS,
    getEndpoints,
    formatFullEndpoint
  };
})();
