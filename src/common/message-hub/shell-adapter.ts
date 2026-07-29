import type { ShellNoticeItem } from '../oneos-app-shell/notice-bridge';
import { resolveMessageTarget } from './resolve';
import { ROUTE_RULES } from './routes';
import type { HubMessage } from './types';

export function toShellNoticeItem(msg: HubMessage): ShellNoticeItem {
  const web = resolveMessageTarget(msg, 'web', ROUTE_RULES);
  return {
    id: msg.id,
    type:
      msg.bizType === 'urge.remind' ||
      (msg.priority === 'high' && msg.bizType.startsWith('urge'))
        ? '催办提醒'
        : msg.bizTag,
    bizTag: msg.bizTag,
    title: msg.title,
    summary: msg.summary,
    detail: msg.detail,
    time: msg.createdAt.includes('T')
      ? msg.createdAt.replace('T', ' ').slice(0, 16)
      : msg.createdAt.slice(0, 16),
    read: !!msg.readAt,
    href: web.ok && web.uri.startsWith('/') ? web.uri : undefined,
    taskId: msg.bizId,
  };
}

export function toShellNoticeItems(messages: HubMessage[]): ShellNoticeItem[] {
  return messages.map(toShellNoticeItem);
}
