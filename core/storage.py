import pandas as pd
import io
from typing import Union

def parse_csv(content: bytes) -> list[str]:
    df = pd.read_csv(io.BytesIO(content))
    chunks = []
    for _, row in df.iterrows():
        chunk = ", ".join([f"{col}: {val}" for col, val in row.items()])
        chunks.append(chunk)
    return chunks

def parse_text(content: bytes) -> list[str]:
    text = content.decode("utf-8")
    chunks = [chunk.strip() for chunk in text.split("\n\n") if chunk.strip()]
    return chunks

def parse_file(content: bytes, filename: str) -> list[str]:
    if filename.endswith(".csv"):
        return parse_csv(content)
    elif filename.endswith(".txt"):
        return parse_text(content)
    else:
        raise ValueError(f"Desteklenmeyen dosya tipi: {filename}")
    

def parse_csv(content: bytes) -> list[str]:
    df = pd.read_csv(io.BytesIO(content))
    chunks = []
    for _, row in df.iterrows():
        chunk = ", ".join([f"{col}: {val}" for col, val in row.items()])
        chunks.append(chunk)
    return chunks

def parse_text(content: bytes) -> list[str]:
    text = content.decode("utf-8")
    chunks = [chunk.strip() for chunk in text.split("\n\n") if chunk.strip()]
    return chunks

def parse_pdf(content: bytes) -> list[str]:
    import PyPDF2
    reader = PyPDF2.PdfReader(io.BytesIO(content))
    chunks = []
    for page in reader.pages:
        text = page.extract_text()
        if text and text.strip():
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            chunks.extend(paragraphs)
    return chunks if chunks else ["No readable text found in PDF."]

def parse_docx(content: bytes) -> list[str]:
    from docx import Document
    doc = Document(io.BytesIO(content))
    chunks = []
    for para in doc.paragraphs:
        if para.text.strip():
            chunks.append(para.text.strip())
    return chunks if chunks else ["No readable text found in document."]

def parse_file(content: bytes, filename: str) -> list[str]:
    filename_lower = filename.lower()
    if filename_lower.endswith(".csv"):
        return parse_csv(content)
    elif filename_lower.endswith(".txt"):
        return parse_text(content)
    elif filename_lower.endswith(".pdf"):
        return parse_pdf(content)
    elif filename_lower.endswith(".docx"):
        return parse_docx(content)
    else:
        raise ValueError(f"Unsupported file type: {filename}")