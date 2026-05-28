import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/theme';
import type { MenuItem } from '@/types';

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function MenuItemCard({ item, quantity, onAdd, onRemove }: MenuItemCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{item.imageEmoji}</Text>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.price}>{item.price.toLocaleString('vi-VN')}đ</Text>
      </View>
      <View style={styles.controls}>
        {quantity > 0 && (
          <Pressable
            style={styles.btnMinus}
            onPress={onRemove}
            hitSlop={8}
          >
            <Text style={styles.btnText}>−</Text>
          </Pressable>
        )}
        {quantity > 0 && (
          <Text style={styles.qty}>{quantity}</Text>
        )}
        <Pressable
          style={styles.btnPlus}
          onPress={onAdd}
          hitSlop={8}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.surface,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  emoji: {
    fontSize: 30,
    width: 40,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  desc: {
    fontSize: 11,
    color: BrandColors.textMuted,
    fontWeight: '500',
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.brand,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandColors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMinus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandColors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  qty: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    minWidth: 20,
    textAlign: 'center',
  },
});
