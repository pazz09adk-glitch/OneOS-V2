export type ReturnStatus = '结算中' | '客户应付' | '应退客户' | '已闭环';
export type DeptStatus = '待提交' | '已提交';

export type FeeRow = { seq: number; feeItem: string; amount: number; remark: string; updatedAt: string };

export type ReturnRow = {
  id: string;
  docNo: string;
  contractNo: string;
  projectName: string;
  customer: string;
  plate: string;
  brand: string;
  model: string;
  bizDept: string;
  owner: string;
  deliveryTime: string;
  returnTime: string;
  returnPerson: string;
  returnSignDate: string;
  direction: '应收' | '应退';
  amount: number;
  linked: number;
  /** 对照收付款中枢流水号 */
  paymentRef?: string;
  status: ReturnStatus;
  approvalStatus: string;
  hasCarePackage: boolean;
  hasWearPackage: boolean;
  hasTirePackage: boolean;
  safety: { status: DeptStatus; submitBy: string; fees: FeeRow[]; violations: number; accidents: number };
  ops: { status: DeptStatus; submitBy: string; fees: FeeRow[] };
  biz: { status: DeptStatus; submitBy: string; fees: FeeRow[] };
  energy: { status: DeptStatus; submitBy: string; fees: FeeRow[] };
};

export type Filters = { keyword: string; status: ReturnStatus | 'all'; approval: string | 'all' };

export function formatMoney(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function deptTotal(fees: FeeRow[]) {
  return fees.reduce((s, f) => s + f.amount, 0);
}
