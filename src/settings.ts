import anchor from '@project-serum/anchor';

type Settings = {
    apiUrl?: string;
    webSocketUrl: string;
    solanaNetwork: anchor.web3.Cluster;
    cutoffDate: string;
};
const config:Settings = {
    apiUrl: process.env.REACT_APP_API_URL,
    webSocketUrl: process.env.REACT_APP_WEBSOCKET_URL || 'ws://127.0.0.1:8900',
    solanaNetwork: process.env.REACT_APP_SOLANA_NETWORK as anchor.web3.Cluster || 'devnet',
    cutoffDate: '2025-10-02T16:00:00.000Z',
};

export default config;
