import React, { useMemo, useState } from 'react';
import {
  V2StatusTabs,
  V2Tag,
} from '../../../resources/design-system/components/UIComponents';
import type {
  InsurancePurchaseRecord,
  VehicleRecord,
} from '../types';
import { resolveInsuranceDisplayStatus, type VehicleInsuranceExpire } from '../utils/insurance';
import {
  DetailRecordFooter,
  DetailRecordTable,
  type DetailRecordColumn,
} from './DetailRecordPrimitives';

type InsuranceCategory = '交强险' | '商业险' | '超赔险' | '驾意险' | '货物险';

export interface InsuranceHistoryRow extends InsurancePurchaseRecord {
  operator?: string;
  policyNo?: string;
  status?: string;
  company?: string;
  paymentDate?: string;
  /** 保单生效日期 YYYY-MM-DD；缺省时用 purchasedAt 的日期部分 */
  effectiveDate?: string;
  premium?: number | string | null;
  fileName?: string;
  fileUrl?: string;
}

interface DetailInsuranceRecordsTabProps {
  record: VehicleRecord;
  insurance?: VehicleInsuranceExpire;
  rows: readonly InsuranceHistoryRow[];
  onToast: (message: string) => void;
  /** 锁定险种（生命周期「交强险 / 商业险」阶段用）；不传则展示全部险种 Tabs */
  lockedCategory?: InsuranceCategory;
}

const CATEGORIES: InsuranceCategory[] = ['交强险', '商业险', '超赔险', '驾意险', '货物险'];
const DEFAULT_PAGE_SIZE = 10;

function value(value: unknown): string {
  if (value === null || value === undefined) return '—';
  const normalized = String(value).trim();
  return normalized && normalized !== '-' ? normalized : '—';
}

/** 当前保单卡：空值展示「未上传」 */
function currentField(raw: unknown): string {
  const text = value(raw);
  return text === '—' ? '未上传' : text;
}

