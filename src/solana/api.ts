import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { WalletContextState } from '@solana/wallet-adapter-react';
import config from '../settings';
import devnetIdl from '../smartContract/devnet/idl.json';
import mainnetIdl from '../smartContract/mainnet/idl.json';

// Define the interface for the auction account state to avoid using any.
export interface AuctionState {
  highestBidder: anchor.web3.PublicKey;
  // Add other fields from the auction account state as needed
}

const getProvider = (connection: any, wallet: WalletContextState) => {
  if (!wallet) return null;
  return new AnchorProvider(connection, window.solana, {
    preflightCommitment: 'processed',
  });
};

const getProgram = (provider: AnchorProvider) => {
  const idl = config.solanaNetwork === 'devnet' ? devnetIdl : mainnetIdl;
  return new Program(idl as Idl, provider);
};

export const fetchAuctionState = async (connection: any, wallet: WalletContextState): Promise<AuctionState> => {
  const provider = getProvider(connection, wallet);
  if (!provider) {
    throw new Error('Provider is not available');
  }
  const program = getProgram(provider);

  const [auctionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('auction')],
    program.programId
  );
  //@ts-ignore
  const auctionState = await program.account.auction.fetch(auctionPda) as AuctionState;
  return auctionState;
};

export const placeBid = async (
  connection: any,
  wallet: WalletContextState,
  amount: string,
  newUrl: string
) => {
  const provider = getProvider(connection, wallet);
  if (!provider || !wallet.publicKey || !wallet.sendTransaction) {
    throw new Error('Wallet is not connected or provider is not available');
  }
  const program = getProgram(provider);

  const [auctionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('auction')],
    program.programId
  );

  //@ts-ignore
  const auctionState = await program.account.auction.fetch(auctionPda) as AuctionState;
  let oldBidderKey = auctionState.highestBidder;
  if (oldBidderKey.equals(SystemProgram.programId)) {
    oldBidderKey = wallet.publicKey;
  }

  const signature = await program.methods
    .bid(new anchor.BN(amount), newUrl)
    .accounts({
      auction: auctionPda,
      bidder: wallet.publicKey,
      systemProgram: SystemProgram.programId,
      oldBidder: oldBidderKey,
    })
    .rpc();

  return signature;
};
