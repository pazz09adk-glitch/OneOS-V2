import type { KpiKey, VehicleFilters, VehicleRecord } from '../types';
import chinaOperateRegions from '../data/china-operate-regions.json';
import {
  formatOperateCity,
  isEmpty,
  matchKpi,
  normalizePlate,
  displayText,
  OPERATE_CITY_SEED,
  parseRegionParts,
  matchAreaRegionFilter,
  matchOperateStatusFilter,
  PARKING_REGION_MAP,
  MUNICIPALITIES,
  resolveLicenseDisplayStatus,
} from './vehicle';
import {
  resolveInsuranceDisplayStatus,
  type VehicleInsuranceExpire,
} from './insurance';

export interface OperateCityTreeNode {
  province: string;
  cities: string[];
}

export function applyFilters(
  records: VehicleRecord[],
  filters: VehicleFilters,
  kpiTab: KpiKey,
  insuranceMap?: Map<string, VehicleInsuranceExpire>,
): VehicleRecord[] {
  return records.filter((record) => {
    if (!matchKpi(record, kpiTab)) return false;

    if (filters.plateNos.length > 0) {
      const plate = normalizePlate(record.plateNo);
      if (!filters.plateNos.some((p) => normalizePlate(p) === plate)) return false;
    }

    if (filters.operateCities.length > 0) {
      const city = formatOperateCity(record.location);
      if (!filters.operateCities.some((c) => city.includes(c) || c.includes(city))) return false;
    }

    /* 在租车型「其他」：按 TOP4+ 品牌型号键过滤，不走 brand/model 多选 */
    if (filters.fleetModelKeys.length > 0) {
      const key = `${record.brand || '未填品牌'}|${record.model || '未填型号'}|${record.vehicleType || '—'}`;
      if (!filters.fleetModelKeys.includes(key)) return false;
    }

    if (filters.brand.length > 0 && !filters.brand.includes(record.brand)) return false;
    if (filters.model.length > 0 && !filters.model.includes(record.model)) return false;
    if (filters.customer.length > 0 && !filters.customer.includes(record.customer)) return false;
    if (filters.department.length > 0 && !filters.department.includes(record.department)) return false;
    if (filters.projectName.length > 0) {
      const name = displayText(record.projectName, '');
      if (!filters.projectName.includes(name)) return false;
    }
    if (filters.projectType.length > 0) {
      const isLease = record.operateStatus === '租赁' || record.vehicleType === '租赁';
      const isLogistics = record.operateStatus === '物流' || record.vehicleType === '物流';
      const matches = filters.projectType.some((pt) => {
        if (pt === '租赁') return isLease;
        if (pt === '物流') return isLogistics;
        return record.operateStatus === pt || record.vehicleType === pt;
      });
      if (!matches) return false;
    }
    if (filters.contractNo.length > 0 && !filters.contractNo.includes(record.contractNo)) return false;
    if (filters.ownership.length > 0 && !filters.ownership.includes(record.ownership)) return false;
    if (filters.operateCompany.length > 0 && !filters.operateCompany.includes(record.operateCompany)) return false;
    if (filters.operateStatus.length > 0 && !matchOperateStatusFilter(record.operateStatus, filters.operateStatus)) {
      return false;
    }
    if (filters.vehicleSource.length > 0 && !filters.vehicleSource.includes(record.vehicleSource)) return false;
    if (filters.leaseCompany.length > 0 && !filters.leaseCompany.includes(record.leaseCompany)) return false;
    if (filters.parking.length > 0 && !filters.parking.includes(record.parking)) return false;
    if (filters.areaRegion.length > 0) {
      if (!filters.areaRegion.some((r) => matchAreaRegionFilter(record, r))) return false;
    }
    if (filters.licenseStatus.length > 0 && !filters.licenseStatus.includes(resolveLicenseDisplayStatus(record))) return false;
    if (filters.insuranceStatus.length > 0) {
      const insurance = insuranceMap?.get(record.id) || {};
      const displayStatus = resolveInsuranceDisplayStatus(insurance, record.insuranceStatus);
      if (!filters.insuranceStatus.includes(displayStatus)) return false;
    }
    if (filters.commercialInsurance && record.insuranceStatus !== filters.commercialInsurance) return false;
    if (filters.compulsoryInsurance && record.insuranceStatus !== filters.compulsoryInsurance) return false;

    return true;
  });
}
export function buildOptions(records: VehicleRecord[], key: keyof VehicleRecord): string[] {
  const set = new Set<string>();
  for (const r of records) {
    const v = r[key];
    if (!isEmpty(v)) set.add(String(v));
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function collectOperateCities(records: VehicleRecord[]): string[] {
  const set = new Set<string>();
  const add = (city: string) => {
    if (!city || city === '—') return;
    set.add(city);
  };
  Object.values(PARKING_REGION_MAP).forEach(add);
  OPERATE_CITY_SEED.forEach(add);
  for (const r of records) {
    add(formatOperateCity(r.location));
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

export function buildOperateCityOptions(records: VehicleRecord[]): string[] {
  return collectOperateCities(records);
}

export function buildOperateCityTree(records: VehicleRecord[]): OperateCityTreeNode[] {
  const provinceMap = new Map<string, Set<string>>();
  for (const full of collectOperateCities(records)) {
    const { province, city } = parseRegionParts(full);
    if (!province) continue;
    if (!provinceMap.has(province)) provinceMap.set(province, new Set());
    const cities = provinceMap.get(province)!;
    if (city) cities.add(city);
    else cities.add(province);
  }
  return Array.from(provinceMap.entries())
    .map(([province, cities]) => ({
      province,
      cities: Array.from(cities).sort((a, b) => a.localeCompare(b, 'zh-CN')),
    }))
    .sort((a, b) => a.province.localeCompare(b.province, 'zh-CN'));
}

/** 弹窗编辑用：完整中国大陆省级行政区 + 地级城市 */
export function buildChinaOperateCityTree(): OperateCityTreeNode[] {
  return chinaOperateRegions.map((node) => ({
    province: node.province,
    cities: [...node.cities],
  }));
}

export interface OperateCityOption {
  value: string;
  label: string;
  province: string;
}

export function formatOperateCityChipLabel(full: string): string {
  const { province, city } = parseRegionParts(full);
  if (!province) return full;
  if (MUNICIPALITIES.includes(province)) return province;
  if (city && city !== province) return city;
  return province;
}

export function flattenOperateCityOptions(tree: OperateCityTreeNode[]): OperateCityOption[] {
  return tree.flatMap((node) =>
    node.cities.map((city) => {
      const value = toOperateCityValue(node.province, city);
      return {
        value,
        label: formatOperateCityChipLabel(value),
        province: node.province,
      };
    }),
  );
}

export function matchOperateCityOption(option: OperateCityOption, query: string): boolean {
  const q = query.trim();
  if (!q) return true;
  return option.label.includes(q) || option.province.includes(q) || option.value.includes(q);
}

export function toOperateCityValue(province: string, city: string): string {
  if (!province) return '';
  if (MUNICIPALITIES.includes(province)) return `${province}-${province}`;
  if (!city || city === province) return province;
  return `${province}-${city}`;
}

/** 将「省-市」选择值写回 location 字段 */
export function operateCityValueToLocation(value: string): string {
  const { province, city } = parseRegionParts(value);
  if (!province) return value;
  if (MUNICIPALITIES.includes(province)) return province;
  if (!city || city === province) return province;
  return `${province}${city}`;
}
