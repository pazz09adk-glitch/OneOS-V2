export type FlowType = '收款' | '付款';
export type LinkStatus = '未关联' | '部分关联' | '已闭环';

export type BizDocType =
  | '提车应收款'
  | '租赁账单'
  | '还车应结（应收）'
  | '能源充值/氢气预付'
  | '客户氢费对账单'
  | '还车应结（应退）'
  | '加氢站对账单'
  | '保险付款单';

export type FinanceRecord = {
  id: string;
  flow: FlowType;
  voucherNo: string;
  counterparty: string;
  amount: number;
  paidAt: string;
  channel: string;
  status: LinkStatus;
  linkedAmount: number;
  linkedDocs: { type: BizDocType; docNo: string; amount: number }[];
  remark?: string;
};

export type BizDocOption = {
  type: BizDocType;
  docNo: string;
  customer: string;
  amount: number;
  plate?: string;
};

export type PageMode = 'ledger' | 'detail';

export type StatusTab = LinkStatus | 'all';

export function formatMoney(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
