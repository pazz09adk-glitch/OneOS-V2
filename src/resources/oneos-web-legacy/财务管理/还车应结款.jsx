// 【重要】必须使用 const Component 作为组件变量名
// 财务管理 - 还车应结款（列表页）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
var Table = antd.Table;
var Button = antd.Button;
var Modal = antd.Modal;
var Tooltip = antd.Tooltip;
var Select = antd.Select;
var DatePicker = antd.DatePicker;
var message = antd.message;

	var RangePicker = DatePicker.RangePicker;

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };

	function fmtYMD(d) {
		var dd = d instanceof Date ? d : new Date();
		var p2 = function (n) { return n < 10 ? '0' + n : '' + n; };
		return dd.getFullYear() + '-' + p2(dd.getMonth() + 1) + '-' + p2(dd.getDate());
	}

	function fmtYMDHM(v) {
		if (v === null || v === undefined) return '-';
		var s = String(v).trim();
		if (!s) return '-';
		if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(s)) return s.slice(0, 16);
		if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s + ' 00:00';
		try {
			var d = new Date(s.replace(/-/g, '/'));
			if (isNaN(d.getTime())) return s;
			var p2 = function (n) { return n < 10 ? '0' + n : '' + n; };
			return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
		} catch (e) {
			return s;
		}
	}

	function fmtMoney(v) {
		var n = typeof v === 'number' ? v : parseFloat(v);
		if (isNaN(n)) n = 0;
		return n.toFixed(2);
	}

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function IconSubmitted(ok) {
		return React.createElement('span', {
			style: {
				display: 'inline-block',
				width: 10,
				height: 10,
				borderRadius: 999,
				background: ok ? '#52c41a' : '#d9d9d9',
				border: ok ? '1px solid #52c41a' : '1px solid #d9d9d9'
			}
		});
	}

	function SubmitCell(ok, name) {
		return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
			IconSubmitted(ok),
			React.createElement('span', { style: { color: ok ? '#333' : '#999' } }, name || (ok ? '-' : '-'))
		);
	}

	var approvalStatusOptions = useMemo(function () {
		return [
			{ value: '待提交', label: '待提交' },
			{ value: '待审批', label: '待审批' },
			{ value: '审批中', label: '审批中' },
			{ value: '审批完成', label: '审批完成' },
			{ value: '审批驳回', label: '审批驳回' },
			{ value: '撤回', label: '撤回' }
		];
	}, []);

	var tableDataState = useState([
			{
				key: 'r1',
				contractCode: 'LNZLHT20251106001',
				submitSafety: { ok: true, name: '赵六' },
				submitBusiness: { ok: true, name: '张三' },
				submitOperation: { ok: false, name: '王五' },
				submitEnergy: { ok: true, name: '李四' },
				approvalStatus: '待提交',
				customerName: '嘉兴某某物流有限公司',
				projectName: '嘉兴腾4.5T租赁',
				plateNo: '粤AGP5621',
				businessDept: '业务一部',
				businessOwner: '张经理',
				deliveryTime: '2026-02-01 09:30',
				returnTime: '2026-02-27 16:20',
				returnPerson: '陈还车'
			},
			{
				key: 'r2',
				contractCode: 'LNZLHT20251201002',
				submitSafety: { ok: true, name: '赵六' },
				submitBusiness: { ok: true, name: '张三' },
				submitOperation: { ok: true, name: '王五' },
				submitEnergy: { ok: true, name: '李四' },
				approvalStatus: '待审批',
				customerName: '上海馨想事成物流有限公司',
				projectName: '上海干线运输项目',
				plateNo: '浙F03218F',
				businessDept: '业务二部',
				businessOwner: '李主管',
				deliveryTime: '2026-01-10 10:00',
				returnTime: '2026-02-20 18:05',
				returnPerson: '周还车'
			},
			{
				key: 'r3',
				contractCode: 'ZYYGHT20260105003',
				submitSafety: { ok: false, name: '' },
				submitBusiness: { ok: false, name: '' },
				submitOperation: { ok: false, name: '' },
				submitEnergy: { ok: false, name: '' },
				approvalStatus: '审批驳回',
				customerName: '北京海龙运输有限公司',
				projectName: '京津冀冷链项目',
				plateNo: '京A29256F',
				businessDept: '业务三部',
				businessOwner: '王总',
				deliveryTime: '2025-08-01 08:30',
				returnTime: '2026-02-02 11:15',
				returnPerson: '刘还车'
			},
			{
				key: 'r4',
				contractCode: 'LNZLHT20251106004',
				submitSafety: { ok: true, name: '赵六' },
				submitBusiness: { ok: false, name: '' },
				submitOperation: { ok: true, name: '王五' },
				submitEnergy: { ok: false, name: '' },
				approvalStatus: '审批中',
				customerName: '苏州某某快运有限公司',
				projectName: '苏州城配项目',
				plateNo: '苏E8K2P1',
				businessDept: '业务一部',
				businessOwner: '张经理',
				deliveryTime: '2026-02-15 13:40',
				returnTime: '2026-02-26 09:10',
				returnPerson: '孙还车'
			},
			{
				key: 'r5',
				contractCode: 'LNZLHT20251106005',
				submitSafety: { ok: true, name: '赵六' },
				submitBusiness: { ok: true, name: '张三' },
				submitOperation: { ok: true, name: '王五' },
				submitEnergy: { ok: false, name: '' },
				approvalStatus: '撤回',
				customerName: '杭州某某物流有限公司',
				projectName: '杭州港区项目',
				plateNo: '浙A3M8Q7',
				businessDept: '业务二部',
				businessOwner: '李主管',
				deliveryTime: '2026-02-05',
				returnTime: '2026-02-25',
				returnPerson: '吴还车'
			},
			{
				key: 'r6',
				contractCode: 'LNZLHT20251215006',
				submitSafety: { ok: true, name: '赵六' },
				submitBusiness: { ok: true, name: '张三' },
				submitOperation: { ok: true, name: '王五' },
				submitEnergy: { ok: true, name: '李四' },
				approvalStatus: '审批完成',
				customerName: '宁波某某供应链有限公司',
				projectName: '宁波港区支线项目',
				plateNo: '浙B6H9Q2',
				businessDept: '业务三部',
				businessOwner: '周经理',
				deliveryTime: '2026-01-05',
				returnTime: '2026-02-18',
				returnPerson: '郑还车'
			},
			{
				key: 'r7',
				contractCode: 'LNZLHT20260108007',
				submitSafety: { ok: true, name: '赵六' },
				submitBusiness: { ok: false, name: '' },
				submitOperation: { ok: false, name: '' },
				submitEnergy: { ok: false, name: '' },
				approvalStatus: '待提交',
				customerName: '合肥某某物流有限公司',
				projectName: '合肥城配项目',
				plateNo: '皖A7K3P8',
				businessDept: '业务一部',
				businessOwner: '张经理',
				deliveryTime: '2026-02-10',
				returnTime: '2026-02-28',
				returnPerson: '许还车'
			},
			{
				key: 'r8',
				contractCode: 'ZYYGHT20260112008',
				submitSafety: { ok: true, name: '赵六' },
				submitBusiness: { ok: true, name: '张三' },
				submitOperation: { ok: true, name: '王五' },
				submitEnergy: { ok: true, name: '李四' },
				approvalStatus: '待审批',
				customerName: '深圳某某快运有限公司',
				projectName: '深莞干线项目',
				plateNo: '粤B2P6M9',
				businessDept: '业务二部',
				businessOwner: '李主管',
				deliveryTime: '2026-01-20',
				returnTime: '2026-02-22',
				returnPerson: '彭还车'
			},
			{
				key: 'r9',
				contractCode: 'LNZLHT20251130009',
				submitSafety: { ok: true, name: '赵六' },
				submitBusiness: { ok: true, name: '张三' },
				submitOperation: { ok: true, name: '王五' },
				submitEnergy: { ok: true, name: '李四' },
				approvalStatus: '审批中',
				customerName: '天津某某运输有限公司',
				projectName: '津冀干线项目',
				plateNo: '津A5R8L1',
				businessDept: '业务三部',
				businessOwner: '王总',
				deliveryTime: '2026-02-02',
				returnTime: '2026-02-27',
				returnPerson: '韩还车'
			},
			{
				key: 'r10',
				contractCode: 'LNZLHT20251118010',
				submitSafety: { ok: true, name: '赵六' },
				submitBusiness: { ok: true, name: '张三' },
				submitOperation: { ok: true, name: '王五' },
				submitEnergy: { ok: false, name: '' },
				approvalStatus: '审批驳回',
				customerName: '武汉某某物流有限公司',
				projectName: '武汉园区项目',
				plateNo: '鄂A8D1Q6',
				businessDept: '业务一部',
				businessOwner: '周经理',
				deliveryTime: '2026-01-15',
				returnTime: '2026-02-16',
				returnPerson: '蒋还车'
			}
		]);
	var tableDataAll = tableDataState[0];
	var setTableDataAll = tableDataState[1];

	var contractOptions = useMemo(function () {
		var map = {};
		tableDataAll.forEach(function (r) { map[r.contractCode] = true; });
		return Object.keys(map).map(function (v) { return { value: v, label: v }; });
	}, [tableDataAll]);
	var customerOptions = useMemo(function () {
		var map = {};
		tableDataAll.forEach(function (r) { map[r.customerName] = true; });
		return Object.keys(map).map(function (v) { return { value: v, label: v }; });
	}, [tableDataAll]);
	var projectOptions = useMemo(function () {
		var map = {};
		tableDataAll.forEach(function (r) { map[r.projectName] = true; });
		return Object.keys(map).map(function (v) { return { value: v, label: v }; });
	}, [tableDataAll]);
	var plateOptions = useMemo(function () {
		var map = {};
		tableDataAll.forEach(function (r) { map[r.plateNo] = true; });
		return Object.keys(map).map(function (v) { return { value: v, label: v }; });
	}, [tableDataAll]);

	var filtersState = useState({
		contractCode: undefined,
		customerName: undefined,
		projectName: undefined,
		plateNo: undefined,
		returnDateRange: null,
		approvalStatus: undefined
	});
	var filters = filtersState[0];
	var setFilters = filtersState[1];
var filterMoreOpenState = useState(false);

	function resetFilters() {
		setFilters({
			contractCode: undefined,
			customerName: undefined,
			projectName: undefined,
			plateNo: undefined,
			returnDateRange: null,
			approvalStatus: undefined
		});
	}

	function inReturnRange(returnTimeStr, range) {
		if (!range || !range[0] || !range[1]) return true;
		var s = new Date(String(range[0]).replace(/-/g, '/'));
		var e = new Date(String(range[1]).replace(/-/g, '/'));
		var d = new Date(String(returnTimeStr || '').replace(/-/g, '/'));
		if (isNaN(s.getTime()) || isNaN(e.getTime()) || isNaN(d.getTime())) return true;
		var ms = d.getTime();
		return ms >= s.getTime() && ms <= (e.getTime() + 24 * 60 * 60 * 1000 - 1);
	}

	var filteredData = useMemo(function () {
		return (tableDataAll || []).filter(function (r) {
			if (filters.contractCode && r.contractCode !== filters.contractCode) return false;
			if (filters.customerName && r.customerName !== filters.customerName) return false;
			if (filters.projectName && r.projectName !== filters.projectName) return false;
			if (filters.plateNo && r.plateNo !== filters.plateNo) return false;
			if (filters.approvalStatus && r.approvalStatus !== filters.approvalStatus) return false;
			if (!inReturnRange(r.returnTime, filters.returnDateRange)) return false;
			return true;
		});
	}, [tableDataAll, filters]);

var billModalOpenState = useState(false);
var billModalModeState = useState('export'); // generate | export
var billRowState = useState(null);

