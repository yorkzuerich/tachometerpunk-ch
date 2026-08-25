// Vercel serverless function (Node).
// Receives edits from /admin, validates the shared password, and commits
// content.json (+ any replaced images) straight to the GitHub repo.
// Vercel is connected to that repo, so the commit triggers a fresh deploy.

const GITHUB_API = "https://api.github.com";

async function githubRequest(path, options) {
  const res = await fetch(GITHUB_API + path, {
    ...options,
    headers: {
      Authorization: "Bearer " + process.env.GITHUB_TOKEN,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options && options.headers),
    },
  });
  return res;
}

async function getFileSha(owner, repo, branch, filePath) {
  const res = await githubRequest(
    `/repos/${owner}/${repo}/contents/${encodeURI(filePath)}?ref=${encodeURIComponent(branch)}`,
    { method: "GET" }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${filePath} failed: ${res.status}`);
  const data = await res.json();
  return data.sha;
}

async function putFile(owner, repo, branch, filePath, base64Content, message) {
  const sha = await getFileSha(owner, repo, branch, filePath);
  const res = await githubRequest(`/repos/${owner}/${repo}/contents/${encodeURI(filePath)}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: base64Content,
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub PUT ${filePath} failed: ${res.status} ${body}`);
  }
  return res.json();
}

function stripDataUriPrefix(dataUri) {
  const idx = dataUri.indexOf(",");
  return idx === -1 ? dataUri : dataUri.slice(idx + 1);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH } = process.env;
  if (!ADMIN_PASSWORD || !GITHUB_TOKEN || !GITHUB_REPO) {
    res.status(500).json({ error: "Server ist nicht konfiguriert (fehlende Umgebungsvariablen)." });
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

  const { password, content, images } = body;

  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Falsches Passwort." });
    return;
  }
  if (!content || typeof content !== "object") {
    res.status(400).json({ error: "Kein content-Objekt übermittelt." });
    return;
  }

  const [owner, repo] = GITHUB_REPO.split("/");
  const branch = GITHUB_BRANCH || "main";

  try {
    // content.json first
    const contentBase64 = Buffer.from(JSON.stringify(content, null, 2), "utf-8").toString("base64");
    await putFile(owner, repo, branch, "content.json", contentBase64, "Inhalte via /admin aktualisiert");

    // then any replaced images, one commit per file
    const imageEntries = images && typeof images === "object" ? Object.entries(images) : [];
    for (const [filePath, dataUri] of imageEntries) {
      if (typeof dataUri !== "string") continue;
      const base64 = stripDataUriPrefix(dataUri);
      const approxBytes = (base64.length * 3) / 4;
      if (approxBytes > 4.5 * 1024 * 1024) {
        throw new Error(`${filePath}: Bild ist zu gross (max. ~4.5 MB).`);
      }
      await putFile(owner, repo, branch, filePath, base64, `Bild aktualisiert via /admin: ${filePath}`);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Unbekannter Fehler beim Speichern." });
  }
};
