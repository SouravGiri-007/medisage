# MediSage — Free Deployment Guide

This guide walks through deploying both the backend (Flask) and frontend (React/Vite) using **entirely free-tier** services: **Render** for the backend, **Vercel** for the frontend, **Firebase** for auth/database, and **Groq** for AI.

---

## Prerequisites

| Service | What you need | Cost |
|---|---|---|
| [Render](https://render.com) | GitHub account (Web Service) | Free (750 hrs/mo) |
| [Vercel](https://vercel.com) | GitHub account | Free |
| [Firebase](https://firebase.google.com) | Google account | Free (Spark plan) |
| [Groq](https://console.groq.com) | Groq account (free API key) | Free (30 req/min) |

---

## 1. Backend — Render (Free Web Service)

### 1a. Prepare the repo

Add these files to `backend/` so Render knows how to start your app:

**`backend/Procfile`** (Render uses this for start command):
```
web: gunicorn app:create_app --workers 2 --timeout 120 --bind 0.0.0.0:$PORT
```

**`backend/render.yaml`** (optional — enables Infrastructure-as-Code):
```yaml
services:
  - type: web
    name: medisage-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:create_app --workers 2 --timeout 120
    envVars:
      - key: GROQ_API_KEY
        sync: false
      - key: FIREBASE_SERVICE_ACCOUNT_PATH
        value: serviceAccountKey.json
      - key: CORS_ORIGINS
        value: https://medisage.vercel.app,http://localhost:5173
      - key: FLASK_ENV
        value: production
```

### 1b. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/medisage.git
git push -u origin main
```

### 1c. Deploy on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Connect your GitHub repo
3. Fill in the form:
   - **Name**: `medisage-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:create_app --workers 2 --timeout 120 --bind 0.0.0.0:$PORT`
   - **Plan**: **Free**
4. Add Environment Variables:
   - `GROQ_API_KEY` — paste your Groq key
   - `FIREBASE_SERVICE_ACCOUNT_PATH` — `serviceAccountKey.json`
   - `CORS_ORIGINS` — `https://medisage.vercel.app,http://localhost:5173`
   - `FLASK_ENV` — `production`
5. Upload `backend/serviceAccountKey.json`:
   - After the service is created, go to **Environment** tab → **Secret Files**
   - Add file: **Filename** = `serviceAccountKey.json`, **Content** = paste the full JSON from Firebase
6. Click **Deploy**

Your backend URL will be: `https://medisage-api.onrender.com`

> **Note**: Render free tier spins down after 15 min of inactivity. First request after idle takes ~30s to cold-start. Upgrade to Starter ($7/mo) for always-on.

---

## 2. Frontend — Vercel (Free)

### 2a. Create `frontend/vercel.json`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures client-side routing works (React Router handles paths directly instead of hitting a 404 on Vercel).

### 2b. Set production API URL

**`frontend/.env.production`** (create this file):
```
VITE_API_URL=https://medisage-api.onrender.com/api

VITE_FIREBASE_API_KEY=AIzaSyDfFBkVtnwVMeDrKU0OxZ7C4KSw__PpP_8
VITE_FIREBASE_AUTH_DOMAIN=medisage-555fb.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=medisage-555fb
VITE_FIREBASE_STORAGE_BUCKET=medisage-555fb.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=381321652896
VITE_FIREBASE_APP_ID=1:381321652896:web:4be97a2f4587a76f91b7c5
```

Replace `https://medisage-api.onrender.com` with your actual Render URL. Keep the Firebase values from your project.

**Important**: `VITE_` prefix is required — Vite only exposes env vars prefixed with `VITE_` to the client bundle.

### 2c. Deploy on Vercel

1. Push your repo to GitHub (including the new files above)
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
3. Import your GitHub repo
4. Set:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables (same as `.env.production` above):
   - `VITE_API_URL`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. Click **Deploy**

Your frontend URL will be: `https://medisage.vercel.app`

### 2d. Update CORS on Render

Go back to Render dashboard → your service → **Environment** → edit `CORS_ORIGINS`:

```
CORS_ORIGINS = https://medisage.vercel.app,http://localhost:5173
```

Then **Manual Deploy** → **Deploy latest commit** to apply the change.

---

## 3. Firebase Firestore — Sync Rules

Before users can save analyses, apply these security rules in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com) → **Firestore** → **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /analyses/{analysisId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /sessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;

        match /messages/{messageId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
  }
}
```

3. Click **Publish**

---

## 4. Alternative Free Deploy Options

### Backend alternatives (instead of Render)

| Service | Pros | Cons |
|---|---|---|
| **Railway** (railway.app) | $5 free credit, faster cold-start | Need to add credit card |
| **PythonAnywhere** (pythonanywhere.com) | Always-on, no cold-start | No pip for some native deps (faiss) |
| **Fly.io** (fly.io) | 3 shared VMs free | Need credit card |

### Frontend alternatives (instead of Vercel)

| Service | Pros | Cons |
|---|---|---|
| **Netlify** | Equivalent to Vercel, same setup | Slightly slower builds |
| **Cloudflare Pages** | Unlimited bandwidth on free tier | Less ecosystem support |

---

## 5. Post-Deployment Checklist

| # | Step | Check |
|---|---|---|
| 1 | Backend responds at `https://medisage-api.onrender.com/api/health/score` (should return JSON) | |
| 2 | Frontend loads at Vercel URL without errors | |
| 3 | User can sign up (Firebase Auth working) | |
| 4 | User can upload a PDF and get analysis (Groq API key valid) | |
| 5 | Chat with report works (RAG pipeline functional) | |
| 6 | Health trends page shows data | |
| 7 | CORS not blocking requests (open browser DevTools → Console) | |

---

## 6. Cost Breakdown

| Service | What it does | Free tier limits |
|---|---|---|
| Render | Backend server | 750 hours/mo (~31 days continuous), 512 MB RAM |
| Vercel | Frontend hosting | 100 GB bandwidth, 6000 build minutes/mo |
| Firebase Auth | User authentication | 50k MAU (monthly active users) |
| Firestore | Database | 1 GiB stored, 50k reads/day, 20k writes/day |
| Groq | AI inference | 30 req/min, rate-limited by model |
| GitHub | Source control | Unlimited public repos |

**Total monthly cost: $0**

---

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Blank page on Vercel | `vercel.json` missing SPA rewrites | Add `vercel.json` with `rewrites` block (see section 2a) |
| API returns 502 on first request | Render cold start | Wait ~30s and refresh |
| CORS error in browser | `CORS_ORIGINS` doesn't include Vercel URL | Update env var on Render, redeploy |
| "Daily limit reached" | Rate limiter uses local time | Check Firestore counter; resets after 24h |
| "Model not found" | Groq model name outdated | Check `agents/model_manager.py` for valid model names |
| Firebase auth fails | `serviceAccountKey.json` not uploaded to Render | Add as Secret File in Render dashboard |
| Profile creation fails (silent 401) | `serviceAccountKey.json` permissions wrong | Regenerate key in Firebase Console |
| RAG chat returns empty | FAISS index not building | Check `chat_agent.py` chunking logic |

---

## 8. Quick Deploy (One-Click)

If you want to skip the manual steps above, create a **`render.yaml`** in the repo root:

```yaml
services:
  - type: web
    name: medisage-api
    env: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:create_app --workers 2 --timeout 120
    envVars:
      - key: GROQ_API_KEY
        sync: false
      - key: FIREBASE_SERVICE_ACCOUNT_PATH
        value: serviceAccountKey.json
      - key: CORS_ORIGINS
        value: https://medisage.vercel.app,http://localhost:5173
      - key: FLASK_ENV
        value: production
```

Then use **Render Blueprint** → connect repo → Render auto-detects `render.yaml`.