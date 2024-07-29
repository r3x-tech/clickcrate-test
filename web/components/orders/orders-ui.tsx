import { useUpdateOrderStatus, Order } from './orders-data-access';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import toast from 'react-hot-toast';
import { IconPackageExport, IconX } from '@tabler/icons-react';

export function OrdersList({
  orders,
  isLoading,
  error,
}: {
  orders?: Order[];
  isLoading: boolean;
  error: Error | null;
}) {
  const updateOrderStatus = useUpdateOrderStatus();

  if (isLoading) {
    return (
      <div className="flex justify-center w-[100%] p-6">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-20 w-[100%] bg-background border-2 border-white rounded-lg">
        <p className="text-sm font-light text-center p-4">
          Failed to fetch orders. Please try again.
        </p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="mb-20 w-[100%] bg-background border-2 border-white rounded-lg">
        <p className="text-sm font-light text-center p-4">
          No orders found. Place an order to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-background border-2 border-quaternary rounded-lg">
      <div className="flex flex-row justify-start items-center w-full px-4 pb-2 pt-2 border-b-2 border-quaternary">
        <div className="w-[15%]">
          <p className="text-start font-bold text-xs">ORDER ID</p>
        </div>
        <div className="w-[15%]">
          <p className="text-start font-bold text-xs">PRODUCT ID</p>
        </div>
        <div className="w-[15%]">
          <p className="text-start font-bold text-xs">BUYER ID</p>
        </div>
        <div className="w-[5%] text-right">
          <p className="font-bold text-xs">QUANTITY</p>
        </div>
        <div className="w-[15%] text-right">
          <p className="font-bold text-xs">TOTAL PRICE</p>
        </div>
        <div className="w-[7%] text-left ml-[8%]">
          <p className="font-bold text-xs">STATUS</p>
        </div>
        <div className="w-[20%] text-right"></div>
      </div>
      {orders.map((order, index) => (
        <div
          key={order.id}
          className={`flex flex-row justify-start items-center w-full px-4 py-2 ${
            index === orders.length - 1 ? '' : 'border-b-2'
          } border-quaternary `}
        >
          <div className="w-[15%] text-start">
            <ExplorerLink
              path={`tx/${order.id}`}
              label={ellipsify(order.id)}
              className="font-extralight text-xs underline"
            />
          </div>
          <div className="w-[15%] text-start">
            <ExplorerLink
              path={`address/${order.productId}`}
              label={ellipsify(order.productId)}
              className="font-extralight text-xs underline"
            />
          </div>
          <div className="w-[15%] text-start">
            <ExplorerLink
              path={`address/${order.buyerId}`}
              label={ellipsify(order.buyerId)}
              className="font-extralight text-xs underline"
            />
          </div>
          <div className="w-[5%] text-right">
            <p className="font-extralight text-xs">{order.quantity}</p>
          </div>
          <div className="w-[15%] text-right">
            <p className="font-extralight text-xs">{order.totalPrice} SOL</p>
          </div>
          <div className="w-[7%] text-left ml-[8%]">
            <p className="font-extralight text-xs">{order.status}</p>
          </div>
          <div className="flex flex-row w-[15%] ml-[5%]">
            <button
              className="btn btn-xs btn-mini w-[50%] flex flex-row items-center justify-center m-0 p-0 gap-[0.25em]"
              onClick={() => {
                updateOrderStatus.mutate(
                  { orderId: order.id, newStatus: 'Fulfilled' },
                  {
                    onError: (error) => {
                      toast.error(`Failed to fulfill order: ${error.message}`);
                    },
                  }
                );
              }}
              style={{ fontSize: '12px', border: 'none' }}
            >
              <IconPackageExport className="m-0 p-0" size={14} />
              Fulfill
            </button>
            <button
              className="btn btn-xs btn-mini w-[50%] flex flex-row items-center justify-center m-0 p-0 gap-[0.25em]"
              onClick={() => {
                updateOrderStatus.mutate(
                  { orderId: order.id, newStatus: 'Cancelled' },
                  {
                    onError: (error) => {
                      toast.error(`Failed to cancel order: ${error.message}`);
                    },
                  }
                );
              }}
              style={{ fontSize: '12px', border: 'none' }}
            >
              <IconX className="m-0 p-0" size={14} />
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
