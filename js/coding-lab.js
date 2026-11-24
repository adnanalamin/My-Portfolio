/**
 * AL AMIN Portfolio OS — Phase 58: Coding Challenge Lab
 * Interactive HTML, CSS, and JavaScript challenges executed strictly inside
 * an isolated <iframe sandbox="allow-scripts"> using srcdoc + token-validated postMessage.
 * Zero parent-window dynamic code evaluation and zero external transmission.
 */
(() => {
  const LAB_CHANNEL = "alamin-coding-lab-v1";

  const CHALLENGES = [
    {
      id: "js-filter-even-sum",
      title: "Sum Even Numbers",
      category: "JavaScript",
      difficulty: "Core",
      prompt: "Write a function sumEven(numbers) that returns the sum of all even integers in an array.",
      expectedBehavior: "sumEven([1, 2, 3, 4, 6]) returns 12; non-even or empty arrays return 0.",
      starterHtml: "<div class=\"out\" id=\"lab-result\">Run code or click Test</div>",
      starterCss: "body{margin:0;padding:1rem;font-family:system-ui,sans-serif;background:#0b1120;color:#e2e8f0;}.out{padding:0.75rem 1rem;border-radius:0.5rem;background:#1e293b;}",
      starterJs: `function sumEven(numbers) {
  if (!Array.isArray(numbers)) return 0;
  // Return sum of even numbers
  return 0;
}

const sample = sumEven([1, 2, 3, 4, 6]);
document.getElementById("lab-result").textContent = "sumEven([1,2,3,4,6]) = " + sample;
console.log("Result:", sample);`,
      hints: [
        "Use Array.prototype.reduce or a for...of loop and check num % 2 === 0.",
        "Remember to check typeof num === 'number' so non-numeric values do not break summation."
      ],
      solutionJs: `function sumEven(numbers) {
  if (!Array.isArray(numbers)) return 0;
  return numbers.reduce((acc, n) => (typeof n === "number" && n % 2 === 0 ? acc + n : acc), 0);
}

const sample = sumEven([1, 2, 3, 4, 6]);
document.getElementById("lab-result").textContent = "sumEven([1,2,3,4,6]) = " + sample;
console.log("Result:", sample);`,
      solutionExplanation: "Using Array.prototype.reduce keeps the accumulator pure in O(n) time while filtering out odd and non-numeric items.",
      testCases: [
        { name: "sumEven([1, 2, 3, 4, 6]) === 12", expr: "typeof sumEven === 'function' && sumEven([1, 2, 3, 4, 6]) === 12" },
        { name: "sumEven([1, 3, 5]) === 0", expr: "typeof sumEven === 'function' && sumEven([1, 3, 5]) === 0" },
        { name: "sumEven([]) === 0", expr: "typeof sumEven === 'function' && sumEven([]) === 0" }
      ]
    },
    {
      id: "js-slugify",
      title: "URL Slug Formatter",
      category: "JavaScript",
      difficulty: "Core",
      prompt: "Implement slugify(title) to produce clean lowercase hyphenated URL slugs without leading or trailing dashes.",
      expectedBehavior: "slugify('  Hello World! 2026 ') returns 'hello-world-2026'.",
      starterHtml: "<p id=\"slug-out\">Testing slugify...</p>",
      starterCss: "body{margin:0;padding:1rem;font-family:system-ui,sans-serif;background:#0b1120;color:#22d3ee;}",
      starterJs: `function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase();
}

document.getElementById("slug-out").textContent = slugify("  Hello World! 2026 ");`,
      hints: [
        "Replace sequences of non-alphanumeric characters [^a-z0-9]+ with '-'.",
        "Strip any leading or trailing hyphens using .replace(/^-+|-+$/g, '')."
      ],
      solutionJs: `function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const out = slugify("  Hello World! 2026 ");
document.getElementById("slug-out").textContent = out;
console.log("Slug:", out);`,
      solutionExplanation: "Collapsing repeated punctuation/whitespace into single dashes prevents ugly '--' segments.",
      testCases: [
        { name: "Trims & cleans punctuation", expr: "typeof slugify === 'function' && slugify('  Hello World! 2026 ') === 'hello-world-2026'" },
        { name: "Handles empty string safely", expr: "typeof slugify === 'function' && slugify('') === ''" },
        { name: "Collapses multiple spaces", expr: "typeof slugify === 'function' && slugify('MERN   Stack  API') === 'mern-stack-api'" }
      ]
    },
    {
      id: "js-unique-tags",
      title: "Normalize Unique Tags",
      category: "JavaScript",
      difficulty: "Intermediate",
      prompt: "Write uniqueTags(list) that trims, lowercases, deduplicates strings while preserving first-seen order.",
      expectedBehavior: "uniqueTags([' React ', 'node', 'react', 'CSS']) returns ['react', 'node', 'css'].",
      starterHtml: "<pre id=\"tags-out\"></pre>",
      starterCss: "body{margin:0;padding:1rem;font-family:monospace;background:#0b1120;color:#a5f3fc;}",
      starterJs: `function uniqueTags(list) {
  if (!Array.isArray(list)) return [];
  // Normalize & deduplicate
  return [];
}

document.getElementById("tags-out").textContent = JSON.stringify(uniqueTags([" React ", "node", "react", "CSS"]));`,
      hints: [
        "Use a Set to track seen normalized tags in O(1) lookup time.",
        "Skip empty strings after trimming."
      ],
      solutionJs: `function uniqueTags(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const clean = String(raw || "").trim().toLowerCase();
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      out.push(clean);
    }
  }
  return out;
}

const res = uniqueTags([" React ", "node", "react", "CSS"]);
document.getElementById("tags-out").textContent = JSON.stringify(res);
console.log("Normalized:", res);`,
      solutionExplanation: "A Set avoids O(n^2) Array.includes checks while keeping insertion order intact.",
      testCases: [
        { name: "Deduplicates case-insensitively", expr: "typeof uniqueTags === 'function' && JSON.stringify(uniqueTags([' React ', 'node', 'react', 'CSS'])) === '[\"react\",\"node\",\"css\"]'" },
        { name: "Skips blank items", expr: "typeof uniqueTags === 'function' && JSON.stringify(uniqueTags(['  ', 'api', ''])) === '[\"api\"]'" }
      ]
    },
    {
      id: "html-accessible-card",
      title: "Accessible Semantic Card",
      category: "HTML",
      difficulty: "Core",
      prompt: "Create an accessible semantic <article> card containing an <h2> title, descriptive <p>, and a native <button type=\"button\"> action.",
      expectedBehavior: "Preview contains <article class=\"card\"> with an <h2> and a <button type=\"button\">.",
      starterHtml: `<div class="card">
  <!-- Replace with semantic article, h2, paragraph, and native button -->
  <span class="title">Project Alpha</span>
</div>`,
      starterCss: "body{margin:0;padding:1rem;font-family:system-ui,sans-serif;background:#0b1120;color:#f8fafc;}.card{padding:1rem;border:1px solid #334155;border-radius:0.75rem;background:#111827;}button{margin-top:0.5rem;padding:0.45rem 0.9rem;border:0;border-radius:0.45rem;background:#6366f1;color:#fff;cursor:pointer;}",
      starterJs: `console.log("HTML card preview loaded.");`,
      hints: [
        "Change <div class=\"card\"> to <article class=\"card\">.",
        "Use <h2> for the card title and add <button type=\"button\">Inspect</button>."
      ],
      solutionHtml: `<article class="card">
  <h2>Project Alpha</h2>
  <p>Accessible semantic card built with native heading and button controls.</p>
  <button type="button">Inspect Project</button>
</article>`,
      solutionJs: `console.log("Accessible HTML card verified.");`,
      solutionExplanation: "Native semantic <article>, <h2>, and <button type=\"button\"> elements provide built-in screen reader landmarks and keyboard activation.",
      testCases: [
        { name: "Uses semantic <article class=\"card\">", expr: "Boolean(document.querySelector('article.card'))" },
        { name: "Contains <h2> heading inside card", expr: "Boolean(document.querySelector('article.card h2'))" },
        { name: "Contains native <button type=\"button\">", expr: "Boolean(document.querySelector('article.card button[type=\"button\"]'))" }
      ]
    },
    {
      id: "css-flex-center",
      title: "Centered Responsive Badge",
      category: "CSS",
      difficulty: "Core",
      prompt: "Style #stage using CSS Flexbox (display: flex; justify-content: center; align-items: center) so #badge sits centered vertically and horizontally.",
      expectedBehavior: "#stage uses display: flex and centers #badge cleanly inside 180px height.",
      starterHtml: `<div id="stage"><span id="badge">Centered UI</span></div>`,
      starterCss: `body { margin: 0; background: #0b1120; font-family: system-ui, sans-serif; }
#stage {
  height: 180px;
  /* Add flexbox centering rules here */
}
#badge {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: #06b6d4;
  color: #082f49;
  font-weight: 700;
}`,
      starterJs: `console.log("CSS stage ready.");`,
      hints: [
        "Add display: flex; align-items: center; justify-content: center; inside #stage { ... }."
      ],
      solutionCss: `body { margin: 0; background: #0b1120; font-family: system-ui, sans-serif; }
#stage {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
#badge {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: #06b6d4;
  color: #082f49;
  font-weight: 700;
}`,
      solutionJs: `console.log("CSS flex centering verified.");`,
      solutionExplanation: "Flexbox align-items and justify-content center children robustly without fixed magic margins.",
      testCases: [
        { name: "#stage has display: flex", expr: "getComputedStyle(document.getElementById('stage')).display === 'flex'" },
        { name: "#stage justify-content is center", expr: "getComputedStyle(document.getElementById('stage')).justifyContent === 'center'" },
        { name: "#stage align-items is center", expr: "getComputedStyle(document.getElementById('stage')).alignItems === 'center'" }
      ]
    }
  ];

  const state = {
    activeId: CHALLENGES[0].id,
    activeCategory: "All",
    code: { html: "", css: "", js: "" },
    hintIndex: 0,
    showSolution: false,
    consoleLogs: [],
    testResults: [],
    runToken: ""
  };

  function esc(val) {
    if (typeof window.escapeHtml === "function") return window.escapeHtml(val);
    return String(val ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function refreshIcons() {
    if (typeof window.refreshIcons === "function") window.refreshIcons();
    else if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
  }

  function createToken() {
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      const b = new Uint32Array(2);
      window.crypto.getRandomValues(b);
      return `${b[0].toString(36)}-${b[1].toString(36)}`;
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function getActiveChallenge() {
    return CHALLENGES.find((c) => c.id === state.activeId) || CHALLENGES[0];
  }

  function getPrimaryField(challenge) {
    if (challenge.category === "HTML") return "html";
    if (challenge.category === "CSS") return "css";
    return "js";
  }

  function buildSandboxSrcdoc(challenge, code, runToken, runTests) {
    const safeCss = String(code.css || "").replace(/<\/style/gi, "<\\/style");
    const safeJs = String(code.js || "").replace(/<\/script/gi, "<\\/script");
    const serializedChannel = JSON.stringify(LAB_CHANNEL);
    const serializedToken = JSON.stringify(runToken);

    const testRunnerBlock = runTests
      ? `
        try {
          var testResults = [];
          ${challenge.testCases
            .map(
              (tc) => `
                (function () {
                  var passed = false;
                  var errMsg = "";
                  try {
                    passed = Boolean(${tc.expr});
                  } catch (e) {
                    errMsg = e && e.message ? e.message : String(e);
                  }
                  testResults.push({ name: ${JSON.stringify(tc.name)}, passed: passed, error: errMsg });
                })();
              `
            )
            .join("\n")}
          window.parent.postMessage({ channel: CHANNEL, token: TOKEN, type: "tests", results: testResults }, "*");
        } catch (err) {
          window.parent.postMessage({ channel: CHANNEL, token: TOKEN, type: "console", level: "error", message: String(err) }, "*");
        }
      `
      : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>${safeCss}</style>
  <script>
    (function () {
      var CHANNEL = ${serializedChannel};
      var TOKEN = ${serializedToken};
      function send(level, args) {
        try {
          var out = [];
          for (var i = 0; i < args.length; i += 1) {
            var v = args[i];
            if (typeof v === "string") out.push(v);
            else {
              try { out.push(JSON.stringify(v)); } catch (_e) { out.push(String(v)); }
            }
          }
          window.parent.postMessage({ channel: CHANNEL, token: TOKEN, type: "console", level: level, message: out.join(" ") }, "*");
        } catch (_e) {}
      }
      var nativeConsole = window.console || {};
      ["log", "info", "warn", "error"].forEach(function (m) {
        var orig = typeof nativeConsole[m] === "function" ? nativeConsole[m].bind(nativeConsole) : null;
        nativeConsole[m] = function () {
          if (orig) try { orig.apply(nativeConsole, arguments); } catch (_e) {}
          send(m, arguments);
        };
      });
      window.addEventListener("error", function (ev) {
        send("error", [(ev.message || "Runtime error") + (ev.lineno ? " (line " + ev.lineno + ")" : "")]);
      });
    })();
  <\/script>
</head>
<body>
${code.html || ""}
<script>
  var CHANNEL = ${serializedChannel};
  var TOKEN = ${serializedToken};
  try {
    ${safeJs}
    ${testRunnerBlock}
  } catch (runtimeErr) {
    console.error(runtimeErr && runtimeErr.message ? runtimeErr.message : String(runtimeErr));
  }
<\/script>
</body>
</html>`;
  }

  function executeInSandbox(runTests = false) {
    const ch = getActiveChallenge();
    const editorEl = document.getElementById("cl-code-editor");
    if (editorEl) {
      state.code[getPrimaryField(ch)] = editorEl.value;
    }

    state.consoleLogs = [];
    if (runTests) {
      state.testResults = ch.testCases.map((tc) => ({ name: tc.name, status: "READY", detail: "" }));
    }
    renderConsole();
    renderTests();

    const iframe = document.getElementById("cl-sandbox-iframe");
    if (!iframe) return;

    state.runToken = createToken();
    iframe.srcdoc = buildSandboxSrcdoc(ch, state.code, state.runToken, runTests);
  }

  function loadChallenge(id) {
    const ch = CHALLENGES.find((c) => c.id === id) || CHALLENGES[0];
    state.activeId = ch.id;
    state.code = {
      html: ch.starterHtml,
      css: ch.starterCss,
      js: ch.starterJs
    };
    state.hintIndex = 0;
    state.showSolution = false;
    state.consoleLogs = [];
    state.testResults = ch.testCases.map((tc) => ({ name: tc.name, status: "READY", detail: "" }));
    render();
    executeInSandbox(false);
  }

  function renderChallengeList() {
    const listEl = document.getElementById("cl-challenge-list");
    if (!listEl) return;

    const visible =
      state.activeCategory === "All"
        ? CHALLENGES
        : CHALLENGES.filter((c) => c.category === state.activeCategory);

    listEl.innerHTML = visible
      .map(
        (ch) => `
          <button
            type="button"
            class="cl-challenge-btn ${ch.id === state.activeId ? "is-active" : ""}"
            data-cl-select="${esc(ch.id)}"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-sm text-[var(--text)]">${esc(ch.title)}</span>
              <span class="cl-lang-tag">${esc(ch.category)}</span>
            </div>
            <p class="text-[11px] text-[var(--muted)] mt-1">${esc(ch.difficulty)} · ${ch.testCases.length} tests</p>
          </button>
        `
      )
      .join("");

    listEl.querySelectorAll("[data-cl-select]").forEach((btn) => {
      btn.addEventListener("click", () => {
        loadChallenge(btn.getAttribute("data-cl-select"));
      });
    });
  }

  function renderConsole() {
    const el = document.getElementById("cl-console");
    if (!el) return;
    if (state.consoleLogs.length === 0) {
      el.innerHTML = `<p class="text-[var(--muted)]">Sandbox console ready. Output stays isolated inside sandboxed iframe.</p>`;
      return;
    }
    el.innerHTML = state.consoleLogs
      .map((entry) => {
        const cls = entry.level === "error" ? "text-rose-400" : entry.level === "warn" ? "text-amber-300" : "text-cyan-300";
        return `<div class="${cls}">[${esc(entry.level)}] ${esc(entry.message)}</div>`;
      })
      .join("");
  }

  function renderTests() {
    const el = document.getElementById("cl-tests");
    if (!el) return;
    el.innerHTML = state.testResults
      .map(
        (tr) => `
          <div class="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)]">
            <span class="text-xs font-mono-tech text-[var(--text-secondary)]">${esc(tr.name)}</span>
            <span class="cl-test-badge" data-status="${esc(tr.status)}">${esc(tr.status)}</span>
          </div>
        `
      )
      .join("");
  }

  function renderHintsAndSolution() {
    const ch = getActiveChallenge();
    const hintBox = document.getElementById("cl-hint-box");
    const solBox = document.getElementById("cl-solution-box");

    if (hintBox) {
      if (state.hintIndex === 0) {
        hintBox.classList.add("hidden");
        hintBox.innerHTML = "";
      } else {
        const shown = ch.hints.slice(0, state.hintIndex);
        hintBox.classList.remove("hidden");
        hintBox.innerHTML = `<p class="text-xs font-mono-tech text-amber-300 mb-1">Hints (${shown.length}/${ch.hints.length})</p>` +
          shown.map((h) => `<p class="text-xs text-[var(--text-secondary)]">• ${esc(h)}</p>`).join("");
      }
    }

    if (solBox) {
      if (!state.showSolution) {
        solBox.classList.add("hidden");
        solBox.innerHTML = "";
      } else {
        const field = getPrimaryField(ch);
        const solCode = field === "html" ? ch.solutionHtml : field === "css" ? ch.solutionCss : ch.solutionJs;
        solBox.classList.remove("hidden");
        solBox.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs font-mono-tech text-emerald-400">Reference Solution (${esc(field.toUpperCase())})</p>
              <button type="button" id="cl-apply-solution-btn" class="text-xs font-semibold text-cyan-400 hover:underline bg-transparent border-0 p-0 cursor-pointer">Apply to Editor</button>
            </div>
            <p class="text-xs text-[var(--muted)]">${esc(ch.solutionExplanation)}</p>
            <pre class="p-3 rounded-lg bg-[#050811] border border-[var(--border)] text-xs font-mono-tech text-slate-200 overflow-x-auto">${esc(solCode || "")}</pre>
          </div>
        `;
        const applyBtn = document.getElementById("cl-apply-solution-btn");
        if (applyBtn) {
          applyBtn.addEventListener("click", () => {
            state.code[field] = solCode || "";
            const ed = document.getElementById("cl-code-editor");
            if (ed) ed.value = state.code[field];
            executeInSandbox(true);
          });
        }
      }
    }
  }

  function render() {
    const ch = getActiveChallenge();
    const titleEl = document.getElementById("cl-active-title");
    const catEl = document.getElementById("cl-active-cat");
    const promptEl = document.getElementById("cl-active-prompt");
    const expectedEl = document.getElementById("cl-active-expected");
    const fieldLabel = document.getElementById("cl-editor-field-label");
    const editorEl = document.getElementById("cl-code-editor");

    if (titleEl) titleEl.textContent = ch.title;
    if (catEl) catEl.textContent = `${ch.category} · ${ch.difficulty}`;
    if (promptEl) promptEl.textContent = ch.prompt;
    if (expectedEl) expectedEl.textContent = ch.expectedBehavior;

    const field = getPrimaryField(ch);
    if (fieldLabel) fieldLabel.textContent = field === "html" ? "challenge.html" : field === "css" ? "styles.css" : "solution.js";
    if (editorEl) editorEl.value = state.code[field] || "";

    document.querySelectorAll("[data-cl-cat]").forEach((btn) => {
      const active = btn.getAttribute("data-cl-cat") === state.activeCategory;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    renderChallengeList();
    renderConsole();
    renderTests();
    renderHintsAndSolution();
    refreshIcons();
  }

  function bindMessageBridge() {
    if (bindMessageBridge.bound) return;
    bindMessageBridge.bound = true;

    window.addEventListener("message", (event) => {
      const iframe = document.getElementById("cl-sandbox-iframe");
      if (!iframe || !iframe.contentWindow) return;
      if (event.source !== iframe.contentWindow) return;
      if (event.origin !== "null") return;

      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.channel !== LAB_CHANNEL || data.token !== state.runToken) return;

      if (data.type === "console") {
        state.consoleLogs.push({
          level: String(data.level || "log"),
          message: String(data.message || "").slice(0, 800)
        });
        renderConsole();
      } else if (data.type === "tests" && Array.isArray(data.results)) {
        state.testResults = data.results.map((r) => ({
          name: String(r.name || "Test"),
          status: r.passed ? "PASS" : "FAIL",
          detail: r.error ? String(r.error) : ""
        }));
        renderTests();
      }
    });
  }

  function bindEvents() {
    const runBtn = document.getElementById("cl-run-btn");
    const testBtn = document.getElementById("cl-test-btn");
    const resetBtn = document.getElementById("cl-reset-btn");
    const hintBtn = document.getElementById("cl-hint-btn");
    const solBtn = document.getElementById("cl-solution-btn");

    if (runBtn) runBtn.addEventListener("click", () => executeInSandbox(false));
    if (testBtn) testBtn.addEventListener("click", () => executeInSandbox(true));
    if (resetBtn) resetBtn.addEventListener("click", () => loadChallenge(state.activeId));
    if (hintBtn) {
      hintBtn.addEventListener("click", () => {
        const ch = getActiveChallenge();
        state.hintIndex = Math.min(ch.hints.length, state.hintIndex + 1);
        renderHintsAndSolution();
      });
    }
    if (solBtn) {
      solBtn.addEventListener("click", () => {
        state.showSolution = !state.showSolution;
        renderHintsAndSolution();
      });
    }

    document.querySelectorAll("[data-cl-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeCategory = btn.getAttribute("data-cl-cat") || "All";
        renderChallengeList();
        document.querySelectorAll("[data-cl-cat]").forEach((b) => {
          const act = b.getAttribute("data-cl-cat") === state.activeCategory;
          b.classList.toggle("is-active", act);
          b.setAttribute("aria-pressed", String(act));
        });
      });
    });
  }

  function init() {
    const root = document.getElementById("coding-lab-root");
    if (!root) return;
    bindMessageBridge();
    bindEvents();
    loadChallenge(CHALLENGES[0].id);
  }

  window.PortfolioCodingLab = {
    init,
    CHALLENGES,
    loadChallenge,
    executeInSandbox,
    buildSandboxSrcdoc
  };
})();
