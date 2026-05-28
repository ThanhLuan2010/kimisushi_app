import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { BrandColors } from '@/constants/theme';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (minutes: number) => void;
}

const QUICK_TIMES = [10, 15, 20, 30];

export function TimePickerModal({ visible, onClose, onConfirm }: TimePickerModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState('');

  const handleConfirm = () => {
    const minutes = selected ?? parseInt(custom, 10);
    if (minutes > 0) {
      onConfirm(minutes);
      setSelected(null);
      setCustom('');
    }
  };

  const isValid = selected !== null || (parseInt(custom, 10) > 0);

  return (
    <BottomSheet visible={visible} onClose={onClose} heightFraction={0.46}>
      <View style={styles.container}>
        <Text style={styles.title}>Thời gian chế biến</Text>
        <Text style={styles.sub}>Khách sẽ nhận được thông báo thời gian chờ</Text>

        {/* Quick options */}
        <View style={styles.quickRow}>
          {QUICK_TIMES.map(mins => (
            <Pressable
              key={mins}
              style={[styles.quickBtn, selected === mins && styles.quickBtnActive]}
              onPress={() => {
                setSelected(mins);
                setCustom('');
              }}
            >
              <Text style={[styles.quickBtnText, selected === mins && styles.quickBtnTextActive]}>
                {mins}
              </Text>
              <Text style={[styles.quickBtnUnit, selected === mins && styles.quickBtnUnitActive]}>
                phút
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Custom input */}
        <View style={styles.customRow}>
          <Text style={styles.customLabel}>Tùy chỉnh:</Text>
          <TextInput
            style={[styles.customInput, custom.length > 0 && styles.customInputActive]}
            value={custom}
            onChangeText={v => {
              setCustom(v);
              setSelected(null);
            }}
            placeholder="?"
            placeholderTextColor={BrandColors.textMuted}
            keyboardType="number-pad"
            maxLength={3}
          />
          <Text style={styles.customLabel}>phút</Text>
        </View>

        <Pressable
          style={[styles.confirmBtn, !isValid && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!isValid}
        >
          <Text style={styles.confirmBtnText}>
            Xác nhận – {selected ?? (parseInt(custom) || '?')} phút
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  sub: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    marginTop: -8,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BrandColors.border,
    gap: 2,
  },
  quickBtnActive: {
    backgroundColor: BrandColors.brandFaded,
    borderColor: BrandColors.brand,
  },
  quickBtnText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  quickBtnTextActive: {
    color: BrandColors.brand,
  },
  quickBtnUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.textMuted,
  },
  quickBtnUnitActive: {
    color: BrandColors.brandLight,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  customInput: {
    backgroundColor: BrandColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BrandColors.border,
    width: 64,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    paddingVertical: 10,
  },
  customInputActive: {
    borderColor: BrandColors.brand,
  },
  confirmBtn: {
    backgroundColor: BrandColors.brand,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
