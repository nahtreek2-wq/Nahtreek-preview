import React from 'react';
import renderer from 'react-test-renderer';
import {Pressable, Text, View} from 'react-native';
import {ScreenHeader} from '../src/components/ScreenHeader';
import {ScreenLoading} from '../src/components/ScreenLoading';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));
jest.mock('../../../packages/mobile-ui/useReducedMotion', () => ({
  useReducedMotion: () => true,
}));

it('keeps a root-tab header free of a redundant Home shortcut', () => {
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {
    screen = renderer.create(<ScreenHeader title="My service jobs" subtitle="Follow your work" />);
  });
  expect(screen.root.findAllByType(Pressable)).toHaveLength(0);
  expect(screen.root.findAllByType(Text).some(item => item.props.children === 'My service jobs')).toBe(true);
  renderer.act(() => screen.unmount());
});

it('keeps back navigation on detail headers and labels loading accessibly', () => {
  const onBack = jest.fn();
  let header!: renderer.ReactTestRenderer;
  renderer.act(() => {
    header = renderer.create(<ScreenHeader title="Job details" onBack={onBack} />);
  });
  header.root.findByType(Pressable).props.onPress();
  expect(onBack).toHaveBeenCalledTimes(1);
  renderer.act(() => header.unmount());

  let loading!: renderer.ReactTestRenderer;
  renderer.act(() => {
    loading = renderer.create(<ScreenLoading label="Getting your work ready…" variant="dashboard" />);
  });
  expect(loading.root.findByProps({accessibilityRole: 'progressbar'}).props.accessibilityLabel).toBe('Getting your work ready…');
  expect(loading.root.findAllByType(View).length).toBeGreaterThan(5);
  renderer.act(() => loading.unmount());
});
