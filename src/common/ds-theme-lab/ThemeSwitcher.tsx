import React, { useEffect, useId, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Moon, Sun, SwatchBook } from 'lucide-react';
import {
  THEME_VARIANTS,
  OFFICIAL_THEME,
  applyThemeSkin,
  clearThemeSkin,
  buildAntThemeConfig,
  buildOfficialAntTheme,
  getThemeById,
  loadThemeLabState,
  saveThemeLabState,
  type ThemeId,
  type ThemeLabState,
  type ThemeMode,
} from './themeLab';
import './theme-switcher.css';

export type ThemeLabChange = {
  themeId: ThemeId;
  mode: ThemeMode;
  antTheme: ReturnType<typeof buildOfficialAntTheme>;
};

type Props = {
  onChange: (next: ThemeLabChange) => void;
};

function resolveAnt(themeId: ThemeId, mode: ThemeMode) {
  if (themeId === 'official') {
    return buildOfficialAntTheme();
  }
  const theme = getThemeById(themeId);
  if (!theme) return buildOfficialAntTheme();
  return buildAntThemeConfig(theme, mode);
}

function applyDom(themeId: ThemeId, mode: ThemeMode) {
  if (themeId === 'official') {
    clearThemeSkin();
    document.documentElement.dataset.dsMode = 'light';
    document.documentElement.dataset.dsTheme = 'official';
    return;
  }
  const theme = getThemeById(themeId);
  if (!theme) {
    clearThemeSkin();
    return;
  }
  applyThemeSkin(theme, mode);
}

export function ThemeSwitcher({ onChange }: Props) {
  const titleId = useId();
  const [state, setState] = useState<ThemeLabState>(() =>
    typeof window === 'undefined'
      ? { themeId: 'official', mode: 'light', collapsed: false }
      : loadThemeLabState(),
  );

  const activeTheme = useMemo(
    () => (state.themeId === 'official' ? null : getThemeById(state.themeId)),
    [state.themeId],
  );

  const accentPreview =
    state.themeId === 'official'
      ? OFFICIAL_THEME.primary
      : state.themeId === 'E-intercom' && state.mode === 'light'
        ? '#ff5600'
        : activeTheme?.accent || OFFICIAL_THEME.primary;

  useEffect(() => {
    applyDom(state.themeId, state.mode);
    onChange({
      themeId: state.themeId,
      mode: state.mode,
      antTheme: resolveAnt(state.themeId, state.mode),
    });
    saveThemeLabState(state);
  }, [state.themeId, state.mode]); // eslint-disable-line react-hooks/exhaustive-deps -- onChange identity ignored

  const setTheme = (themeId: ThemeId) => {
    setState((prev) => ({
      ...prev,
      themeId,
      mode: themeId === 'official' ? 'light' : prev.mode,
    }));
  };

  const setMode = (mode: ThemeMode) => {
    setState((prev) => {
      if (prev.themeId === 'official' && mode === 'dark') {
        return { ...prev, themeId: 'A-linear', mode: 'dark' };
      }
      return { ...prev, mode };
    });
  };

  if (state.collapsed) {
    return (
      <div className="ds-theme-lab ds-theme-lab--collapsed" role="region" aria-label="主题实验室">
        <button
          type="button"
          className="ds-theme-lab__fab"
          onClick={() => setState((p) => ({ ...p, collapsed: false }))}
          aria-expanded={false}
          aria-controls={titleId}
        >
          <SwatchBook size={18} strokeWidth={2} aria-hidden />
          <span>主题</span>
          <span className="ds-theme-lab__fab-swatch" style={{ background: accentPreview }} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div
      className="ds-theme-lab"
      role="region"
      aria-labelledby={titleId}
      data-annotation-id="lc-theme-lab"
    >
      <header className="ds-theme-lab__head">
        <div className="ds-theme-lab__title-wrap">
          <SwatchBook size={16} strokeWidth={2.25} aria-hidden />
          <h2 id={titleId} className="ds-theme-lab__title">
            主题实验室
          </h2>
          <span className="ds-theme-lab__badge">比稿</span>
        </div>
        <button
          type="button"
          className="ds-theme-lab__icon-btn"
          onClick={() => setState((p) => ({ ...p, collapsed: true }))}
          aria-label="收起主题实验室"
        >
          <ChevronDown size={18} aria-hidden />
        </button>
      </header>

      <div className="ds-theme-lab__mode" role="group" aria-label="浅色或暗色">
        <button
          type="button"
          className={`ds-theme-lab__mode-btn${state.mode === 'light' ? ' is-active' : ''}`}
          onClick={() => setMode('light')}
          aria-pressed={state.mode === 'light'}
        >
          <Sun size={14} aria-hidden />
          浅色
        </button>
        <button
          type="button"
          className={`ds-theme-lab__mode-btn${state.mode === 'dark' ? ' is-active' : ''}`}
          onClick={() => setMode('dark')}
          aria-pressed={state.mode === 'dark'}
          disabled={state.themeId === 'official'}
          title={state.themeId === 'official' ? '官方规范暂仅浅色；切暗色将改用 Linear' : undefined}
        >
          <Moon size={14} aria-hidden />
          暗色
        </button>
      </div>

      <div className="ds-theme-lab__themes" role="listbox" aria-label="主题套装">
        <button
          type="button"
          role="option"
          aria-selected={state.themeId === 'official'}
          className={`ds-theme-lab__theme${state.themeId === 'official' ? ' is-active' : ''}`}
          onClick={() => setTheme('official')}
        >
          <span className="ds-theme-lab__swatch" style={{ background: OFFICIAL_THEME.primary }} />
          <span className="ds-theme-lab__theme-meta">
            <span className="ds-theme-lab__theme-name">官方</span>
            <span className="ds-theme-lab__theme-cat">若依默认</span>
          </span>
        </button>
        {THEME_VARIANTS.map((t) => {
          const swatch =
            t.id === 'E-intercom' && state.mode === 'light' ? t.ctaAccent || t.accent : t.accent;
          return (
            <button
              key={t.id}
              type="button"
              role="option"
              aria-selected={state.themeId === t.id}
              className={`ds-theme-lab__theme${state.themeId === t.id ? ' is-active' : ''}`}
              onClick={() => setTheme(t.id as ThemeId)}
              title={t.feel}
            >
              <span className="ds-theme-lab__swatch" style={{ background: swatch }} />
              <span className="ds-theme-lab__theme-meta">
                <span className="ds-theme-lab__theme-name">{t.name}</span>
                <span className="ds-theme-lab__theme-cat">{t.category}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="ds-theme-lab__hint">
        当前：
        {state.themeId === 'official'
          ? 'Linear · 若依默认蓝'
          : `${activeTheme?.name || state.themeId} · ${state.mode === 'dark' ? '暗色' : '浅色'}`}
        。规范见设计系统第 10 章。
      </p>

      <button
        type="button"
        className="ds-theme-lab__expand-hint"
        onClick={() => setState((p) => ({ ...p, collapsed: true }))}
      >
        <ChevronUp size={14} aria-hidden />
        收起以免遮挡列表
      </button>
    </div>
  );
}
