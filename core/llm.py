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

def extract_symptoms(conversation_text: str) -> list[dict]:
    response = client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {
                "role": "system",
                "content": """Extract symptoms from this conversation text. 
Return ONLY a JSON array, no other text. Example:
[{"symptom": "headache", "severity": 7, "notes": "morning headache"}]
If no symptoms found, return empty array: []
severity is 1-10, estimate if not explicitly stated."""
            },
            {"role": "user", "content": conversation_text}
        ],
        temperature=0.1,
        max_tokens=500
    )
    import json
    try:
        text = response.choices[0].message.content.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except:
        return [] 