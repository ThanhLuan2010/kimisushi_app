import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BrandColors } from '@/constants/theme';

interface LoginFormProps {
  onLogin: (phone: string, password: string) => Promise<boolean>;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!phone.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setError('');
    setLoading(true);
    const ok = await onLogin(phone.trim(), password);
    setLoading(false);
    if (!ok) setError('Tài khoản hoặc mật khẩu không đúng');
  };

  return (
    <View style={styles.container}>
      {/* Logo area */}
      <View style={styles.logoArea}>
        <Text style={styles.logoEmoji}>🍣</Text>
        <Text style={styles.logoTitle}>KimiSushi</Text>
        <Text style={styles.logoSub}>Hệ thống quản lý nhà hàng</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số điện thoại / Email</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="0901234567"
            placeholderTextColor={BrandColors.textMuted}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={BrandColors.textMuted}
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Remember me */}
        <Pressable
          style={styles.rememberRow}
          onPress={() => setRememberMe(v => !v)}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.rememberLabel}>Ghi nhớ đăng nhập</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.btnText}>Đăng nhập</Text>
          }
        </Pressable>

        <Text style={styles.hint}>Demo: Nhập bất kỳ SĐT & mật khẩu</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 40,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoArea: {
    alignItems: 'center',
    gap: 8,
  },
  logoEmoji: {
    fontSize: 64,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textSecondary,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  error: {
    color: BrandColors.danger,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BrandColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: BrandColors.brand,
    borderColor: BrandColors.brand,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  rememberLabel: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    fontWeight: '500',
  },
  btn: {
    backgroundColor: BrandColors.brand,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnPressed: {
    backgroundColor: BrandColors.brandDark,
    transform: [{ scale: 0.98 }],
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  hint: {
    fontSize: 12,
    color: BrandColors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
