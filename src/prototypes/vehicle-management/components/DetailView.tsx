import React, { useMemo, useState } from 'react';
import { useProtoDevState } from '@axhub/annotation';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  History,
  MapPin,
  MapPinOff,
  Pencil,
  Truck,
  User,
} from 'lucide-react';
import type { VehicleRecord } from '../types';
import type { OperateCitySource } from '../utils/vehicle';
import {
  daysUntilExpire,
  displayText,
  displayUILabel,
  formatBrandModel,
  formatGpsRelativeAgo,
  formatGpsTime,
  formatOnlineStatusLabel,
  formatOperateCity,
  formatParkingAreaDisplay,
  formatVehicleSourceDisplay,
  normalizeComplianceDemoKey,
  resolveComplianceSummary,
  resolveGpsLocationAddress,
  resolveLocationInfoSource,
  hasLastParkingArea,
  resolveOpsAssignLogs,
  resolveOpsManagers,
  resolveThirdPartyLeaseCompany,
} from '../utils/vehicle';
import {
  V2Empty,
  V2Tag,
} from '../../../resources/design-system/components/UIComponents';
import {
  type VehicleInsuranceExpire,
} from '../utils/insurance';
import { VehicleLifecyclePanel } from './VehicleLifecyclePanel';
import { ModelParamsModal } from './DetailModelParamsTab';
import { DetailLicenseIndex } from './DetailLicenseIndex';
import type { InsuranceHistoryRow } from './DetailInsuranceRecordsTab';
import {
  type AccidentRecordRow,
  type AnnualReviewRecordRow,
  type DeliveryRecordRow,
  type LeaseRecordRow,
  type MovementRecordRow,
  type ReplaceRecordRow,
  type ReturnRecordRow,
  type TransferRecordRow,
  type ViolationRecordRow,
} from './DetailRecordTabs';
import {
  type FaultRecordRow,
} from './DetailFaultRecordsTab';
import {
  StatusPill,
  VehicleStatusTag,
  resolveOperateStatusPill,
} from './StatusPills';
import { ArchiveFieldModal, type ArchiveFieldKey } from './Modals';
import leaseRecords from '../data/lease-records.json';
import deliveryRecords from '../data/delivery-records.json';
import returnRecords from '../data/return-records.json';
import replaceRecords from '../data/replace-records.json';
import accidentRecords from '../data/accident-records.json';
import faultRecords from '../data/fault-records.json';
import violationRecords from '../data/violation-records.json';
import movementRecords from '../data/movement-records.json';
import transferRecords from '../data/transfer-records.json';
import annualReviewRecords from '../data/annual-review-records.json';
import insurancePurchases from '../data/insurance-purchases.json';

function byPlate<T extends { plateNo?: string; vehiclePlate?: string }>(rows: T[], plate: string): T[] {
  return rows.filter((r) => (r.plateNo || r.vehiclePlate) === plate);
}

function inspectTagType(days: number | null): 'default' | 'success' | 'warning' | 'error' {
  if (days === null) return 'default';
  if (days < 0) return 'error';
  if (days <= 30) return 'warning';
  return 'success';
}

function remainDaysTag(days: number | null) {
  if (days === null) return null;
  const type = inspectTagType(days);
  const text = days < 0
    ? `已过期 ${Math.abs(days)} 天`
    : days <= 30
      ? `临期剩 ${days} 天`
      : `剩余 ${days} 天`;
  return (
    <V2Tag type={type} size="small">
      {text}
    </V2Tag>
  );
}

function isUnsetValue(value: unknown): boolean {
  return value === null || value === undefined || value === '' || value === '-' || value === '无';
}

/** 档案空态：未维护提示（非「未上传」文件语义） */
const ARCHIVE_EMPTY_LABEL = '暂未维护';
const ARCHIVE_EMPTY_ACTION = '去补充';

