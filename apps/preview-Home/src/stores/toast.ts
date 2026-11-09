import {create} from 'zustand';

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export type ToastItem = {
  id: number;
  message: string;
  kind: ToastKind;
};

interface ToastState {
  current: ToastItem | null;
  queue: ToastItem[];
  show: (message: string, kind?: ToastKind) => void;
  hide: (id?: number) => void;
  dismissAll: () => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set, get) => ({
  current: null,
  queue: [],
  show: (message, kind = 'info') => {
    const normalized = message.trim();
    if (!normalized) return;
    const state = get();
    if (state.current?.message === normalized && state.current.kind === kind) return;
    if (state.queue.some(item => item.message === normalized && item.kind === kind)) return;
    const item = {id: nextId++, message: normalized, kind};
    if (!state.current) {
      set({current: item});
      return;
    }
    // Keep feedback readable: one visible item and at most two waiting.
    set({queue: [...state.queue, item].slice(0, 2)});
  },
  hide: id => {
    const state = get();
    if (!state.current || (id !== undefined && state.current.id !== id)) return;
    const [next, ...rest] = state.queue;
    set({current: next ?? null, queue: rest});
  },
  dismissAll: () => set({current: null, queue: []}),
}));

export function useToast() {
  return useToastStore(s => s.show);
}
