/**
 * AL AMIN Portfolio — Contact Page, Validation, Copy Email & Configurable Delivery (Phase 9)
 * Supports Formspree, EmailJS (public config), custom Backend API, or mailto draft fallback.
 * Never stores or exposes private API secrets.
 */

const PortfolioContact = (() => {
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

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

  function notify(message, type = "info") {
    if (typeof window.showToast === "function") {
      window.showToast(message, type);
    }
  }

  function renderDirectChannels() {
    const config = window.portfolioConfig || {};
    const social = config.socialLinks || {};

    const emailTextEl = document.getElementById("contact-email-display");
    const emailLinkEl = document.getElementById("contact-email-mailto");
    const phoneDisplayEl = document.getElementById("contact-phone-display");
    const locationDisplayEl = document.getElementById("contact-location-display");
    const channelsMount = document.getElementById("contact-social-channels");

    const email = (config.email || "your-email@example.com").trim();
    if (emailTextEl) emailTextEl.textContent = email;
    if (emailLinkEl) emailLinkEl.setAttribute("href", `mailto:${email}`);

    if (phoneDisplayEl) {
      const phone = String(config.phone || "").trim();
      if (phone) {
        phoneDisplayEl.innerHTML = `<a href="tel:${escHtml(phone.replace(/\s+/g, ""))}" class="hover:text-indigo-400 transition-colors font-mono-tech">${escHtml(phone)}</a>`;
      } else {
        phoneDisplayEl.innerHTML = `<span class="text-[var(--muted)]">Available upon email request</span>`;
      }
    }

    if (locationDisplayEl) {
      locationDisplayEl.textContent = config.location || "Bangladesh";
    }

    if (channelsMount) {
      const channelDefs = [
        { key: "github", label: "GitHub", icon: "github", url: social.github },
        { key: "linkedin", label: "LinkedIn", icon: "linkedin", url: social.linkedin },
        { key: "fiverr", label: "Fiverr", icon: "briefcase", url: social.fiverr },
        { key: "upwork", label: "Upwork", icon: "globe", url: social.upwork }
      ];

      channelsMount.innerHTML = channelDefs
        .map((ch) => {
          const href = String(ch.url || "").trim();
          if (href) {
            return `
              <a
                href="${escHtml(href)}"
                target="_blank"
                rel="noopener noreferrer"
                class="outline-button justify-start w-full px-4 py-3 text-sm"
              >
                <i data-lucide="${escHtml(ch.icon)}" class="w-4 h-4 text-indigo-400 shrink-0"></i>
                <span>${escHtml(ch.label)}</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5 ml-auto text-[var(--muted)]"></i>
              </a>
            `;
          }

          return `
            <button
              type="button"
              data-unconfigured-channel="${escHtml(ch.label)}"
              class="outline-button justify-between w-full px-4 py-3 text-sm opacity-75"
              title="Add your ${escHtml(ch.label)} profile URL in js/config.js"
            >
              <span class="inline-flex items-center gap-2">
                <i data-lucide="${escHtml(ch.icon)}" class="w-4 h-4 text-indigo-400 shrink-0"></i>
                <span>${escHtml(ch.label)}</span>
              </span>
              <span class="text-xs font-mono-tech text-[var(--muted)]">Pending URL</span>
            </button>
          `;
        })
        .join("");

      channelsMount.querySelectorAll("[data-unconfigured-channel]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const name = btn.getAttribute("data-unconfigured-channel") || "Profile";
          notify(`Set ${name} URL in js/config.js (socialLinks) to activate link`, "info");
        });
      });
    }
  }

  function bindCopyEmail() {
    const copyBtn = document.getElementById("copy-email-btn");
    if (!copyBtn) return;

    copyBtn.addEventListener("click", async () => {
      const config = window.portfolioConfig || {};
      const email = (config.email || "your-email@example.com").trim();
      const labelEl = copyBtn.querySelector("[data-copy-label]");

      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          await navigator.clipboard.writeText(email);
        } else {
          const temp = document.createElement("textarea");
          temp.value = email;
          temp.setAttribute("readonly", "");
          temp.style.position = "fixed";
          temp.style.opacity = "0";
          document.body.appendChild(temp);
          temp.select();
          document.execCommand("copy");
          document.body.removeChild(temp);
        }

        if (labelEl) labelEl.textContent = "Email Copied";
        notify(`Copied ${email} to clipboard`, "success");
        window.setTimeout(() => {
          if (labelEl) labelEl.textContent = "Copy Email";
        }, 2000);
      } catch (_err) {
        notify(`Copy failed — email is ${email}`, "warning");
      }
    });
  }

  /**
   * Configurable Email Delivery Adapter
   * Reads endpoint settings from portfolioConfig.contactForm without storing private keys.
   */
  async function submitInquiry(payload) {
    const config = window.portfolioConfig || {};
    const formCfg = config.contactForm || {};
    const provider = String(formCfg.provider || "demo").toLowerCase();

    if (
      (provider === "supabase" || (provider === "demo" && window.PortfolioSupabase && window.PortfolioSupabase.isConfigured())) &&
      window.PortfolioSupabase &&
      window.PortfolioSupabase.isConfigured()
    ) {
      return window.PortfolioSupabase.submitContact({
        ...payload,
        sourcePage: window.location.pathname.split("/").pop() || "contact.html"
      });
    }

    if (provider === "formspree" && formCfg.formspreeEndpoint) {
      const response = await fetch(formCfg.formspreeEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Formspree returned HTTP ${response.status}`);
      }
      return { mode: "formspree", delivered: true };
    }

    if (
      provider === "emailjs" &&
      formCfg.emailjsServiceId &&
      formCfg.emailjsTemplateId &&
      formCfg.emailjsPublicKey
    ) {
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: formCfg.emailjsServiceId,
          template_id: formCfg.emailjsTemplateId,
          user_id: formCfg.emailjsPublicKey,
          template_params: {
            from_name: payload.name,
            reply_to: payload.email,
            subject: payload.subject,
            message: payload.message
          }
        })
      });
      if (!response.ok) {
        throw new Error(`EmailJS returned HTTP ${response.status}`);
      }
      return { mode: "emailjs", delivered: true };
    }

    if (provider === "api" && formCfg.backendApiUrl) {
      const response = await fetch(formCfg.backendApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}`);
      }
      return { mode: "api", delivered: true };
    }

    // Frontend-only fallback when no live provider endpoint is configured yet
    const recipient = (config.email || "your-email@example.com").trim();
    const mailtoHref = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
      `[Portfolio Inquiry] ${payload.subject}`
    )}&body=${encodeURIComponent(
      `Name: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`
    )}`;

    return { mode: "demo", delivered: false, mailtoHref };
  }

  function bindForm() {
    const form = document.getElementById("contact-inquiry-form");
    if (!form) return;

    const fields = {
      name: document.getElementById("contact-name"),
      email: document.getElementById("contact-email"),
      subject: document.getElementById("contact-subject"),
      message: document.getElementById("contact-message")
    };

    const errors = {
      name: document.getElementById("contact-name-error"),
      email: document.getElementById("contact-email-error"),
      subject: document.getElementById("contact-subject-error"),
      message: document.getElementById("contact-message-error")
    };

    const messageCountEl = document.getElementById("contact-message-count");
    const submitBtn = document.getElementById("contact-submit-btn");
    const statusBanner = document.getElementById("contact-form-status");

    function setFieldError(key, msg) {
      const input = fields[key];
      const errEl = errors[key];
      if (!input || !errEl) return;

      if (msg) {
        input.classList.add("is-invalid");
        input.setAttribute("aria-invalid", "true");
        errEl.textContent = msg;
        errEl.classList.remove("hidden");
      } else {
        input.classList.remove("is-invalid");
        input.setAttribute("aria-invalid", "false");
        errEl.textContent = "";
        errEl.classList.add("hidden");
      }
    }

    function validateField(key) {
      const input = fields[key];
      if (!input) return true;
      const val = input.value.trim();

      if (key === "name") {
        if (!val) {
          setFieldError("name", "Please enter your name.");
          return false;
        }
        if (val.length < 2) {
          setFieldError("name", "Name must be at least 2 characters.");
          return false;
        }
        setFieldError("name", "");
        return true;
      }

      if (key === "email") {
        if (!val) {
          setFieldError("email", "Please enter your email address.");
          return false;
        }
        if (!isValidEmail(val)) {
          setFieldError("email", "Please enter a valid email address (e.g. name@domain.com).");
          return false;
        }
        setFieldError("email", "");
        return true;
      }

      if (key === "subject") {
        if (!val) {
          setFieldError("subject", "Please enter a subject for your inquiry.");
          return false;
        }
        if (val.length < 3) {
          setFieldError("subject", "Subject must be at least 3 characters.");
          return false;
        }
        setFieldError("subject", "");
        return true;
      }

      if (key === "message") {
        if (!val) {
          setFieldError("message", "Please enter your project or inquiry message.");
          return false;
        }
        if (val.length < 20) {
          setFieldError("message", `Message must be at least 20 characters (${val.length}/20).`);
          return false;
        }
        if (val.length > 2000) {
          setFieldError("message", "Message cannot exceed 2000 characters.");
          return false;
        }
        setFieldError("message", "");
        return true;
      }

      return true;
    }

    function updateMessageCounter() {
      if (!fields.message || !messageCountEl) return;
      const len = fields.message.value.trim().length;
      messageCountEl.textContent = `${len} / 2000`;
    }

    Object.keys(fields).forEach((key) => {
      const input = fields[key];
      if (!input) return;

      input.addEventListener("blur", () => validateField(key));
      input.addEventListener("input", () => {
        if (key === "message") updateMessageCounter();
        if (input.getAttribute("aria-invalid") === "true") {
          validateField(key);
        }
      });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const svc = urlParams.get("service");
    const proj = urlParams.get("project");
    const intent = urlParams.get("intent");
    const explicitSubject = urlParams.get("subject");
    const humanize = (slug) =>
      String(slug)
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (ch) => ch.toUpperCase());

    if (intent === "quote" || intent === "project") {
      try {
        const rawDraft = window.sessionStorage.getItem("portfolio_quote_draft");
        if (rawDraft) {
          const parsedDraft = JSON.parse(rawDraft);
          if (parsedDraft && typeof parsedDraft === "object") {
            if (fields.subject && !fields.subject.value && parsedDraft.subject) {
              fields.subject.value = String(parsedDraft.subject);
            }
            if (fields.message && !fields.message.value && parsedDraft.message) {
              fields.message.value = String(parsedDraft.message).slice(0, 2000);
            }
          }
          window.sessionStorage.removeItem("portfolio_quote_draft");
        }
      } catch (_err) {
        // Ignore storage read issues safely
      }
    }

    if (fields.subject && !fields.subject.value) {
      if (explicitSubject) {
        fields.subject.value = explicitSubject;
      } else if (svc) {
        fields.subject.value = `Service Inquiry: ${humanize(svc)}`;
      } else if (proj) {
        fields.subject.value = `Similar Build Inquiry: ${humanize(proj)}`;
      } else if (intent === "quote") {
        fields.subject.value = "Project Quote Request";
      } else if (intent === "project") {
        fields.subject.value = "New Project Collaboration";
      }
    }

    updateMessageCounter();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const validResults = ["name", "email", "subject", "message"].map((k) => validateField(k));
      const firstInvalidKey = ["name", "email", "subject", "message"].find(
        (_k, idx) => !validResults[idx]
      );

      if (firstInvalidKey) {
        notify("Please fix the highlighted fields before submitting.", "error");
        fields[firstInvalidKey]?.focus();
        return;
      }

      const payload = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        subject: fields.subject.value.trim(),
        message: fields.message.value.trim()
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Sending...</span>`;
        refreshIcons();
      }

      try {
        const result = await submitInquiry(payload);

        if (statusBanner) {
          statusBanner.classList.remove("hidden");
          if (result.delivered) {
            statusBanner.innerHTML = `
              <div class="glass-card p-4 border-emerald-500/40 space-y-1.5 text-sm">
                <p class="font-semibold text-emerald-400">Message sent via ${escHtml(result.mode)}</p>
                <p class="text-[var(--muted)]">Thank you, ${escHtml(payload.name)}. Your inquiry has been received and I will reply soon.</p>
              </div>
            `;
            notify("Your message has been sent successfully!", "success");
            form.reset();
            updateMessageCounter();
          } else {
            statusBanner.innerHTML = `
              <div class="glass-card p-4 space-y-3 text-sm">
                <div class="space-y-1">
                  <p class="font-semibold text-cyan-400">Inquiry Validated &amp; Email Draft Ready</p>
                  <p class="text-[var(--muted)]">
                    No live Formspree, EmailJS, or API endpoint is configured in <code class="font-mono-tech text-indigo-400">js/config.js</code> yet. Launch your email app below with your message pre-filled, or copy the email address directly.
                  </p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <a href="${escHtml(result.mailtoHref)}" class="primary-button text-xs py-2 px-4 min-h-[40px]">
                    <i data-lucide="mail" class="w-4 h-4"></i>
                    <span>Open in Email App</span>
                  </a>
                </div>
              </div>
            `;
            notify("Inquiry validated! Email draft ready to send.", "success");
          }
          refreshIcons();
        }
      } catch (err) {
        if (statusBanner) {
          statusBanner.classList.remove("hidden");
          statusBanner.innerHTML = `
            <div class="glass-card p-4 border-rose-500/40 text-sm space-y-1">
              <p class="font-semibold text-rose-400">Submission Error</p>
              <p class="text-[var(--muted)]">${escHtml(err.message || "Unable to send message right now.")}</p>
            </div>
          `;
        }
        notify("Could not send message. Please try again or copy the email address.", "error");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Send Message</span><i data-lucide="send" class="w-4 h-4"></i>`;
          refreshIcons();
        }
      }
    });
  }

  function init() {
    const root = document.getElementById("contact-root");
    if (!root) return;

    renderDirectChannels();
    bindCopyEmail();
    bindForm();
    refreshIcons();
  }

  return {
    init,
    isValidEmail,
    submitInquiry
  };
})();

window.PortfolioContact = PortfolioContact;
