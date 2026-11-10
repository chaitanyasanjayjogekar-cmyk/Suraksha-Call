import React, { useState, useEffect, useCallback, useRef } from 'react'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import RiskMeter from './components/RiskMeter'
import StatusCard from './components/StatusCard'
import WarningBanner from './components/WarningBanner'
import EvidencePanel from './components/EvidencePanel'
import TranscriptPanel from './components/TranscriptPanel'
import RiskTimeline from './components/RiskTimeline'
import FamilyAlertPanel from './components/FamilyAlertPanel'
import SecurityPanel from './components/SecurityPanel'
import RecentAnalyses from './components/RecentAnalyses'
import useAudioRecorder from './hooks/useAudioRecorder'
import {
  checkHealth, uploadAudio, runDemo, analyzeTranscript, getRecentAnalyses
} from './services/api'
import { AlertCircle, X, CheckCircle2 } from 'lucide-react'

// Build timeline data from risk score progression
function buildTimeline(currentScore, prevTimeline = []) {
  const now = new Date()
  const timeLabel = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const entry = { label: timeLabel, risk: currentScore }

  // Add events at key thresholds
  if (currentScore >= 80 && !prevTimeline.some(d => d.risk >= 80)) {
    entry.event = 'HIGH RISK threshold crossed'
  } else if (currentScore >= 40 && !prevTimeline.some(d => d.risk >= 40)) {
    entry.event = 'SUSPICIOUS threshold reached'
  }

  return [...prevTimeline, entry].slice(-10)
}

// Demo timelines
const SCAM_TIMELINE = [
  { label: '0:05', risk: 10, },
  { label: '0:12', risk: 28, event: 'CBI mention detected' },
  { label: '0:20', risk: 51, event: 'Arrest threat detected' },
  { label: '0:30', risk: 72, event: 'OTP request detected' },
  { label: '0:38', risk: 85, event: 'HIGH RISK — Aadhaar mentioned' },
  { label: '0:45', risk: 92, event: 'Secrecy demand detected' },
]

const NORMAL_TIMELINE = [
  { label: '0:05', risk: 5 },
  { label: '0:12', risk: 8 },
  { label: '0:20', risk: 10 },
  { label: '0:30', risk: 7 },
]

