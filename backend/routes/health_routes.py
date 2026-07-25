from flask import Blueprint, request, jsonify
from utils.firebase_admin import verify_token, get_analysis_history
from agents.trend_agent import TrendAgent

health_bp = Blueprint("health", __name__)
trend_agent = TrendAgent()

@health_bp.route("/trends", methods=["GET"])
def get_trends():
    uid, err = verify_token(request)
    if err:
        return jsonify({"error": err}), 401

    history = get_analysis_history(uid)
    if not history:
        return jsonify({"trends": [], "message": "No analysis history found"})

    trends = trend_agent.extract_trends(history)
    return jsonify({"trends": trends})


@health_bp.route("/score", methods=["POST"])
def get_health_score():
    uid, err = verify_token(request)
    if err:
        return jsonify({"error": err}), 401

    body = request.get_json()
    analysis_text = body.get("analysis", "")
    if not analysis_text:
        return jsonify({"error": "Analysis text required"}), 400

    score = trend_agent.calculate_health_score(analysis_text)
    return jsonify({"score": score})
