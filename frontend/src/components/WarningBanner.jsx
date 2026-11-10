import React from 'react'
import { AlertOctagon, Volume2, X } from 'lucide-react'

export default function WarningBanner({ analysis, warningAudio, onDismiss, onPlayWarning }) {
  if (!analysis || analysis.risk_score < 80) return null

  const handlePlay = () => {
    if (warningAudio?.audio_base64) {
      const audio = new Audio(`data:audio/mp3;base64,${warningAudio.audio_base64}`)
      audio.play().catch(console.error)
    } else {
      // Browser TTS fallback
      const msg = warningAudio?.text ||
        'Savdhaan! Yeh scam ho sakta hai. OTP mat dijiye. Call kaat dijiye.'
      const utterance = new SpeechSynthesisUtterance(msg)
      utterance.lang = 'hi-IN'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
    if (onPlayWarning) onPlayWarning()
  }

  return (
    <div
      className="rounded-xl border border-red-300 bg-red-50 p-4 fade-in-down"
      role="alert"
      aria-live="assertive"
      aria-label="High risk scam warning"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-danger flex items-center justify-center flex-shrink-0">
          <AlertOctagon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-danger">⚠ HIGH RISK — Potential Scam Detected</h3>
            {analysis.scam_type && (
              <span className="text-xs bg-red-100 text-danger px-2 py-0.5 rounded-full border border-red-200 font-semibold">
                {analysis.scam_type}
              </span>
            )}
          </div>
          <p className="text-sm text-red-700 mt-1 font-medium">
            Do NOT share your OTP, PIN, or banking information. Hang up immediately.
          </p>
          <p className="text-xs text-red-600 mt-1">
            Cyber Crime Helpline: <strong>1930</strong> · National Helpline: <strong>14444</strong>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handlePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-danger text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
            aria-label="Play voice warning in Hindi"
            title="Play Hindi voice warning"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Voice Warning
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 text-red-400 hover:text-red-600 rounded"
              aria-label="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Warning text in Hindi */}
      <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-200">
        <p className="text-sm text-red-800 font-medium">
          🔊 "Ye scam ho sakta hai. OTP mat dijiye. Call kaat dijiye aur official source se verify kijiye."
        </p>
      </div>
    </div>
  )
}
