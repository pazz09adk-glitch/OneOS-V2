// 【重要】必须使用 const Component 作为组件变量名
// 加氢站管理 - 加氢记录（列表 + 筛选 + 预约加氢弹窗 + 卡片式新增/编辑 + 导出）

function hrSvgIcon(paths, size) {
	return React.createElement('svg', {
		viewBox: '0 0 24 24',
		width: size || 18,
		height: size || 18,
		fill: 'none',
		stroke: 'currentColor',
		strokeWidth: 2,
		strokeLinecap: 'round',
		strokeLinejoin: 'round',
		'aria-hidden': true
	}, paths.map(function (p, i) {
		if (p.tag === 'circle') return React.createElement('circle', { key: i, cx: p.cx, cy: p.cy, r: p.r });
		if (p.tag === 'line') return React.createElement('line', { key: i, x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2 });
		return React.createElement('path', { key: i, d: p.d });
	}));
}

var HR_ICONS = {
	back: hrSvgIcon([{ tag: 'line', x1: 19, y1: 12, x2: 5, y2: 12 }, { d: 'M12 19l-7-7 7-7' }], 16),
	fuel: hrSvgIcon([{ d: 'M3 22h12M5 22V10l7-4v16M19 22V8l-4-2v16' }, { tag: 'circle', cx: 8.5, cy: 17.5, r: 1.5 }], 18),
	user: hrSvgIcon([{ d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }, { tag: 'circle', cx: 12, cy: 7, r: 4 }], 16),
	calendar: hrSvgIcon([{ d: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z' }, { tag: 'line', x1: 16, y1: 2, x2: 16, y2: 6 }, { tag: 'line', x1: 8, y1: 2, x2: 8, y2: 6 }, { tag: 'line', x1: 3, y1: 10, x2: 21, y2: 10 }], 16),
	empty: hrSvgIcon([{ tag: 'circle', cx: 12, cy: 12, r: 10 }, { tag: 'line', x1: 8, y1: 12, x2: 16, y2: 12 }], 40)
};

/** @see web端/styles/oneos-ant-table-global-fix.js */
var ONEOS_ANT_TABLE_GLOBAL_FIX = [
	'.ant-table-container .ant-table-header { margin-bottom: 0 !important; }',
	'.ant-table-container .ant-table-body { margin-top: 0 !important; }',
	'.ant-table-container .ant-table-body > table, .ant-table-content table { margin-top: 0 !important; }',
	'.ant-table-tbody > tr.ant-table-measure-row, .ant-table-tbody > tr.ant-table-measure-row > td, .ant-table-tbody > tr.ant-table-measure-row > th { display: none !important; height: 0 !important; max-height: 0 !important; min-height: 0 !important; padding: 0 !important; margin: 0 !important; border: none !important; line-height: 0 !important; font-size: 0 !important; overflow: hidden !important; visibility: hidden !important; pointer-events: none !important; }'
];

var HR_PAGE_STYLE = ONEOS_ANT_TABLE_GLOBAL_FIX.concat([
	'.h2-station-page { --h2-form-row-gap: 20px; --h2-form-col-gap: 24px; --h2-form-label-gap: 8px; padding: 24px 24px 80px; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(165deg, #f1f5f9 0%, #f8fafc 50%, #f1f5f9 100%); overflow: hidden; box-sizing: border-box; }',
	'.h2-station-page.h2-station-page--create { padding: 0 0 96px; height: auto; min-height: 100dvh; overflow: auto; }',
	'.h2-station-page--create .h2-create-shell { width: 100%; max-width: none; margin: 0; padding: 24px 24px 0; box-sizing: border-box; }',
	'.h2-station-page--create .h2-create-topbar { display: flex; align-items: center; min-height: 40px; margin-bottom: 16px; position: relative; }',
	'.h2-station-page--create .h2-create-topbar-title { position: absolute; left: 50%; transform: translateX(-50%); margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.35; pointer-events: none; white-space: nowrap; }',
	'.h2-station-page--create .h2-create-back-btn { display: inline-flex !important; align-items: center; gap: 6px; height: 32px; padding: 0 12px !important; border-radius: 8px !important; font-weight: 500; color: #475569 !important; border: 1px solid #e2e8f0 !important; background: #fff !important; }',
	'.h2-station-page--create .h2-create-back-btn:hover { color: #059669 !important; border-color: #10b981 !important; background: #f0fdf4 !important; }',
	'.h2-station-page .h2-card-title-bar--step::before { display: none !important; }',
	'.h2-station-page .h2-card-step-badge { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(145deg, #10b981 0%, #059669 100%); color: #fff; font-size: 14px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.32); }',
	'.h2-station-page .h2-card-title-text { font-size: 15px; font-weight: 700; color: #0f172a; }',
	'.h2-station-page--create .h2-create-form > .h2-create-card + .h2-create-card { margin-top: 16px; }',
	'.h2-station-page--create .h2-create-footer-inner { justify-content: flex-end; }',
	'@media (prefers-reduced-motion: no-preference) { .h2-station-page--create .h2-create-card { animation: hrCreateCardIn 0.35s ease-out backwards; } .h2-station-page--create .h2-create-card + .h2-create-card { animation-delay: 0.06s; } }',
	'@keyframes hrCreateCardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }',
	'.h2-station-page .h2-create-card.ant-card { border-radius: 16px !important; border: 1px solid #e2e8f0 !important; box-shadow: 0 4px 24px -6px rgba(15, 23, 42, 0.06) !important; margin-bottom: 16px !important; }',
	'.h2-station-page .h2-create-card > .ant-card-head { border-bottom: 1px solid #f1f5f9 !important; min-height: auto; padding: 16px 22px !important; background: linear-gradient(180deg, #fafbfc 0%, #fff 100%); }',
	'.h2-station-page .h2-create-card > .ant-card-head .ant-card-head-title { font-size: 15px !important; font-weight: 700 !important; color: #0f172a !important; padding: 0 !important; }',
	'.h2-station-page .h2-create-card > .ant-card-body { padding: 20px 24px 24px !important; }',
	'.h2-station-page .h2-card-title-bar { display: inline-flex; align-items: center; gap: 10px; }',
	'.h2-station-page .h2-card-title-bar::before { content: ""; width: 3px; height: 16px; border-radius: 2px; background: linear-gradient(180deg, #10b981, #34d399); flex-shrink: 0; }',
	'.h2-station-page .h2-card-title-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 10px; background: #ecfdf5; color: #059669; flex-shrink: 0; }',
	'.h2-station-page--create .h2-create-form--grid .h2-create-form-grid { width: 100%; }',
	'.h2-station-page--create .h2-create-form--grid .ant-row { width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }',
	'.h2-station-page--create .h2-create-form--grid .ant-col { min-width: 0; }',
	'.h2-station-page--create .h2-create-form--grid .ant-form-item { margin-bottom: 0; width: 100%; }',
	'.h2-station-page--create .h2-create-form--grid .ant-form-item-label { padding: 0 0 var(--h2-form-label-gap); min-height: 22px; }',
	'.h2-station-page--create .h2-create-form--grid .ant-form-item-label > label { font-size: 13px; font-weight: 500; color: #475569; }',
	'.h2-station-page--create .h2-create-form--grid .ant-col > .ant-form-item { display: flex; flex-direction: column; }',
	'.h2-station-page--create .h2-create-form--grid .ant-form-item-control { flex: 1; width: 100%; }',
	'.h2-station-page--create .h2-create-form--grid .ant-form-item-control-input, .h2-station-page--create .h2-create-form--grid .ant-form-item-control-input-content { width: 100%; max-width: 100%; }',
	'.h2-station-page--create .h2-create-form--grid .h2-create-input, .h2-station-page--create .h2-create-form--grid .ant-select, .h2-station-page--create .h2-create-form--grid .ant-picker, .h2-station-page--create .h2-create-form--grid .ant-input-number { width: 100% !important; max-width: 100% !important; }',
	'.h2-station-page--create .h2-create-form--list .ant-input:not(.ant-input-disabled), .h2-station-page--create .h2-create-form--list .ant-select:not(.ant-select-disabled) .ant-select-selector, .h2-station-page--create .h2-create-form--list .ant-picker:not(.ant-picker-disabled), .h2-station-page--create .h2-create-form--list .ant-input-number:not(.ant-input-number-disabled) { border-radius: 8px !important; border: 1px solid #e2e8f0 !important; min-height: 32px !important; height: 32px !important; font-size: 13px !important; background: #fff !important; color: #0f172a !important; width: 100% !important; }',
	'.h2-station-page--create .h2-create-subsection-title { margin: 4px 0 0; padding: 12px 0 10px; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #f1f5f9; width: 100%; box-sizing: border-box; }',
	'.h2-station-page .h2-create-footer { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(10px); border-top: 1px solid #e2e8f0; box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.06); }',
	'.h2-station-page .h2-create-footer-inner { width: 100%; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; box-sizing: border-box; }',
	'.h2-station-page .h2-create-footer-hint { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 10px; min-width: 0; }',
	'.h2-station-page .h2-create-footer-progress { flex: 1; min-width: 120px; max-width: 200px; }',
	'.h2-station-page .h2-create-footer-progress .ant-progress-text { font-size: 12px !important; font-weight: 700; color: #059669 !important; }',
	'.h2-station-page .h2-create-footer-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-left: auto; }',
	'.h2-station-page .h2-create-footer-actions .ant-btn { min-height: 44px; padding: 0 20px; border-radius: 10px; font-weight: 600; }',
	'.h2-station-page .h2-create-footer-actions .ant-btn-primary { min-width: 120px; box-shadow: 0 4px 14px -2px rgba(16, 185, 129, 0.45); }',
	'.h2-station-page .lc-filter-card.ant-card { border-radius: 16px !important; border: 1px solid #e2e8f0 !important; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03) !important; margin-bottom: 16px; }',
	'.h2-station-page .lc-filter-card > .ant-card-head { border-bottom: 1px solid #f1f5f9 !important; min-height: auto; padding: 12px 20px !important; }',
	'.h2-station-page .lc-filter-card > .ant-card-head .ant-card-head-title { font-size: 15px !important; font-weight: 700 !important; color: #0f172a !important; padding: 0 !important; }',
	'.h2-station-page .lc-filter-card > .ant-card-body { padding: 16px 20px 20px !important; }',
	'.h2-station-page .lc-filter-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px 24px; align-items: center; }',
	'@media (max-width: 1280px) { .h2-station-page .lc-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }',
	'@media (max-width: 640px) { .h2-station-page .lc-filter-grid { grid-template-columns: 1fr; } }',
	'.h2-station-page .lc-filter-field { display: flex; align-items: center; gap: 12px; min-width: 0; min-height: 32px; }',
	'.h2-station-page .lc-filter-field-label { flex: 0 0 88px; text-align: right; font-size: 13px; font-weight: 500; color: #475569; line-height: 32px; white-space: nowrap; }',
	'.h2-station-page .lc-filter-field-control { flex: 1; min-width: 0; }',
	'.h2-station-page .lc-filter-field-control .ant-input, .h2-station-page .lc-filter-field-control .ant-input-affix-wrapper, .h2-station-page .lc-filter-field-control .ant-select .ant-select-selector, .h2-station-page .lc-filter-field-control .ant-picker, .h2-station-page .lc-filter-field-control .ant-picker-range { width: 100%; height: 32px !important; min-height: 32px !important; border-radius: 8px !important; box-sizing: border-box; }',
	'.h2-station-page .lc-filter-field-control .ant-input-affix-wrapper { display: inline-flex; align-items: center; padding-top: 0 !important; padding-bottom: 0 !important; }',
	'.h2-station-page .lc-filter-field-control .ant-select-single .ant-select-selector { display: flex; align-items: center; }',
	'.h2-station-page .lc-filter-field-control .ant-select-single .ant-select-selector .ant-select-selection-item, .h2-station-page .lc-filter-field-control .ant-select-single .ant-select-selector .ant-select-selection-placeholder { line-height: 30px !important; }',
	'.h2-station-page .lc-filter-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f5f9; }',
	'.h2-station-page .lc-table-section { margin-bottom: 0; flex: 1; display: flex; flex-direction: column; min-height: 0; }',
	'.h2-station-page .lc-table-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px 16px; margin-bottom: 8px; min-height: 32px; }',
	'.h2-station-page .lc-table-toolbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }',
	'.h2-station-page .lc-table-toolbar-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-left: auto; }',
	'.h2-station-page .lc-table-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03); overflow: hidden; flex: 1; overflow-y: auto; display: flex; flex-direction: column; }',
	'.h2-station-page .lc-list-table .ant-table-wrapper, .h2-station-page .lc-list-table .ant-table { width: 100% !important; }',
	'.h2-station-page .lc-table-card .ant-table-thead > tr > th { background: #f8fafc !important; color: #475569 !important; font-weight: 700 !important; font-size: 13px !important; border-bottom: 1px solid #e2e8f0 !important; padding: 12px 16px !important; }',
	'.h2-station-page .lc-table-card .ant-table-tbody > tr.ant-table-measure-row, .h2-station-page .lc-table-card .ant-table-tbody > tr.ant-table-measure-row > td { height: 0 !important; max-height: 0 !important; padding: 0 !important; border: none !important; visibility: hidden !important; }',
	'.h2-station-page .lc-table-card .ant-table-tbody > tr:not(.ant-table-measure-row) > td { padding: 12px 16px !important; font-size: 13px; }',
	'.h2-station-page .lc-table-card .ant-table-tbody > tr:not(.ant-table-measure-row):hover > td { background: #f8fafc !important; }',
	'.h2-station-page .lc-table-card .ant-pagination { margin: 0 !important; padding: 12px 16px !important; border-top: 1px solid #f1f5f9; }',
	'.h2-station-page .lc-action-btn { font-weight: 600 !important; color: #10b981 !important; padding: 0 !important; }',
	'.h2-station-page .lc-action-btn-danger { color: #ef4444 !important; }',
	'.h2-station-page .h2-row-actions { display: inline-flex; align-items: center; gap: 4px; }',
	'.h2-station-page .hr-refuel-plate { font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; }',
	'.h2-station-page .hr-refuel-kg { font-weight: 700; color: #059669; font-variant-numeric: tabular-nums; }',
	'.h2-station-page .hr-refuel-money { font-weight: 600; color: #4f46e5; font-variant-numeric: tabular-nums; }',
	'.h2-station-page .hr-refuel-km { font-variant-numeric: tabular-nums; color: #334155; }',
	'.h2-station-page .hr-refuel-time { font-variant-numeric: tabular-nums; color: #334155; font-size: 13px; white-space: nowrap; }',
	'.h2-station-page .hr-appointment-driver { font-weight: 600; color: #0f172a; }',
	'.h2-station-page .hr-appointment-contact { font-variant-numeric: tabular-nums; color: #475569; }',
	'.h2-station-page .hr-appointment-reject-reason { font-size: 12px; color: #94a3b8; margin-top: 4px; max-width: 220px; }',
	'.h2-refuel-drill-modal .ant-modal-content { border-radius: 16px !important; overflow: hidden; box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18) !important; }',
	'.h2-refuel-drill-modal .ant-modal-header { padding: 18px 24px 14px !important; border-bottom: 1px solid #f1f5f9 !important; margin-bottom: 0 !important; }',
	'.h2-refuel-drill-modal .ant-modal-title { font-size: 17px !important; font-weight: 700 !important; color: #0f172a !important; }',
	'.h2-refuel-drill-modal .ant-modal-body { padding: 16px 24px 20px !important; background: #f8fafc; }',
	'.h2-refuel-drill-modal .ant-modal-footer { padding: 12px 24px 18px !important; border-top: 1px solid #f1f5f9 !important; background: #fff; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-panel { display: flex; flex-direction: column; gap: 14px; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-station-card { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 16px; background: linear-gradient(135deg, #eff6ff 0%, #ecfdf5 50%, #f8fafc 100%); border: 1px solid #bfdbfe; border-radius: 12px; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-station-card__name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.35; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-station-card__meta { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; white-space: nowrap; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }',
	'@media (max-width: 860px) { .h2-refuel-drill-modal .h2-refuel-drill-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }',
	'@media (max-width: 520px) { .h2-refuel-drill-modal .h2-refuel-drill-stats { grid-template-columns: 1fr; } }',
	'.h2-refuel-drill-modal .h2-refuel-drill-stat { display: flex; flex-direction: column; justify-content: center; min-height: 78px; padding: 12px 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); min-width: 0; box-sizing: border-box; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-stat--count { border-left: 4px solid #3b82f6; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-stat--kg { border-left: 4px solid #10b981; background: linear-gradient(180deg, #fff 0%, #f0fdf4 100%); }',
	'.h2-refuel-drill-modal .h2-refuel-drill-stat--cost { border-left: 4px solid #f97316; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-stat--customer { border-left: 4px solid #6366f1; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-stat__label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 8px; line-height: 1.2; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-stat__value { font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.2; color: #0f172a; word-break: break-all; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-stat__value--count { color: #2563eb; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-stat__value--kg { color: #059669; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-stat__value--cost { color: #ea580c; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-stat__value--customer { color: #4f46e5; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-refuel-drill-modal .h2-refuel-drill-table-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border-bottom: 1px solid #f1f5f9; background: #fafbfc; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-table-head__left { display: flex; align-items: center; gap: 10px; min-width: 0; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-table-head__title { font-size: 13px; font-weight: 700; color: #334155; }',
	'.h2-refuel-drill-modal .h2-refuel-drill-table-head__count { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table { border-radius: 0 !important; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .ant-table { background: transparent !important; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .ant-table-container { border: none !important; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .ant-table-header { margin-bottom: 0 !important; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .ant-table-body { margin-top: 0 !important; overflow-y: auto !important; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .ant-table-body table { margin-top: 0 !important; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .ant-table-tbody > tr.ant-table-measure-row, .h2-refuel-drill-modal .h2-refuel-record-table .ant-table-tbody > tr.ant-table-measure-row > td { height: 0 !important; max-height: 0 !important; padding: 0 !important; margin: 0 !important; border: none !important; line-height: 0 !important; font-size: 0 !important; overflow: hidden !important; visibility: hidden !important; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .ant-table-thead > tr > th { background: #f8fafc !important; font-size: 12px !important; font-weight: 700 !important; color: #475569 !important; padding: 10px 12px !important; border-bottom: 1px solid #e2e8f0 !important; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .ant-table-tbody > tr:not(.ant-table-measure-row) > td { font-size: 13px !important; padding: 10px 12px !important; vertical-align: middle !important; border-bottom: 1px solid #f8fafc !important; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .ant-table-tbody > tr:not(.ant-table-measure-row):last-child > td { border-bottom: none !important; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .ant-table-tbody > tr:hover > td { background: #eff6ff !important; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .h2-refuel-drill-seq { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; border-radius: 6px; background: #f1f5f9; color: #64748b; font-size: 12px; font-weight: 700; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .h2-refuel-drill-time { color: #334155; font-variant-numeric: tabular-nums; font-size: 12px; white-space: nowrap; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .h2-refuel-drill-plate { font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .h2-refuel-drill-kg { font-weight: 700; color: #059669; font-variant-numeric: tabular-nums; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .h2-refuel-drill-contact { font-variant-numeric: tabular-nums; color: #475569; font-size: 13px; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .h2-refuel-drill-driver { font-weight: 600; color: #0f172a; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .hr-appointment-reject-reason { font-size: 12px; color: #94a3b8; margin-top: 4px; max-width: 220px; }',
	'.h2-station-page .hr-daily-stats-section { margin-bottom: 16px; }',
	'.h2-station-page .hr-daily-stats-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; }',
	'.h2-station-page .hr-daily-stats-head__title { font-size: 15px; font-weight: 700; color: #0f172a; }',
	'.h2-station-page .hr-daily-stats-head__meta { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; }',
	'.h2-station-page .hr-daily-stats-carousel { display: flex; align-items: stretch; gap: 8px; }',
	'.h2-station-page .hr-daily-stats-nav-btn { flex: 0 0 36px; width: 36px !important; min-width: 36px !important; height: auto !important; min-height: 88px !important; padding: 0 !important; border-radius: 10px !important; font-size: 20px !important; font-weight: 700 !important; color: #475569 !important; border: 1px solid #e2e8f0 !important; background: #fff !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); }',
	'.h2-station-page .hr-daily-stats-nav-btn:hover:not(:disabled) { color: #059669 !important; border-color: #10b981 !important; background: #f0fdf4 !important; }',
	'.h2-station-page .hr-daily-stats-nav-btn:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }',
	'.h2-station-page .hr-daily-stats-track { flex: 1; min-width: 0; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }',
	'.h2-station-page .hr-daily-stat-card { display: flex; flex-direction: column; gap: 8px; min-height: 88px; padding: 12px 10px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); box-sizing: border-box; min-width: 0; }',
	'.h2-station-page .hr-daily-stat-card--today { border-color: #86efac; background: linear-gradient(180deg, #fff 0%, #f0fdf4 100%); box-shadow: 0 2px 8px rgba(16, 185, 129, 0.12); }',
	'.h2-station-page .hr-daily-stat-card__date { font-size: 12px; font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; gap: 4px; }',
	'.h2-station-page .hr-daily-stat-card__today-tag { font-size: 10px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 1px 6px; border-radius: 999px; flex-shrink: 0; }',
	'.h2-station-page .hr-daily-stat-card__row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; }',
	'.h2-station-page .hr-daily-stat-card__label { color: #64748b; font-weight: 600; white-space: nowrap; }',
	'.h2-station-page .hr-daily-stat-card__value { font-weight: 800; font-variant-numeric: tabular-nums; }',
	'.h2-station-page .hr-daily-stat-card__value--count { color: #2563eb; }',
	'.h2-station-page .hr-daily-stat-card__value--kg { color: #059669; }',
	'.h2-station-page--create .hr-batch-create-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }',
	'.h2-station-page--create .hr-batch-create-toolbar__count { font-size: 13px; color: #64748b; font-variant-numeric: tabular-nums; }',
	'.h2-station-page--create .hr-batch-create-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-station-page--create .hr-batch-create-table .ant-table-thead > tr > th { background: #f8fafc !important; font-size: 12px !important; font-weight: 700 !important; color: #475569 !important; padding: 10px 12px !important; }',
	'.h2-station-page--create .hr-batch-create-table .ant-table-tbody > tr > td { padding: 8px 10px !important; vertical-align: middle !important; }',
	'.h2-station-page--create .hr-batch-create-table .ant-input, .h2-station-page--create .hr-batch-create-table .ant-input-number, .h2-station-page--create .hr-batch-create-table .ant-select .ant-select-selector, .h2-station-page--create .hr-batch-create-table .ant-picker { border-radius: 8px !important; font-size: 13px !important; }',
	'.h2-station-page--create .hr-batch-create-seq { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; border-radius: 6px; background: #f1f5f9; color: #64748b; font-size: 12px; font-weight: 700; }'
]).join('\n');

var HR_DAILY_STATS_WINDOW = 28;
var HR_DAILY_STATS_PAGE_SIZE = 7;
var HR_DAILY_STATS_MAX_PAGE = Math.ceil(HR_DAILY_STATS_WINDOW / HR_DAILY_STATS_PAGE_SIZE) - 1;

var HR_PRIMARY_BTN_STYLE = {
	borderRadius: 8,
	fontWeight: 600,
	background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
	border: 'none'
};

var HR_MOCK_FILLERS = ['张三', '李四', '王静', '赵敏', '陈浩'];

var HR_SETTLEMENT_STATUS_OPTIONS = [
	{ value: 'customer', label: '客户承担' },
	{ value: 'internal', label: '我司承担' },
	{ value: 'customer_self', label: '客户自行结算' }
];

var HR_SETTLEMENT_STATUS_MAP = {
	customer: { label: '客户承担', color: 'blue' },
	internal: { label: '我司承担', color: 'green' },
	customer_self: { label: '客户自行结算', color: 'orange' }
};

function hrSettlementStatusLabel(value) {
	var info = HR_SETTLEMENT_STATUS_MAP[value];
	return info ? info.label : '—';
}

var HR_INITIAL_RECORDS = [
	{ id: 'hr-1', hydrogenTime: '2026-05-28 10:21:08', plateNo: '浙A12345F', hydrogenKg: 12.5, customerAmount: 562.5, mileageKm: 128560, fillerName: '张三', settlementStatus: 'customer' },
	{ id: 'hr-2', hydrogenTime: '2026-05-26 14:08:33', plateNo: '浙A67890F', hydrogenKg: 10.0, customerAmount: 450.0, mileageKm: 95230, fillerName: '李四', settlementStatus: 'internal' },
	{ id: 'hr-3', hydrogenTime: '2026-05-22 09:15:00', plateNo: '浙A88888F', hydrogenKg: 18.3, customerAmount: 823.5, mileageKm: 201880, fillerName: '王静', settlementStatus: 'customer_self' },
	{ id: 'hr-4', hydrogenTime: '2026-05-18 16:42:11', plateNo: '浙A03561F', hydrogenKg: 15.6, customerAmount: 702.0, mileageKm: 167420, fillerName: '张三', settlementStatus: 'customer' },
	{ id: 'hr-5', hydrogenTime: '2026-05-30 09:30:22', plateNo: '浙B23456F', hydrogenKg: 15.3, customerAmount: 703.8, mileageKm: 143200, fillerName: '赵敏', settlementStatus: 'internal' },
	{ id: 'hr-6', hydrogenTime: '2026-05-27 18:10:05', plateNo: '浙B99999F', hydrogenKg: 18.2, customerAmount: 837.2, mileageKm: 189650, fillerName: '陈浩', settlementStatus: 'customer_self' },
	{ id: 'hr-7', hydrogenTime: '2026-05-24 11:05:40', plateNo: '浙B58888F', hydrogenKg: 11.8, customerAmount: 542.8, mileageKm: 110340, fillerName: '李四', settlementStatus: 'customer' },
	{ id: 'hr-8', hydrogenTime: '2026-04-20 16:45:18', plateNo: '沪A88888F', hydrogenKg: 8.0, customerAmount: 376.0, mileageKm: 88420, fillerName: '王静', settlementStatus: 'internal' },
	{ id: 'hr-9', hydrogenTime: '2026-04-08 09:12:55', plateNo: '沪BDB9161F', hydrogenKg: 9.5, customerAmount: 446.5, mileageKm: 76500, fillerName: '张三', settlementStatus: 'customer_self' },
	{ id: 'hr-10', hydrogenTime: '2026-03-15 10:00:00', plateNo: '苏E33333F', hydrogenKg: 6.2, customerAmount: 272.8, mileageKm: 45210, fillerName: '赵敏', settlementStatus: 'customer' }
];

var HR_APPOINTMENT_STATUS_MAP = {
	pending: { label: '待处理', color: 'processing' },
	accepted: { label: '已接受', color: 'success' },
	rejected: { label: '已拒绝', color: 'error' }
};

var HR_INITIAL_APPOINTMENTS = [
	{ id: 'ap-1', plateNo: '浙A12345F', appointmentTime: '2026-06-10 09:00:00', appointmentKg: 15.0, driverName: '刘建国', contact: '13800138011', status: 'pending' },
	{ id: 'ap-2', plateNo: '浙B23456F', appointmentTime: '2026-06-10 11:30:00', appointmentKg: 12.5, driverName: '陈师傅', contact: '13900139022', status: 'pending' },
	{ id: 'ap-3', plateNo: '浙A67890F', appointmentTime: '2026-06-09 14:00:00', appointmentKg: 10.0, driverName: '王磊', contact: '13700137033', status: 'pending' },
	{ id: 'ap-4', plateNo: '沪A88888F', appointmentTime: '2026-06-08 16:20:00', appointmentKg: 8.5, driverName: '张强', contact: '13600136044', status: 'accepted', handledTime: '2026-06-08 10:15:00' },
	{ id: 'ap-5', plateNo: '浙B99999F', appointmentTime: '2026-06-07 08:45:00', appointmentKg: 18.0, driverName: '赵明', contact: '13500135055', status: 'rejected', rejectReason: '预约时段站点设备检修，请改约其他时间', handledTime: '2026-06-06 17:30:00' }
];

function hrFormatKg(v) {
	var n = typeof v === 'number' ? v : parseFloat(v);
	return isNaN(n) ? '0.00' : n.toFixed(2);
}

function hrFormatYuan(v) {
	var n = typeof v === 'number' ? v : parseFloat(v);
	return isNaN(n) ? '0.00' : n.toFixed(2);
}

function hrFormatYuanSymbol(v) {
	if (v == null || v === '') return '—';
	var n = typeof v === 'number' ? v : parseFloat(v);
	if (isNaN(n)) return '—';
	return '￥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function hrFormatKm(v) {
	if (v == null || v === '') return '—';
	var n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
	if (isNaN(n)) return '—';
	return n.toLocaleString('zh-CN', { maximumFractionDigits: 0 }) + ' km';
}

function hrCsvEscape(v) {
	var s = v == null ? '' : String(v);
	if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
	return s;
}

function hrDownloadCsv(filename, headers, rows) {
	var lines = [headers.map(hrCsvEscape).join(',')].concat(
		(rows || []).map(function (r) { return r.map(hrCsvEscape).join(','); })
	);
	var blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
	var a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	a.click();
	URL.revokeObjectURL(a.href);
}

function hrExtractDateKey(timeStr) {
	if (!timeStr) return '';
	var s = String(timeStr).trim();
	return s.length >= 10 ? s.slice(0, 10) : s;
}

function hrPad2(n) {
	return n < 10 ? '0' + n : String(n);
}

function hrDateToKey(d) {
	return d.getFullYear() + '-' + hrPad2(d.getMonth() + 1) + '-' + hrPad2(d.getDate());
}

function hrBuildRecentDailyWindow(list, dayjs, windowDays) {
	windowDays = windowDays || HR_DAILY_STATS_WINDOW;
	var statsMap = {};
	(list || []).forEach(function (r) {
		var day = hrExtractDateKey(r.hydrogenTime);
		if (!day) return;
		if (!statsMap[day]) statsMap[day] = { count: 0, totalKg: 0 };
		statsMap[day].count += 1;
		var kg = parseFloat(r.hydrogenKg);
		if (!isNaN(kg)) statsMap[day].totalKg += kg;
	});

	var days = [];
	var i;
	for (i = 0; i < windowDays; i++) {
		var key;
		var shortLabel;
		if (dayjs) {
			var d = dayjs().startOf('day').subtract(i, 'day');
			key = d.format('YYYY-MM-DD');
			shortLabel = d.format('MM-DD');
		} else {
			var native = new Date();
			native.setHours(0, 0, 0, 0);
			native.setDate(native.getDate() - i);
			key = hrDateToKey(native);
			shortLabel = hrPad2(native.getMonth() + 1) + '-' + hrPad2(native.getDate());
		}
		var stat = statsMap[key];
		days.push({
			date: key,
			dateLabel: shortLabel,
			isToday: i === 0,
			count: stat ? stat.count : 0,
			totalKg: stat ? Math.round(stat.totalKg * 100) / 100 : 0
		});
	}
	return days;
}

function hrInTimeRange(timeStr, range, dayjs) {
	if (!range || range.length < 2 || !range[0] || !range[1]) return true;
	if (!timeStr) return false;
	if (dayjs) {
		var t = dayjs(timeStr);
		var start = dayjs(range[0]);
		var end = dayjs(range[1]);
		if (!t.isValid() || !start.isValid() || !end.isValid()) return true;
		return (t.isAfter(start) || t.isSame(start)) && (t.isBefore(end) || t.isSame(end));
	}
	var tKey = String(timeStr).replace(/[-:\s]/g, '');
	var sKey = range[0].format ? range[0].format('YYYYMMDDHHmmss') : '';
	var eKey = range[1].format ? range[1].format('YYYYMMDDHHmmss') : '';
	if (!sKey || !eKey) return true;
	return tKey >= sKey && tKey <= eKey;
}

function hrEmptyForm() {
	return {
		hydrogenTime: '',
		plateNo: '',
		hydrogenKg: '',
		customerAmount: '',
		mileageKm: '',
		fillerName: undefined,
		settlementStatus: undefined
	};
}

function hrNextId() {
	return 'hr-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function hrNextBatchRowId() {
	return 'hr-row-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

function hrEmptyBatchRow() {
	return {
		_rowId: hrNextBatchRowId(),
		hydrogenTime: '',
		plateNo: '',
		hydrogenKg: '',
		customerAmount: '',
		mileageKm: '',
		fillerName: undefined,
		settlementStatus: undefined
	};
}

function hrIsBatchRowEmpty(row) {
	if (!row) return true;
	if ((row.hydrogenTime || '').trim()) return false;
	if ((row.plateNo || '').trim()) return false;
	if ((row.hydrogenKg || '').trim()) return false;
	if ((row.customerAmount || '').trim()) return false;
	if ((row.mileageKm || '').trim()) return false;
	if (row.fillerName) return false;
	return true;
}

function hrBatchRowDirty(row) {
	return !hrIsBatchRowEmpty(row);
}

function hrBatchRowsDirty(rows) {
	return (rows || []).some(hrBatchRowDirty);
}

function hrValidateBatchRow(row, rowIndex) {
	var label = '第 ' + rowIndex + ' 行';
	if (!(row.hydrogenTime || '').trim()) return label + '：请填写加氢时间';
	if (!(row.plateNo || '').trim()) return label + '：请填写车牌号';
	var kg = parseFloat(row.hydrogenKg);
	if (isNaN(kg) || kg <= 0) return label + '：请填写有效的加氢量（kg）';
	var amount = parseFloat(row.customerAmount);
	if (isNaN(amount) || amount < 0) return label + '：请填写有效的加氢金额';
	var km = parseFloat(row.mileageKm);
	if (isNaN(km) || km < 0) return label + '：请填写有效的公里数';
	if (!row.fillerName) return label + '：请选择充装员';
	if (!row.settlementStatus) return label + '：请选择承担方式';
	return null;
}

function hrBatchRowToPayload(row) {
	return {
		hydrogenTime: (row.hydrogenTime || '').trim(),
		plateNo: (row.plateNo || '').trim().toUpperCase(),
		hydrogenKg: Math.round(parseFloat(row.hydrogenKg) * 100) / 100,
		customerAmount: Math.round(parseFloat(row.customerAmount) * 100) / 100,
		mileageKm: Math.round(parseFloat(row.mileageKm)),
		fillerName: row.fillerName,
		settlementStatus: row.settlementStatus
	};
}

function hrCardTitleWithStep(step, text) {
	return React.createElement('span', { className: 'h2-card-title-bar h2-card-title-bar--step' },
		React.createElement('span', { className: 'h2-card-step-badge', 'aria-hidden': true }, step),
		React.createElement('span', { className: 'h2-card-title-text' }, text)
	);
}

function hrFormDirty(form) {
	if ((form.hydrogenTime || '').trim()) return true;
	if ((form.plateNo || '').trim()) return true;
	if ((form.hydrogenKg || '').trim()) return true;
	if ((form.customerAmount || '').trim()) return true;
	if ((form.mileageKm || '').trim()) return true;
	if (form.fillerName) return true;
	if (form.settlementStatus) return true;
	return false;
}

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Table = antd.Table;
	var Button = antd.Button;
	var Select = antd.Select;
	var Input = antd.Input;
	var InputNumber = antd.InputNumber;
	var DatePicker = antd.DatePicker;
	var Modal = antd.Modal;
	var Form = antd.Form;
	var Row = antd.Row;
	var Col = antd.Col;
	var Tag = antd.Tag;
	var Badge = antd.Badge;
	var message = antd.message;
	var dayjs = window.dayjs;

	var RangePicker = DatePicker.RangePicker;

	var subViewState = useState('list');
	var subView = subViewState[0];
	var setSubView = subViewState[1];

	var formModeState = useState('create');
	var formMode = formModeState[0];
	var setFormMode = formModeState[1];

	var editingIdState = useState(null);
	var editingId = editingIdState[0];
	var setEditingId = editingIdState[1];

	var listDataState = useState(function () {
		return HR_INITIAL_RECORDS.map(function (r) { return Object.assign({}, r); });
	});
	var listData = listDataState[0];
	var setListData = listDataState[1];

	var draftFiltersState = useState({ timeRange: [], plateNo: undefined, fillerName: undefined });
	var draftFilters = draftFiltersState[0];
	var setDraftFilters = draftFiltersState[1];

	var appliedFiltersState = useState({ timeRange: [], plateNo: undefined, fillerName: undefined });
	var appliedFilters = appliedFiltersState[0];
	var setAppliedFilters = appliedFiltersState[1];

	var pageState = useState(1);
	var page = pageState[0];
	var setPage = pageState[1];
	var pageSizeState = useState(10);
	var pageSize = pageSizeState[0];
	var setPageSize = pageSizeState[1];

	var formState = useState(hrEmptyForm());
	var form = formState[0];
	var setForm = formState[1];

	var batchRowsState = useState([]);
	var batchRows = batchRowsState[0];
	var setBatchRows = batchRowsState[1];

	var formSubmittingState = useState(false);
	var formSubmitting = formSubmittingState[0];
	var setFormSubmitting = formSubmittingState[1];

	var deleteModalState = useState({ open: false, record: null });
	var deleteModal = deleteModalState[0];
	var setDeleteModal = deleteModalState[1];

	var appointmentModalOpenState = useState(false);
	var appointmentModalOpen = appointmentModalOpenState[0];
	var setAppointmentModalOpen = appointmentModalOpenState[1];

	var appointmentDataState = useState(function () {
		return HR_INITIAL_APPOINTMENTS.map(function (r) { return Object.assign({}, r); });
	});
	var appointmentData = appointmentDataState[0];
	var setAppointmentData = appointmentDataState[1];

	var appointmentPageState = useState(1);
	var appointmentPage = appointmentPageState[0];
	var setAppointmentPage = appointmentPageState[1];
	var appointmentPageSizeState = useState(10);
	var appointmentPageSize = appointmentPageSizeState[0];
	var setAppointmentPageSize = appointmentPageSizeState[1];

	var rejectModalState = useState({ open: false, record: null, reason: '' });
	var rejectModal = rejectModalState[0];
	var setRejectModal = rejectModalState[1];

	var dailyStatsPageState = useState(0);
	var dailyStatsPage = dailyStatsPageState[0];
	var setDailyStatsPage = dailyStatsPageState[1];

	var plateOptions = useMemo(function () {
		var map = {};
		listData.forEach(function (r) {
			if (r.plateNo) map[r.plateNo] = true;
		});
		return Object.keys(map).sort().map(function (p) {
			return { value: p, label: p };
		});
	}, [listData]);

	var fillerOptions = useMemo(function () {
		var map = {};
		HR_MOCK_FILLERS.forEach(function (n) { map[n] = true; });
		listData.forEach(function (r) {
			if (r.fillerName) map[r.fillerName] = true;
		});
		return Object.keys(map).sort().map(function (n) {
			return { value: n, label: n };
		});
	}, [listData]);

	var pendingAppointmentCount = useMemo(function () {
		var count = 0;
		var i;
		for (i = 0; i < appointmentData.length; i++) {
			if (appointmentData[i].status === 'pending') count += 1;
		}
		return count;
	}, [appointmentData]);

	var sortedAppointments = useMemo(function () {
		return appointmentData.slice().sort(function (a, b) {
			return String(b.appointmentTime || '').localeCompare(String(a.appointmentTime || ''));
		});
	}, [appointmentData]);

	var appointmentSummary = useMemo(function () {
		var pending = 0;
		var accepted = 0;
		var rejected = 0;
		var totalKg = 0;
		var i;
		for (i = 0; i < appointmentData.length; i++) {
			var item = appointmentData[i];
			var kg = parseFloat(item.appointmentKg);
			if (!isNaN(kg)) totalKg += kg;
			if (item.status === 'pending') pending += 1;
			else if (item.status === 'accepted') accepted += 1;
			else if (item.status === 'rejected') rejected += 1;
		}
		return { pending: pending, accepted: accepted, rejected: rejected, totalKg: totalKg, total: appointmentData.length };
	}, [appointmentData]);

	var filteredList = useMemo(function () {
		var list = listData.slice();
		if (appliedFilters.plateNo) {
			list = list.filter(function (r) { return r.plateNo === appliedFilters.plateNo; });
		}
		if (appliedFilters.fillerName) {
			list = list.filter(function (r) { return r.fillerName === appliedFilters.fillerName; });
		}
		if (appliedFilters.timeRange && appliedFilters.timeRange.length === 2) {
			list = list.filter(function (r) {
				return hrInTimeRange(r.hydrogenTime, appliedFilters.timeRange, dayjs);
			});
		}
		return list.sort(function (a, b) {
			return String(b.hydrogenTime || '').localeCompare(String(a.hydrogenTime || ''));
		});
	}, [listData, appliedFilters, dayjs]);

	var dailyStatsWindow = useMemo(function () {
		return hrBuildRecentDailyWindow(filteredList, dayjs, HR_DAILY_STATS_WINDOW);
	}, [filteredList, dayjs]);

	var dailyStatsPageItems = useMemo(function () {
		var start = dailyStatsPage * HR_DAILY_STATS_PAGE_SIZE;
		var chunk = dailyStatsWindow.slice(start, start + HR_DAILY_STATS_PAGE_SIZE);
		return chunk.slice().reverse();
	}, [dailyStatsWindow, dailyStatsPage]);

	var renderFilterField = useCallback(function (label, control) {
		return React.createElement('div', { className: 'lc-filter-field' },
			React.createElement('span', { className: 'lc-filter-field-label' }, label),
			React.createElement('div', { className: 'lc-filter-field-control' }, control)
		);
	}, []);

	var handleFilterQuery = useCallback(function () {
		setAppliedFilters({
			timeRange: (draftFilters.timeRange || []).slice(),
			plateNo: draftFilters.plateNo,
			fillerName: draftFilters.fillerName
		});
		setPage(1);
		setDailyStatsPage(0);
	}, [draftFilters]);

	var handleFilterReset = useCallback(function () {
		var empty = { timeRange: [], plateNo: undefined, fillerName: undefined };
		setDraftFilters(empty);
		setAppliedFilters(empty);
		setPage(1);
		setDailyStatsPage(0);
	}, []);

	var resetFormView = useCallback(function () {
		setSubView('list');
		setForm(hrEmptyForm());
		setBatchRows([]);
		setEditingId(null);
	}, []);

	var handleFormPageBack = useCallback(function () {
		if (formSubmitting) return;
		var dirty = formMode === 'create' ? hrBatchRowsDirty(batchRows) : hrFormDirty(form);
		if (dirty) {
			Modal.confirm({
				title: '确认离开',
				content: '当前有未保存内容，确定返回列表吗？',
				okText: '离开',
				cancelText: '继续编辑',
				centered: true,
				onOk: resetFormView
			});
			return;
		}
		resetFormView();
	}, [form, batchRows, formMode, formSubmitting, resetFormView]);

	var openCreate = useCallback(function () {
		setForm(hrEmptyForm());
		setBatchRows([hrEmptyBatchRow()]);
		setFormMode('create');
		setEditingId(null);
		setSubView('form');
	}, []);

	var updateBatchRow = useCallback(function (rowId, patch) {
		setBatchRows(function (prev) {
			return prev.map(function (r) {
				if (r._rowId !== rowId) return r;
				return Object.assign({}, r, patch);
			});
		});
	}, []);

	var addBatchRow = useCallback(function () {
		setBatchRows(function (prev) { return prev.concat([hrEmptyBatchRow()]); });
	}, []);

	var removeBatchRow = useCallback(function (rowId) {
		setBatchRows(function (prev) {
			if (prev.length <= 1) return [hrEmptyBatchRow()];
			return prev.filter(function (r) { return r._rowId !== rowId; });
		});
	}, []);

	var openEdit = useCallback(function (record) {
		setForm({
			hydrogenTime: record.hydrogenTime || '',
			plateNo: record.plateNo || '',
			hydrogenKg: record.hydrogenKg != null ? String(record.hydrogenKg) : '',
			customerAmount: record.customerAmount != null ? String(record.customerAmount) : '',
			mileageKm: record.mileageKm != null ? String(record.mileageKm) : '',
			fillerName: record.fillerName,
			settlementStatus: record.settlementStatus
		});
		setFormMode('edit');
		setEditingId(record.id);
		setSubView('form');
	}, []);

	var validateForm = useCallback(function () {
		if (!(form.hydrogenTime || '').trim()) {
			message.warning('请填写加氢时间');
			return false;
		}
		if (!(form.plateNo || '').trim()) {
			message.warning('请填写车牌号');
			return false;
		}
		var kg = parseFloat(form.hydrogenKg);
		if (isNaN(kg) || kg <= 0) {
			message.warning('请填写有效的加氢量（kg）');
			return false;
		}
		var amount = parseFloat(form.customerAmount);
		if (isNaN(amount) || amount < 0) {
			message.warning('请填写有效的加氢金额');
			return false;
		}
		var km = parseFloat(form.mileageKm);
		if (isNaN(km) || km < 0) {
			message.warning('请填写有效的公里数');
			return false;
		}
		if (!form.fillerName) {
			message.warning('请选择充装员');
			return false;
		}
		if (!form.settlementStatus) {
			message.warning('请选择承担方式');
			return false;
		}
		return true;
	}, [form]);

	var handleFormSubmit = useCallback(function () {
		if (formSubmitting) return;
		if (!validateForm()) return;
		setFormSubmitting(true);
		var payload = {
			hydrogenTime: (form.hydrogenTime || '').trim(),
			plateNo: (form.plateNo || '').trim().toUpperCase(),
			hydrogenKg: Math.round(parseFloat(form.hydrogenKg) * 100) / 100,
			customerAmount: Math.round(parseFloat(form.customerAmount) * 100) / 100,
			mileageKm: Math.round(parseFloat(form.mileageKm)),
			fillerName: form.fillerName,
			settlementStatus: form.settlementStatus
		};
		if (formMode === 'edit' && editingId) {
			setListData(function (prev) {
				return prev.map(function (r) {
					if (r.id !== editingId) return r;
					return Object.assign({}, r, payload);
				});
			});
			message.success('加氢记录已更新');
		}
		window.setTimeout(function () {
			setFormSubmitting(false);
			resetFormView();
		}, 280);
	}, [form, formMode, editingId, formSubmitting, validateForm, resetFormView]);

	var handleBatchSubmit = useCallback(function () {
		if (formSubmitting) return;
		var filledRows = batchRows.filter(function (r) { return !hrIsBatchRowEmpty(r); });
		if (!filledRows.length) {
			message.warning('请至少填写一行加氢记录');
			return;
		}
		var i;
		for (i = 0; i < filledRows.length; i++) {
			var rowIndex = 0;
			var j;
			for (j = 0; j < batchRows.length; j++) {
				if (batchRows[j]._rowId === filledRows[i]._rowId) {
					rowIndex = j + 1;
					break;
				}
			}
			var err = hrValidateBatchRow(filledRows[i], rowIndex);
			if (err) {
				message.warning(err);
				return;
			}
		}
		setFormSubmitting(true);
		var newRecords = filledRows.map(function (row) {
			return Object.assign({ id: hrNextId() }, hrBatchRowToPayload(row));
		});
		setListData(function (prev) { return newRecords.concat(prev); });
		message.success('已成功新增 ' + newRecords.length + ' 条加氢记录');
		window.setTimeout(function () {
			setFormSubmitting(false);
			resetFormView();
		}, 280);
	}, [batchRows, formSubmitting, resetFormView]);

	var handleAcceptAppointment = useCallback(function (record) {
		if (!record || record.status !== 'pending') return;
		Modal.confirm({
			title: '接受预约',
			content: '确认接受车牌「' + (record.plateNo || '') + '」的加氢预约？预约时间：' + (record.appointmentTime || '—'),
			okText: '接受预约',
			cancelText: '取消',
			centered: true,
			okButtonProps: { style: HR_PRIMARY_BTN_STYLE },
			onOk: function () {
				var now = dayjs ? dayjs().format('YYYY-MM-DD HH:mm:ss') : '';
				setAppointmentData(function (prev) {
					return prev.map(function (r) {
						if (r.id !== record.id) return r;
						return Object.assign({}, r, { status: 'accepted', handledTime: now, rejectReason: '' });
					});
				});
				message.success('已接受预约');
			}
		});
	}, [dayjs]);

	var openRejectAppointment = useCallback(function (record) {
		if (!record || record.status !== 'pending') return;
		setRejectModal({ open: true, record: record, reason: '' });
	}, []);

	var closeRejectModal = useCallback(function () {
		setRejectModal({ open: false, record: null, reason: '' });
	}, []);

	var handleConfirmRejectAppointment = useCallback(function () {
		if (!rejectModal.record) return;
		var reason = (rejectModal.reason || '').trim();
		if (!reason) {
			message.warning('请填写拒绝原因');
			return;
		}
		var recordId = rejectModal.record.id;
		var now = dayjs ? dayjs().format('YYYY-MM-DD HH:mm:ss') : '';
		setAppointmentData(function (prev) {
			return prev.map(function (r) {
				if (r.id !== recordId) return r;
				return Object.assign({}, r, { status: 'rejected', rejectReason: reason, handledTime: now });
			});
		});
		message.success('已拒绝预约');
		closeRejectModal();
	}, [rejectModal, dayjs, closeRejectModal]);

	var handleExport = useCallback(function () {
		if (!filteredList.length) {
			message.warning('当前筛选条件下暂无数据可导出');
			return;
		}
		var headers = ['序号', '加氢时间', '车牌号', '加氢量(kg)', '加氢金额(元)', '公里数(km)', '承担方式', '充装员'];
		var rows = filteredList.map(function (r, index) {
			return [
				index + 1,
				r.hydrogenTime || '',
				r.plateNo || '',
				hrFormatKg(r.hydrogenKg),
				hrFormatYuan(r.customerAmount),
				r.mileageKm != null ? r.mileageKm : '',
				hrSettlementStatusLabel(r.settlementStatus),
				r.fillerName || ''
			];
		});
		hrDownloadCsv('加氢记录_' + new Date().getTime() + '.csv', headers, rows);
		message.success('已导出 ' + filteredList.length + ' 条加氢记录');
	}, [filteredList]);

	var columns = useMemo(function () {
		return [
			{
				title: '加氢时间',
				dataIndex: 'hydrogenTime',
				key: 'hydrogenTime',
				width: 168,
				render: function (v) {
					return React.createElement('span', { className: 'hr-refuel-time' }, v || '—');
				}
			},
			{
				title: '车牌号',
				dataIndex: 'plateNo',
				key: 'plateNo',
				width: 120,
				render: function (v) {
					return React.createElement('span', { className: 'hr-refuel-plate' }, v || '—');
				}
			},
			{
				title: '加氢量（kg）',
				dataIndex: 'hydrogenKg',
				key: 'hydrogenKg',
				width: 120,
				align: 'right',
				render: function (v) {
					return React.createElement('span', { className: 'hr-refuel-kg' }, hrFormatKg(v));
				}
			},
			{
				title: '加氢金额',
				dataIndex: 'customerAmount',
				key: 'customerAmount',
				width: 120,
				align: 'right',
				render: function (v) {
					return React.createElement('span', { className: 'hr-refuel-money' }, hrFormatYuanSymbol(v));
				}
			},
			{
				title: '公里数',
				dataIndex: 'mileageKm',
				key: 'mileageKm',
				width: 120,
				align: 'right',
				render: function (v) {
					return React.createElement('span', { className: 'hr-refuel-km' }, hrFormatKm(v));
				}
			},
			{
				title: '承担方式',
				dataIndex: 'settlementStatus',
				key: 'settlementStatus',
				width: 120,
				render: function (v) {
					var info = HR_SETTLEMENT_STATUS_MAP[v];
					if (!info) return '—';
					return React.createElement(Tag, { color: info.color, style: { margin: 0, borderRadius: 6, fontWeight: 600 } }, info.label);
				}
			},
			{
				title: '充装员',
				dataIndex: 'fillerName',
				key: 'fillerName',
				width: 100,
				ellipsis: true
			},
			{
				title: '操作',
				key: 'actions',
				width: 140,
				fixed: 'right',
				render: function (_, record) {
					return React.createElement('div', { className: 'h2-row-actions' },
						React.createElement(Button, {
							type: 'link',
							size: 'small',
							className: 'lc-action-btn',
							onClick: function () { openEdit(record); }
						}, '编辑'),
						React.createElement(Button, {
							type: 'link',
							size: 'small',
							className: 'lc-action-btn lc-action-btn-danger',
							onClick: function () { setDeleteModal({ open: true, record: record }); }
						}, '删除')
					);
				}
			}
		];
	}, [openEdit]);

	var appointmentColumns = useMemo(function () {
		return [
			{
				title: '序号',
				key: 'seq',
				width: 52,
				align: 'center',
				render: function (_, __, index) {
					return React.createElement('span', { className: 'h2-refuel-drill-seq' }, index + 1);
				}
			},
			{
				title: '车牌号',
				dataIndex: 'plateNo',
				key: 'plateNo',
				width: 120,
				render: function (v) {
					return React.createElement('span', { className: 'h2-refuel-drill-plate' }, v || '—');
				}
			},
			{
				title: '预约时间',
				dataIndex: 'appointmentTime',
				key: 'appointmentTime',
				width: 168,
				render: function (v) {
					return React.createElement('span', { className: 'h2-refuel-drill-time' }, v || '—');
				}
			},
			{
				title: '预约加氢量（kg）',
				dataIndex: 'appointmentKg',
				key: 'appointmentKg',
				width: 140,
				align: 'right',
				render: function (v) {
					return React.createElement('span', { className: 'h2-refuel-drill-kg' }, hrFormatKg(v));
				}
			},
			{
				title: '预约司机',
				dataIndex: 'driverName',
				key: 'driverName',
				width: 110,
				render: function (v) {
					return React.createElement('span', { className: 'h2-refuel-drill-driver' }, v || '—');
				}
			},
			{
				title: '联系方式',
				dataIndex: 'contact',
				key: 'contact',
				width: 130,
				render: function (v) {
					return React.createElement('span', { className: 'h2-refuel-drill-contact' }, v || '—');
				}
			},
			{
				title: '状态',
				dataIndex: 'status',
				key: 'status',
				width: 100,
				render: function (v) {
					var info = HR_APPOINTMENT_STATUS_MAP[v] || { label: v || '—', color: 'default' };
					return React.createElement(Tag, { color: info.color, style: { margin: 0, borderRadius: 6, fontWeight: 600 } }, info.label);
				}
			},
			{
				title: '操作',
				key: 'actions',
				width: 200,
				fixed: 'right',
				render: function (_, record) {
					if (record.status !== 'pending') {
						return record.status === 'rejected' && record.rejectReason
							? React.createElement('div', null,
								React.createElement('span', { style: { color: '#94a3b8', fontSize: 12 } }, '已处理'),
								React.createElement('div', { className: 'hr-appointment-reject-reason', title: record.rejectReason }, '拒绝原因：' + record.rejectReason)
							)
							: React.createElement('span', { style: { color: '#94a3b8', fontSize: 12 } }, '已处理');
					}
					return React.createElement('div', { className: 'h2-row-actions' },
						React.createElement(Button, {
							type: 'link',
							size: 'small',
							className: 'lc-action-btn',
							onClick: function () { handleAcceptAppointment(record); }
						}, '接受预约'),
						React.createElement(Button, {
							type: 'link',
							size: 'small',
							className: 'lc-action-btn lc-action-btn-danger',
							onClick: function () { openRejectAppointment(record); }
						}, '拒绝预约')
					);
				}
			}
		];
	}, [handleAcceptAppointment, openRejectAppointment]);

	var formTimeValue = null;
	if (dayjs && form.hydrogenTime) {
		var ft = dayjs(form.hydrogenTime);
		if (ft.isValid()) formTimeValue = ft;
	}

	var inputCls = 'h2-create-input';
	var H2_CREATE_GUTTER = [24, 20];

	var formItem = function (label, required, node) {
		return React.createElement(Form.Item, {
			label: required
				? React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), label)
				: label
		}, node);
	};

	var formRow = function () {
		return React.createElement.apply(null, [Row, { gutter: H2_CREATE_GUTTER, align: 'stretch' }].concat(Array.prototype.slice.call(arguments)));
	};

	var col24 = function (node) {
		return React.createElement(Col, { xs: 24, span: 24 }, node);
	};

	var col12 = function (node) {
		return React.createElement(Col, { xs: 24, md: 12 }, node);
	};

	var col8 = function (node) {
		return React.createElement(Col, { xs: 24, lg: 8 }, node);
	};

	var gridBlock = function () {
		var rows = Array.prototype.slice.call(arguments, 0);
		return React.createElement('div', { className: 'h2-create-form-grid' }, rows);
	};

	var formPageTitle = formMode === 'edit' ? '编辑加氢记录' : '批量新增加氢记录';

	var batchFilledCount = useMemo(function () {
		var n = 0;
		var i;
		for (i = 0; i < batchRows.length; i++) {
			if (!hrIsBatchRowEmpty(batchRows[i])) n += 1;
		}
		return n;
	}, [batchRows]);

	var batchCreateColumns = useMemo(function () {
		return [
			{
				title: '序号',
				width: 56,
				align: 'center',
				render: function (_, __, index) {
					return React.createElement('span', { className: 'hr-batch-create-seq' }, index + 1);
				}
			},
			{
				title: React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), '加氢时间'),
				width: 200,
				render: function (_, record) {
					var timeVal = null;
					if (dayjs && record.hydrogenTime) {
						var t = dayjs(record.hydrogenTime);
						if (t.isValid()) timeVal = t;
					}
					return dayjs && DatePicker
						? React.createElement(DatePicker, {
							showTime: true,
							style: { width: '100%' },
							format: 'YYYY-MM-DD HH:mm:ss',
							placeholder: '加氢时间',
							value: timeVal,
							onChange: function (v) {
								updateBatchRow(record._rowId, {
									hydrogenTime: v && v.isValid && v.isValid() ? v.format('YYYY-MM-DD HH:mm:ss') : ''
								});
							}
						})
						: React.createElement(Input, {
							placeholder: 'YYYY-MM-DD HH:mm:ss',
							value: record.hydrogenTime || '',
							onChange: function (e) { updateBatchRow(record._rowId, { hydrogenTime: e.target.value }); }
						});
				}
			},
			{
				title: React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), '车牌号'),
				width: 130,
				render: function (_, record) {
					return React.createElement(Input, {
						placeholder: '车牌号',
						value: record.plateNo || '',
						maxLength: 16,
						onChange: function (e) { updateBatchRow(record._rowId, { plateNo: e.target.value }); }
					});
				}
			},
			{
				title: React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), '加氢量(kg)'),
				width: 110,
				render: function (_, record) {
					return React.createElement(InputNumber, {
						style: { width: '100%' },
						min: 0.01,
						step: 0.1,
						precision: 2,
						placeholder: 'kg',
						value: record.hydrogenKg === '' ? null : parseFloat(record.hydrogenKg),
						onChange: function (v) { updateBatchRow(record._rowId, { hydrogenKg: v == null ? '' : String(v) }); }
					});
				}
			},
			{
				title: React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), '加氢金额(元)'),
				width: 120,
				render: function (_, record) {
					return React.createElement(InputNumber, {
						style: { width: '100%' },
						min: 0,
						step: 0.01,
						precision: 2,
						placeholder: '金额',
						value: record.customerAmount === '' ? null : parseFloat(record.customerAmount),
						onChange: function (v) { updateBatchRow(record._rowId, { customerAmount: v == null ? '' : String(v) }); }
					});
				}
			},
			{
				title: React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), '公里数(km)'),
				width: 110,
				render: function (_, record) {
					return React.createElement(InputNumber, {
						style: { width: '100%' },
						min: 0,
						step: 1,
						precision: 0,
						placeholder: 'km',
						value: record.mileageKm === '' ? null : parseFloat(record.mileageKm),
						onChange: function (v) { updateBatchRow(record._rowId, { mileageKm: v == null ? '' : String(v) }); }
					});
				}
			},
			{
				title: React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), '承担方式'),
				width: 130,
				render: function (_, record) {
					return React.createElement(Select, {
						placeholder: '承担方式',
						value: record.settlementStatus,
						options: HR_SETTLEMENT_STATUS_OPTIONS,
						style: { width: '100%' },
						onChange: function (v) { updateBatchRow(record._rowId, { settlementStatus: v }); },
						dropdownStyle: { borderRadius: 8 }
					});
				}
			},
			{
				title: React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), '充装员'),
				width: 120,
				render: function (_, record) {
					return React.createElement(Select, {
						showSearch: true,
						placeholder: '充装员',
						optionFilterProp: 'label',
						value: record.fillerName,
						options: fillerOptions,
						style: { width: '100%' },
						onChange: function (v) { updateBatchRow(record._rowId, { fillerName: v }); },
						dropdownStyle: { borderRadius: 8 }
					});
				}
			},
			{
				title: '操作',
				width: 72,
				fixed: 'right',
				render: function (_, record) {
					return React.createElement(Button, {
						type: 'link',
						size: 'small',
						className: 'lc-action-btn-danger',
						disabled: batchRows.length <= 1,
						onClick: function () { removeBatchRow(record._rowId); }
					}, '删除');
				}
			}
		];
	}, [batchRows.length, dayjs, DatePicker, Input, InputNumber, Select, fillerOptions, updateBatchRow, removeBatchRow]);

	var emptyNode = React.createElement('div', { style: { padding: '40px 0', textAlign: 'center' } },
		HR_ICONS.empty,
		React.createElement('div', { style: { color: '#94a3b8', marginTop: 12 } }, '暂无符合检索条件的加氢记录')
	);

	var renderAppointmentPanel = function () {
		var records = sortedAppointments;
		var summary = appointmentSummary;
		var stats = [
			{ key: 'pending', label: '待处理预约', value: String(summary.pending || 0), mod: 'count', valueMod: 'count' },
			{ key: 'accepted', label: '已接受', value: String(summary.accepted || 0), mod: 'kg', valueMod: 'kg' },
			{ key: 'rejected', label: '已拒绝', value: String(summary.rejected || 0), mod: 'cost', valueMod: 'cost' },
			{ key: 'totalKg', label: '预约加氢量合计(kg)', value: hrFormatKg(summary.totalKg), mod: 'customer', valueMod: 'customer' }
		];
		var tablePagination = records.length > 8
			? {
				current: appointmentPage,
				pageSize: appointmentPageSize,
				total: records.length,
				showSizeChanger: true,
				pageSizeOptions: ['5', '10', '20', '50'],
				size: 'small',
				showTotal: function (t) { return '共 ' + t + ' 条'; },
				onChange: function (p, ps) { setAppointmentPage(p); setAppointmentPageSize(ps); }
			}
			: false;
		return React.createElement('div', { className: 'h2-refuel-drill-panel' },
			React.createElement('div', { className: 'h2-refuel-drill-station-card' },
				React.createElement('div', { className: 'h2-refuel-drill-station-card__name' }, '预约加氢管理'),
				React.createElement('div', { className: 'h2-refuel-drill-station-card__meta' },
					'司机预约记录 · 待处理 ' + (summary.pending || 0) + ' 条 · 共 ' + records.length + ' 条'
				)
			),
			React.createElement('div', { className: 'h2-refuel-drill-stats', role: 'group', 'aria-label': '预约统计' },
				stats.map(function (item) {
					return React.createElement('div', {
						key: item.key,
						className: 'h2-refuel-drill-stat h2-refuel-drill-stat--' + item.mod,
						role: 'article',
						'aria-label': item.label + ' ' + item.value
					},
						React.createElement('div', { className: 'h2-refuel-drill-stat__label' }, item.label),
						React.createElement('div', {
							className: 'h2-refuel-drill-stat__value h2-refuel-drill-stat__value--' + item.valueMod
						}, item.value)
					);
				})
			),
			React.createElement('div', { className: 'h2-refuel-drill-table-wrap' },
				React.createElement('div', { className: 'h2-refuel-drill-table-head' },
					React.createElement('div', { className: 'h2-refuel-drill-table-head__left' },
						React.createElement('span', { className: 'h2-refuel-drill-table-head__title' }, '预约明细'),
						React.createElement('span', { className: 'h2-refuel-drill-table-head__count' }, '共 ' + records.length + ' 条')
					),
					summary.pending
						? React.createElement(Tag, { color: 'processing', style: { margin: 0, borderRadius: 6, fontWeight: 600 } }, summary.pending + ' 条待处理')
						: React.createElement(Tag, { style: { margin: 0, borderRadius: 6, color: '#64748b' } }, '暂无待处理')
				),
				React.createElement(Table, {
					className: 'h2-refuel-record-table',
					size: 'small',
					bordered: false,
					rowKey: 'id',
					columns: appointmentColumns,
					dataSource: records,
					pagination: tablePagination,
					locale: { emptyText: '暂无预约记录' },
					scroll: records.length > 8 ? { x: 'max-content', y: 320 } : { x: 'max-content' }
				})
			)
		);
	};

	var batchCreateViewNode = subView === 'form' && formMode === 'create' ? React.createElement('div', { className: 'h2-create-shell' },
		React.createElement('div', { className: 'h2-create-topbar' },
			React.createElement(Button, {
				className: 'h2-create-back-btn',
				type: 'default',
				icon: HR_ICONS.back,
				onClick: handleFormPageBack,
				disabled: formSubmitting,
				style: { borderRadius: 8 }
			}, '返回'),
			React.createElement('h1', { className: 'h2-create-topbar-title' }, formPageTitle)
		),
		React.createElement(Card, {
			className: 'h2-create-card',
			id: 'hr-batch-create-card',
			title: React.createElement('span', { className: 'h2-card-title-bar' },
				React.createElement('span', { className: 'h2-card-title-icon' }, HR_ICONS.fuel),
				React.createElement('span', { className: 'h2-card-title-text' }, '加氢记录明细')
			),
			bordered: false
		},
			React.createElement('div', { className: 'hr-batch-create-toolbar' },
				React.createElement('span', { className: 'hr-batch-create-toolbar__count' },
					'共 ' + batchRows.length + ' 行 · 已填写 ' + batchFilledCount + ' 条'
				),
				React.createElement(Button, {
					type: 'dashed',
					style: { borderRadius: 8, fontWeight: 600, borderColor: '#10b981', color: '#059669' },
					onClick: addBatchRow,
					'aria-label': '添加一行加氢记录'
				}, '+ 添加一行')
			),
			React.createElement('div', { className: 'hr-batch-create-table-wrap' },
				React.createElement(Table, {
					className: 'hr-batch-create-table',
					size: 'small',
					bordered: false,
					rowKey: '_rowId',
					columns: batchCreateColumns,
					dataSource: batchRows,
					pagination: false,
					locale: { emptyText: '请点击「添加一行」开始录入' },
					scroll: { x: 1240 }
				})
			)
		),
		React.createElement('footer', { className: 'h2-create-footer' },
			React.createElement('div', { className: 'h2-create-footer-inner' },
				React.createElement('div', { className: 'h2-create-footer-hint' },
					'将提交 ' + batchFilledCount + ' 条有效记录'
				),
				React.createElement('div', { className: 'h2-create-footer-actions' },
					React.createElement(Button, {
						onClick: handleFormPageBack,
						disabled: formSubmitting,
						style: { borderRadius: 8 },
						'aria-label': '取消并返回列表'
					}, '取消'),
					React.createElement(Button, {
						type: 'primary',
						style: HR_PRIMARY_BTN_STYLE,
						onClick: handleBatchSubmit,
						loading: formSubmitting,
						disabled: batchFilledCount === 0,
						'aria-label': '批量提交加氢记录'
					}, '批量提交')
				)
			)
		)
	) : null;

	var editFormViewNode = subView === 'form' && formMode === 'edit' ? React.createElement('div', { className: 'h2-create-shell' },
		React.createElement('div', { className: 'h2-create-topbar' },
			React.createElement(Button, {
				className: 'h2-create-back-btn',
				type: 'default',
				icon: HR_ICONS.back,
				onClick: handleFormPageBack,
				disabled: formSubmitting,
				style: { borderRadius: 8 }
			}, '返回'),
			React.createElement('h1', { className: 'h2-create-topbar-title' }, formPageTitle)
		),
		React.createElement(Form, {
			layout: 'vertical',
			requiredMark: false,
			className: 'h2-create-form h2-create-form--list h2-create-form--grid'
		},
			React.createElement(Card, {
				className: 'h2-create-card',
				id: 'hr-create-basic-card',
				title: hrCardTitleWithStep(1, '基本信息'),
				bordered: false
			},
				gridBlock(
					formRow(
						col12(formItem('加氢时间', true, dayjs && DatePicker
							? React.createElement(DatePicker, {
								className: inputCls,
								showTime: true,
								style: { width: '100%' },
								format: 'YYYY-MM-DD HH:mm:ss',
								placeholder: '请选择加氢时间',
								value: formTimeValue,
								onChange: function (v) {
									setForm(function (f) {
										return Object.assign({}, f, {
											hydrogenTime: v && v.isValid && v.isValid() ? v.format('YYYY-MM-DD HH:mm:ss') : ''
										});
									});
								}
							})
							: React.createElement(Input, {
								className: inputCls,
								placeholder: 'YYYY-MM-DD HH:mm:ss',
								value: form.hydrogenTime,
								onChange: function (e) { setForm(function (f) { return Object.assign({}, f, { hydrogenTime: e.target.value }); }); }
							})
						)),
						col12(formItem('车牌号', true, React.createElement(Input, {
							className: inputCls,
							placeholder: '请输入车牌号',
							value: form.plateNo || '',
							maxLength: 16,
							onChange: function (e) { setForm(function (f) { return Object.assign({}, f, { plateNo: e.target.value }); }); }
						})))
					)
				)
			),
			React.createElement(Card, {
				className: 'h2-create-card',
				id: 'hr-create-data-card',
				title: hrCardTitleWithStep(2, '加氢数据'),
				bordered: false
			},
				gridBlock(
					formRow(
						col8(formItem('加氢量（kg）', true, React.createElement(InputNumber, {
							className: inputCls,
							style: { width: '100%' },
							min: 0.01,
							step: 0.1,
							precision: 2,
							placeholder: '请输入加氢量',
							value: form.hydrogenKg === '' ? null : parseFloat(form.hydrogenKg),
							onChange: function (v) { setForm(function (f) { return Object.assign({}, f, { hydrogenKg: v == null ? '' : String(v) }); }); }
						}))),
						col8(formItem('加氢金额（元）', true, React.createElement(InputNumber, {
							className: inputCls,
							style: { width: '100%' },
							min: 0,
							step: 0.01,
							precision: 2,
							placeholder: '请输入加氢金额',
							value: form.customerAmount === '' ? null : parseFloat(form.customerAmount),
							onChange: function (v) { setForm(function (f) { return Object.assign({}, f, { customerAmount: v == null ? '' : String(v) }); }); }
						}))),
						col8(formItem('公里数（km）', true, React.createElement(InputNumber, {
							className: inputCls,
							style: { width: '100%' },
							min: 0,
							step: 1,
							precision: 0,
							placeholder: '请输入公里数',
							value: form.mileageKm === '' ? null : parseFloat(form.mileageKm),
							onChange: function (v) { setForm(function (f) { return Object.assign({}, f, { mileageKm: v == null ? '' : String(v) }); }); }
						})))
					)
				)
			),
			React.createElement(Card, {
				className: 'h2-create-card',
				id: 'hr-create-operator-card',
				title: hrCardTitleWithStep(3, '操作人员'),
				bordered: false
			},
				gridBlock(
					formRow(
						col12(formItem('充装员', true, React.createElement(Select, {
							className: inputCls,
							showSearch: true,
							placeholder: '请选择充装员',
							optionFilterProp: 'label',
							value: form.fillerName,
							options: fillerOptions,
							onChange: function (v) { setForm(function (f) { return Object.assign({}, f, { fillerName: v }); }); },
							dropdownStyle: { borderRadius: 8 }
						}))),
						col12(formItem('承担方式', true, React.createElement(Select, {
							className: inputCls,
							placeholder: '请选择承担方式',
							value: form.settlementStatus,
							options: HR_SETTLEMENT_STATUS_OPTIONS,
							onChange: function (v) { setForm(function (f) { return Object.assign({}, f, { settlementStatus: v }); }); },
							dropdownStyle: { borderRadius: 8 }
						})))
					)
				)
			)
		),
		React.createElement('footer', { className: 'h2-create-footer' },
			React.createElement('div', { className: 'h2-create-footer-inner' },
				React.createElement('div', { className: 'h2-create-footer-actions' },
					React.createElement(Button, {
						onClick: handleFormPageBack,
						disabled: formSubmitting,
						style: { borderRadius: 8 },
						'aria-label': '取消并返回列表'
					}, '取消'),
					React.createElement(Button, {
						type: 'primary',
						style: HR_PRIMARY_BTN_STYLE,
						onClick: handleFormSubmit,
						loading: formSubmitting,
						'aria-label': '保存编辑加氢记录'
					}, '保存修改')
				)
			)
		)
	) : null;

	return React.createElement('div', {
		className: 'h2-station-page lc-edit-page' + (subView === 'form' ? ' h2-station-page--create' : '')
	},
		React.createElement('style', null, HR_PAGE_STYLE),
		batchCreateViewNode,
		editFormViewNode,
		subView === 'list' ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' } },
			React.createElement('div', { style: { marginBottom: 16 } },
				React.createElement(Breadcrumb, { items: [{ title: '加氢站管理' }, { title: '加氢记录' }] })
			),

			React.createElement(Card, { className: 'lc-filter-card', title: '筛选条件', bordered: false },
				React.createElement('div', { className: 'lc-filter-grid' },
					renderFilterField('加氢时间', React.createElement(RangePicker, {
						showTime: true,
						style: { width: '100%' },
						placeholder: ['开始时间', '结束时间'],
						value: draftFilters.timeRange && draftFilters.timeRange.length ? draftFilters.timeRange : null,
						onChange: function (v) {
							setDraftFilters(function (p) { return Object.assign({}, p, { timeRange: v || [] }); });
						}
					})),
					renderFilterField('车牌号', React.createElement(Select, {
						placeholder: '请选择车牌号',
						allowClear: true,
						showSearch: true,
						optionFilterProp: 'label',
						value: draftFilters.plateNo,
						options: plateOptions,
						onChange: function (v) { setDraftFilters(function (p) { return Object.assign({}, p, { plateNo: v }); }); },
						style: { width: '100%' },
						dropdownStyle: { borderRadius: 8 }
					})),
					renderFilterField('充装员', React.createElement(Select, {
						placeholder: '请选择充装员',
						allowClear: true,
						showSearch: true,
						optionFilterProp: 'label',
						value: draftFilters.fillerName,
						options: fillerOptions,
						onChange: function (v) { setDraftFilters(function (p) { return Object.assign({}, p, { fillerName: v }); }); },
						style: { width: '100%' },
						dropdownStyle: { borderRadius: 8 }
					}))
				),
				React.createElement('div', { className: 'lc-filter-actions' },
					React.createElement(Button, { onClick: handleFilterReset, style: { borderRadius: 8 } }, '重置'),
					React.createElement(Button, { type: 'primary', onClick: handleFilterQuery, style: HR_PRIMARY_BTN_STYLE }, '查询')
				)
			),

			React.createElement('div', { className: 'hr-daily-stats-section' },
				React.createElement('div', { className: 'hr-daily-stats-head' },
					React.createElement('span', { className: 'hr-daily-stats-head__title' }, '每日统计'),
					React.createElement('span', { className: 'hr-daily-stats-head__meta' },
						(function () {
							var rangeStart = dailyStatsPageItems[0] ? dailyStatsPageItems[0].date : '—';
							var rangeEnd = dailyStatsPageItems.length ? dailyStatsPageItems[dailyStatsPageItems.length - 1].date : '—';
							return '近28天（含今天）· 第 ' + (dailyStatsPage + 1) + '/' + (HR_DAILY_STATS_MAX_PAGE + 1) + ' 组 · '
								+ rangeStart + ' 至 ' + rangeEnd + ' · 筛选记录 ' + filteredList.length + ' 笔';
						})()
					)
				),
				React.createElement('div', { className: 'hr-daily-stats-carousel' },
					React.createElement(Button, {
						type: 'default',
						className: 'hr-daily-stats-nav-btn',
						disabled: dailyStatsPage >= HR_DAILY_STATS_MAX_PAGE,
						onClick: function () { setDailyStatsPage(function (p) { return Math.min(HR_DAILY_STATS_MAX_PAGE, p + 1); }); },
						'aria-label': '向左翻页，查看更早的7天'
					}, '‹'),
					React.createElement('div', { className: 'hr-daily-stats-track', role: 'group', 'aria-label': '每日加氢统计' },
						dailyStatsPageItems.map(function (item) {
							return React.createElement('div', {
								key: item.date,
								className: 'hr-daily-stat-card' + (item.isToday ? ' hr-daily-stat-card--today' : ''),
								role: 'article',
								'aria-label': item.date + ' 加氢 ' + item.count + ' 次，加氢量 ' + hrFormatKg(item.totalKg) + ' kg'
							},
								React.createElement('div', { className: 'hr-daily-stat-card__date' },
									React.createElement('span', null, item.dateLabel),
									item.isToday ? React.createElement('span', { className: 'hr-daily-stat-card__today-tag' }, '今天') : null
								),
								React.createElement('div', { className: 'hr-daily-stat-card__row' },
									React.createElement('span', { className: 'hr-daily-stat-card__label' }, '加氢次数'),
									React.createElement('span', { className: 'hr-daily-stat-card__value hr-daily-stat-card__value--count' }, String(item.count))
								),
								React.createElement('div', { className: 'hr-daily-stat-card__row' },
									React.createElement('span', { className: 'hr-daily-stat-card__label' }, '加氢量(kg)'),
									React.createElement('span', { className: 'hr-daily-stat-card__value hr-daily-stat-card__value--kg' }, hrFormatKg(item.totalKg))
								)
							);
						})
					),
					React.createElement(Button, {
						type: 'default',
						className: 'hr-daily-stats-nav-btn',
						disabled: dailyStatsPage <= 0,
						onClick: function () { setDailyStatsPage(function (p) { return Math.max(0, p - 1); }); },
						'aria-label': '向右翻页，查看更近的7天'
					}, '›')
				)
			),

			React.createElement('div', { className: 'lc-table-section' },
				React.createElement('div', { className: 'lc-table-toolbar' },
					React.createElement('div', { className: 'lc-table-toolbar-left' },
						React.createElement(Badge, { count: pendingAppointmentCount, offset: [8, 0], size: 'small' },
							React.createElement(Button, {
								type: 'default',
								icon: HR_ICONS.calendar,
								style: { borderRadius: 8, fontWeight: 600, borderColor: '#3b82f6', color: '#2563eb' },
								onClick: function () { setAppointmentModalOpen(true); },
								'aria-label': '预约加氢'
							}, '预约加氢')
						)
					),
					React.createElement('div', { className: 'lc-table-toolbar-actions' },
						React.createElement(Button, {
							type: 'default',
							style: { borderRadius: 8, fontWeight: 600, borderColor: '#10b981', color: '#059669' },
							onClick: handleExport,
							'aria-label': '导出加氢记录'
						}, '导出'),
						React.createElement(Button, {
							type: 'primary',
							style: HR_PRIMARY_BTN_STYLE,
							onClick: openCreate,
							'aria-label': '新增加氢记录'
						}, '新增')
					)
				),
				React.createElement('div', { className: 'lc-table-card' },
					React.createElement(Table, {
						className: 'lc-list-table',
						rowKey: 'id',
						columns: columns,
						dataSource: filteredList,
						size: 'middle',
						scroll: { x: 1100 },
						pagination: {
							current: page,
							pageSize: pageSize,
							total: filteredList.length,
							showSizeChanger: true,
							pageSizeOptions: ['5', '10', '20', '50'],
							showTotal: function (t) { return '共 ' + t + ' 条'; },
							onChange: function (p, ps) { setPage(p); setPageSize(ps); }
						},
						locale: { emptyText: emptyNode }
					})
				)
			)
		) : null,

		React.createElement(Modal, {
			className: 'h2-refuel-drill-modal',
			title: '预约加氢',
			open: appointmentModalOpen,
			onCancel: function () { setAppointmentModalOpen(false); },
			footer: React.createElement(Button, {
				type: 'primary',
				onClick: function () { setAppointmentModalOpen(false); },
				style: HR_PRIMARY_BTN_STYLE
			}, '知道了'),
			width: 980,
			centered: true,
			destroyOnClose: true,
			styles: { body: { maxHeight: '78vh', overflow: 'auto' } }
		},
			renderAppointmentPanel()
		),

		React.createElement(Modal, {
			title: '确认删除',
			open: deleteModal.open,
			centered: true,
			onCancel: function () { setDeleteModal({ open: false, record: null }); },
			onOk: function () {
				if (deleteModal.record) {
					setListData(function (prev) {
						return prev.filter(function (r) { return r.id !== deleteModal.record.id; });
					});
					message.success('已删除');
				}
				setDeleteModal({ open: false, record: null });
			},
			okButtonProps: { danger: true },
			okText: '删除',
			cancelText: '取消'
		}, '确定删除该条加氢记录吗？车牌号「' + ((deleteModal.record && deleteModal.record.plateNo) || '') + '」，此操作不可撤销。'),

		React.createElement(Modal, {
			title: '拒绝预约',
			open: rejectModal.open,
			centered: true,
			width: 480,
			onCancel: closeRejectModal,
			onOk: handleConfirmRejectAppointment,
			okText: '确认拒绝',
			cancelText: '取消',
			okButtonProps: { danger: true },
			destroyOnClose: true
		},
			React.createElement('div', { style: { marginBottom: 12, fontSize: 13, color: '#475569', lineHeight: 1.6 } },
				'车牌号：',
				React.createElement('strong', { style: { color: '#0f172a' } }, (rejectModal.record && rejectModal.record.plateNo) || '—'),
				' · 预约时间：',
				React.createElement('span', { style: { fontVariantNumeric: 'tabular-nums' } }, (rejectModal.record && rejectModal.record.appointmentTime) || '—')
			),
			React.createElement(Form, { layout: 'vertical', requiredMark: false },
				React.createElement(Form.Item, {
					label: React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), '拒绝原因')
				},
					React.createElement(Input.TextArea, {
						placeholder: '请填写拒绝原因，将通知预约司机',
						value: rejectModal.reason,
						rows: 4,
						maxLength: 200,
						showCount: true,
						style: { borderRadius: 8 },
						onChange: function (e) {
							setRejectModal(function (m) { return Object.assign({}, m, { reason: e.target.value }); });
						}
					})
				)
			)
		)
	);
};
