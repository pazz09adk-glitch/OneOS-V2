// 【重要】必须使用 const Component 作为组件变量名
// 数据分析 - 业务台账（多层级表头：自营/租赁/销售/氢费/电费/ETC 各业绩·成本·利润；其他单列）
// 原型：年份 + 业务部筛选、导出；业绩列可钻取业务员 → 项目明细（联调可替换接口）

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
	var Space = antd.Space;
	var Modal = antd.Modal;
	var message = antd.message;

	/** 与示意图一致：前 6 类为三列；其他为单列 */
	var TRIPLE_DEFS = [
		{ key: 'self', groupTitle: '自营业务', short: '自营' },
		{ key: 'lease', groupTitle: '租赁业务', short: '租赁' },
		{ key: 'resale', groupTitle: '销售', short: '销售' },
		{ key: 'h2', groupTitle: '氢费', short: '氢费' },
		{ key: 'apply', groupTitle: '电费', short: '电费' },
		{ key: 'etc', groupTitle: 'ETC', short: 'ETC' }
	];

	var TRIPLE_KEYS = TRIPLE_DEFS.map(function (c) { return c.key; });

	var ALL_CAT_FOR_DRILL = TRIPLE_DEFS.map(function (c) {
		return { key: c.key, label: c.groupTitle };
	}).concat([{ key: 'other', label: '其他' }]);

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function fmtMoney(n) {
		if (n === null || n === undefined || n === '') return '-';
		var x = Number(n);
		if (isNaN(x)) return '-';
		if (x === 0) return '-';
		return x.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

	function initialYear() {
		try {
			if (window.dayjs) return window.dayjs('2026-01-01');
		} catch (e1) {}
		return null;
	}

	function numOrZero(v) {
		if (v === null || v === undefined || v === '') return 0;
		var n = Number(v);
		return isNaN(n) ? 0 : n;
	}

	function pad2(m) {
		var n = Number(m);
		if (n < 10) return '0' + n;
		return String(n);
	}

	/** 将金额（元）均分到 n 行，保证合计精确 */
	function splitAcrossN(total, n) {
		if (n <= 0) return [];
		var cents = Math.round(numOrZero(total) * 100);
		if (cents === 0) {
			var z = [];
			var j;
			for (j = 0; j < n; j++) z.push(0);
			return z;
		}
		var each = Math.floor(cents / n);
		var rem = cents % n;
		var out = [];
		var i;
		for (i = 0; i < n; i++) {
			out.push((each + (i < rem ? 1 : 0)) / 100);
		}
		return out;
	}

	function sumLedgerRows(monthRows) {
		var acc = { month: 13, monthLabel: '合计', rowType: 'total', key: 'total' };
		TRIPLE_KEYS.forEach(function (k) {
			acc[k + 'Perf'] = 0;
			acc[k + 'Cost'] = 0;
			acc[k + 'Profit'] = 0;
		});
		acc.otherAmount = 0;
		(monthRows || []).forEach(function (r) {
			TRIPLE_KEYS.forEach(function (k) {
				acc[k + 'Perf'] += numOrZero(r[k + 'Perf']);
				acc[k + 'Cost'] += numOrZero(r[k + 'Cost']);
				acc[k + 'Profit'] += numOrZero(r[k + 'Profit']);
			});
			acc.otherAmount += numOrZero(r.otherAmount);
		});
		TRIPLE_KEYS.forEach(function (k) {
			if (acc[k + 'Perf'] === 0) acc[k + 'Perf'] = null;
			if (acc[k + 'Cost'] === 0) acc[k + 'Cost'] = null;
			if (acc[k + 'Profit'] === 0) acc[k + 'Profit'] = null;
		});
		if (acc.otherAmount === 0) acc.otherAmount = null;
		return acc;
	}

	/** 演示数据：2026；1 月氢气/申办/ETC 等与业务部汇总台账样例同源占位 */
	function buildMockYear2026() {
		var rows = [];
		var i;
		for (i = 1; i <= 12; i++) {
			var selfPerf = 250000 + Math.random() * 100000;
			var selfCost = selfPerf * (0.8 + Math.random() * 0.1);
			
			var leasePerf = 180000 + Math.random() * 50000;
			var leaseCost = leasePerf * (0.6 + Math.random() * 0.1);
			
			var resalePerf = 300000 + Math.random() * 200000;
			var resaleCost = resalePerf * (0.7 + Math.random() * 0.15);
			
			var h2Perf = 80000 + Math.random() * 60000;
			var h2Cost = h2Perf * (0.6 + Math.random() * 0.2);
			
			var applyPerf = 3000 + Math.random() * 2000;
			var applyCost = applyPerf * (0.3 + Math.random() * 0.1);
			
			var etcPerf = 70000 + Math.random() * 20000;
			var etcCost = etcPerf * (0.5 + Math.random() * 0.1);
			
			var otherAmount = 8000 + Math.random() * 5000;

			var src = {
				selfPerf: Math.round(selfPerf * 100) / 100,
				selfCost: Math.round(selfCost * 100) / 100,
				selfProfit: Math.round((selfPerf - selfCost) * 100) / 100,
				
				leasePerf: Math.round(leasePerf * 100) / 100,
				leaseCost: Math.round(leaseCost * 100) / 100,
				leaseProfit: Math.round((leasePerf - leaseCost) * 100) / 100,
				
				resalePerf: Math.round(resalePerf * 100) / 100,
				resaleCost: Math.round(resaleCost * 100) / 100,
				resaleProfit: Math.round((resalePerf - resaleCost) * 100) / 100,
				
				h2Perf: Math.round(h2Perf * 100) / 100,
				h2Cost: Math.round(h2Cost * 100) / 100,
				h2Profit: Math.round((h2Perf - h2Cost) * 100) / 100,
				
				applyPerf: Math.round(applyPerf * 100) / 100,
				applyCost: Math.round(applyCost * 100) / 100,
				applyProfit: Math.round((applyPerf - applyCost) * 100) / 100,
				
				etcPerf: Math.round(etcPerf * 100) / 100,
				etcCost: Math.round(etcCost * 100) / 100,
				etcProfit: Math.round((etcPerf - etcCost) * 100) / 100,
				
				otherAmount: Math.round(otherAmount * 100) / 100
			};
			
			rows.push({
				key: 'm' + i,
				month: i,
				monthLabel: i + '月',
				rowType: 'month',
				selfPerf: src.selfPerf, selfCost: src.selfCost, selfProfit: src.selfProfit,
				leasePerf: src.leasePerf, leaseCost: src.leaseCost, leaseProfit: src.leaseProfit,
				resalePerf: src.resalePerf, resaleCost: src.resaleCost, resaleProfit: src.resaleProfit,
				h2Perf: src.h2Perf, h2Cost: src.h2Cost, h2Profit: src.h2Profit,
				applyPerf: src.applyPerf, applyCost: src.applyCost, applyProfit: src.applyProfit,
				etcPerf: src.etcPerf, etcCost: src.etcCost, etcProfit: src.etcProfit,
				otherAmount: src.otherAmount
			});
		}
		rows.push(sumLedgerRows(rows));
		return rows;
	}

	function mockSalesmenDrill(month, catKey, cellPerf) {
		var base = [
			{ key: 's1', name: '尚建华', ratio: 0.42 },
			{ key: 's2', name: '刘念念', ratio: 0.35 },
			{ key: 's3', name: '谯云', ratio: 0.15 },
			{ key: 's4', name: '董剑煜', ratio: 0.08 }
		];
		var total = numOrZero(cellPerf);
		if (total <= 0) total = 100000;
		var assigned = 0;
		return base.map(function (b, idx) {
			if (idx === base.length - 1) {
				return { key: b.key, salesperson: b.name, amount: Math.round((total - assigned) * 100) / 100 };
			}
			var amt = Math.round(total * b.ratio * 100) / 100;
			assigned += amt;
			return { key: b.key, salesperson: b.name, amount: amt };
		});
	}

	function mockProjectRows(salesperson, catKey) {
		var catLabel = (ALL_CAT_FOR_DRILL.find(function (c) { return c.key === catKey; }) || {}).label || catKey;
		return [
			{ key: 'p1', projectCode: 'PRJ-2026-001', projectName: catLabel + ' · 嘉兴冷链城配项目', plateNo: '沪A62261F', amount: null, bizDate: '2026-01-08', remark: '演示' },
			{ key: 'p2', projectCode: 'PRJ-2026-018', projectName: catLabel + ' · 沪浙干线运输', plateNo: '粤AGP3649', amount: null, bizDate: '2026-01-15', remark: '-' },
			{ key: 'p3', projectCode: 'PRJ-2026-033', projectName: catLabel + ' · 园区短驳', plateNo: '苏E·D32891', amount: null, bizDate: '2026-01-22', remark: '-' }
		].map(function (r, i, arr) {
			var share = i === arr.length - 1
				? 1 - arr.slice(0, -1).reduce(function (acc) { return acc + 0.31; }, 0)
				: 0.31;
			return Object.assign({}, r, { amount: Math.round(88000 * share * 100) / 100 });
		});
	}

	/**
	 * 自营/租赁业绩钻取：按已选业务部列出业务员行；金额列由主表当月汇总均分（氢费=氢气业绩，电费=申办业绩，与演示口径一致）
	 */
	function buildSelfLeaseDrillRows(salesModal, deptApplied, deptOptions, yearApplied) {
		var src = salesModal.sourceRow;
		if (!src || salesModal.month == null) {
			return { rows: [], totals: { main: 0, h2: 0, elec: 0, etc: 0, other: 0 } };
		}
		var year = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : '2026';
		var month = salesModal.month;
		var ym = year + '-' + pad2(month);
		var deptValues = (deptApplied && deptApplied.length)
			? deptApplied.slice()
			: deptOptions.map(function (o) { return o.value; });
		var namesPool = ['尚建华', '刘念念', '谯云', '董剑煜', '陈思', '周宁'];
		var perDept = 2;
		var n = deptValues.length * perDept;
		if (n === 0) {
			return { rows: [], totals: { main: 0, h2: 0, elec: 0, etc: 0, other: 0 } };
		}
		var totalMain = numOrZero(salesModal.perf);
		var totalH2 = numOrZero(src.h2Perf);
		var totalElec = numOrZero(src.applyPerf);
		var totalEtc = numOrZero(src.etcPerf);
		var totalOther = numOrZero(src.otherAmount);
		var mains = splitAcrossN(totalMain, n);
		var h2s = splitAcrossN(totalH2, n);
		var elecs = splitAcrossN(totalElec, n);
		var etss = splitAcrossN(totalEtc, n);
		var others = splitAcrossN(totalOther, n);
		var rows = [];
		var idx = 0;
		var d;
		for (d = 0; d < deptValues.length; d++) {
			var dv = deptValues[d];
			var deptLabel = (deptOptions.find(function (o) { return o.value === dv; }) || {}).label || dv;
			var j;
			for (j = 0; j < perDept; j++) {
				rows.push({
					key: 'drill-' + ym + '-' + String(dv) + '-' + j,
					ym: ym,
					monthRowSpan: idx === 0 ? n : 0,
					deptName: deptLabel,
					salesperson: namesPool[idx % namesPool.length],
					mainPerf: mains[idx] || 0,
					h2PerfCol: h2s[idx] || 0,
					elecPerf: elecs[idx] || 0,
					etcPerfCol: etss[idx] || 0,
					otherAmt: others[idx] || 0
				});
				idx++;
			}
		}
		return {
			rows: rows,
			totals: {
				main: totalMain,
				h2: totalH2,
				elec: totalElec,
				etc: totalEtc,
				other: totalOther
			}
		};
	}

	var layoutStyle = {
		padding: '20px 24px 32px',
		minHeight: '100vh',
		background: 'linear-gradient(165deg, #eef4ff 0%, #f5f7fa 42%, #f0f2f5 100%)'
	};
	var filterLabelStyle = { marginBottom: 6, fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 500 };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var filterActionsColStyle = { flex: '0 0 auto', marginLeft: 'auto' };

	var filterCardStyle = {
		marginBottom: 20,
		borderRadius: 16,
		boxShadow: '0 4px 20px -4px rgba(16,24,40,0.03), 0 0 0 1px rgba(16,24,40,0.06)',
		border: 'none',
		background: '#ffffff'
	};

	var tableCardStyle = {
		borderRadius: 16,
		boxShadow: '0 10px 32px -4px rgba(16,24,40,0.06), 0 0 0 1px rgba(16,24,40,0.04)',
		border: 'none',
		background: '#ffffff',
		overflow: 'hidden'
	};

	var ledgerTableStyle =
		'.biz-standbook-table-wrap{border-radius:12px;overflow:hidden;box-shadow:0 4px 24px -6px rgba(15,23,42,0.05),0 0 0 1px rgba(22,119,255,0.1)}' +
		'.biz-standbook-table .ant-table-thead>tr>th{white-space:nowrap;color:#1e293b!important;font-weight:600!important;font-size:13px!important;' +
		'background:#f8fafc!important;border-bottom:1px solid #e2e8f0!important;border-inline-end:1px solid #f1f5f9!important;padding:12px 16px!important;transition:background 0.2s}' +
		'.biz-standbook-table .ant-table-thead>tr:first-child>th{text-align:center;background:#f1f5f9!important;color:#0f172a!important;font-size:14px!important;border-bottom:2px solid #e2e8f0!important}' +
		'.biz-standbook-table .ant-table-tbody>tr:not(.ant-table-measure-row)>td{white-space:nowrap;font-variant-numeric:tabular-nums;color:#334155;border-bottom:1px solid #f1f5f9!important;border-inline-end:1px solid #f8fafc!important;padding:12px 16px!important}' +
		'.biz-standbook-table .ant-table-tbody>tr.biz-row-month:hover>td{background:#f0f9ff!important;color:#0f172a}' +
		'.biz-standbook-table .ant-table-tbody>tr[data-row-key=\"total\"]>td{font-weight:700;background:#f8fafc!important;color:#0f172a!important;border-top:2px solid #cbd5e1!important;border-bottom:none!important}' +
		'.biz-standbook-perf-link{cursor:pointer;color:#0ea5e9;padding:4px 8px;margin:-4px -8px;border:none;background:transparent;font:inherit;border-radius:6px;transition:all 0.2s}' +
		'.biz-standbook-perf-link:hover{color:#0284c7;background:#e0f2fe}' +
		'.biz-standbook-perf-link:focus{outline:2px solid #38bdf8;outline-offset:2px}' +
		'@media (prefers-reduced-motion:reduce){.biz-standbook-table .ant-table-tbody>tr,.biz-standbook-perf-link{transition:none}}';

	var deptOptions = useMemo(function () {
		return [
			{ value: '业务二部', label: '业务二部' },
			{ value: '华东业务部', label: '华东业务部' },
			{ value: '华南业务部', label: '华南业务部' },
			{ value: '华北业务部', label: '华北业务部' },
			{ value: '西南业务部', label: '西南业务部' }
		];
	}, []);

	var yearDraftState = useState(initialYear);
	var yearDraft = yearDraftState[0];
	var setYearDraft = yearDraftState[1];

	var yearAppliedState = useState(initialYear);
	var yearApplied = yearAppliedState[0];
	var setYearApplied = yearAppliedState[1];

	/** 业务部多选：空数组表示「全部」 */
	var deptDraftState = useState([]);
	var deptDraft = deptDraftState[0];
	var setDeptDraft = deptDraftState[1];

	var deptAppliedState = useState([]);
	var deptApplied = deptAppliedState[0];
	var setDeptApplied = deptAppliedState[1];

	var dataSource = useMemo(function () {
		var y = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : '';
		if (y === '2026') return buildMockYear2026();
		return [];
	}, [yearApplied]);

	var tableTitle = useMemo(function () {
		var y = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : '—';
		return '浙江羚牛氢能业务部汇总台账（' + y + '年度）';
	}, [yearApplied]);

	/** 与已应用筛选一致：空为全部，多选为「、」连接 */
	var deptDisplayLabel = useMemo(function () {
		if (!deptApplied || deptApplied.length === 0) return '全部';
		return deptApplied.map(function (v) {
			var o = deptOptions.find(function (x) { return x.value === v; });
			return o ? o.label : v;
		}).join('、');
	}, [deptApplied, deptOptions]);

	var handleQuery = useCallback(function () {
		setYearApplied(yearDraft);
		setDeptApplied(deptDraft);
	}, [yearDraft, deptDraft]);

	var handleReset = useCallback(function () {
		var y0 = initialYear();
		setYearDraft(y0);
		setYearApplied(y0);
		setDeptDraft([]);
		setDeptApplied([]);
	}, []);

	var viewState = useState('main');
	var view = viewState[0];
	var setView = viewState[1];

	var salesModalState = useState({ month: null, monthLabel: '', catKey: '', catLabel: '', perf: null, sourceRow: null });
	var salesModal = salesModalState[0];
	var setSalesModal = salesModalState[1];

	var projectModalState = useState({ salesperson: '', catKey: '', amount: null });
	var projectModal = projectModalState[0];
	var setProjectModal = projectModalState[1];

	var showSelfLeaseDrill = !!((view === 'sales' || view === 'project') && (salesModal.catKey === 'self' || salesModal.catKey === 'lease') && salesModal.sourceRow);

	var salesModalRows = useMemo(function () {
		if (view === 'main' || salesModal.month == null || !salesModal.catKey) return [];
		if (salesModal.catKey === 'self' || salesModal.catKey === 'lease') return [];
		return mockSalesmenDrill(salesModal.month, salesModal.catKey, salesModal.perf);
	}, [view, salesModal.month, salesModal.catKey, salesModal.perf]);

	var selfLeaseDrillPayload = useMemo(function () {
		if (view === 'main' || (salesModal.catKey !== 'self' && salesModal.catKey !== 'lease') || !salesModal.sourceRow) {
			return { rows: [], totals: { main: 0, h2: 0, elec: 0, etc: 0, other: 0 } };
		}
		return buildSelfLeaseDrillRows(salesModal, deptApplied, deptOptions, yearApplied);
	}, [view, salesModal.catKey, salesModal.sourceRow, salesModal.perf, salesModal.month, deptApplied, deptOptions, yearApplied]);

	var selfLeaseDrillTitle = useMemo(function () {
		if (view === 'main' || salesModal.month == null) return '';
		var y = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : 'YYYY';
		var ym = y + '-' + pad2(salesModal.month);
		var kind = salesModal.catKey === 'lease' ? '租赁' : '自营';
		return '浙江羚牛氢能业务员' + kind + '业务汇总（' + ym + '）';
	}, [view, salesModal.month, salesModal.catKey, yearApplied]);

	var projectModalRows = useMemo(function () {
		if (view !== 'project' || !projectModal.salesperson) return [];
		return mockProjectRows(projectModal.salesperson, projectModal.catKey || 'self');
	}, [view, projectModal.salesperson, projectModal.catKey]);

	var openPerfDrill = useCallback(function (row, catKey) {
		if (row.rowType === 'total') {
			message.info('合计行不支持钻取，请从各月份对应的「业绩」进入');
			return;
		}
		var v = row[catKey + 'Perf'];
		if (v === null || v === undefined || v === '' || numOrZero(v) === 0) {
			message.warning('该单元格无业绩数据');
			return;
		}
		var catLabel = (TRIPLE_DEFS.find(function (c) { return c.key === catKey; }) || {}).groupTitle || catKey;
		setSalesModal({
			month: row.month,
			monthLabel: row.monthLabel,
			catKey: catKey,
			catLabel: catLabel,
			perf: v,
			sourceRow: (catKey === 'self' || catKey === 'lease') ? row : null
		});
		setView('sales');
	}, []);

	var openProjectDrill = useCallback(function (r) {
		setProjectModal({
			salesperson: r.salesperson,
			catKey: salesModal.catKey,
			amount: r.amount
		});
		setView('project');
	}, [salesModal.catKey]);

	var openProjectDrillFromDetail = useCallback(function (r) {
		setProjectModal({
			salesperson: r.salesperson,
			catKey: salesModal.catKey,
			amount: r.mainPerf
		});
		setView('project');
	}, [salesModal.catKey]);

	var salesModalColumns = useMemo(function () {
		return [
			{ title: '业务员', dataIndex: 'salesperson', key: 'salesperson', width: 120 },
			{
				title: '业绩金额',
				dataIndex: 'amount',
				key: 'amount',
				align: 'right',
				render: function (v, r) {
					return React.createElement('button', {
						type: 'button',
						className: 'biz-standbook-perf-link',
						onClick: function () { openProjectDrill(r); }
					}, fmtMoney(v));
				}
			},
			{ title: '说明', key: 'hint', width: 200, render: function () { return React.createElement('span', { style: { color: 'rgba(0,0,0,0.45)', fontSize: 12 } }, '点击金额查看项目明细'); } }
		];
	}, [openProjectDrill]);

	var selfLeaseDrillColumns = useMemo(function () {
		var mainTitle = salesModal.catKey === 'lease' ? '租赁业绩' : '自营业绩';
		return [
			{
				title: '月份',
				dataIndex: 'ym',
				key: 'ym',
				width: 104,
				align: 'center',
				onCell: function (record) {
					return { rowSpan: record.monthRowSpan };
				}
			},
			{ title: '业务部门', dataIndex: 'deptName', key: 'deptName', width: 124 },
			{ title: '业务人员', dataIndex: 'salesperson', key: 'salesperson', width: 100 },
			{
				title: mainTitle,
				dataIndex: 'mainPerf',
				key: 'mainPerf',
				align: 'right',
				width: 120,
				render: function (v, r) {
					if (v === null || v === undefined || v === '' || numOrZero(v) === 0) {
						return fmtMoney(v);
					}
					return React.createElement('button', {
						type: 'button',
						className: 'biz-standbook-perf-link',
						onClick: function () { openProjectDrillFromDetail(r); }
					}, fmtMoney(v));
				}
			},
			{ title: '氢费业绩', dataIndex: 'h2PerfCol', key: 'h2PerfCol', align: 'right', width: 118, render: function (v) { return fmtMoney(v); } },
			{ title: '电费业绩', dataIndex: 'elecPerf', key: 'elecPerf', align: 'right', width: 118, render: function (v) { return fmtMoney(v); } },
			{ title: 'ETC业绩', dataIndex: 'etcPerfCol', key: 'etcPerfCol', align: 'right', width: 112, render: function (v) { return fmtMoney(v); } },
			{ title: '其他', dataIndex: 'otherAmt', key: 'otherAmt', align: 'right', width: 100, render: function (v) { return fmtMoney(v); } }
		];
	}, [salesModal.catKey, openProjectDrillFromDetail]);

	var projectModalColumns = useMemo(function () {
		return [
			{ title: '项目编号', dataIndex: 'projectCode', key: 'projectCode', width: 130 },
			{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', ellipsis: true },
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 110 },
			{ title: '业绩金额', dataIndex: 'amount', key: 'amount', align: 'right', render: function (v) { return fmtMoney(v); } },
			{ title: '业务日期', dataIndex: 'bizDate', key: 'bizDate', width: 110 },
			{ title: '备注', dataIndex: 'remark', key: 'remark', width: 80 }
		];
	}, []);

	var handleExport = useCallback(function () {
		if (!dataSource || dataSource.length === 0) {
			message.warning('当前无数据可导出，请先查询');
			return;
		}
		var y = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : 'ledger';
		var headers = ['月份'];
		TRIPLE_DEFS.forEach(function (c) {
			headers.push(c.short + '业绩', c.short + '成本', c.short + '利润');
		});
		headers.push('其他');
		var body = [headers];
		dataSource.forEach(function (r) {
			var line = [r.monthLabel];
			TRIPLE_KEYS.forEach(function (k) {
				line.push(fmtMoney(r[k + 'Perf']), fmtMoney(r[k + 'Cost']), fmtMoney(r[k + 'Profit']));
			});
			line.push(fmtMoney(r.otherAmount));
			body.push(line);
		});
		var deptCsv = (deptApplied && deptApplied.length)
			? deptApplied.map(function (v) {
				var o = deptOptions.find(function (x) { return x.value === v; });
				return o ? o.label : v;
			}).join('、')
			: '全部';
		body.push(['业务部', deptCsv]);
		downloadCsv('业务台账_' + y + '_' + new Date().getTime() + '.csv', body);
		message.success('已导出');
	}, [dataSource, yearApplied, deptApplied, deptOptions]);

	var ledgerColumns = useMemo(function () {
		var cols = [
			{
				title: '月份',
				dataIndex: 'monthLabel',
				key: 'monthLabel',
				fixed: 'left',
				width: 76,
				align: 'center',
				render: function (t, r) {
					if (r.rowType === 'total') return React.createElement('span', { style: { fontWeight: 700 } }, t);
					return t;
				}
			}
		];
		TRIPLE_DEFS.forEach(function (cat) {
			var ck = cat.key;
			var s = cat.short;
			cols.push({
				title: cat.groupTitle,
				key: 'grp-' + ck,
				align: 'center',
				children: [
					{
						title: s + '业绩',
						dataIndex: ck + 'Perf',
						key: ck + 'Perf',
						width: 112,
						align: 'right',
						render: function (v, row) {
							if (row.rowType === 'total' || v === null || v === undefined || v === '' || numOrZero(v) === 0) {
								return fmtMoney(v);
							}
							return React.createElement('button', {
								type: 'button',
								className: 'biz-standbook-perf-link',
								onClick: function () { openPerfDrill(row, ck); }
							}, fmtMoney(v));
						}
					},
					{
						title: s + '成本',
						dataIndex: ck + 'Cost',
						key: ck + 'Cost',
						width: 112,
						align: 'right',
						render: function (vmt) { return fmtMoney(vmt); }
					},
					{
						title: s + '利润',
						dataIndex: ck + 'Profit',
						key: ck + 'Profit',
						width: 112,
						align: 'right',
						render: function (vp) { return fmtMoney(vp); }
					}
				]
			});
		});
		cols.push({
			title: '其他',
			dataIndex: 'otherAmount',
			key: 'otherAmount',
			width: 108,
			align: 'right',
			render: function (vo) { return fmtMoney(vo); }
		});
		return cols;
	}, [openPerfDrill]);

	var rowClassName = useCallback(function (record) {
		if (record.rowType === 'total') return '';
		return 'biz-row-month';
	}, []);

	var renderMainView = function () {
		return React.createElement(React.Fragment, null,
			React.createElement(Card, { style: filterCardStyle, bodyStyle: { paddingBottom: 4 } },
				React.createElement(Row, { gutter: [16, 16], align: 'bottom' },
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '年份选择'),
							React.createElement(DatePicker, {
								picker: 'year',
								style: filterControlStyle,
								placeholder: '请选择年份',
								format: 'YYYY',
								value: yearDraft,
								onChange: function (v) { setYearDraft(v); }
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '业务部'),
							React.createElement(Select, {
								mode: 'multiple',
								placeholder: '全部',
								style: filterControlStyle,
								value: deptDraft,
								onChange: function (v) { setDeptDraft(v || []); },
								options: deptOptions,
								showSearch: true,
								allowClear: true,
								maxTagCount: 2,
								filterOption: filterOption
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6, style: filterActionsColStyle },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '\u00a0'),
							React.createElement(Space, { wrap: true },
								React.createElement(Button, { onClick: handleReset }, '重置'),
								React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
							)
						)
					)
				)
			),
			React.createElement(Card, { style: tableCardStyle, bodyStyle: { padding: '20px 20px 24px' } },
				React.createElement('div', { style: { position: 'relative', marginBottom: 8, minHeight: 36 } },
					React.createElement('div', { style: { textAlign: 'center', fontSize: 18, fontWeight: 700, color: 'rgba(15,23,42,0.92)', letterSpacing: '0.02em', padding: '0 88px' } }, tableTitle),
					React.createElement('div', { style: { position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' } },
						React.createElement(Button, { onClick: handleExport }, '导出')
					)
				),
				React.createElement('div', { style: { textAlign: 'center', marginBottom: 16, fontSize: 13, color: 'rgba(15,23,42,0.55)', fontWeight: 500 } },
					'业务部：',
					deptDisplayLabel
				),
				React.createElement('div', { className: 'biz-standbook-table-wrap' },
					React.createElement(Table, {
						className: 'biz-standbook-table',
						size: 'small',
						bordered: true,
						rowKey: 'key',
						columns: ledgerColumns,
						dataSource: dataSource,
						pagination: false,
						rowClassName: rowClassName,
						scroll: { x: 'max-content', y: 520 },
						sticky: true
					})
				)
			)
		);
	};

	var renderSalesView = function () {
		var titleText = showSelfLeaseDrill ? selfLeaseDrillTitle : ('业务员业绩 — ' + (salesModal.monthLabel || '') + ' / ' + (salesModal.catLabel || ''));
		return React.createElement(Card, { style: tableCardStyle, bodyStyle: { padding: '24px' } },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', marginBottom: 20 } },
				React.createElement(Button, { 
					onClick: function () { setView('main'); }, 
					style: { marginRight: 16 }
				}, '返回上一步'),
				React.createElement('div', { style: { fontSize: 18, fontWeight: 700, color: '#0f172a' } }, titleText)
			),
			showSelfLeaseDrill
				? React.createElement('div', { className: 'biz-standbook-table-wrap' },
					React.createElement(Table, {
						className: 'biz-standbook-table',
						size: 'small',
						bordered: true,
						rowKey: 'key',
						columns: selfLeaseDrillColumns,
						dataSource: selfLeaseDrillPayload.rows,
						pagination: false,
						scroll: { x: 'max-content' },
						summary: function () {
							var totals = selfLeaseDrillPayload.totals;
							var Sm = Table.Summary;
							var Row = Sm.Row;
							var Cell = Sm.Cell;
							return React.createElement(Sm, null,
								React.createElement(Row, null,
									React.createElement(Cell, { index: 0, colSpan: 3, align: 'center' }, '合计'),
									React.createElement(Cell, { index: 3, align: 'right' }, fmtMoney(totals.main)),
									React.createElement(Cell, { index: 4, align: 'right' }, fmtMoney(totals.h2)),
									React.createElement(Cell, { index: 5, align: 'right' }, fmtMoney(totals.elec)),
									React.createElement(Cell, { index: 6, align: 'right' }, fmtMoney(totals.etc)),
									React.createElement(Cell, { index: 7, align: 'right' }, fmtMoney(totals.other))
								)
							);
						}
					})
				)
				: React.createElement(React.Fragment, null,
					React.createElement('div', { style: { marginBottom: 16, color: '#64748b', fontSize: 14 } },
						'从总表钻取：本业务线下各业务员业绩构成。点击「业绩金额」继续查看项目明细。'
					),
					React.createElement('div', { className: 'biz-standbook-table-wrap' },
						React.createElement(Table, {
							className: 'biz-standbook-table',
							size: 'small',
							bordered: true,
							rowKey: 'key',
							columns: salesModalColumns,
							dataSource: salesModalRows,
							pagination: false,
							scroll: { x: 'max-content' }
						})
					)
				)
		);
	};

	var renderProjectView = function () {
		var titleText = '项目明细 — ' + (projectModal.salesperson || '') + ' · ' + ((TRIPLE_DEFS.find(function (c) { return c.key === projectModal.catKey; }) || {}).groupTitle || '');
		return React.createElement(Card, { style: tableCardStyle, bodyStyle: { padding: '24px' } },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', marginBottom: 20 } },
				React.createElement(Button, { 
					onClick: function () { setView('sales'); }, 
					style: { marginRight: 16 }
				}, '返回上一步'),
				React.createElement('div', { style: { fontSize: 18, fontWeight: 700, color: '#0f172a' } }, titleText)
			),
			React.createElement('div', { style: { marginBottom: 16, color: '#64748b', fontSize: 14 } },
				'二级钻取：该项目业务员名下具体项目/车辆维度业绩（演示数据）。'
			),
			React.createElement('div', { className: 'biz-standbook-table-wrap' },
				React.createElement(Table, {
					className: 'biz-standbook-table',
					size: 'small',
					bordered: true,
					rowKey: 'key',
					columns: projectModalColumns,
					dataSource: projectModalRows,
					pagination: false,
					scroll: { x: 'max-content' }
				})
			)
		);
	};

	var breadcrumbItems = [{ title: '数据分析' }, { title: '业务台账' }];
	if (view === 'sales' || view === 'project') {
		breadcrumbItems.push({ title: showSelfLeaseDrill ? '业务员汇总' : '业务员业绩' });
	}
	if (view === 'project') {
		breadcrumbItems.push({ title: '项目明细' });
	}

	return React.createElement(App, null,
		React.createElement('style', null, ledgerTableStyle),
		React.createElement('div', { style: layoutStyle },
			React.createElement(Breadcrumb, { style: { marginBottom: 14 }, items: breadcrumbItems }),
			view === 'main' ? renderMainView() : null,
			view === 'sales' ? renderSalesView() : null,
			view === 'project' ? renderProjectView() : null
		)
	);
};
