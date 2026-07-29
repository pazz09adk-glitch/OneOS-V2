// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 调拨管理 - 接收信息（数字化资产 ONEOS 运管平台）
// 本页用例：调拨方式为「第三方运输」

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

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	var METHOD_THIRD = '第三方运输';

	function getMockSnapshot() {
		return {
			transferDateStr: '2026-03-31',
			departRegionText: '广东省-广州市',
			receiveRegionText: '浙江省-嘉兴市',
			reason: '华南业务增量，需将车辆调至华东仓储节点保障运力。',
			method: METHOD_THIRD,
			transportLeader: '刘振华',
			transportPhone: '13901234567',
			transportCost: '8650.50',
			transportContractFileLabel: '顺达物流有限公司运输合同.pdf',
			receivePersonName: '王芳',
			transferVehicles: [
				{ id: 1, brand: '小鹏', model: 'P7', plateNo: '浙A11111', departParking: '西湖景区停车场' },
				{ id: 2, brand: '蔚来', model: 'ET5', plateNo: '浙B22222', departParking: '宁波江北停车场' }
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
		return snap.transferVehicles.map(function (r) {
			return {
				id: r.id,
				brand: r.brand,
				model: r.model,
				plateNo: r.plateNo,
				departParking: r.departParking || ''
			};
		});
	}

	var receiveTimeState = useState(null);
	var receiveTime = receiveTimeState[0];
	var setReceiveTime = receiveTimeState[1];

	var receiveParkingState = useState(undefined);
	var receiveParking = receiveParkingState[0];
	var setReceiveParking = receiveParkingState[1];

	var vehiclesState = useState(function () {
		return buildVehicleRows(getMockSnapshot());
	});
	var vehicles = vehiclesState[0];

	var parkingOptions = useMemo(function () {
		return [
			{ value: 'p1', label: '西湖景区停车场' },
			{ value: 'p2', label: '宁波江北停车场' },
			{ value: 'p3', label: '张江园区停车场' },
			{ value: 'p4', label: '天河智慧停车场' }
		];
	}, []);

	var errorsState = useState({});
	var errors = errorsState[0];
	var setErrors = errorsState[1];

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	var attachmentPreviewState = useState(false);
	var attachmentPreviewOpen = attachmentPreviewState[0];
	var setAttachmentPreviewOpen = attachmentPreviewState[1];

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
		'2.1.调拨方式：反写，本用例为第三方运输；',
		'2.2.运输负责人：反写调拨信息提交时的运输负责人；',
		'2.3.运输方联系方式：反写调拨信息提交时的运输方联系方式；',
		'2.4.运输费用：反写，格式为：xx.xx元；',
		'2.5.运输合同附件：反写（样例：xxxxx公司运输合同.pdf），未上传显示为无；',
		'2.6.接收人员：反写调拨信息提交时的接收人员姓名；',
		'',
		'3.接收信息：',
		'3.1.接收时间：日期选择器，精确至天，格式：YYYY-MM-DD；',
		'3.2.停车场：必填项，选择器，直接选择已有停车场；',
		'',
		'4.调拨车辆清单；',
		'#以表格方式展示，反写新增调拨时的整个清单：',
		'4.1.品牌：反写新增调拨时的品牌；',
		'4.2.型号：反写新增调拨时的型号；',
		'4.3.车牌号：反写调拨信息提交时的车牌号；显示该车辆对应停车场；',
		'',
		'5.底部按钮为提交、保存、取消；',
		'5.1.提交：点击提交校验必填项；提交后，调拨车辆清单中车辆停车区域会更新至所选停车场；',
		'5.2.保存：不校验必填项，只保存已填数据并保存在列表页；'
	].join('\n');

	function formatCostYuan(costStr) {
		var s = String(costStr == null ? '' : costStr).trim();
		if (!s) return '—';
		return s + '元';
	}

	function contractDisplay(label) {
		var s = String(label == null ? '' : label).trim();
		return s ? s : '无';
	}

	function canPreviewAttachment(label) {
		var s = String(label == null ? '' : label).trim();
		if (!s) return false;
		var lower = s.toLowerCase();
		return lower.endsWith('.pdf') || lower.endsWith('.doc') || lower.endsWith('.docx');
	}

	function runValidate() {
		var e = {};
		if (!receiveTime) e.receiveTime = '请选择接收时间';
		if (!receiveParking) e.receiveParking = '请选择停车场';
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
	}, [receiveTime, receiveParking]);

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
			}
		];
	}, []);

	var costText = formatCostYuan(snapshot.transportCost);
	var contractText = contractDisplay(snapshot.transportContractFileLabel);
	var canPreview = canPreviewAttachment(snapshot.transportContractFileLabel);

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
				React.createElement(Breadcrumb, {
					items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '调拨管理' }, { title: '接收信息' }]
				}),
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
				Modal,
				{
					title: '附件预览',
					open: attachmentPreviewOpen,
					onCancel: function () { setAttachmentPreviewOpen(false); },
					width: 820,
					footer: React.createElement(Button, { onClick: function () { setAttachmentPreviewOpen(false); } }, '关闭'),
					bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
				},
				React.createElement(
					'div',
					{ style: { fontSize: 13, lineHeight: 1.65, color: 'rgba(0,0,0,0.85)' } },
					React.createElement('div', { style: { marginBottom: 8 } }, '文件：', snapshot.transportContractFileLabel || '无'),
					React.createElement(
						'div',
						{ style: { padding: 12, background: 'rgba(0,0,0,0.02)', border: '1px solid #f0f0f0', borderRadius: 8 } },
						'原型预览：此处展示附件内容预览区域。对接后可通过文件 URL 进行在线预览或下载。'
					)
				)
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
						React.createElement('div', { style: labelStyle }, '运输费用'),
						React.createElement(Input, { value: costText, readOnly: true, style: readOnlyStyle })
					),
					React.createElement(
						'div',
						{ style: Object.assign({}, formItemStyle, { gridColumn: 'span 2' }) },
						React.createElement('div', { style: labelStyle }, '运输合同附件'),
						canPreview
							? React.createElement(
								'div',
								{ style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
								React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { setAttachmentPreviewOpen(true); } }, contractText)
							)
							: React.createElement(Input, { value: contractText, readOnly: true, style: readOnlyStyle })
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
							format: 'YYYY-MM-DD',
							placeholder: '请选择接收时间',
							value: receiveTime,
							onChange: function (v) {
								setReceiveTime(v);
							},
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
					pagination: false
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
