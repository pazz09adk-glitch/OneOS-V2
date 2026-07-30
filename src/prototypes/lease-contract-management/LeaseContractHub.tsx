/**
 * 租赁合同台账与资产枢纽
 * OneOS V2 · Stripe Fintech 单页三显示方式（列表 / 看板 / 主从）
 * 业务能力对齐 .spec/requirements-prd-list.md（13 项筛选、车辆子表、全量操作弹窗）
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  type AnnotationSourceDocument,
  type AnnotationViewerOptions,
} from '@axhub/annotation';
import {
  Building,
  Calendar,
  CheckCircle2,
  Columns,
  Download,
  FileCheck2,
  LayoutGrid,
  List,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
  Truck,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Clock,
  UserCheck,
  PlusCircle,
  Paperclip,
  FileCheck,
  XSquare,
} from 'lucide-react';
import { PrototypeAnnotationHost } from '../../common/prototype-annotation-host';
import { DetailEntryLink } from '../../common/DetailEntryLink';
import { OperationActions, type OperationActionItem } from '../../common/OperationActions';
import {
  V2Button,
  V2FilterMoreButton,
  V2FilterSearch,
} from '../../resources/design-system/components/UIComponents';
import annotationSourceDocument from './annotation-source.json';
import '../../resources/design-system/oneos-ds-tokens.css';
import '../../common/vm-operation-actions.css';

import type { ContractFilterState, LeaseContractRecord, VehicleItem } from './types';
import { countActiveContractFilters, countDeliveredVehicles, EMPTY_CONTRACT_FILTERS } from './types';
import { MOCK_LEASE_CONTRACTS } from './mockData';
import { FilterBar } from './components/FilterBar';
import { VehicleSubTable, type VehicleExpandFilter } from './components/VehicleSubTable';
import { ContractFormDrawer } from './components/ContractFormDrawer';
import {
  DelegateModal,
  ExtraFeeModal,
  TrialToFormalModal,
  UploadStampModal,
  ReturnVehicleModal,
} from './components/Modals';

type ViewMode = 'list' | 'kanban' | 'split';

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const sync = () => {
      const ds = document.documentElement.getAttribute('data-ds-mode');
      const theme = document.documentElement.getAttribute('data-oneos-theme');
      setIsDark(ds === 'dark' || theme === 'dark');
    };
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-ds-mode', 'data-oneos-theme'],
    });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

function tokens(isDark: boolean) {
  return {
    bg: isDark ? '#0a0b0d' : '#f6f9fc',
    surface: isDark ? '#121418' : '#ffffff',
    surfaceHover: isDark ? '#1a1d24' : '#f8fafc',
    border: isDark ? '#23272f' : '#e3e8ee',
    textPrimary: isDark ? '#f7fafc' : '#0a2540',
    textSecondary: isDark ? '#a0aec0' : '#425466',
    accent: 'var(--oneos-primary, var(--ln-primary, #533afd))',
    accentSoft: isDark ? 'color-mix(in srgb, var(--oneos-primary, #533afd) 18%, transparent)' : 'var(--ln-primary-soft, #e0e7ff)',
  };
}

function stageOf(r: LeaseContractRecord): 'draft' | 'in_approval' | 'active' | 'terminated' {
  if (r.contractStatus === 'draft') return 'draft';
  if (r.contractStatus === 'submitted') return 'in_approval';
  if (r.contractStatus === 'active') return 'active';
  return 'terminated';
}

function stageLabel(r: LeaseContractRecord) {
  const map = {
    draft: '草稿',
    in_approval: '审批中',
    active: '进行中',
    terminated: '已终止',
  } as const;
  return map[stageOf(r)];
}

function approvalLabel(status: LeaseContractRecord['approvalStatus']) {
  const map: Record<string, string> = {
    unsubmitted: '未提交',
    pending: '待审批',
    approving: '审批中',
    approved: '审批通过',
    rejected: '审批驳回',
    terminated: '审批终止',
    withdrawn: '撤回',
  };
  return map[status] || status;
}

function contractAmount(r: LeaseContractRecord) {
  return r.monthlyRentPerVehicle * r.totalVehicles * 12;
}

export default function LeaseContractHub() {
  const isDark = useIsDark();
  const t = tokens(isDark);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [contracts, setContracts] = useState(MOCK_LEASE_CONTRACTS);
  const [statusTab, setStatusTab] = useState<'all' | 'draft' | 'active' | 'approval' | 'terminated'>('all');
  const [search, setSearch] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [filterState, setFilterState] = useState<ContractFilterState>({ ...EMPTY_CONTRACT_FILTERS });
  const activeMoreFilterCount = useMemo(() => countActiveContractFilters(filterState), [filterState]);
  const [expandedRows, setExpandedRows] = useState<Record<string, VehicleExpandFilter>>({});
  const [leasePopoverId, setLeasePopoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(MOCK_LEASE_CONTRACTS[0]?.id || '');
  const [splitSubTab, setSplitSubTab] = useState<'vehicles' | 'info' | 'audit' | 'extra'>('vehicles');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LeaseContractRecord | null>(null);
  const [modal, setModal] = useState<
    'delegate' | 'extraFee' | 'trialToFormal' | 'uploadStamp' | 'returnVehicle' | null
  >(null);
  const [target, setTarget] = useState<LeaseContractRecord | null>(null);
  const [targetVehicle, setTargetVehicle] = useState<VehicleItem | null>(null);

  // 车辆资产等跨模块深链：?contractCode=xxx&view=split → 主从详情
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const code = (params.get('contractCode') || params.get('code') || '').trim();
    if (!code) return;

    const exact = MOCK_LEASE_CONTRACTS.find((c) => c.code === code);
    if (exact) {
      setSelectedId(exact.id);
    } else {
      const bridgeId = `bridge-${encodeURIComponent(code)}`;
      const template = MOCK_LEASE_CONTRACTS[0];
      if (template) {
        const bridge: LeaseContractRecord = {
          ...template,
          id: bridgeId,
          code,
          projectName: template.projectName || `合同 ${code}`,
        };
        setContracts((prev) => (prev.some((c) => c.id === bridgeId) ? prev : [bridge, ...prev]));
        setSelectedId(bridgeId);
      }
    }

    const view = (params.get('view') || 'split').toLowerCase();
    if (view === 'split' || view === 'detail') {
      setViewMode('split');
    }
  }, []);

  const annotationOptions = useMemo<AnnotationViewerOptions>(
    () => ({
      showToolbar: true,
      showThemeToggle: true,
      showColorFilter: true,
      emptyWhenNoData: false,
      toolbarEdge: 'right',
      currentPageId: 'list',
    }),
    []
  );

  const counts = useMemo(() => {
    const draft = contracts.filter((c) => stageOf(c) === 'draft').length;
    const inApproval = contracts.filter((c) => stageOf(c) === 'in_approval').length;
    const active = contracts.filter((c) => stageOf(c) === 'active').length;
    const terminated = contracts.filter((c) => stageOf(c) === 'terminated').length;
    return {
      total: contracts.length,
      draft,
      inApproval,
      active,
      terminated,
    };
  }, [contracts]);

  const filtered = useMemo(() => {
    return contracts.filter((r) => {
      if (statusTab === 'draft' && stageOf(r) !== 'draft') return false;
      if (statusTab === 'active' && stageOf(r) !== 'active') return false;
      if (statusTab === 'approval' && stageOf(r) !== 'in_approval') return false;
      if (statusTab === 'terminated' && stageOf(r) !== 'terminated') return false;

      if (search) {
        const q = search.toLowerCase();
        if (
          !r.code.toLowerCase().includes(q) &&
          !r.projectName.toLowerCase().includes(q) &&
          !r.customerName.toLowerCase().includes(q)
        )
          return false;
      }

      if (filterState.contractCode && !r.code.toLowerCase().includes(filterState.contractCode.toLowerCase()))
        return false;
      if (filterState.projectName && !r.projectName.toLowerCase().includes(filterState.projectName.toLowerCase()))
        return false;
      if (filterState.customerName && !r.customerName.toLowerCase().includes(filterState.customerName.toLowerCase()))
        return false;
      if (filterState.signingCompany && r.signingCompany !== filterState.signingCompany) return false;
      if (
        filterState.contractTemplateCategory &&
        r.contractTemplateCategory !== filterState.contractTemplateCategory
      )
        return false;
      if (filterState.standardContractName && r.standardContractName !== filterState.standardContractName)
        return false;

      const appr = filterState.approvalStatus[0];
      if (appr && appr !== '全部' && r.approvalStatus !== appr) return false;
      const cst = filterState.contractStatus[0];
      if (cst && cst !== '全部' && r.contractStatus !== cst) return false;
      if (filterState.businessDept[0] && r.businessDept !== filterState.businessDept[0]) return false;
      if (filterState.businessOwner[0] && r.businessOwner !== filterState.businessOwner[0]) return false;
      const at = filterState.approvalType[0];
      if (at && at !== '全部' && r.approvalType !== at) return false;
      if (filterState.creator[0] && !r.creator.includes(filterState.creator[0])) return false;
      if (filterState.startDate && r.endDate < filterState.startDate) return false;
      if (filterState.endDate && r.endDate > filterState.endDate) return false;

      return true;
    });
  }, [contracts, statusTab, search, filterState]);

  const selected = contracts.find((c) => c.id === selectedId) || contracts[0];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (r: LeaseContractRecord) => {
    setEditing(r);
    setFormOpen(true);
  };
  const openSplit = (r: LeaseContractRecord) => {
    setSelectedId(r.id);
    setViewMode('split');
  };

  const saveContract = (data: Partial<LeaseContractRecord>, status: 'draft' | 'submitted') => {
    if (editing) {
      setContracts((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c)));
      alert(`合同 ${editing.code} 已更新`);
    } else {
      const row = data as LeaseContractRecord;
      setContracts((prev) => [row, ...prev]);
      setSelectedId(row.id);
      alert(`合同 ${row.code} 已${status === 'submitted' ? '提交审核' : '存为草稿'}`);
    }
    setFormOpen(false);
  };

  const resetFilters = () => {
    setFilterState({
      contractCode: '',
      projectName: '',
      customerName: '',
      signingCompany: '',
      approvalStatus: ['全部'],
      contractStatus: ['全部'],
      businessDept: [],
      businessOwner: [],
      contractTemplateCategory: '',
      standardContractName: '',
      approvalType: ['全部'],
      creator: [],
      startDate: '',
      endDate: '',
    });
    // V2 查询收起规则：重置后同样收起「更多筛选」面板
    setShowMoreFilters(false);
  };

  /** 嵌套子表展开：expand 图标 = 全部车辆；「已交」= 仅已交车；同模式再点收起 */
  const toggleRowExpand = (recordId: string, mode: VehicleExpandFilter) => {
    setLeasePopoverId(null);
    setExpandedRows((prev) => {
      if (prev[recordId] === mode) {
        const next = { ...prev };
        delete next[recordId];
        return next;
      }
      return { ...prev, [recordId]: mode };
    });
  };

  const btnGhost: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: `1px solid ${t.border}`,
    background: t.surface,
    color: t.textPrimary,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };

  const btnPrimary: React.CSSProperties = {
    padding: '8px 18px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: t.accent,
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    boxShadow: '0 2px 8px color-mix(in srgb, var(--oneos-primary, #533afd) 35%, transparent)',
  };

  const viewBtn = (mode: ViewMode, label: string, Icon: React.ComponentType<{ size?: number }>) => (
    <button
      type="button"
      onClick={() => setViewMode(mode)}
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        border: 'none',
        background: viewMode === mode ? (isDark ? '#262a36' : '#ffffff') : 'transparent',
        color: viewMode === mode ? t.accent : t.textSecondary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: viewMode === mode && !isDark ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <Icon size={14} /> {label}
    </button>
  );

  const kpiCards = [
    {
      id: 'draft' as const,
      title: '草稿',
      value: String(counts.draft),
      sub: '未提交或撤回后的可编辑合同',
      icon: FileCheck,
      color: '#94a3b8',
    },
    {
      id: 'active' as const,
      title: '进行中',
      value: String(counts.active),
      sub: '审批通过后履约执行',
      icon: TrendingUp,
      color: '#10b981',
    },
    {
      id: 'approval' as const,
      title: '审批中',
      value: String(counts.inApproval),
      sub: '已提交、待审或流转中',
      icon: FileCheck2,
      color: '#d97706',
    },
    {
      id: 'terminated' as const,
      title: '已终止',
      value: String(counts.terminated),
      sub: '终止或到期归档',
      icon: XSquare,
      color: '#ef4444',
    },
  ];

  const buildRowActions = (r: LeaseContractRecord) => {
    const canEdit = r.contractStatus === 'draft' || r.approvalStatus === 'rejected';
    const more: OperationActionItem[] = [];

    if (r.contractStatus === 'draft') {
      more.push({
        key: 'delete',
        label: '删除草稿',
        danger: true,
        icon: Trash2,
        onClick: () => {
          if (confirm('是否确认删除该合同草稿？')) {
            setContracts((prev) => prev.filter((c) => c.id !== r.id));
          }
        },
      });
    }
    if (r.approvalStatus === 'approving') {
      more.push({
        key: 'withdraw',
        label: '撤回合同',
        icon: Clock,
        onClick: () => {
          if (confirm('是否确认撤回该合同？')) {
            setContracts((prev) =>
              prev.map((c) =>
                c.id === r.id
                  ? {
                      ...c,
                      approvalStatus: 'withdrawn',
                      contractStatus: 'draft',
                      currentApprover: '已撤回',
                    }
                  : c,
              ),
            );
          }
        },
      });
    }
    if (r.contractStatus === 'active') {
      more.push(
        {
          key: 'authorized',
          label: '添加被授权人',
          icon: UserCheck,
          onClick: () => {
            setTarget(r);
            setModal('delegate');
          },
        },
        {
          key: 'extraFee',
          label: '附加费用',
          icon: PlusCircle,
          onClick: () => {
            setTarget(r);
            setModal('extraFee');
          },
        },
        {
          key: 'toTripartite',
          label: '转三方合同',
          icon: Paperclip,
          onClick: () => alert('已打开转三方合同录入'),
        },
        {
          key: 'terminate',
          label: '终止合同',
          danger: true,
          icon: XSquare,
          onClick: () => {
            if (confirm('是否确认终止合同？')) {
              setContracts((prev) =>
                prev.map((c) =>
                  c.id === r.id
                    ? {
                        ...c,
                        approvalStatus: 'terminated',
                        contractStatus: 'terminated',
                        currentApprover: '已终止',
                      }
                    : c,
                ),
              );
            }
          },
        },
      );
    }
    if (r.contractTemplateCategory === 'trial') {
      more.push({
        key: 'toFormal',
        label: '试用转正式',
        icon: FileCheck,
        onClick: () => {
          setTarget(r);
          setModal('trialToFormal');
        },
      });
    }
    if (r.approvalStatus === 'approved' && r.signingMethod === 'offline_stamp') {
      more.push({
        key: 'uploadStamped',
        label: '上传盖章合同',
        icon: Paperclip,
        onClick: () => {
          setTarget(r);
          setModal('uploadStamp');
        },
      });
    }

    return {
      edit: canEdit
        ? { label: '编辑', onClick: () => openEdit(r) }
        : undefined,
      view: { label: '查看记录', onClick: () => openSplit(r) },
      more,
    };
  };

  /* 新增/编辑：同页全页表单（非抽屉） */
  if (formOpen) {
    return (
      <>
        <ContractFormDrawer
          key={editing?.id || 'create'}
          open
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          record={editing}
          onSave={saveContract}
          isDark={isDark}
        />
        <PrototypeAnnotationHost
          source={annotationSourceDocument as AnnotationSourceDocument}
          options={annotationOptions}
        />
      </>
    );
  }

  return (
    <div
      style={{
        background: t.bg,
        color: t.textPrimary,
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif',
        padding: '24px 32px',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {/* 1. 标题区：与设计图一致 —— 标题 + Badge + 三显示方式 + 主操作 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                margin: 0,
                color: t.textPrimary,
                letterSpacing: '-0.01em',
              }}
            >
              租赁合同台账与资产枢纽
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: t.accentSoft,
                color: t.accent,
                padding: '3px 10px',
                borderRadius: 12,
              }}
            >
              Stripe Fintech UI · 三模式统一规范
            </span>
          </div>
          <p style={{ fontSize: 13, color: t.textSecondary, margin: '4px 0 0 0' }}>
            业务管理 → 租赁合同管理 · 同一页内切换列表 / 看板 / 主从三种显示方式
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              background: isDark ? '#1a1d24' : '#e2e8ee',
              padding: 3,
              borderRadius: 8,
              border: `1px solid ${t.border}`,
            }}
          >
            {viewBtn('list', '列表模式', List)}
            {viewBtn('kanban', '看板模式', LayoutGrid)}
            {viewBtn('split', '主从/表单模式', Columns)}
          </div>

          <V2Button
            variant="secondary"
            size="md"
            icon={<ShieldCheck size={16} style={{ color: t.accent }} />}
            onClick={() => alert('打开合规法则配置')}
          >
            合规法则配置
          </V2Button>
          <V2Button variant="primary" size="md" icon={<Plus size={16} />} onClick={openCreate}>
            创建新租赁合同
          </V2Button>
        </div>
      </div>

      {/* 2. 阶段 KPI Bento（点击 = 切换阶段 Pill；与轨 A 同桶） */}
      {viewMode !== 'split' && (
        <div
          data-annotation-id="lc-list-kpi"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}
        >
          {kpiCards.map((card) => {
            const Icon = card.icon;
            const selected = statusTab === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setStatusTab(selected ? 'all' : card.id)}
                aria-pressed={selected}
                style={{
                  background: t.surface,
                  border: `1px solid ${selected ? t.accent : t.border}`,
                  boxShadow: selected
                    ? `0 0 0 3px color-mix(in srgb, ${t.accent} 18%, transparent)`
                    : isDark
                      ? 'none'
                      : '0 2px 6px rgba(0,0,0,0.02)',
                  borderRadius: 12,
                  padding: '18px 20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'inherit',
                  font: 'inherit',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>{card.title}</span>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.color,
                    }}
                  >
                    <Icon size={18} aria-hidden />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: t.textPrimary,
                    }}
                  >
                    {card.value}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: t.textSecondary,
                      marginTop: 4,
                    }}
                  >
                    {card.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. 列表/看板：状态 Tab + 搜索 + 更多筛选 + 导出 */}
      {viewMode !== 'split' && (
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: viewMode === 'list' && !showMoreFilters ? '12px 12px 0 0' : 12,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: viewMode === 'kanban' || showMoreFilters ? 16 : 0,
            borderBottom: viewMode === 'list' && !showMoreFilters ? `1px solid ${t.border}` : undefined,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 8,
              background: isDark ? '#1a1d24' : '#f1f5f9',
              padding: 4,
              borderRadius: 8,
            }}
          >
            {(
              [
                { id: 'all' as const, label: `全部合同 (${counts.total})` },
                { id: 'draft' as const, label: `草稿 (${counts.draft})` },
                { id: 'active' as const, label: `进行中 (${counts.active})` },
                { id: 'approval' as const, label: `审批中 (${counts.inApproval})` },
                { id: 'terminated' as const, label: `已终止 (${counts.terminated})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: statusTab === tab.id ? (isDark ? '#262a36' : '#ffffff') : 'transparent',
                  color: statusTab === tab.id ? t.accent : t.textSecondary,
                  boxShadow: statusTab === tab.id && !isDark ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <V2FilterSearch aria-label="搜索合同" style={{ width: 280 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索合同编号 / 项目 / 客户"
                aria-label="搜索合同编号、项目或客户"
              />
            </V2FilterSearch>
            <V2FilterMoreButton
              open={showMoreFilters}
              activeCount={activeMoreFilterCount}
              onClick={() => setShowMoreFilters((v) => !v)}
            />
            <V2Button
              variant="ghost"
              size="sm"
              icon={<Download size={14} />}
              onClick={() => alert('已按当前筛选结果导出 Excel')}
            >
              导出
            </V2Button>
          </div>
        </div>
      )}

      {/* 4. 13 项高阶筛选（原 Markdown §4） */}
      {viewMode !== 'split' && showMoreFilters && (
        <FilterBar
          filterState={filterState}
          onFilterChange={setFilterState}
          onReset={resetFilters}
          onSearch={() => {
            // V2 查询收起规则：应用条件后自动收起筛选栏
            setShowMoreFilters(false);
          }}
          isDark={isDark}
          defaultExpanded
        />
      )}

      {/* ========== 列表模式 ========== */}
      {viewMode === 'list' && (
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderTop: showMoreFilters ? `1px solid ${t.border}` : 'none',
            borderRadius: showMoreFilters ? 12 : '0 0 12px 12px',
            overflow: 'hidden',
            boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.02)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  background: isDark ? '#16181f' : '#fafbfc',
                  borderBottom: `1px solid ${t.border}`,
                  color: t.textSecondary,
                  fontSize: 12,
                }}
              >
                <th style={{ padding: '14px 20px', fontWeight: 600, minWidth: 280 }}>项目信息</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, width: 140 }}>租赁订单</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>客户与签约公司</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, minWidth: 168 }}>履约与审批状态</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>签署方式</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>合同金额</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const expandFilter = expandedRows[row.id];
                const expanded = Boolean(expandFilter);
                const canExpand = (row.vehicles || []).length > 0;
                const deliveredCount = countDeliveredVehicles(row);
                const leaseCount = row.vehicles?.length ?? row.totalVehicles;
                const popoverOpen = leasePopoverId === row.id;

                return (
                  <React.Fragment key={row.id}>
                    <tr
                      style={{
                        borderBottom: expanded ? 'none' : `1px solid ${t.border}`,
                        background: expanded ? (isDark ? '#0f1115' : '#fafbfc') : undefined,
                      }}
                    >
                      {/* 项目信息：展开图标 + 项目名/编码/客户（对齐原原型） */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          {canExpand ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRowExpand(row.id, 'all');
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: t.accent,
                                padding: '2px 0',
                                display: 'flex',
                                flexShrink: 0,
                                marginTop: 2,
                              }}
                              aria-label={expanded && expandFilter === 'all' ? '收起车辆明细' : '展开车辆明细'}
                              aria-expanded={expanded && expandFilter === 'all'}
                            >
                              {expanded && expandFilter === 'all' ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </button>
                          ) : (
                            <span style={{ width: 16, flexShrink: 0 }} />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: t.textPrimary, fontWeight: 500 }}>{row.projectName}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                              <DetailEntryLink
                                variant="code"
                                ariaLabel={`${row.code}，点击进入合同详情`}
                                onClick={() => openSplit(row)}
                              >
                                {row.code}
                              </DetailEntryLink>
                              <span
                                style={{
                                  fontSize: 11,
                                  color: t.textSecondary,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 3,
                                }}
                              >
                                <Calendar size={11} /> {row.createdAt.slice(0, 10)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 租赁订单：租赁(Popover全部车辆) | 已交(展开已交车子表) */}
                      <td style={{ padding: '16px 16px', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                          <div style={{ position: 'relative' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLeasePopoverId(popoverOpen ? null : row.id);
                              }}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                padding: '4px 10px',
                                borderRadius: 8,
                                border: `1px solid ${popoverOpen ? t.accent : t.border}`,
                                background: popoverOpen ? t.accentSoft : 'transparent',
                                cursor: 'pointer',
                                minWidth: 48,
                              }}
                              aria-label={`租赁车辆数 ${leaseCount}`}
                            >
                              <span
                                style={{
                                  fontFamily: 'JetBrains Mono, monospace',
                                  fontWeight: 800,
                                  fontSize: 15,
                                  color: t.textPrimary,
                                }}
                              >
                                {leaseCount}
                              </span>
                              <span style={{ fontSize: 10, color: t.textSecondary, fontWeight: 600 }}>租赁</span>
                            </button>

                            {popoverOpen && (
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: '100%',
                                  marginTop: 6,
                                  width: 280,
                                  background: t.surface,
                                  border: `1px solid ${t.border}`,
                                  borderRadius: 10,
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                  zIndex: 30,
                                  padding: 12,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    marginBottom: 4,
                                    color: t.textPrimary,
                                  }}
                                >
                                  租赁车辆明细
                                </div>
                                <div style={{ fontSize: 11, color: t.accent, fontFamily: 'monospace', marginBottom: 10 }}>
                                  {row.code}
                                </div>
                                {(row.vehicles || []).length === 0 ? (
                                  <div style={{ fontSize: 12, color: t.textSecondary }}>该合同暂无租赁车辆</div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                                    {row.vehicles.map((v) => (
                                      <div
                                        key={v.id}
                                        style={{
                                          padding: 8,
                                          borderRadius: 6,
                                          background: t.surfaceHover,
                                          border: `1px solid ${t.border}`,
                                          fontSize: 11,
                                        }}
                                      >
                                        <div style={{ fontWeight: 700, fontFamily: 'monospace', color: t.accent }}>
                                          {v.plateNo}
                                        </div>
                                        <div style={{ color: t.textSecondary, marginTop: 2 }}>
                                          {v.brand} · {v.model}
                                        </div>
                                        <div style={{ color: t.textSecondary, marginTop: 2 }}>{v.vehicleType}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {canExpand && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLeasePopoverId(null);
                                      toggleRowExpand(row.id, 'all');
                                    }}
                                    style={{
                                      marginTop: 10,
                                      width: '100%',
                                      padding: 6,
                                      borderRadius: 6,
                                      border: `1px solid ${t.accent}`,
                                      background: 'transparent',
                                      color: t.accent,
                                      fontSize: 11,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    展开嵌套车辆子表
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <span
                            style={{
                              width: 1,
                              height: 28,
                              background: t.border,
                              margin: '0 6px',
                            }}
                            aria-hidden
                          />

                          <button
                            type="button"
                            disabled={deliveredCount === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (deliveredCount === 0) return;
                              toggleRowExpand(row.id, 'delivered');
                            }}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 2,
                              padding: '4px 10px',
                              borderRadius: 8,
                              border: `1px solid ${
                                expandFilter === 'delivered' ? t.accent : t.border
                              }`,
                              background:
                                expandFilter === 'delivered' ? t.accentSoft : 'transparent',
                              cursor: deliveredCount === 0 ? 'not-allowed' : 'pointer',
                              opacity: deliveredCount === 0 ? 0.45 : 1,
                              minWidth: 48,
                            }}
                            aria-label={`已交车辆数 ${deliveredCount}`}
                            aria-expanded={expandFilter === 'delivered'}
                          >
                            <span
                              style={{
                                fontFamily: 'JetBrains Mono, monospace',
                                fontWeight: 800,
                                fontSize: 15,
                                color: t.textPrimary,
                              }}
                            >
                              {deliveredCount}
                            </span>
                            <span style={{ fontSize: 10, color: t.textSecondary, fontWeight: 600 }}>已交</span>
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ color: t.textPrimary, fontWeight: 500 }}>{row.lesseeCompany}</div>
                        <div
                          style={{
                            fontSize: 11,
                            color: t.textSecondary,
                            marginTop: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Building size={11} /> {row.signingCompany}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            maxWidth: 'none',
                            background:
                              row.approvalStatus === 'approved'
                                ? isDark
                                  ? 'rgba(16,185,129,0.15)'
                                  : '#ecfdf5'
                                : row.approvalStatus === 'approving' || row.approvalStatus === 'pending'
                                  ? isDark
                                    ? 'rgba(217,119,6,0.15)'
                                    : '#fefce8'
                                  : row.approvalStatus === 'rejected' || row.approvalStatus === 'terminated'
                                    ? isDark
                                      ? 'rgba(239,68,68,0.15)'
                                      : '#fef2f2'
                                    : isDark
                                      ? '#23272f'
                                      : '#f1f5f9',
                            color:
                              row.approvalStatus === 'approved'
                                ? '#10b981'
                                : row.approvalStatus === 'approving' || row.approvalStatus === 'pending'
                                  ? '#d97706'
                                  : row.approvalStatus === 'rejected' || row.approvalStatus === 'terminated'
                                    ? '#ef4444'
                                    : t.textSecondary,
                          }}
                        >
                          <CheckCircle2 size={12} />
                          {approvalLabel(row.approvalStatus)} ·{' '}
                          {row.approvalType === 'standard' ? '标准合同' : '非标准合同'}
                        </span>
                        <div style={{ fontSize: 10, color: t.textSecondary, marginTop: 4 }}>
                          {stageLabel(row)}
                          {(row.approvalStatus === 'approving' || row.approvalStatus === 'pending') &&
                          row.currentApprover
                            ? ` · ${row.currentApprover}`
                            : ''}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 12, color: t.textPrimary, fontWeight: 500 }}>
                          {row.signingMethod === 'online_esign' ? '线上电子签章' : '线下人工签署'}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            fontFamily: 'JetBrains Mono, monospace',
                            color: t.textPrimary,
                          }}
                        >
                          ¥ {contractAmount(row).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 2 }}>
                          ¥{row.monthlyRentPerVehicle.toLocaleString()}/辆/月 · {row.paymentPeriod}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {(() => {
                          const actions = buildRowActions(row);
                          return (
                            <div style={{ display: 'inline-flex', justifyContent: 'flex-end' }}>
                              <OperationActions
                                edit={actions.edit}
                                view={actions.view}
                                more={actions.more}
                              />
                            </div>
                          );
                        })()}
                      </td>
                    </tr>

                    {/* 嵌套车辆子表行 */}
                    {expanded && (
                      <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                        <td colSpan={7} style={{ padding: '0 16px 16px', background: isDark ? '#0f1115' : '#f8fafc' }}>
                          <VehicleSubTable
                            record={row}
                            vehicles={row.vehicles}
                            filterMode={expandFilter || 'all'}
                            onReturnVehicle={(v) => {
                              setTargetVehicle(v);
                              setModal('returnVehicle');
                            }}
                            isDark={isDark}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: t.textSecondary }}>
                    暂无符合条件的合同
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========== 看板模式 ========== */}
      {viewMode === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>
          {(
            [
              { id: 'draft' as const, title: '草稿', color: '#94a3b8' },
              { id: 'in_approval' as const, title: '审批中', color: '#d97706' },
              { id: 'active' as const, title: '进行中', color: '#10b981' },
              { id: 'terminated' as const, title: '已终止', color: '#ef4444' },
            ] as const
          ).map((col) => {
            const rows = filtered.filter((r) => stageOf(r) === col.id);
            return (
              <div
                key={col.id}
                style={{
                  background: isDark ? '#121418' : '#f8fafc',
                  border: `1px solid ${t.border}`,
                  borderRadius: 12,
                  padding: 16,
                  minHeight: 520,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                    paddingBottom: 10,
                    borderBottom: `1px solid ${t.border}`,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 800, color: t.textPrimary }}>
                    <span style={{ color: col.color, marginRight: 6 }}>●</span>
                    {col.title}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      background: isDark ? '#1f2430' : '#e2e8ee',
                      padding: '2px 8px',
                      borderRadius: 10,
                    }}
                  >
                    {rows.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {rows.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        background: t.surface,
                        border: `1px solid ${t.border}`,
                        borderRadius: 10,
                        padding: 14,
                        boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: t.accent,
                            background: t.accentSoft,
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                        >
                          {r.code}
                        </span>
                        <span style={{ fontSize: 11, color: t.textSecondary }}>{r.paymentPeriod}</span>
                      </div>
                      <h4
                        onClick={() => openSplit(r)}
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          margin: '0 0 6px',
                          cursor: 'pointer',
                          lineHeight: 1.4,
                        }}
                      >
                        {r.projectName}
                      </h4>
                      <div style={{ fontSize: 12, color: t.textSecondary, marginBottom: 10 }}>
                        客户：<span style={{ color: t.textPrimary, fontWeight: 600 }}>{r.customerName}</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 8,
                          background: t.surfaceHover,
                          borderRadius: 6,
                          padding: 8,
                          fontSize: 11,
                          marginBottom: 10,
                        }}
                      >
                        <div>
                          <div style={{ color: t.textSecondary }}>交车履约</div>
                          <div style={{ fontWeight: 700, marginTop: 2 }}>
                            {r.deliveredVehiclesCount} / {r.totalVehicles} 辆
                          </div>
                        </div>
                        <div>
                          <div style={{ color: t.textSecondary }}>单车月租</div>
                          <div
                            style={{
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              color: t.accent,
                              marginTop: 2,
                            }}
                          >
                            ¥{r.monthlyRentPerVehicle.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openSplit(r)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          fontSize: 11,
                          fontWeight: 700,
                          color: t.accent,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        进入主从详情 →
                      </button>
                    </div>
                  ))}
                  {rows.length === 0 && (
                    <div
                      style={{
                        border: `1px dashed ${t.border}`,
                        borderRadius: 8,
                        padding: 24,
                        textAlign: 'center',
                        fontSize: 12,
                        color: t.textSecondary,
                      }}
                    >
                      暂无此阶段合同
                    </div>
                  )}
                </div>
                {col.id === 'draft' && (
                  <button
                    type="button"
                    onClick={openCreate}
                    style={{
                      marginTop: 12,
                      width: '100%',
                      padding: 8,
                      borderRadius: 8,
                      border: `1px dashed ${t.accent}`,
                      background: 'transparent',
                      color: t.accent,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    + 新建草稿合同
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========== 主从/表单模式 ========== */}
      {viewMode === 'split' && selected && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 20,
            alignItems: 'start',
            minHeight: 640,
          }}
        >
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: 16,
              maxHeight: 'calc(100vh - 160px)',
              overflow: 'auto',
            }}
          >
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: 10, top: 10, color: t.textSecondary }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索合同编码/项目/客户..."
                style={{
                  width: '100%',
                  background: t.surfaceHover,
                  border: `1px solid ${t.border}`,
                  borderRadius: 8,
                  padding: '7px 10px 7px 32px',
                  fontSize: 12,
                  color: t.textPrimary,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map((r) => {
                const on = r.id === selected.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    style={{
                      textAlign: 'left',
                      padding: 12,
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: on ? t.accentSoft : t.surfaceHover,
                      border: `1px solid ${on ? t.accent : t.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: on ? t.accent : t.textSecondary,
                        }}
                      >
                        {r.code}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: t.textSecondary }}>
                        {stageLabel(r)}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{r.projectName}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: t.textSecondary,
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{r.customerName}</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: t.accent }}>
                        ¥{r.monthlyRentPerVehicle.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                borderBottom: `1px solid ${t.border}`,
                paddingBottom: 16,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: t.accent,
                      background: t.accentSoft,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    {selected.code}
                  </span>
                  <span style={{ fontSize: 12, color: t.textSecondary }}>{selected.signingCompany}</span>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 0' }}>{selected.projectName}</h2>
                <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 4 }}>
                  承租方：<strong style={{ color: t.textPrimary }}>{selected.customerName}</strong> ·{' '}
                  {selected.businessDept}（{selected.businessOwner}）
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(selected.contractStatus === 'draft' || selected.approvalStatus === 'rejected') && (
                  <button type="button" style={{ ...btnGhost, color: t.accent, borderColor: t.accent }} onClick={() => openEdit(selected)}>
                    <Edit size={13} /> 编辑合同
                  </button>
                )}
                {selected.contractStatus === 'active' && (
                  <>
                    <button
                      type="button"
                      style={btnGhost}
                      onClick={() => {
                        setTarget(selected);
                        setModal('delegate');
                      }}
                    >
                      <UserCheck size={13} /> 授权人 ({selected.delegates.length})
                    </button>
                    <button
                      type="button"
                      style={btnGhost}
                      onClick={() => {
                        setTarget(selected);
                        setModal('extraFee');
                      }}
                    >
                      <PlusCircle size={13} /> 附加费用
                    </button>
                  </>
                )}
                {selected.contractTemplateCategory === 'trial' && (
                  <button
                    type="button"
                    style={btnPrimary}
                    onClick={() => {
                      setTarget(selected);
                      setModal('trialToFormal');
                    }}
                  >
                    <FileCheck size={13} /> 试用转正式
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: '单车月租金', value: `¥${selected.monthlyRentPerVehicle.toLocaleString()}` },
                {
                  label: '交付进度',
                  value: `${selected.deliveredVehiclesCount} / ${selected.totalVehicles} 辆`,
                },
                { label: '保证金', value: `¥${(selected.depositAmount / 10000).toFixed(1)} 万` },
                { label: '付款方式', value: selected.paymentPeriod },
              ].map((x) => (
                <div
                  key={x.label}
                  style={{
                    background: t.surfaceHover,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 11, color: t.textSecondary }}>{x.label}</div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      fontFamily: 'JetBrains Mono, monospace',
                      marginTop: 2,
                      color: x.label === '单车月租金' ? t.accent : t.textPrimary,
                    }}
                  >
                    {x.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}`, gap: 16 }}>
              {(
                [
                  { id: 'vehicles' as const, label: '车辆履约与交还车明细', count: selected.vehicles.length },
                  { id: 'info' as const, label: '主体资质与授权人', count: selected.delegates.length },
                  {
                    id: 'audit' as const,
                    label: '审批节点与签署文件',
                    count: selected.approvalNodes?.length || 0,
                  },
                  { id: 'extra' as const, label: '附加费用与协议', count: selected.extraFees.length },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSplitSubTab(tab.id)}
                  style={{
                    padding: '8px 0',
                    fontSize: 13,
                    fontWeight: splitSubTab === tab.id ? 700 : 500,
                    color: splitSubTab === tab.id ? t.accent : t.textSecondary,
                    border: 'none',
                    borderBottom: splitSubTab === tab.id ? `2px solid ${t.accent}` : '2px solid transparent',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {tab.label}
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'monospace',
                      background: splitSubTab === tab.id ? t.accentSoft : t.surfaceHover,
                      color: splitSubTab === tab.id ? t.accent : t.textSecondary,
                      padding: '1px 6px',
                      borderRadius: 8,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {splitSubTab === 'vehicles' && (
              <VehicleSubTable
                record={selected}
                vehicles={selected.vehicles}
                filterMode="all"
                onReturnVehicle={(v) => {
                  setTargetVehicle(v);
                  setModal('returnVehicle');
                }}
                isDark={isDark}
              />
            )}
            {splitSubTab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    background: t.surfaceHover,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    padding: 16,
                    fontSize: 12,
                    lineHeight: 1.8,
                    color: t.textSecondary,
                  }}
                >
                  <div>
                    公司全称：<strong style={{ color: t.textPrimary }}>{selected.lesseeCompany}</strong>
                  </div>
                  <div>交付区域：{selected.deliveryRegion}</div>
                  <div>预计交车：{selected.deliveryDatePlan}</div>
                </div>
                <div
                  style={{
                    background: t.surfaceHover,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>授权委托书被授权人</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setTarget(selected);
                        setModal('delegate');
                      }}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: t.accent,
                        background: 'transparent',
                        border: `1px solid ${t.accent}`,
                        borderRadius: 4,
                        padding: '3px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      + 管理授权人
                    </button>
                  </div>
                  {selected.delegates.length === 0 ? (
                    <div style={{ fontSize: 12, color: t.textSecondary }}>未录入被授权人</div>
                  ) : (
                    selected.delegates.map((d) => (
                      <div
                        key={d.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 12,
                          padding: 8,
                          background: t.surface,
                          borderRadius: 6,
                          border: `1px solid ${t.border}`,
                          marginBottom: 6,
                        }}
                      >
                        <span>
                          <strong>{d.name}</strong> ({d.phone})
                        </span>
                        <span style={{ fontFamily: 'monospace', color: t.textSecondary }}>{d.idCard}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {splitSubTab === 'audit' && (
              <div
                style={{
                  background: t.surfaceHover,
                  border: `1px solid ${t.border}`,
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700 }}>审批节点流转</h4>
                {(selected.approvalNodes || []).length === 0 ? (
                  <div style={{ fontSize: 12, color: t.textSecondary }}>尚无流转节点</div>
                ) : (
                  (selected.approvalNodes || []).map((n, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2
                          size={14}
                          style={{ color: n.status === 'passed' ? '#10b981' : t.textSecondary }}
                        />
                        {n.nodeName}（{n.approver}）
                      </span>
                      <span style={{ fontWeight: 600, color: n.status === 'passed' ? '#10b981' : t.textSecondary }}>
                        {n.status === 'passed' ? '通过' : n.status === 'rejected' ? '驳回' : '处理中'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
            {splitSubTab === 'extra' && (
              <div
                style={{
                  background: t.surfaceHover,
                  border: `1px solid ${t.border}`,
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>车辆附加费用</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setTarget(selected);
                      setModal('extraFee');
                    }}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: t.accent,
                      background: 'transparent',
                      border: `1px solid ${t.accent}`,
                      borderRadius: 4,
                      padding: '3px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    + 录入附加费
                  </button>
                </div>
                {selected.extraFees.length === 0 ? (
                  <div style={{ fontSize: 12, color: t.textSecondary }}>暂无附加费用</div>
                ) : (
                  selected.extraFees.map((ef) => (
                    <div
                      key={ef.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        padding: 8,
                        background: t.surface,
                        borderRadius: 6,
                        border: `1px solid ${t.border}`,
                        marginBottom: 6,
                      }}
                    >
                      <span>
                        <strong>{ef.serviceItem}</strong>（{ef.vehiclePlate}）
                      </span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: t.accent }}>
                        +¥{ef.feeAmount}/月
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <DelegateModal open={modal === 'delegate'} onClose={() => setModal(null)} record={target} isDark={isDark} />
      <ExtraFeeModal open={modal === 'extraFee'} onClose={() => setModal(null)} record={target} isDark={isDark} />
      <TrialToFormalModal
        open={modal === 'trialToFormal'}
        onClose={() => setModal(null)}
        record={target}
        isDark={isDark}
      />
      <UploadStampModal
        open={modal === 'uploadStamp'}
        onClose={() => setModal(null)}
        record={target}
        isDark={isDark}
      />
      <ReturnVehicleModal
        open={modal === 'returnVehicle'}
        onClose={() => setModal(null)}
        vehicle={targetVehicle}
        isDark={isDark}
      />

      <PrototypeAnnotationHost
        source={annotationSourceDocument as AnnotationSourceDocument}
        options={annotationOptions}
      />
    </div>
  );
}
