export type ApprovalStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'terminated';

export type ApprovalTabKey = 'todo' | 'initiated' | 'done' | 'cc';

export type ApprovalTypeKey =
  | 'vehicle_procurement'
  | 'lease'
  | 'charter'
  | 'transfer'
  | 'vehicle_change'
  | 'replacement'
  | 'delivery'
  | 'return_settlement'
  | 'pickup_receivable'
  | 'billing'
  | 'insurance'
  | 'supplier'
  | 'customer_risk'
  | 'third_party_return'
  | 'contract_template'
  | 'annual_inspection'
  | 'finance_payment'
  | 'clearing'
  | 'energy_account';

export interface ApprovalKeyFact {
  label: string;
  value: string;
  emphasis?: boolean;
}

export interface ApprovalRisk {
  label: string;
  level?: 'high' | 'medium' | 'low';
}

export interface ApprovalFlowNode {
  id: string;
  title: string;
  role: string;
  approverName: string;
  avatar?: string;
  status: 'approved' | 'processing' | 'pending' | 'rejected' | 'cc';
  time?: string;
  comment?: string;
}

export interface ApprovalCardItem {
  /** 审批单号：AP-{业务码}-{YYYYMM}-{流水号}，审批中心唯一主键 */
  id: string;
  type: ApprovalTypeKey;
  status: ApprovalStatus;
  listTab: ApprovalTabKey;
  /** 主标题：主体对象 + 关键数量/标的 + 动作 */
  title: string;
  /** 副标题：项目名 / 签约主体 · 关键约束 */
  subtitle?: string;
  /** 关联业务单据号（合同号/账单号等），不替代审批单号 */
  bizDocNo?: string;
  /** 业务单据号字段名，如「采购合同编号」 */
  bizDocLabel?: string;
  keyFacts?: ApprovalKeyFact[];
  risks?: ApprovalRisk[];
  currentApprover?: string;
  initiatedBy: string;
  initiatedByAvatar?: string;
  initiatedAt: string;
  typeLabel?: string;
  statusLabel?: string;
  projectName?: string;
  extraTags?: string[];
  handledBy?: string;
  handledAt?: string;
  urgency?: 'normal' | 'urgent' | 'emergency';

  // 详情丰富字段
  contentSummary?: string;
  detailSections?: Array<{
    title: string;
    items: Array<{ label: string; value: string; isAmount?: boolean }>;
  }>;
  /** 通用明细表（如租赁订单行）；区块标题固定为「明细」，不做业务专名 */
  lineItems?: {
    columns: Array<{ key: string; title: string }>;
    rows: Array<Record<string, string>>;
  };
  attachments?: Array<{ name: string; size: string; type: string }>;
  flowNodes?: ApprovalFlowNode[];
}

export const CURRENT_USER = '姚守涛';

export type StatusFilterValue = 'all' | 'pending' | 'approved' | 'rejected';

export interface ApprovalFilters {
  status: StatusFilterValue;
  type: ApprovalTypeKey | 'all';
  keyword: string;
  urgency: 'all' | 'urgent';
}

export const INITIAL_APPROVAL_FILTERS: ApprovalFilters = {
  status: 'all',
  type: 'all',
  keyword: '',
  urgency: 'all',
};
