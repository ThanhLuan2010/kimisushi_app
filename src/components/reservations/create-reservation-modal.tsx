import React, { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandColors } from '@/constants/theme';

interface CreateReservationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    phone: string;
    guests: number;
    date: string;
    time: string;
    notes: string;
  }) => Promise<void>;
}

export function CreateReservationModal({ visible, onClose, onSubmit }: CreateReservationModalProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState('2');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default date to today's date (YYYY-MM-DD)
  useEffect(() => {
    if (visible) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
      
      const hh = String(today.getHours()).padStart(2, '0');
      const min = String(today.getMinutes()).padStart(2, '0');
      setTime(`${hh}:${min}`);

      // Reset other states
      setName('');
      setPhone('');
      setGuests('2');
      setNotes('');
    }
  }, [visible]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên khách hàng.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại.');
      return;
    }
    const guestsNum = parseInt(guests, 10);
    if (isNaN(guestsNum) || guestsNum <= 0) {
      Alert.alert('Lỗi', 'Số khách phải là số lớn hơn 0.');
      return;
    }
    if (!date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày theo định dạng YYYY-MM-DD.');
      return;
    }
    if (!time.trim() || !/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert('Lỗi', 'Vui lòng nhập giờ theo định dạng HH:MM.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name,
        phone,
        guests: guestsNum,
        date,
        time,
        notes,
      });
      onClose();
    } catch (e: any) {
      // Error handled by caller
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tự đặt bàn mới</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Customer Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Khách hàng</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên khách hàng *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Nguyễn Văn A"
                placeholderTextColor={BrandColors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: 0912345678"
                placeholderTextColor={BrandColors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Reservation details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết đặt bàn</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số người *</Text>
              <TextInput
                style={styles.input}
                placeholder="2"
                placeholderTextColor={BrandColors.textMuted}
                value={guests}
                onChangeText={setGuests}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày đến (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={BrandColors.textMuted}
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giờ đến (HH:MM) *</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                placeholderTextColor={BrandColors.textMuted}
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú thêm</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ghi chú yêu cầu đặc biệt (ví dụ: ngồi cạnh cửa sổ, không cay...)"
              placeholderTextColor={BrandColors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 28) : Math.max(insets.bottom, 20) }]}>
          <Pressable style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]} onPress={handleCreate} disabled={loading}>
            <Text style={styles.confirmBtnText}>{loading ? 'Đang xử lý...' : '✓ Tạo đặt bàn'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: BrandColors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: BrandColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.brandLight,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BrandColors.borderStrong,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
  },
  confirmBtn: {
    backgroundColor: BrandColors.brand,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
