import React, { useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import '../oneos-ds-form-feedback.css';

export type V2ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface V2ToastProps {
  open: boolean;
  message: string;
  title?: string;
  tone?: V2ToastTone;
  /** 自动关闭毫秒；0 表示不自动关 */
  duration?: number;
  onClose?: () => void;
}

const ICONS: Record<V2ToastTone, React.ReactNode> = {
  success: <CheckCircle2 size={16} className="v2-toast__icon" aria-hidden />,
  error: <AlertCircle size={16} className="v2-toast__icon" aria-hidden />,
  warning: <AlertTriangle size={16} className="v2-toast__icon" aria-hidden />,
  info: <Info size={16} className="v2-toast__icon" aria-hidden />,
};

/** 全局轻量 Toast：校验失败用 error，成功操作用 success */
export const V2Toast: React.FC<V2ToastProps> = ({
  open,
  message,
  title,
  tone = 'info',
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    if (!open || !duration || !onClose) return undefined;
    const t = window.setTimeout(() => onClose(), duration);
    return () => window.clearTimeout(t);
  }, [open, duration, onClose, message]);

  if (!open || !message) return null;

  return (
    <div
      className={`v2-toast is-${tone}`}
      role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      {ICONS[tone]}
      <div className="v2-toast__body">
        {title ? <p className="v2-toast__title">{title}</p> : null}
        <p className={title ? 'v2-toast__desc' : 'v2-toast__title'}>{message}</p>
      </div>
    </div>
  );
};

/** 校验失败后滚到首个 `data-field="<key>"` 区域并尝试聚焦内部控件 */
export function scrollToFirstInvalidField(
  fieldKey: string,
  root: ParentNode | null = typeof document !== 'undefined' ? document : null
): void {
  if (!root || !fieldKey) return;
  const el = root.querySelector(
    `[data-field="${fieldKey.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`
  ) as HTMLElement | null;
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const focusable = el.querySelector(
    'input:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ) as HTMLElement | null;
  window.setTimeout(() => {
    focusable?.focus?.({ preventScroll: true });
  }, 280);
}

/** 按声明顺序取第一个出错字段（长表单锚点） */
export function firstErrorFieldKey(
  errors: Record<string, string>,
  order: string[]
): string | null {
  for (const key of order) {
    if (errors[key]) return key;
  }
  const adj = Object.keys(errors).find((k) => k.startsWith('adj-'));
  if (adj) return adj;
  return Object.keys(errors)[0] || null;
}
