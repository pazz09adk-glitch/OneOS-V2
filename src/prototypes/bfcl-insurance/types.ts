export type InsTab = '供应商' | '比价付款' | '保单';
export type Supplier = { id: string; name: string; accountOk: boolean; bank: string; accountNo: string };
export type InsPay = { id: string; docNo: string; supplier: string; amount: number; status: '待比价' | '待付款' | '已闭环'; accountBlocked: boolean };
export type PolicyBatch = { id: string; batchNo: string; payDocNo: string; vehicles: number; policies: number; status: '不可上传' | '可上传' | '已归档' };
export function formatMoney(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
