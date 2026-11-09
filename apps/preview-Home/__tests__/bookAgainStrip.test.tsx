import React from 'react';
import renderer from 'react-test-renderer';
import {Image, Pressable, Text} from 'react-native';
import {BookAgainStrip} from '../src/components/home/BookAgainStrip';

const ITEMS = [
  {id: 'plumbing', title: 'Plumbing', detail: 'UITest Pro · 8 Nov'},
  {id: 'painting', title: 'Painting', detail: 'Arun · 2 Nov'},
];

it('renders nothing without recent services', () => {
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {
    screen = renderer.create(<BookAgainStrip items={[]} onSelect={jest.fn()} />);
  });
  try {
    expect(screen.toJSON()).toBeNull();
  } finally {
    screen.unmount();
  }
});

it('shows a photo, context and a Book pill per service, rebooking by service id', () => {
  const onSelect = jest.fn();
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {
    screen = renderer.create(<BookAgainStrip items={ITEMS} onSelect={onSelect} />);
  });
  try {
    const cards = screen.root.findAllByType(Pressable);
    expect(cards).toHaveLength(2);
    expect(screen.root.findAllByType(Image)).toHaveLength(2);
    const labels = screen.root.findAllByType(Text).map(node => node.props.children);
    expect(labels).toContain('Plumbing');
    expect(labels).toContain('UITest Pro · 8 Nov');
    expect(labels.filter(label => label === 'Book')).toHaveLength(2);
    renderer.act(() => cards[0].props.onPress());
    expect(onSelect).toHaveBeenCalledWith('plumbing');
  } finally {
    renderer.act(() => screen.unmount());
  }
});
