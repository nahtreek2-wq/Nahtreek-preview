/**
 * NAHTREEK - Property Services Marketplace App
 *
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AppProviders} from './src/app/AppProviders';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AppProviders />
    </GestureHandlerRootView>
  );
}

export default App;
