/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { PublicKey } from '@solana/web3.js';
import { useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useClickCrateListingProgram,
  useClickCrateListingProgramAccount,
} from './product-listing-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import { Origin, PlacementType, ProductCategory } from '@/types';
import { BN } from '@coral-xyz/anchor';

export function ProductListingRegister() {
  const { registerProductListing } = useClickCrateListingProgram();
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

export function ProductListingsList() {
  const { accounts, getProgramAccount } = useClickCrateListingProgram();

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
        <div className="text-start">
          <h3 className={'text-lg mt-8 mb-2 font-semibold'}>
            My Product Listings
          </h3>
          <p className={'text-sm font-normal'}>
            No Product Listings found. Create one above to get started.
          </p>
        </div>
      )}
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
  } = useClickCrateListingProgramAccount({ account });

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
          </div>
        </div>
      </div>
    </div>
  );
}
