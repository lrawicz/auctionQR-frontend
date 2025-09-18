import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useContractActions } from './useContractActions';
import { placeBid as placeBidApi } from '../solana/api';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';


export const useSolanaBidding = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { fetchContract } = useContractActions();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const placeBid = async (amount: string, newUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const signature = await placeBidApi(connection, wallet, amount, newUrl);
      console.log('Transaction successful with signature:', signature);
      return signature;
    } catch (err) {
      console.error('Error placing bid:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  const getContractInfo = () => {
    fetchContract();
  };

  return { placeBid, getContractInfo, loading, error };
};
