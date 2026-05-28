import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/theme';

interface CookingCountProps {
  count: number;
}

export function CookingCount({ count }: CookingCountProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count === 0) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [count, pulse]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulse }] }]}>
      <View style={styles.inner}>
        <Text style={styles.fire}>🔥</Text>
        <View>
          <Text style={styles.label}>Bếp đang làm</Text>
          <Text style={styles.count}>{count} <Text style={styles.unit}>món</Text></Text>
        </View>
      </View>
      {count > 0 && <View style={styles.dot} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BrandColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.brand + '40',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fire: {
    fontSize: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textSecondary,
    marginBottom: 2,
  },
  count: {
    fontSize: 36,
    fontWeight: '800',
    color: BrandColors.brand,
    lineHeight: 40,
  },
  unit: {
    fontSize: 18,
    fontWeight: '600',
    color: BrandColors.brandLight,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BrandColors.success,
  },
});
