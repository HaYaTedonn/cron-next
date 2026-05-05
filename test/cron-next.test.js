import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse, matches, nextRun, nextRuns } from '../index.js';

const D = (...a) => new Date(...a); // months 0-based

test('every 15 minutes', () => {
  assert.deepEqual(nextRun('*/15 * * * *', D(2026, 0, 1, 10, 7, 30)), D(2026, 0, 1, 10, 15, 0));
  assert.deepEqual(nextRun('*/15 * * * *', D(2026, 0, 1, 10, 15, 0)), D(2026, 0, 1, 10, 30, 0));
});

test('weekdays at 9:00', () => {
  // 2026-01-03 is Saturday -> next is Monday 2026-01-05 09:00
  assert.deepEqual(nextRun('0 9 * * 1-5', D(2026, 0, 3, 12, 0, 0)), D(2026, 0, 5, 9, 0, 0));
});

test('Sundays at midnight (0 and 7 both mean Sunday)', () => {
  const a = nextRun('0 0 * * 0', D(2026, 0, 1, 0, 0, 0));
  const b = nextRun('0 0 * * 7', D(2026, 0, 1, 0, 0, 0));
  assert.equal(a.getDay(), 0);
  assert.deepEqual(a, b);
});

test('leap day Feb 29', () => {
  assert.deepEqual(nextRun('0 0 29 2 *', D(2026, 5, 1)), D(2028, 1, 29, 0, 0, 0));
});

test('month names and dom step', () => {
  assert.deepEqual(nextRun('0 0 1 jan,jul *', D(2026, 3, 1)), D(2026, 6, 1, 0, 0, 0));
});

test('matches', () => {
  assert.equal(matches('0 0 1 1 *', D(2026, 0, 1, 0, 0)), true);
  assert.equal(matches('0 0 1 1 *', D(2026, 0, 1, 0, 1)), false);
});

test('DOM/DOW OR semantics (13th OR Friday)', () => {
  // 2026-02-06 is a Friday (not the 13th) -> should match via DOW
  assert.equal(matches('0 0 13 * 5', D(2026, 1, 6, 0, 0)), true);
  // 2026-01-13 is the 13th (Tuesday) -> should match via DOM
  assert.equal(matches('0 0 13 * 5', D(2026, 0, 13, 0, 0)), true);
  // a plain Wednesday that is not the 13th -> no match
  assert.equal(matches('0 0 13 * 5', D(2026, 0, 14, 0, 0)), false);
});

test('nextRuns returns multiple', () => {
  const runs = nextRuns('0 0 * * *', 3, D(2026, 0, 1, 12, 0));
  assert.deepEqual(runs, [D(2026, 0, 2, 0, 0), D(2026, 0, 3, 0, 0), D(2026, 0, 4, 0, 0)]);
});

test('invalid expressions throw', () => {
  assert.throws(() => parse('* * * *'));      // too few fields
  assert.throws(() => parse('99 * * * *'));   // out of range
});
