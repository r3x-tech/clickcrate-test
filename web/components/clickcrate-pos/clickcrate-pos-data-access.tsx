'use client';

import {
  ClickcrateTestIDL,
  getClickcrateTestProgramId,
} from '@clickcrate-test/anchor';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey, SystemProgram } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import {
  MakePurchaseArgs,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPlacementTypeFromString,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getProductCategoryFromString,
} from '../../types';
import { useMemo } from 'react';
// import * as web3 from '@solana/web3.js';
import { TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { publicKey } from '@coral-xyz/anchor/dist/cjs/utils';
import { encode } from 'bs58';

export function useClickcratePosProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  // const programId = useMemo(
  //   () => getClickcrateTestProgramId(cluster.network as Cluster),
  //   [cluster]
  // );
  const programId = new PublicKey(
    'ENmHn3TEBqzfvwi19xc9cYsTmKseBSbxhqqXETiEKgJ9'
  );
  const { signTransaction } = useWallet();

  const program = new Program(ClickcrateTestIDL, programId, provider);

  const accounts = useQuery({
    queryKey: ['clickcrate-test', 'all', { cluster }],
    queryFn: () => program.account.clickCrateState.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const registerClickCrate = useMutation({
    mutationKey: ['clickcrate-test', 'registerClickCrate', { cluster }],
    mutationFn: async (
      args: [PublicKey, PublicKey, string, string, PublicKey]
    ) => {
      const [
        id,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        owner,
        eligiblePlacementType,
        eligibleProductCategory,
        manager,
      ] = args;
      const [clickcrateAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from('clickcrate'), id.toBuffer()],
        programId
      );

      // const convertedPlacementType = getPlacementTypeFromString(
      //   eligiblePlacementType
      // );
      // const convertedProductCategory = getProductCategoryFromString(
      //   eligibleProductCategory
      // );

      console.log('registerClickCrate input:', {
        id: id.toString(),
        eligiblePlacementType,
        eligibleProductCategory,
        manager: manager.toString(),
      });
      // const connection = new web3.Connection(
      //   process.env.NEXT_PUBLIC_RPC_URL!,
      //   'confirmed'
      // );

      const payer = (program.provider as AnchorProvider).wallet;

      const idOne = new PublicKey(
        '9RvppNEME3e1XxA6g7cQHbvrDivjaX5xwjSnqkxb8Rb2'
      );
      const managerOne = new PublicKey(
        'Engvm8giPGZvLV115DkzhVGkWKR5j11ZTrggo5EUQBau'
      );

      const ix = await program.methods
        .registerClickcrate(
          idOne,
          { relatedpurchase: {} },
          { clothing: {} },
          managerOne
        )
        .accounts({
          clickcrate: clickcrateAddress,
          owner: payer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // if (!connection) throw new Error('Connection missing');

      // if (!manager || !ix || !signTransaction)
      //   throw new Error('Tx info missing');
      // const { blockhash } = await connection!.getLatestBlockhash();
      // console.log('bh: ', blockhash);

      // const txMsg = new TransactionMessage({
      //   payerKey: manager,
      //   recentBlockhash: blockhash,
      //   instructions: [ix],
      // }).compileToLegacyMessage();

      // const tx = new VersionedTransaction(txMsg);
      // if (!tx) throw new Error('No tx');
      // console.log(
      //   'registerClickcrate tx: ',
      //   Buffer.from(tx.serialize()).toString('base64')
      // );

      // const signedTx = await signTransaction(tx);
      // const encodedSignedTx = encode(signedTx.serialize());

      // connection.sendRawTransaction(signedTx.serialize());

      // if (!connection.simulateTransaction(tx)) {
      //   throw new Error('Error simulating transaction');
      // }
      // console.log('ix:', ix);

      return ix;
    },
    onSuccess: () => {
      // transactionToast(signature);
      transactionToast('success');
      return accounts.refetch();
    },
    onError: (error) => {
      console.error('Failed to register ClickCrate:', error);
      toast.error('Failed to register ClickCrate');
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    registerClickCrate,
  };
}

export function useClickcratePosProgramAccount({
  account,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useClickcratePosProgram();

  const accountQuery = useQuery({
    queryKey: ['clickcrate-test', 'fetch', { cluster, account }],
    queryFn: () => program.account.clickCrateState.fetch(account),
  });

  const activateClickCrate = useMutation({
    mutationKey: [
      'clickcrate-test',
      'activateClickCrate',
      { cluster, account },
    ],
    mutationFn: async () => {
      return program.methods
        .activateClickcrate()
        .accounts({
          clickcrate: account,
          owner: program.provider.publicKey,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to activate ClickCrate'),
  });

  const deactivateClickCrate = useMutation({
    mutationKey: [
      'clickcrate-test',
      'deactivateClickCrate',
      { cluster, account },
    ],
    mutationFn: async () => {
      return program.methods
        .deactivateClickcrate()
        .accounts({
          clickcrate: account,
          owner: program.provider.publicKey,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to deactivate ClickCrate'),
  });

  const makePurchase = useMutation({
    mutationKey: ['clickcrate-test', 'makePurchase', { cluster, account }],
    mutationFn: async (args: MakePurchaseArgs) => {
      const { productId } = args;
      const productListingAddress = await PublicKey.findProgramAddressSync(
        [Buffer.from('listing'), productId.toBuffer()],
        program.programId
      );

      return program.methods
        .makePurchase(productId)
        .accounts({
          clickcrate: account,
          productListing: productListingAddress[0],
          owner: program.provider.publicKey,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to make purchase'),
  });

  const updateClickCrate = useMutation({
    mutationKey: ['clickcrate-test', 'updateClickCrate', { cluster, account }],
    mutationFn: async (
      args: [PublicKey, PublicKey, string, string, PublicKey]
    ) => {
      const [
        id,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        owner,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        eligiblePlacementType,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        eligibleProductCategory,
        manager,
      ] = args;

      // const convertedPlacementType = getPlacementTypeFromString(
      //   eligiblePlacementType
      // );
      // const convertedProductCategory = getProductCategoryFromString(
      //   eligibleProductCategory
      // );

      return program.methods
        .updateClickcrate(id, { digitalreplica: {} }, { clothing: {} }, manager)
        .accounts({
          clickcrate: account,
          owner: program.provider.publicKey,
          systemProgram: program.programId,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to update ClickCrate'),
  });

  return {
    accountQuery,
    activateClickCrate,
    deactivateClickCrate,
    makePurchase,
    updateClickCrate,
  };
}

export function useActivateClickCrates() {
  const { program, accounts } = useClickcratePosProgram();
  const transactionToast = useTransactionToast();

  return useMutation({
    mutationKey: ['clickcrate-test', 'activateClickCrates'],
    mutationFn: async (clickCrateAccounts: PublicKey[]) => {
      const txSigs = await Promise.all(
        clickCrateAccounts.map((account) =>
          program.methods
            .activateClickcrate()
            .accounts({
              clickcrate: account,
              owner: program.provider.publicKey,
            })
            .rpc()
        )
      );

      return txSigs;
    },
    onSuccess: () => {
      transactionToast('ClickCrates activated successfully');
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to activate ClickCrates'),
  });
}

export function useDeactivateClickCrates() {
  const { program, accounts } = useClickcratePosProgram();
  const transactionToast = useTransactionToast();

  return useMutation({
    mutationKey: ['clickcrate-test', 'deactivateClickCrates'],
    mutationFn: async (clickCrateAccounts: PublicKey[]) => {
      const txSigs = await Promise.all(
        clickCrateAccounts.map((account) =>
          program.methods
            .deactivateClickcrate()
            .accounts({
              clickcrate: account,
              owner: program.provider.publicKey,
            })
            .rpc()
        )
      );

      return txSigs;
    },
    onSuccess: () => {
      transactionToast('ClickCrates deactivated successfully');
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to deactivate ClickCrates'),
  });
}
