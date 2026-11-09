import React from 'react';
import renderer from 'react-test-renderer';
import {Pressable, StyleSheet, Text} from 'react-native';
import {ActionCard} from '../../../packages/mobile-ui/ActionCard';

it('keeps service entry points accessible, wrapping and actionable', () => {
  const onPress = jest.fn();
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {
    screen = renderer.create(<ActionCard title="Engineering consultations" description="Plans, design and structural guidance" icon="account-hard-hat" color="#2563EB" tint="#EAF2FF" onPress={onPress} />);
  });
  const card = screen.root.findByType(Pressable);
  expect(card.props.accessibilityRole).toBe('button');
  expect(card.props.accessibilityLabel).toContain('Engineering consultations');
  expect(StyleSheet.flatten(card.props.style({pressed: false}))).toMatchObject({minHeight: 92});
  screen.root.findAllByType(Text).forEach(text => expect(text.props.numberOfLines).toBeUndefined());
  renderer.act(() => card.props.onPress());
  expect(onPress).toHaveBeenCalledTimes(1);
  renderer.act(() => screen.unmount());
});
