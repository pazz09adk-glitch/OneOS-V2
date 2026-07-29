import React from 'react';
import { ClipboardList, Clock, AlertTriangle, Truck } from 'lucide-react';
import { CURRENT_USER } from '../mockData';
import { TaskWorkOrder, ViewTab } from '../types';

interface BentoKpiGridProps {
  tasks: TaskWorkOrder[];
  viewTab: ViewTab;
  currentKpiFilter: string | null;
  onKpiSelect: (key: string | null) => void;
}

export const BentoKpiGrid: React.FC<BentoKpiGridProps> = ({
  tasks,
  viewTab,
  currentKpiFilter,
  onKpiSelect,
}) => {
  const filteredByTab = tasks.filter((t) => {
    if (viewTab === 'published' && t.initiatorId !== CURRENT_USER.id) return false;
    if (viewTab === 'supervise' && t.accountableOwnerId !== CURRENT_USER.id) return false;
    return true;
  });

  const totalCount = filteredByTab.length;
  const pendingOrProgressCount = filteredByTab.filter(
    (t) => t.status === 'pending' || t.status === 'in_progress'
  ).length;
  const overdueCount = filteredByTab.filter((t) => t.status === 'overdue').length;
  const mileageCount = filteredByTab.filter((t) => t.taskType === 'mileage').length;

  const cards = [
    {
      key: 'all',
      title: '全部工单',
      count: totalCount,
      desc: '当前视角下分配的全部任务工单',
      tone: 'tone-primary' as const,
      Icon: ClipboardList,
    },
    {
      key: 'active',
      title: '处理中 / 待办',
      count: pendingOrProgressCount,
      desc: '正在执行或等待响应的任务',
      tone: 'tone-info' as const,
      Icon: Clock,
    },
    {
      key: 'overdue',
      title: '已超时 / 警示',
      count: overdueCount,
      desc: '超期未反馈，需重点督办催办',
      tone: 'tone-danger' as const,
      Icon: AlertTriangle,
    },
    {
      key: 'mileage',
      title: '里程履约类',
      count: mileageCount,
      desc: '规则下发至车辆资产 · 里程任务',
      tone: 'tone-warning' as const,
      Icon: Truck,
    },
  ];

  return (
    <div className="v2-two-kpi-grid">
      {cards.map((card) => {
        const isActive = currentKpiFilter === card.key;
        const IconComponent = card.Icon;
        return (
          <button
            key={card.key}
            type="button"
            className={`v2-two-kpi-card ${isActive ? 'active' : ''}`}
            onClick={() => onKpiSelect(isActive ? null : card.key)}
          >
            <div className="v2-two-kpi-top">
              <span className="v2-two-kpi-label">{card.title}</span>
              <span className={`v2-two-kpi-icon ${card.tone}`}>
                <IconComponent size={16} />
              </span>
            </div>
            <div className="v2-two-kpi-val">{card.count}</div>
            <div className="v2-two-kpi-desc">{card.desc}</div>
          </button>
        );
      })}
    </div>
  );
};
