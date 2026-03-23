/**
 * OfflineIndicator Component
 * Shows offline status and queued requests information
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useNetworkStatus } from '../utils/networkStatus';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { COLORS } from '../constants/Colors';

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom';
  showQueueInfo?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'top',
  showQueueInfo = true,
}) => {
  const { isOnline } = useNetworkStatus();
  const { queueSize, clearQueue } = useOfflineQueue();
  const [isExpanded, setIsExpanded] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const [isProcessing, setIsProcessing] = useState(false);

  // Animate in/out when offline status changes
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOnline ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOnline, slideAnim]);

  if (isOnline && queueSize === 0) {
    return null;
  }

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [position === 'top' ? -100 : 100, 0],
  });

  const hasQueuedRequests = queueSize > 0;
  const backgroundColor = isOnline ? COLORS.warning : COLORS.error;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
        position === 'bottom' && styles.bottomPosition,
      ]}
    >
      <View style={[styles.indicator, { backgroundColor }]}>
        <View style={styles.content}>
          <Text style={styles.icon}>
            {isProcessing ? '⏳' : isOnline ? '⚠️' : '📵'}
          </Text>
          <View style={styles.textContainer}>
            <Text style={styles.mainText}>
              {isProcessing
                ? 'Sincronizando dados...'
                : isOnline
                ? 'Conectado'
                : 'Sem conexão'}
            </Text>
            {hasQueuedRequests && showQueueInfo && (
              <Text style={styles.subText}>
                {queueSize} {queueSize === 1 ? 'ação' : 'ações'} aguardando
              </Text>
            )}
          </View>
        </View>

        {hasQueuedRequests && showQueueInfo && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {isExpanded && hasQueuedRequests && showQueueInfo && (
        <View style={[styles.details, { backgroundColor }]}>
          <DetailRow label="Total na fila:" value={String(queueSize)} />

          {isOnline && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={async () => {
                await clearQueue();
                setIsExpanded(false);
              }}
            >
              <Text style={styles.clearButtonText}>Limpar Fila</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailText}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  bottomPosition: {
    top: 'auto',
    bottom: 0,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  mainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  subText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  expandButton: {
    padding: 8,
    marginLeft: 8,
  },
  expandIcon: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  details: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  clearButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 6,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
