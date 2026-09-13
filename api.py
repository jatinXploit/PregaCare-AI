import os
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from starlette.background import BackgroundTask
from typing import List, Literal

from final_assessment import PregaCareFinalAssessment
from pregacare_engine import PregaCareAIEngine
from patient_report import generate_patient_pdf


app = FastAPI(
    title="PregaCare REST API",
    version="1.0.0"
)


# --------------------------------------------------
# CORS Configuration
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Initialize PregaCare Components
# --------------------------------------------------

assessor = PregaCareFinalAssessment()
engine = PregaCareAIEngine()


# --------------------------------------------------
# Request Models
# --------------------------------------------------

ResponseLanguage = Literal[
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
]


class PatientVitals(BaseModel):
    Age: float
    SystolicBP: float
    DiastolicBP: float
    BS: float
    BodyTemp: float
    HeartRate: float


class AssessmentRequest(BaseModel):
    vitals: PatientVitals
    district: str
    state: str


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    user_query: str
    assessment_report: dict
    chat_history: List[ChatMessage] = Field(default_factory=list)
    response_language: ResponseLanguage = "English"


class ExportRequest(BaseModel):
    report: dict
    vitals: PatientVitals
    chat_history: List[ChatMessage] = Field(default_factory=list)


# --------------------------------------------------
# Health Endpoint
# --------------------------------------------------

@app.get("/health")
def health_check():
    try:
        model_loaded = assessor.clinical_pipeline.model is not None

        return {
            "status": "healthy",
            "model_loaded": model_loaded
        }

    except Exception as error:
        return {
            "status": "partially_healthy",
            "model_loaded": False,
            "error": str(error)
        }


# --------------------------------------------------
# Assessment Endpoint
# --------------------------------------------------

@app.post("/assess")
def get_assessment(data: AssessmentRequest):
    try:
        vitals_dict = data.vitals.model_dump()

        report = assessor.perform_assessment(
            vitals=vitals_dict,
            district=data.district,
            state=data.state
        )

        if not isinstance(report, dict):
            raise ValueError(
                "Assessment engine returned an invalid response."
            )

        if "error" in report:
            raise HTTPException(
                status_code=400,
                detail=report["error"]
            )

        return report

    except HTTPException:
        raise

    except Exception as error:
        print(f"ASSESS ERROR: {error}")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# --------------------------------------------------
# Multilingual RAG Chat Endpoint
# --------------------------------------------------

@app.post("/chat")
def chat_with_ai(data: ChatRequest):
    try:
        history = [
            message.model_dump()
            for message in data.chat_history
        ]

        result = engine.generate_response(
            user_query=data.user_query,
            assessment_report=data.assessment_report,
            chat_history=history,
            response_language=data.response_language
        )

        return {
            "response": result["response"],
            "is_emergency": result["is_emergency"],
            "emergency_reason": result["emergency_reason"]
        }

    except Exception as error:
        print(f"CHAT ERROR: {error}")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# --------------------------------------------------
# PDF Export Endpoint
# --------------------------------------------------

@app.post("/export-pdf")
def export_pdf(data: ExportRequest):
    temp_filename = None

    try:
        temp_filename = f"PregaCare_Report_{uuid.uuid4().hex}.pdf"

        chat_history = [
            message.model_dump()
            for message in data.chat_history
        ]

        generate_patient_pdf(
            report_data=data.report,
            vitals=data.vitals.model_dump(),
            output_path=temp_filename,
            chat_history=chat_history
        )

        if not os.path.exists(temp_filename):
            raise FileNotFoundError(
                "PDF report could not be generated."
            )

        return FileResponse(
            path=temp_filename,
            media_type="application/pdf",
            filename="PregaCare_Report.pdf",
            background=BackgroundTask(
                os.remove,
                temp_filename
            )
        )

    except Exception as error:
        print(f"PDF ERROR: {error}")

        if temp_filename and os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except OSError:
                pass

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# --------------------------------------------------
# Local Development Server
# --------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
