import type {
  MenuItem,
  OnlineOrder,
  Reservation,
  Table,
  User,
} from '@/types';

// ─── Users ────────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Nguyễn Văn An',
    role: 'owner',
    phone: '0901234567',
    avatar: '👨‍🍳',
  },
  {
    id: 'u2',
    name: 'Trần Thị Bình',
    role: 'staff',
    phone: '0912345678',
    avatar: '👩‍💼',
  },
];

// ─── Menu Items ───────────────────────────────────────────────────────────────

export const MOCK_MENU: MenuItem[] = [
  // Sushi
  { id: 'm1', name: 'Sushi Cá Hồi', price: 55000, category: 'sushi', imageEmoji: '🍣', description: 'Cá hồi tươi nhập khẩu', available: true },
  { id: 'm2', name: 'Sushi Cá Ngừ', price: 45000, category: 'sushi', imageEmoji: '🐟', description: 'Cá ngừ đại dương', available: true },
  { id: 'm3', name: 'Sushi Tôm Ebi', price: 40000, category: 'sushi', imageEmoji: '🦐', description: 'Tôm luộc chín', available: true },
  { id: 'm4', name: 'Sashimi Hồi', price: 120000, category: 'sushi', imageEmoji: '🍱', description: '8 lát cá hồi tươi', available: true },
  { id: 'm5', name: 'Maki Cuộn Bơ', price: 65000, category: 'sushi', imageEmoji: '🌯', description: 'Bơ + dưa chuột', available: true },
  { id: 'm6', name: 'California Roll', price: 75000, category: 'sushi', imageEmoji: '🍙', description: 'Crab + avocado', available: true },

  // Khai vị
  { id: 'm7', name: 'Edamame', price: 35000, category: 'appetizer', imageEmoji: '🫘', description: 'Đậu nành muối', available: true },
  { id: 'm8', name: 'Salad Rong Biển', price: 40000, category: 'appetizer', imageEmoji: '🥗', description: 'Rong biển + mè rang', available: true },
  { id: 'm9', name: 'Gyoza Chiên', price: 55000, category: 'appetizer', imageEmoji: '🥟', description: 'Bánh xếp chiên giòn', available: true },
  { id: 'm10', name: 'Miso Soup', price: 30000, category: 'appetizer', imageEmoji: '🍲', description: 'Soup miso truyền thống', available: true },

  // Món nóng
  { id: 'm11', name: 'Ramen Tonkotsu', price: 95000, category: 'hot-dish', imageEmoji: '🍜', description: 'Nước dùng heo ninh 12h', available: true },
  { id: 'm12', name: 'Teriyaki Gà', price: 85000, category: 'hot-dish', imageEmoji: '🍗', description: 'Gà nướng sốt teriyaki', available: true },
  { id: 'm13', name: 'Cơm Chiên Nhật', price: 65000, category: 'hot-dish', imageEmoji: '🍚', description: 'Cơm chiên trứng + rau củ', available: true },
  { id: 'm14', name: 'Katsu Curry', price: 90000, category: 'hot-dish', imageEmoji: '🍛', description: 'Cơm cà ri + thịt chiên', available: true },

  // Đồ uống
  { id: 'm15', name: 'Trà Xanh Đá', price: 25000, category: 'drink', imageEmoji: '🍵', description: 'Matcha latte đá', available: true },
  { id: 'm16', name: 'Sake Lạnh', price: 85000, category: 'drink', imageEmoji: '🍶', description: 'Sake Nhật nhập khẩu', available: true },
  { id: 'm17', name: 'Bia Asahi', price: 40000, category: 'drink', imageEmoji: '🍺', description: 'Bia Nhật lon 350ml', available: true },
  { id: 'm18', name: 'Nước Cam Ép', price: 35000, category: 'drink', imageEmoji: '🍊', description: 'Cam tươi ép nguyên chất', available: true },
  { id: 'm19', name: 'Coca Cola', price: 20000, category: 'drink', imageEmoji: '🥤', description: 'Lon 330ml', available: true },
  { id: 'm20', name: 'Nước Suối', price: 15000, category: 'drink', imageEmoji: '💧', description: 'Lavie 500ml', available: true },
];

// ─── Tables ───────────────────────────────────────────────────────────────────

