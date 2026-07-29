/** 采购合同审批规则：仅金额超阈值 → 非正常审批 */

import type { ApprovalKind } from './types';

/** 原型可配置阈值（元），默认 500 万 */
export const ABNORMAL_AMOUNT_THRESHOLD = 5_000_000;

export function resolveApprovalKind(totalAmount: number): ApprovalKind {
  return Number(totalAmount) >= ABNORMAL_AMOUNT_THRESHOLD ? 'abnormal' : 'normal';
}

export function approvalKindLabel(kind: ApprovalKind): string {
  return kind === 'abnormal' ? '非正常审批' : '正常审批';
}

export function approvalNodes(kind: ApprovalKind): string[] {
  if (kind === 'abnormal') {
    return ['部门负责人', '财务负责人', '法务/合规', '分管领导'];
  }
  return ['部门负责人', '分管领导'];
}
