import type { VehicleRecord } from '../types';
import { isEmpty } from './vehicle';

/** 完成预判标签 */
export type MileageForecastTone = 'ok' | 'warn' | 'err' | 'done' | 'none';

export type MileageForecastLabel =
  | '预计可完成'
  | '有完成风险'
  | '预计无法完成'
  | '已完成'
  | '';

/** 创建任务工单时初始里程的取值来源 */
export type MileageTaskStartSource = '车机' | 'GPS' | '人工';

export interface MileageTaskView {
  hasTask: boolean;
  /** 0–100，展示保留 1 位小数 */
  percent: number;
  /** 工单初始里程（创建时写入） */
  startKm: number;
  /** 初始里程来源：车机 → GPS → 人工 */
  startSource: MileageTaskStartSource;
  /** 任务约定需完成总里程（工单目标增量） */
  targetKm: number;
  /** 当前相对初始已跑里程 */
  doneKm: number;
  /** 剩余需完成 = 目标 − 已跑 */
  remainingKm: number;
  /** null = 暂无法预计（无活跃日） */
  estimatedDays: number | null;
  /** 任务截止剩余自然日（工单约定，用于可完成预判） */
  deadlineDaysLeft: number;
  /** 近 7 个活跃日日均里程（活跃日：当日行驶 > 20 km） */
  activeDailyAvgKm: number | null;
  /** 按日均 × 截止剩余天数可跑出的预计里程 */
  projectedKm: number | null;
  forecast: MileageForecastLabel;
  tone: MileageForecastTone;
}

/** 活跃日门槛：当日行驶里程大于该值才计入 */
export const MILEAGE_ACTIVE_DAY_MIN_KM = 20;
/** 取最近若干个活跃日做日均 */
export const MILEAGE_ACTIVE_DAY_WINDOW = 7;
/**
 * 预计可跑里程相对任务剩余里程的裕量：
 * 差额 ≤ 该值 → 有完成风险；> 该值 → 预计可完成；预计可跑 < 剩余 → 预计无法完成
 */
