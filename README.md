# cron-next

Compute the **next run time(s)** from a standard 5-field cron expression. A tiny, zero-dependency scheduler primitive.

- Fields: `minute hour day-of-month month day-of-week`
- Supports `*`, lists (`1,2,3`), ranges (`1-5`), steps (`*/15`, `1-30/5`), and 3-letter month/day names
- Classic OR semantics for day-of-month / day-of-week when both are restricted
- Zero dependencies, typed, ESM. Works in local time.

## Install
```bash
npm install @hayatedonn/cron-next
```

## Usage
```js
import { nextRun, nextRuns, matches } from '@hayatedonn/cron-next';

nextRun('*/15 * * * *');          // next quarter hour
nextRun('0 9 * * 1-5');           // next weekday at 09:00
nextRun('0 0 1 jan,jul *');       // next Jan 1 or Jul 1, 00:00
nextRun('0 0 29 2 *');            // next Feb 29 (leap day)

nextRuns('0 0 * * *', 3);         // next 3 daily midnights

matches('0 0 13 * 5', someDate);  // true on Friday OR the 13th
```

## API
- `nextRun(expr, from?)` → `Date` — next fire strictly after `from` (default: now)
- `nextRuns(expr, n, from?)` → `Date[]`
- `matches(expr, date)` → `boolean` — does the date's minute match?
- `parse(expr)` → field sets (advanced)

Day-of-week accepts `0`–`7` where both `0` and `7` mean Sunday.

> Times are computed in the host's local time zone. For a fixed zone, convert as needed.

## Test
```bash
node --test
```

## License
MIT © 2026 Hayate Suzuki
