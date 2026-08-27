(function () {
  "use strict";

  // Baked-in fallback so band popups exist even if content.json can't be
  // fetched (e.g. the page opened via file:// / double-click, where fetch
  // is blocked by CORS). Kept in sync with content.json by hand.
  var FALLBACK_BAND = {
    ricardo: {
      name: "Ricardo das Punkschaf", instrument: "E-Gitarre",
      idole: "Joe Strummer, Malcolm Young & Michael „Olga“ Algar",
      bio: "Ricardo hat, wie es sich für ein „Nutztier“ gehört, mit seiner Herde auf einem Hof gelebt. Der Mensch hält „Nutztiere“ hauptsächlich um sich zu ernähren und Kleider zu machen. Ricardo hat das schon immer gestört. Schon früh hat er gemerkt, dass er anders ist als die Anderen. Er hat auf viele offene Fragen keine Antworten gefunden. Zum Beispiel, wieso den Schafmüttern ihre Kinder weggenommen werden oder was mit den Schafen passiert, die mit dem grossen Lastwagen abgeholt werden. Er ist ein überzeugter Anarchist und findet, die Schafherde braucht keine Menschen. So hat er sich eines Tages entschlossen, die Herde zu verlassen und sein eigenes Ding zu machen."
    },
    peter: {
      name: "Peter Tachometer", instrument: "Kazoo", idole: "Alle Kinder",
      bio: "Peter ist ein Borkenkäfer und lebt im Wald. Dort ist er als Ökosystemingenieur tätig. Sein Auftrag ist es, alte und kranke Bäume zu befallen und sie zum Absterben zu bringen — so macht er Platz für neue, junge und gesunde Bäume und produziert Totholz, das ein wichtiger Lebensraum für viele Tier-, Pflanzen- und Pilzarten ist. Jedoch will der Mensch die Bäume für sich haben, darum sind Peter und seine Freunde als „Ungeziefer“ eingestuft worden und werden bekämpft. Das macht ihn sehr traurig — er möchte ein Freund der Menschen sein. So hat er eines Tages den Wald verlassen und die Polizeischule besucht."
    },
    tapas: {
      name: "Tapas", instrument: "Schlagzeug", idole: "Ginger Baker, Dave Grohl & Buddy Rich",
      bio: "Tapas ist ein Strassenhund aus Süditalien und 10 Jahre alt. Strassenhunde werden Hunde genannt, die kein Zuhause haben und alleine auf der Strasse leben. Wenn sie einem Hundefänger in die Arme laufen, werden sie in einem sogenannten Canile eingesperrt. Einige Glückspilze werden adoptiert und dürfen das Gefängnis wieder verlassen — so auch Tapas, nach vier Jahren im Canile. Tapas ist immer unter Strom und hat viel Energie. Er liebt es, Sachen zu sammeln und in seinem Bett aufzubewahren."
    },
    lucky: {
      name: "Lucky", instrument: "Bassgitarre", idole: "Lemmy Kilmister, James Jamerson, Flea & Roger Waters",
      bio: "Ebenfalls ein Strassenhund aus Süditalien, 11 Jahre alt. Er musste sieben Jahre im Canile verbringen, bis er mit Tapas in das „Für-immer-zu-Hause“ einziehen konnte. Die sieben Jahre im Canile hat er mit Selma verbracht. Lucky ist unabhängig und cool. Ihm ist nicht so wichtig, was die Anderen machen — er macht, worauf er Lust hat. Am liebsten gräbt er Löcher im Garten."
    },
    selma: {
      name: "Selma", instrument: "Keyboard", idole: "Darius Keeler, Ray Manzarek & Melissa Reese",
      bio: "Strassenhund Nummer drei in der Runde, 14 Jahre alt. Sie hat zehn Jahre im Canile verbracht und Lucky ist ihr bester Freund. Sie ist sehr gechillt und kann immer noch nicht glauben, wie schön leise und trocken es in ihrem „Für-immer-zu-Hause“ ist. Sie holt all den Schlaf nach, den sie im Canile nicht hatte — am liebsten auf dem Sofa."
    },
    tina: {
      name: "Tina", instrument: "Gesang", idole: "Janis Joplin, Courtney Love & Tina Turner",
      bio: "Tina kommt ebenfalls aus Süditalien. Dort wurde sie aus einer illegalen Schäferhundezucht befreit — sie war an einer Kette angebunden und musste immer wieder Babys auf die Welt bringen, bis sie befreit wurde. Sie ist 6 Jahre alt und meint, sie sei immer noch klein. Jedoch ist sie eine sehr grosse und laute Hündin und manchmal eine kleine Diva. So versucht sie sich als Rudelführerin in ihrem „Für-immer-zu-Hause“ — mit mässigem Erfolg."
    }
  };
  var FALLBACK_IMAGES = {
    ricardo: "assets/band-ricardo.png", peter: "assets/band-peter.png",
    tapas: "assets/band-tapas.png", lucky: "assets/band-lucky.png",
    selma: "assets/band-selma.png", tina: "assets/band-tina.png"
  };

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
      // fall back per-member so a partial content.json still yields a working popup
      var data = (content && content.band && content.band[key]) || FALLBACK_BAND[key];
      if (!data) return;
      var frag = tpl.content.cloneNode(true);
      var dialog = document.createElement("dialog");
      dialog.id = "dlg-" + key;
      dialog.className = "lightbox";
      dialog.appendChild(frag);

      var img = dialog.querySelector("img");
      img.src = (content && content.images && content.images.band && content.images.band[key])
        || FALLBACK_IMAGES[key];
      img.alt = data.name || key;
      dialog.querySelector("h2").textContent = data.name || "";
      dialog.querySelector(".instrument").textContent = data.instrument || "";
      dialog.querySelector(".idole").textContent = data.idole || "";
      dialog.querySelector(".lb-bio").textContent = data.bio || "";
      document.body.appendChild(dialog);
    });
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Positions the dialog right next to whatever triggered it (below by
  // preference, above if there's no room) and points the speech-bubble
  // tail at the trigger's horizontal center, clamped to stay on the card.
  function positionNear(dlg, triggerEl) {
    var margin = 16, gap = 18, tailSafe = 26;

    // only one popup at a time: hard-close any other open lightbox first
    // (no animation on these — the new one's own reveal reads as the transition)
    document.querySelectorAll("dialog.lightbox[open]").forEach(function (other) {
      if (other !== dlg) other.close();
    });

    var tRect = triggerEl.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;

    dlg.style.visibility = "hidden";
    dlg.style.left = "0px";
    dlg.style.top = "0px";
    if (typeof dlg.showModal === "function") dlg.showModal();

    var dRect = dlg.getBoundingClientRect();
    var w = dRect.width, h = dRect.height;

    var triggerCenterX = tRect.left + tRect.width / 2;
    var left = triggerCenterX - w / 2;
    left = Math.max(margin, Math.min(left, vw - w - margin));

    var spaceBelow = vh - tRect.bottom;
    var spaceAbove = tRect.top;
    var tailSide = "top";
    var top;
    if (spaceBelow >= h + gap + margin || spaceBelow >= spaceAbove) {
      top = tRect.bottom + gap;
      tailSide = "top";
    } else {
      top = tRect.top - h - gap;
      tailSide = "bottom";
    }
    top = Math.max(margin, Math.min(top, vh - h - margin));

    var tailX = triggerCenterX - left;
    tailX = Math.max(tailSafe, Math.min(tailX, w - tailSafe));

    dlg.style.left = left + "px";
    dlg.style.top = top + "px";
    dlg.style.setProperty("--tail-x", tailX + "px");
    dlg.classList.toggle("tail-bottom", tailSide === "bottom");
    dlg.style.visibility = "visible";

    if (reduceMotion || typeof gsap === "undefined") return;
    var originY = tailSide === "top" ? "0%" : "100%";
    gsap.fromTo(
      dlg,
      { opacity: 0, scale: 0.82, transformOrigin: tailX + "px " + originY },
      { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
    );
  }

  function closeAnimated(dlg) {
    if (reduceMotion || typeof gsap === "undefined") {
      dlg.close();
      return;
    }
    gsap.to(dlg, {
      opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in",
      onComplete: function () {
        dlg.close();
        gsap.set(dlg, { clearProps: "opacity,scale,transform,transformOrigin" });
      }
    });
  }

  function wireDialogs() {
    document.querySelectorAll("[data-dialog]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dlg = document.getElementById(btn.dataset.dialog);
        if (dlg) positionNear(dlg, btn);
      });
    });
    document.querySelectorAll("dialog.lightbox").forEach(function (dlg) {
      dlg.addEventListener("click", function (e) {
        if (e.target === dlg) closeAnimated(dlg);
      });
      dlg.querySelectorAll("[data-close]").forEach(function (btn) {
        btn.addEventListener("click", function () { closeAnimated(dlg); });
      });
    });
  }

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
    .catch(function () { return null; }) // fetch blocked (e.g. file://) — fall through to null
    .then(function (content) {
      if (content) applyContent(content); // otherwise keep the baked-in HTML defaults
      buildBandDialogs(content); // always runs — uses FALLBACK_BAND/FALLBACK_IMAGES per-member as needed
    })
    .finally(function () {
      wireDialogs();
      initHoverTilt();
      initRecordSpin();
    });
})();
