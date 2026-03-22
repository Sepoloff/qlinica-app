import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

interface RatingProps {
  value: number;
  max?: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  onRate,
  readOnly = true,
  size = 'medium',
  showValue = true,
}) => {
  const sizes = {
    small: 16,
    medium: 20,
    large: 28,
  };

  const starSize = sizes[size];

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {Array.from({ length: max }).map((_, i) => {
          const isFilled = i < Math.floor(value);
          const isHalf = i < value && i >= Math.floor(value);

          return (
            <TouchableOpacity
              key={i}
              onPress={() => !readOnly && onRate?.(i + 1)}
              disabled={readOnly}
              style={styles.starButton}
            >
              <Text style={{ fontSize: starSize }}>
                {isFilled || isHalf ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showValue && (
        <Text style={styles.value}>{value.toFixed(1)}</Text>
      )}
    </View>
  );
};

interface RatingListItemProps {
  rating: number;
  label?: string;
  count?: number;
}

export const RatingListItem: React.FC<RatingListItemProps> = ({
  rating,
  label,
  count,
}) => {
  return (
    <View style={styles.listItemContainer}>
      <View style={styles.listItemContent}>
        <Rating value={rating} readOnly size="small" showValue={false} />
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
      {count !== undefined && (
        <Text style={styles.count}>({count})</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  starButton: {
    padding: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  count: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
});
