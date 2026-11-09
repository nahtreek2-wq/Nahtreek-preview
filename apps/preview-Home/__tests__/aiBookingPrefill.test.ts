import {clearAiBookingPrefill, setAiBookingPrefill, takeAiBookingPrefill} from '../src/services/aiBookingPrefill';

afterEach(() => clearAiBookingPrefill());

it('hands one AI plan summary to the matching booking form', () => {
  setAiBookingPrefill('plumbing', 'Bathroom tap leaks near the base.');
  expect(takeAiBookingPrefill('plumbing')).toBe('Bathroom tap leaks near the base.');
  // One-shot: a second form does not see it again.
  expect(takeAiBookingPrefill('plumbing')).toBeNull();
});

it('never prefills the wrong service', () => {
  setAiBookingPrefill('plumbing', 'Bathroom tap leaks near the base.');
  expect(takeAiBookingPrefill('electrical')).toBeNull();
  expect(takeAiBookingPrefill('plumbing')).toBe('Bathroom tap leaks near the base.');
});
