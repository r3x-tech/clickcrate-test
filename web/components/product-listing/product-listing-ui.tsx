/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useClickCrateListingProgram,
  useClickCrateListingProgramAccount,
} from './product-listing-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Origin,
  PlacementType,
  PlacementTypee,
  ProductCategory,
  ProductCategoryy,
} from '@/types';
import { BN } from '@coral-xyz/anchor';
import { IconEdit } from '@tabler/icons-react';
import toast from 'react-hot-toast';

export function ProductListingRegister({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  const { registerProductListing, programId } = useClickCrateListingProgram();
  const { publicKey } = useWallet();

  const [productId, setProductId] = useState('');
  const [productOrigin, setProductOrigin] = useState<Origin | null>(null);
  const [productPlacementType, setProductPlacementType] =
    useState<PlacementTypee | null>(null);
  const [productCategory, setProductCategory] =
    useState<ProductCategoryy | null>(null);
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
        publicKey,
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
    <div
      className={`modal ${
        show ? 'modal-open' : ''
      } absolute top-0 left-0 right-0 bottom-0`}
    >
      <div className="modal-box bg-background p-6 flex flex-col border-2 border-white rounded-lg space-y-4 w-[92vw]">
        <div className="flex flex-row justify-between items-end">
          <h1 className="text-lg font-bold text-start trackign-wide">
            Register Product Listing
          </h1>
          <div className="flex flex-row justify-end items-end mb-[0.15em] p-0">
            <p className="text-start font-semibold tracking-wide text-xs">
              Registry:{' '}
            </p>
            <p className="pl-2 text-start font-normal text-xs">
              <ExplorerLink
                path={`account/${programId}`}
                label={ellipsify(programId.toString())}
              />
            </p>
          </div>
        </div>

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
          <option value="CLICKCRATE">Clickcrate</option>
          <option value="SHOPIFY">Shopify</option>
          <option value="SQUARE">Square</option>
        </select>
        <select
          value={productPlacementType || ''}
          onChange={(e) =>
            setProductPlacementType(e.target.value as PlacementTypee)
          }
          className="rounded-lg p-2 text-black"
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
        <div className="flex flex-row gap-[4%] py-2">
          <button
            className="btn btn-xs lg:btn-sm btn-outline w-[48%] py-3"
            onClick={onClose}
            disabled={registerProductListing.isPending}
          >
            Cancel{' '}
          </button>
          <button
            className="btn btn-xs lg:btn-sm btn-primary w-[48%] py-3"
            onClick={handleProductRegistration}
            disabled={registerProductListing.isPending}
          >
            {registerProductListing.isPending
              ? 'Registering...'
              : 'Register Listing'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductListingsList({
  onSelect,
}: {
  onSelect: (account: PublicKey, selected: boolean) => void;
}) {
  const { accounts, getProgramAccount } = useClickCrateListingProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [allListingsSelected, setAllListingsSelected] = useState(false);

  useEffect(() => {
    if (accounts.isLoading) {
      setIsLoading(true);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [accounts.isLoading]);

  const handleRefetch = async () => {
    setIsLoading(true);
    await accounts.refetch();
    setIsLoading(false);
  };

  const handleAllListingsSelectChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isSelected = e.target.checked;
    setAllListingsSelected(isSelected);
    accounts.data?.forEach((account: { publicKey: PublicKey }) => {
      onSelect(account.publicKey, isSelected);
    });
  };

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex justify-centerw-[100%] p-6">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure the registry is deployed and you
          are on the correct cluster.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-20 w-[100%]">
      {isLoading ? (
        <div className="flex justify-center w-[100%] p-6">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : accounts.data?.length ? (
        <div className="w-[100%] bg-background border-2 border-quaternary rounded-lg">
          <button
            id="refresh-listings"
            className="hidden"
            onClick={handleRefetch}
          >
            Refresh
          </button>
          <div className="flex flex-row justify-start items-center w-[100%] px-4 pb-2 pt-2 border-b-2 border-quaternary">
            <div className="flex flex-row w-[5%]">
              <input
                type="checkbox"
                checked={allListingsSelected}
                onChange={handleAllListingsSelectChange}
                className="checkbox checkbox-xs bg-quaternary border-quaternary rounded-sm"
              />
            </div>
            <div className="flex flex-row w-[10%]">
              <p className="text-start font-bold text-xs">ID </p>
            </div>
            <div className="flex flex-row w-[15%]">
              <p className="text-start font-bold text-xs">NAME </p>
            </div>
            <div className="flex flex-row w-[10%]">
              <p className="text-start font-bold text-xs">STATUS </p>
            </div>
            <div className="flex flex-row items-center w-[10%]">
              <p className="text-start font-bold text-xs">CATEGORY</p>
            </div>
            <div className="flex flex-row w-[10%]">
              <p className="text-start font-bold text-xs">ORIGIN</p>
            </div>
            <div className="flex flex-row w-[13%]">
              <p className="text-start font-bold text-xs">PLACEMENT TYPE(S) </p>
            </div>
            <div className="flex flex-row w-[10%] justify-end">
              <p className="text-end font-bold text-xs">UNIT PRICE </p>
            </div>
            <div className="flex flex-row w-[10%] justify-end">
              <p className="text-end font-bold text-xs">STOCK </p>
            </div>
            <div className="flex flex-row w-[7%]"></div>
          </div>
          {accounts.data?.map(
            (account: { publicKey: PublicKey }, index: number) => (
              <ProductListingCard
                key={account.publicKey.toString()}
                account={account.publicKey}
                onSelect={onSelect}
                isFirst={index === 0}
                isLast={index === accounts.data.length - 1}
                allListingsSelected={allListingsSelected}
              />
            )
          )}
        </div>
      ) : (
        <div className="text-start">
          <h3 className="text-lg mt-8 mb-2 font-semibold">
            My Product Listings
          </h3>
          <div className="mb-20 w-[100%] bg-background border-2 border-white rounded-lg p-4">
            <p className="text-sm font-normal">
              No Product Listings found. Create one above to get started.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const placementTypeMapping: { [key: string]: string } = {
  relatedpurchase: 'Related Purchase',
  digitalreplica: 'Digital Replica',
  targetedplacement: 'Targeted Placement',
};

const originMapping: { [key: string]: string } = {
  clickcrate: 'Clickcrate',
  shopify: 'Shopify',
  square: 'Square',
};

const productCategoryMapping: { [key: string]: string } = {
  clothing: 'Clothing',
  electronics: 'Electronics',
  books: 'Books',
  home: 'Home',
  beauty: 'Beauty',
  toys: 'Toys',
  sports: 'Sports',
  automotive: 'Automotive',
  grocery: 'Grocery',
  health: 'Health',
};

function getDisplayText(
  mapping: { [key: string]: string },
  value: unknown
): string {
  if (!value || typeof value !== 'object') {
    return 'NA';
  }
  const keys = Object.keys(value);
  if (keys.length === 0) {
    return 'NA';
  }
  return mapping[keys[0].toLowerCase()] || 'NA';
}

function ProductListingCard({
  account,
  onSelect,
  isFirst,
  isLast,
  allListingsSelected,
}: {
  account: PublicKey;
  onSelect: (account: PublicKey, selected: boolean) => void;
  isFirst: boolean;
  isLast: boolean;
  allListingsSelected: boolean;
}) {
  const { accountQuery } = useClickCrateListingProgramAccount({ account });

  const { publicKey } = useWallet();
  const [placementType, setPlacementType] = useState<PlacementTypee | null>(
    null
  );
  const [productCategory, setProductCategory] =
    useState<ProductCategoryy | null>(null);
  const [manager, setManager] = useState<PublicKey | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const isUpdateProductListingFormValid =
    placementType !== null && productCategory !== null && manager !== null;

  const toggleUpdateModal = () => {
    setShowUpdateModal(!showUpdateModal);
  };

  const [selected, setSelected] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSelected = e.target.checked;
    setSelected(isSelected);
    onSelect(account, isSelected);
  };

  useEffect(() => {
    setSelected(allListingsSelected);
  }, [allListingsSelected]);

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return accountQuery.isLoading ? (
    <div className="flex justify-center w-[100%] p-6">
      <span className="loading loading-spinner loading-md"></span>
    </div>
  ) : (
    <div
      className={`px-4 py-2 ${!isFirst ? 'border-t-2' : ''} ${
        !isLast ? 'border-b-2' : ''
      } border-quaternary`}
    >
      <div className="flex flex-row justify-start items-center w-[100%]">
        <div className="flex flex-row w-[5%]">
          <input
            type="checkbox"
            checked={selected}
            onChange={handleSelectChange}
            className="checkbox checkbox-xs bg-quaternary border-quaternary rounded-sm"
          />
        </div>
        <div className="flex flex-row w-[10%]">
          <p className="text-start font-extralight text-xs">
            <ExplorerLink
              path={`account/${account}`}
              label={ellipsify(account.toString())}
              className="font-extralight underline cursor-pointer"
            />
          </p>
        </div>
        <div className="flex flex-row w-[15%]">
          <p className="text-start font-extralight text-xs">
            <ExplorerLink
              label={ellipsify(accountQuery.data?.id.toBase58())}
              path={`mint/${accountQuery.data?.id}`}
              className="font-extralight underline cursor-pointer"
            />
          </p>
        </div>
        <div className="flex flex-row w-[10%]">
          <p className="text-start font-extralight text-xs">
            {accountQuery.data?.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className="flex flex-row w-[10%]">
          <p className="text-start font-extralight text-xs">
            {accountQuery.data?.productCategory
              ? getDisplayText(
                  productCategoryMapping,
                  accountQuery.data?.productCategory
                )
              : 'NA'}
          </p>
        </div>
        <div className="flex flex-row w-[10%]">
          <p className="text-start font-extralight text-xs">
            {accountQuery.data?.origin
              ? getDisplayText(originMapping, accountQuery.data?.origin)
              : 'NA'}
          </p>
        </div>
        <div className="flex flex-row w-[13%]">
          <p className="text-start font-extralight text-xs">
            {accountQuery.data?.placementType
              ? getDisplayText(
                  placementTypeMapping,
                  accountQuery.data?.placementType
                )
              : 'NA'}
          </p>
        </div>
        <div className="flex flex-row w-[10%] justify-end">
          <p className="text-end font-extralight text-xs">NA</p>
        </div>
        <div className="flex flex-row w-[10%] justify-end">
          <p className="text-end font-extralight text-xs">
            {accountQuery.data?.inStock !== undefined
              ? accountQuery.data?.inStock.toNumber()
              : 'NA'}
          </p>
        </div>
        <div className="flex flex-row w-[5%] ml-[2%]">
          <button
            className="btn btn-xs btn-mini w-full flex flex-row items-center justify-center m-0 p-0 gap-[0.25em]"
            onClick={toggleUpdateModal}
            style={{ fontSize: '12px', border: 'none' }}
            hidden={true}
          >
            <IconEdit className="m-0 p-0" size={12} />
            Edit
          </button>
          {showUpdateModal && (
            <ProductListingUpdateModal
              show={showUpdateModal}
              onClose={toggleUpdateModal}
              account={account}
              isUpdateProductListingFormValid={isUpdateProductListingFormValid}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProductListingUpdateModal({
  show,
  onClose,
  account,
  isUpdateProductListingFormValid,
}: {
  show: boolean;
  onClose: () => void;
  account: PublicKey;
  isUpdateProductListingFormValid: boolean;
}) {
  const { updateProductListing } = useClickCrateListingProgramAccount({
    account,
  });

  const { publicKey } = useWallet();
  const [placementType, setPlacementType] = useState<PlacementTypee | null>(
    null
  );
  const [productCategory, setProductCategory] =
    useState<ProductCategoryy | null>(null);
  const [manager, setManager] = useState<PublicKey | null>(null);

  const handleUpdateProductListing = () => {
    if (!manager || !placementType || !productCategory) {
      toast.error('All fields required');
    }
    if (publicKey && isUpdateProductListingFormValid) {
      updateProductListing.mutateAsync([
        placementType!,
        productCategory!,
        manager!,
      ]);
      onClose();
    }
  };

  return (
    <div
      className={`modal ${
        show ? 'modal-open' : ''
      } absolute top-0 left-0 right-0 bottom-0`}
    >
      <div className="modal-box bg-background p-6 flex flex-col border-2 border-white rounded-lg space-y-6 w-[92vw]">
        <div className="flex flex-row justify-between items-end">
          <h1 className="text-lg font-bold text-start">
            Update Product Listing
          </h1>
          <div className="flex flex-row justify-end items-end mb-[0.15em] p-0">
            <p className="text-start font-semibold tracking-wide text-xs">
              ID:{' '}
            </p>
            <p className="pl-2 text-start font-normal text-xs">
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
          </div>
        </div>

        <select
          value={placementType || ''}
          onChange={(e) => setPlacementType(e.target.value as PlacementTypee)}
          className="rounded-lg p-2 text-black"
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
        <input
          type="text"
          placeholder="Manager"
          onChange={(e) => setManager(new PublicKey(e.target.value))}
          className="rounded-lg p-2 text-black"
        />
        <div className="flex flex-row gap-[4%] py-2">
          <button
            className="btn btn-xs lg:btn-sm btn-outline w-[48%] py-3"
            onClick={onClose}
            disabled={updateProductListing.isPending}
          >
            Cancel
          </button>
          <button
            className="btn btn-xs lg:btn-sm btn-primary w-[48%] py-3"
            onClick={handleUpdateProductListing}
            disabled={updateProductListing.isPending}
          >
            {updateProductListing.isPending ? 'Updating...' : 'Update Listing'}
          </button>
        </div>
      </div>
    </div>
  );
}