export const MOCK_TABLES: Table[] = [
  // Khu A
  { id: 't1', number: 1, zone: 'Khu A', capacity: 2, status: 'empty' },
  { id: 't2', number: 2, zone: 'Khu A', capacity: 2, status: 'occupied', occupiedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    currentOrder: {
      id: 'ord-t2', tableId: 't2', status: 'cooking', createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      items: [
        { menuItemId: 'm1', name: 'Sushi Cá Hồi', price: 55000, quantity: 2, category: 'sushi' },
        { menuItemId: 'm15', name: 'Trà Xanh Đá', price: 25000, quantity: 2, category: 'drink' },
      ],
    },
  },
  { id: 't3', number: 3, zone: 'Khu A', capacity: 4, status: 'reserved', reservedFor: 'Minh Tú', reservedTime: '19:00' },
  { id: 't4', number: 4, zone: 'Khu A', capacity: 4, status: 'empty' },
  { id: 't5', number: 5, zone: 'Khu A', capacity: 6, status: 'occupied', occupiedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    currentOrder: {
      id: 'ord-t5', tableId: 't5', status: 'served', createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
      items: [
        { menuItemId: 'm4', name: 'Sashimi Hồi', price: 120000, quantity: 1, category: 'sushi' },
        { menuItemId: 'm11', name: 'Ramen Tonkotsu', price: 95000, quantity: 2, category: 'hot-dish' },
        { menuItemId: 'm17', name: 'Bia Asahi', price: 40000, quantity: 3, category: 'drink' },
      ],
    },
  },

  // Khu B
  { id: 't6', number: 6, zone: 'Khu B', capacity: 4, status: 'empty' },
  { id: 't7', number: 7, zone: 'Khu B', capacity: 4, status: 'occupied', occupiedAt: new Date(Date.now() - 70 * 60000).toISOString(),
    currentOrder: {
      id: 'ord-t7', tableId: 't7', status: 'cooking', createdAt: new Date(Date.now() - 70 * 60000).toISOString(),
      items: [
        { menuItemId: 'm6', name: 'California Roll', price: 75000, quantity: 2, category: 'sushi' },
        { menuItemId: 'm9', name: 'Gyoza Chiên', price: 55000, quantity: 1, category: 'appetizer' },
        { menuItemId: 'm19', name: 'Coca Cola', price: 20000, quantity: 2, category: 'drink' },
      ],
    },
  },
  { id: 't8', number: 8, zone: 'Khu B', capacity: 2, status: 'empty' },
  { id: 't9', number: 9, zone: 'Khu B', capacity: 8, status: 'reserved', reservedFor: 'Gia đình Bảo', reservedTime: '18:30' },
  { id: 't10', number: 10, zone: 'Khu B', capacity: 6, status: 'occupied', occupiedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    currentOrder: {
      id: 'ord-t10', tableId: 't10', status: 'ordering', createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      items: [
        { menuItemId: 'm13', name: 'Cơm Chiên Nhật', price: 65000, quantity: 3, category: 'hot-dish' },
        { menuItemId: 'm18', name: 'Nước Cam Ép', price: 35000, quantity: 3, category: 'drink' },
      ],
    },
  },

  // Khu VIP
  { id: 't11', number: 11, zone: 'Khu VIP', capacity: 6, status: 'empty' },
  { id: 't12', number: 12, zone: 'Khu VIP', capacity: 8, status: 'reserved', reservedFor: 'Công ty Thành Phát', reservedTime: '19:30' },
  { id: 't13', number: 13, zone: 'Khu VIP', capacity: 10, status: 'empty' },
  { id: 't14', number: 14, zone: 'Khu VIP', capacity: 6, status: 'occupied', occupiedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    currentOrder: {
      id: 'ord-t14', tableId: 't14', status: 'served', createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
      items: [
        { menuItemId: 'm4', name: 'Sashimi Hồi', price: 120000, quantity: 2, category: 'sushi' },
        { menuItemId: 'm16', name: 'Sake Lạnh', price: 85000, quantity: 2, category: 'drink' },
        { menuItemId: 'm12', name: 'Teriyaki Gà', price: 85000, quantity: 2, category: 'hot-dish' },
      ],
    },
  },
  { id: 't15', number: 15, zone: 'Khu VIP', capacity: 4, status: 'empty' },
];

// ─── Online Orders ─────────────────────────────────────────────────────────────

