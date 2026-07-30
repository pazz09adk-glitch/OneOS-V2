import React from 'react';
import { OperationActions } from '../../../common/OperationActions';
import '../../../common/vm-operation-actions.css';
import {
  V2Badge,
  V2Empty,
} from '../../../resources/design-system/components/UIComponents';
import { ownerName, TASK_STATUS_META, TASK_TYPE_META } from '../mockData';
import {
  DemoViewerPreset,
  canUrgeTask,
  resolveViewerUserId,
} from '../permissions';
import { TaskStatus, TaskWorkOrder } from '../types';

interface KanbanViewBoardProps {
  tasks: TaskWorkOrder[];
  viewerPreset: DemoViewerPreset;
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

function typeDotClass(tone?: string): string {
  switch (tone) {
    case 'primary':
    case 'info':
      return 'is-primary';
    case 'warning':
    case 'gold':
      return 'is-warning';
    case 'purple':
      return 'is-purple';
    default:
      return 'is-default';
  }
}

/**
 * 看板卡 · 对齐审批中心左卡信息密度：
 * 标题（≤2 行）→ 最多 2 行「标签：值」→ 底栏单号 + 催办
 * 长文案 / 绑车 / 关联单号进详情，不占看板。
 */
export const KanbanViewBoard: React.FC<KanbanViewBoardProps> = ({
  tasks,
  viewerPreset,
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
                <V2Badge status={col.badgeStatus} label={col.title} size="small" />
              </div>
              <span className="v2-two-kanban-col-count">{colTasks.length}</span>
            </div>

            <div className="v2-two-kanban-cards">
              {colTasks.length === 0 ? (
                <V2Empty type="empty" size="small" title="暂无数据" />
              ) : (
                colTasks.map((t) => {
                  const typeMeta = TASK_TYPE_META[t.taskType] || {
                    label: t.taskType,
                    tone: 'default',
                  };
                  const statusMeta = TASK_STATUS_META[t.status];
                  const viewerId = resolveViewerUserId(viewerPreset, t);
                  const allowUrge = canUrgeTask(t, viewerId);

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
                      aria-label={`${t.title}，${t.code}，点击进入详情`}
                    >
                      <div className="v2-two-kanban-card__title-row">
                        <span
                          className={`v2-two-kanban-card__type-dot ${typeDotClass(typeMeta.tone)}`}
                          aria-hidden
                        />
                        <h4 className="v2-two-kanban-card__title" title={t.title}>
                          {t.title}
                        </h4>
                      </div>

                      <div className="v2-two-kanban-card__summary">
                        <div className="v2-two-kanban-card__summary-line">
                          <span className="v2-two-kanban-card__summary-label">类型：</span>
                          <span className="v2-two-kanban-card__summary-value">
                            {typeMeta.label}
                          </span>
                        </div>
                        <div className="v2-two-kanban-card__summary-line">
                          <span className="v2-two-kanban-card__summary-label">执行人：</span>
                          <span className="v2-two-kanban-card__summary-value">
                            {ownerName(t.currentOwnerId)}
                          </span>
                        </div>
                      </div>

                      <div className="v2-two-kanban-card__foot">
                        <span className="v2-two-kanban-card__code" title={t.code}>
                          {t.code}
                        </span>
                        <div
                          className="v2-two-kanban-card__action"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {allowUrge ? (
                            <OperationActions
                              process={{ label: '催办', onClick: () => onUrge(t) }}
                            />
                          ) : (
                            <V2Badge
                              status={statusMeta?.badgeStatus}
                              label={statusMeta?.label}
                              size="small"
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
