import { useCallback, useEffect, useState } from 'react';
import { historyApi, type ApiOrder } from '@/services/api';
import type { OrderHistoryItem, OrderItem, PaymentMethod } from '@/types';

function parseAmount(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val).replace('€', '').replace(/\s/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function apiToHistoryItem(o: ApiOrder): OrderHistoryItem {
  const rawItems = (o.items && o.items.length > 0) ? o.items : ((o as any).cart || []);

  const items: OrderItem[] = rawItems.map((i: any) => ({
    menuItemId: i.menuItemId ?? i.id ?? '',
    name: i.name || '',
    price: parseAmount(i.price),
    quantity: Number(i.quantity) || 1,
    note: i.note ?? i.notes ?? '',
    category: i.category || '',
  }));

  const method = (o.method === 'dine-in' ? 'dine-in' : o.method === 'delivery' ? 'delivery' : 'pickup');
  const validPaymentMethod = (o.paymentMethod === 'card' || o.paymentMethod === 'qr' || o.paymentMethod === 'ewallet' || o.paymentMethod === 'cash')
    ? o.paymentMethod as PaymentMethod
    : 'cash';

  const guestsCount = Number(o.guests ?? o.persons ?? (method === 'dine-in' ? 2 : 1)) || 1;

  return {
    id: o.id,
    type: o.type,
    method,
    tableId: o.tableId,
    tableName: o.tableName || (o.tableId ? `Bàn ${o.tableId}` : undefined),
    customerName: o.customerName || (o.tableName ? o.tableName : 'Khách vãng lai'),
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail,
    guests: guestsCount,
    persons: guestsCount,
    items,
    total: parseAmount(o.total),
    paymentMethod: validPaymentMethod,
    status: o.status,
    address: o.address,
    notes: o.notes,
    createdAt: o.createdAt,
    completedAt: o.completedAt || o.updatedAt || o.createdAt,
  };
}

export function useHistory() {
  const [history, setHistory] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await historyApi.getAll({ limit: 150 });
      const items = (res.items || []).map(apiToHistoryItem);
      setHistory(items);
    } catch (err: any) {
      console.warn('[useHistory] fetch error:', err?.message || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const dineInHistory = history.filter(h => h.method === 'dine-in');
  const onlineHistory = history.filter(h => h.method !== 'dine-in');

  // Thống kê nhanh
  const totalRevenue = history.reduce((sum, h) => sum + h.total, 0);
  const totalGuests = history.reduce((sum, h) => sum + (h.guests || 1), 0);
  const totalOrders = history.length;

  return {
    history,
    dineInHistory,
    onlineHistory,
    loading,
    refreshing,
    refresh: () => fetchHistory(true),
    totalRevenue,
    totalGuests,
    totalOrders,
  };
}

