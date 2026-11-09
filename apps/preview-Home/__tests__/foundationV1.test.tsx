import React from 'react';
import renderer from 'react-test-renderer';
import {ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import {Colors} from '@nahtreek/design-system';
import {ActionButton} from '../../../packages/mobile-ui/ActionButton';
import {FeedbackState} from '../../../packages/mobile-ui/FeedbackState';
import {navigationGlyphs} from '../../../packages/mobile-ui/NavigationIcon';

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    const c = hex.slice(1).match(/../g)!.map(v => {
      const n = parseInt(v, 16) / 255;
      return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    });
    return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

it.each([
  ['success', Colors.success, Colors.successBg],
  ['warning', Colors.warning, Colors.warningBg],
  ['error', Colors.error, Colors.errorBg],
  ['information', Colors.info, Colors.infoBg],
  ['primary action', Colors.navyDeep, Colors.amber],
])('%s text meets 4.5:1 contrast on its paired surface', (_, foreground, background) => {
  expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
});

it('keeps the action name while loading and disables repeat taps', () => {
  let tree!: renderer.ReactTestRenderer;
  renderer.act(() => {tree = renderer.create(<ActionButton label="Save profile" loading onPress={jest.fn()} />);});
  const button = tree.root.findByType(TouchableOpacity);
  expect(button.props.disabled).toBe(true);
  expect(button.props.accessibilityState).toEqual({disabled: true, busy: true});
  expect(button.props.accessibilityLabel).toBe('Save profile, in progress');
  expect(tree.root.findByType(Text).props.children).toBe('Save profile');
  expect(tree.root.findByType(ActivityIndicator)).toBeTruthy();
  renderer.act(() => tree.unmount());
});

it('offers an explicit retry action without inventing success', () => {
  const retry = jest.fn();
  let tree!: renderer.ReactTestRenderer;
  renderer.act(() => {tree = renderer.create(<FeedbackState tone="error" title="Couldn’t load jobs" message="Please try again." actionLabel="Retry" onAction={retry} />);});
  renderer.act(() => tree.root.findByType(TouchableOpacity).props.onPress());
  expect(retry).toHaveBeenCalledTimes(1);
  expect(tree.root.findAllByType(Text).some(t => t.props.accessibilityLiveRegion === 'polite')).toBe(true);
  renderer.act(() => tree.unmount());
});

it('uses existing font glyphs for every selected and unselected tab', () => {
  const glyphs = require('react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json');
  Object.values(navigationGlyphs).forEach(pair => {
    expect(pair[0]).not.toBe(pair[1]);
    pair.forEach(name => expect(glyphs[name]).toEqual(expect.any(Number)));
  });
});
