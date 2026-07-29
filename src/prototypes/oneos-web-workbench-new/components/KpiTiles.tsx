import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  X,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import type { KpiTile, RoleId } from '../types';
import { MOCK_KPI_TILES } from '../mockData';

export interface KpiTilesProps {
  currentRoleId: RoleId;
  activeRoleIds: RoleId[];
}

type ModuleGroup = {
  module: string;
  tiles: KpiTile[];
  urgentCount: number;
};

export const KpiTiles: React.FC<KpiTilesProps> = ({ activeRoleIds }) => {
  const [activeTile, setActiveTile] = useState<KpiTile | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const roleTiles = useMemo(
    () => MOCK_KPI_TILES.filter((tile) => tile.roleIds.some((r) => activeRoleIds.includes(r))),
    [activeRoleIds],
  );

  const groups = useMemo(() => {
    const map = new Map<string, KpiTile[]>();
    roleTiles.forEach((tile) => {
      const list = map.get(tile.module) || [];
      list.push(tile);
      map.set(tile.module, list);
    });
    const result: ModuleGroup[] = Array.from(map.entries()).map(([module, tiles]) => ({
      module,
      tiles: tiles.slice().sort((a, b) => {
        const rank = { urgent: 0, warning: 1, info: 2 };
        return rank[a.level] - rank[b.level] || b.count - a.count;
      }),
      urgentCount: tiles.filter((t) => t.level === 'urgent').length,
    }));
    result.sort((a, b) => b.urgentCount - a.urgentCount || b.tiles.length - a.tiles.length);
    return result;
  }, [roleTiles]);

  const totalUrgent = roleTiles.filter((t) => t.level === 'urgent').length;

  const isCollapsed = (module: string, urgentCount: number) => {
    if (collapsed[module] !== undefined) return collapsed[module];
    // 默认：含紧急项的分组展开，其余收起
    return urgentCount === 0;
  };

  return (
    <>
      <section className="v2-wb-alert-panel" data-annotation-id="wb-kpi-grid" aria-label="预警中心">
        <div className="v2-wb-alert-panel__head">
          <div className="v2-wb-alert-panel__title">
            <AlertTriangle size={16} style={{ color: 'var(--ln-warning)' }} />
            <span>预警中心</span>
            <span className="v2-wb-alert-panel__meta">
              {roleTiles.length} 项指标
              {totalUrgent > 0 ? ` · ${totalUrgent} 项紧急` : ''}
            </span>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="v2-wb-todo-empty">当前角色暂无预警指标</div>
        ) : (
          <div className="v2-wb-alert-groups">
            {groups.map((group) => {
              const folded = isCollapsed(group.module, group.urgentCount);
              return (
                <div key={group.module} className="v2-wb-alert-group">
                  <button
                    type="button"
                    className="v2-wb-alert-group__head"
                    aria-expanded={!folded}
                    onClick={() =>
                      setCollapsed((prev) => ({
                        ...prev,
                        [group.module]: !folded,
                      }))
                    }
                  >
                    <span className="v2-wb-alert-group__name">{group.module}</span>
                    <span className="v2-wb-alert-group__count">
                      {group.tiles.length} 项
                      {group.urgentCount > 0 ? ` · ${group.urgentCount} 紧急` : ''}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`v2-wb-alert-group__chev${folded ? '' : ' is-open'}`}
                    />
                  </button>

                  {!folded && (
                    <ul className="v2-wb-alert-list">
                      {group.tiles.map((tile) => (
                        <li key={tile.id}>
                          <button
                            type="button"
                            className={`v2-wb-alert-row is-${tile.level}`}
                            onClick={() => setActiveTile(tile)}
                          >
                            <span className={`v2-wb-alert-row__dot is-${tile.level}`} aria-hidden />
                            <span className="v2-wb-alert-row__title">
                              {tile.title}
                              <button
                                type="button"
                                className="v2-wb-alert-row__help"
                                title={tile.ruleTip}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`【预警规则说明】\n${tile.ruleTip}`);
                                }}
                                aria-label={`${tile.title}规则说明`}
                              >
                                <HelpCircle size={12} />
                              </button>
                            </span>
                            <span className={`v2-wb-alert-row__num is-${tile.level}`}>
                              {tile.count}
                              <small>{tile.unit}</small>
                            </span>
                            <ArrowRight size={12} className="v2-wb-alert-row__arrow" aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {activeTile && (
        <div className="v2-wb-overlay" onClick={() => setActiveTile(null)} role="presentation">
          <div
            className="v2-wb-modal v2-wb-modal--wide"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="v2-wb-modal__head">
              <div className="v2-wb-modal__title">
                {activeTile.title} — 关联清单 ({activeTile.count})
              </div>
              <button
                type="button"
                className="v2-wb-icon-btn"
                onClick={() => setActiveTile(null)}
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>

            <div className="v2-wb-modal__hint">
              <strong>计算规则：</strong>
              {activeTile.ruleTip}
            </div>

            <div className="v2-wb-kpi-detail-list">
              {(activeTile.details || []).map((detail) => (
                <div key={detail.id} className="v2-wb-kpi-detail-item">
                  <div>
                    <div className="v2-wb-kpi-detail-item__title">{detail.title}</div>
                    <div className="v2-wb-kpi-detail-item__sub">{detail.subTitle}</div>
                  </div>
                  {detail.href && (
                    <a href={detail.href} className="v2-wb-btn v2-wb-btn--primary">
                      <span>去处理</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
              {(activeTile.details || []).length === 0 && (
                <div className="v2-wb-todo-empty">暂无明细样例</div>
              )}
            </div>

            <div className="v2-wb-modal__foot">
              <button
                type="button"
                className="v2-wb-btn v2-wb-btn--secondary"
                onClick={() => setActiveTile(null)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
