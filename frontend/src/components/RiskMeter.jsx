import React, { useMemo } from 'react'

const RADIUS = 72
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const ARC_START = 135
const ARC_LENGTH = 270

function getRiskColor(score) {
  if (score >= 80) return { stroke: '#DC2626', text: '#DC2626', label: 'HIGH RISK', bg: 'bg-red-50' }
  if (score >= 40) return { stroke: '#D97706', text: '#D97706', label: 'SUSPICIOUS', bg: 'bg-amber-50' }
  return { stroke: '#16A34A', text: '#16A34A', label: 'SAFE', bg: 'bg-green-50' }
}

export default function RiskMeter({ score = 0, status = 'SAFE', scamType = null }) {
  const { stroke, text, label, bg } = getRiskColor(score)

  // Arc-based SVG gauge
  const arcRadius = RADIUS
  const arcCircumference = 2 * Math.PI * arcRadius
  const arcRatio = score / 100
  const arcDash = arcCircumference * (ARC_LENGTH / 360) * arcRatio
  const arcOffset = arcCircumference * (1 - ARC_LENGTH / 360) / 2 + arcCircumference * (1 - arcRatio) * (ARC_LENGTH / 360)

  return (
    <div className="card p-6 flex flex-col items-center">
      <div className="mb-4 text-center">
        <h2 className="section-title">Risk Analysis</h2>
        <p className="text-xs text-secondary-text mt-0.5">Real-time threat assessment</p>
      </div>

      {/* SVG Gauge */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg
          className="absolute inset-0 w-full h-full -rotate-[135deg]"
          viewBox="0 0 180 180"
          fill="none"
          aria-label={`Risk score: ${score} out of 100`}
          role="img"
        >
          {/* Background arc */}
          <circle
            cx="90"
            cy="90"
            r={arcRadius}
            stroke="#E2E8F0"
            strokeWidth="12"
            strokeDasharray={`${arcCircumference * 0.75} ${arcCircumference * 0.25}`}
            strokeLinecap="round"
            fill="none"
          />
          {/* Foreground arc */}
          <circle
            cx="90"
            cy="90"
            r={arcRadius}
            stroke={stroke}
            strokeWidth="12"
            strokeDasharray={`${arcCircumference * 0.75 * (score / 100)} ${arcCircumference - arcCircumference * 0.75 * (score / 100)}`}
            strokeLinecap="round"
            fill="none"
            className="risk-meter-arc"
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease' }}
          />
        </svg>

        {/* Center content */}
        <div className="flex flex-col items-center z-10">
          <span
            className="text-4xl font-bold tabular-nums"
            style={{ color: text }}
          >
            {score}
          </span>
          <span className="text-xs text-secondary-text font-medium mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`mt-3 px-4 py-1.5 rounded-full ${bg} border`}
        style={{ borderColor: stroke + '40' }}>
        <span className="text-sm font-bold" style={{ color: text }}>
          {label}
        </span>
      </div>

      {/* Scam Type */}
      {scamType && (
        <div className="mt-3 text-center">
          <p className="text-xs text-secondary-text">Detected Category</p>
          <p className="text-sm font-semibold text-primary-text mt-0.5">{scamType}</p>
        </div>
      )}

      {/* Risk Scale */}
      <div className="mt-5 w-full">
        <div className="flex h-1.5 rounded-full overflow-hidden">
          <div className="bg-safe flex-[39]" title="Safe: 0–39" />
          <div className="bg-warning flex-[40] mx-0.5" title="Suspicious: 40–79" />
          <div className="bg-danger flex-[21]" title="High Risk: 80–100" />
        </div>
        <div className="flex justify-between text-xs text-secondary-text mt-1.5">
          <span>Safe</span>
          <span>Suspicious</span>
          <span>High Risk</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-secondary-text mt-4 text-center leading-relaxed">
        AI analysis — not a legal guarantee. Always verify independently.
      </p>
    </div>
  )
}
