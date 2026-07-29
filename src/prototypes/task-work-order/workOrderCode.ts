/**
 * 任务工单编号规则
 *
 * 格式：WO-{YYYY}-{NNNN}
 * - WO：固定前缀（Work Order）
 * - YYYY：创建当日公历年份（4 位）
 * - NNNN：该自然年内流水号，从 0001 起，不足 4 位左侧补 0
 *
 * 示例：WO-2026-0001、WO-2026-0012
 *
 * 取号：扫描已有工单中同年份编号的最大流水号 + 1；同年无记录则从 0001 起。
 * 批量创建：按调用顺序连续递增。
 */

const CODE_RE = /^WO-(\d{4})-(\d{4})$/;

export function parseWorkOrderCode(code: string): { year: number; seq: number } | null {
  const m = CODE_RE.exec((code || '').trim());
  if (!m) return null;
  return { year: Number(m[1]), seq: Number(m[2]) };
}

export function formatWorkOrderCode(year: number, seq: number): string {
  const n = Math.max(1, Math.floor(seq));
  return `WO-${year}-${String(n).padStart(4, '0')}`;
}

/** 取某年下一可用流水号（基于已有 code 列表） */
export function nextWorkOrderSeq(existingCodes: string[], year: number): number {
  let max = 0;
  for (const code of existingCodes) {
    const parsed = parseWorkOrderCode(code);
    if (parsed && parsed.year === year) {
      max = Math.max(max, parsed.seq);
    }
  }
  return max + 1;
}

/**
 * 生成一个或多个工单编号。
 * @param existingCodes 当前已占用编号
 * @param count 连续生成个数
 * @param at 创建时刻（默认现在），用于取年份
 */
export function generateWorkOrderCodes(
  existingCodes: string[],
  count = 1,
  at: Date | string = new Date()
): string[] {
  const d = typeof at === 'string' ? new Date(at) : at;
  const year = d.getFullYear();
  let seq = nextWorkOrderSeq(existingCodes, year);
  const codes: string[] = [];
  for (let i = 0; i < count; i += 1) {
    codes.push(formatWorkOrderCode(year, seq));
    seq += 1;
  }
  return codes;
}

export function generateWorkOrderCode(
  existingCodes: string[],
  at?: Date | string
): string {
  return generateWorkOrderCodes(existingCodes, 1, at)[0];
}
