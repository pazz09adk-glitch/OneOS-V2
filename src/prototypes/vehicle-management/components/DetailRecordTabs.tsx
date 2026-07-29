import React, { useMemo, useState } from 'react';
import {
  countActiveFilters,
  DetailRecordFilterBar,
  DetailRecordFooter,
  DetailRecordTable,
  FilterDateRange,
  FilterSelect,
  FilterTextInput,
  FilterToolbarDateRange,
  toFilterSelectOptions,
  type DetailRecordColumn,
} from './DetailRecordPrimitives';

const DEFAULT_PAGE_SIZE = 10;

type RecordWithId = { id: string };

function text(value: unknown): string {
  if (value === null || value === undefined) return '—';
  const normalized = String(value).trim();
  return normalized && normalized !== '-' ? normalized : '—';
}

function numeric(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

const moneyFormatter = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function money(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  const amount = Number(value);
  return Number.isFinite(amount) ? moneyFormatter.format(amount) : '—';
}

function includes(value: unknown, query: string): boolean {
  if (!query.trim()) return true;
  return String(value ?? '').toLowerCase().includes(query.trim().toLowerCase());
}

function inDateRange(value: unknown, startDate: string, endDate: string): boolean {
  if (!startDate && !endDate) return true;
  const date = String(value ?? '').slice(0, 10);
  if (!date) return false;
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

function options<Row>(rows: readonly Row[], pick: (row: Row) => unknown): string[] {
  return Array.from(new Set(rows.map(pick).map(text).filter((value) => value !== '—')));
}

function RecordLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className="va-record-link" onClick={onClick}>
      {children}
    </button>
  );
}

function useRecordRows<Row extends RecordWithId, Filters extends object>(
  rows: readonly Row[],
  emptyFilters: Filters,
  applyFilters: (row: Row, filters: Filters) => boolean,
) {
  const [pendingFilters, setPendingFilters] = useState<Filters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const filtered = useMemo(
    () => rows.filter((row) => applyFilters(row, appliedFilters)),
    [rows, appliedFilters, applyFilters],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [currentPage, filtered, pageSize]);

  return {
    pendingFilters,
    setPendingFilters,
    appliedFilters,
    activeFilterCount: countActiveFilters(appliedFilters),
    /** 高阶筛选徽标：排除工具栏主筛字段 */
    moreFilterCount(excludeKeys: readonly string[] = []) {
      const next = { ...appliedFilters } as Record<string, unknown>;
      excludeKeys.forEach((key) => {
        delete next[key];
      });
      return countActiveFilters(next);
    },
    paged,
    filtered,
    page: currentPage,
    pageSize,
    query() {
      setAppliedFilters({ ...pendingFilters });
      setPage(1);
    },
    /** 工具栏主筛即时生效（同步 pending / applied） */
    applyPrimary(patch: Partial<Filters>) {
      setPendingFilters((prev) => ({ ...prev, ...patch }));
      setAppliedFilters((prev) => ({ ...prev, ...patch }));
      setPage(1);
    },
    reset() {
      setPendingFilters(emptyFilters);
      setAppliedFilters(emptyFilters);
      setPage(1);
    },
    setPage,
    setPageSize(size: number) {
      setPageSize(size);
      setPage(1);
    },
  };
}

interface BaseRecordTabProps<Row> {
  rows: readonly Row[];
  onToast: (message: string) => void;
}

export interface LeaseRecordRow extends RecordWithId {
  contractNo?: string;
  projectName?: string;
  customerName?: string;
  businessType?: string;
  deliveryDate?: string;
  deliveryPerson?: string;
  returnDate?: string;
  returnPerson?: string;
  plateNo?: string;
}

const EMPTY_LEASE_FILTERS = {
  contractNo: '',
  projectName: '',
  customerName: '',
  businessType: '',
};

export function DetailLeaseRecordsTab({
  rows,
  onToast,
}: BaseRecordTabProps<LeaseRecordRow>) {
  const state = useRecordRows(
    rows,
    EMPTY_LEASE_FILTERS,
    (row, filters) => (
      includes(row.contractNo, filters.contractNo)
      && includes(row.projectName, filters.projectName)
      && includes(row.customerName, filters.customerName)
      && (!filters.businessType || row.businessType === filters.businessType)
    ),
  );
  const businessTypes = useMemo(
    () => options(rows, (row) => row.businessType),
    [rows],
  );
  const columns: DetailRecordColumn<LeaseRecordRow>[] = [
    {
      key: 'contractNo',
      label: '合同编码',
      width: 190,
      render: (row) => text(row.contractNo) === '—' ? '—' : (
        <RecordLink onClick={() => onToast(`即将跳转至租赁合同详情（原型演示）：${text(row.plateNo)} · ${text(row.contractNo)}`)}>
          {row.contractNo}
        </RecordLink>
      ),
    },
    {
      key: 'projectName',
      label: '项目名称',
      width: 220,
      render: (row) => text(row.projectName) === '—' ? '—' : (
        <RecordLink onClick={() => onToast(`即将跳转至租赁合同详情（原型演示）：${text(row.plateNo)} · ${text(row.contractNo)}`)}>
          {row.projectName}
        </RecordLink>
      ),
    },
    { key: 'customerName', label: '客户名称', width: 240, render: (row) => text(row.customerName) },
    { key: 'businessType', label: '业务类型', width: 120, render: (row) => text(row.businessType) },
    {
      key: 'deliveryDate',
      label: '交车日期',
      width: 140,
      render: (row) => text(row.deliveryDate) === '—' ? '—' : (
        <RecordLink onClick={() => onToast(`即将跳转至交车管理详情（原型演示）：${text(row.plateNo)} · ${text(row.contractNo)} · ${text(row.deliveryDate)}`)}>
          {row.deliveryDate}
        </RecordLink>
      ),
    },
    { key: 'deliveryPerson', label: '交车人', width: 110, render: (row) => text(row.deliveryPerson) },
    {
      key: 'returnDate',
      label: '还车日期',
      width: 140,
      render: (row) => text(row.returnDate) === '—' ? '—' : (
        <RecordLink onClick={() => onToast(`即将跳转至还车管理详情（原型演示）：${text(row.plateNo)} · ${text(row.contractNo)} · ${text(row.returnDate)}`)}>
          {row.returnDate}
        </RecordLink>
      ),
    },
    { key: 'returnPerson', label: '还车人', width: 110, render: (row) => text(row.returnPerson) },
  ];

  return (
    <section className="va-record-tab" aria-label="租赁记录">
      <DetailRecordFilterBar
        title="租赁记录"
        onQuery={state.query}
        onReset={state.reset}
        activeCount={state.activeFilterCount}
      >
        <FilterTextInput label="客户名称" value={state.pendingFilters.customerName} onChange={(customerName) => state.setPendingFilters((prev) => ({ ...prev, customerName }))} />
        <FilterTextInput label="合同编码" value={state.pendingFilters.contractNo} onChange={(contractNo) => state.setPendingFilters((prev) => ({ ...prev, contractNo }))} />
        <FilterTextInput label="项目名称" value={state.pendingFilters.projectName} onChange={(projectName) => state.setPendingFilters((prev) => ({ ...prev, projectName }))} />
        <FilterSelect label="业务类型" value={state.pendingFilters.businessType} options={toFilterSelectOptions(businessTypes)} onChange={(businessType) => state.setPendingFilters((prev) => ({ ...prev, businessType }))} />
      </DetailRecordFilterBar>
      <DetailRecordTable title="租赁记录列表" columns={columns} rows={state.paged} />
      <DetailRecordFooter page={state.page} pageSize={state.pageSize} total={state.filtered.length} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
    </section>
  );
}

