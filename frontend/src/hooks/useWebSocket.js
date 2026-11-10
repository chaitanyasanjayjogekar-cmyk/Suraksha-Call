import { useState, useRef, useCallback, useEffect } from 'react'

export default function useWebSocket(url) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const wsRef = useRef(null)
  const reconnectRef = useRef(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      clearTimeout(reconnectRef.current)
    }

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        setLastMessage(data)
      } catch {}
    }

    ws.onclose = () => {
      setIsConnected(false)
      reconnectRef.current = setTimeout(connect, 3000)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [url])

  const disconnect = useCallback(() => {
    clearTimeout(reconnectRef.current)
    wsRef.current?.close()
    setIsConnected(false)
  }, [])

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  useEffect(() => {
    return () => {
      clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [])

  return { isConnected, lastMessage, connect, disconnect, send }
}
