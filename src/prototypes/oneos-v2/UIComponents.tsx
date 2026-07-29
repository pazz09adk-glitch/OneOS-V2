import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  X,
  AlertCircle,
  RotateCcw,
  User,
  ArrowRight,
  Clock3,
  Inbox,
  SearchX,
  Lock,
  WifiOff,
  AlertTriangle,
  FileQuestion,
  RefreshCw
} from 'lucide-react';

// Custom Hook: Click Outside Listener
function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Format Helper
function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Month Helper
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper to add months
function addMonths(year: number, month: number, count: number) {
  const d = new Date(year, month + count, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

// Custom Hook: 是否启用 H5 形态（Bottom Sheet / 44px 触控等）
//
// 【定版判定 · 防 PC Web 误切 H5】
// 1. 仅以「视口宽度 ≤767」作为主信号（window.innerWidth）。
// 2. 禁止用「控件容器宽度 ≤767」——主从右栏 340px、表单单列在 PC 大屏也会误判。
// 3. data-viewport="h5" 仅认控件自身或祖先（或 html/body），禁止 document 全局任意节点命中。
export function useIsMobile(containerRef?: React.RefObject<HTMLElement | null>) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 767 : false,
  );

  useEffect(() => {
    const readScopedViewportH5 = () => {
      if (typeof document === 'undefined') return false;
      const el = containerRef?.current;
      if (el) {
        const host = el.closest('[data-viewport]');
        return host?.getAttribute('data-viewport') === 'h5';
      }
      const root =
        document.documentElement.getAttribute('data-viewport') ||
        document.body?.getAttribute('data-viewport');
      return root === 'h5';
    };

    const checkIsMobile = () => {
      const windowMobile = typeof window !== 'undefined' && window.innerWidth <= 767;
      setIsMobile(windowMobile || readScopedViewportH5());
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    const observer = new MutationObserver(checkIsMobile);
    if (typeof document !== 'undefined' && document.body) {
      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        childList: true,
        attributeFilter: ['data-viewport'],
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-viewport'],
      });
    }

    return () => {
      window.removeEventListener('resize', checkIsMobile);
      observer.disconnect();
    };
  }, [containerRef]);

  return isMobile;
}

// ============================================================================
// 1. V2CustomSelect (Single, Searchable, Multi-Select with Auto Ellipsis & Box Sizing)
// ============================================================================
export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

export interface V2SelectProps {
  options: SelectOption[];
  value: string | string[];
  onChange: (val: any) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const V2Select: React.FC<V2SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '请选择...',
  searchable = false,
  multiple = false,
  disabled = false,
  className = '',
  style
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchableTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(containerRef);

