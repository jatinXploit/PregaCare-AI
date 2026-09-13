---
title: PregaCare API
emoji: 🩺
colorFrom: purple
colorTo: pink
sdk: docker
pinned: false
app_port: 7860
---

PregaCare AI

PregaCare AI is an AI-powered maternal-health support platform combining clinical risk assessment, district-level healthcare accessibility, multilingual RAG guidance, voice interaction, emergency alerts, and downloadable reports.

Medical disclaimer: This is an educational decision-support prototype. It does not diagnose medical conditions or replace a qualified healthcare professional. In an emergency, contact local emergency services or visit the nearest emergency department immediately.

Live Links

Application: https://prega-care-ai.vercel.app

GitHub: https://github.com/jatinXploit/PregaCare-AI

Backend health: https://jatinxploit-pregacare-api.hf.space/health

Problem

Maternal-health risk depends on both clinical factors and access to healthcare. Many systems provide generic advice, ignore regional infrastructure, offer limited language accessibility, and do not generate a portable report. PregaCare AI brings these elements into one workflow.

How It Works

The user enters clinical vitals, state, and district.

A stacking ensemble model estimates clinical risk.

District-level NFHS-5 indicators and TOPSIS rankings produce a regional safety score.

The system combines clinical and regional results into the PregaCare Index.

A risk-specific medical guideline is retrieved for the RAG assistant.

Gemini answers questions in the selected language using assessment context and retrieved guidance.

Possible emergency messages trigger an urgent-action popup.

The user can export the assessment and RAG conversation as a PDF.

Features

Risk Assessment

The model analyses age, systolic and diastolic blood pressure, blood sugar, body temperature, and heart rate. The dashboard displays the risk band, PregaCare Index, Health Index, Safety Index, location, and suggested action.

Regional Safety Analysis

District-level healthcare indicators derived from NFHS-5 data are ranked using a TOPSIS-based approach and incorporated into the final assessment.

Context-Aware RAG Assistant

The assistant combines the current assessment, conversation history, selected language, and risk-specific medical guideline. Responses are short, patient-friendly, and designed as guidance rather than diagnosis.

13 Languages

English, Hindi, Haryanvi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Urdu, and Odia are supported.

Voice Accessibility

The interface provides browser-based speech-to-text, language selection, automatic spoken responses, and listen/stop controls. Browser voice availability may vary. Haryanvi uses the Hindi browser locale because a dedicated browser locale may not be available.

Emergency Assistance

The system checks messages for possible emergencies such as heavy bleeding, breathing difficulty, unconsciousness, seizure, severe abdominal or chest pain, and absent fetal movement. It displays options to call 112, call ambulance 108, find a nearby hospital, and share location.

The prototype does not automatically dispatch an ambulance, contact a doctor, or guarantee detection of every emergency expression.

PDF Report

The downloadable report includes the assessment summary, vitals, AI insights, suggested action, RAG questions and answers, and a medical disclaimer.

Architecture

React/Vite Frontend (Vercel)
            |
            | HTTPS REST API
            v
FastAPI Backend (Hugging Face Docker Space)
     |------ Stacking Ensemble Model
     |------ District Safety Dataset
     |------ Medical Guideline Knowledge Base
     |------ Gemini Multilingual RAG
     `------ FPDF Report Generator

Technology Stack

Frontend: React, Vite, Tailwind CSS, Axios, Framer Motion, Lucide React, React Markdown, Web Speech API

Backend: Python, FastAPI, Uvicorn, Pydantic, Requests, python-dotenv, FPDF2

Machine learning: Scikit-learn, XGBoost, Random Forest, Logistic Regression, stacking ensemble

AI/RAG: Google Gemini API and risk-based Markdown guideline retrieval

Data: NFHS-5 indicators, district safety rankings, TOPSIS

Deployment: Vercel, Hugging Face Docker Spaces, GitHub Actions

Project Structure

PregaCare-AI/
├── .github/
│   └── workflows/
│       └── huggingface.yml
├── frontend-v2/
├── knowledge_base/
├── .env.example
├── .gitignore
├── api.py
├── District_Safety_Rankings.csv
├── Dockerfile
├── final_assessment.py
├── patient_report.py
├── patient_risk_pipeline.py
├── pregacare_engine.py
├── PregaCare_Project_Documentation.pdf
├── README.md
├── requirements.txt
└── stacking_model.pkl

Local .env, __pycache__/, node_modules/, build output, and generated patient reports are intentionally excluded from Git.

Local Installation

Requirements

Python 3.10+

Node.js and npm

Git

Gemini API key

1. Clone

git clone https://github.com/jatinXploit/PregaCare-AI.git
cd PregaCare-AI

2. Backend setup

python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

Create a root .env file:

GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-flash-lite-latest

Start the backend:

python api.py

Health check: http://127.0.0.1:8000/health

3. Frontend setup

npm --prefix ".\frontend-v2" install
npm --prefix ".\frontend-v2" run dev

Open http://localhost:5173.

API Endpoints

Method

Endpoint

Purpose

GET

/health

Check API and model status

POST

/assess

Generate clinical and regional assessment

POST

/chat

Generate multilingual RAG response and emergency flag

POST

/export-pdf

Generate the assessment and conversation PDF

Production Configuration

Hugging Face Space

Store these in Space settings:

GEMINI_API_KEY=your_secret_api_key
GEMINI_MODEL=gemini-flash-lite-latest

GEMINI_API_KEY must be stored as a secret.

Vercel

Use frontend-v2 as the Root Directory and configure:

VITE_API_URL=https://jatinxploit-pregacare-api.hf.space

Never place the Gemini key in the frontend.

Security and Privacy

Secrets are stored in environment-variable managers and excluded from Git.

Gemini requests are made through the backend.

Temporary PDF files use unique names and are deleted after delivery.

Generated patient reports are excluded from the repository.

This prototype does not currently provide persistent encrypted patient accounts or clinical-record storage.

Limitations

The system is not a clinically validated medical device.

Predictions depend on the model, training data, supplied vitals, and district dataset.

Gemini quotas or network failures can interrupt chat functionality.

Free hosting can introduce backend cold starts.

Speech recognition depends on browser/device support and may mistranscribe speech.

Emergency classification cannot guarantee detection of every urgent condition or expression.

District data does not represent real-time hospital or doctor availability.

Future Work

Clinical validation and professional medical review

Real-time hospital and doctor availability

Verified ambulance-provider integration

Secure authentication and encrypted patient records

Doctor dashboard and teleconsultation

Server-side speech recognition

Monitoring, audit logs, and model-drift detection

Author

Jatin

GitHub: https://github.com/jatinXploit

Live project: https://prega-care-ai.vercel.app

Feedback

Issues and suggestions can be submitted at:
https://github.com/jatinXploit/PregaCare-AI/issues
