import { useCallback, useEffect, useRef, useState } from 'react';
import { tablesApi, type ApiTable } from '@/services/api';
import type { MenuItem, OrderItem, Table, TableStatus } from '@/types';
import { addNotificationListener } from '@/services/notifications';

// ─── Adapter: ApiTable → App Table ───────────────────────────────────────────
function apiToAppTable(t: ApiTable): Table {
  // Lấy số bàn hiển thị từ name (bỏ prefix "Bàn ") hoặc dùng nguyên
  const displayNumber = t.name?.startsWith('Bàn ') ? t.name.slice(4) : (t.name || t.id);
  return {
    id: t.id,
    number: displayNumber,
    zone: t.zone,
    capacity: t.capacity ?? 4,
    status: t.status as TableStatus,
    occupiedAt: t.occupiedAt,
    reservedFor: t.reservedFor,
    reservedTime: t.reservedTime,
    currentOrder:
      t.orderItems && t.orderItems.length > 0
        ? {
            id: `ord-${t.id}`,
            tableId: t.id,
            items: t.orderItems.map((i) => ({
              menuItemId: i.menuItemId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              note: i.note,
              category: i.category as any,
            })),
            createdAt: t.occupiedAt ?? new Date().toISOString(),
            status: 'cooking',
          }
        : undefined,
  };
}

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch from API ─────────────────────────────────────────────────────────
  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tablesApi.getAll();
      setTables(data.map(apiToAppTable));
    } catch (e: any) {
      setError(e.message);
      console.warn('[useTables] fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // ─── Real-time: Refresh on Push Notification ───────────────────────────────
  useEffect(() => {
    const sub = addNotificationListener((notification) => {
      console.log('[useTables] Push notification received, refreshing tables...');
      fetchTables();
    });
    return () => { sub.remove(); };
  }, [fetchTables]);
  // ─── Optimistic update helper ────────────────────────────────────────────────
  const patchTable = (id: string, patch: Partial<ApiTable>) => {
    tablesApi.update(id, patch).then(() => fetchTables()).catch(console.warn);
  };

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const openTable = (tableId: string) => {
    setTables(prev =>
      prev.map(t =>
        t.id === tableId
          ? { ...t, status: 'occupied' as TableStatus, occupiedAt: new Date().toISOString(), currentOrder: { id: `ord-${tableId}-${Date.now()}`, tableId, items: [], createdAt: new Date().toISOString(), status: 'ordering' } }
          : t,
      ),
    );
    patchTable(tableId, { status: 'occupied', occupiedAt: new Date().toISOString(), orderItems: [] });
  };

  const addItemsToTable = (
    tableId: string,
    itemsToAdd: { item: MenuItem; quantity: number; note?: string }[],
    openTableIfEmpty = false
  ) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id !== tableId) return t;

        const isCurrentlyEmpty = t.status === 'empty';
        const shouldOpen = openTableIfEmpty && isCurrentlyEmpty;

        // Calculate new status and occupiedAt
        const status = shouldOpen ? ('occupied' as TableStatus) : t.status;
        const occupiedAt = shouldOpen ? new Date().toISOString() : t.occupiedAt;

        // Get or initialize currentOrder
        const currentOrder = (shouldOpen || !t.currentOrder)
          ? {
              id: `ord-${tableId}-${Date.now()}`,
              tableId,
              items: [],
              createdAt: occupiedAt || new Date().toISOString(),
              status: 'ordering' as const
            }
          : t.currentOrder;

        // Accumulate items
        const newItems = [...currentOrder.items];
        itemsToAdd.forEach(({ item: menuItem, quantity, note }) => {
          const existingIdx = newItems.findIndex(i => i.menuItemId === menuItem.id);
          if (existingIdx >= 0) {
            newItems[existingIdx] = {
              ...newItems[existingIdx],
              quantity: newItems[existingIdx].quantity + quantity,
              note: note ?? newItems[existingIdx].note,
            };
          } else {
            newItems.push({
              menuItemId: menuItem.id,
              name: menuItem.name,
              price: menuItem.price,
              quantity,
              note,
              category: menuItem.category as any,
            });
          }
        });

        const updatedOrder = { ...currentOrder, items: newItems };
        const updatedTable = { ...t, status, occupiedAt, currentOrder: updatedOrder };

        // Sync to API in a single update!
        const patch: Partial<ApiTable> = {
          orderItems: newItems.map(i => ({
            menuItemId: i.menuItemId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            note: i.note,
            category: i.category,
          })),
        };

        if (shouldOpen) {
          patch.status = 'occupied';
          patch.occupiedAt = occupiedAt;
        }

        tablesApi.update(t.id, patch).then(() => fetchTables()).catch(console.warn);

        return updatedTable;
      }),
    );
  };

  const removeItemFromTable = (tableId: string, menuItemId: string) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id !== tableId || !t.currentOrder) return t;
        const newItems = t.currentOrder.items.filter(i => i.menuItemId !== menuItemId);
        tablesApi.update(t.id, { orderItems: newItems.map(i => ({ menuItemId: i.menuItemId, name: i.name, price: i.price, quantity: i.quantity, note: i.note, category: i.category })) }).catch(console.warn);
        return { ...t, currentOrder: { ...t.currentOrder, items: newItems } };
      }),
    );
  };

  const closeTable = (tableId: string) => {
    setTables(prev =>
      prev.map(t => t.id === tableId ? { ...t, status: 'empty' as TableStatus, occupiedAt: undefined, currentOrder: undefined } : t),
    );
    patchTable(tableId, { status: 'empty', orderItems: [], total: 0 });
  };

  const updateTableItems = (tableId: string, newItems: OrderItem[]) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id !== tableId) return t;
        return {
          ...t,
          currentOrder: t.currentOrder ? { ...t.currentOrder, items: newItems } : undefined,
        };
      })
    );
    patchTable(tableId, {
      orderItems: newItems.map(i => ({
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        note: i.note,
        category: i.category,
      })),
    });
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────────
  const addTable = async (number: string, zone: string, capacity: number) => {
    try {
      const id = `T${number.replace(/\s+/g, '_')}-${Date.now()}`;
      // Lưu name = "Bàn {number}" để adapter lấy đúng số hiển thị
      const name = `Bàn ${number}`;
      await tablesApi.create({ id, name, zone, capacity, status: 'empty', orderItems: [], total: 0 });
      await fetchTables();
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const updateTable = async (id: string, number: string, zone: string, capacity: number) => {
    try {
      await tablesApi.update(id, { name: `Bàn ${number}`, zone, capacity });
      await fetchTables();
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const deleteTable = async (id: string) => {
    try {
      await tablesApi.delete(id);
      await fetchTables();
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const updateZone = async (oldZoneName: string, newZoneName: string) => {
    try {
      const toUpdate = tables.filter(t => t.zone === oldZoneName);
      await Promise.all(toUpdate.map(t => tablesApi.update(t.id, { zone: newZoneName })));
      await fetchTables();
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const deleteZone = async (zoneName: string) => {
    try {
      const toDelete = tables.filter(t => t.zone === zoneName);
      await Promise.all(toDelete.map(t => tablesApi.delete(t.id)));
      await fetchTables();
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const zones = Array.from(new Set(tables.map(t => t.zone))).filter(Boolean);
  const emptyCount = tables.filter(t => t.status === 'empty').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;
  const cookingCount = tables.reduce((sum, t) => {
    if (!t.currentOrder) return sum;
    return sum + t.currentOrder.items.reduce((s, i) => s + i.quantity, 0);
  }, 0);

  return {
    tables, zones, loading, error,
    emptyCount, occupiedCount, reservedCount, cookingCount,
    openTable, addItemsToTable, removeItemFromTable, closeTable, updateTableItems,
    addTable, updateTable, deleteTable, updateZone, deleteZone,
    refresh: fetchTables,
  };
}
