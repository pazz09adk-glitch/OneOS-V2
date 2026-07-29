// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 还车管理

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Select = antd.Select;
	var Button = antd.Button;
	var Table = antd.Table;
	var Tabs = antd.Tabs;
	var Modal = antd.Modal;
	var message = antd.message;
	var App = antd.App;

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	var contractOptions = [
		{ value: 'HT-ZL-2025-001', label: 'HT-ZL-2025-001' },
		{ value: 'HT-ZL-2025-002', label: 'HT-ZL-2025-002' },
		{ value: 'HT-ZL-2025-003', label: 'HT-ZL-2025-003' },
		{ value: 'HT-ZL-2025-004', label: 'HT-ZL-2025-004' }
	];
	var projectOptions = [
		{ value: '嘉兴氢能示范项目', label: '嘉兴氢能示范项目' },
		{ value: '上海物流租赁项目', label: '上海物流租赁项目' },
		{ value: '杭州城配租赁项目', label: '杭州城配租赁项目' }
	];
	var customerOptions = [
		{ value: '嘉兴某某物流有限公司', label: '嘉兴某某物流有限公司' },
		{ value: '上海某某运输公司', label: '上海某某运输公司' },
		{ value: '杭州某某租赁有限公司', label: '杭州某某租赁有限公司' }
	];
	var plateOptions = [
		{ value: '京A12345', label: '京A12345' },
		{ value: '沪B20001', label: '沪B20001' },
		{ value: '浙A88888', label: '浙A88888' },
		{ value: '浙F66666', label: '浙F66666' }
	];
	var vehicleTypeOptions = [
		{ value: '轻型厢式货车', label: '轻型厢式货车' },
		{ value: '重型厢式货车', label: '重型厢式货车' },
		{ value: '厢式货车', label: '厢式货车' },
		{ value: '平板货车', label: '平板货车' },
		{ value: '栏板货车', label: '栏板货车' },
		{ value: '小型普通客车', label: '小型普通客车' }
	];
	var brandOptions = [
		{ value: '东风', label: '东风' },
		{ value: '福田', label: '福田' },
		{ value: '江淮', label: '江淮' },
		{ value: '重汽', label: '重汽' },
		{ value: '陕汽', label: '陕汽' },
		{ value: '苏龙', label: '苏龙' }
	];
	var modelOptions = [
		{ value: 'DFH1180', label: 'DFH1180' },
		{ value: 'BJ1180', label: 'BJ1180' },
		{ value: 'HFC1180', label: 'HFC1180' },
		{ value: 'ZZ1180', label: 'ZZ1180' },
		{ value: 'KLQ6129', label: 'KLQ6129' }
	];

	var defaultPending = [
		{ id: 'p1', deliveryTime: '2025-02-20 09:30', deliveryPerson: '张三', plateNo: '京A12345', vehicleType: '重型厢式货车', brand: '东风', model: 'DFH1180', vin: 'LGHXCAE28M1234567', contractCode: 'HT-ZL-2025-001', customerName: '嘉兴某某物流有限公司', projectName: '嘉兴氢能示范项目', dept: '华东业务部', bizOwner: '李经理', vehicleArrived: false },
		{ id: 'p2', deliveryTime: '2025-02-21 14:00', deliveryPerson: '李四', plateNo: '沪B20001', vehicleType: '厢式货车', brand: '福田', model: 'BJ1180', vin: 'LGHXCAE28M7654321', contractCode: 'HT-ZL-2025-002', customerName: '上海某某运输公司', projectName: '上海物流租赁项目', dept: '华东业务部', bizOwner: '王经理', vehicleArrived: true },
		{ id: 'p3', deliveryTime: '2025-02-22 10:15', deliveryPerson: '王五', plateNo: '浙A88888', vehicleType: '轻型厢式货车', brand: '江淮', model: 'HFC1180', vin: 'LGHXCAE28M8888888', contractCode: 'HT-ZL-2025-003', customerName: '杭州某某租赁有限公司', projectName: '杭州城配租赁项目', dept: '浙江业务部', bizOwner: '赵经理', vehicleArrived: false },
		{ id: 'p4', deliveryTime: '2025-02-23 16:45', deliveryPerson: '张三', plateNo: '浙F66666', vehicleType: '栏板货车', brand: '重汽', model: 'ZZ1180', vin: 'LGHXCAE28M7777777', contractCode: 'HT-ZL-2025-001', customerName: '嘉兴某某物流有限公司', projectName: '嘉兴氢能示范项目', dept: '华东业务部', bizOwner: '李经理', vehicleArrived: false }
	];

	var defaultHistory = [
		{ id: 'h1', deliveryTime: '2025-01-10 08:00', deliveryPerson: '张三', returnTime: '2025-02-01 17:30', plateNo: '京C11111', vehicleType: '重型厢式货车', brand: '东风', model: 'DFH1180', vin: 'LGHXCAE28M1111111', contractCode: 'HT-ZL-2024-001', customerName: '嘉兴某某物流有限公司', projectName: '嘉兴氢能示范项目', dept: '华东业务部', bizOwner: '李经理' },
		{ id: 'h2', deliveryTime: '2025-01-15 11:20', deliveryPerson: '李四', returnTime: '2025-02-05 09:00', plateNo: '沪A10001', vehicleType: '厢式货车', brand: '江淮', model: 'HFC1180', vin: 'LGHXCAE28M2222222', contractCode: 'HT-ZL-2024-002', customerName: '上海某某运输公司', projectName: '上海物流租赁项目', dept: '华东业务部', bizOwner: '王经理' },
		{ id: 'h3', deliveryTime: '2025-01-20 13:00', deliveryPerson: '王五', returnTime: '2025-02-10 15:45', plateNo: '浙B99999', vehicleType: '平板货车', brand: '福田', model: 'BJ1180', vin: 'LGHXCAE28M3333333', contractCode: 'HT-ZL-2024-003', customerName: '杭州某某租赁有限公司', projectName: '杭州城配租赁项目', dept: '浙江业务部', bizOwner: '赵经理' }
	];

	var filterDraftState = useState({
		contractCode: undefined,
		projectName: undefined,
		customerName: undefined,
		plateNo: undefined,
		vehicleTypes: [],
		brands: [],
		model: undefined
	});
	var fd = filterDraftState[0];
	var setFd = filterDraftState[1];

	var appliedState = useState({
		contractCode: undefined,
		projectName: undefined,
		customerName: undefined,
		plateNo: undefined,
		vehicleTypes: [],
		brands: [],
		model: undefined
	});
	var applied = appliedState[0];
	var setApplied = appliedState[1];

	var pendingDataState = useState(defaultPending.slice());
	var pendingData = pendingDataState[0];
	var setPendingData = pendingDataState[1];

	var historyDataState = useState(defaultHistory.slice());
	var historyData = historyDataState[0];

	var tabState = useState('pending');
	var tab = tabState[0];
	var setTab = tabState[1];

	var pageState = useState(1);
	var page = pageState[0];
	var setPage = pageState[1];
	var pageSizeState = useState(10);
	var pageSize = pageSizeState[0];
	var setPageSize = pageSizeState[1];

	var filterExpandedState = useState(false);
	var filterExpanded = filterExpandedState[0];
	var setFilterExpanded = filterExpandedState[1];
	var requirementModalVisibleState = useState(false);
	var requirementModalVisible = requirementModalVisibleState[0];
	var setRequirementModalVisible = requirementModalVisibleState[1];

	var handleQuery = useCallback(function () {
		setApplied(Object.assign({}, fd));
		setPage(1);
		message.success('已查询（原型）');
	}, [fd]);

	var handleReset = useCallback(function () {
		var empty = { contractCode: undefined, projectName: undefined, customerName: undefined, plateNo: undefined, vehicleTypes: [], brands: [], model: undefined };
		setFd(empty);
		setApplied(empty);
		setPage(1);
	}, []);

	function matchFilters(row) {
		if (applied.contractCode && row.contractCode !== applied.contractCode) return false;
		if (applied.projectName && row.projectName !== applied.projectName) return false;
		if (applied.customerName && row.customerName !== applied.customerName) return false;
		if (applied.plateNo && row.plateNo !== applied.plateNo) return false;
		if (applied.vehicleTypes && applied.vehicleTypes.length > 0 && applied.vehicleTypes.indexOf(row.vehicleType) === -1) return false;
		if (applied.brands && applied.brands.length > 0 && applied.brands.indexOf(row.brand) === -1) return false;
		if (applied.model && row.model !== applied.model) return false;
		return true;
	}

	var filteredPending = useMemo(function () {
		return pendingData.filter(matchFilters);
	}, [pendingData, applied]);

	var filteredHistory = useMemo(function () {
		return historyData.filter(matchFilters);
	}, [historyData, applied]);

	var pagedPending = useMemo(function () {
		var start = (page - 1) * pageSize;
		return filteredPending.slice(start, start + pageSize);
	}, [filteredPending, page, pageSize]);

	var pagedHistory = useMemo(function () {
		var start = (page - 1) * pageSize;
		return filteredHistory.slice(start, start + pageSize);
	}, [filteredHistory, page, pageSize]);

	var handleVehicleArrived = useCallback(function (record) {
		Modal.confirm({
			title: '确认',
			content: '请确认车辆是否到达',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				setPendingData(function (prev) {
					return prev.map(function (r) {
						if (r.id !== record.id) return r;
						return Object.assign({}, r, { vehicleArrived: true });
					});
				});
				message.success('已确认车辆到达（原型）');
			}
		});
	}, []);

	var handleReturnCar = useCallback(function () {
		message.info('跳转还车管理-还车页（原型）');
	}, []);

	var handleViewHistory = useCallback(function () {
		message.info('跳转还车管理-查看（原型）');
	}, []);

	var handleExport = useCallback(function () {
		message.success('导出（原型）');
	}, []);

	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var tableSingleLineStyle = '.return-car-list-table .ant-table-thead th,.return-car-list-table .ant-table-tbody td{white-space:nowrap;}';
	var reqTitleStyle = { fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'rgba(0,0,0,0.85)' };
	var reqSectionStyle = { fontSize: 15, fontWeight: 600, marginTop: 16, marginBottom: 8, color: 'rgba(0,0,0,0.85)' };
	var reqItemStyle = { fontSize: 13, marginLeft: 16, marginTop: 4, marginBottom: 2, lineHeight: 1.6, color: 'rgba(0,0,0,0.75)' };

	var pendingColumns = [
		{ title: '交车时间', dataIndex: 'deliveryTime', key: 'deliveryTime', width: 160 },
		{ title: '交车人', dataIndex: 'deliveryPerson', key: 'deliveryPerson', width: 90 },
		{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100 },
		{ title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 120, ellipsis: true },
		{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 80 },
		{ title: '型号', dataIndex: 'model', key: 'model', width: 110, ellipsis: true },
		{ title: '车辆识别代码', dataIndex: 'vin', key: 'vin', width: 160, ellipsis: true },
		{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 130, ellipsis: true },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 160, ellipsis: true },
		{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 140, ellipsis: true },
		{ title: '业务部门', dataIndex: 'dept', key: 'dept', width: 110, ellipsis: true },
		{ title: '业务负责人', dataIndex: 'bizOwner', key: 'bizOwner', width: 100 },
		{
			title: '操作',
			key: 'action',
			width: 160,
			fixed: 'right',
			render: function (_, record) {
				return React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
					record.vehicleArrived
						? React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: handleReturnCar }, '还车')
						: React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: function () { handleVehicleArrived(record); } }, '车辆到达')
				);
			}
		}
	];

	var historyColumns = [
		{ title: '交车时间', dataIndex: 'deliveryTime', key: 'deliveryTime', width: 160 },
		{ title: '交车人', dataIndex: 'deliveryPerson', key: 'deliveryPerson', width: 90 },
		{ title: '还车时间', dataIndex: 'returnTime', key: 'returnTime', width: 160 },
		{ title: '还车人', dataIndex: 'deliveryPerson', key: 'returnPersonAsDelivery', width: 90 },
		{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100 },
		{ title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 120, ellipsis: true },
		{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 80 },
		{ title: '型号', dataIndex: 'model', key: 'model', width: 110, ellipsis: true },
		{ title: '车辆识别代码', dataIndex: 'vin', key: 'vin', width: 160, ellipsis: true },
		{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 130, ellipsis: true },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 160, ellipsis: true },
		{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 140, ellipsis: true },
		{ title: '业务部门', dataIndex: 'dept', key: 'dept', width: 110, ellipsis: true },
		{ title: '业务负责人', dataIndex: 'bizOwner', key: 'bizOwner', width: 100 },
		{
			title: '操作',
			key: 'action',
			width: 80,
			fixed: 'right',
			render: function () {
				return React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: handleViewHistory }, '查看');
			}
		}
	];

	var filterItems = [
		React.createElement('div', { key: 'contractCode', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '合同编码'),
			React.createElement(Select, {
				placeholder: '请选择或输入合同编码',
				style: filterControlStyle,
				value: fd.contractCode,
				onChange: function (v) { setFd(function (p) { return Object.assign({}, p, { contractCode: v }); }); },
				allowClear: true,
				showSearch: true,
				options: contractOptions,
				filterOption: filterOption
			})),
		React.createElement('div', { key: 'projectName', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '项目名称'),
			React.createElement(Select, {
				placeholder: '请选择或输入项目名称',
				style: filterControlStyle,
				value: fd.projectName,
				onChange: function (v) { setFd(function (p) { return Object.assign({}, p, { projectName: v }); }); },
				allowClear: true,
				showSearch: true,
				options: projectOptions,
				filterOption: filterOption
			})),
		React.createElement('div', { key: 'customerName', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '客户名称'),
			React.createElement(Select, {
				placeholder: '请选择或输入客户名称',
				style: filterControlStyle,
				value: fd.customerName,
				onChange: function (v) { setFd(function (p) { return Object.assign({}, p, { customerName: v }); }); },
				allowClear: true,
				showSearch: true,
				options: customerOptions,
				filterOption: filterOption
			})),
		React.createElement('div', { key: 'plateNo', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '车牌号'),
			React.createElement(Select, {
				placeholder: '请选择或输入车牌号',
				style: filterControlStyle,
				value: fd.plateNo,
				onChange: function (v) { setFd(function (p) { return Object.assign({}, p, { plateNo: v }); }); },
				allowClear: true,
				showSearch: true,
				options: plateOptions,
				filterOption: filterOption
			})),
		React.createElement('div', { key: 'vehicleTypes', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '车辆类型'),
			React.createElement(Select, {
				mode: 'multiple',
				placeholder: '请选择（可多选）',
				style: filterControlStyle,
				value: fd.vehicleTypes,
				onChange: function (v) { setFd(function (p) { return Object.assign({}, p, { vehicleTypes: v || [] }); }); },
				allowClear: true,
				options: vehicleTypeOptions
			})),
		React.createElement('div', { key: 'brands', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '品牌'),
			React.createElement(Select, {
				mode: 'multiple',
				placeholder: '请选择（可多选）',
				style: filterControlStyle,
				value: fd.brands,
				onChange: function (v) { setFd(function (p) { return Object.assign({}, p, { brands: v || [] }); }); },
				allowClear: true,
				options: brandOptions
			})),
		React.createElement('div', { key: 'model', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '型号'),
			React.createElement(Select, {
				placeholder: '请选择或输入型号',
				style: filterControlStyle,
				value: fd.model,
				onChange: function (v) { setFd(function (p) { return Object.assign({}, p, { model: v }); }); },
				allowClear: true,
				showSearch: true,
				options: modelOptions,
				filterOption: filterOption
			}))
	];

	var filterCount = filterExpanded ? 7 : 3;
	var filterNodes = [];
	for (var fi = 0; fi < filterCount && fi < filterItems.length; fi++) {
		filterNodes.push(filterItems[fi]);
	}

	var tabItems = [
		{
			key: 'pending',
			label: '待处理',
			children: React.createElement(Table, {
				rowKey: 'id',
				columns: pendingColumns,
				dataSource: pagedPending,
				scroll: { x: 1680 },
				size: 'small',
				pagination: {
					current: page,
					pageSize: pageSize,
					total: filteredPending.length,
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: function (t) { return '共 ' + t + ' 条'; },
					onChange: function (pg, ps) { setPage(pg); if (ps) setPageSize(ps); }
				}
			})
		},
		{
			key: 'history',
			label: '历史记录',
			children: React.createElement(Table, {
				rowKey: 'id',
				columns: historyColumns,
				dataSource: pagedHistory,
				scroll: { x: 1880 },
				size: 'small',
				pagination: {
					current: page,
					pageSize: pageSize,
					total: filteredHistory.length,
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: function (t) { return '共 ' + t + ' 条'; },
					onChange: function (pg, ps) { setPage(pg); if (ps) setPageSize(ps); }
				}
			})
		}
	];

	return React.createElement(App, null,
		React.createElement('div', { style: layoutStyle },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
				React.createElement(Breadcrumb, {
					items: [
						{ title: '运维管理' },
						{ title: '车辆业务' },
						{ title: '还车管理' }
					]
				}),
				React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { setRequirementModalVisible(true); } }, '查看需求说明')
			),
			React.createElement(Card, { style: { marginBottom: 16 } },
				React.createElement('div', {
					style: {
						display: 'grid',
						gridTemplateColumns: '1fr 1fr 1fr',
						gap: '16px 24px',
						alignItems: 'start',
						flex: 1,
						minWidth: 0
					}
				}, filterNodes),
				React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
					React.createElement(Button, { onClick: handleReset }, '重置'),
					React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询'),
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { setFilterExpanded(!filterExpanded); } }, filterExpanded ? '收起' : '展开')
				)
			),
			React.createElement(Card, null,
				React.createElement(React.Fragment, null,
					React.createElement('style', null, tableSingleLineStyle),
					React.createElement('div', { className: 'return-car-list-table' },
						React.createElement(Tabs, {
							activeKey: tab,
							onChange: function (k) { setTab(k); setPage(1); },
							tabBarExtraContent: React.createElement(Button, { onClick: handleExport }, '导出'),
							items: tabItems
						})
					)
				)
			),
			React.createElement(Modal, {
				title: '需求说明',
				open: requirementModalVisible,
				onCancel: function () { setRequirementModalVisible(false); },
				width: 720,
				footer: React.createElement(Button, { onClick: function () { setRequirementModalVisible(false); } }, '关闭'),
				bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
			}, React.createElement('div', { style: { padding: '8px 0' } },
				React.createElement('div', { style: reqTitleStyle }, '还车管理'),
				React.createElement('div', { style: { fontSize: 14, marginBottom: 12, color: 'rgba(0,0,0,0.85)' } }, '数字化资产 ONEOS 运管平台 · 运维管理 - 车辆业务 - 还车管理'),
				React.createElement('div', { style: reqSectionStyle }, '筛选与列表'),
				React.createElement('div', { style: reqItemStyle }, '面包屑：运维管理 - 车辆业务 - 还车管理；筛选区为三列栅格，默认一行（合同编码、项目名称、客户名称），展开后显示车牌号、车辆类型（多选）、品牌（多选）、型号；重置、查询、展开/收起与列表联动。'),
				React.createElement('div', { style: reqItemStyle }, '列表分「待处理」「历史记录」Tab，Tab 右侧为导出；待处理支持车辆到达确认后显示还车；历史记录支持查看。')
			))
		)
	);
};

if (typeof window !== 'undefined') {
	window.Component = Component;
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			var rootEl = document.getElementById('root');
			if (rootEl && window.ReactDOM && window.React) {
				var root = ReactDOM.createRoot(rootEl);
				root.render(React.createElement(Component));
			}
		});
	} else {
		var rootEl = document.getElementById('root');
		if (rootEl && window.ReactDOM && window.React) {
			var root = ReactDOM.createRoot(rootEl);
			root.render(React.createElement(Component));
		}
	}
}
