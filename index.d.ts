export interface CronField { set: Set<number>; star: boolean; }
export interface CronFields {
  minute: CronField; hour: CronField; dom: CronField; month: CronField; dow: CronField;
}
/** Parse a 5-field cron expression into field sets. */
export function parse(expr: string): CronFields;
/** Does the given Date's minute match the cron expression? */
export function matches(expr: string, date: Date): boolean;
/** The next time the expression fires, strictly after `from` (default: now). */
export function nextRun(expr: string, from?: Date): Date;
/** The next `n` fire times. */
export function nextRuns(expr: string, n: number, from?: Date): Date[];
declare const _default: {
  parse: typeof parse; matches: typeof matches; nextRun: typeof nextRun; nextRuns: typeof nextRuns;
};
export default _default;
