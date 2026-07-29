export type BillStatus = '待收款' | '部分收款' | '已结清' | '逾期';
export type Tier = 'KA' | 'LA' | 'SMB';
export type BillRow = {
  id: string;
  billNo: string;
  contractNo: string;
  contractType: string;
  projectName: string;
  customer: string;
  plate: string;
  period: string;
  periodNo: number;
  billStart: string;
  billEnd: string;
  pickupDate: string;
  contractStart: string;
  contractEnd: string;
  avgDays: number;
  deposit: number;
  contractRent: number;
  receivableRent: number;
  insuranceSurcharge: number;
  opsFee: number;
  otherIncome: number;
  discount: number;
  amount: number; // 应收合计
  received: number;
  unreceived: number;
  tier: Tier;
  graceDays: number;
  dueDate: string;
  status: BillStatus;
  owner: string;
  bizDept: string;
  genDay: string;
  invoiceDate: string;
  paymentDate: string;
  paymentMethod: string;
  h2Cost: number;
  vehicleCost: number;
  remark: string;
};
export type Filters = {
  keyword: string;
  tier: Tier | 'all';
  bizDept: string | 'all';
  contractType: string | 'all';
  periodStart: string;
  periodEnd: string;
};

/** 台账主表：按合同聚合；子表为各期账单 */
export type ContractBillMaster = {
  contractNo: string;
  contractType: string;
  projectName: string;
  customer: string;
  plate: string;
  pickupDate: string;
  contractStart: string;
  contractEnd: string;
  owner: string;
  bizDept: string;
  tier: Tier;
  graceDays: number;
  bills: BillRow[];
  amountTotal: number;
  receivedTotal: number;
  unreceivedTotal: number;
  billCount: number;
  /** 合同维度最差账单态，便于主表一眼扫风险 */
  worstStatus: BillStatus;
};

const STATUS_RANK: Record<BillStatus, number> = {
  逾期: 4,
  部分收款: 3,
  待收款: 2,
  已结清: 1,
};

export function worstBillStatus(bills: BillRow[]): BillStatus {
  return bills.reduce<BillStatus>((acc, b) => (STATUS_RANK[b.status] > STATUS_RANK[acc] ? b.status : acc), '已结清');
}

export function formatMoney(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
