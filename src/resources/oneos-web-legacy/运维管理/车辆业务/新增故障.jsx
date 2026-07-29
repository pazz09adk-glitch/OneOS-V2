// 【重要】必须使用 const Component 作为组件变量名
// ONEOS-web - 运维管理 - 车辆业务 - 新增故障

const Component = function () {
	var useState = React.useState;
	var useEffect = React.useEffect;

	var antd = window.antd;
	var Button = antd.Button;
	var Input = antd.Input;
	var Select = antd.Select;
	var DatePicker = antd.DatePicker;
	var Form = antd.Form;
	var Row = antd.Row;
	var Col = antd.Col;
	var Breadcrumb = antd.Breadcrumb;
	var Layout = antd.Layout;
	var message = antd.message;
	var Card = antd.Card;
	var Upload = antd.Upload;
	var Modal = antd.Modal;

	var _form = Form.useForm();
	var faultForm = _form[0];

	var _specOpen = useState(false);
	var specModalOpen = _specOpen[0];
	var setSpecModalOpen = _specOpen[1];

	var _formDirty = useState(false);
	var formDirty = _formDirty[0];
	var setFormDirty = _formDirty[1];

	var faultLevelOptions = [
		{ label: 'L1-特急', value: '特急' },
		{ label: 'L2-紧急', value: '紧急' },
		{ label: 'L3-一般', value: '一般' },
		{ label: 'L4-提示', value: '提示' }
	];

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

	var faultSourceOptions = [
		{ label: '客户报告', value: '客户报告' },
		{ label: '定期保养', value: '定期保养' },
		{ label: '周期性维护', value: '周期性维护' },
		{ label: '预防性维护', value: '预防性维护' },
		{ label: '整备', value: '整备' }
	];

	var resolveStatusOptions = [
		{ label: '未解决', value: '未解决' },
		{ label: '临时排故', value: '临时排故' },
		{ label: '已解决', value: '已解决' }
	];

	/** 运营公司枚举：浙江羚牛、上海羚牛、广东羚牛 */
	var plateOptions = [
		{ label: '沪A12345', value: '沪A12345', brand: '一汽解放', model: 'J6P', company: '上海羚牛', vin: 'LNW1234567890ABCD' },
		{ label: '浙B88888', value: '浙B88888', brand: '东风商用车', model: '天龙', company: '浙江羚牛', vin: 'LNW0987654321EFGH' },
		{ label: '粤A00001', value: '粤A00001', brand: '福田欧曼', model: 'EST', company: '广东羚牛', vin: 'LNW1357924680IJKL' },
		{ label: '沪D99999', value: '沪D99999', brand: '陕汽重卡', model: '德龙', company: '上海羚牛', vin: 'LNW2468013579MNOP' }
	];

	var PlusIcon = function() { return React.createElement('svg', { viewBox: '0 0 1024 1024', width: 14, height: 14, fill: 'currentColor' }, React.createElement('path', { d: 'M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z' }), React.createElement('path', { d: 'M192 474h672q8 0 8 8v60q0 8-8 8H192q-8 0-8-8v-60q0-8 8-8z' })); };
	var FileTextIcon = function() { return React.createElement('svg', { viewBox: '0 0 1024 1024', width: 16, height: 16, fill: 'currentColor' }, React.createElement('path', { d: 'M854.6 288.7L639.4 73.4c-6-6-14.2-9.4-22.7-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216c0 22.1 17.9 40 40 40h216v494zM504 618H320c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h184c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM702 458H320c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h382c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z' })); };

	var DESC_PLACEHOLDER = '在何种状态下\n产生何种现象\n导致何种事故';

	var goBackList = function () {
		message.info('返回列表');
	};

	var requestExit = function () {
		if (formDirty) {
			Modal.confirm({
				title: '确定要退出吗？',
				content: '未保存的数据将丢失',
				okText: '确定',
				cancelText: '取消',
				onOk: function () {
					setFormDirty(false);
					goBackList();
				}
			});
		} else {
			goBackList();
		}
	};

	var openResultModal = function (title, okText, cancelText, onPrimary) {
		Modal.success({
			title: title,
			content: title === '提交成功' ? '故障已提交并加入历史记录。' : '单据已保存在待处理，可继续编辑或稍后提交。',
			okText: okText,
			cancelText: cancelText,
			okCancel: true,
			centered: true,
			onOk: function () {
				if (onPrimary) onPrimary();
			},
			onCancel: function () {}
		});
	};

	var handleSave = function () {
		// 弱校验：不触发表单校验；落库时解决情况空值按「未解决」与列表一致
		faultForm.getFieldsValue();
		setFormDirty(false);
		openResultModal('保存成功', '返回列表', '确定', goBackList);
	};

	var runSubmit = function () {
		faultForm.validateFields(['plate', 'type', 'source', 'level', 'reportTime', 'desc']).then(function () {
			var list = faultForm.getFieldValue('evidence') || [];
			if (!list.length) {
				message.error('请上传故障证据');
				return;
			}
			setFormDirty(false);
			openResultModal('提交成功', '返回列表', '确定', goBackList);
		}).catch(function () {});
	};

	var handleSubmitClick = function () {
		Modal.confirm({
			title: '确认提交',
			content: '故障提交后无法修改，如未完成所有步骤填写请先进行保存。点击确认加入历史记录',
			okText: '确认',
			cancelText: '取消',
			centered: true,
			onOk: function () {
				runSubmit();
			}
		});
	};

	useEffect(function () {
		var fn = function (e) {
			if (formDirty) {
				e.preventDefault();
				e.returnValue = '';
			}
		};
		window.addEventListener('beforeunload', fn);
		return function () { window.removeEventListener('beforeunload', fn); };
	}, [formDirty]);

	var specSection = function (title, lines) {
		return React.createElement('div', { style: { marginBottom: 16 } },
			React.createElement('div', { style: { fontWeight: 600, color: '#1d2129', marginBottom: 8, fontSize: 14 } }, title),
			lines.map(function (text, i) {
				return React.createElement('div', { key: i, style: { fontSize: 13, color: '#4e5969', lineHeight: 1.75 } }, text);
			})
		);
	};

	var renderSpecModal = function () {
		return React.createElement(Modal, {
			title: '故障信息表单页 — 需求说明',
			open: specModalOpen,
			onCancel: function () { setSpecModalOpen(false); },
			footer: React.createElement(Button, { type: 'primary', onClick: function () { setSpecModalOpen(false); } }, '知道了'),
			width: 720,
			centered: true,
			destroyOnClose: true
		},
			React.createElement('div', { style: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 } },
				specSection('3. 故障信息表单页', ['用于新增/编辑故障记录，保存到待处理或提交到历史记录。']),
				specSection('3.1 车辆信息卡片（自动带出）', [
					'3.1.1 车牌号：必填，下拉可搜索；',
					'3.1.2 车辆品牌：禁用，随车牌自动反填；',
					'3.1.3 车辆型号：禁用，随车牌自动反填；',
					'3.1.4 车辆识别代码：禁用，随车牌自动反填；',
					'3.1.5 运营公司：禁用，随车牌自动反填。',
					'3.1.6 运营公司枚举统一为：浙江羚牛、上海羚牛、广东羚牛。'
				]),
				specSection('3.2 故障信息卡片', [
					'3.2.1 故障类型：必填，下拉选择；',
					'3.2.2 故障来源：必填，下拉选择，选项：客户报告、定期保养、周期性维护、预防性维护、整备；',
					'3.2.3 故障等级：必填，下拉选择；',
					'3.2.4 故障上报时间：必填，日期时间选择器；',
					'3.2.5 解决情况：选填，下拉选择，选项：临时排故、已解决、未解决。'
				]),
				specSection('3.3 故障描述与证据卡片（顺序已调整）', [
					'3.3.1 故障描述：必填，多行文本，默认引导语：在何种状态下 / 产生何种现象 / 导致何种事故；',
					'3.3.2 故障证据：提交时必填，上传控件，支持照片/视频/录音；',
					'提示文案：支持上传照片、视频、录音。'
				]),
				specSection('4. 底部操作按钮组', [
					'控制保存与提交流程。',
					'4.1 保存按钮：保存当前已填写内容，不做严格必填校验，单据留在待处理；',
					'4.2 提交按钮：执行严格校验（含带*字段及故障证据）；',
					'4.3 点击提交先弹确认提示：故障提交后无法修改… 按钮：取消 / 确认；',
					'4.4 提交成功后提示提交成功，并提供确定/返回列表；',
					'4.5 保存成功后提示保存成功，并提供确定/返回列表。'
				]),
				specSection('5. 联动与校验规则', [
					'5.1 车牌联动：自动反填车辆品牌、车辆型号、车辆识别代码、运营公司；',
					'5.2 保存校验：弱校验（允许未填必填项）；',
					'5.3 提交校验：强校验（必填项+故障证据）；',
					'5.4 解决情况默认值兜底：未填写时按未解决处理（列表展示与保存一致）。'
				]),
				specSection('6. 退出与返回拦截规则', [
					'6.1 表单发生修改且未保存时，触发返回/关闭/刷新拦截；',
					'6.2 弹窗文案：确定要退出吗？未保存的数据将丢失；',
					'6.3 按钮：确定 / 取消；',
					'6.4 已保存后再退出，不触发该拦截。'
				])
			)
		);
	};

	return React.createElement(Layout, { className: 'arco-theme-overrides', style: { minHeight: '100vh', background: '#f2f3f5', fontFamily: 'Inter, Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif' } },
		React.createElement('style', null, `
			.arco-theme-overrides .ant-btn { border-radius: 4px; }
			.arco-theme-overrides .ant-btn-primary { background-color: #165dff; border-color: #165dff; }
			.arco-theme-overrides .ant-btn-primary:hover { background-color: #4080ff; border-color: #4080ff; }
			
			.arco-grouped-form-page { display: flex; flex-direction: column; min-height: 100vh; }
			.arco-grouped-form-page-content { flex: 1; padding: 16px 20px 24px; }
			.arco-grouped-form-page .ant-card { margin-bottom: 16px; border-radius: 4px; border: none; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
			.arco-grouped-form-page .ant-card-head { border-bottom: none; padding: 20px 24px 0; min-height: auto; }
			.arco-grouped-form-page .ant-card-head-title { font-size: 16px; font-weight: 500; color: #1d2129; padding: 0; }
			.arco-grouped-form-page .ant-card-body { padding: 24px; }
			.arco-grouped-form-page .ant-form-vertical .ant-form-item-label { padding-bottom: 8px; height: auto; line-height: 1.5715; }
			.arco-grouped-form-page .ant-form-item { margin-bottom: 24px; }
			
			.arco-grouped-form-page .ant-input, 
			.arco-grouped-form-page .ant-select-selector, 
			.arco-grouped-form-page .ant-picker,
			.arco-grouped-form-page .ant-input-affix-wrapper { background-color: #f2f3f5; border: 1px solid #e5e6eb; border-radius: 2px; transition: all 0.1s cubic-bezier(0, 0, 1, 1); }
			.arco-grouped-form-page .ant-input:hover, 
			.arco-grouped-form-page .ant-select:not(.ant-select-disabled):hover .ant-select-selector, 
			.arco-grouped-form-page .ant-picker:hover,
			.arco-grouped-form-page .ant-input-affix-wrapper:hover { background-color: #f2f3f5; border-color: #165dff; }
			.arco-grouped-form-page .ant-input:focus, 
			.arco-grouped-form-page .ant-input-focused, 
			.arco-grouped-form-page .ant-select-focused .ant-select-selector, 
			.arco-grouped-form-page .ant-picker-focused,
			.arco-grouped-form-page .ant-input-affix-wrapper-focused { background-color: #fff; border: 1px solid #165dff !important; box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2) !important; outline: 0; }
			.arco-grouped-form-page .ant-input[disabled], 
			.arco-grouped-form-page .ant-select-disabled .ant-select-selector, 
			.arco-grouped-form-page .ant-picker-disabled { color: #86909c; background-color: #f2f3f5; border-color: #e5e6eb; cursor: not-allowed; }
			.arco-grouped-form-page .ant-input-affix-wrapper[disabled] { background-color: #f2f3f5; border-color: #e5e6eb; cursor: not-allowed; }
			.arco-grouped-form-page .ant-input-affix-wrapper > input.ant-input { background-color: transparent; }
			.arco-grouped-form-page .ant-input-affix-wrapper > input.ant-input:focus { background-color: transparent; box-shadow: none !important; border: none !important; }
			
			.arco-grouped-form-footer { background: #fff; padding: 16px 24px; border-top: 1px solid #e5e6eb; display: flex; justify-content: flex-end; align-items: center; gap: 12px; position: sticky; bottom: 0; z-index: 100; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
			.arco-grouped-form-footer .ant-btn { border-radius: 5px; height: 32px; padding: 4px 16px; font-size: 14px; }
			
			.arco-theme-overrides .ant-breadcrumb { color: #86909c; font-size: 14px; white-space: nowrap; flex-shrink: 0; margin-bottom: 0; }
			.arco-theme-overrides .ant-breadcrumb a { color: #4e5969; }
			.arco-theme-overrides .ant-breadcrumb a:hover { color: #165dff; background-color: transparent; }
			.arco-theme-overrides .ant-form-item-label > label { color: #4e5969; white-space: nowrap; }
			.arco-theme-overrides .ant-form-item-label > label::after { display: none !important; content: "" !important; margin: 0 !important; }
		`),
		React.createElement('div', { className: 'arco-grouped-form-page' },
			React.createElement('div', { className: 'arco-grouped-form-page-content' },
				React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'nowrap', gap: 12 } },
					React.createElement(Breadcrumb, {
						separator: React.createElement('span', { style: { color: '#c9cdd4' } }, '/'),
						items: [
							{ title: '首页' },
							{ title: '运维管理' },
							{ title: '车辆业务' },
							{ title: React.createElement('a', { href: '#', onClick: function (e) { e.preventDefault(); requestExit(); } }, '故障管理') },
							{ title: React.createElement('span', { style: { color: '#1d2129' } }, '新建故障单') }
						]
					}),
					React.createElement(Button, {
						type: 'link',
						icon: React.createElement(FileTextIcon, null),
						style: { display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px', color: '#165dff', fontWeight: 500, flexShrink: 0 },
						onClick: function () { setSpecModalOpen(true); }
					}, '查看需求说明')
				),

				React.createElement(Form, {
					form: faultForm,
					layout: 'vertical',
					onValuesChange: function () {
						setFormDirty(true);
					}
				},
					React.createElement(Card, { title: '车辆信息', bordered: false },
						React.createElement(Row, { gutter: 24 },
							React.createElement(Col, { span: 8 },
								React.createElement(Form.Item, { label: '车牌号', name: 'plate', rules: [{ required: true, message: '请选择车牌号' }] },
									React.createElement(Select, {
										placeholder: '请选择车牌号（可搜索）',
										options: plateOptions,
										showSearch: true,
										optionFilterProp: 'label',
										onChange: function (val, option) {
											if (option) {
												faultForm.setFieldsValue({
													brand: option.brand,
													model: option.model,
													company: option.company,
													vin: option.vin
												});
											} else {
												faultForm.setFieldsValue({ brand: undefined, model: undefined, company: undefined, vin: undefined });
											}
										}
									})
								)
							),
							React.createElement(Col, { span: 8 },
								React.createElement(Form.Item, { label: '车辆品牌', name: 'brand' },
									React.createElement(Input, { placeholder: '自动带入', disabled: true, style: { backgroundColor: '#f2f3f5', color: '#86909c' } })
								)
							),
							React.createElement(Col, { span: 8 },
								React.createElement(Form.Item, { label: '车辆型号', name: 'model' },
									React.createElement(Input, { placeholder: '自动带入', disabled: true, style: { backgroundColor: '#f2f3f5', color: '#86909c' } })
								)
							),
							React.createElement(Col, { span: 8 },
								React.createElement(Form.Item, { label: '车辆识别代码', name: 'vin' },
									React.createElement(Input, { placeholder: '自动带入', disabled: true, style: { backgroundColor: '#f2f3f5', color: '#86909c' } })
								)
							),
							React.createElement(Col, { span: 8 },
								React.createElement(Form.Item, { label: '运营公司', name: 'company' },
									React.createElement(Input, { placeholder: '自动带入', disabled: true, style: { backgroundColor: '#f2f3f5', color: '#86909c' } })
								)
							)
						)
					),

					React.createElement(Card, { title: '故障信息', bordered: false },
						React.createElement(Row, { gutter: 24 },
							React.createElement(Col, { span: 8 },
								React.createElement(Form.Item, { label: '故障类型', name: 'type', rules: [{ required: true, message: '请选择故障类型' }] },
									React.createElement(Select, { placeholder: '请选择故障类型', options: faultTypeOptions })
								)
							),
							React.createElement(Col, { span: 8 },
								React.createElement(Form.Item, { label: '故障来源', name: 'source', rules: [{ required: true, message: '请选择故障来源' }] },
									React.createElement(Select, { placeholder: '请选择故障来源', options: faultSourceOptions })
								)
							),
							React.createElement(Col, { span: 8 },
								React.createElement(Form.Item, { label: '故障等级', name: 'level', rules: [{ required: true, message: '请选择故障等级' }] },
									React.createElement(Select, { placeholder: '请选择故障等级', options: faultLevelOptions })
								)
							),
							React.createElement(Col, { span: 8 },
								React.createElement(Form.Item, { label: '故障上报时间', name: 'reportTime', rules: [{ required: true, message: '请选择故障上报时间' }] },
									React.createElement(DatePicker, { style: { width: '100%' }, placeholder: '请选择上报时间', showTime: true })
								)
							),
							React.createElement(Col, { span: 8 },
								React.createElement(Form.Item, { label: '解决情况', name: 'status', extra: '选填；保存时未填按「未解决」处理' },
									React.createElement(Select, { allowClear: true, placeholder: '请选择（可选）', options: resolveStatusOptions })
								)
							)
						)
					),

					React.createElement(Card, { title: '故障描述与证据', bordered: false },
						React.createElement(Row, { gutter: 24 },
							React.createElement(Col, { span: 24 },
								React.createElement(Form.Item, { label: '故障描述', name: 'desc', rules: [{ required: true, message: '请填写故障描述' }] },
									React.createElement(Input.TextArea, {
										placeholder: DESC_PLACEHOLDER,
										style: { minHeight: 104, height: 104, resize: 'none' }
									})
								)
							),
							React.createElement(Col, { span: 24 },
								React.createElement(Form.Item, {
									label: '故障证据',
									name: 'evidence',
									valuePropName: 'fileList',
									getValueFromEvent: function (e) { return (e && e.fileList) ? e.fileList : []; }
								},
									React.createElement(Upload, {
										listType: 'picture-card',
										beforeUpload: function () { return false; },
										multiple: true,
										accept: 'image/*,video/*,audio/*'
									},
										React.createElement('div', null,
											React.createElement(PlusIcon, null),
											React.createElement('div', { style: { marginTop: 8 } }, '上传文件')
										)
									),
									React.createElement('div', { style: { fontSize: 12, color: '#86909c', marginTop: 8 } }, '支持上传照片、视频、录音')
								)
							)
						)
					)
				)
			),
			React.createElement('div', { className: 'arco-grouped-form-footer' },
				React.createElement(Button, { onClick: requestExit, style: { borderRadius: 5 } }, '取消'),
				React.createElement(Button, { onClick: handleSave, style: { borderRadius: 5 } }, '保存'),
				React.createElement(Button, { type: 'primary', onClick: handleSubmitClick, style: { borderRadius: 5 } }, '提交')
			)
		),
		renderSpecModal()
	);
};

if (typeof module !== 'undefined' && module.exports) module.exports = Component;
