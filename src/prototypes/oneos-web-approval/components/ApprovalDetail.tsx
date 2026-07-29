import React, { useEffect, useRef, useState } from 'react';
import {
  FileText,
  User,
  Clock,
  Copy,
  Check,
  Download,
  CheckCircle,
  Ban,
  MessageSquare,
  CornerUpLeft,
  ShieldAlert,
  ChevronDown,
  Upload,
  X,
} from 'lucide-react';
import type { ApprovalCardItem, ApprovalTabKey } from '../types';
import {
  V2ApprovalProgress,
  V2Tag,
  V2Empty,
  V2Button,
} from '../../../resources/design-system/components/UIComponents';
import { V2Badge } from '../../../resources/design-system/components/V2Badge';

export interface ApproveFormPayload {
  message: string;
  messageTypes: string[];
  copyUsers: string;
  nextAssignee: string;
  attachments: string[];
}

export interface ApprovalDetailProps {
  item: ApprovalCardItem | null;
  activeTab: ApprovalTabKey;
  onApprove: (id: string, payload: ApproveFormPayload) => void;
  onTerminate: (id: string, comment: string) => void;
  onComment: (id: string, content: string, attachments?: string[]) => void;
  onWithdraw: (id: string) => void;
  onCloseMobileDetail?: () => void;
}

type ModalKind = 'approve' | 'terminate' | 'comment' | 'revoke' | null;

const DEFAULT_EXPANDED_SECTION_TITLES = new Set(['费用汇总', '合同信息', '申请摘要']);

const NOTIFY_OPTIONS = [
  { value: '1', label: '站内信', locked: false },
  { value: '2', label: '邮件', locked: false },
  { value: '3', label: '短信', locked: false },
  { value: '4', label: '微信服务号', locked: false },
];

/** 危险描边：secondary 白底 + 红描边红字（吸底次操作；弹窗确认仍用 danger） */
const dangerOutlineStyle: React.CSSProperties = {
  color: 'var(--ln-error, #EF4444)',
  borderColor: 'var(--ln-error, #EF4444)',
  background: 'var(--ln-surface-card, #FFFFFF)',
};

