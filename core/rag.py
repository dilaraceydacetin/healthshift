from sqlalchemy import text
from core.database import engine
from core.llm import ask

def safe_table_name(collection_name: str) -> str:
    return collection_name.replace("-", "_")

def setup_table(collection_name: str):
    name = safe_table_name(collection_name)
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
        conn.execute(text(f"""
            CREATE TABLE IF NOT EXISTS {name} (
                id TEXT PRIMARY KEY,
                content TEXT
            )
        """))
        conn.execute(text(f"""
            CREATE INDEX IF NOT EXISTS {name}_content_idx
            ON {name} USING gin(content gin_trgm_ops)
        """))
        conn.commit()

def index_documents(texts: list[str], collection_name: str, ids: list[str] = None):
    setup_table(collection_name)
    name = safe_table_name(collection_name)
    if ids is None:
        ids = [str(i) for i in range(len(texts))]
    with engine.connect() as conn:
        for doc_id, text_content in zip(ids, texts):
            conn.execute(text(f"""
                INSERT INTO {name} (id, content)
                VALUES (:id, :content)
                ON CONFLICT (id) DO UPDATE
                SET content = :content
            """), {"id": doc_id, "content": text_content})
        conn.commit()

def query_rag(question: str, collection_name: str, n_results: int = 5) -> str:
    setup_table(collection_name)
    name = safe_table_name(collection_name)
    with engine.connect() as conn:
        result = conn.execute(text(f"""
            SELECT content FROM {name}
            WHERE similarity(content, :question) > 0.1
            ORDER BY similarity(content, :question) DESC
            LIMIT :limit
        """), {"question": question, "limit": n_results})
        rows = result.fetchall()

    if not rows:
        with engine.connect() as conn:
            result = conn.execute(text(f"""
                SELECT content FROM {name}
                LIMIT :limit
            """), {"limit": n_results})
            rows = result.fetchall()

    if not rows:
        return ask(question)

    context = "\n".join([row[0] for row in rows])
    return ask(prompt=question, context=context)