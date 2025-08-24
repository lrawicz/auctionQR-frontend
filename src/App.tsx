import React, { useState, useEffect, useRef } from 'react';
import './App.css';


interface MessageContent {
  amount:number, 
  text:string,
  id:string
}
interface Message {
  message?:MessageContent,
  meta:string, 
  room:string,
}

function App() {

  const [messages, setMessages] = useState<MessageContent[]>([]);
  const [amount, setAmount] = useState('');
  const [text, setText] = useState('');
  const [room,setRoom] = useState('bidRoom');

  const webSocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3000';
    webSocket.current = new WebSocket(wsUrl);

    webSocket.current.onopen = () => {
      console.log('WebSocket connected');
      if (webSocket.current){
        const message: Message = {
          meta:"join",
          room
        }
        webSocket.current.send(JSON.stringify(message));
      }
    };

    webSocket.current.onmessage = (event) => {
      try {
        // The public echo server will send back the same message we sent.
        // In a real application, the server would broadcast messages from other users.
        const receivedMessage = JSON.parse(event.data);
        if (receivedMessage.amount && receivedMessage.text && receivedMessage.id) {
            console.log('Received message:', receivedMessage);
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        }
      } catch (error) {
        // The server might send non-JSON messages on connect, we can ignore them.
        console.log('Received non-JSON message:', event.data);
      }
    };

    webSocket.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (webSocket.current) {
        webSocket.current.close();
      }
    };
  }, []);

  const sendMessage = () => {
    const amountNum = parseFloat(amount);
    if (webSocket.current && text && !isNaN(amountNum) && amountNum > 0) {
      const message: Message = {
        message: {
          amount:amountNum,
          text,
          id: new Date().toISOString(),
        },
        meta:"message",
        room
      };
      webSocket.current.send(JSON.stringify(message));
      // Since we are using an echo server, the message will be received and added to the list.
      // In a real app, you might add the message to the list optimistically.
      setAmount('');
      setText('');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Group Bidding Chat</h1>
      </header>
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg) => (
            <div key={msg.id} className="message">
              <span>${msg.amount.toFixed(2)}</span>
              <p>{msg?.text}</p>
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="amount-input"
          />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message"
            className="text-input"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;