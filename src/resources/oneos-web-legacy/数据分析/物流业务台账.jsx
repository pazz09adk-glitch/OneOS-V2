// 【重要】必须使用 const Component 作为组件变量名
// 数据分析 - 物流业务台账（对齐《2026年业务二部运营台账总表》子表 1.2物流业务台账）
// 业务服务组操作人维护各自台账；主管可查看全部。支持批量导入、表格底部行内新增与删改查。

var LOGISTICS_PAGE_STYLE = [
	'.logistics-ledger-page { padding: 24px 24px 80px; min-height: 100vh; display: flex; flex-direction: column; background: linear-gradient(165deg, #f1f5f9 0%, #f8fafc 50%, #f1f5f9 100%); overflow-x: hidden; overflow-y: auto; box-sizing: border-box; }',
	'.logistics-ledger-page .lc-filter-card.ant-card { border-radius: 16px !important; border: 1px solid #e2e8f0 !important; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03) !important; margin-bottom: 16px; }',
	'.logistics-ledger-page .lc-filter-card > .ant-card-head { border-bottom: 1px solid #f1f5f9 !important; min-height: auto; padding: 12px 20px !important; }',
	'.logistics-ledger-page .lc-filter-card > .ant-card-head .ant-card-head-title { font-size: 15px !important; font-weight: 700 !important; color: #0f172a !important; padding: 0 !important; }',
	'.logistics-ledger-page .lc-filter-card > .ant-card-body { padding: 16px 20px 20px !important; }',
	'.logistics-ledger-page .lc-filter-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px 24px; align-items: center; }',
	'@media (max-width: 1280px) { .logistics-ledger-page .lc-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }',
	'@media (max-width: 640px) { .logistics-ledger-page .lc-filter-grid { grid-template-columns: 1fr; } }',
	'.logistics-ledger-page .lc-filter-field { display: flex; align-items: center; gap: 12px; min-width: 0; min-height: 32px; }',
	'.logistics-ledger-page .lc-filter-field-label { flex: 0 0 88px; text-align: right; font-size: 13px; font-weight: 500; color: #475569; line-height: 32px; white-space: nowrap; }',
	'.logistics-ledger-page .lc-filter-field-control { flex: 1; min-width: 0; }',
	'.logistics-ledger-page .lc-filter-field-control .ant-input, .logistics-ledger-page .lc-filter-field-control .ant-input-affix-wrapper, .logistics-ledger-page .lc-filter-field-control .ant-select .ant-select-selector, .logistics-ledger-page .lc-filter-field-control .ant-input-number, .logistics-ledger-page .lc-filter-field-control .ant-picker { width: 100%; height: 32px !important; min-height: 32px !important; border-radius: 8px !important; box-sizing: border-box; }',
	'.logistics-ledger-page .lc-filter-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f5f9; }',
	'.logistics-ledger-page .lc-alert-stats-row { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; margin-bottom: 16px; }',
	'@media (max-width: 1280px) { .logistics-ledger-page .lc-alert-stats-row { grid-template-columns: repeat(3, minmax(0, 1fr)); } }',
	'@media (max-width: 768px) { .logistics-ledger-page .lc-alert-stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }',
	'@media (max-width: 480px) { .logistics-ledger-page .lc-alert-stats-row { grid-template-columns: 1fr; } }',
	'.logistics-ledger-page .lc-alert-card { display: flex; align-items: center; gap: 8px; padding: 10px 22px 10px 10px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; position: relative; overflow: hidden; min-width: 0; min-height: 62px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.logistics-ledger-page .lc-alert-card-main { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 4px; }',
	'.logistics-ledger-page .lc-alert-card-icon { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(145deg, #0d7a63 0%, #065f4a 100%); color: #fff; box-shadow: 0 2px 8px rgba(6, 95, 74, 0.22); }',
	'.logistics-ledger-page .lc-alert-card-icon svg { width: 18px !important; height: 18px !important; }',
	'.logistics-ledger-page .lc-alert-card-val { font-size: 17px; font-weight: 800; line-height: 1.1; color: #0f172a; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }',
	'.logistics-ledger-page .lc-alert-card-title { width: 100%; font-size: 11px; font-weight: 600; color: #64748b; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
	'.logistics-ledger-page .lc-alert-card-tip-anchor { position: absolute; top: 6px; right: 6px; z-index: 2; line-height: 0; }',
	'.logistics-ledger-page .lc-alert-card-tip { width: 16px; height: 16px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #94a3b8; background: rgba(255,255,255,0.92); border: 1px solid #e2e8f0; cursor: help; line-height: 0; }',
	'.logistics-ledger-page .lc-stat-val--profit { color: #047857 !important; }',
	'.logistics-ledger-page .lc-stat-val--loss { color: #b91c1c !important; }',
	'.logistics-ledger-page .lc-table-section { margin-bottom: 0; }',
	'.logistics-ledger-page .lc-table-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px 16px; margin-bottom: 8px; min-height: 32px; }',
	'.logistics-ledger-page .lc-table-toolbar-meta { font-size: 13px; color: #64748b; }',
	'.logistics-ledger-page .lc-table-toolbar-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-left: auto; }',
	'.logistics-ledger-page .lc-table-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03); padding: 12px 16px 16px; box-sizing: border-box; }',
	'.logistics-ledger-page .logistics-ledger-table-wrap { width: 100%; }',
	'.logistics-ledger-page .lc-action-btn { font-weight: 600 !important; color: #10b981 !important; padding: 0 !important; }',
	'.logistics-ledger-page .lc-action-btn-danger { color: #ef4444 !important; }',
	'.logistics-ledger-page .ll-action-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; color: rgba(15, 23, 42, 0.55); transition: background 0.15s ease, color 0.15s ease; }',
	'.logistics-ledger-page .ll-action-icon-btn:hover { background: #f0f9ff; color: #1677ff; }',
	'.logistics-ledger-page .ll-action-icon-btn:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.logistics-ledger-page .ll-action-icon-btn.is-disabled { color: rgba(15, 23, 42, 0.25); cursor: not-allowed; pointer-events: none; }',
	'.logistics-ledger-page .ll-row-more-btn.ll-action-icon-btn:hover { background: #f5f5f5; color: rgba(15, 23, 42, 0.75); }',
	'.logistics-ledger-page .ll-import-modal-wrap .ant-modal-content { border-radius: 16px; overflow: hidden; box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18); }',
	'.logistics-ledger-page .ll-import-modal-wrap .ant-modal-header { padding: 18px 24px 14px; border-bottom: 1px solid #f1f5f9; margin-bottom: 0; }',
	'.logistics-ledger-page .ll-import-modal-wrap .ant-modal-title { font-size: 17px; font-weight: 700; color: #0f172a; }',
	'.logistics-ledger-page .ll-import-modal-wrap .ant-modal-body { padding: 20px 24px 24px; background: #f8fafc; }',
	'.logistics-ledger-page .ll-import-modal-wrap .ant-modal-close { top: 14px; width: 40px; height: 40px; border-radius: 10px; transition: background 0.2s ease, color 0.2s ease; }',
	'.logistics-ledger-page .ll-import-modal-wrap .ant-modal-close:hover { background: #f1f5f9; color: #0f172a; }',
	'.logistics-ledger-page .ll-import-modal-wrap .ant-modal-close:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.logistics-ledger-page .ll-import-content { display: flex; flex-direction: column; gap: 14px; }',
	'.logistics-ledger-page .ll-import-steps-card { padding: 18px 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-sizing: border-box; }',
	'.logistics-ledger-page .ll-import-steps-card .ll-import-steps { margin: 0; }',
	'.logistics-ledger-page .ll-import-steps .ant-steps-item-title { font-size: 14px !important; font-weight: 600 !important; color: #334155 !important; }',
	'.logistics-ledger-page .ll-import-steps .ant-steps-item-process .ant-steps-item-title { color: #0f172a !important; }',
	'.logistics-ledger-page .ll-import-steps .ant-steps-item-process .ant-steps-item-icon { background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; border-color: #059669 !important; }',
	'.logistics-ledger-page .ll-import-steps .ant-steps-item-finish .ant-steps-item-icon { background: #ecfdf5 !important; border-color: #10b981 !important; }',
	'.logistics-ledger-page .ll-import-steps .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon { color: #059669 !important; }',
	'.logistics-ledger-page .ll-import-action-card { padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-sizing: border-box; transition: border-color 0.2s ease, box-shadow 0.2s ease; }',
	'.logistics-ledger-page .ll-import-action-card:hover { border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); }',
	'.logistics-ledger-page .ll-import-action-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }',
	'.logistics-ledger-page .ll-import-action-meta { display: flex; align-items: center; gap: 12px; min-width: 0; }',
	'.logistics-ledger-page .ll-import-action-icon { flex-shrink: 0; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%); color: #059669; }',
	'.logistics-ledger-page .ll-import-action-icon svg { width: 20px; height: 20px; }',
	'.logistics-ledger-page .ll-import-action-label { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.35; }',
	'.logistics-ledger-page .ll-import-download-btn.ant-btn { flex-shrink: 0; min-height: 44px; height: 44px; padding: 0 18px; border-radius: 10px !important; font-weight: 600; }',
	'.logistics-ledger-page .ll-import-upload-card { padding: 0; overflow: hidden; border-style: dashed; background: #fff; }',
	'.logistics-ledger-page .ll-import-upload-card:hover { border-color: #34d399; }',
	'.logistics-ledger-page .ll-import-upload-card .ll-import-dragger.ant-upload-wrapper { display: block; width: 100%; }',
	'.logistics-ledger-page .ll-import-upload-card .ant-upload.ant-upload-drag { display: block; width: 100%; border: none !important; background: transparent !important; padding: 0 !important; margin: 0 !important; }',
	'.logistics-ledger-page .ll-import-upload-card .ant-upload-drag .ant-upload-btn { display: block; width: 100%; padding: 28px 16px !important; border: none !important; background: transparent !important; cursor: pointer; }',
	'.logistics-ledger-page .ll-import-upload-card .ant-upload-drag:hover .ant-upload-btn { background: #f0fdf4 !important; }',
	'.logistics-ledger-page .ll-import-upload-card .ant-upload-drag.ant-upload-drag-hover .ant-upload-btn { background: #ecfdf5 !important; }',
	'.logistics-ledger-page .ll-import-upload-inner { display: flex; flex-direction: column; align-items: center; text-align: center; }',
	'.logistics-ledger-page .ll-import-upload-icon { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; margin-bottom: 10px; border-radius: 12px; background: #ecfdf5; color: #059669; }',
	'.logistics-ledger-page .ll-import-upload-icon svg { width: 22px; height: 22px; }',
	'.logistics-ledger-page .ll-import-upload-title { margin: 0; font-size: 15px; font-weight: 600; color: #0f172a; line-height: 1.4; }',
	'.logistics-ledger-page .ll-import-upload-hint { margin: 6px 0 0; font-size: 13px; color: #64748b; line-height: 1.45; }',
	'.logistics-ledger-page .ll-import-upload-card .ant-upload-list { padding: 0 16px 12px; margin: 0; text-align: left; }',
	'.logistics-ledger-page .ll-import-fail { padding: 12px 14px; border-radius: 10px; background: #fef2f2; border: 1px solid #fecaca; }',
	'.logistics-ledger-page .ll-import-fail-title { font-size: 13px; font-weight: 700; color: #b91c1c; margin-bottom: 8px; }',
	'.logistics-ledger-page .ll-import-error-list { margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.65; color: #7f1d1d; }',
	'@media (prefers-reduced-motion: reduce) { .logistics-ledger-page .ll-import-action-card, .logistics-ledger-page .ll-import-modal-wrap .ant-modal-close { transition: none; } }',
	'.logistics-ledger-page .ll-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 16px; }',
	'@media (max-width: 720px) { .logistics-ledger-page .ll-form-grid { grid-template-columns: 1fr; } }',
	'.logistics-ledger-page .ll-form-readonly { padding: 8px 10px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f766e; }',
	'.logistics-ledger-page .ll-table-add-row-wrap { flex-shrink: 0; margin-top: 12px; }',
	'.logistics-ledger-page .ll-add-row-btn { border-radius: 8px !important; border-style: dashed !important; border-color: #cbd5e1 !important; color: #475569 !important; font-weight: 600 !important; min-height: 44px !important; background: #fff !important; }',
	'.logistics-ledger-page .ll-add-row-btn:hover { border-color: #10b981 !important; color: #059669 !important; }',
	'.logistics-ledger-page .ll-req-doc-panel { max-width: 100%; }',
	'.logistics-ledger-page .ll-req-doc-panel h1:first-child { margin-top: 0; }'
].join('');

var LOGISTICS_TABLE_STYLE =
	'.logistics-ledger-table-wrap{border-radius:12px;overflow:hidden;box-shadow:0 4px 24px -6px rgba(15,23,42,0.05),0 0 0 1px rgba(226,232,240,0.9)}' +
	'.logistics-ledger-table .ant-table-thead>tr>th,.logistics-ledger-table .ant-table-thead .ant-table-cell{white-space:nowrap;color:#475569!important;font-weight:700!important;font-size:13px!important;background:#f8fafc!important;border-bottom:1px solid #e2e8f0!important;padding:0 8px!important;height:40px!important;text-align:center!important;vertical-align:middle!important}' +
	'.logistics-ledger-table .ll-th-required{color:#ef4444!important;margin-left:2px;font-weight:700!important;line-height:1}' +
	'.logistics-ledger-table .ant-table-header .ant-table-thead>tr>th,.logistics-ledger-table .ant-table-header .ant-table-thead .ant-table-cell{height:40px!important;line-height:1.35!important}' +
	'.logistics-ledger-table .ant-table-tbody>tr:not(.ant-table-measure-row)>td{padding:6px 8px!important;font-size:12px!important;white-space:nowrap;vertical-align:middle!important}' +
	'.logistics-ledger-table .ant-table-tbody>tr:not(.ant-table-measure-row):not(.ll-row-draft):hover>td{background:#f0f9ff!important}' +
	'.logistics-ledger-table .ant-table-tbody>tr.ll-row-draft>td{background:#f0fdf4!important}' +
	'.logistics-ledger-table .ant-table-tbody>tr.ant-table-measure-row,.logistics-ledger-table .ant-table-tbody>tr.ant-table-measure-row>td{height:0!important;max-height:0!important;padding:0!important;border:none!important;line-height:0!important;font-size:0!important;overflow:hidden!important;visibility:hidden!important}' +
	'.logistics-ledger-table .ant-table-cell-fix-left,.logistics-ledger-table .ant-table-cell-fix-right{z-index:2!important}' +
	'.logistics-ledger-table .ant-table-container .ant-table-header{position:relative;z-index:3;background:#f8fafc;min-height:40px!important}' +
	'.logistics-ledger-table .ll-profit-pos{color:#047857;font-weight:600}' +
	'.logistics-ledger-table .ll-profit-neg{color:#b91c1c;font-weight:600}' +
	'.logistics-ledger-table .ll-h2-warn-cell,.logistics-ledger-table .ll-fee-warn-cell{display:inline-flex;align-items:center;justify-content:flex-end;gap:4px;width:100%;max-width:100%}' +
	'.logistics-ledger-table .ll-cell-plain{display:block;min-height:20px;line-height:20px;font-size:12px!important;color:#334155;box-sizing:border-box}' +
	'.logistics-ledger-table .ll-cell-input,.logistics-ledger-table .ll-cell-input.ant-input-affix-wrapper,.logistics-ledger-table .ll-cell-input-number,.logistics-ledger-table .ll-cell-input-number .ant-input-number-input,.logistics-ledger-table .ll-cell-date,.logistics-ledger-table .ll-cell-date .ant-picker-input>input{font-size:12px!important;color:#334155!important}' +
	'.logistics-ledger-table .ll-cell-input,.logistics-ledger-table .ll-cell-input.ant-input-affix-wrapper{height:28px!important;min-height:28px!important;padding:2px 8px!important;line-height:24px!important;border-radius:6px!important}' +
	'.logistics-ledger-table .ll-cell-input-number{width:100%!important;height:28px!important;min-height:28px!important;border-radius:6px!important}' +
	'.logistics-ledger-table .ll-cell-input-number .ant-input-number-input{height:26px!important;padding:0 8px!important;text-align:right}' +
	'.logistics-ledger-table .ll-cell-date{width:100%!important;height:28px!important;min-height:28px!important;border-radius:6px!important;padding:2px 8px 2px!important}' +
	'.logistics-ledger-table .ll-cell-date .ant-picker-input>input{height:24px!important}' +
	'.logistics-ledger-table .ll-cell-select.ant-select{font-size:12px!important;width:100%!important;min-width:0}' +
	'.logistics-ledger-table .ll-cell-select.ant-select-single{height:28px!important}' +
	'.logistics-ledger-table .ll-cell-select.ant-select-single .ant-select-selector{height:28px!important;min-height:28px!important;padding:0 8px!important;font-size:12px!important;border-radius:6px!important}' +
	'.logistics-ledger-table .ll-cell-select .ant-select-selection-item,.logistics-ledger-table .ll-cell-select .ant-select-selection-placeholder{line-height:26px!important;font-size:12px!important}' +
	'.logistics-ledger-table .ll-cell-select.ll-cell-select--fit .ant-select-selection-item{overflow:visible;text-overflow:clip;white-space:nowrap}';

