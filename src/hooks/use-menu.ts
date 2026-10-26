import { useCallback, useEffect, useState } from 'react';
import { menuApi, type ApiMenuItem } from '@/services/api';
import type { MenuItem } from '@/types';

function apiToAppMenuItem(m: ApiMenuItem): MenuItem {
  return {
    id: m.id,
    name: m.name,
    price: typeof m.price === 'string' ? parseFloat((m.price as any).replace(/[^0-9,]/g, '').replace(',', '.')) : m.price,
    category: m.category,
    description: m.description,
    imageEmoji: m.imageEmoji ?? '🍽️',
    available: m.available ?? m.isVisible ?? true,
    minQty: m.minQty ? (typeof m.minQty === 'string' ? parseInt(m.minQty, 10) : m.minQty) : undefined,
  };
}

export function useMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuApi.getAll();
      setMenu(data.map(apiToAppMenuItem));
    } catch (e: any) {
      setError(e.message);
      console.warn('[useMenu] fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return { menu, loading, error, refresh: fetchMenu };
}
