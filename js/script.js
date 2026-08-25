(function () {
  "use strict";

  function getPath(obj, path) {
    return path.split(".").reduce(function (o, k) {
      return o && o[k] !== undefined ? o[k] : undefined;
    }, obj);
  }

  function applyContent(content) {
    document.querySelectorAll("[data-text]").forEach(function (el) {
      var val = getPath(content, el.dataset.text);
      if (typeof val === "string") el.textContent = val;
    });
    document.querySelectorAll("[data-img]").forEach(function (el) {
      var val = getPath(content, el.dataset.img);
      if (typeof val === "string") el.src = val;
    });
  }

  // band members get their lightbox built from content.json + the shared <template>,
  // so bios/instrument/idole stay editable from /admin without touching markup.
  function buildBandDialogs(content) {
    var tpl = document.getElementById("band-dialog-template");
    var order = ["ricardo", "peter", "tina", "lucky", "selma", "tapas"];
    order.forEach(function (key) {
      var data = content.band && content.band[key];
      if (!data) return;
      var frag = tpl.content.cloneNode(true);
      var dialog = document.createElement("dialog");
      dialog.id = "dlg-" + key;
      dialog.className = "lightbox";
      dialog.appendChild(frag);

      var img = dialog.querySelector("img");
      img.src = (content.images && content.images.band && content.images.band[key]) || ("assets/band-" + key + ".png");
      img.alt = data.name || key;
      dialog.querySelector("h2").textContent = data.name || "";
      dialog.querySelector(".instrument").textContent = data.instrument || "";
      dialog.querySelector(".idole").textContent = data.idole || "";
      dialog.querySelector(".lb-bio").textContent = data.bio || "";
      document.body.appendChild(dialog);
    });
  }

  function wireDialogs() {
    document.querySelectorAll(".sticker[data-dialog]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dlg = document.getElementById(btn.dataset.dialog);
        if (dlg && typeof dlg.showModal === "function") dlg.showModal();
      });
    });
    document.querySelectorAll("dialog.lightbox").forEach(function (dlg) {
      dlg.addEventListener("click", function (e) {
        if (e.target === dlg) dlg.close();
      });
      dlg.querySelectorAll("[data-close]").forEach(function (btn) {
        btn.addEventListener("click", function () { dlg.close(); });
      });
    });
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // every titled clickable sticker: +10% scale, +2deg rotation on hover/focus,
  // via a paused GSAP timeline that simply reverses on mouseleave — same path, mirrored.
  function initHoverTilt() {
    if (reduceMotion || typeof gsap === "undefined") return;
    document.querySelectorAll(".sticker[data-tilt]").forEach(function (el) {
      var base = parseFloat(el.dataset.tilt) || 0;
      gsap.set(el, { rotation: base, transformOrigin: "50% 50%" });
      var tl = gsap.timeline({ paused: true, defaults: { duration: 0.4, ease: "back.out(1.8)" } });
      tl.to(el, { scale: 1.1, rotation: base + 2 });
      el.addEventListener("mouseenter", function () { tl.play(); });
      el.addEventListener("mouseleave", function () { tl.reverse(); });
      el.addEventListener("focus", function () { tl.play(); });
      el.addEventListener("blur", function () { tl.reverse(); });
    });
  }

  // the record: spins continuously while hovered, stops on mouseleave or click.
  function initRecordSpin() {
    var wrap = document.getElementById("musikSticker");
    var disc = document.getElementById("recordSpin");
    if (!wrap || !disc || reduceMotion || typeof gsap === "undefined") return;
    var spin = gsap.to(disc, {
      rotation: 360, duration: 2.2, ease: "none", repeat: -1, paused: true, transformOrigin: "50% 50%"
    });
    wrap.addEventListener("mouseenter", function () { spin.play(); });
    wrap.addEventListener("mouseleave", function () { spin.pause(); });
    wrap.addEventListener("click", function () { spin.pause(); });
  }

  fetch("content.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (content) {
      if (content) {
        applyContent(content);
        buildBandDialogs(content);
      }
    })
    .catch(function () { /* keep the baked-in HTML defaults */ })
    .finally(function () {
      wireDialogs();
      initHoverTilt();
      initRecordSpin();
    });
})();
