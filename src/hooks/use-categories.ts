import { useCallback, useEffect, useState } from 'react';
import { categoryApi, type ApiCategory } from '@/services/api';

export function useCategories() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
      console.warn('[useCategories] fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refresh: fetchCategories };
}
