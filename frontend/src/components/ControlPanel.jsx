import React, { useRef } from 'react'
import {
  Mic, MicOff, Square, Upload, Play, Shield, AlertTriangle,
  Pause, Loader2
} from 'lucide-react'

export default function ControlPanel({
  isRecording, isPaused, duration, onStartRecord, onPauseRecord, onStopRecord,
  onUpload, onNormalDemo, onScamDemo, isAnalyzing, uploadProgress
}) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  return (
    <div className="card p-5 flex flex-col gap-5">
      <div>
        <h2 className="section-title mb-1">Call Input</h2>
        <p className="text-xs text-secondary-text">Record live call or upload audio</p>
      </div>

      {/* Recording */}
      <div>
        <p className="label mb-3">Live Recording</p>

        {/* Timer */}
        {isRecording && (
          <div className="flex items-center gap-2 mb-3 p-2.5 bg-red-50 rounded-lg border border-red-100">
            <span className="w-2 h-2 rounded-full bg-danger recording-pulse" />
            <span className="font-mono text-sm font-bold text-danger">{formatDuration(duration)}</span>
            <span className="text-xs text-red-600 ml-auto">{isPaused ? 'Paused' : 'Recording...'}</span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {!isRecording ? (
            <button
              className="btn-danger flex items-center justify-center gap-2 w-full"
              onClick={onStartRecord}
              disabled={isAnalyzing}
              aria-label="Start recording"
            >
              <Mic className="w-4 h-4" />
              Start Recording
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                className="btn-secondary flex items-center justify-center gap-2 flex-1"
                onClick={onPauseRecord}
                aria-label={isPaused ? 'Resume recording' : 'Pause recording'}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                className="btn-primary flex items-center justify-center gap-2 flex-1"
                onClick={onStopRecord}
                aria-label="Stop and analyze"
              >
                <Square className="w-4 h-4" />
                Stop & Analyze
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload */}
      <div>
        <p className="label mb-3">Upload Audio</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,.mp3,.webm,.ogg,.m4a"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload audio file"
        />
        <button
          className="btn-secondary flex items-center justify-center gap-2 w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isRecording || isAnalyzing}
          aria-label="Upload audio file"
        >
          <Upload className="w-4 h-4" />
          Upload Audio File
        </button>
        {uploadProgress !== null && uploadProgress < 100 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-secondary-text mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
        <p className="text-xs text-secondary-text mt-2">
          Supports WAV, MP3, WebM, OGG · Max 50MB
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Demo Buttons */}
      <div>
        <p className="label mb-3">Demo Scenarios</p>
        <div className="flex flex-col gap-2">
          <button
            className="btn-safe flex items-center justify-center gap-2 w-full"
            onClick={onNormalDemo}
            disabled={isRecording || isAnalyzing}
            aria-label="Run normal call demo"
          >
            <Shield className="w-4 h-4" />
            Normal Call Demo
          </button>
          <button
            className="bg-orange-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm
                       hover:bg-orange-700 active:bg-orange-800 transition-colors duration-150
                       focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 w-full"
            onClick={onScamDemo}
            disabled={isRecording || isAnalyzing}
            aria-label="Run scam call demo"
          >
            <AlertTriangle className="w-4 h-4" />
            Scam Call Demo
          </button>
        </div>
        <p className="text-xs text-secondary-text mt-2 text-center">
          Demos work without API keys
        </p>
      </div>

      {/* Analyzing Indicator */}
      {isAnalyzing && (
        <div className="flex items-center justify-center gap-2 py-2 text-primary text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing call...
        </div>
      )}
    </div>
  )
}

function formatDuration(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
