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
import toast from 'react-hot-toast';

export function ClickCratePosRegister({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
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
    <div
      className={`modal ${
        show ? 'modal-open' : ''
      } absolute top-0 left-0 right-0 bottom-0`}
    >
      <div className="modal-box bg-background p-6 flex flex-col border-2 border-white rounded-lg space-y-6 w-[92vw]">
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
}: {
  onSelect: (account: PublicKey, selected: boolean) => void;
}) {
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
    <div className={'space-y-6 mb-20 w-[100%]'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="space-y-4">
          {accounts.data?.map((account: { publicKey: PublicKey }) => (
            <ClickCratePosCard
              key={account.publicKey.toString()}
              account={account.publicKey}
              onSelect={onSelect}
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
function ClickCratePosCard({
  account,
  onSelect,
}: {
  account: PublicKey;
  onSelect: (account: PublicKey, selected: boolean) => void;
}) {
  const {
    accountQuery,
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
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const isUpdateClickCrateFormValid =
    placementType !== null && productCategory !== null && manager !== null;

  const isMakePurchaseFormValid = productId.trim() !== '';

  const toggleUpdateModal = () => {
    setShowUpdateModal(!showUpdateModal);
  };

  // const handleUpdateClickCrate = () => {
  //   if (publicKey && isUpdateClickCrateFormValid) {
  //     updateClickCrate.mutateAsync([
  //       account,
  //       manager,
  //       placementType!,
  //       productCategory!,
  //       manager!,
  //     ]);
  //   }
  // };

  const handleMakePurchase = () => {
    if (publicKey && isMakePurchaseFormValid) {
      makePurchase.mutateAsync({ productId: new PublicKey(productId) });
    }
  };

  const [selected, setSelected] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSelected = e.target.checked;
    setSelected(isSelected);
    onSelect(account, isSelected);
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="flex flex-col gap-y-8 w-[100%]">
      <div className="bg-background p-6 flex flex-col border-2 border-tertiary rounded-lg space-y-4 w-[92vw]">
        <div className="flex flex-row  justify-between items-center w-[100%]">
          <div className="flex flex-row">
            <input
              type="checkbox"
              checked={selected}
              onChange={handleSelectChange}
              className="checkbox checkbox-xs"
            />
          </div>
          {/* <div className="flex flex-row">
            <p className="text-start font-normal text-xs">IMG </p>
          </div> */}
          <div className="flex flex-row">
            <p className="text-start font-semibold text-xs">ID: </p>
            <p className="pl-2 text-start font-normal text-xs">
              <p>
                <ExplorerLink
                  path={`account/${account}`}
                  label={ellipsify(account.toString())}
                />
              </p>
            </p>
          </div>
          <div className="flex flex-row">
            <p className="text-start font-semibold text-xs">NAME: </p>
            <p className="pl-2 text-start font-normal text-xs">
              <p>
                <ExplorerLink
                  path={`account/${account}`}
                  label={ellipsify(account.toString())}
                />
              </p>
            </p>
          </div>
          <div className="flex flex-row">
            <p className="text-start font-normal text-xs">Status </p>
          </div>
          <div className="flex flex-row">
            <p className="text-start font-normal text-xs">Place Type(s) </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <p className="text-start font-normal text-xs">Product</p>
            <button
              className="btn btn-xs btn-mini"
              onClick={toggleUpdateModal}
              style={{ fontSize: '12px' }}
            >
              Purchase
            </button>
          </div>
          <div className="flex flex-row">
            <p className="text-start font-normal text-xs">Inventory </p>
          </div>

          <div className="flex flex-row">
            <button
              className="btn btn-xs btn-mini w-full"
              onClick={toggleUpdateModal}
              style={{ fontSize: '12px' }}
            >
              Update
            </button>
            {/* Update ClickCrate form */}
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
        <div className="flex flex-col gap-4 w-[100%]">
          <button
            className="btn btn-xs lg:btn-sm btn-primary w-full py-3"
            onClick={() => activateClickCrate.mutateAsync()}
            disabled={activateClickCrate.isPending}
          >
            Activate
          </button>
          <button
            className="btn btn-xs lg:btn-sm btn-primary w-full py-3"
            onClick={() => deactivateClickCrate.mutateAsync()}
            disabled={deactivateClickCrate.isPending}
          >
            Deactivate
          </button>
        </div>
        <div className="text-start space-y-4">
          {/* Make Purchase form */}
          <div className="flex flex-col gap-4 w-[100%]">
            <input
              type="text"
              placeholder="Product ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="rounded-lg p-2 text-black"
            />
            <button
              className="btn btn-xs btn-primary"
              onClick={handleMakePurchase}
              disabled={makePurchase.isPending || !isMakePurchaseFormValid}
            >
              Make Purchase {makePurchase.isPending && '...'}
            </button>
          </div>
        </div>
      </div>
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
  const [placementType, setPlacementType] = useState<PlacementTypee | null>(
    null
  );
  const [productCategory, setProductCategory] =
    useState<ProductCategoryy | null>(null);
  const [manager, setManager] = useState<PublicKey | null>(null);

  const handleUpdateClickCrate = () => {
    if (!manager || !placementType || !productCategory) {
      toast.error('All fields required');
    }
    if (publicKey && isUpdateClickCrateFormValid) {
      updateClickCrate.mutateAsync([
        account,
        manager!,
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
        <h1 className="text-lg font-bold text-start">Update ClickCrate POS</h1>
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
