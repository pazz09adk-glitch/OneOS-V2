import type { VehicleRecord } from '../types';
import {
  displayText,
  formatMileage,
  isDeliveredToLeaseOrLogisticsProject,
  isEmpty,
  resolveOperateStatus,
} from './vehicle';

/** 生命周期阶段（筛选 Tabs 顺序见 STAGE 展示层） */
export type LifecycleStage =
  | 'inspect'
  | 'inbound'
  | 'delivery'
  | 'return'
  | 'replace'
  | 'movement'
  | 'annual'
  | 'insuranceCompulsory'
  | 'insuranceCommercial'
  | 'transfer'
  | 'fault'
  | 'violation'
  | 'accident'
  | 'repair'
  | 'maintain'
  | 'ownership'
  | 'sale'
  | 'scrap'
  | 'outbound';

export const LIFECYCLE_STAGE_META: Record<
  LifecycleStage,
  { label: string; color: 'violet' | 'success' | 'warning' | 'error' | 'muted' }
> = {
  inspect: { label: '验车', color: 'violet' },
  inbound: { label: '入库', color: 'violet' },
  delivery: { label: '交车', color: 'success' },
  return: { label: '还车', color: 'muted' },
  replace: { label: '替换', color: 'violet' },
  movement: { label: '异动', color: 'violet' },
  annual: { label: '年审', color: 'warning' },
  insuranceCompulsory: { label: '交强险', color: 'warning' },
  insuranceCommercial: { label: '商业险', color: 'warning' },
  transfer: { label: '调拨', color: 'violet' },
  fault: { label: '故障', color: 'warning' },
  violation: { label: '违章', color: 'warning' },
  accident: { label: '事故', color: 'error' },
  repair: { label: '维修', color: 'warning' },
  maintain: { label: '保养', color: 'success' },
  ownership: { label: '过户', color: 'violet' },
  sale: { label: '销售', color: 'muted' },
  scrap: { label: '报废', color: 'muted' },
  outbound: { label: '出库', color: 'muted' },
};

/** 阶段筛选顺序（含「全部」由 UI 前缀） */
export const LIFECYCLE_STAGE_ORDER: LifecycleStage[] = [
  'inspect',
  'inbound',
  'delivery',
  'return',
  'replace',
  'movement',
  'annual',
  'insuranceCompulsory',
  'insuranceCommercial',
  'transfer',
  'fault',
  'violation',
  'accident',
  'repair',
  'maintain',
  'ownership',
  'sale',
  'scrap',
  'outbound',
];

/**
 * 「关键事件总数」指标条仅展示高频操作。
 * 入库 / 过户 / 销售 / 报废 / 出库等低频且互斥终态事件不进指标条，改由时间轴与事件名称筛选查看。
 */
export const LIFECYCLE_HIGH_FREQUENCY_STAGES: LifecycleStage[] = [
  'inspect',
  'delivery',
  'return',
  'replace',
  'movement',
  'annual',
  'insuranceCompulsory',
  'insuranceCommercial',
  'transfer',
  'fault',
  'violation',
  'accident',
  'repair',
  'maintain',
];

/** 低频 / 互斥终态：不进关键事件总数指标条 */
export const LIFECYCLE_LOW_FREQUENCY_STAGES: LifecycleStage[] = [
  'inbound',
  'ownership',
  'sale',
  'scrap',
  'outbound',
];

export interface VehicleLifecycleEvent {
  id: string;
  stage: LifecycleStage;
  title: string;
  /** 可排序时间，尽量 ISO / YYYY-MM-DD HH:mm */
  timestamp: string;
  timeLabel: string;
  operator?: string;
  tag?: string;
  color: 'violet' | 'success' | 'warning' | 'error' | 'muted';
  summary: string;
  details?: Array<{ label: string; value: string }>;
}

