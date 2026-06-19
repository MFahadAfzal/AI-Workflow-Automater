import { useEffect, useState } from 'react';

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
        console.log("WS RECEIVED:", parsed);
        setMessages(parsed)
        // parsed is now back to being a JS object: { type: ..., data: ... }
    })

    return () => {
      websocket.close();
    };
  }, []);

  return { messages };
}