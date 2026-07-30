export type EngagementStatus =
  | '跟进中'
  | '待准入'
  | '已转化'
  | '已释放'
  | '失败'
  | '转让审批中';

export type AdmissionStatus = '未准入' | '评级中' | '标准' | '非标' | '禁止';

export type PageMode = 'ledger' | 'detail' | 'claim';

export type StatusTab = EngagementStatus | 'all';

export interface FollowUp {
  id: string;
  at: string;
  author: string;
  kind: '拜访' | '报价' | '意向' | '其他';
  content: string;
}

export interface EngagementOrder {
  id: string;
  customerName: string;
  creditCode: string;
  region: string;
  city: string;
  owner: string;
  collaborator?: string;
  status: EngagementStatus;
  admission: AdmissionStatus;
  protectUntil: string;
  claimedAt: string;
  intentVehicles: number;
  followUps: FollowUp[];
  contractNo?: string;
}

export interface Filters {
  keyword: string;
  region: string;
  protect: 'all' | 'expiring' | 'ok';
}

/** 原型当前登录业务员（演示撞单与门禁） */
export const CURRENT_USER = '张伟';
