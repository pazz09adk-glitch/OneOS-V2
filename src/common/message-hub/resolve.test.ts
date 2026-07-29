import { describe, expect, it } from 'vitest';
import { resolveMessageTarget } from './resolve';
import { ROUTE_RULES } from './routes';
import { SEED_MESSAGES } from './seed';
import type { HubMessage, RouteRule } from './types';

const baseMsg: HubMessage = {
  id: 'm1',
  sourceSystem: 'oneos',
  bizType: 'approval.arrive',
  bizId: 'AP-1',
  title: '待审',
  summary: '',
  detail: '详情',
  priority: 'normal',
  createdAt: '2026-07-22T10:00:00+08:00',
  audienceRoleIds: [],
  channels: [],
  bizTag: '租赁合同',
};

describe('resolveMessageTarget', () => {
  it('精确匹配 web 规则', () => {
    const rules: RouteRule[] = [
      {
        sourceSystem: 'oneos',
        bizType: 'approval.arrive',
        client: 'web',
        targetTemplate: '/prototypes/oneos-web-approval-todo?id={bizId}',
        label: '审批待办',
      },
    ];
    const r = resolveMessageTarget(baseMsg, 'web', rules);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.uri).toBe('/prototypes/oneos-web-approval-todo?id=AP-1');
  });

  it('harmony 可 fallback 到 android', () => {
    const rules: RouteRule[] = [
      {
        sourceSystem: 'oneos',
        bizType: 'approval.arrive',
        client: 'android',
        targetTemplate: 'oneos://approval/{bizId}',
        label: '安卓审批',
        fallbackClient: undefined,
      },
      {
        sourceSystem: 'oneos',
        bizType: 'approval.arrive',
        client: 'harmony',
        targetTemplate: '',
        label: '鸿蒙走安卓模板',
        fallbackClient: 'android',
      },
    ];
    const r = resolveMessageTarget(baseMsg, 'harmony', rules);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.uri).toBe('oneos://approval/AP-1');
  });

  it('无规则返回固定文案', () => {
    const r = resolveMessageTarget(baseMsg, 'wechat_oa', []);
    expect(r).toEqual({
      ok: false,
      reason: 'no_rule',
      message: '当前端暂无可跳转目标',
    });
  });

  it('种子 approval 在 web 可解析', () => {
    const msg = SEED_MESSAGES.find((m) => m.bizType === 'approval.arrive');
    expect(msg).toBeTruthy();
    const r = resolveMessageTarget(msg!, 'web', ROUTE_RULES);
    expect(r.ok).toBe(true);
  });

  it('带 externalApp', () => {
    const msg = { ...baseMsg, sourceSystem: 'external' as const, bizType: 'order.action', bizId: 'O-9' };
    const rules: RouteRule[] = [
      {
        sourceSystem: 'external',
        bizType: 'order.action',
        client: 'web',
        targetTemplate: 'ext-app-a://order/{bizId}',
        label: '外部 App A 订单',
        externalApp: 'external-app-a',
      },
    ];
    const r = resolveMessageTarget(msg, 'web', rules);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.uri).toBe('ext-app-a://order/O-9');
      expect(r.externalApp).toBe('external-app-a');
    }
  });
});
