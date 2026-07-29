/**
 * @name OneOS V2 表单控件库
 * 统一 Input / Select / MultiSelect / DatePicker / DateRange / TimePicker 预览
 */
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import '../../resources/design-system/oneos-ds-tokens.css';
import {
  O2DatePicker,
  O2DateRangePicker,
  O2Input,
  O2MultiSelect,
  O2Select,
  O2TimePicker,
} from '../../common/oneos-v2-form';
import {
  readStoredOneOsTheme,
  setOneOsTheme,
  type OneOsTheme,
} from '../../common/oneos-app-shell';
import { PrototypeAnnotationHost } from '../../common/prototype-annotation-host';
import type { AnnotationSourceDocument, AnnotationViewerOptions } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

const STATUS_OPTIONS = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'suspended', label: '挂起' },
  { value: 'archived', label: '已归档' },
];

const annotationOptions: AnnotationViewerOptions = { defaultOpen: false };

export default function OneOsV2FormKitPage() {
  const [theme, setTheme] = useState<OneOsTheme>(() =>
    typeof window === 'undefined' ? 'light' : readStoredOneOsTheme(),
  );
  const [text, setText] = useState('');
  const [status, setStatus] = useState('pending');
  const [tags, setTags] = useState<string[]>(['pending', 'processing']);
  const [day, setDay] = useState('2026-07-23');
  const [range, setRange] = useState({ startDate: '2026-07-01', endDate: '2026-07-23' });
  const [time, setTime] = useState('14:30');
  const [timeSec, setTimeSec] = useState('14:30:00');
  const [errDemo, setErrDemo] = useState('');

  useEffect(() => {
    setOneOsTheme(theme);
  }, [theme]);

  const isDark = theme === 'dark';
  const bg = isDark ? '#0a0b0d' : '#f6f9fc';
  const surface = isDark ? '#121418' : '#ffffff';
  const border = isDark ? '#23272f' : '#e3e8ee';
  const ink = isDark ? '#f7fafc' : '#0a2540';
  const body = isDark ? '#a0aec0' : '#425466';
  const accent = '#533afd';

  return (
    <div
      data-annotation-id="oneos-v2-form-kit"
      style={{
        minHeight: '100vh',
        background: bg,
        color: ink,
        padding: '28px 32px 64px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      <header
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          maxWidth: 960,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>OneOS V2 表单控件库</h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: isDark ? 'rgba(83,58,253,0.18)' : '#e0e7ff',
                color: accent,
                padding: '3px 10px',
                borderRadius: 12,
              }}
            >
              Stripe Violet · 统一皮肤
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: body }}>
            组件 <code>src/common/oneos-v2-form/</code> · 亦可{' '}
            <code>/prototypes/oneos-v2?view=form-kit</code>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 36,
            padding: '0 14px',
            borderRadius: 8,
            border: `1px solid ${border}`,
            background: surface,
            color: ink,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
          aria-label="切换主题"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? '浅色' : '深色'}
        </button>
      </header>

      <section
        className="o2-form-kit"
        style={{
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: 12,
          padding: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 20,
          maxWidth: 960,
        }}
      >
        <O2Input
          label="单行输入框"
          required
          placeholder="请输入车牌号 / 关键词"
          value={text}
          onChange={(e) => setText(e.target.value)}
          help="高度 md=36px / sm=32px · focus 紫环"
        />

        <O2Input
          label="错误态示例"
          placeholder="留空显示错误态"
          value={errDemo}
          error={!errDemo ? '必填项不能为空' : undefined}
          onChange={(e) => setErrDemo(e.target.value)}
        />

        <O2Select
          label="单选下拉"
          value={status}
          options={STATUS_OPTIONS}
          onChange={setStatus}
          placeholder="请选择状态"
        />

        <O2MultiSelect
          label="多选下拉"
          value={tags}
          options={STATUS_OPTIONS}
          onChange={setTags}
          placeholder="可多选"
        />

        <O2DatePicker label="单日日期" value={day} onChange={setDay} />

        <O2TimePicker label="时间（时:分）" value={time} onChange={setTime} format="HH:mm" />

        <div style={{ gridColumn: '1 / -1' }}>
          <O2DateRangePicker
            label="区间日期（开始 至 结束 · 双月日历）"
            startDate={range.startDate}
            endDate={range.endDate}
            onChange={setRange}
            help="能力对标 DateRangeFilterField；新 V2 页请用本组件"
          />
        </div>

        <O2TimePicker
          label="时间（时:分:秒）"
          value={timeSec}
          onChange={setTimeSec}
          format="HH:mm:ss"
        />

        <O2Select
          label="紧凑尺寸 sm（筛选条）"
          size="sm"
          value={status}
          options={STATUS_OPTIONS}
          onChange={setStatus}
        />

        <O2Input label="禁用态" value="不可编辑" disabled />
      </section>

      <section
        style={{
          marginTop: 20,
          maxWidth: 960,
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: 12,
          padding: 20,
          fontSize: 13,
          color: body,
          lineHeight: 1.6,
        }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: ink }}>迁页怎么引用</h2>
        <pre
          style={{
            margin: 0,
            padding: 14,
            borderRadius: 8,
            background: isDark ? '#1a1d24' : '#f8fafc',
            border: `1px solid ${border}`,
            overflow: 'auto',
            fontSize: 12,
            color: ink,
          }}
        >{`import {
  O2Input, O2Select, O2MultiSelect,
  O2DatePicker, O2DateRangePicker, O2TimePicker,
} from '../../common/oneos-v2-form';
// index 已引入 tokens + oneos-v2-form.css`}</pre>
        <p style={{ margin: '12px 0 0' }}>
          新 V2 / 迁入页必须用 <code>O2*</code>；旧 vm 页可暂留{' '}
          <code>FilterPickerField</code> / <code>DateRangeFilterField</code>。
        </p>
      </section>

      <PrototypeAnnotationHost
        source={annotationSourceDocument as AnnotationSourceDocument}
        options={annotationOptions}
      />
    </div>
  );
}
