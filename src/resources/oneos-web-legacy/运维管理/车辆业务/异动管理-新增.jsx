// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 异动管理 - 新增（与「异动管理-编辑」同步维护）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var App = antd.App;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Button = antd.Button;
	var Input = antd.Input;
	var Select = antd.Select;
	var Cascader = antd.Cascader;
	var DatePicker = antd.DatePicker;
	var Table = antd.Table;
	var Modal = antd.Modal;
	var message = antd.message;

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function toFixed2Input(v) {
		var s = String(v === null || v === undefined ? '' : v);
		s = s.replace(/[^\d.]/g, '');
		var firstDot = s.indexOf('.');
		if (firstDot >= 0) {
			s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
		}
		if (firstDot >= 0) {
			var a = s.split('.');
			s = a[0] + '.' + (a[1] || '').slice(0, 2);
		}
		return s;
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var labelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var formItemStyle = { marginBottom: 12 };
	var controlStyle = { width: '100%' };
	var reqStarStyle = { color: '#ff4d4f', marginRight: 4 };
	var reqStar = React.createElement('span', { style: reqStarStyle }, '*');

	// 车辆表（用于车牌选择与反写）
	var vehicleDb = useMemo(function () {
		return [
			{ plateNo: '粤A12345', vehicleType: '厢式货车', brand: '东风', model: 'DFH1180', departParking: '天河智慧停车场', h2Unit: 'MPa' },
			{ plateNo: '粤B11111', vehicleType: '轿车', brand: '比亚迪', model: '汉', departParking: '南山科技园停车场', h2Unit: '%' },
			{ plateNo: '浙A11111', vehicleType: 'SUV', brand: '小鹏', model: 'P7', departParking: '西湖景区停车场', h2Unit: '%' },
			{ plateNo: '浙B22222', vehicleType: '轿车', brand: '蔚来', model: 'ET5', departParking: '宁波江北停车场', h2Unit: 'MPa' },
			{ plateNo: '沪A30003', vehicleType: '厢式货车', brand: '福田', model: 'BJ1180', departParking: '张江园区停车场', h2Unit: 'MPa' }
		];
	}, []);

	var plateOptions = useMemo(function () {
		return vehicleDb.map(function (v) { return { value: v.plateNo, label: v.plateNo }; });
	}, [vehicleDb]);

	var destinationTypeOptions = useMemo(function () {
		return [
			{ value: '停车场', label: '停车场' },
			{ value: '维修站', label: '维修站' },
			{ value: '其他', label: '其他' }
		];
	}, []);

	var destinationParkingOptions = useMemo(function () {
		return [
			{ value: '天河智慧停车场', label: '天河智慧停车场' },
			{ value: '南山科技园停车场', label: '南山科技园停车场' },
			{ value: '西湖景区停车场', label: '西湖景区停车场' },
			{ value: '宁波江北停车场', label: '宁波江北停车场' },
			{ value: '张江园区停车场', label: '张江园区停车场' }
		];
	}, []);

	var destinationRepairOptions = useMemo(function () {
		return [
			{ value: '杭州拱墅维修站', label: '杭州拱墅维修站' },
			{ value: '广州天河维修站', label: '广州天河维修站' },
			{ value: '上海浦东维修站', label: '上海浦东维修站' }
		];
	}, []);

	// 省-市 2 级（与调拨管理筛选一致，原型数据）
	var destinationRegionOptions = useMemo(function () {
		return [
			{ value: 'zhejiang', label: '浙江省', children: [{ value: 'hangzhou', label: '杭州市' }, { value: 'ningbo', label: '宁波市' }, { value: 'jiaxing', label: '嘉兴市' }] },
			{ value: 'shanghai', label: '上海市', children: [{ value: 'shanghai', label: '上海市' }] },
			{ value: 'guangdong', label: '广东省', children: [{ value: 'guangzhou', label: '广州市' }, { value: 'shenzhen', label: '深圳市' }, { value: 'dongguan', label: '东莞市' }] }
		];
	}, []);

	var changeTypeOptions = useMemo(function () {
		return [
			{ value: '维修', label: '维修' },
			{ value: '保养', label: '保养' },
			{ value: '年审', label: '年审' },
			{ value: '其他', label: '其他' }
		];
	}, []);

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	var requirementDocContent = [
		'一个「数字化资产ONEOS运管平台」中的「异动管理」「新增」模块',
		'#面包屑：运维管理-车辆业务-异动管理-新增',
		'',
		'1.异动情况；',
		'1.1.异动开始日期：必填项，日期选择器，格式为：YYYY-MM-DD HH:MM；',
		'1.2.异动预计结束日期：必填项，日期选择器，格式为：YYYY-MM-DD HH:MM；',
		'1.3.异动目的地：必填项，选择器，选项为：停车场、维修站、其他；',
		'2.4.目的地名称：必填项，如异动目的地为停车场，则此处为停车场（选择器），如异动目的地为维修站，则此处为维修站（选择器），如异动目的地为其他，则先选目的地所在区域（省-市 2 级级联），再输入目的地名称；',
		'2.4.1.目的地所在区域：当异动目的地为「其他」时必填，级联选择器，省-市 2 级，展示在目的地名称前方；',
		'2.5.异动类型：必填项，选择器，选项为：维修、保养、年审、其他；',
		'2.6.备注：文本域，支持自定义输入；',
		'',
		'2.车辆信息：',
		'2.1.车牌号：显示车牌号，支持输入框模糊搜索下拉匹配对应选项；',
		'2.2.车辆类型：根据所选车辆类型自动反写，默认提示为请先选择车辆；',
		'2.3.品牌：根据所选车辆品牌自动反写，默认提示为请先选择车辆；',
		'2.4.型号：根据所选车辆型号自动反写，默认提示为请先选择车辆；',
		'2.5.出发停车场：根据所选车辆出发时停车场自动反写，默认提示为请先选择车辆；',
		'2.6.预计异动里程：输入框，支持2位小数输入，后缀为km；',
		'2.7.异动开始里程：必填项，输入框，精确至2位小数，后缀为km；',
		'2.8.异动开始氢量：必填项，输入框，精确至2位小数，后缀为%或MPa，根据所选车辆型号中获取；',
		'2.9.异动开始电量：必填项，输入框，精确至2位小数，后缀为kWh；',
		'2.10.操作：删除；',
		'2.11.新增一行：铺满整行；',
		'',
		'3.底部为提交审核、保存、取消；'
	].join('\n');

	var formState = useState({
		startTime: null,
		plannedEndTime: null,
		destinationType: undefined,
		destinationRegion: undefined,
		destinationName: undefined,
		destinationNameOther: '',
		changeType: undefined,
		remark: ''
	});
	var form = formState[0];
	var setForm = formState[1];

	var errorsState = useState({});
	var errors = errorsState[0];
	var setErrors = errorsState[1];

	var rowIdRef = React.useRef(2);
	var vehiclesState = useState([
		{
			id: 1,
			plateNo: undefined,
			vehicleType: '',
			brand: '',
			model: '',
			departParking: '',
			h2Unit: '',
			plannedMileageKm: '',
			startMileageKm: '',
			startHydrogen: '',
			startElectricKwh: ''
		}
	]);
	var vehicles = vehiclesState[0];
	var setVehicles = vehiclesState[1];

	var updateForm = useCallback(function (patch) {
		setForm(function (p) { return Object.assign({}, p, patch); });
	}, []);

	var updateRow = useCallback(function (index, patch) {
		setVehicles(function (prev) {
			var list = prev.slice();
			var cur = list[index] || {};
			list[index] = Object.assign({}, cur, patch);
			return list;
		});
	}, []);

	var handlePlateChange = useCallback(function (index, plateNo) {
		var v = vehicleDb.find(function (x) { return x.plateNo === plateNo; });
		var patch = {
			plateNo: plateNo,
			vehicleType: v ? v.vehicleType : '',
			brand: v ? v.brand : '',
			model: v ? v.model : '',
			departParking: v ? v.departParking : '',
			h2Unit: v ? v.h2Unit : ''
		};
		if (!v) patch.plannedMileageKm = '';
		updateRow(index, patch);
	}, [vehicleDb, updateRow]);

	var addRow = useCallback(function () {
		setVehicles(function (prev) {
			return prev.concat([{
				id: rowIdRef.current++,
				plateNo: undefined,
				vehicleType: '',
				brand: '',
				model: '',
				departParking: '',
				h2Unit: '',
				plannedMileageKm: '',
				startMileageKm: '',
				startHydrogen: '',
				startElectricKwh: ''
			}]);
		});
	}, []);

	var removeRow = useCallback(function (index) {
		setVehicles(function (prev) {
			var list = prev.slice();
			list.splice(index, 1);
			if (list.length === 0) {
				return [{
					id: rowIdRef.current++,
					plateNo: undefined,
					vehicleType: '',
					brand: '',
					model: '',
					departParking: '',
					h2Unit: '',
					plannedMileageKm: '',
					startMileageKm: '',
					startHydrogen: '',
					startElectricKwh: ''
				}];
			}
			return list;
		});
	}, []);

	function validate() {
		var e = {};
		if (!form.startTime) e.startTime = '请选择异动开始日期';
		if (!form.plannedEndTime) e.plannedEndTime = '请选择异动预计结束日期';
		if (!form.destinationType) e.destinationType = '请选择异动目的地';
		if (form.destinationType === '其他') {
			var reg = form.destinationRegion;
			if (!reg || !Array.isArray(reg) || reg.length < 2) e.destinationRegion = '请选择目的地所在区域（省-市）';
			if (!String(form.destinationNameOther || '').trim()) e.destinationName = '请输入目的地名称';
		} else {
			if (!form.destinationName) e.destinationName = '请选择目的地名称';
		}
		if (!form.changeType) e.changeType = '请选择异动类型';

		var effectiveRows = (vehicles || []).filter(function (r) { return r && String(r.plateNo || '').trim(); });
		if (effectiveRows.length === 0) e.vehicleList = '请至少选择一辆车';

		for (var i = 0; i < (vehicles || []).length; i++) {
			var r = vehicles[i] || {};
			if (!String(r.plateNo || '').trim()) continue;
			if (!String(r.plannedMileageKm || '').trim()) e['row_' + i + '_plannedMileageKm'] = '请输入预计异动里程';
			if (!String(r.startMileageKm || '').trim()) e['row_' + i + '_startMileageKm'] = '请输入异动开始里程';
			if (!String(r.startHydrogen || '').trim()) e['row_' + i + '_startHydrogen'] = '请输入异动开始氢量';
			if (!String(r.startElectricKwh || '').trim()) e['row_' + i + '_startElectricKwh'] = '请输入异动开始电量';
		}

		setErrors(e);
		return Object.keys(e).length === 0;
	}

	var handleSubmitAudit = useCallback(function () {
		if (!validate()) {
			message.error('请完善必填项后再提交');
			return;
		}
		Modal.confirm({
			title: '确认提交审核？',
			content: '提交后将进入审批流程（原型）。',
			okText: '提交审核',
			cancelText: '取消',
			onOk: function () {
				message.success('已提交审核（原型）');
			}
		});
	}, [form, vehicles]);

	var handleSave = useCallback(function () {
		message.info('已保存（原型，不做校验）');
	}, []);

	var handleCancel = useCallback(function () {
		Modal.confirm({
			title: '是否确认取消',
			content: '取消将会丢失所有已填写内容，是否确认？',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				message.info('返回异动管理列表页（原型）');
			}
		});
	}, []);

	// 目的地名称控件：随异动目的地变化
	var destinationNameLabel = form.destinationType === '维修站' ? '维修站' : (form.destinationType === '停车场' ? '停车场' : '目的地名称');
	var destinationNameNode = (function () {
		if (form.destinationType === '其他') {
			return React.createElement(Input, {
				placeholder: '请输入目的地名称',
				value: form.destinationNameOther,
				onChange: function (e) { updateForm({ destinationNameOther: e.target.value }); },
				status: errors.destinationName ? 'error' : undefined
			});
		}
		var opts = form.destinationType === '维修站' ? destinationRepairOptions : destinationParkingOptions;
		return React.createElement(Select, {
			placeholder: '请选择' + destinationNameLabel,
			style: controlStyle,
			value: form.destinationName,
			onChange: function (v) { updateForm({ destinationName: v }); },
			allowClear: true,
			showSearch: true,
			options: opts,
			filterOption: filterOption,
			status: errors.destinationName ? 'error' : undefined,
			disabled: !form.destinationType
		});
	})();

	var vehicleColumns = useMemo(function () {
		return [
			{
				title: React.createElement('span', null, reqStar, '车牌号'),
				key: 'plateNo',
				width: 140,
				render: function (_, r, index) {
					return React.createElement(Select, {
						placeholder: '请输入或选择车牌号',
						style: { width: '100%' },
						value: r.plateNo,
						onChange: function (v) { handlePlateChange(index, v); },
						allowClear: true,
						showSearch: true,
						options: plateOptions,
						filterOption: filterOption,
						status: errors.vehicleList ? 'error' : undefined
					});
				}
			},
			{
				title: '车辆类型',
				key: 'vehicleType',
				width: 120,
				render: function (_, r) {
					return React.createElement(Input, { value: r.vehicleType ? r.vehicleType : '请先选择车辆', disabled: true });
				}
			},
			{
				title: '品牌',
				key: 'brand',
				width: 100,
				render: function (_, r) {
					return React.createElement(Input, { value: r.brand ? r.brand : '请先选择车辆', disabled: true });
				}
			},
			{
				title: '型号',
				key: 'model',
				width: 120,
				render: function (_, r) {
					return React.createElement(Input, { value: r.model ? r.model : '请先选择车辆', disabled: true });
				}
			},
			{
				title: '出发停车场',
				key: 'departParking',
				width: 160,
				render: function (_, r) {
					return React.createElement(Input, { value: r.departParking ? r.departParking : '请先选择车辆', disabled: true });
				}
			},
			{
				title: React.createElement('span', null, reqStar, '预计异动里程'),
				key: 'plannedMileageKm',
				width: 160,
				render: function (_, r, index) {
					var k = 'row_' + index + '_plannedMileageKm';
					return React.createElement(Input, {
						value: r.plannedMileageKm,
						onChange: function (e) { updateRow(index, { plannedMileageKm: toFixed2Input(e.target.value) }); },
						placeholder: '0.00',
						addonAfter: 'km',
						status: errors[k] ? 'error' : undefined
					});
				}
			},
			{
				title: React.createElement('span', null, reqStar, '异动开始里程'),
				key: 'startMileageKm',
				width: 160,
				render: function (_, r, index) {
					var k = 'row_' + index + '_startMileageKm';
					return React.createElement(Input, {
						value: r.startMileageKm,
						onChange: function (e) { updateRow(index, { startMileageKm: toFixed2Input(e.target.value) }); },
						placeholder: '0.00',
						addonAfter: 'km',
						status: errors[k] ? 'error' : undefined
					});
				}
			},
			{
				title: React.createElement('span', null, reqStar, '异动开始氢量'),
				key: 'startHydrogen',
				width: 150,
				render: function (_, r, index) {
					var k = 'row_' + index + '_startHydrogen';
					var unit = r.h2Unit || '%/MPa';
					return React.createElement(Input, {
						value: r.startHydrogen,
						onChange: function (e) { updateRow(index, { startHydrogen: toFixed2Input(e.target.value) }); },
						placeholder: '0.00',
						addonAfter: unit,
						status: errors[k] ? 'error' : undefined
					});
				}
			},
			{
				title: React.createElement('span', null, reqStar, '异动开始电量'),
				key: 'startElectricKwh',
				width: 150,
				render: function (_, r, index) {
					var k = 'row_' + index + '_startElectricKwh';
					return React.createElement(Input, {
						value: r.startElectricKwh,
						onChange: function (e) { updateRow(index, { startElectricKwh: toFixed2Input(e.target.value) }); },
						placeholder: '0.00',
						addonAfter: 'kWh',
						status: errors[k] ? 'error' : undefined
					});
				}
			},
			{
				title: '操作',
				key: 'action',
				width: 80,
				fixed: 'right',
				render: function (_, __, index) {
					return React.createElement(Button, { type: 'link', danger: true, size: 'small', onClick: function () { removeRow(index); } }, '删除');
				}
			}
		];
	}, [plateOptions, errors, handlePlateChange, updateRow, removeRow]);

	return React.createElement(App, null,
		React.createElement('div', { style: layoutStyle },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 } },
				React.createElement(Breadcrumb, { items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '异动管理' }, { title: '新增' }] }),
				React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { setRequirementModalOpen(true); } }, '查看需求说明')
			),

			React.createElement(Modal, {
				title: '需求说明',
				open: requirementModalOpen,
				onCancel: function () { setRequirementModalOpen(false); },
				width: 720,
				footer: React.createElement(Button, { onClick: function () { setRequirementModalOpen(false); } }, '关闭'),
				bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
			}, React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, color: 'rgba(0,0,0,0.85)' } }, requirementDocContent)),

			React.createElement(Card, { title: '异动情况', style: { marginBottom: 16 } },
				React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', alignItems: 'start' } },
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, reqStar, '异动开始日期'),
						React.createElement(DatePicker, {
							style: controlStyle,
							showTime: { format: 'HH:mm' },
							format: 'YYYY-MM-DD HH:mm',
							placeholder: '请选择异动开始日期',
							value: form.startTime,
							onChange: function (v) { updateForm({ startTime: v }); },
							status: errors.startTime ? 'error' : undefined
						}),
						errors.startTime ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.startTime) : null
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, reqStar, '异动预计结束日期'),
						React.createElement(DatePicker, {
							style: controlStyle,
							showTime: { format: 'HH:mm' },
							format: 'YYYY-MM-DD HH:mm',
							placeholder: '请选择异动预计结束日期',
							value: form.plannedEndTime,
							onChange: function (v) { updateForm({ plannedEndTime: v }); },
							status: errors.plannedEndTime ? 'error' : undefined
						}),
						errors.plannedEndTime ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.plannedEndTime) : null
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, reqStar, '异动目的地'),
						React.createElement(Select, {
							placeholder: '请选择异动目的地',
							style: controlStyle,
							value: form.destinationType,
							onChange: function (v) {
								setForm(function (p) {
									return Object.assign({}, p, {
										destinationType: v,
										destinationRegion: undefined,
										destinationName: undefined,
										destinationNameOther: ''
									});
								});
							},
							allowClear: true,
							options: destinationTypeOptions,
							status: errors.destinationType ? 'error' : undefined
						}),
						errors.destinationType ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.destinationType) : null
					),

					form.destinationType === '其他' ? React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, reqStar, '目的地所在区域'),
						React.createElement(Cascader, {
							placeholder: '请选择省 / 市',
							style: controlStyle,
							options: destinationRegionOptions,
							value: form.destinationRegion,
							onChange: function (v) { updateForm({ destinationRegion: v }); },
							allowClear: true,
							changeOnSelect: false,
							status: errors.destinationRegion ? 'error' : undefined
						}),
						errors.destinationRegion ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.destinationRegion) : null
					) : undefined,
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, reqStar, form.destinationType === '其他' ? '目的地名称' : destinationNameLabel),
						destinationNameNode,
						errors.destinationName ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.destinationName) : null
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, reqStar, '异动类型'),
						React.createElement(Select, {
							placeholder: '请选择异动类型',
							style: controlStyle,
							value: form.changeType,
							onChange: function (v) { updateForm({ changeType: v }); },
							allowClear: true,
							options: changeTypeOptions,
							status: errors.changeType ? 'error' : undefined
						}),
						errors.changeType ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.changeType) : null
					),

					React.createElement('div', { style: Object.assign({}, formItemStyle, { gridColumn: 'span 3' }) },
						React.createElement('div', { style: labelStyle }, '备注'),
						React.createElement(Input.TextArea, {
							placeholder: '请输入备注',
							value: form.remark,
							onChange: function (e) { updateForm({ remark: e.target.value }); },
							autoSize: { minRows: 3, maxRows: 6 }
						})
					)
				)
			),

			React.createElement(Card, { title: '车辆信息', style: { marginBottom: 16 } },
				errors.vehicleList ? React.createElement('div', { style: { marginBottom: 12, color: '#ff4d4f', fontSize: 12 } }, errors.vehicleList) : null,
				React.createElement(Table, {
					rowKey: 'id',
					columns: vehicleColumns,
					dataSource: vehicles,
					size: 'small',
					pagination: false,
					scroll: { x: 1410 }
				}),
				React.createElement(Button, { type: 'dashed', style: { marginTop: 12, width: '100%' }, onClick: addRow }, '新增一行')
			),

			React.createElement('div', { style: { height: 56 } }),
			React.createElement('div', {
				style: {
					position: 'fixed',
					left: 0,
					right: 0,
					bottom: 0,
					padding: '12px 24px',
					background: '#fff',
					borderTop: '1px solid #f0f0f0',
					display: 'flex',
					gap: 8,
					zIndex: 10
				}
			},
				React.createElement(Button, { type: 'primary', onClick: handleSubmitAudit }, '提交审核'),
				React.createElement(Button, { onClick: handleSave }, '保存'),
				React.createElement(Button, { onClick: handleCancel }, '取消')
			)
		)
	);
};

