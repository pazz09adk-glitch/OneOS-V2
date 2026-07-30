/**
 * OneOS 浅色 / 暗色主题 & RuoYi 偏好设置（localStorage + 跨 iframe postMessage）
 * 暗色参照原型导航页（VoltAgent 深色画布）。
 * 不对「旧 ONEOS」目录下原型生效。
 */

import './oneos-theme-content.css';
import {
  type RuoYiSettings,
  readStoredRuoYiSettings,
  persistRuoYiSettings,
  DEFAULT_RUOYI_SETTINGS,
  RUOYI_SETTINGS_STORAGE_KEY,
} from './RuoYiSettingsDrawer';

export type OneOsTheme = 'light' | 'dark';

export const ONEOS_THEME_STORAGE_KEY = 'oneos-ui-theme';
export const ONEOS_THEME_ATTR = 'data-oneos-theme';
export const ONEOS_THEME_MESSAGE = 'ONEOS_THEME_CHANGE';

/** sidebar「旧ONEOS」目录下的原型，不接入主题切换 */
export const LEGACY_ONEOS_PROTO_IDS = new Set([
  'oneos-web-business',
  'oneos-web-data-analysis',
  'oneos-web-finance',
  'oneos-web-help-center',
  'oneos-web-lease-contract',
  'oneos-web-ledger-data',
  'oneos-web-ops',
  'oneos-web-procurement',
]);

export function isLegacyOneOsPrototype(id?: string | null): boolean {
  if (!id) return false;
  return LEGACY_ONEOS_PROTO_IDS.has(id);
}

export function readStoredOneOsTheme(): OneOsTheme {
  const settings = readStoredRuoYiSettings();
  if (settings.themeMode === 'dark') return 'dark';
  if (settings.themeMode === 'light') return 'light';
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function applyRuoYiSettingsToDocument(
  doc: Document = document,
  settings?: Partial<RuoYiSettings>,
) {
  if (!doc || !doc.documentElement) return;
  const currentSettings: RuoYiSettings = {
    ...readStoredRuoYiSettings(),
    ...settings,
  };

  const isDark =
    currentSettings.themeMode === 'dark' ||
    (currentSettings.themeMode === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const themeValue = isDark ? 'dark' : 'light';

  doc.documentElement.setAttribute('data-oneos-theme', themeValue);
  doc.documentElement.setAttribute('data-ds-mode', themeValue);
  doc.documentElement.setAttribute('data-oneos-theme-mode', themeValue);

  if (isDark) {
    doc.documentElement.classList.add('dark');
    if (doc.body) doc.body.classList.add('dark');
  } else {
    doc.documentElement.classList.remove('dark');
    if (doc.body) doc.body.classList.remove('dark');
  }

  // 注入或更新主题 CSS 变量覆盖节点
  let styleEl = doc.getElementById('oneos-ruoyi-theme-style-override') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = doc.createElement('style');
    styleEl.id = 'oneos-ruoyi-theme-style-override';
    doc.head?.appendChild(styleEl);
  }

  const primary = currentSettings.primaryColor || '#533AFD';
  const radius = `${Math.round((currentSettings.borderRadius ?? 0.5) * 16)}px`;
  const fontSize = `${currentSettings.fontSize || 14}px`;

  styleEl.textContent = `
    :root, html, body, [data-oneos-theme], [data-ds-mode] {
      --oneos-primary: ${primary} !important;
      --ln-primary: ${primary} !important;
      --el-color-primary: ${primary} !important;
      --ln-primary-hover: ${primary} !important;
      --ln-primary-focus: ${primary} !important;
      --ruoyi-menu-active-text: ${primary} !important;
      --oneos-radius: ${radius} !important;
      --ln-radius: ${radius} !important;
      font-size: ${fontSize} !important;
    }
  `;
}

export function syncRuoYiSettingsToAllIframes(settings: RuoYiSettings) {
  if (typeof document === 'undefined') return;
  const frames = document.querySelectorAll('iframe');
  frames.forEach((frame) => {
    try {
      if (frame.contentDocument) {
        applyRuoYiSettingsToDocument(frame.contentDocument, settings);
      }
    } catch {
      /* ignore cross-origin */
    }

    try {
      const isDark =
        settings.themeMode === 'dark' ||
        (settings.themeMode === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      frame.contentWindow?.postMessage(
        {
          type: ONEOS_THEME_MESSAGE,
          theme: isDark ? 'dark' : 'light',
          settings,
        },
        '*',
      );
    } catch {
      /* ignore */
    }
  });
}

export function broadcastOneOsTheme(theme: OneOsTheme) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ONEOS_THEME_MESSAGE, { detail: { theme } }));
  try {
    window.parent?.postMessage({ type: ONEOS_THEME_MESSAGE, theme }, '*');
  } catch {
    /* ignore */
  }
  const settings = readStoredRuoYiSettings();
  syncRuoYiSettingsToAllIframes({ ...settings, themeMode: theme });
}

export function applyOneOsTheme(theme: OneOsTheme, root: HTMLElement = document.documentElement) {
  const current = readStoredRuoYiSettings();
  const nextSettings: RuoYiSettings = {
    ...current,
    themeMode: theme,
  };
  persistRuoYiSettings(nextSettings);
  applyRuoYiSettingsToDocument(root.ownerDocument || document, nextSettings);
}

export function setOneOsTheme(theme: OneOsTheme) {
  applyOneOsTheme(theme);
  const settings = readStoredRuoYiSettings();
  syncRuoYiSettingsToAllIframes({ ...settings, themeMode: theme });
}

export function toggleOneOsTheme(current?: OneOsTheme): OneOsTheme {
  const next: OneOsTheme = (current ?? readStoredOneOsTheme()) === 'dark' ? 'light' : 'dark';
  setOneOsTheme(next);
  return next;
}

type BootstrapOptions = {
  prototypeId?: string;
  skip?: boolean;
};

/**
 * 在原型预览入口调用：同步 localStorage / URL / 父页 postMessage。
 */
export function bootstrapOneOsTheme(options: BootstrapOptions = {}) {
  if (typeof window === 'undefined') return;
  if (options.skip || isLegacyOneOsPrototype(options.prototypeId)) return;

  const currentSettings = readStoredRuoYiSettings();
  applyRuoYiSettingsToDocument(document, currentSettings);

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || data.type !== ONEOS_THEME_MESSAGE) return;

    if (data.settings) {
      applyRuoYiSettingsToDocument(document, data.settings);
    } else if (data.theme === 'dark' || data.theme === 'light') {
      applyRuoYiSettingsToDocument(document, { themeMode: data.theme });
    }
  });

  window.addEventListener('storage', (event) => {
    if (event.key === RUOYI_SETTINGS_STORAGE_KEY) {
      const nextSettings = readStoredRuoYiSettings();
      applyRuoYiSettingsToDocument(document, nextSettings);
    }
  });
}
