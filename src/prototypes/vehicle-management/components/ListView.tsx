import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  AlertTriangle,
  Building,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileUp,
  Filter,
  Gauge,
  GripVertical,
  ChevronRight,
  MapPin,
  MapPinOff,
  Navigation,
  ParkingSquare,
  PencilLine,
  Radio,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Truck,
  Unlink,
  UserRoundX,
  Wrench,
} from 'lucide-react';
import type { KpiKey, VehicleFilters, VehicleRecord } from '../types';
import { EMPTY_FILTERS } from '../types';
import { applyFilters, buildOptions, buildOperateCityOptions } from '../utils/filters';
import { bindAutoEllipsisTitle } from '../utils/ellipsisTitle';
import {
  KPI_CARDS,
  AREA_REGION_OPTIONS,
  INSURANCE_STATUS_OPTIONS,
  OPERATE_STATUS_OPTIONS,
  VEHICLE_SOURCE_OPTIONS,
  canEditOperateCity,
  canOpenLocationMap,
  daysUntilExpire,
  displayText,
  formatGpsTime,
  formatMileage,
  formatOperateCityShort,
  isShanghaiPlate,
  formatParkingAreaDisplay,
  formatVehicleSourcePrimary,
  formatVehicleSourceSecondary,
  openLeaseContractDetail,
  resolveLicenseDisplayStatus,
  resolveMileageSource,
  resolveOperateCitySource,
  resolveOperateStatus,
  hasLastParkingArea,
  resolveOpsManagers,
  resolveProjectDelivery,
} from '../utils/vehicle';
import type { VehicleInsuranceExpire } from '../utils/insurance';
import {
  buildInsuranceStatusTooltip,
  getInsuranceCoverageState,
  isInsuranceExpiringSoon,
  resolveInsuranceDisplayStatus,
} from '../utils/insurance';
import {
  formatTaskRemainKm,
  resolveMileageTask,
  mileageForecastTip,
  mileageRemainMetaTip,
  type MileageTaskView,
} from '../utils/mileageTask';
import { DEFAULT_PAGE_SIZE } from '../../../common/TablePagination';
import { OperationActions } from '../../../common/OperationActions';
import { LnSelect } from '../../../common/ln-select';
import {
  V2Empty,
  V2FilterMoreButton,
  V2FilterSearch,
  V2Pagination,
} from '../../../resources/design-system/components/UIComponents';
import { OnLeaseFleetShare } from './OnLeaseFleetShare';
import {
  StatusPill,
  VehicleStatusTag,
  resolveOperateStatusPill,
  type StatusTone,
} from './StatusPills';

const PILL_LABELS: Record<string, string> = {
  all: '全部车辆',
  lease: '租赁',
  logistics: '物流',
  stock: '库存',
  nonOperating: '非运营',
  exit: '退出运营',
};

/** 「更多筛选」面板内字段（不含始终可见的车牌） */
const MORE_FILTER_KEYS: (keyof VehicleFilters)[] = [
  'areaRegion',
  'operateCities',
  'brand',
  'model',
  'customer',
  'department',
  'projectName',
  'projectType',
  'contractNo',
  'ownership',
  'operateCompany',
  'operateStatus',
  'vehicleSource',
  'leaseCompany',
  'parking',
  'licenseStatus',
  'insuranceStatus',
];

function countActiveMoreFilters(filters: VehicleFilters): number {
  return MORE_FILTER_KEYS.reduce((count, key) => {
    const value = filters[key];
    if (Array.isArray(value)) return count + (value.length > 0 ? 1 : 0);
    return count + (value && String(value).trim() ? 1 : 0);
  }, 0);
}

type InsPolicyTone = 'ok' | 'warn' | 'err';

interface InsPolicyView {
  label: string;
  tone: InsPolicyTone;
  dateText: string;
  hint: string;
}

function buildInsPolicyView(expireDate: string | undefined): InsPolicyView {
  const state = getInsuranceCoverageState(expireDate);
  if (state === 'not_purchased') {
    return { label: '未购买', tone: 'err', dateText: '未购买', hint: '未购买' };
  }
  const days = daysUntilExpire(expireDate || '');
  const dateText = (expireDate || '').slice(0, 10) || '—';
  if (state === 'expired' || (days !== null && days < 0)) {
    return {
      label: '已过期',
      tone: 'err',
      dateText,
      hint: days !== null ? `已过期 ${Math.abs(days)} 天` : '已过期',
    };
  }
  if (days !== null && isInsuranceExpiringSoon(expireDate)) {
    return { label: '临期', tone: 'warn', dateText, hint: `剩余 ${days} 天` };
  }
  return {
    label: '有效',
    tone: 'ok',
    dateText,
    hint: days !== null ? `剩余 ${days} 天` : '在保',
  };
}

function resolveInsuranceOverall(
  row: VehicleRecord,
  insurance: VehicleInsuranceExpire,
): { tone: InsPolicyTone; label: string } {
  const label = resolveInsuranceDisplayStatus(insurance, row.insuranceStatus);
  if (label === '异常') return { tone: 'err', label };
  if (label === '临期') return { tone: 'warn', label };
  return { tone: 'ok', label };
}

/** 城市来源：车机 / GPS / 人工 —— 图标 +「来源·xxx」；人工可点，带「修改」引导 */
function CitySourceMeta({
  source,
  onMaintain,
  annotate,
}: {
  source: '车机' | 'GPS' | '人工';
  onMaintain?: () => void;
  /** 首条人工来源挂标注点（页面内唯一） */
  annotate?: boolean;
}) {
  const Icon = source === '车机' ? Radio : source === 'GPS' ? Navigation : PencilLine;
  const tip =
    source === '车机'
      ? '运营城市来自车机上报，不可在此修改'
      : source === 'GPS'
        ? '运营城市来自 GPS 定位推算，不可在此修改'
        : '运营城市由人工维护，点击可修改';
  const className = `va-loc-source is-${source === '车机' ? 'telematics' : source === 'GPS' ? 'gps' : 'manual'}${source === '人工' && onMaintain ? ' is-action' : ''}`;

  if (source === '人工' && onMaintain) {
    return (
      <button
        type="button"
        className={className}
        title={tip}
        onClick={onMaintain}
        aria-label="来源·人工，点击修改运营城市"
        data-annotation-id={annotate ? 'va-feat-list-city-manual' : undefined}
      >
        <Icon size={11} aria-hidden />
        <span className="va-loc-source__text">来源·{source}</span>
        <span className="va-loc-source__hint" aria-hidden>
          修改
          <ChevronRight size={12} strokeWidth={2.25} />
        </span>
      </button>
    );
  }

  return (
    <span className={className} title={tip}>
      <Icon size={11} aria-hidden />
      <span className="va-loc-source__text">来源·{source}</span>
    </span>
  );
}

/** 车辆里程考核任务：上行=进度条+完成%+预判标签；下行=剩余公里·约剩余天数 */
function MileageTaskBlock({ task }: { task: MileageTaskView }) {
  if (!task.hasTask) {
    return (
      <div className="va-ops-empty is-static">
        <div
          className="va-ops-empty__card"
          role="status"
          aria-label="暂无车辆里程考核"
          title="暂无国家/地方政策要求的车辆里程考核任务"
        >
          <span className="va-ops-empty__icon" aria-hidden>
            <Gauge size={13} strokeWidth={2.25} />
          </span>
          <span className="va-ops-empty__copy">
            <span className="va-ops-empty__title">暂无车辆里程考核</span>
            <span className="va-ops-empty__meta">
              <span className="va-ops-empty__hint">无政策考核任务</span>
            </span>
          </span>
        </div>
      </div>
    );
  }

  const etaText = task.forecast === '已完成'
    ? null
    : task.estimatedDays === null
      ? '暂无法预计'
      : `约 ${task.estimatedDays} 天`;
  const forecastTip = mileageForecastTip(task);
  const remainTip = mileageRemainMetaTip(task);
  const metaText = task.forecast === '已完成'
    ? `剩 ${formatTaskRemainKm(0)} · 考核已完成`
    : `剩 ${formatTaskRemainKm(task.remainingKm)}${etaText ? ` · ${etaText}` : ''}`;

  return (
    <div
      className={`va-ledger-cell is-duo va-mile-task is-${task.tone}`}
      aria-label={`里程任务完成 ${task.percent}%${task.forecast ? `，${task.forecast}` : ''}`}
    >
      <div className="va-ledger-cell__mid va-mile-task__primary">
        <div className="va-mile-task__track" aria-hidden>
          <div className="va-mile-task__fill" style={{ width: `${task.percent}%` }} />
        </div>
        <span className="va-ledger-cell__title tabular-nums">{task.percent.toFixed(1)}%</span>
        {task.forecast && task.forecast !== '已完成' ? (
          <span
            className={`va-mile-task__forecast is-${task.tone}`}
            title={forecastTip}
          >
            {task.forecast}
          </span>
        ) : task.forecast === '已完成' ? (
          <span className="va-mile-task__forecast is-done" title={forecastTip}>已完成</span>
        ) : null}
      </div>
      <div
        className="va-ledger-cell__bot va-mile-task__meta"
        title={remainTip}
        data-full-title={metaText}
      >
        {metaText}
      </div>
    </div>
  );
}

