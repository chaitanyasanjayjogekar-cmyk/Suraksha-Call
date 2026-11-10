import httpx
import base64
import logging
from config import settings
from models.schemas import WarningAudio

logger = logging.getLogger(__name__)

WARNING_TEXT_HI = (
    "Savdhaan! Yeh ek sambhaavit scam call hai. "
    "Apna OTP, PIN ya koi bhi banking jaankari share mat karein. "
    "Abhi call kaat dein aur official helpline se verify karein. "
    "Cyber Crime helpline number hai 1930."
)


async def generate_voice_warning(risk_score: int, scam_type: str | None = None) -> WarningAudio:
    """
    Use Gnani AI Vachana Timbre TTS to generate a Hindi voice warning.
    Endpoint: POST https://api.vachana.ai/api/v1/tts/inference
    Auth: X-API-Key-ID header
    Returns binary WAV audio.
    """
    if settings.demo_mode:
        logger.info("Demo mode: returning text-only warning")
        return WarningAudio(audio_base64=None, text=WARNING_TEXT_HI, is_demo=True)

    headers = {
        "X-API-Key-ID": settings.gnani_api_key,
        "Content-Type": "application/json",
    }

    payload = {
        "text": WARNING_TEXT_HI,
        "voice": "Nalini",          # Hindi female voice
        "model": "timbre-v2.5",
        "language": "hi-IN",
        "speed": 1,
        "audio_config": {
            "encoding": "linear_pcm",
            "container": "wav",
            "num_channels": 1,
            "sample_rate": 16000,
            "sample_width": 2,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                settings.gnani_tts_endpoint,
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()

            # Response is binary WAV audio
            audio_bytes = resp.content
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
            logger.info(f"Gnani TTS generated {len(audio_bytes)} bytes of audio")

            return WarningAudio(
                audio_base64=audio_b64,
                text=WARNING_TEXT_HI,
                is_demo=False,
            )

    except httpx.HTTPStatusError as e:
        logger.warning(f"Timbre TTS HTTP {e.response.status_code}: {e.response.text[:200]}. Returning text-only.")
        return WarningAudio(audio_base64=None, text=WARNING_TEXT_HI, is_demo=True)
    except Exception as e:
        logger.warning(f"Timbre TTS error: {e}. Returning text-only warning.")
        return WarningAudio(audio_base64=None, text=WARNING_TEXT_HI, is_demo=True)
