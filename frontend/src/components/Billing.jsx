import { useState } from "react";
import { api } from "../lib/api";

const PLANS = [
  { id: "essential", name: "Essential", price: 499, blurb: "Managed IT, networking, VoIP, MDM.", features: ["24/5 helpdesk", "Up to 25 endpoints", "Quarterly business reviews"] },
  { id: "professional", name: "Professional", price: 1499, blurb: "Adds cybersecurity, cloud ops, BCDR, automation.", features: ["24/7 SOC + EDR", "Up to 100 endpoints", "Monthly executive reports"] , recommended: true },
  { id: "enterprise", name: "Enterprise", price: 3999, blurb: "Compliance, vCIO, AI systems, data analytics.", features: ["SOC 2 / ISO readiness", "Unlimited endpoints", "Dedicated vCIO + AI roadmap"] },
];

export default function Billing({ user }) {
  const [busy, setBusy] = useState("");
  const subscribe = async (plan) => {
    setBusy(plan);
    try {
      const r = await api.post("/api/billing/checkout", { plan });
      if (r.url) window.location.href = r.url;
      else alert(r.detail || "Checkout not configured. Set STRIPE_API_KEY on the backend.");
    } catch (e) { alert(e?.detail || "Checkout failed"); }
    finally { setBusy(""); }
  };

  return (
    <div>
      <h1 className="text-4xl font-light tracking-tight">Billing</h1>
      <p className="mt-3 text-zinc-500">Three plans to match every operational footprint.</p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map(p => (
          <div key={p.id} className={`relative bg-white border ${p.recommended ? "border-black ring-2 ring-[#C4A45C]/20" : "border-zinc-200"} rounded-2xl p-6 flex flex-col`}>
            {p.recommended && <span className="absolute -top-3 left-6 bg-[#C4A45C] text-white text-[10px] uppercase tracking-[0.18em] font-semibold px-2 py-0.5 rounded-full">Most popular</span>}
            <h3 className="text-xl font-medium tracking-tight">{p.name}</h3>
            <p className="mt-1 text-sm text-zinc-500">{p.blurb}</p>
            <p className="mt-6 text-3xl font-light tracking-tight">${p.price.toLocaleString()}<span className="text-sm text-zinc-500"> / month</span></p>
            <ul className="mt-6 space-y-2 text-sm flex-1">
              {p.features.map(f => <li key={f} className="text-zinc-600">· {f}</li>)}
            </ul>
            <button onClick={() => subscribe(p.id)} disabled={busy === p.id} className="mt-8 rounded-full bg-black text-white hover:bg-zinc-800 disabled:opacity-60 text-sm font-medium px-5 h-11">
              {busy === p.id ? "Redirecting…" : (user?.plan === p.id ? "Current plan" : "Subscribe")}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs text-zinc-400">All plans billed monthly via Stripe. Cancel anytime.</p>
    </div>
  );
}
