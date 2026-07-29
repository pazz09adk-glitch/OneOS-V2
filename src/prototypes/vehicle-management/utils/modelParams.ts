import type { VehicleRecord } from '../types';
import { displayUILabel, isEmpty } from './vehicle';

/** 车辆类型标准枚举（与型号参数台账一致） */
export const VEHICLE_TYPE_OPTIONS = [
  '轻型厢式货车',
  '重型厢式货车',
  '重型半挂牵引车',
  '重型平板半挂车',
  '重型集装箱半挂车',
  '小型普通客车',
  '叉车',
  '油车',
] as const;

export type VehicleTypeOption = (typeof VEHICLE_TYPE_OPTIONS)[number];

/** 车牌颜色（与型号「新增」表单一致） */
export const PLATE_COLOR_OPTIONS = ['绿牌', '黄牌', '黄绿牌'] as const;

export interface ModelMaintenanceRow {
  id: string;
  item: string;
  kmCycle: string;
  monthCycle: string;
  labor: string;
  material: string;
  total: string;
}

/**
 * 型号参数全量字段（对齐「新增」表单，详情只读展示不得省略）
 */
export interface VehicleModelParams {
  brand: string;
  model: string;
  vehicleType: string;
  announcementModel: string;
  fuelType: string;
  plateColor: string;
  /** 车辆长度，单位米 */
  lengthM: string;
  widthM: string;
  heightM: string;
  tireCount: string;
  /** 轮胎磨损费用(元/mm) */
  tireWearFee: string;
  batteryType: string;
  batteryVendor: string;
  /** 储电量 */
  energyCapacity: string;
  /** 电续航里程(KM) */
  electricRangeKm: string;
  hydrogenCapacity: string;
  gaugeMode: string;
  hydrogenRangeKm: string;
  coldUnitVendor: string;
  maintenanceItems: ModelMaintenanceRow[];
}

const DEFAULT_MAINTENANCE: ModelMaintenanceRow[] = [
  { id: '1', item: '变速器油', kmCycle: '60000', monthCycle: '24', labor: '0', material: '571', total: '571' },
  { id: '2', item: '空气滤清器', kmCycle: '30000', monthCycle: '12', labor: '80', material: '120', total: '200' },
  { id: '3', item: '制动液', kmCycle: '40000', monthCycle: '24', labor: '60', material: '90', total: '150' },
  { id: '4', item: '氢系统管路检查', kmCycle: '20000', monthCycle: '6', labor: '480', material: '0', total: '480' },
  { id: '5', item: '冷机保养', kmCycle: '15000', monthCycle: '6', labor: '200', material: '350', total: '550' },
];

function resolveVehicleTypeEnum(raw: string): string {
  if (isEmpty(raw)) return '无';
  const text = String(raw).trim();
  const exact = VEHICLE_TYPE_OPTIONS.find((item) => item === text);
  if (exact) return exact;
  const fuzzy = VEHICLE_TYPE_OPTIONS.find((item) => text.includes(item) || item.includes(text));
  if (fuzzy) return fuzzy;
  if (text.includes('牵引')) return '重型半挂牵引车';
  if (text.includes('集装箱') && text.includes('挂')) return '重型集装箱半挂车';
  if (text.includes('平板') && text.includes('挂')) return '重型平板半挂车';
  if (text.includes('客车')) return '小型普通客车';
  if (text.includes('叉车')) return '叉车';
  if (text.includes('油车') || text.includes('挂靠油')) return '油车';
  if (text.includes('轻型')) return '轻型厢式货车';
  if (text.includes('重型') && text.includes('厢')) return '重型厢式货车';
  return text;
}

function inferFuelType(brand: string, model: string): string {
  const text = `${brand}${model}`;
  if (/氢|FCEV|fuel/i.test(text)) return '氢';
  if (/电|EV/i.test(text)) return '电';
  if (/油车|挂靠油|柴油|燃油/.test(text)) return '柴油';
  return '氢';
}

function inferPlateColor(fuelType: string): string {
  if (fuelType === '柴油') return '黄牌';
  if (fuelType === '电') return '绿牌';
  return '绿牌';
}

/** mm → 米（保留最多 3 位小数，去掉末尾 0） */
function mmToMeters(mm: string): string {
  const n = Number(mm);
  if (!Number.isFinite(n)) return mm;
  const meters = n / 1000;
  return String(Number(meters.toFixed(3)));
}

function inferDimensionsMm(vehicleType: string): { length: string; width: string; height: string } {
  const type = resolveVehicleTypeEnum(vehicleType);
  if (type === '重型半挂牵引车' || type === '轻型厢式货车') {
    return { length: '5995', width: '2145', height: '3130' };
  }
  if (type === '小型普通客车') {
    return { length: '4990', width: '1850', height: '1700' };
  }
  return { length: '11995', width: '2550', height: '3980' };
}

function inferTireCount(vehicleType: string): string {
  const type = resolveVehicleTypeEnum(vehicleType);
  if (type === '重型半挂牵引车') return '10';
  if (type === '重型集装箱半挂车' || type === '重型平板半挂车') return '8';
  return '6';
}

/** 根据车辆台账推导型号参数展示数据（只读查看，字段对齐「新增」表单全量） */
export function resolveVehicleModelParams(record: VehicleRecord): VehicleModelParams {
  const brand = displayUILabel(record.brand);
  const model = displayUILabel(record.model);
  const vehicleType = resolveVehicleTypeEnum(record.vehicleType);
  const dims = inferDimensionsMm(record.vehicleType);
  const fuelType = inferFuelType(record.brand, record.model);
  const isHydrogen = fuelType === '氢';

  return {
    brand,
    model,
    vehicleType,
    announcementModel: isEmpty(record.model) ? '无' : String(record.model).trim(),
    fuelType,
    plateColor: inferPlateColor(fuelType),
    lengthM: mmToMeters(dims.length),
    widthM: mmToMeters(dims.width),
    heightM: mmToMeters(dims.height),
    tireCount: inferTireCount(record.vehicleType),
    tireWearFee: '0.8',
    batteryType: '磷酸铁锂',
    batteryVendor: '宁德时代新能源科技股份有限公司',
    energyCapacity: isHydrogen ? '100' : '282',
    electricRangeKm: isHydrogen ? '200' : '350',
    hydrogenCapacity: isHydrogen ? '140' : '无',
    gaugeMode: isHydrogen ? 'MPa' : '无',
    hydrogenRangeKm: isHydrogen ? '1000' : '无',
    coldUnitVendor: '开利空调冷冻设备（上海）有限公司',
    maintenanceItems: DEFAULT_MAINTENANCE,
  };
}
