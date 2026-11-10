import React from 'react'
import { ShieldAlert, CheckCircle2, Info } from 'lucide-react'

export default function EvidencePanel({ evidence = [], status = 'SAFE', scamType = null }) {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="card p-5">
        <h2 className="section-title mb-3">Evidence Analysis</h2>
        <div className="flex flex-col items-center py-8 text-secondary-text">
          <ShieldAlert className="w-8 h-8 text-border mb-2" />
          <p className="text-sm">No evidence data yet</p>
        </div>
      </div>
    )
  }

  const isSafe = status === 'SAFE'

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Evidence Analysis</h2>
        {scamType && (
          <span className="text-xs font-semibold text-danger bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
            {scamType}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {evidence.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              isSafe
                ? 'bg-green-50 border border-green-100'
                : 'bg-red-50 border border-red-100'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isSafe ? (
                <CheckCircle2 className="w-4 h-4 text-safe" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-danger" />
              )}
            </div>
            <p className={`text-sm leading-relaxed ${isSafe ? 'text-green-800' : 'text-red-800'}`}>
              {item}
            </p>
          </div>
        ))}
      </div>

      {!isSafe && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <Info className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            If you suspect fraud, hang up and call Cyber Crime Helpline <strong>1930</strong> immediately.
          </p>
        </div>
      )}
    </div>
  )
}
