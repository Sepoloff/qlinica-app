import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../constants/Colors';

export interface ServiceCardProps {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  price: number;
  duration: number;
  rating?: number;
  isSelected?: boolean;
  onPress: (id: string) => void;
  style?: ViewStyle;
  variant?: 'compact' | 'detailed';
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  name,
  description,
  icon,
  price,
  duration,
  rating,
  isSelected = false,
  onPress,
  style,
  variant = 'detailed',
}) => {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[
          styles.compactCard,
          isSelected && styles.compactCardSelected,
          style,
        ]}
        onPress={() => onPress(id)}
        activeOpacity={0.7}
      >
        <Text style={styles.compactIcon}>{icon || '✨'}</Text>
        <Text style={[styles.compactName, isSelected && styles.compactNameSelected]}>
          {name}
        </Text>
      </TouchableOpacity>
    );
  }

  // Detailed variant
  return (
    <TouchableOpacity
      style={[
        styles.detailedCard,
        isSelected && styles.detailedCardSelected,
        style,
      ]}
      onPress={() => onPress(id)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon || '✨'}</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.duration}>
            ⏱️ {duration} min
          </Text>
        </View>
      </View>

      {/* Description */}
      {description && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Preço</Text>
          <Text style={styles.price}>{formatPrice(price)}</Text>
        </View>

        {rating !== undefined && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Rating</Text>
            <View style={styles.rating}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
            </View>
          </View>
        )}

        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Compact variant
  compactCard: {
    width: '31%',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: `${COLORS.gold}20`,
  },
  compactCardSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  compactIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  compactName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 13,
    fontFamily: 'DMSans',
  },
  compactNameSelected: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },

  // Detailed variant
  detailedCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: `${COLORS.gold}20`,
  },
  detailedCardSelected: {
    backgroundColor: `${COLORS.gold}15`,
    borderColor: COLORS.gold,
  },

  header: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: `${COLORS.gold}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  duration: {
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 2,
    fontFamily: 'DMSans',
  },

  description: {
    fontSize: 12,
    color: COLORS.grey,
    lineHeight: 16,
    marginBottom: 12,
    fontFamily: 'DMSans',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.gold}15`,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginBottom: 3,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },

  ratingContainer: {
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 11,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginBottom: 3,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  star: {
    fontSize: 12,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },

  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
