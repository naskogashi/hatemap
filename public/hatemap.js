/*
 * HateMap: small progressive enhancement for the server-rendered SVG map.
 * Without JavaScript everything still works (links + GET form).
 * With it: hover tooltips, zoom buttons, drag to pan, instant filters.
 */
(function () {
  "use strict";

  function init() {
    var svg = document.getElementById("hm-svg");
    var stage = document.getElementById("hm-stage");
    var tip = document.getElementById("hm-tip");
    if (svg && stage) setupMap(svg, stage, tip);
    setupFilters();
    setupPicker();
  }

  /* Report form: click a municipality on the map to fill the select (and vice versa) */
  function setupPicker() {
    var map = document.getElementById("hm-picker");
    var select = document.getElementById("hm-pick-select");
    var nameEl = document.getElementById("hm-pick-name");
    if (!map || !select) return;
    function mark(key) {
      Array.prototype.forEach.call(map.querySelectorAll("[data-pick]"), function (p) {
        p.classList.toggle("is-selected", p.getAttribute("data-pick") === key);
      });
      var opt = select.querySelector('option[value="' + key + '"]');
      if (nameEl) nameEl.textContent = key && key !== "unknown" && opt ? "✓ " + opt.textContent : "";
    }
    map.addEventListener("click", function (e) {
      var p = e.target.closest ? e.target.closest("[data-pick]") : null;
      if (!p) return;
      select.value = p.getAttribute("data-pick");
      mark(select.value);
    });
    select.addEventListener("change", function () { mark(select.value); });
    mark(select.value);
  }

  function setupMap(svg, stage, tip) {
    var base = svg.getAttribute("data-viewbox").split(" ").map(Number);
    var vb = base.slice();
    function apply() { svg.setAttribute("viewBox", vb.join(" ")); }

    /* Tooltip: name + count, follows the pointer */
    var labels = {};
    Array.prototype.forEach.call(svg.querySelectorAll(".hm-muni"), function (a) {
      labels[a.getAttribute("data-k")] = a.getAttribute("aria-label");
    });
    svg.addEventListener("pointermove", function (e) {
      var a = e.target.closest ? e.target.closest("[data-k]") : null;
      if (!a || !tip) { if (tip) tip.hidden = true; return; }
      tip.textContent = labels[a.getAttribute("data-k")] || "";
      tip.hidden = false;
      var r = stage.getBoundingClientRect();
      var x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
      tip.style.left = Math.min(x, r.width - tip.offsetWidth - 8) + "px";
      tip.style.top = Math.min(y, r.height - tip.offsetHeight - 8) + "px";
    });
    svg.addEventListener("pointerleave", function () { if (tip) tip.hidden = true; });
    // Native <title> tooltips would duplicate ours once JS runs.
    Array.prototype.forEach.call(svg.querySelectorAll("title"), function (t) { t.parentNode.removeChild(t); });

    /* Zoom around a point (in SVG coordinates) */
    function clamp() {
      vb[0] = Math.max(base[0], Math.min(vb[0], base[0] + base[2] - vb[2]));
      vb[1] = Math.max(base[1], Math.min(vb[1], base[1] + base[3] - vb[3]));
    }
    function zoom(factor, cx, cy) {
      var w = vb[2] * factor, h = vb[3] * factor;
      if (w >= base[2]) { vb = base.slice(); apply(); return; }
      if (w < base[2] / 6) return;
      if (cx == null) { cx = vb[0] + vb[2] / 2; cy = vb[1] + vb[3] / 2; }
      vb = [cx - (cx - vb[0]) * factor, cy - (cy - vb[1]) * factor, w, h];
      clamp();
      apply();
    }
    function toSvg(clientX, clientY) {
      var r = svg.getBoundingClientRect();
      return [vb[0] + ((clientX - r.left) / r.width) * vb[2], vb[1] + ((clientY - r.top) / r.height) * vb[3]];
    }

    var controls = document.querySelector("[data-hm-controls]");
    if (controls) controls.hidden = false;
    document.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-hm]") : null;
      if (!b) return;
      var what = b.getAttribute("data-hm");
      if (what === "in") zoom(0.7);
      else if (what === "out") zoom(1 / 0.7);
      else { vb = base.slice(); apply(); }
    });
    svg.addEventListener("dblclick", function (e) {
      e.preventDefault();
      var p = toSvg(e.clientX, e.clientY);
      zoom(0.6, p[0], p[1]);
    });

    /* Drag to pan (only when zoomed in); a real drag suppresses the click */
    var drag = null, moved = false;
    svg.addEventListener("pointerdown", function (e) {
      if (vb[2] >= base[2]) return;
      drag = { x: e.clientX, y: e.clientY, vb: vb.slice() };
      moved = false;
    });
    window.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var r = svg.getBoundingClientRect();
      var dx = ((e.clientX - drag.x) / r.width) * vb[2];
      var dy = ((e.clientY - drag.y) / r.height) * vb[3];
      if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) { moved = true; stage.classList.add("is-dragging"); }
      vb[0] = drag.vb[0] - dx;
      vb[1] = drag.vb[1] - dy;
      clamp();
      apply();
    });
    window.addEventListener("pointerup", function () {
      drag = null;
      stage.classList.remove("is-dragging");
    });
    svg.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); moved = false; }
    }, true);
  }

  /* Filters apply instantly when a select or the switch changes */
  function setupFilters() {
    var form = document.querySelector("[data-hm-filters]");
    if (!form) return;
    Array.prototype.forEach.call(form.querySelectorAll("[data-autosubmit]"), function (el) {
      el.addEventListener("change", function () { form.requestSubmit ? form.requestSubmit() : form.submit(); });
    });
    // Empty fields are left out of the URL to keep links short and shareable.
    form.addEventListener("submit", function () {
      Array.prototype.forEach.call(form.elements, function (el) {
        if (el.name && !el.value && el.type !== "checkbox") el.disabled = true;
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
