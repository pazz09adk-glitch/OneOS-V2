import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, X } from 'lucide-react';
import { O2Field } from './Field';
import { useDismissOnFocusOutside } from './hooks/useDismissOnFocusOutside';
import type { O2FieldProps, O2SelectOption } from './types';

export type O2MultiSelectProps = O2FieldProps & {
  value: string[];
  options: O2SelectOption[] | string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  ariaLabel?: string;
  maxTagCount?: number;
};

function normalizeOptions(options: O2SelectOption[] | string[]): O2SelectOption[] {
  return options.map((item) =>
    typeof item === 'string' ? { value: item, label: item } : item,
  );
}

export function O2MultiSelect({
  label,
  required,
  help,
  error,
  className,
  style,
  size = 'md',
  disabled,
  id,
  value,
  options,
  onChange,
  placeholder = '请选择（可多选）',
  searchable = true,
  ariaLabel,
  maxTagCount = 3,
}: O2MultiSelectProps) {
  const autoId = useId();
  const fieldId = id || autoId;
  const opts = useMemo(() => normalizeOptions(options), [options]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedSet = useMemo(() => new Set(value), [value]);
  const selectedLabels = useMemo(
    () => opts.filter((o) => selectedSet.has(o.value)),
    [opts, selectedSet],
  );

  const dismiss = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  useDismissOnFocusOutside(open, [anchorRef, popoverRef], dismiss);

  const updatePos = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 220) });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open, updatePos, query, value.length]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchable) return opts;
    return opts.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [opts, query, searchable]);

  const openPicker = () => {
    if (disabled) return;
    setOpen(true);
    window.requestAnimationFrame(() => {
      updatePos();
      inputRef.current?.focus();
    });
  };

  const toggle = (next: string) => {
    if (selectedSet.has(next)) {
      onChange(value.filter((v) => v !== next));
    } else {
      onChange([...value, next]);
    }
    setQuery('');
  };

  const removeTag = (next: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onChange(value.filter((v) => v !== next));
  };

  const clearAll = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onChange([]);
  };

  const visibleTags = selectedLabels.slice(0, maxTagCount);
  const overflow = selectedLabels.length - visibleTags.length;

  const controlClass = [
    'o2-control',
    'o2-control--picker',
    'o2-control--multi',
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
            className="o2-popover o2-popover--portal"
            role="listbox"
            aria-multiselectable
            aria-label={ariaLabel || (typeof label === 'string' ? label : '多选')}
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <div className="o2-popover__list">
              {filtered.length === 0 ? (
                <p className="o2-popover__empty">暂无匹配项</p>
              ) : (
                filtered.map((item) => {
                  const checked = selectedSet.has(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="option"
                      aria-selected={checked}
                      disabled={item.disabled}
                      className={`o2-popover__option ${checked ? 'is-checked' : ''}`}
                      onClick={() => !item.disabled && toggle(item.value)}
                    >
                      <span className={`o2-check ${checked ? 'is-on' : ''}`} aria-hidden>
                        {checked ? <Check size={12} /> : null}
                      </span>
                      <span className="o2-popover__option-label">{item.label}</span>
                    </button>
                  );
                })
              )}
            </div>
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
      htmlFor={fieldId}
    >
      <div className="o2-picker" ref={anchorRef}>
        <div className={controlClass} onClick={openPicker}>
          <div className="o2-multi-tags">
            {visibleTags.map((tag) => (
              <span key={tag.value} className="o2-tag">
                {tag.label}
                {!disabled ? (
                  <button
                    type="button"
                    className="o2-tag__remove"
                    aria-label={`移除${tag.label}`}
                    onClick={(e) => removeTag(tag.value, e)}
                  >
                    <X size={12} aria-hidden />
                  </button>
                ) : null}
              </span>
            ))}
            {overflow > 0 ? <span className="o2-tag o2-tag--more">+{overflow}</span> : null}
            <input
              ref={inputRef}
              id={fieldId}
              type="text"
              className="o2-control__input o2-multi-input"
              value={open && searchable ? query : ''}
              placeholder={selectedLabels.length === 0 ? placeholder : ''}
              readOnly={!searchable || !open}
              disabled={disabled}
              aria-expanded={open}
              aria-invalid={error ? true : undefined}
              onChange={(e) => {
                if (!searchable) return;
                setQuery(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={openPicker}
              onKeyDown={(e) => {
                if (e.key === 'Escape') dismiss();
                if (e.key === 'Backspace' && !query && value.length > 0) {
                  onChange(value.slice(0, -1));
                }
              }}
            />
          </div>
          {value.length > 0 && !disabled ? (
            <button
              type="button"
              className="o2-control__icon-btn"
              aria-label="清空全部"
              tabIndex={-1}
              onClick={clearAll}
            >
              <X size={14} aria-hidden />
            </button>
          ) : null}
          <ChevronDown
            size={14}
            className={`o2-control__chevron ${open ? 'is-open' : ''}`}
            aria-hidden
          />
        </div>
        {popover}
      </div>
    </O2Field>
  );
}
