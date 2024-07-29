'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero } from '../ui/ui-layout';
import { OrdersList } from './orders-ui';
import { useClickCrateOrders } from './orders-data-access';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IconCaretDownFilled, IconRefresh } from '@tabler/icons-react';

export default function ClickcrateOrdersFeature() {
  const { publicKey } = useWallet();
  const ordersQuery = useClickCrateOrders();
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ordersQuery.error) {
      toast.error(`Failed to fetch orders: ${ordersQuery.error.message}`);
    }
  }, [ordersQuery.error]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await ordersQuery.refetch();
    setIsRefreshing(false);
  };

  const toggleActionsMenu = () => {
    setShowActionsMenu(!showActionsMenu);
  };

  const closeActionsMenu = () => {
    setShowActionsMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeActionsMenu();
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  return publicKey ? (
    <div>
      <AppHero title="" subtitle="">
        <div className="flex flex-row items-end w-[100%] h-[3rem] mb-4">
          <div className="flex flex-row flex-1 justify-start items-end">
            <p className="text-start font-bold text-xl text-white tracking-wide">
              My Orders
            </p>
            <button
              className="btn btn-ghost btn-sm ml-2 text-white bg-transparent hover:bg-transparent p-2"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <IconRefresh
                size={21}
                className={`refresh-icon ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
          <div className="flex flex-row flex-1 justify-end items-start gap-4">
            <div className="dropdown dropdown-end" ref={dropdownRef}>
              <label
                tabIndex={0}
                className="btn btn-xs lg:btn-sm btn-outline w-[10rem] py-3 font-light"
                onClick={toggleActionsMenu}
              >
                More Actions
                <IconCaretDownFilled
                  className={`m-0 p-0 ${showActionsMenu ? 'icon-flip' : ''}`}
                  size={12}
                />
              </label>
              {showActionsMenu && (
                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-[10rem] mt-4 gap-2"
                  style={{ border: '2px solid white' }}
                >
                  <li>
                    <button className="btn btn-sm btn-ghost hover:bg-quaternary">
                      Fulfill
                    </button>
                  </li>
                  {/* Add more actions as needed */}
                </ul>
              )}
            </div>
          </div>
        </div>
        <OrdersList
          orders={ordersQuery.data}
          isLoading={ordersQuery.isLoading}
          error={ordersQuery.error}
        />
      </AppHero>
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