function formatArchiveDisplay(value: unknown): string {
  if (isUnsetValue(value)) return ARCHIVE_EMPTY_LABEL;
  const text = String(value);
  return text.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : text;
}

function ArchiveFieldTrigger({
  value,
  onEdit,
}: {
  value: unknown;
  onEdit: () => void;
}) {
  const empty = isUnsetValue(value);
  const display = formatArchiveDisplay(value);
  return (
    <button
      type="button"
      className={`va-archive-field-trigger${empty ? ' is-empty' : ''}`}
      onClick={onEdit}
      title={empty ? '该信息尚未维护，点击补充' : '点击修改'}
    >
      {empty ? (
        <span className="va-archive-field-trigger__empty">
          <span>{ARCHIVE_EMPTY_LABEL}</span>
          <span className="va-archive-field-trigger__action">{ARCHIVE_EMPTY_ACTION}</span>
        </span>
      ) : (
        <span className="tabular-nums">{display}</span>
      )}
      <Pencil size={12} aria-hidden />
    </button>
  );
}

function UploadOrText({
  value,
  onUpload,
}: {
  value: unknown;
  onUpload?: () => void;
}) {
  if (isUnsetValue(value)) {
    if (onUpload) {
      return (
        <button type="button" className="va-btn-link" onClick={onUpload}>
          {ARCHIVE_EMPTY_LABEL} · {ARCHIVE_EMPTY_ACTION}
        </button>
      );
    }
    return <span className="va-form-readonly-text va-form-readonly-text--empty">{ARCHIVE_EMPTY_LABEL}</span>;
  }
  const text = String(value);
  return (
    <span className="va-form-readonly-text tabular-nums">
      {text.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : text}
    </span>
  );
}

export interface DetailViewProps {
  record: VehicleRecord;
  insurance?: VehicleInsuranceExpire;
  onBack: () => void;
  onOps: () => void;
  onOperateCity: () => void;
  onUpdate: (patch: Partial<VehicleRecord>) => void;
  onToast: (msg: string) => void;
}

