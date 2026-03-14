(() => {
  "use strict";

  const CONFIG = {
    contactEmail: "osmarenriquemtz@outlook.com",
    cvPath: "assets/Osmar-CV.pdf",
  };

  /* ============================================================
     TRANSLATIONS
  ============================================================ */
  const T = {
    es: {
      /* nav */
      "nav.about":    "Sobre mí",
      "nav.services": "Servicios",
      "nav.skills":   "Skills",
      "nav.work":     "Proyectos",
      "nav.career":   "Carrera",
      "nav.contact":  "Contacto",
      "nav.hireme":   "hire_me()",

      /* hero */
      "hero.tag":     "disponible para trabajar",
      "hero.desc":    'Fullstack developer. Construyo apps con <em>Next.js</em>, <em>Laravel</em> y <em>React Native</em>. Deploy en <em>Vercel</em> y <em>DigitalOcean</em>.',
      "hero.btn.projects": "Ver proyectos",
      "hero.btn.contact":  "Contacto",
      "hero.scroll":  "scroll ↓",
      "stat.devexp":  "Año dev exp.",
      "stat.projects":"Proyectos",
      "stat.tech":    "Tecnologías",

      /* about */
      "about.title": 'Desarrollador<br/><span class="grad">Fullstack</span>',
      "about.bio":   'Ingeniero en Sistemas Computacionales por la UAA con experiencia real en producción. Desarrollo apps web y móviles con <strong>Next.js</strong>, <strong>React</strong> y <strong>Laravel</strong>. Deploy en <strong>Vercel</strong> serverless o <strong>VPS DigitalOcean</strong>. React Native para iOS y Android. Certificado AWS Academy.',
      "acard.backend.title":  "Backend",
      "acard.backend.desc":   "Laravel MVC, Node.js, APIs REST, JWT, MySQL.",
      "acard.frontend.title": "Frontend",
      "acard.frontend.desc":  "Next.js, React, TypeScript, Angular.",
      "acard.deploy.title":   "Deploy",
      "acard.deploy.desc":    "Vercel serverless, DigitalOcean VPS, CI/CD.",
      "acard.mobile.title":   "Móvil",
      "acard.mobile.desc":    "React Native, Expo, WebRTC, FHIR HL7.",

      /* services */
      "svc.title":  '¿Qué <span class="grad">construyo?</span>',
      "svc1.title": "Aplicaciones Web",
      "svc1.desc":  "SPAs y webs con Next.js. SSR, SSG, SEO y deploy en Vercel con CI/CD automático.",
      "svc2.title": "APIs & Backend",
      "svc2.desc":  "REST APIs con Laravel o Node.js. JWT, roles, Swagger y base de datos relacional.",
      "svc3.title": "Dashboards & Admin",
      "svc3.desc":  "Paneles con gráficas, reportes, exportaciones y actualizaciones en tiempo real.",
      "svc4.title": "Apps Móviles",
      "svc4.desc":  "React Native para iOS y Android. Notificaciones, cámara, WebRTC y más.",
      "svc5.title": "DevOps & Deploy",
      "svc5.desc":  "Serverless en Vercel, VPS DigitalOcean configurado desde cero en Linux, CI/CD automático.",
      "svc6.title": "E-commerce",
      "svc6.desc":  "Tiendas con catálogo, carrito de compras, pagos Stripe/PayPal y panel admin.",

      /* skills */
      "skills.title": 'Stack & <span class="grad">Tecnologías</span>',
      "sg.backend":   "Backend",
      "sg.frontend":  "Frontend",
      "sg.data":      "Data & Infra",

      /* projects */
      "proj.title":    'Proyectos <span class="grad">Destacados</span>',
      "proj.featured": "featured",
      "proj.live":     "Live demo →",
      "proj0.title":   "Sistema de Gestión Hospitalaria",
      "proj0.desc":    "Sistema modular en producción real con historial clínico, videollamadas WebRTC, notificaciones en tiempo real y prototipo FHIR HL7 para interoperabilidad de expedientes entre hospitales.",
      "proj1.title":   "Dashboard Analítico",
      "proj1.desc":    "Panel fullstack con Next.js 14, auth JWT, gráficas en tiempo real y deploy en Vercel.",
      "proj2.title":   "E-commerce + Admin",
      "proj2.desc":    "Tienda online con Next.js, carrito de compras, pagos Stripe y panel admin completo.",
      "proj3.title":   "App de Videollamadas",
      "proj3.desc":    "Comunicación en tiempo real con WebRTC, salas privadas y Socket.io.",
      "proj4.title":   "CodeHub (PHP)",
      "proj4.desc":    "Interfaz moderna para localhost — diseño limpio para desarrollo local y proyectos PHP.",
      "proj5.title":   "Scripts & Automatizaciones",
      "proj5.desc":    "Limpieza de datos, reportes automáticos y utilidades de flujo de trabajo.",

      /* career */
      "career.title":    'Experiencia & <span class="grad">Educación</span>',
      "career.col.work": "work_experience",
      "career.col.edu":  "education",
      "exp.rd.title":  "Full Stack Developer",
      "exp.rd.badge":  "1 año",
      "exp.rd.desc":   'Desarrollo y mantenimiento del sistema web y móvil de gestión médica en producción. Backend en <strong>PHP MVC</strong> con APIs REST para integración entre servicios. Optimización de <strong>MySQL</strong>. Implementé prototipo de <strong>FHIR HL7</strong> para interoperabilidad de expedientes entre hospitales. Videollamadas con <strong>WebRTC</strong>, módulos móviles en <strong>React Native</strong>. Administración y <strong>seguridad de servidores VPS en Linux</strong> (firewall, SSH, nginx). Despliegues a producción con Git/GitHub.',
      "exp.tp.title":  "Customer Service Representative",
      "exp.tp.badge":  "1 año",
      "exp.tp.desc":   "Atención a clientes internacionales en entorno bilingüe (español / inglés B2). Resolución de incidencias y seguimiento de casos bajo métricas de desempeño. Trabajo bajo presión cumpliendo objetivos de calidad y tiempos de respuesta.",
      "edu.uaa.title": "Ingeniería en Sistemas Computacionales",
      "edu.uaa.desc":  "Fullstack, bases de datos, redes, seguridad y apps móviles. Proyectos reales con PHP, React y MySQL.",
      "edu.aws.title": "AWS Academy Graduate",
      "edu.aws.desc":  "Cloud Security Foundations & Cloud Foundations. Infraestructura en la nube, seguridad, IAM y servicios AWS esenciales.",
      "tag.support":   "Soporte",
      "tag.customer":  "Atención al cliente",
      "tag.certified": "Certificado AWS",

      /* contact */
      "contact.title":    '¿Hablamos?<br/><span class="grad">Escríbeme.</span>',
      "contact.sub":      "¿Tienes un proyecto, vacante o idea? Respondo rápido.",
      "contact.location": "México — remoto / híbrido",
      "form.name":        "Nombre",
      "form.name.ph":     "Tu nombre",
      "form.email":       "Correo",
      "form.email.ph":    "tu@email.com",
      "form.msg":         "Mensaje",
      "form.msg.ph":      "Cuéntame tu proyecto...",
      "form.submit":      "Enviar mensaje",
      "form.manual":      "Abrir correo manualmente",
      "form.err.name":    "Nombre requerido.",
      "form.err.email":   "Correo inválido.",
      "form.err.msg":     "Mínimo 10 caracteres.",
      "form.sent":        "¡Listo! Abriendo cliente de correo…",

      /* footer */
      "footer.copy": "© 2025 · Next.js · ▲ Vercel · DigitalOcean",
      "cert.security":    "Cloud Security Foundations",
      "cert.foundations": "Cloud Foundations",
    },

    en: {
      /* nav */
      "nav.about":    "About",
      "nav.services": "Services",
      "nav.skills":   "Skills",
      "nav.work":     "Work",
      "nav.career":   "Career",
      "nav.contact":  "Contact",
      "nav.hireme":   "hire_me()",

      /* hero */
      "hero.tag":     "available for work",
      "hero.desc":    'Fullstack developer. I build apps with <em>Next.js</em>, <em>Laravel</em> & <em>React Native</em>. Deployed on <em>Vercel</em> and <em>DigitalOcean</em>.',
      "hero.btn.projects": "View projects",
      "hero.btn.contact":  "Contact",
      "hero.scroll":  "scroll ↓",
      "stat.devexp":  "Year dev exp.",
      "stat.projects":"Projects",
      "stat.tech":    "Technologies",

      /* about */
      "about.title": 'Fullstack<br/><span class="grad">Developer</span>',
      "about.bio":   'Computer Systems Engineer from UAA with real production experience. I build web and mobile apps with <strong>Next.js</strong>, <strong>React</strong> & <strong>Laravel</strong>. Deployed on <strong>Vercel</strong> serverless or <strong>DigitalOcean VPS</strong>. React Native for iOS and Android. AWS Academy certified.',
      "acard.backend.title":  "Backend",
      "acard.backend.desc":   "Laravel MVC, Node.js, REST APIs, JWT, MySQL.",
      "acard.frontend.title": "Frontend",
      "acard.frontend.desc":  "Next.js, React, TypeScript, Angular.",
      "acard.deploy.title":   "Deploy",
      "acard.deploy.desc":    "Vercel serverless, DigitalOcean VPS, CI/CD.",
      "acard.mobile.title":   "Mobile",
      "acard.mobile.desc":    "React Native, Expo, WebRTC, FHIR HL7.",

      /* services */
      "svc.title":  'What do I <span class="grad">build?</span>',
      "svc1.title": "Web Applications",
      "svc1.desc":  "SPAs and websites with Next.js. SSR, SSG, SEO and Vercel deploy with automatic CI/CD.",
      "svc2.title": "APIs & Backend",
      "svc2.desc":  "REST APIs with Laravel or Node.js. JWT, roles, Swagger and relational databases.",
      "svc3.title": "Dashboards & Admin",
      "svc3.desc":  "Panels with charts, reports, exports and real-time updates.",
      "svc4.title": "Mobile Apps",
      "svc4.desc":  "React Native for iOS and Android. Push notifications, camera, WebRTC and more.",
      "svc5.title": "DevOps & Deploy",
      "svc5.desc":  "Serverless on Vercel, DigitalOcean VPS configured from scratch on Linux, automatic CI/CD.",
      "svc6.title": "E-commerce",
      "svc6.desc":  "Stores with catalog, shopping cart, Stripe/PayPal payments and full admin panel.",

      /* skills */
      "skills.title": 'Stack & <span class="grad">Technologies</span>',
      "sg.backend":   "Backend",
      "sg.frontend":  "Frontend",
      "sg.data":      "Data & Infra",

      /* projects */
      "proj.title":    'Featured <span class="grad">Projects</span>',
      "proj.featured": "featured",
      "proj.live":     "Live demo →",
      "proj0.title":   "Hospital Management System",
      "proj0.desc":    "Modular system in real production with clinical records, WebRTC video calls, real-time notifications and a FHIR HL7 prototype for interoperability between hospital systems.",
      "proj1.title":   "Analytics Dashboard",
      "proj1.desc":    "Fullstack panel with Next.js 14, JWT auth, real-time charts and Vercel deploy.",
      "proj2.title":   "E-commerce + Admin",
      "proj2.desc":    "Online store with Next.js, shopping cart, Stripe payments and full admin panel.",
      "proj3.title":   "Video Call App",
      "proj3.desc":    "Real-time communication with WebRTC, private rooms and Socket.io.",
      "proj4.title":   "CodeHub (PHP)",
      "proj4.desc":    "Modern interface for localhost — clean design for local development and PHP projects.",
      "proj5.title":   "Scripts & Automation",
      "proj5.desc":    "Data cleaning, automated reports and workflow utilities.",

      /* career */
      "career.title":    'Experience & <span class="grad">Education</span>',
      "career.col.work": "work_experience",
      "career.col.edu":  "education",
      "exp.rd.title":  "Full Stack Developer",
      "exp.rd.badge":  "1 year",
      "exp.rd.desc":   'Development and maintenance of a web & mobile medical management system in production. <strong>PHP MVC</strong> backend with REST APIs for service integration. <strong>MySQL</strong> optimization. Implemented a <strong>FHIR HL7</strong> prototype for hospital record interoperability. Real-time video calls with <strong>WebRTC</strong>, mobile modules in <strong>React Native</strong>. Administration and <strong>security of VPS servers on Linux</strong> (firewall, SSH, nginx). Production deployments with Git/GitHub.',
      "exp.tp.title":  "Customer Service Representative",
      "exp.tp.badge":  "1 year",
      "exp.tp.desc":   "Support for international clients in a bilingual environment (Spanish / English B2). Incident resolution and case tracking under performance metrics. Work under pressure meeting quality objectives and response times.",
      "edu.uaa.title": "Computer Systems Engineering",
      "edu.uaa.desc":  "Fullstack, databases, networking, security and mobile apps. Real projects with PHP, React and MySQL.",
      "edu.aws.title": "AWS Academy Graduate",
      "edu.aws.desc":  "Cloud Security Foundations & Cloud Foundations. Cloud infrastructure, security, IAM and core AWS services.",
      "tag.support":   "Support",
      "tag.customer":  "Customer service",
      "tag.certified": "AWS Certified",

      /* contact */
      "contact.title":    'Let\'s talk?<br/><span class="grad">Write to me.</span>',
      "contact.sub":      "Have a project, job offer or idea? I reply fast.",
      "contact.location": "Mexico — remote / hybrid",
      "form.name":        "Name",
      "form.name.ph":     "Your name",
      "form.email":       "Email",
      "form.email.ph":    "you@email.com",
      "form.msg":         "Message",
      "form.msg.ph":      "Tell me about your project...",
      "form.submit":      "Send message",
      "form.manual":      "Open email manually",
      "form.err.name":    "Name is required.",
      "form.err.email":   "Invalid email.",
      "form.err.msg":     "Minimum 10 characters.",
      "form.sent":        "Done! Opening your email client…",

      /* footer */
      "footer.copy": "© 2025 · Next.js · ▲ Vercel · DigitalOcean",
      "cert.security":    "Cloud Security Foundations",
      "cert.foundations": "Cloud Foundations",
    },
  };

  /* ============================================================
     LANGUAGE SYSTEM
  ============================================================ */
  let currentLang = localStorage.getItem("lang") || "es";
  let typedInstance = null;

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;

    // Text content
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (T[lang][key] !== undefined) el.textContent = T[lang][key];
    });

    // HTML content
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
      const key = el.dataset.i18nHtml;
      if (T[lang][key] !== undefined) el.innerHTML = T[lang][key];
    });

    // Placeholders
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      const key = el.dataset.i18nPh;
      if (T[lang][key] !== undefined) el.placeholder = T[lang][key];
    });

    // Toggle button state
    document.querySelectorAll(".lang-opt").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    // Reinit Typed.js with language-specific strings
    if (typedInstance) {
      typedInstance.destroy();
      typedInstance = null;
    }
    initTyped();
  }

  function initLangToggle() {
    document.querySelectorAll(".lang-opt").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.lang !== currentLang) applyLang(btn.dataset.lang);
      });
    });
  }

  /* ============================================================
     TYPED.JS (called by applyLang too)
  ============================================================ */
  const TYPED_STRINGS = {
    es: [
      "fullstack_developer()",
      "next_js_engineer()",
      "laravel_backend()",
      "react_native_dev()",
      "fhir_hl7_implementor()",
      "open_to_work → true",
    ],
    en: [
      "fullstack_developer()",
      "next_js_engineer()",
      "laravel_backend()",
      "react_native_dev()",
      "fhir_hl7_implementor()",
      "open_to_work → true",
    ],
  };

  function initTyped() {
    const el = document.getElementById("typedText");
    if (!el || typeof Typed === "undefined") return;
    typedInstance = new Typed(el, {
      strings: TYPED_STRINGS[currentLang],
      typeSpeed: 42, backSpeed: 25, backDelay: 1800, loop: true,
    });
  }

  /* ============================================================
     LENIS
  ============================================================ */
  let lenis;
  function initLenis() {
    lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ============================================================
     CURSOR
  ============================================================ */
  function initCursor() {
    const dot  = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    if (!dot || !ring || window.innerWidth < 768) return;

    document.addEventListener("mousemove", e => {
      gsap.to(dot,  { x: e.clientX, y: e.clientY, duration: 0.05, overwrite: true });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.18, overwrite: true });
    });

    const hoverEls = "a, button, [data-tilt], .svc-card, .proj-card, .about-card, .exp-card";
    document.querySelectorAll(hoverEls).forEach(el => {
      el.addEventListener("mouseenter", () => ring.classList.add("hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
    });
  }

  /* ============================================================
     SCROLL PROGRESS
  ============================================================ */
  function initScrollBar() {
    const bar = document.getElementById("scrollBar");
    if (!bar) return;
    lenis.on("scroll", ({ progress }) => { bar.style.width = (progress * 100) + "%"; });
  }

  /* ============================================================
     HEADER
  ============================================================ */
  function initHeader() {
    const header = document.getElementById("siteHeader");
    if (!header) return;
    lenis.on("scroll", ({ scroll }) => header.classList.toggle("scrolled", scroll > 50));
  }

  /* ============================================================
     MOBILE NAV
  ============================================================ */
  function initMobileNav() {
    const btn   = document.getElementById("menuBtn");
    const links = document.getElementById("navLinks");
    if (!btn || !links) return;

    btn.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      btn.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open);
    });

    links.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        links.classList.remove("open");
        btn.classList.remove("open");
        btn.setAttribute("aria-expanded", false);
      });
    });

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener("click", e => {
        const target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80 });
      });
    });
  }

  /* ============================================================
     ACTIVE NAV
  ============================================================ */
  function initActiveNav() {
    const sections = document.querySelectorAll("section[id]");
    const links    = document.querySelectorAll(".nav-links a[href^='#']");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting)
          links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(s => obs.observe(s));
  }

  /* ============================================================
     VANILLA TILT
  ============================================================ */
  function initTilt() {
    if (typeof VanillaTilt === "undefined") return;
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
      max: 6, speed: 600, glare: false,
    });
  }

  /* ============================================================
     CV CHECK
  ============================================================ */
  function initCvBtn() {
    const btn = document.getElementById("cvBtn");
    if (!btn) return;
    fetch(CONFIG.cvPath, { method: "HEAD" })
      .then(r => { if (!r.ok) btn.removeAttribute("download"); })
      .catch(() => btn.removeAttribute("download"));
  }

  /* ============================================================
     YEAR
  ============================================================ */
  function initYear() {
    const el = document.getElementById("currentYear");
    if (el) el.textContent = new Date().getFullYear();

    // Also update footer copy with real year
    document.querySelectorAll("[data-i18n='footer.copy']").forEach(el => {
      el.textContent = `© ${new Date().getFullYear()} · Next.js · ▲ Vercel · DigitalOcean`;
    });
  }

  /* ============================================================
     SCROLL TO TOP
  ============================================================ */
  function initScrollTop() {
    const btn = document.getElementById("scrollTopBtn");
    if (!btn) return;
    lenis.on("scroll", ({ scroll }) => btn.classList.toggle("visible", scroll > 400));
    btn.addEventListener("click", () => lenis.scrollTo(0));
  }

  /* ============================================================
     RIPPLE
  ============================================================ */
  function initRipple() {
    document.querySelectorAll(".btn-primary").forEach(btn => {
      btn.addEventListener("click", e => {
        const r    = document.createElement("span");
        r.className = "ripple";
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;`;
        btn.appendChild(r);
        r.addEventListener("animationend", () => r.remove());
      });
    });
  }

  /* ============================================================
     GSAP ANIMATIONS
  ============================================================ */
  function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    const heroTl = gsap.timeline({ delay: 0.05 });
    heroTl
      .from(".hero-tag",  { opacity: 0, y: 16, duration: 0.5, ease: "power3.out" })
      .from(".line-text", { y: "110%", duration: 0.9, stagger: 0.14, ease: "power4.out" }, "-=0.2")
      .from(".hero-typed-row", { opacity: 0, y: 12, duration: 0.5 }, "-=0.3")
      .from(".hero-desc",      { opacity: 0, y: 12, duration: 0.5 }, "-=0.35")
      .from(".hero-actions > *", { opacity: 0, y: 12, stagger: 0.08, duration: 0.45 }, "-=0.3")
      .from(".stat",           { opacity: 0, y: 12, stagger: 0.1, duration: 0.45 }, "-=0.35")
      .from(".terminal",       { opacity: 0, x: 50, duration: 1, ease: "power3.out" }, "-=0.8")
      .from(".chip",           { opacity: 0, scale: 0.7, stagger: 0.1, duration: 0.45, ease: "back.out(2)" }, "-=0.55");

    gsap.to(".hero-content", {
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 },
      y: -50, opacity: 0.4,
    });

    gsap.utils.toArray(".sec-head").forEach(el => {
      gsap.from(el, { scrollTrigger: { trigger: el, start: "top 88%" }, opacity: 0, x: -20, duration: 0.6, ease: "power3.out" });
    });

    gsap.utils.toArray(".sec-title").forEach(el => {
      gsap.from(el, { scrollTrigger: { trigger: el, start: "top 88%" }, opacity: 0, y: 28, duration: 0.8, ease: "power3.out" });
    });

    gsap.from(".about-bio, .about-tags", {
      scrollTrigger: { trigger: ".about-layout", start: "top 85%" },
      opacity: 0, x: -30, stagger: 0.15, duration: 0.7, ease: "power3.out",
    });
    gsap.from(".about-card", {
      scrollTrigger: { trigger: ".about-right", start: "top 85%" },
      opacity: 0, y: 24, scale: 0.97, stagger: 0.1, duration: 0.6, ease: "power3.out",
    });

    gsap.from(".svc-card", {
      scrollTrigger: { trigger: ".services-grid", start: "top 85%" },
      opacity: 0, y: 28, stagger: 0.08, duration: 0.65, ease: "power3.out",
    });

    gsap.from(".skill-group", {
      scrollTrigger: { trigger: ".skills-wrap", start: "top 85%" },
      opacity: 0, y: 28, stagger: 0.15, duration: 0.7, ease: "power3.out",
    });

    ScrollTrigger.create({
      trigger: ".skills-wrap",
      start: "top 75%",
      onEnter: () => {
        document.querySelectorAll(".skill-fill").forEach(bar => {
          gsap.to(bar, {
            width: (bar.dataset.w || "0") + "%", duration: 1.1, ease: "power2.out",
            onComplete: () => bar.classList.add("done"),
          });
        });
      },
    });

    gsap.from(".proj-card", {
      scrollTrigger: { trigger: ".projects-grid", start: "top 85%" },
      opacity: 0, y: 26, scale: 0.97, stagger: 0.09, duration: 0.65, ease: "power3.out",
    });

    gsap.from(".career-col", {
      scrollTrigger: { trigger: ".career-layout", start: "top 85%" },
      opacity: 0, x: -28, stagger: 0.15, duration: 0.7, ease: "power3.out",
    });

    gsap.from(".contact-left", {
      scrollTrigger: { trigger: ".contact-layout", start: "top 85%" },
      opacity: 0, y: 22, duration: 0.7, ease: "power3.out",
    });
    gsap.from(".contact-right", {
      scrollTrigger: { trigger: ".contact-layout", start: "top 85%" },
      opacity: 0, x: 28, duration: 0.7, ease: "power3.out", delay: 0.1,
    });
  }

  /* ============================================================
     COUNTERS
  ============================================================ */
  function initCounters() {
    const nums = document.querySelectorAll("[data-counter]");
    if (!nums.length) return;
    ScrollTrigger.create({
      trigger: ".hero-stats",
      start: "top 85%",
      onEnter: () => {
        nums.forEach(el => {
          const target = parseInt(el.dataset.counter, 10);
          gsap.to({ v: 0 }, {
            v: target, duration: 1.6, ease: "power2.out",
            onUpdate: function () { el.textContent = Math.floor(this.targets()[0].v); },
          });
        });
      },
    });
  }

  /* ============================================================
     MAGNETIC BUTTONS
  ============================================================ */
  function initMagnetic() {
    if (window.innerWidth < 768) return;
    document.querySelectorAll(".btn-primary, .nav-btn").forEach(el => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width  / 2) * 0.22,
          y: (e.clientY - r.top  - r.height / 2) * 0.22,
          duration: 0.4, ease: "power2.out",
        });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.65, ease: "elastic.out(1,0.4)" });
      });
    });
  }

  /* ============================================================
     CONTACT FORM
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

    ["cname","cemail","cmessage"].forEach(id => {
      document.getElementById(id)?.addEventListener("input", () => clearErr(id));
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      let ok = true;
      const name    = document.getElementById("cname")?.value.trim()    || "";
      const email   = document.getElementById("cemail")?.value.trim()   || "";
      const message = document.getElementById("cmessage")?.value.trim() || "";

      if (!name)                                                    { showErr("cname",    "form.err.name");  ok = false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))    { showErr("cemail",   "form.err.email"); ok = false; }
      if (message.length < 10)                                      { showErr("cmessage", "form.err.msg");   ok = false; }
      if (!ok) return;

      const subject = encodeURIComponent("Portfolio — " + name);
      const body    = encodeURIComponent(`${T[currentLang]["form.name"] || "Name"}: ${name}\n${T[currentLang]["form.email"] || "Email"}: ${email}\n\n${message}`);
      const mailto  = `mailto:${CONFIG.contactEmail}?subject=${subject}&body=${body}`;

      formMsg.className = "fmsg ok";
      formMsg.textContent = T[currentLang]["form.sent"] || "Done!";
      if (mailBtn) { mailBtn.href = mailto; mailBtn.classList.remove("hidden"); }
      window.location.href = mailto;
      form.reset();
    });
  }

  /* ============================================================
     BOOT
  ============================================================ */
  function boot() {
    initLenis();
    initCursor();
    initScrollBar();
    initHeader();
    initMobileNav();
    initActiveNav();
    initLangToggle();
    applyLang(currentLang);   // apply saved language (also inits Typed)
    initTilt();
    initCvBtn();
    initYear();
    initScrollTop();
    initAnimations();
    initCounters();
    initRipple();
    initMagnetic();
    initContactForm();
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else
    boot();

})();
