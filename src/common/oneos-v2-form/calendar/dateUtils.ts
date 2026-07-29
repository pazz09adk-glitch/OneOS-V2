export const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const;

export interface DateRangeValue {
  startDate: string;
  endDate: string;
}

export function parseISODate(value: string): Date | null {
  if (!value) return null;
  const parts = value.split('-').map(Number);
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function compareISODate(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function normalizeDateRange(startDate: string, endDate: string): DateRangeValue {
  if (!startDate || !endDate) return { startDate, endDate };
  if (compareISODate(startDate, endDate) <= 0) return { startDate, endDate };
  return { startDate: endDate, endDate: startDate };
}

export function isDateInRange(
  date: Date,
  start: Date | null,
  end: Date | null,
  hover: Date | null,
): boolean {
  const rangeEnd = end || hover;
  if (!start || !rangeEnd) return false;
  const time = date.getTime();
  const startTime = start.getTime();
  const endTime = rangeEnd.getTime();
  const min = Math.min(startTime, endTime);
  const max = Math.max(startTime, endTime);
  return time >= min && time <= max;
}

export function isRangeStart(
  date: Date,
  start: Date | null,
  end: Date | null,
  hover: Date | null,
): boolean {
  if (!start) return false;
  const rangeEnd = end || hover;
  if (!rangeEnd) return sameCalendarDay(date, start);
  const min = start.getTime() <= rangeEnd.getTime() ? start : rangeEnd;
  return sameCalendarDay(date, min);
}

export function isRangeEnd(
  date: Date,
  start: Date | null,
  end: Date | null,
  hover: Date | null,
): boolean {
  if (!start) return false;
  const rangeEnd = end || hover;
  if (!rangeEnd) return false;
  const max = start.getTime() >= rangeEnd.getTime() ? start : rangeEnd;
  return sameCalendarDay(date, max);
}

export function buildMonthCells(monthDate: Date): Array<{ date: Date; inMonth: boolean }> {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const cells: Array<{ date: Date; inMonth: boolean }> = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    const date = new Date(year, month, i - firstWeekday + 1);
    cells.push({ date, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth(year, month); day += 1) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }

  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }

  return cells;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function formatMonthTitle(monthDate: Date): string {
  return `${monthDate.getFullYear()}年${monthDate.getMonth() + 1}月`;
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatTimeValue(hours: number, minutes: number, seconds?: number): string {
  const h = pad2(hours);
  const m = pad2(minutes);
  if (seconds === undefined) return `${h}:${m}`;
  return `${h}:${m}:${pad2(seconds)}`;
}

export function parseTimeValue(value: string): { hours: number; minutes: number; seconds: number } | null {
  if (!value) return null;
  const parts = value.split(':').map(Number);
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return null;
  const [hours, minutes, seconds = 0] = parts;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
    return null;
  }
  return { hours, minutes, seconds };
}
