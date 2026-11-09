import React from 'react';
import {KeyboardAvoidingView, Platform, type KeyboardAvoidingViewProps, type StyleProp, type ViewStyle} from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
  enabled?: boolean;
  behavior?: KeyboardAvoidingViewProps['behavior'];
};

// One keyboard rule for every screen in both apps. Android must NOT rely on
// the window resizing (adjustResize): on devices where the window does not
// resize for the keyboard, behavior `undefined` leaves bottom components
// (chat composers, pay buttons, form actions) covered. `height` drives the
// adjustment from keyboard events instead, so the bottom content always
// moves above the keyboard. iOS keeps the standard padding behavior.
export function KeyboardAwareView({children, style, keyboardVerticalOffset = 0, enabled = true, behavior}: Props) {
  return (
    <KeyboardAvoidingView
      style={style}
      enabled={enabled}
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior={behavior ?? (Platform.OS === 'ios' ? 'padding' : 'height')}>
      {children}
    </KeyboardAvoidingView>
  );
}
