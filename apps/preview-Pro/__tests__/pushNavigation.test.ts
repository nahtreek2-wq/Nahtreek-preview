import {routeForProPushDestination} from '../src/navigation/usePushNavigation';

it.each([
  [{destination: 'pro-request', requestId: 'r1'}, {tab: 'Requests', screen: 'RequestDetail', params: {id: 'r1', kind: 'engineering'}}],
  [{destination: 'pro-chat', conversationId: 'c1', senderName: 'Asha'}, {tab: 'Messages', screen: 'Chat', params: {conversationId: 'c1', title: 'Asha'}}],
  [{destination: 'pro-chat', conversationId: 'c1'}, {tab: 'Messages', screen: 'Chat', params: {conversationId: 'c1', title: 'Chat'}}],
  [{destination: 'pro-requests'}, {tab: 'Requests', screen: 'RequestInbox', params: undefined}],
  [{destination: 'pro-reviews'}, {tab: 'Profile', screen: 'Reviews', params: undefined}],
  [{destination: 'pro-home'}, {tab: 'Home', screen: undefined, params: undefined}],
  [{destination: 'unknown-screen'}, {tab: 'Home', screen: undefined, params: undefined}],
])('routes %j', (payload, expected) => {
  expect(routeForProPushDestination(payload)).toEqual(expected);
});

it.each([
  [null],
  [undefined],
  [{}],
  [{destination: 'pro-request'}],
  [{destination: 'pro-chat'}],
])('ignores incomplete payload %j', payload => {
  expect(routeForProPushDestination(payload)).toBeNull();
});
