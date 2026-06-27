/* =========================================================================
   Khanh Hoang (Marcus) — portfolio
   Progressive enhancement only: the page is fully usable without this file.
   ========================================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Theme toggle -------------------------------------------------- */
  var toggles = document.querySelectorAll("[data-theme-toggle]");

  function syncToggles(theme) {
    /* Stable name ("Dark theme") + aria-pressed carries the state: pressed = dark active. */
    toggles.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
    });
    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute("content", theme === "light" ? "#fbfbfa" : "#0d1117");
  }

  syncToggles(root.getAttribute("data-theme") || "dark");

  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* ignore */
      }
      syncToggles(next);
    });
  });

  /* ---- Footer year --------------------------------------------------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Scrollspy ----------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var sections = navLinks
    .map(function (link) {
      var id = (link.getAttribute("href") || "").replace("#", "");
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  var topbarNav = document.querySelector(".topbar__nav");

  function setActive(id) {
    navLinks.forEach(function (link) {
      var match = link.getAttribute("href") === "#" + id;
      if (!match) {
        link.removeAttribute("aria-current");
        return;
      }
      link.setAttribute("aria-current", "true");
      // keep the active item within view of the horizontally-scrollable mobile nav
      if (topbarNav && topbarNav.contains(link) && topbarNav.scrollWidth > topbarNav.clientWidth + 1) {
        var lr = link.getBoundingClientRect();
        var nr = topbarNav.getBoundingClientRect();
        if (lr.left < nr.left + 16) topbarNav.scrollLeft -= nr.left + 16 - lr.left;
        else if (lr.right > nr.right - 16) topbarNav.scrollLeft += lr.right - (nr.right - 16);
      }
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var visible = {};
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          // rank by how much of the section overlaps the detection band (pixels),
          // not intersectionRatio (which is relative to each section's own size)
          visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRect.height : 0;
        });
        var top = null;
        var best = 0;
        sections.forEach(function (sec) {
          var r = visible[sec.id] || 0;
          if (r > best) {
            best = r;
            top = sec.id;
          }
        });
        if (top) setActive(top);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach(function (sec) {
      spy.observe(sec);
    });
  }

  /* ---- Scroll progress + back-to-top --------------------------------- */
  var progressEl = document.querySelector("[data-scroll-progress]");
  var toTop = document.querySelector("[data-to-top]");
  if (toTop) toTop.hidden = false; /* JS controls visibility via .is-visible */
  var ticking = false;

  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = height > 0 ? Math.min(scrollTop / height, 1) : 0;
    if (progressEl) progressEl.style.setProperty("--progress", ratio.toFixed(4));
    if (toTop) toTop.classList.toggle("is-visible", scrollTop > window.innerHeight * 0.6);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  /* ---- Project filtering --------------------------------------------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var projects = Array.prototype.slice.call(document.querySelectorAll(".project"));
  var countEl = document.querySelector("[data-filter-count]");

  function applyFilter(value) {
    var shown = 0;
    projects.forEach(function (card) {
      var cats = (card.getAttribute("data-category") || "").split(/\s+/);
      var match = value === "all" || cats.indexOf(value) !== -1;
      card.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    if (countEl) {
      countEl.textContent =
        value === "all"
          ? shown + " projects"
          : shown + (shown === 1 ? " project" : " projects") + " in “" + value.replace("-", " ") + "”";
    }
  }

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      applyFilter(btn.getAttribute("data-filter"));
    });
  });
  if (countEl && projects.length) countEl.textContent = projects.length + " projects";

  /* ---- Show earlier roles -------------------------------------------- */
  var moreBtn = document.querySelector("[data-more-toggle]");
  var moreItems = Array.prototype.slice.call(document.querySelectorAll(".tl--more"));

  if (moreBtn && moreItems.length) {
    var label = moreBtn.querySelector("span") || moreBtn;
    moreBtn.addEventListener("click", function () {
      var expanded = moreBtn.getAttribute("aria-expanded") === "true";
      var next = !expanded;
      moreItems.forEach(function (item) {
        item.hidden = !next;
      });
      moreBtn.setAttribute("aria-expanded", String(next));
      label.textContent = next ? "Show fewer roles" : "Show earlier roles";
      if (!next) {
        moreBtn.scrollIntoView({ block: "nearest" });
      }
    });
  }

  /* ---- Copy email ---------------------------------------------------- */
  var copyBtn = document.querySelector("[data-copy-email]");
  var copyStatus = document.querySelector("[data-copy-status]");

  if (copyBtn) {
    var stateEl = copyBtn.querySelector(".copy-email__state");
    var revertTimer;

    function legacyCopy(text) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:absolute;left:-9999px;top:0";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch (e) {
        return false;
      }
    }

    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email") || "";

      // Non-destructive: never redirect on a transient clipboard failure.
      function flash(ok) {
        if (ok) {
          copyBtn.classList.add("is-copied");
          if (stateEl) stateEl.textContent = "Copied";
          if (copyStatus) copyStatus.textContent = "Email address copied to clipboard";
        } else if (copyStatus) {
          copyStatus.textContent = "Couldn't copy automatically — the address is " + email;
        }
        window.clearTimeout(revertTimer);
        revertTimer = window.setTimeout(function () {
          copyBtn.classList.remove("is-copied");
          if (stateEl) stateEl.textContent = "Copy";
          if (copyStatus) copyStatus.textContent = "";
        }, 2200);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(
          function () {
            flash(true);
          },
          function () {
            flash(legacyCopy(email));
          }
        );
      } else {
        flash(legacyCopy(email));
      }
    });
  }

  /* ---- Contact form (Web3Forms, with graceful fallbacks) ------------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var statusEl = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector("[data-form-submit]");
    var submitLabel = form.querySelector("[data-form-submit-label]");
    var keyInput = form.querySelector('[name="access_key"]');
    var accessKey = keyInput ? keyInput.value : "";
    var configured = accessKey && accessKey.indexOf("YOUR_") !== 0;
    var EMAIL = "hoangduykhanh21@gmail.com";

    function setStatus(msg, kind) {
      if (!statusEl) return;
      statusEl.textContent = msg || "";
      statusEl.className = "form__status" + (kind ? " form__status--" + kind : "");
    }

    function composeMailto() {
      var name = (form.querySelector("#cf-name") || {}).value || "";
      var email = (form.querySelector("#cf-email") || {}).value || "";
      var message = (form.querySelector("#cf-message") || {}).value || "";
      var subject = "Portfolio enquiry from " + name;
      var body = message + "\n\n— " + name + " (" + email + ")";
      window.location.href =
        "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Not configured yet -> fall back to the visitor's email client.
      if (!configured) {
        setStatus("Opening your email app…", "");
        composeMailto();
        return;
      }

      setStatus("Sending…", "sending");
      if (submitBtn) submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = "Sending…";

      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      })
        .then(function (res) {
          return res.json().then(
            function (data) {
              return { ok: res.ok, data: data };
            },
            function () {
              return { ok: res.ok, data: {} };
            }
          );
        })
        .then(function (r) {
          if (r.ok && r.data && r.data.success) {
            form.reset();
            setStatus("Thanks! Your message has been sent — I'll reply soon.", "ok");
          } else {
            setStatus("Sorry, that didn't go through. Please email " + EMAIL + " directly.", "error");
          }
        })
        .catch(function () {
          setStatus("Network error. Please email " + EMAIL + " directly.", "error");
        })
        .then(function () {
          if (submitBtn) submitBtn.disabled = false;
          if (submitLabel) submitLabel.textContent = "Send message";
        });
    });
  }

  /* ---- Scroll reveal (motion only) ----------------------------------- */
  if (!prefersReduced && "IntersectionObserver" in window) {
    root.classList.add("js-reveal");
    var targets = document.querySelectorAll(
      ".section > .eyebrow, .lead, .prose, .stats, .services, .skills-cluster, .tl, .edu, .filters, .projects, .contact-grid, .form"
    );
    targets.forEach(function (el) {
      el.classList.add("reveal");
    });
    var revealObs = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    targets.forEach(function (el) {
      revealObs.observe(el);
    });
  }

  /* ---- Count-up stats ------------------------------------------------ */
  var nums = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  if (nums.length && "IntersectionObserver" in window && !prefersReduced) {
    var countObs = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          obs.unobserve(el);
          var target = parseInt(el.getAttribute("data-count"), 10) || 0;
          var suffix = el.getAttribute("data-suffix") || "";
          var start = null;
          var duration = 1100;
          function step(ts) {
            if (start === null) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (p < 1) window.requestAnimationFrame(step);
            else el.textContent = target + suffix;
          }
          window.requestAnimationFrame(step);
        });
      },
      { threshold: 0.4 }
    );
    nums.forEach(function (el) {
      countObs.observe(el);
    });
  }
})();
