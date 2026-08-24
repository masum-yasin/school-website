(function () {
  "use strict";

  if (window.AOS) {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: false,
      offset: 80,
      disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches
    });
  }

  var nav = document.getElementById("main-nav");
  var toggle = document.querySelector(".nav-toggle");
  var mq = window.matchMedia("(max-width: 899px)");

  function closeAllSubs() {
    document.querySelectorAll(".has-sub.is-open").forEach(function (item) {
      item.classList.remove("is-open");
      var btn = item.querySelector(".nav-sub-toggle");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  function setNavOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (!open) closeAllSubs();
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNavOpen(!nav.classList.contains("is-open"));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (mq.matches) setNavOpen(false);
      });
    });
  }

  document.querySelectorAll(".has-sub").forEach(function (item) {
    var btn = item.querySelector(".nav-sub-toggle");
    if (!btn) return;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var open = !item.classList.contains("is-open");
      if (mq.matches) {
        document.querySelectorAll(".has-sub.is-open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("is-open");
            var otherBtn = other.querySelector(".nav-sub-toggle");
            if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
          }
        });
      }
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    closeAllSubs();
    if (mq.matches) setNavOpen(false);
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".has-sub") || e.target.closest(".nav-toggle")) return;
    closeAllSubs();
  });

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", function (e) {
      if (!e.matches) setNavOpen(false);
    });
  }

  document.querySelectorAll(".accordion-item > button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (panel) panel.hidden = expanded;
    });
  });

  document.querySelectorAll("form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var note = form.querySelector(".form-note");
      if (note) {
        note.hidden = false;
        if (form.id === "admission-form") {
          note.textContent = "Thank you. Your application has been received. The admissions office will be in touch shortly.";
        } else if (form.id === "alumni-form") {
          note.textContent = "Welcome back. Your alumni registration has been recorded.";
        } else if (form.id === "enquiry-form") {
          note.textContent = "Thank you for writing to us. We will reply within two working days.";
        } else {
          note.textContent = "Thank you. We have received your message.";
        }
      }
      form.reset();
    });
  });

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  var heroPlayer = document.querySelector("[data-hero-player]");
  var dotsWrap = document.querySelector(".hero-dots");
  var playlist = [
    "assets/videos/hero-1.mp4",
    "assets/videos/hero-2.mp4",
    "assets/videos/hero-3.mp4",
    "assets/videos/hero-4.mp4",
    "assets/videos/hero-5.mp4",
    "assets/videos/hero-6.mp4"
  ];
  var index = 0;
  var switching = false;

  function playSafe(video) {
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll("button").forEach(function (d, i) {
      d.classList.toggle("is-active", i === index);
    });
  }

  function loadClip(next, autoplay) {
    if (!heroPlayer || !playlist.length || switching) return;
    var nextIndex = ((next % playlist.length) + playlist.length) % playlist.length;
    switching = true;
    index = nextIndex;
    updateDots();
    heroPlayer.src = playlist[index];
    heroPlayer.load();
    if (autoplay !== false) playSafe(heroPlayer);
    var unlock = function () {
      switching = false;
      heroPlayer.removeEventListener("loadeddata", unlock);
    };
    heroPlayer.addEventListener("loadeddata", unlock);
    window.setTimeout(function () {
      switching = false;
    }, 2500);
  }

  if (heroPlayer && playlist.length) {
    heroPlayer.loop = false;
    heroPlayer.removeAttribute("loop");
    heroPlayer.muted = true;
    heroPlayer.setAttribute("muted", "");
    heroPlayer.setAttribute("playsinline", "");

    if (dotsWrap) {
      playlist.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Campus video " + (i + 1));
        if (i === 0) b.classList.add("is-active");
        b.addEventListener("click", function () {
          if (i === index || switching) return;
          loadClip(i);
        });
        dotsWrap.appendChild(b);
      });
    }

    heroPlayer.addEventListener("ended", function () {
      if (switching) return;
      loadClip(index + 1);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) heroPlayer.pause();
      else playSafe(heroPlayer);
    });

    loadClip(0);
  }

  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var slides = root.querySelectorAll(".life-slide");
    if (!slides.length) return;

    var prev = root.querySelector("[data-carousel-prev]");
    var next = root.querySelector("[data-carousel-next]");
    var dotsWrap = root.querySelector("[data-carousel-dots]");
    var live = root.querySelector("[data-carousel-status]");
    var viewport = root.querySelector(".life-carousel-viewport");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var index = 0;
    var timer = null;

    function replayAos(slide) {
      if (!window.AOS || reduced) return;
      var els = slide.querySelectorAll("[data-aos]");
      els.forEach(function (el) {
        el.classList.remove("aos-animate");
      });
      window.requestAnimationFrame(function () {
        if (typeof AOS.refreshHard === "function") AOS.refreshHard();
        else AOS.refresh();
        els.forEach(function (el) {
          el.classList.add("aos-animate");
        });
      });
    }

    function go(n) {
      index = ((n % slides.length) + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var on = i === index;
        slide.classList.toggle("is-active", on);
        slide.setAttribute("aria-hidden", on ? "false" : "true");
      });
      if (dotsWrap) {
        dotsWrap.querySelectorAll("button").forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
          dot.setAttribute("aria-current", i === index ? "true" : "false");
        });
      }
      if (live) live.textContent = index + 1 + " / " + slides.length;
      replayAos(slides[index]);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function start() {
      if (reduced || slides.length < 2) return;
      stop();
      timer = window.setInterval(function () {
        go(index + 1);
      }, 2300);
    }

    if (dotsWrap) {
      slides.forEach(function (slide, i) {
        var title = slide.querySelector("h3");
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", title ? title.textContent : "Photo " + (i + 1));
        if (i === 0) dot.classList.add("is-active");
        dot.addEventListener("click", function () {
          go(i);
          start();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        go(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        go(index + 1);
        start();
      });
    }

    if (viewport) {
      viewport.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(index - 1);
          start();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          go(index + 1);
          start();
        }
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) start();
    });

    go(0);
    start();
  });

  document.querySelectorAll(".campus-carousel.carousel").forEach(function (el) {
    if (!window.bootstrap || !bootstrap.Carousel) return;
    var carousel = bootstrap.Carousel.getOrCreateInstance(el);
    var startX = 0;
    var deltaX = 0;
    var dragging = false;
    var active = null;

    function slideEl() {
      return el.querySelector(".carousel-item.active");
    }

    function clearShift() {
      if (active) {
        active.style.transition = "";
        active.style.transform = "";
      }
      active = null;
    }

    el.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      deltaX = 0;
      active = slideEl();
      el.classList.add("is-dragging");
      carousel.pause();
      e.preventDefault();
    });

    window.addEventListener("mousemove", function (e) {
      if (!dragging || !active) return;
      deltaX = e.clientX - startX;
      active.style.transition = "none";
      active.style.transform = "translateX(" + deltaX + "px)";
    });

    window.addEventListener("mouseup", function () {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      if (active) {
        active.style.transition = "transform 0.35s ease";
      }
      if (Math.abs(deltaX) > 50) {
        if (deltaX < 0) carousel.next();
        else carousel.prev();
      }
      window.setTimeout(clearShift, 40);
      carousel.cycle();
    });
  });
})();
