// 【重要】必须使用 const Component 作为组件变量名
// ONEOS-web - 运维管理 - 车辆业务 - 查看故障

const Component = function () {
	var useState = React.useState;

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

	var _form = Form.useForm();
	var faultForm = _form[0];

	// 故障等级枚举
	var faultLevelOptions = [
		{ label: '特急', value: '特急' },
		{ label: '紧急', value: '紧急' },
		{ label: '一般', value: '一般' },
		{ label: '提示', value: '提示' }
	];

	// 故障类型枚举
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

	// 故障来源枚举
	var faultSourceOptions = [
		{ label: '客户报告', value: '客户报告' },
		{ label: '定期保养', value: '定期保养' },
		{ label: '司机操作问题', value: '司机操作问题' }
	];

	// 解决情况枚举
	var resolveStatusOptions = [
		{ label: '未解决', value: '未解决' },
		{ label: '临时排故', value: '临时排故' },
		{ label: '已解决', value: '已解决' }
	];

	var plateOptions = [
		{ label: '沪A12345', value: '沪A12345', brand: '一汽解放', model: 'J6P', company: '上海羚牛', vin: 'LNW1234567890ABCD' },
		{ label: '浙B88888', value: '浙B88888', brand: '东风商用车', model: '天龙', company: '浙江羚牛', vin: 'LNW0987654321EFGH' },
		{ label: '苏C66666', value: '苏C66666', brand: '福田欧曼', model: 'EST', company: '苏州冷链速运有限公司', vin: 'LNW1357924680IJKL' },
		{ label: '沪D99999', value: '沪D99999', brand: '陕汽重卡', model: '德龙', company: '上海城配物流有限公司', vin: 'LNW2468013579MNOP' }
	];

	var handleBack = function () {
		message.info('返回列表');
	};

	// 模拟数据加载
	React.useEffect(function() {
		var mockData = { key: '1', code: 'F-2024-001', plate: '沪A12345', brand: '一汽解放', model: 'J6P', company: '上海羚牛', type: '底盘故障', level: '紧急', source: '客户报告', status: '未解决', reportTime: '2024-05-10 08:30:00', lastOperator: '王婷婷', lastOperationTime: '2024-05-10 09:00:00', desc: '车辆重载下制动踏板偏软，制动距离明显变长' };
		if (mockData.reportTime) {
			if (typeof window.dayjs === 'function') {
				mockData.reportTime = window.dayjs(mockData.reportTime);
			} else if (typeof window.moment === 'function') {
				mockData.reportTime = window.moment(mockData.reportTime);
			}
		}
		faultForm.setFieldsValue(mockData);
	}, []);

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
			
			.arco-grouped-form-page .ant-input[disabled], 
			.arco-grouped-form-page .ant-select-disabled .ant-select-selector, 
			.arco-grouped-form-page .ant-picker-disabled { color: #86909c; background-color: #f2f3f5; border-color: #e5e6eb; cursor: not-allowed; }
			.arco-grouped-form-page .ant-input-affix-wrapper[disabled] { background-color: #f2f3f5; border-color: #e5e6eb; cursor: not-allowed; }
			.arco-grouped-form-page .ant-input-affix-wrapper > input.ant-input { background-color: transparent; }
			
			.arco-grouped-form-footer { background: #fff; padding: 16px 24px; border-top: 1px solid #e5e6eb; display: flex; justify-content: flex-end; align-items: center; gap: 12px; position: sticky; bottom: 0; z-index: 100; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
			.arco-grouped-form-footer .ant-btn { border-radius: 5px; height: 32px; padding: 4px 16px; font-size: 14px; }
			
			.arco-theme-overrides .ant-breadcrumb { color: #86909c; font-size: 14px; white-space: nowrap; flex-shrink: 0; margin-bottom: 20px; }
			.arco-theme-overrides .ant-breadcrumb a { color: #4e5969; }
			.arco-theme-overrides .ant-breadcrumb a:hover { color: #165dff; background-color: transparent; }
			.arco-theme-overrides .ant-form-item-label > label { color: #4e5969; white-space: nowrap; }
			.arco-theme-overrides .ant-form-item-label > label::after { display: none !important; content: "" !important; margin: 0 !important; }
		`),
		React.createElement('div', { className: 'arco-grouped-form-page' },
			React.createElement('div', { className: 'arco-grouped-form-page-content' },
				React.createElement(Breadcrumb, {
					separator: React.createElement('span', { style: { color: '#c9cdd4' } }, '/'),
					items: [
						{ title: '首页' },
						{ title: '运维管理' },
						{ title: '车辆业务' },
						{ title: React.createElement('a', { onClick: function(e) { e.preventDefault(); handleBack(); } }, '故障管理') },
						{ title: React.createElement('span', { style: { color: '#1d2129' } }, '查看故障单') }
					]
				}),
				
				React.createElement(Form, { form: faultForm, layout: 'vertical', disabled: true },
					// 车辆信息
					React.createElement(Card, { title: '车辆信息', bordered: false },
						React.createElement(Row, { gutter: 24 },
							React.createElement(Col, { span: 8 },
								React.createElement(Form.Item, { label: '车牌号', name: 'plate', rules: [{ required: true, message: '请选择车牌号' }] },
									React.createElement(Select, { 
										placeholder: '请选择车牌号', 
										options: plateOptions,
										showSearch: true
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
								React.createElement(Form.Item, { label: '运营公司', name: 'company' },
									React.createElement(Input, { placeholder: '自动带入', disabled: true, style: { backgroundColor: '#f2f3f5', color: '#86909c' } })
								)
							),
							React.createElement(Col, { span: 8 },
								React.createElement(Form.Item, { label: '车辆识别代码', name: 'vin' },
									React.createElement(Input, { placeholder: '自动带入', disabled: true, style: { backgroundColor: '#f2f3f5', color: '#86909c' } })
								)
							)
						)
					),
					
					// 故障信息
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
								React.createElement(Form.Item, { label: '解决情况', name: 'status', rules: [{ required: true, message: '请选择故障解决情况' }] },
									React.createElement(Select, { placeholder: '请选择故障解决情况', options: resolveStatusOptions })
								)
							)
						)
					),

					// 故障证据与描述
					React.createElement(Card, { title: '故障证据与描述', bordered: false },
						React.createElement(Row, { gutter: 24 },
							React.createElement(Col, { span: 24 },
								React.createElement(Form.Item, { label: '故障描述', name: 'desc', rules: [{ required: true, message: '请填写故障描述' }] },
									React.createElement(Input.TextArea, { 
										placeholder: '在何种状态下，产生何种现象，导致何种事故', 
										style: { height: 80, minHeight: 80, resize: 'none' } 
									})
								)
							),
							React.createElement(Col, { span: 24 },
								React.createElement(Form.Item, { label: '故障证据', name: 'evidence' },
									React.createElement(Upload, { listType: 'picture-card' }),
									React.createElement('div', { style: { fontSize: 12, color: '#86909c', marginTop: 8 } }, '支持上传照片、视频、录音')
								)
							)
						)
					)
				)
			),
			// 底部操作栏
			React.createElement('div', { className: 'arco-grouped-form-footer' },
				React.createElement(Button, { onClick: handleBack, style: { borderRadius: 5 } }, '返回列表')
			)
		)
	);
};

if (typeof module !== 'undefined' && module.exports) module.exports = Component;
