'use client';

import {
  ClickcrateTestIDL,
  getClickcrateTestProgramId,
} from '@clickcrate-test/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey, SystemProgram } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import {
  MakePurchaseArgs,
  getPlacementTypeFromString,
  getProductCategoryFromString,
} from '../../types';
import { useMemo } from 'react';

export function useClickcratePosProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getClickcrateTestProgramId(cluster.network as Cluster),
    [cluster]
  );
  // const programId = new PublicKey(
  //   'RcGXdMiga83T527zSoCQDaWdMmU2qVQA3GCkfZyGrXc'
  // );

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
    mutationFn: async (args: [PublicKey, string, string, PublicKey]) => {
      const [id, eligiblePlacementType, eligibleProductCategory, manager] =
        args;
      const [clickcrateAddress] = await PublicKey.findProgramAddressSync(
        [Buffer.from('clickcrate'), id.toBuffer()],
        programId
      );

      const convertedPlacementType = getPlacementTypeFromString(
        eligiblePlacementType
      );
      const convertedProductCategory = getProductCategoryFromString(
        eligibleProductCategory
      );

      console.log('registerClickCrate input:', {
        id: id.toString(),
        eligiblePlacementType,
        eligibleProductCategory,
        manager: manager.toString(),
      });

      return program.methods
        .registerClickcrate(
          id,
          convertedPlacementType,
          convertedProductCategory,
          manager
        )
        .accounts({
          clickcrate: clickcrateAddress,
          owner: manager,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
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
      const productListingAddress = await PublicKey.findProgramAddress(
        [Buffer.from('product_listing'), productId.toBuffer()],
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
    mutationFn: async (args: [PublicKey, string, string, PublicKey]) => {
      const [id, eligiblePlacementType, eligibleProductCategory, manager] =
        args;

      const convertedPlacementType = getPlacementTypeFromString(
        eligiblePlacementType
      );
      const convertedProductCategory = getProductCategoryFromString(
        eligibleProductCategory
      );

      return program.methods
        .updateClickcrate(
          id,
          convertedPlacementType,
          convertedProductCategory,
          manager
        )
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