/** 保险（三行）：上行状态 · 交强一行 · 商业一行（临期/到期色与证照列对齐） */
function InsuranceSuiteCell({
  row,
  insurance,
  onOpenPurchase,
}: {
  row: VehicleRecord;
  insurance: VehicleInsuranceExpire;
  onOpenPurchase: () => void;
}) {
  const compulsory = buildInsPolicyView(insurance.compulsory);
  const commercial = buildInsPolicyView(insurance.commercial);
  const overall = resolveInsuranceOverall(row, insurance);
  const OverallIcon = overall.tone === 'ok' ? ShieldCheck : overall.tone === 'warn' ? Shield : ShieldAlert;
  const statusTip = buildInsuranceStatusTooltip(insurance)
    || (overall.label === '正常' ? '保险在保有效' : undefined);

  const renderPolicyRow = (
    kind: '交强' | '商业',
    view: InsPolicyView,
  ) => {
    const showRemain = Boolean(view.hint)
      && view.hint !== view.dateText
      && (view.tone === 'warn' || view.tone === 'err');
    return (
      <div className="va-ledger-cell__bot va-ins-compact__row">
        <button
          type="button"
          className={`va-ins-compact__item is-${view.tone}`}
          onClick={onOpenPurchase}
          aria-label={`${kind}险 ${view.dateText}${showRemain ? `，${view.hint}` : ''}，点击前往保险采购`}
          title={view.hint !== view.dateText ? view.hint : undefined}
        >
          <span className="va-ins-compact__name">{kind}</span>
          <span className={`va-ins-compact__date is-${view.tone} tabular-nums`}>
            {view.dateText}
          </span>
          {showRemain ? (
            <span className={`va-ins-compact__remain tabular-nums is-${view.tone}`}>
              {view.hint}
            </span>
          ) : null}
        </button>
      </div>
    );
  };

  return (
    <div
      className={`va-ledger-cell is-trio va-ins-compact is-${overall.tone}`}
      role="group"
      aria-label={`保险${overall.label}；交强险${compulsory.dateText}；商业险${commercial.dateText}`}
    >
      <div className="va-ledger-cell__mid">
        <span
          className={`va-ins-compact__status is-${overall.tone}`}
          title={statusTip}
        >
          <OverallIcon size={11} aria-hidden />
          {overall.label}
        </span>
      </div>
      {renderPolicyRow('交强', compulsory)}
      {renderPolicyRow('商业', commercial)}
    </div>
  );
}

