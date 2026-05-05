import { useEffect, useState } from "react";
import { api } from "../lib/api";

const PRIORITY_TONE = { low: "bg-zinc-100 text-zinc-700", normal: "bg-blue-50 text-blue-700", high: "bg-amber-50 text-amber-800", urgent: "bg-red-50 text-red-700" };

export default function Tickets({ user }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", priority: "normal" });

  const load = () => api.get("/api/tickets").then(r => setItems(r.tickets || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/api/tickets", form);
    setForm({ title: "", body: "", priority: "normal" });
    setOpen(false); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-light tracking-tight">Tickets</h1>
          <p className="mt-3 text-zinc-500">Support requests across your organization.</p>
        </div>
        <button onClick={() => setOpen(o => !o)} className="rounded-full bg-[#C4A45C] hover:bg-[#A88A4A] text-white text-sm font-medium px-5 h-10">
          {open ? "Close" : "New ticket"}
        </button>
      </div>

      {open && (
        <form onSubmit={create} className="mt-8 bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full h-11 px-4 rounded-xl bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-[#C4A45C] outline-none" />
          <textarea rows="4" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Describe the issue…" className="w-full p-4 rounded-xl bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-[#C4A45C] outline-none" />
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="h-11 px-4 rounded-xl bg-zinc-100">
            <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
          </select>
          <button className="rounded-full bg-black text-white text-sm font-medium px-5 h-10">Submit</button>
        </form>
      )}

      <div className="mt-10 bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-[0.15em]">
            <tr><th className="text-left p-4">#</th><th className="text-left p-4">Title</th><th className="text-left p-4">Priority</th><th className="text-left p-4">Status</th><th className="text-left p-4">Opened</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.length === 0 ? <tr><td colSpan="5" className="p-6 text-center text-zinc-400">No tickets yet.</td></tr> :
              items.map(t => (
                <tr key={t.id}>
                  <td className="p-4 text-zinc-500 font-mono text-xs">{t.id.slice(0,8)}</td>
                  <td className="p-4 font-medium">{t.title}</td>
                  <td className="p-4"><span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-1 rounded-full ${PRIORITY_TONE[t.priority] || PRIORITY_TONE.normal}`}>{t.priority}</span></td>
                  <td className="p-4 text-zinc-600">{t.status}</td>
                  <td className="p-4 text-zinc-500 text-xs">{t.created_at?.slice(0,10)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
