/**
 * 故障处置 · OneOS V2
 * 对标 LeaseContractHub：Stripe Violet + 列表 / 看板 / 主从三视图
 * 业务能力对齐 .spec/requirements-prd.md · sla-and-archive.md
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  ConfigProvider,
  Form,
  Input,
  Modal,
  Select,
  Upload,
  message,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  ChevronRight,
  Clock,
  Columns,
  Download,
  LayoutGrid,
  List,
  PauseCircle,
  PlayCircle,
  Paperclip,
  Save,
  Search,
  Truck,
  Wrench,
} from 'lucide-react';
import {
  type AnnotationSourceDocument,
  type AnnotationViewerOptions,
} from '@axhub/annotation';
import { PrototypeAnnotationHost } from '../../common/prototype-annotation-host';
import { OperationActions } from '../../common/OperationActions';
import { DEFAULT_PAGE_SIZE, TablePagination } from '../../common/TablePagination';
import { clearHostPrototypeRouteInfo } from '../../common/useHashPage';
import { DateRangeFilterField } from '../vehicle-management/components/DateRangeFilterField';
import { FilterPickerField } from '../vehicle-management/components/FilterPickerField';
import {
  V2FilterMoreButton,
  V2FilterSearch,
} from '../../resources/design-system/components/UIComponents';
import annotationSourceDocument from './annotation-source.json';
import '../../resources/design-system/oneos-ds-tokens.css';
import '../../common/vm-operation-actions.css';
import './styles/index.css';
import {
  type FaultAttachment,
  type FaultLevel,
  type FaultRecord,
  type FaultStatus,
  FAULT_LEVELS,
  FAULT_STATUS_LABEL,
  archiveGaps,
  canArchive,
  deadlineOf,
  DEMO_TODAY,
  isDueSoon,
  isOverdue,
  loadFaults,
  remainingDays,
  upsertFault,
} from '../../common/vehicle-fault';

type ViewMode = 'list' | 'kanban' | 'split';
type ListFilter = 'all' | 'due-soon' | 'overdue' | 'pending';

const antdTheme = {
  token: {
    colorPrimary: '#533AFD',
    colorLink: '#533AFD',
    borderRadius: 8,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
  },
};

const STATUS_PILL: Record<
  FaultStatus,
  { bg: string; bgDark: string; color: string }
> = {
  pending: { bg: '#f1f5f9', bgDark: '#23272f', color: '#425466' },
  processing: { bg: '#ecfdf5', bgDark: 'rgba(16,185,129,0.15)', color: '#10b981' },
  suspended: { bg: '#fefce8', bgDark: 'rgba(217,119,6,0.15)', color: '#d97706' },
  archived: { bg: '#e0e7ff', bgDark: 'rgba(83,58,253,0.18)', color: '#533afd' },
};

const KANBAN_COLS: { id: FaultStatus; label: string; color: string }[] = [
  { id: 'pending', label: '待处理', color: '#94a3b8' },
  { id: 'processing', label: '处理中', color: '#10b981' },
  { id: 'suspended', label: '挂起', color: '#d97706' },
  { id: 'archived', label: '已归档', color: '#533afd' },
];

interface ListFilterDraft {
  deadlineStart: string;
  deadlineEnd: string;
  status: FaultStatus | '';
  level: FaultLevel | '';
  brandModel: string;
  plateNo: string;
  codeKeyword: string;
}

function emptyDraft(): ListFilterDraft {
  return {
    deadlineStart: '',
    deadlineEnd: '',
    status: '',
    level: '',
    brandModel: '',
    plateNo: '',
    codeKeyword: '',
  };
}

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const sync = () => {
      const ds = document.documentElement.getAttribute('data-ds-mode');
      const theme = document.documentElement.getAttribute('data-oneos-theme');
      setIsDark(ds === 'dark' || theme === 'dark');
    };
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-ds-mode', 'data-oneos-theme'],
    });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

function tokens(isDark: boolean) {
  return {
    bg: isDark ? '#0a0b0d' : '#f6f9fc',
    surface: isDark ? '#121418' : '#ffffff',
    surfaceHover: isDark ? '#1a1d24' : '#f8fafc',
    border: isDark ? '#23272f' : '#e3e8ee',
    textPrimary: isDark ? '#f7fafc' : '#0a2540',
    textSecondary: isDark ? '#a0aec0' : '#425466',
    accent: '#533afd',
    accentSoft: isDark ? 'rgba(83, 58, 253, 0.18)' : '#e0e7ff',
  };
}

function readHashParam(key: string): string {
  if (typeof window === 'undefined') return '';
  const raw = window.location.hash.replace(/^#/, '');
  return new URLSearchParams(raw).get(key) || '';
}

function writeListHash(next: { filter?: ListFilter; id?: string; view?: ViewMode }) {
  const sp = new URLSearchParams();
  if (next.filter && next.filter !== 'all') sp.set('filter', next.filter);
  if (next.id) sp.set('id', next.id);
  if (next.view && next.view !== 'list') sp.set('view', next.view);
  window.location.hash = sp.toString();
}

function nowIso() {
  return '2026-07-22T14:00:00';
}

function kindFromName(name: string): FaultAttachment['kind'] {
  const lower = name.toLowerCase();
  if (/\.(png|jpe?g|gif|webp)$/.test(lower)) return 'image';
  if (/\.(mp4|mov|webm)$/.test(lower)) return 'video';
  if (/\.pdf$/.test(lower)) return 'pdf';
  if (/\.(docx?|DOCX?)$/.test(lower)) return 'word';
  return 'other';
}

function exportFaultsCsv(rows: FaultRecord[]) {
  const headers = [
    '车牌号',
    '品牌',
    '型号',
    '故障号',
    '故障部位',
    '故障等级',
    '任务状态',
    '最后完成时限',
    '剩余/逾期',
    '上报时间',
    '处理人',
    '地区',
  ];
  const lines = rows.map((r) => {
    const deadline = deadlineOf(r.reportedAt);
    let slaTag = '已闭环';
    if (r.status !== 'archived') {
      const left = remainingDays(r.reportedAt);
      slaTag = left < 0 ? `逾期${Math.abs(left)}天` : `剩${left}天`;
    }
    return [
      r.plateNo,
      r.brand,
      r.model,
      r.code,
      r.part || '',
      r.level || '',
      FAULT_STATUS_LABEL[r.status],
      deadline,
      slaTag,
      r.reportedAt,
      r.assignee || '',
      r.region,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(',');
  });
  const bom = '\uFEFF';
  const blob = new Blob([bom + [headers.join(','), ...lines].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `故障处置导出-${DEMO_TODAY}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const STATUS_FILTER_OPTIONS = (Object.keys(FAULT_STATUS_LABEL) as FaultStatus[]).map((k) => ({
  value: k,
  label: FAULT_STATUS_LABEL[k],
}));

function StatusPill({ status, isDark }: { status: FaultStatus; isDark: boolean }) {
  const s = STATUS_PILL[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: isDark ? s.bgDark : s.bg,
        color: s.color,
      }}
    >
      <CheckCircle2 size={12} />
      {FAULT_STATUS_LABEL[status]}
    </span>
  );
}

function SlaLabel({ record, isDark, t }: { record: FaultRecord; isDark: boolean; t: ReturnType<typeof tokens> }) {
  const deadline = deadlineOf(record.reportedAt);
  if (record.status === 'archived') {
    return (
      <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
        {deadline} · 已闭环
      </span>
    );
  }
  const left = remainingDays(record.reportedAt);
  const color = left < 0 ? '#ef4444' : left <= 7 ? '#d97706' : t.textSecondary;
  return (
    <span style={{ fontSize: 11, color, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
      {deadline} · {left < 0 ? `逾期 ${Math.abs(left)} 天` : `剩 ${left} 天`}
    </span>
  );
}

function FaultDetail({
  record,
  operator,
  isDark,
  onSave,
  initialSubTab = 'form',
}: {
  record: FaultRecord;
  operator: string;
  isDark: boolean;
  onSave: (next: FaultRecord, tip: string) => void;
  initialSubTab?: 'form' | 'evidence' | 'history';
}) {
  const t = tokens(isDark);
  const [form] = Form.useForm();
  const [hangOpen, setHangOpen] = useState(false);
  const [hangReason, setHangReason] = useState('');
  const [evidence, setEvidence] = useState<FaultAttachment[]>(record.evidence);
  const [subTab, setSubTab] = useState<'form' | 'evidence' | 'history'>(initialSubTab);

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [record.id, initialSubTab]);

  useEffect(() => {
    form.setFieldsValue({
      faultTime: record.faultTime,
      location: record.location,
      part: record.part,
      level: record.level,
      result: record.result,
      remark: record.remark,
    });
    setEvidence(record.evidence);
  }, [record, form]);

  const left = remainingDays(record.reportedAt);

  const buildDraft = useCallback((): FaultRecord => {
    const values = form.getFieldsValue();
    const next: FaultRecord = {
      ...record,
      faultTime: values.faultTime,
      location: values.location,
      part: values.part,
      level: values.level,
      result: values.result,
      remark: values.remark,
      evidence,
      updatedAt: nowIso(),
    };
    if (next.status === 'pending') {
      next.status = 'processing';
      next.assignee = operator;
    }
    return next;
  }, [form, record, evidence, operator]);

  const handleSave = () => {
    if (record.status === 'archived') {
      message.info('已归档记录不可再编辑');
      return;
    }
    if (record.status === 'suspended') {
      message.warning('请先恢复处理后再保存');
      return;
    }
    onSave(buildDraft(), '已保存，状态为处理中');
  };

  const handleHang = () => {
    if (!hangReason.trim()) {
      message.error('请填写挂起原因');
      return;
    }
    const base =
      record.status === 'pending'
        ? { ...buildDraft(), status: 'processing' as const, assignee: operator }
        : buildDraft();
    const next: FaultRecord = {
      ...base,
      status: 'suspended',
      hangHistory: [
        ...base.hangHistory,
        { id: `h-${Date.now()}`, reason: hangReason.trim(), at: nowIso(), by: operator },
      ],
      updatedAt: nowIso(),
    };
    setHangOpen(false);
    setHangReason('');
    onSave(next, '已挂起');
  };

  const handleResume = () => {
    const hist = record.hangHistory.map((h, i) =>
      i === record.hangHistory.length - 1 && !h.resumedAt ? { ...h, resumedAt: nowIso() } : h,
    );
    onSave({ ...record, status: 'processing', hangHistory: hist, updatedAt: nowIso() }, '已恢复为处理中');
  };

  const handleArchive = () => {
    if (record.status === 'suspended') {
      message.error('挂起状态不可直接归档，请先恢复处理');
      return;
    }
    const draft = buildDraft();
    const gaps = archiveGaps({ ...draft, status: 'processing' });
    if (gaps.length) {
      message.error(`无法归档，缺少：${gaps.map((g) => g.label).join('、')}`);
      return;
    }
    if (!canArchive({ ...draft, status: 'processing' })) {
      message.error('无法归档');
      return;
    }
    onSave(
      { ...draft, status: 'archived', archivedAt: nowIso(), updatedAt: nowIso() },
      '已归档闭环',
    );
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const item: FaultAttachment = {
        id: `e-${Date.now()}`,
        name: file.name,
        kind: kindFromName(file.name),
        source: 'evidence',
        uploadedBy: operator,
        uploadedAt: nowIso(),
        previewNote: '本地演示附件（未上传真实文件）',
      };
      setEvidence((prev) => [...prev, item]);
      return false;
    },
    showUploadList: false,
  };

  const fileList: UploadFile[] = evidence.map((e) => ({
    uid: e.id,
    name: e.name,
    status: 'done',
  }));

  const btnGhost: React.CSSProperties = {
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    border: `1px solid ${t.border}`,
    background: t.surface,
    color: t.textPrimary,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };

  const btnPrimary: React.CSSProperties = {
    ...btnGhost,
    border: 'none',
    background: t.accent,
    color: '#fff',
    boxShadow: '0 2px 8px rgba(83, 58, 253, 0.35)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: t.accent }}>
              {record.code}
            </span>
            <StatusPill status={record.status} isDark={isDark} />
            {record.status !== 'archived' ? (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: left < 0 ? '#ef4444' : left <= 7 ? '#d97706' : t.textSecondary,
                }}
              >
                {left < 0 ? `逾期 ${Math.abs(left)} 天` : `剩 ${left} 天`} · 截止{' '}
                {deadlineOf(record.reportedAt)}
              </span>
            ) : null}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: t.textPrimary }}>
            {record.plateNo}
          </h2>
          <p style={{ fontSize: 13, color: t.textSecondary, margin: '4px 0 0' }}>
            {record.brand} · {record.model} · {record.region}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {record.status === 'suspended' ? (
            <button type="button" style={btnGhost} onClick={handleResume}>
              <PlayCircle size={14} /> 恢复处理
            </button>
          ) : (
            <>
              <button
                type="button"
                style={btnPrimary}
                disabled={record.status === 'archived'}
                onClick={handleSave}
              >
                <Save size={14} /> 保存
              </button>
              <button
                type="button"
                style={btnGhost}
                disabled={record.status === 'archived'}
                onClick={() => setHangOpen(true)}
              >
                <PauseCircle size={14} /> 挂起
              </button>
              <button
                type="button"
                style={btnGhost}
                disabled={record.status === 'archived'}
                onClick={handleArchive}
              >
                <Archive size={14} /> 归档
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: '处理人', value: record.assignee || '—' },
          { label: '上报时间', value: record.reportedAt },
          { label: '故障部位', value: record.part || '—' },
          { label: '故障等级', value: record.level || '—' },
        ].map((k) => (
          <div
            key={k.label}
            style={{
              background: t.surfaceHover,
              padding: '12px 14px',
              borderRadius: 8,
              border: `1px solid ${t.border}`,
            }}
          >
            <div style={{ fontSize: 11, color: t.textSecondary, marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.textPrimary }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, borderBottom: `1px solid ${t.border}`, paddingBottom: 8 }}>
        {[
          { id: 'form' as const, label: '处置主档' },
          { id: 'evidence' as const, label: `证据链 (${evidence.length})` },
          { id: 'history' as const, label: '挂起与通知' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              color: subTab === tab.id ? t.accent : t.textSecondary,
              cursor: 'pointer',
              paddingBottom: 8,
              borderBottom: subTab === tab.id ? `2px solid ${t.accent}` : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'form' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: t.surfaceHover,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div style={{ fontWeight: 700, color: t.textPrimary, marginBottom: 8, fontSize: 13 }}>
              原始记录（只读 · AI 来源）
            </div>
            <pre
              style={{
                margin: 0,
                padding: 12,
                background: isDark ? '#181b22' : '#fff',
                borderRadius: 8,
                whiteSpace: 'pre-wrap',
                fontSize: 13,
                lineHeight: 1.55,
                color: t.textPrimary,
              }}
            >
              {record.chatSummary}
            </pre>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {record.aiAttachments.map((a) => (
                <div key={a.id} style={{ fontSize: 13, color: t.textSecondary, display: 'flex', gap: 6 }}>
                  <Paperclip size={14} /> {a.name}
                  <span>
                    · {a.kind} · {a.uploadedAt}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            disabled={record.status === 'archived' || record.status === 'suspended'}
          >
            <div className="vf-form-grid">
              <Form.Item name="faultTime" label="故障时间" rules={[{ required: true }]}>
                <Input placeholder="如 2026-07-20 08:40" />
              </Form.Item>
              <Form.Item name="location" label="地点" rules={[{ required: true }]}>
                <Input placeholder="省市区 + 具体地点" />
              </Form.Item>
              <Form.Item name="part" label="部位" rules={[{ required: true }]}>
                <Input placeholder="如 动力电池 / 底盘" />
              </Form.Item>
              <Form.Item name="level" label="等级" rules={[{ required: true }]}>
                <Select options={FAULT_LEVELS.map((l) => ({ value: l, label: l }))} />
              </Form.Item>
            </div>
            <Form.Item name="result" label="处置结果" rules={[{ required: true }]}>
              <Input.TextArea rows={3} placeholder="处置措施与结果" />
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={2} />
            </Form.Item>
            <div style={{ fontSize: 12, color: t.textSecondary }}>
              关联车辆：{record.plateNo} / {record.brand} {record.model}（来自入库记录）
            </div>
          </Form>
        </div>
      )}

      {subTab === 'evidence' && (
        <div>
          <p style={{ fontSize: 13, color: t.textSecondary }}>
            归档须至少 1 个证据附件；支持图 / 视频 / PDF / Word 等（本地演示）。
          </p>
          <Upload {...uploadProps} disabled={record.status === 'archived' || record.status === 'suspended'}>
            <Button
              icon={<Paperclip size={16} />}
              disabled={record.status === 'archived' || record.status === 'suspended'}
            >
              添加证据附件
            </Button>
          </Upload>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {evidence.length === 0 ? (
              <div style={{ fontSize: 13, color: t.textSecondary }}>暂无证据附件</div>
            ) : (
              evidence.map((e) => (
                <div
                  key={e.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    color: t.textPrimary,
                  }}
                >
                  <Paperclip size={14} /> {e.name}
                  <span style={{ color: t.textSecondary }}>
                    · {e.kind} · {e.uploadedBy} · {e.uploadedAt}
                  </span>
                  {record.status !== 'archived' && record.status !== 'suspended' ? (
                    <Button
                      type="link"
                      size="small"
                      danger
                      onClick={() => setEvidence((prev) => prev.filter((x) => x.id !== e.id))}
                    >
                      移除
                    </Button>
                  ) : null}
                </div>
              ))
            )}
          </div>
          <span style={{ display: 'none' }}>{fileList.length}</span>
        </div>
      )}

      {subTab === 'history' && (
        <div style={{ fontSize: 13, color: t.textPrimary }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>挂起原因历史</div>
          {record.hangHistory.length === 0 ? (
            <p style={{ color: t.textSecondary }}>无</p>
          ) : (
            <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
              {record.hangHistory.map((h) => (
                <li key={h.id}>
                  <strong>{h.at}</strong> {h.by}：{h.reason}
                  {h.resumedAt ? (
                    <span style={{ color: t.textSecondary }}> · 恢复于 {h.resumedAt}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <div style={{ fontWeight: 700, margin: '16px 0 8px' }}>通知记录（演示）</div>
          {record.notifications.length === 0 ? (
            <p style={{ color: t.textSecondary }}>暂无发送记录</p>
          ) : (
            <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
              {record.notifications.map((n) => (
                <li key={n.id} style={{ marginBottom: 12 }}>
                  <StatusPill status={n.kind === 'due_soon' ? 'suspended' : 'pending'} isDark={isDark} />{' '}
                  {n.channel === 'sms' ? '短信' : '邮件'} → {n.to} · {n.sentAt}
                  <pre
                    style={{
                      margin: '6px 0 0',
                      padding: 12,
                      background: t.surfaceHover,
                      borderRadius: 8,
                      whiteSpace: 'pre-wrap',
                      fontSize: 12,
                    }}
                  >
                    {n.title ? `${n.title}\n` : ''}
                    {n.body}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Modal
        title="暂时挂起"
        open={hangOpen}
        onCancel={() => setHangOpen(false)}
        onOk={handleHang}
        okText="确认挂起"
      >
        <p style={{ color: t.textSecondary, fontSize: 13 }}>挂起不停表，仍计入 30 天闭环时限。</p>
        <Input.TextArea
          rows={4}
          value={hangReason}
          onChange={(e) => setHangReason(e.target.value)}
          placeholder="请填写挂起原因（必填）"
        />
      </Modal>
    </div>
  );
}

export default function FaultHandlingApp() {
  const isDark = useIsDark();
  const t = tokens(isDark);
  const [records, setRecords] = useState<FaultRecord[]>(() => loadFaults());
  const [filter, setFilter] = useState<ListFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedId, setSelectedId] = useState('');
  const [detailSubTab, setDetailSubTab] = useState<'form' | 'evidence' | 'history'>('form');
  const [draft, setDraft] = useState<ListFilterDraft>(() => emptyDraft());
  const [applied, setApplied] = useState<ListFilterDraft>(() => emptyDraft());
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const operator = '周强';

  useEffect(() => {
    clearHostPrototypeRouteInfo();
  }, []);

  useEffect(() => {
    const sync = () => {
      const id = readHashParam('id');
      const f = readHashParam('filter') as ListFilter;
      const v = readHashParam('view') as ViewMode;
      if (id) {
        setSelectedId(id);
        setViewMode(v === 'kanban' ? 'kanban' : 'split');
      } else if (v === 'kanban' || v === 'list' || v === 'split') {
        setViewMode(v);
      }
      if (f === 'due-soon' || f === 'overdue' || f === 'pending' || f === 'all') {
        setFilter(f);
      }
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter, applied, search]);

  const brandModelOptions = useMemo(() => {
    const set = new Set(records.map((r) => `${r.brand} ${r.model}`));
    return [...set];
  }, [records]);

  const plateOptions = useMemo(
    () => [...new Set(records.map((r) => r.plateNo))].sort((a, b) => a.localeCompare(b, 'zh-CN')),
    [records],
  );

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filter === 'due-soon' && !isDueSoon(r)) return false;
      if (filter === 'overdue' && !isOverdue(r)) return false;
      if (filter === 'pending' && r.status !== 'pending') return false;
      if (applied.status && r.status !== applied.status) return false;
      if (applied.level && r.level !== applied.level) return false;
      if (applied.brandModel && `${r.brand} ${r.model}` !== applied.brandModel) return false;
      if (applied.plateNo && r.plateNo !== applied.plateNo) return false;
      if (applied.deadlineStart || applied.deadlineEnd) {
        const deadline = deadlineOf(r.reportedAt);
        if (applied.deadlineStart && deadline < applied.deadlineStart) return false;
        if (applied.deadlineEnd && deadline > applied.deadlineEnd) return false;
      }
      if (applied.codeKeyword) {
        const q = applied.codeKeyword.trim().toLowerCase();
        if (!r.code.toLowerCase().includes(q)) return false;
      }
      if (search) {
        const q = search.trim().toLowerCase();
        if (
          !r.plateNo.toLowerCase().includes(q) &&
          !r.code.toLowerCase().includes(q) &&
          !`${r.brand} ${r.model}`.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [records, applied, filter, search]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const kpis = useMemo(() => {
    const pending = records.filter((r) => r.status === 'pending').length;
    const processing = records.filter((r) => r.status === 'processing').length;
    const dueSoon = records.filter((r) => isDueSoon(r)).length;
    const overdue = records.filter((r) => isOverdue(r)).length;
    return { pending, processing, dueSoon, overdue };
  }, [records]);

  const selected = records.find((r) => r.id === selectedId) || filtered[0] || records[0];

  const openDetail = (
    id: string,
    subTab: 'form' | 'evidence' | 'history' = 'form',
  ) => {
    setSelectedId(id);
    setDetailSubTab(subTab);
    setViewMode('split');
    writeListHash({ filter, id, view: 'split' });
  };

  const applyFilter = (next: ListFilter) => {
    setFilter(next);
    writeListHash({
      filter: next,
      id: viewMode === 'split' ? selectedId || undefined : undefined,
      view: viewMode,
    });
  };

  const changeView = (mode: ViewMode) => {
    setViewMode(mode);
    writeListHash({
      filter,
      id: mode === 'split' ? selected?.id : undefined,
      view: mode,
    });
    if (mode === 'split' && selected) setSelectedId(selected.id);
  };

  const handleSearch = () => {
    setApplied({ ...draft });
    setPage(1);
  };

  const handleReset = () => {
    const empty = emptyDraft();
    setDraft(empty);
    setApplied(empty);
    setSearch('');
    applyFilter('all');
    setPage(1);
  };

  const handleExport = () => {
    if (!filtered.length) {
      message.info('当前没有可导出的记录');
      return;
    }
    exportFaultsCsv(filtered);
    message.success(`已导出 ${filtered.length} 条（车牌号 / 品牌 / 型号 / 故障号分列）`);
  };

  const btnGhost: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: `1px solid ${t.border}`,
    background: t.surface,
    color: t.textPrimary,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };

  const btnTool: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    border: `1px solid ${t.border}`,
    background: t.surface,
    color: t.textSecondary,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };

  const viewBtn = (mode: ViewMode, label: string, Icon: React.ComponentType<{ size?: number }>) => (
    <button
      type="button"
      onClick={() => changeView(mode)}
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        border: 'none',
        background: viewMode === mode ? (isDark ? '#262a36' : '#ffffff') : 'transparent',
        color: viewMode === mode ? t.accent : t.textSecondary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: viewMode === mode && !isDark ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <Icon size={14} /> {label}
    </button>
  );

  const annotationOptions: AnnotationViewerOptions = {
    currentPageId: 'list',
  };

  const kpiCards = [
    {
      title: '待处理积压',
      value: `${kpis.pending} 单`,
      sub: '工作台 KPI 同源',
      icon: Wrench,
      color: t.accent,
      filter: 'pending' as ListFilter,
    },
    {
      title: '处理中',
      value: `${kpis.processing} 单`,
      sub: '处置进行中',
      icon: Truck,
      color: '#10b981',
      filter: 'all' as ListFilter,
    },
    {
      title: '临期催办',
      value: `${kpis.dueSoon} 单`,
      sub: '剩 ≤7 天未闭环',
      icon: Clock,
      color: '#d97706',
      filter: 'due-soon' as ListFilter,
    },
    {
      title: '已逾期',
      value: `${kpis.overdue} 单`,
      sub: '超 30 天未归档',
      icon: AlertTriangle,
      color: '#ef4444',
      filter: 'overdue' as ListFilter,
    },
  ];

  return (
    <ConfigProvider theme={antdTheme}>
      <div
        className="vf-root"
        data-annotation-id="vf-filter"
        style={{
          background: t.bg,
          color: t.textPrimary,
          minHeight: '100vh',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
          padding: '24px 32px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 顶栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  margin: 0,
                  color: t.textPrimary,
                  letterSpacing: '-0.01em',
                }}
              >
                故障处置
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: t.accentSoft,
                  color: t.accent,
                  padding: '3px 10px',
                  borderRadius: 12,
                }}
              >
                OneOS V2 · 对标租赁合同母版
              </span>
            </div>
            <p style={{ fontSize: 13, color: t.textSecondary, margin: '4px 0 0' }}>
              列表 / 看板 / 主从三视图；SLA 30 天闭环 · 证据链归档硬门槛
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                background: isDark ? '#1a1d24' : '#e2e8ee',
                padding: 3,
                borderRadius: 8,
                border: `1px solid ${t.border}`,
              }}
            >
              {viewBtn('list', '列表模式', List)}
              {viewBtn('kanban', '看板模式', LayoutGrid)}
              {viewBtn('split', '主从/表单模式', Columns)}
            </div>
            <button type="button" style={btnGhost} onClick={handleExport}>
              <Download size={16} /> 导出
            </button>
          </div>
        </div>

        {/* KPI */}
        {viewMode !== 'split' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              marginBottom: 20,
            }}
          >
            {kpiCards.map((card) => {
              const Icon = card.icon;
              const active = filter === card.filter && card.filter !== 'all';
              return (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => applyFilter(card.filter)}
                  style={{
                    background: t.surface,
                    border: `1px solid ${active ? t.accent : t.border}`,
                    borderRadius: 12,
                    padding: '18px 20px',
                    boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.02)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>
                      {card.title}
                    </span>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 24,
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: t.textPrimary,
                    }}
                  >
                    {card.value}
                  </div>
                  <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 4 }}>{card.sub}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* 工具栏 */}
        {viewMode !== 'split' && (
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: viewMode === 'list' && !showMoreFilters ? '12px 12px 0 0' : 12,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: viewMode === 'kanban' || showMoreFilters ? 16 : 0,
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 8,
                background: isDark ? '#1a1d24' : '#f1f5f9',
                padding: 4,
                borderRadius: 8,
              }}
            >
              {(
                [
                  { id: 'all' as ListFilter, label: `全部 (${records.length})` },
                  { id: 'pending' as ListFilter, label: `待处理 (${kpis.pending})` },
                  { id: 'due-soon' as ListFilter, label: `临期 (${kpis.dueSoon})` },
                  { id: 'overdue' as ListFilter, label: `逾期 (${kpis.overdue})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => applyFilter(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: filter === tab.id ? (isDark ? '#262a36' : '#ffffff') : 'transparent',
                    color: filter === tab.id ? t.accent : t.textSecondary,
                    boxShadow: filter === tab.id && !isDark ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <V2FilterSearch aria-label="搜索车牌、故障号或车型" style={{ width: 280 }}>
                <input
                  type="text"
                  placeholder="搜索车牌、故障号或车型..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="搜索车牌、故障号或车型"
                />
              </V2FilterSearch>
              <V2FilterMoreButton
                open={showMoreFilters}
                activeCount={[
                  applied.status,
                  applied.level,
                  applied.brandModel,
                  applied.plateNo,
                  applied.deadlineStart,
                  applied.deadlineEnd,
                  applied.codeKeyword,
                ].filter(Boolean).length}
                onClick={() => setShowMoreFilters((v) => !v)}
              />
              <button type="button" style={btnTool} onClick={handleReset}>
                重置
              </button>
            </div>
          </div>
        )}

        {viewMode !== 'split' && showMoreFilters && (
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
            data-annotation-id="vf-filter-deadline"
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <label className="vm-filter-field">
                <span style={{ color: t.textSecondary }}>车牌号</span>
                <FilterPickerField
                  value={draft.plateNo}
                  options={plateOptions}
                  placeholder="请选择车牌号"
                  ariaLabel="车牌号"
                  alwaysSearchable
                  caseInsensitive
                  onChange={(value) => setDraft((prev) => ({ ...prev, plateNo: value }))}
                />
              </label>
              <label className="vm-filter-field">
                <span style={{ color: t.textSecondary }}>最后完成时限</span>
                <DateRangeFilterField
                  startDate={draft.deadlineStart}
                  endDate={draft.deadlineEnd}
                  ariaLabel="最后完成时限"
                  startPlaceholder="开始日期"
                  endPlaceholder="结束日期"
                  onChange={(range) =>
                    setDraft((prev) => ({
                      ...prev,
                      deadlineStart: range.startDate,
                      deadlineEnd: range.endDate,
                    }))
                  }
                />
              </label>
              <label className="vm-filter-field">
                <span style={{ color: t.textSecondary }}>任务状态</span>
                <FilterPickerField
                  value={draft.status ? FAULT_STATUS_LABEL[draft.status] : ''}
                  options={STATUS_FILTER_OPTIONS.map((o) => o.label)}
                  placeholder="请选择任务状态"
                  ariaLabel="任务状态"
                  onChange={(label) => {
                    const hit = STATUS_FILTER_OPTIONS.find((o) => o.label === label);
                    setDraft((prev) => ({ ...prev, status: hit?.value || '' }));
                  }}
                />
              </label>
              <label className="vm-filter-field">
                <span style={{ color: t.textSecondary }}>等级</span>
                <FilterPickerField
                  value={draft.level}
                  options={[...FAULT_LEVELS]}
                  placeholder="请选择等级"
                  ariaLabel="等级"
                  onChange={(value) =>
                    setDraft((prev) => ({ ...prev, level: (value as FaultLevel) || '' }))
                  }
                />
              </label>
              <label className="vm-filter-field">
                <span style={{ color: t.textSecondary }}>品牌车型</span>
                <FilterPickerField
                  value={draft.brandModel}
                  options={brandModelOptions}
                  placeholder="请选择品牌车型"
                  ariaLabel="品牌车型"
                  alwaysSearchable
                  onChange={(value) => setDraft((prev) => ({ ...prev, brandModel: value }))}
                />
              </label>
              <label className="vm-filter-field">
                <span style={{ color: t.textSecondary }}>故障号</span>
                <input
                  className="vm-input"
                  value={draft.codeKeyword}
                  placeholder="请输入故障号"
                  onChange={(e) => setDraft((prev) => ({ ...prev, codeKeyword: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: `1px solid ${t.border}`,
                    background: t.surfaceHover,
                    color: t.textPrimary,
                  }}
                />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" style={btnTool} onClick={handleSearch}>
                <Search size={14} /> 查询
              </button>
            </div>
          </div>
        )}

        {/* 列表 */}
        {viewMode === 'list' && (
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderTop: showMoreFilters ? `1px solid ${t.border}` : 'none',
              borderRadius: showMoreFilters ? 12 : '0 0 12px 12px',
              overflow: 'hidden',
              boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.02)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: isDark ? '#16181f' : '#fafbfc',
                    borderBottom: `1px solid ${t.border}`,
                    color: t.textSecondary,
                    fontSize: 12,
                  }}
                >
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>车牌号 / 车型</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>故障号</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>部位 / 等级</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>任务状态</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }} data-annotation-id="vf-col-deadline">
                    最后完成时限
                  </th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => openDetail(row.id)}
                    style={{
                      borderBottom: `1px solid ${t.border}`,
                      cursor: 'pointer',
                    }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: t.textPrimary }}>
                        {row.plateNo}
                      </div>
                      <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 4 }}>
                        {row.brand} · {row.model}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 11,
                          fontWeight: 700,
                          color: t.accent,
                        }}
                      >
                        {row.code}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 500 }}>{row.part || '—'}</div>
                      <div style={{ fontSize: 11, color: t.textSecondary }}>{row.level || '—'}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <StatusPill status={row.status} isDark={isDark} />
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <SlaLabel record={row} isDark={isDark} t={t} />
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', justifyContent: 'flex-end' }}>
                        <OperationActions
                          process={{
                            label: '处置',
                            onClick: () => openDetail(row.id, 'form'),
                          }}
                          view={{
                            label: '查看记录',
                            onClick: () => openDetail(row.id, 'history'),
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{
                padding: '12px 20px',
                borderTop: `1px solid ${t.border}`,
                background: isDark ? '#121418' : '#fff',
              }}
            >
              <TablePagination
                page={page}
                pageSize={pageSize}
                total={filtered.length}
                onPageChange={setPage}
                onPageSizeChange={(ps) => {
                  setPageSize(ps);
                  setPage(1);
                }}
              />
            </div>
          </div>
        )}

        {/* 看板 */}
        {viewMode === 'kanban' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, flex: 1 }}>
            {KANBAN_COLS.map((col) => {
              const items = filtered.filter((c) => c.status === col.id);
              return (
                <div
                  key={col.id}
                  style={{
                    background: isDark ? '#12151b' : '#f8fafc',
                    border: `1px solid ${t.border}`,
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: 12,
                      marginBottom: 12,
                      borderBottom: `1px solid ${t.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: col.color,
                        }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{col.label}</span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: isDark ? '#1c212b' : '#e2e8ee',
                        color: t.textSecondary,
                        padding: '2px 8px',
                        borderRadius: 10,
                      }}
                    >
                      {items.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                    {items.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => openDetail(card.id)}
                        style={{
                          background: t.surface,
                          border: `1px solid ${t.border}`,
                          borderRadius: 10,
                          padding: 14,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          boxShadow: isDark ? 'none' : '0 2px 5px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: t.accent,
                              background: t.accentSoft,
                              padding: '2px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {card.code}
                          </span>
                          <button
                            type="button"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: t.accent,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            快速操作 <ChevronRight size={12} />
                          </button>
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{card.plateNo}</div>
                          <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 2 }}>
                            {card.brand} · {card.model}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: 8,
                            borderTop: `1px solid ${t.border}`,
                            fontSize: 11,
                          }}
                        >
                          <span>{card.part || '部位未填'}</span>
                          <span style={{ color: col.color, fontWeight: 600 }}>{card.level || '—'}</span>
                        </div>
                        <SlaLabel record={card} isDark={isDark} t={t} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 主从 */}
        {viewMode === 'split' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '340px 1fr',
              gap: 20,
              flex: 1,
              alignItems: 'start',
            }}
          >
            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>故障处置工作台</h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: t.accentSoft,
                    color: t.accent,
                    padding: '2px 8px',
                    borderRadius: 10,
                  }}
                >
                  Studio 双栏联动
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: isDark ? '#1a1d24' : '#f8fafc',
                  border: `1px solid ${t.border}`,
                  borderRadius: 8,
                  padding: '6px 12px',
                }}
              >
                <Search size={14} style={{ color: t.textSecondary }} />
                <input
                  type="text"
                  placeholder="搜索车牌或故障号..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 12,
                    color: t.textPrimary,
                    width: '100%',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight: 680,
                  overflowY: 'auto',
                }}
              >
                {filtered.map((c) => {
                  const isSelected = selected?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedId(c.id);
                        writeListHash({ filter, id: c.id, view: 'split' });
                      }}
                      style={{
                        background: isSelected
                          ? isDark
                            ? 'rgba(83, 58, 253, 0.15)'
                            : '#e0e7ff'
                          : isDark
                            ? '#181b22'
                            : '#f8fafc',
                        border: `1px solid ${isSelected ? t.accent : t.border}`,
                        borderRadius: 8,
                        padding: 12,
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: t.accent,
                          }}
                        >
                          {c.code}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: isDark ? '#232733' : '#e2e8ee',
                            color: t.textSecondary,
                            fontWeight: 600,
                          }}
                        >
                          {FAULT_STATUS_LABEL[c.status]}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{c.plateNo}</div>
                      <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 2 }}>
                        {c.brand} · {c.model}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <SlaLabel record={c} isDark={isDark} t={t} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                padding: 24,
              }}
            >
              {selected ? (
                <FaultDetail
                  record={selected}
                  operator={operator}
                  isDark={isDark}
                  initialSubTab={detailSubTab}
                  onSave={(next, tip) => {
                    setRecords((prev) => upsertFault(prev, next));
                    message.success(tip);
                  }}
                />
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: t.textSecondary }}>
                  请选择左侧故障单
                </div>
              )}
            </div>
          </div>
        )}

        <PrototypeAnnotationHost
          source={annotationSourceDocument as AnnotationSourceDocument}
          options={annotationOptions}
        />
      </div>
    </ConfigProvider>
  );
}
