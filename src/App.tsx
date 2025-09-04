
import React, { FC, useMemo } from 'react';
import './App.css';
import BiddingRoom from './components/BiddingRoom';
import { QRCodeCanvas } from 'qrcode.react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { SolanaTransactionButton } from './components/SolanaTransactionButton';

// Estilos por defecto para el wallet adapter
require('@solana/wallet-adapter-react-ui/styles.css');

const App: FC = () => {
  const url = 'https://www.google.com';

  // --- Configuración de Solana ---
  // Puedes cambiar la red a 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);
  // --- Fin de la configuración de Solana ---

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="App-container">
            <div className="sidebar">
              <div className="wallet-controls">
                <WalletMultiButton />
              </div>
              <QRCodeCanvas value={url} size={256} />
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
              {/* Aquí está el nuevo botón de transacción */}
              <SolanaTransactionButton />
            </div>
            <BiddingRoom />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
