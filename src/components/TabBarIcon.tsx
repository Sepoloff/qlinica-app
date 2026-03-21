import React from 'react';
import { Text } from 'react-native';

interface TabBarIconProps {
  name: string;
  color: string;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color }) => {
  const icons = {
    home: '⌂',
    bookings: '◷',
    profile: '◉',
  };

  return (
    <Text style={{ fontSize: 22, color, lineHeight: 22 }}>
      {icons[name as keyof typeof icons] || '?'}
    </Text>
  );
};
