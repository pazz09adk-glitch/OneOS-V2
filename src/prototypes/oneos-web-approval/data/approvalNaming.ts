import type { ApprovalTypeKey } from '../types';

/**
 * 审批单号 / 标题命名规范（定版）
 * 审批单号：AP-{业务码}-{YYYYMM}-{流水号}
 * 业务单据号：各业务模块自有规则，仅作关联展示，不替代审批单号
 */

export const APPROVAL_TYPE_CODE: Record<ApprovalTypeKey, string> = {
  vehicle_procurement: 'VP',
  lease: 'LC',
  charter: 'CH',
  transfer: 'TRF',
  vehicle_change: 'CHG',
  replacement: 'RPL',
  delivery: 'DLV',
  return_settlement: 'RS',
  pickup_receivable: 'PR',
  billing: 'BILL',
  insurance: 'INS',
  supplier: 'SUP',
  customer_risk: 'RISK',
  third_party_return: 'TPR',
  contract_template: 'TPL',
  annual_inspection: 'AI',
  finance_payment: 'PAY',
  clearing: 'CLR',
  energy_account: 'EA',
};

/** 列表/详情 Pill 定版文案 */
export const APPROVAL_TYPE_LABEL: Record<ApprovalTypeKey, string> = {
  vehicle_procurement: '车辆采购审批',
  lease: '租赁合同审批',
  charter: '包车合同审批',
  transfer: '跨区调拨审批',
  vehicle_change: '运营异动审批',
  replacement: '替换车审批',
  delivery: '交车审批',
  return_settlement: '还车退租结算',
  pickup_receivable: '提车应收审批',
  billing: '租赁期款账单',
  insurance: '保险采购/续保',
  supplier: '供应商准入审批',
  customer_risk: '客户风险标签审批',
  third_party_return: '三方退租审批',
  contract_template: '合同模板审批',
  annual_inspection: '年审审批',
  finance_payment: '付款申请审批',
  clearing: '清分结算审批',
  energy_account: '能源账户审批',
};

/** 业务单据号字段展示名（默认） */
export const DEFAULT_BIZ_DOC_LABEL: Record<ApprovalTypeKey, string> = {
  vehicle_procurement: '采购合同编号',
  lease: '租赁合同编号',
  charter: '包车合同编号',
  transfer: '调拨单号',
  vehicle_change: '异动备案号',
  replacement: '替换申请单号',
  delivery: '交车单号',
  return_settlement: '还车结算单号',
  pickup_receivable: '应收单号',
  billing: '账单编号',
  insurance: '保单/批单号',
  supplier: '供应商档案号',
  customer_risk: '客户编码',
  third_party_return: '退租协议号',
  contract_template: '模板版本号',
  annual_inspection: '年审任务号',
  finance_payment: '付款凭证单',
  clearing: '清分批次号',
  energy_account: '账户/充值单号',
};
