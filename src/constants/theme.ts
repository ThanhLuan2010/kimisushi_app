import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#0D0D1A',
    backgroundElement: '#1A1A2E',
    backgroundSelected: '#252542',
    textSecondary: '#9A9AB0',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ─── Brand Colors (Kimi Sushi) ────────────────────────────────────────────────

export const BrandColors = {
  /** Primary CTA – đỏ cam đặc trưng sushi */
  brand: '#FF4D2E',
  brandLight: '#FF7A5C',
  brandDark: '#CC3B20',
  brandFaded: 'rgba(255, 77, 46, 0.15)',

  /** Status */
  success: '#22C55E',
  successFaded: 'rgba(34, 197, 94, 0.15)',
  warning: '#F59E0B',
  warningFaded: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',
  dangerFaded: 'rgba(239, 68, 68, 0.15)',
  info: '#3B82F6',
  infoFaded: 'rgba(59, 130, 246, 0.15)',

  /** Surfaces (dark) */
  surface: '#1A1A2E',
  surfaceElevated: '#252542',
  surfaceHighlight: '#2E2E55',

  /** Text */
  textMuted: '#6B6B8A',
  textSecondary: '#9A9AB0',

  /** Border */
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.15)',
} as const;

// ─── Table Status Colors ───────────────────────────────────────────────────────

export const TableStatusColors = {
  empty: {
    bg: BrandColors.successFaded,
    border: BrandColors.success,
    text: BrandColors.success,
    label: 'Trống',
  },
  occupied: {
    bg: BrandColors.dangerFaded,
    border: BrandColors.danger,
    text: BrandColors.danger,
    label: 'Có khách',
  },
  reserved: {
    bg: BrandColors.warningFaded,
    border: BrandColors.warning,
    text: BrandColors.warning,
    label: 'Đặt trước',
  },
} as const;

// ─── Font ─────────────────────────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