export interface AccidentRecordRow extends RecordWithId {
  accidentCode?: string;
  accidentTime?: string;
  accidentLocation?: string;
  accidentType?: string;
  customerName?: string;
  accidentLevel?: string;
  ourDamageAmount?: number | null;
  theirDamageAmount?: number | null;
  responsibility?: string;
  status?: string;
  closedTime?: string;
}

const EMPTY_ACCIDENT_FILTERS = {
  startDate: '',
  endDate: '',
  customerName: '',
  accidentLevel: '',
  status: '',
};

export function DetailAccidentRecordsTab({
  rows,
  onToast,
}: BaseRecordTabProps<AccidentRecordRow>) {
  const state = useRecordRows(
    rows,
    EMPTY_ACCIDENT_FILTERS,
    (row, filters) => (
      inDateRange(row.accidentTime, filters.startDate, filters.endDate)
      && includes(row.customerName, filters.customerName)
      && (!filters.accidentLevel || row.accidentLevel === filters.accidentLevel)
      && (!filters.status || row.status === filters.status)
    ),
  );
  const columns: DetailRecordColumn<AccidentRecordRow>[] = [
    {
      key: 'accidentCode',
      label: '事故编码',
      width: 170,
      render: (row) => (
        <RecordLink onClick={() => onToast(`即将跳转至事故管理详情页（原型演示）：${text(row.accidentCode)}`)}>
          {text(row.accidentCode)}
        </RecordLink>
      ),
    },
    { key: 'accidentTime', label: '事故时间', width: 170, render: (row) => text(row.accidentTime) },
    { key: 'accidentLocation', label: '事故地点', width: 240, render: (row) => text(row.accidentLocation) },
    { key: 'accidentType', label: '事故类型', width: 120, render: (row) => text(row.accidentType) },
    { key: 'customerName', label: '客户名称', width: 180, render: (row) => text(row.customerName) },
    { key: 'ourDamageAmount', label: '我方定损金额', width: 140, className: 'tabular-nums', render: (row) => money(row.ourDamageAmount) },
    { key: 'theirDamageAmount', label: '对方定损金额', width: 140, className: 'tabular-nums', render: (row) => money(row.theirDamageAmount) },
    { key: 'responsibility', label: '责任划分', width: 140, render: (row) => text(row.responsibility) },
    { key: 'status', label: '事故状态', width: 120, render: (row) => text(row.status) },
    { key: 'closedTime', label: '结案时间', width: 170, render: (row) => text(row.closedTime) },
  ];

  return (
    <section className="va-record-tab" aria-label="事故记录">
      <DetailRecordFilterBar
        title="事故记录"
        onQuery={state.query}
        onReset={state.reset}
        activeCount={state.moreFilterCount(['startDate', 'endDate'])}
        toolbarFilter={(
          <FilterToolbarDateRange
            startDate={state.pendingFilters.startDate}
            endDate={state.pendingFilters.endDate}
            placeholder="事故时间范围"
            ariaLabel="事故时间"
            onChange={(startDate, endDate) => state.applyPrimary({ startDate, endDate })}
          />
        )}
      >
        <FilterTextInput label="客户名称" value={state.pendingFilters.customerName} onChange={(customerName) => state.setPendingFilters((prev) => ({ ...prev, customerName }))} />
        <FilterSelect label="事故等级" value={state.pendingFilters.accidentLevel} options={toFilterSelectOptions(options(rows, (row) => row.accidentLevel))} onChange={(accidentLevel) => state.setPendingFilters((prev) => ({ ...prev, accidentLevel }))} />
        <FilterSelect label="事故状态" value={state.pendingFilters.status} options={toFilterSelectOptions(options(rows, (row) => row.status))} onChange={(status) => state.setPendingFilters((prev) => ({ ...prev, status }))} />
      </DetailRecordFilterBar>
      <DetailRecordTable title="事故记录列表" columns={columns} rows={state.paged} />
      <DetailRecordFooter page={state.page} pageSize={state.pageSize} total={state.filtered.length} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
    </section>
  );
}

