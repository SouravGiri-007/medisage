import os
import random

SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "samples")

SAMPLE_FILES = [
    "Rohan_Singh_Health_Report.pdf",
    "Priya_Das_Health_Report.pdf",
    "Aarav_Mehta_Health_Report.pdf",
]

def extract_sample_report():
    from utils.pdf_extractor import extract_text_from_pdf
    filename = random.choice(SAMPLE_FILES)
    path = os.path.join(SAMPLE_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Sample PDF not found: {path}")
    text = extract_text_from_pdf(path)
    if isinstance(text, str) and text.startswith("Error"):
        raise RuntimeError(text)
    return text
