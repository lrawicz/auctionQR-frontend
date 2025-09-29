import React, { useState, useEffect, useRef } from 'react';
import './BiddingRoom.css';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { Buffer } from 'buffer';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import ModalShowContractInfo from '../modalShowContractInfo/ModalShowContractInfo';
import { Spin } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useContractActions } from '../../hooks/useContractActions';
import {Message,MessageContent} from "../../interfaces/interfaces"
import config from '../../settings';

import devnetIdl from '../../smartContract/devnet/idl.json';
import mainnetIdl from '../../smartContract/mainnet/idl.json';

function BiddingRoom() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;
  const { contractInfo, loading: contractLoading } = useSelector((state: RootState) => state.contract);
  const { fetchContract } = useContractActions();
  const [multiplier] = useState(1_000_000_000)//1_000_000_000


  const [messages, setMessages] = useState<MessageContent[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [newUrl, setNewUrl] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [room, _] = useState(`bidRoom_${new Date().toISOString().slice(0,10)}`);

  const webSocket = useRef<WebSocket | null>(null);

  const getProvider = () => {
    if (!wallet) return null;
    return new AnchorProvider(connection, window.solana, {
      preflightCommitment: 'processed',
    });
  };

  const getContractInfo = () => {
    fetchContract();
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const sendTx = async () => {
    if (!publicKey || !sendTransaction) {
      alert('Please connect your wallet.');
      return;
    }

    setLoading(true);
    try {
      const provider = getProvider();
      if (amount<0.01) {
        alert('Bid amount must be at least 0.01 SOL');
        return;
      }
      if (!provider) {
        alert('Provider is not available');
        return;
      }

      const idl = config.solanaNetwork === 'devnet' ? devnetIdl : mainnetIdl;
      const program = new Program(
        idl as Idl,
        provider
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
      const signature:anchor.web3.TransactionSignature = await program.methods
        .bid(new anchor.BN(amount * multiplier), newUrl)
        .accounts({
          auction: auctionPda,
          bidder: publicKey,
          systemProgram: SystemProgram.programId,
          oldBidder: oldBidderKey,
        })
        .rpc();

      console.log('Transaction sent successfully. Signature:', signature.toString());
      alert(`Bid placed! Signature: ${signature}`);
    } catch (error) { 
      console.error('Error placing bid:', error);
      // alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    webSocket.current = new WebSocket(config.webSocketUrl);

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
        const receivedMessage: Message = JSON.parse(event.data);
        if(receivedMessage.meta === 'new_bid_placed'){
          console.log('Received message:', receivedMessage);
          if (receivedMessage.content &&
            receivedMessage.content.amount && 
            receivedMessage.content.url && receivedMessage.content.address) {
              //@ts-ignore
              setMessages((prevMessages) => [
                {
                  address:receivedMessage.content?.address,
                  url:receivedMessage.content?.url,
                  amount:(receivedMessage.content?.amount||0) /multiplier,
                  timestamp:new Date(receivedMessage.content?.timestamp||0)
                },
                 ...prevMessages, 
              ]);
            }
        }
        if(receivedMessage.meta === 'pull_from_db'){
          console.log(receivedMessage.messages)
          setMessages((receivedMessage.messages||[]).map((item)=>{
            return {
              address:item.address,
              url:item.url,
              amount:(item.amount||0) /multiplier,
              timestamp:new Date(item.timestamp)
            }
          }))
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
/*
  const sendMessage_webSocket = () => {
    const amountNum = parseFloat(amount);
    if (webSocket.current && newUrl && !isNaN(amountNum) && amountNum > 0) {
      const message: Message = {
        message: {
          amount: amountNum,
          url: newUrl,
          address
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
*/

  return (
    <Spin spinning={loading} tip="Processing...">

      <div className="chat-container">
        <div className="input-area">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value||0))}
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
          <button className="botton-sendBid" onClick={sendTx}>Send</button>
          {/* <button className="botton-contractInfo" onClick={getContractInfo}>
            Get contract info
            </button> */}
        </div>
        <div className="min-bid-container">
          <p className="min-bid-info">Mini. bid is 0.01 SOL</p>
        </div>
        <div className="messages">
          {messages
            .sort((a, b) => (
              a.amount < b.amount ? 1 : -1))
            .map((msg) => (
              <div key={msg.timestamp.toString()} className="message">
                <span>SOL {msg.amount}</span>
                <p>{msg.url}</p>
                <p>{msg.address.substring(0,4)+'...'+msg.address.substring(msg.address.length-4)}</p>
                <p>{msg.timestamp.getHours().toString().padStart(2, '0') + ':' + msg.timestamp.getMinutes().toString().padStart(2, '0') + ':' + msg.timestamp.getSeconds().toString().padStart(2, '0')}</p>
              </div>
            ))}
        </div>
        <ModalShowContractInfo
          visible={isModalVisible}
          onClose={handleCloseModal}
          contractInfo={contractInfo}
          loading={contractLoading}
        />
      </div>
    </Spin>
  );
}

export default BiddingRoom;
