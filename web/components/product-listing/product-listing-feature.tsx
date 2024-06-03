'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useActivateProductListings,
  useClickCrateListingProgram,
  useDeactivateProductListings,
} from './product-listing-data-access';
import {
  ProductListingsList,
  ProductListingRegister,
} from './product-listing-ui';
import { useEffect, useRef, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { IconCaretDownFilled, IconRefresh } from '@tabler/icons-react';

export default function ClickcrateTestFeature() {
  const { publicKey } = useWallet();
  const [showRegisterListingModal, setShowRegisterListingModal] =
    useState(false);
  const [showListingActionsMenu, setShowListingActionsMenu] = useState(false);
  const activateProductListings = useActivateProductListings();
  const deactivateProductListings = useDeactivateProductListings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProductListings, setSelectedProductListings] = useState<
    PublicKey[]
  >([]);
  const dropdownListingRef = useRef<HTMLDivElement>(null);

  const toggleListingModal = () => {
    setShowRegisterListingModal(!showRegisterListingModal);
  };

  const toggleActionsMenu = () => {
    setShowListingActionsMenu(!showListingActionsMenu);
  };

  const closeActionsMenu = () => {
    setShowListingActionsMenu(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownListingRef.current &&
      !dropdownListingRef.current.contains(event.target as Node)
    ) {
      closeActionsMenu();
    }
  };

  useEffect(() => {
    if (showListingActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showListingActionsMenu]);

  const handleListingSelect = (account: PublicKey, selected: boolean) => {
    if (selected) {
      setSelectedProductListings([...selectedProductListings, account]);
    } else {
      setSelectedProductListings(
        selectedProductListings.filter(
          (productListing) => !productListing.equals(account)
        )
      );
    }
  };

  const handleActivateListings = () => {
    if (selectedProductListings.length > 0) {
      activateProductListings.mutateAsync(selectedProductListings);
    } else {
      toast.error('No ClickCrate(s) selected');
    }
    setShowListingActionsMenu(false);
  };

  const handleDeactivateListings = () => {
    if (selectedProductListings.length > 0) {
      deactivateProductListings.mutateAsync(selectedProductListings);
    } else {
      toast.error('No ClickCrate(s) selected');
    }
    setShowListingActionsMenu(false);
  };

  const handleListingRefetch = async () => {
    setIsRefreshing(true);
    const iconElement = document.querySelector('.refresh-icon');
    if (iconElement) {
      iconElement.classList.add('spin-animation');
      setTimeout(() => {
        iconElement.classList.remove('spin-animation');
        setIsRefreshing(false);
      }, 500);
      document.getElementById('refresh-listings')?.click();
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
              My Product Listings
            </p>
            <button
              className="btn btn-ghost btn-sm ml-2 text-white bg-transparent hover:bg-transparent p-2"
              onClick={handleListingRefetch}
            >
              <IconRefresh
                size={21}
                className={`refresh-icon ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
          <div className="flex flex-row flex-1 justify-end items-start gap-4">
            <div className="dropdown dropdown-end" ref={dropdownListingRef}>
              <label
                tabIndex={0}
                className="btn btn-xs lg:btn-sm btn-outline w-[10rem] py-3 font-light"
                onClick={toggleActionsMenu}
              >
                More Actions
                <IconCaretDownFilled
                  className={`m-0 p-0 ${
                    showListingActionsMenu ? 'icon-flip' : ''
                  }`}
                  size={12}
                />
              </label>
              {showListingActionsMenu && (
                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-[10rem] mt-4 gap-2"
                  style={{ border: '2px solid white' }}
                >
                  <li>
                    <button
                      className="btn btn-sm btn-ghost hover:bg-quaternary"
                      onClick={handleActivateListings}
                    >
                      Activate
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn btn-sm btn-ghost hover:bg-quaternary"
                      onClick={handleDeactivateListings}
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
                onClick={toggleListingModal}
                disabled={false}
              >
                Register
              </button>
            </div>
          </div>
        </div>
        <ProductListingsList onSelect={handleListingSelect} />
      </AppHero>
      {showRegisterListingModal && (
        <ProductListingRegister
          show={showRegisterListingModal}
          onClose={toggleListingModal}
        />
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
