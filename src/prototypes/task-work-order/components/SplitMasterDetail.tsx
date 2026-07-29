import React, { useEffect, useState } from 'react';
import { BellRing, Lock, Search } from 'lucide-react';
import {
  V2Badge,
  V2Button,
  V2Empty,
  V2Tag,
  V2Timeline,
} from '../../../resources/design-system/components/UIComponents';
import { ownerName, TASK_STATUS_META, TASK_TYPE_META } from '../mockData';
import { resolveRelatedBiz } from '../relatedBiz';
import { toV2TagType } from '../tagUtils';
import { TaskWorkOrder } from '../types';

interface SplitMasterDetailProps {
  tasks: TaskWorkOrder[];
  onUrge: (task: TaskWorkOrder) => void;
  onOpenFullDetail: (task: TaskWorkOrder) => void;
}

export const SplitMasterDetail: React.FC<SplitMasterDetailProps> = ({
  tasks,
  onUrge,
  onOpenFullDetail,
}) => {
  const [selectedId, setSelectedId] = useState<string>(tasks[0]?.id || '');
  const [searchKw, setSearchKeyword] = useState('');

  useEffect(() => {
    if (!tasks.find((t) => t.id === selectedId) && tasks[0]) {
      setSelectedId(tasks[0].id);
    }
  }, [tasks, selectedId]);

  const filteredTasks = tasks.filter((t) => {
    const kw = searchKw.toLowerCase();
    const related = resolveRelatedBiz(t);
    return (
      t.title.toLowerCase().includes(kw) ||
      t.code.toLowerCase().includes(kw) ||
      (related.code || '').toLowerCase().includes(kw)
    );
  });

  const selectedTask =
    tasks.find((t) => t.id === selectedId) || filteredTasks[0] || tasks[0];

  return (
    <div className="v2-two-split-layout">
      <div className="v2-two-split-left">
        <div className="v2-two-split-left-search">
          <div className="v2-two-split-search-wrap">
            <Search size={14} className="v2-two-split-search-icon" aria-hidden />
            <input
              type="text"
              placeholder="搜索工单号/名称/关联单号"
              value={searchKw}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="v2-two-split-search-input"
              aria-label="搜索工单"
            />
          </div>
        </div>
        <div className="v2-two-split-left-list">
          {filteredTasks.length === 0 ? (
            <div className="v2-two-table-empty">
              <V2Empty type="no_search" size="small" title="无匹配工单" />
            </div>
          ) : (
            filteredTasks.map((item) => {
              const isSelected = item.id === selectedTask?.id;
              const typeMeta = TASK_TYPE_META[item.taskType] || {
                label: item.taskType,
                tone: 'default',
              };
              const statusMeta = TASK_STATUS_META[item.status];

              return (
                <div
                  key={item.id}
                  className={`v2-two-split-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedId(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedId(item.id);
                  }}
                >
                  <div className="v2-two-split-item-top">
                    <span className="v2-two-code-cell">{item.code}</span>
                    <V2Badge
                      status={statusMeta?.badgeStatus}
                      label={statusMeta?.label}
                      size="small"
                    />
                  </div>
                  <div className="v2-two-split-item-title">{item.title}</div>
                  <div className="v2-two-split-item-bottom">
                    <V2Tag type={toV2TagType(typeMeta.tone)}>{typeMeta.label}</V2Tag>
                    <span className="v2-two-detail-muted">
                      执行: {ownerName(item.currentOwnerId)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="v2-two-split-right">
        {selectedTask ? (
          <>
            <div className="v2-two-split-right-header">
              <div>
                <div className="v2-two-split-right-meta">
                  <span className="v2-two-form-header__code">{selectedTask.code}</span>
                  <V2Tag type={toV2TagType(TASK_TYPE_META[selectedTask.taskType]?.tone)}>
                    {TASK_TYPE_META[selectedTask.taskType]?.label}
                  </V2Tag>
                  <V2Badge
                    status={TASK_STATUS_META[selectedTask.status]?.badgeStatus}
                    label={TASK_STATUS_META[selectedTask.status]?.label}
                  />
                </div>
                <h2 className="v2-two-split-right-title">{selectedTask.title}</h2>
              </div>
              <div className="v2-two-split-right-actions">
                <V2Button
                  variant="secondary"
                  size="md"
                  onClick={() => onOpenFullDetail(selectedTask)}
                >
                  全页详情
                </V2Button>
                {selectedTask.status !== 'completed' && selectedTask.status !== 'closed' && (
                  <V2Button
                    variant="danger"
                    size="md"
                    icon={<BellRing size={14} />}
                    onClick={() => onUrge(selectedTask)}
                  >
                    发送催办
                  </V2Button>
                )}
              </div>
            </div>

            <div className="v2-two-desensitize-banner">
              <Lock size={14} /> <strong>商业数据隔离说明</strong>
              ：执行人端（工作台待办/小羚羚小程序）已完成敏感隔离，仅展示任务要求，
              <strong>不可查看采购合同原文、PDF 及关联金额</strong>。
            </div>

            <div className="v2-two-detail-section">
              <div className="v2-two-detail-section-title">任务概要与执行要求</div>
              <div className="v2-two-detail-requirement">{selectedTask.requirement}</div>
            </div>

            {(() => {
              const related = resolveRelatedBiz(selectedTask);
              if (!related.code) return null;
              return (
                <div className="v2-two-detail-section">
                  <div className="v2-two-detail-section-title">关联业务工单</div>
                  <V2Tag type="purple">{related.typeLabel}</V2Tag>
                  <span className="v2-two-related-code" style={{ marginLeft: 8 }}>
                    {related.code}
                  </span>
                  <span className="v2-two-detail-muted" style={{ marginLeft: 8 }}>
                    {selectedTask.source === 'standalone'
                      ? '新建时选填关联'
                      : '自业务单据发起'}
                  </span>
                </div>
              );
            })()}

            <div className="v2-two-detail-section">
              <div className="v2-two-detail-section-title">责任链与协同关系</div>
              <div className="v2-two-split-people-grid">
                <div>
                  <div className="v2-two-detail-muted">发起人</div>
                  <div className="v2-two-row-title">{ownerName(selectedTask.initiatorId)}</div>
                </div>
                <div>
                  <div className="v2-two-detail-muted">归口责任人（固定）</div>
                  <div className="v2-two-row-title v2-two-text-primary">
                    {ownerName(selectedTask.accountableOwnerId)}
                  </div>
                </div>
                <div>
                  <div className="v2-two-detail-muted">当前执行人</div>
                  <div className="v2-two-row-title">{ownerName(selectedTask.currentOwnerId)}</div>
                </div>
              </div>
            </div>

            <div className="v2-two-detail-section">
              <div className="v2-two-detail-section-title">执行反馈历史</div>
              {selectedTask.feedbacks.length === 0 ? (
                <span className="v2-two-detail-muted">暂无反馈记录</span>
              ) : (
                selectedTask.feedbacks.map((f, i) => (
                  <div key={i} className="v2-two-feedback-card">
                    <div className="v2-two-detail-muted" style={{ marginBottom: 4 }}>
                      {f.at} · 反馈人: {f.by}
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
                items={selectedTask.timeline.map((ev) => ({
                  title: `${ev.action} · ${ev.operator}`,
                  time: ev.at,
                  description: ev.remark,
                }))}
              />
            </div>
          </>
        ) : (
          <div className="v2-two-table-empty">
            <V2Empty type="empty" size="small" title="请在左侧选择一个任务工单" />
          </div>
        )}
      </div>
    </div>
  );
};
