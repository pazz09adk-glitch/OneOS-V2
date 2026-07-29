import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import type { ShellNoticeItem } from './notice-bridge';

const MESSAGE_CENTER_HREF = '/prototypes/message-center';

/** 气泡/标签：x条新通知，请尽快处理（阿拉伯数字） */
function formatNewMessageTip(count: number): string {
  return `${count}条新通知，请尽快处理`;
}

function compareNoticePriority(a: ShellNoticeItem, b: ShellNoticeItem): number {
  const aUrge = a.type === '催办提醒' ? 0 : 1;
  const bUrge = b.type === '催办提醒' ? 0 : 1;
  if (aUrge !== bUrge) return aUrge - bUrge;
  return b.time.localeCompare(a.time);
}

function defaultNavigateToMessageCenter() {
  if (typeof window === 'undefined') return;
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'ONEOS_SHELL_NAV', href: MESSAGE_CENTER_HREF }, '*');
  } else {
    window.location.href = MESSAGE_CENTER_HREF;
  }
}

type ShellNoticeCenterProps = {
  notices: ShellNoticeItem[];
  unreadCount: number;
  onRead: (notice: ShellNoticeItem) => void;
  onOpen: (notice: ShellNoticeItem) => void;
  onHandle: (notice: ShellNoticeItem) => void;
  /** 「查看全部」：关闭面板后导航到消息中心；未传则默认跳转 /prototypes/message-center */
  onViewAll?: () => void;
};

function NoticeListItem({
  notice,
  showHandle,
  showSummary = false,
  onSelect,
  onHandle,
}: {
  notice: ShellNoticeItem;
  showHandle: boolean;
  showSummary?: boolean;
  onSelect: (notice: ShellNoticeItem) => void;
  onHandle: (notice: ShellNoticeItem) => void;
}) {
  const canHandle = !!(notice.href || notice.taskId);
  return (
    <li className={`oneos-shell-notify__item${!notice.read ? ' is-unread' : ''}`}>
      <button type="button" className="oneos-shell-notify__item-main" onClick={() => onSelect(notice)}>
        <div className="oneos-shell-notify__meta">
          <span className="oneos-shell-notify__dot" aria-hidden />
          <span className="oneos-shell-notify__time">{notice.time}</span>
          {notice.type === '催办提醒' ? (
            <span className="oneos-shell-notify__chip oneos-shell-notify__chip--urge">催办提醒</span>
          ) : null}
          <span className="oneos-shell-notify__chip">{notice.bizTag}</span>
        </div>
        <p className="oneos-shell-notify__text">{notice.detail || notice.title}</p>
        {showSummary && notice.summary ? (
          <p className="oneos-shell-notify__summary">{notice.summary}</p>
        ) : null}
      </button>
      {showHandle && canHandle ? (
        <button
          type="button"
          className="oneos-shell-notify__handle"
          onClick={() => onHandle(notice)}
        >
          去处理
        </button>
      ) : null}
    </li>
  );
}

