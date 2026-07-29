// 【重要】必须使用 const Component 作为组件变量名
// 财务管理 - 提车应收款 - 提车收款单（2026年3月10日版本）

const Component = function () {
	var useState = React.useState;
	var useCallback = React.useCallback;
	var useMemo = React.useMemo;
	var useEffect = React.useEffect;
	var useRef = React.useRef;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Input = antd.Input;
	var Button = antd.Button;
	var Select = antd.Select;
	var Table = antd.Table;
	var Popover = antd.Popover;
	var Tooltip = antd.Tooltip;
	var Modal = antd.Modal;
	var message = antd.message;
	var Option = Select.Option;

	var requirementModalVisible = useState(false);
	var setRequirementModalVisible = requirementModalVisible[1];
	var edited = useState(false);
	var setEdited = edited[1];
	var submitConfirmVisible = useState(false);
	var setSubmitConfirmVisible = submitConfirmVisible[1];
	var cancelConfirmVisible = useState(false);
	var setCancelConfirmVisible = cancelConfirmVisible[1];
	var projectCardExpanded = useState(true);
	var setProjectCardExpanded = projectCardExpanded[1];
	var receivableCardExpanded = useState(true);
	var setReceivableCardExpanded = receivableCardExpanded[1];
	var servicePopoverRowIndex = useState(null);
	var setServicePopoverRowIndex = servicePopoverRowIndex[1];

	// 模拟：项目信息（实际由路由/接口拉取）
	var projectInfo = useMemo(function () {
		return {
			collectCode: 'HT-ZL-2025-001TC0001',
			contractCode: 'HT-ZL-2025-001',
			contractType: '正式合同',
			projectName: '嘉兴氢能示范项目',
			customerName: '嘉兴某某物流有限公司',
			paymentMethod: '预付',
			paymentCycle: '6个月',
			contractStart: '2025-01-15',
			contractEnd: '2026-01-14',
			businessDept: '业务1部',
			businessPerson: '张经理'
		};
	}, []);

	// 模拟：车辆应收款明细（租赁合同中所有车辆），付款周期 6 个月 => 应收月租金 = 月租金*6
	var paymentCycleMonths = 6;
	var vehicleRows = useState([
		{ key: 'v1', index: 1, brand: '东风', model: 'DFH1180', plateNo: '浙A12345', monthRent: 5000, receivableRent: 30000, actualRent: '30000.00', rentRemark: '', receivableDeposit: 10000, serviceItems: [{ name: '代处理费用', receivable: 200, actual: '200.00', discount: '0.00', remark: '' }, { name: '保险上浮', receivable: 500, actual: '500.00', discount: '0.00', remark: '' }], receivableService: 700, actualService: '700.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: true, receivableCompleted: true },
		{ key: 'v2', index: 2, brand: '福田', model: 'BJ1180', plateNo: '浙A23456', monthRent: 4500, receivableRent: 27000, actualRent: '27000.00', rentRemark: '', receivableDeposit: 8000, serviceItems: [{ name: '保养费用', receivable: 300, actual: '300.00', discount: '0.00', remark: '' }], receivableService: 300, actualService: '300.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: true, receivableCompleted: true },
		{ key: 'v3', index: 3, brand: '重汽', model: 'ZZ1187', plateNo: '浙A34567', monthRent: 5200, receivableRent: 31200, actualRent: '31200.00', rentRemark: '', receivableDeposit: 10000, serviceItems: [{ name: '代处理费用', receivable: 180, actual: '180.00', discount: '0.00', remark: '' }, { name: '上牌服务', receivable: 400, actual: '400.00', discount: '0.00', remark: '' }], receivableService: 580, actualService: '580.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: true, receivableCompleted: true },
		{ key: 'v4', index: 4, brand: '陕汽', model: 'SX1313', plateNo: '', monthRent: 4800, receivableRent: 28800, actualRent: '28800.00', rentRemark: '', receivableDeposit: 9000, serviceItems: [{ name: '保险上浮', receivable: 350, actual: '350.00', discount: '0.00', remark: '' }], receivableService: 350, actualService: '350.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v5', index: 5, brand: '解放', model: 'J6P', plateNo: '浙A45678', monthRent: 5500, receivableRent: 33000, actualRent: '33000.00', rentRemark: '', receivableDeposit: 11000, serviceItems: [{ name: '代处理费用', receivable: 220, actual: '220.00', discount: '0.00', remark: '' }, { name: '保养费用', receivable: 280, actual: '280.00', discount: '0.00', remark: '' }], receivableService: 500, actualService: '500.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v6', index: 6, brand: '江淮', model: '格尔发K5', plateNo: '浙A56789', monthRent: 4300, receivableRent: 25800, actualRent: '25800.00', rentRemark: '', receivableDeposit: 8500, serviceItems: [{ name: '保养费用', receivable: 260, actual: '260.00', discount: '0.00', remark: '' }], receivableService: 260, actualService: '260.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v7', index: 7, brand: '东风', model: 'DFH1250', plateNo: '浙A67890', monthRent: 6000, receivableRent: 36000, actualRent: '36000.00', rentRemark: '', receivableDeposit: 12000, serviceItems: [{ name: '代处理费用', receivable: 250, actual: '250.00', discount: '0.00', remark: '' }, { name: '保险上浮', receivable: 600, actual: '600.00', discount: '0.00', remark: '' }], receivableService: 850, actualService: '850.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v8', index: 8, brand: '福田', model: '欧曼EST', plateNo: '', monthRent: 4700, receivableRent: 28200, actualRent: '28200.00', rentRemark: '', receivableDeposit: 9000, serviceItems: [{ name: '上牌服务', receivable: 380, actual: '380.00', discount: '0.00', remark: '' }], receivableService: 380, actualService: '380.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v9', index: 9, brand: '重汽', model: '豪沃T7H', plateNo: '浙A78901', monthRent: 5300, receivableRent: 31800, actualRent: '31800.00', rentRemark: '', receivableDeposit: 10500, serviceItems: [{ name: '代处理费用', receivable: 200, actual: '200.00', discount: '0.00', remark: '' }, { name: '保养费用', receivable: 320, actual: '320.00', discount: '0.00', remark: '' }], receivableService: 520, actualService: '520.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v10', index: 10, brand: '陕汽', model: '德龙X3000', plateNo: '浙A89012', monthRent: 5100, receivableRent: 30600, actualRent: '30600.00', rentRemark: '', receivableDeposit: 10000, serviceItems: [{ name: '保险上浮', receivable: 450, actual: '450.00', discount: '0.00', remark: '' }], receivableService: 450, actualService: '450.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v11', index: 11, brand: '解放', model: 'JH6', plateNo: '浙A90123', monthRent: 5400, receivableRent: 32400, actualRent: '32400.00', rentRemark: '', receivableDeposit: 10800, serviceItems: [{ name: '代处理费用', receivable: 210, actual: '210.00', discount: '0.00', remark: '' }, { name: '上牌服务', receivable: 420, actual: '420.00', discount: '0.00', remark: '' }], receivableService: 630, actualService: '630.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v12', index: 12, brand: '江淮', model: '帅铃', plateNo: '', monthRent: 4000, receivableRent: 24000, actualRent: '24000.00', rentRemark: '', receivableDeposit: 8000, serviceItems: [{ name: '保养费用', receivable: 240, actual: '240.00', discount: '0.00', remark: '' }], receivableService: 240, actualService: '240.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v13', index: 13, brand: '东风', model: 'DFH1180', plateNo: '浙B12345', monthRent: 5000, receivableRent: 30000, actualRent: '30000.00', rentRemark: '', receivableDeposit: 10000, serviceItems: [{ name: '代处理费用', receivable: 200, actual: '200.00', discount: '0.00', remark: '' }], receivableService: 200, actualService: '200.00', discountAmount: '500.00', discountRemark: '首月优惠', discountProof: [], selected: false },
		{ key: 'v14', index: 14, brand: '福田', model: 'BJ1180', plateNo: '浙B23456', monthRent: 4600, receivableRent: 27600, actualRent: '27600.00', rentRemark: '', receivableDeposit: 9200, serviceItems: [{ name: '保险上浮', receivable: 380, actual: '380.00', discount: '0.00', remark: '' }], receivableService: 380, actualService: '380.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v15', index: 15, brand: '重汽', model: 'ZZ1187', plateNo: '浙B34567', monthRent: 4900, receivableRent: 29400, actualRent: '29400.00', rentRemark: '', receivableDeposit: 9800, serviceItems: [{ name: '代处理费用', receivable: 190, actual: '190.00', discount: '0.00', remark: '' }, { name: '保养费用', receivable: 310, actual: '310.00', discount: '0.00', remark: '' }], receivableService: 500, actualService: '500.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v16', index: 16, brand: '陕汽', model: 'SX1313', plateNo: '', monthRent: 4750, receivableRent: 28500, actualRent: '28500.00', rentRemark: '', receivableDeposit: 9500, serviceItems: [{ name: '上牌服务', receivable: 360, actual: '360.00', discount: '0.00', remark: '' }], receivableService: 360, actualService: '360.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v17', index: 17, brand: '解放', model: 'J6P', plateNo: '浙B45678', monthRent: 5600, receivableRent: 33600, actualRent: '33600.00', rentRemark: '', receivableDeposit: 11200, serviceItems: [{ name: '代处理费用', receivable: 230, actual: '230.00', discount: '0.00', remark: '' }, { name: '保险上浮', receivable: 550, actual: '550.00', discount: '0.00', remark: '' }], receivableService: 780, actualService: '780.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v18', index: 18, brand: '江淮', model: '格尔发K5', plateNo: '浙B56789', monthRent: 4400, receivableRent: 26400, actualRent: '26400.00', rentRemark: '', receivableDeposit: 8800, serviceItems: [{ name: '保养费用', receivable: 270, actual: '270.00', discount: '0.00', remark: '' }], receivableService: 270, actualService: '270.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false },
		{ key: 'v19', index: 19, brand: '东风', model: 'DFH1250', plateNo: '浙B67890', monthRent: 5800, receivableRent: 34800, actualRent: '34800.00', rentRemark: '', receivableDeposit: 11600, serviceItems: [{ name: '代处理费用', receivable: 240, actual: '240.00', discount: '0.00', remark: '' }], receivableService: 240, actualService: '240.00', discountAmount: '200.00', discountRemark: '客户协商', discountProof: [], selected: false },
		{ key: 'v20', index: 20, brand: '福田', model: '欧曼EST', plateNo: '浙B78901', monthRent: 4650, receivableRent: 27900, actualRent: '27900.00', rentRemark: '', receivableDeposit: 9300, serviceItems: [{ name: '上牌服务', receivable: 390, actual: '390.00', discount: '0.00', remark: '' }, { name: '保养费用', receivable: 290, actual: '290.00', discount: '0.00', remark: '' }], receivableService: 680, actualService: '680.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false }
	]);
	var vehicles = vehicleRows[0];
	var setVehicles = vehicleRows[1];

	// 氢费预付款（非预付款模式时不显示）
	var hasHydrogenPrepay = true;
	var hydrogenRow = useState({
		receivable: '3580.00',
		actual: '3580.00',
		discount: '0.00',
		discountRemark: ''
	});
	var hydrogen = hydrogenRow[0];
	var setHydrogen = hydrogenRow[1];

	var invoiceMethod = useState('先开票后付款');
	var setInvoiceMethod = invoiceMethod[1];
	var invoiceRemark = useState('');
	var setInvoiceRemark = invoiceRemark[1];

	var toggleVehicleSelected = useCallback(function (key) {
		setEdited(true);
		setVehicles(function (prev) {
			return prev.map(function (r) {
				if (r.key !== key || r.receivableCompleted) return r;
				return Object.assign({}, r, { selected: !r.selected });
			});
		});
	}, []);

	var toggleAllSelected = useCallback(function (checked) {
		setEdited(true);
		setVehicles(function (prev) {
			return prev.map(function (r) {
				if (r.receivableCompleted) return r;
				return Object.assign({}, r, { selected: !!checked });
			});
		});
	}, []);

	var updateVehicle = useCallback(function (key, field, value) {
		setEdited(true);
		setVehicles(function (prev) {
			return prev.map(function (r) {
				if (r.key !== key) return r;
				var next = Object.assign({}, r);
				next[field] = value;
				if (field === 'serviceItems') {
					var total = 0;
					(value || []).forEach(function (s) { total += parseFloat(s.actual) || 0; });
					next.actualService = total.toFixed(2);
				}
				return next;
			});
		});
	}, []);

	var updateServiceItem = useCallback(function (vehicleKey, itemIndex, field, value) {
		setEdited(true);
		setVehicles(function (prev) {
			return prev.map(function (r) {
				if (r.key !== vehicleKey) return r;
				var items = (r.serviceItems || []).slice();
				if (!items[itemIndex]) return r;
				items[itemIndex] = Object.assign({}, items[itemIndex], { [field]: value });
				var total = 0;
				items.forEach(function (s) { total += parseFloat(s.actual) || 0; });
				return Object.assign({}, r, { serviceItems: items, actualService: total.toFixed(2) });
			});
		});
	}, []);

	var totals = useMemo(function () {
		// 只计算已选中且未完成提车应收款的车辆
		var selected = vehicles.filter(function (v) { return v.selected && !v.receivableCompleted; });
		var receivableRent = 0, actualRent = 0, receivableDeposit = 0, receivableService = 0, actualService = 0, discountTotal = 0;
		selected.forEach(function (v) {
			receivableRent += Number(v.receivableRent) || 0;
			actualRent += parseFloat(v.actualRent) || 0;
			receivableDeposit += Number(v.receivableDeposit) || 0;
			receivableService += Number(v.receivableService) || 0;
			actualService += parseFloat(v.actualService) || 0;
			discountTotal += parseFloat(v.discountAmount) || 0;
		});
		return {
			receivableRent: receivableRent.toFixed(2),
			actualRent: actualRent.toFixed(2),
			receivableDeposit: receivableDeposit.toFixed(2),
			receivableService: receivableService.toFixed(2),
			actualService: actualService.toFixed(2),
			discountTotal: discountTotal.toFixed(2)
		};
	}, [vehicles]);

	var hydrogenReceivable = hasHydrogenPrepay ? (parseFloat(hydrogen.receivable) || 0) : 0;
	var hydrogenActual = hasHydrogenPrepay ? (parseFloat(hydrogen.actual) || 0) : 0;

	var receivableTotal = useMemo(function () {
		var base = parseFloat(totals.receivableRent) + parseFloat(totals.receivableDeposit) + parseFloat(totals.receivableService);
		return (base + hydrogenReceivable).toFixed(2);
	}, [totals, hydrogenReceivable]);

	var actualTotal = useMemo(function () {
		var base = parseFloat(totals.actualRent) + parseFloat(totals.receivableDeposit) + parseFloat(totals.actualService) - parseFloat(totals.discountTotal);
		return (base + hydrogenActual).toFixed(2);
	}, [totals, hydrogenActual]);

	var invoiceTotal = useMemo(function () {
		var base = parseFloat(totals.actualRent) + parseFloat(totals.actualService) - parseFloat(totals.discountTotal);
		return (base + hydrogenActual).toFixed(2);
	}, [totals, hydrogenActual]);

	var receivablePopoverContent = useMemo(function () {
		var rows = [
			React.createElement('tr', { key: 'rent' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收车辆月租金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableRent + ' 元')),
			React.createElement('tr', { key: 'deposit' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收车辆保证金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableDeposit + ' 元')),
			React.createElement('tr', { key: 'service' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收服务费'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableService + ' 元'))
		];
		if (hasHydrogenPrepay) {
			rows.push(React.createElement('tr', { key: 'hydrogen' }, React.createElement('td', { style: { padding: '6px 8px' } }, '氢费预充值应收金额'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, (hydrogen.receivable || '0.00') + ' 元')));
		}
		return React.createElement('div', { style: { padding: 8, minWidth: 220 } },
			React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '项目'),
						React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '金额')
					)
				),
				React.createElement('tbody', null, rows)
			)
		);
	}, [totals, hasHydrogenPrepay, hydrogen.receivable]);

	var actualPopoverContent = useMemo(function () {
		var rows = [
			React.createElement('tr', { key: 'rent' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计实收车辆月租金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.actualRent + ' 元')),
			React.createElement('tr', { key: 'deposit' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收车辆保证金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableDeposit + ' 元')),
			React.createElement('tr', { key: 'service' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计实收服务费'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.actualService + ' 元')),
			React.createElement('tr', { key: 'discount' }, React.createElement('td', { style: { padding: '6px 8px' } }, '总计减免金额'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.discountTotal + ' 元'))
		];
		if (hasHydrogenPrepay) {
			rows.push(React.createElement('tr', { key: 'hydrogen' }, React.createElement('td', { style: { padding: '6px 8px' } }, '氢费预充值实收金额'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, (hydrogen.actual || '0.00') + ' 元')));
		}
		return React.createElement('div', { style: { padding: 8, minWidth: 220 } },
			React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '项目'),
						React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '金额')
					)
				),
				React.createElement('tbody', null, rows)
			)
		);
	}, [totals, hasHydrogenPrepay, hydrogen.actual]);

	var handleSubmit = useCallback(function () {
		setSubmitConfirmVisible(true);
	}, []);

	var handleSubmitConfirm = useCallback(function () {
		message.success('提车应收款已提交审核');
		setSubmitConfirmVisible(false);
		if (window.__receivableSubmit) window.__receivableSubmit();
	}, []);

	var handleSave = useCallback(function () {
		message.success('保存成功');
		if (window.__receivableBack) window.__receivableBack(); else message.info('跳转至提车应收款列表页（原型）');
	}, []);

	var handleCancel = useCallback(function () {
		if (edited[0]) {
			setCancelConfirmVisible(true);
		} else {
			if (window.__receivableBack) window.__receivableBack(); else message.info('返回提车应收款列表（原型）');
		}
	}, [edited[0]]);

	var handleCancelConfirm = useCallback(function () {
		setCancelConfirmVisible(false);
		if (window.__receivableBack) window.__receivableBack(); else message.info('返回提车应收款列表（原型）');
	}, []);

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var labelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var requiredStar = { color: '#ff4d4f', marginRight: 2 };
	var formRowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', marginBottom: 16 };
	var formItemStyle = { marginBottom: 12 };
	var highlightStyle = { color: '#1890ff', fontWeight: 600, cursor: 'pointer' };
	var valueStyle = { color: 'rgba(0,0,0,0.85)', fontSize: 14, lineHeight: '22px', minHeight: 22 };
	var thBase = { padding: '10px 12px', border: '1px solid #f0f0f0', whiteSpace: 'nowrap' };

	var requirementContent = '提车应收款-提车收款单（2026年3月10日版本）\n一个「数字化资产ONEOS运管平台」中的「财务管理」「提车应收款」「提车收款单」模块\n#面包屑：财务管理-提车应收款-提车收款单；\n\n页面分为3个卡片，业务流程请参考流程图；\n1.项目信息：\n#显示项目详细信息，包括：\n1.1.合同编码：显示该租赁合同对应合同编码；\n1.2.合同类型：显示该租赁合同对应合同类型；\n1.3.项目名称：显示该租赁合同对应项目名称；\n1.4.客户名称：显示该租赁合同对应客户名称；\n1.5.付款方式：显示该租赁合同对应付款方式，分为：预付、后付两种，根据实际合同反写；\n1.6.付款周期：显示该租赁合同对应付款周期，格式为：x个月；\n1.7.合同生效时间：显示该租赁合同对应合同生效时间；\n1.8.合同结束时间：显示该租赁合同对应合同结束时间；\n1.9.业务部门：显示该租赁合同对应业务部门名称；\n1.10.业务负责人：显示该租赁合同对应业务负责人；\n\n2.提车应收款信息：\n#上方显示应收款总额、实收款总额；\n2.1.应收款总额：格式为：xx.xx元，重点色，计算方式为：「选中车辆应收车辆月租金总和」+「选中车辆应收车辆保证金总和」+「选中车辆应收服务费总和」+「氢费预充值应收金额」；\n    点击应收款总额金额，弹出气泡卡片，气泡卡片列表展示：项目、金额；\n    2.1.1.项目：包括总计应收车辆月租金、总计应收车辆保证金、总计应收服务费三项；\n    2.1.2.金额：显示该项目对应应收金额；\n2.2.实收款总额：格式为：xx.xx元，重点色，计算方式为：「选中车辆实收车辆月租金总和」+「选中车辆应收车辆保证金总和」+「选中车辆实收服务费总和」+「氢费预充值实收金额」-「选中车辆减免金额总和」；\n    点击实收款总额金额，弹出气泡卡片，气泡卡片列表展示：项目、金额；\n    2.2.1.项目：包括总计实收车辆月租金、总计应收车辆保证金、总计实收服务费、总计减免金额四项；\n    2.2.2.金额：显示该项目对应实收金额；\n2.3.应开票总额：格式为：xx.xx元，计算方式为：「选中车辆实收车辆月租金总和」+「选中车辆实收服务费总和」-「选中车辆减免金额总和」；\n\n#中间为车辆应收款明细，以列表展示租赁合同中所有车辆明细，包括以下字段：\n2.1.全选/多选：多选按钮组，支持表头点击全选，默认为取消勾选（整个车辆清单）；\n    选择代表本次提车应收款只收取该部分车辆费用，可以编辑以下相应字段，不选择则代表本次提车应收款不收取该部分车辆费用，不能编辑车辆相应字段；\n    提车应收款支持分批次进行收款，如果该车辆之前已提交提车应收款流程，则多选框不能勾选，悬浮多选框时提示：该车辆已完成提车应收款/该车辆已提交提车收款单；\n2.2.序号：根据租赁合同中车辆对应序号顺序展示；\n2.3.品牌：显示租赁合同中车辆对应品牌；\n2.4.型号：显示租赁合同中车辆对应型号；\n2.5.车牌号：显示租赁合同中车辆对应车牌号，如果车牌号为空则显示为-（后续如果交车成功，则车牌号会反显在该处）；\n2.6.应收车辆月租金：根据租赁合同付款周期自动计算，例如：付款周期为6个月，则这里显示金额为：车辆月租金*6；\n2.7.实收车辆月租金：必填项，输入框，默认反写实收车辆月租金，支持修改，由业务员自行输入车辆月租金金额，精确至2位小数，后缀为元；\n2.8.车辆租金备注：选填项，输入框，由业务员自行输入；\n2.9.减免金额：选填项，输入框，由业务员自行输入减免金额，默认为0.00，支持2位小数，后缀为元；\n2.10.减免金额备注：选填项，输入框，由业务员自行输入备注信息；\n2.11.应收车辆保证金：显示租赁合同中当前车辆保证金金额；\n2.12.服务费项目：点击管理，弹出气泡卡片，气泡卡片标题为服务费项目，下方为列表，显示服务项目、应收费用、实收费用、备注；\n     2.12.1.服务项目：显示租赁合同中所有服务项目名称；\n     2.12.2.应收费用：显示租赁合同中所有服务项目对应费用；\n     2.12.3.实收费用：必填项，输入框，默认反写应收费用，支持修改，由业务员自行输入实收费用金额，精确至2位小数，后缀为元；\n     2.12.4.减免费用：选填项，输入框，默认为：0.00，精确至2位小数，后缀为元；\n     2.12.4.备注：选填项，输入框，由业务员自行输入备注信息；\n2.13.应收服务费：显示当前车辆所有服务费应收费用总和，格式为：xx.xx元；\n2.14.实收服务费：显示当前车辆所有服务费实收费用总和，格式为：xx.xx元；\n2.15.减免金额：选填项，输入框，由业务员自行输入减免金额，默认为0.00，支持2位小数，后缀为元；\n2.16.减免金额备注：选填项，输入框，由业务员自行输入备注信息；\n2.17.减免证明：选填项，附件上传按钮，点击后上传本地文件，支持：jpg、png、pdf等格式，支持多附件上传；\n\n列表不支持分页功能；\n#下方为氢费预付款情况，以列表展示租赁合同中所有氢费预付款明细，包括以下字段，如租赁合同氢费非预付款模式，则不显示该部分内容：\n2.19.氢费预付款应收金额：显示租赁合同中氢费预付款金额，格式为：xx.xx元，支持2位小数；\n2.20.氢费预付款实收金额：必填项，输入框，默认反写氢费预付款应收金额，支持修改，由业务员自行输入金额，格式为：xx.xx元，支持2位小数；\n2.21.减免金额：选填项，输入框，由业务员自行输入减免金额，默认为：0.00元，格式为：xx.xx元，支持2位小数；\n2.22.减免金额备注：选填项，输入框，由业务员自行输入减免金额备注信息；\n#最底部为开票方式、开票备注；\n2.23.开票方式：选择器，选项包括：先开票后付款、先付款后开票，默认为先开票后付款；\n2.24.开票备注：必填项，文本域，默认提示文本为：请输入开票项目、税率以及其他备注信息，财务将以此进行开票；\n\n3.底部为提交审核，保存，取消；\n3.1.提交审核：点击提交审核，进行二次确认，文案为：请仔细核对提车首付款实收金额，点击确认则进入工作流；\n3.2.保存：点击保存，提示保存成功，跳转至提车应收款列表页，同时该条数据审核状态为：待提交：\n3.3.取消：点击取消，进行二次确认，文案为：取消将会丢失所有已填写数据，是否确认，点击确认则跳转至提车应收款列表页；';

	var selectableVehicles = vehicles.filter(function (v) { return !v.receivableCompleted; });
	var allSelected = selectableVehicles.length > 0 && selectableVehicles.every(function (v) { return v.selected; });
	var indeterminate = selectableVehicles.some(function (v) { return v.selected; }) && !allSelected;
	var headerCheckRef = useRef(null);
	useEffect(function () {
		if (headerCheckRef.current) headerCheckRef.current.indeterminate = indeterminate;
	}, [indeterminate]);

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '财务管理' },
					{ title: '提车应收款' },
					{ title: '提车收款单' }
				]
			}),
			React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { setRequirementModalVisible(true); } }, '查看需求说明')
		),
		React.createElement(Card, {
			title: '项目信息',
			style: cardStyle,
			extra: React.createElement(Button, { type: 'link', size: 'small', onClick: function () { setProjectCardExpanded(!projectCardExpanded[0]); } }, projectCardExpanded[0] ? '收起' : '展开')
		},
			projectCardExpanded[0] ? React.createElement('div', { style: formRowStyle },
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '提车收款单编码'),
					React.createElement('div', { style: valueStyle }, projectInfo.collectCode || '-')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '合同编码'),
					React.createElement('div', { style: valueStyle }, projectInfo.contractCode || '-')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '合同类型'),
					React.createElement('div', { style: valueStyle }, projectInfo.contractType || '-')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '项目名称'),
					React.createElement('div', { style: valueStyle }, projectInfo.projectName || '-')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '客户名称'),
					React.createElement('div', { style: valueStyle }, projectInfo.customerName || '-')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '付款方式'),
					React.createElement('div', { style: valueStyle }, projectInfo.paymentMethod || '-')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '付款周期'),
					React.createElement('div', { style: valueStyle }, projectInfo.paymentCycle || '-')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '合同生效时间'),
					React.createElement('div', { style: valueStyle }, projectInfo.contractStart || '-')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '合同结束时间'),
					React.createElement('div', { style: valueStyle }, projectInfo.contractEnd || '-')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '业务部门'),
					React.createElement('div', { style: valueStyle }, projectInfo.businessDept || '-')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '业务负责人'),
					React.createElement('div', { style: valueStyle }, projectInfo.businessPerson || '-')
				)
			) : null
		),
		React.createElement(Card, {
			title: '提车应收款信息',
			style: cardStyle,
			extra: React.createElement(Button, { type: 'link', size: 'small', onClick: function () { setReceivableCardExpanded(!receivableCardExpanded[0]); } }, receivableCardExpanded[0] ? '收起' : '展开')
		},
			receivableCardExpanded[0] ? React.createElement(React.Fragment, null,
			React.createElement('div', { style: { marginBottom: 16, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' } },
				React.createElement(Popover, { content: receivablePopoverContent, title: '应收款明细', trigger: 'click' },
					React.createElement('span', { style: { cursor: 'pointer' } }, '应收款总额：', React.createElement('span', { style: highlightStyle }, receivableTotal, ' 元'))
				),
				React.createElement(Popover, { content: actualPopoverContent, title: '实收款明细', trigger: 'click' },
					React.createElement('span', { style: { cursor: 'pointer' } }, '实收款总额：', React.createElement('span', { style: highlightStyle }, actualTotal, ' 元'))
				),
				React.createElement('span', null, '应开票总额：', React.createElement('span', { style: highlightStyle }, invoiceTotal, ' 元'))
			),
			React.createElement('div', { style: { overflowX: 'auto', marginBottom: 16, overflowY: 'visible' } },
				React.createElement('table', { style: { width: '100%', minWidth: 1600, borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' } },
					React.createElement('thead', null,
						React.createElement('tr', { style: { backgroundColor: '#fafafa' } },
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'left', width: 48 }) },
								React.createElement('input', { type: 'checkbox', checked: allSelected, ref: headerCheckRef, onChange: function (e) { toggleAllSelected(e.target.checked); } })
							),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'left', width: 50 }) }, '序号'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'left', width: 80 }) }, '品牌'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'left', width: 90 }) }, '型号'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'left', width: 100 }) }, '车牌号'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 120 }) }, '应收车辆月租金'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'left', width: 130 }) }, React.createElement('span', null, React.createElement('span', { style: requiredStar }, '*'), '实收车辆月租金')),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'left', width: 130 }) }, '车辆租金备注'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'left', width: 130 }) }, '减免金额'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'left', width: 130 }) }, '减免金额备注'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'left', width: 130 }) }, '减免证明'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 110 }) }, '应收车辆保证金'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'left', width: 90 }) }, '服务费项目'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 90 }) }, '应收服务费'),
							React.createElement('th', { style: Object.assign({}, thBase, { textAlign: 'right', width: 130 }) }, '实收服务费')
						)
					),
					React.createElement('tbody', null,
						vehicles.map(function (row) {
							var disabled = !row.selected || row.receivableCompleted;
							var servicePopover = React.createElement('div', { style: { padding: 8, minWidth: 360 } },
								React.createElement('div', { style: { fontWeight: 600, marginBottom: 8 } }, '服务费项目'),
								React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12 } },
									React.createElement('thead', null,
										React.createElement('tr', null,
											React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '服务项目'),
											React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '应收费用'),
											React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, React.createElement('span', null, React.createElement('span', { style: requiredStar }, '*'), '实收费用')),
											React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '减免费用'),
											React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '备注')
										)
									),
									React.createElement('tbody', null,
										(row.serviceItems || []).map(function (s, si) {
											return React.createElement('tr', { key: si },
												React.createElement('td', { style: { padding: '6px 8px' } }, s.name),
												React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, (s.receivable != null ? s.receivable : '') + ' 元'),
												React.createElement('td', { style: { padding: '6px 8px' } },
													React.createElement(Input, { size: 'small', value: s.actual, disabled: disabled, suffix: '元', onChange: function (e) { updateServiceItem(row.key, si, 'actual', e.target.value); } })
												),
												React.createElement('td', { style: { padding: '6px 8px' } },
													React.createElement(Input, { size: 'small', value: s.discount, disabled: disabled, suffix: '元', onChange: function (e) { updateServiceItem(row.key, si, 'discount', e.target.value); } })
												),
												React.createElement('td', { style: { padding: '6px 8px' } },
													React.createElement(Input, { size: 'small', value: s.remark, disabled: disabled, placeholder: '备注', onChange: function (e) { updateServiceItem(row.key, si, 'remark', e.target.value); } })
												)
											);
										})
									)
								)
							);
							var proofList = row.discountProof || [];
							var onProofUpload = function (e) {
								var files = e.target.files;
								if (!files || !files.length) return;
								setEdited(true);
								var next = proofList.slice();
								for (var i = 0; i < files.length; i++) { next.push({ name: files[i].name }); }
								updateVehicle(row.key, 'discountProof', next);
								e.target.value = '';
							};
							var removeProof = function (idx) {
								setEdited(true);
								var next = (row.discountProof || []).slice();
								next.splice(idx, 1);
								updateVehicle(row.key, 'discountProof', next);
							};
							var checkboxCell = row.receivableCompleted
								? React.createElement(Tooltip, { title: '该车辆已完成提车应收款' },
									React.createElement('span', { style: { display: 'inline-block', cursor: 'not-allowed' } },
										React.createElement('input', { type: 'checkbox', checked: true, disabled: true })
									)
								)
								: React.createElement('input', { type: 'checkbox', checked: row.selected, onChange: function () { toggleVehicleSelected(row.key); } });
							return React.createElement('tr', { key: row.key },
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, checkboxCell),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.index),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.brand),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.model),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.plateNo || '-'),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.receivableRent || 0) + ' 元'),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', width: 130 } },
									React.createElement(Input, { size: 'small', value: row.actualRent, disabled: disabled, suffix: '元', onChange: function (e) { updateVehicle(row.key, 'actualRent', e.target.value); } })
								),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', width: 130 } },
									React.createElement(Input, { size: 'small', value: row.rentRemark, disabled: disabled, onChange: function (e) { updateVehicle(row.key, 'rentRemark', e.target.value); } })
								),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', width: 130 } },
									React.createElement(Input, { size: 'small', value: row.discountAmount, disabled: disabled, suffix: '元', onChange: function (e) { updateVehicle(row.key, 'discountAmount', e.target.value); } })
								),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', width: 130 } },
									React.createElement(Input, { size: 'small', value: row.discountRemark, disabled: disabled, onChange: function (e) { updateVehicle(row.key, 'discountRemark', e.target.value); } })
								),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', width: 130 } },
									disabled ? '-' : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
										proofList.map(function (p, pidx) {
											return React.createElement('div', { key: pidx, style: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 } },
												React.createElement('span', { style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' } }, p.name || '附件'),
												React.createElement(Button, { type: 'link', size: 'small', danger: true, style: { padding: 0, minWidth: 'auto' }, onClick: function () { removeProof(pidx); } }, '删除')
											);
										}),
										React.createElement('span', null,
											React.createElement('input', { type: 'file', multiple: true, accept: '.jpg,.jpeg,.png,.pdf', style: { display: 'none' }, id: 'proof-' + row.key, onChange: onProofUpload }),
											React.createElement(Button, { type: 'default', size: 'small', onClick: function () { var el = document.getElementById('proof-' + row.key); if (el) el.click(); } }, '附件上传')
										)
									)
								),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.receivableDeposit || 0) + ' 元'),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } },
									React.createElement(Popover, { content: servicePopover, title: null, trigger: 'click' },
										React.createElement(Button, { type: 'link', size: 'small', disabled: disabled }, '管理')
									)
								),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.receivableService || 0) + ' 元'),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right', width: 130 } }, (row.actualService || '0.00') + ' 元')
							);
						})
					)
				)
			),
			hasHydrogenPrepay ? React.createElement('div', { style: { marginBottom: 16 } },
				React.createElement('div', { style: { fontSize: 14, fontWeight: 500, marginBottom: 8 } }, '氢费预付款情况'),
				React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, maxWidth: 800 } },
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '氢费预付款应收金额'),
						React.createElement(Input, { value: hydrogen.receivable + ' 元', disabled: true })
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, React.createElement('span', { style: requiredStar }, '*'), '氢费预付款实收金额'),
						React.createElement(Input, { value: hydrogen.actual, suffix: '元', onChange: function (e) { setHydrogen(function (p) { return Object.assign({}, p, { actual: e.target.value }); }); } })
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '减免金额'),
						React.createElement(Input, { value: hydrogen.discount, suffix: '元', onChange: function (e) { setHydrogen(function (p) { return Object.assign({}, p, { discount: e.target.value }); }); } })
					),
					React.createElement('div', { style: formItemStyle },
						React.createElement('div', { style: labelStyle }, '减免金额备注'),
						React.createElement(Input, { value: hydrogen.discountRemark, onChange: function (e) { setHydrogen(function (p) { return Object.assign({}, p, { discountRemark: e.target.value }); }); } })
					)
				)
			) : null,
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginTop: 16 } },
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '开票方式'),
					React.createElement(Select, { style: { width: '100%' }, value: invoiceMethod[0], onChange: function (v) { setInvoiceMethod(v); }, placeholder: '请选择' },
						React.createElement(Option, { value: '先开票后付款' }, '先开票后付款'),
						React.createElement(Option, { value: '先付款后开票' }, '先付款后开票')
					)
				),
				React.createElement('div', { style: Object.assign({}, formItemStyle, { gridColumn: '1 / -1' }) },
					React.createElement('div', { style: labelStyle }, React.createElement('span', { style: requiredStar }, '*'), '开票备注'),
					React.createElement(Input.TextArea, { value: invoiceRemark[0], onChange: function (e) { setInvoiceRemark(e.target.value); setEdited(true); }, rows: 3, placeholder: '请输入开票项目、税率以及其他备注信息，财务将以此进行开票', style: { width: '100%' } })
				)
			)
		) : null
		),
		React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 24 } },
			React.createElement(Button, { type: 'primary', onClick: handleSubmit }, '提交审核'),
			React.createElement(Button, { onClick: handleSave }, '保存'),
			React.createElement(Button, { onClick: handleCancel }, '取消')
		),
		React.createElement(Modal, {
			title: '确认',
			open: submitConfirmVisible[0],
			onCancel: function () { setSubmitConfirmVisible(false); },
			onOk: handleSubmitConfirm,
			okText: '确认',
			cancelText: '取消'
		}, React.createElement('div', null, '请仔细核对提车首付款实收金额，点击确认则进入工作流')),
		React.createElement(Modal, {
			title: '确认取消',
			open: cancelConfirmVisible[0],
			onCancel: function () { setCancelConfirmVisible(false); },
			onOk: handleCancelConfirm,
			okText: '确认',
			cancelText: '取消'
		}, React.createElement('div', null, '取消将会丢失所有已填写数据，是否确认？')),
		React.createElement(Modal, {
			title: '需求说明',
			open: requirementModalVisible[0],
			onCancel: function () { setRequirementModalVisible(false); },
			width: 720,
			footer: React.createElement(Button, { onClick: function () { setRequirementModalVisible(false); } }, '关闭'),
			bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
		}, React.createElement('div', { style: { padding: '8px 0', whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6 } }, requirementContent))
	);
};
