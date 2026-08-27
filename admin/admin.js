(function () {
  "use strict";

  function bandGroup(key, title) {
    return {
      group: title,
      fields: [
        { path: "band." + key + ".name", label: "Name", type: "text" },
        { path: "band." + key + ".instrument", label: "Instrument", type: "text" },
        { path: "band." + key + ".idole", label: "Idole", type: "text" },
        { path: "band." + key + ".bio", label: "Bio", type: "textarea" }
      ],
      images: [{ path: "images.band." + key, label: "Sticker-Bild" }]
    };
  }

  var SCHEMA = [
    { group: "Logo", fields: [], images: [{ path: "images.logo", label: "Logo-Sticker" }] },
    {
      group: "Hintergrund",
      fields: [],
      images: [
        { path: "images.circusBg", label: "Zirkus-Hintergrund (hinterste Ebene)" },
        { path: "images.bookBg", label: "Skizzenbuch (Ebene über dem Zirkus-Hintergrund)" }
      ]
    },
    bandGroup("ricardo", "Ricardo das Punkschaf"),
    bandGroup("peter", "Peter Tachometer"),
    bandGroup("tapas", "Tapas"),
    bandGroup("lucky", "Lucky"),
    bandGroup("selma", "Selma"),
    bandGroup("tina", "Tina"),
    {
      group: "Das Buch",
      fields: [
        { path: "buch.eyebrow", label: "Eyebrow (kleines Label über der Überschrift)", type: "text" },
        { path: "buch.titel", label: "Titel", type: "text" },
        { path: "buch.text1", label: "Text 1", type: "textarea" },
        { path: "buch.text2", label: "Text 2", type: "textarea" },
        { path: "buch.zitat", label: "Zitat", type: "text" },
        { path: "buch.bestellenText", label: "Bestellen — Text", type: "textarea" },
        { path: "buch.bestellenButton", label: "Bestellen — Button-Text", type: "text" }
      ],
      images: [{ path: "images.buch", label: "Buchcover" }]
    },
    {
      group: "Mitmachen",
      fields: [
        { path: "mitmachen.eyebrow", label: "Eyebrow", type: "text" },
        { path: "mitmachen.titel", label: "Titel", type: "text" },
        { path: "mitmachen.text", label: "Text", type: "textarea" },
        { path: "mitmachen.buttonText", label: "Button-Text", type: "text" }
      ],
      images: [{ path: "images.mitmachen", label: "Mitmachen-Sticker" }]
    },
    {
      group: "Musik",
      fields: [
        { path: "musik.eyebrow", label: "Eyebrow", type: "text" },
        { path: "musik.titel", label: "Titel", type: "text" },
        { path: "musik.lead", label: "Einleitungstext", type: "textarea" },
        { path: "musik.song1Titel", label: "Song 1 — Titel", type: "text" },
        { path: "musik.song2Titel", label: "Song 2 — Titel", type: "text" },
        { path: "musik.hinweis", label: "Hinweistext", type: "textarea" }
      ],
      images: [{ path: "images.musik", label: "Schallplatte" }]
    },
    {
      group: "Angelina",
      fields: [
        { path: "angelina.titel", label: "Titel", type: "text" },
        { path: "angelina.text1", label: "Text", type: "textarea" }
      ],
      images: [{ path: "images.angelina", label: "Sticker-Bild (Schmetterling)" }]
    },
    {
      group: "Über uns",
      fields: [
        { path: "ueberUns.titel", label: "Titel", type: "text" },
        { path: "ueberUns.text1", label: "Text 1", type: "textarea" },
        { path: "ueberUns.text2", label: "Text 2", type: "textarea" }
      ],
      images: [{ path: "images.ueberUns", label: "Foto" }]
    },
    {
      group: "Kontakt",
      fields: [{ path: "kontakt.email", label: "E-Mail-Adresse", type: "text" }]
    }
  ];

  function getPath(obj, path) {
    return path.split(".").reduce(function (o, k) { return o && o[k] !== undefined ? o[k] : undefined; }, obj);
  }
  function setPath(obj, path, value) {
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (typeof cur[parts[i]] !== "object" || cur[parts[i]] === null) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }

  var fieldsEl = document.getElementById("fields");
  var statusEl = document.getElementById("status");
  var form = document.getElementById("contentForm");
  var saveBtn = document.getElementById("saveBtn");
  var originalContent = null;
  var imageInputs = []; // { path, inputEl }

  function buildForm(content) {
    fieldsEl.innerHTML = "";
    SCHEMA.forEach(function (group) {
      var wrap = document.createElement("div");
      var h2 = document.createElement("p");
      h2.className = "section-title";
      h2.textContent = group.group;
      wrap.appendChild(h2);

      var box = document.createElement("div");
      box.className = "field-group";

      (group.fields || []).forEach(function (f) {
        var label = document.createElement("label");
        label.textContent = f.label;
        label.htmlFor = "f_" + f.path;
        box.appendChild(label);

        var input;
        if (f.type === "textarea") {
          input = document.createElement("textarea");
        } else {
          input = document.createElement("input");
          input.type = "text";
        }
        input.id = "f_" + f.path;
        input.name = f.path;
        input.value = getPath(content, f.path) || "";
        box.appendChild(input);
      });

      (group.images || []).forEach(function (img) {
        var label = document.createElement("label");
        label.textContent = img.label;
        box.appendChild(label);

        var row = document.createElement("div");
        row.className = "img-row";

        var preview = document.createElement("img");
        var relPath = getPath(content, img.path) || "";
        preview.src = "../" + relPath;
        preview.alt = "";
        row.appendChild(preview);

        var fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/png,image/jpeg,image/webp";
        fileInput.addEventListener("change", function () {
          if (fileInput.files && fileInput.files[0]) {
            preview.src = URL.createObjectURL(fileInput.files[0]);
          }
        });
        row.appendChild(fileInput);
        box.appendChild(row);

        imageInputs.push({ targetPath: relPath, inputEl: fileInput });
      });

      wrap.appendChild(box);
      fieldsEl.appendChild(wrap);
    });
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "status" + (kind ? " " + kind : "");
  }

  fetch("../content.json", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (content) {
      originalContent = content;
      buildForm(content);
    })
    .catch(function () {
      fieldsEl.textContent = "Konnte content.json nicht laden.";
      setStatus("Fehler beim Laden der Inhalte.", "err");
    });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!originalContent) return;
    saveBtn.disabled = true;
    setStatus("Speichere …");

    var password = document.getElementById("password").value;
    var content = JSON.parse(JSON.stringify(originalContent));

    SCHEMA.forEach(function (group) {
      (group.fields || []).forEach(function (f) {
        var el = document.getElementById("f_" + f.path);
        setPath(content, f.path, el.value);
      });
    });

    var changedImages = imageInputs.filter(function (i) { return i.inputEl.files && i.inputEl.files[0]; });

    Promise.all(changedImages.map(function (i) { return fileToBase64(i.inputEl.files[0]); }))
      .then(function (base64List) {
        var images = {};
        changedImages.forEach(function (i, idx) { images[i.targetPath] = base64List[idx]; });

        return fetch("/api/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: password, content: content, images: images })
        });
      })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        if (result.ok) {
          originalContent = content;
          setStatus("Gespeichert. Die Seite wird in Kürze neu gebaut.", "ok");
        } else {
          setStatus("Fehler: " + (result.data && result.data.error ? result.data.error : "unbekannt"), "err");
        }
      })
      .catch(function (err) {
        setStatus("Fehler beim Speichern: " + err.message, "err");
      })
      .finally(function () {
        saveBtn.disabled = false;
      });
  });
})();
