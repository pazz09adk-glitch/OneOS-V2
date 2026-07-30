import React, { useEffect, useState } from 'react';
import { OperationActions } from '../../../common/OperationActions';
import '../../../common/vm-operation-actions.css';
import {
  V2Badge,
  V2Empty,
  V2Pagination,
  V2Tag,
} from '../../../resources/design-system/components/UIComponents';
import { ownerName, periodOverdueDays, TASK_STATUS_META, TASK_TYPE_META } from '../mockData';
import {
  DemoViewerPreset,
  canEditTaskContent,
  canUrgeTask,
  formatPeriodEndLabel,
  isPeriodUnlimited,
  resolveViewerUserId,
} from '../permissions';
import { resolveRelatedBiz } from '../relatedBiz';
import { toV2TagType } from '../tagUtils';
import { TaskWorkOrder } from '../types';
import { RelatedBizCodeLink, WorkOrderCodeLink } from './RelatedBizCodeLink';

interface ListViewTableProps {
  tasks: TaskWorkOrder[];
  viewerPreset: DemoViewerPreset;
  onViewDetail: (task: TaskWorkOrder) => void;
  onEdit: (task: TaskWorkOrder) => void;
  onUrge: (task: TaskWorkOrder) => void;
  connected?: boolean;
}

function PeriodCell({ task }: { task: TaskWorkOrder }) {
  if (!task.periodStart && !task.periodEnd && !task.periodUnlimited) {
    return <span className="v2-two-detail-muted">—</span>;
  }

  const endLabel = formatPeriodEndLabel(task.periodEnd, task.periodUnlimited);
  const range =
    task.periodStart && (task.periodEnd || task.periodUnlimited)
      ? `${task.periodStart} ~ ${endLabel}`
      : task.periodStart || endLabel || '—';

  const done = task.status === 'completed' || task.status === 'closed';
  const overdueDays = done
    ? null
    : periodOverdueDays(task.periodEnd, undefined, task.periodUnlimited);

  return (
    <div className={`v2-two-period-stack${overdueDays ? ' is-overdue' : ''}`}>
      <span className="v2-two-period-range">{range}</span>
      {overdueDays != null && (
        <V2Tag type="error" title={`已超过周期结束日 ${overdueDays} 天`}>
          超时 {overdueDays} 天
        </V2Tag>
      )}
                      {isPeriodUnlimited(task) && !overdueDays && (
                        <V2Tag type="primary" title="长期跟进，无固定完成日">
                          不限
                        </V2Tag>
                      )}
    </div>
  );
}

export const ListViewTable: React.FC<ListViewTableProps> = ({
  tasks,
  viewerPreset,
  onViewDetail,
  onEdit,
  onUrge,
  connected = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [tasks]);

  const paginatedTasks = tasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className={`v2-two-table-section ${connected ? 'is-connected' : ''}`}>
      <div className="v2-two-table-wrap">
        {paginatedTasks.length === 0 ? (
          <div className="v2-two-table-empty">
            <V2Empty type="no_search" size="small" title="暂无数据" />
          </div>
        ) : (
          <table className="v2-two-table">
            <thead>
              <tr>
                <th>任务</th>
                <th>工单类型</th>
                <th>关联业务工单</th>
                <th>执行周期</th>
                <th>当前执行人</th>
                <th>归口责任</th>
                <th>状态</th>
                <th style={{ textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.map((row) => {
                const typeMeta = TASK_TYPE_META[row.taskType] || {
                  label: row.taskType,
                  tone: 'default',
                };
                const statusMeta = TASK_STATUS_META[row.status];
                const related = resolveRelatedBiz(row);
                const viewerId = resolveViewerUserId(viewerPreset, row);
                const allowEdit = canEditTaskContent(row, viewerId);
                const allowUrge = canUrgeTask(row, viewerId);

                return (
                  <tr key={row.id}>
                    <td>
                      <div className="v2-two-primary-cell">
                        <span
                          className="v2-two-row-title"
                          title={row.requirement || row.title}
                        >
                          {row.title}
                        </span>
                        <WorkOrderCodeLink
                          code={row.code}
                          onClick={() => onViewDetail(row)}
                        />
                      </div>
                    </td>
                    <td>
                      <V2Tag type={toV2TagType(typeMeta.tone)}>{typeMeta.label}</V2Tag>
                    </td>
                    <td>
                      {related.code ? (
                        <div className="v2-two-related-cell">
                          <span className="v2-two-related-type">{related.typeLabel}</span>
                          <RelatedBizCodeLink code={related.code} />
                        </div>
                      ) : (
                        <span className="v2-two-detail-muted">—</span>
                      )}
                    </td>
                    <td className="v2-two-period-cell">
                      <PeriodCell task={row} />
                    </td>
                    <td>{ownerName(row.currentOwnerId)}</td>
                    <td>{ownerName(row.accountableOwnerId)}</td>
                    <td>
                      <V2Badge status={statusMeta?.badgeStatus} label={statusMeta?.label} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <OperationActions
                        view={{ label: '详情', onClick: () => onViewDetail(row) }}
                        edit={
                          allowEdit
                            ? { label: '编辑', onClick: () => onEdit(row) }
                            : undefined
                        }
                        more={
                          allowUrge
                            ? [
                                {
                                  key: 'urge',
                                  label: '催办',
                                  onClick: () => onUrge(row),
                                },
                              ]
                            : []
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="v2-two-table-footer">
          <V2Pagination
            current={currentPage}
            pageSize={pageSize}
            total={tasks.length}
            onChange={(p, ps) => {
              setCurrentPage(p);
              setPageSize(ps);
            }}
          />
        </div>
      )}
    </div>
  );
};
