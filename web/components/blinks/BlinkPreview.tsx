import React from 'react';
import { Blink, Action, useAction, ActionAdapter } from '@dialectlabs/blinks';
import '@dialectlabs/blinks/index.css';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

interface BlinkPreviewProps {
  clickcrateId: string;
}

export const BlinkPreview: React.FC<BlinkPreviewProps> = ({ clickcrateId }) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const actionApiUrl = `https://api.clickcrate.xyz/blink/${clickcrateId}`;

  const adapter: ActionAdapter = {
    connect: async () => {
      if (!wallet.connected) {
        await wallet.connect();
      }
      return wallet.publicKey?.toBase58() || null;
    },
    signTransaction: async (tx: string) => {
      if (!wallet.signTransaction) {
        return { error: 'Wallet does not support signing' };
      }
      try {
        const signedTx = await wallet.signTransaction(
          Transaction.from(Buffer.from(tx, 'base64'))
        );
        return {
          signature: signedTx.signatures[0].signature?.toString('base64') || '',
        };
      } catch (error) {
        return { error: 'Failed to sign transaction' };
      }
    },
    confirmTransaction: async (signature: string) => {
      await connection.confirmTransaction(signature);
    },
  };

  const { action } = useAction({ url: actionApiUrl, adapter });

  if (!action) {
    return (
      <div className="flex flex-col items-center justify-center w-[100%] p-6">
        <span className="loading loading-spinner loading-md"></span>
        <p className="font-body text-sm py-4 font-normal">Loading preview...</p>
      </div>
    );
  }

  return (
    <div className="blink-preview">
      <Blink
        action={action}
        websiteText={new URL(actionApiUrl).hostname}
        stylePreset="x-dark"
      />
    </div>
  );
};
