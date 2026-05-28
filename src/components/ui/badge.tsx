import React from 'react';
import { StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';

import { BrandColors } from '@/constants/theme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: BrandColors.successFaded, text: BrandColors.success },
  warning: { bg: BrandColors.warningFaded, text: BrandColors.warning },
  danger: { bg: BrandColors.dangerFaded, text: BrandColors.danger },
  info: { bg: BrandColors.infoFaded, text: BrandColors.info },
  brand: { bg: BrandColors.brandFaded, text: BrandColors.brand },
  muted: { bg: 'rgba(255,255,255,0.08)', text: BrandColors.textSecondary },
};

export function Badge({ label, variant = 'muted', size = 'sm', style }: BadgeProps) {
  const v = variantStyles[variant];
  return (
    <Text
      style={[
        styles.base,
        size === 'md' && styles.md,
        { backgroundColor: v.bg, color: v.text },
        style as TextStyle,
      ]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  md: {
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
});
