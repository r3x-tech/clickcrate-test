// orders-data-access.ts

import {
  useMutation,
  useQuery,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'https://api.clickcrate.xyz/v1';

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

interface UpdateOrderStatusResponse {
  message: string;
  transaction: string;
}

export function useClickCrateOrders() {
  return useQuery<Order[], AxiosError>({
    queryKey: ['clickcrate-orders'],
    queryFn: async () => {
      const response = await axios.get<{ orders: Order[] }>(
        `${API_BASE_URL}/clickcrate/orders`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CC_API_KEY!}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.orders;
    },
  });
}

export function useUpdateOrderStatus() {
  return useMutation<
    UpdateOrderStatusResponse,
    AxiosError,
    { orderId: string; newStatus: Order['status'] }
  >({
    mutationFn: async ({ orderId, newStatus }) => {
      const response = await axios.put<UpdateOrderStatusResponse>(
        `${API_BASE_URL}/clickcrate/order/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CC_API_KEY!}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => toast.success('Order status updated successfully'),
    onError: (error: AxiosError) =>
      toast.error(`Failed to update order status: ${error.message}`),
  });
}
