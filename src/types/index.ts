// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  role: 'owner' | 'staff';
  phone: string;
  avatar?: string;
}

// ─── Tables ──────────────────────────────────────────────────────────────────

export type TableStatus = 'empty' | 'occupied' | 'reserved';

export interface Table {
  id: string;
  /** Số bàn — có thể là số hoặc có chữ (ví dụ: 1, A1, VIP-2) */
  number: string | number;
  zone: string;
  capacity: number;
  status: TableStatus;
  /** ISO timestamp khi khách ngồi */
  occupiedAt?: string;
  /** Tên khách đặt trước */
  reservedFor?: string;
  /** Giờ đặt bàn */
  reservedTime?: string;
  currentOrder?: TableOrder;
}

export interface TableOrder {
  id: string;
  tableId: string;
  items: OrderItem[];
  createdAt: string;
  status: 'ordering' | 'cooking' | 'served';
  note?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  category: MenuCategory;
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export type MenuCategory = string;

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  description?: string;
  imageEmoji: string;
  available: boolean;
  minQty?: number;
}

// ─── Online Orders ────────────────────────────────────────────────────────────

export type OnlineOrderStatus = 'pending' | 'cooking' | 'done' | 'cancelled';
export type DeliveryType = 'delivery' | 'pickup';

export interface OnlineOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  total: number;
  deliveryType: DeliveryType;
  status: OnlineOrderStatus;
  address?: string;
  note?: string;
  createdAt: string;
  estimatedMinutes?: number;
  discountCode?: string;
  discountAmount?: number;
  pickupDate?: string;
  pickupTime?: string;
}

// ─── Reservations ─────────────────────────────────────────────────────────────

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'arrived';

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  arrivalTime: string; // ISO
  partySize: number;
  note?: string;
  status: ReservationStatus;
  tableId?: string;
  createdAt: string;
}

// ─── Bill / Payment ───────────────────────────────────────────────────────────

export type PaymentMethod = 'cash' | 'card' | 'qr' | 'ewallet' | 'bar' | 'kreditkarte' | 'ueberweisung';

export interface OrderHistoryItem {
  id: string;
  type: 'order' | 'reservation';
  method: 'dine-in' | 'delivery' | 'pickup';
  tableId?: string;
  tableName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  guests?: number;
  persons?: number;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: string;
  address?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface BillItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Bill {
  tableId: string;
  items: BillItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  total: number;
  paymentMethod?: PaymentMethod;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  cookingCount: number;
  emptyTables: number;
  reservedTables: number;
  occupiedTables: number;
}

// ─── Combos ───────────────────────────────────────────────────────────────────

export interface Combo {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  oldPrice?: string;
  tag?: string;
  items?: string;
  isVisible: boolean;
}
