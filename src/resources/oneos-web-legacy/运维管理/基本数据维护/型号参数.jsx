// 【重要】必须使用 const Component 作为组件变量名
// 基本数据维护 - 型号参数（布局参考车辆租赁合同）

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
	var Space = antd.Space;
	var message = antd.message;
	var Modal = antd.Modal;

	// 筛选
	var filterVehicleType = useState(undefined);
	var filterBrand = useState(undefined);
	var filterModel = useState(undefined);
	var appliedFilter = useState({ vehicleType: undefined, brand: undefined, model: undefined });

	// 下拉选项：车辆类型、品牌
	var vehicleTypeOptions = [
		{ value: '18吨双飞翼货车', label: '18吨双飞翼货车' },
		{ value: '重型厢式货车', label: '重型厢式货车' },
		{ value: '轻型厢式货车', label: '轻型厢式货车' },
		{ value: '小型普通客车', label: '小型普通客车' },
		{ value: '重型栏板货车', label: '重型栏板货车' }
	];
	var brandOptions = [
		{ value: '苏龙', label: '苏龙' },
		{ value: '东风', label: '东风' },
		{ value: '福田', label: '福田' },
		{ value: '江淮', label: '江淮' },
		{ value: '重汽', label: '重汽' },
		{ value: '陕汽', label: '陕汽' }
	];
	// 品牌 -> 型号联动：先选品牌，型号下拉只展示该品牌下型号
	var brandModelMap = {
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
		]
	};
	var modelOptions = useMemo(function () {
		var brand = filterBrand[0];
		if (!brand || !brandModelMap[brand]) return [];
		return brandModelMap[brand];
	}, [filterBrand[0]]);

	// 列表数据（样例与车辆管理-查看.jsx 型号参数一致，并扩展多品牌多型号）
	var rawList = [
		{ id: '1', vehicleType: '18吨双飞翼货车', brand: '苏龙', model: '海格牌KLQ5180XYKFCEV', fuelType: '氢', plateColor: '绿牌', wholeSize: '5995mm x 2145mm x 3130mm', tireCount: '8', tireSpec: '15/80R22.5', tireWearFeePerMm: '2.50', batteryType: '磷酸铁锂', capacityKwh: '100000', cylinderCapacity: 'xxx L' },
		{ id: '2', vehicleType: '重型厢式货车', brand: '东风', model: 'DFH1180', fuelType: '氢', plateColor: '绿牌', wholeSize: '5990mm x 2150mm x 3080mm', tireCount: '8', tireSpec: '295/80R22.5', tireWearFeePerMm: '2.80', batteryType: '磷酸铁锂', capacityKwh: '96000', cylinderCapacity: '140 L' },
		{ id: '3', vehicleType: '重型厢式货车', brand: '福田', model: 'BJ1180', fuelType: '氢', plateColor: '绿牌', wholeSize: '5985mm x 2140mm x 3120mm', tireCount: '8', tireSpec: '295/80R22.5', tireWearFeePerMm: '2.70', batteryType: '磷酸铁锂', capacityKwh: '98000', cylinderCapacity: '135 L' },
		{ id: '4', vehicleType: '轻型厢式货车', brand: '江淮', model: 'HFC1180', fuelType: '氢', plateColor: '绿牌', wholeSize: '5995mm x 2100mm x 2980mm', tireCount: '6', tireSpec: '225/70R19.5', tireWearFeePerMm: '2.20', batteryType: '磷酸铁锂', capacityKwh: '72000', cylinderCapacity: '80 L' },
		{ id: '5', vehicleType: '18吨双飞翼货车', brand: '重汽', model: 'ZZ5180', fuelType: '氢', plateColor: '绿牌', wholeSize: '5995mm x 2145mm x 3140mm', tireCount: '8', tireSpec: '15/80R22.5', tireWearFeePerMm: '2.95', batteryType: '磷酸铁锂', capacityKwh: '102000', cylinderCapacity: '150 L' },
		{ id: '6', vehicleType: '小型普通客车', brand: '苏龙', model: 'KLQ6129', fuelType: '氢', plateColor: '绿牌', wholeSize: '11980mm x 2550mm x 3580mm', tireCount: '6', tireSpec: '275/70R22.5', tireWearFeePerMm: '1.80', batteryType: '磷酸铁锂', capacityKwh: '85000', cylinderCapacity: '100 L' },
		{ id: '7', vehicleType: '重型栏板货车', brand: '陕汽', model: 'SX1180', fuelType: '氢', plateColor: '绿牌', wholeSize: '5995mm x 2150mm x 3100mm', tireCount: '8', tireSpec: '295/80R22.5', tireWearFeePerMm: '2.60', batteryType: '磷酸铁锂', capacityKwh: '95000', cylinderCapacity: '130 L' }
	];

	var filteredList = useMemo(function () {
		var list = rawList.slice();
		var f = appliedFilter[0];
		if (f.vehicleType) list = list.filter(function (r) { return r.vehicleType === f.vehicleType; });
		if (f.brand) list = list.filter(function (r) { return r.brand === f.brand; });
		if (f.model) list = list.filter(function (r) { return r.model === f.model; });
		return list;
	}, [rawList, appliedFilter[0]]);

	var handleQuery = useCallback(function () {
		appliedFilter[1]({
			vehicleType: filterVehicleType[0],
			brand: filterBrand[0],
			model: filterModel[0]
		});
	}, [filterVehicleType[0], filterBrand[0], filterModel[0]]);

	var handleReset = useCallback(function () {
		filterVehicleType[1](undefined);
		filterBrand[1](undefined);
		filterModel[1](undefined);
		appliedFilter[1]({ vehicleType: undefined, brand: undefined, model: undefined });
	}, []);

	var deleteModalState = useState({ open: false, record: null });
	var openDeleteConfirm = useCallback(function (record) {
		deleteModalState[1]({ open: true, record: record });
	}, []);
	var confirmDelete = useCallback(function () {
		message.success('删除成功（原型）');
		deleteModalState[1]({ open: false, record: null });
	}, []);

	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };

	var columns = [
		{ title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 120, ellipsis: true },
		{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 100, ellipsis: true },
		{ title: '型号', dataIndex: 'model', key: 'model', width: 180, ellipsis: true },
		{ title: '燃料种类', dataIndex: 'fuelType', key: 'fuelType', width: 100, ellipsis: true },
		{ title: '车牌颜色', dataIndex: 'plateColor', key: 'plateColor', width: 100, ellipsis: true },
		{ title: '整车尺寸', dataIndex: 'wholeSize', key: 'wholeSize', width: 140, ellipsis: true },
		{ title: '轮胎数量', dataIndex: 'tireCount', key: 'tireCount', width: 90, ellipsis: true },
		{
			title: '轮胎磨损费用（元/mm）',
			dataIndex: 'tireWearFeePerMm',
			key: 'tireWearFeePerMm',
			width: 160,
			render: function (v) {
				var n = v === null || v === undefined || v === '' ? NaN : parseFloat(v);
				var txt = isNaN(n) ? '--' : n.toFixed(2);
				return React.createElement('span', null, txt);
			}
		},
		{ title: '电池类型', dataIndex: 'batteryType', key: 'batteryType', width: 100, ellipsis: true },
		{ title: '储电量(kWh)', dataIndex: 'capacityKwh', key: 'capacityKwh', width: 120, ellipsis: true },
		{ title: '氢瓶容量', dataIndex: 'cylinderCapacity', key: 'cylinderCapacity', width: 100, ellipsis: true },
		{
			title: '操作',
			key: 'action',
			width: 160,
			fixed: 'right',
			render: function (_, record) {
				return React.createElement(Space, { size: 4 },
					React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: function () { message.info('查看（原型）'); } }, '查看'),
					React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: function () { message.info('编辑（原型）'); } }, '编辑'),
					React.createElement(Button, { type: 'link', size: 'small', danger: true, style: { padding: 0 }, onClick: function () { openDeleteConfirm(record); } }, '删除')
				);
			}
		}
	];

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '基本数据维护' },
					{ title: '型号参数' }
				]
			})
		),
		React.createElement(Card, { style: { marginBottom: 16 } },
			React.createElement('div', {
				style: {
					display: 'grid',
					gridTemplateColumns: '1fr 1fr 1fr',
					gap: '16px 24px',
					alignItems: 'start',
					minWidth: 0
				}
			},
				React.createElement('div', null,
					React.createElement('div', { style: filterLabelStyle }, '车辆类型'),
					React.createElement(Select, {
						placeholder: '请选择车系类型',
						style: { width: '100%' },
						value: filterVehicleType[0],
						onChange: function (v) { filterVehicleType[1](v); },
						allowClear: true,
						options: vehicleTypeOptions
					})
				),
				React.createElement('div', null,
					React.createElement('div', { style: filterLabelStyle }, '品牌'),
					React.createElement(Select, {
						placeholder: '请选择品牌',
						style: { width: '100%' },
						value: filterBrand[0],
						onChange: function (v) { filterBrand[1](v); filterModel[1](undefined); },
						allowClear: true,
						options: brandOptions
					})
				),
				React.createElement('div', null,
					React.createElement('div', { style: filterLabelStyle }, '型号'),
					React.createElement(Select, {
						placeholder: filterBrand[0] ? '请选择型号' : '请先选择品牌',
						style: { width: '100%' },
						value: filterModel[0],
						onChange: function (v) { filterModel[1](v); },
						allowClear: true,
						options: modelOptions,
						disabled: !filterBrand[0]
					})
				)
			),
			React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
				React.createElement(Button, { onClick: handleReset }, '重置'),
				React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
			)
		),
		React.createElement('div', { style: { marginBottom: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 } },
			React.createElement(Button, { type: 'primary', onClick: function () { message.info('新建（原型）'); } }, '新建'),
			React.createElement(Button, { onClick: function () { message.info('导出（原型）'); } }, '导出')
		),
		React.createElement(Card, null,
			React.createElement(Table, {
				rowKey: 'id',
				columns: columns,
				dataSource: filteredList,
				scroll: { x: 1400 },
				size: 'small',
				pagination: { showSizeChanger: true, showQuickJumper: true, showTotal: function (t) { return '共 ' + t + ' 条'; } }
			})
		),
		React.createElement(Modal, {
			title: '确认删除',
			open: deleteModalState[0].open,
			onCancel: function () { deleteModalState[1]({ open: false, record: null }); },
			onOk: confirmDelete,
			okText: '确定',
			cancelText: '取消'
		}, '确定要删除该型号参数吗？')
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
