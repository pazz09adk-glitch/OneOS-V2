import React from 'react';

export type V2TagType = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'purple' | 'neutral';

export interface V2TagProps {
  type?: V2TagType;
  /** 兼容旧调用：与 type 等价 */
  variant?: V2TagType | 'soft' | 'solid' | 'outline';
  size?: 'small' | 'default';
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  /** 原生悬停提示（如状态定义） */
  title?: string;
  'aria-label'?: string;
}

export const V2Tag: React.FC<V2TagProps> = ({
  type = 'default',
  variant = 'soft',
  size = 'default',
  icon,
  closable = false,
  onClose,
  children,
  style,
  className = '',
  onClick,
  title,
  'aria-label': ariaLabel,
}) => {
  const typeMap = {
    primary: {
      softBg: 'rgba(83, 58, 253, 0.12)',
      solidBg: '#533AFD',
      color: '#533AFD',
      border: 'rgba(83, 58, 253, 0.25)',
    },
    purple: {
      softBg: 'rgba(83, 58, 253, 0.12)',
      solidBg: '#533AFD',
      color: '#533AFD',
      border: 'rgba(83, 58, 253, 0.25)',
    },
    success: {
      softBg: 'rgba(16, 185, 129, 0.12)',
      solidBg: '#10B981',
      color: '#10B981',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    warning: {
      softBg: 'rgba(217, 119, 6, 0.12)',
      solidBg: '#D97706',
      color: '#D97706',
      border: 'rgba(217, 119, 6, 0.25)',
    },
    error: {
      softBg: 'rgba(239, 68, 68, 0.12)',
      solidBg: '#EF4444',
      color: '#EF4444',
      border: 'rgba(239, 68, 68, 0.25)',
    },
    default: {
      softBg: 'var(--ln-surface-pearl, #F1F5F9)',
      solidBg: '#64748B',
      color: 'var(--ln-ink, #0A2540)',
      border: 'var(--ln-hairline, #E2E8F0)',
    },
    neutral: {
      softBg: 'var(--ln-surface-pearl, #F1F5F9)',
      solidBg: '#64748B',
      color: 'var(--ln-ink, #0A2540)',
      border: 'var(--ln-hairline, #E2E8F0)',
    },
  };

  const semanticTypes: V2TagType[] = [
    'default',
    'primary',
    'success',
    'warning',
    'error',
    'purple',
    'neutral',
  ];
  const resolvedType: V2TagType =
    variant && semanticTypes.includes(variant as V2TagType)
      ? (variant as V2TagType)
      : type;
  const appearance =
    variant === 'solid' || variant === 'outline' || variant === 'soft' ? variant : 'soft';

  const tc = typeMap[resolvedType] || typeMap.default;
  const h = size === 'small' ? '20px' : '24px';
  const fs = size === 'small' ? '11px' : '12px';
  const px = size === 'small' ? '6px' : '8px';

  let bg = tc.softBg;
  let color = tc.color;
  let border = appearance === 'outline' ? `1px solid ${tc.border}` : '1px solid transparent';

  if (appearance === 'solid') {
    bg = tc.solidBg;
    color = '#FFFFFF';
    border = 'none';
  }

  return (
    <span
      className={className}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        height: h,
        padding: `0 ${px}`,
        fontSize: fs,
        fontWeight: 600,
        borderRadius: '6px',
        background: bg,
        color,
        border,
        lineHeight: 1,
        boxSizing: 'border-box',
        cursor: onClick ? 'pointer' : title ? 'help' : 'default',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...style,
      }}
    >
      {icon}
      {children}
      {closable ? (
        <button
          type="button"
          aria-label="移除标签"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          style={{
            marginLeft: 2,
            border: 'none',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
            fontSize: 12,
            opacity: 0.7,
          }}
        >
          ×
        </button>
      ) : null}
    </span>
  );
};
