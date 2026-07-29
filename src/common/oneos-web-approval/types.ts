export type ApprovalStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'terminated';

export type ApprovalTabKey = 'todo' | 'done' | 'initiated' | 'cc';

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

export type ApprovalListTab = ApprovalTabKey;

export interface ApprovalKeyFact {
  label: string;
  value: string;
  emphasis?: boolean;
}

export interface ApprovalRisk {
  label: string;
  level?: 'high' | 'medium' | 'low';
}

export interface ApprovalCardItem {
  id: string;
  type: ApprovalTypeKey;
  status: ApprovalStatus;
  listTab: ApprovalListTab;
  title: string;
  subtitle?: string;
  keyFacts?: ApprovalKeyFact[];
  risks?: ApprovalRisk[];
  currentApprover?: string;
  initiatedBy: string;
  initiatedAt: string;
  typeLabel?: string;
  statusLabel?: string;
  projectName?: string;
  footerText?: string;
  showInitiatorInFooter?: boolean;
  initiatorSuffixInFooter?: boolean;
  extraTags?: string[];
  ccUsers?: string[];
  handledBy?: string;
}

export const CURRENT_USER = '张明辉';

export type StatusFilterValue = 'all' | 'pending' | 'approved' | 'rejected';

export interface ApprovalFilters {
  status: StatusFilterValue;
  type: ApprovalTypeKey | 'all';
  keyword: string;
}

export const EMPTY_APPROVAL_FILTERS: ApprovalFilters = {
  status: 'all',
  type: 'all',
  keyword: '',
};
