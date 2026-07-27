import os
import re
from groq import Groq
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_community.vectorstores import FAISS

MEDICAL_KEYWORDS = [
    "blood", "health", "report", "test", "lab", "result", "level", "value",
    "normal", "high", "low", "range", "risk", "symptom", "diagnosis",
    "treatment", "medication", "doctor", "disease", "condition", "infection",
    "pain", "fever", "pressure", "cholesterol", "glucose", "sugar",
    "hemoglobin", "diabetes", "thyroid", "liver", "kidney", "heart",
    "vitamin", "mineral", "iron", "calcium", "weight", "diet", "exercise",
    "sleep", "anxiety", "depression", "stress", "therapy", "surgery",
    "vaccine", "immunity", "antibody", "cell", "protein", "enzyme",
    "hormone", "lipid", "metabolism", "nutrition", "calorie", "obesity",
    "bp", "bmi", "hba1c", "ldl", "hdl", "wbc", "rbc", "crp", "alt", "ast",
    "tsh", "mcv", "mch", "creatinine", "bilirubin", "platelet",
    "prescription", "dose", "injection", "tablet", "capsule", "syrup",
    "allergy", "asthma", "arthritis", "cancer", "tumor", "fracture",
    "wound", "rash", "swelling", "inflammation", "chronic", "acute",
    "prevent", "screen", "checkup", "annual", "fasting", "urine", "stool",
    "scan", "xray", "x-ray", "ultrasound", "mri", "ct scan", "ekg", "ecg",
    "analyze", "reading", "marker", "trend", "change", "improve", "worsen",
    "advice", "recommend", "suggest", "should", "concern", "question",
    "booster", "shot", "needle", "syringe", "immunization", "antibiotic",
]

MEDICAL_PATTERNS = [
    r"\bwhat.*(?:mean|indicate|show|tell)\b",
    r"\bwhy.*(?:high|low|abnormal|elevated)\b",
    r"\bhow.*(?:improve|reduce|lower|increase|treat|prevent)\b",
    r"\b(?:is it|am i|should i|can i|do i|does it)\b.*(?:normal|healthy|risk|concern|need|okay|fine)",
    r"\bexplain.*(?:result|report|value|level)\b",
]


class ChatAgent:
    def __init__(self):
        self.embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
        self.splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=api_key) if api_key else None
        self.model = "llama-3.3-70b-versatile"

    def _is_medical_query(self, query: str) -> bool:
        lower = query.lower().strip()
        if len(lower) < 3:
            return False
        words = set(re.findall(r"[a-z]+", lower))
        keyword_matches = words & set(MEDICAL_KEYWORDS)
        if len(keyword_matches) >= 2:
            return True
        if any(re.search(p, lower) for p in MEDICAL_PATTERNS):
            return True
        return False

    def initialize_vector_store(self, text: str):
        texts = self.splitter.split_text(text) or [text]
        return FAISS.from_texts(texts, self.embeddings)

    def get_response(self, query: str, vectorstore=None, chat_history=None) -> str:
        chat_history = chat_history or []

        if not self._is_medical_query(query):
            return (
                "I'm MediSage, a specialized AI medical assistant. "
                "I can only answer questions related to health, medical reports, "
                "lab results, symptoms, and wellness. Please ask a health-related question."
            )

        ctx_query = self._contextualize(query, chat_history)

        context = ""
        if vectorstore:
            try:
                retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
                try:
                    docs = retriever.invoke(ctx_query)
                except AttributeError:
                    docs = retriever.get_relevant_documents(ctx_query)
                context = "\n\n".join(d.page_content for d in docs)
            except Exception:
                pass

        system = (
            "You are MediSage, an expert AI medical assistant. "
            "Answer questions about the patient's blood report clearly and concisely. "
            "If unsure, say so. Always remind users to consult a doctor for medical decisions."
        )

        messages = [{"role": "system", "content": system}]
        for msg in chat_history[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

        user_content = f"Context:\n{context}\n\nQuestion: {query}" if context else f"Question: {query}"
        messages.append({"role": "user", "content": user_content})

        if not self.client:
            return "Sorry, the AI service is not configured. Please set GROQ_API_KEY."

        try:
            res = self.client.chat.completions.create(
                model=self.model, messages=messages, temperature=0.7, max_tokens=600
            )
            return res.choices[0].message.content
        except Exception as e:
            return f"Sorry, I couldn't process your request: {str(e)}"

    def _contextualize(self, query: str, history: list) -> str:
        if not history:
            return query
        if not self.client:
            return query
        recent = history[-4:]
        hist_text = "\n".join(f"{'User' if m['role']=='user' else 'AI'}: {m['content']}" for m in recent)
        prompt = f"Rewrite the question as standalone given this history:\n{hist_text}\n\nQuestion: {query}\n\nStandalone:"
        try:
            res = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1, max_tokens=200
            )
            return res.choices[0].message.content.strip()
        except Exception:
            return query