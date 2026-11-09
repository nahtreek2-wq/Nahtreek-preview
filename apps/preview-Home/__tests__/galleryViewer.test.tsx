import React from 'react';
import renderer from 'react-test-renderer';
import {FlatList, Image, Modal, Text, TouchableOpacity} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GalleryViewer} from '../src/components/GalleryViewer';

const images = [
  {key: 'a', source: {uri: 'https://example.com/a.jpg'}},
  {key: 'b', source: {uri: 'https://example.com/b.jpg'}},
  {key: 'c', source: {uri: 'https://example.com/c.jpg'}},
];

function wrap(node: React.ReactElement) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: {x: 0, y: 0, width: 320, height: 640},
        insets: {top: 24, bottom: 0, left: 0, right: 0},
      }}>
      {node}
    </SafeAreaProvider>
  );
}

it('shows the photo position and closes on demand', () => {
  const onClose = jest.fn();
  const onIndexChange = jest.fn();
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {
    screen = renderer.create(
      wrap(
        <GalleryViewer
          visible
          images={images}
          index={1}
          onClose={onClose}
          onIndexChange={onIndexChange}
        />,
      ),
    );
  });
  expect(screen.root.findByType(Modal).props.visible).toBe(true);
  const count = screen.root
    .findAllByType(Text)
    .map(node =>
      Array.isArray(node.props.children)
        ? node.props.children.join('')
        : String(node.props.children),
    );
  expect(count.some(line => line.includes('2 / 3'))).toBe(true);
  renderer.act(() => {
    screen.root
      .findByProps({accessibilityLabel: 'Close gallery'})
      .props.onPress();
  });
  expect(onClose).toHaveBeenCalledTimes(1);
  renderer.act(() => screen.unmount());
});

it('pages through every photo and reports the new index', () => {
  const onIndexChange = jest.fn();
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {
    screen = renderer.create(
      wrap(
        <GalleryViewer
          visible
          images={images}
          index={0}
          onClose={() => {}}
          onIndexChange={onIndexChange}
        />,
      ),
    );
  });
  const list = screen.root.findByType(FlatList);
  expect(list.props.data).toHaveLength(3);
  expect(list.props.pagingEnabled).toBe(true);
  renderer.act(() => {
    list.props.onMomentumScrollEnd({
      nativeEvent: {contentOffset: {x: 640}},
    });
  });
  expect(onIndexChange).toHaveBeenCalled();
  expect(
    screen.root.findAllByType(TouchableOpacity).length,
  ).toBeGreaterThan(0);
  expect(screen.root.findAllByType(Image).length).toBeGreaterThan(0);
  renderer.act(() => screen.unmount());
});
