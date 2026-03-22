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

export interface TherapistCardProps {
  id: string;
  name: string;
  specialty: string;
  bio?: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  languages: string[];
  isSelected?: boolean;
  onPress: (id: string) => void;
  style?: ViewStyle;
  variant?: 'compact' | 'detailed';
}

export const TherapistCard: React.FC<TherapistCardProps> = ({
  id,
  name,
  specialty,
  bio,
  avatar,
  rating,
  reviewCount,
  yearsExperience,
  languages,
  isSelected = false,
  onPress,
  style,
  variant = 'detailed',
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

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
        <View
          style={[
            styles.compactAvatar,
            isSelected && styles.compactAvatarSelected,
          ]}
        >
          <Text style={styles.compactInitials}>{initials}</Text>
        </View>
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
      {/* Avatar & Name */}
      <View style={styles.header}>
        <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.initials}>{initials}</Text>
          )}
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.specialty}>{specialty}</Text>
        </View>

        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>

      {/* Bio */}
      {bio && (
        <Text style={styles.bio} numberOfLines={2}>
          {bio}
        </Text>
      )}

      {/* Stats & Languages */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Experiência</Text>
          <Text style={styles.statValue}>{yearsExperience} anos</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Rating</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({reviewCount})</Text>
          </View>
        </View>
      </View>

      {/* Languages */}
      {languages && languages.length > 0 && (
        <View style={styles.languagesContainer}>
          <Text style={styles.languagesLabel}>Idiomas:</Text>
          <View style={styles.languagesTags}>
            {languages.slice(0, 3).map((lang, index) => (
              <View key={index} style={styles.languageTag}>
                <Text style={styles.languageTagText}>{lang}</Text>
              </View>
            ))}
            {languages.length > 3 && (
              <View style={styles.languageTag}>
                <Text style={styles.languageTagText}>+{languages.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Compact variant
  compactCard: {
    width: '31%',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: `${COLORS.gold}20`,
  },
  compactCardSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  compactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.gold}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactAvatarSelected: {
    backgroundColor: COLORS.primaryDark,
  },
  compactInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
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
    padding: 14,
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
    alignItems: 'flex-start',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${COLORS.gold}20`,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarSelected: {
    backgroundColor: COLORS.gold,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
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
  specialty: {
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 2,
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

  bio: {
    fontSize: 12,
    color: COLORS.grey,
    lineHeight: 16,
    marginBottom: 10,
    fontFamily: 'DMSans',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.gold}15`,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.gold}15`,
    marginBottom: 10,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: `${COLORS.gold}15`,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    fontSize: 11,
  },
  reviewCount: {
    fontSize: 10,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },

  languagesContainer: {
    gap: 6,
  },
  languagesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  languagesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  languageTag: {
    backgroundColor: `${COLORS.gold}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: `${COLORS.gold}30`,
  },
  languageTagText: {
    fontSize: 10,
    color: COLORS.gold,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
});
