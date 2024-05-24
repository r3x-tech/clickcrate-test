'use client';

import { Keypair, PublicKey } from '@solana/web3.js';
import { useMemo, useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useClickcrateTestProgram,
  useClickcrateTestProgramAccount,
} from './clickcrate-test-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import { Origin, PlacementType, ProductCategory } from '@/types';
import { BN } from '@coral-xyz/anchor';

export function ClickcrateTestRegister() {
  const { registerClickCrate, registerProductListing } =
    useClickcrateTestProgram();
  const { publicKey } = useWallet();

  const [productId, setProductId] = useState('');
  const [productOrigin, setProductOrigin] = useState<Origin>({
    clickcrate: {},
  });

  const [productEligiblePlacementTypes, setProductEligiblePlacementTypes] =
    useState<PlacementType[]>([]);
  const [productEligibleProductCategory, setProductEligibleProductCategory] =
    useState<ProductCategory | null>(null);
  const [productInStock, setProductInStock] = useState<BN>(new BN(0));

  const [clickcrateId, setClickcrateId] = useState('');
  const [
    clickcrateEligiblePlacementTypes,
    setClickcrateEligiblePlacementTypes,
  ] = useState<PlacementType[]>([]);
  const [
    clickcrateEligibleProductCategories,
    setClickcrateEligibleProductCategories,
  ] = useState<ProductCategory[]>([]);

  const isProductFormValid =
    productId.trim() !== '' &&
    productOrigin !== undefined &&
    productEligiblePlacementTypes.length > 0 &&
    productEligibleProductCategory !== null;

  const isClickcrateFormValid =
    clickcrateId.trim() !== '' &&
    clickcrateEligiblePlacementTypes.length > 0 &&
    clickcrateEligibleProductCategories.length > 0;

  const handleProductRegistration = () => {
    if (publicKey && isProductFormValid) {
      registerProductListing.mutateAsync({
        id: new PublicKey(productId),
        origin: productOrigin,
        placementTypes: productEligiblePlacementTypes,
        productCategory: productEligibleProductCategory,
        inStock: productInStock,
        manager: publicKey,
        owner: publicKey,
      });
    }
  };

  const handleClickcrateRegistration = () => {
    if (publicKey && isClickcrateFormValid) {
      registerClickCrate.mutateAsync({
        id: new PublicKey(clickcrateId),
        owner: publicKey,
        eligiblePlacementTypes: clickcrateEligiblePlacementTypes,
        eligibleProductCategories: clickcrateEligibleProductCategories,
        manager: publicKey,
      });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <>
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleProductRegistration}
        disabled={registerClickCrate.isPending}
      >
        Register ClickCrate {registerClickCrate.isPending && '...'}
      </button>

      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleClickcrateRegistration}
        disabled={registerProductListing.isPending}
      >
        Register Product Listing {registerProductListing.isPending && '...'}
      </button>
    </>
  );
}

