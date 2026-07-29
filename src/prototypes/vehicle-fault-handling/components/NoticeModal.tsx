import React, { useState } from 'react';
import { X, Send, BellRing } from 'lucide-react';
import type { FaultRecord, FaultNotificationRecord } from '../types';
import { V2Select } from '../../../resources/design-system/components/UIComponents';
import { formatCategories } from '../utils';

export interface NoticeModalProps {
  isOpen: boolean;
  item: FaultRecord | null;
  onClose: () => void;
  onSendNotice: (updatedItem: FaultRecord) => void;
}

const CHANNEL_OPTIONS = [
  { value: '短信催办', label: '短信催办 (SMS)' },
  { value: '邮件督办', label: '邮件督办 (Email)' },
  { value: '系统消息', label: '系统消息 (Push)' },
];

export const NoticeModal: React.FC<NoticeModalProps> = ({
  isOpen,
  item,
  onClose,
  onSendNotice,
}) => {
  const [channel, setChannel] = useState<'短信催办' | '邮件督办' | '系统消息'>('短信催办');
  const [recipient, setRecipient] = useState('');
  const [role, setRole] = useState('运维主管');
  const [content, setContent] = useState('');

  React.useEffect(() => {
    if (item) {
      setRecipient(item.opsManager);
      setContent(
        `【OneOS 运维催办通知】单据 ${item.id}（车牌号：${item.plate}，部位：${formatCategories(item.categories)}）已接近 30 天闭环时限，请运维负责人员 ${item.opsManager} 尽快完成索赔材料收集与闭环归档！`
      );
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSend = () => {
    const newNotif: FaultNotificationRecord = {
      id: `n-${Date.now()}`,
      channel,
      recipient,
      role,
      title: '故障处置催办与督办通知',
      content,
      sendTime: new Date().toLocaleString('zh-CN'),
      status: '已发送',
    };

    const updatedItem: FaultRecord = {
      ...item,
      notificationHistory: [newNotif, ...item.notificationHistory],
    };

    onSendNotice(updatedItem);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '480px',
          maxWidth: '100%',
          background: 'var(--ln-surface-card, #FFFFFF)',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ln-ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BellRing style={{ width: 18, height: 18, color: 'var(--oneos-primary)' }} />
            发送催办与督办通知 — {item.plate}
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X style={{ width: 18, height: 18, color: 'var(--ln-muted)' }} />
          </button>
        </div>

        <div className="v2-fh-filter-item">
          <label>通知渠道</label>
          <V2Select
            options={CHANNEL_OPTIONS}
            value={channel}
            onChange={val => setChannel(val as any)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div className="v2-fh-filter-item">
            <label>接收人姓名</label>
            <input
              type="text"
              className="v2-fh-input"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
            />
          </div>

          <div className="v2-fh-filter-item">
            <label>岗位角色</label>
            <input
              type="text"
              className="v2-fh-input"
              value={role}
              onChange={e => setRole(e.target.value)}
            />
          </div>
        </div>

        <div className="v2-fh-filter-item">
          <label>通知正文模板</label>
          <textarea
            rows={4}
            className="v2-fh-input"
            style={{ height: 'auto', padding: '10px' }}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="v2-fh-btn v2-fh-btn--secondary" onClick={onClose}>
            取消
          </button>
          <button type="button" className="v2-fh-btn v2-fh-btn--primary" onClick={handleSend}>
            <Send style={{ width: 14, height: 14 }} />
            发送并留痕
          </button>
        </div>
      </div>
    </div>
  );
};
