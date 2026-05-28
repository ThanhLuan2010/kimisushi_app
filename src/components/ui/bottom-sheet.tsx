import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { BrandColors } from '@/constants/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Height fraction of screen height (0-1), default 0.6 */
  heightFraction?: number;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export function BottomSheet({
  visible,
  onClose,
  children,
  heightFraction = 0.6,
}: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <View style={styles.wrapper}>
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <Pressable style={StyleSheet.absoluteFill as object} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            { height: SCREEN_HEIGHT * heightFraction, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: BrandColors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: BrandColors.borderStrong,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BrandColors.textMuted,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
});
