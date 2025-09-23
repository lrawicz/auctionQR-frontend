import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import BiddingRoom from './components/BiddingRoom/BiddingRoom';
import { QRCodeCanvas } from 'qrcode.react';
import { SolanaConnect } from './components/SolanaConnect/SolanaConnect';
import { Buffer } from 'buffer';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { ConfigProvider, theme } from 'antd';
import config from './settings';

require('@solana/wallet-adapter-react-ui/styles.css');

window.Buffer = Buffer;

function App() {
  const [url, setUrl] = useState('');
  const network = (process.env.REACT_APP_SOLANA_CLUSTER as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;
  const endpoint = process.env.REACT_APP_SOLANA_RPC_HOST!;
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);
  const [defaultUrl] = useState("https://" + config.apiUrl?.replace("http://","").replace("https://",""));  
  useEffect(() => {
    const fetchQrContent = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/latest-qr-content`);
        if (response.ok) {
          const data = await response.json();
          setUrl(data.url);
        } else {
          console.error('Failed to fetch QR content, falling back to default.');
          setUrl(defaultUrl); // Fallback URL
        }
      }
      catch (error) {
        console.error('Error fetching QR content, falling back to default:', error);
        setUrl(defaultUrl); // Fallback URL
      }
    };

    fetchQrContent();
  }, []);

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="App-container">
              <div className="sidebar">
                                <div className="qr-code-container">
                  <QRCodeCanvas value="https://qrsol.fun/qr-redirect" size={256} bgColor="#FFFFFF" fgColor="#000000" />
                </div>
                <a href={`http://${url}`} target="_blank" rel="noopener noreferrer">
                  {url}
                </a>
              </div>
              <div className="right-container">
                <SolanaConnect />
                <BiddingRoom />
              </div>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ConfigProvider>
  );
};

export default App;
