import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {BorderRadius, Colors, Spacing, Typography} from '@nahtreek/design-system';

type Props = {children: React.ReactNode};
type State = {hasError: boolean};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {hasError: false};

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  componentDidCatch(error: Error, details: React.ErrorInfo) {
    if (__DEV__) {console.error('NAHTREEK Professionals render error', error, details);}
  }

  render() {
    if (!this.state.hasError) {return this.props.children;}
    return (
      <View style={styles.root}>
        <Image source={require('../assets/nahtreek-logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Let’s load your workspace again</Text>
        <Text style={styles.body}>Your account and work details are safe. Reload this screen to continue.</Text>
        <Pressable accessibilityRole="button" onPress={() => this.setState({hasError: false})} style={styles.button}><Text style={styles.buttonText}>Reload workspace</Text></Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, backgroundColor: Colors.offWhite},
  logo: {width: 82, height: 82},
  title: {...Typography.h2, color: Colors.slate900, textAlign: 'center', marginTop: Spacing.lg},
  body: {...Typography.body, color: Colors.slate600, textAlign: 'center', marginTop: Spacing.sm, maxWidth: 320},
  button: {minHeight: 50, minWidth: 190, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md, backgroundColor: Colors.navyDeep},
  buttonText: {...Typography.button, color: Colors.white},
});
