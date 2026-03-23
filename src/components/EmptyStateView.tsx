import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/Colors';

interface EmptyStateViewProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLabelSecondary?: string;
  onActionSecondary?: () => void;
  spacing?: 'small' | 'medium' | 'large';
}

/**
 * Reusable empty state component
 * Shows when no data is available with optional action buttons
 */
export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  actionLabelSecondary,
  onActionSecondary,
  spacing = 'medium',
}) => {
  const getPadding = () => {
    switch (spacing) {
      case 'small':
        return { paddingVertical: 24, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 48, paddingHorizontal: 16 };
      default:
        return { paddingVertical: 36, paddingHorizontal: 16 };
    }
  };

  return (
    <View style={[styles.container, getPadding()]}>
      <Text style={styles.icon}>{icon}</Text>
      
      <Text style={styles.title}>{title}</Text>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      
      {(onAction || onActionSecondary) && (
        <View style={styles.actionsContainer}>
          {onAction && actionLabel && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onAction}
            >
              <Text style={styles.primaryButtonText}>{actionLabel}</Text>
            </TouchableOpacity>
          )}
          
          {onActionSecondary && actionLabelSecondary && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onActionSecondary}
            >
              <Text style={styles.secondaryButtonText}>{actionLabelSecondary}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: '85%',
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.gold,
  },
  primaryButtonText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  secondaryButtonText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
});
