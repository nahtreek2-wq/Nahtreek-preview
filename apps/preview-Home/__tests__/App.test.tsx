/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('mounts and cleans up app services', async () => {
  let app!: renderer.ReactTestRenderer;
  await renderer.act(async () => { app = renderer.create(<App />); });
  expect(app.toJSON()).toBeTruthy();
  await renderer.act(async () => { app.unmount(); });
});
