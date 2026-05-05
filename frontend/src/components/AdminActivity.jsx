import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function AdminActivity() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/api/admin/activity").then(r => setItems(r.events || [])).catch(() => {}); }, []);
  return (
    <div>
      <h1 className="text-4xl font-light tracking-tight">Activity</h1>
      <p className="mt-3 text-zinc-500">Recent events across the platform.</p>
      <ul className="mt-10 bg-white border border-zinc-200 rounded-2xl divide-y divide-zinc-100">
        {items.length === 0 ? <li className="p-6 text-center text-zinc-400 text-sm">No activity yet.</li> :
          items.map(e => (
            <li key={e.id} className="p-5 flex items-start gap-4">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#C4A45C] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm"><span className="font-medium">{e.actor}</span> · {e.action}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{e.target} · {e.ts?.slice(0,16).replace("T", " ")}</p>
              </div>
            </li>
          ))
        }
      </ul>
    </div>
  );
}
