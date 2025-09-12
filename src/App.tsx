import React, { useMemo } from 'react';
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

require('@solana/wallet-adapter-react-ui/styles.css');

window.Buffer = Buffer;

function App() {
  const url = 'https://www.google.com';
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="App-container">
              <div className="sidebar">
                                <div className="qr-code-container">
                  <QRCodeCanvas value={url} size={256} bgColor="#FFFFFF" fgColor="#000000" />
                </div>
                <a href={url} target="_blank" rel="noopener noreferrer">
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
}

export default App;
