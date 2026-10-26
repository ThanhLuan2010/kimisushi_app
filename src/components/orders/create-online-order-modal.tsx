import React, { useState, useEffect, useMemo } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandColors } from '@/constants/theme';
import { useMenu } from '@/hooks/use-menu';
import { useCombos } from '@/hooks/use-combos';

interface CreateOnlineOrderModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customerName: string;
    customerPhone: string;
    method: 'delivery' | 'pickup';
    address: string;
    items: any[];
    total: string;
    notes: string;
    pickupDate: string;
    pickupTime: string;
  }) => Promise<void>;
}

type TabSegment = 'menu' | 'combo';

export function CreateOnlineOrderModal({ visible, onClose, onSubmit }: CreateOnlineOrderModalProps) {
  const insets = useSafeAreaInsets();
  const { menu, loading: menuLoading } = useMenu();
  const { combos, loading: combosLoading } = useCombos();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [method, setMethod] = useState<'delivery' | 'pickup'>('pickup');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('asap');
  const [activeSegment, setActiveSegment] = useState<TabSegment>('menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // quantities: record of item_id -> quantity selected
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [selectedCombos, setSelectedCombos] = useState<Record<string, number>>({});

  // Reset fields on open
  useEffect(() => {
    if (visible) {
      setCustomerName('');
      setCustomerPhone('');
      setMethod('pickup');
      setAddress('');
      setNotes('');
      
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setPickupDate(`${yyyy}-${mm}-${dd}`);
      
      setPickupTime('asap');
      setActiveSegment('menu');
      setSearchQuery('');
      setSelectedItems({});
      setSelectedCombos({});
    }
  }, [visible]);

  // Adjust quantities
  const handleAddItem = (id: string, isCombo: boolean) => {
    if (isCombo) {
      setSelectedCombos(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    } else {
      setSelectedItems(prev => {
        const item = menu.find(m => m.id === id);
        const minQty = item?.minQty ? (typeof item.minQty === 'string' ? parseInt(item.minQty as any, 10) : item.minQty) : 1;
        const current = prev[id] ?? 0;
        if (current === 0) {
          return { ...prev, [id]: minQty };
        }
        return { ...prev, [id]: current + 1 };
      });
    }
  };

  const handleRemoveItem = (id: string, isCombo: boolean) => {
    if (isCombo) {
      setSelectedCombos(prev => {
        const current = prev[id] ?? 0;
        if (current <= 1) {
          const next = { ...prev };
          delete next[id];
          return next;
        }
        return { ...prev, [id]: current - 1 };
      });
    } else {
      setSelectedItems(prev => {
        const item = menu.find(m => m.id === id);
        const minQty = item?.minQty ? (typeof item.minQty === 'string' ? parseInt(item.minQty as any, 10) : item.minQty) : 1;
        const current = prev[id] ?? 0;
        if (current <= minQty) {
          const next = { ...prev };
          delete next[id];
          return next;
        }
        return { ...prev, [id]: current - 1 };
      });
    }
  };

  // Filter items
  const filteredMenu = useMemo(() => {
    if (!menu) return [];
    return menu.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return item.available !== false && (nameMatch || descMatch);
    });
  }, [menu, searchQuery]);

  const filteredCombos = useMemo(() => {
    if (!combos) return [];
    return combos.filter(combo => {
      const nameMatch = combo.name.toLowerCase().includes(searchQuery.toLowerCase());
      const subtitleMatch = (combo.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase());
      const itemsMatch = (combo.items || '').toLowerCase().includes(searchQuery.toLowerCase());
      return combo.isVisible !== false && (nameMatch || subtitleMatch || itemsMatch);
    });
  }, [combos, searchQuery]);

  // Calculate totals
  const totalQuantity = useMemo(() => {
    const itemQty = Object.values(selectedItems).reduce((s, v) => s + v, 0);
    const comboQty = Object.values(selectedCombos).reduce((s, v) => s + v, 0);
    return itemQty + comboQty;
  }, [selectedItems, selectedCombos]);

  const totalSum = useMemo(() => {
    const itemSum = Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const item = menu.find(m => m.id === id);
      return sum + (item?.price ?? 0) * qty;
    }, 0);
    const comboSum = Object.entries(selectedCombos).reduce((sum, [id, qty]) => {
      const combo = combos.find(c => c.id === id);
      return sum + (combo?.price ?? 0) * qty;
    }, 0);
    return itemSum + comboSum;
  }, [selectedItems, selectedCombos, menu, combos]);

  // Form submit
  const handleCreateOrder = async () => {
    if (!customerName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên khách hàng.');
      return;
    }
    if (!customerPhone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại.');
      return;
    }
    if (method === 'delivery' && !address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng.');
      return;
    }
    if (totalQuantity === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất 1 món ăn hoặc combo.');
      return;
    }
    if (!pickupDate.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày nhận theo định dạng YYYY-MM-DD.');
      return;
    }

    setLoading(true);
    try {
      // Map items
      const itemsArray: any[] = [];
      
      // 1. Regular menu items
      Object.entries(selectedItems).forEach(([id, qty]) => {
        const item = menu.find(m => m.id === id);
        if (item) {
          itemsArray.push({
            id: item.id,
            menuItemId: item.id,
            name: item.name,
            price: item.price.toFixed(2),
            quantity: qty,
            category: item.category,
          });
        }
      });

      // 2. Combos
      Object.entries(selectedCombos).forEach(([id, qty]) => {
        const combo = combos.find(c => c.id === id);
        if (combo) {
          itemsArray.push({
            id: combo.id,
            menuItemId: combo.id,
            name: `[Combo] ${combo.name}`,
            price: combo.price.toFixed(2),
            quantity: qty,
            category: 'Combo',
          });
        }
      });

      await onSubmit({
        customerName,
        customerPhone,
        method,
        address: method === 'delivery' ? address : 'Abholung / Vor Ort',
        items: itemsArray,
        total: totalSum.toFixed(2),
        notes,
        pickupDate,
        pickupTime,
      });
      onClose();
    } catch (e) {
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
          <Text style={styles.title}>Tự đặt đơn online mới</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Customer info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên khách hàng *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Văn A"
                placeholderTextColor={BrandColors.textMuted}
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại *</Text>
              <TextInput
                style={styles.input}
                placeholder="0912345678"
                placeholderTextColor={BrandColors.textMuted}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hình thức nhận *</Text>
              <View style={styles.row}>
                <Pressable
                  style={[styles.choiceBtn, method === 'pickup' && styles.choiceBtnActive]}
                  onPress={() => setMethod('pickup')}
                >
                  <Text style={[styles.choiceText, method === 'pickup' && styles.choiceTextActive]}>🏪 Khách tự lấy</Text>
                </Pressable>
                <Pressable
                  style={[styles.choiceBtn, method === 'delivery' && styles.choiceBtnActive]}
                  onPress={() => setMethod('delivery')}
                >
                  <Text style={[styles.choiceText, method === 'delivery' && styles.choiceTextActive]}>🚴 Giao hàng</Text>
                </Pressable>
              </View>
            </View>

            {method === 'delivery' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Địa chỉ giao hàng *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập địa chỉ nhà, tên đường..."
                  placeholderTextColor={BrandColors.textMuted}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            )}
          </View>

          {/* Time & schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thời gian nhận hàng</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày nhận (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={BrandColors.textMuted}
                value={pickupDate}
                onChangeText={setPickupDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giờ nhận (Mặc định: asap - làm ngay)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: asap hoặc 18:30"
                placeholderTextColor={BrandColors.textMuted}
                value={pickupTime}
                onChangeText={setPickupTime}
              />
            </View>
          </View>

          {/* Item Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn món ăn & Combo</Text>
            
            {/* Segment control */}
            <View style={styles.segmentRow}>
              <Pressable
                style={[styles.segmentBtn, activeSegment === 'menu' && styles.segmentBtnActive]}
                onPress={() => {
                  setActiveSegment('menu');
                  setSearchQuery('');
                }}
              >
                <Text style={[styles.segmentText, activeSegment === 'menu' && styles.segmentTextActive]}>Món lẻ</Text>
              </Pressable>
              <Pressable
                style={[styles.segmentBtn, activeSegment === 'combo' && styles.segmentBtnActive]}
                onPress={() => {
                  setActiveSegment('combo');
                  setSearchQuery('');
                }}
              >
                <Text style={[styles.segmentText, activeSegment === 'combo' && styles.segmentTextActive]}>Combo</Text>
              </Pressable>
            </View>

            {/* Search Input */}
            <TextInput
              style={styles.searchInput}
              placeholder={activeSegment === 'menu' ? 'Tìm món ăn...' : 'Tìm combo...'}
              placeholderTextColor={BrandColors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Items display */}
            {(menuLoading || combosLoading) ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator color={BrandColors.brand} />
              </View>
            ) : (
              <View style={styles.itemsWrapper}>
                {activeSegment === 'menu' ? (
                  filteredMenu.length === 0 ? (
                    <Text style={styles.emptyText}>Không tìm thấy món ăn nào</Text>
                  ) : (
                    filteredMenu.map(item => {
                      const qty = selectedItems[item.id] ?? 0;
                      return (
                        <View key={item.id} style={styles.itemCard}>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.imageEmoji} {item.name}</Text>
                            <Text style={styles.itemPrice}>{item.price.toLocaleString('de-DE')} €</Text>
                          </View>
                          <View style={styles.controls}>
                            {qty > 0 && (
                              <Pressable style={styles.controlBtn} onPress={() => handleRemoveItem(item.id, false)}>
                                <Text style={styles.controlText}>−</Text>
                              </Pressable>
                            )}
                            {qty > 0 && <Text style={styles.qtyText}>{qty}</Text>}
                            <Pressable style={styles.controlBtn} onPress={() => handleAddItem(item.id, false)}>
                              <Text style={styles.controlText}>+</Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    })
                  )
                ) : (
                  filteredCombos.length === 0 ? (
                    <Text style={styles.emptyText}>Không tìm thấy combo nào</Text>
                  ) : (
                    filteredCombos.map(combo => {
                      const qty = selectedCombos[combo.id] ?? 0;
                      return (
                        <View key={combo.id} style={styles.itemCard}>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>🍱 {combo.name}</Text>
                            {combo.items ? (
                              <Text style={styles.itemDesc} numberOfLines={1}>{combo.items}</Text>
                            ) : null}
                            <Text style={styles.itemPrice}>{combo.price.toLocaleString('de-DE')} €</Text>
                          </View>
                          <View style={styles.controls}>
                            {qty > 0 && (
                              <Pressable style={styles.controlBtn} onPress={() => handleRemoveItem(combo.id, true)}>
                                <Text style={styles.controlText}>−</Text>
                              </Pressable>
                            )}
                            {qty > 0 && <Text style={styles.qtyText}>{qty}</Text>}
                            <Pressable style={styles.controlBtn} onPress={() => handleAddItem(combo.id, true)}>
                              <Text style={styles.controlText}>+</Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    })
                  )
                )}
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú đơn hàng</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Yêu cầu dị ứng, dụng cụ ăn uống, giờ giao..."
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
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Tổng cộng ({totalQuantity} món)</Text>
              <Text style={styles.summaryValue}>{totalSum.toLocaleString('de-DE')} €</Text>
            </View>
            <Pressable style={[styles.confirmBtn, (totalQuantity === 0 || loading) && styles.confirmBtnDisabled]} onPress={handleCreateOrder} disabled={totalQuantity === 0 || loading}>
              <Text style={styles.confirmBtnText}>{loading ? 'Đang tạo...' : '✓ Đặt đơn hàng'}</Text>
            </Pressable>
          </View>
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: BrandColors.surfaceHighlight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  choiceBtnActive: {
    backgroundColor: BrandColors.brandFaded,
    borderColor: BrandColors.brand,
  },
  choiceText: {
    color: BrandColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  choiceTextActive: {
    color: BrandColors.brand,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: BrandColors.surfaceHighlight,
    borderRadius: 8,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: BrandColors.surface,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textMuted,
  },
  segmentTextActive: {
    color: '#fff',
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 13,
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  itemsWrapper: {
    gap: 8,
    maxHeight: 320,
    overflow: 'scroll',
  },
  emptyText: {
    color: BrandColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  itemDesc: {
    color: BrandColors.textMuted,
    fontSize: 11,
  },
  itemPrice: {
    color: BrandColors.brandLight,
    fontSize: 12,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  controlBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BrandColors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    minWidth: 16,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: BrandColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  confirmBtn: {
    backgroundColor: BrandColors.brand,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
