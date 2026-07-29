import React, { useCallback, useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Maximize2,
  Minimize2,
  Moon,
  RefreshCw,
  RotateCcw,
  Settings,
  Sun,
  X,
  Monitor,
  Trash2,
} from 'lucide-react';

export interface RuoYiSettings {
  themeMode: 'light' | 'dark' | 'system';
  darkSidebar: boolean;
  darkNavbar: boolean;
  primaryColor: string;
  borderRadius: number;
  fontSize: number;
  activeTab: 'appearance' | 'layout' | 'shortcuts' | 'general';
}

export const RUOYI_SETTINGS_STORAGE_KEY = 'ruoyi-oneos-settings-v2';

export const DEFAULT_RUOYI_SETTINGS: RuoYiSettings = {
  themeMode: 'light',
  darkSidebar: false,
  darkNavbar: false,
  primaryColor: '#533AFD',
  borderRadius: 0.5,
  fontSize: 14,
  activeTab: 'appearance',
};

export const PRESET_COLORS = [
  { name: '默认', value: '#533AFD' },
  { name: '紫罗兰', value: '#722ED1' },
  { name: '樱花粉', value: '#EB2F96' },
  { name: '柠檬黄', value: '#FADB14' },
  { name: '天蓝色', value: '#409EFF' },
  { name: '浅绿色', value: '#13C2C2' },
  { name: '特色灰', value: '#595959' },
  { name: '深绿色', value: '#009688' },
  { name: '深蓝色', value: '#111936' },
  { name: '橙黄色', value: '#FA8C16' },
  { name: '玫瑰红', value: '#F5222D' },
  { name: '中性色', value: '#262626' },
  { name: '石板灰', value: '#1E293B' },
  { name: '中灰色', value: '#4B5563' },
];

export function readStoredRuoYiSettings(): RuoYiSettings {
  if (typeof window === 'undefined') return DEFAULT_RUOYI_SETTINGS;
  try {
    const raw = window.localStorage.getItem(RUOYI_SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_RUOYI_SETTINGS, ...parsed };
    }
  } catch {
    /* ignore parse error */
  }
  return DEFAULT_RUOYI_SETTINGS;
}

