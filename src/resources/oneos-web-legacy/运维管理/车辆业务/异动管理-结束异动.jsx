// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 异动管理 - 结束异动

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
	var DatePicker = antd.DatePicker;
	var Table = antd.Table;
	var Modal = antd.Modal;
	var message = antd.message;

	function getInitialDateTime(str) {
		try {
			if (window.dayjs) return window.dayjs(str);
		} catch (e1) {}
		try {
			if (window.moment) return window.moment(str, 'YYYY-MM-DD HH:mm');
		} catch (e2) {}
		return null;
	}

	function fmtPlannedMileage(v) {
		if (v == null || v === '') return '-';
		var n = Number(v);
		if (isNaN(n)) return String(v);
		return n.toFixed(2);
	}

	function fmtNum2Display(v) {
		if (v === null || v === undefined || v === '') return '';
		var n = Number(v);
		if (isNaN(n)) return String(v);
		return n.toFixed(2);
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

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh', paddingBottom: 80 };
	var labelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var formItemStyle = { marginBottom: 12 };
	var controlStyle = { width: '100%' };
	var placeholderSelectVehicle = '请先选择车辆';
	var requiredMarkStyle = { color: '#ff4d4f', marginRight: 4, fontFamily: 'SimSun, sans-serif' };

	function labelWithRequired(text, required) {
		return React.createElement('div', { style: labelStyle },
			required ? React.createElement('span', { style: requiredMarkStyle }, '*') : null,
			text
		);
	}

	var destinationTypeOptions = useMemo(function () {
		return [
			{ value: '停车场', label: '停车场' },
			{ value: '维修站', label: '维修站' },
			{ value: '其他', label: '其他' }
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

	// 原型：从列表跳转带入的异动与车辆（联调时由路由/接口填充）
	var movementReadonly = useMemo(function () {
		return {
			startTime: getInitialDateTime('2026-02-24 08:15'),
			plannedEndTime: getInitialDateTime('2026-02-24 12:00'),
			destinationType: '其他',
			destinationName: '车管所检测线',
			changeType: '年审',
			remark: '年审上线检测，预计半日完成。'
		};
	}, []);

	// 车辆信息：结束里程/氢量/电量可编辑（规则同新增页开始三项）
	var vehiclesState = useState([
		{
			id: 1,
			plateNo: '粤B11111',
			vehicleType: '轿车',
			brand: '比亚迪',
			model: '汉',
			departParking: '南山科技园停车场',
			plannedMileageKm: '8.20',
			startMileageKm: '8020.50',
			startHydrogen: '55.00',
			h2Unit: '%',
			startElectricKwh: '62.10',
			endMileageKm: '8055.20',
			endHydrogen: '52.30',
			endElectricKwh: '58.88'
		}
	]);
	var vehicles = vehiclesState[0];
	var setVehicles = vehiclesState[1];

	var updateVehicleRow = useCallback(function (index, patch) {
		setVehicles(function (prev) {
			var list = prev.slice();
			var cur = list[index] || {};
			list[index] = Object.assign({}, cur, patch);
			return list;
		});
	}, []);

	// 1.6 异动结束时间：必填，YYYY-MM-DD HH:mm
	var endDateTimeState = useState(getInitialDateTime('2026-02-24 11:30'));
	var endDateTime = endDateTimeState[0];
	var setEndDateTime = endDateTimeState[1];

	function rowVehicleSelected(r) {
		return !!(r && String(r.plateNo || '').trim());
	}

	var vehicleColumns = useMemo(function () {
		return [
			{
				title: '车牌号',
				key: 'plateNo',
				width: 140,
				fixed: 'left',
				render: function (_, r) {
					return React.createElement(Input, { value: r.plateNo || '-', disabled: true });
				}
			},
			{
				title: '车辆类型',
				key: 'vehicleType',
				width: 120,
				render: function (_, r) {
					return React.createElement(Input, { value: rowVehicleSelected(r) ? (r.vehicleType || '-') : '请先选择车辆', disabled: true });
				}
			},
			{
				title: '品牌',
				key: 'brand',
				width: 100,
				render: function (_, r) {
					return React.createElement(Input, { value: rowVehicleSelected(r) ? (r.brand || '-') : '请先选择车辆', disabled: true });
				}
			},
			{
				title: '型号',
				key: 'model',
				width: 120,
				render: function (_, r) {
					return React.createElement(Input, { value: rowVehicleSelected(r) ? (r.model || '-') : '请先选择车辆', disabled: true });
				}
			},
			{
				title: '出发停车场',
				key: 'departParking',
				width: 160,
				render: function (_, r) {
					return React.createElement(Input, { value: rowVehicleSelected(r) ? (r.departParking || '-') : '请先选择车辆', disabled: true });
				}
			},
			{
				title: '预计异动里程',
				key: 'plannedMileageKm',
				width: 160,
				render: function (_, r) {
					if (!rowVehicleSelected(r)) {
						return React.createElement(Input, { value: '', disabled: true, placeholder: placeholderSelectVehicle });
					}
					return React.createElement(Input, {
						value: fmtPlannedMileage(r.plannedMileageKm),
						disabled: true,
						addonAfter: 'km'
					});
				}
			},
			{
				title: '异动开始里程',
				key: 'startMileageKm',
				width: 160,
				render: function (_, r) {
					return React.createElement(Input, {
						value: rowVehicleSelected(r) ? fmtNum2Display(r.startMileageKm) : '',
						disabled: true,
						addonAfter: 'km',
						placeholder: rowVehicleSelected(r) ? undefined : placeholderSelectVehicle
					});
				}
			},
			{
				title: React.createElement('span', null, React.createElement('span', { style: requiredMarkStyle }, '*'), '异动结束里程'),
				key: 'endMileageKm',
				width: 160,
				render: function (_, r, index) {
					if (!rowVehicleSelected(r)) {
						return React.createElement(Input, { value: '', disabled: true, placeholder: placeholderSelectVehicle });
					}
					return React.createElement(Input, {
						value: r.endMileageKm,
						onChange: function (e) { updateVehicleRow(index, { endMileageKm: toFixed2Input(e.target.value) }); },
						placeholder: '0.00',
						addonAfter: 'km'
					});
				}
			},
			{
				title: '异动开始氢量',
				key: 'startHydrogen',
				width: 150,
				render: function (_, r) {
					var unit = rowVehicleSelected(r) ? (r.h2Unit || '') : '';
					return React.createElement(Input, Object.assign({
						value: rowVehicleSelected(r) ? fmtNum2Display(r.startHydrogen) : '',
						disabled: true,
						placeholder: rowVehicleSelected(r) ? undefined : placeholderSelectVehicle
					}, unit ? { addonAfter: unit } : {}));
				}
			},
			{
				title: React.createElement('span', null, React.createElement('span', { style: requiredMarkStyle }, '*'), '异动结束氢量'),
				key: 'endHydrogen',
				width: 150,
				render: function (_, r, index) {
					if (!rowVehicleSelected(r)) {
						return React.createElement(Input, { value: '', disabled: true, placeholder: placeholderSelectVehicle });
					}
					var unit = r.h2Unit || '';
					return React.createElement(Input, Object.assign({
						value: r.endHydrogen,
						onChange: function (e) { updateVehicleRow(index, { endHydrogen: toFixed2Input(e.target.value) }); },
						placeholder: '0.00'
					}, unit ? { addonAfter: unit } : {}));
				}
			},
			{
				title: '异动开始电量',
				key: 'startElectricKwh',
				width: 150,
				render: function (_, r) {
					return React.createElement(Input, {
						value: rowVehicleSelected(r) ? fmtNum2Display(r.startElectricKwh) : '',
						disabled: true,
						addonAfter: 'kWh',
						placeholder: rowVehicleSelected(r) ? undefined : placeholderSelectVehicle
					});
				}
			},
			{
				title: React.createElement('span', null, React.createElement('span', { style: requiredMarkStyle }, '*'), '异动结束电量'),
				key: 'endElectricKwh',
				width: 150,
				render: function (_, r, index) {
					if (!rowVehicleSelected(r)) {
						return React.createElement(Input, { value: '', disabled: true, placeholder: placeholderSelectVehicle });
					}
					return React.createElement(Input, {
						value: r.endElectricKwh,
						onChange: function (e) { updateVehicleRow(index, { endElectricKwh: toFixed2Input(e.target.value) }); },
						placeholder: '0.00',
						addonAfter: 'kWh'
					});
				}
			}
		];
	}, [updateVehicleRow]);

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	var requirementDocContent = [
		'一个「数字化资产ONEOS运管平台」中的「异动管理」「结束异动」模块',
		'#面包屑：运维管理-车辆业务-异动管理-结束异动',
		'',
		'1.异动情况：',
		'1.1.异动开始日期：显示异动开始日期：YYYY-MM-DD HH:MM；',
		'1.2.异动预计结束日期：显示异动预计结束日期，格式为：YYYY-MM-DD HH:MM；',
		'1.3.异动目的地：显示异动目的地，包括：停车场、维修站、其他；',
		'1.4.目的地名称：显示目的地名称，包括：停车场名称、维修站名称、其他；',
		'1.5.异动类型：显示异动类型，包括：维修、保养、年审、其他；',
		'1.6.异动结束时间：必填项，日期选择器，格式为：YYYY-MM-DD HH:MM；',
		'1.7.备注：显示备注信息；',
		'',
		'2.车辆信息：',
		'2.1.车牌号：输入框（禁用），显示车牌号；',
		'2.2.车辆类型：根据所选车辆类型自动反写，默认提示为请先选择车辆；',
		'2.3.品牌：根据所选车辆品牌自动反写，默认提示为请先选择车辆；',
		'2.4.型号：根据所选车辆型号自动反写，默认提示为请先选择车辆；',
		'2.5.出发停车场：根据所选车辆出发时停车场自动反写，默认提示为请先选择车辆；',
		'2.6.预计异动里程：显示预计异动里程，支持2位小数，后缀为km；',
		'2.7.异动开始里程：输入框（禁用），精确至2位小数，后缀为km；',
		'2.8.异动结束里程：必填项，输入框，精确至2位小数，后缀为km；',
		'2.9.异动开始氢量：输入框（禁用），精确至2位小数，后缀为%或MPa，根据所选车辆型号中获取；',
		'2.10.异动结束氢量：必填项，输入框，精确至2位小数，后缀为%或MPa，根据所选车辆型号中获取；',
		'2.11.异动开始电量：输入框（禁用），精确至2位小数，后缀为kWh；',
		'2.12.异动结束电量：必填项，输入框，精确至2位小数，后缀为kWh；',
		'2.13.异动结束电量：必填项，输入框，精确至2位小数，后缀为kWh；',
		'',
		'3.底部为提交、取消；',
		'3.1.提交：提交进行必填项校验，提交成功后计入历史记录；',
		'3.2.取消：点击取消，返回列表；'
	].join('\n');

	var handleSubmit = useCallback(function () {
		if (!endDateTime) {
			message.error('请选择异动结束时间');
			return;
		}
		for (var i = 0; i < (vehicles || []).length; i++) {
			var r = vehicles[i];
			if (!rowVehicleSelected(r)) continue;
			if (!String(r.endMileageKm || '').trim()) {
				message.error('请填写异动结束里程');
				return;
			}
			if (!String(r.endHydrogen || '').trim()) {
				message.error('请填写异动结束氢量');
				return;
			}
			if (!String(r.endElectricKwh || '').trim()) {
				message.error('请填写异动结束电量');
				return;
			}
		}
		message.success('提交成功（原型，联调时对接结束异动接口）');
	}, [vehicles, endDateTime]);

	var handleCancel = useCallback(function () {
		message.info('取消并返回（原型，联调时路由返回上一页）');
	}, []);

	var destLabel = movementReadonly.destinationType === '维修站' ? '维修站名称' : (movementReadonly.destinationType === '停车场' ? '停车场名称' : '目的地名称');

	return React.createElement(App, null,
		React.createElement('div', { style: layoutStyle },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 } },
				React.createElement(Breadcrumb, { items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '异动管理' }, { title: '结束异动' }] }),
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
						React.createElement('div', { style: labelStyle }, '异动开始日期'),
						React.createElement(DatePicker, {
							style: controlStyle,
							showTime: { format: 'HH:mm' },
							format: 'YYYY-MM-DD HH:mm',
							value: movementReadonly.startTime,
							disabled: true,
							inputReadOnly: true
						})
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '异动预计结束日期'),
						React.createElement(DatePicker, {
							style: controlStyle,
							showTime: { format: 'HH:mm' },
							format: 'YYYY-MM-DD HH:mm',
							value: movementReadonly.plannedEndTime,
							disabled: true,
							inputReadOnly: true
						})
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '异动目的地'),
						React.createElement(Select, {
							style: controlStyle,
							value: movementReadonly.destinationType,
							options: destinationTypeOptions,
							disabled: true
						})
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, destLabel),
						React.createElement(Input, { value: movementReadonly.destinationName || '-', disabled: true })
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '异动类型'),
						React.createElement(Select, {
							style: controlStyle,
							value: movementReadonly.changeType,
							options: changeTypeOptions,
							disabled: true
						})
					),
					React.createElement('div', { style: formItemStyle },
						labelWithRequired('异动结束时间', true),
						React.createElement(DatePicker, {
							style: controlStyle,
							showTime: { format: 'HH:mm' },
							format: 'YYYY-MM-DD HH:mm',
							value: endDateTime,
							onChange: function (d) { setEndDateTime(d); },
							placeholder: '请选择异动结束时间'
						})
					),
					React.createElement('div', { style: Object.assign({}, formItemStyle, { gridColumn: 'span 3' }) },
						React.createElement('div', { style: labelStyle }, '备注'),
						React.createElement(Input.TextArea, {
							value: movementReadonly.remark || '-',
							disabled: true,
							autoSize: { minRows: 3, maxRows: 6 }
						})
					)
				)
			),

			React.createElement(Card, { title: '车辆信息', style: { marginBottom: 16 } },
				React.createElement(Table, {
					rowKey: 'id',
					columns: vehicleColumns,
					dataSource: vehicles,
					size: 'small',
					pagination: false,
					scroll: { x: 1940 }
				})
			),

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
				React.createElement(Button, { type: 'primary', onClick: handleSubmit }, '提交'),
				React.createElement(Button, { onClick: handleCancel }, '取消')
			)
		)
	);
};
