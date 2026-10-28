// Dr. Georges Sioufi — page script.
// scrollcraft.js drives the world and the flow sections. Everything here is
// bespoke to this page: always opening at the top, the language toggle, and
// the top nav bar (jumping to a section, current-section highlighting, and
// collapsing to a menu button when the labels don't fit).

// ---- always open at Home ---------------------------------------------------
// A refresh lands back on the first slide, not wherever the reader was: turn
// off the browser's own scroll restoration, and drop any #section from the
// address so a refresh can't jump back down to it either. Runs immediately
// (this script sits at the end of <body>) so there is no visible jump.
(function () {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (location.hash) {
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  }
  function toTop() { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }
  toTop();
  window.addEventListener("load", toTop);
})();

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
    // The nav labels change width with the language; the bar re-checks fit.
    document.dispatchEvent(new CustomEvent("sioufi:lang"));
  }

  function setLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    applyLang(lang);
  }

  var saved = "en";
  try { saved = localStorage.getItem(STORAGE_KEY) || "en"; } catch (e) {}
  applyLang(saved);
  document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
    btn.addEventListener("click", function () { setLang(btn.getAttribute("data-lang-btn")); });
  });
})();

// ---- the stack: the lower sections slide over one another ------------------
// Each section (and the footer) is a sticky sheet (see style.css). Here:
//  - each sheet's sticky `top` is set to (viewport height − its height), so
//    it holds still at the moment its last line reaches the bottom of the
//    screen, and the next sheet slides up over it;
//  - --under (0..1) is written on the sheet being covered, and
//    --world-under on the page while Training Path covers the last slide,
//    for the same dim the slides use;
//  - every sheet's real page position is kept, because a held sheet's
//    on-screen box no longer says where it sits on the page (the nav needs
//    the real one to jump to it).
window.SioufiStack = (function () {
  var paper = document.querySelector(".paper");
  var sheets = paper ? Array.prototype.filter.call(paper.children, function (el) {
    return el.matches("section, .foot");
  }) : [];
  // Offsets are kept relative to the paper, whose own page position is read
  // live: it sits below the slides' scroll track, which the engine sizes
  // (and re-sizes on every resize) independently of this script.
  var offs = [], unders = [], worldUnder = -1;
  var clamp01 = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  function paperTop() { return paper.getBoundingClientRect().top + (window.scrollY || 0); }

  // Where a sheet holds is worked out against the SMALL viewport height
  // (100svh: the screen with the phone's toolbars showing), not the current
  // one. A phone's toolbars come back the moment the reader scrolls up, and
  // a sheet held against the full-screen height would park its last lines,
  // like a button, behind them. It also keeps the hold points from shifting
  // while the toolbars slide in and out. Desktop: svh equals innerHeight.
  var probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "position:fixed;top:0;left:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none;";
  document.body.appendChild(probe);
  function holdHeight() { return probe.offsetHeight || window.innerHeight; }

  function measure() {
    if (!paper) return;
    var vh = Math.min(holdHeight(), window.innerHeight), run = 0;
    sheets.forEach(function (s, i) {
      var h = s.offsetHeight;
      offs[i] = run;
      run += h;
      s.style.top = Math.min(0, vh - h) + "px";
    });
    update();
  }

  function update() {
    if (!paper) return;
    var y = window.scrollY || 0, vh = window.innerHeight, top = paperTop();
    var w = clamp01((y + vh - top) / vh);
    if (w !== worldUnder) { worldUnder = w; document.documentElement.style.setProperty("--world-under", w.toFixed(3)); }
    sheets.forEach(function (s, i) {
      var u = i + 1 < sheets.length ? clamp01((y + vh - top - offs[i + 1]) / vh) : 0;
      if (u !== unders[i]) { unders[i] = u; s.style.setProperty("--under", u.toFixed(3)); }
    });
  }

  var tick = null;
  window.addEventListener("scroll", function () {
    if (tick) return;
    tick = requestAnimationFrame(function () { tick = null; update(); });
  }, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  // Content height changes (fonts arriving, the full letter opening) move
  // every sheet after it, so re-measure whenever any sheet changes size.
  if ("ResizeObserver" in window) {
    var ro = new ResizeObserver(function () { measure(); });
    sheets.forEach(function (s) { ro.observe(s); });
  }
  measure();

  return {
    flowTop: function (el) {
      var i = sheets.indexOf(el);
      return i >= 0 ? paperTop() + offs[i] : el.getBoundingClientRect().top + (window.scrollY || 0);
    }
  };
})();

// ---- the top nav bar --------------------------------------------------------
(function () {
  var bar = document.querySelector(".bar");
  var nav = document.querySelector(".bar__nav");
  var menuBtn = document.querySelector(".bar__menu");
  if (!bar || !nav) return;

  var worldRoot = document.querySelector('[data-sc-mode="worldflight"]');
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var behavior = reduceMotion ? "auto" : "smooth";

  // -- compact mode: menu button instead of a row of labels -----------------
  // Measured, not a fixed breakpoint: the row is shown whenever every label
  // fits on one line in the current language, and swapped for the
  // three-line button whenever it doesn't (and always on phone widths).
  function fit() {
    var wasOpen = bar.classList.contains("is-open");
    bar.classList.remove("bar--compact");
    var compact = window.innerWidth <= 900 || nav.scrollWidth > nav.clientWidth + 1;
    bar.classList.toggle("bar--compact", compact);
    if (!compact && wasOpen) setOpen(false);
  }

  function setOpen(open) {
    bar.classList.toggle("is-open", open);
    if (menuBtn) menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      setOpen(!bar.classList.contains("is-open"));
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && bar.classList.contains("is-open")) { setOpen(false); if (menuBtn) menuBtn.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (bar.classList.contains("is-open") && !bar.contains(e.target)) setOpen(false);
  });

  fit();
  document.addEventListener("sioufi:lang", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  var fitTick = null;
  window.addEventListener("resize", function () {
    if (fitTick) return;
    fitTick = requestAnimationFrame(function () { fitTick = null; fit(); });
  });

  // -- jumping to a section -------------------------------------------------
  // The four slides (#leg-welcome etc.) live inside [data-sc-world], which is
  // position:fixed, so the browser's own hash-jump has no document position
  // to scroll to. Each slide's place on the scroll track is worked out from
  // the same data-sc-w weights the engine reads, and the jump lands just
  // past the end of that slide's move-in: the slide is fully in place, and
  // because each slide carries its own text, so is its copy.
  function legTarget(seg) {
    var segs = Array.prototype.slice.call(worldRoot.querySelectorAll("[data-sc-segment]"));
    if (segs[0] === seg) return 0;
    var seam = parseFloat(worldRoot.getAttribute("data-sc-seam")) || 0.12;
    var worldTop = worldRoot.getBoundingClientRect().top + (window.scrollY || 0);
    var offset = 0;
    for (var i = 0; i < segs.length; i++) {
      if (segs[i] === seg) break;
      offset += parseFloat(segs[i].getAttribute("data-sc-w")) || 1.3;
    }
    return worldTop + (offset + seam / 2 + 0.05) * window.innerHeight;
  }

  // Sections below the slides: scroll so the section's top sits just under
  // the bar. Their position comes from the stack (above), not from
  // getBoundingClientRect: a section that is holding still while the next
  // one covers it is sticky, and its on-screen box is no longer where it
  // sits on the page. Done by hand rather than by following the link, so no
  // #section is left in the address bar (a refresh always opens Home).
  function flowTarget(el) {
    var barH = bar.getBoundingClientRect().height;
    return window.SioufiStack.flowTop(el) - barH + 1;
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      var el = id && document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      setOpen(false);
      var isLeg = worldRoot && worldRoot.contains(el) && el.hasAttribute("data-sc-segment");
      var top = isLeg ? legTarget(el) : flowTarget(el);
      window.scrollTo({ top: Math.max(0, top), behavior: behavior });
    });
  });

  // -- the letter's own "close" button ---------------------------------------
  // At the end of a long letter the "Read the full letter" button is far
  // above, so the letter carries a close button of its own. Closing brings
  // the reader back to the top of the testimonial, where the letter opened,
  // rather than leaving them wherever the shorter page now happens to put
  // them.
  var letter = document.querySelector(".letter");
  var closeBtn = letter && letter.querySelector(".letter__close");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      letter.open = false;
      var section = letter.closest("section");
      var summary = letter.querySelector("summary");
      var barH = bar.getBoundingClientRect().height;
      // The section is a sticky sheet, so its real page position comes from
      // the stack. The button's offset inside it is the difference of the
      // two on-screen boxes, which move together, so it holds even while
      // the sheet is stuck. (summary.offsetTop can't be used: browsers
      // measure it from the <details>, not the section.)
      var inner = summary.getBoundingClientRect().top - section.getBoundingClientRect().top;
      var top = window.SioufiStack.flowTop(section) + inner - barH - 24;
      // instant, not auto: the page sets scroll-behavior:smooth, and auto
      // would animate a jump of several screens.
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
      summary.focus({ preventScroll: true });
    });
  }

  // -- current-section highlight ---------------------------------------------
  var links = nav.querySelectorAll("a[href^='#']");

  function setCurrent(id) {
    links.forEach(function (l) {
      l.setAttribute("aria-current", l.getAttribute("href") === "#" + id ? "true" : "false");
    });
  }

  // Slides: the engine fires sc:waypoint with the slide's data-sc-waypoint
  // label as it becomes current. Map those labels to nav hrefs, and keep the
  // last one, because scrolling back up out of the sections into the final
  // slide fires no new waypoint.
  var slideId = "leg-welcome";
  var inSections = false;
  if (worldRoot) {
    worldRoot.addEventListener("sc:waypoint", function (e) {
      var label = e.detail && e.detail.label;
      if (!label) return;
      slideId = "leg-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (!inSections) { lastId = slideId; setCurrent(slideId); }
    });
  }

  // Sections: the current one is the last whose top has passed 40% of the
  // way down the screen. Worked out from page positions on scroll, not with
  // an IntersectionObserver: a held (sticky) section stays on screen,
  // covered, long after the reader has moved past it.
  var sections = Array.prototype.slice.call(document.querySelectorAll(".paper section[id]"));
  var lastId = null;
  function highlight() {
    if (!sections.length || !window.SioufiStack) return;
    var line = (window.scrollY || 0) + window.innerHeight * 0.4;
    var id = null;
    sections.forEach(function (s) { if (window.SioufiStack.flowTop(s) <= line) id = s.id; });
    inSections = !!id;
    id = id || slideId;
    if (id !== lastId) { lastId = id; setCurrent(id); }
  }
  var hlTick = null;
  window.addEventListener("scroll", function () {
    if (hlTick) return;
    hlTick = requestAnimationFrame(function () { hlTick = null; highlight(); });
  }, { passive: true });
  highlight();
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

