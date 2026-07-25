# MediSage — Architecture & Workflow

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER (React SPA)                       │
│                                                                  │
│  Login/Signup ──► AuthContext ──► Firebase Auth SDK              │
│       │                                                          │
│       ▼                                                          │
│  Dashboard ──► Analysis ──► History ──► Trends                   │
│       │           │               │           │                  │
│       │           ▼               │           │                  │
│       │    4-Step Wizard:        │           │                  │
│       │    Upload → Patient      │           │                  │
│       │    → AI Analysis → Chat  │           │                  │
│       │                          │           │                  │
│       └────────── api.js ────────┴───────────┘                  │
│                      │  (fetch with Bearer token)                │
└──────────────────────┼───────────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    FLASK BACKEND (:5000)                          │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Auth     │  │ Analysis │  │ Chat     │  │ Health   │         │
│  │ Routes   │  │ Routes   │  │ Routes   │  │ Routes   │         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │              │             │             │               │
│       ▼              ▼             ▼             ▼               │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │                   Middleware Layer                       │     │
│  │   verify_token(request) → (uid, error)                   │     │
│  │   Rate limiter: 15 analyses/day, 24h auto-reset          │     │
│  └─────────────────────────────────────────────────────────┘     │
│       │              │             │             │               │
│       ▼              ▼             ▼             ▼               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Firebase │  │ Analysis │  │ Chat     │  │ Trend    │         │
│  │ Admin    │  │ Agent    │  │ Agent    │  │ Agent    │         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │              │             │             │               │
│       ▼              ▼             ▼             ▼               │
│  ┌──────────┐  ┌────────────────────────────────────────┐        │
│  │ Firestore│  │           ModelManager                  │        │
│  │ + Auth   │  │  4-tier fallback:                      │        │
│  └──────────┘  │  Llama 3.3 70B → Llama 3.1 8B         │        │
│                │  → Llama3 70B → Llama3 8B              │        │
│                └──────────────┬─────────────────────────┘        │
│                               │                                  │
│                               ▼                                  │
│                        ┌──────────────┐                          │
│                        │  Groq API    │                          │
│                        │  (REST)      │                          │
│                        └──────────────┘                          │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────────┐        │
│  │pdfplumber│  │ FAISS    │  │ LangChain               │        │
│  │(PDF→text)│  │ VectorDB │  │ TextSplitter +          │        │
│  └──────────┘  └──────────┘  │ HuggingFaceEmbeddings    │        │
│                              └─────────────────────────┘        │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    GROQ CLOUD (External)                          │
│  Llama 3.3-70B / Llama 3.1-8B / Llama3-70B / Llama3-8B          │
│  Free tier: 30 requests/min, 6000 tokens/min                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 1. Frontend — React SPA

### 1.1 Page Tree

```
/ (redirects to /dashboard)
├── /login       → Login.jsx       (public)
├── /signup      → Signup.jsx      (public)
├── /dashboard   → Dashboard.jsx   (protected, requires auth)
├── /analysis    → Analysis.jsx    (protected, 4-step wizard)
├── /history     → History.jsx     (protected, past analyses)
└── /trends      → Trends.jsx      (protected, health marker charts)
```

### 1.2 Route Guards

Defined in `App.jsx`:
- **ProtectedRoute**: renders children only if `user` is non-null; otherwise redirects to `/login`. Shows a spinner while Firebase Auth resolves the `loading` state.
- **PublicRoute**: renders children only if `user` is null; otherwise redirects to `/dashboard`.

### 1.3 Auth Flow

```
User enters email + password on Login.jsx
        │
        ▼
AuthContext.login(email, password)
        │
        ▼
Firebase Auth SDK (client-side):
  signInWithEmailAndPassword()
        │
        ▼
onAuthStateChanged fires → setUser(firebaseUser)
        │
        ▼
ProtectedRoute detects user → renders page
        │
        ▼
Dashboard / Analysis.jsx calls getToken() → getIdToken()
        │
        ▼
API call uses Bearer token:
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        │
        ▼
Backend verify_token() decodes Firebase JWT → extracts uid
```

### 1.4 Analysis Wizard (4 Steps)

Managed by `Analysis.jsx` with a `step` state (0-3):

| Step | Component | Action |
|------|-----------|--------|
| 0 | Upload Report | Drag-and-drop PDF or select "Use Sample" |
| 1 | Patient Info | Optional name/age/gender form |
| 2 | AI Analysis | Shows health score card + markdown analysis |
| 3 | Chat with AI | ChatWindow with RAG on the report |

Step 2 flow:
```
handleAnalyze() called
        │
        ▼
Build FormData(file, patient_name, age, gender, use_sample)
        │
        ▼
POST /api/analysis/analyze (with Bearer token)
        │
        ▼
If success: setResult(data), then POST /api/health/score
for health score (fire-and-forget)
        │
        ▼
Display analysis markdown via ReactMarkdown + health score card
```

