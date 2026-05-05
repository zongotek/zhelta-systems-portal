import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function AdminClients() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/api/admin/clients").then(r => setItems(r.clients || [])).catch(() => {}); }, []);

  return (
    <div>
      <h1 className="text-4xl font-light tracking-tight">Clients</h1>
      <p className="mt-3 text-zinc-500">Organizations and primary contacts.</p>
      <div className="mt-10 bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-[0.15em]">
            <tr><th className="text-left p-4">Org</th><th className="text-left p-4">Contact</th><th className="text-left p-4">Plan</th><th className="text-left p-4">Devices</th><th className="text-left p-4">Created</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map(c => (
              <tr key={c.id}>
                <td className="p-4 font-medium">{c.org_name}</td>
                <td className="p-4 text-zinc-600">{c.email}</td>
                <td className="p-4"><span className="text-[10px] uppercase tracking-[0.18em] text-[#A88A4A]">{c.plan || "essential"}</span></td>
                <td className="p-4 text-zinc-600">{c.devices_count || 0}</td>
                <td className="p-4 text-zinc-500 text-xs">{c.created_at?.slice(0,10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
