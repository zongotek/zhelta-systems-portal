import { useState } from "react";
import { api } from "../lib/api";
import { setToken } from "../lib/auth";
import Mark from "./Mark.jsx";

/**
 * Microsoft-style two-step sign-in.
 * Step 1: enter email → "Next"
 * Step 2: shows the email at top, enter password → "Sign in"
 */
export default function Login({ onAuthed }) {
  const [step, setStep] = useState("email"); // "email" | "password"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const next = (e) => {
    e.preventDefault();
    setErr("");
    if (!email.trim()) { setErr("Enter your email."); return; }
    if (!/.+@.+\..+/.test(email)) { setErr("That doesn't look like a valid email."); return; }
    setStep("password");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await api.post("/api/auth/login", { email: email.trim().toLowerCase(), password });
      setToken(r.token);
      onAuthed(r.user);
    } catch (e) {
      setErr(e?.detail || "We couldn't sign you in.");
    } finally { setBusy(false); }
  };

  const back = () => { setStep("email"); setPassword(""); setErr(""); };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-8 py-6 flex items-center gap-2.5">
        <Mark /><span className="font-medium tracking-tight">ZHELTA Systems</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#C4A45C] font-semibold">Operational portal</p>

          {step === "email" ? (
            <form onSubmit={next}>
              <h1 className="mt-3 text-4xl font-light tracking-tight">Sign in</h1>
              <p className="mt-2 text-sm text-zinc-500">Use your work email.</p>

              <label className="block mt-8 text-xs uppercase tracking-[0.18em] text-zinc-500">Email</label>
              <input
                autoFocus type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="someone@yourcompany.com"
                className="mt-2 w-full h-11 px-4 rounded-xl bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-[#C4A45C] outline-none"
              />

              {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

              <button className="mt-8 w-full h-11 rounded-full bg-black hover:bg-zinc-800 text-white font-medium transition-colors">
                Next
              </button>

              <p className="mt-6 text-xs text-zinc-500">No account yet? Ask your administrator to invite you.</p>
            </form>
          ) : (
            <form onSubmit={submit}>
              <button type="button" onClick={back} className="text-sm text-zinc-500 hover:text-black">← {email}</button>
              <h1 className="mt-3 text-3xl font-light tracking-tight">Enter password</h1>

              <label className="block mt-8 text-xs uppercase tracking-[0.18em] text-zinc-500">Password</label>
              <input
                autoFocus type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="mt-2 w-full h-11 px-4 rounded-xl bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-[#C4A45C] outline-none"
              />

              {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

              <button disabled={busy} className="mt-8 w-full h-11 rounded-full bg-black hover:bg-zinc-800 disabled:opacity-60 text-white font-medium transition-colors">
                {busy ? "Signing in…" : "Sign in"}
              </button>

              <p className="mt-6 text-xs text-zinc-500">Forgot your password? Ask your administrator to reset it.</p>
            </form>
          )}

          <div className="mt-12 pt-8 border-t border-zinc-100 text-xs text-zinc-500 space-y-1.5 leading-relaxed">
            <p className="font-medium text-zinc-700">Demo accounts</p>
            <p><span className="text-zinc-700">Owner:</span> zt@zhelta.com / ZheltaAdmin@2026!</p>
            <p><span className="text-zinc-700">Admin:</span> admin@zheltasystems.com / Demo@2026!</p>
            <p><span className="text-zinc-700">Engineer:</span> engineer@zheltasystems.com / Demo@2026!</p>
            <p><span className="text-zinc-700">Client:</span> client@acme.com / Demo@2026!</p>
          </div>
        </div>
      </main>

      <footer className="px-8 py-6 text-xs text-zinc-400">© ZHELTA Systems · Operational platform</footer>
    </div>
  );
}
