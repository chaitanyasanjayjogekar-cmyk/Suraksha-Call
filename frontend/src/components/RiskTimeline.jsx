import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Area, AreaChart
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value
    const color = val >= 80 ? '#DC2626' : val >= 40 ? '#D97706' : '#16A34A'
    return (
      <div className="bg-card border border-border rounded-lg shadow-dropdown p-2.5 text-xs">
        <p className="text-secondary-text mb-1">{label}</p>
        <p className="font-bold" style={{ color }}>{val}% Risk</p>
      </div>
    )
  }
  return null
}

function getRiskStroke(val) {
  if (val >= 80) return '#DC2626'
  if (val >= 40) return '#D97706'
  return '#16A34A'
}

export default function RiskTimeline({ timelineData = [] }) {
  const hasData = timelineData.length > 0

  if (!hasData) {
    return (
      <div className="card p-5">
        <h2 className="section-title mb-1">Risk Timeline</h2>
        <p className="text-xs text-secondary-text mb-4">Risk score progression during the call</p>
        <div className="h-36 flex items-center justify-center text-secondary-text">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-slate-50 border border-border flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <p className="text-sm">Timeline will appear after analysis</p>
          </div>
        </div>
      </div>
    )
  }

  const latestScore = timelineData[timelineData.length - 1]?.risk || 0
  const strokeColor = getRiskStroke(latestScore)
  const fillColor = strokeColor + '20'

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="section-title">Risk Timeline</h2>
        <span className="text-xs font-semibold" style={{ color: strokeColor }}>
          Peak: {Math.max(...timelineData.map(d => d.risk))}%
        </span>
      </div>
      <p className="text-xs text-secondary-text mb-4">Risk score progression during the call</p>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timelineData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={80} stroke="#DC2626" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'High Risk', fill: '#DC2626', fontSize: 9, position: 'right' }} />
            <ReferenceLine y={40} stroke="#D97706" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: 'Suspicious', fill: '#D97706', fontSize: 9, position: 'right' }} />
            <Area
              type="monotone"
              dataKey="risk"
              stroke={strokeColor}
              strokeWidth={2}
              fill="url(#riskGrad)"
              dot={{ r: 3, fill: strokeColor, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: strokeColor }}
              isAnimationActive={true}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Events */}
      {timelineData.some(d => d.event) && (
        <div className="mt-3 space-y-1.5">
          <p className="label">Key Events</p>
          {timelineData.filter(d => d.event).map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-secondary-text w-10 flex-shrink-0">{d.label}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-danger flex-shrink-0" />
              <span className="text-primary-text">{d.event}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
