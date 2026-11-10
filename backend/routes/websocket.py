import asyncio
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.evon_service import analyze_with_evon
from services.risk_analyzer import calculate_risk_score, analyze_scam_patterns, classify_status

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/analyze")
async def websocket_analyze(websocket: WebSocket):
    """
    WebSocket endpoint for real-time audio chunk analysis.
    Client sends JSON: {"type": "text", "data": "transcript text so far"}
    Server responds with: {"type": "analysis", "data": {...}}
    """
    await websocket.accept()
    logger.info("WebSocket connection opened")
    accumulated_text = ""

    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            msg_type = msg.get("type", "")

            if msg_type == "text":
                chunk = msg.get("data", "")
                accumulated_text += " " + chunk

                # Quick rule-based scan for real-time feedback
                pattern_data = analyze_scam_patterns(accumulated_text)
                risk_score = calculate_risk_score(accumulated_text, pattern_data)
                status = classify_status(risk_score)

                await websocket.send_json({
                    "type": "quick_analysis",
                    "data": {
                        "risk_score": risk_score,
                        "status": status,
                        "scam_type": pattern_data.get("scam_type"),
                        "warning": risk_score >= 80,
                        "transcript_so_far": accumulated_text.strip(),
                    }
                })

            elif msg_type == "finalize":
                # Full AI analysis on finalize
                try:
                    analysis = await analyze_with_evon(accumulated_text)
                    await websocket.send_json({
                        "type": "final_analysis",
                        "data": analysis.dict()
                    })
                except Exception as e:
                    await websocket.send_json({
                        "type": "error",
                        "message": str(e),
                    })
                accumulated_text = ""

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

            elif msg_type == "reset":
                accumulated_text = ""
                await websocket.send_json({"type": "reset_ack"})

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
