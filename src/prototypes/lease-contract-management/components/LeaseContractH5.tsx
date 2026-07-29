/**
 * 租赁合同台账与资产枢纽 - H5 移动端 / 小程序 / 小羚羚 App 嵌套专属视图
 * OneOS V2 · H5 Mobile Standard (触控热区 ≥ 44px + Bottom Sheet + 3 视图卡片自适应)
 */
import React, { useState, useMemo } from 'react';
import {
  Filter,
  ChevronRight,
  ChevronDown,
  Plus,
  Building,
  Truck,
  CreditCard,
  FileCheck2,
  Calendar,
  Clock3,
  UserCheck,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
  ChevronLeft,
  Smartphone,
  Share2,
  Bell,
  SlidersHorizontal,
  ArrowRight,
  X
} from 'lucide-react';
import type { ContractFilterState, LeaseContractRecord, VehicleItem } from '../types';
import { countActiveContractFilters, countDeliveredVehicles, EMPTY_CONTRACT_FILTERS, isApprovalPassed } from '../types';
import {
  V2MobileHeader,
  V2MobileBottomNav,
  V2MobileActionBar,
  V2Pagination,
  V2Empty,
  V2Select,
  V2SingleInputDateRangePicker,
  V2RadioGroup,
  V2Switch,
  V2Steps,
  V2Timeline,
  V2ApprovalProgress,
  V2FilterSearch,
  V2FilterMoreButton,
} from '../../../resources/design-system/components/UIComponents';
import '../../../resources/design-system/oneos-ds-tokens.css';
interface LeaseContractH5Props {
  contracts: LeaseContractRecord[];
  isDark: boolean;
  onOpenCreateForm: () => void;
  onOpenEditForm: (record: LeaseContractRecord) => void;
  onOpenDelegateModal: (record: LeaseContractRecord) => void;
  onOpenExtraFeeModal: (record: LeaseContractRecord) => void;
  onOpenTrialModal: (record: LeaseContractRecord) => void;
  onOpenStampModal: (record: LeaseContractRecord) => void;
  onOpenReturnVehicleModal: (record: LeaseContractRecord, vehicle?: VehicleItem) => void;
}

type H5ViewMode = 'list' | 'kanban' | 'split';
type AppEnv = 'xiaolingling' | 'miniprogram' | 'h5';

