import {
  BoundVehicle,
  MileageProgressInfo,
  OwnerUser,
  PurchaseContract,
  RelatedBizDoc,
  RelatedBizType,
  TaskStatus,
  TaskType,
  TaskWorkOrder,
} from './types';

export const CURRENT_USER: OwnerUser = {
  id: 'u_wang',
  name: '王业管',
  dept: '业务管理部',
};

export const TASK_TYPE_META: Record<
  TaskType,
  { label: string; tone: 'primary' | 'info' | 'warning' | 'purple' | 'gold' | 'default' }
> = {
  mileage: { label: '里程履约', tone: 'primary' },
  maintenance: { label: '维保履约', tone: 'info' },
  policy: { label: '政策兑现', tone: 'purple' },
  payment: { label: '付款节点', tone: 'gold' },
  penalty: { label: '条款跟进', tone: 'warning' },
  general: { label: '通用协同', tone: 'default' },
  data_adjustment: { label: '业务数据调整类', tone: 'warning' },
};

export const TASK_STATUS_META: Record<
  TaskStatus,
  { label: string; badgeStatus: 'processing' | 'warning' | 'success' | 'error' | 'default' }
> = {
  pending: { label: '待处理', badgeStatus: 'default' },
  in_progress: { label: '进行中', badgeStatus: 'processing' },
  completed: { label: '已完成', badgeStatus: 'success' },
  overdue: { label: '已超时', badgeStatus: 'error' },
  closed: { label: '已关闭', badgeStatus: 'default' },
};

export const MOCK_PURCHASE_CONTRACTS: PurchaseContract[] = [
  {
    id: 'pc-001',
    code: 'HT-CG-2026-0088',
    supplierName: '东风商用车有限公司',
    vehicleModel: '苏龙18T氢能重卡',
    quantity: 5,
    signDate: '2026-03-15',
    clauses: {
      mileage: '采购车辆交付后首年每月单车行驶里程不低于 6,000 km；未达标需说明原因。',
      maintenance: '首保周期 2 万 km 或 24 个月（以先到为准）；易损件由运维按合同标准执行。',
      policy: '帕力安18T里程优惠政策：月里程≥6000km 可享受次月减免，具体按采购附件执行。',
      payment: '预付 30%，到货验收合格后 60%，质保期满 10%。',
      penalty: '逾期交付按 5000 元/次承担违约金；质量不符按合同第八条处理。',
    },
  },
  {
    id: 'pc-002',
    code: 'HT-CG-2026-0102',
    supplierName: '福田智蓝新能源',
    vehicleModel: '智蓝氢能轻卡 4.5T',
    quantity: 8,
    signDate: '2026-04-02',
    clauses: {
      mileage: '交付后 36 个月内累计里程不低于 15 万 km（单车）。',
      maintenance: '按厂家保养手册执行；乙方提供 3 年质保期内免费上门巡检 1 次/季。',
      policy: '享免政策：帕力安4.5T里程优惠政策（详见附件）。',
      payment: '货到票到 45 天内付款。',
      penalty: '标准违约条款（业管可见，执行人不可见金额细节）。',
    },
  },
  {
    id: 'pc-003',
    code: 'LNGD-25-091',
    supplierName: '现代汽车氢燃料电池系统（广州）有限公司',
    vehicleModel: '4.5吨燃料电池冷藏车',
    quantity: 136,
    signDate: '2025-05-12',
    clauses: {
      payment:
        '第1期定金68万；第2期交车收票后4080万（增资到位为前提）；第3/4期按交车满1年/2年支付；总价9588万。',
      penalty: '质量不符可拒收并要求重新交付；逾期付款按日计息。',
      general: '交付前提：甲方按增资协议向丙方足额增资后，在广州市辖区指定地点交付并签发送签收单。',
    },
  },
];

