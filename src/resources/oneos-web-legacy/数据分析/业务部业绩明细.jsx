// 【重要】必须使用 const Component 作为组件变量名
// 数据分析 - 业务部业绩（明细 + 业绩/成本/利润汇总 Tab）
// 明细：进入页面默认统计「上一自然月」；跨月后重新进入或刷新页面，默认月份随系统日期更新为上一个月。

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
	var message = antd.message;

	var TableSummary = Table.Summary;
	var SummaryRow = TableSummary.Row;
	var SummaryCell = TableSummary.Cell;

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	/** 表格正文：千分位 + 两位小数；空或 0 显示 -（利润等可为负，仍正常显示） */
	function fmtCell(n) {
		if (n === null || n === undefined || n === '') return '-';
		var x = Number(n);
		if (isNaN(x)) return '-';
		if (x === 0) return '-';
		return x.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	/** 总计行 */
	function fmtSum(n) {
		var x = Number(n);
		if (isNaN(x)) return '-';
		return x.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
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

	/** 统计月份键 YYYY-MM（上一自然月；每月初「上月」随系统日期变化，刷新/重新进入页面即更新） */
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

	/** 月份选择器默认值（与 getLastMonthStatKey 同一自然月） */
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
	/** 与筛选项同一行时，将操作列推到右侧 */
	var filterActionsColStyle = { flex: '0 0 auto', marginLeft: 'auto' };
	var tableSingleLineStyle =
		'.biz-dept-perf-table .ant-table-thead th,.biz-dept-perf-table .ant-table-tbody td,.biz-dept-perf-table .ant-table-summary td{white-space:nowrap;}';
	var tabsBarStyle = '.biz-dept-perf-tabs .ant-tabs-nav{margin-bottom:0;}';

	var monthlyMetricKeys = ['logistics', 'lease', 'sales', 'hydrogen', 'electricity', 'etc', 'other', 'total'];

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

	function monthlyColumnsFor(suffix) {
		if (suffix === '业绩') {
			return [
				{ title: '月份', dataIndex: 'month', key: 'month', width: 72, align: 'center' },
				{ title: '物流业绩', dataIndex: 'logistics', key: 'logistics', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: '租赁业绩', dataIndex: 'lease', key: 'lease', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: '销售业绩', dataIndex: 'sales', key: 'sales', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: '氢费业绩', dataIndex: 'hydrogen', key: 'hydrogen', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: '电费业绩', dataIndex: 'electricity', key: 'electricity', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: 'ETC业绩', dataIndex: 'etc', key: 'etc', width: 110, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: '其他', dataIndex: 'other', key: 'other', width: 110, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: '合计', dataIndex: 'total', key: 'total', width: 120, align: 'center', render: function (v) { return fmtCell(v); } }
			];
		}
		if (suffix === '成本') {
			return [
				{ title: '月份', dataIndex: 'month', key: 'month', width: 72, align: 'center' },
				{ title: '物流成本', dataIndex: 'logistics', key: 'logistics', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: '租赁成本', dataIndex: 'lease', key: 'lease', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: '销售成本', dataIndex: 'sales', key: 'sales', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: '氢费成本', dataIndex: 'hydrogen', key: 'hydrogen', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: '电费成本', dataIndex: 'electricity', key: 'electricity', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: 'ETC成本', dataIndex: 'etc', key: 'etc', width: 110, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: '其他', dataIndex: 'other', key: 'other', width: 110, align: 'center', render: function (v) { return fmtCell(v); } },
				{ title: '合计', dataIndex: 'total', key: 'total', width: 120, align: 'center', render: function (v) { return fmtCell(v); } }
			];
		}
		return [
			{ title: '月份', dataIndex: 'month', key: 'month', width: 72, align: 'center' },
			{ title: '物流利润', dataIndex: 'logistics', key: 'logistics', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: '租赁利润', dataIndex: 'lease', key: 'lease', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: '销售利润', dataIndex: 'sales', key: 'sales', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: '氢费利润', dataIndex: 'hydrogen', key: 'hydrogen', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: '电费利润', dataIndex: 'electricity', key: 'electricity', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: 'ETC利润', dataIndex: 'etc', key: 'etc', width: 110, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: '其他', dataIndex: 'other', key: 'other', width: 110, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: '合计', dataIndex: 'total', key: 'total', width: 120, align: 'center', render: function (v) { return fmtCell(v); } }
		];
	}

	function rowTotal(r) {
		var keys = ['logistics', 'lease', 'sales', 'hydrogen', 'electricity', 'etc', 'other'];
		var s = 0;
		var any = false;
		keys.forEach(function (k) {
			var v = r[k];
			if (v === null || v === undefined || v === '') return;
			var n = Number(v);
			if (isNaN(n)) return;
			any = true;
			s += n;
		});
		return any ? s : null;
	}

	function finalizeMonthlyRow(r) {
		var t = r.total != null && r.total !== '' ? r.total : rowTotal(r);
		return Object.assign({}, r, { total: t });
	}

	/** 原型：2026 年按月业绩汇总 */
	var monthlyPerf2026 = useMemo(function () {
		var raw = [
			{ month: 1, logistics: 1005557.94, lease: 4004.73, sales: 1495355.18, hydrogen: null, electricity: 88200.5, etc: 12000, other: 5000, total: null },
			{ month: 2, logistics: 250000, lease: 180000, sales: null, hydrogen: 3200, electricity: null, etc: null, other: null, total: null },
			{ month: 3, logistics: 180000, lease: 95000, sales: 220000, hydrogen: null, electricity: 45000, etc: 8000, other: 1200, total: null },
			{ month: 4, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 5, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 6, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 7, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 8, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 9, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 10, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 11, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 12, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null }
		];
		return raw.map(function (x) {
			return finalizeMonthlyRow(Object.assign({ key: 'perf-' + x.month }, x));
		});
	}, []);

	/** 原型：2026 年按月成本汇总 */
	var monthlyCost2026 = useMemo(function () {
		var raw = [
			{ month: 1, logistics: 1167787.05, lease: 320000, sales: 980000, hydrogen: 15000, electricity: 72000, etc: 9800, other: 2400, total: null },
			{ month: 2, logistics: 210000, lease: 165000, sales: null, hydrogen: 2800, electricity: null, etc: null, other: null, total: null },
			{ month: 3, logistics: 155000, lease: 88000, sales: 195000, hydrogen: null, electricity: 38000, etc: 6500, other: 800, total: null },
			{ month: 4, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 5, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 6, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 7, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 8, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 9, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 10, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 11, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 12, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null }
		];
		return raw.map(function (x) {
			return finalizeMonthlyRow(Object.assign({ key: 'cost-' + x.month }, x));
		});
	}, []);

	/** 原型：2026 年按月利润汇总（可为负） */
	var monthlyProfit2026 = useMemo(function () {
		var raw = [
			{ month: 1, logistics: -162229.11, lease: 45000, sales: null, hydrogen: -1200.5, electricity: 6200, etc: null, other: 800, total: null },
			{ month: 2, logistics: null, lease: 15000, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 3, logistics: null, lease: 7000, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 4, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 5, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 6, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 7, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 8, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 9, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 10, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 11, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null },
			{ month: 12, logistics: null, lease: null, sales: null, hydrogen: null, electricity: null, etc: null, other: null, total: null }
		];
		return raw.map(function (x) {
			return finalizeMonthlyRow(Object.assign({ key: 'profit-' + x.month }, x));
		});
	}, []);

	var deptOptions = useMemo(function () {
		return [
			{ value: '华东业务部', label: '华东业务部' },
			{ value: '华南业务部', label: '华南业务部' },
			{ value: '华北业务部', label: '华北业务部' },
			{ value: '西南业务部', label: '西南业务部' }
		];
	}, []);

	var salespersonOptions = useMemo(function () {
		return [
			{ value: '尚建华', label: '尚建华' },
			{ value: '刘念念', label: '刘念念' },
			{ value: '谯云', label: '谯云' },
			{ value: '董剑煜', label: '董剑煜' }
		];
	}, []);

	var lastMonthStatKey = useMemo(function () {
		return getLastMonthStatKey();
	}, []);

	var allRows = useMemo(function () {
		var sm = lastMonthStatKey;
		return [
			{
				key: '1',
				statMonth: sm,
				salesperson: '尚建华',
				dept: '华东业务部',
				logistics: 208868.38,
				lease: 36000,
				sales: null,
				hydrogen: null,
				electricity: null,
				etc: null,
				other: 55950.23,
				total: 300818.61
			},
			{
				key: '2',
				statMonth: sm,
				salesperson: '刘念念',
				dept: '华南业务部',
				logistics: 397181.78,
				lease: 223800,
				sales: 120000,
				hydrogen: 4500.12,
				electricity: 25000,
				etc: null,
				other: 224.14,
				total: 770706.04
			},
			{
				key: '3',
				statMonth: sm,
				salesperson: '谯云',
				dept: '华东业务部',
				logistics: 391153.33,
				lease: 15000,
				sales: null,
				hydrogen: null,
				electricity: null,
				etc: 8665.43,
				other: null,
				total: 414818.76
			},
			{
				key: '4',
				statMonth: sm,
				salesperson: '董剑煜',
				dept: '西南业务部',
				logistics: 8354.46,
				lease: null,
				sales: null,
				hydrogen: null,
				electricity: null,
				etc: null,
				other: 657.3,
				total: 9011.76
			}
		];
	}, [lastMonthStatKey]);

	var mainTabState = useState('detail');
	var mainTab = mainTabState[0];
	var setMainTab = mainTabState[1];

	var draftState = useState(function () {
		return {
			month: getLastMonthPickerValue(),
			dept: undefined,
			salesperson: undefined
		};
	});
	var draft = draftState[0];
	var setDraft = draftState[1];

	var appliedState = useState(function () {
		return {
			month: getLastMonthPickerValue(),
			dept: undefined,
			salesperson: undefined
		};
	});
	var applied = appliedState[0];
	var setApplied = appliedState[1];

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

	var filteredRows = useMemo(function () {
		return (allRows || []).filter(function (r) {
			if (applied.month && applied.month.format) {
				var mk = applied.month.format('YYYY-MM');
				if (r.statMonth !== mk) return false;
			}
			if (applied.dept && r.dept !== applied.dept) return false;
			if (applied.salesperson && r.salesperson !== applied.salesperson) return false;
			return true;
		});
	}, [allRows, applied.month, applied.dept, applied.salesperson]);

	var metricKeys = useMemo(function () {
		return ['logistics', 'lease', 'sales', 'hydrogen', 'electricity', 'etc', 'other', 'total'];
	}, []);

	var columnSums = useMemo(function () {
		var sums = {};
		metricKeys.forEach(function (k) {
			sums[k] = filteredRows.reduce(function (acc, row) {
				var v = row[k];
				var n = v === null || v === undefined || v === '' ? 0 : Number(v);
				return acc + (isNaN(n) ? 0 : n);
			}, 0);
		});
		return sums;
	}, [filteredRows, metricKeys]);

	var bizReportTableTitleStyle = {
		textAlign: 'center',
		marginBottom: 16,
		fontSize: 16,
		fontWeight: 600,
		color: 'rgba(0,0,0,0.88)'
	};

	/** 与「查询」后已选月份一致：x年x月业绩明细表 */
	var detailTableTitle = useMemo(function () {
		if (applied.month && applied.month.format) {
			var y = applied.month.format('YYYY');
			var m = applied.month.format('M');
			return y + '年' + m + '月业绩明细表';
		}
		return '业绩明细表';
	}, [applied.month]);

	/** 与汇总 Tab「查询」后已选年份一致 */
	var perfSumTableTitle = useMemo(function () {
		if (summaryYearApplied && summaryYearApplied.format) {
			return summaryYearApplied.format('YYYY') + '年业绩汇总';
		}
		return '业绩汇总';
	}, [summaryYearApplied]);

	var costSumTableTitle = useMemo(function () {
		if (summaryYearApplied && summaryYearApplied.format) {
			return summaryYearApplied.format('YYYY') + '年成本汇总';
		}
		return '成本汇总';
	}, [summaryYearApplied]);

	var profitSumTableTitle = useMemo(function () {
		if (summaryYearApplied && summaryYearApplied.format) {
			return summaryYearApplied.format('YYYY') + '年利润汇总';
		}
		return '利润汇总';
	}, [summaryYearApplied]);

	var monthlyDataSource = useCallback(function (rows) {
		var y = summaryYearApplied && summaryYearApplied.format ? summaryYearApplied.format('YYYY') : null;
		if (!y) return [];
		if (y !== '2026') return [];
		return rows;
	}, [summaryYearApplied]);

	var perfMonthlyRows = useMemo(function () { return monthlyDataSource(monthlyPerf2026); }, [monthlyDataSource, monthlyPerf2026]);
	var costMonthlyRows = useMemo(function () { return monthlyDataSource(monthlyCost2026); }, [monthlyDataSource, monthlyCost2026]);
	var profitMonthlyRows = useMemo(function () { return monthlyDataSource(monthlyProfit2026); }, [monthlyDataSource, monthlyProfit2026]);

	var perfMonthlySums = useMemo(function () { return sumMonthlyRows(perfMonthlyRows, monthlyMetricKeys); }, [perfMonthlyRows]);
	var costMonthlySums = useMemo(function () { return sumMonthlyRows(costMonthlyRows, monthlyMetricKeys); }, [costMonthlyRows]);
	var profitMonthlySums = useMemo(function () { return sumMonthlyRows(profitMonthlyRows, monthlyMetricKeys); }, [profitMonthlyRows]);

	var handleQuery = useCallback(function () {
		setApplied(Object.assign({}, draft));
	}, [draft]);

	var handleReset = useCallback(function () {
		var def = { month: getLastMonthPickerValue(), dept: undefined, salesperson: undefined };
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

	var handleExportDetail = useCallback(function () {
		var rows = filteredRows;
		if (!rows || rows.length === 0) {
			message.warning('当前无数据可导出');
			return;
		}
		var headers = [
			'业务员',
			'物流业绩',
			'租赁业绩',
			'销售业绩',
			'氢费业绩',
			'电费业绩',
			'ETC业绩',
			'其他',
			'合计'
		];
		var body = [headers].concat(
			rows.map(function (r) {
				return [
					r.salesperson,
					fmtCell(r.logistics),
					fmtCell(r.lease),
					fmtCell(r.sales),
					fmtCell(r.hydrogen),
					fmtCell(r.electricity),
					fmtCell(r.etc),
					fmtCell(r.other),
					fmtCell(r.total)
				];
			})
		);
		body.push(['总计'].concat(metricKeys.map(function (k) { return fmtSum(columnSums[k] || 0); })));
		downloadCsv('业绩明细_' + new Date().getTime() + '.csv', body);
		message.success('已导出 ' + rows.length + ' 条记录');
	}, [filteredRows, metricKeys, columnSums]);

	var exportMonthly = useCallback(function (rows, sums, headerTitles, filePrefix) {
		if (!rows || rows.length === 0) {
			message.warning('当前无数据可导出，请先选择年份并查询');
			return;
		}
		var body = [headerTitles].concat(
			rows.map(function (r) {
				return [
					String(r.month),
					fmtCell(r.logistics),
					fmtCell(r.lease),
					fmtCell(r.sales),
					fmtCell(r.hydrogen),
					fmtCell(r.electricity),
					fmtCell(r.etc),
					fmtCell(r.other),
					fmtCell(r.total)
				];
			})
		);
		body.push(['总计'].concat(monthlyMetricKeys.map(function (k) { return fmtSum(sums[k] || 0); })));
		downloadCsv(filePrefix + '_' + new Date().getTime() + '.csv', body);
		message.success('已导出 ' + rows.length + ' 个月度数据');
	}, []);

	var handleExportPerfMonthly = useCallback(function () {
		exportMonthly(
			perfMonthlyRows,
			perfMonthlySums,
			['月份', '物流业绩', '租赁业绩', '销售业绩', '氢费业绩', '电费业绩', 'ETC业绩', '其他', '合计'],
			'业绩汇总'
		);
	}, [exportMonthly, perfMonthlyRows, perfMonthlySums]);

	var handleExportCostMonthly = useCallback(function () {
		exportMonthly(
			costMonthlyRows,
			costMonthlySums,
			['月份', '物流成本', '租赁成本', '销售成本', '氢费成本', '电费成本', 'ETC成本', '其他', '合计'],
			'成本汇总'
		);
	}, [exportMonthly, costMonthlyRows, costMonthlySums]);

	var handleExportProfitMonthly = useCallback(function () {
		exportMonthly(
			profitMonthlyRows,
			profitMonthlySums,
			['月份', '物流利润', '租赁利润', '销售利润', '氢费利润', '电费利润', 'ETC利润', '其他', '合计'],
			'利润汇总'
		);
	}, [exportMonthly, profitMonthlyRows, profitMonthlySums]);

	var columns = useMemo(function () {
		return [
			{ title: '业务员', dataIndex: 'salesperson', key: 'salesperson', width: 110, align: 'center' },
			{ title: '物流业绩', dataIndex: 'logistics', key: 'logistics', width: 130, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: '租赁业绩', dataIndex: 'lease', key: 'lease', width: 130, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: '销售业绩', dataIndex: 'sales', key: 'sales', width: 130, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: '氢费业绩', dataIndex: 'hydrogen', key: 'hydrogen', width: 130, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: '电费业绩', dataIndex: 'electricity', key: 'electricity', width: 140, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: 'ETC业绩', dataIndex: 'etc', key: 'etc', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: '其他', dataIndex: 'other', key: 'other', width: 120, align: 'center', render: function (v) { return fmtCell(v); } },
			{ title: '合计', dataIndex: 'total', key: 'total', width: 130, align: 'center', render: function (v) { return fmtCell(v); } }
		];
	}, []);

	var tableSummary = useCallback(function () {
		return React.createElement(
			TableSummary,
			null,
			React.createElement(
				SummaryRow,
				null,
				React.createElement(SummaryCell, { index: 0, align: 'center' }, '总计'),
				metricKeys.map(function (k, idx) {
					return React.createElement(
						SummaryCell,
						{ key: k, index: idx + 1, align: 'center' },
						fmtSum(columnSums[k] || 0)
					);
				})
			)
		);
	}, [metricKeys, columnSums]);

	function renderMonthlySummary(sums) {
		return function () {
			return React.createElement(
				TableSummary,
				null,
				React.createElement(
					SummaryRow,
					null,
					React.createElement(SummaryCell, { index: 0, align: 'center' }, '总计'),
					monthlyMetricKeys.map(function (k, idx) {
						return React.createElement(
							SummaryCell,
							{ key: k, index: idx + 1, align: 'center' },
							fmtSum(sums[k] || 0)
						);
					})
				)
			);
		};
	}

	var columnsPerfMonthly = useMemo(function () { return monthlyColumnsFor('业绩'); }, []);
	var columnsCostMonthly = useMemo(function () { return monthlyColumnsFor('成本'); }, []);
	var columnsProfitMonthly = useMemo(function () { return monthlyColumnsFor('利润'); }, []);

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
				),
				React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6, style: filterActionsColStyle },
					React.createElement('div', { style: filterItemStyle },
						React.createElement('div', { style: filterLabelStyle }, '\u00a0'),
						React.createElement(Space, { size: 8, wrap: true },
							React.createElement(Button, { onClick: handleSummaryReset }, '重置'),
							React.createElement(Button, { type: 'primary', onClick: handleSummaryQuery }, '查询')
						)
					)
				)
			)
		);
	}, [summaryYearDraft, handleSummaryReset, handleSummaryQuery]);

	var tabItems = [
		{
			key: 'detail',
			label: '业绩明细',
			children: React.createElement(React.Fragment, null,
				React.createElement(Card, { style: { marginBottom: 16 } },
					React.createElement(Row, { gutter: [16, 16], align: 'bottom' },
						React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '选择月份'),
								React.createElement(DatePicker, {
									picker: 'month',
									style: filterControlStyle,
									placeholder: '选择器选择月份',
									format: 'YYYY-MM',
									value: draft.month,
									onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { month: v }); }); }
								})
							)
						),
						React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '选择业务部门'),
								React.createElement(Select, {
									placeholder: '选择器选择业务部门',
									style: filterControlStyle,
									allowClear: true,
									options: deptOptions,
									value: draft.dept,
									onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { dept: v }); }); },
									showSearch: true,
									filterOption: filterOption
								})
							)
						),
						React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '选择业务员'),
								React.createElement(Select, {
									placeholder: '选择器选择业务员',
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
						React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6, style: filterActionsColStyle },
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '\u00a0'),
								React.createElement(Space, { size: 8, wrap: true },
									React.createElement(Button, { onClick: handleReset }, '重置'),
									React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
								)
							)
						)
					)
				),
				React.createElement(Card, {
					extra: React.createElement(Button, { onClick: handleExportDetail }, '导出')
				},
					React.createElement('div', { style: bizReportTableTitleStyle }, detailTableTitle),
					React.createElement('style', null, tableSingleLineStyle),
					React.createElement('div', { className: 'biz-dept-perf-table' },
						React.createElement(Table, {
							rowKey: 'key',
							columns: columns,
							dataSource: filteredRows,
							pagination: false,
							size: 'small',
							summary: tableSummary,
							scroll: { x: 1200 }
						})
					)
				)
			)
		},
		{
			key: 'perfSum',
			label: '业绩汇总',
			children: React.createElement(React.Fragment, null,
				renderYearFilterCard(),
				React.createElement(Card, {
					extra: React.createElement(Button, { onClick: handleExportPerfMonthly }, '导出')
				},
					React.createElement('div', { style: bizReportTableTitleStyle }, perfSumTableTitle),
					React.createElement('style', null, tableSingleLineStyle),
					React.createElement('div', { className: 'biz-dept-perf-table' },
						React.createElement(Table, {
							rowKey: 'key',
							columns: columnsPerfMonthly,
							dataSource: perfMonthlyRows,
							pagination: false,
							size: 'small',
							summary: renderMonthlySummary(perfMonthlySums),
							scroll: { x: 1180 }
						})
					)
				)
			)
		},
		{
			key: 'costSum',
			label: '成本汇总',
			children: React.createElement(React.Fragment, null,
				renderYearFilterCard(),
				React.createElement(Card, {
					extra: React.createElement(Button, { onClick: handleExportCostMonthly }, '导出')
				},
					React.createElement('div', { style: bizReportTableTitleStyle }, costSumTableTitle),
					React.createElement('style', null, tableSingleLineStyle),
					React.createElement('div', { className: 'biz-dept-perf-table' },
						React.createElement(Table, {
							rowKey: 'key',
							columns: columnsCostMonthly,
							dataSource: costMonthlyRows,
							pagination: false,
							size: 'small',
							summary: renderMonthlySummary(costMonthlySums),
							scroll: { x: 1180 }
						})
					)
				)
			)
		},
		{
			key: 'profitSum',
			label: '利润汇总',
			children: React.createElement(React.Fragment, null,
				renderYearFilterCard(),
				React.createElement(Card, {
					extra: React.createElement(Button, { onClick: handleExportProfitMonthly }, '导出')
				},
					React.createElement('div', { style: bizReportTableTitleStyle }, profitSumTableTitle),
					React.createElement('style', null, tableSingleLineStyle),
					React.createElement('div', { className: 'biz-dept-perf-table' },
						React.createElement(Table, {
							rowKey: 'key',
							columns: columnsProfitMonthly,
							dataSource: profitMonthlyRows,
							pagination: false,
							size: 'small',
							summary: renderMonthlySummary(profitMonthlySums),
							scroll: { x: 1180 }
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
				items: [{ title: '数据分析' }, { title: '业务部业绩' }]
			}),
			React.createElement(Card, null,
				React.createElement('style', null, tabsBarStyle),
				React.createElement(Tabs, {
					className: 'biz-dept-perf-tabs',
					activeKey: mainTab,
					onChange: function (k) { setMainTab(k); },
					items: tabItems
				})
			)
		)
	);
};
