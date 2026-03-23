/**
 * Memoized TherapistCard Component  
 * Optimized to prevent unnecessary re-renders
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { COLORS } from '../constants/Colors';

export interface TherapistCardProps {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  image?: string;
  available: boolean;
  price?: number;
  isSelected?: boolean;
  onPress: (id: string) => void;
}

const TherapistCardComponent: React.FC<TherapistCardProps> = ({
  id,
  name,
  specialty,
  rating,
  reviewCount,
  image,
  available,
  price,
  isSelected = false,
  onPress,
}) => {
  const renderRating = () => {
    const fullStars = Math.floor(rating);
    const stars = Array(5)
      .fill(0)
      .map((_, i) => (i < fullStars ? '⭐' : '☆'))
      .join('');
    return stars;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        !available && styles.cardDisabled,
      ]}
      onPress={() => onPress(id)}
      disabled={!available}
      activeOpacity={available ? 0.7 : 1}
    >
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
          defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
        />
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.specialty}>{specialty}</Text>

        <View style={styles.ratingRow}>
          <Text style={styles.stars}>{renderRating()}</Text>
          <Text style={styles.rating}>
            {rating.toFixed(1)} ({reviewCount})
          </Text>
        </View>

        {price && (
          <Text style={styles.price}>
            €{price.toFixed(2)}/sessão
          </Text>
        )}

        <View style={styles.availabilityBadge}>
          <View
            style={[
              styles.statusDot,
              available ? styles.statusAvailable : styles.statusUnavailable,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              available ? styles.statusAvailableText : styles.statusUnavailableText,
            ]}
          >
            {available ? 'Disponível' : 'Indisponível'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Custom comparison for props
 */
const arePropsEqual = (
  prev: TherapistCardProps,
  next: TherapistCardProps
): boolean => {
  return (
    prev.id === next.id &&
    prev.name === next.name &&
    prev.rating === next.rating &&
    prev.available === next.available &&
    prev.isSelected === next.isSelected
  );
};

export const TherapistCardMemo = memo(TherapistCardComponent, arePropsEqual);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 13,
    color: COLORS.grey,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    fontSize: 14,
    marginRight: 6,
  },
  rating: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: '600',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: 8,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusAvailable: {
    backgroundColor: '#4CAF50',
  },
  statusUnavailable: {
    backgroundColor: COLORS.grey,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusAvailableText: {
    color: '#4CAF50',
  },
  statusUnavailableText: {
    color: COLORS.grey,
  },
});

export default TherapistCardMemo;
