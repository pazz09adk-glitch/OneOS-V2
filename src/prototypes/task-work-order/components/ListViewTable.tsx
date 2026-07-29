import React, { useEffect, useState } from 'react';
import { OperationActions } from '../../../common/OperationActions';
import '../../../common/vm-operation-actions.css';
import {
  V2Badge,
  V2Empty,
  V2Pagination,
  V2Tag,
} from '../../../resources/design-system/components/UIComponents';
import { ownerName, TASK_STATUS_META, TASK_TYPE_META } from '../mockData';
import { resolveRelatedBiz } from '../relatedBiz';
import { toV2TagType } from '../tagUtils';
import { TaskWorkOrder } from '../types';
import { BoundVehiclesCell } from './BoundVehiclesCell';
import { RelatedBizCodeLink, WorkOrderCodeLink } from './RelatedBizCodeLink';

interface ListViewTableProps {
  tasks: TaskWorkOrder[];
  onViewDetail: (task: TaskWorkOrder) => void;
  onUrge: (task: TaskWorkOrder) => void;
  connected?: boolean;
}

export const ListViewTable: React.FC<ListViewTableProps> = ({
  tasks,
  onViewDetail,
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
            <V2Empty type="no_search" size="small" title="暂无匹配的任务工单" />
          </div>
        ) : (
          <table className="v2-two-table">
            <thead>
              <tr>
                <th>工单编号</th>
                <th>工单类型</th>
                <th>任务名称</th>
                <th>关联业务工单</th>
                <th>绑定车辆</th>
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
                const canUrge = row.status !== 'completed' && row.status !== 'closed';
                const related = resolveRelatedBiz(row);

                return (
                  <tr key={row.id}>
                    <td>
                      <WorkOrderCodeLink
                        code={row.code}
                        onClick={() => onViewDetail(row)}
                      />
                    </td>
                    <td>
                      <V2Tag type={toV2TagType(typeMeta.tone)}>{typeMeta.label}</V2Tag>
                    </td>
                    <td className="v2-two-ellipsis-cell" title={row.requirement}>
                      <span className="v2-two-row-title">{row.title}</span>
                    </td>
                    <td>
                      {related.code ? (
                        <div className="v2-two-related-cell">
                          <V2Tag type="purple">{related.typeLabel}</V2Tag>
                          <RelatedBizCodeLink
                            code={related.code}
                            typeLabel={related.typeLabel}
                            onClick={() => onViewDetail(row)}
                          />
                        </div>
                      ) : (
                        <span className="v2-two-detail-muted">—</span>
                      )}
                    </td>
                    <td>
                      <BoundVehiclesCell
                        vehicleIds={row.vehicleIds}
                        onOpenDetail={() => onViewDetail(row)}
                      />
                    </td>
                    <td className="v2-two-tabular v2-two-sub-cell">
                      {row.periodStart && row.periodEnd
                        ? `${row.periodStart} ~ ${row.periodEnd}`
                        : '—'}
                    </td>
                    <td>{ownerName(row.currentOwnerId)}</td>
                    <td className="v2-two-sub-cell">{ownerName(row.accountableOwnerId)}</td>
                    <td>
                      <V2Badge status={statusMeta?.badgeStatus} label={statusMeta?.label} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <OperationActions
                        view={{ label: '详情', onClick: () => onViewDetail(row) }}
                        process={
                          canUrge
                            ? { label: '催办', onClick: () => onUrge(row) }
                            : undefined
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
    </div>
  );
};
