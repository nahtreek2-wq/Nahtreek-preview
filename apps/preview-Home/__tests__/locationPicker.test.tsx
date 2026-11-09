import React from 'react';
import renderer from 'react-test-renderer';
import {Pressable, TextInput, TouchableOpacity} from 'react-native';
import {LocationPicker} from '../src/components/LocationPicker';
import {currentLocation, searchLocations} from '../src/services/location';

jest.mock('../src/services/location', () => ({
  searchLocations: jest.fn(),
  currentLocation: jest.fn(),
}));

it('discards search results after the address text changes', async () => {
  let resolveOld!: (places: any[]) => void;
  let resolveNew!: (places: any[]) => void;
  (searchLocations as jest.Mock).mockImplementation(
    () => new Promise(resolve => {
      if (!resolveOld) resolveOld = resolve;
      else resolveNew = resolve;
    }),
  );
  const onSelect = jest.fn();
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {
    screen = renderer.create(<LocationPicker onSelect={onSelect} />);
  });
  renderer.act(() => {
    screen.root.findByType(TextInput).props.onChangeText('Old address');
    screen.root.findAllByType(TouchableOpacity)
      .find(button => button.props.accessibilityLabel === 'Search places')!
      .props.onPress();
  });
  renderer.act(() => {
    screen.root.findByType(TextInput).props.onChangeText('New address');
  });
  renderer.act(() => {
    screen.root.findAllByType(TouchableOpacity)
      .find(button => button.props.accessibilityLabel === 'Search places')!
      .props.onPress();
  });
  await renderer.act(async () => {
    resolveOld([{address: 'Old address', city: 'Old', state: 'TN', latitude: 11, longitude: 77}]);
    await Promise.resolve();
  });
  expect(screen.root.findAllByType(Pressable)).toHaveLength(0);
  expect(screen.root.findAllByType(TouchableOpacity)
    .find(button => button.props.accessibilityLabel === 'Finding location…')!
    .props.disabled).toBe(true);
  await renderer.act(async () => {
    resolveNew([{address: 'New address', city: 'New', state: 'TN', latitude: 12, longitude: 78}]);
    await Promise.resolve();
  });
  expect(screen.root.findAllByType(Pressable)).toHaveLength(1);
  expect(onSelect).not.toHaveBeenCalled();
  renderer.act(() => screen.unmount());
});

it('does not replace a newly typed address with a late GPS result', async () => {
  let resolveLocation!: (place: any) => void;
  (currentLocation as jest.Mock).mockImplementation(
    () => new Promise(resolve => {resolveLocation = resolve;}),
  );
  const onSelect = jest.fn();
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {
    screen = renderer.create(<LocationPicker onSelect={onSelect} />);
  });
  renderer.act(() => screen.root.findAllByType(TouchableOpacity)
    .find(button => button.props.accessibilityLabel === 'Use current location')!
    .props.onPress());
  renderer.act(() => screen.root.findByType(TextInput).props.onChangeText('Different address'));
  await renderer.act(async () => {
    resolveLocation({address: 'Old GPS', city: 'Old', state: 'TN', latitude: 11, longitude: 77});
    await Promise.resolve();
  });
  expect(onSelect).not.toHaveBeenCalled();
  renderer.act(() => screen.unmount());
});
