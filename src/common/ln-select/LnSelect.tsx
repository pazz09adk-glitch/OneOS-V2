import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import './ln-select.css';

const SEARCH_THRESHOLD = 8;

export type LnSelectSize = 'filter' | 'form';

export interface LnSelectProps {
  id?: string;
  options: string[];
  /** 单选传 string；多选传 string[] */
  value: string | string[];
  onChange: (next: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  /** 空值时触发器文案，默认「全部」 */
  emptyLabel?: string;
  ariaLabel?: string;
  /** auto：选项 >8 显示搜索；true/false 强制 */
  searchable?: boolean | 'auto';
  /** 支持 Excel 同列粘贴（换行 / 制表符 / 逗号），精确匹配选项 */
  allowPaste?: boolean;
  /** 粘贴未匹配到选项的 token 仍写入多选草稿（车牌筛选用） */
  acceptUnmatchedPaste?: boolean;
  size?: LnSelectSize;
  disabled?: boolean;
  className?: string;
}

function asArray(value: string | string[]): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

/** 解析 Excel 同列 / 多车牌粘贴文本 */
export function parsePasteTokens(text: string): string[] {
  const raw = text.trim();
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const chunk of raw.split(/[\r\n\t]+/)) {
    for (const part of chunk.split(/[,，、]+/)) {
      const t = part.trim();
      if (!t) continue;
      const key = t.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(t);
    }
  }
  return out;
}

function matchOption(option: string, token: string): boolean {
  return option.replace(/\s+/g, '').toUpperCase() === token.replace(/\s+/g, '').toUpperCase();
}

