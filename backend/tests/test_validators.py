import pytest
from utils.validators import validate_pdf_file, validate_pdf_content, validate_email, validate_password

class MockFile:
    def __init__(self, name, size=0, content=b""):
        self.filename = name
        self._size = size
        self._pos = 0
        self._content = content

    def seek(self, offset, whence=0):
        if whence == 2:
            self._pos = self._size
        else:
            self._pos = offset
        return self._pos

    def tell(self):
        return self._pos

    def read(self):
        return self._content

def test_validate_pdf_file_no_file():
    assert validate_pdf_file(None) == (False, "No file uploaded")

def test_validate_pdf_file_wrong_extension():
    f = MockFile("test.txt", 100)
    assert validate_pdf_file(f) == (False, "Only PDF files are supported")

def test_validate_pdf_file_too_large():
    size_mb = 25 * 1024 * 1024
    f = MockFile("report.pdf", size_mb)
    valid, msg = validate_pdf_file(f)
    assert not valid
    assert "exceeds" in msg

def test_validate_pdf_file_valid():
    f = MockFile("report.pdf", 1024)
    assert validate_pdf_file(f) == (True, None)

def test_validate_pdf_content_too_short():
    assert validate_pdf_content("Hi") == (False, "Extracted text is too short. Ensure the PDF has valid text.")

def test_validate_pdf_content_not_medical():
    text = "This is a long enough text but contains no medical terms whatsoever"
    assert validate_pdf_content(text) == (False, "This doesn't appear to be a medical report.")

def test_validate_pdf_content_valid():
    text = (
        "Blood Test Report\n"
        "Patient: John Doe\n"
        "Hemoglobin: 14.5 g/dL\n"
        "WBC: 7500 /uL\n"
        "Glucose: 95 mg/dL\n"
        "Cholesterol: 180 mg/dL\n"
    )
    assert validate_pdf_content(text) == (True, None)

def test_validate_email_valid():
    assert validate_email("test@example.com") is True
    assert validate_email("user.name@domain.co") is True

def test_validate_email_invalid():
    assert validate_email("not-an-email") is False
    assert validate_email("") is False

def test_validate_password_too_short():
    valid, msg = validate_password("Ab1")
    assert not valid
    assert "at least 8 characters" in msg

def test_validate_password_no_uppercase():
    valid, msg = validate_password("abcdefgh1")
    assert not valid
    assert "uppercase letter" in msg

def test_validate_password_no_digit():
    valid, msg = validate_password("Abcdefgh")
    assert not valid
    assert "number" in msg

def test_validate_password_valid():
    assert validate_password("ValidPass1") == (True, None)