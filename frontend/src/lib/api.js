const BASE = import.meta.env.VITE_API_BASE_URL || "";

const headers = () => {
  const t = localStorage.getItem("zsp_token");
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
};

export const api = {
  async get(path) { const r = await fetch(`${BASE}${path}`, { headers: headers() }); if (!r.ok) throw await r.json().catch(() => ({ detail: r.statusText })); return r.json(); },
  async post(path, body) {
    const r = await fetch(`${BASE}${path}`, { method: "POST", headers: headers(), body: JSON.stringify(body || {}) });
    if (!r.ok) throw await r.json().catch(() => ({ detail: r.statusText }));
    return r.json();
  },
  async patch(path, body) {
    const r = await fetch(`${BASE}${path}`, { method: "PATCH", headers: headers(), body: JSON.stringify(body || {}) });
    if (!r.ok) throw await r.json().catch(() => ({ detail: r.statusText }));
    return r.json();
  },
};
