import React from 'react'
import { Shield, Activity, HelpCircle, Wifi, WifiOff } from 'lucide-react'

export default function Header({ isConnected, isLive }) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-primary-text tracking-tight">
                Suraksha Call
              </span>
              <span className="text-xs font-medium text-secondary-text hidden sm:block">
                Live Scam Detector
              </span>
            </div>
          </div>
        </div>

        {/* Center — Live Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-border">
          {isLive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-danger recording-pulse" />
              <span className="text-xs font-semibold text-danger">LIVE MONITORING</span>
            </>
          ) : (
            <>
              <Activity className="w-3.5 h-3.5 text-secondary-text" />
              <span className="text-xs font-medium text-secondary-text">Monitoring Idle</span>
            </>
          )}
        </div>

        {/* Right — Connection & Help */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${isConnected ? 'text-safe' : 'text-secondary-text'}`}>
            {isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="hidden sm:block">{isConnected ? 'Connected' : 'Offline'}</span>
          </div>
          <a
            href="#help"
            className="flex items-center gap-1.5 text-xs font-medium text-secondary-text hover:text-primary-text transition-colors"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:block">Help</span>
          </a>
        </div>
      </div>

      {/* Tagline bar */}
      <div className="bg-primary/5 border-t border-border px-6 py-1.5">
        <p className="text-center text-xs text-secondary-text font-medium">
          "Scam ko number se nahi, baaton se pehchano" — AI-powered call analysis in Hindi, English &amp; Hinglish
        </p>
      </div>
    </header>
  )
}
