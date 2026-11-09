import React from 'react';
import {FeedbackState, FeedbackStateProps} from '../../../../../packages/mobile-ui/FeedbackState';

export function EmptyState(props: Omit<FeedbackStateProps, 'tone'>) {
  return <FeedbackState {...props} />;
}

export function ErrorState({title = 'We couldn’t load this', actionLabel = 'Try again', icon = 'alert-circle-outline', ...props}: Omit<FeedbackStateProps, 'tone' | 'title'> & {title?: string; onAction: () => void}) {
  return <FeedbackState {...props} title={title} actionLabel={actionLabel} icon={icon} tone="error" />;
}
