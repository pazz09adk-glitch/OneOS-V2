import React, { useMemo } from 'react';
import type { VehicleRecord } from '../types';
import {
  displayText,
  formatMileage,
  formatOperateCity,
  isNonOperating,
  isStockOperateStatus,
  resolveOperateStatus,
} from '../utils/vehicle';

/** 4 阶段 Pipeline：色点对齐租赁合同看板语义色 */
const COLUMNS: Array<{
  id: string;
  title: string;
  tone: 'neutral' | 'success' | 'warning' | 'danger';
  match: (r: VehicleRecord) => boolean;
}> = [
  {
    id: 'stock',
    title: '库存',
    tone: 'neutral',
    match: (r) => isStockOperateStatus(r.operateStatus) && !isNonOperating(r),
  },
  {
    id: 'active',
    title: '履约中（租赁/物流）',
    tone: 'success',
    match: (r) => !isNonOperating(r) && (r.operateStatus === '租赁' || r.operateStatus === '物流'),
  },
  {
    id: 'non',
    title: '非运营',
    tone: 'warning',
    match: (r) => isNonOperating(r),
  },
  {
    id: 'exit',
    title: '退出/归档',
    tone: 'danger',
    match: (r) => !isNonOperating(r) && r.operateStatus === '退出运营',
  },
];

export function KanbanView({
  records,
  onOpen,
}: {
  records: VehicleRecord[];
  onOpen: (r: VehicleRecord) => void;
}) {
  const groups = useMemo(
    () => COLUMNS.map((col) => ({
      ...col,
      items: records.filter(col.match).slice(0, 40),
      total: records.filter(col.match).length,
    })),
    [records],
  );

  return (
    <section className="va-kanban" aria-label="车辆生命周期看板">
      {groups.map((col) => (
        <div key={col.id} className={`va-kanban-col is-${col.tone}`}>
          <div className="va-kanban-head">
            <span className="va-kanban-head__title">
              <span className={`va-kanban-dot is-${col.tone}`} aria-hidden />
              {col.title}
            </span>
            <span className="va-kanban-count tabular-nums">{col.total}</span>
          </div>
          <div className="va-kanban-body">
            {col.items.length === 0 ? (
              <div className="va-kanban-empty">暂无车辆</div>
            ) : (
              col.items.map((r) => {
                const brandModel = `${displayText(r.brand)}·${displayText(r.model)}`;
                const statusLabel = resolveOperateStatus(r);
                return (
                  <button
                    key={r.id}
                    type="button"
                    className="va-kanban-card"
                    onClick={() => onOpen(r)}
                    aria-label={`${r.plateNo}，${brandModel}，${statusLabel}，查看详情`}
                  >
                    <div className="va-kanban-card__plate tabular-nums">{r.plateNo}</div>
                    <div className="va-kanban-card__meta" title={brandModel}>{brandModel}</div>
                    <div className="va-kanban-card__meta">{formatOperateCity(r.location)}</div>
                    <div className="va-kanban-card__meta tabular-nums">{formatMileage(r.mileage)}</div>
                    <div className="va-kanban-card__tags">
                      <span className="va-kanban-tag">{statusLabel}</span>
                      {r.insuranceStatus === '异常' ? (
                        <span className="va-kanban-tag is-err">保险异常</span>
                      ) : null}
                    </div>
                    <span className="va-kanban-card__action">查看详情 →</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

export function SplitView({
  records,
  selectedId,
  onSelect,
  detail,
}: {
  records: VehicleRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
  detail: React.ReactNode;
}) {
  return (
    <section className="va-split" aria-label="主从浏览">
      <div className="va-split-list">
        {records.slice(0, 80).map((r) => (
          <button
            key={r.id}
            type="button"
            className={`va-split-item ${selectedId === r.id ? 'active' : ''}`}
            onClick={() => onSelect(r.id)}
          >
            <div className="va-plate-no">{r.plateNo}</div>
            <div className="va-plate-meta">{displayText(r.brand)}·{resolveOperateStatus(r)}</div>
            <div className="va-plate-meta">{formatOperateCity(r.location)}</div>
          </button>
        ))}
      </div>
      <div className="va-split-detail">{detail}</div>
    </section>
  );
}
