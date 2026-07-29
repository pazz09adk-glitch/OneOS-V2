/**
 * @name 故障处置
 * @description OneOS V2 车辆故障处置台账：列表 / 看板 / 主从三视角 · 30 天处置时限 · 证据链归档
 */
import React, { useMemo, useState } from 'react';
import {
  Wrench,
  Plus,
  Download,
  RotateCcw,
  Filter,
  Search,
  AlertTriangle,
  Clock,
  PauseCircle,
  FileSpreadsheet,
  List,
  LayoutGrid,
  Columns,
  ChevronRight,
  BellRing,
  CheckCircle2,
} from 'lucide-react';
import type { FaultRecord, FaultTaskStatus, FaultFilters } from './types';
import { INITIAL_FAULT_FILTERS } from './types';
import { MOCK_FAULT_RECORDS, pickSeedVehicleForCreate, vehicleFieldsFromSeed } from './mockData';
import {
  getSlaInfo,
  isUrgentOrOverdue,
  TASK_STATUS_LABEL,
  KANBAN_COLUMNS,
  formatCategories,
  recordHasCategory,
  splitCategoriesForDisplay,
  generateFaultCode,
} from './utils';
import { FaultDetailPage } from './components/FaultDetailPage';
import { FaultHandlePage } from './components/FaultHandlePage';
import { FaultRowActionsMenu } from './components/FaultRowActionsMenu';
import { SuspendModal } from './components/SuspendModal';
import { NoticeModal } from './components/NoticeModal';
import {
  V2Select,
  V2Pagination,
  V2Empty,
  V2SingleInputDateRangePicker,
  V2FilterSearch,
  V2FilterMoreButton,
} from '../../resources/design-system/components/UIComponents';
import '../../resources/design-system/oneos-ds-tokens.css';
import './styles/vehicle-fault.css';

type ViewMode = 'list' | 'kanban' | 'split';
type PageMode = 'ledger' | 'detail' | 'handle';
/** all=全部；open_work=待处理+处理中+挂起（KPI 深链）；其余为单一任务状态 */
type StatusTab = FaultTaskStatus | 'all' | 'open_work';

const OPEN_WORK_STATUSES: FaultTaskStatus[] = ['pending', 'processing', 'suspended'];

const CATEGORY_OPTIONS = [
  { value: 'all', label: '全部故障部位' },
  { value: '底盘系统', label: '底盘系统' },
  { value: '三电系统', label: '三电系统' },
  { value: '整车控制', label: '整车控制' },
  { value: '燃料电池系统', label: '燃料电池系统' },
  { value: '供氢系统', label: '供氢系统' },
  { value: '空调系统', label: '空调系统' },
  { value: '冷机系统', label: '冷机系统' },
  { value: '其他', label: '其他' },
];

const LEVEL_OPTIONS = [
  { value: 'all', label: '全部等级' },
  { value: 'L1-特急', label: 'L1-特急' },
  { value: 'L2-紧急', label: 'L2-紧急' },
  { value: 'L3-一般', label: 'L3-一般' },
  { value: 'L4-提示', label: 'L4-提示' },
];

const SOURCE_OPTIONS = [
  { value: 'all', label: '全部来源' },
  { value: 'AI机器人上报', label: 'AI机器人上报' },
  { value: '司机报修', label: '司机报修' },
  { value: '客户报告', label: '客户报告' },
  { value: '定期巡检', label: '定期巡检' },
  { value: '车机遥测', label: '车机遥测' },
];

function matchFaultRecord(
  item: FaultRecord,
  selectedTab: StatusTab,
  filters: FaultFilters
): boolean {
  if (selectedTab === 'open_work') {
    if (!OPEN_WORK_STATUSES.includes(item.taskStatus)) return false;
  } else if (selectedTab !== 'all' && item.taskStatus !== selectedTab) {
    return false;
  }
  if (filters.taskStatus !== 'all' && item.taskStatus !== filters.taskStatus) return false;
  if (filters.resolveStatus !== 'all' && item.resolveStatus !== filters.resolveStatus) {
    return false;
  }
  if (filters.level !== 'all' && item.level !== filters.level) return false;
  if (filters.category !== 'all' && !recordHasCategory(item, filters.category)) return false;
  if (filters.source !== 'all' && item.source !== filters.source) return false;
  if (filters.opsManager !== 'all' && item.opsManager !== filters.opsManager) return false;

  if (filters.plateKeyword.trim()) {
    const q = filters.plateKeyword.trim().toLowerCase();
    if (
      !item.plate.toLowerCase().includes(q) &&
      !item.brand.toLowerCase().includes(q) &&
      !item.model.toLowerCase().includes(q)
    ) {
      return false;
    }
  }

  if (filters.faultCodeKeyword.trim()) {
    const q = filters.faultCodeKeyword.trim().toLowerCase();
    if (!item.id.toLowerCase().includes(q)) return false;
  }

  if (filters.operateCityKeyword.trim()) {
    const q = filters.operateCityKeyword.trim().toLowerCase();
    if (
      !item.operateCity.toLowerCase().includes(q) &&
      !item.operateCompany.toLowerCase().includes(q)
    ) {
      return false;
    }
  }

  if (filters.deadlineRange) {
    const [start, end] = filters.deadlineRange;
    const d = item.deadlineTime.slice(0, 10);
    if (start && d < start) return false;
    if (end && d > end) return false;
  }

  if (filters.isUrgentOnly && !isUrgentOrOverdue(item)) return false;

  return true;
}

