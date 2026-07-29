import type { FaultRecord } from './types';

export const SLA_DAYS = 30;
export const DUE_SOON_DAYS = 7;

/** 原型「今天」固定，便于演示临期/逾期 */
export const DEMO_TODAY = '2026-07-22';

function parseDay(iso: string): Date {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return d;
}

function addDays(iso: string, days: number): string {
  const d = parseDay(iso);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function deadlineOf(reportedAt: string): string {
  return addDays(reportedAt.slice(0, 10), SLA_DAYS);
}

/** 剩余自然日；负数表示已逾期天数的相反数（-3 = 逾期 3 天） */
export function remainingDays(reportedAt: string, today: string = DEMO_TODAY): number {
  const end = parseDay(deadlineOf(reportedAt)).getTime();
  const now = parseDay(today).getTime();
  return Math.round((end - now) / 86400000);
}

export function isArchived(record: FaultRecord): boolean {
  return record.status === 'archived';
}

export function isOverdue(record: FaultRecord, today: string = DEMO_TODAY): boolean {
  if (isArchived(record)) return false;
  return remainingDays(record.reportedAt, today) < 0;
}

/** 未归档且剩余天数 0～7（含） */
export function isDueSoon(record: FaultRecord, today: string = DEMO_TODAY): boolean {
  if (isArchived(record)) return false;
  const left = remainingDays(record.reportedAt, today);
  return left >= 0 && left <= DUE_SOON_DAYS;
}

export interface ArchiveGap {
  field: string;
  label: string;
}

export function archiveGaps(record: FaultRecord): ArchiveGap[] {
  const gaps: ArchiveGap[] = [];
  if (!record.faultTime?.trim()) gaps.push({ field: 'faultTime', label: '故障时间' });
  if (!record.location?.trim()) gaps.push({ field: 'location', label: '地点' });
  if (!record.part?.trim()) gaps.push({ field: 'part', label: '部位' });
  if (!record.level) gaps.push({ field: 'level', label: '等级' });
  if (!record.result?.trim()) gaps.push({ field: 'result', label: '处置结果' });
  if (!record.evidence?.length) gaps.push({ field: 'evidence', label: '证据附件（至少 1 个）' });
  return gaps;
}

export function canArchive(record: FaultRecord): boolean {
  return archiveGaps(record).length === 0 && record.status === 'processing';
}
