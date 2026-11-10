from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from services.audio_service import validate_audio_file, save_analysis
from services.prisma_service import transcribe_audio_gnani, transcribe_text_to_transcript
from services.evon_service import analyze_with_evon
from services.timbre_service import generate_voice_warning
from services.risk_analyzer import demo_analyze
from models.schemas import AudioAnalysisRequest
from dependencies import get_optional_user
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


def _uid(user: Optional[dict]) -> int:
    return user["id"] if user else 0


@router.post("/upload-audio")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: Optional[dict] = Depends(get_optional_user),
):
    content = await file.read()
    valid, err = validate_audio_file(file.filename or "audio.wav", file.content_type or "audio/wav", len(content))
    if not valid:
        raise HTTPException(status_code=400, detail=err)

    try:
        transcript_result = await transcribe_audio_gnani(content, file.content_type or "audio/wav")
        analysis = await analyze_with_evon(transcript_result.full_text)
        analysis.transcript = transcript_result.full_text

        warning_audio = None
        if analysis.warning:
            warning_audio = await generate_voice_warning(analysis.risk_score, analysis.scam_type)

        save_analysis(
            analysis.risk_score, analysis.status, analysis.scam_type,
            analysis.transcript or "", analysis.is_demo, _uid(current_user)
        )

        return {
            "success": True,
            "transcript": {
                "segments": [s.dict() for s in transcript_result.segments],
                "full_text": transcript_result.full_text,
                "language_detected": transcript_result.language_detected,
                "is_demo": transcript_result.is_demo,
            },
            "analysis": analysis.dict(),
            "warning_audio": warning_audio.dict() if warning_audio else None,
        }
    except Exception as e:
        logger.error(f"Audio upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze-audio")
async def analyze_audio(
    request: AudioAnalysisRequest,
    current_user: Optional[dict] = Depends(get_optional_user),
):
    if not request.transcript:
        raise HTTPException(status_code=400, detail="Transcript text required")

    try:
        analysis = await analyze_with_evon(request.transcript)
        analysis.transcript = request.transcript

        warning_audio = None
        if analysis.warning:
            warning_audio = await generate_voice_warning(analysis.risk_score, analysis.scam_type)

        save_analysis(
            analysis.risk_score, analysis.status, analysis.scam_type,
            analysis.transcript, analysis.is_demo, _uid(current_user)
        )

        transcript_result = await transcribe_text_to_transcript(request.transcript)

        return {
            "success": True,
            "transcript": {
                "segments": [s.dict() for s in transcript_result.segments],
                "full_text": transcript_result.full_text,
                "language_detected": transcript_result.language_detected,
                "is_demo": transcript_result.is_demo,
            },
            "analysis": analysis.dict(),
            "warning_audio": warning_audio.dict() if warning_audio else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Text analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/detect-scam")
async def detect_scam(
    request: AudioAnalysisRequest,
    current_user: Optional[dict] = Depends(get_optional_user),
):
    return await analyze_audio(request, current_user)


@router.post("/demo/{demo_type}")
async def run_demo(
    demo_type: str,
    current_user: Optional[dict] = Depends(get_optional_user),
):
    if demo_type not in ("normal", "scam"):
        raise HTTPException(status_code=400, detail="demo_type must be 'normal' or 'scam'")

    analysis = demo_analyze(demo_type)
    warning_audio = None
    if analysis.warning:
        warning_audio = await generate_voice_warning(analysis.risk_score, analysis.scam_type)

    save_analysis(
        analysis.risk_score, analysis.status, analysis.scam_type,
        analysis.transcript or "", True, _uid(current_user)
    )

    transcript_result = await transcribe_text_to_transcript(analysis.transcript or "")

    return {
        "success": True,
        "transcript": {
            "segments": [s.dict() for s in transcript_result.segments],
            "full_text": transcript_result.full_text,
            "language_detected": "hinglish",
            "is_demo": True,
        },
        "analysis": analysis.dict(),
        "warning_audio": warning_audio.dict() if warning_audio else None,
    }


@router.post("/generate-warning")
async def generate_warning(request: AudioAnalysisRequest):
    warning_audio = await generate_voice_warning(80)
    return warning_audio.dict()
