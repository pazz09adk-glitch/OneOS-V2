import React, { useEffect, useState } from 'react';
import { X, Send, BellRing, Mail, MessageSquare, MessageCircle } from 'lucide-react';

export interface UrgeModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onConfirmUrge: (channels: string[]) => void;
}

export const UrgeModal: React.FC<UrgeModalProps> = ({
  isOpen,
  title,
  subtitle = '催办任务',
  onClose,
  onConfirmUrge,
}) => {
  const [emailChecked, setEmailChecked] = useState(true);
  const [smsChecked, setSmsChecked] = useState(false);
  const [wechatChecked, setWechatChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setEmailChecked(true);
    setSmsChecked(false);
    setWechatChecked(false);
    setError(null);
  }, [isOpen, title]);

  if (!isOpen) return null;

  const handleSend = () => {
    const selectedChannels: string[] = [];
    if (emailChecked) selectedChannels.push('邮件');
    if (smsChecked) selectedChannels.push('短信');
    if (wechatChecked) selectedChannels.push('微信');

    if (selectedChannels.length === 0) {
      setError('请至少选择 1 种催办通道！');
      return;
    }

    onConfirmUrge(selectedChannels);
    setError(null);
    onClose();
  };

  return (
    <div
      className="v2-wb-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="v2-wb-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="催办"
      >
        <div className="v2-wb-modal__head">
          <div className="v2-wb-modal__title">
            <BellRing size={18} style={{ color: 'var(--oneos-primary)' }} />
            催办演示
          </div>
          <button type="button" className="v2-wb-icon-btn" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
        </div>

        <div className="v2-wb-modal__hint">
          <strong>{subtitle}：</strong>
          {title}
        </div>

        {error && <div className="v2-wb-modal__error">{error}</div>}

        <div className="v2-wb-urge-channels">
          <div className="v2-wb-filter-field__label">选择发送通道（支持多选）</div>

          <label className="v2-wb-check-row">
            <input
              type="checkbox"
              checked={emailChecked}
              onChange={(e) => setEmailChecked(e.target.checked)}
            />
            <Mail size={15} style={{ color: 'var(--oneos-primary)' }} />
            <span>发送催办电子邮件 (Email)</span>
          </label>

          <label className="v2-wb-check-row">
            <input
              type="checkbox"
              checked={smsChecked}
              onChange={(e) => setSmsChecked(e.target.checked)}
            />
            <MessageSquare size={15} style={{ color: 'var(--ln-warning)' }} />
            <span>发送手机催办短信 (SMS)</span>
          </label>

          <label className="v2-wb-check-row">
            <input
              type="checkbox"
              checked={wechatChecked}
              onChange={(e) => setWechatChecked(e.target.checked)}
            />
            <MessageCircle size={15} style={{ color: 'var(--ln-success)' }} />
            <span>转发微信/企微分享链接</span>
          </label>
        </div>

        <div className="v2-wb-modal__foot">
          <button type="button" className="v2-wb-btn v2-wb-btn--secondary" onClick={onClose}>
            取消
          </button>
          <button type="button" className="v2-wb-btn v2-wb-btn--primary" onClick={handleSend}>
            <Send size={13} />
            发送催办
          </button>
        </div>
      </div>
    </div>
  );
};
