import httpx
import logging
from config import settings
from models.schemas import TranscriptResult, TranscriptSegment
from services.risk_analyzer import highlight_suspicious_words
from typing import Optional

logger = logging.getLogger(__name__)


async def transcribe_audio_gnani(audio_bytes: bytes, mime_type: str = "audio/wav",
                                  filename: str = "audio.wav") -> TranscriptResult:
    """
    Call Gnani AI Vachana STT API (Prisma v3.0) to transcribe audio.
    Endpoint: POST https://api.vachana.ai/stt/v3
    Auth: X-API-Key-ID header
    Content-Type: multipart/form-data
    """
    if settings.demo_mode:
        logger.info("Demo mode: returning placeholder transcript")
        return _mock_transcript()

    headers = {
        "X-API-Key-ID": settings.gnani_api_key,
    }

    # Determine clean filename/mime for form upload
    ext_map = {
        "audio/wav": ("audio.wav", "audio/wav"),
        "audio/wave": ("audio.wav", "audio/wav"),
        "audio/mpeg": ("audio.mp3", "audio/mpeg"),
        "audio/mp3": ("audio.mp3", "audio/mpeg"),
        "audio/webm": ("audio.webm", "audio/webm"),
        "audio/ogg": ("audio.ogg", "audio/ogg"),
        "audio/m4a": ("audio.m4a", "audio/mp4"),
    }
    fname, fmime = ext_map.get(mime_type, (filename, mime_type))

    files = {
        "audio_file": (fname, audio_bytes, fmime),
    }
    data = {
        "model": "prisma-v3.0",
        "language_code": "indic-auto",   # auto-detect Hindi/Hinglish/English
        "format": "transcribe",
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                settings.gnani_stt_endpoint,
                headers=headers,
                files=files,
                data=data,
            )
            resp.raise_for_status()
            data_resp = resp.json()
            logger.info(f"Gnani STT response: {data_resp}")
            return _parse_gnani_stt_response(data_resp)

    except httpx.HTTPStatusError as e:
        logger.error(f"Gnani STT HTTP {e.response.status_code}: {e.response.text[:300]}")
        raise RuntimeError(f"Gnani STT API error ({e.response.status_code}): {e.response.text[:200]}")
    except httpx.TimeoutException:
        raise RuntimeError("Gnani STT API timed out. Please try a shorter audio clip.")
    except Exception as e:
        logger.error(f"Gnani STT error: {e}")
        raise RuntimeError(f"Speech-to-text failed: {str(e)}")


def _parse_gnani_stt_response(data: dict) -> TranscriptResult:
    """
    Parse the Gnani Vachana STT v3 response into our TranscriptResult.
    The response typically looks like:
    {
      "transcript": "...",
      "words": [...],
      "language": "hi-IN",
      ...
    }
    """
    # Try multiple possible response shapes
    full_text = (
        data.get("transcript")
        or data.get("text")
        or data.get("result", {}).get("transcript", "")
        or ""
    )

    # Sentence-level segments if available
    sentences = data.get("sentences") or data.get("segments") or []
    segments = []

    if sentences:
        for idx, seg in enumerate(sentences):
            text = seg.get("transcript") or seg.get("text") or ""
            start = seg.get("start_time", idx * 4.0)
            is_susp, susp_words = highlight_suspicious_words(text)
            segments.append(TranscriptSegment(
                speaker=f"Speaker {seg.get('speaker_id', 1)}",
                text=text,
                timestamp=float(start),
                is_suspicious=is_susp,
                suspicious_words=susp_words,
            ))
    elif full_text:
        # Split by sentence punctuation
        import re
        parts = re.split(r'[।\.!\?]+', full_text)
        for idx, part in enumerate(parts):
            part = part.strip()
            if not part:
                continue
            is_susp, susp_words = highlight_suspicious_words(part)
            segments.append(TranscriptSegment(
                speaker="Caller",
                text=part,
                timestamp=float(idx * 4),
                is_suspicious=is_susp,
                suspicious_words=susp_words,
            ))

    if not segments and full_text:
        is_susp, susp_words = highlight_suspicious_words(full_text)
        segments = [TranscriptSegment(
            speaker="Caller",
            text=full_text,
            timestamp=0.0,
            is_suspicious=is_susp,
            suspicious_words=susp_words,
        )]

    lang = data.get("language", data.get("language_code", "hinglish"))

    return TranscriptResult(
        segments=segments,
        full_text=full_text,
        language_detected=lang,
        is_demo=False,
    )


def _mock_transcript() -> TranscriptResult:
    return TranscriptResult(
        segments=[
            TranscriptSegment(
                speaker="System",
                text="[Live mode] Use 'Start Recording' or 'Upload Audio' to transcribe a call.",
                timestamp=0.0,
                is_suspicious=False,
                suspicious_words=[],
            )
        ],
        full_text="[Live mode] Use 'Start Recording' or 'Upload Audio' to transcribe a call.",
        language_detected="hinglish",
        is_demo=True,
    )


async def transcribe_text_to_transcript(text: str) -> TranscriptResult:
    """Convert plain text into a TranscriptResult (used for demo / text-based analysis)."""
    import re
    sentences = [s.strip() for s in re.split(r'[।\.!\?]+', text) if s.strip()]
    segments = []
    for idx, sentence in enumerate(sentences):
        is_susp, susp_words = highlight_suspicious_words(sentence)
        segments.append(TranscriptSegment(
            speaker="Caller" if idx % 2 == 0 else "User",
            text=sentence,
            timestamp=float(idx * 4),
            is_suspicious=is_susp,
            suspicious_words=susp_words,
        ))
    if not segments:
        segments = [TranscriptSegment(speaker="Caller", text=text, timestamp=0.0,
                                       is_suspicious=False, suspicious_words=[])]
    return TranscriptResult(
        segments=segments,
        full_text=text,
        language_detected="hinglish",
        is_demo=False,
    )
