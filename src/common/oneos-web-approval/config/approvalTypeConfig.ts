import type { ApprovalCardItem, ApprovalStatus, ApprovalTypeKey, StatusFilterValue } from '../types';

export interface ApprovalTypeOption {
  value: ApprovalTypeKey;
  label: string;
  shortLabel: string;
  color: string;
}

export const APPROVAL_TYPE_CONFIG: Record<ApprovalTypeKey, ApprovalTypeOption> = {
  vehicle_procurement: { value: 'vehicle_procurement', label: '车辆采购', shortLabel: '采购', color: '#8b5cf6' },
  lease: { value: 'lease', label: '租赁合同', shortLabel: '租赁', color: '#2563eb' },
  charter: { value: 'charter', label: '包车合同', shortLabel: '包车', color: '#0ea5e9' },
  transfer: { value: 'transfer', label: '调拨', shortLabel: '调拨', color: '#14b8a6' },
  vehicle_change: { value: 'vehicle_change', label: '异动', shortLabel: '异动', color: '#f59e0b' },
  replacement: { value: 'replacement', label: '替换车', shortLabel: '替换', color: '#f97316' },
  delivery: { value: 'delivery', label: '交车', shortLabel: '交车', color: '#10b981' },
  return_settlement: { value: 'return_settlement', label: '还车应结款', shortLabel: '还车结款', color: '#ef4444' },
  pickup_receivable: { value: 'pickup_receivable', label: '提车应收款', shortLabel: '提车应收', color: '#ec4899' },
  billing: { value: 'billing', label: '租赁账单', shortLabel: '账单', color: '#a855f7' },
  insurance: { value: 'insurance', label: '保险采购', shortLabel: '保险', color: '#22c55e' },
  supplier: { value: 'supplier', label: '供应商准入', shortLabel: '供应商', color: '#64748b' },
  customer_risk: { value: 'customer_risk', label: '客户风险标签', shortLabel: '风险标签', color: '#dc2626' },
  third_party_return: { value: 'third_party_return', label: '三方退租', shortLabel: '退租', color: '#d97706' },
  contract_template: { value: 'contract_template', label: '合同模板', shortLabel: '模板', color: '#7c3aed' },
  annual_inspection: { value: 'annual_inspection', label: '年审', shortLabel: '年审', color: '#0891b2' },
  finance_payment: { value: 'finance_payment', label: '付款申请', shortLabel: '付款', color: '#be185d' },
  clearing: { value: 'clearing', label: '清分结算', shortLabel: '清分', color: '#4f46e5' },
  energy_account: { value: 'energy_account', label: '能源账户', shortLabel: '能源', color: '#059669' },
};

export const APPROVAL_TYPE_OPTIONS = Object.values(APPROVAL_TYPE_CONFIG);

export const STATUS_OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '审批中' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
];

const STATUS_LABEL_MAP: Record<ApprovalStatus, string> = {
  pending: '审批中',
  processing: '审批中',
  approved: '已通过',
  rejected: '被驳回',
  terminated: '被终止',
};

export function getApprovalTypeLabel(type: ApprovalTypeKey): string {
  return APPROVAL_TYPE_CONFIG[type]?.label ?? type;
}

export function getApprovalTypeColor(type: ApprovalTypeKey): string {
  return APPROVAL_TYPE_CONFIG[type]?.color ?? '#64748b';
}

export function formatStatusLabel(item: Pick<ApprovalCardItem, 'status' | 'currentApprover'>): string {
  const base = STATUS_LABEL_MAP[item.status] ?? item.status;
  if ((item.status === 'pending' || item.status === 'processing') && item.currentApprover) {
    return `审批中：${item.currentApprover}`;
  }
  return base;
}

export function matchesStatusFilter(status: ApprovalStatus, filter: StatusFilterValue): boolean {
  if (filter === 'all') return true;
  if (filter === 'pending') return status === 'pending' || status === 'processing';
  if (filter === 'approved') return status === 'approved';
  if (filter === 'rejected') return status === 'rejected';
  return true;
}
