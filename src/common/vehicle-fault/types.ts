/** 车辆运维 · 故障处置 · 共享类型 */

export type FaultStatus = 'pending' | 'processing' | 'suspended' | 'archived';

export type FaultLevel = '特急' | '紧急' | '一般' | '提示';

export type EvidenceKind = 'image' | 'video' | 'pdf' | 'word' | 'other';

export type NotifyChannel = 'sms' | 'email';

export type NotifyKind = 'due_soon' | 'overdue';

export interface FaultAttachment {
  id: string;
  name: string;
  kind: EvidenceKind;
  /** 原始记录媒体 vs 处置证据 */
  source: 'ai' | 'evidence';
  uploadedBy: string;
  uploadedAt: string;
  /** 演示用预览文案 / URL 占位 */
  previewNote?: string;
}

export interface HangHistoryItem {
  id: string;
  reason: string;
  at: string;
  by: string;
  resumedAt?: string;
}

export interface NotifyRecord {
  id: string;
  kind: NotifyKind;
  channel: NotifyChannel;
  to: string;
  title: string;
  body: string;
  sentAt: string;
  /** 原型演示标记 */
  demo: true;
}

export interface FaultRecord {
  id: string;
  code: string;
  status: FaultStatus;
  reportedAt: string;
  /** AI 原始 */
  chatSummary: string;
  aiAttachments: FaultAttachment[];
  /** 车辆 */
  plateNo: string;
  brand: string;
  model: string;
  region: string;
  /** 处置 */
  faultTime?: string;
  location?: string;
  part?: string;
  level?: FaultLevel;
  result?: string;
  remark?: string;
  evidence: FaultAttachment[];
  /** 处理人；待处理可为空 */
  assignee?: string;
  hangHistory: HangHistoryItem[];
  notifications: NotifyRecord[];
  archivedAt?: string;
  updatedAt: string;
}

export const FAULT_STATUS_LABEL: Record<FaultStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  suspended: '挂起',
  archived: '已归档',
};

export const FAULT_LEVELS: FaultLevel[] = ['特急', '紧急', '一般', '提示'];

export const OPS_SUPERVISOR_NAME = '刘洋';
