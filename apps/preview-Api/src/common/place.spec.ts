import { normalizePlace } from "./place";

it.each([
  ["Tamil Nadu", "tamilnadu"],
  ["TamilNadu", "tamilnadu"],
  ["  Tamil-Nadu ", "tamilnadu"],
  ["Krishnagiri", "krishnagiri"],
  ["New Delhi", "newdelhi"],
  ["", ""],
])("normalizes %p to %p", (input, expected) => {
  expect(normalizePlace(input)).toBe(expected);
});