/** 关联业务工单样例（多来源 · 含可绑车辆） */
export const MOCK_RELATED_BIZ_DOCS: RelatedBizDoc[] = [
  {
    id: 'pc-001',
    type: 'purchase_contract',
    code: 'HT-CG-2026-0088',
    title: '东风商用车采购',
    vehicleIds: ['v1', 'v2', 'v3'],
  },
  {
    id: 'pc-002',
    type: 'purchase_contract',
    code: 'HT-CG-2026-0102',
    title: '福田智蓝采购',
    vehicleIds: ['v4', 'v5'],
  },
  {
    id: 'lc-001',
    type: 'lease_contract',
    code: 'HT-ZL-2026-0312',
    title: '浙A10001 租赁合同',
    vehicleIds: ['v1'],
  },
  {
    id: 'lb-001',
    type: 'lease_bill',
    code: 'ZD-2026-07-088',
    title: '7 月租赁账单',
    vehicleIds: ['v1', 'v2'],
  },
  {
    id: 'rs-001',
    type: 'vehicle_return_settlement',
    code: 'HC-JS-2026-015',
    title: '还车应结款单',
    vehicleIds: ['v1'],
  },
];

export const MOCK_VEHICLES: BoundVehicle[] = [
  { id: 'v1', plateNo: '浙A10001', brand: '东风', model: '苏龙18T氢能重卡', vin: 'LFV2BJCH8K3123456', mileage: 4680, mileageSource: '车机', contractId: 'pc-001' },
  { id: 'v2', plateNo: '浙A10002', brand: '东风', model: '苏龙18T氢能重卡', vin: 'LFV2BJCH8K3123457', mileage: 5210, mileageSource: '车机', contractId: 'pc-001' },
  { id: 'v3', plateNo: '浙A10003', brand: '东风', model: '苏龙18T氢能重卡', vin: 'LFV2BJCH8K3123458', mileage: 3890, mileageSource: 'GPS', contractId: 'pc-001' },
  { id: 'v4', plateNo: '沪B20001', brand: '福田', model: '智蓝氢能轻卡', vin: 'LZYTBACR2M1234567', mileage: 124000, mileageSource: '车机', contractId: 'pc-002' },
  { id: 'v5', plateNo: '沪B20002', brand: '福田', model: '智蓝氢能轻卡', vin: 'LZYTBACR2M1234568', mileage: 118500, mileageSource: '车机', contractId: 'pc-002' },
];

/** 按关联业务工单带出可绑定车辆 */
export function vehiclesOfRelatedBizDoc(
  relatedBizId?: string,
  docs = MOCK_RELATED_BIZ_DOCS,
  vehicles = MOCK_VEHICLES
): BoundVehicle[] {
  if (!relatedBizId) return [];
  const doc = docs.find((d) => d.id === relatedBizId);
  if (!doc?.vehicleIds?.length) return [];
  return vehicles.filter((v) => doc.vehicleIds!.includes(v.id));
}

/** 按采购合同带出全部落库车辆（里程履约） */
export function vehiclesOfPurchaseContract(
  contractId?: string,
  vehicles = MOCK_VEHICLES
): BoundVehicle[] {
  if (!contractId) return [];
  return vehicles.filter((v) => v.contractId === contractId);
}

export const MOCK_OWNERS: OwnerUser[] = [
  { id: 'u_wang', name: '王业管', dept: '业务管理部' },
  { id: 'u_dept_lead', name: '周主管', dept: '业务管理部' },
  { id: 'u_chen', name: '陈高伟', dept: '运维主管' },
  /** 执行人样例（台账 / 新建 / 筛选共用） */
  { id: 'u_tong', name: '童军林', dept: '运维一部' },
  { id: 'u_yao', name: '姚守涛', dept: '运维一部' },
  { id: 'u_wei', name: '魏山', dept: '运维二部' },
  { id: 'u_wangmian', name: '王冕', dept: '业务数据组' },
  { id: 'u_shi', name: '时生亮', dept: '运维二部' },
  { id: 'u_he', name: '何斐', dept: '客户服务部' },
  { id: 'u_wangyh', name: '王雨昊', dept: '客户服务部' },
  { id: 'u_leader_ro', name: '领导视角', dept: '管理层（只读演示）' },
];

/** 业务数据调整类 · 数智中心处理人（原型锁定王冕） */
export const DATA_ADJUST_EXECUTOR_ID = 'u_wangmian';

/** 新建履约类默认执行人 */
export const DEFAULT_EXECUTOR_ID = 'u_tong';

