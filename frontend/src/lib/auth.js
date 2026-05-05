import { useEffect, useState } from "react";
import { api } from "./api";

export function getToken() { return localStorage.getItem("zsp_token"); }
export function setToken(t) { localStorage.setItem("zsp_token", t); }
export function clearToken() { localStorage.removeItem("zsp_token"); }

export function useSession() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.get("/api/auth/me").then(setUser).catch(() => clearToken()).finally(() => setLoading(false));
  }, []);
  const logout = () => { clearToken(); setUser(null); window.location.reload(); };
  return { user, setUser, loading, logout };
}
