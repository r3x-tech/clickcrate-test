'use client';

import {
  ClickcrateTestIDL,
  getClickcrateTestProgramId,
} from '@clickcrate-test/anchor';
import { BN, Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey, SystemProgram } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import {
  PlaceProductListingArgs,
  // getPlacementTypeFromString,
  // getProductCategoryFromString,
  // getOriginFromString,
} from '../../types';
import { useMemo } from 'react';

export function useClickCrateListingProgram() {
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
    queryFn: () => program.account.productListingState.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const registerProductListing = useMutation({
    mutationKey: ['clickcrate-test', 'registerProductListing', { cluster }],
    mutationFn: async (
      args: [PublicKey, PublicKey, string, string, string, number, PublicKey]
    ) => {
      const [
        id,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        owner,
        origin,
        placementType,
        productCategory,
        inStock,
        manager,
      ] = args;
      const [productListingAddress] = await PublicKey.findProgramAddressSync(
        [Buffer.from('listing'), id.toBuffer()],
        programId
      );

      const or = origin;
      console.log(or);

      const pt = placementType;
      console.log(pt);

      const pc = productCategory;
      console.log(pc);

      // const convertedOrigin = getOriginFromString(origin);
      // const convertedPlacementType = getPlacementTypeFromString(placementType);
      // const convertedProductCategory =
      //   getProductCategoryFromString(productCategory);

      return program.methods
        .registerProductListing(
          id,
          { clickcrate: {} },
          { relatedpurchase: {} },
          { clothing: {} },
          new BN(inStock),
          manager
        )
        .accounts({
          productListing: productListingAddress,
          owner: program.provider.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to register Product Listing'),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    registerProductListing,
  };
}

export function useClickCrateListingProgramAccount({
  account,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useClickCrateListingProgram();

  const accountQuery = useQuery({
    queryKey: ['clickcrate-test', 'fetch', { cluster, account }],
    queryFn: () => program.account.productListingState.fetch(account),
  });

  const activateProductListing = useMutation({
    mutationKey: [
      'clickcrate-test',
      'activateProductListing',
      { cluster, account },
    ],
    mutationFn: async () => {
      return program.methods
        .activateProductListing()
        .accounts({
          productListing: account,
          owner: program.provider.publicKey,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to activate Product Listing'),
  });

  const deactivateProductListing = useMutation({
    mutationKey: [
      'clickcrate-test',
      'deactivateProductListing',
      { cluster, account },
    ],
    mutationFn: async () => {
      return program.methods
        .deactivateProductListing()
        .accounts({
          productListing: account,
          owner: program.provider.publicKey,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to deactivate Product Listing'),
  });

  const placeProductListing = useMutation({
    mutationKey: [
      'clickcrate-test',
      'placeProductListing',
      { cluster, account },
    ],
    mutationFn: async (args: PlaceProductListingArgs) => {
      const { productId } = args;

      return program.methods
        .placeProductListing(productId)
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
    onError: () => toast.error('Failed to place Product Listing'),
  });

  const removeProductListing = useMutation({
    mutationKey: [
      'clickcrate-test',
      'removeProductListing',
      { cluster, account },
    ],
    mutationFn: async () => {
      return program.methods
        .removeProductListing()
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
    onError: () => toast.error('Failed to remove Product Listing'),
  });

  const updateProductListing = useMutation({
    mutationKey: [
      'clickcrate-test',
      'updateProductListing',
      { cluster, account },
    ],
    mutationFn: async (args: [string, string, PublicKey]) => {
      const [newPlacementType, newProductCategory, newManager] = args;

      const nPt = newPlacementType;
      console.log(nPt);

      const nPc = newProductCategory;
      console.log(nPc);

      // const convertedPlacementType =
      //   getPlacementTypeFromString(newPlacementType);
      // const convertedProductCategory =
      //   getProductCategoryFromString(newProductCategory);

      return program.methods
        .updateProductListing(
          { digitalreplica: {} },
          { clothing: {} },
          newManager
        )
        .accounts({
          productListing: account,
          owner: program.provider.publicKey,
          systemProgram: program.programId,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to update Product Listing'),
  });

  return {
    accountQuery,
    activateProductListing,
    deactivateProductListing,
    placeProductListing,
    removeProductListing,
    updateProductListing,
  };
}

export function useActivateProductListings() {
  const { program, accounts } = useClickCrateListingProgram();
  const transactionToast = useTransactionToast();

  return useMutation({
    mutationKey: ['clickcrate-test', 'activateProductListings'],
    mutationFn: async (productListingAccounts: PublicKey[]) => {
      const txSigs = await Promise.all(
        productListingAccounts.map((account) =>
          program.methods
            .activateProductListing()
            .accounts({
              productListing: account,
              owner: program.provider.publicKey,
            })
            .rpc()
        )
      );

      return txSigs;
    },
    onSuccess: () => {
      transactionToast('Product Listings activated successfully');
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to activate Product Listings'),
  });
}

export function useDeactivateProductListings() {
  const { program, accounts } = useClickCrateListingProgram();
  const transactionToast = useTransactionToast();

  return useMutation({
    mutationKey: ['clickcrate-test', 'deactivateProductListings'],
    mutationFn: async (productListingAccounts: PublicKey[]) => {
      const txSigs = await Promise.all(
        productListingAccounts.map((account) =>
          program.methods
            .deactivateProductListing()
            .accounts({
              productListing: account,
              owner: program.provider.publicKey,
            })
            .rpc()
        )
      );

      return txSigs;
    },
    onSuccess: () => {
      transactionToast('Product Listings deactivated successfully');
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to deactivate Product Listings'),
  });
}
