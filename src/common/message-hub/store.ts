import { SEED_MESSAGES } from './seed';
import type { HubMessage, MessagePriority } from './types';

const STORAGE_KEY = 'oneos.message-hub.readAt.v1';

const PRIORITY_ORDER: Record<MessagePriority, number> = {
  high: 0,
  normal: 1,
};

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadReadAtMap(): Record<string, string> {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    // ignore corrupt storage
  }
  return {};
}

function persistReadAtMap(map: Record<string, string>): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
}

/** Clone seed messages and merge persisted readAt from localStorage. */
export function loadMessages(): HubMessage[] {
  const readAtMap = loadReadAtMap();
  return SEED_MESSAGES.map((msg) => {
    const persisted = readAtMap[msg.id];
    if (persisted) {
      return { ...msg, readAt: persisted };
    }
    return { ...msg };
  });
}

export function markRead(id: string, messages?: HubMessage[]): HubMessage[] {
  const now = new Date().toISOString();
  const base = messages ?? loadMessages();
  const readAtMap = loadReadAtMap();
  readAtMap[id] = now;
  persistReadAtMap(readAtMap);
  return base.map((m) => (m.id === id ? { ...m, readAt: now } : { ...m }));
}

/** Clear persisted readAt for an id (demo reset / sync with release-seen). Seed readAt unchanged. */
export function clearRead(id: string, messages?: HubMessage[]): HubMessage[] {
  const base = messages ?? loadMessages();
  const readAtMap = loadReadAtMap();
  delete readAtMap[id];
  persistReadAtMap(readAtMap);
  const seed = SEED_MESSAGES.find((m) => m.id === id);
  return base.map((m) => {
    if (m.id !== id) return { ...m };
    return { ...m, readAt: seed?.readAt };
  });
}

export function listForRole(messages: HubMessage[], roleId?: string): HubMessage[] {
  if (!roleId) return messages;
  return messages.filter(
    (m) => !m.audienceRoleIds.length || m.audienceRoleIds.includes(roleId),
  );
}

export function sortMessages(messages: HubMessage[]): HubMessage[] {
  return [...messages].sort((a, b) => {
    const aUnread = a.readAt ? 1 : 0;
    const bUnread = b.readAt ? 1 : 0;
    if (aUnread !== bUnread) return aUnread - bUnread;

    const pa = PRIORITY_ORDER[a.priority];
    const pb = PRIORITY_ORDER[b.priority];
    if (pa !== pb) return pa - pb;

    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function unreadCount(messages: HubMessage[], roleId?: string): number {
  return listForRole(messages, roleId).filter((m) => !m.readAt).length;
}

export function getSortedMessages(roleId?: string): HubMessage[] {
  return sortMessages(listForRole(loadMessages(), roleId));
}
