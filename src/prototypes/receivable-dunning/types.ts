export type AccountStatus = '正常' | '逾期' | '完结';
export type NoticeSealStatus = '未生成' | '草稿' | '盖章中' | '已盖章' | '盖章失败';
export type SealApplyStatus = '未申请' | '审批中' | '已通过' | '已驳回';
export type PageMode = 'ledger' | 'detail' | 'notice';
export type ViewMode = 'list' | 'kanban' | 'split';

export type PeriodLine = {
  vehicleModel: string;
  quantity: number;
  rentAmount: number;
  /** 来源：租赁台账租金 / 氢费对账单 等 */
  source?: '租赁台账' | '氢费对账单' | '其他';
};

export type PeriodBalance = {
  id: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  lines: PeriodLine[];
  /** 该计费期末应结金额 */
  periodEndAmount: number;
  paidAmount: number;
  unpaidAmount: number;
};

export type ViolationFee = {
  asOf: string;
  count: number;
  penaltyAmount: number;
};

export type ContractRef = {
  code: string;
  signedAt: string;
  /** 合同甲方（签章主体） */
  partyA: string;
};

/** 财务锚定的上期期末 */
export type FinanceAnchor = {
  priorPeriodEndAmount: number;
  priorPeriodEndAt: string;
  /** 推算说明文案 */
  calcNote?: string;
};

export type CollectionNotice = {
  noticeNo: string;
  createdAt: string;
  deadline: string;
  sealStatus: NoticeSealStatus;
  sealApplyStatus: SealApplyStatus;
  stampedFileName?: string;
  stampedAt?: string;
  esignTaskId?: string;
};

export type CustomerReceivable = {
  key: string;
  customerName: string;
  bizDept: string;
  owner: string;
  status: AccountStatus;
  vehicleCount: number;
  contracts: ContractRef[];
  /** 财务提供的上期期末锚点 */
  financeAnchor: FinanceAnchor;
  /**
   * 当前期末余额（推算结果）
   * = 上期期末 + 期间租赁台账发生额 + 期间氢费对账发生额（净额按财务口径）
   */
  currentPeriodEndBalance: number;
  periods: PeriodBalance[];
  violation?: ViolationFee;
  /** 当前总欠款 = 当前期末未收口径 + 违约金等 */
  currentTotalDebt: number;
  overdueDays: number;
  notice?: CollectionNotice;
  bankHint?: string;
};

export type LedgerFilters = {
  keyword: string;
  status: AccountStatus | 'all';
  sealStatus: NoticeSealStatus | 'all';
};
