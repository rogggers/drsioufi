// Dr. Georges Sioufi — page script.
// scrollcraft.js drives the world and the flow sections. Everything here is
// bespoke to this page: language toggle and the top nav bar (current-section
// highlighting with the strip panning to follow it, and a fix for jumping
// into the world).

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
    var nav = document.querySelector(".bar__nav");
    if (!bar || !nav) return;

    var worldRoot = document.querySelector('[data-sc-mode="worldflight"]');

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function scrollToLeg(id) {
      var seg = document.getElementById(id);
      if (!seg || !worldRoot) return false;
      // "Home" is the welcome leg, and Home means the very top of the page,
      // not 12% into whatever comes first — a plain 0 is both correct and
      // simpler than computing an offset for it.
      if (id === "leg-welcome") {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        return true;
      }
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
      window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
      return true;
    }

    // Document-wide, not just the nav bar: the footer's own "Home" link
    // points at #leg-welcome too, and needs the exact same fix.
    document.querySelectorAll('a[href^="#leg-"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        if (scrollToLeg(id)) e.preventDefault();
      });
    });

    var links = nav.querySelectorAll("a[href^='#']");

    // Pan the strip so the current label is in view. Only when the strip is
    // actually scrollable (it isn't, on a wide enough desktop where every
    // label already fits) and only sideways — never let this cause the page
    // itself to jump.
    function panToCurrent(link) {
      if (!link || nav.scrollWidth <= nav.clientWidth + 1) return;
      var target = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2;
      target = Math.max(0, Math.min(target, nav.scrollWidth - nav.clientWidth));
      nav.scrollTo({ left: target, behavior: reduceMotion ? "auto" : "smooth" });
    }

    function setCurrent(id) {
      var active = null;
      links.forEach(function (l) {
        var isCurrent = l.getAttribute("href") === "#" + id;
        l.setAttribute("aria-current", isCurrent ? "true" : "false");
        if (isCurrent) active = l;
      });
      panToCurrent(active);
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

    // Resizing the window (or rotating a tablet) can change whether the
    // strip is even scrollable, so re-pan to whichever label is current.
    var resizeTick = null;
    window.addEventListener("resize", function () {
      if (resizeTick) return;
      resizeTick = requestAnimationFrame(function () {
        resizeTick = null;
        var active = nav.querySelector('a[aria-current="true"]');
        panToCurrent(active);
      });
    });
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