function FieldGrid({
  fields,
}: {
  fields: Array<{ label: string; value: string; emphasis?: boolean }>;
}) {
  return (
    <div className="v2-ap-fields-grid">
      {fields.map((field, idx) => (
        <div key={`${field.label}-${idx}`} className="v2-ap-field">
          <span className="v2-ap-field__label">{field.label}</span>
          <span
            className={`v2-ap-field__value${field.emphasis ? ' is-emphasis' : ''}`}
          >
            {field.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export const ApprovalDetail: React.FC<ApprovalDetailProps> = ({
  item,
  activeTab,
  onApprove,
  onTerminate,
  onComment,
  onWithdraw,
  onCloseMobileDetail,
}) => {
  const [copied, setCopied] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const [messageTypes, setMessageTypes] = useState<string[]>(['1', '2', '3', '4']);
  const [approveMessage, setApproveMessage] = useState('');
  const [copyUsers, setCopyUsers] = useState('');
  const [nextAssignee, setNextAssignee] = useState('');
  const [approveFiles, setApproveFiles] = useState<string[]>([]);

  const [terminateComment, setTerminateComment] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentFiles, setCommentFiles] = useState<string[]>([]);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!item) return;
    const next: Record<string, boolean> = {};
    (item.detailSections || []).forEach(sec => {
      next[sec.title] = DEFAULT_EXPANDED_SECTION_TITLES.has(sec.title);
    });
    setExpandedSections(next);
  }, [item?.id]);

  const resetForms = () => {
    setMessageTypes(['1', '2', '3', '4']);
    setApproveMessage('');
    setCopyUsers('');
    setNextAssignee('');
    setApproveFiles([]);
    setTerminateComment('');
    setCommentContent('');
    setCommentError('');
    setCommentFiles([]);
  };

  const closeModal = () => {
    setModal(null);
    resetForms();
  };

  const openModal = (kind: ModalKind) => {
    resetForms();
    setModal(kind);
  };

  if (!item) {
    return (
      <div className="v2-ap-detail" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <V2Empty
          type="search"
          title="未选择审批事项"
          description="请从左侧列表点选单据，查看申请信息与审批流。"
        />
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(item.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleNotify = (value: string, locked: boolean) => {
    if (locked) return;
    setMessageTypes(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value],
    );
  };

  const handleConfirm = () => {
    if (modal === 'approve') {
      onApprove(item.id, {
        message: approveMessage,
        messageTypes,
        copyUsers,
        nextAssignee,
        attachments: approveFiles,
      });
      closeModal();
      return;
    }
    if (modal === 'terminate') {
      onTerminate(item.id, terminateComment);
      closeModal();
      return;
    }
    if (modal === 'comment') {
      const text = commentContent.trim();
      if (!text) {
        setCommentError('请输入评论内容');
        return;
      }
      onComment(item.id, text, commentFiles);
      closeModal();
      return;
    }
    if (modal === 'revoke') {
      onWithdraw(item.id);
      closeModal();
    }
  };

  const progressNodes = (item.flowNodes || []).map(node => {
    const displayName = (node.approverName || '').trim();
    const unassigned = !displayName || displayName === '待定';
    return {
      title: node.role || node.title,
      approver: {
        name: unassigned ? '待指定' : displayName,
        role: node.title !== node.role ? node.title : undefined,
        avatar: node.avatar,
      },
      status:
        node.status === 'approved'
          ? ('approved' as const)
          : node.status === 'processing'
          ? ('processing' as const)
          : node.status === 'rejected'
          ? ('rejected' as const)
          : node.status === 'cc'
          ? ('transferred' as const)
          : ('pending' as const),
      timestamp: node.time,
      comment: node.comment,
    };
  });

  const processingRole = item.flowNodes?.find(n => n.status === 'processing')?.role;

  const statusLabel =
    item.status === 'approved'
      ? '已完成'
      : item.status === 'rejected'
      ? '已驳回'
      : item.status === 'terminated'
      ? '已撤销'
      : processingRole
      ? `${processingRole}审批中`
      : '待审核';

  const hasGroupedSections = (item.detailSections || []).length > 0;
  const summaryFields: Array<{ label: string; value: string; emphasis?: boolean }> = [];
  if (item.bizDocNo) {
    summaryFields.push({ label: item.bizDocLabel || '业务单号', value: item.bizDocNo });
  }
  (item.keyFacts || []).forEach(fact => {
    if (summaryFields.some(f => f.label === fact.label && f.value === fact.value)) return;
    summaryFields.push(fact);
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const showTodoActions =
    activeTab === 'todo' &&
    item.status !== 'approved' &&
    item.status !== 'rejected' &&
    item.status !== 'terminated';
  const showInitiatedActions =
    activeTab === 'initiated' && (item.status === 'processing' || item.status === 'pending');

  return (
    <div className="v2-ap-detail">
      <div className="v2-ap-detail-inner">
        <div className="v2-ap-detail-hero">
          <div className="v2-ap-detail-hero__top">
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="v2-ap-detail-hero__id-row">
                <span className="v2-ap-detail-hero__id-label">审批流编号</span>
                <span className="v2-ap-detail-hero__id-pill" title="审批流编号">
                  {item.id}
                </span>
                <button
                  onClick={handleCopyId}
                  title="复制审批流编号"
                  aria-label="复制审批流编号"
                  className="v2-ap-detail-hero__copy"
                  type="button"
                >
                  {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                </button>
              </div>

              <h2 className="v2-ap-detail-hero__title">{item.title}</h2>
              {item.subtitle && (
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--ln-muted)', lineHeight: 1.4 }}>
                  {item.subtitle}
                </p>
              )}
            </div>

            {onCloseMobileDetail && (
              <V2Button variant="ghost" size="md" onClick={onCloseMobileDetail}>
                返回列表
              </V2Button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <V2Tag variant="primary">{item.typeLabel || '审批'}</V2Tag>
            {(item.urgency === 'urgent' || item.urgency === 'emergency') && (
              <V2Tag variant="error">加急</V2Tag>
            )}
          </div>

          <div className="v2-ap-detail-hero__meta-chips">
            <span className="v2-ap-detail-hero__meta-chip">
              <User style={{ width: 12, height: 12 }} />
              <strong>{item.initiatedBy}</strong>
            </span>
            <span className="v2-ap-detail-hero__meta-sep">·</span>
            <span className="v2-ap-detail-hero__meta-chip" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {item.initiatedAt}
            </span>
            <span className="v2-ap-detail-hero__meta-sep">·</span>
            <span className="v2-ap-detail-hero__meta-chip">
              <V2Badge
                variant={
                  item.status === 'approved'
                    ? 'success'
                    : item.status === 'rejected' || item.status === 'terminated'
                    ? 'error'
                    : 'warning'
                }
              >
                {statusLabel}
              </V2Badge>
            </span>
          </div>
        </div>

        {item.risks && item.risks.length > 0 && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'var(--ln-error-soft, #FEE2E2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <ShieldAlert style={{ width: 18, height: 18, color: 'var(--ln-error)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-error)' }}>风险提示</div>
              <div style={{ fontSize: '12px', color: '#991B1B', marginTop: '2px' }}>
                {item.risks.map(r => r.label).join('；')}
              </div>
            </div>
          </div>
        )}

        <div className="v2-ap-panel">
          <div className="v2-ap-panel__header">
            <h3 className="v2-ap-panel__title">
              <FileText style={{ width: 16, height: 16, color: 'var(--oneos-primary)' }} />
              申请信息
            </h3>
          </div>

          {summaryFields.length === 0 && !hasGroupedSections ? (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--ln-muted)' }}>暂无申请字段</p>
          ) : (
            <div className="v2-ap-apply-body">
              {summaryFields.length > 0 && (
                <div className="v2-ap-apply-summary">
                  <div className="v2-ap-apply-summary__label">关键摘要</div>
                  <FieldGrid fields={summaryFields} />
                </div>
              )}

              {hasGroupedSections &&
                item.detailSections!.map(sec => {
                  const open = expandedSections[sec.title] ?? false;
                  const fields = sec.items.map(it => ({
                    label: it.label,
                    value: it.value,
                    emphasis: it.isAmount,
                  }));
                  return (
                    <div key={sec.title} className={`v2-ap-apply-section${open ? ' is-open' : ''}`}>
                      <button
                        type="button"
                        className="v2-ap-apply-section__toggle"
                        onClick={() => toggleSection(sec.title)}
                        aria-expanded={open}
                      >
                        <span className="v2-ap-apply-section__title">{sec.title}</span>
                        <span className="v2-ap-apply-section__meta">{sec.items.length} 项</span>
                        <ChevronDown
                          className="v2-ap-apply-section__chevron"
                          style={{ width: 16, height: 16 }}
                          aria-hidden
                        />
                      </button>
                      {open && (
                        <div className="v2-ap-apply-section__body">
                          <FieldGrid fields={fields} />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {item.lineItems && item.lineItems.rows.length > 0 && (
          <div className="v2-ap-panel">
            <div className="v2-ap-panel__header">
              <h3 className="v2-ap-panel__title">
                <FileText style={{ width: 16, height: 16, color: 'var(--oneos-primary)' }} />
                明细
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <thead>
                  <tr>
                    {item.lineItems.columns.map(col => (
                      <th
                        key={col.key}
                        style={{
                          textAlign: 'left',
                          padding: '10px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--ln-muted)',
                          background: 'var(--ln-surface-pearl, #F8FAFC)',
                          borderBottom: '1px solid var(--ln-hairline)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {item.lineItems.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {item.lineItems!.columns.map(col => (
                        <td
                          key={col.key}
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid var(--ln-hairline)',
                            color: 'var(--ln-ink)',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row[col.key] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {item.attachments && item.attachments.length > 0 && (
          <div className="v2-ap-panel">
            <div className="v2-ap-panel__header">
              <h3 className="v2-ap-panel__title">
                <FileText style={{ width: 16, height: 16, color: 'var(--oneos-primary)' }} />
                附件
              </h3>
            </div>
            <div className="v2-ap-attachment-list">
              {item.attachments.map((att, aIdx) => (
                <div key={aIdx} className="v2-ap-attachment-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText style={{ width: 16, height: 16, color: 'var(--oneos-primary)' }} />
                    <span style={{ fontWeight: 500 }}>{att.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--ln-muted)' }}>({att.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`模拟下载附件: ${att.name}`)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--oneos-primary)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Download style={{ width: 13, height: 13 }} />
                    下载
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="v2-ap-panel">
          <div className="v2-ap-panel__header">
            <h3 className="v2-ap-panel__title" style={{ margin: 0 }}>
              <Clock style={{ width: 16, height: 16, color: 'var(--oneos-primary)' }} />
              审批流
            </h3>
          </div>
          {progressNodes.length > 0 ? (
            <V2ApprovalProgress nodes={progressNodes} direction="vertical" />
          ) : (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--ln-muted)' }}>暂无审批节点</p>
          )}
        </div>
      </div>

      {showTodoActions && (
        <div className="v2-ap-action-bar">
          <div style={{ fontSize: '13px', color: 'var(--ln-muted)' }}>
            您正在办理 <strong style={{ color: 'var(--ln-ink)' }}>{item.title}</strong>
          </div>
          <div className="v2-ap-action-bar__btns">
            <V2Button
              variant="primary"
              size="lg"
              icon={<CheckCircle style={{ width: 15, height: 15 }} />}
              onClick={() => openModal('approve')}
            >
              通过
            </V2Button>
            <V2Button
              variant="secondary"
              size="lg"
              icon={<Ban style={{ width: 15, height: 15 }} />}
              style={dangerOutlineStyle}
              onClick={() => openModal('terminate')}
            >
              终止
            </V2Button>
            <V2Button
              variant="secondary"
              size="lg"
              icon={<MessageSquare style={{ width: 15, height: 15 }} />}
              onClick={() => openModal('comment')}
            >
              评论
            </V2Button>
          </div>
        </div>
      )}

      {showInitiatedActions && (
        <div className="v2-ap-action-bar">
          <div style={{ fontSize: '13px', color: 'var(--ln-muted)' }}>该单据仍在审批中</div>
          <div className="v2-ap-action-bar__btns">
            <V2Button
              variant="secondary"
              size="lg"
              icon={<CornerUpLeft style={{ width: 14, height: 14 }} />}
              style={dangerOutlineStyle}
              onClick={() => openModal('revoke')}
            >
              撤销申请
            </V2Button>
            <V2Button
              variant="secondary"
              size="lg"
              icon={<MessageSquare style={{ width: 15, height: 15 }} />}
              onClick={() => openModal('comment')}
            >
              评论
            </V2Button>
          </div>
        </div>
      )}

      {modal && (
        <div className="v2-ap-modal-mask" role="presentation" onClick={closeModal}>
          <div
            className={`v2-ap-modal${modal === 'approve' ? ' v2-ap-modal--wide' : ''}`}
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()}
          >
            {modal === 'approve' && (
              <>
                <div className="v2-ap-modal__title">审批通过</div>
                <div className="v2-ap-modal__form">
                  <div className="v2-ap-modal__field">
                    <label className="v2-ap-modal__label">通知方式</label>
                    <div className="v2-ap-modal__checks">
                      {NOTIFY_OPTIONS.map(opt => {
                        const checked = messageTypes.includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className={`v2-ap-modal__check${opt.locked ? ' is-locked' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={opt.locked}
                              onChange={() => toggleNotify(opt.value, opt.locked)}
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="v2-ap-modal__field">
                    <label className="v2-ap-modal__label">附件上传</label>
                    <button
                      type="button"
                      className="v2-ap-modal__upload"
                      onClick={() => {
                        if (approveFiles.length >= 10) return;
                        setApproveFiles(prev => [...prev, `附件-${prev.length + 1}.pdf`]);
                      }}
                    >
                      <Upload style={{ width: 16, height: 16 }} />
                      点击上传（演示，最多 10 个）
                    </button>
                    {approveFiles.length > 0 && (
                      <ul className="v2-ap-modal__file-list">
                        {approveFiles.map((name, idx) => (
                          <li key={`${name}-${idx}`}>
                            <span>{name}</span>
                            <button
                              type="button"
                              aria-label={`移除 ${name}`}
                              onClick={() =>
                                setApproveFiles(prev => prev.filter((_, i) => i !== idx))
                              }
                            >
                              <X style={{ width: 14, height: 14 }} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="v2-ap-modal__field">
                    <label className="v2-ap-modal__label" htmlFor="ap-copy-users">
                      抄送人
                    </label>
                    <input
                      id="ap-copy-users"
                      className="v2-ap-modal__input"
                      placeholder="请选择抄送人"
                      value={copyUsers}
                      onChange={e => setCopyUsers(e.target.value)}
                    />
                  </div>

                  <div className="v2-ap-modal__field">
                    <label className="v2-ap-modal__label" htmlFor="ap-next-assignee">
                      下一步审批人
                    </label>
                    <input
                      id="ap-next-assignee"
                      className="v2-ap-modal__input"
                      placeholder="请选择下一步审批人"
                      value={nextAssignee}
                      onChange={e => setNextAssignee(e.target.value)}
                    />
                  </div>

                  <div className="v2-ap-modal__field">
                    <label className="v2-ap-modal__label" htmlFor="ap-approve-msg">
                      审批意见
                    </label>
                    <textarea
                      id="ap-approve-msg"
                      className="v2-ap-modal__textarea"
                      rows={4}
                      placeholder="请输入审批意见"
                      value={approveMessage}
                      onChange={e => setApproveMessage(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {modal === 'terminate' && (
              <>
                <div className="v2-ap-modal__title">审批终止</div>
                <p className="v2-ap-modal__desc">确定终止当前审批流程吗？</p>
                <div className="v2-ap-modal__field">
                  <textarea
                    className="v2-ap-modal__textarea"
                    rows={4}
                    placeholder="审批意见(可选)"
                    value={terminateComment}
                    onChange={e => setTerminateComment(e.target.value)}
                    aria-label="审批意见（可选）"
                  />
                </div>
              </>
            )}

            {modal === 'comment' && (
              <>
                <div className="v2-ap-modal__title">添加评论</div>
                <div className="v2-ap-modal__field">
                  <label className="v2-ap-modal__label" htmlFor="ap-comment">
                    评论内容 <span className="v2-ap-modal__required">*</span>
                  </label>
                  <textarea
                    id="ap-comment"
                    className="v2-ap-modal__textarea"
                    rows={6}
                    maxLength={500}
                    placeholder="请输入评论内容"
                    value={commentContent}
                    onChange={e => {
                      setCommentContent(e.target.value);
                      if (commentError) setCommentError('');
                    }}
                  />
                  <div className="v2-ap-modal__count">{commentContent.length} / 500</div>
                  {commentError && <div className="v2-ap-modal__error">{commentError}</div>}
                </div>
                <div className="v2-ap-modal__field">
                  <label className="v2-ap-modal__label">附件上传</label>
                  <input
                    ref={commentFileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.bmp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    className="v2-ap-modal__file-input"
                    aria-label="上传评论附件"
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      const names = files.map(f => f.name);
                      setCommentFiles(prev => [...prev, ...names].slice(0, 10));
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    className="v2-ap-modal__upload"
                    onClick={() => commentFileInputRef.current?.click()}
                  >
                    <Upload style={{ width: 16, height: 16 }} />
                    点击或选择附件（PDF / 图片 / Office 常用格式，最多 10 个）
                  </button>
                  {commentFiles.length > 0 && (
                    <ul className="v2-ap-modal__file-list">
                      {commentFiles.map((name, idx) => (
                        <li key={`${name}-${idx}`}>
                          <span>{name}</span>
                          <button
                            type="button"
                            aria-label={`移除 ${name}`}
                            onClick={() =>
                              setCommentFiles(prev => prev.filter((_, i) => i !== idx))
                            }
                          >
                            <X style={{ width: 14, height: 14 }} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {modal === 'revoke' && (
              <>
                <div className="v2-ap-modal__title">提示</div>
                <p className="v2-ap-modal__desc">确定要撤销该申请吗？</p>
              </>
            )}

            <div className="v2-ap-modal__footer">
              <V2Button variant="secondary" size="md" onClick={closeModal}>
                取消
              </V2Button>
              <V2Button
                variant={modal === 'terminate' || modal === 'revoke' ? 'danger' : 'primary'}
                size="md"
                onClick={handleConfirm}
              >
                {modal === 'comment' || modal === 'approve' ? '确认' : '确定'}
              </V2Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
