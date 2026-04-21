from openai import OpenAI
from core.config import settings

client = OpenAI(
    api_key=settings.llm_api_key,
    base_url=settings.llm_base_url
)

def ask(prompt: str, context: str = "") -> str:
    if context:
        system_message = f"""You are a health and energy data analyst assistant. Always answer in English.
Use the following information to answer the question:

{context}

If the information is insufficient, say so clearly in English."""
    else:
        system_message = "You are a data analyst assistant. Always answer in English."

    response = client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=1000
    )

    return response.choices[0].message.content