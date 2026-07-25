import pdfplumber
import io

MAX_PDF_PAGES = 20
MAX_UPLOAD_SIZE_MB = 20

def extract_text_from_pdf(file) -> str:
    """Extract text from a PDF file object."""
    try:
        content = file.read()
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            if len(pdf.pages) > MAX_PDF_PAGES:
                return f"Error: PDF exceeds {MAX_PDF_PAGES} page limit"
            text = ""
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        if not text.strip():
            return "Error: Could not extract text. Ensure it's not a scanned PDF."
        return text
    except Exception as e:
        return f"Error extracting PDF: {str(e)}"
