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