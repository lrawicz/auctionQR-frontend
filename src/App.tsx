import React from 'react';
import './App.css';
import BiddingRoom from './components/BiddingRoom';
import { QRCodeCanvas } from 'qrcode.react';

function App() {
  const url = 'https://www.google.com';

  return (
    <div className="App-container">
      <div className="sidebar">
        <QRCodeCanvas value={url} size={256} />
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      </div>
      <BiddingRoom />
    </div>
  );
}

export default App;