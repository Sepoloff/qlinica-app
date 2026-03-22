/**
 * ThemeContext
 * Manages app theme (light/dark mode) and color scheme
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  dark: string;
  gold: string;
  goldLight: string;
  goldDark: string;
  white: string;
  offWhite: string;
  grey: string;
  greyLight: string;
  success: string;
  danger: string;
  info: string;
  warning: string;
  background: string;
  text: string;
  textSecondary: string;
  border: string;
}

export const LIGHT_COLORS: ThemeColors = {
  primary: '#2C3E50',
  primaryLight: '#34495E',
  primaryDark: '#1a252f',
  dark: '#1a1a1a',
  gold: '#D4AF8F',
  goldLight: '#e0c4a8',
  goldDark: '#b8956f',
  white: '#FFFFFF',
  offWhite: '#F5F5F5',
  grey: '#8895a0',
  greyLight: '#c5ccd3',
  success: '#4CAF50',
  danger: '#E74C3C',
  info: '#3498DB',
  warning: '#F39C12',
  background: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#8895a0',
  border: '#E5E7EB',
};

export const DARK_COLORS: ThemeColors = {
  primary: '#1a252f',
  primaryLight: '#34495E',
  primaryDark: '#0f1419',
  dark: '#0a0e13',
  gold: '#D4AF8F',
  goldLight: '#e0c4a8',
  goldDark: '#b8956f',
  white: '#FFFFFF',
  offWhite: '#1F1F1F',
  grey: '#8895a0',
  greyLight: '#3a434f',
  success: '#4CAF50',
  danger: '#E74C3C',
  info: '#3498DB',
  warning: '#F39C12',
  background: '#121212',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#2A2A2A',
};

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('@qlinica_theme_mode');
        if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
          setModeState(savedMode);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Determine effective theme
  const effectiveMode =
    mode === 'system'
      ? (systemColorScheme === 'dark' ? 'dark' : 'light')
      : mode;

  const isDark = effectiveMode === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  // Set theme mode
  const setMode = useCallback(async (newMode: ThemeMode) => {
    try {
      setModeState(newMode);
      await AsyncStorage.setItem('@qlinica_theme_mode', newMode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(async () => {
    const newMode = isDark ? 'light' : 'dark';
    await setMode(newMode);
  }, [isDark, setMode]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark,
        colors,
        setMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
