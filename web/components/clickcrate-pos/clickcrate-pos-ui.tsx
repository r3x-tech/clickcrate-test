/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useClickcratePosProgram,
  useClickcratePosProgramAccount,
} from './clickcrate-pos-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import { Origin, PlacementType, ProductCategory } from '@/types';
import { BN } from '@coral-xyz/anchor';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconLink,
  IconShoppingCartFilled,
} from '@tabler/icons-react';
import { useClickCrateListingProgramAccount } from '../product-listing/product-listing-data-access';
import { BlinkPreview } from '../blinks/BlinkPreview';

export function ClickCratePosRegister({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  const { registerClickCrate, programId } = useClickcratePosProgram();
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
      registerClickCrate.mutate([
        new PublicKey(clickcrateId),
        publicKey,
        clickcratePlacementType,
        clickcrateProductCategory!,
        publicKey,
      ]);
      onClose();
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
            Register ClickCrate
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
          placeholder="Collection ID (Core NFT Address)"
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
          <option value="Relatedpurchase">Related Purchase</option>
          <option value="Digitalreplica">Digital Replica</option>
          <option value="Targetedplacement">Targeted Placement</option>
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
        <div className="flex flex-row gap-[4%] py-2">
          <button
            className="btn btn-xs lg:btn-sm btn-outline w-[48%] py-3"
            onClick={onClose}
            disabled={registerClickCrate.isPending}
          >
            Cancel{' '}
          </button>
          <button
            className="btn btn-xs lg:btn-sm btn-primary w-[48%] py-3"
            onClick={handleClickcrateRegistration}
            disabled={registerClickCrate.isPending}
          >
            {registerClickCrate.isPending ? 'Registering...' : 'Register POS'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ClickCratePosList({
  onSelect,
  selectedClickCrates,
}: {
  onSelect: (account: PublicKey, selected: boolean) => void;
  selectedClickCrates: PublicKey[];
}) {
  const { publicKey } = useWallet();
  const { accounts, getProgramAccount } = useClickcratePosProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    if (accounts.isLoading) {
      setIsLoading(true);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [accounts.isLoading]);

  useEffect(() => {
    if (selectedClickCrates.length == 0) {
      setAllSelected(false);
    }
  }, [selectedClickCrates.length]);

  const handleRefetch = async () => {
    setIsLoading(true);
    await accounts.refetch();
    setIsLoading(false);
  };

  const handleAllSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSelected = e.target.checked;
    setAllSelected(isSelected);
    userAccounts?.forEach((account) => {
      onSelect(account.publicKey, isSelected);
    });
  };

  const userAccounts = accounts.data?.filter((account) =>
    account.account.owner.equals(publicKey!)
  );

  if (getProgramAccount.isLoading) {
    return (
      <div className="space-y-6 mb-20 w-[100%]">
        <div className="flex justify-centerw-[100%] p-6">
          <span className="loading loading-spinner loading-md"></span>
        </div>
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
      ) : userAccounts?.length !== undefined && userAccounts.length > 0 ? (
        <div className="w-[100%] bg-background border-2 border-quaternary rounded-lg">
          <button
            id="refresh-clickcrates"
            className="hidden"
            onClick={handleRefetch}
          >
            Refresh
          </button>
          <div className="flex flex-row justify-start items-center w-[100%] px-4 pb-2 pt-2 border-b-2 border-quaternary">
            <div className="flex flex-row w-[5%]">
              {/* <input
                type="checkbox"
                checked={allSelected}
                onChange={handleAllSelectChange}
                className="checkbox checkbox-xs bg-quaternary border-quaternary rounded-sm"
              /> */}
            </div>
            <div className="flex flex-row w-[10%]">
              <p className="text-start font-bold text-xs">ACCOUNT </p>
            </div>
            <div className="flex flex-row w-[10%]">
              <p className="text-start font-bold text-xs">ID </p>
            </div>
            <div className="flex flex-row w-[10%]">
              <p className="text-start font-bold text-xs">STATUS </p>
            </div>
            <div className="flex flex-row items-center w-[10%]">
              <p className="text-start font-bold text-xs">CATEGORY</p>
            </div>
            <div className="flex flex-row w-[15%]">
              <p className="text-start font-bold text-xs">PLACEMENT TYPE</p>
            </div>
            <div className="flex flex-row items-center w-[10%]">
              <p className="text-start font-bold text-xs">PRODUCT</p>
            </div>
            <div className="flex flex-row w-[10%] justify-end">
              <p className="text-end font-bold text-xs">INVENTORY </p>
            </div>
            <div className="flex flex-row w-[15%]"></div>
          </div>
          {userAccounts?.map(
            (account: { publicKey: PublicKey }, index: number) => (
              <ClickCratePosCard
                key={account.publicKey.toString()}
                account={account.publicKey}
                onSelect={onSelect}
                isFirst={index === 0}
                isLast={index === userAccounts.length - 1}
                allSelected={allSelected}
                isSelected={selectedClickCrates.some((clickcrate) =>
                  clickcrate.equals(account.publicKey)
                )}
              />
            )
          )}
        </div>
      ) : (
        <div>
          <div className="mb-20 w-[100%] bg-background border-2 border-quaternary rounded-lg">
            <p className="text-sm font-light text-center p-4">
              No ClickCrates found. Register one to get started!
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

function ClickCratePosCard({
  account,
  onSelect,
  isFirst,
  isLast,
  allSelected,
  isSelected,
}: {
  account: PublicKey;
  onSelect: (account: PublicKey, selected: boolean) => void;
  isFirst: boolean;
  isLast: boolean;
  allSelected: boolean;
  isSelected: boolean;
}) {
  const { accountQuery } = useClickcratePosProgramAccount({
    account,
  });

  const { publicKey } = useWallet();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showProductInfoModal, setShowProductInfoModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const isUpdateClickCrateFormValid =
    accountQuery.data?.eligiblePlacementType !== null &&
    accountQuery.data?.eligibleProductCategory !== null &&
    accountQuery.data?.manager !== null;

  const isMakePurchaseFormValid =
    accountQuery.data?.product !== null &&
    accountQuery.data?.product !== undefined;

  const isProductInfoFormValid =
    accountQuery.data?.product !== null &&
    accountQuery.data?.product !== undefined &&
    accountQuery.data?.id &&
    accountQuery.data?.id !== undefined;

  const isShareFormValid =
    accountQuery.data !== null && accountQuery.data !== undefined;

  const toggleUpdateModal = () => {
    setShowUpdateModal(!showUpdateModal);
  };

  const toggleProductInfoModal = () => {
    if (
      accountQuery.data?.isActive == undefined ||
      accountQuery.data?.isActive == false
    ) {
      toast.error('Clickcrate not active');
      return;
    }
    if (
      accountQuery.data?.product &&
      accountQuery.data?.product !== undefined &&
      accountQuery.data?.id &&
      accountQuery.data?.id !== undefined
    ) {
      setShowProductInfoModal(!showProductInfoModal);
    } else {
      toast.error('Product info not found');
    }
  };

  const togglePurchaseModal = () => {
    if (
      accountQuery.data?.isActive == undefined ||
      accountQuery.data?.isActive == false
    ) {
      toast.error('Clickcrate not active');
      return;
    }
    if (
      accountQuery.data?.product &&
      accountQuery.data?.product !== undefined
    ) {
      setShowPurchaseModal(!showPurchaseModal);
    } else {
      toast.error('No product to purchase');
    }
  };

  const toggleShareModal = () => {
    // if (
    //   accountQuery.data?.isActive == undefined ||
    //   accountQuery.data?.isActive == false
    // ) {
    //   toast.error('Clickcrate not active');
    //   return;
    // }
    setShowShareModal(!showShareModal);

    // if (
    //   accountQuery.data?.product &&
    //   accountQuery.data?.product !== undefined
    // ) {
    //   setShowShareModal(!showShareModal);
    // } else {
    //   toast.error('No product to purchase');
    // }
  };

  const [selected, setSelected] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSelected = e.target.checked;
    setSelected(isSelected);
    onSelect(account, isSelected);
  };

  useEffect(() => {
    setSelected(allSelected);
    accountQuery.refetch();
  }, [allSelected]);

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return accountQuery.isLoading ? (
    <div className="flex justify-center w-[100%] p-6">
      <span className="loading loading-spinner loading-md"></span>
    </div>
  ) : (
    <div>
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
          <div className="flex flex-row w-[10%]">
            <p className="text-start font-extralight text-xs">
              <ExplorerLink
                label={ellipsify(accountQuery.data?.id.toString())}
                path={`address/${accountQuery.data?.id}`}
                className="font-extralight underline cursor-pointer"
              />
            </p>
          </div>
          <div className="flex flex-row w-[10%]">
            <p className="text-start font-extralight text-xs">
              {' '}
              {accountQuery.data?.isActive ? 'Active' : 'Inactive'}{' '}
            </p>
          </div>
          <div className="flex flex-row w-[10%]">
            <p className="text-start font-extralight text-xs">
              {accountQuery.data?.eligibleProductCategory
                ? getDisplayText(
                    productCategoryMapping,
                    accountQuery.data?.eligibleProductCategory
                  )
                : 'NA'}
            </p>
          </div>
          <div className="flex flex-row w-[15%]">
            <p className="text-start font-extralight text-xs">
              {accountQuery.data?.eligiblePlacementType
                ? getDisplayText(
                    placementTypeMapping,
                    accountQuery.data?.eligiblePlacementType
                  )
                : 'NA'}
            </p>
          </div>
          <div className="flex flex-row w-[10%]">
            <p
              className={`text-start font-extralight text-xs  ${
                accountQuery.data?.product !== null && 'underline'
              }  ${accountQuery.data?.product !== null && 'cursor-pointer'}`}
              onClick={toggleProductInfoModal}
            >
              {accountQuery.data?.product
                ? ellipsify(accountQuery.data?.product?.toString())
                : 'None'}
            </p>
          </div>
          <div className="flex flex-row w-[10%] justify-end">
            <p className="text-end font-extralight text-xs">NA</p>
          </div>
          <div className="flex flex-row w-[17%] ml-[3%] justify-end">
            <button
              className="btn btn-xs btn-mini w-[33%] flex flex-row items-center justify-center m-0 p-0 gap-[0.25em]"
              onClick={toggleUpdateModal}
              style={{ fontSize: '12px', border: 'none' }}
            >
              <IconEdit className="m-0 p-0" size={12} />
              Edit
            </button>
            <button
              className="btn btn-xs btn-mini w-[33%] flex flex-row items-center justify-center m-0 p-0 gap-[0.25em]"
              onClick={togglePurchaseModal}
              style={{ fontSize: '12px', border: 'none' }}
            >
              <IconShoppingCartFilled className="m-0 p-0" size={12} />
              Buy
            </button>
            <button
              className="btn btn-xs btn-mini w-[33%] flex flex-row items-center justify-center m-0 p-0 gap-[0.25em]"
              onClick={toggleShareModal}
              style={{ fontSize: '12px', border: 'none' }}
            >
              <IconLink className="m-0 p-0" size={12} />
              Share
            </button>
            {showUpdateModal && (
              <ClickCratePosUpdateModal
                show={showUpdateModal}
                onClose={toggleUpdateModal}
                account={account}
                isUpdateClickCrateFormValid={isUpdateClickCrateFormValid}
              />
            )}
          </div>
        </div>
      </div>
      {/* && accountQuery.data?.product */}
      {showShareModal && accountQuery.data && (
        <ClickCratePosShareModal
          show={showShareModal}
          onClose={toggleShareModal}
          account={account}
          currentClickcrateId={accountQuery.data?.id}
          isShareFormValid={isShareFormValid}
        />
      )}
      {showPurchaseModal && accountQuery.data?.product && (
        <ClickCratePosPurchaseModal
          show={showPurchaseModal}
          onClose={togglePurchaseModal}
          account={account}
          currentClickcrateId={accountQuery.data?.id}
          currentProductId={accountQuery.data?.product}
          isMakePurchaseFormValid={isMakePurchaseFormValid}
        />
      )}
      {showProductInfoModal && accountQuery.data?.product && (
        <ClickCratePosProductInfoModal
          show={showProductInfoModal}
          onClose={toggleProductInfoModal}
          account={account}
          currentClickcrateId={accountQuery.data?.id}
          currentProductId={accountQuery.data?.product}
          isProductInfoFormValid={isProductInfoFormValid}
        />
      )}
    </div>
  );
}

function ClickCratePosUpdateModal({
  show,
  onClose,
  account,
  isUpdateClickCrateFormValid,
}: {
  show: boolean;
  onClose: () => void;
  account: PublicKey;
  isUpdateClickCrateFormValid: boolean;
}) {
  const { updateClickCrate } = useClickcratePosProgramAccount({ account });

  const { publicKey } = useWallet();
  const [placementType, setPlacementType] = useState<PlacementType | null>(
    null
  );
  const [productCategory, setProductCategory] =
    useState<ProductCategory | null>(null);
  const [manager, setManager] = useState<PublicKey | null>(null);

  const handleUpdateClickCrate = () => {
    if (
      manager === null ||
      placementType === null ||
      productCategory === null
    ) {
      toast.error('All fields required');
    } else if (publicKey && isUpdateClickCrateFormValid) {
      updateClickCrate.mutateAsync([
        account,
        placementType,
        productCategory,
        manager,
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
            Update ClickCrate POS
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
        <div className="flex flex-row gap-[4%] py-2">
          <button
            className="btn btn-xs lg:btn-sm btn-outline w-[48%] py-3"
            onClick={onClose}
            disabled={updateClickCrate.isPending}
          >
            Cancel
          </button>
          <button
            className="btn btn-xs lg:btn-sm btn-primary w-[48%] py-3"
            onClick={handleUpdateClickCrate}
            disabled={updateClickCrate.isPending}
          >
            {updateClickCrate.isPending ? 'Updating...' : 'Update ClickCrate'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClickCratePosPurchaseModal({
  show,
  onClose,
  account,
  currentClickcrateId,
  currentProductId,
  isMakePurchaseFormValid,
}: {
  show: boolean;
  onClose: () => void;
  account: PublicKey;
  currentClickcrateId: PublicKey;
  currentProductId: PublicKey;
  isMakePurchaseFormValid: boolean;
}) {
  const { makePurchase } = useClickcratePosProgramAccount({ account });
  const { accountQuery } = useClickCrateListingProgramAccount({
    account: currentProductId,
  });

  const { publicKey } = useWallet();

  const handleMakePurchase = () => {
    if (publicKey && isMakePurchaseFormValid) {
      makePurchase.mutateAsync({
        productListingId: currentProductId,
        clickcrateId: currentClickcrateId,
        productId: currentProductId,
        quantity: 1,
        currentBuyer: publicKey,
      });
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
          <h1 className="text-lg font-bold text-start">Make Purchase</h1>
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

          <div className="flex flex-row justify-end items-end mb-[0.15em] p-0">
            <p className="text-start font-semibold tracking-wide text-xs">
              Inventory:{' '}
            </p>
            <p className="pl-2 text-start font-normal text-xs">
              {accountQuery.data?.inStock
                ? `${accountQuery.data?.inStock}`
                : 'NA'}
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-[4%] py-2">
          <button
            className="btn btn-xs lg:btn-sm btn-outline w-[48%] py-3"
            onClick={onClose}
            disabled={makePurchase.isPending}
          >
            Cancel
          </button>
          <button
            className="btn btn-xs lg:btn-sm btn-primary w-[48%] py-3"
            onClick={handleMakePurchase}
            disabled={makePurchase.isPending || !isMakePurchaseFormValid}
          >
            {makePurchase.isPending ? 'Purchasing...' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClickCratePosProductInfoModal({
  show,
  onClose,
  account,
  currentClickcrateId,
  currentProductId,
  isProductInfoFormValid,
}: {
  show: boolean;
  onClose: () => void;
  account: PublicKey;
  currentClickcrateId: PublicKey;
  currentProductId: PublicKey;
  isProductInfoFormValid: boolean;
}) {
  const { removeProductListing } = useClickCrateListingProgramAccount({
    account,
  });

  const { publicKey } = useWallet();

  const handleRemoveProduct = () => {
    if (
      publicKey &&
      isProductInfoFormValid &&
      currentClickcrateId &&
      currentProductId
    ) {
      removeProductListing.mutateAsync({
        productListingId: currentProductId,
        clickcrateId: currentClickcrateId,
      });
      onClose();
    } else {
      toast.error('Failed to remove product');
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
          <h1 className="text-lg font-bold text-start">Product Info</h1>
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

        <div className="flex flex-row gap-[4%] py-2">
          <button
            className="btn btn-xs lg:btn-sm btn-outline w-[48%] py-3"
            onClick={onClose}
            disabled={removeProductListing.isPending}
          >
            Cancel
          </button>
          <button
            className="btn btn-xs lg:btn-sm btn-primary w-[48%] py-3"
            onClick={handleRemoveProduct}
            disabled={removeProductListing.isPending || !isProductInfoFormValid}
          >
            {removeProductListing.isPending ? 'Removing...' : 'Remove Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClickCratePosShareModal({
  show,
  onClose,
  account,
  currentClickcrateId,
  isShareFormValid,
}: {
  show: boolean;
  onClose: () => void;
  account: PublicKey;
  currentClickcrateId: PublicKey;
  isShareFormValid: boolean;
}) {
  const { makePurchase } = useClickcratePosProgramAccount({ account });
  // const { accountQuery } = useClickCrateListingProgramAccount({
  //   account: currentProductId,
  // });

  const { publicKey } = useWallet();
  const [blinkUrl, setBlinkUrl] = useState(
    `https://api.clickcrate.xyz/blink/${currentClickcrateId.toString()}`
  );
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerateBlink = () => {
    const url = `https://api.clickcrate.xyz/blink/${currentClickcrateId.toString()}`;
    setBlinkUrl(url);
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('Copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy blink link');
      });
  };

  const handleCopyEmbed = () => {
    if (publicKey) {
      // makePurchase.mutateAsync({
      //   productListingId: currentProductId,
      //   clickcrateId: currentClickcrateId,
      //   productId: currentProductId,
      //   quantity: 1,
      //   currentBuyer: publicKey,
      // });
      toast.success('Embed copied');
      onClose();
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div
      className={`modal ${
        show ? 'modal-open' : ''
      } absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center`}
    >
      <div className="modal-box bg-background p-6 flex flex-col border-2 border-white rounded-lg space-y-6 w-full max-w-md">
        <div className="flex flex-row justify-between items-end">
          <h1 className="text-lg font-bold text-start">Share ClickCrate</h1>
          <div className="flex flex-row justify-end items-end mb-[0.15em] p-0">
            <p className="text-start font-semibold tracking-wide text-xs">
              ClickCrate ID:{' '}
            </p>
            <p className="pl-2 text-start font-normal text-xs">
              <ExplorerLink
                path={`account/${currentClickcrateId}`}
                label={ellipsify(currentClickcrateId.toString())}
              />
            </p>
          </div>
        </div>
        {blinkUrl && (
          <div className="bg-quaternary p-2 rounded w-full">
            <p className="text-white text-sm break-all">{blinkUrl}</p>
          </div>
        )}
        <div
          className="flex items-center justify-end cursor-pointer"
          onClick={togglePreview}
        >
          <span className="mr-2 font-body text-xs font-bold">
            {showPreview ? 'CLOSE PREVIEW' : 'SHOW PREVIEW'}
          </span>
          {showPreview ? (
            <IconChevronDown size={20} />
          ) : (
            <IconChevronRight size={20} />
          )}
        </div>

        {showPreview && (
          <div className="blink-preview-container">
            <BlinkPreview clickcrateId={currentClickcrateId.toString()} />
          </div>
        )}

        {/* <div className="flex flex-row justify-end items-end mb-[0.15em] p-0">
            <p className="text-start font-semibold tracking-wide text-xs">
              Product:{' '}
            </p>
            <p className="pl-2 text-start font-normal text-xs">
              <ExplorerLink
                path={`account/${currentProductId}`}
                label={ellipsify(currentProductId.toString())}
              />
            </p>
          </div> */}

        {/* <div className="flex flex-row justify-end items-end mb-[0.15em] p-0">
            <p className="text-start font-semibold tracking-wide text-xs">
              Inventory:{' '}
            </p>
            <p className="pl-2 text-start font-normal text-xs">
              {accountQuery.data?.inStock
                ? `${accountQuery.data?.inStock}`
                : 'NA'}
            </p>
          </div> */}

        <div className="flex flex-row gap-4 mt-4">
          <button
            className="btn btn-xs lg:btn-sm btn-outline flex-1 py-3"
            onClick={onClose}
          >
            Cancel
          </button>
          {/* <button
            className="btn btn-xs lg:btn-sm btn-green w-[32%] py-3"
            onClick={handleCopyEmbed}
            disabled={makePurchase.isPending || true}
          >
            Copy Embed
          </button> */}
          <button
            className="btn btn-xs lg:btn-sm btn-primary flex-1 py-3"
            onClick={handleGenerateBlink}
          >
            Copy Blink
          </button>
        </div>
      </div>
    </div>
  );
}
