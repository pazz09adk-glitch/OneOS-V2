import React, { useState } from 'react';
import { BellRing, CheckCircle2, Lock, MessageSquarePlus } from 'lucide-react';
import {
  V2Badge,
  V2Button,
  V2FieldLabel,
  V2Tag,
  V2Timeline,
  V2Toast,
} from '../../../resources/design-system/components/UIComponents';
import {
  MOCK_VEHICLES,
  ownerName,
  periodOverdueDays,
  TASK_STATUS_META,
  TASK_TYPE_META,
} from '../mockData';
import {
  canCompleteTask,
  canSubmitFeedback,
  canUrgeTask,
  completeBlockedReason,
  formatPeriodEndLabel,
  isPeriodUnlimited,
} from '../permissions';
import { resolveRelatedBiz } from '../relatedBiz';
import { toV2TagType } from '../tagUtils';
import { TaskWorkOrder } from '../types';
import { RelatedBizCodeLink } from './RelatedBizCodeLink';
import { FeedbackAttachments } from './FeedbackAttachments';

interface TaskDetailPageProps {
  task: TaskWorkOrder;
  viewerId: string;
  onBack: () => void;
  onUrge: (task: TaskWorkOrder) => void;
  onSubmitFeedback: (taskId: string, note: string, files: string[]) => void;
  onComplete: (taskId: string) => void;
}

/**
 * 任务详情 · 对齐 DESIGN §4.8：
 * 角色权限驱动催办 / 反馈 / 办结；反馈历史与操作时间线拆分。
 */
