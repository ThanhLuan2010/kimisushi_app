import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';
import { useTables } from '@/hooks/use-tables';
import type { Table } from '@/types';

interface TableAdminModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'tables' | 'zones';

export function TableAdminModal({ visible, onClose }: TableAdminModalProps) {
  const {
    tables,
    zones,
    loading,
    refresh,
    addTable,
    updateTable,
    deleteTable,
    updateZone,
    deleteZone,
  } = useTables();

  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>('tables');

  // Form states for adding table
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableZone, setNewTableZone] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');

  // Editing state for table
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editTableNum, setEditTableNum] = useState('');
  const [editTableZone, setEditTableZone] = useState('');
  const [editTableCapacity, setEditTableCapacity] = useState('');

  // Editing state for zone
  const [editingZoneName, setEditingZoneName] = useState<string | null>(null);
  const [editZoneNewName, setEditZoneNewName] = useState('');

  // Add new zone
  const [newZoneName, setNewZoneName] = useState('');

  // Local loading states
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [isAddingZone, setIsAddingZone] = useState(false);

  const handleAddTable = async () => {
    const num = newTableNum.trim();
    const cap = parseInt(newTableCapacity, 10);
    const zoneName = newTableZone.trim();

    if (!num) {
      Alert.alert('Lỗi', 'Vui lòng nhập số bàn (ví dụ: 1, A1, VIP-2).');
      return;
    }
    if (!zoneName) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên khu vực.');
      return;
    }
    if (isNaN(cap) || cap <= 0) {
      Alert.alert('Lỗi', 'Sức chứa phải là số nguyên dương.');
      return;
    }

    // Kiểm tra số bàn đã tồn tại trong khu
    const exists = tables.some(
      t => t.number === num && t.zone.toLowerCase() === zoneName.toLowerCase()
    );
    if (exists) {
      Alert.alert('Lỗi', `Bàn ${num} đã tồn tại trong ${zoneName}.`);
      return;
    }

    try {
      setIsAddingTable(true);
      await addTable(num, zoneName, cap);
      setNewTableNum('');
      setNewTableCapacity('4');
      Alert.alert('Thành công', `Đã thêm Bàn ${num} vào ${zoneName}.`);
    } catch (e: any) {
      Alert.alert('Lỗi', `Không thể thêm bàn: ${e.message}`);
    } finally {
      setIsAddingTable(false);
    }
  };

  const handleStartEditTable = (table: Table) => {
    setEditingTableId(table.id);
    setEditTableNum(String(table.number));
    setEditTableZone(table.zone);
    setEditTableCapacity(String(table.capacity));
  };

  const handleSaveEditTable = async () => {
    if (!editingTableId) return;

    const num = editTableNum.trim();
    const cap = parseInt(editTableCapacity, 10);
    const zoneName = editTableZone.trim();

    if (!num) {
      Alert.alert('Lỗi', 'Số bàn không được để trống.');
      return;
    }
    if (!zoneName) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên khu vực.');
      return;
    }
    if (isNaN(cap) || cap <= 0) {
      Alert.alert('Lỗi', 'Sức chứa phải là số nguyên dương.');
      return;
    }

    try {
      await updateTable(editingTableId, num, zoneName, cap);
      setEditingTableId(null);
      Alert.alert('Thành công', 'Đã cập nhật thông tin bàn.');
    } catch (e: any) {
      Alert.alert('Lỗi', `Không thể cập nhật bàn: ${e.message}`);
    }
  };

  const handleDeleteTable = (id: string, num: number, status: string) => {
    const isOccupied = status !== 'empty';
    const warningMessage = isOccupied 
      ? `CẢNH BÁO: Bàn ${num} đang có khách hoặc có order. Bạn có chắc chắn muốn XÓA ÉP bàn này không?`
      : `Bạn có chắc chắn muốn xóa Bàn ${num}?`;

    Alert.alert(
      'Xác nhận xóa',
      warningMessage,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTable(id);
            } catch (e: any) {
              Alert.alert('Lỗi', `Không thể xóa bàn: ${e.message}`);
            }
          },
        },
      ]
    );
  };

  const handleAddZoneOnly = async () => {
    const name = newZoneName.trim();
    if (!name) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên khu vực mới.');
      return;
    }
    const exists = zones.includes(name);
    if (exists) {
      Alert.alert('Lỗi', 'Khu vực này đã tồn tại.');
      return;
    }
    
    try {
      setIsAddingZone(true);
      // To add a zone, we create a placeholder table in it
      await addTable('1', name, 4);
      setNewZoneName('');
      Alert.alert('Thành công', `Đã tạo khu ${name} (với Bàn 1 mặc định).`);
    } catch (e: any) {
      Alert.alert('Lỗi', `Không thể tạo khu vực: ${e.message}`);
    } finally {
      setIsAddingZone(false);
    }
  };

  const handleRenameZone = async (oldName: string) => {
    const newName = editZoneNewName.trim();
    if (!newName) {
      Alert.alert('Lỗi', 'Vên khu vực mới không được để trống.');
      return;
    }
    if (newName.toLowerCase() === oldName.toLowerCase()) {
      setEditingZoneName(null);
      return;
    }

    try {
      await updateZone(oldName, newName);
      setEditingZoneName(null);
      Alert.alert('Thành công', `Đã đổi tên khu vực từ ${oldName} sang ${newName}.`);
    } catch (e: any) {
      Alert.alert('Lỗi', `Không thể đổi tên khu vực: ${e.message}`);
    }
  };

  const handleDeleteZone = (zoneName: string) => {
    Alert.alert(
      'Xác nhận xóa khu',
      `Xóa khu "${zoneName}" sẽ xóa TẤT CẢ các bàn thuộc khu vực này. Bạn có chắc chắn muốn tiếp tục?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa toàn bộ',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteZone(zoneName);
            } catch (e: any) {
              Alert.alert('Lỗi', `Không thể xóa khu vực: ${e.message}`);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView 
        style={[styles.safe, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.headerTitle}>⚙️ Cấu hình Sơ đồ</Text>
            {loading && <ActivityIndicator size="small" color={BrandColors.brand} />}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs switcher */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tables' && styles.activeTab]}
            onPress={() => setActiveTab('tables')}
          >
            <Text style={[styles.tabText, activeTab === 'tables' && styles.activeTabText]}>
              Bàn ăn ({tables.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'zones' && styles.activeTab]}
            onPress={() => setActiveTab('zones')}
          >
            <Text style={[styles.tabText, activeTab === 'zones' && styles.activeTabText]}>
              Khu vực ({zones.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor="#FF4D2E" // BrandColors.brand
              colors={['#FF4D2E']} // For Android
            />
          }
        >
          {activeTab === 'tables' ? (
            <>
              {/* Add Table Form */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>➕ Thêm bàn mới</Text>
                
                <View style={styles.row}>
                  <View style={styles.inputCol}>
                    <Text style={styles.label}>Số bàn (có thể dùng chữ+số)</Text>
                    <TextInput
                      style={styles.input}
                      value={newTableNum}
                      onChangeText={setNewTableNum}
                      keyboardType="default"
                      autoCapitalize="characters"
                      placeholder="vd: 12, A1, VIP-2"
                      placeholderTextColor="#555"
                    />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.label}>Sức chứa</Text>
                    <TextInput
                      style={styles.input}
                      value={newTableCapacity}
                      onChangeText={setNewTableCapacity}
                      keyboardType="number-pad"
                      placeholder="vd: 4"
                      placeholderTextColor="#555"
                    />
                  </View>
                </View>

                <Text style={styles.label}>Khu vực (Nhập mới hoặc bấm chọn bên dưới)</Text>
                <TextInput
                  style={styles.input}
                  value={newTableZone}
                  onChangeText={setNewTableZone}
                  placeholder="vd: Khu VIP, Phòng 3..."
                  placeholderTextColor="#555"
                />

                {/* Quick select zone */}
                {zones.length > 0 && (
                  <View style={styles.quickZonesContainer}>
                    {zones.map(z => (
                      <TouchableOpacity
                        key={z}
                        style={[styles.quickZoneBadge, newTableZone === z && styles.selectedQuickZone]}
                        onPress={() => setNewTableZone(z)}
                      >
                        <Text style={[styles.quickZoneText, newTableZone === z && styles.selectedQuickZoneText]}>{z}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity style={[styles.primaryBtn, isAddingTable && { opacity: 0.7 }]} onPress={handleAddTable} disabled={isAddingTable}>
                  {isAddingTable ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Thêm bàn ăn</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Tables List */}
              <Text style={styles.sectionTitle}>Danh sách bàn ăn hiện tại</Text>
              {tables.map(table => (
                <View key={table.id} style={styles.listItem}>
                  {editingTableId === table.id ? (
                    // Edit Table Form inside List
                    <View style={{ flex: 1, gap: 8 }}>
                      <Text style={styles.editTitle}>Đang sửa Bàn {table.number}</Text>
                      <View style={styles.row}>
                        <View style={styles.inputCol}>
                          <Text style={styles.label}>Số bàn (có thể dùng chữ+số)</Text>
                          <TextInput
                            style={styles.inputEdit}
                            value={editTableNum}
                            onChangeText={setEditTableNum}
                            keyboardType="default"
                            autoCapitalize="characters"
                          />
                        </View>
                        <View style={styles.inputCol}>
                          <Text style={styles.label}>Sức chứa</Text>
                          <TextInput
                            style={styles.inputEdit}
                            value={editTableCapacity}
                            onChangeText={setEditTableCapacity}
                            keyboardType="number-pad"
                          />
                        </View>
                      </View>
                      <Text style={styles.label}>Khu vực</Text>
                      <TextInput
                        style={styles.inputEdit}
                        value={editTableZone}
                        onChangeText={setEditTableZone}
                      />
                      <View style={[styles.row, { marginTop: 8 }]}>
                        <TouchableOpacity style={[styles.btnSmall, { backgroundColor: BrandColors.success }]} onPress={handleSaveEditTable}>
                          <Text style={styles.btnSmallText}>Lưu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnSmall, { backgroundColor: '#333' }]} onPress={() => setEditingTableId(null)}>
                          <Text style={styles.btnSmallText}>Hủy</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    // Normal Row
                    <>
                      <View style={styles.listInfo}>
                        <Text style={styles.listBoldText}>Bàn {table.number}</Text>
                        <Text style={styles.listSubText}>Khu vực: {table.zone}  |  Sức chứa: {table.capacity} khách</Text>
                        <Text style={[styles.listStatusText, { color: table.status === 'empty' ? BrandColors.success : BrandColors.danger }]}>
                          Trạng thái: {table.status === 'empty' ? 'Trống' : table.status === 'occupied' ? 'Có khách' : 'Đặt trước'}
                        </Text>
                      </View>
                      <View style={styles.listActions}>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.06)' }]}
                          onPress={() => handleStartEditTable(table)}
                        >
                          <Text style={styles.actionBtnText}>✏️ Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: BrandColors.dangerFaded }]}
                          onPress={() => handleDeleteTable(table.id, table.number as any, table.status)}
                        >
                          <Text style={[styles.actionBtnText, { color: BrandColors.danger }]}>🗑️ Xóa</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ))}
            </>
          ) : (
            <>
              {/* Add Zone Form */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>➕ Thêm khu vực mới</Text>
                <TextInput
                  style={styles.input}
                  value={newZoneName}
                  onChangeText={setNewZoneName}
                  placeholder="vd: Tầng 2, Sân vườn..."
                  placeholderTextColor="#555"
                />
                <TouchableOpacity style={[styles.primaryBtn, isAddingZone && { opacity: 0.7 }]} onPress={handleAddZoneOnly} disabled={isAddingZone}>
                  {isAddingZone ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Thêm khu vực</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Zones List */}
              <Text style={styles.sectionTitle}>Danh sách khu vực hiện tại</Text>
              {zones.map(zone => (
                <View key={zone} style={styles.listItem}>
                  {editingZoneName === zone ? (
                    // Edit Zone Form
                    <View style={{ flex: 1, gap: 8 }}>
                      <Text style={styles.editTitle}>Đang sửa Khu: {zone}</Text>
                      <TextInput
                        style={styles.inputEdit}
                        value={editZoneNewName}
                        onChangeText={setEditZoneNewName}
                      />
                      <View style={styles.row}>
                        <TouchableOpacity style={[styles.btnSmall, { backgroundColor: BrandColors.success }]} onPress={() => handleRenameZone(zone)}>
                          <Text style={styles.btnSmallText}>Lưu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnSmall, { backgroundColor: '#333' }]} onPress={() => setEditingZoneName(null)}>
                          <Text style={styles.btnSmallText}>Hủy</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    // Normal Zone Row
                    <>
                      <View style={styles.listInfo}>
                        <Text style={styles.listBoldText}>{zone}</Text>
                        <Text style={styles.listSubText}>
                          Số bàn: {tables.filter(t => t.zone === zone).length} bàn
                        </Text>
                      </View>
                      <View style={styles.listActions}>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.06)' }]}
                          onPress={() => {
                            setEditingZoneName(zone);
                            setEditZoneNewName(zone);
                          }}
                        >
                          <Text style={styles.actionBtnText}>✏️ Đổi tên</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: BrandColors.dangerFaded }]}
                          onPress={() => handleDeleteZone(zone)}
                        >
                          <Text style={[styles.actionBtnText, { color: BrandColors.danger }]}>🗑️ Xóa khu</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF4D2E',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B6B8A',
  },
  activeTabText: {
    color: '#FF4D2E',
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputCol: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A9AB0',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0D0D1A',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
  },
  inputEdit: {
    backgroundColor: '#1A1A2E',
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#fff',
  },
  quickZonesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  quickZoneBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectedQuickZone: {
    backgroundColor: 'rgba(255, 77, 46, 0.15)',
    borderColor: 'rgba(255, 77, 46, 0.4)',
    borderWidth: 1,
  },
  quickZoneText: {
    fontSize: 12,
    color: '#9A9AB0',
  },
  selectedQuickZoneText: {
    color: '#FF4D2E',
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: '#FF4D2E',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    marginTop: 10,
  },
  listItem: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  listInfo: {
    flex: 1,
    gap: 4,
    marginRight: 10,
  },
  listBoldText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  listSubText: {
    fontSize: 12,
    color: '#9A9AB0',
  },
  listStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listActions: {
    flexDirection: 'column',
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  editTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF4D2E',
    marginBottom: 4,
  },
  btnSmall: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnSmallText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
