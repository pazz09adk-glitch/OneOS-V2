import type { VehicleRecord } from '../types';

export type OnLeaseFleetSegment = '全部' | '租赁' | '物流';

export const ON_LEASE_FLEET_SEGMENTS: OnLeaseFleetSegment[] = ['全部', '租赁', '物流'];

/** 进度条三段：租赁 / 物流 / 库存 */
export interface FleetStatusMix {
  lease: number;
  logistics: number;
  stock: number;
}

export interface OnLeaseFleetBucket {
  key: string;
  brand: string;
  model: string;
  vehicleType: string;
  count: number;
  vehicles: VehicleRecord[];
  /** 同品牌型号下租赁/物流/库存构成（进度条用） */
  mix: FleetStatusMix;
}

export const FLEET_MIX_LEGEND = [
  { key: 'lease', label: '租赁', className: 'is-lease' },
  { key: 'logistics', label: '物流', className: 'is-logistics' },
  { key: 'stock', label: '库存', className: 'is-stock' },
] as const;

function isOnLease(record: VehicleRecord): boolean {
  return record.operateStatus === '租赁' || record.operateStatus === '物流';
}

export function emptyFleetMix(): FleetStatusMix {
  return { lease: 0, logistics: 0, stock: 0 };
}

export function resolveFleetStatusMix(vehicles: VehicleRecord[]): FleetStatusMix {
  const mix = emptyFleetMix();
  for (const vehicle of vehicles) {
    const status = vehicle.operateStatus;
    if (status === '租赁') mix.lease += 1;
    else if (status === '物流') mix.logistics += 1;
    else if (
      status === '可运营'
      || status === '待运营'
      || status === '代运营'
      || status === '库存'
      || status === '在库-可交付'
      || status === '在库-不可交付'
      || status === '库存可交付'
      || status === '库存不可交付'
    ) mix.stock += 1;
  }
  return mix;
}

export function fleetMixTotal(mix: FleetStatusMix): number {
  return mix.lease + mix.logistics + mix.stock;
}

function modelKey(brand: string, model: string, vehicleType: string): string {
  return `${brand}|${model}|${vehicleType}`;
}

/** 列表 / 「其他」卡过滤用：品牌|型号|车型 */
export function toFleetModelKey(record: Pick<VehicleRecord, 'brand' | 'model' | 'vehicleType'>): string {
  return modelKey(
    record.brand || '未填品牌',
    record.model || '未填型号',
    record.vehicleType || '—',
  );
}

function matchModel(
  record: VehicleRecord,
  brand: string,
  model: string,
  vehicleType: string,
): boolean {
  return (record.brand || '未填品牌') === brand
    && (record.model || '未填型号') === model
    && (record.vehicleType || '—') === vehicleType;
}

/** 同品牌型号的租赁/物流/库存构成（含库存，不限于在租） */
export function buildModelStatusMix(
  allRecords: VehicleRecord[],
  brand: string,
  model: string,
  vehicleType: string,
): FleetStatusMix {
  return resolveFleetStatusMix(
    allRecords.filter((record) => matchModel(record, brand, model, vehicleType)),
  );
}

export function filterOnLeaseVehicles(
  records: VehicleRecord[],
  segment: OnLeaseFleetSegment = '全部',
): VehicleRecord[] {
  return records.filter((record) => {
    if (!isOnLease(record)) return false;
    if (segment === '全部') return true;
    return record.operateStatus === segment;
  });
}

export function buildOnLeaseFleetSummary(
  records: VehicleRecord[],
  segment: OnLeaseFleetSegment = '全部',
): OnLeaseFleetBucket[] {
  const map = new Map<string, OnLeaseFleetBucket>();
  for (const vehicle of filterOnLeaseVehicles(records, segment)) {
    const brand = vehicle.brand || '未填品牌';
    const model = vehicle.model || '未填型号';
    const vehicleType = vehicle.vehicleType || '—';
    const key = modelKey(brand, model, vehicleType);
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      existing.vehicles.push(vehicle);
    } else {
      map.set(key, {
        key,
        brand,
        model,
        vehicleType,
        count: 1,
        vehicles: [vehicle],
        mix: emptyFleetMix(),
      });
    }
  }

  return [...map.values()]
    .map((bucket) => ({
      ...bucket,
      mix: buildModelStatusMix(records, bucket.brand, bucket.model, bucket.vehicleType),
    }))
    .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand, 'zh'));
}

export function countOnLeaseFleetBySegment(
  records: VehicleRecord[],
): Record<OnLeaseFleetSegment, number> {
  return {
    全部: filterOnLeaseVehicles(records, '全部').length,
    租赁: filterOnLeaseVehicles(records, '租赁').length,
    物流: filterOnLeaseVehicles(records, '物流').length,
  };
}

/** 按容器可容纳卡位数，截取前列并归并「其他」 */
export function collapseFleetSummary(
  summary: OnLeaseFleetBucket[],
  visibleSlots: number,
  allRecords: VehicleRecord[],
): OnLeaseFleetBucket[] {
  const slots = Math.max(1, visibleSlots);
  if (summary.length <= slots) return summary;

  const keepCount = Math.max(1, slots - 1);
  const head = summary.slice(0, keepCount);
  const rest = summary.slice(keepCount);
  const otherVehicles = rest.flatMap((item) => item.vehicles);
  const otherModels = rest.length;
  const restKeys = new Set(rest.map((item) => item.key));
  const otherMixVehicles = allRecords.filter((record) => {
    const key = modelKey(
      record.brand || '未填品牌',
      record.model || '未填型号',
      record.vehicleType || '—',
    );
    return restKeys.has(key);
  });

  return [
    ...head,
    {
      key: '__other__',
      brand: '其他',
      model: `${otherModels} 种品牌型号`,
      vehicleType: '长尾车型合计',
      count: otherVehicles.length,
      vehicles: otherVehicles,
      mix: resolveFleetStatusMix(otherMixVehicles),
    },
  ];
}

/** 按容器宽度估算卡位数，PC 默认卡位固定为 4 个（TOP3 热门车型 + 第 4 个「其他」归并卡片） */
export function estimateFleetCardSlots(containerWidth: number): number {
  if (containerWidth <= 640) return 2;
  if (containerWidth <= 960) return 3;
  return 4;
}