export function persistRuoYiSettings(settings: RuoYiSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RUOYI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export type RuoYiSettingsDrawerProps = {
  open: boolean;
  onClose: () => void;
  settings: RuoYiSettings;
  onChange: (next: RuoYiSettings) => void;
  onReset: () => void;
};

export function RuoYiSettingsDrawer({
  open,
  onClose,
  settings,
  onChange,
  onReset,
}: RuoYiSettingsDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const updateSetting = <K extends keyof RuoYiSettings>(key: K, value: RuoYiSettings[K]) => {
    const next = { ...settings, [key]: value };
    onChange(next);
  };

  const handleCopySettings = async () => {
    const jsonStr = JSON.stringify(settings, null, 2);
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(jsonStr);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Axhub iframe / Permissions-Policy 常拦截 clipboard-write，降级到 execCommand
      try {
        const textarea = document.createElement('textarea');
        textarea.value = jsonStr;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        // 仍失败时静默，避免 unhandledrejection
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ruoyi-settings-overlay" onClick={onClose}>
      <aside
        className={`ruoyi-settings-drawer${isFullscreen ? ' is-fullscreen' : ''}`}
        onClick={(e) => e.stopPropagation()}
        aria-label="偏好设置"
      >
        {/* Header */}
        <header className="ruoyi-settings-header">
          <div className="ruoyi-settings-header__title">
            <h3>偏好设置</h3>
            <p>自定义偏好设置 &amp; 实时预览</p>
          </div>
          <div className="ruoyi-settings-header__actions">
            <button
              type="button"
              className="ruoyi-settings-icon-btn"
              title="重置偏好设置"
              onClick={onReset}
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              className="ruoyi-settings-icon-btn"
              title={isFullscreen ? '还原' : '全屏'}
              onClick={() => setIsFullscreen((v) => !v)}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              type="button"
              className="ruoyi-settings-icon-btn"
              title="关闭"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {/* Tabs */}
        <nav className="ruoyi-settings-tabs">
          {[
            { id: 'appearance', label: '外观' },
            { id: 'layout', label: '布局' },
            { id: 'shortcuts', label: '快捷键' },
            { id: 'general', label: '通用' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`ruoyi-settings-tab${settings.activeTab === tab.id ? ' is-active' : ''}`}
              onClick={() => updateSetting('activeTab', tab.id as RuoYiSettings['activeTab'])}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Drawer Body */}
        <div className="ruoyi-settings-body">
          {settings.activeTab === 'appearance' && (
            <div className="ruoyi-settings-group">
              {/* 1. 主题模式 */}
              <div className="ruoyi-settings-item">
                <label className="ruoyi-settings-label">主题</label>
                <div className="ruoyi-settings-options-segmented">
                  <button
                    type="button"
                    className={`ruoyi-segmented-btn${settings.themeMode === 'light' ? ' is-active' : ''}`}
                    onClick={() => updateSetting('themeMode', 'light')}
                  >
                    <Sun size={14} />
                    浅色
                  </button>
                  <button
                    type="button"
                    className={`ruoyi-segmented-btn${settings.themeMode === 'dark' ? ' is-active' : ''}`}
                    onClick={() => updateSetting('themeMode', 'dark')}
                  >
                    <Moon size={14} />
                    深色
                  </button>
                  <button
                    type="button"
                    className={`ruoyi-segmented-btn${settings.themeMode === 'system' ? ' is-active' : ''}`}
                    onClick={() => updateSetting('themeMode', 'system')}
                  >
                    <Monitor size={14} />
                    跟随系统
                  </button>
                </div>
              </div>

              {/* 2. 深色侧边栏 */}
              <div className="ruoyi-settings-item ruoyi-settings-item--row">
                <span className="ruoyi-settings-label">深色侧边栏</span>
                <label className="ruoyi-switch">
                  <input
                    type="checkbox"
                    checked={settings.darkSidebar}
                    onChange={(e) => updateSetting('darkSidebar', e.target.checked)}
                  />
                  <span className="ruoyi-switch-slider" />
                </label>
              </div>

              {/* 3. 深色顶栏 */}
              <div className="ruoyi-settings-item ruoyi-settings-item--row">
                <span className="ruoyi-settings-label">深色顶栏</span>
                <label className="ruoyi-switch">
                  <input
                    type="checkbox"
                    checked={settings.darkNavbar}
                    onChange={(e) => updateSetting('darkNavbar', e.target.checked)}
                  />
                  <span className="ruoyi-switch-slider" />
                </label>
              </div>

              {/* 4. 内置主题推荐色盘 */}
              <div className="ruoyi-settings-item">
                <label className="ruoyi-settings-label">内置主题</label>
                <div className="ruoyi-colors-grid">
                  {PRESET_COLORS.map((c) => {
                    const selected =
                      settings.primaryColor.toLowerCase() === c.value.toLowerCase();
                    return (
                      <button
                        key={c.value}
                        type="button"
                        className={`ruoyi-color-tile${selected ? ' is-selected' : ''}`}
                        onClick={() => updateSetting('primaryColor', c.value)}
                        title={`${c.name} (${c.value})`}
                      >
                        <span className="ruoyi-color-swatch" style={{ background: c.value }}>
                          {selected && <Check size={12} color="#fff" strokeWidth={3} />}
                        </span>
                        <span className="ruoyi-color-name">{c.name}</span>
                      </button>
                    );
                  })}
                  {/* 自定义颜色 */}
                  <label className="ruoyi-color-tile ruoyi-color-tile--custom" title="自定义颜色">
                    <span
                      className="ruoyi-color-swatch"
                      style={{ background: settings.primaryColor }}
                    >
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        className="ruoyi-color-picker-input"
                      />
                    </span>
                    <span className="ruoyi-color-name">自定义</span>
                  </label>
                </div>
              </div>

              {/* 5. 圆角 Radius */}
              <div className="ruoyi-settings-item">
                <label className="ruoyi-settings-label">圆角</label>
                <div className="ruoyi-settings-options-segmented">
                  {[0, 0.25, 0.5, 0.75, 1].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`ruoyi-segmented-btn${settings.borderRadius === r ? ' is-active' : ''}`}
                      onClick={() => updateSetting('borderRadius', r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. 字体大小 Font Size */}
              <div className="ruoyi-settings-item">
                <label className="ruoyi-settings-label">字体大小</label>
                <div className="ruoyi-settings-options-segmented">
                  {[12, 13, 14, 15, 16].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`ruoyi-segmented-btn${settings.fontSize === s ? ' is-active' : ''}`}
                      onClick={() => updateSetting('fontSize', s)}
                    >
                      {s}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {settings.activeTab !== 'appearance' && (
            <div className="ruoyi-settings-empty">
              <p>暂无更多配置（演示）。</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="ruoyi-settings-footer">
          <button
            type="button"
            className="ruoyi-btn-copy"
            onClick={handleCopySettings}
          >
            <Copy size={14} />
            {copied ? '已复制偏好设置' : '复制偏好设置'}
          </button>
          <button
            type="button"
            className="ruoyi-btn-reset-cache"
            onClick={() => {
              onReset();
              alert('已清空主题缓存并还原默认设置');
            }}
          >
            <Trash2 size={13} />
            清空缓存 &amp; 还原配置
          </button>
        </footer>
      </aside>
    </div>
  );
}
