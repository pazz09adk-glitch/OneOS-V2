import type { RoleConfig, RoleId, QuickLink, DeptId, DeptConfig } from '../types';

export const DEPT_CONFIGS: Record<DeptId, DeptConfig> = {
  biz: { id: 'biz', name: '业务管理部', layout: 'biz-tri' },
  ops: { id: 'ops', name: '运维部', layout: 'ops-quad' },
  finance: { id: 'finance', name: '财务部', layout: 'finance-dual' },
  safety: { id: 'safety', name: '安全部', layout: 'generic' },
  procurement: { id: 'procurement', name: '采购部', layout: 'generic' },
  legal: { id: 'legal', name: '法务部', layout: 'generic' },
  gm: { id: 'gm', name: '高管办', layout: 'biz-tri' },
};

export const ROLE_CONFIGS: Record<RoleId, RoleConfig> = {
  bizAdmin: {
    id: 'bizAdmin',
    name: '业务管理部',
    shortLabel: '业管',
    operatorName: '王冕',
    canUrge: true,
    urgeLines: ['lease', 'self', 'billing', 'settlement'],
    defaultQuickLinks: [
      'quick-lease-contract',
      'quick-pickup-receivable',
      'quick-billing',
      'quick-return-settlement',
      'quick-customer-ledger',
    ],
    boundDeptId: 'biz',
  },
  bizEnergy: {
    id: 'bizEnergy',
    name: '业务管理部-能源组',
    shortLabel: '能源',
    operatorName: '周凯',
    canUrge: true,
    urgeLines: ['energy'],
    defaultQuickLinks: ['quick-energy-account', 'quick-h2-fee-ledger', 'quick-billing'],
    boundDeptId: 'biz',
  },
  bizSales: {
    id: 'bizSales',
    name: '业务部',
    shortLabel: '业务',
    operatorName: '王磊',
    canUrge: true,
    urgeLines: ['lease', 'self'],
    defaultQuickLinks: ['quick-lease-contract', 'quick-customer-ledger', 'quick-pickup-receivable'],
    boundDeptId: 'biz',
  },
  ops: {
    id: 'ops',
    name: '运维部',
    shortLabel: '运维',
    operatorName: '刘洋',
    canUrge: true,
    urgeLines: ['ops', 'lease', 'fault'],
    defaultQuickLinks: [
      'quick-vehicle-fault',
      'quick-inspection',
      'quick-annual-review',
      'quick-vehicle-assets',
    ],
    boundDeptId: 'ops',
  },
  procurement: {
    id: 'procurement',
    name: '采购部',
    shortLabel: '采购',
    operatorName: '黄倩',
    canUrge: false,
    defaultQuickLinks: ['quick-vehicle-assets', 'quick-insurance-buy'],
    boundDeptId: 'procurement',
  },
  safety: {
    id: 'safety',
    name: '安全部',
    shortLabel: '安全',
    operatorName: '孙敏',
    canUrge: true,
    urgeLines: ['safety'],
    defaultQuickLinks: ['quick-inspection', 'quick-annual-review', 'quick-vehicle-assets'],
    boundDeptId: 'safety',
  },
  finance: {
    id: 'finance',
    name: '财务部',
    shortLabel: '财务',
    operatorName: '陈静',
    canUrge: true,
    urgeLines: ['lease', 'energy', 'billing'],
    defaultQuickLinks: ['quick-billing', 'quick-payment-collection', 'quick-energy-account'],
    boundDeptId: 'finance',
  },
  legal: {
    id: 'legal',
    name: '法务部',
    shortLabel: '法务',
    operatorName: '赵律师',
    canUrge: true,
    urgeLines: ['lease', 'self', 'legal'],
    defaultQuickLinks: ['quick-lease-contract', 'quick-return-settlement'],
    boundDeptId: 'legal',
  },
  gm: {
    id: 'gm',
    name: '总经理',
    shortLabel: '高管',
    operatorName: '王冕',
    canUrge: true,
    defaultQuickLinks: [
      'quick-lease-contract',
      'quick-vehicle-assets',
      'quick-payment-collection',
      'quick-vehicle-fault',
    ],
    boundDeptId: 'gm',
  },
};

