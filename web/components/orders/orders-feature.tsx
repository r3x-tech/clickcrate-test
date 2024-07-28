// orders-feature.tsx

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
  const [productListingId, setProductListingId] = useState('');
  const ordersQuery = useClickCrateOrders(productListingId);

  useEffect(() => {
    if (ordersQuery.error) {
      toast.error(`Failed to fetch orders: ${ordersQuery.error.message}`);
    }
  }, [ordersQuery.error]);

  const handleProductListingIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productListingId) {
      ordersQuery.refetch();
    }
  };

  const isSubmitDisabled = !productListingId || ordersQuery.isFetching;

  return publicKey ? (
    <div>
      <AppHero title="ClickCrate Orders" subtitle="Manage your incoming orders">
        <form
          onSubmit={handleProductListingIdSubmit}
          className="flex flex-row items-end w-full mb-4"
        >
          <input
            type="text"
            value={productListingId}
            onChange={(e) => setProductListingId(e.target.value)}
            placeholder="Enter Product Listing ID"
            className="input input-bordered flex-grow mr-2"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitDisabled}
          >
            {ordersQuery.isFetching ? 'Fetching...' : 'Fetch Orders'}
          </button>
        </form>
        {!productListingId && (
          <div className="alert alert-info">
            <span>Enter a Product Listing ID to fetch orders.</span>
          </div>
        )}
        {productListingId && (
          <OrdersList
            orders={ordersQuery.data ?? []}
            isLoading={ordersQuery.isLoading}
          />
        )}
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