---

## 2. Backend — Flask

### 2.1 Route Modules

| Blueprint | Prefix | Endpoints |
|-----------|--------|-----------|
| `auth_bp` | `/api/auth` | `GET/POST /profile` |
| `analysis_bp` | `/api/analysis` | `POST /analyze`, `GET /history`, `GET /rate-limit` |
| `chat_bp` | `/api/chat` | `POST /message`, `GET /history/<session_id>`, `DELETE /session/<session_id>` |
| `health_bp` | `/api/health` | `GET /trends`, `POST /score` |

### 2.2 Request Lifecycle (Analysis)

```
POST /api/analysis/analyze
  multipart/form-data: file (PDF), patient_name, age, gender, use_sample
        │
        ▼
1. verify_token(request) → uid
    - Extracts "Bearer <token>" from Authorization header
    - Calls Firebase Admin auth.verify_id_token(token)
    - Returns uid or 401
        │
        ▼
2. get_user_analysis_count(uid) → (count, limit, reset_in)
    - Reads Firestore: /users/{uid}.analysis_count
    - If last_reset > 24h ago: reset count to 0
    - If count >= limit: return 429 Too Many Requests
        │
        ▼
3. Validate input
    - File: .pdf extension, <20MB
    - PDF text extraction via pdfplumber
    - Content: >50 chars, ≥3 medical terms matched
        │
        ▼
4. analysis_agent.analyze_report(data, uid)
    - Build prompt with patient profile
    - Call ModelManager.generate(system_prompt, data)
        │
        ▼
5. ModelManager — 4-tier fallback
    Tier 1: llama-3.3-70b-versatile
    Tier 2: llama-3.1-8b-instant
    Tier 3: llama3-70b-8192
    Tier 4: llama3-8b-8192
        │
        ▼
6. On success:
    - increment_analysis_count(uid)
    - save_analysis(...) to Firestore
    - Return analysis text + model_used + usage stats
```

### 2.3 RAG Chat Flow

```
POST /api/chat/message
  { session_id, message, report_text, chat_history }
        │
        ▼
1. verify_token → uid
        │
        ▼
2. chat_agent.initialize_vector_store(report_text)
    - Split text into 1000-char chunks (200 overlap)
    - Embed each chunk with all-MiniLM-L6-v2 (HuggingFace)
    - Store in FAISS in-memory vector index
        │
        ▼
3. chat_agent.get_response(query, vectorstore, history)
    - _contextualize(): rewrite question with history context (via LLM)
    - Retrieve top-3 chunks from FAISS
    - Build prompt: system + context + last 6 messages
    - Call Groq Llama 3.3-70B
    - Return response text
        │
        ▼
4. save_chat_message(uid, session_id, role, content) to Firestore
        │
        ▼
5. Return { response: "..." }
```

### 2.4 Health Trends Flow

```
GET /api/health/trends
        │
        ▼
1. verify_token → uid
        │
        ▼
2. get_analysis_history(uid)
    - Firestore: /users/{uid}/analyses ordered by created_at DESC, limit 10
        │
        ▼
3. trend_agent.extract_trends(history)
    - For each analysis, check 20 predefined HEALTH_MARKERS
    - Regex extract numeric values near marker names
    - Group by marker, track dates + values
    - Determine trend direction (up/down/stable)
        │
        ▼
4. Return [{ marker, dates[], values[], trend, status }]
```

### 2.5 Health Score Flow

```
POST /api/health/score
  { analysis: "..." }
        │
        ▼
1. verify_token → uid
        │
        ▼
2. trend_agent.calculate_health_score(analysis_text)
    - Build JSON prompt with the analysis text (first 2000 chars)
    - Call Groq Llama 3.1-8B with temperature 0.2
    - Parse response as JSON: { score, grade, summary, risk_areas[] }
        │
        ▼
3. Return { score: { score, grade, summary, risk_areas } }
```

---

## 3. Data Model — Firestore

```
/users/{uid}                          ← User document
├── name: string
├── email: string
├── created_at: timestamp
├── analysis_count: number
├── analysis_limit: number (15)
├── last_reset: timestamp
│
├── /analyses/{analysisId}            ← Subcollection
│   ├── patient_name: string
│   ├── age: string
│   ├── gender: string
│   ├── report_text: string
│   ├── analysis_text: string
│   ├── model_used: string
│   ├── health_score: object | null
│   └── created_at: timestamp
│
└── /sessions/{sessionId}             ← Subcollection
    └── /messages/{messageId}         ← Sub-subcollection
        ├── role: "user" | "assistant"
        ├── content: string
        └── timestamp: timestamp
```

### Security Rules

```
/users/{userId} → read/write only if request.auth.uid == userId
  /analyses/{id} → same rule
  /sessions/{id} → same rule
    /messages/{id} → same rule
```

---