/** 停放区域：在库车显示停车场/维修站；缺失用警示空态；非在库用只读空态 */
function ParkingAreaCell({ row }: { row: VehicleRecord }) {
  const parking = formatParkingAreaDisplay(row);

  if (parking.variant === 'missing') {
    return (
      <div className="va-ops-empty is-nopark is-static">
        <div
          className="va-ops-empty__card"
          role="status"
          aria-label={`${parking.text}，${parking.hint}`}
          title={parking.title}
        >
          <span className="va-ops-empty__icon" aria-hidden>
            <AlertTriangle size={13} strokeWidth={2.25} />
          </span>
          <span className="va-ops-empty__copy">
            <span className="va-ops-empty__title">{parking.text}</span>
            <span className="va-ops-empty__meta">
              <span className="va-ops-empty__hint">{parking.hint}</span>
            </span>
          </span>
        </div>
      </div>
    );
  }

  if (parking.variant === 'na') {
    return (
      <div className="va-ops-empty is-static">
        <div
          className="va-ops-empty__card"
          role="status"
          aria-label={parking.text}
          title={parking.title}
        >
          <span className="va-ops-empty__icon" aria-hidden>
            <MapPinOff size={13} strokeWidth={2.25} />
          </span>
          <span className="va-ops-empty__copy">
            <span className="va-ops-empty__title">车辆未在库</span>
            <span className="va-ops-empty__meta">
              <span className="va-ops-empty__hint">{parking.hint}</span>
            </span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="va-ledger-cell is-duo"
      role="group"
      aria-label={`停放区域${parking.text}，${parking.caption}`}
    >
      <div className="va-ledger-cell__mid">
        <span
          className="va-ledger-cell__title"
          data-full-title={parking.text}
        >
          {parking.text}
        </span>
      </div>
      <div className="va-ledger-cell__bot">
        <span
          className={`va-parking-kind is-${parking.siteKind === 'repair' ? 'repair' : 'lot'}`}
        >
          <span className="va-parking-kind__icon" aria-hidden>
            {parking.siteKind === 'repair'
              ? <Wrench size={11} strokeWidth={2.25} />
              : <ParkingSquare size={11} strokeWidth={2.25} />}
          </span>
          <span className="va-cell-row--cap">{parking.caption}</span>
        </span>
      </div>
    </div>
  );
}

function OwnershipCell({ row }: { row: VehicleRecord }) {
  const hasOwnership = Boolean(row.ownership && row.ownership !== '-' && row.ownership !== '—');
  const ownership = hasOwnership ? row.ownership! : '未录入';
  return (
    <div className="va-ledger-cell is-duo" role="group" aria-label={`登记所有权${ownership}`}>
      <div className="va-ledger-cell__mid">
        <span
          className={`va-ledger-cell__title ${!hasOwnership ? 'is-muted' : ''}`}
          data-full-title={ownership}
        >
          {ownership}
        </span>
      </div>
      <div className="va-ledger-cell__bot">
        <span className="va-src-suite__own-label">登记所有权</span>
      </div>
    </div>
  );
}

/** 车辆来源：主行类型；辅行按自有/外租/挂靠展示说明或来源公司 */
function VehicleSourceCell({ row }: { row: VehicleRecord }) {
  const source = displayText(row.vehicleSource, '');
  const hasSource = Boolean(source);
  const primary = formatVehicleSourcePrimary(row, '未录入');
  const secondary = formatVehicleSourceSecondary(row, '—');
  return (
    <div className="va-ledger-cell is-duo va-src-suite" role="group" aria-label={`车辆来源${primary}，${secondary}`}>
      <div className="va-ledger-cell__mid">
        <span
          className={`va-ledger-cell__title va-src-suite__source ${!hasSource ? 'is-muted' : ''}`}
          data-full-title={primary}
        >
          {primary}
        </span>
      </div>
      <div className="va-ledger-cell__bot">
        <span className="va-src-suite__own-label" title={secondary}>{secondary}</span>
      </div>
    </div>
  );
}

/** 到期日 → 色调 +「剩余 / 已过期 N 天」文案 */
function buildExpireRemainView(dateRaw: string): {
  tone: 'ok' | 'warn' | 'err' | 'empty';
  hint: string;
} {
  if (!dateRaw) return { tone: 'empty', hint: '' };
  const days = daysUntilExpire(dateRaw);
  if (days === null) return { tone: 'empty', hint: '' };
  if (days < 0) return { tone: 'err', hint: `已过期 ${Math.abs(days)} 天` };
  if (days <= 30) return { tone: 'warn', hint: `剩余 ${days} 天` };
  return { tone: 'ok', hint: `剩余 ${days} 天` };
}

/** 证照：上行状态；下行行驶证到期；沪牌状态与剩余天数均按等级评定（特例） */
function LicenseSuiteCell({ row }: { row: VehicleRecord }) {
  const status = resolveLicenseDisplayStatus(row);
  const statusTone: StatusTone =
    status === '异常' ? 'err' : status === '正常' ? 'ok' : 'neutral';
  const StatusIcon = statusTone === 'err' ? AlertTriangle : statusTone === 'ok' ? CheckCircle2 : Clock3;

  const shanghai = isShanghaiPlate(row.plateNo);
  const expireRaw = row.inspectExpire && row.inspectExpire !== '-' && row.inspectExpire !== '—' ? row.inspectExpire.slice(0, 10) : '';
  const ratingRaw = row.ratingTime && row.ratingTime !== '-' && row.ratingTime !== '—' ? row.ratingTime.slice(0, 10) : '';

  // 非沪牌：剩余天数看行驶证检验有效期；沪牌：剩余天数只看等级评定时间
  const inspectRemain = buildExpireRemainView(expireRaw);
  const ratingRemain = buildExpireRemainView(ratingRaw);
  const remainSource = shanghai ? ratingRemain : inspectRemain;
  const remainHint = remainSource.hint;
  const remainTone = remainSource.tone;
  const inspectDateTone = inspectRemain.tone;
  const ratingDateTone = ratingRemain.tone;

  return (
    <div
      className={`va-ledger-cell ${shanghai ? 'is-trio' : 'is-duo'} va-lic-suite`}
      role="group"
      aria-label={
        shanghai
          ? `证照${status}（沪牌按等级评定判定）；行驶证检验有效期${expireRaw || '无'}；等级评定${ratingRaw || '无'}${remainHint ? `，${remainHint}` : ''}`
          : `证照${status}；行驶证检验有效期${expireRaw || '无'}${remainHint ? `，${remainHint}` : ''}`
      }
    >
      <div className="va-ledger-cell__mid">
        <span
          className={`va-lic-suite__status is-${statusTone}`}
          title={shanghai ? '沪牌证照状态按等级评定时间判定，不以行驶证检验有效期为准' : undefined}
        >
          <StatusIcon size={11} aria-hidden />
          {status}
        </span>
      </div>
      <div className="va-ledger-cell__bot va-lic-suite__row">
        <span className="va-lic-suite__name">行驶证</span>
        {expireRaw ? (
          <span
            className={`va-lic-suite__date tabular-nums is-${inspectDateTone}`}
            title={shanghai ? '沪牌证照状态与剩余天数按等级评定时间计算，不以本检验有效期为准' : (inspectRemain.hint || '行驶证检验到期')}
          >
            {expireRaw}
          </span>
        ) : (
          <span className="va-lic-suite__date is-empty">未录入</span>
        )}
        {!shanghai && remainHint ? (
          <span className={`va-lic-suite__remain tabular-nums is-${remainTone}`}>
            {remainHint}
          </span>
        ) : null}
      </div>
      {shanghai ? (
        <div className="va-ledger-cell__bot va-lic-suite__row is-rating">
          <span className="va-lic-suite__name">等级评定</span>
          {ratingRaw ? (
            <span
              className={`va-lic-suite__date tabular-nums is-${ratingDateTone}`}
              title={ratingRemain.hint || '等级评定到期（沪牌证照状态与剩余天数依据）'}
            >
              {ratingRaw}
            </span>
          ) : (
            <span className="va-lic-suite__date is-empty">未评定</span>
          )}
          {remainHint ? (
            <span className={`va-lic-suite__remain tabular-nums is-${remainTone}`}>
              {remainHint}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export interface ColumnConfig {
  key: string;
  label: string;
  required?: boolean;
}

export const ALL_COLUMNS: ColumnConfig[] = [
  { key: 'brand', label: '品牌型号', required: true },
  { key: 'plate', label: '车牌 / 车辆识别代码', required: true },
  { key: 'location', label: '运营城市' },
  { key: 'customer', label: '运营状态 / 客户' },
  { key: 'contract', label: '合同 / 项目' },
  { key: 'biz', label: '业务部门 / 经理' },
  { key: 'parking', label: '停放区域' },
  { key: 'ownership', label: '登记所有权' },
  { key: 'source', label: '车辆来源' },
  { key: 'lic', label: '证照' },
  { key: 'ins', label: '保险' },
  { key: 'mile', label: '里程' },
  { key: 'mileTask', label: '车辆里程考核任务' },
  { key: 'ops', label: '运维负责人' },
  { key: 'actions', label: '操作', required: true },
];

export const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  brand: 180,
  /** 第1行：车牌 +「查看」+ 车辆状态；第2行：车辆识别代码 */
  plate: 248,
  /** 省市 + 来源 + 更新日期（到分钟） */
  location: 280,
  customer: 220,
  contract: 288,
  biz: 188,
  parking: 220,
  ownership: 280,
  source: 200,
  lic: 248,
  ins: 280,
  mile: 132,
  mileTask: 240,
  ops: 280,
  actions: 184,
};

const DEFAULT_VISIBLE_COLS: Record<string, boolean> = ALL_COLUMNS.reduce((acc, col) => {
  acc[col.key] = true;
  return acc;
}, {} as Record<string, boolean>);

const FIXED_LEFT_COLS = ['brand', 'plate'] as const;
const FIXED_RIGHT_COLS = ['actions'] as const;
const DEFAULT_COLUMN_ORDER = ALL_COLUMNS.map((col) => col.key);

function isFixedColumn(key: string): boolean {
  return (FIXED_LEFT_COLS as readonly string[]).includes(key)
    || (FIXED_RIGHT_COLS as readonly string[]).includes(key);
}

/** 仅允许中间业务列互调顺序；左右冻结列始终钉在两端 */
function reorderColumnOrder(order: string[], fromKey: string, toKey: string): string[] {
  if (fromKey === toKey || isFixedColumn(fromKey) || isFixedColumn(toKey)) return order;
  const left = FIXED_LEFT_COLS.filter((k) => order.includes(k));
  const right = FIXED_RIGHT_COLS.filter((k) => order.includes(k));
  const middle = order.filter((k) => !isFixedColumn(k));
  const from = middle.indexOf(fromKey);
  const to = middle.indexOf(toKey);
  if (from < 0 || to < 0) return order;
  const nextMiddle = [...middle];
  nextMiddle.splice(from, 1);
  nextMiddle.splice(to, 0, fromKey);
  const known = new Set<string>([...left, ...nextMiddle, ...right]);
  const extras = order.filter((k) => !known.has(k) && !isFixedColumn(k));
  return [...left, ...nextMiddle, ...extras, ...right];
}

function normalizeColumnOrder(order: string[]): string[] {
  const seen = new Set<string>();
  const cleaned = order.filter((key) => {
    if (!ALL_COLUMNS.some((col) => col.key === key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  ALL_COLUMNS.forEach((col) => {
    if (!seen.has(col.key)) cleaned.push(col.key);
  });
  const left = FIXED_LEFT_COLS.filter((k) => cleaned.includes(k));
  const right = FIXED_RIGHT_COLS.filter((k) => cleaned.includes(k));
  const middle = cleaned.filter((k) => !isFixedColumn(k));
  return [...left, ...middle, ...right];
}

export interface ListViewProps {
  records: VehicleRecord[];
  kpiCounts: Record<KpiKey, number>;
  kpiTab: KpiKey;
  onKpiChange: (key: KpiKey) => void;
  pendingFilters: VehicleFilters;
  appliedFilters: VehicleFilters;
  onPendingChange: (next: VehicleFilters) => void;
  onSearch: (nextFilters?: VehicleFilters) => void;
  onReset: () => void;
  filtered: VehicleRecord[];
  insuranceMap: Map<string, VehicleInsuranceExpire>;
  onOpenDetail: (record: VehicleRecord) => void;
  onExport: () => void;
  onImportOpen: () => void;
  onOps: (record: VehicleRecord) => void;
  onOperateCity: (record: VehicleRecord) => void;
  onMap: (record: VehicleRecord) => void;
  onEdit: (record: VehicleRecord) => void;
  onToast: (msg: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  /** 看板等非表格内容：有值时仍展示 KPI + 筛选条，下方替换台账表 */
  boardContent?: React.ReactNode;
}

export function ListView(props: ListViewProps) {
  const {
    records, kpiCounts, kpiTab, onKpiChange,
    pendingFilters, appliedFilters, onPendingChange, onSearch, onReset,
    filtered, insuranceMap, onOpenDetail, onExport, onImportOpen,
    onOps, onOperateCity, onMap, onEdit, onToast,
    page, pageSize, onPageChange, onPageSizeChange,
    boardContent,
  } = props;
  const isBoard = Boolean(boardContent);

  const [moreFilters, setMoreFilters] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const activeMoreFilterCount = useMemo(
    () => countActiveMoreFilters(appliedFilters),
    [appliedFilters],
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobileViewport(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const liveMatchCount = useMemo(() => {
    return applyFilters(records, pendingFilters).length;
  }, [records, pendingFilters]);

  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(DEFAULT_VISIBLE_COLS);
  const [tempVisibleCols, setTempVisibleCols] = useState<Record<string, boolean>>(DEFAULT_VISIBLE_COLS);
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_COLUMN_ORDER);
  const [tempColumnOrder, setTempColumnOrder] = useState<string[]>(DEFAULT_COLUMN_ORDER);
  const [dragColKey, setDragColKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [colSettingsOpen, setColSettingsOpen] = useState(false);

  const [colWidths, setColWidths] = useState<Record<string, number>>(DEFAULT_COLUMN_WIDTHS);
  const [resizingCol, setResizingCol] = useState<string | null>(null);

  const orderedColumns = useMemo(
    () => normalizeColumnOrder(columnOrder)
      .map((key) => ALL_COLUMNS.find((col) => col.key === key))
      .filter((col): col is ColumnConfig => Boolean(col)),
    [columnOrder],
  );
  const tempOrderedColumns = useMemo(
    () => normalizeColumnOrder(tempColumnOrder)
      .map((key) => ALL_COLUMNS.find((col) => col.key === key))
      .filter((col): col is ColumnConfig => Boolean(col)),
    [tempColumnOrder],
  );

  const colSettingsRef = useRef<HTMLDivElement | null>(null);
  const ledgerStackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = ledgerStackRef.current;
    if (!root) return undefined;
    return bindAutoEllipsisTitle(root);
  }, []);

  const handleResizeStart = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = colWidths[key] || DEFAULT_COLUMN_WIDTHS[key] || 150;
    setResizingCol(key);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const minW = key === 'actions'
        ? DEFAULT_COLUMN_WIDTHS.actions
        : key === 'plate'
          ? 176
          : key === 'ops'
            ? 240
            : 90;
      const newW = Math.max(minW, startWidth + deltaX);
      setColWidths((prev) => ({
        ...prev,
        [key]: newW,
      }));
    };

    const onMouseUp = () => {
      setResizingCol(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    if (!colSettingsOpen) return undefined;
    const handleClickOutside = (e: MouseEvent) => {
      if (colSettingsRef.current && !colSettingsRef.current.contains(e.target as Node)) {
        setColSettingsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setColSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [colSettingsOpen]);

  const brands = useMemo(() => buildOptions(records, 'brand'), [records]);
  const models = useMemo(() => buildOptions(records, 'model'), [records]);
  const customers = useMemo(() => buildOptions(records, 'customer'), [records]);
  const departments = useMemo(() => buildOptions(records, 'department'), [records]);
  const projects = useMemo(() => buildOptions(records, 'projectName'), [records]);
  const contractNos = useMemo(() => buildOptions(records, 'contractNo'), [records]);
  const ownerships = useMemo(() => buildOptions(records, 'ownership'), [records]);
  const operateCompanies = useMemo(() => buildOptions(records, 'operateCompany'), [records]);
  const leaseCompanies = useMemo(() => buildOptions(records, 'leaseCompany'), [records]);
  const parkings = useMemo(() => buildOptions(records, 'parking'), [records]);
  const cities = useMemo(() => buildOperateCityOptions(records), [records]);
  const plates = useMemo(() => buildOptions(records, 'plateNo'), [records]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const runSearch = () => {
    onSearch(pendingFilters);
    setMoreFilters(false);
  };

  const patchFilters = (patch: Partial<VehicleFilters>) => {
    const next = { ...pendingFilters, ...patch };
    /* 手动改品牌 / 型号时，清掉车型占比卡挂起的隐藏键，避免双重过滤 */
    if ('brand' in patch || 'model' in patch) {
      next.fleetCardKey = '';
      next.fleetModelKeys = [];
    }
    onPendingChange(next);
  };

  /** 车型占比卡：直接按品牌 / 型号刷列表，不展开更多筛选 */
  const handleFleetCardFilter = (next: VehicleFilters) => {
    if (kpiTab !== 'all') onKpiChange('all');
    setMoreFilters(false);
    onSearch(next);
  };

  return (
    <div
      ref={ledgerStackRef}
      className={`va-ledger-stack${isBoard ? ' is-board' : ''}`}
      data-annotation-id="va-feat-list-overview"
    >
      <OnLeaseFleetShare
        records={records}
        activeFilters={appliedFilters}
        onFilterByCard={handleFleetCardFilter}
      />

      <section
        className="va-filter-panel"
        aria-label={isBoard ? '看板筛选' : '列表筛选'}
        data-annotation-id="va-feat-list-filter"
      >
        <div className="va-ledger-toolbar">
          <div className="va-pills" role="tablist" aria-label="车辆分类">
            {KPI_CARDS.map((card) => (
              <button
                key={card.key}
                type="button"
                role="tab"
                aria-selected={kpiTab === card.key}
                className={`va-pill ${kpiTab === card.key ? 'active' : ''}`}
                onClick={() => onKpiChange(card.key)}
              >
                {PILL_LABELS[card.key]}
                <span className="va-pill-count">({kpiCounts[card.key]})</span>
              </button>
            ))}
          </div>

          <div className="va-ledger-actions">
            <V2FilterSearch className="va-search-wrap-select" aria-label="车牌多选">
              <LnSelect
                id="va-plate"
                multiple
                allowPaste
                acceptUnmatchedPaste
                searchable
                options={plates}
                value={pendingFilters.plateNos}
                emptyLabel="搜索车牌 / 粘贴同列"
                ariaLabel="车牌多选"
                onChange={(next) => {
                  const plateNos = Array.isArray(next) ? next : (next ? [next] : []);
                  const patched = { ...pendingFilters, plateNos };
                  onPendingChange(patched);
                  onSearch(patched);
                }}
              />
            </V2FilterSearch>
            <V2FilterMoreButton
              open={moreFilters}
              activeCount={activeMoreFilterCount}
              onClick={() => setMoreFilters((v) => !v)}
            />
            <div className="va-ledger-io" data-annotation-id="va-feat-list-import-export">
            <button type="button" className="va-btn va-btn-secondary" onClick={onExport}>
              <Download size={14} aria-hidden />
              导出
            </button>
            <button type="button" className="va-btn va-btn-secondary" onClick={onImportOpen}>
              <FileUp size={16} aria-hidden />
              批量导入
            </button>

            {!isBoard ? (
              <>
                <div className="va-action-divider" aria-hidden />

                <div className="va-tool-group" role="toolbar" aria-label="台账控制工具">
                  <div className="va-col-settings-wrap" ref={colSettingsRef}>
                    <button
                      type="button"
                      className={`va-tool-btn${colSettingsOpen ? ' is-active' : ''}`}
                      onClick={() => {
                        if (!colSettingsOpen) {
                          setTempVisibleCols(visibleCols);
                          setTempColumnOrder(normalizeColumnOrder(columnOrder));
                          setDragColKey(null);
                          setDragOverKey(null);
                        }
                        setColSettingsOpen((v) => !v);
                      }}
                      title="列表设置（自定义显隐与列顺序）"
                      aria-label="列表设置（自定义显隐与列顺序）"
                      aria-expanded={colSettingsOpen}
                      aria-controls="va-col-settings-popover"
                    >
                      <Settings size={15} aria-hidden />
                    </button>

                    {colSettingsOpen ? (
                      <div
                        id="va-col-settings-popover"
                        className="va-col-settings-popover"
                        role="dialog"
                        aria-label="列表列显隐与顺序设置"
                      >
                        <div className="va-col-settings-header">
                          <label className="va-col-settings-all">
                            <input
                              type="checkbox"
                              checked={ALL_COLUMNS.every((c) => tempVisibleCols[c.key])}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const next = { ...tempVisibleCols };
                                ALL_COLUMNS.forEach((c) => {
                                  if (!c.required) next[c.key] = checked;
                                });
                                setTempVisibleCols(next);
                              }}
                            />
                            <span>全部列</span>
                          </label>
                          <button
                            type="button"
                            className="va-col-settings-reset"
                            onClick={() => {
                              setTempVisibleCols(DEFAULT_VISIBLE_COLS);
                              setTempColumnOrder(DEFAULT_COLUMN_ORDER);
                              setColWidths(DEFAULT_COLUMN_WIDTHS);
                              onToast('已恢复默认列宽、显隐与顺序');
                            }}
                          >
                            恢复默认
                          </button>
                        </div>
                        <p className="va-col-settings-hint">按住左侧把手拖拽，可调整中间列顺序</p>
                        <div className="va-col-settings-list">
                          {tempOrderedColumns.map((col) => {
                            const fixed = isFixedColumn(col.key);
                            return (
                              <div
                                key={col.key}
                                className={[
                                  'va-col-settings-item',
                                  fixed ? 'is-required' : '',
                                  dragColKey === col.key ? 'is-dragging' : '',
                                  dragOverKey === col.key && dragColKey !== col.key ? 'is-drag-over' : '',
                                ].filter(Boolean).join(' ')}
                                onDragOver={(e) => {
                                  if (fixed || !dragColKey || dragColKey === col.key) return;
                                  e.preventDefault();
                                  e.dataTransfer.dropEffect = 'move';
                                  if (dragOverKey !== col.key) setDragOverKey(col.key);
                                }}
                                onDragLeave={() => {
                                  if (dragOverKey === col.key) setDragOverKey(null);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const fromKey = e.dataTransfer.getData('text/va-col-key') || dragColKey;
                                  if (!fromKey || fixed) return;
                                  setTempColumnOrder((prev) => reorderColumnOrder(prev, fromKey, col.key));
                                  setDragColKey(null);
                                  setDragOverKey(null);
                                }}
                              >
                                <button
                                  type="button"
                                  className={`va-col-settings-handle${fixed ? ' is-disabled' : ''}`}
                                  draggable={!fixed}
                                  disabled={fixed}
                                  aria-label={fixed ? `「${col.label}」为固定列` : `拖拽调整「${col.label}」顺序`}
                                  title={fixed ? '固定列不可调整顺序' : '按住拖拽调整列顺序'}
                                  onDragStart={(e) => {
                                    if (fixed) {
                                      e.preventDefault();
                                      return;
                                    }
                                    e.dataTransfer.effectAllowed = 'move';
                                    e.dataTransfer.setData('text/va-col-key', col.key);
                                    e.dataTransfer.setData('text/plain', col.key);
                                    setDragColKey(col.key);
                                    setDragOverKey(null);
                                  }}
                                  onDragEnd={() => {
                                    setDragColKey(null);
                                    setDragOverKey(null);
                                  }}
                                >
                                  <GripVertical size={16} strokeWidth={2.25} aria-hidden />
                                </button>
                                <label className="va-col-settings-check">
                                  <input
                                    type="checkbox"
                                    checked={tempVisibleCols[col.key] ?? true}
                                    disabled={col.required}
                                    onChange={(e) => {
                                      if (col.required) return;
                                      setTempVisibleCols({
                                        ...tempVisibleCols,
                                        [col.key]: e.target.checked,
                                      });
                                    }}
                                  />
                                  <span>{col.label}</span>
                                </label>
                                {fixed ? <span className="va-col-required-tag">固定</span> : null}
                              </div>
                            );
                          })}
                        </div>
                        <div className="va-col-settings-footer">
                          <button
                            type="button"
                            className="va-btn va-btn-ghost va-btn-sm"
                            onClick={() => {
                              setDragColKey(null);
                              setDragOverKey(null);
                              setColSettingsOpen(false);
                            }}
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            className="va-btn va-btn-primary va-btn-sm"
                            onClick={() => {
                              setVisibleCols(tempVisibleCols);
                              setColumnOrder(normalizeColumnOrder(tempColumnOrder));
                              setDragColKey(null);
                              setDragOverKey(null);
                              setColSettingsOpen(false);
                              onToast('已更新列表显隐与列顺序');
                            }}
                          >
                            确认
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            ) : null}
            </div>
          </div>
        </div>

        <div className={`va-more-filters-panel${moreFilters ? ' is-open' : ''}`} aria-label="更多高阶筛选">
          <div className="va-more-filters-inner">
            <div className="va-more-filters-card">
              <div className="va-more-filters-header">
                <div className="va-more-filters-title-group">
                  <div className="va-more-filters-icon-badge" aria-hidden>
                    <Filter size={14} />
                  </div>
                  <div className="va-more-filters-main-title">
                    <span>高阶维度筛选</span>
                    {activeMoreFilterCount > 0 ? (
                      <span className="va-more-filters-badge">已激活 {activeMoreFilterCount} 项过滤条件</span>
                    ) : (
                      <span className="va-more-filters-sub">支持多选 / 粘贴 / 分类下钻精准查车</span>
                    )}
                  </div>
                </div>
                <div className="va-more-filters-header-actions">
                  {activeMoreFilterCount > 0 ? (
                    <button
                      type="button"
                      className="va-btn-text-danger"
                      onClick={() => {
                        onPendingChange(EMPTY_FILTERS);
                        onReset();
                        setMoreFilters(false);
                        onToast('已清空全部筛选条件');
                      }}
                    >
                      <Trash2 size={13} aria-hidden />
                      <span>清空条件草稿</span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="va-more-filters-body">
                {/* 1. 地理与场地 */}
                <div className="va-filter-group">
                  <div className="va-filter-group-header">
                    <MapPin size={13} className="va-filter-group-icon" aria-hidden />
                    <span>地理与场地</span>
                    <span className="va-filter-group-line" aria-hidden />
                  </div>
                  <div className="va-filter-group-grid">
                    <div className="va-field">
                      <label htmlFor="va-city">运营城市</label>
                      <LnSelect
                        id="va-city"
                        multiple
                        options={cities}
                        value={pendingFilters.operateCities}
                        ariaLabel="运营城市"
                        onChange={(next) => patchFilters({
                          operateCities: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                    <div className="va-field">
                      <label htmlFor="va-region">区域（大区）</label>
                      <LnSelect
                        id="va-region"
                        multiple
                        options={[...AREA_REGION_OPTIONS]}
                        value={pendingFilters.areaRegion}
                        ariaLabel="区域大区"
                        emptyLabel="请选择中国大区"
                        onChange={(next) => patchFilters({
                          areaRegion: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                    <div className="va-field">
                      <label htmlFor="va-parking">停车场</label>
                      <LnSelect
                        id="va-parking"
                        multiple
                        options={parkings}
                        value={pendingFilters.parking}
                        ariaLabel="停车场"
                        onChange={(next) => patchFilters({
                          parking: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. 车辆与资产 */}
                <div className="va-filter-group">
                  <div className="va-filter-group-header">
                    <Truck size={13} className="va-filter-group-icon" aria-hidden />
                    <span>车辆与资产</span>
                    <span className="va-filter-group-line" aria-hidden />
                  </div>
                  <div className="va-filter-group-grid">
                    <div className="va-field">
                      <label htmlFor="va-brand">品牌</label>
                      <LnSelect
                        id="va-brand"
                        multiple
                        options={brands}
                        value={pendingFilters.brand}
                        ariaLabel="品牌"
                        onChange={(next) => patchFilters({
                          brand: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                    <div className="va-field">
                      <label htmlFor="va-model">型号</label>
                      <LnSelect
                        id="va-model"
                        multiple
                        options={models}
                        value={pendingFilters.model}
                        ariaLabel="型号"
                        onChange={(next) => patchFilters({
                          model: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                    <div className="va-field">
                      <label htmlFor="va-source">车辆来源</label>
                      <LnSelect
                        id="va-source"
                        multiple
                        options={[...VEHICLE_SOURCE_OPTIONS]}
                        value={pendingFilters.vehicleSource}
                        ariaLabel="车辆来源"
                        onChange={(next) => patchFilters({
                          vehicleSource: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                    <div className="va-field">
                      <label htmlFor="va-ownership">登记所有权</label>
                      <LnSelect
                        id="va-ownership"
                        multiple
                        options={ownerships}
                        value={pendingFilters.ownership}
                        ariaLabel="登记所有权"
                        onChange={(next) => patchFilters({
                          ownership: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                    <div className="va-field">
                      <label htmlFor="va-op-company">运营公司</label>
                      <LnSelect
                        id="va-op-company"
                        multiple
                        options={operateCompanies}
                        value={pendingFilters.operateCompany}
                        ariaLabel="运营公司"
                        onChange={(next) => patchFilters({
                          operateCompany: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                    <div className="va-field">
                      <label htmlFor="va-lease-company">租赁公司</label>
                      <LnSelect
                        id="va-lease-company"
                        multiple
                        options={leaseCompanies}
                        value={pendingFilters.leaseCompany}
                        ariaLabel="租赁公司"
                        onChange={(next) => patchFilters({
                          leaseCompany: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. 业务与项目 */}
                <div className="va-filter-group">
                  <div className="va-filter-group-header">
                    <Building2 size={13} className="va-filter-group-icon" aria-hidden />
                    <span>业务与项目</span>
                    <span className="va-filter-group-line" aria-hidden />
                  </div>
                  <div className="va-filter-group-grid">
                    <div className="va-field">
                      <label htmlFor="va-customer">客户名称</label>
                      <LnSelect
                        id="va-customer"
                        multiple
                        options={customers}
                        value={pendingFilters.customer}
                        ariaLabel="客户名称"
                        onChange={(next) => patchFilters({
                          customer: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                    <div className="va-field">
                      <label htmlFor="va-dept">归属业务部门</label>
                      <LnSelect
                        id="va-dept"
                        multiple
                        options={departments}
                        value={pendingFilters.department}
                        ariaLabel="归属业务部门"
                        emptyLabel="请选择归属业务部门"
                        onChange={(next) => patchFilters({
                          department: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                    <div className="va-field">
                      <label htmlFor="va-project">项目名称</label>
                      <LnSelect
                        id="va-project"
                        multiple
                        options={projects}
                        value={pendingFilters.projectName}
                        ariaLabel="项目名称"
                        onChange={(next) => patchFilters({
                          projectName: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                    <div className="va-field">
                      <label htmlFor="va-biz-type">业务类型</label>
                      <LnSelect
                        id="va-biz-type"
                        multiple
                        options={['租赁', '物流']}
                        value={pendingFilters.projectType}
                        ariaLabel="业务类型"
                        emptyLabel="界定租赁或物流"
                        onChange={(next) => patchFilters({
                          projectType: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                    <div className="va-field">
                      <label htmlFor="va-contract">合同编码</label>
                      <LnSelect
                        id="va-contract"
                        multiple
                        options={contractNos}
                        value={pendingFilters.contractNo}
                        ariaLabel="合同编码"
                        onChange={(next) => patchFilters({
                          contractNo: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. 状态与合规 */}
                <div className="va-filter-group">
                  <div className="va-filter-group-header">
                    <ShieldCheck size={13} className="va-filter-group-icon" aria-hidden />
                    <span>状态与合规</span>
                    <span className="va-filter-group-line" aria-hidden />
                  </div>
                  <div className="va-filter-group-grid">
                    <div className="va-field">
                      <label htmlFor="va-status">运营状态</label>
                      <LnSelect
                        id="va-status"
                        multiple
                        options={[...OPERATE_STATUS_OPTIONS]}
                        value={pendingFilters.operateStatus}
                        ariaLabel="运营状态"
                        onChange={(next) => patchFilters({
                          operateStatus: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                    <div className="va-field">
                      <label htmlFor="va-license">证照状态</label>
                      <LnSelect
                        id="va-license"
                        multiple
                        options={['正常', '异常']}
                        value={pendingFilters.licenseStatus}
                        ariaLabel="证照状态"
                        onChange={(next) => patchFilters({
                          licenseStatus: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                    <div className="va-field">
                      <label htmlFor="va-ins">保险状态</label>
                      <LnSelect
                        id="va-ins"
                        multiple
                        options={INSURANCE_STATUS_OPTIONS}
                        value={pendingFilters.insuranceStatus}
                        ariaLabel="保险状态"
                        onChange={(next) => patchFilters({
                          insuranceStatus: Array.isArray(next) ? next : (next ? [next] : []),
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="va-more-filters-footer">
                <div className="va-more-filters-meta">
                  <span className="va-meta-item">
                    预测匹配：<strong className="tabular-nums">{liveMatchCount}</strong> 辆车
                  </span>
                  {activeMoreFilterCount > 0 ? (
                    <span className="va-meta-item is-active">
                      已激活 <strong className="tabular-nums">{activeMoreFilterCount}</strong> 项筛选条件
                    </span>
                  ) : null}
                </div>

                <div className="va-more-filters-btns">
                  <button
                    type="button"
                    className="va-btn va-btn-secondary"
                    onClick={() => {
                      onPendingChange(EMPTY_FILTERS);
                      onReset();
                      setMoreFilters(false);
                    }}
                  >
                    重置
                  </button>
                  <button
                    type="button"
                    className="va-btn va-btn-ghost"
                    onClick={() => setMoreFilters(false)}
                  >
                    收起面板
                  </button>
                  <button
                    type="button"
                    className="va-btn va-btn-primary"
                    onClick={runSearch}
                  >
                    <Search size={14} aria-hidden />
                    <span>查询（{liveMatchCount} 辆）</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isBoard ? (
        <div className="va-board-surface" aria-label="看板内容">
          {boardContent}
        </div>
      ) : (
      <section
        className="va-table-section"
        aria-label="车辆列表"
        data-annotation-id="va-feat-list-columns"
      >
        {paged.length === 0 ? (
          <V2Empty
            type="no_search"
            size="small"
            title="暂无匹配车辆"
            description=""
            primaryActionText=""
          />
        ) : isMobileViewport ? (
          <div className="va-mobile-card-list" aria-label="车辆卡片列表">
            {paged.map((row, rowIndex) => {
              const brandModel = `${displayText(row.brand)}·${displayText(row.model)}`;
              const statusLabel = resolveOperateStatus(row);
              return (
                <article key={row.id} className="va-mobile-card">
                  <button
                    type="button"
                    className="va-mobile-card__main"
                    onClick={() => onOpenDetail(row)}
                    aria-label={`${row.plateNo}，查看详情`}
                  >
                    <div className="va-mobile-card__plate-row">
                      <div className="va-mobile-card__plate tabular-nums">{row.plateNo}</div>
                      <VehicleStatusTag status={row.vehicleStatus} annotate={rowIndex === 0} />
                    </div>
                    <div className="va-mobile-card__meta">{brandModel}</div>
                    <div className="va-mobile-card__meta">{formatOperateCityShort(row.location)}</div>
                    <div className="va-mobile-card__tags">
                      <span className="va-kanban-tag">{statusLabel}</span>
                      <span className="va-mobile-card__mile tabular-nums">{formatMileage(row.mileage)}</span>
                    </div>
                  </button>
                  <div className="va-mobile-card__actions">
                    <OperationActions
                      more={[
                        {
                          key: 'view',
                          label: '查看详情',
                          onClick: () => onOpenDetail(row),
                        },
                        {
                          key: 'owner',
                          label: '设置运维负责人',
                          onClick: () => onOps(row),
                        },
                        {
                          key: 'edit',
                          label: '编辑档案',
                          onClick: () => onEdit(row),
                        },
                      ]}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="va-table-wrap">
            <table className="va-table va-table-ledger ln-data-table">
              <thead>
                <tr style={{ ['--va-sticky-brand' as string]: `${colWidths.brand || DEFAULT_COLUMN_WIDTHS.brand}px` }}>
                  {orderedColumns.map((col) => {
                    if (!visibleCols[col.key]) return null;
                    const stickyClass = col.key === 'brand'
                      ? 'sticky-left sticky-brand'
                      : col.key === 'plate'
                        ? 'sticky-left sticky-plate'
                        : col.key === 'actions'
                          ? 'sticky-right'
                          : '';
                    const w = colWidths[col.key] || DEFAULT_COLUMN_WIDTHS[col.key];
                    const annotationId = col.key === 'plate'
                      ? 'va-feat-list-plate'
                      : col.key === 'customer'
                        ? 'va-feat-list-operate-customer'
                        : col.key === 'contract'
                          ? 'va-feat-list-contract'
                          : col.key === 'biz'
                            ? 'va-feat-list-biz'
                            : col.key === 'parking'
                              ? 'va-feat-list-parking'
                              : col.key === 'ownership'
                                ? 'va-feat-list-ownership'
                                : col.key === 'source'
                                  ? 'va-feat-list-source'
                                  : col.key === 'lic'
                                    ? 'va-feat-list-license'
                                    : col.key === 'ins'
                                      ? 'va-feat-list-insurance'
                                      : col.key === 'location'
                                      ? 'va-feat-list-location'
                                      : col.key === 'ops'
                                        ? 'va-feat-ops-assign'
                                        : col.key === 'actions'
                                          ? 'va-feat-admin-edit-archive'
                                          : undefined;
                    return (
                      <th
                        key={col.key}
                        className={`${stickyClass} va-th-${col.key}`.trim()}
                        style={{ width: w, minWidth: w, maxWidth: w }}
                        data-annotation-id={annotationId}
                        title={col.key === 'mileTask'
                          ? '国家/地方政策补贴对应的车辆里程考核，达标后给予政策补贴（区别于客户租赁合同约定的优惠里程考核）'
                          : col.key === 'plate'
                            ? '点击车牌号可打开车辆档案'
                            : col.key === 'customer'
                              ? '上行运营状态标签；下行当前租赁/物流合同客户名称'
                              : col.key === 'contract'
                              ? '点击合同编号可新标签打开合同详情'
                              : col.key === 'biz'
                                ? '展示租赁 / 物流合同对应的业务部门与业务经理'
                                : col.key === 'parking'
                                  ? '在库展示停车场 / 维修站；履约、调拨中、异动中为车辆未在库'
                                  : col.key === 'ownership'
                                    ? '登记所有权对应公司名称，目前通过导入写入'
                                    : col.key === 'source'
                                      ? '车辆来源：自有 / 外租 / 挂靠及辅行说明'
                                      : col.key === 'lic'
                                        ? '证照状态与到期扫读；沪牌状态与剩余天数均按等级评定时间（特例）'
                                        : col.key === 'ins'
                                          ? '第1行保险状态；第2行交强、第3行商业到期（临期/到期色标）'
                                          : col.key === 'location'
                                          ? '车机/GPS 可点省市打开地图（在线绿点、离线灰点，车辆居中可缩放；在线移动时定时刷新定位）；人工不可看地图，可改运营城市'
                                          : col.key === 'ops'
                                            ? '按运维用户区域命中车辆最后交车/停车场/维修站所在省市。查询：所有运维可看全部车辆与运维业务数据；待办与操作：仅该车运维负责人可执行年审、调拨、异动、交还车、替换等'
                                          : undefined}
                      >
                        <span>{col.label}</span>
                        {col.key !== 'actions' ? (
                          <div
                            className={`va-th-resizer${resizingCol === col.key ? ' is-resizing' : ''}`}
                            onMouseDown={(e) => handleResizeStart(col.key, e)}
                            onDoubleClick={() => setColWidths((p) => ({
                              ...p,
                              [col.key]: DEFAULT_COLUMN_WIDTHS[col.key],
                            }))}
                            title="按住鼠标拖拽调整列宽，双击重置"
                          />
                        ) : null}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, rowIndex) => {
                  const project = resolveProjectDelivery(row, '');
                  const citySource = resolveOperateCitySource(row);
                  const annotateCityManual = Boolean(
                    citySource === '人工'
                    && paged.findIndex((r) => resolveOperateCitySource(r) === '人工') === rowIndex,
                  );
                  const insurance = insuranceMap.get(row.id) || {};
                  const managers = resolveOpsManagers(row);
                  const opsEmpty = !managers.length;
                  const hasParkingArea = hasLastParkingArea(row);
                  const OpsEmptyIcon = hasParkingArea ? UserRoundX : MapPinOff;
                  const compliance = resolveOperateStatusPill(row);
                  const mileSource = resolveMileageSource(row);
                  const mileTask = resolveMileageTask(row);

                  const gpsTimeStr = formatGpsTime(row.gpsTime, '');
                  const timeTitle = gpsTimeStr
                    ? (citySource === '人工' ? `人工修改时间 ${gpsTimeStr}` : `更新 ${gpsTimeStr}`)
                    : (citySource === '人工' ? '暂无人工修改时间' : '暂无时间');
                  const timeLabel = gpsTimeStr
                    ? `更新 ${gpsTimeStr}`
                    : '暂无时间';

                  const hasCustomer = Boolean(project.companyName || (row.customer && row.customer !== '-' && row.customer !== '—'));
                  const customerName = project.companyName || (row.customer && row.customer !== '-' && row.customer !== '—' ? row.customer : '');
                  const hasContract = Boolean(project.contractNo && project.contractNo !== '-' && project.contractNo !== '—');
                  const hasProject = Boolean(project.projectName && project.projectName !== '-' && project.projectName !== '—');

                  const deptName = row.department && row.department !== '-' && row.department !== '—' ? row.department : '';
                  const mgrName = row.manager && row.manager !== '-' && row.manager !== '—' ? row.manager : '';
                  const cells: Record<string, React.ReactNode> = {
                      brand: !visibleCols.brand ? null : (
                        <td
                          className="sticky-left sticky-brand va-td-brand"
                          style={{ width: colWidths.brand, minWidth: colWidths.brand, maxWidth: colWidths.brand }}
                        >
                          <div
                            className="va-ledger-cell is-duo"
                            title={`${displayText(row.brand)}·${displayText(row.model)}`}
                            data-title-lock="1"
                          >
                            <div className="va-ledger-cell__mid">
                              <span
                                className="va-ledger-cell__title va-brand-model"
                                data-full-title={displayText(row.brand)}
                              >
                                {displayText(row.brand)}
                              </span>
                            </div>
                            <div className="va-ledger-cell__bot">
                              <span
                                className="va-brand-model-sub"
                                data-full-title={displayText(row.model)}
                              >
                                {displayText(row.model)}
                              </span>
                            </div>
                          </div>
                        </td>
                      ),
                      plate: !visibleCols.plate ? null : (
                        <td
                          className="sticky-left sticky-plate va-td-plate"
                          style={{ width: colWidths.plate, minWidth: colWidths.plate, maxWidth: colWidths.plate }}
                        >
                          <div
                            className="va-ledger-cell is-duo va-plate-cell"
                            role="group"
                            aria-label={
                              displayText(row.vin, '')
                                ? `车牌${row.plateNo}，车辆状态${row.vehicleStatus || '无'}，车辆识别代码${displayText(row.vin, '')}`
                                : `车牌${row.plateNo}，车辆状态${row.vehicleStatus || '无'}`
                            }
                          >
                            {/* 第 1 行：车牌号（引导查看）+ 车辆状态 */}
                            <div className="va-ledger-cell__mid va-plate-mid">
                              <button
                                type="button"
                                className="va-cell-row va-cell-row--title va-ledger-cell__title va-plate-link"
                                onClick={() => onOpenDetail(row)}
                                title="点击车牌号查看车辆档案"
                                aria-label={`${row.plateNo}，点击查看详情`}
                              >
                                <span className="va-plate-link__text tabular-nums">{row.plateNo}</span>
                                <span className="va-plate-link__hint" aria-hidden>
                                  查看
                                  <ChevronRight size={13} strokeWidth={2.25} />
                                </span>
                              </button>
                              <VehicleStatusTag
                                status={row.vehicleStatus}
                                annotate={rowIndex === 0}
                              />
                            </div>
                            {/* 第 2 行：车辆识别代码（导入必填，无值不展示「—」） */}
                            <div
                              className="va-ledger-cell__bot va-plate-vin tabular-nums"
                              title={displayText(row.vin, '') || undefined}
                              data-full-title={displayText(row.vin, '') || undefined}
                            >
                              {displayText(row.vin, '')}
                            </div>
                          </div>
                        </td>
                      ),
                      location: !visibleCols.location ? null : (
                        <td
                          className="va-td-location"
                          style={{ width: colWidths.location, minWidth: colWidths.location, maxWidth: colWidths.location }}
                        >
                          <div
                            className={`va-ledger-cell is-duo va-loc-suite${row.onlineStatus === '在线' ? ' is-online' : ' is-offline'}${citySource === '人工' ? ' is-manual-source' : ''}`}
                            role="group"
                            aria-label={
                              citySource === '人工'
                                ? `${formatOperateCityShort(row.location)}，城市来源人工，未接入车机与 GPS，无定位地图；可点击修改运营城市`
                                : `${formatOperateCityShort(row.location)}，${row.onlineStatus === '在线' ? '在线' : '离线'}${citySource ? `，城市来源${citySource}` : ''}；点击省市查看地图与详细位置`
                            }
                          >
                            <div className="va-ledger-cell__mid va-loc-suite__city">
                              <span
                                className={`va-loc-suite__live${row.onlineStatus === '在线' ? ' is-on' : ''}${citySource === '人工' ? ' is-unlinked' : ''}`}
                                title={
                                  citySource === '人工'
                                    ? '未接入车机 / GPS'
                                    : row.onlineStatus === '在线'
                                      ? '车机在线'
                                      : '车机离线'
                                }
                                data-title-lock="1"
                                aria-label={
                                  citySource === '人工'
                                    ? '未接入定位'
                                    : row.onlineStatus === '在线'
                                      ? '在线'
                                      : '离线'
                                }
                              />
                              {canOpenLocationMap(row) ? (
                                <button
                                  type="button"
                                  className={`va-loc-suite__city-btn is-map${row.onlineStatus === '在线' ? '' : ' is-last-known'}`}
                                  onClick={() => onMap(row)}
                                  title={row.onlineStatus === '在线' ? '点击查看地图：在线绿色定位点，车辆居中，可缩放；移动中定时刷新' : '点击查看地图：离线灰色定位点为末次位置，车辆居中，可缩放'}
                                  data-title-lock="1"
                                  aria-label={`${formatOperateCityShort(row.location)}，点击查看地图`}
                                >
                                  <span
                                    className="va-loc-suite__city-name"
                                    data-full-title={formatOperateCityShort(row.location)}
                                  >
                                    {formatOperateCityShort(row.location)}
                                  </span>
                                  <MapPin size={13} aria-hidden className="va-loc-suite__city-pin" />
                                </button>
                              ) : canEditOperateCity(row) ? (
                                <button
                                  type="button"
                                  className="va-loc-suite__city-btn is-manual-edit"
                                  onClick={() => onOperateCity(row)}
                                  title="未接入车机 / GPS，无定位地图；点击修改运营城市"
                                  aria-label={`${formatOperateCityShort(row.location)}，未接入定位，点击修改运营城市`}
                                >
                                  <span
                                    className="va-loc-suite__city-name"
                                    data-full-title={formatOperateCityShort(row.location)}
                                  >
                                    {formatOperateCityShort(row.location)}
                                  </span>
                                </button>
                              ) : (
                                <span className="va-loc-suite__city-text">
                                  {formatOperateCityShort(row.location)}
                                </span>
                              )}
                            </div>
                            <div className="va-ledger-cell__bot va-loc-suite__meta">
                              {citySource ? (
                                <CitySourceMeta
                                  source={citySource}
                                  onMaintain={citySource === '人工' ? () => onOperateCity(row) : undefined}
                                  annotate={annotateCityManual}
                                />
                              ) : null}
                              <span
                                className={`va-loc-suite__time tabular-nums ${!gpsTimeStr ? 'is-muted' : ''}`}
                                title={timeTitle}
                                data-full-title={timeTitle}
                              >
                                {timeLabel}
                              </span>
                            </div>
                          </div>
                        </td>
                      ),
                      customer: !visibleCols.customer ? null : (
                        <td
                          className="va-td-customer"
                          style={{ width: colWidths.customer, minWidth: colWidths.customer, maxWidth: colWidths.customer }}
                        >
                          <div className="va-ledger-cell is-duo">
                            <div className="va-ledger-cell__mid va-cell-row--status">
                              <StatusPill {...compliance} compact annotate={rowIndex === 0} />
                            </div>
                            <div className="va-ledger-cell__bot va-cell-row--company">
                              {hasCustomer ? <Building size={12} aria-hidden className="va-cell-row__company-icon" /> : null}
                              <span
                                className={`va-cell-row__company-name ${!hasCustomer ? 'is-muted' : ''}`}
                                data-full-title={hasCustomer ? customerName : '在库未出租'}
                              >
                                {hasCustomer ? customerName : '在库未出租'}
                              </span>
                            </div>
                          </div>
                        </td>
                      ),
                      contract: !visibleCols.contract ? null : (
                        <td
                          className="va-td-contract"
                          style={{ width: colWidths.contract, minWidth: colWidths.contract, maxWidth: colWidths.contract }}
                        >
                          {!hasContract && !hasProject ? (
                            <div className="va-ops-empty is-static">
                              <div
                                className="va-ops-empty__card"
                                role="status"
                                aria-label="未关联合同"
                                title="当前车辆未关联租赁或物流合同与项目"
                              >
                                <span className="va-ops-empty__icon" aria-hidden>
                                  <Unlink size={13} strokeWidth={2.25} />
                                </span>
                                <span className="va-ops-empty__copy">
                                  <span className="va-ops-empty__title">未关联合同</span>
                                  <span className="va-ops-empty__meta">
                                    <span className="va-ops-empty__hint">无履约项目</span>
                                  </span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="va-ledger-cell is-duo">
                              <div className="va-ledger-cell__mid">
                                {hasContract ? (
                                  <button
                                    type="button"
                                    className="va-cell-row va-cell-row--title va-ledger-cell__title va-contract-link"
                                    data-full-title={project.contractNo}
                                    onClick={() => openLeaseContractDetail(project.contractNo)}
                                    title="点击合同编号查看合同详情（新标签页）"
                                    aria-label={`${project.contractNo}，点击新标签页打开合同详情`}
                                  >
                                    <span className="va-contract-link__text tabular-nums">{project.contractNo}</span>
                                    <span className="va-contract-link__hint" aria-hidden>
                                      查看
                                      <ChevronRight size={13} strokeWidth={2.25} />
                                    </span>
                                  </button>
                                ) : (
                                  <span className="va-ledger-cell__title is-muted">未关联合同</span>
                                )}
                              </div>
                              <div className="va-ledger-cell__bot">
                                {hasProject ? (
                                  <span
                                    className="va-cell-row__project"
                                    data-full-title={project.projectName}
                                  >
                                    {project.projectName}
                                  </span>
                                ) : (
                                  <span className="va-cell-row__project is-muted">未关联项目</span>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      ),
                      biz: !visibleCols.biz ? null : (
                        <td
                          className="va-td-biz"
                          style={{ width: colWidths.biz, minWidth: colWidths.biz, maxWidth: colWidths.biz }}
                        >
                          {!hasContract && !hasProject ? (
                            <div className="va-ops-empty is-static">
                              <div
                                className="va-ops-empty__card"
                                role="status"
                                aria-label="未关联业务经理"
                                title="未关联租赁或物流合同时，无业务经理与业务部门"
                              >
                                <span className="va-ops-empty__icon" aria-hidden>
                                  <Building2 size={13} strokeWidth={2.25} />
                                </span>
                                <span className="va-ops-empty__copy">
                                  <span className="va-ops-empty__title">未关联业务经理</span>
                                  <span className="va-ops-empty__meta">
                                    <span className="va-ops-empty__hint">无业务部门</span>
                                  </span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="va-ledger-cell is-duo"
                              role="group"
                              aria-label={`业务部门${deptName || '未分配'}；业务经理${mgrName || '未指定'}`}
                            >
                              <div className="va-ledger-cell__mid">
                                <span
                                  className={`va-ledger-cell__title ${!mgrName ? 'is-muted' : ''}`}
                                  data-full-title={mgrName || '未指定经理'}
                                >
                                  {mgrName || '未指定经理'}
                                </span>
                              </div>
                              <div className="va-ledger-cell__bot">
                                <span
                                  className={`va-biz-dept ${!deptName ? 'is-muted' : ''}`}
                                  data-full-title={deptName || '未分配部门'}
                                >
                                  {deptName || '未分配部门'}
                                </span>
                              </div>
                            </div>
                          )}
                        </td>
                      ),
                      parking: !visibleCols.parking ? null : (
                        <td
                          className="va-td-parking"
                          style={{ width: colWidths.parking, minWidth: colWidths.parking, maxWidth: colWidths.parking }}
                        >
                          <ParkingAreaCell row={row} />
                        </td>
                      ),
                      ownership: !visibleCols.ownership ? null : (
                        <td
                          className="va-td-ownership"
                          style={{ width: colWidths.ownership, minWidth: colWidths.ownership, maxWidth: colWidths.ownership }}
                        >
                          <OwnershipCell row={row} />
                        </td>
                      ),
                      source: !visibleCols.source ? null : (
                        <td
                          className="va-td-src"
                          style={{ width: colWidths.source, minWidth: colWidths.source, maxWidth: colWidths.source }}
                        >
                          <VehicleSourceCell row={row} />
                        </td>
                      ),
                      lic: !visibleCols.lic ? null : (
                        <td
                          className="va-td-lic"
                          style={{ width: colWidths.lic, minWidth: colWidths.lic, maxWidth: colWidths.lic }}
                        >
                          <LicenseSuiteCell row={row} />
                        </td>
                      ),
                      ins: !visibleCols.ins ? null : (
                        <td
                          className="va-td-ins"
                          style={{ width: colWidths.ins, minWidth: colWidths.ins, maxWidth: colWidths.ins }}
                        >
                          <InsuranceSuiteCell
                            row={row}
                            insurance={insurance}
                            onOpenPurchase={() => onToast(`即将跳转至保险采购（原型演示）：${row.plateNo}`)}
                          />
                        </td>
                      ),
                      mile: !visibleCols.mile ? null : (
                        <td
                          className="va-td-mile"
                          style={{ width: colWidths.mile, minWidth: colWidths.mile, maxWidth: colWidths.mile }}
                        >
                          <div
                            className="va-ledger-cell is-duo va-mile-suite"
                            title={mileSource ? `里程来自${mileSource}` : undefined}
                          >
                            <div className="va-ledger-cell__mid">
                              <span className="va-metric tabular-nums">{formatMileage(row.mileage)}</span>
                            </div>
                            <div className="va-ledger-cell__bot">
                              {mileSource ? (
                                <span className={`va-mile-source is-${mileSource === '车机' ? 'telematics' : mileSource === 'GPS' ? 'gps' : mileSource === '还车登记' ? 'return' : 'delivery'}`}>
                                  来源·{mileSource}
                                </span>
                              ) : (
                                <span className="va-ledger-cell__spacer" aria-hidden />
                              )}
                            </div>
                          </div>
                        </td>
                      ),
                      mileTask: !visibleCols.mileTask ? null : (
                        <td
                          className="va-td-mile-task"
                          style={{ width: colWidths.mileTask, minWidth: colWidths.mileTask, maxWidth: colWidths.mileTask }}
                        >
                          <MileageTaskBlock task={mileTask} />
                        </td>
                      ),
                      ops: !visibleCols.ops ? null : (
                        <td
                          className="va-td-ops"
                          style={{ width: colWidths.ops, minWidth: colWidths.ops, maxWidth: colWidths.ops }}
                        >
                          {opsEmpty ? (
                            <div
                              className={`va-ops-empty ${hasParkingArea ? 'is-nomatch' : 'is-nopark'}`}
                            >
                              <button
                                type="button"
                                className="va-ops-empty__card"
                                onClick={() => onOps(row)}
                                aria-label={
                                  hasParkingArea
                                    ? '暂无匹配运维，点击去设置，指定一名或多名运维负责人'
                                    : '无运维负责人，点击去设置，指定一名或多名运维负责人，避免车辆无人管理'
                                }
                                title={
                                  hasParkingArea
                                    ? '区域暂无自动匹配人员。点击「去设置」，指定一名或多名运维负责人，避免业务无人跟进。'
                                    : '无最后停放区域，无法自动匹配。点击「去设置」，指定一名或多名运维负责人，避免该车无人管理、业务无法正常开展。'
                                }
                              >
                                <span className="va-ops-empty__icon" aria-hidden>
                                  <OpsEmptyIcon size={13} strokeWidth={2.25} />
                                </span>
                                <span className="va-ops-empty__copy">
                                  <span className="va-ops-empty__title">
                                    <span className="va-ops-empty__status">
                                      {hasParkingArea ? '暂无匹配运维' : '无运维负责人'}
                                    </span>
                                    <span className="va-ops-empty__sep" aria-hidden>·</span>
                                    <span className="va-ops-empty__cta">
                                      去设置
                                      <ChevronRight size={12} strokeWidth={2.5} aria-hidden />
                                    </span>
                                  </span>
                                  <span className="va-ops-empty__meta">
                                    <span className="va-ops-empty__hint">
                                      {hasParkingArea
                                        ? '点击指定运维，避免无人跟进'
                                        : '点击指定运维，避免无人管理'}
                                    </span>
                                  </span>
                                </span>
                              </button>
                            </div>
                          ) : (
                            <div
                              className="va-ledger-cell is-duo"
                            >
                              <div className="va-ledger-cell__mid">
                                <button
                                  type="button"
                                  className="va-btn-link va-ledger-cell__title"
                                  data-full-title={managers.join('、')}
                                  onClick={() => onOps(row)}
                                >
                                  {managers.join('、')}
                                </button>
                              </div>
                              <div className="va-ledger-cell__bot">
                                <span className="va-ops-label">当前运维负责人</span>
                              </div>
                            </div>
                          )}
                        </td>
                      ),
                      actions: !visibleCols.actions ? null : (
                        <td
                          className="sticky-right va-td-actions"
                          style={{ width: colWidths.actions, minWidth: colWidths.actions, maxWidth: colWidths.actions }}
                        >
                          <OperationActions
                            more={[
                              {
                                key: 'view',
                                label: '查看详情',
                                onClick: () => onOpenDetail(row),
                              },
                              {
                                key: 'owner',
                                label: '设置运维负责人',
                                onClick: () => onOps(row),
                              },
                              {
                                key: 'edit',
                                label: '编辑档案',
                                onClick: () => onEdit(row),
                              },
                            ]}
                          />
                        </td>
                      ),
                  };
                  return (
                    <tr
                      key={row.id}
                      style={{ ['--va-sticky-brand' as string]: `${colWidths.brand || DEFAULT_COLUMN_WIDTHS.brand}px` }}
                    >
                      {orderedColumns.map((col) => (
                        <React.Fragment key={col.key}>{cells[col.key]}</React.Fragment>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="va-footer">
          <V2Pagination
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            size="default"
            align="between"
          />
        </div>
      </section>
      )}
    </div>
  );
}

export { DEFAULT_PAGE_SIZE };
