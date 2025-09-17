import { useDispatch } from 'react-redux';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { fetchContractInfo } from '../store/contract/contractSlice';
import { AppDispatch } from '../store/store';

export const useContractActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { connection } = useConnection();
  const wallet = useWallet();

  const fetchContract = () => {
    if (!wallet.connected) {
        alert('Por favor, conecta tu billetera.');
        return;
    }
    dispatch(fetchContractInfo({ connection, wallet }));
  };

  return { fetchContract };
};
