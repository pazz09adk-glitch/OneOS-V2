// 【重要】必须使用 const Component 作为组件变量名
// 数据分析 - 租赁车辆收入明细（租赁业务明细 Tab + 租赁业务盈亏月度汇总 Tab，汇总交互参考「业务部业绩明细」）

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
	var message = antd.message;

	var TableSummary = Table.Summary;
	var SummaryRow = TableSummary.Row;
	var SummaryCell = TableSummary.Cell;

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function fmtCell(n) {
		if (n === null || n === undefined || n === '') return '—';
		var x = Number(n);
		if (isNaN(x)) return '—';
		if (x === 0) return '—';
		return x.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function fmtSum(n) {
		var x = Number(n);
		if (isNaN(x)) return '—';
		return x.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
	}

	function fmtTextSlash(s) {
		if (s === null || s === undefined || String(s).trim() === '') return '/';
		return String(s);
	}

	function escapeCsv(v) {
		var s = v == null ? '' : String(v);
		if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1 || s.indexOf('\r') !== -1) {
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

	function getLastMonthStatKey() {
		try {
			if (window.dayjs) return window.dayjs().subtract(1, 'month').format('YYYY-MM');
		} catch (e1) {}
		var d = new Date();
		d.setDate(1);
		d.setMonth(d.getMonth() - 1);
		var y = d.getFullYear();
		var mo = d.getMonth() + 1;
		return y + '-' + (mo < 10 ? '0' + mo : '' + mo);
	}

	function getLastMonthPickerValue() {
		try {
			if (window.dayjs) return window.dayjs().subtract(1, 'month').startOf('month');
		} catch (e1) {}
		try {
			if (window.moment) return window.moment().subtract(1, 'month').startOf('month');
		} catch (e2) {}
		return null;
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var tableSingleLineStyle =
		'.lease-income-detail-table .ant-table-thead th,.lease-income-detail-table .ant-table-tbody td,.lease-income-detail-table .ant-table-summary td{white-space:nowrap;}';
	var tableMonthlyLineStyle =
		'.lease-pl-monthly-table .ant-table-thead th,.lease-pl-monthly-table .ant-table-tbody td,.lease-pl-monthly-table .ant-table-summary td{white-space:nowrap;}';
	var tabsBarStyle = '.lease-income-tabs .ant-tabs-nav{margin-bottom:0;}';

	var bizReportTableTitleStyle = {
		textAlign: 'center',
		marginBottom: 16,
		fontSize: 16,
		fontWeight: 600,
		color: 'rgba(0,0,0,0.88)'
	};

	var outstandingPositiveStyle = { color: '#cf1322' };

	var numericSumKeys = [
		'deposit',
		'receivable',
		'received',
		'outstanding',
		'naturalMonthIncome',
		'hydrogenPrepay',
		'baseCost',
		'brokerage',
		'hydrogenFee',
		'totalCost'
	];

	/** 月度盈亏汇总表：各月金额列 + 盈亏（自然月收入 − 总成本，可负） */
	var monthlyPLKeys = numericSumKeys.concat(['profit']);

	function sumMonthlyRows(rows, keys) {
		var sums = {};
		keys.forEach(function (k) {
			sums[k] = (rows || []).reduce(function (acc, row) {
				var v = row[k];
				var n = v === null || v === undefined || v === '' ? 0 : Number(v);
				return acc + (isNaN(n) ? 0 : n);
			}, 0);
		});
		return sums;
	}

	function finalizeLeaseMonthlyRow(r) {
		var inc = r.naturalMonthIncome;
		var tc = r.totalCost;
		var profit = null;
		if (inc != null && inc !== '' && tc != null && tc !== '') {
			var a = Number(inc);
			var b = Number(tc);
			if (!isNaN(a) && !isNaN(b)) profit = a - b;
		}
		return Object.assign({}, r, { profit: profit });
	}

	function sumRows(rows, keys) {
		var sums = {};
		keys.forEach(function (k) {
			sums[k] = (rows || []).reduce(function (acc, row) {
				var v = row[k];
				var n = v === null || v === undefined || v === '' ? 0 : Number(v);
				return acc + (isNaN(n) ? 0 : n);
			}, 0);
		});
		return sums;
	}

	var lastMonthStatKey = useMemo(function () {
		return getLastMonthStatKey();
	}, []);

	var deptOptions = useMemo(function () {
		return [
			{ value: '业务二部', label: '业务二部' },
			{ value: '业务一部', label: '业务一部' }
		];
	}, []);

	var rawRowsTemplate = useMemo(function () {
		var sm = lastMonthStatKey;
		return [
			{
				key: 'lv-1',
				statMonth: sm,
				plateNo: '沪A52898F',
				vehicleType: '18T',
				salesperson: '刘念忠',
				nature: '纯租赁',
				systemModel: '飞驰18T',
				customerName: '上海虹钦物流有限公司',
				contractDate: '2025.12.1-2026.11.30',
				pickupDate: '2025-12-08',
				deposit: 20000,
				receivable: 18500,
				received: 18500,
				outstanding: 0,
				naturalMonthIncome: 18500,
				paymentDate: '2026-02-05',
				hydrogenPrepay: 5000,
				paymentMethod: '月付指付',
				invoiceApplyDate: '2026-02-06',
				baseCost: 12000,
				brokerage: 800,
				hydrogenFee: 3200,
				totalCost: 16000
			},
			{
				key: 'lv-2',
				statMonth: sm,
				plateNo: '粤AGF4535',
				vehicleType: '4.5T',
				salesperson: '冉建华',
				nature: '试用车',
				systemModel: '现代4.5T',
				customerName: '杭州绿道城配科技有限公司',
				contractDate: '2026.1.1-2026.12.31',
				pickupDate: '',
				deposit: 4500,
				receivable: 4200,
				received: 3000,
				outstanding: 1200,
				naturalMonthIncome: 4200,
				paymentDate: '',
				hydrogenPrepay: 0,
				paymentMethod: '季度指付',
				invoiceApplyDate: '',
				baseCost: 2800,
				brokerage: 0,
				hydrogenFee: 900,
				totalCost: 3700
			},
			{
				key: 'lv-3',
				statMonth: sm,
				plateNo: '浙A88888F',
				vehicleType: '49T',
				salesperson: '刘念忠',
				nature: '纯租赁',
				systemModel: '苏龙18T',
				customerName: '宁波港联氢运物流有限公司',
				contractDate: '2025.11.15-2026.11.14',
				pickupDate: '2025-11-20',
				deposit: 50000,
				receivable: 26800,
				received: 20000,
				outstanding: 6800,
				naturalMonthIncome: 26800,
				paymentDate: '2026-01-28',
				hydrogenPrepay: 12000,
				paymentMethod: '月付指付',
				invoiceApplyDate: '2026-01-30',
				baseCost: 18500,
				brokerage: 1500,
				hydrogenFee: 6200,
				totalCost: 26200
			},
			{
				key: 'lv-4',
				statMonth: sm,
				plateNo: '苏E66666F',
				vehicleType: '4.5T',
				salesperson: '冉建华',
				nature: '纯租赁',
				systemModel: '现代4.5T',
				customerName: '嘉兴南湖氢能示范运营',
				contractDate: '2026.2.1-2027.1.31',
				pickupDate: '2026-02-10',
				deposit: 8000,
				receivable: 3800,
				received: 3800,
				outstanding: 0,
				naturalMonthIncome: 3800,
				paymentDate: '2026-02-12',
				hydrogenPrepay: 2000,
				paymentMethod: '月付指付',
				invoiceApplyDate: '2026-02-15',
				baseCost: 2100,
				brokerage: 200,
				hydrogenFee: 650,
				totalCost: 2950
			}
		];
	}, [lastMonthStatKey]);

	var salespersonOptions = useMemo(function () {
		var set = {};
		(rawRowsTemplate || []).forEach(function (r) {
			if (r.salesperson) set[r.salesperson] = true;
		});
		return Object.keys(set).map(function (n) { return { value: n, label: n }; });
	}, [rawRowsTemplate]);

	var customerOptions = useMemo(function () {
		var set = {};
		(rawRowsTemplate || []).forEach(function (r) {
			if (r.customerName) set[r.customerName] = true;
		});
		return Object.keys(set).map(function (n) { return { value: n, label: n }; });
	}, [rawRowsTemplate]);

	/** 原型：按年 1–12 月租赁业务金额汇总（联调后由接口按年返回） */
	var monthlyLeasePL2026 = useMemo(function () {
		var raw = [
			{ month: 1, deposit: 120000, receivable: 98500, received: 92000, outstanding: 6500, naturalMonthIncome: 92000, hydrogenPrepay: 18000, baseCost: 62000, brokerage: 4200, hydrogenFee: 15000, totalCost: 81200 },
			{ month: 2, deposit: 45000, receivable: 53200, received: 48000, outstanding: 5200, naturalMonthIncome: 50500, hydrogenPrepay: 8000, baseCost: 31000, brokerage: 800, hydrogenFee: 9800, totalCost: 41600 },
			{ month: 3, deposit: null, receivable: 66800, received: 66800, outstanding: 0, naturalMonthIncome: 66800, hydrogenPrepay: null, baseCost: 40200, brokerage: 1500, hydrogenFee: 12100, totalCost: 53800 },
			{ month: 4, deposit: null, receivable: null, received: null, outstanding: null, naturalMonthIncome: null, hydrogenPrepay: null, baseCost: null, brokerage: null, hydrogenFee: null, totalCost: null },
			{ month: 5, deposit: null, receivable: null, received: null, outstanding: null, naturalMonthIncome: null, hydrogenPrepay: null, baseCost: null, brokerage: null, hydrogenFee: null, totalCost: null },
			{ month: 6, deposit: null, receivable: null, received: null, outstanding: null, naturalMonthIncome: null, hydrogenPrepay: null, baseCost: null, brokerage: null, hydrogenFee: null, totalCost: null },
			{ month: 7, deposit: null, receivable: null, received: null, outstanding: null, naturalMonthIncome: null, hydrogenPrepay: null, baseCost: null, brokerage: null, hydrogenFee: null, totalCost: null },
			{ month: 8, deposit: null, receivable: null, received: null, outstanding: null, naturalMonthIncome: null, hydrogenPrepay: null, baseCost: null, brokerage: null, hydrogenFee: null, totalCost: null },
			{ month: 9, deposit: null, receivable: null, received: null, outstanding: null, naturalMonthIncome: null, hydrogenPrepay: null, baseCost: null, brokerage: null, hydrogenFee: null, totalCost: null },
			{ month: 10, deposit: null, receivable: null, received: null, outstanding: null, naturalMonthIncome: null, hydrogenPrepay: null, baseCost: null, brokerage: null, hydrogenFee: null, totalCost: null },
			{ month: 11, deposit: null, receivable: null, received: null, outstanding: null, naturalMonthIncome: null, hydrogenPrepay: null, baseCost: null, brokerage: null, hydrogenFee: null, totalCost: null },
			{ month: 12, deposit: null, receivable: null, received: null, outstanding: null, naturalMonthIncome: null, hydrogenPrepay: null, baseCost: null, brokerage: null, hydrogenFee: null, totalCost: null }
		];
		return raw.map(function (x) {
			return finalizeLeaseMonthlyRow(Object.assign({ key: 'lease-pl-' + x.month }, x));
		});
	}, []);

	var mainTabState = useState('detail');
	var mainTab = mainTabState[0];
	var setMainTab = mainTabState[1];

	function initialYear2026() {
		try {
			if (window.dayjs) return window.dayjs('2026-01-01');
		} catch (e1) {}
		return null;
	}

	var summaryYearDraftState = useState(initialYear2026);
	var summaryYearDraft = summaryYearDraftState[0];
	var setSummaryYearDraft = summaryYearDraftState[1];

	var summaryYearAppliedState = useState(initialYear2026);
	var summaryYearApplied = summaryYearAppliedState[0];
	var setSummaryYearApplied = summaryYearAppliedState[1];

	var draftState = useState(function () {
		return {
			month: getLastMonthPickerValue(),
			salesperson: undefined,
			customerName: undefined,
			dept: '业务二部'
		};
	});
	var draft = draftState[0];
	var setDraft = draftState[1];

	var appliedState = useState(function () {
		return {
			month: getLastMonthPickerValue(),
			salesperson: undefined,
			customerName: undefined,
			dept: '业务二部'
		};
	});
	var applied = appliedState[0];
	var setApplied = appliedState[1];

	var filteredRows = useMemo(function () {
		return (rawRowsTemplate || []).filter(function (r) {
			if (applied.month && applied.month.format) {
				var mk = applied.month.format('YYYY-MM');
				if (r.statMonth !== mk) return false;
			}
			if (applied.salesperson && r.salesperson !== applied.salesperson) return false;
			if (applied.customerName && r.customerName !== applied.customerName) return false;
			return true;
		});
	}, [rawRowsTemplate, applied.month, applied.salesperson, applied.customerName]);

	var columnSums = useMemo(function () {
		return sumRows(filteredRows, numericSumKeys);
	}, [filteredRows]);

	var reportTitle = useMemo(function () {
		var dept = applied.dept || '业务二部';
		if (applied.month && applied.month.format) {
			var y = applied.month.format('YYYY');
			return y + '年浙江羚牛氢能租赁车辆收入明细表（' + dept + '）';
		}
		return '浙江羚牛氢能租赁车辆收入明细表（' + dept + '）';
	}, [applied.month, applied.dept]);

	var plSumTableTitle = useMemo(function () {
		if (summaryYearApplied && summaryYearApplied.format) {
			return '租赁业务' + summaryYearApplied.format('YYYY') + '年盈亏月度汇总';
		}
		return '租赁业务盈亏月度汇总';
	}, [summaryYearApplied]);

	var monthlyDataSource = useCallback(function (rows) {
		var y = summaryYearApplied && summaryYearApplied.format ? summaryYearApplied.format('YYYY') : null;
		if (!y) return [];
		if (y !== '2026') return [];
		return rows;
	}, [summaryYearApplied]);

	var plMonthlyRows = useMemo(function () { return monthlyDataSource(monthlyLeasePL2026); }, [monthlyDataSource, monthlyLeasePL2026]);
	var plMonthlySums = useMemo(function () { return sumMonthlyRows(plMonthlyRows, monthlyPLKeys); }, [plMonthlyRows]);

	var handleQuery = useCallback(function () {
		setApplied(Object.assign({}, draft));
	}, [draft]);

	var handleReset = useCallback(function () {
		var def = {
			month: getLastMonthPickerValue(),
			salesperson: undefined,
			customerName: undefined,
			dept: '业务二部'
		};
		setDraft(def);
		setApplied(def);
	}, []);

	var handleSummaryQuery = useCallback(function () {
		setSummaryYearApplied(summaryYearDraft);
	}, [summaryYearDraft]);

	var handleSummaryReset = useCallback(function () {
		var y0 = initialYear2026();
		setSummaryYearDraft(y0);
		setSummaryYearApplied(y0);
	}, []);

	var handleExport = useCallback(function () {
		var rows = filteredRows;
		if (!rows || rows.length === 0) {
			message.warning('当前无数据可导出');
			return;
		}
		var headers = [
			'车牌号码',
			'车型',
			'业务员',
			'性质',
			'系统车型',
			'客户名称',
			'合同日期',
			'提车日期',
			'押金',
			'应收',
			'实收',
			'未收',
			'自然月收入',
			'付款日期',
			'氢费预充值',
			'付款方式',
			'申请开票日期',
			'成本',
			'居间费',
			'氢费',
			'总成本'
		];
		var line = function (r) {
			return [
				r.plateNo,
				r.vehicleType,
				r.salesperson,
				r.nature,
				r.systemModel,
				r.customerName,
				fmtTextSlash(r.contractDate),
				fmtTextSlash(r.pickupDate),
				fmtCell(r.deposit),
				fmtCell(r.receivable),
				fmtCell(r.received),
				fmtCell(r.outstanding),
				fmtCell(r.naturalMonthIncome),
				fmtTextSlash(r.paymentDate),
				fmtCell(r.hydrogenPrepay),
				fmtTextSlash(r.paymentMethod),
				fmtTextSlash(r.invoiceApplyDate),
				fmtCell(r.baseCost),
				fmtCell(r.brokerage),
				fmtCell(r.hydrogenFee),
				fmtCell(r.totalCost)
			];
		};
		var body = [headers].concat(rows.map(line));
		body.push([
			'汇总', '', '', '', '', '', '', '',
			fmtSum(columnSums.deposit),
			fmtSum(columnSums.receivable),
			fmtSum(columnSums.received),
			fmtSum(columnSums.outstanding),
			fmtSum(columnSums.naturalMonthIncome),
			'',
			fmtSum(columnSums.hydrogenPrepay),
			'', '',
			fmtSum(columnSums.baseCost),
			fmtSum(columnSums.brokerage),
			fmtSum(columnSums.hydrogenFee),
			fmtSum(columnSums.totalCost)
		]);
		downloadCsv('租赁车辆收入明细_' + new Date().getTime() + '.csv', body);
		message.success('已导出 ' + rows.length + ' 条记录');
	}, [filteredRows, columnSums]);

	var handleExportPLMonthly = useCallback(function () {
		var rows = plMonthlyRows;
		if (!rows || rows.length === 0) {
			message.warning('当前无数据可导出，请先选择年份并查询');
			return;
		}
		var headers = [
			'月份',
			'押金',
			'应收',
			'实收',
			'未收',
			'自然月收入',
			'氢费预充值',
			'成本',
			'居间费',
			'氢费',
			'总成本',
			'盈亏'
		];
		var body = [headers].concat(
			rows.map(function (r) {
				return [
					String(r.month),
					fmtCell(r.deposit),
					fmtCell(r.receivable),
					fmtCell(r.received),
					fmtCell(r.outstanding),
					fmtCell(r.naturalMonthIncome),
					fmtCell(r.hydrogenPrepay),
					fmtCell(r.baseCost),
					fmtCell(r.brokerage),
					fmtCell(r.hydrogenFee),
					fmtCell(r.totalCost),
					fmtCell(r.profit)
				];
			})
		);
		body.push(['总计'].concat(monthlyPLKeys.map(function (k) { return fmtSum(plMonthlySums[k] || 0); })));
		downloadCsv('租赁业务盈亏月度汇总_' + new Date().getTime() + '.csv', body);
		message.success('已导出 ' + rows.length + ' 个月度数据');
	}, [plMonthlyRows, plMonthlySums]);

	function renderOutstanding(v) {
		var s = fmtCell(v);
		if (v !== null && v !== undefined && v !== '' && !isNaN(Number(v)) && Number(v) > 0) {
			return React.createElement('span', { style: outstandingPositiveStyle }, s);
		}
		return s;
	}

	var columns = useMemo(function () {
		return [
			{ title: '车牌号码', dataIndex: 'plateNo', key: 'plateNo', width: 110, fixed: 'left', align: 'center' },
			{ title: '车型', dataIndex: 'vehicleType', key: 'vehicleType', width: 72, align: 'center' },
			{ title: '业务员', dataIndex: 'salesperson', key: 'salesperson', width: 88, align: 'center' },
			{ title: '性质', dataIndex: 'nature', key: 'nature', width: 88, align: 'center' },
			{ title: '系统车型', dataIndex: 'systemModel', key: 'systemModel', width: 100, align: 'center' },
			{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 200, ellipsis: true },
			{ title: '合同日期', dataIndex: 'contractDate', key: 'contractDate', width: 168, render: function (v) { return fmtTextSlash(v); } },
			{ title: '提车日期', dataIndex: 'pickupDate', key: 'pickupDate', width: 110, render: function (v) { return fmtTextSlash(v); } },
			{ title: '押金', dataIndex: 'deposit', key: 'deposit', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '应收', dataIndex: 'receivable', key: 'receivable', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '实收', dataIndex: 'received', key: 'received', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '未收', dataIndex: 'outstanding', key: 'outstanding', width: 100, align: 'right', render: function (v) { return renderOutstanding(v); } },
			{ title: '自然月收入', dataIndex: 'naturalMonthIncome', key: 'naturalMonthIncome', width: 118, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '付款日期', dataIndex: 'paymentDate', key: 'paymentDate', width: 110, render: function (v) { return fmtTextSlash(v); } },
			{ title: '氢费预充值', dataIndex: 'hydrogenPrepay', key: 'hydrogenPrepay', width: 110, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '付款方式', dataIndex: 'paymentMethod', key: 'paymentMethod', width: 100, render: function (v) { return fmtTextSlash(v); } },
			{ title: '申请开票日期', dataIndex: 'invoiceApplyDate', key: 'invoiceApplyDate', width: 120, render: function (v) { return fmtTextSlash(v); } },
			{ title: '成本', dataIndex: 'baseCost', key: 'baseCost', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '居间费', dataIndex: 'brokerage', key: 'brokerage', width: 90, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '氢费', dataIndex: 'hydrogenFee', key: 'hydrogenFee', width: 90, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '总成本', dataIndex: 'totalCost', key: 'totalCost', width: 110, align: 'right', render: function (v) { return fmtCell(v); } }
		];
	}, []);

	var columnsPLMonthly = useMemo(function () {
		return [
			{ title: '月份', dataIndex: 'month', key: 'month', width: 72, align: 'center' },
			{ title: '押金', dataIndex: 'deposit', key: 'deposit', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '应收', dataIndex: 'receivable', key: 'receivable', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '实收', dataIndex: 'received', key: 'received', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '未收', dataIndex: 'outstanding', key: 'outstanding', width: 100, align: 'right', render: function (v) { return renderOutstanding(v); } },
			{ title: '自然月收入', dataIndex: 'naturalMonthIncome', key: 'naturalMonthIncome', width: 118, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '氢费预充值', dataIndex: 'hydrogenPrepay', key: 'hydrogenPrepay', width: 110, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '成本', dataIndex: 'baseCost', key: 'baseCost', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '居间费', dataIndex: 'brokerage', key: 'brokerage', width: 90, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '氢费', dataIndex: 'hydrogenFee', key: 'hydrogenFee', width: 90, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '总成本', dataIndex: 'totalCost', key: 'totalCost', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '盈亏', dataIndex: 'profit', key: 'profit', width: 100, align: 'right', render: function (v) { return fmtCell(v); } }
		];
	}, []);

	function renderPLMonthlySummary(sums) {
		return function () {
			return React.createElement(
				TableSummary,
				null,
				React.createElement(
					SummaryRow,
					null,
					React.createElement(SummaryCell, { index: 0, align: 'center' }, '总计'),
					monthlyPLKeys.map(function (k, idx) {
						var cell = fmtSum(sums[k] || 0);
						if (k === 'outstanding' && Number(sums.outstanding) > 0) {
							cell = React.createElement('span', { style: outstandingPositiveStyle }, fmtSum(sums.outstanding || 0));
						}
						return React.createElement(
							SummaryCell,
							{ key: k, index: idx + 1, align: 'right' },
							cell
						);
					})
				)
			);
		};
	}

	var renderYearFilterCard = useCallback(function () {
		return React.createElement(Card, { style: { marginBottom: 16 } },
			React.createElement(Row, { gutter: [16, 16], align: 'bottom' },
				React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
					React.createElement('div', { style: filterItemStyle },
						React.createElement('div', { style: filterLabelStyle }, '选择年份'),
						React.createElement(DatePicker, {
							picker: 'year',
							style: filterControlStyle,
							placeholder: '请选择统计年份',
							format: 'YYYY',
							value: summaryYearDraft,
							onChange: function (v) { setSummaryYearDraft(v); }
						})
					)
				)
			),
			React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
				React.createElement(Button, { onClick: handleSummaryReset }, '重置'),
				React.createElement(Button, { type: 'primary', onClick: handleSummaryQuery }, '查询')
			)
		);
	}, [summaryYearDraft, handleSummaryReset, handleSummaryQuery]);

	var tableSummary = useCallback(function () {
		return React.createElement(
			TableSummary,
			null,
			React.createElement(
				SummaryRow,
				null,
				React.createElement(SummaryCell, { index: 0, align: 'center', colSpan: 8 }, '汇总'),
				React.createElement(SummaryCell, { index: 8, align: 'right' }, fmtSum(columnSums.deposit)),
				React.createElement(SummaryCell, { index: 9, align: 'right' }, fmtSum(columnSums.receivable)),
				React.createElement(SummaryCell, { index: 10, align: 'right' }, fmtSum(columnSums.received)),
				React.createElement(SummaryCell, { index: 11, align: 'right' },
					Number(columnSums.outstanding) > 0
						? React.createElement('span', { style: outstandingPositiveStyle }, fmtSum(columnSums.outstanding))
						: fmtSum(columnSums.outstanding)
				),
				React.createElement(SummaryCell, { index: 12, align: 'right' }, fmtSum(columnSums.naturalMonthIncome)),
				React.createElement(SummaryCell, { index: 13, align: 'center' }, '—'),
				React.createElement(SummaryCell, { index: 14, align: 'right' }, fmtSum(columnSums.hydrogenPrepay)),
				React.createElement(SummaryCell, { index: 15, align: 'center' }, '—'),
				React.createElement(SummaryCell, { index: 16, align: 'center' }, '—'),
				React.createElement(SummaryCell, { index: 17, align: 'right' }, fmtSum(columnSums.baseCost)),
				React.createElement(SummaryCell, { index: 18, align: 'right' }, fmtSum(columnSums.brokerage)),
				React.createElement(SummaryCell, { index: 19, align: 'right' }, fmtSum(columnSums.hydrogenFee)),
				React.createElement(SummaryCell, { index: 20, align: 'right' }, fmtSum(columnSums.totalCost))
			)
		);
	}, [columnSums]);

	var tabItems = [
		{
			key: 'detail',
			label: '租赁业务明细',
			children: React.createElement(React.Fragment, null,
				React.createElement(Card, { style: { marginBottom: 16 } },
					React.createElement(Row, { gutter: [16, 16], align: 'bottom' },
						React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '统计月份'),
								React.createElement(DatePicker, {
									picker: 'month',
									style: filterControlStyle,
									placeholder: '请选择年-月',
									format: 'YYYY-MM',
									value: draft.month,
									onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { month: v }); }); }
								})
							)
						),
						React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '业务部门'),
								React.createElement(Select, {
									placeholder: '请选择业务部门',
									style: filterControlStyle,
									options: deptOptions,
									value: draft.dept,
									onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { dept: v }); }); }
								})
							)
						),
						React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '业务员'),
								React.createElement(Select, {
									placeholder: '请选择业务员',
									style: filterControlStyle,
									allowClear: true,
									options: salespersonOptions,
									value: draft.salesperson,
									onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { salesperson: v }); }); },
									showSearch: true,
									filterOption: filterOption
								})
							)
						),
						React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '客户名称'),
								React.createElement(Select, {
									placeholder: '请选择客户名称',
									style: filterControlStyle,
									allowClear: true,
									options: customerOptions,
									value: draft.customerName,
									onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { customerName: v }); }); },
									showSearch: true,
									filterOption: filterOption
								})
							)
						)
					),
					React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
						React.createElement(Button, { onClick: handleReset }, '重置'),
						React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
					)
				),
				React.createElement(Card, {
					extra: React.createElement(Button, { onClick: handleExport }, '导出')
				},
					React.createElement('div', { style: bizReportTableTitleStyle }, reportTitle),
					React.createElement('style', null, tableSingleLineStyle),
					React.createElement('div', { className: 'lease-income-detail-table' },
						React.createElement(Table, {
							rowKey: 'key',
							columns: columns,
							dataSource: filteredRows,
							pagination: false,
							size: 'small',
							summary: tableSummary,
							scroll: { x: 2680 }
						})
					)
				)
			)
		},
		{
			key: 'monthlyPL',
			label: '租赁业务盈亏月度汇总',
			children: React.createElement(React.Fragment, null,
				renderYearFilterCard(),
				React.createElement(Card, {
					extra: React.createElement(Button, { onClick: handleExportPLMonthly }, '导出')
				},
					React.createElement('div', { style: bizReportTableTitleStyle }, plSumTableTitle),
					React.createElement('style', null, tableMonthlyLineStyle),
					React.createElement('div', { className: 'lease-pl-monthly-table' },
						React.createElement(Table, {
							rowKey: 'key',
							columns: columnsPLMonthly,
							dataSource: plMonthlyRows,
							pagination: false,
							size: 'small',
							summary: renderPLMonthlySummary(plMonthlySums),
							scroll: { x: 1320 }
						})
					)
				)
			)
		}
	];

	return React.createElement(App, null,
		React.createElement('div', { style: layoutStyle },
			React.createElement(Breadcrumb, {
				style: { marginBottom: 16 },
				items: [{ title: '数据分析' }, { title: '租赁车辆收入明细' }]
			}),
			React.createElement(Card, null,
				React.createElement('style', null, tabsBarStyle),
				React.createElement(Tabs, {
					className: 'lease-income-tabs',
					activeKey: mainTab,
					onChange: function (k) { setMainTab(k); },
					items: tabItems
				})
			)
		)
	);
};
