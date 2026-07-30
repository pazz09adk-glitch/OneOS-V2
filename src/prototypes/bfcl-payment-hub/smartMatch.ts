import type { BizDocOption, FinanceRecord } from './types';

export type MatchReason = '客户名称' | '金额' | '摘要规则' | '单号命中' | '车牌命中';

export type SmartMatchHit = {
  doc: BizDocOption;
  score: number;
  confidence: '高' | '中' | '低';
  reasons: MatchReason[];
};

/** 银行摘要 / 备注关键词 → 业务单据类型偏好 */
const SUMMARY_TYPE_HINTS: { keywords: string[]; types: BizDocOption['type'][] }[] = [
  { keywords: ['提车', '交车定金', '首付'], types: ['提车应收款'] },
  { keywords: ['租赁', '租金', '月租', '账单'], types: ['租赁账单'] },
  { keywords: ['还车应收', '结清应收', '补款'], types: ['还车应结（应收）'] },
  { keywords: ['退还', '应退', '保证金退', '押金退'], types: ['还车应结（应退）'] },
  { keywords: ['充值', '预付', '氢气预付'], types: ['能源充值/氢气预付'] },
  { keywords: ['氢费', '客户氢'], types: ['客户氢费对账单'] },
  { keywords: ['加氢站', '对账', '月结'], types: ['加氢站对账单'] },
  { keywords: ['保险', '保费', '人保', '平安'], types: ['保险付款单'] },
];

function normalizeName(s: string) {
  return s.replace(/\s+/g, '').replace(/（/g, '(').replace(/）/g, ')').toLowerCase();
}

function nameScore(counterparty: string, customer: string): { pts: number; hit: boolean } {
  const a = normalizeName(counterparty);
  const b = normalizeName(customer);
  if (!a || !b) return { pts: 0, hit: false };
  if (a === b) return { pts: 42, hit: true };
  if (a.includes(b) || b.includes(a)) return { pts: 28, hit: true };
  // 简称互相包含（去掉「公司/有限/物流」等虚词后再比）
  const strip = (x: string) => x.replace(/(有限|责任|公司|集团|分公司|物流|科技|股份)/g, '');
  const as = strip(a);
  const bs = strip(b);
  if (as && bs && (as.includes(bs) || bs.includes(as))) return { pts: 22, hit: true };
  return { pts: 0, hit: false };
}

function amountScore(remain: number, docAmount: number): { pts: number; hit: boolean } {
  if (remain <= 0) return { pts: 0, hit: false };
  const diff = Math.abs(remain - docAmount);
  if (diff < 0.01) return { pts: 38, hit: true };
  if (diff / Math.max(remain, docAmount) <= 0.01) return { pts: 24, hit: true };
  // 单据金额小于剩余、可拆分核销，弱加分
  if (docAmount > 0 && docAmount <= remain + 0.01) return { pts: 8, hit: false };
  return { pts: 0, hit: false };
}

function summaryBundle(record: FinanceRecord) {
  return `${record.remark ?? ''} ${record.channel ?? ''}`.toLowerCase();
}

/**
 * 按客户名称、金额、摘要规则等对可关联单据打分，返回建议列表（降序）。
 */
export function rankSmartMatches(
  record: FinanceRecord,
  options: BizDocOption[],
  remain: number,
): SmartMatchHit[] {
  const linkedNos = new Set(record.linkedDocs.map((d) => d.docNo));
  const text = summaryBundle(record);

  const hits: SmartMatchHit[] = [];

  for (const doc of options) {
    if (linkedNos.has(doc.docNo)) continue;

    let score = 0;
    const reasons: MatchReason[] = [];

    const ns = nameScore(record.counterparty, doc.customer);
    if (ns.hit) {
      score += ns.pts;
      reasons.push('客户名称');
    }

    const as = amountScore(remain, doc.amount);
    if (as.pts > 0) {
      score += as.pts;
      if (as.hit) reasons.push('金额');
    }

    if (text.includes(doc.docNo.toLowerCase())) {
      score += 32;
      reasons.push('单号命中');
    }

    if (doc.plate && text.includes(doc.plate.toLowerCase())) {
      score += 16;
      reasons.push('车牌命中');
    }

    for (const hint of SUMMARY_TYPE_HINTS) {
      if (!hint.types.includes(doc.type)) continue;
      if (hint.keywords.some((k) => text.includes(k.toLowerCase()))) {
        score += 26;
        if (!reasons.includes('摘要规则')) reasons.push('摘要规则');
        break;
      }
    }

    if (score < 22 || reasons.length === 0) continue;

    const confidence: SmartMatchHit['confidence'] =
      score >= 70 ? '高' : score >= 45 ? '中' : '低';

    hits.push({ doc, score, confidence, reasons });
  }

  return hits.sort((a, b) => b.score - a.score || a.doc.docNo.localeCompare(b.doc.docNo));
}

export function confidenceBadgeStatus(c: SmartMatchHit['confidence']): 'success' | 'warning' | 'processing' {
  if (c === '高') return 'success';
  if (c === '中') return 'warning';
  return 'processing';
}
