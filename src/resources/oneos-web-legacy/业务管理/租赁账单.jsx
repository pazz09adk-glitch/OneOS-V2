// 【重要】必须使用 const Component 作为组件变量名
// 租赁账单（2026年3月10日版本）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Table = antd.Table;
	var Button = antd.Button;
	var Select = antd.Select;
	var Input = antd.Input;
	var Space = antd.Space;
	var Popover = antd.Popover;
	var Modal = antd.Modal;
	var message = antd.message;

	var requirementModalVisible = useState(false);
	var filterContractCode = useState(undefined);
	var filterProjectName = useState(undefined);
	var filterCustomerName = useState(undefined);
	var filterBusinessDept = useState(undefined);
	var filterBusinessPerson = useState(undefined);
	var filterDeliveryTaskCode = useState('');
	var filterExpanded = useState(false);
	var expandedRowKeysState = useState([]);
	var deliveryPopoverOpen = useState(null);
	var costEditsState = useState({});
	var costEdits = costEditsState[0];
	var setCostEdits = costEditsState[1];
	var editingCostState = useState(null); // { key, field }
	var editingCost = editingCostState[0];
	var setEditingCost = editingCostState[1];
	var editingCostValueState = useState('');
	var editingCostValue = editingCostValueState[0];
	var setEditingCostValue = editingCostValueState[1];
	var expandedRowKeys = expandedRowKeysState[0];
	var setExpandedRowKeys = expandedRowKeysState[1];

	// 主表数据：按合同聚合，每条主表下有多条账单（子表）
	var mainListData = [
		{
			contractCode: 'HT-ZL-2025-001',
			deliveryTaskCode: 'JT-2025-001-A',
			contractType: '正式合同',
			projectName: '嘉兴氢能示范项目',
			customerName: '嘉兴某某物流有限公司',
			contractEffectiveDate: '2025-01-15',
			businessDept: '业务1部',
			businessPerson: '张经理',
			children: [
				{ period: 1, status: '已提交', billStartDate: '2025-01-01', billEndDate: '2025-01-31', deliveryCount: 3, deliveryVehicles: [{ brand: '东风', model: 'DFH1180', plateNo: '浙A12345' }, { brand: '福田', model: 'BJ1180', plateNo: '浙A23456' }, { brand: '重汽', model: 'ZZ1187', plateNo: '浙A34567' }], receivableTotal: 45800.00, actualTotal: 45500.00, discountTotal: 300.00, hydrogenCost: 1200.00, otherCost: 300.00 },
				{ period: 2, status: '待提交', billStartDate: '2025-02-01', billEndDate: '2025-02-28', deliveryCount: 2, deliveryVehicles: [{ brand: '陕汽', model: 'SX1313', plateNo: '浙A45678' }, { brand: '解放', model: 'J6P', plateNo: '浙A56789' }], receivableTotal: 45800.00, actualTotal: 45800.00, discountTotal: 0.00, hydrogenCost: 900.00, otherCost: 180.00 },
				{ period: 3, status: '待提交', billStartDate: '2025-03-01', billEndDate: '2025-03-31', deliveryCount: 2, deliveryVehicles: [{ brand: '江淮', model: '格尔发K5', plateNo: '浙A67890' }, { brand: '东风', model: 'DFH1250', plateNo: '浙A11111' }], receivableTotal: 45800.00, actualTotal: 45000.00, discountTotal: 800.00, hydrogenCost: 650.00, otherCost: 220.00 }
			]
		},
		{
			contractCode: 'HT-ZL-2025-002',
			deliveryTaskCode: 'JT-2025-002-B',
			contractType: '试用合同',
			projectName: '上海物流租赁项目',
			customerName: '上海某某运输公司',
			contractEffectiveDate: '2025-02-01',
			businessDept: '业务2部',
			businessPerson: '李专员',
			children: [
				{ period: 1, status: '已提交', billStartDate: '2025-02-01', billEndDate: '2025-02-28', deliveryCount: 2, deliveryVehicles: [{ brand: '江淮', model: '格尔发K5', plateNo: '沪B11111' }, { brand: '东风', model: 'DFH1250', plateNo: '沪B22222' }], receivableTotal: 33400.00, actualTotal: 33400.00, discountTotal: 0.00, hydrogenCost: 780.00, otherCost: 160.00 },
				{ period: 2, status: '待提交', billStartDate: '2025-03-01', billEndDate: '2025-03-31', deliveryCount: 1, deliveryVehicles: [{ brand: '解放', model: 'JH6', plateNo: '沪B33333' }], receivableTotal: 33400.00, actualTotal: 33400.00, discountTotal: 0.00, hydrogenCost: 0.00, otherCost: 0.00 }
			]
		},
		{
			contractCode: 'HT-ZL-2025-003',
			deliveryTaskCode: 'JT-2025-003-C',
			contractType: '正式合同',
			projectName: '杭州城配租赁项目',
			customerName: '杭州某某租赁有限公司',
			contractEffectiveDate: '2025-02-10',
			businessDept: '业务3部',
			businessPerson: '王专员',
			children: [
				{ period: 1, status: '已提交', billStartDate: '2025-02-10', billEndDate: '2025-03-09', deliveryCount: 1, deliveryVehicles: [{ brand: '福田', model: '欧曼EST', plateNo: '浙C33333' }], receivableTotal: 41200.00, actualTotal: 41200.00, discountTotal: 0.00, hydrogenCost: 500.00, otherCost: 120.00 }
			]
		}
	];

	var mainList = mainListData;
	var filterOptions = useMemo(function () {
		var codes = [], projects = [], customers = [], depts = [], persons = [];
		mainList.forEach(function (r) {
			if (r.contractCode && codes.indexOf(r.contractCode) === -1) codes.push(r.contractCode);
			if (r.projectName && projects.indexOf(r.projectName) === -1) projects.push(r.projectName);
			if (r.customerName && customers.indexOf(r.customerName) === -1) customers.push(r.customerName);
			if (r.businessDept && depts.indexOf(r.businessDept) === -1) depts.push(r.businessDept);
			if (r.businessPerson && persons.indexOf(r.businessPerson) === -1) persons.push(r.businessPerson);
		});
		return {
			contractCode: codes.map(function (v) { return { value: v, label: v }; }),
			projectName: projects.map(function (v) { return { value: v, label: v }; }),
			customerName: customers.map(function (v) { return { value: v, label: v }; }),
			businessDept: depts.map(function (v) { return { value: v, label: v }; }),
			businessPerson: persons.map(function (v) { return { value: v, label: v }; })
		};
	}, [mainList]);

	var filteredMainList = useMemo(function () {
		var list = mainList;
		var code = filterContractCode[0];
		var project = filterProjectName[0];
		var customer = filterCustomerName[0];
		var dept = filterBusinessDept[0];
		var person = filterBusinessPerson[0];
		var taskCode = (filterDeliveryTaskCode[0] || '').trim().toLowerCase();
		if (code) list = list.filter(function (r) { return r.contractCode === code; });
		if (project) list = list.filter(function (r) { return r.projectName === project; });
		if (customer) list = list.filter(function (r) { return r.customerName === customer; });
		if (dept) list = list.filter(function (r) { return r.businessDept === dept; });
		if (person) list = list.filter(function (r) { return r.businessPerson === person; });
		if (taskCode) list = list.filter(function (r) { return (r.deliveryTaskCode || '').toLowerCase().indexOf(taskCode) !== -1; });
		return list;
	}, [mainList, filterContractCode[0], filterProjectName[0], filterCustomerName[0], filterBusinessDept[0], filterBusinessPerson[0], filterDeliveryTaskCode[0]]);

	var mainTableDataSource = useMemo(function () {
		return filteredMainList.map(function (r) {
			var o = {};
			for (var k in r) if (k !== 'children') o[k] = r[k];
			o._detailList = r.children || [];
			return o;
		});
	}, [filteredMainList]);

	function fmtMoney(v) {
		if (v === null || v === undefined) return '0.00元';
		var n = typeof v === 'number' ? v : parseFloat(v);
		return (isNaN(n) ? '0.00' : n.toFixed(2)) + '元';
	}

	function pad4(n) {
		var s = String(n == null ? '' : n);
		return ('0000' + s).slice(-4);
	}

	function calcDays(startStr, endStr) {
		if (!startStr || !endStr) return 0;
		var start = new Date(startStr + 'T00:00:00');
		var end = new Date(endStr + 'T00:00:00');
		var ms = end.getTime() - start.getTime();
		if (!isFinite(ms)) return 0;
		var days = Math.floor(ms / 86400000) + 1;
		return days < 0 ? 0 : days;
	}

	var modelCostPerDayMap = useMemo(function () {
		return {
			'DFH1180': 120,
			'BJ1180': 95,
			'ZZ1187': 130,
			'SX1313': 110,
			'J6P': 125,
			'格尔发K5': 90,
			'DFH1250': 140,
			'JH6': 118,
			'欧曼EST': 150
		};
	}, []);

	function calcVehicleCost(record) {
		var days = calcDays(record.billStartDate, record.billEndDate);
		var vehicles = record.deliveryVehicles || [];
		var sum = 0;
		for (var i = 0; i < vehicles.length; i++) {
			var m = vehicles[i] && vehicles[i].model;
			var costPerDay = modelCostPerDayMap[m] || 0;
			sum += costPerDay * days;
		}
		return sum;
	}

	function getCostKey(record) {
		var p = record._parentRecord;
		var code = (p && p.contractCode) || '';
		var period = record.period != null ? record.period : '';
		return code + '-ZD' + pad4(period);
	}

	function renderEditableCost(field, record) {
		var key = getCostKey(record);
		var map = costEdits[key] || {};
		var v = map[field];
		if (v === undefined) v = record[field];
		var isEditing = editingCost && editingCost.key === key && editingCost.field === field;
		if (isEditing) {
			return React.createElement(Input, {
				autoFocus: true,
				value: editingCostValue,
				onChange: function (e) { setEditingCostValue(e.target.value); },
				onBlur: function () {
					var raw = (editingCostValue || '').trim();
					var num = raw === '' ? 0 : parseFloat(raw);
					var next = isNaN(num) ? 0 : Math.round(num * 100) / 100;
					setCostEdits(function (prev) {
						var p = Object.assign({}, prev || {});
						var row = Object.assign({}, p[key] || {});
						row[field] = next;
						p[key] = row;
						return p;
					});
					setEditingCost(null);
					setEditingCostValue('');
				},
				onPressEnter: function () { if (document && document.activeElement) document.activeElement.blur(); },
				suffix: '元'
			});
		}
		return React.createElement('span', {
			style: { cursor: 'pointer' },
			onClick: function () {
				setEditingCost({ key: key, field: field });
				setEditingCostValue((v == null || v === '') ? '' : String(Number(v).toFixed(2)));
			}
		}, fmtMoney(v));
	}

	function goView(record, parent) {
		message.info('查看账单详情（原型）');
	}
	function goChargeDetail(record, parent) {
		message.info('收费明细（原型）');
	}

	function renderSubActions(record, parentRecord) {
		var status = record && record.status;
		var isSubmitted = status === '已提交';
		return React.createElement(Space, { size: 'small' },
			React.createElement(Button, { type: 'link', size: 'small', onClick: function () { goView(record, parentRecord); } }, '查看'),
			isSubmitted ? null : React.createElement(Button, { type: 'link', size: 'small', onClick: function () { goChargeDetail(record, parentRecord); } }, '收费明细')
		);
	}

	// 子表提车数量气泡：列表显示 品牌、型号、车牌号
	function renderDeliveryPopover(record) {
		var vehicles = record.deliveryVehicles || [];
		var parentCode = (record._parentRecord && record._parentRecord.contractCode) || '';
		var popoverKey = parentCode + '-' + (record.period != null ? record.period : '');
		var listStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
		var thStyle = { padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa', fontWeight: 600 };
		var tdStyle = { padding: '6px 10px', borderBottom: '1px solid #f0f0f0' };
		var content = vehicles.length === 0 ? React.createElement('div', { style: { padding: 8 } }, '—') : React.createElement('div', { style: { padding: 0, minWidth: 200 } },
			React.createElement('table', { style: listStyle },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: thStyle }, '品牌'),
						React.createElement('th', { style: thStyle }, '型号'),
						React.createElement('th', { style: thStyle }, '车牌号')
					)
				),
				React.createElement('tbody', null,
					vehicles.map(function (v, i) {
						return React.createElement('tr', { key: i },
							React.createElement('td', { style: tdStyle }, v.brand || '—'),
							React.createElement('td', { style: tdStyle }, v.model || '—'),
							React.createElement('td', { style: tdStyle }, v.plateNo || '—')
						);
					})
				)
			)
		);
		var count = record.deliveryCount != null && record.deliveryCount !== '' ? Number(record.deliveryCount) : 0;
		return React.createElement(Popover, {
			content: content,
			title: '车辆详情',
			trigger: 'click',
			open: deliveryPopoverOpen[0] === popoverKey,
			onOpenChange: function (open) { deliveryPopoverOpen[1](open ? popoverKey : null); }
		}, React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 } }, (isNaN(count) ? 0 : count) + '辆'));
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var expandColumnWidth = 48;

	var mainColumns = [
		{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 130, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '合同类型', dataIndex: 'contractType', key: 'contractType', width: 100, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 140, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 140, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '合同生效日期', dataIndex: 'contractEffectiveDate', key: 'contractEffectiveDate', width: 118, render: function (v) { return v || '—'; } },
		{ title: '交车任务编码', dataIndex: 'deliveryTaskCode', key: 'deliveryTaskCode', width: 130, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '业务部门', dataIndex: 'businessDept', key: 'businessDept', width: 100, render: function (v) { return v || '—'; } },
		{ title: '业务负责人', dataIndex: 'businessPerson', key: 'businessPerson', width: 100, render: function (v) { return v || '—'; } }
	];

	var subColumns = [
		{ title: '账单编号', dataIndex: 'billNo', key: 'billNo', width: 220, ellipsis: true, render: function (v, record) { var p = record._parentRecord; var code = (p && p.contractCode) || ''; var period = record.period != null ? record.period : ''; return code ? (code + 'ZD' + pad4(period)) : '—'; } },
		{ title: '账单期数', dataIndex: 'period', key: 'period', width: 90, align: 'center', render: function (v) { return v != null ? v : '—'; } },
		{ title: '状态', dataIndex: 'status', key: 'status', width: 90, render: function (v) { return v || '—'; } },
		{ title: '账单开始日期', dataIndex: 'billStartDate', key: 'billStartDate', width: 120, render: function (v) { return v || '—'; } },
		{ title: '账单结束日期', dataIndex: 'billEndDate', key: 'billEndDate', width: 120, render: function (v) { return v || '—'; } },
		{ title: '提车数量', key: 'deliveryCount', width: 88, align: 'center', render: function (_, record) { return renderDeliveryPopover(record); } },
		{ title: '应收款总额', dataIndex: 'receivableTotal', key: 'receivableTotal', width: 110, align: 'right', render: function (v) { return fmtMoney(v); } },
		{ title: '实收款总额', dataIndex: 'actualTotal', key: 'actualTotal', width: 110, align: 'right', render: function (v) { return fmtMoney(v); } },
		{ title: '减免总金额', dataIndex: 'discountTotal', key: 'discountTotal', width: 100, align: 'right', render: function (v) { return fmtMoney(v); } },
		{ title: '车辆成本', key: 'vehicleCost', width: 110, align: 'right', render: function (_, record) { return fmtMoney(calcVehicleCost(record)); } },
		{ title: '氢费成本', dataIndex: 'hydrogenCost', key: 'hydrogenCost', width: 110, align: 'right', render: function (_, record) { return renderEditableCost('hydrogenCost', record); } },
		{ title: '其他成本', dataIndex: 'otherCost', key: 'otherCost', width: 110, align: 'right', render: function (_, record) { return renderEditableCost('otherCost', record); } },
		{
			title: '操作',
			key: 'action',
			width: 160,
			fixed: 'right',
			render: function (_, record, rowIndex, extra) {
				var parentRecord = (extra && extra._parentRecord) || record._parentRecord;
				return renderSubActions(record, parentRecord);
			}
		}
	];

	// 子表 rowKey 唯一：contractCode + period
	var _expandRowRender = function (record) {
		var rows = (record._detailList || []).map(function (r, idx) {
			var o = {}; for (var k in r) o[k] = r[k]; o._parentRecord = record; o._rowIndex = idx; return o;
		});
		return React.createElement('div', {
			style: { marginBottom: 0, paddingLeft: expandColumnWidth, boxSizing: 'border-box' },
			draggable: false,
			onDragStart: function (e) { e.preventDefault(); }
		},
				React.createElement(Table, {
				rowKey: function (r) { return (record.contractCode || '') + '-' + (r.period != null ? r.period : r._rowIndex); },
				columns: subColumns.map(function (col) {
					if (col.key !== 'action') return col;
					return {
						title: col.title,
						key: col.key,
						width: col.width,
						fixed: col.fixed,
						render: function (val, row) {
							return renderSubActions(row, record);
						}
					};
				}),
				dataSource: rows,
				pagination: false,
				size: 'small',
				bordered: true,
				scroll: { x: 1450 }
			})
		);
	};

	var requirementContent = '租赁账单（2026年3月10日版本）\n一个「数字化资产ONEOS运管平台」中的「租赁账单」模块\n#面包屑：业务管理-租赁账单；\n1.筛选：\n#支持合同编码/项目名称/客户名称/业务部门/业务负责人等筛选方式；\n1.1.合同编码：选择器，支持输入框内手动输入下拉模糊匹配对应项；\n1.2.项目名称：选择器，支持输入框内手动输入下拉模糊匹配对应项；\n1.3.客户名称：选择器，支持输入框内手动输入下拉模糊匹配对应项；\n1.4.业务部门：选择器，支持选择所有业务部门；\n1.5.业务负责人：选择器，支持选择所有业务负责人；\n1.6.交车任务编码：输入框，支持模糊搜索；\n1.7.右侧为重置、查询按钮；\n\n2.租赁账单列表：\n列表展示方式为：嵌套子表格，分为主表和子表\n2.1.主表：显示以下字段：合同编码、合同类型、项目名称、客户名称、合同生效日期、业务部门、业务负责人；\n    2.1.1.合同编码：显示车辆租赁合同编码；\n    2.1.2.合同类型：显示该租赁合同对应合同类型，显示该合同为试用合同还是正式合同；\n    2.1.3.项目名称：显示该租赁合同对应项目名称；\n    2.1.4.客户名称：显示该租赁合同对应客户名称；\n    2.1.5.合同生效日期：显示该租赁合同生效日期，格式为：YYYY-MM-DD；\n    2.1.6.交车任务编码：显示交车任务编码；\n    2.1.7.业务部门：显示该租赁合同对应业务部门名称；\n    2.1.8.业务负责人：显示该租赁合同对应业务负责人；\n    2.1.9.主表右下方为分页符，支持分页和选择单页显示数据条数；\n\n2.2.子表：显示以下字段：账单编号、账单期数、账单开始日期、账单结束日期、应收款总额、实收款总额、减免总金额、实际到账金额、是否已开票、开票金额、操作；\n    2.2.1.账单编号：[合同编码][账单编号]组成，主要用于后期与用友YS系统打通时获取财务收款及发票相关数据；\n          前缀为合同编码，后缀为账单编号，规则为：ZD+4位编号，为该合同下第x份账单，例如：ZD0001为该合同下第1份账单，依次类推；\n          例如：JXZL20260216YW101235AZD0001即为JXZL20260216YW101235A合同下第1份账单；\n    2.2.2.账单期数：显示该笔账单对应期数；\n    2.2.3.处理状态：已提交、待提交、已结清；\n          2.2.3.1.已提交：业务人员已通过点击收费明细，对收费项进行过维护并经过二次确认后提交；\n          2.2.3.2.待提交：业务人员未完成收费明细填报；\n          2.2.3.3.已结清：（等对接财务系统后，到账金额等于实收金额总额后算作已结清）；\n    2.2.3.账单开始日期：显示该笔账单开始日期，格式为：YYYY-MM-DD；\n    2.2.4.账单结束日期：显示该笔账单结束日期，格式为：YYYY-MM-DD；\n    2.2.5.提车数量：显示提车数量，格式为：xx辆，点击弹出气泡卡片，卡片内为列表，显示：品牌、型号、车牌号；\n    2.2.6.应收款总额：显示该笔账单应收款总额，格式为：xx.xx元，计算方式：「所有车辆月租金总和」+「所有车辆服务费总和」；\n    2.2.7.实收款总额：显示该笔账单实收款总额，格式为：xx.xx元，计算方式：「所有车辆月租金总和」+「所有车辆服务费总和」-「减免总金额」；\n    2.2.8.减免总金额：显示该笔账单减免总金额，格式为：xx.xx元，计算方式：「所有减免金额总和」；\n    2.2.9.车辆成本：根据型号成本表中对应型号车辆成本，租赁订单包含车辆型号*实际账单天数计算得出；\n    2.2.10.氢费成本：显示格式为：xx.xx元，点击变为输入框，后缀为元，支持2位小数，失焦后保存；\n    2.2.11.其他成本：显示格式为：xx.xx元，点击变为输入框，后缀为元，支持2位小数，失焦后保存；\n\n    2.2.12.操作：查看、收费明细；\n           2.2.12.1.查看：点击跳转租赁账单-查看页；\n           2.2.12.2.收费明细：提交后收费明细将不可修改；\n\n';

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, {
				items: [
		{ title: '业务管理' },
		{ title: '租赁账单' }
				]
			}),
			React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { requirementModalVisible[1](true); } }, '查看需求说明')
		),
		React.createElement(Card, { title: '筛选', style: cardStyle },
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', alignItems: 'start' } },
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '合同编码'),
					React.createElement(Select, {
						placeholder: '请选择或输入合同编码',
						allowClear: true,
						showSearch: true,
						style: filterControlStyle,
						value: filterContractCode[0],
						onChange: function (v) { filterContractCode[1](v); },
						options: filterOptions.contractCode,
						filterOption: function (input, opt) { return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1; }
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '项目名称'),
					React.createElement(Select, {
						placeholder: '请选择或输入项目名称',
						allowClear: true,
						showSearch: true,
						style: filterControlStyle,
						value: filterProjectName[0],
						onChange: function (v) { filterProjectName[1](v); },
						options: filterOptions.projectName,
						filterOption: function (input, opt) { return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1; }
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '客户名称'),
					React.createElement(Select, {
						placeholder: '请选择或输入客户名称',
						allowClear: true,
						showSearch: true,
						style: filterControlStyle,
						value: filterCustomerName[0],
						onChange: function (v) { filterCustomerName[1](v); },
						options: filterOptions.customerName,
						filterOption: function (input, opt) { return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1; }
					})
				),
				filterExpanded[0] ? React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '业务部门'),
					React.createElement(Select, {
						placeholder: '请选择业务部门',
						allowClear: true,
						style: filterControlStyle,
						value: filterBusinessDept[0],
						onChange: function (v) { filterBusinessDept[1](v); },
						options: filterOptions.businessDept
					})
				) : null,
				filterExpanded[0] ? React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '业务负责人'),
					React.createElement(Select, {
						placeholder: '请选择业务负责人',
						allowClear: true,
						style: filterControlStyle,
						value: filterBusinessPerson[0],
						onChange: function (v) { filterBusinessPerson[1](v); },
						options: filterOptions.businessPerson
					})
				) : null,
				filterExpanded[0] ? React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '交车任务编码'),
					React.createElement(Input, {
						placeholder: '请输入交车任务编码，支持模糊搜索',
						allowClear: true,
						style: filterControlStyle,
						value: filterDeliveryTaskCode[0],
						onChange: function (e) { filterDeliveryTaskCode[1](e.target.value); }
					})
				) : null
			),
			React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
				React.createElement(Button, { type: 'link', size: 'small', onClick: function () { filterExpanded[1](!filterExpanded[0]); } }, filterExpanded[0] ? '收起' : '展开'),
				React.createElement(Button, { onClick: function () { filterContractCode[1](undefined); filterProjectName[1](undefined); filterCustomerName[1](undefined); filterBusinessDept[1](undefined); filterBusinessPerson[1](undefined); filterDeliveryTaskCode[1](''); } }, '重置'),
				React.createElement(Button, { type: 'primary' }, '查询')
			)
		),
		React.createElement(Card, { title: '租赁账单列表', style: cardStyle },
			React.createElement(Table, {
				rowKey: 'contractCode',
				columns: mainColumns,
				dataSource: mainTableDataSource,
				expandable: {
					expandedRowKeys: expandedRowKeys,
					onExpandedRowsChange: function (keys) { setExpandedRowKeys(keys || []); },
					expandedRowRender: _expandRowRender,
					rowExpandable: function (record) { return (record._detailList && record._detailList.length > 0); },
					columnWidth: expandColumnWidth
				},
				pagination: { pageSize: 10, showSizeChanger: true, showTotal: function (t) { return '共 ' + t + ' 条'; } },
				size: 'middle',
				bordered: true,
				scroll: { x: 958 }
			})
		),
		React.createElement(Modal, {
			title: '需求说明',
			open: requirementModalVisible[0],
			onCancel: function () { requirementModalVisible[1](false); },
			width: 720,
			footer: React.createElement(Button, { onClick: function () { requirementModalVisible[1](false); } }, '关闭'),
			bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
		}, React.createElement('div', { style: { padding: '8px 0' } },
			React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6 } }, requirementContent))
		)
	);
};
