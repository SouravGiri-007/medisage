from flask import Blueprint, request, jsonify
from utils.firebase_admin import verify_token, create_user_profile, get_user_profile

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/profile", methods=["GET"])
def get_profile():
    uid, err = verify_token(request)
    if err:
        return jsonify({"error": err}), 401

    profile = get_user_profile(uid)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    return jsonify({"profile": profile})


@auth_bp.route("/profile", methods=["POST"])
def create_profile():
    uid, err = verify_token(request)
    if err:
        return jsonify({"error": err}), 401

    body = request.get_json()
    name = body.get("name", "")
    email = body.get("email", "")

    create_user_profile(uid, name, email)
    return jsonify({"success": True})
