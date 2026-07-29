import React from 'react';
import { BellRing, Lock } from 'lucide-react';
import {
  V2Badge,
  V2Button,
  V2Tag,
  V2Timeline,
} from '../../../resources/design-system/components/UIComponents';
import {
  MOCK_VEHICLES,
  ownerName,
  TASK_STATUS_META,
  TASK_TYPE_META,
} from '../mockData';
import { resolveRelatedBiz } from '../relatedBiz';
import { toV2TagType } from '../tagUtils';
import { TaskWorkOrder } from '../types';

interface TaskDetailPageProps {
  task: TaskWorkOrder;
  onBack: () => void;
  onUrge: (task: TaskWorkOrder) => void;
}

export const TaskDetailPage: React.FC<TaskDetailPageProps> = ({ task, onBack, onUrge }) => {
  const typeMeta = TASK_TYPE_META[task.taskType] || { label: task.taskType, tone: 'default' };
  const statusMeta = TASK_STATUS_META[task.status];
  const canUrge = task.status !== 'completed' && task.status !== 'closed';
  const related = resolveRelatedBiz(task);

  return (
    <div className="v2-two-detail-page">
      <header className="v2-two-form-header">
        <div className="v2-two-form-header__left">
          <V2Button variant="back" size="md" onClick={onBack}>
            返回台账
          </V2Button>
          <div className="v2-two-form-header__divider" aria-hidden />
          <div className="v2-two-form-header__titles">
            <div className="v2-two-form-header__title-row">
              <h1>任务详情</h1>
              <span className="v2-two-form-header__code">{task.code}</span>
            </div>
          </div>
        </div>
        <div className="v2-two-form-header__actions">
          {canUrge && (
            <V2Button
              variant="danger"
              size="md"
              icon={<BellRing size={14} />}
              onClick={() => onUrge(task)}
            >
              催办
            </V2Button>
          )}
        </div>
      </header>

      <div className="v2-two-detail-page__body">
        <div className="v2-two-detail-section v2-two-detail-context">
          <div className="v2-two-detail-context__row">
            <V2Tag type={toV2TagType(typeMeta.tone)}>{typeMeta.label}</V2Tag>
            <V2Badge status={statusMeta?.badgeStatus} label={statusMeta?.label} />
          </div>
          <div className="v2-two-detail-context__title">{task.title}</div>
          <div className="v2-two-detail-context__people">
            发起人：<strong>{ownerName(task.initiatorId)}</strong>
            {' · '}
            归口：
            <strong className="v2-two-text-primary">{ownerName(task.accountableOwnerId)}</strong>
            {' · '}
            当前执行：<strong>{ownerName(task.currentOwnerId)}</strong>
          </div>
        </div>

        <div className="v2-two-desensitize-banner">
          <Lock size={14} /> 执行人在 OneOS 工作台待办 / 小羚羚小程序中处理本任务，
          <strong>绝不可查看采购合同原文与金额</strong>。
        </div>

        <div className="v2-two-detail-section">
          <div className="v2-two-detail-section-title">任务要求</div>
          <div className="v2-two-detail-requirement">{task.requirement}</div>
        </div>

        {related.code && (
          <div className="v2-two-detail-section">
            <div className="v2-two-detail-section-title">关联业务工单</div>
            <V2Tag type="purple">{related.typeLabel}</V2Tag>
            <span className="v2-two-related-code" style={{ marginLeft: 8 }}>
              {related.code}
            </span>
          </div>
        )}

        {task.dataAdjustItems && task.dataAdjustItems.length > 0 && (
          <div className="v2-two-detail-section">
            <div className="v2-two-detail-section-title">改数明细</div>
            <div className="v2-two-adjust-list">
              {task.dataAdjustItems.map((item, idx) => (
                <div key={item.id} className="v2-two-adjust-row">
                  <div className="v2-two-adjust-row__meta">
                    <span className="v2-two-adjust-row__index">第 {idx + 1} 条</span>
                    <V2Tag type="warning">{item.fieldName}</V2Tag>
                  </div>
                  <div>
                    <span className="v2-two-detail-muted">修改原因：</span>
                    {item.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(task.periodStart || task.periodEnd) && (
          <div className="v2-two-detail-section">
            <div className="v2-two-detail-section-title">执行周期</div>
            <span className="v2-two-tabular">
              {task.periodStart || '—'} 至 {task.periodEnd || '—'}
            </span>
          </div>
        )}

        {task.vehicleIds && task.vehicleIds.length > 0 && (
          <div className="v2-two-detail-section">
            <div className="v2-two-detail-section-title">绑定车辆</div>
            {MOCK_VEHICLES.filter((v) => task.vehicleIds.includes(v.id)).map((v) => (
              <span key={v.id} className="v2-two-vehicle-chip">
                {v.plateNo} {v.model} · {v.mileage.toLocaleString()} km（{v.mileageSource}）
              </span>
            ))}
            {task.taskType === 'mileage' && (
              <div className="v2-two-detail-muted" style={{ marginTop: 8 }}>
                里程进度与完成度请在车辆资产 · 里程任务中查看（规则已同步）。
              </div>
            )}
          </div>
        )}

        <div className="v2-two-detail-section">
          <div className="v2-two-detail-section-title">执行反馈历史</div>
          {task.feedbacks.length === 0 ? (
            <span className="v2-two-detail-muted">暂无反馈</span>
          ) : (
            task.feedbacks.map((f, i) => (
              <div key={i} className="v2-two-feedback-card">
                <div className="v2-two-detail-muted" style={{ marginBottom: 4 }}>
                  {f.at} · {f.by}
                </div>
                <div>{f.note}</div>
                {f.attachments?.length ? (
                  <div className="v2-two-text-primary" style={{ fontSize: 12, marginTop: 4 }}>
                    附件: {f.attachments.join('、')}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className="v2-two-detail-section">
          <div className="v2-two-detail-section-title">操作与督办时间线</div>
          <V2Timeline
            items={task.timeline.map((ev) => ({
              title: `${ev.action} · ${ev.operator}`,
              time: ev.at,
              description: ev.remark,
            }))}
          />
        </div>
      </div>
    </div>
  );
};
