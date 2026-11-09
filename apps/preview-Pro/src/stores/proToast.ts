import {create} from 'zustand';

export type ProToastKind = 'success' | 'error' | 'warning' | 'info';

export type ProToastItem = {
  id: number;
  message: string;
  kind: ProToastKind;
};

interface ProToastState {
  current: ProToastItem | null;
  queue: ProToastItem[];
  show: (message: string, kind?: ProToastKind) => void;
  hide: (id?: number) => void;
  dismissAll: () => void;
}

let nextId = 1;

export const useProToastStore = create<ProToastState>((set, get) => ({
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

export function useProToast() {
  return useProToastStore(s => s.show);
}
