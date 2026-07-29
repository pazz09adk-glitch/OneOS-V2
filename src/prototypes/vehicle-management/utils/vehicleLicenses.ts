import type { VehicleRecord } from '../types';
import { daysUntilExpire, isEmpty } from './vehicle';

export type VehicleLicenseStatus = 'normal' | 'expiring' | 'expired' | 'missing';

export interface VehicleLicenseImage {
  id: string;
  src: string;
  alt: string;
}

export interface VehicleLicenseField {
  label: string;
  value: string;
  expiryDays?: number | null;
}

export interface VehicleLicenseGroup {
  id:
    | 'driver'
    | 'transport'
    | 'registration'
    | 'special-registration'
    | 'special-mark'
    | 'hydrogen-card'
    | 'safety-valve'
    | 'pressure-gauge';
  label: string;
  status: VehicleLicenseStatus;
  statusLabel: string;
  images: VehicleLicenseImage[];
  fields: VehicleLicenseField[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export const VEHICLE_LICENSE_STATUS_LABELS = Object.freeze({
  normal: '正常',
  expiring: '临期',
  expired: '已到期',
  /** 侧栏证照索引图例口径：缺日期（未维护有效期 / 未上传） */
  missing: '缺日期',
} satisfies Record<VehicleLicenseStatus, string>);

export const DRIVER_LICENSE_WARN_DAYS = 90;
export const STANDARD_LICENSE_WARN_DAYS = 60;

function normalizeLicenseValue(value: unknown): string {
  if (isEmpty(value)) return '—';
  const normalized = String(value).trim();
  if (normalized === '' || normalized === '-' || normalized === '—') return '—';
  return normalized;
}

function createGroup(
  group: Omit<VehicleLicenseGroup, 'statusLabel' | 'images'> & {
    images?: VehicleLicenseImage[];
  },
): VehicleLicenseGroup {
  return {
    ...group,
    statusLabel: VEHICLE_LICENSE_STATUS_LABELS[group.status],
    images: group.images ?? [],
  };
}

/** 原型演示用证照占位图（SVG data URL，可预览/下载） */
export function createDemoLicenseImage(
  id: string,
  title: string,
  side: string,
): VehicleLicenseImage {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">',
    '<rect width="960" height="600" fill="#F6F9FC"/>',
    '<rect x="36" y="36" width="888" height="528" rx="16" fill="#FFFFFF" stroke="#E3E8EE" stroke-width="2"/>',
    '<rect x="36" y="36" width="888" height="72" rx="16" fill="#E0E7FF"/>',
    `<text x="480" y="82" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="#0A2540">${title}</text>`,
    `<text x="480" y="300" text-anchor="middle" font-family="system-ui,sans-serif" font-size="40" font-weight="700" fill="#533AFD">${side}</text>`,
    '<text x="480" y="360" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="#425466">OneOS 证照管理 · 原型演示图</text>',
    '</svg>',
  ].join('');

  return {
    id,
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    alt: `${title} · ${side}`,
  };
}

export function licenseStatusFromDays(
  days: number | null,
  warnDays: number,
  hasDocument: boolean,
): VehicleLicenseStatus {
  if (!hasDocument) return 'missing';
  if (days === null) return 'normal';
  if (days < 0) return 'expired';
  if (days <= warnDays) return 'expiring';
  return 'normal';
}

export function resolveVehicleLicenses(
  record: VehicleRecord,
  referenceDate: Date = new Date(),
): VehicleLicenseGroup[] {
  const driverRegDate = normalizeLicenseValue(record.regDate);
  const driverScrapDate = normalizeLicenseValue(record.scrapDate);
  const driverInspectExpire = normalizeLicenseValue(record.inspectExpire);
  const hasDriverMetadata = [
    driverRegDate,
    driverScrapDate,
    driverInspectExpire,
  ].some((value) => value !== '—');
  const driverExpiryDays = driverInspectExpire === '—'
    ? null
    : daysUntilExpire(driverInspectExpire, referenceDate);
  const driverStatus = licenseStatusFromDays(
    driverExpiryDays,
    DRIVER_LICENSE_WARN_DAYS,
    hasDriverMetadata,
  );
  const missingStatus: VehicleLicenseStatus = 'missing';
  const hydrogenCardBound = record.telematicsLinked === true;
  const hydrogenCardStatus: VehicleLicenseStatus = hydrogenCardBound
    ? 'normal'
    : 'missing';

  const plate = String(record.plateNo || '车辆').trim() || '车辆';
  /** 未上传证照不挂演示图；已上传（含正常/临期/已过期）才提供可预览附件 */
  const driverImages = driverStatus === 'missing'
    ? []
    : [
      createDemoLicenseImage(`${record.id}-driver-front`, `${plate} 行驶证`, '正面'),
      createDemoLicenseImage(`${record.id}-driver-back`, `${plate} 行驶证`, '副页'),
    ];

  return [
    createGroup({
      id: 'driver',
      label: '行驶证',
      status: driverStatus,
      fields: [
        { label: '注册日期', value: driverRegDate },
        { label: '发证日期', value: '—' },
        { label: '强制报废日期', value: driverScrapDate },
        {
          label: '检验有效期至',
          value: driverInspectExpire,
          expiryDays: driverExpiryDays,
        },
      ],
      images: driverImages,
    }),
    createGroup({
      id: 'transport',
      label: '道路运输证',
      status: missingStatus,
      fields: [
        { label: '经营许可证号', value: '—' },
        { label: '核发时间', value: '—' },
        { label: '证件有效期', value: '—' },
        { label: '审验有效期', value: '—' },
      ],
      images: [],
    }),
    createGroup({
      id: 'registration',
      label: '登记证',
      status: missingStatus,
      fields: [
        { label: '登记证号', value: '—' },
        { label: '登记日期', value: '—' },
        { label: '所有权人', value: normalizeLicenseValue(record.ownership) },
      ],
      images: [],
    }),
    createGroup({
      id: 'special-registration',
      label: '特种设备使用登记证',
      status: missingStatus,
      fields: [
        { label: '登记证编号', value: '—' },
        { label: '发证日期', value: '—' },
        { label: '下次检验日期', value: '—' },
      ],
      images: [],
    }),
    createGroup({
      id: 'special-mark',
      label: '特种设备使用标识',
      status: missingStatus,
      fields: [
        { label: '下次检验日期', value: '—' },
      ],
      images: [],
    }),
    createGroup({
      id: 'hydrogen-card',
      label: '加氢卡',
      status: hydrogenCardStatus,
      fields: [
        {
          label: '绑定状态',
          value: hydrogenCardBound ? '已绑定' : '未绑定',
        },
      ],
      images: hydrogenCardBound
        ? [createDemoLicenseImage(`${record.id}-hydrogen`, `${plate} 加氢卡`, '卡片')]
        : [],
    }),
    createGroup({
      id: 'safety-valve',
      label: '安全阀',
      status: missingStatus,
      fields: [
        { label: '本次检验日期', value: '—' },
        { label: '下次检测日期', value: '—' },
      ],
      images: [],
    }),
    createGroup({
      id: 'pressure-gauge',
      label: '压力表',
      status: missingStatus,
      fields: [
        { label: '本次检验日期', value: '—' },
        { label: '下次检验日期', value: '—' },
      ],
      images: [],
    }),
  ];
}
