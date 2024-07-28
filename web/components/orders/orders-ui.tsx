// orders-ui.tsx

import { useUpdateOrderStatus } from './orders-data-access';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { IconCaretDownFilled, IconRefresh } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

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
  onRefresh,
}: {
  orders?: Order[];
  isLoading: boolean;
  onRefresh: () => void;
}) {
  const updateOrderStatus = useUpdateOrderStatus();
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center w-[100%] p-6">
        <span className="loading loading-spinner loading-md"></span>
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
    <div className="space-y-6 mb-20 w-[100%]">
      <div className="flex flex-row items-end w-[100%] h-[3rem] mb-4">
        <div className="flex flex-row flex-1 justify-start items-end">
          <p className="text-start font-bold text-xl text-white tracking-wide">
            My Orders
          </p>
          <button
            className="btn btn-ghost btn-sm ml-2 text-white bg-transparent hover:bg-transparent p-2"
            onClick={onRefresh}
          >
            <IconRefresh size={21} className="refresh-icon" />
          </button>
        </div>
        <div className="flex flex-row flex-1 justify-end items-start gap-4">
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-xs lg:btn-sm btn-outline w-[10rem] py-3 font-light"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
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
              <ExplorerLink
                path={`tx/${order.id}`}
                label={ellipsify(order.id)}
              />
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
              <p className="text-start font-extralight text-xs">
                {order.status}
              </p>
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
    </div>
  );
}