/** 多角色登录人王冕映射的角色集合（业管+能源组绑同一部门，演示共用看板） */
export const MULTI_ROLE_OPERATOR_MAP: Record<string, RoleId[]> = {
  王冕: ['bizAdmin', 'bizEnergy', 'ops'],
};

export const QUICK_LINKS_STORAGE_KEY = 'oneos-wb-new-quick-links-v1';

/** 所有可用的快捷入口定义 */
export const ALL_QUICK_LINKS: QuickLink[] = [
  {
    id: 'quick-lease-contract',
    title: '新建租赁合同',
    category: 'action',
    href: '/prototypes/lease-contract-management',
    iconName: 'FileText',
  },
  {
    id: 'quick-return-settlement',
    title: '退车结算申请',
    category: 'action',
    href: '/prototypes/lease-contract-management',
    iconName: 'RotateCcw',
  },
  {
    id: 'quick-vehicle-fault',
    title: '故障登记排故',
    category: 'action',
    href: '/prototypes/vehicle-fault-handling',
    iconName: 'Wrench',
  },
  {
    id: 'quick-billing',
    title: '租赁期款账单',
    category: 'action',
    href: '/prototypes/lease-contract-management',
    iconName: 'CreditCard',
  },
  {
    id: 'quick-pickup-receivable',
    title: '提车应收款核销',
    category: 'action',
    href: '/prototypes/lease-contract-management',
    iconName: 'Receipt',
  },
  {
    id: 'quick-energy-account',
    title: '能源账户充值',
    category: 'action',
    href: '/prototypes/lease-contract-management',
    iconName: 'Fuel',
  },
  {
    id: 'quick-insurance-buy',
    title: '保险采购发起',
    category: 'action',
    href: '/prototypes/vehicle-management',
    iconName: 'ShieldCheck',
  },
  {
    id: 'quick-vehicle-assets',
    title: '车辆资产台账',
    category: 'module',
    href: '/prototypes/vehicle-management',
    iconName: 'Truck',
  },
  {
    id: 'quick-customer-ledger',
    title: '客户台账管理',
    category: 'module',
    href: '/prototypes/lease-contract-management',
    iconName: 'Users',
  },
  {
    id: 'quick-payment-collection',
    title: '收款未关联处理',
    category: 'module',
    href: '/prototypes/lease-contract-management',
    iconName: 'DollarSign',
  },
  {
    id: 'quick-inspection',
    title: '车辆定期巡检',
    category: 'module',
    href: '/prototypes/vehicle-management',
    iconName: 'ShieldCheck',
  },
  {
    id: 'quick-annual-review',
    title: '车辆年审计划',
    category: 'module',
    href: '/prototypes/vehicle-management',
    iconName: 'Calendar',
  },
  {
    id: 'quick-h2-fee-ledger',
    title: '加氢明细台账',
    category: 'module',
    href: '/prototypes/lease-contract-management',
    iconName: 'Fuel',
  },
];

export function loadPinnedQuickLinks(roleId: RoleId, fallback: string[]): string[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(QUICK_LINKS_STORAGE_KEY);
    if (!raw) return fallback;
    const map = JSON.parse(raw) as Record<string, string[]>;
    const saved = map[roleId];
    return Array.isArray(saved) && saved.length > 0 ? saved : fallback;
  } catch {
    return fallback;
  }
}

export function savePinnedQuickLinks(roleId: RoleId, linkIds: string[]) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(QUICK_LINKS_STORAGE_KEY);
    const map = (raw ? JSON.parse(raw) : {}) as Record<string, string[]>;
    map[roleId] = linkIds;
    localStorage.setItem(QUICK_LINKS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}
