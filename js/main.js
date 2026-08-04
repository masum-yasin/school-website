/**
 * CMA — Glenrich-style interactions
 */
(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");

  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        nav.querySelectorAll(".has-dropdown.is-open").forEach((el) => {
          el.classList.remove("is-open");
          const caret = el.querySelector(".nav-caret");
          if (caret) caret.setAttribute("aria-expanded", "false");
        });
      });
    });
  }

  // Academics (and future) dropdowns
  document.querySelectorAll(".has-dropdown").forEach((item) => {
    const caret = item.querySelector(".nav-caret");
    if (!caret) return;
    caret.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = item.classList.toggle("is-open");
      caret.setAttribute("aria-expanded", open ? "true" : "false");
      document.querySelectorAll(".has-dropdown.is-open").forEach((other) => {
        if (other !== item) {
          other.classList.remove("is-open");
          const c = other.querySelector(".nav-caret");
          if (c) c.setAttribute("aria-expanded", "false");
        }
      });
    });
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".has-dropdown")) return;
    document.querySelectorAll(".has-dropdown.is-open").forEach((el) => {
      el.classList.remove("is-open");
      const caret = el.querySelector(".nav-caret");
      if (caret) caret.setAttribute("aria-expanded", "false");
    });
  });

  // Hero video playlist: single player swaps sources so every clip actually plays
  const heroPlayer = document.querySelector("[data-hero-player]");
  const dotsWrap = document.querySelector(".hero-dots");
  const playlist = [
    "assets/videos/hero-1.mp4",
    "assets/videos/hero-2.mp4",
    "assets/videos/hero-3.mp4",
    "assets/videos/hero-4.mp4",
    "assets/videos/hero-5.mp4",
    "assets/videos/hero-6.mp4",
  ];
  let index = 0;
  let switching = false;

  const playSafe = (video) => {
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  };

  const updateDots = () => {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll("button").forEach((d, i) => {
      d.classList.toggle("is-active", i === index);
    });
  };

  const loadClip = (next, { autoplay = true } = {}) => {
    if (!heroPlayer || !playlist.length || switching) return;
    const nextIndex = ((next % playlist.length) + playlist.length) % playlist.length;
    switching = true;
    index = nextIndex;
    updateDots();
    heroPlayer.src = playlist[index];
    heroPlayer.load();
    if (autoplay) playSafe(heroPlayer);
    // unlock after metadata so ended/next clicks work again
    const unlock = () => {
      switching = false;
      heroPlayer.removeEventListener("loadeddata", unlock);
    };
    heroPlayer.addEventListener("loadeddata", unlock);
    // safety unlock if load stalls
    window.setTimeout(() => {
      switching = false;
    }, 2500);
  };

  if (heroPlayer && playlist.length) {
    heroPlayer.loop = false;
    heroPlayer.removeAttribute("loop");
    heroPlayer.muted = true;
    heroPlayer.setAttribute("muted", "");
    heroPlayer.setAttribute("playsinline", "");

    if (dotsWrap) {
      playlist.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Video " + (i + 1));
        if (i === 0) b.classList.add("is-active");
        b.addEventListener("click", () => {
          if (i === index || switching) return;
          loadClip(i);
        });
        dotsWrap.appendChild(b);
      });
    }

    heroPlayer.addEventListener("ended", () => {
      if (switching) return;
      loadClip(index + 1);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) heroPlayer.pause();
      else playSafe(heroPlayer);
    });

    loadClip(0);
  }

  // Reveal on scroll
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // Counters
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = parseFloat(el.getAttribute("data-count"));
    const suffix = el.getAttribute("data-suffix") || "";
    const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent =
        (decimals ? val.toFixed(decimals) : Math.round(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  document.querySelectorAll("form[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = form.querySelector(".form-note");
      if (note) {
        note.hidden = false;
        note.textContent = "Thank you. Our admission team will contact you shortly.";
      }
      form.reset();
    });
  });

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // Drag-to-scroll carousels (Glenrich-style)
  document.querySelectorAll("[data-drag-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".drag-track");
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let currentX = 0;
    let x = 0;
    let minX = 0;
    let moved = false;

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    const measure = () => {
      const overflow = track.scrollWidth - carousel.clientWidth;
      minX = overflow > 0 ? -overflow : 0;
      x = clamp(x, minX, 0);
      track.style.transform = "translate3d(" + x + "px,0,0)";
    };

    measure();
    window.addEventListener("resize", measure);

    const onDown = (clientX) => {
      isDown = true;
      moved = false;
      startX = clientX;
      currentX = x;
      carousel.classList.add("is-dragging");
    };

    const onMove = (clientX) => {
      if (!isDown) return;
      const dx = clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      x = clamp(currentX + dx, minX, 0);
      track.style.transform = "translate3d(" + x + "px,0,0)";
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      carousel.classList.remove("is-dragging");
    };

    carousel.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      onDown(e.clientX);
    });
    window.addEventListener("mousemove", (e) => onMove(e.clientX));
    window.addEventListener("mouseup", onUp);

    carousel.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches[0]) return;
        onDown(e.touches[0].clientX);
      },
      { passive: true }
    );
    carousel.addEventListener(
      "touchmove",
      (e) => {
        if (!e.touches[0] || !isDown) return;
        onMove(e.touches[0].clientX);
      },
      { passive: true }
    );
    carousel.addEventListener("touchend", onUp);
    carousel.addEventListener("touchcancel", onUp);

    // Block accidental link clicks after a drag swipe
    carousel.addEventListener(
      "click",
      (e) => {
        if (!moved) return;
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      },
      true
    );

    // Wheel horizontal support when hovering carousel
    carousel.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          x = clamp(x - e.deltaY, minX, 0);
          track.style.transform = "translate3d(" + x + "px,0,0)";
        }
      },
      { passive: false }
    );
  });

  // Class / Exam routine tabs
  document.querySelectorAll(".routine-tabs").forEach((tabs) => {
    const root = tabs.closest(".academic-main") || document;
    tabs.querySelectorAll("button[data-routine-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-routine-tab");
        tabs.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b === btn));
        root.querySelectorAll("[data-routine-panel]").forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute("data-routine-panel") === id);
        });
      });
    });
  });
})();
