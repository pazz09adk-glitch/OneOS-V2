/** 工作台 iframe ↔ 外壳顶栏通知中心 postMessage 协议 */

export const ONEOS_NOTICES_SYNC = 'ONEOS_NOTICES_SYNC';
export const ONEOS_NOTICE_ACTION = 'ONEOS_NOTICE_ACTION';

export type ShellNoticeItem = {
  id: string;
  type: string;
  bizTag: string;
  title: string;
  summary: string;
  detail: string;
  time: string;
  read: boolean;
  href?: string;
  taskId?: string;
};

export type NoticesSyncPayload = {
  type: typeof ONEOS_NOTICES_SYNC;
  unreadCount: number;
  notices: ShellNoticeItem[];
  source?: string;
};

export type NoticeActionPayload = {
  type: typeof ONEOS_NOTICE_ACTION;
  action: 'read' | 'handle' | 'open';
  noticeId: string;
};

export function isNoticesSync(data: unknown): data is NoticesSyncPayload {
  return (
    !!data &&
    typeof data === 'object' &&
    (data as NoticesSyncPayload).type === ONEOS_NOTICES_SYNC &&
    Array.isArray((data as NoticesSyncPayload).notices)
  );
}

export function isNoticeAction(data: unknown): data is NoticeActionPayload {
  return (
    !!data &&
    typeof data === 'object' &&
    (data as NoticeActionPayload).type === ONEOS_NOTICE_ACTION &&
    typeof (data as NoticeActionPayload).noticeId === 'string'
  );
}

export function postNoticesSync(target: Window, payload: Omit<NoticesSyncPayload, 'type'>) {
  target.postMessage({ type: ONEOS_NOTICES_SYNC, ...payload }, '*');
}

export function postNoticeAction(
  target: Window,
  action: NoticeActionPayload['action'],
  noticeId: string,
) {
  target.postMessage({ type: ONEOS_NOTICE_ACTION, action, noticeId }, '*');
}
