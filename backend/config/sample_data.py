import os

SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "samples")

SAMPLES = {
    "aarav": {
        "file": "Aarav_Mehta_Health_Report.pdf",
        "name": "Aarav Mehta",
        "age": 29,
        "score": 92,
        "grade": "Excellent",
        "bp": "118/76",
        "glucose": "91",
    },
    "priya": {
        "file": "Priya_Das_Health_Report.pdf",
        "name": "Priya Das",
        "age": 41,
        "score": 74,
        "grade": "Needs Attention",
        "bp": "138/88",
        "glucose": "126",
    },
    "rohan": {
        "file": "Rohan_Singh_Health_Report.pdf",
        "name": "Rohan Singh",
        "age": 56,
        "score": 63,
        "grade": "Moderate Risk",
        "bp": "146/92",
        "glucose": "115",
    },
}

def extract_sample_report(sample_name="random"):
    from utils.pdf_extractor import extract_text_from_pdf
    if sample_name == "random":
        import random
        sample_name = random.choice(list(SAMPLES.keys()))
    info = SAMPLES.get(sample_name)
    if not info:
        raise ValueError(f"Unknown sample: {sample_name}")
    path = os.path.join(SAMPLE_DIR, info["file"])
    if not os.path.exists(path):
        raise FileNotFoundError(f"Sample PDF not found: {path}")
    text = extract_text_from_pdf(path)
    if isinstance(text, str) and text.startswith("Error"):
        raise RuntimeError(text)
    return text
