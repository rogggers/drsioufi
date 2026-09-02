// Dr. Georges Sioufi — page script.
// scrollcraft.js drives the world and the flow sections. Everything here is
// bespoke to this page: language toggle, the top-right jump index, and the
// signature move (the goniometer gauge reading whole-page scroll progress).

// ---- language toggle (EN/FR), unchanged mechanism from the previous site --
(function () {
  var STORAGE_KEY = "sioufi-site-lang";

  function applyLang(lang) {
    var isFr = lang === "fr";
    document.body.classList.toggle("fr-active", isFr);
    document.documentElement.setAttribute("lang", isFr ? "fr" : "en");
    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang-btn") === lang);
    });
  }

  function setLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    applyLang(lang);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var saved = "en";
    try { saved = localStorage.getItem(STORAGE_KEY) || "en"; } catch (e) {}
    applyLang(saved);
    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () { setLang(btn.getAttribute("data-lang-btn")); });
    });
  });
})();

// ---- the top-right index: toggle open/closed, highlight current section --
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var index = document.querySelector(".index");
    var toggle = document.querySelector(".index__toggle");
    if (!index || !toggle) return;

    // Above 900px the panel is always visible in CSS (see style.css); the
    // toggle only actually hides/shows anything below that. Keep aria-expanded
    // honest on load rather than defaulting to "false" over a panel that is,
    // on a desktop viewport, already on screen.
    var mq = window.matchMedia && window.matchMedia("(min-width: 901px)");
    toggle.setAttribute("aria-expanded", mq && mq.matches ? "true" : "false");

    toggle.addEventListener("click", function () {
      var open = index.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!index.contains(e.target)) index.classList.remove("is-open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") index.classList.remove("is-open");
    });
    index.querySelectorAll(".index__panel a").forEach(function (a) {
      a.addEventListener("click", function () {
        index.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    var links = index.querySelectorAll(".index__panel a[href^='#']");
    function setCurrent(id) {
      links.forEach(function (l) {
        l.setAttribute("aria-current", l.getAttribute("href") === "#" + id ? "true" : "false");
      });
    }

    // World legs: the engine fires sc:waypoint with the leg's data-sc-waypoint
    // label as it becomes current. Map those labels to index hrefs.
    var worldRoot = document.querySelector('[data-sc-mode="worldflight"]');
    if (worldRoot) {
      worldRoot.addEventListener("sc:waypoint", function (e) {
        var label = e.detail && e.detail.label;
        if (!label) return;
        var slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        setCurrent("leg-" + slug);
      });
    }

    // Flow sections below the world: plain IntersectionObserver, same as the
    // previous site's section-nav.
    var sections = Array.prototype.slice.call(document.querySelectorAll(".paper section[id]"));
    if (sections.length && "IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
      sections.forEach(function (s) { obs.observe(s); });
    }
  });
})();

// ---- the signature move: the goniometer reads whole-page scroll progress --
// Not a kit device. A persistent instrument, driven from raw scroll, that
// happens to also be the jump index's toggle. The ring fill starts at 12
// o'clock and grows clockwise (see the -90deg rotate in the markup), so the
// needle rotates through the exact same 0-360deg clockwise sweep, always
// pointing at the ring's own leading edge rather than wagging independently
// of it. The numeric readout is a separate, real figure (0-140deg, a full
// knee-flexion range) climbing across the whole document, not just the
// world above.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var sweep = document.querySelector(".index__gauge .arc-sweep");
    var needle = document.querySelector(".index__gauge .needle");
    var deg = document.querySelector(".index__deg");
    if (!sweep || !needle) return;

    var CIRC = 2 * Math.PI * 18; // r=18, matches the circle in the markup
    sweep.style.strokeDasharray = CIRC.toFixed(2);
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var ticking = false;
    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = Math.max((doc.scrollHeight || 0) - (window.innerHeight || 0), 1);
      var pct = Math.min(Math.max((window.scrollY || doc.scrollTop || 0) / max, 0), 1);
      sweep.style.strokeDashoffset = (CIRC * (1 - pct)).toFixed(2);
      var angle = pct * 360;
      needle.setAttribute("transform", "rotate(" + angle.toFixed(1) + " 22 22)");
      if (deg) deg.textContent = Math.round(pct * 140) + "°";
    }
    document.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
    // A worldflight resizes its own spacer asynchronously (fonts, layout);
    // give the gauge a second pass once that has settled.
    setTimeout(update, 400);
  });
})();

// ---- worldflight relayout: required by worldflight.md 7b. If innerHeight
// reports 0 at first mount (some embeds/early loads), the spacer is sized to
// 0 and the flight silently never advances. One resize after load and after
// webfonts fixes it. --------------------------------------------------------
(function () {
  function relayout() { window.dispatchEvent(new Event("resize")); }
  window.addEventListener("load", relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
})();

// ---- mount the engine -------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  if (window.ScrollCraft) window.ScrollCraft.mount(document);
});
