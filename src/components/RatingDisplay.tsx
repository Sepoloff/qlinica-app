import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

interface RatingDisplayProps {
  rating: number; // 0-5
  count?: number; // Number of reviews
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

/**
 * Component to display star ratings
 */
export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  count,
  size = 'medium',
  showLabel = true,
}) => {
  const starSize = {
    small: 12,
    medium: 16,
    large: 20,
  };

  const fontSize = {
    small: 10,
    medium: 12,
    large: 14,
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={[
              styles.star,
              { fontSize: starSize[size] },
              star <= Math.round(rating) ? styles.starFilled : styles.starEmpty,
            ]}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderStars()}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.ratingText, { fontSize: fontSize[size] }]}>
            {rating.toFixed(1)}
          </Text>
          {count !== undefined && (
            <Text style={[styles.countText, { fontSize: fontSize[size] - 2 }]}>
              ({count})
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  star: {
    marginRight: 2,
  },
  starFilled: {
    color: COLORS.gold,
  },
  starEmpty: {
    color: '#34495E',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  ratingText: {
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#E8E8E8',
  },
  countText: {
    fontFamily: 'DMSans',
    color: '#8895a0',
    marginLeft: 2,
  },
});
