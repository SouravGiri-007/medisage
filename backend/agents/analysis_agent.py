from agents.model_manager import ModelManager
from config.prompts import SPECIALIST_PROMPTS
from datetime import datetime

class AnalysisAgent:
    def __init__(self):
        self.model_manager = ModelManager()

    def analyze_report(self, data: dict, uid: str) -> dict:
        """
        Analyze a medical report. Builds an enhanced prompt and calls model.
        """
        processed = self._preprocess(data)
        system_prompt = SPECIALIST_PROMPTS["comprehensive_analyst"]
        enhanced_prompt = self._build_prompt(system_prompt, processed)

        result = self.model_manager.generate(processed, enhanced_prompt)
        return result

    def _preprocess(self, data: dict) -> dict:
        return {
            "patient_name": data.get("patient_name", "Unknown"),
            "age": data.get("age", "Unknown"),
            "gender": data.get("gender", "Unknown"),
            "report": data.get("report", "")
        }

    def _build_prompt(self, base_prompt: str, data: dict) -> str:
        context = (
            f"\n\n## Patient Profile\n"
            f"- Name: {data['patient_name']}\n"
            f"- Age: {data['age']}\n"
            f"- Gender: {data['gender']}\n"
        )
        return base_prompt + context
