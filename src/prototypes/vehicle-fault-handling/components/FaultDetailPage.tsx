import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  User,
  AlertTriangle,
  Download,
  PauseCircle,
  BellRing,
  Wrench,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import type { FaultRecord, FaultTaskStatus } from '../types';
import { V2Timeline } from '../../../resources/design-system/components/UIComponents';
import {
  TASK_STATUS_LABEL,
  formatCategories,
  getSlaInfo,
} from '../utils';

export interface FaultDetailPageProps {
  item: FaultRecord;
  onBack: () => void;
  onOpenEdit: (item: FaultRecord) => void;
  onOpenSuspend: (item: FaultRecord) => void;
  onOpenNotice: (item: FaultRecord) => void;
}

const levelTone = (level: FaultRecord['level']) =>
  level === 'L1-特急' ? 'l1' : level === 'L2-紧急' ? 'l2' : 'plain';

const resolveMetaClass = (status: FaultRecord['resolveStatus']) =>
  status === '未解决' ? ' is-danger' : status === '临时排故' ? ' is-warning' : '';

const statusMetaClass = (status: FaultTaskStatus) =>
  status === 'suspended' ? ' is-warning' : '';

export const FaultDetailPage: React.FC<FaultDetailPageProps> = ({
  item,
  onBack,
  onOpenEdit,
  onOpenSuspend,
  onOpenNotice,
}) => {
  const [copied, setCopied] = useState(false);
  const sla = useMemo(() => getSlaInfo(item), [item]);

  const suspendTimeline = useMemo(
    () =>
      item.suspendHistory.map((sup) => ({
        title: sup.suspendType,
        timestamp: sup.suspendTime,
        operator: `操作人：${sup.operator}`,
        content: `原因：${sup.reason}`,
        color: 'warning' as const,
        icon: <PauseCircle style={{ width: 12, height: 12 }} />,
        tag: '挂起',
      })),
    [item]
  );

  const noticeTimeline = useMemo(
    () =>
      item.notificationHistory.map((notif) => ({
        title: `[${notif.channel}] ${notif.recipient}（${notif.role}）`,
        timestamp: notif.sendTime,
        operator: notif.status,
        content: notif.content,
        color: 'violet' as const,
        icon: <BellRing style={{ width: 12, height: 12 }} />,
        tag: notif.channel,
      })),
    [item]
  );

  const handleCopyId = () => {
    void navigator.clipboard.writeText(item.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="v2-fh-page">
      <header className="v2-fh-form-header">
        <div className="v2-fh-form-header__left">
          <button type="button" className="v2-fh-form-header__back" onClick={onBack}>
            <ArrowLeft style={{ width: 14, height: 14 }} aria-hidden />
            返回台账
          </button>
          <div className="v2-fh-form-header__divider" aria-hidden />
          <div className="v2-fh-form-header__titles">
            <div className="v2-fh-form-header__meta">
              <span>车辆运维 / 故障处置</span>
              <span className="v2-fh-form-header__code">{item.id}</span>
            </div>
            <h1>故障处置详情</h1>
          </div>
        </div>
        <div className="v2-fh-form-header__actions">
          {item.taskStatus === 'processing' ? (
            <button
              type="button"
              className="v2-fh-btn v2-fh-btn--secondary"
              onClick={() => onOpenSuspend(item)}
            >
              <PauseCircle style={{ width: 14, height: 14 }} aria-hidden />
              申请挂起
            </button>
          ) : null}
          {item.taskStatus !== 'archived' ? (
            <button
              type="button"
              className="v2-fh-btn v2-fh-btn--primary"
              onClick={() => onOpenEdit(item)}
            >
              <Wrench style={{ width: 14, height: 14 }} aria-hidden />
              处置与归档
            </button>
          ) : null}
        </div>
      </header>

      <div className="v2-fh-page__body v2-fh-detail-layout">
        <div className="v2-fh-detail-main">
          <section className="v2-fh-page-card">
            <div className="v2-fh-drawer-card__row">
              <div className="v2-fh-drawer-meta">
                <span className="v2-fh-page-plate tabular-nums">{item.plate}</span>
                <span className="v2-fh-cell-sub">
                  {item.brand} {item.model}
                </span>
                <button
                  type="button"
                  className="v2-fh-drawer-icon-btn"
                  onClick={handleCopyId}
                  aria-label={copied ? '已复制' : '复制故障单号'}
                  title={item.id}
                >
                  {copied ? (
                    <Check style={{ width: 14, height: 14 }} aria-hidden />
                  ) : (
                    <Copy style={{ width: 14, height: 14 }} aria-hidden />
                  )}
                </button>
              </div>
              <div className="v2-fh-drawer-tags">
                <span className={`v2-fh-meta-text${statusMetaClass(item.taskStatus)}`}>
                  {TASK_STATUS_LABEL[item.taskStatus]}
                </span>
                <span className={`v2-fh-meta-text${resolveMetaClass(item.resolveStatus)}`}>
                  {item.resolveStatus}
                </span>
                <span className={`v2-fh-sla-hint ${sla.cls}`}>{sla.label}</span>
              </div>
            </div>

            <div className="v2-fh-drawer-kv-grid">
              <div>
                <span className="v2-fh-drawer-kv__label">故障部位</span>
                <div className="v2-fh-drawer-kv__value">
                  {formatCategories(item.categories)}
                </div>
              </div>
              <div>
                <span className="v2-fh-drawer-kv__label">故障等级</span>
                <div
                  className={`v2-fh-drawer-kv__value v2-fh-level v2-fh-level--${levelTone(item.level)}`}
                >
                  {item.level}
                </div>
              </div>
              <div>
                <span className="v2-fh-drawer-kv__label">运营公司</span>
                <div className="v2-fh-drawer-kv__value">{item.operateCompany}</div>
              </div>
              <div>
                <span className="v2-fh-drawer-kv__label">运营城市</span>
                <div className="v2-fh-drawer-kv__value">{item.operateCity}</div>
              </div>
              <div>
                <span className="v2-fh-drawer-kv__label">运维负责人</span>
                <div className="v2-fh-drawer-kv__value v2-fh-drawer-kv__value--accent">
                  <User style={{ width: 12, height: 12 }} aria-hidden />
                  {item.opsManager}
                </div>
              </div>
            </div>
          </section>

          <section className="v2-fh-page-card">
            <h3 className="v2-fh-drawer-card__title">
              <AlertTriangle style={{ width: 16, height: 16 }} aria-hidden />
              故障描述与 AI 排查摘要
            </h3>
            <p className="v2-fh-drawer-desc">{item.description}</p>
            {item.aiChatSummary ? (
              <div className="v2-fh-drawer-ai">{item.aiChatSummary}</div>
            ) : null}
          </section>

          <section className="v2-fh-page-card">
            <h3 className="v2-fh-drawer-card__title">
              <Wrench style={{ width: 16, height: 16 }} aria-hidden />
              处置结果与索赔证据链
            </h3>
            <div className="v2-fh-drawer-fields">
              <div>
                <span className="v2-fh-drawer-kv__label">故障部位</span>
                <div className="v2-fh-drawer-kv__value">
                  {formatCategories(item.categories)}
                </div>
              </div>
              <div>
                <span className="v2-fh-drawer-kv__label">维修工厂/服务站</span>
                <div className="v2-fh-drawer-kv__value">
                  {item.repairFactory || '尚未指定'}
                </div>
              </div>
              <div>
                <span className="v2-fh-drawer-kv__label">发生地点</span>
                <div className="v2-fh-drawer-kv__value">
                  {item.faultLocation || '未录入'}
                </div>
              </div>
              <div>
                <span className="v2-fh-drawer-kv__label">估计/实际费用</span>
                <div className="v2-fh-drawer-kv__value v2-fh-drawer-kv__value--accent tabular-nums">
                  {item.repairCost != null
                    ? `¥${item.repairCost.toLocaleString('zh-CN', {
                        minimumFractionDigits: 2,
                      })}`
                    : '无费用/免费质保'}
                </div>
              </div>
              <div>
                <span className="v2-fh-drawer-kv__label">解决情况</span>
                <div className="v2-fh-drawer-kv__value">{item.resolveStatus}</div>
              </div>
            </div>
            {item.repairResult ? (
              <div className="v2-fh-drawer-desc">
                <strong>处置总结：</strong>
                {item.repairResult}
              </div>
            ) : null}
            <div className="v2-fh-drawer-attach">
              <div className="v2-fh-drawer-attach__label">
                索赔与排故证据链附件（{item.attachments.length}）
              </div>
              {item.attachments.length === 0 ? (
                <div className="v2-fh-drawer-attach__empty" role="status">
                  <AlertTriangle style={{ width: 14, height: 14 }} aria-hidden />
                  <span>尚无索赔证据附件，归档前必须至少上传 1 份照片或维修工单。</span>
                </div>
              ) : (
                <ul className="v2-fh-drawer-attach__list">
                  {item.attachments.map((att) => (
                    <li key={att.id} className="v2-fh-drawer-attach__item">
                      <div className="v2-fh-drawer-attach__name">
                        <FileText style={{ width: 14, height: 14 }} aria-hidden />
                        <span>{att.name}</span>
                        <span className="v2-fh-drawer-attach__size">({att.size})</span>
                      </div>
                      <button
                        type="button"
                        className="v2-fh-drawer-icon-btn v2-fh-drawer-icon-btn--text"
                        onClick={() => window.alert(`演示模拟下载证据包: ${att.name}`)}
                      >
                        <Download style={{ width: 12, height: 12 }} aria-hidden />
                        下载
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <aside className="v2-fh-detail-aside">
          <section className="v2-fh-page-card v2-fh-detail-aside__card">
            <div className="v2-fh-drawer-card__row">
              <h3 className="v2-fh-drawer-card__title">
                <BellRing style={{ width: 16, height: 16 }} aria-hidden />
                催办与督办通知留痕（{item.notificationHistory.length}）
              </h3>
              <button
                type="button"
                className="v2-fh-drawer-icon-btn v2-fh-drawer-icon-btn--text"
                onClick={() => onOpenNotice(item)}
              >
                <Send style={{ width: 12, height: 12 }} aria-hidden />
                发送催办
              </button>
            </div>
            {noticeTimeline.length === 0 ? (
              <p className="v2-fh-drawer-empty">暂无催办通知记录</p>
            ) : (
              <div className="v2-fh-detail-aside__scroll">
                <V2Timeline items={noticeTimeline} />
              </div>
            )}
          </section>

          {suspendTimeline.length > 0 ? (
            <section className="v2-fh-page-card v2-fh-detail-aside__card">
              <h3 className="v2-fh-drawer-card__title">
                <PauseCircle style={{ width: 16, height: 16 }} aria-hidden />
                挂起保护历史
              </h3>
              <div className="v2-fh-detail-aside__scroll">
                <V2Timeline items={suspendTimeline} />
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
};
