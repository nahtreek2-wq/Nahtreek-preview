import React from 'react';
import renderer from 'react-test-renderer';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {Colors} from '@nahtreek/design-system';
import {ClientColors} from '../src/design-system/tokens';
import {ClientButton} from '../src/components/ui/ClientButton';

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
  ['primary button text', ClientColors.onAccent, ClientColors.accent],
  ['pressed button text', ClientColors.onAccent, ClientColors.accentPressed],
  ['accent text on surface', ClientColors.accentText, ClientColors.white],
  ['navy text on soft fill', ClientColors.primaryNavy, ClientColors.accentSoft],
  ['icon on navy', ClientColors.white, ClientColors.primaryNavy],
  ['verified badge', Colors.verifiedBlue, ClientColors.accentSoft],
  ['success icon on soft fill', Colors.success, ClientColors.accentSoft],
  ['accent icon on soft fill', ClientColors.accentIcon, ClientColors.accentSoft],
  ['error icon on soft fill', Colors.error, ClientColors.accentSoft],
])('%s meets 4.5:1 contrast', (_, foreground, background) => {
  expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
});

it('renders primary actions in yellow with navy text', () => {
  let tree!: renderer.ReactTestRenderer;
  renderer.act(() => {tree = renderer.create(<ClientButton label="Login" onPress={jest.fn()} />);});
  const button = tree.root.findByType(TouchableOpacity);
  expect(StyleSheet.flatten(button.props.style).backgroundColor).toBe(ClientColors.accent);
  expect(StyleSheet.flatten(tree.root.findByType(Text).props.style).color).toBe(ClientColors.onAccent);
  renderer.act(() => tree.unmount());
});

it('keeps the action name while loading and disables repeat taps', () => {
  let tree!: renderer.ReactTestRenderer;
  renderer.act(() => {tree = renderer.create(<ClientButton label="Login" loading onPress={jest.fn()} />);});
  const button = tree.root.findByType(TouchableOpacity);
  expect(button.props.disabled).toBe(true);
  expect(button.props.accessibilityState).toEqual({disabled: true, busy: true});
  expect(tree.root.findByType(Text).props.children).toBe('Login');
  renderer.act(() => tree.unmount());
});
