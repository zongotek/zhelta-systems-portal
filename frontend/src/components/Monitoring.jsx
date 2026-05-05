import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Monitoring() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/api/monitoring").then(setD).catch(() => {}); }, []);

  return (
    <div>
      <h1 className="text-4xl font-light tracking-tight">Monitoring</h1>
      <p className="mt-3 text-zinc-500">Live infrastructure status — synthetic checks, RUM, and uptime.</p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {(d?.services || []).map(s => (
          <div key={s.name} className="bg-white border border-zinc-200 rounded-2xl p-6 flex items-start justify-between">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="mt-1 text-xs text-zinc-500">{s.region}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs ${s.status === "operational" ? "text-emerald-700" : s.status === "degraded" ? "text-amber-700" : "text-red-700"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${s.status === "operational" ? "bg-emerald-500" : s.status === "degraded" ? "bg-amber-500" : "bg-red-500"}`}/>{s.status}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-10 bg-white border border-zinc-200 rounded-2xl p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-semibold">Uptime, last 30 days</p>
        <p className="mt-3 text-4xl font-light tracking-tight">{d?.uptime_30d ? `${d.uptime_30d}%` : "—"}</p>
      </div>
    </div>
  );
}
