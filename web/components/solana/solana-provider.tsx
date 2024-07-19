'use client';

import dynamic from 'next/dynamic';
import { AnchorProvider } from '@coral-xyz/anchor';
import { WalletError } from '@solana/wallet-adapter-base';
import {
  AnchorWallet,
  useConnection,
  useWallet,
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { ParticleAdapter } from '@solana/wallet-adapter-wallets';
// import { ParticleAdapter } from '@particle-network/wallet-adapter-ext';
import { TipLinkWalletAdapter } from '@tiplink/wallet-adapter';
import {
  WalletDisconnectButton,
  WalletMultiButton,
  TipLinkWalletAutoConnectV2,
} from '@tiplink/wallet-adapter-react-ui';

import { ReactNode, useCallback, useMemo } from 'react';
import { useCluster } from '../cluster/cluster-data-access';
import { useSearchParams } from 'next/navigation';

require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletButton = dynamic(
  async () =>
    (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster();
  const endpoint = useMemo(() => cluster.endpoint, [cluster]);
  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  const wallets = useMemo(
    () => [
      /**
       * Use TipLinkWalletAdapter here
       * Include the name of the dApp in the constructor
       * Pass the client id that the TipLink team provides
       * Choose from "dark", "light", "system" for the theme
       */
      // new ParticleAdapter({
      //   config: {
      //     projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
      //     clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY || '',
      //     appId: process.env.NEXT_PUBLIC_APP_ID || '',
      //   },
      // }),
      new TipLinkWalletAdapter({
        title: 'ClickCrate Dashboard',
        clientId: 'f4856b33-38fd-4902-8094-4174a85edbbd',
        theme: 'dark', // pick between "dark"/"light"/"system"
      }),
    ],
    []
  );

  const searchParams = useSearchParams();

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
        <WalletModalProvider>
          <TipLinkWalletAutoConnectV2 isReady query={searchParams}>
            {children}
          </TipLinkWalletAutoConnectV2>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function useAnchorProvider() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return new AnchorProvider(connection, wallet as AnchorWallet, {
    commitment: 'confirmed',
  });
}
