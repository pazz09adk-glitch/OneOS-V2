import React, { useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

export type V2ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'link'
  | 'back';

export type V2ButtonSize = 'sm' | 'md' | 'lg';

export interface V2ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: V2ButtonVariant;
  size?: V2ButtonSize;
  /** 加载中：禁用点击并显示旋转图标 */
  loading?: boolean;
  /** 左侧图标（loading 时被 Loader 替换） */
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  /** 宽度 100% */
  block?: boolean;
}

const STYLE_ID = 'oneos-v2-button-styles';

const V2_BUTTON_CSS = `
.v2-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  border-radius: var(--ln-radius-control, 8px);
  font-family: inherit;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}
.v2-btn:disabled {
  cursor: not-allowed;
}
.v2-btn--sm { min-height: 32px; height: 32px; padding: 0 12px; font-size: 12px; min-width: 72px; }
.v2-btn--md { min-height: 36px; height: 36px; padding: 0 14px; font-size: 13px; min-width: 88px; }
.v2-btn--lg { min-height: 44px; height: 44px; padding: 0 18px; font-size: 13px; min-width: 96px; }
.v2-btn--block { width: 100%; min-width: 0; }
.v2-btn--link, .v2-btn--back { min-width: 0; }
.v2-btn--link { padding: 0 8px; background: transparent; border: 1px solid transparent; color: var(--oneos-primary, var(--ln-primary, #533AFD)); font-weight: 500; box-shadow: none; }
.v2-btn--link:hover:not(:disabled) { color: var(--ln-primary-hover, #6346FF); }
.v2-btn--primary {
  background: var(--oneos-primary, var(--ln-primary, #533AFD));
  color: #FFFFFF;
  border: 1px solid transparent;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(83, 58, 253, 0.28);
}
.v2-btn--primary:hover:not(:disabled) { background: var(--ln-primary-hover, #6346FF); }
.v2-btn--primary:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(83, 58, 253, 0.2); }
.v2-btn--primary:disabled {
  background: var(--ln-surface-pearl, #F1F5F9);
  color: var(--ln-muted, #627D98);
  border: 1px solid var(--ln-hairline, #E3E8EE);
  box-shadow: none;
  opacity: 0.65;
}
.v2-btn--secondary {
  background: var(--ln-surface-card, #FFFFFF);
  color: var(--ln-ink, #0A2540);
  border: 1px solid var(--ln-hairline, #E3E8EE);
  font-weight: 500;
  box-shadow: none;
}
.v2-btn--secondary:hover:not(:disabled) {
  background: var(--ln-surface-pearl, #F8FAFC);
  border-color: var(--ln-hairline-strong, #CBD5E1);
}
.v2-btn--secondary:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(83, 58, 253, 0.2); }
.v2-btn--secondary:disabled { opacity: 0.65; }
.v2-btn--outline {
  background: transparent;
  color: var(--oneos-primary, var(--ln-primary, #533AFD));
  border: 1px solid var(--oneos-primary, var(--ln-primary, #533AFD));
  font-weight: 600;
  box-shadow: none;
}
.v2-btn--outline:hover:not(:disabled) {
  color: var(--ln-primary-hover, #6346FF);
  border-color: var(--ln-primary-hover, #6346FF);
}
.v2-btn--outline:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(83, 58, 253, 0.2); }
.v2-btn--outline:disabled { opacity: 0.65; }
.v2-btn--ghost, .v2-btn--back {
  background: var(--ln-surface-card, #FFFFFF);
  color: var(--ln-body, #425466);
  border: 1px solid var(--ln-hairline, #E3E8EE);
  font-weight: 600;
  box-shadow: none;
}
.v2-btn--ghost:hover:not(:disabled),
.v2-btn--back:hover:not(:disabled) {
  background: var(--ln-surface-pearl, #F8FAFC);
  border-color: var(--ln-hairline-strong, #CBD5E1);
  color: var(--ln-ink, #0A2540);
}
.v2-btn--ghost:focus-visible,
.v2-btn--back:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(83, 58, 253, 0.2); }
.v2-btn--ghost:disabled,
.v2-btn--back:disabled { opacity: 0.65; }
.v2-btn--danger {
  background: #EF4444;
  color: #FFFFFF;
  border: 1px solid transparent;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.28);
}
.v2-btn--danger:hover:not(:disabled) { background: #DC2626; }
.v2-btn--danger:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2); }
.v2-btn--danger:disabled {
  background: var(--ln-surface-pearl, #F1F5F9);
  color: var(--ln-muted, #627D98);
  border: 1px solid var(--ln-hairline, #E3E8EE);
  box-shadow: none;
  opacity: 0.65;
}
.v2-btn__spinner { width: 16px; height: 16px; flex-shrink: 0; animation: v2-btn-spin 0.7s linear infinite; }
@keyframes v2-btn-spin { to { transform: rotate(360deg); } }
@media (max-width: 767px) {
  .v2-btn--md:not(.v2-btn--link) { min-height: 44px; height: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  .v2-btn { transition: none !important; }
  .v2-btn__spinner { animation: none; }
}
`;

function ensureV2ButtonStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = V2_BUTTON_CSS;
  document.head.appendChild(el);
}

/**
 * OneOS V2 统一按钮。主色消费 CSS 变量，兼容若依动态主题。
 * 规范：DESIGN.md §3.0
 */
export const V2Button: React.FC<V2ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  block = false,
  disabled,
  className = '',
  style,
  children,
  type = 'button',
  ...rest
}) => {
  useEffect(() => {
    ensureV2ButtonStyles();
  }, []);

  const isDisabled = disabled || loading;
  const leading =
    loading ? (
      <Loader2 className="v2-btn__spinner" aria-hidden />
    ) : variant === 'back' && !icon ? (
      <ArrowLeft style={{ width: 14, height: 14, flexShrink: 0 }} aria-hidden />
    ) : (
      icon
    );

  return (
    <button
      type={type}
      className={[
        'v2-btn',
        `v2-btn--${variant}`,
        `v2-btn--${size}`,
        block ? 'v2-btn--block' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      style={style}
      {...rest}
    >
      {leading}
      {children != null && children !== false ? <span>{children}</span> : null}
      {!loading ? iconRight : null}
    </button>
  );
};

export default V2Button;
