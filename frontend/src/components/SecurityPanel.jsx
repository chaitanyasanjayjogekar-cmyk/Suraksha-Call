import React from 'react'
import { Lock, Shield, CheckCircle2, XCircle, AlertTriangle, Cpu } from 'lucide-react'

export default function SecurityPanel({ analysis, isConnected, isDemo }) {
  const checks = [
    {
      label: 'Microphone Access',
      ok: true,
      icon: CheckCircle2,
    },
    {
      label: 'API Connection',
      ok: isConnected,
      icon: isConnected ? CheckCircle2 : XCircle,
    },
    {
      label: 'AI Analysis Engine',
      ok: !isDemo,
      icon: Cpu,
      note: isDemo ? 'Demo mode' : 'Live',
    },
    {
      label: 'No Data Stored',
      ok: true,
      icon: Lock,
      note: 'Session only',
    },
  ]

  return (
    <div className="card p-5">
      <h2 className="section-title mb-4">Security Status</h2>

      <div className="space-y-2.5">
        {checks.map((c, idx) => {
          const Icon = c.icon
          return (
            <div key={idx} className="flex items-center gap-3">
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${c.ok ? 'text-safe' : 'text-warning'}`}
              />
              <span className="text-sm text-primary-text flex-1">{c.label}</span>
              {c.note && (
                <span className="text-xs text-secondary-text">{c.note}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Mode indicator */}
      <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-border">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary-text">
            {isDemo ? 'DEMO MODE' : 'LIVE MODE'}
          </span>
        </div>
        <p className="text-xs text-secondary-text mt-1">
          {isDemo
            ? 'Add Gnani AI API key to enable live speech-to-text and AI scam detection.'
            : 'Connected to Gnani AI for real-time analysis.'}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            AI predictions are not legally binding. Always verify suspicious calls through official government channels.
          </p>
        </div>
      </div>
    </div>
  )
}
