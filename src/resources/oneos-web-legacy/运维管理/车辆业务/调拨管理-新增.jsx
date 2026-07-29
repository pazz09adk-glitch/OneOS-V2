// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 调拨管理 - 新增（数字化资产 ONEOS 运管平台）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var App = antd.App;
	var Breadcrumb = antd.Breadcrumb;
	var Button = antd.Button;
	var Card = antd.Card;
	var Cascader = antd.Cascader;
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

	var layoutStyle = { padding: '16px 24px 88px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var labelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var formItemStyle = { marginBottom: 12 };
	var controlStyle = { width: '100%' };
	var reqStarStyle = { color: '#ff4d4f', marginRight: 4 };
	var reqStar = React.createElement('span', { style: reqStarStyle }, '*');

	/** 车牌可选车辆运营状态（需求：仅「可运营」） */
	var PLATE_ELIGIBLE_STATUS = '可运营';

	var regionOptions = useMemo(function () {
		return [
			{ value: 'zhejiang', label: '浙江省', children: [{ value: 'hangzhou', label: '杭州市' }, { value: 'ningbo', label: '宁波市' }, { value: 'jiaxing', label: '嘉兴市' }] },
			{ value: 'shanghai', label: '上海市', children: [{ value: 'shanghai', label: '上海市' }] },
			{ value: 'guangdong', label: '广东省', children: [{ value: 'guangzhou', label: '广州市' }, { value: 'shenzhen', label: '深圳市' }, { value: 'dongguan', label: '东莞市' }] }
		];
	}, []);

	var brandOptions = useMemo(function () {
		return ['东风', '比亚迪', '小鹏', '蔚来', '福田', '飞驰', '宇通'].map(function (b) {
			return { value: b, label: b };
		});
	}, []);

	var modelOptionsByBrand = useMemo(function () {
		return {
			东风: ['DFH1180', 'DFH5160'],
			比亚迪: ['汉', '唐'],
			小鹏: ['P7', 'G9'],
			蔚来: ['ET5', 'ES8'],
			福田: ['BJ1180'],
			飞驰: ['FSQ4250'],
			宇通: ['ZKH4250']
		};
	}, []);

	/** 车辆主数据（原型）：仅运营状态为「可运营」的车牌出现在车牌下拉里 */
	var vehicleDb = useMemo(function () {
		return [
			{ plateNo: '粤A12345', status: '可运营', brand: '东风', model: 'DFH1180' },
			{ plateNo: '粤B11111', status: '可运营', brand: '比亚迪', model: '汉' },
			{ plateNo: '浙A11111', status: '可运营', brand: '小鹏', model: 'P7' },
			{ plateNo: '浙B22222', status: '可运营', brand: '蔚来', model: 'ET5' },
			{ plateNo: '沪A30003', status: '可运营', brand: '福田', model: 'BJ1180' },
			{ plateNo: '粤C99999', status: '维修中', brand: '东风', model: 'DFH1180' }
		];
	}, []);

	var plateOptionsEligible = useMemo(function () {
		return vehicleDb
			.filter(function (v) {
				return v.status === PLATE_ELIGIBLE_STATUS;
			})
			.map(function (v) {
				return { value: v.plateNo, label: v.plateNo };
			});
	}, [vehicleDb]);

	var formState = useState({
		transferDate: null,
		departRegion: undefined,
		receiveRegion: undefined,
		reason: ''
	});
	var form = formState[0];
	var setForm = formState[1];

	var errorsState = useState({});
	var errors = errorsState[0];
	var setErrors = errorsState[1];

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	var requirementDocContent = [
		'一个「数字化资产ONEOS运管平台」中的「调拨管理」「新增」模块',
		'',
		'1.调拨情况：',
		'1.1.调拨日期：必填项，日期选择器，精确至分钟，格式为：YYYY-MM-DD HH:mm；',
		'1.2.出发区域：必填项，地区选择器，支持省-市2级；',
		'1.3.接收区域：必填项，地区选择器，支持省-市2级；',
		'1.4.调拨原因：必填项，文本域，支持用户自定义输入；',
		'',
		'2.调拨车辆清单；',
		'#以表格方式展示：',
		'2.1.品牌：必填，选择器；',
		'2.2.型号：必填，选择器；',
		'2.3.车牌号：选择器，只能选择运营状态为：可运营的车辆；',
		'2.4.操作：删除；',
		'2.5.表格下方为新增一行，铺满整行；',
		'需要至少提交一辆车才能完成调拨，否则提交审核时提示：请选择调拨车辆；',
		'',
		'3.底部按钮为提交审核、保存、取消；',
		'3.1.提交审核：点击提交审核校验必填项',
		'3.2.保存：不校验必填项，只保存已填数据并保存在列表页；'
	].join('\n');

	var rowIdRef = React.useRef(2);
	var vehiclesState = useState([
		{
			id: 1,
			brand: undefined,
			model: undefined,
			plateNo: undefined
		}
	]);
	var vehicles = vehiclesState[0];
	var setVehicles = vehiclesState[1];

	var updateForm = useCallback(function (patch) {
		setForm(function (p) {
			return Object.assign({}, p, patch);
		});
	}, []);

	var updateRow = useCallback(function (index, patch) {
		setVehicles(function (prev) {
			var list = prev.slice();
			var cur = list[index] || {};
			list[index] = Object.assign({}, cur, patch);
			return list;
		});
	}, []);

	var handlePlateChange = useCallback(
		function (index, plateNo) {
			var v = vehicleDb.find(function (x) {
				return x.plateNo === plateNo;
			});
			if (v && v.status === PLATE_ELIGIBLE_STATUS) {
				updateRow(index, {
					plateNo: plateNo,
					brand: v.brand,
					model: v.model
				});
			} else {
				updateRow(index, { plateNo: plateNo });
			}
		},
		[vehicleDb, updateRow]
	);

	var addRow = useCallback(function () {
		setVehicles(function (prev) {
			return prev.concat([
				{
					id: rowIdRef.current++,
					brand: undefined,
					model: undefined,
					plateNo: undefined
				}
			]);
		});
	}, []);

	var removeRow = useCallback(function (index) {
		setVehicles(function (prev) {
			var list = prev.slice();
			list.splice(index, 1);
			if (list.length === 0) {
				return [
					{
						id: rowIdRef.current++,
						brand: undefined,
						model: undefined,
						plateNo: undefined
					}
				];
			}
			return list;
		});
	}, []);

	function hasValidVehicle() {
		return (vehicles || []).some(function (r) {
			return r && r.brand && r.model;
		});
	}

	function runValidate() {
		var e = {};
		if (!form.transferDate) e.transferDate = '请选择调拨日期';
		if (!form.departRegion || form.departRegion.length < 2) e.departRegion = '请选择出发区域';
		if (!form.receiveRegion || form.receiveRegion.length < 2) e.receiveRegion = '请选择接收区域';
		if (!String(form.reason || '').trim()) e.reason = '请输入调拨原因';
		if (!hasValidVehicle()) e.vehicleList = '请选择调拨车辆';

		for (var i = 0; i < (vehicles || []).length; i++) {
			var r = vehicles[i] || {};
			if (!r.brand && !r.model && !r.plateNo) continue;
			if (!r.brand) e['row_' + i + '_brand'] = '请选择品牌';
			if (!r.model) e['row_' + i + '_model'] = '请选择型号';
		}
		setErrors(e);
		return { ok: Object.keys(e).length === 0, err: e };
	}

	var handleSubmitAudit = useCallback(function () {
		var result = runValidate();
		if (!result.ok) {
			if (result.err && result.err.vehicleList) message.error(result.err.vehicleList);
			else message.error('请完善必填项');
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
		message.success('已保存至列表页（原型：不校验必填项，仅保存当前已填数据）');
	}, []);

	var handleCancel = useCallback(function () {
		Modal.confirm({
			title: '是否确认取消',
			content: '取消将会丢失所有已填写内容，是否确认？',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				message.info('返回调拨管理页（原型）');
			}
		});
	}, []);

	var vehicleColumns = useMemo(
		function () {
			return [
				{
					title: React.createElement('span', null, reqStar, '品牌'),
					key: 'brand',
					width: 160,
					render: function (_, r, index) {
						return React.createElement(Select, {
							placeholder: '请选择品牌',
							style: { width: '100%' },
							value: r.brand,
							onChange: function (v) {
								updateRow(index, { brand: v, model: undefined, plateNo: undefined });
							},
							allowClear: true,
							showSearch: true,
							options: brandOptions,
							filterOption: filterOption,
							status: errors['row_' + index + '_brand'] || errors.vehicleList ? 'error' : undefined
						});
					}
				},
				{
					title: React.createElement('span', null, reqStar, '型号'),
					key: 'model',
					width: 180,
					render: function (_, r, index) {
						var ms = (r.brand && modelOptionsByBrand[r.brand]) || [];
						var opts = ms.map(function (m) {
							return { value: m, label: m };
						});
						return React.createElement(Select, {
							placeholder: r.brand ? '请选择型号' : '请先选择品牌',
							style: { width: '100%' },
							value: r.model,
							disabled: !r.brand,
							onChange: function (v) {
								updateRow(index, { model: v, plateNo: undefined });
							},
							allowClear: true,
							showSearch: true,
							options: opts,
							filterOption: filterOption,
							status: errors['row_' + index + '_model'] || errors.vehicleList ? 'error' : undefined
						});
					}
				},
				{
					title: '车牌号',
					key: 'plateNo',
					width: 240,
					render: function (_, r, index) {
						return React.createElement(Select, {
							placeholder: '请选择车牌号',
							style: { width: '100%' },
							value: r.plateNo,
							onChange: function (v) {
								handlePlateChange(index, v);
							},
							allowClear: true,
							showSearch: true,
							options: plateOptionsEligible,
							filterOption: filterOption
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
		},
		[brandOptions, modelOptionsByBrand, plateOptionsEligible, errors, updateRow, handlePlateChange, removeRow]
	);

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
					items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '调拨管理' }, { title: '新增' }]
				}),
				React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { setRequirementModalOpen(true); } }, '查看需求说明')
			),

			React.createElement(
				Modal,
				{
					title: '需求说明',
					open: requirementModalOpen,
					onCancel: function () { setRequirementModalOpen(false); },
					width: 720,
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
						React.createElement('div', { style: labelStyle }, reqStar, '调拨日期'),
						React.createElement(DatePicker, {
							style: controlStyle,
						format: 'YYYY-MM-DD HH:mm',
						showTime: { format: 'HH:mm' },
							placeholder: '请选择调拨日期',
							value: form.transferDate,
							onChange: function (v) {
								updateForm({ transferDate: v });
							},
							status: errors.transferDate ? 'error' : undefined
						}),
						errors.transferDate ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.transferDate) : null
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, reqStar, '出发区域'),
						React.createElement(Cascader, {
							style: controlStyle,
							placeholder: '请选择省 / 市',
							options: regionOptions,
							value: form.departRegion,
							onChange: function (v) {
								updateForm({ departRegion: v });
							},
							allowClear: true,
							status: errors.departRegion ? 'error' : undefined
						}),
						errors.departRegion ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.departRegion) : null
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, reqStar, '接收区域'),
						React.createElement(Cascader, {
							style: controlStyle,
							placeholder: '请选择省 / 市',
							options: regionOptions,
							value: form.receiveRegion,
							onChange: function (v) {
								updateForm({ receiveRegion: v });
							},
							allowClear: true,
							status: errors.receiveRegion ? 'error' : undefined
						}),
						errors.receiveRegion ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.receiveRegion) : null
					),
					React.createElement(
						'div',
						{ style: Object.assign({}, formItemStyle, { gridColumn: 'span 3' }) },
						React.createElement('div', { style: labelStyle }, reqStar, '调拨原因'),
						React.createElement(Input.TextArea, {
							placeholder: '请输入调拨原因',
							value: form.reason,
							onChange: function (e) {
								updateForm({ reason: e.target.value });
							},
							autoSize: { minRows: 3, maxRows: 6 },
							status: errors.reason ? 'error' : undefined
						}),
						errors.reason ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.reason) : null
					)
				)
			),

			React.createElement(
				Card,
				{ title: '调拨车辆清单', style: { marginBottom: 16 } },
				errors.vehicleList ? React.createElement('div', { style: { marginBottom: 12, color: '#ff4d4f', fontSize: 12 } }, errors.vehicleList) : null,
				React.createElement(Table, {
					rowKey: 'id',
					columns: vehicleColumns,
					dataSource: vehicles,
					size: 'small',
					pagination: false,
					scroll: { x: 720 }
				}),
				React.createElement(Button, { type: 'dashed', style: { marginTop: 12, width: '100%' }, onClick: addRow }, '新增一行')
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
				React.createElement(Button, { type: 'primary', onClick: handleSubmitAudit }, '提交审核'),
				React.createElement(Button, { onClick: handleSave }, '保存'),
				React.createElement(Button, { onClick: handleCancel }, '取消')
			)
		)
	);
};
