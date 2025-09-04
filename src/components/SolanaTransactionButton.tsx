
import React from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { serialize } from 'borsh';
import './SolanaTransactionButton.css';

// --- Argumentos para la transacción ---
// Define un esquema para la serialización con Borsh. 
// Esto DEBE coincidir con la estructura que espera tu contrato.
class Payload {
    instruction = 0; // El identificador de la función que quieres llamar
    url = '';
    amount = 0;

    constructor(fields: any) {
        Object.assign(this, fields);
    }

    static schema:any = new Map([
        [Payload, {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['url', 'string'],
                ['amount', 'u64'],
            ],
        }],
    ]);
}

export const SolanaTransactionButton = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const handleTransactionClick = async () => {
        if (!publicKey) {
            alert('Por favor, conecta tu wallet primero.');
            return;
        }

        try {
            // --- 1. Define los datos y cuentas --- 
            const programId = new PublicKey('REEMPLAZA_CON_EL_PROGRAM_ID_DE_TU_CONTRATO');
            
            // La dirección extra que necesita tu contrato
            const extraAccount = new PublicKey('REEMPLAZA_CON_LA_OTRA_DIRECCION_DE_SOLANA');
            
            // Los argumentos que quieres pasar
            const url = "https://example.com/my-nft";
            const solAmount = 0.1; // 0.1 SOL
            const lamportsAmount = solAmount * LAMPORTS_PER_SOL;

            // --- 2. Serializa los datos de la instrucción ---
            const payload = new Payload({ url: url, amount: lamportsAmount });
            const instructionData = serialize(Payload.schema, payload);

            // --- 3. Define las cuentas para la instrucción del programa ---
            const keys = [
                { pubkey: publicKey, isSigner: true, isWritable: true },
                { pubkey: extraAccount, isSigner: false, isWritable: true },
                // Agrega aquí otras cuentas que tu instrucción necesite, como SystemProgram.programId
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            ];

            // --- 4. Crea las instrucciones --- 

            // Instrucción para transferir SOL
            const transferInstruction = SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: extraAccount, // El destinatario de los fondos
                lamports: lamportsAmount,
            });

            // Instrucción para llamar a tu programa
            const programInstruction = new TransactionInstruction({
                keys,
                programId,
                data: instructionData,
            });

            // --- 5. Crea y envía la transacción ---
            const transaction = new Transaction()
                .add(transferInstruction) // Primero la transferencia
                .add(programInstruction); // Luego la lógica de tu programa

            const signature = await sendTransaction(transaction, connection);
            console.log('Transacción enviada con firma:', signature);

            await connection.confirmTransaction(signature, 'processed');
            console.log('Transacción confirmada!');
            alert('¡Transacción exitosa!');

        } catch (error) {
            console.error('Error en la transacción:', error);
            const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido';
            alert(`Error al enviar la transacción: ${errorMessage}`);
        }
    };

    return (
        <button className="solana-transaction-button" onClick={handleTransactionClick} disabled={!publicKey}>
            Llamar Contrato (con Args)
        </button>
    );
};
