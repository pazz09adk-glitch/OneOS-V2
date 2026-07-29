import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  Search,
  Filter,
  List,
  Kanban,
  Columns,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  PauseCircle,
  X,
  Sun,
  Moon,
  Smartphone,
  Monitor,
  SlidersHorizontal,
  Send,
  FileText,
  Bot,
  Paperclip,
  Bell,
  User,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import '../../resources/design-system/oneos-ds-tokens.css';
import { MOCK_FAULT_RECORDS } from '../vehicle-fault-handling/mockData';
import type {
  FaultRecord,
  FaultTaskStatus,
  FaultLevel,
  FaultCategory,
  FaultResolveStatus
} from '../vehicle-fault-handling/types';
import {
  getSlaInfo,
  TASK_STATUS_LABEL,
  KANBAN_COLUMNS,
  isUrgentOrOverdue,
  formatCategories,
  recordHasCategory,
} from '../vehicle-fault-handling/utils';
import {
  V2Select,
  V2Pagination,
  V2Empty,
  V2MobileHeader,
  V2MobileBottomNav,
  V2MobileActionBar
} from '../oneos-v2/UIComponents';
import { V2Badge } from '../../resources/design-system/components/V2Badge';

type ViewMode = 'list' | 'kanban' | 'split';
type ViewportMode = 'iphone_390' | 'android_375' | 'pc';
type KpiFilter = 'all' | 'active' | 'suspended' | 'urgent';
type BottomTab = 'ledger' | 'kanban' | 'workbench';

const ALL_RECORDS_SEED = MOCK_FAULT_RECORDS;

function cleanPlate(plate: string): string {
  return (plate || '').replace(/·/g, '');
}

function getStatusBadgeStatus(status: FaultTaskStatus): 'success' | 'warning' | 'processing' | 'default' {
  if (status === 'archived') return 'success';
  if (status === 'suspended') return 'warning';
  if (status === 'processing') return 'processing';
  return 'default';
}

function getSlaHintTone(kind: ReturnType<typeof getSlaInfo>['kind']): string {
  /** 仅两档强调：临期≤7 天预警色；已逾期（超 30 天时限）警告色；其余 muted */
  if (kind === 'urgent') return 'var(--ln-warning, #d97706)';
  if (kind === 'overdue') return 'var(--ln-error, #ef4444)';
  return 'var(--ln-muted, #627d98)';
}

const CATEGORY_OPTIONS: { value: FaultCategory | ''; label: string }[] = [
  { value: '', label: '不限部位' },
  { value: '底盘系统', label: '底盘系统' },
  { value: '三电系统', label: '三电系统' },
  { value: '整车控制', label: '整车控制' },
  { value: '燃料电池系统', label: '燃料电池系统' },
  { value: '供氢系统', label: '供氢系统' },
  { value: '空调系统', label: '空调系统' },
  { value: '冷机系统', label: '冷机系统' },
  { value: '其他', label: '其他' }
];

const LEVEL_OPTIONS: { value: FaultLevel | ''; label: string }[] = [
  { value: '', label: '不限等级' },
  { value: 'L1-特急', label: 'L1-特急' },
  { value: 'L2-紧急', label: 'L2-紧急' },
  { value: 'L3-一般', label: 'L3-一般' },
  { value: 'L4-提示', label: 'L4-提示' }
];

const RESOLVE_OPTIONS: { value: FaultResolveStatus | ''; label: string }[] = [
  { value: '', label: '不限解决情况' },
  { value: '未解决', label: '未解决' },
  { value: '临时排故', label: '临时排故' },
  { value: '已解决', label: '已解决' }
];

