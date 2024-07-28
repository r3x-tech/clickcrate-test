// orders-ui.tsx

import { useUpdateOrderStatus } from './orders-data-access';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { IconRefresh } from '@tabler/icons-react';
import toast from 'react-hot-toast';

interface Order {
  productId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  orderManager: 'clickcrate' | 'shopify' | 'square';
  id: string;
  creatorId: string;
  status:
    | 'Pending'
    | 'Placed'
    | 'Confirmed'
    | 'Fulfilled'
    | 'Delivered'
    | 'Completed'
    | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export function OrdersList({
  orders,
  isLoading,
}: {
  orders?: Order[];
  isLoading: boolean;
}) {
  const updateOrderStatus = useUpdateOrderStatus();

  if (isLoading) {
    return (
      <div className="flex justify-center w-[100%] p-6">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="alert alert-info">
        <span>No orders found for this product listing.</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-background border-2 border-quaternary rounded-lg">
      <div className="flex flex-row justify-start items-center w-full px-4 pb-2 pt-2 border-b-2 border-quaternary">
        <div className="w-1/6">
          <p className="text-start font-bold text-xs">ORDER ID</p>
        </div>
        <div className="w-1/6">
          <p className="text-start font-bold text-xs">PRODUCT ID</p>
        </div>
        <div className="w-1/6">
          <p className="text-start font-bold text-xs">BUYER ID</p>
        </div>
        <div className="w-1/12">
          <p className="text-start font-bold text-xs">QUANTITY</p>
        </div>
        <div className="w-1/12">
          <p className="text-start font-bold text-xs">TOTAL PRICE</p>
        </div>
        <div className="w-1/6">
          <p className="text-start font-bold text-xs">STATUS</p>
        </div>
        <div className="w-1/6">
          <p className="text-start font-bold text-xs">ACTIONS</p>
        </div>
      </div>
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex flex-row justify-start items-center w-full px-4 py-2 border-b border-quaternary"
        >
          <div className="w-1/6">
            <ExplorerLink path={`tx/${order.id}`} label={ellipsify(order.id)} />
          </div>
          <div className="w-1/6">
            <ExplorerLink
              path={`address/${order.productId}`}
              label={ellipsify(order.productId)}
            />
          </div>
          <div className="w-1/6">
            <ExplorerLink
              path={`address/${order.buyerId}`}
              label={ellipsify(order.buyerId)}
            />
          </div>
          <div className="w-1/12">
            <p className="text-start font-extralight text-xs">
              {order.quantity}
            </p>
          </div>
          <div className="w-1/12">
            <p className="text-start font-extralight text-xs">
              {order.totalPrice} SOL
            </p>
          </div>
          <div className="w-1/6">
            <p className="text-start font-extralight text-xs">{order.status}</p>
          </div>
          <div className="w-1/6">
            <select
              className="select select-bordered select-xs w-full max-w-xs"
              value={order.status}
              onChange={(e) => {
                const newStatus = e.target.value as Order['status'];
                updateOrderStatus.mutate(
                  { orderId: order.id, newStatus },
                  {
                    onError: (error) => {
                      toast.error(
                        `Failed to update order status: ${error.message}`
                      );
                    },
                  }
                );
              }}
            >
              <option value="Pending">Pending</option>
              <option value="Placed">Placed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
