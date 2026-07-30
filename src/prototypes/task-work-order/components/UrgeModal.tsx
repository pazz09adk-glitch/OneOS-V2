import React, { useEffect, useState } from 'react';
import {
  BellRing,
  Check,
  Mail,
  MessageSquare,
  MonitorSmartphone,
  Smartphone,
  X,
} from 'lucide-react';
import {
  V2Button,
  V2FieldLabel,
} from '../../../resources/design-system/components/UIComponents';
import { ownerName } from '../mockData';
import { TaskWorkOrder } from '../types';

interface UrgeModalProps {
  task: TaskWorkOrder | null;
  open: boolean;
  onCancel: () => void;
  onSubmitUrge: (taskId: string, remark: string, channels: string[]) => void;
}

const CHANNELS: {
  value: string;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}[] = [
  {
    value: 'system',
    label: '工作台待办',
    desc: '系统待办强提醒',
    Icon: MonitorSmartphone,
  },
  {
    value: 'sms',
    label: '短信通知',
    desc: '手机短信触达',
    Icon: Smartphone,
  },
  {
    value: 'email',
    label: '邮件通知',
    desc: '发送至注册邮箱',
    Icon: Mail,
  },
  {
    value: 'wechat',
    label: '小程序推送',
    desc: '小羚羚 / 微信',
    Icon: MessageSquare,
  },
];

/** 催办文案固定模板（不开放编辑） */
export const URGE_REMARK_TEMPLATE =
  '该协同任务已接近节点/超期，请尽快核对并录入执行反馈。';

export const UrgeModal: React.FC<UrgeModalProps> = ({
  task,
  open,
  onCancel,
  onSubmitUrge,
}) => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['system', 'sms']);
  const [channelError, setChannelError] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelectedChannels(['system', 'sms']);
    setChannelError('');
  }, [open, task?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open || !task) return null;

  const toggleChannel = (value: string) => {
    setSelectedChannels((prev) => {
      const next = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
      if (next.length) setChannelError('');
      return next;
    });
  };

  const handleOk = () => {
    if (!selectedChannels.length) {
      setChannelError('请至少选择一种催办方式');
      return;
    }
    onSubmitUrge(task.id, URGE_REMARK_TEMPLATE, selectedChannels);
  };

  return (
    <div
      className="v2-two-modal-mask"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="v2-two-modal v2-two-urge-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="urge-title"
      >
        <div className="v2-two-modal-header">
          <div className="v2-two-urge-header-text">
            <div id="urge-title" className="v2-two-modal-title">
              <span className="v2-two-urge-title-icon" aria-hidden>
                <BellRing size={16} strokeWidth={2.25} />
              </span>
              催办督办
            </div>
            <p className="v2-two-urge-subtitle">向执行人发送提醒，可多选催办方式</p>
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
          <div className="v2-two-urge-summary">
            <div className="v2-two-urge-summary__code">{task.code}</div>
            <div className="v2-two-urge-summary__title">{task.title}</div>
            <div className="v2-two-urge-summary__meta">
              <span>
                执行人 <strong>{ownerName(task.currentOwnerId)}</strong>
              </span>
              <span className="v2-two-urge-summary__dot" aria-hidden>
                ·
              </span>
              <span>
                归口 <strong>{ownerName(task.accountableOwnerId)}</strong>
              </span>
            </div>
          </div>

          <div className="v2-two-urge-field">
            <V2FieldLabel required>催办方式</V2FieldLabel>
            <div className="v2-two-urge-channels" role="group" aria-label="催办方式">
              {CHANNELS.map(({ value, label, desc, Icon }) => {
                const checked = selectedChannels.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    className={`v2-two-urge-channel ${checked ? 'is-on' : ''}`}
                    aria-pressed={checked}
                    onClick={() => toggleChannel(value)}
                  >
                    <span className="v2-two-urge-channel__ico" aria-hidden>
                      <Icon size={16} strokeWidth={2.25} />
                    </span>
                    <span className="v2-two-urge-channel__copy">
                      <span className="v2-two-urge-channel__label">{label}</span>
                      <span className="v2-two-urge-channel__desc">{desc}</span>
                    </span>
                    <span className="v2-two-urge-channel__check" aria-hidden>
                      {checked ? <Check size={14} strokeWidth={2.5} /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
            {channelError ? (
              <div className="v2-two-field-error">{channelError}</div>
            ) : null}
          </div>
        </div>

        <div className="v2-two-modal-footer">
          <V2Button variant="secondary" size="md" onClick={onCancel}>
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