export const MOCK_ONLINE_ORDERS: OnlineOrder[] = [
  {
    id: 'oo1',
    customerName: 'Lê Văn Hùng',
    customerPhone: '0923456789',
    items: [
      { menuItemId: 'm1', name: 'Sushi Cá Hồi', price: 55000, quantity: 2, category: 'sushi' },
      { menuItemId: 'm11', name: 'Ramen Tonkotsu', price: 95000, quantity: 1, category: 'hot-dish' },
    ],
    total: 205000,
    deliveryType: 'delivery',
    status: 'pending',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    note: 'Giao giờ trưa nhé',
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: 'oo2',
    customerName: 'Phạm Thị Mai',
    customerPhone: '0934567890',
    items: [
      { menuItemId: 'm5', name: 'Maki Cuộn Bơ', price: 65000, quantity: 1, category: 'sushi' },
      { menuItemId: 'm9', name: 'Gyoza Chiên', price: 55000, quantity: 1, category: 'appetizer' },
      { menuItemId: 'm15', name: 'Trà Xanh Đá', price: 25000, quantity: 2, category: 'drink' },
    ],
    total: 170000,
    deliveryType: 'pickup',
    status: 'pending',
    note: 'Ít đá nha',
    createdAt: new Date(Date.now() - 7 * 60000).toISOString(),
  },
  {
    id: 'oo3',
    customerName: 'Trần Quốc Bảo',
    customerPhone: '0945678901',
    items: [
      { menuItemId: 'm4', name: 'Sashimi Hồi', price: 120000, quantity: 1, category: 'sushi' },
      { menuItemId: 'm8', name: 'Salad Rong Biển', price: 40000, quantity: 1, category: 'appetizer' },
    ],
    total: 160000,
    deliveryType: 'delivery',
    status: 'cooking',
    address: '456 Lê Lợi, Q.3',
    estimatedMinutes: 20,
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'oo4',
    customerName: 'Ngô Thị Lan',
    customerPhone: '0956789012',
    items: [
      { menuItemId: 'm14', name: 'Katsu Curry', price: 90000, quantity: 2, category: 'hot-dish' },
      { menuItemId: 'm17', name: 'Bia Asahi', price: 40000, quantity: 2, category: 'drink' },
    ],
    total: 260000,
    deliveryType: 'pickup',
    status: 'done',
    discountCode: 'KIMI10',
    discountAmount: 26000,
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    estimatedMinutes: 15,
  },
  {
    id: 'oo5',
    customerName: 'Đinh Thanh Long',
    customerPhone: '0967890123',
    items: [
      { menuItemId: 'm6', name: 'California Roll', price: 75000, quantity: 3, category: 'sushi' },
      { menuItemId: 'm10', name: 'Miso Soup', price: 30000, quantity: 3, category: 'appetizer' },
    ],
    total: 315000,
    deliveryType: 'delivery',
    status: 'pending',
    address: '789 Võ Văn Tần, Q.3',
    createdAt: new Date(Date.now() - 1 * 60000).toISOString(),
  },
  {
    id: 'oo6',
    customerName: 'Vũ Minh Châu',
    customerPhone: '0978901234',
    items: [
      { menuItemId: 'm12', name: 'Teriyaki Gà', price: 85000, quantity: 1, category: 'hot-dish' },
      { menuItemId: 'm20', name: 'Nước Suối', price: 15000, quantity: 2, category: 'drink' },
    ],
    total: 115000,
    deliveryType: 'pickup',
    status: 'cooking',
    estimatedMinutes: 10,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
];

// ─── Reservations ─────────────────────────────────────────────────────────────

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'r1',
    customerName: 'Minh Tú',
    customerPhone: '0901111111',
    arrivalTime: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
    partySize: 2,
    note: 'Kỷ niệm ngày cưới, cần nến & hoa',
    status: 'confirmed',
    tableId: 't3',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'r2',
    customerName: 'Gia đình Bảo',
    customerPhone: '0902222222',
    arrivalTime: new Date(new Date().setHours(18, 30, 0, 0)).toISOString(),
    partySize: 8,
    note: 'Sinh nhật bé 5 tuổi',
    status: 'confirmed',
    tableId: 't9',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'r3',
    customerName: 'Công ty Thành Phát',
    customerPhone: '0903333333',
    arrivalTime: new Date(new Date().setHours(19, 30, 0, 0)).toISOString(),
    partySize: 10,
    note: 'Họp công ty, cần phòng riêng',
    status: 'pending',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'r4',
    customerName: 'Nguyễn Thu Hà',
    customerPhone: '0904444444',
    arrivalTime: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
    partySize: 4,
    status: 'pending',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'r5',
    customerName: 'Lê Công Dũng',
    customerPhone: '0905555555',
    arrivalTime: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
    partySize: 3,
    note: 'Ăn trưa đặc biệt',
    status: 'arrived',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'r6',
    customerName: 'Trần Bích Ngọc',
    customerPhone: '0906666666',
    arrivalTime: new Date(new Date().setHours(21, 0, 0, 0)).toISOString(),
    partySize: 2,
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
];