/** 各部门默认主管（按部门名） */
export const DEPT_SUPERVISOR_ID: Record<string, string> = {
  业务管理部: 'u_dept_lead',
  运维一部: 'u_chen',
  运维二部: 'u_chen',
  客户服务部: 'u_dept_lead',
  业务数据组: 'u_dept_lead',
  运维主管: 'u_chen',
};

export function getDeptSupervisorId(userId: string, owners = MOCK_OWNERS): string {
  const user = owners.find((o) => o.id === userId);
  if (!user) return 'u_dept_lead';
  return DEPT_SUPERVISOR_ID[user.dept] || 'u_dept_lead';
}

function daysBetween(start: string, end: string, today = '2026-07-29'): number {
  const e = new Date(end).getTime();
  const t = new Date(today).getTime();
  return Math.max(0, Math.ceil((e - t) / 86400000));
}

/** 今天晚于周期结束日 → 超时天数；否则 null（样例「今天」与原型演示日对齐） */
export function periodOverdueDays(
  periodEnd?: string,
  today = '2026-07-29',
  periodUnlimited?: boolean
): number | null {
  if (periodUnlimited || periodEnd === 'UNLIMITED') return null;
  if (!periodEnd) return null;
  const endMs = new Date(`${periodEnd}T00:00:00`).getTime();
  const todayMs = new Date(`${today}T00:00:00`).getTime();
  if (Number.isNaN(endMs) || Number.isNaN(todayMs)) return null;
  const days = Math.floor((todayMs - endMs) / 86400000);
  return days > 0 ? days : null;
}

export function computeMileageProgress(task: TaskWorkOrder, vehicles = MOCK_VEHICLES): MileageProgressInfo | null {
  if (task.taskType !== 'mileage' || !task.mileageTarget) return null;
  const ids = task.vehicleIds || [];
  const bound = vehicles.filter((v) => ids.includes(v.id));
  if (!bound.length) {
    return { percent: 0, current: 0, target: task.mileageTarget, label: '未绑车' };
  }

  if (task.mileageMode === 'cumulative') {
    const current = bound.reduce((s, v) => s + (v.mileage || 0), 0);
    const target = task.mileageTarget * bound.length;
    const percent = Math.min(100, Math.round((current / target) * 100));
    return {
      percent,
      current,
      target,
      label: `累计 ${current.toLocaleString()} / ${target.toLocaleString()} km`,
      vehicles: bound,
    };
  }

  const avg = bound.reduce((s, v) => s + (v.mileage || 0), 0) / bound.length;
  const percent = Math.min(100, Math.round((avg / task.mileageTarget) * 100));
  return {
    percent,
    current: Math.round(avg),
    target: task.mileageTarget,
    label: `周期内均值 ${Math.round(avg).toLocaleString()} / ${task.mileageTarget.toLocaleString()} km`,
    vehicles: bound,
    remainDays: task.periodEnd ? daysBetween(task.periodStart || '', task.periodEnd) : null,
  };
}

function withPurchaseRelated(
  partial: TaskWorkOrder,
  contractId: string,
  contractCode: string
): TaskWorkOrder {
  return {
    ...partial,
    contractId,
    contractCode,
    relatedBizType: 'purchase_contract',
    relatedBizId: contractId,
    relatedBizCode: contractCode,
  };
}

