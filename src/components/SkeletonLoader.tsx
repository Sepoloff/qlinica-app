'use strict';

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { COLORS } from '../constants/Colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
  variant?: 'line' | 'circle' | 'card';
  count?: number;
  lines?: number;
}

interface SkeletonLoaderComponent extends React.FC<SkeletonLoaderProps> {
  Line?: React.FC<SkeletonLoaderProps>;
  Circle?: React.FC<SkeletonLoaderProps>;
  Card?: React.FC<SkeletonLoaderProps & { lines?: number }>;
  BookingItem?: React.FC<{ count?: number }>;
  List?: React.FC<{ count?: number; variant?: 'text' | 'card' | 'booking' }>;
}

interface SkeletonGroup {
  lines?: number;
  spacing?: number;
  containerStyle?: ViewStyle;
  lineStyle?: ViewStyle;
  variant?: 'text' | 'card' | 'booking';
}

/**
 * Skeleton Loader Component
 * 
 * Reusable skeleton loading states with multiple variants
 * - Animated shimmer effect
 * - Multiple shapes: line, circle, card
 * - Skeleton groups for complex layouts
 * 
 * @example
 * <SkeletonLoader width="100%" height={40} />
 * <SkeletonLoader.Card />
 * <SkeletonLoader.BookingItem count={3} />
 */
export const SkeletonLoader: SkeletonLoaderComponent = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animated = true,
  variant = 'line',
}) => {
  const opacity = new Animated.Value(0.6);

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated, opacity]);

  const renderVariant = () => {
    switch (variant) {
      case 'circle':
        return (
          <Animated.View
            style={[
              styles.skeleton,
              styles.circle,
              { width: height, height, opacity } as any,
              style,
            ]}
          />
        );
      case 'card':
        return (
          <Animated.View
            style={[
              styles.skeleton,
              styles.card,
              { opacity } as any,
              style,
            ]}
          />
        );
      default:
        return (
          <Animated.View
            style={[
              styles.skeleton,
              { width, height, borderRadius, opacity } as any,
              style,
            ]}
          />
        );
    }
  };

  return renderVariant();
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.greyLight || '#E8E8E8',
  },
  circle: {
    borderRadius: 999,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
});

// Skeleton Line
SkeletonLoader.Line = (props: SkeletonLoaderProps) => (
  <SkeletonLoader variant="line" height={16} {...props} />
);

// Skeleton Circle (Avatar)
SkeletonLoader.Circle = (props: SkeletonLoaderProps) => (
  <SkeletonLoader
    variant="circle"
    width={48}
    height={48}
    {...props}
  />
);

// Skeleton Card
SkeletonLoader.Card = (props: SkeletonLoaderProps & { lines?: number }) => {
  const styles_local = StyleSheet.create({
    cardContainer: {
      marginBottom: 16,
      borderRadius: 12,
      overflow: 'hidden',
    },
    cardContent: {
      padding: 12,
    },
  });
  return (
    <View style={styles_local.cardContainer}>
      <SkeletonLoader height={200} width="100%" borderRadius={12} {...props} />
      <View style={styles_local.cardContent}>
        {Array.from({ length: props.lines || 2 }).map((_, i) => (
          <SkeletonLoader
            key={i}
            height={14}
            width={i === 0 ? '80%' : '100%'}
            style={{ marginBottom: 8 }}
          />
        ))}
      </View>
    </View>
  );
};

// Skeleton Booking Item
SkeletonLoader.BookingItem = (props: { count?: number }) => (
  <View>
    {Array.from({ length: props.count || 1 }).map((_, i) => (
      <View key={i} style={styles.bookingItem}>
        <SkeletonLoader.Circle style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <SkeletonLoader height={14} width="70%" style={{ marginBottom: 8 }} />
          <SkeletonLoader height={12} width="50%" />
        </View>
      </View>
    ))}
  </View>
);

// Skeleton List
SkeletonLoader.List = (props: SkeletonGroup) => {
  const { lines = 5, spacing = 12, variant = 'text' } = props;
  
  return (
    <View style={props.containerStyle}>
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={{ marginBottom: spacing }}>
          {variant === 'text' && (
            <>
              <SkeletonLoader height={16} width={i === 0 ? '80%' : '100%'} />
              {i < lines - 1 && <SkeletonLoader height={12} width="90%" style={{ marginTop: 4 }} />}
            </>
          )}
          {variant === 'card' && (
            <SkeletonLoader height={120} borderRadius={12} />
          )}
          {variant === 'booking' && (
            <View style={styles.bookingItemRow}>
              <SkeletonLoader.Circle />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <SkeletonLoader height={14} width="70%" style={{ marginBottom: 6 }} />
                <SkeletonLoader height={12} width="50%" />
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles_extended = StyleSheet.create({
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
});

Object.assign(styles, styles_extended);

export default SkeletonLoader;
