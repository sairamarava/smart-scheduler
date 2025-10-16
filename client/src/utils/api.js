// Small fetch wrapper that prefixes requests with VITE_API_URL when present
// and gracefully handles non-JSON responses so the UI doesn't crash with
// "Unexpected token '<'" when an HTML error page is returned.
const API_BASE = import.meta.env.VITE_API_URL || "";

async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const merged = { credentials: "include", ...options };

  const res = await fetch(url, merged);

  // Try parse JSON, but return raw text if not JSON (helps debug HTML error pages)
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = await res.json();
    if (!res.ok) throw { status: res.status, body: json };
    return json;
  }

  const text = await res.text();
  if (!res.ok) throw { status: res.status, body: text };
  return text;
}

export { apiFetch, API_BASE };
