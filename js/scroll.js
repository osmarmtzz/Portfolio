/* ============================================================
   Scroll-driven animations — GSAP + ScrollTrigger + Lenis

   How this file is organised:
   - CONFIG holds every tunable (scrub smoothing, pin lengths, breakpoints).
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
    scrub:     0.8,                  // seconds of catch-up on desktop; touch devices are locked 1:1
    hero:      { pinLength: 1.0 },   // extra scroll while a section stays pinned, in viewport heights
    manifesto: { pinLength: 0.9 },
    pinQuery:  "(min-width: 901px) and (min-height: 760px)", // pinned scenes + horizontal gallery
    marquee:   { baseSpeed: 0.8, boost: 0.5 },
  };

  const HAS_GSAP    = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pinQuery    = window.matchMedia(CONFIG.pinQuery);
  const enabled     = () => HAS_GSAP && !reduceQuery.matches;

  // Shared with scene.js
  const state = (window.__scrollFx = { hero: 0, gallery: 0 });

  let lenis    = null;
  let ctx      = null;
  let cleanups = [];
  let ready    = false;
  let restoreY = null;   // scroll position to return to after a rebuild

  /* ============================================================
     SMOOTH SCROLL
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

  function scrollTo(target) {
    const instant = reduceQuery.matches;
    if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -70 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
    else target.scrollIntoView({ behavior: instant ? "auto" : "smooth" });
  }

  function lock(locked) {
    if (lenis) locked ? lenis.stop() : lenis.start();
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
     env = { pin: boolean, scrub: number | true }
  ============================================================ */

  // Hero: stays pinned while the camera flies through the name and dives
  // towards the waves (scene.js follows state.hero).
  function heroFx(env) {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const sync = self => { state.hero = self.progress; };
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: env.pin ? () => "+=" + window.innerHeight * CONFIG.hero.pinLength : "bottom top",
        pin: env.pin, anticipatePin: 1, scrub: env.scrub,
        onUpdate: sync, onRefresh: sync,
      },
    });
    tl.to(".hero-bottom", { y: 70,  opacity: 0, duration: 0.3 }, 0)
      .to(".hero-top",    { y: -40, opacity: 0, duration: 0.3 }, 0);
    if (env.pin) {
      tl.to(".hero-name", { scale: 7, duration: 1, ease: "power2.in" }, 0)
        .to(".hero-name", { opacity: 0, duration: 0.35 }, 0.6);
    } else {
      tl.to(".hero-name", { yPercent: -35, opacity: 0, duration: 1 }, 0);
    }
    return () => { state.hero = 0; };
  }

  // About: the statement holds the screen while it lights up word by word,
  // then the supporting copy and the pillar cards fall into place.
  function aboutFx(env) {
    const intro     = document.querySelector(".about-intro");
    const manifesto = document.querySelector(".manifesto");
    if (intro && manifesto) {
      gsap.fromTo(splitWords(manifesto),
        { opacity: 0.14 },
        { opacity: 1, ease: "none", stagger: 0.1,
          scrollTrigger: env.pin
            ? { trigger: intro, start: "center center", end: () => "+=" + window.innerHeight * CONFIG.manifesto.pinLength,
                pin: true, anticipatePin: 1, scrub: env.scrub }
            : { trigger: manifesto, start: "top 84%", end: "bottom 45%", scrub: env.scrub } });
    }

    gsap.utils.toArray(".about-text.scrub-text").forEach(el => {
      gsap.fromTo(splitWords(el),
        { opacity: 0.16 },
        { opacity: 1, ease: "none", stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 88%", end: "bottom 55%", scrub: env.scrub } });
    });

    const pillars = gsap.utils.toArray(".pillar");
    if (!pillars.length) return;
    gsap.fromTo(pillars,
      { y: 150, rotateX: -32, rotateZ: i => (i % 2 ? 5 : -5), scale: 0.84, opacity: 0, transformOrigin: "50% 100%" },
      { y: 0, rotateX: 0, rotateZ: 0, scale: 1, opacity: 1, ease: "none", stagger: 0.2,
        scrollTrigger: { trigger: ".pillars", start: "top 96%", end: "top 36%", scrub: env.scrub } });
  }

  // Projects: on large screens the section pins and the cards travel
  // sideways, each one swinging into place as it enters. Elsewhere the
  // cards stay stacked and rise in one by one.
  function galleryFx(env) {
    const section = document.getElementById("proyectos");
    const track   = document.getElementById("projTrack");
    if (!section || !track) return;
    const cards = gsap.utils.toArray(".proj", track);

    if (!env.pin) {
      cards.forEach(card => {
        gsap.fromTo(card,
          { y: 90, scale: 0.92, rotateX: -10, opacity: 0, transformOrigin: "50% 100%" },
          { y: 0, scale: 1, rotateX: 0, opacity: 1, ease: "none",
            scrollTrigger: { trigger: card, start: "top 97%", end: "top 68%", scrub: env.scrub } });
      });
      return;
    }

    section.classList.add("is-horizontal");
    const fill  = document.getElementById("projBarFill");
    const count = document.getElementById("projCount");
    const total = String(cards.length).padStart(2, "0");
    const distance = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
    // The track leans into the movement and settles when the scroll stops
    const lean  = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" });
    const rest  = () => lean(0);
    const sync = self => {
      state.gallery = self.progress;
      if (fill)  fill.style.transform = `scaleX(${self.progress.toFixed(4)})`;
      if (count) count.textContent = `${String(Math.round(self.progress * (cards.length - 1)) + 1).padStart(2, "0")} / ${total}`;
    };

    const slide = gsap.to(track, {
      x: () => -distance(), ease: "none",
      scrollTrigger: {
        trigger: section, start: "top top", end: () => "+=" + distance(),
        pin: true, anticipatePin: 1, scrub: env.scrub, invalidateOnRefresh: true,
        onUpdate: self => { sync(self); lean(gsap.utils.clamp(-4, 4, self.getVelocity() / -400)); },
        onRefresh: sync,
      },
    });
    ScrollTrigger.addEventListener("scrollEnd", rest);

    cards.forEach((card, i) => {
      if (i === 0) return;
      gsap.fromTo(card,
        { rotateY: -32, scale: 0.82, opacity: 0.15, transformOrigin: "0% 50%" },
        { rotateY: 0, scale: 1, opacity: 1, ease: "none",
          scrollTrigger: { containerAnimation: slide, trigger: card, start: "left 110%", end: "left 62%", scrub: true } });
    });

    return () => {
      ScrollTrigger.removeEventListener("scrollEnd", rest);
      section.classList.remove("is-horizontal");
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
      gsap.fromTo(ghost, { yPercent: 40 }, {
        yPercent: -40, ease: "none",
        scrollTrigger: { trigger: ghost.parentElement, start: "top bottom", end: "bottom top", scrub: env.scrub },
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

  // Skills: cards start scattered and fanned out, then assemble into the grid.
  function skillsFx(env) {
    const grid = document.querySelector(".skills-grid");
    if (!grid) return;
    const cards = gsap.utils.toArray(".skill", grid);
    const cols  = getComputedStyle(grid).gridTemplateColumns.split(" ").length || 1;
    const mid   = (cols - 1) / 2;
    gsap.fromTo(cards,
      {
        x: i => ((i % cols) - mid) * 70,
        y: i => 170 + Math.floor(i / cols) * 50,
        rotateZ: i => ((i % cols) - mid) * 7,
        rotateX: -38, scale: 0.8, opacity: 0, transformOrigin: "50% 100%",
      },
      { x: 0, y: 0, rotateZ: 0, rotateX: 0, scale: 1, opacity: 1, ease: "none", stagger: 0.09,
        scrollTrigger: { trigger: grid, start: "top 96%", end: "top 30%", scrub: env.scrub } });
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
      env.pin
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

  // Section hand-offs: outgoing content recedes while the next one arrives.
  // (About uses its grid, not the container: a transformed ancestor would break the pinned statement.)
  function transitionsFx(env) {
    [["#sobre-mi", ".about-grid"], ["#experiencia", ".container"], ["#skills", ".container"], ["#educacion", ".container"]]
      .forEach(([id, inner]) => {
        const section = document.querySelector(id);
        const target  = section && section.querySelector(inner);
        if (!target) return;
        gsap.to(target, {
          scale: 0.95, opacity: 0.15, transformOrigin: "50% 100%", ease: "none",
          scrollTrigger: { trigger: section, start: "bottom 55%", end: "bottom 6%", scrub: env.scrub },
        });
      });
  }

  // Modules that pin come first and in page order, so everything below them measures correctly.
  const MODULES = [heroFx, aboutFx, galleryFx, headingsFx, experienceFx, skillsFx, educationFx, contactFx, footerFx, transitionsFx];

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
    const env = { pin: pinQuery.matches, scrub: touch ? true : CONFIG.scrub };
    ctx = gsap.context(() => {
      MODULES.forEach(fx => {
        const cleanup = fx(env);
        if (typeof cleanup === "function") cleanups.push(cleanup);
      });
    });
    ScrollTrigger.refresh();
    // teardown removes the pin spacers, which can clamp the scroll position
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
    intro();
    marquee();
    build();
    pinQuery.addEventListener("change", build);
  }

  window.ScrollFX = { init, build, teardown, scrollTo, lock, CONFIG, get lenis() { return lenis; } };
})();
