import {create} from 'zustand';

export type NotificationKind = 'request' | 'tracking' | 'message' | 'offer';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface NotificationsState {
  items: AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  push: (n: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
}

const SEED: AppNotification[] = [
  {
    id: 'n-1',
    kind: 'tracking',
    title: 'Er. Rajesh Kumar is on the way',
    body: 'Live tracking started for your structural consultation visit.',
    time: '10 min ago',
    read: false,
  },
  {
    id: 'n-2',
    kind: 'request',
    title: 'Request accepted',
    body: 'Your 2400 sq.ft house structural approval request was accepted.',
    time: '2 hrs ago',
    read: false,
  },
  {
    id: 'n-3',
    kind: 'message',
    title: 'New message from Er. Rajesh Kumar',
    body: '"I can visit the RS Puram site tomorrow at 11:00 AM."',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n-4',
    kind: 'offer',
    title: 'Monsoon offer',
    body: 'Terrace waterproofing from ₹45/sq ft this week only.',
    time: '2 days ago',
    read: true,
  },
];

export const useNotifications = create<NotificationsState>(set => ({
  items: SEED,
  markRead: id =>
    set(state => ({items: state.items.map(n => n.id === id ? {...n, read: true} : n)})),
  markAllRead: () =>
    set(state => ({items: state.items.map(n => ({...n, read: true}))})),
  push: n =>
    set(state => ({
      items: [
        {...n, id: `n-${Date.now()}`, time: 'Just now', read: false},
        ...state.items,
      ],
    })),
}));
