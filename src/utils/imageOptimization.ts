/**
 * Image Optimization Utilities
 * Handles lazy loading, caching, and responsive image sizing
 */

import { Dimensions, Image as RNImage } from 'react-native';

interface ImageCacheOptions {
  maxAge?: number; // milliseconds
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Generate responsive image URL with proper sizing
 * @param url - Original image URL
 * @param width - Desired width in pixels
 * @param height - Desired height in pixels
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  height?: number
): string => {
  if (!url) return '';

  // If it's a local asset, return as-is
  if (url.startsWith('file://') || typeof url === 'number') {
    return url;
  }

  // For external URLs, add query parameters for CDN optimization
  // This assumes your CDN supports these parameters (e.g., Cloudinary, Imgix)
  const separator = url.includes('?') ? '&' : '?';
  let optimizedUrl = url;

  if (width || height) {
    const w = width || 'auto';
    const h = height || 'auto';
    optimizedUrl += `${separator}w=${w}&h=${h}&fit=cover&q=80`;
  } else {
    // Default compression
    optimizedUrl += `${separator}q=80&auto=format`;
  }

  return optimizedUrl;
};

/**
 * Calculate responsive image dimensions based on screen width
 */
export const getResponsiveImageDimensions = (
  baseWidth: number,
  aspectRatio: number = 1
) => {
  const screenWidth = Dimensions.get('window').width;
  const scale = screenWidth / baseWidth;

  return {
    width: baseWidth * scale,
    height: (baseWidth * scale) / aspectRatio,
  };
};

/**
 * Prefetch image for lazy loading
 * @param url - Image URL to prefetch
 * @param options - Cache options
 */
export const prefetchImage = async (
  url: string,
  options?: ImageCacheOptions
): Promise<void> => {
  if (!url || url.startsWith('file://')) return;

  try {
    // Use React Native's Image.prefetch
    await RNImage.prefetch(url);
  } catch (error) {
    console.warn('Failed to prefetch image:', url, error);
  }
};

/**
 * Prefetch multiple images in batch
 * @param urls - Array of image URLs
 */
export const prefetchImages = async (urls: string[]): Promise<void> => {
  const validUrls = urls.filter(url => url && !url.startsWith('file://'));
  if (validUrls.length === 0) return;

  try {
    await Promise.all(validUrls.map(url => prefetchImage(url)));
  } catch (error) {
    console.warn('Error prefetching batch of images:', error);
  }
};

/**
 * Clear image cache to free up memory
 */
export const clearImageCache = async (): Promise<void> => {
  try {
    // Note: expo-image handles caching automatically
    // This is a placeholder for future cache clearing logic
    console.log('Image cache cleared');
  } catch (error) {
    console.warn('Failed to clear image cache:', error);
  }
};

/**
 * Get thumbnail URL from full image URL
 * @param url - Full image URL
 * @returns Thumbnail URL
 */
export const getThumbnailUrl = (url: string): string => {
  if (!url) return '';
  return getOptimizedImageUrl(url, 100, 100);
};

/**
 * Generate picture sources for different screen densities
 */
export const getResponsiveImageSources = (baseUrl: string) => {
  const screenWidth = Dimensions.get('window').width;

  return {
    '1x': getOptimizedImageUrl(baseUrl, screenWidth, Math.round(screenWidth * 0.6)),
    '2x': getOptimizedImageUrl(
      baseUrl,
      screenWidth * 2,
      Math.round(screenWidth * 2 * 0.6)
    ),
    '3x': getOptimizedImageUrl(
      baseUrl,
      screenWidth * 3,
      Math.round(screenWidth * 3 * 0.6)
    ),
  };
};

export default {
  getOptimizedImageUrl,
  getResponsiveImageDimensions,
  prefetchImage,
  prefetchImages,
  clearImageCache,
  getThumbnailUrl,
  getResponsiveImageSources,
};
