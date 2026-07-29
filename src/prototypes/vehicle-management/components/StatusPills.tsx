import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import type { VehicleRecord } from '../types';
import { V2Tag } from '../../../resources/design-system/components/UIComponents';
import {
  formatOperateStatusLabel,
  resolveOperateStatus,
  resolveOperateStatusDescription,
  resolveVehicleStatusMeta,
} from '../utils/vehicle';

export type StatusTone = 'neutral' | 'warn' | 'ok' | 'err';

/** 运营状态胶囊：与列表台账 StatusPill 同源 */
export function resolveOperateStatusPill(
  row: Pick<VehicleRecord, 'operateStatus' | 'vehicleLedgerType'> | string,
): {
  label: string;
  tone: StatusTone;
  icon: 'clock' | 'check' | 'alert';
  tip: string;
} {
  const label = typeof row === 'string'
    ? formatOperateStatusLabel(row)
    : resolveOperateStatus(row);
  const tip = resolveOperateStatusDescription(row);
  if (label === '退出运营') return { label, tone: 'neutral', icon: 'clock', tip };
  if (label === '在库-不可交付' || label === '库存不可交付') {
    return { label: '在库-不可交付', tone: 'warn', icon: 'clock', tip };
  }
  if (label === '在库-可交付' || label === '库存可交付') {
    return { label: '在库-可交付', tone: 'ok', icon: 'check', tip };
  }
  if (label === '租赁' || label === '物流') return { label, tone: 'ok', icon: 'check', tip };
  return { label, tone: 'neutral', icon: 'clock', tip };
}

export function StatusPill({
  label,
  tone,
  icon,
  tip,
  compact = false,
  annotate = false,
}: {
  label: string;
  tone: StatusTone;
  icon: 'clock' | 'check' | 'alert';
  /** 悬停提示：运营状态定义 */
  tip?: string;
  compact?: boolean;
  /** 挂 Axhub 标注点（须页面内唯一） */
  annotate?: boolean;
}) {
  const Icon = icon === 'check' ? CheckCircle2 : icon === 'alert' ? AlertTriangle : Clock3;
  const title = tip || undefined;
  return (
    <span
      className={`va-status-pill va-status-${tone}${compact ? ' is-compact' : ''}`}
      data-annotation-id={annotate ? 'va-feat-operate-status' : undefined}
      title={title}
      aria-label={tip ? `${label}。${tip}` : label}
    >
      <Icon size={compact ? 12 : 14} aria-hidden />
      {label}
    </span>
  );
}

/** 车辆状态标签：车牌旁展示，规则对齐车辆状态说明图；悬停展示定义 */
export function VehicleStatusTag({
  status,
  /** 挂 Axhub 标注点（须页面内唯一，列表仅首行 / 详情开启） */
  annotate = false,
}: {
  status: string | undefined | null;
  annotate?: boolean;
}) {
  const meta = resolveVehicleStatusMeta(status);
  if (!meta) return null;
  const tip = meta.offline
    ? `${meta.description}（暂未上线）`
    : meta.description;
  const aria = `${meta.label}。${tip}`;
  return (
    <span
      className="va-vehicle-status-tags"
      data-annotation-id={annotate ? 'va-feat-vehicle-status' : undefined}
    >
      <V2Tag
        type={meta.tagType}
        size="small"
        variant="soft"
        title={tip}
        aria-label={aria}
      >
        {meta.label}
      </V2Tag>
      {meta.offline ? (
        <V2Tag
          type="warning"
          size="small"
          variant="soft"
          title="该车辆状态能力暂未上线，仅作展示。"
          aria-label={`${meta.label}暂未上线`}
        >
          暂未上线
        </V2Tag>
      ) : null}
    </span>
  );
}

/** 证照状态：与列表 va-lic-suite__status 同源 */
export function LicenseStatusPill({ status }: { status: string }) {
  const tone: StatusTone =
    status === '异常' ? 'err' : status === '正常' ? 'ok' : 'neutral';
  const Icon = tone === 'err' ? AlertTriangle : tone === 'ok' ? CheckCircle2 : Clock3;
  return (
    <span className={`va-lic-suite__status is-${tone}`}>
      <Icon size={11} aria-hidden />
      {status}
    </span>
  );
}

/** 保险总览状态：与列表 va-ins-compact__status 同源 */
export function InsuranceStatusPill({ label }: { label: string }) {
  const tone: 'ok' | 'warn' | 'err' =
    label === '异常' ? 'err' : label === '临期' ? 'warn' : 'ok';
  const Icon = tone === 'ok' ? ShieldCheck : tone === 'warn' ? Shield : ShieldAlert;
  return (
    <span className={`va-ins-compact__status is-${tone}`}>
      <Icon size={11} aria-hidden />
      {label}
    </span>
  );
}
