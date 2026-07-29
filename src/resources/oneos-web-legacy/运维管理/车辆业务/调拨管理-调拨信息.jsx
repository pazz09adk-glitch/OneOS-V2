// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 调拨管理 - 调拨信息（数字化资产 ONEOS 运管平台）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var App = antd.App;
	var Breadcrumb = antd.Breadcrumb;
	var Button = antd.Button;
	var Card = antd.Card;
	var Input = antd.Input;
	var Modal = antd.Modal;
	var Select = antd.Select;
	var Table = antd.Table;
	var Upload = antd.Upload;
	var message = antd.message;

	var METHOD_DRIVER = '司机运输';
	var METHOD_THIRD = '第三方运输';
	var PLATE_ELIGIBLE_STATUS = '可运营';

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	var layoutStyle = { padding: '16px 24px 88px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var labelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var formItemStyle = { marginBottom: 12 };
	var controlStyle = { width: '100%' };
	var readOnlyStyle = { background: 'rgba(0,0,0,0.02)' };
	var reqStarStyle = { color: '#ff4d4f', marginRight: 4 };
	var reqStar = React.createElement('span', { style: reqStarStyle }, '*');

	var regionOptions = useMemo(function () {
		return [
			{ value: 'zhejiang', label: '浙江省', children: [{ value: 'hangzhou', label: '杭州市' }, { value: 'ningbo', label: '宁波市' }, { value: 'jiaxing', label: '嘉兴市' }] },
			{ value: 'shanghai', label: '上海市', children: [{ value: 'shanghai', label: '上海市' }] },
			{ value: 'guangdong', label: '广东省', children: [{ value: 'guangzhou', label: '广州市' }, { value: 'shenzhen', label: '深圳市' }, { value: 'dongguan', label: '东莞市' }] }
		];
	}, []);

	function regionValueToProvinceCityLabel(values) {
		if (!values || values.length < 2) return '';
		var i;
		var p = null;
		for (i = 0; i < regionOptions.length; i++) {
			if (regionOptions[i].value === values[0]) {
				p = regionOptions[i];
				break;
			}
		}
		if (!p || !p.children) return '';
		var c = null;
		for (i = 0; i < p.children.length; i++) {
			if (p.children[i].value === values[1]) {
				c = p.children[i];
				break;
			}
		}
		if (!c) return p.label;
		return p.label + '-' + c.label;
	}

	var vehicleDb = useMemo(function () {
		return [
			{ plateNo: '粤A12345', status: '可运营', brand: '东风', model: 'DFH1180', dashboardH2Unit: 'MPa', currentParking: '天河智慧停车场' },
			{ plateNo: '粤B11111', status: '可运营', brand: '比亚迪', model: '汉', dashboardH2Unit: '%', currentParking: '南山科技园停车场' },
			{ plateNo: '浙A11111', status: '可运营', brand: '小鹏', model: 'P7', dashboardH2Unit: '%', currentParking: '西湖景区停车场' },
			{ plateNo: '浙B22222', status: '可运营', brand: '蔚来', model: 'ET5', dashboardH2Unit: 'MPa', currentParking: '宁波江北停车场' },
			{ plateNo: '沪A30003', status: '可运营', brand: '福田', model: 'BJ1180', dashboardH2Unit: 'MPa', currentParking: '张江园区停车场' },
			{ plateNo: '粤C99999', status: '维修中', brand: '东风', model: 'DFH1180', dashboardH2Unit: 'MPa', currentParking: '白云维修基地停车场' }
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

	function lookupVehicle(plateNo) {
		return vehicleDb.find(function (x) {
			return x.plateNo === plateNo;
		});
	}

	function buildVehicleRowsFromSnapshot(snap) {
		return snap.vehicles.map(function (r) {
			var v = r.plateNo ? lookupVehicle(r.plateNo) : null;
			return {
				id: r.id,
				brand: r.brand,
				model: r.model,
				plateNo: undefined,
				h2Unit: v && v.dashboardH2Unit ? v.dashboardH2Unit : '%',
				departParking: v && v.currentParking ? v.currentParking : '',
				departMileageKm: '',
				departHydrogen: '',
				departElectricKwh: ''
			};
		});
	}

	/** 原型：模拟「新增调拨」提交后带入本页的快照（对接接口后由详情接口渲染） */
	var mockFromCreate = useMemo(function () {
		return {
			transferDateStr: '2026-03-31',
			departRegionValues: ['guangdong', 'guangzhou'],
			receiveRegionValues: ['zhejiang', 'jiaxing'],
			reason: '华南业务增量，需将车辆调至华东仓储节点保障运力。',
			vehicles: [
				{ id: 1, brand: '小鹏', model: 'P7', plateNo: '浙A11111' },
				{ id: 2, brand: '蔚来', model: 'ET5', plateNo: '浙B22222' }
			]
		};
	}, []);

	var snapshotState = useState(mockFromCreate);
	var snapshot = snapshotState[0];

	var vehiclesState = useState(function () {
		return buildVehicleRowsFromSnapshot(mockFromCreate);
	});
	var vehicles = vehiclesState[0];
	var setVehicles = vehiclesState[1];

	var infoState = useState({
		method: undefined,
		transportLeader: '',
		transportPhone: '',
		transportCost: '',
		receivePerson: undefined
	});
	var info = infoState[0];
	var setInfo = infoState[1];

	var fileListState = useState([]);
	var fileList = fileListState[0];
	var setFileList = fileListState[1];

	var errorsState = useState({});
	var errors = errorsState[0];
	var setErrors = errorsState[1];

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	var requirementDocContent = [
		'一个「数字化资产ONEOS运管平台」中的「调拨管理」「调拨信息」模块',
		'',
		'1.调拨情况：',
		'1.1.调拨日期：反写新增调拨时的调拨日期，格式为：YYYY-MM-DD；',
		'1.2.出发区域：反写新增调拨时的出发区域，格式为：省-市；',
		'1.3.接收区域：反写新增调拨时的接收区域，格式为：省-市；',
		'1.4.调拨原因：反写新增调拨时的调拨原因；',
		'',
		'2.调拨信息：',
		'2.1.调拨方式：必填项，选择器，枚举值为：司机运输、第三方运输；',
		'2.2.运输负责人：必填项，输入框，支持用户自定义输入；',
		'2.3.运输方联系方式：必填项，输入框，限制为11位数字手机号格式；',
		'2.4.运输费用：必填项，输入框，支持2位小数，后缀为元，只有运输方式为第三方运输时显示；',
		'2.5.运输合同附件：选填项，按钮，文案为附件上传，点击支持本地文件上传（doc、docx、pdf格式），只有运输方式为第三方运输时显示；',
		'2.6.接收人员：必填项，选择器，选择用户表所有运维部门人员，支持输入框输入内容搜索下拉对应项；',
		'',
		'3.调拨车辆清单；',
		'#以表格方式展示，反写新增调拨时的整个清单：',
		'3.1.品牌：反写新增调拨时的品牌；',
		'3.2.型号：反写新增调拨时的型号；',
		'3.3.车牌号：必填项，选择器，只能选择该型号、同时运营状态为：可运营的车辆；如业务在新增时已填写车牌号信息，此处反写，但支持修改；',
		'3.4.出发停车场：根据车牌号，自动反写该车辆当前停车场；',
		'3.5.出发时里程：必填项，输入框，支持2位小数，后缀为km，只有调拨方式为司机运输时显示；',
		'3.6.出发时氢量：必填项，输入框，支持2位小数，后缀为%或MPa（取自对应车辆该型号对应型号参数下仪表盘单位），只有调拨方式为司机运输时显示；',
		'3.7.出发时电量：必填项，输入框，支持2位小数，后缀为kWh，只有调拨方式为司机运输时显示；',
		'',
		'4.底部按钮为提交审核、保存、取消；',
		'4.1.提交审核：点击提交审核校验必填项；',
		'4.2.保存：不校验必填项，只保存已填数据并保存在列表页；'
	].join('\n');

	var methodOptions = useMemo(function () {
		return [
			{ value: METHOD_DRIVER, label: METHOD_DRIVER },
			{ value: METHOD_THIRD, label: METHOD_THIRD }
		];
	}, []);

	var opsStaffOptions = useMemo(function () {
		return [
			{ value: 'zm', label: '张明（运维一部-现场工程师）' },
			{ value: 'wf', label: '王芳（运维二部-调度）' },
			{ value: 'lh', label: '李华（运维中心-班长）' },
			{ value: 'zq', label: '赵强（运维一部-驻场）' },
			{ value: 'cj', label: '陈静（运维三部-客服协同）' }
		];
	}, []);

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

	function phoneDigitsOnly(v) {
		return String(v || '')
			.replace(/\D/g, '')
			.slice(0, 11);
	}

	var updateInfo = useCallback(function (patch) {
		setInfo(function (p) {
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
			var v = plateNo ? lookupVehicle(plateNo) : null;
			var unit = v && v.dashboardH2Unit ? v.dashboardH2Unit : '%';
			updateRow(index, { plateNo: plateNo, h2Unit: unit, departParking: v && v.currentParking ? v.currentParking : '' });
		},
		[updateRow, vehicleDb]
	);

	function runValidate() {
		var e = {};
		if (!info.method) e.method = '请选择调拨方式';
		if (!String(info.transportLeader || '').trim()) e.transportLeader = '请输入运输负责人姓名';
		if (!info.receivePerson) e.receivePerson = '请选择接收人员';

		var phone = String(info.transportPhone || '').trim();
		if (!phone) e.transportPhone = '请输入运输方联系方式';
		else if (!/^\d{11}$/.test(phone)) e.transportPhone = '请输入11位数字手机号';

		if (info.method === METHOD_THIRD) {
			if (!String(info.transportCost || '').trim()) e.transportCost = '请输入运输费用';
		}

		for (var i = 0; i < (vehicles || []).length; i++) {
			var r = vehicles[i] || {};
			if (!String(r.plateNo || '').trim()) e['row_' + i + '_plate'] = '请选择车牌号';
			if (info.method === METHOD_DRIVER) {
				if (!String(r.departMileageKm || '').trim()) e['row_' + i + '_mile'] = '请输入出发时里程';
				if (!String(r.departHydrogen || '').trim()) e['row_' + i + '_h2'] = '请输入出发时氢量';
				if (!String(r.departElectricKwh || '').trim()) e['row_' + i + '_kwh'] = '请输入出发时电量';
			}
		}
		setErrors(e);
		return { ok: Object.keys(e).length === 0, err: e };
	}

	var handleSubmitAudit = useCallback(function () {
		var result = runValidate();
		if (!result.ok) {
			message.error('请完善必填项');
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
	}, [info, vehicles]);

	var handleSave = useCallback(function () {
		message.success('已保存至列表页（原型：不校验必填项，仅保存当前已填数据）');
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

	var vehicleColumns = useMemo(
		function () {
			var cols = [
				{
					title: '品牌',
					key: 'brand',
					width: 100,
					render: function (_, r) {
						return React.createElement(Input, { value: r.brand || '', readOnly: true, style: readOnlyStyle });
					}
				},
				{
					title: '型号',
					key: 'model',
					width: 110,
					render: function (_, r) {
						return React.createElement(Input, { value: r.model || '', readOnly: true, style: readOnlyStyle });
					}
				},
				{
					title: React.createElement('span', null, reqStar, '车牌号'),
					key: 'plateNo',
					width: 220,
					render: function (_, r, index) {
						return React.createElement(Select, {
							placeholder: '请选择或输入车牌号',
							style: { width: '100%' },
							value: r.plateNo,
							onChange: function (v) {
								handlePlateChange(index, v);
							},
							allowClear: true,
							showSearch: true,
							options: plateOptionsEligible,
							filterOption: filterOption,
							status: errors['row_' + index + '_plate'] ? 'error' : undefined
						});
					}
				}
			];

			cols.push({
				title: '出发停车场',
				key: 'departParking',
				width: 160,
				render: function (_, r) {
					return React.createElement(Input, { value: r.departParking || '', readOnly: true, style: readOnlyStyle, placeholder: '—' });
				}
			});

			if (info.method === METHOD_DRIVER) {
				cols.push({
					title: React.createElement('span', null, reqStar, '出发时里程'),
					key: 'departMileageKm',
					width: 140,
					render: function (_, r, index) {
						return React.createElement(Input, {
							value: r.departMileageKm,
							onChange: function (e) {
								updateRow(index, { departMileageKm: toFixed2Input(e.target.value) });
							},
							placeholder: '0.00',
							addonAfter: 'km',
							status: errors['row_' + index + '_mile'] ? 'error' : undefined
						});
					}
				});
				cols.push({
					title: React.createElement('span', null, reqStar, '出发时氢量'),
					key: 'departHydrogen',
					width: 130,
					render: function (_, r, index) {
						return React.createElement(Input, {
							value: r.departHydrogen,
							onChange: function (e) {
								updateRow(index, { departHydrogen: toFixed2Input(e.target.value) });
							},
							placeholder: '0.00',
							addonAfter: r.h2Unit || '%',
							status: errors['row_' + index + '_h2'] ? 'error' : undefined
						});
					}
				});
				cols.push({
					title: React.createElement('span', null, reqStar, '出发时电量'),
					key: 'departElectricKwh',
					width: 140,
					render: function (_, r, index) {
						return React.createElement(Input, {
							value: r.departElectricKwh,
							onChange: function (e) {
								updateRow(index, { departElectricKwh: toFixed2Input(e.target.value) });
							},
							placeholder: '0.00',
							addonAfter: 'kWh',
							status: errors['row_' + index + '_kwh'] ? 'error' : undefined
						});
					}
				});
			}

			return cols;
		},
		[info.method, plateOptionsEligible, errors, handlePlateChange, updateRow]
	);

	var departRegionText = regionValueToProvinceCityLabel(snapshot.departRegionValues);
	var receiveRegionText = regionValueToProvinceCityLabel(snapshot.receiveRegionValues);

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
					items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '调拨管理' }, { title: '调拨信息' }]
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
				Card,
				{ title: '调拨情况', style: { marginBottom: 16 } },
				React.createElement(
					'div',
					{ style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', alignItems: 'start' } },
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '调拨日期'),
						React.createElement(Input, { value: snapshot.transferDateStr, readOnly: true, style: readOnlyStyle, placeholder: 'YYYY-MM-DD' })
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '出发区域'),
						React.createElement(Input, { value: departRegionText, readOnly: true, style: readOnlyStyle, placeholder: '省-市' })
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '接收区域'),
						React.createElement(Input, { value: receiveRegionText, readOnly: true, style: readOnlyStyle, placeholder: '省-市' })
					),
					React.createElement(
						'div',
						{ style: Object.assign({}, formItemStyle, { gridColumn: 'span 3' }) },
						React.createElement('div', { style: labelStyle }, '调拨原因'),
						React.createElement(Input.TextArea, {
							value: snapshot.reason,
							readOnly: true,
							style: readOnlyStyle,
							autoSize: { minRows: 3, maxRows: 6 }
						})
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
						React.createElement('div', { style: labelStyle }, reqStar, '调拨方式'),
						React.createElement(Select, {
							placeholder: '请选择调拨方式',
							style: controlStyle,
							value: info.method,
							onChange: function (v) {
								updateInfo({ method: v });
							},
							allowClear: true,
							options: methodOptions,
							status: errors.method ? 'error' : undefined
						}),
						errors.method ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.method) : null
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, reqStar, '运输负责人'),
						React.createElement(Input, {
							placeholder: '请输入运输负责人姓名',
							value: info.transportLeader,
							onChange: function (e) {
								updateInfo({ transportLeader: e.target.value });
							},
							status: errors.transportLeader ? 'error' : undefined
						})
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, reqStar, '运输方联系方式'),
						React.createElement(Input, {
							placeholder: '请输入运输方联系方式',
							value: info.transportPhone,
							maxLength: 11,
							onChange: function (e) {
								updateInfo({ transportPhone: phoneDigitsOnly(e.target.value) });
							},
							status: errors.transportPhone ? 'error' : undefined
						}),
						errors.transportPhone ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.transportPhone) : null
					),
					React.createElement(
						'div',
						{ style: formItemStyle },
						React.createElement('div', { style: labelStyle }, reqStar, '接收人员'),
						React.createElement(Select, {
							placeholder: '请输入或选择运维部门人员',
							style: controlStyle,
							value: info.receivePerson,
							onChange: function (v) {
								updateInfo({ receivePerson: v });
							},
							allowClear: true,
							showSearch: true,
							options: opsStaffOptions,
							filterOption: filterOption,
							status: errors.receivePerson ? 'error' : undefined
						}),
						errors.receivePerson ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.receivePerson) : null
					)
				),

				info.method === METHOD_THIRD
					? React.createElement(
						'div',
						{ style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginTop: 8 } },
						React.createElement(
							'div',
							{ style: formItemStyle },
							React.createElement('div', { style: labelStyle }, reqStar, '运输费用'),
							React.createElement(Input, {
								placeholder: '0.00',
								value: info.transportCost,
								onChange: function (e) {
									updateInfo({ transportCost: toFixed2Input(e.target.value) });
								},
								addonAfter: '元',
								status: errors.transportCost ? 'error' : undefined
							}),
							errors.transportCost ? React.createElement('div', { style: { marginTop: 4, color: '#ff4d4f', fontSize: 12 } }, errors.transportCost) : null
						),
						React.createElement(
							'div',
							{ style: Object.assign({}, formItemStyle, { gridColumn: 'span 2' }) },
							React.createElement('div', { style: labelStyle }, '运输合同附件（选填）'),
							React.createElement(
								Upload,
								{
									accept: '.doc,.docx,.pdf',
									multiple: true,
									fileList: fileList,
									beforeUpload: function () {
										return false;
									},
									onChange: function (i) {
										setFileList(i.fileList || []);
									}
								},
								React.createElement(Button, null, '附件上传')
							),
							React.createElement('div', { style: { marginTop: 6, fontSize: 12, color: 'rgba(0,0,0,0.45)' } }, '支持 doc、docx、pdf；原型不实际上传服务器')
						)
				  )
					: null
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
				React.createElement(Button, { type: 'primary', onClick: handleSubmitAudit }, '提交审核'),
				React.createElement(Button, { onClick: handleSave }, '保存'),
				React.createElement(Button, { onClick: handleCancel }, '取消')
			)
		)
	);
};
