// Language toggle (EN/FR) + mobile nav — shared across all pages
(function () {
  var STORAGE_KEY = "sioufi-site-lang";

  function applyLang(lang) {
    var isFr = lang === "fr";
    document.body.classList.toggle("fr-active", isFr);
    document.documentElement.setAttribute("lang", isFr ? "fr" : "en");
    var buttons = document.querySelectorAll("[data-lang-btn]");
    buttons.forEach(function (btn) {
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
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-lang-btn"));
      });
    });

    var navToggle = document.querySelector(".nav-toggle");
    var navLinks = document.querySelector(".nav-links");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        navLinks.classList.toggle("open");
        navToggle.classList.toggle("active");
      });
      navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          navLinks.classList.remove("open");
          navToggle.classList.remove("active");
        });
      });
    }
  });
})();

// In-page section jump-nav — built from <section id data-nav="EN|FR">
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var navContainer = document.querySelector(".section-nav");
    if (!navContainer) return;

    var sections = Array.prototype.slice.call(document.querySelectorAll("section[id][data-nav]"));
    if (!sections.length) return;

    sections.forEach(function (sec) {
      var parts = (sec.getAttribute("data-nav") || "").split("|");
      var en = parts[0] || "";
      var fr = parts[1] || en;
      var a = document.createElement("a");
      a.href = "#" + sec.id;
      a.innerHTML =
        '<span class="dot"></span><span class="section-nav-label">' +
        '<span class="lang-en">' + en + '</span>' +
        '<span class="lang-fr">' + fr + '</span></span>';
      navContainer.appendChild(a);
    });

    var links = navContainer.querySelectorAll("a");
    function setCurrent(id) {
      links.forEach(function (l) {
        l.classList.toggle("is-current", l.getAttribute("href") === "#" + id);
      });
    }

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });
      sections.forEach(function (s) { obs.observe(s); });
    } else {
      setCurrent(sections[0].id);
    }

    function toggleVisibility() {
      navContainer.classList.toggle("is-active", (window.scrollY || 0) > 80);
    }
    document.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();
  });
})();

// Hero parallax — subtle depth on the portrait and goniometer as you scroll
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var photo = document.querySelector(".hero-photo");
    var dial = document.querySelector(".hero-goniometer");
    if (reduceMotion || (!photo && !dial)) return;

    var ticking = false;
    function update() {
      var y = window.scrollY || 0;
      if (photo) photo.style.transform = "translateY(" + Math.min(y * 0.08, 40) + "px)";
      if (dial) dial.style.transform = "translateY(" + Math.min(y * 0.14, 70) + "px) rotate(" + Math.min(y * 0.02, 6) + "deg)";
      ticking = false;
    }
    document.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  });
})();

// Reveal-on-scroll for elements marked .reveal
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
      observer.observe(el);
    });
  });
})();

// Scroll-progress dial — a miniature goniometer that sweeps as you read
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var dial = document.querySelector(".scroll-dial");
    if (!dial) return;
    var fill = dial.querySelector(".fill");
    if (!fill) return;

    var circumference = parseFloat(fill.getAttribute("data-circumference")) || 113;

    function update() {
      var doc = document.documentElement;
      var scrollTop = window.scrollY || doc.scrollTop;
      var max = (doc.scrollHeight - doc.clientHeight) || 1;
      var pct = Math.min(Math.max(scrollTop / max, 0), 1);
      fill.style.strokeDashoffset = String(circumference * (1 - pct));
      dial.classList.toggle("is-active", scrollTop > 240);
    }

    document.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });
})();
