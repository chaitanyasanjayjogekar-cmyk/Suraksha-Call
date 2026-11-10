from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AudioAnalysisRequest(BaseModel):
    transcript: Optional[str] = None
    language: Optional[str] = "hinglish"


class AnalysisResult(BaseModel):
    risk_score: int
    status: str  # SAFE | SUSPICIOUS | HIGH_RISK
    scam_type: Optional[str] = None
    evidence: List[str] = []
    warning: bool = False
    explanation: str = ""
    transcript: Optional[str] = None
    is_demo: bool = False
    timestamp: datetime = None

    def __init__(self, **data):
        if data.get("timestamp") is None:
            data["timestamp"] = datetime.utcnow()
        super().__init__(**data)


class TranscriptSegment(BaseModel):
    speaker: Optional[str] = "Caller"
    text: str
    timestamp: float = 0.0
    is_suspicious: bool = False
    suspicious_words: List[str] = []


class TranscriptResult(BaseModel):
    segments: List[TranscriptSegment] = []
    full_text: str = ""
    language_detected: str = "hinglish"
    is_demo: bool = False


class WarningAudio(BaseModel):
    audio_base64: Optional[str] = None
    text: str = ""
    is_demo: bool = False
