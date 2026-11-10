import React from 'react'
import { MessageSquare } from 'lucide-react'

const SUSPICIOUS_WORDS = [
  'otp', 'aadhaar', 'cbi', 'police', 'arrest', 'giraftaar', 'kyc',
  'bank account', 'money transfer', 'paisa', 'criminal', 'crime',
  'urgent', 'turant', 'abhi', 'jaldi', 'immediately', 'secret',
  'kisi ko mat batana', 'password', 'pin', 'cvv', 'lottery', 'prize',
  'warrant', 'jail', 'court', 'case', 'enforcement'
]

function highlightText(text) {
  if (!text) return text
  const lower = text.toLowerCase()
  const parts = []
  let lastIdx = 0

  // Sort by position of first occurrence
  const matches = []
  for (const word of SUSPICIOUS_WORDS) {
    let idx = lower.indexOf(word, 0)
    while (idx !== -1) {
      matches.push({ start: idx, end: idx + word.length, word })
      idx = lower.indexOf(word, idx + 1)
    }
  }
  matches.sort((a, b) => a.start - b.start)

  // Merge overlapping
  const merged = []
  for (const m of matches) {
    if (merged.length && m.start < merged[merged.length - 1].end) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, m.end)
    } else {
      merged.push({ ...m })
    }
  }

  for (const m of merged) {
    if (m.start > lastIdx) {
      parts.push(<span key={lastIdx}>{text.slice(lastIdx, m.start)}</span>)
    }
    parts.push(
      <mark key={m.start} className="highlight-word" title="Suspicious keyword">
        {text.slice(m.start, m.end)}
      </mark>
    )
    lastIdx = m.end
  }
  if (lastIdx < text.length) {
    parts.push(<span key={lastIdx}>{text.slice(lastIdx)}</span>)
  }
  return parts.length > 0 ? parts : text
}

export default function TranscriptPanel({ segments = [], fullText = '', isDemo = false }) {
  if (!segments || segments.length === 0) {
    return (
      <div className="card p-5">
        <h2 className="section-title mb-1">Live Transcript</h2>
        <p className="text-xs text-secondary-text mb-4">Conversation will appear here during analysis</p>
        <div className="flex flex-col items-center py-10 text-secondary-text">
          <MessageSquare className="w-10 h-10 text-border mb-2" />
          <p className="text-sm">Transcript will appear here</p>
          <p className="text-xs mt-1">Start recording or run a demo</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="section-title">Live Transcript</h2>
        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="text-xs font-semibold text-secondary-text bg-slate-100 px-2 py-0.5 rounded-full border border-border">
              DEMO
            </span>
          )}
          <span className="text-xs text-secondary-text">{segments.length} segment{segments.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <p className="text-xs text-secondary-text mb-4">
        <span className="highlight-word text-xs px-1">Red highlights</span> = suspicious keywords
      </p>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {segments.map((seg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${seg.is_suspicious ? 'bg-red-50 p-2.5 rounded-lg border border-red-100' : ''}`}
          >
            {/* Speaker & Time */}
            <div className="flex-shrink-0 text-right w-20">
              <div className="text-xs font-semibold text-primary-text">{seg.speaker || 'Caller'}</div>
              <div className="text-xs text-secondary-text font-mono">
                {formatTime(seg.timestamp)}
              </div>
              {seg.is_suspicious && (
                <span className="text-xs text-danger font-semibold">⚠</span>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-primary-text leading-relaxed">
                {highlightText(seg.text)}
              </p>
              {seg.suspicious_words?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {seg.suspicious_words.slice(0, 4).map((w, i) => (
                    <span key={i} className="text-xs bg-red-100 text-danger px-1.5 py-0.5 rounded font-medium border border-red-200">
                      {w}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
