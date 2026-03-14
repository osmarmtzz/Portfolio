(() => {
  "use strict";

  /* ===========================
     CONFIG
  =========================== */
  const CONFIG = {
    contactEmail: "osmar.dev@email.com", // 👈 Cambia por tu correo real
    cvFallbackMessage: "No se encontró el CV. Agrega tu PDF en /assets/Osmar-CV.pdf.",
    typedStrings: [
      "productos rápidos.",
      "soluciones escalables.",
      "código limpio.",
      "apps que funcionan.",
      "fullstack desde cero."
    ]
  };

  /* ===========================
     HELPERS
  =========================== */
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

  const hasGSAP   = typeof gsap !== "undefined";
  const hasSTr    = hasGSAP && typeof ScrollTrigger !== "undefined";
  const hasLenis  = typeof Lenis !== "undefined";
  const hasTyped  = typeof Typed !== "undefined";
  const hasTilt   = typeof VanillaTilt !== "undefined";

  /* ===========================
     YEAR
  =========================== */
  const yearEl = $("#currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===========================
     LENIS SMOOTH SCROLL
  =========================== */
  let lenis = null;

  if (hasLenis) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      smooth: true,
      smoothTouch: false
    });

    if (hasSTr) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback RAF loop if GSAP ticker not available
      (function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      })(0);
    }
  }

  /* ===========================
     SMOOTH ANCHOR SCROLL
     Uses Lenis when available, falls back to native smooth scroll
  =========================== */
  $$("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: 0 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ===========================
     MOBILE MENU
  =========================== */
  const menuBtn  = $("#menuBtn");
  const navLinks = $("#navLinks");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    $$("a", navLinks).forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      if (!(e.target instanceof Element)) return;
      if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ===========================
     TYPED.JS
  =========================== */
  if (hasTyped && $("#typed-role")) {
    new Typed("#typed-role", {
      strings:   CONFIG.typedStrings,
      typeSpeed:  55,
      backSpeed:  28,
      backDelay: 1400,
      loop:       true,
      showCursor: true,
      cursorChar: "_"
    });
  } else {
    const el = $("#typed-role");
    if (el) el.textContent = "fullstack desde cero.";
  }

  /* ===========================
     VANILLA TILT
  =========================== */
  if (hasTilt) {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
      max: 6, speed: 400, glare: false, gyroscope: false, scale: 1.01
    });
  }

  /* ===========================
     GSAP — Register Plugin
  =========================== */
  if (hasSTr) gsap.registerPlugin(ScrollTrigger);

  /* ===========================
     GSAP DEFAULTS
  =========================== */
  if (hasGSAP) {
    gsap.defaults({ ease: "power3.out" });
  }

  /* ===========================
     HERO ENTRANCE (page-load timeline)
     No ScrollTrigger — fires immediately
  =========================== */
  if (hasGSAP) {
    const heroTl = gsap.timeline({ delay: 0.1 });

    // Badge fades in
    heroTl.from(".hero-badge", { opacity: 0, y: 20, duration: 0.55 });

    // Title lines wipe in from below (overflow:hidden on .tl clips the reveal)
    heroTl.from(".hero-title .tl > span", {
      y: "105%",
      duration: 0.8,
      stagger: 0.14,
      ease: "power4.out"
    }, "-=0.2");

    // Typed row
    heroTl.from(".hero-typed-row", { opacity: 0, y: 14, duration: 0.5 }, "-=0.35");

    // Description
    heroTl.from(".hero-desc", { opacity: 0, y: 14, duration: 0.5 }, "-=0.35");

    // Buttons stagger
    heroTl.from(".hero-actions .btn", {
      opacity: 0, y: 14, duration: 0.45, stagger: 0.09
    }, "-=0.3");

    // Stats stagger
    heroTl.from(".stat-item", {
      opacity: 0, y: 14, duration: 0.45, stagger: 0.1
    }, "-=0.4");

    // Hero visual slides in from right
    heroTl.from(".hero-visual", {
      opacity: 0, x: 44, duration: 0.85, ease: "power3.out"
    }, "-=0.85");
  }

  /* ===========================
     HERO PARALLAX (scrub)
  =========================== */
  if (hasSTr) {
    gsap.to(".hero-content", {
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.2
      },
      y: -55,
      ease: "none"
    });
  }

  /* ===========================
     SCROLL PROGRESS BAR (Lenis-aware)
  =========================== */
  const scrollProgressEl = $("#scrollProgress");

  function updateScrollProgress(scrollY) {
    if (!scrollProgressEl) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgressEl.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  }

  if (lenis) {
    lenis.on("scroll", ({ scroll }) => updateScrollProgress(scroll));
  } else {
    window.addEventListener("scroll", () => updateScrollProgress(window.scrollY), { passive: true });
  }
  updateScrollProgress(window.scrollY);

  /* ===========================
     HEADER SCROLL STATE
  =========================== */
  const headerEl = $("#siteHeader");

  function updateHeader(scrollY) {
    headerEl?.classList.toggle("scrolled", scrollY > 50);
  }

  if (lenis) {
    lenis.on("scroll", ({ scroll }) => updateHeader(scroll));
  } else {
    window.addEventListener("scroll", () => updateHeader(window.scrollY), { passive: true });
  }
  updateHeader(window.scrollY);

  /* ===========================
     SCROLL TO TOP
  =========================== */
  const scrollTopBtn = $("#scrollTopBtn");

  function updateScrollTop(scrollY) {
    scrollTopBtn?.classList.toggle("show", scrollY > 500);
  }

  if (lenis) {
    lenis.on("scroll", ({ scroll }) => updateScrollTop(scroll));
  } else {
    window.addEventListener("scroll", () => updateScrollTop(window.scrollY), { passive: true });
  }
  updateScrollTop(window.scrollY);

  scrollTopBtn?.addEventListener("click", () => {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ===========================
     ACTIVE NAV (section highlighting)
  =========================== */
  const sections   = $$("main section[id]");
  const navAnchors = navLinks ? $$("a[href^='#']", navLinks) : [];

  function updateActiveNav(scrollY) {
    if (!sections.length || !navAnchors.length) return;
    let current = "";
    for (const sec of sections) {
      if (scrollY >= sec.offsetTop - 130) current = sec.id;
    }
    navAnchors.forEach((a) => {
      const href = a.getAttribute("href")?.replace("#", "");
      a.classList.toggle("active", href === current);
    });
  }

  if (lenis) {
    lenis.on("scroll", ({ scroll }) => updateActiveNav(scroll));
  } else {
    window.addEventListener("scroll", () => updateActiveNav(window.scrollY), { passive: true });
  }
  updateActiveNav(window.scrollY);

  /* ===========================
     COUNTERS — ScrollTrigger or fallback
  =========================== */
  const counterEls = $$("[data-counter]");

  function runCounters() {
    counterEls.forEach((el) => {
      const target = Number(el.dataset.counter || 0);
      if (!hasGSAP) { el.textContent = String(target); return; }

      gsap.to({ val: 0 }, {
        val: target,
        duration: 1.4,
        ease: "power2.out",
        onUpdate() { el.textContent = Math.round(this.targets()[0].val); }
      });
    });
  }

  // Suffix "+" after counter reaches target
  counterEls.forEach((el) => {
    const target = Number(el.dataset.counter || 0);
    if (target >= 10) {
      const obs = new MutationObserver(() => {
        if (Number(el.textContent) >= target && !el.dataset.suffixed) {
          obs.disconnect();
          el.dataset.suffixed = "1";
          el.innerHTML = `${target}<span class="counter-plus">+</span>`;
        }
      });
      obs.observe(el, { childList: true, subtree: true, characterData: true });
    }
  });

  if (hasSTr && $(".hero-stats")) {
    ScrollTrigger.create({
      trigger: ".hero-stats",
      start: "top 90%",
      once: true,
      onEnter: runCounters
    });
  } else {
    // Fallback: run after 600ms (hero already visible on load)
    window.setTimeout(runCounters, 600);
  }

  /* ===========================
     SCROLL-TRIGGERED REVEALS
     Each section animates in as it enters the viewport
  =========================== */
  if (hasSTr) {

    const REVEAL = { duration: 0.75, ease: "power3.out" };
    const ST_OPTS = { once: true };

    /* --- Section heads --- */
    $$(".section-head").forEach((head) => {
      gsap.from(head.children, {
        scrollTrigger: { trigger: head, start: "top 85%", ...ST_OPTS },
        opacity: 0, y: 28, duration: REVEAL.duration,
        stagger: 0.12, ease: REVEAL.ease
      });
    });

    /* --- Contact left children (has its own heading, not .section-head) --- */
    gsap.from(".contact-left > *", {
      scrollTrigger: { trigger: ".contact-left", start: "top 82%", ...ST_OPTS },
      opacity: 0, y: 22, duration: REVEAL.duration, stagger: 0.1
    });

    /* --- About --- */
    gsap.from(".about-main", {
      scrollTrigger: { trigger: ".about-main", start: "top 82%", ...ST_OPTS },
      opacity: 0, x: -30, duration: REVEAL.duration
    });

    gsap.from(".about-card", {
      scrollTrigger: { trigger: ".about-cards", start: "top 84%", ...ST_OPTS },
      opacity: 0, y: 22, scale: 0.96,
      duration: REVEAL.duration, stagger: 0.09
    });

    /* --- Skills --- */
    gsap.from(".skill-group", {
      scrollTrigger: { trigger: ".skills-grid", start: "top 82%", ...ST_OPTS },
      opacity: 0, y: 28, duration: REVEAL.duration, stagger: 0.1
    });

    /* --- Skill bars (animate width) --- */
    ScrollTrigger.create({
      trigger: ".skills-grid",
      start: "top 82%",
      once: true,
      onEnter() {
        $$(".skill-fill").forEach((bar) => {
          gsap.to(bar, {
            width: `${bar.dataset.width || 0}%`,
            duration: 1.1,
            ease: "power2.inOut",
            delay: 0.2,
            onComplete() { bar.classList.add("glow"); }
          });
        });
      }
    });

    /* --- Bento cards --- */
    gsap.from(".bento-card", {
      scrollTrigger: { trigger: ".bento-grid", start: "top 86%", ...ST_OPTS },
      opacity: 0, y: 24, scale: 0.97,
      duration: REVEAL.duration, stagger: 0.08
    });

    /* --- Experience items --- */
    gsap.from(".exp-item", {
      scrollTrigger: { trigger: ".exp-list", start: "top 84%", ...ST_OPTS },
      opacity: 0, x: -26, duration: REVEAL.duration, stagger: 0.14
    });

    /* --- Contact right (form card) --- */
    gsap.from(".contact-right", {
      scrollTrigger: { trigger: ".contact-wrapper", start: "top 82%", ...ST_OPTS },
      opacity: 0, x: 30, duration: REVEAL.duration
    });

    /* --- Footer --- */
    gsap.from(".footer-row > *", {
      scrollTrigger: { trigger: "footer", start: "top 92%", ...ST_OPTS },
      opacity: 0, y: 16, duration: 0.6, stagger: 0.1
    });

  }

  /* ===========================
     HOVER MICROANIMATIONS (GSAP)
  =========================== */
  if (hasGSAP) {
    $$(".btn, .bento-links a, .socials a, .c-link, .about-card, .e-badge").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        gsap.killTweensOf(el);
        gsap.to(el, { scale: 1.03, duration: 0.18, ease: "power2.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.killTweensOf(el);
        gsap.to(el, { scale: 1, duration: 0.22, ease: "power2.out" });
      });
    });
  }

  /* ===========================
     BUTTON RIPPLE
  =========================== */
  $$(".btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });

  /* ===========================
     FIELD ERROR ANIMATION
  =========================== */
  $$(".field-error").forEach((el) => {
    new MutationObserver(() => {
      el.classList.toggle("visible", Boolean(el.textContent.trim()));
    }).observe(el, { childList: true, characterData: true, subtree: true });
  });

  /* ===========================
     CONTACT FORM
  =========================== */
  const contactForm    = $("#contactForm");
  const formMsg        = $("#formMsg");
  const manualMailLink = $("#manualMailLink");

  const fields = {
    name:    $("#name"),
    email:   $("#email"),
    message: $("#message")
  };

  const errors = {
    name:    $("#nameError"),
    email:   $("#emailError"),
    message: $("#messageError")
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  function setFieldError(key, msg) {
    const input   = fields[key];
    const errorEl = errors[key];
    if (!input || !errorEl) return;
    errorEl.textContent = msg || "";
    input.classList.toggle("input-invalid", Boolean(msg));
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function clearAllErrors() { Object.keys(fields).forEach((k) => setFieldError(k, "")); }

  function validateForm() {
    clearAllErrors();
    const name    = fields.name?.value.trim()    || "";
    const email   = fields.email?.value.trim()   || "";
    const message = fields.message?.value.trim() || "";
    let isValid   = true;

    if (name.length < 2)        { setFieldError("name",    "Nombre inválido (mín. 2 caracteres)."); isValid = false; }
    if (!emailRegex.test(email)) { setFieldError("email",   "Correo inválido.");                     isValid = false; }
    if (message.length < 10)    { setFieldError("message", "Mensaje demasiado corto (mín. 10 car.)."); isValid = false; }

    return { isValid, data: { name, email, message } };
  }

  function buildMailto({ name, email, message }) {
    const subject = `Mensaje desde portafolio - ${name}`;
    const body    = `Hola Osmar,\n\nTe contacto desde tu portafolio.\n\nNombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}\n\n---\nEnviado desde tu formulario web`;
    return `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function setFormMsg(text, type = "info") {
    if (!formMsg) return;
    formMsg.textContent = text;
    const colors = { info: "var(--muted)", success: "var(--accent)", error: "var(--danger)", warning: "var(--yellow)" };
    formMsg.style.color = colors[type] || "var(--muted)";
  }

  Object.entries(fields).forEach(([, input]) => {
    if (!input) return;
    input.addEventListener("input", () => {
      const { isValid } = validateForm();
      if (isValid) setFormMsg("", "info");
    });
  });

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const { isValid, data } = validateForm();
      if (!isValid) { setFormMsg("Revisa los campos marcados.", "error"); return; }

      const url = buildMailto(data);
      if (manualMailLink) { manualMailLink.href = url; manualMailLink.classList.remove("hidden"); }

      setFormMsg("Abriendo tu cliente de correo...", "info");
      window.location.href = url;

      window.setTimeout(() => {
        setFormMsg("Si no se abrió, usa el botón de abajo.", "warning");
      }, 1200);

      contactForm.reset();
      clearAllErrors();

      if (hasGSAP) {
        gsap.from(".contact-right", { scale: 1.015, duration: 0.4, ease: "power2.out" });
      }
    });
  }

  /* ===========================
     CV BUTTON
  =========================== */
  const cvBtn = $("#cvBtn");
  if (cvBtn && cvBtn.getAttribute("href") === "#") {
    cvBtn.addEventListener("click", (e) => {
      e.preventDefault();
      alert(CONFIG.cvFallbackMessage);
    });
  }

})();
