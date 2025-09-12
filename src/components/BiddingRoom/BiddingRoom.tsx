import React, { FC, useState, useEffect, useRef } from 'react';
import './BiddingRoom.css';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { Buffer } from 'buffer';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import ModalShowContractInfo from '../modalShowContractInfo/ModalShowContractInfo';
import { Spin } from 'antd';

import idl from '../../smartContract/idl.json';

interface MessageContent {
  amount: number;
  url: string;
  id: string;
}
interface Message {
  message?: MessageContent;
  meta: string;
  room: string;
}

function BiddingRoom() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, wallet } = useWallet();
  const [messages, setMessages] = useState<MessageContent[]>([]);
  const [amount, setAmount] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [contractInfo, setContractInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [room, _] = useState('bidRoom');

  const webSocket = useRef<WebSocket | null>(null);

  const getProvider = () => {
    if (!wallet) return null;
    return new AnchorProvider(connection, window.solana, {
      preflightCommitment: 'processed',
    });
  };

  const getContractInfo = async () => {
    setLoading(true);
    try {
      const provider = getProvider();
      if (!provider) {
        alert('Provider is not available');
        return;
      }
      const program = new Program(
        idl as Idl,
        provider
        // new PublicKey(idl.address),
      ) as Program<Idl>;
      const [auctionPda, _] = PublicKey.findProgramAddressSync(
        [Buffer.from('auction')],
        program.programId
      );
      //@ts-ignore
      const auctionState = await program.account.auction.fetch(auctionPda);
      setContractInfo(auctionState);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error getting contract info:', error);
      alert('Error getting contract info.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const sendTx = async () => {
    if (!publicKey || !sendTransaction) {
      alert('Por favor, conecta tu billetera.');
      return;
    }

    setLoading(true);
    try {
      const provider = getProvider();
      if (!provider) {
        alert('Provider is not available');
        return;
      }

      const program = new Program(
        idl as Idl,
        provider
        // new PublicKey(idl.address),
      ) as Program<Idl>;

      const [auctionPda, _] = PublicKey.findProgramAddressSync(
        [Buffer.from('auction')],
        program.programId
      );

      //@ts-ignore
      const auctionState = await program.account.auction.fetch(auctionPda);
      let oldBidderKey = auctionState.highestBidder as anchor.web3.PublicKey;
      if (oldBidderKey.equals(SystemProgram.programId)) {
        oldBidderKey = publicKey;
      }
      console.log(auctionState);
      console.log('Enviando la transacción de puja...');
      const signature = await program.methods
        .bid(new anchor.BN(amount), newUrl)
        .accounts({
          auction: auctionPda,
          bidder: publicKey,
          systemProgram: SystemProgram.programId,
          oldBidder: oldBidderKey,
        })
        .rpc();

      console.log('Transacción enviada con éxito. Firma:', signature);
      alert(`¡Puja realizada! Firma: ${signature}`);
    } catch (error) {
      console.error('Error al realizar la puja:', error);
      // alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3000';
    webSocket.current = new WebSocket(wsUrl);

    webSocket.current.onopen = () => {
      console.log('WebSocket connected');
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
        if (receivedMessage.amount && receivedMessage.url && receivedMessage.id) {
          console.log('Received message:', receivedMessage);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        }
      } catch (error) {
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
          amount: amountNum,
          url: newUrl,
          id: new Date().toISOString(),
        },
        meta: 'message',
        room,
      };
      webSocket.current.send(JSON.stringify(message));
      setAmount('');
      setNewUrl('');
    }
  };

  return (
    <Spin spinning={loading} tip="Processing...">
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
            placeholder="new url"
            className="text-input"
          />
          <button onClick={sendTx}>Send</button>
          <button className="botton-contractInfo" onClick={getContractInfo}>
            Get contract info
          </button>
        </div>
        <div className="messages">
          {messages
            .sort((a, b) => (a.id < b.id ? 1 : -1))
            .map((msg) => (
              <div key={msg.id} className="message">
                <span>${msg.amount.toFixed(2)}</span>
                <p>{msg?.url}</p>
              </div>
            ))}
        </div>
        <ModalShowContractInfo
          visible={isModalVisible}
          onClose={handleCloseModal}
          contractInfo={contractInfo}
        />
      </div>
    </Spin>
  );
}

export default BiddingRoom;
