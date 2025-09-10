import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { Buffer } from 'buffer';
import * as anchor from '@coral-xyz/anchor';
import { FC, useState } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';

import idl from '../../smartContract/idl.json';
import type { DailyAuction } from "../../smartContract/daily_auction";

// Tu Program ID del contrato
const programId = new PublicKey("DhyPPq6F3JNGjMHdxP6rhkfW2mH2PtiGbM8HhUyA88Hy");
export const BidComponent: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [amount, setAmount] = useState('');
    const [newUrl, setNewUrl] = useState('');

    const handleBid = async () => {
        if (!publicKey || !sendTransaction) {
            alert("Por favor, conecta tu billetera.");
            return;
        }

        try {
            // 1. Configurar el Proveedor (Provider) de Anchor
            // El proveedor combina la conexión a la red y la billetera para firmar transacciones.
            const provider = new AnchorProvider(connection, window.solana, {
                preflightCommitment: "processed",
            });

            // 2. Crear el objeto del Programa
            // Esto te da una API fuertemente tipada para interactuar con tu contrato.
            //const program = anchor.workspace.DailyAuction as Program<DailyAuction>;
            const program = new Program(idl, provider) as Program<DailyAuction>;

            // 3. Calcular la dirección del PDA de la subasta
            // Debe coincidir con las semillas ('seeds') que definiste en el struct Initialize.
            const [auctionPda, _] = PublicKey.findProgramAddressSync(
                [Buffer.from("auction")],
                program.programId
            );

            // 4. Obtener el estado actual de la subasta para encontrar al 'old_bidder'
            // La instrucción 'bid' requiere la cuenta del pujador anterior para reembolsarle.
            const auctionState = await program.account.auction.fetch(auctionPda)
            const oldBidderKey = auctionState.highestBidder as PublicKey;
            console.log(auctionState)
            // 5. Construir y enviar la transacción
            console.log("Enviando la transacción de puja...");

            const signature = await program.methods
                .bid(new anchor.BN(amount), newUrl)
                .accounts(
                    //@ts-ignore
                    // [
                    //     { auction: auctionPda },
                    //     { bidder: publicKey },
                    //     { oldBidder: oldBidderKey, writable: true, signer: false },
                    //     { systemProgram: SystemProgram.programId },
                    // ]
                    // [
                    //     { 
                    //         name: "auction", 
                    //         writable: true, 
                    //         pda: { seeds: [{ kind: "const", value: [97, 117, 99, 116, 105, 111, 110] }] } } ,
                    //     , { name: "bidder", writable: true, signer: true, bidder: publicKey } 
                    //     , { name: "oldBidder", writable: true, oldBidder: oldBidderKey } 
                    {
                        //auction: auctionPda,
                        bidder: publicKey,
                        oldBidder: oldBidderKey,
                        //systemProgram: SystemProgram.programId,
                    }
                    // ]
                )
                .rpc(); // .rpc() envía la transacción y espera la confirmación

            console.log("Transacción enviada con éxito. Firma:", signature);
            alert(`¡Puja realizada! Firma: ${signature}`);

        } catch (error) {
            console.error("Error al realizar la puja:", error);
            // alert(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <h2>Realizar una Puja</h2>
            <input
                type="number"
                placeholder="Monto en Lamports"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <input
                type="text"
                placeholder="Nuevo contenido (máx 250 chars)"
                maxLength={250}
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
            />
            <button onClick={handleBid} disabled={!publicKey}>
                Pujar
            </button>
        </div>
    );
};