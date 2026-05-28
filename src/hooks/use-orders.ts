import { useState } from 'react';

import { MOCK_ONLINE_ORDERS } from '@/constants/mock-data';
import type { OnlineOrder, OnlineOrderStatus } from '@/types';

export function useOrders() {
  const [orders, setOrders] = useState<OnlineOrder[]>(MOCK_ONLINE_ORDERS);

  const acceptOrder = (id: string, estimatedMinutes: number) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === id ? { ...o, status: 'cooking' as OnlineOrderStatus, estimatedMinutes } : o,
      ),
    );
  };

  const completeOrder = (id: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === id ? { ...o, status: 'done' as OnlineOrderStatus } : o,
      ),
    );
  };

  const cancelOrder = (id: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === id ? { ...o, status: 'cancelled' as OnlineOrderStatus } : o,
      ),
    );
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const cookingOrders = orders.filter(o => o.status === 'cooking');
  const doneOrders = orders.filter(o => o.status === 'done' || o.status === 'cancelled');

  return {
    orders,
    pendingOrders,
    cookingOrders,
    doneOrders,
    acceptOrder,
    completeOrder,
    cancelOrder,
  };
}