var requirementModalOpenState = useState(false);
var requirementDocContent = useMemo(function () {
	return (`一个「数字化资产ONEOS运管平台」中的「还车应结款」模块
#面包屑：财务管理-还车应结款

1.筛选；
1.1.合同编号：选择器，支持输入框内输入合同编号模糊搜索下拉显示匹配项；
1.2.客户名称：选择器，支持输入框内输入客户名称模糊搜索下拉显示匹配项；
1.3.项目名称：选择器，支持输入框内输入项目名称模糊搜索下拉显示匹配项；
1.4.车牌号：选择器，支持输入框内输入车牌号模糊搜索下拉显示匹配项；
1.5.还车时间：日期选择器，支持单输入框双日历选择开始-结束日期，精确至日；
1.6.审批状态：选择器，分为待提交、待审批、审批中、审批完成、审批驳回、撤回；

2.还车应结款列表：右侧为导出；
2.1.合同编号：显示合同编号；
2.2.提交情况（合并表头）：分为安全组、业务服务组、运维组、能源组，内容为各组提交人姓名，前方为已提交/未提交图标；
2.3.审批状态：待提交、待审批、审批中、审批完成、审批驳回、撤回；
    2.3.1.待提交：未完成4部门提交也未提交审批；
    2.3.2.待审批：已提交审批，但没有任意节点进行审批；
    2.3.3.审批中：已提交审批，已有节点完成审批，但未完成最终节点审批；
    2.3.4.审批完成：已提交审批，并完成最终节点审批；
    2.3.5.审批驳回：已提交审批，但在任意节点被驳回；
    2.3.6.撤回：已提交审批，但在最终节点审批完成前主动撤回；
2.4.客户名称：显示合同对应客户名称；
2.5.项目名称：显示合同对应项目名称；
2.6.车牌号：显示合同对应车牌号；
2.7.业务部门：显示合同对应业务部门；
2.8.业务负责人：显示合同对应业务负责人；
2.9.交车时间：显示该车辆交车时间，格式为：YYYY-MM-DD HH:MM；
2.10.还车时间：显示该车辆还车时间，格式为：YYYY-MM-DD HH:MM；
2.11.还车人：显示该车辆还车人姓名；
2.12.操作：查看、生成账单、费用明细、撤回；
     2.12.1.查看：点击跳转还车应结款-查看页面；
     2.12.2.生成账单：点击生成账单，弹框显示账单界面，审批状态为待审批的记录才可生成账单，其他状态生成账单隐藏；
     2.12.3.费用明细：点击跳转还车应结款-费用明细页面，审批状态为待审批、审批中、审批完成时，不显示费用明细；
     2.12.4.撤回：审批状态为待审批、审批中时，不显示费用明细点击二次确认，提示：是否确认撤回，点击确定后，提示：撤回成功，同时审批状态修改为撤回；
2.13.右下角为分页符，支持单页查看数据条数；
`);
}, []);

	var billDetail = useMemo(function () {
		var row = billRowState[0] || (filteredData && filteredData[0]) || (tableDataAll && tableDataAll[0]) || {};
		var customerName = row.customerName || '广州毅斌物流有限公司';
		var plateNo = row.plateNo || '粤AGP6579';
		var deliveryTime = fmtYMDHM(row.deliveryTime || '2025-07-21 00:00');
		var returnTime = fmtYMDHM(row.returnTime || '2025-10-01 00:00');
		var billDate = fmtYMD(new Date());

		var feeRows = [
			{ item: '违章处理违约金', amount: '0.00' },
			{ item: '保险上浮', amount: '0.00' },
			{ item: 'ETC-客', amount: '100.00' },
			{ item: 'ETC卡缺损费', amount: '0.00' },
			{ item: 'ETC设备缺损费', amount: '0.00' },
			{ item: '租金', amount: '0.00' },
			{ item: '电费—客', amount: '0.00' },
			{ item: '氢气费—客', amount: '0.00' },
			{ item: '退还车氢量差', amount: '284.54' },
			{ item: '能源费补缴', amount: '0.00' },
			{ item: '能源费退款', amount: '0.00' },
			{ item: '清洗费', amount: '0.00' },
			{ item: '未结算保养费', amount: '372.50' },
			{ item: '未结算维修费', amount: '0.00' },
			{ item: '车损费', amount: '0.00' },
			{ item: '工具损坏或丢失费', amount: '0.00' },
			{ item: '证件费', amount: '0.00' },
			{ item: '广告损坏费', amount: '0.00' },
			{ item: '轮胎磨损费', amount: '0.00' }
		];
		var total = feeRows.reduce(function (s, r) { return s + (parseFloat(r.amount) || 0); }, 0);
		var depositPaid = 2000.00;
		var refund = Math.max(0, depositPaid - total);
		var pay = Math.max(0, total - depositPaid);

		return {
			customerName: customerName,
			billDate: billDate,
			vehicle: { seq: 1, plateNo: plateNo, deliveryTime: deliveryTime, returnTime: returnTime },
			feeRows: feeRows,
			total: fmtMoney(total),
			depositPaid: fmtMoney(depositPaid),
			pendingSettle: fmtMoney(total),
			refund: fmtMoney(refund),
			pay: fmtMoney(pay)
		};
	}, [billRowState[0], filteredData, tableDataAll]);

	function openBillModal(mode, row) {
		billModalModeState[1](mode);
		billRowState[1](row || null);
		billModalOpenState[1](true);
	}

	function printBill() {
		try {
			var el = document.getElementById('bill-print-area');
			if (!el) { message.error('未找到可打印区域'); return; }
			var w = window.open('', '_blank');
			if (!w) { message.error('浏览器拦截了新窗口，请允许弹窗后重试'); return; }
			var style = [
				'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;color:#000;padding:24px;}',
				'table{width:100%;border-collapse:collapse;}',
				'th,td{border:1px solid #d9d9d9;padding:8px 10px;font-size:12px;vertical-align:top;}',
				'th{background:#0f6b2d;color:#fff;font-weight:600;}',
				'.t-center{text-align:center;} .t-right{text-align:right;}',
				'.muted{color:#666;}'
			].join('');
			w.document.open();
			w.document.write('<!doctype html><html><head><meta charset="utf-8"/><title>账单明细</title><style>' + style + '</style></head><body>' + el.innerHTML + '</body></html>');
			w.document.close();
			w.focus();
			w.print();
		} catch (e) {
			message.error('打印失败（原型）：' + (e && e.message ? e.message : '未知错误'));
		}
	}

	var pageState = useState({ current: 1, pageSize: 20 });
	var page = pageState[0];
	var setPage = pageState[1];

	useMemo(function () {
		if (page.current !== 1) setPage(function (p) { return Object.assign({}, p, { current: 1 }); });
		return null;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters.contractCode, filters.customerName, filters.projectName, filters.plateNo, filters.approvalStatus, filters.returnDateRange]);

	function handleView(row) {
		message.info('跳转：还车应结款-查看（原型） 合同编号：' + (row && row.contractCode));
	}
	function handleFeeDetail(row) {
		message.info('跳转：还车应结款-费用明细（原型） 合同编号：' + (row && row.contractCode));
	}
	function handleGenerateBill(row) {
		openBillModal('generate', row);
	}
	function handleRevoke(row) {
		Modal.confirm({
			title: '撤回确认',
			content: '是否确认撤回？',
			okText: '确定',
			cancelText: '取消',
			onOk: function () {
				setTableDataAll(function (p) {
					return (p || []).map(function (r) {
						if (!row || r.key !== row.key) return r;
						var n = {}; for (var k in r) n[k] = r[k];
						n.approvalStatus = '撤回';
						return n;
					});
				});
				message.success('撤回成功');
			}
		});
	}

	var columns = useMemo(function () {
		return [
			{ title: '合同编号', dataIndex: 'contractCode', key: 'contractCode', width: 170, fixed: 'left', ellipsis: true },
			{
				title: '提交情况',
				key: 'submitGroup',
				children: [
					{
						title: '安全组',
						key: 'submitSafety',
						width: 140,
						render: function (_, r) { return SubmitCell(r.submitSafety && r.submitSafety.ok, r.submitSafety && r.submitSafety.name); }
					},
					{
						title: '业务服务组',
						key: 'submitBusiness',
						width: 140,
						render: function (_, r) { return SubmitCell(r.submitBusiness && r.submitBusiness.ok, r.submitBusiness && r.submitBusiness.name); }
					},
					{
						title: '运维组',
						key: 'submitOperation',
						width: 140,
						render: function (_, r) { return SubmitCell(r.submitOperation && r.submitOperation.ok, r.submitOperation && r.submitOperation.name); }
					},
					{
						title: '能源组',
						key: 'submitEnergy',
						width: 140,
						render: function (_, r) { return SubmitCell(r.submitEnergy && r.submitEnergy.ok, r.submitEnergy && r.submitEnergy.name); }
					}
				]
			},
			{ title: '审批状态', dataIndex: 'approvalStatus', key: 'approvalStatus', width: 110 },
			{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 180, ellipsis: true },
			{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 160, ellipsis: true },
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 110 },
			{ title: '业务部门', dataIndex: 'businessDept', key: 'businessDept', width: 110 },
			{ title: '业务负责人', dataIndex: 'businessOwner', key: 'businessOwner', width: 110 },
			{ title: '交车时间', dataIndex: 'deliveryTime', key: 'deliveryTime', width: 160, render: function (v) { return fmtYMDHM(v); } },
			{ title: '还车时间', dataIndex: 'returnTime', key: 'returnTime', width: 160, render: function (v) { return fmtYMDHM(v); } },
			{ title: '还车人', dataIndex: 'returnPerson', key: 'returnPerson', width: 110 },
			{
				title: '操作',
				key: 'action',
				width: 220,
				fixed: 'right',
				render: function (_, r) {
					var st = String(r && r.approvalStatus);
					var showFeeDetail = !(st === '待审批' || st === '审批中' || st === '审批完成');
					var showRevoke = (st === '待审批' || st === '审批中');
					var showGenerateBill = String(r && r.approvalStatus) === '待审批';
					return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 8 } },
						React.createElement(Button, { type: 'link', size: 'small', onClick: function () { handleView(r); } }, '查看'),
						showGenerateBill ? React.createElement(Button, { type: 'link', size: 'small', onClick: function () { handleGenerateBill(r); } }, '生成账单') : null,
						showFeeDetail ? React.createElement(Button, { type: 'link', size: 'small', onClick: function () { handleFeeDetail(r); } }, '费用明细') : null,
						showRevoke ? React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function () { handleRevoke(r); } }, '撤回') : null
					);
				}
			}
		];
	}, []);

