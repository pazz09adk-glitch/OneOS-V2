// 【重要】必须使用 const Component 作为组件变量名
// 财务管理 - 提车应收款（2026年3月5日版本）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Table = antd.Table;
	var Button = antd.Button;
	var Select = antd.Select;
	var Input = antd.Input;
	var Space = antd.Space;
	var Popover = antd.Popover;
	var Tag = antd.Tag;
	var Modal = antd.Modal;
	var message = antd.message;

	// 筛选条件
	var filterContractCode = useState(undefined);
	var filterProjectName = useState(undefined);
	var filterCustomerName = useState(undefined);
	var filterBusinessDept = useState(undefined);
	var filterBusinessPerson = useState(undefined);
	// 主表展开行：只允许同时展开一行，展开新的则收起其他
	var expandedRowKeysState = useState([]);
	var expandedRowKeys = expandedRowKeysState[0];
	var setExpandedRowKeys = expandedRowKeysState[1];
	var deleteConfirmVisible = useState(false);
	var deleteConfirmRecord = useState(null);
	var deleteConfirmParentRecord = useState(null);
	var requirementModalVisible = useState(false);
	var filterExpanded = useState(false);

	// 主表数据：按合同编码聚合，每条主表下有多条提车应收款明细（子表）
	var mainListData = [
			{
				contractCode: 'HT-ZL-2025-001',
				contractType: '正式合同',
				projectName: '嘉兴氢能示范项目',
				customerName: '嘉兴某某物流有限公司',
				businessDept: '业务1部',
				businessPerson: '张经理',
				contractEffectiveDate: '2025-01-15',
				allVehiclesReceivableCompleted: false,
				totalReceivable: 256800.00,
				totalActual: 255700.00,
				totalDiscount: 1100.00,
				totalFinanceReceived: 209900.00,
				children: [
					{ seq: 1, auditStatus: '审批通过', creator: '张三', chargeTime: '2026-02-20 10:00', deliveryCount: 3, deliveryVehicles: [{ brand: '东风', model: 'DFH1180', plateNo: '浙A12345' }, { brand: '福田', model: 'BJ1180', plateNo: '浙A23456' }, { brand: '重汽', model: 'ZZ1187', plateNo: '浙A34567' }], receivableTotal: 98700.00, actualTotal: 98200.00, discountTotal: 500.00, discountProof: '首月优惠审批单', arrivalAmount: 98200.00, arrivalTime: '2026-02-21 14:30', financeReceived: 98200.00, isInvoiced: '已开票', invoiceMethod: '先开票后付款', invoiceTime: '2026-02-22 11:00', invoicedAmount: 98200.00, invoiceAttachment: '发票-HT-ZL-2025-001-001.pdf' },
					{ seq: 2, auditStatus: '待审批', creator: '李四', chargeTime: '2026-03-01 09:30', deliveryCount: 2, deliveryVehicles: [{ brand: '陕汽', model: 'SX1313', plateNo: '浙A45678' }, { brand: '解放', model: 'J6P', plateNo: '浙A56789' }], receivableTotal: 57300.00, actualTotal: 57300.00, discountTotal: 0.00, discountProof: '-', arrivalAmount: 57300.00, arrivalTime: '2026-03-02 10:00', financeReceived: 57300.00, isInvoiced: '部分开票', invoiceMethod: '先付款后开票', invoiceTime: '-', invoicedAmount: '0.00', invoiceAttachment: '-' },
					{ seq: 3, auditStatus: '审批中', creator: '王五', chargeTime: '2026-03-10 11:00', deliveryCount: 1, deliveryVehicles: [{ brand: '江淮', model: '格尔发K5', plateNo: '浙A67890' }], receivableTotal: 32800.00, actualTotal: 32800.00, discountTotal: 0.00, discountProof: '-', arrivalAmount: 32800.00, arrivalTime: '2026-03-11 09:00', financeReceived: 32800.00, isInvoiced: '未开票', invoiceMethod: '先付款后开票', invoiceTime: '-', invoicedAmount: '0.00', invoiceAttachment: '-' },
					{ seq: 4, auditStatus: '已驳回', creator: '赵六', chargeTime: '2026-03-15 14:20', deliveryCount: 2, deliveryVehicles: [{ brand: '东风', model: 'DFH1250', plateNo: '浙A11111' }, { brand: '福田', model: '欧曼EST', plateNo: '浙A22222' }], receivableTotal: 45800.00, actualTotal: 45800.00, discountTotal: 0.00, discountProof: '-', arrivalAmount: 0.00, arrivalTime: '-', financeReceived: 0.00, isInvoiced: '未开票', invoiceMethod: '先付款后开票', invoiceTime: '-', invoicedAmount: '0.00', invoiceAttachment: '-' },
					{ seq: 5, auditStatus: '审批通过', creator: '张三', chargeTime: '2026-03-20 09:00', deliveryCount: 2, deliveryVehicles: [{ brand: '重汽', model: '豪沃T7H', plateNo: '浙B33333' }, { brand: '陕汽', model: '德龙X3000', plateNo: '浙B44444' }], receivableTotal: 22200.00, actualTotal: 21600.00, discountTotal: 600.00, discountProof: '客户协商减免', arrivalAmount: 21600.00, arrivalTime: '2026-03-21 10:30', financeReceived: 21600.00, isInvoiced: '已开票', invoiceMethod: '先开票后付款', invoiceTime: '2026-03-22 14:00', invoicedAmount: 21600.00, invoiceAttachment: '发票-HT-ZL-2025-001-005.pdf' }
				]
			},
			{
				contractCode: 'HT-ZL-2025-002',
				contractType: '正式合同',
				projectName: '上海物流租赁项目',
				customerName: '上海某某运输公司',
				businessDept: '业务2部',
				businessPerson: '李专员',
				contractEffectiveDate: '2025-02-01',
				allVehiclesReceivableCompleted: true,
				totalReceivable: 132600.00,
				totalActual: 132600.00,
				totalDiscount: 0.00,
				totalFinanceReceived: 132600.00,
				children: [
					{ seq: 1, auditStatus: '审批通过', creator: '李专员', chargeTime: '2026-02-28 14:00', deliveryCount: 2, deliveryVehicles: [{ brand: '江淮', model: '格尔发K5', plateNo: '沪B11111' }, { brand: '东风', model: 'DFH1250', plateNo: '沪B22222' }], receivableTotal: 65800.00, actualTotal: 65800.00, discountTotal: 0.00, discountProof: '-', arrivalAmount: 65800.00, arrivalTime: '2026-03-01 09:00', financeReceived: 65800.00, isInvoiced: '已开票', invoiceMethod: '先开票后付款', invoiceTime: '2026-03-02 15:20', invoicedAmount: 65800.00, invoiceAttachment: '发票-HT-ZL-2025-002.pdf' },
					{ seq: 2, auditStatus: '审批通过', creator: '李专员', chargeTime: '2026-03-08 10:30', deliveryCount: 1, deliveryVehicles: [{ brand: '解放', model: 'JH6', plateNo: '沪B33333' }], receivableTotal: 33400.00, actualTotal: 33400.00, discountTotal: 0.00, discountProof: '-', arrivalAmount: 33400.00, arrivalTime: '2026-03-09 11:00', financeReceived: 33400.00, isInvoiced: '部分开票', invoiceMethod: '先付款后开票', invoiceTime: '-', invoicedAmount: '0.00', invoiceAttachment: '-' },
					{ seq: 3, auditStatus: '待审批', creator: '李专员', chargeTime: '2026-03-18 16:00', deliveryCount: 2, deliveryVehicles: [{ brand: '福田', model: 'BJ1180', plateNo: '沪B44444' }, { brand: '重汽', model: 'ZZ1187', plateNo: '沪B55555' }], receivableTotal: 33400.00, actualTotal: 33400.00, discountTotal: 0.00, discountProof: '-', arrivalAmount: 33400.00, arrivalTime: '2026-03-19 09:00', financeReceived: 33400.00, isInvoiced: '未开票', invoiceMethod: '先开票后付款', invoiceTime: '-', invoicedAmount: '0.00', invoiceAttachment: '-' }
				]
			},
			{
				contractCode: 'HT-ZL-2025-003',
				contractType: '正式合同',
				projectName: '杭州城配租赁项目',
				customerName: '杭州某某租赁有限公司',
				businessDept: '业务3部',
				businessPerson: '王专员',
				contractEffectiveDate: '2025-02-10',
				allVehiclesReceivableCompleted: false,
				totalReceivable: 82400.00,
				totalActual: 82400.00,
				totalDiscount: 0.00,
				totalFinanceReceived: 41200.00,
				children: [
					{ seq: 1, auditStatus: '已驳回', creator: '王专员', chargeTime: '2026-03-05 11:00', deliveryCount: 1, deliveryVehicles: [{ brand: '福田', model: '欧曼EST', plateNo: '浙C33333' }], receivableTotal: 41200.00, actualTotal: 41200.00, discountTotal: 0.00, discountProof: '-', arrivalAmount: 0.00, arrivalTime: '-', financeReceived: 0.00, isInvoiced: '未开票', invoiceMethod: '先付款后开票', invoiceTime: '-', invoicedAmount: '0.00', invoiceAttachment: '-' },
					{ seq: 2, auditStatus: '审批通过', creator: '王专员', chargeTime: '2026-03-12 09:15', deliveryCount: 1, deliveryVehicles: [{ brand: '东风', model: 'DFH1180', plateNo: '浙C44444' }], receivableTotal: 41200.00, actualTotal: 41200.00, discountTotal: 0.00, discountProof: '-', arrivalAmount: 41200.00, arrivalTime: '2026-03-13 14:00', financeReceived: 41200.00, isInvoiced: '已开票', invoiceMethod: '先开票后付款', invoiceTime: '2026-03-14 10:00', invoicedAmount: 41200.00, invoiceAttachment: '发票-HT-ZL-2025-003.pdf' }
				]
			}
		];
	var mainListState = useState(mainListData);
	var mainList = mainListState[0];
	var setMainList = mainListState[1];

	var filterOptions = useMemo(function () {
		var list = mainList;
		var codes = [], projects = [], customers = [], depts = [], persons = [];
		list.forEach(function (r) {
			if (r.contractCode && codes.indexOf(r.contractCode) === -1) codes.push(r.contractCode);
			if (r.projectName && projects.indexOf(r.projectName) === -1) projects.push(r.projectName);
			if (r.customerName && customers.indexOf(r.customerName) === -1) customers.push(r.customerName);
			if (r.businessDept && depts.indexOf(r.businessDept) === -1) depts.push(r.businessDept);
			if (r.businessPerson && persons.indexOf(r.businessPerson) === -1) persons.push(r.businessPerson);
		});
		return {
			contractCode: codes.map(function (v) { return { value: v, label: v }; }),
			projectName: projects.map(function (v) { return { value: v, label: v }; }),
			customerName: customers.map(function (v) { return { value: v, label: v }; }),
			businessDept: depts.map(function (v) { return { value: v, label: v }; }),
			businessPerson: persons.map(function (v) { return { value: v, label: v }; })
		};
	}, [mainList]);
	var filteredMainList = useMemo(function () {
		var list = mainList;
		var code = filterContractCode[0];
		var project = filterProjectName[0];
		var customer = filterCustomerName[0];
		var dept = filterBusinessDept[0];
		var person = filterBusinessPerson[0];
		if (code) list = list.filter(function (r) { return r.contractCode === code; });
		if (project) list = list.filter(function (r) { return r.projectName === project; });
		if (customer) list = list.filter(function (r) { return r.customerName === customer; });
		if (dept) list = list.filter(function (r) { return r.businessDept === dept; });
		if (person) list = list.filter(function (r) { return r.businessPerson === person; });
		return list;
	}, [mainList, filterContractCode[0], filterProjectName[0], filterCustomerName[0], filterBusinessDept[0], filterBusinessPerson[0]]);

	// 主表 dataSource 去掉 children，避免 Table 把子节点当树形数据渲染出多余空白行；子表数据通过 _detailList 在展开行内使用
	var mainTableDataSource = useMemo(function () {
		return filteredMainList.map(function (r) {
			var o = {};
			for (var k in r) if (k !== 'children') o[k] = r[k];
			o._detailList = r.children || [];
			return o;
		});
	}, [filteredMainList]);

	function fmtMoney(v) {
		if (v === null || v === undefined) return '0.00元';
		var n = typeof v === 'number' ? v : parseFloat(v);
		return (isNaN(n) ? '0.00' : n.toFixed(2)) + '元';
	}

	function goCollect(record) {
		if (window.__receivableToCollect) window.__receivableToCollect(record);
		else message.info('跳转至提车应收款-收款（原型）');
	}
	function goView(record) {
		message.info('查看提车收款单详情（原型）');
	}
	function goEdit(record) {
		if (window.__receivableToEdit) window.__receivableToEdit(record);
		else message.info('跳转至提车应收款-编辑（原型）');
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };

	// 主表列（宽度压缩在一屏内显示）
	var mainColumns = [
		{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 120, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '合同类型', dataIndex: 'contractType', key: 'contractType', width: 88, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 120, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 120, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '合同生效日期', dataIndex: 'contractEffectiveDate', key: 'contractEffectiveDate', width: 110, render: function (v) { return v || '—'; } },
		{ title: '业务部门', dataIndex: 'businessDept', key: 'businessDept', width: 100, render: function (v) { return v || '—'; } },
		{ title: '业务负责人', dataIndex: 'businessPerson', key: 'businessPerson', width: 100, render: function (v) { return v || '—'; } },
		{
			title: '操作',
			key: 'action',
			width: 100,
			fixed: 'right',
			render: function (_, record) {
				// 该合同所有车辆都已完成提车应收款时，不显示“提车收款单”
				if (record && record.allVehiclesReceivableCompleted) return '—';
				return React.createElement(Button, { type: 'link', size: 'small', onClick: function () { goCollect(record); } }, '提车收款单');
			}
		}
	];

	// 子表：提车数量气泡用 state 控制当前展开的行
	var deliveryPopoverOpen = useState(null);

	function renderDeliveryPopover(record) {
		var vehicles = record.deliveryVehicles || [];
		var listStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
		var thStyle = { padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa', fontWeight: 600 };
		var tdStyle = { padding: '6px 10px', borderBottom: '1px solid #f0f0f0' };
		var content = vehicles.length === 0 ? React.createElement('div', { style: { padding: 8 } }, '—') : React.createElement('div', { style: { padding: 0, minWidth: 200 } },
			React.createElement('table', { style: listStyle },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: thStyle }, '品牌'),
						React.createElement('th', { style: thStyle }, '型号'),
						React.createElement('th', { style: thStyle }, '车牌号')
					)
				),
				React.createElement('tbody', null,
					vehicles.map(function (v, i) {
						return React.createElement('tr', { key: i },
							React.createElement('td', { style: tdStyle }, v.brand || '—'),
							React.createElement('td', { style: tdStyle }, v.model || '—'),
							React.createElement('td', { style: tdStyle }, v.plateNo || '—')
						);
					})
				)
			)
		);
		var popoverKey = (record._parentCode || '') + '-' + record.seq + '-' + (record.chargeTime || '');
		return React.createElement(Popover, {
			content: content,
			title: '车辆详情',
			trigger: 'click',
			open: deliveryPopoverOpen[0] === popoverKey,
			onOpenChange: function (open) { deliveryPopoverOpen[1](open ? popoverKey : null); }
		}, React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 } }, String(record.deliveryCount)));
	}

	// 子表左缩进与主表展开列宽一致，使序号左侧边框与合同编码左侧边框对齐
	var expandColumnWidth = 48;
	function buildCollectCode(contractCode, seq) {
		var suffix = 'TC' + ('0000' + String(seq != null ? seq : '')).slice(-4);
		return String(contractCode || '') + suffix;
	}
	var subColumns = [
		{ title: '序号', dataIndex: 'seq', key: 'seq', width: 52, align: 'center' },
		{
			title: '提车收款单编码',
			key: 'collectCode',
			width: 180,
			ellipsis: true,
			render: function (_, record) {
				var parent = record && record._parentRecord;
				var code = parent ? parent.contractCode : (record._parentCode || '');
				return buildCollectCode(code, record.seq) || '—';
			}
		},
		{
			title: '审批状态',
			dataIndex: 'auditStatus',
			key: 'auditStatus',
			width: 90,
			render: function (v, record) {
				var status = (record && record.auditStatus != null) ? String(record.auditStatus).trim() : (v != null ? String(v).trim() : '');
				var isRejected = status === '已驳回' || status === '审批驳回';
				var color = status === '审批通过' ? 'success' : status === '待审批' ? 'processing' : status === '审批中' ? 'warning' : isRejected ? 'error' : 'default';
				var text = isRejected ? '审批驳回' : (status || '—');
				return React.createElement(Tag, { color: color }, text);
			}
		},
		{ title: '创建时间', dataIndex: 'chargeTime', key: 'chargeTime', width: 128, render: function (v) { return v || '—'; } },
		{ title: '创建人', dataIndex: 'creator', key: 'creator', width: 88, render: function (v) { return v || '—'; } },
		{ title: '提车数量', key: 'deliveryCount', width: 76, render: function (_, record) { return renderDeliveryPopover(record); } },
		{ title: '应收款总额', dataIndex: 'receivableTotal', key: 'receivableTotal', width: 98, align: 'right', render: function (v) { return fmtMoney(v); } },
		{ title: '实收款总额', dataIndex: 'actualTotal', key: 'actualTotal', width: 98, align: 'right', render: function (v) { return fmtMoney(v); } },
		{ title: '减免总金额', dataIndex: 'discountTotal', key: 'discountTotal', width: 88, align: 'right', render: function (v) { return fmtMoney(v); } },
		{
			title: '操作',
			key: 'action',
			width: 180,
			fixed: 'right',
			render: function (_, record) {
				var auditStatus = record && record.auditStatus;
				var isPending = auditStatus === '待审批';
				var isRejected = auditStatus === '已驳回' || auditStatus === '审批驳回';
				var canEdit = isPending || isRejected;
				var parentRecord = record && record._parentRecord;
				function handleDelete() {
					deleteConfirmRecord[1](record);
					deleteConfirmParentRecord[1](parentRecord);
					deleteConfirmVisible[1](true);
				}
				return React.createElement(Space, { size: 'small' },
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { goView(record); } }, '查看'),
					canEdit ? React.createElement(Button, { type: 'link', size: 'small', onClick: function () { goEdit(record); } }, '编辑') : null,
					(isPending || isRejected) ? React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: handleDelete }, '删除') : null
				);
			}
		}
	];
	function confirmDeleteSub() {
		var parent = deleteConfirmParentRecord[0];
		var row = deleteConfirmRecord[0];
		var list = (parent && (parent._detailList || parent.children)) || [];
		if (parent && row && list.length >= 0) {
			var newChildren = list.filter(function (r) { return !(r.seq === row.seq && r.chargeTime === row.chargeTime); });
			// 删除后序号重新生成 1、2、3...
			newChildren = newChildren.map(function (r, index) { var o = {}; for (var k in r) o[k] = r[k]; o.seq = index + 1; return o; });
			setMainList(function (prev) {
				return prev.map(function (p) {
					if (p.contractCode !== parent.contractCode) return p;
					var next = {}; for (var k in p) next[k] = p[k]; next.children = newChildren; return next;
				});
			});
		}
		deleteConfirmVisible[1](false);
		deleteConfirmRecord[1](null);
		deleteConfirmParentRecord[1](null);
		message.success('已删除');
	}
	function expandRowRender(record) {
		var rows = (record._detailList || []).map(function (r) { var o = {}; for (var k in r) o[k] = r[k]; o._parentCode = record.contractCode; o._parentRecord = record; return o; });
		return React.createElement('div', {
			style: { marginBottom: 0, paddingLeft: expandColumnWidth, boxSizing: 'border-box' },
			draggable: false,
			onDragStart: function (e) { e.preventDefault(); }
		},
			React.createElement(Table, {
				rowKey: function (r) { return (record.contractCode || '') + '-' + (r.seq || r.chargeTime || Math.random()); },
				columns: subColumns,
				dataSource: rows,
				pagination: false,
				size: 'small',
				bordered: true
			})
		);
	}

	var requirementContent = '提车应收款（2026年3月10日版本）\n一个「数字化资产ONEOS运管平台」中的「财务管理」「提车应收款」模块\n#面包屑：财务管理-提车应收款；\n\n页面分为2个卡片；\n1.筛选：\n#支持合同编码/项目名称/客户名称/业务部门/业务负责人等筛选方式；\n1.1.合同编码：选择器，支持输入框内手动输入下拉模糊匹配对应项；\n1.2.项目名称：选择器，支持输入框内手动输入下拉模糊匹配对应项；\n1.3.客户名称：选择器，支持输入框内手动输入下拉模糊匹配对应项；\n1.4.业务部门：选择器，支持选择所有业务部门；\n1.5.业务负责人：选择器，支持选择所有业务负责人；\n\n2.列表：\n#列表展示方式为：嵌套子表格，分为主表和子表，可点击主表展开子表，一个合同编码可以展开多个提车应收款明细；\n2.1.主表显示字段为：合同编码、合同类型、项目名称、客户名称、合同生效日期、业务部门、业务负责人、操作；\n2.1.1.合同编码：显示该提车应收款租赁合同对应合同编码；\n2.1.2.合同类型：显示该租赁合同对应合同类型，显示该合同为试用合同还是正式合同；\n2.1.3.项目名称：显示该租赁合同对应项目名称；\n2.1.4.客户名称：显示该租赁合同对应客户名称；\n2.1.5.合同生效日期：显示该租赁合同生效日期，格式为：YYYY-MM-DD；\n2.1.6.业务部门：显示该租赁合同对应业务部门名称；\n2.1.7.业务负责人：显示该租赁合同对应业务负责人；\n2.1.8.操作：提车收款单；\n      2.1.8.1.提车收款单：点击提车收款单，跳转提车收款单页进行子表创建，该合同所有车辆都已完成提车应收款后，该按钮不显示；\n主表右下角为分页符，支持选择单页显示多少条数据；\n\n2.2.子表显示字段为：序号、审批状态、创建时间、提车数量、应收款总额、实收款总额、减免总金额、实际到账金额、是否已开票、已开票金额、操作；\n2.2.1.序号：按照提车首付款收费单据提交时间从最早开始显示第1条，按照顺序1.2.3....；\n2.2.2.审批状态：审批通过、待审批、审批中、已驳回；\n      2.2.2.1.审批通过：该审批通过最终节点审批，显示为审批通过；\n      2.2.2.2.待审批：审批提车收款单仅保存，但未提交审批；\n      2.2.2.3.审批中：已发起审批流程，但未完成最终节点审批；\n      2.2.2.4.审批驳回：发起审批流程，但任意节点被驳回。被驳回的提车收款单支持重新修改后提交审批；\n2.2.3.创建时间：显示提车收款单创建时间，格式为：YYYY-MM-DD HH:MM；\n2.2.4.创建人：显示已提车收款单创建人姓名；\n2.2.5.提车数量：显示该提车收费单对应提车数量，点击提车数量弹出气泡卡片，卡片中列表显示品牌、型号、车牌号；\n2.2.6.应收款金额：按照该提车收费单据应收款金额，格式为：xx.xx元；\n2.2.7.实收款金额：按照该提车收费单据实收款总额，格式为：xx.xx元；\n2.2.8.减免金额：按照该提车收费单减免总金额，显示当前子表对应减免总额，格式为：xx.xx元；\n2.2.9.实际到账金额：显示该提车收费单财务填写的实际到账金额，格式为：xx.xx元；\n2.2.10.是否已开票：显示财务是否完成开票，已开票显示为：已开票，未开票显示为：未开票，部分开票显示为：部分开票；\n2.2.11.已开票金额：显示财务已开票金额，格式为：xx.xx元；\n2.2.12.总计：显示应收款总额、实收款总额、减免总金额、实际到账金额、已开票金额等所有子表求和数据；\n2.2.13.操作：查看、编辑、删除；\n       2.2.12.1.查看：点击查看后，跳转提车应收款-查看页面，审批通过、待审批、审批中、审批驳回均可点击查看来查看提车收款单详情；\n       2.2.12.2.编辑：点击编辑后，跳转提车应收款-编辑页面，待审批、审批驳回均可进行编辑操作；\n       2.2.12.2.删除：待审批、审批驳回状态子表支持删除功能，点击弹出二次确认，点击确认后删除该记录；\n ';

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '财务管理' },
					{ title: '提车应收款' }
				]
			}),
			React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { requirementModalVisible[1](true); } }, '查看需求说明')
		),
		React.createElement(Card, { title: '筛选', style: cardStyle },
			React.createElement('div', {
				style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', alignItems: 'start' }
			},
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '合同编码'),
					React.createElement(Select, {
						placeholder: '请选择或输入合同编码',
						allowClear: true,
						showSearch: true,
						style: filterControlStyle,
						value: filterContractCode[0],
						onChange: function (v) { filterContractCode[1](v); },
						options: filterOptions.contractCode,
						filterOption: function (input, opt) { return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1; }
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '项目名称'),
					React.createElement(Select, {
						placeholder: '请选择或输入项目名称',
						allowClear: true,
						showSearch: true,
						style: filterControlStyle,
						value: filterProjectName[0],
						onChange: function (v) { filterProjectName[1](v); },
						options: filterOptions.projectName,
						filterOption: function (input, opt) { return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1; }
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '客户名称'),
					React.createElement(Select, {
						placeholder: '请选择或输入客户名称',
						allowClear: true,
						showSearch: true,
						style: filterControlStyle,
						value: filterCustomerName[0],
						onChange: function (v) { filterCustomerName[1](v); },
						options: filterOptions.customerName,
						filterOption: function (input, opt) { return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1; }
					})
				),
				filterExpanded[0] ? React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '业务部门'),
					React.createElement(Select, {
						placeholder: '请选择业务部门',
						allowClear: true,
						style: filterControlStyle,
						value: filterBusinessDept[0],
						onChange: function (v) { filterBusinessDept[1](v); },
						options: filterOptions.businessDept
					})
				) : null,
				filterExpanded[0] ? React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '业务负责人'),
					React.createElement(Select, {
						placeholder: '请选择业务负责人',
						allowClear: true,
						style: filterControlStyle,
						value: filterBusinessPerson[0],
						onChange: function (v) { filterBusinessPerson[1](v); },
						options: filterOptions.businessPerson
					})
				) : null
			),
			React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
				React.createElement(Button, { onClick: function () { filterContractCode[1](undefined); filterProjectName[1](undefined); filterCustomerName[1](undefined); filterBusinessDept[1](undefined); filterBusinessPerson[1](undefined); } }, '重置'),
				React.createElement(Button, { type: 'primary' }, '查询'),
				React.createElement(Button, { type: 'link', size: 'small', onClick: function () { filterExpanded[1](!filterExpanded[0]); } }, filterExpanded[0] ? '收起' : '展开')
			)
		),
		React.createElement(Card, { title: '提车应收款', style: cardStyle },
			React.createElement(Table, {
				rowKey: 'contractCode',
				columns: mainColumns,
				dataSource: mainTableDataSource,
				expandable: {
					expandedRowKeys: expandedRowKeys,
					onExpandedRowsChange: function (keys) {
						setExpandedRowKeys(keys.length ? [keys[keys.length - 1]] : []);
					},
					expandedRowRender: expandRowRender,
					rowExpandable: function (record) { return (record._detailList && record._detailList.length > 0); },
					columnWidth: expandColumnWidth
				},
				pagination: { pageSize: 10, showSizeChanger: true, showTotal: function (t) { return '共 ' + t + ' 条'; } },
				size: 'middle',
				bordered: true,
				scroll: { x: 758 }
			})
		),
		React.createElement(Modal, {
			title: '确认删除',
			open: deleteConfirmVisible[0],
			onCancel: function () { deleteConfirmVisible[1](false); deleteConfirmRecord[1](null); deleteConfirmParentRecord[1](null); },
			onOk: confirmDeleteSub,
			okText: '确认',
			cancelText: '取消'
		}, '确定要删除该提车收款单记录吗？'),
		React.createElement(Modal, {
			title: '需求说明',
			open: requirementModalVisible[0],
			onCancel: function () { requirementModalVisible[1](false); },
			width: 720,
			footer: React.createElement(Button, { onClick: function () { requirementModalVisible[1](false); } }, '关闭'),
			bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
		}, React.createElement('div', { style: { padding: '8px 0' } },
			React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6 } }, requirementContent))
		)
	);
};