export interface ViolationRecordRow extends RecordWithId {
  violationTime?: string;
  violationLocation?: string;
  violationBehavior?: string;
  pointsDeducted?: number | null;
  fineAmount?: number | null;
  paymentStatus?: string;
  processed?: string;
  collectionUnit?: string;
  customerName?: string;
}

const EMPTY_VIOLATION_FILTERS = {
  startDate: '',
  endDate: '',
  customerName: '',
  paymentStatus: '',
  processed: '',
};

export function DetailViolationRecordsTab({
  rows,
  onToast,
}: BaseRecordTabProps<ViolationRecordRow>) {
  const state = useRecordRows(
    rows,
    EMPTY_VIOLATION_FILTERS,
    (row, filters) => (
      inDateRange(row.violationTime, filters.startDate, filters.endDate)
      && includes(row.customerName, filters.customerName)
      && (!filters.paymentStatus || row.paymentStatus === filters.paymentStatus)
      && (!filters.processed || row.processed === filters.processed)
    ),
  );
  const columns: DetailRecordColumn<ViolationRecordRow>[] = [
    { key: 'violationTime', label: '违法时间', width: 130, render: (row) => text(row.violationTime) },
    { key: 'violationLocation', label: '违法地点', width: 240, render: (row) => text(row.violationLocation) },
    {
      key: 'violationBehavior',
      label: '违法行为',
      width: 280,
      render: (row) => (
        <RecordLink onClick={() => onToast(`即将跳转至违章管理详情页（原型演示）：${text(row.violationTime)}`)}>
          {text(row.violationBehavior)}
        </RecordLink>
      ),
    },
    { key: 'pointsDeducted', label: '扣分', width: 90, className: 'tabular-nums', render: (row) => numeric(row.pointsDeducted) },
    { key: 'fineAmount', label: '罚款金额', width: 120, className: 'tabular-nums', render: (row) => money(row.fineAmount) },
    { key: 'paymentStatus', label: '缴费状态', width: 110, render: (row) => text(row.paymentStatus) },
    { key: 'processed', label: '是否处理', width: 110, render: (row) => text(row.processed) },
    { key: 'collectionUnit', label: '采集单位', width: 260, render: (row) => text(row.collectionUnit) },
  ];

  return (
    <section className="va-record-tab" aria-label="违章记录">
      <DetailRecordFilterBar
        title="违章记录"
        onQuery={state.query}
        onReset={state.reset}
        activeCount={state.moreFilterCount(['startDate', 'endDate'])}
        toolbarFilter={(
          <FilterToolbarDateRange
            startDate={state.pendingFilters.startDate}
            endDate={state.pendingFilters.endDate}
            placeholder="违法时间范围"
            ariaLabel="违法时间"
            onChange={(startDate, endDate) => state.applyPrimary({ startDate, endDate })}
          />
        )}
      >
        <FilterTextInput label="客户名称" value={state.pendingFilters.customerName} onChange={(customerName) => state.setPendingFilters((prev) => ({ ...prev, customerName }))} />
        <FilterSelect label="缴费状态" value={state.pendingFilters.paymentStatus} options={toFilterSelectOptions(options(rows, (row) => row.paymentStatus))} onChange={(paymentStatus) => state.setPendingFilters((prev) => ({ ...prev, paymentStatus }))} />
        <FilterSelect label="是否处理" value={state.pendingFilters.processed} options={toFilterSelectOptions(options(rows, (row) => row.processed))} onChange={(processed) => state.setPendingFilters((prev) => ({ ...prev, processed }))} />
      </DetailRecordFilterBar>
      <DetailRecordTable title="违章记录列表" columns={columns} rows={state.paged} />
      <DetailRecordFooter page={state.page} pageSize={state.pageSize} total={state.filtered.length} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
    </section>
  );
}

export interface MovementRecordRow extends RecordWithId {
  startDate?: string;
  estimatedEndDate?: string;
  status?: string;
  destinationType?: string;
  destinationName?: string;
  movementType?: string;
  estimatedMileageKm?: number | null;
  startMileageKm?: number | null;
  startBatteryKwh?: number | null;
  startHydrogenPct?: number | null;
  endMileageKm?: number | null;
  endBatteryKwh?: number | null;
  endHydrogenPct?: number | null;
  createdBy?: string;
  createdAt?: string;
}

const EMPTY_MOVEMENT_FILTERS = {
  startDate: '',
  endDate: '',
  destinationType: '',
  movementType: '',
};