return React.createElement('div', { style: layoutStyle },
	React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
		React.createElement(Breadcrumb, { items: [{ title: '财务管理' }, { title: '还车应结款' }] }),
		React.createElement(Button, { type: 'link', onClick: function () { requirementModalOpenState[1](true); } }, '查看需求说明')
	),

		React.createElement(Card, { title: '筛选', style: cardStyle },
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 } },
				React.createElement('div', null,
					React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, '合同编号'),
					React.createElement(Select, {
						value: filters.contractCode,
						options: contractOptions,
						allowClear: true,
						placeholder: '请输入或选择合同编号',
						showSearch: true,
						filterOption: filterOption,
						style: { width: '100%' },
						onChange: function (v) { setFilters(function (p) { return Object.assign({}, p, { contractCode: v }); }); }
					})
				),
				React.createElement('div', null,
					React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, '客户名称'),
					React.createElement(Select, {
						value: filters.customerName,
						options: customerOptions,
						allowClear: true,
						placeholder: '请输入或选择客户名称',
						showSearch: true,
						filterOption: filterOption,
						style: { width: '100%' },
						onChange: function (v) { setFilters(function (p) { return Object.assign({}, p, { customerName: v }); }); }
					})
				),
				React.createElement('div', null,
					React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, '项目名称'),
					React.createElement(Select, {
						value: filters.projectName,
						options: projectOptions,
						allowClear: true,
						placeholder: '请输入或选择项目名称',
						showSearch: true,
						filterOption: filterOption,
						style: { width: '100%' },
						onChange: function (v) { setFilters(function (p) { return Object.assign({}, p, { projectName: v }); }); }
					})
				)
				,
				filterMoreOpenState[0] ? React.createElement(React.Fragment, null,
					React.createElement('div', null,
						React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, '车牌号'),
						React.createElement(Select, {
							value: filters.plateNo,
							options: plateOptions,
							allowClear: true,
							placeholder: '请输入或选择车牌号',
							showSearch: true,
							filterOption: filterOption,
							style: { width: '100%' },
							onChange: function (v) { setFilters(function (p) { return Object.assign({}, p, { plateNo: v }); }); }
						})
					),
					React.createElement('div', null,
						React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, '还车时间'),
						React.createElement(RangePicker, {
							value: filters.returnDateRange,
							allowClear: true,
							style: { width: '100%' },
							placeholder: ['请选择开始日期', '请选择结束日期'],
							onChange: function (v) { setFilters(function (p) { return Object.assign({}, p, { returnDateRange: v }); }); }
						})
					),
					React.createElement('div', null,
						React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, '审批状态'),
						React.createElement(Select, {
							value: filters.approvalStatus,
							options: approvalStatusOptions,
							allowClear: true,
							placeholder: '请选择审批状态',
							style: { width: '100%' },
							onChange: function (v) { setFilters(function (p) { return Object.assign({}, p, { approvalStatus: v }); }); }
						})
					)
				) : null
			),
			React.createElement('div', { style: { marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 } },
				React.createElement(Button, { type: 'link', onClick: function () { filterMoreOpenState[1](!filterMoreOpenState[0]); } }, filterMoreOpenState[0] ? '收起' : '展开'),
				React.createElement(Button, { onClick: resetFilters }, '重置'),
				React.createElement(Button, { type: 'primary', onClick: function () { message.success('已查询（原型）'); } }, '查询')
			)
		),

		React.createElement(Card, {
			title: '还车应结款列表',
			style: cardStyle,
			extra: React.createElement('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 8 } },
				React.createElement(Button, { onClick: function () { openBillModal('export', (filteredData && filteredData[0]) || null); } }, '导出')
			)
		},
			React.createElement(Table, {
				rowKey: 'key',
				columns: columns,
				dataSource: filteredData,
				bordered: true,
				size: 'middle',
				scroll: { x: 1650 },
				pagination: {
					current: page.current,
					pageSize: page.pageSize,
					showSizeChanger: true,
					pageSizeOptions: ['20', '50', '100'],
					showQuickJumper: true,
					total: (filteredData || []).length,
					showTotal: function (t) { return '共 ' + t + ' 条'; },
					onChange: function (c, s) { setPage({ current: c, pageSize: s }); }
				}
			})
		),

		React.createElement(Modal, {
			open: billModalOpenState[0],
			onCancel: function () { billModalOpenState[1](false); },
			footer: React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
				React.createElement(Button, { type: 'primary', onClick: printBill }, '打印'),
				React.createElement(Button, { onClick: function () { billModalOpenState[1](false); } }, '返回')
			),
			title: (billModalModeState[0] === 'generate' ? '生成账单' : '导出账单'),
			width: 980
		},
			React.createElement('div', { id: 'bill-print-area' },
				React.createElement('div', { style: { fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 18 } }, '车辆退车结算明细'),
				React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 } },
					React.createElement('div', null, React.createElement('span', { style: { fontWeight: 600 } }, '客户名称：'), billDetail.customerName),
					React.createElement('div', null, React.createElement('span', { style: { fontWeight: 600 } }, '账单生成日期：'), billDetail.billDate)
				),
				React.createElement('table', null,
					React.createElement('thead', null,
						React.createElement('tr', null,
							React.createElement('th', { className: 't-center', style: { width: 60 } }, '序号'),
							React.createElement('th', { className: 't-center', style: { width: 120 } }, '车牌'),
							React.createElement('th', { className: 't-center', style: { width: 120 } }, '交车日期'),
							React.createElement('th', { className: 't-center', style: { width: 120 } }, '退车日期'),
							React.createElement('th', { className: 't-center' }, '费用科目'),
							React.createElement('th', { className: 't-center', style: { width: 140 } }, '待结算费用')
						)
					),
					React.createElement('tbody', null,
						(billDetail.feeRows || []).map(function (r, idx) {
							var rowspan = (billDetail.feeRows || []).length + 1;
							return React.createElement('tr', { key: 'fee-' + idx },
								idx === 0 ? React.createElement('td', { rowSpan: rowspan, className: 't-center' }, String(billDetail.vehicle.seq || 1)) : null,
								idx === 0 ? React.createElement('td', { rowSpan: rowspan, className: 't-center' }, billDetail.vehicle.plateNo) : null,
								idx === 0 ? React.createElement('td', { rowSpan: rowspan, className: 't-center' }, fmtYMDHM(billDetail.vehicle.deliveryTime)) : null,
								idx === 0 ? React.createElement('td', { rowSpan: rowspan, className: 't-center' }, fmtYMDHM(billDetail.vehicle.returnTime)) : null,
								React.createElement('td', null, r.item),
								React.createElement('td', { className: 't-right' }, fmtMoney(r.amount))
							);
						}),
						React.createElement('tr', { key: 'fee-total', style: { background: '#f6f7f8' } },
							React.createElement('td', { style: { fontWeight: 700 } }, '合计'),
							React.createElement('td', { className: 't-right', style: { fontWeight: 700 } }, billDetail.total)
						)
					)
				),
				React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 10, marginTop: 18, fontSize: 13 } },
					React.createElement('div', null, React.createElement('span', { style: { fontWeight: 600 } }, '已支付保证金：'), billDetail.depositPaid),
					React.createElement('div', null, React.createElement('span', { style: { fontWeight: 600 } }, '待结算费用：'), billDetail.pendingSettle),
					React.createElement('div', null, React.createElement('span', { style: { fontWeight: 600 } }, '应退款：'), billDetail.refund),
					React.createElement('div', null, React.createElement('span', { style: { fontWeight: 600 } }, '应缴纳：'), billDetail.pay)
				)
			)
		),
		React.createElement(Modal, {
			open: requirementModalOpenState[0],
			onCancel: function () { requirementModalOpenState[1](false); },
			onOk: function () { requirementModalOpenState[1](false); },
			title: '需求说明',
			width: 860
		},
			React.createElement('div', { style: { maxHeight: '70vh', overflow: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#333' } }, requirementDocContent)
		)
	);
};

// 【重要】必须使用 const Component 作为组件变量名
// 财务管理 - 还车应结款

// （历史残留）费用明细页代码误追加到本文件，为避免重复声明 Component，改名保留但不再作为入口组件使用
const ComponentFeeDetail = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;
	var useEffect = React.useEffect;
	var useRef = React.useRef;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Table = antd.Table;
	var Button = antd.Button;
	var Input = antd.Input;
	var Modal = antd.Modal;
	var Tooltip = antd.Tooltip;
	var Popover = antd.Popover;
	var message = antd.message;

	var TextArea = Input.TextArea;

	function RequiredLabel(text) {
		return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } },
			React.createElement('span', { style: { color: '#f5222d', fontWeight: 600 } }, '*'),
			React.createElement('span', null, text)
		);
	}

	function formatDateTimeNow() {
		var d = new Date();
		var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
		return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
	}

	function toFixed2(v) {
		if (v === null || v === undefined || v === '') return '';
		var n = typeof v === 'number' ? v : parseFloat(v);
		return isNaN(n) ? '' : n.toFixed(2);
	}

	// 页面样式
	var layoutStyle = { padding: '16px 24px 88px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var footerStyle = { position: 'fixed', left: 0, right: 0, bottom: 0, background: '#fff', borderTop: '1px solid #f0f0f0', padding: '12px 24px', display: 'flex', justifyContent: 'flex-start', gap: 12, zIndex: 10 };

	// 还车车辆明细（单车示例）
	var vehicleDetail = useMemo(function () {
		return [{
			key: 'v1',
			plateNo: '粤AGP5621',
			contractCode: 'LNZLHT20251106001',
			projectName: '嘉兴腾4.5T租赁',
			customerName: '嘉兴某某物流有限公司',
			deliveryTime: '2026-02-01',
			returnTime: '2026-02-27',
			fragileInsurance: '是',
			tireInsurance: '否',
			maintenanceInsurance: '是'
		}];
	}, []);

	var insuranceFlags = useMemo(function () {
		var v = (vehicleDetail && vehicleDetail[0]) || {};
		return {
			hasFragileInsurance: String(v.fragileInsurance || '') === '是',
			hasTireInsurance: String(v.tireInsurance || '') === '是',
			hasMaintenanceInsurance: String(v.maintenanceInsurance || '') === '是'
		};
	}, [vehicleDetail]);

	// 费用统计
	var statsState = useState({
		depositAmount: '5000.00',
		pendingSettleAmount: '0.00',
		shouldRefundAmount: '800.00',
		shouldPayAmount: '400.00'
	});
	var stats = statsState[0];

	// 通用折叠区块（展开/收起图标）
	var CollapseSection = function (props) {
		var collapsed = props.collapsed;
		var setCollapsed = props.setCollapsed;
		var title = props.title;
		var extra = props.extra;
		var headerActions = props.headerActions;
		return React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 12, overflow: 'hidden' } },
			React.createElement('div', {
				style: { padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: '#fff' },
				onClick: function () { setCollapsed(!collapsed); }
			},
				React.createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, title),
				React.createElement('div', { style: { flex: 1 } }),
				extra ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, color: '#666', fontSize: 13 } }, extra) : null,
				headerActions ? React.createElement('div', { onClick: function (e) { e.stopPropagation(); }, style: { display: 'inline-flex', alignItems: 'center', gap: 8 } }, headerActions) : null,
				collapsed
					? React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, style: { display: 'block', color: '#666' } }, React.createElement('path', { d: 'M6 9l6 6 6-6' }))
					: React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, style: { display: 'block', color: '#666' } }, React.createElement('path', { d: 'M18 15l-6-6-6 6' }))
			),
			collapsed ? null : React.createElement('div', { style: { padding: '12px 16px', borderTop: '1px solid #f0f0f0' } }, props.children)
		);
	};

	// 业务服务组
	var businessServiceFixedItems = ['违章处理违约金', '保险上浮', 'ETC-客户未缴费用', 'ETC卡缺损费', 'ETC设备缺损费'];
	var businessServiceRowsState = useState(
		businessServiceFixedItems.map(function (name, i) {
			return { key: 'bs-' + i, seq: i + 1, feeItem: name, amount: '', remark: '', lastUpdateTime: '', photos: [], attachments: [], fixed: true };
		})
	);
	var businessServiceRows = businessServiceRowsState[0];
	var setBusinessServiceRows = businessServiceRowsState[1];
	var businessServiceMetaState = useState({ submitBy: '', status: '待提交' });
	var businessServiceMeta = businessServiceMetaState[0];
	var setBusinessServiceMeta = businessServiceMetaState[1];
	var businessServiceCollapsedState = useState(false);

	function recalcBusinessServiceTotal(list) {
		var sum = 0;
		(list || []).forEach(function (r) { sum += (parseFloat(r.amount) || 0); });
		return sum.toFixed(2);
	}

	var businessServiceTotalComputed = useMemo(function () {
		return recalcBusinessServiceTotal(businessServiceRows || []);
	}, [businessServiceRows]);

	function calcVehicleRent(monthRent, billStartDateStr, returnDateStr) {
		var m = parseFloat(monthRent) || 0;
		if (!billStartDateStr || !returnDateStr) return '0.00';
		var s = new Date(String(billStartDateStr).replace(/-/g, '/'));
		var e = new Date(String(returnDateStr).replace(/-/g, '/'));
		if (isNaN(s.getTime()) || isNaN(e.getTime())) return '0.00';
		var msDay = 24 * 60 * 60 * 1000;
		var days = Math.floor((e.getTime() - s.getTime()) / msDay);
		if (days < 0) days = 0;
		return ((m / 30) * days).toFixed(2);
	}

	var billInfoState = useState({
		billStartDate: '2026-02-01',
		vehicleMonthRent: '9000.00',
		receivedRent: '0.00',
		actualRent: '',
		actualRentManual: false,
		shouldRefundRent: '',
		shouldRefundManual: false
	});
	var billInfo = billInfoState[0];
	var setBillInfo = billInfoState[1];

	useEffect(function () {
		if (billInfo.actualRentManual && String(billInfo.actualRent || '').trim() !== '') return;
		var returnDateStr = (vehicleDetail && vehicleDetail[0] && vehicleDetail[0].returnTime) || '';
		var calc = calcVehicleRent(billInfo.vehicleMonthRent, billInfo.billStartDate, returnDateStr);
		if (billInfo.actualRent !== calc) {
			setBillInfo(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.actualRent = calc; return n; });
		}
	}, [billInfo.vehicleMonthRent, billInfo.billStartDate, billInfo.actualRentManual, vehicleDetail]);

	useEffect(function () {
		if (billInfo.shouldRefundManual && String(billInfo.shouldRefundRent || '').trim() !== '') return;
		var received = parseFloat(billInfo.receivedRent) || 0;
		var actual = parseFloat(billInfo.actualRent) || 0;
		var calc = (received - actual).toFixed(2);
		if (billInfo.shouldRefundRent !== calc) {
			setBillInfo(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.shouldRefundRent = calc; return n; });
		}
	}, [billInfo.receivedRent, billInfo.actualRent, billInfo.shouldRefundManual]);

	var addBusinessServiceRow = useCallback(function () {
		setBusinessServiceRows(function (p) {
			var next = p.slice();
			var i = next.length + 1;
			next.push({ key: 'bs-new-' + Date.now(), seq: i, feeItem: '', amount: '', remark: '', lastUpdateTime: '', photos: [], attachments: [], fixed: false });
			return next.map(function (r, idx) { var o = {}; for (var k in r) o[k] = r[k]; o.seq = idx + 1; return o; });
		});
	}, []);
	var removeBusinessServiceRow = useCallback(function (key) {
		setBusinessServiceRows(function (p) {
			var next = p.filter(function (r) { return r.key !== key; });
			return next.map(function (r, idx) { var o = {}; for (var k in r) o[k] = r[k]; o.seq = idx + 1; return o; });
		});
	}, []);

	var updateBusinessServiceRow = useCallback(function (key, field, value) {
		setBusinessServiceRows(function (p) {
			var next = p.map(function (r) {
				if (r.key !== key) return r;
				var n = {}; for (var k in r) n[k] = r[k];
				n[field] = value;
				return n;
			});
			return next;
		});
	}, []);

	var handleBusinessServiceSave = useCallback(function () {
		setBusinessServiceMeta(function (m) { var nm = {}; for (var k in m) nm[k] = m[k]; nm.status = '待提交'; return nm; });
		message.success('已保存');
	}, []);

	var handleBusinessServiceSubmit = useCallback(function () {
		Modal.confirm({
			title: '提交确认',
			content: '请确认业务服务组金额填写无误，点击确认完成提交。',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				setBusinessServiceRows(function (p) {
					var now = formatDateTimeNow();
					return p.map(function (r) { var n = {}; for (var k in r) n[k] = r[k]; n.lastUpdateTime = now; return n; });
				});
				setBusinessServiceMeta(function (m) { var nm = {}; for (var k in m) nm[k] = m[k]; nm.status = '已提交'; nm.submitBy = '业务服务组-张三'; return nm; });
				message.success('已提交');
			}
		});
	}, []);

	var handleBusinessServiceRevoke = useCallback(function () {
		Modal.confirm({
			title: '撤回确认',
			content: '是否确认撤回？',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				setBusinessServiceMeta(function (m) { var nm = {}; for (var k in m) nm[k] = m[k]; nm.status = '待提交'; return nm; });
				message.success('已撤回，可重新编辑并保存/提交');
			}
		});
	}, []);

	// 能源采购组
	var energyState = useState({
		deliveryHydrogen: '85.00',
		returnHydrogen: '72.00',
		hydrogenUnitPrice: '35.00',
		hydrogenSupplement: '455.00',
		hydrogenFee: '',
		electricFee: '',
		prepayRefund: '',
		userBalance: '1200.00'
	});
	var energy = energyState[0];
	var setEnergy = energyState[1];
	var energyMetaState = useState({ submitBy: '', status: '待提交' });
	var energyMeta = energyMetaState[0];
	var setEnergyMeta = energyMetaState[1];
	var energyCollapsedState = useState(false);

	function recalcEnergyTotal(e) {
		var a = parseFloat((e && e.hydrogenSupplement) || '') || 0;
		var b = parseFloat((e && e.hydrogenFee) || '') || 0;
		var c = parseFloat((e && e.electricFee) || '') || 0;
		return (a + b + c).toFixed(2);
	}

	var energyTotalComputed = useMemo(function () { return recalcEnergyTotal(energy); }, [energy.hydrogenSupplement, energy.hydrogenFee, energy.electricFee]);

	useEffect(function () {
		var d = parseFloat(energy.deliveryHydrogen) || 0;
		var r = parseFloat(energy.returnHydrogen) || 0;
		var u = parseFloat(energy.hydrogenUnitPrice) || 0;
		if (d > r) {
			var calc = ((d - r) * u).toFixed(2);
			if (energy.hydrogenSupplement !== calc) {
				setEnergy(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.hydrogenSupplement = calc; return n; });
			}
		}
	}, [energy.deliveryHydrogen, energy.returnHydrogen, energy.hydrogenUnitPrice]);

	// energy 总金额使用 energyTotalComputed 派生，避免输入时额外 setState 造成丢焦

	var handleEnergySave = useCallback(function () {
		setEnergyMeta(function (m) { var nm = {}; for (var k in m) nm[k] = m[k]; nm.status = '待提交'; return nm; });
		message.success('能源采购组已保存');
	}, [energy]);
	var handleEnergySubmit = useCallback(function () {
		Modal.confirm({
			title: '提交确认',
			content: '请确认能源采购组金额填写无误，点击确认完成提交。',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				setEnergyMeta(function (m) { var nm = {}; for (var k in m) nm[k] = m[k]; nm.submitBy = '能源采购组-李四'; nm.status = '已提交'; return nm; });
				message.success('能源采购组已提交');
			}
		});
	}, [energy]);
	var handleEnergyRevoke = useCallback(function () {
		Modal.confirm({
			title: '撤回确认',
			content: '是否确认撤回？',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				setEnergyMeta(function (m) { var nm = {}; for (var k in m) nm[k] = m[k]; nm.status = '待提交'; return nm; });
				message.success('能源采购组已撤回，可重新编辑并保存/提交');
			}
		});
	}, []);

	// 运维部
	var operationFixedItems = ['清洗费', '未结算保养', '未结算维修', '车损费用', '工具损坏丢失费用', '证件丢失费用', '广告损坏丢失费用', '送车服务费', '接车服务费', '轮胎磨损费用'];
	var operationRowsState = useState(
		operationFixedItems.map(function (name, i) {
			return { key: 'op-' + i, seq: i + 1, feeItem: name, amount: '', worryFreeDiscount: '', remark: '', lastUpdateTime: '', photos: [], attachments: [], fixed: true };
		})
	);
	var operationRows = operationRowsState[0];
	var setOperationRows = operationRowsState[1];
	var operationMetaState = useState({ submitBy: '', status: '待提交' });
	var operationMeta = operationMetaState[0];
	var setOperationMeta = operationMetaState[1];
	var operationCollapsedState = useState(false);

	function recalcOperationTotal(list) {
		var sum = 0;
		(list || []).forEach(function (r) { sum += (parseFloat(r.amount) || 0); });
		return sum.toFixed(2);
	}

	var operationTotalComputed = useMemo(function () {
		return recalcOperationTotal(operationRows || []);
	}, [operationRows]);

	// 轮胎胎纹明细（原型 mock：10个轮胎 + 1个备胎，共11条）
	var tireTreadList = useMemo(function () {
		var unit = 25; // 元/mm
		var rows = [
			{ key: 't1', name: '左前轮', deliveryDepth: '6.8', returnDepth: '6.2' },
			{ key: 't2', name: '左后轮（内）', deliveryDepth: '6.7', returnDepth: '6.0' },
			{ key: 't3', name: '左后轮（外）', deliveryDepth: '6.6', returnDepth: '6.1' },
			{ key: 't4', name: '右前轮', deliveryDepth: '6.9', returnDepth: '6.4' },
			{ key: 't5', name: '右后轮（内）', deliveryDepth: '6.5', returnDepth: '6.0' },
			{ key: 't6', name: '右后轮（外）', deliveryDepth: '6.8', returnDepth: '6.3' },
			{ key: 't7', name: '左中轮', deliveryDepth: '6.7', returnDepth: '6.2' },
			{ key: 't8', name: '右中轮', deliveryDepth: '6.6', returnDepth: '6.1' },
			{ key: 't9', name: '左后备位轮', deliveryDepth: '6.9', returnDepth: '6.5' },
			{ key: 't10', name: '右后备位轮', deliveryDepth: '6.4', returnDepth: '6.0' },
			{ key: 'spare', name: '备胎', deliveryDepth: '7.0', returnDepth: '7.0' }
		];
		var deliverySum = 0;
		var returnSum = 0;
		rows.forEach(function (r) { deliverySum += (parseFloat(r.deliveryDepth) || 0); returnSum += (parseFloat(r.returnDepth) || 0); });
		var shouldCalc = returnSum <= deliverySum;
		return rows.map(function (r) {
			var d = parseFloat(r.deliveryDepth) || 0;
			var rr = parseFloat(r.returnDepth) || 0;
			var diff = shouldCalc ? Math.max(0, d - rr) : 0;
			var total = shouldCalc ? (diff * unit) : 0;
			return {
				key: r.key,
				name: r.name,
				deliveryDepth: d.toFixed(2),
				returnDepth: rr.toFixed(2),
				diff: diff.toFixed(2),
				unitPrice: unit.toFixed(2),
				totalAmount: total.toFixed(2)
			};
		});
	}, []);

	var tireWearTotal = useMemo(function () {
		var sum = 0;
		(tireTreadList || []).forEach(function (r) { sum += (parseFloat(r.totalAmount) || 0); });
		return sum.toFixed(2);
	}, [tireTreadList]);

	// 运维部自动反写/计算（原型 mock）
	var operationAuto = useMemo(function () {
		// 证件丢失费用：行驶证200、牌照300、营运证300、加氢证300
		var missingDocs = ['行驶证', '牌照']; // mock：交车有，还车无
		var map = { '行驶证': 200, '牌照': 300, '营运证': 300, '加氢证': 300 };
		var docFee = missingDocs.reduce(function (s, k) { return s + (map[k] || 0); }, 0);
		// 送车/接车服务费 mock
		var deliveryFee = 0;
		var receiveFee = 0;
		// 轮胎磨损费用：按胎纹明细汇总
		return { docLossFee: docFee.toFixed(2), deliveryServiceFee: deliveryFee.toFixed(2), receiveServiceFee: receiveFee.toFixed(2), tireWearFee: String(tireWearTotal || '0.00') };
	}, [tireWearTotal]);

	useEffect(function () {
		setOperationRows(function (p) {
			var next = p.map(function (r) {
				var n = {}; for (var k in r) n[k] = r[k];
				if (n.feeItem === '证件丢失费用') n.amount = operationAuto.docLossFee;
				if (n.feeItem === '送车服务费') n.amount = operationAuto.deliveryServiceFee;
				if (n.feeItem === '接车服务费') n.amount = operationAuto.receiveServiceFee;
				if (n.feeItem === '轮胎磨损费用' && !String(n.amount || '').trim()) n.amount = operationAuto.tireWearFee;
				return n;
			});
			return next;
		});
	}, [operationAuto.docLossFee, operationAuto.deliveryServiceFee, operationAuto.receiveServiceFee, operationAuto.tireWearFee]);

	var handleOperationSave = useCallback(function () {
		setOperationMeta(function (m) { var nm = {}; for (var k2 in m) nm[k2] = m[k2]; nm.status = '待提交'; return nm; });
		message.success('运维部已保存');
	}, []);
	var handleOperationSubmit = useCallback(function () {
		Modal.confirm({
			title: '提交确认',
			content: '请确认运维部金额填写无误，点击确认完成提交。',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				setOperationRows(function (p) {
					var now = formatDateTimeNow();
					return p.map(function (r) { var n = {}; for (var k in r) n[k] = r[k]; n.lastUpdateTime = now; return n; });
				});
				setOperationMeta(function (m) { var nm = {}; for (var k in m) nm[k] = m[k]; nm.submitBy = '运维部-王五'; nm.status = '已提交'; return nm; });
				message.success('运维部已提交');
			}
		});
	}, [operationRows]);
	var handleOperationRevoke = useCallback(function () {
		Modal.confirm({
			title: '撤回确认',
			content: '是否确认撤回？',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				setOperationMeta(function (m) { var nm = {}; for (var k in m) nm[k] = m[k]; nm.status = '待提交'; return nm; });
				message.success('运维部已撤回，可重新编辑并保存/提交');
			}
		});
	}, []);
	var addOperationRow = useCallback(function () {
		setOperationRows(function (p) {
			var next = p.slice();
			next.push({ key: 'op-new-' + Date.now(), seq: next.length + 1, feeItem: '', amount: '', worryFreeDiscount: '', remark: '', lastUpdateTime: '', photos: [], attachments: [], fixed: false });
			return next.map(function (r, idx) { var o = {}; for (var k in r) o[k] = r[k]; o.seq = idx + 1; return o; });
		});
	}, []);
	var removeOperationRow = useCallback(function (key) {
		setOperationRows(function (p) {
			var next = p.filter(function (r) { return r.key !== key; });
			return next.map(function (r, idx) { var o = {}; for (var k in r) o[k] = r[k]; o.seq = idx + 1; return o; });
		});
	}, []);
	var updateOperationRow = useCallback(function (key, field, value) {
		setOperationRows(function (p) {
			var next = p.map(function (r) {
				if (r.key !== key) return r;
				var n = {}; for (var k in r) n[k] = r[k];
				n[field] = value;
				return n;
			});
			return next;
		});
	}, []);

	// 安全组（示例数据）
	var violationList = useMemo(function () {
		return [{
			key: 'w1',
			code: 'WZ202602010001',
			plateNo: '浙F03218F',
			violationBehavior: '测试',
			violationTime: '2026-02-01',
			penaltyAmount: '100.00',
			paymentStatus: '未缴费',
			score: '6',
			handleStatus: '未处理',
			violationCustomer: '上海馨想事…',
			violationPhoto: '',
			remark: ''
		}];
	}, []);
	var accidentList = useMemo(function () {
		return [{
			key: 'a1',
			accidentCode: 'SG202508250001',
			plateNo: '京A29256F',
			accidentTime: '2025-08-25',
			accidentPlace: '北京市大…',
			accidentType: '撞固定物',
			customerName: '北京海龙…',
			ourClaimAmount: '',
			theirClaimAmount: '',
			responsibility: '全责',
			accidentStatus: '未结案',
			closeTime: '',
			otherFee: '',
			remark: ''
		}];
	}, []);
	var safetyCollapsedState = useState(false);
	var safetyMetaState = useState({ submitBy: '', status: '待提交' });
	var safetyMeta = safetyMetaState[0];
	var setSafetyMeta = safetyMetaState[1];

	var handleSafetySave = useCallback(function () {
		setSafetyMeta(function (m) { var nm = {}; for (var k in m) nm[k] = m[k]; nm.submitBy = nm.submitBy || '安全组-赵六'; nm.status = '待提交'; return nm; });
		message.success('安全组已保存');
	}, []);
	var handleSafetySubmit = useCallback(function () {
		Modal.confirm({
			title: '提交确认',
			content: '请确认安全组信息无误，点击确认完成提交。',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				setSafetyMeta(function (m) { var nm = {}; for (var k in m) nm[k] = m[k]; nm.submitBy = nm.submitBy || '安全组-赵六'; nm.status = '已提交'; return nm; });
				message.success('安全组已提交');
			}
		});
	}, []);
	var handleSafetyRevoke = useCallback(function () {
		Modal.confirm({
			title: '撤回确认',
			content: '是否确认撤回？',
			okText: '确认',
			cancelText: '取消',
			onOk: function () {
				setSafetyMeta(function (m) { var nm = {}; for (var k in m) nm[k] = m[k]; nm.status = '待提交'; return nm; });
				message.success('安全组已撤回，可重新编辑并保存/提交');
			}
		});
	}, []);

	var pendingSettleComputed = useMemo(function () {
		var bs = parseFloat(businessServiceTotalComputed) || 0;
		var rentRefund = parseFloat((billInfo && billInfo.shouldRefundRent) || '') || 0;
		var op = parseFloat(operationTotalComputed) || 0;
		var en = (parseFloat(energy.hydrogenSupplement) || 0) + (parseFloat(energy.hydrogenFee) || 0) + (parseFloat(energy.electricFee) || 0) - (parseFloat(energy.prepayRefund) || 0);
		return (bs + rentRefund + en + op).toFixed(2);
	}, [businessServiceTotalComputed, billInfo.shouldRefundRent, operationTotalComputed, energy.hydrogenSupplement, energy.hydrogenFee, energy.electricFee, energy.prepayRefund]);

	var refundTotalComputed = useMemo(function () {
		var deposit = parseFloat(stats.depositAmount) || 0;
		var settle = parseFloat(pendingSettleComputed) || 0;
		var diff = deposit - settle;
		return diff > 0 ? diff.toFixed(2) : '0.00';
	}, [stats.depositAmount, pendingSettleComputed]);

	var payTotalComputed = useMemo(function () {
		var deposit = parseFloat(stats.depositAmount) || 0;
		var settle = parseFloat(pendingSettleComputed) || 0;
		var diff = deposit - settle;
		return diff < 0 ? Math.abs(diff).toFixed(2) : '0.00';
	}, [stats.depositAmount, pendingSettleComputed]);

	function buildBreakdownContent(list) {
		var headStyle = { padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', background: '#fafafa', fontWeight: 600, fontSize: 12 };
		var tdStyle = { padding: '6px 10px', borderBottom: '1px solid #f0f0f0', fontSize: 12 };
		return React.createElement('div', { style: { padding: 0, minWidth: 320 } },
			React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: headStyle }, '费用项'),
						React.createElement('th', { style: Object.assign({}, headStyle, { textAlign: 'right' }) }, '金额(元)')
					)
				),
				React.createElement('tbody', null,
					(list || []).map(function (r) {
						return React.createElement('tr', { key: r.key },
							React.createElement('td', { style: tdStyle }, r.item),
							React.createElement('td', { style: Object.assign({}, tdStyle, { fontWeight: r.strong ? 600 : 400, textAlign: 'right' }) }, r.amount)
						);
					})
				)
			)
		);
	}

	var settleBreakdown = useMemo(function () {
		return [
			{ key: 'bs', item: '业务服务组费用项金额总和', amount: businessServiceTotalComputed || '0.00' },
			{ key: 'rent', item: '业务服务组-车辆应退租金', amount: (toFixed2(billInfo && billInfo.shouldRefundRent) || '0.00') },
			{ key: 'hDiff', item: '能源采购组-氢量差补缴金额', amount: (toFixed2(energy.hydrogenSupplement) || '0.00') },
			{ key: 'hFee', item: '能源采购组-氢费补缴金额', amount: (toFixed2(energy.hydrogenFee) || '0.00') },
			{ key: 'eFee', item: '能源采购组-电费补缴金额', amount: (toFixed2(energy.electricFee) || '0.00') },
			{ key: 'prepay', item: '能源采购组-预付款退费金额（减）', amount: '-' + (toFixed2(energy.prepayRefund) || '0.00') },
			{ key: 'op', item: '运维部费用项金额总额', amount: operationTotalComputed || '0.00' },
			{ key: 'total', item: '待结算总额', amount: pendingSettleComputed || '0.00', strong: true }
		];
	}, [businessServiceTotalComputed, billInfo.shouldRefundRent, energy.hydrogenSupplement, energy.hydrogenFee, energy.electricFee, energy.prepayRefund, operationTotalComputed, pendingSettleComputed]);

	var refundBreakdown = useMemo(function () {
		return [
			{ key: 'd', item: '保证金总额', amount: (toFixed2(stats.depositAmount) || '0.00') },
			{ key: 's', item: '待结算总额', amount: (pendingSettleComputed || '0.00') },
			{ key: 'r', item: '应退还总额', amount: (refundTotalComputed || '0.00'), strong: true }
		];
	}, [stats.depositAmount, pendingSettleComputed, refundTotalComputed]);

