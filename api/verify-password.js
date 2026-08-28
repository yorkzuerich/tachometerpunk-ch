// Vercel serverless function (Node).
// Lightweight password check used to gate the /admin editor UI itself —
// separate from save-content.js, which re-checks the password again before
// actually committing anything. Never exposes ADMIN_PASSWORD to the client.

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { ADMIN_PASSWORD } = process.env;
  if (!ADMIN_PASSWORD) {
    res.status(500).json({ error: "Server ist nicht konfiguriert (fehlende Umgebungsvariable ADMIN_PASSWORD)." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Ungültiger Request-Body." });
    return;
  }

  if (body.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Falsches Passwort." });
    return;
  }

  res.status(200).json({ ok: true });
};
