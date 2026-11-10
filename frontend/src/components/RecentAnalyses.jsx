import React from 'react'
import { Clock, TrendingUp, Shield, AlertTriangle } from 'lucide-react'

function getStatusColor(status) {
  if (status === 'HIGH_RISK') return { text: 'text-danger', bg: 'bg-red-50', border: 'border-red-100' }
  if (status === 'SUSPICIOUS') return { text: 'text-warning', bg: 'bg-amber-50', border: 'border-amber-100' }
  return { text: 'text-safe', bg: 'bg-green-50', border: 'border-green-100' }
}

export default function RecentAnalyses({ analyses = [] }) {
  if (!analyses || analyses.length === 0) return null

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-secondary-text" />
        <h2 className="section-title">Recent Analyses</h2>
      </div>

      <div className="space-y-2">
        {analyses.slice(0, 5).map((item, idx) => {
          const cfg = getStatusColor(item.status)
          const ts = item.timestamp ? new Date(item.timestamp + 'Z') : new Date()
          return (
            <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
              <div className={`text-sm font-bold w-10 text-right flex-shrink-0 ${cfg.text}`}>
                {item.risk_score}%
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${cfg.text}`}>
                  {item.status.replace('_', ' ')}
                  {item.scam_type ? ` — ${item.scam_type}` : ''}
                </p>
                {item.transcript_preview && (
                  <p className="text-xs text-secondary-text truncate mt-0.5">{item.transcript_preview}</p>
                )}
              </div>
              <div className="text-xs text-secondary-text flex-shrink-0">
                {item.is_demo ? (
                  <span className="bg-slate-100 border border-border px-1.5 py-0.5 rounded font-medium">Demo</span>
                ) : (
                  ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
