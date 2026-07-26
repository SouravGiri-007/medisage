# 🧬 MediSage — AI-Powered Medical Report Analyzer

> **Understand your health with AI.** Upload blood reports, receive intelligent analysis, predict health risks, and chat with an AI healthcare assistant.

![Version](https://img.shields.io/badge/version-1.0.0-22D3EE?style=flat-square)
![React](https://img.shields.io/badge/React-18-3B82F6?style=flat-square&logo=react)
![Flask](https://img.shields.io/badge/Flask-3.x-22D3EE?style=flat-square&logo=flask)
![Python](https://img.shields.io/badge/Python-3.11+-22D3EE?style=flat-square&logo=python)
![Firebase](https://img.shields.io/badge/Firebase-Auth+Firestore-FFCA28?style=flat-square&logo=firebase)
![Groq](https://img.shields.io/badge/Groq-Llama_4-22D3EE?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-94A3B8?style=flat-square)

---

## 📸 Screenshots

> _Screenshot placeholder — add your dashboard, analysis, and login page screenshots here._

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔬 **AI Report Analysis** | Upload PDF blood reports and receive detailed AI-generated insights with parameter tables, risk assessment, and recommendations |
| 💬 **RAG Chat** | Chat with your report using Retrieval-Augmented Generation (FAISS vector store) — ask questions and get context-aware answers |
| 🏆 **Health Score** | AI-generated health score (0–100) with letter grade, risk areas breakdown, and circular progress visualization |
| 🔄 **4-Tier Model Fallback** | Llama 4 Scout → Llama 3.3 70B → Llama 3.1 8B → fallback response — never fails due to rate limits |
| 🔒 **Firebase Authentication** | Secure email/password signup/login with auto-profile creation on backend |
| 🔐 **JWT Verification** | Firebase ID tokens verified on every backend request — no unprotected endpoints |
| 🗄️ **Firestore Storage** | Per-user data isolation with sub-collections for analyses, chat sessions, and messages |
| ⏱️ **Rate Limiting** | 15 analyses/day per user with automatic 24-hour reset and real-time usage bar |
| 📜 **Analysis History** | Full history with expandable report view, health score badges, and quick re-analysis |
| 🎨 **Premium Dark UI** | Glassmorphism cards, cyan/blue gradient accents, Framer Motion animations — Linear/Stripe/Vercel quality |
| 📱 **Responsive** | 60/40 split desktop layout collapses to single-column on mobile |
| 📄 **Sample Reports** | 3 pre-loaded demo PDFs (healthy, pre-diabetic, moderate risk) for instant testing |
| 🔎 **Forgot Password** | Firebase password reset email flow with dedicated UI |

---

## 🏗️ Tech Stack

```
Layer       Technology
─────────────────────────────────────────────────────
Frontend    React 18 + Vite 5 + Tailwind CSS 3 + React Router 6
Animations  Framer Motion 12
Charts      Recharts 2
Backend     Flask 3.x + Python 3.11+
AI Models   Groq API — Llama 4 Scout, Llama 3.3 70B, Llama 3.1 8B
RAG         LangChain + FAISS (local vector store)
Embeddings  FastEmbed (ONNX — no PyTorch dependency)
Auth        Firebase Authentication (email/password)
Database    Cloud Firestore (NoSQL)
PDF         pdfplumber
Testing     pytest (backend 21 tests) + Vitest (frontend 6 tests)
Deploy      Render (backend) + Vercel (frontend)
```

### Why FastEmbed instead of HuggingFace?

| Library | Size | RAM | Works on Render Free |
|---------|------|-----|---------------------|
| `sentence-transformers` | ~1.5 GB | ~2 GB | ❌ OOM kill |
| `FastEmbed` (ONNX) | ~100 MB | ~200 MB | ✅ Yes |

Render's free tier has 512 MB RAM — FastEmbed is the only viable option.

---

## 📁 Project Structure

```
medisage/
├── backend/
│   ├── app.py                  ← Flask app factory + create_app()
│   ├── Procfile                ← Gunicorn entry: web: gunicorn app:app
│   ├── requirements.txt
│   ├── .env.example
│   ├── routes/
│   │   ├── analysis_routes.py  ← PDF upload, AI analysis, rate limiting
│   │   ├── chat_routes.py      ← RAG chat with FAISS vector store
│   │   ├── chat_routes.py      ← Chat session management
│   │   ├── health_routes.py    ← Health score + trend extraction
│   │   ├── auth_routes.py      ← Profile creation/management
│   │   └── __init__.py
│   ├── agents/
│   │   ├── analysis_agent.py   ← Orchestrates report analysis with Groq
│   │   ├── chat_agent.py       ← RAG — chunks report, builds FAISS index, answers queries
│   │   ├── model_manager.py    ← 4-tier model fallback chain
│   │   ├── trend_agent.py      ← Extracts health markers from analysis
│   │   └── __init__.py
│   ├── utils/
│   │   ├── firebase_admin.py   ← Lazy Firebase init, Firestore CRUD, token verification
│   │   ├── pdf_extractor.py    ← PDF text extraction via pdfplumber
│   │   └── validators.py       ← Email, password, PDF file/content validation
│   ├── config/
│   │   ├── prompts.py          ← System prompts for analysis, chat, scoring, trends
│   │   └── sample_data.py      ← 3 demo PDF readers (maps names to file paths)
│   ├── samples/                ← 3 sample PDFs for testing
│   └── tests/                  ← 21 pytest tests
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx        ← Landing page (Features, FAQ, Testimonials, CTA)
│   │   │   ├── Login.jsx       ← 60/40 split layout with dashboard preview
│   │   │   ├── Signup.jsx      ← Password strength indicator, Google sign-up
│   │   │   ├── Dashboard.jsx   ← Stats, usage bar, quick actions, recent history
│   │   │   ├── Analysis.jsx    ← 4-step wizard (Upload → Patient Info → Results → Chat)
│   │   │   ├── History.jsx     ← Full analysis history with expandable cards
│   │   │   └── Trends.jsx      ← Health marker charts over time
│   │   ├── components/
│   │   │   ├── Layout.jsx      ← Dashboard shell with sidebar navigation
│   │   │   └── ChatWindow.jsx  ← AI chat interface with markdown rendering
│   │   ├── context/AuthContext.jsx ← Firebase auth state + login/signup/logout/Google
│   │   ├── firebase/config.js  ← Firebase SDK initialization (lazy)
│   │   └── utils/api.js        ← Fetch wrapper with auto-token injection
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── DEPLOYMENT.md               ← Full free-tier deployment guide
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Firebase project (Auth + Firestore enabled)
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Firebase Setup

```bash
# 1. Go to Firebase Console → Create Project
# 2. Enable Authentication → Sign-in method → Email/Password
# 3. Enable Cloud Firestore → Start in production mode
# 4. Project Settings → Service Accounts → Generate new private key
#    Save as: backend/serviceAccountKey.json
# 5. Project Settings → Your Apps → Add Web App
#    Copy the Firebase config object (apiKey, authDomain, etc.)
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set GROQ_API_KEY and FIREBASE_SERVICE_ACCOUNT_PATH

# Place the Firebase service account key
# (already saved as backend/serviceAccountKey.json)

python app.py
# → Flask runs on http://localhost:5000
# → Health check: http://localhost:5000/_health
```

### 3. Frontend Setup

```bash
cd frontend
npm install

cp .env.example .env
# Edit .env — paste Firebase Web App config values

npm run dev
# → React runs on http://localhost:5173
```

### 4. Open the App

Visit **http://localhost:5173** — sign up with email/password, then click **New Analysis** and select a sample report to test.

---

## 🌐 API Reference

All endpoints except `/_health` require a Firebase ID token in the `Authorization: Bearer <token>` header.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/_health` | Health check (no Firebase needed) | ❌ |
| `POST` | `/auth/profile` | Create/update user profile | ✅ |
| `POST` | `/analysis/analyze` | Upload PDF + get AI analysis | ✅ |
| `GET` | `/analysis/history` | List past analyses | ✅ |
| `GET` | `/analysis/rate-limit` | Check daily usage | ✅ |
| `POST` | `/health/score` | Get health score from analysis text | ✅ |
| `POST` | `/chat/session` | Create chat session | ✅ |
| `POST` | `/chat/session/<id>/message` | Send chat message | ✅ |
| `GET` | `/chat/session/<id>/messages` | Load chat history | ✅ |

### Sample Request

```bash
# Analyze a report
curl -X POST http://localhost:5000/analysis/analyze \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -F "file=@report.pdf" \
  -F "patient_name=John Doe" \
  -F "age=45" \
  -F "gender=Male"

# Or use a pre-loaded sample
curl -X POST http://localhost:5000/analysis/analyze \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -F "use_sample=true" \
  -F "sample_name=rohan"
```

---

## 🔥 Firestore Security Rules

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

---

## 🧪 Testing

### Backend (pytest)

```bash
cd backend
python -m pytest tests/ -v
# 21 tests — model manager, PDF extraction, validators
```

### Frontend (Vitest)

```bash
cd frontend
npm test
# 6 tests — API client (GET/POST/FormData/error), Login/Signup render
```

---

## 🤖 How It Works

```
User Uploads PDF
      │
      ▼
pdfplumber extracts text
      │
      ▼
AnalysisAgent sends text + patient info to Groq
      │
      ▼
ModelManager tries: Llama 4 → Llama 3.3 70B → Llama 3.1 8B → fallback
      │
      ▼
Returns structured markdown (Parameter Table, Risk Assessment, Recommendations)
      │
      ▼
TrendAgent scores health 0–100 in a separate fast model call
      │
      ▼
Report text chunked → embedded with FastEmbed → stored in FAISS index
      │
      ▼
User can chat about the report via RAG (LangChain + FAISS retriever)
      │
      ▼
All data persisted to Firestore under /users/{uid}/analyses/{id}
```

---

## 🧠 Architecture Highlights

### Lazy Firebase Initialization

Firebase Admin SDK is initialized **on demand**, not at import time. This prevents crashes on Render before the server binds to a port:

```python
# utils/firebase_admin.py
_firebase_app = None

def _init_firebase():
    global _firebase_app
    if _firebase_app is None:
        cred = credentials.Certificate(cert_path)
        _firebase_app = firebase_admin.initialize_app(cred)
    return _firebase_app

def verify_token(request):
    _init_firebase()  # Safe to call every time — no-op if already initialized
    ...
```

### 4-Tier Model Fallback

```python
MODELS = [
    "meta-llama/llama-4-scout-17b-16e-instruct",     # Tier 1
    "meta-llama/llama-3.3-70b-versatile",             # Tier 2
    "meta-llama/llama-3.1-8b-instant",                # Tier 3
    None,                                              # Fallback response
]

# On rate limit or model-not-found, automatically tries the next tier
```

### Health Report Card Layout

The analysis result card uses a clean `flex flex-col gap-5` layout — no absolute positioning, no negative margins, no `translateY` hacks:

```
┌──────────────────────────────────────┐
│ [Icon] Health Report      [Verified] │
│        AI Analysis Complete          │
│                                      │
│              ████                    │
│              72                      │
│         Health Score                 │
│           Grade B                    │
│                                      │
│            ○  Progress Ring          │
│                                      │
│  ┌─────────┐ ┌─────────┐            │
│  │ BP      │ │ Glucose │            │
│  │ Normal  │ │ Normal  │            │
│  └─────────┘ └─────────┘            │
│  ┌─────────┐ ┌─────────┐            │
│  │ HbA1c   │ │ LDL     │            │
│  │ Normal  │ │ High    │            │
│  └─────────┘ └─────────┘            │
│                                      │
│  Model: llama-4  Uses: 2/15         │
└──────────────────────────────────────┘
```

### Authentication Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐
│ Login   │────▶│ Firebase │────▶│ Backend  │
│ Page    │     │ Auth     │     │ JWT Verify│
└─────────┘     └──────────┘     └──────────┘
     │               │                │
     │  email/pass   │  ID token      │  firebase_admin
     │  or Google    │  in header     │  .verify_token()
     ▼               ▼                ▼
  Authenticated ───────────────▶ Access granted
```

---

## ⚠️ Free Tier Limitations

| Resource | Limit | Mitigation |
|----------|-------|------------|
| Render RAM | 512 MB | FastEmbed instead of PyTorch; 2 Gunicorn workers |
| Render CPU | 0.5 vCPU | Single-threaded model calls |
| Groq API | 30 req/min (free) | 4-tier fallback handles rate limits gracefully |
| Groq Rate Limit | Varies by model | Falls back to smaller model automatically |
| Analyses/Day | 15 per user | 24h auto-reset, tracked in Firestore |
| Firebase Free | 50K reads/day | Optimized queries with sub-collections |
| Vercel Free | 100 GB bandwidth | Static assets only (no server functions needed) |

---

## 📄 License

MIT — feel free to use, modify, and distribute.

---

## 🙌 Acknowledgments

- [Groq](https://groq.com) for ultra-fast Llama inference
- [FastEmbed](https://github.com/qdrant/fastembed) for lightweight ONNX embeddings
- [LangChain](https://langchain.com) for RAG orchestration
- [Firebase](https://firebase.google.com) for auth + database
- [Render](https://render.com) and [Vercel](https://vercel.com) for free hosting
