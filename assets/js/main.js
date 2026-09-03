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
    var hovered = false;

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
      if (hovered || reduced || slides.length < 2) return;
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

    root.addEventListener("mouseenter", function () {
      hovered = true;
      stop();
    });
    root.addEventListener("mouseleave", function () {
      hovered = false;
      start();
    });
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) start();
    });

    go(0);
    start();
  });

  document.querySelectorAll("[data-campus-highlights]").forEach(function (root) {
    var texts = root.querySelectorAll("[data-campus-text] .campus-hl-panel");
    var images = root.querySelectorAll("[data-campus-media] .campus-hl-frame");
    var textCard = root.querySelector("[data-campus-text]");
    if (!texts.length || texts.length !== images.length) return;

    var prevBtn = root.querySelector("[data-campus-prev]");
    var nextBtn = root.querySelector("[data-campus-next]");
    var index = 0;
    var timer = null;
    var interval = 5000;
    var hovered = false;

    function show(next) {
      var i = ((next % texts.length) + texts.length) % texts.length;
      if (i === index) return;
      texts[index].classList.remove("is-active");
      images[index].classList.remove("is-active");
      images[index].classList.add("is-leaving");
      index = i;
      texts[index].classList.add("is-active");
      images[index].classList.add("is-active");
      if (textCard) {
        textCard.classList.remove("is-rising");
        void textCard.offsetWidth;
        textCard.classList.add("is-rising");
      }
      window.setTimeout(function () {
        images.forEach(function (frame, n) {
          if (n !== index) frame.classList.remove("is-leaving");
        });
      }, 950);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      if (hovered) return;
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, interval);
    }

    function go(step) {
      show(index + step);
      start();
    }

    window.requestAnimationFrame(function () {
      root.classList.add("is-ready");
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        go(-1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        go(1);
      });
    }

    root.addEventListener("mouseenter", function () {
      hovered = true;
      stop();
    });
    root.addEventListener("mouseleave", function () {
      hovered = false;
      start();
    });
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) start();
    });

    start();
  });

  document.querySelectorAll(".campus-carousel.carousel").forEach(function (el) {
    if (!window.bootstrap || !bootstrap.Carousel) return;
    var carousel = bootstrap.Carousel.getOrCreateInstance(el);
    var inner = el.querySelector(".carousel-inner");
    var startX = 0;
    var deltaX = 0;
    var dragging = false;
    var moved = false;
    var active = null;
    var peek = null;
    var width = 0;
    var raf = 0;

    function items() {
      return Array.prototype.slice.call(el.querySelectorAll(".carousel-item"));
    }

    function indexOfActive() {
      var all = items();
      var i = 0;
      for (; i < all.length; i++) {
        if (all[i].classList.contains("active")) return i;
      }
      return 0;
    }

    function itemAt(offset) {
      var all = items();
      var i = indexOfActive();
      return all[(i + offset + all.length) % all.length];
    }

    function resetItem(node) {
      if (!node) return;
      node.style.transition = "";
      node.style.transform = "";
      node.style.display = "";
    }

    function cleanup() {
      resetItem(active);
      resetItem(peek);
      items().forEach(resetItem);
      active = null;
      peek = null;
      el.classList.remove("is-dragging");
    }

    function paint() {
      raf = 0;
      if (!active || !width) return;
      active.style.transform = "translate3d(" + deltaX + "px,0,0)";
      if (peek) {
        var from = deltaX > 0 ? -width : width;
        peek.style.transform = "translate3d(" + (from + deltaX) + "px,0,0)";
      }
    }

    function setPeek() {
      if (!deltaX) return;
      var wanted = itemAt(deltaX > 0 ? -1 : 1);
      if (peek && peek !== wanted) {
        resetItem(peek);
        peek = null;
      }
      if (!peek && wanted && wanted !== active) {
        peek = wanted;
        peek.style.display = "block";
        peek.style.transition = "none";
        peek.style.transform = "translate3d(" + (deltaX > 0 ? -width : width) + "px,0,0)";
      }
    }

    function finish() {
      if (!dragging) return;
      dragging = false;
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }

      var threshold = Math.max(48, width * 0.12);
      var go = moved && peek && Math.abs(deltaX) > threshold;
      var goPrev = deltaX > 0;
      var ms = go ? 360 : 280;

      if (go) {
        if (active) {
          active.style.transition = "transform " + ms + "ms ease";
          active.style.transform = "translate3d(" + (goPrev ? width : -width) + "px,0,0)";
        }
        peek.style.transition = "transform " + ms + "ms ease";
        peek.style.transform = "translate3d(0,0,0)";
        window.setTimeout(function () {
          el.classList.remove("slide");
          if (goPrev) carousel.prev();
          else carousel.next();
          cleanup();
          el.classList.add("slide");
          carousel.cycle();
        }, ms);
      } else {
        if (active) {
          active.style.transition = "transform " + ms + "ms ease";
          active.style.transform = "translate3d(0,0,0)";
        }
        if (peek) {
          peek.style.transition = "transform " + ms + "ms ease";
          peek.style.transform = "translate3d(" + (deltaX > 0 ? -width : width) + "px,0,0)";
        }
        window.setTimeout(function () {
          cleanup();
          carousel.cycle();
        }, ms);
      }
      moved = false;
    }

    el.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (e.target.closest("a, button")) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      deltaX = 0;
      active = itemAt(0);
      peek = null;
      width = inner ? inner.getBoundingClientRect().width : el.getBoundingClientRect().width;
      el.classList.add("is-dragging");
      carousel.pause();
      try {
        el.setPointerCapture(e.pointerId);
      } catch (err) {}
      if (active) active.style.transition = "none";
    });

    el.addEventListener("pointermove", function (e) {
      if (!dragging || !active) return;
      deltaX = e.clientX - startX;
      if (!moved && Math.abs(deltaX) < 8) return;
      moved = true;
      e.preventDefault();
      setPeek();
      if (!raf) raf = window.requestAnimationFrame(paint);
    });

    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", finish);
    el.addEventListener("lostpointercapture", function () {
      if (dragging) finish();
    });
  });

  (function initSchoolCalendar() {
    var root = document.querySelector("[data-school-calendar]");
    var dataEl = document.getElementById("cma-event-data");
    if (!root || !dataEl) return;

    var events = [];
    try {
      events = JSON.parse(dataEl.textContent);
    } catch (err) {
      events = [];
    }

    var grid = root.querySelector("[data-cal-grid]");
    var label = root.querySelector("[data-cal-label]");
    var asideTitle = root.querySelector("[data-cal-aside-title]");
    var asideList = root.querySelector("[data-cal-aside-list]");
    var monthList = root.querySelector("[data-cal-month-list]");
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var now = new Date();
    var viewY = now.getFullYear();
    var viewM = now.getMonth();
    var selected = isoDate(now);
    var filter = "all";

    function pad(n) {
      return n < 10 ? "0" + n : String(n);
    }

    function isoDate(d) {
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    function parseIso(iso) {
      var p = iso.split("-");
      return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    }

    function matchesFilter(ev) {
      return filter === "all" || ev.cat === filter;
    }

    function eventsOn(iso) {
      return events.filter(function (ev) {
        return ev.date === iso && matchesFilter(ev);
      });
    }

    function eventCard(ev) {
      var article = document.createElement("article");
      article.className = "cal-event cal-event--" + ev.cat;
      article.innerHTML = "<h4></h4><p class=\"cal-event-when\"></p><p></p>";
      article.querySelector("h4").textContent = ev.title;
      article.querySelector(".cal-event-when").textContent = ev.when;
      article.querySelector("p:last-child").textContent = ev.detail;
      return article;
    }

    function fillList(holder, list, emptyText) {
      holder.innerHTML = "";
      if (!list.length) {
        var p = document.createElement("p");
        p.className = "cal-empty";
        p.textContent = emptyText;
        holder.appendChild(p);
        return;
      }
      list.forEach(function (ev) {
        holder.appendChild(eventCard(ev));
      });
    }

    function renderAside() {
      var day = parseIso(selected);
      asideTitle.textContent = day.getDate() + " " + months[day.getMonth()] + " " + day.getFullYear();
      fillList(asideList, eventsOn(selected), "No events on this day.");

      var prefix = viewY + "-" + pad(viewM + 1) + "-";
      var monthEvents = events.filter(function (ev) {
        return ev.date.indexOf(prefix) === 0 && matchesFilter(ev);
      }).sort(function (a, b) {
        return a.date < b.date ? -1 : 1;
      });
      fillList(monthList, monthEvents, "No events in this month for the selected filter.");
    }

    function render() {
      label.textContent = months[viewM] + " " + viewY;
      grid.innerHTML = "";

      var first = new Date(viewY, viewM, 1);
      var start = first.getDay();
      var days = new Date(viewY, viewM + 1, 0).getDate();
      var prevDays = new Date(viewY, viewM, 0).getDate();
      var cells = [];
      var i;

      for (i = 0; i < start; i++) {
        cells.push({
          day: prevDays - start + 1 + i,
          month: viewM - 1,
          year: viewY,
          muted: true
        });
      }
      for (i = 1; i <= days; i++) {
        cells.push({ day: i, month: viewM, year: viewY, muted: false });
      }
      while (cells.length % 7 !== 0) {
        cells.push({
          day: cells.length - (start + days) + 1,
          month: viewM + 1,
          year: viewY,
          muted: true
        });
      }

      var todayIso = isoDate(now);
      cells.forEach(function (cell) {
        var m = cell.month;
        var y = cell.year;
        if (m < 0) {
          m = 11;
          y -= 1;
        }
        if (m > 11) {
          m = 0;
          y += 1;
        }
        var iso = y + "-" + pad(m + 1) + "-" + pad(cell.day);
        var dayEvents = eventsOn(iso);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cal-day";
        if (cell.muted) btn.classList.add("is-muted");
        if (iso === todayIso) btn.classList.add("is-today");
        if (iso === selected) btn.classList.add("is-selected");
        btn.setAttribute("aria-label", cell.day + " " + months[m] + " " + y + (dayEvents.length ? ", " + dayEvents.length + " event" + (dayEvents.length === 1 ? "" : "s") : ""));
        if (iso === selected) btn.setAttribute("aria-pressed", "true");

        var num = document.createElement("span");
        num.className = "cal-day-num";
        num.textContent = String(cell.day);
        btn.appendChild(num);

        var dots = document.createElement("span");
        dots.className = "cal-day-events";
        dayEvents.slice(0, 3).forEach(function (ev) {
          var dot = document.createElement("span");
          dot.className = "cal-dot cal-dot--" + ev.cat;
          dots.appendChild(dot);
        });
        btn.appendChild(dots);

        if (dayEvents[0]) {
          var title = document.createElement("span");
          title.className = "cal-day-title";
          title.textContent = dayEvents[0].title;
          btn.appendChild(title);
        }

        btn.addEventListener("click", function () {
          selected = iso;
          if (y !== viewY || m !== viewM) {
            viewY = y;
            viewM = m;
          }
          render();
        });
        grid.appendChild(btn);
      });

      renderAside();
    }

    root.querySelector("[data-cal-prev]").addEventListener("click", function () {
      viewM -= 1;
      if (viewM < 0) {
        viewM = 11;
        viewY -= 1;
      }
      selected = viewY + "-" + pad(viewM + 1) + "-01";
      render();
    });

    root.querySelector("[data-cal-next]").addEventListener("click", function () {
      viewM += 1;
      if (viewM > 11) {
        viewM = 0;
        viewY += 1;
      }
      selected = viewY + "-" + pad(viewM + 1) + "-01";
      render();
    });

    root.querySelector("[data-cal-today]").addEventListener("click", function () {
      viewY = now.getFullYear();
      viewM = now.getMonth();
      selected = isoDate(now);
      render();
    });

    root.querySelectorAll("[data-cal-filter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        filter = chip.getAttribute("data-cal-filter");
        root.querySelectorAll("[data-cal-filter]").forEach(function (other) {
          other.classList.toggle("is-on", other === chip);
        });
        render();
      });
    });

    render();
  })();
})();
