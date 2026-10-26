import { useCallback, useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { ordersApi, type ApiOrder } from '@/services/api';
import type { OnlineOrder, OnlineOrderStatus, DeliveryType } from '@/types';
import { addNotificationListener } from '@/services/notifications';

// ─── Adapter ──────────────────────────────────────────────────────────────────
function apiToAppOrder(o: ApiOrder): OnlineOrder {
  const statusMap: Record<string, OnlineOrderStatus> = {
    neu: 'pending', pending: 'pending',
    cooking: 'cooking', inProgress: 'cooking',
    done: 'done', delivered: 'done', completed: 'done',
    cancelled: 'cancelled',
  };

  const rawItems = (o.items && o.items.length > 0) ? o.items : ((o as any).cart || []);

  return {
    id: o.id,
    customerName: o.customerName ?? 'Khách',
    customerPhone: o.customerPhone ?? '',
    customerEmail: o.customerEmail,
    items: rawItems.map((i: any) => ({
      menuItemId: i.menuItemId ?? i.id ?? '',
      name: i.name || '',
      price: typeof i.price === 'string'
        ? parseFloat(i.price.replace('€', '').replace(/\s/g, '').replace(',', '.')) || 0
        : (i.price ?? 0),
      quantity: i.quantity ?? 1,
      note: i.note ?? i.notes ?? '',
      category: i.category || '',
    })),
    total: typeof o.total === 'string'
      ? parseFloat(o.total.replace('€', '').replace(/\s/g, '').replace(',', '.')) || 0
      : (o.total as any ?? 0),
    deliveryType: (o.method === 'delivery' ? 'delivery' : 'pickup') as DeliveryType,
    status: statusMap[o.status] ?? 'pending',
    address: o.address,
    note: o.notes,
    createdAt: o.createdAt,
    pickupDate: o.pickupDate || o.date,
    pickupTime: o.pickupTime || o.time,
    estimatedMinutes: o.estimatedMinutes,
  };
}

export function useOrders() {
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const knownOrderIds = useRef<Set<string>>(new Set());
  const isInitialFetch = useRef(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await ordersApi.getAll({ type: 'order' });
      const fetchedOrders = (res.items ?? []).map(apiToAppOrder);

      console.log(`[useOrders] 📦 Fetched ${fetchedOrders.length} orders.`);
      knownOrderIds.current = new Set(fetchedOrders.map(o => o.id));
      setOrders(fetchedOrders);
    } catch (e: any) {
      console.warn('[useOrders] fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ─── Real-time: Refresh khi nhận Push Notification ─────────────────────────
  useEffect(() => {
    const sub = addNotificationListener((notification) => {
      console.log('[useOrders] Push notification received, refreshing orders...');
      fetchOrders();
    });
    return () => { sub.remove(); };
  }, [fetchOrders]);

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const acceptOrder = async (id: string, estimatedMinutes: number) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cooking' as OnlineOrderStatus, estimatedMinutes } : o));
    DeviceEventEmitter.emit('orderStatusChanged', { id, status: 'cooking' });
    await ordersApi.updateStatus(id, 'cooking', undefined, estimatedMinutes).catch(console.warn);
  };

  const completeOrder = async (id: string, skipEmail?: boolean) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'done' as OnlineOrderStatus } : o));
    DeviceEventEmitter.emit('orderStatusChanged', { id, status: 'done' });
    await ordersApi.updateStatus(id, 'done', undefined, undefined, skipEmail).catch(console.warn);
  };

  const cancelOrder = async (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' as OnlineOrderStatus } : o));
    DeviceEventEmitter.emit('orderStatusChanged', { id, status: 'cancelled' });
    await ordersApi.updateStatus(id, 'cancelled').catch(console.warn);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const cookingOrders = orders.filter(o => o.status === 'cooking');
  const doneOrders = orders.filter(o => o.status === 'done' || o.status === 'cancelled');

  return {
    orders, loading,
    pendingOrders, cookingOrders, doneOrders,
    acceptOrder, completeOrder, cancelOrder,
    refresh: fetchOrders,
  };
}
