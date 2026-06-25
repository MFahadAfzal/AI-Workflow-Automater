import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

export function useWorkflowSocket() {
  const wsUri = `${import.meta.env.VITE_WS_URL}?token=${localStorage.getItem('token')}`
  const [messages, setMessages] = useState({});

  useEffect(() => {
    const websocket = new WebSocket(wsUri);

    websocket.addEventListener("open", () => {
      console.log("CONNECTED");
    });

    websocket.addEventListener("error", (e) => {
      console.log(`ERROR`);
    });

    websocket.addEventListener('message', (event) => {
      const parsed = JSON.parse(event.data)

      if (parsed.type === 'node_started' || parsed.type === 'node_complete' || parsed.type === 'node_aborted') {
        flushSync(() => {
          setMessages(prev => ({
              ...prev,
              [parsed.nodeId]: { ...prev[parsed.nodeId], ...parsed }
            }))
        })
        setMessages(prev => {
            const next = { ...prev }
            delete next[parsed.nodeId]
            return next
          })
        return
      }

      setMessages(prev => {
          const existing = prev[parsed.nodeId]
          return {
            ...prev,
            [parsed.nodeId]: {
              ...parsed,
              content: existing ? (existing.content || '') + parsed.content : parsed.content
            }
          }
        })
    })

    return () => {
      websocket.close();
    };
  }, []);

  return { messages, clearMessages: () => setMessages({}) };
}