function normalizeTime(raw: unknown): string {
  if (isEmpty(raw)) return '';
  const text = String(raw).trim().replace(/\//g, '-');
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${text} 00:00:00`;
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(text)) return `${text}:00`;
  return text;
}

function timeSortKey(raw: string): number {
  const t = Date.parse(raw.replace(/-/g, '/'));
  return Number.isFinite(t) ? t : 0;
}

function formatTimeLabel(raw: string): string {
  if (!raw) return '—';
  return raw.length >= 16 ? raw.slice(0, 16) : raw.slice(0, 10);
}

function pushEvent(
  list: VehicleLifecycleEvent[],
  event: Omit<VehicleLifecycleEvent, 'timeLabel' | 'color'> & {
    color?: VehicleLifecycleEvent['color'];
  },
) {
  const timestamp = normalizeTime(event.timestamp);
  if (!timestamp) return;
  const stageMeta = LIFECYCLE_STAGE_META[event.stage];
  list.push({
    ...event,
    timestamp,
    timeLabel: formatTimeLabel(timestamp),
    color: event.color || stageMeta.color,
    tag: event.tag || stageMeta.label,
  });
}

export interface LifecycleSourceRows {
  lease: Array<Record<string, unknown>>;
  accident: Array<Record<string, unknown>>;
  fault: Array<Record<string, unknown>>;
  violation: Array<Record<string, unknown>>;
  movement: Array<Record<string, unknown>>;
  transfer: Array<Record<string, unknown>>;
  annual: Array<Record<string, unknown>>;
  purchases: Array<Record<string, unknown>>;
}

export interface LifecycleHeroStats {
  leaseDeliveryCount: number;
  logisticsDeliveryCount: number;
  accidentCount: number;
  faultCount: number;
  violationCount: number;
  annualCount: number;
  compulsoryInsuranceCount: number;
  commercialInsuranceCount: number;
}

function isNonEmptyField(value: unknown): boolean {
  return !isEmpty(value) && value !== '-' && value !== '—';
}

function isLeaseBusinessType(row: Record<string, unknown>): boolean {
  const type = String(row.businessType || '').trim();
  return type === '租赁';
}

function isLogisticsBusinessType(row: Record<string, unknown>): boolean {
  return String(row.businessType || '').trim() === '物流';
}

function isClosedAccident(row: Record<string, unknown>): boolean {
  const status = String(row.status || '').trim();
  if (status === '已结案' || status === '已闭环' || status === '已完成') return true;
  return isNonEmptyField(row.closedTime);
}

function isClosedFault(row: Record<string, unknown>): boolean {
  const status = String(row.status || row.faultStatus || '').trim();
  if (!status) return true;
  return ['已闭环', '已完成', '已结案', '已修复', '已关闭'].includes(status);
}

function isClosedViolation(row: Record<string, unknown>): boolean {
  if (row.processed === true || row.processed === 'true' || row.processed === 1) return true;
  const status = String(row.status || row.paymentStatus || '').trim();
  return ['已处理', '已闭环', '已缴费', '已完成', '已结案'].includes(status);
}

function isClosedAnnual(row: Record<string, unknown>): boolean {
  const status = String(row.status || row.result || '').trim();
  if (!status) return isNonEmptyField(row.executeTime || row.reviewDate || row.annualDate || row.createdAt);
  return !['待办理', '进行中', '处理中', '未开始'].includes(status);
}

function isReplaceLeaseRow(row: Record<string, unknown>): boolean {
  const blob = [
    row.businessType,
    row.projectName,
    row.contractNo,
    row.remark,
    row.replaceType,
    row.eventType,
  ].map((v) => String(v || '')).join(' ');
  return /替换/.test(blob);
}

/** 异动类型 → 更细阶段（维修/保养/年审优先，其余归异动） */
function stageFromMovementType(movementType: unknown): LifecycleStage {
  const type = String(movementType || '').trim();
  if (/维修/.test(type)) return 'repair';
  if (/保养|养护/.test(type)) return 'maintain';
  if (/年审/.test(type)) return 'annual';
  return 'movement';
}

/** 生命周期头部次数：交车/事故/故障/违章/年审/保险（按闭环或采购记录计次） */
export function buildLifecycleHeroStats(rows: LifecycleSourceRows): LifecycleHeroStats {
  let leaseDeliveryCount = 0;
  let logisticsDeliveryCount = 0;
  rows.lease.forEach((row) => {
    if (!isNonEmptyField(row.deliveryDate)) return;
    if (isLogisticsBusinessType(row)) {
      logisticsDeliveryCount += 1;
      return;
    }
    if (isLeaseBusinessType(row)) {
      leaseDeliveryCount += 1;
    }
  });

  let compulsoryInsuranceCount = 0;
  let commercialInsuranceCount = 0;
  rows.purchases.forEach((row) => {
    const type = String(row.insuranceType || '').trim();
    if (type === '交强险') compulsoryInsuranceCount += 1;
    else if (type === '商业险') commercialInsuranceCount += 1;
  });

  return {
    leaseDeliveryCount,
    logisticsDeliveryCount,
    accidentCount: rows.accident.filter(isClosedAccident).length,
    faultCount: rows.fault.filter(isClosedFault).length,
    violationCount: rows.violation.filter(isClosedViolation).length,
    annualCount: rows.annual.filter(isClosedAnnual).length,
    compulsoryInsuranceCount,
    commercialInsuranceCount,
  };
}

/** 聚合车辆从入库到出库的事件，默认倒序 */
export function buildVehicleLifecycleEvents(
  record: VehicleRecord,
  rows: LifecycleSourceRows,
): VehicleLifecycleEvent[] {
  const events: VehicleLifecycleEvent[] = [];
  const inboundDate = !isEmpty(record.purchaseDate) && record.purchaseDate !== '-'
    ? record.purchaseDate
    : record.regDate;
  const statusTime = record.gpsTime || inboundDate || record.regDate;

  // 进行中车辆状态 → 对应阶段节点（无独立业务表时的演示落点）
  const statusStageMap: Array<{ status: string; stage: LifecycleStage; title: string }> = [
    { status: '待验车', stage: 'inspect', title: '验车办理中' },
    { status: '替换中', stage: 'replace', title: '车辆替换中' },
    { status: '维修中', stage: 'repair', title: '维修办理中' },
    { status: '过户中', stage: 'ownership', title: '过户办理中' },
    { status: '销售中', stage: 'sale', title: '销售办理中' },
    { status: '报废中', stage: 'scrap', title: '报废办理中' },
  ];
  const statusHit = statusStageMap.find((item) => item.status === record.vehicleStatus);
  if (statusHit) {
    pushEvent(events, {
      id: `status-${record.id}-${statusHit.stage}`,
      stage: statusHit.stage,
      title: statusHit.title,
      timestamp: statusTime,
      summary: `车辆状态 · ${statusHit.status}`,
      details: [
        { label: '车辆状态', value: statusHit.status },
        { label: '运营状态', value: resolveOperateStatus(record) || '未设置' },
      ],
    });
  }

  pushEvent(events, {
    id: `in-${record.id}`,
    stage: 'inbound',
    title: '车辆采购入库',
    timestamp: inboundDate,
    operator: displayText(record.manager, '') || '资产管理员',
    summary: `登记入库 · ${displayText(record.brand)} ${displayText(record.model)} · VIN ${displayText(record.vin)}`,
    details: [
      { label: '登记所有权', value: displayText(record.ownership, '—') },
      { label: '运营公司', value: displayText(record.operateCompany, '—') },
      { label: '车辆来源', value: displayText(record.vehicleSource, '—') },
      { label: '停车场', value: displayText(record.parking, '—') },
    ],
  });

  if (!isEmpty(record.lastDeliveryTime) && record.lastDeliveryTime !== '-') {
    pushEvent(events, {
      id: `delivery-${record.id}`,
      stage: 'delivery',
      title: isDeliveredToLeaseOrLogisticsProject(record) ? '项目交车' : '交车登记',
      timestamp: record.lastDeliveryTime,
      operator: displayText(record.lastDeliveryPerson, '') || undefined,
      summary: [
        displayText(record.projectName, ''),
        displayText(record.customer, ''),
        formatMileage(record.lastDeliveryMile, false, ''),
      ].filter(Boolean).join(' · ') || '完成交车登记',
      details: [
        { label: '项目', value: displayText(record.projectName, '—') },
        { label: '合同', value: displayText(record.contractNo, '—') },
        { label: '客户', value: displayText(record.customer, '—') },
        { label: '交车里程', value: formatMileage(record.lastDeliveryMile) },
      ],
    });
  }

  rows.lease.forEach((row, index) => {
    if (!isEmpty(row.deliveryDate)) {
      const replace = isReplaceLeaseRow(row);
      pushEvent(events, {
        id: `lease-d-${row.id || index}`,
        stage: replace ? 'replace' : 'delivery',
        title: replace
          ? `替换交车 · ${displayText(row.businessType, '租赁')}`
          : `交车 · ${displayText(row.businessType, '租赁')}`,
        timestamp: String(row.deliveryDate),
        operator: displayText(row.deliveryPerson, '') || undefined,
        summary: `${displayText(row.projectName)} · ${displayText(row.customerName)}`,
        details: [
          { label: '合同编号', value: displayText(row.contractNo, '—') },
          { label: '项目', value: displayText(row.projectName, '—') },
          { label: '客户', value: displayText(row.customerName, '—') },
        ],
      });
    }
    if (!isEmpty(row.returnDate)) {
      pushEvent(events, {
        id: `lease-r-${row.id || index}`,
        stage: 'return',
        title: '还车登记',
        timestamp: String(row.returnDate),
        operator: displayText(row.returnPerson, '') || undefined,
        summary: `${displayText(row.projectName)} · 合同 ${displayText(row.contractNo)}`,
        details: [
          { label: '合同编号', value: displayText(row.contractNo, '—') },
          { label: '项目', value: displayText(row.projectName, '—') },
        ],
      });
    }
  });

  if (!isEmpty(record.lastReturnTime) && record.lastReturnTime !== '-') {
    pushEvent(events, {
      id: `return-${record.id}`,
      stage: 'return',
      title: '还车入库',
      timestamp: record.lastReturnTime,
      operator: displayText(record.lastReturnPerson, '') || undefined,
      summary: `还车里程 ${formatMileage(record.lastReturnMile)}`,
      details: [
        { label: '还车里程', value: formatMileage(record.lastReturnMile) },
        { label: '运营状态', value: resolveOperateStatus(record) || '未设置' },
      ],
    });
  }

  rows.accident.forEach((row, index) => {
    pushEvent(events, {
      id: `acc-${row.id || index}`,
      stage: 'accident',
      title: `事故 · ${displayText(row.accidentType, '记录')}`,
      timestamp: String(row.accidentTime || ''),
      operator: displayText(row.customerName, '') || undefined,
      color: 'error',
      summary: `${displayText(row.accidentLocation)} · ${displayText(row.status)}`,
      details: [
        { label: '事故编号', value: displayText(row.accidentCode, '—') },
        { label: '责任', value: displayText(row.responsibility, '—') },
        { label: '等级', value: displayText(row.accidentLevel, '—') },
        { label: '状态', value: displayText(row.status, '—') },
      ],
    });
  });

  rows.fault.forEach((row, index) => {
    pushEvent(events, {
      id: `fault-${row.id || index}`,
      stage: 'fault',
      title: `故障 · ${displayText(row.faultType || row.title, '报修')}`,
      timestamp: String(row.faultTime || row.reportTime || row.createdAt || ''),
      operator: displayText(row.reporter || row.createdBy, '') || undefined,
      color: 'warning',
      summary: displayText(row.description || row.status || row.faultDesc, '故障处置记录'),
      details: [
        { label: '状态', value: displayText(row.status, '—') },
        { label: '备注', value: displayText(row.description || row.faultDesc, '—') },
      ],
    });
  });

  rows.violation.forEach((row, index) => {
    pushEvent(events, {
      id: `vio-${row.id || index}`,
      stage: 'violation',
      title: `违章 · ${displayText(row.violationType || row.act, '记录')}`,
      timestamp: String(row.violationTime || row.happenTime || ''),
      color: 'warning',
      summary: `${displayText(row.violationLocation || row.location)} · ${displayText(row.status)}`,
      details: [
        { label: '地点', value: displayText(row.violationLocation || row.location, '—') },
        { label: '状态', value: displayText(row.status, '—') },
      ],
    });
  });

  rows.movement.forEach((row, index) => {
    const stage = stageFromMovementType(row.movementType);
    const typeLabel = displayText(row.movementType, '调度');
    pushEvent(events, {
      id: `move-${row.id || index}`,
      stage,
      title: stage === 'movement' ? `异动 · ${typeLabel}` : `${LIFECYCLE_STAGE_META[stage].label} · ${typeLabel}`,
      timestamp: String(row.createdAt || row.startDate || ''),
      operator: displayText(row.createdBy, '') || undefined,
      summary: `${displayText(row.destinationType)} → ${displayText(row.destinationName)} · ${displayText(row.status)}`,
      details: [
        { label: '目的地', value: displayText(row.destinationName, '—') },
        { label: '状态', value: displayText(row.status, '—') },
        { label: '预计结束', value: displayText(row.estimatedEndDate, '—') },
      ],
    });
  });

  rows.transfer.forEach((row, index) => {
    pushEvent(events, {
      id: `tf-${row.id || index}`,
      stage: 'transfer',
      title: `调拨 · ${displayText(row.transferType || row.status, '跨区调拨')}`,
      timestamp: String(row.transferTime || row.createdAt || row.startDate || ''),
      operator: displayText(row.operator || row.createdBy, '') || undefined,
      summary: `${displayText(row.fromRegion || row.fromParking)} → ${displayText(row.toRegion || row.toParking)}`,
      details: [
        { label: '调出', value: displayText(row.fromRegion || row.fromParking, '—') },
        { label: '调入', value: displayText(row.toRegion || row.toParking, '—') },
        { label: '状态', value: displayText(row.status, '—') },
      ],
    });
  });

  rows.annual.forEach((row, index) => {
    pushEvent(events, {
      id: `ar-${row.id || index}`,
      stage: 'annual',
      title: '年审办理',
      timestamp: String(row.reviewDate || row.annualDate || row.createdAt || ''),
      operator: displayText(row.operator || row.createdBy, '') || undefined,
      color: 'warning',
      summary: `${displayText(row.result || row.status, '年审记录')} · 下次 ${displayText(row.nextReviewDate, '—')}`,
      details: [
        { label: '结果', value: displayText(row.result || row.status, '—') },
        { label: '下次年审', value: displayText(row.nextReviewDate, '—') },
      ],
    });
  });

  rows.purchases.forEach((row, index) => {
    const type = String(row.insuranceType || '').trim();
    const isCompulsory = type === '交强险';
    const isCommercial = type === '商业险';
    if (!isCompulsory && !isCommercial) return;
    pushEvent(events, {
      id: `ins-${row.id || index}`,
      stage: isCompulsory ? 'insuranceCompulsory' : 'insuranceCommercial',
      title: `${type}采购`,
      timestamp: String(row.purchasedAt || row.effectiveDate || row.paymentDate || ''),
      operator: displayText(row.operator, '') || undefined,
      color: 'warning',
      summary: [
        displayText(row.company, ''),
        displayText(row.policyNo, ''),
        displayText(row.status, ''),
      ].filter(Boolean).join(' · ') || `${type}采购记录`,
      details: [
        { label: '险种', value: type || '—' },
        { label: '保单号', value: displayText(row.policyNo, '—') },
        { label: '保险公司', value: displayText(row.company, '—') },
        { label: '到期日', value: displayText(row.expireDate, '—') },
        { label: '状态', value: displayText(row.status, '—') },
      ],
    });
  });

  // 报废 / 销售出库 / 退出出库
  const outStatus = displayText(record.outStatus, '');  if (!isEmpty(record.scrapDate) && record.scrapDate !== '-') {
    pushEvent(events, {
      id: `scrap-${record.id}`,
      stage: 'scrap',
      title: '车辆报废',
      timestamp: record.scrapDate,
      color: 'muted',
      summary: `报废日期 ${String(record.scrapDate).slice(0, 10)}`,
      details: [
        { label: '报废日期', value: displayText(record.scrapDate, '—') },
        { label: '出库状态', value: displayText(record.outStatus, '—') },
      ],
    });
  } else if (/销售/.test(outStatus)) {
    pushEvent(events, {
      id: `sale-${record.id}`,
      stage: 'sale',
      title: '销售出库',
      timestamp: record.gpsTime || record.regDate,
      color: 'muted',
      summary: `出库状态 · ${outStatus}`,
      details: [{ label: '出库状态', value: outStatus || '—' }],
    });
  } else if (
    record.operateStatus === '退出运营'
    || outStatus === '已出库'
    || outStatus === '退出'
  ) {
    pushEvent(events, {
      id: `out-${record.id}`,
      stage: 'outbound',
      title: '车辆出库',
      timestamp: record.gpsTime || record.regDate,
      color: 'muted',
      summary: `运营状态 ${resolveOperateStatus(record) || '未设置'} · 出库 ${displayText(record.outStatus, '—')}`,
      details: [
        { label: '出库状态', value: displayText(record.outStatus, '—') },
        { label: '运营状态', value: resolveOperateStatus(record) || '未设置' },
      ],
    });
  }

  const deduped = new Map<string, VehicleLifecycleEvent>();
  events.forEach((event) => {
    const prev = deduped.get(event.id);
    if (!prev || timeSortKey(event.timestamp) >= timeSortKey(prev.timestamp)) {
      deduped.set(event.id, event);
    }
  });

  return Array.from(deduped.values()).sort((a, b) => timeSortKey(b.timestamp) - timeSortKey(a.timestamp));
}
