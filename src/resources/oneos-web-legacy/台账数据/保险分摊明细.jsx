// 【重要】必须使用 const Component 作为组件变量名
// 台账数据 - 车辆保险台账（保险分摊明细）
// 原型：客户名称 + 结算周期筛选、导出；日成本与分摊成本按业务公式计算（联调可替换为接口）

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
	var message = antd.message;

	var CUSTOMER_OPTIONS = [
		{ value: '浙江羚牛氢能科技有限公司', label: '浙江羚牛氢能科技有限公司' },
		{ value: '杭州绿运物流有限公司', label: '杭州绿运物流有限公司' },
		{ value: '宁波港城新能源车队', label: '宁波港城新能源车队' },
		{ value: '绍兴氢能示范运营中心', label: '绍兴氢能示范运营中心' }
	];

	var PROJECT_BY_CUSTOMER = {
		'浙江羚牛氢能科技有限公司': ['氢能重卡租赁一期', '园区通勤包车'],
		'杭州绿运物流有限公司': ['城配氢能车辆项目', '冷链专线'],
		'宁波港城新能源车队': ['港口短驳氢能车', '堆场转运'],
		'绍兴氢能示范运营中心': ['示范线路运营', '加氢站接驳']
	};

	var PLATE_PREFIX = ['浙A', '浙B', '浙D', '浙G'];

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function numOrZero(v) {
		if (v === null || v === undefined || v === '') return 0;
		var n = Number(v);
		return isNaN(n) ? 0 : n;
	}

	function fmtMoney(n, digits) {
		if (n === null || n === undefined || n === '') return '-';
		var x = Number(n);
		if (isNaN(x)) return '-';
		var d = digits === undefined ? 2 : digits;
		return x.toLocaleString('zh-CN', { minimumFractionDigits: d, maximumFractionDigits: d });
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

	function initialSettlementMonth() {
		try {
			if (window.dayjs) return window.dayjs('2026-05-01');
		} catch (e1) {}
		return null;
	}

	function settlementYm(d) {
		if (!d || !window.dayjs) return '';
		try {
			return window.dayjs(d).format('YYYY-MM');
		} catch (e2) {
			return '';
		}
	}

	/** 日成本 = 缴费金额 / 生效天数 */
	function dailyCost(payment, effectiveDays) {
		var pay = numOrZero(payment);
		var days = numOrZero(effectiveDays);
		if (days <= 0) return null;
		return Math.round((pay / days) * 10000) / 10000;
	}

	/** 保险分摊成本 = Σ(各险日成本 × 分摊天数) */
	function calcApportionCost(row) {
		var d = numOrZero(row.apportionDays);
		if (d <= 0) return null;
		var sum = 0;
		var has = false;
		['compulsoryDaily', 'commercialDaily', 'excessDaily', 'cargoDaily'].forEach(function (k) {
			var v = row[k];
			if (v !== null && v !== undefined && !isNaN(Number(v))) {
				sum += Number(v) * d;
				has = true;
			}
		});
		if (!has) return null;
		return Math.round(sum * 100) / 100;
	}

	function buildMockRows(ym) {
		var rows = [];
		var seed = 0;
		CUSTOMER_OPTIONS.forEach(function (cust, ci) {
			var projects = PROJECT_BY_CUSTOMER[cust.value] || ['默认项目'];
			projects.forEach(function (proj, pi) {
				seed += 1;
				var plate = PLATE_PREFIX[ci % PLATE_PREFIX.length] + String(10000 + seed).slice(-5) + 'F';
				var effDays = 365;
				var compulsoryPay = 950 + seed * 3;
				var commercialPay = 4200 + seed * 17;
				var excessPay = seed % 3 === 0 ? 1800 + seed * 5 : 0;
				var cargoPay = seed % 2 === 0 ? 600 + seed * 2 : 0;
				var apportionDays = 18 + ((seed + (ym ? ym.length : 0)) % 13);

				var row = {
					key: 'r' + seed,
					seq: seed,
					settlementCycle: ym || '2026-05',
					customerName: cust.value,
					projectName: proj,
					plateNo: plate,
					compulsoryDaily: dailyCost(compulsoryPay, effDays),
					commercialDaily: dailyCost(commercialPay, effDays),
					excessDaily: excessPay > 0 ? dailyCost(excessPay, effDays) : null,
					cargoDaily: cargoPay > 0 ? dailyCost(cargoPay, effDays) : null,
					apportionDays: apportionDays
				};
				row.apportionCost = calcApportionCost(row);
				rows.push(row);
			});
		});
		return rows;
	}


	var layoutStyle = {
		padding: '16px 24px 24px',
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
		'.ins-ledger-table-wrap{border-radius:12px;overflow:hidden;box-shadow:0 4px 24px -6px rgba(15,23,42,0.05),0 0 0 1px rgba(22,119,255,0.1)}' +
		'.ins-ledger-table .ant-table-thead>tr>th{white-space:nowrap;color:#1e293b!important;font-weight:600!important;font-size:13px!important;' +
		'background:#e8f4fc!important;border-bottom:1px solid #bae6fd!important;border-inline-end:1px solid #dbeafe!important;padding:0 8px!important;height:38px!important}' +
		'.ins-ledger-table .ant-table-tbody>tr:not(.ant-table-measure-row)>td{white-space:nowrap;font-variant-numeric:tabular-nums;color:#334155;border-bottom:1px solid #f1f5f9!important;border-inline-end:1px solid #f8fafc!important;padding:0 8px!important;height:38px!important}' +
		'.ins-ledger-table .ant-table-tbody>tr.ins-row-data:hover>td{background:#f0f9ff!important}' +
		'.ins-ledger-table .ant-table-summary>tr>td{font-weight:700;background:#f8fafc!important;color:#0f172a!important;border-top:2px solid #cbd5e1!important;padding:0 8px!important;height:38px!important}';

	var customerDraftState = useState(undefined);
	var customerDraft = customerDraftState[0];
	var setCustomerDraft = customerDraftState[1];

	var monthDraftState = useState(initialSettlementMonth);
	var monthDraft = monthDraftState[0];
	var setMonthDraft = monthDraftState[1];

	var customerAppliedState = useState(undefined);
	var customerApplied = customerAppliedState[0];
	var setCustomerApplied = customerAppliedState[1];

	var monthAppliedState = useState(initialSettlementMonth);
	var monthApplied = monthAppliedState[0];
	var setMonthApplied = monthAppliedState[1];

	var appliedYm = useMemo(function () {
		return settlementYm(monthApplied) || '2026-05';
	}, [monthApplied]);

	var allRows = useMemo(function () {
		return buildMockRows(appliedYm);
	}, [appliedYm]);

	var dataSource = useMemo(function () {
		var list = allRows.filter(function (r) {
			if (customerApplied && r.customerName !== customerApplied) return false;
			return true;
		});
		return list.map(function (r, idx) {
			return Object.assign({}, r, { seq: idx + 1 });
		});
	}, [allRows, customerApplied]);

	var totalApportionCost = useMemo(function () {
		return dataSource.reduce(function (acc, r) {
			return acc + numOrZero(r.apportionCost);
		}, 0);
	}, [dataSource]);

	var customerDisplayLabel = customerApplied || '默认全量数据';
	var cycleDisplayLabel = appliedYm || '-';

	var handleQuery = useCallback(function () {
		setCustomerApplied(customerDraft);
		setMonthApplied(monthDraft);
		message.success('查询成功');
	}, [customerDraft, monthDraft]);

	var handleReset = useCallback(function () {
		setCustomerDraft(undefined);
		setMonthDraft(initialSettlementMonth());
		setCustomerApplied(undefined);
		setMonthApplied(initialSettlementMonth());
	}, []);

	var handleExport = useCallback(function () {
		var headers = [
			'序号',
			'结算周期',
			'客户名称',
			'项目名称',
			'车牌号',
			'交强险日成本',
			'商业险日成本',
			'超赔险日成本',
			'货物险日成本',
			'分摊天数',
			'保险分摊成本'
		];
		var body = dataSource.map(function (r) {
			return [
				r.seq,
				r.settlementCycle,
				r.customerName,
				r.projectName,
				r.plateNo,
				r.compulsoryDaily,
				r.commercialDaily,
				r.excessDaily,
				r.cargoDaily,
				r.apportionDays,
				r.apportionCost
			];
		});
		body.push(['合计', '', '', '', '', '', '', '', '', '', totalApportionCost]);
		downloadCsv('车辆保险台账_' + cycleDisplayLabel + '_' + new Date().getTime() + '.csv', [headers].concat(body));
		message.success('已导出 CSV');
	}, [dataSource, cycleDisplayLabel, totalApportionCost]);

	var columns = useMemo(function () {
		return [
			{
				title: '序号',
				dataIndex: 'seq',
				key: 'seq',
				width: 64,
				align: 'center',
				fixed: 'left'
			},
			{
				title: '结算周期',
				dataIndex: 'settlementCycle',
				key: 'settlementCycle',
				width: 100,
				align: 'center'
			},
			{
				title: '客户名称',
				dataIndex: 'customerName',
				key: 'customerName',
				width: 200,
				align: 'center',
				ellipsis: true
			},
			{
				title: '项目名称',
				dataIndex: 'projectName',
				key: 'projectName',
				width: 160,
				align: 'center',
				ellipsis: true
			},
			{
				title: '车牌号',
				dataIndex: 'plateNo',
				key: 'plateNo',
				width: 110,
				align: 'center'
			},
			{
				title: '交强险日成本',
				dataIndex: 'compulsoryDaily',
				key: 'compulsoryDaily',
				width: 130,
				align: 'right',
				render: function (v) { return fmtMoney(v, 4); }
			},
			{
				title: '商业险日成本',
				dataIndex: 'commercialDaily',
				key: 'commercialDaily',
				width: 130,
				align: 'right',
				render: function (v) { return fmtMoney(v, 4); }
			},
			{
				title: '超赔险日成本',
				dataIndex: 'excessDaily',
				key: 'excessDaily',
				width: 130,
				align: 'right',
				render: function (v) { return fmtMoney(v, 4); }
			},
			{
				title: '货物险日成本',
				dataIndex: 'cargoDaily',
				key: 'cargoDaily',
				width: 130,
				align: 'right',
				render: function (v) { return fmtMoney(v, 4); }
			},
			{
				title: '分摊天数',
				dataIndex: 'apportionDays',
				key: 'apportionDays',
				width: 120,
				align: 'center'
			},
			{
				title: '保险分摊成本',
				dataIndex: 'apportionCost',
				key: 'apportionCost',
				width: 140,
				align: 'right',
				fixed: 'right',
				render: function (v) { return fmtMoney(v, 2); }
			}
		];
	}, []);

	var tableSummary = useCallback(function () {
		return React.createElement(
			Table.Summary,
			null,
			React.createElement(
				Table.Summary.Row,
				null,
				React.createElement(Table.Summary.Cell, { index: 0, align: 'center', colSpan: 1 }, '合计'),
				React.createElement(Table.Summary.Cell, { index: 1, colSpan: 9 }),
				React.createElement(Table.Summary.Cell, { index: 10, align: 'right' }, fmtMoney(totalApportionCost, 2))
			)
		);
	}, [totalApportionCost]);

	return React.createElement(
		App,
		null,
		React.createElement('style', null, ledgerTableStyle),
		React.createElement(
			'div',
			{ style: layoutStyle },
			React.createElement(Breadcrumb, {
				style: { marginBottom: 12 },
				items: [{ title: '台账数据' }, { title: '保险分摊明细' }]
			}),
			React.createElement(
				Card,
				{ style: filterCardStyle, bodyStyle: { paddingBottom: 4 } },
				React.createElement(
					Row,
					{ gutter: [16, 16], align: 'bottom' },
					React.createElement(
						Col,
						{ xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement(
							'div',
							{ style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '客户名称'),
							React.createElement(Select, {
								allowClear: true,
								showSearch: true,
								placeholder: '默认全量数据',
								style: filterControlStyle,
								value: customerDraft,
								onChange: function (v) { setCustomerDraft(v); },
								options: CUSTOMER_OPTIONS,
								filterOption: filterOption
							})
						)
					),
					React.createElement(
						Col,
						{ xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement(
							'div',
							{ style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '结算周期'),
							React.createElement(DatePicker, {
								picker: 'month',
								style: filterControlStyle,
								placeholder: '请选择结算周期',
								format: 'YYYY-MM',
								value: monthDraft,
								onChange: function (v) { setMonthDraft(v); }
							})
						)
					),
					React.createElement(
						Col,
						{ xs: 24, sm: 12, md: 8, lg: 6, style: filterActionsColStyle },
						React.createElement(
							'div',
							{ style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '\u00a0'),
							React.createElement(
								Space,
								{ wrap: true },
								React.createElement(Button, { onClick: handleReset }, '重置'),
								React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
							)
						)
					)
				)
			),
			React.createElement(
				Card,
				{ style: tableCardStyle, bodyStyle: { padding: '20px 20px 24px' } },
				React.createElement(
					'div',
					{ style: { position: 'relative', marginBottom: 8, minHeight: 36 } },
					React.createElement(
						'div',
						{
							style: {
								textAlign: 'center',
								fontSize: 18,
								fontWeight: 700,
								color: 'rgba(15,23,42,0.92)',
								letterSpacing: '0.02em',
								padding: '0 88px'
							}
						},
						'车辆保险台账'
					),
					React.createElement(
						'div',
						{ style: { position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' } },
						React.createElement(Button, { onClick: handleExport }, '导出')
					)
				),
				React.createElement(
					'div',
					{
						style: {
							textAlign: 'center',
							marginBottom: 16,
							fontSize: 13,
							color: 'rgba(15,23,42,0.55)',
							fontWeight: 500
						}
					},
					'结算周期：',
					cycleDisplayLabel,
					'\u00A0\u00A0\u00A0\u00A0客户：',
					customerDisplayLabel
				),
				React.createElement(
					'div',
					{ className: 'ins-ledger-table-wrap' },
					React.createElement(Table, {
						className: 'ins-ledger-table',
						size: 'small',
						bordered: true,
						rowKey: 'key',
						columns: columns,
						dataSource: dataSource,
						pagination: false,
						rowClassName: function () { return 'ins-row-data'; },
						scroll: { x: 'max-content', y: 'calc(100vh - 320px)' },
						sticky: true,
						summary: tableSummary
					})
				)
			)
		)
	);
};
