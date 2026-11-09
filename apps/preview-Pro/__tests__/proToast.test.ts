import {useProToastStore} from '../src/stores/proToast';

beforeEach(() => {
  useProToastStore.getState().dismissAll();
});

test('shows the first toast immediately', () => {
  useProToastStore.getState().show('Saved.');
  const state = useProToastStore.getState();
  expect(state.current?.message).toBe('Saved.');
  expect(state.current?.kind).toBe('info');
});

test('queues while one is visible and advances on hide', () => {
  const store = useProToastStore.getState();
  store.show('First.');
  store.show('Second.', 'success');
  expect(useProToastStore.getState().current?.message).toBe('First.');
  useProToastStore.getState().hide();
  const state = useProToastStore.getState();
  expect(state.current?.message).toBe('Second.');
  expect(state.current?.kind).toBe('success');
});

test('ignores blank and duplicate messages', () => {
  const store = useProToastStore.getState();
  store.show('   ');
  expect(useProToastStore.getState().current).toBeNull();
  store.show('Saved.');
  store.show('Saved.');
  expect(useProToastStore.getState().queue).toHaveLength(0);
});

test('hide with a stale id keeps the current toast', () => {
  const store = useProToastStore.getState();
  store.show('Saved.');
  const id = useProToastStore.getState().current?.id ?? 0;
  useProToastStore.getState().hide(id + 999);
  expect(useProToastStore.getState().current?.message).toBe('Saved.');
});
