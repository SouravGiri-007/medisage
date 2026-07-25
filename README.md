# 🧬 MediSage — AI-Powered Medical Report Analyzer

A full-stack web application that analyzes blood reports using AI, built with **React + Vite**, **Flask**, and **Firebase**.

## ✨ Features

| Feature | Description |
|---|---|
| 🔬 **AI Report Analysis** | Upload PDF blood reports and get detailed AI-generated insights |
| 💬 **RAG Chat** | Chat with your report using Retrieval-Augmented Generation |
| 📈 **Health Trends** | Track key health markers over time with interactive charts |
| 🏆 **Health Score** | AI-generated health score (0–100) with risk breakdown |
| 🔄 **Model Fallback** | 4-tier Llama model cascade (Llama 4 → 3.3 70B → 3.1 8B → fallback) |
| 🔒 **Firebase Auth** | Secure email/password auth with JWT verification on backend |
| 🗄️ **Firestore** | Per-user data isolation with sub-collections for sessions |
| ⏱️ **Rate Limiting** | 15 analyses/day per user with 24h auto-reset |
| 📊 **History** | Full analysis history with expandable report view |

## 🏗️ Tech Stack

```
Frontend:  React 18 + Vite + Tailwind CSS + React Router
Backend:   Flask + Python 3.11+
AI:        Groq API (Llama 4, Llama 3.3, Llama 3.1)
RAG:       LangChain + FAISS + HuggingFace embeddings
Auth/DB:   Firebase Auth + Firestore
PDF:       pdfplumber
```

## 📁 Project Structure

```
medisage/
├── backend/
│   ├── app.py                 ← Flask app factory
│   ├── routes/
│   │   ├── analysis_routes.py ← PDF upload + AI analysis
│   │   ├── chat_routes.py     ← RAG chat endpoints
│   │   ├── health_routes.py   ← Trends + health score
│   │   └── auth_routes.py     ← Profile management
│   ├── agents/
│   │   ├── analysis_agent.py  ← Report analysis orchestration
│   │   ├── chat_agent.py      ← RAG chat with FAISS
│   │   ├── model_manager.py   ← 4-tier model fallback
│   │   └── trend_agent.py     ← Health marker extraction
│   ├── utils/
│   │   ├── firebase_admin.py  ← Firestore + Auth helpers
│   │   ├── pdf_extractor.py   ← PDF text extraction
│   │   └── validators.py      ← Input validation
│   ├── config/
│   │   ├── prompts.py         ← AI system prompts
│   │   └── sample_data.py     ← Demo blood report
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx  ← Stats + usage + quick actions
    │   │   ├── Analysis.jsx   ← 4-step analysis wizard
    │   │   ├── History.jsx    ← Past analyses
    │   │   └── Trends.jsx     ← Health marker charts
    │   ├── components/
    │   │   ├── Layout.jsx     ← Sidebar navigation
    │   │   └── ChatWindow.jsx ← AI chat interface
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── firebase/config.js
    │   └── utils/api.js
    ├── package.json
    └── vite.config.js
```

## 🚀 Setup Guide

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → Create project
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** → Start in production mode
4. Go to **Project Settings** → Service Accounts → Generate new private key → save as `backend/serviceAccountKey.json`
5. Go to **Project Settings** → Your Apps → Add Web App → copy config values

### 2. Get Groq API Key

Sign up at [console.groq.com](https://console.groq.com) and create a free API key.

### 3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill env
cp .env.example .env
# Edit .env with your GROQ_API_KEY

# Place serviceAccountKey.json in backend/

python app.py
# Flask runs on http://localhost:5000
```

### 4. Frontend Setup

```bash
cd frontend
npm install

# Copy and fill env
cp .env.example .env
# Edit .env with your Firebase config values

npm run dev
# React runs on http://localhost:5173
```

## 🔥 Firestore Security Rules

Paste in Firebase Console → Firestore → Rules:

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

## 🌐 Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for a complete step-by-step guide covering:

- **Backend**: Deploy for free on Render with Gunicorn + Flask
- **Frontend**: Deploy for free on Vercel with SPA rewrites
- **Firebas

## 🤝 How It Works

1. User uploads PDF → Flask extracts text via pdfplumber
2. Text + patient info sent to `AnalysisAgent` → `ModelManager` tries Llama 4 first, falls back automatically
3. Analysis returned in structured markdown with Parameter Table, Risk Assessment, Recommendations
4. `TrendAgent` scores health 0–100 using a separate fast model call
5. Report text chunked into FAISS vector store for RAG chat
6. All data stored in Firestore under `/users/{uid}/analyses/`
