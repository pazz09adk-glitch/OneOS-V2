import { CURRENT_USER } from './mockData';
import { canEditTask as canEditByStatus, TaskStatus, TaskWorkOrder } from './types';

/** 原型视角切换：演示不同角色按钮可见性 */
export type DemoViewerPreset =
  | 'as_initiator'
  | 'as_executor'
  | 'as_accountable'
  | 'as_leader';

export const DEMO_VIEWER_OPTIONS: {
  id: DemoViewerPreset;
  label: string;
  hint: string;
}[] = [
  { id: 'as_initiator', label: '我是发起人', hint: '可编辑、催办、办结' },
  { id: 'as_executor', label: '我是执行人', hint: '可反馈、符合条件可办结' },
  { id: 'as_accountable', label: '我是归口', hint: '可催办督办、办结' },
  { id: 'as_leader', label: '我是领导（只读）', hint: '仅查看，无编催结' },
];

/** 领导只读演示账号（不任单据执行/归口时） */
export const LEADER_DEMO_USER_ID = 'u_leader_ro';

export function resolveViewerUserId(
  preset: DemoViewerPreset,
  task?: TaskWorkOrder | null
): string {
  switch (preset) {
    case 'as_initiator':
      return task?.initiatorId || CURRENT_USER.id;
    case 'as_executor':
      return task?.currentOwnerId || CURRENT_USER.id;
    case 'as_accountable':
      return task?.accountableOwnerId || CURRENT_USER.id;
    case 'as_leader':
      return LEADER_DEMO_USER_ID;
    default:
      return CURRENT_USER.id;
  }
}

export function isOpenTask(status: TaskStatus): boolean {
  return status !== 'completed' && status !== 'closed';
}

/** 发起人：改内容（未办结） */
export function canEditTaskContent(task: TaskWorkOrder, viewerId: string): boolean {
  if (!canEditByStatus(task)) return false;
  return viewerId === task.initiatorId;
}

/** 催办：发起人或归口；未办结 */
export function canUrgeTask(task: TaskWorkOrder, viewerId: string): boolean {
  if (!isOpenTask(task.status)) return false;
  return viewerId === task.initiatorId || viewerId === task.accountableOwnerId;
}

/** 提交反馈：当前协同执行人；未办结 */
export function canSubmitFeedback(task: TaskWorkOrder, viewerId: string): boolean {
  if (!isOpenTask(task.status)) return false;
  return viewerId === task.currentOwnerId;
}

/**
 * 办结规则（产品口径）：
 * - 数据调整：数智执行人，或发起人/归口
 * - 里程：发起人或归口（不以车辆资产完成为强制前置）
 * - 其它履约：执行人须已有 ≥1 条反馈；发起人/归口可直接办结
 */
export function canCompleteTask(task: TaskWorkOrder, viewerId: string): boolean {
  if (!isOpenTask(task.status)) return false;

  const isInitiator = viewerId === task.initiatorId;
  const isAccountable = viewerId === task.accountableOwnerId;
  const isExecutor = viewerId === task.currentOwnerId;

  if (task.taskType === 'mileage') {
    return isInitiator || isAccountable;
  }

  if (task.taskType === 'data_adjustment') {
    return isExecutor || isInitiator || isAccountable;
  }

  // 履约协同类
  if (isInitiator || isAccountable) return true;
  if (isExecutor && (task.feedbacks?.length || 0) >= 1) return true;
  return false;
}

export function completeBlockedReason(
  task: TaskWorkOrder,
  viewerId: string
): string | null {
  if (!isOpenTask(task.status)) return '工单已办结或已关闭';
  if (canCompleteTask(task, viewerId)) return null;

  const isExecutor = viewerId === task.currentOwnerId;
  if (
    isExecutor &&
    task.taskType !== 'mileage' &&
    task.taskType !== 'data_adjustment' &&
    !(task.feedbacks?.length)
  ) {
    return '请先提交至少一条执行反馈后再办结';
  }
  return '当前身份无权办结此工单';
}

export function isPeriodUnlimited(task: Pick<TaskWorkOrder, 'periodEnd' | 'periodUnlimited'>): boolean {
  return Boolean(task.periodUnlimited) || task.periodEnd === 'UNLIMITED';
}

export function formatPeriodEndLabel(
  periodEnd?: string,
  periodUnlimited?: boolean
): string {
  if (periodUnlimited || periodEnd === 'UNLIMITED') return '不限';
  return periodEnd || '—';
}
