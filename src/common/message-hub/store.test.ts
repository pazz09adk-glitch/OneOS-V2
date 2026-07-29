import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HubMessage } from './types';
import {
  clearRead,
  listForRole,
  loadMessages,
  markRead,
  sortMessages,
  unreadCount,
} from './store';

const STORAGE_KEY = 'oneos.message-hub.readAt.v1';

function installLocalStorageMock() {
  const store = new Map<string, string>();
  const mock = {
    getItem: vi.fn((key: string) => (store.has(key) ? store.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
  vi.stubGlobal('localStorage', mock);
  vi.stubGlobal('window', { localStorage: mock });
  return { store, mock };
}

function makeMsg(overrides: Partial<HubMessage> & Pick<HubMessage, 'id'>): HubMessage {
  return {
    sourceSystem: 'oneos',
    bizType: 'system.notice',
    bizId: 'biz-1',
    title: '标题',
    summary: '摘要',
    detail: '详情',
    priority: 'normal',
    createdAt: '2026-07-18T09:00:00+08:00',
    audienceRoleIds: [],
    channels: [],
    bizTag: '系统通知',
    ...overrides,
  };
}

describe('message-hub store', () => {
  let storage: ReturnType<typeof installLocalStorageMock>;

  beforeEach(() => {
    storage = installLocalStorageMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('listForRole includes empty audience or matching role', () => {
    const messages = [
      makeMsg({ id: 'all', audienceRoleIds: [] }),
      makeMsg({ id: 'ops-only', audienceRoleIds: ['ops'] }),
      makeMsg({ id: 'legal-only', audienceRoleIds: ['legal'] }),
    ];
    const forOps = listForRole(messages, 'ops');
    expect(forOps.map((m) => m.id)).toEqual(['all', 'ops-only']);
    expect(listForRole(messages).map((m) => m.id)).toEqual(['all', 'ops-only', 'legal-only']);
  });

  it('sortMessages orders unread, then high priority, then createdAt desc', () => {
    const messages = [
      makeMsg({
        id: 'read-normal-old',
        readAt: '2026-07-18T10:00:00+08:00',
        priority: 'normal',
        createdAt: '2026-07-17T08:00:00+08:00',
      }),
      makeMsg({
        id: 'unread-normal-new',
        priority: 'normal',
        createdAt: '2026-07-18T12:00:00+08:00',
      }),
      makeMsg({
        id: 'unread-high',
        priority: 'high',
        bizType: 'urge.remind',
        createdAt: '2026-07-18T09:00:00+08:00',
      }),
      makeMsg({
        id: 'read-high',
        readAt: '2026-07-18T11:00:00+08:00',
        priority: 'high',
        createdAt: '2026-07-18T13:00:00+08:00',
      }),
    ];
    expect(sortMessages(messages).map((m) => m.id)).toEqual([
      'unread-high',
      'unread-normal-new',
      'read-high',
      'read-normal-old',
    ]);
  });

  it('markRead persists readAt and loadMessages merges storage', () => {
    const base = [
      makeMsg({ id: 'test-ops', audienceRoleIds: ['ops'] }),
      makeMsg({ id: 'test-legal', audienceRoleIds: ['legal'] }),
    ];
    const updated = markRead('test-ops', base);
    expect(updated.find((m) => m.id === 'test-ops')?.readAt).toBeTruthy();
    expect(updated.find((m) => m.id === 'test-legal')?.readAt).toBeUndefined();

    const persisted = JSON.parse(storage.mock.getItem(STORAGE_KEY) ?? '{}') as Record<string, string>;
    expect(persisted['test-ops']).toBeTruthy();

    storage.mock.setItem(STORAGE_KEY, JSON.stringify({ 'n-1': '2026-07-22T12:00:00.000Z' }));
    const fromSeed = loadMessages().find((m) => m.id === 'n-1');
    expect(fromSeed?.readAt).toBe('2026-07-22T12:00:00.000Z');
  });

  it('unreadCount respects role filter', () => {
    const messages = [
      makeMsg({ id: 'ops-unread', audienceRoleIds: ['ops'] }),
      makeMsg({ id: 'legal-unread', audienceRoleIds: ['legal'] }),
      makeMsg({ id: 'ops-read', audienceRoleIds: ['ops'], readAt: '2026-07-18T10:00:00+08:00' }),
    ];
    expect(unreadCount(messages, 'ops')).toBe(1);
    expect(unreadCount(messages, 'legal')).toBe(1);
    expect(unreadCount(messages)).toBe(2);
  });

  it('clearRead removes persisted readAt and restores seed', () => {
    markRead('n-1');
    expect(loadMessages().find((m) => m.id === 'n-1')?.readAt).toBeTruthy();
    clearRead('n-1');
    const after = loadMessages().find((m) => m.id === 'n-1');
    expect(after?.readAt).toBeUndefined();
    const persisted = JSON.parse(storage.mock.getItem(STORAGE_KEY) ?? '{}') as Record<string, string>;
    expect(persisted['n-1']).toBeUndefined();
  });
});
