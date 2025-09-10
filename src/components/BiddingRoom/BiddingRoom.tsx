import React, { FC,useState, useEffect, useRef } from 'react';
import './BiddingRoom.css';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { Buffer } from 'buffer';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';

import idl from '../../smartContract/idl.json';
import type { DailyAuction } from "../../smartContract/daily_auction";

interface MessageContent {
  amount:number, 
  url:string,
  id:string
}
interface Message {
  message?:MessageContent,
  meta:string, 
  room:string,
}

function BiddingRoom() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [messages, setMessages] = useState<MessageContent[]>([]);
  const [amount, setAmount] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const [room,_] = useState('bidRoom');

  const webSocket = useRef<WebSocket | null>(null);
  
  const sendTx = async () => {
      if (!publicKey || !sendTransaction) {
          alert("Por favor, conecta tu billetera.");
          return;
      }

      try {
          // 1. Configurar el Proveedor (Provider) de Anchor
          // El proveedor combina la conexión a la red y la billetera para firmar transacciones.
          const provider = new AnchorProvider(connection, window.solana, {
              preflightCommitment: "processed",
          });

          // 2. Crear el objeto del Programa
          // Esto te da una API fuertemente tipada para interactuar con tu contrato.
          //const program = anchor.workspace.DailyAuction as Program<DailyAuction>;
          const program = new Program(idl, provider) as Program<DailyAuction>;

          // 3. Calcular la dirección del PDA de la subasta
          // Debe coincidir con las semillas ('seeds') que definiste en el struct Initialize.
          const [auctionPda, _] = PublicKey.findProgramAddressSync(
              [Buffer.from("auction")],
              program.programId
          );

          // 4. Obtener el estado actual de la subasta para encontrar al 'old_bidder'
          // La instrucción 'bid' requiere la cuenta del pujador anterior para reembolsarle.
          const auctionState = await program.account.auction.fetch(auctionPda)
          const oldBidderKey = auctionState.highestBidder as PublicKey;
          console.log(auctionState)
          // 5. Construir y enviar la transacción
          console.log("Enviando la transacción de puja...");

          const signature = await program.methods
              .bid(new anchor.BN(amount), newUrl)
              .accounts(
                  //@ts-ignore
                  // [
                  //     { auction: auctionPda },
                  //     { bidder: publicKey },
                  //     { oldBidder: oldBidderKey, writable: true, signer: false },
                  //     { systemProgram: SystemProgram.programId },
                  // ]
                  // [
                  //     { 
                  //         name: "auction", 
                  //         writable: true, 
                  //         pda: { seeds: [{ kind: "const", value: [97, 117, 99, 116, 105, 111, 110] }] } } ,
                  //     , { name: "bidder", writable: true, signer: true, bidder: publicKey } 
                  //     , { name: "oldBidder", writable: true, oldBidder: oldBidderKey } 
                  {
                      //auction: auctionPda,
                      bidder: publicKey,
                      oldBidder: oldBidderKey,
                      //systemProgram: SystemProgram.programId,
                  }
                  // ]
              )
              .rpc(); // .rpc() envía la transacción y espera la confirmación

          console.log("Transacción enviada con éxito. Firma:", signature);
          alert(`¡Puja realizada! Firma: ${signature}`);

      } catch (error) {
          console.error("Error al realizar la puja:", error);
          // alert(`Error: ${error.message}`);
      }
  };
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
        const receivedMessage:MessageContent = JSON.parse(event.data);
        if (receivedMessage.amount && receivedMessage.url && receivedMessage.id) {
            console.log('Received message:', receivedMessage);
            setMessages((prevMessages) => [...prevMessages,receivedMessage]);
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

  const sendMessage_webSocket = () => {
    const amountNum = parseFloat(amount);
    if (webSocket.current && newUrl && !isNaN(amountNum) && amountNum > 0) {
      const message: Message = {
        message: {
          amount:amountNum,
          url:newUrl,
          id: new Date().toISOString(),
        },
        meta:"message",
        room
      };
      webSocket.current.send(JSON.stringify(message));
      // Since we are using an echo server, the message will be received and added to the list.
      // In a real app, you might add the message to the list optimistically.
      setAmount('');
      setNewUrl('');
    }
  };

  return (
      <div className="chat-container">
        
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
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Message"
            className="text-input"
          />
          <button onClick={sendTx}>Send</button>
        </div>
        <div className="messages">
          {messages
          .sort((a,b)=>a.id<b.id?1:-1)
          .map((msg) => (
            <div key={msg.id} className="message">
              <span>${msg.amount.toFixed(2)}</span>
              <p>{msg?.url}</p>
            </div>
          ))}
        </div>
    </div>
  );
}

export default BiddingRoom;