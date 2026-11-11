/*
 * HateMap: progressive enhancement for the server-rendered map page.
 * Without JavaScript everything still works (links + GET form + full page loads).
 * With it:
 *   - filters, year tabs, map clicks and category bars update the page in place
 *     (no reload, no jump to the top; back/forward work, URLs stay shareable)
 *   - animated zoom (buttons, double-click, ctrl/⌘ + wheel, trackpad pinch, touch pinch when zoomed)
 *   - selecting a municipality glides the map to it; clearing it glides back
 *   - drag to pan when zoomed, hover tooltips
 */
(function () {
  "use strict";

  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var map = null; // controller for the map currently on the page
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };
  var byId = function (id) { return document.getElementById(id); };

  function init() {
    var svg = byId("hm-svg");
    var stage = byId("hm-stage");
    map = svg && stage ? createMap(svg, stage, byId("hm-tip")) : null;
    setupFilters();
    setupPicker();
  }

  /* ───────────── Report form: click a municipality on the map to fill the select (and vice versa) ───────────── */
  function setupPicker() {
    var picker = byId("hm-picker");
    var select = byId("hm-pick-select");
    var nameEl = byId("hm-pick-name");
    if (!picker || !select) return;
    function mark(key) {
      each(picker.querySelectorAll("[data-pick]"), function (p) {
        p.classList.toggle("is-selected", p.getAttribute("data-pick") === key);
      });
      each(picker.querySelectorAll("[data-label]"), function (l) {
        l.classList.toggle("is-selected", l.getAttribute("data-label") === key);
      });
      var opt = select.querySelector('option[value="' + key + '"]');
      if (nameEl) nameEl.textContent = key && key !== "unknown" && opt ? "✓ " + opt.textContent : "";
    }
    var homeBtn = document.querySelector("[data-hm-pick-home]");
    var view = picker.getAttribute("data-viewbox")
      ? createView(picker, function (z) { if (homeBtn) homeBtn.hidden = !z; })
      : null;
    function frame(key) {
      if (!view) return;
      var p = key && key !== "unknown" ? picker.querySelector('[data-pick="' + key + '"]') : null;
      if (p) view.focusEl(p); else view.home();
    }
    picker.addEventListener("click", function (e) {
      var p = e.target.closest ? e.target.closest("[data-pick]") : null;
      if (!p) return;
      select.value = p.getAttribute("data-pick");
      mark(select.value);
      frame(select.value);
    });
    picker.addEventListener("dblclick", function (e) { e.preventDefault(); });
    select.addEventListener("change", function () { mark(select.value); frame(select.value); });
    if (homeBtn) homeBtn.addEventListener("click", function () { if (view) view.home(); });
    mark(select.value);
    if (select.value) frame(select.value);
  }

  /* ───────────── Animated viewBox (shared by the map and the report picker) ───────────── */
  function createView(svg, onApply) {
    var base = svg.getAttribute("data-viewbox").split(" ").map(Number);
    var aspect = base[3] / base[2];
    var vb = base.slice();
    var anim = 0;
    function clamp(v) {
      var w = Math.min(base[2], Math.max(base[2] / 6, v[2]));
      var h = w * aspect;
      var x = Math.max(base[0], Math.min(v[0], base[0] + base[2] - w));
      var y = Math.max(base[1], Math.min(v[1], base[1] + base[3] - h));
      return [x, y, w, h];
    }
    function apply() {
      svg.setAttribute("viewBox", vb.join(" "));
      if (onApply) onApply(vb[2] < base[2] - 0.5);
    }
    function set(v) { cancelAnimationFrame(anim); vb = clamp(v); apply(); }
    function animateTo(target, ms) {
      target = clamp(target);
      cancelAnimationFrame(anim);
      if (reduceMotion) { vb = target; apply(); return; }
      var from = vb.slice();
      var t0 = performance.now();
      var dur = ms || 420;
      (function step(now) {
        var k = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3); // ease-out cubic
        vb = from.map(function (f, i) { return f + (target[i] - f) * e; });
        apply();
        if (k < 1) anim = requestAnimationFrame(step);
      })(t0);
    }
    function zoomBy(factor, cx, cy, animate) {
      if (cx == null) { cx = vb[0] + vb[2] / 2; cy = vb[1] + vb[3] / 2; }
      var w = vb[2] * factor;
      var target = [cx - (cx - vb[0]) * factor, cy - (cy - vb[1]) * factor, w, w * aspect];
      if (w >= base[2]) target = base.slice();
      if (animate) animateTo(target, 280); else set(target);
    }
    function home() { animateTo(base.slice()); }
    function focusEl(shape) {
      if (!shape || !shape.getBBox) { home(); return; }
      var b = shape.getBBox();
      var w = Math.max(b.width * 2.4, (b.height * 2.4) / aspect, base[2] / 4);
      var h = w * aspect;
      animateTo([b.x + b.width / 2 - w / 2, b.y + b.height / 2 - h / 2, w, h], 650);
    }
    function toSvg(clientX, clientY) {
      var r = svg.getBoundingClientRect();
      return [vb[0] + ((clientX - r.left) / r.width) * vb[2], vb[1] + ((clientY - r.top) / r.height) * vb[3]];
    }
    return {
      base: base, aspect: aspect,
      get vb() { return vb.slice(); },
      zoomed: function () { return vb[2] < base[2] - 0.5; },
      stop: function () { cancelAnimationFrame(anim); },
      set: set, animateTo: animateTo, zoomBy: zoomBy, home: home, focusEl: focusEl, toSvg: toSvg,
    };
  }

  /* ───────────── Map ───────────── */
  function createMap(svg, stage, tip) {
    var view = createView(svg, function (z) { stage.classList.toggle("is-zoomed", z); });
    var base = view.base, aspect = view.aspect;
    var set = view.set, zoomBy = view.zoomBy, home = view.home, toSvg = view.toSvg;
    function focus(key) { view.focusEl(key ? svg.querySelector('.hm-muni[data-k="' + key + '"] path') : null); }

    /* Tooltip: name + count, follows the pointer */
    var labels = {};
    each(svg.querySelectorAll(".hm-muni"), function (a) { labels[a.getAttribute("data-k")] = a.getAttribute("aria-label"); });
    svg.addEventListener("pointermove", function (e) {
      if (!tip) return;
      var a = e.pointerType === "mouse" && e.target.closest ? e.target.closest("[data-k]") : null;
      if (!a || drag) { tip.hidden = true; return; }
      tip.textContent = labels[a.getAttribute("data-k")] || "";
      tip.hidden = false;
      var r = stage.getBoundingClientRect();
      var x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
      tip.style.left = Math.min(x, r.width - tip.offsetWidth - 8) + "px";
      tip.style.top = Math.min(y, r.height - tip.offsetHeight - 8) + "px";
    });
    svg.addEventListener("pointerleave", function () { if (tip) tip.hidden = true; });
    // Native <title> tooltips would duplicate ours once JS runs.
    each(svg.querySelectorAll("title"), function (t) { t.parentNode.removeChild(t); });

    /* Bubbles light up their municipality too */
    svg.addEventListener("pointerover", function (e) {
      var b = e.target.closest ? e.target.closest(".hm-bubble") : null;
      each(svg.querySelectorAll(".hm-muni.is-hot"), function (m) { m.classList.remove("is-hot"); });
      if (b) {
        var m = svg.querySelector('.hm-muni[data-k="' + b.getAttribute("data-k") + '"]');
        if (m) m.classList.add("is-hot");
      }
    });

    var controls = document.querySelector("[data-hm-controls]");
    if (controls) controls.hidden = false;

    svg.addEventListener("dblclick", function (e) {
      e.preventDefault();
      var p = toSvg(e.clientX, e.clientY);
      zoomBy(0.55, p[0], p[1], true);
    });
    // ctrl/⌘ + wheel, and trackpad pinch (which browsers report as ctrl + wheel). A plain wheel still scrolls the page.
    svg.addEventListener("wheel", function (e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      var p = toSvg(e.clientX, e.clientY);
      zoomBy(Math.exp(Math.max(-60, Math.min(60, e.deltaY)) * 0.006), p[0], p[1], false);
    }, { passive: false });

    /* Pointers: one = drag to pan (when zoomed), two = pinch (when zoomed: touch-action is none then) */
    var pts = {};
    var drag = null, pinch = null, moved = false;
    function count() { return Object.keys(pts).length; }
    svg.addEventListener("pointerdown", function (e) {
      pts[e.pointerId] = [e.clientX, e.clientY];
      moved = false;
      if (!view.zoomed()) return;
      view.stop();
      var vb = view.vb;
      if (count() === 2) {
        var p = Object.keys(pts).map(function (k) { return pts[k]; });
        var mid = toSvg((p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2);
        pinch = { d: Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]) || 1, vb: vb, mid: mid };
        drag = null;
      } else if (count() === 1) {
        drag = { x: e.clientX, y: e.clientY, vb: vb };
      }
    });
    function onMove(e) {
      if (!(e.pointerId in pts)) return;
      pts[e.pointerId] = [e.clientX, e.clientY];
      if (pinch && count() === 2) {
        var p = Object.keys(pts).map(function (k) { return pts[k]; });
        var f = pinch.d / (Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]) || 1);
        var w = pinch.vb[2] * f;
        moved = true;
        set([pinch.mid[0] - (pinch.mid[0] - pinch.vb[0]) * f, pinch.mid[1] - (pinch.mid[1] - pinch.vb[1]) * f, w, w * aspect]);
        return;
      }
      if (!drag) return;
      var r = svg.getBoundingClientRect();
      if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) { moved = true; stage.classList.add("is-dragging"); }
      if (!moved) return;
      var vb = view.vb;
      set([drag.vb[0] - ((e.clientX - drag.x) / r.width) * vb[2], drag.vb[1] - ((e.clientY - drag.y) / r.height) * vb[3], vb[2], vb[3]]);
    }
    function onUp(e) {
      delete pts[e.pointerId];
      if (count() < 2) pinch = null;
      if (!count()) { drag = null; stage.classList.remove("is-dragging"); }
    }
    // A real drag or pinch must not also count as a click on a municipality.
    svg.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    return {
      svg: svg,
      get vb() { return view.vb; },
      set: set,
      home: home,
      focus: focus,
      zoomBy: zoomBy,
      onMove: onMove,
      onUp: onUp,
    };
  }

  /* ───────────── Filters ───────────── */
  function setupFilters() {
    var form = document.querySelector("[data-hm-filters]");
    if (!form) return;
    each(form.querySelectorAll("[data-autosubmit]"), function (el) {
      el.addEventListener("change", function () { form.requestSubmit ? form.requestSubmit() : form.submit(); });
    });
    // Without in-place updates (see below), still leave empty fields out of the URL.
    form.addEventListener("submit", function () {
      each(form.elements, function (el) {
        if (el.name && !el.value && el.type !== "checkbox") el.disabled = true;
      });
    });
  }

  function formUrl(form) {
    var params = new URLSearchParams();
    each(form.elements, function (el) {
      if (!el.name || el.disabled) return;
      if (el.type === "checkbox" && !el.checked) return;
      if (el.value) params.append(el.name, el.value);
    });
    var url = new URL(form.getAttribute("action") || location.pathname, location.href);
    url.search = params.toString();
    return url;
  }

  /* ───────────── In-place updates (no full reload) ───────────── */
  var seq = 0;
  function samePage(url) {
    var strip = function (p) { return p.replace(/\/+$/, ""); };
    return url.origin === location.origin && strip(url.pathname) === strip(location.pathname);
  }

  function go(url, push) {
    var dash = document.querySelector(".hm-dash");
    if (!dash || !window.fetch || !window.DOMParser) { location.assign(url.href); return; }
    var mine = ++seq;
    var prevVb = map ? map.vb : null;
    var prevMuni = new URL(location.href).searchParams.get("municipality") || "";
    var nextMuni = url.searchParams.get("municipality") || "";
    var active = document.activeElement;
    var refocus = active && dash.contains(active) ? (active.name ? '[name="' + active.name + '"]' : active.getAttribute("data-hm") ? '[data-hm="' + active.getAttribute("data-hm") + '"]' : null) : null;

    dash.classList.add("is-loading");
    dash.setAttribute("aria-busy", "true");
    if (push) history.pushState({ hm: 1 }, "", url.href);

    fetch(url.href, { headers: { Accept: "text/html" }, credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      })
      .then(function (html) {
        if (mine !== seq) return; // a newer request won
        var doc = new DOMParser().parseFromString(html, "text/html");
        var next = doc.querySelector(".hm-dash");
        if (!next) throw new Error("no .hm-dash");
        dash.innerHTML = next.innerHTML;
        if (doc.title) document.title = doc.title;
        init();
        if (map) {
          if (prevVb) map.set(prevVb); // keep the current zoom…
          if (nextMuni !== prevMuni) nextMuni ? map.focus(nextMuni) : map.home(); // …then glide to the new selection
        }
        if (refocus) {
          var el = dash.querySelector(refocus);
          if (el) el.focus({ preventScroll: true });
        }
      })
      .catch(function () {
        if (mine === seq) location.assign(url.href);
      })
      .then(function () {
        if (mine !== seq) return;
        dash.classList.remove("is-loading");
        dash.removeAttribute("aria-busy");
      });
  }

  function bindOnce() {
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented) return;
      // Zoom buttons
      var b = e.target.closest ? e.target.closest("[data-hm]") : null;
      if (b && map) {
        var what = b.getAttribute("data-hm");
        if (what === "in") map.zoomBy(0.65, null, null, true);
        else if (what === "out") map.zoomBy(1 / 0.65, null, null, true);
        else map.home();
        return;
      }
      // Links that only change the filters of this page
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || a.getAttribute("target") || a.hasAttribute("download") || !a.closest(".hm-dash")) return;
      var href = a.getAttribute("href") || a.getAttribute("xlink:href");
      if (!href || href.charAt(0) === "#") return;
      var url = new URL(href, location.href);
      if (!samePage(url) || url.hash) return;
      e.preventDefault();
      go(url, true);
    });
    document.addEventListener("submit", function (e) {
      var form = e.target;
      if (!form.matches || !form.matches("[data-hm-filters]")) return;
      e.preventDefault();
      go(formUrl(form), true);
    });
    window.addEventListener("popstate", function () {
      if (document.querySelector(".hm-dash")) go(new URL(location.href), false);
    });
    window.addEventListener("pointermove", function (e) { if (map) map.onMove(e); });
    window.addEventListener("pointerup", function (e) { if (map) map.onUp(e); });
    window.addEventListener("pointercancel", function (e) { if (map) map.onUp(e); });
  }

  function start() {
    bindOnce();
    init();
    // Arriving on a link with a municipality already selected: frame it.
    var m = new URL(location.href).searchParams.get("municipality");
    if (map && m) map.focus(m);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
