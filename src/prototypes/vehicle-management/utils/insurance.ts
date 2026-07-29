import type { InsurancePurchaseRecord, InsuranceType } from '../types';
import { daysUntilExpire, isEmpty } from './vehicle';

export interface VehicleInsuranceExpire {
  compulsory?: string;
  commercial?: string;
}

export type InsuranceCoverageState = 'not_purchased' | 'expired' | 'valid';
export type InsuranceDisplayStatus = '正常' | '临期' | '异常';

/** 临期窗口：交强/商业任一到期日在 N 天内（含当日） */
export const INSURANCE_EXPIRING_SOON_DAYS = 30;

export function getInsuranceCoverageState(expireDate?: string): InsuranceCoverageState {
  if (isEmpty(expireDate)) return 'not_purchased';
  const days = daysUntilExpire(expireDate!);
  if (days === null) return 'not_purchased';
  if (days < 0) return 'expired';
  return 'valid';
}

export function isInsuranceExpiringSoon(expireDate?: string): boolean {
  if (getInsuranceCoverageState(expireDate) !== 'valid') return false;
  const days = daysUntilExpire(expireDate!);
  return days !== null && days <= INSURANCE_EXPIRING_SOON_DAYS;
}

/**
 * 列表保险总览状态。
 * 临期：交强/商业任一 30 天内到期；不阻断交车，仅提示采购/运维关注续保。
 */
export function resolveInsuranceDisplayStatus(
  insurance: VehicleInsuranceExpire,
  recordStatus?: string,
): InsuranceDisplayStatus {
  const compulsory = getInsuranceCoverageState(insurance.compulsory);
  const commercial = getInsuranceCoverageState(insurance.commercial);
  if (
    recordStatus === '异常'
    || compulsory === 'not_purchased'
    || compulsory === 'expired'
    || commercial === 'not_purchased'
    || commercial === 'expired'
  ) {
    return '异常';
  }
  if (isInsuranceExpiringSoon(insurance.compulsory) || isInsuranceExpiringSoon(insurance.commercial)) {
    return '临期';
  }
  return '正常';
}

/** 保险状态悬浮提示：异常险种 + 临期关注提示 */
export function buildInsuranceStatusTooltip(insurance: VehicleInsuranceExpire): string | undefined {
  const hints: string[] = [];
  const compulsory = getInsuranceCoverageState(insurance.compulsory);
  const commercial = getInsuranceCoverageState(insurance.commercial);
  if (compulsory === 'not_purchased') hints.push('交强险未购买');
  else if (compulsory === 'expired') hints.push('交强险到期');
  else if (isInsuranceExpiringSoon(insurance.compulsory)) {
    const days = daysUntilExpire(insurance.compulsory!);
    hints.push(`交强险临期（剩${days}天）`);
  }
  if (commercial === 'not_purchased') hints.push('商业险未购买');
  else if (commercial === 'expired') hints.push('商业险到期');
  else if (isInsuranceExpiringSoon(insurance.commercial)) {
    const days = daysUntilExpire(insurance.commercial!);
    hints.push(`商业险临期（剩${days}天）`);
  }
  if (!hints.length) return undefined;
  const status = resolveInsuranceDisplayStatus(insurance);
  if (status === '临期') {
    hints.push('仍可正常交车，请采购部或运维部及时关注续保');
  }
  return hints.join('；');
}

function isNewerPurchase(
  candidate: InsurancePurchaseRecord,
  current: InsurancePurchaseRecord,
): boolean {
  const candidateAt = candidate.purchasedAt || candidate.expireDate;
  const currentAt = current.purchasedAt || current.expireDate;
  if (candidateAt !== currentAt) return candidateAt > currentAt;
  return candidate.id > current.id;
}

/** 按车辆汇总保险采购中各险种最新一条的到期日 */
export function buildInsuranceExpireMap(
  purchases: InsurancePurchaseRecord[],
): Map<string, VehicleInsuranceExpire> {
  const latestByVehicle = new Map<string, Map<InsuranceType, InsurancePurchaseRecord>>();

  for (const purchase of purchases) {
    let byType = latestByVehicle.get(purchase.vehicleId);
    if (!byType) {
      byType = new Map();
      latestByVehicle.set(purchase.vehicleId, byType);
    }
    const existing = byType.get(purchase.insuranceType);
    if (!existing || isNewerPurchase(purchase, existing)) {
      byType.set(purchase.insuranceType, purchase);
    }
  }

  const result = new Map<string, VehicleInsuranceExpire>();
  for (const [vehicleId, byType] of latestByVehicle) {
    result.set(vehicleId, {
      compulsory: byType.get('交强险')?.expireDate,
      commercial: byType.get('商业险')?.expireDate,
    });
  }
  return result;
}

export function resolveVehicleInsuranceExpire(
  vehicleId: string,
  expireMap: Map<string, VehicleInsuranceExpire>,
): VehicleInsuranceExpire {
  return expireMap.get(vehicleId) ?? {};
}
