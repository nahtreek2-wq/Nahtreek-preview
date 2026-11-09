import React from 'react';
import renderer from 'react-test-renderer';
import {KeyboardAvoidingView, Platform, Text} from 'react-native';
import {KeyboardAwareView} from '../../../packages/mobile-ui/KeyboardAwareView';

afterEach(() => {
  jest.restoreAllMocks();
});

it('drives Android layout from keyboard events instead of window resize', () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {
    screen = renderer.create(
      <KeyboardAwareView style={{flex: 1}}>
        <Text>composer</Text>
      </KeyboardAwareView>,
    );
  });
  expect(screen.root.findByType(KeyboardAvoidingView).props.behavior).toBe('height');
  expect(screen.root.findByType(KeyboardAvoidingView).props.enabled).toBe(true);
  renderer.act(() => screen.unmount());
});

it('keeps the standard padding behavior on iOS', () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {
    screen = renderer.create(
      <KeyboardAwareView style={{flex: 1}} keyboardVerticalOffset={64}>
        <Text>composer</Text>
      </KeyboardAwareView>,
    );
  });
  const kav = screen.root.findByType(KeyboardAvoidingView);
  expect(kav.props.behavior).toBe('padding');
  expect(kav.props.keyboardVerticalOffset).toBe(64);
  renderer.act(() => screen.unmount());
});
