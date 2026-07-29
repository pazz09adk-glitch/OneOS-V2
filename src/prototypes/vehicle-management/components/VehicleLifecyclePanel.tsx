import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownUp,
  ArrowLeftRight,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Construction,
  FileBadge,
  History,
  KeyRound,
  Layers,
  Package,
  PackageCheck,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
  Wrench,
  X,
} from 'lucide-react';
import {
  V2Empty,
  V2FilterSearch,
  V2Select,
  V2Tag,
  V2Timeline,
} from '../../../resources/design-system/components/UIComponents';
import type { VehicleRecord } from '../types';
import type { VehicleInsuranceExpire } from '../utils/insurance';
import {
  LIFECYCLE_HIGH_FREQUENCY_STAGES,
  LIFECYCLE_STAGE_META,
  LIFECYCLE_STAGE_ORDER,
  buildVehicleLifecycleEvents,
  type LifecycleSourceRows,
  type LifecycleStage,
  type VehicleLifecycleEvent,
} from '../utils/lifecycle';
import {
  DetailAccidentRecordsTab,
  DetailAnnualReviewRecordsTab,
  DetailDeliveryRecordsTab,
  DetailMovementRecordsTab,
  DetailReplaceRecordsTab,
  DetailReturnRecordsTab,
  DetailTransferRecordsTab,
  DetailViolationRecordsTab,
  type AccidentRecordRow,
  type AnnualReviewRecordRow,
  type DeliveryRecordRow,
  type MovementRecordRow,
  type ReplaceRecordRow,
  type ReturnRecordRow,
  type TransferRecordRow,
  type ViolationRecordRow,
} from './DetailRecordTabs';
import {
  DetailFaultRecordsTab,
  type FaultRecordRow,
} from './DetailFaultRecordsTab';
import {
  DetailInsuranceRecordsTab,
  type InsuranceHistoryRow,
} from './DetailInsuranceRecordsTab';

/** 阶段条：全部 = 时间轴；其余切到对应业务列表 */
const STAGE_FILTERS: Array<{ id: 'all' | LifecycleStage; label: string }> = [
  { id: 'all', label: '全部' },
  ...LIFECYCLE_STAGE_ORDER.map((id) => ({ id, label: LIFECYCLE_STAGE_META[id].label })),
];

/** 暂未上线：切换后展示敬请期待（验车/维修/保养/过户/销售/报废） */
const COMING_SOON_STAGES = new Set<LifecycleStage>([
  'inspect',
  'repair',
  'maintain',
  'ownership',
  'sale',
  'scrap',
]);

type CountTone = 'primary' | 'info' | 'danger' | 'warning' | 'success' | 'muted';

const STAGE_COUNT_TONE: Record<LifecycleStage, CountTone> = {
  inspect: 'muted',
  inbound: 'primary',
  delivery: 'primary',
  return: 'muted',
  replace: 'info',
  movement: 'info',
  annual: 'success',
  insuranceCompulsory: 'warning',
  insuranceCommercial: 'warning',
  transfer: 'info',
  fault: 'warning',
  violation: 'warning',
  accident: 'danger',
  repair: 'warning',
  maintain: 'success',
  ownership: 'muted',
  sale: 'muted',
  scrap: 'muted',
  outbound: 'muted',
};

