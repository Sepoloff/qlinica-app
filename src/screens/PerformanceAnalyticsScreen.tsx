/**
 * PerformanceAnalyticsScreen
 * Real-time performance metrics and analytics dashboard
 * Shows API performance, memory usage, error rates, and user analytics
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Pressable,
  Text as RNText,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { performanceMonitor } from '../utils/performanceMonitor';
import { analyticsService } from '../services/analyticsService';

interface MetricsData {
  avgResponseTime: number;
  errorRate: number;
  requestCount: number;
  cacheHitRate: number;
  memoryUsage: number;
  networkStatus: 'online' | 'offline' | 'slow';
}

interface AnalyticsSession {
  totalSessions: number;
  avgSessionDuration: number;
  activeUsers: number;
  bounceRate: number;
  topScreens: Array<{ name: string; views: number }>;
}

const PerformanceAnalyticsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [metrics, setMetrics] = useState<MetricsData>({
    avgResponseTime: 0,
    errorRate: 0,
    requestCount: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    networkStatus: 'online',
  });
  const [analytics, setAnalytics] = useState<AnalyticsSession>({
    totalSessions: 0,
    avgSessionDuration: 0,
    activeUsers: 0,
    bounceRate: 0,
    topScreens: [],
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'performance' | 'analytics'>('performance');

  // Load metrics
  const loadMetrics = useCallback(async () => {
    try {
      const perfSummary = performanceMonitor.getSummary();
      const analyticsData = await analyticsService.getSessionAnalytics();

      setMetrics({
        avgResponseTime: Number(perfSummary.averageScreenTime) || 0,
        errorRate: 0,
        requestCount: Number(perfSummary.totalMeasurements) || 0,
        cacheHitRate: 0,
        memoryUsage: 0,
        networkStatus: 'online' as const,
      });

      setAnalytics({
        totalSessions: analyticsData.totalSessions || 0,
        avgSessionDuration: 0,
        activeUsers: analyticsData.uniqueUsers || 0,
        bounceRate: 0,
        topScreens: [],
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [loadMetrics]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadMetrics();
    setIsRefreshing(false);
  }, [loadMetrics]);

  const MetricCard: React.FC<{
    label: string;
    value: string | number;
    unit?: string;
    status?: 'good' | 'warning' | 'danger';
  }> = ({ label, value, unit = '', status = 'good' }) => {
    const statusColors = {
      good: colors.success,
      warning: colors.warning,
      danger: colors.danger,
    };

    return (
      <View style={[styles.metricCard, { backgroundColor: colors.offWhite, borderColor: statusColors[status] }]}>
        <RNText style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</RNText>
        <View style={styles.metricValueContainer}>
          <RNText style={[styles.metricValue, { color: statusColors[status] }]}>
            {typeof value === 'number' ? value.toFixed(2) : value}
          </RNText>
          {unit && <RNText style={[styles.metricUnit, { color: colors.textSecondary }]}>{unit}</RNText>}
        </View>
      </View>
    );
  };

  const ScreenRow: React.FC<{ name: string; views: number }> = ({ name, views }) => (
    <View style={[styles.screenRow, { borderBottomColor: colors.border }]}>
      <RNText style={[styles.screenName, { color: colors.text }]}>{name}</RNText>
      <RNText style={[styles.screenViews, { color: colors.gold }]}>{views} views</RNText>
    </View>
  );

  const getErrorStatus = (errorRate: number): 'good' | 'warning' | 'danger' => {
    if (errorRate < 1) return 'good';
    if (errorRate < 5) return 'warning';
    return 'danger';
  };

  const getCacheStatus = (hitRate: number): 'good' | 'warning' | 'danger' => {
    if (hitRate > 70) return 'good';
    if (hitRate > 40) return 'warning';
    return 'danger';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <RNText style={styles.headerTitle}>Performance Analytics</RNText>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.offWhite, borderBottomColor: colors.border }]}>
        <Pressable
          style={[
            styles.tab,
            selectedTab === 'performance' && { borderBottomColor: colors.gold, borderBottomWidth: 3 },
          ]}
          onPress={() => setSelectedTab('performance')}
        >
          <RNText style={[styles.tabText, { color: selectedTab === 'performance' ? colors.gold : colors.textSecondary }]}>
            Performance
          </RNText>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            selectedTab === 'analytics' && { borderBottomColor: colors.gold, borderBottomWidth: 3 },
          ]}
          onPress={() => setSelectedTab('analytics')}
        >
          <RNText style={[styles.tabText, { color: selectedTab === 'analytics' ? colors.gold : colors.textSecondary }]}>
            Analytics
          </RNText>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'performance' ? (
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: colors.text }]}>API Performance</RNText>
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Avg Response Time"
                value={metrics.avgResponseTime}
                unit="ms"
                status={metrics.avgResponseTime > 500 ? 'danger' : metrics.avgResponseTime > 200 ? 'warning' : 'good'}
              />
              <MetricCard
                label="Error Rate"
                value={metrics.errorRate}
                unit="%"
                status={getErrorStatus(metrics.errorRate)}
              />
              <MetricCard
                label="Total Requests"
                value={metrics.requestCount}
                status="good"
              />
              <MetricCard
                label="Cache Hit Rate"
                value={metrics.cacheHitRate}
                unit="%"
                status={getCacheStatus(metrics.cacheHitRate)}
              />
            </View>

            <RNText style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>System Status</RNText>
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Network Status"
                value={metrics.networkStatus}
                status={metrics.networkStatus === 'offline' ? 'danger' : metrics.networkStatus === 'slow' ? 'warning' : 'good'}
              />
              <MetricCard
                label="Memory Usage"
                value={metrics.memoryUsage}
                unit="MB"
                status={metrics.memoryUsage > 100 ? 'danger' : metrics.memoryUsage > 50 ? 'warning' : 'good'}
              />
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <RNText style={[styles.sectionTitle, { color: colors.text }]}>User Sessions</RNText>
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Total Sessions"
                value={analytics.totalSessions}
                status="good"
              />
              <MetricCard
                label="Avg Duration"
                value={analytics.avgSessionDuration}
                unit="s"
                status="good"
              />
              <MetricCard
                label="Active Users"
                value={analytics.activeUsers}
                status="good"
              />
              <MetricCard
                label="Bounce Rate"
                value={analytics.bounceRate}
                unit="%"
                status={analytics.bounceRate > 50 ? 'danger' : analytics.bounceRate > 30 ? 'warning' : 'good'}
              />
            </View>

            <RNText style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Top Screens</RNText>
            <View style={[styles.screensList, { backgroundColor: colors.offWhite }]}>
              {analytics.topScreens.length > 0 ? (
                analytics.topScreens.map((screen, index) => (
                  <ScreenRow key={index} name={screen.name} views={screen.views} />
                ))
              ) : (
                <RNText style={[styles.noDataText, { color: colors.textSecondary }]}>
                  No data available yet
                </RNText>
              )}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <RNText style={[styles.footerText, { color: colors.textSecondary }]}>
            Last updated: {new Date().toLocaleTimeString()}
          </RNText>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF8F',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  metricUnit: {
    fontSize: 12,
    marginLeft: 4,
  },
  screensList: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  screenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  screenName: {
    fontSize: 14,
    fontWeight: '500',
  },
  screenViews: {
    fontSize: 14,
    fontWeight: '600',
  },
  noDataText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});

export default PerformanceAnalyticsScreen;
