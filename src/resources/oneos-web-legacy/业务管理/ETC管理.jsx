// 【重要】必须使用 const Component 作为组件变量名
// 业务管理 - ETC管理（2026年3月10日版本）
// 模块：充值明细 / ETC账单明细 / ETC余额管理

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Table = antd.Table;
	var Tabs = antd.Tabs;
	var Button = antd.Button;
	var Select = antd.Select;
	var Input = antd.Input;
	var DatePicker = antd.DatePicker;
	var Modal = antd.Modal;
	var message = antd.message;
	var Tag = antd.Tag;
	var Upload = antd.Upload;

	var activeTab = useState('recharge');
	var setActiveTab = activeTab[1];

	// ========== 充值明细 Tab ==========
	var filterCustomer = useState(undefined);
	var filterRemitStart = useState(null);
	var filterRemitEnd = useState(null);
	var filterReceiveCompany = useState(undefined);
	var filterEntryType = useState(undefined);
	var filterRechargeNo = useState('');
	var filterAuditStatus = useState(undefined);
	var addRechargeVisible = useState(false);
	var deleteConfirmVisible = useState(false);
	var deleteConfirmRecord = useState(null);
	var rechargeList = useState([
		{ id: 'r1', auditStatus: '已入账', rechargeNo: 'ETC202603010001', customerName: '嘉兴某某物流有限公司', etcBalance: 12580.00, remitAccount: '嘉兴某某物流有限公司', remitDate: '2026-03-01', receiveCompany: '浙江羚牛氢能科技有限公司', entryType: '合同预付', receiveBank: '工商银行杭州分行', amount: 10000.00, creator: '张经理', createTime: '2026-03-01 10:00', attachment: '凭证.pdf', updateTime: '2026-03-01 10:00' },
		{ id: 'r2', auditStatus: '待审核', rechargeNo: 'ETC202603050002', customerName: '上海某某运输公司', etcBalance: 8600.00, remitAccount: '上海某某运输公司', remitDate: '2026-03-05', receiveCompany: '羚牛新能源科技上海有限公司', entryType: '线下充值', receiveBank: '建设银行上海分行', amount: 5000.00, creator: '李专员', createTime: '2026-03-05 14:30', attachment: '', updateTime: '2026-03-05 14:30' },
		{ id: 'r3', auditStatus: '已驳回', rechargeNo: 'ETC202603080003', customerName: '杭州某某租赁有限公司', etcBalance: 3200.00, remitAccount: '杭州某某租赁有限公司', remitDate: '2026-03-08', receiveCompany: '浙江羚牛氢能科技有限公司', entryType: '资金冲红', receiveBank: '农业银行杭州分行', amount: -500.00, creator: '王专员', createTime: '2026-03-08 09:15', attachment: '冲红说明.pdf', updateTime: '2026-03-08 11:00' }
	]);
	var rechargeData = rechargeList[0];
	var setRechargeList = rechargeList[1];

	// 新增充值表单
	var addFormCustomer = useState(undefined);
	var addFormRemitAccount = useState('');
	var addFormEtcBalance = useState('');
	var addFormRemitDate = useState(null);
	var addFormReceiveCompany = useState(undefined);
	var addFormOpType = useState(undefined);
	var addFormAmount = useState('');
	var addFormReceiveBank = useState(undefined);
	var addFormFiles = useState([]);

	var receiveCompanyOptions = [
		{ label: '羚牛新能源科技上海有限公司', value: '羚牛新能源科技上海有限公司' },
		{ label: '浙江羚牛氢能科技有限公司', value: '浙江羚牛氢能科技有限公司' }
	];
	var entryTypeOptions = [
		{ label: '合同预付', value: '合同预付' },
		{ label: '线下充值', value: '线下充值' },
		{ label: '资金冲红', value: '资金冲红' }
	];
	var opTypeOptions = [
		{ label: '普通充值', value: '普通充值' },
		{ label: '资金冲红', value: '资金冲红' }
	];

	var filteredRecharge = useMemo(function () {
		var list = rechargeData;
		if (filterCustomer[0]) list = list.filter(function (r) { return r.customerName === filterCustomer[0]; });
		if (filterReceiveCompany[0]) list = list.filter(function (r) { return r.receiveCompany === filterReceiveCompany[0]; });
		if (filterEntryType[0]) list = list.filter(function (r) { return r.entryType === filterEntryType[0]; });
		if (filterAuditStatus[0]) list = list.filter(function (r) { return r.auditStatus === filterAuditStatus[0]; });
		if ((filterRechargeNo[0] || '').trim()) {
			var kw = (filterRechargeNo[0] || '').trim().toLowerCase();
			list = list.filter(function (r) { return (r.rechargeNo || '').toLowerCase().indexOf(kw) !== -1; });
		}
		return list;
	}, [rechargeData, filterCustomer[0], filterReceiveCompany[0], filterEntryType[0], filterAuditStatus[0], filterRechargeNo[0]]);

	var rechargeColumns = [
		{ title: '审核状态', dataIndex: 'auditStatus', key: 'auditStatus', width: 88, render: function (v) { var color = v === '已入账' ? 'success' : v === '待审核' ? 'processing' : 'error'; return React.createElement(Tag, { color: color }, v); } },
		{ title: '充值编号', dataIndex: 'rechargeNo', key: 'rechargeNo', width: 160, ellipsis: true },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 160, ellipsis: true },
		{ title: 'ETC账户余额', dataIndex: 'etcBalance', key: 'etcBalance', width: 120, align: 'right', render: function (v) { return (v != null ? Number(v).toFixed(2) : '0.00') + ' 元'; } },
		{ title: '汇款账户名', dataIndex: 'remitAccount', key: 'remitAccount', width: 140, ellipsis: true },
		{ title: '汇款日期', dataIndex: 'remitDate', key: 'remitDate', width: 110 },
		{ title: '收款公司', dataIndex: 'receiveCompany', key: 'receiveCompany', width: 200, ellipsis: true },
		{ title: '入账类型', dataIndex: 'entryType', key: 'entryType', width: 100 },
		{ title: '收款银行', dataIndex: 'receiveBank', key: 'receiveBank', width: 140, ellipsis: true },
		{ title: '充值金额', dataIndex: 'amount', key: 'amount', width: 100, align: 'right', render: function (v) { return (v != null ? Number(v).toFixed(2) : '0.00') + ' 元'; } },
		{ title: '创建人', dataIndex: 'creator', key: 'creator', width: 90 },
		{ title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
		{ title: '附件', dataIndex: 'attachment', key: 'attachment', width: 90, render: function (v) { return v ? React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('预览：' + v); } }, '预览') : '—'; } },
		{ title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 160 },
		{ title: '操作', key: 'action', width: 160, fixed: 'right', render: function (_, record) {
			return React.createElement(React.Fragment, null,
				React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('查看 ' + record.rechargeNo); } }, '查看'),
				React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('编辑 ' + record.rechargeNo); } }, '编辑'),
				React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function () { deleteConfirmRecord[1](record); deleteConfirmVisible[1](true); } }, '删除')
			);
		} }
	];

	var handleDeleteRecharge = function () {
		var r = deleteConfirmRecord[0];
		if (r) setRechargeList(function (prev) { return prev.filter(function (x) { return x.id !== r.id; }); });
		deleteConfirmVisible[1](false);
		deleteConfirmRecord[1](null);
		message.success('已删除');
	};

	var handleAddRechargeSubmit = function () {
		message.success('充值信息已提交');
		addRechargeVisible[1](false);
	};

	// ========== ETC账单明细 Tab ==========
	var billFilterYear = useState(2026);
	var billFilterDateRange = useState(null);
	var billFilterBillDateRange = useState(null);
	var billFilterPassDate = useState(null);
	var billFilterPlate = useState('');
	var billFilterVehicleNature = useState(undefined);
	var billFilterCustomer = useState('');
	var billFilterReconciled = useState(undefined);
	var invoiceConfirmVisible = useState(false);
	var billList = useState([
		{ id: 'b1', year: 2026, month: 3, week: 2, salesman: '张经理', billDate: '2026/3/10', plateNo: '浙A12345', passTime: '2026-03-10 08:56:48', entry: '杭州南', exit: '嘉兴东', fee: 45.50, vehicleType: '18T', nature: '租赁', customerName: '嘉兴某某物流有限公司', isInvoiced: '否', invoiceAmount: 0, remark: '' },
		{ id: 'b2', year: 2026, month: 3, week: 2, salesman: '张经理', billDate: '2026/3/10', plateNo: '浙A23456', passTime: '2026-03-10 09:12:00', entry: '嘉兴东', exit: '上海枫泾', fee: 128.00, vehicleType: '18T', nature: '租赁', customerName: '嘉兴某某物流有限公司', isInvoiced: '是', invoiceAmount: 128.00, remark: '' },
		{ id: 'b3', year: 2026, month: 3, week: 2, salesman: '李专员', billDate: '2026/3/9', plateNo: '沪B11111', passTime: '2026-03-09 14:30:22', entry: '上海徐泾', exit: '苏州城区', fee: 86.00, vehicleType: '4.5T', nature: '自营', customerName: '上海某某运输公司', isInvoiced: '否', invoiceAmount: 0, remark: '' }
	]);
	var billData = billList[0];
	var totalEtcFee = useMemo(function () { return billData.reduce(function (acc, r) { return acc + (Number(r.fee) || 0); }, 0); }, [billData]);

	var billColumns = [
		{ title: '年份', dataIndex: 'year', key: 'year', width: 72 },
		{ title: '月份', dataIndex: 'month', key: 'month', width: 64 },
		{ title: '周', dataIndex: 'week', key: 'week', width: 56 },
		{ title: '业务员', dataIndex: 'salesman', key: 'salesman', width: 90 },
		{ title: '账单日期', dataIndex: 'billDate', key: 'billDate', width: 100 },
		{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100 },
		{ title: '通行时间', dataIndex: 'passTime', key: 'passTime', width: 172 },
		{ title: '入口', dataIndex: 'entry', key: 'entry', width: 100 },
		{ title: '出口', dataIndex: 'exit', key: 'exit', width: 100 },
		{ title: '通行费用', dataIndex: 'fee', key: 'fee', width: 96, align: 'right', render: function (v) { return (v != null ? Number(v).toFixed(2) : '0.00') + ' 元'; } },
		{ title: '车型', dataIndex: 'vehicleType', key: 'vehicleType', width: 72 },
		{ title: '性质', dataIndex: 'nature', key: 'nature', width: 72 },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 160, ellipsis: true },
		{ title: '是否已开票', dataIndex: 'isInvoiced', key: 'isInvoiced', width: 96 },
		{ title: '开票金额', dataIndex: 'invoiceAmount', key: 'invoiceAmount', width: 96, align: 'right', render: function (v) { return (v != null ? Number(v).toFixed(2) : '0.00') + ' 元'; } },
		{ title: '备注', dataIndex: 'remark', key: 'remark', width: 100, ellipsis: true },
		{ title: '操作', key: 'action', width: 160, fixed: 'right', render: function (_, record) {
			return React.createElement(React.Fragment, null,
				React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function () { message.info('删除 ' + record.id); } }, '删除'),
				React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('编辑 ' + record.id); } }, '编辑'),
				React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('查看 ' + record.id); } }, '查看')
			);
		} }
	];

	// ========== ETC余额管理 Tab ==========
	var balanceFilterCustomer = useState(undefined);
	var balanceFilterStatus = useState(undefined);
	var balanceFilterProject = useState(undefined);
	var balanceFilterMin = useState('');
	var balanceFilterMax = useState('');
	var thresholdModalVisible = useState(false);
	var thresholdModalRecord = useState(null);
	var balanceList = useState([
		{ id: 'c1', type: 'customer', customerName: '嘉兴某某物流有限公司', projectCount: 2, status: '正常', totalBalance: 12580.00, rechargeTotal: 20000.00, consumeTotal: 7420.00, lastRemitDate: '2026-03-01', threshold: 1000, projects: [
			{ id: 'c1-p1', type: 'project', projectName: '嘉兴氢能示范项目' },
			{ id: 'c1-p2', type: 'project', projectName: '嘉兴城配项目' }
		]},
		{ id: 'c2', type: 'customer', customerName: '上海某某运输公司', projectCount: 1, status: '预警', totalBalance: 860.00, rechargeTotal: 5000.00, consumeTotal: 4140.00, lastRemitDate: '2026-03-05', threshold: 1000, projects: [
			{ id: 'c2-p1', type: 'project', projectName: '上海物流租赁项目' }
		]},
		{ id: 'c3', type: 'customer', customerName: '杭州某某租赁有限公司', projectCount: 1, status: '欠费', totalBalance: -200.00, rechargeTotal: 3000.00, consumeTotal: 3200.00, lastRemitDate: '2026-02-20', threshold: 500, projects: [
			{ id: 'c3-p1', type: 'project', projectName: '杭州城配租赁项目' }
		]}
	]);
	var balanceData = balanceList[0];

	var balanceColumns = [
		{ title: '客户名称/项目名称', key: 'name', width: 220, render: function (_, record) {
			if (record.type === 'customer') return React.createElement('span', { style: { fontWeight: 600 } }, record.customerName);
			return React.createElement('span', { style: { paddingLeft: 24 } }, record.projectName);
		} },
		{ title: '项目数量', dataIndex: 'projectCount', key: 'projectCount', width: 92 },
		{ title: '状态值', dataIndex: 'status', key: 'status', width: 88, render: function (v) {
			if (!v) return '—';
			var color = v === '正常' ? 'success' : v === '预警' ? 'warning' : 'error';
			return React.createElement(Tag, { color: color }, v);
		} },
		{ title: '总账户余额', dataIndex: 'totalBalance', key: 'totalBalance', width: 120, align: 'right', render: function (v) { return v != null ? (Number(v).toFixed(2) + ' 元') : '—'; } },
		{ title: '客户充值余额', dataIndex: 'rechargeTotal', key: 'rechargeTotal', width: 120, align: 'right', render: function (v) { return v != null ? (Number(v).toFixed(2) + ' 元') : '—'; } },
		{ title: '客户消耗ETC费用', dataIndex: 'consumeTotal', key: 'consumeTotal', width: 130, align: 'right', render: function (v) { return v != null ? (Number(v).toFixed(2) + ' 元') : '—'; } },
		{ title: '最近汇款日期', dataIndex: 'lastRemitDate', key: 'lastRemitDate', width: 118 },
		{ title: '操作', key: 'action', width: 180, fixed: 'right', render: function (_, record) {
			if (record.type === 'customer') {
				return React.createElement(React.Fragment, null,
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { thresholdModalRecord[1](record); thresholdModalVisible[1](true); } }, '阈值设置'),
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('跳转账单明细：' + record.customerName); } }, '账单明细')
				);
			}
			return React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('项目账单明细：' + record.projectName); } }, '账单明细');
		} }
	];

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var labelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var formRowStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px', marginBottom: 16 };
	var formItemStyle = { marginBottom: 12 };

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
					{ title: '业务管理' },
					{ title: 'ETC管理' }
				]
			})
		),
		React.createElement(Card, { style: cardStyle },
			React.createElement(Tabs, {
				activeKey: activeTab[0],
				onChange: setActiveTab,
				items: [
					{
						key: 'recharge',
						label: '充值明细',
						children: React.createElement(React.Fragment, null,
							React.createElement('div', { style: formRowStyle },
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '客户名称'),
									React.createElement(Select, { placeholder: '请选择客户', allowClear: true, style: { width: '100%' }, value: filterCustomer[0], onChange: filterCustomer[1], options: [{ label: '嘉兴某某物流有限公司', value: '嘉兴某某物流有限公司' }, { label: '上海某某运输公司', value: '上海某某运输公司' }, { label: '杭州某某租赁有限公司', value: '杭州某某租赁有限公司' }] })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '汇款日期'),
									React.createElement(DatePicker.RangePicker, { style: { width: '100%' }, value: [filterRemitStart[0], filterRemitEnd[0]], onChange: function (dates) { filterRemitStart[1](dates && dates[0] || null); filterRemitEnd[1](dates && dates[1] || null); } })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '收款公司'),
									React.createElement(Select, { placeholder: '请选择', allowClear: true, style: { width: '100%' }, value: filterReceiveCompany[0], onChange: filterReceiveCompany[1], options: receiveCompanyOptions })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '入账类型'),
									React.createElement(Select, { placeholder: '请选择', allowClear: true, style: { width: '100%' }, value: filterEntryType[0], onChange: filterEntryType[1], options: entryTypeOptions })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '充值编号'),
									React.createElement(Input, { placeholder: '请输入充值编号', value: filterRechargeNo[0], onChange: function (e) { filterRechargeNo[1](e.target.value); } })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '审核状态'),
									React.createElement(Select, { placeholder: '请选择', allowClear: true, style: { width: '100%' }, value: filterAuditStatus[0], onChange: filterAuditStatus[1], options: [{ label: '待审核', value: '待审核' }, { label: '已驳回', value: '已驳回' }, { label: '已入账', value: '已入账' }] })
								)
							),
							React.createElement('div', { style: { marginBottom: 16, display: 'flex', gap: 8 } },
								React.createElement(Button, { onClick: function () { filterCustomer[1](undefined); filterRemitStart[1](null); filterRemitEnd[1](null); filterReceiveCompany[1](undefined); filterEntryType[1](undefined); filterRechargeNo[1](''); filterAuditStatus[1](undefined); } }, '重置'),
								React.createElement(Button, { type: 'primary', onClick: function () { message.info('查询'); } }, '查询'),
								React.createElement(Button, { type: 'primary', onClick: function () { addRechargeVisible[1](true); } }, '新增')
							),
							React.createElement(Table, { rowKey: 'id', columns: rechargeColumns, dataSource: filteredRecharge, scroll: { x: 1800 }, pagination: { showSizeChanger: true, showTotal: function (t) { return '共 ' + t + ' 条'; } } })
						)
					},
					{
						key: 'bill',
						label: 'ETC账单明细',
						children: React.createElement(React.Fragment, null,
							React.createElement('div', { style: { marginBottom: 16, padding: 16, background: '#e6f7ff', borderRadius: 8, border: '1px solid #91d5ff' } },
								React.createElement('span', { style: { fontSize: 14, color: 'rgba(0,0,0,0.65)' } }, '总ETC通行金额：'),
								React.createElement('span', { style: { fontSize: 20, fontWeight: 600, color: '#1890ff', marginLeft: 8 } }, totalEtcFee.toFixed(2), ' 元')
							),
							React.createElement('div', { style: formRowStyle },
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '年份'),
									React.createElement(Select, { style: { width: '100%' }, value: billFilterYear[0], onChange: billFilterYear[1], options: [{ label: '2026', value: 2026 }, { label: '2027', value: 2027 }] })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '时间区间'),
									React.createElement(DatePicker.RangePicker, { style: { width: '100%' }, value: billFilterDateRange[0], onChange: billFilterDateRange[1] })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '账单日期'),
									React.createElement(DatePicker.RangePicker, { style: { width: '100%' }, value: billFilterBillDateRange[0], onChange: billFilterBillDateRange[1] })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '通行日期'),
									React.createElement(DatePicker, { style: { width: '100%' }, value: billFilterPassDate[0], onChange: billFilterPassDate[1] })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '车牌号'),
									React.createElement(Input, { placeholder: '请输入车牌号', value: billFilterPlate[0], onChange: function (e) { billFilterPlate[1](e.target.value); } })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '车辆性质'),
									React.createElement(Select, { placeholder: '请选择', allowClear: true, style: { width: '100%' }, value: billFilterVehicleNature[0], onChange: billFilterVehicleNature[1], options: [{ label: '租赁', value: '租赁' }, { label: '自营', value: '自营' }, { label: '异动', value: '异动' }, { label: '维修', value: '维修' }, { label: '库存', value: '库存' }] })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '客户名称'),
									React.createElement(Input, { placeholder: '请输入客户名称', value: billFilterCustomer[0], onChange: function (e) { billFilterCustomer[1](e.target.value); } })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '是否对账'),
									React.createElement(Select, { placeholder: '请选择', allowClear: true, style: { width: '100%' }, value: billFilterReconciled[0], onChange: billFilterReconciled[1], options: [{ label: '是', value: '是' }, { label: '否', value: '否' }] })
								)
							),
							React.createElement('div', { style: { marginBottom: 16 } },
								React.createElement(Button, { type: 'primary', onClick: function () { invoiceConfirmVisible[1](true); } }, '提交开票')
							),
							React.createElement(Table, { rowKey: 'id', columns: billColumns, dataSource: billData, scroll: { x: 1900 }, pagination: { showSizeChanger: true, showTotal: function (t) { return '共 ' + t + ' 条'; } } })
						)
					},
					{
						key: 'balance',
						label: 'ETC余额管理',
						children: React.createElement(React.Fragment, null,
							React.createElement('div', { style: formRowStyle },
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '客户名称'),
									React.createElement(Input, { placeholder: '请输入客户名称', value: balanceFilterCustomer[0], onChange: function (e) { balanceFilterCustomer[1](e.target.value); } })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '状态值'),
									React.createElement(Select, { placeholder: '请选择', allowClear: true, style: { width: '100%' }, value: balanceFilterStatus[0], onChange: balanceFilterStatus[1], options: [{ label: '正常', value: '正常' }, { label: '预警', value: '预警' }, { label: '欠费', value: '欠费' }] })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '项目名称'),
									React.createElement(Input, { placeholder: '请输入项目名称', value: balanceFilterProject[0], onChange: function (e) { balanceFilterProject[1](e.target.value); } })
								),
								React.createElement('div', { style: formItemStyle },
									React.createElement('div', { style: labelStyle }, '余额范围'),
									React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
										React.createElement(Input, { placeholder: '最小值', value: balanceFilterMin[0], onChange: function (e) { balanceFilterMin[1](e.target.value); } }),
										React.createElement('span', null, '-'),
										React.createElement(Input, { placeholder: '最大值', value: balanceFilterMax[0], onChange: function (e) { balanceFilterMax[1](e.target.value); } })
									)
								)
							),
							React.createElement('div', { style: { marginBottom: 16 } },
								React.createElement(Button, { onClick: function () { message.info('导出'); } }, '导出'),
								React.createElement(Button, { style: { marginLeft: 8 } }, '批量阈值设置')
							),
							React.createElement(Table, {
								rowKey: 'id',
								columns: balanceColumns,
								dataSource: balanceData,
								scroll: { x: 1200 },
								pagination: false,
								expandable: {
									expandedRowRender: function (record) {
										if (!record.projects || !record.projects.length) return null;
										return React.createElement('div', { style: { padding: '8px 24px', background: '#fafafa' } },
											record.projects.map(function (p) { return React.createElement('div', { key: p.id, style: { padding: '4px 0' } }, p.projectName); })
										);
									},
									rowExpandable: function (record) { return record.projects && record.projects.length > 0; }
								}
							})
						)
					}
				]
			})
		),
		// 新增充值信息弹窗
		React.createElement(Modal, {
			title: '新增充值信息',
			open: addRechargeVisible[0],
			onCancel: function () { addRechargeVisible[1](false); },
			width: 640,
			footer: [
				React.createElement(Button, { key: 'cancel', onClick: function () { addRechargeVisible[1](false); } }, '取消'),
				React.createElement(Button, { key: 'submit', type: 'primary', onClick: handleAddRechargeSubmit }, '提交')
			]
		}, React.createElement(React.Fragment, null,
			React.createElement('div', { style: { fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' } }, '客户信息'),
			React.createElement('div', { style: formRowStyle },
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, React.createElement('span', { style: { color: '#ff4d4f' } }, '*'), '客户名称'),
					React.createElement(Select, { placeholder: '请选择/录入客户', allowClear: true, style: { width: '100%' }, value: addFormCustomer[0], onChange: function (v) { addFormCustomer[1](v); addFormRemitAccount[1](v ? v + '（自动带出）' : ''); addFormEtcBalance[1](v ? '12580.00' : ''); }, options: [{ label: '嘉兴某某物流有限公司', value: '嘉兴某某物流有限公司' }, { label: '上海某某运输公司', value: '上海某某运输公司' }] })
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, '汇款账户名'),
					React.createElement(Input, { value: addFormRemitAccount[0], disabled: true, placeholder: '选择客户后自动带出' })
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, 'ETC账户余额'),
					React.createElement(Input, { value: addFormEtcBalance[0], disabled: true, placeholder: '选择客户后同步展示' })
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, React.createElement('span', { style: { color: '#ff4d4f' } }, '*'), '汇款日期'),
					React.createElement(DatePicker, { style: { width: '100%' }, value: addFormRemitDate[0], onChange: addFormRemitDate[1] })
				)
			),
			React.createElement('div', { style: { fontSize: 15, fontWeight: 600, marginBottom: 12, marginTop: 20, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' } }, '我司信息'),
			React.createElement('div', { style: formRowStyle },
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, React.createElement('span', { style: { color: '#ff4d4f' } }, '*'), '收款公司'),
					React.createElement(Select, { placeholder: '请选择', style: { width: '100%' }, value: addFormReceiveCompany[0], onChange: addFormReceiveCompany[1], options: receiveCompanyOptions })
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, React.createElement('span', { style: { color: '#ff4d4f' } }, '*'), '操作类型'),
					React.createElement(Select, { placeholder: '请选择', style: { width: '100%' }, value: addFormOpType[0], onChange: addFormOpType[1], options: opTypeOptions })
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, React.createElement('span', { style: { color: '#ff4d4f' } }, '*'), '充值金额（¥）'),
					React.createElement(Input, { type: 'number', placeholder: '请输入', value: addFormAmount[0], onChange: function (e) { addFormAmount[1](e.target.value); } }),
					React.createElement('div', { style: { fontSize: 12, color: '#666', marginTop: 4 } }, '当前账户余额 + 本次变动金额 = 预计账户余额（选择客户后展示）')
				),
				React.createElement('div', { style: formItemStyle },
					React.createElement('div', { style: labelStyle }, React.createElement('span', { style: { color: '#ff4d4f' } }, '*'), '收款银行'),
					React.createElement(Select, { placeholder: '请选择', style: { width: '100%' }, value: addFormReceiveBank[0], onChange: addFormReceiveBank[1], options: [{ label: '工商银行杭州分行', value: '工商银行杭州分行' }, { label: '建设银行上海分行', value: '建设银行上海分行' }, { label: '农业银行杭州分行', value: '农业银行杭州分行' }] })
				)
			),
			React.createElement('div', { style: { fontSize: 15, fontWeight: 600, marginBottom: 12, marginTop: 20, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' } }, '凭证上传'),
			React.createElement('div', { style: formItemStyle },
				React.createElement(Upload, { multiple: true, fileList: addFormFiles[0], beforeUpload: function () { return false; }, onChange: function (info) { addFormFiles[1](info.fileList.slice(-5)); } },
					React.createElement(Button, null, '点击上传或拖拽文件')
				)
			)
		)),
		// 删除二次确认
		React.createElement(Modal, {
			title: '确认删除',
			open: deleteConfirmVisible[0],
			onOk: handleDeleteRecharge,
			onCancel: function () { deleteConfirmVisible[1](false); deleteConfirmRecord[1](null); },
			okText: '确认',
			cancelText: '取消'
		}, '确认删除该条充值记录？'),
		// 提交开票二次确认
		React.createElement(Modal, {
			title: '确认开票',
			open: invoiceConfirmVisible[0],
			onOk: function () { invoiceConfirmVisible[1](false); message.success('开票操作已提交'); },
			onCancel: function () { invoiceConfirmVisible[1](false); },
			okText: '确认',
			cancelText: '取消'
		}, '确认无误后执行开票操作？'),
		// 阈值设置弹窗
		React.createElement(Modal, {
			title: '阈值设置',
			open: thresholdModalVisible[0],
			onOk: function () { thresholdModalVisible[1](false); thresholdModalRecord[1](null); message.success('阈值已保存'); },
			onCancel: function () { thresholdModalVisible[1](false); thresholdModalRecord[1](null); },
			okText: '确定',
			cancelText: '取消'
		}, thresholdModalRecord[0] ? React.createElement('div', { style: formItemStyle },
			React.createElement('div', { style: labelStyle }, '客户：' + (thresholdModalRecord[0].customerName || '')),
			React.createElement('div', { style: labelStyle }, '余额阈值（需大于0）'),
			React.createElement(Input, { type: 'number', placeholder: '请输入阈值', defaultValue: thresholdModalRecord[0].threshold })
		) : null)
	);
};
