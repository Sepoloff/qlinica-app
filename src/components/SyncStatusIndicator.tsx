import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { COLORS } from '../constants/Colors';
import { offlineSyncService, type SyncStatus } from '../services/offlineSyncService';

interface SyncStatusIndicatorProps {
  onSyncNow?: () => void;
  compact?: boolean;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  onSyncNow,
  compact = false,
}) => {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    queueCount: 0,
  });

  const [pulseAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribeToSyncStatusChanges((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, []);

  // Animate pulsing when syncing
  useEffect(() => {
    if (status.isSyncing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnimation.setValue(0);
    }
  }, [status.isSyncing, pulseAnimation]);

  const opacity = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const getStatusColor = () => {
    if (!status.isOnline) return '#FF6B6B'; // Red
    if (status.isSyncing) return COLORS.gold; // Gold
    if (status.queueCount > 0) return '#FFB84D'; // Orange
    return '#4CAF50'; // Green
  };

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline';
    if (status.isSyncing) return 'A sincronizar...';
    if (status.queueCount > 0) return `Pendentes: ${status.queueCount}`;
    return 'Sincronizado';
  };

  const getStatusIcon = () => {
    if (!status.isOnline) return '📡';
    if (status.isSyncing) return '⏳';
    if (status.queueCount > 0) return '⚠️';
    return '✓';
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          { backgroundColor: getStatusColor() + '20' },
        ]}
        onPress={onSyncNow}
        disabled={!status.queueCount || status.isSyncing}
      >
        <Animated.Text
          style={[
            styles.compactIcon,
            { opacity: status.isSyncing ? opacity : 1 },
          ]}
        >
          {getStatusIcon()}
        </Animated.Text>
        <Text style={[styles.compactText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getStatusColor() + '10',
          borderColor: getStatusColor() + '50',
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.statusInfo}>
          <Animated.Text
            style={[
              styles.icon,
              { opacity: status.isSyncing ? opacity : 1 },
            ]}
          >
            {getStatusIcon()}
          </Animated.Text>
          <View style={styles.textContainer}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
            {status.queueCount > 0 && (
              <Text style={styles.details}>
                {status.queueCount} operação{status.queueCount !== 1 ? 's' : ''} aguardando sincronização
              </Text>
            )}
            {status.lastSyncTime && (
              <Text style={styles.lastSync}>
                Última sincronização: {formatTime(status.lastSyncTime)}
              </Text>
            )}
          </View>
        </View>

        {status.queueCount > 0 && !status.isSyncing && (
          <TouchableOpacity
            style={[styles.syncButton, { borderColor: getStatusColor() }]}
            onPress={onSyncNow}
            activeOpacity={0.7}
          >
            <Text style={[styles.syncButtonText, { color: getStatusColor() }]}>
              Sincronizar
            </Text>
          </TouchableOpacity>
        )}

        {status.isSyncing && (
          <ActivityIndicator color={getStatusColor()} size="small" />
        )}
      </View>

      {/* Status indicator dot */}
      <Animated.View
        style={[
          styles.statusDot,
          { backgroundColor: getStatusColor(), opacity: status.isSyncing ? opacity : 1 },
        ]}
      />
    </View>
  );
};

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes}m`;
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  compactIcon: {
    fontSize: 14,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'DMSans',
  },
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 12,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  statusInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans',
    marginBottom: 2,
  },
  details: {
    fontSize: 11,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginBottom: 2,
  },
  lastSync: {
    fontSize: 10,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    fontStyle: 'italic',
  },
  syncButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  syncButtonText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
  statusDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
