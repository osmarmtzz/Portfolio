/* ============================================================
   Scroll-driven animations — GSAP + ScrollTrigger + Lenis

   How this file is organised:
   - CONFIG holds every tunable (scrub smoothing, breakpoints, marquee speed).
   - Pinned scenes use CSS `position: sticky` (see styles.css): the panels
     stack over each other, the statement and the project gallery hold the
     screen. This file only drives what happens while they hold.
   - Each section has its own *Fx function. They are listed in MODULES;
     remove one from that list to switch its animation off.
   - Everything is scrubbed, so it plays forwards and backwards with the
     scroll direction. Nothing here runs under prefers-reduced-motion.
   - The 3D scene (scene.js) reads window.__scrollFx to stay in sync.
============================================================ */
(() => {
  "use strict";

  const CONFIG = {
    smooth:    { duration: 1.2 },
    scrub:     0.8,                 // seconds of catch-up on desktop; touch devices are locked 1:1
    wideQuery: "(min-width: 901px) and (min-height: 700px)",  // horizontal gallery + receding panels
    marquee:   { baseSpeed: 0.8, boost: 0.5 },
  };

  const HAS_GSAP    = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wideQuery   = window.matchMedia(CONFIG.wideQuery);
  const enabled     = () => HAS_GSAP && !reduceQuery.matches;
  const root        = document.documentElement;

  // Shared with scene.js
  const state = (window.__scrollFx = { hero: 0, gallery: 0 });

  let lenis    = null;
  let ctx      = null;
  let cleanups = [];
  let ready    = false;
  let restoreY = null;   // scroll position to return to after a rebuild

  /* ============================================================
     SMOOTH SCROLL + POSITIONS
  ============================================================ */
  function initSmoothScroll() {
    if (!enabled() || typeof Lenis === "undefined") return;
    lenis = new Lenis({
      duration: CONFIG.smooth.duration,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Where an element sits in the document when nothing is stuck. Sticky
  // panels report a shifted position while they hold, so measure in normal flow.
  function naturalTop(el) {
    const measuring = root.classList.contains("is-measuring");
    root.classList.add("is-measuring");
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (!measuring) root.classList.remove("is-measuring");
    return top;
  }

  function scrollTo(target) {
    const y = target === 0 ? 0 : Math.max(0, naturalTop(target));
    if (lenis) lenis.scrollTo(y);
    else window.scrollTo({ top: y, behavior: reduceQuery.matches ? "auto" : "smooth" });
  }

  function lock(locked) {
    if (lenis) locked ? lenis.stop() : lenis.start();
  }

  // Turns the panels into a sticky stack. A panel taller than the screen gets
  // a negative offset so it scrolls through before it holds.
  function enableStack() {
    if (!enabled()) return;
    root.classList.add("stack-ready");
    const panels = [...document.querySelectorAll(".panel")];
    const measure = () => panels.forEach(panel => {
      panel.style.setProperty("--stick", `${Math.min(0, window.innerHeight - panel.offsetHeight)}px`);
    });
    measure();
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(measure);
      panels.forEach(panel => observer.observe(panel));
    }
    window.addEventListener("resize", measure);
    ScrollTrigger.addEventListener("refreshInit", () => root.classList.add("is-measuring"));
    ScrollTrigger.addEventListener("refresh", () => root.classList.remove("is-measuring"));
  }

  /* ============================================================
     TEXT SPLITTING
  ============================================================ */
  // Titles: every word gets a mask (.w) and a moving inner (.wi). An <em>
  // accent stays in one piece so its gradient runs across the whole phrase.
  function splitTitle(el) {
    if (el.querySelector(".wi")) return [...el.querySelectorAll(".wi")];
    const wrap = node => {
      const mask = document.createElement("span");
      mask.className = "w";
      let inner = node;
      if (node.nodeType === Node.TEXT_NODE) {
        inner = document.createElement("span");
        inner.appendChild(node);
      }
      inner.classList.add("wi");
      mask.appendChild(inner);
      return mask;
    };
    const frag = document.createDocumentFragment();
    [...el.childNodes].forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(" ") : wrap(document.createTextNode(part)));
        });
      } else if (node.nodeName === "BR") frag.appendChild(node);
      else frag.appendChild(wrap(node));
    });
    el.replaceChildren(frag);
    return [...el.querySelectorAll(".wi")];
  }

  // Paragraphs: wrap each word, keeping inline tags such as <strong>.
  function splitWords(el) {
    if (el.querySelector(".w")) return [...el.querySelectorAll(".w")];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
        const w = document.createElement("span");
        w.className = "w";
        w.textContent = part;
        frag.appendChild(w);
      });
      node.replaceWith(frag);
    });
    return [...el.querySelectorAll(".w")];
  }

  // Hero name: one span per letter. The accent line gets a colour per letter
  // because a clipped background gradient does not survive per-letter transforms.
  function splitName() {
    document.querySelectorAll(".hero-name .line").forEach(line => {
      const letters = [...line.textContent];
      const accent  = line.classList.contains("accent-text");
      const colour  = gsap.utils.interpolate("#4fe3b5", "#6ea8ff");
      line.textContent = "";
      letters.forEach((letter, i) => {
        const span = document.createElement("span");
        span.className = "ch";
        span.textContent = letter;
        if (accent) span.style.color = colour(letters.length > 1 ? i / (letters.length - 1) : 0);
        line.appendChild(span);
      });
      if (accent) line.classList.add("is-split");
    });
  }

  /* ============================================================
     SECTION MODULES
     env = { wide: boolean, scrub: number | true }
  ============================================================ */

  // Hero: it stays behind (sticky) while the camera flies through the name
  // and dives towards the waves; scene.js follows state.hero.
  function heroFx(env) {
    if (!document.querySelector(".hero-runway")) return;
    const sync = self => { state.hero = self.progress; };
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".hero-runway", start: "top bottom", end: "top top", scrub: env.scrub,
        onUpdate: sync, onRefresh: sync,
      },
    })
      .to(".hero-bottom", { y: 70,  opacity: 0, duration: 0.3 }, 0)
      .to(".hero-top",    { y: -40, opacity: 0, duration: 0.3 }, 0)
      .to(".hero-name",   { scale: env.wide ? 7 : 5, duration: 1, ease: "power2.in" }, 0)
      .to(".hero-name",   { opacity: 0, duration: 0.35 }, 0.6);
    return () => { state.hero = 0; };
  }

  // Panels: as each one slides over the previous, the one underneath dims
  // and (on large screens) shrinks back like a sheet being covered.
  function panelsFx(env) {
    const panels = gsap.utils.toArray(".panel");
    panels.forEach((panel, i) => {
      if (i === 0) return;
      const recede = {
        "--dim-level": 0.55, ease: "none",
        scrollTrigger: { trigger: panel, start: "top bottom", end: "top top", scrub: true },
      };
      if (env.wide && i > 1) Object.assign(recede, { scale: 0.93, borderRadius: 30 });
      gsap.to(panels[i - 1], recede);
    });
  }

  // About: the statement holds the screen while it lights up word by word,
  // then the cards fan out of a single deck into their row.
  function aboutFx(env) {
    const statement = document.querySelector(".statement");
    const manifesto = document.querySelector(".manifesto");
    if (statement && manifesto) {
      const words = splitWords(manifesto);
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: statement, start: "top top", end: "bottom bottom", scrub: env.scrub },
      })
        .fromTo(words, { opacity: 0.12 }, { opacity: 1, stagger: 0.1 })
        .to({}, { duration: words.length * 0.03 });   // hold the finished statement for a beat
    }

    gsap.utils.toArray(".about-text.scrub-text").forEach(el => {
      gsap.fromTo(splitWords(el),
        { opacity: 0.16 },
        { opacity: 1, ease: "none", stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 88%", end: "bottom 55%", scrub: env.scrub } });
    });

    const deck = document.querySelector(".pillars");
    if (!deck) return;
    const cards  = gsap.utils.toArray(".pillar", deck);
    const centre = deck.getBoundingClientRect().left + deck.offsetWidth / 2;
    const mid    = (cards.length - 1) / 2;
    gsap.fromTo(cards,
      {
        x: (i, card) => (centre - (card.getBoundingClientRect().left + card.offsetWidth / 2)) * 0.9,
        y: 160, rotate: i => (i - mid) * 7, scale: 0.84, opacity: 0, transformOrigin: "50% 100%",
      },
      { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, ease: "power1.out", stagger: 0.06,
        scrollTrigger: { trigger: deck, start: "top 96%", end: "top 38%", scrub: env.scrub } });
  }

  // Projects: on large screens the gallery holds the screen and the slides
  // travel sideways; each mock-up turns to face the camera as it passes and
  // its badges drift faster than it does. Elsewhere the slides stay stacked.
  function galleryFx(env) {
    const section = document.getElementById("proyectos");
    const gallery = document.getElementById("gallery");
    const track   = document.getElementById("projTrack");
    if (!section || !gallery || !track) return;
    const cards = gsap.utils.toArray(".proj", track);

    if (!env.wide) {
      cards.forEach(card => {
        gsap.fromTo(card.querySelector(".mock"),
          { y: 60, rotateX: 16, scale: 0.86, opacity: 0.2 },
          { y: 0, rotateX: 0, scale: 1, opacity: 1, ease: "none",
            scrollTrigger: { trigger: card, start: "top 96%", end: "top 48%", scrub: env.scrub } });
        card.querySelectorAll(".float").forEach(badge => {
          const depth = parseFloat(badge.dataset.depth) || 1;
          gsap.fromTo(badge, { y: 46 * depth }, {
            y: -46 * depth, ease: "none",
            scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: env.scrub },
          });
        });
        const info = card.querySelector(".proj-info");
        gsap.fromTo(info, { y: 50, opacity: 0 }, {
          y: 0, opacity: 1, ease: "none",
          scrollTrigger: { trigger: info, start: "top 96%", end: "top 72%", scrub: env.scrub },
        });
      });
      return;
    }

    section.classList.add("is-horizontal");
    const fill  = document.getElementById("projBarFill");
    const count = document.getElementById("projCount");
    const total = String(cards.length).padStart(2, "0");
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    // The gallery is as tall as the sideways trip is long, so one scrolls into the other
    const size = () => { gallery.style.height = `${window.innerHeight + distance()}px`; };
    size();
    ScrollTrigger.addEventListener("refreshInit", size);

    // The track leans into the movement and settles when the scroll stops
    const lean = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" });
    const rest = () => lean(0);
    ScrollTrigger.addEventListener("scrollEnd", rest);
    const sync = self => {
      state.gallery = self.progress;
      if (fill)  fill.style.transform = `scaleX(${self.progress.toFixed(4)})`;
      if (count) count.textContent = `${String(Math.round(self.progress * (cards.length - 1)) + 1).padStart(2, "0")} / ${total}`;
    };

    const slide = gsap.to(track, {
      x: () => -distance(), ease: "none",
      scrollTrigger: {
        trigger: gallery, start: "top top", end: "bottom bottom", scrub: env.scrub, invalidateOnRefresh: true,
        onUpdate: self => { sync(self); lean(gsap.utils.clamp(-3, 3, self.getVelocity() / -500)); },
        onRefresh: sync,
      },
    });

    cards.forEach(card => {
      const pass = { containerAnimation: slide, trigger: card, start: "left right", end: "right left", scrub: true };
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: pass })
        .fromTo(card.querySelector(".mock"),
          { rotateY: -30, rotateX: 9, scale: 0.78, opacity: 0.2 },
          { rotateY: 0, rotateX: 0, scale: 1, opacity: 1, duration: 0.5 })
        .to(card.querySelector(".mock"), { rotateY: 22, rotateX: -5, scale: 0.86, opacity: 0.4, duration: 0.5 });

      card.querySelectorAll(".float").forEach(badge => {
        const depth = parseFloat(badge.dataset.depth) || 1;
        gsap.fromTo(badge, { x: 120 * depth, y: 26 * depth }, {
          x: -120 * depth, y: -26 * depth, ease: "none", scrollTrigger: { ...pass },
        });
      });

      gsap.fromTo(card.querySelector(".proj-info"), { x: 100, opacity: 0 }, {
        x: 0, opacity: 1, ease: "none",
        scrollTrigger: { containerAnimation: slide, trigger: card, start: "left 94%", end: "left 46%", scrub: true },
      });
    });

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", size);
      ScrollTrigger.removeEventListener("scrollEnd", rest);
      section.classList.remove("is-horizontal");
      gallery.style.height = "";
      state.gallery = 0;
    };
  }

  // Section headers, titles (word-by-word mask reveal), the outlined section
  // numbers drifting behind them, and small generic blocks.
  function headingsFx(env) {
    gsap.utils.toArray(".sec-head").forEach(head => {
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: head, start: "top 96%", end: "top 72%", scrub: env.scrub },
      })
        .fromTo(head.querySelector(".sec-idx"),   { x: -30, opacity: 0 }, { x: 0, opacity: 1 }, 0)
        .fromTo(head.querySelector(".sec-rule"),  { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1 }, 0.1)
        .fromTo(head.querySelector(".sec-label"), { x: 30, opacity: 0 }, { x: 0, opacity: 1 }, 0.2);
    });

    gsap.utils.toArray(".sec-title").forEach(title => {
      gsap.fromTo(splitTitle(title),
        { yPercent: 120, rotate: 5, transformOrigin: "0% 100%" },
        { yPercent: 0, rotate: 0, ease: "power2.out", stagger: 0.12,
          scrollTrigger: { trigger: title, start: "clamp(top 94%)", end: "clamp(top 58%)", scrub: env.scrub } });
    });

    gsap.utils.toArray(".sec-ghost").forEach(ghost => {
      gsap.fromTo(ghost, { yPercent: 45 }, {
        yPercent: -45, ease: "none",
        scrollTrigger: { trigger: ghost.parentElement, start: "top bottom", end: "top -60%", scrub: env.scrub },
      });
    });

    gsap.utils.toArray(".reveal").forEach(el => {
      gsap.fromTo(el,
        { y: 46, opacity: 0 },
        { y: 0, opacity: 1, ease: "none",
          scrollTrigger: { trigger: el, start: "clamp(top 97%)", end: "clamp(top 76%)", scrub: env.scrub } });
    });
  }

  // Experience: the role column slides in and stays in view while each
  // achievement comes into focus as it crosses the screen, then recedes.
  function experienceFx(env) {
    gsap.utils.toArray(".job").forEach(job => {
      gsap.fromTo(job.querySelector(".job-head"),
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, ease: "none",
          scrollTrigger: { trigger: job, start: "top 90%", end: "top 55%", scrub: env.scrub } });

      gsap.fromTo(job.querySelector(".job-intro"),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, ease: "none",
          scrollTrigger: { trigger: job, start: "top 88%", end: "top 58%", scrub: env.scrub } });

      job.querySelectorAll(".job-list li").forEach(item => {
        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: item, start: "top 94%", end: "top 10%", scrub: env.scrub },
        })
          .fromTo(item, { x: 44, opacity: 0.1 }, { x: 0, opacity: 1, duration: 0.3 })
          .to(item, { opacity: 1, duration: 0.45 })
          .to(item, { opacity: 0.38, duration: 0.25 });
      });

      const chips = job.querySelector(".job-card > .chips");
      if (chips) {
        gsap.fromTo(chips, { y: 30, opacity: 0 }, {
          y: 0, opacity: 1, ease: "none",
          scrollTrigger: { trigger: chips, start: "top 96%", end: "top 80%", scrub: env.scrub },
        });
      }
    });
  }

  // Skills: rows slide in from alternating sides.
  function skillsFx(env) {
    gsap.utils.toArray(".skill").forEach((row, i) => {
      gsap.fromTo(row, { x: i % 2 ? 90 : -90, opacity: 0 }, {
        x: 0, opacity: 1, ease: "none",
        scrollTrigger: { trigger: row, start: "top 98%", end: "top 74%", scrub: env.scrub },
      });
    });
  }

  // Education: cards swing open like doors.
  function educationFx(env) {
    const cards = gsap.utils.toArray(".edu");
    if (!cards.length) return;
    gsap.fromTo(cards,
      { rotateY: -42, x: 80, opacity: 0, transformOrigin: "0% 50%" },
      { rotateY: 0, x: 0, opacity: 1, ease: "none", stagger: 0.18,
        scrollTrigger: { trigger: ".edu-grid", start: "clamp(top 95%)", end: "clamp(top 48%)", scrub: env.scrub } });
  }

  // Contact: rows slide in from the left while the form swings in from the right.
  function contactFx(env) {
    gsap.fromTo(".contact-row",
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, ease: "none", stagger: 0.15,
        scrollTrigger: { trigger: ".contact-links", start: "clamp(top 96%)", end: "clamp(top 62%)", scrub: env.scrub } });

    gsap.fromTo(".contact-form",
      env.wide
        ? { x: 120, rotateY: -18, opacity: 0, transformPerspective: 1300, transformOrigin: "100% 50%" }
        : { y: 90, scale: 0.94, opacity: 0 },
      { x: 0, y: 0, rotateY: 0, scale: 1, opacity: 1, ease: "none",
        scrollTrigger: { trigger: ".contact-form", start: "clamp(top 96%)", end: "clamp(top 48%)", scrub: env.scrub } });
  }

  // Footer: the outlined name drifts across and fills with colour as the page ends.
  function footerFx(env) {
    gsap.fromTo(".foot-giant span", { xPercent: 6, "--fill": "0%" }, {
      xPercent: -6, "--fill": "100%", ease: "none",
      scrollTrigger: { trigger: ".site-footer", start: "top bottom", end: "bottom bottom", scrub: env.scrub },
    });
  }

  const MODULES = [heroFx, panelsFx, aboutFx, galleryFx, headingsFx, experienceFx, skillsFx, educationFx, contactFx, footerFx];

  /* ============================================================
     BUILD / TEARDOWN
     main.js calls teardown() before swapping the page language and
     build() afterwards, because the split text nodes get replaced.
  ============================================================ */
  function teardown() {
    if (!ctx) return;
    if (restoreY === null) restoreY = window.scrollY;
    cleanups.forEach(fn => fn());
    cleanups = [];
    ctx.revert();
    ctx = null;
  }

  function build() {
    if (!ready || !enabled()) return;
    teardown();
    const y = restoreY !== null ? restoreY : window.scrollY;
    restoreY = null;
    const touch = ScrollTrigger.isTouch === 1;
    const env = { wide: wideQuery.matches, scrub: touch ? true : CONFIG.scrub };
    root.classList.add("is-measuring");
    ctx = gsap.context(() => {
      MODULES.forEach(fx => {
        const cleanup = fx(env);
        if (typeof cleanup === "function") cleanups.push(cleanup);
      });
    });
    ScrollTrigger.refresh();
    root.classList.remove("is-measuring");
    // a rebuild changes the page height (gallery), which can move the scroll position
    if (Math.abs(window.scrollY - y) > 2) {
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    }
  }

  /* ============================================================
     ONE-OFF PIECES (not tied to the scroll position)
  ============================================================ */
  // Preloader count + lift, then the hero entrance. Intro tweens target the
  // letters and the .hero-fade items; heroFx animates their wrappers, so the
  // two never fight over a property.
  function intro() {
    const pre   = document.getElementById("preloader");
    const count = document.getElementById("preloaderCount");
    if (!enabled()) { if (pre) pre.remove(); return; }

    splitName();

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } })
      .from(".hero-name .ch", { yPercent: 125, rotateX: -75, opacity: 0, transformPerspective: 700, duration: 1.35, stagger: 0.045 }, 0)
      .from(".site-header",   { yPercent: -120, opacity: 0, duration: 0.9, clearProps: "all" }, 0.25)
      .from(".hero-fade",     { opacity: 0, y: 30, duration: 1, stagger: 0.08, ease: "power3.out" }, 0.55)
      .add(() => {
        document.querySelectorAll("[data-counter]").forEach(el => {
          const counter = { v: 0 };
          gsap.to(counter, {
            v: parseInt(el.dataset.counter, 10), duration: 1.6, ease: "power2.out",
            onUpdate: () => { el.textContent = Math.round(counter.v); },
          });
        });
      }, 0.9);

    const wait   = ms => new Promise(resolve => setTimeout(resolve, ms));
    const fonts  = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const tally  = { v: 0 };
    const counted = new Promise(resolve => {
      if (!count) { resolve(); return; }
      gsap.to(tally, {
        v: 100, duration: 1, ease: "power2.inOut",
        onUpdate: () => { count.textContent = Math.round(tally.v); },
        onComplete: resolve,
      });
    });
    Promise.race([Promise.all([fonts, counted]), wait(2600)]).then(() => {
      if (pre) gsap.to(pre, { yPercent: -100, duration: 0.9, ease: "power4.inOut", onComplete: () => pre.remove() });
      gsap.delayedCall(pre ? 0.35 : 0, () => tl.play(0));
    });
  }

  // Tech marquee: runs on its own, speeds up with the scroll and follows its direction.
  function marquee() {
    const track = document.querySelector(".marquee-track");
    if (!track || !enabled()) return;
    track.parentElement.classList.add("js-marquee");
    let half  = track.scrollWidth / 2;
    let x     = 0;
    let dir   = -1;
    let boost = 0;
    let lastY = window.scrollY;
    window.addEventListener("resize", () => { half = track.scrollWidth / 2; });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { half = track.scrollWidth / 2; });

    gsap.ticker.add(() => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (delta !== 0) dir = delta > 0 ? -1 : 1;
      boost += (Math.min(Math.abs(delta), 90) - boost) * 0.1;
      x += dir * (CONFIG.marquee.baseSpeed + boost * CONFIG.marquee.boost);
      if (x <= -half) x += half;
      else if (x > 0) x -= half;
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${(dir * boost * 0.12).toFixed(2)}deg)`;
    });
  }

  /* ============================================================
     INIT
  ============================================================ */
  function init() {
    if (ready) return;
    ready = true;
    if (HAS_GSAP) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
    }
    initSmoothScroll();
    enableStack();
    intro();
    marquee();
    build();
    wideQuery.addEventListener("change", build);
  }

  window.ScrollFX = { init, build, teardown, scrollTo, naturalTop, lock, CONFIG, get lenis() { return lenis; } };
})();
