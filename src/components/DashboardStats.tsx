import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/Colors';

export interface DashboardStat {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon?: string;
  color?: string;
}

interface DashboardStatsProps {
  stats: DashboardStat[];
  columns?: 1 | 2 | 3;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, columns = 2 }) => {
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '';
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '#10B981';
      case 'down':
        return '#EF4444';
      case 'stable':
        return '#6B7280';
      default:
        return COLORS.navy;
    }
  };

  const containerWidth = columns === 1 ? '100%' : columns === 2 ? '48%' : '32%';

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View
          key={index}
          style={[styles.statCard, { width: containerWidth }]}
        >
          <View style={styles.cardContent}>
            {stat.icon && (
              <Text style={[styles.icon, { color: stat.color || COLORS.gold }]}>
                {stat.icon}
              </Text>
            )}
            <Text style={styles.label}>{stat.label}</Text>
            <View style={styles.valueContainer}>
              <Text style={[styles.value, { color: stat.color || COLORS.navy }]}>
                {stat.value}
              </Text>
              {stat.unit && <Text style={styles.unit}>{stat.unit}</Text>}
            </View>
            {stat.trend && (
              <View style={styles.trendContainer}>
                <Text style={styles.trendIcon}>{getTrendIcon(stat.trend)}</Text>
                <Text
                  style={[
                    styles.trendValue,
                    { color: getTrendColor(stat.trend) },
                  ]}
                >
                  {stat.trendValue}%
                </Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContent: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    textAlign: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  unit: {
    fontSize: 12,
    color: '#999',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendIcon: {
    fontSize: 14,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});
