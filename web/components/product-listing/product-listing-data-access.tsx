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
  PlaceProductListingArgs,
  RemoveProductListingArgs,
} from '../../types';
import { useMemo } from 'react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { das } from '@metaplex-foundation/mpl-core-das';
import { publicKey } from '@metaplex-foundation/umi';

export function useClickCrateListingProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();

  const programId = useMemo(
    () => getClickcrateTestProgramId(cluster.network as Cluster),
    [cluster]
  );

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
  const { connection } = useConnection();
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
        .accounts([
          {
            productListing: account,
            owner: program.provider.publicKey,
          },
        ])
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
        .accounts([
          {
            productListing: account,
            owner: program.provider.publicKey,
          },
        ])
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to deactivate Product Listing'),
  });

  const initializeOracle = async (
    productListingId: PublicKey,
    productId: PublicKey
  ) => {
    const [productListingAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('listing'), productListingId.toBuffer()],
      programId
    );

    const [oraclePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('oracle'), productId.toBuffer()],
      programId
    );

    await program.methods
      .initializeOracle(productListingId, productId)
      .accountsStrict({
        productListing: productListingAccount,
        product: productId,
        oracle: oraclePda,
        payer: program.provider.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  };

  const closeOracle = async (
    productListingId: PublicKey,
    productId: PublicKey
  ) => {
    const [productListingAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('listing'), productListingId.toBuffer()],
      programId
    );

    const [oraclePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('oracle'), productId.toBuffer()],
      programId
    );

    await program.methods
      .closeOracle(productListingId, productId)
      .accountsStrict({
        productListing: productListingAccount,
        oracle: oraclePda,
        product: productId,
        owner: program.provider.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  };

  const placeProductListing = useMutation({
    mutationKey: ['clickcrate-test', 'placeProducts', { cluster, account }],
    mutationFn: async (args: PlaceProductListingArgs) => {
      const { productListingId, clickcrateId, price } = args;
      // Initialize Umi with DAS API
      const umi = createUmi(connection.rpcEndpoint).use(dasApi());

      // Fetch assets in the collection
      const assets = await das.getAssetsByCollection(umi, {
        collection: publicKey(productListingId.toBase58()),
      });

      // Validate number of assets
      if (assets.length < 1 || assets.length > 20) {
        throw new Error(
          `Invalid number of assets in collection: ${assets.length}. Must be between 1 and 20.`
        );
      }

      // Fetch account info for each asset
      // const productAccounts = await Promise.all(
      //   assets.map((asset) =>
      //     connection.getAccountInfo(new PublicKey(asset.id))
      //   )
      // );

      // Filter out null accounts
      // const validProductAccounts = productAccounts.filter(
      //   (account: null) => account !== null
      // ) as AccountInfo<Buffer>[];

      // Fetch listing collection account info
      const listingCollectionAccountInfo = await connection.getAccountInfo(
        productListingId
      );
      if (!listingCollectionAccountInfo) {
        throw new Error('Failed to fetch listing collection account info');
      }

      const [clickcrateAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('clickcrate'), clickcrateId.toBuffer()],
        programId
      );

      const [productListingAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('listing'), productListingId.toBuffer()],
        programId
      );

      const [vaultAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), account.toBuffer()],
        programId
      );

      for (const asset of assets) {
        await initializeOracle(
          productListingId,
          new PublicKey(asset.publicKey)
        );
      }

      return program.methods
        .placeProducts(productListingId, clickcrateId, new BN(price))
        .accountsStrict({
          clickcrate: clickcrateAccount,
          productListing: productListingAccount,
          vault: vaultAccount,
          listingCollection: productListingId,
          owner: program.provider.publicKey,
          coreProgram: new PublicKey(
            'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'
          ),
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts(
          assets.map((asset) => ({
            pubkey: new PublicKey(asset.publicKey),
            isWritable: true,
            isSigner: false,
          }))
        )
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
      const { productListingId, clickcrateId } = args;

      // Initialize Umi with DAS API
      const umi = createUmi(connection.rpcEndpoint).use(dasApi());

      // Fetch assets in the collection
      const assets = await das.getAssetsByCollection(umi, {
        collection: publicKey(productListingId.toBase58()),
      });

      // Validate number of assets
      if (assets.length < 1 || assets.length > 20) {
        throw new Error(
          `Invalid number of assets in collection: ${assets.length}. Must be between 1 and 20.`
        );
      }

      const [clickcrateAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('clickcrate'), clickcrateId.toBuffer()],
        programId
      );

      const [productListingAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('listing'), productListingId.toBuffer()],
        programId
      );

      const [vaultAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), productListingAccount.toBuffer()],
        programId
      );

      return program.methods
        .removeProducts(productListingId, clickcrateId)
        .accountsStrict({
          clickcrate: clickcrateAccount,
          productListing: productListingAccount,
          vault: vaultAccount,
          listingCollection: productListingId,
          owner: program.provider.publicKey,
          coreProgram: new PublicKey(
            'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'
          ),
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts(
          assets.map((asset) => ({
            pubkey: new PublicKey(asset.publicKey),
            isWritable: true,
            isSigner: false,
          }))
        )
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
    mutationFn: async (args: [PublicKey, string, string, PublicKey, BN]) => {
      const [
        productListingId,
        newPlacementType,
        newProductCategory,
        newManager,
        newPrice,
      ] = args;

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
          productListingId,
          convertedPlacementType,
          convertedProductCategory,
          newManager,
          newPrice
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
