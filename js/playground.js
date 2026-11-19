/**
 * AL AMIN Portfolio — Phase 16: Live HTML CSS JavaScript Playground
 * Client-side multi-pane code editor with strictly sandboxed iframe execution (sandbox="allow-scripts")
 * and origin/token-validated postMessage console bridge. Zero eval() on parent page.
 */

const PortfolioPlayground = (() => {
  const CONSOLE_CHANNEL = "alamin-playground-console-v1";
  const ALLOWED_LEVELS = ["log", "info", "warn", "error", "clear"];
  const MAX_CONSOLE_ENTRIES = 120;

  const starterTemplates = [
    {
      id: "hello-world",
      name: "Hello World",
      html: `<main class="hero">
  <span class="tag">Interactive Sandbox</span>
  <h1>Hello, Developer World</h1>
  <p>Edit HTML, CSS, or JavaScript on the left to inspect changes live.</p>
  <button id="greet-btn" type="button">Say Hello (0)</button>
</main>`,
      css: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  font-family: system-ui, -apple-system, sans-serif;
  background: radial-gradient(circle at top, #1e293b 0%, #090d16 70%);
  color: #f8fafc;
}

.hero {
  max-width: 480px;
  width: 100%;
  padding: 2rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.22);
  text-align: center;
}

.tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #22d3ee;
  margin-bottom: 0.75rem;
}

h1 {
  font-size: clamp(1.5rem, 4vw, 2.1rem);
  margin-bottom: 0.75rem;
}

p {
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

button {
  padding: 0.7rem 1.35rem;
  border: 0;
  border-radius: 0.65rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  cursor: pointer;
}

button:hover {
  filter: brightness(1.1);
}`,
      js: `const btn = document.getElementById("greet-btn");
let count = 0;

console.log("Hello World template loaded cleanly.");

btn.addEventListener("click", () => {
  count += 1;
  btn.textContent = \`Say Hello (\${count})\`;
  console.info("Greeting clicked:", count);
});`
    },
    {
      id: "animated-button",
      name: "Animated Button",
      html: `<section class="stage">
  <button id="pulse-cta" class="kinetic-btn" type="button">
    <span class="shine" aria-hidden="true"></span>
    <span class="label">Deploy Build</span>
  </button>
  <p id="status-line" class="status">Click button to test spring feedback</p>
</section>`,
      css: `body {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  background: #0b1120;
  color: #e2e8f0;
  font-family: system-ui, -apple-system, sans-serif;
}

.stage {
  text-align: center;
  padding: 1.5rem;
}

.kinetic-btn {
  position: relative;
  overflow: hidden;
  padding: 0.95rem 2rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(99, 102, 241, 0.55);
  background: linear-gradient(135deg, #4f46e5, #0891b2);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease;
  box-shadow: 0 10px 26px -10px rgba(6, 182, 212, 0.65);
}

.kinetic-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 34px -10px rgba(99, 102, 241, 0.75);
}

.kinetic-btn:active {
  transform: translateY(0) scale(0.97);
}

.shine {
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(110deg, transparent 25%, rgba(255, 255, 255, 0.32) 50%, transparent 75%);
  transition: transform 550ms ease;
}

.kinetic-btn:hover .shine {
  transform: translateX(100%);
}

.status {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #94a3b8;
}`,
      js: `const cta = document.getElementById("pulse-cta");
const statusLine = document.getElementById("status-line");
let presses = 0;

cta.addEventListener("click", () => {
  presses += 1;
  statusLine.textContent = \`Triggered \${presses} time\${presses === 1 ? "" : "s"}\`;
  console.log("Animated button trigger count:", presses);
});`
    },
    {
      id: "gradient-card",
      name: "Gradient Card",
      html: `<div class="wrapper">
  <article id="spot-card" class="gradient-card">
    <p class="eyebrow">Full-Stack Craft</p>
    <h2>Interactive Spotlight Card</h2>
    <p class="copy">Move your pointer across this surface to track the radial highlight using CSS variables.</p>
    <div class="meta">HTML5 · CSS Variables · Pointer Events</div>
  </article>
</div>`,
      css: `body {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: #060911;
  font-family: system-ui, -apple-system, sans-serif;
  color: #f8fafc;
}

.wrapper {
  width: 100%;
  max-width: 400px;
}

.gradient-card {
  --mx: 50%;
  --my: 50%;
  padding: 1.8rem;
  border-radius: 1.15rem;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background:
    radial-gradient(280px circle at var(--mx) var(--my), rgba(6, 182, 212, 0.22), transparent 65%),
    linear-gradient(155deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.96));
  transition: border-color 180ms ease;
}

.gradient-card:hover {
  border-color: rgba(34, 211, 238, 0.6);
}

.eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  color: #22d3ee;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.6rem;
}

h2 {
  margin: 0 0 0.65rem;
  font-size: 1.35rem;
}

.copy {
  margin: 0 0 1.2rem;
  color: #94a3b8;
  line-height: 1.6;
  font-size: 0.92rem;
}

.meta {
  padding-top: 0.9rem;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  font-size: 0.78rem;
  color: #cbd5e1;
}`,
      js: `const card = document.getElementById("spot-card");

card.addEventListener("pointermove", (e) => {
  const rect = card.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  card.style.setProperty("--mx", x.toFixed(1) + "%");
  card.style.setProperty("--my", y.toFixed(1) + "%");
});

console.log("Spotlight gradient card ready.");`
    },
    {
      id: "image-gallery",
      name: "Image Gallery",
      html: `<main class="gallery-wrap">
  <header class="head">
    <h1>Visual Artworks</h1>
    <div class="filters" role="group" aria-label="Filter artwork category">
      <button type="button" class="filter-btn active" data-filter="all">All</button>
      <button type="button" class="filter-btn" data-filter="architecture">Architecture</button>
      <button type="button" class="filter-btn" data-filter="abstract">Abstract</button>
    </div>
  </header>
  <section id="gallery-grid" class="grid"></section>
  <p id="selected-caption" class="caption">Click any artwork tile to inspect selection.</p>
</main>`,
      css: `body {
  margin: 0;
  padding: 1.25rem;
  background: #0b1120;
  color: #f1f5f9;
  font-family: system-ui, -apple-system, sans-serif;
}

.gallery-wrap {
  max-width: 720px;
  margin: 0 auto;
}

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

h1 {
  margin: 0;
  font-size: 1.25rem;
}

.filters {
  display: flex;
  gap: 0.4rem;
}

.filter-btn {
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: #111827;
  color: #cbd5e1;
  font-size: 0.8rem;
  cursor: pointer;
}

.filter-btn.active {
  background: #4f46e5;
  border-color: #6366f1;
  color: #ffffff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

.tile {
  padding: 0;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 0.75rem;
  overflow: hidden;
  background: #0f172a;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.tile:hover {
  border-color: #22d3ee;
}

.tile svg {
  display: block;
  width: 100%;
  height: 110px;
}

.tile-title {
  padding: 0.5rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 600;
}

.caption {
  margin-top: 1rem;
  font-size: 0.84rem;
  color: #22d3ee;
}`,
      js: `const items = [
  { title: "Nordic Horizon", category: "abstract", bg: "#1e1b4b", accent: "#22d3ee" },
  { title: "Glass Atrium", category: "architecture", bg: "#0f172a", accent: "#6366f1" },
  { title: "Solar Meridian", category: "abstract", bg: "#172554", accent: "#a855f7" },
  { title: "Steel Pavilion", category: "architecture", bg: "#111827", accent: "#38bdf8" }
];

const grid = document.getElementById("gallery-grid");
const caption = document.getElementById("selected-caption");
let activeFilter = "all";

function render() {
  const list = activeFilter === "all" ? items : items.filter(i => i.category === activeFilter);
  grid.innerHTML = "";
  list.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tile";
    btn.innerHTML = \`
      <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="120" fill="\${item.bg}" />
        <circle cx="145" cy="40" r="28" fill="\${item.accent}" opacity="0.7" />
        <path d="M0 100 L65 52 L120 88 L200 40 L200 120 L0 120 Z" fill="\${item.accent}" opacity="0.28" />
      </svg>
      <div class="tile-title">\${item.title}</div>
    \`;
    btn.addEventListener("click", () => {
      caption.textContent = \`Selected: \${item.title} (\${item.category})\`;
      console.log("Selected gallery item:", item.title);
    });
    grid.appendChild(btn);
  });
}

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.getAttribute("data-filter");
    render();
    console.info("Filtered gallery by:", activeFilter);
  });
});

render();`
    },
    {
      id: "login-form",
      name: "Login Form",
      html: `<form id="auth-form" class="card" novalidate>
  <h1>Welcome Back</h1>
  <p class="sub">Sign in to preview client-side form validation.</p>

  <label for="email">Email Address</label>
  <input id="email" type="email" placeholder="developer@example.com" required>

  <label for="password">Password</label>
  <div class="pw-row">
    <input id="password" type="password" placeholder="At least 6 characters" required>
    <button id="toggle-pw" type="button" class="ghost">Show</button>
  </div>

  <p id="form-feedback" class="feedback" role="status"></p>
  <button type="submit" class="submit">Sign In</button>
</form>`,
      css: `* {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: #090d16;
  color: #f1f5f9;
  font-family: system-ui, -apple-system, sans-serif;
}

.card {
  width: 100%;
  max-width: 380px;
  padding: 1.75rem;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: #111827;
}

h1 {
  margin: 0 0 0.25rem;
  font-size: 1.35rem;
}

.sub {
  margin: 0 0 1.2rem;
  font-size: 0.84rem;
  color: #94a3b8;
}

label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0.75rem 0 0.35rem;
}

input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 0.55rem;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: #0b1120;
  color: #f8fafc;
}

.pw-row {
  display: flex;
  gap: 0.4rem;
}

.ghost {
  padding: 0 0.8rem;
  border-radius: 0.55rem;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: #1e293b;
  color: #e2e8f0;
  cursor: pointer;
}

.submit {
  width: 100%;
  margin-top: 1rem;
  padding: 0.72rem;
  border: 0;
  border-radius: 0.6rem;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.feedback {
  min-height: 1.2rem;
  margin: 0.75rem 0 0;
  font-size: 0.82rem;
}`,
      js: `const form = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const pwInput = document.getElementById("password");
const togglePw = document.getElementById("toggle-pw");
const feedback = document.getElementById("form-feedback");

togglePw.addEventListener("click", () => {
  const hidden = pwInput.type === "password";
  pwInput.type = hidden ? "text" : "password";
  togglePw.textContent = hidden ? "Hide" : "Show";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const pw = pwInput.value;

  if (!email.includes("@")) {
    feedback.style.color = "#f87171";
    feedback.textContent = "Please enter a valid email address.";
    console.warn("Validation failed: invalid email");
    return;
  }

  if (pw.length < 6) {
    feedback.style.color = "#f87171";
    feedback.textContent = "Password must be at least 6 characters.";
    console.warn("Validation failed: password too short");
    return;
  }

  feedback.style.color = "#34d399";
  feedback.textContent = "Form validated successfully (local demo).";
  console.info("Login form validated for:", email);
});`
    },
    {
      id: "pricing-card",
      name: "Pricing Card",
      html: `<section class="pricing-wrap">
  <div class="toggle-bar">
    <button type="button" class="bill-btn active" data-billing="monthly">Monthly</button>
    <button type="button" class="bill-btn" data-billing="annual">Annual (Save 20%)</button>
  </div>

  <div class="cards">
    <article class="plan">
      <p class="tier">For early-stage teams</p>
      <h2>Starter</h2>
      <p class="price" data-monthly="$19" data-annual="$15">$19<span>/mo</span></p>
      <ul>
        <li>Up to 3 active workspaces</li>
        <li>100k telemetry events / month</li>
        <li>Community forum support</li>
      </ul>
      <button type="button" class="cta" data-plan="Starter">Choose Starter</button>
    </article>

    <article class="plan featured">
      <p class="tier">For scaling operations</p>
      <h2>Pro Workspace</h2>
      <p class="price" data-monthly="$49" data-annual="$39">$49<span>/mo</span></p>
      <ul>
        <li>Unlimited workspaces</li>
        <li>2M telemetry events / month</li>
        <li>Priority webhook alerts</li>
      </ul>
      <button type="button" class="cta" data-plan="Pro Workspace">Choose Pro</button>
    </article>
  </div>
</section>`,
      css: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 1.5rem;
  min-height: 100vh;
  background: #090d16;
  color: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
}

.pricing-wrap {
  max-width: 700px;
  margin: 0 auto;
}

.toggle-bar {
  display: inline-flex;
  padding: 0.25rem;
  border-radius: 0.65rem;
  background: #111827;
  border: 1px solid rgba(148, 163, 184, 0.22);
  margin-bottom: 1.25rem;
}

.bill-btn {
  padding: 0.45rem 0.9rem;
  border: 0;
  border-radius: 0.45rem;
  background: transparent;
  color: #94a3b8;
  font-weight: 600;
  cursor: pointer;
}

.bill-btn.active {
  background: #4f46e5;
  color: #ffffff;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
}

.plan {
  padding: 1.4rem;
  border-radius: 0.95rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: #111827;
}

.plan.featured {
  border-color: rgba(6, 182, 212, 0.65);
}

.tier {
  margin: 0 0 0.25rem;
  font-size: 0.78rem;
  color: #22d3ee;
}

h2 {
  margin: 0 0 0.6rem;
  font-size: 1.2rem;
}

.price {
  margin: 0 0 0.9rem;
  font-size: 2rem;
  font-weight: 800;
}

.price span {
  font-size: 0.85rem;
  font-weight: 500;
  color: #94a3b8;
}

ul {
  margin: 0 0 1.2rem;
  padding-left: 1.1rem;
  color: #cbd5e1;
  font-size: 0.86rem;
  line-height: 1.7;
}

.cta {
  width: 100%;
  padding: 0.65rem;
  border: 0;
  border-radius: 0.55rem;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}`,
      js: `const bills = document.querySelectorAll(".bill-btn");
const prices = document.querySelectorAll(".price");
let currentBilling = "monthly";

bills.forEach((btn) => {
  btn.addEventListener("click", () => {
    bills.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentBilling = btn.getAttribute("data-billing");
    prices.forEach((p) => {
      const amount = p.getAttribute("data-" + currentBilling);
      p.innerHTML = \`\${amount}<span>/mo</span>\`;
    });
    console.info("Switched billing cycle to:", currentBilling);
  });
});

document.querySelectorAll(".cta").forEach((btn) => {
  btn.addEventListener("click", () => {
    console.log("Selected plan:", btn.getAttribute("data-plan"), "(" + currentBilling + ")");
  });
});`
    },
    {
      id: "responsive-navbar",
      name: "Responsive Navbar",
      html: `<header class="navbar">
  <a href="#home" class="brand">NovaLab</a>
  <button id="menu-btn" class="menu-toggle" type="button" aria-expanded="false">Menu</button>
  <nav id="nav-links" class="links" aria-label="Demo navigation">
    <a href="#work" class="nav-item active">Work</a>
    <a href="#services" class="nav-item">Services</a>
    <a href="#about" class="nav-item">About</a>
    <a href="#contact" class="nav-item">Contact</a>
  </nav>
</header>

<main class="content">
  <h1>Responsive Navbar Demo</h1>
  <p>Use the Desktop / 768px / 375px buttons above the preview to test responsive navigation collapsing.</p>
</main>`,
      css: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #0b1120;
  color: #f1f5f9;
  font-family: system-ui, -apple-system, sans-serif;
}

.navbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  background: #111827;
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
}

.brand {
  font-weight: 800;
  color: #ffffff;
  text-decoration: none;
}

.menu-toggle {
  padding: 0.45rem 0.75rem;
  border-radius: 0.45rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: #1e293b;
  color: #f8fafc;
  cursor: pointer;
}

.links {
  display: none;
  width: 100%;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.links.open {
  display: flex;
}

.nav-item {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.35rem 0.5rem;
  border-radius: 0.4rem;
}

.nav-item.active,
.nav-item:hover {
  color: #22d3ee;
  background: rgba(34, 211, 238, 0.08);
}

@media (min-width: 640px) {
  .menu-toggle {
    display: none;
  }
  .links {
    display: flex;
    width: auto;
    flex-direction: row;
    padding-top: 0;
  }
}

.content {
  padding: 1.5rem 1.25rem;
}

.content p {
  color: #94a3b8;
  line-height: 1.6;
}`,
      js: `const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

menuBtn.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
  console.log("Mobile menu open:", open);
});

document.querySelectorAll(".nav-item").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    link.classList.add("active");
    console.info("Navigated to tab:", link.textContent);
  });
});`
    },
    {
      id: "simple-calculator",
      name: "Simple Calculator",
      html: `<section class="calc" aria-label="Calculator">
  <div id="display" class="display">0</div>
  <div class="keys">
    <button type="button" data-action="clear" class="util">C</button>
    <button type="button" data-action="back" class="util">DEL</button>
    <button type="button" data-op="/" class="op">/</button>
    <button type="button" data-op="*" class="op">*</button>

    <button type="button" data-num="7">7</button>
    <button type="button" data-num="8">8</button>
    <button type="button" data-num="9">9</button>
    <button type="button" data-op="-" class="op">-</button>

    <button type="button" data-num="4">4</button>
    <button type="button" data-num="5">5</button>
    <button type="button" data-num="6">6</button>
    <button type="button" data-op="+" class="op">+</button>

    <button type="button" data-num="1">1</button>
    <button type="button" data-num="2">2</button>
    <button type="button" data-num="3">3</button>
    <button type="button" data-action="eq" class="eq" rowspan="2">=</button>

    <button type="button" data-num="0" class="zero">0</button>
    <button type="button" data-num=".">.</button>
  </div>
</section>`,
      css: `* {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: #090d16;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.calc {
  width: 100%;
  max-width: 290px;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: #111827;
}

.display {
  margin-bottom: 0.85rem;
  padding: 0.85rem 0.9rem;
  border-radius: 0.65rem;
  background: #070b14;
  color: #22d3ee;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: right;
  overflow-x: auto;
}

.keys {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
}

button {
  min-height: 44px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 0.55rem;
  background: #1e293b;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  background: #334155;
}

button.op {
  color: #818cf8;
}

button.util {
  color: #fbbf24;
}

button.eq {
  grid-row: span 2;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  color: #ffffff;
}

button.zero {
  grid-column: span 2;
}`,
      js: `const display = document.getElementById("display");
let current = "0";
let previous = null;
let operator = null;
let resetNext = false;

function compute(a, b, op) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b === 0 ? "Error" : a / b;
  return b;
}

function updateDisplay() {
  display.textContent = current;
}

document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const num = btn.getAttribute("data-num");
  const op = btn.getAttribute("data-op");
  const action = btn.getAttribute("data-action");

  if (num !== null) {
    if (resetNext || current === "0" || current === "Error") {
      current = num === "." ? "0." : num;
      resetNext = false;
    } else if (!(num === "." && current.includes("."))) {
      current += num;
    }
    updateDisplay();
    return;
  }

  if (op) {
    if (operator && previous !== null && !resetNext) {
      const res = compute(Number(previous), Number(current), operator);
      current = String(res);
    }
    previous = current;
    operator = op;
    resetNext = true;
    updateDisplay();
    return;
  }

  if (action === "clear") {
    current = "0";
    previous = null;
    operator = null;
    resetNext = false;
    updateDisplay();
  } else if (action === "back") {
    current = current.length > 1 ? current.slice(0, -1) : "0";
    updateDisplay();
  } else if (action === "eq" && operator && previous !== null) {
    const result = compute(Number(previous), Number(current), operator);
    console.log(\`\${previous} \${operator} \${current} = \${result}\`);
    current = String(result);
    previous = null;
    operator = null;
    resetNext = true;
    updateDisplay();
  }
});`
    }
  ];

  const state = {
    activeTemplateId: starterTemplates[0].id,
    activeTab: "html",
    mobileView: "editor",
    previewWidth: "desktop",
    autoRun: true,
    isFullscreen: false,
    isDirty: false,
    baseline: {
      html: starterTemplates[0].html,
      css: starterTemplates[0].css,
      js: starterTemplates[0].js
    },
    runToken: "",
    consoleEntries: [],
    debounceTimer: null
  };

  function escapeHtml(value) {
    if (typeof window.escapeHtml === "function") {
      return window.escapeHtml(value);
    }
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createRunToken() {
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      const bytes = new Uint32Array(2);
      window.crypto.getRandomValues(bytes);
      return `${bytes[0].toString(36)}-${bytes[1].toString(36)}`;
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function getEditors() {
    return {
      html: document.getElementById("editor-html"),
      css: document.getElementById("editor-css"),
      js: document.getElementById("editor-js")
    };
  }

  function getActiveTextarea() {
    const editors = getEditors();
    return editors[state.activeTab] || editors.html;
  }

  function getCurrentCode() {
    const editors = getEditors();
    return {
      html: editors.html ? editors.html.value : "",
      css: editors.css ? editors.css.value : "",
      js: editors.js ? editors.js.value : ""
    };
  }

  function updateLineNumbers() {
    const activeTa = getActiveTextarea();
    const gutter = document.getElementById("pg-line-gutter");
    const countEl = document.getElementById("pg-line-count");
    if (!activeTa) return;

    const lineCount = Math.max(1, activeTa.value.split("\n").length);
    if (gutter) {
      const nums = [];
      for (let i = 1; i <= lineCount; i += 1) {
        nums.push(String(i));
      }
      gutter.textContent = nums.join("\n");
      gutter.scrollTop = activeTa.scrollTop;
    }
    if (countEl) {
      countEl.textContent = `${lineCount} ${lineCount === 1 ? "line" : "lines"}`;
    }
  }

  function syncDirtyState() {
    const code = getCurrentCode();
    const dirty =
      code.html !== state.baseline.html ||
      code.css !== state.baseline.css ||
      code.js !== state.baseline.js;

    state.isDirty = dirty;
    const indicator = document.getElementById("pg-unsaved-indicator");
    const textEl = document.getElementById("pg-unsaved-text");
    if (indicator) {
      indicator.classList.toggle("is-dirty", dirty);
      indicator.classList.toggle("is-clean", !dirty);
    }
    if (textEl) {
      textEl.textContent = dirty ? "Unsaved changes" : "Clean";
    }
  }

  function setActiveEditorTab(lang) {
    if (!["html", "css", "js"].includes(lang)) return;
    state.activeTab = lang;

    const fileMap = {
      html: "index.html",
      css: "styles.css",
      js: "script.js"
    };

    document.querySelectorAll("[data-editor-tab]").forEach((btn) => {
      const isSelected = btn.getAttribute("data-editor-tab") === lang;
      btn.classList.toggle("is-active", isSelected);
      btn.setAttribute("aria-selected", isSelected ? "true" : "false");
    });

    const editors = getEditors();
    Object.entries(editors).forEach(([key, ta]) => {
      if (!ta) return;
      ta.classList.toggle("is-hidden", key !== lang);
    });

    const fileLabel = document.getElementById("pg-active-file-label");
    if (fileLabel) fileLabel.textContent = fileMap[lang];

    updateLineNumbers();
  }

  function setMobileView(view) {
    state.mobileView = view === "preview" ? "preview" : "editor";
    const editorPane = document.getElementById("pg-editor-pane");
    const previewPane = document.getElementById("pg-preview-pane");

    if (editorPane) {
      editorPane.setAttribute("data-mobile-hidden", state.mobileView === "preview" ? "true" : "false");
    }
    if (previewPane) {
      previewPane.setAttribute("data-mobile-hidden", state.mobileView === "editor" ? "true" : "false");
    }

    document.querySelectorAll("[data-mobile-view]").forEach((btn) => {
      const isSelected = btn.getAttribute("data-mobile-view") === state.mobileView;
      btn.classList.toggle("is-active", isSelected);
      btn.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
  }

  function setPreviewWidth(mode) {
    const allowed = ["desktop", "tablet", "mobile"];
    const nextMode = allowed.includes(mode) ? mode : "desktop";
    state.previewWidth = nextMode;

    const box = document.getElementById("pg-iframe-box");
    const dimLabel = document.getElementById("pg-preview-dimensions");
    if (box) box.setAttribute("data-preview-size", nextMode);

    const labels = {
      desktop: "100%",
      tablet: "768px",
      mobile: "375px"
    };
    if (dimLabel) dimLabel.textContent = labels[nextMode];

    document.querySelectorAll("[data-preview-width]").forEach((btn) => {
      const active = btn.getAttribute("data-preview-width") === nextMode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function renderConsoleEntries() {
    const listEl = document.getElementById("pg-console-output");
    const countEl = document.getElementById("pg-console-count");
    if (countEl) {
      countEl.textContent = `${state.consoleEntries.length} ${state.consoleEntries.length === 1 ? "entry" : "entries"}`;
    }
    if (!listEl) return;

    if (state.consoleEntries.length === 0) {
      listEl.innerHTML = `<p class="pg-console-empty">Console ready — output and runtime errors appear here cleanly.</p>`;
      return;
    }

    listEl.innerHTML = state.consoleEntries
      .map((entry) => {
        const levelClass = `level-${entry.level}`;
        return `
          <div class="pg-console-row ${levelClass}">
            <span class="pg-console-level">${escapeHtml(entry.level)}</span>
            <span class="pg-console-time">${escapeHtml(entry.time)}</span>
            <span class="pg-console-msg">${escapeHtml(entry.text)}</span>
          </div>
        `;
      })
      .join("");

    listEl.scrollTop = listEl.scrollHeight;
  }

  function clearConsole() {
    state.consoleEntries = [];
    renderConsoleEntries();
  }

  function appendConsoleEntry(level, messages) {
    if (level === "clear") {
      clearConsole();
      return;
    }
    const safeLevel = ALLOWED_LEVELS.includes(level) ? level : "log";
    const text = (Array.isArray(messages) ? messages : [String(messages ?? "")])
      .map((item) => String(item).slice(0, 1200))
      .join(" ");

    const now = new Date();
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");

    state.consoleEntries.push({ level: safeLevel, text, time });
    if (state.consoleEntries.length > MAX_CONSOLE_ENTRIES) {
      state.consoleEntries.shift();
    }
    renderConsoleEntries();
  }

  function buildSandboxBridgeScript(runToken) {
    const serializedChannel = JSON.stringify(CONSOLE_CHANNEL);
    const serializedToken = JSON.stringify(runToken);

    return `
      (function () {
        var CHANNEL = ${serializedChannel};
        var TOKEN = ${serializedToken};

        function formatArg(val) {
          if (val === undefined) return "undefined";
          if (val === null) return "null";
          if (typeof val === "string") return val;
          if (typeof val === "number" || typeof val === "boolean" || typeof val === "bigint") {
            return String(val);
          }
          if (val instanceof Error) {
            return val.name + ": " + val.message;
          }
          try {
            var seen = [];
            return JSON.stringify(val, function (_k, v) {
              if (typeof v === "object" && v !== null) {
                if (seen.indexOf(v) !== -1) return "[Circular]";
                seen.push(v);
              }
              return v;
            }, 2);
          } catch (_err) {
            return Object.prototype.toString.call(val);
          }
        }

        function emit(level, args) {
          try {
            var list = [];
            for (var i = 0; i < args.length; i += 1) {
              list.push(formatArg(args[i]));
            }
            window.parent.postMessage({
              channel: CHANNEL,
              token: TOKEN,
              level: level,
              messages: list
            }, "*");
          } catch (_e) {}
        }

        var nativeConsole = window.console || {};
        ["log", "info", "warn", "error", "clear"].forEach(function (method) {
          var orig = typeof nativeConsole[method] === "function" ? nativeConsole[method].bind(nativeConsole) : null;
          nativeConsole[method] = function () {
            if (orig) {
              try { orig.apply(nativeConsole, arguments); } catch (_e) {}
            }
            emit(method, arguments);
          };
        });

        window.addEventListener("error", function (event) {
          var lineInfo = event.lineno ? " (line " + event.lineno + ")" : "";
          var msg = (event.message || "Script runtime error") + lineInfo;
          emit("error", [msg]);
        });

        window.addEventListener("unhandledrejection", function (event) {
          emit("error", ["Unhandled Promise Rejection:", event.reason]);
        });
      })();
    `;
  }

  function buildPreviewDocument(html, css, js, runToken) {
    const safeCss = String(css || "").replace(/<\/style/gi, "<\\/style");
    const safeJs = String(js || "").replace(/<\/script/gi, "<\\/script");
    const bridgeScript = buildSandboxBridgeScript(runToken);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${safeCss}</style>
  <script>${bridgeScript}<\/script>
</head>
<body>
${html || ""}
<script>${safeJs}<\/script>
</body>
</html>`;
  }

  function buildDownloadDocument(html, css, js, title) {
    const safeCss = String(css || "").replace(/<\/style/gi, "<\\/style");
    const safeJs = String(js || "").replace(/<\/script/gi, "<\\/script");
    const safeTitle = escapeHtml(title || "Playground Export");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
${safeCss}
  </style>
</head>
<body>
${html || ""}
  <script>
${safeJs}
  <\/script>
</body>
</html>
`;
  }

  function runCode() {
    const iframe = document.getElementById("pg-preview-iframe");
    if (!iframe) return;

    const code = getCurrentCode();
    state.runToken = createRunToken();
    clearConsole();

    const doc = buildPreviewDocument(code.html, code.css, code.js, state.runToken);
    iframe.srcdoc = doc;
  }

  function loadTemplate(templateId, shouldRun = true) {
    const tpl = starterTemplates.find((t) => t.id === templateId) || starterTemplates[0];
    state.activeTemplateId = tpl.id;
    state.baseline = {
      html: tpl.html,
      css: tpl.css,
      js: tpl.js
    };

    const editors = getEditors();
    if (editors.html) editors.html.value = tpl.html;
    if (editors.css) editors.css.value = tpl.css;
    if (editors.js) editors.js.value = tpl.js;

    const selectEl = document.getElementById("pg-template-select");
    if (selectEl) selectEl.value = tpl.id;

    updateLineNumbers();
    syncDirtyState();

    if (shouldRun) {
      runCode();
    }
  }

  function clearAllEditors() {
    const editors = getEditors();
    if (editors.html) editors.html.value = "";
    if (editors.css) editors.css.value = "";
    if (editors.js) editors.js.value = "";

    updateLineNumbers();
    syncDirtyState();
    clearConsole();

    const iframe = document.getElementById("pg-preview-iframe");
    if (iframe) {
      state.runToken = createRunToken();
      iframe.srcdoc = buildPreviewDocument(
        `<div style="min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#090d16;color:#94a3b8;padding:1.5rem;text-align:center;">Editor cleared. Start typing or pick a starter example.</div>`,
        "",
        "",
        state.runToken
      );
    }

    if (typeof window.showToast === "function") {
      window.showToast("Editors cleared", "info");
    }
  }

  function copyBuffer(lang, label) {
    const editors = getEditors();
    const ta = editors[lang];
    if (!ta) return;

    const text = ta.value;
    const onDone = () => {
      if (typeof window.showToast === "function") {
        window.showToast(`${label} copied to clipboard`, "success");
      }
    };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).then(onDone).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      try {
        const helper = document.createElement("textarea");
        helper.value = text;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        document.body.removeChild(helper);
        onDone();
      } catch (_err) {
        if (typeof window.showToast === "function") {
          window.showToast(`Unable to copy ${label}`, "error");
        }
      }
    }
  }

  function downloadHtmlFile() {
    const tpl = starterTemplates.find((t) => t.id === state.activeTemplateId) || starterTemplates[0];
    const code = getCurrentCode();
    const doc = buildDownloadDocument(code.html, code.css, code.js, `${tpl.name} — AL AMIN Playground`);
    const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${tpl.id}-playground.html`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    if (typeof window.showToast === "function") {
      window.showToast(`Downloaded ${tpl.id}-playground.html`, "success");
    }
  }

  function toggleFullscreen(forceState) {
    const previewPane = document.getElementById("pg-preview-pane");
    const btn = document.getElementById("pg-fullscreen-btn");
    const labelEl = document.getElementById("pg-fullscreen-label");
    if (!previewPane) return;

    const nextState = typeof forceState === "boolean" ? forceState : !state.isFullscreen;
    state.isFullscreen = nextState;

    previewPane.classList.toggle("is-fullscreen", nextState);
    document.body.classList.toggle("menu-open", nextState);

    if (btn) btn.setAttribute("aria-pressed", nextState ? "true" : "false");
    if (labelEl) labelEl.textContent = nextState ? "Exit Fullscreen" : "Fullscreen Preview";
  }

  function bindResetModal() {
    const modal = document.getElementById("pg-reset-modal");
    const resetBtn = document.getElementById("pg-reset-btn");
    const closeBtn = document.getElementById("pg-reset-close");
    const cancelBtn = document.getElementById("pg-reset-cancel");
    const confirmBtn = document.getElementById("pg-reset-confirm");

    if (!modal || !resetBtn) return;

    let lastTrigger = null;

    const openModal = () => {
      lastTrigger = resetBtn;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
      if (confirmBtn) window.setTimeout(() => confirmBtn.focus(), 40);
    };

    const closeModal = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      if (!state.isFullscreen) {
        document.body.classList.remove("menu-open");
      }
      if (lastTrigger && typeof lastTrigger.focus === "function") {
        lastTrigger.focus();
      }
    };

    resetBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        loadTemplate(state.activeTemplateId, true);
        closeModal();
        if (typeof window.showToast === "function") {
          window.showToast("Template reset to default code", "success");
        }
      });
    }

    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    if (!bindResetModal.keyBound) {
      bindResetModal.keyBound = true;
      document.addEventListener("keydown", (event) => {
        if (!modal.classList.contains("is-open")) return;
        if (event.key === "Escape") {
          closeModal();
        } else if (event.key === "Tab" && typeof window.trapDialogFocus === "function") {
          window.trapDialogFocus(modal, event);
        }
      });
    }
  }

  function bindMessageBridge() {
    if (bindMessageBridge.bound) return;
    bindMessageBridge.bound = true;

    window.addEventListener("message", (event) => {
      const iframe = document.getElementById("pg-preview-iframe");
      if (!iframe || !iframe.contentWindow) return;

      // Validate exact source iframe and opaque sandbox origin ("null")
      if (event.source !== iframe.contentWindow) return;
      if (event.origin !== "null") return;

      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.channel !== CONSOLE_CHANNEL) return;
      if (typeof data.token !== "string" || data.token !== state.runToken) return;
      if (!ALLOWED_LEVELS.includes(data.level)) return;
      if (!Array.isArray(data.messages)) return;

      appendConsoleEntry(data.level, data.messages);
    });
  }

  function handleTextareaKeydown(event, ta) {
    if (event.key === "Tab") {
      event.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const value = ta.value;
      ta.value = `${value.slice(0, start)}  ${value.slice(end)}`;
      ta.selectionStart = ta.selectionEnd = start + 2;
      updateLineNumbers();
      syncDirtyState();
      if (state.autoRun) {
        window.clearTimeout(state.debounceTimer);
        state.debounceTimer = window.setTimeout(runCode, 420);
      }
      return;
    }

    if (event.key === "Escape") {
      const activeTabBtn = document.querySelector(`[data-editor-tab="${state.activeTab}"]`);
      if (activeTabBtn && typeof activeTabBtn.focus === "function") {
        activeTabBtn.focus();
      } else {
        ta.blur();
      }
    }
  }

  function bindGlobalShortcuts() {
    if (bindGlobalShortcuts.bound) return;
    bindGlobalShortcuts.bound = true;

    document.addEventListener("keydown", (event) => {
      const root = document.getElementById("playground-root");
      if (!root) return;

      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        runCode();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        downloadHtmlFile();
      } else if (event.key === "Escape" && state.isFullscreen) {
        toggleFullscreen(false);
      }
    });
  }

  function init() {
    const root = document.getElementById("playground-root");
    if (!root) return;
    root.dataset.moduleReady = "true";

    const selectEl = document.getElementById("pg-template-select");
    if (selectEl) {
      selectEl.innerHTML = starterTemplates
        .map((tpl) => `<option value="${escapeHtml(tpl.id)}">${escapeHtml(tpl.name)}</option>`)
        .join("");
      selectEl.addEventListener("change", () => {
        loadTemplate(selectEl.value, true);
        if (typeof window.showToast === "function") {
          const picked = starterTemplates.find((t) => t.id === selectEl.value);
          window.showToast(`Loaded ${picked ? picked.name : "template"}`, "info");
        }
      });
    }

    document.querySelectorAll("[data-editor-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setActiveEditorTab(btn.getAttribute("data-editor-tab"));
      });
    });

    document.querySelectorAll("[data-mobile-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setMobileView(btn.getAttribute("data-mobile-view"));
      });
    });

    document.querySelectorAll("[data-preview-width]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setPreviewWidth(btn.getAttribute("data-preview-width"));
      });
    });

    const editors = getEditors();
    const gutter = document.getElementById("pg-line-gutter");
    Object.values(editors).forEach((ta) => {
      if (!ta) return;

      ta.addEventListener("input", () => {
        updateLineNumbers();
        syncDirtyState();
        if (state.autoRun) {
          window.clearTimeout(state.debounceTimer);
          state.debounceTimer = window.setTimeout(runCode, 420);
        }
      });

      ta.addEventListener("scroll", () => {
        if (gutter && ta === getActiveTextarea()) {
          gutter.scrollTop = ta.scrollTop;
        }
      });

      ta.addEventListener("keydown", (event) => handleTextareaKeydown(event, ta));
    });

    const autoRunToggle = document.getElementById("pg-autorun-toggle");
    if (autoRunToggle) {
      state.autoRun = autoRunToggle.checked;
      autoRunToggle.addEventListener("change", () => {
        state.autoRun = autoRunToggle.checked;
        if (state.autoRun) runCode();
      });
    }

    const runBtn = document.getElementById("pg-run-btn");
    if (runBtn) {
      runBtn.addEventListener("click", () => {
        runCode();
        if (window.innerWidth < 1024) {
          setMobileView("preview");
        }
      });
    }

    const clearBtn = document.getElementById("pg-clear-btn");
    if (clearBtn) clearBtn.addEventListener("click", clearAllEditors);

    const copyHtmlBtn = document.getElementById("pg-copy-html");
    const copyCssBtn = document.getElementById("pg-copy-css");
    const copyJsBtn = document.getElementById("pg-copy-js");
    if (copyHtmlBtn) copyHtmlBtn.addEventListener("click", () => copyBuffer("html", "HTML"));
    if (copyCssBtn) copyCssBtn.addEventListener("click", () => copyBuffer("css", "CSS"));
    if (copyJsBtn) copyJsBtn.addEventListener("click", () => copyBuffer("js", "JavaScript"));

    const downloadBtn = document.getElementById("pg-download-btn");
    if (downloadBtn) downloadBtn.addEventListener("click", downloadHtmlFile);

    const fullscreenBtn = document.getElementById("pg-fullscreen-btn");
    if (fullscreenBtn) fullscreenBtn.addEventListener("click", () => toggleFullscreen());

    const clearConsoleBtn = document.getElementById("pg-console-clear-btn");
    if (clearConsoleBtn) clearConsoleBtn.addEventListener("click", clearConsole);

    bindResetModal();
    bindMessageBridge();
    bindGlobalShortcuts();

    setActiveEditorTab("html");
    setMobileView("editor");
    setPreviewWidth("desktop");
    loadTemplate(starterTemplates[0].id, true);
  }

  return {
    init,
    starterTemplates,
    state,
    runCode,
    loadTemplate,
    clearAllEditors,
    clearConsole,
    setActiveEditorTab,
    setMobileView,
    setPreviewWidth,
    toggleFullscreen,
    buildPreviewDocument,
    buildDownloadDocument
  };
})();

window.PortfolioPlayground = PortfolioPlayground;
