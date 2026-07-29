// 【重要】必须使用 const Component 作为组件变量名
// 数据分析 - 浙江羚牛氢能业务部汇总台账（月度 × 业务 × 业绩/成本/利润）
// 原型：年份 + 业务部筛选、导出；点击「业绩」金额钻取业务员 → 再钻取项目明细（联调可替换为接口）

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

	/** 业务板块（与示意图一致）：自营 / 租赁 / 销售 / 审车 / 代办 / ETC / 其他 */
	var CATEGORY_DEFS = [
		{ key: 'self', label: '自营业务' },
		{ key: 'lease', label: '租赁业务' },
		{ key: 'sales', label: '销售' },
		{ key: 'inspection', label: '审车' },
		{ key: 'agency', label: '代办' },
		{ key: 'etc', label: 'ETC' },
		{ key: 'other', label: '其他' }
	];

	var CATEGORY_KEYS = CATEGORY_DEFS.map(function (c) { return c.key; });

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

	/** 汇总行：对 1–12 月逐字段求和 */
	function sumLedgerRows(monthRows) {
		var acc = { month: 13, monthLabel: '合计', rowType: 'total', key: 'total' };
		CATEGORY_KEYS.forEach(function (k) {
			acc[k + 'Perf'] = 0;
			acc[k + 'Cost'] = 0;
			acc[k + 'Profit'] = 0;
		});
		(monthRows || []).forEach(function (r) {
			CATEGORY_KEYS.forEach(function (k) {
				acc[k + 'Perf'] += numOrZero(r[k + 'Perf']);
				acc[k + 'Cost'] += numOrZero(r[k + 'Cost']);
				acc[k + 'Profit'] += numOrZero(r[k + 'Profit']);
			});
		});
		CATEGORY_KEYS.forEach(function (k) {
			if (acc[k + 'Perf'] === 0) acc[k + 'Perf'] = null;
			if (acc[k + 'Cost'] === 0) acc[k + 'Cost'] = null;
			if (acc[k + 'Profit'] === 0) acc[k + 'Profit'] = null;
		});
		return acc;
	}

	/**
	 * 原型数据：2026 年按月；1 月部分数值与示意图/样例一致（审车业绩、代办业绩、ETC业绩）
	 * 其余月份为演示占位，可联调替换
	 */
	function buildMockYear2026() {
		var rows = [];
		var i;
		for (i = 1; i <= 12; i++) {
			var selfPerf = 250000 + Math.random() * 100000;
			var selfCost = selfPerf * (0.8 + Math.random() * 0.1);
			
			var leasePerf = 180000 + Math.random() * 50000;
			var leaseCost = leasePerf * (0.6 + Math.random() * 0.1);
			
			var salesPerf = 300000 + Math.random() * 200000;
			var salesCost = salesPerf * (0.7 + Math.random() * 0.15);
			
			var inspectionPerf = 80000 + Math.random() * 60000;
			var inspectionCost = inspectionPerf * (0.6 + Math.random() * 0.2);
			
			var agencyPerf = 3000 + Math.random() * 2000;
			var agencyCost = agencyPerf * (0.3 + Math.random() * 0.1);
			
			var etcPerf = 70000 + Math.random() * 20000;
			var etcCost = etcPerf * (0.5 + Math.random() * 0.1);
			
			var otherPerf = 8000 + Math.random() * 5000;
			var otherCost = otherPerf * (0.4 + Math.random() * 0.2);

			var src = {
				selfPerf: Math.round(selfPerf * 100) / 100,
				selfCost: Math.round(selfCost * 100) / 100,
				selfProfit: Math.round((selfPerf - selfCost) * 100) / 100,
				
				leasePerf: Math.round(leasePerf * 100) / 100,
				leaseCost: Math.round(leaseCost * 100) / 100,
				leaseProfit: Math.round((leasePerf - leaseCost) * 100) / 100,
				
				salesPerf: Math.round(salesPerf * 100) / 100,
				salesCost: Math.round(salesCost * 100) / 100,
				salesProfit: Math.round((salesPerf - salesCost) * 100) / 100,
				
				inspectionPerf: Math.round(inspectionPerf * 100) / 100,
				inspectionCost: Math.round(inspectionCost * 100) / 100,
				inspectionProfit: Math.round((inspectionPerf - inspectionCost) * 100) / 100,
				
				agencyPerf: Math.round(agencyPerf * 100) / 100,
				agencyCost: Math.round(agencyCost * 100) / 100,
				agencyProfit: Math.round((agencyPerf - agencyCost) * 100) / 100,
				
				etcPerf: Math.round(etcPerf * 100) / 100,
				etcCost: Math.round(etcCost * 100) / 100,
				etcProfit: Math.round((etcPerf - etcCost) * 100) / 100,
				
				otherPerf: Math.round(otherPerf * 100) / 100,
				otherCost: Math.round(otherCost * 100) / 100,
				otherProfit: Math.round((otherPerf - otherCost) * 100) / 100
			};
			
			rows.push({
				key: 'm' + i,
				month: i,
				monthLabel: i + '月',
				rowType: 'month',
				selfPerf: src.selfPerf, selfCost: src.selfCost, selfProfit: src.selfProfit,
				leasePerf: src.leasePerf, leaseCost: src.leaseCost, leaseProfit: src.leaseProfit,
				salesPerf: src.salesPerf, salesCost: src.salesCost, salesProfit: src.salesProfit,
				inspectionPerf: src.inspectionPerf, inspectionCost: src.inspectionCost, inspectionProfit: src.inspectionProfit,
				agencyPerf: src.agencyPerf, agencyCost: src.agencyCost, agencyProfit: src.agencyProfit,
				etcPerf: src.etcPerf, etcCost: src.etcCost, etcProfit: src.etcProfit,
				otherPerf: src.otherPerf, otherCost: src.otherCost, otherProfit: src.otherProfit
			});
		}
		rows.push(sumLedgerRows(rows));
		return rows;
	}

	/** 业务员钻取：按 月 + 业务 返回演示列表（金额拆分为比例，末行补齐差额） */
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
		var parts = base.map(function (b, idx) {
			if (idx === base.length - 1) {
				var last = Math.round((total - assigned) * 100) / 100;
				return { key: b.key, salesperson: b.name, amount: last };
			}
			var amt = Math.round(total * b.ratio * 100) / 100;
			assigned += amt;
			return { key: b.key, salesperson: b.name, amount: amt };
		});
		return parts;
	}

	/** 项目明细钻取 */
	function mockProjectRows(salesperson, catKey) {
		var catLabel = (CATEGORY_DEFS.find(function (c) { return c.key === catKey; }) || {}).label || catKey;
		return [
			{ key: 'p1', projectCode: 'PRJ-2026-001', projectName: catLabel + ' · 嘉兴冷链城配项目', plateNo: '沪A62261F', amount: null, bizDate: '2026-01-08', remark: '演示' },
			{ key: 'p2', projectCode: 'PRJ-2026-018', projectName: catLabel + ' · 沪浙干线运输', plateNo: '粤AGP3649', amount: null, bizDate: '2026-01-15', remark: '-' },
			{ key: 'p3', projectCode: 'PRJ-2026-033', projectName: catLabel + ' · 园区短驳', plateNo: '苏E·D32891', amount: null, bizDate: '2026-01-22', remark: '-' }
		].map(function (r, i, arr) {
			var share = i === arr.length - 1 ? 1 - arr.slice(0, -1).reduce(function (a) { return a + 0.31; }, 0) : 0.31;
			return Object.assign({}, r, { amount: Math.round(88000 * share * 100) / 100 });
		});
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var filterActionsColStyle = { flex: '0 0 auto', marginLeft: 'auto' };

	var ledgerTableStyle =
		'.biz-ledger-summary-table .ant-table-thead>tr>th{color:rgba(0,0,0,0.75)!important;font-weight:500!important;font-size:12px!important;background:#e6f4ff!important;border-color:rgba(0,0,0,0.06)!important}' +
		'.biz-ledger-summary-table .ant-table-thead>tr>th.ant-table-cell{background:#e6f4ff!important}' +
		'.biz-ledger-summary-table .ant-table-tbody>tr>td,.biz-ledger-summary-table .ant-table-tbody>tr.ant-table-row{white-space:nowrap}' +
		'.biz-ledger-summary-table .ant-table-tbody>tr[data-row-key=\"total\"]>td{font-weight:600;background:#fafafa!important}' +
		'.biz-ledger-perf-link{cursor:pointer;color:#1677ff;padding:0;border:none;background:none;font:inherit}' +
		'.biz-ledger-perf-link:hover{text-decoration:underline;color:#4096ff}';

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

	var deptDraftState = useState('业务二部');
	var deptDraft = deptDraftState[0];
	var setDeptDraft = deptDraftState[1];

	var deptAppliedState = useState('业务二部');
	var deptApplied = deptAppliedState[0];
	var setDeptApplied = deptAppliedState[1];

	var dataSource = useMemo(function () {
		var y = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : '';
		if (y === '2026') return buildMockYear2026();
		return [];
	}, [yearApplied]);

	var tableTitle = useMemo(function () {
		var y = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : '—';
		return y + '年度浙江羚牛氢能业务部汇总台账';
	}, [yearApplied]);

	var handleQuery = useCallback(function () {
		setYearApplied(yearDraft);
		setDeptApplied(deptDraft);
	}, [yearDraft, deptDraft]);

	var handleReset = useCallback(function () {
		var y0 = initialYear();
		setYearDraft(y0);
		setYearApplied(y0);
		setDeptDraft('业务二部');
		setDeptApplied('业务二部');
	}, []);

	var salesModalState = useState({ open: false, month: null, monthLabel: '', catKey: '', catLabel: '', perf: null });
	var salesModal = salesModalState[0];
	var setSalesModal = salesModalState[1];

	var projectModalState = useState({ open: false, salesperson: '', catKey: '', amount: null });
	var projectModal = projectModalState[0];
	var setProjectModal = projectModalState[1];

	var salesModalRows = useMemo(function () {
		if (!salesModal.open || salesModal.month == null || !salesModal.catKey) return [];
		return mockSalesmenDrill(salesModal.month, salesModal.catKey, salesModal.perf);
	}, [salesModal.open, salesModal.month, salesModal.catKey, salesModal.perf]);

	var projectModalRows = useMemo(function () {
		if (!projectModal.open || !projectModal.salesperson) return [];
		return mockProjectRows(projectModal.salesperson, projectModal.catKey || 'self');
	}, [projectModal.open, projectModal.salesperson, projectModal.catKey]);

	var openPerfDrill = useCallback(function (row, catKey) {
		if (row.rowType === 'total') {
			message.info('合计行演示不支持钻取，请从各月份「业绩」进入');
			return;
		}
		var v = row[catKey + 'Perf'];
		if (v === null || v === undefined || v === '' || numOrZero(v) === 0) {
			message.warning('该单元格无业绩数据');
			return;
		}
		var catLabel = (CATEGORY_DEFS.find(function (c) { return c.key === catKey; }) || {}).label || catKey;
		setSalesModal({
			open: true,
			month: row.month,
			monthLabel: row.monthLabel,
			catKey: catKey,
			catLabel: catLabel,
			perf: v
		});
	}, []);

	var closeSalesModal = useCallback(function () {
		setSalesModal(function (s) { return Object.assign({}, s, { open: false }); });
	}, []);

	var openProjectDrill = useCallback(function (r) {
		setProjectModal({
			open: true,
			salesperson: r.salesperson,
			catKey: salesModal.catKey,
			amount: r.amount
		});
	}, [salesModal.catKey]);

	var closeProjectModal = useCallback(function () {
		setProjectModal({ open: false, salesperson: '', catKey: '', amount: null });
	}, []);

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
						className: 'biz-ledger-perf-link',
						onClick: function () { openProjectDrill(r); }
					}, fmtMoney(v));
				}
			},
			{ title: '说明', key: 'hint', width: 200, render: function () { return React.createElement('span', { style: { color: 'rgba(0,0,0,0.45)', fontSize: 12 } }, '点击金额查看项目明细'); } }
		];
	}, [openProjectDrill]);

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
		CATEGORY_DEFS.forEach(function (c) {
			headers.push(c.label + '-业绩', c.label + '-成本', c.label + '-利润');
		});
		var body = [headers];
		dataSource.forEach(function (r) {
			var line = [r.monthLabel];
			CATEGORY_KEYS.forEach(function (k) {
				line.push(fmtMoney(r[k + 'Perf']), fmtMoney(r[k + 'Cost']), fmtMoney(r[k + 'Profit']));
			});
			body.push(line);
		});
		body.push(['业务部', deptApplied]);
		downloadCsv('业务部汇总台账_' + y + '_' + new Date().getTime() + '.csv', body);
		message.success('已导出');
	}, [dataSource, yearApplied, deptApplied]);

	var ledgerColumns = useMemo(function () {
		var cols = [
			{
				title: '月份',
				dataIndex: 'monthLabel',
				key: 'monthLabel',
				fixed: 'left',
				width: 72,
				align: 'center',
				render: function (t, r) {
					if (r.rowType === 'total') return React.createElement('span', { style: { fontWeight: 600 } }, t);
					return t;
				}
			}
		];
		CATEGORY_DEFS.forEach(function (cat) {
			var ck = cat.key;
			cols.push({
				title: cat.label,
				key: 'grp-' + ck,
				children: [
					{
						title: '业绩',
						dataIndex: ck + 'Perf',
						key: ck + 'Perf',
						width: 108,
						align: 'right',
						render: function (v, row) {
							if (row.rowType === 'total' || v === null || v === undefined || v === '' || numOrZero(v) === 0) {
								return fmtMoney(v);
							}
							return React.createElement('button', {
								type: 'button',
								className: 'biz-ledger-perf-link',
								onClick: function () { openPerfDrill(row, ck); }
							}, fmtMoney(v));
						}
					},
					{
						title: '成本',
						dataIndex: ck + 'Cost',
						key: ck + 'Cost',
						width: 108,
						align: 'right',
						render: function (v) { return fmtMoney(v); }
					},
					{
						title: '利润',
						dataIndex: ck + 'Profit',
						key: ck + 'Profit',
						width: 108,
						align: 'right',
						render: function (v) { return fmtMoney(v); }
					}
				]
			});
		});
		return cols;
	}, [openPerfDrill]);

	return React.createElement(App, null,
		React.createElement('style', null, ledgerTableStyle),
		React.createElement('div', { style: layoutStyle },
			React.createElement(Breadcrumb, { style: { marginBottom: 12 }, items: [
				{ title: '数据分析' },
				{ title: '业务部汇总台账' }
			] }),
			React.createElement(Card, { style: { marginBottom: 16 } },
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
								placeholder: '请选择业务部',
								style: filterControlStyle,
								value: deptDraft,
								onChange: function (v) { setDeptDraft(v); },
								options: deptOptions,
								showSearch: true,
								allowClear: false,
								filterOption: filterOption
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6, style: filterActionsColStyle },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '\u00a0'),
							React.createElement(Space, { wrap: true },
								React.createElement(Button, { onClick: handleReset }, '重置'),
								React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询'),
								React.createElement(Button, { onClick: handleExport }, '导出')
							)
						)
					)
				)
			),
			React.createElement(Card, null,
				React.createElement('div', { style: { textAlign: 'center', marginBottom: 16, fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.88)' } }, tableTitle),
				React.createElement('div', { style: { textAlign: 'center', marginBottom: 8, fontSize: 12, color: 'rgba(0,0,0,0.45)' } },
					'业务部：', deptApplied, '　（原型：仅 2026 年有演示数据；筛选业务部不影响数值，联调后按接口过滤）'
				),
				React.createElement(Table, {
					className: 'biz-ledger-summary-table',
					size: 'small',
					bordered: true,
					rowKey: 'key',
					columns: ledgerColumns,
					dataSource: dataSource,
					pagination: false,
					scroll: { x: 2600, y: 520 },
					sticky: true
				})
			),
			React.createElement(Modal, {
				title: '业务员业绩 — ' + (salesModal.monthLabel || '') + ' / ' + (salesModal.catLabel || ''),
				open: salesModal.open,
				width: 720,
				onCancel: closeSalesModal,
				footer: React.createElement(Button, { onClick: closeSalesModal }, '关闭'),
				destroyOnClose: true
			},
				React.createElement('p', { style: { marginBottom: 12, color: 'rgba(0,0,0,0.55)', fontSize: 12 } },
					'从总表钻取：本业务线下各业务员业绩构成。点击「业绩金额」继续查看项目明细。'
				),
				React.createElement(Table, {
					size: 'small',
					rowKey: 'key',
					columns: salesModalColumns,
					dataSource: salesModalRows,
					pagination: false
				})
			),
			React.createElement(Modal, {
				title: '项目明细 — ' + (projectModal.salesperson || '') + ' · ' + ((CATEGORY_DEFS.find(function (c) { return c.key === projectModal.catKey; }) || {}).label || ''),
				open: projectModal.open,
				width: 900,
				onCancel: closeProjectModal,
				footer: React.createElement(Button, { onClick: closeProjectModal }, '关闭'),
				destroyOnClose: true
			},
				React.createElement('p', { style: { marginBottom: 12, color: 'rgba(0,0,0,0.55)', fontSize: 12 } },
					'二级钻取：该项目业务员名下具体项目/车辆维度业绩（演示数据）。'
				),
				React.createElement(Table, {
					size: 'small',
					rowKey: 'key',
					columns: projectModalColumns,
					dataSource: projectModalRows,
					pagination: false,
					scroll: { x: 800 }
				})
			)
		)
	);
};
