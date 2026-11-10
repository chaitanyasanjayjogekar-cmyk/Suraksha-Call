import httpx
import json
import logging
from config import settings
from models.schemas import AnalysisResult
from services.risk_analyzer import (
    analyze_scam_patterns,
    calculate_risk_score,
    build_evidence_list,
    classify_status,
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a cybersecurity AI specialized in detecting phone scams in India.
Analyze the given conversation transcript (which may be in Hindi, English, or Hinglish) and return a JSON object with:
- risk_score: integer 0-100 (0=safe, 100=definite scam)
- status: "SAFE" | "SUSPICIOUS" | "HIGH_RISK"
- scam_type: null or one of ["Digital Arrest Scam", "Fake KYC Scam", "Bank OTP Scam", "Lottery Scam", "Financial Fraud", "Suspicious Request"]
- evidence: array of strings explaining specific red flags found
- warning: boolean (true if risk_score >= 80)
- explanation: a clear 2-3 sentence explanation in simple English understandable by senior citizens

Respond ONLY with valid JSON. No extra text."""


async def analyze_with_evon(transcript: str) -> AnalysisResult:
    """
    Use Gnani AI Evon 30B LLM to analyze transcript for scam patterns.
    Falls back to rule-based analysis if API not configured.
    """
    if settings.demo_mode:
        logger.info("Demo mode: using rule-based scam detection")
        return _rule_based_analyze(transcript)

    headers = {
        "Authorization": f"Bearer {settings.gnani_api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "evon-30b",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze this call transcript:\n\n{transcript}"},
        ],
        "temperature": 0.1,
        "max_tokens": 500,
        "response_format": {"type": "json_object"},
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                settings.gnani_evon_endpoint,
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            return AnalysisResult(
                risk_score=int(parsed.get("risk_score", 0)),
                status=parsed.get("status", "SAFE"),
                scam_type=parsed.get("scam_type"),
                evidence=parsed.get("evidence", []),
                warning=bool(parsed.get("warning", False)),
                explanation=parsed.get("explanation", ""),
                transcript=transcript,
                is_demo=False,
            )
    except httpx.HTTPStatusError as e:
        logger.warning(f"Evon API HTTP error {e.response.status_code}. Falling back to rule-based.")
        return _rule_based_analyze(transcript)
    except Exception as e:
        logger.warning(f"Evon API error: {e}. Falling back to rule-based.")
        return _rule_based_analyze(transcript)


def _rule_based_analyze(transcript: str) -> AnalysisResult:
    """Deterministic rule-based scam detection as fallback."""
    pattern_data = analyze_scam_patterns(transcript)
    risk_score = calculate_risk_score(transcript, pattern_data)
    status = classify_status(risk_score)
    evidence = build_evidence_list(transcript, pattern_data.get("scam_type"))

    explanation = _generate_explanation(status, pattern_data.get("scam_type"), risk_score)

    return AnalysisResult(
        risk_score=risk_score,
        status=status,
        scam_type=pattern_data.get("scam_type"),
        evidence=evidence,
        warning=risk_score >= 80,
        explanation=explanation,
        transcript=transcript,
        is_demo=settings.demo_mode,
    )


def _generate_explanation(status: str, scam_type: str | None, risk_score: int) -> str:
    if status == "SAFE":
        return "This conversation appears safe. No significant scam indicators were detected. Continue normally but stay alert."
    elif status == "SUSPICIOUS":
        return f"This conversation shows some suspicious patterns ({risk_score}% risk). Be cautious. Do not share any personal information or OTP. Verify the caller's identity through official channels."
    else:
        base = f"HIGH RISK DETECTED ({risk_score}%). "
        if scam_type:
            base += f"This appears to be a {scam_type}. "
        base += "Do NOT share any OTP, PIN, or banking information. Hang up immediately and call the official helpline to verify."
        return base
