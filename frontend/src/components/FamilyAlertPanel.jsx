import React, { useState } from 'react'
import { Users, Bell, MessageSquare, Phone, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function FamilyAlertPanel({ analysis }) {
  const [alertSent, setAlertSent] = useState(false)
  const isHighRisk = analysis?.risk_score >= 80

  const handleSendAlert = () => {
    setAlertSent(true)
    setTimeout(() => setAlertSent(false), 5000)
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Family Alert</h2>
        <span className="text-xs font-semibold text-secondary-text bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-warning">
          DEMO
        </span>
      </div>

      {/* Status */}
      {isHighRisk ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />
            <p className="text-sm font-semibold text-danger">Potential scam detected!</p>
          </div>
          <p className="text-xs text-red-700 mt-1 ml-6">
            Consider alerting a trusted family member or friend.
          </p>
        </div>
      ) : (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-safe flex-shrink-0" />
            <p className="text-sm font-medium text-safe">Call appears safe</p>
          </div>
          <p className="text-xs text-green-700 mt-1 ml-6">No alert needed at this time.</p>
        </div>
      )}

      {/* Demo Alert Channels */}
      <div className="space-y-2 mb-4">
        <p className="label">Demo Alert Channels</p>

        <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-safe" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary-text">WhatsApp</p>
            <p className="text-xs text-secondary-text">Family group notification</p>
          </div>
          <span className="text-xs text-secondary-text">Demo only</span>
        </div>

        <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Phone className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary-text">SMS Alert</p>
            <p className="text-xs text-secondary-text">Registered family number</p>
          </div>
          <span className="text-xs text-secondary-text">Demo only</span>
        </div>

        <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
            <Bell className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary-text">Push Notification</p>
            <p className="text-xs text-secondary-text">Suraksha app notification</p>
          </div>
          <span className="text-xs text-secondary-text">Demo only</span>
        </div>
      </div>

      {/* Send Alert Button */}
      <button
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          isHighRisk
            ? 'bg-danger text-white hover:bg-red-700'
            : 'bg-slate-100 text-secondary-text cursor-not-allowed'
        }`}
        onClick={handleSendAlert}
        disabled={!isHighRisk || alertSent}
        aria-label="Send demo family alert"
      >
        <Users className="w-4 h-4" />
        {alertSent ? '✓ Demo Alert Sent!' : 'Send Demo Alert'}
      </button>

      {alertSent && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg fade-in-down">
          <p className="text-xs text-green-800 font-medium">
            ✓ Demo alert sent to family contacts. In production, this would notify registered numbers via WhatsApp/SMS.
          </p>
        </div>
      )}

      <p className="text-xs text-secondary-text mt-3 text-center">
        ⚠ Demo only — no real messages sent. User authorization required for real alerts.
      </p>
    </div>
  )
}
