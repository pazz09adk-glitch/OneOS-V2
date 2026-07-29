// 【重要】必须使用 const Component 作为组件变量名
// ONEOS-web - 运维管理 - 车辆业务 - 故障管理（列表与表单）

const Component = function () {
	var useState = React.useState;
	var useEffect = React.useEffect;

	var antd = window.antd;
	var Table = antd.Table;
	var Button = antd.Button;
	var Space = antd.Space;
	var Input = antd.Input;
	var Select = antd.Select;
	var DatePicker = antd.DatePicker;
	var Form = antd.Form;
	var Row = antd.Row;
	var Col = antd.Col;
	var Divider = antd.Divider;
	var Breadcrumb = antd.Breadcrumb;
	var Layout = antd.Layout;
	var message = antd.message;
	var Tag = antd.Tag;
	var Card = antd.Card;
	var Modal = antd.Modal;
	var Tabs = antd.Tabs;
	var Tooltip = antd.Tooltip;
	var RangePicker = DatePicker.RangePicker;

	var _filterFormInst = Form.useForm();
	var filterForm = _filterFormInst[0];

	var _specOpen = useState(false);
	var specModalOpen = _specOpen[0];
	var setSpecModalOpen = _specOpen[1];

	var _listTab = useState('pending');
	var listTab = _listTab[0];
	var setListTab = _listTab[1];

	var _tableRows = useState(null);
	var tableRowsOverride = _tableRows[0];
	var setTableRowsOverride = _tableRows[1];

	var faultLevelOptions = [
		{ label: 'L1-特急', value: '特急' },
		{ label: 'L2-紧急', value: '紧急' },
		{ label: 'L3-一般', value: '一般' },
		{ label: 'L4-提示', value: '提示' }
	];

	var lastOperatorOptions = [
		{ label: '王婷婷', value: '王婷婷' },
		{ label: '刘若楠', value: '刘若楠' },
		{ label: '陈嘉豪', value: '陈嘉豪' },
		{ label: '赵海峰', value: '赵海峰' }
	];

	// 故障类型枚举
	var faultTypeOptions = [
		{ label: '底盘故障', value: '底盘故障' },
		{ label: '三电故障', value: '三电故障' },
		{ label: '整车系统', value: '整车系统' },
		{ label: '燃料电池系统故障', value: '燃料电池系统故障' },
		{ label: '供氢系统故障', value: '供氢系统故障' },
		{ label: '空调系统故障', value: '空调系统故障' },
		{ label: '冷机故障', value: '冷机故障' },
		{ label: '其他故障', value: '其他故障' }
	];

	// 解决情况枚举
	var resolveStatusOptions = [
		{ label: '未解决', value: '未解决' },
		{ label: '临时排故', value: '临时排故' },
		{ label: '已解决', value: '已解决' }
	];

	var SearchIcon = function() { return React.createElement('svg', { viewBox: '0 0 1024 1024', width: 14, height: 14, fill: 'currentColor' }, React.createElement('path', { d: 'M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z' })); };
	var FileTextIcon = function() { return React.createElement('svg', { viewBox: '0 0 1024 1024', width: 16, height: 16, fill: 'currentColor' }, React.createElement('path', { d: 'M854.6 288.7L639.4 73.4c-6-6-14.2-9.4-22.7-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216c0 22.1 17.9 40 40 40h216v494zM504 618H320c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h184c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM702 458H320c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h382c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z' })); };
	var ResetIcon = function() { return React.createElement('svg', { viewBox: '0 0 1024 1024', width: 14, height: 14, fill: 'currentColor' }, React.createElement('path', { d: 'M793 242H366v-74c0-6.7-7.7-10.4-12.9-6.3l-142 112a8 8 0 000 12.6l142 112c5.2 4.1 12.9.4 12.9-6.3v-74h415v470H175c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h618c35.3 0 64-28.7 64-64V306c0-35.3-28.7-64-64-64z' })); };
	var PlusIcon = function() { return React.createElement('svg', { viewBox: '0 0 1024 1024', width: 14, height: 14, fill: 'currentColor' }, React.createElement('path', { d: 'M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z' }), React.createElement('path', { d: 'M192 474h672q8 0 8 8v60q0 8-8 8H192q-8 0-8-8v-60q0-8 8-8z' })); };
	var DownloadIcon = function() { return React.createElement('svg', { viewBox: '0 0 1024 1024', width: 16, height: 16, fill: 'currentColor' }, React.createElement('path', { d: 'M505.7 661a8 8 0 0012.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z' })); };
	var ListIcon = function() { return React.createElement('svg', { viewBox: '0 0 48 48', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 4, strokeLinecap: 'butt', strokeLinejoin: 'miter' }, React.createElement('path', { d: 'M17 12H42' }), React.createElement('path', { d: 'M17 24H42' }), React.createElement('path', { d: 'M17 36H42' }), React.createElement('path', { d: 'M8 12H9' }), React.createElement('path', { d: 'M8 24H9' }), React.createElement('path', { d: 'M8 36H9' })); };
	var UploadIcon = function() { return React.createElement('svg', { viewBox: '0 0 1024 1024', width: 14, height: 14, fill: 'currentColor' }, React.createElement('path', { d: 'M512 256l-256 256h160v256h192V512h160L512 256zM256 832v64h512v-64H256z' })); };

	var levelLabelMap = { 特急: 'L1-特急', 紧急: 'L2-紧急', 一般: 'L3-一般', 提示: 'L4-提示' };
	var renderFaultLevel = function (text) {
		var color = 'default';
		if (text === '特急') color = 'red';
		else if (text === '紧急') color = 'orange';
		else if (text === '一般') color = 'blue';
		else if (text === '提示') color = 'green';
		var label = levelLabelMap[text] || text;
		return React.createElement(Tag, { color: color }, label);
	};

	var renderResolveStatus = function (text) {
		var dot = '#86909c';
		if (text === '已解决') dot = '#00b42a';
		else if (text === '临时排故') dot = '#ff7d00';
		else if (text === '未解决') dot = '#f53f3f';
		return React.createElement(Space, { size: 6 },
			React.createElement('span', { style: { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: dot } }),
			React.createElement('span', null, text)
		);
	};

	var columns = [
		{ title: '故障编码', dataIndex: 'code', key: 'code', width: 132, fixed: 'left' },
		{ title: '解决情况', dataIndex: 'status', key: 'status', width: 120, render: renderResolveStatus },
		{ title: '车牌号码', dataIndex: 'plate', key: 'plate', width: 112 },
		{ title: '车辆品牌', dataIndex: 'brand', key: 'brand', width: 100, ellipsis: true },
		{ title: '车辆型号', dataIndex: 'model', key: 'model', width: 100, ellipsis: true },
		{ title: '运营公司', dataIndex: 'company', key: 'company', width: 140, ellipsis: true },
		{ title: '故障等级', dataIndex: 'level', key: 'level', width: 108, render: renderFaultLevel },
		{ title: '故障类型', dataIndex: 'type', key: 'type', width: 128, ellipsis: true },
		{
			title: '故障描述',
			dataIndex: 'desc',
			key: 'desc',
			width: 200,
			ellipsis: { showTitle: false },
			render: function (text) {
				return React.createElement(Tooltip, { placement: 'topLeft', title: text },
					React.createElement('span', { style: { cursor: 'default' } }, text)
				);
			}
		},
		{ title: '故障上报时间', dataIndex: 'reportTime', key: 'reportTime', width: 176, ellipsis: true, className: 'fault-col-report-time' },
		{ title: '最后操作时间', dataIndex: 'lastOperationTime', key: 'lastOperationTime', width: 176, ellipsis: true },
		{ title: '最后操作人', dataIndex: 'lastOperator', key: 'lastOperator', width: 104, ellipsis: true },
		{
			title: '操作',
			key: 'action',
			fixed: 'right',
			width: listTab === 'history' ? 72 : 104,
			render: function (_, record) {
				if (listTab === 'history') {
					return React.createElement(Button, { type: 'link', size: 'small', style: { padding: '0 4px' }, onClick: function () { handleView(record); } }, '查看');
				}
				return React.createElement(Space, { size: 0, split: React.createElement('span', { style: { color: '#e5e6eb' } }, '|') },
					React.createElement(Button, { type: 'link', size: 'small', style: { padding: '0 4px' }, onClick: function () { handleView(record); } }, '查看'),
					React.createElement(Button, { type: 'link', size: 'small', style: { padding: '0 4px' }, onClick: function () { handleEdit(record); } }, '编辑')
				);
			}
		}
	];

	var ALL_DATA = [
		{ key: '1', code: 'F-2024-001', plate: '沪A12345', brand: '一汽解放', model: 'J6P', company: '上海羚牛', type: '底盘故障', level: '紧急', source: '客户报告', status: '未解决', reportTime: '2024-05-10 08:30:00', lastOperator: '王婷婷', lastOperationTime: '2024-05-10 09:00:00', desc: '车辆重载下制动踏板偏软，制动距离明显变长' },
		{ key: '2', code: 'F-2024-002', plate: '浙B88888', brand: '东风商用车', model: '天龙', company: '浙江羚牛', type: '三电故障', level: '特急', source: '司机操作问题', status: '临时排故', reportTime: '2024-05-11 14:15:00', lastOperator: '刘若楠', lastOperationTime: '2024-05-11 16:20:00', desc: '高压系统绝缘报警频繁触发，车辆进入限扭模式' },
		{ key: '3', code: 'F-2024-003', plate: '苏C66666', brand: '福田欧曼', model: 'EST', company: '苏州冷链速运有限公司', type: '整车系统', level: '一般', source: '定期保养', status: '已解决', reportTime: '2024-05-12 10:00:00', lastOperator: '陈嘉豪', lastOperationTime: '2024-05-12 11:30:00', desc: '后桥轮胎偏磨，建议更换并做四轮定位' },
		{ key: '4', code: 'F-2024-004', plate: '沪D99999', brand: '陕汽重卡', model: '德龙', company: '上海城配物流有限公司', type: '空调系统故障', level: '提示', source: '客户报告', status: '已解决', reportTime: '2024-05-13 09:45:00', lastOperator: '赵海峰', lastOperationTime: '2024-05-13 10:10:00', desc: '空调制冷效果差，出风口温度偏高' }
	];

	var parseReportTime = function (str) {
		if (!str) return null;
		var p = str.replace(/-/g, '/');
		var t = new Date(p);
		return isNaN(t.getTime()) ? null : t;
	};

	var applyListFilter = function () {
		var v = filterForm.getFieldsValue();
		var rows = ALL_DATA.filter(function (r) {
			if (listTab === 'pending') return r.status !== '已解决';
			return r.status === '已解决';
		});
		if (v.filterPlate && String(v.filterPlate).trim()) {
			var q = String(v.filterPlate).trim();
			rows = rows.filter(function (r) { return (r.plate || '').indexOf(q) !== -1; });
		}
		if (v.filterLevels && v.filterLevels.length) {
			rows = rows.filter(function (r) { return v.filterLevels.indexOf(r.level) !== -1; });
		}
		if (v.filterTypes && v.filterTypes.length) {
			rows = rows.filter(function (r) { return v.filterTypes.indexOf(r.type) !== -1; });
		}
		if (v.filterLastOperator) {
			rows = rows.filter(function (r) { return r.lastOperator === v.filterLastOperator; });
		}
		if (v.filterDateRange && v.filterDateRange.length === 2 && v.filterDateRange[0] && v.filterDateRange[1]) {
			var start = v.filterDateRange[0];
			var end = v.filterDateRange[1];
			var startMs = start.valueOf ? start.valueOf() : new Date(start).getTime();
			var endMs = end.valueOf ? end.valueOf() : new Date(end).getTime();
			var startDay = new Date(startMs);
			startDay.setHours(0, 0, 0, 0);
			startMs = startDay.getTime();
			var endDay = new Date(endMs);
			endDay.setHours(23, 59, 59, 999);
			endMs = endDay.getTime();
			rows = rows.filter(function (r) {
				var rt = parseReportTime(r.reportTime);
				if (!rt) return false;
				var m = rt.getTime();
				return m >= startMs && m <= endMs;
			});
		}
		setTableRowsOverride(rows);
	};

	useEffect(function () {
		applyListFilter();
	}, [listTab]);

	var displayData = tableRowsOverride !== null && tableRowsOverride !== undefined
		? tableRowsOverride
		: ALL_DATA.filter(function (r) {
			if (listTab === 'pending') return r.status !== '已解决';
			return r.status === '已解决';
		});

	var handleCreate = function () {
		message.info('跳转到新增故障页面');
	};

	var handleEdit = function (record) {
		message.info('跳转到编辑故障页面');
	};

	var handleView = function (record) {
		message.info('跳转到查看故障页面');
	};


	var formItemLayout = {
		labelAlign: 'left',
		colon: false,
		labelCol: { flex: '0 0 100px' },
		wrapperCol: { flex: '1 1 0' }
	};

	var specSection = function (title, children) {
		return React.createElement('div', { style: { marginBottom: 16 } },
			React.createElement('div', { style: { fontWeight: 600, color: '#1d2129', marginBottom: 8, fontSize: 14 } }, title),
			children
		);
	};
	var specLine = function (text) {
		return React.createElement('div', { style: { fontSize: 13, color: '#4e5969', lineHeight: 1.75, paddingLeft: 0 } }, text);
	};

	var renderSpecModal = function () {
		return React.createElement(Modal, {
			title: '故障列表页 — 需求说明',
			open: specModalOpen,
			onCancel: function () { setSpecModalOpen(false); },
			footer: React.createElement(Button, { type: 'primary', onClick: function () { setSpecModalOpen(false); } }, '知道了'),
			width: 720,
			centered: true,
			destroyOnClose: true
		},
			React.createElement('div', { style: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 } },
				specSection('2. 故障列表页', React.createElement(React.Fragment, null,
					specLine('用于展示待处理与历史记录，支持多条件检索、查看、编辑、删除、导入导出。')
				)),
				specSection('2.1 顶部筛选区（支持单条件或多条件组合）', React.createElement(React.Fragment, null,
					specLine('2.1.1 车牌号：输入框，支持模糊搜索；'),
					specLine('2.1.2 故障等级：多选下拉，选项：L1-特急、L2-紧急、L3-一般、L4-提示；'),
					specLine('2.1.3 上报时间：日期范围选择（开始~结束）；'),
					specLine('2.1.4 故障类型：多选下拉，选项为故障类型枚举；'),
					specLine('2.1.5 最后操作人：下拉选择器；'),
					specLine('2.1.6 查询按钮：执行筛选；'),
					specLine('2.1.7 重置按钮：清空筛选条件。')
				)),
				specSection('2.2 列表工具栏', React.createElement(React.Fragment, null,
					specLine('2.2.1 新建：进入故障表单页；'),
					specLine('2.2.2 导出：导出当前筛选结果；'),
					specLine('2.2.3 导入：批量导入故障数据；'),
					specLine('2.2.4 展示设置：字段展示配置（当前版本可预留）。')
				)),
				specSection('2.3 Tab分区', React.createElement(React.Fragment, null,
					specLine('2.3.1 待处理；'),
					specLine('2.3.2 历史记录。')
				)),
				specSection('2.4 列表字段展示（当前版本）', React.createElement(React.Fragment, null,
					specLine('故障编码、解决情况、车牌号码、车辆品牌、车辆型号、运营公司、故障等级、故障类型、故障描述（省略展示，悬停显示完整）、故障上报时间、最后操作时间、最后操作人、操作（待处理：查看/编辑；历史记录：仅查看）。'),
					specLine('说明：车辆识别代码不在列表展示，仅在表单车辆信息中展示。')
				)),
				specSection('2.5 状态与操作规则', React.createElement(React.Fragment, null,
					specLine('2.5.1 解决情况状态值：临时排故、已解决、未解决；'),
					specLine('2.5.2 操作列：待处理 Tab 为查看、编辑（无删除）；历史记录 Tab 仅查看；'),
					specLine('2.5.3 分页：每页10条（固定分页）。')
				))
			)
		);
	};

	return React.createElement(Layout, { className: 'arco-theme-overrides', style: { minHeight: '100vh', background: '#f2f3f5', fontFamily: 'Inter, Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif' } },
		React.createElement('style', null, `
			.arco-theme-overrides .ant-btn { border-radius: 4px; }
			.arco-theme-overrides .ant-btn-primary { background-color: #165dff; border-color: #165dff; }
			.arco-theme-overrides .ant-btn-primary:hover { background-color: #4080ff; border-color: #4080ff; }
			.arco-theme-overrides .ant-btn-link { color: #165dff; }
			.arco-theme-overrides .ant-btn-link:hover { background-color: transparent; color: #4080ff; }
			
			.arco-theme-overrides .ant-table-thead > tr > th {
				background-color: #f2f3f5;
				color: #909399;
				font-weight: 400;
				font-size: 14px;
				height: 40px;
				padding: 9px 16px;
				line-height: 22px;
				box-sizing: border-box;
				border-bottom: 1px solid #e5e6eb;
				border-top: none;
				vertical-align: middle;
			}
			.arco-theme-overrides .ant-table-thead > tr > th .ant-table-column-title {
				font-size: 14px;
				color: #909399;
				line-height: 22px;
				min-height: 22px;
				white-space: nowrap;
			}
			.arco-theme-overrides .ant-table-thead > tr > th::before { display: none !important; }
			.arco-theme-overrides .ant-table-tbody > tr > td { border-bottom: 1px solid #e5e6eb; padding: 13px 16px; color: #4e5969; vertical-align: middle; line-height: 22px; }
			.arco-theme-overrides .ant-table-tbody > tr { height: 52px; }
			.arco-theme-overrides .customer-table-scroll-wrap { width: 100%; min-width: 0; max-width: 100%; }
			.arco-theme-overrides .ant-table-wrapper { border: none; }
			.arco-theme-overrides .ant-table { border: none; }
			.arco-theme-overrides .ant-table-container { border: none; }
			.arco-theme-overrides .ant-table-pagination.ant-pagination { margin: 16px 0 0 0; }
			
			.arco-theme-overrides .ant-card { border: none; border-radius: 4px; }
			.arco-theme-overrides .customer-page-card.ant-card { border: 1px solid #e5e6eb !important; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); background: #fff; }
			.arco-theme-overrides .customer-page-card .ant-card-body { padding: 20px 24px 24px; }
			
			.arco-theme-overrides .ant-input, .arco-theme-overrides .ant-select-selector, .arco-theme-overrides .ant-picker, .arco-theme-overrides .ant-input-affix-wrapper { border-radius: 2px; border: 1px solid #e5e6eb; background-color: #fff; transition: all 0.1s cubic-bezier(0, 0, 1, 1); }
			.arco-theme-overrides .ant-input:hover, .arco-theme-overrides .ant-select:not(.ant-select-disabled):hover .ant-select-selector, .arco-theme-overrides .ant-picker:hover, .arco-theme-overrides .ant-input-affix-wrapper:hover { background-color: #fff; border-color: #165dff; }
			.arco-theme-overrides .ant-input:focus, .arco-theme-overrides .ant-input-focused, .arco-theme-overrides .ant-select-focused .ant-select-selector, .arco-theme-overrides .ant-picker-focused, .arco-theme-overrides .ant-input-affix-wrapper-focused { background-color: #fff; border: 1px solid #165dff !important; box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2) !important; outline: 0; }
			
			.arco-theme-overrides .ant-breadcrumb { color: #86909c; font-size: 14px; white-space: nowrap; flex-shrink: 0; }
			.arco-theme-overrides .customer-page-header-row { display: flex; align-items: center; flex-wrap: nowrap; gap: 0; margin-bottom: 20px; }
			.arco-theme-overrides .ant-breadcrumb a { color: #4e5969; }
			.arco-theme-overrides .ant-breadcrumb a:hover { color: #165dff; background-color: transparent; }
			
			.arco-theme-overrides .ant-form-item-label { padding: 0 16px 0 0 !important; line-height: 32px; height: 32px; display: flex; align-items: center; }
			.arco-theme-overrides .ant-form-item-control { display: flex; align-items: center; line-height: 32px; min-height: 32px; }
			.arco-theme-overrides .ant-form-item-control-input { min-height: 32px; width: 100%; display: flex; align-items: center; }
			.arco-theme-overrides .ant-form-item-control-input-content { display: flex; align-items: center; width: 100%; height: 100%; }
			.arco-theme-overrides .ant-select { width: 100%; height: 32px; }
			.arco-theme-overrides .ant-select-selector { height: 32px !important; min-height: 32px !important; display: flex; align-items: center; width: 100%; padding: 0 12px; }
			.arco-theme-overrides .ant-input { height: 32px; padding: 4px 12px; }
			.arco-theme-overrides .ant-input-affix-wrapper { height: 32px; padding: 0 12px; display: flex; align-items: center; }
			.arco-theme-overrides .ant-input-affix-wrapper > input.ant-input,
			.arco-theme-overrides .ant-input-affix-wrapper > input.ant-input:focus,
			.arco-theme-overrides .ant-input-affix-wrapper > input.ant-input:hover { height: 100%; padding: 0; border: none !important; box-shadow: none !important; outline: none !important; background-color: transparent !important; }
			.arco-theme-overrides .ant-picker { height: 32px !important; min-height: 32px !important; display: flex; align-items: center; padding: 4px 12px; width: 100%; }
			.arco-theme-overrides .ant-form-item-label > label { color: #4e5969; white-space: nowrap; }
			.arco-theme-overrides .ant-form-item-label > label::after { display: none !important; content: "" !important; margin: 0 !important; }
			.arco-theme-overrides .ant-select-multiple .ant-select-selector { height: auto !important; min-height: 32px !important; align-items: center; padding-top: 2px; padding-bottom: 2px; }
			.arco-theme-overrides .fault-col-report-time { white-space: nowrap; }
		`),
		React.createElement('div', { style: { padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', flex: 1 } },
			React.createElement(Card, { className: 'customer-page-card', bordered: false },
				React.createElement('div', { className: 'customer-page-header-row', style: { marginBottom: 16, justifyContent: 'space-between', width: '100%' } },
					React.createElement(Breadcrumb, { 
						separator: React.createElement('span', { style: { color: '#c9cdd4' } }, '/'),
						items: [
							{ title: React.createElement(ListIcon, { style: { display: 'inline-flex', alignItems: 'center', fontSize: 14, transform: 'translate(-2px, 1px)' } }) }, 
							{ title: '运维管理' }, 
							{ title: '车辆业务' },
							{ title: React.createElement('span', { style: { color: '#1d2129', fontWeight: 700, fontSize: 16, lineHeight: '22px' } }, '故障管理') }
						] 
					}),
					React.createElement(Button, {
						type: 'link',
						icon: React.createElement(FileTextIcon, null),
						style: { display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px', color: '#165dff', fontWeight: 500 },
						onClick: function () { setSpecModalOpen(true); }
					}, '查看需求说明')
				),
				React.createElement('div', { style: { fontSize: 18, fontWeight: 600, color: '#1d2129', lineHeight: '26px', marginBottom: 20 } }, '故障管理'),
				
				// 搜索表单区域
				React.createElement('div', { style: { marginBottom: 0 } },
					React.createElement(Row, { style: { flexWrap: 'nowrap', alignItems: 'stretch' } },
						React.createElement(Col, { flex: 1, style: { minWidth: 0, paddingRight: 40 } },
							React.createElement(Form, Object.assign({ layout: 'horizontal', form: filterForm }, formItemLayout),
								React.createElement(Row, { gutter: 24, style: { rowGap: 0 } },
									React.createElement(Col, { span: 8 },
										React.createElement(Form.Item, { name: 'filterPlate', label: '车牌号', style: { marginBottom: 16 } },
											React.createElement(Input, { placeholder: '支持模糊搜索', allowClear: true })
										)
									),
									React.createElement(Col, { span: 8 },
										React.createElement(Form.Item, { name: 'filterLevels', label: '故障等级', style: { marginBottom: 16 } },
											React.createElement(Select, {
												mode: 'multiple',
												allowClear: true,
												placeholder: '多选：L1~L4',
												options: faultLevelOptions,
												maxTagCount: 'responsive'
											})
										)
									),
									React.createElement(Col, { span: 8 },
										React.createElement(Form.Item, { name: 'filterDateRange', label: '上报时间', style: { marginBottom: 16 } },
											React.createElement(RangePicker, { style: { width: '100%' }, showTime: false, placeholder: ['开始', '结束'] })
										)
									),
									React.createElement(Col, { span: 8 },
										React.createElement(Form.Item, { name: 'filterTypes', label: '故障类型', style: { marginBottom: 16 } },
											React.createElement(Select, {
												mode: 'multiple',
												allowClear: true,
												placeholder: '多选故障类型',
												options: faultTypeOptions,
												maxTagCount: 'responsive'
											})
										)
									),
									React.createElement(Col, { span: 8 },
										React.createElement(Form.Item, { name: 'filterLastOperator', label: '最后操作人', style: { marginBottom: 16 } },
											React.createElement(Select, {
												allowClear: true,
												placeholder: '请选择',
												options: lastOperatorOptions
											})
										)
									)
								)
							)
						),
						React.createElement(Divider, {
							type: 'vertical',
							style: {
								alignSelf: 'stretch',
								height: 'auto',
								minHeight: 100,
								borderLeftColor: 'rgb(229, 230, 235)',
								borderLeftStyle: 'dashed',
								marginLeft: 20,
								marginRight: 20
							}
						}),
						React.createElement(Col, { flex: 'none', style: { textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 100, maxWidth: 168 } },
							React.createElement(Space, { direction: 'vertical', size: 12, style: { width: '100%', alignItems: 'flex-end' } },
								React.createElement(Button, { type: 'primary', icon: React.createElement(SearchIcon, null), style: { display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', width: 86 }, onClick: function () { applyListFilter(); message.success('已按条件筛选'); } }, '查询'),
								React.createElement(Button, {
									icon: React.createElement(ResetIcon, null),
									style: { display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', width: 86 },
									onClick: function () {
										filterForm.resetFields();
										applyListFilter();
										message.info('已清空筛选条件');
									}
								}, '重置')
							)
						)
					)
				),
				React.createElement(Divider, { style: { margin: '16px 0 20px', borderColor: '#e5e6eb' } }),
				
				// 工具栏 + 表格
				React.createElement('div', { style: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 } },
					React.createElement(Row, { justify: 'space-between', align: 'middle', style: { marginBottom: 16 } },
						React.createElement(Col, null,
							React.createElement(Space, { size: 12 },
								React.createElement(Button, { type: 'primary', icon: React.createElement(PlusIcon, null), style: { display: 'flex', alignItems: 'center', gap: 6 }, onClick: handleCreate }, '新建'),
								React.createElement(Button, {
									style: { padding: '4px 10px', height: 32, display: 'flex', alignItems: 'center', gap: 6, color: '#4e5969' },
									onClick: function () { message.info('已导出当前筛选结果'); }
								}, React.createElement(DownloadIcon, null), React.createElement('span', null, '导出')),
								React.createElement(Button, { icon: React.createElement(UploadIcon, null), style: { display: 'flex', alignItems: 'center', gap: 6 }, onClick: function () { message.info('批量导入故障数据'); } }, '导入'),
								React.createElement(Button, { style: { color: '#4e5969' }, onClick: function () { message.info('字段展示配置（当前版本预留）'); } }, '展示设置')
							)
						),
						React.createElement(Col, null)
					),
					React.createElement(Tabs, {
						activeKey: listTab,
						onChange: function (k) {
							setListTab(k);
						},
						style: { marginBottom: 12 },
						items: [
							{ key: 'pending', label: '待处理' },
							{ key: 'history', label: '历史记录' }
						]
					}),
					React.createElement('div', { className: 'customer-table-scroll-wrap', style: { flex: 1, minHeight: 0, minWidth: 0 } },
						React.createElement(Table, {
							columns: columns,
							dataSource: displayData,
							pagination: {
								pageSize: 10,
								showSizeChanger: false,
								showTotal: function (total) { return '共 ' + total + ' 条'; }
							},
							scroll: { x: 2100 }
						})
					)
				)
			)
		),
		renderSpecModal()
	);
};

if (typeof module !== 'undefined' && module.exports) module.exports = Component;
