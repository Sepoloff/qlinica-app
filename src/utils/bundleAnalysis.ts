/**
 * Bundle Analysis Utilities
 * Helps identify and optimize large modules
 */

interface ModuleSize {
  name: string;
  size: number; // bytes
  percentage: number;
}

interface BundleMetrics {
  total: number;
  modules: ModuleSize[];
  warnings: string[];
}

/**
 * Analyze component size (estimated)
 */
export const estimateComponentSize = (componentCode: string): number => {
  // Rough estimate: 1 character ≈ 1 byte after gzip is roughly 0.3x
  return Math.ceil(componentCode.length * 0.3);
};

/**
 * Identify large imports that should be code-split
 */
export const identifyLargeImports = (
  modules: Record<string, number>,
  threshold: number = 50000
): ModuleSize[] => {
  return Object.entries(modules)
    .map(([name, size]) => ({
      name,
      size,
      percentage: 0, // Will be calculated below
    }))
    .filter(module => module.size > threshold)
    .sort((a, b) => b.size - a.size)
    .map((module, _, arr) => ({
      ...module,
      percentage: (module.size / arr.reduce((sum, m) => sum + m.size, 0)) * 100,
    }));
};

/**
 * Get optimization recommendations based on bundle size
 */
export const getBundleOptimizationRecommendations = (
  metrics: BundleMetrics
): string[] => {
  const recommendations: string[] = [];
  const totalSize = metrics.total;

  // Check for code-split candidates
  const largeModules = metrics.modules.filter(m => m.size > 50000);
  if (largeModules.length > 0) {
    recommendations.push(`⚠️ Code-split ${largeModules.length} large modules (>50KB)`);
    largeModules.forEach(m => {
      recommendations.push(`  • ${m.name}: ${(m.size / 1024).toFixed(1)}KB`);
    });
  }

  // Check total size
  if (totalSize > 1000000) {
    recommendations.push(`⚠️ Total bundle is ${(totalSize / 1024).toFixed(0)}KB - consider optimization`);
  } else if (totalSize > 500000) {
    recommendations.push(`🟡 Bundle size is ${(totalSize / 1024).toFixed(0)}KB - monitor growth`);
  }

  // Check for duplicate dependencies
  recommendations.push('✅ Run: npm list --depth=0 to check for duplicate dependencies');

  // Performance suggestions
  recommendations.push('💡 Enable code splitting for booking flow screens');
  recommendations.push('💡 Implement lazy loading for images and heavy components');
  recommendations.push('💡 Consider using React.lazy() for route-based code splitting');

  return recommendations;
};

/**
 * Format bundle size for display
 */
export const formatBundleSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Create a detailed bundle analysis report
 */
export const generateBundleReport = (
  modules: Record<string, number>
): string => {
  const total = Object.values(modules).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(modules)
    .sort(([, sizeA], [, sizeB]) => sizeB - sizeA)
    .slice(0, 20); // Top 20

  let report = `
📦 Bundle Analysis Report
========================

Total Bundle Size: ${formatBundleSize(total)}

Top 20 Largest Modules:
`;

  sorted.forEach(([name, size], index) => {
    const percentage = ((size / total) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(parseInt(percentage) / 2));
    report += `${index + 1}. ${name.padEnd(40)} ${formatBundleSize(size).padEnd(10)} (${percentage}%) ${bar}\n`;
  });

  // Recommendations
  const recommendations = getBundleOptimizationRecommendations({
    total,
    modules: Object.entries(modules).map(([name, size]) => ({
      name,
      size,
      percentage: (size / total) * 100,
    })),
    warnings: [],
  });

  report += `\n⚡ Optimization Recommendations:\n`;
  recommendations.forEach(rec => {
    report += `${rec}\n`;
  });

  return report;
};

/**
 * Check if module size is acceptable
 */
export const isBundleSizeAcceptable = (
  currentSize: number,
  maxSize: number = 1000000 // 1MB default
): boolean => {
  return currentSize <= maxSize;
};

/**
 * Calculate size increase compared to previous build
 */
export const calculateSizeIncrease = (
  previousSize: number,
  currentSize: number
): { bytes: number; percentage: number } => {
  const bytes = currentSize - previousSize;
  const percentage = (bytes / previousSize) * 100;
  return { bytes, percentage };
};

/**
 * Suggest modules to lazy load
 */
export const suggestLazyLoadModules = (
  modules: Record<string, number>,
  threshold: number = 50000
): string[] => {
  return Object.entries(modules)
    .filter(([, size]) => size > threshold)
    .map(([name]) => name);
};

export default {
  estimateComponentSize,
  identifyLargeImports,
  getBundleOptimizationRecommendations,
  formatBundleSize,
  generateBundleReport,
  isBundleSizeAcceptable,
  calculateSizeIncrease,
  suggestLazyLoadModules,
};