export const MILEAGE_FORECAST_RISK_BUFFER_KM = 200;

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function toNum(raw: unknown): number | null {
  if (isEmpty(raw)) return null;
  const n = Number(String(raw).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

function emptyTask(): MileageTaskView {
  return {
    hasTask: false,
    percent: 0,
    startKm: 0,
    startSource: '人工',
    targetKm: 0,
    doneKm: 0,
    remainingKm: 0,
    estimatedDays: null,
    deadlineDaysLeft: 0,
    activeDailyAvgKm: null,
    projectedKm: null,
    forecast: '',
    tone: 'none',
  };
}

/** 从日里程序列中取最近 N 个活跃日（>20km）的算术平均；无活跃日返回 null */
export function averageActiveDailyKm(
  dailyMiles: number[],
  window = MILEAGE_ACTIVE_DAY_WINDOW,
  minKm = MILEAGE_ACTIVE_DAY_MIN_KM,
): number | null {
  const active = dailyMiles.filter((km) => Number.isFinite(km) && km > minKm);
  if (!active.length) return null;
  const sample = active.slice(-window);
  const sum = sample.reduce((acc, km) => acc + km, 0);
  return sum / sample.length;
}

/**
 * 创建工单时初始里程默认取值：车机 → GPS → 人工维护。
 * 显式 `mileageTaskStartKm` 视为已写入工单的初始里程。
 */
export function resolveMileageTaskStart(
  record: VehicleRecord,
  currentKm: number,
  h: number,
  targetKm: number,
): { startKm: number; startSource: MileageTaskStartSource } {
  const explicitStart = toNum(record.mileageTaskStartKm);
  if (explicitStart !== null) {
    const forced = record.mileageTaskStartSource;
    if (forced === '车机' || forced === 'GPS' || forced === '人工') {
      return { startKm: explicitStart, startSource: forced };
    }
    if (record.telematicsLinked === true || record.onlineStatus === '在线') {
      return { startKm: explicitStart, startSource: '车机' };
    }
    if (!isEmpty(record.gpsTime) || (record.gpsLat != null && record.gpsLng != null)) {
      return { startKm: explicitStart, startSource: 'GPS' };
    }
    return { startKm: explicitStart, startSource: '人工' };
  }

  /* 演示：按接入能力模拟「创建工单当时」快照（略低于当前里程） */
  const progressRatio = 0.25 + (h % 50) / 100;
  const snapshot = Math.max(0, Math.round(currentKm - targetKm * progressRatio));

  if (record.telematicsLinked === true || record.onlineStatus === '在线') {
    return { startKm: snapshot, startSource: '车机' };
  }
  if (!isEmpty(record.gpsTime) || (record.gpsLat != null && record.gpsLng != null)) {
    return { startKm: snapshot, startSource: 'GPS' };
  }
  /* 都取不到：人工维护（可用交车里程作演示底稿） */
  const delivery = toNum(record.lastDeliveryMile);
  if (delivery !== null && delivery <= currentKm) {
    return { startKm: delivery, startSource: '人工' };
  }
  return { startKm: snapshot, startSource: '人工' };
}

/**
 * 解析近 7 个活跃日日均：
 * 1) 显式日里程数组 → 筛活跃日再均
 * 2) 显式日均字段（已按活跃日口径）
 * 3) 原型按车 id 合成演示日里程（含非活跃日）
 */
function resolveActive7dAvgKm(record: VehicleRecord, h: number): number | null {
  const rawDays = record.mileageTaskRecentDailyKm;
  if (Array.isArray(rawDays) && rawDays.length > 0) {
    const miles = rawDays
      .map((v) => toNum(v))
      .filter((n): n is number => n !== null);
    return averageActiveDailyKm(miles);
  }

  const explicitAvg = toNum(record.mileageTaskDailyAvg7d);
  if (explicitAvg !== null) {
    return explicitAvg > 0 ? explicitAvg : null;
  }

  const synth: number[] = [];
  for (let i = 0; i < 14; i += 1) {
    const seed = (h + i * 17) % 11;
    if (seed < 3) synth.push([0, 8, 15][seed]);
    else synth.push(40 + ((h + i * 13) % 220));
  }
  return averageActiveDailyKm(synth);
}

/**
 * 按「日均 × 截止剩余天数」与「任务剩余公里」对比预判：
 * - 预计可跑 < 剩余 → 预计无法完成
 * - 预计可跑 − 剩余 ≤ 200 → 有完成风险
 * - 预计可跑 − 剩余 > 200 → 预计可完成
 */
export function resolveMileageForecast(
  projectedKm: number,
  remainingKm: number,
  bufferKm = MILEAGE_FORECAST_RISK_BUFFER_KM,
): { forecast: MileageForecastLabel; tone: MileageForecastTone } {
  if (projectedKm < remainingKm) {
    return { forecast: '预计无法完成', tone: 'err' };
  }
  if (projectedKm - remainingKm <= bufferKm) {
    return { forecast: '有完成风险', tone: 'warn' };
  }
  return { forecast: '预计可完成', tone: 'ok' };
}

/**
 * 车辆里程考核任务（国家/地方政策补贴对应的里程考核；区别于客户租赁合同优惠里程考核）。
 * 优先读记录显式字段；否则按车 id 稳定合成演示数据。
 */
export function resolveMileageTask(record: VehicleRecord): MileageTaskView {
  const current = toNum(record.mileage);
  if (current === null) return emptyTask();

  const explicitStart = toNum(record.mileageTaskStartKm);
  const explicitTarget = toNum(record.mileageTaskTargetKm);
  const hasExplicit = explicitStart !== null && explicitTarget !== null && explicitTarget > 0;

  const h = hashId(record.id || record.plateNo || '');
  const status = record.operateStatus || '';
  const isOnLease = status === '租赁' || status === '物流';
  const exited = status === '退出运营';

  if (!hasExplicit) {
    if (exited) return emptyTask();
    if (!isOnLease && h % 4 === 0) return emptyTask();
    if (isOnLease && h % 8 === 0) return emptyTask();
  }

  const targetKm = hasExplicit
    ? (explicitTarget as number)
    : [8000, 10000, 12000, 15000, 18000, 20000][h % 6];

  const { startKm, startSource } = resolveMileageTaskStart(record, current, h, targetKm);

  /** 已跑 = 当前实际里程 − 工单初始里程 */
  const doneKm = Math.max(0, Math.round(current - startKm));
  const percentRaw = targetKm > 0 ? (doneKm / targetKm) * 100 : 0;
  const percent = Math.min(100, Math.round(percentRaw * 10) / 10);
  /** 剩余 = 任务目标 − 已跑 */
  const remainingKm = Math.max(0, Math.round(targetKm - doneKm));

  if (percent >= 100 || remainingKm <= 0) {
    return {
      hasTask: true,
      percent: 100,
      startKm,
      startSource,
      targetKm,
      doneKm: targetKm,
      remainingKm: 0,
      estimatedDays: 0,
      deadlineDaysLeft: 0,
      activeDailyAvgKm: null,
      projectedKm: null,
      forecast: '已完成',
      tone: 'done',
    };
  }

  const deadlineDaysLeft = toNum(record.mileageTaskDeadlineDays) ?? (7 + (h % 55));
  const activeDailyAvgKm = resolveActive7dAvgKm(record, h);

  if (activeDailyAvgKm === null || activeDailyAvgKm <= 0) {
    return {
      hasTask: true,
      percent,
      startKm,
      startSource,
      targetKm,
      doneKm,
      remainingKm,
      estimatedDays: null,
      deadlineDaysLeft,
      activeDailyAvgKm: null,
      projectedKm: null,
      forecast: '',
      tone: 'none',
    };
  }

  const projectedKm = Math.round(activeDailyAvgKm * deadlineDaysLeft);
  /** 预计完成天数 = 剩余 ÷ 近 7 活跃日均 */
  const estimatedDays = Math.ceil(remainingKm / activeDailyAvgKm);
  const { forecast, tone } = resolveMileageForecast(projectedKm, remainingKm);

  return {
    hasTask: true,
    percent,
    startKm,
    startSource,
    targetKm,
    doneKm,
    remainingKm,
    estimatedDays,
    deadlineDaysLeft,
    activeDailyAvgKm: Math.round(activeDailyAvgKm * 10) / 10,
    projectedKm,
    forecast,
    tone,
  };
}

export function formatTaskRemainKm(km: number): string {
  return `${km.toLocaleString('zh-CN')} km`;
}

/** 辅行「剩 xx km · 约 N 天」悬停说明 */
export function mileageRemainMetaTip(task: MileageTaskView): string {
  if (!task.hasTask) return '';
  const start = `${task.startKm.toLocaleString('zh-CN')} km（${task.startSource}）`;
  const done = `${task.doneKm.toLocaleString('zh-CN')} km`;
  const remain = `${task.remainingKm.toLocaleString('zh-CN')} km`;
  const target = `${task.targetKm.toLocaleString('zh-CN')} km`;
  const base = `工单初始里程 ${start}；当前已跑 ${done} = 当前里程 − 初始；剩余 ${remain} = 任务目标 ${target} − 已跑。`;
  if (task.forecast === '已完成') return `${base}考核已达标。`;
  if (task.estimatedDays === null) {
    return `${base}近 7 个活跃日不足，暂无法按日均估算完成天数。`;
  }
  const avg = task.activeDailyAvgKm != null ? `${task.activeDailyAvgKm} km/日` : '—';
  return `${base}预计约 ${task.estimatedDays} 天 = 剩余 ÷ 近 7 活跃日均（${avg}）。`;
}

/** 预判标签悬停说明 */
export function mileageForecastTip(task: MileageTaskView): string {
  if (task.forecast === '已完成') return '里程考核任务已达标。';
  if (!task.forecast) {
    return '近 7 个活跃日（日行驶＞20 km）不足，暂无法按日均预判是否可完成。';
  }
  const avg = task.activeDailyAvgKm != null ? `${task.activeDailyAvgKm} km/日` : '—';
  const projected = task.projectedKm != null ? `${task.projectedKm.toLocaleString('zh-CN')} km` : '—';
  const remain = `${task.remainingKm.toLocaleString('zh-CN')} km`;
  const base = `近 7 个活跃日均 ${avg} × 截止剩余 ${task.deadlineDaysLeft} 天 ≈ 预计可跑 ${projected}；任务剩余 ${remain}。`;
  if (task.forecast === '预计无法完成') {
    return `${base}预计可跑少于任务剩余，预计无法完成。`;
  }
  if (task.forecast === '有完成风险') {
    return `${base}预计可跑达到剩余要求但裕量≤${MILEAGE_FORECAST_RISK_BUFFER_KM} km，有完成风险。`;
  }
  return `${base}预计可跑超出剩余要求超过 ${MILEAGE_FORECAST_RISK_BUFFER_KM} km，预计可完成。`;
}