export function DetailView({
  record,
  insurance,
  onBack,
  onOps,
  onOperateCity,
  onUpdate,
  onToast,
}: DetailViewProps) {
  const [modelParamsOpen, setModelParamsOpen] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [archiveEditField, setArchiveEditField] = useState<ArchiveFieldKey | null>(null);
  const managers = resolveOpsManagers(record);
  const assignLogs = resolveOpsAssignLogs(record);
  const protoState = useProtoDevState<{
    va_location_source?: string;
    va_compliance_demo?: string;
  }>();
  const locationSource = useMemo((): OperateCitySource => {
    const forced = protoState.va_location_source;
    if (forced === '车机' || forced === 'GPS' || forced === '人工') return forced;
    return resolveLocationInfoSource(record);
  }, [protoState.va_location_source, record]);
  const onlineLabel = formatOnlineStatusLabel(record.onlineStatus);
  const locationAddress = resolveGpsLocationAddress(record, '无');
  const scrapDays = daysUntilExpire(record.scrapDate);
  const operatePill = resolveOperateStatusPill(record);
  const leaseCompanyLabel = resolveThirdPartyLeaseCompany(record, '无');
  const parkingArea = formatParkingAreaDisplay(record);

  const complianceDemoKey = normalizeComplianceDemoKey(protoState.va_compliance_demo);
  const complianceSummary = useMemo(
    () => resolveComplianceSummary(record, insurance ?? {}, complianceDemoKey),
    [record, insurance, complianceDemoKey],
  );

  const plateRows = useMemo(() => ({
    lease: byPlate(leaseRecords as LeaseRecordRow[], record.plateNo),
    delivery: byPlate(deliveryRecords as DeliveryRecordRow[], record.plateNo),
    return: byPlate(returnRecords as ReturnRecordRow[], record.plateNo),
    replace: byPlate(replaceRecords as ReplaceRecordRow[], record.plateNo),
    accident: byPlate(accidentRecords as AccidentRecordRow[], record.plateNo),
    fault: byPlate(faultRecords as FaultRecordRow[], record.plateNo),
    violation: byPlate(violationRecords as ViolationRecordRow[], record.plateNo),
    movement: byPlate(movementRecords as MovementRecordRow[], record.plateNo),
    transfer: byPlate(transferRecords as TransferRecordRow[], record.plateNo),
    annual: byPlate(annualReviewRecords as AnnualReviewRecordRow[], record.plateNo),
    purchases: (insurancePurchases as InsuranceHistoryRow[]).filter((row) => row.vehicleId === record.id),
  }), [record.id, record.plateNo]);

  const opsEmptyLabel = hasLastParkingArea(record)
    ? '暂无匹配运维 · 去设置'
    : '无运维负责人 · 去设置';

  return (
    <div className="va-shell va-detail-page" data-annotation-id="va-feat-detail-overview">
      <header className="va-form-header">
        <div className="va-form-header__left">
          <button type="button" className="va-btn va-btn-secondary va-detail-back" onClick={onBack}>
            <ArrowLeft size={14} aria-hidden />
            返回列表
          </button>
          <div className="va-form-header__divider" aria-hidden />
          <div className="va-form-header__titles">
            <h1>车辆档案工作台</h1>
          </div>
        </div>
      </header>

      <div className={`va-form-page-grid${summaryExpanded ? ' is-summary-expanded' : ''}`}>
        <section
          className={`va-form-card va-form-card--summary${summaryExpanded ? ' is-expanded' : ''}`}
          data-annotation-id="va-feat-detail-basic-info"
        >
          <div className="va-form-card__head">
            <div className="va-form-card__title">
              <Truck size={18} aria-hidden />
              <h2>车辆基本信息</h2>
            </div>
            <StatusPill {...operatePill} compact annotate />
          </div>

          <div className="va-form-readonly-grid va-form-readonly-grid--3">
            <div>
              <span className="va-form-field__label">车牌号</span>
              <div className="va-form-plate-value">
                <span className="va-form-readonly-strong tabular-nums">{record.plateNo}</span>
                <VehicleStatusTag status={record.vehicleStatus} annotate />
              </div>
            </div>
            <div className="va-form-summary-field">
              <span className="va-form-field__label">品牌车型</span>
              <div className="va-form-readonly-text">
                <button
                  type="button"
                  className="va-brand-model-link"
                  data-annotation-id="va-feat-detail-model-params"
                  title="点击查看型号参数"
                  aria-label={`${formatBrandModel(record, '无')}，点击查看型号参数`}
                  onClick={() => setModelParamsOpen(true)}
                >
                  <span className="va-brand-model-link__text">{formatBrandModel(record, '无')}</span>
                  <span className="va-brand-model-link__hint" aria-hidden>查看</span>
                </button>
              </div>
            </div>
            <div>
              <span className="va-form-field__label">车辆识别代码</span>
              <div className="va-form-readonly-text tabular-nums">{displayText(record.vin)}</div>
            </div>
            <div>
              <span className="va-form-field__label">登记所有权</span>
              <div className="va-form-readonly-text">{displayUILabel(record.ownership)}</div>
            </div>
            <div>
              <span className="va-form-field__label">运营公司</span>
              <div className="va-form-readonly-text">{displayUILabel(record.operateCompany)}</div>
            </div>
            <div data-annotation-id="va-feat-detail-parking">
              <span className="va-form-field__label">
                {parkingArea.variant === 'value' ? parkingArea.caption : '停放区域'}
              </span>
              <div className="va-form-readonly-text" title={parkingArea.title || undefined}>
                <span className={parkingArea.muted ? 'va-form-readonly-text--empty' : undefined}>
                  {parkingArea.variant === 'missing'
                    ? `${parkingArea.text}（${parkingArea.hint}）`
                    : parkingArea.text}
                </span>
              </div>
            </div>

            {summaryExpanded ? (
              <>
                <div>
                  <span className="va-form-field__label">车辆来源</span>
                  <div className="va-form-readonly-text">
                    <span
                      className="va-src-suite__source"
                      title={formatVehicleSourceDisplay(record, '无')}
                    >
                      {formatVehicleSourceDisplay(record, '无')}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="va-form-field__label">租赁公司</span>
                  <div className="va-form-readonly-text">{leaseCompanyLabel}</div>
                </div>
                <div>
                  <span className="va-form-field__label">出厂年份</span>
                  <div className="va-form-readonly-text">
                    <ArchiveFieldTrigger
                      value={record.year}
                      onEdit={() => setArchiveEditField('year')}
                    />
                  </div>
                </div>
                <div>
                  <span className="va-form-field__label">采购入库日期</span>
                  <div className="va-form-readonly-text">
                    <ArchiveFieldTrigger
                      value={record.purchaseDate}
                      onEdit={() => setArchiveEditField('purchaseDate')}
                    />
                  </div>
                </div>
                <div>
                  <span className="va-form-field__label">强制报废日期</span>
                  <div className="va-form-readonly-text">
                    {isUnsetValue(record.scrapDate) ? (
                      <UploadOrText value={record.scrapDate} />
                    ) : (
                      <span className="va-form-readonly-text">
                        <span className="tabular-nums">{String(record.scrapDate).slice(0, 10)}</span>
                        {remainDaysTag(scrapDays)}
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <button
            type="button"
            className={`va-summary-expand${summaryExpanded ? ' is-open' : ''}`}
            aria-expanded={summaryExpanded}
            onClick={() => setSummaryExpanded((prev) => !prev)}
          >
            <span>{summaryExpanded ? '收起基本参数' : '展开全部基本参数'}</span>
            <ChevronDown size={14} aria-hidden />
          </button>

          <div
            className={`va-form-alert is-${complianceSummary.level}`}
            role="status"
          >
            {complianceSummary.level === 'ok' ? (
              <CheckCircle2 size={16} aria-hidden />
            ) : (
              <AlertTriangle size={16} aria-hidden />
            )}
            <div>
              <strong>交车合规摘要</strong>
              <p>{complianceSummary.text}</p>
            </div>
          </div>
        </section>

        <section
          className={`va-form-card va-form-card--location${locationSource === '人工' ? ' is-manual' : ''}${summaryExpanded ? ' is-expanded' : ''}`}
          data-annotation-id="va-location-info"
        >
          <h3 className="va-form-aside__title">
            <MapPin size={18} aria-hidden />
            定位信息
          </h3>
          <div className="va-form-aside-loc-body">
            {locationSource === '人工' ? (
              <div className="va-form-aside-loc-manual">
                <dl className="va-form-aside-kv">
                  <div>
                    <dt>运营城市</dt>
                    <dd>
                      <button type="button" className="va-btn-link" onClick={onOperateCity}>
                        {formatOperateCity(record.location)}
                      </button>
                      <V2Tag type="default" size="small">
                        人工
                      </V2Tag>
                    </dd>
                  </div>
                  <div>
                    <dt>最近修改时间</dt>
                    <dd className="tabular-nums" title={formatGpsTime(record.gpsTime, '') || undefined}>
                      {formatGpsTime(record.gpsTime, '暂无（修改运营城市后记录）')}
                    </dd>
                  </div>
                </dl>
                <div className="va-form-aside-loc-empty" role="status">
                  <V2Empty
                    type="empty"
                    size="compact"
                    className="va-form-aside-loc-empty__inner"
                    icon={<MapPinOff size={22} aria-hidden />}
                    title="未接入车机 / GPS"
                    description="该车辆未接入车机或 GPS 平台，运营城市由人工维护。"
                    primaryActionText=""
                  />
                </div>
              </div>
            ) : (
              <dl className="va-form-aside-kv va-form-aside-kv--location">
                <div>
                  <dt>在线状态</dt>
                  <dd className="va-form-aside-online">
                    <span
                      className={`va-loc-suite__live${onlineLabel === '在线' ? ' is-on' : ''}`}
                      title={onlineLabel === '在线' ? '车机在线' : '车机离线'}
                      aria-hidden
                    />
                    <span>{onlineLabel}</span>
                  </dd>
                </div>
                <div>
                  <dt>运营城市</dt>
                  <dd>
                    {formatOperateCity(record.location)}
                    <V2Tag type="default" size="small">
                      {locationSource}
                    </V2Tag>
                  </dd>
                </div>
                <div>
                  <dt>位置</dt>
                  <dd>
                    <span className="va-form-aside-address" title={locationAddress}>
                      {locationAddress}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>定位更新时间</dt>
                  <dd className="tabular-nums" title={formatGpsTime(record.gpsTime, '')}>
                    {formatGpsRelativeAgo(record.gpsTime)}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </section>

        <div className="va-form-main">
          <section className="va-form-card va-form-card--workbench">
            <VehicleLifecyclePanel
              record={record}
              rows={plateRows}
              insurance={insurance}
              onToast={onToast}
            />
          </section>
        </div>

        <aside
          className="va-form-aside"
          aria-label="车辆侧栏信息"
          data-annotation-id="va-feat-detail-aside"
        >
          <DetailLicenseIndex record={record} onToast={onToast} />

          <section className="va-form-card" data-annotation-id="va-feat-ops-assign">
            <h3 className="va-form-aside__title">
              <User size={18} aria-hidden />
              运维负责人指派
            </h3>
            <p className="va-form-aside__hint">
              按用户区域命中最后交车 / 停车场 / 维修站所在省市。查询不设门槛（全运维可读）；待办与操作仅该车运维负责人可执行。无匹配时点击「去设置」指定一名或多名。
            </p>
            <div className="va-form-assignee">
              {managers.length ? (
                managers.map((name) => (
                  <V2Tag key={name} type="primary" size="default" icon={<User size={14} aria-hidden />}>
                    {name}
                  </V2Tag>
                ))
              ) : (
                <span className="va-form-assignee-empty">{opsEmptyLabel}</span>
              )}
            </div>
            <button type="button" className="va-btn va-btn-secondary va-form-aside-btn" onClick={onOps}>
              <Pencil size={14} aria-hidden />
              {managers.length ? '调整运维负责人' : '去设置运维负责人'}
            </button>
            <div className="va-form-ops-log" aria-label="运维指派操作记录">
              <div className="va-form-ops-log__head">
                <History size={14} aria-hidden />
                <span>操作记录</span>
              </div>
              {assignLogs.length ? (
                <ol className="va-form-ops-log__list">
                  {assignLogs.map((log) => (
                    <li key={log.id} className="va-form-ops-log__item">
                      <time className="va-form-ops-log__time tabular-nums" dateTime={log.operatedAt}>
                        {log.operatedAt}
                      </time>
                      <div className="va-form-ops-log__meta">
                        <span>
                          操作人
                          {' '}
                          <strong>{log.operator}</strong>
                        </span>
                        <span>
                          指派对象
                          {' '}
                          <strong>
                            {log.assignees.length ? log.assignees.join('、') : '已清空'}
                          </strong>
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="va-form-ops-log__empty">暂无操作记录</p>
              )}
            </div>
          </section>
        </aside>
      </div>

      {modelParamsOpen ? (
        <ModelParamsModal
          record={record}
          onClose={() => setModelParamsOpen(false)}
        />
      ) : null}

      {archiveEditField ? (
        <ArchiveFieldModal
          field={archiveEditField}
          record={record}
          onClose={() => setArchiveEditField(null)}
          onSave={(patch, toast) => {
            onUpdate(patch);
            setArchiveEditField(null);
            onToast(toast);
          }}
        />
      ) : null}
    </div>
  );
}