export function DetailMovementRecordsTab({
  rows,
  onToast,
}: BaseRecordTabProps<MovementRecordRow>) {
  const state = useRecordRows(
    rows,
    EMPTY_MOVEMENT_FILTERS,
    (row, filters) => (
      inDateRange(row.startDate, filters.startDate, filters.endDate)
      && (!filters.destinationType || row.destinationType === filters.destinationType)
      && (!filters.movementType || row.movementType === filters.movementType)
    ),
  );
  const columns: DetailRecordColumn<MovementRecordRow>[] = [
    {
      key: 'startDate',
      label: '异动开始日期',
      width: 140,
      render: (row) => (
        <RecordLink onClick={() => onToast(`即将跳转至异动管理详情页（原型演示）：${text(row.startDate)}`)}>
          {text(row.startDate)}
        </RecordLink>
      ),
    },
    { key: 'estimatedEndDate', label: '异动预计结束日期', width: 160, render: (row) => text(row.estimatedEndDate) },
    { key: 'status', label: '异动状态', width: 110, render: (row) => text(row.status) },
    { key: 'destinationType', label: '异动目的地', width: 130, render: (row) => text(row.destinationType) },
    { key: 'destinationName', label: '目的地名称', width: 200, render: (row) => text(row.destinationName) },
    { key: 'movementType', label: '异动类型', width: 110, render: (row) => text(row.movementType) },
    { key: 'estimatedMileageKm', label: '预计异动里程 (km)', width: 160, className: 'tabular-nums', render: (row) => numeric(row.estimatedMileageKm) },
    { key: 'startMileageKm', label: '异动开始里程 (km)', width: 160, className: 'tabular-nums', render: (row) => numeric(row.startMileageKm) },
    { key: 'startBatteryKwh', label: '异动开始电量 (kWh)', width: 170, className: 'tabular-nums', render: (row) => numeric(row.startBatteryKwh) },
    { key: 'startHydrogenPct', label: '异动开始氢量', width: 140, className: 'tabular-nums', render: (row) => numeric(row.startHydrogenPct) },
    { key: 'endMileageKm', label: '异动结束里程 (km)', width: 160, className: 'tabular-nums', render: (row) => numeric(row.endMileageKm) },
    { key: 'endBatteryKwh', label: '异动结束电量 (kWh)', width: 170, className: 'tabular-nums', render: (row) => numeric(row.endBatteryKwh) },
    { key: 'endHydrogenPct', label: '异动结束氢量', width: 140, className: 'tabular-nums', render: (row) => numeric(row.endHydrogenPct) },
    { key: 'createdBy', label: '创建人', width: 110, render: (row) => text(row.createdBy) },
    { key: 'createdAt', label: '创建时间', width: 170, render: (row) => text(row.createdAt) },
  ];

  return (
    <section className="va-record-tab" aria-label="异动记录">
      <DetailRecordFilterBar
        title="异动记录"
        onQuery={state.query}
        onReset={state.reset}
        activeCount={state.moreFilterCount(['startDate', 'endDate'])}
        toolbarFilter={(
          <FilterToolbarDateRange
            startDate={state.pendingFilters.startDate}
            endDate={state.pendingFilters.endDate}
            placeholder="异动开始日期范围"
            ariaLabel="异动开始日期"
            onChange={(startDate, endDate) => state.applyPrimary({ startDate, endDate })}
          />
        )}
      >
        <FilterSelect label="异动目的地" value={state.pendingFilters.destinationType} options={toFilterSelectOptions(options(rows, (row) => row.destinationType))} onChange={(destinationType) => state.setPendingFilters((prev) => ({ ...prev, destinationType }))} />
        <FilterSelect label="异动类型" value={state.pendingFilters.movementType} options={toFilterSelectOptions(options(rows, (row) => row.movementType))} onChange={(movementType) => state.setPendingFilters((prev) => ({ ...prev, movementType }))} />
      </DetailRecordFilterBar>
      <DetailRecordTable title="异动记录列表" columns={columns} rows={state.paged} />
      <DetailRecordFooter page={state.page} pageSize={state.pageSize} total={state.filtered.length} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
    </section>
  );
}

export interface TransferRecordRow extends RecordWithId {
  transferDate?: string;
  transferOutPerson?: string;
  recipientPerson?: string;
  departureArea?: string;
  receivingArea?: string;
  transferMethod?: string;
  departureParking?: string;
  receivingParking?: string;
  receiveDate?: string;
}

const EMPTY_TRANSFER_FILTERS = {
  startDate: '',
  endDate: '',
  transferOutPerson: '',
  recipientPerson: '',
};

export function DetailTransferRecordsTab({
  rows,
  onToast,
}: BaseRecordTabProps<TransferRecordRow>) {
  const state = useRecordRows(
    rows,
    EMPTY_TRANSFER_FILTERS,
    (row, filters) => (
      inDateRange(row.transferDate, filters.startDate, filters.endDate)
      && includes(row.transferOutPerson, filters.transferOutPerson)
      && includes(row.recipientPerson, filters.recipientPerson)
    ),
  );
  const columns: DetailRecordColumn<TransferRecordRow>[] = [
    {
      key: 'transferDate',
      label: '调拨日期',
      width: 130,
      render: (row) => (
        <RecordLink onClick={() => onToast(`即将跳转至车辆调拨详情页（原型演示）：${text(row.transferDate)}`)}>
          {text(row.transferDate)}
        </RecordLink>
      ),
    },
    { key: 'transferOutPerson', label: '调出人', width: 110, render: (row) => text(row.transferOutPerson) },
    { key: 'recipientPerson', label: '接收人', width: 110, render: (row) => text(row.recipientPerson) },
    { key: 'departureArea', label: '出发区域', width: 130, render: (row) => text(row.departureArea) },
    { key: 'receivingArea', label: '接收区域', width: 130, render: (row) => text(row.receivingArea) },
    { key: 'transferMethod', label: '调拨方式', width: 110, render: (row) => text(row.transferMethod) },
    { key: 'departureParking', label: '出发停车场', width: 180, render: (row) => text(row.departureParking) },
    { key: 'receivingParking', label: '接收停车场', width: 180, render: (row) => text(row.receivingParking) },
    { key: 'receiveDate', label: '接收日期', width: 130, render: (row) => text(row.receiveDate) },
  ];

  return (
    <section className="va-record-tab" aria-label="调拨记录">
      <DetailRecordFilterBar
        title="调拨记录"
        onQuery={state.query}
        onReset={state.reset}
        activeCount={state.moreFilterCount(['startDate', 'endDate'])}
        toolbarFilter={(
          <FilterToolbarDateRange
            startDate={state.pendingFilters.startDate}
            endDate={state.pendingFilters.endDate}
            placeholder="调拨日期范围"
            ariaLabel="调拨日期"
            onChange={(startDate, endDate) => state.applyPrimary({ startDate, endDate })}
          />
        )}
      >
        <FilterTextInput label="调出人" value={state.pendingFilters.transferOutPerson} onChange={(transferOutPerson) => state.setPendingFilters((prev) => ({ ...prev, transferOutPerson }))} />
        <FilterTextInput label="接收人" value={state.pendingFilters.recipientPerson} onChange={(recipientPerson) => state.setPendingFilters((prev) => ({ ...prev, recipientPerson }))} />
      </DetailRecordFilterBar>
      <DetailRecordTable title="调拨记录列表" columns={columns} rows={state.paged} />
      <DetailRecordFooter page={state.page} pageSize={state.pageSize} total={state.filtered.length} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
    </section>
  );
}