var payBreakdown = useMemo(function () {
		return [
			{ key: 'd', item: '保证金总额', amount: (toFixed2(stats.depositAmount) || '0.00') },
			{ key: 's', item: '待结算总额', amount: (pendingSettleComputed || '0.00') },
			{ key: 'p', item: '应补缴总额', amount: (payTotalComputed || '0.00'), strong: true }
		];
	}, [stats.depositAmount, pendingSettleComputed, payTotalComputed]);

var requirementModalOpenState = useState(false);
var requirementDocContent = useMemo(function () {
	return (`还车应结款
一个「数字化资产ONEOS运管平台」中的「还车应结款」「费用明细」模块
#面包屑：
1.财务管理-还车应结款-费用明细
每个模块为一个单独卡片：

2.还车车辆明细；
2.1.车牌号：显示还车车牌号；
2.2.合同编码：显示还车车辆合同编码；
2.3.项目名称：显示还车车辆对应项目名称；
2.4.客户名称：显示还车车辆对应客户名称；
2.5.交车时间：显示还车车辆完成交车时间；
2.6.还车时间：显示还车车辆完成还车时间；
2.7.易损保：显示还车车辆是否购买易损保，显示为是或否，后方为提示图标，文案为：提供刹车片、灯泡、蓄电池、雨刮等易损件租期内免费更换服务（不含轮胎，只限自行到服务站更换）；
2.8.轮胎保：显示还车车辆是否购买轮胎保，显示为是或否，后方为提示图标，文案为：每个租赁年度内提供1次车辆轮胎因自然磨损产生的替换服务；
2.9.养护保：显示还车车辆是否购买养护保，显示为是或否，后方为提示图标，文案为：按厂家保养要求提供定期保养服务；


3.还车费用明细：
#上方为还车费用统计数据，包括保证金总额、待结算总额、应退还总额、应补缴总额等相关信息，该部分只有业务管理组能查看；
3.1.保证金总额：显示该车辆保证金金额，格式为xx.xx元；
3.2.待结算总额：显示该车辆待结算金额，格式为xx.xx元，点击以气泡卡片列表显示：费用项、金额。计算方式为：「业务服务部所有费用项-金额总和」+「业务服务部-车辆应退租金」+「能源采购组-氢量差补缴金额」+「能源采购组-氢费补缴金额」+「能源采购组-电费补缴金额」-「能源采购组-预付款退费金额」+「运维部所有费用项-金额总额」；
3.3.应退还总额：显示该车辆应退还金额，格式为xx.xx元，点击以气泡卡片列表显示：费用项、金额。计算方式为：「保证金金额」-「待结算金额」如果是正数，则显示在应退还总额中；
3.4.应补缴总额：显示该车辆应补缴金额，格式为xx.xx元，点击以气泡卡片列表显示：费用项、金额。计算方式为：「保证金金额」-「待结算金额」如果是负数，则显示在应补缴总额中；

#下方为业务服务组、能源采购组、运维部、安全组4部分，支持展开/收起功能；
4.业务服务组：仅由业务服务组人员进行填写；标题栏标题为业务服务组，后方为：总金额、提交人、状态（待提交、已提交），该部分只有业务管理组能查看；
4.1.总金额：显示所有费用总金额；
4.2.提交人：显示提交人；
4.3.状态：分为待提交（点击保存按钮）、已提交（点击提交按钮）；
4.4.保存：点击保存已填写内容，如果已提交，则隐藏保存按钮；
4.5.提交：点击进行二次确认，提示信息：请确认业务服务组金额填写无误，点击确认完成提交。如果已提交，隐藏提交按钮；
4.6.撤回：已提交后，显示撤回按钮。点击进行二次确认，提示信息：是否确认撤回，点击确认，重新显示保存、提交按钮；

下方为列表，列表字段为：序号、费用项、金额、备注、照片、附件、操作；
4.7.序号：1、2、3....依次类推；
4.8.费用项：固定显示违章处理违约金、保险上浮、ETC-客户未缴费用、ETC卡缺损费、ETC设备缺损费，该部分不能删除；可通过点击下方新增一行，添加新的条目（该部分可删除）；
    4.8.1.违章处理违约金：
    4.8.2.保险上浮：
    4.8.3.ETC-客户未缴费用：
    4.8.4.ETC卡缺损费：
    4.8.5.ETC设备缺损费：
4.9.金额：输入框，支持2位小数，后缀为元；         
4.10.备注：文本域，支持自定义输入；
4.11.最后更新时间：显示最后更新时间，格式为：YYYY-MM-DD HH:MM；
4.12.照片：照片上传按钮，支持照片上传，支持多个附件；         
4.13.附件：附件上传按钮，文案为：上传附件，支持多个附件；         
4.14.操作：除固定费用项外，其余操作中为删除；
列表下方为车辆租金：包含本期账单已收租金、车辆实际租金、车辆应退租金；
4.15.本期账单已收租金：输入框（禁用），反写本期账单实际到账租金（从租赁账单中，首期由于未和用友YS打通，先显示为0，对接完成后显示财务实际到账金额）；
4.16.车辆实际租金：输入框（可编辑），自动计算车辆实际租金，按照：（车辆月租金/30）*（账单开始日期-还车日期总天数，取整）
4.17.车辆应退租金：输入框（可编辑），根据：本期账单已收租金-车辆实际租金计算并反写；

5.能源采购组：仅由能源采购组人员进行填写；标题栏标题为能源采购组，后方为总金额、提交人、状态（待提交、已提交），该部分只有能源采购组能查看；
5.1.总金额：显示所有费用总金额；
5.2.提交人：显示提交人；
5.3.状态：分为待提交（点击保存按钮）、已提交（点击提交按钮）；
5.4.保存：点击保存已填写内容，如果已提交，则隐藏保存按钮；
5.5.提交：点击进行二次确认，提示信息：请确认业务服务组金额填写无误，点击确认完成提交。如果已提交，隐藏提交按钮；
5.6.撤回：已提交后，显示撤回按钮。点击进行二次确认，提示信息：是否确认撤回，点击确认，重新显示保存、提交按钮；
下方为填写表单：
5.7.氢量差补缴金额：输入框，支持2位小数，后缀为元，如果交车氢量＞还车氢量时，根据“差额*退还车氢气单价”自动计算。
5.8.交车氢量：格式为：xx.xxMPa，保留2位小数，从该车辆交车在该合同交车时间氢量获取；
5.9.还车氢量：格式为：xx.xxMPa，保留2位小数，从该车辆交车在该合同还车时间氢量获取；
5.10.退还车氢气单价：xx.xx元，从车辆租赁合同中获取；
5.11.能源费补缴金额：右侧为2个输入框，分别为氢费补缴金额、电费补缴金额，支持2位小数，后缀为元；
5.12.预付款退费金额：输入框，支持2位小数，后缀为元；输入框下方显示项目预充值余额；

6.运维部：仅由运维部人员进行填写；标题栏标题为运维部，后方为总金额、提交人、状态（待提交、已提交），该部分只有运维部能查看；
6.1.总金额：显示运维部所有费用项费用金额总额；
6.2.提交人：显示提交人；
6.3.状态：分为待提交（点击保存按钮）、已提交（点击提交按钮）；
6.4.保存：点击保存已填写内容，如果已提交，则隐藏保存按钮；
6.5.提交：点击进行二次确认，提示信息：请确认业务服务组金额填写无误，点击确认完成提交。如果已提交，隐藏提交按钮；
6.6.撤回：已提交后，显示撤回按钮。点击进行二次确认，提示信息：是否确认撤回，点击确认，重新显示保存、提交按钮；
下方为列表：
6.7.序号：1、2、3....依次类推；
6.8.费用项：固定显示项为：
    6.8.1.清洗费：输入框手动填写；
    6.8.2.未结算保养：输入框手动填写；
    6.8.3.未结算维修：输入框手动填写；
    6.8.4.车损费用：输入框手动填写；
    6.8.5.工具损坏丢失费用：输入框手动填写；
    6.8.6.证件丢失费用：输入框，自动计算金额，交车时做备车检查时有，还车时无得证件自动计算费用，计算标准为：行驶证：200元，牌照：300元，营运证：300元，加氢证：300元；如所有证件无丢失，或交车时就为无则不进行计算；
    6.8.7.广告损坏丢失费用：输入框手动填写；
    6.8.8.送车服务费：输入框（禁用），反写交车时送车服务费，如无则显示为0；
    6.8.9.接车服务费：输入框（禁用），反写还车时接车服务费，如无则显示为0；
    6.8.10.轮胎磨损费用：输入框（可编辑），轮胎磨损费用（元/mm）*（交车时所有轮胎及备胎胎纹深度-还车时所有轮胎及备胎胎纹深度）自动计算，此外如还车胎纹总额大于交车胎纹总额则不进行计算，此外轮胎磨损费用标题后增加说明图标，悬浮图标显示气泡卡片：卡片内为列表，标题为：轮胎名称、交车胎纹深度、还车胎纹深度、胎纹差、单价、总金额，每一行为一个单独的轮胎（包括备胎）；
    该部分不能删除；可通过点击下方新增一行，添加新的条目（该部分可删除）；

6.9.金额：输入框，支持2位小数，后缀为元；
6.10.无忧包减免：输入框，支持2位小数，后缀为元。仅有三个费用项后有输入框，用户未购买易损保时，未结算维修费用后该输入框禁用，用户未购买轮胎保时间，轮胎磨损费用后该输入框为禁用，用户未购买养护保时，未结算保养后该输入框为禁用；
6.11.备注：文本域，支持自定义输入；
6.12.照片：照片上传按钮，支持照片上传；
6.13.附件：附件上传按钮，文案为：上传附件；
6.14.操作：除固定费用项外，其余操作中为删除；

7.安全组：仅由安全组人员进行确认提交；标题栏标题为安全组，后方为提交人、状态（待提交、已提交），该部分只有安全组能查看；
7.1.提交人：显示提交人；
7.2.状态：分为待提交（点击保存按钮）、已提交（点击提交按钮）；
7.3.保存：点击保存已填写内容，如果已提交，则隐藏保存按钮；
7.4.提交：点击进行二次确认，提示信息：请确认业务服务组金额填写无误，点击确认完成提交。如果已提交，隐藏提交按钮；
7.5.撤回：已提交后，显示撤回按钮。点击进行二次确认，提示信息：是否确认撤回，点击确认，重新显示保存、提交按钮；
7.6.违章清单：违章编码、车牌号、违法行为、违法时间、罚款金额、缴费状态、计分值、是否处理、违章客户、违章照片、备注；
7.7.事故清单：列表显示：事故编码、车牌号、事故时间、事故地点、事故类型、客户名称、我方定损金额、对方定损金额、责任划分、事故状态、结案时间、其他费用、备注；

8.底部为提交、取消按钮；
  8.1.提交审核：还车应结款生成后有15天时间倒计时，倒计时结束并且业务服务组、能源采购组、运维部、安全部均提交后才启用，平时禁用，倒计时显示在按钮上，格式为：x天x小时后可提交审核；
  8.2.取消：点击返回还车应结款列表页；
`);
}, []);

	// 车辆明细表列
	var vehicleColumns = useMemo(function () {
		return [
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 110 },
			{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 160, ellipsis: true },
			{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 140, ellipsis: true },
			{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 140, ellipsis: true },
			{ title: '交车时间', dataIndex: 'deliveryTime', key: 'deliveryTime', width: 160, render: function (v) { return fmtYMDHM(v); } },
			{ title: '还车时间', dataIndex: 'returnTime', key: 'returnTime', width: 160, render: function (v) { return fmtYMDHM(v); } },
			{
				title: '易损保', dataIndex: 'fragileInsurance', key: 'fragileInsurance', width: 110,
				render: function (v) {
					return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
						(v || '-'),
						React.createElement(Tooltip, { title: '提供刹车片、灯泡、蓄电池、雨刮等易损件租期内免费更换服务（不含轮胎，只限自行到服务站更换）' },
							React.createElement('span', {
								style: {
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: 16,
									height: 16,
									borderRadius: 999,
									border: '1px solid #d9d9d9',
									color: '#999',
									fontSize: 12,
									lineHeight: '16px',
									cursor: 'help',
									userSelect: 'none'
								}
							}, 'i')
						)
					);
				}
			},
			{
				title: '轮胎保', dataIndex: 'tireInsurance', key: 'tireInsurance', width: 110,
				render: function (v) {
					return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
						(v || '-'),
						React.createElement(Tooltip, { title: '每个租赁年度内提供1次车辆轮胎因自然磨损产生的替换服务' },
							React.createElement('span', {
								style: {
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: 16,
									height: 16,
									borderRadius: 999,
									border: '1px solid #d9d9d9',
									color: '#999',
									fontSize: 12,
									lineHeight: '16px',
									cursor: 'help',
									userSelect: 'none'
								}
							}, 'i')
						)
					);
				}
			},
			{
				title: '养护保', dataIndex: 'maintenanceInsurance', key: 'maintenanceInsurance', width: 110,
				render: function (v) {
					return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
						(v || '-'),
						React.createElement(Tooltip, { title: '按厂家保养要求提供定期保养服务' },
							React.createElement('span', {
								style: {
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: 16,
									height: 16,
									borderRadius: 999,
									border: '1px solid #d9d9d9',
									color: '#999',
									fontSize: 12,
									lineHeight: '16px',
									cursor: 'help',
									userSelect: 'none'
								}
							}, 'i')
						)
					);
				}
			}
		];
	}, []);

	var latestRefs = useRef({});
	latestRefs.current = {
		businessServiceMeta: businessServiceMeta,
		operationMeta: operationMeta,
		insuranceFlags: insuranceFlags,
		tireTreadList: tireTreadList,
		updateBusinessServiceRow: updateBusinessServiceRow,
		removeBusinessServiceRow: removeBusinessServiceRow,
		updateOperationRow: updateOperationRow,
		removeOperationRow: removeOperationRow
	};

	var businessServiceColumns = useMemo(function () {
		return [
			{ title: '序号', dataIndex: 'seq', key: 'seq', width: 60 },
			{
				title: '费用项', dataIndex: 'feeItem', key: 'feeItem', width: 200,
				render: function (v, r) {
					var ref = latestRefs.current || {};
					var meta = ref.businessServiceMeta || {};
					var readOnly = meta.status === '已提交';
					return r.fixed ? (v || '-') : React.createElement(Input, { value: v, onChange: function (e) { ref.updateBusinessServiceRow(r.key, 'feeItem', e.target.value); }, placeholder: '费用项', disabled: readOnly });
				}
			},
			{
				title: RequiredLabel('金额'), dataIndex: 'amount', key: 'amount', width: 140,
				render: function (v, r) {
					var ref = latestRefs.current || {};
					var meta = ref.businessServiceMeta || {};
					var readOnly = meta.status === '已提交';
					return React.createElement(Input, { value: v, onChange: function (e) { ref.updateBusinessServiceRow(r.key, 'amount', e.target.value); }, placeholder: '0.00', addonAfter: '元', disabled: readOnly });
				}
			},
			{
				title: '备注', dataIndex: 'remark', key: 'remark',
				render: function (v, r) {
					var ref = latestRefs.current || {};
					var meta = ref.businessServiceMeta || {};
					var readOnly = meta.status === '已提交';
					return React.createElement(TextArea, { value: v, onChange: function (e) { ref.updateBusinessServiceRow(r.key, 'remark', e.target.value); }, placeholder: '备注', rows: 1, disabled: readOnly });
				}
			},
			{ title: '最后更新时间', dataIndex: 'lastUpdateTime', key: 'lastUpdateTime', width: 150, render: function (v) { return React.createElement('span', { style: { fontSize: 12, color: '#666' } }, v || '-'); } },
			{ title: '照片', key: 'photo', width: 100, render: function () { var ref = latestRefs.current || {}; var meta = ref.businessServiceMeta || {}; var readOnly = meta.status === '已提交'; return React.createElement(Button, { size: 'small', disabled: readOnly, onClick: function () { message.info('照片上传（原型）'); } }, '上传'); } },
			{ title: '附件', key: 'attachment', width: 110, render: function () { var ref = latestRefs.current || {}; var meta = ref.businessServiceMeta || {}; var readOnly = meta.status === '已提交'; return React.createElement(Button, { size: 'small', disabled: readOnly, onClick: function () { message.info('上传附件（原型）'); } }, '上传附件'); } },
			{
				title: '操作', key: 'action', width: 80,
				render: function (_, r) {
					var ref = latestRefs.current || {};
					var meta = ref.businessServiceMeta || {};
					if (r.fixed || meta.status === '已提交') return null;
					return React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function () { ref.removeBusinessServiceRow(r.key); } }, '删除');
				}
			}
		];
	}, []);

	var operationColumns = useMemo(function () {
		return [
			{ title: '序号', dataIndex: 'seq', key: 'seq', width: 60 },
			{
				title: '费用项', dataIndex: 'feeItem', key: 'feeItem', width: 200,
				render: function (v, r) {
					var ref = latestRefs.current || {};
					var meta = ref.operationMeta || {};
					var readOnly = meta.status === '已提交';
					if (r.fixed) {
						if (v === '轮胎磨损费用') {
							var popContent = React.createElement('div', { style: { width: 760, maxWidth: '80vw' } },
								React.createElement('div', { style: { fontWeight: 600, marginBottom: 8 } }, '轮胎磨损费用明细'),
								React.createElement(Table, {
									rowKey: 'key',
									size: 'small',
									bordered: true,
									pagination: false,
									dataSource: ref.tireTreadList,
									columns: [
										{ title: '轮胎名称', dataIndex: 'name', key: 'name', width: 120, ellipsis: true },
										{ title: '交车胎纹深度', dataIndex: 'deliveryDepth', key: 'deliveryDepth', width: 110, render: function (vv) { return (vv || '0.00') + 'mm'; } },
										{ title: '还车胎纹深度', dataIndex: 'returnDepth', key: 'returnDepth', width: 110, render: function (vv) { return (vv || '0.00') + 'mm'; } },
										{ title: '胎纹差', dataIndex: 'diff', key: 'diff', width: 80, render: function (vv) { return (vv || '0.00') + 'mm'; } },
										{ title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 90, render: function (vv) { return (vv || '0.00') + '元/mm'; } },
										{ title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 90, render: function (vv) { return (vv || '0.00') + '元'; } }
									]
								})
							);
							return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
								(v || '-'),
								React.createElement(Popover, { content: popContent, trigger: 'hover', placement: 'topLeft' },
									React.createElement('span', {
										style: {
											display: 'inline-flex',
											alignItems: 'center',
											justifyContent: 'center',
											width: 16,
											height: 16,
											borderRadius: 999,
											border: '1px solid #d9d9d9',
											color: '#999',
											fontSize: 12,
											lineHeight: '16px',
											cursor: 'help',
											userSelect: 'none'
										}
									}, 'i')
								)
							);
						}
						return (v || '-');
					}
					return React.createElement(Input, { value: v, onChange: function (e) { ref.updateOperationRow(r.key, 'feeItem', e.target.value); }, placeholder: '费用项', disabled: readOnly });
				}
			},
			{
				title: RequiredLabel('金额'), dataIndex: 'amount', key: 'amount', width: 140,
				render: function (v, r) {
					var ref = latestRefs.current || {};
					var meta = ref.operationMeta || {};
					var readOnly = meta.status === '已提交';
					var fee = r && r.feeItem;
					var disabled = readOnly;
					if (fee === '送车服务费' || fee === '接车服务费' || fee === '证件丢失费用') disabled = true;
					return React.createElement(Input, { value: v, onChange: function (e) { ref.updateOperationRow(r.key, 'amount', e.target.value); }, placeholder: '0.00', addonAfter: '元', disabled: disabled });
				}
			},
			{
				title: React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
					'无忧包减免',
					React.createElement(Tooltip, { title: '无忧包减免不会列入运维成本，而是计入业务成本' },
						React.createElement('span', {
							style: {
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: 16,
								height: 16,
								borderRadius: 999,
								border: '1px solid #d9d9d9',
								color: '#999',
								fontSize: 12,
								lineHeight: '16px',
								cursor: 'help',
								userSelect: 'none'
							}
						}, 'i')
					)
				),
				dataIndex: 'worryFreeDiscount',
				key: 'worryFreeDiscount',
				width: 140,
				render: function (v, r) {
					var ref = latestRefs.current || {};
					var meta = ref.operationMeta || {};
					var fee = r && r.feeItem;
					var enableFor = (fee === '未结算维修' || fee === '轮胎磨损费用' || fee === '未结算保养');
					if (!enableFor) return React.createElement('span', { style: { color: '#999' } }, '-');
					var readOnly = meta.status === '已提交';
					var disabled = false;
					var ins = ref.insuranceFlags || {};
					if (fee === '未结算维修' && !ins.hasFragileInsurance) disabled = true;
					if (fee === '轮胎磨损费用' && !ins.hasTireInsurance) disabled = true;
					if (fee === '未结算保养' && !ins.hasMaintenanceInsurance) disabled = true;
					return React.createElement(Input, { value: v, onChange: function (e) { ref.updateOperationRow(r.key, 'worryFreeDiscount', e.target.value); }, placeholder: '0.00', addonAfter: '元', disabled: disabled || readOnly });
				}
			},
			{
				title: '备注', dataIndex: 'remark', key: 'remark',
				render: function (v, r) {
					var ref = latestRefs.current || {};
					var meta = ref.operationMeta || {};
					var readOnly = meta.status === '已提交';
					return React.createElement(TextArea, { value: v, onChange: function (e) { ref.updateOperationRow(r.key, 'remark', e.target.value); }, placeholder: '备注', rows: 1, disabled: readOnly });
				}
			},
			{ title: '最后更新时间', dataIndex: 'lastUpdateTime', key: 'lastUpdateTime', width: 150, render: function (v) { return React.createElement('span', { style: { fontSize: 12, color: '#666' } }, v || '-'); } },
			{ title: '照片', key: 'photo', width: 100, render: function () { return React.createElement(Button, { size: 'small', onClick: function () { message.info('照片上传（原型）'); } }, '上传'); } },
			{ title: '附件', key: 'attachment', width: 110, render: function () { return React.createElement(Button, { size: 'small', onClick: function () { message.info('上传附件（原型）'); } }, '上传附件'); } },
			{
				title: '操作', key: 'action', width: 80,
				render: function (_, r) {
					var ref = latestRefs.current || {};
					var meta = ref.operationMeta || {};
					if (r.fixed || meta.status === '已提交') return null;
					return React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function () { ref.removeOperationRow(r.key); } }, '删除');
				}
			}
		];
	}, []);

	// 提交审核倒计时（原型：生成后 15 天）
	var generatedAt = useMemo(function () { return new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); }, []);
	var nowTickState = useState(Date.now());
	useEffect(function () {
		var t = setInterval(function () { nowTickState[1](Date.now()); }, 60 * 1000);
		return function () { clearInterval(t); };
	}, []);

	function remainingText() {
		var end = generatedAt.getTime() + 15 * 24 * 60 * 60 * 1000;
		var left = end - nowTickState[0];
		if (left <= 0) return '0天0小时后可提交审核';
		var d = Math.floor(left / (24 * 60 * 60 * 1000));
		var h = Math.floor((left % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
		return d + '天' + h + '小时后可提交审核';
	}

	function canSubmitReview() {
		var end = generatedAt.getTime() + 15 * 24 * 60 * 60 * 1000;
		var timeOk = (nowTickState[0] >= end);
		var groupOk = businessServiceMeta.status === '已提交' && energyMeta.status === '已提交' && operationMeta.status === '已提交' && safetyMeta.status === '已提交';
		return timeOk && groupOk;
	}

	function handleSubmit() {
		function isValidMoney(s) {
			if (s === null || s === undefined) return false;
			var v = String(s).trim();
			if (!v) return false;
			return !isNaN(parseFloat(v));
		}

		// 业务服务组：每行“金额”必填
		for (var i = 0; i < (businessServiceRows || []).length; i++) {
			var r1 = businessServiceRows[i];
			if (!isValidMoney(r1.amount)) {
				message.error('请填写业务服务组第' + (r1.seq || (i + 1)) + '行金额');
				return;
			}
		}
		if (!isValidMoney(billInfo.actualRent)) { message.error('请填写车辆实际租金'); return; }
		if (!isValidMoney(billInfo.shouldRefundRent)) { message.error('请填写车辆应退租金'); return; }

		// 能源采购组：氢量差/氢费/电费/预付款退费 必填
		if (!isValidMoney(energy.hydrogenSupplement)) { message.error('请填写氢量差补缴金额'); return; }
		if (!isValidMoney(energy.hydrogenFee)) { message.error('请填写氢费补缴金额'); return; }
		if (!isValidMoney(energy.electricFee)) { message.error('请填写电费补缴金额'); return; }
		if (!isValidMoney(energy.prepayRefund)) { message.error('请填写预付款退费金额'); return; }

		// 运维部：每行“金额”必填；无忧包减免仅对 3 个费用项必填（即显示输入框的行）
		for (var j = 0; j < (operationRows || []).length; j++) {
			var r2 = operationRows[j];
			if (!isValidMoney(r2.amount)) {
				message.error('请填写运维部第' + (r2.seq || (j + 1)) + '行金额');
				return;
			}
			var fee = r2 && r2.feeItem;
			var hasDiscountInput = (fee === '未结算维修' || fee === '轮胎磨损费用' || fee === '未结算保养');
			if (hasDiscountInput && !isValidMoney(r2.worryFreeDiscount)) {
				message.error('请填写运维部“' + fee + '”的无忧包减免金额');
				return;
			}
		}

		if (!canSubmitReview()) {
			message.error('未满足提交审核条件（倒计时结束且四组均已提交）');
			return;
		}
		message.success('提交审核成功（原型）');
	}
	function handleCancel() {
		message.info('返回还车应结款列表页（原型）');
	}

return React.createElement('div', { style: layoutStyle },
	React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
		React.createElement(Breadcrumb, { items: [{ title: '财务管理' }, { title: '还车应结款' }] }),
		React.createElement(Button, { type: 'link', onClick: function () { requirementModalOpenState[1](true); } }, '查看需求说明')
	),

		React.createElement(Card, { title: '还车车辆明细', style: cardStyle },
			React.createElement(Table, { rowKey: 'key', columns: vehicleColumns, dataSource: vehicleDetail, pagination: false, bordered: true, size: 'middle', scroll: { x: 980 } })
		),

		React.createElement(Card, { title: '还车费用明细', style: cardStyle },
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 } },
				React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '18px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } },
					React.createElement('div', { style: { fontSize: 13, color: '#666', marginBottom: 12 } }, '保证金总额'),
					React.createElement('div', { style: { fontSize: 22, fontWeight: 600, color: '#333' } }, (stats.depositAmount || '0.00'), React.createElement('span', { style: { fontSize: 14, fontWeight: 500, marginLeft: 4 } }, '元'))
				),
				React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '18px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } },
					React.createElement('div', { style: { fontSize: 13, color: '#666', marginBottom: 12 } }, '待结算总额'),
					React.createElement(Popover, { trigger: 'click', placement: 'bottomLeft', content: buildBreakdownContent(settleBreakdown) },
						React.createElement('div', { style: { fontSize: 22, fontWeight: 600, color: '#fa8c16', cursor: 'pointer' } },
							(pendingSettleComputed || '0.00'),
							React.createElement('span', { style: { fontSize: 14, fontWeight: 500, marginLeft: 4, color: '#333' } }, '元')
						)
					)
				),
				React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '18px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } },
					React.createElement('div', { style: { fontSize: 13, color: '#666', marginBottom: 12 } }, '应退还总额'),
					React.createElement(Popover, { trigger: 'click', placement: 'bottomLeft', content: buildBreakdownContent(refundBreakdown) },
						React.createElement('div', { style: { fontSize: 22, fontWeight: 600, color: '#52c41a', cursor: 'pointer' } },
							(refundTotalComputed || '0.00'),
							React.createElement('span', { style: { fontSize: 14, fontWeight: 500, marginLeft: 4, color: '#333' } }, '元')
						)
					)
				),
				React.createElement('div', { style: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '18px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } },
					React.createElement('div', { style: { fontSize: 13, color: '#666', marginBottom: 12 } }, '应补缴总额'),
					React.createElement(Popover, { trigger: 'click', placement: 'bottomLeft', content: buildBreakdownContent(payBreakdown) },
						React.createElement('div', { style: { fontSize: 22, fontWeight: 600, color: '#f5222d', cursor: 'pointer' } },
							(payTotalComputed || '0.00'),
							React.createElement('span', { style: { fontSize: 14, fontWeight: 500, marginLeft: 4, color: '#333' } }, '元')
						)
					)
				)
			),

			React.createElement(CollapseSection, {
				collapsed: businessServiceCollapsedState[0],
				setCollapsed: businessServiceCollapsedState[1],
				title: '业务服务组',
				extra: React.createElement(React.Fragment, null,
					React.createElement('span', null, '总金额：', businessServiceTotalComputed, ' 元'),
					React.createElement('span', null, '提交人：', businessServiceMeta.submitBy || '-'),
					React.createElement('span', null, '状态：', businessServiceMeta.status)
				),
				headerActions: businessServiceMeta.status === '已提交'
					? React.createElement(Button, { size: 'small', onClick: handleBusinessServiceRevoke }, '撤回')
					: React.createElement(React.Fragment, null,
						React.createElement(Button, { size: 'small', onClick: handleBusinessServiceSave }, '保存'),
						React.createElement(Button, { size: 'small', type: 'primary', onClick: handleBusinessServiceSubmit }, '提交')
					)
			},
				React.createElement(Table, { rowKey: 'key', columns: businessServiceColumns, dataSource: businessServiceRows, pagination: false, bordered: true, size: 'small' }),
				React.createElement('div', { style: { marginTop: 12, paddingTop: 12, borderTop: '1px dashed #f0f0f0' } },
					React.createElement('div', { style: { fontWeight: 600, marginBottom: 10 } }, '车辆租金'),
					React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 } },
						React.createElement('div', null,
							React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, '本期账单已收租金'),
							React.createElement(Input, { value: billInfo.receivedRent, addonAfter: '元', disabled: true })
						),
						React.createElement('div', null,
							React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, RequiredLabel('车辆实际租金')),
							React.createElement(Input, {
								value: billInfo.actualRent,
								onChange: function (e) { var v = e.target.value; setBillInfo(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.actualRent = v; n.actualRentManual = true; return n; }); },
								placeholder: '0.00',
								addonAfter: '元',
								disabled: businessServiceMeta.status === '已提交'
							})
						),
						React.createElement('div', null,
							React.createElement('div', { style: { fontSize: 12, color: '#666', marginBottom: 6 } }, RequiredLabel('车辆应退租金')),
							React.createElement(Input, {
								value: billInfo.shouldRefundRent,
								onChange: function (e) { var v = e.target.value; setBillInfo(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.shouldRefundRent = v; n.shouldRefundManual = true; return n; }); },
								placeholder: '0.00',
								addonAfter: '元',
								disabled: businessServiceMeta.status === '已提交'
							})
						)
					)
				),
				businessServiceMeta.status === '待提交'
					? React.createElement('div', { style: { marginTop: 8, width: '100%' } },
						React.createElement(Button, { type: 'dashed', size: 'small', onClick: addBusinessServiceRow, block: true, style: { width: '100%' } }, '新增一行')
					)
					: null
			),

			React.createElement(CollapseSection, {
				collapsed: energyCollapsedState[0],
				setCollapsed: energyCollapsedState[1],
				title: '能源采购组',
				extra: React.createElement(React.Fragment, null,
					React.createElement('span', null, '总金额：', energyTotalComputed, ' 元'),
					React.createElement('span', null, '提交人：', energyMeta.submitBy || '-'),
					React.createElement('span', null, '状态：', energyMeta.status)
				),
				headerActions: energyMeta.status === '已提交'
					? React.createElement(Button, { size: 'small', onClick: handleEnergyRevoke }, '撤回')
					: React.createElement(React.Fragment, null,
						React.createElement(Button, { size: 'small', onClick: handleEnergySave }, '保存'),
						React.createElement(Button, { size: 'small', type: 'primary', onClick: handleEnergySubmit }, '提交')
					)
			},
				React.createElement('div', null,
					React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 16 } },
						React.createElement('div', null,
						React.createElement('div', { style: { marginBottom: 8, fontWeight: 500 } }, RequiredLabel('氢量差补缴金额')),
							React.createElement(Input, {
								value: energy.hydrogenSupplement,
								onChange: function (e) { setEnergy(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.hydrogenSupplement = e.target.value; return n; }); },
								placeholder: '0.00',
								addonAfter: '元',
								style: { width: '100%' },
								readOnly: (parseFloat(energy.deliveryHydrogen) || 0) > (parseFloat(energy.returnHydrogen) || 0),
								disabled: energyMeta.status === '已提交'
							})
						),
						React.createElement('div', null,
							React.createElement('div', { style: { marginBottom: 8, fontWeight: 500 } }, '交车氢量'),
							React.createElement(Input, { value: (toFixed2(energy.deliveryHydrogen) || '0.00'), addonAfter: 'MPa', disabled: true })
						),
						React.createElement('div', null,
							React.createElement('div', { style: { marginBottom: 8, fontWeight: 500 } }, '还车氢量'),
							React.createElement(Input, { value: (toFixed2(energy.returnHydrogen) || '0.00'), addonAfter: 'MPa', disabled: true })
						),
						React.createElement('div', null,
							React.createElement('div', { style: { marginBottom: 8, fontWeight: 500 } }, '退还车氢气单价'),
							React.createElement(Input, { value: (toFixed2(energy.hydrogenUnitPrice) || '0.00'), addonAfter: '元', disabled: true })
						)
					),

					React.createElement('div', null,
						React.createElement('div', { style: { marginBottom: 8, fontWeight: 500 } }, RequiredLabel('能源费补缴金额')),
						React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 12 } },
							React.createElement('div', null, React.createElement(Input, { value: energy.hydrogenFee, onChange: function (e) { setEnergy(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.hydrogenFee = e.target.value; return n; }); }, placeholder: '氢费补缴金额', addonAfter: '元', style: { width: '100%' }, disabled: energyMeta.status === '已提交' })),
							React.createElement('div', null, React.createElement(Input, { value: energy.electricFee, onChange: function (e) { setEnergy(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.electricFee = e.target.value; return n; }); }, placeholder: '电费补缴金额', addonAfter: '元', style: { width: '100%' }, disabled: energyMeta.status === '已提交' })),
							React.createElement('div', null),
							React.createElement('div', null)
						)
					),
					React.createElement('div', { style: { gridColumn: '1 / -1', borderTop: '1px solid #f0f0f0', paddingTop: 12, marginTop: 4 } },
						React.createElement('div', { style: { marginBottom: 8, fontWeight: 500 } }, RequiredLabel('预付款退费金额')),
						React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 } },
							React.createElement('div', null,
								React.createElement(Input, { value: energy.prepayRefund, onChange: function (e) { setEnergy(function (p) { var n = {}; for (var k in p) n[k] = p[k]; n.prepayRefund = e.target.value; return n; }); }, placeholder: '0.00', addonAfter: '元', style: { width: '100%' }, disabled: energyMeta.status === '已提交' })
							),
							React.createElement('div', null),
							React.createElement('div', null),
							React.createElement('div', null)
						),
						React.createElement('div', { style: { marginTop: 8, fontSize: 12, color: '#666' } }, '项目预充值余额：', energy.userBalance, ' 元')
					)
				),
			),

			React.createElement(CollapseSection, {
				collapsed: operationCollapsedState[0],
				setCollapsed: operationCollapsedState[1],
				title: '运维部',
				extra: React.createElement(React.Fragment, null,
					React.createElement('span', null, '总金额：', operationTotalComputed, ' 元'),
					React.createElement('span', null, '提交人：', operationMeta.submitBy || '-'),
					React.createElement('span', null, '状态：', operationMeta.status)
				),
				headerActions: operationMeta.status === '已提交'
					? React.createElement(Button, { size: 'small', onClick: handleOperationRevoke }, '撤回')
					: React.createElement(React.Fragment, null,
						React.createElement(Button, { size: 'small', onClick: handleOperationSave }, '保存'),
						React.createElement(Button, { size: 'small', type: 'primary', onClick: handleOperationSubmit }, '提交')
					)
			},
				React.createElement(Table, { rowKey: 'key', columns: operationColumns, dataSource: operationRows, pagination: false, bordered: true, size: 'small' }),
				operationMeta.status === '待提交'
					? React.createElement('div', { style: { marginTop: 8, width: '100%' } },
						React.createElement(Button, { type: 'dashed', size: 'small', onClick: addOperationRow, block: true, style: { width: '100%' } }, '新增一行')
					)
					: null
			),

			React.createElement(CollapseSection, {
				collapsed: safetyCollapsedState[0],
				setCollapsed: safetyCollapsedState[1],
				title: '安全组',
				extra: React.createElement(React.Fragment, null,
					React.createElement('span', null, '提交人：', safetyMeta.submitBy || '-'),
					React.createElement('span', null, '状态：', safetyMeta.status)
				),
				headerActions: safetyMeta.status === '已提交'
					? React.createElement(Button, { size: 'small', onClick: handleSafetyRevoke }, '撤回')
					: React.createElement(React.Fragment, null,
						React.createElement(Button, { size: 'small', onClick: handleSafetySave }, '保存'),
						React.createElement(Button, { size: 'small', type: 'primary', onClick: handleSafetySubmit }, '提交')
					)
			},
				React.createElement('div', { style: { marginBottom: 12, fontWeight: 600 } }, '违章清单'),
				React.createElement(Table, {
					rowKey: 'key',
					size: 'small',
					bordered: true,
					pagination: false,
					dataSource: violationList,
					columns: [
						{ title: '违章编码', dataIndex: 'code', key: 'code', width: 130, ellipsis: true },
						{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 110 },
						{ title: '违法行为', dataIndex: 'violationBehavior', key: 'violationBehavior', width: 110, ellipsis: true },
						{ title: '违法时间', dataIndex: 'violationTime', key: 'violationTime', width: 110 },
						{ title: '罚款金额', dataIndex: 'penaltyAmount', key: 'penaltyAmount', width: 90, render: function (v) { return (v || '0.00'); } },
						{ title: '缴费状态', dataIndex: 'paymentStatus', key: 'paymentStatus', width: 90 },
						{ title: '记分值', dataIndex: 'score', key: 'score', width: 70 },
						{ title: '是否处理', dataIndex: 'handleStatus', key: 'handleStatus', width: 90 },
						{ title: '违章客户', dataIndex: 'violationCustomer', key: 'violationCustomer', width: 120, ellipsis: true },
						{ title: '违章照片', dataIndex: 'violationPhoto', key: 'violationPhoto', width: 90, render: function (v) { return v ? v : ''; } },
						{ title: '备注', dataIndex: 'remark', key: 'remark', width: 120, ellipsis: true }
					]
				}),
				React.createElement('div', { style: { margin: '16px 0 12px', fontWeight: 600 } }, '事故清单'),
				React.createElement(Table, {
					rowKey: 'key',
					size: 'small',
					bordered: true,
					pagination: false,
					dataSource: accidentList,
					locale: { emptyText: '暂无事故记录' },
					columns: [
						{ title: '事故编码', dataIndex: 'accidentCode', key: 'accidentCode', width: 130, ellipsis: true },
						{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 110 },
						{ title: '事故时间', dataIndex: 'accidentTime', key: 'accidentTime', width: 110 },
						{ title: '事故地点', dataIndex: 'accidentPlace', key: 'accidentPlace', width: 120, ellipsis: true },
						{ title: '事故类型', dataIndex: 'accidentType', key: 'accidentType', width: 110, ellipsis: true },
						{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 120, ellipsis: true },
						{ title: '我方定损金额', dataIndex: 'ourClaimAmount', key: 'ourClaimAmount', width: 110, render: function (v) { return v || ''; } },
						{ title: '对方定损金额', dataIndex: 'theirClaimAmount', key: 'theirClaimAmount', width: 110, render: function (v) { return v || ''; } },
						{ title: '责任划分', dataIndex: 'responsibility', key: 'responsibility', width: 90 },
						{ title: '事故状态', dataIndex: 'accidentStatus', key: 'accidentStatus', width: 90 },
						{ title: '结案时间', dataIndex: 'closeTime', key: 'closeTime', width: 110 },
						{ title: '其它费用', dataIndex: 'otherFee', key: 'otherFee', width: 90, render: function (v) { return v || ''; } },
						{ title: '备注', dataIndex: 'remark', key: 'remark', width: 120, ellipsis: true }
					]
				})
			)
		),

		React.createElement('div', { style: footerStyle },
			React.createElement(Button, { type: 'primary', onClick: handleSubmit, disabled: !canSubmitReview() }, canSubmitReview() ? '提交审核' : remainingText()),
			React.createElement(Button, { onClick: handleCancel }, '取消')
		),
		React.createElement(Modal, {
			open: requirementModalOpenState[0],
			onCancel: function () { requirementModalOpenState[1](false); },
			onOk: function () { requirementModalOpenState[1](false); },
			title: '需求说明',
			width: 860
		},
			React.createElement('div', { style: { maxHeight: '70vh', overflow: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#333' } }, requirementDocContent)
		)
	);
};

