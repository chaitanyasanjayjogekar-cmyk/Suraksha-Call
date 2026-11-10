from models.schemas import AnalysisResult, TranscriptResult, TranscriptSegment
from typing import Optional, List
import re

SUSPICIOUS_KEYWORDS = [
    "otp", "aadhaar", "cbi", "police", "arrest", "giraftaar", "kyc",
    "bank account", "money transfer", "paisa bhejo", "account band",
    "criminal", "crime", "fd", "fraud", "tax", "lottery", "prize",
    "reward", "verify", "urgent", "turant", "abhi", "jaldi",
    "secret", "kisi ko mat batana", "do not tell", "password",
    "pin", "cvv", "credit card", "debit card", "loan", "emi",
    "income tax", "enforcement directorate", "ed", "cid", "customs",
    "drug", "parcel", "courier", "package", "legal action",
    "court", "case", "warrant", "bail", "fine", "penalty"
]

SCAM_PATTERNS = {
    "Digital Arrest Scam": [
        "cbi", "police", "arrest", "giraftaar", "criminal", "crime",
        "case", "warrant", "enforcement directorate", "ed", "legal action",
        "court", "customs", "drug", "parcel"
    ],
    "Fake KYC Scam": [
        "kyc", "aadhaar", "verify", "account band", "account block",
        "update", "document", "id proof", "pan card"
    ],
    "Bank OTP Scam": [
        "otp", "bank account", "password", "pin", "cvv",
        "credit card", "debit card", "net banking"
    ],
    "Lottery / Prize Scam": [
        "lottery", "prize", "reward", "winner", "congratulations",
        "won", "claim", "lucky draw"
    ],
    "Financial Fraud": [
        "money transfer", "paisa bhejo", "investment", "fd", "tax",
        "loan", "emi", "income tax", "refund", "fee"
    ],
}


def highlight_suspicious_words(text: str) -> tuple[bool, List[str]]:
    text_lower = text.lower()
    found = []
    for kw in SUSPICIOUS_KEYWORDS:
        if kw in text_lower:
            found.append(kw)
    return len(found) > 0, found


def analyze_scam_patterns(text: str) -> dict:
    text_lower = text.lower()
    scores = {}
    for scam_type, keywords in SCAM_PATTERNS.items():
        count = sum(1 for kw in keywords if kw in text_lower)
        if count > 0:
            scores[scam_type] = count

    if not scores:
        return {"scam_type": None, "pattern_score": 0}

    top_scam = max(scores, key=scores.get)
    return {"scam_type": top_scam, "pattern_score": scores[top_scam]}


def calculate_risk_score(text: str, pattern_data: dict) -> int:
    text_lower = text.lower()
    score = 0

    # Pattern-based scoring
    pattern_score = pattern_data.get("pattern_score", 0)
    score += min(pattern_score * 15, 50)

    # Urgency indicators
    urgency_words = ["urgent", "turant", "abhi", "jaldi", "immediately", "now", "right now"]
    urgency_count = sum(1 for w in urgency_words if w in text_lower)
    score += min(urgency_count * 10, 20)

    # Secrecy indicators
    secrecy_words = ["secret", "kisi ko mat batana", "do not tell anyone", "confidential"]
    secrecy_count = sum(1 for w in secrecy_words if w in text_lower)
    score += min(secrecy_count * 10, 15)

    # Threat indicators
    threat_words = ["arrest", "giraftaar", "jail", "legal action", "case filed", "police aayegi"]
    threat_count = sum(1 for w in threat_words if w in text_lower)
    score += min(threat_count * 15, 25)

    # OTP / Financial data request
    otp_words = ["otp", "pin", "password", "cvv", "account number"]
    otp_count = sum(1 for w in otp_words if w in text_lower)
    score += min(otp_count * 20, 30)

    return min(int(score), 100)


def build_evidence_list(text: str, scam_type: Optional[str]) -> List[str]:
    evidence = []
    text_lower = text.lower()

    if any(w in text_lower for w in ["otp", "pin", "password"]):
        evidence.append("Caller requested OTP / PIN / Password — a major red flag")
    if any(w in text_lower for w in ["arrest", "giraftaar", "jail", "police aayegi"]):
        evidence.append("Caller threatened arrest or police action to create fear")
    if any(w in text_lower for w in ["cbi", "enforcement directorate", "customs", "cid"]):
        evidence.append("Caller falsely claimed to be from a government agency (CBI/ED/Customs)")
    if any(w in text_lower for w in ["abhi", "jaldi", "urgent", "turant", "immediately"]):
        evidence.append("Caller created artificial urgency to prevent careful thinking")
    if any(w in text_lower for w in ["secret", "kisi ko mat batana", "do not tell"]):
        evidence.append("Caller instructed to keep conversation secret from family")
    if any(w in text_lower for w in ["bank account", "money transfer", "paisa", "transfer"]):
        evidence.append("Caller demanded money transfer or bank account access")
    if any(w in text_lower for w in ["aadhaar", "pan card", "kyc", "document"]):
        evidence.append("Caller requested Aadhaar / PAN / KYC documents")
    if any(w in text_lower for w in ["lottery", "prize", "won", "winner"]):
        evidence.append("Caller claimed you won a prize or lottery — a classic scam tactic")
    if any(w in text_lower for w in ["crime", "criminal", "case", "court", "warrant"]):
        evidence.append("Caller mentioned legal cases or crimes to intimidate the victim")

    return evidence if evidence else ["Conversation patterns appear normal"]


def classify_status(risk_score: int) -> str:
    if risk_score >= 80:
        return "HIGH_RISK"
    elif risk_score >= 40:
        return "SUSPICIOUS"
    return "SAFE"


def demo_analyze(demo_type: str = "scam") -> AnalysisResult:
    if demo_type == "normal":
        return AnalysisResult(
            risk_score=10,
            status="SAFE",
            scam_type=None,
            evidence=["No suspicious keywords detected", "Conversation appears normal and professional"],
            warning=False,
            explanation="This appears to be a legitimate call. No scam indicators were detected.",
            transcript="Hello sir, how are you? Your appointment has been confirmed for tomorrow at 10 AM. Please bring your documents. Thank you for calling.",
            is_demo=True,
        )
    else:
        return AnalysisResult(
            risk_score=92,
            status="HIGH_RISK",
            scam_type="Digital Arrest Scam",
            evidence=[
                "Caller falsely claimed to be from CBI — a government agency never contacts via phone for arrests",
                "Caller threatened arrest to create fear and panic",
                "Caller requested OTP — legitimate agencies NEVER ask for OTP",
                "Caller mentioned Aadhaar card involvement in a crime — a classic scare tactic",
                "Caller created artificial urgency ('immediately') to prevent rational thinking",
                "Caller mentioned criminal case to intimidate the victim",
            ],
            warning=True,
            explanation="This is a classic Digital Arrest Scam. The caller impersonated a CBI officer, threatened arrest, and demanded sensitive information. Real government agencies never call to demand OTPs or threaten immediate arrest over the phone.",
            transcript="Sir, main CBI se bol raha hoon. Aapka Aadhaar card ek crime mein involve hai. Aapko abhi apna OTP share karna hoga warna aapko giraftaar kar liya jayega. Ye bahut urgent matter hai, kisi ko mat batana.",
            is_demo=True,
        )
