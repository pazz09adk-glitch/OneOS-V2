// 【重要】必须使用 const Component 作为组件变量名
// 台账数据 - 租赁业务运营明细台账（客服维护各自台账；保存→已保存；勾选提交收款审批→账单预览→财务审批闭环）
// 字段对齐《租赁业务运营明细台账模版最终.xlsx》；UI/布局对齐 web端/加氢站管理/站点信息.jsx

var LEASE_PAGE_STYLE = [
	'.lease-ledger-page { padding: 24px 24px 80px; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(165deg, #f1f5f9 0%, #f8fafc 50%, #f1f5f9 100%); overflow: hidden; box-sizing: border-box; }',
	'.lease-ledger-page .lc-filter-card.ant-card { border-radius: 16px !important; border: 1px solid #e2e8f0 !important; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03) !important; margin-bottom: 16px; }',
	'.lease-ledger-page .lc-filter-card > .ant-card-head { border-bottom: 1px solid #f1f5f9 !important; min-height: auto; padding: 12px 20px !important; }',
	'.lease-ledger-page .lc-filter-card > .ant-card-head .ant-card-head-title { font-size: 15px !important; font-weight: 700 !important; color: #0f172a !important; padding: 0 !important; }',
	'.lease-ledger-page .lc-filter-card > .ant-card-body { padding: 16px 20px 20px !important; }',
	'.lease-ledger-page .lc-filter-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px 24px; align-items: center; }',
	'@media (max-width: 1280px) { .lease-ledger-page .lc-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }',
	'@media (max-width: 640px) { .lease-ledger-page .lc-filter-grid { grid-template-columns: 1fr; } }',
	'.lease-ledger-page .lc-filter-field { display: flex; align-items: center; gap: 12px; min-width: 0; min-height: 32px; }',
	'.lease-ledger-page .lc-filter-field-label { flex: 0 0 88px; text-align: right; font-size: 13px; font-weight: 500; color: #475569; line-height: 32px; white-space: nowrap; }',
	'.lease-ledger-page .lc-filter-field-control { flex: 1; min-width: 0; }',
	'.lease-ledger-page .lc-filter-field-control .ant-input, .lease-ledger-page .lc-filter-field-control .ant-input-affix-wrapper, .lease-ledger-page .lc-filter-field-control .ant-select .ant-select-selector, .lease-ledger-page .lc-filter-field-control .ant-input-number, .lease-ledger-page .lc-filter-field-control .ant-picker { width: 100%; height: 32px !important; min-height: 32px !important; border-radius: 8px !important; box-sizing: border-box; }',
	'.lease-ledger-page .lc-filter-field-control .ant-input-number .ant-input-number-input { height: 30px; }',
	'.lease-ledger-page .lc-filter-field-control .ant-picker-range { height: 32px !important; }',
	'.lease-ledger-page .lc-filter-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f5f9; }',
	'.lease-ledger-page .lc-alert-stats-row { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }',
	'@media (max-width: 1400px) { .lease-ledger-page .lc-alert-stats-row { grid-template-columns: repeat(3, minmax(0, 1fr)); } }',
	'@media (max-width: 640px) { .lease-ledger-page .lc-alert-stats-row { grid-template-columns: 1fr; } }',
	'.lease-ledger-page .lc-alert-card { display: flex; align-items: center; gap: 14px; padding: 16px 30px 16px 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; position: relative; overflow: hidden; min-width: 0; min-height: 72px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.lease-ledger-page .lc-alert-card-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }',
	'.lease-ledger-page .lc-alert-card-icon { flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(145deg, #0d7a63 0%, #065f4a 100%); color: #fff; box-shadow: 0 4px 12px rgba(6, 95, 74, 0.28); }',
	'.lease-ledger-page .lc-alert-card-val { font-size: 24px; font-weight: 800; line-height: 1.1; color: #0f172a; font-variant-numeric: tabular-nums; }',
	'.lease-ledger-page .lc-alert-card-title { font-size: 13px; font-weight: 500; color: #64748b; line-height: 1.3; }',
	'.lease-ledger-page .lc-alert-card-tip-anchor { position: absolute; top: 8px; right: 8px; z-index: 2; line-height: 0; }',
	'.lease-ledger-page .lc-alert-card-tip { width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #94a3b8; background: rgba(255,255,255,0.92); border: 1px solid #e2e8f0; cursor: help; line-height: 0; }',
	'.lease-ledger-page .lc-stat-val--profit { color: #047857 !important; }',
	'.lease-ledger-page .lc-stat-val--loss { color: #b91c1c !important; }',
	'.lease-ledger-page .lc-table-section { margin-bottom: 0; flex: 1; display: flex; flex-direction: column; min-height: 0; }',
	'.lease-ledger-page .lc-table-toolbar { display: flex; justify-content: sp                                                                 1·ace-between; align-items: center; flex-wrap: wrap; gap: 10px 16px; margin-bottom: 8px; min-height: 32px; }',
	'.lease-ledger-page .lc-table-legend-outer { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; padding: 6px 4px; font-size: 12px; color: #64748b; }',
	'.lease-ledger-page .lc-table-legend-label { font-weight: 600; color: #64748b; }',
	'.lease-ledger-page .lc-table-legend-item { display: inline-flex; align-items: center; gap: 6px; }',
	'.lease-ledger-page .lc-table-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }',
	'.lease-ledger-page .lc-table-toolbar-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-left: auto; }',
	'.lease-ledger-page .lc-table-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03); flex: 1; min-height: 0; padding: 12px 16px 16px; }',
	'.lease-ledger-page .lc-action-btn { font-weight: 600 !important; color: #10b981 !important; padding: 0 !important; }',
	'.lease-ledger-page .lc-action-btn-danger { color: #ef4444 !important; }',
	'.lease-ledger-page .lease-cell-readonly { color: #64748b; background: #f8fafc; padding: 4px 6px; text-align: center; border-radius: 4px; }',
	'.lease-ledger-page .lease-cell-calc { font-weight: 600; color: #0f766e; }',
	'.lease-ledger-page .lease-add-row-btn { margin-top: 12px; border-radius: 8px !important; border-style: dashed !important; border-color: #cbd5e1 !important; color: #475569 !important; font-weight: 600 !important; }',
	'.lease-ledger-page .lease-add-row-btn:hover { border-color: #10b981 !important; color: #059669 !important; }',
	'.lease-ledger-page .h2-import-template-bar { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 14px 16px; margin-bottom: 14px; border-radius: 12px; background: linear-gradient(135deg, #ecfdf5 0%, #f8fafc 100%); border: 1px solid #bbf7d0; }',
	'.lease-ledger-page .h2-import-template-bar-text { font-size: 13px; color: #475569; line-height: 1.55; flex: 1; min-width: 0; }',
	'.lease-ledger-page .h2-req-doc-panel h2:first-child { margin-top: 0; }',
	'.lc-bill-preview-modal .ant-modal-content { border-radius: 16px !important; overflow: hidden; box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18) !important; }',
	'.lc-bill-preview-modal .ant-modal-header { padding: 18px 24px 14px !important; border-bottom: 1px solid #f1f5f9 !important; margin-bottom: 0 !important; }',
	'.lc-bill-preview-modal .ant-modal-title { font-size: 17px !important; font-weight: 700 !important; color: #0f172a !important; }',
	'.lc-bill-preview-modal .ant-modal-body { padding: 16px 24px 20px !important; background: #f8fafc; }',
	'.lc-bill-preview-modal .ant-modal-footer { padding: 12px 24px 18px !important; border-top: 1px solid #f1f5f9 !important; background: #fff; }',
	'.lc-bill-preview-panel { display: flex; flex-direction: column; gap: 14px; }',
	'.lc-bill-preview-hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 16px; background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #f8fafc 100%); border: 1px solid #bbf7d0; border-radius: 12px; }',
	'.lc-bill-preview-hero__main { flex: 1; min-width: 0; }',
	'.lc-bill-preview-hero__customer { font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.35; margin-bottom: 4px; }',
	'.lc-bill-preview-hero__project { font-size: 13px; color: #475569; line-height: 1.45; }',
	'.lc-bill-preview-hero__meta { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; white-space: nowrap; text-align: right; }',
	'.lc-bill-preview-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }',
	'@media (max-width: 720px) { .lc-bill-preview-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }',
	'.lc-bill-preview-stat { display: flex; flex-direction: column; justify-content: center; min-height: 72px; padding: 12px 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); min-width: 0; box-sizing: border-box; }',
	'.lc-bill-preview-stat--amount { border-left: 4px solid #10b981; background: linear-gradient(180deg, #fff 0%, #f0fdf4 100%); }',
	'.lc-bill-preview-stat--invoice { border-left: 4px solid #8b5cf6; }',
	'.lc-bill-preview-stat--arrival { border-left: 4px solid #3b82f6; }',
	'.lc-bill-preview-stat--company { border-left: 4px solid #f59e0b; grid-column: span 2; }',
	'.lc-bill-preview-stat__label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; line-height: 1.2; }',
	'.lc-bill-preview-stat__value { font-size: 15px; font-weight: 700; line-height: 1.35; color: #0f172a; word-break: break-word; }',
	'.lc-bill-preview-stat__value--money { font-size: 18px; font-weight: 800; color: #059669; font-variant-numeric: tabular-nums; }',
	'.lc-bill-preview-attach-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }',
	'@media (max-width: 640px) { .lc-bill-preview-attach-row { grid-template-columns: 1fr; } .lc-bill-preview-stat--company { grid-column: span 1; } }',
	'.lc-bill-preview-attach { padding: 12px 14px; border-radius: 12px; border: 1px dashed #e2e8f0; background: #fff; min-height: 56px; box-sizing: border-box; }',
	'.lc-bill-preview-attach__label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; }',
	'.lc-bill-preview-attach__value { font-size: 13px; color: #334155; }',
	'.lc-bill-preview-attach-link { color: #059669; cursor: pointer; font-size: 12px; font-weight: 600; margin-right: 10px; text-decoration: none; }',
	'.lc-bill-preview-attach-link:hover { color: #047857; text-decoration: underline; }',
	'.lc-bill-preview-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05); }',
	'.lc-bill-preview-table-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; background: #fafafa; }',
	'.lc-bill-preview-table-head__title { font-size: 14px; font-weight: 700; color: #0f172a; }',
	'.lc-bill-preview-table-head__count { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; }',
	'.lc-bill-preview-table-wrap .ant-table { border-radius: 0 !important; }',
	'.lc-bill-preview-table-wrap .ant-table-thead>tr>th { background: #f8fafc !important; font-size: 12px !important; font-weight: 600 !important; color: #475569 !important; }',
	'.lc-bill-preview-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }'
].join('');

/** 宽表内联编辑样式（对齐车辆维修明细 maint-ledger-table，避免破坏 scroll 表头） */
var LEASE_LEDGER_TABLE_STYLE =
	'.lease-ledger-table-wrap{border-radius:12px;overflow:hidden;box-shadow:0 4px 24px -6px rgba(15,23,42,0.05),0 0 0 1px rgba(226,232,240,0.9)}' +
	'.lease-ledger-table .ant-table-thead>tr>th,.lease-ledger-table .ant-table-thead .ant-table-cell{white-space:nowrap;color:#475569!important;font-weight:700!important;font-size:13px!important;' +
	'background:#f8fafc!important;border-bottom:1px solid #e2e8f0!important;border-inline-end:1px solid #e2e8f0!important;padding:0 8px!important;height:40px!important;text-align:center!important;vertical-align:middle!important}' +
	'.lease-ledger-table .ant-table-header .ant-table-thead>tr>th,.lease-ledger-table .ant-table-header .ant-table-thead .ant-table-cell{height:40px!important;line-height:1.35!important}' +
	'.lease-ledger-table .ant-table-tbody>tr:not(.ant-table-measure-row){height:36px!important}' +
	'.lease-ledger-table .ant-table-tbody>tr:not(.ant-table-measure-row)>td{height:36px!important;max-height:36px!important;padding:3px 6px!important;vertical-align:middle!important;font-size:12px!important;line-height:1.4!important;box-sizing:border-box!important;overflow:hidden}' +
	'.lease-ledger-table .ant-table-tbody>tr.lease-row-tier-0>td{background:#ecfdf5!important}' +
	'.lease-ledger-table .ant-table-tbody>tr.lease-row-tier-1>td{background:#f5f3ff!important}' +
	'.lease-ledger-table .ant-table-tbody>tr.lease-row-tier-2>td{background:#ede9fe!important}' +
	'.lease-ledger-table .ant-table-tbody>tr.lease-row-tier-3>td{background:#fff!important}' +
	'.lease-ledger-table .ant-table-tbody>tr.lease-row-tier-4>td{background:#f1f5f9!important}' +
	'.lease-ledger-table .ant-table-tbody>tr:not(.ant-table-measure-row):hover>td{background:#f0f9ff!important}' +
	'.lease-ledger-table .ant-table-tbody>tr.ant-table-measure-row,.lease-ledger-table .ant-table-tbody>tr.ant-table-measure-row>td{height:0!important;max-height:0!important;padding:0!important;border:none!important;line-height:0!important;font-size:0!important;overflow:hidden!important;visibility:hidden!important}' +
	'.lease-ledger-table .ant-table-cell-fix-left,.lease-ledger-table .ant-table-cell-fix-right{z-index:2!important}' +
	'.lease-ledger-table .ant-table-container .ant-table-header{position:relative;z-index:3;background:#f8fafc;min-height:40px!important}' +
	'.lease-ledger-table .ant-table-container .ant-table-header .ant-table-thead>tr>th,.lease-ledger-table .ant-table-container .ant-table-header .ant-table-thead .ant-table-cell{opacity:1!important;visibility:visible!important}' +
	'.lease-ledger-table .ant-table-header>table,.lease-ledger-table .ant-table-body>table,.lease-ledger-table .ant-table-content>table{min-width:max-content!important}' +
	'.lease-ledger-table .ant-table-cell{white-space:nowrap}' +
	'.lease-ledger-table .lease-col-header-wrap{display:inline-flex;align-items:center;justify-content:center;gap:3px;max-width:100%;vertical-align:middle}' +
	'.lease-ledger-table .lease-col-header-label{line-height:1.35}' +
	'.lease-ledger-table .lease-col-header-tip{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#94a3b8;cursor:help;line-height:0}' +
	'.lease-ledger-table .lease-cell-plain{display:block;height:30px;line-height:30px;font-size:12px!important;color:#334155;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;box-sizing:border-box}' +
	'.lease-ledger-table .lease-cell-readonly{font-size:12px!important;line-height:20px!important;min-height:28px!important;max-height:28px!important;padding:3px 6px!important;box-sizing:border-box!important;display:flex;align-items:center;justify-content:center}' +
	'.lease-ledger-table .lease-cell-readonly.lease-cell-calc{justify-content:flex-end}' +
	'.lease-ledger-table .lease-cell-calc{font-size:12px!important}' +
	'.lease-ledger-table .ant-tag{margin:0!important;font-size:12px!important;line-height:20px!important;padding:0 6px!important}' +
	'.lease-ledger-table .lease-cell-input,.lease-ledger-table .lease-cell-input.ant-input-affix-wrapper,.lease-ledger-table .lease-cell-input-number,.lease-ledger-table .lease-cell-input-number .ant-input-number-input,.lease-ledger-table .lease-cell-date,.lease-ledger-table .lease-cell-date .ant-picker-input>input{font-size:12px!important}' +
	'.lease-ledger-table .lease-cell-input,.lease-ledger-table .lease-cell-input.ant-input-affix-wrapper{height:28px!important;min-height:28px!important;padding:2px 8px!important;line-height:24px!important;border-radius:6px!important}' +
	'.lease-ledger-table .lease-cell-input-number{width:100%!important;height:28px!important;min-height:28px!important;border-radius:6px!important}' +
	'.lease-ledger-table .lease-cell-input-number .ant-input-number-input{height:26px!important;padding:0 8px!important}' +
	'.lease-ledger-table .lease-cell-date{width:100%!important;height:28px!important;min-height:28px!important;border-radius:6px!important;padding:2px 8px 2px!important}' +
	'.lease-ledger-table .lease-cell-date .ant-picker-input>input{height:24px!important}' +
	'.lease-ledger-table .lease-cell-select.ant-select-single{height:28px!important;font-size:12px!important}' +
	'.lease-ledger-table .lease-cell-select.ant-select-single .ant-select-selector{height:28px!important;min-height:28px!important;padding:0 8px!important;font-size:12px!important;border-radius:6px!important}' +
	'.lease-ledger-table .lease-cell-select .ant-select-selection-item,.lease-ledger-table .lease-cell-select .ant-select-selection-placeholder{line-height:26px!important;font-size:12px!important}' +
	'.lease-ledger-table .lease-date-warn-cell{display:inline-flex;align-items:center;justify-content:center;gap:4px;width:100%;max-width:100%;height:30px;line-height:30px}' +
	'.lease-plate-select-dropdown{min-width:112px!important}' +
	'.lease-plate-select-dropdown .ant-select-item,.lease-plate-select-dropdown .ant-select-item-option-content{font-size:12px!important;white-space:nowrap!important}' +
	'.lease-cell-select-dropdown .ant-select-item,.lease-cell-select-dropdown .ant-select-item-option-content{font-size:12px!important;white-space:normal!important;word-break:break-all;line-height:1.4!important}';

var LEASE_PRIMARY_BTN_STYLE = {
	borderRadius: 8,
	fontWeight: 600,
	background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
	border: 'none'
};

var LEASE_OUTLINE_BTN_STYLE = {
	borderRadius: 8,
	fontWeight: 600,
	borderColor: '#10b981',
	color: '#059669'
};

var LEASE_REQ_BTN_STYLE = {
	borderRadius: 8,
	border: '1px solid #cbd5e1',
	color: '#475569',
	fontWeight: 600
};

var LEASE_KPI_CARDS = [
	{ key: 'count', type: 'total', title: '台账条数', desc: '当前筛选条件下的台账记录条数', format: 'count' },
	{ key: 'receivableTotal', type: 'normal', title: '应收总计', desc: '当前筛选范围内应收合计之和', format: 'money' },
	{ key: 'receivedAmount', type: 'normal', title: '实收总计', desc: '当前筛选范围内实收金额之和', format: 'money' },
	{ key: 'unreceived', type: 'warning', title: '未收总计', desc: '当前筛选范围内未收金额之和', format: 'money' },
	{ key: 'totalCost', type: 'unuploaded', title: '成本总计', desc: '当前筛选范围内总成本之和', format: 'money' },
	{ key: 'profitLoss', type: 'total', title: '盈亏总计', desc: '当前筛选范围内盈亏之和', format: 'money' }
];

function leaseSvgIcon(paths, size) {
	var s = size || 18;
	return React.createElement('svg', {
		width: s, height: s, viewBox: '0 0 24 24', fill: 'none',
		stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
		'aria-hidden': true
	}, paths.map(function (p, i) {
		if (p.tag === 'circle') return React.createElement('circle', { key: i, cx: p.cx, cy: p.cy, r: p.r });
		if (p.tag === 'line') return React.createElement('line', { key: i, x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2 });
		if (p.tag === 'rect') return React.createElement('rect', { key: i, x: p.x, y: p.y, width: p.width, height: p.height, rx: p.rx });
		return React.createElement('path', { key: i, d: p.d });
	}));
}

