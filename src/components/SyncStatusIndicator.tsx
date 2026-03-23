/**
 * SyncStatusIndicator Component
 * Shows offline sync status and queue information
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, Text as RNText, Animated } from 'react-native';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useTheme } from '../context/ThemeContext';

interface SyncStatusIndicatorProps {
  position?: 'top' | 'bottom';
  animated?: boolean;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ position = 'bottom', animated = true }) => {
  const { isOnline, isSyncing, queueLength, lastSyncTime } = useOfflineSync();
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const statusColor = useMemo(() => {
    if (!isOnline) return colors.danger;
    if (isSyncing) return colors.warning;
    if (queueLength > 0) return colors.info;
    return colors.success;
  }, [isOnline, isSyncing, queueLength, colors]);

  const statusText = useMemo(() => {
    if (!isOnline) return 'Offline - Changes will sync when online';
    if (isSyncing) return `Syncing ${queueLength} changes...`;
    if (queueLength > 0) return `${queueLength} pending changes`;
    return 'All synced';
  }, [isOnline, isSyncing, queueLength]);

  const statusIcon = useMemo(() => {
    if (isSyncing) return '⟳';
    if (!isOnline) return '✕';
    if (queueLength > 0) return '!';
    return '✓';
  }, [isSyncing, isOnline, queueLength]);

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor: statusColor,
        [position === 'bottom' ? 'bottom' : 'top']: 0,
      },
    ],
    [statusColor, position],
  );

  if (isOnline && !isSyncing && queueLength === 0 && !isExpanded) {
    return null;
  }

  return (
    <Pressable
      style={containerStyle}
      onPress={() => setIsExpanded(!isExpanded)}
    >
      <View style={styles.content}>
        <RNText style={[styles.icon, { color: colors.white }]}>
          {isSyncing ? '⟳' : statusIcon}
        </RNText>
        <RNText style={[styles.text, { color: colors.white }]} numberOfLines={1}>
          {statusText}
        </RNText>
        {queueLength > 0 && (
          <RNText style={[styles.badge, { backgroundColor: colors.white, color: statusColor }]}>
            {queueLength}
          </RNText>
        )}
      </View>

      {isExpanded && (
        <View style={styles.details}>
          <DetailRow label="Status" value={isOnline ? 'Online' : 'Offline'} />
          <DetailRow label="Syncing" value={isSyncing ? 'Yes' : 'No'} />
          <DetailRow label="Queue" value={`${queueLength} items`} />
          {lastSyncTime && (
            <DetailRow
              label="Last Sync"
              value={new Date(lastSyncTime).toLocaleTimeString()}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.detailRow}>
      <RNText style={[styles.detailLabel, { color: colors.white }]}>{label}:</RNText>
      <RNText style={[styles.detailValue, { color: colors.white }]}>{value}</RNText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 24,
    textAlign: 'center',
  },
  details: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
  },
});

export default SyncStatusIndicator;
