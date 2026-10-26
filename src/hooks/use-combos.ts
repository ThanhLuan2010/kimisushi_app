import { useCallback, useEffect, useState } from 'react';
import { combosApi, type ApiCombo } from '@/services/api';
import type { Combo } from '@/types';

function apiToAppCombo(c: ApiCombo): Combo {
  return {
    id: c.id,
    name: c.name,
    subtitle: c.subtitle,
    price: typeof c.price === 'string'
      ? parseFloat(c.price.replace('€', '').replace(/\s/g, '').replace(',', '.')) || 0
      : (c.price ?? 0),
    oldPrice: c.oldPrice,
    tag: c.tag,
    items: c.items,
    isVisible: c.isVisible ?? true,
  };
}

export function useCombos() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCombos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await combosApi.getAll();
      setCombos((data ?? []).map(apiToAppCombo));
    } catch (e: any) {
      setError(e.message);
      console.warn('[useCombos] fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCombos();
  }, [fetchCombos]);

  return { combos, loading, error, refresh: fetchCombos };
}
