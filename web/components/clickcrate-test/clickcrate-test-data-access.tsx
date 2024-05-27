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
  MakePurchaseArgs,
  getPlacementTypeFromString,
  getProductCategoryFromString,
  getOriginFromString,
} from '../../types';
import { useMemo } from 'react';

export function useClickcrateTestProgram() {
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

  const registerProductListing = useMutation({
    mutationKey: ['clickcrate-test', 'registerProductListing', { cluster }],
    mutationFn: async (
      args: [PublicKey, string, string, string, number, PublicKey]
    ) => {
      const [id, origin, placementType, productCategory, inStock, manager] =
        args;
      const [productListingAddress] = await PublicKey.findProgramAddressSync(
        [Buffer.from('product_listing'), id.toBuffer()],
        programId
      );

      const convertedOrigin = getOriginFromString(origin);
      const convertedPlacementType = getPlacementTypeFromString(placementType);
      const convertedProductCategory =
        getProductCategoryFromString(productCategory);

      return program.methods
        .registerProductListing(
          id,
          convertedOrigin,
          convertedPlacementType,
          convertedProductCategory,
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
    registerClickCrate,
    registerProductListing,
  };
}

export function useClickcrateTestProgramAccount({
  account,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useClickcrateTestProgram();

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

  const updateProductListing = useMutation({
    mutationKey: [
      'clickcrate-test',
      'updateProductListing',
      { cluster, account },
    ],
    mutationFn: async (args: [string, string, PublicKey]) => {
      const [newPlacementType, newProductCategory, newManager] = args;

      const convertedPlacementType =
        getPlacementTypeFromString(newPlacementType);
      const convertedProductCategory =
        getProductCategoryFromString(newProductCategory);

      return program.methods
        .updateProductListing(
          convertedPlacementType,
          convertedProductCategory,
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
    activateClickCrate,
    deactivateClickCrate,
    activateProductListing,
    deactivateProductListing,
    placeProductListing,
    removeProductListing,
    makePurchase,
    updateClickCrate,
    updateProductListing,
  };
}
