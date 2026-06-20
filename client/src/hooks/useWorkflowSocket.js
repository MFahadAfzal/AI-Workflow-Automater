import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

export function useWorkflowSocket() {
  const wsUri = import.meta.env.VITE_WS_URL
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
        setMessages(parsed)
      })
      return
    }

    setMessages(prev => ({
      ...parsed,
      content: prev.nodeId === parsed.nodeId ? (prev.content || '') + parsed.content : parsed.content
    }))
})

    return () => {
      websocket.close();
    };
  }, []);

  return { messages, clearMessages: () => setMessages({}) };
}