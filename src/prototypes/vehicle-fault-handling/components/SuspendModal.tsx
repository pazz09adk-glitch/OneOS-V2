import React, { useState } from 'react';
import { X, PauseCircle, AlertTriangle } from 'lucide-react';
import type { FaultRecord, FaultSuspendRecord } from '../types';
import { V2Select } from '../../../resources/design-system/components/UIComponents';

export interface SuspendModalProps {
  isOpen: boolean;
  item: FaultRecord | null;
  onClose: () => void;
  onConfirmSuspend: (updatedItem: FaultRecord) => void;
}

const SUSPEND_TYPES = [
  { value: '等待零部件到货', label: '等待零部件到货' },
  { value: '整车厂索赔审核', label: '整车厂索赔审核' },
  { value: '客户暂停运营', label: '客户暂停运营' },
  { value: '厂方巡检排查', label: '厂方巡检排查' },
  { value: '其他原因', label: '其他原因' },
];

export const SuspendModal: React.FC<SuspendModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirmSuspend,
}) => {
  const [suspendType, setSuspendType] = useState<FaultSuspendRecord['suspendType']>('整车厂索赔审核');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('挂起失败：请填写具体的挂起原因与保护说明！');
      return;
    }

    const newSuspendRecord: FaultSuspendRecord = {
      id: `sup-${Date.now()}`,
      suspendType,
      reason: reason.trim(),
      operator: '张明辉',
      suspendTime: new Date().toLocaleString('zh-CN'),
    };

    const updatedItem: FaultRecord = {
      ...item,
      taskStatus: 'suspended',
      suspendHistory: [...item.suspendHistory, newSuspendRecord],
      lastOperationTime: new Date().toLocaleString('zh-CN'),
      lastOperator: '张明辉',
    };

    onConfirmSuspend(updatedItem);
    setReason('');
    setError(null);
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
          width: '460px',
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
            <PauseCircle style={{ width: 18, height: 18, color: 'var(--ln-warning, #D97706)' }} />
            申请单据挂起 — {item.plate}
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X style={{ width: 18, height: 18, color: 'var(--ln-muted)' }} />
          </button>
        </div>

        <div
          style={{
            fontSize: '12px',
            color: '#92400E',
            background: 'var(--ln-warning-soft, #FEF3C7)',
            padding: '10px 12px',
            borderRadius: '8px',
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <AlertTriangle style={{ width: 15, height: 15, flexShrink: 0, marginTop: '2px' }} />
          <div>挂起提示：挂起期间不计剩余时限，列表显示「挂起、暂停中」，也不计入临期/逾期告警。请写清挂起原因便于审计；恢复后才会重新计算处置时限，恢复后才能归档。</div>
        </div>

        {error && (
          <div style={{ fontSize: '12px', color: 'var(--ln-error)', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div className="v2-fh-filter-item">
          <label>挂起分类 <span style={{ color: 'var(--ln-error)' }}>*</span></label>
          <V2Select
            options={SUSPEND_TYPES}
            value={suspendType}
            onChange={val => setSuspendType(val as any)}
          />
        </div>

        <div className="v2-fh-filter-item">
          <label>挂起详细原因与情况说明 <span style={{ color: 'var(--ln-error)' }}>*</span></label>
          <textarea
            rows={4}
            className="v2-fh-input"
            style={{ height: 'auto', padding: '10px' }}
            placeholder="例如：需整车厂技术委员会 15 个工作日内出具质保鉴定，已与厂家工程师对接跟进..."
            value={reason}
            onChange={e => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="v2-fh-btn v2-fh-btn--secondary" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="v2-fh-btn"
            style={{ background: 'var(--ln-warning, #D97706)', color: '#FFFFFF' }}
            onClick={handleSubmit}
          >
            确认提交挂起
          </button>
        </div>
      </div>
    </div>
  );
};
