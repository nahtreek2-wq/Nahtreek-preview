import {useEffect, useState} from 'react';
import {AccessibilityInfo} from 'react-native';

// Start still until the device preference is known, including on older devices.
export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    let changed = false;
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      changed = true;
      if (active) {
        setReduced(value);
      }
    });
    const preference = AccessibilityInfo.isReduceMotionEnabled();
    if (preference && typeof preference.then === 'function') {
      preference.then(value => {
        if (active && !changed) {
          setReduced(value);
        }
      }).catch(() => undefined);
    }
    return () => {active = false; listener.remove();};
  }, []);
  return reduced;
}
