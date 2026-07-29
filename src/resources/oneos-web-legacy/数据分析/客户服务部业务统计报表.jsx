// 【重要】必须使用 const Component 作为组件变量名
// 数据分析 - 客户服务部业务统计报表（依据业务台账模版数据统计方案）
// 经营总览 KPI + 租赁/物流/能源/成本账户/未收预警；支持汇总→明细钻取（原型演示数据）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var App = antd.App;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Button = antd.Button;
	var Table = antd.Table;
	var Select = antd.Select;
	var DatePicker = antd.DatePicker;
	var Row = antd.Row;
	var Col = antd.Col;
	var Tabs = antd.Tabs;
	var Space = antd.Space;
	var Modal = antd.Modal;
	var Tag = antd.Tag;
	var Statistic = antd.Statistic;
	var message = antd.message;

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function fmtMoney(n) {
		if (n === null || n === undefined || n === '') return '—';
		var x = Number(n);
		if (isNaN(x)) return '—';
		return x.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function fmtPct(n) {
		if (n === null || n === undefined || n === '') return '—';
		var x = Number(n);
		if (isNaN(x)) return '—';
		return (x * 100).toFixed(1) + '%';
	}

	function numOrZero(v) {
		if (v === null || v === undefined || v === '') return 0;
		var n = Number(v);
		return isNaN(n) ? 0 : n;
	}

	function escapeCsv(v) {
		var s = v == null ? '' : String(v);
		if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
			return '"' + s.replace(/"/g, '""') + '"';
		}
		return s;
	}

	function downloadCsv(filename, lines) {
		var csv = lines.map(function (row) { return row.map(escapeCsv).join(','); }).join('\n');
		var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
		var url = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function initialYear() {
		try {
			if (window.dayjs) return window.dayjs('2026-01-01');
		} catch (e1) {}
		return null;
	}

	function getAppliedYearMonth(yearApplied, monthApplied) {
		var y = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : '2026';
		var m = monthApplied != null && monthApplied !== '' ? Number(monthApplied) : null;
		return { year: y, month: m };
	}

	var SALESPERSONS = ['谈云', '刘念念', '谯云', '董剑煜', '尚建华'];
	var CUSTOMERS = [
		'嘉兴古道物流有限公司', '杭州绿道城配科技有限公司', '宁波港联氢运物流有限公司',
		'上海虹钦物流有限公司', '嘉兴市乍浦港口经营有限公司', '荣达餐饮(广东)集团有限公司'
	];

	function buildMockKpi(ym) {
		var seed = Number(ym.year) * 100 + (ym.month || 5);
		return {
			totalRevenue: 4280000 + (seed % 17) * 12000,
			totalProfit: 612000 + (seed % 11) * 8000,
			uncollected: 386500 + (seed % 9) * 5000,
			accountBalance: 1258000 + (seed % 13) * 3000,
			activeVehicles: 186 + (seed % 7)
		};
	}

	function buildOverviewRows(ym) {
		var lines = [
			{ key: 'lease', line: '租赁业务', receivable: 1280000, received: 1120000, cost: 720000, profit: 400000 },
			{ key: 'logistics', line: '物流业务', receivable: 2100000, received: 1980000, cost: 1650000, profit: 330000 },
			{ key: 'energy', line: '能源销售', receivable: 680000, received: 620000, cost: 480000, profit: 140000 },
			{ key: 'etc', line: 'ETC及其他', receivable: 220000, received: 210000, cost: 95000, profit: 115000 }
		];
		return lines.map(function (r) {
			var uncollected = r.receivable - r.received;
			return Object.assign({}, r, {
				uncollected: uncollected,
				profitRate: r.receivable > 0 ? r.profit / r.receivable : 0,
				year: ym.year,
				monthLabel: ym.month ? ym.month + '月' : '全年累计'
			});
		});
	}

	function buildLeaseSummary(ym, filters) {
		var rows = [];
		var i;
		for (i = 0; i < 8; i++) {
			var sp = SALESPERSONS[i % SALESPERSONS.length];
			var cu = CUSTOMERS[i % CUSTOMERS.length];
			if (filters.salesperson && sp !== filters.salesperson) continue;
			if (filters.customer && cu !== filters.customer) continue;
			var recv = 120000 + i * 18500;
			var got = recv - (i % 3 === 0 ? 22000 : 0);
			var cost = recv * 0.58;
			rows.push({
				key: 'lease-' + i,
				year: ym.year,
				month: ym.month || 5,
				salesperson: sp,
				customerName: cu,
				receivable: recv,
				uncollected: recv - got,
				cost: cost,
				profit: got - cost,
				profitRate: recv > 0 ? (got - cost) / recv : 0
			});
		}
		return rows;
	}

	function buildLogisticsSummary(ym, filters) {
		var projects = ['沪浙干线', '嘉兴冷链城配', '宁波港区短驳', '盒马城配专线'];
		var rows = [];
		projects.forEach(function (p, i) {
			var sp = SALESPERSONS[i % SALESPERSONS.length];
			var cu = CUSTOMERS[(i + 1) % CUSTOMERS.length];
			if (filters.salesperson && sp !== filters.salesperson) return;
			if (filters.customer && cu !== filters.customer) return;
			var orders = 120 + i * 35;
			var recv = 280000 + i * 95000;
			var got = recv - (i === 2 ? 45000 : 8000);
			rows.push({
				key: 'log-' + i,
				month: ym.month || 5,
				salesperson: sp,
				projectName: p,
				customerName: cu,
				orderCount: orders,
				receivable: recv,
				received: got,
				uncollected: recv - got,
				invoiceAmount: got * 0.95
			});
		});
		return rows;
	}

	function buildEnergySummary(ym) {
		return CUSTOMERS.slice(0, 5).map(function (c, i) {
			var kg = 4200 + i * 680;
			var cost = kg * 32;
			var sales = kg * 38;
			return {
				key: 'eng-' + i,
				year: ym.year,
				month: ym.month || 5,
				customerName: c,
				salesperson: SALESPERSONS[i % SALESPERSONS.length],
				h2Kg: kg,
				costAmount: cost,
				salesAmount: sales,
				grossProfit: sales - cost,
				collectStatus: i % 2 === 0 ? '已收款' : '待收款'
			};
		});
	}

	function buildAccountRows() {
		return CUSTOMERS.slice(0, 6).map(function (c, i) {
			var open = 50000 + i * 12000;
			var recharge = 200000 + i * 30000;
			var usedH2 = 120000 + i * 22000;
			var usedElec = 45000 + i * 8000;
			return {
				key: 'acc-' + i,
				customerName: c,
				salesperson: SALESPERSONS[i % SALESPERSONS.length],
				openBalance: open,
				recharge: recharge,
				usedH2: usedH2,
				usedElec: usedElec,
				closeBalance: open + recharge - usedH2 - usedElec
			};
		});
	}

	function buildUncollectedRows(ym) {
		var rows = [];
		var i;
		for (i = 0; i < 10; i++) {
			var recv = 80000 + i * 12000;
			var uncol = 15000 + (i % 4) * 8000;
			rows.push({
				key: 'unc-' + i,
				line: i % 2 === 0 ? '租赁' : '物流',
				salesperson: SALESPERSONS[i % SALESPERSONS.length],
				customerName: CUSTOMERS[i % CUSTOMERS.length],
				plateNo: '浙F0' + (3280 + i) + 'F',
				dueDate: '2026-0' + ((i % 5) + 1) + '-15',
				receivable: recv,
				uncollected: uncol,
				overdueDays: (i % 5) * 7 + 3
			});
		}
		return rows;
	}

	function mockLeaseDetail(row) {
		return [
			{ key: 'd1', plateNo: '浙F03298F', receivable: row.receivable * 0.4, received: row.receivable * 0.35, uncollected: row.receivable * 0.05 },
			{ key: 'd2', plateNo: '粤AGP3649', receivable: row.receivable * 0.35, received: row.receivable * 0.32, uncollected: row.receivable * 0.03 },
			{ key: 'd3', plateNo: '沪A62261F', receivable: row.receivable * 0.25, received: row.receivable * 0.2, uncollected: row.receivable * 0.05 }
		];
	}

	function mockLogisticsDetail(row) {
		return [
			{ key: 'd1', plateNo: '浙F05519F', tripDate: '2026-05-08', amount: row.receivable * 0.45, h2Fee: 3200, etcFee: 890 },
			{ key: 'd2', plateNo: '浙F02698F', tripDate: '2026-05-10', amount: row.receivable * 0.35, h2Fee: 2800, etcFee: 720 },
			{ key: 'd3', plateNo: '粤AGR5099', tripDate: '2026-05-12', amount: row.receivable * 0.2, h2Fee: 1500, etcFee: 410 }
		];
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var profitNegStyle = { background: '#fff1f0', padding: '2px 8px', borderRadius: 4, display: 'inline-block' };
	var drillLinkStyle = { cursor: 'pointer', color: '#1677ff', border: 'none', background: 'none', padding: 0, font: 'inherit' };

	var tableStyle =
		'.cs-dept-stat-table .ant-table-thead>tr>th{background:#e6f4ff!important;font-weight:500;font-size:12px}' +
		'.cs-dept-stat-table .ant-table-tbody>tr>td{white-space:nowrap}' +
		'.cs-dept-kpi .ant-statistic-title{font-size:13px;color:rgba(0,0,0,0.55)}';

	var yearDraftState = useState(initialYear);
	var yearDraft = yearDraftState[0];
	var setYearDraft = yearDraftState[1];
	var yearAppliedState = useState(initialYear);
	var yearApplied = yearAppliedState[0];
	var setYearApplied = yearAppliedState[1];

	var monthDraftState = useState(5);
	var monthDraft = monthDraftState[0];
	var setMonthDraft = monthDraftState[1];
	var monthAppliedState = useState(5);
	var monthApplied = monthAppliedState[0];
	var setMonthApplied = monthAppliedState[1];

	var spDraftState = useState(undefined);
	var spDraft = spDraftState[0];
	var setSpDraft = spDraftState[1];
	var spAppliedState = useState(undefined);
	var spApplied = spAppliedState[0];
	var setSpApplied = spAppliedState[1];

	var cuDraftState = useState(undefined);
	var cuDraft = cuDraftState[0];
	var setCuDraft = cuDraftState[1];
	var cuAppliedState = useState(undefined);
	var cuApplied = cuAppliedState[0];
	var setCuApplied = cuAppliedState[1];

	var activeTabState = useState('overview');
	var activeTab = activeTabState[0];
	var setActiveTab = activeTabState[1];

	var drillState = useState({ open: false, type: '', title: '', rows: [] });
	var drill = drillState[0];
	var setDrill = drillState[1];

	var ym = useMemo(function () {
		return getAppliedYearMonth(yearApplied, monthApplied);
	}, [yearApplied, monthApplied]);

	var filters = useMemo(function () {
		return { salesperson: spApplied, customer: cuApplied };
	}, [spApplied, cuApplied]);

	var kpi = useMemo(function () { return buildMockKpi(ym); }, [ym]);
	var overviewRows = useMemo(function () { return buildOverviewRows(ym); }, [ym]);
	var leaseRows = useMemo(function () { return buildLeaseSummary(ym, filters); }, [ym, filters]);
	var logisticsRows = useMemo(function () { return buildLogisticsSummary(ym, filters); }, [ym, filters]);
	var energyRows = useMemo(function () { return buildEnergySummary(ym); }, [ym]);
	var accountRows = useMemo(function () { return buildAccountRows(); }, []);
	var uncollectedRows = useMemo(function () { return buildUncollectedRows(ym); }, [ym]);

	var monthOptions = useMemo(function () {
		var opts = [{ value: '', label: '全年' }];
		var m;
		for (m = 1; m <= 12; m++) opts.push({ value: m, label: m + '月' });
		return opts;
	}, []);

	var spOptions = useMemo(function () {
		return [{ value: '', label: '全部业务员' }].concat(SALESPERSONS.map(function (s) { return { value: s, label: s }; }));
	}, []);

	var cuOptions = useMemo(function () {
		return [{ value: '', label: '全部客户' }].concat(CUSTOMERS.map(function (c) { return { value: c, label: c }; }));
	}, []);

	var handleQuery = useCallback(function () {
		setYearApplied(yearDraft);
		setMonthApplied(monthDraft === '' ? null : monthDraft);
		setSpApplied(spDraft || undefined);
		setCuApplied(cuDraft || undefined);
	}, [yearDraft, monthDraft, spDraft, cuDraft]);

	var handleReset = useCallback(function () {
		var y0 = initialYear();
		setYearDraft(y0);
		setYearApplied(y0);
		setMonthDraft(5);
		setMonthApplied(5);
		setSpDraft(undefined);
		setSpApplied(undefined);
		setCuDraft(undefined);
		setCuApplied(undefined);
	}, []);

	var openDrill = useCallback(function (type, row) {
		var rows = [];
		var title = '';
		if (type === 'lease') {
			rows = mockLeaseDetail(row);
			title = '租赁车辆明细 · ' + row.customerName;
		} else if (type === 'logistics') {
			rows = mockLogisticsDetail(row);
			title = '物流运单明细 · ' + row.projectName;
		}
		setDrill({ open: true, type: type, title: title, rows: rows });
	}, []);

	var closeDrill = useCallback(function () {
		setDrill({ open: false, type: '', title: '', rows: [] });
	}, []);

	var pageTitle = useMemo(function () {
		var m = monthApplied ? monthApplied + '月' : '全年';
		return ym.year + '年' + m + ' · 客户服务部业务统计';
	}, [ym, monthApplied]);

	var overviewColumns = useMemo(function () {
		return [
			{ title: '业务条线', dataIndex: 'line', key: 'line', width: 100, fixed: 'left' },
			{ title: '应收', dataIndex: 'receivable', key: 'receivable', align: 'right', render: fmtMoney },
			{ title: '实收', dataIndex: 'received', key: 'received', align: 'right', render: fmtMoney },
			{ title: '未收', dataIndex: 'uncollected', key: 'uncollected', align: 'right', render: function (v) {
				var n = Number(v);
				if (!isNaN(n) && n > 0) return React.createElement('span', { style: { color: '#f53f3f' } }, fmtMoney(v));
				return fmtMoney(v);
			}},
			{ title: '成本', dataIndex: 'cost', key: 'cost', align: 'right', render: fmtMoney },
			{ title: '利润', dataIndex: 'profit', key: 'profit', align: 'right', render: function (v) {
				var n = Number(v);
				var neg = !isNaN(n) && n < 0;
				return neg ? React.createElement('span', { style: profitNegStyle }, fmtMoney(v)) : fmtMoney(v);
			}},
			{ title: '利润率', dataIndex: 'profitRate', key: 'profitRate', align: 'right', width: 88, render: fmtPct }
		];
	}, []);

	var leaseColumns = useMemo(function () {
		return [
			{ title: '业务员', dataIndex: 'salesperson', key: 'salesperson', width: 88 },
			{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 200, ellipsis: true },
			{ title: '应收', dataIndex: 'receivable', key: 'receivable', align: 'right', render: fmtMoney },
			{ title: '未收', dataIndex: 'uncollected', key: 'uncollected', align: 'right', render: fmtMoney },
			{ title: '成本', dataIndex: 'cost', key: 'cost', align: 'right', render: fmtMoney },
			{ title: '利润', dataIndex: 'profit', key: 'profit', align: 'right', render: function (v) { return fmtMoney(v); } },
			{ title: '利润率', dataIndex: 'profitRate', key: 'profitRate', align: 'right', render: fmtPct },
			{
				title: '操作',
				key: 'action',
				width: 88,
				fixed: 'right',
				render: function (_, r) {
					return React.createElement('button', { type: 'button', style: drillLinkStyle, onClick: function () { openDrill('lease', r); } }, '明细');
				}
			}
		];
	}, [openDrill]);

	var logisticsColumns = useMemo(function () {
		return [
			{ title: '业务员', dataIndex: 'salesperson', key: 'salesperson', width: 88 },
			{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 140 },
			{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 180, ellipsis: true },
			{ title: '运单量', dataIndex: 'orderCount', key: 'orderCount', align: 'right', width: 80 },
			{ title: '应收', dataIndex: 'receivable', key: 'receivable', align: 'right', render: fmtMoney },
			{ title: '实收', dataIndex: 'received', key: 'received', align: 'right', render: fmtMoney },
			{ title: '未收', dataIndex: 'uncollected', key: 'uncollected', align: 'right', render: fmtMoney },
			{
				title: '操作',
				key: 'action',
				width: 88,
				fixed: 'right',
				render: function (_, r) {
					return React.createElement('button', { type: 'button', style: drillLinkStyle, onClick: function () { openDrill('logistics', r); } }, '明细');
				}
			}
		];
	}, [openDrill]);

	var energyColumns = useMemo(function () {
		return [
			{ title: '客户名', dataIndex: 'customerName', key: 'customerName', width: 200, ellipsis: true },
			{ title: '业务员', dataIndex: 'salesperson', key: 'salesperson', width: 88 },
			{ title: '加氢量(kg)', dataIndex: 'h2Kg', key: 'h2Kg', align: 'right', render: function (v) { return fmtMoney(v); } },
			{ title: '成本金额', dataIndex: 'costAmount', key: 'costAmount', align: 'right', render: fmtMoney },
			{ title: '销售金额', dataIndex: 'salesAmount', key: 'salesAmount', align: 'right', render: fmtMoney },
			{ title: '毛利', dataIndex: 'grossProfit', key: 'grossProfit', align: 'right', render: fmtMoney },
			{
				title: '收款状态',
				dataIndex: 'collectStatus',
				key: 'collectStatus',
				width: 96,
				render: function (v) {
					return React.createElement(Tag, { color: v === '已收款' ? 'success' : 'warning' }, v);
				}
			}
		];
	}, []);

	var accountColumns = useMemo(function () {
		return [
			{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 200, ellipsis: true },
			{ title: '业务员', dataIndex: 'salesperson', key: 'salesperson', width: 88 },
			{ title: '上年结存', dataIndex: 'openBalance', key: 'openBalance', align: 'right', render: fmtMoney },
			{ title: '本年充值', dataIndex: 'recharge', key: 'recharge', align: 'right', render: fmtMoney },
			{ title: '已用氢费', dataIndex: 'usedH2', key: 'usedH2', align: 'right', render: fmtMoney },
			{ title: '已用电费', dataIndex: 'usedElec', key: 'usedElec', align: 'right', render: fmtMoney },
			{ title: '期末结余', dataIndex: 'closeBalance', key: 'closeBalance', align: 'right', render: fmtMoney }
		];
	}, []);

	var uncollectedColumns = useMemo(function () {
		return [
			{ title: '条线', dataIndex: 'line', key: 'line', width: 72 },
			{ title: '业务员', dataIndex: 'salesperson', key: 'salesperson', width: 88 },
			{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 180, ellipsis: true },
			{ title: '车牌', dataIndex: 'plateNo', key: 'plateNo', width: 110 },
			{ title: '应付款日', dataIndex: 'dueDate', key: 'dueDate', width: 110 },
			{ title: '应收', dataIndex: 'receivable', key: 'receivable', align: 'right', render: fmtMoney },
			{ title: '未收', dataIndex: 'uncollected', key: 'uncollected', align: 'right', render: fmtMoney },
			{
				title: '超期天数',
				dataIndex: 'overdueDays',
				key: 'overdueDays',
				align: 'right',
				width: 96,
				render: function (v) {
					var n = Number(v);
					if (n > 14) return React.createElement(Tag, { color: 'error' }, v + ' 天');
					if (n > 0) return React.createElement(Tag, { color: 'warning' }, v + ' 天');
					return v;
				}
			}
		];
	}, []);

	var drillColumns = useMemo(function () {
		if (drill.type === 'lease') {
			return [
				{ title: '车牌号码', dataIndex: 'plateNo', key: 'plateNo', width: 110 },
				{ title: '应收', dataIndex: 'receivable', key: 'receivable', align: 'right', render: fmtMoney },
				{ title: '实收', dataIndex: 'received', key: 'received', align: 'right', render: fmtMoney },
				{ title: '未收', dataIndex: 'uncollected', key: 'uncollected', align: 'right', render: fmtMoney }
			];
		}
		return [
			{ title: '车牌', dataIndex: 'plateNo', key: 'plateNo', width: 110 },
			{ title: '出车日期', dataIndex: 'tripDate', key: 'tripDate', width: 110 },
			{ title: '金额', dataIndex: 'amount', key: 'amount', align: 'right', render: fmtMoney },
			{ title: '氢费', dataIndex: 'h2Fee', key: 'h2Fee', align: 'right', render: fmtMoney },
			{ title: 'ETC', dataIndex: 'etcFee', key: 'etcFee', align: 'right', render: fmtMoney }
		];
	}, [drill.type]);

	var handleExport = useCallback(function () {
		var headers = ['业务条线', '应收', '实收', '未收', '成本', '利润'];
		var body = [headers].concat(overviewRows.map(function (r) {
			return [r.line, r.receivable, r.received, r.uncollected, r.cost, r.profit];
		}));
		downloadCsv('客户服务部业务统计_' + ym.year + '_' + new Date().getTime() + '.csv', body);
		message.success('已导出经营总览');
	}, [overviewRows, ym.year]);

	var tabItems = useMemo(function () {
		return [
			{
				key: 'overview',
				label: '经营总览',
				children: React.createElement(Table, {
					className: 'cs-dept-stat-table',
					rowKey: 'key',
					size: 'small',
					bordered: true,
					pagination: false,
					scroll: { x: 900 },
					columns: overviewColumns,
					dataSource: overviewRows
				})
			},
			{
				key: 'lease',
				label: '租赁经营',
				children: React.createElement(Table, {
					className: 'cs-dept-stat-table',
					rowKey: 'key',
					size: 'small',
					bordered: true,
					pagination: { pageSize: 10, showSizeChanger: true },
					scroll: { x: 1100 },
					columns: leaseColumns,
					dataSource: leaseRows
				})
			},
			{
				key: 'logistics',
				label: '物流经营',
				children: React.createElement(Table, {
					className: 'cs-dept-stat-table',
					rowKey: 'key',
					size: 'small',
					bordered: true,
					pagination: { pageSize: 10, showSizeChanger: true },
					scroll: { x: 1100 },
					columns: logisticsColumns,
					dataSource: logisticsRows
				})
			},
			{
				key: 'energy',
				label: '能源销售',
				children: React.createElement(Table, {
					className: 'cs-dept-stat-table',
					rowKey: 'key',
					size: 'small',
					bordered: true,
					pagination: { pageSize: 10 },
					scroll: { x: 1000 },
					columns: energyColumns,
					dataSource: energyRows
				})
			},
			{
				key: 'account',
				label: '成本与账户',
				children: React.createElement(Table, {
					className: 'cs-dept-stat-table',
					rowKey: 'key',
					size: 'small',
					bordered: true,
					pagination: { pageSize: 10 },
					scroll: { x: 1000 },
					columns: accountColumns,
					dataSource: accountRows
				})
			},
			{
				key: 'uncollected',
				label: '未收预警',
				children: React.createElement(Table, {
					className: 'cs-dept-stat-table',
					rowKey: 'key',
					size: 'small',
					bordered: true,
					pagination: { pageSize: 10 },
					scroll: { x: 1100 },
					columns: uncollectedColumns,
					dataSource: uncollectedRows
				})
			}
		];
	}, [
		overviewColumns, overviewRows, leaseColumns, leaseRows, logisticsColumns, logisticsRows,
		energyColumns, energyRows, accountColumns, accountRows, uncollectedColumns, uncollectedRows
	]);

	return React.createElement(
		App,
		null,
		React.createElement('style', null, tableStyle),
		React.createElement(
			'div',
			{ style: layoutStyle },
			React.createElement(Breadcrumb, {
				style: { marginBottom: 12 },
				items: [
					{ title: '数据分析' },
					{ title: '客户服务部业务统计' }
				]
			}),
			React.createElement(
				Card,
				{ bordered: false, style: { marginBottom: 16 } },
				React.createElement('div', { style: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'rgba(0,0,0,0.88)' } }, pageTitle),
				React.createElement(
					Row,
					{ gutter: 16, align: 'bottom' },
					React.createElement(Col, { xs: 24, sm: 12, md: 6, lg: 4 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '统计年份'),
							React.createElement(DatePicker, {
								picker: 'year',
								style: filterControlStyle,
								value: yearDraft,
								onChange: setYearDraft,
								allowClear: false
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 6, lg: 4 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '统计月份'),
							React.createElement(Select, {
								style: filterControlStyle,
								value: monthDraft,
								onChange: setMonthDraft,
								options: monthOptions,
								allowClear: false
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 6, lg: 5 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '业务员'),
							React.createElement(Select, {
								style: filterControlStyle,
								value: spDraft,
								onChange: setSpDraft,
								options: spOptions,
								allowClear: true,
								showSearch: true,
								filterOption: filterOption,
								placeholder: '全部业务员'
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 6, lg: 5 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '客户名称'),
							React.createElement(Select, {
								style: filterControlStyle,
								value: cuDraft,
								onChange: setCuDraft,
								options: cuOptions,
								allowClear: true,
								showSearch: true,
								filterOption: filterOption,
								placeholder: '全部客户'
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 24, md: 24, lg: 6 },
						React.createElement(Space, { style: { marginBottom: 12 } },
							React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询'),
							React.createElement(Button, { onClick: handleReset }, '重置'),
							React.createElement(Button, { onClick: handleExport }, '导出总览')
						)
					)
				)
			),
			React.createElement(
				Row,
				{ gutter: 16, style: { marginBottom: 16 }, className: 'cs-dept-kpi' },
				React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 4 },
					React.createElement(Card, { size: 'small', bordered: false },
						React.createElement(Statistic, { title: '总收入（应收口径）', value: kpi.totalRevenue, precision: 2, suffix: '元' })
					)
				),
				React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 4 },
					React.createElement(Card, { size: 'small', bordered: false },
						React.createElement(Statistic, { title: '总利润', value: kpi.totalProfit, precision: 2, suffix: '元', valueStyle: { color: '#00b42a' } })
					)
				),
				React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 4 },
					React.createElement(Card, { size: 'small', bordered: false },
						React.createElement(Statistic, { title: '未收余额', value: kpi.uncollected, precision: 2, suffix: '元', valueStyle: { color: '#f53f3f' } })
					)
				),
				React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 4 },
					React.createElement(Card, { size: 'small', bordered: false },
						React.createElement(Statistic, { title: '氢电账户结余', value: kpi.accountBalance, precision: 2, suffix: '元' })
					)
				),
				React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 4 },
					React.createElement(Card, { size: 'small', bordered: false },
						React.createElement(Statistic, { title: '在营车辆', value: kpi.activeVehicles, suffix: '台' })
					)
				)
			),
			React.createElement(
				Card,
				{ bordered: false, bodyStyle: { paddingTop: 12 } },
				React.createElement(Tabs, {
					activeKey: activeTab,
					onChange: setActiveTab,
					items: tabItems,
					destroyInactiveTabPane: false
				}),
				React.createElement('div', { style: { marginTop: 12, fontSize: 12, color: 'rgba(0,0,0,0.45)' } },
					'说明：数据为原型演示；联调后由租赁/物流/能源/收支管控等台账子表汇总写入。租赁、物流汇总行可点击「明细」钻取至车辆/运单层级。'
				)
			),
			React.createElement(Modal, {
				title: drill.title || '明细',
				open: drill.open,
				onCancel: closeDrill,
				footer: null,
				width: 720,
				destroyOnClose: true
			},
				React.createElement(Table, {
					rowKey: 'key',
					size: 'small',
					bordered: true,
					pagination: false,
					columns: drillColumns,
					dataSource: drill.rows
				})
			)
		)
	);
};
