import type { FaultRecord } from './types';
import { isDueSoon, isOverdue } from './sla';
import { loadFaults } from './storage';

export function listDueSoon(records?: FaultRecord[]) {
  const list = records ?? loadFaults();
  return list.filter((r) => isDueSoon(r));
}

export function listOverdue(records?: FaultRecord[]) {
  const list = records ?? loadFaults();
  return list.filter((r) => isOverdue(r));
}

export function listPending(records?: FaultRecord[]) {
  const list = records ?? loadFaults();
  return list.filter((r) => r.status === 'pending');
}

export function faultStatsForScope(
  region: string | null,
  assignee: string | null,
  records?: FaultRecord[],
): {
  total: number;
  closed: number;
  rate: number;
  suspended: number;
  dueSoon: number;
  label: string;
} {
  let rows = records ?? loadFaults();
  if (region) rows = rows.filter((r) => r.region === region);
  if (assignee) rows = rows.filter((r) => r.assignee === assignee);
  const total = rows.length;
  const closed = rows.filter((r) => r.status === 'archived').length;
  const suspended = rows.filter((r) => r.status === 'suspended').length;
  const dueSoon = rows.filter((r) => isDueSoon(r)).length;
  const label = assignee
    ? assignee
    : region
      ? `${region} · 地区合计`
      : '全部人员合计';
  return {
    total,
    closed,
    rate: total > 0 ? Math.round((closed / total) * 1000) / 10 : 0,
    suspended,
    dueSoon,
    label,
  };
}
