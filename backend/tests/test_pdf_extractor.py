from unittest.mock import patch, MagicMock
from utils.pdf_extractor import extract_text_from_pdf

def make_mock_file(content=b""):
    f = MagicMock()
    f.read.return_value = content
    return f

def test_extract_text_from_pdf_success():
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Hemoglobin: 14.5\nGlucose: 95"
    mock_pdf = MagicMock()
    mock_pdf.pages = [mock_page]
    mock_pdf.__enter__.return_value = mock_pdf

    with patch("pdfplumber.open", return_value=mock_pdf):
        result = extract_text_from_pdf(make_mock_file(b"pdf data"))
        assert "Hemoglobin" in result
        assert "Glucose" in result

def test_extract_text_from_pdf_empty():
    mock_page = MagicMock()
    mock_page.extract_text.return_value = ""
    mock_pdf = MagicMock()
    mock_pdf.pages = [mock_page]
    mock_pdf.__enter__.return_value = mock_pdf

    with patch("pdfplumber.open", return_value=mock_pdf):
        result = extract_text_from_pdf(make_mock_file(b"pdf data"))
        assert result == "Error: Could not extract text. Ensure it's not a scanned PDF."

def test_extract_text_from_pdf_too_many_pages():
    mock_pdf = MagicMock()
    mock_pdf.pages = [MagicMock() for _ in range(25)]
    mock_pdf.__enter__.return_value = mock_pdf

    with patch("pdfplumber.open", return_value=mock_pdf):
        result = extract_text_from_pdf(make_mock_file(b"pdf data"))
        assert "page limit" in result

def test_extract_text_from_pdf_exception():
    with patch("pdfplumber.open", side_effect=Exception("Corrupt PDF")):
        result = extract_text_from_pdf(make_mock_file(b"garbage"))
        assert "Error extracting PDF" in result