'use client';

import {
  ClickcrateTest,
  ClickcrateTestIDL,
  getClickcrateTestProgramId,
} from '@clickcrate-test/anchor';
import { BN, Program } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Cluster,
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
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
import { publicKey, signAllTransactions } from '@metaplex-foundation/umi';
import {
  fetchAssetsByCollection,
  MPL_CORE_PROGRAM_ID,
} from '@metaplex-foundation/mpl-core';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';

export function useClickCrateListingProgram() {
  const { connection } = useConnection();
  const { signAllTransactions, sendTransaction } = useWallet();
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
      args: [PublicKey, PublicKey, string, string, string, PublicKey, string]
    ) => {
      const [
        id,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        owner,
        origin,
        placementType,
        productCategory,
        manager,
        orderManager,
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
      const convertedOrderManager = getOriginFromString(orderManager);

      return program.methods
        .registerProductListing(
          id,
          convertedOrigin,
          convertedPlacementType,
          convertedProductCategory,
          manager,
          convertedOrderManager
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
  const { wallet, signAllTransactions, sendTransaction } = useWallet();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts, programId } = useClickCrateListingProgram();
  const provider = useAnchorProvider();

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
        .accountsStrict({
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
        .accountsStrict({
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

      console.log('ACCOUNT IS: ', account);
      console.log('CLUSTER IS: ', cluster);

      // Initialize Umi with DAS API
      const umi = createUmi(connection.rpcEndpoint).use(dasApi());
      const collection = publicKey(productListingId);
      console.log(`CURRENT COLLECTION is: `, collection);

      // const currentAsset = await das.getAsset(umi, collection);
      // console.log(`CURRENT ASSET is: `, currentAsset);

      // const currColl = await das.dasAssetsToCoreAssets(umi, collection);
      // console.log(`CURRENT COLL is: `, currColl);

      const owner = wallet?.adapter.publicKey;
      if (owner == undefined || !owner) {
        throw Error('Owner not found');
      }
      console.log(`CURRENT OWNER is: `, owner);

      // const ownerAsset = await das.getAssetsByOwner(umi, {
      //   owner: publicKey(owner),
      // });
      // console.log(`CURRENT OWNER ASSETS are: `, ownerAsset);

      // const collectionData = await das.getCollection(umi, collection);
      // console.log(`collection data is: `, collectionData);

      // Fetch assets in the collection
      // console.log(
      //   `Fetching assets for collection: ${productListingId.toBase58()}`
      // );
      // const assets = await das.getAssetsByCollection(umi, {
      //   collection,
      // });
      // console.log(`Raw assets result:`, assets);

      const assets = await fetchAssetsByCollection(umi, collection, {
        skipDerivePlugins: false,
      });

      console.log('ASSETS ARE: ', assets);

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
        [Buffer.from('vault'), productListingId.toBuffer()],
        programId
      );
      console.log(`INIT ACCOUNTS SUCCESS`);

      for (const asset of assets) {
        await initializeOracle(
          productListingId,
          new PublicKey(asset.publicKey)
        );
      }

      console.log(`ORACLE ACCOUNTS INIT SUCCESS`);

      const ix = await program.methods
        .placeProducts(productListingId, clickcrateId, new BN(price))
        .accountsStrict({
          clickcrate: clickcrateAccount,
          productListing: productListingAccount,
          vault: vaultAccount,
          listingCollection: productListingId,
          owner: program.provider.publicKey,
          coreProgram: MPL_CORE_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts(
          assets.map((asset) => ({
            pubkey: new PublicKey(asset.publicKey),
            isWritable: true,
            isSigner: false,
          }))
        )
        .instruction();

      console.log('ix is: ', ix);

      const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 500000,
      });

      const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1,
      });

      const blockHash = (await connection.getLatestBlockhash('finalized'))
        .blockhash;
      console.log('bkh is: ', blockHash);

      const msg = new TransactionMessage({
        payerKey: program.provider.publicKey!,
        recentBlockhash: blockHash,
        instructions: [modifyComputeUnits, addPriorityFee, ix],
      }).compileToV0Message();

      console.log('msg is: ', msg);

      const txn = new VersionedTransaction(msg);

      console.log('txn is: ', msg);

      // const solKeypair = Keypair.fromSecretKey(
      //   bs58.decode(process.env.NEXT_PUBLIC_TEMP_WALLET_SECRET_KEY!)
      // );
      // txn.sign([solKeypair]);

      // console.log('TX is: ', msg);

      // tx.feePayer = program.provider.publicKey;
      // tx.recentBlockhash = blockHash;
      // tx.sign([wa]);

      console.log(
        'Serialized TX is: ',
        Buffer.from(txn.serialize()).toString('base64')
      );

      return provider.sendAndConfirm(txn);

      // connection.sendEncodedTransaction(
      //   Buffer.from(txn.serialize()).toString('base64')
      // );

      // return program.methods
      //   .placeProducts(productListingId, clickcrateId, new BN(price))
      //   .accountsStrict({
      //     clickcrate: clickcrateAccount,
      //     productListing: productListingAccount,
      //     vault: vaultAccount,
      //     listingCollection: productListingId,
      //     owner: program.provider.publicKey,
      //     coreProgram: MPL_CORE_PROGRAM_ID,
      //     systemProgram: SystemProgram.programId,
      //   })
      //   .remainingAccounts(
      //     assets.map((asset) => ({
      //       pubkey: new PublicKey(asset.publicKey),
      //       isWritable: true,
      //       isSigner: false,
      //     }))
      //   )
      //   .rpc();
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
        .accountsStrict({
          productListing: account,
          owner: program.provider.publicKey,
          systemProgram: SystemProgram.programId,
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
            .accountsStrict({
              productListing: account,
              owner: program.provider.publicKey,
            })
            .rpc()
        )
      );

      return txSigs;
    },
    onSuccess: (txSigs) => {
      txSigs.forEach((txSig) => transactionToast(txSig));
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
            .accountsStrict({
              productListing: account,
              owner: program.provider.publicKey,
            })
            .rpc()
        )
      );

      return txSigs;
    },
    onSuccess: (txSigs) => {
      txSigs.forEach((txSig) => transactionToast(txSig));
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to deactivate Product Listings'),
  });
}
