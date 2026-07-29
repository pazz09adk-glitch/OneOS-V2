/** iframe 内页面 ↔ 外壳侧栏/页签导航 postMessage 协议 */

export const ONEOS_SHELL_NAV = 'ONEOS_SHELL_NAV';

export type ShellNavPayload = {
  type: typeof ONEOS_SHELL_NAV;
  href: string;
  title?: string;
};

export function isShellNav(data: unknown): data is ShellNavPayload {
  return (
    !!data &&
    typeof data === 'object' &&
    (data as ShellNavPayload).type === ONEOS_SHELL_NAV &&
    typeof (data as ShellNavPayload).href === 'string' &&
    (data as ShellNavPayload).href.startsWith('/prototypes/')
  );
}

/** 在 iframe 内跳转时优先通知外壳；直链打开则本页跳转 */
export function requestShellNav(href: string, title?: string): boolean {
  if (typeof window === 'undefined' || !href.startsWith('/prototypes/')) return false;
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: ONEOS_SHELL_NAV, href, title } satisfies ShellNavPayload, '*');
    return true;
  }
  return false;
}
