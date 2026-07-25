import groq
import os
import time
import logging
from enum import Enum

logger = logging.getLogger(__name__)

class ModelTier(Enum):
    PRIMARY   = "primary"
    SECONDARY = "secondary"
    TERTIARY  = "tertiary"
    FALLBACK  = "fallback"

class ModelManager:
    # Fix: "meta-llama/llama-4-maverick-17b-128e-instruct" does not exist on Groq.
    # Replaced with valid Groq-hosted models.
    MODEL_CONFIG = {
        ModelTier.PRIMARY:   {"model": "llama-3.3-70b-versatile",    "max_tokens": 2500, "temperature": 0.7},
        ModelTier.SECONDARY: {"model": "llama-3.1-8b-instant",      "max_tokens": 2500, "temperature": 0.7},
        ModelTier.TERTIARY:  {"model": "llama3-70b-8192",            "max_tokens": 2000, "temperature": 0.7},
        ModelTier.FALLBACK:  {"model": "llama3-8b-8192",             "max_tokens": 2000, "temperature": 0.7},
    }

    TIERS = [ModelTier.PRIMARY, ModelTier.SECONDARY, ModelTier.TERTIARY, ModelTier.FALLBACK]

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.warning("GROQ_API_KEY not set. LLM calls will fail.")
        self.client = groq.Groq(api_key=api_key)

    def generate(self, data: dict, system_prompt: str, retry: int = 0) -> dict:
        if retry >= len(self.TIERS):
            return {"success": False, "error": "All models failed"}

        tier = self.TIERS[retry]
        cfg  = self.MODEL_CONFIG[tier]

        try:
            completion = self.client.chat.completions.create(
                model=cfg["model"],
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": str(data)}
                ],
                temperature=cfg["temperature"],
                max_tokens=cfg["max_tokens"]
            )
            return {
                "success":    True,
                "content":    completion.choices[0].message.content,
                "model_used": cfg["model"]
            }
        except Exception as e:
            msg = str(e).lower()
            logger.warning(f"[{cfg['model']}] failed: {msg}")
            if "rate limit" in msg or "quota" in msg:
                time.sleep(2)
            if "model_not_found" in msg or "does not exist" in msg:
                logger.info(f"Model {cfg['model']} not found, falling back to next tier.")
            return self.generate(data, system_prompt, retry + 1)