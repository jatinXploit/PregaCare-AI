import os
import requests
import json
from dotenv import load_dotenv

# Load API key from .env file
load_dotenv()

class PregaCareAIEngine:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "google/gemma-4-26b-a4b-it:free" # Verified working model name
        
        # Internal Knowledge Base Paths
        self.kb_path = "knowledge_base/medical_guidelines/"
        
    def _retrieve_guidelines(self, risk_band):
        """Retrieves the relevant medical markdown file based on risk band."""
        filename = risk_band.lower().replace(" ", "_") + ".md"
        path = os.path.join(self.kb_path, filename)
        
        try:
            with open(path, 'r') as f:
                return f.read()
        except:
            return "General pregnancy guidelines apply. Consult a doctor for specifics."

    def generate_response(self, user_query, assessment_report, chat_history=[]):
        """
        The RAG Core: Retrieves data, builds context, and calls Gemini.
        """
        if not self.api_key:
            return "ERROR: OpenRouter API Key not found. Please add it to your .env file."

        # 1. RETRIEVE: Get medical guidelines for this user's risk level
        guidelines = self._retrieve_guidelines(assessment_report['risk_band'])

        # 2. AUGMENT: Build the context-rich system prompt
        system_prompt = f"""
        You are the PregaCare Personalized AI Companion. You are context-aware and know exactly 
        who you are talking to.
        
        USER'S LOCAL CONTEXT:
        - Risk Level: {assessment_report['risk_band']}
        - Combined Risk Score: {assessment_report['combined_score']}/100
        - District: {assessment_report['location']} (Safety Index: {assessment_report['regional_safety_index']})
        - Clinical Vitals: Health Score {assessment_report['individual_health_score']}/100
        
        RELEVANT MEDICAL KNOWLEDGE BASE:
        {guidelines}
        
        INSTRUCTIONS:
        - Respond like a personalized assistant, not a robot.
        - FORMAT: Use clear bullet points for your advice.
        - LENGTH: Keep your entire response under 100 words.
        - Avoid long paragraphs; get straight to the point.
        - Use the user's specific district and risk score in your answers.
        - If the district safety is low, emphasize being careful with local choices.
        - Always encourage medical consultation for High Risk.
        """

        # 3. PREPARE MESSAGES: Chat History + Current Prompt
        messages = [{"role": "system", "content": system_prompt}]
        for msg in chat_history:
            messages.append(msg)
        messages.append({"role": "user", "content": user_query})

        # 4. CALL OPENROUTER
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://pregacare.ai", # Optional
            "X-Title": "PregaCare AI", # Optional
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7
        }

        try:
            response = requests.post(self.api_url, headers=headers, data=json.dumps(payload))
            response.raise_for_status()
            ai_message = response.json()['choices'][0]['message']['content']
            return ai_message
        except Exception as e:
            return f"Failed to connect to Gemini: {str(e)}"

# --- Simple CLI Chat App ---
if __name__ == "__main__":
    # This part will be called by start_chat.py
    pass