## 4. Agent Architecture

### AnalysisAgent

```
AnalysisAgent.analyze_report(data, uid)
    │
    ├─ _preprocess() → clean patient info
    ├─ _build_prompt() → system prompt + patient profile
    └─ ModelManager.generate()
```

### ModelManager

```
ModelManager.generate(data, system_prompt, retry=0)
    │
    ├─ Pick tier from TIERS[retry]
    ├─ Call Groq API
    ├─ On success → return { success, content, model_used }
    └─ On failure → retry + 1 (if all 4 fail → return error)
```

### ChatAgent

```
ChatAgent.initialize_vector_store(text)
    └─ Split → Embed → FAISS

ChatAgent.get_response(query, vectorstore, history)
    ├─ _contextualize() → rewrite question with history
    ├─ Retrieve from FAISS (top-3)
    ├─ Build Groq messages: system + history + context + query
    └─ Return LLM response
```

### TrendAgent

```
TrendAgent.extract_trends(history)
    └─ For each marker: regex extract values → group by marker → trend direction

TrendAgent.calculate_health_score(analysis)
    └─ JSON prompt → Groq → parse JSON score
```

---

## 5. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Firebase Auth (client-side)** | Free, handles token refresh, session persistence. Backend verifies tokens independently via Firebase Admin SDK. |
| **4-tier model fallback** | Groq free tier has rate limits and model availability changes. Fallback ensures the app never returns a 500 if one model is overloaded. |
| **FAISS in-memory** | No need for a vector DB service. FAISS lives per-request (created from report text on each chat). Simpler deployment, no extra infra. |
| **Rate limiting in Firestore** | No Redis needed. Counters stored per-user in Firestore with 24h expiry. Simple, works on free tier. |
| **pdfplumber over PyMuPDF** | Lighter dependency, MIT license, good enough for text-based PDFs (lab reports). |
| **Plain JSX (no TypeScript)** | Originally chosen for speed. `@types/react` is in devDeps but unused. |
| **ReactMarkdown for output** | AI returns structured markdown (tables, headings, lists). ReactMarkdown renders it safely without `dangerouslySetInnerHTML`. |
| **Chat session isolation** | Each analysis creates a unique `session_${Date.now()}` ID. Chat messages are namespaced per-session under Firestore subcollections. |

---

## 6. Data Flow Diagram (Single Analysis)

```
User uploads PDF
       │
       ▼
Frontend: Analysis.jsx (FormData)
       │
       ▼ POST /api/analysis/analyze
Flask: analysis_routes.py
       │
       ├── verify_token() → uid
       ├── get_user_analysis_count() → check rate limit
       ├── validate_pdf_file() → check .pdf + <20MB
       ├── extract_text_from_pdf() → pdfplumber
       ├── validate_pdf_content() → check medical terms
       │
       ▼
AnalysisAgent.analyze_report(data, uid)
       │
       ├── _preprocess() → clean data
       ├── _build_prompt() → specialist system prompt
       │
       ▼
ModelManager.generate()
       │
       ├── Tier 1: llama-3.3-70b-versatile → SUCCESS?
       │   ├── Yes → return result
       │   └── No → Tier 2: llama-3.1-8b-instant → SUCCESS?
       │       ├── Yes → return result
       │       └── No → Tier 3: llama3-70b-8192 → SUCCESS?
       │           ├── Yes → return result
       │           └── No → Tier 4: llama3-8b-8192
       │               ├── Yes → return result
       │               └── No → return error
       │
       ▼
Flask receives { success, content, model_used }
       │
       ├── increment_analysis_count(uid)
       ├── save_analysis(uid, ...) → Firestore
       │
       ▼
Response: { analysis, model_used, report_text, analyses_used, limit }
       │
       ▼
Frontend: Analysis.jsx
       │
       ├── Display health score card
       ├── Render markdown via ReactMarkdown
       │
       ▼ (optional, on "Chat about this report")
POST /api/chat/message
       │
       ├── ChatAgent.initialize_vector_store(report_text)
       │   └── FAISS index built in-memory
       │
       ├── ChatAgent.get_response(query, vectorstore, history)
       │   └── RAG: retrieve → augment → generate
       │
       └── Response displayed in ChatWindow
```

---

## 7. Testing Architecture

### Backend (pytest, 21 tests)

```
tests/
├── test_validators.py       # PDF validation, email, password (11 tests)
├── test_pdf_extractor.py    # PDF text extraction mocks (4 tests)
├── test_model_manager.py    # Model fallback chain mocks (4 tests)
└── __init__.py
```

Run: `cd backend && python -m pytest tests/ -v`

### Frontend (vitest, 6 tests)

```
src/__tests__/
├── api.test.js     # API client: GET, POST, FormData, error handling (4 tests)
└── App.test.jsx    # Login + Signup page rendering (2 tests)
```

Run: `cd frontend && npm test`