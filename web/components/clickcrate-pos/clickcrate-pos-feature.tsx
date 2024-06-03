'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import {
  useActivateClickCrates,
  useDeactivateClickCrates,
} from './clickcrate-pos-data-access';
import { ClickCratePosList, ClickCratePosRegister } from './clickcrate-pos-ui';
import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { IconRefresh } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useClickCrateListingProgram } from '../product-listing/product-listing-data-access';

export default function ClickcratePosFeature() {
  const { publicKey } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const activateClickCrates = useActivateClickCrates();
  const deactivateClickCrates = useDeactivateClickCrates();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { programId } = useClickCrateListingProgram();

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const toggleActionsMenu = () => {
    setShowActionsMenu(!showActionsMenu);
  };

  const [selectedClickCrates, setSelectedClickCrates] = useState<PublicKey[]>(
    []
  );

  const handleClickCrateSelect = (account: PublicKey, selected: boolean) => {
    if (selected) {
      setSelectedClickCrates([...selectedClickCrates, account]);
    } else {
      setSelectedClickCrates(
        selectedClickCrates.filter((clickCrate) => !clickCrate.equals(account))
      );
    }
  };

  const handleActivate = () => {
    activateClickCrates.mutateAsync(selectedClickCrates);
    setShowActionsMenu(false);
  };

  const handleDeactivate = () => {
    deactivateClickCrates.mutateAsync(selectedClickCrates);
    setShowActionsMenu(false);
  };

  const handleRefetch = async () => {
    setIsRefreshing(true);
    const iconElement = document.querySelector('.refresh-icon');
    if (iconElement) {
      iconElement.classList.add('spin-animation');
      setTimeout(() => {
        iconElement.classList.remove('spin-animation');
        setIsRefreshing(false);
      }, 500);
      document.getElementById('refresh-clickcrates')?.click();
    } else {
      toast.error('Failed to refresh');
      setIsRefreshing(false);
    }
  };

  return publicKey ? (
    <div>
      <AppHero title="" subtitle="">
        <div className="flex flex-row items-end w-[100%] h-[3rem] mb-4">
          <div className="flex flex-row flex-1 justify-start items-end">
            <p className="text-start font-bold text-xl text-white tracking-wide">
              My ClickCrates (POS)
            </p>
            <button
              className="btn btn-ghost btn-sm ml-2 text-white bg-transparent hover:bg-transparent p-2"
              onClick={handleRefetch}
            >
              <IconRefresh
                size={21}
                className={`refresh-icon ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
          <div className="flex flex-row flex-1 justify-end items-start gap-4">
            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                className="btn btn-xs lg:btn-sm btn-outline w-[10rem] py-3 font-light"
                onClick={toggleActionsMenu}
              >
                More Actions
              </label>
              {showActionsMenu && (
                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-[10rem] mt-4 gap-2"
                  style={{ border: '2px solid white' }}
                >
                  <li>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={handleActivate}
                    >
                      Activate
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={handleDeactivate}
                    >
                      Deactivate
                    </button>
                  </li>
                </ul>
              )}
            </div>
            <div>
              <button
                className="btn btn-xs lg:btn-sm btn-primary py-3 w-[10rem]"
                onClick={toggleModal}
                disabled={false}
              >
                Register
              </button>
            </div>
          </div>
        </div>
        <ClickCratePosList onSelect={handleClickCrateSelect} />
      </AppHero>
      {showModal && (
        <ClickCratePosRegister show={showModal} onClose={toggleModal} />
      )}
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
