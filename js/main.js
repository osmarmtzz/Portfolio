(() => {
  "use strict";

  const CONFIG = {
    contactEmail: "osmarenriquemtz@outlook.com",
  };

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE_POINTER = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const HAS_GSAP = typeof gsap !== "undefined";
  const FX = window.ScrollFX || null;   // js/scroll.js

  /* ============================================================
     TRANSLATIONS
     Spanish lives in the HTML (captured at boot); English lives here.
  ============================================================ */
  const T = {
    es: {
      "meta.title": "Osmar Martínez — Ingeniero de Software Full Stack",
      "form.err.name":  "Escribe tu nombre.",
      "form.err.email": "Correo inválido.",
      "form.err.msg":   "Mínimo 10 caracteres.",
      "form.sent":      "¡Listo! Abriendo tu cliente de correo…",
    },

    en: {
      "meta.title": "Osmar Martínez — Full Stack Software Engineer",
      "a11y.skip": "Skip to content",

      /* nav */
      "nav.about":   "Profile",
      "nav.career":  "Experience",
      "nav.work":    "Work",
      "nav.skills":  "Skills",
      "nav.edu":     "Education",
      "nav.contact": "Contact",
      "nav.cta":     "Let's talk",

      /* hero */
      "hero.eyebrow": "Senior Software Engineer · Tech Lead at Landaii",
      "hero.lead":    "Full stack software engineer. I build",
      "hero.desc":    'I own the entire product: architecture, backend, interface, security, CI/CD and deployment. Specialized in <strong>Next.js</strong>, <strong>TypeScript</strong>, <strong>Supabase</strong> and <strong>AI agents</strong>.',
      "hero.btn.exp": "View experience",
      "hero.btn.cv":  "Download CV",
      "hero.scroll":  "Scroll",
      "stat.apps":      "Applications in production",
      "stat.repos":     "Repositories audited every week",
      "stat.certs":     "AWS Academy certifications",

      /* about */
      "about.label": "Profile",
      "about.title": 'One engineer,<br/><em>the whole product.</em>',
      "about.p1":    'Full stack software engineer focused on <strong>SaaS products</strong>, <strong>AI agents</strong> and <strong>cloud infrastructure</strong>. I take ownership of a complete product: architecture, backend, interface, security, CI/CD and deployment.',
      "about.p2":    "I work with an AI-assisted development model, directing coding agents and reviewing every change before production, which lets me ship fast without sacrificing quality. I pick up new technologies on the go, work autonomously and explain technical decisions in business terms.",
      "fact.location.k": "Location",
      "fact.location.v": "Lagos de Moreno, Jalisco, Mexico",
      "fact.role.k":     "Current role",
      "fact.role.v":     "Tech Lead at Landaii · Remote",
      "fact.lang.k":     "Languages",
      "fact.lang.v":     "Spanish (native) · English (B2)",
      "fact.edu.k":      "Education",
      "fact.edu.v":      "B.Eng. Computer Systems Engineering, UAA",
      "pillar1.t": "Complete product",
      "pillar1.d": "I take ownership of the complete product: architecture, backend, interface, security, CI/CD and deployment.",
      "pillar2.t": "AI-assisted development",
      "pillar2.d": "I direct coding agents and review every change before production: I ship fast without losing quality.",
      "pillar3.t": "Autonomy",
      "pillar3.d": "I learn new technologies on the go and work autonomously.",
      "pillar4.t": "Business language",
      "pillar4.d": "I explain technical decisions in business terms.",

      /* experience */
      "exp.label":   "Experience",
      "exp.title":   'Where I\'ve <em>built.</em>',
      "exp.current": "Current role",
      "exp.l.role":  "Senior Software Engineer · Tech Lead",
      "exp.l.org":   "· Custom software agency for SMBs (Mexico and the U.S.) · Remote",
      "exp.l.date":  "Apr 2026 — Present",
      "exp.l.intro": 'Sole full-time engineer: responsible for the architecture, code, infrastructure and security of <strong>more than 30 web applications</strong> for clients and in-house products.',
      "exp.l.b1":    'Built a <strong>multi-tenant SaaS platform for AI assistants</strong>: companies create their own assistant, load their information and install it on their website or app in minutes. It answers using semantic search over that information, automatically switches AI provider if one fails, and controls cost per assistant.',
      "exp.l.b2":    'Connected those assistants to several clients\' applications so they answer with <strong>real, up-to-date data</strong> about the user who is asking (for example, their booking or their requests) through secure connections.',
      "exp.l.b3":    'Developed a <strong>task and project management module</strong> that embeds inside other applications without the user signing in again, with assignment, approval and notifications.',
      "exp.l.b4":    'Maintained and improved <strong>more than 30 applications in production</strong>: bug fixes, performance improvements, dependency upgrades, new features and client requests handled within defined response times.',
      "exp.l.b5":    'Automated security and delivery: a <strong>weekly audit of 14 repositories</strong> that detects and fixes vulnerabilities on its own, plus controls so no change reaches production without tests and review.',
      "exp.l.b6":    'Found and fixed <strong>critical vulnerabilities</strong> that allowed user account takeover in a financial application, and centralized control of the company\'s AI credentials with automatic renewal alerts.',
      "exp.l.b7":    'Defined the <strong>team workflow</strong> (branching, code review, deployments and database changes) and documented it so AI agents apply it automatically.',
      "exp.r.role":  "Junior Full Stack Developer",
      "exp.r.org":   "· Web and mobile medical management system in production",
      "exp.r.date":  "Dec 2024 — Jan 2026",
      "exp.r.intro": "Started as an intern, then became a development trainee.",
      "exp.r.b1":    'Developed and maintained a <strong>web and mobile medical management system</strong> in production, used daily by doctors and patients.',
      "exp.r.b2":    'Built backend modules in <strong>PHP (MVC)</strong> and <strong>REST APIs</strong> to integrate internal and third-party services.',
      "exp.r.b3":    'Designed and optimized the <strong>MySQL</strong> database, improving data integrity and query performance.',
      "exp.r.b4":    'Implemented the <strong>digital clinical record</strong>, mobile features with <strong>React Native</strong> and doctor–patient video calls with <strong>WebRTC</strong>.',
      "exp.r.b5":    'Took part in testing, production deployments and basic <strong>Linux</strong> server administration, with version control in Git/GitHub.',

      /* projects */
      "proj.label": "Selected work",
      "proj.title": 'What I\'ve <em>shipped.</em>',
      "proj.sub":   "Products and systems I built that are running in production.",
      "proj.hint":  "Keep scrolling",
      "proj1.t": "AI assistant SaaS platform",
      "proj1.d": "Multi-tenant platform where each company creates its own assistant, loads its information and installs it on its website or app in minutes. It answers with semantic search, automatically switches AI provider if one fails, and controls cost per assistant.",
      "flow.1":  "Your information",
      "flow.2":  "Semantic search",
      "flow.3":  "AI with fallback",
      "flow.4":  "Website / app",
      "proj2.t": "Assistants with live data",
      "proj2.d": "Integration of the assistants with several clients' applications: they answer with real, up-to-date data about the user who is asking — their booking, their requests — through secure connections.",
      "proj3.t": "Task and project module",
      "proj3.d": "Task management that embeds inside other applications without the user signing in again, with assignment, approval and notifications.",
      "proj4.t": "Automated security and delivery",
      "proj4.d": "Weekly audit of 14 repositories that detects and fixes vulnerabilities on its own, plus controls so no change reaches production without tests and review.",
      "proj5.t": "Hardening a financial app",
      "proj5.d": "Detection and remediation of critical vulnerabilities that allowed user account takeover, and centralized control of AI credentials with automatic renewal alerts.",
      "proj6.t": "Medical management system",
      "proj6.d": "Web and mobile system in production, used daily by doctors and patients: digital clinical record, mobile app and real-time doctor–patient video calls.",
      "chip.fallback":  "AI provider fallback",
      "chip.cost":      "Cost control per assistant",
      "chip.tools":     "Tool-using agents",
      "chip.secure":    "Secure connections",
      "chip.sso":       "No second sign-in",
      "chip.search":    "Semantic search",
      "chip.live":      "Real, up-to-date data",
      "chip.assign":    "Assignment",
      "chip.approve":   "Approval",
      "chip.weekly":    "Weekly audit",
      "chip.repos":     "14 repositories",
      "chip.tests":     "Tests and review",
      "chip.vulns":     "Critical vulnerabilities",
      "chip.renew":     "Renewal alerts",
      "chip.notif":     "Notifications",
      "chip.workflows": "Reusable workflows",
      "chip.audit":     "Code auditing",
      "chip.creds":     "AI credentials",
      "chip.aws":       "AWS (fundamentals)",
      "chip.hmac":      "HMAC & signed tokens",

      /* skills */
      "skills.label": "Skills",
      "skills.title": 'Stack and <em>tooling.</em>',
      "sk.db":    "Databases",
      "sk.ai":    "Artificial intelligence",
      "sk.infra": "Infrastructure & services",
      "sk.cicd":  "CI/CD & security",
      "sk.integ": "Integrations",
      "sk.tools": "Tools",

      /* education */
      "edu.label": "Education",
      "edu.title": 'Education and <em>certifications.</em>',
      "edu.uaa.t": "B.Eng. in Computer Systems Engineering",
      "edu.uaa.d": "Universidad Autónoma de Aguascalientes",
      "edu.aws.t": "AWS Academy Graduate",
      "edu.lang.k":      "Languages",
      "edu.lang.es":     "Spanish",
      "edu.lang.native": "Native",
      "edu.lang.en":     "English",

      /* contact */
      "contact.label":    "Contact",
      "contact.title":    'Shall we build<br/><em>something together?</em>',
      "contact.sub":      "Have a project, an open role or an idea? Write to me.",
      "contact.location": "Lagos de Moreno, Jalisco, Mexico",
      "form.name":     "Name",
      "form.name.ph":  "Your name",
      "form.email":    "Email",
      "form.email.ph": "you@email.com",
      "form.msg":      "Message",
      "form.msg.ph":   "Tell me about your project...",
      "form.submit":   "Send message",
      "form.manual":   "Open email manually",
      "form.err.name":  "Please enter your name.",
      "form.err.email": "Invalid email.",
      "form.err.msg":   "Minimum 10 characters.",
      "form.sent":      "Done! Opening your email client…",

      /* footer */
      "footer.copy": "Built with Three.js and GSAP · Deployed on Vercel",
    },
  };

  const ROTATOR_WORDS = {
    es: ["productos SaaS", "agentes de IA", "infraestructura en la nube", "apps web y móviles"],
    en: ["SaaS products", "AI agents", "cloud infrastructure", "web & mobile apps"],
  };

  /* ============================================================
     LANGUAGE SYSTEM
  ============================================================ */
  let syncDots = () => {};   // set by initNav once the side dots exist
  let currentLang = "es";
  try { currentLang = localStorage.getItem("lang") === "en" ? "en" : "es"; } catch (_) { /* storage blocked */ }

  function captureSpanish() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      if (T.es[el.dataset.i18n] === undefined) T.es[el.dataset.i18n] = el.innerHTML.trim();
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      T.es[el.dataset.i18nPh] = el.placeholder;
    });
  }

  function applyLang(lang) {
    currentLang = lang;
    try { localStorage.setItem("lang", lang); } catch (_) { /* storage blocked */ }
    document.documentElement.lang = lang;
    document.title = T[lang]["meta.title"];

    // Scroll animations split text into spans, so they are rebuilt around the swap
    if (FX) FX.teardown();

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const v = T[lang][el.dataset.i18n];
      if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      const v = T[lang][el.dataset.i18nPh];
      if (v !== undefined) el.placeholder = v;
    });
    document.querySelectorAll(".lang-opt").forEach(opt => {
      opt.classList.toggle("active", opt.dataset.lang === lang);
    });

    syncDots();
    restartRotator();
    if (FX) FX.build();
  }

  function initLangToggle() {
    const btn = document.getElementById("langToggle");
    if (!btn) return;
    btn.addEventListener("click", () => applyLang(currentLang === "es" ? "en" : "es"));
  }

  /* ============================================================
     HERO ROTATOR
  ============================================================ */
  let rotatorTimer = null;
  let rotatorIndex = 0;

  function restartRotator() {
    const el = document.getElementById("rotatorWord");
    if (!el) return;
    clearInterval(rotatorTimer);
    rotatorIndex = 0;
    el.textContent = ROTATOR_WORDS[currentLang][0];
    if (REDUCED) return;

    rotatorTimer = setInterval(() => {
      const words = ROTATOR_WORDS[currentLang];
      rotatorIndex = (rotatorIndex + 1) % words.length;
      if (!HAS_GSAP) { el.textContent = words[rotatorIndex]; return; }
      gsap.to(el, {
        yPercent: -110, duration: 0.45, ease: "power3.in",
        onComplete: () => {
          el.textContent = words[rotatorIndex];
          gsap.fromTo(el, { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "power3.out" });
        },
      });
    }, 2600);
  }

  /* ============================================================
     SCROLL-DRIVEN CHROME (progress bar, header, back-to-top)
  ============================================================ */
  function scrollToTarget(target) {
    if (FX) FX.scrollTo(target);
    else if (target === 0) window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
    else target.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
  }

  function initScrollChrome() {
    const bar    = document.getElementById("progress");
    const header = document.getElementById("siteHeader");
    const topBtn = document.getElementById("scrollTopBtn");
    const links  = document.getElementById("navLinks");
    let ticking = false;
    let lastY = window.scrollY;

    function update() {
      ticking = false;
      const y   = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar)    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      if (header && Math.abs(y - lastY) > 6) {
        const menuOpen = links && links.classList.contains("open");
        header.classList.toggle("nav-hidden", y > lastY && y > 160 && !menuOpen);
        lastY = y;
      }
      if (topBtn) topBtn.classList.toggle("visible", y > 600);
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    if (topBtn) topBtn.addEventListener("click", () => scrollToTarget(0));
  }

  /* ============================================================
     NAV
  ============================================================ */
  function initNav() {
    const btn   = document.getElementById("menuBtn");
    const links = document.getElementById("navLinks");

    // Side dots: one marker per section, labelled from the nav links
    const menuLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
    const dots = document.createElement("nav");
    dots.className = "side-dots";
    const dotLinks = menuLinks.map(link => {
      const a = document.createElement("a");
      a.href = link.getAttribute("href");
      a.appendChild(document.createElement("span")).className = "side-dot-label";
      dots.appendChild(a);
      return a;
    });
    document.body.appendChild(dots);
    syncDots = () => dotLinks.forEach((a, i) => {
      a.firstChild.textContent = menuLinks[i].textContent;
      a.setAttribute("aria-label", menuLinks[i].textContent);
    });
    syncDots();

    function setOpen(open) {
      if (!btn || !links) return;
      links.classList.toggle("open", open);
      btn.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (FX) FX.lock(open);
    }
    if (btn && links) {
      btn.addEventListener("click", () => setOpen(!links.classList.contains("open")));
      document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
    }

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener("click", e => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        setOpen(false);
        scrollToTarget(id === "#inicio" ? 0 : target);
      });
    });

    // Active link. Stacked panels stay on screen after they are covered, so an
    // IntersectionObserver cannot tell which section is current; compare the
    // scroll position against each section's natural top instead.
    const navLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
    const sections = navLinks.map(l => document.querySelector(l.getAttribute("href"))).filter(Boolean);
    let tops = [];
    const measure = () => {
      tops = sections.map(s => (FX ? FX.naturalTop(s) : s.getBoundingClientRect().top + window.scrollY));
    };
    const mark = () => {
      const line = window.scrollY + window.innerHeight * 0.5;
      let current = null;
      sections.forEach((s, i) => { if (tops[i] <= line) current = s.id; });
      navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
      dotLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
    };
    measure(); mark();
    window.addEventListener("scroll", mark, { passive: true });
    window.addEventListener("resize", () => { measure(); mark(); });
    window.addEventListener("load", () => { measure(); mark(); });
  }

  /* ============================================================
     POINTER EFFECTS (cursor glow, card spotlight, 3D tilt, magnetic)
  ============================================================ */
  function initPointerEffects() {
    if (!FINE_POINTER) return;

    // Spotlight position for every card
    document.querySelectorAll(".card").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });

    // Buttons: the hover fill grows from where the pointer is
    document.querySelectorAll(".btn").forEach(btn => {
      const place = e => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty("--bx", `${e.clientX - r.left}px`);
        btn.style.setProperty("--by", `${e.clientY - r.top}px`);
      };
      btn.addEventListener("pointerenter", place);
      btn.addEventListener("pointermove", place);
    });

    if (REDUCED) return;

    // Ambient glow that trails the cursor
    const glow = document.getElementById("cursorGlow");
    if (glow) {
      let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
      window.addEventListener("pointermove", e => {
        tx = e.clientX; ty = e.clientY;
        glow.classList.add("on");
      }, { passive: true });
      (function follow() {
        gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
        glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
        requestAnimationFrame(follow);
      })();
    }

    // Custom cursor: replaces the system pointer with a dot that tracks exactly
    // and a ring that trails behind and grows over anything clickable
    const ring = document.createElement("div");
    const dot  = document.createElement("div");
    ring.className = "cursor-ring";
    dot.className  = "cursor-dot";
    ring.setAttribute("aria-hidden", "true");
    dot.setAttribute("aria-hidden", "true");
    document.body.append(ring, dot);
    document.documentElement.classList.add("has-cursor");
    let rx = innerWidth / 2, ry = innerHeight / 2, mx = rx, my = ry;
    window.addEventListener("pointermove", e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.classList.add("on");
      dot.classList.add("on");
      ring.classList.toggle("is-hover", !!e.target.closest("a, button, input, textarea, [data-tilt]"));
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => {
      ring.classList.remove("on");
      dot.classList.remove("on");
    });
    (function trail() {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(trail);
    })();

    // 3D tilt. Uses the standalone CSS `rotate` property (axis + angle) so it
    // composes with the transforms GSAP writes for the scroll animations.
    const MAX_TILT = 9;
    document.querySelectorAll("[data-tilt]").forEach(el => {
      el.addEventListener("pointerenter", () => el.classList.add("is-tilting"));
      el.addEventListener("pointermove", e => {
        const r  = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width  - 0.5;
        const py = (e.clientY - r.top)  / r.height - 0.5;
        el.style.setProperty("--tilt-x", (-py).toFixed(3));
        el.style.setProperty("--tilt-y", px.toFixed(3));
        el.style.setProperty("--tilt-angle", `${(Math.min(1, Math.hypot(px, py) * 1.6) * MAX_TILT).toFixed(2)}deg`);
      });
      el.addEventListener("pointerleave", () => {
        el.classList.remove("is-tilting");
        el.style.setProperty("--tilt-angle", "0deg");
      });
    });

    // Magnetic buttons
    if (!HAS_GSAP) return;
    document.querySelectorAll("[data-magnetic]").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width  / 2) * 0.25,
          y: (e.clientY - r.top  - r.height / 2) * 0.25,
          duration: 0.4, ease: "power2.out",
        });
      });
      el.addEventListener("pointerleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" });
      });
    });
  }

  /* ============================================================
     CONTACT FORM (opens the visitor's mail client)
  ============================================================ */
  function initContactForm() {
    const form    = document.getElementById("contactForm");
    const formMsg = document.getElementById("formMsg");
    const mailBtn = document.getElementById("manualMailLink");
    if (!form) return;

    function showErr(id, msgKey) {
      document.getElementById(id)?.classList.add("err");
      const el = document.getElementById(id + "Error");
      if (el) el.textContent = T[currentLang][msgKey] || msgKey;
    }
    function clearErr(id) {
      document.getElementById(id)?.classList.remove("err");
      const el = document.getElementById(id + "Error");
      if (el) el.textContent = "";
    }

    ["cname", "cemail", "cmessage"].forEach(id => {
      document.getElementById(id)?.addEventListener("input", () => clearErr(id));
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      let ok = true;
      const name    = document.getElementById("cname")?.value.trim()    || "";
      const email   = document.getElementById("cemail")?.value.trim()   || "";
      const message = document.getElementById("cmessage")?.value.trim() || "";

      if (!name)                                                 { showErr("cname",    "form.err.name");  ok = false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))   { showErr("cemail",   "form.err.email"); ok = false; }
      if (message.length < 10)                                   { showErr("cmessage", "form.err.msg");   ok = false; }
      if (!ok) return;

      const subject = encodeURIComponent("Portfolio — " + name);
      const body    = encodeURIComponent(`${T[currentLang]["form.name"]}: ${name}\n${T[currentLang]["form.email"]}: ${email}\n\n${message}`);
      const mailto  = `mailto:${CONFIG.contactEmail}?subject=${subject}&body=${body}`;

      formMsg.className = "fmsg ok";
      formMsg.textContent = T[currentLang]["form.sent"];
      if (mailBtn) { mailBtn.href = mailto; mailBtn.classList.remove("hidden"); }
      window.location.href = mailto;
      form.reset();
    });
  }

  /* ============================================================
     BOOT
  ============================================================ */
  function boot() {
    const year = document.getElementById("currentYear");
    if (year) year.textContent = new Date().getFullYear();

    captureSpanish();
    applyLang(currentLang);
    if (FX) FX.init();          // smooth scroll + every scroll-driven animation (js/scroll.js)
    initScrollChrome();
    initNav();
    initLangToggle();
    initPointerEffects();
    initContactForm();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
