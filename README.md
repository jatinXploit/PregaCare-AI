---
title: PregaCare API
emoji: 🩺
colorFrom: purple
colorTo: pink
sdk: docker
pinned: false
app_port: 7860
---

# PregaCare AI: Intelligent Maternal Health Ecosystem 

PregaCare AI is a comprehensive maternal health support system designed to provide personalized clinical risk assessment and AI-driven guidance for expectant mothers in India.

## Live Demo: https://prega-care-ai.vercel.app/


## 🚀 Key Features

- **Personalized Risk Assessment**: Uses a **Stacking Ensemble ML Model** (XGBoost, Random Forest, Logistic Regression) to predict clinical risk from vitals.
- **Regional Infrastructure Analysis**: Integrates **NFHS-5 data** and TOPSIS safety rankings for 700+ Indian districts.
- **RAG-Powered AI Companion**: An empathetic AI chatbot that provides medical guidance based on retrieved clinical guidelines and your specific risk profile.
- **Professional Reporting**: Instant PDF export of health assessments for medical consultation.
- **Modern User Experience**: High-fidelity React dashboard with real-time analytics and responsive design.

## 🛠️ Tech Stack

- **Backend**: FastAPI, Python, Scikit-Learn, XGBoost, FPDF2.
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide React.
- **AI Engine**: Google Gemini 2.0 via OpenRouter (RAG Architecture).

## 📦 Project Structure

```text
PregaCare/
├── api.py                   # FastAPI REST entry point
├── final_assessment.py       # Risk integration logic
├── patient_risk_pipeline.py  # ML model inference
├── pregacare_engine.py      # AI RAG engine
├── stacking_model.pkl       # Trained ML model
├── knowledge_base/          # Clinical guidelines
└── frontend-v2/             # React Dashboard
```


## 🛡️ Privacy & Security
- Patient data is processed locally/server-side and not used for training.
- AI guidance is based on verified clinical guidelines (RAG) to minimize hallucination.
- *Disclaimer: This tool is for guidance only. Always consult a healthcare professional for medical emergencies.*

---
Developed with ❤️ for Maternal Health.
