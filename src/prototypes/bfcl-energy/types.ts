export type EnergyTab = '账户' | '充值单' | '客户对账' | '加氢站对账';
export type AccountRow = { id: string; customer: string; project: string; balance: number; status: '正常' | '低余额' };
export type RechargeRow = { id: string; docNo: string; customer: string; amount: number; linked: number; status: '未关联' | '部分入账' | '已入账' };
export type CustBillRow = { id: string; docNo: string; customer: string; amount: number; linked: number; status: '未收款' | '部分' | '已付清' };
export type StationBillRow = { id: string; docNo: string; station: string; amount: number; linked: number; status: '待付款' | '已付款' };
export type H2Record = { id: string; plate: string; kg: number; amount: number; verified: boolean; deducted: boolean };
export function formatMoney(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
