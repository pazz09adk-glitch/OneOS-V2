// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 异动管理 - 查看（布局对齐「结束异动」，全部只读）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;

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

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh', paddingBottom: 80 };
	var labelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var formItemStyle = { marginBottom: 12 };
	var controlStyle = { width: '100%' };
	var placeholderSelectVehicle = '请先选择车辆';

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

	var approvalStatusOptions = useMemo(function () {
		return [
			{ value: '待提交', label: '待提交' },
			{ value: '审批中', label: '审批中' },
			{ value: '审批完成', label: '审批完成' },
			{ value: '驳回', label: '驳回' },
			{ value: '撤回', label: '撤回' }
		];
	}, []);

	// 原型：详情接口返回（联调时由路由/接口填充）；字段布局对齐「结束异动」
	var movementReadonly = useMemo(function () {
		return {
			startTime: getInitialDateTime('2026-02-20 09:30'),
			plannedEndTime: getInitialDateTime('2026-02-22 18:00'),
			destinationType: '维修站',
			destinationName: '广州天河维修站',
			changeType: '维修',
			remark: '车辆需进站检修制动系统，预计两日内完成。',
			approvalStatus: '审批中',
			endDateTime: getInitialDateTime('2026-02-22 17:45')
		};
	}, []);

	// 查看页仅展示单辆车（1 条记录；联调时详情接口按单车辆返回）
	var vehicles = useMemo(function () {
		return [
			{
				id: 1,
				plateNo: '粤A12345',
				vehicleType: '厢式货车',
				brand: '东风',
				model: 'DFH1180',
				departParking: '天河智慧停车场',
				plannedMileageKm: '45.50',
				startMileageKm: '15230.12',
				startHydrogen: '28.30',
				h2Unit: 'MPa',
				startElectricKwh: '68.40',
				endMileageKm: '15280.55',
				endHydrogen: '26.80',
				endElectricKwh: '70.00'
			}
		];
	}, []);

	function rowVehicleSelected(r) {
		return !!(r && String(r.plateNo || '').trim());
	}

	var destLabel = movementReadonly.destinationType === '维修站' ? '维修站名称' : (movementReadonly.destinationType === '停车场' ? '停车场名称' : '目的地名称');

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
				title: '异动结束里程',
				key: 'endMileageKm',
				width: 160,
				render: function (_, r) {
					if (!rowVehicleSelected(r)) {
						return React.createElement(Input, { value: '', disabled: true, placeholder: placeholderSelectVehicle });
					}
					return React.createElement(Input, {
						value: fmtNum2Display(r.endMileageKm),
						disabled: true,
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
				title: '异动结束氢量',
				key: 'endHydrogen',
				width: 150,
				render: function (_, r) {
					if (!rowVehicleSelected(r)) {
						return React.createElement(Input, { value: '', disabled: true, placeholder: placeholderSelectVehicle });
					}
					var unit = r.h2Unit || '';
					return React.createElement(Input, Object.assign({
						value: fmtNum2Display(r.endHydrogen),
						disabled: true
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
				title: '异动结束电量',
				key: 'endElectricKwh',
				width: 150,
				render: function (_, r) {
					if (!rowVehicleSelected(r)) {
						return React.createElement(Input, { value: '', disabled: true, placeholder: placeholderSelectVehicle });
					}
					return React.createElement(Input, {
						value: fmtNum2Display(r.endElectricKwh),
						disabled: true,
						addonAfter: 'kWh'
					});
				}
			}
		];
	}, []);

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	var requirementDocContent = [
		'一个「数字化资产ONEOS运管平台」中的「异动管理」「查看」模块',
		'#面包屑：运维管理-车辆业务-异动管理-查看',
		'页面布局与字段与「异动管理-结束异动」一致；另含「审批状态」只读展示。',
		'所有表单项、表格单元均为禁用只读，仅供查询展示。',
		'',
		'1.异动情况：第一行开始/预计结束/目的地；第二行目的地名称、异动类型、审批状态（第三列）；第三行异动结束时间（首列）；备注跨三列 — 全部只读（不含预计异动里程）。',
		'2.车辆信息：在出发停车场后展示预计异动里程（用例值，只读）；其余与结束异动表列一致（含开始/结束里程、氢量、电量）；仅 1 行；无新增行与删除。',
		'3.底部仅「返回」按钮，返回异动管理列表（原型）。'
	].join('\n');

	return React.createElement(App, null,
		React.createElement('div', { style: layoutStyle },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 } },
				React.createElement(Breadcrumb, { items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '异动管理' }, { title: '查看' }] }),
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
						React.createElement('div', { style: labelStyle }, '审批状态'),
						React.createElement(Select, {
							style: controlStyle,
							value: movementReadonly.approvalStatus,
							options: approvalStatusOptions,
							disabled: true
						})
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '异动结束时间'),
						React.createElement(DatePicker, {
							style: controlStyle,
							showTime: { format: 'HH:mm' },
							format: 'YYYY-MM-DD HH:mm',
							value: movementReadonly.endDateTime,
							disabled: true,
							inputReadOnly: true
						})
					),
					React.createElement('div', { style: formItemStyle }),
					React.createElement('div', { style: formItemStyle }),
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
				React.createElement(Button, { onClick: function () { message.info('返回异动管理列表（原型）'); } }, '返回')
			)
		)
	);
};
