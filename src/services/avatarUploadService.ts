/**
 * Avatar Upload Service
 * Handles image selection and upload to user profile
 */

import * as ImagePicker from 'expo-image-picker';
import { api } from '../config/api';
import { analyticsService } from './analyticsService';

export interface UploadResponse {
  url: string;
  size: number;
  mimeType: string;
}

class AvatarUploadService {
  /**
   * Request permissions for image picker
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Pick image from device library
   */
  async pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square avatar
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        return result.assets[0];
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      throw new Error('Falha ao selecionar imagem');
    }
  }

  /**
   * Validate image before upload
   */
  validateImage(asset: ImagePicker.ImagePickerAsset): { valid: boolean; error?: string } {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    // Check file size
    if (asset.fileSize && asset.fileSize > MAX_SIZE) {
      return {
        valid: false,
        error: 'Imagem muito grande. Máximo 5MB.',
      };
    }

    // Check format
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const mimeType = (asset as any).mimeType || 'image/jpeg';
    if (!supportedFormats.includes(mimeType)) {
      return {
        valid: false,
        error: 'Formato não suportado. Use JPG, PNG ou WebP.',
      };
    }

    return { valid: true };
  }

  /**
   * Upload image to server
   */
  async uploadImage(asset: ImagePicker.ImagePickerAsset): Promise<UploadResponse> {
    const validation = this.validateImage(asset);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image');
    }

    try {
      const formData = new FormData();
      
      // Create file object
      const file = {
        uri: asset.uri,
        type: (asset as any).mimeType || 'image/jpeg',
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
      };

      formData.append('file', file as any);
      formData.append('type', 'avatar');

      // Upload with axios (bypasses JSON content-type for FormData)
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      analyticsService.trackEvent('avatar_uploaded', {
        size: (asset as any).fileSize,
        mimeType: (asset as any).mimeType,
      });

      console.log('✅ Avatar uploaded successfully');
      return response.data;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      const errorMsg = error.response?.data?.message || 'Falha ao fazer upload da imagem';
      throw new Error(errorMsg);
    }
  }

  /**
   * Pick and upload in one flow
   */
  async pickAndUpload(): Promise<UploadResponse> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Permissão negada para acessar galeria');
    }

    const image = await this.pickImage();
    if (!image) {
      throw new Error('Nenhuma imagem selecionada');
    }

    return this.uploadImage(image);
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(
    uri: string
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      }).then(() => {
        // Get dimensions is complex in React Native
        // Using a simple approach for now
        resolve({ width: 200, height: 200 });
      }).catch(reject);
    });
  }
}

export const avatarUploadService = new AvatarUploadService();
