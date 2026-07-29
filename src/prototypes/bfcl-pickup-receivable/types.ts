export type AuditStatus = '待提交' | '待审批' | '审批中' | '审批通过' | '已驳回';
export type InvoiceMethod = '先开票后付款' | '先付款后开票';
export type InvoiceStatus = '未开票' | '部分开票' | '已开票';
export type AlignStatus = '待收款' | '部分收款' | '已付清' | '特批放行' | '已交车';

export type VehicleLine = {
  seq: number;
  brand: string;
  model: string;
  plate: string;
  selected: boolean;
  locked: boolean; // 已完成提车应收不可再勾
  rentReceivable: number;
  rentActual: number;
  rentRemark: string;
  discount: number;
  discountRemark: string;
  deposit: number;
  serviceReceivable: number;
  serviceActual: number;
  serviceItems: { name: string; receivable: number; actual: number; discount: number }[];
};

export type ReceiptChild = {
  id: string;
  seq: number;
  auditStatus: AuditStatus;
  creator: string;
  chargeTime: string;
  deliveryCount: number;
  vehicles: VehicleLine[];
  receivableTotal: number;
  actualTotal: number;
  discountTotal: number;
  financeReceived: number;
  arrivalAmount: number;
  arrivalTime: string;
  invoiceMethod: InvoiceMethod;
  invoiceStatus: InvoiceStatus;
  invoicedAmount: number;
  invoiceNote: string;
  h2PrepaidReceivable: number;
  h2PrepaidActual: number;
  before15: boolean;
  pickupDate: string;
  alignStatus: AlignStatus;
  specialApproved: boolean;
};

export type ContractMaster = {
  id: string;
  contractCode: string;
  contractType: string;
  projectName: string;
  customerName: string;
  payMode: '预付' | '后付';
  payCycleMonths: number;
  contractStart: string;
  contractEnd: string;
  businessDept: string;
  businessPerson: string;
  allVehiclesReceivableCompleted: boolean;
  totalReceivable: number;
  totalActual: number;
  totalDiscount: number;
  totalFinanceReceived: number;
  children: ReceiptChild[];
};

export type Filters = {
  keyword: string;
  auditStatus: AuditStatus | 'all';
  alignStatus: AlignStatus | 'all';
  businessDept: string | 'all';
};

export function formatMoney(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
