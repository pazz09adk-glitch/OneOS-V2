import React, { useEffect, useMemo, useState } from 'react';
import type { NoticeItem, RoleConfig } from '../types';
import { MOCK_NOTICES } from '../mockData';
import {
  isNoticeAction,
  postNoticesSync,
  type ShellNoticeItem,
} from '../../../common/oneos-app-shell/notice-bridge';

export interface NoticeDrawerProps {
  currentRole: RoleConfig;
}

function toShellNotice(n: NoticeItem): ShellNoticeItem {
  return {
    id: n.id,
    type: n.isUrge ? '催办提醒' : '系统通知',
    bizTag: n.isUrge ? '催办' : '通知',
    title: n.title,
    summary: n.content,
    detail: n.content,
    time: n.sendTime.slice(0, 16),
    read: n.read,
    href: n.href,
  };
}

/** 通知仅同步到「原型外壳演示」顶栏，工作台内不展示铃铛 */
export const NoticeDrawer: React.FC<NoticeDrawerProps> = ({ currentRole }) => {
  const [notices, setNotices] = useState<NoticeItem[]>(MOCK_NOTICES);

  const roleNotices = useMemo(
    () => notices.filter((n) => n.roleIds.includes(currentRole.id)),
    [notices, currentRole.id],
  );

  const syncToShell = (list: NoticeItem[]) => {
    if (typeof window === 'undefined' || window.parent === window) return;
    const shellItems = list.map(toShellNotice);
    postNoticesSync(window.parent, {
      notices: shellItems,
      unreadCount: shellItems.filter((n) => !n.read).length,
      source: 'oneos-web-workbench-new',
    });
  };

  useEffect(() => {
    syncToShell(roleNotices);
  }, [roleNotices]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!isNoticeAction(e.data)) return;
      const { action, noticeId } = e.data;

      if (action === 'read') {
        setNotices((prev) =>
          prev.map((n) => (n.id === noticeId ? { ...n, read: true } : n)),
        );
        return;
      }

      if (action === 'handle' || action === 'open') {
        let href: string | undefined;
        setNotices((prev) => {
          const target = prev.find((n) => n.id === noticeId);
          href = target?.href;
          return prev.map((n) => (n.id === noticeId ? { ...n, read: true } : n));
        });
        if (href) {
          window.location.href = href;
        }
      }
    };

    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  return null;
};
