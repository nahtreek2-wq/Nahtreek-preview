import React from 'react';
import renderer from 'react-test-renderer';
import {Pressable, TextInput} from 'react-native';
jest.mock('react-native-safe-area-context', () => ({useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0})}));
import {StateDistrictFields} from '../src/components/StateDistrictFields';
import {INDIA_DIRECTORY} from '../../../packages/mobile-geography/indiaDirectory';
import {stateForCity} from '../src/services/geography';

it('clears the district when a different state is selected', () => {
  const onStateChange = jest.fn();
  const onDistrictChange = jest.fn();
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {
    screen = renderer.create(
      <StateDistrictFields
        state="Tamil Nadu"
        district="Coimbatore"
        onStateChange={onStateChange}
        onDistrictChange={onDistrictChange}
      />,
    );
  });
  renderer.act(() => {
    screen.root.find(node => node.props.accessibilityLabel === 'Choose state or union territory').props.onPress();
  });
  renderer.act(() => {
    screen.root.findByType(TextInput).props.onChangeText('Karnataka');
  });
  renderer.act(() => {
    screen.root.findAllByType(Pressable).find(node => node.findAllByProps({children: 'Karnataka'}).length > 0)!.props.onPress();
  });
  expect(onStateChange).toHaveBeenCalledWith('Karnataka');
  expect(onDistrictChange).toHaveBeenCalledWith('');
  expect(screen.root.findByProps({accessibilityLabel: 'Choose district'})).toBeTruthy();
  renderer.act(() => screen.unmount());
});

it('has state-scoped government district data, including all 38 Tamil Nadu districts', () => {
  expect(INDIA_DIRECTORY).toHaveLength(36);
  const tamil = INDIA_DIRECTORY.find(item => item.name === 'Tamil Nadu')!;
  expect(tamil.districts).toHaveLength(38);
  expect(tamil.districts.some(item => item.name === 'Krishnagiri')).toBe(true);
  expect(tamil.districts.map(item => item.name)).not.toContain('Bengaluru Urban');
  const districts: {name: string}[] = [...tamil.districts];
  expect(districts.every(item => stateForCity(item.name) === 'Tamil Nadu')).toBe(true);
});
