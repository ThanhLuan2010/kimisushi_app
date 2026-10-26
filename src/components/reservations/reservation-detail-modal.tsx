import React, { useState, useEffect } from 'react';
import { useTables } from '@/hooks/use-tables';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { BrandColors } from '@/constants/theme';
import type { Reservation } from '@/types';

interface ReservationDetailModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  onConfirm?: (id: string, tableId?: string) => void;
}

const statusConfig = {
  pending: { label: 'Chờ xác nhận', variant: 'warning' as const },
  confirmed: { label: 'Đã xác nhận', variant: 'success' as const },
  cancelled: { label: 'Đã hủy', variant: 'danger' as const },
  arrived: { label: 'Đã đến', variant: 'brand' as const },
};

import moment from 'moment';

function formatDateTime(iso: string) {
  return moment(iso).format('DD.MM.YYYY [lúc] HH:mm');
}

export function ReservationDetailModal({ reservation, onClose, onConfirm }: ReservationDetailModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedTableId, setSelectedTableId] = useState<string | undefined>(undefined);
  const { tables, refresh: fetchTables } = useTables();

  useEffect(() => {
    if (reservation && reservation.status === 'pending') {
      fetchTables();
      setSelectedTableId(undefined);
    }
  }, [reservation, fetchTables]);

  const emptyTables = tables.filter(t => t.status === 'empty');

  if (!reservation) return null;

  const status = statusConfig[reservation.status];

  return (
    <Modal visible={!!reservation} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Chi tiết Đặt bàn</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Customer Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Tên:</Text>
                <Text style={styles.value}>{reservation.customerName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Điện thoại:</Text>
                <Text style={styles.value}>{reservation.customerPhone}</Text>
              </View>
            </View>

            {/* Reservation Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin đặt bàn</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Thời gian đến:</Text>
                <Text style={styles.valueHighlight}>{formatDateTime(reservation.arrivalTime)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Số người:</Text>
                <Text style={styles.value}>{reservation.partySize} người</Text>
              </View>
              {reservation.tableId && (
                <View style={styles.row}>
                  <Text style={styles.label}>Bàn chỉ định:</Text>
                  <Text style={styles.value}>Bàn #{reservation.tableId.replace('t', '')}</Text>
                </View>
              )}
              <View style={styles.row}>
                <Text style={styles.label}>Trạng thái:</Text>
                <Badge label={status.label} variant={status.variant} />
              </View>
              {reservation.status === 'pending' && (
                <View style={[styles.section, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', marginTop: 12, paddingTop: 12 }]}>
                  <Text style={styles.sectionTitle}>Chỉ định bàn (Tùy chọn)</Text>
                  
                  <Pressable
                    style={[
                      styles.tableChip,
                      { alignSelf: 'flex-start', marginBottom: 16 },
                      !selectedTableId && styles.tableChipActive
                    ]}
                    onPress={() => setSelectedTableId(undefined)}
                  >
                    <Text style={[styles.tableChipText, !selectedTableId && styles.tableChipTextActive]}>Bỏ qua (Không xếp bàn)</Text>
                  </Pressable>

                  {Array.from(new Set(emptyTables.map(t => t.zone))).map(zone => (
                    <View key={zone} style={{ marginBottom: 16 }}>
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 8, opacity: 0.8 }}>📍 {zone || 'Chưa phân khu'}</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {emptyTables.filter(t => t.zone === zone).map(t => (
                          <Pressable
                            key={t.id}
                            style={[
                              styles.tableGridItem,
                              selectedTableId === t.id && styles.tableChipActive
                            ]}
                            onPress={() => setSelectedTableId(t.id)}
                          >
                            <Text style={[styles.tableChipText, selectedTableId === t.id && styles.tableChipTextActive]}>Bàn {t.number}</Text>
                            <Text style={{ fontSize: 12, color: selectedTableId === t.id ? '#FF4D2E' : '#666', marginTop: 4 }}>👤 {t.capacity} người</Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}

            </View>

            {/* Note */}
            {reservation.note ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ghi chú từ khách hàng</Text>
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>{reservation.note}</Text>
                </View>
              </View>
            ) : null}
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 28) : Math.max(insets.bottom, 16) }]}>
            {reservation.status === 'pending' && onConfirm ? (
              <Pressable
                style={styles.confirmBtn}
                onPress={() => {
                  onConfirm(reservation.id, selectedTableId);
                  onClose();
                }}
              >
                <Text style={styles.confirmBtnText}>Xác nhận Đặt bàn</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.closeActionBtn} onPress={onClose}>
                <Text style={styles.closeActionBtnText}>Đóng</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: BrandColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 20,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: BrandColors.surfaceElevated,
    borderRadius: 20,
  },
  closeIcon: {
    color: BrandColors.textMuted,
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: BrandColors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.brandLight,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    flex: 1,
  },
  value: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  valueHighlight: {
    fontSize: 15,
    color: BrandColors.brand,
    fontWeight: '700',
    flex: 2,
    textAlign: 'right',
  },
  noteBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: BrandColors.warning,
  },
  noteText: {
    color: BrandColors.warning,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
  },
  confirmBtn: {
    backgroundColor: BrandColors.brand,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeActionBtn: {
    backgroundColor: BrandColors.surfaceElevated,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  closeActionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  tableGridItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    minWidth: '30%',
  },
  tableChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tableChipActive: {
    backgroundColor: 'rgba(255,77,46,0.1)',
    borderColor: BrandColors.brand,
  },
  tableChipText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  tableChipTextActive: {
    color: BrandColors.brand,
    fontWeight: 'bold',
  },
});