export interface AnnualReviewRecordRow extends RecordWithId {
  inspectionValidUntil?: string;
  inspectionStation?: string;
  inspectionCost?: number | null;
  m2Station?: string;
  m2Cost?: number | null;
  zbStation?: string;
  zbCost?: number | null;
  executor?: string;
  executeTime?: string;
}

const EMPTY_ANNUAL_FILTERS = {
  completedStart: '',
  completedEnd: '',
  validStart: '',
  validEnd: '',
  executor: '',
};

export function DetailAnnualReviewRecordsTab({
  rows,
  onToast,
}: BaseRecordTabProps<AnnualReviewRecordRow>) {
  const state = useRecordRows(
    rows,
    EMPTY_ANNUAL_FILTERS,
    (row, filters) => (
      inDateRange(row.executeTime, filters.completedStart, filters.completedEnd)
      && inDateRange(row.inspectionValidUntil, filters.validStart, filters.validEnd)
      && (!filters.executor || row.executor === filters.executor)
    ),
  );
  const columns: DetailRecordColumn<AnnualReviewRecordRow>[] = [
    {
      key: 'inspectionValidUntil',
      label: '检验有效期至',
      width: 140,
      render: (row) => (
        <RecordLink onClick={() => onToast(`即将跳转至年审管理详情页（原型演示）：${text(row.inspectionValidUntil)}`)}>
          {text(row.inspectionValidUntil)}
        </RecordLink>
      ),
    },
    { key: 'inspectionStation', label: '检测服务站名称', width: 190, render: (row) => text(row.inspectionStation) },
    { key: 'inspectionCost', label: '检测费用', width: 110, className: 'tabular-nums', render: (row) => money(row.inspectionCost) },
    { key: 'm2Station', label: '二保服务站名称', width: 190, render: (row) => text(row.m2Station) },
    { key: 'm2Cost', label: '二保费用', width: 110, className: 'tabular-nums', render: (row) => money(row.m2Cost) },
    { key: 'zbStation', label: '整备服务站名称', width: 190, render: (row) => text(row.zbStation) },
    { key: 'zbCost', label: '整备费用', width: 110, className: 'tabular-nums', render: (row) => money(row.zbCost) },
    { key: 'executor', label: '办理人', width: 110, render: (row) => text(row.executor) },
    { key: 'executeTime', label: '完成时间', width: 170, render: (row) => text(row.executeTime) },
  ];

  return (
    <section className="va-record-tab" aria-label="年审记录">
      <DetailRecordFilterBar
        title="年审记录"
        onQuery={state.query}
        onReset={state.reset}
        activeCount={state.moreFilterCount(['completedStart', 'completedEnd'])}
        toolbarFilter={(
          <FilterToolbarDateRange
            startDate={state.pendingFilters.completedStart}
            endDate={state.pendingFilters.completedEnd}
            placeholder="完成时间范围"
            ariaLabel="完成时间"
            onChange={(completedStart, completedEnd) => state.applyPrimary({ completedStart, completedEnd })}
          />
        )}
      >
        <FilterDateRange label="检验有效期" startDate={state.pendingFilters.validStart} endDate={state.pendingFilters.validEnd} onChange={(validStart, validEnd) => state.setPendingFilters((prev) => ({ ...prev, validStart, validEnd }))} />
        <FilterSelect label="办理人" value={state.pendingFilters.executor} options={toFilterSelectOptions(options(rows, (row) => row.executor))} onChange={(executor) => state.setPendingFilters((prev) => ({ ...prev, executor }))} />
      </DetailRecordFilterBar>
      <DetailRecordTable title="年审记录列表" columns={columns} rows={state.paged} />
      <DetailRecordFooter page={state.page} pageSize={state.pageSize} total={state.filtered.length} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
    </section>
  );
}

export interface LogisticsRecordRow extends RecordWithId {
  plateNo?: string;
  waybillNo?: string;
  projectName?: string;
  customerName?: string;
  routeName?: string;
  departDate?: string;
  arriveDate?: string;
  driverName?: string;
  status?: string;
}

const EMPTY_LOGISTICS_FILTERS = {
  startDate: '',
  endDate: '',
  customerName: '',
  status: '',
  waybillNo: '',
};

