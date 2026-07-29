// 【重要】必须使用 const Component 作为组件变量名
// 加氢站管理 - 站点信息（列表 + KPI 分类 + 独立新建/编辑页 + 使用说明书）

var H2_REGION_CASCADER_OPTIONS = [
	{ value: '浙江省', label: '浙江省', children: [{ value: '嘉兴市', label: '嘉兴市' }, { value: '杭州市', label: '杭州市' }, { value: '宁波市', label: '宁波市' }] },
	{ value: '上海市', label: '上海市', children: [{ value: '上海市', label: '上海市' }] },
	{ value: '江苏省', label: '江苏省', children: [{ value: '南京市', label: '南京市' }, { value: '苏州市', label: '苏州市' }] },
	{ value: '广东省', label: '广东省', children: [{ value: '广州市', label: '广州市' }, { value: '深圳市', label: '深圳市' }] }
];

var H2_STATION_KPI_CARDS = [
	{ key: 'all', type: 'total', title: '全部加氢站', desc: '纳入台账管理的全部站点' },
	{ key: 'balanceAlert', type: 'warning', title: '预付余额预警站点', desc: '预付余额低于所设提醒阈值的站点' },
	{ key: 'arrears', type: 'unuploaded', title: '已欠费站点', desc: '预付余额小于 0 的站点' },
	{ key: 'none', type: 'unuploaded', title: '无加氢站点', desc: '暂无加氢记录的站点' }
];

var H2_SIGNED_FILTER_CARDS = [
	{ key: 'yes', type: 'normal', title: '签约站点', desc: '已签约的加氢站点，点击快捷筛选' },
	{ key: 'no', type: 'unuploaded', title: '普通站点', desc: '尚未签约的加氢站点，点击快捷筛选' }
];

var H2_BUSINESS_STATUS_OPTIONS = [
	{ value: '营业中', label: '营业中' },
	{ value: '暂停营业', label: '暂停营业' },
	{ value: '停止营业', label: '停止营业' }
];

/** @see web端/styles/oneos-ant-table-global-fix.js — 与 ant-table-global-fix.css 保持同步 */
var ONEOS_ANT_TABLE_GLOBAL_FIX = [
	'.ant-table-container .ant-table-header { margin-bottom: 0 !important; }',
	'.ant-table-container .ant-table-body { margin-top: 0 !important; }',
	'.ant-table-container .ant-table-body > table, .ant-table-content table { margin-top: 0 !important; }',
	'.ant-table-tbody > tr.ant-table-measure-row, .ant-table-tbody > tr.ant-table-measure-row > td, .ant-table-tbody > tr.ant-table-measure-row > th { display: none !important; height: 0 !important; max-height: 0 !important; min-height: 0 !important; padding: 0 !important; margin: 0 !important; border: none !important; line-height: 0 !important; font-size: 0 !important; overflow: hidden !important; visibility: hidden !important; pointer-events: none !important; }'
];

var H2_PAGE_STYLE = ONEOS_ANT_TABLE_GLOBAL_FIX.concat([
	'.h2-station-page { --h2-form-row-gap: 20px; --h2-form-col-gap: 24px; --h2-form-label-gap: 8px; padding: 24px 24px 80px; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(165deg, #f1f5f9 0%, #f8fafc 50%, #f1f5f9 100%); overflow: hidden; box-sizing: border-box; }',
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
	'.h2-station-page .lc-filter-field-control .ant-input, .h2-station-page .lc-filter-field-control .ant-input-affix-wrapper, .h2-station-page .lc-filter-field-control .ant-select .ant-select-selector, .h2-station-page .lc-filter-field-control .ant-cascader .ant-select-selector { width: 100%; height: 32px !important; min-height: 32px !important; border-radius: 8px !important; box-sizing: border-box; }',
	'.h2-station-page .lc-filter-field-control .ant-input-affix-wrapper { display: inline-flex; align-items: center; padding-top: 0 !important; padding-bottom: 0 !important; }',
	'.h2-station-page .lc-filter-field-control .ant-input-affix-wrapper > input.ant-input { height: 30px; line-height: 30px; padding-top: 0; padding-bottom: 0; }',
	'.h2-station-page .lc-filter-field-control .ant-select-single .ant-select-selector { display: flex; align-items: center; }',
	'.h2-station-page .lc-filter-field-control .ant-select-single .ant-select-selector .ant-select-selection-search-input { height: 30px; }',
	'.h2-station-page .lc-filter-field-control .ant-select-single .ant-select-selector .ant-select-selection-item, .h2-station-page .lc-filter-field-control .ant-select-single .ant-select-selector .ant-select-selection-placeholder { line-height: 30px !important; }',
	'.h2-station-page .lc-filter-field-control .ant-cascader .ant-select-selector { display: flex; align-items: center; }',
	'.h2-station-page .lc-filter-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f5f9; }',
	'.h2-station-page .lc-alert-stats-row { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }',
	'@media (max-width: 1400px) { .h2-station-page .lc-alert-stats-row { grid-template-columns: repeat(3, minmax(0, 1fr)); } }',
	'@media (max-width: 900px) { .h2-station-page .lc-alert-stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }',
	'@media (max-width: 640px) { .h2-station-page .lc-alert-stats-row { grid-template-columns: 1fr; } }',
	'.h2-station-page .lc-alert-card { display: flex; align-items: center; gap: 14px; padding: 16px 30px 16px 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; position: relative; overflow: hidden; min-width: 0; min-height: 72px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-station-page .lc-alert-card-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }',
	'.h2-station-page .lc-alert-card-icon { flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(145deg, #0d7a63 0%, #065f4a 100%); color: #fff; box-shadow: 0 4px 12px rgba(6, 95, 74, 0.28); }',
	'.h2-station-page .lc-alert-card-icon svg { display: block; flex-shrink: 0; }',
	'.h2-station-page .lc-alert-card-val { font-size: 24px; font-weight: 800; line-height: 1.1; color: #0f172a; font-variant-numeric: tabular-nums; }',
	'.h2-station-page .lc-alert-card-title { font-size: 13px; font-weight: 500; color: #64748b; line-height: 1.3; }',
	'.h2-station-page .lc-alert-card-tip-anchor { position: absolute; top: 8px; right: 8px; z-index: 2; line-height: 0; }',
	'.h2-station-page .lc-alert-card-tip { width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #94a3b8; background: rgba(255,255,255,0.92); border: 1px solid #e2e8f0; cursor: help; line-height: 0; }',
	'.h2-station-page .lc-alert-card-tip:hover { color: #64748b; border-color: #cbd5e1; background: #fff; }',
	'.h2-station-page .lc-alert-card--total, .h2-station-page .lc-alert-card--normal, .h2-station-page .lc-alert-card--warning, .h2-station-page .lc-alert-card--unuploaded { background: #fff; border-color: #e2e8f0; }',
	'.h2-station-page .lc-alert-card--normal .lc-alert-card-val, .h2-station-page .lc-alert-card--warning .lc-alert-card-val, .h2-station-page .lc-alert-card--unuploaded .lc-alert-card-val { color: #0f172a; }',
	'.h2-station-page .lc-alert-card-clickable { cursor: pointer; transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease; }',
	'.h2-station-page .lc-alert-card-clickable:hover { box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08); }',
	'.h2-station-page .lc-alert-card-clickable:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.h2-station-page .lc-alert-card-active { box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25) !important; border-color: #10b981 !important; }',
	'.h2-station-page .lc-table-section { margin-bottom: 0; flex: 1; display: flex; flex-direction: column; min-height: 0; }',
	'.h2-station-page .lc-table-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px 16px; margin-bottom: 8px; min-height: 32px; }',
	'.h2-station-page .lc-table-legend-outer { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; padding: 6px 4px; font-size: 12px; color: #64748b; }',
	'.h2-station-page .lc-table-legend-label { font-weight: 600; color: #64748b; }',
	'.h2-station-page .lc-table-legend-item { display: inline-flex; align-items: center; gap: 6px; }',
	'.h2-station-page .lc-table-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }',
	'.h2-station-page .lc-table-toolbar-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-left: auto; }',
	'.h2-station-page .lc-table-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03); overflow: hidden; flex: 1; overflow-y: auto; display: flex; flex-direction: column; }',
	'.h2-station-page .lc-list-table .ant-table-wrapper, .h2-station-page .lc-list-table .ant-table { width: 100% !important; }',
	'.h2-station-page .lc-table-card .ant-table-thead > tr > th { background: #f8fafc !important; color: #475569 !important; font-weight: 700 !important; font-size: 13px !important; border-bottom: 1px solid #e2e8f0 !important; padding: 12px 16px !important; }',
	'.h2-station-page .lc-table-card .ant-table-tbody > tr.ant-table-measure-row, .h2-station-page .lc-table-card .ant-table-tbody > tr.ant-table-measure-row > td { height: 0 !important; max-height: 0 !important; padding: 0 !important; margin: 0 !important; border: none !important; line-height: 0 !important; font-size: 0 !important; overflow: hidden !important; visibility: hidden !important; }',
	'.h2-station-page .lc-table-card .ant-table-tbody > tr:not(.ant-table-measure-row) > td { padding: 12px 16px !important; font-size: 13px; }',
	'.h2-station-page .lc-table-card .ant-table-tbody > tr:not(.ant-table-measure-row):hover > td { background: #f8fafc !important; }',
	'.h2-station-page .lc-table-card .ant-pagination { margin: 0 !important; padding: 12px 16px !important; border-top: 1px solid #f1f5f9; }',
	'.h2-station-page .lc-action-btn { font-weight: 600 !important; color: #10b981 !important; padding: 0 !important; min-height: 44px; }',
	'.h2-station-page .lc-action-btn-danger { color: #ef4444 !important; }',
	'.h2-station-page .h2-action-more-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; color: #64748b; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }',
	'.h2-station-page .h2-action-more-btn:hover { background: #f1f5f9; color: #334155; }',
	'.h2-station-page .h2-action-more-btn:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.h2-station-page .h2-row-actions { display: inline-flex; align-items: center; gap: 4px; }',
	'.h2-station-page .lc-station-name { font-weight: 700; color: #0f172a; font-size: 13px; }',
	'.h2-station-page .lc-station-name-cell { min-width: 0; }',
	'.h2-station-page .h2-current-cost-price-cell { display: inline-flex; align-items: center; justify-content: flex-end; gap: 6px; max-width: 100%; flex-wrap: nowrap; }',
	'.h2-station-page .h2-price-type-tag.ant-tag { margin: 0; font-size: 11px; line-height: 18px; padding: 0 6px; flex-shrink: 0; }',
	'.h2-station-page .h2-price-multi-warn { display: inline-flex; align-items: center; justify-content: center; color: #f59e0b; cursor: help; flex-shrink: 0; line-height: 0; }',
	'.h2-station-page .h2-price-multi-warn:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; border-radius: 4px; }',
	'.h2-station-page .lc-station-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }',
	'.h2-station-page .lc-station-name-row .lc-station-name { min-width: 0; }',
	'.h2-station-page .lc-station-address-line { margin-top: 4px; font-size: 12px; color: #64748b; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
	'.h2-station-page .lc-station-signed-tag { margin: 0 !important; border-radius: 6px !important; font-weight: 600 !important; flex-shrink: 0; line-height: 20px !important; }',
	'.h2-station-page .lc-refuel-kg-row { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; min-width: 0; }',
	'.h2-station-page .lc-refuel-freq-tag { margin: 0 !important; border-radius: 6px !important; font-weight: 600 !important; flex-shrink: 0; line-height: 20px !important; }',
	'.h2-station-page .lc-station-region { color: #64748b; font-size: 12px; margin-bottom: 2px; }',
	'.h2-station-page .lc-station-contact-name { font-weight: 600; color: #0f172a; font-size: 13px; line-height: 1.35; }',
	'.h2-station-page .lc-station-contact-phone { color: #64748b; font-size: 12px; margin-top: 2px; line-height: 1.35; font-variant-numeric: tabular-nums; }',
	'.h2-station-page .h2-region-address { display: flex; flex-direction: column; gap: 12px; width: 100%; }',
	'.h2-station-page .h2-region-address .ant-select, .h2-station-page .h2-region-address .ant-input { width: 100%; }',
	'.h2-station-page .h2-region-address--inline { flex-direction: row; align-items: center; gap: 8px; }',
	'.h2-station-page .h2-region-address--inline .h2-region-address-cascader { flex: 0 0 38%; max-width: 220px; min-width: 140px; }',
	'.h2-station-page .h2-region-address--inline .h2-region-address-detail { flex: 1; min-width: 0; }',
	'.h2-station-page .h2-create-radio-group { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; min-height: 32px; }',
	'.h2-station-page .h2-create-radio-group .ant-radio-wrapper { margin-inline-end: 0; font-size: 14px; color: #1d2129; }',
	'.h2-station-page .h2-contract-dates { display: flex; align-items: center; gap: 8px; width: 100%; flex-wrap: wrap; }',
	'.h2-station-page .h2-contract-dates-sep { color: #94a3b8; font-size: 13px; flex-shrink: 0; }',
	'.h2-station-page .h2-contract-upload { display: flex; flex-direction: column; gap: 10px; width: 100%; }',
	'.h2-station-page .h2-contract-upload-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }',
	'.h2-station-page .h2-contract-file-list { display: flex; flex-direction: column; gap: 6px; }',
	'.h2-station-page .h2-contract-file-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 10px; border-radius: 6px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; }',
	'.h2-station-page .h2-contract-file-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #334155; }',
	'.h2-station-page .h2-contract-file-btns { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }',
	'.h2-station-page--create .h2-create-form .h2-create-upload-btn.ant-upload-wrapper { width: auto; }',
	'.h2-station-page--create .h2-create-form .h2-region-address { gap: 12px; margin-top: 0; }',
	'.h2-station-page .h2-option-btn-group, .h2-business-status-modal .h2-option-btn-group { display: flex; flex-wrap: wrap; gap: 8px; }',
	'.h2-station-page .h2-option-btn, .h2-business-status-modal .h2-option-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; padding: 0 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #475569; font-size: 13px; font-weight: 600; cursor: pointer; transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease; }',
	'.h2-station-page .h2-option-btn:hover:not(:disabled), .h2-business-status-modal .h2-option-btn:hover:not(:disabled) { border-color: #86efac; color: #047857; }',
	'.h2-station-page .h2-option-btn:focus-visible, .h2-business-status-modal .h2-option-btn:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.h2-station-page .h2-option-btn:disabled, .h2-business-status-modal .h2-option-btn:disabled { opacity: 0.55; cursor: not-allowed; }',
	'.h2-station-page .h2-option-btn--active, .h2-business-status-modal .h2-option-btn--active { box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08); }',
	'.h2-station-page .h2-option-btn--active.h2-option-btn--open, .h2-business-status-modal .h2-option-btn--active.h2-option-btn--open { border-color: #10b981; background: #ecfdf5; color: #047857; }',
	'.h2-station-page .h2-option-btn--active.h2-option-btn--pause, .h2-business-status-modal .h2-option-btn--active.h2-option-btn--pause { border-color: #f97316; background: #fff7ed; color: #c2410c; }',
	'.h2-station-page .h2-option-btn--active.h2-option-btn--stop, .h2-business-status-modal .h2-option-btn--active.h2-option-btn--stop { border-color: #ef4444; background: #fef2f2; color: #b91c1c; }',
	'.h2-station-page .h2-option-btn--active.h2-option-btn--allday, .h2-business-status-modal .h2-option-btn--active.h2-option-btn--allday { border-color: #10b981; background: #ecfdf5; color: #047857; }',
	'.h2-station-page .h2-option-btn--active.h2-option-btn--custom, .h2-business-status-modal .h2-option-btn--active.h2-option-btn--custom { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }',
	'.h2-station-page .h2-business-hours, .h2-business-status-modal .h2-business-hours { display: flex; flex-direction: column; gap: 12px; width: 100%; }',
	'.h2-business-status-modal .h2-business-hours-custom-panel { margin-top: 4px; }',
	'.h2-station-page .h2-business-hours-custom-panel, .h2-business-status-modal .h2-business-hours-custom-panel { padding: 12px 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; }',
	'.h2-station-page .h2-business-hours-custom-panel__title, .h2-business-status-modal .h2-business-hours-custom-panel__title { margin-bottom: 10px; font-size: 12px; font-weight: 700; color: #475569; }',
	'.h2-station-page .h2-business-hours-range, .h2-business-status-modal .h2-business-hours-range { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; }',
	'.h2-station-page .h2-business-hours-range-item, .h2-business-status-modal .h2-business-hours-range-item { display: flex; flex-direction: column; gap: 6px; min-width: 0; }',
	'.h2-station-page .h2-business-hours-range-label, .h2-business-status-modal .h2-business-hours-range-label { font-size: 12px; color: #64748b; line-height: 1.2; }',
	'.h2-station-page--create .h2-create-form .h2-business-hours .ant-picker { width: 100% !important; height: 32px !important; border-radius: 2px !important; border: 1px solid #e5e6eb !important; background: #fff !important; }',
	'.h2-station-page--create .h2-create-form .h2-business-hours .ant-picker .ant-picker-input > input { font-size: 14px !important; color: #1d2129 !important; }',
	'.h2-station-page--create .h2-create-form .h2-business-hours .ant-picker:not(.ant-picker-disabled):hover { border-color: #c9cdd4 !important; background: #fff !important; }',
	'.h2-station-page--create .h2-create-form .h2-business-hours .ant-picker-focused { border-color: #10b981 !important; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important; background: #fff !important; }',
	'.h2-station-page--create .h2-create-form .h2-business-hours--col4 { gap: 8px; max-width: 100%; }',
	'.h2-station-page--create .h2-create-form .h2-business-hours--col4 .ant-select { width: 100% !important; max-width: 100%; }',
	'.h2-station-page--create .h2-create-form .h2-business-hours--col4 .h2-business-hours-range { grid-template-columns: 1fr; gap: 8px; }',
	'.h2-station-page--create .h2-create-form .ant-col-6 .ant-form-item-control-input { max-width: 100%; }',
	'.h2-station-page--create .h2-create-form--grid-4 .h2-region-address--stack-col4 { gap: 8px; }',
	'.h2-station-page--create .h2-create-form--grid-4 .h2-region-address--stack-col4 .h2-region-address-cascader, .h2-station-page--create .h2-create-form--grid-4 .h2-region-address--stack-col4 .h2-region-address-detail { flex: none; max-width: 100%; width: 100%; min-width: 0; }',
	'.h2-station-page--create .h2-create-form--grid-4 .h2-contract-panel { padding: 10px 12px; }',
	'.h2-station-page--create .h2-create-form--grid-4 .h2-contract-upload-actions { flex-direction: column; align-items: stretch; gap: 6px; }',
	'.h2-station-page--create .h2-create-form--grid-4 .h2-contract-upload-actions .ant-btn { width: 100%; }',
	'.h2-station-page--create .h2-create-form--grid-4 .h2-contract-dates { flex-direction: column; align-items: stretch; gap: 6px; }',
	'.h2-station-page--create .h2-create-form--grid-4 .h2-contract-dates-sep { text-align: center; line-height: 1; }',
	'.h2-station-page--create .h2-create-form--grid-4 .h2-create-radio-group { gap: 8px 12px; }',
	'.h2-station-page--create .h2-supplier-mode-card--compact { flex-direction: column; align-items: stretch; justify-content: flex-start; min-height: 88px; padding: 12px; gap: 8px; }',
	'.h2-station-page--create .h2-supplier-mode-card--compact .h2-supplier-mode-card-icon { width: 32px; height: 32px; }',
	'.h2-station-page--create .h2-supplier-mode-card--compact .h2-supplier-mode-card-title { font-size: 13px; }',
	'.h2-station-page--create .h2-supplier-mode-card--compact .h2-supplier-mode-card-desc { font-size: 11px; line-height: 1.35; }',
	'.h2-station-page--create .h2-create-form--grid-4 .h2-supplier-link-select { padding: 0; margin: 0; border: none; background: transparent; }',
	'.h2-station-page--create .h2-create-form--grid-4 .h2-create-upload.ant-upload-wrapper .ant-upload-drag { padding: 10px 8px !important; }',
	'.h2-station-page--create .h2-create-form--grid-4 .h2-create-upload.ant-upload-wrapper .ant-upload-drag .ant-upload-drag-icon { margin-bottom: 4px !important; }',
	'.h2-station-page--create .h2-create-form--grid-4 .h2-create-upload.ant-upload-wrapper .ant-upload-drag p { font-size: 12px !important; }',
	'.h2-station-page .h2-address-paste { display: flex; flex-direction: column; width: 100%; }',
	'.h2-station-page .ant-drawer-body .ant-form .ant-form-item { margin-bottom: 20px; }',
	'.h2-station-page .ant-drawer-body .ant-form .ant-form-item:last-child { margin-bottom: 0; }',
	'.h2-station-page .ant-drawer-body .ant-form .ant-form-item-label { padding-bottom: var(--h2-form-label-gap, 8px); }',
	'.h2-station-page .ant-drawer-body .ant-form .ant-form-item-label > label { min-height: 22px; line-height: 22px; }',
	'.h2-station-page .ant-drawer-body .ant-divider { margin: 4px 0 20px !important; }',
	'.h2-station-page .h2-address-paste .ant-input-textarea { font-size: 13px !important; line-height: 1.45 !important; resize: vertical; min-height: 56px; }',
	'.h2-station-page .h2-prd-modal .ant-modal-body { max-height: 70vh; overflow: auto; }',
	'.h2-station-page .h2-prd-content { padding: 8px 0; white-space: pre-wrap; font-size: 13px; line-height: 1.65; color: #475569; }',
	'.h2-station-page .h2-req-doc-panel { max-width: 100%; }',
	'.h2-station-page .h2-req-doc-panel h1:first-child { margin-top: 0; }',
	'.h2-station-page .h2-import-template-bar { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 14px 16px; margin-bottom: 14px; border-radius: 12px; background: linear-gradient(135deg, #ecfdf5 0%, #f8fafc 100%); border: 1px solid #bbf7d0; }',
	'.h2-station-page .h2-import-template-bar-text { font-size: 13px; color: #475569; line-height: 1.55; flex: 1; min-width: 0; }',
	'.h2-station-page .h2-import-preview { margin-top: 14px; padding: 12px 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; color: #334155; }',
	'.h2-station-page .h2-import-error-list { margin: 8px 0 0; padding-left: 18px; max-height: 120px; overflow: auto; font-size: 12px; color: #b91c1c; }',
	'.h2-station-page .h2-status-log-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9; }',
	'.h2-station-page .h2-status-log-title { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }',
	'.h2-station-page .h2-status-log-table .ant-table-thead > tr > th { background: #f8fafc !important; font-size: 12px !important; padding: 8px 12px !important; }',
	'.h2-station-page .h2-status-log-table .ant-table-tbody > tr > td { font-size: 12px !important; padding: 8px 12px !important; }',
	'.h2-station-page .h2-refuel-drill-link { border: none; background: none; padding: 0; font-weight: 700; color: #059669; cursor: pointer; font-variant-numeric: tabular-nums; font-size: 13px; }',
	'.h2-station-page .h2-refuel-drill-link:hover { color: #047857; text-decoration: underline; }',
	'.h2-station-page .h2-refuel-drill-link:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; border-radius: 4px; }',
	'.h2-station-page .h2-ledger-totals-bar { display: flex; align-items: stretch; gap: 0; margin-bottom: 12px; border: 1px solid #bae6fd; border-radius: 10px; overflow: hidden; background: #f8fafc; box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04); }',
	'.h2-station-page .h2-ledger-totals-bar__title { display: flex; align-items: center; justify-content: center; min-width: 72px; padding: 10px 14px; font-size: 14px; font-weight: 700; color: #0f172a; background: #e8f4fc; border-right: 1px solid #bae6fd; flex-shrink: 0; }',
	'.h2-station-page .h2-ledger-totals-bar__items { display: flex; flex: 1; flex-wrap: wrap; }',
	'.h2-station-page .h2-ledger-totals-bar__item { flex: 1; min-width: 140px; padding: 8px 20px; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: center; gap: 4px; }',
	'.h2-station-page .h2-ledger-totals-bar__item:last-child { border-right: none; }',
	'.h2-station-page .h2-ledger-totals-bar__label { font-size: 12px; color: rgba(15, 23, 42, 0.55); font-weight: 500; line-height: 1.2; }',
	'.h2-station-page .h2-ledger-totals-bar__value { font-size: 16px; font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; line-height: 1.3; }',
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
	'.h2-refuel-drill-modal .h2-refuel-record-table .h2-refuel-drill-money { font-variant-numeric: tabular-nums; white-space: nowrap; font-weight: 600; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .h2-refuel-drill-money--cost { color: #ea580c; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .h2-refuel-drill-money--customer { color: #4f46e5; font-weight: 700; }',
	'.h2-refuel-drill-modal .h2-refuel-record-table .h2-refuel-drill-order-no { display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: #475569; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 7px; border-radius: 6px; letter-spacing: 0.02em; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
	'.h2-station-page .h2-prepaid-balance-cell { display: flex; align-items: center; justify-content: flex-end; gap: 6px; flex-wrap: nowrap; box-sizing: border-box; }',
	'.h2-station-page .h2-prepaid-balance-cell .h2-prepaid-balance-amount { flex: 0 0 auto; white-space: nowrap; border: none; background: none; padding: 0; font: inherit; font-weight: 700; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; font-variant-numeric: tabular-nums; }',
	'.h2-station-page .h2-prepaid-balance-cell .h2-prepaid-balance-amount:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; border-radius: 4px; }',
	'.h2-station-page .h2-prepaid-balance-cell .lc-station-signed-tag { flex-shrink: 0; }',
	'.h2-station-page .lc-table-card .ant-table-tbody > tr:not(.ant-table-measure-row) > td.h2-cell-prepaid-balance { overflow: visible !important; }',
	'.h2-balance-drill-modal .ant-modal-content { border-radius: 16px !important; overflow: hidden; box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18) !important; }',
	'.h2-balance-drill-modal .ant-modal-header { padding: 18px 24px 14px !important; border-bottom: 1px solid #f1f5f9 !important; margin-bottom: 0 !important; }',
	'.h2-balance-drill-modal .ant-modal-title { font-size: 17px !important; font-weight: 700 !important; color: #0f172a !important; }',
	'.h2-balance-drill-modal .ant-modal-body { padding: 16px 24px 20px !important; background: #f8fafc; }',
	'.h2-balance-drill-modal .ant-modal-footer { padding: 12px 24px 18px !important; border-top: 1px solid #f1f5f9 !important; background: #fff; }',
	'.h2-balance-drill-modal .h2-balance-drill-panel { display: flex; flex-direction: column; gap: 14px; }',
	'.h2-balance-drill-modal .h2-balance-drill-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }',
	'@media (max-width: 860px) { .h2-balance-drill-modal .h2-balance-drill-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }',
	'@media (max-width: 520px) { .h2-balance-drill-modal .h2-balance-drill-stats { grid-template-columns: 1fr; } }',
	'.h2-balance-drill-modal .h2-balance-drill-stat { display: flex; flex-direction: column; justify-content: center; min-height: 78px; padding: 12px 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); min-width: 0; box-sizing: border-box; }',
	'.h2-balance-drill-modal .h2-balance-drill-stat--balance { border-left: 4px solid #10b981; background: linear-gradient(180deg, #fff 0%, #f0fdf4 100%); }',
	'.h2-balance-drill-modal .h2-balance-drill-stat--income { border-left: 4px solid #10b981; }',
	'.h2-balance-drill-modal .h2-balance-drill-stat--expense { border-left: 4px solid #f97316; }',
	'.h2-balance-drill-modal .h2-balance-drill-stat__label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 8px; line-height: 1.2; }',
	'.h2-balance-drill-modal .h2-balance-trend-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-balance-drill-modal .h2-balance-trend-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border-bottom: 1px solid #f1f5f9; background: #fafbfc; }',
	'.h2-balance-drill-modal .h2-balance-trend-head__title { font-size: 13px; font-weight: 700; color: #334155; }',
	'.h2-balance-drill-modal .h2-balance-trend-head__meta { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; }',
	'.h2-balance-drill-modal .h2-balance-trend-body { padding: 12px 14px 8px; }',
	'.h2-balance-drill-modal .h2-balance-trend-chart-wrap { position: relative; }',
	'.h2-balance-drill-modal .h2-balance-trend-svg { display: block; width: 100%; height: auto; }',
	'.h2-balance-drill-modal .h2-balance-trend-tooltip { position: absolute; z-index: 2; padding: 8px 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.92); color: #f8fafc; font-size: 12px; line-height: 1.45; white-space: nowrap; pointer-events: none; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18); transform: translate(-50%, calc(-100% - 10px)); }',
	'.h2-balance-drill-modal .h2-balance-trend-tooltip__date { color: #cbd5e1; font-size: 11px; margin-bottom: 2px; }',
	'.h2-balance-drill-modal .h2-balance-trend-tooltip__balance { font-weight: 700; font-variant-numeric: tabular-nums; color: #fff; }',
	'.h2-balance-drill-modal .h2-balance-trend-tooltip__balance--negative { color: #fca5a5; }',
	'.h2-balance-drill-modal .h2-balance-trend-hit { fill: transparent; cursor: pointer; }',
	'.h2-balance-drill-modal .h2-balance-trend-point--active { r: 5.5; stroke-width: 2.5; }',
	'.h2-balance-drill-modal .h2-balance-trend-empty { padding: 36px 16px; text-align: center; font-size: 13px; color: #94a3b8; }',
	'.h2-balance-drill-modal .h2-balance-trend-legend { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 8px 14px 12px; border-top: 1px solid #f8fafc; }',
	'.h2-balance-drill-modal .h2-balance-trend-legend__item { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: #64748b; }',
	'.h2-balance-drill-modal .h2-balance-trend-legend__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }',
	'.h2-balance-drill-modal .h2-balance-trend-legend__dot--line { background: #10b981; }',
	'.h2-balance-drill-modal .h2-balance-trend-legend__dot--area { background: rgba(16, 185, 129, 0.35); }',
	'.h2-balance-drill-modal .h2-balance-drill-stat__value { font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.2; color: #0f172a; word-break: break-all; }',
	'.h2-balance-drill-modal .h2-balance-drill-stat__value--income { color: #059669; }',
	'.h2-balance-drill-modal .h2-balance-drill-stat__value--expense { color: #ea580c; }',
	'.h2-balance-drill-modal .h2-balance-drill-stat__value--negative { color: #dc2626; }',
	'.h2-balance-drill-modal .h2-balance-drill-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-balance-drill-modal .h2-balance-drill-table-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border-bottom: 1px solid #f1f5f9; background: #fafbfc; }',
	'.h2-balance-drill-modal .h2-balance-drill-table-head__left { display: flex; align-items: center; gap: 10px; min-width: 0; }',
	'.h2-balance-drill-modal .h2-balance-drill-table-head__title { font-size: 13px; font-weight: 700; color: #334155; }',
	'.h2-balance-drill-modal .h2-balance-drill-table-head__count { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; }',
	'.h2-balance-drill-modal .h2-balance-record-table { border-radius: 0 !important; }',
	'.h2-balance-drill-modal .h2-balance-record-table .ant-table { background: transparent !important; }',
	'.h2-balance-drill-modal .h2-balance-record-table .ant-table-container { border: none !important; }',
	'.h2-balance-drill-modal .h2-balance-record-table .ant-table-header { margin-bottom: 0 !important; }',
	'.h2-balance-drill-modal .h2-balance-record-table .ant-table-body { margin-top: 0 !important; overflow-y: auto !important; }',
	'.h2-balance-drill-modal .h2-balance-record-table .ant-table-body table { margin-top: 0 !important; }',
	'.h2-balance-drill-modal .h2-balance-record-table .ant-table-tbody > tr.ant-table-measure-row, .h2-balance-drill-modal .h2-balance-record-table .ant-table-tbody > tr.ant-table-measure-row > td { height: 0 !important; max-height: 0 !important; padding: 0 !important; margin: 0 !important; border: none !important; line-height: 0 !important; font-size: 0 !important; overflow: hidden !important; visibility: hidden !important; }',
	'.h2-balance-drill-modal .h2-balance-record-table .ant-table-thead > tr > th { background: #f8fafc !important; font-size: 12px !important; font-weight: 700 !important; color: #475569 !important; padding: 10px 12px !important; border-bottom: 1px solid #e2e8f0 !important; }',
	'.h2-balance-drill-modal .h2-balance-record-table .ant-table-tbody > tr:not(.ant-table-measure-row) > td { font-size: 13px !important; padding: 10px 12px !important; vertical-align: middle !important; border-bottom: 1px solid #f8fafc !important; }',
	'.h2-balance-drill-modal .h2-balance-record-table .ant-table-tbody > tr:not(.ant-table-measure-row):last-child > td { border-bottom: none !important; }',
	'.h2-balance-drill-modal .h2-balance-record-table .ant-table-tbody > tr:hover > td { background: #f0fdf4 !important; }',
	'.h2-balance-drill-modal .h2-balance-record-table .h2-balance-money { font-variant-numeric: tabular-nums; white-space: nowrap; letter-spacing: -0.01em; }',
	'.h2-balance-drill-modal .h2-balance-record-table .h2-balance-money--income { color: #059669; font-weight: 600; }',
	'.h2-balance-drill-modal .h2-balance-record-table .h2-balance-money--expense { color: #ea580c; font-weight: 600; }',
	'.h2-balance-drill-modal .h2-balance-record-table .h2-balance-money--balance { color: #0f172a; font-weight: 700; }',
	'.h2-balance-drill-modal .h2-balance-record-table .h2-balance-money--negative { color: #dc2626 !important; }',
	'.h2-balance-drill-modal .h2-balance-record-table .h2-balance-money--muted { color: #cbd5e1; font-weight: 400; }',
	'.h2-balance-drill-modal .h2-balance-record-table .h2-balance-order-no { display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: #475569; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 7px; border-radius: 6px; letter-spacing: 0.02em; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
	'.h2-balance-drill-modal .h2-balance-record-table .h2-balance-seq { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; border-radius: 6px; background: #f1f5f9; color: #64748b; font-size: 12px; font-weight: 700; }',
	'.h2-station-view-modal .ant-modal-content { border-radius: 16px !important; overflow: hidden; box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18) !important; }',
	'.h2-station-view-modal .ant-modal-header { padding: 18px 24px 14px !important; border-bottom: 1px solid #f1f5f9 !important; margin-bottom: 0 !important; }',
	'.h2-station-view-modal .ant-modal-title { font-size: 17px !important; font-weight: 700 !important; color: #0f172a !important; }',
	'.h2-station-view-modal .ant-modal-body { padding: 16px 24px 20px !important; background: #f8fafc; }',
	'.h2-station-view-modal .ant-modal-footer { padding: 12px 24px 18px !important; border-top: 1px solid #f1f5f9 !important; background: #fff; }',
	'.h2-station-view-modal .h2-station-view-panel { display: flex; flex-direction: column; gap: 20px; }',
	'.h2-station-view-modal .h2-station-view-section__title { margin: 0 0 10px; padding-left: 10px; font-size: 14px; font-weight: 700; color: #334155; line-height: 1.35; border-left: 4px solid #10b981; }',
	'.h2-station-view-modal .h2-station-view-section .ant-descriptions { background: #fff; border-radius: 10px; overflow: hidden; }',
	'.h2-station-view-modal .h2-station-view-section .ant-descriptions-item-label { width: 132px !important; font-size: 12px !important; font-weight: 600 !important; color: #64748b !important; background: #fafbfc !important; }',
	'.h2-station-view-modal .h2-station-view-section .ant-descriptions-item-content { font-size: 13px !important; color: #0f172a !important; font-weight: 500 !important; word-break: break-word; }',
	'.h2-station-view-modal .h2-station-view-files { display: flex; flex-wrap: wrap; gap: 8px; }',
	'.h2-station-view-modal .h2-station-view-file-link { display: inline-flex; align-items: center; max-width: 100%; padding: 4px 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; color: #059669; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s ease, border-color 0.2s ease; }',
	'.h2-station-view-modal .h2-station-view-file-link:hover { background: #ecfdf5; border-color: #86efac; }',
	'.h2-station-view-modal .h2-station-view-file-link:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.h2-station-view-modal .h2-station-view-license-count { font-size: 13px; color: #64748b; margin-bottom: 8px; }',
	'.h2-station-view-modal .h2-station-view-license-images { display: flex; flex-wrap: wrap; gap: 10px; }',
	'.h2-station-view-modal .h2-station-view-license-thumb { display: block; padding: 0; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #f8fafc; cursor: pointer; transition: box-shadow 0.2s ease, border-color 0.2s ease; }',
	'.h2-station-view-modal .h2-station-view-license-thumb:hover { border-color: #86efac; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.15); }',
	'.h2-station-view-modal .h2-station-view-license-thumb img { display: block; width: 168px; height: 118px; object-fit: cover; }',
	'.h2-station-view-modal .h2-station-view-license-empty { font-size: 13px; color: #94a3b8; }',
	'.h2-file-preview-modal .ant-modal-body { padding: 0 !important; background: #0f172a; }',
	'.h2-file-preview-modal .h2-file-preview-body { display: flex; align-items: center; justify-content: center; min-height: 360px; max-height: 78vh; overflow: auto; padding: 12px; box-sizing: border-box; }',
	'.h2-file-preview-modal .h2-file-preview-body iframe { width: 100%; min-height: 70vh; border: none; background: #fff; border-radius: 8px; }',
	'.h2-file-preview-modal .h2-file-preview-body img { max-width: 100%; max-height: 76vh; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); }',
	'.h2-station-view-modal .h2-station-view-empty { padding: 20px 16px; text-align: center; font-size: 13px; color: #94a3b8; background: #fff; border: 1px dashed #e2e8f0; border-radius: 10px; }',
	'.h2-price-config-modal .ant-modal-content { border-radius: 16px !important; overflow: hidden; box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18) !important; }',
	'.h2-price-config-modal .ant-modal-header { padding: 18px 24px 14px !important; border-bottom: 1px solid #f1f5f9 !important; margin-bottom: 0 !important; }',
	'.h2-price-config-modal .ant-modal-title { font-size: 17px !important; font-weight: 700 !important; color: #0f172a !important; }',
	'.h2-price-config-modal .ant-modal-body { padding: 16px 24px 20px !important; background: #f8fafc; }',
	'.h2-price-config-modal .ant-modal-footer { padding: 12px 24px 18px !important; border-top: 1px solid #f1f5f9 !important; background: #fff; }',
	'.h2-price-config-modal .h2-price-config-panel { display: flex; flex-direction: column; gap: 14px; }',
	'.h2-price-config-modal .h2-price-config-station-card { padding: 12px 16px; background: linear-gradient(135deg, #fff7ed 0%, #fffbeb 50%, #f8fafc 100%); border: 1px solid #fed7aa; border-radius: 12px; }',
	'.h2-price-config-modal .h2-price-config-station-card__row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }',
	'.h2-price-config-modal .h2-price-config-station-card__name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.35; min-width: 0; }',
	'.h2-price-config-modal .h2-price-config-station-card .lc-station-signed-tag { margin: 0 !important; border-radius: 6px !important; font-weight: 600 !important; flex-shrink: 0; line-height: 20px !important; }',
	'.h2-price-config-modal .h2-price-config-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }',
	'@media (max-width: 640px) { .h2-price-config-modal .h2-price-config-stats { grid-template-columns: 1fr; } }',
	'.h2-price-config-modal .h2-price-config-stat { display: flex; flex-direction: column; justify-content: center; min-height: 78px; padding: 12px 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); min-width: 0; box-sizing: border-box; }',
	'.h2-price-config-modal .h2-price-config-stat--current { border-left: 4px solid #f97316; background: linear-gradient(180deg, #fff 0%, #fff7ed 100%); }',
	'.h2-price-config-modal .h2-price-config-stat--history { border-left: 4px solid #3b82f6; }',
	'.h2-price-config-modal .h2-price-config-stat--pending { border-left: 4px solid #6366f1; }',
	'.h2-price-config-modal .h2-price-config-stat__label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 8px; line-height: 1.2; }',
	'.h2-price-config-modal .h2-price-config-stat__value { font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.2; color: #0f172a; word-break: break-all; }',
	'.h2-price-config-modal .h2-price-config-stat__value--current { color: #ea580c; }',
	'.h2-price-config-modal .h2-price-config-stat__value--history { color: #2563eb; }',
	'.h2-price-config-modal .h2-price-config-stat__value--pending { color: #4f46e5; }',
	'.h2-price-config-modal .h2-price-config-form-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-price-config-modal .h2-price-config-form-wrap .ant-form-item { margin-bottom: 14px; }',
	'.h2-price-config-modal .h2-price-config-form-wrap .ant-form-item:last-child { margin-bottom: 0; }',
	'.h2-price-config-modal .h2-price-config-form-wrap .ant-form-item-label > label { font-size: 13px; font-weight: 600; color: #334155; }',
	'.h2-price-config-modal .h2-price-config-form-wrap .ant-input, .h2-price-config-modal .h2-price-config-form-wrap .ant-picker { width: 100% !important; border-radius: 8px !important; }',
	'.h2-price-config-modal .h2-price-config-form-hint { margin-top: 10px; padding: 8px 12px; font-size: 12px; color: #64748b; line-height: 1.5; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }',
	'.h2-price-config-modal .h2-price-config-form-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }',
	'.h2-price-config-modal .h2-price-config-form-head__title { font-size: 14px; font-weight: 700; color: #0f172a; }',
	'.h2-price-config-modal .h2-price-config-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-price-config-modal .h2-price-config-table-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border-bottom: 1px solid #f1f5f9; background: #fafbfc; }',
	'.h2-price-config-modal .h2-price-config-table-head__title { font-size: 13px; font-weight: 700; color: #334155; }',
	'.h2-price-config-modal .h2-price-config-table-head__count { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; }',
	'.h2-price-config-modal .h2-price-config-record-table { border-radius: 0 !important; }',
	'.h2-price-config-modal .h2-price-config-record-table .ant-table { background: transparent !important; }',
	'.h2-price-config-modal .h2-price-config-record-table .ant-table-container { border: none !important; }',
	'.h2-price-config-modal .h2-price-config-record-table .ant-table-header { margin-bottom: 0 !important; }',
	'.h2-price-config-modal .h2-price-config-record-table .ant-table-body { margin-top: 0 !important; overflow-y: auto !important; }',
	'.h2-price-config-modal .h2-price-config-record-table .ant-table-body table { margin-top: 0 !important; }',
	'.h2-price-config-modal .h2-price-config-record-table .ant-table-tbody > tr.ant-table-measure-row, .h2-price-config-modal .h2-price-config-record-table .ant-table-tbody > tr.ant-table-measure-row > td { height: 0 !important; max-height: 0 !important; padding: 0 !important; margin: 0 !important; border: none !important; line-height: 0 !important; font-size: 0 !important; overflow: hidden !important; visibility: hidden !important; }',
	'.h2-price-config-modal .h2-price-config-record-table .ant-table-thead > tr > th { background: #f8fafc !important; font-size: 12px !important; font-weight: 700 !important; color: #475569 !important; padding: 10px 12px !important; border-bottom: 1px solid #e2e8f0 !important; }',
	'.h2-price-config-modal .h2-price-config-record-table .ant-table-tbody > tr:not(.ant-table-measure-row) > td { font-size: 13px !important; padding: 10px 12px !important; vertical-align: middle !important; border-bottom: 1px solid #f8fafc !important; }',
	'.h2-price-config-modal .h2-price-config-record-table .ant-table-tbody > tr:not(.ant-table-measure-row):last-child > td { border-bottom: none !important; }',
	'.h2-price-config-modal .h2-price-config-record-table .ant-table-tbody > tr:hover > td { background: #fff7ed !important; }',
	'.h2-price-config-modal .h2-price-config-record-table .h2-price-config-money { font-variant-numeric: tabular-nums; white-space: nowrap; font-weight: 600; }',
	'.h2-price-config-modal .h2-price-config-record-table .h2-price-config-money--before { color: #64748b; }',
	'.h2-price-config-modal .h2-price-config-record-table .h2-price-config-money--after { color: #ea580c; font-weight: 700; }',
	'.h2-price-config-modal .h2-price-config-after-lines { display: flex; flex-direction: column; gap: 4px; min-width: 0; }',
	'.h2-price-config-modal .h2-price-config-after-line { font-size: 12px; line-height: 1.45; color: #334155; font-variant-numeric: tabular-nums; white-space: nowrap; }',
	'.h2-price-config-modal .h2-price-config-after-line .h2-price-config-money { font-size: 12px; }',
	'.h2-price-config-modal .h2-price-tier-rules { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }',
	'.h2-price-config-modal .h2-price-tier-rule-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; }',
	'@media (max-width: 640px) { .h2-price-config-modal .h2-price-tier-rule-row { grid-template-columns: 1fr; } }',
	'.h2-price-config-modal .h2-price-tier-rule-field label { display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; }',
	'.h2-price-config-modal .h2-price-config-effective-price { font-size: 12px; color: #334155; font-variant-numeric: tabular-nums; }',
	'.h2-price-config-modal .h2-price-config-effective-table .ant-table-tbody > tr { cursor: default; }',
	'.h2-price-config-modal .h2-price-config-rule-list--empty { font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.5; }',
	'.h2-price-config-modal .h2-price-config-rule-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 10px 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: border-color 0.2s ease, box-shadow 0.2s ease; }',
	'.h2-price-config-modal .h2-price-config-rule-item:hover { border-color: #fdba74; }',
	'.h2-price-config-modal .h2-price-config-rule-item.is-active { border-color: #f97316; box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.12); background: #fff7ed; }',
	'.h2-price-config-modal .h2-price-config-rule-item__main { min-width: 0; flex: 1; }',
	'.h2-price-config-modal .h2-price-config-rule-item__title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }',
	'.h2-price-config-modal .h2-price-config-rule-item__tags { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; margin-bottom: 6px; }',
	'.h2-price-config-modal .h2-price-config-rule-item__price-text { font-size: 12px; color: #334155; font-variant-numeric: tabular-nums; line-height: 1.5; }',
	'.h2-price-config-modal .h2-price-config-rule-item__time { font-size: 12px; color: #64748b; line-height: 1.5; font-variant-numeric: tabular-nums; }',
	'.h2-price-config-modal .h2-price-config-rule-item__time-sep { margin: 0 8px; color: #cbd5e1; }',
	'.h2-price-config-modal .h2-price-config-rule-item__meta { font-size: 12px; color: #64748b; line-height: 1.5; }',
	'.h2-price-config-modal .h2-price-config-rule-item__timing { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 4px; font-size: 12px; color: #64748b; }',
	'.h2-price-config-modal .h2-price-config-rule-item__timing-item { white-space: nowrap; }',
	'.h2-price-config-modal .h2-price-tier-timing-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }',
	'@media (max-width: 640px) { .h2-price-config-modal .h2-price-tier-timing-row { grid-template-columns: 1fr; } }',
	'.h2-price-config-modal .h2-price-config-type-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; margin-bottom: 14px; }',
	'.h2-price-config-modal .h2-price-config-type-row__col { min-width: 0; }',
	'.h2-price-config-modal .h2-price-config-type-row .ant-form-item { margin-bottom: 0; }',
	'@media (max-width: 768px) { .h2-price-config-modal .h2-price-config-type-row { grid-template-columns: 1fr; } }',
	'.h2-price-config-modal .h2-tier-customer-picker { width: 100%; }',
	'.h2-price-config-modal .h2-tier-customer-picker__trigger { width: 100%; display: flex; align-items: center; justify-content: space-between; min-height: 32px; padding: 4px 11px; border: 1px solid #d9d9d9; border-radius: 8px; background: #fff; cursor: pointer; transition: border-color 0.2s ease, box-shadow 0.2s ease; }',
	'.h2-price-config-modal .h2-tier-customer-picker__trigger:hover { border-color: #f97316; }',
	'.h2-price-config-modal .h2-tier-customer-picker__trigger.is-open { border-color: #f97316; box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.12); }',
	'.h2-price-config-modal .h2-tier-customer-picker__trigger-text { font-size: 13px; color: #334155; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; text-align: left; }',
	'.h2-price-config-modal .h2-tier-customer-picker__trigger-text.is-placeholder { color: #94a3b8; }',
	'.h2-price-config-modal .h2-tier-customer-dropdown { min-width: 300px; max-width: 360px; max-height: 300px; overflow-y: auto; padding: 6px 0; background: #fff; border-radius: 10px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14); }',
	'.h2-price-config-modal .h2-tier-customer-dropdown__item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 13px; color: #334155; cursor: pointer; transition: background 0.15s ease; }',
	'.h2-price-config-modal .h2-tier-customer-dropdown__item:hover:not(.is-disabled) { background: #fff7ed; }',
	'.h2-price-config-modal .h2-tier-customer-dropdown__item.is-disabled { color: #94a3b8; cursor: not-allowed; }',
	'.h2-price-config-modal .h2-tier-customer-dropdown__item.is-all { border-bottom: 1px solid #f1f5f9; margin-bottom: 4px; font-weight: 600; }',
	'.h2-price-config-modal .h2-tier-customer-dropdown__hint { padding: 0 12px 8px; font-size: 11px; color: #94a3b8; line-height: 1.45; }',
	/* 阶梯客户下拉挂到 body，需全局样式（不可仅写在 .h2-price-config-modal 内） */
	'.h2-tier-customer-dropdown-overlay.ant-dropdown { background: transparent !important; box-shadow: none !important; padding: 0 !important; }',
	'.h2-tier-customer-dropdown-overlay .ant-dropdown-menu { background: transparent !important; box-shadow: none !important; padding: 0 !important; }',
	'.h2-tier-customer-dropdown { min-width: 300px; max-width: 360px; max-height: 300px; overflow-y: auto; padding: 6px 0; background: #fff !important; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14); }',
	'.h2-tier-customer-dropdown__item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 13px; color: #334155; cursor: pointer; transition: background 0.15s ease; background: #fff; }',
	'.h2-tier-customer-dropdown__item:hover:not(.is-disabled) { background: #fff7ed; }',
	'.h2-tier-customer-dropdown__item.is-disabled { color: #94a3b8; cursor: not-allowed; background: #fff; }',
	'.h2-tier-customer-dropdown__item.is-all { border-bottom: 1px solid #f1f5f9; margin-bottom: 4px; font-weight: 600; }',
	'.h2-tier-customer-dropdown__hint { padding: 0 12px 8px; font-size: 11px; color: #94a3b8; line-height: 1.45; background: #fff; }',
	'.h2-price-config-modal .h2-price-config-stat--tier { border-left: 4px solid #14b8a6; background: linear-gradient(180deg, #fff 0%, #f0fdfa 100%); }',
	'.h2-price-config-modal .h2-price-config-stat__value--tier { color: #0f766e; }',
	'.h2-business-status-modal .ant-modal-content { border-radius: 16px !important; overflow: hidden; box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18) !important; }',
	'.h2-business-status-modal .ant-modal-header { padding: 18px 24px 14px !important; border-bottom: 1px solid #f1f5f9 !important; margin-bottom: 0 !important; }',
	'.h2-business-status-modal .ant-modal-title { font-size: 17px !important; font-weight: 700 !important; color: #0f172a !important; }',
	'.h2-business-status-modal .ant-modal-body { padding: 16px 24px 20px !important; background: #f8fafc; }',
	'.h2-business-status-modal .ant-modal-footer { padding: 12px 24px 18px !important; border-top: 1px solid #f1f5f9 !important; background: #fff; }',
	'.h2-business-status-modal .h2-business-status-panel { display: flex; flex-direction: column; gap: 14px; }',
	'.h2-business-status-modal .h2-business-status-station-card { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 16px; background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #f8fafc 100%); border: 1px solid #bbf7d0; border-radius: 12px; }',
	'.h2-business-status-modal .h2-business-status-station-card__name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.35; }',
	'.h2-business-status-modal .h2-business-status-station-card__meta { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; white-space: nowrap; }',
	'.h2-business-status-modal .h2-business-status-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }',
	'@media (max-width: 640px) { .h2-business-status-modal .h2-business-status-stats { grid-template-columns: 1fr; } }',
	'.h2-business-status-modal .h2-business-status-stat { display: flex; flex-direction: column; justify-content: center; min-height: 78px; padding: 12px 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); min-width: 0; box-sizing: border-box; }',
	'.h2-business-status-modal .h2-business-status-stat--status { border-left: 4px solid #10b981; background: linear-gradient(180deg, #fff 0%, #f0fdf4 100%); }',
	'.h2-business-status-modal .h2-business-status-stat--hours { border-left: 4px solid #3b82f6; }',
	'.h2-business-status-modal .h2-business-status-stat__label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 8px; line-height: 1.2; }',
	'.h2-business-status-modal .h2-business-status-stat__value { font-size: 16px; font-weight: 700; line-height: 1.35; color: #0f172a; word-break: break-word; }',
	'.h2-business-status-modal .h2-business-status-stat__value--hours { font-size: 15px; font-weight: 700; color: #2563eb; font-variant-numeric: tabular-nums; }',
	'.h2-business-status-modal .h2-business-status-form-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-business-status-modal .h2-business-status-form-wrap .ant-form-item { margin-bottom: 14px; }',
	'.h2-business-status-modal .h2-business-status-form-wrap .ant-form-item:last-child { margin-bottom: 0; }',
	'.h2-business-status-modal .h2-business-status-form-wrap .ant-form-item-label > label { font-size: 13px; font-weight: 600; color: #334155; }',
	'.h2-business-status-modal .h2-business-status-form-wrap .ant-picker { width: 100% !important; border-radius: 8px !important; }',
	'.h2-business-status-modal .h2-business-status-form-hint { margin-top: 10px; padding: 8px 12px; font-size: 12px; color: #64748b; line-height: 1.5; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }',
	'.h2-business-status-modal .h2-business-status-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-business-status-modal .h2-business-status-table-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border-bottom: 1px solid #f1f5f9; background: #fafbfc; }',
	'.h2-business-status-modal .h2-business-status-table-head__title { font-size: 13px; font-weight: 700; color: #334155; }',
	'.h2-business-status-modal .h2-business-status-table-head__count { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; }',
	'.h2-business-status-modal .h2-business-status-record-table { border-radius: 0 !important; }',
	'.h2-business-status-modal .h2-business-status-record-table .ant-table { background: transparent !important; }',
	'.h2-business-status-modal .h2-business-status-record-table .ant-table-container { border: none !important; }',
	'.h2-business-status-modal .h2-business-status-record-table .ant-table-header { margin-bottom: 0 !important; }',
	'.h2-business-status-modal .h2-business-status-record-table .ant-table-body { margin-top: 0 !important; overflow-y: auto !important; }',
	'.h2-business-status-modal .h2-business-status-record-table .ant-table-body table { margin-top: 0 !important; }',
	'.h2-business-status-modal .h2-business-status-record-table .ant-table-tbody > tr.ant-table-measure-row, .h2-business-status-modal .h2-business-status-record-table .ant-table-tbody > tr.ant-table-measure-row > td { height: 0 !important; max-height: 0 !important; padding: 0 !important; margin: 0 !important; border: none !important; line-height: 0 !important; font-size: 0 !important; overflow: hidden !important; visibility: hidden !important; }',
	'.h2-business-status-modal .h2-business-status-record-table .ant-table-thead > tr > th { background: #f8fafc !important; font-size: 12px !important; font-weight: 700 !important; color: #475569 !important; padding: 10px 12px !important; border-bottom: 1px solid #e2e8f0 !important; }',
	'.h2-business-status-modal .h2-business-status-record-table .ant-table-tbody > tr:not(.ant-table-measure-row) > td { font-size: 13px !important; padding: 10px 12px !important; vertical-align: middle !important; border-bottom: 1px solid #f8fafc !important; }',
	'.h2-business-status-modal .h2-business-status-record-table .ant-table-tbody > tr:not(.ant-table-measure-row):last-child > td { border-bottom: none !important; }',
	'.h2-business-status-modal .h2-business-status-record-table .ant-table-tbody > tr:hover > td { background: #f0fdf4 !important; }',
	'.h2-statement-modal .ant-modal-content { border-radius: 16px !important; overflow: hidden; box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18) !important; }',
	'.h2-statement-modal .ant-modal-header { padding: 18px 24px 14px !important; border-bottom: 1px solid #f1f5f9 !important; margin-bottom: 0 !important; }',
	'.h2-statement-modal .ant-modal-title { font-size: 17px !important; font-weight: 700 !important; color: #0f172a !important; }',
	'.h2-statement-modal .ant-modal-body { padding: 16px 24px 20px !important; background: #f8fafc; }',
	'.h2-statement-modal .ant-modal-footer { padding: 12px 24px 18px !important; border-top: 1px solid #f1f5f9 !important; background: #fff; }',
	'.h2-statement-modal .h2-statement-panel { display: flex; flex-direction: column; gap: 14px; }',
	'.h2-statement-modal .h2-statement-station-card { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 16px; background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #f8fafc 100%); border: 1px solid #ddd6fe; border-radius: 12px; }',
	'.h2-statement-modal .h2-statement-station-card__name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.35; }',
	'.h2-statement-modal .h2-statement-station-card__meta { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; white-space: nowrap; }',
	'.h2-statement-modal .h2-statement-form-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-statement-modal .h2-statement-form-wrap .ant-form-item { margin-bottom: 0; }',
	'.h2-statement-modal .h2-statement-form-wrap .ant-form-item-label > label { font-size: 13px; font-weight: 600; color: #334155; }',
	'.h2-statement-modal .h2-statement-form-wrap .ant-input { border-radius: 8px !important; }',
	'.h2-statement-modal .h2-statement-date-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }',
	'@media (max-width: 520px) { .h2-statement-modal .h2-statement-date-grid { grid-template-columns: 1fr; } }',
	'.h2-statement-modal .h2-statement-form-hint { margin-top: 10px; padding: 8px 12px; font-size: 12px; color: #64748b; line-height: 1.5; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }',
	'.h2-statement-modal .h2-statement-form-hint strong { color: #5b21b6; font-weight: 700; }',
	'.h2-statement-modal .h2-statement-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }',
	'@media (max-width: 640px) { .h2-statement-modal .h2-statement-stats { grid-template-columns: 1fr; } }',
	'.h2-statement-modal .h2-statement-stat { display: flex; flex-direction: column; justify-content: center; min-height: 78px; padding: 12px 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); min-width: 0; box-sizing: border-box; }',
	'.h2-statement-modal .h2-statement-stat--count { border-left: 4px solid #7c3aed; }',
	'.h2-statement-modal .h2-statement-stat--kg { border-left: 4px solid #10b981; background: linear-gradient(180deg, #fff 0%, #f0fdf4 100%); }',
	'.h2-statement-modal .h2-statement-stat--cost { border-left: 4px solid #f97316; }',
	'.h2-statement-modal .h2-statement-stat__label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 8px; line-height: 1.2; }',
	'.h2-statement-modal .h2-statement-stat__value { font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.2; color: #0f172a; word-break: break-all; }',
	'.h2-statement-modal .h2-statement-stat__value--count { color: #6d28d9; }',
	'.h2-statement-modal .h2-statement-stat__value--kg { color: #059669; }',
	'.h2-statement-modal .h2-statement-stat__value--cost { color: #ea580c; }',
	'.h2-statement-modal .h2-statement-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-statement-modal .h2-statement-table-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border-bottom: 1px solid #f1f5f9; background: #fafbfc; }',
	'.h2-statement-modal .h2-statement-table-head__left { display: flex; align-items: center; gap: 10px; min-width: 0; }',
	'.h2-statement-modal .h2-statement-table-head__title { font-size: 13px; font-weight: 700; color: #334155; }',
	'.h2-statement-modal .h2-statement-table-head__count { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; }',
	'.h2-statement-modal .h2-statement-record-table { border-radius: 0 !important; }',
	'.h2-statement-modal .h2-statement-record-table .ant-table { background: transparent !important; }',
	'.h2-statement-modal .h2-statement-record-table .ant-table-container { border: none !important; }',
	'.h2-statement-modal .h2-statement-record-table .ant-table-header { margin-bottom: 0 !important; }',
	'.h2-statement-modal .h2-statement-record-table .ant-table-body { margin-top: 0 !important; overflow-y: auto !important; }',
	'.h2-statement-modal .h2-statement-record-table .ant-table-body table { margin-top: 0 !important; }',
	'.h2-statement-modal .h2-statement-record-table .ant-table-tbody > tr.ant-table-measure-row, .h2-statement-modal .h2-statement-record-table .ant-table-tbody > tr.ant-table-measure-row > td { height: 0 !important; max-height: 0 !important; padding: 0 !important; margin: 0 !important; border: none !important; line-height: 0 !important; font-size: 0 !important; overflow: hidden !important; visibility: hidden !important; }',
	'.h2-statement-modal .h2-statement-record-table .ant-table-thead > tr > th { background: #f8fafc !important; font-size: 12px !important; font-weight: 700 !important; color: #475569 !important; padding: 10px 12px !important; border-bottom: 1px solid #e2e8f0 !important; }',
	'.h2-statement-modal .h2-statement-record-table .ant-table-tbody > tr:not(.ant-table-measure-row) > td { font-size: 13px !important; padding: 10px 12px !important; vertical-align: middle !important; border-bottom: 1px solid #f8fafc !important; }',
	'.h2-statement-modal .h2-statement-record-table .ant-table-tbody > tr:not(.ant-table-measure-row):last-child > td { border-bottom: none !important; }',
	'.h2-statement-modal .h2-statement-record-table .ant-table-tbody > tr:hover > td { background: #f5f3ff !important; }',
	'.h2-statement-modal .h2-statement-last-end { margin-top: 10px; padding: 8px 12px; font-size: 12px; color: #475569; line-height: 1.5; background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; font-variant-numeric: tabular-nums; }',
	'.h2-statement-modal .h2-statement-last-end strong { color: #6d28d9; font-weight: 700; }',
	'.h2-statement-modal .h2-statement-settlement-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); display: flex; flex-direction: column; gap: 14px; }',
	'.h2-statement-modal .h2-statement-settlement-wrap .ant-form-item { margin-bottom: 0; }',
	'.h2-statement-modal .h2-statement-settlement-wrap .ant-form-item-label > label { font-size: 13px; font-weight: 600; color: #334155; }',
	'.h2-statement-modal .h2-statement-receipt-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }',
	'@media (max-width: 520px) { .h2-statement-modal .h2-statement-receipt-grid { grid-template-columns: 1fr; } }',
	'.h2-statement-modal .h2-statement-receipt-amount-input .ant-input { font-variant-numeric: tabular-nums; }',
	'.h2-statement-modal .h2-statement-receipt-amount-input .ant-input-prefix { color: #64748b; font-weight: 600; margin-inline-end: 4px; }',
	'.h2-statement-modal .h2-statement-settlement-wrap .ant-picker { width: 100% !important; border-radius: 8px !important; }',
	'.h2-statement-modal .h2-statement-invoice-upload .h2-contract-upload-actions { gap: 0; }',
	'.h2-statement-modal .h2-statement-invoice-upload .h2-statement-upload-btn.ant-btn { display: inline-flex !important; align-items: center; gap: 6px; height: 32px !important; padding: 0 14px !important; border-radius: 8px !important; font-size: 13px !important; font-weight: 600 !important; border: 1px solid #e2e8f0 !important; color: #475569 !important; background: #fff !important; box-shadow: none !important; }',
	'.h2-statement-modal .h2-statement-invoice-upload .h2-statement-upload-btn.ant-btn:hover { border-color: #10b981 !important; color: #059669 !important; background: #f0fdf4 !important; }',
	'.h2-statement-modal .h2-statement-invoice-upload .h2-statement-upload-btn.ant-btn:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.h2-recharge-modal .ant-modal-content { border-radius: 16px !important; overflow: hidden; box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18) !important; }',
	'.h2-recharge-modal .ant-modal-header { padding: 18px 24px 14px !important; border-bottom: 1px solid #f1f5f9 !important; margin-bottom: 0 !important; }',
	'.h2-recharge-modal .ant-modal-title { font-size: 17px !important; font-weight: 700 !important; color: #0f172a !important; }',
	'.h2-recharge-modal .ant-modal-body { padding: 16px 24px 20px !important; background: #f8fafc; }',
	'.h2-recharge-modal .ant-modal-footer { padding: 12px 24px 18px !important; border-top: 1px solid #f1f5f9 !important; background: #fff; }',
	'.h2-recharge-modal .h2-recharge-panel { display: flex; flex-direction: column; gap: 14px; }',
	'.h2-recharge-modal .h2-recharge-hint { margin: 0; padding: 10px 12px; font-size: 12px; color: #64748b; line-height: 1.55; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; }',
	'.h2-recharge-modal .h2-recharge-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }',
	'.h2-recharge-modal .h2-recharge-toolbar__count { font-size: 13px; color: #64748b; font-variant-numeric: tabular-nums; }',
	'.h2-recharge-modal .h2-recharge-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-recharge-modal .h2-recharge-record-table .ant-table-thead > tr > th { background: #f8fafc !important; font-size: 12px !important; font-weight: 700 !important; color: #475569 !important; padding: 10px 12px !important; }',
	'.h2-recharge-modal .h2-recharge-record-table .ant-table-tbody > tr > td { font-size: 13px !important; padding: 8px 10px !important; vertical-align: middle !important; }',
	'.h2-recharge-modal .h2-recharge-readonly { font-size: 13px; color: #334155; line-height: 1.45; word-break: break-all; }',
	'.h2-recharge-modal .h2-recharge-readonly--muted { color: #94a3b8; }',
	'.h2-recharge-modal .h2-recharge-readonly-input.ant-input[disabled] { background: #f8fafc !important; color: #334155 !important; cursor: default !important; border: 1px solid #e2e8f0 !important; }',
	'.h2-alert-station-modal .ant-modal-content { border-radius: 16px !important; overflow: hidden; box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18) !important; }',
	'.h2-alert-station-modal .ant-modal-header { padding: 18px 24px 14px !important; border-bottom: 1px solid #f1f5f9 !important; margin-bottom: 0 !important; }',
	'.h2-alert-station-modal .ant-modal-title { font-size: 17px !important; font-weight: 700 !important; color: #0f172a !important; }',
	'.h2-alert-station-modal .ant-modal-body { padding: 16px 24px 20px !important; background: #f8fafc; }',
	'.h2-alert-station-modal .ant-modal-footer { padding: 12px 24px 18px !important; border-top: 1px solid #f1f5f9 !important; background: #fff; }',
	'.h2-alert-station-modal .h2-alert-station-panel { display: flex; flex-direction: column; gap: 14px; }',
	'.h2-alert-station-modal .h2-alert-station-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 16px; background: linear-gradient(135deg, #fff7ed 0%, #fffbeb 50%, #f8fafc 100%); border: 1px solid #fed7aa; border-radius: 12px; }',
	'.h2-alert-station-modal .h2-alert-station-head__title { font-size: 14px; font-weight: 700; color: #0f172a; }',
	'.h2-alert-station-modal .h2-alert-station-head__count { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; }',
	'.h2-alert-station-modal .h2-alert-station-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-statement-modal .h2-statement-detail-receipt-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-statement-modal .h2-statement-detail-receipt-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 20px; }',
	'@media (max-width: 520px) { .h2-statement-modal .h2-statement-detail-receipt-grid { grid-template-columns: 1fr; } }',
	'.h2-statement-modal .h2-statement-detail-receipt-item__label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; }',
	'.h2-statement-modal .h2-statement-detail-receipt-item__value { font-size: 14px; font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; }',
	'.h2-statement-modal .h2-statement-detail-receipt-item__value--amount { color: #ea580c; }',
	'.h2-statement-modal .h2-statement-detail-receipt-files { margin-top: 12px; padding-top: 12px; border-top: 1px solid #f1f5f9; }',
	'.h2-statement-modal .h2-statement-detail-receipt-file-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }',
	'.h2-statement-modal .h2-statement-detail-receipt-file-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; }',
	'.h2-statement-modal .h2-statement-detail-receipt-file-name { font-size: 13px; color: #334155; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
	'.h2-statement-modal .h2-statement-balance-readonly { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-height: 32px; padding: 6px 12px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; }',
	'.h2-statement-modal .h2-statement-balance-readonly__amount { font-size: 16px; font-weight: 800; font-variant-numeric: tabular-nums; }',
	'.h2-statement-modal .h2-statement-balance-readonly__amount--positive { color: #059669; }',
	'.h2-statement-modal .h2-statement-balance-readonly__amount--negative { color: #dc2626; }',
	'.h2-statement-history-modal .ant-modal-content { border-radius: 16px !important; overflow: hidden; box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18) !important; }',
	'.h2-statement-history-modal .ant-modal-header { padding: 18px 24px 14px !important; border-bottom: 1px solid #f1f5f9 !important; margin-bottom: 0 !important; }',
	'.h2-statement-history-modal .ant-modal-title { font-size: 17px !important; font-weight: 700 !important; color: #0f172a !important; }',
	'.h2-statement-history-modal .ant-modal-body { padding: 16px 24px 20px !important; background: #f8fafc; }',
	'.h2-statement-history-modal .ant-modal-footer { padding: 12px 24px 18px !important; border-top: 1px solid #f1f5f9 !important; background: #fff; }',
	'.h2-statement-history-modal .h2-statement-history-panel { display: flex; flex-direction: column; gap: 14px; }',
	'.h2-statement-history-modal .h2-statement-history-station-card { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 16px; background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #f8fafc 100%); border: 1px solid #ddd6fe; border-radius: 12px; }',
	'.h2-statement-history-modal .h2-statement-history-station-card__name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.35; }',
	'.h2-statement-history-modal .h2-statement-history-station-card__meta { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; white-space: nowrap; }',
	'.h2-statement-history-modal .h2-statement-history-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.h2-statement-history-modal .h2-statement-history-table-wrap .ant-table-thead > tr > th { background: #f8fafc !important; font-size: 12px !important; font-weight: 700 !important; color: #475569 !important; }',
	'.h2-statement-history-modal .h2-statement-history-table-wrap .ant-table-tbody > tr:hover > td { background: #f5f3ff !important; }',
	'.h2-statement-history-modal .h2-statement-history-balance { font-weight: 700; font-variant-numeric: tabular-nums; }',
	'.h2-statement-history-modal .h2-statement-history-balance--negative { color: #dc2626; }',
	'.h2-statement-history-modal .h2-statement-history-balance--positive { color: #059669; }',
	'.h2-station-page .h2-ledger-totals-bar__value--income { color: #059669 !important; }',
	'.h2-station-page .h2-ledger-totals-bar__value--expense { color: #ea580c !important; }',
	'.h2-station-page .h2-ledger-totals-bar__value--negative { color: #dc2626 !important; }',
	'.h2-station-page.h2-station-page--create { padding: 0 0 96px; height: auto; min-height: 100dvh; overflow: auto; }',
	'.h2-station-page--create .h2-create-shell { width: 100%; max-width: none; margin: 0; padding: 24px 24px 0; box-sizing: border-box; }',
	'.h2-station-page.h2-station-page--edit { padding: 0 0 96px; height: auto; min-height: 100dvh; overflow: auto; }',
	'.h2-station-page--edit .h2-create-shell { width: 100%; max-width: none; margin: 0; padding: 24px 24px 0; box-sizing: border-box; }',
	'.h2-account-bind-readonly-wrap { padding: 12px 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; }',
	'.h2-account-bind-readonly-item { padding: 10px 12px; border-radius: 8px; background: #fff; border: 1px solid #e2e8f0; margin-bottom: 8px; }',
	'.h2-account-bind-readonly-item:last-child { margin-bottom: 0; }',
	'.h2-account-bind-readonly-item__name { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }',
	'.h2-account-bind-readonly-item__meta { font-size: 12px; color: #64748b; }',
	'.h2-station-page--create .h2-create-pagehead { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }',
	'.h2-station-page--create .h2-create-pagehead-left { display: flex; align-items: center; gap: 12px; min-width: 0; }',
	'.h2-station-page--create .h2-create-pagehead-title { margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.35; }',
	'.h2-station-page--create .h2-create-pagehead-desc { margin: 2px 0 0; font-size: 13px; color: #64748b; line-height: 1.45; }',
	'.h2-station-page--create .h2-create-card.ant-card { margin-bottom: 16px !important; }',
	'.h2-station-page--create .h2-create-form--grid .h2-create-form-grid { width: 100%; display: flex; flex-direction: column; gap: var(--h2-form-row-gap); }',
	'.h2-station-page--create .h2-create-form--grid .h2-create-form-grid > .ant-row { margin-bottom: 0 !important; }',
	'.h2-station-page--create .h2-create-form--grid .ant-form-item-label { padding: 0 0 var(--h2-form-label-gap) !important; min-height: 22px; }',
	'.h2-station-page--create .h2-create-form--grid .ant-form-item-label > label { display: inline-flex; align-items: center; min-height: 22px; line-height: 22px; font-size: 13px; font-weight: 500; color: #475569; height: auto; }',
	'.h2-station-page--create .h2-create-form--grid .ant-row { width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }',
	'.h2-station-page--create .h2-create-form--grid .ant-col { min-width: 0; }',
	'.h2-station-page--create .h2-create-form--grid .ant-form-item { margin-bottom: 0; width: 100%; }',
	'.h2-station-page--create .h2-create-form--grid .ant-col > .ant-form-item { display: flex; flex-direction: column; }',
	'.h2-station-page--create .h2-create-form--grid .ant-form-item-control { flex: 1; width: 100%; }',
	'.h2-station-page--create .h2-create-form--grid .ant-form-item-control-input, .h2-station-page--create .h2-create-form--grid .ant-form-item-control-input-content { width: 100%; max-width: 100%; }',
	'.h2-station-page--create .h2-create-form--grid .h2-create-input, .h2-station-page--create .h2-create-form--grid .ant-select, .h2-station-page--create .h2-create-form--grid .ant-cascader, .h2-station-page--create .h2-create-form--grid .ant-picker { width: 100% !important; max-width: 100% !important; }',
	'.h2-station-page--create .h2-create-form--grid .h2-address-paste, .h2-station-page--create .h2-create-form--grid .h2-contract-panel, .h2-station-page--create .h2-create-form--grid .h2-create-upload { width: 100%; }',
	'.h2-station-page--create .h2-create-subsection-title { margin: 4px 0 0; padding: 12px 0 10px; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #f1f5f9; width: 100%; box-sizing: border-box; }',
	'.h2-station-page--create .h2-supplier-mode-picker-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; width: 100%; }',
	'.h2-station-page--create .h2-supplier-mode-picker-row .h2-supplier-mode-card { height: 100%; min-height: 88px; }',
	'@media (max-width: 768px) { .h2-station-page--create .h2-supplier-mode-picker-row { grid-template-columns: 1fr; gap: 12px; } }',
	'.h2-station-page--create .h2-create-panel { padding: 16px 18px; border-radius: 12px; background: #f8fafc; border: 1px solid #e8ecf0; }',
	'.h2-station-page--create .h2-create-panel + .h2-create-panel, .h2-station-page--create .h2-create-panel + .ant-row, .h2-station-page--create .ant-row + .h2-create-panel { margin-top: 16px; }',
	'.h2-station-page--create .h2-create-panel-head { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; font-size: 13px; font-weight: 700; color: #334155; }',
	'.h2-station-page--create .h2-create-panel-head::before { content: ""; width: 4px; height: 14px; border-radius: 2px; background: linear-gradient(180deg, #10b981, #6ee7b7); flex-shrink: 0; }',
	'.h2-station-page--create .h2-create-panel--address .h2-region-address--inline { gap: 12px; }',
	'.h2-station-page--create .h2-create-panel--address .h2-region-address--inline .h2-region-address-cascader { flex: 0 0 42%; max-width: 280px; }',
	'.h2-station-page--create .h2-create-panel--address .h2-address-paste { margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0; }',
	'.h2-station-page--create .h2-station-map-picker { display: flex; flex-direction: column; gap: 12px; width: 100%; }',
	'.h2-station-page--create .h2-station-map-picker__toolbar { display: flex; align-items: center; gap: 8px; width: 100%; }',
	'.h2-station-page--create .h2-station-map-picker__toolbar .ant-input { flex: 1; min-width: 0; }',
	'.h2-station-page--create .h2-station-map-picker__toolbar .ant-btn { flex-shrink: 0; min-height: 32px; border-radius: 8px; font-weight: 600; }',
	'.h2-station-page--create .h2-station-map-picker__map { position: relative; width: 100%; height: 280px; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden; background: #f1f5f9; }',
	'.h2-station-page--create .h2-station-map-picker__map .leaflet-container { height: 100%; width: 100%; font-family: inherit; z-index: 0; }',
	'.h2-station-page--create .h2-station-map-picker__coords { display: flex; flex-wrap: wrap; gap: 8px 20px; font-size: 12px; color: #64748b; line-height: 1.5; }',
	'.h2-station-page--create .h2-station-map-picker__coords-item { display: inline-flex; align-items: center; gap: 6px; }',
	'.h2-station-page--create .h2-station-map-picker__coords-item strong { color: #0f172a; font-weight: 700; font-variant-numeric: tabular-nums; }',
	'.h2-station-page--create .h2-station-map-picker__hint { font-size: 12px; color: #94a3b8; line-height: 1.45; }',
	'.h2-station-page--create .h2-create-panel--contract .h2-create-radio-group { padding: 10px 14px; background: #fff; border-radius: 10px; border: 1px solid #e2e8f0; }',
	'.h2-station-page--create .h2-create-contract-fields { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 14px; }',
	'@media (min-width: 640px) { .h2-station-page--create .h2-create-contract-fields { grid-template-columns: 1fr 1fr; } }',
	'.h2-station-page--create .h2-supplier-link-panel { padding: 16px 18px; border-radius: 12px; background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%); border: 1px solid #bfdbfe; }',
	'.h2-station-page--create .h2-account-bind-layout { display: grid; grid-template-columns: minmax(280px, 1fr) minmax(0, 1.65fr); gap: 24px; align-items: start; width: 100%; }',
	'@media (max-width: 960px) { .h2-station-page--create .h2-account-bind-layout { grid-template-columns: 1fr; } }',
	'.h2-station-page--create .h2-account-bind-side { display: flex; flex-direction: column; gap: 12px; min-width: 0; }',
	'.h2-station-page--create .h2-account-bind-side .ant-form-item { margin-bottom: 0 !important; }',
	'.h2-station-page--create .h2-account-bind-side__hint { margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.55; }',
	'.h2-station-page--create .h2-account-bind-selected-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }',
	'.h2-station-page--create .h2-account-bind-selected-label { font-size: 13px; color: #64748b; }',
	'.h2-station-page--create .h2-account-bind-selected-count.ant-tag { margin: 0 !important; border-radius: 6px !important; font-weight: 600 !important; line-height: 20px !important; padding: 0 8px !important; }',
	'.h2-station-page--create .h2-account-bind-preview-area { min-width: 0; padding: 14px 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e8ecf0; min-height: 180px; box-sizing: border-box; }',
	'.h2-station-page--create .h2-account-bind-preview-title { font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 12px; }',
	'.h2-station-page--create .h2-account-bind-preview-cards { display: flex; flex-wrap: wrap; gap: 12px; }',
	'.h2-station-page--create .h2-account-bind-preview-empty { font-size: 13px; color: #94a3b8; line-height: 1.5; padding: 24px 8px; text-align: center; }',
	'.h2-station-page--create .h2-account-bind-user-card { position: relative; display: flex; align-items: flex-start; gap: 12px; padding: 12px 34px 12px 12px; width: 220px; max-width: 100%; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); box-sizing: border-box; }',
	'.h2-station-page--create .h2-account-bind-user-card__avatar { flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(145deg, #10b981 0%, #059669 100%); color: #fff; display: inline-flex; align-items: center; justify-content: center; }',
	'.h2-station-page--create .h2-account-bind-user-card__body { flex: 1; min-width: 0; }',
	'.h2-station-page--create .h2-account-bind-user-card__name-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }',
	'.h2-station-page--create .h2-account-bind-user-card__name { font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.3; }',
	'.h2-station-page--create .h2-account-bind-user-card__role.ant-tag { margin: 0 !important; border-radius: 4px !important; font-size: 11px !important; font-weight: 600 !important; line-height: 18px !important; padding: 0 6px !important; }',
	'.h2-station-page--create .h2-account-bind-user-card__meta { margin-top: 6px; font-size: 12px; color: #94a3b8; line-height: 1.5; }',
	'.h2-station-page--create .h2-account-bind-user-card__meta + .h2-account-bind-user-card__meta { margin-top: 2px; }',
	'.h2-station-page--create .h2-account-bind-user-card__remove { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; border: none; background: transparent; color: #94a3b8; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; padding: 0; font-size: 14px; line-height: 1; }',
	'.h2-station-page--create .h2-account-bind-user-card__remove:hover { color: #64748b; background: #f1f5f9; }',
	'.h2-station-page--create .h2-account-bind-user-card__remove:focus-visible { outline: 2px solid #10b981; outline-offset: 1px; }',
	'.h2-station-page--create .h2-account-bind-hint { margin: 0; font-size: 12px; color: #64748b; line-height: 1.55; }',
	'.h2-station-page--create .h2-create-readonly-input.ant-input[disabled] { background: #f8fafc !important; color: #64748b !important; cursor: default !important; border: 1px dashed #e2e8f0 !important; }',
	'.h2-station-page--create .h2-station-type-field { display: flex; flex-direction: column; gap: 8px; width: 100%; }',
	'.h2-station-page--create .h2-supplier-tabs { width: 100%; }',
	'.h2-station-page--create .h2-supplier-tabs__nav { display: flex; align-items: flex-end; gap: 32px; border-bottom: 1px solid #e2e8f0; margin-bottom: var(--h2-form-row-gap); }',
	'.h2-station-page--create .h2-supplier-tabs__item { position: relative; border: none; background: transparent; padding: 0 0 12px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; line-height: 1.4; }',
	'.h2-station-page--create .h2-supplier-tabs__item:hover { color: #059669; }',
	'.h2-station-page--create .h2-supplier-tabs__item--active { color: #059669; font-weight: 600; }',
	'.h2-station-page--create .h2-supplier-tabs__item--active::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: #10b981; border-radius: 1px 1px 0 0; }',
	'.h2-station-page--create .h2-supplier-tabs__panel { width: 100%; }',
	'.h2-station-page--create .h2-supplier-linked-preview { margin-top: var(--h2-form-row-gap); }',
	'.h2-station-page--create .h2-supplier-none-hint { margin: 0; padding: 20px 16px; text-align: center; font-size: 13px; color: #94a3b8; line-height: 1.55; background: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 10px; }',
	'.h2-station-page--create .h2-create-upload--readonly.ant-upload-wrapper .ant-upload-drag { cursor: default !important; pointer-events: none; opacity: 0.92; }',
	'.h2-station-page--create .h2-supplier-new-stack { display: flex; flex-direction: column; gap: 16px; }',
	'.h2-station-page--create .h2-create-form--visual .ant-form-item-label > label { font-weight: 500; color: #334155; }',
	'.h2-station-page--create .h2-create-form--visual .h2-create-input.ant-input:not(.ant-input-disabled), .h2-station-page--create .h2-create-form--visual .ant-select:not(.ant-select-disabled) .ant-select-selector, .h2-station-page--create .h2-create-form--visual .ant-cascader:not(.ant-select-disabled) .ant-select-selector, .h2-station-page--create .h2-create-form--visual .h2-create-input.ant-picker:not(.ant-picker-disabled) { border-radius: 10px !important; height: 40px !important; min-height: 40px !important; border-color: #e2e8f0 !important; }',
	'.h2-station-page--create .h2-create-form--visual .ant-input { padding: 8px 14px !important; }',
	'.h2-station-page--create .h2-create-form--visual .ant-select-selection-item { line-height: 38px !important; }',
	'.h2-station-page--create .h2-create-form--visual .ant-input-lg { height: 44px !important; font-size: 15px !important; border-radius: 10px !important; }',
	'.h2-station-page--create .h2-create-panel .ant-form-item + .ant-form-item, .h2-station-page--create .h2-create-panel .ant-form-item + .ant-row, .h2-station-page--create .h2-create-panel .ant-row + .ant-form-item, .h2-station-page--create .h2-create-panel .ant-form-item + .h2-address-paste, .h2-station-page--create .h2-create-panel .ant-row + .h2-address-paste { margin-top: 12px; }',
	'.h2-station-page--create .h2-create-form--visual .h2-create-radio-group { min-height: 40px; }',
	'.h2-station-page--create .h2-create-form--visual .ant-form-item-control-input { max-width: 100%; }',
	'.h2-station-page--create .h2-create-back-only, .h2-station-page--edit .h2-create-back-only { display: flex; align-items: center; margin-bottom: 16px; }',
	'.h2-station-page--create .h2-create-back-btn, .h2-station-page--edit .h2-create-back-btn { display: inline-flex !important; align-items: center; gap: 6px; height: 32px; padding: 0 12px !important; border-radius: 8px !important; font-weight: 500; color: #475569 !important; border: 1px solid #e2e8f0 !important; background: #fff !important; }',
	'.h2-station-page--create .h2-create-back-btn:hover, .h2-station-page--edit .h2-create-back-btn:hover { color: #059669 !important; border-color: #10b981 !important; background: #f0fdf4 !important; }',
	'.h2-station-page--create .h2-create-back-btn:focus-visible, .h2-station-page--edit .h2-create-back-btn:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.h2-station-page .h2-create-card.ant-card { border-radius: 16px !important; border: 1px solid #e2e8f0 !important; box-shadow: 0 4px 24px -6px rgba(15, 23, 42, 0.06) !important; margin-bottom: 0 !important; transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease; }',
	'.h2-station-page--create .h2-create-card.ant-card:hover { box-shadow: 0 4px 24px -6px rgba(15, 23, 42, 0.06) !important; transform: none; }',
	'.h2-station-page .h2-create-card > .ant-card-head { border-bottom: 1px solid #f1f5f9 !important; min-height: auto; padding: 16px 22px !important; background: linear-gradient(180deg, #fafbfc 0%, #fff 100%); }',
	'.h2-station-page .h2-create-card > .ant-card-head .ant-card-head-title { font-size: 15px !important; font-weight: 700 !important; color: #0f172a !important; padding: 0 !important; }',
	'.h2-station-page .h2-create-card > .ant-card-body { padding: 20px 24px 24px !important; display: flex; flex-direction: column; gap: 16px; }',
	'@media (max-width: 640px) { .h2-station-page--create .h2-create-card > .ant-card-body { padding: 16px 16px 20px !important; } }',
	'.h2-station-page .h2-card-title-bar { display: inline-flex; align-items: center; gap: 10px; }',
	'.h2-station-page .h2-card-title-bar::before { content: ""; width: 3px; height: 16px; border-radius: 2px; background: linear-gradient(180deg, #10b981, #34d399); flex-shrink: 0; }',
	'.h2-station-page .h2-card-title-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 10px; background: #ecfdf5; color: #059669; flex-shrink: 0; }',
	'.h2-station-page .h2-form-section { margin-bottom: 0; }',
	'.h2-station-page .h2-form-section + .h2-form-section { margin-top: var(--h2-form-row-gap); }',
	'.h2-station-page .h2-form-section-body { display: flex; flex-direction: column; gap: var(--h2-form-row-gap); }',
	'.h2-station-page .h2-form-section-body > .ant-row { margin: 0 !important; align-items: flex-start; }',
	'.h2-station-page .h2-form-section-body .ant-form-item { margin-bottom: 0 !important; width: 100%; }',
	'.h2-station-page .h2-form-section-body .ant-col { display: flex; flex-direction: column; min-width: 0; }',
	'.h2-station-page .h2-form-section-body .ant-col > .ant-form-item { flex: 1; min-width: 0; }',
	'.h2-station-page--create .h2-create-form .h2-form-section-body .h2-supplier-mode-card { height: 100%; box-sizing: border-box; }',
	'.h2-station-page .h2-contract-panel { padding: 14px 16px; border-radius: 10px; background: linear-gradient(180deg, #fafbfc 0%, #fff 100%); border: 1px solid #e8ecf0; }',
	'.h2-station-page--create .h2-create-topbar-main { display: flex; align-items: center; gap: 14px; min-width: 0; }',
	'.h2-station-page--create .h2-create-page-title { min-width: 0; }',
	'.h2-station-page--create .h2-create-page-title h1 { margin: 0; font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.35; }',
	'.h2-station-page--create .h2-create-page-title p { margin: 2px 0 0; font-size: 12px; color: #94a3b8; line-height: 1.4; }',
	'.h2-station-page--create .h2-create-form .ant-picker-range { width: 100% !important; max-width: 100%; }',
	'.h2-station-page--create .h2-create-form .ant-picker-range .ant-picker-input > input { font-size: 13px !important; }',
	'.h2-station-page .h2-supplier-mode-card-body { flex: 1; min-width: 0; }',
	'.h2-station-page--create .h2-create-form .ant-row { width: 100%; }',
	'.h2-station-page--create .h2-create-form .ant-col-6 { min-width: 0; }',
	'.h2-station-page--create .h2-create-form .ant-form-item { margin-bottom: 0; }',
	'.h2-station-page--create .h2-create-form .ant-form-item-label { padding: 0 0 var(--h2-form-label-gap); min-height: 22px; }',
	'.h2-station-page--create .h2-create-form .ant-form-item-label > label { display: inline-flex; align-items: center; min-height: 22px; line-height: 22px; font-size: 14px; font-weight: 400; color: #1d2129; height: auto; }',
	'.h2-station-page--create .h2-create-form .ant-form-item-extra { margin-top: 6px; font-size: 12px; line-height: 1.45; }',
	'.h2-station-page--create .h2-create-form .ant-form-item-label > label::after { display: none !important; }',
	'.h2-station-page--create .h2-create-input.ant-input:not(.ant-input-disabled):not(:disabled), .h2-station-page--create .h2-create-form .ant-select:not(.ant-select-disabled) .ant-select-selector, .h2-station-page--create .h2-create-form .ant-cascader:not(.ant-select-disabled) .ant-select-selector, .h2-station-page--create .h2-create-form .h2-create-input.ant-picker:not(.ant-picker-disabled) { height: 32px !important; min-height: 32px !important; border-radius: 2px !important; font-size: 14px !important; border: 1px solid #e5e6eb !important; background: #fff !important; color: #1d2129 !important; }',
	'.h2-station-page--create .h2-create-form .h2-create-input.ant-picker:not(.ant-picker-disabled):hover { border-color: #c9cdd4 !important; background: #fff !important; }',
	'.h2-station-page--create .h2-create-form .h2-create-input.ant-picker-focused { border-color: #10b981 !important; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important; background: #fff !important; }',
	'.h2-station-page .h2-supplier-mode-card { font-family: inherit; width: 100%; box-sizing: border-box; }',
	'.h2-station-page--create .h2-create-form .ant-input { padding: 4px 12px !important; }',
	'.h2-station-page--create .h2-create-form .ant-input-textarea:not(.ant-input-disabled):not(:disabled), .h2-station-page--create .h2-create-form .h2-address-paste .ant-input-textarea:not(.ant-input-disabled) { height: auto !important; min-height: auto !important; border-radius: 2px !important; background: #fff !important; color: #1d2129 !important; border: 1px solid #e5e6eb !important; }',
	'.h2-station-page--create .h2-create-form .ant-input:not(:disabled):not(.ant-input-disabled):hover, .h2-station-page--create .h2-create-form .ant-select:not(.ant-select-disabled):hover .ant-select-selector, .h2-station-page--create .h2-create-form .ant-cascader:not(.ant-select-disabled):hover .ant-select-selector { background: #fff !important; border-color: #c9cdd4 !important; }',
	'.h2-station-page--create .h2-create-form .ant-input:focus, .h2-station-page--create .h2-create-form .ant-input-focused, .h2-station-page--create .h2-create-form .ant-select-focused .ant-select-selector, .h2-station-page--create .h2-create-form .ant-cascader-focused .ant-select-selector { background: #fff !important; border-color: #10b981 !important; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important; }',
	'.h2-station-page--create .h2-create-form .ant-input-disabled, .h2-station-page--create .h2-create-form .ant-input:disabled, .h2-station-page--create .h2-create-form .ant-select-disabled .ant-select-selector, .h2-station-page--create .h2-create-form .ant-cascader.ant-select-disabled .ant-select-selector { background: #f2f3f5 !important; color: rgba(0, 0, 0, 0.25) !important; cursor: not-allowed !important; }',
	'.h2-station-page--create .h2-create-form .ant-select-selection-item { line-height: 30px !important; }',
	'.h2-station-page--create .h2-signed-toggle { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 14px 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 4px; }',
	'.h2-station-page--create .h2-signed-toggle-label { font-size: 13px; font-weight: 600; color: #334155; }',
	'.h2-station-page--create .h2-signed-panel { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.28s ease-out, opacity 0.22s ease-out; }',
	'.h2-station-page--create .h2-signed-panel--open { grid-template-rows: 1fr; opacity: 1; }',
	'.h2-station-page--create .h2-signed-panel-inner { overflow: hidden; min-height: 0; }',
	'.h2-station-page--create .h2-signed-panel-content { padding-top: 12px; }',
	'.h2-station-page--create .h2-create-upload.ant-upload-wrapper .ant-upload-drag { border-radius: 12px !important; border: 1px dashed #cbd5e1 !important; background: #fafbfc !important; padding: 16px 12px !important; transition: border-color 0.2s ease, background 0.2s ease; }',
	'.h2-station-page--create .h2-create-upload.ant-upload-wrapper .ant-upload-drag:hover { border-color: #10b981 !important; background: #f0fdf4 !important; }',
	'.h2-station-page--create .h2-create-upload-hint { font-size: 12px; color: #64748b; margin-top: 4px; }',
	'.h2-station-page .h2-supplier-mode-bar { margin-bottom: 0; }',
	'.h2-station-page .h2-supplier-mode-card { position: relative; display: flex; align-items: flex-start; gap: 12px; width: 100%; padding: 14px 16px; min-height: 72px; border-radius: 12px; border: 2px solid #e2e8f0; background: #fff; cursor: pointer; text-align: left; transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease; }',
	'.h2-station-page .h2-supplier-mode-card:hover { border-color: #86efac; background: #fafffe; }',
	'.h2-station-page .h2-supplier-mode-card:active { transform: scale(0.99); }',
	'.h2-station-page .h2-supplier-mode-card:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.h2-station-page .h2-supplier-mode-card--active { border-color: #10b981; background: linear-gradient(135deg, #ecfdf5 0%, #fff 70%); box-shadow: 0 4px 16px -4px rgba(16, 185, 129, 0.25); }',
	'.h2-station-page .h2-supplier-mode-card-icon { flex-shrink: 0; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: #f1f5f9; color: #64748b; transition: background 0.2s ease, color 0.2s ease; }',
	'.h2-station-page .h2-supplier-mode-card--active .h2-supplier-mode-card-icon { background: #d1fae5; color: #047857; }',
	'.h2-station-page .h2-supplier-mode-card-title { font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.3; }',
	'.h2-station-page .h2-supplier-mode-card-desc { font-size: 12px; color: #64748b; margin-top: 4px; line-height: 1.45; }',
	'.h2-station-page .h2-supplier-mode-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 14px; margin-bottom: 16px; padding: 10px 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; }',
	'.h2-station-page .h2-supplier-type-tag { margin: 0 !important; border-radius: 6px !important; font-weight: 600 !important; }',
	'.h2-station-page .h2-supplier-link-select { margin-bottom: 16px; padding: 14px 16px; border-radius: 12px; background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%); border: 1px solid #bfdbfe; }',
	'.h2-station-page .h2-create-footer { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(10px); border-top: 1px solid #e2e8f0; box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.06); }',
	'.h2-station-page .h2-create-footer-inner { width: 100%; max-width: none; margin: 0; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; box-sizing: border-box; }',
	'.h2-station-page .h2-create-footer-hint { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 10px; min-width: 0; }',
	'.h2-station-page .h2-create-footer-progress { flex: 1; min-width: 120px; max-width: 200px; }',
	'.h2-station-page .h2-create-footer-progress .ant-progress-text { font-size: 12px !important; font-weight: 700; color: #059669 !important; }',
	'.h2-station-page .h2-create-footer-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-left: auto; }',
	'.h2-station-page .h2-create-footer-actions .ant-btn { min-height: 44px; padding: 0 20px; border-radius: 10px; font-weight: 600; }',
	'.h2-station-page .h2-create-footer-actions .ant-btn-primary { min-width: 120px; box-shadow: 0 4px 14px -2px rgba(16, 185, 129, 0.45); }',
	'.h2-station-page .h2-create-footer-actions .ant-btn-primary:not(:disabled):hover { box-shadow: 0 6px 18px -2px rgba(16, 185, 129, 0.5); transform: translateY(-1px); }',
	'.h2-station-page .h2-field-readonly .ant-input, .h2-station-page .h2-field-readonly .ant-select-selector, .h2-station-page .h2-field-readonly .ant-input-textarea { background: #f1f5f9 !important; color: #64748b !important; cursor: default !important; border-style: dashed !important; }',
	'@media (prefers-reduced-motion: no-preference) { .h2-station-page--create .h2-create-card { animation: h2CreateCardIn 0.35s ease-out backwards; } .h2-station-page--create .h2-create-card + .h2-create-card { animation-delay: 0.06s; } }',
	'@keyframes h2CreateCardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }',
	'@media (prefers-reduced-motion: reduce) { .h2-station-page--create .h2-create-card { animation: none; } .h2-station-page--create .h2-signed-panel { transition: none; } }',
	'.h2-station-page--create .h2-create-form--list .ant-input:not(.ant-input-disabled):not(:disabled), .h2-station-page--create .h2-create-form--list .ant-input-affix-wrapper:not(.ant-input-affix-wrapper-disabled), .h2-station-page--create .h2-create-form--list .ant-select:not(.ant-select-disabled) .ant-select-selector, .h2-station-page--create .h2-create-form--list .ant-cascader:not(.ant-select-disabled) .ant-select-selector, .h2-station-page--create .h2-create-form--list .ant-picker:not(.ant-picker-disabled) { border-radius: 8px !important; border: 1px solid #e2e8f0 !important; min-height: 32px !important; height: 32px !important; font-size: 13px !important; background: #fff !important; color: #0f172a !important; box-shadow: none !important; }',
	'.h2-station-page--create .h2-create-form--list .ant-input-textarea:not(.ant-input-disabled) { border-radius: 8px !important; border: 1px solid #e2e8f0 !important; height: auto !important; min-height: auto !important; font-size: 13px !important; }',
	'.h2-station-page--create .h2-create-form--list .ant-input:not(:disabled):hover, .h2-station-page--create .h2-create-form--list .ant-input-affix-wrapper:not(.ant-input-affix-wrapper-disabled):hover, .h2-station-page--create .h2-create-form--list .ant-select:not(.ant-select-disabled):hover .ant-select-selector, .h2-station-page--create .h2-create-form--list .ant-cascader:not(.ant-select-disabled):hover .ant-select-selector, .h2-station-page--create .h2-create-form--list .ant-picker:not(.ant-picker-disabled):hover { border-color: #cbd5e1 !important; }',
	'.h2-station-page--create .h2-create-form--list .ant-input:focus, .h2-station-page--create .h2-create-form--list .ant-input-focused, .h2-station-page--create .h2-create-form--list .ant-input-affix-wrapper-focused, .h2-station-page--create .h2-create-form--list .ant-select-focused .ant-select-selector, .h2-station-page--create .h2-create-form--list .ant-cascader-focused .ant-select-selector, .h2-station-page--create .h2-create-form--list .ant-picker-focused { border-color: #10b981 !important; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important; }',
	'.h2-station-page--create .h2-create-form--list .ant-form-item-label > label { font-size: 13px; font-weight: 500; color: #475569; }',
	'.h2-station-page--create .h2-create-form--list .ant-radio-wrapper .ant-radio-checked .ant-radio-inner { border-color: #10b981; background-color: #10b981; }',
	'.h2-station-page--create .h2-create-pagehead { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; padding: 12px 20px; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03); }',
	'.h2-station-page--create .h2-create-card.ant-card { border-radius: 16px !important; }',
	'.h2-station-page .h2-card-title-bar--step::before { display: none !important; }',
	'.h2-station-page .h2-card-step-badge { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(145deg, #10b981 0%, #059669 100%); color: #fff; font-size: 14px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.32); }',
	'.h2-station-page .h2-card-title-text { font-size: 15px; font-weight: 700; color: #0f172a; }',
	'.h2-station-page--create .h2-create-form > .h2-create-card + .h2-create-card, .h2-station-page--edit .h2-create-form > .h2-create-card + .h2-create-card { margin-top: 16px; }',
	'.h2-station-page--create .h2-create-footer-inner, .h2-station-page--edit .h2-create-footer-inner { justify-content: flex-end; }'
]).join('\n');

var H2_CURRENT_OPERATOR = '系统管理员';
/** 原型登录角色：admin 平台管理员可改系统账号；station 加氢站账号不可改 */
var H2_CURRENT_USER_ROLE = 'admin';

function h2IsAdminUser() {
	if (typeof window !== 'undefined' && window.H2_STATION_PAGE_USER_ROLE) {
		return String(window.H2_STATION_PAGE_USER_ROLE).toLowerCase() === 'admin';
	}
	return H2_CURRENT_USER_ROLE === 'admin';
}

function h2OperateTimestamp() {
	return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function h2CreateBusinessStatusLog(beforeStatus, afterStatus, operator) {
	return {
		id: 'bsl-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
		operateTime: h2OperateTimestamp(),
		operator: operator || H2_CURRENT_OPERATOR,
		beforeStatus: beforeStatus || '—',
		afterStatus: afterStatus || '—'
	};
}

function h2CreateCostPriceLog(beforePrice, afterPrice, effectiveTime, operator, extra) {
	return Object.assign({
		id: 'cpl-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
		operator: operator || H2_CURRENT_OPERATOR,
		operateTime: h2OperateTimestamp(),
		beforeCostPrice: beforePrice,
		afterCostPrice: afterPrice,
		effectiveTime: effectiveTime
	}, extra || {});
}

function h2CreateEmptyTierRule() {
	return { id: 'tr-' + Date.now() + '-' + Math.floor(Math.random() * 1000), thresholdKg: '', price: '' };
}

function h2CreatePriceConfigId() {
	return 'pc-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function h2CollectCustomerOptions(refuelRecords) {
	var map = {};
	var i;
	for (i = 0; i < (refuelRecords || []).length; i++) {
		var r = refuelRecords[i];
		var name = (r.customerName || '').trim();
		if (!name) continue;
		var id = 'cust-' + name;
		map[id] = name;
	}
	return Object.keys(map).map(function (id) {
		return { value: id, label: map[id] };
	});
}

function h2MigrateLegacyPriceConfig(record) {
	return {
		id: 'pc-default',
		priceType: 'fixed',
		customerScope: 'all',
		customerId: null,
		customerName: null,
		fixedPrice: record && record.costUnitPrice != null ? record.costUnitPrice : null,
		tierRules: [],
		tierResetDay: 1,
		tierPeriodVolumeKg: 0,
		tierPeriodKey: '',
		logs: (record && record.costPriceLogs) ? record.costPriceLogs.slice() : []
	};
}

function h2GetStationPriceConfigs(record) {
	if (record && record.priceConfigs && record.priceConfigs.length) {
		return record.priceConfigs.map(function (cfg) {
			return Object.assign({}, cfg, {
				logs: (cfg.logs || []).slice(),
				tierRules: (cfg.tierRules || []).map(function (rule) { return Object.assign({}, rule); })
			});
		});
	}
	return [h2MigrateLegacyPriceConfig(record)];
}

function h2SortTierRules(rules) {
	return (rules || []).slice().sort(function (a, b) {
		return (parseFloat(a.thresholdKg) || 0) - (parseFloat(b.thresholdKg) || 0);
	});
}

function h2ResolveTierUnitPrice(volumeKg, tierRules) {
	var rules = h2SortTierRules(tierRules);
	if (!rules.length) return null;
	var vol = parseFloat(volumeKg);
	if (isNaN(vol)) vol = 0;
	var matched = rules[0];
	var i;
	for (i = 0; i < rules.length; i++) {
		var threshold = parseFloat(rules[i].thresholdKg);
		if (isNaN(threshold)) threshold = 0;
		if (vol >= threshold) matched = rules[i];
	}
	var price = parseFloat(matched.price);
	return isNaN(price) ? null : price;
}

function h2GetTierPeriodKey(resetDay, nowMs) {
	var dayjs = window.dayjs;
	if (!dayjs) return '';
	var d = dayjs(nowMs || Date.now());
	var day = parseInt(resetDay, 10) || 1;
	if (d.date() < day) d = d.subtract(1, 'month');
	return d.format('YYYY-MM');
}

function h2GetTierPeriodVolume(config, nowMs) {
	var now = nowMs || Date.now();
	var periodKey = h2GetTierPeriodKey(config.tierResetDay, now);
	if (config.tierPeriodKey && config.tierPeriodKey !== periodKey) return 0;
	return config.tierPeriodVolumeKg != null ? parseFloat(config.tierPeriodVolumeKg) || 0 : 0;
}

function h2ComputeTierStats(config, nowMs) {
	var volume = h2GetTierPeriodVolume(config, nowMs);
	var unitPrice = h2ResolveTierUnitPrice(volume, config.tierRules);
	var total = unitPrice != null ? volume * unitPrice : null;
	return { volumeKg: volume, unitPrice: unitPrice, totalCost: total };
}

function h2ResolveFixedPriceFromConfig(config, nowMs) {
	var logs = (config && config.logs) || [];
	var now = nowMs || Date.now();
	var best = null;
	var i;
	for (i = 0; i < logs.length; i++) {
		var log = logs[i];
		var t = h2ParseDateTimeMs(log.effectiveTime);
		if (isNaN(t) || t > now) continue;
		if (!best || t >= best.t) best = { t: t, price: log.afterCostPrice };
	}
	if (best && best.price != null) return best.price;
	if (config && config.fixedPrice != null) return config.fixedPrice;
	return null;
}

function h2ResolveConfigCurrentPrice(config, nowMs) {
	if (!config) return null;
	if (config.priceType === 'tiered') {
		var stats = h2ComputeTierStats(config, nowMs);
		return stats.unitPrice;
	}
	return h2ResolveFixedPriceFromConfig(config, nowMs);
}

function h2GetDefaultAllCustomerPriceConfig(record) {
	var configs = h2GetStationPriceConfigs(record);
	var i;
	for (i = 0; i < configs.length; i++) {
		if (configs[i].customerScope === 'all') return configs[i];
	}
	return configs[0] || null;
}

function h2GetPrimaryPriceConfig(record) {
	var configs = h2GetStationPriceConfigs(record);
	return configs.length ? configs[0] : null;
}

function h2HasMultiCustomerPriceSystems(record) {
	return h2GetStationPriceConfigs(record).length > 1;
}

function h2GetCustomerPriceConfig(record, customerId) {
	var configs = h2GetStationPriceConfigs(record);
	var i;
	for (i = 0; i < configs.length; i++) {
		if (configs[i].customerScope === 'customer' && configs[i].customerId === customerId) return configs[i];
	}
	return h2GetDefaultAllCustomerPriceConfig(record);
}

function h2GetAssignedCustomerIds(priceConfigs, exceptConfigId) {
	var ids = {};
	var i;
	for (i = 0; i < (priceConfigs || []).length; i++) {
		var cfg = priceConfigs[i];
		if (exceptConfigId && cfg.id === exceptConfigId) continue;
		if (cfg.customerScope === 'customer' && cfg.customerId) ids[cfg.customerId] = cfg.customerName || cfg.customerId;
	}
	return ids;
}

function h2FindPriceConfigByCustomerId(priceConfigs, customerId, exceptConfigId) {
	var i;
	for (i = 0; i < (priceConfigs || []).length; i++) {
		var cfg = priceConfigs[i];
		if (exceptConfigId && cfg.id === exceptConfigId) continue;
		if (cfg.customerScope === 'customer' && cfg.customerId === customerId) return cfg;
	}
	return null;
}

function h2GetConfigEffectiveTimeLabel(config) {
	var logs = (config && config.logs) || [];
	return logs.length && logs[0].effectiveTime ? logs[0].effectiveTime : '—';
}

function h2FormatConfigEffectiveDateTime(config) {
	var raw = h2GetConfigEffectiveTimeLabel(config);
	if (!raw || raw === '—') return '—';
	var dayjs = window.dayjs;
	if (dayjs) {
		var d = dayjs(raw.indexOf('T') >= 0 ? raw : raw.replace(' ', 'T'));
		if (d.isValid && d.isValid()) return d.format('YYYY-MM-DD HH:mm');
	}
	var s = String(raw).trim();
	if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(s)) return s.slice(0, 16);
	return s;
}

function h2GetTierResetTimeLabel(config) {
	var resetDay = parseInt(config && config.tierResetDay, 10) || 1;
	return '每月' + resetDay + '日';
}

function h2GetTierGapToNextThreshold(config, nowMs) {
	var rules = h2SortTierRules(config && config.tierRules);
	if (!rules.length) return null;
	var volume = h2GetTierPeriodVolume(config, nowMs);
	var i;
	for (i = 0; i < rules.length; i++) {
		var threshold = parseFloat(rules[i].thresholdKg);
		if (isNaN(threshold)) threshold = 0;
		if (threshold > volume) return threshold - volume;
	}
	return null;
}

function h2FormatPriceConfigScopeLabel(config) {
	if (!config || config.customerScope !== 'customer') return '全部客户';
	return config.customerName || config.customerId || '指定客户';
}

function h2FormatPriceTypeLabel(priceType) {
	return priceType === 'tiered' ? '阶梯价格' : '固定价格';
}

function h2FormatTierRulesSummary(tierRules) {
	var rules = h2SortTierRules(tierRules);
	if (!rules.length) return '—';
	return rules.map(function (rule) {
		return h2FormatTierRuleLine(rule);
	}).join('；');
}

function h2FormatTierRuleLine(rule) {
	return '≥' + h2FormatKgNum(rule.thresholdKg) + 'kg → ' + h2FormatYuanNum(rule.price) + '元/kg';
}

function h2GetTierRuleDisplayLines(row) {
	if (row && row.tierRules && row.tierRules.length) {
		return h2SortTierRules(row.tierRules).map(function (rule) {
			return h2FormatTierRuleLine(rule);
		});
	}
	var summary = row && row.tierRulesSummary;
	if (!summary || summary === '—') return [];
	return String(summary).split('；').map(function (line) { return line.trim(); }).filter(Boolean);
}

function h2SyncRecordPriceFields(record) {
	var configs = h2GetStationPriceConfigs(record);
	var primaryCfg = h2GetPrimaryPriceConfig(record);
	var resolved = primaryCfg ? h2ResolveConfigCurrentPrice(primaryCfg) : null;
	var legacyLogs = primaryCfg && primaryCfg.logs && primaryCfg.logs.length
		? primaryCfg.logs.slice()
		: (record.costPriceLogs || []);
	return Object.assign({}, record, {
		priceConfigs: configs,
		costPriceLogs: legacyLogs,
		costUnitPrice: resolved != null ? resolved : record.costUnitPrice
	});
}

function h2ApplyCustomerExclusion(priceConfigs, savedConfig) {
	var savedId = savedConfig.id;
	var savedCustomerId = savedConfig.customerScope === 'customer' ? savedConfig.customerId : null;
	return (priceConfigs || []).filter(function (cfg) {
		if (cfg.id === savedId) return false;
		if (savedCustomerId && cfg.customerScope === 'customer' && cfg.customerId === savedCustomerId) return false;
		return true;
	});
}

function h2EmptyPriceModalForm() {
	var dayjs = window.dayjs;
	return {
		editingConfigId: null,
		priceFormVisible: false,
		priceType: 'fixed',
		customerScope: 'all',
		customerId: null,
		customerName: null,
		selectedCustomerIds: [],
		tierCustomerPickerOpen: false,
		costUnitPrice: '',
		effectiveTime: window.dayjs ? window.dayjs().format('YYYY-MM-DD HH:mm') : h2OperateTimestamp(),
		tierRules: [h2CreateEmptyTierRule()],
		tierResetDay: 1
	};
}

function h2PriceModalFormFromConfig(config) {
	if (!config) return h2EmptyPriceModalForm();
	var selectedCustomerIds = config.customerScope === 'customer' && config.customerId ? [config.customerId] : [];
	return {
		editingConfigId: config.id,
		priceType: config.priceType || 'fixed',
		customerScope: config.customerScope || 'all',
		customerId: config.customerId || null,
		customerName: config.customerName || null,
		selectedCustomerIds: selectedCustomerIds,
		tierCustomerPickerOpen: false,
		costUnitPrice: config.priceType !== 'tiered'
			? String(h2ResolveFixedPriceFromConfig(config) != null ? h2ResolveFixedPriceFromConfig(config) : (config.fixedPrice != null ? config.fixedPrice : ''))
			: '',
		effectiveTime: window.dayjs ? window.dayjs().format('YYYY-MM-DD HH:mm') : h2OperateTimestamp(),
		tierRules: (config.tierRules && config.tierRules.length)
			? config.tierRules.map(function (rule) {
				return {
					id: rule.id || h2CreateEmptyTierRule().id,
					thresholdKg: rule.thresholdKg != null ? String(rule.thresholdKg) : '',
					price: rule.price != null ? String(rule.price) : ''
				};
			})
			: [h2CreateEmptyTierRule()],
		tierResetDay: config.tierResetDay != null ? config.tierResetDay : 1
	};
}

function h2ParseDateTimeMs(val) {
	if (!val) return NaN;
	var s = String(val).trim();
	if (!s) return NaN;
	return new Date(s.indexOf('T') >= 0 ? s : s.replace(' ', 'T')).getTime();
}

function h2ToDateTimeDayjs(text) {
	var dayjs = window.dayjs;
	if (!dayjs || !text) return null;
	var s = String(text).trim();
	if (!s) return null;
	var d = dayjs(s.indexOf('T') >= 0 ? s : s.replace(' ', 'T'));
	if (!(d.isValid && d.isValid())) d = dayjs(s);
	return (d.isValid && d.isValid()) ? d : null;
}

function h2ToDateDayjs(text) {
	var dayjs = window.dayjs;
	if (!dayjs || !text) return null;
	var s = String(text).trim();
	if (!s) return null;
	var d = dayjs(s);
	return (d.isValid && d.isValid()) ? d : null;
}

function h2SanitizeReceiptAmountInput(text) {
	var s = String(text || '').replace(/[^\d.]/g, '');
	var parts = s.split('.');
	if (parts.length > 2) s = parts[0] + '.' + parts.slice(1).join('');
	var dot = s.indexOf('.');
	if (dot >= 0 && s.length - dot - 1 > 2) s = s.slice(0, dot + 3);
	return s;
}

function h2FormatReceiptAmountInput(text) {
	var s = String(text || '').trim();
	if (!s) return '';
	var n = parseFloat(s);
	if (isNaN(n) || n < 0) return '';
	return n.toFixed(2);
}

function h2ResolveCurrentCostPrice(record) {
	var primaryCfg = h2GetPrimaryPriceConfig(record);
	if (primaryCfg) {
		var resolved = h2ResolveConfigCurrentPrice(primaryCfg);
		if (resolved != null) return resolved;
	}
	var logs = (record && record.costPriceLogs) || [];
	var now = Date.now();
	var best = null;
	var i;
	for (i = 0; i < logs.length; i++) {
		var log = logs[i];
		var t = h2ParseDateTimeMs(log.effectiveTime);
		if (isNaN(t) || t > now) continue;
		if (!best || t >= best.t) {
			best = { t: t, price: log.afterCostPrice };
		}
	}
	if (best && best.price != null) return best.price;
	return record && record.costUnitPrice != null ? record.costUnitPrice : null;
}

function h2ApplyDueCostPriceToRecord(record) {
	return h2SyncRecordPriceFields(record);
}

function h2ApplyDueCostPricesToList(records) {
	var changed = false;
	var next = records.map(function (r) {
		var updated = h2ApplyDueCostPriceToRecord(r);
		if (updated !== r) changed = true;
		return updated;
	});
	return { records: next, changed: changed };
}

function h2FormatCostPriceDisplay(v) {
	if (v == null || v === '') return '—';
	return h2FormatYuanNum(v) + ' 元/kg';
}

function h2CountPendingCostPriceLogs(logs) {
	var now = Date.now();
	var count = 0;
	var i;
	for (i = 0; i < (logs || []).length; i++) {
		var t = h2ParseDateTimeMs(logs[i].effectiveTime);
		if (!isNaN(t) && t > now) count += 1;
	}
	return count;
}

var H2_IMPORT_TEMPLATE_HEADERS = [
	'加氢站名称', '省', '市', '详细地址', '是否签约', '签约开始时间', '签约结束时间', '营业状态', '营业时间', '联系人', '联系电话'
];

var H2_IMPORT_TEMPLATE_SAMPLE = [
	['苏州新区加氢站（导入示例）', '江苏省', '苏州市', '工业园区星湖街100号', '是', '2025-01-01', '2027-12-31', '营业中', '08:00-20:00', '周八', '13900001111']
];

var H2_IMPORT_HEADER_MAP = {
	'加氢站名称': 'name',
	'站点名称': 'name',
	'名称': 'name',
	'省': 'province',
	'省份': 'province',
	'市': 'city',
	'城市': 'city',
	'详细地址': 'detail',
	'地址详情': 'detail',
	'是否签约': 'isSigned',
	'签约状态': 'isSigned',
	'签约开始时间': 'contractStart',
	'签约开始': 'contractStart',
	'签约结束时间': 'contractEnd',
	'签约结束': 'contractEnd',
	'营业状态': 'businessStatus',
	'营业时间': 'businessHours',
	'联系人': 'contact',
	'联系电话': 'phone',
	'电话': 'phone'
};

function h2CsvEscape(v) {
	var s = String(v == null ? '' : v);
	if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
	return s;
}

function h2DownloadCsv(filename, headers, rows) {
	var lines = [headers.map(h2CsvEscape).join(',')].concat(
		(rows || []).map(function (r) { return r.map(h2CsvEscape).join(','); })
	);
	var blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
	var a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	a.click();
	URL.revokeObjectURL(a.href);
}

function h2ParseCsvLine(line) {
	var out = [];
	var cur = '';
	var inQuote = false;
	var i;
	for (i = 0; i < line.length; i++) {
		var ch = line.charAt(i);
		if (inQuote) {
			if (ch === '"') {
				if (line.charAt(i + 1) === '"') { cur += '"'; i++; }
				else inQuote = false;
			} else cur += ch;
		} else if (ch === '"') inQuote = true;
		else if (ch === ',') { out.push(cur.trim()); cur = ''; }
		else cur += ch;
	}
	out.push(cur.trim());
	return out;
}

function h2ParseSignedLabel(val) {
	var s = String(val || '').trim();
	if (!s) return false;
	var lower = s.toLowerCase();
	if (s === '是' || s === '已签约' || lower === 'yes' || lower === 'y' || lower === 'true' || lower === '1') return true;
	if (s === '否' || s === '未签约' || lower === 'no' || lower === 'n' || lower === 'false' || lower === '0') return false;
	return false;
}

function h2NormalizeBusinessStatus(val) {
	var s = String(val || '').trim();
	var i;
	for (i = 0; i < H2_BUSINESS_STATUS_OPTIONS.length; i++) {
		if (H2_BUSINESS_STATUS_OPTIONS[i].value === s) return s;
	}
	if (s.indexOf('暂停') >= 0) return '暂停营业';
	if (s.indexOf('停止') >= 0 || s.indexOf('停业') >= 0) return '停止营业';
	if (s.indexOf('营业') >= 0) return '营业中';
	return '';
}

function h2ParseImportCsv(text) {
	var raw = String(text || '').replace(/^\uFEFF/, '');
	var lines = raw.split(/\r?\n/).filter(function (ln) { return ln.trim().length > 0; });
	if (lines.length < 2) return { rows: [], headerError: '文件至少需要表头行与一行数据' };
	var headers = h2ParseCsvLine(lines[0]).map(function (h) { return String(h || '').trim().replace(/^\uFEFF/, ''); });
	var fieldIdx = {};
	var hi;
	for (hi = 0; hi < headers.length; hi++) {
		var key = H2_IMPORT_HEADER_MAP[headers[hi]];
		if (key && fieldIdx[key] == null) fieldIdx[key] = hi;
	}
	if (fieldIdx.name == null) return { rows: [], headerError: '缺少必填列「加氢站名称」' };
	var rows = [];
	var li;
	for (li = 1; li < lines.length; li++) {
		var cells = h2ParseCsvLine(lines[li]);
		if (!cells.some(function (c) { return String(c || '').trim(); })) continue;
		var get = function (field) {
			var idx = fieldIdx[field];
			return idx == null || idx < 0 ? '' : String(cells[idx] == null ? '' : cells[idx]).trim();
		};
		rows.push({
			lineNo: li + 1,
			name: get('name'),
			province: get('province'),
			city: get('city'),
			detail: get('detail'),
			isSigned: h2ParseSignedLabel(get('isSigned')),
			contractStart: get('contractStart'),
			contractEnd: get('contractEnd'),
			businessStatus: h2NormalizeBusinessStatus(get('businessStatus')),
			businessHours: get('businessHours'),
			contact: get('contact'),
			phone: get('phone')
		});
	}
	return { rows: rows, headerError: null };
}

function h2ValidateImportRow(row, existingNames) {
	var errors = [];
	if (!(row.name || '').trim()) errors.push('加氢站名称不能为空');
	else if (existingNames[(row.name || '').trim()]) errors.push('站点名称「' + row.name + '」已存在');
	if (!(row.province || '').trim()) errors.push('省不能为空');
	if (!(row.city || '').trim()) errors.push('市不能为空');
	if (!(row.detail || '').trim()) errors.push('详细地址不能为空');
	if (!(row.contact || '').trim()) errors.push('联系人不能为空');
	if (!(row.phone || '').trim()) errors.push('联系电话不能为空');
	if (!(row.businessStatus || '').trim()) errors.push('营业状态无效，请填写：营业中 / 暂停营业 / 停止营业');
	if (row.isSigned) {
		if (!row.contractStart) errors.push('已签约站点需填写签约开始时间');
		if (!row.contractEnd) errors.push('已签约站点需填写签约结束时间');
	}
	return errors;
}

function h2ImportRowToRecord(row, id) {
	var region = [row.province, row.city];
	var form = {
		name: row.name,
		address: { region: region, detail: row.detail },
		isSigned: row.isSigned,
		contractStart: row.isSigned ? (row.contractStart || '') : '',
		contractEnd: row.isSigned ? (row.contractEnd || '') : '',
		contractFiles: [],
		businessStatus: row.businessStatus || '营业中',
		businessHours: row.businessHours || '',
		contact: row.contact,
		phone: row.phone
	};
	var record = h2FormToRecord(form, id);
	record.businessStatusLogs = [];
	return record;
}

function h2SvgIcon(paths, size) {
	var s = size || 18;
	return React.createElement('svg', {
		width: s,
		height: s,
		viewBox: '0 0 24 24',
		fill: 'none',
		stroke: 'currentColor',
		strokeWidth: 2,
		strokeLinecap: 'round',
		strokeLinejoin: 'round',
		'aria-hidden': true
	}, paths.map(function (p, i) {
		if (p.tag === 'circle') return React.createElement('circle', { key: i, cx: p.cx, cy: p.cy, r: p.r });
		if (p.tag === 'line') return React.createElement('line', { key: i, x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2 });
		if (p.tag === 'rect') return React.createElement('rect', { key: i, x: p.x, y: p.y, width: p.width, height: p.height, rx: p.rx });
		return React.createElement('path', { key: i, d: p.d });
	}));
}

var H2_ICONS = {
	station: h2SvgIcon([{ d: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4' }]),
	high: h2SvgIcon([{ d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' }], 16),
	low: h2SvgIcon([{ d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }], 16),
	none: h2SvgIcon([{ d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }, { tag: 'line', x1: 12, y1: 9, x2: 12, y2: 13 }, { tag: 'line', x1: 12, y1: 17, x2: 12.01, y2: 17 }], 16),
	doc: h2SvgIcon([{ d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }, { d: 'M14 2v6h6' }, { tag: 'line', x1: 16, y1: 13, x2: 8, y2: 13 }, { tag: 'line', x1: 16, y1: 17, x2: 8, y2: 17 }], 14),
	upload: h2SvgIcon([{ d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }, { d: 'M17 8l-5-5-5 5' }, { tag: 'line', x1: 12, y1: 3, x2: 12, y2: 15 }], 14),
	download: h2SvgIcon([{ d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }, { d: 'M7 10l5 5 5-5' }, { tag: 'line', x1: 12, y1: 15, x2: 12, y2: 3 }], 14),
	empty: h2SvgIcon([{ tag: 'circle', cx: 12, cy: 12, r: 10 }, { tag: 'line', x1: 8, y1: 12, x2: 16, y2: 12 }], 40),
	back: h2SvgIcon([{ tag: 'line', x1: 19, y1: 12, x2: 5, y2: 12 }, { d: 'M12 19l-7-7 7-7' }], 16),
	mapPin: h2SvgIcon([{ tag: 'path', d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }, { tag: 'circle', cx: 12, cy: 10, r: 3 }], 16),
	user: h2SvgIcon([{ tag: 'path', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }, { tag: 'circle', cx: 12, cy: 7, r: 4 }], 16),
	building: h2SvgIcon([{ d: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4' }], 18),
	truck: h2SvgIcon([{ d: 'M1 3h15v13H1zM16 8h4l3 3v5h-7V8z' }, { tag: 'circle', cx: 5.5, cy: 18.5, r: 2.5 }, { tag: 'circle', cx: 18.5, cy: 18.5, r: 2.5 }], 16),
	link: h2SvgIcon([{ tag: 'path', d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }, { tag: 'path', d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' }], 16),
	plus: h2SvgIcon([{ tag: 'line', x1: 12, y1: 5, x2: 12, y2: 19 }, { tag: 'line', x1: 5, y1: 12, x2: 19, y2: 12 }], 16),
	file: h2SvgIcon([{ d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }, { d: 'M14 2v6h6' }], 16)
};

function h2MoreIcon() {
	return React.createElement('svg', {
		viewBox: '0 0 16 16',
		width: 16,
		height: 16,
		fill: 'currentColor',
		'aria-hidden': true
	},
		React.createElement('circle', { cx: 8, cy: 3, r: 1.5 }),
		React.createElement('circle', { cx: 8, cy: 8, r: 1.5 }),
		React.createElement('circle', { cx: 8, cy: 13, r: 1.5 })
	);
}

function h2DeriveFrequencyByRefuelCount(refuelCount) {
	var n = typeof refuelCount === 'number' ? refuelCount : parseInt(refuelCount, 10);
	if (!n || n <= 0) return 'none';
	if (n >= 3) return 'high';
	return 'low';
}

function h2ResolveBalanceAlertThreshold(record) {
	if (!record || record.balanceAlertThreshold == null || record.balanceAlertThreshold === '') return null;
	var n = parseFloat(record.balanceAlertThreshold);
	return isNaN(n) || n <= 0 ? null : n;
}

function h2IsArrearsStation(record) {
	return h2NumOrZero(record && record.prepaidBalance) < 0;
}

function h2IsBalanceAlertStation(record) {
	if (h2IsArrearsStation(record)) return false;
	var threshold = h2ResolveBalanceAlertThreshold(record);
	if (threshold == null) return false;
	return h2NumOrZero(record.prepaidBalance) < threshold;
}

function h2CreateRechargeLineId() {
	return 'rcl-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

function h2BuildRechargeTransferPurpose(date) {
	var d = date || new Date();
	var y = d.getFullYear();
	var m = String(d.getMonth() + 1).padStart(2, '0');
	var day = String(d.getDate()).padStart(2, '0');
	return '羚牛预付氢费款' + y + '-' + m + '-' + day;
}

function h2CreateEmptyRechargeLine() {
	return {
		id: h2CreateRechargeLineId(),
		stationId: undefined,
		stationName: '',
		currentBalance: '',
		payAmount: '',
		companyName: '',
		bankAccount: '',
		bankName: '',
		transferPurpose: h2BuildRechargeTransferPurpose()
	};
}

function h2BuildRechargeLineFromStation(record, payAmount) {
	var supplier = h2ResolveStationSupplier(record);
	return {
		id: h2CreateRechargeLineId(),
		stationId: record.id,
		stationName: record.name || '',
		currentBalance: h2FormatYuanNum(record.prepaidBalance),
		payAmount: payAmount != null && payAmount !== '' ? payAmount : '',
		companyName: supplier ? (supplier.name || '') : '',
		bankAccount: supplier ? (supplier.bankAccount || '') : '',
		bankName: supplier ? (supplier.bankName || '') : '',
		transferPurpose: h2BuildRechargeTransferPurpose()
	};
}

function h2EnrichStationListRows(records) {
	return (records || []).map(function (r) {
		var stats = h2CalcRefuelStats(r.name);
		return Object.assign({}, r, {
			refuelCount: stats.count,
			refuelTotalKg: stats.totalKg,
			refuelFreqKey: h2DeriveFrequencyByRefuelCount(stats.count)
		});
	});
}

function h2RenderRechargeAutoField(value, hasStation, placeholder) {
	if (!hasStation) {
		return React.createElement('span', { className: 'h2-recharge-readonly h2-recharge-readonly--muted' }, '—');
	}
	var text = value != null && value !== '' ? String(value) : '';
	if (!text) {
		return React.createElement('span', { className: 'h2-recharge-readonly h2-recharge-readonly--muted' }, placeholder || '—');
	}
	var InputComp = window.antd && window.antd.Input;
	if (!InputComp) {
		return React.createElement('span', { className: 'h2-recharge-readonly' }, text);
	}
	return React.createElement(InputComp, {
		className: 'h2-recharge-readonly-input',
		value: text,
		disabled: true,
		style: { width: '100%', borderRadius: 8 }
	});
}

function h2FormatRegion(region) {
	if (!region || !region.length) return '—';
	return region.join('-');
}

function h2FormatStationAddressLine(record) {
	var regionText = h2FormatRegion(record && record.region);
	var detail = String((record && record.addressDetail) || '').trim();
	if (regionText === '—' && !detail) return '—';
	if (regionText === '—') return detail;
	if (!detail) return regionText;
	return regionText + ' ' + detail;
}

function h2MatchRegionFilter(recordRegion, filterRegion) {
	if (!filterRegion || !filterRegion.length) return true;
	var rr = recordRegion || [];
	if (filterRegion[0] && rr[0] !== filterRegion[0]) return false;
	if (filterRegion[1] && rr[1] !== filterRegion[1]) return false;
	return true;
}

function h2EmptyListFilters() {
	return { name: '', signed: undefined, region: undefined, businessStatus: undefined };
}

/** 签约站点是否已上传合同附件 */
function h2HasUploadedContract(record) {
	var files = record && record.contractFiles;
	if (!files || !files.length) return false;
	var i;
	for (i = 0; i < files.length; i++) {
		var f = files[i];
		if (!f) continue;
		if ((f.name || '').trim()) return true;
		if (f.url || (f.response && (f.response.url || f.response.fileUrl))) return true;
	}
	return false;
}

/** 列表签约站点标签文案与样式 */
function h2RenderStationSignedTag(record) {
	var Tag = window.antd && window.antd.Tag;
	if (!Tag || !record || !record.isSigned) return null;
	var uploaded = h2HasUploadedContract(record);
	return React.createElement(Tag, {
		color: uploaded ? 'success' : 'warning',
		className: 'lc-station-signed-tag'
	}, uploaded ? '签约站点' : '签约站点-未上传合同');
}

/** 距签约结束日天数：正=剩余，负=已过期 */
function h2DaysUntilContractEnd(dateStr) {
	if (!dateStr) return null;
	var parts = String(dateStr).trim().split('-');
	if (parts.length < 3) return null;
	var y = parseInt(parts[0], 10);
	var m = parseInt(parts[1], 10) - 1;
	var d = parseInt(parts[2], 10);
	if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
	var end = new Date(y, m, d, 23, 59, 59, 999);
	var today = new Date();
	today.setHours(0, 0, 0, 0);
	return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function h2RenderContractRemainTag(contractEnd) {
	var days = h2DaysUntilContractEnd(contractEnd);
	if (days == null) return null;
	var Tag = window.antd && window.antd.Tag;
	if (!Tag) return null;
	var tagProps = { style: { marginTop: 4, borderRadius: 6, fontWeight: 600, fontSize: 11 } };
	if (days < 0) {
		return React.createElement(Tag, Object.assign({}, tagProps, {
			color: 'error',
			'aria-label': '已过期 ' + Math.abs(days) + ' 天'
		}), '已过期 ' + Math.abs(days) + ' 天');
	}
	if (days <= 30) {
		return React.createElement(Tag, Object.assign({}, tagProps, {
			color: 'warning',
			'aria-label': '剩余 ' + days + ' 天'
		}), '剩余 ' + days + ' 天');
	}
	return React.createElement(Tag, Object.assign({}, tagProps, {
		color: 'success',
		'aria-label': '剩余 ' + days + ' 天'
	}), '剩余 ' + days + ' 天');
}

function h2BuildFullAddress(region, detail) {
	var base = h2FormatRegion(region);
	if (!detail) return base === '—' ? '' : base;
	return base === '—' ? detail : base + detail;
}

function h2EmptyAddressValue() {
	return { region: [], detail: '' };
}

/** 从完整地址文本解析省/市与详细地址（基于站点省市区选项） */
function h2ParseAddressText(rawText) {
	var text = String(rawText || '').trim();
	if (!text) return { region: [], detail: '', matched: false };

	var compact = text.replace(/\s+/g, '');
	var provinces = H2_REGION_CASCADER_OPTIONS.slice().sort(function (a, b) {
		return String(b.value || b.label || '').length - String(a.value || a.label || '').length;
	});

	var matchedProvince = null;
	var provinceStart = -1;
	var matchedProvinceLen = 0;
	for (var i = 0; i < provinces.length; i++) {
		var pName = provinces[i].value || provinces[i].label;
		var aliases = [pName];
		if (pName.slice(-1) === '省') aliases.push(pName.slice(0, -1));
		if (pName.slice(-1) === '市') aliases.push(pName.replace(/市$/, ''));
		var ai;
		for (ai = 0; ai < aliases.length; ai++) {
			var alias = aliases[ai];
			var idx = compact.indexOf(alias);
			if (idx !== -1 && (provinceStart === -1 || idx < provinceStart || (idx === provinceStart && alias.length > matchedProvinceLen))) {
				provinceStart = idx;
				matchedProvince = provinces[i];
				matchedProvinceLen = alias.length;
			}
		}
	}

	if (!matchedProvince) {
		return { region: [], detail: text, matched: false };
	}

	var provinceName = matchedProvince.value || matchedProvince.label;
	var rest = compact.slice(provinceStart + matchedProvinceLen).replace(/^[\s\-—,，、·]+/, '');
	var cities = matchedProvince.children || [];
	var cityMatch = h2FindCityInAddressRest(rest, cities);

	if (!cityMatch && cities.length === 1) {
		return {
			region: [provinceName, cities[0].value || cities[0].label],
			detail: rest.replace(/^[\s\-—,，、·]+/, ''),
			matched: true
		};
	}

	if (!cityMatch) {
		return { region: [provinceName], detail: rest || text, matched: true, partial: true };
	}

	var cityName = cityMatch.city.value || cityMatch.city.label;
	var detail = rest.slice(cityMatch.end);
	detail = detail.replace(/^[\s\-—,，、·省市区县]+/, '');
	if (!detail && cityMatch.prefix) detail = cityMatch.prefix.replace(/^[\s\-—,，、·省市区县]+/, '');

	return { region: [provinceName, cityName], detail: detail, matched: true };
}

function h2StripRegionPrefixFromDetail(region, detail) {
	var text = String(detail || '').trim();
	if (!text || !region || region.length < 2) return text;
	var cityName = region[1] || '';
	var cityPlain = cityName.replace(/市$/, '');
	if (cityName && text.indexOf(cityName) === 0) text = text.slice(cityName.length);
	else if (cityPlain && text.indexOf(cityPlain) === 0) text = text.slice(cityPlain.length);
	return text.replace(/^[\s\-—,，、·省市区县]+/, '');
}

function h2FindCityInAddressRest(rest, cities) {
	if (!rest || !cities || !cities.length) return null;
	var sorted = cities.slice().sort(function (a, b) {
		return String(b.value || b.label || '').length - String(a.value || a.label || '').length;
	});
	var i;
	for (i = 0; i < sorted.length; i++) {
		var cn = sorted[i].value || sorted[i].label;
		if (rest.indexOf(cn) === 0) return { city: sorted[i], prefix: '', end: cn.length };
	}
	for (i = 0; i < sorted.length; i++) {
		var cn2 = sorted[i].value || sorted[i].label;
		var idx = rest.indexOf(cn2);
		if (idx > 0 && idx <= 8) return { city: sorted[i], prefix: rest.slice(0, idx), end: idx + cn2.length };
	}
	return null;
}

/** 地址解析：失焦后自动识别并回填省/市与详细地址 */
function AddressPasteInput(props) {
	var antd = window.antd;
	var Input = antd.Input;
	var message = antd.message;
	var _paste = React.useState('');
	var pasteText = _paste[0];
	var setPasteText = _paste[1];
	var disabled = props.disabled;
	var inputClassName = props.inputClassName || '';

	var runParse = function (raw) {
		raw = (raw || '').trim();
		if (!raw) return;
		var result = h2ParseAddressText(raw);
		if (!result.matched) {
			message.warning('未能识别省/市，请将内容填入详细地址');
			if (props.onParsed) props.onParsed({ region: [], detail: raw });
			return;
		}
		if (result.partial || !result.region || result.region.length < 2) {
			message.warning('已识别省份，请补全城市信息');
		}
		var region = result.region || [];
		var detail = h2StripRegionPrefixFromDetail(region, result.detail || '');
		if (props.onParsed) props.onParsed({ region: region, detail: detail });
	};

	return React.createElement('div', { className: 'h2-address-paste' },
		React.createElement(Input.TextArea, {
			className: inputClassName,
			value: pasteText,
			disabled: disabled,
			placeholder: props.placeholder || '填写完整地址自动解析省市和详细地址',
			autoSize: { minRows: 2, maxRows: 4 },
			onChange: function (e) { setPasteText(e.target.value); },
			onBlur: function () {
				if (disabled) return;
				runParse(pasteText);
			}
		})
	);
}

var H2_DEFAULT_MAP_CENTER = { lat: 30.274084, lng: 120.15507 };
var H2_MAP_LEAFLET_READY = null;

var H2_CITY_GEO_COORDS = {
	'浙江省|嘉兴市': { lat: 30.746129, lng: 120.755486 },
	'浙江省|杭州市': { lat: 30.274084, lng: 120.15507 },
	'浙江省|宁波市': { lat: 29.868336, lng: 121.54399 },
	'上海市|上海市': { lat: 31.230416, lng: 121.473701 },
	'江苏省|南京市': { lat: 32.060255, lng: 118.796877 },
	'江苏省|苏州市': { lat: 31.298886, lng: 120.585316 },
	'广东省|广州市': { lat: 23.12911, lng: 113.264385 },
	'广东省|深圳市': { lat: 22.543099, lng: 114.057868 }
};

function h2EnsureLeafletLoaded() {
	if (H2_MAP_LEAFLET_READY) return H2_MAP_LEAFLET_READY;
	H2_MAP_LEAFLET_READY = new Promise(function (resolve, reject) {
		if (window.L && window.L.map) {
			resolve(window.L);
			return;
		}
		if (!document.querySelector('link[data-h2-leaflet-css]')) {
			var link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
			link.setAttribute('data-h2-leaflet-css', '1');
			document.head.appendChild(link);
		}
		var existing = document.querySelector('script[data-h2-leaflet-js]');
		if (existing) {
			existing.addEventListener('load', function () { resolve(window.L); });
			existing.addEventListener('error', reject);
			return;
		}
		var script = document.createElement('script');
		script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
		script.setAttribute('data-h2-leaflet-js', '1');
		script.onload = function () { resolve(window.L); };
		script.onerror = reject;
		document.head.appendChild(script);
	});
	return H2_MAP_LEAFLET_READY;
}

function h2FixLeafletDefaultIcon(L) {
	if (!L || !L.Icon || !L.Icon.Default) return;
	delete L.Icon.Default.prototype._getIconUrl;
	L.Icon.Default.mergeOptions({
		iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
		iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
		shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
	});
}

function h2ResolveGeoFromRegion(region) {
	if (!region || region.length < 2) return null;
	return H2_CITY_GEO_COORDS[region[0] + '|' + region[1]] || null;
}

function h2GeocodeAddressPromise(address) {
	var text = String(address || '').trim();
	if (!text) return Promise.resolve(null);
	var parsed = h2ParseAddressText(text);
	if (parsed.region && parsed.region.length >= 2) {
		var city = h2ResolveGeoFromRegion(parsed.region);
		if (city) return Promise.resolve({ lat: city.lat, lng: city.lng });
	}
	if (!window.fetch) return Promise.resolve(null);
	return fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(text), {
		headers: { 'Accept-Language': 'zh-CN' }
	})
		.then(function (res) { return res.json(); })
		.then(function (data) {
			if (!data || !data.length) return null;
			var lat = parseFloat(data[0].lat);
			var lng = parseFloat(data[0].lon);
			if (isNaN(lat) || isNaN(lng)) return null;
			return { lat: lat, lng: lng };
		})
		.catch(function () { return null; });
}

function h2FormatCoordNum(value) {
	if (value == null || value === '') return '—';
	var n = parseFloat(value);
	if (isNaN(n)) return '—';
	return n.toFixed(6);
}

function h2NormalizeCoord(value) {
	if (value == null || value === '') return null;
	var n = parseFloat(value);
	return isNaN(n) ? null : n;
}

/** 地图定位：输入地址自动定位，拖动标记获取经纬度 */
function StationMapPicker(props) {
	var antd = window.antd;
	var Input = antd.Input;
	var Button = antd.Button;
	var message = antd.message;
	var mapElRef = React.useRef(null);
	var mapRef = React.useRef(null);
	var markerRef = React.useRef(null);
	var geocodeReqRef = React.useRef(0);
	var lastExternalAddressRef = React.useRef('');
	var locateByAddressRef = React.useRef(null);

	var _localAddr = React.useState(props.address || '');
	var localAddress = _localAddr[0];
	var setLocalAddress = _localAddr[1];

	var _loading = React.useState(false);
	var loading = _loading[0];
	var setLoading = _loading[1];

	var _mapReady = React.useState(false);
	var mapReady = _mapReady[0];
	var setMapReady = _mapReady[1];

	var inputClassName = props.inputClassName || '';
	var disabled = !!props.disabled;
	var latitude = h2NormalizeCoord(props.latitude);
	var longitude = h2NormalizeCoord(props.longitude);

	var applyMarkerPosition = React.useCallback(function (lat, lng, moveView) {
		if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return;
		if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
		if (moveView !== false && mapRef.current) mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom() || 15, 14));
		if (props.onPositionChange) props.onPositionChange(lat, lng);
	}, [props.onPositionChange]);

	var locateByAddress = React.useCallback(function (addr, showWarn) {
		var text = String(addr || '').trim();
		if (!text || disabled) return;
		setLoading(true);
		var reqId = geocodeReqRef.current + 1;
		geocodeReqRef.current = reqId;
		h2GeocodeAddressPromise(text).then(function (result) {
			if (reqId !== geocodeReqRef.current) return;
			setLoading(false);
			if (!result) {
				if (showWarn !== false) message.warning('未能定位该地址，请拖动地图标记手动选点');
				return;
			}
			applyMarkerPosition(result.lat, result.lng, true);
		});
	}, [disabled, applyMarkerPosition]);

	locateByAddressRef.current = locateByAddress;

	React.useEffect(function () {
		var ext = props.address || '';
		if (ext === lastExternalAddressRef.current) return;
		lastExternalAddressRef.current = ext;
		setLocalAddress(ext);
		if (ext && locateByAddressRef.current) locateByAddressRef.current(ext, false);
	}, [props.address]);

	React.useEffect(function () {
		var cancelled = false;
		h2EnsureLeafletLoaded().then(function (L) {
			if (cancelled || !mapElRef.current || mapRef.current) return;
			h2FixLeafletDefaultIcon(L);
			var initLat = latitude != null ? latitude : H2_DEFAULT_MAP_CENTER.lat;
			var initLng = longitude != null ? longitude : H2_DEFAULT_MAP_CENTER.lng;
			var map = L.map(mapElRef.current, {
				zoomControl: true,
				attributionControl: true
			}).setView([initLat, initLng], latitude != null && longitude != null ? 15 : 11);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; OpenStreetMap'
			}).addTo(map);
			var marker = L.marker([initLat, initLng], { draggable: !disabled }).addTo(map);
			marker.on('dragend', function () {
				if (disabled) return;
				var ll = marker.getLatLng();
				if (props.onPositionChange) props.onPositionChange(ll.lat, ll.lng);
			});
			mapRef.current = map;
			markerRef.current = marker;
			setMapReady(true);
			setTimeout(function () { map.invalidateSize(); }, 80);
		}).catch(function () {
			if (!cancelled) message.error('地图加载失败，请检查网络后刷新重试');
		});
		return function () {
			cancelled = true;
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
				markerRef.current = null;
			}
		};
	}, []);

	React.useEffect(function () {
		if (!mapReady || latitude == null || longitude == null) return;
		if (markerRef.current) {
			var ll = markerRef.current.getLatLng();
			if (Math.abs(ll.lat - latitude) < 0.000001 && Math.abs(ll.lng - longitude) < 0.000001) return;
		}
		applyMarkerPosition(latitude, longitude, false);
	}, [latitude, longitude, mapReady, applyMarkerPosition]);

	React.useEffect(function () {
		if (markerRef.current) {
			if (disabled) markerRef.current.dragging.disable();
			else markerRef.current.dragging.enable();
		}
	}, [disabled, mapReady]);

	return React.createElement('div', { className: 'h2-station-map-picker' },
		React.createElement('div', { className: 'h2-station-map-picker__toolbar' },
			React.createElement(Input, {
				className: inputClassName,
				value: localAddress,
				disabled: disabled,
				placeholder: '输入地址后定位，或从上方地址解析自动填入',
				onChange: function (e) {
					var next = e.target.value;
					setLocalAddress(next);
					if (props.onAddressChange) props.onAddressChange(next);
				},
				onBlur: function () {
					if (disabled) return;
					locateByAddress(localAddress, true);
				},
				onPressEnter: function () {
					if (disabled) return;
					locateByAddress(localAddress, true);
				}
			}),
			React.createElement(Button, {
				type: 'default',
				disabled: disabled || loading || !String(localAddress || '').trim(),
				loading: loading,
				onClick: function () { locateByAddress(localAddress, true); }
			}, '定位')
		),
		React.createElement('div', { className: 'h2-station-map-picker__map', ref: mapElRef, role: 'application', 'aria-label': '加氢站地图定位' }),
		React.createElement('div', { className: 'h2-station-map-picker__coords' },
			React.createElement('span', { className: 'h2-station-map-picker__coords-item' }, '经度：', React.createElement('strong', null, h2FormatCoordNum(longitude))),
			React.createElement('span', { className: 'h2-station-map-picker__coords-item' }, '纬度：', React.createElement('strong', null, h2FormatCoordNum(latitude)))
		),
		React.createElement('div', { className: 'h2-station-map-picker__hint' }, '拖动地图标记可微调位置，经纬度将自动更新')
	);
}

var H2_BUSINESS_LICENSE_OCR_MOCKS = [
	{
		test: function (name) { return /嘉兴|南湖|氢能供应/i.test(name || ''); },
		name: '嘉兴氢能供应有限公司',
		taxId: '91330400MA2ABCDEF1',
		communicationAddress: '浙江省嘉兴市南湖区科技大道66号'
	},
	{
		test: function (name) { return /临平|杭州/i.test(name || ''); },
		name: '杭州临平氢能运营有限公司',
		taxId: '91330110MA3LINPING1',
		communicationAddress: '浙江省杭州市临平区东湖街道能源路16号'
	},
	{
		test: function (name) { return /羚牛|宝山|上海/i.test(name || ''); },
		name: '上海羚牛氢能科技有限公司',
		taxId: '91310100MA1XYZ7890',
		communicationAddress: '上海市宝山区富联路200号'
	},
	{
		test: function (name) { return /苏州|星湖/i.test(name || ''); },
		name: '苏州工业园区氢源科技有限公司',
		taxId: '91320500MA1ABCDEF2',
		communicationAddress: '江苏省苏州市工业园区星湖街328号'
	},
	{
		test: function () { return true; },
		name: '浙江羚牛氢能科技有限公司',
		taxId: '91330481MA2JXXXXXX',
		communicationAddress: '浙江省嘉兴市平湖市乍浦镇杭州湾大道1号'
	}
];

function h2MatchBusinessLicenseOcrMock(file) {
	var fileName = (file && file.name) || '';
	var i;
	for (i = 0; i < H2_BUSINESS_LICENSE_OCR_MOCKS.length; i++) {
		if (H2_BUSINESS_LICENSE_OCR_MOCKS[i].test(fileName)) {
			return H2_BUSINESS_LICENSE_OCR_MOCKS[i];
		}
	}
	return H2_BUSINESS_LICENSE_OCR_MOCKS[H2_BUSINESS_LICENSE_OCR_MOCKS.length - 1];
}

function h2ApplyBusinessLicenseOcr(ctx, ocrData) {
	if (!ocrData || !ctx || !ctx.updateSupplier) return;
	var commAddr = String(ocrData.communicationAddress || '').trim();
	var parsed = h2ParseAddressText(commAddr);
	var region = parsed.region || [];
	var detail = commAddr
		? h2StripRegionPrefixFromDetail(region, parsed.detail || commAddr)
		: '';
	var supplierPatch = {
		name: (ocrData.name || '').trim(),
		taxId: (ocrData.taxId || '').trim(),
		address: detail,
		mailingAddress: commAddr || detail,
		businessAddress: commAddr || detail
	};
	if (region.length >= 2) {
		supplierPatch.city = region.slice();
		supplierPatch.region = h2GetRegionByProvince(region[0]);
	}
	ctx.updateSupplier(supplierPatch);
	if (ctx.updateStation && ctx.supplierMode === 'new' && region.length >= 2) {
		var fullAddr = h2BuildFullAddress(region, detail);
		ctx.updateStation({
			address: { region: region.slice(), detail: detail },
			mapAddress: fullAddr
		});
	}
}

function h2TriggerBusinessLicenseOcr(file, ctx) {
	var antd = window.antd;
	var message = antd && antd.message;
	var hide = message && message.loading('营业执照识别中…', 0);
	window.setTimeout(function () {
		if (hide) hide();
		var ocrData = h2MatchBusinessLicenseOcrMock(file);
		h2ApplyBusinessLicenseOcr(ctx, ocrData);
		if (message) {
			message.success('识别完成：已填写供应商名称、纳税人识别号与通讯地址（未写入注册地址）');
		}
	}, 720);
}

function h2KpiCardIcon(key) {
	var size = 22;
	if (key === 'all') {
		return React.createElement('svg', {
			width: size,
			height: size,
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			strokeWidth: 1.75,
			strokeLinecap: 'round',
			strokeLinejoin: 'round',
			'aria-hidden': true
		},
			React.createElement('path', { d: 'M4 20h16' }),
			React.createElement('path', { d: 'M7 20v-9h4v9' }),
			React.createElement('path', { d: 'M14 20V8l5-3v15' }),
			React.createElement('text', {
				x: 8.5,
				y: 13.5,
				fill: 'currentColor',
				stroke: 'none',
				fontSize: 5.5,
				fontWeight: 700,
				fontFamily: 'system-ui, -apple-system, sans-serif'
			}, 'H₂')
		);
	}
	if (key === 'yes') {
		return h2SvgIcon([
			{ d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
			{ d: 'M14 2v6h6' },
			{ tag: 'circle', cx: 17.5, cy: 17.5, r: 3.5 },
			{ d: 'M16 17.5l1 1 2-2' }
		], size);
	}
	if (key === 'no') {
		return h2SvgIcon([
			{ d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
			{ d: 'M14 2v6h6' },
			{ tag: 'circle', cx: 17.5, cy: 17.5, r: 3.5 },
			{ tag: 'line', x1: 16, y1: 16, x2: 19, y2: 19 },
			{ tag: 'line', x1: 19, y1: 16, x2: 16, y2: 19 }
		], size);
	}
	if (key === 'balanceAlert') {
		return h2SvgIcon([
			{ d: 'M12 2v4' },
			{ d: 'M12 18v4' },
			{ d: 'M4.93 4.93l2.83 2.83' },
			{ d: 'M16.24 16.24l2.83 2.83' },
			{ d: 'M2 12h4' },
			{ d: 'M18 12h4' },
			{ d: 'M4.93 19.07l2.83-2.83' },
			{ d: 'M16.24 7.76l2.83-2.83' },
			{ tag: 'circle', cx: 12, cy: 12, r: 4 }
		], size);
	}
	if (key === 'arrears') {
		return h2SvgIcon([
			{ d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
			{ tag: 'line', x1: 12, y1: 9, x2: 12, y2: 13 },
			{ tag: 'line', x1: 12, y1: 17, x2: 12.01, y2: 17 }
		], size);
	}
	if (key === 'none') {
		return h2SvgIcon([
			{ d: 'M6 20h12' },
			{ d: 'M9 20v-6h2c1.2 0 2.2 1 2.2 2.2S12.2 18.4 11 18.4H9' },
			{ tag: 'circle', cx: 12, cy: 11, r: 7.5 },
			{ tag: 'line', x1: 6.8, y1: 6.8, x2: 17.2, y2: 17.2 }
		], size);
	}
	return h2KpiCardIcon('all');
}

function h2KpiIcon(key) {
	return h2KpiCardIcon(key);
}

function h2SignedFilterIcon(key) {
	return h2KpiCardIcon(key === 'yes' ? 'yes' : 'no');
}

/** 地址组件：省/市级联 + 详细地址（无子标题，挂在「地址」表单项下） */
function RegionAddressInput(props) {
	var antd = window.antd;
	var Cascader = antd.Cascader;
	var Input = antd.Input;
	var value = props.value || h2EmptyAddressValue();
	var onChange = props.onChange;
	var disabled = props.disabled;
	var inputClassName = props.inputClassName || '';
	var layout = props.layout || 'stack';
	var detailPlaceholder = props.detailPlaceholder || '请输入街道、门牌号等详细地址';
	var regionPlaceholder = props.regionPlaceholder || '请选择省 / 市';
	var fieldStyle = props.fieldStyle || { width: '100%', borderRadius: 8 };
	var rootCls = 'h2-region-address' + (layout === 'inline' ? ' h2-region-address--inline' : '') + (props.className ? ' ' + props.className : '');

	return React.createElement('div', { className: rootCls },
		React.createElement(Cascader, {
			className: inputClassName + (layout === 'inline' ? ' h2-region-address-cascader' : ''),
			options: H2_REGION_CASCADER_OPTIONS,
			value: value.region && value.region.length ? value.region : undefined,
			onChange: function (v) { onChange && onChange({ region: v || [], detail: value.detail || '' }); },
			placeholder: regionPlaceholder,
			style: layout === 'inline' ? { width: '100%', borderRadius: fieldStyle.borderRadius || 8 } : fieldStyle,
			disabled: disabled,
			allowClear: !disabled
		}),
		React.createElement(Input, {
			className: inputClassName + (layout === 'inline' ? ' h2-region-address-detail' : ''),
			value: value.detail || '',
			onChange: function (e) { onChange && onChange({ region: value.region || [], detail: e.target.value }); },
			placeholder: detailPlaceholder,
			disabled: disabled,
			maxLength: 200,
			style: layout === 'inline' ? { width: '100%', borderRadius: fieldStyle.borderRadius || 8 } : fieldStyle
		})
	);
}

/** 供应商通讯地址：省/市 + 详细地址（横向嵌入） */
function SupplierCityAddressInput(props) {
	var antd = window.antd;
	var Cascader = antd.Cascader;
	var Input = antd.Input;
	var city = props.city;
	var address = props.address || '';
	var onChange = props.onChange;
	var disabled = props.disabled;
	var inputClassName = props.inputClassName || '';
	var onCityChange = props.onCityChange;
	var layout = props.layout || 'inline';
	var rootCls = 'h2-region-address' + (layout === 'inline' ? ' h2-region-address--inline' : '') + (props.className ? ' ' + props.className : '');

	return React.createElement('div', { className: rootCls },
		React.createElement(Cascader, {
			className: inputClassName + (layout === 'inline' ? ' h2-region-address-cascader' : ''),
			options: H2_REGION_CASCADER_OPTIONS,
			value: city && city.length ? city : undefined,
			onChange: onCityChange,
			placeholder: '请选择省 / 市',
			style: { width: '100%' },
			disabled: disabled,
			allowClear: !disabled
		}),
		React.createElement(Input, {
			className: inputClassName + (layout === 'inline' ? ' h2-region-address-detail' : ''),
			value: address,
			disabled: disabled,
			placeholder: '请输入详细地址',
			maxLength: 200,
			style: { width: '100%' },
			onChange: function (e) { onChange && onChange(e.target.value); }
		})
	);
}

function h2GetUploadFileUrl(file) {
	if (!file) return '';
	if (file.url) return file.url;
	if (file.thumbUrl) return file.thumbUrl;
	if (file.originFileObj && typeof URL !== 'undefined' && URL.createObjectURL) {
		try { return URL.createObjectURL(file.originFileObj); } catch (e) { return ''; }
	}
	return '';
}

function h2DownloadUploadFile(file) {
	var url = h2GetUploadFileUrl(file);
	if (!url) return;
	var a = document.createElement('a');
	a.href = url;
	a.download = file.name || '附件';
	a.target = '_blank';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

function h2IsPdfFileName(name) {
	return /\.pdf$/i.test(String(name || ''));
}

function h2EscapeSvgText(text) {
	return String(text || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function h2BuildPrototypeDocPreviewSvg(title, variant) {
	var accent = variant === 'license' ? '#10b981' : '#3b82f6';
	var heading = variant === 'license' ? '证照预览' : '附件预览';
	var label = h2EscapeSvgText(String(title || '附件').slice(0, 28));
	var svg = '<?xml version="1.0" encoding="UTF-8"?>'
		+ '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="880" viewBox="0 0 640 880">'
		+ '<rect width="640" height="880" fill="#f8fafc"/>'
		+ '<rect x="48" y="48" width="544" height="784" rx="12" fill="#fff" stroke="#e2e8f0" stroke-width="2"/>'
		+ '<rect x="48" y="48" width="544" height="72" rx="12" fill="' + accent + '"/>'
		+ '<text x="320" y="92" text-anchor="middle" fill="#fff" font-size="22" font-family="sans-serif">' + heading + '</text>'
		+ '<text x="320" y="460" text-anchor="middle" fill="#64748b" font-size="18" font-family="sans-serif">' + label + '</text>'
		+ '</svg>';
	return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function h2ResolveLicenseDisplayUrl(file) {
	var url = h2GetUploadFileUrl(file);
	if (url) return url;
	return h2BuildPrototypeDocPreviewSvg(file && file.name, 'license');
}

function h2ResolveUploadPreview(file, variant) {
	var name = (file && file.name) || '附件';
	var url = h2GetUploadFileUrl(file);
	var isPdf = h2IsPdfFileName(name);
	if (url && isPdf) {
		return { url: url, name: name, type: 'pdf' };
	}
	if (url) {
		return { url: url, name: name, type: 'image' };
	}
	return {
		url: h2BuildPrototypeDocPreviewSvg(name, variant || 'doc'),
		name: name,
		type: 'image'
	};
}

/** 合同附件：按钮上传 + 预览/下载 */
function ContractFilesUpload(props) {
	var antd = window.antd;
	var Upload = antd.Upload;
	var Button = antd.Button;
	var fileList = props.fileList || [];
	var disabled = props.disabled;
	var showHint = props.showHint !== false;
	var wrapClass = 'h2-contract-upload' + (props.wrapClassName ? ' ' + props.wrapClassName : '');
	var uploadClass = props.uploadClassName || 'h2-create-upload-btn';

	return React.createElement('div', { className: wrapClass },
		React.createElement('div', { className: 'h2-contract-upload-actions' },
			React.createElement(Upload, {
				className: uploadClass,
				multiple: true,
				disabled: disabled,
				fileList: fileList,
				beforeUpload: function () { return false; },
				onChange: props.onChange,
				showUploadList: false
			},
				React.createElement(Button, {
					type: props.buttonType || 'default',
					icon: H2_ICONS.upload,
					disabled: disabled,
					className: props.buttonClassName,
					style: props.buttonStyle
				}, props.uploadLabel || '上传附件')
			),
			showHint ? React.createElement('span', { style: { fontSize: 12, color: '#94a3b8' } }, '点击上传，可多选') : null
		),
		fileList.length
			? React.createElement('div', { className: 'h2-contract-file-list' },
				fileList.map(function (file) {
					return React.createElement('div', { key: file.uid, className: 'h2-contract-file-item' },
						React.createElement('span', { className: 'h2-contract-file-name', title: file.name }, file.name || '未命名附件'),
						React.createElement('div', { className: 'h2-contract-file-btns' },
							React.createElement(Button, {
								type: 'link',
								size: 'small',
								disabled: disabled,
								onClick: function () {
									var url = h2GetUploadFileUrl(file);
									if (url) window.open(url, '_blank');
								}
							}, '预览'),
							React.createElement(Button, {
								type: 'link',
								size: 'small',
								disabled: disabled,
								onClick: function () { h2DownloadUploadFile(file); }
							}, '下载'),
							!disabled
								? React.createElement(Button, {
									type: 'link',
									size: 'small',
									danger: true,
									onClick: function () {
										if (!props.onChange) return;
										props.onChange({
											fileList: fileList.filter(function (f) { return f.uid !== file.uid; })
										});
									}
								}, '删除')
								: null
						)
					);
				})
			)
			: null
	);
}

function h2StationContactPhone(station) {
	return (station.mobilePhone || '').trim() || (station.landlinePhone || '').trim();
}

function h2FilterContactPhoneInput(raw) {
	var v = String(raw || '').replace(/[^\d-]/g, '');
	var digits = v.replace(/-/g, '');
	if (!digits) return '';
	if (digits.charAt(0) === '1') return digits.slice(0, 11);
	var parts = v.split('-');
	if (parts.length > 2) v = parts[0] + '-' + parts.slice(1).join('');
	return v.slice(0, 16);
}

function h2IsMobilePhone(text) {
	var digits = String(text || '').replace(/[\s-]/g, '');
	return /^1[3-9]\d{9}$/.test(digits);
}

function h2IsLandlinePhone(text) {
	var raw = String(text || '').trim();
	if (!raw) return false;
	var compact = raw.replace(/[\s-]/g, '');
	if (/^0\d{2,3}\d{7,8}$/.test(compact)) return true;
	if (/^0\d{2,3}-\d{7,8}$/.test(raw)) return true;
	if (/^\d{7,8}$/.test(compact)) return true;
	return false;
}

function h2IsValidContactPhone(text) {
	var v = String(text || '').trim();
	if (!v) return false;
	return h2IsMobilePhone(v) || h2IsLandlinePhone(v);
}

function h2GetContactPhoneInputTip(text) {
	var v = String(text || '').trim();
	if (!v) return '';
	if (h2IsValidContactPhone(v)) return '';
	var digits = v.replace(/[^\d]/g, '');
	if (digits.charAt(0) === '1') {
		if (digits.length < 11) return '手机号码应为11位';
		return '手机号码格式不正确';
	}
	if (digits.charAt(0) === '0') {
		return '固定电话格式不正确，示例：0573-12345678';
	}
	return '固定电话应为7-8位本地号码，或带区号如 0573-12345678';
}

function h2FilterMobilePhoneInput(raw) {
	return String(raw || '').replace(/\D/g, '').slice(0, 11);
}

function h2FilterLandlinePhoneInput(raw) {
	var v = String(raw || '').replace(/[^\d-]/g, '');
	var parts = v.split('-');
	if (parts.length > 2) v = parts[0] + '-' + parts.slice(1).join('');
	return v.slice(0, 16);
}

function h2GetMobilePhoneInputTip(text) {
	var v = String(text || '').trim();
	if (!v) return '';
	if (h2IsMobilePhone(v)) return '';
	var digits = v.replace(/\D/g, '');
	if (digits.length < 11) return '手机号码应为11位';
	return '手机号码格式不正确';
}

function h2GetLandlinePhoneInputTip(text) {
	var v = String(text || '').trim();
	if (!v) return '';
	if (h2IsLandlinePhone(v)) return '';
	return '固定电话格式不正确，示例：0573-12345678';
}

function h2ValidateStationPhones(station) {
	var mobile = (station.mobilePhone || '').trim();
	var landline = (station.landlinePhone || '').trim();
	if (!mobile && !landline) return '请至少填写手机号或固定电话';
	if (mobile && !h2IsMobilePhone(mobile)) return h2GetMobilePhoneInputTip(mobile) || '手机号码格式不正确';
	if (landline && !h2IsLandlinePhone(landline)) return h2GetLandlinePhoneInputTip(landline) || '固定电话格式不正确';
	return '';
}

function h2ApplyStationContactPhone(station, text) {
	var v = h2FilterContactPhoneInput(text);
	var digits = v.replace(/-/g, '');
	if (/^1/.test(digits)) {
		return Object.assign({}, station, { mobilePhone: v, landlinePhone: '' });
	}
	return Object.assign({}, station, { mobilePhone: '', landlinePhone: v });
}

var H2_BUSINESS_HOURS_MODE_OPTIONS = [
	{ label: '全天营业', value: 'allDay', tone: 'allday' },
	{ label: '非全天营业', value: 'custom', tone: 'custom' }
];

var H2_BUSINESS_STATUS_BTN_OPTIONS = [
	{ label: '营业中', value: '营业中', tone: 'open' },
	{ label: '暂停营业', value: '暂停营业', tone: 'pause' },
	{ label: '停止营业', value: '停止营业', tone: 'stop' }
];

function h2RenderOptionButtonGroup(options, value, onChange, opts) {
	opts = opts || {};
	var groupClass = 'h2-option-btn-group' + (opts.className ? ' ' + opts.className : '');
	return React.createElement('div', {
		className: groupClass,
		role: 'group',
		'aria-label': opts.ariaLabel || ''
	},
		(options || []).map(function (opt) {
			var active = value === opt.value;
			var btnClass = 'h2-option-btn' + (active ? ' h2-option-btn--active' : '') + (opt.tone ? ' h2-option-btn--' + opt.tone : '');
			return React.createElement('button', {
				type: 'button',
				key: String(opt.value),
				className: btnClass,
				'aria-pressed': active,
				disabled: !!opts.disabled,
				onClick: function () { if (onChange) onChange(opt.value); }
			}, opt.label);
		})
	);
}

function h2IsAllDayBusinessHours(str) {
	var s = String(str || '').trim();
	if (!s || s === '—') return false;
	if (s === '全天营业' || s === '24小时' || s === '24 小时') return true;
	return /^0?0:00\s*[-–]\s*24:00$/.test(s);
}

function h2ParseBusinessHours(str) {
	var s = String(str || '').trim();
	if (!s || s === '—') {
		return { mode: 'allDay', start: '08:00', end: '22:00' };
	}
	if (h2IsAllDayBusinessHours(s)) {
		return { mode: 'allDay', start: '08:00', end: '22:00' };
	}
	var parts = s.split('-');
	if (parts.length >= 2) {
		return {
			mode: 'custom',
			start: (parts[0] || '').trim(),
			end: (parts.slice(1).join('-') || '').trim()
		};
	}
	return { mode: 'custom', start: '', end: '' };
}

function h2FormatBusinessHours(val) {
	if (!val || val.mode === 'allDay') return '00:00-24:00';
	var start = (val.start || '').trim();
	var end = (val.end || '').trim();
	if (!start || !end) return '';
	return start + '-' + end;
}

function h2DisplayBusinessHours(str) {
	var s = String(str || '').trim();
	if (!s || s === '—') return '—';
	if (h2IsAllDayBusinessHours(s) || s === '全天营业') return '00:00-24:00';
	var parsed = h2ParseBusinessHours(s);
	if (parsed.mode === 'custom' && parsed.start && parsed.end) return parsed.start + '-' + parsed.end;
	return s;
}

function h2NormalizeTimeText(text) {
	var s = String(text || '').trim();
	if (!s) return '';
	var m = /^(\d{1,2}):(\d{2})$/.exec(s);
	if (!m) return s;
	var h = parseInt(m[1], 10);
	var min = parseInt(m[2], 10);
	if (isNaN(h) || isNaN(min) || h < 0 || h > 23 || min < 0 || min > 59) return s;
	return (h < 10 ? '0' : '') + h + ':' + (min < 10 ? '0' : '') + min;
}

function h2TimeTextToDayjs(text) {
	var dayjs = window.dayjs;
	if (!dayjs) return null;
	var norm = h2NormalizeTimeText(text);
	if (!norm) return null;
	var parts = norm.split(':');
	return dayjs().hour(parseInt(parts[0], 10)).minute(parseInt(parts[1], 10)).second(0).millisecond(0);
}

function h2DayjsToTimeText(d) {
	var dayjs = window.dayjs;
	if (!d || !dayjs) return '';
	return dayjs(d).format('HH:mm');
}

/** 营业时间：全天 / 非全天按钮组 + 起止时间（时:分，可输入） */
function BusinessHoursInput(props) {
	var antd = window.antd;
	var TimePicker = antd.TimePicker;
	var Input = antd.Input;
	var parsed = h2ParseBusinessHours(props.value);
	var onChange = props.onChange;
	var disabled = props.disabled;
	var inputClassName = props.inputClassName || '';
	var fieldStyle = props.fieldStyle || { width: '100%' };
	var layout = props.layout || 'full';
	var dayjs = window.dayjs;
	var rootClass = 'h2-business-hours' + (layout === 'col4' ? ' h2-business-hours--col4' : '');

	var emit = function (next) {
		onChange && onChange(h2FormatBusinessHours(next));
	};

	var renderTimeField = function (label, timeKey, placeholder) {
		var timeVal = parsed[timeKey] || '';
		var onTimeChange = function (nextText) {
			var patch = { mode: 'custom', start: parsed.start || '', end: parsed.end || '' };
			patch[timeKey] = h2NormalizeTimeText(nextText);
			emit(patch);
		};
		return React.createElement('div', { className: 'h2-business-hours-range-item', key: timeKey },
			React.createElement('span', { className: 'h2-business-hours-range-label' }, label),
			dayjs
				? React.createElement(TimePicker, {
					className: inputClassName,
					format: 'HH:mm',
					minuteStep: 1,
					hourStep: 1,
					showNow: false,
					allowClear: !disabled,
					inputReadOnly: false,
					disabled: disabled,
					style: fieldStyle,
					placeholder: placeholder,
					value: h2TimeTextToDayjs(timeVal),
					onChange: function (d) { onTimeChange(d ? h2DayjsToTimeText(d) : ''); }
				})
				: React.createElement(Input, {
					className: inputClassName,
					disabled: disabled,
					style: fieldStyle,
					placeholder: placeholder || 'HH:mm',
					value: timeVal,
					maxLength: 5,
					onChange: function (e) { onTimeChange(e.target.value); },
					onBlur: function (e) { onTimeChange(e.target.value); }
				})
		);
	};

	return React.createElement('div', { className: rootClass },
		h2RenderOptionButtonGroup(H2_BUSINESS_HOURS_MODE_OPTIONS, parsed.mode, function (mode) {
			if (mode === 'allDay') emit({ mode: 'allDay', start: parsed.start, end: parsed.end });
			else emit({
				mode: 'custom',
				start: parsed.start || '08:00',
				end: parsed.end || '22:00'
			});
		}, { ariaLabel: '营业时间类型', disabled: disabled }),
		parsed.mode === 'custom'
			? React.createElement('div', { className: 'h2-business-hours-custom-panel' },
				React.createElement('div', { className: 'h2-business-hours-custom-panel__title' }, '营业时段'),
				React.createElement('div', { className: 'h2-business-hours-range' },
					renderTimeField('开始时间', 'start', '请选择开始时间'),
					renderTimeField('结束时间', 'end', '请选择结束时间')
				)
			)
			: null
	);
}

function h2CreateEmptyForm() {
	return {
		name: '',
		address: h2EmptyAddressValue(),
		isSigned: true,
		contractStart: '',
		contractEnd: '',
		contractFiles: [],
		businessStatus: '营业中',
		businessHours: '',
		contact: '',
		phone: ''
	};
}

function h2RecordToForm(record) {
	if (!record) return h2CreateEmptyForm();
	return {
		name: record.name || '',
		address: {
			region: (record.region || []).slice(),
			detail: record.addressDetail || ''
		},
		isSigned: record.isSigned !== false,
		contractStart: record.contractStart || '',
		contractEnd: record.contractEnd || '',
		contractFiles: (record.contractFiles || []).map(function (f, i) {
			return Object.assign({}, f, { uid: f.uid || ('f-' + i), status: 'done' });
		}),
		businessStatus: record.businessStatus || '营业中',
		businessHours: record.businessHours || '',
		contact: record.contact || '',
		phone: record.phone || ''
	};
}

function h2FormToRecord(form, id) {
	var files = (form.contractFiles || []).map(function (f) {
		return { uid: f.uid, name: f.name || '合同附件.pdf', url: f.url || '' };
	});
	return {
		id: id,
		name: (form.name || '').trim(),
		region: form.address.region || [],
		addressDetail: (form.address.detail || '').trim(),
		fullAddress: h2BuildFullAddress(form.address.region, form.address.detail),
		isSigned: !!form.isSigned,
		contractStart: form.contractStart || '',
		contractEnd: form.contractEnd || '',
		contractFiles: files,
		businessStatus: form.businessStatus || '营业中',
		businessHours: (form.businessHours || '').trim(),
		contact: (form.contact || '').trim(),
		phone: (form.phone || '').trim(),
		updateTime: new Date().toISOString().slice(0, 16).replace('T', ' ')
	};
}

var H2_MOCK_STATIONS = [
	{
		id: 1,
		name: '嘉兴加氢站（一期）',
		region: ['浙江省', '嘉兴市'],
		addressDetail: '南湖区科技大道88号',
		fullAddress: '浙江省-嘉兴市南湖区科技大道88号',
		mapAddress: '浙江省嘉兴市南湖区科技大道88号',
		latitude: 30.7512,
		longitude: 120.7588,
		isSigned: true,
		contractStart: '2024-01-01',
		contractEnd: '2026-12-31',
		contractFiles: [{ uid: 'c1', name: '嘉兴加氢站签约合同.pdf' }],
		businessStatus: '营业中',
		businessHours: '08:00-22:00',
		costUnitPrice: 42.5,
		customerUnitPrice: 45,
		costPriceLogs: [
			{ id: 'cpl-1-1', operator: '王静', operateTime: '2026-01-10 09:00', beforeCostPrice: null, afterCostPrice: 41.0, effectiveTime: '2026-01-15 00:00', priceType: 'fixed', customerScope: 'all' },
			{ id: 'cpl-1-2', operator: '系统管理员', operateTime: '2026-05-01 14:20', beforeCostPrice: 41.0, afterCostPrice: 42.5, effectiveTime: '2026-05-05 00:00', priceType: 'fixed', customerScope: 'all' }
		],
		priceConfigs: [
			{
				id: 'pc-default',
				priceType: 'fixed',
				customerScope: 'all',
				customerId: null,
				customerName: null,
				fixedPrice: 42.5,
				tierRules: [],
				tierResetDay: 1,
				tierPeriodVolumeKg: 0,
				tierPeriodKey: '2026-06',
				logs: [
					{ id: 'cpl-1-1', operator: '王静', operateTime: '2026-01-10 09:00', beforeCostPrice: null, afterCostPrice: 41.0, effectiveTime: '2026-01-15 00:00', priceType: 'fixed', customerScope: 'all' },
					{ id: 'cpl-1-2', operator: '系统管理员', operateTime: '2026-05-01 14:20', beforeCostPrice: 41.0, afterCostPrice: 42.5, effectiveTime: '2026-05-05 00:00', priceType: 'fixed', customerScope: 'all' }
				]
			},
			{
				id: 'pc-tier-xf',
				priceType: 'tiered',
				customerScope: 'customer',
				customerId: 'cust-嘉兴市鑫峤供应链科技有限公司',
				customerName: '嘉兴市鑫峤供应链科技有限公司',
				fixedPrice: null,
				tierRules: [
					{ id: 'tr-xf-1', thresholdKg: 0, price: 43.0 },
					{ id: 'tr-xf-2', thresholdKg: 300, price: 41.5 },
					{ id: 'tr-xf-3', thresholdKg: 600, price: 40.0 }
				],
				tierResetDay: 1,
				tierPeriodVolumeKg: 312.5,
				tierPeriodKey: '2026-06',
				logs: [
					{ id: 'cpl-xf-1', operator: '王静', operateTime: '2026-05-10 10:00', beforeCostPrice: null, afterCostPrice: 43.0, effectiveTime: '2026-05-10 10:00', priceType: 'tiered', customerScope: 'customer', customerName: '嘉兴市鑫峤供应链科技有限公司', tierRulesSummary: '≥0.00kg → 43.00元/kg；≥300.00kg → 41.50元/kg；≥600.00kg → 40.00元/kg' }
				]
			}
		],
		prepaidBalance: 85620.0,
		balanceAlertThreshold: 50000,
		contact: '张三',
		phone: '13800138001',
		businessStatusLogs: [],
		supplierMode: 'link',
		linkedSupplierId: 'sup-h2-1',
		bindAccountMode: 'bind',
		boundAccountId: 'acc-h2-1',
		boundAccount: {
			id: 'acc-h2-1',
			username: 'jx_h2_admin',
			displayName: '嘉兴站管理员',
			role: '加氢站管理员',
			mobile: '13800138001',
			status: '启用'
		},
		updateTime: '2026-05-20 14:30'
	},
	{
		id: 2,
		name: '杭州临平加氢站',
		region: ['浙江省', '杭州市'],
		addressDetail: '临平区东湖街道能源路16号',
		fullAddress: '浙江省-杭州市临平区东湖街道能源路16号',
		isSigned: true,
		contractStart: '2025-03-01',
		contractEnd: '2027-02-28',
		contractFiles: [{ uid: 'c2', name: '临平加氢站合作协议.pdf' }, { uid: 'c3', name: '临平加氢站补充协议.pdf' }],
		businessStatus: '营业中',
		businessHours: '00:00-24:00',
		costUnitPrice: 43.0,
		customerUnitPrice: 46,
		costPriceLogs: [
			{ id: 'cpl-2-1', operator: '李四', operateTime: '2026-05-20 11:00', beforeCostPrice: 42.0, afterCostPrice: 43.0, effectiveTime: '2026-05-25 00:00' }
		],
		prepaidBalance: 125000.5,
		contact: '李四',
		phone: '13900139002',
		supplierMode: 'new',
		supplier: {
			signingCompany: '浙江羚牛氢能科技有限公司',
			name: '杭州临平氢能运营有限公司',
			type: '加氢站',
			city: ['浙江省', '杭州市'],
			address: '临平区东湖街道能源路16号',
			region: '华东',
			contactName: '李四',
			contactMobile: '13900139002',
			contactTitle: '站长',
			taxId: '91330110MA3LINPING1',
			invoiceAddress: '浙江省杭州市临平区东湖街道能源路16号',
			invoicePhone: '0571-88882222',
			bankName: '中国农业银行杭州临平支行',
			bankAccount: '6228480402631234567',
			mailingAddress: '浙江省杭州市临平区东湖街道能源路16号',
			businessAddress: '浙江省杭州市临平区东湖街道能源路16号',
			businessLicenseFiles: [{ uid: 'bl-hz', name: '营业执照_临平氢能.pdf' }],
			fillingLicenseFiles: [
				{ uid: 'fl-hz-1', name: '加氢站经营许可证.pdf' },
				{ uid: 'fl-hz-2', name: '压力容器检验报告.pdf' }
			]
		},
		updateTime: '2026-06-01 09:15'
	},
	{
		id: 3,
		name: '上海宝山加氢站',
		region: ['上海市', '上海市'],
		addressDetail: '宝山区富联路128号',
		fullAddress: '上海市-上海市宝山区富联路128号',
		isSigned: true,
		contractStart: '2023-06-01',
		contractEnd: '2025-05-31',
		contractFiles: [{ uid: 'c4', name: '宝山加氢站合同（即将到期）.pdf' }],
		businessStatus: '暂停营业',
		businessHours: '09:00-18:00',
		costUnitPrice: 44.0,
		customerUnitPrice: 47,
		costPriceLogs: [
			{ id: 'cpl-3-1', operator: '王五', operateTime: '2026-03-01 10:30', beforeCostPrice: 43.5, afterCostPrice: 44.0, effectiveTime: '2026-03-05 00:00' }
		],
		prepaidBalance: -3250.0,
		balanceAlertThreshold: 10000,
		businessStatusLogs: [
			{ id: 'bsl-3-2', operateTime: '2026-04-01 10:00', operator: '王五', beforeStatus: '营业中', afterStatus: '暂停营业' },
			{ id: 'bsl-3-1', operateTime: '2026-03-15 09:30', operator: '系统管理员', beforeStatus: '暂停营业', afterStatus: '营业中' }
		],
		contact: '王五',
		phone: '13700137003',
		supplierMode: 'link',
		linkedSupplierId: 'sup-h2-2',
		bindAccountMode: 'bind',
		boundAccountId: 'acc-h2-3',
		boundAccount: {
			id: 'acc-h2-3',
			username: 'sh_bs_h2',
			displayName: '宝山站管理员',
			role: '加氢站管理员',
			mobile: '13700137003',
			status: '启用'
		},
		updateTime: '2026-04-12 16:40'
	},
	{
		id: 4,
		name: '平湖合作停车场（待建加氢）',
		region: ['浙江省', '嘉兴市'],
		addressDetail: '平湖市乍嘉公路与平善大道交叉口',
		fullAddress: '浙江省-嘉兴市平湖市乍嘉公路与平善大道交叉口',
		isSigned: false,
		contractStart: '',
		contractEnd: '',
		contractFiles: [],
		businessStatus: '停止营业',
		businessHours: '—',
		prepaidBalance: 0,
		contact: '赵六',
		phone: '13600136004',
		updateTime: '2026-03-08 11:20'
	},
	{
		id: 5,
		name: '苏州工业园区备用站',
		region: ['江苏省', '苏州市'],
		addressDetail: '工业园区星湖街328号',
		fullAddress: '江苏省-苏州市工业园区星湖街328号',
		isSigned: false,
		contractStart: '',
		contractEnd: '',
		contractFiles: [],
		businessStatus: '停止营业',
		businessHours: '10:00-17:00',
		prepaidBalance: 15800.0,
		balanceAlertThreshold: 20000,
		contact: '钱七',
		phone: '13500135005',
		supplierMode: 'link',
		linkedSupplierId: 'sup-h2-3',
		updateTime: '2026-02-18 08:50'
	},
	{
		id: 6,
		name: '桐乡合作加氢站',
		region: ['浙江省', '嘉兴市'],
		addressDetail: '桐乡市梧桐街道庆丰路66号',
		fullAddress: '浙江省-嘉兴市桐乡市梧桐街道庆丰路66号',
		isSigned: true,
		contractStart: '2025-06-01',
		contractEnd: '2027-05-31',
		contractFiles: [],
		businessStatus: '营业中',
		businessHours: '08:00-20:00',
		costUnitPrice: 41.8,
		customerUnitPrice: 44.5,
		costPriceLogs: [],
		prepaidBalance: 42000.0,
		contact: '周八',
		phone: '13800138006',
		updateTime: '2026-05-10 15:20'
	}
];

/** 解析站点关联的供应商（内嵌 supplier 或 linkedSupplierId） */
function h2ResolveStationSupplier(record) {
	if (!record) return null;
	if (record.supplier && ((record.supplier.name || '').trim() || (record.supplier.taxId || '').trim())) {
		return Object.assign({ type: '加氢站' }, record.supplier);
	}
	if (record.linkedSupplierId) {
		var i;
		for (i = 0; i < H2_MOCK_EXISTING_SUPPLIERS.length; i++) {
			if (H2_MOCK_EXISTING_SUPPLIERS[i].id === record.linkedSupplierId) {
				return H2_MOCK_EXISTING_SUPPLIERS[i];
			}
		}
	}
	return null;
}

var H2_SETTLEMENT_STATUS_OPTIONS = [
	{ value: 'customer', label: '客户承担' },
	{ value: 'internal', label: '我司承担' },
	{ value: 'customer_self', label: '客户自行结算' }
];

var H2_SETTLEMENT_STATUS_MAP = {
	customer: { label: '客户承担', color: 'blue' },
	internal: { label: '我司承担', color: 'green' },
	customer_self: { label: '客户自行结算', color: 'orange' }
};

function h2SettlementStatusLabel(value) {
	var info = H2_SETTLEMENT_STATUS_MAP[value];
	return info ? info.label : '—';
}

/** 站点加氢记录 Mock（字段对齐车辆氢费明细） */
var H2_MOCK_REFUEL_RECORDS = [
	{ id: 'rf-1', stationName: '嘉兴加氢站（一期）', hydrogenTime: '2026-05-28 10:21:08', plateNo: '浙A12345F', customerName: '嘉兴市鑫峤供应链科技有限公司', hydrogenKg: 12.5, costUnitPrice: 42.5, costAmount: 531.25, customerUnitPrice: 45, customerAmount: 562.5, settlementStatus: 'customer' },
	{ id: 'rf-2', stationName: '嘉兴加氢站（一期）', hydrogenTime: '2026-05-26 14:08:33', plateNo: '浙A67890F', customerName: '浙江绿运物流有限公司', hydrogenKg: 10.0, costUnitPrice: 42.5, costAmount: 425.0, customerUnitPrice: 45, customerAmount: 450.0, settlementStatus: 'internal' },
	{ id: 'rf-3', stationName: '嘉兴加氢站（一期）', hydrogenTime: '2026-05-22 09:15:00', plateNo: '浙A88888F', customerName: '嘉兴市鑫峤供应链科技有限公司', hydrogenKg: 18.3, costUnitPrice: 42.5, costAmount: 777.75, customerUnitPrice: 45, customerAmount: 823.5, settlementStatus: 'customer_self' },
	{ id: 'rf-4', stationName: '嘉兴加氢站（一期）', hydrogenTime: '2026-05-18 16:42:11', plateNo: '浙A03561F', customerName: '嘉兴港务氢能运输队', hydrogenKg: 15.6, costUnitPrice: 42.5, costAmount: 663.0, customerUnitPrice: 45, customerAmount: 702.0, settlementStatus: 'customer' },
	{ id: 'rf-5', stationName: '杭州临平加氢站', hydrogenTime: '2026-05-30 09:30:22', plateNo: '浙B23456F', customerName: '杭州临平城配中心', hydrogenKg: 15.3, costUnitPrice: 43.0, costAmount: 657.9, customerUnitPrice: 46, customerAmount: 703.8, settlementStatus: 'internal' },
	{ id: 'rf-6', stationName: '杭州临平加氢站', hydrogenTime: '2026-05-27 18:10:05', plateNo: '浙B99999F', customerName: '浙江氢运科技', hydrogenKg: 18.2, costUnitPrice: 43.0, costAmount: 782.6, customerUnitPrice: 46, customerAmount: 837.2, settlementStatus: 'customer_self' },
	{ id: 'rf-7', stationName: '杭州临平加氢站', hydrogenTime: '2026-05-24 11:05:40', plateNo: '浙B58888F', customerName: '杭州临平城配中心', hydrogenKg: 11.8, costUnitPrice: 43.0, costAmount: 507.4, customerUnitPrice: 46, customerAmount: 542.8, settlementStatus: 'customer' },
	{ id: 'rf-8', stationName: '上海宝山加氢站', hydrogenTime: '2026-04-20 16:45:18', plateNo: '沪A88888F', customerName: '上海羚牛氢运', hydrogenKg: 8.0, costUnitPrice: 44.0, costAmount: 352.0, customerUnitPrice: 47, customerAmount: 376.0, settlementStatus: 'internal' },
	{ id: 'rf-9', stationName: '上海宝山加氢站', hydrogenTime: '2026-04-08 09:12:55', plateNo: '沪BDB9161F', customerName: '宝山园区试运车队', hydrogenKg: 9.5, costUnitPrice: 44.0, costAmount: 418.0, customerUnitPrice: 47, customerAmount: 446.5, settlementStatus: 'customer_self' },
	{ id: 'rf-10', stationName: '苏州工业园区备用站', hydrogenTime: '2026-03-15 10:00:00', plateNo: '苏E33333F', customerName: '苏州试运客户', hydrogenKg: 6.2, costUnitPrice: 41.0, costAmount: 254.2, customerUnitPrice: 44, customerAmount: 272.8, settlementStatus: 'customer' }
];

function h2FormatKgNum(v) {
	var n = typeof v === 'number' ? v : parseFloat(v);
	return isNaN(n) ? '0.00' : n.toFixed(2);
}

function h2FormatYuanNum(v) {
	var n = typeof v === 'number' ? v : parseFloat(v);
	return isNaN(n) ? '0.00' : n.toFixed(2);
}

function h2FormatYuanSymbol(v, options) {
	var opts = options || {};
	if (v == null || v === '') return '—';
	if (!opts.keepZero && Number(v) === 0) return '—';
	var n = typeof v === 'number' ? v : parseFloat(v);
	if (isNaN(n)) return '—';
	return '￥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

var H2_BALANCE_BIZ_TYPE_MAP = {
	recharge: { key: 'recharge', label: '充值', color: 'success' },
	refuel: { key: 'refuel', label: '车辆加氢', color: 'warning' },
	ending: { key: 'ending', label: '期末', color: 'default' }
};

function h2Pad2(n) {
	return String(n).padStart(2, '0');
}

function h2BuildBalanceChangeTime(seqIndex) {
	var day = Math.max(1, 28 - seqIndex * 3);
	var hour = 8 + ((seqIndex * 3) % 12);
	var minute = (seqIndex * 17) % 60;
	return '2026-05-' + h2Pad2(day) + ' ' + h2Pad2(hour) + ':' + h2Pad2(minute) + ':00';
}

function h2ResolveBalanceBizType(row) {
	if (row && row.bizType && H2_BALANCE_BIZ_TYPE_MAP[row.bizType]) {
		return H2_BALANCE_BIZ_TYPE_MAP[row.bizType];
	}
	if (row && row.incomeAmount != null && row.incomeAmount !== '') return H2_BALANCE_BIZ_TYPE_MAP.recharge;
	if (row && row.expenseAmount != null && row.expenseAmount !== '') return H2_BALANCE_BIZ_TYPE_MAP.refuel;
	return H2_BALANCE_BIZ_TYPE_MAP.ending;
}

function h2FormatBalanceExportAmount(v) {
	if (v == null || v === '') return '';
	return h2FormatYuanNum(v);
}

function h2ExportBalanceDrillCsv(stationName, rows) {
	var headers = ['序号', '时间', '类型', '收入(元)', '支出(元)', '余额(元)', '订单编号'];
	var csvRows = (rows || []).map(function (r, index) {
		var typeInfo = h2ResolveBalanceBizType(r);
		return [
			index + 1,
			r.changeTime || '',
			typeInfo.label,
			h2FormatBalanceExportAmount(r.incomeAmount),
			h2FormatBalanceExportAmount(r.expenseAmount),
			h2FormatBalanceExportAmount(r.balance),
			r.orderNo || ''
		];
	});
	var safeName = String(stationName || '站点').replace(/[\\/:*?"<>|]/g, '_');
	h2DownloadCsv('余额变更明细_' + safeName + '_' + new Date().getTime() + '.csv', headers, csvRows);
}

function h2NumOrZero(v) {
	var n = typeof v === 'number' ? v : parseFloat(v);
	return isNaN(n) ? 0 : n;
}

function h2FormatLedgerMoney(v) {
	if (v === null || v === undefined || v === '' || Number(v) === 0) return '—';
	return h2FormatYuanNum(v);
}

/** 原型：加氢站预付余额变更明细（联调后对接加氢站打款/余额流水接口） */
function h2BuildMockPrepaidBalanceRows(record) {
	var seed = 0;
	var code = String(record && record.id != null ? record.id : '');
	var nameKey = String((record && record.name) || '');
	var i;
	for (i = 0; i < code.length; i++) seed += code.charCodeAt(i);
	for (i = 0; i < nameKey.length; i++) seed += nameKey.charCodeAt(i);
	seed = seed % 100;
	var stationName = (record && record.name) || '—';
	var finalBalance = h2NumOrZero(record && record.prepaidBalance);
	var lineCount = Math.max(5, 6 + (seed % 4));
	var rows = [];
	var openingBalance = Math.round((42000 + seed * 520) * 100) / 100;
	if (openingBalance < 0) openingBalance = Math.abs(openingBalance) + 30000;

	rows.push({
		key: code + '-bal-0',
		stationName: stationName,
		changeTime: '2026-01-01 00:00:00',
		bizType: 'recharge',
		incomeAmount: openingBalance,
		expenseAmount: null,
		balance: openingBalance,
		orderNo: 'QC' + code + '260101'
	});

	var balance = openingBalance;
	for (i = 1; i < lineCount - 1; i++) {
		var isIncome = (seed + i) % 3 === 0;
		var incomeAmount = null;
		var expenseAmount = null;
		if (isIncome) {
			incomeAmount = Math.round((5000 + (seed + i) * 42) * 100) / 100;
			balance = Math.round((balance + incomeAmount) * 100) / 100;
		} else {
			expenseAmount = Math.round((2200 + (seed + i) * 26) * 100) / 100;
			balance = Math.round((balance - expenseAmount) * 100) / 100;
		}
		rows.push({
			key: code + '-bal-' + i,
			stationName: stationName,
			changeTime: h2BuildBalanceChangeTime(i),
			bizType: isIncome ? 'recharge' : 'refuel',
			incomeAmount: incomeAmount,
			expenseAmount: expenseAmount,
			balance: balance,
			orderNo: (isIncome ? 'DK' : 'JQ') + code + String(200 + i).padStart(5, '0')
		});
	}

	var diff = Math.round((finalBalance - balance) * 100) / 100;
	if (Math.abs(diff) < 0.01) {
		rows.push({
			key: code + '-bal-last',
			stationName: stationName,
			changeTime: '2026-06-01 23:59:59',
			bizType: 'ending',
			incomeAmount: null,
			expenseAmount: null,
			balance: finalBalance,
			orderNo: 'BZ' + code + String(900).padStart(5, '0')
		});
	} else if (diff > 0) {
		rows.push({
			key: code + '-bal-last',
			stationName: stationName,
			changeTime: '2026-06-01 18:30:00',
			bizType: 'recharge',
			incomeAmount: diff,
			expenseAmount: null,
			balance: finalBalance,
			orderNo: 'DK' + code + String(999).padStart(5, '0')
		});
	} else {
		rows.push({
			key: code + '-bal-last',
			stationName: stationName,
			changeTime: '2026-06-01 18:30:00',
			bizType: 'refuel',
			incomeAmount: null,
			expenseAmount: Math.round(Math.abs(diff) * 100) / 100,
			balance: finalBalance,
			orderNo: 'JQ' + code + String(999).padStart(5, '0')
		});
	}

	return rows;
}

function h2FormatBalanceTrendLabel(changeTime) {
	if (!changeTime) return '—';
	var text = String(changeTime).trim();
	if (text.length >= 10) return text.slice(5, 10);
	return text;
}

function h2ParseChangeTimeMs(changeTime) {
	if (!changeTime) return 0;
	var text = String(changeTime).trim();
	var ms = Date.parse(text.indexOf('T') === -1 ? text.replace(' ', 'T') : text);
	return isNaN(ms) ? 0 : ms;
}

function h2ExtractBalanceDateKey(changeTime) {
	if (!changeTime) return '';
	var text = String(changeTime).trim();
	return text.length >= 10 ? text.slice(0, 10) : text;
}

function h2FormatDateOnlyFromDate(date) {
	return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

function h2GetYesterdayDateOnly() {
	var d = new Date();
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() - 1);
	return h2FormatDateOnlyFromDate(d);
}

function h2AddMonths(dateStr, months) {
	var ms = h2ParseDateOnlyMs(dateStr);
	if (isNaN(ms)) return dateStr;
	var d = new Date(ms);
	d.setMonth(d.getMonth() + (months || 0));
	return h2FormatDateOnlyFromDate(d);
}

/** 趋势图固定展示近三个月：结束日为昨日，起始日为昨日往前推 3 个月 */
function h2ResolveBalanceTrendRange() {
	var endDate = h2GetYesterdayDateOnly();
	var startDate = h2AddMonths(endDate, -3);
	return { startDate: startDate, endDate: endDate };
}

/** 流水按日聚合为趋势点：每日取末笔余额，无流水日沿用前一日余额 */
function h2BuildBalanceTrendSeries(rows) {
	var range = h2ResolveBalanceTrendRange();
	var startDate = range.startDate;
	var endDate = range.endDate;
	var startMs = h2ParseDateOnlyMs(startDate);
	var endMs = h2ParseDateOnlyMs(endDate);
	if (!rows || !rows.length || isNaN(startMs) || isNaN(endMs)) {
		return {
			points: [],
			min: 0,
			max: 0,
			hasNegative: false,
			granularity: 'day',
			startDate: startDate,
			endDate: endDate
		};
	}
	var sorted = rows.slice().sort(function (a, b) {
		return h2ParseChangeTimeMs(a.changeTime) - h2ParseChangeTimeMs(b.changeTime);
	});
	var dayBuckets = {};
	var i;
	for (i = 0; i < sorted.length; i++) {
		var row = sorted[i];
		var dateKey = h2ExtractBalanceDateKey(row.changeTime);
		if (!dateKey) continue;
		if (!dayBuckets[dateKey]) {
			dayBuckets[dateKey] = row;
		} else if (h2ParseChangeTimeMs(row.changeTime) >= h2ParseChangeTimeMs(dayBuckets[dateKey].changeTime)) {
			dayBuckets[dateKey] = row;
		}
	}
	var seedBalance = null;
	for (i = sorted.length - 1; i >= 0; i--) {
		var seedKey = h2ExtractBalanceDateKey(sorted[i].changeTime);
		if (seedKey && h2ParseDateOnlyMs(seedKey) < startMs) {
			seedBalance = h2NumOrZero(sorted[i].balance);
			break;
		}
	}
	var points = [];
	var lastBalance = seedBalance;
	var cursor = startDate;
	var guard = 0;
	while (guard < 4000) {
		guard += 1;
		var cursorMs = h2ParseDateOnlyMs(cursor);
		if (isNaN(cursorMs) || cursorMs > endMs) break;
		if (dayBuckets[cursor]) {
			lastBalance = h2NumOrZero(dayBuckets[cursor].balance);
		}
		if (lastBalance != null) {
			points.push({
				key: 'day-' + cursor,
				label: h2FormatBalanceTrendLabel(cursor + ' 00:00:00'),
				fullTime: cursor,
				balance: lastBalance
			});
		}
		if (cursor === endDate) break;
		cursor = h2AddDays(cursor, 1);
	}
	if (!points.length) {
		return {
			points: [],
			min: 0,
			max: 0,
			hasNegative: false,
			granularity: 'day',
			startDate: startDate,
			endDate: endDate
		};
	}
	var min = points[0].balance;
	var max = points[0].balance;
	var hasNegative = false;
	for (i = 0; i < points.length; i++) {
		if (points[i].balance < min) min = points[i].balance;
		if (points[i].balance > max) max = points[i].balance;
		if (points[i].balance < 0) hasNegative = true;
	}
	var pad = Math.max((max - min) * 0.12, max === min ? Math.abs(max) * 0.1 || 500 : 0);
	if (hasNegative && min > 0) min = 0;
	return {
		points: points,
		min: min - pad,
		max: max + pad,
		hasNegative: hasNegative,
		granularity: 'day',
		startDate: startDate,
		endDate: endDate
	};
}

function H2BalanceTrendChart(props) {
	var series = props.series || {};
	var points = series.points || [];
	var hoverState = React.useState(null);
	var hoverIndex = hoverState[0];
	var setHoverIndex = hoverState[1];
	if (!points.length) {
		return React.createElement('div', { className: 'h2-balance-trend-empty' }, '暂无趋势数据');
	}
	var W = 820;
	var H = 220;
	var PL = 56;
	var PR = 20;
	var PT = 18;
	var PB = 36;
	var chartW = W - PL - PR;
	var chartH = H - PT - PB;
	var min = series.min;
	var max = series.max;
	var range = max - min || 1;
	var coords = points.map(function (p, idx) {
		var x = PL + (points.length === 1 ? chartW / 2 : (idx / (points.length - 1)) * chartW);
		var y = PT + chartH - ((p.balance - min) / range) * chartH;
		return { x: x, y: y, label: p.label, balance: p.balance, fullTime: p.fullTime, key: p.key };
	});
	var linePath = coords.map(function (c, i) {
		return (i === 0 ? 'M' : 'L') + c.x.toFixed(1) + ' ' + c.y.toFixed(1);
	}).join(' ');
	var areaPath = linePath
		+ ' L' + coords[coords.length - 1].x.toFixed(1) + ' ' + (PT + chartH)
		+ ' L' + coords[0].x.toFixed(1) + ' ' + (PT + chartH)
		+ ' Z';
	var zeroY = null;
	if (min < 0 && max > 0) {
		zeroY = PT + chartH - ((0 - min) / range) * chartH;
	}
	var yTicks = [
		{ value: max, y: PT },
		{ value: min + range / 2, y: PT + chartH / 2 },
		{ value: min, y: PT + chartH }
	];
	var xLabels = [
		{ x: coords[0].x, label: coords[0].label },
		{ x: coords[coords.length - 1].x, label: coords[coords.length - 1].label }
	];
	var pickNearestIndex = function (mouseX) {
		var nearest = 0;
		var minDist = Infinity;
		var j;
		for (j = 0; j < coords.length; j++) {
			var dist = Math.abs(coords[j].x - mouseX);
			if (dist < minDist) {
				minDist = dist;
				nearest = j;
			}
		}
		return nearest;
	};
	var handleChartMouseMove = function (e) {
		var rect = e.currentTarget.getBoundingClientRect();
		if (!rect.width) return;
		var mouseX = ((e.clientX - rect.left) / rect.width) * W;
		if (mouseX < PL - 8 || mouseX > W - PR + 8) {
			setHoverIndex(null);
			return;
		}
		setHoverIndex(pickNearestIndex(mouseX));
	};
	var active = hoverIndex != null && coords[hoverIndex] ? coords[hoverIndex] : null;
	var tooltipNode = active
		? React.createElement('div', {
			className: 'h2-balance-trend-tooltip',
			style: {
				left: (active.x / W * 100) + '%',
				top: (active.y / H * 100) + '%'
			},
			role: 'tooltip'
		},
			React.createElement('div', { className: 'h2-balance-trend-tooltip__date' }, active.fullTime || '—'),
			React.createElement('div', {
				className: 'h2-balance-trend-tooltip__balance' + (active.balance < 0 ? ' h2-balance-trend-tooltip__balance--negative' : '')
			}, h2FormatYuanSymbol(active.balance, { keepZero: true }))
		)
		: null;

	return React.createElement('div', {
		className: 'h2-balance-trend-chart-wrap',
		onMouseLeave: function () { setHoverIndex(null); }
	},
		tooltipNode,
		React.createElement('svg', {
			className: 'h2-balance-trend-svg',
			viewBox: '0 0 ' + W + ' ' + H,
			role: 'img',
			'aria-label': '预付余额趋势图',
			onMouseMove: handleChartMouseMove,
			onMouseLeave: function () { setHoverIndex(null); }
		},
			React.createElement('defs', null,
				React.createElement('linearGradient', { id: 'h2BalanceTrendArea', x1: '0', y1: '0', x2: '0', y2: '1' },
					React.createElement('stop', { offset: '0%', stopColor: '#10b981', stopOpacity: '0.28' }),
					React.createElement('stop', { offset: '100%', stopColor: '#10b981', stopOpacity: '0.02' })
				)
			),
			yTicks.map(function (tick, idx) {
				return React.createElement('g', { key: 'yt-' + idx },
					React.createElement('line', {
						x1: PL, y1: tick.y, x2: W - PR, y2: tick.y,
						stroke: '#f1f5f9', strokeWidth: 1
					}),
					React.createElement('text', {
						x: PL - 8, y: tick.y + 4,
						textAnchor: 'end', fontSize: 10, fill: '#94a3b8', fontFamily: 'ui-sans-serif, system-ui, sans-serif'
					}, h2FormatYuanNum(tick.value))
				);
			}),
			zeroY != null
				? React.createElement('line', {
					x1: PL, y1: zeroY, x2: W - PR, y2: zeroY,
					stroke: '#fca5a5', strokeWidth: 1, strokeDasharray: '4 4'
				})
				: null,
			active
				? React.createElement('line', {
					x1: active.x, y1: PT, x2: active.x, y2: PT + chartH,
					stroke: '#a7f3d0', strokeWidth: 1, strokeDasharray: '3 3'
				})
				: null,
			React.createElement('path', { d: areaPath, fill: 'url(#h2BalanceTrendArea)' }),
			React.createElement('path', {
				d: linePath, fill: 'none', stroke: '#10b981', strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round'
			}),
			coords.map(function (c, idx) {
				var negative = c.balance < 0;
				var isActive = hoverIndex === idx;
				return React.createElement('g', { key: c.key },
					React.createElement('circle', {
						className: 'h2-balance-trend-hit',
						cx: c.x, cy: c.y, r: 10,
						onMouseEnter: function () { setHoverIndex(idx); }
					}),
					React.createElement('circle', {
						className: isActive ? 'h2-balance-trend-point--active' : '',
						cx: c.x, cy: c.y, r: isActive ? 5.5 : 4,
						fill: '#fff',
						stroke: negative ? '#dc2626' : '#10b981',
						strokeWidth: isActive ? 2.5 : 2,
						pointerEvents: 'none'
					})
				);
			}),
			xLabels.map(function (item, idx) {
				return React.createElement('text', {
					key: 'xl-' + idx,
					x: item.x,
					y: H - 10,
					textAnchor: idx === 0 ? 'start' : 'end',
					fontSize: 10,
					fill: '#64748b',
					fontFamily: 'ui-sans-serif, system-ui, sans-serif'
				}, item.label);
			})
		)
	);
}

function h2BuildRefuelOrderNo(record, index) {
	if (record && record.orderNo) return record.orderNo;
	var idPart = String((record && record.id) || '').replace(/\D/g, '') || String(index + 1);
	return 'JQ' + idPart.padStart(4, '0') + String(100 + index);
}

/** 对账状态（对齐车辆氢费明细） */
var H2_RECONCILE_RECONCILED = 'reconciled';
var H2_RECONCILE_PENDING = 'pending';
var H2_PAYMENT_STATUS_PAID = 'paid';
var H2_PAYMENT_STATUS_UNPAID = 'unpaid';

function h2ParseDateOnlyMs(dateStr) {
	if (!dateStr) return NaN;
	var parts = String(dateStr).trim().split('-');
	if (parts.length < 3) return NaN;
	var y = parseInt(parts[0], 10);
	var m = parseInt(parts[1], 10);
	var d = parseInt(parts[2], 10);
	if (isNaN(y) || isNaN(m) || isNaN(d)) return NaN;
	return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

function h2AddDays(dateStr, days) {
	var ms = h2ParseDateOnlyMs(dateStr);
	if (isNaN(ms)) return dateStr;
	var d = new Date(ms + (days || 0) * 86400000);
	return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function h2FormatOperateDateOnly() {
	return h2OperateTimestamp().slice(0, 10);
}

/** 台账加氢记录 Mock（字段对齐车辆氢费明细，costTotal 对应成本总价） */
function h2BuildLedgerReconciledRecords() {
	return H2_MOCK_REFUEL_RECORDS.map(function (r, index) {
		var isReconciled = index < 9;
		return {
			id: r.id,
			stationName: r.stationName,
			hydrogenTime: r.hydrogenTime,
			plateNo: r.plateNo,
			customerName: r.customerName,
			hydrogenKg: r.hydrogenKg,
			costUnitPrice: r.costUnitPrice,
			costTotal: r.costAmount,
			settlementStatus: r.settlementStatus,
			orderNo: h2BuildRefuelOrderNo(r, index),
			reconcileStatus: isReconciled ? H2_RECONCILE_RECONCILED : H2_RECONCILE_PENDING,
			statementRecordId: null,
			reconcileDate: null,
			receiptDate: null,
			paymentStatus: isReconciled ? H2_PAYMENT_STATUS_UNPAID : null
		};
	});
}

function h2InitLedgerRecordsStore() {
	return h2BuildLedgerReconciledRecords();
}

function h2InitStatementRecordsStore() {
	return [];
}

function h2GetLastStatementEndDate(statementRecords, stationName) {
	var name = String(stationName || '').trim();
	var list = (statementRecords || []).filter(function (s) { return (s.stationName || '') === name; });
	if (!list.length) return null;
	var max = list[0].endDate;
	var i;
	for (i = 1; i < list.length; i++) {
		if (String(list[i].endDate || '') > String(max || '')) max = list[i].endDate;
	}
	return max || null;
}

function h2GetAvailableStatementLedgerRows(store, stationName, startDate, endDate) {
	var name = String(stationName || '').trim();
	var startMs = h2ParseDateOnlyMs(startDate);
	var endMs = h2ParseDateOnlyMs(endDate);
	if (!name || isNaN(startMs) || isNaN(endMs)) return [];
	var endInclusive = endMs + 86400000 - 1;
	return (store || []).filter(function (r) {
		if (r.reconcileStatus !== H2_RECONCILE_RECONCILED) return false;
		if (r.statementRecordId) return false;
		if ((r.stationName || '') !== name) return false;
		var t = h2ParseDateTimeMs(r.hydrogenTime);
		if (isNaN(t)) return false;
		return t >= startMs && t <= endInclusive;
	}).slice().sort(function (a, b) {
		return String(b.hydrogenTime || '').localeCompare(String(a.hydrogenTime || ''));
	});
}

function h2GetStatementRecordsByStation(statementRecords, stationName) {
	var name = String(stationName || '').trim();
	return (statementRecords || []).filter(function (s) { return (s.stationName || '') === name; }).slice().sort(function (a, b) {
		return String(b.reconcileDate || '').localeCompare(String(a.reconcileDate || ''));
	});
}

function h2GetLedgerRowsByIds(store, ids) {
	var idSet = {};
	var i;
	for (i = 0; i < (ids || []).length; i++) idSet[ids[i]] = true;
	return (store || []).filter(function (r) { return idSet[r.id]; }).slice().sort(function (a, b) {
		return String(b.hydrogenTime || '').localeCompare(String(a.hydrogenTime || ''));
	});
}

function h2PushStatementLedgerPatches(patches) {
	if (typeof window === 'undefined') return;
	window.H2_STATION_STATEMENT_LEDGER_UPDATES = (window.H2_STATION_STATEMENT_LEDGER_UPDATES || []).concat(patches || []);
}

function h2CalcStatementSummary(records) {
	var rows = records || [];
	var totalKg = 0;
	var totalCost = 0;
	var i;
	for (i = 0; i < rows.length; i++) {
		totalKg += rows[i].hydrogenKg || 0;
		totalCost += rows[i].costTotal || 0;
	}
	return { count: rows.length, totalKg: totalKg, totalCost: totalCost };
}

function h2ExportStatementCsv(stationName, startDate, endDate, records) {
	var headers = ['序号', '加氢时间', '车牌号', '加氢量(kg)', '成本单价(元/kg)', '成本总价(元)', '订单编号'];
	var csvRows = (records || []).map(function (r, index) {
		return [
			index + 1,
			r.hydrogenTime || '',
			r.plateNo || '',
			h2FormatKgNum(r.hydrogenKg),
			h2FormatBalanceExportAmount(r.costUnitPrice),
			h2FormatBalanceExportAmount(r.costTotal),
			r.orderNo || ''
		];
	});
	var safeName = String(stationName || '站点').replace(/[\\/:*?"<>|]/g, '_');
	var rangePart = String(startDate || '').replace(/-/g, '') + '-' + String(endDate || '').replace(/-/g, '');
	h2DownloadCsv('氢费对账单_' + safeName + '_' + rangePart + '_' + new Date().getTime() + '.csv', headers, csvRows);
}

function h2GetRefuelRecordsByStation(stationName) {
	var name = String(stationName || '').trim();
	return H2_MOCK_REFUEL_RECORDS.filter(function (r) { return r.stationName === name; }).slice().sort(function (a, b) {
		return String(b.hydrogenTime || '').localeCompare(String(a.hydrogenTime || ''));
	}).map(function (r, index) {
		return Object.assign({}, r, { orderNo: h2BuildRefuelOrderNo(r, index) });
	});
}

function h2ExportRefuelDrillCsv(stationName, records) {
	var headers = ['序号', '加氢时间', '车牌号', '客户名称', '加氢量(kg)', '成本单价(元/kg)', '成本总价(元)', '加氢单价(元/kg)', '加氢总价(元)', '承担方式', '订单编号'];
	var csvRows = (records || []).map(function (r, index) {
		return [
			index + 1,
			r.hydrogenTime || '',
			r.plateNo || '',
			r.customerName || '',
			h2FormatKgNum(r.hydrogenKg),
			h2FormatBalanceExportAmount(r.costUnitPrice),
			h2FormatBalanceExportAmount(r.costAmount),
			h2FormatBalanceExportAmount(r.customerUnitPrice),
			h2FormatBalanceExportAmount(r.customerAmount),
			h2SettlementStatusLabel(r.settlementStatus),
			r.orderNo || ''
		];
	});
	var safeName = String(stationName || '站点').replace(/[\\/:*?"<>|]/g, '_');
	h2DownloadCsv('加氢明细_' + safeName + '_' + new Date().getTime() + '.csv', headers, csvRows);
}

function h2CalcRefuelStats(stationName) {
	var records = h2GetRefuelRecordsByStation(stationName);
	var totalKg = 0;
	var i;
	for (i = 0; i < records.length; i++) totalKg += records[i].hydrogenKg || 0;
	return { count: records.length, totalKg: totalKg };
}

var H2_LINGNIU_SIGNING_COMPANY_NAMES = [
	'浙江羚牛氢能科技有限公司',
	'羚牛氢能科技（上海）有限公司',
	'羚牛氢能科技（广东）有限公司',
	'羚牛新能源运营有限公司'
];

function h2GetLingniuSigningCompanyOptions() {
	var names = H2_LINGNIU_SIGNING_COMPANY_NAMES.slice();
	if (typeof window !== 'undefined' && window.ONEOS_LESSOR_COMPANIES && window.ONEOS_LESSOR_COMPANIES.length) {
		window.ONEOS_LESSOR_COMPANIES.forEach(function (c) {
			var n = (c.legalName || '').trim();
			if (n && names.indexOf(n) < 0) names.push(n);
		});
	}
	return names.map(function (name) {
		return { value: name, label: name };
	});
}

var H2_MOCK_EXISTING_SUPPLIERS = [
	{
		id: 'sup-h2-1',
		name: '嘉兴氢能供应有限公司',
		type: '加氢站',
		city: ['浙江省', '嘉兴市'],
		address: '南湖区科技大道66号',
		region: '华东',
		dept: '能源部',
		manager: '张经理',
		remark: '嘉兴区域主力加氢站运营商',
		contactName: '李供',
		contactMobile: '13800138088',
		contactTitle: '站长',
		taxId: '91330400MA2ABCDEF1',
		invoiceAddress: '浙江省嘉兴市南湖区科技大道66号',
		invoicePhone: '0573-88886666',
		bankName: '中国工商银行嘉兴南湖支行',
		bankAccount: '6222021203001234567',
		mailingAddress: '浙江省嘉兴市南湖区科技大道66号',
		businessAddress: '浙江省嘉兴市南湖区科技大道66号',
		businessLicenseFiles: [{ uid: 'bl-1', name: '营业执照_嘉兴氢能.pdf', status: 'done' }],
		fillingLicenseFiles: [
			{ uid: 'fl-1a', name: '危化品经营许可证.pdf', status: 'done' },
			{ uid: 'fl-1b', name: '特种设备使用登记证.pdf', status: 'done' },
			{ uid: 'fl-1c', name: '消防验收合格证.pdf', status: 'done' }
		]
	},
	{
		id: 'sup-h2-2',
		name: '上海羚牛氢能科技',
		type: '加氢站',
		city: ['上海市', '上海市'],
		address: '宝山区富联路200号',
		region: '华东',
		dept: '能源部',
		manager: '王专员',
		remark: '',
		contactName: '陈氢',
		contactMobile: '13900139001',
		contactTitle: '运营主管',
		taxId: '91310100MA1XYZ7890',
		invoiceAddress: '上海市宝山区富联路200号',
		invoicePhone: '021-66886688',
		bankName: '招商银行上海宝山支行',
		bankAccount: '6214830210123456789',
		mailingAddress: '上海市宝山区富联路200号',
		businessAddress: '上海市宝山区富联路200号',
		businessLicenseFiles: [{ uid: 'bl-2', name: '营业执照_羚牛氢能.pdf', status: 'done' }],
		fillingLicenseFiles: [{ uid: 'fl-2', name: '加氢站备案证明.pdf', status: 'done' }]
	},
	{
		id: 'sup-h2-3',
		name: '苏州工业园区氢源科技',
		type: '加氢站',
		city: ['江苏省', '苏州市'],
		address: '工业园区星湖街328号',
		region: '华东',
		dept: '华东大区',
		manager: '赵经理',
		remark: '备用站点供应商',
		contactName: '钱七',
		contactMobile: '13500135005',
		contactTitle: '联系人',
		taxId: '91320500MA2SUPPLIER',
		invoiceAddress: '江苏省苏州市工业园区星湖街328号',
		invoicePhone: '0512-66668888',
		bankName: '中国银行苏州工业园区支行',
		bankAccount: '6216600100009876543',
		mailingAddress: '江苏省苏州市工业园区星湖街328号',
		businessAddress: '江苏省苏州市工业园区星湖街328号',
		businessLicenseFiles: [],
		fillingLicenseFiles: []
	},
	{
		id: 'sup-other-1',
		name: '杭州绿能备件有限公司',
		type: '备件供应商',
		city: ['浙江省', '杭州市'],
		address: '余杭区文一西路998号',
		region: '华东',
		dept: '采购部',
		manager: '孙采购',
		remark: '',
		contactName: '周备件',
		contactMobile: '13600136001',
		contactTitle: '销售',
		taxId: '91330100MA3OTHER01',
		invoiceAddress: '浙江省杭州市余杭区文一西路998号',
		invoicePhone: '0571-88880001',
		bankName: '中国建设银行杭州余杭支行',
		bankAccount: '6227000012345678901',
		mailingAddress: '浙江省杭州市余杭区文一西路998号',
		businessAddress: '浙江省杭州市余杭区文一西路998号',
		businessLicenseFiles: [],
		fillingLicenseFiles: []
	}
];

/** 可加氢站绑定的系统账号 Mock */
var H2_MOCK_SYSTEM_ACCOUNTS = [
	{ id: 'acc-h2-1', username: 'jx_h2_admin', displayName: '嘉兴站管理员', role: '加氢站管理员', mobile: '13800138001', status: '启用' },
	{ id: 'acc-h2-2', username: 'hz_lp_station', displayName: '临平站操作员', role: '加氢站管理员', mobile: '13900139002', status: '启用' },
	{ id: 'acc-h2-3', username: 'sh_bs_h2', displayName: '宝山站管理员', role: '加氢站管理员', mobile: '13700137003', status: '启用' },
	{ id: 'acc-h2-4', username: 'sz_h2_ops', displayName: '苏州备用站账号', role: '加氢站管理员', mobile: '13500135005', status: '启用' },
	{ id: 'acc-h2-5', username: 'h2_station_new', displayName: '待分配站点账号', role: '加氢站管理员', mobile: '13600136099', status: '启用' }
];

function h2FindSystemAccountById(accountId) {
	if (!accountId) return null;
	var i;
	for (i = 0; i < H2_MOCK_SYSTEM_ACCOUNTS.length; i++) {
		if (H2_MOCK_SYSTEM_ACCOUNTS[i].id === accountId) return H2_MOCK_SYSTEM_ACCOUNTS[i];
	}
	return null;
}

function h2NormalizeBindAccountIds(source) {
	if (!source) return [];
	if (source.bindAccountIds && source.bindAccountIds.length) return source.bindAccountIds.slice();
	if (source.boundAccountIds && source.boundAccountIds.length) return source.boundAccountIds.slice();
	var single = source.bindAccountId || source.boundAccountId;
	return single ? [single] : [];
}

function h2BuildBoundAccountsFromIds(ids) {
	return (ids || []).map(function (id) {
		var acc = h2FindSystemAccountById(id);
		if (!acc) return null;
		return {
			id: acc.id,
			username: acc.username,
			displayName: acc.displayName,
			role: acc.role,
			mobile: acc.mobile,
			status: acc.status
		};
	}).filter(Boolean);
}

function h2CollectUsedBindAccountMap(stations, excludeStationId) {
	var map = {};
	(stations || []).forEach(function (s) {
		if (excludeStationId != null && s.id === excludeStationId) return;
		h2NormalizeBindAccountIds(s).forEach(function (aid) {
			map[aid] = s.name || '—';
		});
	});
	return map;
}

function h2ResolveStationSystemAccounts(record) {
	if (!record) return [];
	if (record.boundAccounts && record.boundAccounts.length) return record.boundAccounts.slice();
	if (record.boundAccount && (record.boundAccount.username || record.boundAccount.displayName)) {
		return [record.boundAccount];
	}
	return h2BuildBoundAccountsFromIds(h2NormalizeBindAccountIds(record));
}

function h2ResolveStationSystemAccount(record) {
	var list = h2ResolveStationSystemAccounts(record);
	return list.length ? list[0] : null;
}

function h2RecordToEditStationForm(record) {
	if (!record) return h2CreateEmptyStationForm();
	var ids = h2NormalizeBindAccountIds(record);
	return {
		name: record.name || '',
		address: {
			region: (record.region || []).slice(),
			detail: record.addressDetail || ''
		},
		mapAddress: record.mapAddress || record.fullAddress || h2BuildFullAddress(record.region, record.addressDetail),
		latitude: h2NormalizeCoord(record.latitude),
		longitude: h2NormalizeCoord(record.longitude),
		isSigned: record.isSigned !== false,
		contractStart: record.contractStart || '',
		contractEnd: record.contractEnd || '',
		contractFiles: (record.contractFiles || []).map(function (f, i) {
			return Object.assign({}, f, { uid: f.uid || ('f-' + i), status: 'done' });
		}),
		businessStatus: record.businessStatus || '营业中',
		businessHours: record.businessHours === '—' ? '' : (record.businessHours || ''),
		contact: record.contact || '',
		mobilePhone: record.mobilePhone || record.phone || '',
		landlinePhone: record.landlinePhone || '',
		costUnitPrice: record.costUnitPrice != null ? String(record.costUnitPrice) : '',
		customerUnitPrice: record.customerUnitPrice != null ? String(record.customerUnitPrice) : '',
		prepaidBalance: record.prepaidBalance || 0,
		bindAccountMode: record.bindAccountMode || (ids.length ? 'bind' : 'none'),
		bindAccountIds: ids
	};
}

function h2CreateEmptyStationForm() {
	return {
		name: '',
		address: h2EmptyAddressValue(),
		mapAddress: '',
		latitude: null,
		longitude: null,
		isSigned: true,
		contractStart: '',
		contractEnd: '',
		contractFiles: [],
		businessStatus: '营业中',
		businessHours: '00:00-24:00',
		contact: '',
		mobilePhone: '',
		landlinePhone: '',
		costUnitPrice: '',
		customerUnitPrice: '',
		prepaidBalance: 0,
		bindAccountMode: 'none',
		bindAccountIds: []
	};
}

function h2CreateEmptySupplierForm() {
	return {
		signingCompany: undefined,
		name: '',
		city: undefined,
		address: '',
		region: '',
		dept: '',
		manager: '',
		remark: '',
		contactName: '',
		contactMobile: '',
		contactTitle: '',
		taxId: '',
		invoiceAddress: '',
		invoicePhone: '',
		bankName: '',
		bankAccount: '',
		mailingAddress: '',
		businessAddress: '',
		businessLicenseFiles: [],
		fillingLicenseFiles: []
	};
}

function h2GetRegionByProvince(province) {
	var a = String(province || '').trim();
	if (!a) return '';
	if (a === '北京市' || a === '天津市' || a === '河北省' || a === '山西省' || a === '内蒙古') return '华北';
	if (a === '上海市' || a === '江苏省' || a === '浙江省' || a === '安徽省' || a === '福建省' || a === '江西省' || a === '山东省') return '华东';
	if (a === '广东省' || a === '广西省' || a === '海南省') return '华南';
	if (a === '河南省' || a === '湖北省' || a === '湖南省') return '华中';
	if (a === '辽宁省' || a === '吉林省' || a === '黑龙江省') return '东北';
	if (a === '四川省' || a === '云南省' || a === '贵州省' || a === '重庆市') return '西南';
	if (a === '陕西省' || a === '甘肃省' || a === '青海省' || a === '宁夏' || a === '新疆') return '西北';
	return '';
}

function h2SupplierToForm(s) {
	if (!s) return h2CreateEmptySupplierForm();
	return {
		signingCompany: s.signingCompany || undefined,
		name: s.name || '',
		city: s.city ? s.city.slice() : undefined,
		address: s.address || '',
		region: s.region || '',
		dept: s.dept || '',
		manager: s.manager || '',
		remark: s.remark || '',
		contactName: s.contactName || '',
		contactMobile: s.contactMobile || '',
		contactTitle: s.contactTitle || '',
		taxId: s.taxId || '',
		invoiceAddress: s.invoiceAddress || '',
		invoicePhone: s.invoicePhone || '',
		bankName: s.bankName || '',
		bankAccount: s.bankAccount || '',
		mailingAddress: s.mailingAddress || '',
		businessAddress: s.businessAddress || s.mailingAddress || '',
		businessLicenseFiles: (s.businessLicenseFiles || []).map(function (f, i) {
			return Object.assign({}, f, { uid: f.uid || ('bl-' + i), status: 'done' });
		}),
		fillingLicenseFiles: (s.fillingLicenseFiles || []).map(function (f, i) {
			return Object.assign({}, f, { uid: f.uid || ('fl-' + i), status: 'done' });
		})
	};
}

var H2_STATION_USER_MANUAL_DOC = `# 加氢站管理 · 站点信息 — 用户使用说明书

| 项目 | 内容 |
|------|------|
| 文档版本 | v1.0 |
| 产品模块 | 加氢站管理 → 站点信息 |
| 文档类型 | **用户使用说明书** |
| 适用读者 | 加氢站运营、财务结算、平台管理员、培训与汇报人员 |
| 关联模块 | 台账数据 → 车辆氢费明细 |
| 配图目录 | 与本文件同级的 docs/ 文件夹 |

---

## 使用本说明书

本说明书用于**教会一线用户操作**站点管理模块，也可作为**项目汇报、培训宣讲**的配套材料。建议按以下顺序阅读：

1. **第二章** — 认识页面布局（5 分钟）
2. **第四章** — 新建 / 编辑 / 导入站点（15 分钟）
3. **第七章** — 生成对账单与结算（重点，20 分钟）
4. **第九章** — 汇报话术与常见问题

页面右上角可点击 **「查看使用说明书」** 随时打开本文档。

---

## 一、模块能做什么

### 1.1 一句话说明

站点信息模块是加氢站的**主数据与运营台账中心**：维护站点档案、营业与成本价，查看加氢量与预付余额，并按周期与加氢站完成**氢费对账、收票登记与付款闭环**。

### 1.2 功能地图

\`\`\`mermaid
mindmap
  root((站点信息))
    查询统计
      筛选条件
      KPI 分类卡
      列表排序分页
    主数据
      新建站点
      编辑站点
      查看详情
      批量导入
      删除站点
    运营配置
      营业状态
      成本价格
    数据分析
      加氢量下钻
      预付余额下钻
    财务结算
      生成对账单
      查看对账记录
\`\`\`

### 1.3 谁来做什么事

| 角色 | 常用功能 | 注意事项 |
|------|----------|----------|
| **平台管理员（admin）** | 新建、编辑、批量导入、删除、绑定系统账号 | 系统账号支持多选绑定 |
| **加氢站运营账号** | 编辑本站资料、营业状态、价格配置 | 编辑时**不能改**供应商与系统账号 |
| **财务 / 结算人员** | 生成对账单、登记收票、查看对账记录 | 需先在台账完成「已对账」 |

---

## 二、进入模块与页面总览

### 2.1 菜单路径

左侧导航：**加氢站管理 → 站点信息**

### 2.2 页面结构（自上而下）

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│ 面包屑：加氢站管理 > 站点信息          [查看需求说明][使用说明书] │
├─────────────────────────────────────────────────────────────┤
│ 【筛选条件】名称 | 是否签约 | 地区 | 营业状态    [重置][查询] │
├─────────────────────────────────────────────────────────────┤
│ KPI：全部 | 已签约 | 未签约 | 高频 | 低频 | 无加氢          │
├─────────────────────────────────────────────────────────────┤
│ 工具栏：[批量导入]  [新建站点]                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 站点列表（名称/签约/营业/价格/加氢量/余额/操作）          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
\`\`\`

![图 2-1 站点列表页总览示意](docs/h2-station-manual-list-page.png)

### 2.3 列表字段速查

| 列名 | 怎么用 |
|------|--------|
| 加氢站名称 | 含「已签约」标签；下方显示完整地址 |
| 合作时间 | 未签约显示为空 |
| 营业状态 / 营业时间 | 只读；在「更多 → 营业状态」修改 |
| 当前成本价格 | 元/kg；由价格配置生效时间驱动 |
| 加氢次数 / 加氢量 | **点击加氢量**可下钻明细 |
| 预付余额 | **点击余额**可下钻流水；负数标红「已欠费」 |
| 操作 | **查看** + **更多**（⋮） |

---

## 三、日常查询与 KPI 筛选

### 3.1 操作流程

\`\`\`mermaid
flowchart LR
    A[输入筛选条件] --> B[点击查询]
    B --> C[列表刷新]
    D[点击 KPI 卡] --> C
    E[点击重置] --> F[清空条件]
    F --> B
\`\`\`

### 3.2 操作步骤

1. 在「筛选条件」卡片填写一个或多个条件。
2. 点击 **查询**；列表按条件过滤，并回到第 1 页。
3. 点击 **重置** 可清空所有筛选。
4. 也可直接点击 KPI 卡片快速筛选：
   - **全部站点** — 显示所有
   - **已签约 / 未签约** — 按签约状态
   - **高频站点** — 加氢次数 ≥ 3
   - **低频站点** — 加氢次数 1～2
   - **无加氢站点** — 加氢次数 = 0

### 3.3 列表排序与分页

- 点击 **加氢次数**、**加氢量** 列表头可升序 / 降序排序。
- 底部分页默认每页 10 条，可切换 5 / 10 / 20 / 50。

---

## 四、站点主数据维护

### 4.1 整体流程

\`\`\`mermaid
flowchart TB
    subgraph 入口
        N[新建站点] --> CP[整页新建表单]
        I[批量导入] --> IM[上传模板文件]
        E[更多-编辑] --> EP[整页编辑表单]
        V[查看] --> VM[详情弹窗]
        D[更多-删除] --> DM[确认删除]
    end
    CP --> S[提交创建]
    EP --> U[保存修改]
    IM --> CI[确认导入]
\`\`\`

![图 4-1 新建/编辑整页表单示意](docs/h2-station-manual-create-page.png)

### 4.2 新建站点

**入口**：列表工具栏 → **新建站点**

整页表单分三块卡片：

#### （1）加氢站基本信息

| 字段 | 必填 | 说明 |
|------|------|------|
| 加氢站名称 | 是 | 不可与已有站点重名 |
| 省 / 市、详细地址 | 是 | 可用「地址解析」自动解析 |
| 联系人、联系电话 | 是 | 手机或固话 |
| 是否签约 | 否 | 选「签约站点」后须填合作时间与合同附件 |

#### （2）系统账号绑定

1. 选择 **绑定系统账号** 或 **暂不绑定**。
2. 若绑定：在「选择系统账号」中**多选**账号（已绑定其他站点的不可选）。
3. 下方可预览已选账号的登录名、姓名、角色、手机号。

> 绑定后，所选账号可登录系统并管理该站点。

#### （3）供应商相关信息

- **关联已有供应商** — 搜索档案绑定
- **新增供应商** — 填写主体、开票、银行账户、营业执照与其他证件

**底部操作**：

- **返回 / 取消** — 有未保存内容时会二次确认
- **提交创建** — 底部进度条达 100% 后可提交（新建页**无「重置」按钮**）

### 4.3 编辑站点

**入口**：列表操作 → **更多（⋮）→ 编辑**

编辑页与新建页**同布局整页**，但有以下差异：

| 项目 | 编辑页规则 |
|------|------------|
| 供应商信息 | **不展示**，不可修改 |
| 系统账号 | **仅 admin 可改**；加氢站账号登录时为只读展示 |
| 营业状态 | 不在此页维护，请用「更多 → 营业状态」 |
| 底部按钮 | **保存修改**（无重置） |

\`\`\`mermaid
flowchart TD
    A[打开编辑页] --> B{当前登录角色?}
    B -->|admin| C[可改基本信息 + 系统账号多选]
    B -->|加氢站账号| D[仅可改基本信息]
    D --> E[系统账号只读展示]
    C --> F[保存修改]
    D --> F
\`\`\`

### 4.4 查看站点

**入口**：列表操作 → **查看**

弹窗分四块只读信息：

1. 加氢站信息（含签约、营业时间等）
2. 系统账号（支持展示多个绑定账号）
3. 供应商信息
4. 付款信息

### 4.5 删除站点

**入口**：列表操作 → **更多 → 删除**

弹出确认框，确认后从列表移除，**不可撤销**。

### 4.6 批量导入

**入口**：列表工具栏 → **批量导入**

\`\`\`mermaid
flowchart LR
    A[下载 CSV 模板] --> B[按模板填写]
    B --> C[上传 csv/xlsx/xls]
    C --> D[系统校验预览]
    D --> E{可导入条数>0?}
    E -->|是| F[确认导入]
    E -->|否| G[修正文件重传]
\`\`\`

**注意**：

- 站点名称不能与现有台账重复
- 模板字段与新建表单一致
- 上传后查看「可导入 / 不可导入」条数与错误原因

---

## 五、运营配置

### 5.1 营业状态

**入口**：更多 → **营业状态**

\`\`\`
┌──────────────────────────────────────┐
│ 站点信息卡（名称、地址、当前状态）      │
├──────────────────────────────────────┤
│ 营业状态：[营业中][暂停营业][停止营业]  │
│ 营业时间：[全天营业][自定义时段]        │
├──────────────────────────────────────┤
│ 营业状态变更记录（历史列表）            │
│                          [取消] [保存] │
└──────────────────────────────────────┘
\`\`\`

**操作要点**：

1. 营业状态、营业时间均用**按钮组**点选（非下拉）。
2. 非「全天营业」时，必须填写开始与结束时间（HH:mm）。
3. 保存后列表「营业状态 / 营业时间」同步更新；若状态变更会写入记录表。

### 5.2 价格配置

**入口**：更多 → **价格配置**

1. 填写 **成本价格（元/kg）** 与 **生效时间**。
2. 保存后：
   - 若已到生效时间 → 列表「当前成本价格」**立即更新**
   - 若未到生效时间 → 到点后自动更新
3. 下方展示价格调整记录（操作人、调整前后价格、生效时间）。

---

## 六、数据下钻分析

### 6.1 加氢量下钻

**入口**：列表点击 **加氢量** 数字

弹窗内容：

- 统计卡：加氢次数、加氢总量（kg）、成本总价、加氢总价
- 明细表：字段对齐「车辆氢费明细」
- **导出 CSV** 按钮

### 6.2 预付余额下钻

**入口**：列表点击 **预付余额** 数字

弹窗内容：

- 当前余额（负数显示「已欠费」）
- 充值 / 车辆加氢流水明细
- **导出 CSV** 按钮

---

## 七、对账与结算（核心流程）

本流程与 **车辆氢费明细** 联动，完成站点侧付款闭环。

### 7.1 前置条件（必知）

生成对账单前，台账中须已有满足以下**全部**条件的记录：

1. 对账状态 = **已对账**（业务员已在台账点击「完成对账」）
2. **尚未**被本站点历史对账单结算过
3. 加氢时间在所选账单日期区间内
4. 加氢站名称与当前站点一致

> 对账单只展示**成本侧**字段（加氢量、成本单价、成本总价），不展示客户加氢价。

### 7.2 生成对账单 — 两阶段操作

**入口**：更多 → **生成对账单**

![图 7-1 生成对账单两阶段流程示意](docs/h2-station-manual-statement-flow.png)

\`\`\`mermaid
flowchart TD
    A[打开生成对账单] --> B[选择账单开始/结束日期]
    B --> C[查看上次对账单结束时间]
    C --> D[点击生成对账单]
    D -->|无明细| E[提示调整日期]
    D -->|有明细| F[进入结算阶段]
    F --> G[查看统计卡与成本明细表]
    G --> H[填写收票日期/金额/发票附件]
    H --> I[点击提交对账单]
    I --> J[更新余额 + 写对账历史 + 回写台账]
\`\`\`

#### 阶段一：选期生成

| 步骤 | 操作 |
|------|------|
| 1 | 选择 **账单开始日期**、**账单结束日期** |
| 2 | 参考「上次对账单结束时间」（无历史显示「暂无」） |
| 3 | 点击 **生成对账单** |
| 4 | 成功后进入阶段二，**日期锁定不可改** |

#### 阶段二：结算提交

**统计卡**（明细表上方）：

| 指标 | 含义 |
|------|------|
| 加氢次数 | 本账单包含的记录笔数 |
| 加氢总量 | kg 合计 |
| 成本总金额 | 成本总价合计 |

**结算表单**（必填）：

| 字段 | 规则 |
|------|------|
| 结算后加氢站预付款余额 | **只读**，= 当前余额 − 成本总金额 |
| 收票日期 | 必填，与收票金额同一行 |
| 收票金额 | 必填，带 ￥ 前缀；默认等于成本总金额 |
| 发票附件 | 必填，支持上传 |

点击 **提交对账单** 后系统将：

1. 写入对账历史（供后续查询）
2. 扣减站点预付余额
3. 标记台账记录已结算（防重复入账）
4. 回写车辆氢费明细：对账日期、收票日期、加氢站付款状态 → **已付款**

\`\`\`mermaid
sequenceDiagram
    participant 业务 as 台账业务员
    participant 财务 as 财务操作人
    participant 站点 as 站点信息
    participant 台账 as 车辆氢费明细

    业务->>台账: 完成对账 → 已对账
    财务->>站点: 更多 → 生成对账单
    站点->>台账: 拉取已对账且未结算记录
    财务->>站点: 填写收票信息并提交
    站点->>站点: 更新预付余额
    站点->>台账: 回写已付款
\`\`\`

### 7.3 查看对账记录

**入口**：更多 → **查看对账记录**

历史列表字段：对账日期、对账人、账单区间、加氢次数、加氢金额、对账后余额、操作。

点击 **查看明细** 可看到：

- 账单区间与统计三卡
- 收票时间、收票金额
- 发票附件下载
- 成本明细表

---

## 八、操作列「更多」菜单速查

| 菜单项 | 作用 |
|--------|------|
| 编辑 | 整页编辑站点主数据 |
| 营业状态 | 维护营业状态与营业时间 |
| 价格配置 | 设置成本价与生效时间 |
| 生成对账单 | 两阶段对账结算 |
| 查看对账记录 | 历史对账单与明细 |
| 删除 | 删除站点（不可恢复） |

---

## 九、汇报与培训话术要点

向领导或客户汇报时，可围绕 **「一个中心、三条主线」** 组织：

**一个中心**：站点全生命周期台账（档案 → 运营 → 结算）

**三条主线**：

1. **主数据线** — 新建 / 导入 / 编辑，保证站点档案完整准确
2. **运营线** — 营业状态、成本价格、加氢量与余额下钻，支撑日常经营分析
3. **结算线** — 台账已对账 → 站点生成对账单 → 收票登记 → 余额扣减 → 台账已付款，形成闭环

**可量化成果表述示例**：

- 支持按 KPI（高频/低频/无加氢）快速识别运营薄弱站点
- 对账单两阶段设计，避免选错账期；提交后自动更新余额并防重复结算
- 多账号绑定 + 角色权限，满足平台管理与站点自治并存

---

## 十、常见问题

| 问题 | 解答 |
|------|------|
| 生成对账单提示无记录？ | 检查台账是否「已对账」、日期区间是否正确、是否已被历史对账单结算 |
| 编辑时看不到供应商？ | 编辑页 intentionally 不展示供应商，需在供应商模块或新建时维护 |
| 加氢站账号改不了系统账号？ | 仅 admin 可修改绑定；加氢站账号只能查看 |
| 预付余额为负还能提交吗？ | 可以；系统标「已欠费」，提醒后续充值 |
| 批量导入失败？ | 检查名称重复、营业状态枚举、日期格式；建议用 CSV UTF-8 |

---

## 十一、快速检查清单

培训验收时可按此清单实操一遍：

- [ ] 用筛选 + KPI 找到目标站点
- [ ] 新建一个站点（含供应商 + 多账号绑定）
- [ ] 用加氢站角色编辑，确认账号只读
- [ ] 用 admin 编辑，调整系统账号绑定
- [ ] 配置营业状态与成本价格
- [ ] 下钻加氢量与预付余额并导出 CSV
- [ ] 完成一次「生成对账单 → 提交」全流程
- [ ] 在「查看对账记录」中核对明细与发票信息

---

**文档结束**
`;

var H2_STATION_REQUIREMENT_DOC = `# 加氢站管理 · 站点信息 — 产品需求说明（PRD）

| 项目 | 内容 |
|------|------|
| 文档版本 | v1.0 |
| 产品模块 | 加氢站管理 → 站点信息 |
| 文档类型 | 产品需求说明 |
| 适用读者 | 研发、测试、产品、项目 |
| 关联模块 | 台账数据 → 车辆氢费明细 |

---

## 一、为什么做这件事

### 1.1 业务背景

加氢站是氢费成本结算的关键节点。运营侧需要维护站点主数据（签约、营业、成本价、预付余额），并在财务周期内按站点与加氢站完成对账、收票与付款闭环。

### 1.2 本期目标

建设 Web 端「站点信息」页面，支撑：

- 站点台账的查询、新建、编辑、查看、删除与批量导入
- 营业状态、成本价格、预付余额等运营配置
- **按站点生成氢费对账单 → 填写收票信息 → 提交结算**，并与「车辆氢费明细」联动回写

### 1.3 用户角色

| 角色 | 典型诉求 |
|------|----------|
| **加氢站运营** | 维护站点资料、营业与价格；查看加氢量与余额 |
| **财务/结算** | 按周期生成对账单、登记收票、完成站点付款闭环 |
| **管理员** | 批量导入站点、删除无效站点 |

---

## 二、页面整体结构

用户进入「加氢站管理 → 站点信息」后，页面自上而下为：

1. **筛选区** — 名称、签约、地区、营业状态
2. **KPI 分类** — 全部 / 高频 / 低频 / 无加氢；已签约快捷筛选
3. **站点列表** — 主数据 + 运营指标 + 操作列
4. **弹窗/抽屉** — 查看、编辑、营业状态、价格配置、对账单、对账记录等

\`\`\`mermaid
flowchart TB
    subgraph 列表页
        A[筛选 / KPI] --> B[站点列表]
        B --> C[查看站点]
        B --> D[编辑 / 删除]
        B --> E[更多菜单]
    end
    E --> F[营业状态]
    E --> G[价格配置]
    E --> H[生成对账单]
    E --> I[查看对账记录]
    B --> J[加氢量下钻]
    B --> K[预付余额下钻]
\`\`\`

---

## 三、列表与 KPI 规则

### 3.1 列表字段

| 字段 | 说明 |
|------|------|
| 加氢站名称 | 含签约标签；名称下一行展示省市区+详细地址 |
| 合作时间 | 未签约可空 |
| 营业状态 / 营业时间 | 列表只读；在「更多-营业状态」维护 |
| 当前成本价格 | 元/kg；受价格配置生效时间驱动 |
| 加氢次数 / 加氢量 | 加氢量可点击下钻；列表头支持排序 |
| 预付余额 | 可点击下钻流水；负值标红并显示「已欠费」 |
| 联系方式 | 联系人 + 电话 |
| 操作 | 查看 + 更多 |

### 3.2 KPI 划分逻辑

| 分类 | 规则 |
|------|------|
| 高频站点 | 加氢次数 ≥ 3 |
| 低频站点 | 加氢次数 1～2 |
| 无加氢站点 | 加氢次数 = 0 |

筛选或 KPI 切换后列表回到第 1 页；默认分页 10 条，可选 5/10/20/50。

---

## 四、站点主数据（新建 / 编辑 / 查看）

### 4.1 新建站点

同页内嵌视图，包含：

- **基本信息**：名称、地址、营业时间、签约、联系方式
- **系统账号绑定**：可选绑定，绑定后该账号可登录管理对应站点
- **供应商信息**：新建或关联已有供应商、付款信息

### 4.2 编辑 / 查看

| 模式 | 交互 |
|------|------|
| 编辑 | 整页（与新建同结构）；不含供应商、不含营业状态；系统账号仅 admin 可改，支持多选 |
| 查看 | 弹窗分块：加氢站信息、系统账号、供应商信息、付款信息 |

### 4.3 批量导入

- 下载 CSV 模板 → 上传 .csv / .xlsx / .xls
- 站点名称不可与现有台账重复；解析预览后确认导入

---

## 五、运营配置

### 5.1 营业状态

- 卡片式弹窗：营业状态、营业时间均为**按钮组**
- 非「全天营业」须配置开始/结束时段
- 保存时校验时段完整性；下方展示状态变更记录

### 5.2 价格配置

- 配置**成本价格（元/kg）**与**生效时间**
- 到达生效时间后自动刷新列表「当前成本价格」
- 下方展示价格调整记录（操作人、调整前后价格、生效时间）

### 5.3 加氢量 / 预付余额下钻

**加氢量下钻**：统计卡（次数、加氢量、成本总价、加氢总价）+ 明细表 + 导出 CSV，字段对齐车辆氢费明细。

**预付余额下钻**：充值/车辆加氢流水 + 导出 CSV；余额为负显示已欠费。

---

## 六、核心流程：生成对账单（重点）

本模块与「车辆氢费明细」配合完成**站点侧氢费结算闭环**。研发需重点理解以下逻辑。

### 6.1 数据来源

对账单明细取自 **车辆氢费明细** 中同时满足以下条件的记录：

1. 对账状态 = **已对账**（业务侧已在台账完成「完成对账」）
2. **尚未**被本站点历史对账单结算过（未绑定 statementRecordId）
3. 加氢时间落在用户选择的 **[账单开始日期, 账单结束日期]** 内
4. 加氢站名称与当前操作站点一致

> 对账单明细**仅展示成本字段**（加氢量、成本单价、成本总价等），不展示加氢单价、加氢总价。

### 6.2 两阶段交互

\`\`\`mermaid
flowchart TD
    A[打开「生成对账单」] --> B[选择账单开始/结束日期]
    B --> C[展示上次对账单结束时间]
    C --> D{点击「生成对账单」}
    D -->|无符合条件记录| E[提示调整日期]
    D -->|有记录| F[生成对账记录草稿]
    F --> G[展示统计：加氢次数/总量/成本总金额]
    G --> H[展示成本明细表]
    H --> I[填写结算信息]
    I --> J{点击「提交对账单」}
    J -->|校验失败| K[提示必填项]
    J -->|校验通过| L[完成闭环]
\`\`\`

**阶段一 · 选期生成**

- 日期区下方展示：**上次对账单结束时间 YYYY-MM-DD**（无历史则「暂无」）
- 默认开始日期建议 = 上次结束日 + 1 天
- 点击「生成对账单」后进入阶段二，日期锁定不可改

**阶段二 · 结算提交**

统计卡（明细表上方）：

| 指标 | 说明 |
|------|------|
| 加氢次数 | 本账单包含的已对账记录笔数 |
| 加氢总量 | kg 合计 |
| 成本总金额 | 成本总价合计 |

明细表下方**必填**结算项：

| 字段 | 规则 |
|------|------|
| 结算后加氢站预付款余额 | **只读**，= 当前预付余额 − 成本总金额；不足为负值并标「已欠费」 |
| 收票日期 | 必填，与收票金额同一行展示 |
| 收票金额 | 必填，输入框带 ￥ 前缀；默认填入成本总金额 |
| 发票附件 | 必填，支持上传 |

### 6.3 提交后的系统行为（关键）

提交成功后需**原子性**完成：

1. **写入对账历史**（供「查看对账记录」查询）
2. **扣减站点预付余额** = 结算后余额
3. **标记台账记录已结算**（绑定 statementRecordId，避免重复入账）
4. **回写车辆氢费明细**（原型通过 window 补丁 / API 同步）：

| 车辆氢费明细字段 | 回写值 |
|------------------|--------|
| 对账日期 | 操作完成时间，格式 YYYY-MM-DD HH:MM |
| 收票日期 | 操作完成日期，格式 YYYY-MM-DD |
| 加氢站付款状态 | 已付款 |

\`\`\`mermaid
sequenceDiagram
    participant 台账 as 车辆氢费明细
    participant 站点 as 站点信息
    participant 财务 as 结算操作人

    台账->>台账: 业务员「完成对账」→ 已对账
    财务->>站点: 更多 → 生成对账单
    站点->>台账: 拉取已对账且未结算记录
    财务->>站点: 生成对账记录 + 填收票信息
    财务->>站点: 提交对账单
    站点->>站点: 更新预付余额 / 写对账历史
    站点->>台账: 回写对账日期、收票日期、已付款
\`\`\`

---

## 七、查看对账记录

入口：列表操作列 → 更多 → **查看对账记录**

### 7.1 历史列表字段

| 列 | 说明 |
|----|------|
| 对账日期 | 提交对账单的操作时间 |
| 对账人 | 当前操作人 |
| 账单开始/结束日期 | 本次账单覆盖区间 |
| 加氢次数 | 本单笔数 |
| 加氢金额 | 成本总金额 |
| 对账后加氢站预付款余额 | 结算后余额；负值标「已欠费」 |
| 操作 | 查看明细 |

### 7.2 查看明细

弹窗展示：

- 账单区间、加氢统计三卡
- **收票时间、收票金额**（同一信息区）
- **发票附件下载**
- 成本明细表（同生成对账单字段范围）

---

## 八、校验与异常

| 场景 | 处理 |
|------|------|
| 日期未填 / 开始晚于结束 | 阻止生成，提示用户 |
| 区间内无已对账未结算记录 | 阻止生成，提示调整日期 |
| 收票日期/金额/附件未填 | 阻止提交 |
| 收票金额 ≤ 0 | 阻止提交 |
| 预付余额结算后为负 | 允许提交，列表与明细标「已欠费」 |

---

## 九、研发实现要点（给开发）

1. **对账单幂等**：同一笔已对账记录只能进入一次成功提交的对账单（statementRecordId 约束）。
2. **上次结束时间**：取该站点已成功提交对账单的最大 endDate 字段。
3. **余额计算**：balanceAfter = prepaidBalance - sum(costTotal)，提交后写回站点主数据。
4. **跨模块同步**：生产环境应对接统一台账服务；原型使用 H2_STATION_STATEMENT_LEDGER_UPDATES / H2_VEHICLE_LEDGER_API 模拟回写。
5. **明细字段范围**：对账相关弹窗统一不展示客户侧加氢单价/总价，避免与成本结算混淆。
6. **权限**（后续迭代）：生成/提交对账单建议限制财务或站点管理员角色。

---

## 十、本期不做

- 对账单审批流、ERP 自动过账
- 发票 OCR 识别与验真
- 多币种 / 多税率
- 按组织架构的复杂数据权限（本期按功能原型描述）

---

**文档结束**
`;

function h2StationParsePrdInlineText(text) {
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

function h2StationIsPrdTableRow(line) {
	return /^\|.+\|$/.test(String(line || '').trim());
}

function h2StationIsPrdTableSep(line) {
	return /^\|[\s\-:|]+\|$/.test(String(line || '').trim());
}

function h2StationRenderPrdTableRow(line, rowKey, isHeader) {
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
			}, h2StationParsePrdInlineText(cell));
		})
	);
}

function h2StationRenderPrdMarkdown(markdown) {
	var lines = String(markdown || '').split(/\r?\n/);
	var nodes = [];
	var i = 0;
	var inCode = false;
	var codeBuf = [];

	while (i < lines.length) {
		var line = lines[i];
		var trimmed = String(line || '').trim();

		if (trimmed.indexOf('```') === 0) {
			if (inCode) {
				nodes.push(React.createElement('pre', {
					key: 'code-' + i,
					style: {
						margin: '12px 0',
						padding: '12px 14px',
						background: '#f6f8fa',
						border: '1px solid #e5e7eb',
						borderRadius: 8,
						fontSize: 12,
						lineHeight: 1.6,
						overflow: 'auto',
						color: '#334155',
						whiteSpace: 'pre-wrap'
					}
				}, codeBuf.join('\n')));
				codeBuf = [];
				inCode = false;
			} else {
				inCode = true;
			}
			i += 1;
			continue;
		}

		if (inCode) {
			codeBuf.push(line);
			i += 1;
			continue;
		}

		if (trimmed === '---') {
			nodes.push(React.createElement('hr', { key: 'hr-' + i, style: { border: 'none', borderTop: '1px solid #e8ecf0', margin: '20px 0' } }));
			i += 1;
			continue;
		}

		if (h2StationIsPrdTableRow(trimmed)) {
			var tableLines = [];
			while (i < lines.length && h2StationIsPrdTableRow(String(lines[i]).trim())) {
				tableLines.push(String(lines[i]).trim());
				i += 1;
			}
			var bodyRows = [];
			var ti;
			for (ti = 0; ti < tableLines.length; ti++) {
				if (h2StationIsPrdTableSep(tableLines[ti])) continue;
				bodyRows.push(h2StationRenderPrdTableRow(tableLines[ti], 'tr-' + i + '-' + ti, ti === 0));
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

		if (!trimmed) {
			i += 1;
			continue;
		}

		if (trimmed.indexOf('# ') === 0) {
			nodes.push(React.createElement('h1', { key: 'h1-' + i, style: { fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', lineHeight: 1.35 } }, h2StationParsePrdInlineText(trimmed.slice(2).trim())));
			i += 1;
			continue;
		}

		if (trimmed.indexOf('## ') === 0) {
			nodes.push(React.createElement('h2', { key: 'h2-' + i, style: { fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '24px 0 12px', paddingBottom: 6, borderBottom: '2px solid #e0f2fe', lineHeight: 1.4 } }, h2StationParsePrdInlineText(trimmed.slice(3).trim())));
			i += 1;
			continue;
		}

		if (trimmed.indexOf('### ') === 0) {
			nodes.push(React.createElement('h3', { key: 'h3-' + i, style: { fontSize: 14, fontWeight: 600, color: '#334155', margin: '16px 0 8px', lineHeight: 1.45 } }, h2StationParsePrdInlineText(trimmed.slice(4).trim())));
			i += 1;
			continue;
		}

		if (/^!\[([^\]]*)\]\(([^)]+)\)$/.test(trimmed)) {
			var imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
			var imgAlt = imgMatch[1] || '配图';
			var imgSrc = imgMatch[2] || '';
			nodes.push(React.createElement('figure', {
				key: 'img-' + i,
				style: { margin: '16px 0 20px', textAlign: 'center' }
			},
				React.createElement('img', {
					src: imgSrc,
					alt: imgAlt,
					style: {
						maxWidth: '100%',
						borderRadius: 10,
						border: '1px solid #e5e7eb',
						boxShadow: '0 4px 12px rgba(15,23,42,0.06)'
					},
					onError: function (e) {
						if (e && e.target) {
							e.target.style.display = 'none';
						}
					}
				}),
				React.createElement('figcaption', {
					style: { fontSize: 12, color: '#94a3b8', marginTop: 8, lineHeight: 1.5 }
				}, imgAlt)
			));
			i += 1;
			continue;
		}

		if (trimmed === '**文档结束**') {
			nodes.push(React.createElement('div', { key: 'end-' + i, style: { marginTop: 24, paddingTop: 16, borderTop: '1px dashed #e2e8f0', color: '#94a3b8', fontSize: 13, textAlign: 'center' } }, '— 文档结束 —'));
			i += 1;
			continue;
		}

		if (/^\d+\.\s/.test(trimmed)) {
			nodes.push(React.createElement('div', { key: 'ol-' + i, style: { fontSize: 13, color: '#475569', lineHeight: 1.75, margin: '6px 0 6px 4px', paddingLeft: 4 } }, h2StationParsePrdInlineText(trimmed)));
			i += 1;
			continue;
		}

		if (trimmed.indexOf('- ') === 0) {
			nodes.push(React.createElement('div', { key: 'ul-' + i, style: { display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.75, margin: '4px 0 4px 2px' } },
				React.createElement('span', { style: { color: '#1677ff', flexShrink: 0 } }, '•'),
				React.createElement('span', { style: { flex: 1 } }, h2StationParsePrdInlineText(trimmed.slice(2).trim()))
			));
			i += 1;
			continue;
		}

		if (trimmed.indexOf('> ') === 0) {
			nodes.push(React.createElement('div', { key: 'quote-' + i, style: { margin: '8px 0', padding: '8px 12px', borderLeft: '3px solid #c4b5fd', background: '#faf5ff', borderRadius: '0 8px 8px 0', fontSize: 13, color: '#5b21b6', lineHeight: 1.65 } }, h2StationParsePrdInlineText(trimmed.slice(2).trim())));
			i += 1;
			continue;
		}

		nodes.push(React.createElement('p', { key: 'p-' + i, style: { fontSize: 13, color: '#475569', lineHeight: 1.75, margin: '6px 0' } }, h2StationParsePrdInlineText(trimmed)));
		i += 1;
	}

	return nodes;
}

function renderH2StationRequirementDocPanel() {
	return React.createElement('div', { className: 'h2-req-doc-panel', style: { padding: '4px 4px 16px' } },
		h2StationRenderPrdMarkdown(H2_STATION_REQUIREMENT_DOC)
	);
}

function renderH2StationUserManualDocPanel() {
	return React.createElement('div', { className: 'h2-req-doc-panel h2-user-manual-panel', style: { padding: '4px 4px 16px' } },
		h2StationRenderPrdMarkdown(H2_STATION_USER_MANUAL_DOC)
	);
}

var H2_PRIMARY_BTN_STYLE = {
	borderRadius: 8,
	fontWeight: 600,
	background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
	border: 'none'
};

var H2_REQ_BTN_STYLE = {
	borderRadius: 8,
	border: '1px solid #cbd5e1',
	fontWeight: 600,
	display: 'inline-flex',
	alignItems: 'center',
	boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
	color: '#475569'
};

function h2ResolveRecordSupplierMode(record) {
	if (!record) return 'link';
	if (record.supplierMode === 'none') return 'none';
	if (record.supplierMode === 'link' || record.linkedSupplierId) return 'link';
	if (record.supplierMode === 'new') return 'new';
	var supplier = h2ResolveStationSupplier(record);
	if (supplier && (supplier.name || '').trim()) return 'new';
	return 'none';
}

function h2SupplierModeLabel(mode) {
	if (mode === 'link') return '关联已有供应商';
	if (mode === 'new') return '新增供应商';
	if (mode === 'none') return '不关联供应商';
	return '—';
}

function h2CreateFormDirty(station, supplier, supplierMode, linkedSupplierId) {
	if ((station.name || '').trim()) return true;
	if ((station.contact || '').trim()) return true;
	if ((station.mobilePhone || '').trim() || (station.landlinePhone || '').trim()) return true;
	if (station.address && ((station.address.region && station.address.region.length) || (station.address.detail || '').trim())) return true;
	if ((station.mapAddress || '').trim()) return true;
	if (station.latitude != null || station.longitude != null) return true;
	if (supplierMode !== 'none') {
		if ((supplier.signingCompany || '').trim()) return true;
		if ((supplier.name || '').trim()) return true;
		if (supplierMode === 'link' && linkedSupplierId) return true;
		if ((supplier.businessLicenseFiles || []).length || (supplier.fillingLicenseFiles || []).length) return true;
	}
	if ((station.contractFiles || []).length) return true;
	if (supplierMode !== 'none' && station.bindAccountMode === 'bind' && station.bindAccountIds && station.bindAccountIds.length) return true;
	return false;
}

function h2EditFormDirty(station, originForm) {
	if (!originForm) return h2CreateFormDirty(station, h2CreateEmptySupplierForm(), 'new', undefined);
	var keys = ['name', 'contact', 'mobilePhone', 'landlinePhone', 'businessHours', 'isSigned', 'contractStart', 'contractEnd', 'bindAccountMode', 'mapAddress', 'latitude', 'longitude'];
	var i;
	for (i = 0; i < keys.length; i++) {
		if (String(station[keys[i]] || '') !== String(originForm[keys[i]] || '')) return true;
	}
	if (JSON.stringify(station.address || {}) !== JSON.stringify(originForm.address || {})) return true;
	if (JSON.stringify(station.bindAccountIds || []) !== JSON.stringify(originForm.bindAccountIds || [])) return true;
	if ((station.contractFiles || []).length !== (originForm.contractFiles || []).length) return true;
	return false;
}

function h2EditFormProgress(station) {
	var checks = [
		!!(station.name || '').trim(),
		station.address && station.address.region && station.address.region.length >= 2 && !!(station.address.detail || '').trim(),
		!!(station.contact || '').trim(),
		!!((station.mobilePhone || '').trim() || (station.landlinePhone || '').trim())
	];
	var done = checks.filter(Boolean).length;
	return Math.round((done / checks.length) * 100);
}

function h2CreateFormProgress(station, supplier, supplierMode, linkedSupplierId) {
	var checks = [
		!!(station.name || '').trim(),
		station.address && station.address.region && station.address.region.length >= 2 && !!(station.address.detail || '').trim(),
		!!(station.contact || '').trim(),
		!!((station.mobilePhone || '').trim() || (station.landlinePhone || '').trim()),
		supplierMode === 'none' ? true : (supplierMode === 'link' ? !!linkedSupplierId : !!(supplier.name || '').trim())
	];
	var done = checks.filter(Boolean).length;
	return Math.round((done / checks.length) * 100);
}

function h2CardTitleWithStep(step, text) {
	return React.createElement('span', { className: 'h2-card-title-bar h2-card-title-bar--step' },
		React.createElement('span', { className: 'h2-card-step-badge', 'aria-hidden': true }, step),
		React.createElement('span', { className: 'h2-card-title-text' }, text)
	);
}

function h2MaskMobile(mobile) {
	if (!mobile) return '—';
	var s = String(mobile);
	if (s.length >= 11) return s.slice(0, 3) + '****' + s.slice(-4);
	return s;
}

function h2AccountRoleTagColor(role) {
	var text = String(role || '');
	if (text.indexOf('管理') >= 0) return 'success';
	if (text.indexOf('运营') >= 0) return 'processing';
	return 'default';
}

function h2BuildStationCreateView(ctx) {
	var antd = window.antd;
	var Card = antd.Card;
	var Button = antd.Button;
	var Input = antd.Input;
	var Select = antd.Select;
	var Cascader = antd.Cascader;
	var Radio = antd.Radio;
	var DatePicker = antd.DatePicker;
	var Upload = antd.Upload;
	var Form = antd.Form;
	var Row = antd.Row;
	var Col = antd.Col;
	var Tag = antd.Tag;
	var Divider = antd.Divider;
	var dayjs = window.dayjs;

	var inputCls = 'h2-create-input';
	var pageMode = ctx.pageMode || 'create';
	var isEdit = pageMode === 'edit';
	var showSupplier = ctx.showSupplier !== false;
	var accountEditable = ctx.accountEditable !== false;
	var stationAddr = ctx.station.address || { region: [], detail: '' };
	var bindAccountIds = ctx.station.bindAccountIds || [];
	var showAccountBind = ctx.supplierMode !== 'none';

	var formItem = function (label, required, node, extra) {
		return React.createElement(Form.Item, {
			label: required ? React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), label) : label,
			extra: extra
		}, node);
	};

	var H2_CREATE_GUTTER = [24, 20];

	var formRow = function () {
		return React.createElement.apply(null, [Row, { gutter: H2_CREATE_GUTTER, align: 'stretch' }].concat(Array.prototype.slice.call(arguments)));
	};

	var col24 = function (node) {
		return React.createElement(Col, { xs: 24, span: 24 }, node);
	};

	var col16 = function (node) {
		return React.createElement(Col, { xs: 24, lg: 16 }, node);
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

	var gridSubsection = function (text) {
		return formRow(col24(React.createElement('div', { className: 'h2-create-subsection-title' }, text)));
	};

	var renderAccountBindLayout = function () {
		var removeAccount = function (accountId) {
			var nextIds = bindAccountIds.filter(function (id) { return id !== accountId; });
			ctx.updateStation({
				bindAccountMode: nextIds.length ? 'bind' : 'none',
				bindAccountIds: nextIds
			});
		};
		return React.createElement('div', { className: 'h2-account-bind-layout' },
			React.createElement('div', { className: 'h2-account-bind-side' },
				formItem('绑定系统账号', false, React.createElement(Select, {
					className: inputCls,
					mode: 'multiple',
					showSearch: true,
					placeholder: '请选择要绑定的系统账号',
					value: bindAccountIds,
					options: systemAccountOptions,
					optionFilterProp: 'label',
					maxTagCount: 'responsive',
					onChange: function (v) {
						var ids = v || [];
						ctx.updateStation({ bindAccountMode: ids.length ? 'bind' : 'none', bindAccountIds: ids });
					},
					dropdownStyle: { borderRadius: 8 }
				})),
				React.createElement('p', { className: 'h2-account-bind-side__hint' }, '可选择多个账号，绑定后可使用对应账号登录系统'),
				React.createElement('div', { className: 'h2-account-bind-selected-row' },
					React.createElement('span', { className: 'h2-account-bind-selected-label' }, '已选账号'),
					React.createElement(Tag, { color: 'success', className: 'h2-account-bind-selected-count' }, selectedSystemAccounts.length + ' 个')
				)
			),
			React.createElement('div', { className: 'h2-account-bind-preview-area' },
				React.createElement('div', { className: 'h2-account-bind-preview-title' }, '账号预览'),
				selectedSystemAccounts.length
					? React.createElement('div', { className: 'h2-account-bind-preview-cards' },
						selectedSystemAccounts.map(function (acc) {
							return React.createElement('div', { key: acc.id, className: 'h2-account-bind-user-card' },
								React.createElement('button', {
									type: 'button',
									className: 'h2-account-bind-user-card__remove',
									'aria-label': '移除账号 ' + (acc.displayName || acc.username || ''),
									onClick: function () { removeAccount(acc.id); }
								}, '×'),
								React.createElement('span', { className: 'h2-account-bind-user-card__avatar', 'aria-hidden': true }, H2_ICONS.user),
								React.createElement('div', { className: 'h2-account-bind-user-card__body' },
									React.createElement('div', { className: 'h2-account-bind-user-card__name-row' },
										React.createElement('span', { className: 'h2-account-bind-user-card__name' }, acc.displayName || acc.username || '—'),
										acc.role
											? React.createElement(Tag, { color: h2AccountRoleTagColor(acc.role), className: 'h2-account-bind-user-card__role' }, acc.role)
											: null
									),
									React.createElement('div', { className: 'h2-account-bind-user-card__meta' }, '账号：' + (acc.username || '—')),
									React.createElement('div', { className: 'h2-account-bind-user-card__meta' }, '手机号：' + h2MaskMobile(acc.mobile))
								)
							);
						})
					)
					: React.createElement('div', { className: 'h2-account-bind-preview-empty' }, '请在左侧选择系统账号，预览将显示在此处')
			)
		);
	};

	var uploadDragger = function (fileList, onChange, btnText, hint, disabled, options) {
		options = options || {};
		var uploadProps = {
			className: 'h2-create-upload' + (disabled ? ' h2-create-upload--readonly' : ''),
			multiple: options.multiple !== false,
			disabled: disabled,
			fileList: fileList,
			beforeUpload: function () { return false; },
			onChange: onChange,
			showUploadList: true
		};
		if (options.maxCount != null) uploadProps.maxCount = options.maxCount;
		return React.createElement(Upload.Dragger, uploadProps,
			React.createElement('p', { className: 'ant-upload-drag-icon', style: { marginBottom: 8 } }, H2_ICONS.upload),
			React.createElement('p', { style: { margin: 0, fontWeight: 600, color: '#334155' } }, btnText),
			React.createElement('p', { className: 'h2-create-upload-hint' }, hint)
		);
	};

	var supplierOptions = H2_MOCK_EXISTING_SUPPLIERS.map(function (s) {
		return {
			value: s.id,
			label: s.name + (s.type ? '（' + s.type + '）' : '') + (s.city && s.city.length ? ' · ' + s.city.join('-') : '')
		};
	});
	var lingniuSigningCompanyOptions = h2GetLingniuSigningCompanyOptions();

	var supplierReadonlyInput = function (value, placeholder) {
		return React.createElement(Input, {
			className: inputCls + ' h2-create-readonly-input',
			value: value != null && value !== '' ? String(value) : '',
			placeholder: placeholder || '—',
			disabled: true
		});
	};

	var renderSigningCompanySelect = function (supplier) {
		return formItem('签约公司', true, React.createElement(Select, {
			className: inputCls,
			showSearch: true,
			placeholder: '请选择羚牛签约主体',
			value: supplier.signingCompany,
			options: lingniuSigningCompanyOptions,
			optionFilterProp: 'label',
			onChange: function (v) { ctx.updateSupplier({ signingCompany: v }); },
			dropdownStyle: { borderRadius: 8 }
		}));
	};

	var renderSupplierDetailFields = function (opts) {
		opts = opts || {};
		var supplier = opts.supplier || ctx.supplier;
		var readonly = !!opts.readonly;
		var licensesEditable = !!opts.licensesEditable;
		var licensesReadonly = readonly && !licensesEditable;
		var rows = [
			gridSubsection('主体信息')
		];
		if (!readonly) {
			rows.push(formRow(col16(renderSigningCompanySelect(supplier))));
		}
		rows.push(
			formRow(
				col8(formItem('供应商名称', true, readonly
					? supplierReadonlyInput(supplier.name)
					: React.createElement(Input, {
						className: inputCls,
						value: supplier.name,
						placeholder: '请输入供应商名称',
						onChange: function (e) { ctx.updateSupplier({ name: e.target.value }); }
					}))),
				col8(formItem('省市', false, supplierReadonlyInput(
					supplier.city && supplier.city.length ? h2FormatRegion(supplier.city) : '',
					'自动从地址解析'
				))),
				col8(formItem('详细地址', false, supplierReadonlyInput(supplier.address, '自动从地址解析')))
			)
		);
		if (!readonly) {
			rows.push(formRow(
				col24(formItem('地址解析', false, React.createElement(AddressPasteInput, {
					inputClassName: inputCls,
					onParsed: function (parsed) {
						ctx.updateSupplier({
							city: parsed.region,
							address: parsed.detail
						});
					}
				})))
			));
		}
		rows.push(
			gridSubsection('开票信息'),
			formRow(
				col8(formItem('纳税人识别号', false, readonly
					? supplierReadonlyInput(supplier.taxId)
					: React.createElement(Input, {
						className: inputCls,
						value: supplier.taxId,
						placeholder: '请输入纳税人识别号',
						onChange: function (e) { ctx.updateSupplier({ taxId: e.target.value }); }
					}))),
				col8(formItem('注册电话', false, readonly
					? supplierReadonlyInput(supplier.invoicePhone)
					: React.createElement(Input, {
						className: inputCls,
						value: supplier.invoicePhone,
						placeholder: '手机号或固定电话',
						type: 'tel',
						onChange: function (e) { ctx.updateSupplier({ invoicePhone: e.target.value }); }
					}))),
				col8(formItem('注册地址', false, readonly
					? supplierReadonlyInput(supplier.invoiceAddress)
					: React.createElement(Input, {
						className: inputCls,
						value: supplier.invoiceAddress,
						placeholder: '请输入注册地址',
						onChange: function (e) { ctx.updateSupplier({ invoiceAddress: e.target.value }); }
					})))
			),
			gridSubsection('银行账户'),
			formRow(
				col8(formItem('开户行', false, readonly
					? supplierReadonlyInput(supplier.bankName)
					: React.createElement(Input, {
						className: inputCls,
						value: supplier.bankName,
						placeholder: '请输入开户行',
						onChange: function (e) { ctx.updateSupplier({ bankName: e.target.value }); }
					}))),
				col16(formItem('银行账号', false, readonly
					? supplierReadonlyInput(supplier.bankAccount)
					: React.createElement(Input, {
						className: inputCls,
						value: supplier.bankAccount,
						placeholder: '请输入银行账号',
						onChange: function (e) { ctx.updateSupplier({ bankAccount: e.target.value }); }
					})))
			),
			gridSubsection('资质证照'),
			formRow(
				col12(formItem('营业执照', false, uploadDragger(
					supplier.businessLicenseFiles,
					function (info) {
						ctx.updateSupplier({ businessLicenseFiles: info.fileList });
						if (licensesReadonly) return;
						if (info.file && info.file.status !== 'removed') {
							h2TriggerBusinessLicenseOcr(info.file, ctx);
						}
					},
					licensesReadonly ? '已关联证照' : '点击或拖拽上传',
					licensesReadonly ? '仅展示，不可修改' : '支持 OCR 识别，上传后自动反写名称、税号、通讯地址',
					licensesReadonly,
					{ multiple: false }
				))),
				col12(formItem('其他证件', false, uploadDragger(
					supplier.fillingLicenseFiles,
					licensesReadonly ? function () {} : function (info) { ctx.updateSupplier({ fillingLicenseFiles: info.fileList }); },
					licensesReadonly ? '已关联证照' : '点击或拖拽上传',
					licensesReadonly ? '仅展示，不可修改' : '支持多文件上传，不限数量，PDF、图片',
					licensesReadonly,
					{ multiple: true }
				)))
			)
		);
		return gridBlock.apply(null, rows);
	};

	var renderSupplierLinkForm = function () {
		return React.createElement(React.Fragment, null,
			gridBlock(
				formRow(
					col16(formItem('选择供应商', true, React.createElement(Select, {
						className: inputCls,
						showSearch: true,
						placeholder: '请搜索并选择供应商',
						value: ctx.linkedSupplierId,
						options: supplierOptions,
						optionFilterProp: 'label',
						onChange: ctx.handleLinkSupplierChange,
						dropdownStyle: { borderRadius: 8 }
					}))),
					col8(renderSigningCompanySelect(ctx.supplier))
				)
			),
			ctx.linkedSupplierId
				? React.createElement('div', { className: 'h2-supplier-linked-preview' },
					renderSupplierDetailFields({ readonly: true, licensesEditable: true, supplier: ctx.supplier }))
				: null
		);
	};

	var renderSupplierNewForm = function () {
		return renderSupplierDetailFields({ readonly: false });
	};

	var renderSupplierNonePanel = function () {
		return gridBlock(
			formRow(
				col24(React.createElement('p', { className: 'h2-supplier-none-hint' }, '当前不关联供应商，无需填写或关联任何供应商信息。'))
			)
		);
	};

	var renderSupplierTabs = function () {
		var tabs = [
			{ key: 'link', label: '关联已有' },
			{ key: 'new', label: '新建供应商' },
			{ key: 'none', label: '不关联供应商' }
		];
		return React.createElement('div', { className: 'h2-supplier-tabs' },
			React.createElement('div', { className: 'h2-supplier-tabs__nav', role: 'tablist', 'aria-label': '供应商关联方式' },
				tabs.map(function (tab) {
					var active = ctx.supplierMode === tab.key;
					return React.createElement('button', {
						type: 'button',
						key: tab.key,
						role: 'tab',
						className: 'h2-supplier-tabs__item' + (active ? ' h2-supplier-tabs__item--active' : ''),
						'aria-selected': active,
						onClick: function () {
							if (ctx.supplierMode !== tab.key) {
								ctx.handleSupplierModeChange({ target: { value: tab.key } });
							}
						}
					}, tab.label);
				})
			),
			React.createElement('div', { className: 'h2-supplier-tabs__panel', role: 'tabpanel' },
				ctx.supplierMode === 'link'
					? renderSupplierLinkForm()
					: ctx.supplierMode === 'new'
						? renderSupplierNewForm()
						: renderSupplierNonePanel()
			)
		);
	};

	var usedBindAccountMap = ctx.usedBindAccountMap || {};
	var systemAccountOptions = H2_MOCK_SYSTEM_ACCOUNTS.filter(function (a) {
		return !usedBindAccountMap[a.id];
	}).map(function (a) {
		return {
			value: a.id,
			label: '「' + (a.username || '—') + '」「' + (a.role || '—') + '」'
		};
	});
	var selectedSystemAccounts = h2BuildBoundAccountsFromIds(bindAccountIds);

	var contractDateRangeValue = null;
	if (dayjs && ctx.station.contractStart && ctx.station.contractEnd) {
		var ds = dayjs(ctx.station.contractStart);
		var de = dayjs(ctx.station.contractEnd);
		if (ds.isValid() && de.isValid()) contractDateRangeValue = [ds, de];
	}

	var mobilePhoneVal = (ctx.station.mobilePhone || '').trim();
	var landlinePhoneVal = (ctx.station.landlinePhone || '').trim();
	var mobilePhoneError = mobilePhoneVal && !h2IsMobilePhone(mobilePhoneVal)
		? h2GetMobilePhoneInputTip(mobilePhoneVal)
		: '';
	var landlinePhoneError = landlinePhoneVal && !h2IsLandlinePhone(landlinePhoneVal)
		? h2GetLandlinePhoneInputTip(landlinePhoneVal)
		: '';

	var renderContractDates = function () {
		if (dayjs && DatePicker && DatePicker.RangePicker) {
			return React.createElement(DatePicker.RangePicker, {
				className: inputCls,
				style: { width: '100%' },
				format: 'YYYY-MM-DD',
				placeholder: ['开始日期', '结束日期'],
				value: contractDateRangeValue,
				onChange: function (dates) {
					if (!dates || dates.length < 2) {
						ctx.updateStation({ contractStart: '', contractEnd: '' });
						return;
					}
					ctx.updateStation({
						contractStart: dayjs(dates[0]).format('YYYY-MM-DD'),
						contractEnd: dayjs(dates[1]).format('YYYY-MM-DD')
					});
				}
			});
		}
		return React.createElement('div', { className: 'h2-contract-dates' },
			React.createElement(Input, {
				className: inputCls,
				type: 'date',
				value: ctx.station.contractStart || '',
				style: { flex: 1, minWidth: 0 },
				onChange: function (e) { ctx.updateStation({ contractStart: e.target.value }); }
			}),
			React.createElement('span', { className: 'h2-contract-dates-sep' }, '至'),
			React.createElement(Input, {
				className: inputCls,
				type: 'date',
				value: ctx.station.contractEnd || '',
				style: { flex: 1, minWidth: 0 },
				onChange: function (e) { ctx.updateStation({ contractEnd: e.target.value }); }
			})
		);
	};

	return React.createElement(React.Fragment, null,
		React.createElement('div', { className: 'h2-create-shell' },
			React.createElement('div', { className: 'h2-create-back-only' },
				React.createElement(Button, {
					className: 'h2-create-back-btn',
					type: 'default',
					icon: H2_ICONS.back,
					onClick: ctx.onCancel,
					disabled: ctx.submitting
				}, '返回')
			),

			React.createElement(Form, { layout: 'vertical', requiredMark: false, className: 'h2-create-form h2-create-form--list h2-create-form--grid' },
				React.createElement(Card, {
					className: 'h2-create-card',
					id: 'h2-create-station-card',
					title: h2CardTitleWithStep(1, '加氢站基本信息'),
					bordered: false
				},
					gridBlock(
						formRow(
							col8(formItem('加氢站名称', true, React.createElement(Input, {
								className: inputCls,
								value: ctx.station.name,
								placeholder: '请输入加氢站名称',
								maxLength: 80,
								onChange: function (e) { ctx.updateStation({ name: e.target.value }); },
								onBlur: ctx.syncSupplierFromStation
							}))),
							col8(formItem('省市', true, React.createElement(Input, {
								className: inputCls + ' h2-create-readonly-input',
								value: stationAddr.region && stationAddr.region.length ? h2FormatRegion(stationAddr.region) : '',
								placeholder: '自动从地址解析',
								disabled: true
							}))),
							col8(formItem('通讯地址', true, React.createElement(Input, {
								className: inputCls + ' h2-create-readonly-input',
								value: stationAddr.detail || '',
								placeholder: '自动从地址解析',
								disabled: true
							})))
						),
						formRow(
							col24(formItem('地址解析', false, React.createElement(AddressPasteInput, {
								inputClassName: inputCls,
								onParsed: function (parsed) {
									var fullAddr = h2BuildFullAddress(parsed.region, parsed.detail);
									ctx.updateStation({
										address: { region: parsed.region, detail: parsed.detail },
										mapAddress: fullAddr
									});
									if (ctx.supplierMode === 'new' && parsed.region && parsed.region.length >= 2) {
										ctx.updateSupplier({
											city: parsed.region.slice(),
											address: parsed.detail || ''
										});
									}
								}
							})))
						),
						formRow(
							col24(formItem('地图定位', false, React.createElement(StationMapPicker, {
								inputClassName: inputCls,
								address: ctx.station.mapAddress || h2BuildFullAddress(stationAddr.region, stationAddr.detail) || '',
								latitude: ctx.station.latitude,
								longitude: ctx.station.longitude,
								onAddressChange: function (addr) { ctx.updateStation({ mapAddress: addr }); },
								onPositionChange: function (lat, lng) {
									ctx.updateStation({ latitude: lat, longitude: lng });
								}
							})))
						),
						formRow(
							col8(formItem('联系人', true, React.createElement(Input, {
								className: inputCls,
								value: ctx.station.contact,
								placeholder: '请输入联系人',
								onChange: function (e) { ctx.updateStation({ contact: e.target.value }); },
								onBlur: ctx.syncSupplierFromStation
							}))),
							col8(formItem('手机号', false, React.createElement(Input, {
								className: inputCls,
								value: ctx.station.mobilePhone || '',
								placeholder: '请输入手机号码',
								type: 'tel',
								autoComplete: 'tel',
								maxLength: 11,
								status: mobilePhoneError ? 'error' : undefined,
								onChange: function (e) {
									ctx.updateStation({ mobilePhone: h2FilterMobilePhoneInput(e.target.value) });
								},
								onBlur: ctx.syncSupplierFromStation
							}), mobilePhoneError)),
							col8(formItem('固定电话', false, React.createElement(Input, {
								className: inputCls,
								value: ctx.station.landlinePhone || '',
								placeholder: '请输入固定电话',
								type: 'tel',
								autoComplete: 'tel',
								status: landlinePhoneError ? 'error' : undefined,
								onChange: function (e) {
									ctx.updateStation({ landlinePhone: h2FilterLandlinePhoneInput(e.target.value) });
								},
								onBlur: ctx.syncSupplierFromStation
							}), landlinePhoneError))
						),
						formRow(
							col8(formItem('站点类型', false, React.createElement('div', { className: 'h2-station-type-field' },
								h2RenderOptionButtonGroup([
									{ label: '签约站点', value: 'signed', tone: 'allday' },
									{ label: '普通站点', value: 'unsigned', tone: 'custom' }
								], ctx.station.isSigned ? 'signed' : 'unsigned', function (v) {
									var signed = v === 'signed';
									ctx.updateStation({
										isSigned: signed,
										contractStart: signed ? ctx.station.contractStart : '',
										contractEnd: signed ? ctx.station.contractEnd : ''
									});
								}, { ariaLabel: '站点类型' })
							))),
							ctx.station.isSigned
								? col16(formItem('合作时间', true, renderContractDates()))
								: null
						),
						ctx.station.isSigned
							? formRow(
								col24(formItem('合同附件', false, React.createElement('div', { className: 'h2-contract-panel' },
									React.createElement(ContractFilesUpload, {
										fileList: ctx.station.contractFiles,
										onChange: function (info) { ctx.updateStation({ contractFiles: info.fileList }); }
									})
								)))
							)
							: null
					)
				),

				showSupplier ? React.createElement(Card, {
					className: 'h2-create-card',
					id: 'h2-create-supplier-card',
					title: h2CardTitleWithStep(2, '供应商相关信息'),
					bordered: false
				},
					renderSupplierTabs()
				) : null,

				showSupplier && showAccountBind ? React.createElement(Card, {
					className: 'h2-create-card',
					id: 'h2-create-account-card',
					title: h2CardTitleWithStep(3, '系统账号绑定'),
					bordered: false
				},
					gridBlock(
						!accountEditable && isEdit
							? formRow(
								col24(React.createElement('div', { className: 'h2-account-bind-readonly-wrap' },
									React.createElement('p', { className: 'h2-account-bind-hint', style: { marginBottom: 10 } },
										'当前为加氢站账号登录，系统账号绑定仅管理员（admin）可修改。'
									),
									selectedSystemAccounts.length
										? selectedSystemAccounts.map(function (acc) {
											return React.createElement('div', { key: acc.id, className: 'h2-account-bind-readonly-item' },
												React.createElement('div', { className: 'h2-account-bind-readonly-item__name' }, acc.displayName || acc.username || '—'),
												React.createElement('div', { className: 'h2-account-bind-readonly-item__meta' },
													(acc.username || '—') + ' · ' + (acc.role || '—') + ' · ' + (acc.mobile || '—')
												)
											);
										})
										: React.createElement('p', { className: 'h2-account-bind-hint' }, '暂未绑定系统账号')
								))
							)
							: null,
						accountEditable
							? formRow(col24(renderAccountBindLayout()))
							: null
					)
				) : null
			)
		),

		React.createElement('footer', { className: 'h2-create-footer' },
			React.createElement('div', { className: 'h2-create-footer-inner' },
				React.createElement('div', { className: 'h2-create-footer-actions' },
					React.createElement(Button, {
						onClick: ctx.onCancel,
						disabled: ctx.submitting,
						style: { borderRadius: 8 },
						'aria-label': '取消并返回列表'
					}, '取消'),
					ctx.showReset ? React.createElement(Button, {
						onClick: ctx.onReset,
						disabled: ctx.submitting,
						style: { borderRadius: 8 },
						'aria-label': '重置表单'
					}, '重置') : null,
					React.createElement(Button, {
						type: 'primary',
						style: H2_PRIMARY_BTN_STYLE,
						onClick: ctx.onSubmit,
						loading: ctx.submitting,
						'aria-label': isEdit ? '保存编辑加氢站点' : '提交新建加氢站点'
					}, ctx.submitLabel || (isEdit ? '保存修改' : '提交创建'))
				)
			)
		)
	);
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
	var Space = antd.Space;
	var Image = antd.Image;
	var Modal = antd.Modal;
	var Form = antd.Form;
	var Switch = antd.Switch;
	var Upload = antd.Upload;
	var Tag = antd.Tag;
	var Tooltip = antd.Tooltip;
	var Divider = antd.Divider;
	var Alert = antd.Alert;
	var Dropdown = antd.Dropdown;
	var Checkbox = antd.Checkbox;
	var Descriptions = antd.Descriptions;
	var Cascader = antd.Cascader;
	var Radio = antd.Radio;
	var DatePicker = antd.DatePicker;
	var message = antd.message;
	var dayjs = window.dayjs;

	var listState = useState(function () {
		return h2ApplyDueCostPricesToList(H2_MOCK_STATIONS.slice()).records;
	});
	var listData = listState[0];
	var setListData = listState[1];

	var categoryTabState = useState('all');
	var categoryTab = categoryTabState[0];
	var setCategoryTab = categoryTabState[1];

	var listFiltersState = useState(h2EmptyListFilters());
	var listFilters = listFiltersState[0];
	var setListFilters = listFiltersState[1];

	var appliedFiltersState = useState(h2EmptyListFilters());
	var appliedFilters = appliedFiltersState[0];
	var setAppliedFilters = appliedFiltersState[1];

	var deleteModalState = useState({ open: false, record: null });
	var deleteModal = deleteModalState[0];
	var setDeleteModal = deleteModalState[1];

	var viewModalState = useState({ open: false, record: null });
	var viewModal = viewModalState[0];
	var setViewModal = viewModalState[1];

	var filePreviewModalState = useState({ open: false, url: '', name: '', type: 'image' });
	var filePreviewModal = filePreviewModalState[0];
	var setFilePreviewModal = filePreviewModalState[1];

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	var userManualModalState = useState(false);
	var userManualModalOpen = userManualModalState[0];
	var setUserManualModalOpen = userManualModalState[1];

	var importModalState = useState(false);
	var importModalOpen = importModalState[0];
	var setImportModalOpen = importModalState[1];

	var importFileListState = useState([]);
	var importFileList = importFileListState[0];
	var setImportFileList = importFileListState[1];

	var importPreviewState = useState(null);
	var importPreview = importPreviewState[0];
	var setImportPreview = importPreviewState[1];

	var pageState = useState(1);
	var page = pageState[0];
	var setPage = pageState[1];

	var pageSizeState = useState(10);
	var pageSize = pageSizeState[0];
	var setPageSize = pageSizeState[1];

	var refuelSortState = useState({ key: null, order: null });
	var refuelSort = refuelSortState[0];
	var setRefuelSort = refuelSortState[1];

	var businessModalState = useState({ open: false, record: null, businessStatus: '营业中', businessHours: '', originBusinessStatus: '营业中', statusLogs: [] });
	var businessModal = businessModalState[0];
	var setBusinessModal = businessModalState[1];

	var priceModalState = useState({
		open: false,
		record: null,
		priceConfigs: [],
		priceLogs: [],
		priceFormVisible: false,
		editingConfigId: null,
		priceType: 'fixed',
		customerScope: 'all',
		customerId: null,
		customerName: null,
		selectedCustomerIds: [],
		tierCustomerPickerOpen: false,
		costUnitPrice: '',
		effectiveTime: '',
		tierRules: [],
		tierResetDay: 1
	});
	var priceModal = priceModalState[0];
	var setPriceModal = priceModalState[1];

	var balanceAlertModalState = useState({ open: false, record: null, threshold: '' });
	var balanceAlertModal = balanceAlertModalState[0];
	var setBalanceAlertModal = balanceAlertModalState[1];

	var globalBalanceAlertModalState = useState({ open: false, threshold: '' });
	var globalBalanceAlertModal = globalBalanceAlertModalState[0];
	var setGlobalBalanceAlertModal = globalBalanceAlertModalState[1];

	var rechargeModalState = useState({ open: false, lines: [] });
	var rechargeModal = rechargeModalState[0];
	var setRechargeModal = rechargeModalState[1];

	var alertStationModalState = useState({ open: false, type: '', title: '', stations: [] });
	var alertStationModal = alertStationModalState[0];
	var setAlertStationModal = alertStationModalState[1];

	var refuelModalState = useState({ open: false, station: null, records: [] });
	var refuelModal = refuelModalState[0];
	var setRefuelModal = refuelModalState[1];

	var ledgerStoreState = useState(function () { return h2InitLedgerRecordsStore(); });
	var ledgerStore = ledgerStoreState[0];
	var setLedgerStore = ledgerStoreState[1];

	var statementRecordsState = useState(function () { return h2InitStatementRecordsStore(); });
	var statementRecords = statementRecordsState[0];
	var setStatementRecords = statementRecordsState[1];

	var statementModalState = useState({
		open: false,
		record: null,
		startDate: '',
		endDate: '',
		phase: 'select',
		draftRows: [],
		balanceAfterSettlement: 0,
		receiptDate: '',
		receiptAmount: '',
		invoiceFiles: []
	});
	var statementModal = statementModalState[0];
	var setStatementModal = statementModalState[1];

	var statementHistoryModalState = useState({ open: false, record: null });
	var statementHistoryModal = statementHistoryModalState[0];
	var setStatementHistoryModal = statementHistoryModalState[1];

	var statementDetailModalState = useState({ open: false, statementRecord: null, detailRows: [] });
	var statementDetailModal = statementDetailModalState[0];
	var setStatementDetailModal = statementDetailModalState[1];

	var prepaidBalanceDrillState = useState({ open: false, stationName: '', endingBalance: 0, rows: [] });
	var prepaidBalanceDrill = prepaidBalanceDrillState[0];
	var setPrepaidBalanceDrill = prepaidBalanceDrillState[1];

	var subViewState = useState('list');
	var subView = subViewState[0];
	var setSubView = subViewState[1];

	var createStationState = useState(h2CreateEmptyStationForm());
	var createStation = createStationState[0];
	var setCreateStation = createStationState[1];

	var createSupplierModeState = useState('link');
	var createSupplierMode = createSupplierModeState[0];
	var setCreateSupplierMode = createSupplierModeState[1];

	var createLinkedSupplierIdState = useState(undefined);
	var createLinkedSupplierId = createLinkedSupplierIdState[0];
	var setCreateLinkedSupplierId = createLinkedSupplierIdState[1];

	var createSupplierState = useState(h2CreateEmptySupplierForm());
	var createSupplier = createSupplierState[0];
	var setCreateSupplier = createSupplierState[1];

	var createSubmittingState = useState(false);
	var createSubmitting = createSubmittingState[0];
	var setCreateSubmitting = createSubmittingState[1];

	var editStationState = useState(h2CreateEmptyStationForm());
	var editStation = editStationState[0];
	var setEditStation = editStationState[1];

	var editRecordState = useState(null);
	var editRecord = editRecordState[0];
	var setEditRecord = editRecordState[1];

	var editOriginFormState = useState(null);
	var editOriginForm = editOriginFormState[0];
	var setEditOriginForm = editOriginFormState[1];

	var editSubmittingState = useState(false);
	var editSubmitting = editSubmittingState[0];
	var setEditSubmitting = editSubmittingState[1];

	var editSupplierModeState = useState('link');
	var editSupplierMode = editSupplierModeState[0];
	var setEditSupplierMode = editSupplierModeState[1];

	var editLinkedSupplierIdState = useState(undefined);
	var editLinkedSupplierId = editLinkedSupplierIdState[0];
	var setEditLinkedSupplierId = editLinkedSupplierIdState[1];

	var editSupplierState = useState(h2CreateEmptySupplierForm());
	var editSupplier = editSupplierState[0];
	var setEditSupplier = editSupplierState[1];

	var isAdminUser = h2IsAdminUser();

	var createSupplierReadonly = createSupplierMode === 'link' && !!createLinkedSupplierId;

	var existingNameMap = useMemo(function () {
		var map = {};
		listData.forEach(function (r) {
			if (r.name) map[String(r.name).trim()] = true;
		});
		return map;
	}, [listData]);

	var categoryCounts = useMemo(function () {
		var counts = { all: listData.length, balanceAlert: 0, arrears: 0, none: 0 };
		listData.forEach(function (r) {
			if (h2IsArrearsStation(r)) counts.arrears += 1;
			else if (h2IsBalanceAlertStation(r)) counts.balanceAlert += 1;
			var stats = h2CalcRefuelStats(r.name);
			if (h2DeriveFrequencyByRefuelCount(stats.count) === 'none') counts.none += 1;
		});
		return counts;
	}, [listData]);

	var signedStats = useMemo(function () {
		var signed = 0;
		listData.forEach(function (r) { if (r.isSigned) signed += 1; });
		return { signed: signed, unsigned: listData.length - signed };
	}, [listData]);

	var filteredList = useMemo(function () {
		var list = listData.slice();
		if (categoryTab !== 'all') {
			list = list.filter(function (r) {
				if (categoryTab === 'balanceAlert') return h2IsBalanceAlertStation(r);
				if (categoryTab === 'arrears') return h2IsArrearsStation(r);
				if (categoryTab === 'none') {
					var stats = h2CalcRefuelStats(r.name);
					return h2DeriveFrequencyByRefuelCount(stats.count) === 'none';
				}
				return true;
			});
		}
		var kw = (appliedFilters.name || '').trim().toLowerCase();
		if (kw) list = list.filter(function (r) { return (r.name || '').toLowerCase().indexOf(kw) !== -1; });
		if (appliedFilters.signed === 'yes') list = list.filter(function (r) { return r.isSigned; });
		if (appliedFilters.signed === 'no') list = list.filter(function (r) { return !r.isSigned; });
		if (appliedFilters.region && appliedFilters.region.length) {
			list = list.filter(function (r) { return h2MatchRegionFilter(r.region, appliedFilters.region); });
		}
		if (appliedFilters.businessStatus) {
			list = list.filter(function (r) { return r.businessStatus === appliedFilters.businessStatus; });
		}
		return list.map(function (r) {
			var stats = h2CalcRefuelStats(r.name);
			return Object.assign({}, r, {
				refuelCount: stats.count,
				refuelTotalKg: stats.totalKg,
				refuelFreqKey: h2DeriveFrequencyByRefuelCount(stats.count)
			});
		});
	}, [listData, categoryTab, appliedFilters]);

	var sortedList = useMemo(function () {
		var list = filteredList.slice();
		if (!refuelSort.key || !refuelSort.order) return list;
		var dir = refuelSort.order === 'ascend' ? 1 : -1;
		list.sort(function (a, b) {
			var av = refuelSort.key === 'refuelCount' ? (a.refuelCount || 0) : (a.refuelTotalKg || 0);
			var bv = refuelSort.key === 'refuelCount' ? (b.refuelCount || 0) : (b.refuelTotalKg || 0);
			if (av === bv) return 0;
			return av > bv ? dir : -dir;
		});
		return list;
	}, [filteredList, refuelSort]);

	var totalCount = sortedList.length;

	var displayList = useMemo(function () {
		var start = (page - 1) * pageSize;
		return sortedList.slice(start, start + pageSize);
	}, [sortedList, page, pageSize]);

	var tablePagination = useMemo(function () {
		return {
			current: page,
			pageSize: pageSize,
			total: totalCount,
			showSizeChanger: true,
			pageSizeOptions: ['5', '10', '20', '50'],
			showTotal: function (t) { return '共 ' + t + ' 条'; },
			onChange: function (p, size) {
				setPage(p);
				if (size && size !== pageSize) setPageSize(size);
			}
		};
	}, [page, pageSize, totalCount]);

	var handleKpiCardClick = useCallback(function (key) {
		setCategoryTab(key);
		if (key === 'all' || key === 'none') {
			setListFilters(function (p) { return Object.assign({}, p, { signed: undefined }); });
			setAppliedFilters(function (p) { return Object.assign({}, p, { signed: undefined }); });
		}
		setPage(1);
	}, []);

	var handleSignedFilterCardClick = useCallback(function (key) {
		var nextSigned = appliedFilters.signed === key ? undefined : key;
		if (nextSigned) setCategoryTab('all');
		setListFilters(function (p) { return Object.assign({}, p, { signed: nextSigned }); });
		setAppliedFilters(function (p) { return Object.assign({}, p, { signed: nextSigned }); });
		setPage(1);
	}, [appliedFilters.signed]);

	var handleListFilterQuery = useCallback(function () {
		setAppliedFilters({
			name: listFilters.name,
			signed: listFilters.signed,
			region: listFilters.region,
			businessStatus: listFilters.businessStatus
		});
		if (listFilters.signed) setCategoryTab('all');
		setPage(1);
	}, [listFilters]);

	var handleListFilterReset = useCallback(function () {
		var empty = h2EmptyListFilters();
		setListFilters(empty);
		setAppliedFilters(empty);
		setCategoryTab('all');
		setPage(1);
	}, []);

	var handleListTableChange = useCallback(function (_pagination, _filters, sorter) {
		var nextSorter = Array.isArray(sorter) ? sorter[0] : sorter;
		if (!nextSorter || !nextSorter.columnKey) {
			setRefuelSort({ key: null, order: null });
			return;
		}
		if (nextSorter.columnKey !== 'refuelCount' && nextSorter.columnKey !== 'refuelTotalKg') return;
		setRefuelSort({
			key: nextSorter.columnKey,
			order: nextSorter.order || 'descend'
		});
		setPage(1);
	}, []);

	var renderFilterField = useCallback(function (label, control) {
		return React.createElement('div', { className: 'lc-filter-field' },
			React.createElement('span', { className: 'lc-filter-field-label' }, label),
			React.createElement('div', { className: 'lc-filter-field-control' }, control)
		);
	}, []);

	var renderAlertStatCard = useCallback(function (card, options) {
		var active = options.active;
		var count = options.count;
		var onClick = options.onClick;
		var icon = options.icon;
		return React.createElement('div', {
			key: card.key,
			role: 'button',
			tabIndex: 0,
			className: 'lc-alert-card lc-alert-card--' + card.type + ' lc-alert-card-clickable' + (active ? ' lc-alert-card-active' : ''),
			onClick: onClick,
			onKeyDown: function (e) {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onClick();
				}
			},
			'aria-pressed': active,
			'aria-label': card.title + '，共 ' + count + ' 个'
		},
			React.createElement('div', { className: 'lc-alert-card-tip-anchor' },
				React.createElement(Tooltip, { title: card.desc, placement: 'topRight', overlayStyle: { maxWidth: 320 } },
					React.createElement('span', {
						className: 'lc-alert-card-tip',
						role: 'img',
						'aria-label': card.title + '说明',
						onClick: function (e) { e.stopPropagation(); },
						onMouseDown: function (e) { e.stopPropagation(); }
					},
						h2SvgIcon([{ tag: 'circle', cx: 12, cy: 12, r: 10 }, { tag: 'line', x1: 12, y1: 16, x2: 12, y2: 12 }, { tag: 'line', x1: 12, y1: 8, x2: 12.01, y2: 8 }], 12)
					)
				)
			),
			React.createElement('div', { className: 'lc-alert-card-icon', 'aria-hidden': true }, icon),
			React.createElement('div', { className: 'lc-alert-card-main' },
				React.createElement('div', { className: 'lc-alert-card-title' }, card.title),
				React.createElement('div', { className: 'lc-alert-card-val' }, count)
			)
		);
	}, []);

	var resetCreateForm = useCallback(function () {
		setCreateStation(h2CreateEmptyStationForm());
		setCreateSupplierMode('link');
		setCreateLinkedSupplierId(undefined);
		setCreateSupplier(h2CreateEmptySupplierForm());
	}, []);

	var openCreate = useCallback(function () {
		resetCreateForm();
		setSubView('create');
	}, [resetCreateForm]);

	var handleCreatePageBack = useCallback(function () {
		setCreateSubmitting(false);
		setSubView('list');
	}, []);

	var handleCreateCancel = useCallback(function () {
		if (createSubmitting) return;
		if (h2CreateFormDirty(createStation, createSupplier, createSupplierMode, createLinkedSupplierId)) {
			Modal.confirm({
				title: '放弃未保存的更改？',
				content: '当前填写内容尚未提交，返回列表后将丢失。',
				okText: '放弃并返回',
				cancelText: '继续填写',
				okButtonProps: { danger: true },
				centered: true,
				onOk: handleCreatePageBack
			});
			return;
		}
		handleCreatePageBack();
	}, [createSubmitting, createStation, createSupplier, createSupplierMode, createLinkedSupplierId, handleCreatePageBack]);

	var updateCreateStation = useCallback(function (patch) {
		setCreateStation(function (prev) { return Object.assign({}, prev, patch); });
	}, []);

	var updateCreateSupplier = useCallback(function (patch) {
		setCreateSupplier(function (prev) { return Object.assign({}, prev, patch); });
	}, []);

	var handleCreateSupplierModeChange = useCallback(function (e) {
		var nextMode = e.target.value;
		setCreateSupplierMode(nextMode);
		setCreateLinkedSupplierId(undefined);
		setCreateSupplier(h2CreateEmptySupplierForm());
		if (nextMode === 'none') {
			setCreateStation(function (prev) {
				return Object.assign({}, prev, { bindAccountMode: 'none', bindAccountIds: [] });
			});
		}
	}, []);

	var handleCreateLinkSupplierChange = useCallback(function (id) {
		setCreateLinkedSupplierId(id);
		var found = H2_MOCK_EXISTING_SUPPLIERS.filter(function (s) { return s.id === id; })[0];
		setCreateSupplier(h2SupplierToForm(found));
	}, []);

	var handleCreateSupplierCityChange = useCallback(function (v) {
		updateCreateSupplier({
			city: v,
			region: v && v[0] ? h2GetRegionByProvince(v[0]) : ''
		});
	}, [updateCreateSupplier]);

	var syncCreateSupplierFromStation = useCallback(function () {
		if (createSupplierMode !== 'new') return;
		setCreateSupplier(function (supplier) {
			var patch = {};
			if (createStation.name && !supplier.name) patch.name = createStation.name;
			if (createStation.address && createStation.address.region && createStation.address.region.length >= 2) {
				patch.city = createStation.address.region.slice();
				patch.region = h2GetRegionByProvince(createStation.address.region[0]);
			}
			if (createStation.address && createStation.address.detail && !supplier.address) patch.address = createStation.address.detail;
			if (createStation.contact && !supplier.contactName) patch.contactName = createStation.contact;
			if (createStation.mobilePhone && !supplier.contactMobile) patch.contactMobile = createStation.mobilePhone;
			return Object.keys(patch).length ? Object.assign({}, supplier, patch) : supplier;
		});
	}, [createSupplierMode, createStation]);

	var validateCreateForm = useCallback(function () {
		if (!(createStation.name || '').trim()) {
			message.warning('请填写加氢站名称');
			return false;
		}
		if (!createStation.address.region || createStation.address.region.length < 2) {
			message.warning('请通过地址解析填写省 / 市');
			return false;
		}
		if (!(createStation.address.detail || '').trim()) {
			message.warning('请通过地址解析填写通讯地址');
			return false;
		}
		if (!(createStation.contact || '').trim()) {
			message.warning('请填写联系人');
			return false;
		}
		var createPhoneErr = h2ValidateStationPhones(createStation);
		if (createPhoneErr) {
			message.warning(createPhoneErr);
			return false;
		}
		if (createStation.isSigned) {
			if (!createStation.contractStart || !createStation.contractEnd) {
				message.warning('签约站点请填写合作时间');
				return false;
			}
		}
		var hoursParsed = h2ParseBusinessHours(createStation.businessHours);
		if (hoursParsed.mode === 'custom') {
			if (!(hoursParsed.start || '').trim() || !(hoursParsed.end || '').trim()) {
				message.warning('非全天营业请选择开始与结束时间');
				return false;
			}
			if (!/^(\d{1,2}):(\d{2})$/.test(h2NormalizeTimeText(hoursParsed.start)) || !/^(\d{1,2}):(\d{2})$/.test(h2NormalizeTimeText(hoursParsed.end))) {
				message.warning('营业时间格式须为 HH:mm');
				return false;
			}
		}
		if (createSupplierMode === 'link' && !createLinkedSupplierId) {
			message.warning('请选择要关联的已有供应商');
			return false;
		}
		if (createSupplierMode === 'new' && !(createSupplier.name || '').trim()) {
			message.warning('请填写供应商名称');
			return false;
		}
		if (createSupplierMode !== 'none' && !(createSupplier.signingCompany || '').trim()) {
			message.warning('请选择签约公司');
			return false;
		}
		if (createSupplierMode !== 'none' && createStation.bindAccountIds && createStation.bindAccountIds.length) {
			var usedMapCreate = h2CollectUsedBindAccountMap(listData);
			var ci;
			for (ci = 0; ci < createStation.bindAccountIds.length; ci++) {
				var boundName = usedMapCreate[createStation.bindAccountIds[ci]];
				if (boundName) {
					message.warning('系统账号已绑定站点「' + boundName + '」，请重新选择');
					return false;
				}
			}
		}
		return true;
	}, [createStation, createSupplierMode, createLinkedSupplierId, createSupplier, listData]);

	var handleCreatePageSubmit = useCallback(function (payload) {
		var station = payload && payload.station;
		if (!station) return;
		var nextId = listData.reduce(function (m, r) { return Math.max(m, r.id || 0); }, 0) + 1;
		var created = Object.assign({}, station, { id: nextId });
		setListData(function (prev) { return [created].concat(prev); });
		setPage(1);
		setSubView('list');
		var supplierHint = payload.supplierMode === 'link'
			? '已关联已有供应商'
			: payload.supplierMode === 'new'
				? '已同步创建加氢站类型供应商'
				: '未关联供应商';
		var accountHint = '';
		if (station.bindAccountMode === 'bind' && station.boundAccounts && station.boundAccounts.length) {
			accountHint = '；已绑定 ' + station.boundAccounts.length + ' 个系统账号';
		}
		message.success('站点已创建；' + supplierHint + accountHint + '（原型）');
	}, [listData]);

	var handleCreateSubmit = useCallback(function () {
		if (createSubmitting) return;
		if (!validateCreateForm()) return;
		setCreateSubmitting(true);
		syncCreateSupplierFromStation();
		var now = h2OperateTimestamp();
		var phoneDisplay = createStation.mobilePhone || createStation.landlinePhone || '';
		if (createStation.mobilePhone && createStation.landlinePhone) phoneDisplay = createStation.mobilePhone;
		var createBindIds = createSupplierMode === 'none' ? [] : (createStation.bindAccountIds || []).slice();
		var boundAccounts = h2BuildBoundAccountsFromIds(createBindIds);
		var boundAccount = boundAccounts.length ? boundAccounts[0] : null;
		var stationRecord = {
			name: (createStation.name || '').trim(),
			region: createStation.address.region || [],
			addressDetail: (createStation.address.detail || '').trim(),
			fullAddress: h2BuildFullAddress(createStation.address.region, createStation.address.detail),
			mapAddress: (createStation.mapAddress || '').trim() || h2BuildFullAddress(createStation.address.region, createStation.address.detail),
			latitude: h2NormalizeCoord(createStation.latitude),
			longitude: h2NormalizeCoord(createStation.longitude),
			isSigned: !!createStation.isSigned,
			contractStart: createStation.isSigned ? createStation.contractStart : '',
			contractEnd: createStation.isSigned ? createStation.contractEnd : '',
			contractFiles: (createStation.contractFiles || []).map(function (f) {
				return { uid: f.uid, name: f.name || '合同附件.pdf', url: f.url || '' };
			}),
			businessStatus: createStation.businessStatus || '营业中',
			businessHours: (createStation.businessHours || '').trim(),
			contact: (createStation.contact || '').trim(),
			phone: phoneDisplay,
			mobilePhone: (createStation.mobilePhone || '').trim(),
			landlinePhone: (createStation.landlinePhone || '').trim(),
			costUnitPrice: createStation.costUnitPrice ? parseFloat(createStation.costUnitPrice) : undefined,
			customerUnitPrice: createStation.customerUnitPrice ? parseFloat(createStation.customerUnitPrice) : undefined,
			prepaidBalance: 0,
			businessStatusLogs: [],
			costPriceLogs: [],
			updateTime: now,
			supplierMode: createSupplierMode,
			linkedSupplierId: createSupplierMode === 'link' ? createLinkedSupplierId : undefined,
			supplier: createSupplierMode === 'none' ? undefined : Object.assign({ type: '加氢站' }, createSupplier),
			bindAccountMode: createBindIds.length ? 'bind' : 'none',
			bindAccountIds: createBindIds,
			boundAccountIds: createBindIds,
			boundAccountId: boundAccount ? boundAccount.id : undefined,
			boundAccount: boundAccount,
			boundAccounts: boundAccounts
		};
		window.setTimeout(function () {
			handleCreatePageSubmit({ station: stationRecord, supplier: createSupplier, supplierMode: createSupplierMode });
			setCreateSubmitting(false);
		}, 380);
	}, [createSubmitting, validateCreateForm, syncCreateSupplierFromStation, createStation, createSupplier, createSupplierMode, createLinkedSupplierId, handleCreatePageSubmit]);

	var handleEditPageBack = useCallback(function () {
		setEditSubmitting(false);
		setEditRecord(null);
		setEditOriginForm(null);
		setSubView('list');
	}, []);

	var handleEditCancel = useCallback(function () {
		if (editSubmitting) return;
		if (h2EditFormDirty(editStation, editOriginForm)) {
			Modal.confirm({
				title: '放弃未保存的更改？',
				content: '当前修改尚未保存，返回列表后将丢失。',
				okText: '放弃并返回',
				cancelText: '继续编辑',
				okButtonProps: { danger: true },
				centered: true,
				onOk: handleEditPageBack
			});
			return;
		}
		handleEditPageBack();
	}, [editSubmitting, editStation, editOriginForm, handleEditPageBack]);

	var updateEditStation = useCallback(function (patch) {
		setEditStation(function (prev) { return Object.assign({}, prev, patch); });
	}, []);

	var updateEditSupplier = useCallback(function (patch) {
		setEditSupplier(function (prev) { return Object.assign({}, prev, patch); });
	}, []);

	var confirmEditSupplierChange = useCallback(function (applyChange) {
		Modal.confirm({
			title: '确认修改供应商',
			content: '修改供应商会影响对账时的供应商信息，请确认是否进行修改',
			okText: '确认修改',
			cancelText: '取消',
			centered: true,
			onOk: function () {
				applyChange();
			}
		});
	}, []);

	var handleEditSupplierModeChange = useCallback(function (e) {
		var nextMode = e.target.value;
		if (nextMode === editSupplierMode) return;
		confirmEditSupplierChange(function () {
			setEditSupplierMode(nextMode);
			setEditLinkedSupplierId(undefined);
			setEditSupplier(h2CreateEmptySupplierForm());
			if (nextMode === 'none') {
				setEditStation(function (prev) {
					return Object.assign({}, prev, { bindAccountMode: 'none', bindAccountIds: [] });
				});
			}
		});
	}, [editSupplierMode, confirmEditSupplierChange]);

	var handleEditLinkSupplierChange = useCallback(function (id) {
		if (id === editLinkedSupplierId) return;
		confirmEditSupplierChange(function () {
			setEditLinkedSupplierId(id);
			var found = H2_MOCK_EXISTING_SUPPLIERS.filter(function (s) { return s.id === id; })[0];
			setEditSupplier(h2SupplierToForm(found));
		});
	}, [editLinkedSupplierId, confirmEditSupplierChange]);

	var handleEditSupplierCityChange = useCallback(function (v) {
		updateEditSupplier({
			city: v,
			region: v && v[0] ? h2GetRegionByProvince(v[0]) : ''
		});
	}, [updateEditSupplier]);

	var syncEditSupplierFromStation = useCallback(function () {
		if (editSupplierMode !== 'new') return;
		setEditSupplier(function (supplier) {
			var patch = {};
			if (editStation.name && !supplier.name) patch.name = editStation.name;
			if (editStation.address && editStation.address.region && editStation.address.region.length >= 2) {
				patch.city = editStation.address.region.slice();
				patch.region = h2GetRegionByProvince(editStation.address.region[0]);
			}
			if (editStation.address && editStation.address.detail && !supplier.address) patch.address = editStation.address.detail;
			if (editStation.contact && !supplier.contactName) patch.contactName = editStation.contact;
			if (editStation.mobilePhone && !supplier.contactMobile) patch.contactMobile = editStation.mobilePhone;
			return Object.keys(patch).length ? Object.assign({}, supplier, patch) : supplier;
		});
	}, [editSupplierMode, editStation]);

	var validateEditForm = useCallback(function () {
		if (!(editStation.name || '').trim()) {
			message.warning('请填写加氢站名称');
			return false;
		}
		if (!editStation.address.region || editStation.address.region.length < 2) {
			message.warning('请通过地址解析填写省 / 市');
			return false;
		}
		if (!(editStation.address.detail || '').trim()) {
			message.warning('请通过地址解析填写通讯地址');
			return false;
		}
		if (!(editStation.contact || '').trim()) {
			message.warning('请填写联系人');
			return false;
		}
		var editPhoneErr = h2ValidateStationPhones(editStation);
		if (editPhoneErr) {
			message.warning(editPhoneErr);
			return false;
		}
		if (editStation.isSigned) {
			if (!editStation.contractStart || !editStation.contractEnd) {
				message.warning('签约站点请填写合作时间');
				return false;
			}
		}
		var hoursParsedEdit = h2ParseBusinessHours(editStation.businessHours);
		if (hoursParsedEdit.mode === 'custom') {
			if (!(hoursParsedEdit.start || '').trim() || !(hoursParsedEdit.end || '').trim()) {
				message.warning('非全天营业请选择开始与结束时间');
				return false;
			}
		}
		if (editSupplierMode === 'link' && !editLinkedSupplierId) {
			message.warning('请选择要关联的已有供应商');
			return false;
		}
		if (editSupplierMode === 'new' && !(editSupplier.name || '').trim()) {
			message.warning('请填写供应商名称');
			return false;
		}
		if (editSupplierMode !== 'none' && !(editSupplier.signingCompany || '').trim()) {
			message.warning('请选择签约公司');
			return false;
		}
		if (isAdminUser && editSupplierMode !== 'none' && editStation.bindAccountIds && editStation.bindAccountIds.length) {
			var usedMapEdit = h2CollectUsedBindAccountMap(listData, editRecord && editRecord.id);
			var ei;
			for (ei = 0; ei < editStation.bindAccountIds.length; ei++) {
				var boundEditName = usedMapEdit[editStation.bindAccountIds[ei]];
				if (boundEditName) {
					message.warning('系统账号已绑定站点「' + boundEditName + '」，请重新选择');
					return false;
				}
			}
		}
		return true;
	}, [editStation, editRecord, editSupplierMode, editLinkedSupplierId, editSupplier, listData, isAdminUser]);

	var handleEditSubmit = useCallback(function () {
		if (editSubmitting || !editRecord) return;
		if (!validateEditForm()) return;
		setEditSubmitting(true);
		syncEditSupplierFromStation();
		var now = h2OperateTimestamp();
		var phoneDisplay = editStation.mobilePhone || editStation.landlinePhone || '';
		if (editStation.mobilePhone && editStation.landlinePhone) phoneDisplay = editStation.mobilePhone;
		var nextBoundAccounts = [];
		var nextBindMode = editRecord.bindAccountMode || 'none';
		var nextBindIds = h2NormalizeBindAccountIds(editRecord);
		if (editSupplierMode === 'none') {
			nextBindMode = 'none';
			nextBindIds = [];
			nextBoundAccounts = [];
		} else if (isAdminUser) {
			nextBindIds = (editStation.bindAccountIds || []).slice();
			nextBindMode = nextBindIds.length ? 'bind' : 'none';
			nextBoundAccounts = h2BuildBoundAccountsFromIds(nextBindIds);
		} else {
			nextBoundAccounts = h2ResolveStationSystemAccounts(editRecord);
			nextBindIds = h2NormalizeBindAccountIds(editRecord);
			nextBindMode = editRecord.bindAccountMode || (nextBindIds.length ? 'bind' : 'none');
		}
		var nextBoundAccount = nextBoundAccounts.length ? nextBoundAccounts[0] : null;
		var recordId = editRecord.id;
		setListData(function (prev) {
			return prev.map(function (r) {
				if (r.id !== recordId) return r;
				return Object.assign({}, r, {
					name: (editStation.name || '').trim(),
					region: editStation.address.region || [],
					addressDetail: (editStation.address.detail || '').trim(),
					fullAddress: h2BuildFullAddress(editStation.address.region, editStation.address.detail),
					mapAddress: (editStation.mapAddress || '').trim() || h2BuildFullAddress(editStation.address.region, editStation.address.detail),
					latitude: h2NormalizeCoord(editStation.latitude),
					longitude: h2NormalizeCoord(editStation.longitude),
					isSigned: !!editStation.isSigned,
					contractStart: editStation.isSigned ? editStation.contractStart : '',
					contractEnd: editStation.isSigned ? editStation.contractEnd : '',
					contractFiles: (editStation.contractFiles || []).map(function (f) {
						return { uid: f.uid, name: f.name || '合同附件.pdf', url: f.url || '' };
					}),
					businessHours: (editStation.businessHours || '').trim() || '—',
					contact: (editStation.contact || '').trim(),
					phone: phoneDisplay,
					mobilePhone: (editStation.mobilePhone || '').trim(),
					landlinePhone: (editStation.landlinePhone || '').trim(),
					bindAccountMode: nextBindMode,
					bindAccountIds: nextBindIds,
					boundAccountIds: nextBindIds,
					boundAccountId: nextBoundAccount ? nextBoundAccount.id : undefined,
					boundAccount: nextBoundAccount,
					boundAccounts: nextBoundAccounts,
					supplierMode: editSupplierMode,
					linkedSupplierId: editSupplierMode === 'link' ? editLinkedSupplierId : undefined,
					supplier: editSupplierMode === 'none' ? undefined : Object.assign({ type: '加氢站' }, editSupplier),
					updateTime: now
				});
			});
		});
		window.setTimeout(function () {
			message.success('站点已保存（原型）');
			setEditSubmitting(false);
			handleEditPageBack();
		}, 320);
	}, [editSubmitting, editRecord, editStation, editSupplierMode, editLinkedSupplierId, editSupplier, validateEditForm, syncEditSupplierFromStation, isAdminUser, handleEditPageBack]);

	var openRefuelModal = useCallback(function (record) {
		setRefuelModal({
			open: true,
			station: record,
			records: h2GetRefuelRecordsByStation(record.name)
		});
	}, []);

	var closeRefuelModal = useCallback(function () {
		setRefuelModal({ open: false, station: null, records: [] });
	}, []);

	var handleExportRefuelDrill = useCallback(function () {
		var records = refuelModal.records || [];
		if (!records.length) {
			message.warning('暂无加氢明细可导出');
			return;
		}
		var stationName = (refuelModal.station && refuelModal.station.name) || '';
		h2ExportRefuelDrillCsv(stationName, records);
		message.success('已导出 ' + records.length + ' 条加氢记录');
	}, [refuelModal]);

	var openPrepaidBalanceDrill = useCallback(function (record) {
		setPrepaidBalanceDrill({
			open: true,
			stationName: record.name || '',
			endingBalance: h2NumOrZero(record.prepaidBalance),
			rows: h2BuildMockPrepaidBalanceRows(record)
		});
	}, []);

	var closePrepaidBalanceDrill = useCallback(function () {
		setPrepaidBalanceDrill({ open: false, stationName: '', endingBalance: 0, rows: [] });
	}, []);

	var handleExportBalanceDrill = useCallback(function () {
		var rows = prepaidBalanceDrill.rows || [];
		if (!rows.length) {
			message.warning('暂无流水明细可导出');
			return;
		}
		h2ExportBalanceDrillCsv(prepaidBalanceDrill.stationName, rows);
		message.success('已导出 ' + rows.length + ' 条流水记录');
	}, [prepaidBalanceDrill]);

	var openStatementModal = useCallback(function (record) {
		var lastEnd = h2GetLastStatementEndDate(statementRecords, record.name);
		var defaultStart = lastEnd ? h2AddDays(lastEnd, 1) : '2026-05-01';
		setStatementModal({
			open: true,
			record: record,
			startDate: defaultStart,
			endDate: '2026-05-31',
			phase: 'select',
			draftRows: [],
			balanceAfterSettlement: h2NumOrZero(record.prepaidBalance),
			receiptDate: '',
			receiptAmount: '',
			invoiceFiles: []
		});
	}, [statementRecords]);

	var closeStatementModal = useCallback(function () {
		setStatementModal({
			open: false,
			record: null,
			startDate: '',
			endDate: '',
			phase: 'select',
			draftRows: [],
			balanceAfterSettlement: 0,
			receiptDate: '',
			receiptAmount: '',
			invoiceFiles: []
		});
	}, []);

	var statementDraftSummary = useMemo(function () {
		return h2CalcStatementSummary(statementModal.draftRows || []);
	}, [statementModal.draftRows]);

	var handleExportStatement = useCallback(function () {
		var rows = statementModal.draftRows || [];
		if (!statementModal.record || !rows.length) {
			message.warning('暂无可导出的对账单明细');
			return;
		}
		h2ExportStatementCsv(statementModal.record.name, statementModal.startDate, statementModal.endDate, rows);
		message.success('已导出 ' + rows.length + ' 条对账明细');
	}, [statementModal]);

	var handleGenerateStatement = useCallback(function () {
		if (!statementModal.record) return;
		if (!statementModal.startDate || !statementModal.endDate) {
			message.warning('请选择账单开始日期和结束日期');
			return;
		}
		var startMs = h2ParseDateOnlyMs(statementModal.startDate);
		var endMs = h2ParseDateOnlyMs(statementModal.endDate);
		if (isNaN(startMs) || isNaN(endMs)) {
			message.warning('日期格式不正确');
			return;
		}
		if (startMs > endMs) {
			message.warning('开始日期不能晚于结束日期');
			return;
		}
		var rows = h2GetAvailableStatementLedgerRows(ledgerStore, statementModal.record.name, statementModal.startDate, statementModal.endDate);
		if (!rows.length) {
			message.warning('所选日期范围内暂无「已对账」且未结算的加氢记录，请调整日期后重试');
			return;
		}
		var summary = h2CalcStatementSummary(rows);
		var balanceAfter = Math.round((h2NumOrZero(statementModal.record.prepaidBalance) - summary.totalCost) * 100) / 100;
		setStatementModal(function (m) {
			return Object.assign({}, m, {
				phase: 'draft',
				draftRows: rows,
				balanceAfterSettlement: balanceAfter,
				receiptAmount: summary.totalCost ? h2FormatYuanNum(summary.totalCost) : '',
				receiptDate: '',
				invoiceFiles: []
			});
		});
		message.success('已生成对账记录，共 ' + summary.count + ' 笔，请填写结算信息并提交');
	}, [statementModal, ledgerStore]);

	var handleSubmitStatement = useCallback(function () {
		if (!statementModal.record || statementModal.phase !== 'draft') return;
		var rows = statementModal.draftRows || [];
		if (!rows.length) {
			message.warning('暂无对账明细可提交');
			return;
		}
		if (!(statementModal.receiptDate || '').trim()) {
			message.warning('请填写收票日期');
			return;
		}
		var receiptAmountNum = parseFloat(statementModal.receiptAmount);
		if (isNaN(receiptAmountNum) || receiptAmountNum <= 0) {
			message.warning('请填写有效的收票金额');
			return;
		}
		if (!statementModal.invoiceFiles || !statementModal.invoiceFiles.length) {
			message.warning('请上传发票附件');
			return;
		}
		var summary = h2CalcStatementSummary(rows);
		var operateTime = h2OperateTimestamp();
		var operateDate = h2FormatOperateDateOnly();
		var statementId = 'stmt-' + Date.now();
		var recordIds = rows.map(function (r) { return r.id; });
		var stationRecord = statementModal.record;
		var balanceAfter = h2NumOrZero(statementModal.balanceAfterSettlement);
		var newStatement = {
			id: statementId,
			stationId: stationRecord.id,
			stationName: stationRecord.name,
			reconcileDate: operateTime,
			reconciler: H2_CURRENT_OPERATOR,
			startDate: statementModal.startDate,
			endDate: statementModal.endDate,
			refuelCount: summary.count,
			totalKg: summary.totalKg,
			totalCost: summary.totalCost,
			balanceAfterSettlement: balanceAfter,
			receiptDate: statementModal.receiptDate,
			receiptAmount: receiptAmountNum,
			invoiceFiles: (statementModal.invoiceFiles || []).slice(),
			recordIds: recordIds
		};
		var patches = [];
		setLedgerStore(function (prev) {
			return prev.map(function (r) {
				if (recordIds.indexOf(r.id) < 0) return r;
				patches.push({
					ledgerId: r.id,
					orderNo: r.orderNo,
					stationName: r.stationName,
					plateNo: r.plateNo,
					hydrogenTime: r.hydrogenTime,
					reconcileDate: operateTime,
					receiptDate: operateDate,
					paymentStatus: H2_PAYMENT_STATUS_PAID
				});
				return Object.assign({}, r, {
					statementRecordId: statementId,
					reconcileDate: operateTime,
					receiptDate: operateDate,
					paymentStatus: H2_PAYMENT_STATUS_PAID
				});
			});
		});
		setStatementRecords(function (prev) { return [newStatement].concat(prev); });
		setListData(function (prev) {
			return prev.map(function (item) {
				if (item.id !== stationRecord.id) return item;
				return Object.assign({}, item, {
					prepaidBalance: balanceAfter,
					updateTime: operateTime
				});
			});
		});
		h2PushStatementLedgerPatches(patches);
		if (typeof window !== 'undefined' && window.H2_VEHICLE_LEDGER_API && typeof window.H2_VEHICLE_LEDGER_API.applyPatches === 'function') {
			window.H2_VEHICLE_LEDGER_API.applyPatches(patches);
		}
		message.success('对账单已提交，共结算 ' + summary.count + ' 笔加氢记录');
		closeStatementModal();
	}, [statementModal, closeStatementModal]);

	var openStatementHistoryModal = useCallback(function (record) {
		setStatementHistoryModal({ open: true, record: record });
	}, []);

	var closeStatementHistoryModal = useCallback(function () {
		setStatementHistoryModal({ open: false, record: null });
	}, []);

	var openStatementDetailModal = useCallback(function (statementRecord) {
		var detailRows = h2GetLedgerRowsByIds(ledgerStore, statementRecord.recordIds);
		setStatementDetailModal({ open: true, statementRecord: statementRecord, detailRows: detailRows });
	}, [ledgerStore]);

	var closeStatementDetailModal = useCallback(function () {
		setStatementDetailModal({ open: false, statementRecord: null, detailRows: [] });
	}, []);

	var openEdit = useCallback(function (record) {
		var formSnapshot = h2RecordToEditStationForm(record);
		var supplierMode = h2ResolveRecordSupplierMode(record);
		var linkedSupplier = record.linkedSupplierId;
		var supplierForm = supplierMode === 'none'
			? h2CreateEmptySupplierForm()
			: h2SupplierToForm(h2ResolveStationSupplier(record));
		setEditStation(formSnapshot);
		setEditOriginForm(JSON.parse(JSON.stringify(formSnapshot)));
		setEditSupplierMode(supplierMode);
		setEditLinkedSupplierId(linkedSupplier);
		setEditSupplier(supplierForm);
		setEditRecord(record);
		setSubView('edit');
	}, []);

	var openView = useCallback(function (record) {
		setViewModal({ open: true, record: record });
	}, []);

	var closeViewModal = useCallback(function () {
		setViewModal({ open: false, record: null });
		setFilePreviewModal({ open: false, url: '', name: '', type: 'image' });
	}, []);

	var openFilePreview = useCallback(function (file, variant) {
		if (!file) return;
		var preview = h2ResolveUploadPreview(file, variant || 'doc');
		if (preview.type === 'image' && Image && typeof Image.preview === 'function') {
			Image.preview({ src: preview.url });
			return;
		}
		setFilePreviewModal({
			open: true,
			url: preview.url,
			name: preview.name,
			type: preview.type
		});
	}, [Image]);

	var closeFilePreviewModal = useCallback(function () {
		setFilePreviewModal({ open: false, url: '', name: '', type: 'image' });
	}, []);

	var openBusinessSetting = useCallback(function (record) {
		setBusinessModal({
			open: true,
			record: record,
			businessStatus: record.businessStatus || '营业中',
			businessHours: record.businessHours === '—' ? '' : (record.businessHours || ''),
			originBusinessStatus: record.businessStatus || '营业中',
			statusLogs: (record.businessStatusLogs || []).slice()
		});
	}, []);

	var closeBusinessModal = useCallback(function () {
		setBusinessModal({ open: false, record: null, businessStatus: '营业中', businessHours: '', originBusinessStatus: '营业中', statusLogs: [] });
	}, []);

	var handleSaveBusinessSetting = useCallback(function () {
		if (!businessModal.record) return;
		var hoursParsed = h2ParseBusinessHours(businessModal.businessHours);
		if (hoursParsed.mode === 'custom') {
			if (!(hoursParsed.start || '').trim() || !(hoursParsed.end || '').trim()) {
				message.warning('非全天营业请选择开始与结束时间');
				return;
			}
			if (!/^(\d{1,2}):(\d{2})$/.test(h2NormalizeTimeText(hoursParsed.start)) || !/^(\d{1,2}):(\d{2})$/.test(h2NormalizeTimeText(hoursParsed.end))) {
				message.warning('营业时间格式须为 HH:mm');
				return;
			}
		}
		var nextStatus = businessModal.businessStatus || '营业中';
		var statusChanged = nextStatus !== businessModal.originBusinessStatus;
		var newLog = statusChanged
			? h2CreateBusinessStatusLog(businessModal.originBusinessStatus, nextStatus, H2_CURRENT_OPERATOR)
			: null;
		setListData(function (prev) {
			return prev.map(function (r) {
				if (r.id !== businessModal.record.id) return r;
				var logs = (r.businessStatusLogs || []).slice();
				if (newLog) logs.unshift(newLog);
				return Object.assign({}, r, {
					businessStatus: nextStatus,
					businessHours: (businessModal.businessHours || '').trim() || '—',
					businessStatusLogs: logs,
					updateTime: h2OperateTimestamp()
				});
			});
		});
		message.success(statusChanged ? '营业状态已更新（原型）' : '营业时间已保存（原型）');
		closeBusinessModal();
	}, [businessModal, closeBusinessModal]);

	var openPriceConfig = useCallback(function (record) {
		var configs = h2GetStationPriceConfigs(record);
		setPriceModal(Object.assign({
			open: true,
			record: record,
			priceConfigs: configs,
			priceLogs: [],
			priceFormVisible: false
		}, h2EmptyPriceModalForm()));
	}, []);

	var closePriceModal = useCallback(function () {
		setPriceModal(Object.assign({ open: false, record: null, priceConfigs: [], priceLogs: [], priceFormVisible: false }, h2EmptyPriceModalForm()));
	}, []);

	var loadPriceModalFromConfig = useCallback(function (config) {
		var form = h2PriceModalFormFromConfig(config);
		setPriceModal(function (m) {
			return Object.assign({}, m, form, {
				priceLogs: (config && config.logs) ? config.logs.slice() : [],
				priceFormVisible: true
			});
		});
	}, []);

	var resetPriceModalToNew = useCallback(function () {
		setPriceModal(function (m) {
			var form = h2EmptyPriceModalForm();
			return Object.assign({}, m, form, {
				priceLogs: [],
				priceFormVisible: true
			});
		});
	}, []);

	var cancelPriceFormEdit = useCallback(function () {
		setPriceModal(function (m) {
			return Object.assign({}, m, h2EmptyPriceModalForm(), {
				priceLogs: [],
				priceFormVisible: false
			});
		});
	}, []);

	var updateTierRuleField = useCallback(function (ruleId, field, value) {
		setPriceModal(function (m) {
			return Object.assign({}, m, {
				tierRules: (m.tierRules || []).map(function (rule) {
					if (rule.id !== ruleId) return rule;
					return Object.assign({}, rule, { [field]: value });
				})
			});
		});
	}, []);

	var addTierRuleRow = useCallback(function () {
		setPriceModal(function (m) {
			return Object.assign({}, m, { tierRules: (m.tierRules || []).concat([h2CreateEmptyTierRule()]) });
		});
	}, []);

	var removeTierRuleRow = useCallback(function (ruleId) {
		setPriceModal(function (m) {
			var next = (m.tierRules || []).filter(function (rule) { return rule.id !== ruleId; });
			if (!next.length) next = [h2CreateEmptyTierRule()];
			return Object.assign({}, m, { tierRules: next });
		});
	}, []);

	var handleSavePriceConfig = useCallback(function () {
		if (!priceModal.record) return;
		var priceType = priceModal.priceType || 'fixed';
		var selectedCustomerIds = (priceModal.selectedCustomerIds || []).slice();
		var effectiveText = (priceModal.effectiveTime || '').trim();
		if (!effectiveText) {
			message.warning('请选择生效时间');
			return;
		}
		if (priceType === 'tiered') {
			if (!selectedCustomerIds.length) {
				message.warning('请至少选择一个适用客户');
				return;
			}
		}

		var tierRules = [];
		var fixedPrice = null;
		var afterPrice = null;
		var tierRulesSummary = '';

		if (priceType === 'fixed') {
			var costText = (priceModal.costUnitPrice || '').trim();
			if (!costText) {
				message.warning('请填写成本价格');
				return;
			}
			fixedPrice = parseFloat(costText);
			if (isNaN(fixedPrice) || fixedPrice < 0) {
				message.warning('请输入有效的成本价格（元/kg）');
				return;
			}
			afterPrice = fixedPrice;
		} else {
			var i;
			for (i = 0; i < (priceModal.tierRules || []).length; i++) {
				var row = priceModal.tierRules[i];
				var thresholdText = String(row.thresholdKg || '').trim();
				var priceText = h2FormatReceiptAmountInput(row.price);
				if (!thresholdText && !priceText) continue;
				if (!thresholdText) {
					message.warning('请填写第 ' + (i + 1) + ' 条阶梯条件的加氢总量值');
					return;
				}
				if (!priceText) {
					message.warning('请填写第 ' + (i + 1) + ' 条阶梯条件的价格');
					return;
				}
				var thresholdKg = parseFloat(thresholdText);
				var tierPrice = parseFloat(priceText);
				if (isNaN(thresholdKg) || thresholdKg < 0) {
					message.warning('第 ' + (i + 1) + ' 条加氢总量值无效');
					return;
				}
				if (isNaN(tierPrice) || tierPrice < 0) {
					message.warning('第 ' + (i + 1) + ' 条价格无效');
					return;
				}
				tierRules.push({ id: row.id || h2CreateEmptyTierRule().id, thresholdKg: thresholdKg, price: tierPrice });
			}
			if (!tierRules.length) {
				message.warning('请至少添加一条阶梯价格条件');
				return;
			}
			tierRules = h2SortTierRules(tierRules);
			tierRulesSummary = h2FormatTierRulesSummary(tierRules);
			afterPrice = h2ResolveTierUnitPrice(0, tierRules);
		}

		var recordId = priceModal.record.id;
		var editingId = priceModal.editingConfigId;
		var existingConfigs = h2GetStationPriceConfigs(priceModal.record);
		var existingCfg = null;
		var j;
		for (j = 0; j < existingConfigs.length; j++) {
			if (existingConfigs[j].id === editingId) {
				existingCfg = existingConfigs[j];
				break;
			}
		}

		var allCustomerOpts = h2CollectCustomerOptions(H2_MOCK_REFUEL_RECORDS);
		var customerNameMap = {};
		allCustomerOpts.forEach(function (opt) { customerNameMap[opt.value] = opt.label; });

		var assignedCustomers = h2GetAssignedCustomerIds(existingConfigs, editingId);
		if (selectedCustomerIds.length) {
			for (j = 0; j < selectedCustomerIds.length; j++) {
				var sid = selectedCustomerIds[j];
				if (assignedCustomers[sid] && !(editingId && existingCfg && existingCfg.customerId === sid)) {
					message.warning('客户「' + (customerNameMap[sid] || sid) + '」已有生效规则，请编辑原规则');
					return;
				}
			}
		}

		var configsToSave = [];
		if (priceType === 'tiered') {
			selectedCustomerIds.forEach(function (cid) {
				var isEditTarget = !!(editingId && existingCfg && existingCfg.customerId === cid);
				var priorCfg = isEditTarget ? existingCfg : h2FindPriceConfigByCustomerId(existingConfigs, cid, null);
				var configId = isEditTarget ? editingId : (priorCfg ? priorCfg.id : h2CreatePriceConfigId());
				var beforePrice = priorCfg ? h2ResolveConfigCurrentPrice(priorCfg) : null;
				var cname = customerNameMap[cid] || (priorCfg && priorCfg.customerName) || cid;
				var newLog = h2CreateCostPriceLog(beforePrice, afterPrice, effectiveText, H2_CURRENT_OPERATOR, {
					priceType: 'tiered',
					customerScope: 'customer',
					customerName: cname,
					tierRules: tierRules.map(function (rule) { return Object.assign({}, rule); }),
					tierRulesSummary: tierRulesSummary
				});
				configsToSave.push({
					id: configId,
					priceType: 'tiered',
					customerScope: 'customer',
					customerId: cid,
					customerName: cname,
					fixedPrice: null,
					tierRules: tierRules.map(function (rule) { return Object.assign({}, rule); }),
					tierResetDay: parseInt(priceModal.tierResetDay, 10) || 1,
					tierPeriodVolumeKg: priorCfg && priorCfg.tierPeriodVolumeKg != null ? priorCfg.tierPeriodVolumeKg : 0,
					tierPeriodKey: priorCfg && priorCfg.tierPeriodKey ? priorCfg.tierPeriodKey : h2GetTierPeriodKey(priceModal.tierResetDay),
					logs: [newLog].concat(priorCfg ? (priorCfg.logs || []) : [])
				});
			});
		} else if (selectedCustomerIds.length) {
			selectedCustomerIds.forEach(function (cid) {
				var isEditTarget = !!(editingId && existingCfg && existingCfg.customerScope === 'customer' && existingCfg.customerId === cid);
				var priorCfg = isEditTarget ? existingCfg : h2FindPriceConfigByCustomerId(existingConfigs, cid, null);
				var configId = isEditTarget ? editingId : (priorCfg ? priorCfg.id : h2CreatePriceConfigId());
				var beforePriceFixed = priorCfg
					? h2ResolveConfigCurrentPrice(priorCfg)
					: h2ResolveCurrentCostPrice(priceModal.record);
				var cname = customerNameMap[cid] || (priorCfg && priorCfg.customerName) || cid;
				var newLogFixed = h2CreateCostPriceLog(beforePriceFixed, afterPrice, effectiveText, H2_CURRENT_OPERATOR, {
					priceType: 'fixed',
					customerScope: 'customer',
					customerName: cname
				});
				configsToSave.push({
					id: configId,
					priceType: 'fixed',
					customerScope: 'customer',
					customerId: cid,
					customerName: cname,
					fixedPrice: fixedPrice,
					tierRules: tierRules,
					tierResetDay: parseInt(priceModal.tierResetDay, 10) || 1,
					tierPeriodVolumeKg: priorCfg && priorCfg.tierPeriodVolumeKg != null ? priorCfg.tierPeriodVolumeKg : 0,
					tierPeriodKey: priorCfg && priorCfg.tierPeriodKey ? priorCfg.tierPeriodKey : h2GetTierPeriodKey(priceModal.tierResetDay),
					logs: [newLogFixed].concat(priorCfg ? (priorCfg.logs || []) : [])
				});
			});
		} else {
			var isAllEdit = !!(editingId && existingCfg && existingCfg.customerScope === 'all');
			var beforePriceAll = existingCfg
				? h2ResolveConfigCurrentPrice(existingCfg)
				: h2ResolveCurrentCostPrice(priceModal.record);
			var newLogAll = h2CreateCostPriceLog(beforePriceAll, afterPrice, effectiveText, H2_CURRENT_OPERATOR, {
				priceType: 'fixed',
				customerScope: 'all',
				customerName: null
			});
			configsToSave.push({
				id: isAllEdit ? editingId : h2CreatePriceConfigId(),
				priceType: 'fixed',
				customerScope: 'all',
				customerId: null,
				customerName: null,
				fixedPrice: fixedPrice,
				tierRules: tierRules,
				tierResetDay: parseInt(priceModal.tierResetDay, 10) || 1,
				tierPeriodVolumeKg: existingCfg && existingCfg.tierPeriodVolumeKg != null ? existingCfg.tierPeriodVolumeKg : 0,
				tierPeriodKey: existingCfg && existingCfg.tierPeriodKey ? existingCfg.tierPeriodKey : h2GetTierPeriodKey(priceModal.tierResetDay),
				logs: [newLogAll].concat(existingCfg && existingCfg.customerScope === 'all' ? (existingCfg.logs || []) : [])
			});
		}

		var dropEditingConfig = editingId && !configsToSave.some(function (c) { return c.id === editingId; });

		setListData(function (prev) {
			return prev.map(function (r) {
				if (r.id !== recordId) return r;
				var configs = h2GetStationPriceConfigs(r);
				if (dropEditingConfig) {
					configs = configs.filter(function (cfg) { return cfg.id !== editingId; });
				}
				configsToSave.forEach(function (savedConfig) {
					configs = h2ApplyCustomerExclusion(configs, savedConfig);
					var replaced = false;
					configs = configs.map(function (cfg) {
						if (cfg.id === savedConfig.id) {
							replaced = true;
							return savedConfig;
						}
						return cfg;
					});
					if (!replaced) configs = configs.concat([savedConfig]);
				});
				var updated = Object.assign({}, r, {
					priceConfigs: configs,
					updateTime: h2OperateTimestamp()
				});
				return h2SyncRecordPriceFields(h2ApplyDueCostPriceToRecord(updated));
			});
		});

		var nextConfigs = h2GetStationPriceConfigs(priceModal.record);
		if (dropEditingConfig) {
			nextConfigs = nextConfigs.filter(function (cfg) { return cfg.id !== editingId; });
		}
		configsToSave.forEach(function (savedConfig) {
			nextConfigs = h2ApplyCustomerExclusion(nextConfigs, savedConfig);
			var replaced = false;
			nextConfigs = nextConfigs.map(function (cfg) {
				if (cfg.id === savedConfig.id) {
					replaced = true;
					return savedConfig;
				}
				return cfg;
			});
			if (!replaced) nextConfigs = nextConfigs.concat([savedConfig]);
		});
		var updatedRecord = h2SyncRecordPriceFields(h2ApplyDueCostPriceToRecord(Object.assign({}, priceModal.record, {
			priceConfigs: nextConfigs,
			updateTime: h2OperateTimestamp()
		})));
		setPriceModal(function (m) {
			return Object.assign({}, m, h2EmptyPriceModalForm(), {
				record: updatedRecord,
				priceConfigs: nextConfigs,
				priceLogs: [],
				priceFormVisible: false
			});
		});

		var appliedNow = h2ParseDateTimeMs(effectiveText) <= Date.now();
		var scopeTip = selectedCustomerIds.length
			? '（' + selectedCustomerIds.length + ' 个客户）'
			: '（全部客户）';
		message.success(appliedNow
			? '价格配置已保存' + scopeTip + '，当前规则已更新（原型）'
			: '价格配置已保存' + scopeTip + '，将于生效时间自动更新（原型）');
	}, [priceModal]);

	var openBalanceAlertSetting = useCallback(function (record) {
		var threshold = h2ResolveBalanceAlertThreshold(record);
		setBalanceAlertModal({
			open: true,
			record: record,
			threshold: threshold != null ? h2FormatYuanNum(threshold) : ''
		});
	}, []);

	var closeBalanceAlertModal = useCallback(function () {
		setBalanceAlertModal({ open: false, record: null, threshold: '' });
	}, []);

	var handleSaveBalanceAlert = useCallback(function () {
		if (!balanceAlertModal.record) return;
		var thresholdText = h2FormatReceiptAmountInput(balanceAlertModal.threshold);
		if (!thresholdText) {
			message.warning('请填写有效的提醒金额');
			return;
		}
		var thresholdNum = parseFloat(thresholdText);
		if (isNaN(thresholdNum) || thresholdNum <= 0) {
			message.warning('提醒金额须大于 0');
			return;
		}
		var recordId = balanceAlertModal.record.id;
		setListData(function (prev) {
			return prev.map(function (r) {
				if (r.id !== recordId) return r;
				return Object.assign({}, r, {
					balanceAlertThreshold: thresholdNum,
					updateTime: h2OperateTimestamp()
				});
			});
		});
		message.success('余额提醒设置已保存（原型）');
		closeBalanceAlertModal();
	}, [balanceAlertModal, closeBalanceAlertModal]);

	var openGlobalBalanceAlertSetting = useCallback(function () {
		setGlobalBalanceAlertModal({ open: true, threshold: '' });
	}, []);

	var closeGlobalBalanceAlertModal = useCallback(function () {
		setGlobalBalanceAlertModal({ open: false, threshold: '' });
	}, []);

	var handleSaveGlobalBalanceAlert = useCallback(function () {
		var thresholdText = h2FormatReceiptAmountInput(globalBalanceAlertModal.threshold);
		if (!thresholdText) {
			message.warning('请填写有效的提醒金额');
			return;
		}
		var thresholdNum = parseFloat(thresholdText);
		if (isNaN(thresholdNum) || thresholdNum <= 0) {
			message.warning('提醒金额须大于 0');
			return;
		}
		setListData(function (prev) {
			return prev.map(function (r) {
				return Object.assign({}, r, {
					balanceAlertThreshold: thresholdNum,
					updateTime: h2OperateTimestamp()
				});
			});
		});
		message.success('已为全部加氢站保存余额提醒设置（原型）');
		closeGlobalBalanceAlertModal();
	}, [globalBalanceAlertModal, closeGlobalBalanceAlertModal]);

	var openRechargeModal = useCallback(function (stations) {
		var lines = [];
		if (stations && stations.length) {
			lines = stations.map(function (r) { return h2BuildRechargeLineFromStation(r); });
		} else {
			lines = [h2CreateEmptyRechargeLine()];
		}
		setRechargeModal({ open: true, lines: lines });
	}, []);

	var closeRechargeModal = useCallback(function () {
		setRechargeModal({ open: false, lines: [] });
	}, []);

	var updateRechargeLineField = useCallback(function (lineId, field, value) {
		setRechargeModal(function (m) {
			return Object.assign({}, m, {
				lines: m.lines.map(function (line) {
					if (line.id !== lineId) return line;
					return Object.assign({}, line, { [field]: value });
				})
			});
		});
	}, []);

	var handleRechargeStationSelect = useCallback(function (lineId, stationId) {
		if (!stationId) {
			setRechargeModal(function (m) {
				return Object.assign({}, m, {
					lines: m.lines.map(function (line) {
						if (line.id !== lineId) return line;
						var empty = h2CreateEmptyRechargeLine();
						empty.id = lineId;
						empty.payAmount = line.payAmount;
						return empty;
					})
				});
			});
			return;
		}
		var record = listData.filter(function (r) { return r.id === stationId; })[0];
		if (!record) return;
		setRechargeModal(function (m) {
			return Object.assign({}, m, {
				lines: m.lines.map(function (line) {
					if (line.id !== lineId) return line;
					var built = h2BuildRechargeLineFromStation(record, line.payAmount);
					built.id = lineId;
					return built;
				})
			});
		});
	}, [listData]);

	var addRechargeLine = useCallback(function () {
		setRechargeModal(function (m) {
			return Object.assign({}, m, { lines: m.lines.concat([h2CreateEmptyRechargeLine()]) });
		});
	}, []);

	var removeRechargeLine = useCallback(function (lineId) {
		setRechargeModal(function (m) {
			if (m.lines.length <= 1) return m;
			return Object.assign({}, m, { lines: m.lines.filter(function (l) { return l.id !== lineId; }) });
		});
	}, []);

	var handleSubmitRecharge = useCallback(function () {
		var lines = rechargeModal.lines || [];
		var valid = [];
		var i;
		for (i = 0; i < lines.length; i++) {
			var line = lines[i];
			if (!line.stationId) continue;
			var payText = h2FormatReceiptAmountInput(line.payAmount);
			var payNum = parseFloat(payText);
			if (!payText || isNaN(payNum) || payNum <= 0) continue;
			valid.push(line);
		}
		if (!valid.length) {
			message.warning('请至少添加一条有效的付款信息（已选站点且付款金额大于 0）');
			return;
		}
		var missingSupplier = valid.filter(function (l) {
			return !(l.companyName || '').trim() || !(l.bankAccount || '').trim() || !(l.bankName || '').trim();
		});
		if (missingSupplier.length) {
			message.warning('部分站点未关联供应商或缺少收款信息，请补全后再发起');
			return;
		}
		message.success('已发起审批流程');
		closeRechargeModal();
	}, [rechargeModal, closeRechargeModal]);

	var openAlertStationModal = useCallback(function (type) {
		var title = type === 'balanceAlert' ? '预付余额预警站点' : '已欠费站点';
		var stations = listData.filter(function (r) {
			if (type === 'balanceAlert') return h2IsBalanceAlertStation(r);
			if (type === 'arrears') return h2IsArrearsStation(r);
			return false;
		});
		setAlertStationModal({
			open: true,
			type: type,
			title: title,
			stations: h2EnrichStationListRows(stations)
		});
	}, [listData]);

	var closeAlertStationModal = useCallback(function () {
		setAlertStationModal({ open: false, type: '', title: '', stations: [] });
	}, []);

	var handleBatchRechargeFromAlert = useCallback(function () {
		var stations = alertStationModal.stations || [];
		if (!stations.length) {
			message.warning('暂无站点可发起充值');
			return;
		}
		var type = alertStationModal.type;
		closeAlertStationModal();
		openRechargeModal(stations);
		if (type === 'balanceAlert') message.info('已载入 ' + stations.length + ' 个预警站点，请填写付款金额后发起');
		else if (type === 'arrears') message.info('已载入 ' + stations.length + ' 个欠费站点，请填写付款金额后发起');
	}, [alertStationModal, closeAlertStationModal, openRechargeModal]);

	var getRowMoreMenuItems = useCallback(function (record) {
		return [
			{ key: 'edit', label: '编辑', onClick: function () { openEdit(record); } },
			{ key: 'business', label: '营业状态', onClick: function () { openBusinessSetting(record); } },
			{ key: 'price', label: '价格配置', onClick: function () { openPriceConfig(record); } },
			{ key: 'balanceAlert', label: '余额提醒设置', onClick: function () { openBalanceAlertSetting(record); } },
			{ key: 'statement', label: '生成对账单', onClick: function () { openStatementModal(record); } },
			{ key: 'statementHistory', label: '查看对账记录', onClick: function () { openStatementHistoryModal(record); } },
			{ type: 'divider' },
			{ key: 'delete', label: '删除', danger: true, onClick: function () { setDeleteModal({ open: true, record: record }); } }
		];
	}, [openEdit, openBusinessSetting, openPriceConfig, openBalanceAlertSetting, openStatementModal, openStatementHistoryModal]);

	var closeImportModal = useCallback(function () {
		setImportModalOpen(false);
		setImportFileList([]);
		setImportPreview(null);
	}, []);

	var downloadImportTemplate = useCallback(function () {
		h2DownloadCsv('加氢站点批量导入模板.csv', H2_IMPORT_TEMPLATE_HEADERS, H2_IMPORT_TEMPLATE_SAMPLE);
		message.success('已下载导入模板');
	}, []);

	var parseImportFile = useCallback(function (file) {
		if (!file) return;
		var name = String(file.name || '').toLowerCase();
		if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
			message.warning('原型环境请使用 CSV 模板导入；联调后将支持 Excel 直接上传');
			setImportFileList([file]);
			setImportPreview(null);
			return;
		}
		if (!name.endsWith('.csv')) {
			message.error('仅支持 .csv、.xls、.xlsx 格式');
			return;
		}
		setImportFileList([file]);
		var reader = new FileReader();
		reader.onload = function (ev) {
			var text = (ev && ev.target && ev.target.result) || '';
			var parsed = h2ParseImportCsv(text);
			if (parsed.headerError) {
				message.error(parsed.headerError);
				setImportPreview(null);
				return;
			}
			if (!parsed.rows.length) {
				message.warning('未解析到有效数据，请检查文件内容');
				setImportPreview(null);
				return;
			}
			var nameMap = Object.assign({}, existingNameMap);
			var valid = [];
			var errors = [];
			var ri;
			for (ri = 0; ri < parsed.rows.length; ri++) {
				var row = parsed.rows[ri];
				var rowErrors = h2ValidateImportRow(row, nameMap);
				if (rowErrors.length) {
					errors.push({ lineNo: row.lineNo, name: row.name || '—', reasons: rowErrors });
				} else {
					valid.push(row);
					if (row.name) nameMap[String(row.name).trim()] = true;
				}
			}
			setImportPreview({ valid: valid, errors: errors, fileName: file.name });
		};
		reader.onerror = function () {
			message.error('文件读取失败');
		};
		reader.readAsText(file, 'UTF-8');
	}, [existingNameMap]);

	var handleConfirmImport = useCallback(function () {
		if (!importPreview || !importPreview.valid.length) {
			message.warning('没有可导入的有效数据');
			return;
		}
		setListData(function (prev) {
			var maxId = prev.reduce(function (m, r) { return Math.max(m, r.id || 0); }, 0);
			var imported = importPreview.valid.map(function (row, idx) {
				return h2ImportRowToRecord(row, maxId + idx + 1);
			});
			return imported.concat(prev);
		});
		var errN = (importPreview.errors || []).length;
		if (errN) {
			message.success('成功导入 ' + importPreview.valid.length + ' 条，' + errN + ' 条校验失败已跳过');
		} else {
			message.success('成功导入 ' + importPreview.valid.length + ' 条站点');
		}
		setPage(1);
		closeImportModal();
	}, [importPreview, closeImportModal]);

	React.useEffect(function () {
		var maxPage = Math.max(1, Math.ceil(totalCount / pageSize) || 1);
		if (page > maxPage) setPage(maxPage);
	}, [totalCount, pageSize, page]);

	React.useEffect(function () {
		var applyDuePrices = function () {
			setListData(function (prev) {
				var result = h2ApplyDueCostPricesToList(prev);
				return result.changed ? result.records : prev;
			});
		};
		applyDuePrices();
		var timer = window.setInterval(applyDuePrices, 60000);
		return function () { window.clearInterval(timer); };
	}, []);

	var renderRefuelFreqShortTag = function (freqKey) {
		if (freqKey === 'high') {
			return React.createElement(Tag, {
				color: 'success',
				className: 'lc-refuel-freq-tag'
			}, '高频');
		}
		if (freqKey === 'low') {
			return React.createElement(Tag, {
				color: 'warning',
				className: 'lc-refuel-freq-tag'
			}, '低频');
		}
		return null;
	};

	var renderBusinessStatusTag = function (v) {
		if (v === '营业中') return React.createElement(Tag, { color: 'success', style: { borderRadius: 6, fontWeight: 600 } }, v);
		if (v === '暂停营业') return React.createElement(Tag, { color: 'warning', style: { borderRadius: 6, fontWeight: 600 } }, v);
		if (v === '停止营业') return React.createElement(Tag, { color: 'error', style: { borderRadius: 6, fontWeight: 600 } }, v);
		return React.createElement(Tag, { style: { borderRadius: 6, fontWeight: 600, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' } }, v || '—');
	};

	var renderBusinessStatusText = function (v, tone) {
		var color = v === '营业中' ? '#059669' : v === '暂停营业' ? '#ea580c' : v === '停止营业' ? '#dc2626' : '#64748b';
		if (tone === 'muted') color = '#94a3b8';
		return React.createElement('span', { style: { fontWeight: 600, color: color } }, v || '—');
	};

	var renderRefuelDrillLink = function (text, record, ariaLabel) {
		return React.createElement('button', {
			type: 'button',
			className: 'h2-refuel-drill-link',
			onClick: function (e) {
				e.stopPropagation();
				openRefuelModal(record);
			},
			'aria-label': ariaLabel
		}, text);
	};

	var renderPrepaidBalance = useCallback(function (v, record) {
		if (v == null || v === '') return React.createElement('span', { style: { color: '#94a3b8' } }, '—');
		var n = typeof v === 'number' ? v : parseFloat(v);
		if (isNaN(n)) return '—';
		if (!record) {
			var plainColor = n < 0 ? '#dc2626' : '#0f172a';
			return React.createElement('span', {
				style: { fontWeight: 700, color: plainColor, fontVariantNumeric: 'tabular-nums' },
				title: n < 0 ? '预付余额不足，已欠费' : undefined
			}, h2FormatYuanNum(n));
		}
		var isArrears = n < 0;
		var amountStyle = isArrears
			? { color: '#dc2626', fontVariantNumeric: 'tabular-nums' }
			: { color: '#059669', fontVariantNumeric: 'tabular-nums' };
		return React.createElement('div', { className: 'h2-prepaid-balance-cell' },
			isArrears ? React.createElement(Tag, { color: 'error', className: 'lc-station-signed-tag' }, '已欠费') : null,
			React.createElement('button', {
				type: 'button',
				className: 'h2-prepaid-balance-amount',
				style: amountStyle,
				title: '点击查看余额变更明细',
				'aria-label': '查看「' + (record.name || '') + '」余额变更明细',
				onClick: function (e) {
					e.stopPropagation();
					openPrepaidBalanceDrill(record);
				}
			}, h2FormatYuanNum(n))
		);
	}, [openPrepaidBalanceDrill]);

	var renderBalanceDrillMoney = function (text, tone, rawValue) {
		if (text === '—') {
			return React.createElement('span', { className: 'h2-balance-money h2-balance-money--muted' }, '—');
		}
		var className = 'h2-balance-money h2-balance-money--' + tone;
		if (tone === 'balance' && rawValue != null && h2NumOrZero(rawValue) < 0) className += ' h2-balance-money--negative';
		return React.createElement('span', { className: className }, text);
	};

	var prepaidBalanceDrillColumns = [
		{
			title: '序号',
			key: 'seq',
			width: 52,
			align: 'center',
			render: function (_, __, index) {
				return React.createElement('span', { className: 'h2-balance-seq' }, index + 1);
			}
		},
		{
			title: '时间',
			dataIndex: 'changeTime',
			key: 'changeTime',
			width: 158,
			render: function (v) {
				return React.createElement('span', {
					style: { color: '#334155', fontVariantNumeric: 'tabular-nums', fontSize: 12, whiteSpace: 'nowrap' }
				}, v || '—');
			}
		},
		{
			title: '类型',
			key: 'bizType',
			width: 92,
			align: 'center',
			render: function (_, row) {
				var typeInfo = h2ResolveBalanceBizType(row);
				return React.createElement(Tag, {
					color: typeInfo.color,
					style: { margin: 0, borderRadius: 6, fontWeight: 600, fontSize: 12 }
				}, typeInfo.label);
			}
		},
		{
			title: '收入(元)',
			dataIndex: 'incomeAmount',
			key: 'incomeAmount',
			width: 120,
			align: 'right',
			render: function (v) { return renderBalanceDrillMoney(h2FormatYuanSymbol(v), 'income'); }
		},
		{
			title: '支出(元)',
			dataIndex: 'expenseAmount',
			key: 'expenseAmount',
			width: 120,
			align: 'right',
			render: function (v) { return renderBalanceDrillMoney(h2FormatYuanSymbol(v), 'expense'); }
		},
		{
			title: '余额(元)',
			dataIndex: 'balance',
			key: 'balance',
			width: 128,
			align: 'right',
			render: function (v) {
				return renderBalanceDrillMoney(h2FormatYuanSymbol(v, { keepZero: true }), 'balance', v);
			}
		},
		{
			title: '订单编号',
			dataIndex: 'orderNo',
			key: 'orderNo',
			width: 148,
			ellipsis: true,
			render: function (v) {
				if (!v) return React.createElement('span', { className: 'h2-balance-money--muted' }, '—');
				return React.createElement('span', { className: 'h2-balance-order-no', title: v }, v);
			}
		}
	];

	var prepaidBalanceDrillSummary = useMemo(function () {
		if (!prepaidBalanceDrill.rows || !prepaidBalanceDrill.rows.length) {
			return { incomeTotal: 0, expenseTotal: 0, currentBalance: 0 };
		}
		var last = prepaidBalanceDrill.rows[prepaidBalanceDrill.rows.length - 1];
		return prepaidBalanceDrill.rows.reduce(function (acc, r) {
			acc.incomeTotal += h2NumOrZero(r.incomeAmount);
			acc.expenseTotal += h2NumOrZero(r.expenseAmount);
			return acc;
		}, { incomeTotal: 0, expenseTotal: 0, currentBalance: h2NumOrZero(last.balance) });
	}, [prepaidBalanceDrill.rows]);

	var prepaidBalanceTrendSeries = useMemo(function () {
		return h2BuildBalanceTrendSeries(prepaidBalanceDrill.rows || []);
	}, [prepaidBalanceDrill.rows]);

	var renderPrepaidBalanceDrillPanel = useCallback(function () {
		var rows = prepaidBalanceDrill.rows || [];
		var summary = prepaidBalanceDrillSummary;
		var trendSeries = prepaidBalanceTrendSeries;
		var balanceNegative = h2NumOrZero(summary.currentBalance) < 0;
		var balanceText = h2FormatYuanSymbol(summary.currentBalance, { keepZero: true });
		var stats = [
			{ key: 'balance', label: '当前预付余额', value: balanceText, mod: 'balance', valueMod: balanceNegative ? 'negative' : 'income' },
			{ key: 'income', label: '收入合计', value: h2FormatYuanSymbol(summary.incomeTotal, { keepZero: true }), mod: 'income', valueMod: 'income' },
			{ key: 'expense', label: '支出合计', value: h2FormatYuanSymbol(summary.expenseTotal, { keepZero: true }), mod: 'expense', valueMod: 'expense' }
		];
		return React.createElement('div', { className: 'h2-balance-drill-panel' },
			React.createElement('div', { className: 'h2-balance-drill-stats', role: 'group', 'aria-label': '余额统计' },
				stats.map(function (item) {
					return React.createElement('div', {
						key: item.key,
						className: 'h2-balance-drill-stat h2-balance-drill-stat--' + item.mod,
						role: 'article',
						'aria-label': item.label + ' ' + item.value
					},
						React.createElement('div', { className: 'h2-balance-drill-stat__label' }, item.label),
						React.createElement('div', {
							className: 'h2-balance-drill-stat__value' + (item.valueMod ? ' h2-balance-drill-stat__value--' + item.valueMod : '')
						}, item.value)
					);
				})
			),
			React.createElement('div', { className: 'h2-balance-trend-wrap' },
				React.createElement('div', { className: 'h2-balance-trend-head' },
					React.createElement('span', { className: 'h2-balance-trend-head__title' }, '余额趋势'),
					React.createElement('span', { className: 'h2-balance-trend-head__meta' },
						(trendSeries.startDate || '—') + ' 至 ' + (trendSeries.endDate || '—') + ' · 按日 · 悬浮查看明细'
					)
				),
				React.createElement('div', { className: 'h2-balance-trend-body' },
					React.createElement(H2BalanceTrendChart, { series: trendSeries })
				),
				rows.length
					? React.createElement('div', { className: 'h2-balance-trend-legend' },
						React.createElement('span', { className: 'h2-balance-trend-legend__item' },
							React.createElement('span', { className: 'h2-balance-trend-legend__dot h2-balance-trend-legend__dot--line' }),
							'余额走势'
						),
						React.createElement('span', { className: 'h2-balance-trend-legend__item' },
							React.createElement('span', { className: 'h2-balance-trend-legend__dot h2-balance-trend-legend__dot--area' }),
							'区间填充'
						),
						trendSeries.hasNegative
							? React.createElement('span', { className: 'h2-balance-trend-legend__item', style: { color: '#dc2626' } }, '红点表示欠费时点')
							: null
					)
					: null
			),
			React.createElement('div', { className: 'h2-balance-drill-table-wrap' },
				React.createElement('div', { className: 'h2-balance-drill-table-head' },
					React.createElement('div', { className: 'h2-balance-drill-table-head__left' },
						React.createElement('span', { className: 'h2-balance-drill-table-head__title' }, '流水明细'),
						React.createElement('span', { className: 'h2-balance-drill-table-head__count' }, '共 ' + rows.length + ' 条')
					),
					React.createElement(Button, {
						size: 'small',
						icon: H2_ICONS.download,
						onClick: handleExportBalanceDrill,
						style: { borderRadius: 8, fontWeight: 600, borderColor: '#10b981', color: '#059669' },
						'aria-label': '导出流水明细'
					}, '导出')
				),
				React.createElement(Table, {
					className: 'h2-balance-record-table',
					size: 'small',
					bordered: false,
					rowKey: 'key',
					columns: prepaidBalanceDrillColumns,
					dataSource: rows,
					pagination: rows.length > 8 ? { pageSize: 8, showSizeChanger: false, size: 'small', showTotal: function (t) { return '共 ' + t + ' 条'; } } : false,
					locale: { emptyText: '暂无余额变更记录' },
					scroll: rows.length > 8 ? { x: 'max-content', y: 320 } : { x: 'max-content' }
				})
			)
		);
	}, [prepaidBalanceDrill, prepaidBalanceDrillSummary, prepaidBalanceTrendSeries, prepaidBalanceDrillColumns, handleExportBalanceDrill]);

	var renderStationViewPanel = useCallback(function () {
		var record = viewModal.record;
		if (!record) return null;
		var supplier = h2ResolveStationSupplier(record);
		var descColumn = { xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 };
		var price = h2ResolveCurrentCostPrice(record);
		var balanceNegative = h2NumOrZero(record.prepaidBalance) < 0;
		var balanceText = h2FormatYuanSymbol(record.prepaidBalance, { keepZero: true });

		var renderText = function (v) {
			return v != null && v !== '' ? v : '—';
		};

		var renderViewContractFiles = function (files) {
			if (!files || !files.length) return '—';
			return React.createElement('div', { className: 'h2-station-view-files' },
				files.map(function (f, idx) {
					return React.createElement('button', {
						key: f.uid || f.name || idx,
						type: 'button',
						className: 'h2-station-view-file-link',
						title: '点击预览 ' + (f.name || '附件'),
						onClick: function () { openFilePreview(f, 'doc'); }
					}, f.name || '附件');
				})
			);
		};

		var renderViewLicenseImages = function (files, opts) {
			opts = opts || {};
			if (!files || !files.length) {
				return React.createElement('span', { className: 'h2-station-view-license-empty' }, '未上传');
			}
			return React.createElement('div', { className: 'h2-station-view-license-block' },
				opts.showCount
					? React.createElement('div', { className: 'h2-station-view-license-count' }, '共 ' + files.length + ' 张')
					: null,
				React.createElement('div', { className: 'h2-station-view-license-images' },
				files.map(function (f, idx) {
					var imgUrl = h2ResolveLicenseDisplayUrl(f);
					return React.createElement('button', {
						key: f.uid || f.name || idx,
						type: 'button',
						className: 'h2-station-view-license-thumb',
						title: '点击预览 ' + (f.name || '证照'),
						onClick: function () { openFilePreview(f, 'license'); }
					},
						React.createElement('img', {
							src: imgUrl,
							alt: f.name || '证照图片'
						})
					);
				})
				)
			);
		};

		var renderViewSection = function (title, items) {
			return React.createElement('div', { className: 'h2-station-view-section' },
				React.createElement('div', { className: 'h2-station-view-section__title' }, title),
				React.createElement(Descriptions, {
					bordered: true,
					size: 'small',
					column: descColumn
				},
					items.map(function (item) {
						return React.createElement(Descriptions.Item, {
							key: item.key,
							label: item.label,
							span: item.span || 1
						}, item.value);
					})
				)
			);
		};

		var renderEmptySection = function (title, hint) {
			return React.createElement('div', { className: 'h2-station-view-section' },
				React.createElement('div', { className: 'h2-station-view-section__title' }, title),
				React.createElement('div', { className: 'h2-station-view-empty' }, hint)
			);
		};

		var contractValue = '—';
		if (record.isSigned) {
			contractValue = React.createElement('div', null,
				React.createElement('span', null, (record.contractStart || '—') + ' 至 ' + (record.contractEnd || '—')),
				record.contractEnd ? React.createElement('div', { style: { marginTop: 4 } }, h2RenderContractRemainTag(record.contractEnd)) : null
			);
		}

		var stationItems = [
			{ key: 'name', label: '加氢站名称', value: renderText(record.name) },
			{ key: 'region', label: '省 / 市', value: renderText(h2FormatRegion(record.region)) },
			{ key: 'detail', label: '详细地址', value: renderText(record.addressDetail), span: 2 },
			{ key: 'status', label: '营业状态', value: renderBusinessStatusTag(record.businessStatus) },
			{ key: 'hours', label: '营业时间', value: renderText(h2DisplayBusinessHours(record.businessHours)) },
			{ key: 'signed', label: '是否签约', value: record.isSigned ? '已签约' : '未签约' }
		];
		if (record.isSigned) {
			stationItems.push(
				{ key: 'contract', label: '合作时间', value: contractValue, span: 2 },
				{ key: 'files', label: '签约附件', value: renderViewContractFiles(record.contractFiles), span: 2 }
			);
		}
		stationItems.push(
			{ key: 'contact', label: '联系人', value: renderText(record.contact) },
			{ key: 'phone', label: '联系电话', value: renderText(record.phone) },
			{
				key: 'balance',
				label: '预付余额',
				value: React.createElement('span', {
					style: { fontWeight: 700, color: balanceNegative ? '#dc2626' : '#059669', fontVariantNumeric: 'tabular-nums' }
				}, balanceText)
			},
			{
				key: 'price',
				label: '当前成本价格',
				value: price != null ? h2FormatYuanSymbol(price, { keepZero: true }) + ' / kg' : '—'
			}
		);

		var supplierItems = supplier ? [
			{ key: 'name', label: '供应商名称', value: renderText(supplier.name), span: 2 },
			{ key: 'signingCompany', label: '签约公司', value: renderText(supplier.signingCompany), span: 2 },
			{ key: 'type', label: '供应商类型', value: renderText(supplier.type || '加氢站') },
			{ key: 'city', label: '省 / 市', value: renderText(h2FormatRegion(supplier.city)) },
			{ key: 'address', label: '详细地址', value: renderText(supplier.address), span: 2 },
			{ key: 'region', label: '所属区域', value: renderText(supplier.region) },
			{ key: 'dept', label: '归属部门', value: renderText(supplier.dept) },
			{ key: 'manager', label: '负责人', value: renderText(supplier.manager) },
			{ key: 'contactName', label: '联系人', value: renderText(supplier.contactName) },
			{ key: 'contactMobile', label: '联系电话', value: renderText(supplier.contactMobile) },
			{ key: 'bl', label: '营业执照', value: renderViewLicenseImages(supplier.businessLicenseFiles), span: 2 },
			{ key: 'fl', label: '其他证照', value: renderViewLicenseImages(supplier.fillingLicenseFiles, { showCount: true }), span: 2 }
		] : [];

		var paymentItems = supplier ? [
			{ key: 'taxId', label: '纳税人识别号', value: renderText(supplier.taxId), span: 2 },
			{ key: 'invoicePhone', label: '注册电话', value: renderText(supplier.invoicePhone) },
			{ key: 'invoiceAddress', label: '注册地址', value: renderText(supplier.invoiceAddress), span: 2 },
			{ key: 'bankName', label: '开户行', value: renderText(supplier.bankName), span: 2 },
			{ key: 'bankAccount', label: '银行账号', value: renderText(supplier.bankAccount), span: 2 },
			{ key: 'businessAddress', label: '营业地址', value: renderText(supplier.businessAddress), span: 2 }
		] : [];

		return React.createElement('div', { className: 'h2-station-view-panel' },
			renderViewSection('加氢站信息', stationItems),
			supplier ? renderViewSection('供应商信息', supplierItems) : renderEmptySection('供应商信息', '暂未关联供应商'),
			supplier ? renderViewSection('付款信息', paymentItems) : renderEmptySection('付款信息', '暂无付款信息')
		);
	}, [viewModal.record, openFilePreview]);

	var renderRefuelDrillMoney = function (text, tone) {
		return React.createElement('span', { className: 'h2-refuel-drill-money h2-refuel-drill-money--' + tone }, text);
	};

	var refuelRecordColumns = [
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
			title: '加氢时间',
			dataIndex: 'hydrogenTime',
			key: 'hydrogenTime',
			width: 158,
			render: function (v) {
				return React.createElement('span', { className: 'h2-refuel-drill-time' }, v || '—');
			}
		},
		{
			title: '车牌号',
			dataIndex: 'plateNo',
			key: 'plateNo',
			width: 108,
			render: function (v) {
				return React.createElement('span', { className: 'h2-refuel-drill-plate' }, v || '—');
			}
		},
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 168, ellipsis: true },
		{
			title: '加氢量(kg)',
			dataIndex: 'hydrogenKg',
			key: 'hydrogenKg',
			width: 96,
			align: 'right',
			render: function (v) {
				return React.createElement('span', { className: 'h2-refuel-drill-kg' }, h2FormatKgNum(v));
			}
		},
		{
			title: '成本单价(元/kg)',
			dataIndex: 'costUnitPrice',
			key: 'costUnitPrice',
			width: 118,
			align: 'right',
			render: function (v) {
				return renderRefuelDrillMoney(h2FormatYuanSymbol(v, { keepZero: true }), 'cost');
			}
		},
		{
			title: '成本总价(元)',
			dataIndex: 'costAmount',
			key: 'costAmount',
			width: 118,
			align: 'right',
			render: function (v) {
				return renderRefuelDrillMoney(h2FormatYuanSymbol(v, { keepZero: true }), 'cost');
			}
		},
		{
			title: '加氢单价(元/kg)',
			dataIndex: 'customerUnitPrice',
			key: 'customerUnitPrice',
			width: 118,
			align: 'right',
			render: function (v) {
				return renderRefuelDrillMoney(h2FormatYuanSymbol(v, { keepZero: true }), 'customer');
			}
		},
		{
			title: '加氢总价(元)',
			dataIndex: 'customerAmount',
			key: 'customerAmount',
			width: 118,
			align: 'right',
			render: function (v) {
				return renderRefuelDrillMoney(h2FormatYuanSymbol(v, { keepZero: true }), 'customer');
			}
		},
		{
			title: '承担方式',
			dataIndex: 'settlementStatus',
			key: 'settlementStatus',
			width: 120,
			render: function (v) {
				var info = H2_SETTLEMENT_STATUS_MAP[v];
				if (!info) return '—';
				return React.createElement(Tag, { color: info.color, style: { margin: 0, borderRadius: 6, fontWeight: 600 } }, info.label);
			}
		},
		{
			title: '订单编号',
			dataIndex: 'orderNo',
			key: 'orderNo',
			width: 148,
			align: 'center',
			ellipsis: true,
			render: function (v) {
				if (!v) return React.createElement('span', { style: { color: '#cbd5e1' } }, '—');
				return React.createElement('span', { className: 'h2-refuel-drill-order-no', title: v }, v);
			}
		}
	];

	var refuelModalSummary = useMemo(function () {
		var records = refuelModal.records || [];
		var totalKg = 0;
		var totalCost = 0;
		var totalCustomer = 0;
		var i;
		for (i = 0; i < records.length; i++) {
			totalKg += records[i].hydrogenKg || 0;
			totalCost += records[i].costAmount || 0;
			totalCustomer += records[i].customerAmount || 0;
		}
		return { count: records.length, totalKg: totalKg, totalCost: totalCost, totalCustomer: totalCustomer };
	}, [refuelModal.records]);

	var renderRefuelDrillPanel = useCallback(function () {
		var records = refuelModal.records || [];
		var summary = refuelModalSummary;
		var stationName = (refuelModal.station && refuelModal.station.name) || '—';
		var stats = [
			{ key: 'count', label: '加氢次数', value: String(summary.count || 0), mod: 'count', valueMod: 'count' },
			{ key: 'kg', label: '加氢量合计(kg)', value: h2FormatKgNum(summary.totalKg), mod: 'kg', valueMod: 'kg' },
			{ key: 'cost', label: '成本总价', value: h2FormatYuanSymbol(summary.totalCost, { keepZero: true }), mod: 'cost', valueMod: 'cost' },
			{ key: 'customer', label: '加氢总价', value: h2FormatYuanSymbol(summary.totalCustomer, { keepZero: true }), mod: 'customer', valueMod: 'customer' }
		];
		return React.createElement('div', { className: 'h2-refuel-drill-panel' },
			React.createElement('div', { className: 'h2-refuel-drill-station-card' },
				React.createElement('div', { className: 'h2-refuel-drill-station-card__name' }, stationName),
				React.createElement('div', { className: 'h2-refuel-drill-station-card__meta' }, '车辆加氢记录 · 共 ' + records.length + ' 笔')
			),
			React.createElement('div', { className: 'h2-refuel-drill-stats', role: 'group', 'aria-label': '加氢统计' },
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
						React.createElement('span', { className: 'h2-refuel-drill-table-head__title' }, '加氢明细'),
						React.createElement('span', { className: 'h2-refuel-drill-table-head__count' }, '共 ' + records.length + ' 条')
					),
					React.createElement(Button, {
						size: 'small',
						icon: H2_ICONS.download,
						onClick: handleExportRefuelDrill,
						style: { borderRadius: 8, fontWeight: 600, borderColor: '#10b981', color: '#059669' },
						'aria-label': '导出加氢明细'
					}, '导出')
				),
				React.createElement(Table, {
					className: 'h2-refuel-record-table',
					size: 'small',
					bordered: false,
					rowKey: 'id',
					columns: refuelRecordColumns,
					dataSource: records,
					pagination: records.length > 8 ? { pageSize: 8, showSizeChanger: false, size: 'small', showTotal: function (t) { return '共 ' + t + ' 条'; } } : false,
					locale: { emptyText: '暂无加氢记录' },
					scroll: records.length > 8 ? { x: 'max-content', y: 320 } : { x: 'max-content' }
				})
			)
		);
	}, [refuelModal, refuelModalSummary, refuelRecordColumns, handleExportRefuelDrill]);

	var statementRecordColumns = [
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
			title: '加氢时间',
			dataIndex: 'hydrogenTime',
			key: 'hydrogenTime',
			width: 158,
			render: function (v) {
				return React.createElement('span', { className: 'h2-refuel-drill-time' }, v || '—');
			}
		},
		{
			title: '车牌号',
			dataIndex: 'plateNo',
			key: 'plateNo',
			width: 108,
			render: function (v) {
				return React.createElement('span', { className: 'h2-refuel-drill-plate' }, v || '—');
			}
		},
		{
			title: '加氢量(kg)',
			dataIndex: 'hydrogenKg',
			key: 'hydrogenKg',
			width: 96,
			align: 'right',
			render: function (v) {
				return React.createElement('span', { className: 'h2-refuel-drill-kg' }, h2FormatKgNum(v));
			}
		},
		{
			title: '成本单价(元/kg)',
			dataIndex: 'costUnitPrice',
			key: 'costUnitPrice',
			width: 118,
			align: 'right',
			render: function (v) {
				return renderRefuelDrillMoney(h2FormatYuanSymbol(v, { keepZero: true }), 'cost');
			}
		},
		{
			title: '成本总价(元)',
			dataIndex: 'costTotal',
			key: 'costTotal',
			width: 118,
			align: 'right',
			render: function (v) {
				return renderRefuelDrillMoney(h2FormatYuanSymbol(v, { keepZero: true }), 'cost');
			}
		},
		{
			title: '订单编号',
			dataIndex: 'orderNo',
			key: 'orderNo',
			width: 148,
			align: 'center',
			ellipsis: true,
			render: function (v) {
				if (!v) return React.createElement('span', { style: { color: '#cbd5e1' } }, '—');
				return React.createElement('span', { className: 'h2-refuel-drill-order-no', title: v }, v);
			}
		}
	];

	var renderStatementBalanceReadonly = function (balance) {
		var n = h2NumOrZero(balance);
		var isArrears = n < 0;
		return React.createElement('div', { className: 'h2-statement-balance-readonly' },
			React.createElement('span', {
				className: 'h2-statement-balance-readonly__amount ' + (isArrears ? 'h2-statement-balance-readonly__amount--negative' : 'h2-statement-balance-readonly__amount--positive')
			}, h2FormatYuanNum(n)),
			isArrears ? React.createElement(Tag, { color: 'error', className: 'lc-station-signed-tag' }, '已欠费') : null
		);
	};

	var renderStatementPanel = useCallback(function () {
		var record = statementModal.record;
		var stationName = (record && record.name) || '—';
		var isDraft = statementModal.phase === 'draft';
		var rows = isDraft ? (statementModal.draftRows || []) : [];
		var summary = isDraft ? statementDraftSummary : { count: 0, totalKg: 0, totalCost: 0 };
		var lastEndDate = h2GetLastStatementEndDate(statementRecords, stationName);
		var stats = [
			{ key: 'count', label: '加氢次数', value: String(summary.count || 0), mod: 'count', valueMod: 'count' },
			{ key: 'kg', label: '加氢总量(kg)', value: h2FormatKgNum(summary.totalKg), mod: 'kg', valueMod: 'kg' },
			{ key: 'cost', label: '成本总金额', value: h2FormatYuanSymbol(summary.totalCost, { keepZero: true }), mod: 'cost', valueMod: 'cost' }
		];
		return React.createElement('div', { className: 'h2-statement-panel' },
			React.createElement('div', { className: 'h2-statement-station-card' },
				React.createElement('div', { className: 'h2-statement-station-card__name' }, stationName),
				React.createElement('div', { className: 'h2-statement-station-card__meta' },
					isDraft ? '对账记录 · 待提交' : '选择账单日期 · 生成对账记录'
				)
			),
			React.createElement('div', { className: 'h2-statement-form-wrap' },
				React.createElement('div', { className: 'h2-statement-date-grid' },
					formItem('账单开始日期', true, React.createElement(Input, {
						type: 'date',
						style: { width: '100%', borderRadius: 8 },
						disabled: isDraft,
						value: statementModal.startDate || '',
						onChange: function (e) {
							setStatementModal(function (m) { return Object.assign({}, m, { startDate: e.target.value, phase: 'select', draftRows: [] }); });
						}
					})),
					formItem('账单结束日期', true, React.createElement(Input, {
						type: 'date',
						style: { width: '100%', borderRadius: 8 },
						disabled: isDraft,
						value: statementModal.endDate || '',
						onChange: function (e) {
							setStatementModal(function (m) { return Object.assign({}, m, { endDate: e.target.value, phase: 'select', draftRows: [] }); });
						}
					}))
				),
				React.createElement('div', { className: 'h2-statement-last-end' },
					'上次对账单结束时间：',
					React.createElement('strong', null, lastEndDate || '暂无')
				),
				!isDraft ? React.createElement('div', { className: 'h2-statement-form-hint' },
					'数据来源：',
					React.createElement('strong', null, '车辆氢费明细'),
					' 中标记为「已对账」且尚未结算的加氢记录；明细仅展示成本价与成本总价。'
				) : null
			),
			isDraft ? React.createElement('div', { className: 'h2-statement-stats', role: 'group', 'aria-label': '对账统计' },
				stats.map(function (item) {
					return React.createElement('div', {
						key: item.key,
						className: 'h2-statement-stat h2-statement-stat--' + item.mod,
						role: 'article',
						'aria-label': item.label + ' ' + item.value
					},
						React.createElement('div', { className: 'h2-statement-stat__label' }, item.label),
						React.createElement('div', {
							className: 'h2-statement-stat__value h2-statement-stat__value--' + item.valueMod
						}, item.value)
					);
				})
			) : null,
			isDraft ? React.createElement('div', { className: 'h2-statement-table-wrap' },
				React.createElement('div', { className: 'h2-statement-table-head' },
					React.createElement('div', { className: 'h2-statement-table-head__left' },
						React.createElement('span', { className: 'h2-statement-table-head__title' }, '对账明细（成本字段）'),
						React.createElement('span', { className: 'h2-statement-table-head__count' }, '共 ' + rows.length + ' 条')
					),
					React.createElement(Button, {
						size: 'small',
						icon: H2_ICONS.download,
						disabled: !rows.length,
						onClick: handleExportStatement,
						style: { borderRadius: 8, fontWeight: 600, borderColor: '#7c3aed', color: '#6d28d9' },
						'aria-label': '导出对账单明细'
					}, '导出')
				),
				React.createElement(Table, {
					className: 'h2-statement-record-table',
					size: 'small',
					bordered: false,
					rowKey: 'id',
					columns: statementRecordColumns,
					dataSource: rows,
					pagination: rows.length > 8 ? { pageSize: 8, showSizeChanger: false, size: 'small', showTotal: function (t) { return '共 ' + t + ' 条'; } } : false,
					locale: { emptyText: '暂无对账明细' },
					scroll: rows.length > 8 ? { x: 'max-content', y: 320 } : { x: 'max-content' }
				})
			) : null,
			isDraft ? React.createElement('div', { className: 'h2-statement-settlement-wrap' },
				formItem('结算后加氢站预付款余额', true, renderStatementBalanceReadonly(statementModal.balanceAfterSettlement)),
				React.createElement('div', { className: 'h2-statement-receipt-grid' },
					formItem('收票日期', true, dayjs && DatePicker
						? React.createElement(DatePicker, {
							style: { width: '100%', borderRadius: 8 },
							format: 'YYYY-MM-DD',
							placeholder: '请选择收票日期',
							allowClear: true,
							value: h2ToDateDayjs(statementModal.receiptDate),
							onChange: function (d, dateStr) {
								setStatementModal(function (m) {
									return Object.assign({}, m, { receiptDate: dateStr || '' });
								});
							}
						})
						: React.createElement(Input, {
							type: 'date',
							style: { width: '100%', borderRadius: 8 },
							placeholder: '请选择收票日期',
							value: statementModal.receiptDate || '',
							onChange: function (e) {
								setStatementModal(function (m) { return Object.assign({}, m, { receiptDate: e.target.value }); });
							}
						})),
					formItem('收票金额', true, React.createElement(Input, {
						className: 'h2-statement-receipt-amount-input',
						inputMode: 'decimal',
						prefix: '￥',
						style: { width: '100%', borderRadius: 8 },
						placeholder: '请输入收票金额',
						value: statementModal.receiptAmount || '',
						onChange: function (e) {
							var next = h2SanitizeReceiptAmountInput(e.target.value);
							setStatementModal(function (m) { return Object.assign({}, m, { receiptAmount: next }); });
						},
						onBlur: function (e) {
							var formatted = h2FormatReceiptAmountInput(e.target.value);
							setStatementModal(function (m) { return Object.assign({}, m, { receiptAmount: formatted }); });
						}
					}))
				),
				formItem('发票附件', true, React.createElement(ContractFilesUpload, {
					fileList: statementModal.invoiceFiles || [],
					showHint: false,
					wrapClassName: 'h2-statement-invoice-upload',
					uploadClassName: 'h2-statement-upload-btn-wrap',
					buttonClassName: 'h2-statement-upload-btn',
					onChange: function (info) {
						setStatementModal(function (m) { return Object.assign({}, m, { invoiceFiles: info.fileList || [] }); });
					}
				}))
			) : null
		);
	}, [statementModal, statementRecords, statementDraftSummary, statementRecordColumns, handleExportStatement]);

	var statementHistoryColumns = [
		{ title: '对账日期', dataIndex: 'reconcileDate', key: 'reconcileDate', width: 150 },
		{ title: '对账人', dataIndex: 'reconciler', key: 'reconciler', width: 100, ellipsis: true },
		{ title: '账单开始日期', dataIndex: 'startDate', key: 'startDate', width: 118 },
		{ title: '账单结束日期', dataIndex: 'endDate', key: 'endDate', width: 118 },
		{ title: '加氢次数', dataIndex: 'refuelCount', key: 'refuelCount', width: 88, align: 'right' },
		{
			title: '加氢金额',
			dataIndex: 'totalCost',
			key: 'totalCost',
			width: 110,
			align: 'right',
			render: function (v) { return h2FormatYuanSymbol(v, { keepZero: true }); }
		},
		{
			title: '对账后加氢站预付款余额',
			dataIndex: 'balanceAfterSettlement',
			key: 'balanceAfterSettlement',
			width: 168,
			align: 'right',
			render: function (v) {
				var n = h2NumOrZero(v);
				var isArrears = n < 0;
				return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' } },
					React.createElement('span', {
						className: 'h2-statement-history-balance ' + (isArrears ? 'h2-statement-history-balance--negative' : 'h2-statement-history-balance--positive')
					}, h2FormatYuanNum(n)),
					isArrears ? React.createElement(Tag, { color: 'error', className: 'lc-station-signed-tag' }, '已欠费') : null
				);
			}
		},
		{
			title: '操作',
			key: 'action',
			width: 96,
			fixed: 'right',
			render: function (_, row) {
				return React.createElement(Button, {
					type: 'link',
					size: 'small',
					onClick: function () { openStatementDetailModal(row); }
				}, '查看明细');
			}
		}
	];

	var renderStatementHistoryPanel = useCallback(function () {
		var record = statementHistoryModal.record;
		var stationName = (record && record.name) || '—';
		var rows = h2GetStatementRecordsByStation(statementRecords, stationName);
		return React.createElement('div', { className: 'h2-statement-history-panel' },
			React.createElement('div', { className: 'h2-statement-history-station-card' },
				React.createElement('div', { className: 'h2-statement-history-station-card__name' }, stationName),
				React.createElement('div', { className: 'h2-statement-history-station-card__meta' }, '历史对账记录 · 共 ' + rows.length + ' 条')
			),
			React.createElement('div', { className: 'h2-statement-history-table-wrap' },
				React.createElement(Table, {
					size: 'small',
					bordered: false,
					rowKey: 'id',
					columns: statementHistoryColumns,
					dataSource: rows,
					pagination: rows.length > 8 ? { pageSize: 8, showSizeChanger: false, size: 'small', showTotal: function (t) { return '共 ' + t + ' 条'; } } : false,
					locale: { emptyText: '暂无对账记录' },
					scroll: { x: 'max-content' }
				})
			)
		);
	}, [statementHistoryModal, statementRecords, statementHistoryColumns, openStatementDetailModal]);

	var renderStatementDetailPanel = useCallback(function () {
		var stmt = statementDetailModal.statementRecord;
		var rows = statementDetailModal.detailRows || [];
		if (!stmt) return null;
		var summary = h2CalcStatementSummary(rows);
		var invoiceFiles = stmt.invoiceFiles || [];
		return React.createElement('div', { className: 'h2-statement-panel' },
			React.createElement('div', { className: 'h2-statement-station-card' },
				React.createElement('div', { className: 'h2-statement-station-card__name' }, stmt.stationName || '—'),
				React.createElement('div', { className: 'h2-statement-station-card__meta' },
					(stmt.startDate || '—') + ' 至 ' + (stmt.endDate || '—')
				)
			),
			React.createElement('div', { className: 'h2-statement-stats', role: 'group', 'aria-label': '对账统计' },
				[
					{ key: 'count', label: '加氢次数', value: String(summary.count || stmt.refuelCount || 0), mod: 'count', valueMod: 'count' },
					{ key: 'kg', label: '加氢总量(kg)', value: h2FormatKgNum(summary.totalKg || stmt.totalKg), mod: 'kg', valueMod: 'kg' },
					{ key: 'cost', label: '成本总金额', value: h2FormatYuanSymbol(summary.totalCost || stmt.totalCost, { keepZero: true }), mod: 'cost', valueMod: 'cost' }
				].map(function (item) {
					return React.createElement('div', {
						key: item.key,
						className: 'h2-statement-stat h2-statement-stat--' + item.mod
					},
						React.createElement('div', { className: 'h2-statement-stat__label' }, item.label),
						React.createElement('div', { className: 'h2-statement-stat__value h2-statement-stat__value--' + item.valueMod }, item.value)
					);
				})
			),
			React.createElement('div', { className: 'h2-statement-detail-receipt-wrap' },
				React.createElement('div', { className: 'h2-statement-detail-receipt-grid' },
					React.createElement('div', { className: 'h2-statement-detail-receipt-item' },
						React.createElement('div', { className: 'h2-statement-detail-receipt-item__label' }, '收票时间'),
						React.createElement('div', { className: 'h2-statement-detail-receipt-item__value' }, stmt.receiptDate || '—')
					),
					React.createElement('div', { className: 'h2-statement-detail-receipt-item' },
						React.createElement('div', { className: 'h2-statement-detail-receipt-item__label' }, '收票金额'),
						React.createElement('div', { className: 'h2-statement-detail-receipt-item__value h2-statement-detail-receipt-item__value--amount' },
							stmt.receiptAmount != null ? h2FormatYuanSymbol(stmt.receiptAmount, { keepZero: true }) : '—'
						)
					)
				),
				React.createElement('div', { className: 'h2-statement-detail-receipt-files' },
					React.createElement('div', { className: 'h2-statement-detail-receipt-item__label' }, '发票附件'),
					invoiceFiles.length
						? React.createElement('div', { className: 'h2-statement-detail-receipt-file-list' },
							invoiceFiles.map(function (file) {
								return React.createElement('div', { key: file.uid || file.name, className: 'h2-statement-detail-receipt-file-item' },
									React.createElement('span', { className: 'h2-statement-detail-receipt-file-name', title: file.name }, file.name || '未命名附件'),
									React.createElement(Button, {
										type: 'link',
										size: 'small',
										icon: H2_ICONS.download,
										onClick: function () { h2DownloadUploadFile(file); }
									}, '下载')
								);
							})
						)
						: React.createElement('div', { style: { fontSize: 13, color: '#94a3b8', marginTop: 8 } }, '暂无发票附件')
				)
			),
			React.createElement('div', { className: 'h2-statement-table-wrap' },
				React.createElement('div', { className: 'h2-statement-table-head' },
					React.createElement('div', { className: 'h2-statement-table-head__left' },
						React.createElement('span', { className: 'h2-statement-table-head__title' }, '对账明细'),
						React.createElement('span', { className: 'h2-statement-table-head__count' }, '共 ' + rows.length + ' 条')
					)
				),
				React.createElement(Table, {
					className: 'h2-statement-record-table',
					size: 'small',
					bordered: false,
					rowKey: 'id',
					columns: statementRecordColumns,
					dataSource: rows,
					pagination: rows.length > 8 ? { pageSize: 8, showSizeChanger: false, size: 'small' } : false,
					locale: { emptyText: '暂无明细' },
					scroll: rows.length > 8 ? { x: 'max-content', y: 320 } : { x: 'max-content' }
				})
			)
		);
	}, [statementDetailModal, statementRecordColumns]);

	var renderPriceConfigMoney = function (text, tone) {
		return React.createElement('span', { className: 'h2-price-config-money h2-price-config-money--' + tone }, text);
	};

	var costPriceLogColumns = [
		{ title: '操作人', dataIndex: 'operator', key: 'operator', width: 92, ellipsis: true },
		{ title: '操作时间', dataIndex: 'operateTime', key: 'operateTime', width: 138 },
		{
			title: '定价方式',
			dataIndex: 'priceType',
			key: 'priceType',
			width: 88,
			render: function (v) { return h2FormatPriceTypeLabel(v || 'fixed'); }
		},
		{
			title: '适用客户',
			dataIndex: 'customerName',
			key: 'customerName',
			width: 120,
			ellipsis: true,
			render: function (v, row) {
				return row.customerScope === 'customer' ? (v || '指定客户') : '全部客户';
			}
		},
		{
			title: '调整前',
			dataIndex: 'beforeCostPrice',
			key: 'beforeCostPrice',
			width: 96,
			align: 'right',
			render: function (v) { return renderPriceConfigMoney(h2FormatCostPriceDisplay(v), 'before'); }
		},
		{
			title: '调整后',
			dataIndex: 'afterCostPrice',
			key: 'afterCostPrice',
			width: 148,
			align: 'left',
			render: function (v, row) {
				if (row.priceType === 'tiered') {
					var lines = h2GetTierRuleDisplayLines(row);
					if (lines.length) {
						return React.createElement('div', { className: 'h2-price-config-after-lines' },
							lines.map(function (line, idx) {
								return React.createElement('div', { key: idx, className: 'h2-price-config-after-line' },
									renderPriceConfigMoney(line, 'after')
								);
							})
						);
					}
				}
				return renderPriceConfigMoney(h2FormatCostPriceDisplay(v), 'after');
			}
		},
		{ title: '生效时间', dataIndex: 'effectiveTime', key: 'effectiveTime', width: 138 }
	];

	var effectivePriceConfigColumns = useMemo(function () {
		return [
			{
				title: '适用客户',
				key: 'scope',
				width: 120,
				ellipsis: true,
				render: function (_, cfg) {
					return h2FormatPriceConfigScopeLabel(cfg);
				}
			},
			{
				title: '定价方式',
				key: 'priceType',
				width: 96,
				render: function (_, cfg) {
					var isTiered = cfg.priceType === 'tiered';
					return React.createElement(Tag, {
						color: isTiered ? 'purple' : 'processing',
						bordered: false,
						style: { margin: 0, borderRadius: 6, fontWeight: 600 }
					}, h2FormatPriceTypeLabel(cfg.priceType));
				}
			},
			{
				title: '当前价格',
				key: 'price',
				width: 220,
				render: function (_, cfg) {
					var isTiered = cfg.priceType === 'tiered';
					var cfgPrice = h2ResolveConfigCurrentPrice(cfg);
					var priceText = cfgPrice != null ? h2FormatYuanNum(cfgPrice) + '元/kg' : '—';
					if (isTiered) {
						var gapKg = h2GetTierGapToNextThreshold(cfg);
						if (gapKg != null) {
							priceText += '，距下个阶梯还差' + h2FormatKgNum(gapKg) + ' kg';
						}
					}
					return React.createElement('span', {
						className: 'h2-price-config-effective-price',
						style: { whiteSpace: 'normal', lineHeight: 1.5 }
					}, priceText);
				}
			},
			{
				title: '生效时间',
				key: 'effectiveTime',
				width: 150,
				render: function (_, cfg) {
					return h2FormatConfigEffectiveDateTime(cfg);
				}
			},
			{
				title: '阶梯重置',
				key: 'tierReset',
				width: 100,
				render: function (_, cfg) {
					return cfg.priceType === 'tiered' ? h2GetTierResetTimeLabel(cfg) : '—';
				}
			},
			{
				title: '操作',
				key: 'action',
				width: 72,
				fixed: 'right',
				render: function (_, cfg) {
					return React.createElement(Button, {
						type: 'link',
						size: 'small',
						onClick: function () { loadPriceModalFromConfig(cfg); }
					}, '修改');
				}
			}
		];
	}, [loadPriceModalFromConfig]);

	var businessStatusLogColumns = [
		{ title: '操作时间', dataIndex: 'operateTime', key: 'operateTime', width: 150 },
		{ title: '操作人', dataIndex: 'operator', key: 'operator', width: 100, ellipsis: true },
		{
			title: '修改前状态',
			dataIndex: 'beforeStatus',
			key: 'beforeStatus',
			width: 110,
			render: function (v) { return renderBusinessStatusText(v, 'muted'); }
		},
		{
			title: '修改后状态',
			dataIndex: 'afterStatus',
			key: 'afterStatus',
			width: 110,
			render: function (v) { return renderBusinessStatusTag(v); }
		}
	];

	var renderCurrentCostPriceCell = function (record) {
		var primaryCfg = h2GetPrimaryPriceConfig(record);
		var price = h2ResolveCurrentCostPrice(record);
		var multiPrice = h2HasMultiCustomerPriceSystems(record);
		var isTiered = primaryCfg && primaryCfg.priceType === 'tiered';
		var typeTag = React.createElement(Tag, {
			className: 'h2-price-type-tag',
			color: isTiered ? 'purple' : 'processing',
			bordered: false
		}, isTiered ? '阶梯' : '固定');
		var priceNode = price == null
			? React.createElement('span', { style: { color: '#94a3b8' } }, '—')
			: React.createElement('span', {
				style: { fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#0f172a' }
			}, '￥' + h2FormatYuanNum(price));
		var warnNode = multiPrice
			? React.createElement(Tooltip, { title: '多个客户存在不同价格体系' },
				React.createElement('span', {
					className: 'h2-price-multi-warn',
					role: 'img',
					'aria-label': '多个客户存在不同价格体系',
					tabIndex: 0
				}, H2_ICONS.none)
			)
			: null;
		return React.createElement('div', { className: 'h2-current-cost-price-cell' }, typeTag, priceNode, warnNode);
	};

	var columns = [
		{
			title: '加氢站名称',
			dataIndex: 'name',
			key: 'name',
			width: 300,
			fixed: 'left',
			ellipsis: true,
			render: function (v, r) {
				var addressLine = h2FormatStationAddressLine(r);
				return React.createElement('div', { className: 'lc-station-name-cell' },
					React.createElement('div', { className: 'lc-station-name-row' },
						React.createElement('div', { className: 'lc-station-name' }, v || '—'),
						h2RenderStationSignedTag(r)
					),
					React.createElement('div', { className: 'lc-station-address-line', title: addressLine }, addressLine)
				);
			}
		},
		{
			title: '合作时间',
			key: 'contractRange',
			width: 220,
			render: function (_, r) {
				if (!r.isSigned) return React.createElement('span', { style: { color: '#94a3b8' } }, '—');
				return React.createElement('div', null,
					React.createElement('div', { style: { fontSize: 12, fontWeight: 600, color: '#334155' } },
						(r.contractStart || '—') + ' 至 ' + (r.contractEnd || '—')
					),
					r.contractEnd ? h2RenderContractRemainTag(r.contractEnd) : null
				);
			}
		},
		{
			title: '营业状态',
			dataIndex: 'businessStatus',
			key: 'businessStatus',
			width: 110,
			render: renderBusinessStatusTag
		},
		{ title: '营业时间', dataIndex: 'businessHours', key: 'businessHours', width: 140, render: function (v) { return h2DisplayBusinessHours(v); } },
		{
			title: '当前成本价格(元/kg)',
			key: 'currentCostPrice',
			width: 168,
			align: 'right',
			render: function (_, r) {
				return renderCurrentCostPriceCell(r);
			}
		},
		{
			title: '加氢次数',
			dataIndex: 'refuelCount',
			key: 'refuelCount',
			width: 110,
			align: 'right',
			sortOrder: refuelSort.key === 'refuelCount' ? refuelSort.order : null,
			sorter: function () { return 0; },
			sortDirections: ['descend', 'ascend'],
			showSorterTooltip: { title: '点击切换倒序 / 正序' },
			render: function (v) {
				return React.createElement('span', {
					style: { fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#0f172a' }
				}, String(v || 0));
			}
		},
		{
			title: '加氢量(kg)',
			dataIndex: 'refuelTotalKg',
			key: 'refuelTotalKg',
			width: 160,
			align: 'right',
			sortOrder: refuelSort.key === 'refuelTotalKg' ? refuelSort.order : null,
			sorter: function () { return 0; },
			sortDirections: ['descend', 'ascend'],
			showSorterTooltip: { title: '点击切换倒序 / 正序' },
			render: function (v, record) {
				return React.createElement('div', { className: 'lc-refuel-kg-row' },
					renderRefuelFreqShortTag(record.refuelFreqKey),
					renderRefuelDrillLink(h2FormatKgNum(v), record, '查看加氢记录，合计 ' + h2FormatKgNum(v) + ' kg')
				);
			}
		},
		{
			title: '预付余额(元)',
			dataIndex: 'prepaidBalance',
			key: 'prepaidBalance',
			width: 188,
			align: 'right',
			className: 'h2-col-prepaid-balance',
			onCell: function () {
				return { className: 'h2-cell-prepaid-balance' };
			},
			render: function (v, record) { return renderPrepaidBalance(v, record); }
		},
		{
			title: '联系方式',
			key: 'contactInfo',
			width: 120,
			render: function (_, r) {
				var mobile = r.mobilePhone || r.phone || '';
				var landline = r.landlinePhone || '';
				return React.createElement('div', null,
					React.createElement('div', { className: 'lc-station-contact-name' }, r.contact || '—'),
					mobile ? React.createElement('div', { className: 'lc-station-contact-phone' }, mobile) : null,
					landline ? React.createElement('div', { className: 'lc-station-contact-phone' }, landline) : null,
					!mobile && !landline ? React.createElement('div', { className: 'lc-station-contact-phone' }, '—') : null
				);
			}
		},
		{
			title: '操作',
			key: 'action',
			width: 108,
			fixed: 'right',
			render: function (_, record) {
				return React.createElement('div', { className: 'h2-row-actions' },
					React.createElement(Button, {
						type: 'link',
						size: 'small',
						className: 'lc-action-btn',
						onClick: function () { openView(record); }
					}, '查看'),
					React.createElement(Dropdown, {
						trigger: ['click'],
						placement: 'bottomRight',
						menu: { items: getRowMoreMenuItems(record) }
					},
						React.createElement(Tooltip, { title: '更多' },
							React.createElement('span', {
								className: 'h2-action-more-btn',
								role: 'button',
								tabIndex: 0,
								'aria-label': '更多操作',
								onClick: function (e) { e.stopPropagation(); }
							}, h2MoreIcon())
						)
					)
				);
			}
		}
	];

	var formItem = function (label, required, node, extra) {
		return React.createElement(Form.Item, {
			label: required ? React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), label) : label,
			extra: extra
		}, node);
	};

	var renderBusinessStatusPanel = useCallback(function () {
		var record = businessModal.record;
		var logs = businessModal.statusLogs || [];
		var stationName = (record && record.name) || '—';
		var originStatus = businessModal.originBusinessStatus || (record && record.businessStatus) || '营业中';
		var originHours = (record && record.businessHours) || '—';
		var displayHours = businessModal.businessHours || originHours;
		var pendingChanged = (businessModal.businessStatus || '营业中') !== originStatus;
		var stats = [
			{
				key: 'status',
				label: '当前营业状态',
				value: renderBusinessStatusTag(originStatus),
				mod: 'status',
				valueMod: ''
			},
			{
				key: 'hours',
				label: '当前营业时间',
				value: h2DisplayBusinessHours(displayHours),
				mod: 'hours',
				valueMod: 'hours'
			}
		];

		return React.createElement('div', { className: 'h2-business-status-panel' },
			React.createElement('div', { className: 'h2-business-status-station-card' },
				React.createElement('div', { className: 'h2-business-status-station-card__name' }, stationName),
				React.createElement('div', { className: 'h2-business-status-station-card__meta' }, '营业状态维护 · 共 ' + logs.length + ' 条记录')
			),
			React.createElement('div', { className: 'h2-business-status-stats', role: 'group', 'aria-label': '营业状态统计' },
				stats.map(function (item) {
					return React.createElement('div', {
						key: item.key,
						className: 'h2-business-status-stat h2-business-status-stat--' + item.mod,
						role: 'article',
						'aria-label': item.label
					},
						React.createElement('div', { className: 'h2-business-status-stat__label' }, item.label),
						React.createElement('div', {
							className: 'h2-business-status-stat__value' + (item.valueMod ? ' h2-business-status-stat__value--' + item.valueMod : '')
						}, item.value)
					);
				})
			),
			React.createElement('div', { className: 'h2-business-status-form-wrap' },
				React.createElement(Form, { layout: 'vertical', requiredMark: false },
					formItem('营业状态', true, h2RenderOptionButtonGroup(
						H2_BUSINESS_STATUS_BTN_OPTIONS,
						businessModal.businessStatus || '营业中',
						function (v) { setBusinessModal(function (m) { return Object.assign({}, m, { businessStatus: v }); }); },
						{ ariaLabel: '营业状态' }
					)),
					formItem('营业时间', false, React.createElement(BusinessHoursInput, {
						value: businessModal.businessHours,
						fieldStyle: { width: '100%', borderRadius: 8 },
						onChange: function (v) { setBusinessModal(function (m) { return Object.assign({}, m, { businessHours: v }); }); }
					}))
				),
				React.createElement('div', { className: 'h2-business-status-form-hint', role: 'note' },
					pendingChanged
						? '保存后将记录营业状态变更，并更新列表展示。'
						: '选择「非全天营业」后需设置开始与结束时间；暂停或停止营业时建议配置具体时段。'
				)
			),
			React.createElement('div', { className: 'h2-business-status-table-wrap' },
				React.createElement('div', { className: 'h2-business-status-table-head' },
					React.createElement('span', { className: 'h2-business-status-table-head__title' }, '营业状态变更记录'),
					React.createElement('span', { className: 'h2-business-status-table-head__count' }, '共 ' + logs.length + ' 条')
				),
				React.createElement(Table, {
					className: 'h2-business-status-record-table',
					size: 'small',
					bordered: false,
					rowKey: 'id',
					columns: businessStatusLogColumns,
					dataSource: logs,
					pagination: logs.length > 5 ? { pageSize: 5, showSizeChanger: false, size: 'small', showTotal: function (t) { return '共 ' + t + ' 条'; } } : false,
					locale: { emptyText: '暂无状态变更记录' },
					scroll: logs.length > 5 ? { x: 520, y: 240 } : { x: 520 }
				})
			)
		);
	}, [businessModal, businessStatusLogColumns]);

	var renderPriceConfigPanel = useCallback(function () {
		var record = priceModal.record;
		var logs = priceModal.priceLogs || [];
		var stationName = (record && record.name) || '—';
		var priceConfigs = priceModal.priceConfigs || [];
		var priceType = priceModal.priceType || 'fixed';
		var assignedCustomerIds = h2GetAssignedCustomerIds(priceConfigs, priceModal.editingConfigId);
		var allCustomerOptions = h2CollectCustomerOptions(H2_MOCK_REFUEL_RECORDS);
		var selectedCustomerIds = priceModal.selectedCustomerIds || [];
		var enabledTierCustomerOptions = allCustomerOptions.filter(function (opt) {
			return !assignedCustomerIds[opt.value];
		});
		var enabledSelectedCount = enabledTierCustomerOptions.filter(function (opt) {
			return selectedCustomerIds.indexOf(opt.value) >= 0;
		}).length;
		var tierAllSelected = enabledTierCustomerOptions.length > 0 && enabledSelectedCount === enabledTierCustomerOptions.length;
		var tierIndeterminate = enabledSelectedCount > 0 && !tierAllSelected;

		var toggleTierCustomer = function (customerId, checked) {
			setPriceModal(function (m) {
				var current = (m.selectedCustomerIds || []).slice();
				var next = checked
					? (current.indexOf(customerId) >= 0 ? current : current.concat([customerId]))
					: current.filter(function (id) { return id !== customerId; });
				var names = allCustomerOptions.filter(function (opt) { return next.indexOf(opt.value) >= 0; }).map(function (opt) { return opt.label; });
				return Object.assign({}, m, {
					selectedCustomerIds: next,
					customerScope: next.length ? 'customer' : 'all',
					customerId: next.length === 1 ? next[0] : null,
					customerName: next.length === 1 ? (names[0] || null) : (names.length ? names.join('、') : null)
				});
			});
		};

		var toggleTierCustomerAll = function (checked) {
			setPriceModal(function (m) {
				var next = checked ? enabledTierCustomerOptions.map(function (opt) { return opt.value; }) : [];
				var names = allCustomerOptions.filter(function (opt) { return next.indexOf(opt.value) >= 0; }).map(function (opt) { return opt.label; });
				return Object.assign({}, m, {
					selectedCustomerIds: next,
					customerScope: next.length ? 'customer' : 'all',
					customerId: next.length === 1 ? next[0] : null,
					customerName: next.length === 1 ? (names[0] || null) : (names.length ? names.join('、') : null)
				});
			});
		};

		var tierCustomerTriggerText = selectedCustomerIds.length
			? allCustomerOptions.filter(function (opt) { return selectedCustomerIds.indexOf(opt.value) >= 0; }).map(function (opt) { return opt.label; }).join('、')
			: (priceType === 'fixed' && (priceModal.customerScope === 'all' || !priceModal.editingConfigId) ? '全部客户' : '');
		var customerPickerHint = priceType === 'fixed'
			? '默认对全部客户生效；已为某客户单独配置的，将自动从本规则中排除'
			: undefined;
		var resetDayOptions = [];
		var di;
		for (di = 1; di <= 28; di++) {
			resetDayOptions.push({ value: di, label: '每月 ' + di + ' 日' });
		}
		var effectiveTimeValue = h2ToDateTimeDayjs(priceModal.effectiveTime);
		var effectivePicker = dayjs && DatePicker
			? React.createElement(DatePicker, {
				showTime: true,
				needConfirm: false,
				style: { width: '100%', borderRadius: 8 },
				format: 'YYYY-MM-DD HH:mm',
				placeholder: '请选择生效时间',
				allowClear: true,
				value: effectiveTimeValue,
				onChange: function (d, dateStr) {
					setPriceModal(function (m) {
						var next = dateStr || (d && d.isValid && d.isValid() ? d.format('YYYY-MM-DD HH:mm') : '');
						return Object.assign({}, m, { effectiveTime: next });
					});
				}
			})
			: React.createElement(Input, {
				type: 'datetime-local',
				style: { borderRadius: 8 },
				value: priceModal.effectiveTime ? priceModal.effectiveTime.replace(' ', 'T') : '',
				onChange: function (e) {
					var raw = e.target.value || '';
					setPriceModal(function (m) {
						return Object.assign({}, m, { effectiveTime: raw ? raw.replace('T', ' ') : '' });
					});
				}
			});

		return React.createElement('div', { className: 'h2-price-config-panel' },
			React.createElement('div', { className: 'h2-price-config-station-card' },
				React.createElement('div', { className: 'h2-price-config-station-card__row' },
					React.createElement('div', { className: 'h2-price-config-station-card__name' }, stationName),
					h2RenderStationSignedTag(record)
				)
			),
			React.createElement('div', { className: 'h2-price-config-table-wrap' },
				React.createElement('div', { className: 'h2-price-config-table-head' },
					React.createElement('span', { className: 'h2-price-config-table-head__title' }, '当前已生效价格配置'),
					React.createElement(Button, { type: 'link', size: 'small', onClick: resetPriceModalToNew, style: { padding: 0, height: 'auto' } }, '+ 新增规则')
				),
				React.createElement(Table, {
					className: 'h2-price-config-record-table h2-price-config-effective-table',
					size: 'small',
					bordered: false,
					rowKey: 'id',
					columns: effectivePriceConfigColumns,
					dataSource: priceConfigs,
					pagination: priceConfigs.length > 5 ? { pageSize: 5, showSizeChanger: false, size: 'small', showTotal: function (t) { return '共 ' + t + ' 条'; } } : false,
					locale: { emptyText: '暂无已生效价格配置，点击「+ 新增规则」创建' },
					scroll: { x: 860 }
				})
			),
			priceModal.priceFormVisible
				? React.createElement('div', { className: 'h2-price-config-form-wrap' },
					React.createElement('div', { className: 'h2-price-config-form-head' },
						React.createElement('span', { className: 'h2-price-config-form-head__title' }, priceModal.editingConfigId ? '修改价格配置' : '新增价格配置'),
						React.createElement(Button, { type: 'link', size: 'small', onClick: cancelPriceFormEdit, style: { padding: 0, height: 'auto' } }, '收起')
					),
				React.createElement(Form, { layout: 'vertical', requiredMark: false },
					React.createElement('div', { className: 'h2-price-config-type-row' },
						React.createElement('div', { className: 'h2-price-config-type-row__col' },
							formItem('定价方式', true, React.createElement(Radio.Group, {
								value: priceType,
								onChange: function (e) {
									var nextType = e.target.value;
									setPriceModal(function (m) {
										var patch = { priceType: nextType, tierCustomerPickerOpen: false };
										if (!(m.selectedCustomerIds || []).length && m.customerScope === 'customer' && m.customerId) {
											patch.selectedCustomerIds = [m.customerId];
										}
										return Object.assign({}, m, patch);
									});
								}
							},
								React.createElement(Radio.Button, { value: 'fixed' }, '固定价格'),
								React.createElement(Radio.Button, { value: 'tiered' }, '阶梯价格')
							))
						),
						React.createElement('div', { className: 'h2-price-config-type-row__col' },
							formItem('适用客户', true, React.createElement(Dropdown, {
								trigger: ['click'],
								overlayClassName: 'h2-tier-customer-dropdown-overlay',
								open: priceModal.tierCustomerPickerOpen,
								onOpenChange: function (open) {
									setPriceModal(function (m) { return Object.assign({}, m, { tierCustomerPickerOpen: open }); });
								},
								dropdownRender: function () {
									return React.createElement('div', { className: 'h2-tier-customer-dropdown', onClick: function (e) { e.stopPropagation(); } },
										React.createElement('div', {
											className: 'h2-tier-customer-dropdown__item is-all',
											onClick: function () { toggleTierCustomerAll(!tierAllSelected); }
										},
											React.createElement(Checkbox, {
												checked: tierAllSelected,
												indeterminate: tierIndeterminate,
												onChange: function (e) { toggleTierCustomerAll(e.target.checked); }
											}),
											React.createElement('span', null, '全选')
										),
										allCustomerOptions.length
											? allCustomerOptions.map(function (opt) {
												var disabled = !!assignedCustomerIds[opt.value];
												var checked = selectedCustomerIds.indexOf(opt.value) >= 0;
												return React.createElement('div', {
													key: opt.value,
													className: 'h2-tier-customer-dropdown__item' + (disabled ? ' is-disabled' : ''),
													onClick: function () {
														if (disabled) return;
														toggleTierCustomer(opt.value, !checked);
													}
												},
													React.createElement(Checkbox, {
														checked: checked,
														disabled: disabled,
														onChange: function (e) {
															if (disabled) return;
															toggleTierCustomer(opt.value, e.target.checked);
														}
													}),
													React.createElement('span', { title: opt.label }, opt.label),
													disabled ? React.createElement('span', { style: { marginLeft: 'auto', fontSize: 11, color: '#94a3b8' } }, '已有规则') : null
												);
											})
											: React.createElement('div', { className: 'h2-tier-customer-dropdown__hint' }, '暂无可选客户'),
										priceType === 'tiered'
											? React.createElement('div', { className: 'h2-tier-customer-dropdown__hint' }, '同一客户仅可配置一套生效规则；已有规则的客户不可重复选择')
											: null
									);
								}
							},
								React.createElement('div', {
									className: 'h2-tier-customer-picker__trigger' + (priceModal.tierCustomerPickerOpen ? ' is-open' : ''),
									role: 'button',
									tabIndex: 0,
									'aria-haspopup': 'listbox',
									'aria-expanded': !!priceModal.tierCustomerPickerOpen
								},
									React.createElement('span', {
										className: 'h2-tier-customer-picker__trigger-text' + (tierCustomerTriggerText ? '' : ' is-placeholder')
									}, tierCustomerTriggerText || (priceType === 'fixed' ? '全部客户' : '请选择适用客户')),
									React.createElement('span', { style: { color: '#94a3b8', fontSize: 12, flexShrink: 0 } }, selectedCustomerIds.length ? ('已选 ' + selectedCustomerIds.length) : '▼')
								)
							), customerPickerHint)
						)
					),
					priceType === 'fixed'
						? React.createElement(Form.Item, {
							label: React.createElement('span', null,
								React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'),
								'价格配置'
							)
						},
							React.createElement('div', { className: 'h2-price-tier-timing-row' },
								React.createElement('div', null,
									React.createElement('div', { className: 'h2-price-tier-rule-field' },
										React.createElement('label', null, '成本价格（元/kg）'),
										React.createElement(Input, {
											value: priceModal.costUnitPrice,
											placeholder: '请输入成本价格，保留两位小数',
											style: { borderRadius: 8 },
											onChange: function (e) { setPriceModal(function (m) { return Object.assign({}, m, { costUnitPrice: e.target.value }); }); },
											onBlur: function (e) {
												var formatted = h2FormatReceiptAmountInput(e.target.value);
												if (formatted) setPriceModal(function (m) { return Object.assign({}, m, { costUnitPrice: formatted }); });
											}
										})
									)
								),
								React.createElement('div', null,
									React.createElement('div', { className: 'h2-price-tier-rule-field' },
										React.createElement('label', null, '生效时间'),
										effectivePicker
									)
								)
							)
						)
						: React.createElement(Form.Item, {
							label: React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), '阶梯价格条件')
						},
							React.createElement('div', { className: 'h2-price-tier-rules' },
								(priceModal.tierRules || []).map(function (rule, idx) {
									return React.createElement('div', { key: rule.id, className: 'h2-price-tier-rule-row' },
										React.createElement('div', { className: 'h2-price-tier-rule-field' },
											React.createElement('label', null, '加氢总量 ≥（kg）'),
											React.createElement(Input, {
												value: rule.thresholdKg,
												placeholder: idx === 0 ? '0' : '如 300',
												style: { borderRadius: 8 },
												onChange: function (e) { updateTierRuleField(rule.id, 'thresholdKg', e.target.value); }
											})
										),
										React.createElement('div', { className: 'h2-price-tier-rule-field' },
											React.createElement('label', null, '成本价格（元/kg）'),
											React.createElement(Input, {
												value: rule.price,
												placeholder: '两位小数',
												style: { borderRadius: 8 },
												onChange: function (e) { updateTierRuleField(rule.id, 'price', e.target.value); },
												onBlur: function (e) {
													var formatted = h2FormatReceiptAmountInput(e.target.value);
													if (formatted) updateTierRuleField(rule.id, 'price', formatted);
												}
											})
										),
										React.createElement(Button, {
											type: 'link',
											danger: true,
											disabled: (priceModal.tierRules || []).length <= 1,
											onClick: function () { removeTierRuleRow(rule.id); },
											style: { marginBottom: 2 }
										}, '删除')
									);
								}),
								React.createElement(Button, { type: 'dashed', block: true, onClick: addTierRuleRow, style: { borderRadius: 8 } }, '+ 新增条件')
							)
						),
					priceType === 'tiered'
						? React.createElement(Form.Item, {
							label: React.createElement('span', null,
								React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'),
								'阶梯量重置日期 / 生效时间'
							)
						},
							React.createElement('div', { className: 'h2-price-tier-timing-row' },
								React.createElement('div', null,
									React.createElement('div', { className: 'h2-price-tier-rule-field' },
										React.createElement('label', null, '阶梯量重置日期'),
										React.createElement(Select, {
											style: { width: '100%' },
											value: priceModal.tierResetDay || 1,
											options: resetDayOptions,
											onChange: function (val) {
												setPriceModal(function (m) { return Object.assign({}, m, { tierResetDay: val }); });
											}
										})
									)
								),
								React.createElement('div', null,
									React.createElement('div', { className: 'h2-price-tier-rule-field' },
										React.createElement('label', null, '生效时间'),
										effectivePicker
									)
								)
							)
						)
						: null
				),
				priceType === 'tiered'
					? React.createElement('div', { className: 'h2-price-config-form-hint', role: 'note' },
						'保存后，所选客户在生效时间起按阶梯规则计价；每月重置日将清零周期加氢量并重新匹配阶梯单价'
					)
					: null
			)
				: null,
			priceModal.priceFormVisible
				? React.createElement('div', { className: 'h2-price-config-table-wrap' },
					React.createElement('div', { className: 'h2-price-config-table-head' },
						React.createElement('span', { className: 'h2-price-config-table-head__title' }, '当前规则调整记录'),
						React.createElement('span', { className: 'h2-price-config-table-head__count' }, '共 ' + logs.length + ' 条')
					),
					React.createElement(Table, {
						className: 'h2-price-config-record-table',
						size: 'small',
						bordered: false,
						rowKey: 'id',
						columns: costPriceLogColumns,
						dataSource: logs,
						pagination: logs.length > 5 ? { pageSize: 5, showSizeChanger: false, size: 'small', showTotal: function (t) { return '共 ' + t + ' 条'; } } : false,
						locale: { emptyText: '暂无价格调整记录' },
						scroll: logs.length > 5 ? { x: 920, y: 240 } : { x: 920 }
					})
				)
				: null
		);
	}, [priceModal, costPriceLogColumns, effectivePriceConfigColumns, loadPriceModalFromConfig, resetPriceModalToNew, cancelPriceFormEdit, addTierRuleRow, removeTierRuleRow, updateTierRuleField]);

	var getRechargeStationOptions = useCallback(function (currentLineId) {
		var usedIds = {};
		(rechargeModal.lines || []).forEach(function (line) {
			if (line.id !== currentLineId && line.stationId != null) usedIds[line.stationId] = true;
		});
		return listData
			.filter(function (r) { return !usedIds[r.id]; })
			.map(function (r) { return { value: r.id, label: r.name || '—' }; });
	}, [listData, rechargeModal.lines]);

	var rechargeModalColumns = useMemo(function () {
		return [
			{
				title: '站点',
				key: 'station',
				width: 180,
				fixed: 'left',
				render: function (_, line) {
					return React.createElement(Select, {
						showSearch: true,
						allowClear: true,
						placeholder: '请选择站点',
						style: { width: '100%' },
						value: line.stationId,
						options: getRechargeStationOptions(line.id),
						optionFilterProp: 'label',
						onChange: function (v) { handleRechargeStationSelect(line.id, v); }
					});
				}
			},
			{
				title: '当前余额',
				key: 'currentBalance',
				width: 108,
				align: 'right',
				render: function (_, line) {
					if (!line.stationId) {
						return React.createElement('span', { className: 'h2-recharge-readonly h2-recharge-readonly--muted' }, '—');
					}
					var num = h2NumOrZero(line.currentBalance);
					return React.createElement('span', {
						className: 'h2-recharge-readonly',
						style: { color: num < 0 ? '#dc2626' : '#059669', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }
					}, '￥' + (line.currentBalance || '0.00'));
				}
			},
			{
				title: '付款金额',
				key: 'payAmount',
				width: 130,
				render: function (_, line) {
					return React.createElement(Input, {
						className: 'h2-statement-receipt-amount-input',
						inputMode: 'decimal',
						prefix: '￥',
						placeholder: '请输入金额',
						style: { width: '100%', borderRadius: 8 },
						value: line.payAmount || '',
						onChange: function (e) {
							updateRechargeLineField(line.id, 'payAmount', h2SanitizeReceiptAmountInput(e.target.value));
						},
						onBlur: function (e) {
							updateRechargeLineField(line.id, 'payAmount', h2FormatReceiptAmountInput(e.target.value));
						}
					});
				}
			},
			{
				title: '企业全称',
				key: 'companyName',
				width: 160,
				render: function (_, line) {
					return h2RenderRechargeAutoField(line.companyName, !!line.stationId, '未关联供应商');
				}
			},
			{
				title: '收款银行账号',
				key: 'bankAccount',
				width: 150,
				render: function (_, line) {
					return h2RenderRechargeAutoField(line.bankAccount, !!line.stationId, '未配置账号');
				}
			},
			{
				title: '收款开户行全称',
				key: 'bankName',
				width: 160,
				render: function (_, line) {
					return h2RenderRechargeAutoField(line.bankName, !!line.stationId, '未配置开户行');
				}
			},
			{
				title: '转账用途',
				key: 'transferPurpose',
				width: 200,
				render: function (_, line) {
					return h2RenderRechargeAutoField(line.transferPurpose, !!line.stationId, '—');
				}
			},
			{
				title: '操作',
				key: 'action',
				width: 72,
				fixed: 'right',
				render: function (_, line) {
					return React.createElement(Button, {
						type: 'link',
						size: 'small',
						danger: true,
						disabled: (rechargeModal.lines || []).length <= 1,
						onClick: function () { removeRechargeLine(line.id); }
					}, '删除');
				}
			}
		];
	}, [rechargeModal.lines, getRechargeStationOptions, handleRechargeStationSelect, updateRechargeLineField, removeRechargeLine]);

	var listColumnsWithoutAction = useMemo(function () {
		return columns.filter(function (c) { return c.key !== 'action'; });
	}, [columns]);

	var renderRechargeModalPanel = useCallback(function () {
		var lines = rechargeModal.lines || [];
		return React.createElement('div', { className: 'h2-recharge-panel' },
			React.createElement('p', { className: 'h2-recharge-hint' },
				'选择站点后将根据供应商信息自动带出企业全称、收款银行账号、开户行及转账用途（均为只读）；仅需填写付款金额。支持添加多行，一次发起多个站点的充值付款。'
			),
			React.createElement('div', { className: 'h2-recharge-toolbar' },
				React.createElement('span', { className: 'h2-recharge-toolbar__count' }, '共 ' + lines.length + ' 条付款信息'),
				React.createElement(Button, {
					type: 'dashed',
					icon: H2_ICONS.plus,
					style: { borderRadius: 8, fontWeight: 600, borderColor: '#10b981', color: '#059669' },
					onClick: addRechargeLine
				}, '添加站点')
			),
			React.createElement('div', { className: 'h2-recharge-table-wrap' },
				React.createElement(Table, {
					className: 'h2-recharge-record-table',
					size: 'small',
					bordered: false,
					rowKey: 'id',
					columns: rechargeModalColumns,
					dataSource: lines,
					pagination: false,
					locale: { emptyText: '请添加付款站点' },
					scroll: { x: 1180 }
				})
			)
		);
	}, [rechargeModal.lines, rechargeModalColumns, addRechargeLine]);

	var renderAlertStationPanel = useCallback(function () {
		var stations = alertStationModal.stations || [];
		return React.createElement('div', { className: 'h2-alert-station-panel' },
			React.createElement('div', { className: 'h2-alert-station-head' },
				React.createElement('div', null,
					React.createElement('div', { className: 'h2-alert-station-head__title' }, alertStationModal.title || '站点列表'),
					React.createElement('div', { className: 'h2-alert-station-head__count' },
						'共 ' + stations.length + ' 个站点 · 字段与列表页一致'
					)
				),
				React.createElement(Button, {
					type: 'primary',
					style: H2_PRIMARY_BTN_STYLE,
					disabled: !stations.length,
					onClick: handleBatchRechargeFromAlert
				}, '一键发起充值单')
			),
			React.createElement('div', { className: 'h2-alert-station-table-wrap' },
				React.createElement(Table, {
					className: 'lc-list-table',
					rowKey: 'id',
					columns: listColumnsWithoutAction,
					dataSource: stations,
					pagination: stations.length > 8 ? { pageSize: 8, showSizeChanger: false, size: 'small', showTotal: function (t) { return '共 ' + t + ' 条'; } } : false,
					size: 'middle',
					scroll: { x: 1182 },
					locale: { emptyText: '暂无站点' }
				})
			)
		);
	}, [alertStationModal, listColumnsWithoutAction, handleBatchRechargeFromAlert]);

	var usedBindAccountMap = useMemo(function () {
		var excludeId = subView === 'edit' && editRecord ? editRecord.id : null;
		return h2CollectUsedBindAccountMap(listData, excludeId);
	}, [listData, subView, editRecord]);

	var createViewNode = subView === 'create' ? h2BuildStationCreateView({
		pageMode: 'create',
		showSupplier: true,
		accountEditable: true,
		showReset: false,
		station: createStation,
		supplier: createSupplier,
		supplierMode: createSupplierMode,
		linkedSupplierId: createLinkedSupplierId,
		supplierReadonly: createSupplierReadonly,
		usedBindAccountMap: usedBindAccountMap,
		updateStation: updateCreateStation,
		updateSupplier: updateCreateSupplier,
		syncSupplierFromStation: syncCreateSupplierFromStation,
		handleSupplierModeChange: handleCreateSupplierModeChange,
		handleLinkSupplierChange: handleCreateLinkSupplierChange,
		handleSupplierCityChange: handleCreateSupplierCityChange,
		onCancel: handleCreateCancel,
		onSubmit: handleCreateSubmit,
		submitting: createSubmitting,
		submitLabel: '提交创建'
	}) : null;

	var editViewNode = subView === 'edit' ? h2BuildStationCreateView({
		pageMode: 'edit',
		showSupplier: true,
		accountEditable: isAdminUser,
		showReset: false,
		station: editStation,
		supplier: editSupplier,
		supplierMode: editSupplierMode,
		linkedSupplierId: editLinkedSupplierId,
		supplierReadonly: editSupplierMode === 'link' && !!editLinkedSupplierId,
		usedBindAccountMap: usedBindAccountMap,
		updateStation: updateEditStation,
		updateSupplier: updateEditSupplier,
		syncSupplierFromStation: syncEditSupplierFromStation,
		handleSupplierModeChange: handleEditSupplierModeChange,
		handleLinkSupplierChange: handleEditLinkSupplierChange,
		handleSupplierCityChange: handleEditSupplierCityChange,
		onCancel: handleEditCancel,
		onSubmit: handleEditSubmit,
		submitting: editSubmitting,
		submitLabel: '保存修改'
	}) : null;

	var emptyNode = React.createElement('div', { style: { padding: '40px 0', textAlign: 'center' } },
		H2_ICONS.empty,
		React.createElement('div', { style: { color: '#94a3b8', marginTop: 12 } }, '暂无符合检索条件的站点')
	);

	return React.createElement('div', {
		className: 'h2-station-page lc-edit-page'
			+ (subView === 'create' || subView === 'edit' ? ' h2-station-page--create' : '')
	},
		React.createElement('style', null, H2_PAGE_STYLE),
		createViewNode,
		editViewNode,
		subView === 'list' ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' } },
			React.createElement('div', { style: { marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 } },
				React.createElement(Breadcrumb, { items: [{ title: '加氢站管理' }, { title: '站点信息' }] }),
				React.createElement(Space, { size: 8 },
					React.createElement(Button, {
						type: 'default',
						icon: H2_ICONS.doc,
						style: H2_REQ_BTN_STYLE,
						onClick: function () { setUserManualModalOpen(true); },
						'aria-label': '查看使用说明书'
					}, '查看使用说明书'),
					React.createElement(Button, {
						type: 'default',
						icon: H2_ICONS.doc,
						style: H2_REQ_BTN_STYLE,
						onClick: function () { setRequirementModalOpen(true); },
						'aria-label': '查看需求说明'
					}, '查看需求说明')
				)
			),

			React.createElement(Card, { className: 'lc-filter-card', title: '筛选条件', bordered: false },
				React.createElement('div', { className: 'lc-filter-grid' },
					renderFilterField('加氢站名称', React.createElement(Input, {
						placeholder: '请输入加氢站名称',
						value: listFilters.name,
						onChange: function (e) { setListFilters(function (p) { return Object.assign({}, p, { name: e.target.value }); }); },
						onPressEnter: handleListFilterQuery,
						allowClear: true,
						style: { width: '100%', height: 32, borderRadius: 8 }
					})),
					renderFilterField('是否签约', React.createElement(Select, {
						placeholder: '全部',
						allowClear: true,
						value: listFilters.signed,
						onChange: function (v) { setListFilters(function (p) { return Object.assign({}, p, { signed: v }); }); },
						options: [{ value: 'yes', label: '签约站点' }, { value: 'no', label: '普通站点' }],
						style: { width: '100%' },
						dropdownStyle: { borderRadius: 8 }
					})),
					renderFilterField('地区(省-市)', React.createElement(Cascader, {
						options: H2_REGION_CASCADER_OPTIONS,
						value: listFilters.region && listFilters.region.length ? listFilters.region : undefined,
						onChange: function (v) { setListFilters(function (p) { return Object.assign({}, p, { region: v || undefined }); }); },
						placeholder: '请选择省 / 市',
						allowClear: true,
						style: { width: '100%', borderRadius: 8 },
						changeOnSelect: true
					})),
					renderFilterField('营业状态', React.createElement(Select, {
						placeholder: '全部',
						allowClear: true,
						value: listFilters.businessStatus,
						onChange: function (v) { setListFilters(function (p) { return Object.assign({}, p, { businessStatus: v }); }); },
						options: H2_BUSINESS_STATUS_OPTIONS,
						style: { width: '100%' },
						dropdownStyle: { borderRadius: 8 }
					}))
				),
				React.createElement('div', { className: 'lc-filter-actions' },
					React.createElement(Button, { onClick: handleListFilterReset, style: { borderRadius: 8 } }, '重置'),
					React.createElement(Button, { type: 'primary', onClick: handleListFilterQuery, style: H2_PRIMARY_BTN_STYLE }, '查询')
				)
			),

			React.createElement('div', { className: 'lc-alert-stats-row' },
				renderAlertStatCard(H2_STATION_KPI_CARDS[0], {
					active: categoryTab === 'all' && !appliedFilters.signed,
					count: categoryCounts.all || 0,
					onClick: function () { handleKpiCardClick('all'); },
					icon: h2KpiCardIcon('all')
				}),
				H2_SIGNED_FILTER_CARDS.map(function (card) {
					return renderAlertStatCard(card, {
						active: appliedFilters.signed === card.key,
						count: card.key === 'yes' ? signedStats.signed : signedStats.unsigned,
						onClick: function () { handleSignedFilterCardClick(card.key); },
						icon: h2SignedFilterIcon(card.key)
					});
				}),
				H2_STATION_KPI_CARDS.slice(1).map(function (card) {
					var isAlertKpi = card.key === 'balanceAlert' || card.key === 'arrears';
					return renderAlertStatCard(card, {
						active: isAlertKpi
							? (alertStationModal.open && alertStationModal.type === card.key)
							: (categoryTab === card.key && !appliedFilters.signed),
						count: categoryCounts[card.key] || 0,
						onClick: function () {
							if (isAlertKpi) openAlertStationModal(card.key);
							else handleKpiCardClick(card.key);
						},
						icon: h2KpiIcon(card.key)
					});
				})
			),

			React.createElement('div', { className: 'lc-table-section' },
				React.createElement('div', { className: 'lc-table-toolbar' },
					React.createElement('div', { className: 'lc-table-toolbar-actions' },
						React.createElement(Button, {
							type: 'default',
							icon: H2_ICONS.none,
							style: { borderRadius: 8, fontWeight: 600, borderColor: '#f59e0b', color: '#d97706' },
							onClick: openGlobalBalanceAlertSetting,
							'aria-label': '全站余额提醒设置'
						}, '全站余额提醒设置'),
						React.createElement(Button, {
							type: 'default',
							icon: H2_ICONS.upload,
							style: { borderRadius: 8, fontWeight: 600, borderColor: '#10b981', color: '#059669' },
							onClick: function () { setImportModalOpen(true); },
							'aria-label': '批量导入加氢站点'
						}, '批量导入'),
						React.createElement(Button, {
							type: 'default',
							icon: H2_ICONS.doc,
							style: { borderRadius: 8, fontWeight: 600, borderColor: '#10b981', color: '#059669' },
							onClick: function () { openRechargeModal(); },
							'aria-label': '发起充值单'
						}, '发起充值单'),
						React.createElement(Button, {
							type: 'primary',
							style: H2_PRIMARY_BTN_STYLE,
							onClick: openCreate,
							'aria-label': '新建加氢站点'
						}, '新建站点')
					)
				),
				React.createElement('div', { className: 'lc-table-card' },
					React.createElement(Table, {
						className: 'lc-list-table',
						rowKey: 'id',
						columns: columns,
						dataSource: displayList,
						pagination: tablePagination,
						size: 'middle',
						scroll: { x: 1290 },
						locale: { emptyText: emptyNode },
						onChange: handleListTableChange
					})
				)
			)
		) : null,

		React.createElement(Modal, {
			title: '确认删除',
			open: deleteModal.open,
			centered: true,
			onCancel: function () { setDeleteModal({ open: false, record: null }); },
			onOk: function () {
				if (deleteModal.record) {
					setListData(function (prev) { return prev.filter(function (r) { return r.id !== deleteModal.record.id; }); });
					message.success('已删除');
				}
				setDeleteModal({ open: false, record: null });
			},
			okButtonProps: { danger: true },
			okText: '删除',
			cancelText: '取消'
		}, '确定删除站点「' + ((deleteModal.record && deleteModal.record.name) || '') + '」吗？此操作不可撤销。'),

		React.createElement(Modal, {
			className: 'h2-prd-modal h2-user-manual-modal',
			title: React.createElement('span', { style: { fontWeight: 700 } }, '使用说明书 · 站点信息'),
			open: userManualModalOpen,
			onCancel: function () { setUserManualModalOpen(false); },
			width: 900,
			centered: true,
			destroyOnClose: true,
			styles: { body: { maxHeight: '72vh', overflow: 'auto', paddingTop: 8, paddingBottom: 16 } },
			footer: React.createElement(Button, { onClick: function () { setUserManualModalOpen(false); }, style: { borderRadius: 8 } }, '关闭')
		}, renderH2StationUserManualDocPanel()),

		React.createElement(Modal, {
			className: 'h2-prd-modal',
			title: React.createElement('span', { style: { fontWeight: 700 } }, '需求说明 · 站点信息'),
			open: requirementModalOpen,
			onCancel: function () { setRequirementModalOpen(false); },
			width: 840,
			centered: true,
			destroyOnClose: true,
			styles: { body: { maxHeight: '72vh', overflow: 'auto', paddingTop: 8, paddingBottom: 16 } },
			footer: React.createElement(Button, { onClick: function () { setRequirementModalOpen(false); }, style: { borderRadius: 8 } }, '关闭')
		}, renderH2StationRequirementDocPanel()),

		React.createElement(Modal, {
			title: '批量导入加氢站点',
			open: importModalOpen,
			onCancel: closeImportModal,
			width: 560,
			centered: true,
			destroyOnClose: true,
			okText: '确认导入',
			cancelText: '取消',
			okButtonProps: {
				disabled: !importPreview || !importPreview.valid.length,
				style: H2_PRIMARY_BTN_STYLE
			},
			onOk: handleConfirmImport
		},
			React.createElement('div', { className: 'h2-import-template-bar' },
				React.createElement('div', { className: 'h2-import-template-bar-text' },
					React.createElement('div', { style: { fontWeight: 700, marginBottom: 4, color: '#0f172a' } }, '第一步：下载 CSV 导入模板'),
					'模板含加氢站名称、省、市、详细地址、是否签约、签约起止时间、营业状态、营业时间、联系人、联系电话；与新建表单字段一致。'
				),
				React.createElement(Button, {
					type: 'primary',
					ghost: true,
					style: { borderColor: '#10b981', color: '#059669', fontWeight: 600, flexShrink: 0, borderRadius: 8 },
					onClick: downloadImportTemplate
				}, '下载模板')
			),
			React.createElement(Alert, {
				type: 'info',
				showIcon: true,
				style: { marginBottom: 14, borderRadius: 10 },
				message: '第二步：填写模板后上传文件',
				description: '支持 .csv（推荐）、.xlsx、.xls；原型阶段 Excel 请另存为 CSV UTF-8 后上传。上传后系统将校验并预览可导入条数。'
			}),
			React.createElement(Upload.Dragger, {
				accept: '.csv,.xlsx,.xls',
				multiple: false,
				maxCount: 1,
				fileList: importFileList,
				beforeUpload: function (file) {
					parseImportFile(file);
					return false;
				},
				onRemove: function () {
					setImportFileList([]);
					setImportPreview(null);
					return true;
				}
			},
				React.createElement('p', { style: { margin: '8px 0 4px', fontWeight: 600, color: '#334155' } }, '点击或拖拽文件到此处上传'),
				React.createElement('p', { style: { margin: 0, fontSize: 12, color: '#94a3b8' } }, '单次上传一个文件')
			),
			importPreview ? React.createElement('div', { className: 'h2-import-preview' },
				React.createElement('div', { style: { fontWeight: 700, marginBottom: 6 } }, '解析结果 · ' + (importPreview.fileName || '')),
				React.createElement('div', null,
					React.createElement('span', { style: { color: '#059669', fontWeight: 600 } }, '可导入 ' + importPreview.valid.length + ' 条'),
					importPreview.errors.length ? React.createElement('span', { style: { marginLeft: 12, color: '#dc2626', fontWeight: 600 } }, '失败 ' + importPreview.errors.length + ' 条') : null
				),
				importPreview.errors.length ? React.createElement('ul', { className: 'h2-import-error-list' },
					importPreview.errors.slice(0, 8).map(function (err, ei) {
						return React.createElement('li', { key: ei },
							'第 ' + err.lineNo + ' 行「' + err.name + '」：' + err.reasons.join('；')
						);
					}).concat(
						importPreview.errors.length > 8
							? [React.createElement('li', { key: 'more' }, '… 另有 ' + (importPreview.errors.length - 8) + ' 条错误未展示')]
							: []
					)
				) : null
			) : null
		),

		React.createElement(Modal, {
			className: 'h2-business-status-modal',
			title: '营业状态',
			open: businessModal.open,
			onCancel: closeBusinessModal,
			footer: React.createElement(Space, null,
				React.createElement(Button, { onClick: closeBusinessModal, style: { borderRadius: 8 } }, '取消'),
				React.createElement(Button, { type: 'primary', onClick: handleSaveBusinessSetting, style: H2_PRIMARY_BTN_STYLE }, '保存')
			),
			centered: true,
			width: 760,
			destroyOnClose: true,
			styles: { body: { maxHeight: '78vh', overflow: 'auto' } }
		},
			renderBusinessStatusPanel()
		),

		React.createElement(Modal, {
			className: 'h2-refuel-drill-modal',
			title: '加氢记录',
			open: refuelModal.open,
			onCancel: closeRefuelModal,
			footer: React.createElement(Button, { type: 'primary', onClick: closeRefuelModal, style: H2_PRIMARY_BTN_STYLE }, '知道了'),
			width: 980,
			centered: true,
			destroyOnClose: true,
			styles: { body: { maxHeight: '78vh', overflow: 'auto' } }
		},
			renderRefuelDrillPanel()
		),

		React.createElement(Modal, {
			className: 'h2-station-view-modal',
			title: '查看加氢站点',
			open: viewModal.open,
			onCancel: closeViewModal,
			footer: React.createElement(Button, { type: 'primary', onClick: closeViewModal, style: H2_PRIMARY_BTN_STYLE }, '知道了'),
			width: 920,
			centered: true,
			destroyOnClose: true,
			styles: { body: { maxHeight: '78vh', overflow: 'auto' } }
		},
			renderStationViewPanel()
		),

		React.createElement(Modal, {
			className: 'h2-file-preview-modal',
			title: filePreviewModal.name || '附件预览',
			open: filePreviewModal.open,
			onCancel: closeFilePreviewModal,
			footer: React.createElement(Button, { type: 'primary', onClick: closeFilePreviewModal, style: H2_PRIMARY_BTN_STYLE }, '关闭'),
			width: filePreviewModal.type === 'pdf' ? 920 : 720,
			centered: true,
			destroyOnClose: true
		},
			React.createElement('div', { className: 'h2-file-preview-body' },
				filePreviewModal.type === 'pdf' && filePreviewModal.url
					? React.createElement('iframe', { title: filePreviewModal.name || '附件预览', src: filePreviewModal.url })
					: React.createElement('img', {
						src: filePreviewModal.url,
						alt: filePreviewModal.name || '附件预览'
					})
			)
		),

		React.createElement(Modal, {
			className: 'h2-balance-drill-modal',
			title: '余额变更明细',
			open: prepaidBalanceDrill.open,
			onCancel: closePrepaidBalanceDrill,
			footer: React.createElement(Button, { type: 'primary', onClick: closePrepaidBalanceDrill, style: H2_PRIMARY_BTN_STYLE }, '知道了'),
			width: 920,
			centered: true,
			destroyOnClose: true,
			styles: { body: { maxHeight: '78vh', overflow: 'auto' } }
		},
			renderPrepaidBalanceDrillPanel()
		),

		React.createElement(Modal, {
			className: 'h2-statement-modal',
			title: '生成对账单',
			open: statementModal.open,
			onCancel: closeStatementModal,
			footer: React.createElement(Space, null,
				React.createElement(Button, { onClick: closeStatementModal, style: { borderRadius: 8 } }, '取消'),
				statementModal.phase === 'draft'
					? React.createElement(Button, {
						type: 'primary',
						onClick: handleSubmitStatement,
						style: H2_PRIMARY_BTN_STYLE
					}, '提交对账单')
					: React.createElement(Button, {
						type: 'primary',
						onClick: handleGenerateStatement,
						style: H2_PRIMARY_BTN_STYLE
					}, '生成对账单')
			),
			centered: true,
			width: 820,
			destroyOnClose: true,
			styles: { body: { maxHeight: '78vh', overflow: 'auto' } }
		},
			renderStatementPanel()
		),

		React.createElement(Modal, {
			className: 'h2-statement-history-modal',
			title: '查看对账记录',
			open: statementHistoryModal.open,
			onCancel: closeStatementHistoryModal,
			footer: React.createElement(Button, { type: 'primary', onClick: closeStatementHistoryModal, style: H2_PRIMARY_BTN_STYLE }, '知道了'),
			centered: true,
			width: 1080,
			destroyOnClose: true,
			styles: { body: { maxHeight: '78vh', overflow: 'auto' } }
		},
			renderStatementHistoryPanel()
		),

		React.createElement(Modal, {
			className: 'h2-statement-modal',
			title: '对账明细',
			open: statementDetailModal.open,
			onCancel: closeStatementDetailModal,
			footer: React.createElement(Button, { type: 'primary', onClick: closeStatementDetailModal, style: H2_PRIMARY_BTN_STYLE }, '知道了'),
			centered: true,
			width: 820,
			destroyOnClose: true,
			styles: { body: { maxHeight: '78vh', overflow: 'auto' } }
		},
			renderStatementDetailPanel()
		),

		React.createElement(Modal, {
			className: 'h2-price-config-modal',
			title: '价格配置',
			open: priceModal.open,
			onCancel: closePriceModal,
			footer: priceModal.priceFormVisible
				? React.createElement(Space, null,
					React.createElement(Button, { onClick: cancelPriceFormEdit, style: { borderRadius: 8 } }, '取消'),
					React.createElement(Button, { type: 'primary', onClick: handleSavePriceConfig, style: H2_PRIMARY_BTN_STYLE }, '保存')
				)
				: React.createElement(Button, { onClick: closePriceModal, style: H2_PRIMARY_BTN_STYLE }, '关闭'),
			centered: true,
			width: 920,
			destroyOnClose: true,
			styles: { body: { maxHeight: '78vh', overflow: 'auto' } }
		},
			renderPriceConfigPanel()
		),

		React.createElement(Modal, {
			title: '余额提醒设置',
			open: balanceAlertModal.open,
			onCancel: closeBalanceAlertModal,
			footer: React.createElement(Space, null,
				React.createElement(Button, { onClick: closeBalanceAlertModal, style: { borderRadius: 8 } }, '取消'),
				React.createElement(Button, { type: 'primary', onClick: handleSaveBalanceAlert, style: H2_PRIMARY_BTN_STYLE }, '保存')
			),
			centered: true,
			width: 480,
			destroyOnClose: true
		},
			balanceAlertModal.record
				? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
					React.createElement('div', {
						style: {
							padding: '12px 14px',
							borderRadius: 10,
							background: '#f8fafc',
							border: '1px solid #e2e8f0',
							fontSize: 13,
							color: '#475569',
							lineHeight: 1.55
						}
					},
						React.createElement('div', { style: { fontWeight: 700, color: '#0f172a', marginBottom: 4 } }, balanceAlertModal.record.name || '—'),
						'当预付余额低于所设金额时，站点将列入「预付余额预警站点」。当前预付余额：',
						React.createElement('strong', {
							style: {
								color: h2NumOrZero(balanceAlertModal.record.prepaidBalance) < 0 ? '#dc2626' : '#059669',
								fontVariantNumeric: 'tabular-nums'
							}
						}, h2FormatYuanNum(balanceAlertModal.record.prepaidBalance)),
						' 元'
					),
					React.createElement(Form, { layout: 'vertical', requiredMark: false },
						React.createElement(Form.Item, {
							label: React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), '提醒金额（元）')
						},
							React.createElement(Input, {
								className: 'h2-statement-receipt-amount-input',
								inputMode: 'decimal',
								prefix: '￥',
								style: { width: '100%', borderRadius: 8 },
								placeholder: '请输入提醒金额',
								value: balanceAlertModal.threshold || '',
								onChange: function (e) {
									var next = h2SanitizeReceiptAmountInput(e.target.value);
									setBalanceAlertModal(function (m) { return Object.assign({}, m, { threshold: next }); });
								},
								onBlur: function (e) {
									var formatted = h2FormatReceiptAmountInput(e.target.value);
									setBalanceAlertModal(function (m) { return Object.assign({}, m, { threshold: formatted }); });
								}
							})
						)
					)
				)
				: null
		),

		React.createElement(Modal, {
			title: '全站余额提醒设置',
			open: globalBalanceAlertModal.open,
			onCancel: closeGlobalBalanceAlertModal,
			footer: React.createElement(Space, null,
				React.createElement(Button, { onClick: closeGlobalBalanceAlertModal, style: { borderRadius: 8 } }, '取消'),
				React.createElement(Button, { type: 'primary', onClick: handleSaveGlobalBalanceAlert, style: H2_PRIMARY_BTN_STYLE }, '保存')
			),
			centered: true,
			width: 480,
			destroyOnClose: true
		},
			React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
				React.createElement('div', {
					style: {
						padding: '12px 14px',
						borderRadius: 10,
						background: '#f8fafc',
						border: '1px solid #e2e8f0',
						fontSize: 13,
						color: '#475569',
						lineHeight: 1.55
					}
				},
					React.createElement('div', { style: { fontWeight: 700, color: '#0f172a', marginBottom: 4 } }, '全部加氢站'),
					'将对全部 ',
					React.createElement('strong', { style: { color: '#0f172a', fontVariantNumeric: 'tabular-nums' } }, listData.length),
					' 个加氢站统一设置余额提醒阈值。当某站点预付余额低于所设金额时，该站点将列入「预付余额预警站点」。'
				),
				React.createElement(Form, { layout: 'vertical', requiredMark: false },
					React.createElement(Form.Item, {
						label: React.createElement('span', null, React.createElement('span', { style: { color: '#ef4444', marginRight: 4 } }, '*'), '提醒金额（元）')
					},
						React.createElement(Input, {
							className: 'h2-statement-receipt-amount-input',
							inputMode: 'decimal',
							prefix: '￥',
							style: { width: '100%', borderRadius: 8 },
							placeholder: '请输入提醒金额',
							value: globalBalanceAlertModal.threshold || '',
							onChange: function (e) {
								var next = h2SanitizeReceiptAmountInput(e.target.value);
								setGlobalBalanceAlertModal(function (m) { return Object.assign({}, m, { threshold: next }); });
							},
							onBlur: function (e) {
								var formatted = h2FormatReceiptAmountInput(e.target.value);
								setGlobalBalanceAlertModal(function (m) { return Object.assign({}, m, { threshold: formatted }); });
							}
						})
					)
				)
			)
		),

		React.createElement(Modal, {
			className: 'h2-recharge-modal',
			title: '发起充值单',
			open: rechargeModal.open,
			onCancel: closeRechargeModal,
			footer: React.createElement(Space, null,
				React.createElement(Button, { onClick: closeRechargeModal, style: { borderRadius: 8 } }, '取消'),
				React.createElement(Button, { type: 'primary', onClick: handleSubmitRecharge, style: H2_PRIMARY_BTN_STYLE }, '发起付款流程')
			),
			centered: true,
			width: 1120,
			destroyOnClose: true,
			styles: { body: { maxHeight: '78vh', overflow: 'auto' } }
		},
			renderRechargeModalPanel()
		),

		React.createElement(Modal, {
			className: 'h2-alert-station-modal',
			title: alertStationModal.title || '站点列表',
			open: alertStationModal.open,
			onCancel: closeAlertStationModal,
			footer: React.createElement(Space, null,
				React.createElement(Button, { onClick: closeAlertStationModal, style: { borderRadius: 8 } }, '关闭'),
				React.createElement(Button, {
					type: 'primary',
					disabled: !(alertStationModal.stations || []).length,
					onClick: handleBatchRechargeFromAlert,
					style: H2_PRIMARY_BTN_STYLE
				}, '一键发起充值单')
			),
			centered: true,
			width: 1200,
			destroyOnClose: true,
			styles: { body: { maxHeight: '78vh', overflow: 'auto' } }
		},
			renderAlertStationPanel()
		)
	);
};

if (typeof window !== 'undefined') window.Component = Component;
