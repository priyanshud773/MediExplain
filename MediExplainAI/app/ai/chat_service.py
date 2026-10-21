from google import genai
from ..config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


def _get_client():
    global client
    if client is None:
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set in MediExplainAI/.env file")
        client = genai.Client(api_key=GEMINI_API_KEY)
    return client


def chat_with_report(
    report_text: str,
    question: str,
    language: str = "English"
):
    if language.lower() == "hinglish":
        language_instruction = """
Answer in very simple and easy Hinglish.

Rules:
- Use Hindi written only in English/Roman letters.
- Do NOT use Devanagari/Hindi script.
- Use common English medical terms where necessary.
- Explain difficult medical terms in simple words.
- Keep sentences short and easy.
- Answer like a doctor explaining something to a normal person.
- Avoid complicated Hindi words.
- Do not make the answer overly technical.
"""
    else:
        language_instruction = """
Answer in simple and easy English.

Rules:
- Use short sentences.
- Use simple everyday words.
- Explain difficult medical terms.
- Avoid complicated medical terminology.
- Answer like a doctor explaining something to a normal person.
"""

    prompt = f"""
You are MediExplain AI, a medical report assistant.

SELECTED LANGUAGE:
{language}

LANGUAGE INSTRUCTION:
{language_instruction}

IMPORTANT:
The selected language is {language}.

You MUST answer the user's question completely in the selected language.

Medical Report:
{report_text}

User Question:
{question}

Instructions:

1. Answer only what the user is asking.
2. Use information available in the uploaded medical report.
3. Keep the answer between 80-150 words.
4. Use short paragraphs or bullet points when helpful.
5. Do not repeat the complete medical report.
6. If the question is about diet, give practical food suggestions.
7. If the question is about lifestyle, give practical lifestyle suggestions.
8. Do not give a definitive medical diagnosis.
9. Do not claim that the user definitely has or does not have a disease.
10. If the information required to answer the question is not available
    in the report, clearly say that the information was not found in
    the uploaded report.
11. Keep the explanation easy to understand.

Medical Disclaimer:
This answer is for educational purposes only and should not replace
advice from a qualified healthcare professional.
"""

    print("Selected Chat Language:", language)
    print("Calling Chat Gemini...")

    models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    last_err = None
    for model_name in models_to_try:
        try:
            response = _get_client().models.generate_content(
                model=model_name,
                contents=prompt
            )
            print(f"Chat Gemini Success with model {model_name}")
            return response.text
        except Exception as exc:
            last_err = exc
            print(f"[CHAT GEMINI RETRY] Model {model_name} failed: {exc}")

    raise last_err

