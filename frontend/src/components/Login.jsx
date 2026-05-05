import { useState } from "react";
import { api } from "../lib/api";
import { setToken } from "../lib/auth";
import Mark from "./Mark.jsx";

export default function Login({ onAuthed }) {
  const [email, setEmail] = useState("admin@zheltasystems.com");
  const [password, setPassword] = useState("Demo@2026!");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await api.post("/api/auth/login", { email, password });
      setToken(r.token);
      onAuthed(r.user);
    } catch (e) {
      setErr(e?.detail || "Login failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-8 py-6 flex items-center gap-2.5">
        <Mark /><span className="font-medium tracking-tight">ZHELTA Systems</span>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#C4A45C] font-semibold">Operational portal</p>
          <h1 className="mt-3 text-4xl font-light tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-500">Use the seeded demo accounts to explore.</p>

          <label className="block mt-8 text-xs uppercase tracking-[0.18em] text-zinc-500">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full h-11 px-4 rounded-xl bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-[#C4A45C] outline-none" />
          <label className="block mt-5 text-xs uppercase tracking-[0.18em] text-zinc-500">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full h-11 px-4 rounded-xl bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-[#C4A45C] outline-none" />

          {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

          <button disabled={busy} className="mt-8 w-full h-11 rounded-full bg-black hover:bg-zinc-800 disabled:opacity-60 text-white font-medium transition-colors">
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <div className="mt-8 text-xs text-zinc-500 space-y-1.5 leading-relaxed">
            <p><span className="text-zinc-700 font-medium">Admin demo:</span> admin@zheltasystems.com / Demo@2026!</p>
            <p><span className="text-zinc-700 font-medium">Client demo:</span> client@acme.com / Demo@2026!</p>
          </div>
        </form>
      </main>
      <footer className="px-8 py-6 text-xs text-zinc-400">© ZHELTA Systems · Operational platform</footer>
    </div>
  );
}
