import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Stat from "./Stat.jsx";

export default function AdminDashboard() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/api/dashboard/admin").then(setD).catch(() => {}); }, []);

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#C4A45C] font-semibold">Operations</p>
      <h1 className="mt-3 text-4xl font-light tracking-tight">Network overview</h1>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Clients" value={d?.clients ?? "—"} />
        <Stat label="Devices managed" value={d?.devices ?? "—"} />
        <Stat label="Open tickets" value={d?.open_tickets ?? "—"} accent />
        <Stat label="MRR (USD)" value={d?.mrr_usd ? `$${d.mrr_usd.toLocaleString()}` : "—"} />
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-semibold">By tier</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex justify-between"><span>Essential</span><span className="text-zinc-500">{d?.tiers?.essential ?? 0}</span></li>
            <li className="flex justify-between"><span>Professional</span><span className="text-zinc-500">{d?.tiers?.professional ?? 0}</span></li>
            <li className="flex justify-between"><span>Enterprise</span><span className="text-zinc-500">{d?.tiers?.enterprise ?? 0}</span></li>
          </ul>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-semibold">SLA health</p>
          <p className="mt-4 text-3xl font-light tracking-tight">{d?.sla_pct ? `${d.sla_pct}%` : "—"}</p>
          <p className="mt-1 text-xs text-zinc-500">Tickets resolved within target this month.</p>
        </div>
      </div>
    </div>
  );
}
