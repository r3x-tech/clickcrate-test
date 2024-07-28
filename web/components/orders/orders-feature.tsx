'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero } from '../ui/ui-layout';
import { OrdersList } from './orders-ui';
import { useClickCrateOrders } from './orders-data-access';
import toast from 'react-hot-toast';

export default function ClickcrateOrdersFeature() {
  const { publicKey } = useWallet();
  const ordersQuery = useClickCrateOrders();

  useEffect(() => {
    if (ordersQuery.error) {
      toast.error(`Failed to fetch orders: ${ordersQuery.error.message}`);
    }
  }, [ordersQuery.error]);

  const handleRefresh = () => {
    ordersQuery.refetch();
  };

  return publicKey ? (
    <div>
      <AppHero title="" subtitle="">
        <OrdersList
          orders={ordersQuery.data}
          isLoading={ordersQuery.isLoading}
          onRefresh={handleRefresh}
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
