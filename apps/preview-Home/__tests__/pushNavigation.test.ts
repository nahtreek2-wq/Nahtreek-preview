import {routeForPushDestination} from '../src/navigation/usePushNavigation';

it.each([
  [{destination: 'chat', conversationId: 'c1', senderName: 'Kannan'}, {name: 'Chat', params: {conversationId: 'c1', title: 'Kannan'}}],
  [{destination: 'chat', conversationId: 'c1'}, {name: 'Chat', params: {conversationId: 'c1', title: 'Chat'}}],
  [{destination: 'service-request', serviceRequestId: 'r1'}, {name: 'ServiceRequestDetail', params: {requestId: 'r1'}}],
  [{destination: 'engineer-request', requestId: 'e1'}, {name: 'RequestDetail', params: {requestId: 'e1'}}],
  [{destination: 'discover'}, {name: 'EngineerDiscovery', params: undefined}],
  [{destination: 'notifications'}, {name: 'Notifications', params: undefined}],
  [{destination: 'profile'}, {name: 'MainTabs', params: {screen: 'Profile'}}],
  [{destination: 'home'}, {name: 'MainTabs', params: {screen: 'Home'}}],
  [{destination: 'unknown-screen'}, {name: 'MainTabs', params: {screen: 'Home'}}],
])('routes %j', (payload, expected) => {
  expect(routeForPushDestination(payload)).toEqual(expected);
});

it.each([
  [null],
  [undefined],
  [{}],
  [{destination: 'chat'}],
  [{destination: 'service-request'}],
  [{destination: 'engineer-request'}],
])('ignores incomplete payload %j', payload => {
  expect(routeForPushDestination(payload)).toBeNull();
});