export const LeaseContractH5: React.FC<LeaseContractH5Props> = ({
  contracts,
  isDark,
  onOpenCreateForm,
  onOpenEditForm,
  onOpenDelegateModal,
  onOpenExtraFeeModal,
  onOpenTrialModal,
  onOpenStampModal,
  onOpenReturnVehicleModal
}) => {
  // App Shell Environment State
  const [appEnv, setAppEnv] = useState<AppEnv>('xiaolingling');

  // H5 3-View Mode
  const [h5ViewMode, setH5ViewMode] = useState<H5ViewMode>('list');

  // Kanban Active Stage Tab
  const [kanbanStage, setKanbanStage] = useState<'draft' | 'submitted' | 'active' | 'terminated'>('active');

  // Split View Selected Contract ID & SubTab
  const [selectedId, setSelectedId] = useState<string>(contracts[0]?.id || '');
  const [splitSubTab, setSplitSubTab] = useState<'vehicles' | 'info' | 'audit' | 'extra'>('vehicles');

  // Filter & Search State（草稿 / 已应用：点确认才刷列表并关 Sheet）
  const [search, setSearch] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [pendingFilters, setPendingFilters] = useState<ContractFilterState>(EMPTY_CONTRACT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<ContractFilterState>(EMPTY_CONTRACT_FILTERS);

  // Expanded Vehicle List per Contract
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Active Selected Contract for Split View
  const selectedRecord = useMemo(() => {
    return contracts.find((c) => c.id === selectedId) || contracts[0];
  }, [contracts, selectedId]);

  // KPI Calculations
  const counts = useMemo(() => {
    const draft = contracts.filter((c) => c.contractStatus === 'draft').length;
    const inApproval = contracts.filter((c) => c.contractStatus === 'submitted').length;
    const active = contracts.filter((c) => c.contractStatus === 'active').length;
    const terminated = contracts.filter((c) => c.contractStatus === 'terminated').length;
    const totalVehicles = contracts.reduce((sum, c) => sum + c.totalVehicles, 0);
    const deliveredVehicles = contracts.reduce((sum, c) => sum + c.deliveredVehiclesCount, 0);
    return { draft, inApproval, active, terminated, totalVehicles, deliveredVehicles };
  }, [contracts]);

  // Filtered List
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.code.toLowerCase().includes(q) &&
          !c.projectName.toLowerCase().includes(q) &&
          !c.customerName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (appliedFilters.contractCode && !c.code.toLowerCase().includes(appliedFilters.contractCode.toLowerCase())) {
        return false;
      }
      if (appliedFilters.projectName && !c.projectName.toLowerCase().includes(appliedFilters.projectName.toLowerCase())) {
        return false;
      }
      if (appliedFilters.customerName && !c.customerName.toLowerCase().includes(appliedFilters.customerName.toLowerCase())) {
        return false;
      }

      const appr = appliedFilters.approvalStatus[0];
      if (appr && appr !== '全部' && c.approvalStatus !== appr) return false;

      const cst = appliedFilters.contractStatus[0];
      if (cst && cst !== '全部' && c.contractStatus !== cst) return false;

      return true;
    });
  }, [contracts, search, appliedFilters]);

  // Pagination Slice
  const pagedContracts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredContracts.slice(start, start + pageSize);
  }, [filteredContracts, page, pageSize]);

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openFilterSheet = () => {
    setPendingFilters(appliedFilters);
    setFilterOpen(true);
  };

  const applyFiltersAndClose = () => {
    setAppliedFilters(pendingFilters);
    setPage(1);
    setFilterOpen(false);
  };

  const resetFiltersAndClose = () => {
    setPendingFilters(EMPTY_CONTRACT_FILTERS);
    setAppliedFilters(EMPTY_CONTRACT_FILTERS);
    setPage(1);
    setFilterOpen(false);
  };

  /** Bottom Sheet 上「确认应用」旁的预估条数（按草稿条件） */
  const pendingMatchCount = useMemo(() => {
    return contracts.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.code.toLowerCase().includes(q) &&
          !c.projectName.toLowerCase().includes(q) &&
          !c.customerName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (pendingFilters.contractCode && !c.code.toLowerCase().includes(pendingFilters.contractCode.toLowerCase())) {
        return false;
      }
      if (pendingFilters.projectName && !c.projectName.toLowerCase().includes(pendingFilters.projectName.toLowerCase())) {
        return false;
      }
      if (pendingFilters.customerName && !c.customerName.toLowerCase().includes(pendingFilters.customerName.toLowerCase())) {
        return false;
      }
      const appr = pendingFilters.approvalStatus[0];
      if (appr && appr !== '全部' && c.approvalStatus !== appr) return false;
      const cst = pendingFilters.contractStatus[0];
      if (cst && cst !== '全部' && c.contractStatus !== cst) return false;
      return true;
    }).length;
  }, [contracts, search, pendingFilters]);

  const getStatusPill = (status: LeaseContractRecord['contractStatus'], approvalStatus: LeaseContractRecord['approvalStatus']) => {
    if (status === 'active') {
      return (
        <span className="ds-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', height: '24px', fontSize: '11px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
          履约执行中
        </span>
      );
    }
    if (status === 'submitted') {
      return (
        <span className="ds-pill" style={{ background: 'rgba(83, 58, 253, 0.15)', color: '#533AFD', height: '24px', fontSize: '11px' }}>
          <Clock3 size={12} />
          待审批盖章
        </span>
      );
    }
    if (status === 'draft') {
      return (
        <span className="ds-pill" style={{ background: 'var(--ln-surface-strong)', color: 'var(--ln-muted)', height: '24px', fontSize: '11px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ln-muted)' }} />
          草稿未提交
        </span>
      );
    }
    return (
      <span className="ds-pill" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', height: '24px', fontSize: '11px' }}>
        <XCircle size={12} />
        已终止归档
      </span>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'var(--ln-canvas-parchment)',
        color: 'var(--ln-ink)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        paddingBottom: '80px'
      }}
    >
      {/* 0. Top App Environment Switcher (Mini-Program vs XiaoLingLing App vs Pure H5) */}
      <div
        style={{
          background: 'var(--ln-surface-card)',
          borderBottom: '1px solid var(--ln-hairline)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#533AFD' }}>
          <Smartphone size={16} />
          <span>H5 嵌套环境</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--ln-surface-pearl)', padding: '2px', borderRadius: '8px' }}>
          {[
            { key: 'xiaolingling', label: '小羚羚 App 嵌套' },
            { key: 'miniprogram', label: '微信小程序 嵌套' },
            { key: 'h5', label: '全屏 H5 视图' }
          ].map((env) => (
            <button
              key={env.key}
              type="button"
              onClick={() => setAppEnv(env.key as AppEnv)}
              style={{
                border: 'none',
                background: appEnv === env.key ? 'var(--ln-surface-card)' : 'transparent',
                color: appEnv === env.key ? '#533AFD' : 'var(--ln-body)',
                fontSize: '11px',
                fontWeight: appEnv === env.key ? 700 : 500,
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: appEnv === env.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {env.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Mobile App Simulated Status Bar & Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--ln-surface-card)' }}>
        {/* iOS / Android Status Bar Simulator */}
        <div
          style={{
            height: '20px',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--ln-ink)',
            background: 'var(--ln-surface-card)',
            borderBottom: '1px dashed var(--ln-hairline)'
          }}
        >
          <span>09:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--ln-muted)' }}>
            <span>5G</span>
            <span>100% 🔋</span>
          </div>
        </div>

        {/* H5 Mobile Header */}
        <V2MobileHeader
          title="租赁合同台账"
          subtitle={appEnv === 'xiaolingling' ? '小羚羚运力 App 嵌入' : appEnv === 'miniprogram' ? '羚牛氢能小程序 嵌入' : 'OneOS H5'}
          badgeText="v2.5 H5版"
          showBack={true}
          onBack={() => alert('点击 H5 返回 App 原生页')}
          actionIcon={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {appEnv === 'miniprogram' && (
                <div
                  style={{
                    border: '1px solid var(--ln-hairline)',
                    borderRadius: '16px',
                    padding: '3px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: 'var(--ln-surface-pearl)'
                  }}
                >
                  <span>···</span>
                  <span style={{ borderLeft: '1px solid var(--ln-hairline)', paddingLeft: '6px' }}>⨀</span>
                </div>
              )}
              {appEnv !== 'miniprogram' && (
                <button
                  type="button"
                  onClick={openFilterSheet}
                  style={{ background: 'transparent', border: 'none', color: 'var(--ln-ink)', cursor: 'pointer', padding: '4px' }}
                >
                  <Filter size={18} />
                </button>
              )}
            </div>
          }
        />

        {/* Top 3-View Mode Segmented Control */}
        <div
          style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--ln-hairline)',
            background: 'var(--ln-surface-card)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              background: 'var(--ln-surface-pearl)',
              padding: '3px',
              borderRadius: '8px',
              gap: '2px'
            }}
          >
            {[
              { mode: 'list', label: '列表卡片' },
              { mode: 'kanban', label: '管道看板' },
              { mode: 'split', label: '主从详情' }
            ].map((v) => (
              <button
                key={v.mode}
                type="button"
                onClick={() => setH5ViewMode(v.mode as H5ViewMode)}
                style={{
                  flex: 1,
                  minHeight: '36px',
                  border: 'none',
                  borderRadius: '6px',
                  background: h5ViewMode === v.mode ? 'var(--oneos-primary, var(--ln-primary, #533AFD))' : 'transparent',
                  color: h5ViewMode === v.mode ? '#FFFFFF' : 'var(--ln-body)',
                  fontSize: '13px',
                  fontWeight: h5ViewMode === v.mode ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: h5ViewMode === v.mode ? '0 2px 6px rgba(83, 58, 253, 0.28)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenCreateForm}
            style={{
              minHeight: '36px',
              padding: '0 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--oneos-primary, var(--ln-primary, #533AFD))',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={16} />
            创单
          </button>
        </div>
      </div>

      {/* 2. H5 Quick KPI Carousel / Metrics Row */}
      <div style={{ padding: '12px 12px 0 12px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}
        >
          <div
            style={{
              background: 'var(--ln-surface-card)',
              border: '1px solid var(--ln-hairline)',
              borderRadius: '10px',
              padding: '10px 12px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--ln-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Truck size={12} style={{ color: '#533AFD' }} /> 在跑车辆数
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)', fontFamily: '"JetBrains Mono", tabular-nums', marginTop: '2px' }}>
              {counts.deliveredVehicles} <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ln-muted)' }}>/ {counts.totalVehicles} 台</span>
            </div>
          </div>

          <div
            style={{
              background: 'var(--ln-surface-card)',
              border: '1px solid var(--ln-hairline)',
              borderRadius: '10px',
              padding: '10px 12px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--ln-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock3 size={12} style={{ color: '#D97706' }} /> 待我审批/盖章
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#D97706', fontFamily: '"JetBrains Mono", tabular-nums', marginTop: '2px' }}>
              {counts.inApproval} <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ln-muted)' }}>份待办</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <V2FilterSearch aria-label="搜索合同" style={{ flex: 1, minWidth: 0 }}>
            <input
              type="text"
              placeholder="搜索合同编号/项目名称/客户名称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="搜索合同编号、项目或客户"
            />
          </V2FilterSearch>
          <V2FilterMoreButton
            open={filterOpen}
            activeCount={countActiveContractFilters(appliedFilters)}
            closedLabel="筛选"
            openLabel="筛选"
            icon={<SlidersHorizontal size={16} aria-hidden />}
            onClick={openFilterSheet}
          />
        </div>
      </div>

      {/* MAIN VIEW CONTENT AREA */}
      <div style={{ padding: '0 12px', flex: 1 }}>
        {/* ========================================================================= */}
        {/* VIEW 1: H5 LIST MODE (列表卡片模式) */}
        {/* ========================================================================= */}
        {h5ViewMode === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pagedContracts.length === 0 ? (
              <V2Empty
                type="no_search"
                title="未搜索到符合条件的合同"
                description="未找到符合条件的租赁合同，建议清除搜索词或重置筛选。"
                primaryActionText="重置筛选"
                onPrimaryAction={() => {
                  setSearch('');
                  setPendingFilters(EMPTY_CONTRACT_FILTERS);
                  setAppliedFilters(EMPTY_CONTRACT_FILTERS);
                }}
              />
            ) : (
              pagedContracts.map((c) => {
                const isExpanded = !!expandedCards[c.id];
                const delivered = c.deliveredVehiclesCount;

                return (
                  <div
                    key={c.id}
                    style={{
                      background: 'var(--ln-surface-card)',
                      border: '1px solid var(--ln-hairline)',
                      borderRadius: '12px',
                      padding: '14px',
                      boxSizing: 'border-box',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    {/* Contract Card Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#533AFD', fontFamily: '"JetBrains Mono", tabular-nums' }}>
                          {c.code}
                        </span>
                      </div>
                      {getStatusPill(c.contractStatus, c.approvalStatus)}
                    </div>

                    {/* Project & Customer Info */}
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ln-ink)', marginBottom: '4px' }}>
                      {c.projectName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ln-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={12} />
                      {c.customerName}
                    </div>

                    {/* Delivery Progress Bar */}
                    <div
                      style={{
                        background: 'var(--ln-surface-pearl)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        marginBottom: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ln-body)' }}>
                        <span>车辆交付进度</span>
                        <span style={{ fontWeight: 700, color: '#533AFD', fontFamily: 'tabular-nums' }}>
                          {delivered} / {c.totalVehicles} 台已交车 ({Math.round((delivered / Math.max(1, c.totalVehicles)) * 100)}%)
                        </span>
                      </div>
                      <div style={{ height: '6px', width: '100%', background: 'var(--ln-hairline)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${(delivered / Math.max(1, c.totalVehicles)) * 100}%`,
                            background: 'var(--oneos-primary, var(--ln-primary, #533AFD))',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    </div>

                    {/* Key Attributes */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px', color: 'var(--ln-body)', marginBottom: '12px' }}>
                      <div>单车租金: <strong style={{ color: 'var(--ln-ink)', fontFamily: 'tabular-nums' }}>¥ {c.monthlyRentPerVehicle.toLocaleString()}/月</strong></div>
                      <div>押金金额: <strong style={{ color: 'var(--ln-ink)', fontFamily: 'tabular-nums' }}>¥ {c.depositAmount.toLocaleString()}</strong></div>
                      <div>归属部门: <span style={{ color: 'var(--ln-ink)' }}>{c.businessDept}</span></div>
                      <div>负责人: <span style={{ color: 'var(--ln-ink)' }}>{c.businessOwner}</span></div>
                    </div>

                    {/* Expand Vehicles Trigger */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(c.id)}
                      style={{
                        width: '100%',
                        minHeight: '36px',
                        border: '1px dashed var(--ln-hairline)',
                        borderRadius: '8px',
                        background: isExpanded ? 'var(--ln-surface-pearl)' : 'transparent',
                        color: '#533AFD',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        marginBottom: '12px'
                      }}
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {isExpanded ? '收起关联车辆明细' : `展开旗下 ${c.vehicles.length} 台车辆明细`}
                    </button>

                    {/* Expandable Vehicle Sub-Cards List */}
                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', paddingLeft: '8px', borderLeft: '2px solid #533AFD' }}>
                        {c.vehicles.map((v) => (
                          <div
                            key={v.id}
                            style={{
                              background: 'var(--ln-surface-pearl)',
                              border: '1px solid var(--ln-hairline)',
                              borderRadius: '8px',
                              padding: '10px',
                              boxSizing: 'border-box'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ln-ink)', fontFamily: 'monospace' }}>
                                {v.plateNo}
                              </span>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: v.delivered ? 'rgba(16, 185, 129, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                                  color: v.delivered ? '#10B981' : '#D97706'
                                }}
                              >
                                {v.delivered ? '已交车' : '未交车'}
                              </span>
                            </div>

                            <div style={{ fontSize: '11px', color: 'var(--ln-muted)', marginBottom: '6px' }}>
                              VIN: {v.vin} | {v.brand} {v.model}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ln-body)' }}>
                              <span>当前里程: {v.currentMileageKm ? `${v.currentMileageKm.toLocaleString()} km` : '—'}</span>
                              <span>交付区域: {v.deliveryRegion || c.deliveryRegion}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', borderTop: '1px dashed var(--ln-hairline)', paddingTop: '6px' }}>
                              <button
                                type="button"
                                onClick={() => onOpenReturnVehicleModal(c, v)}
                                style={{
                                  flex: 1,
                                  minHeight: '32px',
                                  border: '1px solid var(--ln-hairline)',
                                  borderRadius: '6px',
                                  background: 'var(--ln-surface-card)',
                                  color: 'var(--ln-ink)',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                退车结算
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Card Actions (44px Touch Targets) */}
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--ln-hairline)', paddingTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => onOpenEditForm(c)}
                        style={{
                          flex: 1,
                          minHeight: '44px',
                          border: '1px solid var(--ln-hairline)',
                          borderRadius: '8px',
                          background: 'var(--ln-surface-card)',
                          color: 'var(--ln-ink)',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        编辑
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenStampModal(c)}
                        style={{
                          flex: 1,
                          minHeight: '44px',
                          border: '1px solid var(--ln-hairline)',
                          borderRadius: '8px',
                          background: 'var(--ln-surface-card)',
                          color: 'var(--ln-ink)',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        盖章
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenDelegateModal(c)}
                        style={{
                          flex: 1,
                          minHeight: '44px',
                          border: 'none',
                          borderRadius: '8px',
                          background: 'var(--oneos-primary, var(--ln-primary, #533AFD))',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(83, 58, 253, 0.28)'
                        }}
                      >
                        指派
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* H5 Pagination */}
            {filteredContracts.length > 0 && (
              <V2Pagination
                page={page}
                pageSize={pageSize}
                total={filteredContracts.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                showTotal={true}
              />
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: H5 KANBAN MODE (管道看板模式) */}
        {/* ========================================================================= */}
        {h5ViewMode === 'kanban' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Stage Tabs Bar */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {[
                { stage: 'draft', label: '草稿箱', count: counts.draft, color: 'var(--ln-muted)' },
                { stage: 'submitted', label: '待审批盖章', count: counts.inApproval, color: '#D97706' },
                { stage: 'active', label: '履约执行中', count: counts.active, color: '#10B981' },
                { stage: 'terminated', label: '已终止归档', count: counts.terminated, color: '#EF4444' }
              ].map((s) => {
                const isActive = kanbanStage === s.stage;
                return (
                  <button
                    key={s.stage}
                    type="button"
                    onClick={() => setKanbanStage(s.stage as any)}
                    style={{
                      flex: 1,
                      minWidth: '85px',
                      minHeight: '40px',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      border: isActive ? 'none' : '1px solid var(--ln-hairline)',
                      background: isActive ? 'var(--oneos-primary, var(--ln-primary, #533AFD))' : 'var(--ln-surface-card)',
                      color: isActive ? '#FFFFFF' : 'var(--ln-ink)',
                      fontSize: '12px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isActive ? '0 2px 6px rgba(83, 58, 253, 0.28)' : 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>{s.label}</span>
                    <span style={{ fontSize: '10px', opacity: 0.85, fontFamily: 'tabular-nums' }}>({s.count})</span>
                  </button>
                );
              })}
            </div>

            {/* Kanban Cards List for Selected Stage */}
            {filteredContracts.filter((c) => c.contractStatus === kanbanStage).length === 0 ? (
              <V2Empty
                type="empty"
                title={`当前阶段【${kanbanStage}】暂无合同卡片`}
                description="该管道阶段暂无数据，您可以拖发或切换至其他阶段阶段。"
              />
            ) : (
              filteredContracts
                .filter((c) => c.contractStatus === kanbanStage)
                .map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: 'var(--ln-surface-card)',
                      border: '1px solid var(--ln-hairline)',
                      borderRadius: '12px',
                      padding: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#533AFD', fontFamily: 'monospace' }}>
                        {c.code}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--ln-muted)' }}>{c.approvalType === 'standard' ? '标准协议' : '非标改签'}</span>
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ln-ink)', marginBottom: '4px' }}>
                      {c.projectName}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--ln-muted)', marginBottom: '10px' }}>
                      {c.customerName}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--ln-body)', marginBottom: '12px', background: 'var(--ln-surface-pearl)', padding: '8px', borderRadius: '6px' }}>
                      <span>总车辆: <strong>{c.totalVehicles} 台</strong></span>
                      <span>已交付: <strong style={{ color: '#10B981' }}>{c.deliveredVehiclesCount} 台</strong></span>
                      <span>押金: <strong>¥{c.depositAmount.toLocaleString()}</strong></span>
                    </div>

                    {/* Quick Stage Flow Action */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {kanbanStage === 'draft' && (
                        <button
                          type="button"
                          onClick={() => alert(`提交合同 ${c.code} 审批`)}
                          style={{
                            width: '100%',
                            minHeight: '44px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#533AFD',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          提交发起审批
                        </button>
                      )}

                      {kanbanStage === 'submitted' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenDelegateModal(c)}
                            style={{ flex: 1, minHeight: '44px', borderRadius: '8px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-card)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            指派加签
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenStampModal(c)}
                            style={{ flex: 1, minHeight: '44px', borderRadius: '8px', border: 'none', background: '#533AFD', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            上传盖章
                          </button>
                        </>
                      )}

                      {kanbanStage === 'active' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenReturnVehicleModal(c)}
                            style={{ flex: 1, minHeight: '44px', borderRadius: '8px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-card)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            办理退车
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenExtraFeeModal(c)}
                            style={{ flex: 1, minHeight: '44px', borderRadius: '8px', border: 'none', background: '#533AFD', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            补录费用
                          </button>
                        </>
                      )}

                      {kanbanStage === 'terminated' && (
                        <button
                          type="button"
                          disabled
                          style={{ width: '100%', minHeight: '44px', borderRadius: '8px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-pearl)', color: 'var(--ln-muted)', fontSize: '13px', fontWeight: 600 }}
                        >
                          已归档（只读）
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: H5 SPLIT / MASTER-DETAIL MODE (主从详情模式) */}
        {/* ========================================================================= */}
        {h5ViewMode === 'split' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Horizontal Contract Selector Bar */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {filteredContracts.map((c) => {
                const isSel = selectedId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    style={{
                      minWidth: '150px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isSel ? '2px solid #533AFD' : '1px solid var(--ln-hairline)',
                      background: isSel ? 'var(--ln-surface-card)' : 'var(--ln-surface-pearl)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      boxShadow: isSel ? '0 2px 8px rgba(83, 58, 253, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 800, color: isSel ? '#533AFD' : 'var(--ln-ink)' }}>
                      {c.code}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ln-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.projectName}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Contract Master Detail Sheet */}
            {selectedRecord && (
              <div
                style={{
                  background: 'var(--ln-surface-card)',
                  border: '1px solid var(--ln-hairline)',
                  borderRadius: '12px',
                  padding: '14px',
                  boxSizing: 'border-box'
                }}
              >
                {/* Header Summary */}
                <div style={{ borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ln-ink)' }}>{selectedRecord.projectName}</span>
                    {getStatusPill(selectedRecord.contractStatus, selectedRecord.approvalStatus)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ln-muted)' }}>
                    编号: {selectedRecord.code} | 客户: {selectedRecord.customerName}
                  </div>
                </div>

                {/* Sub-Tabs Selector Bar */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--ln-hairline)', marginBottom: '14px', gap: '16px' }}>
                  {[
                    { key: 'vehicles', label: `车辆履约 (${selectedRecord.vehicles.length})` },
                    { key: 'info', label: '基本信息' },
                    { key: 'audit', label: '审批进度' },
                    { key: 'extra', label: `附加费用 (${selectedRecord.extraFees.length})` }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSplitSubTab(tab.key as any)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: '8px 0',
                        fontSize: '13px',
                        fontWeight: splitSubTab === tab.key ? 800 : 500,
                        color: splitSubTab === tab.key ? '#533AFD' : 'var(--ln-muted)',
                        borderBottom: splitSubTab === tab.key ? '2px solid #533AFD' : '2px solid transparent',
                        cursor: 'pointer'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Sub-Tab 1: Vehicles */}
                {splitSubTab === 'vehicles' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedRecord.vehicles.map((v) => (
                      <div key={v.id} style={{ padding: '10px', borderRadius: '8px', background: 'var(--ln-surface-pearl)', border: '1px solid var(--ln-hairline)', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginBottom: '4px' }}>
                          <span>{v.plateNo}</span>
                          <span style={{ color: v.delivered ? '#10B981' : '#D97706' }}>{v.delivered ? '已交车' : '未交车'}</span>
                        </div>
                        <div style={{ color: 'var(--ln-muted)', fontSize: '11px' }}>VIN: {v.vin} | {v.brand} {v.model}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-Tab 2: Info */}
                {splitSubTab === 'info' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', fontSize: '13px', color: 'var(--ln-body)' }}>
                    <div>签约主体: <strong style={{ color: 'var(--ln-ink)' }}>{selectedRecord.signingCompany}</strong></div>
                    <div>模版分类: <strong style={{ color: 'var(--ln-ink)' }}>{selectedRecord.contractTemplateCategory}</strong></div>
                    <div>支付周期: <strong style={{ color: 'var(--ln-ink)' }}>{selectedRecord.paymentPeriod}</strong></div>
                    <div>单车租金: <strong style={{ color: '#533AFD' }}>¥{selectedRecord.monthlyRentPerVehicle.toLocaleString()}/月</strong></div>
                    <div>履约截止: <strong style={{ color: 'var(--ln-ink)' }}>{selectedRecord.endDate}</strong></div>
                  </div>
                )}

                {/* Sub-Tab 3: Audit Timeline */}
                {splitSubTab === 'audit' && (
                  <V2ApprovalProgress
                    status={selectedRecord.approvalStatus === 'approved' ? 'passed' : selectedRecord.approvalStatus === 'rejected' ? 'rejected' : 'approving'}
                    nodes={[
                      { nodeName: '提交创单', approver: selectedRecord.creator, status: 'passed' },
                      { nodeName: '部门主管审批', approver: selectedRecord.businessOwner, status: selectedRecord.approvalStatus === 'approved' ? 'passed' : 'approving' },
                      { nodeName: '法务盖章归档', approver: '法务部', status: selectedRecord.approvalStatus === 'approved' ? 'passed' : 'pending' }
                    ]}
                  />
                )}

                {/* Sub-Tab 4: Extra Fees */}
                {splitSubTab === 'extra' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedRecord.extraFees.length === 0 ? (
                      <V2Empty size="compact" title="暂无附加费用记录" />
                    ) : (
                      selectedRecord.extraFees.map((fee) => (
                        <div key={fee.id} style={{ padding: '8px 10px', background: 'var(--ln-surface-pearl)', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{fee.serviceItem} ({fee.vehiclePlate})</span>
                          <strong style={{ color: '#533AFD' }}>¥{fee.feeAmount.toLocaleString()}</strong>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Bottom Sheet Filter Drawer (13-Item Full Filter) */}
      {filterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}
        >
          <div
            style={{
              background: 'var(--ln-surface-card)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              padding: '16px',
              maxHeight: '85vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ln-ink)' }}>13项高阶筛选条件</span>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--ln-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Form Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', marginBottom: '4px', display: 'block' }}>合同编号</label>
                <input
                  type="text"
                  placeholder="请输入合同编号"
                  value={pendingFilters.contractCode || ''}
                  onChange={(e) => setPendingFilters((prev) => ({ ...prev, contractCode: e.target.value }))}
                  style={{ width: '100%', minHeight: '44px', borderRadius: '8px', border: '1px solid var(--ln-hairline)', padding: '0 12px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', marginBottom: '4px', display: 'block' }}>审批状态</label>
                <V2Select
                  options={[
                    { value: '全部', label: '全部状态' },
                    { value: 'pending', label: '待审批' },
                    { value: 'approved', label: '审批通过' },
                    { value: 'rejected', label: '审批驳回' }
                  ]}
                  value={pendingFilters.approvalStatus[0] || '全部'}
                  onChange={(val) => setPendingFilters((prev) => ({ ...prev, approvalStatus: [val as string] }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', marginBottom: '4px', display: 'block' }}>签署时间范围</label>
                <V2SingleInputDateRangePicker
                  startDate={pendingFilters.startDate || '2026-01-01'}
                  endDate={pendingFilters.endDate || '2026-12-31'}
                  onChange={(s, e) => setPendingFilters((prev) => ({ ...prev, startDate: s, endDate: e }))}
                />
              </div>
            </div>

            {/* Fixed Bottom Action Bar：确认应用条件并收起 Bottom Sheet */}
            <V2MobileActionBar
              secondaryText="重置条件"
              onSecondary={resetFiltersAndClose}
              primaryText={`确认应用 (${pendingMatchCount} 条)`}
              onPrimary={applyFiltersAndClose}
            />
          </div>
        </div>
      )}

      {/* 5. Mobile Bottom Navigation Bar (`V2MobileBottomNav`) */}
      <V2MobileBottomNav
        activeKey="contracts"
        fixed={true}
        items={[
          { key: 'workbench', label: '工作台', icon: <Building size={20} /> },
          { key: 'contracts', label: '租赁合同', icon: <FileCheck2 size={20} />, badge: filteredContracts.length },
          { key: 'vehicles', label: '车辆运力', icon: <Truck size={20} /> },
          { key: 'mine', label: '我的', icon: <UserCheck size={20} /> }
        ]}
        onChange={(k) => alert(`切换底部 Tab: ${k}`)}
      />
    </div>
  );
};
