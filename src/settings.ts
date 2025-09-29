import anchor from '@project-serum/anchor';

type Settings = {
    apiUrl?: string;
    webSocketUrl: string;
    solanaNetwork: anchor.web3.Cluster;
};
const config = {
    apiUrl: process.env.REACT_APP_API_URL,
    webSocketUrl: process.env.REACT_APP_WEBSOCKET_URL || 'ws://127.0.0.1:8900',
    solanaNetwork: process.env.REACT_APP_SOLANA_NETWORK || 'devnet',
};

export default config;
