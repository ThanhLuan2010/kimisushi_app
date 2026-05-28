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
  number: number;
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

export type MenuCategory = 'sushi' | 'drink' | 'appetizer' | 'hot-dish';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  description?: string;
  imageEmoji: string;
  available: boolean;
}

// ─── Online Orders ────────────────────────────────────────────────────────────

export type OnlineOrderStatus = 'pending' | 'cooking' | 'done' | 'cancelled';
export type DeliveryType = 'delivery' | 'pickup';

export interface OnlineOrder {
  id: string;
  customerName: string;
  customerPhone: string;
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

export type PaymentMethod = 'cash' | 'qr' | 'ewallet';

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
