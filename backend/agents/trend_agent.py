import os
import re
from groq import Groq


class TrendAgent:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=api_key) if api_key else None
        self.model = "llama-3.1-8b-instant"

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
