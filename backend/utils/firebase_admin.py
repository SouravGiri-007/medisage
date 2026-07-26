import firebase_admin
from firebase_admin import credentials, firestore, auth
from datetime import datetime, timedelta, timezone
import os
import logging
from flask import request as flask_request

logger = logging.getLogger(__name__)

_firebase_db = None

def _init_firebase():
    global _firebase_db
    if _firebase_db is not None:
        return _firebase_db
    try:
        raw = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "serviceAccountKey.json")
        if not firebase_admin._apps:
            if raw.startswith("{"):
                import json
                cred = credentials.Certificate(json.loads(raw))
            else:
                cred = credentials.Certificate(raw)
            firebase_admin.initialize_app(cred)
        _firebase_db = firestore.client()
    except Exception as e:
        logger.warning(f"Firebase init failed: {e}")
        _firebase_db = None
    return _firebase_db

def get_db():
    db = _init_firebase()
    if db is None:
        raise RuntimeError("Firebase not initialized")
    return db

# ─── Auth ────────────────────────────────────────────────────────────────────

def verify_token(req):
    """Verify Firebase ID token from Authorization header."""
    auth_header = req.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None, "Missing or invalid Authorization header"
    token = auth_header.split("Bearer ")[1]
    try:
        _init_firebase()
    except Exception as e:
        return None, f"Firebase not configured: {str(e)}"
    try:
        decoded = auth.verify_id_token(token)
        return decoded["uid"], None
    except Exception as e:
        return None, f"Invalid token: {str(e)}"


# ─── User Profile ─────────────────────────────────────────────────────────────

def _utcnow():
    return datetime.now(timezone.utc)


def _make_naive(dt):
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


def create_user_profile(uid, name, email):
    doc_ref = get_db().collection("users").document(uid)
    doc = doc_ref.get()
    if not doc.exists:
        doc_ref.set({
            "name": name,
            "email": email,
            "created_at": _utcnow(),
            "analysis_count": 0,
            "analysis_limit": 15,
            "last_reset": _utcnow()
        })


def get_user_profile(uid):
    doc = get_db().collection("users").document(uid).get()
    if doc.exists:
        data = doc.to_dict()
        data["uid"] = uid
        return data
    return None


# ─── Rate Limiting ────────────────────────────────────────────────────────────

def get_user_analysis_count(uid):
    """Returns (count, limit, reset_in_str)."""
    doc_ref = get_db().collection("users").document(uid)
    doc = doc_ref.get()
    if not doc.exists:
        return 0, 15, "24h"

    data = doc.to_dict()
    last_reset = data.get("last_reset", _utcnow())
    count = data.get("analysis_count", 0)
    limit = data.get("analysis_limit", 15)

    now_naive = _make_naive(_utcnow())
    last_reset_naive = _make_naive(last_reset) if isinstance(last_reset, datetime) else now_naive

    elapsed = now_naive - last_reset_naive

    if elapsed > timedelta(hours=24):
        doc_ref.update({"analysis_count": 0, "last_reset": _utcnow()})
        return 0, limit, "24h"

    remaining = timedelta(hours=24) - elapsed
    hours, rem = divmod(remaining.seconds, 3600)
    minutes = rem // 60
    reset_in = f"{hours}h {minutes}m"
    return count, limit, reset_in


def increment_analysis_count(uid):
    doc_ref = get_db().collection("users").document(uid)
    doc = doc_ref.get()
    if doc.exists:
        current = doc.to_dict().get("analysis_count", 0)
        doc_ref.update({"analysis_count": current + 1})
    else:
        doc_ref.set({"analysis_count": 1, "last_reset": _utcnow()})


# ─── Analysis History ─────────────────────────────────────────────────────────

def save_analysis(uid, patient_name, age, gender, report_text, analysis_text, model_used, health_score=None):
    get_db().collection("users").document(uid).collection("analyses").add({
        "patient_name": patient_name,
        "age": age,
        "gender": gender,
        "report_text": report_text,
        "analysis_text": analysis_text,
        "model_used": model_used,
        "health_score": health_score,
        "created_at": _utcnow()
    })


def get_analysis_history(uid, limit=10):
    docs = (
        get_db().collection("users").document(uid).collection("analyses")
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(limit)
        .stream()
    )
    results = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        if "created_at" in d and hasattr(d["created_at"], "isoformat"):
            d["created_at"] = d["created_at"].isoformat()
        results.append(d)
    return results


# ─── Chat Sessions ────────────────────────────────────────────────────────────

def save_chat_message(uid, session_id, role, content):
    get_db().collection("users").document(uid)\
      .collection("sessions").document(session_id)\
      .collection("messages").add({
          "role": role,
          "content": content,
          "timestamp": _utcnow()
      })


def get_chat_history(uid, session_id, limit=50):
    docs = (
        get_db().collection("users").document(uid)
        .collection("sessions").document(session_id)
        .collection("messages")
        .order_by("timestamp")
        .limit(limit)
        .stream()
    )
    messages = []
    for doc in docs:
        d = doc.to_dict()
        if "timestamp" in d and hasattr(d["timestamp"], "isoformat"):
            d["timestamp"] = d["timestamp"].isoformat()
        messages.append(d)
    return messages


def delete_session(uid, session_id):
    session_ref = get_db().collection("users").document(uid)\
                    .collection("sessions").document(session_id)
    messages = session_ref.collection("messages").stream()
    for msg in messages:
        msg.reference.delete()
    session_ref.delete()