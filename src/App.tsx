import { useMemo, useState, useEffect } from 'react';
import './App.css';
import BiddingRoom from './components/BiddingRoom/BiddingRoom';
import { SolanaConnect } from './components/SolanaConnect/SolanaConnect';
import { Buffer } from 'buffer';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { ConfigProvider, theme } from 'antd';
import QrColumn from './components/QrColumn/QrColumn';
import ComingSoon from './components/ComingSoon/ComingSoon';
import config from './settings';

require('@solana/wallet-adapter-react-ui/styles.css');

window.Buffer = Buffer;

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cutoffDate = new Date(config.cutoffDate);
  const showComingSoon = currentTime < cutoffDate;

  const network = config.solanaNetwork;
  const endpoint = process.env.REACT_APP_SOLANA_RPC_HOST!;
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  if (showComingSoon) {
    return <ComingSoon />;
  }

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