export function ClickcrateTestList() {
  const { accounts, getProgramAccount } = useClickcrateTestProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <ClickCrateCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

// ClickCrateCard component
function ClickCrateCard({ account }: { account: PublicKey }) {
  const {
    accountQuery,
    updateClickCrate,
    activateClickCrate,
    deactivateClickCrate,
    placeProductListing,
    removeProductListing,
  } = useClickcrateTestProgramAccount({ account });

  const { publicKey } = useWallet();
  const [eligiblePlacementTypes, setEligiblePlacementTypes] = useState<
    PlacementType[]
  >([]);
  const [eligibleProductCategories, setEligibleProductCategories] = useState<
    ProductCategory[]
  >([]);
  const [manager, setManager] = useState<PublicKey | null>(null);
  const [productId, setProductId] = useState('');

  const isUpdateClickCrateFormValid =
    eligiblePlacementTypes.length > 0 &&
    eligibleProductCategories.length > 0 &&
    manager !== null;

  const isPlaceProductListingFormValid = productId.trim() !== '';

  const handleUpdateClickCrate = () => {
    if (publicKey && isUpdateClickCrateFormValid) {
      updateClickCrate.mutateAsync({
        id: account,
        eligiblePlacementTypes,
        eligibleProductCategories,
        manager,
      });
    }
  };

  const handlePlaceProductListing = () => {
    if (publicKey && isPlaceProductListingFormValid) {
      placeProductListing.mutateAsync({
        productId: new PublicKey(productId),
      });
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
                multiple
                value={eligiblePlacementTypes.map((type) => type.toString())}
                onChange={(e) => {
                  const selectedTypes = Array.from(
                    e.target.selectedOptions,
                    (option) => JSON.parse(option.value)
                  );
                  setEligiblePlacementTypes(selectedTypes);
                }}
              >
                <option value={JSON.stringify({ relatedPurchase: {} })}>
                  Related Purchase
                </option>
                <option value={JSON.stringify({ digitalReplica: {} })}>
                  Digital Replica
                </option>
                <option value={JSON.stringify({ targetedPlacement: {} })}>
                  Targeted Placement
                </option>
              </select>
              <select
                multiple
                value={eligibleProductCategories.map((category) =>
                  category.toString()
                )}
                onChange={(e) => {
                  const selectedCategories = Array.from(
                    e.target.selectedOptions,
                    (option) => JSON.parse(option.value)
                  );
                  setEligibleProductCategories(selectedCategories);
                }}
              >
                <option value={JSON.stringify({ clothing: {} })}>
                  Clothing
                </option>
                <option value={JSON.stringify({ electronics: {} })}>
                  Electronics
                </option>
                {/* Add more product category options */}
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
            {/* Place Product Listing form */}
            <div>
              <input
                type="text"
                placeholder="Product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              />
              <button
                className="btn btn-xs btn-secondary btn-outline"
                onClick={handlePlaceProductListing}
                disabled={
                  placeProductListing.isPending ||
                  !isPlaceProductListingFormValid
                }
              >
                Place Product Listing {placeProductListing.isPending && '...'}
              </button>
            </div>
            <button
              className="btn btn-xs btn-secondary btn-outline"
              onClick={() => removeProductListing.mutateAsync()}
              disabled={removeProductListing.isPending}
            >
              Remove Product Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ProductListingCard component
function ProductListingCard({ account }: { account: PublicKey }) {
  const {
    accountQuery,
    updateProductListing,
    activateProductListing,
    deactivateProductListing,
    makePurchase,
  } = useClickcrateTestProgramAccount({ account });

  const { publicKey } = useWallet();
  const [newPlacementTypes, setNewPlacementTypes] = useState<PlacementType[]>(
    []
  );
  const [newProductCategory, setNewProductCategory] =
    useState<ProductCategory | null>(null);
  const [newManager, setNewManager] = useState<PublicKey | null>(null);
  const [productId, setProductId] = useState('');

  const isUpdateProductListingFormValid =
    newPlacementTypes.length > 0 &&
    newProductCategory !== null &&
    newManager !== null;

  const isMakePurchaseFormValid = productId.trim() !== '';

  const handleUpdateProductListing = () => {
    if (publicKey && isUpdateProductListingFormValid) {
      updateProductListing.mutateAsync({
        newPlacementTypes,
        newProductCategory,
        newManager,
      });
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
            Product Listing
          </h2>
          <div className="card-actions justify-around">
            {/* Update Product Listing form */}
            <div>
              <select
                multiple
                value={newPlacementTypes.map((type) => type.toString())}
                onChange={(e) => {
                  const selectedTypes = Array.from(
                    e.target.selectedOptions,
                    (option) => JSON.parse(option.value)
                  );
                  setNewPlacementTypes(selectedTypes);
                }}
              >
                <option value={JSON.stringify({ relatedPurchase: {} })}>
                  Related Purchase
                </option>
                <option value={JSON.stringify({ digitalReplica: {} })}>
                  Digital Replica
                </option>
                <option value={JSON.stringify({ targetedPlacement: {} })}>
                  Targeted Placement
                </option>
              </select>
              <select
                value={newProductCategory?.toString() || ''}
                onChange={(e) =>
                  setNewProductCategory(JSON.parse(e.target.value))
                }
              >
                <option value="">Select a category</option>
                <option value={JSON.stringify({ clothing: {} })}>
                  Clothing
                </option>
                <option value={JSON.stringify({ electronics: {} })}>
                  Electronics
                </option>
                {/* Add more product category options */}
              </select>
              <input
                type="text"
                placeholder="New Manager"
                onChange={(e) => setNewManager(new PublicKey(e.target.value))}
              />
              <button
                className="btn btn-xs lg:btn-md btn-outline"
                onClick={handleUpdateProductListing}
                disabled={
                  updateProductListing.isPending ||
                  !isUpdateProductListingFormValid
                }
              >
                Update Product Listing {updateProductListing.isPending && '...'}
              </button>
            </div>
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => activateProductListing.mutateAsync()}
              disabled={activateProductListing.isPending}
            >
              Activate
            </button>
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => deactivateProductListing.mutateAsync()}
              disabled={deactivateProductListing.isPending}
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
