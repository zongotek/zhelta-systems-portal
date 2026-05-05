import { useState } from "react";
import { SERVICES } from "../lib/services";

const TIER_COLOR = { Essential: "border-zinc-300 text-zinc-700", Professional: "border-[#C4A45C] text-[#A88A4A]", Enterprise: "border-black text-black" };

export default function Services() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <h1 className="text-4xl font-light tracking-tight">Service modules</h1>
      <p className="mt-3 text-zinc-500">Twelve operational services, each with its own SLA tier.</p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map(s => (
          <button key={s.id} onClick={() => setOpen(s)} className="text-left bg-white border border-zinc-200 hover:border-black rounded-2xl p-6 transition-colors">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold">{s.category}</p>
            <h3 className="mt-2 text-lg font-medium tracking-tight">{s.name}</h3>
            <p className="mt-2 text-sm text-zinc-600">{s.description}</p>
            <span className={`mt-4 inline-block text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full border ${TIER_COLOR[s.tier]}`}>{s.tier}</span>
          </button>
        ))}
      </div>

      {open && (
        <div onClick={() => setOpen(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm grid place-items-center p-6 z-50">
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl max-w-lg w-full p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C4A45C] font-semibold">{open.category}</p>
            <h2 className="mt-2 text-3xl font-light tracking-tight">{open.name}</h2>
            <p className="mt-4 text-zinc-600 leading-relaxed">{open.description}</p>
            <div className="mt-6 pt-6 border-t border-zinc-100 text-sm">
              <p className="text-zinc-500">Available on</p>
              <p className="mt-1 font-medium">{open.tier} plan and above</p>
            </div>
            <button onClick={() => setOpen(null)} className="mt-8 rounded-full bg-black text-white text-sm font-medium px-5 h-10">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
