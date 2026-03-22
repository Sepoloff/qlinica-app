/**
 * OfflineQueueStatus
 * Displays current offline queue status and sync controls
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/Colors';
import { useOfflineSync } from '../hooks/useOfflineSync';

export interface OfflineQueueStatusProps {
  visible?: boolean;
  position?: 'top' | 'bottom';
  onSyncPress?: () => void;
}

export const OfflineQueueStatus: React.FC<OfflineQueueStatusProps> = ({
  visible = true,
  position = 'bottom',
  onSyncPress,
}) => {
  const { queueCount, isSyncing, sync } = useOfflineSync();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible && queueCount > 0) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [queueCount, visible, scaleAnim]);

  if (!visible || queueCount === 0) {
    return null;
  }

  const handleSync = async () => {
    try {
      await sync();
      onSyncPress?.();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          [position === 'top' ? 'top' : 'bottom']: 0,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.statusInfo}>
          <View style={styles.indicator}>
            <View style={styles.dot} />
          </View>
          <View style={styles.text}>
            <Text style={styles.title}>Operações Pendentes</Text>
            <Text style={styles.subtitle}>{queueCount} agendamento(s) aguardando sincronização</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.syncButton,
            isSyncing && styles.syncButtonDisabled,
          ]}
          onPress={handleSync}
          disabled={isSyncing}
        >
          <Text style={styles.syncButtonText}>
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: COLORS.warning,
    zIndex: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  indicator: {
    marginRight: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.offWhite,
  },
  syncButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
