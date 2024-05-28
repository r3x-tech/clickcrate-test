/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { PublicKey } from '@solana/web3.js';
import { useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useClickcrateTestProgram,
  useClickcrateTestProgramAccount,
} from './clickcrate-test-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import { Origin, PlacementType, ProductCategory } from '@/types';
import { BN } from '@coral-xyz/anchor';

export function TestClickCrateRegister() {
  const { registerClickCrate, registerProductListing } =
    useClickcrateTestProgram();
  const { publicKey } = useWallet();

  const [clickcrateId, setClickcrateId] = useState('');
  const [clickcratePlacementType, setClickcratePlacementType] =
    useState<PlacementType>();
  const [clickcrateProductCategory, setClickcrateProductCategory] =
    useState<ProductCategory>();

  const isClickcrateFormValid =
    clickcrateId.trim() !== '' &&
    clickcratePlacementType !== undefined &&
    clickcrateProductCategory !== undefined;

  const handleClickcrateRegistration = () => {
    if (publicKey && isClickcrateFormValid) {
      registerClickCrate.mutateAsync([
        new PublicKey(clickcrateId),
        clickcratePlacementType!,
        clickcrateProductCategory!,
        publicKey,
      ]);
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
            setClickcratePlacementType(e.target.value as PlacementType)
          }
          className="rounded-lg p-2 text-black"
        >
          <option value="">Select a placement type</option>
          <option value="DigitalReplica">Digital Replica</option>
          <option value="RelatedPurchase">Related Purchase</option>
          <option value="TargetedPlacement">Targeted Placement</option>
        </select>
        <select
          value={clickcrateProductCategory}
          placeholder="Eligible Product Category"
          onChange={(e) =>
            setClickcrateProductCategory(e.target.value as ProductCategory)
          }
          className="rounded-lg p-2 text-black"
        >
          <option value="">Select a product category</option>
          <option value="Clothing">Clothing</option>
          <option value="Electronics">Electronics</option>
          <option value="Books">Books</option>
          <option value="Home">Home</option>
          <option value="Beauty">Beauty</option>
          <option value="Toys">Toys</option>
          <option value="Sports">Sports</option>
          <option value="Automotive">Automotive</option>
          <option value="Grocery">Grocery</option>
          <option value="Health">Health</option>
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

export function TestProductListingRegister() {
  const { registerProductListing } = useClickcrateTestProgram();
  const { publicKey } = useWallet();

  const [productId, setProductId] = useState('');
  const [productOrigin, setProductOrigin] = useState<Origin | null>(null);
  const [productPlacementType, setProductPlacementType] =
    useState<PlacementType | null>(null);
  const [productCategory, setProductCategory] =
    useState<ProductCategory | null>(null);
  const [productInStock, setProductInStock] = useState<BN>(new BN(0));

  const isProductFormValid =
    productId.trim() !== '' &&
    productOrigin !== null &&
    productPlacementType !== null &&
    productCategory !== null;

  const handleProductRegistration = () => {
    if (publicKey && isProductFormValid) {
      registerProductListing.mutateAsync([
        new PublicKey(productId),
        productOrigin,
        productPlacementType,
        productCategory!,
        productInStock.toNumber(),
        publicKey,
      ]);
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <div className="flex flex-col gap-y-8">
      <div className="bg-background p-6 flex flex-col border-2 border-white rounded-lg space-y-4">
        <h1 className="text-lg font-bold text-start font-heading">
          Register Product Listing
        </h1>

        <input
          type="text"
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="rounded-lg p-2 text-black"
        />
        <input
          type="number"
          placeholder="Product Stock"
          value={productInStock.toString()}
          onChange={(e) => setProductInStock(new BN(parseInt(e.target.value)))}
          className="rounded-lg p-2 text-black"
        />
        <select
          value={productOrigin || ''}
          onChange={(e) => setProductOrigin(e.target.value as Origin)}
          className="rounded-lg p-2 text-black"
        >
          <option value="">Select an origin</option>
          <option value="Clickcrate">Clickcrate</option>
          <option value="Shopify">Shopify</option>
          <option value="Square">Square</option>
        </select>
        <select
          value={productPlacementType || ''}
          onChange={(e) =>
            setProductPlacementType(e.target.value as PlacementType)
          }
          className="rounded-lg p-2 text-black"
        >
          <option value="">Select a placement type</option>
          <option value="DigitalReplica">Digital Replica</option>
          <option value="RelatedPurchase">Related Purchase</option>
          <option value="TargetedPlacement">Targeted Placement</option>
        </select>
        <select
          value={productCategory || ''}
          onChange={(e) =>
            setProductCategory(e.target.value as ProductCategory)
          }
          className="rounded-lg p-2 text-black"
        >
          <option value="">Select a product category</option>
          <option value="Clothing">Clothing</option>
          <option value="Electronics">Electronics</option>
          <option value="Books">Books</option>
          <option value="Home">Home</option>
          <option value="Beauty">Beauty</option>
          <option value="Toys">Toys</option>
          <option value="Sports">Sports</option>
          <option value="Automotive">Automotive</option>
          <option value="Grocery">Grocery</option>
          <option value="Health">Health</option>
        </select>
        <div className="pt-2 w-full">
          <button
            className="btn btn-xs sm:btn-sm btn-primary w-full h-full py-3 justify-center items-center"
            onClick={handleProductRegistration}
            disabled={registerProductListing.isPending}
          >
            Register Listing {registerProductListing.isPending && '...'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ClickCrateTestList() {
  const { accounts, getProgramAccount } = useClickcrateTestProgram();

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
            <ClickCrateCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl mt-4'}>My ClickCrates</h2>
          No ClickCrates found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

export function ProductListingsTestList() {
  const { accounts, getProgramAccount } = useClickcrateTestProgram();

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
            <ProductListingCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl mt-4'}>My Product Listings</h2>
          No Product Listings found. Create one above to get started.
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
  const [placementType, setPlacementType] = useState<PlacementType | null>(
    null
  );
  const [productCategory, setProductCategory] =
    useState<ProductCategory | null>(null);
  const [manager, setManager] = useState<PublicKey | null>(null);
  const [productId, setProductId] = useState('');

  const isUpdateClickCrateFormValid =
    placementType !== null && productCategory !== null && manager !== null;

  const isPlaceProductListingFormValid = productId.trim() !== '';

  const handleUpdateClickCrate = () => {
    if (publicKey && isUpdateClickCrateFormValid) {
      updateClickCrate.mutateAsync([
        account,
        placementType!,
        productCategory!,
        manager!,
      ]);
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
                value={placementType || ''}
                onChange={(e) =>
                  setPlacementType(e.target.value as PlacementType)
                }
              >
                <option value="">Select a placement type</option>
                <option value="RelatedPurchase">Related Purchase</option>
                <option value="DigitalReplica">Digital Replica</option>
                <option value="TargetedPlacement">Targeted Placement</option>
              </select>
              <select
                value={productCategory || ''}
                onChange={(e) =>
                  setProductCategory(e.target.value as ProductCategory)
                }
              >
                <option value="">Select a product category</option>
                <option value="Clothing">Clothing</option>
                <option value="Electronics">Electronics</option>
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
                className="rounded-lg p-2 text-lightGray"
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
  const [placementType, setPlacementType] = useState<PlacementType | null>(
    null
  );
  const [productCategory, setProductCategory] =
    useState<ProductCategory | null>(null);
  const [manager, setManager] = useState<PublicKey | null>(null);
  const [productId, setProductId] = useState('');

  const isUpdateProductListingFormValid =
    placementType !== null && productCategory !== null && manager !== null;

  const isMakePurchaseFormValid = productId.trim() !== '';

  const handleUpdateProductListing = () => {
    if (publicKey && isUpdateProductListingFormValid) {
      updateProductListing.mutateAsync([
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
            Product Listing
          </h2>
          <div className="card-actions justify-around">
            {/* Update Product Listing form */}
            <div>
              <select
                value={placementType || ''}
                onChange={(e) =>
                  setPlacementType(e.target.value as PlacementType)
                }
              >
                <option value="">Select a placement type</option>
                <option value="RelatedPurchase">Related Purchase</option>
                <option value="DigitalReplica">Digital Replica</option>
                <option value="TargetedPlacement">Targeted Placement</option>
              </select>
              <select
                value={productCategory || ''}
                onChange={(e) =>
                  setProductCategory(e.target.value as ProductCategory)
                }
              >
                <option value="">Select a product category</option>
                <option value="Clothing">Clothing</option>
                <option value="Electronics">Electronics</option>
              </select>
              <input
                type="text"
                placeholder="Manager"
                onChange={(e) => setManager(new PublicKey(e.target.value))}
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
