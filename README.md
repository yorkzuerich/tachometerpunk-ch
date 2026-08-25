# Tachometerpunk.ch

Statische One-Pager-Website (reines HTML/CSS/JS, kein Framework) mit einem kleinen
`/admin`-Editor, über den Petra & Reto Texte und Bilder selbst ändern können.

## Wie es funktioniert

- Alle Texte/Bild-Pfade liegen in [`content.json`](./content.json).
- `index.html` lädt diese Datei per JS und füllt die Seite damit.
- `/admin` ist ein einfaches, passwortgeschütztes Formular für genau diese Felder.
- Klick auf **Speichern** schickt die Änderungen an `/api/save-content` (eine
  Vercel Serverless Function), die `content.json` (und ggf. neue Bilder) direkt
  als Commit ins GitHub-Repo schreibt.
- Vercel ist mit dem Repo verbunden und baut bei jedem Commit automatisch neu —
  die Änderung ist nach ca. 1–2 Minuten live.

Es gibt keine Datenbank und keinen eigenen Server: GitHub ist der Speicherort,
Vercel nur der automatische "Bauer & Ausstellungsraum".

## Einmalige Einrichtung

### 1. Repo auf GitHub bringen

Lokal ist bereits ein Git-Repo initialisiert. Auf github.com ein neues,
leeres Repository anlegen (z. B. `tachometerpunk-ch`), dann:

```bash
git remote add origin https://github.com/<dein-user>/tachometerpunk-ch.git
git branch -M main
git push -u origin main
```

### 2. GitHub Personal Access Token erstellen

Dieses Token braucht die Serverless Function, um Commits zu erstellen.

1. GitHub → Settings → Developer settings → **Fine-grained tokens** → *Generate new token*
2. Repository access: nur das eine Repo auswählen (`tachometerpunk-ch`)
3. Permissions → **Contents: Read and write**
4. Token erstellen und den Wert kopieren (wird nur einmal angezeigt)

### 3. Vercel-Projekt anlegen

1. Auf [vercel.com](https://vercel.com) mit GitHub einloggen (kostenlos)
2. *Add New → Project* → das GitHub-Repo auswählen → Import
   (Framework Preset: „Other" / statisch — kein Build-Command nötig)
3. Unter **Settings → Environment Variables** vier Variablen setzen:

   | Name | Wert |
   |---|---|
   | `ADMIN_PASSWORD` | ein selbst gewähltes Passwort für `/admin` |
   | `GITHUB_TOKEN` | das Token aus Schritt 2 |
   | `GITHUB_REPO` | `<dein-user>/tachometerpunk-ch` |
   | `GITHUB_BRANCH` | `main` |

4. Deploy auslösen (oder einfach `git push` — Vercel deployt automatisch)

### 4. Eigene Domain (tachometerpunk.ch) verbinden

Vercel-Projekt → **Settings → Domains** → Domain eintragen → die dort
angezeigten DNS-Einträge (meist ein `A`- oder `CNAME`-Record) beim
Domain-Anbieter eintragen.

## Admin-Bereich benutzen

`https://<deine-domain>/admin` öffnen, Passwort eingeben, Texte anpassen
oder neue Bilder hochladen, **Speichern** klicken. Fertig.

## Lokal ansehen (ohne Vercel)

Der `/admin`-Speichern-Knopf braucht die Vercel-Function und funktioniert
lokal nicht einfach per Doppelklick auf `index.html` — zum Ansehen der
Seite selbst reicht aber ein einfacher lokaler Server (nötig, weil der
Browser `content.json` sonst wegen CORS nicht per `fetch` laden darf):

```bash
python3 -m http.server 8000
# dann im Browser: http://localhost:8000
```

Um auch `/admin` lokal zu testen, die [Vercel CLI](https://vercel.com/docs/cli)
installieren und `vercel dev` starten (liest die Environment Variables aus
`vercel env pull` bzw. dem Vercel-Dashboard).

## Projektstruktur

```
index.html          Startseite (lädt content.json)
css/style.css
js/script.js         GSAP-Hover, Lightboxen, content.json-Rendering
js/gsap.min.js        lokal eingebundene GSAP-Bibliothek
content.json          alle editierbaren Texte + Bild-Pfade
assets/                Sticker, Fotos, Hintergrund (aus Figma exportiert)
fonts/                 selbst gehostete Google Fonts (Bungee, Oswald, Literata, Caveat)
admin/                 der Editor (index.html, admin.css, admin.js)
api/save-content.js    Vercel Function: prüft Passwort, committet auf GitHub
```
