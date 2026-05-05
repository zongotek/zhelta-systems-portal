import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Devices() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => { api.get("/api/devices").then(r => setItems(r.devices || [])).catch(e => setErr(e.detail || "")); }, []);

  return (
    <div>
      <h1 className="text-4xl font-light tracking-tight">Devices</h1>
      <p className="mt-3 text-zinc-500">Endpoints under management with live status.</p>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <div className="mt-10 bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-[0.15em]">
            <tr><th className="text-left p-4">Hostname</th><th className="text-left p-4">Type</th><th className="text-left p-4">OS</th><th className="text-left p-4">Status</th><th className="text-left p-4">Last seen</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.length === 0 ? <tr><td colSpan="5" className="p-6 text-center text-zinc-400">No devices yet.</td></tr> :
              items.map(d => (
                <tr key={d.id}>
                  <td className="p-4 font-medium">{d.hostname}</td>
                  <td className="p-4 text-zinc-600">{d.type}</td>
                  <td className="p-4 text-zinc-600">{d.os}</td>
                  <td className="p-4"><span className={`inline-flex items-center gap-1.5 text-xs ${d.status === "online" ? "text-emerald-700" : "text-zinc-500"}`}><span className={`h-1.5 w-1.5 rounded-full ${d.status === "online" ? "bg-emerald-500" : "bg-zinc-400"}`}/>{d.status}</span></td>
                  <td className="p-4 text-zinc-500 text-xs">{d.last_seen}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
