import type { ExternalAppId, RouteRule, SourceSystem } from './types';

type OneosRule = {
  bizType: string;
  web: string;
  mobilePath: string;
  label: string;
  pcOnlyWechat?: boolean;
};

function oneosRules(configs: OneosRule[]): RouteRule[] {
  return configs.flatMap((c) => fiveClients('oneos', c.bizType, c.web, c.mobilePath, c.label, c.pcOnlyWechat));
}

function fiveClients(
  sourceSystem: SourceSystem,
  bizType: string,
  web: string,
  mobilePath: string,
  label: string,
  pcOnlyWechat = false,
  externalApp?: ExternalAppId,
): RouteRule[] {
  const wechat = pcOnlyWechat ? '' : `https://oa.example.com/h5/${mobilePath}?id={bizId}`;
  return [
    { sourceSystem, bizType, client: 'web', targetTemplate: web, label, externalApp },
    {
      sourceSystem,
      bizType,
      client: 'ios',
      targetTemplate: `oneos://${mobilePath}/{bizId}`,
      label: `${label}（iOS）`,
      externalApp,
    },
    {
      sourceSystem,
      bizType,
      client: 'android',
      targetTemplate: `oneos-android://${mobilePath}/{bizId}`,
      label: `${label}（安卓）`,
      externalApp,
    },
    {
      sourceSystem,
      bizType,
      client: 'harmony',
      targetTemplate: '',
      label: `${label}（鸿蒙）`,
      fallbackClient: 'android',
      externalApp,
    },
    {
      sourceSystem,
      bizType,
      client: 'wechat_oa',
      targetTemplate: wechat,
      label: `${label}（服务号）`,
      externalApp,
    },
  ];
}

function externalRules(
  bizType: string,
  template: string,
  label: string,
  externalApp: ExternalAppId,
): RouteRule[] {
  const mobilePath = bizType.split('.')[0]!;
  return fiveClients('external', bizType, template, mobilePath, label, true, externalApp).map((r) =>
    r.client === 'ios' || r.client === 'android'
      ? { ...r, targetTemplate: template }
      : r.client === 'harmony'
        ? { ...r, targetTemplate: '', fallbackClient: 'android' as const }
        : r,
  );
}

export const ROUTE_RULES: RouteRule[] = [
  ...oneosRules([
    {
      bizType: 'approval.arrive',
      web: '/prototypes/oneos-web-approval-todo?id={bizId}',
      mobilePath: 'approval',
      label: '审批待办',
    },
    {
      bizType: 'urge.remind',
      web: '/prototypes/oneos-web-ops',
      mobilePath: 'urge',
      label: '催办提醒',
    },
    {
      bizType: 'contract.expire',
      web: '/prototypes/customer-management',
      mobilePath: 'contract',
      label: '合同到期',
    },
    {
      bizType: 'license.expire',
      web: '/prototypes/customer-management',
      mobilePath: 'license',
      label: '证照到期',
    },
    {
      bizType: 'bill.ready',
      web: '/prototypes/lease-business-ledger',
      mobilePath: 'bill',
      label: '账单生成',
      pcOnlyWechat: true,
    },
    {
      bizType: 'h2.balance',
      web: '/prototypes/payment-records',
      mobilePath: 'h2',
      label: '氢费余额',
    },
    {
      bizType: 'system.release',
      web: '',
      mobilePath: 'release',
      label: '版本更新通知',
      pcOnlyWechat: true,
    },
    {
      bizType: 'payment.unlinked',
      web: '/prototypes/payment-records',
      mobilePath: 'payment',
      label: '收款未关联账单',
      pcOnlyWechat: true,
    },
    {
      bizType: 'receivable.partial',
      web: '/prototypes/vehicle-pickup-receivable',
      mobilePath: 'receivable',
      label: '提车应收款差额',
    },
    {
      bizType: 'system.notice',
      web: '',
      mobilePath: 'notice',
      label: '系统通知（仅详情）',
      pcOnlyWechat: true,
    },
    {
      bizType: 'overview.risk',
      web: '/prototypes/lease-business-line-overview',
      mobilePath: 'overview',
      label: '经营高风险汇总',
    },
  ]),
  ...fiveClients(
    'vehicle-mid',
    'fault.overdue',
    '/prototypes/vehicle-fault-handling#page=detail&id={bizId}',
    'fault',
    '故障逾期',
  ),
  ...fiveClients(
    'vehicle-mid',
    'vehicle.status',
    '/prototypes/vehicle-management',
    'vehicle',
    '车辆状态变更',
  ),
  ...fiveClients('other-system', 'generic.notice', '', 'notice', '外部系统通用通知', true),
  ...externalRules('order.action', 'ext-app-a://order/{bizId}', '外部 App A 订单操作', 'external-app-a'),
  ...externalRules('settle.action', 'ext-app-b://settle/{bizId}', '外部 App B 结算操作', 'external-app-b'),
];
