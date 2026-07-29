import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addMonths,
  buildMonthCells,
  formatISODate,
  formatMonthTitle,
  isDateInRange,
  isRangeEnd,
  isRangeStart,
  normalizeDateRange,
  parseISODate,
  sameCalendarDay,
  startOfMonth,
  WEEKDAY_LABELS,
  type DateRangeValue,
} from './dateUtils';

function MonthPanel({
  monthDate,
  start,
  end,
  hover,
  selected,
  mode,
  onDayClick,
  onDayHover,
}: {
  monthDate: Date;
  start: Date | null;
  end: Date | null;
  hover: Date | null;
  selected: Date | null;
  mode: 'single' | 'range';
  onDayClick: (date: Date) => void;
  onDayHover: (date: Date | null) => void;
}) {
  const cells = useMemo(() => buildMonthCells(monthDate), [monthDate]);
  const today = useMemo(() => new Date(), []);

  return (
    <div className="o2-cal__month">
      <div className="o2-cal__month-title">{formatMonthTitle(monthDate)}</div>
      <div className="o2-cal__weekdays" aria-hidden>
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="o2-cal__weekday">
            {label}
          </span>
        ))}
      </div>
      <div className="o2-cal__days" role="grid">
        {cells.map((cell) => {
          const key = formatISODate(cell.date);
          const isToday = sameCalendarDay(cell.date, today);
          let classNames = ['o2-cal__day'];
          if (!cell.inMonth) classNames.push('is-outside');
          if (isToday) classNames.push('is-today');

          if (mode === 'single') {
            if (selected && sameCalendarDay(cell.date, selected)) classNames.push('is-selected');
          } else {
            const selectedStart = isRangeStart(cell.date, start, end, hover);
            const selectedEnd = isRangeEnd(cell.date, start, end, hover);
            const inRange = isDateInRange(cell.date, start, end, hover);
            if (inRange) classNames.push('is-in-range');
            if (selectedStart) classNames.push('is-range-start');
            if (selectedEnd) classNames.push('is-range-end');
          }

          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              className={classNames.join(' ')}
              aria-label={key}
              aria-pressed={
                mode === 'single'
                  ? Boolean(selected && sameCalendarDay(cell.date, selected))
                  : isRangeStart(cell.date, start, end, hover) ||
                    isRangeEnd(cell.date, start, end, hover)
              }
              onMouseEnter={() => onDayHover(cell.date)}
              onMouseLeave={() => onDayHover(null)}
              onClick={() => onDayClick(cell.date)}
            >
              <span>{cell.date.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function O2SingleCalendarPanel({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (next: string) => void;
  onComplete?: () => void;
}) {
  const selected = parseISODate(value);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selected || new Date()));

  return (
    <div className="o2-cal o2-cal--single">
      <div className="o2-cal__nav">
        <button
          type="button"
          className="o2-cal__nav-btn"
          aria-label="上一月"
          onClick={() => setViewMonth((prev) => addMonths(prev, -1))}
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
        <button
          type="button"
          className="o2-cal__nav-btn"
          aria-label="下一月"
          onClick={() => setViewMonth((prev) => addMonths(prev, 1))}
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
      <MonthPanel
        monthDate={viewMonth}
        start={null}
        end={null}
        hover={null}
        selected={selected}
        mode="single"
        onDayHover={() => undefined}
        onDayClick={(date) => {
          onChange(formatISODate(date));
          onComplete?.();
        }}
      />
    </div>
  );
}

export function O2RangeCalendarPanel({
  startDate,
  endDate,
  onChange,
  onComplete,
}: {
  startDate: string;
  endDate: string;
  onChange: (range: DateRangeValue) => void;
  onComplete?: () => void;
}) {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(start || end || new Date()));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const leftMonth = viewMonth;
  const rightMonth = addMonths(viewMonth, 1);

  const handleDayClick = (date: Date) => {
    const iso = formatISODate(date);
    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: iso, endDate: '' });
      return;
    }
    const next = normalizeDateRange(startDate, iso);
    onChange(next);
    onComplete?.();
  };

  return (
    <div className="o2-cal o2-cal--range">
      <div className="o2-cal__nav">
        <button
          type="button"
          className="o2-cal__nav-btn"
          aria-label="上一月"
          onClick={() => setViewMonth((prev) => addMonths(prev, -1))}
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
        <button
          type="button"
          className="o2-cal__nav-btn"
          aria-label="下一月"
          onClick={() => setViewMonth((prev) => addMonths(prev, 1))}
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
      <div className="o2-cal__body">
        <MonthPanel
          monthDate={leftMonth}
          start={start}
          end={end}
          hover={hoverDate}
          selected={null}
          mode="range"
          onDayClick={handleDayClick}
          onDayHover={setHoverDate}
        />
        <MonthPanel
          monthDate={rightMonth}
          start={start}
          end={end}
          hover={hoverDate}
          selected={null}
          mode="range"
          onDayClick={handleDayClick}
          onDayHover={setHoverDate}
        />
      </div>
    </div>
  );
}