  useClickOutside(containerRef, () => setOpen(false));

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (val: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(val);
    }
    return value === val;
  };

  const handleSelect = (optVal: string) => {
    if (multiple && Array.isArray(value)) {
      if (value.includes(optVal)) {
        onChange(value.filter((v) => v !== optVal));
      } else {
        onChange([...value, optVal]);
      }
    } else {
      onChange(optVal);
      setOpen(false);
    }
  };

  const renderTriggerText = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return <span style={{ color: 'var(--ln-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{placeholder}</span>;
      return (
        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '4px', alignItems: 'center', overflow: 'hidden' }}>
          {value.map((v) => {
            const found = options.find((o) => o.value === v);
            const label = found ? found.label : v;
            return (
              <span
                key={v}
                title={label}
                style={{
                  padding: isMobile ? '4px 8px' : '2px 6px',
                  borderRadius: '6px',
                  fontSize: isMobile ? '12px' : '11px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: disabled ? 'var(--ln-surface-pearl)' : 'rgba(83, 58, 253, 0.15)',
                  border: disabled ? '1px solid var(--ln-hairline)' : 'none',
                  color: disabled ? 'var(--ln-muted)' : '#533AFD',
                  maxWidth: '120px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flexShrink: 0
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                {!disabled && (
                  <X
                    style={{ width: '12px', height: '12px', cursor: 'pointer', flexShrink: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(value.filter((val) => val !== v));
                    }}
                  />
                )}
              </span>
            );
          })}
        </div>
      );
    }

    const selectedOpt = options.find((o) => o.value === value);
    if (selectedOpt) {
      return (
        <span
          title={selectedOpt.label}
          style={{
            color: disabled ? 'var(--ln-muted)' : 'var(--ln-ink)',
            fontWeight: 500,
            display: 'block',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {selectedOpt.label}
        </span>
      );
    }
    return <span style={{ color: 'var(--ln-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{placeholder}</span>;
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <div
        onClick={() => !disabled && setOpen(!open)}
        style={{
          height: isMobile ? '44px' : '36px',
          minHeight: '44px',
          padding: '0 12px',
          borderRadius: '8px',
          border: `1px solid ${disabled ? 'var(--ln-hairline)' : (open ? '#533AFD' : 'var(--ln-hairline)')}`,
          background: disabled ? 'var(--ln-surface-pearl)' : 'var(--ln-surface-card)',
          color: disabled ? 'var(--ln-muted)' : 'var(--ln-ink)',
          fontSize: isMobile ? '14px' : '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: disabled ? 'none' : (open ? '0 0 0 3px rgba(83, 58, 253, 0.2)' : 'none'),
          opacity: disabled ? 0.75 : 1,
          transition: 'all 0.15s ease',
          boxSizing: 'border-box',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>{renderTriggerText()}</div>
        <ChevronDown
          style={{
            width: '14px',
            height: '14px',
            color: 'var(--ln-muted)',
            opacity: disabled ? 0.55 : 1,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            marginLeft: '8px',
            flexShrink: 0
          }}
        />
      </div>

      {open && isMobile && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 999,
          }}
        />
      )}

      {open && (
        <div
          style={
            isMobile
              ? {
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 'auto',
                  zIndex: 1000,
                  borderRadius: '20px 20px 0 0',
                  borderTop: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
                  padding: '16px',
                  maxHeight: '75vh',
                  overflowY: 'auto',
                  boxSizing: 'border-box'
                }
              : {
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  zIndex: 100,
                  borderRadius: '12px',
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                  padding: '6px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  boxSizing: 'border-box'
                }
          }
        >
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid var(--ln-hairline)' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ln-ink)' }}>选择选项</span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'var(--ln-surface-pearl)',
                  border: '1px solid var(--ln-hairline)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '16px', height: '16px', color: 'var(--ln-muted)' }} />
              </button>
            </div>
          )}

          {searchable && (
            <div style={{ padding: '4px', marginBottom: '8px', position: 'relative', boxSizing: 'border-box' }}>
              <Search
                style={{
                  width: '14px',
                  height: '14px',
                  position: 'absolute',
                  left: '12px',
                  top: isMobile ? '14px' : '12px',
                  color: 'var(--ln-muted)'
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchableTerm(e.target.value)}
                placeholder="搜索选项..."
                autoFocus
                style={{
                  width: '100%',
                  height: isMobile ? '38px' : '28px',
                  paddingLeft: '32px',
                  paddingRight: '8px',
                  fontSize: isMobile ? '13px' : '11px',
                  borderRadius: '6px',
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-pearl)',
                  color: 'var(--ln-ink)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--ln-muted)' }}>
              无匹配选项
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const active = isSelected(opt.value);
              return (
                <div
                  key={opt.value}
                  title={opt.label}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    padding: isMobile ? '12px 14px' : '8px 10px',
                    minHeight: isMobile ? '44px' : 'auto',
                    borderRadius: '8px',
                    fontSize: isMobile ? '14px' : '12px',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#533AFD' : 'var(--ln-ink)',
                    background: active ? 'rgba(83, 58, 253, 0.1)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'background-color 0.12s',
                    boxSizing: 'border-box',
                    marginBottom: isMobile ? '4px' : '0'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--ln-surface-strong)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                    {opt.label}
                  </span>
                  {active && <Check style={{ width: '16px', height: '16px', color: '#533AFD', flexShrink: 0, marginLeft: '8px' }} />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};


// ============================================================================
// 2. V2DatePicker (Custom Sleek Popover Calendar)
// ============================================================================
export interface V2DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const V2DatePicker: React.FC<V2DatePickerProps> = ({
  value,
  onChange,
  placeholder = '选择日期',
  disabled = false,
  className = '',
  style
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(containerRef);

  const parsedDate = value ? new Date(value) : new Date();
  const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  const [viewYear, setViewYear] = useState<number>(validDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(validDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  useClickOutside(containerRef, () => setOpen(false));

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (dayNum: number) => {
    const selected = new Date(viewYear, viewMonth, dayNum);
    const formatted = formatDate(selected);
    onChange(formatted);
    setOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(formatDate(today));
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
  };

  const todayStr = formatDate(new Date());

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%', boxSizing: 'border-box', ...style }}>
      <div
        onClick={() => !disabled && setOpen(!open)}
        style={{
          height: isMobile ? '44px' : '36px',
          minHeight: '44px',
          padding: '0 12px',
          borderRadius: '8px',
          border: `1px solid ${disabled ? 'var(--ln-hairline)' : (open ? '#533AFD' : 'var(--ln-hairline)')}`,
          background: disabled ? 'var(--ln-surface-pearl)' : 'var(--ln-surface-card)',
          color: disabled ? 'var(--ln-muted)' : 'var(--ln-ink)',
          fontSize: isMobile ? '14px' : '12px',
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: disabled ? 'none' : (open ? '0 0 0 3px rgba(83, 58, 253, 0.2)' : 'none'),
          opacity: disabled ? 0.75 : 1,
          transition: 'all 0.15s ease',
          boxSizing: 'border-box',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <span style={{ color: disabled ? 'var(--ln-muted)' : (value ? 'var(--ln-ink)' : 'var(--ln-muted)'), fontWeight: value && !disabled ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || placeholder}
        </span>
        <CalendarIcon style={{ width: '14px', height: '14px', color: disabled ? 'var(--ln-muted)' : '#533AFD', flexShrink: 0, marginLeft: '8px' }} />
      </div>

      {open && isMobile && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 999,
          }}
        />
      )}

      {open && (
        <div
          style={
            isMobile
              ? {
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 'auto',
                  zIndex: 1000,
                  width: '100%',
                  borderRadius: '20px 20px 0 0',
                  borderTop: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
                  padding: '20px 16px 28px 16px',
                  boxSizing: 'border-box'
                }
              : {
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 100,
                  width: '280px',
                  borderRadius: '16px',
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
                  padding: '16px',
                  userSelect: 'none',
                  boxSizing: 'border-box'
                }
          }
        >
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '14px', borderBottom: '1px solid var(--ln-hairline)' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ln-ink)' }}>选择日期</span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'var(--ln-surface-pearl)',
                  border: '1px solid var(--ln-hairline)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '16px', height: '16px', color: 'var(--ln-muted)' }} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: isMobile ? '15px' : '13px', fontWeight: 800, color: 'var(--ln-ink)' }}>
              {viewYear}年 {viewMonth + 1}月
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={handlePrevMonth} style={{ width: isMobile ? '32px' : '26px', height: isMobile ? '32px' : '26px', borderRadius: '6px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-pearl)', color: 'var(--ln-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
              </button>
              <button onClick={handleNextMonth} style={{ width: isMobile ? '32px' : '26px', height: isMobile ? '32px' : '26px', borderRadius: '6px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-pearl)', color: 'var(--ln-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: isMobile ? '12px' : '11px', fontWeight: 600, color: 'var(--ln-muted)', marginBottom: '8px' }}>
            <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: isMobile ? '6px' : '4px', textAlign: 'center' }}>
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} style={{ height: isMobile ? '38px' : '32px' }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateObj = new Date(viewYear, viewMonth, dayNum);
              const dateStr = formatDate(dateObj);
              const isSelected = value === dateStr;
              const isToday = todayStr === dateStr;

              return (
                <button
                  key={dayNum}
                  onClick={() => handleSelectDay(dayNum)}
                  style={{
                    height: isMobile ? '38px' : '32px',
                    borderRadius: '8px',
                    border: isToday && !isSelected ? '1px solid #533AFD' : 'none',
                    background: isSelected ? '#533AFD' : 'transparent',
                    color: isSelected ? '#FFFFFF' : isToday ? '#533AFD' : 'var(--ln-ink)',
                    fontSize: isMobile ? '13px' : '12px',
                    fontWeight: isSelected || isToday ? 700 : 500,
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--ln-surface-strong)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', marginTop: '14px', borderTop: '1px solid var(--ln-hairline)' }}>
            <button onClick={handleClear} style={{ background: 'none', border: 'none', fontSize: isMobile ? '13px' : '11px', color: 'var(--ln-muted)', cursor: 'pointer' }}>清除</button>
            <button onClick={handleToday} style={{ background: 'none', border: 'none', fontSize: isMobile ? '13px' : '11px', fontWeight: 700, color: '#533AFD', cursor: 'pointer' }}>选中今天</button>
          </div>
        </div>
      )}
    </div>
  );
};


// ============================================================================
// 3. V2DateRangePicker (Dual Box Mode: [Start] 至 [End] with Box Sizing)
// ============================================================================
export interface V2DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const V2DateRangePicker: React.FC<V2DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  disabled = false,
  className = '',
  style
}) => {
  const [open, setOpen] = useState(false);
  const [selectingPhase, setSelectingPhase] = useState<'start' | 'end'>('start');
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(containerRef);

  const startD = startDate ? new Date(startDate) : new Date();
  const [viewYear, setViewYear] = useState<number>(startD.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(startD.getMonth());

  useClickOutside(containerRef, () => setOpen(false));

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const handleDayClick = (dayNum: number) => {
    const selectedStr = formatDate(new Date(viewYear, viewMonth, dayNum));
    if (selectingPhase === 'start') {
      onChange(selectedStr, endDate && selectedStr <= endDate ? endDate : '');
      setSelectingPhase('end');
    } else {
      if (startDate && selectedStr < startDate) {
        onChange(selectedStr, '');
        setSelectingPhase('end');
      } else {
        onChange(startDate, selectedStr);
        setOpen(false);
        setSelectingPhase('start');
      }
    }
  };

  const applyPreset = (presetKey: string) => {
    const now = new Date();
    const todayStr = formatDate(now);

    if (presetKey === '7days') {
      const past7 = new Date(now.getTime() - 6 * 24 * 3600 * 1000);
      onChange(formatDate(past7), todayStr);
    } else if (presetKey === '30days') {
      const past30 = new Date(now.getTime() - 29 * 24 * 3600 * 1000);
      onChange(formatDate(past30), todayStr);
    } else if (presetKey === 'thisMonth') {
      const startM = new Date(now.getFullYear(), now.getMonth(), 1);
      const endM = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      onChange(formatDate(startM), formatDate(endM));
    } else if (presetKey === 'lastMonth') {
      const startLM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endLM = new Date(now.getFullYear(), now.getMonth(), 0);
      onChange(formatDate(startLM), formatDate(endLM));
    } else if (presetKey === 'thisYear') {
      const startY = new Date(now.getFullYear(), 0, 1);
      const endY = new Date(now.getFullYear(), 11, 31);
      onChange(formatDate(startY), formatDate(endY));
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%', boxSizing: 'border-box', ...style }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
        <div
          onClick={() => { if (!disabled) { setSelectingPhase('start'); setOpen(true); } }}
          style={{
            height: isMobile ? '44px' : '36px',
            minHeight: '44px',
            flex: 1,
            minWidth: 0,
            padding: '0 10px',
            borderRadius: '8px',
            border: `1px solid ${disabled ? 'var(--ln-hairline)' : (open && selectingPhase === 'start' ? '#533AFD' : 'var(--ln-hairline)')}`,
            background: disabled ? 'var(--ln-surface-pearl)' : 'var(--ln-surface-card)',
            color: disabled ? 'var(--ln-muted)' : 'var(--ln-ink)',
            fontSize: isMobile ? '13px' : '12px',
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: disabled ? 'none' : (open && selectingPhase === 'start' ? '0 0 0 3px rgba(83, 58, 253, 0.2)' : 'none'),
            opacity: disabled ? 0.75 : 1,
            boxSizing: 'border-box'
          }}
        >
          <span style={{ color: disabled ? 'var(--ln-muted)' : (startDate ? 'var(--ln-ink)' : 'var(--ln-muted)'), fontWeight: startDate && !disabled ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {startDate || '开始日期'}
          </span>
          <CalendarIcon style={{ width: '13px', height: '14px', color: disabled ? 'var(--ln-muted)' : '#533AFD', flexShrink: 0, marginLeft: '4px' }} />
        </div>

        {!isMobile && (
          <span style={{ fontSize: '12px', fontWeight: 800, color: disabled ? 'var(--ln-muted)' : 'var(--ln-body)', flexShrink: 0 }}>
            至
          </span>
        )}

        <div
          onClick={() => { if (!disabled) { setSelectingPhase('end'); setOpen(true); } }}
          style={{
            height: isMobile ? '44px' : '36px',
            minHeight: '44px',
            flex: 1,
            minWidth: 0,
            padding: '0 10px',
            borderRadius: '8px',
            border: `1px solid ${disabled ? 'var(--ln-hairline)' : (open && selectingPhase === 'end' ? '#533AFD' : 'var(--ln-hairline)')}`,
            background: disabled ? 'var(--ln-surface-pearl)' : 'var(--ln-surface-card)',
            color: disabled ? 'var(--ln-muted)' : 'var(--ln-ink)',
            fontSize: isMobile ? '13px' : '12px',
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: disabled ? 'none' : (open && selectingPhase === 'end' ? '0 0 0 3px rgba(83, 58, 253, 0.2)' : 'none'),
            opacity: disabled ? 0.75 : 1,
            boxSizing: 'border-box'
          }}
        >
          <span style={{ color: disabled ? 'var(--ln-muted)' : (endDate ? 'var(--ln-ink)' : 'var(--ln-muted)'), fontWeight: endDate && !disabled ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {endDate || '结束日期'}
          </span>
          <CalendarIcon style={{ width: '13px', height: '14px', color: disabled ? 'var(--ln-muted)' : '#533AFD', flexShrink: 0, marginLeft: '4px' }} />
        </div>
      </div>

      {open && isMobile && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 999,
          }}
        />
      )}

      {open && (
        <div
          style={
            isMobile
              ? {
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 'auto',
                  zIndex: 1000,
                  width: '100%',
                  borderRadius: '20px 20px 0 0',
                  borderTop: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
                  padding: '20px 16px 28px 16px',
                  boxSizing: 'border-box'
                }
              : {
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 100,
                  width: '300px',
                  borderRadius: '16px',
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
                  padding: '16px',
                  boxSizing: 'border-box'
                }
          }
        >
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid var(--ln-hairline)' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ln-ink)' }}>选择日期范围</span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'var(--ln-surface-pearl)',
                  border: '1px solid var(--ln-hairline)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '16px', height: '16px', color: 'var(--ln-muted)' }} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--ln-hairline)' }}>
            {[
              { key: '7days', label: '近7天' },
              { key: '30days', label: '近30天' },
              { key: 'thisMonth', label: '本月' },
              { key: 'lastMonth', label: '上月' },
              { key: 'thisYear', label: '今年' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => applyPreset(p.key)}
                style={{
                  padding: isMobile ? '6px 12px' : '3px 8px',
                  minHeight: isMobile ? '36px' : 'auto',
                  borderRadius: '6px',
                  fontSize: isMobile ? '12px' : '11px',
                  fontWeight: 600,
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-pearl)',
                  color: 'var(--ln-body)',
                  cursor: 'pointer'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: isMobile ? '14px' : '13px', fontWeight: 800, color: 'var(--ln-ink)' }}>
              {viewYear}年 {viewMonth + 1}月 ({selectingPhase === 'start' ? '选择开始' : '选择结束'})
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={handlePrevMonth} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--ln-hairline)', cursor: 'pointer', background: 'var(--ln-surface-pearl)' }}>
                <ChevronLeft style={{ width: '14px', height: '14px' }} />
              </button>
              <button onClick={handleNextMonth} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--ln-hairline)', cursor: 'pointer', background: 'var(--ln-surface-pearl)' }}>
                <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--ln-muted)', marginBottom: '6px' }}>
            <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} style={{ height: isMobile ? '36px' : '30px' }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = formatDate(new Date(viewYear, viewMonth, dayNum));
              const isStart = startDate === dateStr;
              const isEnd = endDate === dateStr;
              const inRange = startDate && endDate && dateStr > startDate && dateStr < endDate;

              return (
                <button
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  style={{
                    height: isMobile ? '36px' : '30px',
                    borderRadius: isStart ? '6px 0 0 6px' : isEnd ? '0 6px 6px 0' : inRange ? '0' : '6px',
                    background: isStart || isEnd ? '#533AFD' : inRange ? 'rgba(83, 58, 253, 0.18)' : 'transparent',
                    color: isStart || isEnd ? '#FFFFFF' : inRange ? '#533AFD' : 'var(--ln-ink)',
                    fontSize: isMobile ? '13px' : '12px',
                    fontWeight: isStart || isEnd ? 700 : 500,
                    fontFamily: 'monospace',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


// ============================================================================
// 4. V2SingleInputDateRangePicker (Single Input Box + Dual Calendar Side-by-Side)
// ============================================================================
export interface V2SingleInputDateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const V2SingleInputDateRangePicker: React.FC<V2SingleInputDateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  placeholder = '开始日期 至 结束日期',
  disabled = false,
  className = '',
  style
}) => {
  const [open, setOpen] = useState(false);
  const [selectingPhase, setSelectingPhase] = useState<'start' | 'end'>('start');
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(containerRef);

  const startD = startDate ? new Date(startDate) : new Date();
  const [viewYear, setViewYear] = useState<number>(startD.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(startD.getMonth());

  const m1 = { year: viewYear, month: viewMonth };
  const m2 = addMonths(viewYear, viewMonth, 1);

  useClickOutside(containerRef, () => setOpen(false));

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDayClick = (y: number, m: number, dNum: number) => {
    const dateStr = formatDate(new Date(y, m, dNum));
    if (selectingPhase === 'start') {
      onChange(dateStr, endDate && dateStr <= endDate ? endDate : '');
      setSelectingPhase('end');
    } else {
      if (startDate && dateStr < startDate) {
        onChange(dateStr, '');
        setSelectingPhase('end');
      } else {
        onChange(startDate, dateStr);
        setOpen(false);
        setSelectingPhase('start');
      }
    }
  };

  const applyPreset = (presetKey: string) => {
    const now = new Date();
    const todayStr = formatDate(now);

    if (presetKey === '7days') {
      const past7 = new Date(now.getTime() - 6 * 24 * 3600 * 1000);
      onChange(formatDate(past7), todayStr);
    } else if (presetKey === '30days') {
      const past30 = new Date(now.getTime() - 29 * 24 * 3600 * 1000);
      onChange(formatDate(past30), todayStr);
    } else if (presetKey === 'thisMonth') {
      const startM = new Date(now.getFullYear(), now.getMonth(), 1);
      const endM = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      onChange(formatDate(startM), formatDate(endM));
    } else if (presetKey === 'lastMonth') {
      const startLM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endLM = new Date(now.getFullYear(), now.getMonth(), 0);
      onChange(formatDate(startLM), formatDate(endLM));
    } else if (presetKey === 'thisYear') {
      const startY = new Date(now.getFullYear(), 0, 1);
      const endY = new Date(now.getFullYear(), 11, 31);
      onChange(formatDate(startY), formatDate(endY));
    }
    setOpen(false);
  };

  const renderSingleMonthGrid = (y: number, m: number) => {
    const daysInM = getDaysInMonth(y, m);
    const firstDay = new Date(y, m, 1).getDay();

    return (
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 800, textAlign: 'center', color: 'var(--ln-ink)', marginBottom: '10px' }}>
          {y}年 {m + 1}月
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--ln-muted)', marginBottom: '6px' }}>
          <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
          {Array.from({ length: firstDay }).map((_, idx) => (
            <div key={`empty-${idx}`} style={{ height: isMobile ? '34px' : '28px' }} />
          ))}

          {Array.from({ length: daysInM }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = formatDate(new Date(y, m, dayNum));
            const isStart = startDate === dateStr;
            const isEnd = endDate === dateStr;
            const inRange = startDate && endDate && dateStr > startDate && dateStr < endDate;

            return (
              <button
                key={dayNum}
                onClick={() => handleDayClick(y, m, dayNum)}
                style={{
                  height: isMobile ? '34px' : '28px',
                  borderRadius: isStart ? '6px 0 0 6px' : isEnd ? '0 6px 6px 0' : inRange ? '0' : '6px',
                  background: isStart || isEnd ? '#533AFD' : inRange ? 'rgba(83, 58, 253, 0.18)' : 'transparent',
                  color: isStart || isEnd ? '#FFFFFF' : inRange ? '#533AFD' : 'var(--ln-ink)',
                  fontSize: '11px',
                  fontWeight: isStart || isEnd ? 700 : 500,
                  fontFamily: 'monospace',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const displayText = startDate && endDate ? `${startDate}  至  ${endDate}` : startDate ? `${startDate}  至  结束日期` : '';

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%', boxSizing: 'border-box', ...style }}>
      <div
        onClick={() => !disabled && setOpen(!open)}
        style={{
          height: isMobile ? '44px' : '36px',
          minHeight: '44px',
          padding: '0 12px',
          borderRadius: '8px',
          border: `1px solid ${disabled ? 'var(--ln-hairline)' : (open ? '#533AFD' : 'var(--ln-hairline)')}`,
          background: disabled ? 'var(--ln-surface-pearl)' : 'var(--ln-surface-card)',
          color: disabled ? 'var(--ln-muted)' : 'var(--ln-ink)',
          fontSize: isMobile ? '13px' : '12px',
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: disabled ? 'none' : (open ? '0 0 0 3px rgba(83, 58, 253, 0.2)' : 'none'),
          opacity: disabled ? 0.75 : 1,
          transition: 'all 0.15s ease',
          boxSizing: 'border-box',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <span style={{ color: disabled ? 'var(--ln-muted)' : (displayText ? 'var(--ln-ink)' : 'var(--ln-muted)'), fontWeight: displayText && !disabled ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayText || placeholder}
        </span>
        <CalendarIcon style={{ width: '14px', height: '14px', color: disabled ? 'var(--ln-muted)' : '#533AFD', flexShrink: 0, marginLeft: '8px' }} />
      </div>

      {open && isMobile && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 999,
          }}
        />
      )}

      {open && (
        <div
          style={
            isMobile
              ? {
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 'auto',
                  zIndex: 1000,
                  width: '100%',
                  borderRadius: '20px 20px 0 0',
                  borderTop: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
                  padding: '16px',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  boxSizing: 'border-box'
                }
              : {
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 100,
                  width: '560px',
                  borderRadius: '16px',
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
                  padding: '16px',
                  userSelect: 'none',
                  boxSizing: 'border-box'
                }
          }
        >
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid var(--ln-hairline)' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ln-ink)' }}>选择双月日期范围</span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'var(--ln-surface-pearl)',
                  border: '1px solid var(--ln-hairline)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '16px', height: '16px', color: 'var(--ln-muted)' }} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '12px', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { key: '7days', label: '近7天' },
                { key: '30days', label: '近30天' },
                { key: 'thisMonth', label: '本月' },
                { key: 'lastMonth', label: '上月' },
                { key: 'thisYear', label: '今年' },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p.key)}
                  style={{
                    padding: isMobile ? '6px 10px' : '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: '1px solid var(--ln-hairline)',
                    background: 'var(--ln-surface-pearl)',
                    color: 'var(--ln-body)',
                    cursor: 'pointer'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#533AFD', fontWeight: 600 }}>
                {selectingPhase === 'start' ? '请选择开始日期' : '请选择结束日期'}
              </span>
              <button onClick={handlePrevMonth} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-pearl)', cursor: 'pointer' }}>
                <ChevronLeft style={{ width: '14px', height: '14px' }} />
              </button>
              <button onClick={handleNextMonth} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-pearl)', cursor: 'pointer' }}>
                <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '24px' }}>
            {renderSingleMonthGrid(m1.year, m1.month)}
            <div style={{ width: isMobile ? '100%' : '1px', height: isMobile ? '1px' : 'auto', background: 'var(--ln-hairline)' }} />
            {renderSingleMonthGrid(m2.year, m2.month)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--ln-hairline)', paddingTop: '12px', marginTop: '14px' }}>
            <button
              onClick={() => { onChange('', ''); setSelectingPhase('start'); }}
              style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--ln-muted)', cursor: 'pointer' }}
            >
              清空区间
            </button>
            <button
              onClick={() => setOpen(false)}
              className="ds-btn-primary"
              style={{ padding: '6px 16px', fontSize: '12px', minHeight: '36px' }}
            >
              完成选择
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


// ============================================================================
// 5. V2TimePicker (Custom Time Popover Picker)
// ============================================================================
export interface V2TimePickerProps {
  value: string; // HH:mm:ss
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const V2TimePicker: React.FC<V2TimePickerProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  style
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(containerRef);

  useClickOutside(containerRef, () => setOpen(false));

  const quickSlots = ['08:30:00', '09:00:00', '10:00:00', '12:00:00', '14:30:00', '16:00:00', '18:00:00'];

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%', boxSizing: 'border-box', ...style }}>
      <div
        onClick={() => !disabled && setOpen(!open)}
        style={{
          height: isMobile ? '44px' : '36px',
          minHeight: '44px',
          padding: '0 12px',
          borderRadius: '8px',
          border: `1px solid ${disabled ? 'var(--ln-hairline)' : (open ? '#533AFD' : 'var(--ln-hairline)')}`,
          background: disabled ? 'var(--ln-surface-pearl)' : 'var(--ln-surface-card)',
          color: disabled ? 'var(--ln-muted)' : 'var(--ln-ink)',
          fontSize: isMobile ? '13px' : '12px',
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: disabled ? 'none' : (open ? '0 0 0 3px rgba(83, 58, 253, 0.2)' : 'none'),
          opacity: disabled ? 0.75 : 1,
          boxSizing: 'border-box',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <span style={{ color: disabled ? 'var(--ln-muted)' : (value ? 'var(--ln-ink)' : 'var(--ln-muted)'), fontWeight: value && !disabled ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || '选择时间'}
        </span>
        <ClockIcon style={{ width: '14px', height: '14px', color: disabled ? 'var(--ln-muted)' : '#533AFD', flexShrink: 0, marginLeft: '8px' }} />
      </div>

      {open && isMobile && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 999,
          }}
        />
      )}

      {open && (
        <div
          style={
            isMobile
              ? {
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 'auto',
                  zIndex: 1000,
                  width: '100%',
                  borderRadius: '20px 20px 0 0',
                  borderTop: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
                  padding: '16px 16px 24px 16px',
                  boxSizing: 'border-box'
                }
              : {
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 100,
                  width: '220px',
                  borderRadius: '12px',
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                  padding: '12px',
                  boxSizing: 'border-box'
                }
          }
        >
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid var(--ln-hairline)' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ln-ink)' }}>选择时刻</span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'var(--ln-surface-pearl)',
                  border: '1px solid var(--ln-hairline)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '16px', height: '16px', color: 'var(--ln-muted)' }} />
              </button>
            </div>
          )}

          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ln-muted)', marginBottom: '8px' }}>
            快捷时刻预设
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {quickSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => { onChange(slot); setOpen(false); }}
                style={{
                  padding: isMobile ? '8px 12px' : '4px 8px',
                  minHeight: isMobile ? '38px' : 'auto',
                  borderRadius: '6px',
                  fontSize: isMobile ? '12px' : '11px',
                  fontFamily: 'monospace',
                  border: '1px solid var(--ln-hairline)',
                  background: value === slot ? '#533AFD' : 'var(--ln-surface-pearl)',
                  color: value === slot ? '#FFFFFF' : 'var(--ln-ink)',
                  cursor: 'pointer'
                }}
              >
                {slot.substring(0, 5)}
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--ln-hairline)', paddingTop: '8px', display: 'flex', gap: '4px' }}>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="HH:mm:ss"
              style={{
                width: '100%',
                height: isMobile ? '38px' : '28px',
                fontSize: isMobile ? '13px' : '12px',
                fontFamily: 'monospace',
                padding: '0 8px',
                borderRadius: '6px',
                border: '1px solid var(--ln-hairline)',
                background: 'var(--ln-surface-pearl)',
                color: 'var(--ln-ink)',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};


// ============================================================================
// 6. V2SingleInputTimeRangePicker (Single Input Box Time Range Picker)
// ============================================================================
export interface V2SingleInputTimeRangePickerProps {
  startTime: string;
  endTime: string;
  onChange: (start: string, end: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const V2SingleInputTimeRangePicker: React.FC<V2SingleInputTimeRangePickerProps> = ({
  startTime,
  endTime,
  onChange,
  placeholder = '开始时间 至 结束时间',
  disabled = false,
  className = '',
  style
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(containerRef);

  useClickOutside(containerRef, () => setOpen(false));

  const quickRanges = [
    { start: '08:30:00', end: '12:00:00', label: '上午班 08:30-12:00' },
    { start: '13:00:00', end: '17:30:00', label: '下午班 13:00-17:30' },
    { start: '08:30:00', end: '17:30:00', label: '全天班 08:30-17:30' },
    { start: '18:00:00', end: '22:00:00', label: '夜班 18:00-22:00' },
  ];

  const displayText = startTime && endTime ? `${startTime.substring(0, 5)}  至  ${endTime.substring(0, 5)}` : '';

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%', boxSizing: 'border-box', ...style }}>
      <div
        onClick={() => !disabled && setOpen(!open)}
        style={{
          height: isMobile ? '44px' : '36px',
          minHeight: '44px',
          padding: '0 12px',
          borderRadius: '8px',
          border: `1px solid ${disabled ? 'var(--ln-hairline)' : (open ? '#533AFD' : 'var(--ln-hairline)')}`,
          background: disabled ? 'var(--ln-surface-pearl)' : 'var(--ln-surface-card)',
          color: disabled ? 'var(--ln-muted)' : 'var(--ln-ink)',
          fontSize: isMobile ? '13px' : '12px',
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: disabled ? 'none' : (open ? '0 0 0 3px rgba(83, 58, 253, 0.2)' : 'none'),
          opacity: disabled ? 0.75 : 1,
          boxSizing: 'border-box',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <span style={{ color: disabled ? 'var(--ln-muted)' : (displayText ? 'var(--ln-ink)' : 'var(--ln-muted)'), fontWeight: displayText && !disabled ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayText || placeholder}
        </span>
        <ClockIcon style={{ width: '14px', height: '14px', color: disabled ? 'var(--ln-muted)' : '#533AFD', flexShrink: 0, marginLeft: '8px' }} />
      </div>

      {open && isMobile && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 999,
          }}
        />
      )}

      {open && (
        <div
          style={
            isMobile
              ? {
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 'auto',
                  zIndex: 1000,
                  width: '100%',
                  borderRadius: '20px 20px 0 0',
                  borderTop: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
                  padding: '16px 16px 24px 16px',
                  boxSizing: 'border-box'
                }
              : {
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 100,
                  width: '260px',
                  borderRadius: '14px',
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
                  padding: '12px',
                  boxSizing: 'border-box'
                }
          }
        >
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid var(--ln-hairline)' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ln-ink)' }}>选择服务/班次时间段</span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'var(--ln-surface-pearl)',
                  border: '1px solid var(--ln-hairline)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '16px', height: '16px', color: 'var(--ln-muted)' }} />
              </button>
            </div>
          )}

          <div style={{ fontSize: '11px', fontWeight: 700, color: '#533AFD', marginBottom: '8px' }}>
            常用服务/班次时间段预设
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            {quickRanges.map((r) => (
              <button
                key={r.label}
                onClick={() => { onChange(r.start, r.end); setOpen(false); }}
                style={{
                  padding: isMobile ? '10px 12px' : '6px 10px',
                  minHeight: isMobile ? '40px' : 'auto',
                  borderRadius: '6px',
                  fontSize: isMobile ? '13px' : '11px',
                  textAlign: 'left',
                  border: '1px solid var(--ln-hairline)',
                  background: startTime === r.start && endTime === r.end ? 'rgba(83, 58, 253, 0.15)' : 'var(--ln-surface-pearl)',
                  color: startTime === r.start && endTime === r.end ? '#533AFD' : 'var(--ln-ink)',
                  fontWeight: startTime === r.start && endTime === r.end ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--ln-hairline)', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="text"
              value={startTime}
              onChange={(e) => onChange(e.target.value, endTime)}
              placeholder="08:30:00"
              style={{ width: '45%', height: isMobile ? '38px' : '28px', fontSize: '12px', fontFamily: 'monospace', padding: '0 8px', borderRadius: '6px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-pearl)', color: 'var(--ln-ink)', boxSizing: 'border-box' }}
            />
            <span style={{ fontSize: '12px', color: 'var(--ln-muted)' }}>至</span>
            <input
              type="text"
              value={endTime}
              onChange={(e) => onChange(startTime, e.target.value)}
              placeholder="17:30:00"
              style={{ width: '45%', height: isMobile ? '38px' : '28px', fontSize: '12px', fontFamily: 'monospace', padding: '0 8px', borderRadius: '6px', border: '1px solid var(--ln-hairline)', background: 'var(--ln-surface-pearl)', color: 'var(--ln-ink)', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};


// ============================================================================
// 7. V2Radio & V2RadioGroup (Sleek Custom Radio Controls)
// ============================================================================
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface V2RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  type?: 'circle' | 'card' | 'segmented';
  className?: string;
  style?: React.CSSProperties;
}

export const V2RadioGroup: React.FC<V2RadioGroupProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  type = 'circle',
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(containerRef);

  if (type === 'segmented') {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          display: 'inline-flex',
          padding: '3px',
          borderRadius: '10px',
          background: 'var(--ln-surface-pearl)',
          border: '1px solid var(--ln-hairline)',
          gap: '2px',
          width: isMobile ? '100%' : 'auto',
          boxSizing: 'border-box',
          opacity: disabled ? 0.7 : 1,
          ...style
        }}
      >
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(opt.value)}
              style={{
                flex: isMobile ? 1 : 'none',
                padding: isMobile ? '10px 12px' : '6px 14px',
                minHeight: isMobile ? '40px' : 'auto',
                borderRadius: '8px',
                fontSize: isMobile ? '13px' : '12px',
                fontWeight: active ? 700 : 500,
                color: active ? (disabled ? 'var(--ln-muted)' : '#FFFFFF') : 'var(--ln-body)',
                background: active ? (disabled ? 'var(--ln-hairline-strong)' : '#533AFD') : 'transparent',
                border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                boxShadow: active && !disabled ? '0 2px 6px rgba(83, 58, 253, 0.25)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: type === 'card' ? '10px' : '16px',
        alignItems: 'center',
        boxSizing: 'border-box',
        width: isMobile ? '100%' : 'auto',
        ...style
      }}
    >
      {options.map((opt) => {
        const active = value === opt.value;

        if (type === 'card') {
          return (
            <div
              key={opt.value}
              onClick={() => !disabled && onChange(opt.value)}
              style={{
                padding: isMobile ? '12px 16px' : '10px 14px',
                minHeight: '44px',
                width: isMobile ? '100%' : 'auto',
                borderRadius: '10px',
                border: `1px solid ${disabled ? 'var(--ln-hairline)' : (active ? '#533AFD' : 'var(--ln-hairline)')}`,
                background: disabled ? 'var(--ln-surface-pearl)' : (active ? 'rgba(83, 58, 253, 0.08)' : 'var(--ln-surface-card)'),
                boxShadow: active && !disabled ? '0 0 0 1px #533AFD' : 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.15s ease',
                boxSizing: 'border-box'
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `1.5px solid ${disabled ? 'var(--ln-hairline-strong)' : (active ? '#533AFD' : 'var(--ln-hairline-strong)')}`,
                  background: disabled ? 'var(--ln-surface-pearl)' : 'var(--ln-surface-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {active && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: disabled ? 'var(--ln-muted)' : '#533AFD' }} />}
              </div>
              <div>
                <div style={{ fontSize: isMobile ? '13px' : '12px', fontWeight: active ? 700 : 500, color: disabled ? 'var(--ln-muted)' : (active ? '#533AFD' : 'var(--ln-ink)') }}>
                  {opt.label}
                </div>
                {opt.description && (
                  <div style={{ fontSize: '11px', color: 'var(--ln-muted)' }}>{opt.description}</div>
                )}
              </div>
            </div>
          );
        }

        return (
          <label
            key={opt.value}
            onClick={() => !disabled && onChange(opt.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: isMobile ? '13px' : '12px',
              fontWeight: active ? 600 : 400,
              color: disabled ? 'var(--ln-muted)' : (active ? '#533AFD' : 'var(--ln-ink)'),
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.7 : 1,
              userSelect: 'none',
              minHeight: '44px',
              padding: isMobile ? '4px 8px' : '0'
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: `1.5px solid ${disabled ? 'var(--ln-hairline-strong)' : (active ? '#533AFD' : 'var(--ln-hairline-strong)')}`,
                background: active ? (disabled ? 'var(--ln-surface-pearl)' : 'rgba(83, 58, 253, 0.12)') : (disabled ? 'var(--ln-surface-pearl)' : 'var(--ln-surface-card)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              {active && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: disabled ? 'var(--ln-muted)' : '#533AFD' }} />}
            </div>
            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
};


// ============================================================================
// 8. V2Checkbox & V2CheckboxGroup (Custom Checkbox with Check Icon)
// ============================================================================
export interface CheckboxOption {
  value: string;
  label: string;
}

export interface V2CheckboxGroupProps {
  options: CheckboxOption[];
  value: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const V2CheckboxGroup: React.FC<V2CheckboxGroupProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(containerRef);

  const toggle = (optVal: string) => {
    if (value.includes(optVal)) {
      onChange(value.filter((v) => v !== optVal));
    } else {
      onChange([...value, optVal]);
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {options.map((opt) => {
        const checked = value.includes(opt.value);
        return (
          <label
            key={opt.value}
            onClick={() => !disabled && toggle(opt.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: isMobile ? '13px' : '12px',
              fontWeight: checked ? 600 : 400,
              color: disabled ? 'var(--ln-muted)' : (checked ? '#533AFD' : 'var(--ln-ink)'),
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.7 : 1,
              userSelect: 'none',
              minHeight: '44px',
              padding: isMobile ? '4px 8px' : '0'
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '5px',
                border: `1.5px solid ${disabled ? 'var(--ln-hairline-strong)' : (checked ? '#533AFD' : 'var(--ln-hairline-strong)')}`,
                background: checked ? (disabled ? 'var(--ln-muted)' : '#533AFD') : (disabled ? 'var(--ln-surface-pearl)' : 'var(--ln-surface-card)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              {checked && <Check style={{ width: '12px', height: '12px', color: '#FFFFFF' }} />}
            </div>
            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
};


// ============================================================================
// 9. V2Switch (Sleek Smooth Toggle Switch)
// ============================================================================
export interface V2SwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  subLabel?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const V2Switch: React.FC<V2SwitchProps> = ({
  checked,
  onChange,
  label,
  subLabel,
  disabled = false,
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(containerRef);

  return (
    <div
      ref={containerRef}
      className={className}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        gap: '12px',
        minHeight: '44px',
        padding: isMobile ? '4px 0' : '0',
        opacity: disabled ? 0.65 : 1,
        boxSizing: 'border-box',
        ...style
      }}
    >
      {(label || subLabel) && (
        <div>
          {label && <div style={{ fontSize: isMobile ? '13px' : '12px', fontWeight: 600, color: disabled ? 'var(--ln-muted)' : 'var(--ln-ink)' }}>{label}</div>}
          {subLabel && <div style={{ fontSize: '11px', color: 'var(--ln-muted)' }}>{subLabel}</div>}
        </div>
      )}

      <div
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '9999px',
          padding: '2px',
          border: `1px solid ${disabled ? 'var(--ln-hairline)' : (checked ? '#533AFD' : 'var(--ln-hairline)')}`,
          background: checked ? (disabled ? 'var(--ln-hairline-strong)' : '#533AFD') : (disabled ? 'var(--ln-surface-pearl)' : 'var(--ln-surface-strong)'),
          boxShadow: checked && !disabled ? '0 2px 6px rgba(83, 58, 253, 0.3)' : 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          flexShrink: 0
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: disabled ? '#E2E8F0' : '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: checked ? 'translateX(20px)' : 'translateX(0)'
          }}
        />
      </div>
    </div>
  );
};


// ============================================================================
// 10. V2Steps (Horizontal & Vertical Step Bar)
// ============================================================================
export interface StepItem {
  title: React.ReactNode;
  description?: React.ReactNode;
  subDescription?: React.ReactNode;
  icon?: React.ReactNode;
  status?: 'finish' | 'process' | 'wait' | 'error';
}

export interface V2StepsProps {
  current: number; // 0-indexed active step
  items: StepItem[];
  direction?: 'horizontal' | 'vertical';
  status?: 'finish' | 'process' | 'wait' | 'error';
  disabled?: boolean;
  onChange?: (current: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const V2Steps: React.FC<V2StepsProps> = ({
  current,
  items,
  direction = 'horizontal',
  status: globalCurrentStatus = 'process',
  disabled = false,
  onChange,
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(containerRef);

  const effectiveDirection = isMobile && direction === 'horizontal' ? 'vertical' : direction;

  const getStepStatus = (index: number, item: StepItem): 'finish' | 'process' | 'wait' | 'error' => {
    if (item.status) return item.status;
    if (index < current) return 'finish';
    if (index === current) return globalCurrentStatus;
    return 'wait';
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexDirection: effectiveDirection === 'vertical' ? 'column' : 'row',
        width: '100%',
        gap: effectiveDirection === 'vertical' ? '0px' : '16px',
        boxSizing: 'border-box',
        opacity: disabled ? 0.65 : 1,
        cursor: disabled ? 'not-allowed' : 'default',
        ...style
      }}
    >
      {items.map((item, idx) => {
        const stepStatus = getStepStatus(idx, item);
        const isLast = idx === items.length - 1;

        let circleBg = 'var(--ln-surface-card)';
        let circleBorder = 'var(--ln-hairline-strong)';
        let circleColor = 'var(--ln-muted)';
        let titleColor = 'var(--ln-muted)';
        let shadow = 'none';

        if (disabled) {
          circleBg = 'var(--ln-surface-pearl)';
          circleBorder = 'var(--ln-hairline-strong)';
          circleColor = 'var(--ln-muted)';
          titleColor = 'var(--ln-muted)';
          shadow = 'none';
        } else if (stepStatus === 'finish') {
          circleBg = '#533AFD';
          circleBorder = '#533AFD';
          circleColor = '#FFFFFF';
          titleColor = 'var(--ln-ink)';
        } else if (stepStatus === 'process') {
          circleBg = '#533AFD';
          circleBorder = '#533AFD';
          circleColor = '#FFFFFF';
          titleColor = '#533AFD';
          shadow = '0 0 0 4px rgba(83, 58, 253, 0.18)';
        } else if (stepStatus === 'error') {
          circleBg = '#EF4444';
          circleBorder = '#EF4444';
          circleColor = '#FFFFFF';
          titleColor = '#EF4444';
          shadow = '0 0 0 4px rgba(239, 68, 68, 0.18)';
        } else {
          circleBg = 'var(--ln-surface-pearl)';
          circleBorder = 'var(--ln-hairline-strong)';
          circleColor = 'var(--ln-muted)';
          titleColor = 'var(--ln-muted)';
        }

        const renderIcon = () => {
          if (item.icon) return item.icon;
          if (stepStatus === 'finish' && !disabled) return <Check style={{ width: '14px', height: '14px', strokeWidth: 3 }} />;
          if (stepStatus === 'error' && !disabled) return <X style={{ width: '14px', height: '14px', strokeWidth: 3 }} />;
          return <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace' }}>{idx + 1}</span>;
        };

        const isClickable = !disabled && !!onChange;

        if (effectiveDirection === 'vertical') {
          return (
            <div
              key={idx}
              onClick={() => isClickable && onChange(idx)}
              style={{
                display: 'flex',
                gap: '12px',
                position: 'relative',
                cursor: isClickable ? 'pointer' : 'default',
                paddingBottom: isLast ? '0' : '24px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: circleBg,
                    border: `1.5px solid ${circleBorder}`,
                    color: circleColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: shadow,
                    transition: 'all 0.2s ease',
                    zIndex: 2,
                    boxSizing: 'border-box'
                  }}
                >
                  {renderIcon()}
                </div>
                {!isLast && (
                  <div
                    style={{
                      width: '2px',
                      flex: 1,
                      minHeight: '24px',
                      marginTop: '4px',
                      background: idx < current ? '#533AFD' : 'var(--ln-hairline)',
                      transition: 'background 0.2s ease'
                    }}
                  />
                )}
              </div>

              <div style={{ flex: 1, paddingTop: '3px', minWidth: 0 }}>
                <div
                  style={{
                    fontSize: isMobile ? '14px' : '13px',
                    fontWeight: stepStatus === 'process' || stepStatus === 'finish' ? 700 : 500,
                    color: titleColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}
                >
                  <span>{item.title}</span>
                  {stepStatus === 'process' && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: 'rgba(83, 58, 253, 0.12)',
                        color: '#533AFD',
                        fontWeight: 600
                      }}
                    >
                      进行中
                    </span>
                  )}
                  {stepStatus === 'error' && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        color: '#EF4444',
                        fontWeight: 600
                      }}
                    >
                      包含错误
                    </span>
                  )}
                </div>

                {item.description && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--ln-body)',
                      marginTop: '4px',
                      lineHeight: '1.4'
                    }}
                  >
                    {item.description}
                  </div>
                )}

                {item.subDescription && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--ln-muted)',
                      marginTop: '4px',
                      fontFamily: 'monospace'
                    }}
                  >
                    {item.subDescription}
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <div
            key={idx}
            onClick={() => isClickable && onChange(idx)}
            style={{
              flex: isLast ? 'none' : 1,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              cursor: isClickable ? 'pointer' : 'default',
              minWidth: isLast ? 'auto' : '120px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: circleBg,
                  border: `1.5px solid ${circleBorder}`,
                  color: circleColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: shadow,
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  boxSizing: 'border-box'
                }}
              >
                {renderIcon()}
              </div>

              {!isLast && (
                <div
                  style={{
                    height: '2px',
                    flex: 1,
                    marginLeft: '8px',
                    marginRight: '8px',
                    background: idx < current ? '#533AFD' : 'var(--ln-hairline)',
                    transition: 'background 0.2s ease'
                  }}
                />
              )}
            </div>

            <div style={{ paddingRight: '8px' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: stepStatus === 'process' || stepStatus === 'finish' ? 700 : 500,
                  color: titleColor,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.title}
              </div>

              {item.description && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--ln-body)',
                    marginTop: '2px',
                    lineHeight: '1.3'
                  }}
                >
                  {item.description}
                </div>
              )}

              {item.subDescription && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--ln-muted)',
                    marginTop: '2px',
                    fontFamily: 'monospace'
                  }}
                >
                  {item.subDescription}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};


// ============================================================================
// 11. V2Timeline (Vertical Lifecycle & Audit Log Timeline)
// ============================================================================
export interface TimelineItem {
  title: React.ReactNode;
  timestamp?: string;
  operator?: string;
  content?: React.ReactNode;
  color?: 'violet' | 'success' | 'warning' | 'error' | 'muted' | string;
  icon?: React.ReactNode;
  tag?: string;
}

export interface V2TimelineProps {
  items: TimelineItem[];
  mode?: 'left' | 'alternate';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function getTimelineColor(color?: string): string {
  if (!color || color === 'violet' || color === 'primary') return '#533AFD';
  if (color === 'success') return '#10B981';
  if (color === 'warning') return '#D97706';
  if (color === 'error' || color === 'danger') return '#EF4444';
  if (color === 'muted') return '#627D98';
  return color;
}

export const V2Timeline: React.FC<V2TimelineProps> = ({
  items,
  mode = 'left',
  disabled = false,
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(containerRef);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        paddingLeft: '4px',
        width: '100%',
        boxSizing: 'border-box',
        opacity: disabled ? 0.65 : 1,
        cursor: disabled ? 'not-allowed' : 'default',
        ...style
      }}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const nodeColor = disabled ? 'var(--ln-muted)' : getTimelineColor(item.color);

        return (
          <div
            key={idx}
            style={{
              position: 'relative',
              display: 'flex',
              gap: isMobile ? '12px' : '16px',
              paddingBottom: isLast ? '0' : '24px',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              {item.icon ? (
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: `${nodeColor}18`,
                    border: `1.5px solid ${nodeColor}`,
                    color: nodeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    zIndex: 2
                  }}
                >
                  {item.icon}
                </div>
              ) : (
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: nodeColor,
                    boxShadow: `0 0 0 4px ${nodeColor}25`,
                    marginTop: '5px',
                    zIndex: 2,
                    boxSizing: 'border-box'
                  }}
                />
              )}

              {!isLast && (
                <div
                  style={{
                    width: '2px',
                    flex: 1,
                    minHeight: '24px',
                    marginTop: '6px',
                    background: 'var(--ln-hairline)',
                    boxSizing: 'border-box'
                  }}
                />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingTop: '1px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: item.content ? '6px' : '0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: isMobile ? '13px' : '12px',
                      fontWeight: 700,
                      color: 'var(--ln-ink)'
                    }}
                  >
                    {item.title}
                  </span>

                  {item.tag && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: `${nodeColor}15`,
                        color: nodeColor,
                        border: `1px solid ${nodeColor}30`
                      }}
                    >
                      {item.tag}
                    </span>
                  )}

                  {item.operator && (
                    <span
                      style={{
                        padding: '1px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        color: 'var(--ln-body)',
                        background: 'var(--ln-surface-pearl)',
                        border: '1px solid var(--ln-hairline)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <User style={{ width: '10px', height: '10px', color: 'var(--ln-muted)' }} />
                      {item.operator}
                    </span>
                  )}
                </div>

                {item.timestamp && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--ln-muted)',
                      fontFamily: 'monospace',
                      flexShrink: 0
                    }}
                  >
                    {item.timestamp}
                  </span>
                )}
              </div>

              {item.content && (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--ln-body)',
                    background: 'var(--ln-surface-pearl)',
                    border: '1px solid var(--ln-hairline)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    lineHeight: '1.5',
                    boxSizing: 'border-box'
                  }}
                >
                  {item.content}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};


// ============================================================================
// 12. V2ApprovalProgress (Multi-stage Approval Workflow Pipeline Indicator)
// ============================================================================
export interface ApproverInfo {
  name: string;
  avatar?: string;
  role?: string;
}

export interface ApprovalNode {
  title: string;
  approver?: ApproverInfo;
  status: 'approved' | 'processing' | 'pending' | 'rejected' | 'transferred';
  timestamp?: string;
  comment?: string;
  duration?: string;
}

export interface V2ApprovalProgressProps {
  nodes: ApprovalNode[];
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const V2ApprovalProgress: React.FC<V2ApprovalProgressProps> = ({
  nodes,
  direction = 'vertical',
  disabled = false,
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(containerRef);

  const effectiveDirection = isMobile && direction === 'horizontal' ? 'vertical' : direction;

  const getStatusBadge = (status: ApprovalNode['status']) => {
    if (disabled) {
      return {
        label: status === 'approved' ? '已通过' : status === 'processing' ? '审批中' : status === 'rejected' ? '已驳回' : '待审批',
        color: 'var(--ln-muted)',
        bg: 'var(--ln-surface-pearl)',
        border: 'var(--ln-hairline)',
        icon: <Clock3 style={{ width: '12px', height: '12px' }} />
      };
    }
    switch (status) {
      case 'approved':
        return {
          label: '已通过',
          color: '#10B981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
          icon: <Check style={{ width: '12px', height: '12px' }} />
        };
      case 'processing':
        return {
          label: '审批中',
          color: '#533AFD',
          bg: 'rgba(83, 58, 253, 0.12)',
          border: 'rgba(83, 58, 253, 0.3)',
          icon: <ClockIcon style={{ width: '12px', height: '12px' }} />
        };
      case 'rejected':
        return {
          label: '已驳回',
          color: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.3)',
          icon: <X style={{ width: '12px', height: '12px' }} />
        };
      case 'transferred':
        return {
          label: '已转办',
          color: '#D97706',
          bg: 'rgba(217, 119, 6, 0.12)',
          border: 'rgba(217, 119, 6, 0.3)',
          icon: <RotateCcw style={{ width: '12px', height: '12px' }} />
        };
      case 'pending':
      default:
        return {
          label: '待审批',
          color: 'var(--ln-muted)',
          bg: 'var(--ln-surface-pearl)',
          border: 'var(--ln-hairline)',
          icon: <Clock3 style={{ width: '12px', height: '12px' }} />
        };
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexDirection: effectiveDirection === 'vertical' ? 'column' : 'row',
        width: '100%',
        gap: effectiveDirection === 'vertical' ? '0px' : '16px',
        alignItems: 'stretch',
        boxSizing: 'border-box',
        opacity: disabled ? 0.65 : 1,
        cursor: disabled ? 'not-allowed' : 'default',
        ...style
      }}
    >
      {nodes.map((node, idx) => {
        const badge = getStatusBadge(node.status);
        const isLast = idx === nodes.length - 1;
        const isCurrentActive = node.status === 'processing' && !disabled;
        const initial = node.approver?.name ? node.approver.name.charAt(0) : '?';

        if (effectiveDirection === 'vertical') {
          // Vertical Layout (Timeline style)
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '14px',
                position: 'relative',
                boxSizing: 'border-box',
                alignItems: 'stretch'
              }}
            >
              {/* Left Timeline Node Icon Column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                  width: '32px',
                  paddingTop: '2px'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: disabled ? 'var(--ln-surface-pearl)' : (isCurrentActive ? '#533AFD' : badge.bg),
                    border: `1px solid ${disabled ? 'var(--ln-hairline)' : (isCurrentActive ? '#533AFD' : badge.border)}`,
                    color: disabled ? 'var(--ln-muted)' : (isCurrentActive ? '#FFFFFF' : badge.color),
                    boxShadow: isCurrentActive ? '0 0 0 4px rgba(83, 58, 253, 0.2)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    zIndex: 2,
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {badge.icon}
                </div>

                {!isLast && (
                  <div
                    style={{
                      width: '2px',
                      flex: 1,
                      minHeight: '20px',
                      background: node.status === 'approved' && !disabled ? '#10B981' : 'var(--ln-hairline-strong, #CBD5E1)',
                      margin: '4px 0'
                    }}
                  />
                )}
              </div>

              {/* Right Stage Detail Card */}
              <div
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  marginBottom: isLast ? '0px' : '16px',
                  borderRadius: '12px',
                  border: `1px solid ${disabled ? 'var(--ln-hairline)' : (isCurrentActive ? '#533AFD' : 'var(--ln-hairline)')}`,
                  background: disabled ? 'var(--ln-surface-pearl)' : (isCurrentActive ? 'rgba(83, 58, 253, 0.04)' : 'var(--ln-surface-card)'),
                  boxShadow: disabled ? 'none' : (isCurrentActive ? '0 0 0 3px rgba(83, 58, 253, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)'),
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxSizing: 'border-box',
                  minWidth: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: isCurrentActive ? '#533AFD' : 'var(--ln-ink)'
                    }}
                  >
                    {idx + 1}. {node.title}
                  </span>

                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: badge.color,
                      background: badge.bg,
                      border: `1px solid ${badge.border}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0
                    }}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                </div>

                {node.approver && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {node.approver.avatar ? (
                      <img
                        src={node.approver.avatar}
                        alt={node.approver.name}
                        style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.color,
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {initial}
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-ink)' }}>
                        {node.approver.name}
                        {node.approver.role && (
                          <span style={{ fontSize: '11px', color: 'var(--ln-muted)', marginLeft: '6px', fontWeight: 400 }}>
                            ({node.approver.role})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(node.timestamp || node.duration) && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: 'var(--ln-muted)',
                      fontFamily: 'monospace'
                    }}
                  >
                    <span>{node.timestamp || '-'}</span>
                    {node.duration && <span>耗时 {node.duration}</span>}
                  </div>
                )}

                {node.comment && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--ln-body)',
                      background: 'var(--ln-surface-pearl)',
                      borderLeft: `3px solid ${badge.color}`,
                      padding: '6px 10px',
                      borderRadius: '0 6px 6px 0',
                      lineHeight: '1.4'
                    }}
                  >
                    "{node.comment}"
                  </div>
                )}
              </div>
            </div>
          );
        }

        // Horizontal Layout
        return (
          <div
            key={idx}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              gap: '12px',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '12px',
                border: `1px solid ${disabled ? 'var(--ln-hairline)' : (isCurrentActive ? '#533AFD' : 'var(--ln-hairline)')}`,
                background: disabled ? 'var(--ln-surface-pearl)' : (isCurrentActive ? 'rgba(83, 58, 253, 0.04)' : 'var(--ln-surface-card)'),
                boxShadow: disabled ? 'none' : (isCurrentActive ? '0 0 0 3px rgba(83, 58, 253, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)'),
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isCurrentActive ? '#533AFD' : 'var(--ln-ink)'
                  }}
                >
                  {idx + 1}. {node.title}
                </span>

                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: badge.color,
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0
                  }}
                >
                  {badge.icon}
                  {badge.label}
                </span>
              </div>

              {node.approver && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {node.approver.avatar ? (
                    <img
                      src={node.approver.avatar}
                      alt={node.approver.name}
                      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        color: badge.color,
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {initial}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-ink)' }}>
                      {node.approver.name}
                      {node.approver.role && (
                        <span style={{ fontSize: '11px', color: 'var(--ln-muted)', marginLeft: '6px', fontWeight: 400 }}>
                          ({node.approver.role})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(node.timestamp || node.duration) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: 'var(--ln-muted)',
                    fontFamily: 'monospace'
                  }}
                >
                  <span>{node.timestamp || '-'}</span>
                  {node.duration && <span>耗时 {node.duration}</span>}
                </div>
              )}

              {node.comment && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--ln-body)',
                    background: 'var(--ln-surface-pearl)',
                    borderLeft: `3px solid ${badge.color}`,
                    padding: '6px 8px',
                    borderRadius: '0 6px 6px 0',
                    lineHeight: '1.4'
                  }}
                >
                  "{node.comment}"
                </div>
              )}
            </div>

            {!isLast && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 2px',
                  color: node.status === 'approved' ? '#10B981' : 'var(--ln-hairline-strong)',
                  flexShrink: 0
                }}
              >
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// 3.11 H5 Mobile Navigation Components (Header, Bottom Nav & Action Bar)
// ============================================================================

export interface V2MobileHeaderRightAction {
  key?: string;
  icon?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  badge?: number | string | boolean;
  disabled?: boolean;
}

export interface V2MobileHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  showClose?: boolean;
  onClose?: () => void;
  leftExtra?: React.ReactNode;
  rightActions?: V2MobileHeaderRightAction[] | React.ReactNode;
  fixed?: boolean;
  sticky?: boolean;
  backdropBlur?: boolean;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
}

export const V2MobileHeader: React.FC<V2MobileHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  showClose = false,
  onClose,
  leftExtra,
  rightActions,
  fixed = false,
  sticky = false,
  backdropBlur = true,
  height = '44px',
  style,
  className = ''
}) => {
  const positionStyle: React.CSSProperties = fixed
    ? { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }
    : sticky
    ? { position: 'sticky', top: 0, zIndex: 100 }
    : { position: 'relative' };

  const bgStyle: React.CSSProperties = backdropBlur
    ? {
        background: 'var(--ln-surface-card-translucent, rgba(255, 255, 255, 0.88))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }
    : {
        background: 'var(--ln-surface-card)'
      };

  return (
    <div
      className={`v2-mobile-header ${className}`}
      style={{
        ...positionStyle,
        ...bgStyle,
        width: '100%',
        minHeight: height,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        borderBottom: '1px solid var(--ln-hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '8px',
        paddingRight: '8px',
        boxSizing: 'border-box',
        color: 'var(--ln-ink)',
        transition: 'all 0.2s ease',
        ...style
      }}
    >
      {/* Left Region */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: '44px', flexShrink: 0 }}>
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ln-ink)',
              borderRadius: '8px',
              transition: 'background 0.15s ease'
            }}
            title="返回"
            aria-label="Back"
          >
            <ChevronLeft style={{ width: '22px', height: '22px' }} />
          </button>
        )}

        {showClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ln-ink)',
              borderRadius: '8px',
              transition: 'background 0.15s ease'
            }}
            title="关闭"
            aria-label="Close"
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        )}

        {leftExtra}
      </div>

      {/* Center Title Region */}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          padding: '0 8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {typeof title === 'string' ? (
          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--ln-ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              lineHeight: '1.2'
            }}
          >
            {title}
          </div>
        ) : (
          title
        )}

        {subtitle && (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--ln-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              marginTop: '1px'
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Right Actions Region */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '44px', justifyContent: 'flex-end', flexShrink: 0 }}>
        {Array.isArray(rightActions) ? (
          rightActions.map((act, index) => {
            const hasBadge = act.badge !== undefined && act.badge !== false && act.badge !== 0;
            return (
              <button
                key={act.key || index}
                type="button"
                onClick={act.onClick}
                disabled={act.disabled}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: act.disabled ? 'not-allowed' : 'pointer',
                  padding: '8px',
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: act.disabled ? 'var(--ln-muted)' : 'var(--ln-ink)',
                  borderRadius: '8px',
                  position: 'relative',
                  fontSize: '12px',
                  fontWeight: 600,
                  opacity: act.disabled ? 0.5 : 1
                }}
                title={act.label || 'Action'}
              >
                {act.icon}
                {act.label && <span style={{ marginLeft: act.icon ? '4px' : '0' }}>{act.label}</span>}
                {hasBadge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 700,
                      borderRadius: typeof act.badge === 'number' || typeof act.badge === 'string' ? '9999px' : '50%',
                      minWidth: typeof act.badge === 'number' || typeof act.badge === 'string' ? '14px' : '7px',
                      height: typeof act.badge === 'number' || typeof act.badge === 'string' ? '14px' : '7px',
                      padding: typeof act.badge === 'number' || typeof act.badge === 'string' ? '0 4px' : '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid var(--ln-surface-card)',
                      boxSizing: 'border-box'
                    }}
                  >
                    {typeof act.badge === 'number' || typeof act.badge === 'string' ? act.badge : ''}
                  </span>
                )}
              </button>
            );
          })
        ) : (
          rightActions
        )}
      </div>
    </div>
  );
};

export interface V2MobileBottomNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  badge?: number | string | boolean;
  disabled?: boolean;
}

export interface V2MobileBottomNavProps {
  items: V2MobileBottomNavItem[];
  activeKey: string;
  onChange?: (key: string) => void;
  height?: number | string;
  fixed?: boolean;
  backdropBlur?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const V2MobileBottomNav: React.FC<V2MobileBottomNavProps> = ({
  items,
  activeKey,
  onChange,
  height = '50px',
  fixed = false,
  backdropBlur = true,
  style,
  className = ''
}) => {
  const positionStyle: React.CSSProperties = fixed
    ? { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }
    : { position: 'relative' };

  const bgStyle: React.CSSProperties = backdropBlur
    ? {
        background: 'var(--ln-surface-card-translucent, rgba(255, 255, 255, 0.92))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }
    : {
        background: 'var(--ln-surface-card)'
      };

  return (
    <div
      className={`v2-mobile-bottom-nav ${className}`}
      style={{
        ...positionStyle,
        ...bgStyle,
        width: '100%',
        minHeight: height,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderTop: '1px solid var(--ln-hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxSizing: 'border-box',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
        ...style
      }}
    >
      {items.map((item) => {
        const isActive = activeKey === item.key;
        const hasBadge = item.badge !== undefined && item.badge !== false && item.badge !== 0;
        const displayIcon = isActive && item.activeIcon ? item.activeIcon : item.icon;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => !item.disabled && onChange && onChange(item.key)}
            disabled={item.disabled}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 2px',
              minHeight: '48px',
              background: 'transparent',
              border: 'none',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              color: isActive
                ? 'var(--oneos-primary, var(--ln-primary, #533AFD))'
                : 'var(--ln-muted)',
              transition: 'color 0.15s ease',
              position: 'relative',
              opacity: item.disabled ? 0.4 : 1
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                marginBottom: '2px'
              }}
            >
              {displayIcon}

              {hasBadge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-7px',
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    borderRadius: typeof item.badge === 'number' || typeof item.badge === 'string' ? '9999px' : '50%',
                    minWidth: typeof item.badge === 'number' || typeof item.badge === 'string' ? '14px' : '7px',
                    height: typeof item.badge === 'number' || typeof item.badge === 'string' ? '14px' : '7px',
                    padding: typeof item.badge === 'number' || typeof item.badge === 'string' ? '0 3px' : '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid var(--ln-surface-card)',
                    boxSizing: 'border-box',
                    lineHeight: 1
                  }}
                >
                  {typeof item.badge === 'number' || typeof item.badge === 'string' ? item.badge : ''}
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                lineHeight: '1.1',
                letterSpacing: '-0.2px'
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export interface V2MobileActionBarProps {
  primaryText?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  primaryIcon?: React.ReactNode;
  secondaryText?: string;
  onSecondary?: () => void;
  secondaryDisabled?: boolean;
  secondaryIcon?: React.ReactNode;
  summaryPrice?: string | React.ReactNode;
  summaryLabel?: string;
  summarySubtext?: string;
  fixed?: boolean;
  height?: number | string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const V2MobileActionBar: React.FC<V2MobileActionBarProps> = ({
  primaryText,
  onPrimary,
  primaryDisabled = false,
  primaryLoading = false,
  primaryIcon,
  secondaryText,
  onSecondary,
  secondaryDisabled = false,
  secondaryIcon,
  summaryPrice,
  summaryLabel,
  summarySubtext,
  fixed = false,
  height = '56px',
  children,
  style,
  className = ''
}) => {
  const positionStyle: React.CSSProperties = fixed
    ? { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90 }
    : { position: 'relative' };

  return (
    <div
      className={`v2-mobile-action-bar ${className}`}
      style={{
        ...positionStyle,
        width: '100%',
        minHeight: height,
        background: 'var(--ln-surface-card)',
        borderTop: '1px solid var(--ln-hairline)',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
        padding: '10px 16px',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
        ...style
      }}
    >
      {children ? (
        children
      ) : (
        <>
          {summaryPrice !== undefined && summaryPrice !== null && (
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {summaryLabel && (
                <div style={{ fontSize: '11px', color: 'var(--ln-muted)', lineHeight: '1.2' }}>
                  {summaryLabel}
                </div>
              )}
              <div
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: 'var(--oneos-primary, var(--ln-primary, #533AFD))',
                  fontFamily: '"JetBrains Mono", SFMono-Regular, Consolas, monospace',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: '1.2',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '2px'
                }}
              >
                {typeof summaryPrice === 'string' && !summaryPrice.startsWith('¥') && (
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>¥ </span>
                )}
                {summaryPrice}
              </div>
              {summarySubtext && (
                <div style={{ fontSize: '10px', color: 'var(--ln-muted)', marginTop: '1px' }}>
                  {summarySubtext}
                </div>
              )}
            </div>
          )}

          {secondaryText && (
            <button
              type="button"
              onClick={onSecondary}
              disabled={secondaryDisabled}
              style={{
                flex: summaryPrice !== undefined ? undefined : 1,
                minHeight: '44px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid var(--ln-hairline)',
                background: 'var(--ln-surface-card)',
                color: 'var(--ln-ink)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: secondaryDisabled ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: secondaryDisabled ? 0.5 : 1,
                transition: 'all 0.15s ease',
                boxSizing: 'border-box'
              }}
            >
              {secondaryIcon}
              {secondaryText}
            </button>
          )}

          {primaryText && (
            <button
              type="button"
              onClick={onPrimary}
              disabled={primaryDisabled || primaryLoading}
              style={{
                flex: summaryPrice !== undefined ? undefined : 2,
                minHeight: '44px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--oneos-primary, var(--ln-primary, #533AFD))',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                cursor: primaryDisabled || primaryLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: primaryDisabled ? 0.5 : 1,
                boxShadow: '0 2px 8px rgba(83, 58, 253, 0.3)',
                transition: 'all 0.15s ease',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap'
              }}
            >
              {primaryLoading ? (
                <RotateCcw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                primaryIcon
              )}
              {primaryText}
            </button>
          )}
        </>
      )}
    </div>
  );
};

// ============================================================================
// 12. V2Pagination (Unified Page Controller with Page Size, Quick Jumper, H5 Responsive & Tabular Nums)
// ============================================================================
export interface V2PaginationProps {
  page?: number;
  currentPage?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onChange?: (page: number, pageSize: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
  showSizeChanger?: boolean;
  showTotal?: boolean;
  size?: 'default' | 'small';
  disabled?: boolean;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
  style?: React.CSSProperties;
}

export const V2Pagination: React.FC<V2PaginationProps> = ({
  page: propPage,
  currentPage,
  pageSize = 20,
  total = 0,
  onPageChange,
  onChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showQuickJumper = true,
  showSizeChanger = true,
  showTotal = true,
  size = 'default',
  disabled = false,
  align = 'between',
  className = '',
  style
}) => {
  const isMobile = useIsMobile();
  const activePage = propPage ?? currentPage ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const [jumpInput, setJumpInput] = useState<string>('');

  useEffect(() => {
    setJumpInput(String(activePage));
  }, [activePage]);

  const handlePageChange = (newPage: number) => {
    if (disabled) return;
    const target = Math.max(1, Math.min(totalPages, newPage));
    if (target === activePage) return;

    if (onPageChange) onPageChange(target);
    if (onChange) onChange(target, pageSize);
  };

  const handleSizeChange = (newSize: number) => {
    if (disabled) return;
    if (onPageSizeChange) onPageSizeChange(newSize);
    if (onChange) onChange(1, newSize);
  };

  const handleJump = () => {
    if (disabled) return;
    const parsed = parseInt(jumpInput, 10);
    if (!isNaN(parsed)) {
      handlePageChange(parsed);
    } else {
      setJumpInput(String(activePage));
    }
  };

  // Generate page numbers logic
  const getPageItems = (): Array<number | 'ellipsis'> => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items: Array<number | 'ellipsis'> = [1];
    if (activePage > 3) items.push('ellipsis');

    const start = Math.max(2, activePage - 1);
    const end = Math.min(totalPages - 1, activePage + 1);
    for (let p = start; p <= end; p++) {
      items.push(p);
    }

    if (activePage < totalPages - 2) items.push('ellipsis');
    if (totalPages > 1) items.push(totalPages);
    return items;
  };

  const pageItems = getPageItems();

  const isSmall = size === 'small';
  const controlHeight = isSmall ? '28px' : '32px';
  const fontSize = isSmall ? '12px' : '13px';
  const btnPadding = isSmall ? '0 8px' : '0 10px';

  // Format page size select options for V2Select
  const selectOptions: SelectOption[] = pageSizeOptions.map((opt) => ({
    value: String(opt),
    label: `${opt} 条/页`
  }));

  // Alignment justify-content mapping
  const justifyMap: Record<string, string> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    between: 'space-between'
  };

  // Render Mobile View
  if (isMobile) {
    return (
      <div
        className={`v2-pagination v2-pagination-mobile ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '10px 12px',
          background: 'var(--ln-surface-card)',
          borderTop: '1px solid var(--ln-hairline)',
          boxSizing: 'border-box',
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          ...style
        }}
      >
        <button
          type="button"
          disabled={activePage <= 1 || disabled}
          onClick={() => handlePageChange(activePage - 1)}
          style={{
            minHeight: '36px',
            padding: '0 12px',
            borderRadius: '6px',
            border: '1px solid var(--ln-hairline)',
            background: 'var(--ln-surface-card)',
            color: activePage <= 1 ? 'var(--ln-muted-soft)' : 'var(--ln-ink)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: activePage <= 1 ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ChevronLeft size={16} />
          上一页
        </button>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--ln-ink)',
              fontFamily: '"JetBrains Mono", tabular-nums'
            }}
          >
            {activePage} / {totalPages} 页
          </div>
          {showTotal && (
            <div style={{ fontSize: '11px', color: 'var(--ln-muted)', fontFamily: 'tabular-nums' }}>
              共 {total} 条
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={activePage >= totalPages || disabled}
          onClick={() => handlePageChange(activePage + 1)}
          style={{
            minHeight: '36px',
            padding: '0 12px',
            borderRadius: '6px',
            border: '1px solid var(--ln-hairline)',
            background: 'var(--ln-surface-card)',
            color: activePage >= totalPages ? 'var(--ln-muted-soft)' : 'var(--ln-ink)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: activePage >= totalPages ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          下一页
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  // Render PC View
  return (
    <div
      className={`v2-pagination ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: justifyMap[align] || 'space-between',
        flexWrap: 'wrap',
        gap: '12px 16px',
        width: '100%',
        padding: '12px 16px',
        background: 'var(--ln-surface-card)',
        borderRadius: '8px',
        boxSizing: 'border-box',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...style
      }}
    >
      {/* Left: Total & Size Changer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {showTotal && (
          <div style={{ fontSize, color: 'var(--ln-body)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>共</span>
            <span
              style={{
                fontFamily: '"JetBrains Mono", SFMono-Regular, Consolas, monospace',
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 700,
                color: 'var(--oneos-primary, var(--ln-primary, #533AFD))'
              }}
            >
              {total}
            </span>
            <span>条记录</span>
          </div>
        )}

        {showSizeChanger && (
          <div style={{ width: isSmall ? '100px' : '110px' }}>
            <V2Select
              options={selectOptions}
              value={String(pageSize)}
              onChange={(val) => handleSizeChange(Number(val))}
              size={size}
              disabled={disabled}
            />
          </div>
        )}
      </div>

      {/* Right: Page Buttons & Quick Jumper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Navigation Page Numbers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Prev Button */}
          <button
            type="button"
            disabled={activePage <= 1 || disabled}
            onClick={() => handlePageChange(activePage - 1)}
            style={{
              height: controlHeight,
              minWidth: controlHeight,
              padding: btnPadding,
              borderRadius: '6px',
              border: '1px solid var(--ln-hairline)',
              background: 'var(--ln-surface-card)',
              color: activePage <= 1 ? 'var(--ln-muted-soft)' : 'var(--ln-ink)',
              cursor: activePage <= 1 || disabled ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box'
            }}
            title="上一页"
          >
            <ChevronLeft size={isSmall ? 14 : 16} />
          </button>

          {/* Page Number Items */}
          {pageItems.map((item, idx) => {
            if (item === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  style={{
                    height: controlHeight,
                    minWidth: '24px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize,
                    color: 'var(--ln-muted)',
                    userSelect: 'none'
                  }}
                >
                  …
                </span>
              );
            }

            const isActive = activePage === item;
            return (
              <button
                key={item}
                type="button"
                disabled={disabled}
                onClick={() => handlePageChange(item)}
                style={{
                  height: controlHeight,
                  minWidth: controlHeight,
                  padding: '0 6px',
                  borderRadius: '6px',
                  border: isActive ? 'none' : '1px solid var(--ln-hairline)',
                  background: isActive
                    ? 'var(--oneos-primary, var(--ln-primary, #533AFD))'
                    : 'var(--ln-surface-card)',
                  color: isActive ? '#FFFFFF' : 'var(--ln-ink)',
                  fontSize,
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: '"JetBrains Mono", SFMono-Regular, Consolas, monospace',
                  fontVariantNumeric: 'tabular-nums',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? '0 2px 8px rgba(83, 58, 253, 0.28)' : 'none',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box'
                }}
              >
                {item}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            disabled={activePage >= totalPages || disabled}
            onClick={() => handlePageChange(activePage + 1)}
            style={{
              height: controlHeight,
              minWidth: controlHeight,
              padding: btnPadding,
              borderRadius: '6px',
              border: '1px solid var(--ln-hairline)',
              background: 'var(--ln-surface-card)',
              color: activePage >= totalPages ? 'var(--ln-muted-soft)' : 'var(--ln-ink)',
              cursor: activePage >= totalPages || disabled ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box'
            }}
            title="下一页"
          >
            <ChevronRight size={isSmall ? 14 : 16} />
          </button>
        </div>

        {/* Quick Jumper */}
        {showQuickJumper && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize, color: 'var(--ln-body)' }}>
            <span>跳至</span>
            <input
              type="text"
              disabled={disabled}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJump()}
              onBlur={handleJump}
              style={{
                width: isSmall ? '40px' : '48px',
                height: controlHeight,
                textAlign: 'center',
                borderRadius: '6px',
                border: '1px solid var(--ln-hairline)',
                background: 'var(--ln-surface-card)',
                color: 'var(--ln-ink)',
                fontSize,
                fontWeight: 600,
                fontFamily: '"JetBrains Mono", tabular-nums',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease'
              }}
            />
            <span>页</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 13. V2Empty (Empty State & Exception View Component)
// ============================================================================
export type V2EmptyType = 'empty' | 'no_search' | 'no_permission' | 'server_error' | 'no_network' | 'custom';

export interface V2EmptyProps {
  type?: V2EmptyType;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  image?: React.ReactNode;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  primaryActionIcon?: React.ReactNode;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  secondaryActionIcon?: React.ReactNode;
  children?: React.ReactNode;
  size?: 'default' | 'small' | 'large' | 'compact';
  fullPage?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const V2Empty: React.FC<V2EmptyProps> = ({
  type = 'empty',
  title,
  description,
  icon,
  image,
  primaryActionText,
  onPrimaryAction,
  primaryActionIcon,
  secondaryActionText,
  onSecondaryAction,
  secondaryActionIcon,
  children,
  size = 'default',
  fullPage = false,
  className = '',
  style
}) => {
  const isMobile = useIsMobile();

  // Size configuration
  const sizeConfig = {
    compact: {
      padding: '24px 16px',
      iconBoxSize: '48px',
      iconSize: 22,
      titleSize: '13px',
      descSize: '12px',
      gap: '12px',
      btnHeight: '32px',
      btnFont: '12px'
    },
    small: {
      padding: '32px 20px',
      iconBoxSize: '56px',
      iconSize: 26,
      titleSize: '14px',
      descSize: '12px',
      gap: '14px',
      btnHeight: '36px',
      btnFont: '13px'
    },
    default: {
      padding: '48px 24px',
      iconBoxSize: '72px',
      iconSize: 34,
      titleSize: '16px',
      descSize: '13px',
      gap: '16px',
      btnHeight: '40px',
      btnFont: '14px'
    },
    large: {
      padding: '72px 32px',
      iconBoxSize: '88px',
      iconSize: 42,
      titleSize: '18px',
      descSize: '14px',
      gap: '20px',
      btnHeight: '44px',
      btnFont: '14px'
    }
  };

  const cfg = sizeConfig[size] || sizeConfig.default;

  // Preset Configurations
  const presets: Record<
    V2EmptyType,
    {
      icon: React.ReactNode;
      title: string;
      description: string;
      primaryText?: string;
      color: string;
      bgGlow: string;
    }
  > = {
    empty: {
      icon: <Inbox size={cfg.iconSize} />,
      title: '暂无相关数据',
      description: '当前台账或业务板块下暂无数据，您可以开启第一条记录或调整查询视角。',
      primaryText: '新建第一条记录',
      color: 'var(--oneos-primary, var(--ln-primary, #533AFD))',
      bgGlow: 'rgba(83, 58, 253, 0.08)'
    },
    no_search: {
      icon: <SearchX size={cfg.iconSize} />,
      title: '未找到匹配结果',
      description: '没有找到符合当前高阶筛选条件的数据，建议您尝试清空或重置筛选条件。',
      primaryText: '重置筛选条件',
      color: '#3B82F6',
      bgGlow: 'rgba(59, 130, 246, 0.08)'
    },
    no_permission: {
      icon: <Lock size={cfg.iconSize} />,
      title: '暂无模块访问权限',
      description: '您当前账号尚未开通该数据表或业务功能的查看权限，请联系部门管理员授权。',
      primaryText: '申请开通权限',
      color: '#D97706',
      bgGlow: 'rgba(217, 119, 6, 0.08)'
    },
    server_error: {
      icon: <AlertTriangle size={cfg.iconSize} />,
      title: '服务加载失败 (500)',
      description: '后端服务响应异常或通信超时，请检查服务状态或点击下方按钮刷新重试。',
      primaryText: '一键刷新重试',
      color: '#EF4444',
      bgGlow: 'rgba(239, 68, 68, 0.08)'
    },
    no_network: {
      icon: <WifiOff size={cfg.iconSize} />,
      title: '网络连接已中断',
      description: '客户端无法连接至服务器，请检查您的网络连接、Wi-Fi 状态或网络防火墙设置。',
      primaryText: '重新连接网络',
      color: '#6B7280',
      bgGlow: 'rgba(107, 114, 128, 0.08)'
    },
    custom: {
      icon: <FileQuestion size={cfg.iconSize} />,
      title: '自定义说明',
      description: '请传入自定义提示内容。',
      color: 'var(--oneos-primary, var(--ln-primary, #533AFD))',
      bgGlow: 'rgba(83, 58, 253, 0.08)'
    }
  };

  const preset = presets[type] || presets.empty;

  // Resolved values
  const displayTitle = title ?? preset.title;
  const displayDesc = description ?? preset.description;
  const displayIcon = icon ?? preset.icon;
  const finalPrimaryText = primaryActionText ?? preset.primaryText;
  const mainColor = preset.color;

  return (
    <div
      className={`v2-empty ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        minHeight: fullPage ? 'calc(100vh - 120px)' : '100%',
        padding: cfg.padding,
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* Icon / Image Container */}
      <div
        style={{
          marginBottom: cfg.gap,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {image ? (
          image
        ) : (
          <div
            style={{
              width: cfg.iconBoxSize,
              height: cfg.iconBoxSize,
              borderRadius: '50%',
              background: preset.bgGlow,
              border: `1px solid ${mainColor}25`,
              color: mainColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 24px ${mainColor}15`,
              transition: 'all 0.2s ease'
            }}
          >
            {displayIcon}
          </div>
        )}
      </div>

      {/* Title */}
      {displayTitle && (
        <div
          style={{
            fontSize: cfg.titleSize,
            fontWeight: 800,
            color: 'var(--ln-ink)',
            marginBottom: '6px',
            lineHeight: '1.3',
            maxWidth: '480px'
          }}
        >
          {displayTitle}
        </div>
      )}

      {/* Description */}
      {displayDesc && (
        <div
          style={{
            fontSize: cfg.descSize,
            fontWeight: 400,
            color: 'var(--ln-muted)',
            lineHeight: '1.5',
            maxWidth: '420px',
            marginBottom: (finalPrimaryText || secondaryActionText || children) ? cfg.gap : 0
          }}
        >
          {displayDesc}
        </div>
      )}

      {/* Action Buttons Group */}
      {(finalPrimaryText || secondaryActionText) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            width: isMobile ? '100%' : 'auto',
            maxWidth: isMobile ? '320px' : 'none'
          }}
        >
          {secondaryActionText && (
            <button
              type="button"
              onClick={onSecondaryAction}
              style={{
                flex: isMobile ? 1 : undefined,
                height: isMobile ? '44px' : cfg.btnHeight,
                padding: '0 16px',
                borderRadius: '8px',
                border: '1px solid var(--ln-hairline)',
                background: 'var(--ln-surface-card)',
                color: 'var(--ln-ink)',
                fontSize: cfg.btnFont,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
                boxSizing: 'border-box'
              }}
            >
              {secondaryActionIcon}
              {secondaryActionText}
            </button>
          )}

          {finalPrimaryText && (
            <button
              type="button"
              onClick={onPrimaryAction}
              style={{
                flex: isMobile ? 1 : undefined,
                height: isMobile ? '44px' : cfg.btnHeight,
                padding: '0 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--oneos-primary, var(--ln-primary, #533AFD))',
                color: '#FFFFFF',
                fontSize: cfg.btnFont,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(83, 58, 253, 0.28)',
                transition: 'all 0.15s ease',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap'
              }}
            >
              {primaryActionIcon}
              {finalPrimaryText}
            </button>
          )}
        </div>
      )}

      {/* Children Slot */}
      {children && <div style={{ marginTop: '12px', width: '100%' }}>{children}</div>}
    </div>
  );
};


// ============================================================================
// 15. V2SegmentedControl (Top Mode / Perspective Switcher Control)
// ============================================================================
export interface SegmentedOption<T extends string = string> {
  key: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode | number;
  disabled?: boolean;
}

export interface V2SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function V2SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  disabled = false,
  className = '',
  style
}: V2SegmentedControlProps<T>) {
  const sizeStyles = {
    sm: { padding: '2px', btnPadding: '4px 10px', fontSize: '12px', minHeight: '28px', gap: '4px' },
    md: { padding: '3px', btnPadding: '6px 14px', fontSize: '12px', minHeight: '34px', gap: '6px' },
    lg: { padding: '4px', btnPadding: '8px 18px', fontSize: '13px', minHeight: '42px', gap: '8px' }
  };
  const cfg = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={`v2-segmented-control ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--ln-surface-strong, var(--ln-surface-pearl, #F1F5F9))',
        border: '1px solid var(--ln-hairline)',
        borderRadius: '8px',
        padding: cfg.padding,
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        boxSizing: 'border-box',
        maxWidth: '100%',
        overflowX: 'auto',
        ...style
      }}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        const optDisabled = disabled || opt.disabled;

        return (
          <button
            key={opt.key}
            type="button"
            disabled={optDisabled}
            onClick={() => !optDisabled && onChange(opt.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: cfg.gap,
              padding: cfg.btnPadding,
              minHeight: cfg.minHeight,
              borderRadius: '6px',
              fontSize: cfg.fontSize,
              fontWeight: active ? 700 : 500,
              cursor: optDisabled ? 'not-allowed' : 'pointer',
              border: 'none',
              background: active ? 'var(--ln-surface-card, #FFFFFF)' : 'transparent',
              color: active ? 'var(--oneos-primary, var(--ln-primary, #533AFD))' : 'var(--ln-muted, #627D98)',
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(83,58,253,0.06)' : 'none',
              transition: 'all 0.15s cubic-bezier(0.2, 0, 0, 1)',
              boxSizing: 'border-box',
              whiteSpace: 'nowrap'
            }}
          >
            {opt.icon}
            <span>{opt.label}</span>
            {opt.badge !== undefined && (
              <span
                style={{
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: active ? 'rgba(83, 58, 253, 0.12)' : 'var(--ln-surface-pearl)',
                  color: active ? 'var(--oneos-primary, #533AFD)' : 'var(--ln-muted)',
                  marginLeft: '2px'
                }}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}


// ============================================================================
// 16. V2StatusTabs (Segmented Status Filter Tabs Bar)
// ============================================================================
export interface StatusTabOption<T extends string = string> {
  key: T;
  label: string;
  count?: number | string;
  badgeColor?: string;
  disabled?: boolean;
}

export interface V2StatusTabsProps<T extends string = string> {
  options: StatusTabOption<T>[];
  value: T;
  onChange: (key: T) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function V2StatusTabs<T extends string = string>({
  options,
  value,
  onChange,
  disabled = false,
  className = '',
  style
}: V2StatusTabsProps<T>) {
  return (
    <div
      className={`v2-status-tabs ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: 'var(--ln-surface-pearl, #F1F5F9)',
        padding: '4px',
        borderRadius: '8px',
        border: '1px solid var(--ln-hairline)',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        boxSizing: 'border-box',
        overflowX: 'auto',
        maxWidth: '100%',
        ...style
      }}
    >
      {options.map((tab) => {
        const active = tab.key === value;
        const tabDisabled = disabled || tab.disabled;

        return (
          <button
            key={tab.key}
            type="button"
            disabled={tabDisabled}
            onClick={() => !tabDisabled && onChange(tab.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: active ? 700 : 500,
              cursor: tabDisabled ? 'not-allowed' : 'pointer',
              border: 'none',
              background: active ? 'var(--ln-surface-card, #FFFFFF)' : 'transparent',
              color: active ? 'var(--oneos-primary, var(--ln-primary, #533AFD))' : 'var(--ln-muted, #627D98)',
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: active
                    ? 'var(--oneos-primary, #533AFD)'
                    : 'var(--ln-muted)',
                  opacity: active ? 1 : 0.8
                }}
              >
                ({tab.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}


export {
  V2Button,
  type V2ButtonProps,
  type V2ButtonVariant,
  type V2ButtonSize,
} from '../../resources/design-system/components/V2Button';

export {
  V2FilterSearch,
  V2FilterMoreButton,
  type V2FilterSearchProps,
  type V2FilterMoreButtonProps,
} from '../../resources/design-system/components/V2FilterAffordance';

export {
  V2ImageUpload,
  type V2ImageUploadProps,
  type V2ImageUploadItem,
} from '../../resources/design-system/components/V2ImageUpload';

export {
  V2FieldLabel,
  type V2FieldLabelProps,
} from '../../resources/design-system/components/V2FieldLabel';

