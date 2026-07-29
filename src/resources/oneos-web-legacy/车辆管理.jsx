// 【重要】必须使用 const Component 作为组件变量名
// 车辆资产管理 - 车辆管理模块（中后台 Ant Design 原型）

/** @see web端/styles/oneos-ant-table-global-fix.js */
var ONEOS_ANT_TABLE_GLOBAL_FIX = [
	'.ant-table-container .ant-table-header { margin-bottom: 0 !important; }',
	'.ant-table-container .ant-table-body { margin-top: 0 !important; }',
	'.ant-table-container .ant-table-body > table, .ant-table-content table { margin-top: 0 !important; }',
	'.ant-table-tbody > tr.ant-table-measure-row, .ant-table-tbody > tr.ant-table-measure-row > td, .ant-table-tbody > tr.ant-table-measure-row > th { display: none !important; height: 0 !important; max-height: 0 !important; min-height: 0 !important; padding: 0 !important; margin: 0 !important; border: none !important; line-height: 0 !important; font-size: 0 !important; overflow: hidden !important; visibility: hidden !important; pointer-events: none !important; }'
];

var VM_PAGE_STYLE = ONEOS_ANT_TABLE_GLOBAL_FIX.concat([
	'.vm-page { padding: 24px 24px 32px; min-height: 100vh; box-sizing: border-box; background: linear-gradient(165deg, #f1f5f9 0%, #f8fafc 50%, #f1f5f9 100%); font-family: Inter, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; color: #0f172a; }',
	'.vm-page .lc-filter-card.ant-card { border-radius: 16px !important; border: 1px solid #e2e8f0 !important; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03) !important; margin-bottom: 16px; }',
	'.vm-page .lc-filter-card > .ant-card-head { border-bottom: 1px solid #f1f5f9 !important; min-height: auto; padding: 12px 20px !important; }',
	'.vm-page .lc-filter-card > .ant-card-head .ant-card-head-title { font-size: 15px !important; font-weight: 700 !important; color: #0f172a !important; padding: 0 !important; }',
	'.vm-page .lc-filter-card > .ant-card-body { padding: 16px 20px 20px !important; }',
	'.vm-page .lc-filter-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px 24px; align-items: center; }',
	'@media (max-width: 1280px) { .vm-page .lc-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }',
	'@media (max-width: 640px) { .vm-page .lc-filter-grid { grid-template-columns: 1fr; } }',
	'.vm-page .lc-filter-field { display: flex; align-items: center; gap: 12px; min-width: 0; min-height: 32px; }',
	'.vm-page .lc-filter-field-label { flex: 0 0 88px; text-align: right; font-size: 13px; font-weight: 500; color: #475569; line-height: 32px; white-space: nowrap; }',
	'.vm-page .lc-filter-field-control { flex: 1; min-width: 0; }',
	'.vm-page .lc-filter-field-control .ant-input, .vm-page .lc-filter-field-control .ant-input-affix-wrapper, .vm-page .lc-filter-field-control .ant-select .ant-select-selector, .vm-page .lc-filter-field-control .ant-cascader .ant-select-selector { width: 100%; height: 32px !important; min-height: 32px !important; border-radius: 8px !important; box-sizing: border-box; }',
	'.vm-page .lc-filter-actions { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f5f9; flex-wrap: wrap; }',
	'.vm-page .lc-table-section { margin-bottom: 0; display: flex; flex-direction: column; min-height: 0; }',
	'.vm-page .lc-table-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px 16px; margin-bottom: 8px; min-height: 32px; }',
	'.vm-page .lc-table-toolbar-meta { font-size: 13px; color: #64748b; }',
	'.vm-page .lc-table-toolbar-meta strong { font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; }',
	'.vm-page .lc-table-toolbar-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-left: auto; }',
	'.vm-page .lc-table-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03); overflow: hidden; }',
	'.vm-page .lc-list-table .ant-table-thead > tr > th { background: #f8fafc !important; color: #475569 !important; font-weight: 700 !important; font-size: 13px !important; border-bottom: 1px solid #e2e8f0 !important; padding: 12px 16px !important; white-space: nowrap !important; }',
	'.vm-page .lc-list-table .ant-table-tbody > tr:not(.ant-table-measure-row) > td { padding: 12px 16px !important; font-size: 13px; }',
	'.vm-page .lc-list-table .ant-table-tbody > tr:not(.ant-table-measure-row):hover > td { background: #f8fafc !important; }',
	'.vm-page .lc-list-table .ant-pagination { margin: 0 !important; padding: 12px 16px !important; border-top: 1px solid #f1f5f9; }',
	'.vm-page .lc-action-btn { font-weight: 600 !important; color: #10b981 !important; padding: 0 !important; min-height: 44px; }',
	'.vm-page .vm-action-more-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; color: #64748b; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }',
	'.vm-page .vm-action-more-btn:hover { background: #f1f5f9; color: #334155; }',
	'.vm-page .vm-action-more-btn:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.vm-page .vm-btn-req { border-radius: 8px !important; border: 1px solid #cbd5e1 !important; font-weight: 600 !important; color: #475569 !important; box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important; }',
	'.vm-page .vm-col-title-with-tip { display: inline-flex; align-items: center; gap: 4px; max-width: 100%; white-space: nowrap; }',
	'.vm-page .vm-col-title-tip { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 50%; color: #94a3b8; border: 1px solid #e2e8f0; background: #fff; cursor: help; line-height: 0; flex-shrink: 0; transition: color 0.15s ease, border-color 0.15s ease; }',
	'.vm-page .vm-col-title-tip:hover { color: #64748b; border-color: #cbd5e1; }',
	'.vm-page .vm-col-title-tip:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.vm-page .vm-vehicle-identity-cell { display: flex; flex-direction: column; gap: 2px; min-width: 0; white-space: normal; line-height: 1.35; }',
	'.vm-page .vm-vehicle-identity-plate { font-size: 13px; font-weight: 600; color: #0f172a; font-variant-numeric: tabular-nums; }',
	'.vm-page .vm-plate-link.vm-vehicle-identity-plate { padding: 0; cursor: pointer; background: none; border: none; text-align: left; }',
	'.vm-page .vm-plate-link.vm-vehicle-identity-plate:hover { color: #10b981; text-decoration: underline; text-underline-offset: 2px; }',
	'.vm-page .vm-plate-link.vm-vehicle-identity-plate:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; border-radius: 4px; }',
	'.vm-page .vm-vehicle-identity-vin { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #64748b; letter-spacing: 0.02em; word-break: break-all; }',
	'.vm-page .vm-plate-link.vm-vehicle-identity-vin { padding: 0; cursor: pointer; background: none; border: none; text-align: left; width: 100%; font-weight: 400; }',
	'.vm-page .vm-plate-link.vm-vehicle-identity-vin:hover { color: #10b981; text-decoration: underline; text-underline-offset: 2px; }',
	'.vm-page .vm-plate-link.vm-vehicle-identity-vin:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; border-radius: 4px; }',
	'.vm-page .vm-vehicle-identity-brand { font-size: 12px; color: #475569; }',
	'.vm-page .lc-list-table .ant-table-tbody > tr:not(.ant-table-measure-row) > td.vm-vehicle-identity-td { white-space: normal !important; overflow: visible !important; vertical-align: middle !important; }',
	'.vm-page .lc-list-table .ant-table-tbody > tr:not(.ant-table-measure-row) > td.vm-stacked-cell-td { white-space: normal !important; overflow: visible !important; vertical-align: middle !important; }',
	'.vm-page .vm-stacked-cell { display: flex; flex-direction: column; gap: 2px; min-width: 0; white-space: normal; line-height: 1.35; }',
	'.vm-page .vm-stacked-cell-line { font-size: 13px; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
	'.vm-page .vm-stacked-cell-line--primary { font-weight: 600; }',
	'.vm-page .vm-stacked-cell-line--code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #64748b; letter-spacing: 0.01em; }',
	'.vm-page .vm-stacked-cell-line--sub { font-size: 12px; color: #475569; }',
	'.vm-page .vm-oneline-text { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; font-size: 13px; color: #0f172a; }',
	'.vm-page .vm-insurance-expire-date { font-variant-numeric: tabular-nums; letter-spacing: 0.01em; }',
	'.vm-page .lc-list-table .ant-table-tbody > tr:not(.ant-table-measure-row) > td.vm-expire-date-td { white-space: normal !important; overflow: visible !important; vertical-align: middle !important; }',
	'.vm-page .vm-expire-date-cell { display: flex; flex-direction: row; align-items: center; gap: 6px; flex-wrap: wrap; min-width: 0; white-space: normal; line-height: 1.35; }',
	'.vm-page .vm-expire-remain-tag { margin: 0 !important; flex-shrink: 0; border-radius: 6px !important; font-weight: 600 !important; font-size: 11px !important; line-height: 1.2 !important; }',
	'.vm-page .lc-alert-stats-row { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }',
	'@media (max-width: 1600px) { .vm-page .lc-alert-stats-row { grid-template-columns: repeat(4, minmax(0, 1fr)); } }',
	'@media (max-width: 960px) { .vm-page .lc-alert-stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }',
	'@media (max-width: 640px) { .vm-page .lc-alert-stats-row { grid-template-columns: 1fr; } }',
	'.vm-page .lc-alert-card { display: flex; align-items: center; gap: 14px; padding: 14px 30px 14px 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; position: relative; overflow: hidden; min-width: 0; min-height: 76px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }',
	'.vm-page .lc-alert-card-main { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 6px; }',
	'.vm-page .lc-alert-card-icon { flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(145deg, #0d7a63 0%, #065f4a 100%); color: #fff; box-shadow: 0 4px 12px rgba(6, 95, 74, 0.28); }',
	'.vm-page .lc-alert-card-icon svg { display: block; flex-shrink: 0; }',
	'.vm-page .lc-alert-card-val { font-size: 24px; font-weight: 800; line-height: 1.1; color: #0f172a; font-variant-numeric: tabular-nums; flex-shrink: 0; }',
	'.vm-page .lc-alert-card-title { width: 100%; min-width: 0; font-size: 13px; font-weight: 600; color: #64748b; line-height: 1.35; white-space: normal; }',
	'.vm-page .lc-alert-card-tip-anchor { position: absolute; top: 8px; right: 8px; z-index: 2; line-height: 0; }',
	'.vm-page .lc-alert-card-tip { width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #94a3b8; background: rgba(255,255,255,0.92); border: 1px solid #e2e8f0; cursor: help; line-height: 0; }',
	'.vm-page .lc-alert-card-tip:hover { color: #64748b; border-color: #cbd5e1; background: #fff; }',
	'.vm-page .lc-alert-card--total, .vm-page .lc-alert-card--normal, .vm-page .lc-alert-card--warning, .vm-page .lc-alert-card--nonOperating, .vm-page .lc-alert-card--unuploaded, .vm-page .lc-alert-card--license, .vm-page .lc-alert-card--insurance { background: #fff; border-color: #e2e8f0; }',
	'.vm-page .lc-alert-card-clickable { cursor: pointer; transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease; }',
	'.vm-page .lc-alert-card-clickable:hover { box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08); }',
	'.vm-page .lc-alert-card-clickable:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.vm-page .lc-alert-card-active { box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25) !important; border-color: #10b981 !important; }',
	'.vm-page .lc-alert-card--with-side { padding-right: 16px; }',
	'.vm-page .lc-alert-card--with-side .lc-alert-card-tip-anchor { right: 108px; }',
	'.vm-page .vm-kpi-card-side { flex: 0 0 auto; display: flex; align-items: stretch; margin-left: auto; padding-left: 12px; border-left: 1px solid #e2e8f0; min-width: 92px; }',
	'.vm-page .vm-kpi-card-side-item { display: flex; flex-direction: column; justify-content: center; gap: 4px; min-width: 0; padding: 0 4px 0 12px; border-radius: 8px; cursor: pointer; transition: background 0.15s ease; }',
	'.vm-page .vm-kpi-card-side-item:hover { background: #f8fafc; }',
	'.vm-page .vm-kpi-card-side-item:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.vm-page .vm-kpi-card-side-item--active { background: #ecfdf5; }',
	'.vm-page .vm-kpi-card-side-title { font-size: 11px; font-weight: 600; color: #64748b; line-height: 1.3; white-space: nowrap; }',
	'.vm-page .vm-kpi-card-side-val { font-size: 18px; font-weight: 800; color: #0f172a; font-variant-numeric: tabular-nums; line-height: 1.1; }',
	'.vm-page .lc-filter-field-control .ant-select-multiple .ant-select-selector { height: auto !important; min-height: 32px !important; padding-top: 2px !important; padding-bottom: 2px !important; }',
	'.vm-page .vm-online-status { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; line-height: 1.35; }',
	'.vm-page .vm-online-status .vm-online-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }',
	'.vm-page .vm-online-status--on .vm-online-dot { background: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.22); }',
	'.vm-page .vm-online-status--off .vm-online-dot { background: #ef4444; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.18); }',
	'.vm-page .vm-online-status .vm-online-label { color: #0f172a; font-weight: 500; }',
	'.vm-page .vm-gps-location-cell { display: flex; flex-direction: column; gap: 4px; min-width: 0; white-space: normal; line-height: 1.35; }',
	'.vm-page .vm-gps-location-row { display: flex; align-items: center; min-width: 0; }',
	'.vm-page .vm-gps-location-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: #0f172a; max-width: 100%; }',
	'.vm-page .vm-gps-location-row--status { min-height: 20px; }',
	'.vm-page .vm-gps-location-time { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; letter-spacing: 0.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }',
	'.vm-page .lc-list-table .ant-table-tbody > tr:not(.ant-table-measure-row) > td.vm-gps-location-td { white-space: normal !important; overflow: visible !important; vertical-align: middle !important; }',
	'.vm-page .vm-mileage-cell { display: flex; flex-direction: row; align-items: center; gap: 6px; flex-wrap: wrap; min-width: 0; white-space: normal; line-height: 1.35; }',
	'.vm-page .vm-mileage-value { font-size: 13px; font-weight: 600; color: #0f172a; font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }',
	'.vm-page .vm-mileage-source-tag { margin: 0 !important; flex-shrink: 0; border-radius: 6px !important; font-size: 11px !important; font-weight: 600 !important; line-height: 1.2 !important; }',
	'.vm-page .lc-list-table .ant-table-tbody > tr:not(.ant-table-measure-row) > td.vm-mileage-cell-td { white-space: normal !important; overflow: visible !important; vertical-align: middle !important; }',
	'.vm-page .vm-handover-situation-cell { display: flex; flex-direction: column; gap: 4px; min-width: 0; white-space: normal; line-height: 1.35; }',
	'.vm-page .vm-handover-situation-mile { font-size: 13px; font-weight: 600; color: #0f172a; font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
	'.vm-page .vm-handover-situation-region { font-size: 12px; color: #475569; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
	'.vm-page .vm-handover-situation-datetime { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; letter-spacing: 0.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
	'.vm-page .vm-ops-manager-cell { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; font-size: 13px; color: #0f172a; }',
	'.vm-page .vm-ops-manager-cell--clickable { cursor: pointer; transition: color 0.15s ease; }',
	'.vm-page .vm-ops-manager-cell--clickable:hover { color: #10b981; }',
	'.vm-page .vm-ops-manager-cell--clickable:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; border-radius: 4px; }',
	'.vm-page .vm-ops-manager-cell--placeholder { color: #94a3b8; }',
	'.vm-page .vm-col-title-with-action { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; white-space: nowrap; }',
	'.vm-page .vm-col-title-edit-btn { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; min-width: 22px; padding: 0; border: none; border-radius: 6px; background: transparent; color: #64748b; cursor: pointer; line-height: 0; flex-shrink: 0; transition: color 0.15s ease, background 0.15s ease; }',
	'.vm-page .vm-col-title-edit-btn:hover { color: #059669; background: #ecfdf5; }',
	'.vm-page .vm-col-title-edit-btn:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.vm-page .vm-ops-manager-modal-body { display: flex; flex-direction: column; gap: 16px; }',
	'.vm-page .vm-ops-manager-modal-card { padding: 14px 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 10px; }',
	'.vm-page .vm-ops-manager-modal-card-row { display: flex; align-items: flex-start; gap: 12px; min-width: 0; font-size: 13px; line-height: 1.5; }',
	'.vm-page .vm-ops-manager-modal-card-label { flex: 0 0 108px; color: #64748b; font-weight: 500; white-space: nowrap; }',
	'.vm-page .vm-ops-manager-modal-card-value { flex: 1; min-width: 0; color: #0f172a; font-weight: 600; word-break: break-word; }',
	'.vm-page .vm-ops-manager-modal-field { display: flex; flex-direction: column; gap: 8px; }',
	'.vm-page .vm-ops-manager-modal-field-label { font-size: 13px; font-weight: 600; color: #0f172a; }',
	'.vm-page .vm-import-modal { display: flex; flex-direction: column; gap: 14px; }',
	'.vm-page .vm-import-step-card { padding: 16px 18px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }',
	'.vm-page .vm-import-step-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }',
	'.vm-page .vm-import-step-badge { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 999px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-size: 12px; font-weight: 700; flex-shrink: 0; }',
	'.vm-page .vm-import-step-title { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.35; }',
	'.vm-page .vm-import-download-btn.ant-btn { min-height: 44px; height: 44px; padding: 0 18px; border-radius: 10px !important; font-weight: 600; }',
	'.vm-page .vm-import-uploader.ant-upload-wrapper { display: block; }',
	'.vm-page .vm-import-uploader.ant-upload-wrapper .ant-upload-drag { border: 1.5px dashed #cbd5e1 !important; border-radius: 12px !important; background: #fff !important; padding: 24px 16px !important; transition: border-color 0.2s ease, background 0.2s ease; }',
	'.vm-page .vm-import-uploader.ant-upload-wrapper .ant-upload-drag:hover { border-color: #34d399 !important; background: #f0fdf4 !important; }',
	'.vm-page .vm-import-uploader.ant-upload-wrapper .ant-upload-drag.ant-upload-drag-hover { border-color: #10b981 !important; background: #ecfdf5 !important; }',
	'.vm-page .vm-import-upload-icon { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; margin: 0 auto 10px; border-radius: 12px; background: #ecfdf5; color: #059669; }',
	'.vm-page .vm-import-upload-title { margin: 0; font-size: 15px; font-weight: 600; color: #0f172a; }',
	'.vm-page .vm-import-upload-hint { margin: 6px 0 0; font-size: 13px; color: #64748b; line-height: 1.45; }',
	'.vm-page .vm-import-fail { padding: 12px 14px; border-radius: 10px; background: #fef2f2; border: 1px solid #fecaca; }',
	'.vm-page .vm-import-fail-title { font-size: 13px; font-weight: 700; color: #b91c1c; margin-bottom: 8px; }',
	'.vm-page .vm-import-fail-item { font-size: 12px; color: #7f1d1d; line-height: 1.5; margin-bottom: 4px; }',
	'.vm-import-modal-wrap .vm-import-close-btn.ant-btn { min-height: 44px; height: 44px; padding: 0 16px; border-radius: 10px !important; }',
	'.vm-page .vm-modal-hint { font-size: 13px; color: #64748b; margin-bottom: 12px; line-height: 1.55; }',
	'.vm-multi-plate-popover.ant-popover { max-width: none !important; }',
	'.vm-multi-plate-popover .ant-popover-inner { width: 288px !important; max-width: calc(100vw - 32px) !important; padding: 0 !important; border-radius: 12px !important; box-shadow: 0 8px 28px rgba(15, 23, 42, 0.12) !important; overflow: hidden; }',
	'.vm-multi-plate-popover .ant-popover-inner-content { padding: 0 !important; }',
	'.vm-multi-plate-popover .vm-multi-plate-pop { width: 100%; padding: 16px 16px 14px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; }',
	'.vm-multi-plate-popover .vm-multi-plate-pop-textarea.ant-input-textarea { margin: 0 !important; width: 100%; display: block; }',
	'.vm-multi-plate-popover .vm-multi-plate-pop-textarea textarea { width: 100% !important; box-sizing: border-box !important; border-radius: 8px !important; border-color: #e2e8f0 !important; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; font-size: 13px !important; line-height: 1.5 !important; padding: 10px 12px !important; min-height: 120px !important; resize: none !important; box-shadow: none !important; }',
	'.vm-multi-plate-popover .vm-multi-plate-pop-textarea textarea:hover { border-color: #cbd5e1 !important; }',
	'.vm-multi-plate-popover .vm-multi-plate-pop-textarea textarea:focus { border-color: #10b981 !important; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.18) !important; }',
	'.vm-multi-plate-popover .vm-multi-plate-pop-actions { display: flex; justify-content: flex-end; align-items: center; margin: 0; padding: 4px 0 2px; }',
	'.vm-multi-plate-popover .vm-multi-plate-pop-actions .ant-btn { min-height: 36px; height: 36px; padding: 0 16px; border-radius: 8px !important; font-size: 13px; font-weight: 600; line-height: 1; }',
	'.vm-page .vm-multi-plate-trigger { cursor: pointer; width: 100%; }',
	'.vm-page .vm-multi-plate-trigger.ant-input-affix-wrapper { border-radius: 8px !important; align-items: center !important; }',
	'.vm-page .vm-multi-plate-trigger .ant-input { cursor: pointer; text-align: left !important; line-height: 30px !important; height: 30px !important; padding-top: 0 !important; padding-bottom: 0 !important; }',
	'.vm-page .vm-multi-plate-trigger .ant-input::placeholder { text-align: left; color: #bfbfbf; }',
	'.vm-page .vm-list-topbar { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 16px; }',
	'.vm-page .vm-detail-topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }',
	'.vm-page .vm-detail-topbar-title { margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.3; }',
	'.vm-page .vm-detail-back-btn.ant-btn { min-height: 44px; height: 44px; padding: 0 16px; border-radius: 10px !important; border-color: #e2e8f0 !important; font-weight: 600 !important; color: #334155 !important; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important; transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease; }',
	'.vm-page .vm-detail-back-btn.ant-btn:hover { color: #059669 !important; border-color: #a7f3d0 !important; background: #ecfdf5 !important; }',
	'.vm-page .vm-detail-back-btn.ant-btn:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }',
	'.vm-page .vm-detail-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; margin-bottom: 16px; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.05); }',
	'.vm-page .vm-section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 15px; font-weight: 700; color: #0f172a; }',
	'.vm-page .vm-section-title::before { content: ""; width: 3px; height: 14px; border-radius: 2px; background: linear-gradient(180deg, #10b981, #34d399); flex-shrink: 0; }',
	'.vm-page .vm-section-title--follow { margin-top: 24px; }',
	'.vm-page .vm-detail-hero { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 16px 24px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }',
	'.vm-page .vm-detail-hero-identity { min-width: 0; flex: 1 1 240px; }',
	'.vm-page .vm-detail-plate-xl { font-size: 24px; font-weight: 800; color: #0f172a; font-variant-numeric: tabular-nums; letter-spacing: 0.03em; line-height: 1.2; }',
	'.vm-page .vm-detail-meta-line { margin-top: 6px; font-size: 13px; color: #64748b; line-height: 1.45; }',
	'.vm-page .vm-detail-meta-line--mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; letter-spacing: 0.02em; }',
	'.vm-page .vm-detail-hero-tags { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: flex-end; }',
	'.vm-page .vm-detail-hero-aside { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; min-width: 0; flex: 0 1 360px; max-width: 100%; text-align: right; }',
	'.vm-page .vm-detail-hero-location { font-size: 13px; font-weight: 500; color: #334155; line-height: 1.45; max-width: 100%; word-break: break-word; }',
	'.vm-page .vm-detail-hero-gps-time { font-size: 12px; color: #64748b; line-height: 1.4; font-variant-numeric: tabular-nums; }',
	'.vm-page .vm-detail-quick-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }',
	'@media (max-width: 960px) { .vm-page .vm-detail-quick-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }',
	'@media (max-width: 480px) { .vm-page .vm-detail-quick-stats { grid-template-columns: 1fr; } }',
	'.vm-page .vm-detail-stat-card { min-width: 0; padding: 12px 14px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }',
	'.vm-page .vm-detail-stat-label { margin-bottom: 4px; font-size: 12px; font-weight: 500; color: #64748b; }',
	'.vm-page .vm-detail-stat-value { font-size: 14px; font-weight: 600; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
	'.vm-page .vm-detail-stat-value--rich { overflow: visible; white-space: normal; text-overflow: clip; }',
	'.vm-page .vm-detail-stat-value--rich .vm-mileage-cell { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }',
	'.vm-page .vm-detail-field-value .vm-expire-date-cell { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 6px; }',
	'.vm-page .vm-detail-fields-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px 16px; }',
	'@media (max-width: 1280px) { .vm-page .vm-detail-fields-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }',
	'@media (max-width: 640px) { .vm-page .vm-detail-fields-grid { grid-template-columns: 1fr; } }',
	'.vm-page .vm-detail-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; padding: 12px 14px; border-radius: 10px; background: #fff; border: 1px solid #e2e8f0; transition: border-color 0.15s ease, box-shadow 0.15s ease; }',
	'.vm-page .vm-detail-field:hover { border-color: #cbd5e1; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); }',
	'.vm-page .vm-detail-field-label { font-size: 12px; font-weight: 500; color: #64748b; line-height: 1.4; }',
	'.vm-page .vm-detail-field-value { min-width: 0; font-size: 14px; font-weight: 500; color: #0f172a; line-height: 1.45; word-break: break-word; }',
	'.vm-page .vm-detail-field-value .vm-stacked-cell-line { white-space: normal; }',
	'.vm-page .vm-expand-bar { margin-top: 4px; padding-top: 16px; text-align: center; border-top: 1px solid #f1f5f9; }',
	'.vm-page .vm-expand-bar .ant-btn { min-height: 44px; font-weight: 600; }',
	'.vm-page .vm-detail-tabs .ant-tabs-nav { margin-bottom: 16px; }',
	'.vm-page .vm-detail-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn { font-weight: 600; color: #059669; }',
	'.vm-page .vm-detail-tabs .ant-tabs-ink-bar { background: #10b981; }',
	'.vm-page .vm-tab-card { padding: 20px 0 0; }',
	'.vm-page .vm-model-param-tab { display: flex; flex-direction: column; gap: 16px; padding-top: 4px; }',
	'.vm-page .vm-model-param-section { padding: 16px 18px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }',
	'.vm-page .vm-model-param-section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.35; }',
	'.vm-page .vm-model-param-section-title::before { content: ""; width: 3px; height: 14px; border-radius: 2px; background: linear-gradient(180deg, #10b981, #34d399); flex-shrink: 0; }',
	'.vm-page .vm-model-param-section .vm-detail-fields-grid { margin-bottom: 0; }',
	'.vm-page .vm-model-param-table-wrap { margin-top: 4px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; background: #fff; }',
	'.vm-page .vm-model-param-table-wrap .ant-table-thead > tr > th { background: #f1f5f9 !important; font-weight: 600; color: #475569; }',
	'.vm-page .vm-model-param-table-wrap .ant-table-tbody > tr > td { background: #fff; }',
	'.vm-page .vm-tab-placeholder { padding: 8px 0; font-size: 14px; color: #64748b; }',
	'.vm-page .vm-kv-link { font-weight: 600; color: #10b981; cursor: pointer; background: none; border: none; text-align: left; }',
	'.vm-page .vm-kv-link:hover { text-decoration: underline; }',
	'.vm-page .vm-kv-link:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; border-radius: 4px; }'
]).join('\n');

var VM_PRIMARY_BTN_STYLE = {
	borderRadius: 8,
	fontWeight: 600,
	background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
	border: 'none'
};

