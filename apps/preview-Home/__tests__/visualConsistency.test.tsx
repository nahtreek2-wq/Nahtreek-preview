import React from 'react';
import renderer from 'react-test-renderer';
import {Keyboard, ScrollView, StyleSheet, TextInput} from 'react-native';
import {Colors} from '@nahtreek/design-system';
import {headerStyles} from '../../../packages/mobile-ui/headerStyles';
import {FormScrollView, useFormFieldFocus} from '../../../packages/mobile-ui/FormScrollView';

function luminance(hex: string) {
  const channels = hex.slice(1).match(/../g)!.map(value => {
    const channel = parseInt(value, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

it.each([
  ['placeholder', Colors.slate500, Colors.surface],
  ['header title', Colors.amber, Colors.navyDeep],
  ['header subtitle', Colors.slate300, Colors.navyDeep],
])('%s has readable text contrast', (_name, foreground, background) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  expect((values[0] + 0.05) / (values[1] + 0.05)).toBeGreaterThanOrEqual(4.5);
});

it('keeps header navigation targets fixed and titles flexible', () => {
  expect(StyleSheet.flatten(headerStyles.navigation)).toMatchObject({
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
  });
  expect(StyleSheet.flatten(headerStyles.leading)).toMatchObject({minWidth: 0, gap: 12});
  expect(StyleSheet.flatten(headerStyles.title)).toMatchObject({flex: 1, minWidth: 0});
});

it('shares focus handling and removes keyboard listeners on unmount', () => {
  const remove = jest.fn();
  const listeners = jest.spyOn(Keyboard, 'addListener').mockReturnValue({remove} as unknown as ReturnType<typeof Keyboard.addListener>);
  function Field() {
    return <TextInput onFocus={useFormFieldFocus()} />;
  }
  let screen!: renderer.ReactTestRenderer;
  try {
    renderer.act(() => {screen = renderer.create(<FormScrollView><Field /></FormScrollView>);});
    expect(screen.root.findByType(TextInput).props.onFocus).toEqual(expect.any(Function));
    expect(screen.root.findByType(ScrollView).props.keyboardShouldPersistTaps).toBe('handled');
    expect(listeners).toHaveBeenCalledTimes(3);
    renderer.act(() => screen.unmount());
    expect(remove).toHaveBeenCalledTimes(3);
  } finally {
    listeners.mockRestore();
  }
});
