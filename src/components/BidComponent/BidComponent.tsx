import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { FC, useState } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import BN from 'bn.js';

// Importa el IDL que copiaste
import idl from './daily_auction.json';

// Tu Program ID del contrato
const programId = new PublicKey("DhyPPq6F3JNGjMHdxP6rhkfW2mH2PtiGbM8HhUyA88Hy");

export const BidComponent: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [amount, setAmount] = useState('');
    const [newContent, setNewContent] = useState('');

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
            const program = new Program(idl as any, programId, provider);

            // 3. Calcular la dirección del PDA de la subasta
            // Debe coincidir con las semillas ('seeds') que definiste en el struct Initialize.
            const [auctionPda, _] = PublicKey.findProgramAddressSync(
                [Buffer.from("auction")],
                program.programId
            );

            // 4. Obtener el estado actual de la subasta para encontrar al 'old_bidder'
            // La instrucción 'bid' requiere la cuenta del pujador anterior para reembolsarle.
            const auctionState = await program.account.auction.fetch(auctionPda);
            const oldBidderKey = auctionState.highestBidder as PublicKey;

            // 5. Construir y enviar la transacción
            console.log("Enviando la transacción de puja...");

            const signature = await program.methods
                .bid(new BN(amount), newContent) // Argumentos de la función del contrato
                .accounts({
                    // Las cuentas requeridas por el struct `Bid` en Rust
                    auction: auctionPda,
                    bidder: publicKey,
                    oldBidder: oldBidderKey, // El pujador anterior que obtuvimos
                    systemProgram: SystemProgram.programId,
                })
                .rpc(); // .rpc() envía la transacción y espera la confirmación

            console.log("Transacción enviada con éxito. Firma:", signature);
            alert(`¡Puja realizada! Firma: ${signature}`);

        } catch (error) {
            console.error("Error al realizar la puja:", error);
            alert(`Error: ${error.message}`);
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
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
            />
            <button onClick={handleBid} disabled={!publicKey}>
                Pujar
            </button>
        </div>
    );
};