export type SourceSystem = 'oneos' | 'vehicle-mid' | 'other-system' | 'external';
export type MessageClient = 'web' | 'ios' | 'android' | 'harmony' | 'wechat_oa';
export type ChannelStatus = 'pending' | 'sent' | 'failed' | 'skipped';
export type MessagePriority = 'normal' | 'high';
export type ExternalAppId = 'external-app-a' | 'external-app-b';

export type ChannelDelivery = {
  client: MessageClient;
  status: ChannelStatus;
  updatedAt?: string;
};

export type HubMessage = {
  id: string;
  sourceSystem: SourceSystem;
  bizType: string;
  bizId: string;
  title: string;
  summary: string;
  detail: string;
  priority: MessagePriority;
  createdAt: string;
  readAt?: string;
  /** 角色占位；空数组表示全员可见 */
  audienceRoleIds: string[];
  channels: ChannelDelivery[];
  /** 展示用业务标签，如「交车任务」 */
  bizTag: string;
};

export type RouteRule = {
  sourceSystem: SourceSystem;
  bizType: string;
  client: MessageClient;
  targetTemplate: string;
  label: string;
  externalApp?: ExternalAppId;
  /** 精确未命中时，再试该 client（如 harmony → android） */
  fallbackClient?: MessageClient;
};

export type ResolveOk = {
  ok: true;
  uri: string;
  label: string;
  externalApp?: ExternalAppId;
  rule: RouteRule;
};

export type ResolveFail = {
  ok: false;
  reason: 'no_rule';
  message: '当前端暂无可跳转目标';
};

export type ResolveResult = ResolveOk | ResolveFail;
