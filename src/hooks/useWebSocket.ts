import { useState, useEffect, useRef } from 'react';
import { Message, MessageContent } from '../interfaces/interfaces';
import config from '../settings';

const useWebSocket = (room: string) => {
  const [messages, setMessages] = useState<MessageContent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const webSocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      webSocket.current = new WebSocket(config.webSocketUrl);

      webSocket.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        if (webSocket.current) {
          const message: Message = {
            meta: 'join',
            room,
          };
          webSocket.current.send(JSON.stringify(message));
        }
      };

      webSocket.current.onmessage = (event) => {
        try {
          const receivedMessage: MessageContent = JSON.parse(event.data);
          if (receivedMessage.amount && receivedMessage.url && receivedMessage.address) {
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
          }
        } catch (error) {
          console.log('Received non-JSON message:', event.data);
        }
      };

      webSocket.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Simple reconnect logic
        setTimeout(() => {
          console.log('Reconnecting WebSocket...');
          connect();
        }, 5000);
      };

      webSocket.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        webSocket.current?.close();
      };
    };

    connect();

    return () => {
      if (webSocket.current) {
        webSocket.current.close();
      }
    };
  }, [room]);

  const sendMessage = (message: Omit<MessageContent, 'timestamp' | 'address'>) => {
    if (webSocket.current && isConnected) {
      const messageToSend: Message = {
        message: {
          ...message,
          timestamp: new Date(),
          address: '', // The server should set the address
        },
        meta: 'message',
        room,
      };
      webSocket.current.send(JSON.stringify(messageToSend));
    }
  };

  return { messages, isConnected, sendMessage };
};

export default useWebSocket;