function countActiveMoreFilters(f: FaultFilters): number {
  let n = 0;
  if (f.faultCodeKeyword.trim()) n += 1;
  if (f.category !== 'all') n += 1;
  if (f.level !== 'all') n += 1;
  if (f.resolveStatus !== 'all') n += 1;
  if (f.source !== 'all') n += 1;
  if (f.opsManager !== 'all') n += 1;
  if (f.operateCityKeyword.trim()) n += 1;
  if (f.deadlineRange) n += 1;
  return n;
}

export function VehicleFaultHandlingHub() {
  const [records, setRecords] = useState<FaultRecord[]>(MOCK_FAULT_RECORDS);
  /** 已生效：驱动列表刷新 */
  const [appliedFilters, setAppliedFilters] = useState<FaultFilters>(INITIAL_FAULT_FILTERS);
  /** 草稿：更多筛选面板内编辑，点「筛选」后才生效 */
  const [pendingFilters, setPendingFilters] = useState<FaultFilters>(INITIAL_FAULT_FILTERS);
  const [selectedTab, setSelectedTab] = useState<StatusTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [splitSelectedId, setSplitSelectedId] = useState<string | null>(
    MOCK_FAULT_RECORDS[0]?.id ?? null
  );

  const [pageMode, setPageMode] = useState<PageMode>('ledger');
  const [pageItem, setPageItem] = useState<FaultRecord | null>(null);
  const [handleReturnTo, setHandleReturnTo] = useState<'ledger' | 'detail'>('ledger');
  const [suspendModalItem, setSuspendModalItem] = useState<FaultRecord | null>(null);
  const [noticeModalItem, setNoticeModalItem] = useState<FaultRecord | null>(null);

  const kpiStats = useMemo(() => {
    const total = records.length;
    const openWorkCount = records.filter((r) => OPEN_WORK_STATUSES.includes(r.taskStatus)).length;
    const archivedCount = records.filter((r) => r.taskStatus === 'archived').length;
    const urgentOrOverdueCount = records.filter((r) => isUrgentOrOverdue(r)).length;
    const shareOf = (n: number) =>
      total === 0 ? '0%' : `${Math.round((n / total) * 100)}%`;
    return {
      total,
      openWorkCount,
      archivedCount,
      urgentOrOverdueCount,
      openWorkShare: shareOf(openWorkCount),
      archivedShare: shareOf(archivedCount),
      urgentOrOverdueShare: shareOf(urgentOrOverdueCount),
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((item) => matchFaultRecord(item, selectedTab, appliedFilters));
  }, [records, selectedTab, appliedFilters]);

  /** 面板内实时预估匹配数（尚未点筛选时） */
  const liveMatchCount = useMemo(() => {
    return records.filter((item) => matchFaultRecord(item, selectedTab, pendingFilters)).length;
  }, [records, selectedTab, pendingFilters]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const opsManagerOptions = useMemo(() => {
    const managers = Array.from(new Set(records.map((r) => r.opsManager)));
    return [
      { value: 'all', label: '全部运维负责人' },
      ...managers.map((m) => ({ value: m, label: m })),
    ];
  }, [records]);

  const splitSelected =
    filteredRecords.find((r) => r.id === splitSelectedId) ||
    filteredRecords[0] ||
    records[0] ||
    null;

  const activeMoreFilterCount = useMemo(
    () => countActiveMoreFilters(appliedFilters),
    [appliedFilters]
  );

  const openMoreFilters = () => {
    setPendingFilters(appliedFilters);
    setShowMoreFilters(true);
  };

  const closeMoreFilters = () => {
    setPendingFilters(appliedFilters);
    setShowMoreFilters(false);
  };

  /** 应用草稿条件 → 刷新列表并收起筛选栏 */
  const applyFiltersAndCollapse = () => {
    setAppliedFilters(pendingFilters);
    setShowMoreFilters(false);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setPendingFilters(INITIAL_FAULT_FILTERS);
    setAppliedFilters(INITIAL_FAULT_FILTERS);
    setSelectedTab('all');
    setShowMoreFilters(false);
    setCurrentPage(1);
  };

  const patchPending = (patch: Partial<FaultFilters>) => {
    setPendingFilters((prev) => ({ ...prev, ...patch }));
  };

  /** 工具条车牌搜索：即时生效（对齐车辆资产快捷搜索） */
  const setPlateKeywordLive = (plateKeyword: string) => {
    setPendingFilters((prev) => ({ ...prev, plateKeyword }));
    setAppliedFilters((prev) => ({ ...prev, plateKeyword }));
    setCurrentPage(1);
  };

  const setUrgentOnlyLive = (isUrgentOnly: boolean) => {
    setPendingFilters((prev) => ({ ...prev, isUrgentOnly }));
    setAppliedFilters((prev) => ({ ...prev, isUrgentOnly }));
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    const headers = [
      '故障单号',
      '车牌号码',
      '车辆品牌',
      '车辆型号',
      '运营城市',
      '运营公司',
      '故障部位',
      '故障等级',
      '解决情况',
      '任务状态',
      '最后完成时限',
      '运维负责人',
      '上报时间',
    ];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.plate,
      r.brand,
      r.model,
      r.operateCity,
      r.operateCompany,
      formatCategories(r.categories),
      r.level,
      r.resolveStatus,
      TASK_STATUS_LABEL[r.taskStatus],
      r.deadlineTime,
      r.opsManager,
      r.reportTime,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute(
      'download',
      `OneOS_车辆故障处置台账_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateNew = () => {
    const vehicle = pickSeedVehicleForCreate();
    const fields = vehicleFieldsFromSeed(vehicle);
    const now = new Date();
    const reportTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newRecord: FaultRecord = {
      id: generateFaultCode(
        now,
        records.map((r) => r.id)
      ),
      ...fields,
      taskStatus: 'pending',
      resolveStatus: '未解决',
      level: 'L2-紧急',
      categories: ['三电系统'],
      source: 'AI机器人上报',
      reportTime,
      deadlineTime:
        new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10) + ' 23:59',
      lastOperationTime: new Date().toLocaleString('zh-CN'),
      lastOperator: fields.opsManager,
      description: 'AI 自动排查录入：新报修故障单据...',
      attachments: [],
      suspendHistory: [],
      notificationHistory: [],
    };
    setPageItem(newRecord);
    setHandleReturnTo('ledger');
    setPageMode('handle');
  };

  const openDetail = (row: FaultRecord) => {
    setPageItem(row);
    setPageMode('detail');
  };

  const openHandle = (row: FaultRecord, from: 'ledger' | 'detail' = 'ledger') => {
    setPageItem(row);
    setHandleReturnTo(from);
    setPageMode('handle');
  };

  const backFromDetail = () => {
    setPageMode('ledger');
    setPageItem(null);
  };

  const backFromHandle = () => {
    if (handleReturnTo === 'detail' && pageItem) {
      setPageMode('detail');
      return;
    }
    setPageMode('ledger');
    setPageItem(null);
  };

  const livePageItem = useMemo(() => {
    if (!pageItem) return null;
    return records.find((r) => r.id === pageItem.id) ?? pageItem;
  }, [records, pageItem]);

  const syncRecord = (updated: FaultRecord) => {
    setRecords((prev) => {
      const exists = prev.some((r) => r.id === updated.id);
      if (exists) return prev.map((r) => (r.id === updated.id ? updated : r));
      return [updated, ...prev];
    });
    setPageItem(updated);
    if (splitSelectedId === updated.id) setSplitSelectedId(updated.id);
  };

  const handleSaveModal = (updated: FaultRecord, _isArchive: boolean) => {
    syncRecord(updated);
    if (handleReturnTo === 'detail') {
      setPageMode('detail');
    } else {
      setPageMode('ledger');
      setPageItem(null);
    }
  };

  const handleConfirmSuspend = (updated: FaultRecord) => {
    syncRecord(updated);
    setSuspendModalItem(null);
  };

  const handleSendNotice = (updated: FaultRecord) => {
    syncRecord(updated);
  };

  const openSplit = (item: FaultRecord) => {
    setSplitSelectedId(item.id);
    setViewMode('split');
  };

  /** 处置时限：一律不用标签；剩余天数等为 Caption 辅文（12px / muted） */
  const renderSlaCell = (item: FaultRecord) => {
    const sla = getSlaInfo(item);
    return <span className={`v2-fh-sla-hint ${sla.cls}`}>{sla.label}</span>;
  };

  const viewBtn = (mode: ViewMode, label: string, Icon: typeof List) => (
    <button
      key={mode}
      type="button"
      className={`v2-fh-view-btn ${viewMode === mode ? 'active' : ''}`}
      onClick={() => setViewMode(mode)}
    >
      <Icon style={{ width: 14, height: 14 }} />
      {label}
    </button>
  );

  /**
   * 列表只读态文案：默认正文色；仅告警语义上色
   * （预警橙 / 警告红；不用绿/蓝/紫胶囊，避免台账「彩虹」）
   */
  const statusText = (status: FaultTaskStatus) => (
    <span
      className={`v2-fh-meta-text${status === 'suspended' ? ' is-warning' : ''}`}
    >
      {TASK_STATUS_LABEL[status]}
    </span>
  );

  const resolveText = (status: FaultRecord['resolveStatus']) => (
    <span
      className={`v2-fh-meta-text${
        status === '未解决' ? ' is-danger' : status === '临时排故' ? ' is-warning' : ''
      }`}
    >
      {status}
    </span>
  );

  /** 故障等级：L1 警告红、L2 预警橙，其余正文 */
  const levelText = (level: FaultRecord['level']) => {
    const tone =
      level === 'L1-特急' ? 'l1' : level === 'L2-紧急' ? 'l2' : 'plain';
    return <span className={`v2-fh-level v2-fh-level--${tone}`}>{level}</span>;
  };

  const categoriesText = (categories: FaultRecord['categories'], max = 2) => {
    const { visible, overflow } = splitCategoriesForDisplay(categories, max);
    return (
      <span className="v2-fh-cell-body">
        {visible.join('、')}
        {overflow > 0 ? (
          <span className="v2-fh-cell-sub"> +{overflow}</span>
        ) : null}
      </span>
    );
  };

  if (pageMode === 'detail' && livePageItem) {
    return (
      <div className="v2-fh-container" data-annotation-id="vehicle-fault-handling-hub">
        <FaultDetailPage
          item={livePageItem}
          onBack={backFromDetail}
          onOpenEdit={(item) => openHandle(item, 'detail')}
          onOpenSuspend={(item) => setSuspendModalItem(item)}
          onOpenNotice={(item) => setNoticeModalItem(item)}
        />
        <SuspendModal
          isOpen={!!suspendModalItem}
          item={suspendModalItem}
          onClose={() => setSuspendModalItem(null)}
          onConfirmSuspend={handleConfirmSuspend}
        />
        <NoticeModal
          isOpen={!!noticeModalItem}
          item={noticeModalItem}
          onClose={() => setNoticeModalItem(null)}
          onSendNotice={handleSendNotice}
        />
      </div>
    );
  }

  if (pageMode === 'handle' && livePageItem) {
    return (
      <div className="v2-fh-container" data-annotation-id="vehicle-fault-handling-hub">
        <FaultHandlePage
          item={livePageItem}
          onBack={backFromHandle}
          onSave={handleSaveModal}
        />
      </div>
    );
  }

  return (
    <div className="v2-fh-container" data-annotation-id="vehicle-fault-handling-hub">
      {/* 顶栏对齐车辆资产 / 租赁合同：仅视图切换 + 主操作 */}
      <div className="v2-fh-toolbar">
        <div className="v2-fh-view-switch" role="tablist" aria-label="视图模式">
          {viewBtn('list', '列表模式', List)}
          {viewBtn('kanban', '看板模式', LayoutGrid)}
          {viewBtn('split', '主从/表单', Columns)}
        </div>
        <div className="v2-fh-toolbar__actions">
          <button type="button" className="v2-fh-btn v2-fh-btn--primary" onClick={handleCreateNew}>
            <Plus style={{ width: 14, height: 14 }} />
            新增故障登记
          </button>
        </div>
      </div>

      {viewMode !== 'split' && (
        <div className="v2-fh-kpi-grid" data-annotation-id="v2-fh-kpi-grid">
          <div
            className={`v2-fh-kpi-card ${selectedTab === 'all' && !appliedFilters.isUrgentOnly ? 'is-active' : ''}`}
            onClick={() => {
              setSelectedTab('all');
              setUrgentOnlyLive(false);
            }}
          >
            <div className="v2-fh-kpi-card__top">
              <span>故障台账总数</span>
              <FileSpreadsheet style={{ width: 16, height: 16, color: 'var(--oneos-primary)' }} />
            </div>
            <div className="v2-fh-kpi-card__value-row">
              <span className="v2-fh-kpi-card__num">{kpiStats.total}</span>
              <span className="v2-fh-kpi-card__unit">起</span>
            </div>
            <div className="v2-fh-kpi-card__foot">包含全部历史处置与归档记录</div>
          </div>

          <div
            className={`v2-fh-kpi-card ${selectedTab === 'open_work' ? 'is-active' : ''}`}
            onClick={() => {
              setSelectedTab('open_work');
              setUrgentOnlyLive(false);
            }}
          >
            <div className="v2-fh-kpi-card__top">
              <span>待处理与处理中</span>
              <Clock style={{ width: 16, height: 16, color: 'var(--oneos-primary)' }} />
            </div>
            <div className="v2-fh-kpi-card__value-row">
              <span className="v2-fh-kpi-card__num" style={{ color: 'var(--oneos-primary)' }}>
                {kpiStats.openWorkCount}
              </span>
              <span className="v2-fh-kpi-card__unit">起</span>
              <span className="v2-fh-kpi-card__share tabular-nums">
                占比 {kpiStats.openWorkShare}
              </span>
            </div>
            <div className="v2-fh-kpi-card__foot">含待处理、处理中与挂起，需跟进排故与归档</div>
          </div>

          <div
            className={`v2-fh-kpi-card ${selectedTab === 'archived' && !appliedFilters.isUrgentOnly ? 'is-active' : ''}`}
            onClick={() => {
              setSelectedTab('archived');
              setUrgentOnlyLive(false);
            }}
          >
            <div className="v2-fh-kpi-card__top">
              <span>已闭环</span>
              <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--ln-success, #10B981)' }} />
            </div>
            <div className="v2-fh-kpi-card__value-row">
              <span className="v2-fh-kpi-card__num" style={{ color: 'var(--ln-success, #10B981)' }}>
                {kpiStats.archivedCount}
              </span>
              <span className="v2-fh-kpi-card__unit">起</span>
              <span className="v2-fh-kpi-card__share tabular-nums">
                占比 {kpiStats.archivedShare}
              </span>
            </div>
            <div className="v2-fh-kpi-card__foot">已完成证据链归档的闭环单据</div>
          </div>

          <div
            className={`v2-fh-kpi-card ${appliedFilters.isUrgentOnly ? 'is-active' : ''}`}
            onClick={() => {
              setSelectedTab('all');
              setUrgentOnlyLive(!appliedFilters.isUrgentOnly);
            }}
          >
            <div className="v2-fh-kpi-card__top">
              <span>临期与逾期告警</span>
              <AlertTriangle style={{ width: 16, height: 16, color: 'var(--ln-error, #EF4444)' }} />
            </div>
            <div className="v2-fh-kpi-card__value-row">
              <span className="v2-fh-kpi-card__num" style={{ color: 'var(--ln-error, #EF4444)' }}>
                {kpiStats.urgentOrOverdueCount}
              </span>
              <span className="v2-fh-kpi-card__unit">起</span>
              <span
                className="v2-fh-kpi-card__share tabular-nums"
                style={{ color: 'var(--ln-error, #EF4444)' }}
              >
                占比 {kpiStats.urgentOrOverdueShare}
              </span>
            </div>
            <div className="v2-fh-kpi-card__foot" style={{ color: 'var(--ln-error)' }}>
              点击查看还有 7 天内到期或已超时的单据
            </div>
          </div>
        </div>
      )}

      {viewMode !== 'split' && (
        <div className={viewMode === 'list' ? 'v2-fh-ledger-stack' : 'v2-fh-ledger-stack is-detached'}>
          <section className="v2-fh-filter-panel" aria-label="列表筛选">
            <div className="v2-fh-ledger-toolbar">
              <div className="v2-fh-pills" role="tablist" aria-label="任务状态">
                {(
                  [
                    { key: 'all', label: '全部状态' },
                    { key: 'pending', label: '待处理' },
                    { key: 'processing', label: '处理中' },
                    { key: 'suspended', label: '已挂起' },
                    { key: 'archived', label: '已归档' },
                  ] as const
                ).map((tab) => {
                  const count =
                    tab.key === 'all'
                      ? records.length
                      : records.filter((r) => r.taskStatus === tab.key).length;
                  const isActive = selectedTab === tab.key && !appliedFilters.isUrgentOnly;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`v2-fh-pill ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedTab(tab.key);
                        setUrgentOnlyLive(false);
                      }}
                    >
                      {tab.label}
                      <span className="v2-fh-pill-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="v2-fh-ledger-actions v2-filter-toolbar-tools">
                <V2FilterSearch aria-label="搜索车牌或车型">
                  <input
                    type="text"
                    placeholder="搜索车牌 / 车型"
                    value={appliedFilters.plateKeyword}
                    onChange={(e) => setPlateKeywordLive(e.target.value)}
                    aria-label="搜索车牌或车型"
                  />
                </V2FilterSearch>
                <V2FilterMoreButton
                  open={showMoreFilters}
                  activeCount={activeMoreFilterCount}
                  onClick={() => (showMoreFilters ? closeMoreFilters() : openMoreFilters())}
                />
                <button type="button" className="v2-fh-btn v2-fh-btn--secondary" onClick={handleExportCsv}>
                  <Download style={{ width: 14, height: 14 }} />
                  导出
                </button>
              </div>
            </div>

            <div className={`v2-fh-more-filters-panel${showMoreFilters ? ' is-open' : ''}`}>
              {showMoreFilters ? (
                <div className="v2-fh-more-filters-panel__inner">
                  <div className="v2-fh-more-filters-grid">
                    <div className="v2-fh-filter-item">
                      <label>故障单号</label>
                      <input
                        type="text"
                        className="v2-fh-input"
                        placeholder="如 GZ20260624111101"
                        value={pendingFilters.faultCodeKeyword}
                        onChange={(e) => patchPending({ faultCodeKeyword: e.target.value })}
                      />
                    </div>
                    <div className="v2-fh-filter-item">
                      <label>故障部位 / 系统</label>
                      <V2Select
                        options={CATEGORY_OPTIONS}
                        value={pendingFilters.category}
                        onChange={(val) =>
                          patchPending({ category: val as FaultFilters['category'] })
                        }
                      />
                    </div>
                    <div className="v2-fh-filter-item">
                      <label>故障等级</label>
                      <V2Select
                        options={LEVEL_OPTIONS}
                        value={pendingFilters.level}
                        onChange={(val) => patchPending({ level: val as FaultFilters['level'] })}
                      />
                    </div>
                    <div className="v2-fh-filter-item">
                      <label>解决情况</label>
                      <V2Select
                        options={[
                          { value: 'all', label: '全部解决情况' },
                          { value: '未解决', label: '未解决' },
                          { value: '临时排故', label: '临时排故' },
                          { value: '已解决', label: '已解决' },
                        ]}
                        value={pendingFilters.resolveStatus}
                        onChange={(val) =>
                          patchPending({ resolveStatus: val as FaultFilters['resolveStatus'] })
                        }
                      />
                    </div>
                    <div className="v2-fh-filter-item">
                      <label>故障来源</label>
                      <V2Select
                        options={SOURCE_OPTIONS}
                        value={pendingFilters.source}
                        onChange={(val) => patchPending({ source: val as FaultFilters['source'] })}
                      />
                    </div>
                    <div className="v2-fh-filter-item">
                      <label>运维负责人</label>
                      <V2Select
                        options={opsManagerOptions}
                        value={pendingFilters.opsManager}
                        onChange={(val) =>
                          patchPending({ opsManager: val as FaultFilters['opsManager'] })
                        }
                      />
                    </div>
                    <div className="v2-fh-filter-item">
                      <label>运营城市 / 公司</label>
                      <input
                        type="text"
                        className="v2-fh-input"
                        placeholder="城市或运营公司"
                        value={pendingFilters.operateCityKeyword}
                        onChange={(e) => patchPending({ operateCityKeyword: e.target.value })}
                      />
                    </div>
                    <div className="v2-fh-filter-item v2-fh-filter-item--span2">
                      <label>最后完成时限</label>
                      <V2SingleInputDateRangePicker
                        startDate={pendingFilters.deadlineRange?.[0] || ''}
                        endDate={pendingFilters.deadlineRange?.[1] || ''}
                        onChange={(start, end) => {
                          patchPending({
                            deadlineRange: start || end ? [start, end] : null,
                          });
                        }}
                        placeholder="选择截止日区间"
                      />
                    </div>
                  </div>

                  <div className="v2-fh-more-filters-footer">
                    <div className="v2-fh-more-filters-meta">
                      <span>
                        预测匹配：<strong className="tabular-nums">{liveMatchCount}</strong> 起
                      </span>
                      {countActiveMoreFilters(pendingFilters) > 0 ? (
                        <span className="is-active">
                          已选 <strong className="tabular-nums">{countActiveMoreFilters(pendingFilters)}</strong>{' '}
                          项条件
                        </span>
                      ) : null}
                    </div>
                    <div className="v2-fh-more-filters-btns">
                      <button
                        type="button"
                        className="v2-fh-btn v2-fh-btn--secondary"
                        onClick={resetFilters}
                      >
                        <RotateCcw style={{ width: 14, height: 14 }} />
                        重置
                      </button>
                      <button
                        type="button"
                        className="v2-fh-btn v2-fh-btn--ghost"
                        onClick={closeMoreFilters}
                      >
                        收起面板
                      </button>
                      <button
                        type="button"
                        className="v2-fh-btn v2-fh-btn--primary"
                        onClick={applyFiltersAndCollapse}
                      >
                        <Search style={{ width: 14, height: 14 }} />
                        筛选（{liveMatchCount} 起）
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {viewMode === 'list' && (
            <section className="v2-fh-table-section" aria-label="故障台账列表">
              {paginatedRecords.length === 0 ? (
                <V2Empty
                  type={
                    appliedFilters.plateKeyword ||
                    appliedFilters.faultCodeKeyword ||
                    appliedFilters.isUrgentOnly ||
                    activeMoreFilterCount > 0
                      ? 'no_search'
                      : 'empty'
                  }
                  title="暂无符合条件的故障处置单据"
                  description="可调整筛选条件，或登记新的故障单据开始处置。"
                  primaryActionText="新增故障登记"
                  onPrimaryAction={handleCreateNew}
                  secondaryActionText="重置筛选"
                  onSecondaryAction={resetFilters}
                />
              ) : (
                <>
                  <div className="v2-fh-table-wrap">
                    <table className="v2-fh-table">
                      <thead>
                        <tr>
                          <th
                            className="sticky-left v2-fh-th-code"
                            title="点击故障编号可进入故障处置详情"
                          >
                            <span>故障编号</span>
                          </th>
                          <th style={{ minWidth: 160 }}>车辆信息</th>
                          <th style={{ width: 160 }}>故障部位</th>
                          <th style={{ width: 100 }}>故障等级</th>
                          <th style={{ width: 100 }}>解决情况</th>
                          <th style={{ width: 100 }}>任务状态</th>
                          <th style={{ width: 120 }}>处置时限</th>
                          <th style={{ width: 120 }}>截止日</th>
                          <th style={{ width: 100 }}>负责人</th>
                          <th style={{ minWidth: 160 }}>运营主体</th>
                          <th className="v2-fh-th-actions">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRecords.map((row) => (
                          <tr key={row.id}>
                            <td className="sticky-left v2-fh-td-code">
                              <button
                                type="button"
                                className="v2-fh-code-link"
                                onClick={() => openDetail(row)}
                                title="系统自动生成的故障编号，点击查看处置详情"
                                aria-label={`故障单号 ${row.id}，点击查看详情`}
                              >
                                <span className="v2-fh-code-link__text tabular-nums">{row.id}</span>
                                <span className="v2-fh-code-link__hint" aria-hidden>
                                  查看
                                  <ChevronRight size={13} strokeWidth={2.25} />
                                </span>
                              </button>
                            </td>
                            <td>
                              <div className="v2-fh-cell-body tabular-nums">{row.plate}</div>
                              <div className="v2-fh-cell-meta">
                                <span className="v2-fh-cell-sub">
                                  {row.brand} {row.model}
                                </span>
                              </div>
                            </td>
                            <td>{categoriesText(row.categories, 2)}</td>
                            <td>{levelText(row.level)}</td>
                            <td>{resolveText(row.resolveStatus)}</td>
                            <td>{statusText(row.taskStatus)}</td>
                            <td>{renderSlaCell(row)}</td>
                            <td>
                              <span className="v2-fh-cell-num">{row.deadlineTime.slice(0, 10)}</span>
                            </td>
                            <td>
                              <span className="v2-fh-cell-owner">{row.opsManager}</span>
                            </td>
                            <td>
                              <div className="v2-fh-cell-body">{row.operateCompany}</div>
                              <div className="v2-fh-cell-sub">{row.operateCity}</div>
                            </td>
                            <td className="v2-fh-td-actions">
                              <FaultRowActionsMenu
                                row={row}
                                onView={openDetail}
                                onHandle={(item) => openHandle(item, 'ledger')}
                                onSuspend={setSuspendModalItem}
                                onNotice={setNoticeModalItem}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="v2-fh-pagination-bar">
                    <V2Pagination
                      currentPage={currentPage}
                      pageSize={pageSize}
                      total={filteredRecords.length}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      )}

      {/* 看板模式 */}
      {viewMode === 'kanban' && (
        <div className="v2-fh-kanban">
          {KANBAN_COLUMNS.map((col) => {
            const rows = filteredRecords.filter((r) => r.taskStatus === col.id);
            return (
              <div key={col.id} className="v2-fh-kanban-col">
                <div className="v2-fh-kanban-col__head">
                  <span>
                    <i style={{ background: col.color }} />
                    {col.title}
                  </span>
                  <em>{rows.length}</em>
                </div>
                <div className="v2-fh-kanban-col__body">
                  {rows.length === 0 ? (
                    <div className="v2-fh-kanban-empty">暂无此阶段单据</div>
                  ) : (
                    rows.map((row) => (
                      <div key={row.id} className="v2-fh-kanban-card">
                        <div className="v2-fh-kanban-card__top">
                          <span className="v2-fh-kanban-card__code">{row.id}</span>
                          {renderSlaCell(row)}
                        </div>
                        <button
                          type="button"
                          className="v2-fh-kanban-card__title"
                          onClick={() => openSplit(row)}
                        >
                          {row.plate}
                        </button>
                        <div className="v2-fh-cell-sub">
                          {row.brand} · {row.model}
                        </div>
                        <div className="v2-fh-kanban-card__meta">
                          {levelText(row.level)}
                          <span className="v2-fh-kanban-card__sep" aria-hidden>
                            ·
                          </span>
                          {categoriesText(row.categories, 1)}
                        </div>
                        <div className="v2-fh-kanban-card__foot">
                          <span>{row.opsManager}</span>
                          <button
                            type="button"
                            className="v2-fh-btn--link"
                            onClick={() => openSplit(row)}
                          >
                            主从详情 <ChevronRight style={{ width: 12, height: 12 }} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {col.id === 'pending' && (
                  <button
                    type="button"
                    className="v2-fh-kanban-add"
                    onClick={handleCreateNew}
                  >
                    + 新增故障登记
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 主从/表单模式 */}
      {viewMode === 'split' && (
        <div className="v2-fh-split">
          <aside className="v2-fh-split__list">
            <div className="v2-fh-split__list-head">
              <strong>故障单据</strong>
              <span>{filteredRecords.length} 条</span>
            </div>
            <div className="v2-fh-split__search">
              <input
                type="text"
                className="v2-fh-input"
                placeholder="搜索车牌 / 单号"
                value={appliedFilters.plateKeyword}
                onChange={(e) => setPlateKeywordLive(e.target.value)}
              />
            </div>
            <div className="v2-fh-split__items">
              {filteredRecords.length === 0 ? (
                <V2Empty
                  type="no_search"
                  size="compact"
                  title="无匹配单据"
                  description="调整搜索词后重试"
                />
              ) : (
                filteredRecords.map((row) => {
                  const active = splitSelected?.id === row.id;
                  return (
                    <button
                      key={row.id}
                      type="button"
                      className={`v2-fh-split__item ${active ? 'is-active' : ''}`}
                      onClick={() => setSplitSelectedId(row.id)}
                    >
                      <div className="v2-fh-split__item-top">
                        <span className="v2-fh-cell-plate">{row.plate}</span>
                        {statusText(row.taskStatus)}
                      </div>
                      <div className="v2-fh-cell-sub">
                        {row.id} · {formatCategories(row.categories)}
                      </div>
                      <div className="v2-fh-split__item-sla">{renderSlaCell(row)}</div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="v2-fh-split__workbench">
            {!splitSelected ? (
              <V2Empty
                type="empty"
                title="请选择左侧故障单据"
                description="进入主从工作台后可查看详情并执行处置、挂起与催办。"
              />
            ) : (
              <>
                <div className="v2-fh-split__wb-head">
                  <div>
                    <h2>
                      {splitSelected.plate}
                      <span>
                        {splitSelected.brand} · {splitSelected.model}
                      </span>
                    </h2>
                    <div className="v2-fh-split__wb-tags">
                      <span className="v2-fh-cell-num">{splitSelected.id}</span>
                      {statusText(splitSelected.taskStatus)}
                      {resolveText(splitSelected.resolveStatus)}
                      {renderSlaCell(splitSelected)}
                      {levelText(splitSelected.level)}
                      <span className="v2-fh-cell-sub">
                        {formatCategories(splitSelected.categories)}
                      </span>
                    </div>
                  </div>
                  <div className="v2-fh-split__wb-actions">
                    {splitSelected.taskStatus !== 'archived' && (
                      <button
                        type="button"
                        className="v2-fh-btn v2-fh-btn--primary"
                        onClick={() => openHandle(splitSelected, 'ledger')}
                      >
                        <Wrench style={{ width: 14, height: 14 }} />
                        处置与归档
                      </button>
                    )}
                    {splitSelected.taskStatus === 'processing' && (
                      <button
                        type="button"
                        className="v2-fh-btn v2-fh-btn--secondary"
                        onClick={() => setSuspendModalItem(splitSelected)}
                      >
                        <PauseCircle style={{ width: 14, height: 14 }} />
                        挂起
                      </button>
                    )}
                    <button
                      type="button"
                      className="v2-fh-btn v2-fh-btn--secondary"
                      onClick={() => setNoticeModalItem(splitSelected)}
                    >
                      <BellRing style={{ width: 14, height: 14 }} />
                      催办
                    </button>
                    <button
                      type="button"
                      className="v2-fh-btn v2-fh-btn--secondary"
                      onClick={() => openDetail(splitSelected)}
                    >
                      打开抽屉详情
                    </button>
                  </div>
                </div>

                <div className="v2-fh-split__wb-grid">
                  <div className="v2-fh-split__card">
                    <h3>故障描述与 AI 排查</h3>
                    <p>{splitSelected.description}</p>
                    {splitSelected.aiChatSummary && (
                      <blockquote>{splitSelected.aiChatSummary}</blockquote>
                    )}
                  </div>
                  <div className="v2-fh-split__card">
                    <h3>处置与证据链</h3>
                    <dl className="v2-fh-split__dl">
                      <div>
                        <dt>解决情况</dt>
                        <dd>{splitSelected.resolveStatus}</dd>
                      </div>
                      <div>
                        <dt>维修工厂</dt>
                        <dd>{splitSelected.repairFactory || '尚未指定'}</dd>
                      </div>
                      <div>
                        <dt>发生地点</dt>
                        <dd>{splitSelected.faultLocation || '未录入'}</dd>
                      </div>
                      <div>
                        <dt>费用</dt>
                        <dd className="v2-fh-cell-num">
                          {splitSelected.repairCost
                            ? `¥${splitSelected.repairCost.toLocaleString('zh-CN')}`
                            : '无费用/质保'}
                        </dd>
                      </div>
                      <div>
                        <dt>附件证据</dt>
                        <dd>{splitSelected.attachments.length} 份</dd>
                      </div>
                      <div>
                        <dt>运维负责人</dt>
                        <dd>{splitSelected.opsManager}</dd>
                      </div>
                    </dl>
                    {splitSelected.repairResult && (
                      <p className="v2-fh-split__result">{splitSelected.repairResult}</p>
                    )}
                  </div>
                  <div className="v2-fh-split__card">
                    <h3>挂起与催办留痕</h3>
                    {splitSelected.suspendHistory.length === 0 &&
                    splitSelected.notificationHistory.length === 0 ? (
                      <p className="v2-fh-cell-sub">暂无挂起或催办记录</p>
                    ) : (
                      <ul className="v2-fh-split__timeline">
                        {splitSelected.suspendHistory.map((s) => (
                          <li key={s.id}>
                            <strong>挂起 · {s.suspendType}</strong>
                            <span>
                              {s.operator} · {s.suspendTime}
                            </span>
                            <p>{s.reason}</p>
                          </li>
                        ))}
                        {splitSelected.notificationHistory.map((n) => (
                          <li key={n.id}>
                            <strong>
                              {n.channel} · {n.title}
                            </strong>
                            <span>
                              {n.recipient} · {n.sendTime}
                            </span>
                            <p>{n.content}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      <SuspendModal
        isOpen={!!suspendModalItem}
        item={suspendModalItem}
        onClose={() => setSuspendModalItem(null)}
        onConfirmSuspend={handleConfirmSuspend}
      />

      <NoticeModal
        isOpen={!!noticeModalItem}
        item={noticeModalItem}
        onClose={() => setNoticeModalItem(null)}
        onSendNotice={handleSendNotice}
      />
    </div>
  );
}

export default VehicleFaultHandlingHub;
