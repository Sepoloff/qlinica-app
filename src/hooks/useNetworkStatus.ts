import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { analyticsService } from '../services/analyticsService';

export interface NetworkStatusType {
  isOnline: boolean;
  type: string;
  lastChanged: Date;
}

/**
 * Hook to track network connectivity status
 * Updates component when network status changes
 */
export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatusType>({
    isOnline: true,
    type: 'unknown',
    lastChanged: new Date(),
  });

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      const isConnected = state.isConnected && state.isInternetReachable !== false;
      
      setStatus(prev => {
        // Only update if status actually changed
        if (prev.isOnline !== isConnected) {
          const newStatus = {
            isOnline: isConnected,
            type: state.type || 'unknown',
            lastChanged: new Date(),
          };

          // Track network status changes
          analyticsService.trackEvent('network_status_changed', {
            isOnline: isConnected,
            type: state.type,
          });

          console.log(`📡 Network status: ${isConnected ? 'ONLINE' : 'OFFLINE'} (${state.type})`);
          
          return newStatus;
        }
        return prev;
      });
    });

    // Check initial state
    NetInfo.fetch().then((state: any) => {
      const isConnected = state.isConnected && state.isInternetReachable !== false;
      setStatus({
        isOnline: isConnected,
        type: state.type || 'unknown',
        lastChanged: new Date(),
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isOnline: status.isOnline,
    type: status.type,
    lastChanged: status.lastChanged,
  };
};
