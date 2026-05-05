import { useState } from "react";
import { useSession } from "./lib/auth";
import Login from "./components/Login.jsx";
import PortalShell from "./components/PortalShell.jsx";
import ClientDashboard from "./components/ClientDashboard.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import Devices from "./components/Devices.jsx";
import Tickets from "./components/Tickets.jsx";
import Monitoring from "./components/Monitoring.jsx";
import Billing from "./components/Billing.jsx";
import Services from "./components/Services.jsx";
import AdminClients from "./components/AdminClients.jsx";
import AdminSubscriptions from "./components/AdminSubscriptions.jsx";
import AdminActivity from "./components/AdminActivity.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";

export default function App() {
  const session = useSession();
  const [view, setView] = useState("dashboard");

  if (session.loading) return <LoadingScreen />;
  if (!session.user) return <Login onAuthed={(u) => session.setUser(u)} />;

  const isAdmin = session.user.role === "admin";

  const VIEWS = {
    dashboard: isAdmin ? <AdminDashboard /> : <ClientDashboard user={session.user} />,
    devices: <Devices isAdmin={isAdmin} />,
    tickets: <Tickets user={session.user} />,
    monitoring: <Monitoring />,
    billing: <Billing user={session.user} />,
    services: <Services />,
    "admin-clients": <AdminClients />,
    "admin-subscriptions": <AdminSubscriptions />,
    "admin-activity": <AdminActivity />,
  };

  return (
    <PortalShell user={session.user} view={view} setView={setView} onLogout={session.logout}>
      {VIEWS[view] || VIEWS.dashboard}
    </PortalShell>
  );
}
