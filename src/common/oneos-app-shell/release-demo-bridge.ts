/** 「原型外壳演示」 ↔ 工作台 iframe：版本更新日志 */

export const ONEOS_RELEASE_DEMO_ACTION = 'ONEOS_RELEASE_DEMO_ACTION';

export type ReleaseDemoAction = 'open' | 'reset';

export type ReleaseDemoActionPayload = {
  type: typeof ONEOS_RELEASE_DEMO_ACTION;
  action: ReleaseDemoAction;
};

export function isReleaseDemoAction(data: unknown): data is ReleaseDemoActionPayload {
  if (!data || typeof data !== 'object') return false;
  const payload = data as ReleaseDemoActionPayload;
  return (
    payload.type === ONEOS_RELEASE_DEMO_ACTION &&
    (payload.action === 'open' || payload.action === 'reset')
  );
}

export function postReleaseDemoAction(target: Window, action: ReleaseDemoAction) {
  target.postMessage(
    { type: ONEOS_RELEASE_DEMO_ACTION, action } satisfies ReleaseDemoActionPayload,
    '*',
  );
}

/** @deprecated 使用 postReleaseDemoAction(target, 'open') */
export function postReleaseDemoReset(target: Window) {
  postReleaseDemoAction(target, 'reset');
}

export function postReleaseDemoOpen(target: Window) {
  postReleaseDemoAction(target, 'open');
}

/** 与工作台 `utils/release-seen.ts` 同源 key */
export const RELEASE_SEEN_STORAGE_KEY = 'oneos-wb-release-seen-v1';

/** 当前发布版本（外壳「未读」点用；与 workbench CURRENT_RELEASE_NOTE.version 保持一致） */
export const SHELL_CURRENT_RELEASE_VERSION = 'V2.1.0';

export function clearAllReleaseSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(RELEASE_SEEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasUnseenRelease(operatorName?: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(RELEASE_SEEN_STORAGE_KEY);
    if (!raw) return true;
    // 工作台可存纯版本字符串，或按登录人的 JSON map
    if (!raw.startsWith('{')) {
      return raw !== SHELL_CURRENT_RELEASE_VERSION;
    }
    const map = JSON.parse(raw) as Record<string, string>;
    if (!map || typeof map !== 'object') return true;
    if (operatorName) return map[operatorName] !== SHELL_CURRENT_RELEASE_VERSION;
    return !Object.values(map).includes(SHELL_CURRENT_RELEASE_VERSION);
  } catch {
    return true;
  }
}
