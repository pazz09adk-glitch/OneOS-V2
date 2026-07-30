import React, { useMemo, useState } from 'react';
import { PieChart, X } from 'lucide-react';
import type { VehicleFilters, VehicleRecord } from '../types';
import { EMPTY_FILTERS } from '../types';
import {
  FLEET_MIX_LEGEND,
  buildOnLeaseFleetSummary,
  collapseFleetSummary,
  fleetMixTotal,
  toFleetModelKey,
  type FleetStatusMix,
  type OnLeaseFleetBucket,
} from '../utils/onLeaseFleet';
import { V2Button } from '../../../resources/design-system/components/UIComponents';
import { FleetBrandIcon } from './FleetBrandLogos';

/** 主区 TOP3 热门车型；第 4 卡为 TOP4 及以后归并的「其他」 */
const FLEET_TOP_N = 3;
const FLEET_GRID_SLOTS = FLEET_TOP_N + 1;

function FleetMixBar({ mix }: { mix: FleetStatusMix }) {
  const total = fleetMixTotal(mix);
  if (total <= 0) {
    return <div className="va-fleet-card__bar va-fleet-card__bar--empty" aria-hidden />;
  }

  const leasePct = (mix.lease / total) * 100;
  const logisticsPct = (mix.logistics / total) * 100;
  const stockPct = (mix.stock / total) * 100;

  return (
    <div
      className="va-fleet-card__bar va-fleet-card__bar--mix"
      role="img"
      aria-label={`租赁 ${mix.lease} 辆，物流 ${mix.logistics} 辆，库存 ${mix.stock} 辆`}
    >
      {mix.lease > 0 ? (
        <span className="va-fleet-card__seg is-lease" style={{ width: `${leasePct}%` }} />
      ) : null}
      {mix.logistics > 0 ? (
        <span className="va-fleet-card__seg is-logistics" style={{ width: `${logisticsPct}%` }} />
      ) : null}
      {mix.stock > 0 ? (
        <span className="va-fleet-card__seg is-stock" style={{ width: `${stockPct}%` }} />
      ) : null}
    </div>
  );
}