var LEASE_ICONS = {
	upload: leaseSvgIcon([{ d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }, { d: 'M17 8l-5-5-5 5' }, { tag: 'line', x1: 12, y1: 3, x2: 12, y2: 15 }], 14),
	plus: leaseSvgIcon([{ tag: 'line', x1: 12, y1: 5, x2: 12, y2: 19 }, { tag: 'line', x1: 5, y1: 12, x2: 19, y2: 12 }], 14),
	doc: leaseSvgIcon([{ d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }, { d: 'M14 2v6h6' }, { tag: 'line', x1: 16, y1: 13, x2: 8, y2: 13 }, { tag: 'line', x1: 16, y1: 17, x2: 8, y2: 17 }], 14),
	all: leaseSvgIcon([{ d: 'M4 20h16' }, { d: 'M7 20v-9h4v9' }, { d: 'M14 20V8l5-3v15' }], 22),
	edit: leaseSvgIcon([{ d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }, { d: 'M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' }], 22),
	saved: leaseSvgIcon([{ d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }, { d: 'M14 2v6h6' }, { tag: 'circle', cx: 17.5, cy: 17.5, r: 3.5 }, { d: 'M16 17.5l1 1 2-2' }], 22),
	lock: leaseSvgIcon([{ tag: 'rect', x: 3, y: 11, width: 18, height: 11, rx: 2 }, { d: 'M7 11V7a5 5 0 0 1 10 0v4' }], 22),
	warn: leaseSvgIcon([
		{ d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
		{ tag: 'line', x1: 12, y1: 9, x2: 12, y2: 13 },
		{ tag: 'line', x1: 12, y1: 17, x2: 12.01, y2: 17 }
	], 14)
};

function leaseKpiIcon(key) {
	if (key === 'count') return LEASE_ICONS.all;
	if (key === 'profitLoss') return leaseSvgIcon([
		{ tag: 'line', x1: 12, y1: 1, x2: 12, y2: 23 },
		{ tag: 'path', d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }
	], 22);
	if (key === 'totalCost') return leaseSvgIcon([{ d: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }], 22);
	return leaseSvgIcon([{ d: 'M4 10h16M4 14h16M6 6h12M6 18h12' }], 22);
}

/** 宽表列头字段说明（悬停 ? 图标查看；含自动计算字段公式） */
var LEASE_COLUMN_TIPS = {
	seq: '当前列表展示顺序号，自动生成。',
	status: '数据状态：待保存、已保存、已生成账单、审批中、审批通过。',
	maintainerName: '台账维护人，新增行时取当前登录客服姓名。',
	year: '账单所属年份，必填。',
	month: '账单所属月份（1–12），必填；与年份共同决定当月在租天数计算区间。',
	dept: '业务部门，必填；选择车牌后从车辆档案自动带出。',
	salesman: '业务员，必填；选择车牌后从车辆档案自动带出。',
	billDate: '账单日期，必填；按「车牌 + 账单日期」匹配车辆租赁合同。不在任何合同有效期内时显示警告。',
	plateNo: '车牌号码，必填；选项来自车辆管理。选择后自动带出车型、客户、部门、业务员、标准成本、合同日期等。',
	vehicleModel: '车型（品牌+型号），选择车牌后自动带出，只读展示。',
	customerName: '客户名称，选择车牌后自动带出，只读展示。',
	valueAddedService: '增值费用类型，手选（如包氢租赁、无忧包等）；部分车辆可由车牌带出默认值。',
	exemptionPolicy: '享免政策，手选（如里程优惠政策等）。',
	pickupDate: '提车日期，手填；与系统「交车管理」交车日期不一致时显示警告图标。',
	contractStart: '合同生效日期；选车牌或修改账单日后按匹配合同自动带出；与系统不一致时警告。',
	contractEnd: '合同到期日期；选车牌或修改账单日后按匹配合同自动带出；与系统不一致时警告。',
	rentStartDate: '【自动计算】起始日期。提车日在账单月内 → 显示提车日期；提车日在账单月外 → 显示当月完整天数（如 10 月 31、11 月 30）。在租天数仍按退车日/月末截断后计算平均天数。',
	returnDate: '退车日期，手填；未填视为租至月末。与系统还车日期不一致时警告；提车日晚于账单月末则本月在租天数为 0。',
	avgDays: '【自动计算】平均天数 = 自起始日期起在租天数 ÷ 当月天数，保留 2 位小数。实际成本 = 标准成本 × 平均天数。',
	deposit: '押金，手填，支持 2 位小数；保存/提交时与系统租赁合同押金比对，不一致显示警告。',
	contractRent: '合同标的租金，手填，支持 2 位小数；保存/提交时与系统合同车辆租金比对，不一致显示警告。',
	receivableTotal: '【自动计算】应收合计 = 应收租金 + 保险上浮 + 运维费(收) + 其他收入 + 里程减免 + 其他减免。',
	receivableRent: '应收租金，手填，支持 2 位小数。',
	monthlyIncome: '【自动计算】月度收入 = 月度租金 + 维保包干 + 保险上浮 + 运维费(收) + 其他收入 + 里程减免 + 其他减免。',
	monthlyRent: '月度租金，手填；选车牌或改账单日时，可从匹配合同自动带出。',
	maintPackageIncome: '维保包干收入，手填，支持 2 位小数。',
	insuranceSurcharge: '保险上浮费（收入侧），手填，支持 2 位小数。',
	opsFeeIncome: '运维费（收入侧），手填，支持 2 位小数。',
	otherIncome: '其他收入，手填，支持 2 位小数。',
	mileageReduction: '里程减免，手填，可为负数，支持 2 位小数。',
	otherReduction: '其他减免，手填，可为负数，支持 2 位小数。',
	receivedAmount: '实收金额，手填，支持 2 位小数。',
	unreceived: '【自动计算】未收 = 应收合计 − 实收金额。',
	invoiceDate: '开票日期，手填。',
	paymentDate: '付款日期，手填。',
	paymentMethod: '付款方式，手选（月度后付、季度后付、预付等）。',
	vehicleStdCost: '车辆标准成本（单车月标准），手填；选择车牌可从车辆成本档案自动带出。',
	vehicleActualCost: '【自动计算】实际成本 = 标准成本 × 平均天数。',
	insuranceCost: '保险费（成本侧），手填，支持 2 位小数。',
	h2Cost: '氢费（成本侧），手填，支持 2 位小数。',
	opsCost: '运维费，手填，支持 2 位小数（成本项）。',
	intermediaryFee: '居间费，手填，支持 2 位小数。',
	otherCost: '其他成本，手填，支持 2 位小数。',
	totalCost: '【自动计算】总成本 = 实际成本 + 保险费 + 氢费 + 运维费 + 居间费 + 其他成本。',
	profitLoss: '【自动计算】盈亏 = 月度收入 − 总成本；正数为盈利，负数为亏损。',
	assetOwner: '资产归属公司；选择车牌后可自动带出，亦可手填修改。',
	signCompany: '签约公司；选择车牌后可自动带出，亦可手填修改。',
	remark: '备注，手填。',
	action: '行操作：编辑、删除等，权限随数据状态与角色变化。'
};

function leaseColTitle(label, tip) {
	if (!tip) return label;
	var Tooltip = window.antd && window.antd.Tooltip;
	if (!Tooltip) return label;
	return React.createElement('span', { className: 'lease-col-header-wrap' },
		React.createElement('span', { className: 'lease-col-header-label' }, label),
		React.createElement(Tooltip, {
			title: tip,
			placement: 'top',
			overlayStyle: { maxWidth: 380 }
		},
			React.createElement('span', {
				className: 'lease-col-header-tip',
				role: 'img',
				'aria-label': label + '字段说明',
				onClick: function (e) { e.stopPropagation(); }
			},
				leaseSvgIcon([
					{ tag: 'circle', cx: 12, cy: 12, r: 10 },
					{ tag: 'line', x1: 12, y1: 16, x2: 12, y2: 12 },
					{ tag: 'line', x1: 12, y1: 8, x2: 12.01, y2: 8 }
				], 11)
			)
		)
	);
}

var LEASE_REQUIREMENT_DOC =
	'## 租赁业务运营明细台账 · 需求说明\n\n' +
	'### 角色与权限\n' +
	'- **客服人员**：仅可查看、维护本人台账数据。\n' +
	'- **客服主管**：可查看全部客服人员的台账；对审批通过记录可继续编辑、删除。\n\n' +
	'### 数据状态\n' +
	'- **待保存**：新增一行或导入后，尚未点击「保存」。\n' +
	'- **已保存**：点击「保存」后可勾选并提交收款审批。\n' +
	'- **已生成账单**：提交收款审批后按客户+账单月+合同拆分账单，进入账单预览确认。\n' +
	'- **审批中**：发起收款审批后锁定；多选框禁用。\n' +
	'- **审批通过**：财务审批闭环后锁定；仅客服主管可维护。\n\n' +
	'### 维护方式\n' +
	'- **新增一行**：在表格底部追加空白可编辑行。\n' +
	'- **导入**：下载 CSV 模板填写后上传，生成待保存记录。\n' +
	'- **保存**：将本人待保存记录更新为已保存。\n' +
	'- **提交收款审批**：勾选已保存记录，按项目自动拆分账单并进入预览。\n' +
	'- **账单管理**：查看账单列表，支持取消账单、撤回、财务审批模拟。\n\n' +
	'### 筛选\n' +
	'支持按年份、月份、业务部门、业务员、车牌、客户名称、明细状态、账单日期区间筛选；统计卡片可快捷按状态筛选。\n\n' +
	'### 联调说明\n' +
	'原型阶段使用模拟登录用户；正式环境由系统登录态与角色权限接口驱动。\n' +
	'- **车牌号码**：选项取自系统「车辆管理」；选择后自动带出业务部门、业务员、车型、客户名称及租赁合同/标准成本等关联字段。\n' +
	'- **提车日期**：与系统「交车管理」完成交车时间（日期）校验；不一致时显示警告图标，悬浮可查看系统交车日期。\n' +
	'- **退车日期**：与系统「还车管理」实际还车时间（日期）校验；不一致时显示警告图标，悬浮可查看系统还车时间。\n' +
	'- **合同生效/到期**：根据车牌 + 账单日期匹配「车辆租赁合同」；选择车牌或修改账单日后自动带出对应合同起止日期，与系统不一致时显示警告图标。\n' +
	'- **起始日期**：由提车日期 + 账单年月自动计算——提车日在账单月内显示提车日期；提车日不在账单月内显示当月完整天数（如 10 月 31）。\n' +
	'- **平均天数**：自起始日期起在租天数 ÷ 当月天数，保留 2 位小数、千分位四舍五入（实际成本 = 标准成本 × 平均天数）。\n' +
	'- **押金**：手填，支持 2 位小数；保存时与系统租赁合同押金比对，不一致时显示警告图标。\n' +
	'- **合同标的租金**：手填，支持 2 位小数；保存时与系统合同车辆租金比对，不一致时显示警告图标。';

function renderLeaseRequirementPanel() {
	var lines = LEASE_REQUIREMENT_DOC.split('\n');
	return React.createElement('div', { className: 'h2-req-doc-panel', style: { padding: '4px 4px 16px', fontSize: 13, lineHeight: 1.65, color: '#475569' } },
		lines.map(function (line, idx) {
			if (line.indexOf('## ') === 0) {
				return React.createElement('h2', { key: idx, style: { fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '16px 0 10px' } }, line.replace(/^##\s*/, ''));
			}
			if (line.indexOf('### ') === 0) {
				return React.createElement('h3', { key: idx, style: { fontSize: 14, fontWeight: 700, color: '#334155', margin: '12px 0 8px' } }, line.replace(/^###\s*/, ''));
			}
			if (!line.trim()) return React.createElement('div', { key: idx, style: { height: 8 } });
			var parts = line.split(/(\*\*[^*]+\*\*)/g);
			return React.createElement('p', { key: idx, style: { margin: '0 0 6px' } },
				parts.map(function (part, pi) {
					if (part.indexOf('**') === 0 && part.lastIndexOf('**') === part.length - 2) {
						return React.createElement('strong', { key: pi, style: { color: '#0f172a' } }, part.slice(2, -2));
					}
					return part;
				})
			);
		})
	);
}

/** 车牌主数据（联调对接「车辆管理」+「车辆租赁合同」） */
var LEASE_PLATE_MASTER = [
	{ plateNo: '浙F07033F', brand: '现代', model: '4.5吨货车', customerName: '宁波港集装箱运输有限公司嘉兴分公司', dept: '业务一部', salesman: '陈高伟', assetOwner: '浙江氢能产业发展有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 7100, pickupDate: '2025-08-27', contractStart: '2025-09-01', contractEnd: '2025-11-30', contractRent: 6696, monthlyRent: 6696, valueAddedService: '包氢租赁' },
	{ plateNo: '浙F06909F', brand: '现代', model: '帕力安牌4.5吨冷链车', customerName: '宁波港集装箱运输有限公司嘉兴分公司', dept: '业务一部', salesman: '陈高伟', assetOwner: '浙江氢能产业发展有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 7100, pickupDate: '2025-08-27', contractStart: '2025-09-01', contractEnd: '2025-11-30', contractRent: 6696, monthlyRent: 6696 },
	{ plateNo: '浙F39003F', brand: '现代', model: '帕力安牌18吨双飞翼货车', customerName: '宁波港集装箱运输有限公司嘉兴分公司', dept: '业务一部', salesman: '陈高伟', assetOwner: '浙江氢能产业发展有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 7100, pickupDate: '2025-08-27', contractStart: '2025-09-01', contractEnd: '2025-11-30', contractRent: 6696, monthlyRent: 6696 },
	{ plateNo: '沪A33198F', brand: '楚风', model: '18吨厢式货车', customerName: '宁波港集装箱运输有限公司嘉兴分公司', dept: '业务一部', salesman: '陈高伟', assetOwner: '上海羚牛氢运物联网科技有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 7100, pickupDate: '2025-08-27', contractStart: '2025-09-01', contractEnd: '2025-11-30', contractRent: 6696, monthlyRent: 6696 },
	{ plateNo: '浙F09038F', brand: '苏龙', model: '海格牌18吨双飞翼货车', customerName: '宁波港集装箱运输有限公司嘉兴分公司', dept: '业务一部', salesman: '陈高伟', assetOwner: '浙江氢能产业发展有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 7100, pickupDate: '2025-08-27', contractStart: '2025-09-01', contractEnd: '2025-11-30', contractRent: 6696, monthlyRent: 6696 },
	{ plateNo: '浙F00661F', brand: '跃进', model: '4.5吨冷链车', customerName: '嘉兴市乍浦港口经营有限公司', dept: '业务一部', salesman: '陈高伟', assetOwner: '嘉兴氢能产业发展股份有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 7100, pickupDate: '2022-12-01', contractStart: '2022-12-01', contractEnd: '2025-11-30', contractRent: 18700, monthlyRent: 18700 },
	{ plateNo: '浙F00688F', brand: '飞驰', model: '49吨牵引车头', customerName: '嘉兴市乍浦港口经营有限公司', dept: '业务一部', salesman: '陈高伟', assetOwner: '嘉兴氢能产业发展股份有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 7100, pickupDate: '2022-12-01', contractStart: '2022-12-01', contractEnd: '2025-11-30', contractRent: 18700, monthlyRent: 18700 },
	{ plateNo: '浙F01115F', brand: '飞驰', model: '49吨牵引车头', customerName: '嘉兴市乍浦港口经营有限公司', dept: '业务一部', salesman: '陈高伟', assetOwner: '嘉兴氢能产业发展股份有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 7100, pickupDate: '2022-12-01', contractStart: '2022-12-01', contractEnd: '2025-11-30', contractRent: 18700, monthlyRent: 18700 },
	{ plateNo: '浙F03218F', brand: '飞驰', model: '49吨牵引车头', customerName: '上海馨想事成物流有限公司', dept: '业务二部', salesman: '董剑煜', assetOwner: '浙江羚牛氢能科技有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 8500, pickupDate: '2026-01-10', contractStart: '2026-01-15', contractEnd: '2027-01-14', contractRent: 12800, monthlyRent: 12000, deposit: 10000 },
	{ plateNo: '粤AGP5621', brand: '现代', model: '帕力安牌4.5吨冷链车', customerName: '嘉兴某某物流有限公司', dept: '业务二部', salesman: '赵连飞', assetOwner: '浙江羚牛氢能科技有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 7200, pickupDate: '2026-02-01', contractStart: '2026-02-01', contractEnd: '2027-01-31', contractRent: 9800, monthlyRent: 9500, deposit: 8000 },
	{ plateNo: '京A29256F', brand: '飞驰', model: '49吨牵引车头', customerName: '北京海龙运输有限公司', dept: '业务一部', salesman: '刘念念', assetOwner: '北京羚牛氢运科技有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 12000, pickupDate: '2025-08-01', contractStart: '2025-08-15', contractEnd: '2026-08-14', contractRent: 22000, monthlyRent: 21000, deposit: 15000 },
	{ plateNo: '浙F01505F', brand: '飞驰', model: '49吨牵引车头', customerName: '嘉兴市乍浦港口经营有限公司', dept: '业务一部', salesman: '尚建华', assetOwner: '嘉兴氢能产业发展股份有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 7100, pickupDate: '2022-12-01', contractStart: '2022-12-01', contractEnd: '2025-11-30', contractRent: 18700, monthlyRent: 18700 },
	{ plateNo: '沪A12345', brand: '飞驰', model: '49T', customerName: '嘉兴某某物流有限公司', dept: '业务二部', salesman: '李婷婷', assetOwner: '浙江羚牛氢能科技有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 7100, pickupDate: '2025-06-01', systemReturnAt: '2025-10-15 16:20' },
	{ plateNo: '粤B67890', brand: '现代', model: '帕力安牌4.5吨冷链车', customerName: '嘉兴某某物流有限公司', dept: '业务二部', salesman: '李婷婷', assetOwner: '浙江羚牛氢能科技有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 7200 },
	{ plateNo: '苏E88888F', brand: '楚风', model: '18吨厢式货车', customerName: '杭州某某租赁有限公司', dept: '业务三部', salesman: '王磊', assetOwner: '浙江羚牛氢能科技有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 7100 },
	{ plateNo: '京C12345', brand: '飞驰', model: '49吨牵引车头', customerName: '北京海龙运输有限公司', dept: '业务一部', salesman: '刘念念', assetOwner: '北京羚牛氢运科技有限公司', signCompany: '浙江羚牛氢能科技有限公司', vehicleStdCost: 12000 }
];

LEASE_PLATE_MASTER.forEach(function (item, idx) {
	if (!item.systemDeliveryAt && item.pickupDate) {
		var times = ['09:30', '10:15', '14:00', '11:20', '15:45'];
		item.systemDeliveryAt = item.pickupDate + ' ' + times[idx % times.length];
	}
});

var LEASE_PLATE_CONTEXT_MAP = (function () {
	var map = {};
	LEASE_PLATE_MASTER.forEach(function (item) { map[item.plateNo] = item; });
	return map;
})();

/** 车辆租赁合同列表（同一车牌可有多份合同；按账单日落在 [contractStart, contractEnd] 内匹配） */
var LEASE_VEHICLE_CONTRACTS = [];
LEASE_PLATE_MASTER.forEach(function (item) {
	if (!item.contractStart || !item.contractEnd) return;
	LEASE_VEHICLE_CONTRACTS.push({
		plateNo: item.plateNo,
		contractCode: 'LNZL-' + item.plateNo + '-01',
		projectName: (item.customerName || '租赁项目') + '·' + (item.model || '车辆'),
		contractStart: item.contractStart,
		contractEnd: item.contractEnd,
		contractRent: item.contractRent,
		monthlyRent: item.monthlyRent,
		deposit: item.deposit != null ? item.deposit : 0,
		invoiceMode: item.invoiceMode || 'after'
	});
});
LEASE_VEHICLE_CONTRACTS.push(
	{ plateNo: '浙F07033F', contractCode: 'LNZLHT-2026-07033', projectName: '宁波港嘉兴4.5吨租赁项目', contractStart: '2025-12-01', contractEnd: '2026-11-30', contractRent: 7200, monthlyRent: 7200, deposit: 0, invoiceMode: 'after' },
	{ plateNo: '京A29256F', contractCode: 'LNZLHT-2026-29256', projectName: '北京海龙49吨牵引租赁项目', contractStart: '2026-08-15', contractEnd: '2027-08-14', contractRent: 23000, monthlyRent: 22000, deposit: 15000, invoiceMode: 'first' }
);

function getDetailStatus(row) {
	if (!row) return 'unsaved';
	if (row.detailStatus) return row.detailStatus;
	if (row.submitStatus === 'submitted') return 'approved';
	if (row.saveStatus === 'saved') return 'saved';
	return 'unsaved';
}

function canSelectDetailRow(row) {
	return getDetailStatus(row) === 'saved';
}

var LEASE_CONTRACTS_BY_PLATE = (function () {
	var map = {};
	LEASE_VEHICLE_CONTRACTS.forEach(function (c) {
		if (!map[c.plateNo]) map[c.plateNo] = [];
		map[c.plateNo].push(c);
	});
	Object.keys(map).forEach(function (plate) {
		map[plate].sort(function (a, b) { return String(a.contractStart).localeCompare(String(b.contractStart)); });
	});
	return map;
})();

function formatLeaseVehicleModel(ctx) {
	if (!ctx) return '';
	if (ctx.vehicleModel) return ctx.vehicleModel;
	var parts = [];
	if (ctx.brand) parts.push(ctx.brand);
	if (ctx.model) parts.push(ctx.model);
	return parts.join(' ') || ctx.vehicleType || '';
}

function formatPickupDay(d) {
	if (!d || !window.dayjs) return '';
	try {
		var x = window.dayjs(d);
		return x.isValid() ? x.format('YYYY-MM-DD') : '';
	} catch (e) {
		return '';
	}
}

function getSystemDeliveryAt(plateNo) {
	var ctx = LEASE_PLATE_CONTEXT_MAP[plateNo];
	if (!ctx) return '';
	return ctx.systemDeliveryAt || '';
}

function isPickupDateMismatch(plateNo, pickupDate) {
	if (!plateNo || !pickupDate) return false;
	var systemAt = getSystemDeliveryAt(plateNo);
	if (!systemAt) return false;
	return formatPickupDay(pickupDate) !== systemAt.slice(0, 10);
}

function getSystemReturnAt(plateNo) {
	var ctx = LEASE_PLATE_CONTEXT_MAP[plateNo];
	if (!ctx) return '';
	return ctx.systemReturnAt || '';
}

function hasLedgerReturnDate(returnDate) {
	return !!returnDate && returnDate !== '-';
}

function isReturnDateMismatch(plateNo, returnDate) {
	if (!plateNo) return false;
	var systemAt = getSystemReturnAt(plateNo);
	var hasReturn = hasLedgerReturnDate(returnDate);
	if (!systemAt) return hasReturn;
	if (!hasReturn) return true;
	return formatPickupDay(returnDate) !== systemAt.slice(0, 10);
}

function getReturnDateMismatchTip(plateNo, returnDate) {
	var systemAt = getSystemReturnAt(plateNo);
	if (systemAt) return '系统还车时间：' + systemAt;
	if (hasLedgerReturnDate(returnDate)) return '系统尚未还车';
	return '';
}

function parseBillDay(billDate) {
	if (!billDate || !window.dayjs) return null;
	try {
		var d = window.dayjs(billDate).startOf('day');
		return d.isValid() ? d : null;
	} catch (e) {
		return null;
	}
}

function findContractForBillDate(plateNo, billDate) {
	if (!plateNo || !billDate) return null;
	var day = parseBillDay(billDate);
	if (!day) return null;
	var list = LEASE_CONTRACTS_BY_PLATE[plateNo] || [];
	for (var i = 0; i < list.length; i++) {
		var c = list[i];
		var start = parseBillDay(c.contractStart);
		var end = parseBillDay(c.contractEnd);
		if (start && end && !day.isBefore(start, 'day') && !day.isAfter(end, 'day')) return c;
	}
	return null;
}

function getSystemContractForBillDate(plateNo, billDate) {
	var c = findContractForBillDate(plateNo, billDate);
	if (!c) return null;
	return {
		contractCode: c.contractCode || '',
		contractStart: c.contractStart,
		contractEnd: c.contractEnd,
		contractRent: c.contractRent,
		monthlyRent: c.monthlyRent
	};
}

function isContractStartMismatch(plateNo, billDate, contractStart) {
	if (!plateNo || !billDate || !contractStart) return false;
	var sys = getSystemContractForBillDate(plateNo, billDate);
	if (!sys) return false;
	return formatPickupDay(contractStart) !== sys.contractStart;
}

function isContractEndMismatch(plateNo, billDate, contractEnd) {
	if (!plateNo || !billDate || !contractEnd) return false;
	var sys = getSystemContractForBillDate(plateNo, billDate);
	if (!sys) return false;
	return formatPickupDay(contractEnd) !== sys.contractEnd;
}

function roundDepositAmount(n) {
	if (n === null || n === undefined || n === '') return 0;
	var v = Number(n);
	if (isNaN(v)) return 0;
	return Math.round(v * 100) / 100;
}

function getSystemDeposit(plateNo, billDate) {
	var c = findContractForBillDate(plateNo, billDate);
	if (c && c.deposit != null) return roundDepositAmount(c.deposit);
	var ctx = LEASE_PLATE_CONTEXT_MAP[plateNo];
	if (ctx && ctx.deposit != null) return roundDepositAmount(ctx.deposit);
	return 0;
}

function isDepositMismatch(plateNo, billDate, deposit) {
	if (!plateNo) return false;
	return roundDepositAmount(deposit) !== getSystemDeposit(plateNo, billDate);
}

function getSystemContractRent(plateNo, billDate) {
	var c = findContractForBillDate(plateNo, billDate);
	if (c && c.contractRent != null) return roundDepositAmount(c.contractRent);
	var ctx = LEASE_PLATE_CONTEXT_MAP[plateNo];
	if (ctx && ctx.contractRent != null) return roundDepositAmount(ctx.contractRent);
	return 0;
}

function isContractRentMismatch(plateNo, billDate, contractRent) {
	if (!plateNo) return false;
	return roundDepositAmount(contractRent) !== getSystemContractRent(plateNo, billDate);
}

var LEASE_DETAIL_STATUS_LABEL = {
	unsaved: '待保存',
	saved: '已保存',
	bill_generated: '已生成账单',
	approving: '审批中',
	approved: '审批通过'
};

var LEASE_BILL_STATUS_LABEL = {
	preview: '待确认',
	approving: '审批中',
	approved: '审批通过',
	rejected: '已驳回',
	cancelled: '已取消'
};

var LEASE_INVOICE_MODE_LABEL = { first: '先开', after: '后开' };

var LEASE_PAYMENT_ACCOUNTS = {
	'浙江羚牛氢能科技有限公司': { bankName: '中国工商银行嘉兴分行', accountName: '浙江羚牛氢能科技有限公司', accountNo: '1202 0800 0900 1234 567' },
	'上海羚牛氢运物联网科技有限公司': { bankName: '招商银行上海浦东支行', accountName: '上海羚牛氢运物联网科技有限公司', accountNo: '1219 0001 2345 6789' }
};

var leaseBillIdSeed = 0;
function nextLeaseBillId() {
	leaseBillIdSeed += 1;
	return 'lbill-' + Date.now() + '-' + leaseBillIdSeed;
}

function getRowBillingYearMonth(row) {
	if (row && row.billDate && window.dayjs) {
		var d = parseBillDay(row.billDate);
		if (d) return { year: d.year(), month: d.month() + 1 };
	}
	return { year: Number(row && row.year) || 0, month: Number(row && row.month) || 0 };
}

function getRowContractMeta(row) {
	var c = findContractForBillDate(row.plateNo, row.billDate);
	if (!c) {
		return {
			contractCode: '',
			projectName: (row.customerName || '未命名') + '租赁项目',
			invoiceMode: 'after',
			signCompany: row.signCompany || ''
		};
	}
	return {
		contractCode: c.contractCode || '',
		projectName: c.projectName || ((row.customerName || '') + '租赁项目'),
		invoiceMode: c.invoiceMode === 'first' ? 'first' : 'after',
		signCompany: row.signCompany || ''
	};
}

function calcRowReductionAmount(row) {
	var a = Number(row.mileageReduction) || 0;
	var b = Number(row.otherReduction) || 0;
	return Math.round((a + b) * 100) / 100;
}

function formatRentStartForBill(row) {
	if (row.rentStartDays != null && row.rentStartDays !== '') return String(row.rentStartDays);
	if (!row.rentStartDate || !window.dayjs) return '-';
	try {
		return window.dayjs(row.rentStartDate).format('YYYY-MM-DD');
	} catch (e) {
		return '-';
	}
}

function formatBillPeriod(year, month) {
	if (!year || !month) return '-';
	return year + '年' + month + '月';
}

function buildBillGroupKey(row) {
	var billing = getRowBillingYearMonth(row);
	var meta = getRowContractMeta(row);
	var customer = String(row.customerName || '').trim() || '未命名客户';
	var contractKey = meta.contractCode || meta.projectName || 'default';
	return customer + '|' + billing.year + '|' + billing.month + '|' + contractKey;
}

/** 按「客户 + 账单月 + 合同/项目」拆分；支持跨客户、跨月份批量勾选 */
function buildBillsFromRows(rows) {
	if (!rows || !rows.length) return [];
	var groups = {};
	rows.forEach(function (row) {
		var gkey = buildBillGroupKey(row);
		var meta = getRowContractMeta(row);
		var billing = getRowBillingYearMonth(row);
		if (!groups[gkey]) {
			groups[gkey] = {
				id: nextLeaseBillId(),
				status: 'preview',
				customerName: row.customerName || '未命名客户',
				projectName: meta.projectName,
				contractCode: meta.contractCode,
				year: billing.year,
				month: billing.month,
				billPeriod: formatBillPeriod(billing.year, billing.month),
				billDate: row.billDate,
				invoiceMode: meta.invoiceMode,
				signCompany: meta.signCompany || row.signCompany || '浙江羚牛氢能科技有限公司',
				receivedTotal: 0,
				arrivalAmount: null,
				receiptAttachment: null,
				invoiceAttachment: null,
				invoiceStep: meta.invoiceMode === 'first' ? 0 : 1,
				rowKeys: [],
				lines: [],
				pdfGenerated: false,
				createdAt: Date.now()
			};
		}
		var reduction = calcRowReductionAmount(row);
		groups[gkey].rowKeys.push(row.key);
		groups[gkey].lines.push({
			key: row.key,
			plateNo: row.plateNo,
			billDate: row.billDate,
			pickupDate: row.pickupDate,
			returnDate: row.returnDate,
			rentStart: formatRentStartForBill(row),
			receivableTotal: row.receivableTotal,
			reductionAmount: reduction,
			receivedAmount: row.receivedAmount
		});
		groups[gkey].receivedTotal += Number(row.receivedAmount) || 0;
	});
	return Object.keys(groups).map(function (k) {
		var b = groups[k];
		b.receivedTotal = Math.round(b.receivedTotal * 100) / 100;
		return b;
	});
}

function openLeaseBillPdf(bill) {
	var pay = LEASE_PAYMENT_ACCOUNTS[bill.signCompany] || LEASE_PAYMENT_ACCOUNTS['浙江羚牛氢能科技有限公司'];
	var linesHtml = (bill.lines || []).map(function (ln, idx) {
		return '<tr><td>' + (idx + 1) + '</td><td>' + (ln.plateNo || '-') + '</td><td>' + (ln.receivableTotal || 0) + '</td><td>' + (ln.reductionAmount || 0) + '</td><td>' + (ln.receivedAmount || 0) + '</td></tr>';
	}).join('');
	var html = '<html><head><meta charset="utf-8"><title>对账单</title><style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;font-size:12px}h1{font-size:18px}</style></head><body>'
		+ '<h1>租赁收款对账单</h1>'
		+ '<p>客户：' + (bill.customerName || '-') + ' | 项目：' + (bill.projectName || '-') + ' | 账单周期：' + (bill.billPeriod || '-') + '</p>'
		+ '<p>实收总额：' + (bill.receivedTotal || 0) + ' | 开票方式：' + (LEASE_INVOICE_MODE_LABEL[bill.invoiceMode] || '-') + '</p>'
		+ '<p>收款账户：' + pay.bankName + ' ' + pay.accountName + ' ' + pay.accountNo + '</p>'
		+ '<table><thead><tr><th>序号</th><th>车牌</th><th>应收合计</th><th>减免</th><th>实收</th></tr></thead><tbody>' + linesHtml + '</tbody></table>'
		+ '</body></html>';
	var w = window.open('', '_blank');
	if (!w) return;
	w.document.write(html);
	w.document.close();
	w.focus();
	w.print();
}

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;
	var useRef = React.useRef;

	var antd = window.antd;
	var App = antd.App;
	var Card = antd.Card;
	var Button = antd.Button;
	var Table = antd.Table;
	var Select = antd.Select;
	var DatePicker = antd.DatePicker;
	var Input = antd.Input;
	var InputNumber = antd.InputNumber;
	var Space = antd.Space;
	var Tag = antd.Tag;
	var Popconfirm = antd.Popconfirm;
	var Tooltip = antd.Tooltip;
	var Modal = antd.Modal;
	var Drawer = antd.Drawer;
	var Upload = antd.Upload;
	var Alert = antd.Alert;
	var message = antd.message;

	/** 原型：切换客服 / 客服主管视角 */
	var CURRENT_USER = { id: 'u_chen', name: '陈高伟', role: 'staff' };

	var OTHER_STAFF = [
		{ id: 'u_chen', name: '陈高伟', dept: '业务一部' },
		{ id: 'u_li', name: '李婷婷', dept: '业务二部' },
		{ id: 'u_wang', name: '王磊', dept: '业务一部' }
	];

	var DEPT_OPTIONS = [
		{ value: '业务一部', label: '业务一部' },
		{ value: '业务二部', label: '业务二部' },
		{ value: '业务三部', label: '业务三部' }
	];

	var VALUE_ADDED_OPTIONS = [
		{ value: '包氢租赁', label: '包氢租赁' },
		{ value: '包车租赁', label: '包车租赁' },
		{ value: '无忧包', label: '无忧包' },
		{ value: '含保养', label: '含保养' },
		{ value: '含运维包干', label: '含运维包干' }
	];

	var EXEMPTION_OPTIONS = [
		{ value: '帕力安18T里程优惠政策', label: '帕力安18T里程优惠政策' },
		{ value: '帕力安4.5T里程优惠政策', label: '帕力安4.5T里程优惠政策' }
	];

	var PAYMENT_METHOD_OPTIONS = [
		{ value: '月度后付', label: '月度后付' },
		{ value: '季度后付', label: '季度后付' },
		{ value: '预付', label: '预付' }
	];

	var DETAIL_STATUS_FILTER_OPTIONS = [
		{ value: 'unsaved', label: '待保存' },
		{ value: 'saved', label: '已保存' },
		{ value: 'bill_generated', label: '已生成账单' },
		{ value: 'approving', label: '审批中' },
		{ value: 'approved', label: '审批通过' }
	];

	var IMPORT_HEADERS = [
		'年份', '月份', '业务部门', '业务员', '账单日期', '车牌号码', '车型', '客户名称',
		'增值费用', '享免政策', '提车日期', '合同生效日期', '合同到期日期', '合同标的租金',
		'月度租金', '保险上浮费', '运维费', '其他收入', '实收金额', '付款方式', '备注'
	];

	function isSupervisorRole(user) {
		return user && user.role === 'supervisor';
	}

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function numOrZero(v) {
		if (v === null || v === undefined || v === '') return 0;
		var n = Number(v);
		return isNaN(n) ? 0 : n;
	}

	function roundMoney(n) {
		return Math.round(numOrZero(n) * 100) / 100;
	}

	function fmtMoney(n) {
		if (n === null || n === undefined || n === '') return '0.00';
		return roundMoney(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function isEmptyStr(v) {
		return !String(v == null ? '' : v).trim();
	}

	function nowDayjs() {
		try {
			if (window.dayjs) return window.dayjs();
		} catch (e) {}
		return null;
	}

	function formatDate(d) {
		if (!d || !window.dayjs) return '';
		try {
			return window.dayjs(d).format('YYYY-MM-DD');
		} catch (e) {
			return '';
		}
	}

	function parseDateVal(v) {
		if (!v || v === '-' || !window.dayjs) return null;
		try {
			var d = window.dayjs(v);
			return d.isValid() ? d : null;
		} catch (e) {
			return null;
		}
	}

	function padMonth(n) {
		return String(n).padStart(2, '0');
	}

	function getDaysInMonth(year, month) {
		var y = Number(year);
		var m = Number(month);
		if (!y || !m) return 0;
		if (window.dayjs) {
			var d = window.dayjs(String(y) + '-' + padMonth(m) + '-01');
			return d.isValid() ? d.daysInMonth() : 0;
		}
		return new Date(y, m, 0).getDate();
	}

	/** 账单年月：优先取账单日期，其次取年份/月份列 */
	function getBillingYearMonth(row) {
		var bill = parseDateVal(row && row.billDate);
		if (bill && bill.isValid()) {
			return { year: bill.year(), month: bill.month() + 1 };
		}
		return { year: Number(row && row.year) || 0, month: Number(row && row.month) || 0 };
	}

	function syncBillDateFromYearMonth(row, year, month) {
		if (!window.dayjs || !year || !month) return parseDateVal(row && row.billDate);
		var base = parseDateVal(row && row.billDate) || window.dayjs(String(year) + '-' + padMonth(month) + '-01');
		var dim = getDaysInMonth(year, month);
		var day = Math.min(base.date(), dim || 1);
		var d = window.dayjs(String(year) + '-' + padMonth(month) + '-' + padMonth(day));
		return d.isValid() ? d.startOf('day') : parseDateVal(row && row.billDate);
	}

	function enrichBillingPeriodPatch(row, patchObj) {
		if (!patchObj) return patchObj;
		var merged = Object.assign({}, row, patchObj);
		if (patchObj.billDate !== undefined) {
			var bill = parseDateVal(patchObj.billDate);
			if (bill && bill.isValid()) {
				patchObj.year = bill.year();
				patchObj.month = bill.month() + 1;
			}
			return patchObj;
		}
		if (patchObj.year !== undefined || patchObj.month !== undefined) {
			var y = patchObj.year !== undefined ? patchObj.year : row.year;
			var m = patchObj.month !== undefined ? patchObj.month : row.month;
			y = Number(y);
			m = Number(m);
			if (y && m) {
				patchObj.year = y;
				patchObj.month = m;
				var syncedBill = syncBillDateFromYearMonth(row, y, m);
				if (syncedBill) patchObj.billDate = syncedBill;
			}
		}
		return patchObj;
	}

	function isPickupInBillingMonth(year, month, pickupDate) {
		var pickup = parseDateVal(pickupDate);
		if (!pickup) return false;
		return pickup.year() === Number(year) && pickup.month() + 1 === Number(month);
	}

	/**
	 * 起始日期展示：
	 * 1. 提车日在账单月内 → rentStartDate = 提车日（显示日期）
	 * 2. 提车日不在账单月内（或未填） → rentStartDays = 当月天数（如 10 月 31）
	 */
	function calcRentStartFields(year, month, pickupDate) {
		var y = Number(year);
		var m = Number(month);
		var daysInMonth = getDaysInMonth(y, m);
		if (!y || !m || !daysInMonth) {
			return { rentStartDate: null, rentStartDays: null };
		}
		if (isPickupInBillingMonth(y, m, pickupDate)) {
			var pickup = parseDateVal(pickupDate);
			return {
				rentStartDate: pickup ? pickup.startOf('day') : null,
				rentStartDays: null
			};
		}
		return { rentStartDate: null, rentStartDays: daysInMonth };
	}

	function getRentStartForCalc(year, month, pickupDate) {
		var y = Number(year);
		var m = Number(month);
		if (!y || !m || !window.dayjs) return null;
		var monthStart = window.dayjs(String(y) + '-' + padMonth(m) + '-01').startOf('day');
		var fields = calcRentStartFields(y, m, pickupDate);
		return fields.rentStartDate || monthStart;
	}

	function formatRentStartDisplay(row) {
		if (row && row.rentStartDays != null && row.rentStartDays !== '') {
			return String(row.rentStartDays);
		}
		return formatDate(row && row.rentStartDate) || '-';
	}

	function getRentStartDateHint(year, month, pickupDate, rentDaysFromStart, daysInMonth) {
		if (!pickupDate) {
			return '未填写提车日期：起始日期=当月完整天数'
				+ (daysInMonth ? '（' + daysInMonth + '天）' : '')
				+ (rentDaysFromStart != null && daysInMonth ? '；在租天数=' + rentDaysFromStart + '天' : '');
		}
		if (isPickupInBillingMonth(year, month, pickupDate)) {
			return '提车日在账单月内：起始日期=提车日期；在租天数=提车日至退车日/月末（'
				+ (rentDaysFromStart != null ? rentDaysFromStart : '-') + '天）';
		}
		return '提车日在账单月外：起始日期=当月完整天数'
			+ (daysInMonth ? '（' + daysInMonth + '天）' : '')
			+ (rentDaysFromStart != null ? '；在租天数=' + rentDaysFromStart + '天' : '');
	}

	/**
	 * 自起始日期起算的本月在租天数（至退车日或月末，含首尾日）；
	 * 未退车视为租至月末。
	 */
	function calcRentDaysFromStartDate(year, month, rentStartDate, returnDate, pickupDate) {
		var y = Number(year);
		var m = Number(month);
		if (!y || !m) return 0;

		var daysInMonth = getDaysInMonth(y, m);
		if (!daysInMonth) return 0;

		if (!window.dayjs) return daysInMonth;

		var monthStart = window.dayjs(String(y) + '-' + padMonth(m) + '-01').startOf('day');
		var monthEnd = monthStart.endOf('month').startOf('day');

		var pickup = parseDateVal(pickupDate);
		if (pickup && pickup.isAfter(monthEnd, 'day')) return 0;

		var rentStart = parseDateVal(rentStartDate) || monthStart;
		var rentEnd = parseDateVal(returnDate) || monthEnd;
		rentStart = rentStart.startOf('day');
		rentEnd = rentEnd.startOf('day');

		if (rentStart.isAfter(monthEnd, 'day') || rentEnd.isBefore(monthStart, 'day')) return 0;

		var effectiveStart = rentStart.isBefore(monthStart, 'day') ? monthStart : rentStart;
		var effectiveEnd = rentEnd.isAfter(monthEnd, 'day') ? monthEnd : rentEnd;
		return effectiveEnd.diff(effectiveStart, 'day') + 1;
	}

	function getAvgDaysHint(row, rentDaysFromStart, daysInMonth) {
		return '平均天数 = 自起始日期起在租天数 ÷ 当月天数（'
			+ rentDaysFromStart + ' ÷ ' + daysInMonth + '）';
	}

	function buildPlateAutoPatch(plateNo) {
		if (!plateNo) {
			return {
				plateNo: undefined,
				vehicleModel: '',
				customerName: '',
				dept: undefined,
				salesman: ''
			};
		}
		var ctx = LEASE_PLATE_CONTEXT_MAP[plateNo];
		if (!ctx) {
			return {
				plateNo: plateNo,
				vehicleModel: '',
				customerName: '',
				dept: undefined,
				salesman: ''
			};
		}
		var patch = {
			plateNo: plateNo,
			vehicleModel: formatLeaseVehicleModel(ctx),
			customerName: ctx.customerName || '',
			dept: ctx.dept || undefined,
			salesman: ctx.salesman || ''
		};
		if (ctx.assetOwner) patch.assetOwner = ctx.assetOwner;
		if (ctx.signCompany) patch.signCompany = ctx.signCompany;
		if (ctx.vehicleStdCost != null) patch.vehicleStdCost = ctx.vehicleStdCost;
		if (ctx.pickupDate) patch.pickupDate = parseDateVal(ctx.pickupDate);
		if (ctx.valueAddedService) patch.valueAddedService = ctx.valueAddedService;
		return patch;
	}

	function buildContractAutoPatch(plateNo, billDate) {
		var c = findContractForBillDate(plateNo, billDate);
		if (!c) return {};
		var patch = {
			contractStart: parseDateVal(c.contractStart),
			contractEnd: parseDateVal(c.contractEnd)
		};
		if (c.monthlyRent != null) patch.monthlyRent = c.monthlyRent;
		return patch;
	}

	function mergePlateAndContractPatch(plateNo, billDate) {
		return Object.assign({}, buildPlateAutoPatch(plateNo), buildContractAutoPatch(plateNo, billDate));
	}

	var rowIdSeed = 0;
	function nextRowKey() {
		rowIdSeed += 1;
		return 'lease-' + Date.now() + '-' + rowIdSeed;
	}

	function recalcRow(row) {
		var receivableRent = roundMoney(row.receivableRent);
		var insuranceSurcharge = roundMoney(row.insuranceSurcharge);
		var opsFeeIncome = roundMoney(row.opsFeeIncome);
		var otherIncome = roundMoney(row.otherIncome);
		var mileageReduction = roundMoney(row.mileageReduction);
		var otherReduction = roundMoney(row.otherReduction);
		var monthlyRent = roundMoney(row.monthlyRent);
		var maintPackageIncome = roundMoney(row.maintPackageIncome);
		var receivedAmount = roundMoney(row.receivedAmount);

		var billing = getBillingYearMonth(row);
		var daysInMonth = getDaysInMonth(billing.year, billing.month);
		var rentStartFields = calcRentStartFields(billing.year, billing.month, row.pickupDate);
		var rentStartForCalc = getRentStartForCalc(billing.year, billing.month, row.pickupDate);
		var rentDaysFromStart = calcRentDaysFromStartDate(billing.year, billing.month, rentStartForCalc, row.returnDate, row.pickupDate);
		var avgDays = daysInMonth > 0 ? roundMoney(rentDaysFromStart / daysInMonth) : 0;

		var receivableTotal = roundMoney(
			receivableRent + insuranceSurcharge + opsFeeIncome + otherIncome + mileageReduction + otherReduction
		);
		var monthlyIncome = roundMoney(
			monthlyRent + maintPackageIncome + insuranceSurcharge + opsFeeIncome + otherIncome + mileageReduction + otherReduction
		);
		var unreceived = roundMoney(receivableTotal - receivedAmount);

		var vehicleStdCost = roundMoney(row.vehicleStdCost);
		var vehicleActualCost = roundMoney(vehicleStdCost * avgDays);
		var insuranceCost = roundMoney(row.insuranceCost);
		var h2Cost = roundMoney(row.h2Cost);
		var opsCost = roundMoney(row.opsCost);
		var intermediaryFee = roundMoney(row.intermediaryFee);
		var otherCost = roundMoney(row.otherCost);
		var totalCost = roundMoney(
			vehicleActualCost + insuranceCost + h2Cost + opsCost + intermediaryFee + otherCost
		);
		var profitLoss = roundMoney(monthlyIncome - totalCost);

		return Object.assign({}, row, {
			year: billing.year || row.year,
			month: billing.month || row.month,
			receivableRent: receivableRent,
			insuranceSurcharge: insuranceSurcharge,
			opsFeeIncome: opsFeeIncome,
			otherIncome: otherIncome,
			mileageReduction: mileageReduction,
			otherReduction: otherReduction,
			monthlyRent: monthlyRent,
			maintPackageIncome: maintPackageIncome,
			receivedAmount: receivedAmount,
			receivableTotal: receivableTotal,
			monthlyIncome: monthlyIncome,
			unreceived: unreceived,
			daysInMonth: daysInMonth,
			rentStartDate: rentStartFields.rentStartDate,
			rentStartDays: rentStartFields.rentStartDays,
			monthRentDays: rentDaysFromStart,
			avgDays: avgDays,
			vehicleStdCost: vehicleStdCost,
			vehicleActualCost: vehicleActualCost,
			insuranceCost: insuranceCost,
			h2Cost: h2Cost,
			opsCost: opsCost,
			intermediaryFee: intermediaryFee,
			otherCost: otherCost,
			totalCost: totalCost,
			profitLoss: profitLoss,
			deposit: roundMoney(row.deposit),
			contractRent: roundMoney(row.contractRent)
		});
	}

	function rowStatusLabel(row) {
		return LEASE_DETAIL_STATUS_LABEL[getDetailStatus(row)] || '待保存';
	}

	function rowDisplaySortTier(row) {
		var ds = getDetailStatus(row);
		if (ds === 'approved') return 0;
		if (ds === 'approving') return 1;
		if (ds === 'bill_generated') return 2;
		if (ds === 'saved') return 3;
		return 4;
	}

	function isSavedDraftRow(row) {
		return getDetailStatus(row) === 'saved';
	}

	function detailStatusTagColor(ds) {
		if (ds === 'approved') return 'green';
		if (ds === 'approving') return 'processing';
		if (ds === 'bill_generated') return 'purple';
		if (ds === 'saved') return 'orange';
		return 'default';
	}

	function buildEmptyRow(user) {
		var now = nowDayjs();
		return recalcRow({
			key: nextRowKey(),
			createdBy: user.id,
			maintainerName: user.name,
			createdAt: now,
			year: now ? now.year() : 2026,
			month: now ? now.month() + 1 : 1,
			dept: user.dept || undefined,
			salesman: user.name,
			billDate: now,
			plateNo: undefined,
			vehicleModel: '',
			customerName: '',
			valueAddedService: undefined,
			exemptionPolicy: undefined,
			pickupDate: null,
			contractStart: null,
			contractEnd: null,
			rentStartDate: null,
			rentStartDays: null,
			returnDate: null,
			deposit: 0,
			contractRent: null,
			receivableRent: 0,
			monthlyRent: 0,
			maintPackageIncome: 0,
			insuranceSurcharge: 0,
			opsFeeIncome: 0,
			otherIncome: 0,
			mileageReduction: 0,
			otherReduction: 0,
			receivedAmount: 0,
			invoiceDate: null,
			paymentDate: null,
			paymentMethod: undefined,
			vehicleStdCost: null,
			vehicleActualCost: 0,
			insuranceCost: 0,
			h2Cost: 0,
			opsCost: 0,
			intermediaryFee: 0,
			otherCost: 0,
			gpsMileage: null,
			reductionDetail: '',
			assetOwner: '',
			signCompany: '',
			remark: '',
			submitStatus: 'draft',
			saveStatus: 'unsaved',
			detailStatus: 'unsaved',
			billId: null,
			submittedAt: null
		});
	}

	function mockBillDate(year, month, day) {
		var d = day != null ? day : 1;
		return parseDateVal(String(year) + '-' + padMonth(month) + '-' + padMonth(d));
	}

	/** 样例行：合并车牌/合同带出，并强制账单年月与账单日期一致 */
	function finalizeMockRow(base, override) {
		var row = Object.assign({}, base, override || {});
		if (row.plateNo && row.billDate) {
			Object.assign(row, mergePlateAndContractPatch(row.plateNo, row.billDate));
		}
		if (override) Object.assign(row, override);
		var bill = parseDateVal(row.billDate);
		if (bill && bill.isValid()) {
			row.billDate = bill;
			row.year = bill.year();
			row.month = bill.month() + 1;
		}
		if (!row.detailStatus) {
			if (row.submitStatus === 'submitted') row.detailStatus = 'approved';
			else if (row.saveStatus === 'saved') row.detailStatus = 'saved';
			else row.detailStatus = 'unsaved';
		}
		if (row.billId == null) row.billId = null;
		return recalcRow(row);
	}

	function buildMockRows() {
		var staffScenarios = [
			{
				plateNo: '浙F07033F',
				year: 2026,
				month: 1,
				billDay: 1,
				submitStatus: 'submitted',
				contractRent: 7200,
				receivableRent: 7200,
				receivedAmount: 7200,
				invoiceDate: '2026-01-16',
				paymentDate: '2026-01-27'
			},
			{
				plateNo: '浙F06909F',
				year: 2025,
				month: 9,
				billDay: 1,
				submitStatus: 'draft',
				contractRent: 6696,
				receivableRent: 6696,
				receivedAmount: 6696,
				invoiceDate: '2025-09-16',
				paymentDate: '2025-09-27'
			},
			{
				plateNo: '浙F39003F',
				year: 2025,
				month: 10,
				billDay: 1,
				submitStatus: 'draft',
				contractRent: 6696,
				receivableRent: 6696,
				receivedAmount: 6696,
				invoiceDate: '2025-10-16',
				paymentDate: '2025-10-27'
			}
		];
		var rows = OTHER_STAFF.map(function (staff, i) {
			var sc = staffScenarios[i] || staffScenarios[0];
			return finalizeMockRow({
				key: 'mock-' + (i + 1),
				createdBy: staff.id,
				maintainerName: staff.name,
				createdAt: nowDayjs(),
				year: sc.year,
				month: sc.month,
				billDate: mockBillDate(sc.year, sc.month, sc.billDay),
				dept: staff.dept,
				salesman: staff.name,
				plateNo: sc.plateNo,
				valueAddedService: '包氢租赁',
				exemptionPolicy: undefined,
				returnDate: '-',
				deposit: 0,
				contractRent: sc.contractRent,
				receivableRent: sc.receivableRent,
				maintPackageIncome: 0,
				insuranceSurcharge: 0,
				opsFeeIncome: 0,
				otherIncome: 0,
				mileageReduction: 0,
				otherReduction: 0,
				receivedAmount: sc.receivedAmount,
				invoiceDate: parseDateVal(sc.invoiceDate),
				paymentDate: parseDateVal(sc.paymentDate),
				paymentMethod: '月度后付',
				insuranceCost: 0,
				h2Cost: 0,
				opsCost: 0,
				intermediaryFee: 0,
				otherCost: 0,
				gpsMileage: null,
				reductionDetail: '',
				remark: '',
				submitStatus: sc.submitStatus,
				saveStatus: 'saved',
				submittedAt: sc.submitStatus === 'submitted' ? nowDayjs() : null
			});
		});

		var jan2026Bill = mockBillDate(2026, 1, 1);
		var feb2026Bill = mockBillDate(2026, 2, 1);
		var oct2025Bill = mockBillDate(2025, 10, 1);

		// 交车时间不匹配样例：浙F07033F 系统交车 2025-08-27，台账提车日期填 2025-09-01
		rows.push(finalizeMockRow({
			key: 'mock-pickup-mismatch',
			createdBy: 'u_chen',
			maintainerName: '陈高伟',
			createdAt: nowDayjs(),
			year: 2026,
			month: 1,
			billDate: jan2026Bill,
			plateNo: '浙F07033F',
			receivedAmount: 0,
			submitStatus: 'draft',
			saveStatus: 'saved',
			submittedAt: null,
			remark: '【样例】提车日期与系统交车日期不一致'
		}, {
			pickupDate: parseDateVal('2025-09-01'),
			remark: '【样例】提车日期与系统交车日期不一致'
		}));

		// 合同日期不匹配样例：账单日 2026-01-01 应匹配续签合同 2025-12-01～2026-11-30
		rows.push(finalizeMockRow({
			key: 'mock-contract-mismatch',
			createdBy: 'u_chen',
			maintainerName: '陈高伟',
			createdAt: nowDayjs(),
			year: 2026,
			month: 1,
			billDate: jan2026Bill,
			plateNo: '浙F07033F',
			receivedAmount: 0,
			submitStatus: 'draft',
			saveStatus: 'saved',
			submittedAt: null,
			remark: '【样例】合同日期与账单日所在合同不一致'
		}, {
			contractStart: parseDateVal('2025-09-01'),
			contractEnd: parseDateVal('2025-11-30'),
			remark: '【样例】合同日期与账单日所在合同不一致'
		}));

		// 还车时间不匹配样例：沪A12345 系统还车 2025-10-15，台账退车日期填 2025-10-20（账单月 2025-10）
		rows.push(finalizeMockRow({
			key: 'mock-return-mismatch',
			createdBy: 'u_chen',
			maintainerName: '陈高伟',
			createdAt: nowDayjs(),
			year: 2025,
			month: 10,
			billDate: oct2025Bill,
			plateNo: '沪A12345',
			receivedAmount: 0,
			submitStatus: 'draft',
			saveStatus: 'saved',
			submittedAt: null,
			remark: '【样例】退车日期与系统还车时间不一致'
		}, {
			returnDate: parseDateVal('2025-10-20'),
			remark: '【样例】退车日期与系统还车时间不一致'
		}));

		// 押金不匹配样例：浙F03218F 系统押金 10000，台账填 9500（保存后显示警告）
		rows.push(finalizeMockRow({
			key: 'mock-deposit-mismatch',
			createdBy: 'u_chen',
			maintainerName: '陈高伟',
			createdAt: nowDayjs(),
			year: 2026,
			month: 2,
			billDate: feb2026Bill,
			plateNo: '浙F03218F',
			receivedAmount: 0,
			submitStatus: 'draft',
			saveStatus: 'saved',
			submittedAt: null,
			remark: '【样例】押金与系统不一致（保存后显示警告）'
		}, {
			deposit: 9500,
			remark: '【样例】押金与系统不一致（保存后显示警告）'
		}));

		// 合同标的租金不匹配样例：浙F07033F 账单日 2026-01-01 系统租金 7200，台账填 6696
		rows.push(finalizeMockRow({
			key: 'mock-contract-rent-mismatch',
			createdBy: 'u_chen',
			maintainerName: '陈高伟',
			createdAt: nowDayjs(),
			year: 2026,
			month: 1,
			billDate: jan2026Bill,
			plateNo: '浙F07033F',
			receivedAmount: 0,
			submitStatus: 'draft',
			saveStatus: 'saved',
			submittedAt: null,
			remark: '【样例】合同标的租金与系统不一致（保存后显示警告）'
		}, {
			contractRent: 6696,
			receivableRent: 6696,
			remark: '【样例】合同标的租金与系统不一致（保存后显示警告）'
		}));

		return rows;
	}

	function getRowInvalidMap(row) {
		var inv = {};
		if (!row.year) inv.year = true;
		if (!row.month) inv.month = true;
		if (isEmptyStr(row.dept)) inv.dept = true;
		if (isEmptyStr(row.salesman)) inv.salesman = true;
		if (!row.billDate) inv.billDate = true;
		if (isEmptyStr(row.plateNo)) inv.plateNo = true;
		if (isEmptyStr(row.customerName)) inv.customerName = true;
		return inv;
	}

	function canViewRow(row, user, supervisor) {
		if (supervisor) return true;
		return row && row.createdBy === user.id;
	}

	function canEditRow(row, user, supervisor, editingKeys) {
		if (!row) return false;
		var ds = getDetailStatus(row);
		if (ds === 'bill_generated' || ds === 'approving') return false;
		if (ds === 'approved') {
			return supervisor && editingKeys.indexOf(row.key) >= 0;
		}
		if (ds === 'saved') {
			if (supervisor) return editingKeys.indexOf(row.key) >= 0;
			if (row.createdBy !== user.id) return false;
			return editingKeys.indexOf(row.key) >= 0;
		}
		if (supervisor) return false;
		if (row.createdBy !== user.id) return false;
		return true;
	}

	function canDeleteRow(row, user, supervisor) {
		var ds = getDetailStatus(row);
		if (ds === 'approved') return supervisor;
		if (ds === 'approving' || ds === 'bill_generated') return false;
		if (supervisor) return true;
		return row && row.createdBy === user.id;
	}

	var userState = useState(CURRENT_USER);
	var currentUser = userState[0];
	var isSupervisor = isSupervisorRole(currentUser);

	var rowsState = useState(buildMockRows);
	var allRows = rowsState[0];
	var setAllRows = rowsState[1];

	var editingKeysState = useState([]);
	var editingKeys = editingKeysState[0];
	var setEditingKeys = editingKeysState[1];

	var rowInvalidState = useState({});
	var rowInvalid = rowInvalidState[0];
	var setRowInvalid = rowInvalidState[1];
	var depositWarnKeysState = useState({});
	var depositWarnKeys = depositWarnKeysState[0];
	var setDepositWarnKeys = depositWarnKeysState[1];
	var contractRentWarnKeysState = useState({});
	var contractRentWarnKeys = contractRentWarnKeysState[0];
	var setContractRentWarnKeys = contractRentWarnKeysState[1];

	var importModalState = useState(false);
	var importModalOpen = importModalState[0];
	var setImportModalOpen = importModalState[1];

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	var yearDraftState = useState(undefined);
	var yearDraft = yearDraftState[0];
	var setYearDraft = yearDraftState[1];
	var monthDraftState = useState(undefined);
	var monthDraft = monthDraftState[0];
	var setMonthDraft = monthDraftState[1];
	var deptDraftState = useState(undefined);
	var deptDraft = deptDraftState[0];
	var setDeptDraft = deptDraftState[1];
	var salesmanDraftState = useState(undefined);
	var salesmanDraft = salesmanDraftState[0];
	var setSalesmanDraft = salesmanDraftState[1];
	var plateDraftState = useState(undefined);
	var plateDraft = plateDraftState[0];
	var setPlateDraft = plateDraftState[1];
	var customerDraftState = useState(undefined);
	var customerDraft = customerDraftState[0];
	var setCustomerDraft = customerDraftState[1];
	var statusDraftState = useState(undefined);
	var statusDraft = statusDraftState[0];
	var setStatusDraft = statusDraftState[1];
	var billRangeDraftState = useState(null);
	var billRangeDraft = billRangeDraftState[0];
	var setBillRangeDraft = billRangeDraftState[1];

	var yearAppliedState = useState(undefined);
	var yearApplied = yearAppliedState[0];
	var setYearApplied = yearAppliedState[1];
	var monthAppliedState = useState(undefined);
	var monthApplied = monthAppliedState[0];
	var setMonthApplied = monthAppliedState[1];
	var deptAppliedState = useState(undefined);
	var deptApplied = deptAppliedState[0];
	var setDeptApplied = deptAppliedState[1];
	var salesmanAppliedState = useState(undefined);
	var salesmanApplied = salesmanAppliedState[0];
	var setSalesmanApplied = salesmanAppliedState[1];
	var plateAppliedState = useState(undefined);
	var plateApplied = plateAppliedState[0];
	var setPlateApplied = plateAppliedState[1];
	var customerAppliedState = useState(undefined);
	var customerApplied = customerAppliedState[0];
	var setCustomerApplied = customerAppliedState[1];
	var statusAppliedState = useState(undefined);
	var statusApplied = statusAppliedState[0];
	var setStatusApplied = statusAppliedState[1];
	var billRangeAppliedState = useState(null);
	var billRangeApplied = billRangeAppliedState[0];
	var setBillRangeApplied = billRangeAppliedState[1];

	var billsState = useState([]);
	var bills = billsState[0];
	var setBills = billsState[1];

	var selectedRowKeysState = useState([]);
	var selectedRowKeys = selectedRowKeysState[0];
	var setSelectedRowKeys = selectedRowKeysState[1];

	var billPreviewOpenState = useState(false);
	var billPreviewOpen = billPreviewOpenState[0];
	var setBillPreviewOpen = billPreviewOpenState[1];

	var billPreviewIndexState = useState(0);
	var billPreviewIndex = billPreviewIndexState[0];
	var setBillPreviewIndex = billPreviewIndexState[1];

	var previewBillsState = useState([]);
	var previewBills = previewBillsState[0];
	var setPreviewBills = previewBillsState[1];

	var billManageOpenState = useState(false);
	var billManageOpen = billManageOpenState[0];
	var setBillManageOpen = billManageOpenState[1];

	var latestRefs = useRef({});
	latestRefs.current = {
		setAllRows: setAllRows,
		setRowInvalid: setRowInvalid,
		rowInvalid: rowInvalid,
		currentUser: currentUser,
		isSupervisor: isSupervisor,
		editingKeys: editingKeys,
		setEditingKeys: setEditingKeys,
		depositWarnKeys: depositWarnKeys,
		setDepositWarnKeys: setDepositWarnKeys,
		contractRentWarnKeys: contractRentWarnKeys,
		setContractRentWarnKeys: setContractRentWarnKeys
	};

	var visibleRows = useMemo(function () {
		var list = allRows.filter(function (r) {
			return canViewRow(r, currentUser, isSupervisor);
		});
		if (yearApplied != null) list = list.filter(function (r) { return r.year === yearApplied; });
		if (monthApplied != null) list = list.filter(function (r) { return r.month === monthApplied; });
		if (deptApplied) list = list.filter(function (r) { return r.dept === deptApplied; });
		if (salesmanApplied) list = list.filter(function (r) { return r.salesman === salesmanApplied; });
		if (plateApplied) list = list.filter(function (r) { return r.plateNo === plateApplied; });
		if (customerApplied) {
			var q = String(customerApplied).toLowerCase();
			list = list.filter(function (r) {
				return String(r.customerName || '').toLowerCase().indexOf(q) >= 0;
			});
		}
		if (statusApplied) list = list.filter(function (r) { return getDetailStatus(r) === statusApplied; });
		if (billRangeApplied && billRangeApplied[0] && billRangeApplied[1] && window.dayjs) {
			var start = window.dayjs(billRangeApplied[0]).startOf('day');
			var end = window.dayjs(billRangeApplied[1]).endOf('day');
			list = list.filter(function (r) {
				if (!r.billDate) return false;
				var d = window.dayjs(r.billDate);
				return d.isAfter(start.subtract(1, 'ms')) && d.isBefore(end.add(1, 'ms'));
			});
		}
		list.sort(function (a, b) {
			var ta = rowDisplaySortTier(a);
			var tb = rowDisplaySortTier(b);
			if (ta !== tb) return ta - tb;
			return String(b.key).localeCompare(String(a.key));
		});
		return list.map(function (r, idx) {
			return Object.assign({}, r, { seq: idx + 1, displayTier: rowDisplaySortTier(r) });
		});
	}, [
		allRows, currentUser, isSupervisor,
		yearApplied, monthApplied, deptApplied, salesmanApplied,
		plateApplied, customerApplied, statusApplied, billRangeApplied
	]);

	var rowsForStats = useMemo(function () {
		var list = allRows.filter(function (r) {
			return canViewRow(r, currentUser, isSupervisor);
		});
		if (yearApplied != null) list = list.filter(function (r) { return r.year === yearApplied; });
		if (monthApplied != null) list = list.filter(function (r) { return r.month === monthApplied; });
		if (deptApplied) list = list.filter(function (r) { return r.dept === deptApplied; });
		if (salesmanApplied) list = list.filter(function (r) { return r.salesman === salesmanApplied; });
		if (plateApplied) list = list.filter(function (r) { return r.plateNo === plateApplied; });
		if (customerApplied) {
			var q = String(customerApplied).toLowerCase();
			list = list.filter(function (r) {
				return String(r.customerName || '').toLowerCase().indexOf(q) >= 0;
			});
		}
		if (statusApplied) list = list.filter(function (r) { return getDetailStatus(r) === statusApplied; });
		if (billRangeApplied && billRangeApplied[0] && billRangeApplied[1] && window.dayjs) {
			var start = window.dayjs(billRangeApplied[0]).startOf('day');
			var end = window.dayjs(billRangeApplied[1]).endOf('day');
			list = list.filter(function (r) {
				if (!r.billDate) return false;
				var d = window.dayjs(r.billDate);
				return d.isAfter(start.subtract(1, 'ms')) && d.isBefore(end.add(1, 'ms'));
			});
		}
		return list;
	}, [
		allRows, currentUser, isSupervisor,
		yearApplied, monthApplied, deptApplied, salesmanApplied,
		plateApplied, customerApplied, statusApplied, billRangeApplied
	]);

	var statSummary = useMemo(function () {
		return rowsForStats.reduce(function (acc, r) {
			acc.receivableTotal += numOrZero(r.receivableTotal);
			acc.receivedAmount += numOrZero(r.receivedAmount);
			acc.unreceived += numOrZero(r.unreceived);
			acc.totalCost += numOrZero(r.totalCost);
			acc.profitLoss += numOrZero(r.profitLoss);
			return acc;
		}, { count: rowsForStats.length, receivableTotal: 0, receivedAmount: 0, unreceived: 0, totalCost: 0, profitLoss: 0 });
	}, [rowsForStats]);

	var salesmanOptions = useMemo(function () {
		var names = {};
		OTHER_STAFF.forEach(function (s) { names[s.name] = true; });
		allRows.forEach(function (r) { if (r.salesman) names[r.salesman] = true; });
		return Object.keys(names).map(function (n) { return { value: n, label: n }; });
	}, [allRows]);

	var plateOptions = useMemo(function () {
		var map = {};
		LEASE_PLATE_MASTER.forEach(function (item) { map[item.plateNo] = item; });
		allRows.forEach(function (r) {
			if (r.plateNo && !map[r.plateNo]) map[r.plateNo] = { plateNo: r.plateNo };
		});
		return Object.keys(map).map(function (p) {
			return { value: p, label: p };
		});
	}, [allRows]);

	var updateRow = useCallback(function (key, patch) {
		setAllRows(function (prev) {
			return prev.map(function (r) {
				if (r.key !== key) return r;
				return recalcRow(Object.assign({}, r, patch));
			});
		});
	}, []);

	function applyDepositWarnings(rows) {
		var mismatchCount = 0;
		var next = {};
		(rows || []).forEach(function (r) {
			if (isDepositMismatch(r.plateNo, r.billDate, r.deposit)) {
				next[r.key] = true;
				mismatchCount += 1;
			}
		});
		setDepositWarnKeys(function (prev) {
			var merged = Object.assign({}, prev);
			(rows || []).forEach(function (r) {
				if (next[r.key]) merged[r.key] = true;
				else delete merged[r.key];
			});
			return merged;
		});
		return mismatchCount;
	}

	function applyContractRentWarnings(rows) {
		var mismatchCount = 0;
		var next = {};
		(rows || []).forEach(function (r) {
			if (isContractRentMismatch(r.plateNo, r.billDate, r.contractRent)) {
				next[r.key] = true;
				mismatchCount += 1;
			}
		});
		setContractRentWarnKeys(function (prev) {
			var merged = Object.assign({}, prev);
			(rows || []).forEach(function (r) {
				if (next[r.key]) merged[r.key] = true;
				else delete merged[r.key];
			});
			return merged;
		});
		return mismatchCount;
	}

	function buildSaveMismatchMessage(depositCount, contractRentCount, actionLabel) {
		var parts = [];
		if (depositCount > 0) parts.push(depositCount + ' 条押金');
		if (contractRentCount > 0) parts.push(contractRentCount + ' 条合同标的租金');
		if (!parts.length) return '';
		return '已' + actionLabel + '，但有 ' + parts.join('、') + ' 与系统不一致，请核对';
	}

	function validateRows(rows) {
		var allInvalid = {};
		var firstMsg = '';
		(rows || []).forEach(function (r, idx) {
			var inv = getRowInvalidMap(r);
			if (Object.keys(inv).length) {
				allInvalid[r.key] = inv;
				if (!firstMsg) firstMsg = '第' + (r.seq || idx + 1) + '行请完善必填项（年份/月份/部门/业务员/账单日期/车牌/客户）';
			}
		});
		if (firstMsg) {
			setRowInvalid(allInvalid);
			message.warning(firstMsg);
			return false;
		}
		setRowInvalid({});
		return true;
	}

	var handleSave = useCallback(function () {
		var toSave = allRows.filter(function (r) {
			return r.createdBy === currentUser.id && getDetailStatus(r) === 'unsaved';
		});
		if (!toSave.length) {
			message.info('暂无待保存的记录');
			return;
		}
		if (!validateRows(toSave)) return;
		var depositMismatchCount = applyDepositWarnings(toSave);
		var contractRentMismatchCount = applyContractRentWarnings(toSave);
		setAllRows(function (prev) {
			return prev.map(function (r) {
				if (r.createdBy === currentUser.id && getDetailStatus(r) === 'unsaved') {
					return Object.assign({}, r, { saveStatus: 'saved', detailStatus: 'saved' });
				}
				return r;
			});
		});
		setEditingKeys([]);
		var mismatchMsg = buildSaveMismatchMessage(depositMismatchCount, contractRentMismatchCount, '保存');
		if (mismatchMsg) {
			message.warning(mismatchMsg);
		} else {
			message.success('已保存');
		}
	}, [allRows, currentUser]);

	var patchBillInLists = useCallback(function (billId, patch) {
		setBills(function (prev) {
			return prev.map(function (b) {
				if (b.id !== billId) return b;
				return Object.assign({}, b, patch);
			});
		});
		setPreviewBills(function (prev) {
			return prev.map(function (b) {
				if (b.id !== billId) return b;
				return Object.assign({}, b, patch);
			});
		});
	}, []);

	var patchRowsByBillId = useCallback(function (billId, patch) {
		setAllRows(function (prev) {
			return prev.map(function (r) {
				if (r.billId !== billId) return r;
				return Object.assign({}, r, patch);
			});
		});
	}, []);

	var handleSubmitCollectionApproval = useCallback(function () {
		if (isSupervisor) {
			message.info('客服主管无需提交收款审批');
			return;
		}
		if (!selectedRowKeys.length) {
			message.warning('请先勾选已保存的明细记录');
			return;
		}
		var selected = allRows.filter(function (r) {
			return selectedRowKeys.indexOf(r.key) >= 0;
		});
		if (selected.some(function (r) { return !canSelectDetailRow(r); })) {
			message.warning('仅「已保存」状态的记录可提交收款审批');
			return;
		}
		if (!validateRows(selected)) return;
		var newBills = buildBillsFromRows(selected);
		if (!newBills.length) {
			message.error('未能生成账单，请检查所选记录');
			return;
		}
		var billIdMap = {};
		newBills.forEach(function (b) {
			b.rowKeys.forEach(function (k) { billIdMap[k] = b.id; });
		});
		setBills(function (prev) { return prev.concat(newBills); });
		setAllRows(function (prev) {
			return prev.map(function (r) {
				if (!billIdMap[r.key]) return r;
				return Object.assign({}, r, {
					detailStatus: 'bill_generated',
					billId: billIdMap[r.key],
					saveStatus: 'saved'
				});
			});
		});
		setSelectedRowKeys([]);
		setPreviewBills(newBills);
		setBillPreviewIndex(0);
		setBillPreviewOpen(true);
		var customerCount = {};
		newBills.forEach(function (b) { customerCount[b.customerName] = true; });
		var customerN = Object.keys(customerCount).length;
		message.success('已按客户·账单月·项目拆分生成 ' + newBills.length + ' 份账单'
			+ (customerN > 1 ? '（涉及 ' + customerN + ' 个客户）' : '')
			+ '，请逐份确认');
	}, [allRows, currentUser, isSupervisor, selectedRowKeys]);

	var handleGenerateBillPdf = useCallback(function (bill) {
		openLeaseBillPdf(bill);
		patchBillInLists(bill.id, { pdfGenerated: true });
		message.success('已打开对账单预览，可在打印对话框中保存为 PDF');
	}, [patchBillInLists]);

	var handleStartBillApproval = useCallback(function (bill) {
		if (!bill || bill.status === 'approving' || bill.status === 'approved') return;
		patchBillInLists(bill.id, { status: 'approving' });
		patchRowsByBillId(bill.id, { detailStatus: 'approving' });
		message.success('收款审批已发起');
		var idx = previewBills.findIndex(function (b) { return b.id === bill.id; });
		if (idx >= 0 && idx < previewBills.length - 1) {
			setBillPreviewIndex(idx + 1);
		} else {
			setBillPreviewOpen(false);
		}
	}, [patchBillInLists, patchRowsByBillId, previewBills]);

	var handleCancelBill = useCallback(function (bill) {
		if (!bill) return;
		if (bill.status === 'approving') {
			message.warning('审批中的账单无法取消，请先撤回');
			return;
		}
		patchRowsByBillId(bill.id, { detailStatus: 'saved', billId: null });
		patchBillInLists(bill.id, { status: 'cancelled' });
		message.success('已取消账单，明细已释放为「已保存」');
	}, [patchBillInLists, patchRowsByBillId]);

	var handleWithdrawBill = useCallback(function (bill) {
		if (!bill || bill.status !== 'approving') {
			message.warning('仅审批中的账单可撤回');
			return;
		}
		patchBillInLists(bill.id, { status: 'preview' });
		patchRowsByBillId(bill.id, { detailStatus: 'bill_generated' });
		message.success('已撤回收款审批');
	}, [patchBillInLists, patchRowsByBillId]);

	var handleFinanceApproveBill = useCallback(function (bill, step) {
		if (!bill || bill.status !== 'approving') return;
		var patch = {};
		if (bill.invoiceMode === 'first' && step === 1) {
			patch.invoiceAttachment = { name: '发票-' + bill.projectName + '.pdf', url: '#' };
			patch.invoiceStep = 1;
			patchBillInLists(bill.id, patch);
			message.success('财务第一步审批完成，发票附件已上传');
			return;
		}
		patch.receiptAttachment = { name: '收款凭据-' + bill.projectName + '.pdf', url: '#' };
		patch.arrivalAmount = bill.receivedTotal;
		if (bill.invoiceMode === 'after' || bill.invoiceMode === 'first') {
			patch.invoiceAttachment = patch.invoiceAttachment || { name: '发票-' + bill.projectName + '.pdf', url: '#' };
		}
		patch.status = 'approved';
		patch.invoiceStep = 2;
		patchBillInLists(bill.id, patch);
		patchRowsByBillId(bill.id, { detailStatus: 'approved', submitStatus: 'submitted' });
		message.success('财务审批完成，账单与明细已闭环');
	}, [patchBillInLists, patchRowsByBillId]);

	var handleFinanceRejectBill = useCallback(function (bill) {
		if (!bill || bill.status !== 'approving') return;
		patchBillInLists(bill.id, { status: 'rejected' });
		patchRowsByBillId(bill.id, { detailStatus: 'bill_generated' });
		message.warning('审批已驳回，可取消账单后修改明细重新提交');
	}, [patchBillInLists, patchRowsByBillId]);

	var openBillPreviewFromManage = useCallback(function (bill) {
		var pending = bills.filter(function (b) {
			return b.status === 'preview' || b.status === 'rejected';
		});
		var idx = pending.findIndex(function (b) { return b.id === bill.id; });
		if (idx < 0) pending = [bill];
		else pending = pending.slice(idx).concat(pending.slice(0, idx));
		setPreviewBills(pending);
		setBillPreviewIndex(0);
		setBillPreviewOpen(true);
		setBillManageOpen(false);
	}, [bills]);

	var addRow = useCallback(function () {
		var row = buildEmptyRow(Object.assign({}, currentUser, {
			dept: OTHER_STAFF.filter(function (s) { return s.id === currentUser.id; })[0]
				? OTHER_STAFF.filter(function (s) { return s.id === currentUser.id; })[0].dept
				: undefined
		}));
		setAllRows(function (prev) { return prev.concat([row]); });
		message.success('已新增一行草稿');
	}, [currentUser]);

	var handleQuery = useCallback(function () {
		setYearApplied(yearDraft);
		setMonthApplied(monthDraft);
		setDeptApplied(deptDraft);
		setSalesmanApplied(salesmanDraft);
		setPlateApplied(plateDraft);
		setCustomerApplied(customerDraft);
		setStatusApplied(statusDraft);
		setBillRangeApplied(billRangeDraft);
		message.success('查询成功');
	}, [yearDraft, monthDraft, deptDraft, salesmanDraft, plateDraft, customerDraft, statusDraft, billRangeDraft]);

	var handleReset = useCallback(function () {
		setYearDraft(undefined);
		setMonthDraft(undefined);
		setDeptDraft(undefined);
		setSalesmanDraft(undefined);
		setPlateDraft(undefined);
		setCustomerDraft(undefined);
		setStatusDraft(undefined);
		setBillRangeDraft(null);
		setYearApplied(undefined);
		setMonthApplied(undefined);
		setDeptApplied(undefined);
		setSalesmanApplied(undefined);
		setPlateApplied(undefined);
		setCustomerApplied(undefined);
		setStatusApplied(undefined);
		setBillRangeApplied(null);
	}, []);

	var renderFilterField = useCallback(function (label, control) {
		return React.createElement('div', { className: 'lc-filter-field' },
			React.createElement('span', { className: 'lc-filter-field-label' }, label),
			React.createElement('div', { className: 'lc-filter-field-control' }, control)
		);
	}, []);

	var renderStatCard = useCallback(function (card, displayValue, valueClass) {
		return React.createElement('div', {
			key: card.key,
			className: 'lc-alert-card lc-alert-card--' + card.type,
			'aria-label': card.title + '：' + displayValue
		},
			React.createElement('div', { className: 'lc-alert-card-tip-anchor' },
				React.createElement(Tooltip, { title: card.desc, placement: 'topRight', overlayStyle: { maxWidth: 320 } },
					React.createElement('span', {
						className: 'lc-alert-card-tip',
						role: 'img',
						'aria-label': card.title + '说明'
					},
						leaseSvgIcon([{ tag: 'circle', cx: 12, cy: 12, r: 10 }, { tag: 'line', x1: 12, y1: 16, x2: 12, y2: 12 }, { tag: 'line', x1: 12, y1: 8, x2: 12.01, y2: 8 }], 12)
					)
				)
			),
			React.createElement('div', { className: 'lc-alert-card-icon', 'aria-hidden': true }, leaseKpiIcon(card.key)),
			React.createElement('div', { className: 'lc-alert-card-main' },
				React.createElement('div', { className: 'lc-alert-card-title' }, card.title),
				React.createElement('div', { className: 'lc-alert-card-val' + (valueClass ? ' ' + valueClass : '') }, displayValue)
			)
		);
	}, []);

	function downloadImportTemplate() {
		var csv = IMPORT_HEADERS.join(',') + '\n' +
			'2026,1,,,' + currentUser.name + ',2026-01-01,浙F07033F,,,包氢租赁,,,,6696,6696,0,0,0,6696,月度后付,导入示例（车型/客户由车牌自动带出）';
		var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
		var a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = '租赁业务台账导入模板.csv';
		a.click();
		URL.revokeObjectURL(a.href);
	}

	function parseImportCsv(text) {
		var lines = String(text || '').split(/\r?\n/).filter(function (l) { return l.trim(); });
		if (lines.length < 2) return [];
		var imported = [];
		for (var i = 1; i < lines.length; i++) {
			var cols = lines[i].split(',');
			if (!cols[5]) continue;
			var plateNo = cols[5];
			imported.push(
				recalcRow(Object.assign({
					key: nextRowKey(),
					createdBy: currentUser.id,
					maintainerName: currentUser.name,
					createdAt: nowDayjs(),
					year: Number(cols[0]) || 2026,
					month: Number(cols[1]) || 1,
					dept: cols[2] || undefined,
					salesman: cols[3] || currentUser.name,
					billDate: parseDateVal(cols[4]),
					plateNo: plateNo,
					valueAddedService: cols[8] || undefined,
					exemptionPolicy: cols[9] || undefined,
					pickupDate: parseDateVal(cols[10]),
					contractStart: parseDateVal(cols[11]),
					contractEnd: parseDateVal(cols[12]),
					contractRent: numOrZero(cols[13]),
					monthlyRent: numOrZero(cols[14]),
					insuranceSurcharge: numOrZero(cols[15]),
					opsFeeIncome: numOrZero(cols[16]),
					otherIncome: numOrZero(cols[17]),
					receivedAmount: numOrZero(cols[18]),
					paymentMethod: cols[19] || undefined,
					remark: cols[20] || '',
					receivableRent: numOrZero(cols[13]),
					maintPackageIncome: 0,
					mileageReduction: 0,
					otherReduction: 0,
					deposit: 0,
					vehicleActualCost: 0,
					insuranceCost: 0,
					h2Cost: 0,
					opsCost: 0,
					intermediaryFee: 0,
					otherCost: 0,
					submitStatus: 'draft',
					saveStatus: 'unsaved',
					detailStatus: 'unsaved',
					billId: null,
					submittedAt: null
				}, mergePlateAndContractPatch(plateNo, parseDateVal(cols[4]))))
			);
		}
		return imported;
	}

	var handleImportFile = useCallback(function (file) {
		var reader = new FileReader();
		reader.onload = function (e) {
			var rows = parseImportCsv(e.target.result);
			if (!rows.length) {
				message.error('未解析到有效数据，请检查模板格式');
				return;
			}
			setAllRows(function (prev) { return prev.concat(rows); });
			setImportModalOpen(false);
			message.success('已导入 ' + rows.length + ' 条草稿记录');
		};
		reader.readAsText(file, 'UTF-8');
		return false;
	}, [currentUser]);

	var columns = useMemo(function () {
		var cellSelectDropdown = {
			dropdownMatchSelectWidth: false,
			popupClassName: 'lease-cell-select-dropdown',
			dropdownStyle: { borderRadius: 8 }
		};

		function cellInputNumber(props) {
			return React.createElement(InputNumber, Object.assign({
				className: 'lease-cell-input-number',
				style: { width: '100%' }
			}, props));
		}

		function cellInput(props) {
			return React.createElement(Input, Object.assign({
				size: 'small',
				className: 'lease-cell-input',
				style: { width: '100%' }
			}, props));
		}

		function cellDatePicker(props) {
			return React.createElement(DatePicker, Object.assign({
				size: 'small',
				className: 'lease-cell-date',
				format: 'YYYY-MM-DD',
				allowClear: true,
				style: { width: '100%' }
			}, props));
		}

		function cellSelect(props) {
			return React.createElement(Select, Object.assign({
				size: 'small',
				className: 'lease-cell-select'
			}, cellSelectDropdown, props));
		}

		function cellPlateSelect(props) {
			return React.createElement(Select, Object.assign({
				size: 'small',
				className: 'lease-cell-select lease-cell-select-plate',
				showSearch: true,
				allowClear: true,
				placeholder: '请选择车牌',
				optionLabelProp: 'value',
				filterOption: filterOption,
				dropdownMatchSelectWidth: false,
				popupClassName: 'lease-plate-select-dropdown',
				dropdownStyle: { borderRadius: 8, minWidth: 112 }
			}, props));
		}

		function patch(key, field, val) {
			var ref = latestRefs.current;
			var patchObj = {};
			patchObj[field] = val;
			ref.setAllRows(function (prev) {
				return prev.map(function (r) {
					if (r.key !== key) return r;
					var nextPatch = enrichBillingPeriodPatch(r, patchObj);
					var nextRow = Object.assign({}, r, nextPatch);
					if (field === 'billDate') {
						Object.assign(nextRow, buildContractAutoPatch(r.plateNo, nextPatch.billDate));
					}
					return recalcRow(nextRow);
				});
			});
			if (field === 'deposit' || field === 'contractRent' || field === 'plateNo' || field === 'billDate') {
				if (field === 'deposit' || field === 'plateNo' || field === 'billDate') {
					ref.setDepositWarnKeys(function (prev) {
						if (!prev[key]) return prev;
						var next = Object.assign({}, prev);
						delete next[key];
						return next;
					});
				}
				if (field === 'contractRent' || field === 'plateNo' || field === 'billDate') {
					ref.setContractRentWarnKeys(function (prev) {
						if (!prev[key]) return prev;
						var next = Object.assign({}, prev);
						delete next[key];
						return next;
					});
				}
			}
		}

		function patchPlate(key, plateNo) {
			var ref = latestRefs.current;
			if (plateNo && !LEASE_PLATE_CONTEXT_MAP[plateNo]) {
				message.warning('未在系统中找到车牌「' + plateNo + '」的关联信息');
			}
			ref.setAllRows(function (prev) {
				return prev.map(function (r) {
					if (r.key !== key) return r;
					return recalcRow(Object.assign({}, r, mergePlateAndContractPatch(plateNo, r.billDate)));
				});
			});
			ref.setDepositWarnKeys(function (prev) {
				if (!prev[key]) return prev;
				var next = Object.assign({}, prev);
				delete next[key];
				return next;
			});
			ref.setContractRentWarnKeys(function (prev) {
				if (!prev[key]) return prev;
				var next = Object.assign({}, prev);
				delete next[key];
				return next;
			});
		}

		function patchBillDate(key, billDate) {
			var ref = latestRefs.current;
			ref.setAllRows(function (prev) {
				return prev.map(function (r) {
					if (r.key !== key) return r;
					var nextPatch = enrichBillingPeriodPatch(r, { billDate: billDate });
					return recalcRow(Object.assign({}, r, nextPatch, buildContractAutoPatch(r.plateNo, nextPatch.billDate || billDate)));
				});
			});
			ref.setDepositWarnKeys(function (prev) {
				if (!prev[key]) return prev;
				var next = Object.assign({}, prev);
				delete next[key];
				return next;
			});
			ref.setContractRentWarnKeys(function (prev) {
				if (!prev[key]) return prev;
				var next = Object.assign({}, prev);
				delete next[key];
				return next;
			});
		}

		function plainCell(v, align, cls) {
			return React.createElement('span', {
				className: 'lease-cell-plain' + (cls ? ' ' + cls : ''),
				style: { textAlign: align || 'center' }
			}, v === 0 || v === '0' ? v : v || '-');
		}

		function systemAutoCell(v, record) {
			if (record && !editable(record)) return plainCell(v || '-', 'center');
			return readOnly(v || '-', 'center', 'lease-cell-readonly');
		}

		function readOnly(v, align, cls) {
			return React.createElement('div', {
				className: cls || 'lease-cell-readonly',
				style: { textAlign: align || 'center' }
			}, v === 0 || v === '0' ? v : v || '-');
		}

		function calcCell(v, record, align, formatFn) {
			var text = formatFn ? formatFn(v) : v;
			align = align || 'right';
			if (!editable(record)) return plainCell(text, align, 'lease-cell-calc');
			return readOnly(text, align, 'lease-cell-readonly lease-cell-calc');
		}

		function fieldInvalid(record, field) {
			var inv = (latestRefs.current.rowInvalid && latestRefs.current.rowInvalid[record.key]) || {};
			return inv[field];
		}

		function editable(record) {
			return canEditRow(
				record,
				latestRefs.current.currentUser,
				latestRefs.current.isSupervisor,
				latestRefs.current.editingKeys
			);
		}

		function numCell(field, record, opts) {
			opts = opts || {};
			var v = record[field];
			if (!editable(record)) {
				return plainCell(fmtMoney(v), 'right', opts.calc ? 'lease-cell-calc' : '');
			}
			return cellInputNumber({
				min: opts.min != null ? opts.min : undefined,
				precision: 2,
				value: v == null || v === '' ? null : v,
				status: fieldInvalid(record, field) ? 'error' : undefined,
				onChange: function (val) { patch(record.key, field, val == null ? 0 : val); }
			});
		}

		function textCell(field, record, width) {
			var v = record[field];
			if (!editable(record)) return plainCell(v || '-', 'center');
			return cellInput({
				value: v,
				style: { width: width || '100%' },
				status: fieldInvalid(record, field) ? 'error' : undefined,
				onChange: function (e) { patch(record.key, field, e.target.value); }
			});
		}

		function dateCell(field, record) {
			var v = record[field];
			if (!editable(record)) return plainCell(formatDate(v) || '-', 'center');
			return cellDatePicker({
				value: v,
				status: fieldInvalid(record, field) ? 'error' : undefined,
				onChange: function (d) { patch(record.key, field, d); }
			});
		}

		function dateWarnWrap(inner, tooltipTitle) {
			if (!tooltipTitle) return inner;
			return React.createElement('div', { className: 'lease-date-warn-cell' },
				inner,
				React.createElement(Tooltip, { title: tooltipTitle, placement: 'top' },
					React.createElement('span', {
						role: 'img',
						'aria-label': tooltipTitle,
						style: { flexShrink: 0, color: '#f59e0b', display: 'inline-flex', cursor: 'help', lineHeight: 0 }
					}, LEASE_ICONS.warn)
				)
			);
		}

		function billDateCell(record) {
			var field = 'billDate';
			var v = record[field];
			var inner = editable(record)
				? cellDatePicker({
					value: v,
					status: fieldInvalid(record, field) ? 'error' : undefined,
					onChange: function (d) { patchBillDate(record.key, d); }
				})
				: plainCell(formatDate(v) || '-', 'center');
			if (!record.plateNo || !v) return inner;
			if (!getSystemContractForBillDate(record.plateNo, v)) {
				return dateWarnWrap(inner, '账单日不在系统任何合同有效期内');
			}
			return inner;
		}

		function contractStartCell(record) {
			var field = 'contractStart';
			var v = record[field];
			var inner = editable(record)
				? cellDatePicker({ value: v, onChange: function (d) { patch(record.key, field, d); } })
				: plainCell(formatDate(v) || '-', 'center');
			var sys = getSystemContractForBillDate(record.plateNo, record.billDate);
			if (isContractStartMismatch(record.plateNo, record.billDate, v) && sys) {
				return dateWarnWrap(inner, '系统合同生效日期：' + sys.contractStart);
			}
			return inner;
		}

		function contractEndCell(record) {
			var field = 'contractEnd';
			var v = record[field];
			var inner = editable(record)
				? cellDatePicker({ value: v, onChange: function (d) { patch(record.key, field, d); } })
				: plainCell(formatDate(v) || '-', 'center');
			var sys = getSystemContractForBillDate(record.plateNo, record.billDate);
			if (isContractEndMismatch(record.plateNo, record.billDate, v) && sys) {
				return dateWarnWrap(inner, '系统合同结束日期：' + sys.contractEnd);
			}
			return inner;
		}

		function pickupDateCell(record) {
			var field = 'pickupDate';
			var v = record[field];
			var inner = editable(record)
				? cellDatePicker({
					value: v,
					status: fieldInvalid(record, field) ? 'error' : undefined,
					onChange: function (d) { patch(record.key, field, d); }
				})
				: plainCell(formatDate(v) || '-', 'center');
			if (!isPickupDateMismatch(record.plateNo, v)) return inner;
			return dateWarnWrap(inner, '系统交车日期：' + getSystemDeliveryAt(record.plateNo));
		}

		function contractRentCell(record) {
			var field = 'contractRent';
			var v = record[field];
			var inner;
			if (!editable(record)) {
				inner = plainCell(fmtMoney(v), 'right');
			} else {
				inner = cellInputNumber({
					min: 0,
					precision: 2,
					placeholder: '手填',
					value: v == null || v === '' ? null : v,
					status: fieldInvalid(record, field) ? 'error' : undefined,
					onChange: function (val) { patch(record.key, field, val == null ? 0 : val); }
				});
			}
			var ref = latestRefs.current;
			if (!ref.contractRentWarnKeys || !ref.contractRentWarnKeys[record.key]) return inner;
			if (!isContractRentMismatch(record.plateNo, record.billDate, v)) return inner;
			return dateWarnWrap(inner, '系统合同标的租金：' + fmtMoney(getSystemContractRent(record.plateNo, record.billDate)));
		}

		function depositCell(record) {
			var field = 'deposit';
			var v = record[field];
			var inner;
			if (!editable(record)) {
				inner = plainCell(fmtMoney(v), 'right');
			} else {
				inner = cellInputNumber({
					min: 0,
					precision: 2,
					placeholder: '手填',
					value: v == null || v === '' ? null : v,
					status: fieldInvalid(record, field) ? 'error' : undefined,
					onChange: function (val) { patch(record.key, field, val == null ? 0 : val); }
				});
			}
			var ref = latestRefs.current;
			if (!ref.depositWarnKeys || !ref.depositWarnKeys[record.key]) return inner;
			if (!isDepositMismatch(record.plateNo, record.billDate, v)) return inner;
			return dateWarnWrap(inner, '系统押金：' + fmtMoney(getSystemDeposit(record.plateNo, record.billDate)));
		}

		function returnDateCell(record) {
			var v = record.returnDate;
			var inner;
			if (!editable(record)) {
				inner = plainCell((!v || v === '-') ? '-' : formatDate(v), 'center');
			} else {
				inner = cellDatePicker({
					placeholder: '未退车',
					value: v && v !== '-' ? v : null,
					onChange: function (d) { patch(record.key, 'returnDate', d); }
				});
			}
			if (!isReturnDateMismatch(record.plateNo, v)) return inner;
			var tip = getReturnDateMismatchTip(record.plateNo, v);
			if (!tip) return inner;
			return dateWarnWrap(inner, tip);
		}

		function ct(label, tipKey) {
			return leaseColTitle(label, LEASE_COLUMN_TIPS[tipKey]);
		}

		return [
			{ title: ct('序号', 'seq'), dataIndex: 'seq', width: 52, align: 'center' },
			{
				title: ct('状态', 'status'), key: 'status', width: 72, align: 'center',
				render: function (_, r) {
					var ds = getDetailStatus(r);
					var label = rowStatusLabel(r);
					return React.createElement(Tag, { color: detailStatusTagColor(ds), style: { margin: 0 } }, label);
				}
			},
			{ title: ct('维护人', 'maintainerName'), dataIndex: 'maintainerName', width: 72, align: 'center' },
			{
				title: ct('年份', 'year'), dataIndex: 'year', width: 68, align: 'center',
				render: function (v, r) {
					if (!editable(r)) return plainCell(v, 'center');
					return cellInputNumber({
						min: 2020, max: 2099, precision: 0,
						value: v, status: fieldInvalid(r, 'year') ? 'error' : undefined,
						onChange: function (val) { patch(r.key, 'year', val); }
					});
				}
			},
			{
				title: ct('月份', 'month'), dataIndex: 'month', width: 58, align: 'center',
				render: function (v, r) {
					if (!editable(r)) return plainCell(v, 'center');
					return cellInputNumber({
						min: 1, max: 12, precision: 0,
						value: v, status: fieldInvalid(r, 'month') ? 'error' : undefined,
						onChange: function (val) { patch(r.key, 'month', val); }
					});
				}
			},
			{
				title: ct('业务部门', 'dept'), dataIndex: 'dept', width: 96, align: 'center',
				render: function (v, r) {
					var invalid = fieldInvalid(r, 'dept');
					if (invalid && editable(r)) {
						return React.createElement('div', {
							className: 'lease-cell-readonly',
							style: { textAlign: 'center', border: '1px solid #ff4d4f', borderRadius: 4, color: '#ff4d4f' }
						}, v || '-');
					}
					if (invalid) {
						return React.createElement('span', {
							className: 'lease-cell-plain',
							style: { color: '#ef4444', textAlign: 'center', display: 'block' }
						}, v || '-');
					}
					return systemAutoCell(v, r);
				}
			},
			{
				title: ct('业务员', 'salesman'), dataIndex: 'salesman', width: 80, align: 'center',
				render: function (v, r) {
					var invalid = fieldInvalid(r, 'salesman');
					if (invalid && editable(r)) {
						return React.createElement('div', {
							className: 'lease-cell-readonly',
							style: { textAlign: 'center', border: '1px solid #ff4d4f', borderRadius: 4, color: '#ff4d4f' }
						}, v || '-');
					}
					if (invalid) return React.createElement('span', { className: 'lease-cell-plain', style: { color: '#ef4444', textAlign: 'center', display: 'block' } }, v || '-');
					return systemAutoCell(v, r);
				}
			},
			{ title: ct('账单日期', 'billDate'), dataIndex: 'billDate', width: 128, align: 'center', render: function (v, r) { return billDateCell(r); } },
			{
				title: ct('车牌号码', 'plateNo'), dataIndex: 'plateNo', width: 112, align: 'center',
				render: function (v, r) {
					if (!editable(r)) return plainCell(v || '-', 'center');
					return cellPlateSelect({
						style: { width: '100%' },
						value: v,
						options: plateOptions,
						status: fieldInvalid(r, 'plateNo') ? 'error' : undefined,
						onChange: function (val) { patchPlate(r.key, val); }
					});
				}
			},
			{
				title: ct('车型', 'vehicleModel'), dataIndex: 'vehicleModel', width: 120, align: 'center',
				render: function (v, r) {
					var invalid = fieldInvalid(r, 'vehicleModel');
					if (invalid && editable(r)) {
						return React.createElement('div', {
							className: 'lease-cell-readonly',
							style: { textAlign: 'center', border: '1px solid #ff4d4f', borderRadius: 4, color: '#ff4d4f' }
						}, v || '-');
					}
					if (invalid) {
						return React.createElement('span', {
							className: 'lease-cell-plain',
							style: { color: '#ef4444', textAlign: 'center', display: 'block' }
						}, v || '-');
					}
					return systemAutoCell(v, r);
				}
			},
			{
				title: ct('客户名称', 'customerName'), dataIndex: 'customerName', width: 160, align: 'center',
				render: function (v, r) {
					var invalid = fieldInvalid(r, 'customerName');
					if (invalid && editable(r)) {
						return React.createElement('div', {
							className: 'lease-cell-readonly',
							style: { textAlign: 'center', border: '1px solid #ff4d4f', borderRadius: 4, color: '#ff4d4f' }
						}, v || '-');
					}
					if (invalid) {
						return React.createElement('span', {
							className: 'lease-cell-plain',
							style: { color: '#ef4444', textAlign: 'center', display: 'block' }
						}, v || '-');
					}
					return systemAutoCell(v, r);
				}
			},
			{
				title: ct('增值费用', 'valueAddedService'), dataIndex: 'valueAddedService', width: 110, align: 'center',
				render: function (v, r) {
					if (!editable(r)) return plainCell(v || '-', 'center');
					return cellSelect({
						allowClear: true,
						showSearch: true,
						placeholder: '请选择',
						style: { width: '100%' },
						dropdownStyle: { borderRadius: 8, minWidth: 140 },
						value: v || undefined,
						options: VALUE_ADDED_OPTIONS,
						filterOption: filterOption,
						onChange: function (val) { patch(r.key, 'valueAddedService', val); }
					});
				}
			},
			{
				title: ct('享免政策', 'exemptionPolicy'), dataIndex: 'exemptionPolicy', width: 160, align: 'center',
				render: function (v, r) {
					if (!editable(r)) return plainCell(v || '-', 'center');
					return cellSelect({
						allowClear: true,
						showSearch: true,
						placeholder: '请选择',
						style: { width: '100%' },
						dropdownStyle: { borderRadius: 8, minWidth: 220 },
						value: v || undefined,
						options: EXEMPTION_OPTIONS,
						filterOption: filterOption,
						onChange: function (val) { patch(r.key, 'exemptionPolicy', val); }
					});
				}
			},
			{ title: ct('提车日期', 'pickupDate'), dataIndex: 'pickupDate', width: 138, align: 'center', render: function (v, r) { return pickupDateCell(r); } },
			{ title: ct('合同生效', 'contractStart'), dataIndex: 'contractStart', width: 138, align: 'center', render: function (v, r) { return contractStartCell(r); } },
			{ title: ct('合同到期', 'contractEnd'), dataIndex: 'contractEnd', width: 138, align: 'center', render: function (v, r) { return contractEndCell(r); } },
			{
				title: ct('起始日期', 'rentStartDate'), dataIndex: 'rentStartDate', width: 118, align: 'center',
				render: function (v, r) {
					var billing = getBillingYearMonth(r);
					var text = formatRentStartDisplay(r);
					var inner = !editable(r)
						? plainCell(text, 'center', 'lease-cell-calc')
						: readOnly(text, 'center', 'lease-cell-readonly lease-cell-calc');
					return React.createElement(Tooltip, {
						title: getRentStartDateHint(billing.year, billing.month, r.pickupDate, r.monthRentDays, r.daysInMonth),
						placement: 'top'
					}, inner);
				}
			},
			{ title: ct('退车日期', 'returnDate'), dataIndex: 'returnDate', width: 138, align: 'center', render: function (v, r) { return returnDateCell(r); } },
			{
				title: ct('平均天数', 'avgDays'), dataIndex: 'avgDays', width: 88, align: 'right',
				render: function (v, r) {
					var display = calcCell(v, r, 'right', fmtMoney);
					return React.createElement(Tooltip, {
						title: getAvgDaysHint(r, r.monthRentDays, r.daysInMonth),
						placement: 'top'
					}, display);
				}
			},
			{
				title: ct('押金', 'deposit'), dataIndex: 'deposit', width: 108, align: 'right',
				render: function (v, r) { return depositCell(r); }
			},
			{
				title: ct('合同标的租金', 'contractRent'), dataIndex: 'contractRent', width: 128, align: 'right',
				render: function (v, r) { return contractRentCell(r); }
			},
			{ title: ct('应收合计', 'receivableTotal'), dataIndex: 'receivableTotal', width: 96, align: 'right', render: function (v, r) { return calcCell(v, r, 'right', fmtMoney); } },
			{ title: ct('应收租金', 'receivableRent'), dataIndex: 'receivableRent', width: 96, align: 'right', render: function (v, r) { return numCell('receivableRent', r); } },
			{ title: ct('月度收入', 'monthlyIncome'), dataIndex: 'monthlyIncome', width: 96, align: 'right', render: function (v, r) { return calcCell(v, r, 'right', fmtMoney); } },
			{ title: ct('月度租金', 'monthlyRent'), dataIndex: 'monthlyRent', width: 88, align: 'right', render: function (v, r) { return numCell('monthlyRent', r); } },
			{ title: ct('维保包干', 'maintPackageIncome'), dataIndex: 'maintPackageIncome', width: 88, align: 'right', render: function (v, r) { return numCell('maintPackageIncome', r); } },
			{ title: ct('保险上浮', 'insuranceSurcharge'), dataIndex: 'insuranceSurcharge', width: 88, align: 'right', render: function (v, r) { return numCell('insuranceSurcharge', r); } },
			{ title: ct('运维费(收)', 'opsFeeIncome'), dataIndex: 'opsFeeIncome', width: 88, align: 'right', render: function (v, r) { return numCell('opsFeeIncome', r); } },
			{ title: ct('其他收入', 'otherIncome'), dataIndex: 'otherIncome', width: 88, align: 'right', render: function (v, r) { return numCell('otherIncome', r); } },
			{ title: ct('里程减免', 'mileageReduction'), dataIndex: 'mileageReduction', width: 88, align: 'right', render: function (v, r) { return numCell('mileageReduction', r, { min: -9999999 }); } },
			{ title: ct('其他减免', 'otherReduction'), dataIndex: 'otherReduction', width: 88, align: 'right', render: function (v, r) { return numCell('otherReduction', r, { min: -9999999 }); } },
			{ title: ct('实收金额', 'receivedAmount'), dataIndex: 'receivedAmount', width: 96, align: 'right', render: function (v, r) { return numCell('receivedAmount', r); } },
			{ title: ct('未收', 'unreceived'), dataIndex: 'unreceived', width: 88, align: 'right', render: function (v, r) { return calcCell(v, r, 'right', fmtMoney); } },
			{ title: ct('开票日期', 'invoiceDate'), dataIndex: 'invoiceDate', width: 118, align: 'center', render: function (v, r) { return dateCell('invoiceDate', r); } },
			{ title: ct('付款日期', 'paymentDate'), dataIndex: 'paymentDate', width: 118, align: 'center', render: function (v, r) { return dateCell('paymentDate', r); } },
			{
				title: ct('付款方式', 'paymentMethod'), dataIndex: 'paymentMethod', width: 96, align: 'center',
				render: function (v, r) {
					if (!editable(r)) return plainCell(v || '-', 'center');
					return cellSelect({
						allowClear: true,
						style: { width: '100%' },
						dropdownStyle: { borderRadius: 8, minWidth: 120 },
						value: v,
						options: PAYMENT_METHOD_OPTIONS,
						onChange: function (val) { patch(r.key, 'paymentMethod', val); }
					});
				}
			},
			{ title: ct('标准成本', 'vehicleStdCost'), dataIndex: 'vehicleStdCost', width: 88, align: 'right', render: function (v, r) { return numCell('vehicleStdCost', r); } },
			{ title: ct('实际成本', 'vehicleActualCost'), dataIndex: 'vehicleActualCost', width: 88, align: 'right', render: function (v, r) { return calcCell(v, r, 'right', fmtMoney); } },
			{ title: ct('保险费', 'insuranceCost'), dataIndex: 'insuranceCost', width: 80, align: 'right', render: function (v, r) { return numCell('insuranceCost', r); } },
			{ title: ct('氢费', 'h2Cost'), dataIndex: 'h2Cost', width: 72, align: 'right', render: function (v, r) { return numCell('h2Cost', r); } },
			{ title: ct('运维费', 'opsCost'), dataIndex: 'opsCost', width: 88, align: 'right', render: function (v, r) { return numCell('opsCost', r); } },
			{ title: ct('居间费', 'intermediaryFee'), dataIndex: 'intermediaryFee', width: 80, align: 'right', render: function (v, r) { return numCell('intermediaryFee', r); } },
			{ title: ct('其他成本', 'otherCost'), dataIndex: 'otherCost', width: 80, align: 'right', render: function (v, r) { return numCell('otherCost', r); } },
			{ title: ct('总成本', 'totalCost'), dataIndex: 'totalCost', width: 88, align: 'right', render: function (v, r) { return calcCell(v, r, 'right', fmtMoney); } },
			{ title: ct('盈亏', 'profitLoss'), dataIndex: 'profitLoss', width: 80, align: 'right', render: function (v, r) { return calcCell(v, r, 'right', fmtMoney); } },
			{ title: ct('资产归属', 'assetOwner'), dataIndex: 'assetOwner', width: 140, align: 'center', render: function (v, r) { return textCell('assetOwner', r); } },
			{ title: ct('签约公司', 'signCompany'), dataIndex: 'signCompany', width: 140, align: 'center', render: function (v, r) { return textCell('signCompany', r); } },
			{ title: ct('备注', 'remark'), dataIndex: 'remark', width: 120, align: 'center', render: function (v, r) { return textCell('remark', r); } },
			{
				title: ct('操作', 'action'), key: 'action', width: 100, fixed: 'right', align: 'center',
				render: function (_, record) {
					var ref = latestRefs.current;
					var ds = getDetailStatus(record);
					var isOwn = record.createdBy === ref.currentUser.id;
					var isEditing = ref.editingKeys.indexOf(record.key) >= 0;

					function toggleEdit() {
						ref.setEditingKeys(function (prev) {
							if (prev.indexOf(record.key) >= 0) return prev.filter(function (k) { return k !== record.key; });
							return prev.concat([record.key]);
						});
					}

					if (ds === 'bill_generated' || ds === 'approving') {
						return React.createElement('span', { style: { color: '#94a3b8', fontSize: 12 } }, '账单锁定');
					}

					if (ds === 'approved') {
						if (!ref.isSupervisor) return React.createElement('span', { style: { color: '#94a3b8', fontSize: 12 } }, '已锁定');
						return React.createElement(Space, { size: 4 },
							React.createElement(Button, { type: 'link', size: 'small', className: 'lc-action-btn', onClick: toggleEdit }, isEditing ? '完成' : '编辑'),
							React.createElement(Popconfirm, {
								title: '确认删除该条审批通过记录？',
								onConfirm: function () {
									ref.setAllRows(function (prev) { return prev.filter(function (r) { return r.key !== record.key; }); });
									message.success('已删除');
								}
							}, React.createElement(Button, { type: 'link', size: 'small', className: 'lc-action-btn lc-action-btn-danger', danger: true }, '删除'))
						);
					}

					if (isSavedDraftRow(record)) {
						if (!ref.isSupervisor && !isOwn) return null;
						return React.createElement(Space, { size: 4 },
							React.createElement(Button, { type: 'link', size: 'small', className: 'lc-action-btn', onClick: toggleEdit }, isEditing ? '完成' : '编辑'),
							React.createElement(Popconfirm, {
								title: '确认删除该条草稿？',
								onConfirm: function () {
									ref.setAllRows(function (prev) { return prev.filter(function (r) { return r.key !== record.key; }); });
									message.success('已删除');
								}
							}, React.createElement(Button, { type: 'link', size: 'small', className: 'lc-action-btn lc-action-btn-danger', danger: true }, '删除'))
						);
					}

					if (!ref.isSupervisor && isOwn) {
						return React.createElement(Popconfirm, {
							title: '确认删除该条待保存记录？',
							onConfirm: function () {
								ref.setAllRows(function (prev) { return prev.filter(function (r) { return r.key !== record.key; }); });
								message.success('已删除');
							}
						}, React.createElement(Button, { type: 'link', size: 'small', className: 'lc-action-btn lc-action-btn-danger', danger: true }, '删除'));
					}
					return null;
				}
			}
		];
	}, [plateOptions, editingKeys, currentUser, isSupervisor, depositWarnKeys, contractRentWarnKeys]);

	var activePreviewBill = useMemo(function () {
		if (!previewBills.length) return null;
		var bill = previewBills[billPreviewIndex] || previewBills[0];
		if (!bill) return null;
		var live = bills.filter(function (b) { return b.id === bill.id; })[0];
		return live || bill;
	}, [previewBills, billPreviewIndex, bills]);

	var billManageColumns = useMemo(function () {
		return [
			{
				title: '状态', dataIndex: 'status', width: 96, align: 'center',
				render: function (v) {
					return React.createElement(Tag, {
						color: v === 'approved' ? 'green' : v === 'approving' ? 'processing' : v === 'rejected' ? 'error' : 'default'
					}, LEASE_BILL_STATUS_LABEL[v] || v);
				}
			},
			{ title: '账单周期', dataIndex: 'billPeriod', width: 110, align: 'center' },
			{ title: '客户名称', dataIndex: 'customerName', width: 160, ellipsis: true },
			{ title: '项目名称', dataIndex: 'projectName', width: 180, ellipsis: true },
			{
				title: '实收金额', dataIndex: 'receivedTotal', width: 100, align: 'right',
				render: function (v) { return fmtMoney(v); }
			},
			{
				title: '操作', key: 'action', width: 220, fixed: 'right', align: 'center',
				render: function (_, bill) {
					var actions = [];
					if (bill.status === 'preview' || bill.status === 'rejected') {
						actions.push(React.createElement(Button, {
							key: 'confirm', type: 'link', size: 'small',
							onClick: function () { openBillPreviewFromManage(bill); }
						}, '继续确认'));
					}
					if (bill.status !== 'approving' && bill.status !== 'cancelled' && bill.status !== 'approved') {
						actions.push(React.createElement(Popconfirm, {
							key: 'cancel',
							title: '取消账单将释放明细为已保存，是否继续？',
							onConfirm: function () { handleCancelBill(bill); }
						}, React.createElement(Button, { type: 'link', size: 'small', danger: true }, '取消账单')));
					}
					if (bill.status === 'approving') {
						actions.push(React.createElement(Button, {
							key: 'withdraw', type: 'link', size: 'small',
							onClick: function () { handleWithdrawBill(bill); }
						}, '撤回'));
					}
					if (bill.status === 'approved') {
						actions.push(React.createElement(Button, {
							key: 'withdraw-approved', type: 'link', size: 'small',
							onClick: function () {
								patchBillInLists(bill.id, { status: 'preview' });
								patchRowsByBillId(bill.id, { detailStatus: 'bill_generated', submitStatus: 'draft' });
								message.success('已撤回至待确认');
							}
						}, '撤回'));
					}
					if (bill.status === 'approving') {
						if (bill.invoiceMode === 'first' && bill.invoiceStep < 1) {
							actions.push(React.createElement(Button, {
								key: 'fin1', type: 'link', size: 'small',
								onClick: function () { handleFinanceApproveBill(bill, 1); }
							}, '财务·上传发票'));
						} else {
							actions.push(React.createElement(Button, {
								key: 'fin2', type: 'link', size: 'small',
								onClick: function () { handleFinanceApproveBill(bill, 2); }
							}, '财务·确认到账'));
						}
						actions.push(React.createElement(Button, {
							key: 'reject', type: 'link', size: 'small', danger: true,
							onClick: function () { handleFinanceRejectBill(bill); }
						}, '驳回'));
					}
					return React.createElement(Space, { size: 4, wrap: true }, actions);
				}
			}
		];
	}, [bills, openBillPreviewFromManage, handleCancelBill, handleWithdrawBill, handleFinanceApproveBill, handleFinanceRejectBill, patchBillInLists, patchRowsByBillId]);

	function renderBillAttach(label, file) {
		if (!file) return React.createElement('span', { style: { color: '#94a3b8' } }, '—');
		return React.createElement('span', null,
			React.createElement('a', { className: 'lc-bill-preview-attach-link', href: file.url || '#', onClick: function (e) { e.preventDefault(); message.info('预览：' + file.name); } }, '预览'),
			React.createElement('a', { className: 'lc-bill-preview-attach-link', href: file.url || '#', onClick: function (e) { e.preventDefault(); message.success('已开始下载：' + file.name); } }, '下载')
		);
	}

	function renderBillPreviewBody(bill) {
		if (!bill) return null;
		var billDateText = bill.billDate && window.dayjs ? window.dayjs(bill.billDate).format('YYYY-MM-DD') : '-';
		var lineCount = (bill.lines || []).length;
		var invoiceLabel = LEASE_INVOICE_MODE_LABEL[bill.invoiceMode] || '-';
		var invoiceTagColor = bill.invoiceMode === 'first' ? 'purple' : 'blue';
		var lineCols = [
			{ title: '车牌号', dataIndex: 'plateNo', width: 100, align: 'center' },
			{ title: '账单日期', dataIndex: 'billDate', width: 110, align: 'center', render: function (v) { return v && window.dayjs ? window.dayjs(v).format('YYYY-MM-DD') : '-'; } },
			{ title: '提车日期', dataIndex: 'pickupDate', width: 110, align: 'center', render: function (v) { return formatDate(v); } },
			{ title: '退车日期', dataIndex: 'returnDate', width: 110, align: 'center', render: function (v) { return formatDate(v); } },
			{ title: '起始日期', dataIndex: 'rentStart', width: 100, align: 'center' },
			{ title: '应收合计', dataIndex: 'receivableTotal', width: 96, align: 'right', render: function (v) { return fmtMoney(v); } },
			{ title: '减免金额', dataIndex: 'reductionAmount', width: 96, align: 'right', render: function (v) { return fmtMoney(v); } },
			{ title: '实收金额', dataIndex: 'receivedAmount', width: 96, align: 'right', render: function (v) { return fmtMoney(v); } }
		];
		return React.createElement('div', { className: 'lc-bill-preview-panel' },
			React.createElement('div', { className: 'lc-bill-preview-hero' },
				React.createElement('div', { className: 'lc-bill-preview-hero__main' },
					React.createElement('div', { className: 'lc-bill-preview-hero__customer' }, bill.customerName || '-'),
					React.createElement('div', { className: 'lc-bill-preview-hero__project' }, bill.projectName || '-')
				),
				React.createElement('div', { className: 'lc-bill-preview-hero__meta' },
					React.createElement('div', null, bill.billPeriod || '-'),
					React.createElement('div', null, '账单日 ' + billDateText)
				)
			),
			React.createElement('div', { className: 'lc-bill-preview-stats', role: 'group', 'aria-label': '账单摘要' },
				React.createElement('div', { className: 'lc-bill-preview-stat lc-bill-preview-stat--amount' },
					React.createElement('div', { className: 'lc-bill-preview-stat__label' }, '实收总额'),
					React.createElement('div', { className: 'lc-bill-preview-stat__value lc-bill-preview-stat__value--money' }, fmtMoney(bill.receivedTotal))
				),
				React.createElement('div', { className: 'lc-bill-preview-stat lc-bill-preview-stat--invoice' },
					React.createElement('div', { className: 'lc-bill-preview-stat__label' }, '开票方式'),
					React.createElement('div', { className: 'lc-bill-preview-stat__value' },
						React.createElement(Tag, { color: invoiceTagColor, style: { margin: 0 } }, invoiceLabel)
					)
				),
				React.createElement('div', { className: 'lc-bill-preview-stat lc-bill-preview-stat--arrival' },
					React.createElement('div', { className: 'lc-bill-preview-stat__label' }, '到账金额'),
					React.createElement('div', { className: 'lc-bill-preview-stat__value' },
						bill.arrivalAmount != null ? fmtMoney(bill.arrivalAmount) : React.createElement('span', { style: { color: '#94a3b8', fontWeight: 500 } }, '待财务填写')
					)
				),
				React.createElement('div', { className: 'lc-bill-preview-stat lc-bill-preview-stat--company' },
					React.createElement('div', { className: 'lc-bill-preview-stat__label' }, '签约公司'),
					React.createElement('div', { className: 'lc-bill-preview-stat__value' }, bill.signCompany || '-')
				)
			),
			React.createElement('div', { className: 'lc-bill-preview-attach-row' },
				React.createElement('div', { className: 'lc-bill-preview-attach' },
					React.createElement('div', { className: 'lc-bill-preview-attach__label' }, '收款凭据'),
					React.createElement('div', { className: 'lc-bill-preview-attach__value' }, renderBillAttach('', bill.receiptAttachment))
				),
				React.createElement('div', { className: 'lc-bill-preview-attach' },
					React.createElement('div', { className: 'lc-bill-preview-attach__label' }, '发票附件'),
					React.createElement('div', { className: 'lc-bill-preview-attach__value' }, renderBillAttach('', bill.invoiceAttachment))
				)
			),
			React.createElement('div', { className: 'lc-bill-preview-table-wrap' },
				React.createElement('div', { className: 'lc-bill-preview-table-head' },
					React.createElement('span', { className: 'lc-bill-preview-table-head__title' }, '账单明细'),
					React.createElement('span', { className: 'lc-bill-preview-table-head__count' }, '共 ' + lineCount + ' 条')
				),
				React.createElement(Table, {
					size: 'small', bordered: false, pagination: false, rowKey: 'key',
					columns: lineCols, dataSource: bill.lines || [],
					scroll: { x: 'max-content' }
				})
			),
			React.createElement('div', { className: 'lc-bill-preview-actions' },
				React.createElement(Button, {
					style: { borderRadius: 8, fontWeight: 600 },
					onClick: function () { handleGenerateBillPdf(bill); }
				}, '生成该对账单'),
				bill.status === 'preview' || bill.status === 'rejected' ? React.createElement(Button, {
					type: 'primary', style: LEASE_PRIMARY_BTN_STYLE,
					onClick: function () { handleStartBillApproval(bill); }
				}, '发起收款审批') : React.createElement(Button, { disabled: true, style: { borderRadius: 8 } },
					bill.status === 'approving' ? '审批中' : '已处理')
			)
		);
	}

	return React.createElement(
		App,
		null,
		React.createElement('style', null, LEASE_PAGE_STYLE + LEASE_LEDGER_TABLE_STYLE),
		React.createElement('div', { className: 'lease-ledger-page' },
			React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' } },
				React.createElement('div', { style: { marginBottom: 16, display: 'flex', justifyContent: 'flex-end' } },
					React.createElement(Button, {
						type: 'default',
						icon: LEASE_ICONS.doc,
						style: LEASE_REQ_BTN_STYLE,
						onClick: function () { setRequirementModalOpen(true); },
						'aria-label': '查看需求说明'
					}, '查看需求说明')
				),
				React.createElement(Card, { className: 'lc-filter-card', title: '筛选条件', bordered: false },
					React.createElement('div', { className: 'lc-filter-grid' },
						renderFilterField('年份', React.createElement(InputNumber, {
							placeholder: '全部', min: 2020, max: 2099, style: { width: '100%' },
							value: yearDraft, onChange: setYearDraft
						})),
						renderFilterField('月份', React.createElement(InputNumber, {
							placeholder: '全部', min: 1, max: 12, style: { width: '100%' },
							value: monthDraft, onChange: setMonthDraft
						})),
						renderFilterField('业务部门', React.createElement(Select, {
							allowClear: true, placeholder: '全部', style: { width: '100%' },
							value: deptDraft, onChange: setDeptDraft, options: DEPT_OPTIONS,
							dropdownStyle: { borderRadius: 8 }
						})),
						renderFilterField('业务员', React.createElement(Select, {
							allowClear: true, showSearch: true, placeholder: '全部', style: { width: '100%' },
							value: salesmanDraft, onChange: setSalesmanDraft,
							options: salesmanOptions, filterOption: filterOption,
							dropdownStyle: { borderRadius: 8 }
						})),
						renderFilterField('车牌号码', React.createElement(Select, {
							allowClear: true, showSearch: true, placeholder: '全部', style: { width: '100%' },
							value: plateDraft, onChange: setPlateDraft,
							options: plateOptions, filterOption: filterOption,
							dropdownStyle: { borderRadius: 8 }
						})),
						renderFilterField('客户名称', React.createElement(Input, {
							allowClear: true, placeholder: '模糊搜索', style: { width: '100%', height: 32, borderRadius: 8 },
							value: customerDraft,
							onChange: function (e) { setCustomerDraft(e.target.value); },
							onPressEnter: handleQuery
						})),
						renderFilterField('明细状态', React.createElement(Select, {
							allowClear: true, placeholder: '全部', style: { width: '100%' },
							value: statusDraft, onChange: setStatusDraft,
							options: DETAIL_STATUS_FILTER_OPTIONS,
							dropdownStyle: { borderRadius: 8 }
						})),
						renderFilterField('账单日期', React.createElement(DatePicker.RangePicker, {
							style: { width: '100%' }, format: 'YYYY-MM-DD',
							value: billRangeDraft, onChange: setBillRangeDraft
						}))
					),
					React.createElement('div', { className: 'lc-filter-actions' },
						React.createElement(Button, { onClick: handleReset, style: { borderRadius: 8 } }, '重置'),
						React.createElement(Button, { type: 'primary', onClick: handleQuery, style: LEASE_PRIMARY_BTN_STYLE }, '查询')
					)
				),

				React.createElement('div', { className: 'lc-alert-stats-row' },
					LEASE_KPI_CARDS.map(function (card) {
						var displayValue = card.format === 'count'
							? String(statSummary.count)
							: fmtMoney(statSummary[card.key]);
						var valueClass = card.key === 'profitLoss'
							? (statSummary.profitLoss >= 0 ? 'lc-stat-val--profit' : 'lc-stat-val--loss')
							: '';
						return renderStatCard(card, displayValue, valueClass);
					})
				),

				React.createElement('div', { className: 'lc-table-section' },
					React.createElement('div', { className: 'lc-table-toolbar' },
						React.createElement('div', { className: 'lc-table-legend-outer' },
							React.createElement('span', { className: 'lc-table-legend-label' }, '行底色：'),
							React.createElement('span', { className: 'lc-table-legend-item' },
								React.createElement('span', { className: 'lc-table-legend-dot', style: { background: '#f1f5f9', border: '1px solid #e2e8f0' } }),
								'待保存'
							),
							React.createElement('span', { className: 'lc-table-legend-item' },
								React.createElement('span', { className: 'lc-table-legend-dot', style: { background: '#fff', border: '1px solid #e2e8f0' } }),
								'已保存'
							),
							React.createElement('span', { className: 'lc-table-legend-item' },
								React.createElement('span', { className: 'lc-table-legend-dot', style: { background: '#f5f3ff', border: '1px solid #ddd6fe' } }),
								'已生成账单/审批中'
							),
							React.createElement('span', { className: 'lc-table-legend-item' },
								React.createElement('span', { className: 'lc-table-legend-dot', style: { background: '#ecfdf5', border: '1px solid #a7f3d0' } }),
								'审批通过'
							),
							React.createElement('span', { style: { color: '#94a3b8', marginLeft: 4 } }, '表头 ? 可查看字段说明与计算公式'),
							React.createElement('span', { style: { color: '#94a3b8' } }, '共 ' + visibleRows.length + ' 条')
						),
						React.createElement('div', { className: 'lc-table-toolbar-actions' },
							!isSupervisor ? React.createElement(Button, {
								type: 'default',
								icon: LEASE_ICONS.upload,
								style: LEASE_OUTLINE_BTN_STYLE,
								onClick: function () { setImportModalOpen(true); },
								'aria-label': '导入租赁业务台账'
							}, '导入') : null,
							!isSupervisor ? React.createElement(Button, {
								onClick: function () { setBillManageOpen(true); },
								style: { borderRadius: 8, fontWeight: 600 }
							}, '账单管理') : null,
							!isSupervisor ? React.createElement(Button, {
								onClick: handleSave,
								style: { borderRadius: 8, fontWeight: 600 }
							}, '保存') : null,
							!isSupervisor ? React.createElement(Button, {
								type: 'primary',
								style: LEASE_PRIMARY_BTN_STYLE,
								onClick: handleSubmitCollectionApproval,
								disabled: !selectedRowKeys.length,
								'aria-label': '提交收款审批'
							}, '提交收款审批') : null
						)
					),
					React.createElement('div', { className: 'lc-table-card' },
						React.createElement('div', { className: 'lease-ledger-table-wrap' },
							React.createElement(Table, {
								className: 'lease-ledger-table',
								size: 'small',
								bordered: true,
								rowKey: 'key',
								columns: columns,
								dataSource: visibleRows,
								pagination: false,
								showHeader: true,
								scroll: { x: 'max-content', y: 'calc(100vh - 500px)' },
								sticky: true,
								rowSelection: !isSupervisor ? {
									selectedRowKeys: selectedRowKeys,
									onChange: function (keys) { setSelectedRowKeys(keys); },
									getCheckboxProps: function (record) {
										return { disabled: !canSelectDetailRow(record) };
									},
									columnWidth: 40
								} : undefined,
								rowClassName: function (r) {
									return 'lease-row-tier-' + (r.displayTier != null ? r.displayTier : rowDisplaySortTier(r));
								},
								locale: {
									emptyText: React.createElement('div', { style: { padding: '32px 0', color: '#94a3b8' } }, '暂无符合筛选条件的台账记录')
								}
							})
						),
						!isSupervisor ? React.createElement(Button, {
							type: 'dashed',
							block: true,
							className: 'lease-add-row-btn',
							icon: LEASE_ICONS.plus,
							onClick: addRow
						}, '新增一行') : null
					)
				)
			),

			React.createElement(Modal, {
				className: 'h2-prd-modal',
				title: React.createElement('span', { style: { fontWeight: 700 } }, '需求说明 · 租赁业务台账'),
				open: requirementModalOpen,
				onCancel: function () { setRequirementModalOpen(false); },
				width: 720,
				centered: true,
				destroyOnClose: true,
				styles: { body: { maxHeight: '72vh', overflow: 'auto', paddingTop: 8, paddingBottom: 16 } },
				footer: React.createElement(Button, {
					onClick: function () { setRequirementModalOpen(false); },
					style: { borderRadius: 8 }
				}, '关闭')
			}, renderLeaseRequirementPanel()),

			React.createElement(Modal, {
				title: '导入租赁业务台账',
				open: importModalOpen,
				onCancel: function () { setImportModalOpen(false); },
				footer: null,
				width: 560,
				centered: true,
				destroyOnClose: true
			},
				React.createElement('div', { className: 'h2-import-template-bar' },
					React.createElement('div', { className: 'h2-import-template-bar-text' },
						React.createElement('div', { style: { fontWeight: 700, marginBottom: 4, color: '#0f172a' } }, '第一步：下载 CSV 导入模板'),
						'模板字段与台账主要列一致；填写后上传，导入记录为「待保存」状态，确认无误后点击保存，再勾选提交收款审批。'
					),
					React.createElement(Button, {
						type: 'primary',
						ghost: true,
						style: Object.assign({}, LEASE_OUTLINE_BTN_STYLE, { flexShrink: 0 }),
						onClick: downloadImportTemplate
					}, '下载模板')
				),
				React.createElement(Alert, {
					type: 'info',
					showIcon: true,
					style: { marginBottom: 14, borderRadius: 10 },
					message: '第二步：填写模板后上传文件',
					description: '支持 .csv；上传后生成可编辑草稿，归属当前登录客服。'
				}),
				React.createElement(Upload.Dragger, {
					accept: '.csv',
					maxCount: 1,
					showUploadList: false,
					beforeUpload: handleImportFile
				},
					React.createElement('p', { style: { margin: '8px 0 4px', fontWeight: 600, color: '#334155' } }, '点击或拖拽 CSV 文件到此处上传'),
					React.createElement('p', { style: { margin: 0, fontSize: 12, color: '#94a3b8' } }, '单次上传一个文件')
				)
			),

			React.createElement(Drawer, {
				title: '账单管理',
				open: billManageOpen,
				onClose: function () { setBillManageOpen(false); },
				width: 920,
				destroyOnClose: false
			},
				React.createElement(Table, {
					size: 'small',
					bordered: true,
					rowKey: 'id',
					columns: billManageColumns,
					dataSource: bills.filter(function (b) { return b.status !== 'cancelled'; }),
					pagination: { pageSize: 8, showSizeChanger: false },
					scroll: { x: 'max-content' },
					locale: { emptyText: '暂无账单，请勾选已保存明细后提交收款审批' }
				}),
				React.createElement(Alert, {
					type: 'info',
					showIcon: true,
					style: { marginTop: 12, borderRadius: 8 },
					message: '审批说明（原型模拟）',
					description: '后开：财务一次确认到账并上传凭据与发票；先开：财务分两步——先上传发票，再确认到账。审批中可撤回；非审批中可取消账单释放明细。'
				})
			),

			React.createElement(Modal, {
				className: 'lc-bill-preview-modal',
				title: '账单预览（第 ' + (billPreviewIndex + 1) + ' 份 / 共 ' + previewBills.length + ' 份）',
				open: billPreviewOpen,
				onCancel: function () { setBillPreviewOpen(false); },
				width: 920,
				centered: true,
				destroyOnClose: false,
				styles: { body: { maxHeight: '78vh', overflow: 'auto' } },
				footer: previewBills.length > 1 ? React.createElement(Space, null,
					React.createElement(Button, {
						disabled: billPreviewIndex <= 0,
						onClick: function () { setBillPreviewIndex(function (i) { return Math.max(0, i - 1); }); }
					}, '上一份'),
					React.createElement(Button, {
						disabled: billPreviewIndex >= previewBills.length - 1,
						onClick: function () { setBillPreviewIndex(function (i) { return Math.min(previewBills.length - 1, i + 1); }); }
					}, '下一份'),
					React.createElement(Button, { onClick: function () { setBillPreviewOpen(false); } }, '关闭')
				) : React.createElement(Button, { onClick: function () { setBillPreviewOpen(false); } }, '关闭')
			}, renderBillPreviewBody(activePreviewBill))
		)
	);
};
