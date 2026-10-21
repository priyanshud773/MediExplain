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


def explain_medical_report(
    report_text: str,
    language: str = "English"
):
    if language.lower() == "hinglish":
        language_instruction = """
Write the complete answer in very simple and easy Hinglish.

Rules:
- Use Hindi written only in English/Roman letters.
- Use common English medical terms when needed.
- Do NOT use Hindi/Devanagari script.
- Do NOT use difficult Hindi words.
- Do NOT use complicated medical terminology.
- Explain medical terms using simple everyday language.
- Keep sentences short and easy to understand.
- Write for a normal person who does not have a medical background.
- Use a friendly and natural tone.
- Do NOT write the explanation in pure English.
"""
    else:
        language_instruction = """
Write the complete answer in simple English.

Rules:
- Use short and simple sentences.
- Avoid complicated medical terminology.
- Explain medical terms in easy words.
- Write for a normal person who does not have a medical background.
- Do not use Hindi or Hinglish.
"""

    prompt = f"""
You are MediExplain AI, a medical report explanation assistant.

The user selected this language:

{language}

LANGUAGE INSTRUCTIONS:

{language_instruction}

IMPORTANT:

The selected language is {language}.

You MUST follow the selected language throughout the COMPLETE response.

The user is not a medical professional.

Explain the report like a doctor explaining basic report results
to a patient in simple and easy language.

Keep the explanation clear, short and easy to understand.

Give the response in exactly these sections:

1. Summary
2. Abnormal Values
3. Possible Meaning
4. Diet Recommendations
5. Lifestyle Suggestions
6. Doctor Advice

For abnormal values:
- Clearly mention which values are high or low.
- If everything is normal, clearly say that no major abnormal value was found.

For possible meaning:
- Explain what the result may mean in simple language.
- Do not scare the user unnecessarily.

For diet recommendations:
- Give simple and general healthy diet suggestions.

For lifestyle suggestions:
- Give simple practical suggestions.

For doctor advice:
- Clearly mention that this is an AI-generated explanation.
- Do not give a definitive diagnosis.
- Recommend consulting a qualified doctor for medical decisions.

Medical Report:

{report_text}
"""

    print("Selected Language:", language)
    print("Calling Gemini...")

    models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    last_err = None
    for model_name in models_to_try:
        try:
            response = _get_client().models.generate_content(
                model=model_name,
                contents=prompt
            )
            print(f"Gemini Response Received with model {model_name}")
            return response.text
        except Exception as exc:
            last_err = exc
            print(f"[GEMINI RETRY] Model {model_name} failed: {exc}")

    raise last_err

