import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Conditional imports for location
let Location: any = null;
try {
  Location = require('expo-location');
} catch (e) {
  console.warn('expo-location not installed');
}

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface UsePermissionsResult {
  status: PermissionStatus;
  loading: boolean;
  error: Error | null;
  requestPermission: () => Promise<PermissionStatus>;
}

/**
 * Hook to handle location permissions
 */
export const useLocationPermission = (): UsePermissionsResult => {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      setLoading(true);
      const permission = await Location.getForegroundPermissionsAsync();
      setStatus((permission.granted ? 'granted' : 'denied') as PermissionStatus);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus('denied');
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async (): Promise<PermissionStatus> => {
    try {
      setLoading(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      const newStatus = (permission.granted ? 'granted' : 'denied') as PermissionStatus;
      setStatus(newStatus);
      return newStatus;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus('denied');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { status, loading, error, requestPermission };
};

/**
 * Hook to handle camera permissions
 */
export const useCameraPermission = (): UsePermissionsResult => {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      setLoading(true);
      // Stub - always granted on web/emulator
      setStatus('granted');
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus('denied');
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async (): Promise<PermissionStatus> => {
    try {
      setLoading(true);
      // Stub - always grant on web/emulator
      setStatus('granted');
      return 'granted';
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus('denied');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { status, loading, error, requestPermission };
};

/**
 * Hook to handle notification permissions
 */
export const useNotificationPermission = (): UsePermissionsResult => {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    try {
      setLoading(true);
      // Stub - notifications available but not explicitly granted
      setStatus('undetermined');
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus('denied');
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async (): Promise<PermissionStatus> => {
    try {
      setLoading(true);
      // Stub - request notifications
      setStatus('granted');
      return 'granted';
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus('denied');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { status, loading, error, requestPermission };
};

/**
 * Generic permissions hook (placeholder export)
 */
export const usePermissions = useLocationPermission;
