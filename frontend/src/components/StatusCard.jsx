import React from 'react'
import { AlertTriangle, Shield, Info, Clock, ChevronRight } from 'lucide-react'

function getStatusConfig(status) {
  switch (status) {
    case 'HIGH_RISK':
      return {
        icon: AlertTriangle,
        color: 'text-danger',
        bg: 'bg-red-50',
        border: 'border-red-200',
        badge: 'status-high-risk',
        dot: 'bg-danger',
      }
    case 'SUSPICIOUS':
      return {
        icon: Info,
        color: 'text-warning',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'status-suspicious',
        dot: 'bg-warning',
      }
    default:
      return {
        icon: Shield,
        color: 'text-safe',
        bg: 'bg-green-50',
        border: 'border-green-200',
        badge: 'status-safe',
        dot: 'bg-safe',
      }
  }
}

export default function StatusCard({ analysis }) {
  if (!analysis) {
    return (
      <div className="card p-5">
        <h2 className="section-title mb-3">Call Status</h2>
        <div className="flex flex-col items-center justify-center py-8 text-secondary-text">
          <Shield className="w-10 h-10 text-border mb-3" />
          <p className="text-sm font-medium">No analysis yet</p>
          <p className="text-xs mt-1">Start recording or use a demo</p>
        </div>
      </div>
    )
  }

  const cfg = getStatusConfig(analysis.status)
  const Icon = cfg.icon
  const ts = analysis.timestamp ? new Date(analysis.timestamp) : new Date()

  return (
    <div className={`card p-5 border ${cfg.border}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Call Status</h2>
        {analysis.is_demo && (
          <span className="text-xs font-semibold text-secondary-text bg-slate-100 px-2 py-0.5 rounded-full border border-border">
            DEMO
          </span>
        )}
      </div>

      {/* Status Row */}
      <div className={`flex items-center gap-3 p-3 rounded-lg ${cfg.bg}`}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg} border ${cfg.border}`}>
          <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>
        <div>
          <span className={`status-badge ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {analysis.status.replace('_', ' ')}
          </span>
          {analysis.scam_type && (
            <p className="text-xs text-secondary-text mt-0.5">{analysis.scam_type}</p>
          )}
        </div>
        <div className="ml-auto text-right">
          <span className={`text-2xl font-bold ${cfg.color}`}>{analysis.risk_score}%</span>
          <p className="text-xs text-secondary-text">Risk</p>
        </div>
      </div>

      {/* Explanation */}
      {analysis.explanation && (
        <div className="mt-3 text-sm text-primary-text leading-relaxed">
          {analysis.explanation}
        </div>
      )}

      {/* Timestamp */}
      <div className="flex items-center gap-1.5 mt-3 text-xs text-secondary-text">
        <Clock className="w-3.5 h-3.5" />
        <span>Analyzed at {ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  )
}