/** 保单上传时间：YYYY-MM-DD HH:MM（仅日期时补演示时分） */
function formatUploadDateTime(raw: unknown): string {
  const text = value(raw);
  if (text === '—') return '—';
  const normalized = text.replace('T', ' ').trim();
  const withTime = normalized.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
  if (withTime) return `${withTime[1]} ${withTime[2]}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) {
    return `${normalized.slice(0, 10)} 09:30`;
  }
  return normalized.slice(0, 16);
}

/** 日期列：YYYY-MM-DD */
function formatDateOnly(raw: unknown): string {
  const text = value(raw);
  if (text === '—') return '—';
  const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : text.slice(0, 10);
}

function resolveEffectiveDate(row: InsuranceHistoryRow): string {
  return formatDateOnly(row.effectiveDate || row.purchasedAt);
}

/** 今天 YYYY-MM-DD（本地日历） */
function todayYmd(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 当前日期落在保单生效日～到期日（含）内，即为当前生效保单 */
function isCurrentActivePolicy(row: InsuranceHistoryRow): boolean {
  const start = resolveEffectiveDate(row);
  const end = formatDateOnly(row.expireDate);
  if (start === '—' || end === '—') return false;
  const today = todayYmd();
  return today >= start && today <= end;
}

/** 表格空值：展示「未上传」 */
function tableEmptyAsNotUploaded(raw: unknown): string {
  const text = value(raw);
  return text === '—' ? '未上传' : text;
}

/** 操作人不可为空：缺省时按来源演示补全 */
const DEMO_OPERATORS = ['张敏', '李华', '王磊', '陈静'] as const;

function resolveOperator(row: InsuranceHistoryRow): string {
  const existing = value(row.operator);
  if (existing !== '—') return existing;
  const n = Number.parseInt(String(row.id).replace(/\D/g, ''), 10) || 0;
  return DEMO_OPERATORS[n % DEMO_OPERATORS.length];
}

/** 保单文件：仅认数据里的 fileName + fileUrl；无则未上传（便于有/无附件对照） */
function resolvePolicyFile(row: InsuranceHistoryRow): {
  uploaded: boolean;
  fileName: string;
  fileUrl: string;
} {
  const fileName = String(row.fileName ?? '').trim();
  const fileUrl = String(row.fileUrl ?? '').trim();
  if (fileName && fileUrl) {
    return { uploaded: true, fileName, fileUrl };
  }
  return { uploaded: false, fileName: '', fileUrl: '' };
}

function expiryFor(
  category: InsuranceCategory,
  insurance: VehicleInsuranceExpire | undefined,
): string {
  if (category === '交强险') return value(insurance?.compulsory);
  if (category === '商业险') return value(insurance?.commercial);
  return '—';
}

function statusTone(status: string): 'default' | 'success' | 'warning' | 'error' {
  if (status === '正常') return 'success';
  if (status === '临期') return 'warning';
  if (status === '异常' || status === '已到期') return 'error';
  return 'default';
}

export function DetailInsuranceRecordsTab({
  record,
  insurance,
  rows,
  onToast,
  lockedCategory,
}: DetailInsuranceRecordsTabProps) {
  const [selected, setSelected] = useState<InsuranceCategory>(lockedCategory || '交强险');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const activeCategory = lockedCategory || selected;
  const insuranceStatus = resolveInsuranceDisplayStatus(
    insurance ?? {},
    record.insuranceStatus,
  );
  const selectedExpiry = expiryFor(activeCategory, insurance);
  const selectedRows = useMemo(
    () => rows
      .filter((row) => row.insuranceType === activeCategory)
      .slice()
      .sort((a, b) => {
        const aEnd = formatDateOnly(a.expireDate);
        const bEnd = formatDateOnly(b.expireDate);
        if (aEnd === '—' && bEnd === '—') return 0;
        if (aEnd === '—') return 1;
        if (bEnd === '—') return -1;
        // 到期时间倒序：越晚到期越靠前
        return bEnd.localeCompare(aEnd);
      }),
    [rows, activeCategory],
  );
  const totalPages = Math.max(1, Math.ceil(selectedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return selectedRows.slice(start, start + pageSize);
  }, [currentPage, pageSize, selectedRows]);
  const latest = selectedRows[0];

  const columns: DetailRecordColumn<InsuranceHistoryRow>[] = [
    {
      key: 'purchasedAt',
      label: '保单上传时间',
      width: 260,
      className: 'tabular-nums',
      render: (row) => (
        <span className="va-insurance-upload-cell">
          <span className="va-insurance-upload-cell__time">
            {formatUploadDateTime(row.purchasedAt)}
          </span>
          <span className="va-insurance-upload-cell__tag" aria-hidden={!isCurrentActivePolicy(row)}>
            {isCurrentActivePolicy(row) ? (
              <V2Tag type="primary" size="small">当前生效保单</V2Tag>
            ) : null}
          </span>
        </span>
      ),
    },
    { key: 'operator', label: '操作人', width: 110, render: (row) => resolveOperator(row) },
    { key: 'insuranceType', label: '类型', width: 100, render: (row) => value(row.insuranceType) },
    {
      key: 'policyNo',
      label: '保单号',
      width: 180,
      render: (row) => tableEmptyAsNotUploaded(row.policyNo),
    },
    {
      key: 'status',
      label: '保险状态',
      width: 110,
      render: (row) => (
        <V2Tag type={statusTone(value(row.status) === '—' ? insuranceStatus : value(row.status))} size="small">
          {value(row.status) === '—' ? insuranceStatus : value(row.status)}
        </V2Tag>
      ),
    },
    {
      key: 'company',
      label: '保险公司',
      width: 190,
      render: (row) => tableEmptyAsNotUploaded(row.company),
    },
    {
      key: 'paymentDate',
      label: '付款时间',
      width: 150,
      className: 'tabular-nums',
      render: (row) => {
        const date = formatDateOnly(row.paymentDate);
        return date === '—' ? '未上传' : date;
      },
    },
    {
      key: 'effectiveDate',
      label: '生效日期',
      width: 130,
      className: 'tabular-nums',
      render: (row) => resolveEffectiveDate(row),
    },
    {
      key: 'expireDate',
      label: '到期日期',
      width: 130,
      className: 'tabular-nums',
      render: (row) => formatDateOnly(row.expireDate),
    },
    {
      key: 'file',
      label: '保单文件',
      width: 220,
      sticky: 'right',
      render: (row) => {
        const file = resolvePolicyFile(row);
        if (!file.uploaded) {
          return (
            <span className="va-insurance-file-cell va-insurance-file-cell--empty">
              未上传
            </span>
          );
        }
        return (
          <span className="va-insurance-file-cell">
            <button
              type="button"
              className="va-insurance-file-name"
              title={file.fileName}
              onClick={() => onToast(`预览保单文件（原型演示）：${file.fileName}`)}
            >
              {file.fileName}
            </button>
            <span className="va-record-file-actions">
              <button
                type="button"
                onClick={() => onToast(`预览保单文件（原型演示）：${file.fileName}`)}
              >
                预览
              </button>
              <button
                type="button"
                onClick={() => onToast(`已开始下载：${file.fileName}（原型演示）`)}
              >
                下载
              </button>
            </span>
          </span>
        );
      },
    },
  ];

  return (
    <section className="va-record-tab va-insurance-records" aria-label="车辆保险档案">
      <div className="va-insurance-overview">
        <div className="va-insurance-overview__head">
          <div>
            <h3>车辆保险档案</h3>
          </div>
          <V2Tag type={statusTone(insuranceStatus)} size="default">{insuranceStatus}</V2Tag>
        </div>
        {lockedCategory ? null : (
          <V2StatusTabs
            className="va-insurance-type-tabs"
            value={selected}
            onChange={(category) => {
              setSelected(category);
              setPage(1);
              const expireDate = expiryFor(category, insurance);
              const hasPurchase = rows.some((row) => row.insuranceType === category);
              if (expireDate === '—' && !hasPurchase) {
                onToast(`即将跳转至保险采购编辑页（原型演示）：${record.plateNo} · ${category}`);
              }
            }}
            options={CATEGORIES.map((category) => {
              const expireDate = expiryFor(category, insurance);
              return {
                key: category,
                label: category,
                count: expireDate === '—' ? '未购' : expireDate.slice(0, 10),
              };
            })}
          />
        )}
      </div>

      <section className="va-insurance-current" aria-label={`${activeCategory}当前保单`}>
        <div className="va-insurance-current__head">
          <h3>{activeCategory} · 当前保单</h3>
          <V2Tag
            type={statusTone(selectedExpiry === '—' ? '未购买' : insuranceStatus)}
            size="small"
          >
            {selectedExpiry === '—' ? '未购买' : insuranceStatus}
          </V2Tag>
        </div>
        <dl className="va-description-grid va-insurance-current__grid">
          <div className="va-description-item"><dt>保单号</dt><dd>{currentField(latest?.policyNo)}</dd></div>
          <div className="va-description-item"><dt>保险公司</dt><dd>{currentField(latest?.company)}</dd></div>
          <div className="va-description-item"><dt>到期日期</dt><dd>{currentField(selectedExpiry)}</dd></div>
          <div className="va-description-item"><dt>保费</dt><dd>{currentField(latest?.premium)}</dd></div>
        </dl>
      </section>

      <DetailRecordTable
        title={`${activeCategory}采购历史`}
        columns={columns}
        rows={pagedRows}
        emptyDescription=""
      />
      <DetailRecordFooter
        page={currentPage}
        pageSize={pageSize}
        total={selectedRows.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </section>
  );
}
