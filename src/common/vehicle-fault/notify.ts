import type { FaultRecord, NotifyChannel, NotifyKind } from './types';
import { FAULT_STATUS_LABEL, OPS_SUPERVISOR_NAME } from './types';
import { deadlineOf, remainingDays } from './sla';

export function resolveNotifyRecipient(record: FaultRecord, kind: NotifyKind): string {
  if (kind === 'overdue') return OPS_SUPERVISOR_NAME;
  if (record.assignee?.trim()) return record.assignee;
  return OPS_SUPERVISOR_NAME;
}

export function renderSms(record: FaultRecord, kind: NotifyKind): string {
  const vehicle = `${record.plateNo} ${record.brand}${record.model}`;
  if (kind === 'due_soon') {
    return `【OneOS故障】${record.code} ${vehicle} 将于 ${deadlineOf(record.reportedAt)} 到期（剩7天）仍未归档，请尽快处置。详情见故障处置。`;
  }
  const left = remainingDays(record.reportedAt);
  const overdue = Math.abs(Math.min(left, 0));
  return `【OneOS故障·逾期】${record.code} 已超 30 天未归档（状态：${FAULT_STATUS_LABEL[record.status]}，逾期 ${overdue} 天），请主管督促闭环。`;
}

export function renderEmailTitle(record: FaultRecord, kind: NotifyKind): string {
  if (kind === 'due_soon') {
    return `【故障临期提醒】${record.code} 距闭环截止还剩 7 天`;
  }
  return `【故障逾期升级】${record.code} 已超过 30 天未归档`;
}

export function renderEmailBody(record: FaultRecord, kind: NotifyKind): string {
  const hang = record.hangHistory
    .map((h) => `${h.at} ${h.by}：${h.reason}`)
    .join('；') || '无';
  const lastNotify = record.notifications[record.notifications.length - 1];
  const lines = [
    `故障号：${record.code}`,
    `车辆：${record.plateNo} · ${record.brand} ${record.model}`,
    `上报时间：${record.reportedAt}`,
    `当前状态：${FAULT_STATUS_LABEL[record.status]}`,
    `截止日：${deadlineOf(record.reportedAt)}`,
    `处理人：${record.assignee || '（未接手）'}`,
    `系统链接：/prototypes/vehicle-fault-handling#id=${record.id}`,
  ];
  if (kind === 'overdue') {
    lines.push(`逾期天数：${Math.abs(Math.min(remainingDays(record.reportedAt), 0))}`);
    lines.push(`挂起原因摘要：${hang}`);
    lines.push(`末次催办：${lastNotify?.sentAt || '无'}`);
  }
  return lines.join('\n');
}

export function buildNotifyPair(
  record: FaultRecord,
  kind: NotifyKind,
  sentAt: string,
): Array<{
  id: string;
  kind: NotifyKind;
  channel: NotifyChannel;
  to: string;
  title: string;
  body: string;
  sentAt: string;
  demo: true;
}> {
  const to = resolveNotifyRecipient(record, kind);
  const base = `${record.id}-${kind}-${sentAt}`;
  return [
    {
      id: `${base}-sms`,
      kind,
      channel: 'sms',
      to,
      title: kind === 'due_soon' ? '临期短信' : '逾期短信',
      body: renderSms(record, kind),
      sentAt,
      demo: true,
    },
    {
      id: `${base}-email`,
      kind,
      channel: 'email',
      to,
      title: renderEmailTitle(record, kind),
      body: renderEmailBody(record, kind),
      sentAt,
      demo: true,
    },
  ];
}
