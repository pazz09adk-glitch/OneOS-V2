/**
 * ONE-OS · Ant Design Table 全局修复（内联样式片段）
 *
 * 独立 JSX 原型页无构建入口时，将本数组 concat 到 PAGE_STYLE 首部：
 *   var PAGE_STYLE = ONEOS_ANT_TABLE_GLOBAL_FIX.concat([ ...pageRules ]).join('\n');
 *
 * 与 web端/styles/ant-table-global-fix.css 保持同步。
 */
var ONEOS_ANT_TABLE_GLOBAL_FIX = [
	'.ant-table-container .ant-table-header { margin-bottom: 0 !important; }',
	'.ant-table-container .ant-table-body { margin-top: 0 !important; }',
	'.ant-table-container .ant-table-body > table, .ant-table-content table { margin-top: 0 !important; }',
	'.ant-table-tbody > tr.ant-table-measure-row, .ant-table-tbody > tr.ant-table-measure-row > td, .ant-table-tbody > tr.ant-table-measure-row > th { display: none !important; height: 0 !important; max-height: 0 !important; min-height: 0 !important; padding: 0 !important; margin: 0 !important; border: none !important; line-height: 0 !important; font-size: 0 !important; overflow: hidden !important; visibility: hidden !important; pointer-events: none !important; }'
];
