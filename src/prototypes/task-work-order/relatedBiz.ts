import {
  BoundVehicle,
  RelatedBizType,
  TaskStatus,
  TaskWorkOrder,
} from './types';

/** 关联业务元数据：对照 nav-menu、知识库 modules、桌面 web端 功能页 */
export const RELATED_BIZ_TYPE_META: Record<
  string,
  { label: string; group: string }
> = {
  // —— 平台 ——
  workbench: { label: '工作台', group: '平台' },
  message_center: { label: '消息中心', group: '平台' },
  approval_center: { label: '审批中心', group: '平台' },

  // —— 车辆资产 / 采购 ——
  vehicle_assets: { label: '车辆资产', group: '车辆资产' },
  vehicle_inspection: { label: '验车入库', group: '车辆资产' },
  purchase_contract: { label: '采购合同', group: '车辆资产' },

  // —— 车辆运维（V2 + 桌面运维管理） ——
  vehicle_fault: { label: '故障处置', group: '车辆运维' },
  ops_prepare: { label: '备车管理', group: '车辆运维' },
  ops_delivery: { label: '交车管理', group: '车辆运维' },
  ops_return: { label: '还车管理', group: '车辆运维' },
  ops_replace: { label: '替换车管理', group: '车辆运维' },
  ops_transfer: { label: '调拨管理', group: '车辆运维' },
  ops_annual_review: { label: '年审管理', group: '车辆运维' },
  ops_relocation: { label: '异动管理', group: '车辆运维' },
  ops_license_plate: { label: '上牌管理', group: '车辆运维' },
  ops_certificates: { label: '证照管理', group: '车辆运维' },
  ops_aftermarket: { label: '后装设备', group: '车辆运维' },
  ops_parts: { label: '备件库存', group: '车辆运维' },
  ops_warehouse: { label: '仓库管理', group: '车辆运维' },
  ops_parking: { label: '停车场管理', group: '车辆运维' },
  ops_vehicle_model: { label: '型号参数', group: '车辆运维' },
  safety_management: { label: '安全管理', group: '车辆运维' },
  safety_training_scan: { label: '安全培训扫码', group: '车辆运维' },

  // —— 业务管理 ——
  customer: { label: '客户管理', group: '业务管理' },
  supplier: { label: '供应商管理', group: '业务管理' },
  lease_contract: { label: '租赁合同', group: '业务管理' },
  self_operated_contract: { label: '自营合同', group: '业务管理' },
  insurance_procurement: { label: '保险采购', group: '业务管理' },
  lease_bill: { label: '租赁账单', group: '业务管理' },
  delivery_task: { label: '交车任务', group: '业务管理' },
  etc_management: { label: 'ETC管理', group: '业务管理' },
  vehicle_cost: { label: '车辆成本维护', group: '业务管理' },
  third_party_exit: { label: '三方退租车', group: '业务管理' },
  contract_template: { label: '合同模板管理', group: '业务管理' },

  // —— 加氢站 ——
  h2_station_site: { label: '站点信息', group: '加氢站管理' },
  h2_order: { label: '加氢记录', group: '加氢站管理' },
  h2_weekly: { label: '站点周报统计', group: '加氢站管理' },
  h2_analysis: { label: '加氢站分析', group: '加氢站管理' },
  h2_dashboard: { label: '加氢站大屏', group: '加氢站管理' },

  // —— 数据分析 ——
  project_pnl: { label: '项目盈亏情况', group: '数据分析' },
  h2_station_stats: { label: '加氢站数量统计', group: '数据分析' },
  customer_payment: { label: '客户回款情况', group: '数据分析' },
  analytics_ledgers: { label: '物流业务台账（报表）', group: '数据分析' },

  // —— 台账 ——
  lease_ledger: { label: '租赁业务台账', group: '台账管理' },
  lease_detail: { label: '租赁业务明细', group: '台账管理' },
  logistics_detail: { label: '物流业务明细', group: '台账管理' },
  vehicle_h2_fee: { label: '车辆氢费明细', group: '台账管理' },
  maintenance_ledger: { label: '维修保养台账', group: '台账管理' },
  h2_procurement_summary: { label: '氢费采购端汇总', group: '台账管理' },
  insurance_allocation: { label: '保险分摊明细', group: '台账管理' },

  // —— 财务 ——
  pickup_receivable: { label: '提车应收款', group: '财务管理' },
  payment_records: { label: '收款记录', group: '财务管理' },
  vehicle_return_settlement: { label: '还车应结款', group: '财务管理' },
  receivable_dunning: { label: '应收催款', group: '财务管理' },

  // —— 任务协同 ——
  dispatch_task: { label: '调度任务', group: '任务协同' },
};

export function relatedBizTypeLabel(type?: RelatedBizType | null): string {
  if (!type) return '—';
  return RELATED_BIZ_TYPE_META[type]?.label || type;
}

/** 下拉选项（带分组，可搜索） */
export function getRelatedBizSelectOptions(includeEmpty = true) {
  const entries = Object.entries(RELATED_BIZ_TYPE_META)
    .map(([value, meta]) => ({
      value,
      label: meta.label,
      group: meta.group,
    }))
    .sort((a, b) => {
      const g = a.group.localeCompare(b.group, 'zh-CN');
      if (g !== 0) return g;
      return a.label.localeCompare(b.label, 'zh-CN');
    });

  if (!includeEmpty) return entries;
  return [{ value: '', label: '请选择关联业务' }, ...entries];
}

/** 统一解析关联业务展示（兼容旧 contractCode） */
export function resolveRelatedBiz(task: TaskWorkOrder): {
  type?: RelatedBizType;
  code?: string;
  typeLabel: string;
} {
  const type = task.relatedBizType || (task.contractCode ? 'purchase_contract' : undefined);
  const code = task.relatedBizCode || task.contractCode;
  return {
    type,
    code,
    typeLabel: type ? relatedBizTypeLabel(type) : '—',
  };
}

const ACTIVE_MILEAGE_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'overdue'];

/** 返回冲突车辆 id 列表 */
export function findMileageRuleConflictVehicleIds(
  vehicleIds: string[],
  existingTasks: TaskWorkOrder[],
  options?: { excludeTaskId?: string }
): string[] {
  if (!vehicleIds.length) return [];
  const conflictIds = new Set<string>();

  for (const task of existingTasks) {
    if (options?.excludeTaskId && task.id === options.excludeTaskId) continue;
    if (task.taskType !== 'mileage') continue;
    if (!ACTIVE_MILEAGE_STATUSES.includes(task.status)) continue;
    for (const vid of vehicleIds) {
      if ((task.vehicleIds || []).includes(vid)) conflictIds.add(vid);
    }
  }

  return [...conflictIds];
}

export function platesOfVehicles(
  vehicleIds: string[],
  vehicles: BoundVehicle[]
): string[] {
  return vehicleIds
    .map((id) => vehicles.find((v) => v.id === id)?.plateNo || id)
    .filter(Boolean);
}

export function formatMileageConflictMessage(plates: string[]): string {
  if (!plates.length) return '';
  return `无法发布：${plates.join('、')} 已存在进行中的里程任务规则，同一车辆同时只能有一套规则。`;
}
