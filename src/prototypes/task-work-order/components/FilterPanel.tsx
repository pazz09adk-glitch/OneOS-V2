import React from 'react';
import { RotateCcw, Search } from 'lucide-react';
import {
  V2Button,
  V2FilterMoreButton,
  V2FilterSearch,
  V2Select,
  V2SingleInputDateRangePicker,
  V2StatusTabs,
} from '../../../resources/design-system/components/UIComponents';
import { MOCK_OWNERS, TASK_STATUS_META, TASK_TYPE_META } from '../mockData';
import { getRelatedBizSelectOptions } from '../relatedBiz';
import { RelatedBizType, TaskFilters, TaskStatus, TaskType, ViewTab } from '../types';

interface FilterPanelProps {
  viewTab: ViewTab;
  onViewTabChange: (tab: ViewTab) => void;
  tabCounts: { all: number; published: number; supervise: number };
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  onSearch: () => void;
  onReset: () => void;
  showMoreFilters: boolean;
  onToggleMoreFilters: () => void;
  connected?: boolean;
}

function countActiveMoreFilters(filters: TaskFilters): number {
  let n = 0;
  if (filters.taskType && filters.taskType !== 'all') n += 1;
  if (filters.status && filters.status !== 'all') n += 1;
  if (filters.relatedBizType && filters.relatedBizType !== 'all') n += 1;
  if (filters.ownerId) n += 1;
  if (filters.startDate || filters.endDate) n += 1;
  return n;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  viewTab,
  onViewTabChange,
  tabCounts,
  filters,
  onFilterChange,
  onSearch,
  onReset,
  showMoreFilters,
  onToggleMoreFilters,
  connected = false,
}) => {
  const typeOptions = [
    { value: 'all', label: '全部类型' },
    ...Object.entries(TASK_TYPE_META).map(([k, v]) => ({ value: k, label: v.label })),
  ];

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    ...Object.entries(TASK_STATUS_META).map(([k, v]) => ({ value: k, label: v.label })),
  ];

  const relatedTypeOptions = [
    { value: 'all', label: '全部业务类型' },
    ...getRelatedBizSelectOptions(false),
  ];

  const ownerOptions = [
    { value: '', label: '全部执行人' },
    ...MOCK_OWNERS.map((o) => ({ value: o.id, label: `${o.name} (${o.dept})` })),
  ];

  const activeCount = countActiveMoreFilters(filters);

  return (
    <div
      className={[
        'v2-two-filter-panel',
        connected ? 'is-connected' : '',
        showMoreFilters ? 'is-expanded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="v2-two-ledger-toolbar">
        <V2StatusTabs
          value={viewTab}
          onChange={onViewTabChange}
          options={[
            { key: 'all', label: '全部工单', count: tabCounts.all },
            { key: 'published', label: '我发布的', count: tabCounts.published },
            { key: 'supervise', label: '我督办的', count: tabCounts.supervise },
          ]}
        />

        <div className="v2-two-ledger-actions v2-filter-toolbar-tools">
          <V2FilterSearch>
            <input
              type="text"
              className="v2-two-toolbar-search"
              placeholder="工单号 / 任务名称 / 关联单号"
              value={filters.keyword}
              onChange={(e) => onFilterChange({ ...filters, keyword: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSearch();
              }}
              aria-label="关键词搜索"
            />
          </V2FilterSearch>
          <V2FilterMoreButton
            open={showMoreFilters}
            activeCount={activeCount}
            onClick={onToggleMoreFilters}
          />
        </div>
      </div>

      {showMoreFilters && (
        <div className="v2-two-more-filters">
          <div className="v2-two-filter-grid">
            <div className="v2-two-filter-field">
              <label className="v2-two-filter-label">任务类型</label>
              <V2Select
                value={filters.taskType || 'all'}
                onChange={(val) =>
                  onFilterChange({ ...filters, taskType: val as TaskType | 'all' })
                }
                options={typeOptions}
              />
            </div>

            <div className="v2-two-filter-field">
              <label className="v2-two-filter-label">任务状态</label>
              <V2Select
                value={filters.status || 'all'}
                onChange={(val) =>
                  onFilterChange({ ...filters, status: val as TaskStatus | 'all' })
                }
                options={statusOptions}
              />
            </div>

            <div className="v2-two-filter-field">
              <label className="v2-two-filter-label">关联业务</label>
              <V2Select
                searchable
                value={filters.relatedBizType || 'all'}
                onChange={(val) =>
                  onFilterChange({
                    ...filters,
                    relatedBizType: val as RelatedBizType | 'all',
                  })
                }
                options={relatedTypeOptions}
              />
            </div>

            <div className="v2-two-filter-field">
              <label className="v2-two-filter-label">当前执行人</label>
              <V2Select
                value={filters.ownerId || ''}
                onChange={(val) => onFilterChange({ ...filters, ownerId: val as string })}
                options={ownerOptions}
              />
            </div>

            <div className="v2-two-filter-field">
              <label className="v2-two-filter-label">创建日期区间</label>
              <V2SingleInputDateRangePicker
                startDate={filters.startDate}
                endDate={filters.endDate}
                onChange={(start, end) =>
                  onFilterChange({ ...filters, startDate: start, endDate: end })
                }
              />
            </div>
          </div>

          <div className="v2-two-filter-actions">
            <V2Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw size={14} />}
              onClick={onReset}
            >
              重置
            </V2Button>
            <V2Button
              variant="primary"
              size="sm"
              icon={<Search size={14} />}
              onClick={onSearch}
            >
              查询
            </V2Button>
          </div>
        </div>
      )}
    </div>
  );
};