/** 顶栏铃铛 + 新消息闪烁提示 + 下拉通知中心（对齐工作台 NoticePanel） */
export function ShellNoticeCenter({
  notices,
  unreadCount,
  onRead,
  onOpen: _onOpen,
  onHandle,
  onViewAll,
}: ShellNoticeCenterProps) {
  const [open, setOpen] = useState(false);
  const [detailNotice, setDetailNotice] = useState<ShellNoticeItem | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const pool = useMemo(
    () => notices.filter((n) => !n.read).slice().sort(compareNoticePriority),
    [notices],
  );

  const closeAll = () => {
    setOpen(false);
    setDetailNotice(null);
  };

  useEffect(() => {
    if (!open && !detailNotice) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!wrapRef.current?.contains(target)) closeAll();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (detailNotice) setDetailNotice(null);
      else setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, detailNotice]);

  const handleSelect = (notice: ShellNoticeItem) => {
    onRead(notice);
    setDetailNotice(notice);
    setOpen(false);
  };

  const handleAction = (notice: ShellNoticeItem) => {
    onRead(notice);
    onHandle(notice);
    closeAll();
  };

  const handleViewAll = () => {
    closeAll();
    if (onViewAll) onViewAll();
    else defaultNavigateToMessageCenter();
  };

  return (
    <div className="oneos-shell-notify" ref={wrapRef} data-annotation-id="wb-notice">
      {unreadCount > 0 && !open && !detailNotice ? (
        <span className="oneos-shell-notify__callout" aria-live="polite">
          {formatNewMessageTip(unreadCount)}
        </span>
      ) : null}
      <button
        type="button"
        className={`oneos-shell-icon-btn oneos-shell-icon-btn--notify${unreadCount > 0 ? ' has-unread' : ''}${open || detailNotice ? ' is-open' : ''}`}
        aria-label={unreadCount > 0 ? formatNewMessageTip(unreadCount) : '通知'}
        aria-expanded={open || !!detailNotice}
        aria-haspopup="dialog"
        onClick={() => {
          if (detailNotice) {
            setDetailNotice(null);
            setOpen(false);
            return;
          }
          setOpen((v) => !v);
        }}
      >
        <Bell size={16} />
      </button>

      {open && !detailNotice ? (
        <div className="oneos-shell-notify__panel" role="dialog" aria-label="通知中心">
          <div className="oneos-shell-notify__header">
            <h3 className="oneos-shell-notify__title">
              通知中心
              {unreadCount > 0 ? (
                <span className="oneos-shell-notify__tag">{formatNewMessageTip(unreadCount)}</span>
              ) : null}
            </h3>
            <button type="button" className="oneos-shell-notify__link" onClick={handleViewAll}>
              查看全部
            </button>
          </div>

          <div className="oneos-shell-notify__body">
            {pool.length ? (
              <ul className="oneos-shell-notify__list">
                {pool.map((notice) => (
                  <NoticeListItem
                    key={notice.id}
                    notice={notice}
                    showHandle
                    onSelect={handleSelect}
                    onHandle={handleAction}
                  />
                ))}
              </ul>
            ) : (
              <div className="oneos-shell-notify__empty" role="status">
                <div className="oneos-shell-notify__empty-visual" aria-hidden="true">
                  <span className="oneos-shell-notify__empty-ring" />
                  <span className="oneos-shell-notify__empty-icon">
                    <BellOff size={22} strokeWidth={1.75} />
                  </span>
                </div>
                <p className="oneos-shell-notify__empty-title">暂无新消息</p>
                <p className="oneos-shell-notify__empty-desc">
                  当前通知均已读完
                  <br />
                  有新催办或业务提醒时会显示在这里
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {detailNotice ? (
        <div className="oneos-shell-notify__detail" role="dialog" aria-modal="true" aria-label="通知详情">
          <div className="oneos-shell-notify__detail-head">
            <h3 className="oneos-shell-notify__detail-title">
              {detailNotice.type === '催办提醒' ? (
                <span className="oneos-shell-notify__chip oneos-shell-notify__chip--urge">催办提醒</span>
              ) : null}
              <span className="oneos-shell-notify__chip">{detailNotice.bizTag}</span>
              <span className="oneos-shell-notify__detail-name">{detailNotice.title}</span>
            </h3>
            <button
              type="button"
              className="oneos-shell-notify__detail-close"
              onClick={() => setDetailNotice(null)}
            >
              关闭
            </button>
          </div>
          <div className="oneos-shell-notify__detail-body">
            <span className="oneos-shell-notify__time">{detailNotice.time}</span>
            <p className="oneos-shell-notify__detail-text">{detailNotice.detail || detailNotice.title}</p>
            {detailNotice.summary ? (
              <p className="oneos-shell-notify__detail-summary">{detailNotice.summary}</p>
            ) : null}
          </div>
          <div className="oneos-shell-notify__detail-foot">
            <button type="button" className="oneos-shell-notify__detail-secondary" onClick={() => setDetailNotice(null)}>
              知道了
            </button>
            {(detailNotice.href || detailNotice.taskId) && (
              <button
                type="button"
                className="oneos-shell-notify__detail-primary"
                onClick={() => handleAction(detailNotice)}
              >
                去处理
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
