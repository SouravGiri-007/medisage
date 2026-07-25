from flask import Blueprint, request, jsonify
from agents.chat_agent import ChatAgent
from utils.firebase_admin import verify_token, save_chat_message, get_chat_history, delete_session

chat_bp = Blueprint("chat", __name__)
chat_agent = ChatAgent()

@chat_bp.route("/message", methods=["POST"])
def send_message():
    uid, err = verify_token(request)
    if err:
        return jsonify({"error": err}), 401

    body = request.get_json()
    session_id = body.get("session_id")
    message = body.get("message", "").strip()
    report_text = body.get("report_text", "")
    chat_history = body.get("chat_history", [])

    if not message:
        return jsonify({"error": "Message is required"}), 400

    # Initialize vector store from report text
    vectorstore = None
    if report_text:
        vectorstore = chat_agent.initialize_vector_store(report_text)

    response = chat_agent.get_response(
        query=message,
        vectorstore=vectorstore,
        chat_history=chat_history
    )

    # Save to Firestore
    if session_id:
        save_chat_message(uid, session_id, "user", message)
        save_chat_message(uid, session_id, "assistant", response)

    return jsonify({"response": response})


@chat_bp.route("/history/<session_id>", methods=["GET"])
def get_history(session_id):
    uid, err = verify_token(request)
    if err:
        return jsonify({"error": err}), 401

    history = get_chat_history(uid, session_id)
    return jsonify({"history": history})


@chat_bp.route("/session/<session_id>", methods=["DELETE"])
def delete_chat_session(session_id):
    uid, err = verify_token(request)
    if err:
        return jsonify({"error": err}), 401

    delete_session(uid, session_id)
    return jsonify({"success": True})
