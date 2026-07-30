export type TaskType =
  | 'mileage'
  | 'maintenance'
  | 'policy'
  | 'payment'
  | 'penalty'
  | 'general'
  /** 业务人员因特殊操作需人工跨模块改数 */
  | 'data_adjustment';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'closed';

export type ViewTab = 'all' | 'published' | 'supervise';

export type ViewMode = 'list' | 'kanban';

export type MileageMode = 'period_avg' | 'cumulative';

/**
 * 关联业务 = OneOS 功能模块 id（对照侧栏目录 + 知识库 + 桌面 ONE-OS）。
 * 历史样例单仍用 purchase_contract / lease_contract / lease_bill / vehicle_return_settlement。
 */
export type RelatedBizType = string;

export interface PurchaseContractClause {
  mileage?: string;
  maintenance?: string;
  policy?: string;
  payment?: string;
  penalty?: string;
  general?: string;
  [key: string]: string | undefined;
}

export interface PurchaseContract {
  id: string;
  code: string;
  supplierName: string;
  vehicleModel: string;
  quantity: number;
  signDate: string;
  clauses: PurchaseContractClause;
}

export interface BoundVehicle {
  id: string;
  plateNo: string;
  brand: string;
  model: string;
  vin: string;
  mileage: number;
  mileageSource: '车机' | 'GPS' | '手动录入';
  contractId: string;
}

export interface OwnerUser {
  id: string;
  name: string;
  dept: string;
}

export interface FeedbackRecord {
  at: string;
  by: string;
  note: string;
  attachments?: string[];
}

export interface TimelineEvent {
  at: string;
  action: string;
  operator: string;
  remark?: string;
}

export interface MileageProgressInfo {
  percent: number;
  current: number;
  target: number;
  label: string;
  vehicles?: BoundVehicle[];
  remainDays?: number | null;
}

export interface RelatedBizDoc {
  id: string;
  type: RelatedBizType;
  code: string;
  title: string;
  /** 该业务单据可绑定的车辆（原型演示级联带出） */
  vehicleIds?: string[];
}

/** 业务数据调整类 · 单条改数明细 */
export interface DataAdjustItem {
  id: string;
  /** 修改字段 */
  fieldName: string;
  /** 修改原因 */
  reason: string;
}

export interface TaskWorkOrder {
  id: string;
  code: string;
  taskType: TaskType;
  title: string;
  requirement: string;
  source: 'contract' | 'standalone';
  /** @deprecated 兼容旧字段，优先用 relatedBiz* */
  contractId?: string;
  /** @deprecated 兼容旧字段，优先用 relatedBizCode */
  contractCode?: string;
  relatedBizType?: RelatedBizType;
  relatedBizCode?: string;
  relatedBizId?: string;
  /** 业务数据调整类：改数字段明细 */
  dataAdjustItems?: DataAdjustItem[];
  vehicleIds: string[];
  periodStart?: string;
  periodEnd?: string;
  /** 计划完成「不限」· 长期跟进；为 true 时不计算超时 */
  periodUnlimited?: boolean;
  mileageTarget?: number;
  mileageMode?: MileageMode;
  initiatorId: string;
  accountableOwnerId: string;
  currentOwnerId: string;
  status: TaskStatus;
  createdAt: string;
  feedbacks: FeedbackRecord[];
  timeline: TimelineEvent[];
  syncWorkbench: boolean;
  progressInfo?: MileageProgressInfo | null;
}

export interface TaskFilters {
  taskType?: TaskType | 'all';
  status?: TaskStatus | 'all';
  relatedBizType?: RelatedBizType | 'all';
  /** 更多筛选 · 关联业务单号（如采购合同号） */
  relatedBizCode?: string;
  ownerId?: string;
  keyword: string;
  startDate: string;
  endDate: string;
}

export interface KpiCardData {
  key: string;
  title: string;
  count: number;
  desc: string;
  iconType: string;
  tone: 'primary' | 'warning' | 'danger' | 'info' | 'success';
}

export type HubPage = 'ledger' | 'create' | 'detail' | 'edit';

/** 待处理 / 进行中 / 已超时可编辑；已办结、已关闭不可编辑 */
export function canEditTask(task: Pick<TaskWorkOrder, 'status'>): boolean {
  return task.status !== 'completed' && task.status !== 'closed';
}
