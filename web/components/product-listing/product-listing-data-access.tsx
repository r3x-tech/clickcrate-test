'use client';

import {
  ClickcrateTest,
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
  getOriginFromString,
  getPlacementTypeFromString,
  getProductCategoryFromString,
  RemoveProductListingArgs,
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

  const program = new Program(ClickcrateTestIDL as ClickcrateTest, provider);

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
      args: [
        PublicKey,
        PublicKey,
        string,
        string,
        string,
        number,
        PublicKey,
        BN
      ]
    ) => {
      const [
        id,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        owner,
        origin,
        placementType,
        productCategory,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        inStock,
        manager,
        price,
      ] = args;

      const [productListingAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from('listing'), id.toBuffer()],
        programId
      );

      const or = origin;
      console.log(or);

      const pt = placementType;
      console.log(pt);

      const pc = productCategory;
      console.log(pc);

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
          manager,
          price
        )
        .accounts([
          {
            productListing: productListingAddress,
            owner: program.provider.publicKey,
            systemProgram: SystemProgram.programId,
          },
        ])
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
  const { program, accounts, programId } = useClickCrateListingProgram();

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

  const placeProducts = useMutation({
    mutationKey: ['clickcrate-test', 'placeProducts', { cluster, account }],
    mutationFn: async (args: {
      productId: PublicKey;
      clickcrateId: PublicKey;
      price: BN;
    }) => {
      const { productId, clickcrateId, price } = args;
      const [clickcrateAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('clickcrate'), clickcrateId.toBuffer()],
        programId
      );

      const [productListingAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('clickcrate'), clickcrateId.toBuffer()],
        programId
      );

      const [vaultAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), account.toBuffer()],
        programId
      );

      return program.methods
        .placeProducts(account, clickcrateId, price)
        .accounts({
          clickcrate: clickcrateAccount,
          productListing: productListingAccount,
          vault: vaultAccount,
          listingCollection: productId,
          coreProgram: new PublicKey(
            'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'
          ),
          owner: program.provider.publicKey,
          systemProgram: SystemProgram.programId,
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
    mutationFn: async (args: RemoveProductListingArgs) => {
      const { productId, clickcrateId } = args;

      const [productListingAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('listing'), productId.toBuffer()],
        programId
      );

      return program.methods
        .removeProductListing(productId, clickcrateId)
        .accounts([
          {
            clickcrate: account,
            productListing: productListingAccount,
            owner: program.provider.publicKey,
          },
        ])
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
        .accounts([
          {
            productListing: account,
            owner: program.provider.publicKey,
            systemProgram: SystemProgram.programId,
          },
        ])
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
    placeProducts,
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
