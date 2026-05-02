// cron-next — Compute the next run time(s) from a standard 5-field cron expression.
//   Fields: minute hour day-of-month month day-of-week
//   Supports: *  ,lists  a-b ranges  */n and a-b/n steps  3-letter month/day names
//   Day-of-month / day-of-week use the classic OR semantics when both are restricted.
//   Works in local time. Zero dependencies.

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const DOWS = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

function parseField(spec, min, max, names) {
  const star = spec.trim() === '*';
  const set = new Set();
  for (let part of spec.split(',')) {
    part = part.trim();
    if (names) part = part.replace(/[a-z]{3,}/gi, (m) => (names[m.toLowerCase()] ?? m).toString());
    let m;
    if (part === '*') { for (let i = min; i <= max; i++) set.add(i); }
    else if ((m = part.match(/^\*\/(\d+)$/))) { const s = +m[1]; for (let i = min; i <= max; i += s) set.add(i); }
    else if ((m = part.match(/^(\d+)-(\d+)(?:\/(\d+))?$/))) {
      const a = +m[1], b = +m[2], s = m[3] ? +m[3] : 1;
      for (let i = a; i <= b; i += s) set.add(i);
    }
    else if ((m = part.match(/^(\d+)\/(\d+)$/))) { const a = +m[1], s = +m[2]; for (let i = a; i <= max; i += s) set.add(i); }
    else if ((m = part.match(/^(\d+)$/))) { set.add(+m[1]); }
    else throw new Error(`cron-next: invalid field segment "${part}"`);
  }
  for (const v of set) if (v < min || v > max) throw new Error(`cron-next: value ${v} out of range ${min}-${max}`);
  return { set, star };
}

/** Parse a 5-field cron expression into field sets. */
export function parse(expr) {
  const f = String(expr).trim().split(/\s+/);
  if (f.length !== 5) throw new Error('cron-next: expected 5 fields "min hour dom month dow"');
  const minute = parseField(f[0], 0, 59);
  const hour = parseField(f[1], 0, 23);
  const dom = parseField(f[2], 1, 31);
  const month = parseField(f[3], 1, 12, MONTHS);
  const dow = parseField(f[4], 0, 7, DOWS);
  if (dow.set.has(7)) { dow.set.delete(7); dow.set.add(0); } // 7 = Sunday
  return { minute, hour, dom, month, dow };
}

function matchesParsed(p, d) {
  if (!p.minute.set.has(d.getMinutes())) return false;
  if (!p.hour.set.has(d.getHours())) return false;
  if (!p.month.set.has(d.getMonth() + 1)) return false;
  const dom = d.getDate(), dow = d.getDay();
  let domMatch;
  if (p.dom.star && p.dow.star) domMatch = true;
  else if (p.dom.star) domMatch = p.dow.set.has(dow);
  else if (p.dow.star) domMatch = p.dom.set.has(dom);
  else domMatch = p.dom.set.has(dom) || p.dow.set.has(dow); // classic OR
  return domMatch;
}

/** Does the given Date's minute match the cron expression? */
export function matches(expr, date) {
  return matchesParsed(parse(expr), date);
}

const MAX_MINUTES = 366 * 24 * 60 * 5; // search up to ~5 years

/**
 * The next time the expression fires, strictly after `from`.
 * @param {string} expr
 * @param {Date} [from] default: now
 * @returns {Date}
 */
export function nextRun(expr, from = new Date()) {
  const p = parse(expr);
  const d = new Date(from.getTime());
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  for (let i = 0; i < MAX_MINUTES; i++) {
    if (matchesParsed(p, d)) return new Date(d.getTime());
    d.setMinutes(d.getMinutes() + 1);
  }
  throw new Error(`cron-next: no matching time within ~5 years for "${expr}"`);
}

/** The next `n` fire times. */
export function nextRuns(expr, n, from = new Date()) {
  const out = [];
  let cur = from;
  for (let i = 0; i < n; i++) { const nx = nextRun(expr, cur); out.push(nx); cur = nx; }
  return out;
}

export default { parse, matches, nextRun, nextRuns };
