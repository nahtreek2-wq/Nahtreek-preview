import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Colors, Spacing, Typography} from '@nahtreek/design-system';
import {ClientColors} from '../design-system/tokens';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {hasError: false};

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return {hasError: true};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (__DEV__) {
      console.error('NAHTREEK client render error', error, errorInfo);
    }
  }

  private retry = () => this.setState({hasError: false});

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <View style={styles.mark}>
          <Text style={styles.markText}>N</Text>
        </View>
        <Text style={styles.title}>We hit a small snag</Text>
        <Text style={styles.message}>
          Your work is safe. Try loading this screen again, and we’ll get you
          back on track.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={this.retry}
          style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.offWhite,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.navyDeep,
    marginBottom: Spacing.lg,
  },
  markText: {
    ...Typography.display,
    color: ClientColors.white,
  },
  title: {
    ...Typography.h2,
    color: Colors.slate900,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: Colors.slate600,
    textAlign: 'center',
    marginTop: Spacing.sm,
    maxWidth: 320,
  },
  button: {
    minWidth: 140,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: Colors.navyDeep,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  buttonText: {
    ...Typography.button,
    color: Colors.white,
  },
});