export function LnSelect({
  id,
  options,
  value,
  onChange,
  multiple = false,
  placeholder = '请选择',
  emptyLabel = '全部',
  ariaLabel = '选择',
  searchable = 'auto',
  allowPaste = false,
  acceptUnmatchedPaste = false,
  size = 'filter',
  disabled = false,
  className = '',
}: LnSelectProps) {
  const reactId = useId();
  const fieldId = id || `ln-select-${reactId}`;
  const listId = `${fieldId}-listbox`;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(() => asArray(value));
  const [query, setQuery] = useState('');
  const [pasteHint, setPasteHint] = useState('');
  /** 下方空间不足时向上展开，避免面板「悬空错位」 */
  const [placement, setPlacement] = useState<'down' | 'up'>('down');
  const [isMobile, setIsMobile] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const selected = asArray(value);
  const showSearch = searchable === true
    || (searchable === 'auto' && options.length > SEARCH_THRESHOLD)
    || allowPaste;

  const summary = useMemo(() => {
    if (selected.length === 0) return '';
    if (!multiple) return selected[0] || '';
    if (selected.length <= 2) return selected.join('、');
    return `已选 ${selected.length} 项`;
  }, [selected, multiple]);

  const filtered = useMemo(() => {
    const base = options.slice();
    for (const d of draft) {
      if (!base.some((o) => matchOption(o, d))) base.push(d);
    }
    const q = query.trim();
    if (!q) return base;
    const nq = q.toUpperCase();
    return base.filter((o) => o.toUpperCase().includes(nq));
  }, [options, query, draft]);

  const syncDraftFromValue = useCallback(() => {
    setDraft(asArray(value));
    setQuery('');
    setPasteHint('');
  }, [value]);

  const updatePlacement = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const estimatedPanel = Math.min(320, window.innerHeight * 0.5);
    if (spaceBelow < estimatedPanel && spaceAbove > spaceBelow) {
      setPlacement('up');
    } else {
      setPlacement('down');
    }
  }, []);

  const close = useCallback((restore: boolean) => {
    if (restore) syncDraftFromValue();
    setOpen(false);
    setQuery('');
    setPasteHint('');
  }, [syncDraftFromValue]);

  const openPanel = () => {
    if (disabled) return;
    syncDraftFromValue();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    updatePlacement();
    const onScrollOrResize = () => updatePlacement();
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    const t = window.setTimeout(() => {
      updatePlacement();
      searchRef.current?.focus();
    }, 0);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [open, updatePlacement]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const t = event.target as Node;
      if (rootRef.current?.contains(t)) return;
      close(true);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener('pointerdown', onPointer, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const toggleOption = (opt: string) => {
    if (multiple) {
      setDraft((prev) => (
        prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
      ));
      return;
    }
    onChange(opt);
    setOpen(false);
    setQuery('');
    setPasteHint('');
  };

  const confirmMulti = () => {
    onChange(draft);
    setOpen(false);
    setQuery('');
    setPasteHint('');
  };

  const clearDraft = () => {
    setDraft([]);
    setPasteHint('');
    if (!multiple) {
      onChange('');
      setOpen(false);
    }
  };

  const applyPaste = (text: string) => {
    const tokens = parsePasteTokens(text);
    if (!tokens.length) return;
    const matched: string[] = [];
    const unmatched: string[] = [];
    for (const token of tokens) {
      const hit = options.find((o) => matchOption(o, token));
      if (hit) {
        if (!matched.includes(hit)) matched.push(hit);
      } else {
        unmatched.push(token);
      }
    }
    const extras = acceptUnmatchedPaste ? unmatched : [];
    if (multiple) {
      setDraft((prev) => {
        const next = [...prev];
        for (const m of [...matched, ...extras]) {
          if (!next.some((x) => matchOption(x, m))) next.push(m);
        }
        return next;
      });
    } else if (matched[0]) {
      onChange(matched[0]);
      setOpen(false);
    }
    setPasteHint(
      unmatched.length > 0
        ? (acceptUnmatchedPaste
          ? `已加入 ${matched.length + extras.length} 条，其中 ${unmatched.length} 条不在选项中`
          : `已匹配 ${matched.length} 条，${unmatched.length} 条未识别`)
        : matched.length > 0
          ? `已匹配 ${matched.length} 条`
          : '未识别到有效选项',
    );
    setQuery('');
  };

  const panel = open ? (
    <div
      ref={panelRef}
      id={listId}
      className={`ln-select-panel ln-select-panel--${placement}${isMobile ? ' is-sheet' : ''}`}
      role="listbox"
      aria-multiselectable={multiple || undefined}
      aria-label={ariaLabel}
    >
      {isMobile ? (
        <div className="ln-select-sheet-head">
          <span className="ln-select-sheet-grabber" aria-hidden />
          <div className="ln-select-sheet-title-row">
            <span className="ln-select-sheet-title">{ariaLabel || '选择选项'}</span>
            <button
              type="button"
              className="ln-select-sheet-close"
              aria-label="关闭"
              onClick={() => close(true)}
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      {showSearch ? (
        <div className="ln-select-search">
          <Search size={14} className="ln-select-search-icon" aria-hidden />
          <input
            ref={searchRef}
            className="ln-select-search-input"
            value={query}
            placeholder={allowPaste ? '搜索或粘贴同列…' : '搜索…'}
            aria-label={allowPaste ? '搜索或粘贴' : '搜索选项'}
            onChange={(e) => setQuery(e.target.value)}
            onPaste={allowPaste ? (e) => {
              const text = e.clipboardData.getData('text');
              if (!text || (!text.includes('\n') && !text.includes('\t'))) return;
              e.preventDefault();
              applyPaste(text);
            } : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && allowPaste && query.includes('\n')) {
                e.preventDefault();
                applyPaste(query);
              }
            }}
          />
        </div>
      ) : null}

      {pasteHint ? <p className="ln-select-paste-hint">{pasteHint}</p> : null}

      <div className="ln-select-options">
        {filtered.length === 0 ? (
          <div className="ln-select-empty">无匹配选项</div>
        ) : (
          filtered.map((opt) => {
            const active = draft.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={active}
                className={`ln-select-option ${active ? 'is-selected' : ''}`}
                onClick={() => toggleOption(opt)}
              >
                {multiple ? (
                  <span className={`ln-select-check ${active ? 'on' : ''}`} aria-hidden>
                    {active ? <Check size={12} /> : null}
                  </span>
                ) : null}
                <span className="ln-select-option-label">{opt}</span>
              </button>
            );
          })
        )}
      </div>

      {multiple ? (
        <div className="ln-select-actions">
          <button type="button" className="ln-select-btn ln-select-btn-ghost" onClick={clearDraft}>
            清空
          </button>
          <button type="button" className="ln-select-btn ln-select-btn-primary" onClick={confirmMulti}>
            确定
          </button>
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <div
      ref={rootRef}
      className={`ln-select ln-select-${size} ${open ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${isMobile && open ? 'is-sheet-open' : ''} ${className}`}
    >
      <button
        type="button"
        id={fieldId}
        className="ln-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? close(true) : openPanel())}
      >
        <span className={`ln-select-value ${summary ? '' : 'is-placeholder'}`}>
          {summary || emptyLabel || placeholder}
        </span>
        <ChevronDown size={14} className="ln-select-caret" aria-hidden />
      </button>

      {open && isMobile ? (
        <button
          type="button"
          className="ln-select-sheet-mask"
          aria-label="关闭选择面板"
          onClick={() => close(true)}
        />
      ) : null}

      {panel}
    </div>
  );
}