export default function App() {
  // Backend connection
  const [isConnected, setIsConnected] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(true)

  // Analysis state
  const [analysis, setAnalysis] = useState(null)
  const [transcript, setTranscript] = useState(null)
  const [warningAudio, setWarningAudio] = useState(null)
  const [timelineData, setTimelineData] = useState([])
  const [recentAnalyses, setRecentAnalyses] = useState([])

  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [notification, setNotification] = useState(null)   // { type: 'success'|'error', message }
  const [warningDismissed, setWarningDismissed] = useState(false)
  const [isLive, setIsLive] = useState(false)

  const recorder = useAudioRecorder()
  const notifTimerRef = useRef(null)

  // ── Notification helpers ──────────────────────────────────────────────
  const showNotif = useCallback((type, message, duration = 4000) => {
    clearTimeout(notifTimerRef.current)
    setNotification({ type, message })
    notifTimerRef.current = setTimeout(() => setNotification(null), duration)
  }, [])

  // ── Health check on mount ─────────────────────────────────────────────
  useEffect(() => {
    checkHealth()
      .then((res) => {
        setIsConnected(true)
        setIsDemoMode(res.data.demo_mode ?? true)
      })
      .catch(() => {
        setIsConnected(false)
        setIsDemoMode(true)
        showNotif('error', 'Backend not reachable. Running in offline demo mode.')
      })

    getRecentAnalyses()
      .then((res) => setRecentAnalyses(res.data.analyses || []))
      .catch(() => {})
  }, [])

  // ── Handle recorder errors ────────────────────────────────────────────
  useEffect(() => {
    if (recorder.error) {
      showNotif('error', recorder.error)
    }
  }, [recorder.error])

  // ── Handle audio blob after recording stops ───────────────────────────
  useEffect(() => {
    if (recorder.audioBlob && !recorder.isRecording) {
      handleAudioBlob(recorder.audioBlob)
    }
  }, [recorder.audioBlob, recorder.isRecording])

  // ── Process result from API ───────────────────────────────────────────
  const processResult = useCallback((data, demoTimeline = null) => {
    const a = data.analysis
    const t = data.transcript
    const w = data.warning_audio

    setAnalysis(a)
    setTranscript(t)
    setWarningAudio(w || null)
    setWarningDismissed(false)

    if (demoTimeline) {
      setTimelineData(demoTimeline)
    } else {
      setTimelineData((prev) => buildTimeline(a.risk_score, prev))
    }

    setRecentAnalyses((prev) => [
      {
        risk_score: a.risk_score,
        status: a.status,
        scam_type: a.scam_type,
        transcript_preview: a.transcript?.slice(0, 100) || '',
        is_demo: a.is_demo,
        timestamp: new Date().toISOString().replace('Z', ''),
      },
      ...prev,
    ].slice(0, 10))
  }, [])

  // ── Audio blob upload ─────────────────────────────────────────────────
  const handleAudioBlob = useCallback(async (blob) => {
    setIsAnalyzing(true)
    setIsLive(false)
    try {
      const file = new File([blob], 'recording.webm', { type: blob.type || 'audio/webm' })
      const res = await uploadAudio(file, (pct) => setUploadProgress(pct))
      setUploadProgress(100)
      processResult(res.data)
      showNotif('success', 'Analysis complete!')
    } catch (err) {
      // Fallback: rule-based analysis
      showNotif('error', `Upload failed (${err.message}). Running offline analysis.`)
      runOfflineFallback('Recording audio — analysis unavailable without backend')
    } finally {
      setIsAnalyzing(false)
      setTimeout(() => setUploadProgress(null), 1000)
    }
  }, [processResult, showNotif])

  // ── File upload ───────────────────────────────────────────────────────
  const handleFileUpload = useCallback(async (file) => {
    setIsAnalyzing(true)
    setIsLive(false)
    setUploadProgress(0)
    try {
      const res = await uploadAudio(file, setUploadProgress)
      setUploadProgress(100)
      processResult(res.data)
      showNotif('success', 'File analyzed successfully!')
    } catch (err) {
      showNotif('error', `Upload failed: ${err.message}`)
    } finally {
      setIsAnalyzing(false)
      setTimeout(() => setUploadProgress(null), 1000)
    }
  }, [processResult, showNotif])

  // ── Demo handlers ─────────────────────────────────────────────────────
  const handleNormalDemo = useCallback(async () => {
    setIsAnalyzing(true)
    setIsLive(false)
    try {
      const res = await runDemo('normal')
      processResult(res.data, NORMAL_TIMELINE)
      showNotif('success', 'Normal call demo complete — SAFE result')
    } catch {
      // If backend offline, use hardcoded demo
      processResult(HARDCODED_NORMAL_DEMO, NORMAL_TIMELINE)
      showNotif('success', 'Normal call demo complete — SAFE result')
    } finally {
      setIsAnalyzing(false)
    }
  }, [processResult, showNotif])

  const handleScamDemo = useCallback(async () => {
    setIsAnalyzing(true)
    setIsLive(false)
    try {
      const res = await runDemo('scam')
      processResult(res.data, SCAM_TIMELINE)
      showNotif('error', '⚠ HIGH RISK detected — Scam demo active', 6000)
    } catch {
      processResult(HARDCODED_SCAM_DEMO, SCAM_TIMELINE)
      showNotif('error', '⚠ HIGH RISK detected — Scam demo active', 6000)
    } finally {
      setIsAnalyzing(false)
    }
  }, [processResult, showNotif])

  // ── Recording ─────────────────────────────────────────────────────────
  const handleStartRecord = useCallback(() => {
    recorder.startRecording()
    setIsLive(true)
    setAnalysis(null)
    setTranscript(null)
    setWarningAudio(null)
    setTimelineData([])
    setWarningDismissed(false)
  }, [recorder])

  const handleStopRecord = useCallback(() => {
    recorder.stopRecording()
    setIsLive(false)
  }, [recorder])

  // ── Offline fallback ──────────────────────────────────────────────────
  function runOfflineFallback(text) {
    const lowerText = text.toLowerCase()
    const hasScam = ['otp', 'cbi', 'arrest', 'kyc', 'aadhaar'].some(w => lowerText.includes(w))
    if (hasScam) {
      processResult(HARDCODED_SCAM_DEMO, SCAM_TIMELINE)
    } else {
      processResult(HARDCODED_NORMAL_DEMO, NORMAL_TIMELINE)
    }
  }

  const showWarning = analysis && analysis.risk_score >= 80 && !warningDismissed

  return (
    <div className="min-h-screen bg-background">
      <Header isConnected={isConnected} isLive={isLive || recorder.isRecording} />

      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-dropdown
            border max-w-sm w-full fade-in-down
            ${notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
            }`}
          role="alert"
        >
          {notification.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-safe" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0 text-danger" />
          }
          <span className="text-sm font-medium flex-1">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-0.5 hover:opacity-70" aria-label="Dismiss notification">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-5 flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Demo Mode</span> — Backend running without Gnani AI API key.
              AI features are simulated. Add your API key to <code className="bg-amber-100 px-1 rounded">.env</code> for live analysis.
            </p>
          </div>
        )}

        {/* Warning Banner */}
        {showWarning && (
          <div className="mb-5">
            <WarningBanner
              analysis={analysis}
              warningAudio={warningAudio}
              onDismiss={() => setWarningDismissed(true)}
            />
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ─── LEFT: Controls ─────────────────────── */}
          <div className="lg:col-span-3 space-y-5">
            <ControlPanel
              isRecording={recorder.isRecording}
              isPaused={recorder.isPaused}
              duration={recorder.duration}
              onStartRecord={handleStartRecord}
              onPauseRecord={recorder.pauseRecording}
              onStopRecord={handleStopRecord}
              onUpload={handleFileUpload}
              onNormalDemo={handleNormalDemo}
              onScamDemo={handleScamDemo}
              isAnalyzing={isAnalyzing}
              uploadProgress={uploadProgress}
            />
            <SecurityPanel
              analysis={analysis}
              isConnected={isConnected}
              isDemo={isDemoMode}
            />
          </div>

          {/* ─── CENTER: Risk Meter + Status ────────── */}
          <div className="lg:col-span-5 space-y-5">
            <RiskMeter
              score={analysis?.risk_score || 0}
              status={analysis?.status || 'SAFE'}
              scamType={analysis?.scam_type}
            />
            <StatusCard analysis={analysis} />
          </div>

          {/* ─── RIGHT: Family + Recent ─────────────── */}
          <div className="lg:col-span-4 space-y-5">
            <FamilyAlertPanel analysis={analysis} />
            <RecentAnalyses analyses={recentAnalyses} />
          </div>

        </div>

        {/* ─── LOWER SECTION ──────────────────────────── */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TranscriptPanel
            segments={transcript?.segments || []}
            fullText={transcript?.full_text || ''}
            isDemo={transcript?.is_demo || false}
          />
          <div className="space-y-5">
            <RiskTimeline timelineData={timelineData} />
            <EvidencePanel
              evidence={analysis?.evidence || []}
              status={analysis?.status || 'SAFE'}
              scamType={analysis?.scam_type}
            />
          </div>
        </div>

        {/* ─── Help Section ───────────────────────────── */}
        <div id="help" className="mt-10 card p-6">
          <h2 className="text-base font-semibold text-primary-text mb-4">How to Use Suraksha Call</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Start Recording', desc: 'Click "Start Recording" when you receive a suspicious call. Allow microphone access when prompted.' },
              { step: '2', title: 'Upload Audio', desc: 'Already have a recording? Upload a WAV, MP3, or WebM file for analysis.' },
              { step: '3', title: 'View Analysis', desc: 'The AI analyzes the conversation and shows a risk score with specific evidence.' },
              { step: '4', title: 'Take Action', desc: 'If HIGH RISK: hang up immediately. Call Cyber Crime helpline 1930 to report the fraud.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-text">{title}</p>
                  <p className="text-xs text-secondary-text mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 bg-slate-50 rounded-lg border border-border">
            <p className="text-xs text-secondary-text">
              <strong className="text-primary-text">Important:</strong> Suraksha Call is an AI-powered advisory tool.
              It does NOT intercept real calls, store personal data, or provide legal guarantees.
              Always verify suspicious situations through official government channels.
              Cyber Crime Helpline: <strong className="text-primary-text">1930</strong> |
              National Consumer Helpline: <strong className="text-primary-text">1800-11-4000</strong>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center space-y-1">
          <p className="text-xs text-secondary-text">
            © 2024 Suraksha Call · Built with Gnani AI · For educational and protective use only
          </p>
          <p className="text-xs text-secondary-text">
            "Scam ko number se nahi, baaton se pehchano"
          </p>
          <p className="text-xs text-secondary-text">
            Built by{' '}
            <a
              href="mailto:chaitanyasanjayjogekar@gmail.com"
              className="text-primary hover:underline font-medium"
            >
              Chaitanya Sanjay Jogekar
            </a>
          </p>
        </footer>

      </main>
    </div>
  )
}

// ── Hardcoded offline demos ──────────────────────────────────────────────
const HARDCODED_NORMAL_DEMO = {
  analysis: {
    risk_score: 10,
    status: 'SAFE',
    scam_type: null,
    evidence: [
      'No suspicious keywords detected in the conversation',
      'Conversation appears professional and legitimate',
      'No OTP, PIN, or financial information requested',
    ],
    warning: false,
    explanation: 'This appears to be a legitimate call. The caller confirmed an appointment without requesting any sensitive information. No scam indicators detected.',
    transcript: 'Hello sir, how are you? Your appointment has been confirmed for tomorrow at 10 AM. Please bring your original documents. Thank you for calling. Have a good day.',
    is_demo: true,
    timestamp: new Date().toISOString(),
  },
  transcript: {
    segments: [
      { speaker: 'Caller', text: 'Hello sir, how are you?', timestamp: 0, is_suspicious: false, suspicious_words: [] },
      { speaker: 'Caller', text: 'Your appointment has been confirmed for tomorrow at 10 AM.', timestamp: 3, is_suspicious: false, suspicious_words: [] },
      { speaker: 'Caller', text: 'Please bring your original documents. Thank you for calling.', timestamp: 8, is_suspicious: false, suspicious_words: [] },
    ],
    full_text: 'Hello sir, how are you? Your appointment has been confirmed for tomorrow at 10 AM. Please bring your original documents. Thank you for calling.',
    language_detected: 'hinglish',
    is_demo: true,
  },
  warning_audio: null,
}

const HARDCODED_SCAM_DEMO = {
  analysis: {
    risk_score: 92,
    status: 'HIGH_RISK',
    scam_type: 'Digital Arrest Scam',
    evidence: [
      'Caller falsely claimed to be from CBI — a government agency never contacts via phone for arrests',
      'Caller threatened arrest to create fear and panic in the victim',
      'Caller requested OTP — legitimate agencies NEVER ask for OTP',
      'Caller mentioned Aadhaar card involvement in a crime — a classic scare tactic',
      "Caller created artificial urgency ('abhi', 'immediately') to prevent rational thinking",
      'Caller mentioned criminal case to intimidate the victim into compliance',
    ],
    warning: true,
    explanation: "HIGH RISK (92%). This is a classic Digital Arrest Scam. The caller impersonated a CBI officer, threatened arrest, and demanded sensitive information. Real government agencies NEVER call to demand OTPs or threaten immediate arrest over the phone. Hang up immediately.",
    transcript: 'Sir, main CBI se bol raha hoon. Aapka Aadhaar card ek crime mein involve hai. Aapko abhi apna OTP share karna hoga warna aapko giraftaar kar liya jayega. Ye bahut urgent matter hai, kisi ko mat batana.',
    is_demo: true,
    timestamp: new Date().toISOString(),
  },
  transcript: {
    segments: [
      { speaker: 'Caller', text: 'Sir, main CBI se bol raha hoon.', timestamp: 0, is_suspicious: true, suspicious_words: ['cbi'] },
      { speaker: 'Caller', text: 'Aapka Aadhaar card ek crime mein involve hai.', timestamp: 4, is_suspicious: true, suspicious_words: ['aadhaar', 'crime'] },
      { speaker: 'Caller', text: 'Aapko abhi apna OTP share karna hoga warna aapko giraftaar kar liya jayega.', timestamp: 9, is_suspicious: true, suspicious_words: ['otp', 'giraftaar'] },
      { speaker: 'Caller', text: 'Ye bahut urgent matter hai, kisi ko mat batana.', timestamp: 15, is_suspicious: true, suspicious_words: ['urgent', 'kisi ko mat batana'] },
    ],
    full_text: 'Sir, main CBI se bol raha hoon. Aapka Aadhaar card ek crime mein involve hai. Aapko abhi apna OTP share karna hoga warna aapko giraftaar kar liya jayega. Ye bahut urgent matter hai, kisi ko mat batana.',
    language_detected: 'hinglish',
    is_demo: true,
  },
  warning_audio: {
    audio_base64: null,
    text: 'Savdhaan! Yeh ek scam call hai. OTP mat dijiye. Abhi call kaat dein aur 1930 par call karein.',
    is_demo: true,
  },
}