export function DetailLogisticsRecordsTab({
  rows,
  onToast,
}: BaseRecordTabProps<LogisticsRecordRow>) {
  const state = useRecordRows(
    rows,
    EMPTY_LOGISTICS_FILTERS,
    (row, filters) => (
      inDateRange(row.departDate, filters.startDate, filters.endDate)
      && includes(row.customerName, filters.customerName)
      && includes(row.waybillNo, filters.waybillNo)
      && (!filters.status || row.status === filters.status)
    ),
  );
  const columns: DetailRecordColumn<LogisticsRecordRow>[] = [
    {
      key: 'waybillNo',
      label: '运单号',
      width: 170,
      render: (row) => text(row.waybillNo) === '—' ? '—' : (
        <RecordLink onClick={() => onToast(`即将跳转至物流运单详情（原型演示）：${text(row.plateNo)} · ${text(row.waybillNo)}`)}>
          {row.waybillNo}
        </RecordLink>
      ),
    },
    { key: 'projectName', label: '项目名称', width: 200, render: (row) => text(row.projectName) },
    { key: 'customerName', label: '客户名称', width: 220, render: (row) => text(row.customerName) },
    { key: 'routeName', label: '线路', width: 180, render: (row) => text(row.routeName) },
    { key: 'departDate', label: '发车日期', width: 130, className: 'tabular-nums', render: (row) => text(row.departDate) },
    { key: 'arriveDate', label: '到达日期', width: 130, className: 'tabular-nums', render: (row) => text(row.arriveDate) },
    { key: 'driverName', label: '司机', width: 100, render: (row) => text(row.driverName) },
    { key: 'status', label: '状态', width: 110, render: (row) => text(row.status) },
  ];

  return (
    <section className="va-record-tab" aria-label="物流记录">
      <DetailRecordFilterBar
        title="物流记录"
        onQuery={state.query}
        onReset={state.reset}
        activeCount={state.moreFilterCount(['startDate', 'endDate'])}
        toolbarFilter={(
          <FilterToolbarDateRange
            startDate={state.pendingFilters.startDate}
            endDate={state.pendingFilters.endDate}
            placeholder="发车日期范围"
            ariaLabel="发车日期"
            onChange={(startDate, endDate) => state.applyPrimary({ startDate, endDate })}
          />
        )}
      >
        <FilterTextInput label="运单号" value={state.pendingFilters.waybillNo} onChange={(waybillNo) => state.setPendingFilters((prev) => ({ ...prev, waybillNo }))} />
        <FilterTextInput label="客户名称" value={state.pendingFilters.customerName} onChange={(customerName) => state.setPendingFilters((prev) => ({ ...prev, customerName }))} />
        <FilterSelect label="状态" value={state.pendingFilters.status} options={toFilterSelectOptions(options(rows, (row) => row.status))} onChange={(status) => state.setPendingFilters((prev) => ({ ...prev, status }))} />
      </DetailRecordFilterBar>
      <DetailRecordTable title="物流记录列表" columns={columns} rows={state.paged} />
      <DetailRecordFooter page={state.page} pageSize={state.pageSize} total={state.filtered.length} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
    </section>
  );
}

export interface InspectRecordRow extends RecordWithId {
  plateNo?: string;
  inspectNo?: string;
  inspectType?: string;
  inspectResult?: string;
  inspectDate?: string;
  inspector?: string;
  mileage?: number | null;
  remark?: string;
}

const EMPTY_INSPECT_FILTERS = {
  startDate: '',
  endDate: '',
  inspectType: '',
  inspectResult: '',
  inspector: '',
};

export function DetailInspectRecordsTab({
  rows,
  onToast,
}: BaseRecordTabProps<InspectRecordRow>) {
  const state = useRecordRows(
    rows,
    EMPTY_INSPECT_FILTERS,
    (row, filters) => (
      inDateRange(row.inspectDate, filters.startDate, filters.endDate)
      && (!filters.inspectType || row.inspectType === filters.inspectType)
      && (!filters.inspectResult || row.inspectResult === filters.inspectResult)
      && (!filters.inspector || row.inspector === filters.inspector)
    ),
  );
  const columns: DetailRecordColumn<InspectRecordRow>[] = [
    {
      key: 'inspectNo',
      label: '验车单号',
      width: 160,
      render: (row) => text(row.inspectNo) === '—' ? '—' : (
        <RecordLink onClick={() => onToast(`即将跳转至验车管理详情（原型演示）：${text(row.plateNo)} · ${text(row.inspectNo)}`)}>
          {row.inspectNo}
        </RecordLink>
      ),
    },
    { key: 'inspectType', label: '验车类型', width: 120, render: (row) => text(row.inspectType) },
    { key: 'inspectResult', label: '验车结果', width: 110, render: (row) => text(row.inspectResult) },
    { key: 'inspectDate', label: '验车日期', width: 130, className: 'tabular-nums', render: (row) => text(row.inspectDate) },
    { key: 'inspector', label: '验车人', width: 110, render: (row) => text(row.inspector) },
    { key: 'mileage', label: '验车里程', width: 120, className: 'tabular-nums', render: (row) => numeric(row.mileage) },
    { key: 'remark', label: '备注', width: 220, render: (row) => text(row.remark) },
  ];

  return (
    <section className="va-record-tab" aria-label="验车记录">
      <DetailRecordFilterBar
        title="验车记录"
        onQuery={state.query}
        onReset={state.reset}
        activeCount={state.moreFilterCount(['startDate', 'endDate'])}
        toolbarFilter={(
          <FilterToolbarDateRange
            startDate={state.pendingFilters.startDate}
            endDate={state.pendingFilters.endDate}
            placeholder="验车日期范围"
            ariaLabel="验车日期"
            onChange={(startDate, endDate) => state.applyPrimary({ startDate, endDate })}
          />
        )}
      >
        <FilterSelect label="验车类型" value={state.pendingFilters.inspectType} options={toFilterSelectOptions(options(rows, (row) => row.inspectType))} onChange={(inspectType) => state.setPendingFilters((prev) => ({ ...prev, inspectType }))} />
        <FilterSelect label="验车结果" value={state.pendingFilters.inspectResult} options={toFilterSelectOptions(options(rows, (row) => row.inspectResult))} onChange={(inspectResult) => state.setPendingFilters((prev) => ({ ...prev, inspectResult }))} />
        <FilterSelect label="验车人" value={state.pendingFilters.inspector} options={toFilterSelectOptions(options(rows, (row) => row.inspector))} onChange={(inspector) => state.setPendingFilters((prev) => ({ ...prev, inspector }))} />
      </DetailRecordFilterBar>
      <DetailRecordTable title="验车记录列表" columns={columns} rows={state.paged} />
      <DetailRecordFooter page={state.page} pageSize={state.pageSize} total={state.filtered.length} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
    </section>
  );
}

export interface DeliveryRecordRow extends RecordWithId {
  plateNo?: string;
  contractNo?: string;
  projectName?: string;
  customerName?: string;
  deliveryDate?: string;
  deliveryPerson?: string;
  deliveryMileage?: number | null;
  deliveryLocation?: string;
}

