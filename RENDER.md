## Render.com — One-click backend deploy

This repo includes a `render.yaml` Blueprint. Render reads it and provisions everything automatically.

### 1. Create a free MongoDB Atlas cluster (3 min)
1. Sign up at https://www.mongodb.com/cloud/atlas/register (free forever, M0 tier).
2. Create a project → Build a Database → **M0 Free**.
3. **Database Access** → add a user (e.g. `zheltaapi` / strong password).
4. **Network Access** → Add IP → **Allow access from anywhere** (`0.0.0.0/0`) — fine for the demo, lock it down later.
5. **Database** → Connect → Drivers → **Python** → copy the `mongodb+srv://...` connection string.
6. Replace `<password>` in the string with the password from step 3.

### 2. Deploy to Render (4 clicks, 3 min)
1. Sign up at https://dashboard.render.com.
2. **New +** → **Blueprint**.
3. Connect your GitHub → pick `zhelta-systems-portal` → **Apply**.
4. Render shows the env-var prompt: paste your **MongoDB Atlas URI** into `MONGO_URL`. Click **Deploy**.

Render will:
- Install `backend/requirements.txt`
- Start `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Probe `/api/health` until 200 OK
- Hand back a public URL like `https://zhelta-systems-portal-api.onrender.com`

### 3. Wire it to the frontend
- In Vercel → your `zhelta-systems-portal` project → Settings → Environment Variables.
- Add `VITE_API_BASE_URL = https://zhelta-systems-portal-api.onrender.com`
- Deployments → Redeploy.

### 4. Log in
- https://zhelta-systems-portal.vercel.app
- Admin: `admin@zheltasystems.com` / `Demo@2026!`
- Client: `client@acme.com` / `Demo@2026!`

The backend's lifespan handler seeds the demo accounts on first start automatically — no manual DB setup needed.

### Free tier note
Render's free web service spins down after 15 minutes of inactivity. The first request after a cold start takes ~30s; subsequent requests are instant. For production, upgrade to Starter ($7/mo) — or skip Render entirely and clone this repo to your Hostinger VPS as planned.
