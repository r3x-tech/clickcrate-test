/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useClickCrateListingProgram,
  useClickCrateListingProgramAccount,
} from './product-listing-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import { Origin, PlacementType, ProductCategory } from '@/types';
import { BN } from '@coral-xyz/anchor';
import { IconEdit, IconBuildingStore } from '@tabler/icons-react';
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
    useState<PlacementType | null>(null);
  const [productCategory, setProductCategory] =
    useState<ProductCategory | null>(null);
  const [productOrderManager, setProductOrderManager] = useState<Origin | null>(
    null
  );

  const isProductFormValid =
    productId.trim() !== '' &&
    productOrigin !== null &&
    productPlacementType !== null &&
    productCategory !== null &&
    productOrderManager !== null;

  const handleProductRegistration = () => {
    if (publicKey && isProductFormValid) {
      registerProductListing.mutateAsync([
        new PublicKey(productId),
        publicKey,
        productOrigin,
        productPlacementType,
        productCategory,
        publicKey,
        productOrderManager,
      ]);
      onClose();
    } else {
      toast.error('Invalid input');
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
          placeholder="Product ID (Core NFT Address)"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="rounded-lg p-2 text-black"
        />

        {/* <input
          type="number"
          placeholder="Product Stock"
          value={productInStock === null ? '' : productInStock}
          onChange={(e) => {
            const value = e.target.value;
            setProductInStock(value === '' ? null : Number(value));
          }}
          className="rounded-lg p-2 text-black"
        /> */}
        <select
          value={productOrigin || ''}
          onChange={(e) => setProductOrigin(e.target.value as Origin)}
          className="rounded-lg p-2 text-black"
        >
          <option value="">Select an origin</option>
          <option value="Clickcrate">ClickCrate</option>
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
          <option value="Relatedpurchase">Related Purchase</option>
          <option value="Digitalreplica">Digital Replica</option>
          <option value="Targetedplacement">Targeted Placement</option>
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
        <select
          value={productOrderManager || ''}
          onChange={(e) => setProductOrderManager(e.target.value as Origin)}
          className="rounded-lg p-2 text-black"
        >
          <option value="">Select an order manager</option>
          <option value="Clickcrate">ClickCrate</option>
          <option value="Shopify">Shopify</option>
          <option value="Square">Square</option>
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
  selectedListings,
}: {
  onSelect: (account: PublicKey, selected: boolean) => void;
  selectedListings: PublicKey[];
}) {
  const { accounts, getProgramAccount } = useClickCrateListingProgram();
  const { publicKey } = useWallet();
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

  useEffect(() => {
    if (selectedListings.length == 0) {
      setAllListingsSelected(false);
    }
  }, [selectedListings.length]);

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
    userAccounts?.forEach((account) => {
      onSelect(account.publicKey, isSelected);
    });
  };

  const userAccounts = accounts.data?.filter((account) =>
    account.account.owner.equals(publicKey!)
  );

  return (
    <div className="space-y-6 mb-20 w-[100%]">
      {isLoading || getProgramAccount.isLoading ? (
        <div className="flex justify-center w-[100%] p-6">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : !getProgramAccount.data?.value ? (
        <div className="alert alert-info flex justify-center">
          <span>
            Program account not found. Ensure registry is deployed and you are
            on the correct cluster.
          </span>
        </div>
      ) : userAccounts?.length !== undefined && userAccounts.length > 0 ? (
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
              {/* <input
                type="checkbox"
                checked={allListingsSelected}
                onChange={handleAllListingsSelectChange}
                className="checkbox checkbox-xs bg-quaternary border-quaternary rounded-sm"
              /> */}
            </div>
            <div className="flex flex-row w-[10%]">
              <p className="text-start font-bold text-xs">ACCOUNT</p>
            </div>
            <div className="flex flex-row w-[10%]">
              <p className="text-start font-bold text-xs">ID</p>
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
              <p className="text-start font-bold text-xs">CURRENT PLACEMENT</p>
            </div>
            <div className="flex flex-row w-[10%] justify-end">
              <p className="text-end font-bold text-xs">UNIT PRICE </p>
            </div>
            <div className="flex flex-row w-[10%] justify-end">
              <p className="text-end font-bold text-xs">STOCK </p>
            </div>
            <div className="flex flex-row w-[10%]"></div>
          </div>

          {userAccounts?.map(
            (account: { publicKey: PublicKey }, index: number) => (
              <ProductListingCard
                key={account.publicKey.toString()}
                account={account.publicKey}
                onSelect={onSelect}
                isFirst={index === 0}
                isLast={index === userAccounts.length - 1}
                allListingsSelected={allListingsSelected}
                isSelected={selectedListings.some((listing) =>
                  listing.equals(account.publicKey)
                )}
              />
            )
          )}
        </div>
      ) : (
        <div>
          <div className="mb-20 w-[100%] bg-background border-2 border-quaternary rounded-lg">
            <p className="text-sm font-light text-center p-4">
              No Product Listings found. Register one to get started.
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
  isSelected,
}: {
  account: PublicKey;
  onSelect: (account: PublicKey, selected: boolean) => void;
  isFirst: boolean;
  isLast: boolean;
  allListingsSelected: boolean;
  isSelected: boolean;
}) {
  const { accountQuery } = useClickCrateListingProgramAccount({ account });

  const { publicKey } = useWallet();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);

  const isUpdateProductListingFormValid =
    accountQuery.data?.placementType !== null &&
    accountQuery.data?.productCategory !== null &&
    accountQuery.data?.manager !== null;

  const toggleUpdateModal = () => {
    setShowUpdateModal(!showUpdateModal);
  };

  const togglePlaceModal = () => {
    if (accountQuery.data?.isActive && accountQuery.data?.id) {
      setShowPlaceModal(!showPlaceModal);
    } else {
      toast.error('Product not active');
    }
  };

  const [selected, setListingSelected] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isListingSelected = e.target.checked;
    setListingSelected(isListingSelected);
    onSelect(account, isListingSelected);
  };

  useEffect(() => {
    setListingSelected(allListingsSelected);
    accountQuery.refetch();
  }, [allListingsSelected]);

  useEffect(() => {
    setListingSelected(isSelected);
    accountQuery.refetch();
  }, [isSelected]);

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return accountQuery.isLoading ? (
    <div className="flex justify-center w-[100%] p-6">
      <span className="loading loading-spinner loading-md"></span>
    </div>
  ) : (
    <div
      className={`px-4 py-2 ${!isLast ? 'border-b-2' : ''} border-quaternary`}
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
        <div className="flex flex-row w-[10%]">
          <p className="text-start font-extralight text-xs">
            <ExplorerLink
              label={ellipsify(accountQuery.data?.id.toBase58())}
              path={`address/${accountQuery.data?.id}`}
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
            {accountQuery.data?.clickcratePos ? (
              <ExplorerLink
                label={ellipsify(accountQuery.data?.clickcratePos.toBase58())}
                path={`address/${accountQuery.data?.clickcratePos}`}
                className="font-extralight underline cursor-pointer"
              />
            ) : (
              'Not placed'
            )}
          </p>
        </div>
        <div className="flex flex-row w-[10%] justify-end">
          <p className="text-end font-extralight text-xs">
            {accountQuery.data?.price !== undefined &&
            accountQuery.data?.clickcratePos !== null
              ? `${accountQuery.data?.price / LAMPORTS_PER_SOL} SOL`
              : 'NA'}
          </p>
        </div>
        <div className="flex flex-row w-[10%] justify-end">
          <p className="text-end font-extralight text-xs">
            {accountQuery.data?.inStock !== undefined
              ? accountQuery.data?.inStock.toNumber()
              : 'NA'}
          </p>
        </div>
        <div className="flex flex-row w-[10%] ml-[2%]">
          <button
            className="btn btn-xs btn-mini w-[50%] flex flex-row items-center justify-center m-0 p-0 gap-[0.25em]"
            onClick={toggleUpdateModal}
            style={{ fontSize: '12px', border: 'none' }}
            // hidden={true}
          >
            <IconEdit className="m-0 p-0" size={12} />
            Edit
          </button>

          <button
            className="btn btn-xs btn-mini w-[50%] flex flex-row items-center justify-center m-0 p-0 gap-[0.25em]"
            onClick={togglePlaceModal}
            style={{ fontSize: '12px', border: 'none' }}
            // hidden={true}
          >
            <IconBuildingStore className="m-0 p-0" size={12} />
            Place
          </button>

          {showPlaceModal && accountQuery.data?.id !== undefined && (
            <ProductListingPlaceModal
              show={showPlaceModal}
              onClose={togglePlaceModal}
              account={account}
              currentProductId={accountQuery.data?.id}
              isPlaceFormValid={accountQuery.data?.isActive}
            />
          )}
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
  const [placementType, setPlacementType] = useState<PlacementType | null>(
    null
  );
  const [productCategory, setProductCategory] =
    useState<ProductCategory | null>(null);
  const [manager, setManager] = useState<PublicKey | null>(null);
  const [price, setPrice] = useState<string>('');

  const handleUpdateProductListing = () => {
    if (
      manager === null ||
      placementType === null ||
      productCategory === null ||
      price === ''
    ) {
      toast.error('All fields required');
    } else if (publicKey && isUpdateProductListingFormValid) {
      const priceInLamports = new BN(parseFloat(price) * LAMPORTS_PER_SOL);
      updateProductListing.mutateAsync([
        account,
        placementType,
        productCategory,
        manager,
        priceInLamports,
      ]);
      onClose();
    } else {
      toast.error('Update unavailable');
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
          onChange={(e) => setPlacementType(e.target.value as PlacementType)}
          className="rounded-lg p-2 text-black"
        >
          <option value="">Select a placement type</option>
          <option value="Relatedpurchase">Related Purchase</option>
          <option value="Digitalreplica">Digital Replica</option>
          <option value="Targetedplacement">Targeted Placement</option>
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
        <input
          type="text"
          placeholder="Manager"
          onChange={(e) => setManager(new PublicKey(e.target.value))}
          className="rounded-lg p-2 text-black"
        />
        <input
          type="number"
          step="0.000000001"
          min="0"
          placeholder="Price in SOL"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
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

function ProductListingPlaceModal({
  show,
  onClose,
  account,
  currentProductId,
  isPlaceFormValid,
}: {
  show: boolean;
  onClose: () => void;
  account: PublicKey;
  currentProductId: PublicKey;
  isPlaceFormValid: boolean;
}) {
  const { placeProductListing, removeProductListing, closeAllOracles } =
    useClickCrateListingProgramAccount({
      account,
    });

  const { publicKey } = useWallet();
  const [clickcrateId, setClickCrateId] = useState('');
  const [unitPriceInSol, setUnitPriceInSol] = useState<number | null>(null);

  const handlePlaceProduct = () => {
    if (publicKey && isPlaceFormValid && unitPriceInSol !== null) {
      placeProductListing.mutateAsync({
        productListingId: currentProductId,
        clickcrateId: new PublicKey(clickcrateId),
        price: new BN(unitPriceInSol * LAMPORTS_PER_SOL),
      });
      onClose();
    }
  };

  // const handleRemove = () => {
  //   if (publicKey) {
  //     removeProductListing.mutateAsync({
  //       productListingId: new PublicKey(
  //         '8XivL6fHZHcukd52Ve4qUtGFYmPSrpujFCyMgcRw1Yb7'
  //       ),
  //       clickcrateId: new PublicKey(
  //         'C5f6HTRH4zVtK72tNp3n9VdrQccyqKAtGXY9pWPB8pSs'
  //       ),
  //     });
  //     onClose();
  //   }
  // };

  const handleRemoveOracles = async () => {
    if (publicKey) {
      try {
        await closeAllOracles.mutateAsync(currentProductId);
        onClose();
      } catch (error) {
        console.error('Failed to remove oracles:', error);
        toast.error('Failed to remove oracles');
      }
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
            Place Listing in Clickcrate
          </h1>
          <div className="flex flex-row justify-end items-end mb-[0.15em] p-0">
            <p className="text-start font-semibold tracking-wide text-xs">
              Product:{' '}
            </p>
            <p className="pl-2 text-start font-normal text-xs">
              <ExplorerLink
                path={`account/${currentProductId}`}
                label={ellipsify(currentProductId.toString())}
              />
            </p>
          </div>
        </div>

        <input
          type="text"
          placeholder="ClickCrate ID"
          value={clickcrateId}
          onChange={(e) => setClickCrateId(e.target.value)}
          className="rounded-lg p-2 text-black"
        />

        <input
          id="unitPrice"
          type="number"
          placeholder="Unit Price (in SOL)"
          value={unitPriceInSol === null ? '' : unitPriceInSol}
          onChange={(e) => {
            const value = e.target.value;
            setUnitPriceInSol(value === '' ? null : Number(value));
          }}
          className="rounded-lg p-2 text-black"
        />

        <div className="flex flex-row gap-[4%] py-2">
          <button
            className="btn btn-xs lg:btn-sm btn-outline w-[48%] py-3"
            onClick={onClose}
            disabled={placeProductListing.isPending}
          >
            Cancel
          </button>
          {/* <button
            className="btn btn-xs lg:btn-sm btn-outline w-[48%] py-3"
            onClick={handleRemoveOracles}
            disabled={closeAllOracles.isPending}
          >
            {closeAllOracles.isPending ? 'Removing...' : 'Remove Oracles'}
          </button> */}
          <button
            className="btn btn-xs lg:btn-sm btn-primary w-[48%] py-3"
            onClick={handlePlaceProduct}
            disabled={placeProductListing.isPending || !isPlaceFormValid}
          >
            {placeProductListing.isPending ? 'Placing...' : 'Place'}
          </button>
        </div>
      </div>
    </div>
  );
}
