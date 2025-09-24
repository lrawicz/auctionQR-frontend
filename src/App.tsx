import  { useMemo } from 'react';
import './App.css';
import BiddingRoom from './components/BiddingRoom/BiddingRoom';
import { SolanaConnect } from './components/SolanaConnect/SolanaConnect';
import { Buffer } from 'buffer';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { ConfigProvider, theme } from 'antd';
import QrColumn from './components/QrColumn/QrColumn';

require('@solana/wallet-adapter-react-ui/styles.css');

window.Buffer = Buffer;

function App() {

  const network = (process.env.REACT_APP_SOLANA_CLUSTER as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;
  const endpoint = process.env.REACT_APP_SOLANA_RPC_HOST!;
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);


  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="App-container">
              <QrColumn></QrColumn>
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
