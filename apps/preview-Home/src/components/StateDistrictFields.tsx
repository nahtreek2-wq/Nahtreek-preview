import React from 'react';
import {StateDistrictPicker} from '../../../../packages/mobile-geography/StateDistrictPicker';
import {useFormKeyboardScroll} from '../hooks/useFormKeyboardScroll';

type Props = React.ComponentProps<typeof StateDistrictPicker> & {
  onDistrictFocus?: ReturnType<typeof useFormKeyboardScroll>['onFocus'];
};
export function StateDistrictFields({onDistrictFocus: _onDistrictFocus, ...props}: Props) {
  return <StateDistrictPicker {...props} />;
}
