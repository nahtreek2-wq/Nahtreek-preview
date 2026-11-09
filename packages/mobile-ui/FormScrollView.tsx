import React, {createContext, useContext} from 'react';
import {ScrollView, ScrollViewProps, TextInputProps} from 'react-native';
import {useFormKeyboardScroll} from './useFormKeyboardScroll';

const FieldFocusContext = createContext<TextInputProps['onFocus']>(undefined);
export const useFormFieldFocus = () => useContext(FieldFocusContext);

// Keep focused fields visible, while allowing buttons to work on the first tap.
export function FormScrollView({children, onScroll, ...props}: ScrollViewProps) {
  const keyboard = useFormKeyboardScroll(28);
  return (
    <FieldFocusContext.Provider value={keyboard.onFocus}>
      <ScrollView
        {...props}
        ref={keyboard.scrollRef}
        onScroll={event => {
          keyboard.onScroll(event);
          onScroll?.(event);
        }}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={keyboard.keyboardDismissMode}>
        {children}
      </ScrollView>
    </FieldFocusContext.Provider>
  );
}
