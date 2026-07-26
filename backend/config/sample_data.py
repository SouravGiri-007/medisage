import os

SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "samples")

SAMPLES = {
    "ananya": {
        "file": "Demo_Lab_Report1.pdf",
        "name": "Ananya Sharma",
        "age": 34,
        "gender": "Female",
        "desc": "Multiple markers elevated — cholesterol, glucose, HbA1c, TSH, low hemoglobin",
    },
    "rohan_m": {
        "file": "Demo_Lab_Report_2_RohanMehta.pdf",
        "name": "Rohan Mehta",
        "age": 58,
        "gender": "Male",
        "desc": "Diabetic profile — high glucose, HbA1c 8.4%, elevated BP, kidney stress markers",
    },
    "ishita": {
        "file": "Demo_Lab_Report_3_IshitaBanerjee.pdf",
        "name": "Ishita Banerjee",
        "age": 27,
        "gender": "Female",
        "desc": "Anemia & iron deficiency — low Hb, ferritin, thyroid panel abnormal",
    },
    "arjun": {
        "file": "Demo_Lab_Report_4_ArjunDeshmukh.pdf",
        "name": "Arjun Deshmukh",
        "age": 19,
        "gender": "Male",
        "desc": "Healthy individual — all markers within normal range",
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