var LL_PRIMARY_BTN = { borderRadius: 8, fontWeight: 600, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' };
var LL_OUTLINE_BTN = { borderRadius: 8, fontWeight: 600, borderColor: '#10b981', color: '#059669' };
var LL_REQ_BTN_STYLE = { borderRadius: 8, border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600 };

var LL_IMPORT_HEADERS = [
	'月份', '出车日期', '业务名称', '司机', '电话', '车辆承接方', '车牌号码', '品牌', '型号', '单价', '数量', '金额',
	'氢费', 'ETC费用', '薪资', '电费', '人工报销费用', '日社保服务费', '日挂车费用', '日停车费用', '日轮胎费用', '车辆费用',
	'是否多趟', '线路计价', '备注'
];

var LL_UNDERTAKER_OPTIONS = [
	{ value: '我司', label: '我司' },
	{ value: '第三方车队', label: '第三方车队' }
];

// 品牌 → 型号级联（与「型号参数」模块一致，并补充车辆档案常用品牌）
var LL_BRAND_MODEL_MAP = {
	'苏龙': [
		{ value: '海格牌KLQ5180XYKFCEV', label: '海格牌KLQ5180XYKFCEV' },
		{ value: 'KLQ6129', label: 'KLQ6129' },
		{ value: 'KLQ6106', label: 'KLQ6106' },
		{ value: '海格牌KLQ5090', label: '海格牌KLQ5090' }
	],
	'东风': [
		{ value: 'DFH1180', label: 'DFH1180' },
		{ value: 'DFH1250', label: 'DFH1250' },
		{ value: 'DFH5180', label: 'DFH5180' }
	],
	'福田': [
		{ value: 'BJ1180', label: 'BJ1180' },
		{ value: 'BJ5180', label: 'BJ5180' },
		{ value: '欧曼EST', label: '欧曼EST' }
	],
	'江淮': [
		{ value: 'HFC1180', label: 'HFC1180' },
		{ value: 'HFC5180', label: 'HFC5180' },
		{ value: '帅铃Q6', label: '帅铃Q6' }
	],
	'重汽': [
		{ value: 'ZZ5180', label: 'ZZ5180' },
		{ value: 'ZZ1250', label: 'ZZ1250' },
		{ value: '豪沃T7H', label: '豪沃T7H' }
	],
	'陕汽': [
		{ value: 'SX1180', label: 'SX1180' },
		{ value: 'SX5180', label: 'SX5180' },
		{ value: '德龙X3000', label: '德龙X3000' }
	],
	'现代': [
		{ value: '帕力安牌4.5吨冷链车', label: '帕力安牌4.5吨冷链车' },
		{ value: '帕力安牌18吨双飞翼货车', label: '帕力安牌18吨双飞翼货车' },
		{ value: '4.5吨货车', label: '4.5吨货车' }
	],
	'飞驰': [
		{ value: '49吨牵引车头', label: '49吨牵引车头' }
	],
	'宇通': [
		{ value: '49吨牵引车头', label: '49吨牵引车头' }
	]
};

// 我司车辆档案：车牌 → 品牌/型号（原型数据，联调时对接车辆管理）
var LL_VEHICLE_PLATE_REGISTRY = {
	'粤AGQ8393': { brand: '现代', model: '帕力安牌4.5吨冷链车' },
	'粤AGR3208': { brand: '现代', model: '帕力安牌4.5吨冷链车' },
	'粤AGP9835': { brand: '现代', model: '帕力安牌4.5吨冷链车' },
	'浙F02608F': { brand: '现代', model: '帕力安牌18吨双飞翼货车' },
	'浙F00688F': { brand: '飞驰', model: '49吨牵引车头' },
	'沪A66921F': { brand: '苏龙', model: '海格牌KLQ5180XYKFCEV' },
	'浙F07588F': { brand: '飞驰', model: '49吨牵引车头' },
	'粤AGP5156': { brand: '现代', model: '帕力安牌4.5吨冷链车' }
};

// 车辆氢费明细（原型）：车牌 + 加氢日期 → 成本总价；联调后对接「车辆氢费明细」接口按日汇总
var LL_H2_FEE_DETAIL_MOCK = [
	{ plateNo: '粤AGQ8393', refuelDate: '2026-01-01', costTotal: 300.00 },
	{ plateNo: '粤AGR3208', refuelDate: '2026-01-01', costTotal: 304.15 },
	{ plateNo: '粤AGP9835', refuelDate: '2026-01-01', costTotal: 220.00 },
	{ plateNo: '浙F02608F', refuelDate: '2026-02-03', costTotal: 420.00 }
];

// ETC 通行记录（原型）：车牌 + 通行日期 → 通行费用；联调后对接「ETC记录」按日汇总
var LL_ETC_RECORD_MOCK = [
	{ plateNo: '粤AGQ8393', passDate: '2026-01-01', fee: 12.50 },
	{ plateNo: '粤AGQ8393', passDate: '2026-01-01', fee: 8.00 },
	{ plateNo: '粤AGP9835', passDate: '2026-01-01', fee: 22.00 },
	{ plateNo: '粤AGP9835', passDate: '2026-01-01', fee: 15.04 },
	{ plateNo: '浙F02608F', passDate: '2026-02-03', fee: 30.00 },
	{ plateNo: '浙F02608F', passDate: '2026-02-03', fee: 32.00 }
];

var LL_KPI_CARDS = [
	{
		key: 'count',
		title: '台账条数',
		desc: '统计当前筛选条件下的全部台账记录条数。例如筛选后共有记录 A、B、C 三条，则台账条数 = 3。',
		format: 'count'
	},
	{
		key: 'amount',
		title: '金额合计',
		desc: '将当前筛选条件下每条台账记录的「金额」逐项相加：记录 A 金额 + 记录 B 金额 + 记录 C 金额 + …',
		format: 'money'
	},
	{
		key: 'totalCost',
		title: '总成本合计',
		desc: '将当前筛选条件下每条台账记录的「总成本」逐项相加：记录 A 总成本 + 记录 B 总成本 + 记录 C 总成本 + …',
		format: 'money'
	},
	{
		key: 'hydrogenFee',
		title: '氢费总计',
		desc: '将当前筛选条件下每条台账记录的「氢费」逐项相加：记录 A 氢费 + 记录 B 氢费 + 记录 C 氢费 + …',
		format: 'money'
	},
	{
		key: 'etcFee',
		title: 'ETC费用总计',
		desc: '将当前筛选条件下每条台账记录的「ETC费用」逐项相加：记录 A ETC费用 + 记录 B ETC费用 + 记录 C ETC费用 + …',
		format: 'money'
	},
	{
		key: 'profitLoss',
		title: '盈亏合计',
		desc: '将当前筛选条件下每条台账记录的「盈亏」逐项相加：记录 A 盈亏 + 记录 B 盈亏 + 记录 C 盈亏 + …',
		format: 'money'
	}
];

var LL_MULTI_TRIP_OPTIONS = [
	{ value: '否', label: '否' },
	{ value: '是', label: '是' }
];

var LL_OPERATORS = [
	{ id: 'u_tan', name: '谈云', role: 'staff' },
	{ id: 'u_liu', name: '刘念念', role: 'staff' },
	{ id: 'u_dong', name: '董剑煜', role: 'staff' },
	{ id: 'u_super', name: '王主管', role: 'supervisor' }
];

var LL_CHANGE_LOG_FIELD_LABELS = {
	month: '月份',
	dispatchDate: '出车日期',
	businessName: '业务名称',
	driver: '司机',
	phone: '电话',
	vehicleUndertaker: '车辆承接方',
	plateNo: '车牌号码',
	brand: '品牌',
	model: '型号',
	unitPrice: '单价',
	quantity: '数量',
	amount: '金额',
	hydrogenFee: '氢费',
	etcFee: 'ETC费用',
	salary: '薪资',
	electricityFee: '电费',
	manualReimburse: '人工报销费用',
	dailySocialSecurity: '日社保服务费',
	dailyTrailer: '日挂车费用',
	dailyParking: '日停车费用',
	dailyTire: '日轮胎费用',
	vehicleFee: '车辆费用',
	multiTrip: '是否多趟',
	routePricing: '线路计价',
	remark: '备注',
	_create: '新增记录',
	_import: '批量导入'
};

var LL_LOG_TRACK_FIELDS = [
	'month', 'dispatchDate', 'businessName', 'driver', 'phone', 'vehicleUndertaker', 'plateNo', 'brand', 'model',
	'unitPrice', 'quantity', 'amount', 'hydrogenFee', 'etcFee', 'salary', 'electricityFee', 'manualReimburse',
	'dailySocialSecurity', 'dailyTrailer', 'dailyParking', 'dailyTire', 'vehicleFee', 'multiTrip', 'routePricing', 'remark'
];

var LL_ZH_DATE_LOCALE = {
	lang: {
		locale: 'zh_CN',
		placeholder: '请选择日期',
		rangePlaceholder: ['开始日期', '结束日期'],
		today: '今天',
		now: '此刻',
		backToToday: '返回今天',
		ok: '确定',
		clear: '清除',
		month: '月',
		year: '年',
		monthSelect: '选择月份',
		yearSelect: '选择年份',
		decadeSelect: '选择年代',
		previousMonth: '上个月',
		nextMonth: '下个月',
		previousYear: '上一年',
		nextYear: '下一年',
		shortWeekDays: ['日', '一', '二', '三', '四', '五', '六'],
		shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
	},
	timePickerLocale: { placeholder: '请选择时间' }
};

function llBrandOptions() {
	return Object.keys(LL_BRAND_MODEL_MAP).map(function (b) { return { value: b, label: b }; });
}

function llModelOptions(brand) {
	if (!brand || !LL_BRAND_MODEL_MAP[brand]) return [];
	return LL_BRAND_MODEL_MAP[brand];
}

function llIsOurUndertaker(v) { return v === '我司'; }

function llLookupByPlate(plateNo) {
	if (!plateNo) return null;
	return LL_VEHICLE_PLATE_REGISTRY[String(plateNo).trim()] || null;
}

function llApplyPlateLookup(row) {
	if (!llIsOurUndertaker(row.vehicleUndertaker)) return row;
	var hit = llLookupByPlate(row.plateNo);
	if (!hit) return Object.assign({}, row, { brand: row.brand || undefined, model: row.model || undefined });
	return Object.assign({}, row, { brand: hit.brand, model: hit.model });
}

function llColTitle(label) {
	return React.createElement('span', { className: 'll-th-title' },
		label,
		React.createElement('span', { className: 'll-th-required', title: '必填' }, '*')
	);
}

function llSvgIcon(paths, size) {
	return React.createElement('svg', {
		width: size || 18, height: size || 18, viewBox: '0 0 24 24', fill: 'none',
		stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true
	}, paths.map(function (p, i) {
		if (p.tag === 'circle') return React.createElement('circle', { key: i, cx: p.cx, cy: p.cy, r: p.r });
		if (p.tag === 'line') return React.createElement('line', { key: i, x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2 });
		return React.createElement('path', { key: i, d: p.d });
	}));
}

// PRD 正文同步：物流业务台账-产品需求说明.md、物流业务台账-需求内容.js
var LL_REQUIREMENT_DOC = `# 物流业务台账 — 产品需求说明（PRD）

| 项目 | 内容 |
|------|------|
| 文档版本 | v1.0 |
| 产品模块 | 数据分析 → 物流业务台账 |
| 文档类型 | 产品需求说明 |
| 适用读者 | 产品、业务、研发、测试 |
| 对齐来源 | 《2026年业务二部运营台账总表》子表「1.2物流业务台账」 |

---

## 一、为什么做这件事

### 1.1 业务背景

业务二部物流运营涉及出车记录、营收、氢费、ETC、人工及车辆日成本等多类费用，原先分散在 Excel 子表中维护，存在以下问题：

- 各操作人各自维护，主管难以统一查看与核对；
- 氢费、ETC 等费用与系统台账（车辆氢费明细、ETC 记录）缺乏自动比对，易录入偏差；
- 缺少按筛选条件汇总营收与成本的能力，经营分析效率低。

### 1.2 产品目标

建设 Web 端「物流业务台账」页面，支撑业务服务组操作人**录入、查询、导入、导出、删改**各自台账；主管可**查看全部**操作人数据；系统自动计算总成本、盈亏，并对氢费/ETC 异常给出提示。

### 1.3 本期不做

- 与财务系统过账、审批流（后续迭代）；
- 复杂组织架构数据权限（本期按「操作人 / 主管」两类角色）；
- 菜单路由注册（由 Axhub / 系统导航统一配置）。

---

## 二、角色与权限

| 角色 | 数据范围 | 可执行操作 |
|------|----------|------------|
| **业务服务组操作人** | 仅本人维护的台账 | 筛选、新增、行内编辑、弹窗编辑、导入、导出、批量删除（本人数据）、查看变更日志 |
| **业务服务组主管** | 全部操作人台账 | 筛选、查看、编辑/删除任意记录、导出、批量删除、查看变更日志；**不可**导入、表格底部新增 |

**原型说明：** 页面顶部提供「当前登录（原型切换）」下拉，用于演示不同角色；正式环境由系统登录态与权限接口驱动。

---

## 三、页面结构

用户进入「数据分析 → 物流业务台账」后，自上而下为：

1. 右上角 **「查看需求说明」**
2. **原型用户切换**（仅原型）
3. **筛选条件区**
4. **KPI 统计卡片**（6 张）
5. **列表工具栏**（批量导入 / 批量删除 / 导出）
6. **数据列表**
7. **表格底部新增入口**（操作人可见）
8. **弹窗**：批量导入、编辑台账、变更日志、需求说明

---

## 四、筛选条件

**交互原则：** 修改条件后需点击 **「查询」** 生效；**「重置」** 清空条件。

**默认展示：** 第一行 4 项（月份、出车日期、业务名称、车牌号码）；点击 **「展开更多筛选项」** 显示其余条件；可 **「收起」**。

| 筛选项 | 说明 |
|--------|------|
| 月份 | 月份选择器，中文展示（如 2026年01月）；占位「全部月份」 |
| 出车日期 | 日期区间，占位「开始日期 / 结束日期」，中文选择器 |
| 业务名称 | 下拉选择器，支持输入模糊搜索匹配项；查询为精确匹配所选业务 |
| 车牌号码 | **多选**；未选任何车牌时视为「全部」；可勾选/取消单个车牌 |
| 车辆承接方 | 我司 / 第三方车队 |
| 品牌 | 下拉，与型号级联 |
| 型号 | 需先选品牌；选项来自「型号参数」模块品牌型号映射 |
| 维护人 | **仅主管可见**；按台账维护人筛选 |

---

## 五、KPI 统计卡片

统计范围为 **当前筛选条件下的全部台账记录**，卡片右上角 ? 可查看计算说明。

| 卡片 | 计算规则（示例表述） |
|------|----------------------|
| 台账条数 | 筛选后记录 A、B、C… 的条数合计 |
| 金额合计 | 记录 A 金额 + 记录 B 金额 + 记录 C 金额 + … |
| 总成本合计 | 记录 A 总成本 + 记录 B 总成本 + … |
| 氢费总计 | 记录 A 氢费 + 记录 B 氢费 + … |
| ETC费用总计 | 记录 A ETC费用 + 记录 B ETC费用 + … |
| 盈亏合计 | 记录 A 盈亏 + 记录 B 盈亏 + … |

卡片顺序：台账条数 → 金额合计 → 总成本合计 → 氢费总计 → ETC费用总计 → 盈亏合计。

---

## 六、列表字段与排序

### 6.1 主要列

序号、月份、出车日期、业务名称、司机、电话、车辆承接方、车牌号码、品牌、型号、单价、数量、金额、氢费、ETC费用、薪资、电费、人工报销费用、日社保服务费、日挂车费用、日停车费用、日轮胎费用、车辆费用、总成本、盈亏、是否多趟、线路计价、备注、**操作人**、**最后操作时间**、操作。

- **主管**额外在列表前部展示 **维护人** 列。
- **出车日期** 默认 **降序**；点击表头可在降序/升序间切换。
- **数量** 支持 2 位小数。

### 6.2 自动计算

- **金额** = 单价 × 数量（修改单价或数量时自动重算，亦可手填金额）。
- **总成本** = 氢费 + ETC费用 + 薪资 + 电费 + 人工报销费用 + 日社保服务费 + 日挂车费用 + 日停车费用 + 日轮胎费用 + 车辆费用。
- **盈亏** = 金额 − 总成本。

### 6.3 氢费 / ETC 异常提示

当台账填写的氢费或 ETC 与系统按 **车牌 + 出车日期** 汇总值不一致时，对应单元格显示橙色警告图标，悬停提示：

- 氢费：\`成本总价（元）：xxx\`（对接「车辆氢费明细」按日汇总）
- ETC：\`ETC记录总金额（元）：xxx\`（对接 ETC 通行记录按日汇总）

---

## 七、车辆承接方与车牌

| 承接方 | 车牌 | 品牌型号 | 校验 |
|--------|------|----------|------|
| **我司** | 下拉选择档案车牌 | 根据车牌自动带出，不可手改 | 保存时校验车牌存在于车辆档案 |
| **第三方车队** | 自由输入 | 品牌、型号手动级联选择 | 不校验车牌档案 |

品牌型号级联与「型号参数」模块一致（现代、飞驰、宇通等）。

---

## 八、维护方式

### 8.1 表格底部新增（操作人）

- 点击 **「新增一行」** 在表格底部追加 **草稿行**（绿色背景）。
- 草稿行支持 **行内编辑**；操作列显示 **保存 / 取消**。
- 保存前校验：出车日期、业务名称、车辆承接方、车牌号码、单价、数量，以及氢费/ETC/薪资/电费/人工报销/日社保/日挂车/日停车/日轮胎等费用项（允许填 0）。

### 8.2 弹窗编辑

- 已有记录：操作列 **更多（⋮）→ 编辑**，弹窗表单修改。
- 保存后更新 **操作人、最后操作时间**，并写入变更日志。

### 8.3 批量导入（操作人）

1. 下载 CSV 模板（字段对齐子表 1.2，月份格式 YYYY-MM）。
2. 上传 CSV；导入记录归属当前登录操作人。
3. 车辆承接方为「我司」时按车牌自动匹配品牌型号；总成本、盈亏系统计算。

### 8.4 导出

- 导出 **当前筛选结果全部记录**（含排序后顺序）。
- 字段含导入模板全部列 + 总成本、盈亏；主管导出额外含维护人。
- 文件名：\`物流业务台账_时间戳.csv\`。

### 8.5 批量删除

- 列表左侧多选；仅可勾选本人有权维护的记录。
- 工具栏 **批量删除**，二次确认后删除所选记录。

### 8.6 单条删除

- 更多 → 删除，二次确认。

---

## 九、操作列

| 行状态 | 操作列展示 |
|--------|------------|
| 草稿行（操作人） | 保存、取消 |
| 已保存（有权维护） | 更多 ⋮：编辑、删除、变更日志 |
| 无权维护 | 无操作 |

样式参照「车辆氢费明细」操作列图标按钮。

---

## 十、变更日志

入口：操作列 **更多 → 变更日志**。

记录以下场景的字段变更：行内新增保存、弹窗编辑、批量导入。展示：修改时间、修改人、修改字段、修改前、修改后。

---

## 十一、联调接口（研发）

| 能力 | 对接说明 |
|------|----------|
| 车辆档案 | 「车辆管理」车牌 → 品牌/型号 |
| 氢费比对 | 「车辆氢费明细」按车牌+加氢日期汇总 costTotal |
| ETC 比对 | ETC 通行记录按车牌+通行日期汇总 fee |
| 品牌型号 | 「型号参数」品牌型号级联 |
| 用户权限 | 登录用户 ID、角色（操作人/主管） |

---

## 十二、验收要点（测试）

1. 操作人仅见本人数据；主管见全部。
2. 筛选默认收起第一行；展开后条件查询正确；车牌多选空=全部。
3. KPI 随筛选变化；? 提示文案正确。
4. 出车日期默认降序，表头切换升序。
5. 我司/第三方车队车牌与品牌型号联动及校验。
6. 氢费/ETC 不一致时出现警告提示。
7. 导入、导出、批量删除、变更日志流程可用。
8. 操作人、最后操作时间在保存/编辑后更新。

**文档结束**
`;

var LL_ICONS = {
	upload: llSvgIcon([{ d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }, { d: 'M17 8l-5-5-5 5' }, { tag: 'line', x1: 12, y1: 3, x2: 12, y2: 15 }], 14),
	download: llSvgIcon([{ d: 'M12 3v12' }, { d: 'm7 10 5 5 5-5' }, { d: 'M5 21h14' }], 14),
	plus: llSvgIcon([{ tag: 'line', x1: 12, y1: 5, x2: 12, y2: 19 }, { tag: 'line', x1: 5, y1: 12, x2: 19, y2: 12 }], 14),
	truck: llSvgIcon([{ d: 'M10 17h4V5H2v12h3' }, { d: 'M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1' }, { tag: 'circle', cx: 7.5, cy: 17.5, r: 2.5 }, { tag: 'circle', cx: 17.5, cy: 17.5, r: 2.5 }], 22),
	warn: llSvgIcon([
		{ d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
		{ tag: 'line', x1: 12, y1: 9, x2: 12, y2: 13 },
		{ tag: 'line', x1: 12, y1: 17, x2: 12.01, y2: 17 }
	], 14),
	doc: llSvgIcon([
		{ d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
		{ tag: 'polyline', points: '14 2 14 8 20 8' },
		{ tag: 'line', x1: 16, y1: 13, x2: 8, y2: 13 },
		{ tag: 'line', x1: 16, y1: 17, x2: 8, y2: 17 }
	], 14)
};

function llParsePrdInlineText(text) {
	var parts = String(text || '').split(/(\*\*[^*]+\*\*)/g);
	var nodes = [];
	var i;
	for (i = 0; i < parts.length; i++) {
		var p = parts[i];
		if (!p) continue;
		if (p.indexOf('**') === 0 && p.lastIndexOf('**') === p.length - 2) {
			nodes.push(React.createElement('strong', { key: i }, p.slice(2, -2)));
		} else {
			nodes.push(p);
		}
	}
	return nodes.length === 1 ? nodes[0] : nodes;
}

function llIsPrdTableRow(line) {
	return /^\|.+\|$/.test(String(line || '').trim());
}

function llIsPrdTableSep(line) {
	return /^\|[\s\-:|]+\|$/.test(String(line || '').trim());
}

function llRenderPrdTableRow(line, rowKey, isHeader) {
	var cells = String(line).trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) { return c.trim(); });
	return React.createElement('tr', { key: rowKey },
		cells.map(function (cell, ci) {
			var Tag = isHeader ? 'th' : 'td';
			return React.createElement(Tag, {
				key: ci,
				style: {
					border: '1px solid #e5e7eb',
					padding: '8px 10px',
					textAlign: 'left',
					verticalAlign: 'top',
					fontWeight: isHeader ? 600 : 400,
					background: isHeader ? '#f8fafc' : '#fff',
					fontSize: 13,
					lineHeight: 1.5
				}
			}, llParsePrdInlineText(cell));
		})
	);
}

function llRenderPrdMarkdown(markdown) {
	var lines = String(markdown || '').split(/\r?\n/);
	var nodes = [];
	var i = 0;
	while (i < lines.length) {
		var line = lines[i];
		var trimmed = String(line || '').trim();
		if (trimmed === '---') {
			nodes.push(React.createElement('hr', { key: 'hr-' + i, style: { border: 'none', borderTop: '1px solid #e8ecf0', margin: '20px 0' } }));
			i += 1;
			continue;
		}
		if (llIsPrdTableRow(trimmed)) {
			var tableLines = [];
			while (i < lines.length && llIsPrdTableRow(String(lines[i]).trim())) {
				tableLines.push(String(lines[i]).trim());
				i += 1;
			}
			var bodyRows = [];
			var ti;
			for (ti = 0; ti < tableLines.length; ti++) {
				if (llIsPrdTableSep(tableLines[ti])) continue;
				bodyRows.push(llRenderPrdTableRow(tableLines[ti], 'tr-' + i + '-' + ti, ti === 0));
			}
			if (bodyRows.length) {
				nodes.push(React.createElement('div', { key: 'tbl-' + i, style: { overflowX: 'auto', margin: '12px 0 16px' } },
					React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
						React.createElement('tbody', null, bodyRows)
					)
				));
			}
			continue;
		}
		if (!trimmed) { i += 1; continue; }
		if (trimmed.indexOf('# ') === 0) {
			nodes.push(React.createElement('h1', { key: 'h1-' + i, style: { fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', lineHeight: 1.35 } }, llParsePrdInlineText(trimmed.slice(2).trim())));
			i += 1; continue;
		}
		if (trimmed.indexOf('## ') === 0) {
			nodes.push(React.createElement('h2', { key: 'h2-' + i, style: { fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '24px 0 12px', paddingBottom: 6, borderBottom: '2px solid #e0f2fe', lineHeight: 1.4 } }, llParsePrdInlineText(trimmed.slice(3).trim())));
			i += 1; continue;
		}
		if (trimmed.indexOf('### ') === 0) {
			nodes.push(React.createElement('h3', { key: 'h3-' + i, style: { fontSize: 14, fontWeight: 600, color: '#334155', margin: '16px 0 8px', lineHeight: 1.45 } }, llParsePrdInlineText(trimmed.slice(4).trim())));
			i += 1; continue;
		}
		if (trimmed === '**文档结束**') {
			nodes.push(React.createElement('div', { key: 'end-' + i, style: { marginTop: 24, paddingTop: 16, borderTop: '1px dashed #e2e8f0', color: '#94a3b8', fontSize: 13, textAlign: 'center' } }, '— 文档结束 —'));
			i += 1; continue;
		}
		if (/^\d+\.\s/.test(trimmed)) {
			nodes.push(React.createElement('div', { key: 'ol-' + i, style: { fontSize: 13, color: '#475569', lineHeight: 1.75, margin: '6px 0 6px 4px', paddingLeft: 4 } }, llParsePrdInlineText(trimmed)));
			i += 1; continue;
		}
		if (trimmed.indexOf('- ') === 0) {
			nodes.push(React.createElement('div', { key: 'ul-' + i, style: { display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.75, margin: '4px 0 4px 2px' } },
				React.createElement('span', { style: { color: '#1677ff', flexShrink: 0 } }, '•'),
				React.createElement('span', { style: { flex: 1 } }, llParsePrdInlineText(trimmed.slice(2).trim()))
			));
			i += 1; continue;
		}
		nodes.push(React.createElement('p', { key: 'p-' + i, style: { fontSize: 13, color: '#475569', lineHeight: 1.75, margin: '6px 0' } }, llParsePrdInlineText(trimmed)));
		i += 1;
	}
	return nodes;
}

function renderLlRequirementDocPanel() {
	return React.createElement('div', { className: 'll-req-doc-panel', style: { padding: '4px 4px 16px' } }, llRenderPrdMarkdown(LL_REQUIREMENT_DOC));
}

var _llRowSeq = 1;
function llNextKey() { return 'll-' + (_llRowSeq++); }

function llNum(v) {
	if (v === null || v === undefined || v === '') return 0;
	var n = Number(v);
	return isNaN(n) ? 0 : n;
}

function llRound(n) { return Math.round(llNum(n) * 100) / 100; }

function llFmtMoney(n) {
	return llRound(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function llFmtQty(n) {
	if (n === null || n === undefined || n === '') return '-';
	return llRound(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function llDispatchDayKey(v) {
	var d = llParseDate(v);
	if (d && typeof d.isValid === 'function' && d.isValid()) return d.format('YYYY-MM-DD');
	return '';
}

function llDispatchDateSortValue(v) {
	var d = llParseDate(v);
	if (d && typeof d.isValid === 'function' && d.isValid()) return d.valueOf();
	return 0;
}

function llCompareDispatchDate(a, b) {
	return llDispatchDateSortValue(a && a.dispatchDate) - llDispatchDateSortValue(b && b.dispatchDate);
}

function llGetH2DetailCostTotal(plateNo, dispatchDate) {
	if (!plateNo || !dispatchDate) return null;
	var day = llDispatchDayKey(dispatchDate);
	if (!day) return null;
	var plate = String(plateNo).trim();
	var total = 0;
	var found = false;
	var i;
	for (i = 0; i < LL_H2_FEE_DETAIL_MOCK.length; i++) {
		var item = LL_H2_FEE_DETAIL_MOCK[i];
		if (item.plateNo === plate && item.refuelDate === day) {
			total += llNum(item.costTotal);
			found = true;
		}
	}
	return found ? llRound(total) : null;
}

function llIsHydrogenFeeMismatch(row) {
	var detailTotal = llGetH2DetailCostTotal(row && row.plateNo, row && row.dispatchDate);
	if (detailTotal == null) return false;
	return Math.abs(llNum(row && row.hydrogenFee) - detailTotal) > 0.009;
}

function llHydrogenFeeMismatchTip(row) {
	var detailTotal = llGetH2DetailCostTotal(row && row.plateNo, row && row.dispatchDate);
	if (detailTotal == null) return '';
	return '成本总价（元）：' + llFmtMoney(detailTotal);
}

function llGetEtcRecordTotal(plateNo, dispatchDate) {
	if (!plateNo || !dispatchDate) return null;
	var day = llDispatchDayKey(dispatchDate);
	if (!day) return null;
	var plate = String(plateNo).trim();
	var total = 0;
	var found = false;
	var i;
	for (i = 0; i < LL_ETC_RECORD_MOCK.length; i++) {
		var item = LL_ETC_RECORD_MOCK[i];
		if (item.plateNo === plate && item.passDate === day) {
			total += llNum(item.fee);
			found = true;
		}
	}
	return found ? llRound(total) : null;
}

function llIsEtcFeeMismatch(row) {
	var recordTotal = llGetEtcRecordTotal(row && row.plateNo, row && row.dispatchDate);
	if (recordTotal == null) return false;
	return Math.abs(llNum(row && row.etcFee) - recordTotal) > 0.009;
}

function llEtcFeeMismatchTip(row) {
	var recordTotal = llGetEtcRecordTotal(row && row.plateNo, row && row.dispatchDate);
	if (recordTotal == null) return '';
	return 'ETC记录总金额（元）：' + llFmtMoney(recordTotal);
}

function llIsSupervisor(user) { return user && user.role === 'supervisor'; }

function llNow() {
	return window.dayjs ? window.dayjs() : null;
}

function llFmtDateTime(v) {
	if (!v) return '-';
	if (typeof v.format === 'function' && typeof v.isValid === 'function' && v.isValid()) {
		return v.format('YYYY-MM-DD HH:mm:ss');
	}
	var d = llParseDate(v);
	if (d && d.isValid && d.isValid()) return d.format('YYYY-MM-DD HH:mm:ss');
	return String(v);
}

function llTouchOperateMeta(row, user) {
	return Object.assign({}, row, {
		operatorName: user && user.name ? user.name : row.operatorName,
		lastOperateAt: llNow()
	});
}

function llFormatLogValue(field, val) {
	if (val == null || val === '') return '—';
	if (field === 'dispatchDate') return llFmtDate(val);
	if (field === 'month') return llFmtMonth(val);
	if (['unitPrice', 'quantity', 'amount', 'hydrogenFee', 'etcFee', 'salary', 'electricityFee', 'manualReimburse', 'dailySocialSecurity', 'dailyTrailer', 'dailyParking', 'dailyTire', 'vehicleFee', 'totalCost', 'profitLoss'].indexOf(field) >= 0) {
		return String(val);
	}
	return String(val);
}

function llParseDate(v) {
	if (!v || v === '-') return null;
	if (window.dayjs) {
		var d = window.dayjs(v);
		if (d.isValid()) return d;
		var serial = Number(v);
		if (!isNaN(serial) && serial > 30000) {
			var base = window.dayjs('1899-12-30');
			return base.add(serial, 'day');
		}
	}
	return null;
}

function llFmtDate(v) {
	var d = llParseDate(v);
	if (d && typeof d.isValid === 'function' && d.isValid()) return d.format('YYYY-MM-DD');
	return v ? String(v) : '-';
}

function llParseMonth(v, fallbackDate) {
	if (v && typeof v.format === 'function' && typeof v.isValid === 'function' && v.isValid()) {
		return v.format('YYYY-MM');
	}
	if (v === null || v === undefined || v === '') {
		var fd = llParseDate(fallbackDate);
		if (fd && fd.isValid()) return fd.format('YYYY-MM');
		return '';
	}
	var s = String(v).trim();
	if (window.dayjs) {
		var dm = window.dayjs(s, 'YYYY-MM', true);
		if (dm.isValid()) return dm.format('YYYY-MM');
		var n = Number(s);
		if (!isNaN(n) && n >= 1 && n <= 12) {
			var base = llParseDate(fallbackDate);
			var y = (base && base.isValid()) ? base.year() : window.dayjs().year();
			return y + '-' + String(n).padStart(2, '0');
		}
	}
	return s;
}

function llFmtMonth(v) {
	var parsed = llParseMonth(v);
	return parsed || '-';
}

function llMonthToDayjs(v, fallbackDate) {
	if (!v && v !== 0) {
		var fd = llParseDate(fallbackDate);
		return fd && fd.isValid() ? fd.startOf('month') : null;
	}
	if (window.dayjs) {
		if (v && typeof v.format === 'function' && typeof v.isValid === 'function' && v.isValid()) {
			return v.startOf('month');
		}
		var d = window.dayjs(String(v).trim(), 'YYYY-MM', true);
		if (d.isValid()) return d;
		var n = Number(v);
		if (!isNaN(n) && n >= 1 && n <= 12) {
			var base = llParseDate(fallbackDate);
			var y = (base && base.isValid()) ? base.year() : window.dayjs().year();
			return window.dayjs(new Date(y, n - 1, 1));
		}
	}
	return null;
}

function llRecalcRow(row) {
	var amount = llRound(row.amount);
	if (!amount && row.unitPrice != null && row.quantity != null) {
		amount = llRound(llNum(row.unitPrice) * llNum(row.quantity));
	}
	var totalCost = llRound(
		llNum(row.hydrogenFee) + llNum(row.etcFee) + llNum(row.salary) + llNum(row.electricityFee) +
		llNum(row.manualReimburse) + llNum(row.dailySocialSecurity) + llNum(row.dailyTrailer) +
		llNum(row.dailyParking) + llNum(row.dailyTire) + llNum(row.vehicleFee)
	);
	return Object.assign({}, row, {
		amount: amount,
		totalCost: totalCost,
		profitLoss: llRound(amount - totalCost)
	});
}

function llCanView(row, user, supervisor) {
	if (supervisor) return true;
	return row && row.createdBy === user.id;
}

function llCanMutate(row, user, supervisor) {
	if (supervisor) return true;
	return row && row.createdBy === user.id;
}

function llEscapeCsv(v) {
	var s = v == null ? '' : String(v);
	return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function llDownloadCsv(filename, headers, rows) {
	var lines = [headers.map(llEscapeCsv).join(',')].concat(
		(rows || []).map(function (r) { return r.map(llEscapeCsv).join(','); })
	);
	var blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
	var url = URL.createObjectURL(blob);
	var a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

function llBuildExportHeaders(supervisor) {
	var headers = LL_IMPORT_HEADERS.concat(['总成本', '盈亏']);
	if (supervisor) headers.push('维护人');
	return headers;
}

function llBuildExportRow(r, supervisor) {
	var row = [
		r.month || '',
		r.dispatchDate || '',
		r.businessName || '',
		r.driver || '',
		r.phone || '',
		r.vehicleUndertaker || '',
		r.plateNo || '',
		r.brand || '',
		r.model || '',
		r.unitPrice != null && r.unitPrice !== '' ? r.unitPrice : '',
		r.quantity != null && r.quantity !== '' ? r.quantity : '',
		r.amount != null && r.amount !== '' ? r.amount : '',
		r.hydrogenFee != null && r.hydrogenFee !== '' ? r.hydrogenFee : '',
		r.etcFee != null && r.etcFee !== '' ? r.etcFee : '',
		r.salary != null && r.salary !== '' ? r.salary : '',
		r.electricityFee != null && r.electricityFee !== '' ? r.electricityFee : '',
		r.manualReimburse != null && r.manualReimburse !== '' ? r.manualReimburse : '',
		r.dailySocialSecurity != null && r.dailySocialSecurity !== '' ? r.dailySocialSecurity : '',
		r.dailyTrailer != null && r.dailyTrailer !== '' ? r.dailyTrailer : '',
		r.dailyParking != null && r.dailyParking !== '' ? r.dailyParking : '',
		r.dailyTire != null && r.dailyTire !== '' ? r.dailyTire : '',
		r.vehicleFee != null && r.vehicleFee !== '' ? r.vehicleFee : '',
		r.multiTrip || '',
		r.routePricing || '',
		r.remark || '',
		r.totalCost != null && r.totalCost !== '' ? r.totalCost : '',
		r.profitLoss != null && r.profitLoss !== '' ? r.profitLoss : ''
	];
	if (supervisor) row.push(r.maintainerName || '');
	return row;
}

function llParseCsvLine(line) {
	var out = [];
	var cur = '';
	var inQ = false;
	var i;
	for (i = 0; i < line.length; i++) {
		var c = line[i];
		if (c === '"') { inQ = !inQ; continue; }
		if (c === ',' && !inQ) { out.push(cur.trim()); cur = ''; continue; }
		cur += c;
	}
	out.push(cur.trim());
	return out;
}

function llIsDraftRow(row) {
	return row && row.rowStatus === 'draft';
}

function llApplyRowFieldPatch(row, field, val) {
	var next = Object.assign({}, row);
	next[field] = val;
	if (field === 'month' && val && typeof val.format === 'function' && val.isValid && val.isValid()) {
		next.month = val.format('YYYY-MM');
	}
	if (field === 'dispatchDate' && val && typeof val.isValid === 'function' && val.isValid()) {
		next.month = val.format('YYYY-MM');
	}
	if (field === 'vehicleUndertaker') {
		if (val === '第三方车队') {
			next.brand = undefined;
			next.model = undefined;
		} else if (llIsOurUndertaker(val) && next.plateNo) {
			next = llApplyPlateLookup(next);
		}
	}
	if (field === 'plateNo' && llIsOurUndertaker(next.vehicleUndertaker)) {
		next = llApplyPlateLookup(Object.assign({}, next, { plateNo: val }));
	}
	if (field === 'brand') {
		next.model = undefined;
	}
	if (field === 'unitPrice' || field === 'quantity') {
		if (field === 'quantity' && val != null && val !== '') {
			next.quantity = llRound(val);
		}
		next.amount = llRound(llNum(next.unitPrice) * llNum(next.quantity));
	}
	return llRecalcRow(next);
}

function llIsFilledNum(val) {
	if (val === null || val === undefined || val === '') return false;
	return !isNaN(Number(val));
}

function llValidateRow(row) {
	if (!row.dispatchDate) return '请填写出车日期';
	if (!row.businessName || !String(row.businessName).trim()) return '请填写业务名称';
	if (!row.vehicleUndertaker) return '请选择车辆承接方';
	if (!row.plateNo || !String(row.plateNo).trim()) return '请填写车牌号码';
	if (llIsOurUndertaker(row.vehicleUndertaker)) {
		if (!llLookupByPlate(row.plateNo)) return '未在车辆档案中匹配到该车牌，请确认车牌或选择「第三方车队」';
	}
	if (!llIsFilledNum(row.unitPrice)) return '请填写单价';
	if (!llIsFilledNum(row.quantity)) return '请填写数量';
	var requiredNums = [
		['hydrogenFee', '氢费'],
		['etcFee', 'ETC费用'],
		['salary', '薪资'],
		['electricityFee', '电费'],
		['manualReimburse', '人工报销费用'],
		['dailySocialSecurity', '日社保服务费'],
		['dailyTrailer', '日挂车费用'],
		['dailyParking', '日停车费用'],
		['dailyTire', '日轮胎费用']
	];
	var i;
	for (i = 0; i < requiredNums.length; i++) {
		if (!llIsFilledNum(row[requiredNums[i][0]])) return '请填写' + requiredNums[i][1];
	}
	return '';
}

function llIsImportRowEmpty(cols) {
	if (!cols || !cols.length) return true;
	var i;
	for (i = 0; i < cols.length; i++) {
		if (String(cols[i] || '').trim()) return false;
	}
	return true;
}

function llValidateImportCsv(text, user) {
	var lines = String(text || '').split(/\r?\n/).filter(function (l) { return l.trim(); });
	if (lines.length < 2) {
		return { ok: false, errors: ['文件中未解析到有效数据，请确认已填写模板并保留表头行'] };
	}
	var headerCols = llParseCsvLine(lines[0]);
	if (headerCols.length < LL_IMPORT_HEADERS.length) {
		return { ok: false, errors: ['表头列数与模板不一致（应为 ' + LL_IMPORT_HEADERS.length + ' 列），请重新下载模板填写'] };
	}
	var errors = [];
	var imported = [];
	var i;
	for (i = 1; i < lines.length; i++) {
		var cols = llParseCsvLine(lines[i]);
		if (llIsImportRowEmpty(cols)) continue;
		var rowNo = i + 1;
		var undertakerVal = cols[5];
		if (undertakerVal && undertakerVal !== '我司' && undertakerVal !== '第三方车队') {
			errors.push('第 ' + rowNo + ' 行：车辆承接方只能填写「我司」或「第三方车队」');
			continue;
		}
		var isNewFmt = cols[5] === '我司' || cols[5] === '第三方车队';
		var multiTripIdx = (isNewFmt ? 9 : 7) + 13;
		var multiTripVal = cols[multiTripIdx];
		if (multiTripVal && multiTripVal !== '是' && multiTripVal !== '否') {
			errors.push('第 ' + rowNo + ' 行：是否多趟只能填写「是」或「否」');
			continue;
		}
		var row = llRowFromImportCols(cols, user);
		var err = llValidateRow(row);
		if (err) {
			errors.push('第 ' + rowNo + ' 行：' + err);
			continue;
		}
		imported.push(row);
	}
	if (!imported.length && !errors.length) {
		return { ok: false, errors: ['未解析到有效数据行，请检查业务名称、车牌号码等必填项是否已填写'] };
	}
	if (errors.length) {
		var displayErrors = errors.length > 10 ? errors.slice(0, 10).concat(['… 还有 ' + (errors.length - 10) + ' 条错误未展示']) : errors;
		return { ok: false, errors: displayErrors, partialCount: imported.length };
	}
	return { ok: true, rows: imported };
}

function llBuildEmptyRow(user) {
	var now = window.dayjs ? window.dayjs() : null;
	return llRecalcRow({
		key: llNextKey(),
		rowStatus: 'draft',
		createdBy: user.id,
		maintainerName: user.name,
		operatorName: user.name,
		lastOperateAt: llNow(),
		month: now ? now.format('YYYY-MM') : '',
		dispatchDate: now,
		businessName: '',
		driver: '',
		phone: '',
		vehicleUndertaker: '我司',
		plateNo: '',
		brand: undefined,
		model: undefined,
		unitPrice: undefined,
		quantity: 1,
		amount: undefined,
		hydrogenFee: 0,
		etcFee: 0,
		salary: 0,
		electricityFee: 0,
		manualReimburse: 0,
		dailySocialSecurity: 0,
		dailyTrailer: 0,
		dailyParking: 0,
		dailyTire: 0,
		vehicleFee: 0,
		multiTrip: '否',
		routePricing: '',
		remark: ''
	});
}

function llRowFromImportCols(cols, user) {
	var d = llParseDate(cols[1]);
	var isNewFormat = cols[5] === '我司' || cols[5] === '第三方车队';
	var undertaker;
	var plateNo;
	var brand;
	var model;
	var unitPriceIdx;
	if (isNewFormat) {
		undertaker = cols[5] || '我司';
		plateNo = cols[6] || '';
		brand = cols[7] || '';
		model = cols[8] || '';
		unitPriceIdx = 9;
	} else {
		undertaker = '我司';
		plateNo = cols[5] || '';
		brand = '';
		model = cols[6] || '';
		unitPriceIdx = 7;
	}
	var row = llRecalcRow({
		key: llNextKey(),
		rowStatus: 'saved',
		createdBy: user.id,
		maintainerName: user.name,
		operatorName: user.name,
		lastOperateAt: llNow(),
		month: llParseMonth(cols[0], cols[1] || d),
		dispatchDate: d || cols[1] || null,
		businessName: cols[2] || '',
		driver: cols[3] || '',
		phone: cols[4] || '',
		vehicleUndertaker: undertaker,
		plateNo: plateNo,
		brand: brand,
		model: model,
		unitPrice: llNum(cols[unitPriceIdx]),
		quantity: llNum(cols[unitPriceIdx + 1]),
		amount: llNum(cols[unitPriceIdx + 2]),
		hydrogenFee: llNum(cols[unitPriceIdx + 3]),
		etcFee: llNum(cols[unitPriceIdx + 4]),
		salary: llNum(cols[unitPriceIdx + 5]),
		electricityFee: llNum(cols[unitPriceIdx + 6]),
		manualReimburse: llNum(cols[unitPriceIdx + 7]),
		dailySocialSecurity: llNum(cols[unitPriceIdx + 8]),
		dailyTrailer: llNum(cols[unitPriceIdx + 9]),
		dailyParking: llNum(cols[unitPriceIdx + 10]),
		dailyTire: llNum(cols[unitPriceIdx + 11]),
		vehicleFee: llNum(cols[unitPriceIdx + 12]),
		multiTrip: cols[unitPriceIdx + 13] || '否',
		routePricing: cols[unitPriceIdx + 14] || '',
		remark: cols[unitPriceIdx + 15] || ''
	});
	return llApplyPlateLookup(row);
}

function llBuildMockRows() {
	var samples = [
		['2026-01', '2026-01-01', '嘉兴金小悦贸易有限公司', '王召善', '15112321670', '我司', '粤AGQ8393', '现代', '帕力安牌4.5吨冷链车', '590', '1', '590', '303.8', '0', '258.06', '0', '0', '40', '0', '0', '20', '80', '否', '', ''],
		['2026-01', '2026-01-01', '嘉兴金小悦贸易有限公司', '杨国平', '13720987869', '我司', '粤AGR3208', '现代', '帕力安牌4.5吨冷链车', '610', '1', '610', '304.15', '0', '258.06', '0', '0', '40', '0', '0', '20', '80', '否', '', ''],
		['2026-01', '2026-01-01', '嘉兴益顺冷链物流有限公司', '曹文想', '18321541863', '我司', '粤AGP9835', '现代', '帕力安牌4.5吨冷链车', '553.94', '1', '553.94', '215.6', '37.04', '290.32', '0', '5', '40', '0', '0', '20', '80', '否', '敏胜-梅山', ''],
		['2026-02', '2026-02-03', '杭州绿道城配科技有限公司', '李强', '13800138001', '我司', '浙F02608F', '现代', '帕力安牌18吨双飞翼货车', '680', '2', '1360', '420', '56', '300', '12', '0', '40', '0', '15', '20', '80', '是', '嘉兴-杭州', '']
	];
	var tan = LL_OPERATORS[0];
	var liu = LL_OPERATORS[1];
	var rows = [];
	var i;
	for (i = 0; i < 3; i++) rows.push(llRowFromImportCols(samples[i], tan));
	rows.push(llRowFromImportCols(samples[3], liu));
	return rows;
}

function llEmptyForm(user) {
	var now = window.dayjs ? window.dayjs() : null;
	return {
		month: now ? now.startOf('month') : null,
		dispatchDate: now,
		businessName: '',
		driver: '',
		phone: '',
		vehicleUndertaker: '我司',
		plateNo: '',
		brand: undefined,
		model: undefined,
		unitPrice: undefined,
		quantity: 1,
		amount: undefined,
		hydrogenFee: 0,
		etcFee: 0,
		salary: 0,
		electricityFee: 0,
		manualReimburse: 0,
		dailySocialSecurity: 0,
		dailyTrailer: 0,
		dailyParking: 0,
		dailyTire: 0,
		vehicleFee: 0,
		multiTrip: '否',
		routePricing: '',
		remark: '',
		createdBy: user.id,
		maintainerName: user.name
	};
}

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;
	var useRef = React.useRef;

	var antd = window.antd;
	var ConfigProvider = antd.ConfigProvider;
	var App = antd.App;
	var Card = antd.Card;
	var Button = antd.Button;
	var Table = antd.Table;
	var Select = antd.Select;
	var Input = antd.Input;
	var InputNumber = antd.InputNumber;
	var DatePicker = antd.DatePicker;
	var Modal = antd.Modal;
	var Form = antd.Form;
	var Upload = antd.Upload;
	var Steps = antd.Steps;
	var Dropdown = antd.Dropdown;
	var Tooltip = antd.Tooltip;
	var message = antd.message;

	var zhCN = antd.locale && antd.locale.zhCN;
	var datePickerLocale = (zhCN && zhCN.DatePicker) || LL_ZH_DATE_LOCALE;

	var currentUser = LL_OPERATORS[0];
	var isSupervisor = llIsSupervisor(currentUser);

	var rowsState = useState(llBuildMockRows);
	var allRows = rowsState[0];
	var setAllRows = rowsState[1];

	var monthDraftState = useState(undefined);
	var monthDraft = monthDraftState[0];
	var setMonthDraft = monthDraftState[1];
	var businessDraftState = useState(undefined);
	var businessDraft = businessDraftState[0];
	var setBusinessDraft = businessDraftState[1];
	var plateDraftState = useState([]);
	var plateDraft = plateDraftState[0];
	var setPlateDraft = plateDraftState[1];
	var undertakerDraftState = useState(undefined);
	var undertakerDraft = undertakerDraftState[0];
	var setUndertakerDraft = undertakerDraftState[1];
	var brandDraftState = useState(undefined);
	var brandDraft = brandDraftState[0];
	var setBrandDraft = brandDraftState[1];
	var modelDraftState = useState(undefined);
	var modelDraft = modelDraftState[0];
	var setModelDraft = modelDraftState[1];
	var operatorDraftState = useState(undefined);
	var operatorDraft = operatorDraftState[0];
	var setOperatorDraft = operatorDraftState[1];
	var dateRangeDraftState = useState(null);
	var dateRangeDraft = dateRangeDraftState[0];
	var setDateRangeDraft = dateRangeDraftState[1];

	var filterExpandedState = useState(false);
	var filterExpanded = filterExpandedState[0];
	var setFilterExpanded = filterExpandedState[1];

	var requirementModalOpenState = useState(false);
	var requirementModalOpen = requirementModalOpenState[0];
	var setRequirementModalOpen = requirementModalOpenState[1];

	var monthAppliedState = useState(undefined);
	var monthApplied = monthAppliedState[0];
	var setMonthApplied = monthAppliedState[1];
	var businessAppliedState = useState(undefined);
	var businessApplied = businessAppliedState[0];
	var setBusinessApplied = businessAppliedState[1];
	var plateAppliedState = useState([]);
	var plateApplied = plateAppliedState[0];
	var setPlateApplied = plateAppliedState[1];
	var undertakerAppliedState = useState(undefined);
	var undertakerApplied = undertakerAppliedState[0];
	var setUndertakerApplied = undertakerAppliedState[1];
	var brandAppliedState = useState(undefined);
	var brandApplied = brandAppliedState[0];
	var setBrandApplied = brandAppliedState[1];
	var modelAppliedState = useState(undefined);
	var modelApplied = modelAppliedState[0];
	var setModelApplied = modelAppliedState[1];
	var operatorAppliedState = useState(undefined);
	var operatorApplied = operatorAppliedState[0];
	var setOperatorApplied = operatorAppliedState[1];
	var dateRangeAppliedState = useState(null);
	var dateRangeApplied = dateRangeAppliedState[0];
	var setDateRangeApplied = dateRangeAppliedState[1];

	var dispatchSortState = useState('descend');
	var dispatchSortOrder = dispatchSortState[0];
	var setDispatchSortOrder = dispatchSortState[1];

	var selectedRowKeysState = useState([]);
	var selectedRowKeys = selectedRowKeysState[0];
	var setSelectedRowKeys = selectedRowKeysState[1];

	var importOpenState = useState(false);
	var importOpen = importOpenState[0];
	var setImportOpen = importOpenState[1];
	var importErrorsState = useState([]);
	var importErrors = importErrorsState[0];
	var setImportErrors = importErrorsState[1];
	var importStepState = useState(0);
	var importStep = importStepState[0];
	var setImportStep = importStepState[1];

	var formOpenState = useState(false);
	var formOpen = formOpenState[0];
	var setFormOpen = formOpenState[1];
	var editingKeyState = useState(null);
	var editingKey = editingKeyState[0];
	var setEditingKey = editingKeyState[1];
	var formState = useState(llEmptyForm(currentUser));
	var formData = formState[0];
	var setFormData = formState[1];

	var changeLogsByKeyState = useState({});
	var changeLogsByKey = changeLogsByKeyState[0];
	var setChangeLogsByKey = changeLogsByKeyState[1];
	var changeLogModalState = useState({ open: false, rowKey: null, title: '' });
	var changeLogModal = changeLogModalState[0];
	var setChangeLogModal = changeLogModalState[1];

	React.useEffect(function () {
		if (window.dayjs && typeof window.dayjs.locale === 'function') {
			try { window.dayjs.locale('zh-cn'); } catch (eLocale) { /* ignore */ }
		}
	}, []);

	var changeLogsSeededRef = useRef(false);
	React.useEffect(function () {
		if (changeLogsSeededRef.current || !allRows.length) return;
		changeLogsSeededRef.current = true;
		var first = allRows[0];
		if (!first || !first.key) return;
		var demoAt = llNow();
		var demoAt2 = demoAt && demoAt.subtract ? demoAt.subtract(1, 'day') : demoAt;
		setChangeLogsByKey(function (prev) {
			if (prev[first.key] && prev[first.key].length) return prev;
			var next = Object.assign({}, prev);
			next[first.key] = [
				{
					id: 'll-clog-demo-1',
					at: demoAt,
					userId: first.createdBy,
					userName: first.operatorName || first.maintainerName || '—',
					field: 'hydrogenFee',
					fieldLabel: '氢费',
					before: '300.00',
					after: '303.80'
				},
				{
					id: 'll-clog-demo-2',
					at: demoAt2,
					userId: first.createdBy,
					userName: first.operatorName || first.maintainerName || '—',
					field: '_import',
					fieldLabel: '批量导入',
					before: '—',
					after: '导入创建'
				}
			];
			return next;
		});
	}, [allRows]);

	var appendChangeLog = useCallback(function (rowKey, field, before, after, rowCtx, meta) {
		if (!rowKey) return;
		meta = meta || {};
		var fieldLabel = meta.fieldLabel || LL_CHANGE_LOG_FIELD_LABELS[field] || field;
		var beforeText = meta.beforeText != null ? meta.beforeText : llFormatLogValue(field, before, rowCtx);
		var afterText = meta.afterText != null ? meta.afterText : llFormatLogValue(field, after, rowCtx);
		if (!meta.force && beforeText === afterText) return;
		setChangeLogsByKey(function (prev) {
			var list = (prev[rowKey] || []).slice();
			list.unshift({
				id: 'll-clog-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
				at: llNow(),
				userId: currentUser.id,
				userName: currentUser.name,
				field: field,
				fieldLabel: fieldLabel,
				before: beforeText,
				after: afterText
			});
			var next = Object.assign({}, prev);
			next[rowKey] = list;
			return next;
		});
	}, [currentUser]);

	var diffAndLogRow = useCallback(function (oldRow, newRow) {
		if (!oldRow || !newRow) return;
		var i;
		for (i = 0; i < LL_LOG_TRACK_FIELDS.length; i++) {
			var field = LL_LOG_TRACK_FIELDS[i];
			var beforeVal = oldRow[field];
			var afterVal = newRow[field];
			if (field === 'dispatchDate') {
				beforeVal = llFmtDate(beforeVal);
				afterVal = llFmtDate(afterVal);
			} else if (field === 'month') {
				beforeVal = llFmtMonth(beforeVal);
				afterVal = llFmtMonth(afterVal);
			}
			if (String(beforeVal == null ? '' : beforeVal) !== String(afterVal == null ? '' : afterVal)) {
				appendChangeLog(newRow.key, field, oldRow[field], newRow[field], newRow);
			}
		}
	}, [appendChangeLog]);

	var openChangeLogModal = useCallback(function (record) {
		if (!record) return;
		var title = record.businessName || record.plateNo || record.key;
		setChangeLogModal({ open: true, rowKey: record.key, title: title });
	}, []);

	var closeChangeLogModal = useCallback(function () {
		setChangeLogModal({ open: false, rowKey: null, title: '' });
	}, []);

	function filterOption(input, option) {
		return String(option && option.label || '').toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function renderFilterField(label, control) {
		return React.createElement('div', { className: 'lc-filter-field' },
			React.createElement('span', { className: 'lc-filter-field-label' }, label),
			React.createElement('div', { className: 'lc-filter-field-control' }, control)
		);
	}

	var visibleRows = useMemo(function () {
		var list = allRows.filter(function (r) { return llCanView(r, currentUser, isSupervisor); });
		if (monthApplied) {
			var appliedMonth = llParseMonth(monthApplied);
			list = list.filter(function (r) { return llParseMonth(r.month) === appliedMonth; });
		}
		if (businessApplied) {
			list = list.filter(function (r) { return r.businessName === businessApplied; });
		}
		if (plateApplied && plateApplied.length) {
			var plateSet = {};
			plateApplied.forEach(function (p) { plateSet[p] = true; });
			list = list.filter(function (r) { return plateSet[r.plateNo]; });
		}
		if (undertakerApplied) list = list.filter(function (r) { return r.vehicleUndertaker === undertakerApplied; });
		if (brandApplied) list = list.filter(function (r) { return r.brand === brandApplied; });
		if (modelApplied) list = list.filter(function (r) { return r.model === modelApplied; });
		if (operatorApplied) list = list.filter(function (r) { return r.maintainerName === operatorApplied; });
		if (dateRangeApplied && dateRangeApplied[0] && dateRangeApplied[1] && window.dayjs) {
			var s = window.dayjs(dateRangeApplied[0]).startOf('day');
			var e = window.dayjs(dateRangeApplied[1]).endOf('day');
			list = list.filter(function (r) {
				var d = llParseDate(r.dispatchDate);
				return d && !d.isBefore(s) && !d.isAfter(e);
			});
		}
		return list;
	}, [allRows, currentUser, isSupervisor, monthApplied, businessApplied, plateApplied, undertakerApplied, brandApplied, modelApplied, operatorApplied, dateRangeApplied]);

	var tableRows = useMemo(function () {
		var list = visibleRows.slice();
		list.sort(function (a, b) {
			var draftA = llIsDraftRow(a);
			var draftB = llIsDraftRow(b);
			if (draftA !== draftB) return draftA ? 1 : -1;
			var cmp = llCompareDispatchDate(a, b);
			return dispatchSortOrder === 'ascend' ? cmp : -cmp;
		});
		return list.map(function (r, idx) { return Object.assign({}, r, { seq: idx + 1 }); });
	}, [visibleRows, dispatchSortOrder]);

	var statSummary = useMemo(function () {
		return visibleRows.reduce(function (acc, r) {
			acc.amount += llNum(r.amount);
			acc.totalCost += llNum(r.totalCost);
			acc.profitLoss += llNum(r.profitLoss);
			acc.hydrogenFee += llNum(r.hydrogenFee);
			acc.etcFee += llNum(r.etcFee);
			return acc;
		}, { count: visibleRows.length, amount: 0, totalCost: 0, profitLoss: 0, hydrogenFee: 0, etcFee: 0 });
	}, [visibleRows]);

	var plateOptions = useMemo(function () {
		var map = {};
		allRows.forEach(function (r) { if (r.plateNo) map[r.plateNo] = true; });
		Object.keys(LL_VEHICLE_PLATE_REGISTRY).forEach(function (p) { map[p] = true; });
		return Object.keys(map).sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); }).map(function (p) {
			return { value: p, label: p };
		});
	}, [allRows]);

	var businessOptions = useMemo(function () {
		var map = {};
		allRows.forEach(function (r) { if (r.businessName) map[r.businessName] = true; });
		return Object.keys(map).sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); }).map(function (n) {
			return { value: n, label: n };
		});
	}, [allRows]);

	var filterModelOptions = useMemo(function () { return llModelOptions(brandDraft); }, [brandDraft]);

	var registryPlateOptions = useMemo(function () {
		return Object.keys(LL_VEHICLE_PLATE_REGISTRY).map(function (p) { return { value: p, label: p }; });
	}, []);

	var formModelOptions = useMemo(function () { return llModelOptions(formData.brand); }, [formData.brand]);

	var operatorOptions = useMemo(function () {
		var map = {};
		LL_OPERATORS.forEach(function (o) { if (o.role === 'staff') map[o.name] = true; });
		allRows.forEach(function (r) { if (r.maintainerName) map[r.maintainerName] = true; });
		return Object.keys(map).map(function (n) { return { value: n, label: n }; });
	}, [allRows]);

	var handleQuery = useCallback(function () {
		setMonthApplied(monthDraft);
		setBusinessApplied(businessDraft);
		setPlateApplied(plateDraft ? plateDraft.slice() : []);
		setUndertakerApplied(undertakerDraft);
		setBrandApplied(brandDraft);
		setModelApplied(modelDraft);
		setOperatorApplied(operatorDraft);
		setDateRangeApplied(dateRangeDraft);
	}, [monthDraft, businessDraft, plateDraft, undertakerDraft, brandDraft, modelDraft, operatorDraft, dateRangeDraft]);

	var handleReset = useCallback(function () {
		setMonthDraft(undefined);
		setBusinessDraft(undefined);
		setPlateDraft([]);
		setUndertakerDraft(undefined);
		setBrandDraft(undefined);
		setModelDraft(undefined);
		setOperatorDraft(undefined);
		setDateRangeDraft(null);
		setMonthApplied(undefined);
		setBusinessApplied(undefined);
		setPlateApplied([]);
		setUndertakerApplied(undefined);
		setBrandApplied(undefined);
		setModelApplied(undefined);
		setOperatorApplied(undefined);
		setDateRangeApplied(null);
	}, []);

	var downloadTemplate = useCallback(function () {
		var sample = ['2026-01', '2026-01-01', '嘉兴金小悦贸易有限公司', '王召善', '15112321670', '我司', '粤AGQ8393', '现代', '帕力安牌4.5吨冷链车', '590', '1', '590', '303.8', '0', '258.06', '0', '0', '40', '0', '0', '20', '80', '否', '', ''];
		llDownloadCsv('物流业务台账导入模板.csv', LL_IMPORT_HEADERS, [sample]);
		setImportStep(1);
		message.success('已下载导入模板');
	}, []);

	var openImportModal = useCallback(function () {
		setImportErrors([]);
		setImportStep(0);
		setImportOpen(true);
	}, []);

	var closeImportModal = useCallback(function () {
		setImportErrors([]);
		setImportStep(0);
		setImportOpen(false);
	}, []);

	var rowSelection = useMemo(function () {
		return {
			selectedRowKeys: selectedRowKeys,
			onChange: function (keys) { setSelectedRowKeys(keys); },
			getCheckboxProps: function (record) {
				return { disabled: !llCanMutate(record, currentUser, isSupervisor) };
			},
			columnWidth: 40
		};
	}, [selectedRowKeys, currentUser, isSupervisor]);

	var handleBatchDelete = useCallback(function () {
		if (!selectedRowKeys.length) {
			message.warning('请先勾选要删除的记录');
			return;
		}
		var keySet = {};
		selectedRowKeys.forEach(function (k) { keySet[k] = true; });
		var deletable = allRows.filter(function (r) {
			return keySet[r.key] && llCanMutate(r, currentUser, isSupervisor);
		});
		if (!deletable.length) {
			message.warning('所选记录均无权删除');
			return;
		}
		Modal.confirm({
			title: '确认删除所选 ' + deletable.length + ' 条台账记录？',
			content: '删除后不可恢复，请谨慎操作。',
			okText: '删除',
			cancelText: '取消',
			okButtonProps: { danger: true },
			onOk: function () {
				var delSet = {};
				deletable.forEach(function (r) { delSet[r.key] = true; });
				setAllRows(function (prev) { return prev.filter(function (r) { return !delSet[r.key]; }); });
				setSelectedRowKeys(function (prev) { return prev.filter(function (k) { return !delSet[k]; }); });
				message.success('已删除 ' + deletable.length + ' 条记录');
			}
		});
	}, [selectedRowKeys, allRows, currentUser, isSupervisor]);

	var handleExport = useCallback(function () {
		if (!tableRows.length) {
			message.warning('当前筛选条件下暂无数据可导出');
			return;
		}
		var headers = llBuildExportHeaders(isSupervisor);
		var rows = tableRows.map(function (r) { return llBuildExportRow(r, isSupervisor); });
		var stamp = '';
		try {
			stamp = window.dayjs ? window.dayjs().format('YYYYMMDD_HHmmss') : String(Date.now());
		} catch (eExp) {
			stamp = String(Date.now());
		}
		llDownloadCsv('物流业务台账_' + stamp + '.csv', headers, rows);
		message.success('已导出 ' + rows.length + ' 条记录');
	}, [tableRows, isSupervisor]);

	var handleImportFile = useCallback(function (file) {
		if (!file) return false;
		setImportErrors([]);
		var name = String(file.name || '').toLowerCase();
		if (!name.endsWith('.csv')) {
			setImportErrors(['仅支持上传 .csv 格式文件，请使用下载的模板另存为 CSV 后上传']);
			return false;
		}
		var reader = new FileReader();
		reader.onload = function (e) {
			var text = String((e && e.target && e.target.result) || '');
			var result = llValidateImportCsv(text, currentUser);
			if (!result.ok) {
				setImportErrors(result.errors || ['导入校验失败，请检查文件内容']);
				return;
			}
			var imported = result.rows || [];
			imported.forEach(function (row) {
				appendChangeLog(row.key, '_import', null, null, row, {
					fieldLabel: '批量导入',
					beforeText: '—',
					afterText: '导入创建',
					force: true
				});
			});
			setAllRows(function (prev) { return prev.concat(imported); });
			setImportErrors([]);
			setImportOpen(false);
			message.success('已导入 ' + imported.length + ' 条记录');
		};
		reader.onerror = function () {
			setImportErrors(['文件读取失败，请重试或更换文件']);
		};
		reader.readAsText(file, 'UTF-8');
		return false;
	}, [currentUser, appendChangeLog]);

	var handleTableChange = useCallback(function (_pagination, _filters, sorter) {
		var s = Array.isArray(sorter) ? sorter[0] : sorter;
		if (!s || (s.columnKey !== 'dispatchDate' && s.field !== 'dispatchDate')) return;
		setDispatchSortOrder(s.order === 'ascend' ? 'ascend' : 'descend');
	}, []);

	var openCreate = useCallback(function () {
		setAllRows(function (prev) { return prev.concat([llBuildEmptyRow(currentUser)]); });
		message.success('已在表格底部新增一行，请直接填写');
	}, [currentUser]);

	var patchRow = useCallback(function (key, field, val) {
		setAllRows(function (prev) {
			return prev.map(function (r) {
				return r.key === key ? llApplyRowFieldPatch(r, field, val) : r;
			});
		});
	}, []);

	var handleSaveDraft = useCallback(function (record) {
		setAllRows(function (prev) {
			var latest = prev.filter(function (r) { return r.key === record.key; })[0];
			if (!latest) return prev;
			var err = llValidateRow(latest);
			if (err) {
				message.error(err);
				return prev;
			}
			var saved = llTouchOperateMeta(llApplyPlateLookup(Object.assign({}, latest, { rowStatus: 'saved' })), currentUser);
			appendChangeLog(saved.key, '_create', null, null, saved, {
				fieldLabel: '新增记录',
				beforeText: '—',
				afterText: '表格行内新增保存',
				force: true
			});
			message.success('已保存');
			return prev.map(function (r) { return r.key === record.key ? saved : r; });
		});
	}, [currentUser, appendChangeLog]);

	var handleCancelDraft = useCallback(function (record) {
		setAllRows(function (prev) { return prev.filter(function (r) { return r.key !== record.key; }); });
	}, []);

	var openEdit = useCallback(function (record) {
		if (!llCanMutate(record, currentUser, isSupervisor)) {
			message.warning('无权编辑该记录');
			return;
		}
		setEditingKey(record.key);
		setFormData(Object.assign({}, record, {
			dispatchDate: llParseDate(record.dispatchDate),
			month: llMonthToDayjs(record.month, record.dispatchDate)
		}));
		setFormOpen(true);
	}, [currentUser, isSupervisor]);

	var handleDelete = useCallback(function (record) {
		if (!llCanMutate(record, currentUser, isSupervisor)) {
			message.warning('无权删除该记录');
			return;
		}
		setAllRows(function (prev) { return prev.filter(function (r) { return r.key !== record.key; }); });
		setSelectedRowKeys(function (prev) { return prev.filter(function (k) { return k !== record.key; }); });
		message.success('已删除');
	}, [currentUser, isSupervisor]);

	var handleFormSave = useCallback(function () {
		if (!editingKey) return;
		var next = llTouchOperateMeta(llRecalcRow(llApplyPlateLookup(Object.assign({}, formData, {
			month: llParseMonth(formData.month, formData.dispatchDate),
			dispatchDate: formData.dispatchDate,
			rowStatus: 'saved',
			createdBy: formData.createdBy,
			maintainerName: formData.maintainerName
		}))), currentUser);
		var err = llValidateRow(next);
		if (err) {
			message.error(err);
			return;
		}
		setAllRows(function (prev) {
			var oldRow = prev.filter(function (r) { return r.key === editingKey; })[0];
			if (oldRow) diffAndLogRow(oldRow, Object.assign({}, next, { key: editingKey }));
			return prev.map(function (r) { return r.key === editingKey ? Object.assign({}, next, { key: editingKey }) : r; });
		});
		message.success('已更新');
		setFormOpen(false);
	}, [formData, editingKey, currentUser, diffAndLogRow]);

	var patchForm = useCallback(function (field, val) {
		setFormData(function (prev) { return llApplyRowFieldPatch(prev, field, val); });
	}, []);

	var previewCalc = useMemo(function () { return llRecalcRow(formData); }, [formData]);

	var formIsOurFleet = llIsOurUndertaker(formData.vehicleUndertaker);

	var columns = useMemo(function () {
		function moneyCell(v, cls) {
			return React.createElement('span', { className: 'll-cell-plain' + (cls ? ' ' + cls : '') }, llFmtMoney(v));
		}
		function editable(r) {
			return llIsDraftRow(r) && llCanMutate(r, currentUser, isSupervisor);
		}
		function plain(v) {
			return React.createElement('span', { className: 'll-cell-plain' }, v == null || v === '' ? '-' : v);
		}
		function plainText(text) {
			return React.createElement('span', { className: 'll-cell-plain' }, text);
		}
		function cellSelect(extra) {
			var opts = extra || {};
			var fit = opts.fit;
			var dropdownMin = opts.dropdownMin || 120;
			delete opts.fit;
			delete opts.dropdownMin;
			return Object.assign({
				size: 'small',
				className: 'll-cell-select' + (fit ? ' ll-cell-select--fit' : ''),
				popupMatchSelectWidth: false,
				dropdownStyle: { minWidth: dropdownMin },
				style: { width: '100%', minWidth: 0 }
			}, opts);
		}
		function cellInput(field, r) {
			return React.createElement(Input, {
				size: 'small',
				className: 'll-cell-input',
				value: r[field] || '',
				style: { width: '100%', minWidth: 0 },
				onChange: function (e) { patchRow(r.key, field, e.target.value); }
			});
		}
		function cellNum(field, r) {
			return React.createElement(InputNumber, {
				size: 'small',
				className: 'll-cell-input-number',
				controls: false,
				min: 0,
				precision: 2,
				style: { width: '100%' },
				value: r[field] == null ? null : r[field],
				onChange: function (v) { patchRow(r.key, field, v == null ? null : v); }
			});
		}
		function cellQty(r) {
			return React.createElement(InputNumber, {
				size: 'small',
				className: 'll-cell-input-number',
				controls: false,
				min: 0,
				precision: 2,
				step: 0.01,
				style: { width: '100%' },
				value: r.quantity == null || r.quantity === '' ? null : r.quantity,
				onChange: function (v) { patchRow(r.key, 'quantity', v == null ? null : v); }
			});
		}
		function feeWarnWrap(inner, tip) {
			if (!tip) return inner;
			return React.createElement('div', { className: 'll-fee-warn-cell' },
				inner,
				React.createElement(Tooltip, { title: tip, placement: 'top' },
					React.createElement('span', {
						role: 'img',
						'aria-label': tip,
						style: { flexShrink: 0, color: '#f59e0b', display: 'inline-flex', cursor: 'help', lineHeight: 0 }
					}, LL_ICONS.warn)
				)
			);
		}
		function hydrogenFeeCell(r) {
			var inner = editable(r) ? cellNum('hydrogenFee', r) : moneyCell(r.hydrogenFee);
			if (!llIsHydrogenFeeMismatch(r)) return inner;
			return feeWarnWrap(inner, llHydrogenFeeMismatchTip(r));
		}
		function etcFeeCell(r) {
			var inner = editable(r) ? cellNum('etcFee', r) : moneyCell(r.etcFee);
			if (!llIsEtcFeeMismatch(r)) return inner;
			return feeWarnWrap(inner, llEtcFeeMismatchTip(r));
		}
		var cols = [
			{ title: '序号', dataIndex: 'seq', key: 'seq', width: 56, fixed: 'left' },
			{ title: '月份', dataIndex: 'month', key: 'month', width: 108, render: function (v, r) {
				if (!editable(r)) return plainText(llFmtMonth(v));
				return React.createElement(DatePicker, {
					size: 'small',
					className: 'll-cell-date',
					picker: 'month',
					format: 'YYYY-MM',
					locale: datePickerLocale,
					style: { width: '100%' },
					value: llMonthToDayjs(r.month, r.dispatchDate),
					onChange: function (d) { patchRow(r.key, 'month', d); }
				});
			} },
			{ title: llColTitle('出车日期'), dataIndex: 'dispatchDate', key: 'dispatchDate', width: 124, sorter: true, sortOrder: dispatchSortOrder, sortDirections: ['descend', 'ascend'], render: function (v, r) {
				if (!editable(r)) return plainText(llFmtDate(v));
				return React.createElement(DatePicker, {
					size: 'small',
					className: 'll-cell-date',
					format: 'YYYY-MM-DD',
					locale: datePickerLocale,
					style: { width: '100%' },
					value: llParseDate(r.dispatchDate),
					onChange: function (d) { patchRow(r.key, 'dispatchDate', d); }
				});
			} },
			{ title: llColTitle('业务名称'), dataIndex: 'businessName', key: 'businessName', width: 220, render: function (v, r) {
				return editable(r) ? cellInput('businessName', r) : plain(v);
			} },
			{ title: '司机', dataIndex: 'driver', key: 'driver', width: 88, render: function (v, r) {
				return editable(r) ? cellInput('driver', r) : plain(v);
			} },
			{ title: '电话', dataIndex: 'phone', key: 'phone', width: 118, render: function (v, r) {
				return editable(r) ? cellInput('phone', r) : plain(v);
			} },
			{ title: llColTitle('车辆承接方'), dataIndex: 'vehicleUndertaker', key: 'vehicleUndertaker', width: 120, render: function (v, r) {
				if (!editable(r)) return plain(v);
				return React.createElement(Select, cellSelect({
					fit: true,
					dropdownMin: 140,
					value: r.vehicleUndertaker,
					options: LL_UNDERTAKER_OPTIONS,
					onChange: function (val) { patchRow(r.key, 'vehicleUndertaker', val); }
				}));
			} },
			{ title: llColTitle('车牌号码'), dataIndex: 'plateNo', key: 'plateNo', width: 132, render: function (v, r) {
				if (!editable(r)) return plain(v);
				if (llIsOurUndertaker(r.vehicleUndertaker)) {
					return React.createElement(Select, cellSelect({
						fit: true,
						dropdownMin: 132,
						allowClear: true,
						showSearch: true,
						placeholder: '车牌',
						value: r.plateNo || undefined,
						options: registryPlateOptions,
						filterOption: filterOption,
						onChange: function (val) { patchRow(r.key, 'plateNo', val || ''); }
					}));
				}
				return cellInput('plateNo', r);
			} },
			{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 96, render: function (v, r) {
				if (!editable(r)) return plain(v);
				if (llIsOurUndertaker(r.vehicleUndertaker)) return plain(r.brand);
				return React.createElement(Select, cellSelect({
					fit: true,
					dropdownMin: 120,
					allowClear: true,
					showSearch: true,
					placeholder: '品牌',
					value: r.brand,
					options: llBrandOptions(),
					filterOption: filterOption,
					onChange: function (val) { patchRow(r.key, 'brand', val); }
				}));
			} },
			{ title: '型号', dataIndex: 'model', key: 'model', width: 200, render: function (v, r) {
				if (!editable(r)) return plain(v);
				if (llIsOurUndertaker(r.vehicleUndertaker)) return plain(r.model);
				return React.createElement(Select, cellSelect({
					fit: true,
					dropdownMin: 220,
					allowClear: true,
					showSearch: true,
					placeholder: r.brand ? '型号' : '先选品牌',
					value: r.model,
					options: llModelOptions(r.brand),
					disabled: !r.brand,
					filterOption: filterOption,
					onChange: function (val) { patchRow(r.key, 'model', val); }
				}));
			} },
			{ title: llColTitle('单价'), dataIndex: 'unitPrice', key: 'unitPrice', width: 88, align: 'right', render: function (v, r) {
				return editable(r) ? cellNum('unitPrice', r) : moneyCell(v);
			} },
			{ title: llColTitle('数量'), dataIndex: 'quantity', key: 'quantity', width: 80, align: 'right', render: function (v, r) {
				return editable(r) ? cellQty(r) : plainText(llFmtQty(v));
			} },
			{ title: '金额', dataIndex: 'amount', key: 'amount', width: 96, align: 'right', render: function (v) { return moneyCell(v); } },
			{ title: llColTitle('氢费'), dataIndex: 'hydrogenFee', key: 'hydrogenFee', width: 108, align: 'right', render: function (_v, r) {
				return hydrogenFeeCell(r);
			} },
			{ title: llColTitle('ETC费用'), dataIndex: 'etcFee', key: 'etcFee', width: 108, align: 'right', render: function (_v, r) {
				return etcFeeCell(r);
			} },
			{ title: llColTitle('薪资'), dataIndex: 'salary', key: 'salary', width: 88, align: 'right', render: function (v, r) {
				return editable(r) ? cellNum('salary', r) : moneyCell(v);
			} },
			{ title: llColTitle('电费'), dataIndex: 'electricityFee', key: 'electricityFee', width: 80, align: 'right', render: function (v, r) {
				return editable(r) ? cellNum('electricityFee', r) : moneyCell(v);
			} },
			{ title: llColTitle('人工报销费用'), dataIndex: 'manualReimburse', key: 'manualReimburse', width: 104, align: 'right', render: function (v, r) {
				return editable(r) ? cellNum('manualReimburse', r) : moneyCell(v);
			} },
			{ title: llColTitle('日社保服务费'), dataIndex: 'dailySocialSecurity', key: 'dailySocialSecurity', width: 104, align: 'right', render: function (v, r) {
				return editable(r) ? cellNum('dailySocialSecurity', r) : moneyCell(v);
			} },
			{ title: llColTitle('日挂车费用'), dataIndex: 'dailyTrailer', key: 'dailyTrailer', width: 96, align: 'right', render: function (v, r) {
				return editable(r) ? cellNum('dailyTrailer', r) : moneyCell(v);
			} },
			{ title: llColTitle('日停车费用'), dataIndex: 'dailyParking', key: 'dailyParking', width: 96, align: 'right', render: function (v, r) {
				return editable(r) ? cellNum('dailyParking', r) : moneyCell(v);
			} },
			{ title: llColTitle('日轮胎费用'), dataIndex: 'dailyTire', key: 'dailyTire', width: 96, align: 'right', render: function (v, r) {
				return editable(r) ? cellNum('dailyTire', r) : moneyCell(v);
			} },
			{ title: '车辆费用', dataIndex: 'vehicleFee', key: 'vehicleFee', width: 88, align: 'right', render: function (v, r) {
				return editable(r) ? cellNum('vehicleFee', r) : moneyCell(v);
			} },
			{ title: '总成本', dataIndex: 'totalCost', key: 'totalCost', width: 96, align: 'right', render: function (v) { return moneyCell(v); } },
			{ title: '盈亏', dataIndex: 'profitLoss', key: 'profitLoss', width: 96, align: 'right', render: function (v) {
				return moneyCell(v, llNum(v) >= 0 ? 'll-profit-pos' : 'll-profit-neg');
			} },
			{ title: '是否多趟', dataIndex: 'multiTrip', key: 'multiTrip', width: 96, render: function (v, r) {
				if (!editable(r)) return plain(v);
				return React.createElement(Select, cellSelect({
					fit: true,
					dropdownMin: 96,
					value: r.multiTrip,
					options: LL_MULTI_TRIP_OPTIONS,
					onChange: function (val) { patchRow(r.key, 'multiTrip', val); }
				}));
			} },
			{ title: '线路计价', dataIndex: 'routePricing', key: 'routePricing', width: 120, render: function (v, r) {
				return editable(r) ? cellInput('routePricing', r) : plain(v);
			} },
			{ title: '备注', dataIndex: 'remark', key: 'remark', width: 120, render: function (v, r) {
				return editable(r) ? cellInput('remark', r) : plain(v);
			} },
			{ title: '操作人', dataIndex: 'operatorName', key: 'operatorName', width: 88, render: function (v, r) {
				return plain(v || r.maintainerName);
			} },
			{ title: '最后操作时间', dataIndex: 'lastOperateAt', key: 'lastOperateAt', width: 156, render: function (v) {
				return plain(llFmtDateTime(v));
			} }
		];
		if (isSupervisor) {
			cols.splice(3, 0, { title: '维护人', dataIndex: 'maintainerName', key: 'maintainerName', width: 88, render: function (v) { return plain(v); } });
		}
		cols.push({
			title: '操作', key: 'action', width: 56, align: 'center', fixed: 'right',
			render: function (_, record) {
				var canEdit = llCanMutate(record, currentUser, isSupervisor);
				if (llIsDraftRow(record) && canEdit) {
					return React.createElement('div', { style: { display: 'inline-flex', gap: 8 } },
						React.createElement(Button, { type: 'link', size: 'small', className: 'lc-action-btn', onClick: function () { handleSaveDraft(record); } }, '保存'),
						React.createElement(Button, { type: 'link', size: 'small', className: 'lc-action-btn lc-action-btn-danger', onClick: function () { handleCancelDraft(record); } }, '取消')
					);
				}
				if (!canEdit) return null;

				function renderIconAction(title, iconNode, onClick, extraClass, disabled) {
					var cls = 'll-action-icon-btn' + (extraClass ? ' ' + extraClass : '') + (disabled ? ' is-disabled' : '');
					return React.createElement(Tooltip, { title: title },
						React.createElement('span', {
							className: cls,
							role: 'button',
							tabIndex: disabled ? -1 : 0,
							'aria-label': title,
							onClick: disabled || !onClick ? undefined : function (e) { e.stopPropagation(); }
						}, iconNode)
					);
				}

				function renderMoreIcon() {
					return React.createElement('svg', { viewBox: '0 0 16 16', width: 16, height: 16, fill: 'currentColor', 'aria-hidden': true },
						React.createElement('circle', { cx: 8, cy: 3, r: 1.5 }),
						React.createElement('circle', { cx: 8, cy: 8, r: 1.5 }),
						React.createElement('circle', { cx: 8, cy: 13, r: 1.5 })
					);
				}

				function buildMoreMenuItems() {
					return [
						{ key: 'edit', label: '编辑', onClick: function () { openEdit(record); } },
						{ key: 'delete', label: '删除', danger: true, onClick: function () {
							Modal.confirm({
								title: '确认删除该条台账？',
								okText: '删除',
								cancelText: '取消',
								okButtonProps: { danger: true },
								onOk: function () { handleDelete(record); }
							});
						} },
						{ type: 'divider', key: 'divider-log' },
						{ key: 'changelog', label: '变更日志', onClick: function () { openChangeLogModal(record); } }
					];
				}

				return React.createElement(Dropdown, {
					trigger: ['click'],
					placement: 'bottomRight',
					menu: { items: buildMoreMenuItems() }
				}, renderIconAction('更多', renderMoreIcon(), null, 'll-row-more-btn'));
			}
		});
		return cols;
	}, [currentUser, isSupervisor, openEdit, handleDelete, handleSaveDraft, handleCancelDraft, patchRow, registryPlateOptions, dispatchSortOrder, openChangeLogModal, datePickerLocale]);

	var changeLogRows = useMemo(function () {
		if (!changeLogModal.rowKey) return [];
		return changeLogsByKey[changeLogModal.rowKey] || [];
	}, [changeLogModal.rowKey, changeLogsByKey]);

	var changeLogColumns = useMemo(function () {
		return [
			{ title: '修改时间', dataIndex: 'at', key: 'at', width: 168, render: function (v) { return llFmtDateTime(v); } },
			{ title: '修改人', dataIndex: 'userName', key: 'userName', width: 88, align: 'center' },
			{ title: '修改字段', dataIndex: 'fieldLabel', key: 'fieldLabel', width: 120, align: 'center' },
			{ title: '修改前', dataIndex: 'before', key: 'before', ellipsis: true, render: function (v) {
				return React.createElement('span', { style: { color: '#cf1322' } }, v == null || v === '' ? '—' : v);
			} },
			{ title: '修改后', dataIndex: 'after', key: 'after', ellipsis: true, render: function (v) {
				return React.createElement('span', { style: { color: '#389e0d' } }, v == null || v === '' ? '—' : v);
			} }
		];
	}, []);

	function renderStatCard(card) {
		var val = card.format === 'count' ? String(statSummary.count) : llFmtMoney(statSummary[card.key]);
		var valueClass = card.key === 'profitLoss' ? (statSummary.profitLoss >= 0 ? 'lc-stat-val--profit' : 'lc-stat-val--loss') : '';
		return React.createElement('div', { key: card.key, className: 'lc-alert-card lc-alert-card--total' },
			React.createElement('div', { className: 'lc-alert-card-tip-anchor' },
				React.createElement(Tooltip, { title: card.desc, placement: 'topRight', overlayStyle: { maxWidth: 360 } },
					React.createElement('span', { className: 'lc-alert-card-tip', role: 'img', 'aria-label': card.title + '说明' },
						llSvgIcon([{ tag: 'circle', cx: 12, cy: 12, r: 10 }, { tag: 'line', x1: 12, y1: 16, x2: 12, y2: 12 }, { tag: 'line', x1: 12, y1: 8, x2: 12.01, y2: 8 }], 10)
					)
				)
			),
			React.createElement('div', { className: 'lc-alert-card-icon', 'aria-hidden': true }, LL_ICONS.truck),
			React.createElement('div', { className: 'lc-alert-card-main' },
				React.createElement('div', { className: 'lc-alert-card-title' }, card.title),
				React.createElement('div', { className: 'lc-alert-card-val ' + valueClass }, val)
			)
		);
	}

	function renderFormItem(label, node) {
		return React.createElement(Form.Item, { label: label, style: { marginBottom: 12 } }, node);
	}

	function buildFilterFields() {
		var fields = [
			renderFilterField('月份', React.createElement(DatePicker, {
				picker: 'month',
				format: 'YYYY年MM月',
				placeholder: '全部月份',
				allowClear: true,
				locale: datePickerLocale,
				style: { width: '100%' },
				value: monthDraft,
				onChange: setMonthDraft
			})),
			renderFilterField('出车日期', React.createElement(DatePicker.RangePicker, {
				style: { width: '100%' },
				format: 'YYYY-MM-DD',
				placeholder: ['开始日期', '结束日期'],
				locale: datePickerLocale,
				value: dateRangeDraft,
				onChange: setDateRangeDraft
			})),
			renderFilterField('业务名称', React.createElement(Select, {
				allowClear: true,
				showSearch: true,
				placeholder: '请选择或输入业务名称',
				style: { width: '100%' },
				value: businessDraft,
				onChange: setBusinessDraft,
				options: businessOptions,
				filterOption: filterOption
			})),
			renderFilterField('车牌号码', React.createElement(Select, {
				mode: 'multiple',
				allowClear: true,
				showSearch: true,
				placeholder: '全部',
				maxTagCount: 'responsive',
				style: { width: '100%' },
				value: plateDraft,
				onChange: setPlateDraft,
				options: plateOptions,
				filterOption: filterOption
			})),
			renderFilterField('车辆承接方', React.createElement(Select, { allowClear: true, placeholder: '全部', style: { width: '100%' }, value: undertakerDraft, onChange: setUndertakerDraft, options: LL_UNDERTAKER_OPTIONS })),
			renderFilterField('品牌', React.createElement(Select, { allowClear: true, showSearch: true, placeholder: '全部', style: { width: '100%' }, value: brandDraft, onChange: function (v) { setBrandDraft(v); setModelDraft(undefined); }, options: llBrandOptions(), filterOption: filterOption })),
			renderFilterField('型号', React.createElement(Select, { allowClear: true, showSearch: true, placeholder: brandDraft ? '全部' : '请先选择品牌', style: { width: '100%' }, value: modelDraft, onChange: setModelDraft, options: filterModelOptions, disabled: !brandDraft, filterOption: filterOption }))
		];
		if (isSupervisor) {
			fields.push(renderFilterField('维护人', React.createElement(Select, { allowClear: true, showSearch: true, placeholder: '全部', style: { width: '100%' }, value: operatorDraft, onChange: setOperatorDraft, options: operatorOptions, filterOption: filterOption })));
		}
		return fields;
	}

	return React.createElement(ConfigProvider, { locale: zhCN || undefined },
		React.createElement(App, null,
		React.createElement('style', null, LOGISTICS_PAGE_STYLE + LOGISTICS_TABLE_STYLE),
		React.createElement('div', { className: 'logistics-ledger-page' },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 16, flexShrink: 0 } },
				React.createElement(Button, {
					type: 'default',
					icon: LL_ICONS.doc,
					style: LL_REQ_BTN_STYLE,
					onClick: function () { setRequirementModalOpen(true); },
					'aria-label': '查看需求说明'
				}, '查看需求说明')
			),
			React.createElement('div', { style: { display: 'flex', flexDirection: 'column', flex: 1 } },
				React.createElement(Card, { className: 'lc-filter-card', title: '筛选条件', bordered: false },
					React.createElement('div', { className: 'lc-filter-grid' }, (function () {
						var items = buildFilterFields();
						var limit = filterExpanded ? items.length : 4;
						var out = [];
						var i;
						for (i = 0; i < limit && i < items.length; i++) out.push(items[i]);
						return out;
					})()),
					React.createElement('div', { className: 'lc-filter-actions' },
						buildFilterFields().length > 4 ? React.createElement(Button, {
							type: 'link',
							size: 'small',
							onClick: function () { setFilterExpanded(!filterExpanded); },
							style: { marginRight: 'auto', paddingLeft: 0, fontWeight: 600 }
						}, filterExpanded ? '收起' : '展开更多筛选项') : null,
						React.createElement(Button, { onClick: handleReset, style: { borderRadius: 8 } }, '重置'),
						React.createElement(Button, { type: 'primary', onClick: handleQuery, style: LL_PRIMARY_BTN }, '查询')
					)
				),

				React.createElement('div', { className: 'lc-alert-stats-row' }, LL_KPI_CARDS.map(renderStatCard)),

				React.createElement('div', { className: 'lc-table-section' },
					React.createElement('div', { className: 'lc-table-toolbar' },
						React.createElement('div', { className: 'lc-table-toolbar-actions' },
							!isSupervisor ? React.createElement(Button, { icon: LL_ICONS.upload, style: LL_OUTLINE_BTN, onClick: openImportModal }, '批量导入') : null,
							React.createElement(Button, {
								danger: true,
								disabled: !selectedRowKeys.length,
								onClick: handleBatchDelete,
								style: { borderRadius: 8, fontWeight: 600 }
							}, '批量删除'),
							React.createElement(Button, {
								onClick: handleExport,
								style: { borderRadius: 8, fontWeight: 600 }
							}, '导出')
						)
					),
					React.createElement('div', { className: 'lc-table-card' },
						React.createElement('div', { className: 'logistics-ledger-table-wrap' },
							React.createElement(Table, {
								className: 'logistics-ledger-table',
								size: 'small',
								bordered: true,
								rowKey: 'key',
								rowSelection: rowSelection,
								columns: columns,
								dataSource: tableRows,
								rowClassName: function (r) { return llIsDraftRow(r) ? 'll-row-draft' : ''; },
								onChange: handleTableChange,
								pagination: false,
								scroll: { x: 'max-content' },
								locale: { emptyText: React.createElement('div', { style: { padding: '32px 0', color: '#94a3b8' } }, '暂无符合筛选条件的台账记录') }
							})
						)
					),
					!isSupervisor ? React.createElement('div', { className: 'll-table-add-row-wrap' },
						React.createElement(Button, {
							type: 'dashed',
							block: true,
							className: 'll-add-row-btn',
							icon: LL_ICONS.plus,
							onClick: openCreate
						}, '新增一行')
					) : null
				)
			),

			React.createElement(Modal, {
				className: 'll-import-modal',
				wrapClassName: 'll-import-modal-wrap',
				title: React.createElement('span', { style: { fontWeight: 700 } }, '批量导入'),
				open: importOpen,
				onCancel: closeImportModal,
				footer: null,
				width: 560,
				centered: true,
				destroyOnClose: true
			},
				React.createElement('div', { className: 'll-import-content' },
					React.createElement('section', { className: 'll-import-steps-card', 'aria-label': '导入步骤' },
						React.createElement(Steps, {
							className: 'll-import-steps',
							current: importStep,
							size: 'small',
							items: [
								{ title: '下载模板' },
								{ title: '上传文件' }
							]
						})
					),
					React.createElement('section', { className: 'll-import-action-card', 'aria-label': '下载模板' },
						React.createElement('div', { className: 'll-import-action-row' },
							React.createElement('div', { className: 'll-import-action-meta' },
								React.createElement('span', { className: 'll-import-action-icon', 'aria-hidden': true }, LL_ICONS.download),
								React.createElement('span', { className: 'll-import-action-label' }, '下载模板')
							),
							React.createElement(Button, {
								type: 'primary',
								ghost: true,
								className: 'll-import-download-btn',
								icon: LL_ICONS.download,
								style: LL_OUTLINE_BTN,
								onClick: downloadTemplate
							}, '下载模板')
						)
					),
					React.createElement('section', { className: 'll-import-action-card ll-import-upload-card', 'aria-label': '上传文件' },
						React.createElement(Upload.Dragger, {
							className: 'll-import-dragger',
							accept: '.csv',
							maxCount: 1,
							showUploadList: true,
							beforeUpload: handleImportFile
						},
							React.createElement('div', { className: 'll-import-upload-inner' },
								React.createElement('span', { className: 'll-import-upload-icon', 'aria-hidden': true }, LL_ICONS.upload),
								React.createElement('p', { className: 'll-import-upload-title' }, '点击或拖拽文件进行导入'),
								React.createElement('p', { className: 'll-import-upload-hint' }, '仅支持 .csv 格式，单次上传一个文件')
							)
						)
					),
					importErrors && importErrors.length ? React.createElement('div', { className: 'll-import-fail', role: 'alert' },
						React.createElement('div', { className: 'll-import-fail-title' }, '导入校验未通过'),
						React.createElement('ul', { className: 'll-import-error-list' },
							importErrors.map(function (err, idx) {
								return React.createElement('li', { key: 'import-err-' + idx }, err);
							})
						)
					) : null
				)
			),

			React.createElement(Modal, {
				title: '编辑台账',
				open: formOpen && !!editingKey,
				onCancel: function () { setFormOpen(false); },
				onOk: handleFormSave,
				okText: '保存',
				cancelText: '取消',
				width: 760,
				centered: true,
				destroyOnClose: true
			},
				React.createElement('div', { className: 'll-form-grid' },
					renderFormItem('月份', React.createElement(DatePicker, {
						picker: 'month',
						format: 'YYYY年MM月',
						placeholder: '请选择月份',
						locale: datePickerLocale,
						style: { width: '100%' },
						value: formData.month,
						onChange: function (v) { patchForm('month', v); }
					})),
					renderFormItem('出车日期', React.createElement(DatePicker, {
						style: { width: '100%' },
						format: 'YYYY-MM-DD',
						placeholder: '请选择出车日期',
						locale: datePickerLocale,
						value: formData.dispatchDate,
						onChange: function (v) { patchForm('dispatchDate', v); }
					})),
					renderFormItem('业务名称', React.createElement(Input, { value: formData.businessName, onChange: function (e) { patchForm('businessName', e.target.value); } })),
					renderFormItem('司机', React.createElement(Input, { value: formData.driver, onChange: function (e) { patchForm('driver', e.target.value); } })),
					renderFormItem('电话', React.createElement(Input, { value: formData.phone, onChange: function (e) { patchForm('phone', e.target.value); } })),
					renderFormItem('车辆承接方', React.createElement(Select, { style: { width: '100%' }, value: formData.vehicleUndertaker, onChange: function (v) { patchForm('vehicleUndertaker', v); }, options: LL_UNDERTAKER_OPTIONS })),
					renderFormItem('车牌号码', formIsOurFleet
						? React.createElement(Select, {
							allowClear: true,
							showSearch: true,
							placeholder: '请选择我司车牌',
							style: { width: '100%' },
							value: formData.plateNo || undefined,
							onChange: function (v) { patchForm('plateNo', v || ''); },
							options: registryPlateOptions,
							filterOption: filterOption
						})
						: React.createElement(Input, { placeholder: '第三方车牌，不做档案校验', value: formData.plateNo, onChange: function (e) { patchForm('plateNo', e.target.value); } })
					),
					renderFormItem('品牌', formIsOurFleet
						? React.createElement(Select, {
							disabled: true,
							style: { width: '100%' },
							value: formData.brand,
							placeholder: formData.plateNo ? '根据车牌自动匹配' : '请先选择车牌',
							options: formData.brand ? [{ value: formData.brand, label: formData.brand }] : []
						})
						: React.createElement(Select, {
							allowClear: true,
							showSearch: true,
							placeholder: '请选择品牌',
							style: { width: '100%' },
							value: formData.brand,
							onChange: function (v) { patchForm('brand', v); },
							options: llBrandOptions(),
							filterOption: filterOption
						})
					),
					renderFormItem('型号', formIsOurFleet
						? React.createElement(Select, {
							disabled: true,
							style: { width: '100%' },
							value: formData.model,
							placeholder: formData.plateNo ? '根据车牌自动匹配' : '请先选择车牌',
							options: formData.model ? [{ value: formData.model, label: formData.model }] : []
						})
						: React.createElement(Select, {
							allowClear: true,
							showSearch: true,
							placeholder: formData.brand ? '请选择型号' : '请先选择品牌',
							style: { width: '100%' },
							value: formData.model,
							onChange: function (v) { patchForm('model', v); },
							options: formModelOptions,
							disabled: !formData.brand,
							filterOption: filterOption
						})
					),
					renderFormItem('单价', React.createElement(InputNumber, { style: { width: '100%' }, min: 0, precision: 2, value: formData.unitPrice, onChange: function (v) { patchForm('unitPrice', v); } })),
					renderFormItem('数量', React.createElement(InputNumber, { style: { width: '100%' }, min: 0, precision: 2, step: 0.01, value: formData.quantity, onChange: function (v) { patchForm('quantity', v); } })),
					renderFormItem('金额', React.createElement(InputNumber, { style: { width: '100%' }, min: 0, precision: 2, value: formData.amount, onChange: function (v) { patchForm('amount', v); } })),
					renderFormItem('氢费', React.createElement(InputNumber, { style: { width: '100%' }, min: 0, precision: 2, value: formData.hydrogenFee, onChange: function (v) { patchForm('hydrogenFee', v); } })),
					renderFormItem('ETC费用', React.createElement(InputNumber, { style: { width: '100%' }, min: 0, precision: 2, value: formData.etcFee, onChange: function (v) { patchForm('etcFee', v); } })),
					renderFormItem('薪资', React.createElement(InputNumber, { style: { width: '100%' }, min: 0, precision: 2, value: formData.salary, onChange: function (v) { patchForm('salary', v); } })),
					renderFormItem('电费', React.createElement(InputNumber, { style: { width: '100%' }, min: 0, precision: 2, value: formData.electricityFee, onChange: function (v) { patchForm('electricityFee', v); } })),
					renderFormItem('人工报销费用', React.createElement(InputNumber, { style: { width: '100%' }, min: 0, precision: 2, value: formData.manualReimburse, onChange: function (v) { patchForm('manualReimburse', v); } })),
					renderFormItem('日社保服务费', React.createElement(InputNumber, { style: { width: '100%' }, min: 0, precision: 2, value: formData.dailySocialSecurity, onChange: function (v) { patchForm('dailySocialSecurity', v); } })),
					renderFormItem('日挂车费用', React.createElement(InputNumber, { style: { width: '100%' }, min: 0, precision: 2, value: formData.dailyTrailer, onChange: function (v) { patchForm('dailyTrailer', v); } })),
					renderFormItem('日停车费用', React.createElement(InputNumber, { style: { width: '100%' }, min: 0, precision: 2, value: formData.dailyParking, onChange: function (v) { patchForm('dailyParking', v); } })),
					renderFormItem('日轮胎费用', React.createElement(InputNumber, { style: { width: '100%' }, min: 0, precision: 2, value: formData.dailyTire, onChange: function (v) { patchForm('dailyTire', v); } })),
					renderFormItem('车辆费用', React.createElement(InputNumber, { style: { width: '100%' }, min: 0, precision: 2, value: formData.vehicleFee, onChange: function (v) { patchForm('vehicleFee', v); } })),
					renderFormItem('是否多趟', React.createElement(Select, { style: { width: '100%' }, value: formData.multiTrip, onChange: function (v) { patchForm('multiTrip', v); }, options: LL_MULTI_TRIP_OPTIONS })),
					renderFormItem('线路计价', React.createElement(Input, { value: formData.routePricing, onChange: function (e) { patchForm('routePricing', e.target.value); } })),
					renderFormItem('备注', React.createElement(Input.TextArea, { rows: 2, value: formData.remark, onChange: function (e) { patchForm('remark', e.target.value); } }))
				),
				React.createElement('div', { style: { marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 } },
					React.createElement('div', null,
						React.createElement('div', { style: { fontSize: 12, color: '#64748b', marginBottom: 4 } }, '总成本（自动）'),
						React.createElement('div', { className: 'll-form-readonly' }, llFmtMoney(previewCalc.totalCost))
					),
					React.createElement('div', null,
						React.createElement('div', { style: { fontSize: 12, color: '#64748b', marginBottom: 4 } }, '盈亏（自动）'),
						React.createElement('div', { className: 'll-form-readonly', style: { color: previewCalc.profitLoss >= 0 ? '#047857' : '#b91c1c' } }, llFmtMoney(previewCalc.profitLoss))
					),
					React.createElement('div', null,
						React.createElement('div', { style: { fontSize: 12, color: '#64748b', marginBottom: 4 } }, '维护人'),
						React.createElement('div', { className: 'll-form-readonly' }, editingKey ? formData.maintainerName : currentUser.name)
					)
				)
			),

			React.createElement(Modal, {
				title: '变更日志' + (changeLogModal.title ? ' · ' + changeLogModal.title : ''),
				open: changeLogModal.open,
				onCancel: closeChangeLogModal,
				footer: React.createElement(Button, { onClick: closeChangeLogModal }, '关闭'),
				width: 880,
				centered: true,
				destroyOnClose: true
			},
				React.createElement(Table, {
					size: 'small',
					bordered: true,
					rowKey: 'id',
					pagination: changeLogRows.length > 8 ? { pageSize: 8, showSizeChanger: false } : false,
					columns: changeLogColumns,
					dataSource: changeLogRows,
					locale: { emptyText: '暂无变更记录' },
					scroll: { x: 'max-content', y: 360 }
				})
			),

			React.createElement(Modal, {
				title: React.createElement('span', { style: { fontWeight: 700 } }, '需求说明 · 物流业务台账'),
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
			}, renderLlRequirementDocPanel())
		)
	)
	);
};
