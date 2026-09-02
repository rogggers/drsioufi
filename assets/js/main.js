// Dr. Georges Sioufi — page script.
// scrollcraft.js drives the world and the flow sections. Everything here is
// bespoke to this page: language toggle and the top nav bar (mobile collapse,
// current-section highlighting, and a fix for jumping into the world).

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

// ---- the top nav bar: mobile collapse, current-section highlight, and a
// working jump into the world -----------------------------------------------
//
// Anchor links into the four world legs (#leg-welcome etc.) cannot rely on
// the browser's native hash-jump: those elements live inside [data-sc-world],
// which is position:fixed. A fixed element's box does not move with the
// page, so "scroll this element into view" has no meaningful document
// position to compute from, and the native jump silently does nothing. The
// fix is to work out each leg's own place on the (very real) scroll track
// from the same data-sc-w weights the engine itself reads, and scroll there
// directly.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var bar = document.querySelector(".bar");
    var toggle = document.querySelector(".bar__menu-toggle");
    var nav = document.querySelector(".bar__nav");
    if (!bar || !nav) return;

    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = bar.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          bar.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    var worldRoot = document.querySelector('[data-sc-mode="worldflight"]');

    function scrollToLeg(id) {
      var seg = document.getElementById(id);
      if (!seg || !worldRoot) return false;
      var segs = Array.prototype.slice.call(worldRoot.querySelectorAll("[data-sc-segment]"));
      var vh = window.innerHeight;
      var worldTop = worldRoot.getBoundingClientRect().top + (window.scrollY || 0);
      var offset = 0;
      for (var i = 0; i < segs.length; i++) {
        if (segs[i] === seg) break;
        offset += parseFloat(segs[i].getAttribute("data-sc-w")) || 1.3;
      }
      // Land a little way into the leg, not right on the seam, so its own
      // copy has already started arriving rather than the tail end of the
      // previous leg's.
      var target = worldTop + (offset + 0.12) * vh;
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
      return true;
    }

    nav.querySelectorAll('a[href^="#leg-"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        if (scrollToLeg(id)) e.preventDefault();
      });
    });

    var links = nav.querySelectorAll("a[href^='#']");
    function setCurrent(id) {
      links.forEach(function (l) {
        l.setAttribute("aria-current", l.getAttribute("href") === "#" + id ? "true" : "false");
      });
    }

    // World legs: the engine fires sc:waypoint with the leg's data-sc-waypoint
    // label as it becomes current. Map those labels to nav hrefs.
    if (worldRoot) {
      worldRoot.addEventListener("sc:waypoint", function (e) {
        var label = e.detail && e.detail.label;
        if (!label) return;
        var slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        setCurrent("leg-" + slug);
      });
    }

    // Flow sections below the world: plain IntersectionObserver.
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
