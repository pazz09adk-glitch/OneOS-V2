// 【重要】必须使用 const Component 作为组件变量名
// 财务管理 - 提车应收款 - 开票信息（2026年3月5日版本）

const Component = function () {
	var useState = React.useState;
	var useCallback = React.useCallback;
	var useMemo = React.useMemo;
	var useRef = React.useRef;
	var useEffect = React.useEffect;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Input = antd.Input;
	var Button = antd.Button;
	var Popover = antd.Popover;
	var Tooltip = antd.Tooltip;
	var Modal = antd.Modal;
	var message = antd.message;
	var Steps = antd.Steps;
	var DatePicker = antd.DatePicker;

	var dayjs = window.dayjs || null;
	function nowStr() {
		return dayjs && dayjs().format ? dayjs().format('YYYY-MM-DD HH:mm') : (new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0') + ' ' + String(new Date().getHours()).padStart(2, '0') + ':' + String(new Date().getMinutes()).padStart(2, '0'));
	}

	var projectCardExpanded = useState(true);
	var receivableCardExpanded = useState(true);
	var invoiceCardExpanded = useState(true);
	var approveCardExpanded = useState(true);
	var submitConfirmVisible = useState(false);
	var cancelConfirmVisible = useState(false);
	var requirementModalVisible = useState(false);
	var proofPreviewVisible = useState(false);
	var proofPreviewFile = useState(null);
	var invoicePreviewVisible = useState(false);
	var invoicePreviewFile = useState(null);

	// 开票记录列表：历史记录 submitted=true 不可删，新增行 submitted=false 可删
	var invoiceListState = useState([
		{ id: 'hist1', arrivalTime: '2026-03-01 10:00', arrivalAmount: '50000.00', invoiceTime: '2026-03-02 14:30', invoiceFiles: [{ name: '发票1.pdf' }], remark: '首笔到账', invoicePerson: '李财务', submitted: true },
		{ id: 'new1', arrivalTime: '', arrivalAmount: '', invoiceTime: nowStr(), invoiceFiles: [], remark: '', invoicePerson: '-', submitted: false }
	]);
	var invoiceList = invoiceListState[0];
	var setInvoiceList = invoiceListState[1];
	var nextIdRef = useRef(2);

	var projectInfo = useMemo(function () {
		return {
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

	// 车辆应收款明细：全选默认为取消勾选；已完成提车应收款的不可勾选
	var vehicleRows = useState([
		{ key: 'v1', index: 1, brand: '东风', model: 'DFH1180', plateNo: '浙A12345', receivableRent: 30000, actualRent: '30000.00', rentRemark: '', receivableDeposit: 10000, serviceItems: [{ name: '代处理费用', receivable: 200, actual: '200.00', discount: '0.00', remark: '' }, { name: '保险上浮', receivable: 500, actual: '500.00', discount: '0.00', remark: '' }], receivableService: 700, actualService: '700.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false, receivableCompleted: true },
		{ key: 'v2', index: 2, brand: '福田', model: 'BJ1180', plateNo: '浙A23456', receivableRent: 27000, actualRent: '27000.00', rentRemark: '', receivableDeposit: 8000, serviceItems: [{ name: '保养费用', receivable: 300, actual: '300.00', discount: '0.00', remark: '' }], receivableService: 300, actualService: '300.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: false, receivableCompleted: true },
		{ key: 'v3', index: 3, brand: '重汽', model: 'ZZ1187', plateNo: '浙A34567', receivableRent: 31200, actualRent: '31200.00', rentRemark: '', receivableDeposit: 10000, serviceItems: [{ name: '代处理费用', receivable: 180, actual: '180.00', discount: '0.00', remark: '' }, { name: '上牌服务', receivable: 400, actual: '400.00', discount: '0.00', remark: '' }], receivableService: 580, actualService: '580.00', discountAmount: '0.00', discountRemark: '', discountProof: [{ name: '减免说明.pdf' }], selected: true, receivableCompleted: false },
		{ key: 'v4', index: 4, brand: '陕汽', model: 'SX1313', plateNo: '', receivableRent: 28800, actualRent: '28800.00', rentRemark: '', receivableDeposit: 9000, serviceItems: [{ name: '保险上浮', receivable: 350, actual: '350.00', discount: '0.00', remark: '' }], receivableService: 350, actualService: '350.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: true, receivableCompleted: false },
		{ key: 'v5', index: 5, brand: '解放', model: 'J6P', plateNo: '浙A45678', receivableRent: 33000, actualRent: '33000.00', rentRemark: '', receivableDeposit: 11000, serviceItems: [{ name: '代处理费用', receivable: 220, actual: '220.00', discount: '0.00', remark: '' }, { name: '保养费用', receivable: 280, actual: '280.00', discount: '0.00', remark: '' }], receivableService: 500, actualService: '500.00', discountAmount: '0.00', discountRemark: '', discountProof: [], selected: true, receivableCompleted: false }
	]);
	var vehicles = vehicleRows[0];
	var setVehicles = vehicleRows[1];

	var hasHydrogenPrepay = true;
	// 氢费预付款（仅一条，提交审核时的数据，只读展示）
	var hydrogen = useMemo(function () {
		return { receivable: '3580.00', actual: '3580.00', discount: '0.00', discountRemark: '氢费预付款减免说明，与客户签订补充协议' };
	}, []);
	var invoiceMethod = '先开票后付款';
	var invoiceRemark = '开票项目：租赁费，税率 13%。请开具增值税专用发票。';

	var updateVehicle = useCallback(function (key, field, value) {
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
		var selected = vehicles.filter(function (v) { return v.selected; });
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

	var selectedVehicles = vehicles.filter(function (v) { return v.selected; });

	var receivableTotal = (parseFloat(totals.receivableRent) + parseFloat(totals.receivableDeposit) + parseFloat(totals.receivableService)).toFixed(2);
	var actualTotal = (parseFloat(totals.actualRent) + parseFloat(totals.receivableDeposit) + parseFloat(totals.actualService) - parseFloat(totals.discountTotal)).toFixed(2);

	var receivablePopoverContent = useMemo(function () {
		return React.createElement('div', { style: { padding: 8, minWidth: 220 } },
			React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '项目'),
						React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '金额')
					)
				),
				React.createElement('tbody', null,
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收车辆月租金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableRent + ' 元')),
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收车辆保证金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableDeposit + ' 元')),
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收服务费'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableService + ' 元'))
				)
			)
		);
	}, [totals]);

	var actualPopoverContent = useMemo(function () {
		return React.createElement('div', { style: { padding: 8, minWidth: 220 } },
			React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '项目'),
						React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '金额')
					)
				),
				React.createElement('tbody', null,
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计实收车辆月租金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.actualRent + ' 元')),
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计应收车辆保证金'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.receivableDeposit + ' 元')),
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计实收服务费'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.actualService + ' 元')),
					React.createElement('tr', null, React.createElement('td', { style: { padding: '6px 8px' } }, '总计减免金额'), React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, totals.discountTotal + ' 元'))
				)
			)
		);
	}, [totals]);

	var invoiceInfo = useMemo(function () {
		return {
			customerName: '嘉兴某某物流有限公司',
			taxId: '91330400MA2XXXXX1',
			address: '浙江省嘉兴市南湖区科技大道1号',
			phone: '0571-88888888',
			account: '6222021234567890123',
			bank: '中国工商银行嘉兴分行',
			mailingAddress: '浙江省嘉兴市南湖区科技大道1号'
		};
	}, []);

	var approvalSteps = useMemo(function () {
		return [
			{ title: '业务部门', status: 'finish', person: '张经理', time: '2026-03-01 10:00' },
			{ title: '财务部门', status: 'finish', person: '李四', time: '2026-03-03 09:00' },
			{ title: '财务负责人', status: 'finish', person: '王五', time: '2026-03-03 11:00' }
		];
	}, []);

	var unpaidAmount = useMemo(function () {
		var sumArrival = invoiceList.reduce(function (s, r) { return s + (parseFloat(r.arrivalAmount) || 0); }, 0);
		return (Math.max(0, parseFloat(actualTotal) - sumArrival)).toFixed(2);
	}, [invoiceList, actualTotal]);

	function updateInvoiceRow(id, field, value) {
		setInvoiceList(function (prev) {
			return prev.map(function (r) {
				if (r.id !== id) return r;
				var next = Object.assign({}, r);
				next[field] = value;
				if (field === 'invoiceFiles') next.invoiceFiles = value || [];
				return next;
			});
		});
	}

	function addInvoiceRow() {
		nextIdRef.current += 1;
		setInvoiceList(function (prev) {
			return prev.concat([{ id: 'new' + nextIdRef.current, arrivalTime: '', arrivalAmount: '', invoiceTime: nowStr(), invoiceFiles: [], remark: '', invoicePerson: '-', submitted: false }]);
		});
	}

	function removeInvoiceRow(id) {
		var row = invoiceList.find(function (r) { return r.id === id; });
		if (row && row.submitted) return;
		setInvoiceList(function (prev) { return prev.filter(function (r) { return r.id !== id; }); });
	}

	var handleSubmit = useCallback(function () {
		submitConfirmVisible[1](true);
	}, []);

	var handleSubmitConfirm = useCallback(function () {
		message.success('提交成功');
		submitConfirmVisible[1](false);
		if (window.__receivableBack) window.__receivableBack(); else message.info('跳转至提车应收款列表页（原型）');
	}, []);

	var handleCancel = useCallback(function () {
		cancelConfirmVisible[1](true);
	}, []);

	var handleCancelConfirm = useCallback(function () {
		cancelConfirmVisible[1](false);
		if (window.__receivableBack) window.__receivableBack(); else message.info('返回提车应收款列表页（原型）');
	}, []);

	var requirementContent = '提车应收款-开票信息（2026年3月5日版本）\n一个「数字化资产ONEOS运管平台」中的「财务管理」「提车应收款」「开票信息」模块\n#面包屑：财务管理-提车应收款-开票信息；\n\n页面分为3个卡片，业务流程请参考流程图；\n1.项目信息：\n#显示项目详细信息，包括：\n1.1.合同编码：显示该租赁合同对应合同编码；\n1.2.合同类型：显示该租赁合同对应合同编码；\n1.3.项目名称：显示该租赁合同对应项目名称；\n1.4.客户名称：显示该租赁合同对应客户名称；\n1.5.付款方式：显示该租赁合同对应付款方式，分为：预付、后付两种，根据实际合同反写；\n1.6.付款周期：显示该租赁合同对应付款周期，格式为：x个月；\n1.7.合同生效时间：显示该租赁合同对应合同生效时间；\n1.8.合同结束时间：显示该租赁合同对应合同结束时间；\n1.9.业务部门：显示该租赁合同对应业务部门名称；\n1.10.业务负责人：显示该租赁合同对应业务负责人；\n\n2.提车应收款信息：\n#上方显示应收款总额、实收款总额；\n2.1.应收款总额：显示提交审核时的应收款总额，格式为：xx.xx元，点击金额弹出气泡卡片，卡片中显示列表，字段为：\n    2.1.1.项目：包括总计应收车辆月租金、总计应收车辆保证金、总计应收服务费三项；\n    2.1.2.金额：显示该项目对应应收金额；\n2.2.实收款总额：显示提交审核时的实收款总额，格式为：xx.xx元，点击金额弹出气泡卡片，卡片中显示列表，字段为：\n    2.2.1.项目：包括总计实收车辆月租金、总计应收车辆保证金、总计实收服务费、总计减免金额四项；\n    2.2.2.金额：显示该项目对应实收金额；\n#中间为车辆应收款明细，以列表展示提车应收款已选中所有车辆明细，包括以下字段：\n2.1.序号：根据租赁合同中车辆对应序号顺序展示；\n2.2.品牌：显示租赁合同中车辆对应品牌；\n2.3.型号：显示租赁合同中车辆对应型号；\n2.4.车牌号：显示租赁合同中车辆对应车牌号，如果车牌号为空则显示为-（后续如果交车成功，则车牌号会反显在该处）；\n2.5.应收车辆月租金：根据租赁合同付款周期自动计算，例如：付款周期为6个月，则这里显示金额为：车辆月租金*6；\n2.6.实收车辆月租金：显示提交审核时的实收车辆月租金，格式为：xx.xx元；\n2.7.车辆租金备注：显示提交审核时的车辆租金备注，超长则显示...，悬浮时显示全部详细内容；\n2.8.减免金额：显示提交审核时的减免金额，格式为：xx.xx元；\n2.9.减免金额备注：显示提交审核时的减免金额备注，超长则显示...，悬浮时显示全部详细内容；\n2.10.减免证明：显示所有附件，可点击预览；\n2.11.应收车辆保证金：显示租赁合同中当前车辆保证金金额，格式为：xx.xx元；\n2.12.服务费项目：点击管理，弹出气泡卡片，气泡卡片标题为服务费项目，下方为列表，显示服务项目、应收费用、实收费用、备注；\n     2.12.1.服务项目：显示租赁合同中所有服务项目名称；\n     2.12.2.应收费用：显示租赁合同中所有服务项目对应费用；\n     2.12.3.实收费用：显示提交审核时的实收费用金额，格式为：xx.xx元；\n     2.12.4.减免费用：显示提交审核时的减免费用金额，格式为：xx.xx元；\n     2.12.4.备注：显示提交审核时的服务费减免备注，超长则显示...，悬浮时显示全部详细内容；\n2.13.应收服务费：显示当前车辆所有服务费应收费用总和，格式为：xx.xx元；\n2.14.实收服务费：显示当前车辆所有服务费实收费用总和，格式为：xx.xx元；\n2.15.列表下方对应字段下方显示总计数据，包括：总计应收车辆月租金、总计实收车辆月租金、总计应收车辆保证金、总计应收服务费、总计实收服务费、总计减免金额；\n列表不支持分页功能；\n#下方为氢费预付款情况，以列表展示租赁合同中所有氢费预付款明细，包括以下字段，如租赁合同氢费非预付款模式，则不显示该部分内容：\n2.19.氢费预付款应收金额：显示租赁合同中氢费预付款金额，格式为：xx.xx元，支持2位小数；\n2.20.氢费预付款实收金额：显示提交审核时的氢费预付款实收金额，格式为：xx.xx元；\n2.21.减免金额：显示提交审核时的减免金额，格式为：xx.xx元；\n2.22.减免金额备注：显示提交审核时的氢费预付款减免备注，超长则显示...，悬浮时显示全部详细内容；\n#最底部为开票方式、开票备注；\n2.23.开票方式：显示提交审核时的开票方式；\n2.24.开票备注：显示提交审核时的开票备注；\n\n3.开票信息：\n#上方显示该租赁合同客户信息（如果该合同转为三方合同，则未开票部分开票信息修改为丙方开票信息），包括：\n3.1.客户名称：显示租赁合同客户名称；\n3.2.纳税人识别号：显示该客户对应纳税人识别号；\n3.3.地址：显示该客户对应地址；\n3.4.电话：显示该客户对应电话；\n3.5.账户：显示该客户对应账户；\n3.6.开户行：显示该客户对应开户行；\n3.7.邮寄地址：显示该客户对应邮寄地址；\n#下方显示列表，包括以下字段，列表上方显示未付金额，格式为xx.xx元（计算方式为：实收款总额-（所有到账金额记录总和）），列表显示过往提交的历史记录，同时默认一行可编辑，支持继续新增一行和删除行操作（过往提交的历史记录无法删除）：\n3.8.到账时间：时间选择器，格式为：YYYY-MM-DD HH:MM，新增未提交的记录支持删除，但之前已完成提交的记录无法删除；\n3.9.到账金额：输入框，支持2位小数，格式为：xx.xx元，新增未提交的记录支持删除，但之前已完成提交的记录无法删除；；\n3.10.开票时间：时间选择器，格式为：YYYY-MM-DD HH:MM，默认为打开页面的时间，新增未提交的记录支持删除，但之前已完成提交的记录无法删除；\n3.11.发票附件：附件上传按钮，支持多附件上传，上传后显示附件名称，新增未提交的记录支持删除，但之前已完成提交的记录无法删除；\n3.12.备注：输入框，新增未提交的记录支持删除，但之前已完成提交的记录无法删除；；\n3.13.开票人：显示上传发票的操作用户姓名；\n3.14.支持新增一行、删除一行（新增未提交的记录可以删除，已完成提交的历史记录不能删除）；\n\n4.审批情况：\n#上方为纵向步骤条，显示所有审批步骤\n4.1.步骤中显示部门名称，部门名称后方显示审批状态、审批人、审批时间，所有审批记录已完成；\n\n5.底部为提交，取消；\n5.1.提交：点击提交，进行二次确认，文案为：请仔细核对提车首付款到账和开票信息，提交后无法修改；\n5.2.取消：点击取消，进行二次确认，文案为：取消将会丢失所有已填写数据，是否确认，点击确认则跳转至提车应收款列表页；';

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var labelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var requiredStar = { color: '#ff4d4f', marginRight: 2 };
	var formRowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', marginBottom: 16 };
	var formItemStyle = { marginBottom: 12 };
	var highlightStyle = { color: '#1890ff', fontWeight: 600, cursor: 'pointer' };
	var valueStyle = { color: 'rgba(0,0,0,0.85)', fontSize: 14, lineHeight: '22px', minHeight: 22 };
	var thBase = { padding: '10px 12px', border: '1px solid #f0f0f0', whiteSpace: 'nowrap' };

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '财务管理' },
					{ title: '提车应收款' },
					{ title: '开票信息' }
				]
			}),
			React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { requirementModalVisible[1](true); } }, '查看需求说明')
		),
		React.createElement(Card, {
			title: '项目信息',
			style: cardStyle,
			extra: React.createElement(Button, { type: 'link', size: 'small', onClick: function () { projectCardExpanded[1](!projectCardExpanded[0]); } }, projectCardExpanded[0] ? '收起' : '展开')
		},
			projectCardExpanded[0] ? React.createElement('div', { style: formRowStyle },
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '合同编码'), React.createElement('div', { style: valueStyle }, projectInfo.contractCode || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '合同类型'), React.createElement('div', { style: valueStyle }, projectInfo.contractType || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '项目名称'), React.createElement('div', { style: valueStyle }, projectInfo.projectName || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '客户名称'), React.createElement('div', { style: valueStyle }, projectInfo.customerName || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '付款方式'), React.createElement('div', { style: valueStyle }, projectInfo.paymentMethod || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '付款周期'), React.createElement('div', { style: valueStyle }, projectInfo.paymentCycle || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '合同生效时间'), React.createElement('div', { style: valueStyle }, projectInfo.contractStart || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '合同结束时间'), React.createElement('div', { style: valueStyle }, projectInfo.contractEnd || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '业务部门'), React.createElement('div', { style: valueStyle }, projectInfo.businessDept || '-')),
				React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '业务负责人'), React.createElement('div', { style: valueStyle }, projectInfo.businessPerson || '-'))
			) : null
		),
		React.createElement(Card, {
			title: '提车应收款信息',
			style: cardStyle,
			extra: React.createElement(Button, { type: 'link', size: 'small', onClick: function () { receivableCardExpanded[1](!receivableCardExpanded[0]); } }, receivableCardExpanded[0] ? '收起' : '展开')
		},
			receivableCardExpanded[0] ? React.createElement(React.Fragment, null,
				React.createElement('div', { style: { marginBottom: 16, display: 'flex', gap: 24, alignItems: 'center' } },
					React.createElement(Popover, { content: receivablePopoverContent, title: '应收款明细', trigger: 'click' },
						React.createElement('span', { style: { cursor: 'pointer' } }, '应收款总额：', React.createElement('span', { style: highlightStyle }, receivableTotal, ' 元'))
					),
					React.createElement(Popover, { content: actualPopoverContent, title: '实收款明细', trigger: 'click' },
						React.createElement('span', { style: { cursor: 'pointer' } }, '实收款总额：', React.createElement('span', { style: highlightStyle }, actualTotal, ' 元'))
					)
				),
				React.createElement('div', { style: { overflowX: 'auto', marginBottom: 16, overflowY: 'visible' } },
					React.createElement('table', { style: { width: '100%', minWidth: 1600, borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' } },
						React.createElement('thead', null,
							React.createElement('tr', { style: { backgroundColor: '#fafafa' } },
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
							selectedVehicles.map(function (row) {
								var disabled = row.receivableCompleted;
								var servicePopover = React.createElement('div', { style: { padding: 8, minWidth: 360 } },
									React.createElement('div', { style: { fontWeight: 600, marginBottom: 8 } }, '服务费项目'),
									React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12 } },
										React.createElement('thead', null,
											React.createElement('tr', null,
												React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '服务项目'),
												React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '应收费用'),
												React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '实收费用'),
												React.createElement('th', { style: { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '减免费用'),
												React.createElement('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, '备注')
											)
										),
										React.createElement('tbody', null,
											(row.serviceItems || []).map(function (s, si) {
												return React.createElement('tr', { key: si },
													React.createElement('td', { style: { padding: '6px 8px' } }, s.name),
													React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, (s.receivable != null ? s.receivable : '') + ' 元'),
													React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, (s.actual || '') + ' 元'),
													React.createElement('td', { style: { textAlign: 'right', padding: '6px 8px' } }, (s.discount || '0.00') + ' 元'),
													React.createElement('td', { style: { padding: '6px 8px' } }, s.remark || '-')
												);
											})
										)
									)
								);
								return React.createElement('tr', { key: row.key },
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.index),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.brand),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.model),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, row.plateNo || '-'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.receivableRent || 0) + ' 元'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', width: 130, textAlign: 'right' } }, (row.actualRent || '0.00') + ' 元'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', width: 130 } }, row.rentRemark || '-'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', width: 130, textAlign: 'right' } }, (row.discountAmount || '0.00') + ' 元'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', width: 130 } }, row.discountRemark || '-'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', width: 130 } },
										(row.discountProof && row.discountProof.length)
											? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12 } },
												row.discountProof.map(function (p, pidx) {
													return React.createElement(Button, { key: pidx, type: 'link', size: 'small', style: { padding: 0, height: 'auto', fontSize: 12, textAlign: 'left' }, onClick: function () { proofPreviewFile[1](p); proofPreviewVisible[1](true); } }, p.name || '附件');
												})
											)
											: '-'
									),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.receivableDeposit || 0) + ' 元'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } },
										React.createElement(Popover, { content: servicePopover, title: null, trigger: 'click' },
											React.createElement(Button, { type: 'link', size: 'small' }, '管理')
										)
									),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, (row.receivableService || 0) + ' 元'),
									React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0', textAlign: 'right', width: 130 } }, (row.actualService || '0.00') + ' 元')
								);
							})
						),
						React.createElement('tfoot', null,
							React.createElement('tr', { style: { backgroundColor: '#fafafa', fontWeight: 500 } },
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0', fontWeight: 600 } }, '总计'),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0' } }),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0' } }),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0' } }),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, totals.receivableRent + ' 元'),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, totals.actualRent + ' 元'),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0' } }),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, totals.discountTotal + ' 元'),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0' } }),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0' } }),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, totals.receivableDeposit + ' 元'),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0' } }),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, totals.receivableService + ' 元'),
								React.createElement('td', { style: { padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'right' } }, totals.actualService + ' 元')
							)
						)
					)
				),
				hasHydrogenPrepay ? React.createElement('div', { style: { marginBottom: 16 } },
					React.createElement('div', { style: { fontSize: 14, fontWeight: 500, marginBottom: 8 } }, '氢费预付款情况'),
					React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, maxWidth: 800 } },
						React.createElement('div', { style: formItemStyle },
							React.createElement('div', { style: labelStyle }, '氢费预付款应收金额'),
							React.createElement('div', { style: valueStyle }, hydrogen.receivable + ' 元')
						),
						React.createElement('div', { style: formItemStyle },
							React.createElement('div', { style: labelStyle }, '氢费预付款实收金额'),
							React.createElement('div', { style: valueStyle }, hydrogen.actual + ' 元')
						),
						React.createElement('div', { style: formItemStyle },
							React.createElement('div', { style: labelStyle }, '减免金额'),
							React.createElement('div', { style: valueStyle }, hydrogen.discount + ' 元')
						),
						React.createElement('div', { style: formItemStyle },
							React.createElement('div', { style: labelStyle }, '减免金额备注'),
							React.createElement('div', { style: valueStyle }, hydrogen.discountRemark || '-')
						)
					)
				) : null,
				React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginTop: 16 } },
					React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '开票方式'), React.createElement('div', { style: valueStyle }, invoiceMethod)),
					React.createElement('div', { style: Object.assign({}, formItemStyle, { gridColumn: '1 / -1' }) }, React.createElement('div', { style: labelStyle }, '开票备注'), React.createElement('div', { style: valueStyle }, invoiceRemark || '-'))
				)
			) : null
		),
		React.createElement(Card, {
			title: '开票信息',
			style: cardStyle,
			extra: React.createElement(Button, { type: 'link', size: 'small', onClick: function () { invoiceCardExpanded[1](!invoiceCardExpanded[0]); } }, invoiceCardExpanded[0] ? '收起' : '展开')
		},
			invoiceCardExpanded[0] ? React.createElement(React.Fragment, null,
				React.createElement('div', { style: { fontSize: 14, fontWeight: 500, marginBottom: 12 } }, '客户信息'),
				React.createElement('div', { style: formRowStyle },
					React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '客户名称'), React.createElement('div', { style: valueStyle }, invoiceInfo.customerName || '-')),
					React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '纳税人识别号'), React.createElement('div', { style: valueStyle }, invoiceInfo.taxId || '-')),
					React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '地址'), React.createElement('div', { style: valueStyle }, invoiceInfo.address || '-')),
					React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '电话'), React.createElement('div', { style: valueStyle }, invoiceInfo.phone || '-')),
					React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '账户'), React.createElement('div', { style: valueStyle }, invoiceInfo.account || '-')),
					React.createElement('div', { style: formItemStyle }, React.createElement('div', { style: labelStyle }, '开户行'), React.createElement('div', { style: valueStyle }, invoiceInfo.bank || '-')),
					React.createElement('div', { style: Object.assign({}, formItemStyle, { gridColumn: '1 / -1' }) }, React.createElement('div', { style: labelStyle }, '邮寄地址'), React.createElement('div', { style: valueStyle }, invoiceInfo.mailingAddress || '-'))
				),
				React.createElement('div', { style: { fontSize: 14, fontWeight: 500, marginBottom: 4, marginTop: 16 } }, '到账与开票记录'),
				React.createElement('div', { style: { marginBottom: 8, fontSize: 14 } }, '未付金额：', React.createElement('span', { style: highlightStyle }, unpaidAmount, ' 元')),
				React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
					React.createElement('thead', null,
						React.createElement('tr', { style: { backgroundColor: '#fafafa' } },
							React.createElement('th', { style: Object.assign({}, thBase, { width: 160 }) }, '到账时间'),
							React.createElement('th', { style: Object.assign({}, thBase, { width: 120 }) }, '到账金额'),
							React.createElement('th', { style: Object.assign({}, thBase, { width: 160 }) }, '开票时间'),
							React.createElement('th', { style: Object.assign({}, thBase) }, '发票附件'),
							React.createElement('th', { style: Object.assign({}, thBase) }, '备注'),
							React.createElement('th', { style: Object.assign({}, thBase, { width: 80 }) }, '开票人'),
							React.createElement('th', { style: Object.assign({}, thBase, { width: 70 }) }, '操作')
						)
					),
					React.createElement('tbody', null,
						invoiceList.map(function (r) {
							var dateValArrival = r.arrivalTime && dayjs ? dayjs(r.arrivalTime, 'YYYY-MM-DD HH:mm') : null;
							var dateValInvoice = r.invoiceTime && dayjs ? dayjs(r.invoiceTime, 'YYYY-MM-DD HH:mm') : null;
							if (dateValInvoice && dateValInvoice.isValid && !dateValInvoice.isValid()) dateValInvoice = null;
							if (dateValArrival && dateValArrival.isValid && !dateValArrival.isValid()) dateValArrival = null;
							return React.createElement('tr', { key: r.id },
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } },
									r.submitted ? (r.arrivalTime || '-') : React.createElement(DatePicker, {
										showTime: true,
										style: { width: '100%' },
										format: 'YYYY-MM-DD HH:mm',
										placeholder: '请选择到账时间',
										value: dateValArrival,
										onChange: function (d, dateStr) { updateInvoiceRow(r.id, 'arrivalTime', dateStr || ''); }
									})
								),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } },
									r.submitted ? (r.arrivalAmount ? r.arrivalAmount + ' 元' : '-') : React.createElement(Input, { size: 'small', value: r.arrivalAmount, suffix: '元', placeholder: '0.00', onChange: function (e) { updateInvoiceRow(r.id, 'arrivalAmount', e.target.value); } })
								),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } },
									r.submitted ? (r.invoiceTime || '-') : React.createElement(DatePicker, {
										showTime: true,
										style: { width: '100%' },
										format: 'YYYY-MM-DD HH:mm',
										placeholder: '请选择开票时间',
										value: dateValInvoice,
										onChange: function (d, dateStr) { updateInvoiceRow(r.id, 'invoiceTime', dateStr || ''); }
									})
								),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } },
									r.submitted
										? ((r.invoiceFiles && r.invoiceFiles.length) ? r.invoiceFiles.map(function (f, i) { return React.createElement(Button, { key: i, type: 'link', size: 'small', style: { padding: 0, height: 'auto', fontSize: 12, marginRight: 4 }, onClick: function () { invoicePreviewFile[1](f); invoicePreviewVisible[1](true); } }, f.name || '附件'); }) : '-')
										: React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
											(r.invoiceFiles || []).map(function (f, i) {
												return React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 } },
													React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left', height: 'auto' }, onClick: function () { invoicePreviewFile[1](f); invoicePreviewVisible[1](true); } }, f.name || '附件'),
													React.createElement(Button, { type: 'link', size: 'small', danger: true, style: { padding: 0 }, onClick: function () { var next = (r.invoiceFiles || []).slice(); next.splice(i, 1); updateInvoiceRow(r.id, 'invoiceFiles', next); } }, '删除')
												);
											}),
											React.createElement('span', null,
												React.createElement('input', { type: 'file', multiple: true, accept: '.jpg,.jpeg,.png,.pdf', style: { display: 'none' }, id: 'inv-file-' + r.id, onChange: function (e) {
													var files = e.target.files;
													if (!files || !files.length) return;
													var next = (r.invoiceFiles || []).slice();
													for (var i = 0; i < files.length; i++) next.push({ name: files[i].name });
													updateInvoiceRow(r.id, 'invoiceFiles', next);
													e.target.value = '';
												} }),
												React.createElement(Button, { type: 'default', size: 'small', onClick: function () { var el = document.getElementById('inv-file-' + r.id); if (el) el.click(); } }, '附件上传')
											)
										)
								),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } },
									r.submitted ? (r.remark || '-') : React.createElement(Input, { size: 'small', value: r.remark, placeholder: '选填', onChange: function (e) { updateInvoiceRow(r.id, 'remark', e.target.value); } })
								),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } }, r.invoicePerson || '-'),
								React.createElement('td', { style: { padding: '8px 12px', border: '1px solid #f0f0f0' } },
									r.submitted ? '-' : React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function () { removeInvoiceRow(r.id); } }, '删除')
								)
							);
						})
					)
				),
				React.createElement('div', { style: { marginTop: 8 } }, React.createElement(Button, { type: 'dashed', size: 'small', onClick: addInvoiceRow }, '新增一行'))
			) : null
		),
		React.createElement(Card, {
			title: '审批情况',
			style: cardStyle,
			extra: React.createElement(Button, { type: 'link', size: 'small', onClick: function () { approveCardExpanded[1](!approveCardExpanded[0]); } }, approveCardExpanded[0] ? '收起' : '展开')
		},
			approveCardExpanded[0] ? React.createElement(Steps, {
				direction: 'vertical',
				current: approvalSteps.length,
				items: approvalSteps.map(function (s) {
					var statusText = '审批通过';
					var desc = React.createElement('div', { style: { fontSize: 13, color: 'rgba(0,0,0,0.65)', marginTop: 4 } },
						React.createElement('div', null, '审批状态：', statusText),
						React.createElement('div', null, '审批人：', s.person || '-'),
						s.time ? React.createElement('div', null, '审批时间：', s.time) : null
					);
					return { title: s.title, description: desc, status: 'finish' };
				})
			}) : null
		),
		React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 24 } },
			React.createElement(Button, { type: 'primary', onClick: handleSubmit }, '提交'),
			React.createElement(Button, { onClick: handleCancel }, '取消')
		),
		React.createElement(Modal, {
			title: '确认提交',
			open: submitConfirmVisible[0],
			onCancel: function () { submitConfirmVisible[1](false); },
			onOk: handleSubmitConfirm,
			okText: '确认',
			cancelText: '取消'
		}, React.createElement('div', null, '请仔细核对提车首付款到账和开票信息，提交后无法修改。')),
		React.createElement(Modal, {
			title: '确认取消',
			open: cancelConfirmVisible[0],
			onCancel: function () { cancelConfirmVisible[1](false); },
			onOk: handleCancelConfirm,
			okText: '确认',
			cancelText: '取消'
		}, React.createElement('div', null, '取消将会丢失所有已填写数据，是否确认？')),
		React.createElement(Modal, {
			title: '附件预览',
			open: proofPreviewVisible[0],
			onCancel: function () { proofPreviewVisible[1](false); proofPreviewFile[1](null); },
			footer: React.createElement(Button, { onClick: function () { proofPreviewVisible[1](false); proofPreviewFile[1](null); } }, '关闭'),
			width: 640
		}, React.createElement('div', { style: { padding: '16px 0' } },
			React.createElement('div', { style: { marginBottom: 12, fontSize: 14, color: 'rgba(0,0,0,0.65)' } }, '文件：', proofPreviewFile[0] ? (proofPreviewFile[0].name || '附件') : ''),
			React.createElement('div', { style: { minHeight: 360, background: '#fafafa', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.45)', fontSize: 14 } }, '此处可预览附件内容，支持 jpg、png、pdf 等格式')
		)),
		React.createElement(Modal, {
			title: '发票附件预览',
			open: invoicePreviewVisible[0],
			onCancel: function () { invoicePreviewVisible[1](false); invoicePreviewFile[1](null); },
			footer: React.createElement(Button, { onClick: function () { invoicePreviewVisible[1](false); invoicePreviewFile[1](null); } }, '关闭'),
			width: 640
		}, React.createElement('div', { style: { padding: '16px 0' } },
			React.createElement('div', { style: { marginBottom: 12, fontSize: 14, color: 'rgba(0,0,0,0.65)' } }, '文件：', invoicePreviewFile[0] ? (invoicePreviewFile[0].name || '附件') : ''),
			React.createElement('div', { style: { minHeight: 360, background: '#fafafa', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.45)', fontSize: 14 } }, '此处可预览附件内容，支持 jpg、png、pdf 等格式')
		)),
		React.createElement(Modal, {
			title: '需求说明',
			open: requirementModalVisible[0],
			onCancel: function () { requirementModalVisible[1](false); },
			width: 720,
			footer: React.createElement(Button, { onClick: function () { requirementModalVisible[1](false); } }, '关闭'),
			bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
		}, React.createElement('div', { style: { padding: '8px 0', whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6 } }, requirementContent))
	);
};
