import React from 'react';
import renderer from 'react-test-renderer';
import {Text} from 'react-native';
import {RequestCard} from '../src/screens/RequestsScreen';
import type {EngineerRequestDto} from '@nahtreek/types';
import {EngineerRequestStatus} from '@nahtreek/types';

const baseRequest: EngineerRequestDto = {
  id: 'req-1',
  clientProfileId: 'client-1',
  engineerProfileId: 'eng-1',
  engineerName: 'Ananya Suresh (Demo)',
  projectTitle: 'Home repair plan',
  projectDescription: 'Fix things',
  propertyType: 'Residential',
  locationAddress: '14 Test Street, Chennai',
  latitude: 13.0,
  longitude: 80.2,
  status: EngineerRequestStatus.COMPLETED,
  createdAt: '2026-11-05T17:00:00.000Z',
};

const noop = () => {};

function texts(screen: renderer.ReactTestRenderer): Array<string | undefined> {
  return screen.root
    .findAllByType(Text)
    .map(node =>
      Array.isArray(node.props.children)
        ? node.props.children.join('')
        : node.props.children,
    );
}

it('shows the Rated state and hides Rate once a review exists', () => {
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {
    screen = renderer.create(
      <RequestCard
        request={{
          ...baseRequest,
          review: {rating: 5, comment: 'excellent plumbing fix', date: '2026-11-06'},
        }}
        onOpen={noop}
        onChat={noop}
        onCancel={noop}
        onReview={noop}
      />,
    );
  });
  const rated = screen.root.findByProps({
    accessibilityLabel: 'Rated 5 out of 5',
  });
  expect(rated).toBeTruthy();
  expect(texts(screen)).toContain('Reviewed');
  expect(texts(screen)).not.toContain('Rate');
  renderer.act(() => screen.unmount());
});

it('keeps the Rate action for completed requests without a review', () => {
  let screen!: renderer.ReactTestRenderer;
  renderer.act(() => {
    screen = renderer.create(
      <RequestCard
        request={baseRequest}
        onOpen={noop}
        onChat={noop}
        onCancel={noop}
        onReview={noop}
      />,
    );
  });
  expect(texts(screen)).toContain('Rate');
  expect(texts(screen)).not.toContain('Reviewed');
  renderer.act(() => screen.unmount());
});
