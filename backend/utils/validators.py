import re

MAX_UPLOAD_SIZE_MB = 20

MEDICAL_TERMS = [
    'blood', 'test', 'report', 'laboratory', 'lab', 'patient', 'specimen',
    'reference range', 'analysis', 'results', 'hemoglobin', 'wbc', 'rbc',
    'platelet', 'glucose', 'creatinine', 'cholesterol', 'diagnostic'
]

def validate_pdf_file(file) -> tuple[bool, str | None]:
    if not file:
        return False, "No file uploaded"
    file.seek(0, 2)
    size_mb = file.tell() / (1024 * 1024)
    file.seek(0)
    if size_mb > MAX_UPLOAD_SIZE_MB:
        return False, f"File size ({size_mb:.1f}MB) exceeds {MAX_UPLOAD_SIZE_MB}MB limit"
    if not file.filename.lower().endswith(".pdf"):
        return False, "Only PDF files are supported"
    return True, None

def validate_pdf_content(text: str) -> tuple[bool, str | None]:
    if len(text.strip()) < 50:
        return False, "Extracted text is too short. Ensure the PDF has valid text."
    lower = text.lower()
    matches = sum(1 for t in MEDICAL_TERMS if t in lower)
    if matches < 3:
        return False, "This doesn't appear to be a medical report."
    return True, None

def validate_email(email: str) -> bool:
    return bool(re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email))

def validate_password(password: str) -> tuple[bool, str | None]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return False, "Password must contain an uppercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain a number"
    return True, None
