import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * NetworkStatusBar - Shows network connectivity status
 * Animates in/out when network status changes
 */
export const NetworkStatusBar: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const slideAnim = React.useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (!isOnline) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOnline]);

  if (isOnline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.text}>📡 Sem conexão à internet</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#DC3545',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
});
