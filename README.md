---
title: PregaCare API
emoji: 🩺
colorFrom: purple
colorTo: pink
sdk: docker
pinned: false
app_port: 7860
---

# PregaCare AI

# PregaCare AI

PregaCare AI is an AI-powered maternal-health support platform that combines clinical risk assessment, regional healthcare accessibility analysis, multilingual RAG guidance, voice interaction, emergency alerts, and downloadable medical reports.

> **Important:** PregaCare AI is an educational decision-support prototype. It does not provide a medical diagnosis or replace a qualified healthcare professional.

## Live Application

* **Live Demo:** https://prega-care-ai.vercel.app
* **GitHub Repository:** https://github.com/jatinXploit/PregaCare-AI
* **Backend Health:** https://jatinxploit-pregacare-api.hf.space/health

## Problem Statement

Maternal-health risk is affected by both clinical factors and local healthcare accessibility. Existing systems often:

* Assess only medical vitals.
* Ignore district-level healthcare conditions.
* Provide generic recommendations.
* Lack support for regional languages.
* Do not provide immediate emergency guidance.
* Make reports difficult to share with healthcare professionals.

PregaCare AI combines patient vitals, machine-learning risk prediction, district-level safety data, and retrieved medical guidance in one platform.

## Core Features

### 1. Maternal Risk Assessment

The application analyses:

* Age
* Systolic blood pressure
* Diastolic blood pressure
* Blood sugar
* Body temperature
* Heart rate

A trained stacking ensemble model predicts the patient's clinical risk.

### 2. Regional Safety Analysis

The system uses district-level healthcare indicators derived from NFHS-5 data and a TOPSIS-based ranking approach.

It considers the patient's district and state while calculating the regional safety index.

### 3. PregaCare Index

The final PregaCare Index combines:

* Individual Health Score
* Regional Safety Index
* Clinical Risk Band

The dashboard displays:

* Overall risk category
* PregaCare Index
* Health Index
* Safety Index
* Suggested action plan

### 4. RAG-Powered Clinical Assistant

The AI assistant retrieves medical guidance according to the patient's risk category and combines it with:

* Current assessment report
* Risk level
* Health score
* Regional safety score
* District information
* Previous conversation context

Gemini then generates a short, patient-friendly response grounded in the retrieved guidance.

### 5. Multilingual Support

The assistant supports the following languages:

1. English
2. Hindi
3. Haryanvi
4. Bengali
5. Telugu
6. Marathi
7. Tamil
8. Gujarati
9. Kannada
10. Malayalam
11. Punjabi
12. Urdu
13. Odia

The user can select a preferred language and receive the answer in its natural writing script.

### 6. Voice Input and Spoken Responses

The dashboard supports:

* Microphone-based questions
* Speech-to-text conversion
* Language-specific speech recognition
* Automatic text insertion
* Text-to-speech assistant responses
* Listen and stop controls

Browser support for speech recognition and voice availability may vary.

### 7. Multilingual Emergency Detection

The system analyses user messages for possible emergency symptoms, including:

* Heavy bleeding
* Breathing difficulty
* Unconsciousness
* Seizures
* Severe abdominal pain
* Severe chest pain
* Absent fetal movement
* Other potentially urgent pregnancy-related symptoms

When a possible emergency is detected, the application displays an urgent warning popup with options to:

* Call 112
* Call Ambulance 108
* Find a nearby hospital
* Share the current location

The application does not automatically dispatch an ambulance or contact a doctor.

### 8. PDF Medical Report

Users can download a PDF containing:

* Assessment summary
* Risk category
* PregaCare Index
* Patient vitals
* AI insights
* Suggested action plan
* RAG questions and answers
* Medical disclaimer

## System Architecture

```text
React + Vite Frontend
        |
        | HTTPS REST API
        v
FastAPI Backend
        |
        |---- Stacking Ensemble Risk Model
        |---- District Safety Dataset
        |---- Medical Guideline Knowledge Base
        |---- Gemini Multilingual RAG Engine
        |---- FPDF Medical Report Generator
```

## Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Axios
* Framer Motion
* Lucide React
* React Markdown
* Web Speech API

### Backend

* Python
* FastAPI
* Uvicorn
* Pydantic
* Requests
* Python Dotenv
* FPDF2

### Machine Learning

* Scikit-learn
* XGBoost
* Random Forest
* Logistic Regression
* Stacking Ensemble Model
* Joblib/Pickle model persistence

