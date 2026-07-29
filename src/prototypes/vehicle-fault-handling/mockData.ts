/**
 * 故障处置用例数据：车辆主数据与车辆资产同源（vehicles.json），
 * 故障明细复用/扩展自 vehicle-management/data/fault-records.json，
 * 以保证车牌、品牌、型号、VIN、运营城市与运维负责人与线上一致。
 */
import vehiclesSeed from '../vehicle-management/data/vehicles.json';
import faultSeed from '../vehicle-management/data/fault-records.json';
import type {
  FaultAttachment,
  FaultCategory,
  FaultLevel,
  FaultRecord,
  FaultResolveStatus,
  FaultSource,
  FaultTaskStatus,
} from './types';
import { generateFaultCode, parseReportTime } from './utils';

interface VehicleSeed {
  id: string;
  plateNo: string;
  vin: string;
  brand?: string;
  model?: string;
  operateCompany?: string;
  customer?: string;
  location?: string;
  locationAddress?: string;
  opsManagers?: string[];
  manager?: string;
}

interface FaultSeedRow {
  id: string;
  plateNo: string;
  faultNo: string;
  resolutionStatus?: string;
  brand?: string;
  model?: string;
  operateCompany?: string;
  faultLevel?: string;
  faultType?: string;
  faultDescription?: string;
  reportedAt?: string;
  resolvedAt?: string;
  aiMatched?: boolean;
  lastOperator?: string;
}

const VEHICLES = vehiclesSeed as VehicleSeed[];
const FAULT_SEED = faultSeed as FaultSeedRow[];

const vehicleByPlate = new Map(
  VEHICLES.map((v) => [cleanPlate(v.plateNo), v] as const)
);

function cleanPlate(plate: string): string {
  return (plate || '').replace(/·/g, '').trim();
}