// 样例数据：Excel 真实数据抽样 100 条，覆盖各品牌-型号组合
var VM_SAMPLE_VEHICLE_DATA = [
	{ id: "1", plateNo: "粤AGR8556", vin: "LB9A32A20R0LS1343", vehicleNo: "-", color: "白色", year: "-", purchaseDate: "-", parking: "广州开创大道停车场", ownership: "广州开发区交投氢能运营管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "广州开发区交投氢能运营管理有限公司", vehicleType: "轻型厢式货车", brand: "现代", model: "帕力安牌4.5吨冷链车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "0.00", location: "广东省广州市", gpsTime: "2026-06-23 14:07:17", regDate: "2025-02-19", inspectExpire: "2027-02-28", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "2", plateNo: "粤AGP4435", vin: "LB9A32A20R0LS1357", vehicleNo: "1357", color: "白色", year: "-", purchaseDate: "-", parking: "-", ownership: "羚牛氢能科技(广东)有限公司", scrapDate: "2040-06-20", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "自有", leaseCompany: "-", vehicleType: "轻型厢式货车", brand: "现代", model: "帕力安牌4.5吨冷链车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "异动中", licenseStatus: "正常", insuranceStatus: "正常", mileage: "0.00", location: "广东省广州市", gpsTime: "2026-06-23 14:17:35", regDate: "2025-06-20", inspectExpire: "2026-06-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "3", plateNo: "粤AGP5156", vin: "LB9A32A20R0LS1360", vehicleNo: "-", color: "白色", year: "-", purchaseDate: "-", parking: "-", ownership: "广州开发区交投氢能运营管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "广州开发区交投氢能运营管理有限公司", vehicleType: "轻型厢式货车", brand: "现代", model: "帕力安牌4.5吨冷链车", customer: "广州新运多租赁有限公司", department: "业务三部", manager: "金可鹏", contractNo: "LNZLHT2026060901-042", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "25468.00", location: "广东省广州市", gpsTime: "2026-06-23 14:17:34", regDate: "2025-02-25", inspectExpire: "2027-02-28", lastDeliveryTime: "2026-06-11 12:21:19", lastDeliveryMile: "25468.00", lastReturnTime: "2026-06-06 09:58:00", lastReturnMile: "25372.00", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "4", plateNo: "沪A66921F", vin: "LKLG7C4E0NA774726", vehicleNo: "22FHD0003", color: "白", year: "-", purchaseDate: "-", parking: "-", ownership: "上海宇速物流有限公司", scrapDate: "-", ratingTime: "2026-09-30 00:00:00", operateCompany: "上海宇速物流有限公司", vehicleSource: "自有", leaseCompany: "上海宇速物流有限公司", vehicleType: "重型厢式货车", brand: "苏龙", model: "海格牌18吨双飞翼货车", customer: "上海利合供应链管理有限公司", department: "业务三部", manager: "金可鹏", contractNo: "LNZLHT2026011301-042", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "6210.00", location: "上海市奉贤区", gpsTime: "2026-06-23 14:17:35", regDate: "2022-09-14", inspectExpire: "2026-09-11", lastDeliveryTime: "2023-07-11 17:00:00", lastDeliveryMile: "6210.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "5", plateNo: "沪A02720F", vin: "LKLG7C4E0NA774743", vehicleNo: "22FHD0020", color: "白", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "上海宇速物流有限公司", scrapDate: "-", ratingTime: "2026-09-30 00:00:00", operateCompany: "上海宇速物流有限公司", vehicleSource: "自有", leaseCompany: "上海宇速物流有限公司", vehicleType: "重型厢式货车", brand: "苏龙", model: "海格牌18吨双飞翼货车", customer: "南京威路物流有限公司", department: "业务三部", manager: "金可鹏", contractNo: "LNZLHT2025110402", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "31233.00", location: "河南省开封市", gpsTime: "2026-06-23 14:07:16", regDate: "2022-09-09", inspectExpire: "2026-07-17", lastDeliveryTime: "2025-10-01 00:00:00", lastDeliveryMile: "31233.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "6", plateNo: "沪A05675F", vin: "LKLG7C4E0NA774757", vehicleNo: "22FHD0034", color: "白", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "上海宇速物流有限公司", scrapDate: "-", ratingTime: "2026-10-31 00:00:00", operateCompany: "上海宇速物流有限公司", vehicleSource: "自有", leaseCompany: "上海宇速物流有限公司", vehicleType: "重型厢式货车", brand: "苏龙", model: "海格牌18吨双飞翼货车", customer: "南京威路物流有限公司", department: "业务三部", manager: "金可鹏", contractNo: "LNZLHT2025110402", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "45822.00", location: "江苏省常州市", gpsTime: "2026-06-23 14:07:15", regDate: "2022-10-20", inspectExpire: "2026-09-11", lastDeliveryTime: "2025-10-01 00:00:00", lastDeliveryMile: "45822.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "7", plateNo: "浙F00688F", vin: "LA9GG64L0NBAF4015", vehicleNo: "33Q", color: "红", year: "-", purchaseDate: "-", parking: "-", ownership: "嘉兴氢能产业发展股份有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "嘉兴氢能产业发展股份有限公司", vehicleType: "重型半挂牵引车", brand: "飞驰", model: "49吨牵引车头", customer: "嘉兴市乍浦港口经营有限公司", department: "业务一部", manager: "陈高伟", contractNo: "JXGW-GC-23-ZL-611", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "202.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2022-06-21", inspectExpire: "2026-06-30", lastDeliveryTime: "2022-07-04 00:00:00", lastDeliveryMile: "202.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "8", plateNo: "浙F07588F", vin: "LA9GG64L0NBAF4094", vehicleNo: "01Q", color: "白/蓝/绿", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "重型半挂牵引车", brand: "飞驰", model: "49吨牵引车头", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "127012.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2023-03-15", inspectExpire: "2027-03-31", lastDeliveryTime: "2025-05-20 09:56:16", lastDeliveryMile: "79924.00", lastReturnTime: "2026-06-08 15:04:00", lastReturnMile: "127012.00", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "9", plateNo: "浙F06618F", vin: "LA9GG64L0NBAF4175", vehicleNo: "50Q", color: "白/蓝/绿", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "嘉兴氢能产业发展股份有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "嘉兴氢能产业发展股份有限公司", vehicleType: "重型半挂牵引车", brand: "飞驰", model: "49吨牵引车头", customer: "嘉兴市乍浦港口经营有限公司", department: "业务一部", manager: "陈高伟", contractNo: "JXGW-GC-23-ZL-120", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "256.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2022-11-21", inspectExpire: "2026-11-30", lastDeliveryTime: "2022-12-21 00:00:00", lastDeliveryMile: "256.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "10", plateNo: "浙F06218F", vin: "LA9HE60A2PBAF4020", vehicleNo: "-", color: "白/绿", year: "-", purchaseDate: "-", parking: "-", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "重型厢式货车", brand: "现代", model: "帕力安牌18吨双飞翼货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "异常", insuranceStatus: "正常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:36", regDate: "2023-05-17", inspectExpire: "2027-05-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "11", plateNo: "浙F02608F", vin: "LA9HE60A3PBAF4012", vehicleNo: "-", color: "白/绿", year: "-", purchaseDate: "-", parking: "-", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "重型厢式货车", brand: "现代", model: "帕力安牌18吨双飞翼货车", customer: "嘉兴港区韵达快递有限公司", department: "业务二部", manager: "刘念念", contractNo: "LNZLHT20251111001", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "异常", insuranceStatus: "正常", mileage: "97556.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:34", regDate: "2023-05-18", inspectExpire: "2027-05-31", lastDeliveryTime: "2026-06-19 12:46:41", lastDeliveryMile: "97556.00", lastReturnTime: "2026-06-05 00:00:00", lastReturnMile: "97337.00", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "12", plateNo: "粤A08177F", vin: "LNXNEGRR0SR318195", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "广州现代停车场", ownership: "羚牛氢能科技(广东)有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "自有", leaseCompany: "-", vehicleType: "重型厢式货车", brand: "现代", model: "帕力安牌18吨双飞翼货车", customer: "上海心坦物流有限公司", department: "业务五部", manager: "秦挺", contractNo: "LNZLHT2026032301-042", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "2566.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 08:29:34", regDate: "2025-11-27", inspectExpire: "2026-11-30", lastDeliveryTime: "2026-03-25 12:56:37", lastDeliveryMile: "2566.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "13", plateNo: "粤AG02973", vin: "LB9A32A20P0LS1226", vehicleNo: "-", color: "白色", year: "-", purchaseDate: "-", parking: "开创大道云埔宏仁便民停车场", ownership: "现代氢能科技（广州）有限公司", scrapDate: "2038-12-18", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "恒运", vehicleType: "轻型厢式货车", brand: "现代", model: "4.5吨货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "异常", insuranceStatus: "异常", mileage: "-", location: "广东省", gpsTime: "-", regDate: "-", inspectExpire: "-", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-", vehicleLedgerType: "非运营车辆" },
	{ id: "14", plateNo: "粤AFM6602", vin: "LB9A32A20P0LS1257", vehicleNo: "-", color: "白", year: "-", purchaseDate: "2025-12-24", parking: "嘉兴公司楼下氢能展厅", ownership: "现代氢能科技（广州）有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "恒运", vehicleType: "轻型厢式货车", brand: "现代", model: "4.5吨货车", customer: "杭州冠泽物流有限公司", department: "业务二部", manager: "董剑煜", contractNo: "LNZLHT 20260423002", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "2973.00", location: "浙江省湖州市", gpsTime: "2026-06-23 13:56:26", regDate: "2024-01-12", inspectExpire: "2027-01-31", lastDeliveryTime: "2026-04-27 15:05:00", lastDeliveryMile: "2973.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "15", plateNo: "粤AFN3997", vin: "LB9A32A20P0LS1260", vehicleNo: "-", color: "白", year: "-", purchaseDate: "2025-12-24", parking: "嘉兴公司楼下氢能展厅", ownership: "现代氢能科技（广州）有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "恒运", vehicleType: "轻型厢式货车", brand: "现代", model: "4.5吨货车", customer: "上海明纳物流有限公司", department: "业务二部", manager: "谯云", contractNo: "20251127001", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "908.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:23:42", regDate: "2024-01-12", inspectExpire: "2027-01-31", lastDeliveryTime: "2026-04-04 15:11:17", lastDeliveryMile: "908.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "16", plateNo: "沪A03561F", vin: "LMRKH9AC0R1004086", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "成都宇通服务站停车场", ownership: "上海羚牛氢运物联网科技有限公司", scrapDate: "-", ratingTime: "2026-06-30 00:00:00", operateCompany: "上海羚牛氢运物联网科技有限公司", vehicleSource: "自有", leaseCompany: "上海羚牛氢运物联网科技有限公司", vehicleType: "重型半挂牵引车", brand: "宇通", model: "49吨牵引车头", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "11578.00", location: "四川省成都市", gpsTime: "2026-06-23 14:17:35", regDate: "2024-06-05", inspectExpire: "2027-06-30", lastDeliveryTime: "2026-04-08 13:05:00", lastDeliveryMile: "11181.00", lastReturnTime: "2026-06-05 19:06:00", lastReturnMile: "11578.00", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "17", plateNo: "沪A33319F", vin: "LMRKH9AC0R1004105", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "上海羚牛氢运物联网科技有限公司", scrapDate: "-", ratingTime: "2026-06-30 00:00:00", operateCompany: "上海羚牛氢运物联网科技有限公司", vehicleSource: "自有", leaseCompany: "上海羚牛氢运物联网科技有限公司", vehicleType: "重型半挂牵引车", brand: "宇通", model: "49吨牵引车头", customer: "嘉兴玲利供应链科技有限公司", department: "业务一部", manager: "陈高伟", contractNo: "LNZLHT20251201001", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "45195.00", location: "浙江省湖州市", gpsTime: "2026-06-23 14:17:35", regDate: "2024-06-04", inspectExpire: "2027-06-30", lastDeliveryTime: "2025-12-12 13:09:50", lastDeliveryMile: "45195.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "18", plateNo: "沪A06192F", vin: "LMRKH9AC0R1004119", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "上海羚牛氢运物联网科技有限公司", scrapDate: "-", ratingTime: "2026-06-30 00:00:00", operateCompany: "上海羚牛氢运物联网科技有限公司", vehicleSource: "自有", leaseCompany: "上海羚牛氢运物联网科技有限公司", vehicleType: "重型半挂牵引车", brand: "宇通", model: "49吨牵引车头", customer: "嘉兴市乍浦港口经营有限公司", department: "业务一部", manager: "陈高伟", contractNo: "JXGW-GC-25-ZL-045", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "15004.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 13:58:52", regDate: "2024-06-03", inspectExpire: "2027-06-30", lastDeliveryTime: "2026-05-11 17:51:00", lastDeliveryMile: "15004.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "19", plateNo: "沪AGU2217", vin: "LSFGL23Z0ND103018", vehicleNo: "8", color: "白/绿/灰", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "羚牛新能源科技（上海）有限公司", scrapDate: "-", ratingTime: "2026-11-30 00:00:00", operateCompany: "羚牛新能源科技（上海）有限公司", vehicleSource: "自有", leaseCompany: "羚牛新能源科技（上海）有限公司", vehicleType: "轻型厢式货车", brand: "跃进", model: "4.5吨冷链车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2025-12-03 08:54:11", regDate: "2022-11-07", inspectExpire: "2026-11-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "20", plateNo: "沪AGN1890", vin: "LSFGL23Z1ND200812", vehicleNo: "37", color: "白/绿/灰", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "羚牛新能源科技（上海）有限公司", scrapDate: "-", ratingTime: "2026-08-31 00:00:00", operateCompany: "羚牛新能源科技（上海）有限公司", vehicleSource: "自有", leaseCompany: "羚牛新能源科技（上海）有限公司", vehicleType: "轻型厢式货车", brand: "跃进", model: "4.5吨冷链车", customer: "-", department: "-", manager: "-", contractNo: "LNZLHTSH2023071301", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "4596.00", location: "浙江省嘉兴市", gpsTime: "2025-10-30 14:26:54", regDate: "2022-08-05", inspectExpire: "2026-08-31", lastDeliveryTime: "2023-07-17 14:10:00", lastDeliveryMile: "4596.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "21", plateNo: "沪AGU0727", vin: "LSFGL23Z1ND214418", vehicleNo: "136", color: "白/绿/灰", year: "-", purchaseDate: "-", parking: "嘉兴金小悦停车场", ownership: "羚牛新能源科技（上海）有限公司", scrapDate: "-", ratingTime: "2026-11-30 00:00:00", operateCompany: "羚牛新能源科技（上海）有限公司", vehicleSource: "自有", leaseCompany: "羚牛新能源科技（上海）有限公司", vehicleType: "轻型厢式货车", brand: "跃进", model: "4.5吨冷链车", customer: "上海浦江特种气体有限公司", department: "业务三部", manager: "金可鹏", contractNo: "LNZLHT2025031301", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "52614.00", location: "上海市奉贤区", gpsTime: "2026-06-23 14:17:34", regDate: "2022-11-07", inspectExpire: "2026-11-30", lastDeliveryTime: "2025-10-30 11:44:00", lastDeliveryMile: "52614.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "22", plateNo: "浙F07878F", vin: "LA9HE60A0NBAF4028", vehicleNo: "-", color: "红", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "2038-05-19", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "重型厢式货车", brand: "飞驰", model: "18吨厢式货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:34", regDate: "2022-06-18", inspectExpire: "2027-06-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "23", plateNo: "浙F06900F", vin: "LA9HE60A0NBAF4031", vehicleNo: "-", color: "红", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "2038-05-19", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "重型厢式货车", brand: "飞驰", model: "18吨厢式货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:34", regDate: "2022-06-27", inspectExpire: "2027-06-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "24", plateNo: "浙F06881F", vin: "LA9HE60A0PBAF4002", vehicleNo: "-", color: "白/绿", year: "-", purchaseDate: "-", parking: "汇通检测站停车场", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "重型厢式货车", brand: "飞驰", model: "18吨厢式货车", customer: "嘉兴市南湖区大桥镇雪观运输装卸服务站", department: "业务二部", manager: "刘念念", contractNo: "LNZLHT20251010001", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "异常", insuranceStatus: "正常", mileage: "72849.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:34", regDate: "2023-05-19", inspectExpire: "2027-05-31", lastDeliveryTime: "2025-10-11 08:36:23", lastDeliveryMile: "72849.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "25", plateNo: "京A29256F", vin: "LCFZ1KRD0R0Z00122", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "北京一汽宏特停车场", ownership: "北京氢运羚壹供应链管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "北京氢运羚壹供应链管理有限公司", vehicleSource: "自有", leaseCompany: "北京氢运羚壹供应链管理有限公司", vehicleType: "重型厢式货车", brand: "楚风", model: "18吨厢式货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "0.00", location: "北京市大兴区", gpsTime: "2026-06-05 18:17:42", regDate: "2024-07-19", inspectExpire: "2026-07-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "26", plateNo: "京A26337F", vin: "LCFZ1KRD2R0Z00123", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "北京一汽宏特停车场", ownership: "北京氢运羚壹供应链管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "北京氢运羚壹供应链管理有限公司", vehicleSource: "自有", leaseCompany: "北京氢运羚壹供应链管理有限公司", vehicleType: "重型厢式货车", brand: "楚风", model: "18吨厢式货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "0.00", location: "北京市大兴区", gpsTime: "2026-06-04 17:31:15", regDate: "2024-07-19", inspectExpire: "2026-07-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "27", plateNo: "京A11949F", vin: "LCFZ1KRD4R0Z00124", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "北京一汽宏特停车场", ownership: "北京氢运羚壹供应链管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "北京氢运羚壹供应链管理有限公司", vehicleSource: "自有", leaseCompany: "北京氢运羚壹供应链管理有限公司", vehicleType: "重型厢式货车", brand: "楚风", model: "18吨厢式货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "0.00", location: "北京市大兴区", gpsTime: "2026-06-01 17:11:51", regDate: "2024-07-19", inspectExpire: "2026-07-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "28", plateNo: "浙FK808挂", vin: "LJRC14383J2027744", vehicleNo: "-", color: "红色", year: "-", purchaseDate: "-", parking: "-", ownership: "浙江锦昌仓储有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "浙江锦昌仓储有限公司", vehicleType: "重型集装箱半挂车", brand: "通华", model: "重型集装箱半挂车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2018-12-29", inspectExpire: "2027-04-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "29", plateNo: "浙FHU33挂", vin: "LJRC14383L2004239", vehicleNo: "-", color: "红色", year: "-", purchaseDate: "-", parking: "-", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "重型集装箱半挂车", brand: "通华", model: "重型集装箱半挂车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "异常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2020-05-08", inspectExpire: "2026-05-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "30", plateNo: "浙FK660挂", vin: "LJRC14384K2003180", vehicleNo: "-", color: "红色", year: "-", purchaseDate: "-", parking: "-", ownership: "浙江锦昌仓储有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "浙江锦昌仓储有限公司", vehicleType: "重型集装箱半挂车", brand: "通华", model: "重型集装箱半挂车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2019-03-14", inspectExpire: "2027-04-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "31", plateNo: "京A22896F", vin: "LCFU4VRE5S0Z02157", vehicleNo: "-", color: "蓝/黑", year: "-", purchaseDate: "-", parking: "成都宇通服务站停车场", ownership: "海珀特科技（北京）有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛总部", vehicleSource: "外租", leaseCompany: "海珀特科技(北京)有限公司", vehicleType: "重型半挂牵引车", brand: "楚风", model: "49吨牵引车头", customer: "成都易达创想物流科技有限责任公司", department: "业务五部", manager: "秦挺", contractNo: "LNZLHT2026040701-042", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "四川省", gpsTime: "-", regDate: "2025-12-17", inspectExpire: "2026-12-31", lastDeliveryTime: "2026-04-11 00:00:00", lastDeliveryMile: "0.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "32", plateNo: "京A39361F", vin: "LCFU4VRE6S0Z02152", vehicleNo: "-", color: "蓝/黑", year: "-", purchaseDate: "-", parking: "成都宇通服务站停车场", ownership: "海珀特科技（北京）有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛总部", vehicleSource: "外租", leaseCompany: "海珀特科技(北京)有限公司", vehicleType: "重型半挂牵引车", brand: "楚风", model: "49吨牵引车头", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "四川省", gpsTime: "-", regDate: "2025-12-16", inspectExpire: "2026-12-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "33", plateNo: "京A09086F", vin: "LCFU4VREXS0Z02154", vehicleNo: "-", color: "蓝/黑", year: "-", purchaseDate: "-", parking: "成都宇通服务站停车场", ownership: "海珀特科技（北京）有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "-", vehicleSource: "外租", leaseCompany: "海珀特科技(北京)有限公司", vehicleType: "重型半挂牵引车", brand: "楚风", model: "49吨牵引车头", customer: "成都易达创想物流科技有限责任公司", department: "业务五部", manager: "秦挺", contractNo: "LNZLHT2026040701-042", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "-", mileage: "-", location: "-", gpsTime: "-", regDate: "-", inspectExpire: "2026-12-31", lastDeliveryTime: "2026-05-20 15:45:00", lastDeliveryMile: "3706.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "34", plateNo: "观光车001", vin: "LA9GG68L4PBAF0001", vehicleNo: "-", color: "蓝白", year: "-", purchaseDate: "-", parking: "嘉兴公司楼下氢能展厅", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "观光车", brand: "舒捷", model: "SJ型蓄电池观光车", customer: "浙江氢能产业发展有限公司", department: "业务一部", manager: "陈高伟", contractNo: "LNZLHTJX23102701", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2023-08-09", inspectExpire: "2099-08-09", lastDeliveryTime: "2024-01-02 16:56:05", lastDeliveryMile: "31.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "35", plateNo: "观光车002", vin: "LA9GG68L4PBAF0002", vehicleNo: "-", color: "蓝白", year: "-", purchaseDate: "-", parking: "嘉兴公司楼下氢能展厅", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "观光车", brand: "舒捷", model: "SJ型蓄电池观光车", customer: "浙江氢能产业发展有限公司", department: "业务一部", manager: "陈高伟", contractNo: "LNZLHTJX23102701", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2023-08-09", inspectExpire: "2099-08-09", lastDeliveryTime: "2024-01-02 16:56:10", lastDeliveryMile: "19.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "36", plateNo: "粤ACT2533", vin: "LC0DE6CB8J1001384", vehicleNo: "-", color: "黑", year: "-", purchaseDate: "-", parking: "嘉兴公司楼下氢能展厅", ownership: "羚牛氢能科技(广东)有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "自有", leaseCompany: "羚牛氢能科技(广东)有限公司", vehicleType: "小型普通客车", brand: "腾势", model: "公务用车/小客车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "异常", insuranceStatus: "正常", mileage: "-", location: "广东省", gpsTime: "-", regDate: "2019-05-27", inspectExpire: "2027-05-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "37", plateNo: "沪BDB9161", vin: "LC0DF4CD8S0303140", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "-", ownership: "上海羚牛氢运物联网科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "上海羚牛氢运物联网科技有限公司", vehicleSource: "自有", leaseCompany: "-", vehicleType: "小型普通客车", brand: "腾势", model: "公务用车/小客车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "上海市", gpsTime: "-", regDate: "-", inspectExpire: "-", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "38", plateNo: "沪ADP7226", vin: "LJ1E6A2U7L7739433", vehicleNo: "-", color: "蓝色", year: "-", purchaseDate: "-", parking: "-", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "2026-12-31 00:00:00", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "蒲红霞", vehicleType: "小型普通客车", brand: "其他", model: "公务用车/小客车", customer: "羚牛公务车专用", department: "-", manager: "-", contractNo: "LNGWC20240105", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2020-12-22", inspectExpire: "2026-12-31", lastDeliveryTime: "2022-06-30 00:00:00", lastDeliveryMile: "0.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "39", plateNo: "浙FFJ2966", vin: "LSKG49C24PA143875", vehicleNo: "-", color: "灰", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "小型普通客车", brand: "其他", model: "公务用车/小客车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2025-02-14", inspectExpire: "2026-07-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "40", plateNo: "浙FK973挂", vin: "LJT93VRJ4A0012440", vehicleNo: "-", color: "红色", year: "-", purchaseDate: "-", parking: "汇通检测站停车场", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "重型集装箱半挂车", brand: "明威", model: "重型集装箱半挂车", customer: "嘉兴玲利供应链科技有限公司", department: "业务一部", manager: "陈高伟", contractNo: "LNZLHT20251021002", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2011-03-02", inspectExpire: "2027-03-31", lastDeliveryTime: "2025-11-04 10:59:00", lastDeliveryMile: "0.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "41", plateNo: "沪E9652挂", vin: "LJT93VRJXA0012443", vehicleNo: "-", color: "红", year: "-", purchaseDate: "-", parking: "汇通检测站停车场", ownership: "上海羚牛氢运物联网科技有限公司", scrapDate: "-", ratingTime: "2026-07-31 00:00:00", operateCompany: "上海羚牛氢运物联网科技有限公司", vehicleSource: "自有", leaseCompany: "上海羚牛氢运物联网科技有限公司", vehicleType: "重型集装箱半挂车", brand: "明威", model: "重型集装箱半挂车", customer: "嘉兴玲利供应链科技有限公司", department: "业务一部", manager: "陈高伟", contractNo: "LNZLHT20250928001", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2010-07-23", inspectExpire: "2026-07-31", lastDeliveryTime: "2025-10-12 12:22:00", lastDeliveryMile: "7619.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "42", plateNo: "沪BH391挂", vin: "LA9935J21F0YWT578", vehicleNo: "-", color: "红色", year: "-", purchaseDate: "-", parking: "汇通检测站停车场", ownership: "上海羚牛氢运物联网科技有限公司", scrapDate: "-", ratingTime: "2026-09-30 00:00:00", operateCompany: "上海羚牛氢运物联网科技有限公司", vehicleSource: "自有", leaseCompany: "上海羚牛氢运物联网科技有限公司", vehicleType: "重型集装箱半挂车", brand: "鲁郸万通牌", model: "重型集装箱半挂车", customer: "嘉兴玲利供应链科技有限公司", department: "业务一部", manager: "陈高伟", contractNo: "2026010101", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2015-09-09", inspectExpire: "2026-09-30", lastDeliveryTime: "2026-02-01 11:00:00", lastDeliveryMile: "0.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "43", plateNo: "沪AE890挂", vin: "LA99P3405K0WXS081", vehicleNo: "-", color: "红", year: "-", purchaseDate: "-", parking: "汇通检测站停车场", ownership: "上海羚牛氢运物联网科技有限公司", scrapDate: "-", ratingTime: "2026-03-31 00:00:00", operateCompany: "上海羚牛氢运物联网科技有限公司", vehicleSource: "自有", leaseCompany: "上海羚牛氢运物联网科技有限公司", vehicleType: "重型平板半挂车", brand: "万风", model: "重型平板半挂车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2019-03-11", inspectExpire: "2027-03-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "44", plateNo: "氢能叉车001", vin: "LB9A32A28R0LS0001", vehicleNo: "-", color: "蓝白绿", year: "-", purchaseDate: "-", parking: "嘉兴公司楼下氢能展厅", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛总部", vehicleSource: "自有", leaseCompany: "-", vehicleType: "叉车", brand: "其他", model: "氢能叉车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "-", inspectExpire: "-", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "45", plateNo: "沪EB8290", vin: "LGAX2BG42H1003112", vehicleNo: "-", color: "白色", year: "-", purchaseDate: "-", parking: "北京一汽宏特修理厂停车场", ownership: "上海宇速物流有限公司", scrapDate: "-", ratingTime: "2026-03-31 00:00:00", operateCompany: "上海宇速物流有限公司", vehicleSource: "挂靠", leaseCompany: "上海宇速物流有限公司", vehicleType: "重型厢式货车", brand: "东风", model: "挂靠油车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "上海市", gpsTime: "-", regDate: "2017-03-22", inspectExpire: "2027-03-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "46", plateNo: "浙FD85611", vin: "LJ2MTKBM1R1049307", vehicleNo: "-", color: "白", year: "-", purchaseDate: "2024-11-08", parking: "平湖停车场", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "小型普通客车", brand: "远程牌", model: "公务用车/小客车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2024-11-20", inspectExpire: "2026-11-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "47", plateNo: "沪FR0572", vin: "LZFH18R14HD010462", vehicleNo: "-", color: "红色", year: "-", purchaseDate: "-", parking: "-", ownership: "上海羚牛氢运物联网科技有限公司", scrapDate: "-", ratingTime: "2026-06-30 00:00:00", operateCompany: "上海羚牛氢运物联网科技有限公司", vehicleSource: "自有", leaseCompany: "上海羚牛氢运物联网科技有限公司", vehicleType: "重型半挂牵引车", brand: "红岩", model: "35吨牵引车头", customer: "嘉兴大森物流有限公司", department: "业务二部", manager: "刘念念", contractNo: "20251017", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "458272.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:34", regDate: "2017-06-23", inspectExpire: "2026-06-30", lastDeliveryTime: "2024-10-18 10:00:00", lastDeliveryMile: "458272.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "48", plateNo: "粤AGR5028", vin: "LB9A32A20R0LS1374", vehicleNo: "-", color: "白色", year: "-", purchaseDate: "-", parking: "开创大道云埔宏仁便民停车场", ownership: "广州开发区交投氢能运营管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "广州开发区交投氢能运营管理有限公司", vehicleType: "轻型厢式货车", brand: "现代", model: "帕力安牌4.5吨冷链车", customer: "广州长运冷链服务有限公司", department: "业务三部", manager: "金可鹏", contractNo: "LNZLHT2025112201", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "1596.00", location: "广东省广州市", gpsTime: "2026-06-23 14:17:35", regDate: "2025-02-19", inspectExpire: "2027-02-28", lastDeliveryTime: "2025-11-28 14:18:48", lastDeliveryMile: "1596.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "49", plateNo: "沪A65087F", vin: "LKLG7C4E0NA774760", vehicleNo: "22FHD0037", color: "白", year: "-", purchaseDate: "-", parking: "佛山汽车运输集团公交分公司塱沙充电站", ownership: "羚牛新能源科技（上海）有限公司", scrapDate: "-", ratingTime: "2026-11-30 00:00:00", operateCompany: "羚牛新能源科技（上海）有限公司", vehicleSource: "自有", leaseCompany: "羚牛新能源科技（上海）有限公司", vehicleType: "重型厢式货车", brand: "苏龙", model: "海格牌18吨双飞翼货车", customer: "嘉兴市京宝物流有限公司", department: "业务二部", manager: "刘念念", contractNo: "LNZLHT 20260412001", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "80219.00", location: "浙江省金华市", gpsTime: "2026-06-23 14:17:36", regDate: "2022-11-09", inspectExpire: "2026-11-01", lastDeliveryTime: "2026-04-12 20:39:52", lastDeliveryMile: "80219.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "50", plateNo: "浙F09378F", vin: "LA9GG64L0NBAF4189", vehicleNo: "-", color: "白/蓝/绿", year: "-", purchaseDate: "-", parking: "汇通检测站停车场", ownership: "嘉兴氢能产业发展股份有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "嘉兴氢能产业发展股份有限公司", vehicleType: "重型半挂牵引车", brand: "飞驰", model: "49吨牵引车头", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:36", regDate: "2023-01-09", inspectExpire: "2027-01-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "51", plateNo: "粤A03859F", vin: "LNXNEGRR0SR318200", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "广州现代停车场", ownership: "羚牛氢能科技(广东)有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "自有", leaseCompany: "-", vehicleType: "重型厢式货车", brand: "现代", model: "帕力安牌18吨双飞翼货车", customer: "武汉至上云合供应链管理有限公司", department: "业务三部", manager: "金可鹏", contractNo: "LNZLHT2026032001-042", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "880.00", location: "湖北省武汉市", gpsTime: "2026-06-23 14:17:24", regDate: "2025-11-27", inspectExpire: "2026-11-30", lastDeliveryTime: "2026-04-19 18:05:00", lastDeliveryMile: "880.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "52", plateNo: "粤AFP1332", vin: "LB9A32A20P0LS1372", vehicleNo: "-", color: "白", year: "-", purchaseDate: "2025-12-30", parking: "广州开创大道停车场", ownership: "现代氢能科技（广州）有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "恒运", vehicleType: "轻型厢式货车", brand: "现代", model: "4.5吨货车", customer: "-", department: "-", manager: "-", contractNo: "LNZLHT2026040201-042", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "858.00", location: "广东省广州市", gpsTime: "2026-06-23 14:15:39", regDate: "2024-01-12", inspectExpire: "2027-01-31", lastDeliveryTime: "2026-04-23 11:09:14", lastDeliveryMile: "858.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "53", plateNo: "沪A32399F", vin: "LMRKH9AC0R1004122", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "上海羚牛氢运物联网科技有限公司", scrapDate: "2038-05-19", ratingTime: "-", operateCompany: "上海羚牛氢运物联网科技有限公司", vehicleSource: "自有", leaseCompany: "上海羚牛氢运物联网科技有限公司", vehicleType: "重型半挂牵引车", brand: "宇通", model: "49吨牵引车头", customer: "嘉兴市乍浦港口经营有限公司", department: "业务一部", manager: "陈高伟", contractNo: "JXGW-GC-25-ZL-045", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "125095.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:34", regDate: "2024-06-04", inspectExpire: "2027-06-30", lastDeliveryTime: "2026-05-11 16:51:46", lastDeliveryMile: "125095.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "54", plateNo: "沪AGR7901", vin: "LSFGL23Z1ND214421", vehicleNo: "133", color: "白/绿/灰", year: "-", purchaseDate: "-", parking: "韶关宝氢科技停车场", ownership: "羚牛新能源科技（上海）有限公司", scrapDate: "-", ratingTime: "2026-11-30 00:00:00", operateCompany: "羚牛新能源科技（上海）有限公司", vehicleSource: "自有", leaseCompany: "羚牛新能源科技（上海）有限公司", vehicleType: "轻型厢式货车", brand: "跃进", model: "4.5吨冷链车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:34", regDate: "2022-11-07", inspectExpire: "2026-11-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "55", plateNo: "浙F05777F", vin: "LA9HE60A0PBAF4016", vehicleNo: "-", color: "白/绿", year: "-", purchaseDate: "-", parking: "汇通检测站停车场", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "重型厢式货车", brand: "飞驰", model: "18吨厢式货车", customer: "嘉兴市南湖区新丰镇乐果货物运输服务部（个体工商户）", department: "业务二部", manager: "刘念念", contractNo: "LNZLHT20251216001", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "异常", insuranceStatus: "正常", mileage: "104217.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:34", regDate: "2023-05-18", inspectExpire: "2027-05-31", lastDeliveryTime: "2025-12-17 10:25:00", lastDeliveryMile: "104217.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "56", plateNo: "京A45651F", vin: "LCFZ1KRD6P0Z00686", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "北京一汽宏特停车场", ownership: "北京氢运羚壹供应链管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "北京氢运羚壹供应链管理有限公司", vehicleSource: "自有", leaseCompany: "北京氢运羚壹供应链管理有限公司", vehicleType: "重型厢式货车", brand: "楚风", model: "18吨厢式货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "0.00", location: "北京市大兴区", gpsTime: "2026-06-05 12:38:03", regDate: "2024-07-19", inspectExpire: "2026-07-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "57", plateNo: "浙FK800挂", vin: "LJRC14385J2027745", vehicleNo: "-", color: "红色", year: "-", purchaseDate: "-", parking: "-", ownership: "浙江锦昌仓储有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "浙江锦昌仓储有限公司", vehicleType: "重型集装箱半挂车", brand: "通华", model: "重型集装箱半挂车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2018-12-29", inspectExpire: "2027-04-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "58", plateNo: "粤AGR5288", vin: "LB9A32A20R0LS1388", vehicleNo: "-", color: "白色", year: "-", purchaseDate: "-", parking: "嘉兴公司楼下氢能展厅", ownership: "广州开发区交投氢能运营管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "广州开发区交投氢能运营管理有限公司", vehicleType: "轻型厢式货车", brand: "现代", model: "帕力安牌4.5吨冷链车", customer: "无锡铭康物流有限公司-1", department: "业务二部", manager: "董剑煜", contractNo: "20260316001", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "26010.00", location: "江苏省苏州市", gpsTime: "2026-06-23 14:17:35", regDate: "2025-01-20", inspectExpire: "2027-02-28", lastDeliveryTime: "2026-03-23 16:14:11", lastDeliveryMile: "26010.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "59", plateNo: "沪A09100F", vin: "LKLG7C4E0NA774774", vehicleNo: "22FHD0051", color: "白", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "羚牛新能源科技（上海）有限公司", scrapDate: "-", ratingTime: "2026-11-30 00:00:00", operateCompany: "羚牛新能源科技（上海）有限公司", vehicleSource: "自有", leaseCompany: "羚牛新能源科技（上海）有限公司", vehicleType: "重型厢式货车", brand: "苏龙", model: "海格牌18吨双飞翼货车", customer: "南京威路物流有限公司", department: "业务三部", manager: "金可鹏", contractNo: "LNZLHT2025110402", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "24045.00", location: "江苏省南京市", gpsTime: "2026-06-23 14:07:16", regDate: "2022-11-01", inspectExpire: "2026-09-11", lastDeliveryTime: "2025-10-01 00:00:00", lastDeliveryMile: "24045.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "60", plateNo: "浙F07559F", vin: "LA9GG64L0NBAF4192", vehicleNo: "47Q", color: "白/蓝/绿", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "嘉兴氢能产业发展股份有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "嘉兴氢能产业发展股份有限公司", vehicleType: "重型半挂牵引车", brand: "飞驰", model: "49吨牵引车头", customer: "嘉兴市乍浦港口经营有限公司", department: "业务一部", manager: "陈高伟", contractNo: "JXGW-GC-23-ZL-120", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "116285.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2022-11-21", inspectExpire: "2026-11-30", lastDeliveryTime: "2025-09-30 10:13:45", lastDeliveryMile: "116285.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "61", plateNo: "粤A00828F", vin: "LNXNEGRR0SR319444", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "广州现代停车场", ownership: "羚牛氢能科技(广东)有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "自有", leaseCompany: "-", vehicleType: "重型厢式货车", brand: "现代", model: "帕力安牌18吨双飞翼货车", customer: "嘉兴智奇供应链管理有限公司", department: "业务二部", manager: "刘念念", contractNo: "20260105", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "2547.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 00:54:54", regDate: "2025-11-28", inspectExpire: "2026-11-30", lastDeliveryTime: "2026-03-26 09:07:57", lastDeliveryMile: "2547.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "62", plateNo: "粤AGG4191", vin: "LB9A32A20R0LS1049", vehicleNo: "-", color: "白色", year: "-", purchaseDate: "-", parking: "嘉兴公司楼下氢能展厅", ownership: "广州开发区交投氢能运营管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "广州开发区交投氢能运营管理有限公司", vehicleType: "轻型厢式货车", brand: "现代", model: "4.5吨货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "异常", insuranceStatus: "正常", mileage: "25335.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:34", regDate: "2024-05-27", inspectExpire: "2027-05-31", lastDeliveryTime: "2025-08-02 13:00:00", lastDeliveryMile: "7855.00", lastReturnTime: "2026-06-11 13:40:04", lastReturnMile: "25335.00", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "63", plateNo: "沪A09133F", vin: "LMRKH9AC1R1004095", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "上海羚牛氢运物联网科技有限公司", scrapDate: "-", ratingTime: "2026-06-30 00:00:00", operateCompany: "上海羚牛氢运物联网科技有限公司", vehicleSource: "自有", leaseCompany: "上海羚牛氢运物联网科技有限公司", vehicleType: "重型半挂牵引车", brand: "宇通", model: "49吨牵引车头", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2024-06-04", inspectExpire: "2027-06-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "64", plateNo: "沪AGW6270", vin: "LSFGL23Z1ND214435", vehicleNo: "114", color: "白/绿/灰", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "羚牛新能源科技（上海）有限公司", scrapDate: "-", ratingTime: "2026-09-30 00:00:00", operateCompany: "羚牛新能源科技（上海）有限公司", vehicleSource: "自有", leaseCompany: "羚牛新能源科技（上海）有限公司", vehicleType: "轻型厢式货车", brand: "跃进", model: "4.5吨冷链车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2025-11-14 13:55:25", regDate: "2022-09-26", inspectExpire: "2026-09-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "65", plateNo: "浙F07939F", vin: "LA9HE60A1PBAF4008", vehicleNo: "-", color: "白/绿", year: "-", purchaseDate: "-", parking: "-", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "重型厢式货车", brand: "飞驰", model: "18吨厢式货车", customer: "嘉兴港区众通快递有限公司", department: "业务二部", manager: "刘念念", contractNo: "LNZLHT 20241205001", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "异常", insuranceStatus: "正常", mileage: "94145.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2023-05-19", inspectExpire: "2027-05-31", lastDeliveryTime: "2025-06-17 13:17:57", lastDeliveryMile: "94145.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "66", plateNo: "京A19945F", vin: "LCFZ1KRD6R0Z00125", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "四川汶川客户停车场", ownership: "北京氢运羚壹供应链管理有限公司", scrapDate: "2038-05-19", ratingTime: "-", operateCompany: "北京氢运羚壹供应链管理有限公司", vehicleSource: "自有", leaseCompany: "北京氢运羚壹供应链管理有限公司", vehicleType: "重型厢式货车", brand: "楚风", model: "18吨厢式货车", customer: "四川邦达蜀运供应链管理有限公司", department: "业务五部", manager: "秦挺", contractNo: "LNZLHT2026012805-042", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "66023.00", location: "四川省德阳市", gpsTime: "2026-06-23 14:17:45", regDate: "2024-07-19", inspectExpire: "2027-07-31", lastDeliveryTime: "2026-01-20 11:20:19", lastDeliveryMile: "66023.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "67", plateNo: "浙FK698挂", vin: "LJRC14387J2027746", vehicleNo: "-", color: "红色", year: "-", purchaseDate: "-", parking: "-", ownership: "浙江锦昌仓储有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "浙江锦昌仓储有限公司", vehicleType: "重型集装箱半挂车", brand: "通华", model: "重型集装箱半挂车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2018-12-29", inspectExpire: "2027-04-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "68", plateNo: "粤AGP9338", vin: "LB9A32A20R0LS1391", vehicleNo: "-", color: "白色", year: "-", purchaseDate: "-", parking: "嘉兴公司楼下氢能展厅", ownership: "广州开发区交投氢能运营管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "广州开发区交投氢能运营管理有限公司", vehicleType: "轻型厢式货车", brand: "现代", model: "帕力安牌4.5吨冷链车", customer: "嘉兴益顺冷链物流有限公司", department: "业务二部", manager: "尚建华", contractNo: "20250801001", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "347.00", location: "浙江省绍兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2025-02-19", inspectExpire: "2027-02-28", lastDeliveryTime: "2025-11-24 16:34:32", lastDeliveryMile: "347.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "69", plateNo: "沪A03565F", vin: "LKLG7C4E0NA774788", vehicleNo: "22FHD0065", color: "白", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "羚牛新能源科技（上海）有限公司", scrapDate: "-", ratingTime: "2026-10-31 00:00:00", operateCompany: "羚牛新能源科技（上海）有限公司", vehicleSource: "自有", leaseCompany: "羚牛新能源科技（上海）有限公司", vehicleType: "重型厢式货车", brand: "苏龙", model: "海格牌18吨双飞翼货车", customer: "南京威路物流有限公司", department: "业务三部", manager: "金可鹏", contractNo: "LNZLHT2025110402", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "41010.00", location: "江苏省常州市", gpsTime: "2026-06-23 14:17:34", regDate: "2022-10-29", inspectExpire: "2026-09-08", lastDeliveryTime: "2025-10-01 00:00:00", lastDeliveryMile: "41010.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "70", plateNo: "浙F09968F", vin: "LA9GG64L1NBAF4167", vehicleNo: "39Q", color: "白/蓝/绿", year: "-", purchaseDate: "-", parking: "龙王路停车场", ownership: "嘉兴氢能产业发展股份有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "嘉兴氢能产业发展股份有限公司", vehicleType: "重型半挂牵引车", brand: "飞驰", model: "49吨牵引车头", customer: "嘉兴市乍浦港口经营有限公司", department: "业务一部", manager: "陈高伟", contractNo: "JXGW-GC-23-ZL-611", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "230.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2022-09-09", inspectExpire: "2026-09-30", lastDeliveryTime: "2022-10-10 00:00:00", lastDeliveryMile: "230.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "71", plateNo: "粤A03676F", vin: "LNXNEGRR0SR319458", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "嘉兴秀洲加氢站停车场", ownership: "羚牛氢能科技(广东)有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "自有", leaseCompany: "-", vehicleType: "重型厢式货车", brand: "现代", model: "帕力安牌18吨双飞翼货车", customer: "嘉兴智奇供应链管理有限公司", department: "业务二部", manager: "刘念念", contractNo: "LNZLHT 20260413001", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "8893.00", location: "浙江省宁波市", gpsTime: "2026-06-23 14:18:19", regDate: "2025-11-28", inspectExpire: "2026-11-30", lastDeliveryTime: "2026-04-19 19:30:00", lastDeliveryMile: "8893.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "72", plateNo: "粤AGH8490", vin: "LB9A32A20R0LS1052", vehicleNo: "-", color: "白色", year: "-", purchaseDate: "-", parking: "佛山汽车运输集团公交分公司塱沙充电站", ownership: "广州开发区交投氢能运营管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "广州开发区交投氢能运营管理有限公司", vehicleType: "轻型厢式货车", brand: "现代", model: "4.5吨货车", customer: "广东氢沣科技有限公司", department: "业务三部", manager: "吴纬涛", contractNo: "LNZLHT2026040201-042", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "异常", insuranceStatus: "正常", mileage: "15560.00", location: "广东省佛山市", gpsTime: "2026-06-23 14:17:36", regDate: "2024-05-24", inspectExpire: "2027-05-31", lastDeliveryTime: "2026-05-13 14:05:16", lastDeliveryMile: "15560.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "73", plateNo: "沪A69522F", vin: "LMRKH9AC1R1004100", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "上海羚牛氢运物联网科技有限公司", scrapDate: "-", ratingTime: "2026-06-30 00:00:00", operateCompany: "上海羚牛氢运物联网科技有限公司", vehicleSource: "自有", leaseCompany: "上海羚牛氢运物联网科技有限公司", vehicleType: "重型半挂牵引车", brand: "宇通", model: "49吨牵引车头", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:34", regDate: "2024-06-04", inspectExpire: "2027-06-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "74", plateNo: "沪AGK9821", vin: "LSFGL23Z2ND201130", vehicleNo: "45", color: "白/绿/灰", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "羚牛新能源科技（上海）有限公司", scrapDate: "-", ratingTime: "2026-08-31 00:00:00", operateCompany: "羚牛新能源科技（上海）有限公司", vehicleSource: "自有", leaseCompany: "羚牛新能源科技（上海）有限公司", vehicleType: "轻型厢式货车", brand: "跃进", model: "4.5吨冷链车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2025-07-29 12:03:00", regDate: "2022-08-05", inspectExpire: "2026-08-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "75", plateNo: "浙F31228F", vin: "LA9HE60A1PBAF4011", vehicleNo: "-", color: "白/绿", year: "-", purchaseDate: "-", parking: "汇通检测站停车场", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "重型厢式货车", brand: "飞驰", model: "18吨厢式货车", customer: "嘉兴港区韵达快递有限公司", department: "业务二部", manager: "刘念念", contractNo: "LNZLHT 20251026001", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "异常", insuranceStatus: "正常", mileage: "116749.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:34", regDate: "2023-05-19", inspectExpire: "2027-05-31", lastDeliveryTime: "2025-10-26 13:07:30", lastDeliveryMile: "116749.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "76", plateNo: "京A16308F", vin: "LCFZ1KRD7R0Z00120", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "北京一汽宏特停车场", ownership: "北京氢运羚壹供应链管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "北京氢运羚壹供应链管理有限公司", vehicleSource: "自有", leaseCompany: "北京氢运羚壹供应链管理有限公司", vehicleType: "重型厢式货车", brand: "楚风", model: "18吨厢式货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "0.00", location: "北京市大兴区", gpsTime: "2026-06-03 13:52:34", regDate: "2024-07-24", inspectExpire: "2026-07-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "77", plateNo: "浙FK368挂", vin: "LJRC14388K2003179", vehicleNo: "-", color: "红色", year: "-", purchaseDate: "-", parking: "-", ownership: "浙江锦昌仓储有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "浙江锦昌仓储有限公司", vehicleType: "重型集装箱半挂车", brand: "通华", model: "重型集装箱半挂车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2019-03-20", inspectExpire: "2027-04-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-" },
	{ id: "78", plateNo: "粤AGP5368", vin: "LB9A32A20R0LS1407", vehicleNo: "-", color: "白色", year: "-", purchaseDate: "-", parking: "佛山汽车运输集团公交分公司塱沙充电站", ownership: "广州开发区交投氢能运营管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "广州开发区交投氢能运营管理有限公司", vehicleType: "轻型厢式货车", brand: "现代", model: "帕力安牌4.5吨冷链车", customer: "广东粤祥食品供应链运营管理有限公司", department: "业务六部", manager: "钟祥", contractNo: "LNZLHT2025091502", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "19446.00", location: "广东省佛山市", gpsTime: "2026-06-23 14:17:34", regDate: "2025-01-07", inspectExpire: "2027-02-28", lastDeliveryTime: "2026-02-10 16:13:00", lastDeliveryMile: "19446.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "79", plateNo: "沪A58185F", vin: "LKLG7C4E0NA774791", vehicleNo: "22FHD0068", color: "白", year: "-", purchaseDate: "-", parking: "-", ownership: "羚牛新能源科技（上海）有限公司", scrapDate: "-", ratingTime: "2026-10-31 00:00:00", operateCompany: "羚牛新能源科技（上海）有限公司", vehicleSource: "自有", leaseCompany: "羚牛新能源科技（上海）有限公司", vehicleType: "重型厢式货车", brand: "苏龙", model: "海格牌18吨双飞翼货车", customer: "沈阳聚德物流有限公司", department: "业务三部", manager: "金可鹏", contractNo: "LNZLHT2026022402-042", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "15192.00", location: "浙江省金华市", gpsTime: "2026-06-23 14:17:35", regDate: "2022-10-29", inspectExpire: "2026-08-22", lastDeliveryTime: "2023-12-31 12:00:00", lastDeliveryMile: "15192.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "80", plateNo: "浙F08133F", vin: "LA9GG64L1NBAF4170", vehicleNo: "40Q", color: "白/蓝/绿", year: "-", purchaseDate: "-", parking: "-", ownership: "嘉兴氢能产业发展股份有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "嘉兴氢能产业发展股份有限公司", vehicleType: "重型半挂牵引车", brand: "飞驰", model: "49吨牵引车头", customer: "嘉兴市乍浦港口经营有限公司", department: "业务一部", manager: "陈高伟", contractNo: "JXGW-GC-23-ZL-611", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "160.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2022-09-09", inspectExpire: "2026-09-30", lastDeliveryTime: "2022-10-10 00:00:00", lastDeliveryMile: "160.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "81", plateNo: "粤A01629F", vin: "LNXNEGRR0SR319461", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "佛山龙天重庆红专停车场", ownership: "羚牛氢能科技(广东)有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "自有", leaseCompany: "-", vehicleType: "重型厢式货车", brand: "现代", model: "帕力安牌18吨双飞翼货车", customer: "重庆金时源供应链有限公司", department: "业务五部", manager: "秦挺", contractNo: "LNZLHT2026012602-042", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "893.00", location: "重庆市大渡口区", gpsTime: "2026-06-23 14:26:01", regDate: "2025-11-28", inspectExpire: "2026-11-30", lastDeliveryTime: "2026-01-23 17:58:00", lastDeliveryMile: "893.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "82", plateNo: "粤AGE4862", vin: "LB9A32A20R0LS1066", vehicleNo: "-", color: "白色", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "广州开发区交投氢能运营管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "广州开发区交投氢能运营管理有限公司", vehicleType: "轻型厢式货车", brand: "现代", model: "4.5吨货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "异常", insuranceStatus: "正常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2024-05-24", inspectExpire: "2027-05-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "83", plateNo: "沪A39286F", vin: "LMRKH9AC1R1004114", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "成都宇通服务站停车场", ownership: "上海羚牛氢运物联网科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "上海羚牛氢运物联网科技有限公司", vehicleSource: "自有", leaseCompany: "上海羚牛氢运物联网科技有限公司", vehicleType: "重型半挂牵引车", brand: "宇通", model: "49吨牵引车头", customer: "四川群彬物流有限公司", department: "业务五部", manager: "秦挺", contractNo: "LNZLHT2026010701-042", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "4357.00", location: "四川省成都市", gpsTime: "2026-06-23 14:17:35", regDate: "2024-06-03", inspectExpire: "2027-06-30", lastDeliveryTime: "2025-12-24 15:21:00", lastDeliveryMile: "4357.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "84", plateNo: "沪AF58471", vin: "LSFGL23Z2ND214427", vehicleNo: "147", color: "白/绿/灰", year: "-", purchaseDate: "-", parking: "-", ownership: "羚牛新能源科技（上海）有限公司", scrapDate: "-", ratingTime: "2026-11-30 00:00:00", operateCompany: "羚牛新能源科技（上海）有限公司", vehicleSource: "自有", leaseCompany: "羚牛新能源科技（上海）有限公司", vehicleType: "轻型厢式货车", brand: "跃进", model: "4.5吨冷链车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "浙江省杭州市", gpsTime: "2026-06-23 14:17:34", regDate: "2022-11-07", inspectExpire: "2026-11-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "85", plateNo: "浙F03268F", vin: "LA9HE60A2NBAF4029", vehicleNo: "-", color: "红", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "重型厢式货车", brand: "飞驰", model: "18吨厢式货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:34", regDate: "2022-06-27", inspectExpire: "2027-06-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "86", plateNo: "京A05989F", vin: "LCFZ1KRD8P0Z00687", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "-", ownership: "北京氢运羚壹供应链管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "北京氢运羚壹供应链管理有限公司", vehicleSource: "自有", leaseCompany: "北京氢运羚壹供应链管理有限公司", vehicleType: "重型厢式货车", brand: "楚风", model: "18吨厢式货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "北京市大兴区", gpsTime: "2026-06-05 13:51:33", regDate: "2024-06-04", inspectExpire: "2026-06-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "87", plateNo: "浙FKV19挂", vin: "LJRC2237602011262", vehicleNo: "-", color: "红色", year: "-", purchaseDate: "-", parking: "-", ownership: "嘉兴市鼎义物流有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "嘉兴市鼎义物流有限公司", vehicleType: "重型集装箱半挂车", brand: "通华", model: "重型集装箱半挂车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "-", location: "浙江省", gpsTime: "-", regDate: "2012-08-03", inspectExpire: "2026-08-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "离线", projectName: "-", vehicleLedgerType: "非运营车辆" },
	{ id: "88", plateNo: "粤AGQ3155", vin: "LB9A32A20R0LS1410", vehicleNo: "-", color: "白色", year: "-", purchaseDate: "-", parking: "广州开创大道停车场", ownership: "广州开发区交投氢能运营管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "广州开发区交投氢能运营管理有限公司", vehicleType: "轻型厢式货车", brand: "现代", model: "帕力安牌4.5吨冷链车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "0.00", location: "广东省广州市", gpsTime: "2026-06-23 14:17:35", regDate: "2025-02-19", inspectExpire: "2027-02-28", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "89", plateNo: "沪A39585F", vin: "LKLG7C4E0NA774807", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "汇通检测站停车场", ownership: "上海宇速物流有限公司", scrapDate: "-", ratingTime: "2026-10-31 00:00:00", operateCompany: "上海宇速物流有限公司", vehicleSource: "自有", leaseCompany: "-", vehicleType: "重型厢式货车", brand: "苏龙", model: "海格牌18吨双飞翼货车", customer: "西安御盛合供应链管理有限公司", department: "业务三部", manager: "金可鹏", contractNo: "LNZLHT20260108-3042", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "32351.00", location: "陕西省西安市", gpsTime: "2026-06-23 14:17:35", regDate: "2022-10-28", inspectExpire: "2026-08-14", lastDeliveryTime: "2025-07-25 16:45:00", lastDeliveryMile: "32351.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "90", plateNo: "浙F32233F", vin: "LA9GG64L1NBAF4184", vehicleNo: "53Q", color: "白/蓝/绿", year: "-", purchaseDate: "-", parking: "-", ownership: "嘉兴氢能产业发展股份有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "嘉兴氢能产业发展股份有限公司", vehicleType: "重型半挂牵引车", brand: "飞驰", model: "49吨牵引车头", customer: "嘉兴市乍浦港口经营有限公司", department: "业务一部", manager: "陈高伟", contractNo: "JXGW-GC-23-ZL-120", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "265.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2022-11-21", inspectExpire: "2026-11-30", lastDeliveryTime: "2022-12-21 00:00:00", lastDeliveryMile: "265.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "91", plateNo: "粤A03331F", vin: "LNXNEGRR0SR321369", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "羚牛氢能科技(广东)有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "自有", leaseCompany: "-", vehicleType: "重型厢式货车", brand: "现代", model: "帕力安牌18吨双飞翼货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2026-06-22 16:22:19", regDate: "2025-12-03", inspectExpire: "2026-12-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "92", plateNo: "粤AG17852", vin: "LB9A32A21P0LS1235", vehicleNo: "-", color: "白", year: "-", purchaseDate: "2025-12-30", parking: "广州开创大道停车场", ownership: "现代氢能科技（广州）有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "恒运", vehicleType: "轻型厢式货车", brand: "现代", model: "4.5吨货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "0.00", location: "广东省广州市", gpsTime: "2026-06-08 13:29:16", regDate: "2023-12-15", inspectExpire: "2026-12-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "93", plateNo: "沪A60552F", vin: "LMRKH9AC1R1004128", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "乌鲁木齐隆盛达停车场", ownership: "上海羚牛氢运物联网科技有限公司", scrapDate: "-", ratingTime: "2026-06-30 00:00:00", operateCompany: "上海羚牛氢运物联网科技有限公司", vehicleSource: "自有", leaseCompany: "上海羚牛氢运物联网科技有限公司", vehicleType: "重型半挂牵引车", brand: "宇通", model: "49吨牵引车头", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "新疆维吾尔自治区乌鲁木齐市", gpsTime: "2026-06-23 14:17:34", regDate: "2024-06-04", inspectExpire: "2027-06-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "94", plateNo: "沪AGZ9860", vin: "LSFGL23Z3ND105023", vehicleNo: "17", color: "白/绿/灰", year: "-", purchaseDate: "-", parking: "乌鲁木齐隆盛达停车场", ownership: "羚牛新能源科技（上海）有限公司", scrapDate: "-", ratingTime: "2026-10-31 00:00:00", operateCompany: "羚牛新能源科技（上海）有限公司", vehicleSource: "自有", leaseCompany: "羚牛新能源科技（上海）有限公司", vehicleType: "轻型厢式货车", brand: "跃进", model: "4.5吨冷链车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2022-10-09", inspectExpire: "2026-10-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "95", plateNo: "浙F07000F", vin: "LA9HE60A2NBAF4032", vehicleNo: "-", color: "红", year: "-", purchaseDate: "-", parking: "汇通检测站停车场", ownership: "浙江羚牛氢能科技有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "自有", leaseCompany: "浙江羚牛氢能科技有限公司", vehicleType: "重型厢式货车", brand: "飞驰", model: "18吨厢式货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "待运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "异常", mileage: "0.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2022-06-27", inspectExpire: "2026-06-30", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "96", plateNo: "京A43005F", vin: "LCFZ1KRD8R0Z00126", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "北京一汽宏特停车场", ownership: "北京氢运羚壹供应链管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "北京氢运羚壹供应链管理有限公司", vehicleSource: "自有", leaseCompany: "北京氢运羚壹供应链管理有限公司", vehicleType: "重型厢式货车", brand: "楚风", model: "18吨厢式货车", customer: "-", department: "-", manager: "-", contractNo: "-", operateStatus: "可运营", vehicleStatus: "未备车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "0.00", location: "北京市大兴区", gpsTime: "2026-06-23 11:41:31", regDate: "2024-07-19", inspectExpire: "2026-07-31", lastDeliveryTime: "-", lastDeliveryMile: "-", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "97", plateNo: "粤AGP3508", vin: "LB9A32A20R0LS1424", vehicleNo: "-", color: "白色", year: "-", purchaseDate: "-", parking: "平湖停车场", ownership: "广州开发区交投氢能运营管理有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "外租", leaseCompany: "广州开发区交投氢能运营管理有限公司", vehicleType: "轻型厢式货车", brand: "现代", model: "帕力安牌4.5吨冷链车", customer: "浙江洋开供应链管理有限公司", department: "业务二部", manager: "刘念念", contractNo: "20250815001", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "465.00", location: "浙江省杭州市", gpsTime: "2026-06-23 14:17:35", regDate: "2025-02-25", inspectExpire: "2027-01-31", lastDeliveryTime: "2025-09-30 15:16:20", lastDeliveryMile: "465.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "98", plateNo: "沪A37785F", vin: "LKLG7C4E0NA774810", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "-", ownership: "上海宇速物流有限公司", scrapDate: "-", ratingTime: "2026-11-30 00:00:00", operateCompany: "上海宇速物流有限公司", vehicleSource: "自有", leaseCompany: "-", vehicleType: "重型厢式货车", brand: "苏龙", model: "海格牌18吨双飞翼货车", customer: "西安御盛合供应链管理有限公司", department: "业务三部", manager: "金可鹏", contractNo: "LNZLHT20260108-3042", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "789.00", location: "陕西省西安市", gpsTime: "2026-06-23 14:17:35", regDate: "2022-11-10", inspectExpire: "2026-09-26", lastDeliveryTime: "2025-07-29 14:35:59", lastDeliveryMile: "789.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "99", plateNo: "浙F01208F", vin: "LA9GG64L1NBAF4198", vehicleNo: "-", color: "白/蓝/绿", year: "-", purchaseDate: "-", parking: "-", ownership: "嘉兴氢能产业发展股份有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "浙江羚牛氢能科技有限公司", vehicleSource: "外租", leaseCompany: "嘉兴氢能产业发展股份有限公司", vehicleType: "重型半挂牵引车", brand: "飞驰", model: "49吨牵引车头", customer: "羚牛氢能-物流中心", department: "业务二部", manager: "尚建华", contractNo: "JXLN-23-019", operateStatus: "自营", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "186.00", location: "浙江省嘉兴市", gpsTime: "2026-06-23 14:17:35", regDate: "2022-12-22", inspectExpire: "2026-12-31", lastDeliveryTime: "2023-02-28 00:00:00", lastDeliveryMile: "186.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" },
	{ id: "100", plateNo: "粤A02298F", vin: "LNXNEGRR0SR321372", vehicleNo: "-", color: "白", year: "-", purchaseDate: "-", parking: "嘉兴公司楼下氢能展厅", ownership: "羚牛氢能科技(广东)有限公司", scrapDate: "-", ratingTime: "-", operateCompany: "羚牛氢能科技(广东)有限公司", vehicleSource: "自有", leaseCompany: "-", vehicleType: "重型厢式货车", brand: "现代", model: "帕力安牌18吨双飞翼货车", customer: "嘉兴市京宝物流有限公司", department: "业务二部", manager: "刘念念", contractNo: "LNZLHT 20260510001", operateStatus: "租赁", vehicleStatus: "已交车", licenseStatus: "正常", insuranceStatus: "正常", mileage: "43434.00", location: "浙江省金华市", gpsTime: "2026-06-23 14:17:21", regDate: "2025-12-02", inspectExpire: "2026-12-31", lastDeliveryTime: "2026-05-14 09:05:57", lastDeliveryMile: "43434.00", lastReturnTime: "-", lastReturnMile: "-", outStatus: "无", onlineStatus: "在线", projectName: "-" }
];

/** 停车场名称 → 所属区域（省-市），与停车场管理台账一致 */
var VM_PARKING_REGION_BY_NAME = {
	'广州开创大道停车场': '广东省-广州市',
	'开创大道云埔宏仁便民停车场': '广东省-广州市',
	'广州现代停车场': '广东省-广州市',
	'平湖停车场': '浙江省-嘉兴市',
	'嘉兴公司楼下氢能展厅': '浙江省-嘉兴市',
	'嘉兴秀洲加氢站停车场': '浙江省-嘉兴市',
	'嘉兴金小悦停车场': '浙江省-嘉兴市',
	'汇通检测站停车场': '浙江省-嘉兴市',
	'龙王路停车场': '浙江省-嘉兴市',
	'成都宇通服务站停车场': '四川省-成都市',
	'北京一汽宏特停车场': '北京市-北京市',
	'北京一汽宏特修理厂停车场': '北京市-北京市',
	'佛山汽车运输集团公交分公司塱沙充电站': '广东省-佛山市',
	'佛山龙天重庆红专停车场': '广东省-佛山市',
	'韶关宝氢科技停车场': '广东省-韶关市',
	'乌鲁木齐隆盛达停车场': '新疆维吾尔自治区-乌鲁木齐市',
	'四川汶川客户停车场': '四川省-阿坝藏族羌族自治州'
};

/** 样例数据：按省-市生成完整 GPS 地址（区/路/号） */
var VM_MOCK_FULL_ADDRESS_SUFFIX_BY_CITY = {
	'广东省-广州市': ['黄埔区开创大道188号', '天河区黄埔大道西100号', '番禺区南村镇兴业大道1号'],
	'上海市-上海市': ['奉贤区南桥镇解放东路200号', '浦东新区张江路88号', '嘉定区安亭镇墨玉路66号'],
	'浙江省-嘉兴市': ['南湖区中环南路1288号', '秀洲区高照街道秀园路356号', '平湖市当湖街道新华南路88号'],
	'浙江省-杭州市': ['余杭区文一西路969号', '萧山区市心北路200号'],
	'浙江省-湖州市': ['吴兴区二环西路188号', '南浔区人瑞路66号'],
	'浙江省-金华市': ['婺城区宾虹路288号', '金东区东市街100号'],
	'浙江省-绍兴市': ['越城区解放北路188号'],
	'浙江省-宁波市': ['鄞州区南部商务区天童南路535号'],
	'江苏省-常州市': ['武进区常武中路18号', '新北区通江路88号'],
	'江苏省-苏州市': ['工业园区星湖街328号'],
	'江苏省-南京市': ['江宁区清水亭西路88号'],
	'河南省-开封市': ['龙亭区东京大道西段168号'],
	'四川省-成都市': ['双流区大件路白家段888号', '武侯区科园南路88号'],
	'四川省-德阳市': ['旌阳区长江东路168号'],
	'北京市-北京市': ['大兴区兴华大街188号', '朝阳区望京街10号'],
	'陕西省-西安市': ['未央区明光路100号', '雁塔区科技路88号'],
	'广东省-佛山市': ['南海区桂城街道灯湖东路66号', '顺德区大良街道凤翔路18号'],
	'湖北省-武汉市': ['洪山区珞狮路122号'],
	'重庆市-重庆市': ['大渡口区春晖路88号'],
	'新疆维吾尔自治区-乌鲁木齐市': ['头屯河区黄河路168号']
};

var VM_MOCK_FULL_ADDRESS_BY_PROVINCE = {
	'浙江省': ['嘉兴市南湖区中环南路1288号', '杭州市余杭区文一西路969号', '湖州市吴兴区二环西路188号'],
	'广东省': ['广州市黄埔区开创大道188号', '佛山市南海区桂城街道灯湖东路66号'],
	'四川省': ['成都市双流区大件路白家段888号'],
	'上海市': ['奉贤区南桥镇解放东路200号']
};

/** 运维负责人候选：角色为运维专员/运维助理/运维主管；弹窗选择器展示全部样例人员，区域匹配项优先排序 */
var VM_OPS_MANAGER_ROLES = ['运维专员', '运维助理', '运维主管'];
/** 联调后对接权限中心；运维负责人编辑权限码 */
var VM_OPS_MANAGER_EDIT_PERMISSION = 'vehicle:opsManager:edit';
var VM_OPS_STAFF = [
	{ name: '张明辉', role: '运维主管', regions: ['浙江省-嘉兴市'] },
	{ name: '魏山', role: '运维专员', regions: ['浙江省-嘉兴市'] },
	{ name: '陈高伟', role: '运维主管', regions: ['浙江省-嘉兴市'] },
	{ name: '何苗苗', role: '运维助理', regions: ['浙江省-嘉兴市'] },
	{ name: '林峰', role: '运维专员', regions: ['浙江省-嘉兴市', '浙江省-湖州市'] },
	{ name: '李强', role: '运维专员', regions: ['广东省-广州市'] },
	{ name: '王东东', role: '运维主管', regions: ['广东省-广州市'] },
	{ name: '周婷', role: '运维助理', regions: ['广东省-广州市'] },
	{ name: '尚建华', role: '运维助理', regions: ['上海市-上海市'] },
	{ name: '马超', role: '运维主管', regions: ['上海市-上海市'] },
	{ name: '刘强', role: '运维专员', regions: ['四川省-成都市'] },
	{ name: '孙伟', role: '运维专员', regions: ['浙江省-湖州市'] },
	{ name: '赵静', role: '运维专员', regions: ['北京市-北京市'] },
	{ name: '吴磊', role: '运维助理', regions: ['广东省-佛山市'] },
	{ name: '郑凯', role: '运维主管', regions: ['新疆维吾尔自治区-乌鲁木齐市'] }
];

/** 合同编码 → 项目名称（联调后由租赁合同 API 返回；样例用于补全车辆台账） */
var VM_CONTRACT_PROJECT_BY_NO = {
	'JXGW-GC-23-ZL-611': '乍浦港口氢能运输项目（611）',
	'JXGW-GC-23-ZL-120': '乍浦港口氢能运输项目（120）',
	'JXGW-GC-25-ZL-045': '乍浦港口氢能运输项目（045）',
	'LNZLHT2025110402': '南京威路物流干线运输项目',
	'LNZLHTJX23102701': '浙江氢能产业发展租赁项目',
	'LNGWC20240105': '羚牛公务车项目',
	'JXLN-23-019': '羚牛物流中心项目',
	'LNZLHTSH2023071301': '上海宇速干线租赁项目'
};

// 与「保险采购」台账一致；联调后改由证照/保险管理 API 按车辆返回
var VM_IPC_STORAGE_KEY = 'oneos_ipc_insurance_v1';
var VM_INSURANCE_SEED = {
	'沪A03561F': {
		compulsory: { policyNo: 'PDZA202533048200000123', endDate: '2026-12-31' },
		commercial: { policyNo: 'PDAA202533048200000456', endDate: '2026-12-31' }
	}
};
var _vmInsuranceLedgerCache = null;

function vmNormalizePlateNo(plate) {
	return (plate || '').trim().toUpperCase();
}

/** 多车牌：优先按行解析，单行内仍支持逗号分隔 */
function vmParseMultiPlates(text) {
	var raw = (text || '').trim();
	if (!raw) return [];
	var lines = raw.split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean);
	var expanded = [];
	var i;
	var line;
	var parts;
	var j;
	for (i = 0; i < lines.length; i++) {
		line = lines[i];
		if (/[,，、;；]/.test(line)) {
			parts = line.split(/[,，、;；]+/);
			for (j = 0; j < parts.length; j++) {
				if (parts[j].trim()) expanded.push(parts[j].trim());
			}
		} else {
			expanded.push(line);
		}
	}
	var seen = {};
	var out = [];
	for (i = 0; i < expanded.length; i++) {
		var key = vmNormalizePlateNo(expanded[i]);
		if (key && !seen[key]) {
			seen[key] = true;
			out.push(key);
		}
	}
	return out;
}

function vmGetVehicleLedgerKey(record) {
	var plate = record && record.plateNo ? String(record.plateNo).trim() : '';
	if (plate && plate !== '-') return plate;
	var vin = record && record.vin ? String(record.vin).trim() : '';
	return vin && vin !== '-' ? vin : '';
}

function vmGetInsuranceLedger() {
	var merged = {};
	var seedKeys = Object.keys(VM_INSURANCE_SEED);
	var i;
	for (i = 0; i < seedKeys.length; i++) {
		merged[seedKeys[i]] = VM_INSURANCE_SEED[seedKeys[i]];
	}
	try {
		if (typeof localStorage !== 'undefined') {
			var raw = localStorage.getItem(VM_IPC_STORAGE_KEY);
			if (raw) {
				var stored = JSON.parse(raw);
				if (stored && typeof stored === 'object') {
					Object.keys(stored).forEach(function (k) {
						merged[k] = stored[k];
					});
				}
			}
		}
	} catch (e) { /* ignore */ }
	return merged;
}

function vmGetInsuranceLedgerCached() {
	if (!_vmInsuranceLedgerCache) _vmInsuranceLedgerCache = vmGetInsuranceLedger();
	return _vmInsuranceLedgerCache;
}

function vmFormatDateYmd(raw) {
	if (vmIsEmptyDisplayValue(raw)) return '';
	var s = String(raw).trim();
	var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (m) return m[1] + '-' + m[2] + '-' + m[3];
	return s;
}

/** 距到期日天数：正=剩余，负=已过期 */
function vmDaysUntilExpire(dateStr) {
	var ymd = vmFormatDateYmd(dateStr);
	if (!ymd) return null;
	var parts = ymd.split('-');
	var y = parseInt(parts[0], 10);
	var m = parseInt(parts[1], 10) - 1;
	var d = parseInt(parts[2], 10);
	if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
	var end = new Date(y, m, d, 23, 59, 59, 999);
	var today = new Date();
	today.setHours(0, 0, 0, 0);
	return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function vmRenderExpireRemainTag(dateStr) {
	var days = vmDaysUntilExpire(dateStr);
	if (days == null) return null;
	var Tag = window.antd && window.antd.Tag;
	if (!Tag) return null;
	var tagProps = { className: 'vm-expire-remain-tag' };
	if (days < 0) {
		return React.createElement(Tag, Object.assign({}, tagProps, {
			color: 'error',
			'aria-label': '已过期' + Math.abs(days) + '天'
		}), '已过期' + Math.abs(days) + '天');
	}
	if (days <= 30) {
		return React.createElement(Tag, Object.assign({}, tagProps, {
			color: 'warning',
			'aria-label': '剩余' + days + '天'
		}), '剩余' + days + '天');
	}
	return React.createElement(Tag, Object.assign({}, tagProps, {
		color: 'success',
		'aria-label': '剩余' + days + '天'
	}), '剩余' + days + '天');
}

function vmExpireDateOnCell() {
	return { className: 'vm-expire-date-td' };
}

function vmRenderExpireDateCell(dateRaw, forList) {
	var dateText = vmFormatDateYmd(dateRaw);
	if (!dateText) return forList ? '' : VM_EMPTY_DISPLAY_LABEL;
	return React.createElement('div', { className: 'vm-expire-date-cell' },
		React.createElement('span', {
			className: 'vm-oneline-text vm-insurance-expire-date',
			title: dateText
		}, dateText),
		vmRenderExpireRemainTag(dateRaw)
	);
}

function vmGetInsuranceEndDateFromLedger(ledgerKey, typeKey, ledger) {
	var item = ledger[ledgerKey] && ledger[ledgerKey][typeKey];
	if (!item || vmIsEmptyDisplayValue(item.policyNo)) return '';
	return vmFormatDateYmd(item.endDate);
}

function vmPrototypeInsuranceEndDate(record, typeKey) {
	var plate = vmGetVehicleLedgerKey(record);
	if (!plate) return '';
	var src = plate + '|' + typeKey;
	var h = 0;
	var i;
	for (i = 0; i < src.length; i++) h = ((h << 5) - h) + src.charCodeAt(i);
	h = Math.abs(h);
	if (record && record.insuranceStatus === '异常') {
		if (typeKey === 'compulsory' && h % 4 === 0) return '';
		if (typeKey === 'commercial' && h % 4 === 1) return '';
		if (h % 4 === 2) {
			return vmFormatDateYmd('2025-' + String((h % 12) + 1).padStart(2, '0') + '-' + String((h % 27) + 1).padStart(2, '0'));
		}
	}
	var year = 2026 + (typeKey === 'commercial' ? (h % 2) : 0);
	return year + '-' + String((h % 12) + 1).padStart(2, '0') + '-' + String((h % 28) + 1).padStart(2, '0');
}

function vmResolveVehicleInsuranceEndDate(record, typeKey) {
	var ledgerKey = vmGetVehicleLedgerKey(record);
	if (!ledgerKey) return '';
	var fromLedger = vmGetInsuranceEndDateFromLedger(ledgerKey, typeKey, vmGetInsuranceLedgerCached());
	if (fromLedger) return fromLedger;
	return vmPrototypeInsuranceEndDate(record, typeKey);
}

function vmRenderInsuranceExpireDate(record, typeKey, forList) {
	var dateText = vmResolveVehicleInsuranceEndDate(record, typeKey);
	return vmRenderExpireDateCell(dateText, forList);
}

/** 外部样式表路径，构建时可在入口设置 window.VM_STYLESHEET_HREF */
var VM_STYLESHEET_DEFAULT_HREF = 'styles/vehicle-management.css';

function vmEnsureStylesheet() {
	if (typeof document === 'undefined') return;
	var href = (typeof window !== 'undefined' && window.VM_STYLESHEET_HREF) || VM_STYLESHEET_DEFAULT_HREF;
	if (document.getElementById('vm-page-stylesheet')) return;
	var link = document.createElement('link');
	link.id = 'vm-page-stylesheet';
	link.rel = 'stylesheet';
	link.href = href;
	document.head.appendChild(link);
}

function vmSvgIcon(paths, size) {
	return React.createElement('svg', {
		viewBox: '0 0 24 24',
		width: size || 16,
		height: size || 16,
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

var VM_ICONS = {
	doc: vmSvgIcon([{ d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }, { d: 'M14 2v6h6' }], 14),
	search: vmSvgIcon([{ tag: 'circle', cx: 11, cy: 11, r: 8 }, { tag: 'line', x1: 21, y1: 21, x2: 16.65, y2: 16.65 }], 14),
	export: vmSvgIcon([{ d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }, { d: 'M7 10l5 5 5-5' }, { tag: 'line', x1: 12, y1: 15, x2: 12, y2: 3 }], 14),
	upload: vmSvgIcon([{ d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }, { d: 'M17 8l-5-5-5 5' }, { tag: 'line', x1: 12, y1: 3, x2: 12, y2: 15 }], 14),
	back: vmSvgIcon([{ tag: 'line', x1: 19, y1: 12, x2: 5, y2: 12 }, { d: 'M12 19l-7-7 7-7' }], 16),
	edit: vmSvgIcon([{ d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }, { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' }], 14),
	truck: vmSvgIcon([{ d: 'M1 3h15v13H1zM16 8h4l3 3v5h-7V8z' }, { tag: 'circle', cx: 5.5, cy: 18.5, r: 2.5 }, { tag: 'circle', cx: 18.5, cy: 18.5, r: 2.5 }], 18),
	empty: vmSvgIcon([{ tag: 'circle', cx: 12, cy: 12, r: 10 }, { tag: 'line', x1: 8, y1: 12, x2: 16, y2: 12 }], 40)
};

var VM_KPI_ICONS = {
	all: VM_ICONS.truck,
	operating: vmSvgIcon([{ tag: 'circle', cx: 12, cy: 12, r: 10 }, { d: 'M8 12l2 2 4-4' }], 22),
	stock: vmSvgIcon([{ d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }, { d: 'M9 22V12h6v10' }], 22),
	nonOperating: vmSvgIcon([{ d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }, { tag: 'line', x1: 9, y1: 9, x2: 15, y2: 15 }, { tag: 'line', x1: 15, y1: 9, x2: 9, y2: 15 }], 22),
	exit: vmSvgIcon([{ d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }, { d: 'M16 17l5-5-5-5' }, { tag: 'line', x1: 21, y1: 12, x2: 9, y2: 12 }], 22),
	licenseAbnormal: vmSvgIcon([{ d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }, { d: 'M14 2v6h6' }, { tag: 'line', x1: 12, y1: 11, x2: 12, y2: 17 }, { tag: 'line', x1: 12, y1: 8, x2: 12.01, y2: 8 }], 22),
	insuranceAbnormal: vmSvgIcon([{ d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }], 22)
};

function vmMoreIcon() {
	return React.createElement('svg', { viewBox: '0 0 16 16', width: 16, height: 16, fill: 'currentColor', 'aria-hidden': true },
		React.createElement('circle', { cx: 8, cy: 3, r: 1.5 }),
		React.createElement('circle', { cx: 8, cy: 8, r: 1.5 }),
		React.createElement('circle', { cx: 8, cy: 13, r: 1.5 })
	);
}

function vmOperateStatusColor(status) {
	if (status === '租赁') return 'processing';
	if (status === '自营') return 'geekblue';
	if (status === '可运营') return 'success';
	if (status === '待运营') return 'warning';
	if (status === '退出运营') return 'default';
	return 'default';
}

function vmAlertStatusColor(status) {
	if (status === '异常') return 'error';
	if (status === '正常') return 'success';
	return 'default';
}

function vmVehicleSourceColor(source) {
	if (source === '自有') return 'success';
	if (source === '外租') return 'processing';
	if (source === '挂靠') return 'warning';
	return 'default';
}

/** 从 GPS 定位地址解析「省-市」运营城市 */
function vmFormatOperateCityFromGps(location) {
	if (vmIsEmptyDisplayValue(location)) return '';
	var loc = String(location).trim();
	var municipalities = ['北京市', '上海市', '天津市', '重庆市'];
	var i;
	for (i = 0; i < municipalities.length; i++) {
		if (loc.indexOf(municipalities[i]) === 0) {
			return municipalities[i] + '-' + municipalities[i];
		}
	}
	var provMatch = loc.match(/^(.*?(?:省|自治区))/);
	if (!provMatch) return '';
	var province = provMatch[1];
	var rest = loc.slice(provMatch[1].length);
	var cityMatch = rest.match(/^(.+?市)/);
	if (cityMatch) return province + '-' + cityMatch[1];
	cityMatch = rest.match(/^(.+?(?:州|盟|地区))/);
	if (cityMatch) return province + '-' + cityMatch[1];
	return province;
}

function vmPickMockRoadSuffix(record) {
	var idNum = parseInt(record && record.id, 10) || 0;
	var roads = ['示范路', '兴业大道', '创业路', '新华南路', '中环南路', '解放东路', '科技路'];
	return roads[idNum % roads.length] + (100 + idNum % 800) + '号';
}

function vmBuildFullLocationAddress(record) {
	var loc = vmDisplayFieldText(record && record.location);
	if (!loc) return '';
	var cityKey = vmFormatOperateCityFromGps(loc);
	var idNum = parseInt(record && record.id, 10) || 0;
	var suffixes;
	var suffix;
	var prefix;
	if (cityKey && VM_MOCK_FULL_ADDRESS_SUFFIX_BY_CITY[cityKey]) {
		suffixes = VM_MOCK_FULL_ADDRESS_SUFFIX_BY_CITY[cityKey];
		suffix = suffixes[idNum % suffixes.length];
		prefix = cityKey.replace('-', '');
		if (suffix.indexOf(prefix) === 0) return suffix;
		return prefix + suffix;
	}
	if (VM_MOCK_FULL_ADDRESS_BY_PROVINCE[loc]) {
		suffixes = VM_MOCK_FULL_ADDRESS_BY_PROVINCE[loc];
		return suffixes[idNum % suffixes.length];
	}
	if (/[区县]/.test(loc) && loc.length > 4) {
		return loc + vmPickMockRoadSuffix(record);
	}
	if (cityKey) {
		return cityKey.replace('-', '') + '城区' + vmPickMockRoadSuffix(record);
	}
	return loc + vmPickMockRoadSuffix(record);
}

function vmResolveLocationFullAddress(record) {
	var direct = vmDisplayFieldText(record && record.locationAddress);
	if (direct) return direct;
	return vmBuildFullLocationAddress(record);
}

function vmResolveVehicleLedgerType(record) {
	return String(record && record.vehicleLedgerType ? record.vehicleLedgerType : '运营车辆').trim();
}

function vmIsNonOperatingVehicle(record) {
	return vmResolveVehicleLedgerType(record) === '非运营车辆';
}

/** 所有营运车辆：排除非运营车辆与退出运营 */
function vmIsOperatingFleetVehicle(record) {
	if (!record) return false;
	if (vmIsNonOperatingVehicle(record)) return false;
	if (record.operateStatus === '退出运营') return false;
	return true;
}

function vmMatchOperateCityFilter(record, selectedCities) {
	if (!selectedCities || !selectedCities.length) return true;
	var city = vmFormatOperateCityFromGps(record && record.location);
	if (!city) return false;
	return selectedCities.indexOf(city) >= 0;
}

var VM_OPERATE_CITY_SEED = [
	'北京市-北京市', '上海市-上海市', '天津市-天津市', '重庆市-重庆市',
	'广东省-广州市', '广东省-深圳市', '广东省-佛山市', '广东省-韶关市',
	'浙江省-嘉兴市', '浙江省-杭州市', '浙江省-湖州市', '浙江省-金华市',
	'江苏省-常州市', '江苏省-南京市', '江苏省-苏州市',
	'四川省-成都市', '河南省-开封市', '陕西省-西安市',
	'新疆维吾尔自治区-乌鲁木齐市'
];

function vmBuildOperateCityOptions(records) {
	var seen = {};
	var opts = [];
	var i;
	var key;
	function add(city) {
		if (!city || seen[city]) return;
		seen[city] = true;
		opts.push({ label: city, value: city });
	}
	Object.keys(VM_PARKING_REGION_BY_NAME).forEach(function (name) {
		add(VM_PARKING_REGION_BY_NAME[name]);
	});
	for (i = 0; i < VM_OPERATE_CITY_SEED.length; i++) {
		add(VM_OPERATE_CITY_SEED[i]);
	}
	if (records && records.length) {
		for (i = 0; i < records.length; i++) {
			add(vmFormatOperateCityFromGps(records[i].location));
		}
	}
	opts.sort(function (a, b) {
		return String(a.label).localeCompare(String(b.label), 'zh-CN');
	});
	return opts;
}

function vmBuildProjectNameOptions(records) {
	var seen = {};
	var opts = [];
	function add(name) {
		var text = name ? String(name).trim() : '';
		if (!text || seen[text]) return;
		seen[text] = true;
		opts.push({ label: text, value: text });
	}
	Object.keys(VM_CONTRACT_PROJECT_BY_NO).forEach(function (key) {
		add(VM_CONTRACT_PROJECT_BY_NO[key]);
	});
	if (records && records.length) {
		var i;
		for (i = 0; i < records.length; i++) {
			add(vmResolveVehicleProjectName(records[i]));
		}
	}
	opts.sort(function (a, b) {
		return String(a.label).localeCompare(String(b.label), 'zh-CN');
	});
	return opts;
}

function vmParseRegionParts(regionText) {
	var text = vmIsEmptyDisplayValue(regionText) ? '' : String(regionText).trim();
	if (!text) return { province: '', city: '' };
	var dash = text.indexOf('-');
	if (dash >= 0) {
		return {
			province: text.slice(0, dash).trim(),
			city: text.slice(dash + 1).trim()
		};
	}
	if (text.indexOf('省') >= 0 || text.indexOf('自治区') >= 0 || text.indexOf('市') === text.length - 1) {
		return { province: text, city: '' };
	}
	return { province: '', city: text };
}

function vmRegionCityMatch(cityA, cityB) {
	if (!cityA || !cityB) return false;
	return cityA === cityB || cityA.indexOf(cityB) >= 0 || cityB.indexOf(cityA) >= 0;
}

function vmMatchOpsStaffRegion(staffRegion, parkingRegion) {
	var staff = vmParseRegionParts(staffRegion);
	var parking = vmParseRegionParts(parkingRegion);
	if (!staff.province && !staff.city) return false;
	if (!parking.province && !parking.city) return false;
	if (staff.province && parking.province && staff.province !== parking.province) return false;
	if (staff.city) {
		return vmRegionCityMatch(parking.city, staff.city);
	}
	return staff.province === parking.province;
}

function vmGetParkingRegionByName(parkingName) {
	if (vmIsEmptyDisplayValue(parkingName)) return '';
	return VM_PARKING_REGION_BY_NAME[String(parkingName).trim()] || '';
}

function vmEnrichVehicleHandoverRegions(record) {
	var next = Object.assign({}, record);
	function fillRegion(timeKey, regionKey) {
		if (vmIsEmptyDisplayValue(next[timeKey])) return;
		if (!vmIsEmptyDisplayValue(next[regionKey])) return;
		var parkingRegion = vmGetParkingRegionByName(next.parking);
		if (parkingRegion) {
			next[regionKey] = parkingRegion;
			return;
		}
		var city = vmFormatOperateCityFromGps(next.location);
		if (city) next[regionKey] = city;
	}
	fillRegion('lastDeliveryTime', 'lastDeliveryRegion');
	fillRegion('lastReturnTime', 'lastReturnRegion');
	return next;
}

function vmEnrichVehicleLocationAddress(record) {
	var next = Object.assign({}, record);
	if (!vmIsEmptyDisplayValue(next.location) && vmIsEmptyDisplayValue(next.locationAddress)) {
		next.locationAddress = vmBuildFullLocationAddress(next);
	}
	return next;
}

function vmPrepareVehicleSampleData() {
	var list = [];
	var i;
	for (i = 0; i < VM_SAMPLE_VEHICLE_DATA.length; i++) {
		list.push(vmEnrichVehicleLocationAddress(vmEnrichVehicleHandoverRegions(VM_SAMPLE_VEHICLE_DATA[i])));
	}
	return list;
}

var VM_PREPARED_VEHICLE_DATA = vmPrepareVehicleSampleData();

function vmGetAutoOpsManagers(record) {
	var parkingRegion = vmGetParkingRegionByName(record && record.parking);
	if (!parkingRegion) return [];
	var names = [];
	var seen = {};
	var i;
	var j;
	var staff;
	var regions;
	for (i = 0; i < VM_OPS_STAFF.length; i++) {
		staff = VM_OPS_STAFF[i];
		if (VM_OPS_MANAGER_ROLES.indexOf(staff.role) < 0) continue;
		regions = staff.regions || [];
		for (j = 0; j < regions.length; j++) {
			if (vmMatchOpsStaffRegion(regions[j], parkingRegion)) {
				if (!seen[staff.name]) {
					seen[staff.name] = true;
					names.push(staff.name);
				}
				break;
			}
		}
	}
	return names;
}

function vmResolveVehicleOpsManagers(record) {
	if (record && Array.isArray(record.opsManagers)) {
		return record.opsManagers.slice();
	}
	return vmGetAutoOpsManagers(record);
}

function vmGetOpsManagerCandidates(record) {
	var parkingRegion = vmGetParkingRegionByName(record && record.parking);
	if (!parkingRegion) return [];
	var list = [];
	var seen = {};
	var i;
	var j;
	var staff;
	var regions;
	for (i = 0; i < VM_OPS_STAFF.length; i++) {
		staff = VM_OPS_STAFF[i];
		if (VM_OPS_MANAGER_ROLES.indexOf(staff.role) < 0) continue;
		regions = staff.regions || [];
		for (j = 0; j < regions.length; j++) {
			if (vmMatchOpsStaffRegion(regions[j], parkingRegion)) {
				if (!seen[staff.name]) {
					seen[staff.name] = true;
					list.push({ name: staff.name, role: staff.role });
				}
				break;
			}
		}
	}
	return list;
}

function vmGetAllOpsManagerSelectOptions(record) {
	var parkingRegion = vmGetParkingRegionByName(record && record.parking);
	var matched = {};
	var list = [];
	var i;
	var staff;
	var candidates = parkingRegion ? vmGetOpsManagerCandidates(record) : [];
	for (i = 0; i < candidates.length; i++) {
		matched[candidates[i].name] = true;
	}
	for (i = 0; i < VM_OPS_STAFF.length; i++) {
		staff = VM_OPS_STAFF[i];
		if (VM_OPS_MANAGER_ROLES.indexOf(staff.role) < 0) continue;
		list.push({
			label: staff.name,
			value: staff.name
		});
	}
	list.sort(function (a, b) {
		var am = matched[a.value] ? 0 : 1;
		var bm = matched[b.value] ? 0 : 1;
		if (am !== bm) return am - bm;
		return String(a.value).localeCompare(String(b.value), 'zh-CN');
	});
	return list;
}

function vmGetAllOpsManagerStaffSelectOptions() {
	var list = [];
	var i, staff;
	for (i = 0; i < VM_OPS_STAFF.length; i++) {
		staff = VM_OPS_STAFF[i];
		if (VM_OPS_MANAGER_ROLES.indexOf(staff.role) < 0) continue;
		list.push({
			label: staff.name,
			value: staff.name
		});
	}
	list.sort(function (a, b) {
		return String(a.value).localeCompare(String(b.value), 'zh-CN');
	});
	return list;
}

function vmFormatOpsManagersText(record) {
	var names = vmResolveVehicleOpsManagers(record);
	if (!names.length) return '未分配';
	return names.join(',');
}

var VM_INFO_TIP_ICON_PATHS = [
	{ tag: 'circle', cx: 12, cy: 12, r: 10 },
	{ tag: 'line', x1: 12, y1: 16, x2: 12, y2: 12 },
	{ tag: 'line', x1: 12, y1: 8, x2: 12.01, y2: 8 }
];

var VM_KPI_CARD_DEFS = [
	{ key: 'all', type: 'total', title: '所有营运车辆', desc: '营运体系内全部车辆，不含非运营车辆与退出运营车辆' },
	{ key: 'operating', type: 'normal', title: '运营中', desc: '运营状态为租赁、自营的车辆（已交车在客户处）' },
	{ key: 'stock', type: 'warning', title: '库存', desc: '运营状态为可运营、待运营的车辆（在库车辆）' },
	{ key: 'nonOperating', type: 'nonOperating', title: '非运营车辆', desc: '导入车辆类型为「非运营车辆」的台账车辆' },
	{ key: 'exit', type: 'unuploaded', title: '退出运营', desc: '运营状态为退出运营的车辆（已退出运营体系）' },
	{ key: 'licenseAbnormal', type: 'license', title: '证照异常', desc: '行驶证检验有效期已过期的车辆（不含等评时间）' },
	{ key: 'insuranceAbnormal', type: 'insurance', title: '保险异常', desc: '保险状态为异常的车辆（交强险或商业险缺失、已过期或停保/退保）' }
];

var VM_STATUS_COLUMN_TIPS = {
	operateStatus: '租赁/自营：已交车在客户处；可运营：在库可备车交车；待运营：在库但证照或保险异常禁交车；退出运营：已退出运营体系',
	vehicleStatus: '表示车辆是否被业务占位：未备车/已备车/待交车/已交车/待还车等；维修、调拨、异动等占用中不可交车',
	licenseStatus: '正常：行驶证检验有效期在有效期内；异常：检验有效期已过期；无：已出库',
	insuranceStatus: '正常：交强险、商业险均在有效期内；异常：缺失、过期或停保/退保；无：已退出运营',
	outStatus: '无：未出库；三方退租出库/销售出库/报废出库：车辆已离场'
};

var VM_MILEAGE_COLUMN_TIP = '显示最后一次交车记录/还车记录/车机里程数；已对接车机时必定展示车机里程（无数据时显示 0 km）';

/** 批量导入模板列；表头带 * 为必填（模板中红色显示，仅运营车辆校验） */
var VM_IMPORT_TEMPLATE_TIP = '非运营车辆不做必填项校验';

var VM_IMPORT_TEMPLATE_COLUMNS = [
	{ header: '车辆类型', key: 'vehicleLedgerType', required: false, sample: '运营车辆' },
	{ header: '车牌号', key: 'plateNo', required: false, sample: '粤A99999F' },
	{ header: '车辆识别代码', key: 'vin', required: true, sample: 'LNXNEGRR0SR399999' },
	{ header: '品牌', key: 'brand', required: true, sample: '现代' },
	{ header: '型号', key: 'model', required: true, sample: '帕力安牌4.5吨冷链车' },
	{ header: '停放区域', key: 'parking', required: true, sample: '平湖停车场' },
	{ header: '行驶公里数', key: 'mileage', required: false, sample: '12580.50' },
	{ header: '登记所有权', key: 'ownership', required: true, sample: '羚牛氢能科技(广东)有限公司' },
	{ header: '运营公司', key: 'operateCompany', required: true, sample: '羚牛氢能科技(广东)有限公司' },
	{ header: '车辆来源', key: 'vehicleSource', required: true, sample: '自有' },
	{ header: '租赁公司', key: 'leaseCompany', required: false, sample: '' },
	{ header: '车辆编号', key: 'vehicleNo', required: false, sample: 'DEMO001' },
	{ header: '车辆颜色', key: 'color', required: false, sample: '白色' },
	{ header: '出厂年份', key: 'year', required: false, sample: '2025' },
	{ header: '采购入库时间', key: 'purchaseDate', required: false, sample: '2025-12-24' }
];

var VM_VEHICLE_LEDGER_TYPE_ENUM = ['运营车辆', '非运营车辆'];

var VM_VEHICLE_SOURCE_ENUM = ['挂靠', '外租', '自有'];

var VM_IMPORT_HEADER_ALIASES = {
	'车辆识别代号': 'vin',
	VIN: 'vin',
	'车身颜色': 'color',
	'归属停车场': 'parking',
	'停车场': 'parking'
};

function vmBuildModelParamBrandMap() {
	var map = {};
	var i;
	var row;
	var brand;
	var model;
	for (i = 0; i < VM_SAMPLE_VEHICLE_DATA.length; i++) {
		row = VM_SAMPLE_VEHICLE_DATA[i];
		brand = row.brand && row.brand !== '-' ? String(row.brand).trim() : '';
		model = row.model && row.model !== '-' ? String(row.model).trim() : '';
		if (!brand) continue;
		if (!map[brand]) map[brand] = {};
		if (model) map[brand][model] = true;
	}
	return map;
}

var VM_MODEL_PARAM_BRAND_MAP = vmBuildModelParamBrandMap();

function vmBuildParkingNameSet() {
	var set = {};
	var keys = Object.keys(VM_PARKING_REGION_BY_NAME);
	var i;
	for (i = 0; i < keys.length; i++) set[keys[i]] = true;
	for (i = 0; i < VM_SAMPLE_VEHICLE_DATA.length; i++) {
		if (VM_SAMPLE_VEHICLE_DATA[i].parking && VM_SAMPLE_VEHICLE_DATA[i].parking !== '-') {
			set[String(VM_SAMPLE_VEHICLE_DATA[i].parking).trim()] = true;
		}
	}
	return set;
}

var VM_PARKING_NAME_SET = vmBuildParkingNameSet();

function vmImportDisplayHeader(col) {
	return (col.required ? '*' : '') + col.header;
}

function vmEscapeCsvCell(val) {
	var s = val == null ? '' : String(val);
	return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function vmParseCsvLine(line) {
	var result = [];
	var cur = '';
	var inQuote = false;
	var i;
	var c;
	for (i = 0; i < line.length; i++) {
		c = line[i];
		if (c === '"') {
			inQuote = !inQuote;
			continue;
		}
		if (c === ',' && !inQuote) {
			result.push(cur.trim());
			cur = '';
			continue;
		}
		cur += c;
	}
	result.push(cur.trim());
	return result;
}

function vmNormalizeImportHeaderKey(header) {
	var h = String(header || '').trim().replace(/^\uFEFF/, '').replace(/^\*/, '');
	var col = null;
	var i;
	for (i = 0; i < VM_IMPORT_TEMPLATE_COLUMNS.length; i++) {
		if (VM_IMPORT_TEMPLATE_COLUMNS[i].header === h) {
			col = VM_IMPORT_TEMPLATE_COLUMNS[i];
			break;
		}
	}
	if (col) return col.key;
	return VM_IMPORT_HEADER_ALIASES[h] || null;
}

function vmValidateVinCode(vin, required) {
	var s = String(vin || '').trim().toUpperCase();
	if (!s) {
		if (required) return { ok: false, reason: '车辆识别代码不能为空' };
		return { ok: true, value: '' };
	}
	if (s.length !== 17) return { ok: false, reason: '车辆识别代码须为17位' };
	if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(s)) return { ok: false, reason: '车辆识别代码格式不正确' };
	return { ok: true, value: s };
}

function vmIsOperatingImportRow(vehicleLedgerType) {
	return String(vehicleLedgerType || '').trim() === '运营车辆';
}

function vmIsImportTipLine(firstCell) {
	var text = String(firstCell || '').trim();
	return text.indexOf(VM_IMPORT_TEMPLATE_TIP) >= 0
		|| text.indexOf('车辆来源枚举') === 0
		|| text.indexOf('车辆类型枚举') >= 0
		|| text.indexOf('带*为必填') >= 0;
}

function vmValidateImportMileage(value) {
	var s = String(value || '').trim();
	if (!s) return { ok: true, value: '' };
	if (!/^\d+(\.\d{1,2})?$/.test(s)) return { ok: false, reason: '行驶公里数须为整数或最多两位小数' };
	return { ok: true, value: s };
}

function vmValidateImportYear(value) {
	var s = String(value || '').trim();
	if (!s) return { ok: true, value: '' };
	if (!/^\d{4}$/.test(s)) return { ok: false, reason: '出厂年份格式须为YYYY' };
	var yearNum = Number(s);
	var currentYear = new Date().getFullYear();
	if (yearNum > currentYear) return { ok: false, reason: '出厂年份不能晚于当前年份' };
	return { ok: true, value: s };
}

function vmValidateImportPurchaseDate(value) {
	var s = String(value || '').trim();
	if (!s) return { ok: true, value: '' };
	if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return { ok: false, reason: '采购入库时间格式须为YYYY-MM-DD' };
	var parts = s.split('-');
	var dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
	if (isNaN(dt.getTime()) || dt.getFullYear() !== Number(parts[0]) || dt.getMonth() !== Number(parts[1]) - 1 || dt.getDate() !== Number(parts[2])) {
		return { ok: false, reason: '采购入库时间日期无效' };
	}
	var today = new Date();
	today.setHours(0, 0, 0, 0);
	if (dt.getTime() > today.getTime()) return { ok: false, reason: '采购入库时间不能晚于当前日期' };
	return { ok: true, value: s };
}

function vmValidateImportRow(row, rowIndex, context) {
	var rowNo = rowIndex + 1;
	var fail = function (reason) {
		return { ok: false, reason: reason, rowNo: rowNo, row: row };
	};
	var vehicleLedgerType = String(row.vehicleLedgerType || '').trim();
	if (!vehicleLedgerType) return fail('车辆类型不能为空');
	if (VM_VEHICLE_LEDGER_TYPE_ENUM.indexOf(vehicleLedgerType) < 0) return fail('车辆类型须为运营车辆或非运营车辆');
	var requireFields = vmIsOperatingImportRow(vehicleLedgerType);
	var vinResult = vmValidateVinCode(row.vin, requireFields);
	if (!vinResult.ok) return fail(vinResult.reason);
	var brand = String(row.brand || '').trim();
	var model = String(row.model || '').trim();
	var parking = String(row.parking || '').trim();
	var ownership = String(row.ownership || '').trim();
	var operateCompany = String(row.operateCompany || '').trim();
	var vehicleSource = String(row.vehicleSource || '').trim();
	var plateNo = String(row.plateNo || '').trim();
	if (requireFields && !brand) return fail('品牌不能为空');
	if (requireFields && !model) return fail('型号不能为空');
	if (requireFields && !parking) return fail('停放区域不能为空');
	if (requireFields && !ownership) return fail('登记所有权不能为空');
	if (requireFields && !operateCompany) return fail('运营公司不能为空');
	if (requireFields && !vehicleSource) return fail('车辆来源不能为空');
	if (vehicleSource && VM_VEHICLE_SOURCE_ENUM.indexOf(vehicleSource) < 0) return fail('车辆来源须为挂靠、外租或自有');
	if (brand && !VM_MODEL_PARAM_BRAND_MAP[brand]) return fail('品牌不在型号参数表中');
	if (brand && model && !VM_MODEL_PARAM_BRAND_MAP[brand][model]) return fail('型号与品牌不匹配或不在型号参数表中');
	if (parking && !VM_PARKING_NAME_SET[parking]) return fail('停放区域不在停车场名称台账中');
	var mileageResult = vmValidateImportMileage(row.mileage);
	if (!mileageResult.ok) return fail(mileageResult.reason);
	var yearResult = vmValidateImportYear(row.year);
	if (!yearResult.ok) return fail(yearResult.reason);
	var purchaseResult = vmValidateImportPurchaseDate(row.purchaseDate);
	if (!purchaseResult.ok) return fail(purchaseResult.reason);
	if (plateNo && context.plateSeen[plateNo]) return fail('车牌号在导入文件中重复');
	if (vinResult.value && context.vinSeen[vinResult.value]) return fail('车辆识别代码在导入文件中重复');
	if (plateNo && context.existingPlates[plateNo]) return fail('车牌号已存在于车辆台账');
	if (vinResult.value && context.existingVins[vinResult.value]) return fail('车辆识别代码已存在于车辆台账');
	if (plateNo) context.plateSeen[plateNo] = true;
	if (vinResult.value) context.vinSeen[vinResult.value] = true;
	return {
		ok: true,
		value: {
			vehicleLedgerType: vehicleLedgerType,
			plateNo: plateNo,
			vin: vinResult.value,
			brand: brand,
			model: model,
			parking: parking,
			mileage: mileageResult.value,
			ownership: ownership,
			operateCompany: operateCompany,
			vehicleSource: vehicleSource,
			leaseCompany: String(row.leaseCompany || '').trim(),
			vehicleNo: String(row.vehicleNo || '').trim(),
			color: String(row.color || '').trim(),
			year: yearResult.value,
			purchaseDate: purchaseResult.value
		}
	};
}

function vmParseVehicleImportText(text) {
	var lines = String(text || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
	if (!lines.length) return [];
	var headerLineIndex = 0;
	var i;
	for (i = 0; i < lines.length; i++) {
		var probeCells = vmParseCsvLine(lines[i]);
		if (vmIsImportTipLine(probeCells[0])) continue;
		var matched = 0;
		var j;
		for (j = 0; j < probeCells.length; j++) {
			if (vmNormalizeImportHeaderKey(probeCells[j])) matched++;
		}
		if (matched >= 3) {
			headerLineIndex = i;
			break;
		}
	}
	var headerCells = vmParseCsvLine(lines[headerLineIndex]);
	var colIndex = {};
	var key;
	for (i = 0; i < headerCells.length; i++) {
		key = vmNormalizeImportHeaderKey(headerCells[i]);
		if (key) colIndex[key] = i;
	}
	var hasHeader = Object.keys(colIndex).length >= 3;
	var dataLines = hasHeader ? lines.slice(headerLineIndex + 1) : lines.slice(headerLineIndex);
	var fallbackIndexByKey = {};
	for (i = 0; i < VM_IMPORT_TEMPLATE_COLUMNS.length; i++) {
		fallbackIndexByKey[VM_IMPORT_TEMPLATE_COLUMNS[i].key] = i;
	}
	var pick = function (cells, fieldKey) {
		if (hasHeader && colIndex[fieldKey] != null) return (cells[colIndex[fieldKey]] || '').trim();
		var idx = fallbackIndexByKey[fieldKey];
		return idx != null ? (cells[idx] || '').trim() : '';
	};
	var rows = [];
	for (i = 0; i < dataLines.length; i++) {
		var cells = vmParseCsvLine(dataLines[i]);
		if (!cells.some(function (c) { return c; })) continue;
		var firstCell = (cells[0] || '').trim();
		if (vmIsImportTipLine(firstCell)) continue;
		var row = {};
		for (var j = 0; j < VM_IMPORT_TEMPLATE_COLUMNS.length; j++) {
			row[VM_IMPORT_TEMPLATE_COLUMNS[j].key] = pick(cells, VM_IMPORT_TEMPLATE_COLUMNS[j].key);
		}
		rows.push(row);
	}
	return rows;
}

function vmValidateVehicleImportRows(rows, existingList) {
	var context = {
		plateSeen: {},
		vinSeen: {},
		existingPlates: {},
		existingVins: {}
	};
	var i;
	var item;
	for (i = 0; i < (existingList || []).length; i++) {
		item = existingList[i];
		if (item.plateNo && item.plateNo !== '-') context.existingPlates[String(item.plateNo).trim()] = true;
		if (item.vin && item.vin !== '-') context.existingVins[String(item.vin).trim().toUpperCase()] = true;
	}
	var failedList = [];
	var accepted = [];
	for (i = 0; i < (rows || []).length; i++) {
		var result = vmValidateImportRow(rows[i], i, context);
		if (!result.ok) {
			failedList.push({
				rowNo: result.rowNo,
				plateNo: rows[i].plateNo || '-',
				vin: rows[i].vin || '-',
				reason: result.reason
			});
			continue;
		}
		accepted.push(result.value);
	}
	if (failedList.length) return { ok: false, failedList: failedList, accepted: accepted };
	return { ok: true, accepted: accepted, failedList: [] };
}

function vmMapImportRowToVehicleRecord(row, index) {
	return {
		id: 'imp-' + Date.now() + '-' + index,
		vehicleLedgerType: row.vehicleLedgerType || '运营车辆',
		plateNo: row.plateNo || '-',
		vin: row.vin || '-',
		vehicleNo: row.vehicleNo || '-',
		color: row.color || '-',
		year: row.year || '-',
		purchaseDate: row.purchaseDate || '-',
		parking: row.parking || '-',
		ownership: row.ownership || '-',
		scrapDate: '-',
		ratingTime: '-',
		operateCompany: row.operateCompany || '-',
		vehicleSource: row.vehicleSource || '-',
		leaseCompany: row.leaseCompany || '-',
		vehicleType: '-',
		brand: row.brand || '-',
		model: row.model || '-',
		customer: '-',
		department: '-',
		manager: '-',
		contractNo: '-',
		operateStatus: '待运营',
		vehicleStatus: '未备车',
		licenseStatus: '正常',
		insuranceStatus: '正常',
		mileage: row.mileage || '-',
		location: '-',
		gpsTime: '-',
		regDate: '-',
		inspectExpire: '-',
		lastDeliveryTime: '-',
		lastDeliveryMile: '-',
		lastReturnTime: '-',
		lastReturnMile: '-',
		outStatus: '无',
		onlineStatus: '离线',
		projectName: '-'
	};
}

function vmDownloadVehicleImportTemplate() {
	var cols = VM_IMPORT_TEMPLATE_COLUMNS;
	var headerCells = cols.map(function (col) {
		var label = vmImportDisplayHeader(col);
		var style = col.required ? 'color:#dc2626;font-weight:bold;' : 'font-weight:bold;';
		return '<td style="' + style + '">' + label + '</td>';
	}).join('');
	var sampleCells = cols.map(function (col) {
		return '<td>' + (col.sample || '') + '</td>';
	}).join('');
	var tipRow = '<tr><td colspan="' + cols.length + '" style="font-size:12px;color:#dc2626;font-weight:bold;">' + VM_IMPORT_TEMPLATE_TIP + '</td></tr>';
	var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table border="1">' + tipRow + '<tr>' + headerCells + '</tr><tr>' + sampleCells + '</tr></table></body></html>';
	var blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
	var url = URL.createObjectURL(blob);
	var a = document.createElement('a');
	a.href = url;
	a.download = '车辆导入模板.xls';
	a.click();
	URL.revokeObjectURL(url);
}

function vmMatchKpiCategory(record, kpiKey) {
	if (!record) return false;
	var status = record.operateStatus;
	if (kpiKey === 'all') return vmIsOperatingFleetVehicle(record);
	if (kpiKey === 'operating') return status === '租赁' || status === '自营';
	if (kpiKey === 'stock') return status === '可运营' || status === '待运营';
	if (kpiKey === 'nonOperating') return vmIsNonOperatingVehicle(record);
	if (kpiKey === 'exit') return status === '退出运营';
	if (kpiKey === 'licenseAbnormal') return vmIsLicenseExpiredByInspectExpire(record);
	if (kpiKey === 'insuranceAbnormal') return record.insuranceStatus === '异常';
	return true;
}

function vmCountKpiCategory(list, kpiKey) {
	var count = 0;
	var i;
	for (i = 0; i < list.length; i++) {
		if (vmMatchKpiCategory(list[i], kpiKey)) count++;
	}
	return count;
}

function vmIsLicenseExpiredByInspectExpire(record) {
	if (!record || vmIsEmptyDisplayValue(record.inspectExpire)) return false;
	var days = vmDaysUntilExpire(record.inspectExpire);
	if (days == null) return false;
	return days < 0;
}

function vmIsInsuranceExpiredByDate(dateStr) {
	var days = vmDaysUntilExpire(dateStr);
	if (days == null) return true;
	return days < 0;
}

function vmGetInsuranceAbnormalTooltip(record) {
	if (!record) return '';
	var compulsoryExpired = vmIsInsuranceExpiredByDate(vmResolveVehicleInsuranceEndDate(record, 'compulsory'));
	var commercialExpired = vmIsInsuranceExpiredByDate(vmResolveVehicleInsuranceEndDate(record, 'commercial'));
	var parts = [];
	if (compulsoryExpired) parts.push('交强险已到期');
	if (commercialExpired) parts.push('商业险已到期');
	return parts.length ? parts.join('/') : '';
}

function vmGetLicenseAbnormalTooltip(record) {
	if (!record) return '';
	if (vmIsEmptyDisplayValue(record.inspectExpire)) return '';
	var days = vmDaysUntilExpire(record.inspectExpire);
	if (days == null) return '';
	if (days < 0) return '行驶证检验有效期已过期';
	return '';
}

function vmIsEmptyDisplayValue(val) {
	if (val === null || val === undefined) return true;
	var s = String(val).trim();
	return !s || s === '-';
}

var VM_EMPTY_DISPLAY_LABEL = '无';

function vmDisplayUILabel(val) {
	if (vmIsEmptyDisplayValue(val)) return VM_EMPTY_DISPLAY_LABEL;
	return String(val).trim();
}

/** 列表页空值展示为空白（详情/表单仍用 vmDisplayUILabel 显示「无」） */
function vmDisplayListLabel(val) {
	if (vmIsEmptyDisplayValue(val)) return '';
	return String(val).trim();
}

function vmFormatBrandModel(brand, model) {
	var b = vmIsEmptyDisplayValue(brand) ? '' : String(brand).trim();
	var m = vmIsEmptyDisplayValue(model) ? '' : String(model).trim();
	if (b && m) return b + '-' + m;
	return b || m || '';
}

function vmRenderVehicleIdentityCell(record, onViewDetail) {
	var plateRaw = record && record.plateNo;
	var vinRaw = record && record.vin;
	var plateDisplay = vmDisplayListLabel(plateRaw);
	var vinDisplay = vmDisplayListLabel(vinRaw);
	var brandModel = vmFormatBrandModel(record && record.brand, record && record.model);
	var plateEl = !vmIsEmptyDisplayValue(plateRaw) && onViewDetail
		? React.createElement('button', {
			type: 'button',
			className: 'vm-plate-link vm-vehicle-identity-plate',
			onClick: function (e) { e.stopPropagation(); onViewDetail(record); },
			title: '查看车辆详情'
		}, plateDisplay)
		: React.createElement('div', { className: 'vm-vehicle-identity-plate' }, plateDisplay);
	var vinEl = !vmIsEmptyDisplayValue(vinRaw) && onViewDetail
		? React.createElement('button', {
			type: 'button',
			className: 'vm-plate-link vm-vehicle-identity-vin',
			onClick: function (e) { e.stopPropagation(); onViewDetail(record); },
			title: '查看车辆详情'
		}, vinDisplay)
		: React.createElement('div', { className: 'vm-vehicle-identity-vin', title: vinDisplay || undefined }, vinDisplay);
	return React.createElement('div', { className: 'vm-vehicle-identity-cell' },
		plateEl,
		vinEl,
		brandModel ? React.createElement('div', { className: 'vm-vehicle-identity-brand' }, brandModel) : null
	);
}

function vmRenderOnlineStatusCell(text) {
	if (vmIsEmptyDisplayValue(text)) return null;
	var on = text === '在线';
	return React.createElement('span', { className: 'vm-online-status vm-online-status--' + (on ? 'on' : 'off') },
		React.createElement('span', { className: 'vm-online-dot', 'aria-hidden': true }),
		React.createElement('span', { className: 'vm-online-label' }, text)
	);
}

function vmRenderGpsLocationCell(record) {
	var addressText = vmResolveLocationFullAddress(record) || vmDisplayFieldText(record && record.location);
	var addressDisplay = vmDisplayListLabel(addressText);
	var gpsDisplay = vmDisplayListLabel(record && record.gpsTime);
	var onlineStatus = record && record.onlineStatus;
	var hasOnline = !vmIsEmptyDisplayValue(onlineStatus);
	if (!hasOnline && !addressDisplay && !gpsDisplay) {
		return '';
	}
	return React.createElement('div', { className: 'vm-gps-location-cell' },
		hasOnline ? React.createElement('div', { className: 'vm-gps-location-row vm-gps-location-row--status' },
			vmRenderOnlineStatusCell(onlineStatus)
		) : null,
		React.createElement('div', { className: 'vm-gps-location-row vm-gps-location-row--address' },
			React.createElement('span', {
				className: 'vm-gps-location-text',
				title: addressDisplay || undefined
			}, addressDisplay)
		),
		React.createElement('div', { className: 'vm-gps-location-row vm-gps-location-row--time' },
			React.createElement('span', {
				className: 'vm-gps-location-time',
				title: gpsDisplay || undefined
			}, gpsDisplay)
		)
	);
}

function vmDisplayFieldText(val) {
	if (vmIsEmptyDisplayValue(val)) return '';
	return String(val).trim();
}

function vmRenderOneLineText(text) {
	var display = vmDisplayListLabel(text);
	return React.createElement('span', {
		className: 'vm-oneline-text',
		title: display || undefined
	}, display);
}

function vmHasVehicleTerminal(record) {
	if (!record) return false;
	if (record.hasVehicleTerminal === true) return true;
	if (record.hasVehicleTerminal === false) return false;
	return !vmIsEmptyDisplayValue(record.gpsTime);
}

function vmParseRecordDateTime(dateStr) {
	if (vmIsEmptyDisplayValue(dateStr)) return null;
	var t = Date.parse(String(dateStr).trim().replace(' ', 'T'));
	return isNaN(t) ? null : t;
}

function vmResolveHandoverMileage(record) {
	if (!record) return { value: '', sourceKey: '' };
	var deliveryTime = vmParseRecordDateTime(record.lastDeliveryTime);
	var returnTime = vmParseRecordDateTime(record.lastReturnTime);
	var deliveryMile = vmDisplayFieldText(record.lastDeliveryMile);
	var returnMile = vmDisplayFieldText(record.lastReturnMile);
	if (deliveryTime != null && returnTime != null) {
		if (returnTime > deliveryTime) return { value: returnMile, sourceKey: 'lastReturn' };
		if (deliveryTime > returnTime) return { value: deliveryMile, sourceKey: 'lastDelivery' };
		if (returnMile) return { value: returnMile, sourceKey: 'lastReturn' };
		if (deliveryMile) return { value: deliveryMile, sourceKey: 'lastDelivery' };
		return { value: '', sourceKey: '' };
	}
	if (deliveryTime != null) return { value: deliveryMile, sourceKey: 'lastDelivery' };
	if (returnTime != null) return { value: returnMile, sourceKey: 'lastReturn' };
	return { value: '', sourceKey: '' };
}

function vmGetTelematicsMileageValue(record) {
	return vmDisplayFieldText(record && record.mileage);
}

function vmFormatMileageDisplay(mile, options) {
	var forceShow = options && options.forceShow;
	var val = vmDisplayFieldText(mile);
	if (!val) return forceShow ? '0 km' : '';
	return val + ' km';
}

function vmResolveVehicleMileage(record) {
	if (!record) return { value: '', sourceKey: '' };
	if (vmHasVehicleTerminal(record)) {
		return { value: vmGetTelematicsMileageValue(record), sourceKey: 'telematics' };
	}
	return vmResolveHandoverMileage(record);
}

function vmMileageSourceLabel(sourceKey) {
	if (sourceKey === 'telematics') return '车机';
	if (sourceKey === 'lastDelivery') return '最后一次交车';
	if (sourceKey === 'lastReturn') return '最后一次还车';
	return '';
}

function vmMileageSourceTagColor(sourceKey) {
	if (sourceKey === 'telematics') return 'processing';
	if (sourceKey === 'lastDelivery') return 'blue';
	if (sourceKey === 'lastReturn') return 'purple';
	return 'default';
}

function vmRenderMileageCell(record, forList) {
	var resolved = vmResolveVehicleMileage(record);
	if (!resolved.sourceKey) return forList ? '' : VM_EMPTY_DISPLAY_LABEL;
	var isTelematics = resolved.sourceKey === 'telematics';
	var display = resolved.value;
	if (!display && !isTelematics) return forList ? '' : VM_EMPTY_DISPLAY_LABEL;
	var label = vmMileageSourceLabel(resolved.sourceKey);
	var mileText = vmFormatMileageDisplay(display, { forceShow: isTelematics });
	var Tag = window.antd && window.antd.Tag;
	var title = label ? (mileText + '（' + label + '）') : mileText;
	return React.createElement('div', { className: 'vm-mileage-cell', title: title },
		(isTelematics || mileText) ? React.createElement('div', { className: 'vm-mileage-value', title: mileText }, mileText) : null,
		label && Tag ? React.createElement(Tag, {
			className: 'vm-mileage-source-tag',
			color: vmMileageSourceTagColor(resolved.sourceKey)
		}, label) : null
	);
}

function vmSplitDateTimeParts(dateStr) {
	if (vmIsEmptyDisplayValue(dateStr)) return { date: '', time: '' };
	var s = String(dateStr).trim();
	var parts = s.split(/\s+/);
	if (parts.length >= 2) {
		var clock = parts[1];
		if (clock.length >= 5) clock = clock.slice(0, 5);
		return { date: parts[0], time: clock };
	}
	if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { date: s, time: '' };
	return { date: s, time: '' };
}

function vmFormatHandoverMileageText(mile) {
	return vmFormatMileageDisplay(mile, { forceShow: false });
}

function vmFormatHandoverDateTimeOneLine(dateStr) {
	if (vmIsEmptyDisplayValue(dateStr)) return '';
	var parts = vmSplitDateTimeParts(dateStr);
	if (!parts.date && !parts.time) return '';
	if (parts.date && parts.time) return parts.date + ' ' + parts.time;
	return parts.date || parts.time;
}

function vmResolveHandoverRecordRegion(record, regionKey, timeKey) {
	if (vmIsEmptyDisplayValue(record && record[timeKey])) return '';
	var direct = record && record[regionKey];
	if (!vmIsEmptyDisplayValue(direct)) return String(direct).trim();
	return '';
}

function vmRenderHandoverSituationCell(mile, time, region) {
	var mileText = vmFormatHandoverMileageText(mile);
	var regionText = vmIsEmptyDisplayValue(region) ? '' : String(region).trim();
	var dateTimeText = vmFormatHandoverDateTimeOneLine(time);
	if (!mileText && !regionText && !dateTimeText) return '';
	var fullTime = vmDisplayFieldText(time);
	var titleParts = [mileText, regionText, dateTimeText || fullTime].filter(Boolean);
	return React.createElement('div', { className: 'vm-handover-situation-cell', title: titleParts.join(' / ') || undefined },
		mileText ? React.createElement('div', { className: 'vm-handover-situation-mile', title: mileText }, mileText) : null,
		regionText ? React.createElement('div', { className: 'vm-handover-situation-region', title: regionText }, regionText) : null,
		dateTimeText ? React.createElement('div', { className: 'vm-handover-situation-datetime', title: dateTimeText }, dateTimeText) : null
	);
}

function vmRenderLastDeliverySituationCell(record) {
	if (!record) return null;
	return vmRenderHandoverSituationCell(
		record.lastDeliveryMile,
		record.lastDeliveryTime,
		vmResolveHandoverRecordRegion(record, 'lastDeliveryRegion', 'lastDeliveryTime')
	);
}

function vmRenderLastReturnSituationCell(record) {
	if (!record) return null;
	return vmRenderHandoverSituationCell(
		record.lastReturnMile,
		record.lastReturnTime,
		vmResolveHandoverRecordRegion(record, 'lastReturnRegion', 'lastReturnTime')
	);
}

function vmRenderDetailDateValue(dateRaw) {
	var text = vmFormatDateYmd(dateRaw) || vmDisplayFieldText(dateRaw);
	return text ? text : VM_EMPTY_DISPLAY_LABEL;
}

function vmRenderDetailExpireValue(dateRaw) {
	var node = vmRenderExpireDateCell(dateRaw);
	if (node && typeof node === 'object' && node.$$typeof) return node;
	return VM_EMPTY_DISPLAY_LABEL;
}

function vmRenderDetailQuickStat(label, value) {
	if (value && typeof value === 'object' && value.$$typeof) {
		return React.createElement('div', { className: 'vm-detail-stat-card' },
			React.createElement('div', { className: 'vm-detail-stat-label' }, label),
			React.createElement('div', { className: 'vm-detail-stat-value vm-detail-stat-value--rich' }, value)
		);
	}
	var text = vmDisplayUILabel(value);
	return React.createElement('div', { className: 'vm-detail-stat-card' },
		React.createElement('div', { className: 'vm-detail-stat-label' }, label),
		React.createElement('div', { className: 'vm-detail-stat-value', title: text === VM_EMPTY_DISPLAY_LABEL ? undefined : text }, text)
	);
}

function vmRenderSalespersonCell(record) {
	var department = vmDisplayListLabel(record && record.department);
	var salesperson = vmDisplayListLabel(record && record.manager);
	return React.createElement('div', { className: 'vm-stacked-cell' },
		React.createElement('div', {
			className: 'vm-stacked-cell-line vm-stacked-cell-line--primary',
			title: department || undefined
		}, department),
		React.createElement('div', {
			className: 'vm-stacked-cell-line vm-stacked-cell-line--sub',
			title: salesperson || undefined
		}, salesperson)
	);
}

function vmNormalizeContractNo(contractNo) {
	if (vmIsEmptyDisplayValue(contractNo)) return '';
	return String(contractNo).replace(/\s+/g, '').trim();
}

function vmDeriveProjectNameFromContract(record) {
	var customer = vmDisplayFieldText(record && record.customer);
	var operateStatus = record && record.operateStatus;
	if (!customer) return '';
	var shortName = customer
		.replace(/（个体工商户）/g, '')
		.replace(/\(个体工商户\)/g, '')
		.replace(/股份有限公司/g, '')
		.replace(/有限责任公司/g, '')
		.replace(/有限公司/g, '')
		.trim();
	if (!shortName) shortName = customer;
	if (/租赁|运输|物流|港口|快递|供应链|氢能|公务车/.test(shortName)) {
		return operateStatus === '自营' ? shortName + '（自营）' : shortName;
	}
	return shortName + (operateStatus === '自营' ? '自营项目' : '租赁项目');
}

function vmResolveVehicleProjectName(record) {
	var direct = vmDisplayFieldText(record && record.projectName);
	if (direct) return direct;
	var contractKey = vmNormalizeContractNo(record && record.contractNo);
	if (!contractKey) return '';
	if (VM_CONTRACT_PROJECT_BY_NO[contractKey]) return VM_CONTRACT_PROJECT_BY_NO[contractKey];
	return vmDeriveProjectNameFromContract(record);
}

function vmRenderProjectCell(record) {
	var customer = vmDisplayListLabel(record && record.customer);
	var contractCode = vmDisplayListLabel(record && record.contractNo);
	var projectName = vmDisplayListLabel(vmResolveVehicleProjectName(record));
	return React.createElement('div', { className: 'vm-stacked-cell' },
		React.createElement('div', {
			className: 'vm-stacked-cell-line vm-stacked-cell-line--primary',
			title: customer || undefined
		}, customer),
		React.createElement('div', {
			className: 'vm-stacked-cell-line vm-stacked-cell-line--code',
			title: contractCode || undefined
		}, contractCode),
		React.createElement('div', {
			className: 'vm-stacked-cell-line vm-stacked-cell-line--sub',
			title: projectName || undefined
		}, projectName)
	);
}

const Component = function () {
	var useState = React.useState;
	var useCallback = React.useCallback;
	var antd = window.antd;

	var Cascader = antd.Cascader;
	var Select = antd.Select;
	var Input = antd.Input;
	var Button = antd.Button;
	var Table = antd.Table;
	var Space = antd.Space;
	var Dropdown = antd.Dropdown;
	var Modal = antd.Modal;
	var Upload = antd.Upload;
	var Card = antd.Card;
	var Tabs = antd.Tabs;
	var Tag = antd.Tag;
	var Tooltip = antd.Tooltip;
	var Popover = antd.Popover;
	var Form = antd.Form;
	var Row = antd.Row;
	var Col = antd.Col;
	var message = antd.message;
	var App = antd.App;

	// 联调后对接权限中心；原型默认 admin 可编辑车辆，permissions 含 vehicle:opsManager:edit 可编辑运维负责人
	var CURRENT_USER = { id: 'u_admin', name: '系统管理员', role: 'admin', permissions: [VM_OPS_MANAGER_EDIT_PERMISSION] };
	var isAdmin = CURRENT_USER.role === 'admin';
	var canEditOpsManager = (CURRENT_USER.permissions || []).indexOf(VM_OPS_MANAGER_EDIT_PERMISSION) >= 0;

	// 筛选项状态
	var _plateNosPending = useState('');
	var _plateNosApplied = useState('');
	var _multiPlateOpen = useState(false);
	var _multiPlateDraft = useState('');
	var _operateCityFilter = useState([]);
	var _brand = useState(undefined);
	var _model = useState(undefined);
	var _customer = useState(undefined);
	var _department = useState(undefined);
	var _projectNameFilter = useState(undefined);
	var _contractNo = useState(undefined);
	var _ownership = useState(undefined);
	var _operateCompany = useState(undefined);
	var _operateStatusFilter = useState(undefined);
	var _vehicleSource = useState(undefined);
	var _leaseCompany = useState(undefined);
	var _commercialInsurance = useState(undefined);
	var _compulsoryInsurance = useState(undefined);
	var _parkingFilter = useState(undefined);
	var _areaRegion = useState([]);

	var _uploadModalVisible = useState(false);
	var _confirmModalVisible = useState(false);
	var _ocrLoadingVisible = useState(false);
	var _currentRow = useState(null);
	var _plateForm = useState({ vin: '', plateNo: '' });
	var _plateError = useState('');
	var _detailRecord = useState(null);
	var _detailTab = useState('基本信息');
	var _filterExpanded = useState(false);
	var _requirementModalVisible = useState(false);
	var _editModalVisible = useState(false);
	var _editRecord = useState(null);
	var _editForm = useState({});
	var _kpiTab = useState('all');
	var _opsManagerModalMode = useState(null);
	var _opsManagerModalRecord = useState(null);
	var _opsManagerBatchIds = useState([]);
	var _opsManagerDraftSelected = useState([]);
	var _batchImportModalVisible = useState(false);
	var _batchImportResult = useState(null);

	// 省-市 地区数据（定位城市筛选用）
	var regionOptions = [
		{ value: 'guangdong', label: '广东省', children: [{ value: 'guangzhou', label: '广州市' }, { value: 'shenzhen', label: '深圳市' }] },
		{ value: 'beijing', label: '北京市', children: [{ value: 'beijing', label: '北京市' }] },
		{ value: 'shanghai', label: '上海市', children: [{ value: 'shanghai', label: '上海市' }] }
	];

	// 品牌、型号、客户、部门、合同、登记所有权（模拟下拉数据）
	var brandOptions = [{ label: '比亚迪', value: 'byd' }, { label: '特斯拉', value: 'tsl' }, { label: '蔚来', value: 'nio' }];
	var modelOptions = [{ label: '汉EV', value: 'han' }, { label: 'Model 3', value: 'm3' }, { label: 'ET5', value: 'et5' }];
	var customerOptions = [{ label: '无', value: 'none' }, { label: '客户A', value: 'c1' }, { label: '客户B', value: 'c2' }];
	var departmentOptions = [{ label: '无', value: 'none' }, { label: '华南区', value: 'd1' }, { label: '华东区', value: 'd2' }];
	var contractOptions = [{ label: 'HT-2024-001', value: 'HT-2024-001' }, { label: 'HT-2024-002', value: 'HT-2024-002' }];
	var ownershipOptions = [{ label: '某某租赁公司', value: 'o1' }, { label: '某某科技有限公司', value: 'o2' }];
	var operateCompanyOptions = [
		{ label: '羚牛运营（嘉兴）', value: '羚牛运营（嘉兴）' },
		{ label: '羚牛运营（上海）', value: '羚牛运营（上海）' },
		{ label: '羚牛运营（广东）', value: '羚牛运营（广东）' }
	];
	var vehicleSourceOptions = [
		{ label: '自有', value: '自有' },
		{ label: '外租', value: '外租' },
		{ label: '挂靠', value: '挂靠' }
	];
	var leaseCompanyOptions = [
		{ label: '某某租赁公司', value: '某某租赁公司' },
		{ label: '某某科技有限公司', value: '某某科技有限公司' },
		{ label: '第三方融资租赁有限公司', value: '第三方融资租赁有限公司' },
		{ label: '无', value: '-' }
	];
	var insuranceStatusOptions = [
		{ label: '正常', value: '正常' },
		{ label: '异常', value: '异常' }
	];
	var parkingOptions = [
		{ label: '天河停车场', value: '天河停车场' },
		{ label: '黄埔停车场', value: '黄埔停车场' },
		{ label: '朝阳停车场', value: '朝阳停车场' },
		{ label: '福田停车场', value: '福田停车场' },
		{ label: '浦东停车场', value: '浦东停车场' },
		{ label: '南山停车场', value: '南山停车场' },
		{ label: '番禺停车场', value: '番禺停车场' },
		{ label: '大兴停车场', value: '大兴停车场' },
		{ label: '龙岗停车场', value: '龙岗停车场' },
		{ label: '白云停车场', value: '白云停车场' },
		{ label: '西城停车场', value: '西城停车场' },
		{ label: '虹口停车场', value: '虹口停车场' },
		{ label: '昌平停车场', value: '昌平停车场' },
		{ label: '-', value: '-' }
	];
	var operateStatusOptions = [
		{ label: '租赁', value: '租赁' },
		{ label: '自营', value: '自营' },
		{ label: '可运营', value: '可运营' },
		{ label: '待运营', value: '待运营' },
		{ label: '退出运营', value: '退出运营' }
	];
	var vehicleStatusOptions = [
		{ label: '待验车', value: '待验车' },
		{ label: '未备车', value: '未备车' },
		{ label: '已备车', value: '已备车' },
		{ label: '待交车', value: '待交车' },
		{ label: '已交车', value: '已交车' },
		{ label: '待还车', value: '待还车' },
		{ label: '销售中', value: '销售中' },
		{ label: '替换中', value: '替换中' },
		{ label: '调拨中', value: '调拨中' },
		{ label: '异动中', value: '异动中' },
		{ label: '三方退租中', value: '三方退租中' },
		{ label: '无', value: '无' }
	];
	var yearOptions = (function () {
		var y = new Date().getFullYear();
		var opts = [];
		for (var i = y; i >= y - 12; i--) opts.push({ label: String(i), value: String(i) });
		return opts;
	})();

	// 表格数据（Excel 真实数据前 100 条，内联）
	var _tableData = useState(VM_PREPARED_VEHICLE_DATA);

	var dataSource = _tableData[0];
	var operateCityOptions = vmBuildOperateCityOptions(dataSource);
	var projectNameOptions = vmBuildProjectNameOptions(dataSource);
	var appliedMultiPlates = vmParseMultiPlates(_plateNosApplied[0]);
	var pendingMultiPlates = vmParseMultiPlates(_plateNosPending[0]);
	var displayDataSource = dataSource.filter(function (row) {
		if (appliedMultiPlates.length) {
			if (appliedMultiPlates.indexOf(vmNormalizePlateNo(row.plateNo)) < 0) return false;
		}
		if (!vmMatchOperateCityFilter(row, _operateCityFilter[0])) return false;
		if (_projectNameFilter[0] && vmResolveVehicleProjectName(row) !== _projectNameFilter[0]) return false;
		return vmMatchKpiCategory(row, _kpiTab[0]);
	});
	var listTotal = displayDataSource.length;
	var kpiCounts = {
		all: vmCountKpiCategory(dataSource, 'all'),
		operating: vmCountKpiCategory(dataSource, 'operating'),
		stock: vmCountKpiCategory(dataSource, 'stock'),
		nonOperating: vmCountKpiCategory(dataSource, 'nonOperating'),
		exit: vmCountKpiCategory(dataSource, 'exit'),
		licenseAbnormal: vmCountKpiCategory(dataSource, 'licenseAbnormal'),
		insuranceAbnormal: vmCountKpiCategory(dataSource, 'insuranceAbnormal')
	};

	var handleExport = useCallback(function () {
		message.success('导出功能（原型演示）：当前列表共 ' + listTotal + ' 条');
	}, [listTotal]);

	var handleBatchImport = useCallback(function () {
		_batchImportResult[1](null);
		_batchImportModalVisible[1](true);
	}, []);

	var closeBatchImportModal = useCallback(function () {
		_batchImportModalVisible[1](false);
		_batchImportResult[1](null);
	}, []);

	var downloadVehicleImportTemplate = useCallback(function () {
		vmDownloadVehicleImportTemplate();
		message.success('车辆导入模板已下载');
	}, []);

	var handleVehicleImportUpload = useCallback(function (file) {
		var name = (file && file.name ? file.name : '').toLowerCase();
		if (!/\.(csv|xls|xlsx|txt)$/.test(name)) {
			message.warning('请上传 .csv、.xls 或 .xlsx 文件');
			return false;
		}
		var reader = new FileReader();
		reader.onload = function (e) {
			var text = e.target && e.target.result ? String(e.target.result) : '';
			if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
				if (text.indexOf('<table') >= 0) {
					text = text.replace(/<tr[^>]*>/gi, '\n').replace(/<\/tr>/gi, '').replace(/<td[^>]*>/gi, ',').replace(/<\/td>/gi, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
				} else {
					message.warning('Excel 文件请使用下载的模板填写，或另存为 CSV UTF-8 后上传');
					return;
				}
			}
			var rows = vmParseVehicleImportText(text);
			if (!rows.length) {
				message.error('未识别到有效导入数据，请使用车辆导入模板填写');
				_batchImportResult[1]({ hasFailed: true, failedList: [{ rowNo: '-', plateNo: '-', vin: '-', reason: '文件无有效数据行' }] });
				return;
			}
			var validation = vmValidateVehicleImportRows(rows, _tableData[0]);
			if (!validation.ok) {
				_batchImportResult[1]({ hasFailed: true, failedList: validation.failedList });
				message.error('导入校验未通过，共 ' + validation.failedList.length + ' 条错误');
				return;
			}
			_tableData[1](function (prev) {
				var next = prev.slice();
				var i;
				for (i = 0; i < validation.accepted.length; i++) {
					next.push(vmMapImportRowToVehicleRecord(validation.accepted[i], i));
				}
				return next;
			});
			message.success('成功导入 ' + validation.accepted.length + ' 条车辆');
			closeBatchImportModal();
		};
		reader.readAsText(file, 'UTF-8');
		return false;
	}, [_tableData[0], closeBatchImportModal]);

	var downloadVehicleImportFailedCsv = useCallback(function () {
		var result = _batchImportResult[0];
		if (!result || !result.failedList || !result.failedList.length) return;
		var lines = ['行号,车牌号,车辆识别代码,失败原因'];
		var i;
		for (i = 0; i < result.failedList.length; i++) {
			var item = result.failedList[i];
			lines.push([
				vmEscapeCsvCell(item.rowNo),
				vmEscapeCsvCell(item.plateNo),
				vmEscapeCsvCell(item.vin),
				vmEscapeCsvCell(item.reason)
			].join(','));
		}
		var blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
		var url = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
		a.download = '车辆导入失败明细.csv';
		a.click();
		URL.revokeObjectURL(url);
	}, [_batchImportResult[0]]);

	var goDetail = useCallback(function (record) {
		_detailRecord[1](record);
		_detailTab[1]('基本信息');
	}, []);

	var backToList = useCallback(function () {
		_detailRecord[1](null);
	}, []);

	var openUploadModal = useCallback(function (record) {
		_currentRow[1](record);
		_uploadModalVisible[1](true);
		_confirmModalVisible[1](false);
		_plateForm[1]({ vin: record.vin || '', plateNo: record.plateNo || '' });
		_plateError[1]('');
	}, []);

	var closeUploadModal = useCallback(function () {
		_uploadModalVisible[1](false);
		_currentRow[1](null);
	}, []);

	var startOcrThenConfirm = useCallback(function () {
		_uploadModalVisible[1](false);
		_ocrLoadingVisible[1](true);
		setTimeout(function () {
			_ocrLoadingVisible[1](false);
			_confirmModalVisible[1](true);
		}, 1500);
	}, []);

	var closeConfirmModal = useCallback(function () {
		_confirmModalVisible[1](false);
		_currentRow[1](null);
		_plateForm[1]({ vin: '', plateNo: '' });
		_plateError[1]('');
	}, []);

	var onPlateFormChange = useCallback(function (field, value) {
		_plateError[1]('');
		_plateForm[1](function (prev) {
			var next = {};
			next[field] = value;
			return Object.assign({}, prev, next);
		});
	}, []);

	var confirmPlate = useCallback(function () {
		var row = _currentRow[0];
		var form = _plateForm[0];
		if (!row) return;
		var vinMatch = form.vin && row.vin && form.vin.trim() === row.vin.trim();
		if (!form.vin || !form.plateNo) {
			_plateError[1]('请填写车辆识别代码与车牌号');
			return;
		}
		if (!vinMatch) {
			_plateError[1]('车辆识别代码与该车辆不匹配');
			return;
		}
		message.success('上牌信息已更新（原型演示）');
		closeConfirmModal();
	}, []);

	var openEditModal = useCallback(function (record) {
		if (!isAdmin) {
			message.warning('仅 Admin 可编辑车辆信息');
			return;
		}
		_editRecord[1](record);
		_editForm[1]({
			parking: record.parking === '-' ? '-' : (record.parking || undefined),
			operateStatus: record.operateStatus || undefined,
			vehicleStatus: record.vehicleStatus || undefined,
			ownership: record.ownership && record.ownership !== '-' ? record.ownership : '',
			operateCompany: record.operateCompany || undefined,
			vehicleSource: record.vehicleSource || undefined,
			leaseCompany: record.leaseCompany && record.leaseCompany !== '-' ? record.leaseCompany : '',
			year: record.year || undefined,
			purchaseDate: record.purchaseDate || ''
		});
		_editModalVisible[1](true);
	}, []);

	var closeEditModal = useCallback(function () {
		_editModalVisible[1](false);
		_editRecord[1](null);
		_editForm[1]({});
	}, []);

	var onEditFormChange = useCallback(function (field, value) {
		_editForm[1](function (prev) {
			var next = Object.assign({}, prev);
			next[field] = value;
			return next;
		});
	}, []);

	var saveEdit = useCallback(function () {
		if (!isAdmin) {
			message.warning('仅 Admin 可保存');
			return;
		}
		var record = _editRecord[0];
		var form = _editForm[0];
		if (!record) return;
		if (!form.operateStatus || !form.vehicleStatus) {
			message.warning('请选择运营状态与车辆状态');
			return;
		}
		_tableData[1](function (prev) {
			return prev.map(function (row) {
				if (row.id !== record.id) return row;
				var ownershipVal = (form.ownership || '').trim();
				var leaseVal = (form.leaseCompany || '').trim();
				return Object.assign({}, row, {
					parking: form.parking || '-',
					operateStatus: form.operateStatus,
					vehicleStatus: form.vehicleStatus,
					ownership: ownershipVal || '-',
					operateCompany: form.operateCompany || row.operateCompany,
					vehicleSource: form.vehicleSource || row.vehicleSource,
					leaseCompany: leaseVal || '-',
					year: form.year || row.year,
					purchaseDate: form.purchaseDate || row.purchaseDate
				});
			});
		});
		if (_detailRecord[0] && _detailRecord[0].id === record.id) {
			_detailRecord[1](function (prev) {
				if (!prev || prev.id !== record.id) return prev;
				var ownershipVal = (form.ownership || '').trim();
				var leaseVal = (form.leaseCompany || '').trim();
				return Object.assign({}, prev, {
					parking: form.parking || '-',
					operateStatus: form.operateStatus,
					vehicleStatus: form.vehicleStatus,
					ownership: ownershipVal || '-',
					operateCompany: form.operateCompany || prev.operateCompany,
					vehicleSource: form.vehicleSource || prev.vehicleSource,
					leaseCompany: leaseVal || '-',
					year: form.year || prev.year,
					purchaseDate: form.purchaseDate || prev.purchaseDate
				});
			});
		}
		message.success('车辆信息已保存（原型演示）');
		closeEditModal();
	}, []);

	var closeOpsManagerModal = useCallback(function () {
		_opsManagerModalMode[1](null);
		_opsManagerModalRecord[1](null);
		_opsManagerBatchIds[1]([]);
		_opsManagerDraftSelected[1]([]);
	}, []);

	var openOpsManagerModal = useCallback(function (record) {
		if (!canEditOpsManager) {
			message.warning('暂无运维负责人编辑权限');
			return;
		}
		if (!record) return;
		_opsManagerModalMode[1]('single');
		_opsManagerModalRecord[1](record);
		_opsManagerBatchIds[1]([]);
		_opsManagerDraftSelected[1](vmResolveVehicleOpsManagers(record));
	}, [canEditOpsManager]);

	var openBatchOpsManagerModal = useCallback(function () {
		if (!canEditOpsManager) {
			message.warning('暂无运维负责人编辑权限');
			return;
		}
		var ids = displayDataSource.map(function (row) { return row.id; });
		if (!ids.length) {
			message.info('当前搜索结果无车辆可设置');
			return;
		}
		_opsManagerModalMode[1]('batch');
		_opsManagerModalRecord[1](null);
		_opsManagerBatchIds[1](ids);
		_opsManagerDraftSelected[1]([]);
	}, [canEditOpsManager, displayDataSource]);

	var saveOpsManagers = useCallback(function () {
		var mode = _opsManagerModalMode[0];
		var selected = (_opsManagerDraftSelected[0] || []).slice();
		if (mode === 'batch') {
			var ids = _opsManagerBatchIds[0] || [];
			if (!ids.length) return;
			var idSet = {};
			ids.forEach(function (id) { idSet[id] = true; });
			_tableData[1](function (prev) {
				return prev.map(function (row) {
					if (!idSet[row.id]) return row;
					return Object.assign({}, row, { opsManagers: selected });
				});
			});
			if (_detailRecord[0] && idSet[_detailRecord[0].id]) {
				_detailRecord[1](function (prev) {
					if (!prev || !idSet[prev.id]) return prev;
					return Object.assign({}, prev, { opsManagers: selected });
				});
			}
			message.success('已批量设置 ' + ids.length + ' 辆车的运维负责人');
		} else if (mode === 'single') {
			var record = _opsManagerModalRecord[0];
			if (!record) return;
			_tableData[1](function (prev) {
				return prev.map(function (row) {
					if (row.id !== record.id) return row;
					return Object.assign({}, row, { opsManagers: selected });
				});
			});
			if (_detailRecord[0] && _detailRecord[0].id === record.id) {
				_detailRecord[1](function (prev) {
					if (!prev || prev.id !== record.id) return prev;
					return Object.assign({}, prev, { opsManagers: selected });
				});
			}
			message.success('运维负责人已设置，所选人员可在所有车辆业务中操作该车辆');
		} else {
			return;
		}
		closeOpsManagerModal();
	}, [closeOpsManagerModal]);

	var renderOpsManagerCell = useCallback(function (record) {
		if (!record) return null;
		var names = vmResolveVehicleOpsManagers(record);
		var isEmpty = !names.length;
		var displayText = vmFormatOpsManagersText(record);
		if (!canEditOpsManager) {
			return React.createElement('span', {
				className: 'vm-ops-manager-cell' + (isEmpty ? ' vm-ops-manager-cell--placeholder' : ''),
				title: isEmpty ? '' : displayText
			}, displayText);
		}
		return React.createElement('span', {
			className: 'vm-ops-manager-cell vm-ops-manager-cell--clickable' + (isEmpty ? ' vm-ops-manager-cell--placeholder' : ''),
			title: isEmpty ? '未分配，点击设置运维负责人' : '点击设置运维负责人',
			role: 'button',
			tabIndex: 0,
			onClick: function (e) {
				e.stopPropagation();
				openOpsManagerModal(record);
			},
			onKeyDown: function (e) {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					e.stopPropagation();
					openOpsManagerModal(record);
				}
			}
		}, displayText);
	}, [canEditOpsManager, openOpsManagerModal]);

	var handleFilterReset = useCallback(function () {
		_plateNosPending[1]('');
		_plateNosApplied[1]('');
		_multiPlateDraft[1]('');
		_multiPlateOpen[1](false);
		_operateCityFilter[1]([]);
		_brand[1](undefined);
		_model[1](undefined);
		_customer[1](undefined);
		_department[1](undefined);
		_projectNameFilter[1](undefined);
		_contractNo[1](undefined);
		_ownership[1](undefined);
		_operateCompany[1](undefined);
		_operateStatusFilter[1](undefined);
		_vehicleSource[1](undefined);
		_leaseCompany[1](undefined);
		_commercialInsurance[1](undefined);
		_compulsoryInsurance[1](undefined);
		_parkingFilter[1](undefined);
		_areaRegion[1]([]);
		_kpiTab[1]('all');
	}, []);

	var handleMultiPlateOpenChange = useCallback(function (open) {
		_multiPlateOpen[1](open);
		if (open) _multiPlateDraft[1](_plateNosPending[0] || '');
	}, []);

	var handleMultiPlateDraftClear = useCallback(function () {
		_multiPlateDraft[1]('');
		_plateNosPending[1]('');
		_plateNosApplied[1]('');
		_multiPlateOpen[1](false);
	}, []);

	var confirmMultiPlateDraft = useCallback(function () {
		_plateNosPending[1]((_multiPlateDraft[0] || '').trim());
		_multiPlateOpen[1](false);
	}, []);

	var handleFilterQuery = useCallback(function () {
		var pendingText = (_plateNosPending[0] || '').trim();
		_plateNosApplied[1](pendingText);
		var plates = vmParseMultiPlates(pendingText);
		if (plates.length) {
			var hitCount = _tableData[0].filter(function (row) {
				return plates.indexOf(vmNormalizePlateNo(row.plateNo)) >= 0;
			}).length;
			message.success('已按 ' + plates.length + ' 个车牌筛选，命中 ' + hitCount + ' 条记录');
			return;
		}
		message.success('已应用筛选条件（原型）');
	}, []);

	// 状态类字段：枚举为「无」或空值、占位「-」时界面统一显示「无」（详情/表单）
	var formatStatusDisplay = function (val) {
		if (val === '无' || vmIsEmptyDisplayValue(val)) return VM_EMPTY_DISPLAY_LABEL;
		return val;
	};

	// 列表页：空值显示空白，有效枚举（含「无」）照常展示
	var formatListStatusDisplay = function (val) {
		if (vmIsEmptyDisplayValue(val)) return '';
		return val;
	};

	var getMoreMenuItems = function (record) {
		var items = [];
		if (isAdmin) {
			items.push({ key: 'edit', label: '编辑', onClick: function () { openEditModal(record); } });
		}
		if (canEditOpsManager) {
			items.push({ key: 'opsManager', label: '修改运维负责人', onClick: function () { openOpsManagerModal(record); } });
		}
		return items;
	};

	var renderFilterField = useCallback(function (label, control) {
		return React.createElement('div', { className: 'lc-filter-field' },
			React.createElement('span', { className: 'lc-filter-field-label' }, label),
			React.createElement('div', { className: 'lc-filter-field-control' }, control)
		);
	}, []);

	var vmSelectFilterOption = function (input, opt) {
		return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1;
	};

	var renderStatusTag = useCallback(function (text, colorFn) {
		var display = formatStatusDisplay(text);
		if (!display) return null;
		return React.createElement(Tag, { className: 'vm-status-tag', color: colorFn(text) }, display);
	}, []);

	var renderRecordStatusTag = useCallback(function (text, colorFn, abnormalTip, forList) {
		var display = forList ? formatListStatusDisplay(text) : formatStatusDisplay(text);
		if (!display) return null;
		var tag = React.createElement(Tag, { className: 'vm-status-tag', color: colorFn(text) }, display);
		if (abnormalTip) {
			tag = React.createElement(Tooltip, { title: abnormalTip }, tag);
		}
		return tag;
	}, []);

	var renderStatusColumnTitle = useCallback(function (label, tip) {
		return React.createElement('span', { className: 'vm-col-title-with-tip' },
			label,
			React.createElement(Tooltip, { title: tip, placement: 'top', overlayStyle: { maxWidth: 360 } },
				React.createElement('span', {
					className: 'vm-col-title-tip',
					role: 'img',
					'aria-label': label + '说明',
					tabIndex: 0,
					onClick: function (e) { e.stopPropagation(); },
					onKeyDown: function (e) { e.stopPropagation(); }
				}, vmSvgIcon(VM_INFO_TIP_ICON_PATHS, 10))
			)
		);
	}, []);

	var handleKpiCardClick = useCallback(function (key) {
		_kpiTab[1](key);
	}, []);

	var renderKpiCard = useCallback(function (card) {
		var active = _kpiTab[0] === card.key;
		var count = kpiCounts[card.key];
		return React.createElement('div', {
			key: card.key,
			role: 'button',
			tabIndex: 0,
			className: 'lc-alert-card lc-alert-card--' + card.type + ' lc-alert-card-clickable' + (active ? ' lc-alert-card-active' : ''),
			onClick: function () { handleKpiCardClick(card.key); },
			onKeyDown: function (e) {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleKpiCardClick(card.key);
				}
			}
		},
			React.createElement('div', { className: 'lc-alert-card-tip-anchor' },
				React.createElement(Tooltip, { title: card.desc, placement: 'topRight', overlayStyle: { maxWidth: 360 } },
					React.createElement('span', {
						className: 'lc-alert-card-tip',
						role: 'img',
						'aria-label': card.title + '说明',
						onClick: function (e) { e.stopPropagation(); },
						onMouseDown: function (e) { e.stopPropagation(); }
					}, vmSvgIcon(VM_INFO_TIP_ICON_PATHS, 10))
				)
			),
			React.createElement('div', { className: 'lc-alert-card-icon', 'aria-hidden': true }, VM_KPI_ICONS[card.key]),
			React.createElement('div', { className: 'lc-alert-card-main' },
				React.createElement('div', { className: 'lc-alert-card-title', title: card.title }, card.title),
				React.createElement('div', { className: 'lc-alert-card-val' }, count)
			)
		);
	}, [_kpiTab[0], kpiCounts, handleKpiCardClick]);

	var renderOperateCityColumnTitle = useCallback(function () {
		return React.createElement('span', { className: 'vm-col-title-with-tip' },
			'运营城市',
			React.createElement(Tooltip, { title: 'GPS最后一次回传的城市', placement: 'top' },
				React.createElement('span', {
					className: 'vm-col-title-tip',
					role: 'img',
					'aria-label': 'GPS最后一次回传的城市',
					tabIndex: 0,
					onClick: function (e) { e.stopPropagation(); },
					onKeyDown: function (e) { e.stopPropagation(); }
				}, vmSvgIcon(VM_INFO_TIP_ICON_PATHS, 10))
			)
		);
	}, []);

	var renderOpsManagerColumnTitle = useCallback(function () {
		return React.createElement('span', { className: 'vm-col-title-with-action' },
			'运维负责人',
			canEditOpsManager ? React.createElement(Tooltip, { title: '批量设置当前搜索结果运维负责人', placement: 'top' },
				React.createElement('button', {
					type: 'button',
					className: 'vm-col-title-edit-btn',
					'aria-label': '批量设置运维负责人',
					onClick: function (e) {
						e.stopPropagation();
						openBatchOpsManagerModal();
					}
				}, VM_ICONS.edit)
			) : null
		);
	}, [canEditOpsManager, openBatchOpsManagerModal]);

	var renderMileageColumnTitle = useCallback(function () {
		return React.createElement('span', { className: 'vm-col-title-with-tip' },
			'里程数',
			React.createElement(Tooltip, { title: VM_MILEAGE_COLUMN_TIP, placement: 'top' },
				React.createElement('span', {
					className: 'vm-col-title-tip',
					role: 'img',
					'aria-label': VM_MILEAGE_COLUMN_TIP,
					tabIndex: 0,
					onClick: function (e) { e.stopPropagation(); },
					onKeyDown: function (e) { e.stopPropagation(); }
				}, vmSvgIcon(VM_INFO_TIP_ICON_PATHS, 10))
			)
		);
	}, []);

	var columns = [
		{
			title: '车辆信息',
			key: 'vehicleIdentity',
			width: 200,
			fixed: 'left',
			onCell: function () { return { className: 'vm-vehicle-identity-td' }; },
			render: function (_, record) {
				return vmRenderVehicleIdentityCell(record, goDetail);
			}
		},
		{ title: renderStatusColumnTitle('运营状态', VM_STATUS_COLUMN_TIPS.operateStatus), dataIndex: 'operateStatus', key: 'operateStatus', width: 110, render: function (_, record) { return renderRecordStatusTag(record.operateStatus, vmOperateStatusColor, '', true); } },
		{
			title: renderOperateCityColumnTitle(),
			key: 'operateCity',
			width: 140,
			render: function (_, record) {
				var city = vmFormatOperateCityFromGps(record.location);
				var locationTitle = vmIsEmptyDisplayValue(record.location) ? undefined : record.location;
				return React.createElement('span', { title: locationTitle }, vmDisplayListLabel(city));
			}
		},
		{
			title: '所属项目',
			key: 'projectInfo',
			width: 200,
			onCell: function () { return { className: 'vm-stacked-cell-td' }; },
			render: function (_, record) { return vmRenderProjectCell(record); }
		},
		{
			title: '业务员',
			key: 'salesperson',
			width: 120,
			onCell: function () { return { className: 'vm-stacked-cell-td' }; },
			render: function (_, record) { return vmRenderSalespersonCell(record); }
		},
		{ title: '停放区域', dataIndex: 'parking', key: 'parking', width: 140, render: vmRenderOneLineText },
		{
			title: renderMileageColumnTitle(),
			key: 'mileage',
			width: 170,
			onCell: function () { return { className: 'vm-mileage-cell-td' }; },
			render: function (_, record) { return vmRenderMileageCell(record, true); }
		},
		{ title: renderStatusColumnTitle('车辆状态', VM_STATUS_COLUMN_TIPS.vehicleStatus), dataIndex: 'vehicleStatus', key: 'vehicleStatus', width: 120, render: function (_, record) { return renderRecordStatusTag(record.vehicleStatus, function () { return 'blue'; }, '', true); } },
		{ title: renderStatusColumnTitle('证照状态', VM_STATUS_COLUMN_TIPS.licenseStatus), dataIndex: 'licenseStatus', key: 'licenseStatus', width: 100, render: function (_, record) {
			var tip = record.licenseStatus === '异常' ? vmGetLicenseAbnormalTooltip(record) : '';
			return renderRecordStatusTag(record.licenseStatus, vmAlertStatusColor, tip, true);
		} },
		{
			title: '行驶证检验有效期',
			dataIndex: 'inspectExpire',
			key: 'inspectExpire',
			width: 150,
			onCell: vmExpireDateOnCell,
			render: function (_, record) { return vmRenderExpireDateCell(record.inspectExpire, true); }
		},
		{
			title: '等评时间',
			dataIndex: 'ratingTime',
			key: 'ratingTime',
			width: 150,
			onCell: vmExpireDateOnCell,
			render: function (_, record) { return vmRenderExpireDateCell(record.ratingTime, true); }
		},
		{ title: renderStatusColumnTitle('保险状态', VM_STATUS_COLUMN_TIPS.insuranceStatus), dataIndex: 'insuranceStatus', key: 'insuranceStatus', width: 100, render: function (_, record) {
			var tip = record.insuranceStatus === '异常' ? vmGetInsuranceAbnormalTooltip(record) : '';
			return renderRecordStatusTag(record.insuranceStatus, vmAlertStatusColor, tip, true);
		} },
		{
			title: '交强险到期时间',
			key: 'compulsoryInsuranceExpire',
			width: 150,
			onCell: vmExpireDateOnCell,
			render: function (_, record) { return vmRenderInsuranceExpireDate(record, 'compulsory', true); }
		},
		{
			title: '商业险到期时间',
			key: 'commercialInsuranceExpire',
			width: 150,
			onCell: vmExpireDateOnCell,
			render: function (_, record) { return vmRenderInsuranceExpireDate(record, 'commercial', true); }
		},
		{ title: renderStatusColumnTitle('出库状态', VM_STATUS_COLUMN_TIPS.outStatus), dataIndex: 'outStatus', key: 'outStatus', width: 130, render: function (_, record) { return renderRecordStatusTag(record.outStatus, function () { return 'default'; }, '', true); } },
		{ title: '登记所有权', dataIndex: 'ownership', key: 'ownership', width: 160, ellipsis: true, render: vmRenderOneLineText },
		{ title: '运营公司', dataIndex: 'operateCompany', key: 'operateCompany', width: 150, ellipsis: true, render: vmRenderOneLineText },
		{ title: '车辆来源', dataIndex: 'vehicleSource', key: 'vehicleSource', width: 90, render: function (_, record) { return renderRecordStatusTag(record.vehicleSource, vmVehicleSourceColor, '', true); } },
		{ title: '租赁公司', dataIndex: 'leaseCompany', key: 'leaseCompany', width: 160, ellipsis: true, render: vmRenderOneLineText },
		{ title: '车辆编号', dataIndex: 'vehicleNo', key: 'vehicleNo', width: 100, render: vmRenderOneLineText },
		{ title: '车身颜色', dataIndex: 'color', key: 'color', width: 90, render: vmRenderOneLineText },
		{ title: '出厂年份', dataIndex: 'year', key: 'year', width: 90, render: vmRenderOneLineText },
		{ title: '采购入库时间', dataIndex: 'purchaseDate', key: 'purchaseDate', width: 120, render: vmRenderOneLineText },
		{
			title: '强制报废日期',
			dataIndex: 'scrapDate',
			key: 'scrapDate',
			width: 150,
			onCell: vmExpireDateOnCell,
			render: function (_, record) { return vmRenderExpireDateCell(record.scrapDate, true); }
		},
		{
			title: '上次交车情况',
			key: 'lastDeliverySituation',
			width: 156,
			onCell: function () { return { className: 'vm-stacked-cell-td' }; },
			render: function (_, record) { return vmRenderLastDeliverySituationCell(record); }
		},
		{
			title: '上次还车情况',
			key: 'lastReturnSituation',
			width: 156,
			onCell: function () { return { className: 'vm-stacked-cell-td' }; },
			render: function (_, record) { return vmRenderLastReturnSituationCell(record); }
		},
		{
			title: '当前位置',
			key: 'gpsLocation',
			width: 300,
			onCell: function () { return { className: 'vm-gps-location-td' }; },
			render: function (_, record) { return vmRenderGpsLocationCell(record); }
		},
		{
			title: renderOpsManagerColumnTitle(),
			key: 'opsManagers',
			width: 176,
			render: function (_, record) { return renderOpsManagerCell(record); }
		},
		{
			title: '操作',
			key: 'action',
			width: 120,
			fixed: 'right',
			render: function (_, record) {
				return React.createElement('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } },
					React.createElement(Button, { key: 'view', type: 'link', size: 'small', className: 'lc-action-btn', onClick: function () { goDetail(record); } }, '查看'),
					React.createElement(Dropdown, { key: 'more', menu: { items: getMoreMenuItems(record) }, trigger: ['click'] },
						React.createElement(Tooltip, { title: '更多操作' },
							React.createElement('span', {
								className: 'vm-action-more-btn',
								role: 'button',
								tabIndex: 0,
								'aria-label': '更多操作',
								onClick: function (e) { e.stopPropagation(); }
							}, vmMoreIcon())
						)
					)
				);
			}
		}
	];

	var filterControlStyle = { width: '100%', height: 32, borderRadius: 8 };
	var selectDropdownStyle = { borderRadius: 8 };

	vmEnsureStylesheet();

	var emptyNode = React.createElement('div', { className: 'vm-empty-wrap' },
		VM_ICONS.empty,
		React.createElement('div', { style: { marginTop: 12 } }, '暂无符合条件的车辆')
	);

	// 车辆详情页：顶部返回 + 信息层级卡片 + Tab
	var detailRecord = _detailRecord[0];
	if (detailRecord) {
		var r = detailRecord;
		var detailField = function (label, valueNode, fieldKey) {
			return React.createElement('div', { key: fieldKey || label, className: 'vm-detail-field' },
				React.createElement('div', { className: 'vm-detail-field-label' }, label),
				React.createElement('div', { className: 'vm-detail-field-value' }, valueNode)
			);
		};
		var detailLocationText = vmResolveLocationFullAddress(r);
		var detailLicenseTip = r.licenseStatus === '异常' ? vmGetLicenseAbnormalTooltip(r) : '';
		var detailInsuranceTip = r.insuranceStatus === '异常' ? vmGetInsuranceAbnormalTooltip(r) : '';
		var detailTextValue = function (val) {
			return vmDisplayUILabel(val);
		};
		var detailTabSection = function (title, body, sectionKey) {
			return React.createElement('section', { key: sectionKey, className: 'vm-model-param-section' },
				React.createElement('div', { className: 'vm-model-param-section-title' }, title),
				body
			);
		};
		var assetStatusFields = [
			detailField('车辆来源', renderRecordStatusTag(r.vehicleSource, vmVehicleSourceColor, ''), 'vehicleSource'),
			detailField('登记所有权', detailTextValue(r.ownership), 'ownership'),
			detailField('运营公司', detailTextValue(r.operateCompany), 'operateCompany'),
			detailField('租赁公司', detailTextValue(r.leaseCompany), 'leaseCompany')
		];
		var modelParamText = function (val, fallback) {
			if (fallback !== undefined && vmIsEmptyDisplayValue(val)) return fallback;
			return vmDisplayUILabel(val);
		};
		var modelParamSection = detailTabSection;
		var tabContent = function (text) {
			return React.createElement('div', { className: 'vm-tab-placeholder' }, text);
		};
		var maintenanceTableData = [
			{ key: '1', no: 1, item: '变速器油', kmCycle: '60000', monthCycle: '24', labor: '0', material: '571', total: '571', lastKm: '' },
			{ key: '2', no: 2, item: '变速器油', kmCycle: '60000', monthCycle: '24', labor: '0', material: '571', total: '571', lastKm: '' },
			{ key: '3', no: 3, item: '变速器油', kmCycle: '60000', monthCycle: '24', labor: '0', material: '571', total: '571', lastKm: '5000' },
			{ key: '4', no: 4, item: '变速器油', kmCycle: '60000', monthCycle: '24', labor: '0', material: '571', total: '571', lastKm: '5000' },
			{ key: '5', no: 5, item: '变速器油', kmCycle: '60000', monthCycle: '24', labor: '0', material: '571', total: '571', lastKm: '5000' }
		];
		var maintenanceColumns = [
			{ title: '序号', dataIndex: 'no', key: 'no', width: 60 },
			{ title: '养护项目', dataIndex: 'item', key: 'item', width: 120 },
			{ title: '保养公里周期(km)', dataIndex: 'kmCycle', key: 'kmCycle', width: 140 },
			{ title: '保养时间周期(月)', dataIndex: 'monthCycle', key: 'monthCycle', width: 130 },
			{ title: '工时费(元)', dataIndex: 'labor', key: 'labor', width: 100 },
			{ title: '材料费(元)', dataIndex: 'material', key: 'material', width: 100 },
			{ title: '合计', dataIndex: 'total', key: 'total', width: 80 },
			{ title: '上次保养公里数(KM)', dataIndex: 'lastKm', key: 'lastKm', width: 140 }
		];
		var modelParamContent = React.createElement('div', { className: 'vm-tab-card vm-model-param-tab' },
			modelParamSection('型号参数', React.createElement('div', { className: 'vm-detail-fields-grid' }, [
				detailField('品牌', modelParamText(r.brand, '苏龙'), 'mp-brand'),
				detailField('型号', modelParamText(r.model, '海格牌KLQ5180XYKFCEV'), 'mp-model'),
				detailField('车辆类型', modelParamText(r.vehicleType), 'mp-vehicleType'),
				detailField('燃料种类', '氢', 'mp-fuelType'),
				detailField('整车尺寸', '5995mm × 2145mm × 3130mm', 'mp-size'),
				detailField('车牌颜色', modelParamText(r.color, '绿牌'), 'mp-plateColor')
			]), 'base'),
			modelParamSection('轮胎情况', React.createElement('div', { className: 'vm-detail-fields-grid' }, [
				detailField('轮胎数量', '8', 'mp-tireCount'),
				detailField('轮胎规格', '15/80R22.5', 'mp-tireSpec')
			]), 'tire'),
			modelParamSection('电气系统', React.createElement('div', { className: 'vm-detail-fields-grid' }, [
				detailField('电池类型', '磷酸铁锂', 'mp-batteryType'),
				detailField('电池厂家', '宁德时代新能源科技股份有限公司', 'mp-batteryVendor'),
				detailField('储电量', '100000 kWh', 'mp-capacity'),
				detailField('续航里程', '200 KM', 'mp-electricRange')
			]), 'electric'),
			modelParamSection('供氢系统', React.createElement('div', { className: 'vm-detail-fields-grid' }, [
				detailField('氢瓶容量', '140 L', 'mp-cylinder'),
				detailField('仪表盘模式', 'MPa', 'mp-gauge'),
				detailField('续航里程', '1000 KM', 'mp-hydrogenRange'),
				detailField('供氢系统厂家', '江苏国富氢能技术装备股份有限公司', 'mp-hydrogenVendor')
			]), 'hydrogen'),
			modelParamSection('其他系统', React.createElement('div', { className: 'vm-detail-fields-grid' }, [
				detailField('冷机生产企业', '开利空调冷冻设备（上海）有限公司', 'mp-coldVendor'),
				detailField('电堆生产企业', '亿华通动力科技股份有限公司', 'mp-stackVendor')
			]), 'other'),
			modelParamSection('保养参数', React.createElement('div', { className: 'vm-model-param-table-wrap' },
				React.createElement(Table, {
					className: 'vm-model-param-table',
					size: 'small',
					rowKey: 'key',
					columns: maintenanceColumns,
					dataSource: maintenanceTableData,
					pagination: false,
					scroll: { x: 960 }
				})
			), 'maintenance')
		);
		var basicInfoTabContent = React.createElement('div', { className: 'vm-tab-card vm-model-param-tab' },
			detailTabSection('档案信息', React.createElement('div', { className: 'vm-detail-fields-grid' }, [
				detailField('出厂年份', detailTextValue(r.year), 'year'),
				detailField('采购入库日期', vmRenderDetailDateValue(r.purchaseDate), 'purchaseDate'),
				detailField('强制报废日期', vmRenderDetailExpireValue(r.scrapDate), 'scrapDate'),
				detailField('等评时间', vmRenderDetailExpireValue(r.ratingTime), 'ratingTime-r1')
			]), 'bi-archive'),
			detailTabSection('业务信息', React.createElement('div', { className: 'vm-detail-fields-grid' }, [
				detailField('运营状态', renderRecordStatusTag(r.operateStatus, vmOperateStatusColor, ''), 'operateStatus'),
				detailField('客户名称', detailTextValue(r.customer), 'customer'),
				detailField('合同编码', detailTextValue(r.contractNo), 'contractNo'),
				detailField('项目名称', detailTextValue(vmResolveVehicleProjectName(r)), 'projectName')
			]), 'bi-business'),
			detailTabSection('证照信息', React.createElement('div', { className: 'vm-detail-fields-grid' }, [
				detailField('车辆状态', renderRecordStatusTag(r.vehicleStatus, function () { return 'blue'; }, ''), 'vehicleStatus'),
				detailField('证照状态', renderRecordStatusTag(r.licenseStatus, vmAlertStatusColor, detailLicenseTip), 'licenseStatus'),
				detailField('行驶证有效期', vmRenderDetailExpireValue(r.inspectExpire), 'inspectExpire'),
				detailField('等评时间', vmRenderDetailExpireValue(r.ratingTime), 'ratingTime-r3')
			]), 'bi-license'),
			detailTabSection('保险与出库', React.createElement('div', { className: 'vm-detail-fields-grid' }, [
				detailField('保险状态', renderRecordStatusTag(r.insuranceStatus, vmAlertStatusColor, detailInsuranceTip), 'insuranceStatus'),
				detailField('交强险到期时间', vmRenderInsuranceExpireDate(r, 'compulsory'), 'compulsoryInsurance'),
				detailField('商业险到期时间', vmRenderInsuranceExpireDate(r, 'commercial'), 'commercialInsurance'),
				detailField('出库状态', renderRecordStatusTag(r.outStatus, function () { return 'default'; }, ''), 'outStatus')
			]), 'bi-insurance'),
			detailTabSection('资产状况', React.createElement('div', { className: 'vm-detail-fields-grid' }, assetStatusFields), 'bi-asset')
		);
		var detailTabItems = [
			{ key: '基本信息', label: '基本信息', children: basicInfoTabContent },
			{ key: '型号参数', label: '型号参数', children: modelParamContent },
			{ key: '后装设备', label: '后装设备', children: React.createElement('div', { className: 'vm-tab-card' }, tabContent('后装设备列表（原型占位）')) },
			{ key: '证照信息', label: '证照信息', children: React.createElement('div', { className: 'vm-tab-card' }, tabContent('证照信息（原型占位）')) },
			{ key: '租赁记录', label: '租赁记录', children: React.createElement('div', { className: 'vm-tab-card' }, tabContent('租赁记录（原型占位）')) },
			{ key: '保险记录', label: '保险记录', children: React.createElement('div', { className: 'vm-tab-card' }, tabContent('保险记录（原型占位）')) },
			{ key: '维修记录', label: '维修记录', children: React.createElement('div', { className: 'vm-tab-card' }, tabContent('维修记录（原型占位）')) },
			{ key: '事故记录', label: '事故记录', children: React.createElement('div', { className: 'vm-tab-card' }, tabContent('事故记录（原型占位）')) },
			{ key: '故障记录', label: '故障记录', children: React.createElement('div', { className: 'vm-tab-card' }, tabContent('故障记录（原型占位）')) },
			{ key: '违章记录', label: '违章记录', children: React.createElement('div', { className: 'vm-tab-card' }, tabContent('违章记录（原型占位）')) },
			{ key: '异动记录', label: '异动记录', children: React.createElement('div', { className: 'vm-tab-card' }, tabContent('异动记录（原型占位）')) },
			{ key: '调拨记录', label: '调拨记录', children: React.createElement('div', { className: 'vm-tab-card' }, tabContent('调拨记录（原型占位）')) },
			{ key: '整备记录', label: '整备记录', children: React.createElement('div', { className: 'vm-tab-card' }, tabContent('整备记录（原型占位）')) }
		];
		return React.createElement(App, null,
			React.createElement('div', { className: 'vm-page vm-detail-shell' },
				React.createElement('style', null, VM_PAGE_STYLE),
				React.createElement('div', { className: 'vm-detail-topbar' },
					React.createElement(Button, { className: 'vm-detail-back-btn', icon: VM_ICONS.back, onClick: backToList }, '返回列表'),
					React.createElement('h1', { className: 'vm-detail-topbar-title' }, '车辆详情')
				),
				React.createElement('div', { className: 'vm-detail-card' },
					React.createElement('div', { className: 'vm-detail-hero' },
						React.createElement('div', { className: 'vm-detail-hero-identity' },
							React.createElement('div', { className: 'vm-detail-plate-xl' }, vmDisplayUILabel(r.plateNo)),
							React.createElement('div', { className: 'vm-detail-meta-line' }, vmDisplayUILabel(r.brand) + ' · ' + vmDisplayUILabel(r.model)),
							React.createElement('div', { className: 'vm-detail-meta-line vm-detail-meta-line--mono' }, 'VIN ' + vmDisplayUILabel(r.vin))
						),
						React.createElement('div', { className: 'vm-detail-hero-aside' },
							React.createElement('div', { className: 'vm-detail-hero-tags' },
								vmRenderOnlineStatusCell(r.onlineStatus)
							),
							React.createElement('div', { className: 'vm-detail-hero-location', title: detailLocationText || undefined }, vmDisplayUILabel(detailLocationText)),
							React.createElement('div', { className: 'vm-detail-hero-gps-time' }, 'GPS最后上传 ' + vmDisplayUILabel(r.gpsTime))
						)
					),
					React.createElement('div', { className: 'vm-detail-quick-stats' },
						vmRenderDetailQuickStat('运营城市', vmFormatOperateCityFromGps(r.location)),
						vmRenderDetailQuickStat('里程数', vmRenderMileageCell(r)),
						vmRenderDetailQuickStat('停放区域', r.parking),
						vmRenderDetailQuickStat('运维负责人', vmFormatOpsManagersText(r))
					)
				),
				React.createElement('div', { className: 'vm-detail-card vm-detail-tabs' },
					React.createElement(Tabs, {
						activeKey: _detailTab[0],
						onChange: function (key) { _detailTab[1](key); },
						items: detailTabItems
					})
				)
			)
		);
	}

	var requirementText = '# 车辆管理\n一个「车辆资产管理」后台的「车辆管理」模块，功能从上到下依次为：\n\n1.筛选：\n1.1.车牌号：点击输入框展开多车牌选择器，每行一个车牌号（支持从 Excel 批量复制粘贴，单行内仍支持逗号分隔）；点击「确认」保存所选车牌，再点击「查询」后精确匹配并展示全部命中车辆、未命中的不显示，触发器显示已选车牌摘要；\n1.2.运营城市：选择器，支持输入地级市名称模糊搜索、多选，选项格式为省-市（取自 GPS 解析及停车场区域台账）；\n1.3.品牌：选择器；\n1.4.型号：选择器；\n1.5.客户名称：选择器，支持输入模糊匹配，占位「请选择或输入客户名称」；\n1.6.归属业务部门：选择器；\n1.7.项目名称：选择器，支持输入模糊匹配，占位「请选择或输入项目名称」，选项取自台账解析的项目名及合同映射；\n1.8.合同编码：选择器，支持输入模糊匹配；\n1.9.登记所有权：选择器，支持输入模糊匹配；\n1.10.运营公司：选择器，支持模糊搜索；\n1.11.运营状态：租赁、自营、可运营、待运营、退出运营；\n1.12.车辆来源：自有、外租、挂靠；\n1.13.租赁公司：选择器，支持模糊搜索；\n1.14.商业险状态：正常、异常；\n1.15.交强险状态：正常、异常；\n1.16.停车场：选择器，支持输入；\n1.17.定位城市：省-市级联选择；默认折叠仅展示一行（4 项），可点击「展开更多筛选项」；\n\n2.KPI 分类（筛选与列表之间）：\n所有营运车辆 / 运营中 / 库存 / 非运营车辆 / 退出运营 / 证照异常 / 保险异常；所有营运车辆=营运体系内全部车辆（不含非运营车辆与退出运营车辆），运营中=租赁+自营，库存=可运营+待运营，非运营车辆=导入车辆类型为「非运营车辆」的台账车辆，退出运营=退出运营，证照异常=行驶证检验有效期已过期（不含等评时间），保险异常=保险状态异常；点击卡片筛选列表，卡片右上角可查看说明；\n\n3.列表：\n工具栏右侧：导出、批量导入；批量导入：点击后弹窗分两步（下载模板、上传文件），弹窗内无长说明；可下载「车辆导入模板」（模板首行红色提示「非运营车辆不做必填项校验」，必填列表头红色并带*，仅运营车辆校验）；模板首列为车辆类型（枚举运营车辆/非运营车辆），其余字段为车牌号、*车辆识别代码、*品牌、*型号、*停放区域、行驶公里数、*登记所有权、*运营公司、*车辆来源、租赁公司、车辆编号、车辆颜色、出厂年份、采购入库时间；运营车辆执行全部必填与格式校验，非运营车辆不做必填项校验（有值时仍校验格式与唯一性）；车辆识别代码17位校验，品牌/型号按型号参数表校验，停放区域按停车场名称校验，行驶公里数为整数或最多两位小数，车辆来源枚举挂靠/外租/自有，出厂年份YYYY且不能晚于当前年份，采购入库时间YYYY-MM-DD且不能晚于当前日期，车牌号与车辆识别代码须唯一；上传后系统校验，失败可下载失败明细；\n运营城市取 GPS 最后定位位置，显示格式为「省-市」，表头含说明「GPS最后一次回传的城市」；\n运营状态、车辆状态、证照状态、保险状态、出库状态列表头含说明图标（依据《车辆状态说明》）；\n证照状态=异常时，悬浮提示「行驶证检验有效期已过期」（仅依据检验有效期是否过期判断，不含等评时间）；保险状态=异常时，悬浮提示「交强险已到期/商业险已到期」（按到期日判断）；\n字段依次为：车辆信息（车牌号、车架号可点击查看详情，品牌-型号三行）、运营状态、运营城市（GPS最后一次回传的城市，省-市格式）、所属项目（第一行客户名称、第二行合同编码、第三行项目名称；项目名称优先取车辆字段，为空时按合同编码关联租赁合同，仍无则按客户名称推导）、业务员（业务部门/业务员两行）、停放区域（单行）、里程数（表头含说明「显示最后一次交车记录/还车记录/车机里程数」；已对接车机显示车机里程并附「车机」标签，无车机里程数据时仍展示「0 km」，不回退交还车里程；未对接车机取最后一次交车或还车记录里程并附「最后一次交车」或「最后一次还车」标签）、车辆状态、证照状态、行驶证检验有效期、等评时间、保险状态、交强险到期时间、商业险到期时间、出库状态、登记所有权、运营公司、车辆来源、租赁公司、车辆编号、车身颜色、出厂年份、采购入库时间、强制报废日期、上次交车情况（第一行上次交车里程数+km，第二行上次交车省-市，第三行上次交车时间日期与时分同一行显示，省-市取自最后一次交车记录）、上次还车情况（同上，省-市取自最后一次还车记录）、当前位置（第一行在线/离线状态含绿/红点，第二行完整地址如省市区路号，第三行GPS最后上传时间）、运维负责人（按停车场所属区域默认匹配运维专员/运维助理/运维主管；需单独权限 vehicle:opsManager:edit，无权限时单元格只读、表头无编辑图标、操作列不展示「修改运维负责人」；有权限时可点击单元格或操作列「修改运维负责人」打开单车「设置运维负责人」弹窗，或点击表头右侧编辑图标对当前搜索结果全部车辆批量设置（批量弹窗展示适用范围）；下方均为多选选择器（支持输入姓名模糊搜索），提交后即时生效；多人单行显示，英文逗号分隔）、操作；所有有效期/到期日列显示 YYYY-MM-DD，并附剩余天数标签（剩余x天/已过期x天）；\n车辆详情：顶部「返回列表」按钮（无面包屑）；Hero 区左侧车牌/品牌型号/VIN，右上角在线状态后展示车辆当前位置与 GPS 最后上传时间（不展示运营状态、车辆状态标签）；四项指标为运营城市、里程数（与列表一致含来源标签）、停放区域、运维负责人；Tab 区首项为「基本信息」（含基本信息字段网格与「资产状况」，默认选中），其后为型号参数及各类记录 Tab；基本信息四行十七项（出厂年份/采购入库日期/强制报废日期/等评时间；运营状态/客户名称/合同编码/项目名称；车辆状态/证照状态/行驶证有效期/等评时间；保险状态/交强险到期时间/商业险到期时间/出库状态），不含车辆识别代码；所有到期时间附剩余x天或已过期x天标签；资产状况首行：车辆来源/登记所有权/运营公司/租赁公司；\n\n（状态字段规则见《车辆状态说明》产品需求文档。）\n';

	var multiPlateTriggerText = '';
	if (pendingMultiPlates.length) {
		if (pendingMultiPlates.length <= 2) multiPlateTriggerText = pendingMultiPlates.join('、');
		else multiPlateTriggerText = '已选 ' + pendingMultiPlates.length + ' 个车牌';
	}

	var buildFilterFields = function () {
		return [
			renderFilterField('车牌号', React.createElement(Popover, {
				open: _multiPlateOpen[0],
				onOpenChange: handleMultiPlateOpenChange,
				trigger: 'click',
				placement: 'bottomLeft',
				overlayClassName: 'vm-multi-plate-popover',
				overlayInnerStyle: { width: 288, padding: 0, boxSizing: 'border-box' },
				content: React.createElement('div', { className: 'vm-multi-plate-pop' },
					React.createElement(Input.TextArea, {
						className: 'vm-multi-plate-pop-textarea',
						value: _multiPlateDraft[0],
						onChange: function (e) { _multiPlateDraft[1](e.target.value); },
						placeholder: '请输入车牌号，多个车牌跨行输入',
						autoSize: { minRows: 5, maxRows: 8 }
					}),
					React.createElement('div', { className: 'vm-multi-plate-pop-actions' },
						React.createElement(Button, { size: 'small', type: 'primary', onClick: confirmMultiPlateDraft, style: VM_PRIMARY_BTN_STYLE }, '确认')
					)
				)
			},
				React.createElement(Input, {
					className: 'vm-multi-plate-trigger',
					readOnly: true,
					allowClear: !!multiPlateTriggerText,
					placeholder: '请选择或输入车牌号',
					value: multiPlateTriggerText,
					style: filterControlStyle,
					onClick: function () { _multiPlateOpen[1](true); },
					onClear: function (e) {
						if (e && e.stopPropagation) e.stopPropagation();
						handleMultiPlateDraftClear();
					},
					suffix: React.createElement('svg', {
						width: 14,
						height: 14,
						viewBox: '0 0 24 24',
						fill: 'none',
						stroke: '#94a3b8',
						strokeWidth: 2,
						style: { pointerEvents: 'none' }
					}, React.createElement('polyline', { points: '6 9 12 15 18 9' }))
				})
			)),
			renderFilterField('运营城市', React.createElement(Select, {
				mode: 'multiple',
				placeholder: '请选择或输入地级市搜索',
				style: filterControlStyle,
				options: operateCityOptions,
				value: _operateCityFilter[0],
				onChange: function (vals) { _operateCityFilter[1](vals || []); },
				allowClear: true,
				showSearch: true,
				filterOption: vmSelectFilterOption,
				optionFilterProp: 'label',
				maxTagCount: 'responsive',
				dropdownStyle: selectDropdownStyle
			})),
			renderFilterField('品牌', React.createElement(Select, { placeholder: '请选择', style: filterControlStyle, options: brandOptions, value: _brand[0], onChange: _brand[1], allowClear: true, dropdownStyle: selectDropdownStyle })),
			renderFilterField('型号', React.createElement(Select, { placeholder: '请选择', style: filterControlStyle, options: modelOptions, value: _model[0], onChange: _model[1], allowClear: true, dropdownStyle: selectDropdownStyle })),
			renderFilterField('客户名称', React.createElement(Select, { placeholder: '请选择或输入客户名称', style: filterControlStyle, options: customerOptions, value: _customer[0], onChange: _customer[1], allowClear: true, showSearch: true, filterOption: vmSelectFilterOption, dropdownStyle: selectDropdownStyle })),
			renderFilterField('归属业务部门', React.createElement(Select, { placeholder: '请选择', style: filterControlStyle, options: departmentOptions, value: _department[0], onChange: _department[1], allowClear: true, dropdownStyle: selectDropdownStyle })),
			renderFilterField('项目名称', React.createElement(Select, {
				placeholder: '请选择或输入项目名称',
				style: filterControlStyle,
				options: projectNameOptions,
				value: _projectNameFilter[0],
				onChange: _projectNameFilter[1],
				allowClear: true,
				showSearch: true,
				filterOption: vmSelectFilterOption,
				optionFilterProp: 'label',
				dropdownStyle: selectDropdownStyle
			})),
			renderFilterField('合同编码', React.createElement(Select, { placeholder: '请选择或输入', style: filterControlStyle, options: contractOptions, value: _contractNo[0], onChange: _contractNo[1], allowClear: true, showSearch: true, filterOption: vmSelectFilterOption, dropdownStyle: selectDropdownStyle })),
			renderFilterField('登记所有权', React.createElement(Select, { placeholder: '请选择登记所有权', style: filterControlStyle, options: ownershipOptions, value: _ownership[0], onChange: _ownership[1], allowClear: true, showSearch: true, filterOption: vmSelectFilterOption, dropdownStyle: selectDropdownStyle })),
			renderFilterField('运营公司', React.createElement(Select, { placeholder: '请选择或输入运营公司名称', style: filterControlStyle, options: operateCompanyOptions, value: _operateCompany[0], onChange: _operateCompany[1], allowClear: true, showSearch: true, filterOption: vmSelectFilterOption, dropdownStyle: selectDropdownStyle })),
			renderFilterField('运营状态', React.createElement(Select, { placeholder: '请选择', style: filterControlStyle, options: operateStatusOptions, value: _operateStatusFilter[0], onChange: _operateStatusFilter[1], allowClear: true, dropdownStyle: selectDropdownStyle })),
			renderFilterField('车辆来源', React.createElement(Select, { placeholder: '请选择', style: filterControlStyle, options: vehicleSourceOptions, value: _vehicleSource[0], onChange: _vehicleSource[1], allowClear: true, dropdownStyle: selectDropdownStyle })),
			renderFilterField('租赁公司', React.createElement(Select, { placeholder: '请选择或搜索', style: filterControlStyle, options: leaseCompanyOptions, value: _leaseCompany[0], onChange: _leaseCompany[1], allowClear: true, showSearch: true, filterOption: vmSelectFilterOption, dropdownStyle: selectDropdownStyle })),
			renderFilterField('商业险状态', React.createElement(Select, { placeholder: '请选择', style: filterControlStyle, options: insuranceStatusOptions, value: _commercialInsurance[0], onChange: _commercialInsurance[1], allowClear: true, dropdownStyle: selectDropdownStyle })),
			renderFilterField('交强险状态', React.createElement(Select, { placeholder: '请选择', style: filterControlStyle, options: insuranceStatusOptions, value: _compulsoryInsurance[0], onChange: _compulsoryInsurance[1], allowClear: true, dropdownStyle: selectDropdownStyle })),
			renderFilterField('停车场', React.createElement(Select, { placeholder: '请选择或输入', style: filterControlStyle, options: parkingOptions, value: _parkingFilter[0], onChange: _parkingFilter[1], allowClear: true, showSearch: true, filterOption: vmSelectFilterOption, dropdownStyle: selectDropdownStyle })),
			renderFilterField('定位城市', React.createElement(Cascader, { options: regionOptions, placeholder: '请选择省-市', style: filterControlStyle, value: _areaRegion[0].length ? _areaRegion[0] : undefined, onChange: function (v) { _areaRegion[1](v || []); }, allowClear: true, changeOnSelect: true }))
		];
	};

	var opsManagerModalMode = _opsManagerModalMode[0];
	var opsManagerModalOpen = opsManagerModalMode === 'single' || opsManagerModalMode === 'batch';
	var opsManagerModalIsBatch = opsManagerModalMode === 'batch';
	var opsManagerModalRecord = _opsManagerModalRecord[0];
	var opsManagerSelectOptions = opsManagerModalIsBatch
		? vmGetAllOpsManagerStaffSelectOptions()
		: (opsManagerModalRecord ? vmGetAllOpsManagerSelectOptions(opsManagerModalRecord) : []);
	var opsManagerBatchCount = (_opsManagerBatchIds[0] || []).length;

	return React.createElement(App, null,
		React.createElement('div', { className: 'vm-page' },
			React.createElement('style', null, VM_PAGE_STYLE),
			React.createElement('div', { className: 'vm-list-topbar' },
				React.createElement(Button, { type: 'default', className: 'vm-btn-req', icon: VM_ICONS.doc, onClick: function () { _requirementModalVisible[1](true); }, 'aria-label': '查看需求说明' }, '查看需求说明')
			),

			React.createElement(Card, { className: 'lc-filter-card', title: '筛选条件', bordered: false },
				React.createElement('div', { className: 'lc-filter-grid' }, (function () {
					var items = buildFilterFields();
					var limit = _filterExpanded[0] ? items.length : 4;
					var out = [];
					for (var i = 0; i < limit && i < items.length; i++) out.push(items[i]);
					return out;
				})()),
				React.createElement('div', { className: 'lc-filter-actions' },
					buildFilterFields().length > 4 ? React.createElement(Button, { type: 'link', size: 'small', onClick: function () { _filterExpanded[1](!_filterExpanded[0]); }, style: { marginRight: 'auto', paddingLeft: 0 } }, _filterExpanded[0] ? '收起' : '展开更多筛选项') : null,
					React.createElement(Button, { onClick: handleFilterReset, style: { borderRadius: 8 } }, '重置'),
					React.createElement(Button, { type: 'primary', icon: VM_ICONS.search, onClick: handleFilterQuery, style: VM_PRIMARY_BTN_STYLE }, '查询')
				)
			),

			React.createElement('div', { className: 'lc-alert-stats-row' },
				VM_KPI_CARD_DEFS.map(function (card) { return renderKpiCard(card); })
			),

			React.createElement('div', { className: 'lc-table-section' },
				React.createElement('div', { className: 'lc-table-toolbar' },
					React.createElement('div', { className: 'lc-table-toolbar-actions' },
						React.createElement(Button, { icon: VM_ICONS.export, onClick: handleExport, style: { borderRadius: 8 } }, '导出'),
						React.createElement(Button, { icon: VM_ICONS.upload, onClick: handleBatchImport, style: { borderRadius: 8 } }, '批量导入')
					)
				),
				React.createElement('div', { className: 'lc-table-card' },
					React.createElement(Table, {
						className: 'lc-list-table',
						rowKey: 'id',
						columns: columns,
						dataSource: displayDataSource,
						scroll: { x: 3490 },
						size: 'middle',
						locale: { emptyText: emptyNode },
						pagination: { total: listTotal, showSizeChanger: true, showQuickJumper: true, showTotal: function (t) { return '共 ' + t + ' 条记录'; }, defaultPageSize: 10, pageSizeOptions: ['10', '20', '50'] }
					})
				)
			),

			React.createElement(Modal, {
				title: '批量导入车辆',
				open: _batchImportModalVisible[0],
				wrapClassName: 'vm-modal-wrap vm-import-modal-wrap',
				onCancel: closeBatchImportModal,
				footer: [
					React.createElement(Button, { key: 'close', className: 'vm-import-close-btn', onClick: closeBatchImportModal }, '关闭')
				],
				width: 560
			},
				React.createElement('div', { className: 'vm-import-modal' },
					React.createElement('section', { className: 'vm-import-step-card', 'aria-label': '下载导入模板' },
						React.createElement('div', { className: 'vm-import-step-head' },
							React.createElement('span', { className: 'vm-import-step-badge', 'aria-hidden': true }, '1'),
							React.createElement('span', { className: 'vm-import-step-title' }, '下载导入模板')
						),
						React.createElement(Button, {
							type: 'primary',
							className: 'vm-import-download-btn',
							icon: VM_ICONS.export,
							onClick: downloadVehicleImportTemplate,
							style: VM_PRIMARY_BTN_STYLE
						}, '下载车辆导入模板')
					),
					React.createElement('section', { className: 'vm-import-step-card', 'aria-label': '上传导入文件' },
						React.createElement('div', { className: 'vm-import-step-head' },
							React.createElement('span', { className: 'vm-import-step-badge', 'aria-hidden': true }, '2'),
							React.createElement('span', { className: 'vm-import-step-title' }, '上传填写好的文件')
						),
						React.createElement(Upload.Dragger, {
							className: 'vm-import-uploader',
							accept: '.csv,.xls,.xlsx',
							multiple: false,
							beforeUpload: handleVehicleImportUpload,
							showUploadList: false
						},
							React.createElement('div', { className: 'vm-import-upload-icon', 'aria-hidden': true }, VM_ICONS.upload),
							React.createElement('p', { className: 'vm-import-upload-title' }, '点击或拖拽文件到此处上传'),
							React.createElement('p', { className: 'vm-import-upload-hint' }, '支持 .csv、.xls、.xlsx')
						)
					),
					_batchImportResult[0] && _batchImportResult[0].hasFailed ? React.createElement('div', { className: 'vm-import-fail', role: 'alert' },
						React.createElement('div', { className: 'vm-import-fail-title' }, '校验未通过（共 ' + _batchImportResult[0].failedList.length + ' 条）'),
						_batchImportResult[0].failedList.slice(0, 6).map(function (item, idx) {
							return React.createElement('div', { key: idx, className: 'vm-import-fail-item' },
								'第 ', item.rowNo, ' 行：', item.plateNo, ' / ', item.vin, ' — ', item.reason
							);
						}),
						_batchImportResult[0].failedList.length > 6 ? React.createElement('div', { className: 'vm-import-fail-item', style: { color: '#94a3b8' } }, '……还有 ', _batchImportResult[0].failedList.length - 6, ' 条') : null,
						React.createElement(Button, { type: 'link', size: 'small', onClick: downloadVehicleImportFailedCsv, style: { paddingLeft: 0, marginTop: 4, minHeight: 44 } }, '下载失败明细')
					) : null
				)
			),

			React.createElement(Modal, {
				title: opsManagerModalIsBatch ? '批量设置运维负责人' : '设置运维负责人',
				open: opsManagerModalOpen,
				wrapClassName: 'vm-modal-wrap',
				width: 560,
				onCancel: closeOpsManagerModal,
				destroyOnClose: true,
				footer: [
					React.createElement(Button, { key: 'cancel', onClick: closeOpsManagerModal }, '取消'),
					React.createElement(Button, { key: 'submit', type: 'primary', onClick: saveOpsManagers, style: VM_PRIMARY_BTN_STYLE }, opsManagerModalIsBatch ? '批量提交' : '提交')
				]
			},
				React.createElement('div', { className: 'vm-ops-manager-modal-body' },
					opsManagerModalIsBatch ? React.createElement('div', { className: 'vm-ops-manager-modal-card' },
						React.createElement('div', { className: 'vm-ops-manager-modal-card-row' },
							React.createElement('span', { className: 'vm-ops-manager-modal-card-label' }, '适用范围'),
							React.createElement('span', { className: 'vm-ops-manager-modal-card-value' }, '当前搜索结果，共 ' + opsManagerBatchCount + ' 辆车')
						)
					) : null,
					React.createElement('div', { className: 'vm-ops-manager-modal-field' },
						React.createElement('label', { className: 'vm-ops-manager-modal-field-label', htmlFor: 'vm-ops-manager-select' }, '运维负责人'),
						React.createElement(Select, {
							id: 'vm-ops-manager-select',
							mode: 'multiple',
							style: { width: '100%' },
							placeholder: '请选择或输入姓名搜索',
							value: _opsManagerDraftSelected[0],
							options: opsManagerSelectOptions,
							onChange: function (vals) { _opsManagerDraftSelected[1](vals || []); },
							allowClear: true,
							showSearch: true,
							filterOption: vmSelectFilterOption,
							optionFilterProp: 'label',
							maxTagCount: 'responsive',
							dropdownStyle: selectDropdownStyle
						})
					)
				)
			),

			// 车辆上牌：上传/识别中
			React.createElement(Modal, {
				title: '上传行驶证',
				open: _uploadModalVisible[0],
				wrapClassName: 'vm-modal-wrap',
				onCancel: closeUploadModal,
				footer: [
					React.createElement(Button, { key: 'cancel', onClick: closeUploadModal }, '取消'),
					React.createElement(Button, { key: 'ok', type: 'primary', onClick: startOcrThenConfirm, style: VM_PRIMARY_BTN_STYLE }, '开始识别')
				]
			},
				React.createElement('div', { className: 'vm-modal-hint' }, '上传行驶证照片后将自动 OCR 识别车辆识别代码与车牌号'),
				React.createElement(Upload.Dragger, { accept: 'image/*', multiple: false, style: { borderRadius: 12 } },
					React.createElement('p', { className: 'ant-upload-drag-icon', style: { marginBottom: 8 } }, VM_ICONS.upload),
					React.createElement('p', { style: { margin: 0, fontWeight: 600, color: '#334155' } }, '点击或拖拽行驶证照片到此区域')
				)
			),

			React.createElement(Modal, {
				title: '识别中，请勿关闭页面',
				open: _ocrLoadingVisible[0],
				wrapClassName: 'vm-modal-wrap',
				footer: null,
				closable: false,
				maskClosable: false
			}, React.createElement('div', { style: { textAlign: 'center', padding: '24px 0' } }, '正在识别行驶证信息...')),

			React.createElement(Modal, {
				title: '确认上牌信息',
				open: _confirmModalVisible[0],
				wrapClassName: 'vm-modal-wrap',
				onCancel: closeConfirmModal,
				width: 640,
				footer: [
					React.createElement(Button, { key: 'cancel', onClick: closeConfirmModal }, '取消'),
					React.createElement(Button, { key: 'ok', type: 'primary', onClick: confirmPlate, style: VM_PRIMARY_BTN_STYLE }, '确认')
				]
			}, React.createElement('div', { style: { display: 'flex', gap: 24 } },
				React.createElement('div', { style: { flex: '0 0 240px' } },
					React.createElement('div', { style: { marginBottom: 8, color: '#666' } }, '行驶证照片'),
					React.createElement('img', { src: 'https://picsum.photos/240/160', alt: '行驶证', style: { width: '100%', borderRadius: 8 } })
				),
				React.createElement('div', { style: { flex: 1 } },
					React.createElement('div', { style: { marginBottom: 12 } },
						React.createElement('span', { style: { marginRight: 8 } }, '车辆识别代码'),
						React.createElement(Input, {
							value: _plateForm[0].vin,
							onChange: function (e) { onPlateFormChange('vin', e.target.value); },
							placeholder: '根据行驶证反写，可编辑',
							style: { width: '100%' }
						})
					),
					React.createElement('div', { style: { marginBottom: 12 } },
						React.createElement('span', { style: { marginRight: 8 } }, '车牌号'),
						React.createElement(Input, {
							value: _plateForm[0].plateNo,
							onChange: function (e) { onPlateFormChange('plateNo', e.target.value); },
							placeholder: '根据行驶证反写，可编辑',
							style: { width: '100%' }
						})
					),
					_plateError[0] ? React.createElement('div', { style: { color: '#ff4d4f', fontSize: 12 } }, _plateError[0]) : null
				)
			)),
			React.createElement(Modal, {
				title: '需求说明',
				open: _requirementModalVisible[0],
				wrapClassName: 'vm-modal-wrap',
				onCancel: function () { _requirementModalVisible[1](false); },
				width: 720,
				footer: React.createElement(Button, { onClick: function () { _requirementModalVisible[1](false); } }, '关闭')
			}, React.createElement('div', { className: 'vm-prd-content' }, requirementText)),

			React.createElement(Modal, {
				title: '编辑车辆信息',
				open: _editModalVisible[0],
				wrapClassName: 'vm-modal-wrap',
				onCancel: closeEditModal,
				width: 720,
				destroyOnClose: true,
				footer: [
					React.createElement(Button, { key: 'cancel', onClick: closeEditModal }, '取消'),
					React.createElement(Button, { key: 'save', type: 'primary', onClick: saveEdit, style: VM_PRIMARY_BTN_STYLE }, '保存')
				]
			}, _editRecord[0] ? React.createElement('div', null,
				React.createElement('div', { className: 'vm-edit-banner' },
					'车牌号：', React.createElement('span', { style: { fontWeight: 600, color: 'rgba(0,0,0,0.85)' } }, vmDisplayFieldText(_editRecord[0].plateNo)),
					'　识别代码：', React.createElement('span', { style: { color: 'rgba(0,0,0,0.85)' } }, vmDisplayFieldText(_editRecord[0].vin))
				),
				React.createElement(Form, { layout: 'vertical' },
					React.createElement(Row, { gutter: 16 },
						React.createElement(Col, { span: 12 },
							React.createElement(Form.Item, { label: '车辆归属停车场', required: true },
								React.createElement(Select, {
									placeholder: '请选择停车场',
									style: { width: '100%' },
									options: parkingOptions,
									value: _editForm[0].parking,
									onChange: function (v) { onEditFormChange('parking', v); },
									allowClear: true,
									showSearch: true,
									filterOption: function (input, opt) { return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1; }
								})
							)
						),
						React.createElement(Col, { span: 12 },
							React.createElement(Form.Item, { label: '运营状态', required: true },
								React.createElement(Select, {
									placeholder: '请选择运营状态',
									style: { width: '100%' },
									options: operateStatusOptions,
									value: _editForm[0].operateStatus,
									onChange: function (v) { onEditFormChange('operateStatus', v); }
								})
							)
						),
						React.createElement(Col, { span: 12 },
							React.createElement(Form.Item, { label: '车辆状态', required: true },
								React.createElement(Select, {
									placeholder: '请选择车辆状态',
									style: { width: '100%' },
									options: vehicleStatusOptions,
									value: _editForm[0].vehicleStatus,
									onChange: function (v) { onEditFormChange('vehicleStatus', v); }
								})
							)
						),
						React.createElement(Col, { span: 12 },
							React.createElement(Form.Item, { label: '登记所有权' },
								React.createElement(Input, {
									placeholder: '请输入登记所有权',
									value: _editForm[0].ownership || '',
									onChange: function (e) { onEditFormChange('ownership', e.target.value); },
									allowClear: true
								})
							)
						),
						React.createElement(Col, { span: 12 },
							React.createElement(Form.Item, { label: '运营公司' },
								React.createElement(Select, {
									placeholder: '请选择运营公司',
									style: { width: '100%' },
									options: operateCompanyOptions,
									value: _editForm[0].operateCompany,
									onChange: function (v) { onEditFormChange('operateCompany', v); },
									allowClear: true,
									showSearch: true,
									filterOption: function (input, opt) { return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1; }
								})
							)
						),
						React.createElement(Col, { span: 12 },
							React.createElement(Form.Item, { label: '车辆来源' },
								React.createElement(Select, {
									placeholder: '请选择车辆来源',
									style: { width: '100%' },
									options: vehicleSourceOptions,
									value: _editForm[0].vehicleSource,
									onChange: function (v) { onEditFormChange('vehicleSource', v); },
									allowClear: true
								})
							)
						),
						React.createElement(Col, { span: 12 },
							React.createElement(Form.Item, { label: '租赁公司' },
								React.createElement(Input, {
									placeholder: '请输入租赁公司，无则留空',
									value: _editForm[0].leaseCompany || '',
									onChange: function (e) { onEditFormChange('leaseCompany', e.target.value); },
									allowClear: true
								})
							)
						),
						React.createElement(Col, { span: 12 },
							React.createElement(Form.Item, { label: '出厂年份' },
								React.createElement(Select, {
									placeholder: '请选择出厂年份',
									style: { width: '100%' },
									options: yearOptions,
									value: _editForm[0].year,
									onChange: function (v) { onEditFormChange('year', v); },
									allowClear: true
								})
							)
						),
						React.createElement(Col, { span: 12 },
							React.createElement(Form.Item, { label: '采购入库时间', extra: '格式：YYYY-MM-DD' },
								React.createElement(Input, {
									placeholder: '请输入采购入库时间',
									value: _editForm[0].purchaseDate || '',
									onChange: function (e) { onEditFormChange('purchaseDate', e.target.value); },
									allowClear: true
								})
							)
						)
					)
				)
			) : null)
		)
	);
};