### AI and RAG

* Google Gemini API
* Risk-based medical guideline retrieval
* Context-augmented prompt generation
* Multilingual response generation
* AI-supported emergency classification

### Data and Decision Analysis

* NFHS-5 healthcare indicators
* District Safety Rankings
* TOPSIS-based regional analysis

### Deployment

* Frontend: Vercel
* Backend: Hugging Face Docker Space
* Source control: GitHub
* Continuous deployment: GitHub Actions

## Project Structure

```text
PregaCare-AI/
├── api.py
├── final_assessment.py
├── patient_report.py
├── patient_risk_pipeline.py
├── pregacare_engine.py
├── stacking_model.pkl
├── District_Safety_Rankings.csv
├── requirements.txt
├── Dockerfile
├── knowledge_base/
│   └── medical_guidelines/
│       ├── low_risk.md
│       ├── mid_risk.md
│       └── high_risk.md
├── frontend-v2/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
└── .github/
    └── workflows/
        └── huggingface.yml
```

## Local Setup

### Prerequisites

Install:

* Python 3.10 or newer
* Node.js and npm
* Git
* Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/jatinXploit/PregaCare-AI.git
cd PregaCare-AI
```

### 2. Create a Python Virtual Environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install Backend Dependencies

```powershell
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-flash-lite-latest
```

Never commit the `.env` file or expose the API key publicly.

### 5. Start the Backend

```powershell
python api.py
```

Backend health check:

```text
http://127.0.0.1:8000/health
```

### 6. Install Frontend Dependencies

```powershell
npm --prefix ".\frontend-v2" install
```

### 7. Start the Frontend

```powershell
npm --prefix ".\frontend-v2" run dev
```

Open:

```text
http://localhost:5173
```

## API Endpoints

### Health Check

```http
GET /health
```

Checks API availability and model-loading status.

### Risk Assessment

```http
POST /assess
```

Accepts patient vitals, district, and state and returns the complete assessment.

### Multilingual RAG Chat

```http
POST /chat
```

Accepts:

* Current question
* Assessment report
* Chat history
* Selected response language

Returns:

* Assistant response
* Emergency status
* Emergency reason

### PDF Export

```http
POST /export-pdf
```

Generates a downloadable assessment report containing vitals, insights, and RAG conversation history.

## Production Environment Variables

### Hugging Face Backend

Configure these inside the Space settings:

```env
GEMINI_API_KEY=your_secret_api_key
GEMINI_MODEL=gemini-flash-lite-latest
```

`GEMINI_API_KEY` must be stored as a secret.

### Vercel Frontend

Configure:

```env
VITE_API_URL=https://jatinxploit-pregacare-api.hf.space
```

The Gemini API key must never be added to the frontend.

## Security Measures

* API keys are stored using environment secrets.
* `.env` files are excluded from Git tracking.
* Generated patient reports are excluded from the repository.
* Gemini requests are made through the backend.
* The frontend does not expose the Gemini API key.
* Temporary PDF files are deleted after being returned.
* Unique PDF filenames prevent report collisions.

## Known Limitations

* The system is not a clinically validated medical device.
* Predictions depend on the training data and supplied vitals.
* Gemini API rate limits may affect chat availability.
* Hugging Face free Spaces may experience cold starts.
* Speech recognition depends on browser and device support.
* Haryanvi uses Hindi speech-recognition and speech-synthesis voices because a dedicated browser locale may not be available.
* Emergency detection cannot guarantee identification of every possible emergency expression.
* Emergency buttons initiate device-supported actions but do not automatically dispatch medical services.
* District-level data may not reflect real-time hospital availability.

## Responsible Use

In an emergency, users should not wait for an AI response. They should immediately contact local emergency services or visit the nearest emergency department.

PregaCare AI should be used only for educational guidance and preliminary risk awareness.

## Future Improvements

* Clinically validated datasets and external medical review
* Real-time hospital and doctor availability
* Verified ambulance-service integration
* Secure patient accounts and encrypted records
* Doctor dashboard and teleconsultation
* Expanded medical knowledge base
* Server-side speech recognition
* Native mobile application
* Monitoring, audit logs, and model-drift detection

## Author

**Jatin**

* GitHub: https://github.com/jatinXploit
* Live Project: https://prega-care-ai.vercel.app

## Feedback and Contributions

Suggestions, issues, and contributions are welcome through the GitHub Issues section:

https://github.com/jatinXploit/PregaCare-AI/issues
