// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 调拨管理 - 接收信息（数字化资产 ONEOS 运管平台）
// 本页用例：调拨方式为「司机运输」

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var App = antd.App;
	var Breadcrumb = antd.Breadcrumb;
	var Button = antd.Button;
	var Card = antd.Card;
	var DatePicker = antd.DatePicker;
	var Input = antd.Input;
	var Modal = antd.Modal;
	var Select = antd.Select;
	var Table = antd.Table;
	var message = antd.message;

	var METHOD_DRIVER = '司机运输';

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function getMockSnapshot() {
		return {
			transferDateStr: '2026-03-31 10:30',
			departRegionText: '广东省-广州市',
			receiveRegionText: '浙江省-嘉兴市',
			reason: '华南业务增量，需将车辆调至华东仓储节点保障运力。',
			method: METHOD_DRIVER,
			transportLeader: '李建国',
			transportPhone: '13800138000',
			receivePersonName: '王芳',
			transferVehicles: [
				{
					id: 1,
					brand: '小鹏',
					model: 'P7',
					plateNo: '浙A11111',
					departMileageKm: '12010.00',
					departHydrogen: '60.00',
					h2Unit: '%',
					departElectricKwh: '55.20',
					departParking: '西湖景区停车场'
				},
				{
					id: 2,
					brand: '蔚来',
					model: 'ET5',
					plateNo: '浙B22222',
					departMileageKm: '15010.00',
					departHydrogen: '22.10',
					h2Unit: 'MPa',
					departElectricKwh: '58.00',
					departParking: '宁波江北停车场'
				}
			]
		};
	}

	var layoutStyle = { padding: '16px 24px 88px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var labelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var formItemStyle = { marginBottom: 12 };
	var controlStyle = { width: '100%' };
	var readOnlyStyle = { background: 'rgba(0,0,0,0.02)' };
	var reqStarStyle = { color: '#ff4d4f', marginRight: 4 };
	var reqStar = React.createElement('span', { style: reqStarStyle }, '*');

	var snapshot = useMemo(function () {
		return getMockSnapshot();
	}, []);

	function buildVehicleRows(snap) {
		return (snap.transferVehicles || []).map(function (r) {
			return {
				id: r.id,
				brand: r.brand,
				model: r.model,
				plateNo: r.plateNo,
				departParking: r.departParking || '',
				departMileageKm: r.departMileageKm != null ? String(r.departMileageKm) : '',
				departHydrogen: r.departHydrogen != null ? String(r.departHydrogen) : '',
				h2Unit: r.h2Unit || '%',
				departElectricKwh: r.departElectricKwh != null ? String(r.departElectricKwh) : '',
				arriveMileageKm: '',
				arriveHydrogen: '',
				arriveElectricKwh: ''
			};
		});
	}

	var receiveTimeState = useState(null);
	var receiveTime = receiveTimeState[0];
	var setReceiveTime = receiveTimeState[1];

	var receiveParkingState = useState(undefined);
	var receiveParking = receiveParkingState[0];
	var setReceiveParking = receiveParkingState[1];

	var parkingOptions = useMemo(function () {
		return [
			{ value: 'p1', label: '西湖景区停车场' },
			{ value: 'p2', label: '宁波江北停车场' },
			{ value: 'p3', label: '张江园区停车场' },
			{ value: 'p4', label: '天河智慧停车场' }
		];
	}, []);

	var vehiclesState = useState(function () {
		return buildVehicleRows(getMockSnapshot());
	});
	var vehicles = vehiclesState[0];
	var setVehicles = vehiclesState[1];

	var errorsState = useState({});
	var errors = errorsState[0];
	var setErrors = errorsState[1];

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	var requirementDocContent = [
		'一个「数字化资产ONEOS运管平台」中的「调拨管理」「接收信息」模块',
		'',
		'1.调拨情况：',
		'1.1.调拨日期：反写新增调拨时的调拨日期，格式为：YYYY-MM-DD HH:mm；',
		'1.2.出发区域：反写新增调拨时的出发区域，格式为：省-市；',
		'1.3.接收区域：反写新增调拨时的接收区域，格式为：省-市；',
		'1.4.调拨原因：反写新增调拨时的调拨原因；',
		'',
		'2.调拨信息：',
		'2.1.调拨方式：反写调拨信息提交时的调拨方式，该用例请列举调拨方式为：司机运输；',
		'2.2.运输负责人：反写调拨信息提交时的运输负责人；',
		'2.3.运输方联系方式：反写调拨信息提交时的运输方联系方式；',
		'2.6.接收人员：反写调拨信息提交时的接收人员姓名；',
		'',
		'3.接收信息：',
		'3.1.接收时间：日期选择器，精确至分钟，格式：YYYY-MM-DD HH:mm；',
		'3.2.停车场：必填项，选择器，直接选择已有停车场；',
		'',
		'4.调拨车辆清单；',
		'#以表格方式展示，反写新增调拨时的整个清单：',
		'4.1.品牌：反写新增调拨时的品牌；',
		'4.2.型号：反写新增调拨时的型号；',
		'4.3.车牌号：反写调拨信息提交时的车牌号；',
		'4.4.出发时里程：反写调拨信息提交时的里程数，只有调拨方式为司机运输时显示；',
		'4.5.到达时里程：必填项，输入框，支持2位小数，后缀为km，只有调拨方式为司机运输时显示；',
		'4.6.出发时氢量：反写调拨信息提交时的氢量，只有调拨方式为司机运输时显示；',
		'4.7.到达时氢量：必填项，输入框，支持2位小数，后缀为%或MPa（取自对应车辆该型号对应型号参数下仪表盘单位），只有调拨方式为司机运输时显示；',
		'4.8.出发时电量：反写调拨信息提交时的电量，只有调拨方式为司机运输时显示；',
		'4.9.到达时电量：必填项，输入框，支持2位小数，后缀为kWh，只有调拨方式为司机运输时显示；',
		'',
		'5.底部按钮为提交、保存、取消；',
		'5.1.提交：点击提交审核校验必填项，提交成功后将调拨车辆最终停车区域同步到车辆列表停车场中；',
		'5.2.保存：不校验必填项，只保存已填数据并保存在列表页；'
	].join('\n');

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

	var updateRow = useCallback(function (index, patch) {
		setVehicles(function (prev) {
			var list = prev.slice();
			var cur = list[index] || {};
			list[index] = Object.assign({}, cur, patch);
			return list;
		});
	}, []);

	function runValidate() {
		var e = {};
		if (!receiveTime) e.receiveTime = '请选择接收时间';
		if (!receiveParking) e.receiveParking = '请选择停车场';
		for (var i = 0; i < (vehicles || []).length; i++) {
			var r = vehicles[i] || {};
			if (!String(r.arriveMileageKm || '').trim()) e['row_' + i + '_arrMile'] = '请输入到达时里程';
			if (!String(r.arriveHydrogen || '').trim()) e['row_' + i + '_arrH2'] = '请输入到达时氢量';
			if (!String(r.arriveElectricKwh || '').trim()) e['row_' + i + '_arrKwh'] = '请输入到达时电量';
		}
		setErrors(e);
		return { ok: Object.keys(e).length === 0, err: e };
	}

	var handleSubmit = useCallback(function () {
		var result = runValidate();
		if (!result.ok) {
			message.error('请完善必填项');
			return;
		}
		Modal.confirm({
			title: '确认提交？',
			content: '提交后将进入后续流程（原型）。',
			okText: '提交',
			cancelText: '取消',
			onOk: function () {
				message.success('已提交（原型）');
			}
		});
	}, [receiveTime, receiveParking, vehicles]);

	var handleSave = useCallback(function () {
		message.success('已保存至列表页（原型：不校验必填项）');
	}, []);

	var handleCancel = useCallback(function () {
		Modal.confirm({
			title: '是否确认取消',
			content: '未保存的修改将丢失，是否确认？',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				message.info('返回上一页（原型）');
			}
		});
	}, []);

	var vehicleColumns = useMemo(function () {
		return [
			{
				title: '品牌',
				key: 'brand',
				width: 120,
				render: function (_, r) {
					return React.createElement(Input, { value: r.brand || '', readOnly: true, style: readOnlyStyle });
				}
			},
			{
				title: '型号',
				key: 'model',
				width: 120,
				render: function (_, r) {
					return React.createElement(Input, { value: r.model || '', readOnly: true, style: readOnlyStyle });
				}
			},
			{
				title: '车牌号',
				key: 'plateNo',
				width: 140,
				render: function (_, r) {
					return React.createElement(Input, { value: r.plateNo || '', readOnly: true, style: readOnlyStyle });
				}
			},
			{
				title: '出发停车场',
				key: 'departParking',
				width: 180,
				render: function (_, r) {
					return React.createElement(Input, { value: r.departParking || '', readOnly: true, style: readOnlyStyle });
				}
			},
			{
				title: '出发时里程',
				key: 'departMileageKm',
				width: 130,
				render: function (_, r) {
					return React.createElement(Input, { value: r.departMileageKm || '', disabled: true, addonAfter: 'km' });
				}
			},
			{
				title: React.createElement('span', null, reqStar, '到达时里程'),
				key: 'arriveMileageKm',
				width: 140,
				render: function (_, r, index) {
					var k = 'row_' + index + '_arrMile';
					return React.createElement(Input, {
						value: r.arriveMileageKm,
						onChange: function (e) { updateRow(index, { arriveMileageKm: toFixed2Input(e.target.value) }); },
						placeholder: '0.00',
						addonAfter: 'km',
						status: errors[k] ? 'error' : undefined
					});
				}
			},
			{
				title: '出发时氢量',
				key: 'departHydrogen',
				width: 130,
				render: function (_, r) {
					return React.createElement(Input, { value: r.departHydrogen || '', disabled: true, addonAfter: r.h2Unit || '-' });
				}
			},
			{
				title: React.createElement('span', null, reqStar, '到达时氢量'),
				key: 'arriveHydrogen',
				width: 140,
				render: function (_, r, index) {
					var k = 'row_' + index + '_arrH2';
					return React.createElement(Input, {
						value: r.arriveHydrogen,
						onChange: function (e) { updateRow(index, { arriveHydrogen: toFixed2Input(e.target.value) }); },
						placeholder: '0.00',
						addonAfter: r.h2Unit || '%',
						status: errors[k] ? 'error' : undefined
					});
				}
			},
			{
				title: '出发时电量',
				key: 'departElectricKwh',
				width: 130,
				render: function (_, r) {
					return React.createElement(Input, { value: r.departElectricKwh || '', disabled: true, addonAfter: 'kWh' });
				}
			},
			{
				title: React.createElement('span', null, reqStar, '到达时电量'),
				key: 'arriveElectricKwh',
				width: 140,
				render: function (_, r, index) {
					var k = 'row_' + index + '_arrKwh';
					return React.createElement(Input, {
						value: r.arriveElectricKwh,
						onChange: function (e) { updateRow(index, { arriveElectricKwh: toFixed2Input(e.target.value) }); },
						placeholder: '0.00',
						addonAfter: 'kWh',
						status: errors[k] ? 'error' : undefined
					});
				}
			}
		];
	}, [errors, updateRow]);

	return React.createElement(
		App,
		null,
		React.createElement(
			'div',
			{ style: layoutStyle },
			React.createElement(
				'div',
				{
					style: {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: 16,
						flexWrap: 'wrap',
						gap: 8
					}
				},
				React.createElement(Breadcrumb, { items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '调拨管理' }, { title: '接收信息' }] }),
				React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { setRequirementModalOpen(true); } }, '查看需求说明')
			),

			React.createElement(
				Modal,
				{
					title: '需求说明',
					open: requirementModalOpen,
					onCancel: function () { setRequirementModalOpen(false); },
					width: 760,
					footer: React.createElement(Button, { onClick: function () { setRequirementModalOpen(false); } }, '关闭'),
					bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
				},
				React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.65, color: 'rgba(0,0,0,0.85)' } }, requirementDocContent)
			),

			React.createElement(
				Card,
				{ title: '调拨情况', style: { marginBottom: 16 } },
				React.createElement(
					'div',
					{ style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', alignItems: 'start' } },
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '调拨日期'),
						React.createElement(Input, { value: snapshot.transferDateStr, readOnly: true, style: readOnlyStyle })
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '出发区域'),
						React.createElement(Input, { value: snapshot.departRegionText, readOnly: true, style: readOnlyStyle })
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '接收区域'),
						React.createElement(Input, { value: snapshot.receiveRegionText, readOnly: true, style: readOnlyStyle })
					),
					React.createElement(
						'div',
						{ style: Object.assign({}, formItemStyle, { gridColumn: 'span 3' }) },
						React.createElement('div', { style: labelStyle }, '调拨原因'),
						React.createElement(Input.TextArea, { value: snapshot.reason, readOnly: true, style: readOnlyStyle, autoSize: { minRows: 3, maxRows: 6 } })
					)
				)
			),

			React.createElement(
				Card,
				{ title: '调拨信息', style: { marginBottom: 16 } },
				React.createElement(
					'div',
					{ style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', alignItems: 'start' } },
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '调拨方式'),
						React.createElement(Input, { value: snapshot.method, readOnly: true, style: readOnlyStyle })
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '运输负责人'),
						React.createElement(Input, { value: snapshot.transportLeader, readOnly: true, style: readOnlyStyle })
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '运输方联系方式'),
						React.createElement(Input, { value: snapshot.transportPhone, readOnly: true, style: readOnlyStyle })
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '接收人员'),
						React.createElement(Input, { value: snapshot.receivePersonName, readOnly: true, style: readOnlyStyle })
					)
				)
			),

			React.createElement(
				Card,
				{ title: '接收信息', style: { marginBottom: 16 } },
				React.createElement(
					'div',
					{ style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', alignItems: 'start' } },
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, reqStar, '接收时间'),
						React.createElement(DatePicker, {
							style: controlStyle,
							format: 'YYYY-MM-DD HH:mm',
							showTime: { format: 'HH:mm' },
							placeholder: '请选择接收时间',
							value: receiveTime,
							onChange: function (v) { setReceiveTime(v); },
							status: errors.receiveTime ? 'error' : undefined
						}),
						errors.receiveTime ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.receiveTime) : null
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, reqStar, '停车场'),
						React.createElement(Select, {
							placeholder: '请选择停车场',
							style: controlStyle,
							value: receiveParking,
							onChange: function (v) { setReceiveParking(v); },
							allowClear: true,
							showSearch: true,
							options: parkingOptions,
							filterOption: filterOption,
							status: errors.receiveParking ? 'error' : undefined
						}),
						errors.receiveParking ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.receiveParking) : null
					)
				)
			),

			React.createElement(
				Card,
				{ title: '调拨车辆清单', style: { marginBottom: 16 } },
				React.createElement(Table, {
					rowKey: 'id',
					columns: vehicleColumns,
					dataSource: vehicles,
					size: 'small',
					pagination: false,
					scroll: { x: 'max-content' }
				})
			),

			React.createElement('div', { style: { height: 56 } }),
			React.createElement(
				'div',
				{
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
				React.createElement(Button, { onClick: handleSave }, '保存'),
				React.createElement(Button, { onClick: handleCancel }, '取消')
			)
		)
	);
};

