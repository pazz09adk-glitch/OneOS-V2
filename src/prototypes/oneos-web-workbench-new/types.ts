export type RoleId =
  | 'bizAdmin'
  | 'bizEnergy'
  | 'bizSales'
  | 'ops'
  | 'procurement'
  | 'safety'
  | 'finance'
  | 'legal'
  | 'gm';

/** 运营看板绑定的部门（若依角色管理「绑定部门」的演示模型） */
export type DeptId = 'biz' | 'ops' | 'finance' | 'safety' | 'procurement' | 'legal' | 'gm';

export type DeptCockpitLayout = 'biz-tri' | 'ops-quad' | 'finance-dual' | 'generic';

export interface DeptConfig {
  id: DeptId;
  name: string;
  layout: DeptCockpitLayout;
}

export interface RoleConfig {
  id: RoleId;
  name: string;
  shortLabel: string;
  operatorName: string;
  canUrge: boolean;
  urgeLines?: string[];
  defaultQuickLinks: string[];
  /** 角色绑定部门；决定运营看板模板（多角色可共用同一部门看板） */
  boundDeptId?: DeptId;
}

export interface KpiDetailItem {
  id: string;
  title: string;
  subTitle: string;
  plate?: string;
  customer?: string;
  amount?: number;
  href?: string;
}

export interface KpiTile {
  id: string;
  roleIds: RoleId[];
  /** 功能模块分组（预警密集展示用） */
  module: string;
  title: string;
  count: number;
  unit: string;
  level: 'urgent' | 'warning' | 'info';
  ruleTip: string;
  details?: KpiDetailItem[];
}

export interface TodoItem {
  id: string;
  roleIds: RoleId[];
  title: string;
  bizType: string;
  bizTypeLabel: string;
  urgentLevel: 'normal' | 'overdue';
  slaHoursLeft: number;
  flowStatus: 'pending' | 'processing' | 'done' | 'overdue';
  managerCanUrge: boolean;
  received?: number;
  receivable?: number;
  submitted?: boolean;
  href?: string;
  createTime: string;
  detailSummary?: Record<string, string>;
}

export interface ApprovalFlowNode {
  label: string;
  status: 'completed' | 'current' | 'pending';
  handler?: string;
}

export interface ApprovalCardItem {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  tab: 'todo' | 'initiated' | 'done' | 'cc';
  currentStep: string;
  stayDuration: string;
  applyTime: string;
  applicant: string;
  flowNodes: ApprovalFlowNode[];
  href?: string;
  isUrgent?: boolean;
  /** 抄送 Tab：抄送说明正文 */
  ccContent?: string;
  /** 「我发起的」是否允许发起人催办 */
  initiatorCanUrge?: boolean;
}

export interface NoticeItem {
  id: string;
  roleIds: RoleId[];
  title: string;
  content: string;
  sendTime: string;
  read: boolean;
  isUrge: boolean;
  href?: string;
}

export interface QuickLink {
  id: string;
  title: string;
  category: 'action' | 'module';
  href: string;
  iconName: string;
  roleIds?: RoleId[];
}

export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}
