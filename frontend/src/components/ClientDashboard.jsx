import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Stat from "./Stat.jsx";

export default function ClientDashboard({ user }) {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/api/dashboard/client").then(setData).catch(() => {}); }, []);

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#C4A45C] font-semibold">Welcome back</p>
      <h1 className="mt-3 text-4xl font-light tracking-tight">{user.org_name || user.email}</h1>
      <p className="mt-3 text-zinc-500 max-w-xl">Your operations summary. Devices, tickets, and infrastructure health at a glance.</p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Devices" value={data?.devices ?? "—"} />
        <Stat label="Open tickets" value={data?.open_tickets ?? "—"} accent />
        <Stat label="Uptime (30d)" value={data?.uptime_30d ? `${data.uptime_30d}%` : "—"} />
      </div>

      <div className="mt-12 bg-white border border-zinc-200 rounded-2xl p-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-semibold">Active subscription</p>
        <h3 className="mt-2 text-2xl font-light tracking-tight">{data?.plan || "Essential"}</h3>
        <p className="mt-2 text-sm text-zinc-500">{data?.next_renewal ? `Next renewal ${data.next_renewal}` : "Manage your plan in Billing."}</p>
      </div>
    </div>
  );
}