const STAGE_COUNT_ICON: Record<LifecycleStage, React.ReactNode> = {
  inspect: <ClipboardCheck size={14} strokeWidth={2.25} aria-hidden />,
  inbound: <PackageCheck size={14} strokeWidth={2.25} aria-hidden />,
  delivery: <KeyRound size={14} strokeWidth={2.25} aria-hidden />,
  return: <ArrowLeftRight size={14} strokeWidth={2.25} aria-hidden />,
  replace: <ArrowDownUp size={14} strokeWidth={2.25} aria-hidden />,
  movement: <Truck size={14} strokeWidth={2.25} aria-hidden />,
  annual: <FileBadge size={14} strokeWidth={2.25} aria-hidden />,
  insuranceCompulsory: <ShieldCheck size={14} strokeWidth={2.25} aria-hidden />,
  insuranceCommercial: <Shield size={14} strokeWidth={2.25} aria-hidden />,
  transfer: <ArrowDownUp size={14} strokeWidth={2.25} aria-hidden />,
  fault: <Wrench size={14} strokeWidth={2.25} aria-hidden />,
  violation: <ShieldAlert size={14} strokeWidth={2.25} aria-hidden />,
  accident: <AlertTriangle size={14} strokeWidth={2.25} aria-hidden />,
  repair: <Wrench size={14} strokeWidth={2.25} aria-hidden />,
  maintain: <CheckCircle2 size={14} strokeWidth={2.25} aria-hidden />,
  ownership: <FileBadge size={14} strokeWidth={2.25} aria-hidden />,
  sale: <ShoppingCart size={14} strokeWidth={2.25} aria-hidden />,
  scrap: <Trash2 size={14} strokeWidth={2.25} aria-hidden />,
  outbound: <Package size={14} strokeWidth={2.25} aria-hidden />,
};

/** 关键事件总数：仅高频操作（入库 / 过户 / 销售 / 报废 / 出库等互斥低频项见时间轴） */
const HIGH_FREQ_EVENT_COUNT_META: Array<{
  stage: LifecycleStage;
  label: string;
  shortLabel: string;
  title: string;
  tone: CountTone;
  icon: React.ReactNode;
}> = LIFECYCLE_HIGH_FREQUENCY_STAGES.map((stage) => {
  const label = LIFECYCLE_STAGE_META[stage].label;
  return {
    stage,
    label: `${label}次数`,
    shortLabel: label,
    title: `全生命周期「${label}」次数；点击跳转对应阶段。`,
    tone: STAGE_COUNT_TONE[stage],
    icon: STAGE_COUNT_ICON[stage],
  };
});

export interface LifecycleWorkbenchRows extends LifecycleSourceRows {
  delivery: DeliveryRecordRow[];
  return: ReturnRecordRow[];
  replace: ReplaceRecordRow[];
  accident: AccidentRecordRow[];
  fault: FaultRecordRow[];
  violation: ViolationRecordRow[];
  movement: MovementRecordRow[];
  transfer: TransferRecordRow[];
  annual: AnnualReviewRecordRow[];
  purchases: InsuranceHistoryRow[];
}

function spanLabel(events: VehicleLifecycleEvent[]): string {
  if (!events.length) return '暂无跨度';
  const newest = events[0]?.timeLabel || '—';
  const oldest = events[events.length - 1]?.timeLabel || '—';
  if (newest === oldest) return newest;
  return `${oldest} → ${newest}`;
}

function spanDays(events: VehicleLifecycleEvent[]): string {
  if (events.length < 2) return '';
  const newest = Date.parse(events[0].timestamp.replace(/-/g, '/'));
  const oldest = Date.parse(events[events.length - 1].timestamp.replace(/-/g, '/'));
  if (!Number.isFinite(newest) || !Number.isFinite(oldest)) return '';
  const days = Math.max(0, Math.round(Math.abs(newest - oldest) / 86400000));
  if (days <= 0) return '同日';
  if (days < 30) return `${days} 天`;
  if (days < 365) return `约 ${Math.round(days / 30)} 个月`;
  return `约 ${(days / 365).toFixed(1)} 年`;
}

function ComingSoonPanel({ stageLabel }: { stageLabel: string }) {
  return (
    <div className="va-life__coming-soon" role="status">
      <V2Empty
        type="empty"
        size="small"
        icon={<Construction size={28} aria-hidden />}
        title="暂未上线，敬请期待"
        description={`${stageLabel}相关能力后续设计上线后，将在此展示业务列表。`}
        primaryActionText=""
      />
    </div>
  );
}

