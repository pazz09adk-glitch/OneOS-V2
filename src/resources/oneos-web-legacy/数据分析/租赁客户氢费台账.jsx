// 【重要】必须使用 const Component 作为组件变量名
// 数据分析 - 租赁客户氢费台账：Tab「租赁客户氢费明细」+「租赁客户氢费总计」（按客户×月汇总金额）

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
	var RangePicker = DatePicker.RangePicker;

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

	function fmtDateDash(iso) {
		if (!iso) return '—';
		try {
			if (window.dayjs) {
				var d = window.dayjs(iso);
				if (!d.isValid()) return '—';
				return d.format('YYYY-MM-DD');
			}
		} catch (e1) {}
		try {
			var p = String(iso).split(/[-/]/);
			if (p.length >= 3) {
				var y = parseInt(p[0], 10);
				var m = parseInt(p[1], 10);
				var day = parseInt(p[2], 10);
				if (!isNaN(y) && !isNaN(m) && !isNaN(day)) {
					return y + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
				}
			}
		} catch (e2) {}
		return String(iso);
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

	function getLastMonthPickerValue() {
		try {
			if (window.dayjs) return window.dayjs().subtract(1, 'month').startOf('month');
		} catch (e1) {}
		try {
			if (window.moment) return window.moment().subtract(1, 'month').startOf('month');
		} catch (e2) {}
		return null;
	}

	function getStatMonthKey(monthsAgo) {
		var off = monthsAgo == null ? 1 : monthsAgo;
		try {
			if (window.dayjs) return window.dayjs().subtract(off, 'month').format('YYYY-MM');
		} catch (e1) {}
		var d = new Date();
		d.setDate(1);
		d.setMonth(d.getMonth() - off);
		var y = d.getFullYear();
		var mo = d.getMonth() + 1;
		return y + '-' + (mo < 10 ? '0' + mo : '' + mo);
	}

	function getLastMonthRange() {
		try {
			if (window.dayjs) {
				var s = window.dayjs().subtract(1, 'month').startOf('month');
				var e = window.dayjs().subtract(1, 'month').endOf('month');
				return [s, e];
			}
		} catch (e1) {}
		return [null, null];
	}

	function rowDayMs(iso) {
		if (!iso) return NaN;
		var t = Date.parse(String(iso).length <= 10 ? String(iso) + 'T12:00:00' : iso);
		return isNaN(t) ? NaN : t;
	}

	function inRange(iso, range) {
		if (!range || !range[0] || !range[1]) return true;
		var t = rowDayMs(iso);
		if (isNaN(t)) return false;
		var s = range[0].startOf ? range[0].startOf('day').valueOf() : NaN;
		var e = range[1].endOf ? range[1].endOf('day').valueOf() : NaN;
		if (isNaN(s) || isNaN(e)) return true;
		return t >= s && t <= e;
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	/** 与「车辆租赁合同」列表表一致：单行不换行；本页含合计行故增加 summary 单元格 */
	var tableSingleLineStyle =
		'.contract-list-table .ant-table-thead th,.contract-list-table .ant-table-tbody td,.contract-list-table .ant-table-summary td{white-space:nowrap;}';
	var listToolbarStyle = { marginBottom: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 8 };
	var tabsBarStyle = '.lease-h2-ledger-tabs .ant-tabs-nav{margin-bottom:0;}';

	var bizReportTableTitleStyle = {
		textAlign: 'center',
		marginBottom: 16,
		fontSize: 16,
		fontWeight: 600,
		color: 'rgba(0,0,0,0.88)'
	};

	var boldNumStyle = { fontWeight: 600 };

	/** 原型明细（statMonth / bizDate 随「上一月、上上月」变化，与默认筛选区间一致） */
	var allDetailRows = useMemo(function () {
		var m0 = getStatMonthKey(1);
		var m1 = getStatMonthKey(2);
		var p0 = m0.split('-');
		var p1 = m1.split('-');
		var y0 = parseInt(p0[0], 10);
		var mo0 = parseInt(p0[1], 10);
		var y1 = parseInt(p1[0], 10);
		var mo1 = parseInt(p1[1], 10);
		function iso(y, mo, day) {
			return y + '-' + (mo < 10 ? '0' + mo : mo) + '-' + (day < 10 ? '0' + day : day);
		}
		return [
			{
				key: 'h2-1',
				statMonth: m0,
				bizDate: iso(y0, mo0, 1),
				salesperson: '刘念念',
				customerName: '嘉兴古道物流有限公司',
				plateNo: '沪A68122F',
				quantityKg: 45.6,
				location: '嘉兴嘉锦亭桥-北综合供能服务站',
				purchasePrice: 28.5,
				costAmount: 1299.6,
				unitPrice: 32,
				amount: 1459.2
			},
			{
				key: 'h2-2',
				statMonth: m0,
				bizDate: iso(y0, mo0, 3),
				salesperson: '尚建华',
				customerName: '嘉兴古道物流有限公司',
				plateNo: '粤AGP3513',
				quantityKg: 38.2,
				location: '嘉兴嘉锦亭桥-北综合供能服务站',
				purchasePrice: 28.5,
				costAmount: 1088.7,
				unitPrice: 32,
				amount: 1222.4
			},
			{
				key: 'h2-3',
				statMonth: m0,
				bizDate: iso(y0, mo0, 5),
				salesperson: '刘念念',
				customerName: '杭州绿道城配科技有限公司',
				plateNo: '浙A88888F',
				quantityKg: 52,
				location: '杭州钱塘综合能源站',
				purchasePrice: 29,
				costAmount: 1508,
				unitPrice: 33.5,
				amount: 1742
			},
			{
				key: 'h2-4',
				statMonth: m0,
				bizDate: iso(y0, mo0, 12),
				salesperson: '尚建华',
				customerName: '宁波港联氢运物流有限公司',
				plateNo: '浙B12345F',
				quantityKg: 60.5,
				location: '宁波北仑氢能示范站',
				purchasePrice: 27.8,
				costAmount: 1681.9,
				unitPrice: 31.2,
				amount: 1887.6
			},
			{
				key: 'h2-5',
				statMonth: m1,
				bizDate: iso(y1, mo1, 2),
				salesperson: '刘念念',
				customerName: '嘉兴古道物流有限公司',
				plateNo: '沪A68122F',
				quantityKg: 41,
				location: '嘉兴嘉锦亭桥-北综合供能服务站',
				purchasePrice: 28.6,
				costAmount: 1172.6,
				unitPrice: 32,
				amount: 1312
			},
			{
				key: 'h2-6',
				statMonth: m1,
				bizDate: iso(y1, mo1, 18),
				salesperson: '刘念念',
				customerName: '杭州绿道城配科技有限公司',
				plateNo: '浙A88888F',
				quantityKg: 48.5,
				location: '杭州钱塘综合能源站',
				purchasePrice: 29.1,
				costAmount: 1411.35,
				unitPrice: 33.5,
				amount: 1624.75
			}
		];
	}, []);

	var salespersonOptions = useMemo(function () {
		var set = {};
		allDetailRows.forEach(function (r) {
			if (r.salesperson) set[r.salesperson] = true;
		});
		return Object.keys(set).map(function (n) { return { value: n, label: n }; });
	}, [allDetailRows]);

	var customerOptions = useMemo(function () {
		var set = {};
		allDetailRows.forEach(function (r) {
			if (r.customerName) set[r.customerName] = true;
		});
		return Object.keys(set).map(function (n) { return { value: n, label: n }; });
	}, [allDetailRows]);

	var mainTabState = useState('detail');
	var mainTab = mainTabState[0];
	var setMainTab = mainTabState[1];

	var rangeDefault = useMemo(function () { return getLastMonthRange(); }, []);

	var draftDetailState = useState(function () {
		return {
			dateRange: rangeDefault[0] && rangeDefault[1] ? [rangeDefault[0], rangeDefault[1]] : null,
			salesperson: undefined,
			customerName: undefined
		};
	});
	var draftDetail = draftDetailState[0];
	var setDraftDetail = draftDetailState[1];

	var appliedDetailState = useState(function () {
		return {
			dateRange: rangeDefault[0] && rangeDefault[1] ? [rangeDefault[0], rangeDefault[1]] : null,
			salesperson: undefined,
			customerName: undefined
		};
	});
	var appliedDetail = appliedDetailState[0];
	var setAppliedDetail = appliedDetailState[1];

	var draftTotalState = useState(function () {
		return {
			month: getLastMonthPickerValue(),
			customerName: undefined
		};
	});
	var draftTotal = draftTotalState[0];
	var setDraftTotal = draftTotalState[1];

	var appliedTotalState = useState(function () {
		return {
			month: getLastMonthPickerValue(),
			customerName: undefined
		};
	});
	var appliedTotal = appliedTotalState[0];
	var setAppliedTotal = appliedTotalState[1];

	var filteredDetailRows = useMemo(function () {
		return (allDetailRows || []).filter(function (r) {
			if (appliedDetail.dateRange && appliedDetail.dateRange[0] && appliedDetail.dateRange[1]) {
				if (!inRange(r.bizDate, appliedDetail.dateRange)) return false;
			}
			if (appliedDetail.salesperson && r.salesperson !== appliedDetail.salesperson) return false;
			if (appliedDetail.customerName && r.customerName !== appliedDetail.customerName) return false;
			return true;
		});
	}, [allDetailRows, appliedDetail.dateRange, appliedDetail.salesperson, appliedDetail.customerName]);

	var detailSums = useMemo(function () {
		var q = 0;
		var c = 0;
		var a = 0;
		filteredDetailRows.forEach(function (r) {
			q += isNaN(Number(r.quantityKg)) ? 0 : Number(r.quantityKg);
			c += isNaN(Number(r.costAmount)) ? 0 : Number(r.costAmount);
			a += isNaN(Number(r.amount)) ? 0 : Number(r.amount);
		});
		return { quantityKg: q, costAmount: c, amount: a };
	}, [filteredDetailRows]);

	var totalByCustomerMonthRows = useMemo(function () {
		var mk = '';
		if (appliedTotal.month && appliedTotal.month.format) mk = appliedTotal.month.format('YYYY-MM');
		if (!mk) return [];
		var map = {};
		allDetailRows.forEach(function (r) {
			if (r.statMonth !== mk) return;
			if (appliedTotal.customerName && r.customerName !== appliedTotal.customerName) return;
			var k = r.customerName || '';
			if (!map[k]) {
				map[k] = { key: 'sum-' + mk + '-' + k, customerName: k, statMonth: mk, quantityKg: 0, amount: 0 };
			}
			map[k].quantityKg += isNaN(Number(r.quantityKg)) ? 0 : Number(r.quantityKg);
			map[k].amount += isNaN(Number(r.amount)) ? 0 : Number(r.amount);
		});
		return Object.keys(map).map(function (name) { return map[name]; });
	}, [allDetailRows, appliedTotal.month, appliedTotal.customerName]);

	var totalTabSums = useMemo(function () {
		var q = 0;
		var a = 0;
		totalByCustomerMonthRows.forEach(function (r) {
			q += r.quantityKg || 0;
			a += r.amount || 0;
		});
		return { quantityKg: q, amount: a };
	}, [totalByCustomerMonthRows]);

	var detailTitle = useMemo(function () {
		return '租赁客户氢费明细表';
	}, []);

	var totalTitle = useMemo(function () {
		if (appliedTotal.month && appliedTotal.month.format) {
			return appliedTotal.month.format('YYYY年M月') + '租赁客户氢费总计';
		}
		return '租赁客户氢费总计';
	}, [appliedTotal.month]);

	var handleQueryDetail = useCallback(function () {
		setAppliedDetail(Object.assign({}, draftDetail));
	}, [draftDetail]);

	var handleResetDetail = useCallback(function () {
		var def = {
			dateRange: rangeDefault[0] && rangeDefault[1] ? [rangeDefault[0], rangeDefault[1]] : null,
			salesperson: undefined,
			customerName: undefined
		};
		setDraftDetail(def);
		setAppliedDetail(def);
	}, [rangeDefault]);

	var handleQueryTotal = useCallback(function () {
		setAppliedTotal(Object.assign({}, draftTotal));
	}, [draftTotal]);

	var handleResetTotal = useCallback(function () {
		var def = { month: getLastMonthPickerValue(), customerName: undefined };
		setDraftTotal(def);
		setAppliedTotal(def);
	}, []);

	var handleExportDetail = useCallback(function () {
		var rows = filteredDetailRows;
		if (!rows || rows.length === 0) {
			message.warning('当前无数据可导出');
			return;
		}
		var headers = [
			'业务员',
			'客户名称',
			'日期',
			'车牌号',
			'加氢数量',
			'加氢地点',
			'进价',
			'成本金额',
			'单价',
			'金额'
		];
		var line = function (r) {
			return [
				r.salesperson,
				r.customerName,
				fmtDateDash(r.bizDate),
				r.plateNo,
				fmtCell(r.quantityKg),
				r.location,
				fmtCell(r.purchasePrice),
				fmtCell(r.costAmount),
				fmtCell(r.unitPrice),
				fmtCell(r.amount)
			];
		};
		var body = [headers].concat(rows.map(line));
		body.push([
			'汇总',
			'',
			'',
			'',
			fmtSum(detailSums.quantityKg),
			'',
			'',
			fmtSum(detailSums.costAmount),
			'',
			fmtSum(detailSums.amount)
		]);
		downloadCsv('租赁客户氢费明细_' + new Date().getTime() + '.csv', body);
		message.success('已导出 ' + rows.length + ' 条记录');
	}, [filteredDetailRows, detailSums]);

	var handleExportTotal = useCallback(function () {
		var rows = totalByCustomerMonthRows;
		if (!rows || rows.length === 0) {
			message.warning('当前无数据可导出，请选择统计月份并查询');
			return;
		}
		var headers = ['客户名称', '统计月份', '加氢数量合计', '金额合计'];
		var body = [headers].concat(
			rows.map(function (r) {
				return [r.customerName, r.statMonth, fmtSum(r.quantityKg), fmtSum(r.amount)];
			})
		);
		body.push(['总计', '', fmtSum(totalTabSums.quantityKg), fmtSum(totalTabSums.amount)]);
		downloadCsv('租赁客户氢费总计_' + new Date().getTime() + '.csv', body);
		message.success('已导出 ' + rows.length + ' 条记录');
	}, [totalByCustomerMonthRows, totalTabSums]);

	function renderBoldMoney(v) {
		var s = fmtCell(v);
		return React.createElement('span', { style: boldNumStyle }, s);
	}

	var columnsDetail = useMemo(function () {
		return [
			{ title: '业务员', dataIndex: 'salesperson', key: 'salesperson', width: 100, align: 'left' },
			{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 200, ellipsis: true, align: 'left' },
			{ title: '日期', dataIndex: 'bizDate', key: 'bizDate', width: 118, align: 'left', render: function (_v, r) { return fmtDateDash(r.bizDate); } },
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 120, align: 'left' },
			{ title: '加氢数量', dataIndex: 'quantityKg', key: 'quantityKg', width: 100, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '加氢地点', dataIndex: 'location', key: 'location', width: 260, ellipsis: true, align: 'left' },
			{ title: '进价', dataIndex: 'purchasePrice', key: 'purchasePrice', width: 90, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '成本金额', dataIndex: 'costAmount', key: 'costAmount', width: 110, align: 'right', render: function (v) { return fmtCell(v); } },
			{ title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 90, align: 'right', render: function (v) { return renderBoldMoney(v); } },
			{ title: '金额', dataIndex: 'amount', key: 'amount', width: 110, align: 'right', render: function (v) { return renderBoldMoney(v); } }
		];
	}, []);

	var columnsTotal = useMemo(function () {
		return [
			{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 240, ellipsis: true, align: 'left' },
			{ title: '统计月份', dataIndex: 'statMonth', key: 'statMonth', width: 110, align: 'center' },
			{ title: '加氢数量合计', dataIndex: 'quantityKg', key: 'quantityKg', width: 130, align: 'right', render: function (v) { return fmtSum(v); } },
			{ title: '金额合计', dataIndex: 'amount', key: 'amount', width: 130, align: 'right', render: function (v) { return React.createElement('span', { style: boldNumStyle }, fmtSum(v)); } }
		];
	}, []);

	var detailTableSummary = useCallback(function () {
		return React.createElement(
			TableSummary,
			null,
			React.createElement(
				SummaryRow,
				null,
				React.createElement(SummaryCell, { index: 0, align: 'center', colSpan: 4 }, '汇总'),
				React.createElement(SummaryCell, { index: 4, align: 'right' }, fmtSum(detailSums.quantityKg)),
				React.createElement(SummaryCell, { index: 5, align: 'center' }, '—'),
				React.createElement(SummaryCell, { index: 6, align: 'right' }, '—'),
				React.createElement(SummaryCell, { index: 7, align: 'right' }, fmtSum(detailSums.costAmount)),
				React.createElement(SummaryCell, { index: 8, align: 'center' }, '—'),
				React.createElement(SummaryCell, { index: 9, align: 'right' },
					React.createElement('span', { style: boldNumStyle }, fmtSum(detailSums.amount))
				)
			)
		);
	}, [detailSums]);

	var totalTableSummary = useCallback(function () {
		return React.createElement(
			TableSummary,
			null,
			React.createElement(
				SummaryRow,
				null,
				React.createElement(SummaryCell, { index: 0, align: 'center', colSpan: 2 }, '总计'),
				React.createElement(SummaryCell, { index: 2, align: 'right' }, fmtSum(totalTabSums.quantityKg)),
				React.createElement(SummaryCell, { index: 3, align: 'right' },
					React.createElement('span', { style: boldNumStyle }, fmtSum(totalTabSums.amount))
				)
			)
		);
	}, [totalTabSums]);

	var tabItems = [
		{
			key: 'detail',
			label: '租赁客户氢费明细',
			children: React.createElement(React.Fragment, null,
				React.createElement(Card, { style: { marginBottom: 16 } },
					React.createElement(Row, { gutter: [16, 16], align: 'bottom' },
						React.createElement(Col, { xs: 24, sm: 12, md: 10, lg: 8 },
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '日期范围'),
								React.createElement(RangePicker, {
									style: filterControlStyle,
									placeholder: ['开始日期', '结束日期'],
									format: 'YYYY-MM-DD',
									value: draftDetail.dateRange,
									onChange: function (v) { setDraftDetail(function (p) { return Object.assign({}, p, { dateRange: v }); }); }
								})
							)
						),
						React.createElement(Col, { xs: 24, sm: 12, md: 7, lg: 6 },
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '业务员'),
								React.createElement(Select, {
									placeholder: '请选择业务员',
									style: filterControlStyle,
									allowClear: true,
									options: salespersonOptions,
									value: draftDetail.salesperson,
									onChange: function (v) { setDraftDetail(function (p) { return Object.assign({}, p, { salesperson: v }); }); },
									showSearch: true,
									filterOption: filterOption
								})
							)
						),
						React.createElement(Col, { xs: 24, sm: 12, md: 7, lg: 6 },
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '客户名称'),
								React.createElement(Select, {
									placeholder: '请选择客户名称',
									style: filterControlStyle,
									allowClear: true,
									options: customerOptions,
									value: draftDetail.customerName,
									onChange: function (v) { setDraftDetail(function (p) { return Object.assign({}, p, { customerName: v }); }); },
									showSearch: true,
									filterOption: filterOption
								})
							)
						)
					),
					React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
						React.createElement(Button, { onClick: handleResetDetail }, '重置'),
						React.createElement(Button, { type: 'primary', onClick: handleQueryDetail }, '查询')
					)
				),
				React.createElement('div', { style: listToolbarStyle },
					React.createElement(Button, { onClick: handleExportDetail }, '导出')
				),
				React.createElement(Card, null,
					React.createElement('div', { style: bizReportTableTitleStyle }, detailTitle),
					React.createElement(React.Fragment, null,
						React.createElement('style', null, tableSingleLineStyle),
						React.createElement('div', { className: 'contract-list-table' },
							React.createElement(Table, {
								rowKey: 'key',
								columns: columnsDetail,
								dataSource: filteredDetailRows,
								pagination: false,
								size: 'small',
								summary: detailTableSummary,
								scroll: { x: 1320 }
							})
						)
					)
				)
			)
		},
		{
			key: 'total',
			label: '租赁客户氢费总计',
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
									value: draftTotal.month,
									onChange: function (v) { setDraftTotal(function (p) { return Object.assign({}, p, { month: v }); }); }
								})
							)
						),
						React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
							React.createElement('div', { style: filterItemStyle },
								React.createElement('div', { style: filterLabelStyle }, '客户名称'),
								React.createElement(Select, {
									placeholder: '全部客户',
									style: filterControlStyle,
									allowClear: true,
									options: customerOptions,
									value: draftTotal.customerName,
									onChange: function (v) { setDraftTotal(function (p) { return Object.assign({}, p, { customerName: v }); }); },
									showSearch: true,
									filterOption: filterOption
								})
							)
						)
					),
					React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
						React.createElement(Button, { onClick: handleResetTotal }, '重置'),
						React.createElement(Button, { type: 'primary', onClick: handleQueryTotal }, '查询')
					)
				),
				React.createElement('div', { style: listToolbarStyle },
					React.createElement(Button, { onClick: handleExportTotal }, '导出')
				),
				React.createElement(Card, null,
					React.createElement('div', { style: bizReportTableTitleStyle }, totalTitle),
					React.createElement(React.Fragment, null,
						React.createElement('style', null, tableSingleLineStyle),
						React.createElement('div', { className: 'contract-list-table' },
							React.createElement(Table, {
								rowKey: 'key',
								columns: columnsTotal,
								dataSource: totalByCustomerMonthRows,
								pagination: false,
								size: 'small',
								summary: totalTableSummary,
								scroll: { x: 720 }
							})
						)
					)
				)
			)
		}
	];

	return React.createElement(App, null,
		React.createElement('div', { style: layoutStyle },
			React.createElement(Breadcrumb, {
				style: { marginBottom: 16 },
				items: [{ title: '数据分析' }, { title: '租赁客户氢费台账' }]
			}),
			React.createElement(Card, null,
				React.createElement('style', null, tabsBarStyle),
				React.createElement(Tabs, {
					className: 'lease-h2-ledger-tabs',
					activeKey: mainTab,
					onChange: function (k) { setMainTab(k); },
					items: tabItems
				})
			)
		)
	);
};
