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
  MakePurchaseArgs,
  getPlacementTypeFromString,
  getProductCategoryFromString,
} from '../../types';
import { useMemo } from 'react';
import { MPL_CORE_PROGRAM_ID } from '@metaplex-foundation/mpl-core';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { publicKey } from '@metaplex-foundation/umi';
import { das } from '@metaplex-foundation/mpl-core-das';

export function useClickcratePosProgram() {
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

      const convertedPlacementType = getPlacementTypeFromString(
        eligiblePlacementType
      );
      const convertedProductCategory = getProductCategoryFromString(
        eligibleProductCategory
      );

      // const idOne = new PublicKey(
      //   '9RvppNEME3e1XxA6g7cQHbvrDivjaX5xwjSnqkxb8Rb2'
      // );
      // const managerOne = new PublicKey(
      //   'Engvm8giPGZvLV115DkzhVGkWKR5j11ZTrggo5EUQBau'
      // );

      console.log('registerClickCrate input:', {
        id: id.toString(),
        convertedPlacementType,
        convertedProductCategory,
        manager: manager.toString(),
      });

      const ix = program.methods
        .registerClickcrate(
          id,
          convertedPlacementType,
          convertedProductCategory,
          manager
        )
        .accounts([
          {
            clickcrate: clickcrateAddress,
            owner: program.provider.publicKey,
            systemProgram: SystemProgram.programId,
          },
        ])
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
    onError: (error: unknown) => {
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
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();
  const { program, accounts, programId } = useClickcratePosProgram();

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
    onSuccess: (signature: string) => {
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
      const { productListingId, clickcrateId, quantity, currentBuyer } = args;

      // Replicate fetchClickCrate
      const [clickCrateAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from('clickcrate'), clickcrateId.toBuffer()],
        programId
      );
      const clickcrateAsset = await program.account.clickCrateState.fetch(
        clickCrateAddress
      );

      if (!clickcrateAsset.product) {
        throw new Error('No product found in ClickCrate');
      }

      // Replicate fetchProductListing
      const [productListingAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from('listing'), clickcrateAsset.product.toBuffer()],
        programId
      );
      console.log('productListingAddress:', productListingAddress.toString());

      const productListing = await program.account.productListingState.fetch(
        productListingAddress
      );
      if (!productListing) {
        throw new Error('Product listing not found');
      }
      console.log('productListing:', productListing);

      // Replicate fetchDasCoreCollectionAssets
      const umi = createUmi(connection).use(dasApi());
      const collection = publicKey(clickcrateAsset.product.toString());
      const collectionAssets = await das.getAssetsByCollection(umi, {
        collection,
      });

      // Find the matching asset based on the inStock value
      const productIndex = productListing.inStock;
      const matchingAsset = collectionAssets.find((asset) => {
        const name = asset.content.metadata.name;
        const indexMatch = name.match(/#(\d+)$/);
        if (indexMatch) {
          const assetIndex = new BN(indexMatch[1]);
          return assetIndex.eq(productIndex);
        }
        return false;
      });

      if (!matchingAsset) {
        throw new Error('Product unavailable');
      }

      const productAddress = new PublicKey(matchingAsset.publicKey);

      const [clickcrateAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('clickcrate'), clickcrateId.toBuffer()],
        programId
      );
      // const [vaultAccount] = PublicKey.findProgramAddressSync(
      //   [Buffer.from('vault'), productListingId.toBuffer()],
      //   programId
      // );

      const [vaultAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), productListingId.toBuffer()],
        programId
      );
      // const vaultAccount = await connection.getAccountInfo(vaultAddress);
      // if (!vaultAccount) {
      //   throw new Error(
      //     'Vault account not initialized. Products may not have been placed yet.'
      //   );
      // }

      const [oracleAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('oracle'), productAddress.toBuffer()],
        programId
      );

      return await program.methods
        .makePurchase(
          productListingId,
          clickcrateId,
          productAddress,
          new BN(quantity)
        )
        .accountsStrict({
          clickcrate: clickcrateAccount,
          productListing: productListingAddress,
          oracle: oracleAccount,
          vault: vaultAccount,
          listingCollection: productListingId,
          productAccount: productAddress,
          owner: program.provider.publicKey!,
          buyer: currentBuyer,
          coreProgram: MPL_CORE_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (signature: string) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: (error) => {
      console.error('Failed to make purchase:', error);
      toast.error('Failed to make purchase');
    },
  });

  const updateClickCrate = useMutation({
    mutationKey: ['clickcrate-test', 'updateClickCrate', { cluster, account }],
    mutationFn: async (args: [PublicKey, string, string, PublicKey]) => {
      const [
        id,
        newEligiblePlacementType,
        newEligibleProductCategory,
        newManager,
      ] = args;

      const convertedPlacementType = getPlacementTypeFromString(
        newEligiblePlacementType
      );
      const convertedProductCategory = getProductCategoryFromString(
        newEligibleProductCategory
      );

      return program.methods
        .updateClickcrate(
          id,
          convertedPlacementType,
          convertedProductCategory,
          newManager
        )
        .accounts([
          {
            clickcrate: account,
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
    onSuccess: (txSigs) => {
      txSigs.forEach((txSig) => transactionToast(txSig));
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
    onSuccess: (txSigs) => {
      txSigs.forEach((txSig) => transactionToast(txSig));
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to deactivate ClickCrates'),
  });
}
