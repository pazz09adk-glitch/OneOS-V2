import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, X } from 'lucide-react';
import { O2Field } from './Field';
import { O2RangeCalendarPanel } from './calendar/CalendarPanel';
import { useDismissOnFocusOutside } from './hooks/useDismissOnFocusOutside';
import type { DateRangeValue, O2FieldProps } from './types';

export type { DateRangeValue };

export type O2DateRangePickerProps = O2FieldProps & {
  startDate: string;
  endDate: string;
  onChange: (range: DateRangeValue) => void;
  startPlaceholder?: string;
  endPlaceholder?: string;
  allowClear?: boolean;
  ariaLabel?: string;
};

const POPOVER_MIN_WIDTH = 560;

export function O2DateRangePicker({
  label,
  required,
  help,
  error,
  className,
  style,
  size = 'md',
  disabled,
  id,
  startDate,
  endDate,
  onChange,
  startPlaceholder = '开始日期',
  endPlaceholder = '结束日期',
  allowClear = true,
  ariaLabel = '日期范围',
}: O2DateRangePickerProps) {
  const autoId = useId();
  const fieldId = id || autoId;
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: POPOVER_MIN_WIDTH });
  const anchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hasValue = Boolean(startDate || endDate);

  const dismiss = useCallback(() => setOpen(false), []);

  const updatePos = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const maxWidth = Math.max(160, window.innerWidth - 16);
    const width = Math.min(Math.max(rect.width, POPOVER_MIN_WIDTH), maxWidth);
    let left = rect.left;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - 8 - width);
    }
    if (left < 8) left = 8;
    let top = rect.bottom + 6;
    if (top + 380 > window.innerHeight - 8 && rect.top > 380) {
      top = Math.max(8, rect.top - 380 - 6);
    }
    setPos({ top, left, width });
  }, []);

  useDismissOnFocusOutside(open, [anchorRef, popoverRef], dismiss);

  useEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open, updatePos]);

  const openPicker = (which?: 'start' | 'end') => {
    if (disabled) return;
    setOpen(true);
    window.requestAnimationFrame(updatePos);
    void which;
  };

  const controlClass = [
    'o2-control',
    'o2-control--range',
    `o2-control--${size}`,
    open ? 'is-open' : '',
    error ? 'o2-control--error' : '',
    disabled ? 'is-disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const popover =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={popoverRef}
            className="o2-popover o2-popover--portal o2-popover--calendar o2-popover--range"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            role="dialog"
            aria-label={ariaLabel}
          >
            <O2RangeCalendarPanel
              startDate={startDate}
              endDate={endDate}
              onChange={onChange}
              onComplete={dismiss}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <O2Field
      label={label}
      required={required}
      help={help}
      error={error}
      className={className}
      style={style}
      htmlFor={`${fieldId}-start`}
    >
      <div className="o2-picker o2-picker--range" ref={anchorRef}>
        <div className={controlClass}>
          <button
            type="button"
            className="o2-range__part"
            id={`${fieldId}-start`}
            disabled={disabled}
            onClick={() => openPicker('start')}
            aria-label={startPlaceholder}
          >
            <Calendar size={14} aria-hidden />
            <span className={startDate ? 'o2-range__value' : 'o2-range__placeholder'}>
              {startDate || startPlaceholder}
            </span>
          </button>
          <span className="o2-range__sep">至</span>
          <button
            type="button"
            className="o2-range__part"
            id={`${fieldId}-end`}
            disabled={disabled}
            onClick={() => openPicker('end')}
            aria-label={endPlaceholder}
          >
            <Calendar size={14} aria-hidden />
            <span className={endDate ? 'o2-range__value' : 'o2-range__placeholder'}>
              {endDate || endPlaceholder}
            </span>
          </button>
          {allowClear && hasValue && !disabled ? (
            <button
              type="button"
              className="o2-control__icon-btn"
              aria-label="清空"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onChange({ startDate: '', endDate: '' });
                dismiss();
              }}
            >
              <X size={14} aria-hidden />
            </button>
          ) : null}
        </div>
        {popover}
      </div>
    </O2Field>
  );
}