export function buildInitialTasks(): TaskWorkOrder[] {
  return [
    withPurchaseRelated(
      {
        id: 'wo-001',
        code: 'WO-2026-0001',
        taskType: 'mileage',
        title: '月里程≥6000km 履约跟踪',
        requirement: '本周期内单车月度行驶里程不低于 6,000 km；未达标需记录原因并上传说明。',
        source: 'contract',
        vehicleIds: ['v1', 'v2', 'v3'],
        periodStart: '2026-07-01',
        periodEnd: '2026-07-31',
        mileageTarget: 6000,
        mileageMode: 'period_avg',
        initiatorId: 'u_wang',
        accountableOwnerId: 'u_tong',
        currentOwnerId: 'u_tong',
        status: 'in_progress',
        createdAt: '2026-07-01 09:00',
        feedbacks: [
          {
            at: '2026-07-08 14:20',
            by: '童军林',
            note: '浙A10003 雨天停运 3 天',
            attachments: ['停运说明.pdf', '现场照片.jpg', '停运台账.xlsx'],
          },
          {
            at: '2026-07-12 09:45',
            by: '童军林',
            note: '浙A10003 已恢复运营，今日起按计划执行',
            attachments: ['复运确认.png'],
          },
        ],
        timeline: [
          { at: '2026-07-01 09:00', action: '发布任务', operator: '王业管', remark: '自采购合同 HT-CG-2026-0088 发起' },
          { at: '2026-07-02 10:15', action: '指派执行', operator: '王业管', remark: '执行人 / 归口：童军林' },
          { at: '2026-07-08 14:20', action: '提交反馈', operator: '童军林', remark: '浙A10003 雨天停运 3 天' },
        ],
        syncWorkbench: true,
      },
      'pc-001',
      'HT-CG-2026-0088'
    ),
    withPurchaseRelated(
      {
        id: 'wo-002',
        code: 'WO-2026-0002',
        taskType: 'maintenance',
        title: '首保 2万km/24月 到期提醒',
        requirement: '按采购合同维保条款，在 2 万 km 或 24 个月内完成首保；上传保养单与里程截图。',
        source: 'contract',
        vehicleIds: ['v1'],
        periodStart: '2026-03-15',
        periodEnd: '2028-03-14',
        initiatorId: 'u_wang',
        accountableOwnerId: 'u_chen',
        currentOwnerId: 'u_yao',
        status: 'pending',
        createdAt: '2026-07-05 11:30',
        feedbacks: [],
        timeline: [{ at: '2026-07-05 11:30', action: '发布任务', operator: '王业管' }],
        syncWorkbench: true,
      },
      'pc-001',
      'HT-CG-2026-0088'
    ),
    withPurchaseRelated(
      {
        id: 'wo-003',
        code: 'WO-2026-0003',
        taskType: 'mileage',
        title: '36个月累计15万km 长期跟踪',
        requirement: '交付后 36 个月内单车累计里程不低于 150,000 km；每季度汇总进度。',
        source: 'contract',
        vehicleIds: ['v4', 'v5'],
        periodStart: '2026-04-01',
        periodEnd: '2029-03-31',
        mileageTarget: 150000,
        mileageMode: 'cumulative',
        initiatorId: 'u_wang',
        accountableOwnerId: 'u_chen',
        currentOwnerId: 'u_wei',
        status: 'in_progress',
        createdAt: '2026-04-05 08:00',
        feedbacks: [],
        timeline: [{ at: '2026-04-05 08:00', action: '发布任务', operator: '王业管' }],
        syncWorkbench: true,
      },
      'pc-002',
      'HT-CG-2026-0102'
    ),
    {
      id: 'wo-004',
      code: 'WO-2026-0004',
      taskType: 'general',
      title: '跨部门协调：加氢证持续跟进',
      requirement: '协调加氢站完成新车加氢证办理；长期跟进直至办齐，无固定截止日期。',
      source: 'standalone',
      relatedBizType: 'lease_contract' as RelatedBizType,
      relatedBizId: 'lc-001',
      relatedBizCode: 'HT-ZL-2026-0312',
      vehicleIds: ['v2', 'v3'],
      periodStart: '2026-07-10',
      periodEnd: 'UNLIMITED',
      periodUnlimited: true,
      initiatorId: 'u_wang',
      accountableOwnerId: 'u_wang',
      currentOwnerId: 'u_shi',
      status: 'in_progress',
      createdAt: '2026-07-10 08:30',
      feedbacks: [],
      timeline: [
        { at: '2026-07-10 08:30', action: '独立新增', operator: '王业管', remark: '关联租赁合同 HT-ZL-2026-0312' },
      ],
      syncWorkbench: true,
    },
    {
      id: 'wo-005',
      code: 'WO-2026-0005',
      taskType: 'policy',
      title: '帕力安18T里程政策兑现核对',
      requirement: '核对本月达标车辆清单，提交享免政策兑现说明（执行人不可见合同金额）。',
      source: 'standalone',
      relatedBizType: 'lease_bill',
      relatedBizId: 'lb-001',
      relatedBizCode: 'ZD-2026-07-088',
      vehicleIds: [],
      periodStart: '2026-07-01',
      periodEnd: '2026-07-20',
      initiatorId: 'u_wang',
      accountableOwnerId: 'u_chen',
      currentOwnerId: 'u_he',
      status: 'overdue',
      createdAt: '2026-07-01 09:30',
      feedbacks: [],
      timeline: [
        { at: '2026-07-01 09:30', action: '发布任务', operator: '王业管', remark: '关联租赁账单 ZD-2026-07-088' },
        { at: '2026-07-09 16:00', action: '催办', operator: '王业管', remark: '请尽快提交核对结果' },
      ],
      syncWorkbench: true,
    },
    {
      id: 'wo-006',
      code: 'WO-2026-0006',
      taskType: 'payment',
      title: '还车应结款核对与回款跟进',
      requirement: '核对还车应结款明细并跟进客户确认，本周内反馈结果（执行人不可见合同金额）。',
      source: 'standalone',
      relatedBizType: 'vehicle_return_settlement',
      relatedBizId: 'rs-001',
      relatedBizCode: 'HC-JS-2026-015',
      vehicleIds: ['v1'],
      periodStart: '2026-07-20',
      periodEnd: '2026-07-28',
      initiatorId: 'u_wang',
      accountableOwnerId: 'u_chen',
      currentOwnerId: 'u_wangyh',
      status: 'pending',
      createdAt: '2026-07-20 10:00',
      feedbacks: [],
      timeline: [
        {
          at: '2026-07-20 10:00',
          action: '独立新增',
          operator: '王业管',
          remark: '关联还车应结款 HC-JS-2026-015',
        },
      ],
      syncWorkbench: true,
    },
    {
      id: 'wo-007',
      code: 'WO-2026-0007',
      taskType: 'data_adjustment',
      title: '租赁合同起租日人工纠偏',
      requirement:
        '【起租日】因特殊操作导致起租日与系统不一致，更正为 2026-06-05；【账单天数】同步重算 6 月账单起算日与天数。',
      source: 'standalone',
      relatedBizType: 'lease_contract',
      relatedBizId: 'lc-001',
      relatedBizCode: 'HT-ZL-2026-0312',
      dataAdjustItems: [
        {
          id: 'dai-1',
          fieldName: '起租日',
          reason: '特殊操作导致与纸质协议不一致，更正为 2026-06-05',
        },
        {
          id: 'dai-2',
          fieldName: '账单起算日 / 天数',
          reason: '随起租日纠偏同步重算 6 月账单',
        },
      ],
      vehicleIds: [],
      initiatorId: 'u_wang',
      accountableOwnerId: 'u_dept_lead',
      currentOwnerId: 'u_wangmian',
      status: 'pending',
      createdAt: '2026-07-22 11:00',
      feedbacks: [],
      timeline: [
        {
          at: '2026-07-22 11:00',
          action: '新增发布',
          operator: '王业管',
          remark: '业务数据调整 · 2 条明细 · HT-ZL-2026-0312',
        },
        {
          at: '2026-07-22 11:00',
          action: '系统指定归口',
          operator: '系统',
          remark: '已指定部门主管周主管',
        },
        {
          at: '2026-07-22 11:01',
          action: '交办数智中心',
          operator: '系统',
          remark: '待主管审批通过后由数智部处理（原型演示）',
        },
      ],
      syncWorkbench: true,
    },
  ];
}

export function ownerName(id?: string, owners = MOCK_OWNERS): string {
  if (!id) return '—';
  return owners.find((o) => o.id === id)?.name || '—';
}

/** 1 台：车牌；多台：首牌 · 共N台；无车：— */
export function vehicleSummary(ids?: string[], vehicles = MOCK_VEHICLES): string {
  if (!ids || !ids.length) return '—';
  const list = vehicles.filter((v) => ids.includes(v.id));
  if (!list.length) return '—';
  if (list.length === 1) return list[0].plateNo;
  return `${list[0].plateNo} · 共${list.length}台`;
}

export function vehiclesOf(ids?: string[], vehicles = MOCK_VEHICLES): BoundVehicle[] {
  if (!ids?.length) return [];
  return vehicles.filter((v) => ids.includes(v.id));
}
