import React, { useState } from 'react';
import { BellRing, X } from 'lucide-react';
import {
  V2Button,
  V2CheckboxGroup,
} from '../../../resources/design-system/components/UIComponents';
import { ownerName } from '../mockData';
import { TaskWorkOrder } from '../types';

interface UrgeModalProps {
  task: TaskWorkOrder | null;
  open: boolean;
  onCancel: () => void;
  onSubmitUrge: (taskId: string, remark: string, channels: string[]) => void;
}

export const UrgeModal: React.FC<UrgeModalProps> = ({
  task,
  open,
  onCancel,
  onSubmitUrge,
}) => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['system', 'sms']);
  const [remark, setRemark] = useState(
    '该协同任务已接近节点/超期，请尽快核对并录入执行反馈。'
  );

  if (!open || !task) return null;

  const handleOk = () => {
    onSubmitUrge(task.id, remark || '请尽快核对并反馈任务执行进度。', selectedChannels);
  };

  return (
    <div className="v2-two-modal-mask">
      <div className="v2-two-modal" role="dialog" aria-modal="true" aria-labelledby="urge-title">
        <div className="v2-two-modal-header">
          <div id="urge-title" className="v2-two-modal-title">
            <BellRing size={16} className="v2-two-text-danger" /> 工单催办督办
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="v2-two-modal-close"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div className="v2-two-modal-body">
          <div className="v2-two-detail-section" style={{ marginBottom: 0 }}>
            <div className="v2-two-row-title" style={{ marginBottom: 4 }}>
              {task.code} · {task.title}
            </div>
            <div className="v2-two-detail-muted">
              接收执行人: <strong>{ownerName(task.currentOwnerId)}</strong>（归口:{' '}
              {ownerName(task.accountableOwnerId)}）
            </div>
          </div>

          <div>
            <label className="v2-two-filter-label">催办发送通道</label>
            <V2CheckboxGroup
              options={[
                { value: 'system', label: '工作台系统待办强提醒' },
                { value: 'sms', label: '短信通知' },
                { value: 'email', label: '邮件通知' },
                { value: 'wechat', label: '小羚羚小程序/微信推送' },
              ]}
              value={selectedChannels}
              onChange={(vals) => setSelectedChannels(vals as string[])}
            />
          </div>

          <div>
            <label className="v2-two-filter-label">催办提醒备注</label>
            <textarea
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="v2-two-textarea"
            />
          </div>
        </div>

        <div className="v2-two-modal-footer">
          <V2Button variant="ghost" size="md" onClick={onCancel}>
            取消
          </V2Button>
          <V2Button variant="danger" size="md" onClick={handleOk}>
            发送催办
          </V2Button>
        </div>
      </div>
    </div>
  );
};