export const TaskDetailPage: React.FC<TaskDetailPageProps> = ({
  task,
  viewerId,
  onBack,
  onUrge,
  onSubmitFeedback,
  onComplete,
}) => {
  const typeMeta = TASK_TYPE_META[task.taskType] || { label: task.taskType, tone: 'default' };
  const statusMeta = TASK_STATUS_META[task.status];
  const related = resolveRelatedBiz(task);
  const done = task.status === 'completed' || task.status === 'closed';
  const unlimited = isPeriodUnlimited(task);
  const overdueDays = done
    ? null
    : periodOverdueDays(task.periodEnd, undefined, task.periodUnlimited);
  const boundVehicles = MOCK_VEHICLES.filter((v) => (task.vehicleIds || []).includes(v.id));

  const showUrge = canUrgeTask(task, viewerId);
  const showFeedback = canSubmitFeedback(task, viewerId);
  const showComplete = canCompleteTask(task, viewerId);
  const completeBlock = completeBlockedReason(task, viewerId);

  const [note, setNote] = useState('');
  const [fileName, setFileName] = useState('');
  const [toast, setToast] = useState<{ message: string; tone?: 'success' | 'error' | 'info' } | null>(
    null
  );

  const handleFeedback = () => {
    if (!note.trim()) {
      setToast({ message: '请填写反馈内容', tone: 'error' });
      return;
    }
    const files = fileName.trim() ? [fileName.trim()] : [];
    onSubmitFeedback(task.id, note.trim(), files);
    setNote('');
    setFileName('');
    setToast({ message: '执行反馈已提交', tone: 'success' });
  };

  const handleComplete = () => {
    if (completeBlock) {
      setToast({ message: completeBlock, tone: 'error' });
      return;
    }
    onComplete(task.id);
  };

  return (
    <div className="v2-two-detail-page">
      <V2Toast
        open={Boolean(toast)}
        tone={toast?.tone || 'info'}
        message={toast?.message || ''}
        onClose={() => setToast(null)}
      />
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
          {showComplete && (
            <V2Button
              variant="secondary"
              size="md"
              icon={<CheckCircle2 size={14} />}
              onClick={handleComplete}
            >
              办结
            </V2Button>
          )}
          {showUrge && (
            <V2Button
              variant="primary"
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
            {overdueDays != null && (
              <V2Tag type="error" title={`已超过周期结束日 ${overdueDays} 天`}>
                超时 {overdueDays} 天
              </V2Tag>
            )}
            {unlimited && <V2Tag type="primary">长期跟进 · 计划不限</V2Tag>}
          </div>
          <div className="v2-two-detail-context__title">{task.title}</div>
          <div className="v2-two-detail-context__people">
            发起 {ownerName(task.initiatorId)} · 执行 {ownerName(task.currentOwnerId)} · 归口{' '}
            {ownerName(task.accountableOwnerId)}
          </div>
          {!showUrge && !showFeedback && !showComplete && !done && (
            <p className="v2-two-detail-hint" style={{ marginTop: 8 }}>
              当前为领导只读视角：可查看进度与反馈，不可编辑 / 催办 / 办结。
            </p>
          )}
          {showFeedback && !showComplete && completeBlock && (
            <p className="v2-two-detail-hint" style={{ marginTop: 8 }}>
              {completeBlock}
            </p>
          )}
        </div>

        {(task.source === 'contract' || related.code) && (
          <div className="v2-two-desensitize-banner">
            <Lock size={14} strokeWidth={2.25} aria-hidden />
            <span>
              执行端已脱敏：关联业务单号仅作检索索引。
              {related.code ? (
                <>
                  {' '}
                  当前关联 <strong>{related.typeLabel}</strong> ·{' '}
                  <RelatedBizCodeLink code={related.code} />
                </>
              ) : null}
            </span>
          </div>
        )}

        <div className="v2-two-detail-section">
          <div className="v2-two-detail-section-title">执行要求</div>
          <div className="v2-two-detail-requirement">{task.requirement}</div>
        </div>

        {(task.periodStart || task.periodEnd || task.periodUnlimited) && (
          <div className="v2-two-detail-section">
            <div className="v2-two-detail-section-title">执行周期</div>
            <div className="v2-two-detail-kv">
              <span className="v2-two-detail-muted">计划区间</span>
              <span>
                {task.periodStart || '—'} ~{' '}
                {formatPeriodEndLabel(task.periodEnd, task.periodUnlimited)}
                {overdueDays != null ? ` · 超时 ${overdueDays} 天` : ''}
              </span>
            </div>
          </div>
        )}

        {boundVehicles.length > 0 && (
          <div className="v2-two-detail-section">
            <div className="v2-two-detail-section-title">绑定车辆</div>
            <div className="v2-two-vehicle-pick-panel is-readonly" aria-label="已绑定车辆">
              <div className="v2-two-vehicle-pick-bar">
                <p className="v2-two-vehicle-pick-source">
                  已绑定 {boundVehicles.length} 台
                </p>
                <span className="v2-two-vehicle-pick-count" aria-live="polite">
                  {boundVehicles.length}/{boundVehicles.length}
                </span>
              </div>
              <div className="v2-two-vehicle-pick">
                {boundVehicles.map((v) => (
                  <span
                    key={v.id}
                    className="v2-two-vehicle-pick-btn is-on is-readonly"
                    title={`${v.plateNo}（${v.brand} ${v.model}）`}
                  >
                    <span className="v2-two-mono">{v.plateNo}</span>
                    （{v.model}）
                  </span>
                ))}
              </div>
            </div>
            {task.taskType === 'mileage' && (
              <p className="v2-two-detail-hint">
                里程进度与完成度请在车辆资产 · 里程任务中查看。办结不以该进度为强制前置。
              </p>
            )}
          </div>
        )}

        {showFeedback && (
          <div className="v2-two-detail-section">
            <div className="v2-two-detail-section-title">提交执行反馈</div>
            <div className="v2-two-feedback-composer">
              <V2FieldLabel required>反馈内容</V2FieldLabel>
              <textarea
                className="v2-two-textarea"
                rows={3}
                placeholder="说明进展、障碍或结果（执行人可见口径，勿写入合同金额）"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <V2FieldLabel optional>附件文件名（演示）</V2FieldLabel>
              <input
                type="text"
                className="v2-two-text-input"
                placeholder="如：现场照片.jpg / 说明.pdf"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
              <div className="v2-two-feedback-composer__actions">
                <V2Button
                  variant="primary"
                  size="md"
                  icon={<MessageSquarePlus size={14} />}
                  onClick={handleFeedback}
                >
                  提交反馈
                </V2Button>
              </div>
            </div>
          </div>
        )}

        <div className="v2-two-detail-section">
          <div className="v2-two-detail-section-head">
            <div className="v2-two-detail-section-title">执行反馈历史</div>
            {task.feedbacks.length > 0 ? (
              <span className="v2-two-detail-section-count">{task.feedbacks.length} 条</span>
            ) : null}
          </div>
          {task.feedbacks.length === 0 ? (
            <span className="v2-two-detail-muted">暂无反馈</span>
          ) : (
            <div className="v2-two-feedback-list">
              {task.feedbacks.map((f, i) => (
                <div key={i} className="v2-two-feedback-card">
                  <div className="v2-two-feedback-card__meta">
                    {f.at} · {f.by}
                  </div>
                  <div className="v2-two-feedback-card__note">{f.note}</div>
                  {f.attachments?.length ? <FeedbackAttachments files={f.attachments} /> : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="v2-two-detail-section">
          <div className="v2-two-detail-section-title">操作与督办时间线</div>
          <V2Timeline
            items={task.timeline.map((ev) => ({
              title: ev.action,
              timestamp: ev.at,
              operator: ev.operator,
              content: ev.remark,
              color: 'violet' as const,
            }))}
          />
        </div>
      </div>
    </div>
  );
};
