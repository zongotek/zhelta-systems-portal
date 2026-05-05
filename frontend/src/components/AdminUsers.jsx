import { useEffect, useState } from "react";
import { api } from "../lib/api";

const ROLE_TONE = {
  super_admin: "bg-black text-white",
  admin: "bg-[#FBF7EB] text-[#7A5F26] border border-[#E8DCB5]",
  engineer: "bg-blue-50 text-blue-700 border border-blue-200",
  support: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  client: "bg-zinc-100 text-zinc-700 border border-zinc-200",
};

const RANK = { client: 0, support: 1, engineer: 2, admin: 3, super_admin: 4 };
const canManage = (actor, target) => actor === "super_admin" || RANK[actor] > RANK[target];

const ROLES_FOR = (actor) =>
  actor === "super_admin"
    ? ["super_admin", "admin", "engineer", "support", "client"]
    : actor === "admin"
    ? ["engineer", "support", "client"]
    : [];

export default function AdminUsers({ me }) {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null); // user being edited
  const [resetting, setResetting] = useState(null);

  const load = () =>
    api.get("/api/admin/users")
      .then((r) => setUsers(r.users || []))
      .catch((e) => setErr(e.detail || "Could not load users"));

  useEffect(() => { load(); }, []);

  const create = async (form) => {
    setBusy(true); setErr("");
    try { await api.post("/api/admin/users", form); setOpenCreate(false); load(); }
    catch (e) { setErr(e.detail || "Create failed"); }
    finally { setBusy(false); }
  };
  const update = async (id, patch) => {
    setBusy(true); setErr("");
    try { await api.patch(`/api/admin/users/${id}`, patch); setEditing(null); load(); }
    catch (e) { setErr(e.detail || "Update failed"); }
    finally { setBusy(false); }
  };
  const toggleActive = (u) => update(u.id, { is_active: !u.is_active });
  const reset = async (id, new_password) => {
    setBusy(true); setErr("");
    try { await api.post(`/api/admin/users/${id}/reset-password`, { new_password }); setResetting(null); }
    catch (e) { setErr(e.detail || "Reset failed"); }
    finally { setBusy(false); }
  };
  const remove = async (u) => {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/admin/users/${u.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("zsp_token")}` } });
      if (!r.ok) throw await r.json();
      load();
    } catch (e) { setErr(e.detail || "Delete failed"); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-light tracking-tight">Users & access</h1>
          <p className="mt-3 text-zinc-500">Create, edit, revoke, or delete portal accounts.</p>
        </div>
        {ROLES_FOR(me.role).length > 0 && (
          <button onClick={() => setOpenCreate(true)} className="rounded-full bg-[#C4A45C] hover:bg-[#A88A4A] text-white text-sm font-medium px-5 h-10">
            Invite user
          </button>
        )}
      </div>

      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

      <div className="mt-10 bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-[0.15em]">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Org</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.length === 0 ? (
              <tr><td colSpan="6" className="p-6 text-center text-zinc-400">No users.</td></tr>
            ) : users.map((u) => {
              const manageable = canManage(me.role, u.role) && u.id !== me.id;
              return (
                <tr key={u.id} className={u.is_active === false ? "opacity-60" : ""}>
                  <td className="p-4 font-medium">{u.name || "—"} {u.id === me.id && <span className="ml-1 text-[10px] uppercase tracking-[0.18em] text-[#C4A45C]">you</span>}</td>
                  <td className="p-4 text-zinc-600">{u.email}</td>
                  <td className="p-4"><span className={`text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full ${ROLE_TONE[u.role] || "bg-zinc-100"}`}>{u.role}</span></td>
                  <td className="p-4 text-zinc-600">{u.org_name || "—"}</td>
                  <td className="p-4">{u.is_active === false ? <span className="text-xs text-red-700">Revoked</span> : <span className="text-xs text-emerald-700">Active</span>}</td>
                  <td className="p-4">
                    {manageable ? (
                      <div className="flex flex-wrap gap-2 text-xs">
                        <button onClick={() => setEditing(u)} className="text-zinc-700 hover:text-black">Edit</button>
                        <button onClick={() => toggleActive(u)} className="text-zinc-700 hover:text-black">{u.is_active === false ? "Restore" : "Revoke"}</button>
                        <button onClick={() => setResetting(u)} className="text-zinc-700 hover:text-black">Reset password</button>
                        <button onClick={() => remove(u)} className="text-red-600 hover:text-red-700">Delete</button>
                      </div>
                    ) : <span className="text-xs text-zinc-400">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {openCreate && <CreateUserModal me={me} busy={busy} onClose={() => setOpenCreate(false)} onCreate={create} />}
      {editing && <EditUserModal me={me} user={editing} busy={busy} onClose={() => setEditing(null)} onSave={(patch) => update(editing.id, patch)} />}
      {resetting && <ResetPasswordModal user={resetting} busy={busy} onClose={() => setResetting(null)} onSave={(pw) => reset(resetting.id, pw)} />}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm grid place-items-center p-6 z-50">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl max-w-md w-full p-8">{children}</div>
    </div>
  );
}

function CreateUserModal({ me, busy, onClose, onCreate }) {
  const [form, setForm] = useState({ email: "", name: "", role: ROLES_FOR(me.role)[0] || "client", password: "", org_name: "" });
  const submit = (e) => { e.preventDefault(); onCreate(form); };
  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-light tracking-tight">Invite user</h2>
      <p className="mt-2 text-sm text-zinc-500">They'll be able to sign in immediately with the password you set.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" className="w-full h-11 px-4 rounded-xl bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-[#C4A45C] outline-none" />
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name (optional)" className="w-full h-11 px-4 rounded-xl bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-[#C4A45C] outline-none" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-zinc-100">
          {ROLES_FOR(me.role).map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {form.role === "client" && (
          <input value={form.org_name} onChange={(e) => setForm({ ...form, org_name: e.target.value })} placeholder="Organization name" className="w-full h-11 px-4 rounded-xl bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-[#C4A45C] outline-none" />
        )}
        <input required type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Initial password (min 6 chars)" className="w-full h-11 px-4 rounded-xl bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-[#C4A45C] outline-none" />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-full px-5 h-10 text-sm text-zinc-600 hover:text-black">Cancel</button>
          <button disabled={busy} className="rounded-full bg-[#C4A45C] hover:bg-[#A88A4A] text-white text-sm font-medium px-5 h-10 disabled:opacity-60">{busy ? "Creating…" : "Create"}</button>
        </div>
      </form>
    </Modal>
  );
}

function EditUserModal({ me, user, busy, onClose, onSave }) {
  const [form, setForm] = useState({ name: user.name || "", role: user.role, org_name: user.org_name || "" });
  const submit = (e) => { e.preventDefault(); onSave(form); };
  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-light tracking-tight">Edit user</h2>
      <p className="mt-2 text-sm text-zinc-500">{user.email}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full h-11 px-4 rounded-xl bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-[#C4A45C] outline-none" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-zinc-100">
          {ROLES_FOR(me.role).map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {form.role === "client" && (
          <input value={form.org_name} onChange={(e) => setForm({ ...form, org_name: e.target.value })} placeholder="Organization name" className="w-full h-11 px-4 rounded-xl bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-[#C4A45C] outline-none" />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-full px-5 h-10 text-sm text-zinc-600 hover:text-black">Cancel</button>
          <button disabled={busy} className="rounded-full bg-black text-white text-sm font-medium px-5 h-10 disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
}

function ResetPasswordModal({ user, busy, onClose, onSave }) {
  const [pw, setPw] = useState("");
  const submit = (e) => { e.preventDefault(); onSave(pw); };
  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-light tracking-tight">Reset password</h2>
      <p className="mt-2 text-sm text-zinc-500">{user.email}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input required type="password" minLength="6" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password (min 6 chars)" className="w-full h-11 px-4 rounded-xl bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-[#C4A45C] outline-none" />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-full px-5 h-10 text-sm text-zinc-600 hover:text-black">Cancel</button>
          <button disabled={busy} className="rounded-full bg-black text-white text-sm font-medium px-5 h-10 disabled:opacity-60">{busy ? "Saving…" : "Reset"}</button>
        </div>
      </form>
    </Modal>
  );
}
