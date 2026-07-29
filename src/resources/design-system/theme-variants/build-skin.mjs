/**
 * 主题变体皮肤：从 theme-variants.json 生成覆盖 CSS / Ant token。
 * 供截图脚本与租赁合同「主题实验室」共用。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.join(__dirname, '../theme-variants.json');

function loadCatalog() {
  return JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
}

const catalog = loadCatalog();

export const THEME_CATALOG = catalog;
export const OFFICIAL_THEME = catalog.officialDefault;
export const THEME_SHOTS = catalog.themes.map((t) => ({
  id: t.id,
  name: t.name,
  category: t.category,
  feel: t.feel,
  accent: t.accent,
  accentHover: t.accentHover,
  accentFocus: t.accentFocus,
  accentSoft: t.accentSoft,
  ctaAccent: t.ctaAccent,
  radiusControl: t.radiusControl,
  radiusCard: t.radiusCard,
  modes: t.modes,
}));

function soft(hex, alpha = 0.12) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getThemeById(themeId) {
  return THEME_SHOTS.find((t) => t.id === themeId) || null;
}

export function resolvePrimary(theme, mode) {
  const palette = theme.modes?.[mode];
  if (palette?.primaryOverride) {
    return {
      primary: palette.primaryOverride,
      primaryHover: palette.primaryHoverOverride || theme.accentHover,
      primaryFocus: palette.primaryFocusOverride || theme.accentFocus,
    };
  }
  if (theme.id === 'E-intercom' && mode === 'light' && theme.ctaAccent) {
    return {
      primary: theme.ctaAccent,
      primaryHover: theme.ctaAccentHover || '#fe4c02',
      primaryFocus: theme.ctaAccentFocus || '#e04d00',
    };
  }
  return {
    primary: theme.accent,
    primaryHover: theme.accentHover,
    primaryFocus: theme.accentFocus,
  };
}

export function resolvePalette(theme, mode) {
  const isDark = mode === 'dark';
  const fromJson = theme.modes?.[mode];
  if (fromJson) return { ...fromJson, isDark };
  // fallback should not hit if JSON complete
  return {
    isDark,
    ink: isDark ? '#f4f4f5' : '#18181b',
    body: isDark ? '#d4d4d8' : '#3f3f46',
    muted: isDark ? '#a1a1aa' : '#71717a',
    mutedSoft: isDark ? '#71717a' : '#a1a1aa',
    canvas: isDark ? '#0a0a0a' : '#f5f6f6',
    surface: isDark ? '#141416' : '#ffffff',
    soft: isDark ? '#1c1c1f' : '#f6f7f7',
    hairline: isDark ? '#2e2e33' : '#e5e7eb',
    hairlineStrong: isDark ? '#52525b' : '#d4d4d8',
    controlBg: isDark ? '#1a1a1d' : '#ffffff',
    tagNeutralBg: isDark ? '#27272a' : '#f4f4f5',
    tagNeutralFg: isDark ? '#d4d4d8' : '#52525b',
    onPrimary: '#ffffff',
  };
}

export function buildAntThemeConfig(theme, mode) {
  const c = resolvePalette(theme, mode);
  const { primary, primaryHover, primaryFocus } = resolvePrimary(theme, mode);
  const radius = parseInt(String(theme.radiusControl || '8').replace('px', ''), 10) || 8;
  const radiusCard = parseInt(String(theme.radiusCard || '12').replace('px', ''), 10) || 12;
  return {
    token: {
      colorPrimary: primary,
      colorLink: primary,
      colorLinkHover: primaryHover,
      colorSuccess: '#27a644',
      colorWarning: '#d97706',
      colorError: '#e5484d',
      colorInfo: '#2563eb',
      borderRadius: radius,
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif',
      fontSize: 14,
      colorText: c.ink,
      colorTextSecondary: c.body,
      colorBorder: c.hairline,
      colorBgContainer: c.controlBg,
      colorBgLayout: c.canvas,
      colorBgElevated: c.surface,
    },
    components: {
      Table: {
        headerBg: c.soft,
        headerColor: c.muted,
        rowHoverBg: c.soft,
        borderColor: c.hairline,
        cellPaddingBlock: 6,
        cellPaddingInline: 10,
      },
      Card: { borderRadiusLG: radiusCard },
      Button: { controlHeight: 36, borderRadius: radius },
      Input: { controlHeight: 32, borderRadius: radius },
      InputNumber: { handleVisible: true },
      DatePicker: {
        cellActiveWithRangeBg: soft(primary, 0.12),
        cellHoverWithRangeBg: soft(primary, 0.08),
        cellRangeBorderColor: primary,
        activeBorderColor: primary,
        hoverBorderColor: primaryHover,
      },
      Select: {
        colorBgContainer: c.controlBg,
        optionSelectedBg: c.soft,
      },
    },
    algorithm: undefined,
    _meta: { primary, primaryHover, primaryFocus, palette: c },
  };
}

export function buildOfficialAntTheme() {
  const o = OFFICIAL_THEME;
  return {
    token: {
      colorPrimary: o.primary,
      colorLink: o.primary,
      colorLinkHover: o.primaryHover,
      colorSuccess: '#27a644',
      colorWarning: '#d97706',
      colorError: '#e5484d',
      colorInfo: '#2563eb',
      borderRadius: 8,
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif',
      fontSize: 14,
      colorText: '#18181b',
      colorTextSecondary: '#52525b',
      colorBorder: '#e5e7eb',
      colorBgContainer: '#ffffff',
      colorBgLayout: '#f5f6f6',
    },
    components: {
      Table: {
        headerBg: '#f6f7f7',
        headerColor: '#71717a',
        rowHoverBg: '#f6f7f7',
        borderColor: '#e5e7eb',
        cellPaddingBlock: 6,
        cellPaddingInline: 10,
      },
      Card: { borderRadiusLG: 12 },
      Button: { controlHeight: 36, borderRadius: 8 },
      Input: { controlHeight: 32, borderRadius: 8 },
      InputNumber: { handleVisible: true },
      DatePicker: {
        cellActiveWithRangeBg: 'rgba(50, 160, 110, 0.12)',
        cellHoverWithRangeBg: 'rgba(50, 160, 110, 0.08)',
        cellRangeBorderColor: o.primary,
        activeBorderColor: o.primary,
        hoverBorderColor: o.primaryHover,
      },
    },
  };
}

/** 与历史截图脚本 API 兼容 */
export function buildSkinCss(theme, mode) {
  const isDark = mode === 'dark';
  const c = resolvePalette(theme, mode);
  const { primary, primaryHover, primaryFocus } = resolvePrimary(theme, mode);
  const primarySoft = theme.accentSoft && !isDark
    ? theme.accentSoft
    : soft(primary, isDark ? 0.22 : 0.12);

  const root = `html[data-ds-mode="${mode}"]`;
  const page = `${root} .vm-page`;
  const lc = `${page}.lc-page`;

  const antVars = `
  --ant-color-primary: ${primary};
  --ant-color-primary-hover: ${primaryHover};
  --ant-color-bg-container: ${c.controlBg};
  --ant-color-bg-container-disabled: ${c.soft};
  --ant-color-bg-elevated: ${c.surface};
  --ant-color-bg-layout: ${c.canvas};
  --ant-color-bg-spotlight: ${c.soft};
  --ant-color-bg-mask: rgba(0,0,0,0.55);
  --ant-color-text: ${c.ink};
  --ant-color-text-secondary: ${c.body};
  --ant-color-text-tertiary: ${c.muted};
  --ant-color-text-quaternary: ${c.mutedSoft};
  --ant-color-text-placeholder: ${c.mutedSoft};
  --ant-color-border: ${c.hairline};
  --ant-color-border-secondary: ${c.hairlineStrong};
  --ant-color-fill: ${c.soft};
  --ant-color-fill-secondary: ${c.soft};
  --ant-color-fill-tertiary: ${c.soft};
  --ant-color-fill-quaternary: ${c.controlBg};
  --ant-color-fill-content: ${c.controlBg};
`;

  return `
${root} {
  color-scheme: ${isDark ? 'dark' : 'light'};
  --ds-ink: ${c.ink};
  --ds-body: ${c.body};
  --ds-muted: ${c.muted};
  --ds-muted-soft: ${c.mutedSoft};
  --ds-canvas: ${c.canvas};
  --ds-surface: ${c.surface};
  --ds-soft: ${c.soft};
  --ds-hairline: ${c.hairline};
  --ds-hairline-strong: ${c.hairlineStrong};
  --ds-control-bg: ${c.controlBg};
  --ds-primary: ${primary};
  --ds-primary-hover: ${primaryHover};
  --ds-on-primary: ${c.onPrimary};
  --ds-tag-neutral-bg: ${c.tagNeutralBg};
  --ds-tag-neutral-fg: ${c.tagNeutralFg};
  ${antVars}
  background: ${c.canvas} !important;
}
${root} body, ${root} #root,
${root} .ant-app, body, #root, .ant-app, .vm-page, .lc-page {
  ${antVars}
  background-color: ${c.canvas} !important;
  color: ${c.body} !important;
}

.vm-filter-card, .vm-table-card, .vm-kpi-card, .ldb-filter-card, .lc-fleet-summary, .ant-card, .ant-card-body {
  background-color: ${c.surface} !important;
  border-color: ${c.hairline} !important;
  color: ${c.ink} !important;
}

.ant-select-selector, .ant-select-selection-search-input, .ant-input, .ant-input-affix-wrapper, .ant-picker, .ant-select-dropdown {
  background-color: ${c.controlBg} !important;
  border-color: ${c.hairlineStrong} !important;
  color: ${c.ink} !important;
}

.ant-select-selection-item, .ant-select-selection-placeholder, .ant-input::placeholder, .ant-picker-input > input {
  color: ${c.ink} !important;
}

.ant-table, .ant-table-container, .ant-table-content, .ant-table-wrapper {
  background-color: ${c.surface} !important;
  color: ${c.ink} !important;
}

.ant-table-thead > tr > th, .ant-table-thead .ant-table-cell {
  background-color: ${c.soft} !important;
  color: ${c.ink} !important;
  border-bottom-color: ${c.hairline} !important;
}

.ant-table-tbody > tr > td, .ant-table-tbody .ant-table-cell {
  background-color: ${c.surface} !important;
  color: ${c.body} !important;
  border-bottom-color: ${c.hairline} !important;
}

.ant-table-tbody > tr:hover > td, .ant-table-tbody > tr.ant-table-row-hover > td {
  background-color: ${c.soft} !important;
}

.ds-theme-lab,
.ds-theme-lab--collapsed,
[data-annotation-id="lc-theme-lab"] {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

${root} .oneos-shell, .oneos-shell {
  --oneos-primary: ${primary} !important;
  --oneos-primary-soft: ${primaryHover} !important;
  --oneos-ink: ${c.ink} !important;
  --oneos-ink-soft: ${c.body} !important;
  --oneos-muted: ${c.muted} !important;
  --oneos-border: ${c.hairline} !important;
  --oneos-bg: ${c.canvas} !important;
  --oneos-surface: ${c.surface} !important;
  --oneos-aside-bg: ${c.surface} !important;
  background: ${c.canvas} !important;
  color: ${c.ink} !important;
}

${root} .oneos-shell-aside, .oneos-shell-aside {
  background: ${c.surface} !important;
  border-right: 1px solid ${c.hairline} !important;
}

${root} .oneos-shell-brand, .oneos-shell-brand {
  background: ${c.surface} !important;
  border-bottom: 1px solid ${c.hairline} !important;
}

${root} .oneos-shell-brand__text, .oneos-shell-brand__text {
  color: ${c.ink} !important;
  background: none !important;
  -webkit-text-fill-color: ${c.ink} !important;
}

${root} .oneos-shell-brand__mark rect, .oneos-shell-brand__mark rect {
  fill: ${primary} !important;
}

${root} .oneos-shell-menu__btn, .oneos-shell-menu__btn {
  color: ${c.body} !important;
}

${root} .oneos-shell-menu__btn:hover, .oneos-shell-menu__btn:hover {
  background: ${c.soft} !important;
  color: ${c.ink} !important;
}

${root} .oneos-shell-menu__btn.is-active, .oneos-shell-menu__btn.is-active {
  background: ${isDark ? soft(primary, 0.22) : soft(primary, 0.12)} !important;
  color: ${primary} !important;
  font-weight: 600 !important;
}

${root} .oneos-shell-menu__btn.is-active .oneos-shell-menu__icon, .oneos-shell-menu__btn.is-active .oneos-shell-menu__icon {
  color: ${primary} !important;
}

${root} .oneos-shell-chrome, ${root} .oneos-shell-header, .oneos-shell-chrome, .oneos-shell-header {
  background: ${c.surface} !important;
  border-bottom: 1px solid ${c.hairline} !important;
  color: ${c.ink} !important;
}

${root} .oneos-shell-icon-btn, .oneos-shell-icon-btn {
  color: ${c.muted} !important;
}

${root} .oneos-shell-icon-btn:hover, .oneos-shell-icon-btn:hover {
  background: ${c.soft} !important;
  color: ${c.ink} !important;
}

${root} .oneos-shell-breadcrumb, .oneos-shell-breadcrumb {
  color: ${c.body} !important;
}

${root} .oneos-shell-breadcrumb .is-current, .oneos-shell-breadcrumb .is-current {
  color: ${c.ink} !important;
}

${root} .oneos-shell-breadcrumb__sep, .oneos-shell-breadcrumb__sep {
  color: ${c.mutedSoft} !important;
}

${root} .oneos-shell-search, .oneos-shell-search {
  background: ${c.soft} !important;
  border: 1px solid ${c.hairlineStrong} !important;
  color: ${c.ink} !important;
}

${root} .oneos-shell-search input, .oneos-shell-search input {
  color: ${c.ink} !important;
}

${root} .oneos-shell-search input::placeholder, .oneos-shell-search input::placeholder {
  color: ${c.mutedSoft} !important;
}

${root} .oneos-shell-search kbd, .oneos-shell-search kbd {
  background: ${c.controlBg} !important;
  border-color: ${c.hairline} !important;
  color: ${c.muted} !important;
}

${root} .oneos-shell-tabs, .oneos-shell-tabs {
  background: ${c.soft} !important;
  border-bottom: 1px solid ${c.hairline} !important;
}

${root} .oneos-shell-tab, .oneos-shell-tab {
  background: transparent !important;
  color: ${c.muted} !important;
  border-color: ${c.hairline} !important;
}

${root} .oneos-shell-tab.is-active, .oneos-shell-tab.is-active {
  background: ${c.surface} !important;
  color: ${primary} !important;
  border-top: 2px solid ${primary} !important;
  font-weight: 600 !important;
}

${root} .oneos-shell-frame, .oneos-shell-frame {
  background: ${c.canvas} !important;
}

${page} {
  --ln-primary: ${primary} !important;
  --ln-primary-hover: ${primaryHover} !important;
  --ln-primary-focus: ${primaryFocus} !important;
  --ln-primary-soft: ${primarySoft} !important;
  --ln-ink: ${c.ink} !important;
  --ln-body: ${c.body} !important;
  --ln-muted: ${c.muted} !important;
  --ln-muted-soft: ${c.mutedSoft} !important;
  --ln-canvas-parchment: ${c.canvas} !important;
  --ln-surface-card: ${c.surface} !important;
  --ln-surface-strong: ${c.tagNeutralBg} !important;
  --ln-canvas-soft: ${c.soft} !important;
  --ln-hairline: ${c.hairline} !important;
  --ln-hairline-strong: ${c.hairlineStrong} !important;
  --ln-on-primary: ${c.onPrimary} !important;
  --ln-link: ${primary} !important;
  --ln-radius-control: ${theme.radiusControl} !important;
  --ln-radius-card: ${theme.radiusCard} !important;
  --vm-font: Inter, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif !important;
  ${antVars}
  background: ${c.canvas} !important;
  color: ${c.body} !important;
}

${root} .ant-select,
${root} .ant-select-css-var,
${root} .ant-input-css-var,
${root} .ant-picker-css-var,
${root} .ant-input-number-css-var,
${root} .ant-btn-css-var,
${page} .ant-select,
${page} .ant-select-css-var,
${page} .lc-filter-select {
  --ant-color-bg-container: ${c.controlBg} !important;
  --ant-color-text: ${c.ink} !important;
  --ant-color-text-placeholder: ${c.mutedSoft} !important;
  --ant-color-border: ${c.hairlineStrong} !important;
  --ant-color-icon: ${c.muted} !important;
}

${page} .vm-filter-card,
${page} .vm-table-card,
${page} .vm-kpi-card,
${page} .lc-fleet-summary,
${page} .wb-card,
${page} .wb-panel,
${page} .wb-block,
${page} .ct-panel,
${page} .lc-create-topbar,
${page} .ct-editor-page {
  background: ${c.surface} !important;
  border-color: ${c.hairline} !important;
  color: ${c.body} !important;
}

${page} .vm-filter-title,
${page} .vm-kpi-val,
${page} .lc-create-topbar__title,
${page} .lc-create-step-title__text,
${page} h1, ${page} h2, ${page} h3 {
  color: ${c.ink} !important;
}
${page} .vm-filter-field > span,
${page} .vm-kpi-label,
${page} .wb-muted,
${page} .ant-form-item-label > label {
  color: ${c.muted} !important;
}

${root} .ant-select,
${root} .ant-select-outlined,
${root} .ant-select.ant-select-outlined,
${root} .ant-select .ant-select-selector,
${root} .ant-select-outlined .ant-select-selector,
${root} .ant-select-outlined:not(.ant-select-customize-input) .ant-select-selector,
${root} .ant-select:not(.ant-select-customize-input) .ant-select-selector,
${root} .ant-select-multiple .ant-select-selector,
${root} .ant-select .ant-select-content,
${root} .ant-input,
${root} .ant-input-affix-wrapper,
${root} .ant-input-outlined,
${root} .ant-input-affix-wrapper-outlined,
${root} .ant-picker,
${root} .ant-picker-outlined,
${root} .ant-input-number,
${root} .ant-input-number-outlined,
${root} .ant-input-number .ant-input-number-input,
${root} textarea.ant-input,
${page} .ant-select,
${page} .ant-select-outlined,
${page} .ant-select.ant-select-outlined,
${page} .ant-select .ant-select-selector,
${page} .ant-select-outlined .ant-select-selector,
${page} .ant-select-outlined:not(.ant-select-customize-input) .ant-select-selector,
${page} .ant-select:not(.ant-select-customize-input) .ant-select-selector,
${page} .ant-select-multiple .ant-select-selector,
${page} .ant-select .ant-select-content,
${page} .ant-input,
${page} .ant-input-affix-wrapper,
${page} .ant-input-outlined,
${page} .ant-input-affix-wrapper-outlined,
${page} .ant-picker,
${page} .ant-picker-outlined,
${page} .ant-input-number,
${page} .ant-input-number-outlined,
${page} .ant-input-number .ant-input-number-input,
${page} .vm-date-range-field,
${page} .vm-filter-picker-control,
${page} .vm-filter-picker-input,
${page} textarea.ant-input,
${page} .lc-filter-select,
${page} .lc-filter-select.ant-select,
${page} .lc-filter-select .ant-select-selector,
${page} .lc-filter-select .ant-select-content,
${lc} .vm-filter-field .ant-select,
${lc} .vm-filter-field .ant-select-outlined,
${lc} .vm-filter-field .lc-filter-select,
${lc} .vm-filter-field .ant-select .ant-select-selector,
${lc} .vm-filter-field .ant-select-outlined .ant-select-selector,
${lc} .vm-filter-field .ant-select-multiple .ant-select-selector,
${lc} .vm-filter-field .ant-select .ant-select-content,
${lc} .vm-filter-field .ant-input,
${lc} .vm-filter-field .ant-input-affix-wrapper,
${lc} .vm-filter-field .vm-filter-picker-control,
${lc} .ldb-filter-card .ant-select,
${lc} .ldb-filter-card .lc-filter-select {
  background: ${c.controlBg} !important;
  background-color: ${c.controlBg} !important;
  border-color: ${c.hairlineStrong} !important;
  color: ${c.ink} !important;
  box-shadow: none !important;
}
${root} .ant-select-disabled,
${root} .ant-select-disabled .ant-select-selector,
${root} .ant-select-disabled .ant-select-content,
${page} .ant-select-disabled,
${page} .ant-select-disabled .ant-select-selector,
${page} .ant-select-disabled .ant-select-content,
${lc} .vm-filter-field .ant-select-disabled {
  background: ${c.soft} !important;
  background-color: ${c.soft} !important;
  color: ${c.muted} !important;
}
${page} .ant-select-selection-item,
${page} .ant-select-selection-search-input,
${page} .ant-select-input,
${page} .ant-select-content,
${page} .ant-select-placeholder,
${page} .ant-picker-input > input,
${page} .ant-input-number-input,
${lc} .vm-filter-field .ant-select-selection-item,
${lc} .vm-filter-field .ant-select-placeholder,
${lc} .vm-filter-field .ant-select-input {
  color: ${c.ink} !important;
  background: transparent !important;
}
${page} .ant-select-selection-placeholder,
${page} .ant-select-placeholder,
${page} .ant-select-selection-search-mirror,
${page} .ant-picker-input > input::placeholder,
${page} .ant-input::placeholder,
${page} .ant-select-input::placeholder,
${page} .vm-filter-picker-input::placeholder,
${page} .vm-filter-picker-input.is-placeholder {
  color: ${isDark ? '#a1a1aa' : c.mutedSoft} !important;
  opacity: 1 !important;
}
${page} .ant-select-arrow,
${page} .ant-select-suffix,
${page} .ant-select-suffix .anticon,
${page} .ant-picker-suffix,
${page} .ant-picker-clear,
${page} .ant-select-clear {
  color: ${c.muted} !important;
}
${page} .ant-select-multiple .ant-select-selection-item,
${page} .ant-select-selection-item {
  background: ${c.soft} !important;
  border-color: ${c.hairline} !important;
  color: ${c.ink} !important;
}
${page} .ant-select-selection-item-remove,
${page} .ant-select-selection-item-remove .anticon {
  color: ${c.muted} !important;
}
${page} .ant-input-number-group-addon,
${page} .ant-input-group-addon,
${page} .ant-space-addon {
  background: ${c.soft} !important;
  border-color: ${c.hairlineStrong} !important;
  color: ${c.muted} !important;
}
${page} .ant-select-focused,
${page} .ant-select-focused.ant-select-outlined,
${page} .ant-select-focused .ant-select-selector,
${page} .ant-input-affix-wrapper-focused,
${page} .ant-input:focus,
${page} .ant-picker-focused,
${page} .vm-filter-picker-control:focus-within {
  border-color: ${primary} !important;
  box-shadow: 0 0 0 2px ${primarySoft} !important;
}

${page} .ant-table,
${page} .ant-table-container,
${page} .ant-table-content,
${page} .ant-table-body,
${page} .ant-table-header {
  background: ${c.surface} !important;
  color: ${c.ink} !important;
}
${page} .ant-table-thead > tr > th {
  background: ${c.soft} !important;
  color: ${c.muted} !important;
  border-bottom-color: ${c.hairline} !important;
}
${page} .ant-table-tbody > tr > td {
  background: ${c.surface} !important;
  color: ${c.body} !important;
  border-bottom-color: ${c.hairline} !important;
}
${page} .ant-table-tbody > tr:hover > td,
${page} .ant-table-tbody > tr.ant-table-row:hover > td {
  background: ${c.soft} !important;
}
${page} .ant-table-cell-fix-left,
${page} .ant-table-cell-fix-right,
${page} .ant-table-cell-fix-start,
${page} .ant-table-cell-fix-end {
  background: ${c.surface} !important;
}
${page} .ant-table-tbody > tr:hover > .ant-table-cell-fix-left,
${page} .ant-table-tbody > tr:hover > .ant-table-cell-fix-right {
  background: ${c.soft} !important;
}

${page} .ant-tag,
${page} .vm-tag,
${page} .vm-status-tag,
${page} .lc-project-info-status,
${page} .lc-fee-info-cell__value {
  border-color: transparent !important;
}
${page} .ant-tag-default,
${page} .vm-tag-manual,
${page} .vm-status-tag--neutral,
${page} .vm-status-tag--gray,
${page} .vm-status-tag--muted,
${page} .vm-status-gray {
  background: ${c.tagNeutralBg} !important;
  color: ${c.tagNeutralFg} !important;
}
${isDark ? `
${page} .vm-status,
${page} .ant-tag {
  background: ${c.tagNeutralBg} !important;
  color: ${c.tagNeutralFg} !important;
  border-color: transparent !important;
}
${page} .vm-status-green,
${page} .ant-tag-success,
${page} .vm-tag-teal {
  background: rgba(39, 166, 68, 0.2) !important;
  color: #4ade80 !important;
}
${page} .vm-status-amber,
${page} .ant-tag-warning {
  background: rgba(217, 119, 6, 0.22) !important;
  color: #fbbf24 !important;
}
${page} .vm-status-red,
${page} .ant-tag-error {
  background: rgba(229, 72, 77, 0.22) !important;
  color: #f87171 !important;
}
${page} .vm-status-blue,
${page} .ant-tag-processing {
  background: ${soft(primary, 0.22)} !important;
  color: ${primaryHover} !important;
}
${page} .vm-status-gray {
  background: ${c.tagNeutralBg} !important;
  color: ${c.tagNeutralFg} !important;
}
${page} .lc-fee-info-cell__side--hydrogen .lc-fee-info-cell__value {
  background: ${c.tagNeutralBg} !important;
  color: ${c.tagNeutralFg} !important;
}
${page} .lc-approval-status-cell__count-badge {
  background-color: ${c.soft} !important;
  color: ${c.ink} !important;
  border-color: ${c.hairline} !important;
}
${page} .lc-fee-info-cell__side--payment .lc-fee-info-cell__value {
  background: ${soft(primary, 0.22)} !important;
  color: ${primaryHover} !important;
}
${page} .lc-fee-info-cell__side--payment.is-postpay .lc-fee-info-cell__value {
  background: rgba(229, 72, 77, 0.22) !important;
  color: #f87171 !important;
}
${page} .lc-fee-info-cell__side--period .lc-fee-info-cell__value {
  background: ${soft(primary, 0.22)} !important;
  color: ${primaryHover} !important;
}
` : ''}

${page} .vm-btn-primary,
${page} .ant-btn-primary {
  background: ${primary} !important;
  border-color: ${primary} !important;
  color: ${c.onPrimary} !important;
}
${page} .vm-btn-primary:hover,
${page} .ant-btn-primary:hover {
  background: ${primaryHover} !important;
  border-color: ${primaryHover} !important;
}
${page} .vm-btn-ghost,
${page} .vm-btn-secondary,
${page} .ant-btn-default {
  background: ${c.controlBg} !important;
  border-color: ${c.hairlineStrong} !important;
  color: ${c.ink} !important;
}
${page} .vm-btn-link,
${page} .ant-btn-link,
${page} a {
  color: ${primary} !important;
}
${page} .vm-kpi-card.active {
  border-color: ${primary} !important;
  box-shadow: 0 0 0 1px ${primarySoft} !important;
}
${page} .vm-pagination-page {
  background: ${c.controlBg} !important;
  border-color: ${c.hairline} !important;
  color: ${c.body} !important;
}
${page} .vm-pagination-page.active {
  background: ${primary} !important;
  border-color: ${primary} !important;
  color: ${c.onPrimary} !important;
}
${page} .vm-pagination-total,
${page} .vm-pagination-size {
  color: ${c.muted} !important;
}
${page} .vm-pagination-select,
${page} .vm-pagination-select .ant-select-selector {
  background: ${c.controlBg} !important;
  color: ${c.ink} !important;
  border-color: ${c.hairlineStrong} !important;
}

${root} .ant-select-dropdown,
${root} .ant-picker-dropdown,
${root} .ant-dropdown,
${root} .ant-popover-inner,
${root} .ant-modal-content,
${root} .ant-tooltip-inner {
  background: ${c.surface} !important;
  color: ${c.ink} !important;
  border: 1px solid ${c.hairline} !important;
}
${root} .ant-select-item,
${root} .ant-select-item-option-content {
  color: ${c.body} !important;
}
${root} .ant-select-item-option-active,
${root} .ant-select-item-option-selected {
  background: ${c.soft} !important;
  color: ${c.ink} !important;
}
`.trim();
}
