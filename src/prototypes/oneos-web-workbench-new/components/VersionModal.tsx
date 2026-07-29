import React from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import type { ReleaseNote } from '../types';

export interface VersionModalProps {
  isOpen: boolean;
  releaseNote: ReleaseNote;
  onClose: () => void;
}

export const VersionModal: React.FC<VersionModalProps> = ({
  isOpen,
  releaseNote,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '520px',
          maxWidth: '100%',
          background: 'var(--ln-surface-card)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          border: '1px solid var(--ln-hairline)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'var(--oneos-primary-soft)',
                color: 'var(--oneos-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ln-ink)' }}>
                {releaseNote.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ln-muted)' }}>
                版本: {releaseNote.version} · 发布日期: {releaseNote.date}
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X size={20} style={{ color: 'var(--ln-muted)' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--ln-surface-pearl)', padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)' }}>本次更新要点 (Highlights)：</div>
          {releaseNote.highlights.map((item, idx) => (
            <div key={idx} style={{ fontSize: '13px', color: 'var(--ln-body)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--oneos-primary)', flexShrink: 0, marginTop: '2px' }} />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <button className="v2-wb-btn v2-wb-btn--primary" style={{ padding: '0 20px', height: '36px' }} onClick={onClose}>
            知道了，立即体验
          </button>
        </div>
      </div>
    </div>
  );
};