function addDays(isoDateTime: string, days: number): string {
  const d = new Date(isoDateTime.replace(/-/g, '/'));
  if (Number.isNaN(d.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + days);
    return `${fallback.toISOString().slice(0, 10)} 23:59`;
  }
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day} 23:59`;
}

function mapCategories(faultType?: string): FaultCategory[] {
  const t = faultType || '';
  const found: FaultCategory[] = [];
  if (t.includes('冷机')) found.push('冷机系统');
  if (t.includes('供氢') || t.includes('加氢')) found.push('供氢系统');
  if (t.includes('三电') || t.includes('电机')) found.push('三电系统');
  if (t.includes('底盘') || t.includes('制动')) found.push('底盘系统');
  if (t.includes('燃料') || t.includes('电堆')) found.push('燃料电池系统');
  if (t.includes('空调')) found.push('空调系统');
  if (t.includes('控制')) found.push('整车控制');
  // 组合故障文案常见「且/及/、」时再补一项关联部位
  if (found.length === 0) found.push('其他');
  return Array.from(new Set(found));
}

function mapLevel(level?: string): FaultLevel {
  if (level === 'L1-特急' || level === 'L2-紧急' || level === 'L3-一般' || level === 'L4-提示') {
    return level;
  }
  return 'L3-一般';
}

function mapResolve(status?: string, resolvedAt?: string): FaultResolveStatus {
  if (status === '已解决' || resolvedAt) return '已解决';
  if (status === '临时排故') return '临时排故';
  return '未解决';
}

function mapSource(aiMatched?: boolean, index = 0): FaultSource {
  if (aiMatched) return 'AI机器人上报';
  const pool: FaultSource[] = ['司机报修', '车机遥测', '定期巡检', '客户报告'];
  return pool[index % pool.length];
}

function deriveTaskStatus(
  resolve: FaultResolveStatus,
  reportTime: string,
  index: number
): FaultTaskStatus {
  if (resolve === '已解决') return 'archived';
  const report = new Date(reportTime.replace(/-/g, '/')).getTime();
  const ageDays = Number.isNaN(report)
    ? 0
    : Math.floor((Date.now() - report) / (1000 * 3600 * 24));
  if (ageDays > 25) return 'suspended';
  if (resolve === '临时排故') return 'processing';
  const cycle: FaultTaskStatus[] = ['pending', 'processing', 'processing', 'suspended'];
  return cycle[index % cycle.length];
}

function pickOpsManager(v?: VehicleSeed, fallback = '运维值班'): string {
  if (v?.opsManagers?.length) return v.opsManagers[0];
  if (v?.manager && v.manager !== '-') return v.manager;
  return fallback;
}

function formatCity(location?: string): string {
  if (!location || location === '-') return '待完善运营城市';
  return location.replace(/-/g, '');
}

function buildAttachments(
  id: string,
  reportTime: string,
  resolved: boolean
): FaultAttachment[] {
  const base: FaultAttachment[] = [
    {
      id: `${id}-att-1`,
      name: `现场排查照片_${cleanPlate(id).slice(-4)}.jpg`,
      size: '2.1 MB',
      type: 'image',
      uploadTime: reportTime,
    },
  ];
  if (resolved) {
    base.push({
      id: `${id}-att-2`,
      name: '维修完工与证据链归档.pdf',
      size: '1.4 MB',
      type: 'pdf',
      uploadTime: reportTime,
    });
  }
  return base;
}

function fromSeedRow(row: FaultSeedRow, index: number): FaultRecord {
  const plate = cleanPlate(row.plateNo);
  const vehicle = vehicleByPlate.get(plate);
  const reportTime = row.reportedAt || '2026-06-20 10:00:00';
  const resolveStatus = mapResolve(row.resolutionStatus, row.resolvedAt);
  const taskStatus = deriveTaskStatus(resolveStatus, reportTime, index);
  const opsManager = pickOpsManager(vehicle, row.lastOperator || '运维值班');
  const level = mapLevel(row.faultLevel);
  const categories = mapCategories(row.faultType);

  return {
    id: row.faultNo || `F-${row.id}`,
    plate,
    brand: vehicle?.brand || row.brand || '未知品牌',
    model: vehicle?.model || row.model || '未知型号',
    vin: vehicle?.vin || 'VIN未录入',
    operateCity: formatCity(vehicle?.location),
    operateCompany:
      vehicle?.customer && vehicle.customer !== '-'
        ? vehicle.customer
        : vehicle?.operateCompany || row.operateCompany || '未知运营主体',
    opsManager,
    taskStatus,
    resolveStatus,
    level,
    categories,
    source: mapSource(row.aiMatched, index),
    reportTime,
    deadlineTime: addDays(reportTime, 30),
    archivedTime: row.resolvedAt || undefined,
    lastOperationTime: row.resolvedAt || reportTime,
    lastOperator: row.lastOperator || opsManager,
    description: row.faultDescription || '故障现象待补充',
    aiChatSummary: row.aiMatched
      ? `【AI 机器人排查】已关联车牌 ${plate}，对照车机遥测与历史故障库完成初判：${row.faultDescription || '待确认'}。`
      : undefined,
    repairFactory: vehicle?.operateCompany?.includes('羚牛')
      ? '羚牛氢能特约服务站'
      : '区域合作服务站',
    repairResult:
      resolveStatus === '已解决'
        ? '已完成排故并归档证据链。'
        : taskStatus === 'suspended'
          ? '等待零部件到货或厂方索赔审核中。'
          : '',
    repairCost: resolveStatus === '已解决' ? 1200 + (index % 5) * 400 : index % 3 === 0 ? 800 : 0,
    faultLocation: vehicle?.locationAddress || formatCity(vehicle?.location),
    attachments: buildAttachments(row.id, reportTime, resolveStatus === '已解决'),
    suspendHistory:
      taskStatus === 'suspended'
        ? [
            {
              id: `sup-${row.id}`,
              suspendType: '等待零部件到货',
              reason: '关键配件缺货，申请挂起保护并保留催办跟进。',
              operator: opsManager,
              suspendTime: reportTime,
            },
          ]
        : [],
    notificationHistory:
      taskStatus !== 'archived' && index % 2 === 0
        ? [
            {
              id: `n-${row.id}`,
              channel: '短信催办',
              recipient: opsManager,
              role: '运维专员',
              title: '故障处置催办',
              content: `【OneOS】单据 ${row.faultNo}（${plate}）请尽快跟进处置与归档。`,
              sendTime: reportTime,
              status: '已发送',
            },
          ]
        : [],
  };
}

/** 从车辆资产台账抽样，扩展示例单据，覆盖多状态与多城市 */
function synthesizeFromFleet(startIndex: number, count: number): FaultRecord[] {
  const scenarios: Array<{
    level: FaultLevel;
    categories: FaultCategory[];
    source: FaultSource;
    resolve: FaultResolveStatus;
    task: FaultTaskStatus;
    desc: string;
    daysAgo: number;
  }> = [
    {
      level: 'L1-特急',
      categories: ['三电系统', '整车控制'],
      source: 'AI机器人上报',
      resolve: '临时排故',
      task: 'processing',
      desc: '高压绝缘报警触发并伴随 VCU 通信抖动，限制扭矩模式，需同步排查高压线束与整车控制链路。',
      daysAgo: 23,
    },
    {
      level: 'L2-紧急',
      categories: ['燃料电池系统', '供氢系统'],
      source: '车机遥测',
      resolve: '未解决',
      task: 'suspended',
      desc: '电堆压差偏大、入堆压力偏低，供氢侧与电堆侧需联合排查，已申请整车厂索赔挂起。',
      daysAgo: 35,
    },
    {
      level: 'L3-一般',
      categories: ['冷机系统'],
      source: '司机报修',
      resolve: '未解决',
      task: 'pending',
      desc: '冷机降温缓慢、压缩机异响，疑似冷媒不足或冷凝器积灰。',
      daysAgo: 2,
    },
    {
      level: 'L2-紧急',
      categories: ['底盘系统'],
      source: '定期巡检',
      resolve: '未解决',
      task: 'processing',
      desc: '前桥转向节间隙超标，高速方向盘抖动，配件已订货。',
      daysAgo: 12,
    },
    {
      level: 'L1-特急',
      categories: ['供氢系统'],
      source: '定期巡检',
      resolve: '已解决',
      task: 'archived',
      desc: '瓶阀组微量渗漏告警，已更换密封件并通过保压验收。',
      daysAgo: 40,
    },
    {
      level: 'L4-提示',
      categories: ['空调系统'],
      source: '客户报告',
      resolve: '已解决',
      task: 'archived',
      desc: '驾驶室空调出风量偏弱，清洗滤网后恢复。',
      daysAgo: 18,
    },
    {
      level: 'L3-一般',
      categories: ['整车控制', '三电系统'],
      source: '车机遥测',
      resolve: '临时排故',
      task: 'processing',
      desc: 'VCU 偶发通信中断并伴随电机控制器告警位闪烁，已远程刷新标定并持续观察。',
      daysAgo: 8,
    },
    {
      level: 'L2-紧急',
      categories: ['供氢系统', '底盘系统'],
      source: 'AI机器人上报',
      resolve: '未解决',
      task: 'pending',
      desc: '加氢口密封圈老化风险提示，同时巡检发现前轮偏磨，需一次进站完成两项处置。',
      daysAgo: 5,
    },
  ];

  const pool = VEHICLES.filter((v) => cleanPlate(v.plateNo)).slice(8, 8 + count * 2);
  const out: FaultRecord[] = [];
  const usedIds: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const vehicle = pool[i % pool.length];
    if (!vehicle) break;
    const sc = scenarios[i % scenarios.length];
    const report = new Date();
    report.setDate(report.getDate() - sc.daysAgo);
    report.setHours(8 + (i % 10), (i * 7) % 60, (i * 13) % 60, 0);
    const reportTime = `${report.getFullYear()}-${String(report.getMonth() + 1).padStart(2, '0')}-${String(report.getDate()).padStart(2, '0')} ${String(report.getHours()).padStart(2, '0')}:${String(report.getMinutes()).padStart(2, '0')}:${String(report.getSeconds()).padStart(2, '0')}`;
    const plate = cleanPlate(vehicle.plateNo);
    const opsManager = pickOpsManager(vehicle);
    const id = generateFaultCode(report, usedIds);
    usedIds.push(id);
    const archived = sc.task === 'archived';

    out.push({
      id,
      plate,
      brand: vehicle.brand || '未知品牌',
      model: vehicle.model || '未知型号',
      vin: vehicle.vin,
      operateCity: formatCity(vehicle.location),
      operateCompany:
        vehicle.customer && vehicle.customer !== '-'
          ? vehicle.customer
          : vehicle.operateCompany || '未知运营主体',
      opsManager,
      taskStatus: sc.task,
      resolveStatus: sc.resolve,
      level: sc.level,
      categories: sc.categories,
      source: sc.source,
      reportTime,
      deadlineTime: addDays(reportTime, 30),
      archivedTime: archived ? addDays(reportTime, 10).replace(' 23:59', ' 16:30') : undefined,
      lastOperationTime: archived ? addDays(reportTime, 10).replace(' 23:59', ' 16:30') : reportTime,
      lastOperator: opsManager,
      description: sc.desc,
      aiChatSummary:
        sc.source === 'AI机器人上报' || sc.source === '车机遥测'
          ? `【遥测/AI】车牌 ${plate}（VIN ${vehicle.vin}）已自动建单，初判部位：${sc.categories.join('、')}。`
          : undefined,
      repairFactory: '羚牛氢能区域服务站',
      repairResult: archived
        ? '已闭环归档。'
        : sc.task === 'suspended'
          ? '挂起、暂停中，等待配件/厂方反馈。'
          : sc.resolve === '临时排故'
            ? '已完成临时排故，观察中。'
            : '',
      repairCost: archived ? 1800 + (i % 6) * 350 : sc.task === 'processing' ? 900 : 0,
      faultLocation: vehicle.locationAddress || formatCity(vehicle.location),
      attachments: buildAttachments(id, reportTime, archived),
      suspendHistory:
        sc.task === 'suspended'
          ? [
              {
                id: `sup-${id}`,
                suspendType: '整车厂索赔审核',
                reason: '待厂方技术鉴定与配件发运，申请挂起保护。',
                operator: opsManager,
                suspendTime: reportTime,
              },
            ]
          : [],
      notificationHistory:
        sc.task !== 'archived' && sc.daysAgo >= 7
          ? [
              {
                id: `n-${id}`,
                channel: sc.daysAgo > 30 ? '邮件督办' : '短信催办',
                recipient: opsManager,
                role: '运维专员',
                title: sc.daysAgo > 30 ? '故障处置逾期督办' : '故障处置临期催办',
                content: `【OneOS】单据 ${id}（${plate}）请在上报后 30 天内完成处置闭环。`,
                sendTime: reportTime,
                status: '已发送',
              },
            ]
          : [],
    });
  }

  return out;
}

const fromAssetFaults = FAULT_SEED.map((row, index) => fromSeedRow(row, index));
const fromFleet = synthesizeFromFleet(fromAssetFaults.length, 36);

/**
 * 处置时限配色样例（固定置顶，便于开发对照首页一眼验收）：
 * - 剩 >7 天 → muted
 * - 仅剩 ≤7 天 → 预警色
 * - 已逾期（超 30 天时限）→ 警告色
 * - 挂起、暂停中 / 已闭环 → muted
 */
function buildSlaColorDemoCases(): FaultRecord[] {
  const demos: Array<{
    idSuffix: string;
    daysAgo: number;
    task: FaultTaskStatus;
    resolve: FaultResolveStatus;
    level: FaultLevel;
    categories: FaultCategory[];
    desc: string;
    demoTag: string;
  }> = [
    {
      idSuffix: 'DEMO-MUTED',
      daysAgo: 3,
      task: 'processing',
      resolve: '临时排故',
      level: 'L3-一般',
      categories: ['空调系统'],
      desc: '【配色样例·常态辅文】上报约 3 天，处置时限应显示「剩 N 天」（muted，无强调色）。',
      demoTag: '样例·剩>7天',
    },
    {
      idSuffix: 'DEMO-WARN',
      daysAgo: 26,
      task: 'processing',
      resolve: '未解决',
      level: 'L2-紧急',
      categories: ['三电系统'],
      desc: '【配色样例·临期预警】上报约 26 天，距 30 天时限仅剩 ≤7 天，处置时限应为预警色「仅剩 N 天」。',
      demoTag: '样例·临期≤7天',
    },
    {
      idSuffix: 'DEMO-OVERDUE',
      daysAgo: 38,
      task: 'processing',
      resolve: '未解决',
      level: 'L1-特急',
      categories: ['燃料电池系统', '供氢系统'],
      desc: '【配色样例·逾期警告】上报约 38 天，已超过 30 天处置时限，处置时限应为警告色「逾期 N 天」。',
      demoTag: '样例·已逾期',
    },
    {
      idSuffix: 'DEMO-SUSPEND',
      daysAgo: 20,
      task: 'suspended',
      resolve: '未解决',
      level: 'L2-紧急',
      categories: ['底盘系统'],
      desc: '【配色样例·挂起暂停】已挂起不计剩余时限，处置时限应为 muted「挂起、暂停中」。',
      demoTag: '样例·挂起暂停',
    },
    {
      idSuffix: 'DEMO-CLOSED',
      daysAgo: 45,
      task: 'archived',
      resolve: '已解决',
      level: 'L3-一般',
      categories: ['冷机系统'],
      desc: '【配色样例·已闭环】已归档单据，处置时限应为 muted「已闭环」。',
      demoTag: '样例·已闭环',
    },
  ];

  const pool = VEHICLES.filter((v) => cleanPlate(v.plateNo)).slice(0, 12);
  const usedIds: string[] = [];
  return demos.map((demo, i) => {
    const vehicle = pool[i % pool.length] || VEHICLES[0];
    const report = new Date();
    report.setHours(10 + i, i * 3, 0, 0);
    report.setDate(report.getDate() - demo.daysAgo);
    const y = report.getFullYear();
    const m = String(report.getMonth() + 1).padStart(2, '0');
    const day = String(report.getDate()).padStart(2, '0');
    const hh = String(report.getHours()).padStart(2, '0');
    const mm = String(report.getMinutes()).padStart(2, '0');
    const reportTime = `${y}-${m}-${day} ${hh}:${mm}:00`;
    const plate = cleanPlate(vehicle.plateNo);
    const opsManager = pickOpsManager(vehicle, '配色验收账号');
    const id = generateFaultCode(parseReportTime(reportTime), usedIds);
    usedIds.push(id);
    const archived = demo.task === 'archived';

    return {
      id,
      plate,
      brand: vehicle.brand || '未知品牌',
      model: vehicle.model || '未知型号',
      vin: vehicle.vin,
      operateCity: formatCity(vehicle.location),
      operateCompany:
        vehicle.customer && vehicle.customer !== '-'
          ? vehicle.customer
          : vehicle.operateCompany || '未知运营主体',
      opsManager,
      taskStatus: demo.task,
      resolveStatus: demo.resolve,
      level: demo.level,
      categories: demo.categories,
      source: '定期巡检' as FaultSource,
      reportTime,
      deadlineTime: addDays(reportTime, 30),
      archivedTime: archived ? addDays(reportTime, 12).replace(' 23:59', ' 15:00') : undefined,
      lastOperationTime: archived ? addDays(reportTime, 12).replace(' 23:59', ' 15:00') : reportTime,
      lastOperator: opsManager,
      description: demo.desc,
      aiChatSummary: `【开发验收】${demo.demoTag} — 对照列表「处置时限」列配色即可。`,
      repairFactory: '羚牛氢能区域服务站',
      repairResult: archived
        ? '已闭环归档（配色样例）。'
        : demo.task === 'suspended'
          ? '挂起、暂停中（配色样例）。'
          : demo.resolve === '临时排故'
            ? '临时排故观察中（配色样例）。'
            : '',
      repairCost: archived ? 1600 : 0,
      faultLocation: vehicle.locationAddress || formatCity(vehicle.location),
      attachments: buildAttachments(id, reportTime, archived),
      suspendHistory:
        demo.task === 'suspended'
          ? [
              {
                id: `sup-${id}`,
                suspendType: '等待零部件到货',
                reason: '配色样例：挂起期间不计处置时限。',
                operator: opsManager,
                suspendTime: reportTime,
              },
            ]
          : [],
      notificationHistory: [],
    };
  });
}

export const MOCK_FAULT_RECORDS: FaultRecord[] = [
  ...buildSlaColorDemoCases(),
  ...fromAssetFaults,
  ...fromFleet,
];

/** 供「新增故障登记」随机挂载真实车辆主数据 */
export function pickSeedVehicleForCreate(): VehicleSeed {
  const idx = Math.floor(Math.random() * Math.min(VEHICLES.length, 200));
  return VEHICLES[idx] || VEHICLES[0];
}

export function vehicleFieldsFromSeed(v: VehicleSeed) {
  return {
    plate: cleanPlate(v.plateNo),
    brand: v.brand || '未知品牌',
    model: v.model || '未知型号',
    vin: v.vin,
    operateCity: formatCity(v.location),
    operateCompany:
      v.customer && v.customer !== '-' ? v.customer : v.operateCompany || '未知运营主体',
    opsManager: pickOpsManager(v),
    faultLocation: v.locationAddress || formatCity(v.location),
  };
}
