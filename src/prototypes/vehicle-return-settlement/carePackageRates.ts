/**
 * 各车型收费方案（最终版）· 保养无忧包（养护保）/ 维修无忧包（易损保）
 * 来源：各车型收费方案(1).xlsx · 业管谈妥是否购买后，系统按本表自动核算
 */

export type VehicleModelKey =
  | '苏龙车18T'
  | '宇通49T'
  | '飞驰18T'
  | '现代4.5T普货'
  | '现代冷藏4.5T'
  | '楚风18T'
  | '飞驰49T';

export type CarePackageRate = {
  model: VehicleModelKey;
  /** 保养无忧包（养护保）：元/公里 */
  maintainPerKm: number;
  /** 维修无忧包（易损保）：元/月；不含轮胎、漆面、玻璃 */
  repairMonthly: number;
};

export const CARE_PACKAGE_RATES: CarePackageRate[] = [
  { model: '苏龙车18T', maintainPerKm: 0.06, repairMonthly: 400 },
  { model: '宇通49T', maintainPerKm: 0.085, repairMonthly: 600 },
  { model: '飞驰18T', maintainPerKm: 0.06, repairMonthly: 400 },
  { model: '现代4.5T普货', maintainPerKm: 0.05, repairMonthly: 300 },
  { model: '现代冷藏4.5T', maintainPerKm: 0.055, repairMonthly: 350 },
  { model: '楚风18T', maintainPerKm: 0.06, repairMonthly: 400 },
  { model: '飞驰49T', maintainPerKm: 0.08, repairMonthly: 500 },
];

export const CARE_PACKAGE_TIP =
  '保养无忧包（养护保）：按厂家保养要求提供定期保养服务；费用按本段里程 × 车型单价自动核算。';

export const WEAR_PACKAGE_TIP =
  '维修无忧包（易损保）：提供刹车片、灯泡、蓄电池、雨刮等易损件租期内免费更换（不含轮胎、漆面、玻璃；只限自行到服务站更换）；费用按本段计费月数 × 车型月费自动核算。';

export const getCarePackageRate = (model: string): CarePackageRate | null =>
  CARE_PACKAGE_RATES.find((r) => r.model === model) ?? null;

/** 本段计费月数：交还车日期间隔天数 / 30，向上取整，至少 1（有租期时） */
export function calcBillableMonths(deliveryTime: string, returnTime: string): number {
  const start = Date.parse(deliveryTime.replace(/-/g, '/'));
  const end = Date.parse(returnTime.replace(/-/g, '/'));
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  const days = Math.max(1, Math.ceil((end - start) / (24 * 3600 * 1000)));
  return Math.max(1, Math.ceil(days / 30));
}

export function formatMoney(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

export type CarePackageCalcInput = {
  vehicleModel: string;
  mileageKm: number;
  deliveryTime: string;
  returnTime: string;
  /** 业管与客户谈妥是否购买 · 养护保 */
  hasCarePackage: boolean;
  /** 业管与客户谈妥是否购买 · 易损保 */
  hasWearPackage: boolean;
};

export type CarePackageCalcResult = {
  rate: CarePackageRate | null;
  billableMonths: number;
  /** 已购养护保时：里程 × 元/公里；未购为 0 */
  carePackageFee: number;
  /** 已购易损保时：月数 × 月费；未购为 0 */
  wearPackageFee: number;
  careFormula: string;
  wearFormula: string;
  carePackageFeeText: string;
  wearPackageFeeText: string;
};

export function calcCarePackages(input: CarePackageCalcInput): CarePackageCalcResult {
  const rate = getCarePackageRate(input.vehicleModel);
  const billableMonths = calcBillableMonths(input.deliveryTime, input.returnTime);
  const mileage = Math.max(0, Number(input.mileageKm) || 0);

  const carePackageFee =
    input.hasCarePackage && rate ? mileage * rate.maintainPerKm : 0;
  const wearPackageFee =
    input.hasWearPackage && rate ? billableMonths * rate.repairMonthly : 0;

  const careFormula = !input.hasCarePackage
    ? '未购买 · 不核算'
    : rate
      ? `${mileage.toLocaleString('zh-CN')} 公里 × ${rate.maintainPerKm} 元/公里`
      : '车型未配置费率';

  const wearFormula = !input.hasWearPackage
    ? '未购买 · 不核算'
    : rate
      ? `${billableMonths} 月 × ${rate.repairMonthly} 元/月（不含轮胎、漆面、玻璃）`
      : '车型未配置费率';

  return {
    rate,
    billableMonths,
    carePackageFee,
    wearPackageFee,
    careFormula,
    wearFormula,
    carePackageFeeText: formatMoney(carePackageFee),
    wearPackageFeeText: formatMoney(wearPackageFee),
  };
}

/** 运维固定费用项与无忧包减免挂钩 */
export const OPS_WAIVER_MAP: Record<string, 'care' | 'wear' | 'tire' | null> = {
  清洗费: null,
  未结算保养费: 'care',
  未结算维修费: 'wear',
  车损费: null,
  工具损坏丢失费: null,
  证件丢失费: null,
  广告损坏丢失费: null,
  送车服务费: null,
  接车服务费: null,
  轮胎磨损费: 'tire',
};

export function opsNetAmount(amount: string, waiver?: string): number {
  const a = Number(amount) || 0;
  const w = Number(waiver) || 0;
  return Math.max(0, Math.round((a - w) * 100) / 100);
}
