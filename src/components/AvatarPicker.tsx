import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/Colors';
import { avatarUploadService } from '../services/avatarUploadService';

interface AvatarPickerProps {
  avatar?: string;
  size?: number;
  onAvatarChange?: (avatarUrl: string) => void;
  onError?: (error: string) => void;
  editable?: boolean;
}

/**
 * Avatar picker component for profile pictures
 * Allows users to pick and upload profile avatars
 */
export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  avatar,
  size = 100,
  onAvatarChange,
  onError,
  editable = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(avatar);

  const handlePickImage = async () => {
    if (!editable || loading) return;

    setLoading(true);
    try {
      const result = await avatarUploadService.pickAndUpload();
      setCurrentAvatar(result.url);
      onAvatarChange?.(result.url);
    } catch (error: any) {
      const errorMessage = error?.message || 'Falha ao fazer upload da imagem';
      onError?.(errorMessage);
      Alert.alert('Erro', errorMessage);
      console.error('Avatar upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size }]}
      onPress={handlePickImage}
      disabled={!editable || loading}
    >
      {currentAvatar ? (
        <Image
          source={{ uri: currentAvatar }}
          style={[styles.avatar, { width: size, height: size }]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, backgroundColor: `${COLORS.gold}20` },
          ]}
        >
          <Text style={styles.placeholderText}>👤</Text>
        </View>
      )}

      {editable && (
        <View
          style={[
            styles.editBadge,
            {
              width: size * 0.35,
              height: size * 0.35,
              bottom: -4,
              right: -4,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.editIcon}>📷</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Import Text for the component to work
import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: `${COLORS.gold}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 999,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  placeholderText: {
    fontSize: 40,
  },
  editBadge: {
    position: 'absolute',
    backgroundColor: COLORS.gold,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.dark,
  },
  editIcon: {
    fontSize: 18,
  },
});
