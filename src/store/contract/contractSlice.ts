import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { Buffer } from 'buffer';
import { PublicKey } from '@solana/web3.js';
import devnetIdl from '../../smartContract/devnet/idl.json';
import mainnetIdl from '../../smartContract/mainnet/idl.json'; // Import mainnet IDL
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor'; // Import anchor for BN
import config from '../../settings'; // Import config

// Nueva interfaz para la cuenta de Auction
export interface AuctionAccount {
  authority: PublicKey;
  new_content: string;
  old_content: string;
  end_timestamp: anchor.BN; // i64 en Solana se mapea a BN en Anchor
  highest_bid: anchor.BN;   // u64 en Solana se mapea a BN en Anchor
  highest_bidder: PublicKey;
  is_active: boolean;
  bump: number; // u8 en Solana se mapea a number
}

export interface ContractState {
  contractInfo: AuctionAccount | null; // Ahora usa AuctionAccount
  loading: boolean;
  error: string | null;
}

const initialState: ContractState = {
  contractInfo: null,
  loading: false,
  error: null,
};

export const fetchContractInfo = createAsyncThunk(
  'contract/fetchContractInfo',
  async ({ connection, wallet }: { connection: Connection; wallet: WalletContextState }) => {
    const getProvider = () => {
      if (!wallet || !wallet.wallet) return null;
      return new AnchorProvider(connection, wallet.wallet.adapter as any, {
        preflightCommitment: 'processed',
      });
    };

    const provider = getProvider();
    if (!provider) {
      throw new Error('Provider is not available');
    }
    const idl = config.solanaNetwork === 'devnet' ? devnetIdl : mainnetIdl; // Conditionally load IDL
    const program = new Program(
      idl as Idl,
      provider
    ) as Program<Idl>;
    const [auctionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('auction')],
      program.programId
    );
    //@ts-ignore
    const auctionState = await program.account.auction.fetch(auctionPda);
    return auctionState;
  }
);

export const contractSlice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    setContractInfo: (state, action: PayloadAction<any>) => {
      state.contractInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContractInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContractInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.contractInfo = action.payload;
      })
      .addCase(fetchContractInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch contract info';
      });
  },
});

export const { setContractInfo } = contractSlice.actions;

export default contractSlice.reducer;
