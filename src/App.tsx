import React from 'react';
import './App.css';
import BiddingRoom from './components/BiddingRoom/BiddingRoom';
import { QRCodeCanvas } from 'qrcode.react';
import ConnectToPhantom from './components/ConnectToPhantom/ConnectToPhantom';
import { SolanaConnect } from './components/SolanaConnect/SolanaConnect';
import { BidComponent } from './components/BidComponent/BidComponent';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

function App() {
  const url = 'https://www.google.com';

  return (
    <div className="App-container">
        <div className="sidebar">
          <QRCodeCanvas  value={url} size={256} />
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        </div>
        <div className="right-container">
          <SolanaConnect/>
          <BiddingRoom />
        </div>
      {/* <BidComponent/> */}
      {/* <ConnectToPhantom/> */}
    </div>
  );
}

export default App;