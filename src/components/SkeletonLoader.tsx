import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS } from '../constants/Colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  marginBottom?: number;
  count?: number;
  variant?: 'text' | 'circle' | 'rect';
  animated?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 12,
  borderRadius = 4,
  marginBottom = 8,
  count = 1,
  variant = 'text',
  animated = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [animatedValue, animated]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const getSize = () => {
    if (variant === 'circle') {
      return { width: height, height, borderRadius: height / 2 };
    }
    return { width, height, borderRadius };
  };

  const items = Array.from({ length: count }, (_, index) => (
    <Animated.View
      key={index}
      style={[
        styles.skeleton,
        getSize() as any,
        { marginBottom: index < count - 1 ? marginBottom : 0 },
        animated && { opacity },
      ]}
    />
  ));

  return <View>{items}</View>;
};

export const BookingCardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <View style={styles.cardContainer}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.card}>
          <SkeletonLoader width="60%" height={16} marginBottom={12} />
          <SkeletonLoader width="40%" height={14} marginBottom={16} />
          <SkeletonLoader width="100%" height={12} marginBottom={8} count={3} />
        </View>
      ))}
    </View>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.profileContainer}>
      <SkeletonLoader
        width={120}
        height={120}
        borderRadius={60}
        marginBottom={16}
        variant="circle"
      />
      <SkeletonLoader width="70%" height={18} marginBottom={8} />
      <SkeletonLoader width="50%" height={14} marginBottom={24} />
      <SkeletonLoader width="100%" height={12} marginBottom={8} count={4} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E8E8E8',
  },
  cardContainer: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
});
