from flask import Blueprint, request, jsonify
from agents.analysis_agent import AnalysisAgent
from utils.pdf_extractor import extract_text_from_pdf
from utils.validators import validate_pdf_file, validate_pdf_content
from utils.firebase_admin import verify_token, get_user_analysis_count, increment_analysis_count, save_analysis
import io

analysis_bp = Blueprint("analysis", __name__)
analysis_agent = AnalysisAgent()

@analysis_bp.route("/analyze", methods=["POST"])
def analyze():
    uid, err = verify_token(request)
    if err:
        return jsonify({"error": err}), 401

    count, limit, reset_in = get_user_analysis_count(uid)
    if count >= limit:
        return jsonify({"error": f"Daily limit reached. Resets in {reset_in}"}), 429

    data = request.form
    file = request.files.get("file")
    use_sample = data.get("use_sample") == "true"

    patient_name = data.get("patient_name", "Unknown")
    age = data.get("age", "Unknown")
    gender = data.get("gender", "Unknown")

    if use_sample:
        from config.sample_data import SAMPLE_REPORT
        report_text = SAMPLE_REPORT
    elif file:
        is_valid, error = validate_pdf_file(file)
        if not is_valid:
            return jsonify({"error": error}), 400
        report_text = extract_text_from_pdf(file)
        if isinstance(report_text, str) and report_text.startswith("Error"):
            return jsonify({"error": report_text}), 400
        is_valid, error = validate_pdf_content(report_text)
        if not is_valid:
            return jsonify({"error": error}), 400
    else:
        return jsonify({"error": "No file or sample selected"}), 400

    result = analysis_agent.analyze_report(
        data={"patient_name": patient_name, "age": age, "gender": gender, "report": report_text},
        uid=uid
    )

    if result["success"]:
        increment_analysis_count(uid)
        # Save analysis to Firestore for history tracking
        try:
            save_analysis(
                uid=uid,
                patient_name=patient_name,
                age=age,
                gender=gender,
                report_text=report_text,
                analysis_text=result["content"],
                model_used=result["model_used"]
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to save analysis to Firestore: {e}")
        return jsonify({
            "success": True,
            "analysis": result["content"],
            "model_used": result["model_used"],
            "report_text": report_text,
            "analyses_used": count + 1,
            "analyses_limit": limit
        })
    else:
        return jsonify({"error": result.get("error", "Analysis failed")}), 500


@analysis_bp.route("/history", methods=["GET"])
def get_history():
    uid, err = verify_token(request)
    if err:
        return jsonify({"error": err}), 401

    from utils.firebase_admin import get_analysis_history
    history = get_analysis_history(uid)
    return jsonify({"history": history})


@analysis_bp.route("/rate-limit", methods=["GET"])
def rate_limit():
    uid, err = verify_token(request)
    if err:
        return jsonify({"error": err}), 401

    count, limit, reset_in = get_user_analysis_count(uid)
    return jsonify({"used": count, "limit": limit, "reset_in": reset_in})