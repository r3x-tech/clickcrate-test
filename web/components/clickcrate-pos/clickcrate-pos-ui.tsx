/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { PublicKey } from '@solana/web3.js';
import { useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useClickcratePosProgram,
  useClickcratePosProgramAccount,
} from './clickcrate-pos-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Origin,
  PlacementType,
  PlacementTypee,
  ProductCategory,
  ProductCategoryy,
} from '@/types';
import { BN } from '@coral-xyz/anchor';

export function ClickCratePosRegister() {
  const { registerClickCrate } = useClickcratePosProgram();
  const { publicKey } = useWallet();

  const [clickcrateId, setClickcrateId] = useState('');
  const [clickcratePlacementType, setClickcratePlacementType] =
    useState<PlacementTypee>();
  const [clickcrateProductCategory, setClickcrateProductCategory] =
    useState<ProductCategoryy>();

  const isClickcrateFormValid =
    clickcrateId.trim() !== '' &&
    clickcratePlacementType !== undefined &&
    clickcrateProductCategory !== undefined;

  const handleClickcrateRegistration = () => {
    if (publicKey && isClickcrateFormValid) {
      // const eligiblePlacementType: PlacementType = 'RelatedPurchase';
      // const eligibleProductCategory: ProductCategory = 'Clothing';

      registerClickCrate.mutate([
        new PublicKey(clickcrateId),
        publicKey,
        'RelatedPurchase',
        'Clothing',
        publicKey,
      ]);
      // registerClickCrate.mutateAsync([
      //   new PublicKey(clickcrateId),
      //   clickcratePlacementType!,
      //   clickcrateProductCategory!,
      //   publicKey,
      // ]);
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <div className="flex flex-col gap-y-8">
      <div className="bg-background p-6 flex flex-col border-2 border-white rounded-lg space-y-4 min-w-[25rem]">
        <h1 className="text-lg font-bold text-start">
          Register ClickCrate POS
        </h1>
        <input
          type="text"
          placeholder="pNFT Collection ID"
          value={clickcrateId}
          onChange={(e) => setClickcrateId(e.target.value)}
          className="rounded-lg p-2 text-black"
        />
        <select
          value={clickcratePlacementType}
          placeholder="Placement Type"
          onChange={(e) =>
            setClickcratePlacementType(e.target.value as PlacementTypee)
          }
          className="rounded-lg p-2 text-black"
        >
          <option value="">Select a placement type</option>
          <option value="RELATEDPURCHASE">Related Purchase</option>
          <option value="DIGITALREPLICA">Digital Replica</option>
          <option value="TARGETEDPLACEMENT">Targeted Placement</option>
        </select>
        <select
          value={clickcrateProductCategory}
          placeholder="Eligible Product Category"
          onChange={(e) =>
            setClickcrateProductCategory(e.target.value as ProductCategoryy)
          }
          className="rounded-lg p-2 text-black"
        >
          <option value="">Select a product category</option>
          <option value="CLOTHING">Clothing</option>
          <option value="ELECTRONICS">Electronics</option>
          <option value="BOOKS">Books</option>
          <option value="HOME">Home</option>
          <option value="BEAUTY">Beauty</option>
          <option value="TOYS">Toys</option>
          <option value="SPORTS">Sports</option>
          <option value="AUTOMOTIVE">Automotive</option>
          <option value="GROCERY">Grocery</option>
          <option value="HEALTH">Health</option>
        </select>
        <div className="pt-2 w-full">
          <button
            className="btn btn-xs lg:btn-sm btn-primary w-full py-3"
            onClick={handleClickcrateRegistration}
            disabled={registerClickCrate.isPending}
          >
            Register POS {registerClickCrate.isPending && '...'}
          </button>
        </div>
      </div>
    </div>
  );
}
export function ClickCratePosList() {
  const { accounts, getProgramAccount } = useClickcratePosProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure the registry is deployed and are
          on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={'space-y-6 mb-20'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account: { publicKey: PublicKey }) => (
            <ClickCratePosCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-start">
          <h3 className={'text-lg mt-8 mb-2 font-semibold'}>My ClickCrates</h3>
          <p className={'text-sm font-normal'}>
            No ClickCrates found. Create one above to get started.
          </p>
        </div>
      )}
    </div>
  );
}

// ClickCratePosCard component
function ClickCratePosCard({ account }: { account: PublicKey }) {
  const {
    accountQuery,
    updateClickCrate,
    activateClickCrate,
    deactivateClickCrate,
    makePurchase,
  } = useClickcratePosProgramAccount({ account });

  const { publicKey } = useWallet();
  const [placementType, setPlacementType] = useState<PlacementTypee | null>(
    null
  );
  const [productCategory, setProductCategory] =
    useState<ProductCategoryy | null>(null);
  const [manager, setManager] = useState<PublicKey | null>(null);
  const [productId, setProductId] = useState('');

  const isUpdateClickCrateFormValid =
    placementType !== null && productCategory !== null && manager !== null;

  const isMakePurchaseFormValid = productId.trim() !== '';

  const handleUpdateClickCrate = () => {
    if (publicKey && isUpdateClickCrateFormValid) {
      updateClickCrate.mutateAsync([
        account,
        manager,
        placementType!,
        productCategory!,
        manager!,
      ]);
    }
  };

  const handleMakePurchase = () => {
    if (publicKey && isMakePurchaseFormValid) {
      makePurchase.mutateAsync({ productId: new PublicKey(productId) });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >
            ClickCrate
          </h2>
          <div className="card-actions justify-around">
            {/* Update ClickCrate form */}
            <div>
              <select
                value={placementType || ''}
                onChange={(e) =>
                  setPlacementType(e.target.value as PlacementTypee)
                }
              >
                <option value="">Select a placement type</option>
                <option value="RELATEDPURCHASE">Related Purchase</option>
                <option value="DIGITALREPLICA">Digital Replica</option>
                <option value="TARGETEDPLACEMENT">Targeted Placement</option>
              </select>
              <select
                value={productCategory || ''}
                onChange={(e) =>
                  setProductCategory(e.target.value as ProductCategoryy)
                }
              >
                <option value="">Select a product category</option>
                <option value="CLOTHING">Clothing</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="BOOKS">Books</option>
                <option value="HOME">Home</option>
                <option value="BEAUTY">Beauty</option>
                <option value="TOYS">Toys</option>
                <option value="SPORTS">Sports</option>
                <option value="AUTOMOTIVE">Automotive</option>
                <option value="GROCERY">Grocery</option>
                <option value="HEALTH">Health</option>
              </select>
              <input
                type="text"
                placeholder="Manager"
                onChange={(e) => setManager(new PublicKey(e.target.value))}
              />
              <button
                className="btn btn-xs lg:btn-md btn-outline"
                onClick={handleUpdateClickCrate}
                disabled={
                  updateClickCrate.isPending || !isUpdateClickCrateFormValid
                }
              >
                Update ClickCrate {updateClickCrate.isPending && '...'}
              </button>
            </div>

            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => activateClickCrate.mutateAsync()}
              disabled={activateClickCrate.isPending}
            >
              Activate
            </button>
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => deactivateClickCrate.mutateAsync()}
              disabled={deactivateClickCrate.isPending}
            >
              Deactivate
            </button>
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
            {/* Make Purchase form */}
            <div>
              <input
                type="text"
                placeholder="Product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              />
              <button
                className="btn btn-xs btn-secondary btn-outline"
                onClick={handleMakePurchase}
                disabled={makePurchase.isPending || !isMakePurchaseFormValid}
              >
                Make Purchase {makePurchase.isPending && '...'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