const EMPTY_DELIVERY_FILTERS = {
  startDate: '',
  endDate: '',
  contractNo: '',
  customerName: '',
  deliveryPerson: '',
};

export function DetailDeliveryRecordsTab({
  rows,
  onToast,
}: BaseRecordTabProps<DeliveryRecordRow>) {
  const state = useRecordRows(
    rows,
    EMPTY_DELIVERY_FILTERS,
    (row, filters) => (
      inDateRange(row.deliveryDate, filters.startDate, filters.endDate)
      && includes(row.contractNo, filters.contractNo)
      && includes(row.customerName, filters.customerName)
      && (!filters.deliveryPerson || row.deliveryPerson === filters.deliveryPerson)
    ),
  );
  const columns: DetailRecordColumn<DeliveryRecordRow>[] = [
    {
      key: 'contractNo',
      label: '合同编码',
      width: 180,
      render: (row) => text(row.contractNo) === '—' ? '—' : (
        <RecordLink onClick={() => onToast(`即将跳转至交车管理详情（原型演示）：${text(row.plateNo)} · ${text(row.contractNo)}`)}>
          {row.contractNo}
        </RecordLink>
      ),
    },
    { key: 'projectName', label: '项目名称', width: 200, render: (row) => text(row.projectName) },
    { key: 'customerName', label: '客户名称', width: 220, render: (row) => text(row.customerName) },
    {
      key: 'deliveryDate',
      label: '交车日期',
      width: 130,
      className: 'tabular-nums',
      render: (row) => text(row.deliveryDate) === '—' ? '—' : (
        <RecordLink onClick={() => onToast(`即将跳转至交车管理详情（原型演示）：${text(row.plateNo)} · ${text(row.deliveryDate)}`)}>
          {row.deliveryDate}
        </RecordLink>
      ),
    },
    { key: 'deliveryPerson', label: '交车人', width: 110, render: (row) => text(row.deliveryPerson) },
    { key: 'deliveryMileage', label: '交车里程', width: 120, className: 'tabular-nums', render: (row) => numeric(row.deliveryMileage) },
    { key: 'deliveryLocation', label: '交车地点', width: 200, render: (row) => text(row.deliveryLocation) },
  ];

  return (
    <section className="va-record-tab" aria-label="交车记录">
      <DetailRecordFilterBar
        title="交车记录"
        onQuery={state.query}
        onReset={state.reset}
        activeCount={state.moreFilterCount(['startDate', 'endDate'])}
        toolbarFilter={(
          <FilterToolbarDateRange
            startDate={state.pendingFilters.startDate}
            endDate={state.pendingFilters.endDate}
            placeholder="交车日期范围"
            ariaLabel="交车日期"
            onChange={(startDate, endDate) => state.applyPrimary({ startDate, endDate })}
          />
        )}
      >
        <FilterTextInput label="合同编码" value={state.pendingFilters.contractNo} onChange={(contractNo) => state.setPendingFilters((prev) => ({ ...prev, contractNo }))} />
        <FilterTextInput label="客户名称" value={state.pendingFilters.customerName} onChange={(customerName) => state.setPendingFilters((prev) => ({ ...prev, customerName }))} />
        <FilterSelect label="交车人" value={state.pendingFilters.deliveryPerson} options={toFilterSelectOptions(options(rows, (row) => row.deliveryPerson))} onChange={(deliveryPerson) => state.setPendingFilters((prev) => ({ ...prev, deliveryPerson }))} />
      </DetailRecordFilterBar>
      <DetailRecordTable title="交车记录列表" columns={columns} rows={state.paged} />
      <DetailRecordFooter page={state.page} pageSize={state.pageSize} total={state.filtered.length} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
    </section>
  );
}

export interface ReturnRecordRow extends RecordWithId {
  plateNo?: string;
  contractNo?: string;
  projectName?: string;
  customerName?: string;
  returnDate?: string;
  returnPerson?: string;
  returnMileage?: number | null;
  returnLocation?: string;
  returnReason?: string;
}

const EMPTY_RETURN_FILTERS = {
  startDate: '',
  endDate: '',
  contractNo: '',
  customerName: '',
  returnPerson: '',
};

