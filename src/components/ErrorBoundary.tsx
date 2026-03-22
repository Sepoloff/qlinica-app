import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';
import { analyticsService } from '../services/analyticsService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  context?: string; // Optional context for error tracking
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Omit<State, 'errorCount'> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorCount = this.state.errorCount + 1;
    this.setState({ errorCount });

    // Track error in analytics
    analyticsService.trackError(error, {
      errorBoundary: true,
      context: this.props.context,
      componentStack: errorInfo.componentStack,
      errorCount,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log details
    console.error(`ErrorBoundary [${this.props.context || 'Unknown'}] caught an error:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      count: errorCount,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.icon}>⚠️</Text>
              <Text style={styles.title}>Algo correu mal</Text>
              <Text style={styles.message}>
                {this.state.error?.message || 'Ocorreu um erro inesperado'}
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={this.resetError}
              >
                <Text style={styles.buttonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  button: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
  },
});
