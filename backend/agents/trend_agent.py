import os
import re
from groq import Groq

HEALTH_MARKERS = [
    "hemoglobin", "glucose", "cholesterol", "triglycerides",
    "hdl", "ldl", "wbc", "rbc", "platelet", "creatinine",
    "bilirubin", "alt", "ast", "tsh", "vitamin d", "vitamin b12",
    "hba1c", "uric acid", "sodium", "potassium"
]

class TrendAgent:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=api_key) if api_key else None
        self.model = "llama-3.1-8b-instant"

    def extract_trends(self, history: list) -> list:
        """
        From list of past analyses, extract trend data per marker.
        Returns list of {marker, dates, values, status}
        """
        trends = {}
        for entry in history:
            date = entry.get("created_at", "")[:10]
            report = entry.get("report_text", "").lower()
            analysis = entry.get("analysis_text", "").lower()

            for marker in HEALTH_MARKERS:
                if marker in report or marker in analysis:
                    # Extract numeric value near marker in report text
                    val = self._extract_value(marker, report)
                    if val is not None:
                        if marker not in trends:
                            trends[marker] = {"marker": marker, "dates": [], "values": [], "status": "normal"}
                        trends[marker]["dates"].append(date)
                        trends[marker]["values"].append(val)

        # Determine trend direction
        result = []
        for marker, data in trends.items():
            if len(data["values"]) >= 2:
                data["trend"] = "up" if data["values"][-1] > data["values"][0] else "down"
            else:
                data["trend"] = "stable"
            result.append(data)

        return result

    def _extract_value(self, marker: str, text: str) -> float | None:
        """Find numeric value near marker in text."""
        pattern = rf"{re.escape(marker)}[\s:\-/]*([\d]+\.?[\d]*)"
        match = re.search(pattern, text)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                return None
        return None

    def calculate_health_score(self, analysis_text: str) -> dict:
        """
        Use LLM to score overall health from analysis (0-100).
        Returns {score, grade, summary, risk_areas}
        """
        prompt = f"""Given this medical report analysis, provide a JSON health score.
Return ONLY valid JSON, no markdown, no explanation.

Analysis:
{analysis_text[:2000]}

JSON format:
{{
  "score": <integer 0-100>,
  "grade": "<A/B/C/D/F>",
  "summary": "<one sentence>",
  "risk_areas": ["<area1>", "<area2>"]
}}"""

        try:
            res = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2, max_tokens=300
            )
            import json
            raw = res.choices[0].message.content.strip()
            # Strip markdown if present
            raw = re.sub(r"```json|```", "", raw).strip()
            return json.loads(raw)
        except Exception:
            return {"score": 0, "grade": "N/A", "summary": "Could not compute score", "risk_areas": []}
