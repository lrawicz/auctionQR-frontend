import React, { FC } from 'react';
import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';
import './SolanaConnect.css';

export const SolanaConnect: FC = () => {

    return (
        <div className="WalletConnection">
            <WalletMultiButton />
            <WalletDisconnectButton />
        </div>
    );
};