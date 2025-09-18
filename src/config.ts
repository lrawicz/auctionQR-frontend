import dotenv from 'dotenv';

dotenv.config();

const settings = {
    apiUrl: process.env.REACT_APP_API_URL,
    solanaEndpoint: process.env.REACT_APP_SOLANA_ENDPOINT || 'http://127.0.0.1:8899',
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
    webSocketUrl: process.env.REACT_APP_WEBSOCKET_URL || 'ws://127.0.0.1:8900',
};

export default settings;
