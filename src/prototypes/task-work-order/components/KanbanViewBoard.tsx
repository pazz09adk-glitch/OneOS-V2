import React from 'react';
import { BellRing } from 'lucide-react';
import {
  V2Badge,
  V2Button,
  V2Empty,
  V2Tag,
} from '../../../resources/design-system/components/UIComponents';
import { ownerName, TASK_STATUS_META, TASK_TYPE_META, vehicleSummary } from '../mockData';
import { resolveRelatedBiz } from '../relatedBiz';
import { toV2TagType } from '../tagUtils';
import { TaskStatus, TaskWorkOrder } from '../types';
import { RelatedBizCodeLink } from './RelatedBizCodeLink';

interface KanbanViewBoardProps {
  tasks: TaskWorkOrder[];
  onViewDetail: (task: TaskWorkOrder) => void;
  onUrge: (task: TaskWorkOrder) => void;
}

const KANBAN_COLUMNS: {
  id: string;
  title: string;
  statuses: TaskStatus[];
  badgeStatus: 'default' | 'processing' | 'error' | 'success';
}[] = [
  { id: 'pending', title: '待处理', statuses: ['pending'], badgeStatus: 'default' },
  { id: 'in_progress', title: '进行中', statuses: ['in_progress'], badgeStatus: 'processing' },
  { id: 'overdue', title: '已超时', statuses: ['overdue'], badgeStatus: 'error' },
  {
    id: 'done',
    title: '已办结 / 已关闭',
    statuses: ['completed', 'closed'],
    badgeStatus: 'success',
  },
];

export const KanbanViewBoard: React.FC<KanbanViewBoardProps> = ({
  tasks,
  onViewDetail,
  onUrge,
}) => {
  return (
    <div className="v2-two-kanban-board">
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => col.statuses.includes(t.status));
        return (
          <div key={col.id} className="v2-two-kanban-col">
            <div className="v2-two-kanban-col-header">
              <div className="v2-two-kanban-col-title">
                <V2Badge status={col.badgeStatus} size="small" />
                <span>{col.title}</span>
              </div>
              <span className="v2-two-kanban-col-count">{colTasks.length}</span>
            </div>

            <div className="v2-two-kanban-cards">
              {colTasks.length === 0 ? (
                <V2Empty type="empty" size="small" title="暂无工单" />
              ) : (
                colTasks.map((t) => {
                  const typeMeta = TASK_TYPE_META[t.taskType] || {
                    label: t.taskType,
                    tone: 'default',
                  };
                  const statusMeta = TASK_STATUS_META[t.status];
                  const canUrge = t.status !== 'completed' && t.status !== 'closed';
                  const related = resolveRelatedBiz(t);

                  return (
                    <div
                      key={t.id}
                      className="v2-two-kanban-card"
                      onClick={() => onViewDetail(t)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') onViewDetail(t);
                      }}
                    >
                      <div className="v2-two-kanban-card-top">
                        <span className="v2-two-kanban-card-code">{t.code}</span>
                        <V2Tag type={toV2TagType(typeMeta.tone)}>{typeMeta.label}</V2Tag>
                      </div>

                      <div className="v2-two-kanban-card-title">{t.title}</div>
                      <div className="v2-two-kanban-card-req">{t.requirement}</div>

                      {related.code && (
                        <div style={{ marginBottom: 6 }} onClick={(e) => e.stopPropagation()}>
                          <V2Tag type="purple">{related.typeLabel}</V2Tag>
                          <span style={{ marginLeft: 6 }}>
                            <RelatedBizCodeLink
                              code={related.code}
                              compact
                              onClick={() => onViewDetail(t)}
                            />
                          </span>
                        </div>
                      )}

                      <div className="v2-two-detail-muted" style={{ marginBottom: 8, fontSize: 12 }}>
                        车辆：{vehicleSummary(t.vehicleIds)}
                      </div>

                      <div className="v2-two-kanban-card-meta">
                        <span>执行人: {ownerName(t.currentOwnerId)}</span>
                        <div onClick={(e) => e.stopPropagation()}>
                          {canUrge ? (
                            <V2Button
                              variant="link"
                              size="sm"
                              icon={<BellRing size={12} />}
                              onClick={() => onUrge(t)}
                            >
                              催办
                            </V2Button>
                          ) : (
                            <V2Badge
                              status={statusMeta?.badgeStatus}
                              label={statusMeta?.label}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
