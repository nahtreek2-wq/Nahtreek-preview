import React from 'react';
import renderer from 'react-test-renderer';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Button} from '../src/components/ui/Button';

it('lets long button labels wrap without shrinking the touch target', () => {
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {screen = renderer.create(<Button label="Verify and create your professional account" onPress={() => undefined} />);});
  const button = screen.root.findByType(TouchableOpacity);
  expect(StyleSheet.flatten(button.props.style)).toMatchObject({minHeight: 48, flexShrink: 0});
  expect(StyleSheet.flatten(screen.root.findByType(Text).props.style)).toMatchObject({flexShrink: 1, textAlign: 'center'});
  renderer.act(() => screen.unmount());
});
