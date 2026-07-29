// 【重要】必须使用 const Component 作为组件变量名
// 基本数据维护 - 型号参数-编辑（布局与型号参数-新增一致，全部可修改，预填当前记录）

const Component = function () {
	var useState = React.useState;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Input = antd.Input;
	var Select = antd.Select;
	var Button = antd.Button;
	var Radio = antd.Radio;
	var Table = antd.Table;
	var message = antd.message;

	// 初始数据（编辑时带入，与查看页一致；实际可从路由/接口获取）
	var initialData = {
		brand: '苏龙',
		model: '海格牌KLQ5180XYKFCEV',
		announcementModel: 'KLQ5180XYKFCEV',
		vehicleType: '18吨双飞翼货车',
		fuelType: '氢',
		plateColor: '绿牌',
		sizeLength: '5995',
		sizeWidth: '2145',
		sizeHeight: '3130',
		tireCount: '8',
		tireWearFeePerMm: '2.50',
		batteryType: '磷酸铁锂',
		batteryVendor: '某某电池企业',
		capacityKwh: '100000',
		electricRange: '200',
		cylinderCapacity: '140',
		gaugeMode: 'MPa',
		hydrogenRange: '1000',
		coldMachineVendor: '某某冷机企业',
		maintenanceList: [
			{ key: '1', item: '变速器油', kmCycle: '60000', monthCycle: '24', laborCost: '0', materialCost: '571', total: '571.00' },
			{ key: '2', item: '机油', kmCycle: '50000', monthCycle: '12', laborCost: '100', materialCost: '300', total: '400.00' }
		]
	};

	// 品牌选项（与型号参数-新增一致）
	var brandOptions = [
		{ value: '苏龙', label: '苏龙' },
		{ value: '东风', label: '东风' },
		{ value: '福田', label: '福田' },
		{ value: '江淮', label: '江淮' },
		{ value: '重汽', label: '重汽' },
		{ value: '陕汽', label: '陕汽' }
	];
	// 车辆类型选项需包含初始值（18吨双飞翼货车）
	var vehicleTypeOptions = [
		{ value: '18吨双飞翼货车', label: '18吨双飞翼货车' },
		{ value: '轻型厢式货车', label: '轻型厢式货车' },
		{ value: '重型厢式货车', label: '重型厢式货车' },
		{ value: '重型半挂牵引车', label: '重型半挂牵引车' },
		{ value: '重型集装箱半挂车', label: '重型集装箱半挂车' },
		{ value: '小型普通客车', label: '小型普通客车' },
		{ value: '重型平板半挂车', label: '重型平板半挂车' },
		{ value: '叉车', label: '叉车' },
		{ value: '油车', label: '油车' },
		{ value: '观光车', label: '观光车' }
	];
	var fuelTypeOptions = [
		{ value: '氢', label: '氢' },
		{ value: '电', label: '电' },
		{ value: '油', label: '油' }
	];
	var gaugeModeOptions = [
		{ value: 'MPa', label: 'MPa' },
		{ value: 'bar', label: 'bar' }
	];

	// 基本情况
	var brand = useState(initialData.brand);
	var model = useState(initialData.model);
	var announcementModel = useState(initialData.announcementModel || '');
	var vehicleType = useState(initialData.vehicleType);
	var fuelType = useState(initialData.fuelType);
	var plateColor = useState(initialData.plateColor);
	var sizeLength = useState(initialData.sizeLength);
	var sizeWidth = useState(initialData.sizeWidth);
	var sizeHeight = useState(initialData.sizeHeight);
	// 轮胎情况
	var tireCount = useState(initialData.tireCount);
	var tireWearFeePerMm = useState(initialData.tireWearFeePerMm);
	// 电气情况
	var batteryType = useState(initialData.batteryType);
	var batteryVendor = useState(initialData.batteryVendor);
	var capacityKwh = useState(initialData.capacityKwh);
	var electricRange = useState(initialData.electricRange);
	// 供氢系统情况
	var cylinderCapacity = useState(initialData.cylinderCapacity);
	var gaugeMode = useState(initialData.gaugeMode);
	var hydrogenRange = useState(initialData.hydrogenRange);
	// 其他系统情况
	var coldMachineVendor = useState(initialData.coldMachineVendor);
	// 保养项列表
	var maintenanceList = useState(initialData.maintenanceList.slice());
	var formErrors = useState({});

	function calcTotal(labor, material) {
		var l = parseFloat(labor);
		var m = parseFloat(material);
		if (isNaN(l)) l = 0;
		if (isNaN(m)) m = 0;
		return (l + m).toFixed(2);
	}

	function updateMaintenance(index, field, value) {
		maintenanceList[1](function (prev) {
			var list = prev.slice();
			var row = Object.assign({}, list[index] || {});
			row[field] = value;
			if (field === 'laborCost' || field === 'materialCost') {
				row.total = calcTotal(row.laborCost, row.materialCost);
			}
			list[index] = row;
			return list;
		});
	}

	function addMaintenanceRow() {
		maintenanceList[1](function (prev) {
			var key = String((prev.length + 1) + Date.now());
			return prev.concat([{ key: key, item: '', kmCycle: '', monthCycle: '', laborCost: '', materialCost: '', total: '' }]);
		});
	}

	function removeMaintenanceRow(index) {
		maintenanceList[1](function (prev) {
			var list = prev.slice();
			list.splice(index, 1);
			if (list.length === 0) list = [{ key: '1', item: '', kmCycle: '', monthCycle: '', laborCost: '', materialCost: '', total: '' }];
			return list;
		});
	}

	function validate() {
		var err = {};
		if (brand[0] == null || brand[0] === '') err.brand = '请选择品牌';
		if (!String(model[0] || '').trim()) err.model = '请输入型号名称';
		if (!String(announcementModel[0] || '').trim()) err.announcementModel = '请输入公告型号';
		if (vehicleType[0] == null || vehicleType[0] === '') err.vehicleType = '请选择车辆类型';
		formErrors[1](err);
		return Object.keys(err).length === 0;
	}

	function handleSave() {
		if (!validate()) {
			message.warning('请完善必填项');
			return;
		}
		message.success('保存成功（原型）');
	}

	function handleCancel() {
		if (window.history && window.history.back) window.history.back();
		else message.info('取消');
	}

	var layoutStyle = { padding: '16px 24px 80px', backgroundColor: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var formRowStyle = { display: 'flex', flexWrap: 'wrap', marginBottom: 16 };
	var formColStyle = { flex: '0 0 33.33%', minWidth: 200, paddingRight: 16, marginBottom: 8, boxSizing: 'border-box' };
	var formColFullStyle = { flex: '0 0 100%', marginBottom: 8 };
	var labelStyle = { display: 'block', marginBottom: 6, color: 'rgba(0,0,0,0.85)' };
	var labelRequiredStyle = { color: '#ff4d4f', marginRight: 4 };
	var errMsgStyle = { color: '#ff4d4f', fontSize: 12, marginTop: 4 };
	var inputStyle = { width: '100%' };
	var footerStyle = { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 24px', backgroundColor: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', gap: 12, zIndex: 99 };
	var cardTitleBarStyle = { display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%', fontSize: 15, fontWeight: 500, lineHeight: 1.5 };
	var cardTitleBarLineStyle = { width: 4, height: 16, backgroundColor: '#1890ff', borderRadius: 2, marginRight: 8, flexShrink: 0 };

	function FormItem(props) {
		var colStyle = props.fullWidth ? formColFullStyle : formColStyle;
		return React.createElement('div', { style: colStyle },
			React.createElement('label', { style: labelStyle },
				props.required ? React.createElement('span', { style: labelRequiredStyle }, '*') : null,
				props.label
			),
			props.children,
			props.error ? React.createElement('div', { style: errMsgStyle }, props.error) : null
		);
	}

	function CardTitleWithBar(title) {
		return React.createElement('div', { style: cardTitleBarStyle },
			React.createElement('span', { style: cardTitleBarLineStyle }),
			React.createElement('span', null, title)
		);
	}

	var maintenanceColumns = [
		{ title: '养护项目', dataIndex: 'item', key: 'item', width: 160, render: function (v, record, i) { return React.createElement(Input, { placeholder: '请输入', value: v, onChange: function (e) { updateMaintenance(i, 'item', e.target.value); }, size: 'small' }); } },
		{ title: '保养公里周期(KM)', dataIndex: 'kmCycle', key: 'kmCycle', width: 140, render: function (v, record, i) { return React.createElement(Input, { placeholder: '请输入', value: v, onChange: function (e) { updateMaintenance(i, 'kmCycle', e.target.value); }, size: 'small' }); } },
		{ title: '保养时间周期(月)', dataIndex: 'monthCycle', key: 'monthCycle', width: 140, render: function (v, record, i) { return React.createElement(Input, { placeholder: '请输入', value: v, onChange: function (e) { updateMaintenance(i, 'monthCycle', e.target.value); }, size: 'small' }); } },
		{ title: '工时费(元)', dataIndex: 'laborCost', key: 'laborCost', width: 120, render: function (v, record, i) { return React.createElement(Input, { placeholder: '请输入', value: v, onChange: function (e) { updateMaintenance(i, 'laborCost', e.target.value); }, size: 'small' }); } },
		{ title: '材料费(元)', dataIndex: 'materialCost', key: 'materialCost', width: 120, render: function (v, record, i) { return React.createElement(Input, { placeholder: '请输入', value: v, onChange: function (e) { updateMaintenance(i, 'materialCost', e.target.value); }, size: 'small' }); } },
		{ title: '合计', dataIndex: 'total', key: 'total', width: 100, render: function (v) { return v || '—'; } },
		{
			title: '操作',
			key: 'action',
			width: 80,
			render: function (_, record, i) {
				return React.createElement(Button, { type: 'link', danger: true, size: 'small', onClick: function () { removeMaintenanceRow(i); } }, '删除');
			}
		}
	];

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '基本数据维护' },
					{ title: '型号参数' },
					{ title: '编辑' }
				]
			})
		),
		React.createElement(Card, { title: CardTitleWithBar('型号参数'), size: 'small', style: cardStyle },
			React.createElement('div', { style: formRowStyle },
				React.createElement(FormItem, { label: '品牌', required: true, error: formErrors[0].brand },
					React.createElement(Select, { placeholder: '请选择品牌', style: inputStyle, value: brand[0], onChange: function (v) { brand[1](v); }, allowClear: true, options: brandOptions, status: formErrors[0].brand ? 'error' : undefined })
				),
				React.createElement(FormItem, { label: '型号', required: true, error: formErrors[0].model },
					React.createElement(Input, { placeholder: '请输入型号名称', value: model[0], onChange: function (e) { model[1](e.target.value); }, style: inputStyle, status: formErrors[0].model ? 'error' : undefined })
				),
				React.createElement(FormItem, { label: '公告型号', required: true, error: formErrors[0].announcementModel },
					React.createElement(Input, { placeholder: '请输入公告型号', value: announcementModel[0], onChange: function (e) { announcementModel[1](e.target.value); }, style: inputStyle, status: formErrors[0].announcementModel ? 'error' : undefined })
				),
				React.createElement(FormItem, { label: '车辆类型', required: true, error: formErrors[0].vehicleType },
					React.createElement(Select, { placeholder: '请选择车辆类型', style: inputStyle, value: vehicleType[0], onChange: function (v) { vehicleType[1](v); }, allowClear: true, options: vehicleTypeOptions, status: formErrors[0].vehicleType ? 'error' : undefined })
				),
				React.createElement(FormItem, { label: '燃料种类' },
					React.createElement(Select, { placeholder: '请选择燃料种类', style: inputStyle, value: fuelType[0], onChange: function (v) { fuelType[1](v); }, allowClear: true, options: fuelTypeOptions })
				),
				React.createElement(FormItem, { label: '车牌颜色' },
					React.createElement(Radio.Group, { value: plateColor[0], onChange: function (e) { plateColor[1](e.target.value); } },
						React.createElement(Radio, { value: '绿牌' }, '绿牌'),
						React.createElement(Radio, { value: '黄牌' }, '黄牌'),
						React.createElement(Radio, { value: '黄绿牌' }, '黄绿牌')
					)
				),
				React.createElement(FormItem, { label: '整车尺寸', fullWidth: true },
					React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
						React.createElement(Input, { placeholder: '长', value: sizeLength[0], onChange: function (e) { sizeLength[1](e.target.value); }, style: { flex: 1, minWidth: 0 } }),
						React.createElement('span', { style: { flexShrink: 0 } }, '×'),
						React.createElement(Input, { placeholder: '宽', value: sizeWidth[0], onChange: function (e) { sizeWidth[1](e.target.value); }, style: { flex: 1, minWidth: 0 } }),
						React.createElement('span', { style: { flexShrink: 0 } }, '×'),
						React.createElement(Input, { placeholder: '高', value: sizeHeight[0], onChange: function (e) { sizeHeight[1](e.target.value); }, style: { flex: 1, minWidth: 0 } })
					)
				)
			)
		),
		React.createElement(Card, { title: CardTitleWithBar('轮胎情况'), size: 'small', style: cardStyle },
			React.createElement('div', { style: formRowStyle },
				React.createElement(FormItem, { label: '轮胎数量' },
					React.createElement(Input, { placeholder: '请输入轮胎数量', value: tireCount[0], onChange: function (e) { tireCount[1](e.target.value); }, style: inputStyle, addonAfter: '条' })
				),
				React.createElement(FormItem, { label: '轮胎磨损费用（元/mm）' },
					React.createElement(Input, { placeholder: '请输入轮胎磨损费用', value: tireWearFeePerMm[0], onChange: function (e) { tireWearFeePerMm[1](e.target.value); }, style: inputStyle, addonAfter: '元' })
				)
			)
		),
		React.createElement(Card, { title: CardTitleWithBar('电气情况'), size: 'small', style: cardStyle },
			React.createElement('div', { style: formRowStyle },
				React.createElement(FormItem, { label: '电池类型' },
					React.createElement(Radio.Group, { value: batteryType[0], onChange: function (e) { batteryType[1](e.target.value); } },
						React.createElement(Radio, { value: '磷酸铁锂' }, '磷酸铁锂'),
						React.createElement(Radio, { value: '三元锂' }, '三元锂')
					)
				),
				React.createElement(FormItem, { label: '电池厂家' },
					React.createElement(Input, { placeholder: '请输入电池厂商名称', value: batteryVendor[0], onChange: function (e) { batteryVendor[1](e.target.value); }, style: inputStyle })
				),
				React.createElement(FormItem, { label: '储电量' },
					React.createElement(Input, { placeholder: '请输入储电量', value: capacityKwh[0], onChange: function (e) { capacityKwh[1](e.target.value); }, style: inputStyle, addonAfter: 'kWh' })
				),
				React.createElement(FormItem, { label: '电续航里程' },
					React.createElement(Input, { placeholder: '请输入电续航里程', value: electricRange[0], onChange: function (e) { electricRange[1](e.target.value); }, style: inputStyle, addonAfter: 'KM' })
				)
			)
		),
		React.createElement(Card, { title: CardTitleWithBar('供氢系统情况'), size: 'small', style: cardStyle },
			React.createElement('div', { style: formRowStyle },
				React.createElement(FormItem, { label: '氢瓶容量' },
					React.createElement(Input, { placeholder: '请输入氢瓶容量', value: cylinderCapacity[0], onChange: function (e) { cylinderCapacity[1](e.target.value); }, style: inputStyle, addonAfter: 'L' })
				),
				React.createElement(FormItem, { label: '仪表盘显示模式' },
					React.createElement(Select, { placeholder: '请选择仪表盘显示模式', style: inputStyle, value: gaugeMode[0], onChange: function (v) { gaugeMode[1](v); }, allowClear: true, options: gaugeModeOptions })
				),
				React.createElement(FormItem, { label: '氢续航里程' },
					React.createElement(Input, { placeholder: '请输入氢续航里程', value: hydrogenRange[0], onChange: function (e) { hydrogenRange[1](e.target.value); }, style: inputStyle, addonAfter: 'KM' })
				)
			)
		),
		React.createElement(Card, { title: CardTitleWithBar('其他系统情况'), size: 'small', style: cardStyle },
			React.createElement('div', { style: formRowStyle },
				React.createElement(FormItem, { label: '冷机厂家' },
					React.createElement(Input, { placeholder: '请输入冷机厂家名称', value: coldMachineVendor[0], onChange: function (e) { coldMachineVendor[1](e.target.value); }, style: inputStyle })
				)
			)
		),
		React.createElement(Card, { title: CardTitleWithBar('保养项情况'), size: 'small', style: cardStyle },
			React.createElement(Table, {
				columns: maintenanceColumns,
				dataSource: maintenanceList[0],
				rowKey: 'key',
				pagination: false,
				size: 'small',
				bordered: true
			}),
			React.createElement(Button, { type: 'dashed', style: { width: '100%', marginTop: 8 }, onClick: addMaintenanceRow }, '+ 添加一项')
		),
		React.createElement('div', { style: footerStyle },
			React.createElement(Button, { type: 'primary', onClick: handleSave }, '保存'),
			React.createElement(Button, { onClick: handleCancel }, '取消')
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
