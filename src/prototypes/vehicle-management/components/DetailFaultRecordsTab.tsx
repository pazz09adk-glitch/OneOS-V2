import React, { useMemo, useState } from 'react';
import { OperationActions } from '../../../common/OperationActions';
import { V2Tag } from '../../../resources/design-system/components/UIComponents';
import type { VehicleRecord } from '../types';
import {
  countActiveFilters,
  DetailRecordFilterBar,
  DetailRecordFooter,
  DetailRecordTable,
  FilterSelect,
  FilterTextInput,
  FilterToolbarDateRange,
  toFilterSelectOptions,
  type DetailRecordColumn,
} from './DetailRecordPrimitives';

export interface FaultRecordRow {
  id: string;
  plateNo?: string;
  faultNo?: string;
  resolutionStatus?: string;
  brand?: string;
  model?: string;
  operateCompany?: string;
  faultLevel?: string;
  faultType?: string;
  faultDescription?: string;
  reportedAt?: string;
  resolvedAt?: string;
  aiMatched?: boolean;
  lastOperator?: string;
}

interface DetailFaultRecordsTabProps {
  record: VehicleRecord;
  rows: readonly FaultRecordRow[];
  onViewFaultDetail?: (record: VehicleRecord, row: FaultRecordRow) => void;
  onEditFaultRecord?: (record: VehicleRecord, row: FaultRecordRow) => void;
}

const EMPTY_FILTERS = {
  startDate: '',
  endDate: '',
  faultNo: '',
  faultLevel: '',
  faultType: '',
  resolutionStatus: '',
  aiMatched: '',
};

const DEFAULT_PAGE_SIZE = 10;

function text(value: unknown): string {
  if (value === null || value === undefined) return '—';
  const normalized = String(value).trim();
  return normalized && normalized !== '-' ? normalized : '—';
}

function options(rows: readonly FaultRecordRow[], key: keyof FaultRecordRow): string[] {
  return Array.from(
    new Set(rows.map((row) => text(row[key])).filter((value) => value !== '—')),
  );
}

function inRange(value: string | undefined, startDate: string, endDate: string): boolean {
  if (!startDate && !endDate) return true;
  const date = String(value ?? '').slice(0, 10);
  if (!date) return false;
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

export function DetailFaultRecordsTab({
  record,
  rows,
  onViewFaultDetail,
  onEditFaultRecord,
}: DetailFaultRecordsTabProps) {
  const [pending, setPending] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const filtered = useMemo(() => rows.filter((row) => (
    inRange(row.reportedAt, applied.startDate, applied.endDate)
    && (!applied.faultNo || text(row.faultNo).toLowerCase().includes(applied.faultNo.toLowerCase()))
    && (!applied.faultLevel || row.faultLevel === applied.faultLevel)
    && (!applied.faultType || row.faultType === applied.faultType)
    && (!applied.resolutionStatus || row.resolutionStatus === applied.resolutionStatus)
    && (
      !applied.aiMatched
      || (applied.aiMatched === '已匹配' ? row.aiMatched === true : row.aiMatched !== true)
    )
  )), [applied, rows]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [currentPage, filtered, pageSize]);

  const columns: DetailRecordColumn<FaultRecordRow>[] = [
    {
      key: 'faultNo',
      label: '故障编号',
      width: 180,
      render: (row) => (
        <button
          type="button"
          className="va-record-link"
          onClick={() => onViewFaultDetail?.(record, row)}
        >
          {text(row.faultNo)}
        </button>
      ),
    },
    {
      key: 'resolutionStatus',
      label: '解决情况',
      width: 110,
      render: (row) => (
        <V2Tag type={row.resolutionStatus === '已解决' ? 'success' : 'default'} size="small">
          {text(row.resolutionStatus)}
        </V2Tag>
      ),
    },
    { key: 'plateNo', label: '车牌号', width: 130, render: (row) => text(row.plateNo) },
    { key: 'brand', label: '车辆品牌', width: 120, render: (row) => text(row.brand) },
    { key: 'model', label: '车辆型号', width: 200, render: (row) => text(row.model) },
    { key: 'operateCompany', label: '运营公司', width: 220, render: (row) => text(row.operateCompany) },
    { key: 'faultLevel', label: '故障等级', width: 120, render: (row) => text(row.faultLevel) },
    { key: 'faultType', label: '故障类型', width: 140, render: (row) => text(row.faultType) },
    { key: 'faultDescription', label: '故障描述', width: 260, render: (row) => text(row.faultDescription) },
    { key: 'reportedAt', label: '上报时间', width: 170, render: (row) => text(row.reportedAt) },
    { key: 'resolvedAt', label: '解决时间', width: 170, render: (row) => text(row.resolvedAt) },
    { key: 'aiMatched', label: 'AI匹配状态', width: 120, render: (row) => row.aiMatched ? '已匹配' : '未匹配' },
    { key: 'lastOperator', label: '最后操作人', width: 120, render: (row) => text(row.lastOperator) },
    {
      key: 'actions',
      label: '操作',
      width: 148,
      render: (row) => (
        <OperationActions
          view={{
            label: '查看',
            onClick: () => onViewFaultDetail?.(record, row),
          }}
          edit={{
            label: '编辑',
            onClick: () => onEditFaultRecord?.(record, row),
          }}
        />
      ),
    },
  ];

  return (
    <section className="va-record-tab" aria-label="故障记录">
      <DetailRecordFilterBar
        title="故障记录"
        activeCount={countActiveFilters({
          ...applied,
          startDate: '',
          endDate: '',
        })}
        toolbarFilter={(
          <FilterToolbarDateRange
            startDate={pending.startDate}
            endDate={pending.endDate}
            placeholder="上报时间范围"
            ariaLabel="上报时间"
            onChange={(startDate, endDate) => {
              setPending((prev) => ({ ...prev, startDate, endDate }));
              setApplied((prev) => ({ ...prev, startDate, endDate }));
              setPage(1);
            }}
          />
        )}
        onQuery={() => {
          setApplied({ ...pending });
          setPage(1);
        }}
        onReset={() => {
          setPending(EMPTY_FILTERS);
          setApplied(EMPTY_FILTERS);
          setPage(1);
        }}
      >
        <FilterTextInput label="故障编号" value={pending.faultNo} onChange={(faultNo) => setPending((prev) => ({ ...prev, faultNo }))} />
        <FilterSelect label="故障等级" value={pending.faultLevel} options={toFilterSelectOptions(options(rows, 'faultLevel'))} onChange={(faultLevel) => setPending((prev) => ({ ...prev, faultLevel }))} />
        <FilterSelect label="故障类型" value={pending.faultType} options={toFilterSelectOptions(options(rows, 'faultType'))} onChange={(faultType) => setPending((prev) => ({ ...prev, faultType }))} />
        <FilterSelect label="解决情况" value={pending.resolutionStatus} options={toFilterSelectOptions(options(rows, 'resolutionStatus'))} onChange={(resolutionStatus) => setPending((prev) => ({ ...prev, resolutionStatus }))} />
        <FilterSelect label="AI匹配状态" value={pending.aiMatched} options={toFilterSelectOptions(['已匹配', '未匹配'])} onChange={(aiMatched) => setPending((prev) => ({ ...prev, aiMatched }))} />
      </DetailRecordFilterBar>
      <DetailRecordTable title="故障记录列表" columns={columns} rows={paged} />
      <DetailRecordFooter
        page={currentPage}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </section>
  );
}