export function H5FaultHandlingApp() {
  const [viewportMode, setViewportMode] = useState<ViewportMode>('iphone_390');
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('ledger');

  const [records, setRecords] = useState<FaultRecord[]>(ALL_RECORDS_SEED);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FaultCategory | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<FaultLevel | ''>('');
  const [selectedResolve, setSelectedResolve] = useState<FaultResolveStatus | ''>('');
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [kpiFilter, setKpiFilter] = useState<KpiFilter>('all');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [kanbanStage, setKanbanStage] = useState<FaultTaskStatus>('pending');
  const [selectedRecordId, setSelectedRecordId] = useState<string>(ALL_RECORDS_SEED[0]?.id ?? '');

  const [actionModal, setActionModal] = useState<{ open: boolean; type: 'handle' | 'suspend' | 'notice'; record?: FaultRecord }>({
    open: false,
    type: 'handle'
  });
  const [modalInput, setModalInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.dataset.dsMode = 'dark';
      root.dataset.oneosTheme = 'dark';
      root.classList.add('dark');
    } else {
      root.dataset.dsMode = 'light';
      root.dataset.oneosTheme = 'light';
      root.classList.remove('dark');
    }
  }, [isDark]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const managerOptions = useMemo(() => {
    const set = new Set(records.map((r) => r.opsManager));
    return [{ value: '', label: '不限负责人' }, ...Array.from(set).map((m) => ({ value: m, label: m }))];
  }, [records]);

  const kpiStats = useMemo(() => {
    const total = records.length;
    const active = records.filter((r) => r.taskStatus === 'pending' || r.taskStatus === 'processing').length;
    const suspended = records.filter((r) => r.taskStatus === 'suspended').length;
    const urgent = records.filter((r) => isUrgentOrOverdue(r)).length;
    return { total, active, suspended, urgent };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const cleanQ = searchQuery.trim().toLowerCase();
      if (cleanQ) {
        const match =
          cleanPlate(item.plate).toLowerCase().includes(cleanQ) ||
          item.id.toLowerCase().includes(cleanQ) ||
          item.brand.toLowerCase().includes(cleanQ) ||
          item.operateCompany.toLowerCase().includes(cleanQ);
        if (!match) return false;
      }

      if (kpiFilter === 'active' && item.taskStatus !== 'pending' && item.taskStatus !== 'processing') return false;
      if (kpiFilter === 'suspended' && item.taskStatus !== 'suspended') return false;
      if (kpiFilter === 'urgent' && !isUrgentOrOverdue(item)) return false;

      if (selectedCategory && !recordHasCategory(item, selectedCategory as FaultCategory)) return false;
      if (selectedLevel && item.level !== selectedLevel) return false;
      if (selectedResolve && item.resolveStatus !== selectedResolve) return false;
      if (selectedManager && item.opsManager !== selectedManager) return false;

      return true;
    });
  }, [records, searchQuery, kpiFilter, selectedCategory, selectedLevel, selectedResolve, selectedManager]);

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  const kanbanRecords = useMemo(() => {
    return records.filter((r) => r.taskStatus === kanbanStage);
  }, [records, kanbanStage]);

  const activeRecord = useMemo(() => {
    return records.find((r) => r.id === selectedRecordId) || records[0];
  }, [records, selectedRecordId]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedLevel) count++;
    if (selectedResolve) count++;
    if (selectedManager) count++;
    return count;
  }, [selectedCategory, selectedLevel, selectedResolve, selectedManager]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedResolve('');
    setSelectedManager('');
    setSearchQuery('');
    setKpiFilter('all');
    setPage(1);
    showToast('已重置所有筛选条件');
  };

  const switchView = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'list') setActiveBottomTab('ledger');
    if (mode === 'kanban') setActiveBottomTab('kanban');
    if (mode === 'split') setActiveBottomTab('workbench');
  };

  const openRecordDetail = (record: FaultRecord) => {
    setSelectedRecordId(record.id);
    switchView('split');
    showToast(`已载入故障单 ${record.id}`);
  };

  const handleActionConfirm = () => {
    if (!actionModal.record) return;
    const rec = actionModal.record;

    if (actionModal.type === 'handle') {
      if (rec.taskStatus === 'archived') {
        showToast('该单据已归档，无法再次处置');
      } else if (!modalInput.trim() && rec.resolveStatus === '未解决') {
        showToast('请填写处置说明后再提交');
      } else {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === rec.id
              ? {
                  ...r,
                  taskStatus: r.resolveStatus === '已解决' && r.attachments.length > 0 ? 'archived' : 'processing',
                  repairResult: modalInput.trim() || r.repairResult,
                  lastOperationTime: '2026-07-25 20:00',
                  lastOperator: r.opsManager
                }
              : r
          )
        );
        showToast(`故障单 ${rec.id} 处置已保存`);
      }
    }

    if (actionModal.type === 'suspend') {
      if (!modalInput.trim()) {
        showToast('请填写挂起原因');
        return;
      }
      setRecords((prev) =>
        prev.map((r) =>
          r.id === rec.id
            ? {
                ...r,
                taskStatus: 'suspended',
                suspendHistory: [
                  ...r.suspendHistory,
                  {
                    id: `sup-h5-${Date.now()}`,
                    suspendType: '其他原因',
                    reason: modalInput.trim(),
                    operator: r.opsManager,
                    suspendTime: '2026-07-25 20:00'
                  }
                ],
                lastOperationTime: '2026-07-25 20:00'
              }
            : r
        )
      );
      showToast(`故障单 ${rec.id} 已挂起`);
    }

    if (actionModal.type === 'notice') {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === rec.id
            ? {
                ...r,
                notificationHistory: [
                  ...r.notificationHistory,
                  {
                    id: `n-h5-${Date.now()}`,
                    channel: '短信催办',
                    recipient: `${r.opsManager}`,
                    role: '运维专员',
                    title: '故障处置催办',
                    content: modalInput.trim() || `【OneOS】单据 ${r.id}（${cleanPlate(r.plate)}）请加快闭环处置！`,
                    sendTime: '2026-07-25 20:00',
                    status: '已发送'
                  }
                ]
              }
            : r
        )
      );
      showToast(`已向 ${rec.opsManager} 发送催办通知`);
    }

    setActionModal({ open: false, type: 'handle' });
    setModalInput('');
  };

  const renderSlaHint = (item: FaultRecord) => {
    const sla = getSlaInfo(item);
    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: sla.kind === 'urgent' || sla.kind === 'overdue' ? 500 : 400,
          lineHeight: 1.33,
          fontVariantNumeric: 'tabular-nums',
          color: getSlaHintTone(sla.kind),
          whiteSpace: 'nowrap',
        }}
      >
        {sla.label}
      </span>
    );
  };

  const renderFaultCard = (item: FaultRecord, opts?: { showActions?: boolean; borderColor?: string }) => {
    const col = KANBAN_COLUMNS.find((c) => c.id === item.taskStatus);

    return (
      <div
        key={item.id}
        onClick={() => openRecordDetail(item)}
        style={{
          background: 'var(--ln-surface-card)',
          borderRadius: '12px',
          borderLeft: opts?.borderColor ? `4px solid ${opts.borderColor}` : `4px solid ${col?.color || '#533AFD'}`,
          borderTop: '1px solid var(--ln-hairline)',
          borderRight: '1px solid var(--ln-hairline)',
          borderBottom: '1px solid var(--ln-hairline)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: 'var(--oneos-primary, #533AFD)',
                fontFamily: '"JetBrains Mono", SFMono-Regular, monospace',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.3px'
              }}
            >
              {cleanPlate(item.plate)}
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color:
                  item.level === 'L1-特急'
                    ? 'var(--ln-error, #EF4444)'
                    : item.level === 'L2-紧急'
                      ? 'var(--ln-warning, #D97706)'
                      : 'var(--ln-muted)'
              }}
            >
              {item.level}
            </span>
          </div>
          <V2Badge status={getStatusBadgeStatus(item.taskStatus)} size="small" label={TASK_STATUS_LABEL[item.taskStatus]} />
        </div>

        <div style={{ fontSize: '12px', color: 'var(--ln-muted)', fontFamily: 'monospace' }}>
          {item.id} · {formatCategories(item.categories)}
        </div>

        <div style={{ fontSize: '13px', color: 'var(--ln-body)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.description}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
          {renderSlaHint(item)}
          <span style={{ fontSize: '12px', color: 'var(--ln-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <User size={12} />
            {item.opsManager}
          </span>
        </div>

        {opts?.showActions !== false && (
          <div
            style={{ display: 'flex', gap: '8px', paddingTop: '4px', borderTop: '1px dashed var(--ln-hairline)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => openRecordDetail(item)}
              style={{
                flex: 1,
                minHeight: '44px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--oneos-primary, #533AFD)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              进入处置台 <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderH5Content = () => (
    <div
      data-annotation-id="oneos-v2-h5-fault-handling-overview"
      className="h5-page-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        background: 'var(--ln-canvas-parchment, #F6F9FC)',
        color: 'var(--ln-ink)',
        boxSizing: 'border-box',
        paddingBottom: '80px'
      }}
    >
      <V2MobileHeader
        title="故障处置"
        subtitle={`共 ${filteredRecords.length} 条故障单`}
        showBack={false}
        rightIcons={
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              color: 'var(--ln-ink)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              minHeight: '44px',
              minWidth: '44px',
              justifyContent: 'center'
            }}
            title="高阶筛选"
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--oneos-primary, #533AFD)'
                }}
              />
            )}
          </button>
        }
      />

      {/* 三视角 Segmented Switcher */}
      <div
        style={{
          padding: '10px 12px',
          background: 'var(--ln-surface-card)',
          borderBottom: '1px solid var(--ln-hairline)',
          position: 'sticky',
          top: '52px',
          zIndex: 40,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--ln-surface-pearl, #F1F5F9)',
            borderRadius: '10px',
            padding: '3px',
            gap: '3px'
          }}
        >
          {([
            { id: 'list' as ViewMode, icon: List, label: '1. 列表台账' },
            { id: 'kanban' as ViewMode, icon: Kanban, label: '2. 看板管道' },
            { id: 'split' as ViewMode, icon: Columns, label: '3. 处置工作台' }
          ]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => switchView(id)}
              style={{
                flex: 1,
                minHeight: '44px',
                border: 'none',
                borderRadius: '8px',
                background: viewMode === id ? 'var(--oneos-primary, #533AFD)' : 'transparent',
                color: viewMode === id ? '#FFFFFF' : 'var(--ln-body)',
                fontSize: '12px',
                fontWeight: viewMode === id ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: viewMode === id ? '0 2px 8px rgba(83, 58, 253, 0.3)' : 'none'
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: LIST */}
      {viewMode === 'list' && (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {([
              { key: 'all' as KpiFilter, label: '全量故障台账', count: kpiStats.total, icon: Wrench, color: '#533AFD' },
              { key: 'active' as KpiFilter, label: '待处理+处理中', count: kpiStats.active, icon: Clock3, color: '#3B82F6' },
              { key: 'suspended' as KpiFilter, label: '挂起保护', count: kpiStats.suspended, icon: PauseCircle, color: '#D97706' },
              { key: 'urgent' as KpiFilter, label: '临期/逾期告警', count: kpiStats.urgent, icon: AlertTriangle, color: '#EF4444' }
            ]).map((kpi) => (
              <div
                key={kpi.key}
                onClick={() => setKpiFilter(kpiFilter === kpi.key ? 'all' : kpi.key)}
                style={{
                  background: 'var(--ln-surface-card)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  border: kpiFilter === kpi.key ? `1.5px solid ${kpi.color}` : '1px solid var(--ln-hairline)',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  minHeight: '44px'
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--ln-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <kpi.icon size={12} style={{ color: kpi.color }} /> {kpi.label}
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: kpi.color,
                    fontFamily: '"JetBrains Mono", tabular-nums',
                    marginTop: '2px'
                  }}
                >
                  {kpi.count} <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ln-muted)' }}>单</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--ln-muted)' }} />
              <input
                type="text"
                placeholder="搜索车牌号或故障单号..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  paddingLeft: '38px',
                  paddingRight: searchQuery ? '32px' : '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  color: 'var(--ln-ink)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ln-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    minHeight: '44px',
                    minWidth: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setFilterDrawerOpen(true)}
              style={{
                minHeight: '44px',
                padding: '0 14px',
                borderRadius: '10px',
                border: activeFilterCount > 0 ? '1px solid var(--oneos-primary, #533AFD)' : '1px solid var(--ln-hairline)',
                background: activeFilterCount > 0 ? 'rgba(83, 58, 253, 0.08)' : 'var(--ln-surface-card)',
                color: activeFilterCount > 0 ? 'var(--oneos-primary, #533AFD)' : 'var(--ln-ink)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Filter size={16} />
              筛选 {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {(activeFilterCount > 0 || kpiFilter !== 'all') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {kpiFilter !== 'all' && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    background: 'rgba(83, 58, 253, 0.12)',
                    color: 'var(--oneos-primary, #533AFD)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  KPI: {kpiFilter === 'active' ? '待处理+处理中' : kpiFilter === 'suspended' ? '挂起' : '临期逾期'}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setKpiFilter('all')} />
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                style={{ fontSize: '11px', color: 'var(--oneos-primary, #533AFD)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, minHeight: '44px', padding: '0 8px' }}
              >
                清空重置
              </button>
            </div>
          )}

          {filteredRecords.length === 0 ? (
            <V2Empty
              type="no_search"
              title="未匹配到符合条件的故障单"
              description="请调整车牌/单号关键词或重置筛选条件"
              primaryActionText="重置筛选条件"
              onPrimaryAction={handleResetFilters}
            />
          ) : (
            paginatedRecords.map((item) => renderFaultCard(item))
          )}

          {filteredRecords.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <V2Pagination
                page={page}
                pageSize={pageSize}
                total={filteredRecords.length}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setPage(1);
                }}
                showTotal
              />
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: KANBAN */}
      {viewMode === 'kanban' && (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {KANBAN_COLUMNS.map((col) => {
              const count = records.filter((r) => r.taskStatus === col.id).length;
              const active = kanbanStage === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setKanbanStage(col.id)}
                  style={{
                    minHeight: '44px',
                    padding: '0 14px',
                    borderRadius: '9999px',
                    border: active ? 'none' : '1px solid var(--ln-hairline)',
                    background: active ? col.color : 'var(--ln-surface-card)',
                    color: active ? '#FFFFFF' : 'var(--ln-body)',
                    fontSize: '13px',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {col.title}
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      fontSize: '10px',
                      background: active ? 'rgba(255,255,255,0.25)' : 'var(--ln-surface-pearl)',
                      color: active ? '#FFFFFF' : 'var(--ln-muted)',
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {kanbanRecords.length === 0 ? (
            <V2Empty type="empty" title={`${TASK_STATUS_LABEL[kanbanStage]}列暂无单据`} description="切换其他管道列或重置筛选" />
          ) : (
            kanbanRecords.map((item) => {
              const col = KANBAN_COLUMNS.find((c) => c.id === item.taskStatus);
              return renderFaultCard(item, { borderColor: col?.color, showActions: true });
            })
          )}
        </div>
      )}

      {/* VIEW 3: SPLIT / WORKBENCH */}
      {viewMode === 'split' && activeRecord && (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--ln-muted)', marginBottom: '6px' }}>快速选择故障单焦点:</div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {records.map((r) => {
                const selected = r.id === selectedRecordId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRecordId(r.id)}
                    style={{
                      minHeight: '44px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: selected ? '1.5px solid var(--oneos-primary, #533AFD)' : '1px solid var(--ln-hairline)',
                      background: selected ? 'rgba(83, 58, 253, 0.1)' : 'var(--ln-surface-card)',
                      color: selected ? 'var(--oneos-primary, #533AFD)' : 'var(--ln-ink)',
                      fontSize: '12px',
                      fontWeight: selected ? 800 : 500,
                      fontFamily: 'monospace',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                  >
                    {cleanPlate(r.plate)}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              background: 'var(--ln-surface-card)',
              borderRadius: '12px',
              border: '1px solid var(--ln-hairline)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--oneos-primary, #533AFD)',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {cleanPlate(activeRecord.plate)}
                </span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)', marginTop: '2px' }}>
                  {activeRecord.brand} {activeRecord.model}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ln-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                  {activeRecord.id}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <V2Badge status={getStatusBadgeStatus(activeRecord.taskStatus)} label={TASK_STATUS_LABEL[activeRecord.taskStatus]} />
                {renderSlaHint(activeRecord)}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 12px' }}>
              <V2Badge
                size="small"
                showDot
                status={
                  activeRecord.resolveStatus === '已解决'
                    ? 'success'
                    : activeRecord.resolveStatus === '临时排故'
                      ? 'warning'
                      : 'error'
                }
                label={activeRecord.resolveStatus}
              />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color:
                    activeRecord.level === 'L1-特急'
                      ? 'var(--ln-error, #EF4444)'
                      : activeRecord.level === 'L2-紧急'
                        ? 'var(--ln-warning, #D97706)'
                        : 'var(--ln-body)'
                }}
              >
                {activeRecord.level}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--ln-body)' }}>
                {formatCategories(activeRecord.categories)}
              </span>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ln-body)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} style={{ color: 'var(--oneos-primary, #533AFD)' }} /> 故障现象描述
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ln-body)', lineHeight: 1.55, padding: '10px 12px', borderRadius: '8px', background: 'var(--ln-surface-pearl)' }}>
                {activeRecord.description}
              </div>
            </div>

            {activeRecord.aiChatSummary && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ln-body)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bot size={14} style={{ color: 'var(--oneos-primary, #533AFD)' }} /> AI 排查摘要
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ln-body)', lineHeight: 1.55, padding: '10px 12px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.06)', border: '1px solid rgba(83, 58, 253, 0.12)' }}>
                  {activeRecord.aiChatSummary}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ln-body)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} style={{ color: '#10B981' }} /> 处置结果
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ln-body)', lineHeight: 1.55, padding: '10px 12px', borderRadius: '8px', background: 'var(--ln-surface-pearl)' }}>
                {activeRecord.repairResult || '尚未录入处置结果，请点击底部【处置】填写。'}
              </div>
              {activeRecord.repairFactory && (
                <div style={{ fontSize: '11px', color: 'var(--ln-muted)', marginTop: '6px' }}>
                  维修站: {activeRecord.repairFactory}
                  {activeRecord.repairCost ? ` · 费用 ¥${activeRecord.repairCost.toLocaleString()}` : ''}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--ln-surface-pearl)' }}>
                <div style={{ fontSize: '10px', color: 'var(--ln-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Paperclip size={12} /> 证据链附件
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--oneos-primary, #533AFD)', fontVariantNumeric: 'tabular-nums', marginTop: '2px' }}>
                  {activeRecord.attachments.length} <span style={{ fontSize: '11px', fontWeight: 500 }}>份</span>
                </div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--ln-surface-pearl)' }}>
                <div style={{ fontSize: '10px', color: 'var(--ln-muted)' }}>处置截止日</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)', fontVariantNumeric: 'tabular-nums', marginTop: '2px' }}>
                  {activeRecord.deadlineTime.slice(0, 10)}
                </div>
              </div>
            </div>

            {activeRecord.suspendHistory.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#D97706', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PauseCircle size={14} /> 挂起记录 ({activeRecord.suspendHistory.length})
                </div>
                {activeRecord.suspendHistory.map((s) => (
                  <div key={s.id} style={{ fontSize: '12px', color: 'var(--ln-body)', padding: '8px 10px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.08)', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700 }}>{s.suspendType}</div>
                    <div style={{ marginTop: '2px' }}>{s.reason}</div>
                    <div style={{ fontSize: '10px', color: 'var(--ln-muted)', marginTop: '4px' }}>
                      {s.operator} · {s.suspendTime}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeRecord.notificationHistory.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--oneos-primary, #533AFD)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={14} /> 催办通知 ({activeRecord.notificationHistory.length})
                </div>
                {activeRecord.notificationHistory.map((n) => (
                  <div key={n.id} style={{ fontSize: '12px', color: 'var(--ln-body)', padding: '8px 10px', borderRadius: '8px', background: 'rgba(83, 58, 253, 0.06)', marginBottom: '6px', borderLeft: '3px solid var(--oneos-primary, #533AFD)' }}>
                    <div style={{ fontWeight: 700 }}>{n.title}</div>
                    <div style={{ marginTop: '2px', fontSize: '11px' }}>{n.content}</div>
                    <div style={{ fontSize: '10px', color: 'var(--ln-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{n.channel} → {n.recipient}</span>
                      <span>{n.sendTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontSize: '11px', color: 'var(--ln-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>负责人: {activeRecord.opsManager}</span>
              <span>最后操作: {activeRecord.lastOperationTime}</span>
            </div>
          </div>
        </div>
      )}

      {/* Split View Action Bar */}
      {viewMode === 'split' && activeRecord && (
        <V2MobileActionBar fixed>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            {activeRecord.taskStatus !== 'archived' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setModalInput(activeRecord.repairResult || '');
                    setActionModal({ open: true, type: 'handle', record: activeRecord });
                  }}
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--oneos-primary, #533AFD)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Wrench size={14} /> 处置
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalInput('');
                    setActionModal({ open: true, type: 'suspend', record: activeRecord });
                  }}
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    borderRadius: '8px',
                    border: '1px solid #D97706',
                    background: 'rgba(217, 119, 6, 0.1)',
                    color: '#D97706',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <PauseCircle size={14} /> 挂起
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setModalInput('');
                setActionModal({ open: true, type: 'notice', record: activeRecord });
              }}
              style={{
                flex: activeRecord.taskStatus === 'archived' ? 1 : 1,
                minHeight: '44px',
                borderRadius: '8px',
                border: '1px solid var(--ln-hairline)',
                background: 'var(--ln-surface-card)',
                color: 'var(--ln-ink)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Send size={14} /> 催办
            </button>
          </div>
        </V2MobileActionBar>
      )}

      {/* Bottom Tab Bar */}
      <V2MobileBottomNav
        activeKey={activeBottomTab}
        onChange={(k) => {
          setActiveBottomTab(k as BottomTab);
          if (k === 'ledger') switchView('list');
          if (k === 'kanban') switchView('kanban');
          if (k === 'workbench') switchView('split');
        }}
        items={[
          { key: 'ledger', label: '台账', icon: <List size={20} /> },
          { key: 'kanban', label: '看板', icon: <Kanban size={20} /> },
          { key: 'workbench', label: '处置台', icon: <Wrench size={20} /> }
        ]}
      />

      {/* Filter Bottom Sheet */}
      {filterDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}
          onClick={() => setFilterDrawerOpen(false)}
        >
          <div
            style={{
              background: 'var(--ln-surface-card)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              padding: '16px',
              maxHeight: '82vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxSizing: 'border-box',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '36px',
                height: '4px',
                borderRadius: '2px',
                background: 'var(--ln-hairline)',
                position: 'absolute',
                top: '8px',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '12px', paddingTop: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ln-ink)' }}>高阶条件筛选</span>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--ln-muted)', cursor: 'pointer', padding: '4px', minHeight: '44px', minWidth: '44px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ln-body)', marginBottom: '6px', display: 'block' }}>故障部位</label>
                <V2Select options={CATEGORY_OPTIONS} value={selectedCategory} onChange={(v) => setSelectedCategory(v as FaultCategory | '')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ln-body)', marginBottom: '6px', display: 'block' }}>故障等级</label>
                <V2Select options={LEVEL_OPTIONS} value={selectedLevel} onChange={(v) => setSelectedLevel(v as FaultLevel | '')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ln-body)', marginBottom: '6px', display: 'block' }}>解决情况</label>
                <V2Select options={RESOLVE_OPTIONS} value={selectedResolve} onChange={(v) => setSelectedResolve(v as FaultResolveStatus | '')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ln-body)', marginBottom: '6px', display: 'block' }}>运维负责人</label>
                <V2Select options={managerOptions} value={selectedManager} onChange={setSelectedManager} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--ln-hairline)' }}>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  borderRadius: '8px',
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  color: 'var(--ln-ink)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={14} /> 重置
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterDrawerOpen(false);
                  setPage(1);
                  showToast(`已应用筛选，匹配 ${filteredRecords.length} 条`);
                }}
                style={{
                  flex: 2,
                  minHeight: '44px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--oneos-primary, #533AFD)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                确认查询 ({filteredRecords.length} 单)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.open && actionModal.record && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setActionModal({ open: false, type: 'handle' })}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              background: 'var(--ln-surface-card)',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ln-ink)' }}>
              {actionModal.type === 'handle' ? '故障处置与归档' : actionModal.type === 'suspend' ? '申请挂起保护' : '发送催办通知'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ln-muted)' }}>
              目标单据: <strong style={{ color: '#533AFD' }}>{actionModal.record.id}</strong> ({cleanPlate(actionModal.record.plate)})
            </div>
            <textarea
              placeholder={
                actionModal.type === 'handle'
                  ? '请输入排故过程、维修结果或归档说明...'
                  : actionModal.type === 'suspend'
                  ? '请填写挂起原因（必填）...'
                  : '可选：自定义催办通知内容...'
              }
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              style={{
                width: '100%',
                minHeight: '88px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--ln-hairline)',
                background: 'var(--ln-surface-card)',
                color: 'var(--ln-ink)',
                fontSize: '13px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            {actionModal.type === 'handle' && actionModal.record.attachments.length === 0 && (
              <div style={{ fontSize: '11px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} /> 归档门槛：缺少证据链附件时将无法闭环归档
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setActionModal({ open: false, type: 'handle' })}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  borderRadius: '8px',
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  color: 'var(--ln-ink)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleActionConfirm}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--oneos-primary, #533AFD)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: 'rgba(10, 37, 64, 0.92)',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            maxWidth: '90%',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--ln-canvas-parchment, #F6F9FC)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: viewportMode === 'pc' ? '0' : '24px 16px',
        boxSizing: 'border-box'
      }}
    >
      {/* Dev Toolbar: Viewport & Theme */}
      <div
        style={{
          width: '100%',
          maxWidth: viewportMode === 'pc' ? '100%' : '420px',
          marginBottom: '16px',
          padding: '12px 16px',
          background: 'var(--ln-surface-card)',
          borderRadius: '12px',
          border: '1px solid var(--ln-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px 10px', borderRadius: '6px', background: 'rgba(83, 58, 253, 0.1)', color: '#533AFD', fontSize: '13px', fontWeight: 800 }}>
            H5 移动端
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ln-ink)' }}>故障处置 H5 移动端</div>
            <div style={{ fontSize: '11px', color: 'var(--ln-muted)' }}>OneOS V2 · 三视角 · 44px 触控 · 30 天处置时限</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--ln-surface-pearl)', borderRadius: '8px', padding: '2px', gap: '2px' }}>
            {([
              { id: 'iphone_390' as ViewportMode, label: 'iPhone 15', icon: Smartphone },
              { id: 'android_375' as ViewportMode, label: 'Android', icon: Smartphone },
              { id: 'pc' as ViewportMode, label: 'PC 全宽', icon: Monitor }
            ]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setViewportMode(id)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewportMode === id ? 'var(--oneos-primary, #533AFD)' : 'transparent',
                  color: viewportMode === id ? '#FFFFFF' : 'var(--ln-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  minHeight: '44px'
                }}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--ln-hairline)',
              background: 'var(--ln-surface-card)',
              color: 'var(--ln-ink)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '44px'
            }}
          >
            {isDark ? <Sun size={14} style={{ color: '#F59E0B' }} /> : <Moon size={14} style={{ color: '#533AFD' }} />}
            {isDark ? '浅色' : '深色'}
          </button>
        </div>
      </div>

      {viewportMode === 'pc' ? (
        <div style={{ width: '100%', maxWidth: '100%', background: 'var(--ln-surface-card)' }}>
          {renderH5Content()}
        </div>
      ) : (
        <div
          style={{
            width: viewportMode === 'iphone_390' ? '390px' : '375px',
            height: '844px',
            borderRadius: '40px',
            border: '12px solid #1E2028',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--ln-surface-card)',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '28px',
              background: '#000000',
              borderBottomLeftRadius: '14px',
              borderBottomRightRadius: '14px',
              zIndex: 99,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0D0E12', border: '1px solid #232530' }} />
          </div>
          <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>{renderH5Content()}</div>
        </div>
      )}
    </div>
  );
}

export default H5FaultHandlingApp;
