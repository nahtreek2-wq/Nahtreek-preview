import {useCallback, useEffect, useRef} from 'react';
import {
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  TextInput,
  TextInputProps,
} from 'react-native';

// Screens wrapped in KeyboardAwareView shrink above the keyboard. This hook
// scrolls only when the focused input still falls below that visible viewport.
export function useFormKeyboardScroll(clearance = 24) {
  const scrollRef = useRef<ScrollView>(null);
  const focused = useRef<TextInput | null>(null);
  const scrollY = useRef(0);
  const keyboardTop = useRef<number | null>(null);

  const revealFocusedField = useCallback(() => {
    const input = TextInput.State.currentlyFocusedInput() ?? focused.current;
    const top = keyboardTop.current;
    if (!input || typeof input.measureInWindow !== 'function' || top === null) return;
    input.measureInWindow((_x, y, _width, height) => {
      const overlap = y + height + clearance - top;
      if (overlap > 0) {
        scrollRef.current?.scrollTo({y: scrollY.current + overlap, animated: true});
      }
    });
  }, [clearance]);

  useEffect(() => {
    const shown = Keyboard.addListener('keyboardDidShow', event => {
      keyboardTop.current = event.endCoordinates.screenY;
      requestAnimationFrame(revealFocusedField);
    });
    const changed = Keyboard.addListener('keyboardDidChangeFrame', event => {
      keyboardTop.current = event.endCoordinates.screenY;
      requestAnimationFrame(revealFocusedField);
    });
    const hidden = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTop.current = null;
      focused.current = null;
    });
    return () => {
      shown.remove();
      changed.remove();
      hidden.remove();
    };
  }, [revealFocusedField]);

  const onFocus: TextInputProps['onFocus'] = event => {
    const target = event.target as TextInput;
    focused.current = typeof target?.measureInWindow === 'function' ? target : null;
    requestAnimationFrame(revealFocusedField);
  };
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  };

  return {
    scrollRef,
    onFocus,
    onScroll,
    keyboardDismissMode: Platform.OS === 'ios' ? 'interactive' as const : 'none' as const,
  };
}
