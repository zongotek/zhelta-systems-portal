import Mark from "./Mark.jsx";

const NAV_CLIENT = [
  { id: "dashboard", label: "Dashboard" },
  { id: "devices", label: "Devices" },
  { id: "tickets", label: "Tickets" },
  { id: "monitoring", label: "Monitoring" },
  { id: "services", label: "Services" },
  { id: "billing", label: "Billing" },
];
const NAV_ADMIN = [
  { id: "dashboard", label: "Overview" },
  { id: "admin-clients", label: "Clients" },
  { id: "admin-subscriptions", label: "Subscriptions" },
  { id: "tickets", label: "Tickets" },
  { id: "devices", label: "Devices" },
  { id: "monitoring", label: "Monitoring" },
  { id: "services", label: "Services" },
  { id: "admin-activity", label: "Activity" },
];

export default function PortalShell({ user, view, setView, children, onLogout }) {
  const nav = user.role === "admin" ? NAV_ADMIN : NAV_CLIENT;
  return (
    <div className="min-h-screen bg-[#FAFAFC] text-black">
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-zinc-200 bg-white px-5 py-6 flex flex-col">
        <div className="flex items-center gap-2.5">
          <Mark /><span className="font-medium tracking-tight">ZHELTA Systems</span>
        </div>
        <nav className="mt-10 flex-1 space-y-0.5">
          {nav.map(n => (
            <button key={n.id} onClick={() => setView(n.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${view === n.id ? "bg-zinc-100 text-black font-medium" : "text-zinc-600 hover:bg-zinc-50 hover:text-black"}`}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="mt-6 pt-5 border-t border-zinc-100">
          <p className="text-xs text-zinc-500">{user.email}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#C4A45C] font-semibold">{user.role}</p>
          <button onClick={onLogout} className="mt-3 text-xs text-zinc-500 hover:text-black">Sign out</button>
        </div>
      </aside>
      <main className="ml-64 p-8 md:p-12 max-w-6xl">{children}</main>
    </div>
  );
}
