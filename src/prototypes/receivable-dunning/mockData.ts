import type { CustomerReceivable } from './types';

/** 金额格式：与催款函一致，千分位 + 两位小数 */
export function formatMoney(n: number): string {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function sumPeriodUnpaid(periods: CustomerReceivable['periods']): number {
  return periods.reduce((s, p) => s + p.unpaidAmount, 0);
}

/** 当前总欠 = 推算期末未收口径（各期未收之和）+ 违约金 */
export function recomputeDebt(row: CustomerReceivable): number {
  return sumPeriodUnpaid(row.periods) + (row.violation?.penaltyAmount ?? 0);
}

/**
 * 推算示意：当前期末 = 上期期末 + 期间租赁台账 + 期间氢费对账（mock 用已算好的 currentPeriodEndBalance）
 */
export function explainCalc(row: CustomerReceivable): string {
  const a = row.financeAnchor;
  return (
    a.calcNote ||
    `自 ${a.priorPeriodEndAt} 起，以上期期末 ¥${formatMoney(a.priorPeriodEndAmount)} 为锚，滚动租赁业务台账与氢费对账单发生额，推算当前期末 ¥${formatMoney(row.currentPeriodEndBalance)}。`
  );
}

/**
 * Mock：博众对齐催款函；取数口径按「上期期末 + 台账/氢费滚动」演示。
 */
export const MOCK_CUSTOMERS: CustomerReceivable[] = [
  {
    key: 'RD-BZ-001',
    customerName: '广州市博众供应链管理有限公司',
    bizDept: '业务3部',
    owner: '金可鹏',
    status: '逾期',
    vehicleCount: 24,
    contracts: [
      {
        code: 'LNZLHT2026030601-042',
        signedAt: '2026-03-06',
        partyA: '羚牛氢能科技（广东）有限公司',
      },
      {
        code: 'LNZLHT2026021101-042',
        signedAt: '2026-02-11',
        partyA: '羚牛氢能科技（广东）有限公司',
      },
    ],
    financeAnchor: {
      priorPeriodEndAmount: 0,
      priorPeriodEndAt: '2026-05-31',
      calcNote:
        '财务锚定上期期末 0（2026-05-31）。期间租赁台账计入 6–7 月租金 185,466.67；氢费对账单本期无增量。推算当前期末 185,466.67；加违约金后总欠 188,566.67。',
    },
    currentPeriodEndBalance: 185466.67,
    periods: [
      {
        id: 'p-2026-06',
        periodLabel: '2026年6月',
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        lines: [
          { vehicleModel: '帕立安 4.5T', quantity: 2, rentAmount: 7200, source: '租赁台账' },
          { vehicleModel: '帕力安 18T', quantity: 22, rentAmount: 87066.67, source: '租赁台账' },
        ],
        periodEndAmount: 94266.67,
        paidAmount: 0,
        unpaidAmount: 94266.67,
      },
      {
        id: 'p-2026-07',
        periodLabel: '2026年7月',
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        lines: [
          { vehicleModel: '帕立安 4.5T', quantity: 2, rentAmount: 7200, source: '租赁台账' },
          { vehicleModel: '帕力安 18T', quantity: 21, rentAmount: 84000, source: '租赁台账' },
        ],
        periodEndAmount: 91200,
        paidAmount: 0,
        unpaidAmount: 91200,
      },
    ],
    violation: {
      asOf: '2026-06-24',
      count: 27,
      penaltyAmount: 3100,
    },
    currentTotalDebt: 188566.67,
    overdueDays: 18,
    notice: {
      noticeNo: 'CK-20260708-001',
      createdAt: '2026-07-07',
      deadline: '2026-07-10',
      sealStatus: '已盖章',
      sealApplyStatus: '已通过',
      stampedFileName: '催款函-博众（20260708）-盖章版.pdf',
      stampedAt: '2026-07-08 09:10',
      esignTaskId: 'ESIGN-20260708-88421',
    },
    bankHint: '招商银行广州萝岗支行 / 120924165110201',
  },
  {
    key: 'RD-RY-002',
    customerName: '日邮物流（中国）有限公司',
    bizDept: '业务3部',
    owner: '金可鹏',
    status: '逾期',
    vehicleCount: 2,
    contracts: [
      {
        code: 'LNZLHT2024111201-018',
        signedAt: '2024-11-12',
        partyA: '羚牛氢能科技（嘉兴）有限公司',
      },
    ],
    financeAnchor: {
      priorPeriodEndAmount: 51918.41,
      priorPeriodEndAt: '2025-09-30',
      calcNote:
        '财务锚定上期期末 51,918.41（2025-09-30）。期间租赁台账 +33,485.32，氢费对账单本期已含在台账净额。推算当前期末 85,403.73。',
    },
    currentPeriodEndBalance: 85403.73,
    periods: [
      {
        id: 'p-ry-10',
        periodLabel: '2025年10月',
        startDate: '2025-10-01',
        endDate: '2025-10-31',
        lines: [
          { vehicleModel: '氢运 4.5T', quantity: 2, rentAmount: 28000, source: '租赁台账' },
          { vehicleModel: '氢费对账', quantity: 1, rentAmount: 5485.32, source: '氢费对账单' },
        ],
        periodEndAmount: 33485.32,
        paidAmount: 0,
        unpaidAmount: 33485.32,
      },
      {
        id: 'p-ry-11',
        periodLabel: '2025年11月',
        startDate: '2025-11-01',
        endDate: '2025-11-30',
        lines: [
          { vehicleModel: '氢运 4.5T', quantity: 2, rentAmount: 40000, source: '租赁台账' },
          { vehicleModel: '氢费对账', quantity: 1, rentAmount: 11918.41, source: '氢费对账单' },
        ],
        periodEndAmount: 51918.41,
        paidAmount: 0,
        unpaidAmount: 51918.41,
      },
    ],
    currentTotalDebt: 85403.73,
    overdueDays: 42,
    notice: undefined,
    bankHint: '招商银行广州萝岗支行 / 120924165110201',
  },
  {
    key: 'RD-SD-003',
    customerName: '昆山燊达物流供应链有限公司',
    bizDept: '业务2部',
    owner: '尚建华',
    status: '逾期',
    vehicleCount: 0,
    contracts: [
      {
        code: 'LNZLHT2023080101-009',
        signedAt: '2023-08-01',
        partyA: '羚牛氢能科技（江苏）有限公司',
      },
    ],
    financeAnchor: {
      priorPeriodEndAmount: 299608.15,
      priorPeriodEndAt: '2025-11-30',
      calcNote:
        '财务锚定上期期末 299,608.15（2025-11-30）。完结尾款期租赁台账无新增，氢费对账单无增量，当前期末仍为 299,608.15。',
    },
    currentPeriodEndBalance: 299608.15,
    periods: [
      {
        id: 'p-sd-tail',
        periodLabel: '尾款清算期',
        startDate: '2025-12-01',
        endDate: '2026-01-31',
        lines: [{ vehicleModel: '项目尾款', quantity: 1, rentAmount: 185516.4, source: '租赁台账' }],
        periodEndAmount: 185516.4,
        paidAmount: 0,
        unpaidAmount: 185516.4,
      },
      {
        id: 'p-sd-hist',
        periodLabel: '历史结余',
        startDate: '2025-01-01',
        endDate: '2025-11-30',
        lines: [
          { vehicleModel: '历史应收结转', quantity: 1, rentAmount: 114091.75, source: '租赁台账' },
        ],
        periodEndAmount: 114091.75,
        paidAmount: 0,
        unpaidAmount: 114091.75,
      },
    ],
    currentTotalDebt: 299608.15,
    overdueDays: 90,
    notice: {
      noticeNo: 'CK-20260620-003',
      createdAt: '2026-06-20',
      deadline: '2026-06-30',
      sealStatus: '草稿',
      sealApplyStatus: '未申请',
    },
  },
  {
    key: 'RD-LH-004',
    customerName: '上海利合供应链管理有限公司',
    bizDept: '业务2部',
    owner: '刘念念',
    status: '正常',
    vehicleCount: 10,
    contracts: [
      {
        code: 'LNZLHT2025011501-022',
        signedAt: '2025-01-15',
        partyA: '羚牛氢能科技（嘉兴）有限公司',
      },
    ],
    financeAnchor: {
      priorPeriodEndAmount: 2372.16,
      priorPeriodEndAt: '2026-06-30',
      calcNote:
        '财务锚定上期期末 2,372.16（溢出）。期间租赁台账应收 128,000，回款已覆盖并仍有溢出，当前期末未收 0。',
    },
    currentPeriodEndBalance: 0,
    periods: [
      {
        id: 'p-lh-07',
        periodLabel: '2026年7月',
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        lines: [
          { vehicleModel: '氢运混编', quantity: 10, rentAmount: 120000, source: '租赁台账' },
          { vehicleModel: '氢费对账', quantity: 1, rentAmount: 8000, source: '氢费对账单' },
        ],
        periodEndAmount: 128000,
        paidAmount: 130372.16,
        unpaidAmount: 0,
      },
    ],
    currentTotalDebt: 0,
    overdueDays: 0,
  },
];

export const CREDITOR = {
  companyName: '羚牛氢能科技（广东）有限公司',
  accountName: '羚牛氢能科技(广东)有限公司',
  accountNo: '120924165110201',
  bankName: '招商银行广州萝岗支行',
  sealCode: '4401122009049',
};

/** 演示用甲方主体名录 */
export const PARTY_A_OPTIONS = [
  '羚牛氢能科技（广东）有限公司',
  '羚牛氢能科技（嘉兴）有限公司',
  '羚牛氢能科技（江苏）有限公司',
];