export function DetailReturnRecordsTab({
  rows,
  onToast,
}: BaseRecordTabProps<ReturnRecordRow>) {
  const state = useRecordRows(
    rows,
    EMPTY_RETURN_FILTERS,
    (row, filters) => (
      inDateRange(row.returnDate, filters.startDate, filters.endDate)
      && includes(row.contractNo, filters.contractNo)
      && includes(row.customerName, filters.customerName)
      && (!filters.returnPerson || row.returnPerson === filters.returnPerson)
    ),
  );
  const columns: DetailRecordColumn<ReturnRecordRow>[] = [
    {
      key: 'contractNo',
      label: '合同编码',
      width: 180,
      render: (row) => text(row.contractNo) === '—' ? '—' : (
        <RecordLink onClick={() => onToast(`即将跳转至还车管理详情（原型演示）：${text(row.plateNo)} · ${text(row.contractNo)}`)}>
          {row.contractNo}
        </RecordLink>
      ),
    },
    { key: 'projectName', label: '项目名称', width: 200, render: (row) => text(row.projectName) },
    { key: 'customerName', label: '客户名称', width: 220, render: (row) => text(row.customerName) },
    {
      key: 'returnDate',
      label: '还车日期',
      width: 130,
      className: 'tabular-nums',
      render: (row) => text(row.returnDate) === '—' ? '—' : (
        <RecordLink onClick={() => onToast(`即将跳转至还车管理详情（原型演示）：${text(row.plateNo)} · ${text(row.returnDate)}`)}>
          {row.returnDate}
        </RecordLink>
      ),
    },
    { key: 'returnPerson', label: '还车人', width: 110, render: (row) => text(row.returnPerson) },
    { key: 'returnMileage', label: '还车里程', width: 120, className: 'tabular-nums', render: (row) => numeric(row.returnMileage) },
    { key: 'returnLocation', label: '还车地点', width: 180, render: (row) => text(row.returnLocation) },
    { key: 'returnReason', label: '还车原因', width: 160, render: (row) => text(row.returnReason) },
  ];

  return (
    <section className="va-record-tab" aria-label="还车记录">
      <DetailRecordFilterBar
        title="还车记录"
        onQuery={state.query}
        onReset={state.reset}
        activeCount={state.moreFilterCount(['startDate', 'endDate'])}
        toolbarFilter={(
          <FilterToolbarDateRange
            startDate={state.pendingFilters.startDate}
            endDate={state.pendingFilters.endDate}
            placeholder="还车日期范围"
            ariaLabel="还车日期"
            onChange={(startDate, endDate) => state.applyPrimary({ startDate, endDate })}
          />
        )}
      >
        <FilterTextInput label="合同编码" value={state.pendingFilters.contractNo} onChange={(contractNo) => state.setPendingFilters((prev) => ({ ...prev, contractNo }))} />
        <FilterTextInput label="客户名称" value={state.pendingFilters.customerName} onChange={(customerName) => state.setPendingFilters((prev) => ({ ...prev, customerName }))} />
        <FilterSelect label="还车人" value={state.pendingFilters.returnPerson} options={toFilterSelectOptions(options(rows, (row) => row.returnPerson))} onChange={(returnPerson) => state.setPendingFilters((prev) => ({ ...prev, returnPerson }))} />
      </DetailRecordFilterBar>
      <DetailRecordTable title="还车记录列表" columns={columns} rows={state.paged} />
      <DetailRecordFooter page={state.page} pageSize={state.pageSize} total={state.filtered.length} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
    </section>
  );
}

export interface ReplaceRecordRow extends RecordWithId {
  plateNo?: string;
  replaceNo?: string;
  contractNo?: string;
  projectName?: string;
  customerName?: string;
  replaceDate?: string;
  replaceType?: string;
  fromPlateNo?: string;
  toPlateNo?: string;
  operator?: string;
  reason?: string;
}

const EMPTY_REPLACE_FILTERS = {
  startDate: '',
  endDate: '',
  replaceType: '',
  customerName: '',
  operator: '',
};

export function DetailReplaceRecordsTab({
  rows,
  onToast,
}: BaseRecordTabProps<ReplaceRecordRow>) {
  const state = useRecordRows(
    rows,
    EMPTY_REPLACE_FILTERS,
    (row, filters) => (
      inDateRange(row.replaceDate, filters.startDate, filters.endDate)
      && includes(row.customerName, filters.customerName)
      && (!filters.replaceType || row.replaceType === filters.replaceType)
      && (!filters.operator || row.operator === filters.operator)
    ),
  );
  const columns: DetailRecordColumn<ReplaceRecordRow>[] = [
    {
      key: 'replaceNo',
      label: '替换单号',
      width: 160,
      render: (row) => text(row.replaceNo) === '—' ? '—' : (
        <RecordLink onClick={() => onToast(`即将跳转至替换管理详情（原型演示）：${text(row.plateNo)} · ${text(row.replaceNo)}`)}>
          {row.replaceNo}
        </RecordLink>
      ),
    },
    { key: 'contractNo', label: '合同编码', width: 170, render: (row) => text(row.contractNo) },
    { key: 'projectName', label: '项目名称', width: 180, render: (row) => text(row.projectName) },
    { key: 'customerName', label: '客户名称', width: 200, render: (row) => text(row.customerName) },
    { key: 'replaceDate', label: '替换日期', width: 130, className: 'tabular-nums', render: (row) => text(row.replaceDate) },
    { key: 'replaceType', label: '替换类型', width: 120, render: (row) => text(row.replaceType) },
    { key: 'fromPlateNo', label: '原车牌', width: 120, className: 'tabular-nums', render: (row) => text(row.fromPlateNo) },
    { key: 'toPlateNo', label: '新车牌', width: 120, className: 'tabular-nums', render: (row) => text(row.toPlateNo) },
    { key: 'operator', label: '办理人', width: 100, render: (row) => text(row.operator) },
    { key: 'reason', label: '替换原因', width: 180, render: (row) => text(row.reason) },
  ];

  return (
    <section className="va-record-tab" aria-label="替换记录">
      <DetailRecordFilterBar
        title="替换记录"
        onQuery={state.query}
        onReset={state.reset}
        activeCount={state.moreFilterCount(['startDate', 'endDate'])}
        toolbarFilter={(
          <FilterToolbarDateRange
            startDate={state.pendingFilters.startDate}
            endDate={state.pendingFilters.endDate}
            placeholder="替换日期范围"
            ariaLabel="替换日期"
            onChange={(startDate, endDate) => state.applyPrimary({ startDate, endDate })}
          />
        )}
      >
        <FilterSelect label="替换类型" value={state.pendingFilters.replaceType} options={toFilterSelectOptions(options(rows, (row) => row.replaceType))} onChange={(replaceType) => state.setPendingFilters((prev) => ({ ...prev, replaceType }))} />
        <FilterTextInput label="客户名称" value={state.pendingFilters.customerName} onChange={(customerName) => state.setPendingFilters((prev) => ({ ...prev, customerName }))} />
        <FilterSelect label="办理人" value={state.pendingFilters.operator} options={toFilterSelectOptions(options(rows, (row) => row.operator))} onChange={(operator) => state.setPendingFilters((prev) => ({ ...prev, operator }))} />
      </DetailRecordFilterBar>
      <DetailRecordTable title="替换记录列表" columns={columns} rows={state.paged} />
      <DetailRecordFooter page={state.page} pageSize={state.pageSize} total={state.filtered.length} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
    </section>
  );
}
