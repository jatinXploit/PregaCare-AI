import os

import requests
from dotenv import load_dotenv


load_dotenv()


SUPPORTED_LANGUAGES = {
    "English",
    "Hindi",
    "Haryanvi",
    "Bengali",
    "Telugu",
    "Marathi",
    "Tamil",
    "Gujarati",
    "Kannada",
    "Malayalam",
    "Punjabi",
    "Urdu",
    "Odia",
}


class PregaCareAIEngine:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").removeprefix("models/")
        self.api_url = (
            "https://generativelanguage.googleapis.com/v1beta/"
            f"models/{self.model}:generateContent"
        )

        base_directory = os.path.dirname(os.path.abspath(__file__))
        self.kb_path = os.path.join(
            base_directory,
            "knowledge_base",
            "medical_guidelines"
        )

    def _retrieve_guidelines(self, risk_band):
        """Retrieve the medical guideline file for the patient's risk band."""
        filename = str(risk_band).lower().replace(" ", "_") + ".md"
        path = os.path.join(self.kb_path, filename)

        try:
            with open(path, "r", encoding="utf-8") as guideline_file:
                return guideline_file.read()
        except (OSError, UnicodeError) as error:
            print(f"KNOWLEDGE BASE ERROR: {error}")
            return (
                "General pregnancy guidelines apply. "
                "Consult a qualified medical professional for individual advice."
            )

    def generate_response(
        self,
        user_query,
        assessment_report,
        chat_history=None,
        response_language="English"
    ):
        """Retrieve guidance, build patient context, and call Gemini."""
        if not self.api_key:
            return {
                "response": (
                    "ERROR: Gemini stereotyping API Key not found. "
                    "Please add GEMINI_API_KEY to your .env file."
                ),
                "is_emergency": False,
                "emergency_reason": ""
            }

        if chat_history is None:
            chat_history = []

        if response_language not in SUPPORTED_LANGUAGES:
            response_language = "English"

        risk_band = assessment_report.get("risk_band", "Unknown")
        guidelines = self._retrieve_guidelines(risk_band)

        system_prompt = f"""
You are the PregaCare Personalized AI Companion. You provide careful,
patient-friendly pregnancy health information using the supplied assessment
and retrieved knowledge base.

PATIENT CONTEXT:
- Risk Level: {risk_band}
- Combined Risk Score: {assessment_report.get('combined_score', 'N/A')}/100
- District: {assessment_report.get('location', 'Unknown')}
- Safety Index: {assessment_report.get('regional_safety_index', 'N/A')}
- Health Score: {assessment_report.get('individual_health_score', 'N/A')}/100

RETRIEVED MEDICAL GUIDANCE:
{guidelines}

RESPONSE RULES:
- Respond only in {response_language}.
- Use the natural writing script normally used for {response_language}.
- Use simple words suitable for a patient with limited medical knowledge.
- If the user mixes languages, still answer primarily in {response_language}.
- Do not switch to English unless the selected language is English.
- Measurements, medicine names, locations, and emergency numbers may remain
  in their standard form.
- Use short, clear bullet points and keep the complete response under 100 words.
- Personalize the response using relevant risk, score, and location data.
- Base health guidance on the retrieved medical guidance above.
- Do not diagnose, prescribe medicines, or claim certainty.
- Never tell the patient to delay urgent professional care.
- When the message suggests heavy bleeding, breathing difficulty, seizure,
  unconsciousness, severe pain, or another possible emergency, immediately
  advise contacting emergency services or going to the nearest emergency
  department. Do not continue with routine home-care advice first.
- For high-risk assessments, encourage consultation with a qualified medical
  professional.
- The CURRENT USER QUESTION is the highest-priority instruction.
- Answer the current question directly in the first sentence.
- Do not repeat the risk level, Combined Risk Score, Health Score, Safety Index, or location unless the user specifically asks about them.
- Previous chat history is supporting context only and must not override the current question.
- If the question asks about food or diet, provide practical diet guidance directly.
- When the selected language is Haryanvi, answer in natural Haryanvi
  written in Devanagari script. Do not answer in standard Hindi unless a
  Haryanvi expression would be unclear.
- Analyse the CURRENT USER QUESTION for a possible pregnancy-related emergency,
  regardless of its language, script, spelling mistakes, transliteration, or
  speech-to-text errors.
- Your first line must always be exactly one of these:
  EMERGENCY_STATUS: YES
  EMERGENCY_STATUS: NO
- Use YES for heavy bleeding, breathing difficulty, unconsciousness, seizure,
  severe abdominal or chest pain, absent fetal movement, or another situation
  requiring immediate medical attention.
- After the status line, provide the actual answer in the selected response language.
"""

        contents = []

        for message in chat_history:
            role = "model" if message.get("role") == "assistant" else "user"
            content = str(message.get("content", "")).strip()

            if content:
                contents.append({
                    "role": role,
                    "parts": [{"text": content}]
                })

        contents.append({
            "role": "user",
            "parts": [{
                "text": (
                    "CURRENT USER QUESTION:\n"
                    f"{str(user_query).strip()}\n\n"
                    "Answer this exact question directly. "
                    "Do not provide a general risk summary unless requested."
                )
            }]
        })

        headers = {
            "x-goog-api-key": self.api_key,
            "Content-Type": "application/json",
        }

        payload = {
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 300
            }
        }

        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()

            response_data = response.json()
            candidates = response_data.get("candidates", [])

            if not candidates:
                raise ValueError("Gemini returned no response candidates.")

            parts = candidates[0].get("content", {}).get("parts", [])

            if not parts or not parts[0].get("text"):
                raise ValueError("Gemini returned an empty response.")

            ai_message = parts[0]["text"].strip()

            lines = ai_message.splitlines()
            first_line = lines[0].strip().upper() if lines else ""

            is_emergency = first_line == "EMERGENCY_STATUS: YES"

            if first_line in {
             "EMERGENCY_STATUS: YES",
             "EMERGENCY_STATUS: NO"
            }:
             clean_response = "\n".join(lines[1:]).strip()
            else:
              clean_response = ai_message

            return {
                "response": clean_response,
                "is_emergency": is_emergency,
                "emergency_reason": (
                    "Your message may describe a medical emergency."
                    if is_emergency
                    else ""
                )
            }
        except requests.RequestException as error:
            print(f"GEMINI REQUEST ERROR: {error}")
            return {
                "response": f"Failed to connect to Gemini: {error}",
                "is_emergency": False,
                "emergency_reason": ""
            }

        except (KeyError, TypeError, ValueError) as error:
            print(f"GEMINI RESPONSE ERROR: {error}")
            return {
                "response": f"Gemini returned an invalid response: {error}",
                "is_emergency": False,
                "emergency_reason": ""
            }

if __name__ == "__main__":
    pass
