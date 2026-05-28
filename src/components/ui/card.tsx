import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { BrandColors } from '@/constants/theme';

interface CardProps extends ViewProps {
  elevated?: boolean;
  noPadding?: boolean;
}

export function Card({ style, elevated = false, noPadding = false, children, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        elevated ? styles.elevated : styles.surface,
        noPadding && styles.noPadding,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  surface: {
    backgroundColor: BrandColors.surface,
  },
  elevated: {
    backgroundColor: BrandColors.surfaceElevated,
  },
  noPadding: {
    padding: 0,
  },
});
