import type { FaultCategory, FaultRecord, FaultTaskStatus } from './types';

export type SlaKind = 'archived' | 'suspended' | 'overdue' | 'urgent' | 'normal';

export interface SlaInfo {
  kind: SlaKind;
  diffDays: number;
  label: string;
  cls: string;
}

/**
 * 故障编号规则（系统自动生成，不可手填）：
 * `GZ` + 建单日期 `YYYYMMDD` + 建单时分 `HHMM` + 当日流水号 `NN`（两位，自 01 起）
 * 例：GZ20260624111101
 */
export function generateFaultCode(
  at: Date = new Date(),
  existingIds: Iterable<string> = []
): string {
  const y = at.getFullYear();
  const mo = String(at.getMonth() + 1).padStart(2, '0');
  const d = String(at.getDate()).padStart(2, '0');
  const h = String(at.getHours()).padStart(2, '0');
  const mi = String(at.getMinutes()).padStart(2, '0');
  const dayPrefix = `GZ${y}${mo}${d}`;
  const minutePrefix = `${dayPrefix}${h}${mi}`;

  let maxSeq = 0;
  for (const id of existingIds) {
    if (!id.startsWith(dayPrefix) || id.length < minutePrefix.length + 2) continue;
    // 同日任意时分下的流水号一并递增，保证当日唯一
    const seqStr = id.slice(-2);
    const seq = Number.parseInt(seqStr, 10);
    if (Number.isFinite(seq) && seq > maxSeq) maxSeq = seq;
  }

  const next = Math.min(maxSeq + 1, 99);
  return `${minutePrefix}${String(next).padStart(2, '0')}`;
}

/** 从上报时间字符串解析 Date（兼容 `YYYY-MM-DD HH:mm` / `YYYY-MM-DD HH:mm:ss`） */
export function parseReportTime(reportTime: string, fallback = new Date()): Date {
  const normalized = reportTime.trim().replace(/-/g, '/');
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export const TASK_STATUS_LABEL: Record<FaultTaskStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  suspended: '已挂起',
  archived: '已归档',
};

/** 归一化部位列表：去重、保序；空则回退「其他」 */
export function normalizeCategories(
  input: FaultCategory[] | FaultCategory | undefined | null
): FaultCategory[] {
  const list = Array.isArray(input) ? input : input ? [input] : [];
  const seen = new Set<FaultCategory>();
  const out: FaultCategory[] = [];
  for (const c of list) {
    if (!c || seen.has(c)) continue;
    seen.add(c);
    out.push(c);
  }
  return out.length > 0 ? out : ['其他'];
}

export function formatCategories(categories: FaultCategory[] | undefined): string {
  return normalizeCategories(categories).join('、');
}

/** 列表展示：前 max 个 + 溢出计数 */
export function splitCategoriesForDisplay(
  categories: FaultCategory[] | undefined,
  max = 2
): { visible: FaultCategory[]; overflow: number } {
  const all = normalizeCategories(categories);
  if (all.length <= max) return { visible: all, overflow: 0 };
  return { visible: all.slice(0, max), overflow: all.length - max };
}

export function recordHasCategory(
  item: FaultRecord,
  category: FaultCategory | 'all'
): boolean {
  if (category === 'all') return true;
  return normalizeCategories(item.categories).includes(category);
}

export const KANBAN_COLUMNS: {
  id: FaultTaskStatus;
  title: string;
  color: string;
}[] = [
  { id: 'pending', title: '待处理', color: '#3B82F6' },
  { id: 'processing', title: '处理中', color: '#533AFD' },
  { id: 'suspended', title: '已挂起', color: '#D97706' },
  { id: 'archived', title: '已归档', color: '#10B981' },
];

export function getSlaInfo(item: FaultRecord, now = Date.now()): SlaInfo {
  if (item.taskStatus === 'archived') {
    return { kind: 'archived', diffDays: 0, label: '已闭环', cls: 'is-archived' };
  }
  /** 已挂起：不计剩余时限（不展示倒计时，也不计入临期/逾期） */
  if (item.taskStatus === 'suspended') {
    return {
      kind: 'suspended',
      diffDays: Number.POSITIVE_INFINITY,
      label: '挂起、暂停中',
      cls: 'is-suspended',
    };
  }
  const deadline = new Date(item.deadlineTime.replace(/-/g, '/')).getTime();
  const diffDays = Math.ceil((deadline - now) / (1000 * 3600 * 24));
  if (diffDays < 0) {
    return {
      kind: 'overdue',
      diffDays,
      label: `逾期 ${Math.abs(diffDays)} 天`,
      cls: 'is-overdue',
    };
  }
  if (diffDays <= 7) {
    return { kind: 'urgent', diffDays, label: `仅剩 ${diffDays} 天`, cls: 'is-urgent' };
  }
  return { kind: 'normal', diffDays, label: `剩 ${diffDays} 天`, cls: 'is-normal' };
}

export function isUrgentOrOverdue(item: FaultRecord, now = Date.now()): boolean {
  if (item.taskStatus === 'archived' || item.taskStatus === 'suspended') return false;
  return getSlaInfo(item, now).diffDays <= 7;
}
