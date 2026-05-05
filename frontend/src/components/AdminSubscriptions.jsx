import { useEffect, useState } from "react";
import { api } from "../lib/api";

const STATUS_TONE = { active: "text-emerald-700", trialing: "text-blue-700", past_due: "text-amber-700", canceled: "text-zinc-500" };

export default function AdminSubscriptions() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/api/admin/subscriptions").then(r => setItems(r.subscriptions || [])).catch(() => {}); }, []);
  return (
    <div>
      <h1 className="text-4xl font-light tracking-tight">Subscriptions</h1>
      <p className="mt-3 text-zinc-500">All paying clients across all tiers.</p>
      <div className="mt-10 bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-[0.15em]">
            <tr><th className="text-left p-4">Org</th><th className="text-left p-4">Plan</th><th className="text-left p-4">MRR</th><th className="text-left p-4">Status</th><th className="text-left p-4">Renews</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map(s => (
              <tr key={s.id}>
                <td className="p-4 font-medium">{s.org_name}</td>
                <td className="p-4 text-zinc-600">{s.plan}</td>
                <td className="p-4">${(s.mrr_usd || 0).toLocaleString()}</td>
                <td className="p-4"><span className={`text-xs ${STATUS_TONE[s.status] || ""}`}>{s.status}</span></td>
                <td className="p-4 text-zinc-500 text-xs">{s.next_renewal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
