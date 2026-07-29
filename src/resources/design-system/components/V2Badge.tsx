import React from 'react';

export type V2BadgeStatus =
  | 'success'
  | 'warning'
  | 'error'
  | 'processing'
  | 'purple'
  | 'default';

export interface V2BadgeProps {
  status?: V2BadgeStatus;
  label?: string;
  icon?: React.ReactNode;
  showDot?: boolean;
  size?: 'small' | 'default' | 'large';
  /** 样式变体；兼容旧调用把语义色写在 variant 上 */
  variant?: 'soft' | 'solid' | 'outline' | V2BadgeStatus;
  /** 数字角标模式: 传入 count 时作为右顶角标或独立数字 Pill */
  count?: number | string;
  /** 数字最大上限，例如 99，超过显示 99+ */
  maxCount?: number;
  /** 是否为红点角标 (仅红点不带数字) */
  dot?: boolean;
  /** 自定义角标背景色 */
  color?: string;
  /** 依附的子元素 (如包裹 Icon, Button 或 Avatar)，或作为状态文案 */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

const SEMANTIC: V2BadgeStatus[] = [
  'success',
  'warning',
  'error',
  'processing',
  'purple',
  'default',
];

/** 状态徽章 Pill（圆角 9999px · DESIGN 状态标签） */
export const V2Badge: React.FC<V2BadgeProps> = ({
  status,
  label,
  icon,
  showDot = false,
  size = 'default',
  variant = 'soft',
  count,
  maxCount = 99,
  dot = false,
  color,
  children,
  style,
  className = '',
  onClick,
}) => {
  // 角标模式：count / dot 时走右上角标；纯 children 文案走状态 Pill
  if (count !== undefined || dot) {
    const displayCount =
      typeof count === 'number' && count > maxCount ? `${maxCount}+` : count;
    const badgeBg = color || '#EF4444';

    return (
      <div
        className={className}
        onClick={onClick}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle',
          ...style,
        }}
      >
        {children}
        <span
          style={{
            position: children ? 'absolute' : 'relative',
            top: children ? '-4px' : 'auto',
            right: children ? '-6px' : 'auto',
            transform: children ? 'translate(30%, -30%)' : 'none',
            background: badgeBg,
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 800,
            fontFamily: '"JetBrains Mono", tabular-nums, sans-serif',
            lineHeight: 1,
            height: dot ? '8px' : '16px',
            minWidth: dot ? '8px' : '16px',
            padding: dot ? 0 : '0 5px',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 1.5px var(--ln-surface-card, #ffffff)',
            zIndex: 10,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {!dot && displayCount}
        </span>
      </div>
    );
  }

  const sizeMap = {
    small: { height: '22px', fontSize: '11px', iconSize: 11, dotSize: 5, padding: '0 8px' },
    default: { height: '26px', fontSize: '12px', iconSize: 13, dotSize: 6, padding: '0 10px' },
    large: { height: '30px', fontSize: '13px', iconSize: 14, dotSize: 7, padding: '0 12px' },
  };
  const cfg = sizeMap[size];

  const statusColors = {
    success: {
      softBg: 'rgba(16, 185, 129, 0.15)',
      solidBg: '#10B981',
      color: '#10B981',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    warning: {
      softBg: 'rgba(217, 119, 6, 0.15)',
      solidBg: '#D97706',
      color: '#D97706',
      border: 'rgba(217, 119, 6, 0.3)',
    },
    error: {
      softBg: 'rgba(239, 68, 68, 0.15)',
      solidBg: '#EF4444',
      color: '#EF4444',
      border: 'rgba(239, 68, 68, 0.3)',
    },
    processing: {
      softBg: 'rgba(59, 130, 246, 0.15)',
      solidBg: '#3B82F6',
      color: '#3B82F6',
      border: 'rgba(59, 130, 246, 0.3)',
    },
    purple: {
      softBg: 'rgba(83, 58, 253, 0.15)',
      solidBg: '#533AFD',
      color: '#533AFD',
      border: 'rgba(83, 58, 253, 0.3)',
    },
    default: {
      softBg: 'var(--ln-surface-strong, rgba(160, 174, 192, 0.15))',
      solidBg: '#64748B',
      color: 'var(--ln-muted, #64748B)',
      border: 'var(--ln-hairline, #E2E8F0)',
    },
  };

  const resolvedStatus: V2BadgeStatus =
    status ??
    (SEMANTIC.includes(variant as V2BadgeStatus) ? (variant as V2BadgeStatus) : 'default');
  const visualVariant =
    variant === 'solid' || variant === 'outline' || variant === 'soft' ? variant : 'soft';
  const sc = statusColors[resolvedStatus] || statusColors.default;

  let bg = sc.softBg;
  let textColor = sc.color;
  let border = 'none';

  if (visualVariant === 'solid') {
    bg = sc.solidBg;
    textColor = '#FFFFFF';
  } else if (visualVariant === 'outline') {
    bg = 'transparent';
    border = `1px solid ${sc.border}`;
  }

  const content = label ?? children;

  return (
    <span
      className={`ds-pill ${className}`}
      onClick={onClick}
      style={{
        height: cfg.height,
        padding: cfg.padding,
        fontSize: cfg.fontSize,
        fontWeight: 600,
        borderRadius: '9999px',
        background: bg,
        color: textColor,
        border,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        lineHeight: 1,
        boxSizing: 'border-box',
        cursor: onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...style,
      }}
    >
      {showDot && (
        <span
          style={{
            width: `${cfg.dotSize}px`,
            height: `${cfg.dotSize}px`,
            borderRadius: '50%',
            background: variant === 'solid' ? '#FFFFFF' : sc.color,
            flexShrink: 0,
          }}
        />
      )}
      {icon}
      {content}
    </span>
  );
};