function FleetMixLegend() {
  return (
    <ul className="va-fleet-legend" aria-label="构成图例">
      {FLEET_MIX_LEGEND.map((item) => (
        <li key={item.key} className="va-fleet-legend__item">
          <span className={`va-fleet-legend__swatch ${item.className}`} aria-hidden />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * 点 KPI 卡 → 刷列表。
 * TOP3：写入品牌 / 型号（可在更多筛选中看到）；
 * 「其他」：按 TOP4+ 品牌型号键过滤，不往筛选表单塞品牌 / 型号多选。
 */
export function buildFiltersFromFleetCard(item: OnLeaseFleetBucket): VehicleFilters {
  if (item.key === '__other__') {
    const fleetModelKeys = [...new Set(item.vehicles.map((vehicle) => toFleetModelKey(vehicle)))]
      .sort((a, b) => a.localeCompare(b, 'zh-CN'));
    return {
      ...EMPTY_FILTERS,
      fleetCardKey: '__other__',
      fleetModelKeys,
    };
  }

  let brand: string[] = [];
  let model: string[] = [];
  if (item.brand && item.brand !== '未填品牌') brand = [item.brand];
  if (item.model && item.model !== '未填型号') model = [item.model];

  return {
    ...EMPTY_FILTERS,
    fleetCardKey: item.key,
    brand,
    model,
  };
}

function isFleetCardActive(item: OnLeaseFleetBucket, filters: VehicleFilters): boolean {
  return filters.fleetCardKey === item.key;
}

/** 主区 TOP3 +「其他」：卡内构成保留色点 + 文案 + 数字，便于一眼读懂 */
function FleetModelCard({
  item,
  totalOnLease,
  active,
  onSelect,
}: {
  item: OnLeaseFleetBucket;
  totalOnLease: number;
  active: boolean;
  onSelect: (item: OnLeaseFleetBucket) => void;
}) {
  const sharePct = totalOnLease
    ? ((item.count / totalOnLease) * 100).toFixed(2)
    : '0.00';
  const isOther = item.key === '__other__';
  const brandModelLabel = isOther
    ? `${item.brand}（${item.model}）`
    : `${item.brand}·${item.model}`;
  const clickHint = isOther
    ? '点击后列表显示 TOP4 及以后全部品牌型号车辆'
    : '点击后列表仅显示该品牌型号';

  return (
    <button
      type="button"
      className={`va-fleet-card${isOther ? ' is-other' : ''}${active ? ' is-active' : ''}`}
      aria-pressed={active}
      onClick={() => onSelect(item)}
      aria-label={`${brandModelLabel}，在租 ${item.count} 辆，占在租 ${sharePct}%；租赁 ${item.mix.lease}，物流 ${item.mix.logistics}，库存 ${item.mix.stock}；${clickHint}`}
    >
      <div className="va-fleet-card__top">
        <span className="va-fleet-card__label" title={brandModelLabel}>{brandModelLabel}</span>
        <FleetBrandIcon brand={item.brand} isOther={isOther} size={18} quiet />
      </div>
      <div className="va-fleet-card__body">
        <div className="va-fleet-card__value-row">
          <span className="va-fleet-card__value ln-kpi__value ln-kpi-tone-normal tabular-nums">{item.count}</span>
          <span className="va-fleet-card__aux">辆在租</span>
          <span className="va-fleet-card__aux va-fleet-card__aux--muted tabular-nums">
            占在租 {sharePct}%
          </span>
        </div>
        <FleetMixBar mix={item.mix} />
        <div className="va-fleet-card__mix-meta tabular-nums">
          {FLEET_MIX_LEGEND.map((leg) => (
            <span key={leg.key} className={`va-mix-item ${leg.className}`}>
              <span className={`va-mix-dot ${leg.className}`} aria-hidden />
              <span className="va-mix-label">{leg.label}</span>
              <span className="va-mix-num">{item.mix[leg.key]}</span>
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

/** 「查看全部」：排行表，避免多卡彩图标堆叠花眼 */
function FleetOverviewRow({
  rank,
  item,
  totalOnLease,
  active,
  onSelect,
}: {
  rank: number;
  item: OnLeaseFleetBucket;
  totalOnLease: number;
  active: boolean;
  onSelect: (item: OnLeaseFleetBucket) => void;
}) {
  const sharePct = totalOnLease
    ? ((item.count / totalOnLease) * 100).toFixed(2)
    : '0.00';
  const brandModelLabel = `${item.brand}·${item.model}`;

  return (
    <button
      type="button"
      className={`va-fleet-row${active ? ' is-active' : ''}`}
      aria-pressed={active}
      onClick={() => onSelect(item)}
      aria-label={`${brandModelLabel}，在租 ${item.count} 辆，占在租 ${sharePct}%；租赁 ${item.mix.lease}，物流 ${item.mix.logistics}，库存 ${item.mix.stock}；点击后列表仅显示该品牌型号`}
    >
      <span className="va-fleet-row__rank tabular-nums" aria-hidden>{rank}</span>
      <span className="va-fleet-row__name" title={brandModelLabel}>{brandModelLabel}</span>
      <span className="va-fleet-row__count tabular-nums">
        <strong>{item.count}</strong>
        <span className="va-fleet-row__unit">在租</span>
      </span>
      <span className="va-fleet-row__share tabular-nums">{sharePct}%</span>
      <span className="va-fleet-row__bar">
        <FleetMixBar mix={item.mix} />
      </span>
      <span className="va-fleet-row__mix tabular-nums" aria-hidden>
        <span className="is-lease">{item.mix.lease}</span>
        <span className="va-fleet-row__sep">/</span>
        <span className="is-logistics">{item.mix.logistics}</span>
        <span className="va-fleet-row__sep">/</span>
        <span className="is-stock">{item.mix.stock}</span>
      </span>
    </button>
  );
}

function FleetOverviewModal({
  open,
  onClose,
  summary,
  activeFilters,
  onSelectCard,
}: {
  open: boolean;
  onClose: () => void;
  summary: OnLeaseFleetBucket[];
  activeFilters: VehicleFilters;
  onSelectCard: (item: OnLeaseFleetBucket) => void;
}) {
  if (!open) return null;

  const totalOnLease = summary.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="va-modal-mask" role="presentation" onClick={onClose}>
      <div
        className="va-modal va-fleet-overview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="va-fleet-overview-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="va-modal-header">
          <div className="va-fleet-share__title-row">
            <span className="va-fleet-share__icon-wrap" aria-hidden>
              <PieChart size={18} className="va-fleet-share__icon" strokeWidth={2} />
            </span>
            <h2 id="va-fleet-overview-title" className="va-fleet-share__title">在租车型占比</h2>
            <span className="va-fleet-share__badge tabular-nums">{totalOnLease} 辆在租</span>
          </div>
          <button type="button" className="va-modal-close" onClick={onClose} aria-label="关闭">
            <X size={18} aria-hidden />
          </button>
        </header>
        <div className="va-fleet-overview-body">
          <div className="va-fleet-overview-toolbar">
            <FleetMixLegend />
          </div>
          {summary.length ? (
            <div className="va-fleet-rank" role="list">
              <div className="va-fleet-rank__head" aria-hidden>
                <span className="va-fleet-row__rank">#</span>
                <span className="va-fleet-row__name">品牌型号</span>
                <span className="va-fleet-row__count">在租</span>
                <span className="va-fleet-row__share">占在租</span>
                <span className="va-fleet-row__bar">构成</span>
                <span className="va-fleet-row__mix">租/物/库</span>
              </div>
              {summary.map((item, index) => (
                <FleetOverviewRow
                  key={item.key}
                  rank={index + 1}
                  item={item}
                  totalOnLease={totalOnLease}
                  active={isFleetCardActive(item, activeFilters)}
                  onSelect={onSelectCard}
                />
              ))}
            </div>
          ) : (
            <div className="va-fleet-empty">暂无在租车辆</div>
          )}
        </div>
        <footer className="va-modal-footer">
          <V2Button variant="primary" size="md" onClick={onClose}>关闭</V2Button>
        </footer>
      </div>
    </div>
  );
}

export interface OnLeaseFleetShareProps {
  records: VehicleRecord[];
  activeFilters: VehicleFilters;
  onFilterByCard: (next: VehicleFilters) => void;
}

export function OnLeaseFleetShare({
  records,
  activeFilters,
  onFilterByCard,
}: OnLeaseFleetShareProps) {
  const [overviewOpen, setOverviewOpen] = useState(false);

  const fullSummary = useMemo(
    () => buildOnLeaseFleetSummary(records, '全部'),
    [records],
  );
  /** TOP3 + 第 4 卡「其他」（TOP4 及以后品牌型号合计） */
  const gridSummary = useMemo(
    () => collapseFleetSummary(fullSummary, FLEET_GRID_SLOTS, records),
    [fullSummary, records],
  );
  const totalOnLease = useMemo(
    () => fullSummary.reduce((sum, item) => sum + item.count, 0),
    [fullSummary],
  );
  const hasMore = fullSummary.length > FLEET_TOP_N;

  /** 点击 → 列表只保留该卡品牌 / 型号；再点同一卡清除 */
  const selectCard = (item: OnLeaseFleetBucket) => {
    if (isFleetCardActive(item, activeFilters)) {
      onFilterByCard(EMPTY_FILTERS);
    } else {
      onFilterByCard(buildFiltersFromFleetCard(item));
    }
    setOverviewOpen(false);
  };

  if (totalOnLease <= 0) return null;

  return (
    <>
      <section
        className="va-fleet-share"
        aria-label="在租车型占比"
        data-annotation-id="va-feat-list-fleet-share"
      >
        <div className="va-fleet-share__head">
          <div className="va-fleet-share__title-row">
            <span className="va-fleet-share__icon-wrap" aria-hidden>
              <PieChart size={18} className="va-fleet-share__icon" strokeWidth={2} />
            </span>
            <h3 className="va-fleet-share__title">在租车型占比</h3>
            <span className="va-fleet-share__badge tabular-nums">
              {totalOnLease} 辆在租
            </span>
          </div>
          <div className="va-fleet-share__head-actions">
            <FleetMixLegend />
            {hasMore ? (
              <V2Button
                variant="secondary"
                size="md"
                className="va-fleet-share__all"
                onClick={() => setOverviewOpen(true)}
              >
                查看全部车型
              </V2Button>
            ) : null}
          </div>
        </div>

        {gridSummary.length ? (
          <div
            className="va-fleet-grid"
            role="list"
            style={{ ['--va-fleet-cols' as string]: String(gridSummary.length) }}
          >
            {gridSummary.map((item) => (
              <FleetModelCard
                key={item.key}
                item={item}
                totalOnLease={totalOnLease}
                active={isFleetCardActive(item, activeFilters)}
                onSelect={selectCard}
              />
            ))}
          </div>
        ) : (
          <div className="va-fleet-empty">暂无在租车辆</div>
        )}
      </section>

      <FleetOverviewModal
        open={overviewOpen}
        onClose={() => setOverviewOpen(false)}
        summary={fullSummary}
        activeFilters={activeFilters}
        onSelectCard={selectCard}
      />
    </>
  );
}
