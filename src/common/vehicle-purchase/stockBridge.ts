import type { StockedVehicleRecord } from './types';
import { loadStocked } from './storage';

/** 将验车入库记录映射为车辆资产列表可用的最小字段集 */
export function mapStockedToVehicleAsset(s: StockedVehicleRecord): Record<string, string> {
  const parts = String(s.brandModel || '').split(/\s+/);
  const brand = parts[0] || '待补充';
  const model = parts.slice(1).join(' ') || s.brandModel || '待补充';
  return {
    id: s.id,
    plateNo: '待上牌',
    vin: s.vin,
    vehicleNo: '-',
    color: '-',
    year: '-',
    purchaseDate: s.purchaseDate,
    parking: '-',
    ownership: '羚牛氢能科技(广东)有限公司',
    scrapDate: '-',
    ratingTime: '-',
    operateCompany: '羚牛氢能科技(广东)有限公司',
    vehicleSource: '采购入库',
    leaseCompany: '-',
    vehicleType: '-',
    brand,
    model,
    customer: '-',
    department: '运维部',
    manager: '-',
    contractNo: s.purchaseContractCode,
    operateStatus: '自营',
    vehicleStatus: s.status || '未备车',
    licenseStatus: '待办理',
    insuranceStatus: '待投保',
    mileage: '0',
    location: '-',
    locationAddress: '-',
    gpsTime: '-',
    regDate: '-',
    inspectExpire: '-',
    lastDeliveryTime: '-',
    lastDeliveryMile: '-',
    lastReturnTime: '-',
    lastReturnMile: '-',
    outStatus: '-',
    onlineStatus: '离线',
    projectName: `采购合同 ${s.purchaseContractCode}`,
  };
}

export function loadStockedAsVehicleAssets(): Record<string, string>[] {
  return loadStocked().map(mapStockedToVehicleAsset);
}
