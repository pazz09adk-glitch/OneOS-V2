// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 调拨管理 - 查看（只读）

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
	var Table = antd.Table;
	var message = antd.message;

	function parseDateTime(s) {
		var str = String(s || '').trim();
		if (!str) return null;
		try {
			if (window.dayjs) return window.dayjs(str);
		} catch (e1) {}
		try {
			if (window.moment) return window.moment(str, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD'], true);
		} catch (e2) {}
		return null;
	}

	function getMockSnapshot() {
		return {
			transferDateStr: '2026-03-31 10:30',
			departRegionText: '广东省-广州市',
			receiveRegionText: '浙江省-嘉兴市',
			reason: '华南业务增量，需将车辆调至华东仓储节点保障运力。',
			method: '司机运输',
			transportLeader: '李建国',
			transportPhone: '13800138000',
			receivePersonName: '王芳',
			receiveTimeStr: '2026-04-01 15:20',
			receiveParkingName: '西湖景区停车场',
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
					departParking: '西湖景区停车场',
					arriveMileageKm: '12110.20',
					arriveHydrogen: '58.00',
					arriveElectricKwh: '52.30'
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
					departParking: '宁波江北停车场',
					arriveMileageKm: '15120.00',
					arriveHydrogen: '21.80',
					arriveElectricKwh: '57.50'
				}
			]
		};
	}

	var layoutStyle = { padding: '16px 24px 88px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var labelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var formItemStyle = { marginBottom: 12 };
	var controlStyle = { width: '100%' };
	var readOnlyStyle = { background: 'rgba(0,0,0,0.02)' };

	var snapshot = useMemo(function () { return getMockSnapshot(); }, []);

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	var requirementDocContent = [
		'一个「数字化资产ONEOS运管平台」中的「调拨管理」「查看」模块（只读）',
		'#面包屑：运维管理-车辆业务-调拨管理-查看',
		'参照「调拨管理-接收信息-司机运输」页面结构生成查看页：',
		'1.调拨情况（只读）',
		'2.调拨信息（只读）',
		'3.接收信息（只读）：接收时间、停车场（直接展示所选停车场名称）',
		'4.调拨车辆清单（只读，包含到达时里程/氢量/电量）',
		'5.底部按钮仅保留「返回」。'
	].join('\n');

	var vehicleColumns = useMemo(function () {
		return [
			{ title: '品牌', key: 'brand', width: 120, render: function (_, r) { return React.createElement(Input, { value: r.brand || '', readOnly: true, style: readOnlyStyle }); } },
			{ title: '型号', key: 'model', width: 120, render: function (_, r) { return React.createElement(Input, { value: r.model || '', readOnly: true, style: readOnlyStyle }); } },
			{ title: '车牌号', key: 'plateNo', width: 140, render: function (_, r) { return React.createElement(Input, { value: r.plateNo || '', readOnly: true, style: readOnlyStyle }); } },
			{ title: '出发停车场', key: 'departParking', width: 180, render: function (_, r) { return React.createElement(Input, { value: r.departParking || '', readOnly: true, style: readOnlyStyle }); } },
			{ title: '出发时里程', key: 'departMileageKm', width: 130, render: function (_, r) { return React.createElement(Input, { value: r.departMileageKm || '', disabled: true, addonAfter: 'km' }); } },
			{ title: '到达时里程', key: 'arriveMileageKm', width: 140, render: function (_, r) { return React.createElement(Input, { value: r.arriveMileageKm || '', disabled: true, addonAfter: 'km' }); } },
			{ title: '出发时氢量', key: 'departHydrogen', width: 130, render: function (_, r) { return React.createElement(Input, { value: r.departHydrogen || '', disabled: true, addonAfter: r.h2Unit || '-' }); } },
			{ title: '到达时氢量', key: 'arriveHydrogen', width: 140, render: function (_, r) { return React.createElement(Input, { value: r.arriveHydrogen || '', disabled: true, addonAfter: r.h2Unit || '%' }); } },
			{ title: '出发时电量', key: 'departElectricKwh', width: 130, render: function (_, r) { return React.createElement(Input, { value: r.departElectricKwh || '', disabled: true, addonAfter: 'kWh' }); } },
			{ title: '到达时电量', key: 'arriveElectricKwh', width: 140, render: function (_, r) { return React.createElement(Input, { value: r.arriveElectricKwh || '', disabled: true, addonAfter: 'kWh' }); } }
		];
	}, []);

	var handleBack = useCallback(function () {
		try {
			if (window.history && window.history.length > 1) {
				window.history.back();
				return;
			}
		} catch (e) {}
		message.info('返回调拨管理列表页（原型）');
	}, []);

	var receiveTimeVal = useMemo(function () { return parseDateTime(snapshot.receiveTimeStr); }, [snapshot.receiveTimeStr]);

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
				React.createElement(Breadcrumb, { items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '调拨管理' }, { title: '查看' }] }),
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
						React.createElement('div', { style: labelStyle }, '接收时间'),
						React.createElement(DatePicker, {
							style: controlStyle,
							format: 'YYYY-MM-DD HH:mm',
							showTime: { format: 'HH:mm' },
							placeholder: '-',
							value: receiveTimeVal,
							disabled: true,
							inputReadOnly: true
						})
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '停车场'),
						React.createElement(Input, {
							value: snapshot.receiveParkingName || '—',
							readOnly: true,
							style: readOnlyStyle
						})
					)
				)
			),

			React.createElement(
				Card,
				{ title: '调拨车辆清单', style: { marginBottom: 16 } },
				React.createElement(Table, {
					rowKey: 'id',
					columns: vehicleColumns,
					dataSource: snapshot.transferVehicles || [],
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
				React.createElement(Button, { onClick: handleBack }, '返回')
			)
		)
	);
};
