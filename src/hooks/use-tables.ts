import { useState } from 'react';

import { MOCK_TABLES } from '@/constants/mock-data';
import type { MenuItem, OrderItem, Table, TableStatus } from '@/types';

export function useTables() {
  const [tables, setTables] = useState<Table[]>(MOCK_TABLES);

  const openTable = (tableId: string) => {
    setTables(prev =>
      prev.map(t =>
        t.id === tableId
          ? {
              ...t,
              status: 'occupied' as TableStatus,
              occupiedAt: new Date().toISOString(),
              currentOrder: {
                id: `ord-${tableId}-${Date.now()}`,
                tableId,
                items: [],
                createdAt: new Date().toISOString(),
                status: 'ordering',
              },
            }
          : t,
      ),
    );
  };

  const addItemToTable = (tableId: string, menuItem: MenuItem, quantity: number, note?: string) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id !== tableId || !t.currentOrder) return t;
        const existingIdx = t.currentOrder.items.findIndex(i => i.menuItemId === menuItem.id);
        let newItems: OrderItem[];
        if (existingIdx >= 0) {
          newItems = t.currentOrder.items.map((item, idx) =>
            idx === existingIdx ? { ...item, quantity: item.quantity + quantity, note: note ?? item.note } : item,
          );
        } else {
          newItems = [
            ...t.currentOrder.items,
            {
              menuItemId: menuItem.id,
              name: menuItem.name,
              price: menuItem.price,
              quantity,
              note,
              category: menuItem.category,
            },
          ];
        }
        return { ...t, currentOrder: { ...t.currentOrder, items: newItems } };
      }),
    );
  };

  const removeItemFromTable = (tableId: string, menuItemId: string) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id !== tableId || !t.currentOrder) return t;
        const newItems = t.currentOrder.items.filter(i => i.menuItemId !== menuItemId);
        return { ...t, currentOrder: { ...t.currentOrder, items: newItems } };
      }),
    );
  };

  const closeTable = (tableId: string) => {
    setTables(prev =>
      prev.map(t =>
        t.id === tableId
          ? { ...t, status: 'empty' as TableStatus, occupiedAt: undefined, currentOrder: undefined }
          : t,
      ),
    );
  };

  const emptyCount = tables.filter(t => t.status === 'empty').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;
  const cookingCount = tables.reduce((sum, t) => {
    if (!t.currentOrder) return sum;
    const cooking = t.currentOrder.items.reduce((s, i) => s + i.quantity, 0);
    return sum + cooking;
  }, 0);

  return {
    tables,
    emptyCount,
    occupiedCount,
    reservedCount,
    cookingCount,
    openTable,
    addItemToTable,
    removeItemFromTable,
    closeTable,
  };
}