// ---- analytics consent (Quebec Law 25) ------------------------------------
// Google Analytics is not on the page by default: it loads only once the
// reader clicks Accept in the notice, and the choice is remembered. The
// footer's "Cookie settings" reopens the notice; declining after accepting
// stops tracking and removes the _ga cookies.
(function () {
  var CONSENT_KEY = "sioufi-analytics-consent";
  var GA_ID = "G-RK56FDYPW7";
  var banner = document.getElementById("consent-banner");
  var loaded = false;

  function loadAnalytics() {
    window["ga-disable-" + GA_ID] = false;
    if (loaded) return;
    loaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
  }

  // _ga cookies may be set on the bare host or a parent domain; clear both.
  function disableAnalytics() {
    window["ga-disable-" + GA_ID] = true;
    var parts = location.hostname.split(".");
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name.indexOf("_ga") !== 0) return;
      var expire = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = expire;
      for (var i = 0; i < parts.length - 1; i++) {
        document.cookie = expire + "; domain=." + parts.slice(i).join(".");
      }
    });
  }

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
    if (value === "granted") loadAnalytics(); else disableAnalytics();
  }

  var consent = null;
  try { consent = localStorage.getItem(CONSENT_KEY); } catch (e) {}
  if (consent === "granted") loadAnalytics();
  if (!banner) return;
  if (!consent) banner.hidden = false;

  banner.querySelectorAll("[data-consent]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setConsent(btn.getAttribute("data-consent"));
      banner.hidden = true;
    });
  });
  document.querySelectorAll("[data-consent-open]").forEach(function (btn) {
    btn.addEventListener("click", function () { banner.hidden = false; });
  });
})();

// ---- mount the engine -------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  if (window.ScrollCraft) window.ScrollCraft.mount(document);
});
