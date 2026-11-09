import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Config ──────────────────────────────────────────────────────────────────
// IP máy Mac khi dev trên iPhone thật. Đổi thành domain khi deploy.
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://kimisushi-be.vercel.app';
// process.env.EXPO_PUBLIC_API_URL || 'https://kimisushi-be.vercel.app';

const API_URL = `${BASE_URL}/api`;
const TOKEN_KEY = 'auth_token';

// ─── Token helpers ────────────────────────────────────────────────────────────
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ─── Fetch wrapper ────────────────────────────────────────────────────────────
type FetchOptions = RequestInit & { skipAuth?: boolean };

async function apiFetch<T>(path: string, options: FetchOptions = {}, retries = 2): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  try {
    const res = await fetch(url, { ...fetchOptions, headers });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const errorMsg = body?.message || body?.error || `HTTP ${res.status}`;

      // Tự động thử lại khi gặp lỗi Server hoặc kết nối Database trên Vercel
      if (retries > 0 && (res.status >= 500 || errorMsg.includes('Lỗi kết nối'))) {
        console.warn(`[API] Server error, retrying... (${retries} left)`, errorMsg);
        await new Promise(r => setTimeout(r, 1500));
        return apiFetch<T>(path, options, retries - 1);
      }

      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (error: any) {
    // Tự động thử lại nếu lỗi Network (mất mạng tạm thời)
    if (retries > 0 && (!error.message || !error.message.includes('HTTP'))) {
      console.warn(`[API] Network error, retrying... (${retries} left)`, error.message);
      await new Promise(r => setTimeout(r, 1500));
      return apiFetch<T>(path, options, retries - 1);
    }
    throw error;
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    apiFetch<{ success: boolean; token: string; user: { id: string; username: string; name: string; role: string } }>(
      '/admin/login',
      { method: 'POST', body: JSON.stringify({ username, password }), skipAuth: true }
    ),

  verify: (token: string) =>
    apiFetch<{ valid: boolean; user?: { id: string; username: string; name: string; role: string } }>(
      '/admin/verify',
      { method: 'POST', body: JSON.stringify({ token }), skipAuth: true }
    ),
};

// ─── Tables API ───────────────────────────────────────────────────────────────
export interface ApiTable {
  _id?: string;
  id: string;
  name: string;
  zone: string;
  capacity: number;
  status: 'empty' | 'occupied' | 'reserved';
  orderItems: ApiOrderItem[];
  total: number;
  reservedFor?: string;
  reservedTime?: string;
  occupiedAt?: string;
  updatedAt?: string;
}

export interface ApiOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  category: string;
}

export const tablesApi = {
  getAll: () => apiFetch<ApiTable[]>('/tables'),

  create: (data: Omit<ApiTable, '_id' | 'updatedAt'>) =>
    apiFetch<{ success: boolean; table: ApiTable }>('/tables/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ApiTable>) =>
    apiFetch<{ success: boolean; table: ApiTable }>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/tables/${id}`, { method: 'DELETE' }),
};

// ─── Menu API ─────────────────────────────────────────────────────────────────
export interface ApiMenuItem {
  _id?: string;
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageEmoji?: string;
  available?: boolean;
  isVisible?: boolean;
  minQty?: number;
}

export const menuApi = {
  getAll: () => apiFetch<ApiMenuItem[]>('/menu'),
};

// ─── Categories API ───────────────────────────────────────────────────────────
export interface ApiCategory {
  _id?: string;
  id: string;
  name: string;
  isVisible: boolean;
  order: number;
}

export const categoryApi = {
  getAll: () => apiFetch<ApiCategory[]>('/categories'),
};

// ─── Orders (Online/Inbox) API ────────────────────────────────────────────────
export interface ApiOrder {
  _id?: string;
  id: string;
  type: 'order' | 'reservation';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: ApiOrderItem[];
  total: string;
  method: 'delivery' | 'pickup' | 'dine-in';
  tableId?: string;
  tableName?: string;
  paymentMethod?: string;
  address?: string;
  notes?: string;
  status: string;
  pickupDate?: string;
  pickupTime?: string;
  date?: string;
  time?: string;
  guests?: number;
  persons?: number;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  estimatedMinutes?: number;
}

export const ordersApi = {
  getAll: (params?: { status?: string; type?: string }) => {
    const q = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiFetch<{ success: boolean; count: number; items: ApiOrder[] }>(`/inbox${q}`);
  },

  updateStatus: (id: string, status: string, tableId?: string, estimatedMinutes?: number, skipEmail?: boolean) =>
    apiFetch<{ success: boolean }>(`/inbox/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, tableId, estimatedMinutes, skipEmail }),
    }),

  create: (data: Partial<ApiOrder>) =>
    apiFetch<{ success: boolean; id: string }>('/inbox', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── History API ──────────────────────────────────────────────────────────────
export const historyApi = {
  getAll: (params?: { method?: string; limit?: number }) => {
    const queryParams: Record<string, string> = { status: 'done' };
    if (params?.method) queryParams.method = params.method;
    if (params?.limit) queryParams.limit = String(params.limit);
    const q = '?' + new URLSearchParams(queryParams).toString();
    return apiFetch<{ success: boolean; count: number; items: ApiOrder[] }>(`/inbox${q}`);
  },

  createDineInHistory: (data: Partial<ApiOrder>) =>
    apiFetch<{ success: boolean; id: string }>('/inbox', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        type: 'order',
        method: 'dine-in',
        status: 'done',
        completedAt: new Date().toISOString(),
      }),
    }),
};

// ─── Combos API ───────────────────────────────────────────────────────────────
export interface ApiCombo {
  id: string;
  name: string;
  subtitle?: string;
  price: string;
  oldPrice?: string;
  tag?: string;
  items?: string;
  isVisible: boolean;
}

export const combosApi = {
  getAll: () => apiFetch<ApiCombo[]>('/combos'),
};

// ─── Activity Log API ─────────────────────────────────────────────────────────
export interface ApiActivityLog {
  _id?: string;
  user: string;
  action: string;
  detail?: string;
  createdAt: string;
}

export const activityApi = {
  getRecent: (limit = 10) =>
    apiFetch<{ success: boolean; count: number; items: ApiActivityLog[] }>(
      `/admin/activity-log?limit=${limit}`
    ),
};
