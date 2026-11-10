import { useState, useRef, useCallback } from 'react'

export default function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)

  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const onChunkRef = useRef(null)

  const startRecording = useCallback(async (onChunk) => {
    setError(null)
    setAudioBlob(null)
    setDuration(0)
    chunksRef.current = []
    onChunkRef.current = onChunk

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg'

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
          if (onChunkRef.current) onChunkRef.current(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setAudioBlob(blob)
        stream.getTracks().forEach((t) => t.stop())
        clearInterval(timerRef.current)
      }

      recorder.start(2000) // collect chunks every 2s
      setIsRecording(true)
      setIsPaused(false)

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow microphone access in your browser settings.')
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.')
      } else {
        setError(`Microphone error: ${err.message}`)
      }
    }
  }, [])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        clearInterval(timerRef.current)
        setIsPaused(true)
      }
    }
  }, [isRecording, isPaused])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      clearInterval(timerRef.current)
    }
  }, [isRecording])

  const reset = useCallback(() => {
    stopRecording()
    setDuration(0)
    setAudioBlob(null)
    setError(null)
    chunksRef.current = []
  }, [stopRecording])

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return {
    isRecording,
    isPaused,
    duration,
    formattedDuration: formatDuration(duration),
    error,
    audioBlob,
    startRecording,
    pauseRecording,
    stopRecording,
    reset,
  }
}
