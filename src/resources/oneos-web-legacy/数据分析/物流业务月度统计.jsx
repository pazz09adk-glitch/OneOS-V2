// 【重要】必须使用 const Component 作为组件变量名
// 数据分析 - 物流业务月度统计：Tab「物流业务人员明细」+「物流盈亏月度汇总」（1–12 月汇总，交互同业务部业绩汇总）
// 人员明细：进入页面默认统计「上一自然月」

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

	function fmtIntCell(n) {
		if (n === null || n === undefined || n === '') return '—';
		var x = Number(n);
		if (isNaN(x)) return '—';
		if (x === 0) return '—';
		return String(Math.round(x));
	}

	/** 盈亏：允许负数、零显示 0.00 */
	function fmtProfit(n) {
		if (n === null || n === undefined || n === '') return '—';
		var x = Number(n);
		if (isNaN(x)) return '—';
		return x.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function fmtSum(n) {
		var x = Number(n);
		if (isNaN(x)) return '—';
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
		'.logistics-monthly-stat-table .ant-table-thead th,.logistics-monthly-stat-table .ant-table-tbody td,.logistics-monthly-stat-table .ant-table-summary td{white-space:nowrap;}';
	var tabsBarStyle = '.logistics-monthly-stat-tabs .ant-tabs-nav{margin-bottom:0;}';

	var bizReportTableTitleStyle = {
		textAlign: 'center',
		marginBottom: 16,
		fontSize: 16,
		fontWeight: 600,
		color: 'rgba(0,0,0,0.88)'
	};

	var profitNegStyle = { background: '#fff1f0', padding: '2px 8px', borderRadius: 4, display: 'inline-block' };

	var numericSumKeys = [
		'income',
		'hydrogenFee',
		'laborCost',
		'etcFee',
		'electricityFee',
		'salary',
		'vehicleCount',
		'tireCost',
		'deprecInsuranceFee',
		'socialSecurityFee',
		'trailerFee',
		'parkingFee',
		'vehicleTotalCost',
		'totalCost',
		'profitLoss'
	];

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

	var rawRowsTemplate = useMemo(function () {
		var sm = lastMonthStatKey;
		return [
			{
				key: 'lm-1',
				statMonth: sm,
				salesperson: '谈云',
				businessName: '上海虹钦物流有限公司',
				vehicleModel: '帕立安4.5T',
				income: 1005557.94,
				hydrogenFee: 185420.5,
				laborCost: 128800,
				etcFee: 45230.12,
				electricityFee: 62300.8,
				salary: 96000,
				vehicleCount: 12,
				tireCost: 8900,
				deprecInsuranceFee: 156000,
				socialSecurityFee: 28400,
				trailerFee: 12000,
				parkingFee: 6800,
				vehicleTotalCost: 420000,
				totalCost: 918851.42,
				profitLoss: 86706.52,
				remark: ''
			},
			{
				key: 'lm-2',
				statMonth: sm,
				salesperson: '刘念念',
				businessName: '杭州绿道城配科技有限公司',
				vehicleModel: '古道车队',
				income: 680200,
				hydrogenFee: 142000,
				laborCost: 98000,
				etcFee: 32100,
				electricityFee: 41000,
				salary: 72000,
				vehicleCount: 8,
				tireCost: 5600,
				deprecInsuranceFee: 112000,
				socialSecurityFee: 21000,
				trailerFee: 8000,
				parkingFee: 4200,
				vehicleTotalCost: 298000,
				totalCost: 832900,
				profitLoss: -152700,
				remark: ''
			},
			{
				key: 'lm-3',
				statMonth: sm,
				salesperson: '谈云',
				businessName: '宁波港联氢运物流有限公司',
				vehicleModel: '飞越49T',
				income: 892300.5,
				hydrogenFee: 210000,
				laborCost: 145000,
				etcFee: 38900,
				electricityFee: 55000,
				salary: 88000,
				vehicleCount: 10,
				tireCost: 7200,
				deprecInsuranceFee: 198000,
				socialSecurityFee: 25600,
				trailerFee: 15000,
				parkingFee: 5500,
				vehicleTotalCost: 512000,
				totalCost: 1284200.5,
				profitLoss: -391900,
				remark: '淡季线路调整'
			},
			{
				key: 'lm-4',
				statMonth: sm,
				salesperson: '谯云',
				businessName: '嘉兴南湖氢能示范运营',
				vehicleModel: '帕立安4.5T',
				income: 325000,
				hydrogenFee: 52000,
				laborCost: 38000,
				etcFee: 12000,
				electricityFee: 18500,
				salary: 28000,
				vehicleCount: 4,
				tireCost: 2100,
				deprecInsuranceFee: 48000,
				socialSecurityFee: 9200,
				trailerFee: null,
				parkingFee: 1800,
				vehicleTotalCost: 125000,
				totalCost: 334600,
				profitLoss: -9600,
				remark: ''
			},
			{
				key: 'lm-5',
				statMonth: sm,
				salesperson: '董剑煜',
				businessName: '温州瓯江冷链专线',
				vehicleModel: '宇通49T',
				income: 456780,
				hydrogenFee: 88000,
				laborCost: 56000,
				etcFee: 22000,
				electricityFee: 31000,
				salary: 42000,
				vehicleCount: 5,
				tireCost: 4500,
				deprecInsuranceFee: 72000,
				socialSecurityFee: 11800,
				trailerFee: 6000,
				parkingFee: 2400,
				vehicleTotalCost: 198000,
				totalCost: 583700,
				profitLoss: -126920,
				remark: ''
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

	var businessNameOptions = useMemo(function () {
		var set = {};
		(rawRowsTemplate || []).forEach(function (r) {
			if (r.businessName) set[r.businessName] = true;
		});
		return Object.keys(set).map(function (n) { return { value: n, label: n }; });
	}, [rawRowsTemplate]);

	/** 物流盈亏月度汇总：按自然月 1–12 列示（原型仅 2026 年有数据） */
	var monthlyPlMetricKeys = numericSumKeys;

	var monthlyPlSummary2026 = useMemo(function () {
		function mk(m, p) {
			var r = Object.assign({ key: 'plm-' + m, month: m }, p);
			if (r.profitLoss == null && r.income != null && r.totalCost != null) {
				r.profitLoss = Number(r.income) - Number(r.totalCost);
			}
			return r;
		}
		function empty(m) {
			return mk(m, {});
		}
		return [
			mk(1, {
				income: 3350838.44,
				hydrogenFee: 537400,
				laborCost: 418800,
				etcFee: 148230.12,
				electricityFee: 228800.8,
				salary: 386000,
				vehicleCount: 39,
				tireCost: 28100,
				deprecInsuranceFee: 586000,
				socialSecurityFee: 96000,
				trailerFee: 53000,
				parkingFee: 19600,
				vehicleTotalCost: 1553000,
				totalCost: 4123731.44,
				profitLoss: -772893
			}),
			mk(2, {
				income: 2680000,
				hydrogenFee: 412000,
				laborCost: 298000,
				etcFee: 98500,
				electricityFee: 156000,
				salary: 265000,
				vehicleCount: 26,
				tireCost: 19200,
				deprecInsuranceFee: 445000,
				socialSecurityFee: 68400,
				trailerFee: 41000,
				parkingFee: 15800,
				vehicleTotalCost: 1180000,
				totalCost: 3550900,
				profitLoss: -870900
			}),
			mk(3, {
				income: 3012000,
				hydrogenFee: 468000,
				laborCost: 352000,
				etcFee: 108000,
				electricityFee: 172500,
				salary: 298000,
				vehicleCount: 31,
				tireCost: 22100,
				deprecInsuranceFee: 502000,
				socialSecurityFee: 75200,
				trailerFee: 38500,
				parkingFee: 16900,
				vehicleTotalCost: 1285000,
				totalCost: 3488200,
				profitLoss: -476200
			}),
			empty(4),
			empty(5),
			empty(6),
			empty(7),
			empty(8),
			empty(9),
			empty(10),
			empty(11),
			empty(12)
		];
	}, []);

	function initialYear2026() {
		try {
			if (window.dayjs) return window.dayjs('2026-01-01');
		} catch (e) {}
		return null;
	}

	var mainTabState = useState('personDetail');
	var mainTab = mainTabState[0];
	var setMainTab = mainTabState[1];

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
			businessName: undefined
		};
	});
	var draft = draftState[0];
	var setDraft = draftState[1];

	var appliedState = useState(function () {
		return {
			month: getLastMonthPickerValue(),
			salesperson: undefined,
			businessName: undefined
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
			if (applied.businessName && r.businessName !== applied.businessName) return false;
			return true;
		});
	}, [rawRowsTemplate, applied.month, applied.salesperson, applied.businessName]);

	var columnSums = useMemo(function () {
		return sumRows(filteredRows, numericSumKeys);
	}, [filteredRows]);

	var reportTitle = useMemo(function () {
		if (applied.month && applied.month.format) {
			var y = applied.month.format('YYYY');
			var m = applied.month.format('M');
			return y + '年' + m + '月浙江羚牛氢能自运营物流业务盈亏月度汇总表';
		}
		return '浙江羚牛氢能自运营物流业务盈亏月度汇总表';
	}, [applied.month]);

	var plSumTableTitle = useMemo(function () {
		if (summaryYearApplied && summaryYearApplied.format) {
			return summaryYearApplied.format('YYYY') + '年物流盈亏月度汇总';
		}
		return '物流盈亏月度汇总';
	}, [summaryYearApplied]);

	var monthlyPlDataSource = useCallback(function (rows) {
		var y = summaryYearApplied && summaryYearApplied.format ? summaryYearApplied.format('YYYY') : null;
		if (!y) return [];
		if (y !== '2026') return [];
		return rows;
	}, [summaryYearApplied]);

	var plMonthlyRows = useMemo(function () {
		return monthlyPlDataSource(monthlyPlSummary2026);
	}, [monthlyPlDataSource, monthlyPlSummary2026]);

	var plMonthlySums = useMemo(function () {
		return sumRows(plMonthlyRows, monthlyPlMetricKeys);
	}, [plMonthlyRows]);

	var handleQuery = useCallback(function () {
		setApplied(Object.assign({}, draft));
	}, [draft]);

	var handleReset = useCallback(function () {
		var def = { month: getLastMonthPickerValue(), salesperson: undefined, businessName: undefined };
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
			'业务员',
			'业务名称',
			'系统车型',
			'收入',
			'氢费',
			'人工费用',
			'ETC',
			'电费',
			'薪资',
			'投入车数',
			'轮胎',
			'(折旧、年审、保险)费用',
			'社保服务费',
			'挂车费用',
			'停车费',
			'车总费用',
			'总成本',
			'盈亏',
			'备注'
		];
		var rowLine = function (r) {
			return [
				r.salesperson,
				r.businessName,
				r.vehicleModel,
				fmtCell(r.income),
				fmtCell(r.hydrogenFee),
				fmtCell(r.laborCost),
				fmtCell(r.etcFee),
				fmtCell(r.electricityFee),
				fmtCell(r.salary),
				fmtIntCell(r.vehicleCount),
				fmtCell(r.tireCost),
				fmtCell(r.deprecInsuranceFee),
				fmtCell(r.socialSecurityFee),
				fmtCell(r.trailerFee),
				fmtCell(r.parkingFee),
				fmtCell(r.vehicleTotalCost),
				fmtCell(r.totalCost),
				fmtProfit(r.profitLoss),
				r.remark || ''
			];
		};
		var body = [headers].concat(rows.map(rowLine));
		var sumLine = ['总计', '', ''].concat(
			numericSumKeys.map(function (k, idx) {
				if (k === 'vehicleCount') return fmtIntCell(columnSums[k]);
				if (k === 'profitLoss') return fmtSum(columnSums[k]);
				return fmtSum(columnSums[k]);
			})
		);
		body.push(sumLine);
		downloadCsv('物流业务月度统计_' + new Date().getTime() + '.csv', body);
		message.success('已导出 ' + rows.length + ' 条记录');
	}, [filteredRows, columnSums]);

	var plMonthlyExportHeaders = [
		'月份',
		'收入',
		'氢费',
		'人工费用',
		'ETC',
		'电费',
		'薪资',
		'投入车数',
		'轮胎',
		'(折旧、年审、保险)费用',
		'社保服务费',
		'挂车费用',
		'停车费',
		'车总费用',
		'总成本',
		'盈亏月度合计'
	];

	var handleExportPlMonthly = useCallback(function () {
		var rows = plMonthlyRows;
		if (!rows || rows.length === 0) {
			message.warning('当前无数据可导出，请先选择年份并查询');
			return;
		}
		var rowLine = function (r) {
			return [
				String(r.month),
				fmtCell(r.income),
				fmtCell(r.hydrogenFee),
				fmtCell(r.laborCost),
				fmtCell(r.etcFee),
				fmtCell(r.electricityFee),
				fmtCell(r.salary),
				fmtIntCell(r.vehicleCount),
				fmtCell(r.tireCost),
				fmtCell(r.deprecInsuranceFee),
				fmtCell(r.socialSecurityFee),
				fmtCell(r.trailerFee),
				fmtCell(r.parkingFee),
				fmtCell(r.vehicleTotalCost),
				fmtCell(r.totalCost),
				fmtProfit(r.profitLoss)
			];
		};
		var body = [plMonthlyExportHeaders].concat(rows.map(rowLine));
		body.push(['总计'].concat(
			monthlyPlMetricKeys.map(function (k) {
				if (k === 'vehicleCount') return fmtIntCell(plMonthlySums[k]);
				return fmtSum(plMonthlySums[k] || 0);
			})
		));
		downloadCsv('物流盈亏月度汇总_' + new Date().getTime() + '.csv', body);
		message.success('已导出 ' + rows.length + ' 个月度数据');
	}, [plMonthlyRows, plMonthlySums]);

	var columns = useMemo(function () {
		return [
			{ title: '业务员', dataIndex: 'salesperson', key: 'salesperson', width: 88, align: 'center', fixed: 'left' },
			{ title: '业务名称', dataIndex: 'businessName', key: 'businessName', width: 200, ellipsis: true, fixed: 'left' },
			{ title: '系统车型', dataIndex: 'vehicleModel', key: 'vehicleModel', width: 110, align: 'center' },
			{ title: '收入', dataIndex: 'income', key: 'income', width: 120, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '氢费', dataIndex: 'hydrogenFee', key: 'hydrogenFee', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '人工费用', dataIndex: 'laborCost', key: 'laborCost', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: 'ETC', dataIndex: 'etcFee', key: 'etcFee', width: 90, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '电费', dataIndex: 'electricityFee', key: 'electricityFee', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '薪资', dataIndex: 'salary', key: 'salary', width: 90, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '投入车数', dataIndex: 'vehicleCount', key: 'vehicleCount', width: 92, align: 'right', render: function (v) { return fmtIntCell(v); } },
			{ title: '轮胎', dataIndex: 'tireCost', key: 'tireCost', width: 88, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '(折旧、年审、保险)费用', dataIndex: 'deprecInsuranceFee', key: 'deprecInsuranceFee', width: 160, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '社保服务费', dataIndex: 'socialSecurityFee', key: 'socialSecurityFee', width: 110, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '挂车费用', dataIndex: 'trailerFee', key: 'trailerFee', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '停车费', dataIndex: 'parkingFee', key: 'parkingFee', width: 90, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '车总费用', dataIndex: 'vehicleTotalCost', key: 'vehicleTotalCost', width: 110, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '总成本', dataIndex: 'totalCost', key: 'totalCost', width: 120, align: 'right', render: function (v) { return fmtCell(v); } },
			{
				title: '盈亏',
				dataIndex: 'profitLoss',
				key: 'profitLoss',
				width: 120,
				align: 'right',
				render: function (v) {
					var s = fmtProfit(v);
					var neg = v !== null && v !== undefined && v !== '' && !isNaN(Number(v)) && Number(v) < 0;
					return neg ? React.createElement('span', { style: profitNegStyle }, s) : s;
				}
			},
			{ title: '备注', dataIndex: 'remark', key: 'remark', width: 140, ellipsis: true }
		];
	}, []);

	var tableSummary = useCallback(function () {
		return React.createElement(
			TableSummary,
			null,
			React.createElement(
				SummaryRow,
				null,
				React.createElement(SummaryCell, { index: 0, align: 'center', colSpan: 3 }, '总计'),
				numericSumKeys.map(function (k, idx) {
					var text;
					if (k === 'vehicleCount') text = fmtIntCell(columnSums[k]);
					else text = fmtSum(columnSums[k]);
					var isNegProfit = k === 'profitLoss' && Number(columnSums[k]) < 0;
					var child = isNegProfit ? React.createElement('span', { style: profitNegStyle }, text) : text;
					return React.createElement(SummaryCell, { key: k, index: idx + 3, align: 'right' }, child);
				}),
				React.createElement(SummaryCell, { index: numericSumKeys.length + 3, align: 'left' }, '')
			)
		);
	}, [columnSums]);

	var columnsPlMonthly = useMemo(function () {
		return [
			{ title: '月份', dataIndex: 'month', key: 'month', width: 64, align: 'center' },
			{ title: '收入', dataIndex: 'income', key: 'income', width: 118, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '氢费', dataIndex: 'hydrogenFee', key: 'hydrogenFee', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '人工费用', dataIndex: 'laborCost', key: 'laborCost', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: 'ETC', dataIndex: 'etcFee', key: 'etcFee', width: 88, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '电费', dataIndex: 'electricityFee', key: 'electricityFee', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '薪资', dataIndex: 'salary', key: 'salary', width: 90, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '投入车数', dataIndex: 'vehicleCount', key: 'vehicleCount', width: 92, align: 'right', render: function (v) { return fmtIntCell(v); } },
			{ title: '轮胎', dataIndex: 'tireCost', key: 'tireCost', width: 84, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '(折旧、年审、保险)费用', dataIndex: 'deprecInsuranceFee', key: 'deprecInsuranceFee', width: 168, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '社保服务费', dataIndex: 'socialSecurityFee', key: 'socialSecurityFee', width: 110, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '挂车费用', dataIndex: 'trailerFee', key: 'trailerFee', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '停车费', dataIndex: 'parkingFee', key: 'parkingFee', width: 88, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '车总费用', dataIndex: 'vehicleTotalCost', key: 'vehicleTotalCost', width: 110, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '总成本', dataIndex: 'totalCost', key: 'totalCost', width: 118, align: 'right', render: function (v) { return fmtCell(v); } },
			{
				title: '盈亏月度合计',
				dataIndex: 'profitLoss',
				key: 'profitLoss',
				width: 128,
				align: 'right',
				render: function (v) {
					var s = fmtProfit(v);
					var neg = v !== null && v !== undefined && v !== '' && !isNaN(Number(v)) && Number(v) < 0;
					return neg ? React.createElement('span', { style: profitNegStyle }, s) : s;
				}
			}
		];
	}, []);

	var tableSummaryPlMonthly = useCallback(function () {
		return React.createElement(
			TableSummary,
			null,
			React.createElement(
				SummaryRow,
				null,
				React.createElement(SummaryCell, { index: 0, align: 'center' }, '总计'),
				monthlyPlMetricKeys.map(function (k, idx) {
					var text = k === 'vehicleCount' ? fmtIntCell(plMonthlySums[k]) : fmtSum(plMonthlySums[k] || 0);
					var isNeg = k === 'profitLoss' && Number(plMonthlySums[k]) < 0;
					var child = isNeg ? React.createElement('span', { style: profitNegStyle }, text) : text;
					return React.createElement(SummaryCell, { key: k, index: idx + 1, align: 'right' }, child);
				})
			)
		);
	}, [plMonthlySums]);

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

	var tabItems = [
		{
			key: 'personDetail',
			label: '物流业务人员明细',
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
								React.createElement('div', { style: filterLabelStyle }, '业务名称'),
								React.createElement(Select, {
									placeholder: '请选择业务名称',
									style: filterControlStyle,
									allowClear: true,
									options: businessNameOptions,
									value: draft.businessName,
									onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { businessName: v }); }); },
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
					React.createElement('div', { className: 'logistics-monthly-stat-table' },
						React.createElement(Table, {
							rowKey: 'key',
							columns: columns,
							dataSource: filteredRows,
							pagination: false,
							size: 'small',
							summary: tableSummary,
							scroll: { x: 2600 }
						})
					)
				)
			)
		},
		{
			key: 'plMonthly',
			label: '物流盈亏月度汇总',
			children: React.createElement(React.Fragment, null,
				renderYearFilterCard(),
				React.createElement(Card, {
					extra: React.createElement(Button, { onClick: handleExportPlMonthly }, '导出')
				},
					React.createElement('div', { style: bizReportTableTitleStyle }, plSumTableTitle),
					React.createElement('style', null, tableSingleLineStyle),
					React.createElement('div', { className: 'logistics-monthly-stat-table' },
						React.createElement(Table, {
							rowKey: 'key',
							columns: columnsPlMonthly,
							dataSource: plMonthlyRows,
							pagination: false,
							size: 'small',
							summary: tableSummaryPlMonthly,
							scroll: { x: 2480 }
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
				items: [{ title: '数据分析' }, { title: '物流业务月度统计' }]
			}),
			React.createElement(Card, null,
				React.createElement('style', null, tabsBarStyle),
				React.createElement(Tabs, {
					className: 'logistics-monthly-stat-tabs',
					activeKey: mainTab,
					onChange: function (k) { setMainTab(k); },
					items: tabItems
				})
			)
		)
	);
};