function StageEventList({
  stageLabel,
  events,
}: {
  stageLabel: string;
  events: VehicleLifecycleEvent[];
}) {
  if (!events.length) {
    return (
      <div className="va-life__empty" role="status">
        <V2Empty
          type="empty"
          size="small"
          icon={<History size={26} aria-hidden />}
          title={`暂无${stageLabel}记录`}
          description="该阶段事件产生后将在此汇总展示。"
          primaryActionText=""
        />
      </div>
    );
  }

  return (
    <div className="va-life__stage-list" aria-label={`${stageLabel}记录列表`}>
      <div className="va-life__order-hint" role="status">
        <V2Tag type="primary" size="small">倒序</V2Tag>
        <span>
          共
          {' '}
          <strong className="tabular-nums">{events.length}</strong>
          {' '}
          条
        </span>
      </div>
      <ul className="va-life__event-list">
        {events.map((event) => (
          <li key={event.id} className="va-life__event-item">
            <div className="va-life__event-item__main">
              <strong>{event.title}</strong>
              <span className="va-life__event-item__summary">{event.summary}</span>
            </div>
            <div className="va-life__event-item__meta">
              <time className="tabular-nums">{event.timeLabel}</time>
              {event.operator ? <span>{event.operator}</span> : null}
              {event.tag ? <V2Tag type="default" size="small">{event.tag}</V2Tag> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function VehicleLifecyclePanel({
  record,
  rows,
  insurance,
  onToast,
}: {
  record: VehicleRecord;
  rows: LifecycleWorkbenchRows;
  insurance?: VehicleInsuranceExpire;
  onToast: (msg: string) => void;
}) {
  const [stage, setStage] = useState<'all' | LifecycleStage>('all');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);

  const allEvents = useMemo(() => buildVehicleLifecycleEvents(record, rows), [record, rows]);
  const durationHint = useMemo(() => spanDays(allEvents), [allEvents]);

  const stageCounts = useMemo(() => {
    const counts = Object.fromEntries(
      Object.keys(LIFECYCLE_STAGE_META).map((key) => [key, 0]),
    ) as Record<LifecycleStage, number>;
    allEvents.forEach((event) => {
      counts[event.stage] += 1;
    });
    return counts;
  }, [allEvents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allEvents.filter((event) => {
      if (stage !== 'all' && event.stage !== stage) return false;
      if (!q) return true;
      const hay = [event.title, event.summary, event.operator, event.tag, event.timeLabel]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [allEvents, stage, query]);

  const stageEvents = useMemo(
    () => (stage === 'all' ? [] : allEvents.filter((event) => event.stage === stage)),
    [allEvents, stage],
  );

  const hasActiveFilter = stage !== 'all' || Boolean(query.trim());
  const isTimeline = stage === 'all';
  const isComingSoon = stage !== 'all' && COMING_SOON_STAGES.has(stage);
  const stageLabel = stage === 'all' ? '全部' : LIFECYCLE_STAGE_META[stage].label;

  const timelineItems = useMemo(
    () => filtered.map((event) => {
      const open = expandAll || expandedId === event.id;
      const hasDetails = Boolean(event.details?.length);
      return {
        title: event.title,
        timestamp: event.timeLabel,
        operator: event.operator,
        tag: event.tag,
        color: event.color,
        content: (
          <div className={`va-life-card${open ? ' is-open' : ''}${hasDetails ? ' is-expandable' : ''}`}>
            <button
              type="button"
              className="va-life-card__hit"
              onClick={() => {
                if (!hasDetails) return;
                setExpandAll(false);
                setExpandedId((prev) => (prev === event.id ? null : event.id));
              }}
              aria-expanded={hasDetails ? open : undefined}
              disabled={!hasDetails}
            >
              <span className="va-life-card__summary">{event.summary}</span>
              {hasDetails ? (
                <span className="va-life-card__more">
                  <ChevronDown size={14} aria-hidden />
                  {open ? '收起明细' : '展开明细'}
                </span>
              ) : (
                <span className="va-life-card__more is-static">无附加明细</span>
              )}
            </button>
            {open && hasDetails ? (
              <dl className="va-life-card__details">
                {event.details!.map((item) => (
                  <div key={`${event.id}-${item.label}`} className="va-life-card__detail">
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        ),
      };
    }),
    [filtered, expandAll, expandedId],
  );

  const latest = allEvents[0];

  const selectStage = (next: 'all' | LifecycleStage) => {
    setStage(next);
    setQuery('');
    setExpandedId(null);
    setExpandAll(false);
  };

  const renderStageBody = () => {
    if (isTimeline) {
      if (!filtered.length) {
        return (
          <div className="va-life__empty" role="status">
            <V2Empty
              type="no_search"
              size="small"
              icon={<History size={26} aria-hidden />}
              title={allEvents.length ? '当前筛选下暂无事件' : '暂无生命周期记录'}
              description={
                allEvents.length
                  ? '试试清空搜索词，或切换到具体阶段查看业务列表。'
                  : '验车、入库、交还车、异动、年审等生命周期事件产生后将在此汇总展示。'
              }
              primaryActionText={query ? '清空搜索' : ''}
              onPrimaryAction={query ? () => setQuery('') : undefined}
            />
          </div>
        );
      }
      return (
        <div className="va-life__timeline">
          <div className="va-life__order-hint" role="status">
            <V2Tag type="primary" size="small">倒序</V2Tag>
            <span>
              最新事件在上 · 当前展示
              {' '}
              <strong className="tabular-nums">{filtered.length}</strong>
              {' '}
              条
            </span>
          </div>
          <V2Timeline items={timelineItems} mode="left" className="va-life__v2-timeline" />
        </div>
      );
    }

    if (isComingSoon) {
      return <ComingSoonPanel stageLabel={stageLabel} />;
    }

    switch (stage) {
      case 'delivery':
        return <DetailDeliveryRecordsTab rows={rows.delivery} onToast={onToast} />;
      case 'return':
        return <DetailReturnRecordsTab rows={rows.return} onToast={onToast} />;
      case 'replace':
        return <DetailReplaceRecordsTab rows={rows.replace} onToast={onToast} />;
      case 'accident':
        return <DetailAccidentRecordsTab rows={rows.accident} onToast={onToast} />;
      case 'fault':
        return (
          <DetailFaultRecordsTab
            record={record}
            rows={rows.fault}
            onViewFaultDetail={(_vehicle, row) => {
              onToast(`即将跳转至故障管理详情页（原型演示）：${row.faultNo || '—'}`);
            }}
            onEditFaultRecord={(vehicle, row) => {
              onToast(`编辑故障记录（原型演示）：${vehicle.plateNo} · ${row.faultNo || '—'}`);
            }}
          />
        );
      case 'violation':
        return <DetailViolationRecordsTab rows={rows.violation} onToast={onToast} />;
      case 'movement':
        return <DetailMovementRecordsTab rows={rows.movement} onToast={onToast} />;
      case 'transfer':
        return <DetailTransferRecordsTab rows={rows.transfer} onToast={onToast} />;
      case 'annual':
        return <DetailAnnualReviewRecordsTab rows={rows.annual} onToast={onToast} />;
      case 'insuranceCompulsory':
        return (
          <DetailInsuranceRecordsTab
            record={record}
            insurance={insurance}
            rows={rows.purchases}
            onToast={onToast}
            lockedCategory="交强险"
          />
        );
      case 'insuranceCommercial':
        return (
          <DetailInsuranceRecordsTab
            record={record}
            insurance={insurance}
            rows={rows.purchases}
            onToast={onToast}
            lockedCategory="商业险"
          />
        );
      case 'inbound':
      case 'outbound':
        return <StageEventList stageLabel={stageLabel} events={stageEvents} />;
      default:
        return <ComingSoonPanel stageLabel={stageLabel} />;
    }
  };

  const stageOptions = useMemo(
    () => STAGE_FILTERS.map((item) => {
      const comingSoon = item.id !== 'all' && COMING_SOON_STAGES.has(item.id);
      const count = item.id === 'all' ? allEvents.length : stageCounts[item.id];
      return {
        value: item.id,
        label: comingSoon
          ? `${item.label}（敬请期待）`
          : `${item.label}（${count}）`,
      };
    }),
    [allEvents.length, stageCounts],
  );

  return (
    <div className="va-life" data-annotation-id="va-feat-detail-lifecycle">
      <div className="va-form-card__head va-life__head">
        <div className="va-form-card__title">
          <ClipboardList size={18} aria-hidden />
          <h2 id="va-life-hero-title">车辆全生命周期记录</h2>
        </div>
        <div
          className="va-life__stage-select"
          data-annotation-id="va-lifecycle-stages"
          aria-label="事件名称筛选"
        >
          <span className="va-life__filter-label">事件名称</span>
          <V2FilterSearch className="va-life__event-filter" aria-label="事件名称">
            <V2Select
              searchable
              placeholder="搜索 / 选择事件名称"
              value={stage}
              onChange={(val) => selectStage(val as 'all' | LifecycleStage)}
              options={stageOptions}
            />
          </V2FilterSearch>
        </div>
      </div>

      <section className="va-life__overview" data-annotation-id="va-lifecycle-hero" aria-label="生命周期概览">
        <div className="va-life__stats">
          <div className="va-life__stat is-emphasis">
            <span className="va-life__stat-ico" aria-hidden>
              <Layers size={14} />
            </span>
            <div className="va-life__stat-copy">
              <span className="va-life__stat-label">事件数</span>
              <strong className="tabular-nums">{allEvents.length}</strong>
            </div>
          </div>
          <div className="va-life__stat">
            <span className="va-life__stat-ico" aria-hidden>
              <CalendarRange size={14} />
            </span>
            <div className="va-life__stat-copy">
              <span className="va-life__stat-label">
                时间跨度
                {durationHint ? <em>{durationHint}</em> : null}
              </span>
              <strong className="va-life__stat-span">{spanLabel(allEvents)}</strong>
            </div>
          </div>
        </div>

        <div className="va-life__counts-block">
          <div className="va-life__counts-head">
            <span className="va-life__counts-title">关键事件总数</span>
            <span className="va-life__counts-hint">
              仅高频操作；入库 / 过户 / 销售 / 报废 / 出库见下方时间轴
            </span>
          </div>
          <div className="va-life__counts" aria-label="高频生命周期次数统计">
            {HIGH_FREQ_EVENT_COUNT_META.map((item) => {
              const value = stageCounts[item.stage];
              const active = stage === item.stage && value > 0;
              return (
                <button
                  key={item.stage}
                  type="button"
                  className={`va-life__count is-${item.tone}${value === 0 ? ' is-zero' : ''}${active ? ' is-active' : ''}`}
                  title={item.title}
                  aria-label={`${item.label} ${value} 次，点击跳转${LIFECYCLE_STAGE_META[item.stage].label}阶段`}
                  onClick={() => {
                    selectStage(stage === item.stage ? 'all' : item.stage);
                  }}
                >
                  <span className="va-life__count-top">
                    <span className="va-life__count-ico" aria-hidden>
                      {item.icon}
                    </span>
                    <span className="va-life__count-label">{item.shortLabel}</span>
                  </span>
                  <strong className="tabular-nums">{value}</strong>
                  <span className="va-life__count-unit">次</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {isTimeline ? (
        <div className="va-life__tools" role="toolbar" aria-label="时间轴工具">
          <label className="va-life__search">
            <Search size={14} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索事件 / 操作人"
              aria-label="搜索生命周期事件"
            />
            {query ? (
              <button
                type="button"
                className="va-life__search-clear"
                onClick={() => setQuery('')}
                aria-label="清空搜索"
                title="清空搜索"
              >
                <X size={14} aria-hidden />
              </button>
            ) : null}
          </label>
          {query.trim() ? (
            <button
              type="button"
              className="va-btn va-btn-ghost va-life__reset-btn"
              onClick={() => setQuery('')}
            >
              清除搜索
            </button>
          ) : null}
          <button
            type="button"
            className="va-btn va-btn-secondary va-life__expand-btn"
            onClick={() => {
              setExpandAll((prev) => !prev);
              setExpandedId(null);
            }}
            disabled={!filtered.some((event) => event.details?.length)}
          >
            <ArrowDownUp size={14} aria-hidden />
            {expandAll ? '全部收起' : '全部展开'}
          </button>
        </div>
      ) : null}

      <div className="va-life__body" role="tabpanel" aria-label={stageLabel}>
        {renderStageBody()}
      </div>

      {latest && isTimeline && !hasActiveFilter ? (
        <div className="va-life__current" role="status">
          <CheckCircle2 size={16} aria-hidden />
          <div>
            <strong>轨迹已同步</strong>
            <p>
              最新节点
              {' '}
              {latest.title}
              <span className="tabular-nums"> · {latest.timeLabel}</span>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
