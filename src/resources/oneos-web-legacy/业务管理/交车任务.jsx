// 【重要】必须使用 const Component 作为组件变量名
// 数字化资产ONEOS运管平台 - 业务管理 - 交车任务

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Table = antd.Table;
	var Select = antd.Select;
	var Input = antd.Input;
	var Button = antd.Button;
	var Space = antd.Space;
	var Popover = antd.Popover;
	var Modal = antd.Modal;
	var DatePicker = antd.DatePicker;
	var message = antd.message;
	var RangePicker = DatePicker.RangePicker;

	// 筛选条件
	var filterDeliveryTaskCode = useState(undefined);
	var filterContractCode = useState(undefined);
	var filterProjectName = useState(undefined);
	var filterCustomerName = useState(undefined);

	// 分页（主表）
	var pageState = useState(1);
	var pageSizeState = useState(10);
	var currentPage = pageState[0];
	var setCurrentPage = pageState[1];
	var pageSize = pageSizeState[0];
	var setPageSize = pageSizeState[1];

	// 主表展开：只展开一行
	var expandedRowKeysState = useState([]);
	var expandedRowKeys = expandedRowKeysState[0];
	var setExpandedRowKeys = expandedRowKeysState[1];

	// 子表交车数量气泡（只开一个）
	var deliveryPopoverOpen = useState(null);

	// 筛选展开（默认显示一行）
	var filterExpanded = useState(false);

	// 需求说明弹窗
	var reqSpecOpen = useState(false);
	// 激活弹窗：重新设置预计交车日期、开始计费日期
	var activateModalOpen = useState(false);
	var activateRecord = useState(null);
	var activatePlanRange = useState(null);
	var activateBillingDate = useState(null);

	function buildDeliveryTaskCode(contractCode, seq) {
		var suffix = 'JC' + ('0000' + String(seq != null ? seq : '')).slice(-4);
		return String(contractCode || '') + suffix;
	}

	function getDeliveryStatus(detailRecord) {
		var vehicles = (detailRecord && detailRecord.vehicles) || [];
		if (!vehicles.length) return '未交车';
		var allDelivered = vehicles.every(function (v) { return v && v.actualDeliveryDate; });
		return allDelivered ? '已交车' : '未交车';
	}

	// 模拟：主表按合同聚合，子表为交车任务
	var initialMainList = useMemo(function () {
		return [
			{
				contractCode: 'JXZL20260216YW101235A',
				projectName: '嘉兴氢能运输项目',
				customerName: '嘉兴某某物流有限公司',
				businessDept: '业务1部',
				businessPerson: '张经理',
				contractEffectiveDate: '2026-02-16',
				contractEndDate: '2027-02-15',
				children: [
					{
						seq: 1,
						planDeliveryDisplay: '2026-03-01至2026-03-05',
						deliveryCount: 2,
						vehicles: [
							{ brand: '东风', model: 'DFH1180', plateNo: '浙A12345', actualDeliveryDate: '2026-03-02', deliverer: '运维李' },
							{ brand: '福田', model: 'BJ1180', plateNo: '浙A23456', actualDeliveryDate: '2026-03-03', deliverer: '运维王' }
						],
						billingStartDate: '2026-03-01',
						needReturnCar: '需要',
						creator: '张经理',
						createdAt: '2026-02-20',
						enabled: true
					},
					{
						seq: 2,
						planDeliveryDisplay: '2026-03-08',
						deliveryCount: 1,
						vehicles: [{ brand: '重汽', model: 'ZZ1187', plateNo: '浙A34567', actualDeliveryDate: '', deliverer: '' }],
						billingStartDate: '2026-03-08',
						needReturnCar: '不需要',
						creator: '张经理',
						createdAt: '2026-02-22',
						enabled: false
					}
				]
			},
			{
				contractCode: 'SHZL20260210YW101200A',
				projectName: '上海物流租赁项目',
				customerName: '上海某某运输公司',
				businessDept: '业务2部',
				businessPerson: '李专员',
				contractEffectiveDate: '2026-02-10',
				contractEndDate: '2027-02-09',
				children: [
					{
						seq: 1,
						planDeliveryDisplay: '2026-03-10',
						deliveryCount: 1,
						vehicles: [{ brand: '解放', model: 'JH6', plateNo: '沪A30003', actualDeliveryDate: '2026-03-10', deliverer: '运维李' }],
						billingStartDate: '2026-03-10',
						needReturnCar: '不需要',
						creator: '李专员',
						createdAt: '2026-02-21',
						enabled: true
					}
				]
			},
			{
				contractCode: 'JXZL20260215YW101234A',
				projectName: '杭州城配租赁项目',
				customerName: '杭州某某租赁有限公司',
				businessDept: '业务3部',
				businessPerson: '王专员',
				contractEffectiveDate: '2026-02-15',
				contractEndDate: '2027-02-14',
				children: [
					{
						seq: 1,
						planDeliveryDisplay: '2026-02-28至2026-03-02',
						deliveryCount: 3,
						vehicles: [
							{ brand: '品牌A', model: '型号A1', plateNo: '浙A10001', actualDeliveryDate: '2026-02-28', deliverer: '运维李' },
							{ brand: '品牌B', model: '型号B1', plateNo: '浙B20002', actualDeliveryDate: '2026-03-01', deliverer: '运维王' },
							{ brand: '品牌C', model: '型号C1', plateNo: '浙C50003', actualDeliveryDate: '2026-03-02', deliverer: '运维赵' }
						],
						billingStartDate: '2026-02-28',
						needReturnCar: '需要',
						creator: '王专员',
						createdAt: '2026-02-18',
						enabled: true
					}
				]
			}
		];
	}, []);

	var mainListState = useState(initialMainList);
	var mainList = mainListState[0];
	var setMainList = mainListState[1];

	// 下拉 options（合同编码/项目/客户）
	var filterOptions = useMemo(function () {
		var codes = [];
		var deliveryTaskCodes = [];
		var projects = [];
		var customers = [];
		mainList.forEach(function (r) {
			if (r.contractCode && codes.indexOf(r.contractCode) === -1) codes.push(r.contractCode);
			if (r.projectName && projects.indexOf(r.projectName) === -1) projects.push(r.projectName);
			if (r.customerName && customers.indexOf(r.customerName) === -1) customers.push(r.customerName);
			(r.children || []).forEach(function (c) {
				var full = buildDeliveryTaskCode(r.contractCode, c.seq);
				if (full && deliveryTaskCodes.indexOf(full) === -1) deliveryTaskCodes.push(full);
			});
		});
		return {
			deliveryTaskCode: deliveryTaskCodes.map(function (v) { return { value: v, label: v }; }),
			contractCode: codes.map(function (v) { return { value: v, label: v }; }),
			projectName: projects.map(function (v) { return { value: v, label: v }; }),
			customerName: customers.map(function (v) { return { value: v, label: v }; })
		};
	}, [mainList]);

	function selectFuzzy(input, opt) {
		return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1;
	}

	function resetFilters() {
		filterDeliveryTaskCode[1](undefined);
		filterContractCode[1](undefined);
		filterProjectName[1](undefined);
		filterCustomerName[1](undefined);
		setCurrentPage(1);
	}

	function handleQuery() {
		setCurrentPage(1);
		message.info('已按筛选条件查询');
	}

	function goView(record) {
		message.info('查看交车任务（原型）');
	}

	function goEdit(record) {
		message.info('编辑交车任务（原型）');
	}

	function toggleEnable(record) {
		if (record.enabled) {
			Modal.confirm({
				title: '确认挂起',
				content: '挂起交车任务会释放清空该交车任务车牌号以释放车辆，是否确定',
				okText: '确定',
				cancelText: '取消',
				onOk: function () {
					var parent = record._parentRecord;
					setMainList(function (prev) {
						return prev.map(function (p) {
							if (!parent || p.contractCode !== parent.contractCode) return p;
							var next = {};
							for (var k in p) next[k] = p[k];
							next.children = (p.children || []).map(function (c) {
								if (c.seq !== record.seq) return c;
								var vehicles = (c.vehicles || []).map(function (v) {
									return Object.assign({}, v, { plateNo: '', actualDeliveryDate: '', deliverer: '' });
								});
								return Object.assign({}, c, { enabled: false, vehicles: vehicles });
							});
							return next;
						});
					});
					message.success('已挂起');
				}
			});
		} else {
			activateRecord[1](record);
			activatePlanRange[1](null);
			activateBillingDate[1](null);
			activateModalOpen[1](true);
		}
	}

	function handleActivateConfirm() {
		var record = activateRecord[0];
		var planRange = activatePlanRange[0];
		var billingDate = activateBillingDate[0];
		if (!record) { activateModalOpen[1](false); return; }
		var toDateStr = function (d) { return d && typeof d.format === 'function' ? d.format('YYYY-MM-DD') : (d && typeof d === 'string' ? d : ''); };
		var planStr = planRange && planRange.length >= 1 && planRange[0]
			? (planRange.length >= 2 && planRange[1] ? toDateStr(planRange[0]) + '至' + toDateStr(planRange[1]) : toDateStr(planRange[0]))
			: '';
		var billingStr = billingDate ? toDateStr(billingDate) : '';
		if (!planStr || !billingStr) { message.warning('请填写预计交车日期和开始计费日期'); return; }
		var parent = record._parentRecord;
		setMainList(function (prev) {
			return prev.map(function (p) {
				if (!parent || p.contractCode !== parent.contractCode) return p;
				var next = {};
				for (var k in p) next[k] = p[k];
				next.children = (p.children || []).map(function (c) {
					if (c.seq !== record.seq) return c;
					return Object.assign({}, c, { enabled: true, planDeliveryDisplay: planStr, billingStartDate: billingStr });
				});
				return next;
			});
		});
		activateModalOpen[1](false);
		activateRecord[1](null);
		message.success('已激活');
	}

	// 筛选后的主表
	var filteredMainList = useMemo(function () {
		var list = mainList.slice();
		var contractCode = filterContractCode[0];
		var projectName = filterProjectName[0];
		var customerName = filterCustomerName[0];
		var deliveryTaskCode = filterDeliveryTaskCode[0];

		if (contractCode) list = list.filter(function (r) { return r.contractCode === contractCode; });
		if (projectName) list = list.filter(function (r) { return r.projectName === projectName; });
		if (customerName) list = list.filter(function (r) { return r.customerName === customerName; });

		// 交车任务编码：选择器（同合同编码交互），筛选时命中任一子表编码即可
		if (deliveryTaskCode) {
			list = list.filter(function (r) {
				var children = r.children || [];
				return children.some(function (c) {
					return buildDeliveryTaskCode(r.contractCode, c.seq) === deliveryTaskCode;
				});
			});
		}

		return list;
	}, [mainList, filterContractCode[0], filterProjectName[0], filterCustomerName[0], filterDeliveryTaskCode[0]]);

	// 主表 dataSource 去掉 children，避免 Table 误用 treeData 产生空白行
	var mainTableDataSource = useMemo(function () {
		return filteredMainList.map(function (r) {
			var o = {};
			for (var k in r) if (k !== 'children') o[k] = r[k];
			o._detailList = r.children || [];
			return o;
		});
	}, [filteredMainList]);

	var paginatedMain = useMemo(function () {
		var start = (currentPage - 1) * pageSize;
		return mainTableDataSource.slice(start, start + pageSize);
	}, [mainTableDataSource, currentPage, pageSize]);

	function renderDeliveryPopover(record) {
		var vehicles = record.vehicles || [];
		var parentCode = (record._parentRecord && record._parentRecord.contractCode) || '';
		var key = parentCode + '-' + (record.seq != null ? record.seq : '');

		var listStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
		var thStyle = { padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa', fontWeight: 600 };
		var tdStyle = { padding: '6px 10px', borderBottom: '1px solid #f0f0f0' };

		var content = vehicles.length === 0
			? React.createElement('div', { style: { padding: 8 } }, '—')
			: React.createElement('div', { style: { padding: 0, minWidth: 520 } },
				React.createElement('table', { style: listStyle },
					React.createElement('thead', null,
						React.createElement('tr', null,
							React.createElement('th', { style: thStyle }, '品牌'),
							React.createElement('th', { style: thStyle }, '型号'),
							React.createElement('th', { style: thStyle }, '车牌号'),
							React.createElement('th', { style: thStyle }, '实际交车日期'),
							React.createElement('th', { style: thStyle }, '交车人')
						)
					),
					React.createElement('tbody', null,
						vehicles.map(function (v, i) {
							return React.createElement('tr', { key: i },
								React.createElement('td', { style: tdStyle }, v.brand || '—'),
								React.createElement('td', { style: tdStyle }, v.model || '—'),
								React.createElement('td', { style: tdStyle }, v.plateNo || '—'),
								React.createElement('td', { style: tdStyle }, v.actualDeliveryDate ? v.actualDeliveryDate : '-'),
								React.createElement('td', { style: tdStyle }, v.deliverer ? v.deliverer : '-')
							);
						})
					)
				)
			);

		var count = record.deliveryCount != null ? Number(record.deliveryCount) : 0;
		return React.createElement(Popover, {
			content: content,
			title: '车辆明细',
			trigger: 'click',
			open: deliveryPopoverOpen[0] === key,
			onOpenChange: function (open) { deliveryPopoverOpen[1](open ? key : null); }
		}, React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 } }, (isNaN(count) ? 0 : count) + '辆'));
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };

	var expandColumnWidth = 48;

	var mainColumns = [
		{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 200, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 160, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 180, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '业务部门', dataIndex: 'businessDept', key: 'businessDept', width: 110, render: function (v) { return v || '—'; } },
		{ title: '业务负责人', dataIndex: 'businessPerson', key: 'businessPerson', width: 110, render: function (v) { return v || '—'; } },
		{ title: '合同生效日期', dataIndex: 'contractEffectiveDate', key: 'contractEffectiveDate', width: 120, render: function (v) { return v || '—'; } },
		{ title: '合同结束日期', dataIndex: 'contractEndDate', key: 'contractEndDate', width: 120, render: function (v) { return v || '—'; } }
	];

	var subColumns = [
		{
			title: '交车任务编码',
			key: 'deliveryTaskCode',
			width: 260,
			ellipsis: true,
			render: function (_, record) {
				var p = record._parentRecord;
				return buildDeliveryTaskCode(p && p.contractCode, record.seq) || '—';
			}
		},
		{ title: '任务状态', key: 'taskStatus', width: 88, render: function (_, record) { return record.enabled !== false ? '激活' : '挂起'; } },
		{ title: '交车状态', key: 'deliveryStatus', width: 100, render: function (_, record) { return getDeliveryStatus(record); } },
		{ title: '预计交车日期', dataIndex: 'planDeliveryDisplay', key: 'planDeliveryDisplay', width: 160, render: function (v) { return v || '—'; } },
		{ title: '交车数量', key: 'deliveryCount', width: 100, render: function (_, record) { return renderDeliveryPopover(record); } },
		{ title: '开始计费日期', dataIndex: 'billingStartDate', key: 'billingStartDate', width: 120, render: function (v) { return v || '—'; } },
		{ title: '创建人', dataIndex: 'creator', key: 'creator', width: 100, render: function (v) { return v || '—'; } },
		{ title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 110, render: function (v) { return v || '—'; } },
		{
			title: '操作',
			key: 'action',
			width: 200,
			fixed: 'right',
			render: function (_, record) {
				return React.createElement(Space, { size: 'small' },
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { goView(record); } }, '查看'),
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { goEdit(record); } }, '编辑'),
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { toggleEnable(record); } }, record.enabled ? '挂起' : '激活')
				);
			}
		}
	];

	function expandRowRender(record) {
		var rows = (record._detailList || []).map(function (r) {
			var o = {};
			for (var k in r) o[k] = r[k];
			o._parentRecord = record;
			return o;
		});

		return React.createElement('div', { style: { marginBottom: 0, paddingLeft: expandColumnWidth, boxSizing: 'border-box' } },
			React.createElement(Table, {
				rowKey: function (r) { return (record.contractCode || '') + '-' + (r.seq != null ? r.seq : Math.random()); },
				columns: subColumns,
				dataSource: rows,
				pagination: false,
				size: 'small',
				bordered: true,
				scroll: { x: 1380 }
			})
		);
	}

	var reqSpecText =
		"交车任务\n" +
		"一个「数字化资产ONEOS运管平台」中的「交车任务」模块\n" +
		"1.面包屑：\n" +
		"1.1.业务管理-交车任务\n\n" +
		"2.筛选：\n" +
		"支持通过合同编码、项目名称、客户名称进行筛选，右侧为查询、重置按钮；\n" +
		"2.1.交车任务编码：选择器，默认所有交车任务编码，提示信息为：请输入或选择交车任务编码，支持从输入框输入内容进行模糊搜索，下拉显示结果；\n" +
		"          编码规则为：[合同编码][交车任务编码]，主要用于后期与用友YS系统打通时获取财务收款及发票相关数据；\n" +
		"          前缀为合同编码，后缀为交车任务编码，规则为：JC+4位编号，为该合同下第x份交车任务，例如：JC0001为该合同下第1份交车任务，依次类推；\n" +
		"          例如：JXZL20260216YW101235AJC0001即为JXZL20260216YW101235A合同下第1份账单；\n" +
		"2.2.合同编码：选择器，默认为所有合同；提示信息为：请输入或选择合同编码，支持从输入框输入内容进行模糊搜索，下拉显示结果；\n" +
		"2.3.项目名称：选择器，默认为所有项目；提示信息为：请输入或选择项目名称，支持从输入框输入内容进行模糊搜索，下拉显示结果；\n" +
		"2.4.客户名称：选择器，默认为所有客户；提示信息为：请输入或选择客户名称，支持从输入框输入内容进行模糊搜索，下拉显示结果；\n" +
		"2.5.查询：点击查询，根据单个或多个筛选条件（且）联动表格进行查询；\n" +
		"2.6.重置：点击清空查询条件至默认；\n\n" +
		"3.列表：\n" +
		"#嵌套子表格，分为主表和子表，右侧为新增按钮；\n" +
		"3.1.主表展示以下内容：合同编码、项目名称、客户名称、业务部门、业务负责人、合同生效日期、合同结束日期；\n" +
		"3.1.1合同编码：显示对应合同编码；\n" +
		"3.1.2.项目名称：显示对应项目名称；\n" +
		"3.1.3.客户名称：显示对应客户名称；\n" +
		"3.1.4.业务部门：显示业务部门名称；\n" +
		"3.1.5.业务负责人：显示业务负责人名称；\n" +
		"3.1.6.合同生效日期：显示合同生效日期，格式为：YYYY-MM-DD；\n" +
		"3.1.7.合同结束日期：显示合同结束日期，格式为：YYYY-MM-DD；\n\n" +
		"3.2.子表展示以下内容:交车任务编码、预计交车日期、交车数量、开始计费日期、是否需要退还车、创建人、创建时间；\n" +
		"3.2.1.交车任务编码：编码规则为：[合同编码][交车任务编码]，主要用于后期与用友YS系统打通时获取财务收款及发票相关数据；\n" +
		"          前缀为合同编码，后缀为交车任务编码，规则为：JC+4位编号，为该合同下第x份交车任务，例如：JC0001为该合同下第1份交车任务，依次类推；\n" +
		"          例如：JXZL20260216YW101235AJC0001即为JXZL20260216YW101235A合同下第1份账单；\n" +
		"3.2.2.任务状态：显示挂起/激活，挂起的数据操作列对应激活、激活的数据操作列对应挂起；\n" +
		"3.2.3.交车状态：显示交车任务状态，分为：已交车、未交车；\n" +
		"3.2.4.预计交车日期：显示该交车任务预计交车日期，可能是某天，也可能是开始-结束时间段，格式分别为：YYYY-MM-DD、YYYY-MM-DD至YYYY-MM-DD/；\n" +
		"3.2.5.交车数量：显示实际交车数量，格式为：xx辆，点击数量弹出气泡卡片，列表显示：品牌、型号、车牌号、实际交车日期、交车人，其中实际交车日期和交车人没交车时显示为-；\n" +
		"3.2.6.开始计费日期：显示该交车任务开始计费日期，格式为：YYYY-MM-DD；\n" +
		"3.2.7.创建人：显示交车任务的创建人用户姓名；\n" +
		"3.2.8.创建时间：显示交车任务的创建时间，格式为YYYY-MM-DD；\n" +
		"3.2.9.操作：支持查看、编辑、挂起/激活；\n" +
		"      3.2.9.1.查看：跳转交车任务-查看页；\n" +
		"      3.2.9.2.编辑：跳转交车任务-编辑页，已交车的任务不支持编辑；\n" +
		"      3.2.9.3.挂起/激活：点击挂起，进行二次确认提示，提示文案：挂起交车任务会释放清空该交车任务车牌号以释放车辆，是否确定？；点击激活，弹框中重新设置预计交车日期、开始计费日期，设置成功后提示交车任务激活成功；\n\n" +
		"4.列表右下方为分页功能，支持单页显示条目选择；";

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
			React.createElement(Breadcrumb, { items: [{ title: '业务管理' }, { title: '交车任务' }] }),
			React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { reqSpecOpen[1](true); } }, '查看需求说明')
		),
		React.createElement(Card, { title: '筛选', style: cardStyle },
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', alignItems: 'start' } },
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '交车任务编码'),
					React.createElement(Select, {
						placeholder: '请输入交车任务编码',
						allowClear: true,
						showSearch: true,
						style: filterControlStyle,
						value: filterDeliveryTaskCode[0],
						onChange: function (v) { filterDeliveryTaskCode[1](v); },
						options: filterOptions.deliveryTaskCode,
						filterOption: selectFuzzy
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '合同编码'),
					React.createElement(Select, {
						placeholder: '请输入合同编码',
						allowClear: true,
						showSearch: true,
						style: filterControlStyle,
						value: filterContractCode[0],
						onChange: function (v) { filterContractCode[1](v); },
						options: filterOptions.contractCode,
						filterOption: selectFuzzy
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '项目名称'),
					React.createElement(Select, {
						placeholder: '请输入项目名称',
						allowClear: true,
						showSearch: true,
						style: filterControlStyle,
						value: filterProjectName[0],
						onChange: function (v) { filterProjectName[1](v); },
						options: filterOptions.projectName,
						filterOption: selectFuzzy
					})
				),
				filterExpanded[0] ? React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '客户名称'),
					React.createElement(Select, {
						placeholder: '请输入客户名称',
						allowClear: true,
						showSearch: true,
						style: filterControlStyle,
						value: filterCustomerName[0],
						onChange: function (v) { filterCustomerName[1](v); },
						options: filterOptions.customerName,
						filterOption: selectFuzzy
					})
				) : null
			),
			React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
				React.createElement(Button, { type: 'link', onClick: function () { filterExpanded[1](!filterExpanded[0]); } }, filterExpanded[0] ? '收起' : '展开'),
				React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询'),
				React.createElement(Button, { onClick: resetFilters }, '重置')
			)
		),
		React.createElement(Card, {
			title: '交车任务',
			style: cardStyle,
			extra: React.createElement(Button, {
				type: 'primary',
				onClick: function () { message.info('请参照原型：业务管理-交车任务-新增交车任务'); }
			}, '新增')
		},
			React.createElement(Table, {
				rowKey: 'contractCode',
				columns: mainColumns,
				dataSource: paginatedMain,
				expandable: {
					expandedRowKeys: expandedRowKeys,
					onExpandedRowsChange: function (keys) { setExpandedRowKeys(keys && keys.length ? [keys[keys.length - 1]] : []); },
					expandedRowRender: expandRowRender,
					rowExpandable: function (record) { return record._detailList && record._detailList.length > 0; },
					columnWidth: expandColumnWidth
				},
				pagination: {
					current: currentPage,
					pageSize: pageSize,
					total: mainTableDataSource.length,
					showSizeChanger: true,
					showTotal: function (t) { return '共 ' + t + ' 条'; },
					pageSizeOptions: ['10', '20', '50', '100'],
					onChange: function (p, ps) { setCurrentPage(p); setPageSize(ps); },
					onShowSizeChange: function () { setCurrentPage(1); }
				},
				size: 'middle',
				bordered: true,
				scroll: { x: 1110 }
			})
		)
		,
		React.createElement(Modal, {
			title: '激活交车任务',
			open: activateModalOpen[0],
			onCancel: function () { activateModalOpen[1](false); activateRecord[1](null); },
			width: 520,
			okText: '确定',
			cancelText: '取消',
			onOk: handleActivateConfirm,
			destroyOnClose: true
		}, React.createElement('div', { style: { padding: '8px 0' } },
			React.createElement('div', { style: { marginBottom: 16 } },
				React.createElement('div', { style: { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' } }, '预计交车日期'),
				React.createElement(RangePicker, {
					style: { width: '100%' },
					format: 'YYYY-MM-DD',
					placeholder: ['请选择开始日期', '请选择结束日期（单日请选同一天）'],
					value: activatePlanRange[0],
					onChange: function (dates) { activatePlanRange[1](dates && dates.length === 2 ? dates : null); }
				}),
				React.createElement('div', { style: { marginTop: 4, fontSize: 12, color: '#999' } }, '支持单日或开始-结束时间段，单日时开始与结束选同一天即可')
			),
			React.createElement('div', { style: { marginBottom: 8 } },
				React.createElement('div', { style: { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' } }, '开始计费日期'),
				React.createElement(DatePicker, {
					style: { width: '100%' },
					format: 'YYYY-MM-DD',
					placeholder: '请选择日期',
					value: (function () {
						var v = activateBillingDate[0];
						if (v == null) return null;
						if (typeof v.isValid === 'function') return v;
						if (typeof v === 'string' && window.dayjs) return window.dayjs(v);
						return null;
					})(),
					onChange: function (date) { activateBillingDate[1](date); }
				})
			)
		)),
		React.createElement(Modal, {
			title: '需求说明',
			open: reqSpecOpen[0],
			onCancel: function () { reqSpecOpen[1](false); },
			width: 820,
			footer: React.createElement(Button, { onClick: function () { reqSpecOpen[1](false); } }, '关闭'),
			bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
		}, React.createElement('div', { style: { whiteSpace: 'pre-wrap', lineHeight: 1.7, padding: '4px 2px' } }, reqSpecText))
	);
};

/*
// 【重要】必须使用 const Component 作为组件变量名
// 数字化资产ONEOS运管平台 - 业务管理 - 交车任务

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Table = antd.Table;
	var Select = antd.Select;
	var Input = antd.Input;
	var Button = antd.Button;
	var Space = antd.Space;
	var Popover = antd.Popover;
	var Modal = antd.Modal;
	var message = antd.message;

	// 筛选条件
	var filterDeliveryTaskCode = useState('');
	var filterContractCode = useState(undefined);
	var filterProjectName = useState(undefined);
	var filterCustomerName = useState(undefined);

	// 分页（主表）
	var pageState = useState(1);
	var pageSizeState = useState(10);
	var currentPage = pageState[0];
	var setCurrentPage = pageState[1];
	var pageSize = pageSizeState[0];
	var setPageSize = pageSizeState[1];

	// 主表展开：只展开一行
	var expandedRowKeysState = useState([]);
	var expandedRowKeys = expandedRowKeysState[0];
	var setExpandedRowKeys = expandedRowKeysState[1];

	// 子表交车数量气泡（只开一个）
	var deliveryPopoverOpen = useState(null);

	function buildDeliveryTaskCode(contractCode, seq) {
		var suffix = 'JC' + ('0000' + String(seq != null ? seq : '')).slice(-4);
		return String(contractCode || '') + suffix;
	}

	// 模拟：主表按合同聚合，子表为交车任务
	var initialMainList = useMemo(function () {
		return [
			{
				contractCode: 'JXZL20260216YW101235A',
				projectName: '嘉兴氢能运输项目',
				customerName: '嘉兴某某物流有限公司',
				businessDept: '业务1部',
				businessPerson: '张经理',
				contractEffectiveDate: '2026-02-16',
				contractEndDate: '2027-02-15',
				children: [
					{
						seq: 1,
						planDeliveryDisplay: '2026-03-01至2026-03-05',
						deliveryCount: 2,
						vehicles: [
							{ brand: '东风', model: 'DFH1180', plateNo: '浙A12345', actualDeliveryDate: '2026-03-02', deliverer: '运维李' },
							{ brand: '福田', model: 'BJ1180', plateNo: '浙A23456', actualDeliveryDate: '2026-03-03', deliverer: '运维王' }
						],
						billingStartDate: '2026-03-01',
						needReturnCar: '需要',
						creator: '张经理',
						createdAt: '2026-02-20',
						enabled: true
					},
					{
						seq: 2,
						planDeliveryDisplay: '2026-03-08',
						deliveryCount: 1,
						vehicles: [{ brand: '重汽', model: 'ZZ1187', plateNo: '浙A34567', actualDeliveryDate: '2026-03-08', deliverer: '运维赵' }],
						billingStartDate: '2026-03-08',
						needReturnCar: '不需要',
						creator: '张经理',
						createdAt: '2026-02-22',
						enabled: false
					}
				]
			},
			{
				contractCode: 'SHZL20260210YW101200A',
				projectName: '上海物流租赁项目',
				customerName: '上海某某运输公司',
				businessDept: '业务2部',
				businessPerson: '李专员',
				contractEffectiveDate: '2026-02-10',
				contractEndDate: '2027-02-09',
				children: [
					{
						seq: 1,
						planDeliveryDisplay: '2026-03-10',
						deliveryCount: 1,
						vehicles: [{ brand: '解放', model: 'JH6', plateNo: '沪A30003', actualDeliveryDate: '2026-03-10', deliverer: '运维李' }],
						billingStartDate: '2026-03-10',
						needReturnCar: '不需要',
						creator: '李专员',
						createdAt: '2026-02-21',
						enabled: true
					}
				]
			},
			{
				contractCode: 'JXZL20260215YW101234A',
				projectName: '杭州城配租赁项目',
				customerName: '杭州某某租赁有限公司',
				businessDept: '业务3部',
				businessPerson: '王专员',
				contractEffectiveDate: '2026-02-15',
				contractEndDate: '2027-02-14',
				children: [
					{
						seq: 1,
						planDeliveryDisplay: '2026-02-28至2026-03-02',
						deliveryCount: 3,
						vehicles: [
							{ brand: '品牌A', model: '型号A1', plateNo: '浙A10001', actualDeliveryDate: '2026-02-28', deliverer: '运维李' },
							{ brand: '品牌B', model: '型号B1', plateNo: '浙B20002', actualDeliveryDate: '2026-03-01', deliverer: '运维王' },
							{ brand: '品牌C', model: '型号C1', plateNo: '浙C50003', actualDeliveryDate: '2026-03-02', deliverer: '运维赵' }
						],
						billingStartDate: '2026-02-28',
						needReturnCar: '需要',
						creator: '王专员',
						createdAt: '2026-02-18',
						enabled: true
					}
				]
			}
		];
	}, []);

	var mainListState = useState(initialMainList);
	var mainList = mainListState[0];
	var setMainList = mainListState[1];

	// 下拉 options（合同编码/项目/客户）
	var filterOptions = useMemo(function () {
		var codes = [];
		var projects = [];
		var customers = [];
		mainList.forEach(function (r) {
			if (r.contractCode && codes.indexOf(r.contractCode) === -1) codes.push(r.contractCode);
			if (r.projectName && projects.indexOf(r.projectName) === -1) projects.push(r.projectName);
			if (r.customerName && customers.indexOf(r.customerName) === -1) customers.push(r.customerName);
		});
		return {
			contractCode: codes.map(function (v) { return { value: v, label: v }; }),
			projectName: projects.map(function (v) { return { value: v, label: v }; }),
			customerName: customers.map(function (v) { return { value: v, label: v }; })
		};
	}, [mainList]);

	function selectFuzzy(input, opt) {
		return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1;
	}

	function resetFilters() {
		filterDeliveryTaskCode[1]('');
		filterContractCode[1](undefined);
		filterProjectName[1](undefined);
		filterCustomerName[1](undefined);
		setCurrentPage(1);
	}

	function handleQuery() {
		setCurrentPage(1);
		message.info('已按筛选条件查询');
	}

	function goView(record) {
		message.info('查看交车任务（原型）');
	}

	function goEdit(record) {
		message.info('编辑交车任务（原型）');
	}

	function toggleEnable(record) {
		if (record.enabled) {
			Modal.confirm({
				title: '确认挂起',
				content: '挂起交车任务会释放清空该交车任务车牌号以释放车辆，是否确定',
				okText: '确定',
				cancelText: '取消',
				onOk: function () {
					var parent = record._parentRecord;
					setMainList(function (prev) {
						return prev.map(function (p) {
							if (!parent || p.contractCode !== parent.contractCode) return p;
							var next = {};
							for (var k in p) next[k] = p[k];
							next.children = (p.children || []).map(function (c) {
								if (c.seq !== record.seq) return c;
								var vehicles = (c.vehicles || []).map(function (v) {
									return Object.assign({}, v, { plateNo: '', actualDeliveryDate: '', deliverer: '' });
								});
								return Object.assign({}, c, { enabled: false, vehicles: vehicles });
							});
							return next;
						});
					});
					message.success('已挂起');
				}
			});
		} else {
			activateRecord[1](record);
			activatePlanRange[1](null);
			activateBillingDate[1](null);
			activateModalOpen[1](true);
		}
	}

	function handleActivateConfirm() {
		var record = activateRecord[0];
		var planRange = activatePlanRange[0];
		var billingDate = activateBillingDate[0];
		if (!record) { activateModalOpen[1](false); return; }
		var toDateStr = function (d) { return d && typeof d.format === 'function' ? d.format('YYYY-MM-DD') : (d && typeof d === 'string' ? d : ''); };
		var planStr = planRange && planRange.length >= 1 && planRange[0]
			? (planRange.length >= 2 && planRange[1] ? toDateStr(planRange[0]) + '至' + toDateStr(planRange[1]) : toDateStr(planRange[0]))
			: '';
		var billingStr = billingDate ? toDateStr(billingDate) : '';
		if (!planStr || !billingStr) { message.warning('请填写预计交车日期和开始计费日期'); return; }
		var parent = record._parentRecord;
		setMainList(function (prev) {
			return prev.map(function (p) {
				if (!parent || p.contractCode !== parent.contractCode) return p;
				var next = {};
				for (var k in p) next[k] = p[k];
				next.children = (p.children || []).map(function (c) {
					if (c.seq !== record.seq) return c;
					return Object.assign({}, c, { enabled: true, planDeliveryDisplay: planStr, billingStartDate: billingStr });
				});
				return next;
			});
		});
		activateModalOpen[1](false);
		activateRecord[1](null);
		message.success('已激活');
	}

	// 筛选后的主表
	var filteredMainList = useMemo(function () {
		var list = mainList.slice();
		var contractCode = filterContractCode[0];
		var projectName = filterProjectName[0];
		var customerName = filterCustomerName[0];
		var taskCodeKw = (filterDeliveryTaskCode[0] || '').trim().toLowerCase();

		if (contractCode) list = list.filter(function (r) { return r.contractCode === contractCode; });
		if (projectName) list = list.filter(function (r) { return r.projectName === projectName; });
		if (customerName) list = list.filter(function (r) { return r.customerName === customerName; });

		// 交车任务编码：支持模糊搜索（匹配完整编码：合同编码 + JCxxxx）
		if (taskCodeKw) {
			list = list.filter(function (r) {
				var children = r.children || [];
				return children.some(function (c) {
					var full = buildDeliveryTaskCode(r.contractCode, c.seq);
					return full.toLowerCase().indexOf(taskCodeKw) !== -1;
				});
			});
		}
		return list;
	}, [mainList, filterContractCode[0], filterProjectName[0], filterCustomerName[0], filterDeliveryTaskCode[0]]);

	// 主表 dataSource 去掉 children，避免 Table 误用 treeData 产生空白行
	var mainTableDataSource = useMemo(function () {
		return filteredMainList.map(function (r) {
			var o = {};
			for (var k in r) if (k !== 'children') o[k] = r[k];
			o._detailList = r.children || [];
			return o;
		});
	}, [filteredMainList]);

	var paginatedMain = useMemo(function () {
		var start = (currentPage - 1) * pageSize;
		return mainTableDataSource.slice(start, start + pageSize);
	}, [mainTableDataSource, currentPage, pageSize]);

	function renderDeliveryPopover(record) {
		var vehicles = record.vehicles || [];
		var parentCode = (record._parentRecord && record._parentRecord.contractCode) || '';
		var key = parentCode + '-' + (record.seq != null ? record.seq : '');

		var listStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
		var thStyle = { padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa', fontWeight: 600 };
		var tdStyle = { padding: '6px 10px', borderBottom: '1px solid #f0f0f0' };

		var content = vehicles.length === 0
			? React.createElement('div', { style: { padding: 8 } }, '—')
			: React.createElement('div', { style: { padding: 0, minWidth: 520 } },
				React.createElement('table', { style: listStyle },
					React.createElement('thead', null,
						React.createElement('tr', null,
							React.createElement('th', { style: thStyle }, '品牌'),
							React.createElement('th', { style: thStyle }, '型号'),
							React.createElement('th', { style: thStyle }, '车牌号'),
							React.createElement('th', { style: thStyle }, '实际交车日期'),
							React.createElement('th', { style: thStyle }, '交车人')
						)
					),
					React.createElement('tbody', null,
						vehicles.map(function (v, i) {
							return React.createElement('tr', { key: i },
								React.createElement('td', { style: tdStyle }, v.brand || '—'),
								React.createElement('td', { style: tdStyle }, v.model || '—'),
								React.createElement('td', { style: tdStyle }, v.plateNo || '—'),
								React.createElement('td', { style: tdStyle }, v.actualDeliveryDate || '—'),
								React.createElement('td', { style: tdStyle }, v.deliverer || '—')
							);
						})
					)
				)
			);

		var count = record.deliveryCount != null ? Number(record.deliveryCount) : 0;
		return React.createElement(Popover, {
			content: content,
			title: '车辆明细',
			trigger: 'click',
			open: deliveryPopoverOpen[0] === key,
			onOpenChange: function (open) { deliveryPopoverOpen[1](open ? key : null); }
		}, React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 } }, (isNaN(count) ? 0 : count) + '辆'));
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var cardStyle = { marginBottom: 16 };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };

	var expandColumnWidth = 48;

	var mainColumns = [
		{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 200, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 160, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 180, ellipsis: true, render: function (v) { return v || '—'; } },
		{ title: '业务部门', dataIndex: 'businessDept', key: 'businessDept', width: 110, render: function (v) { return v || '—'; } },
		{ title: '业务负责人', dataIndex: 'businessPerson', key: 'businessPerson', width: 110, render: function (v) { return v || '—'; } },
		{ title: '合同生效日期', dataIndex: 'contractEffectiveDate', key: 'contractEffectiveDate', width: 120, render: function (v) { return v || '—'; } },
		{ title: '合同结束日期', dataIndex: 'contractEndDate', key: 'contractEndDate', width: 120, render: function (v) { return v || '—'; } }
	];

	var subColumns = [
		{
			title: '交车任务编码',
			key: 'deliveryTaskCode',
			width: 260,
			ellipsis: true,
			render: function (_, record) {
				var p = record._parentRecord;
				return buildDeliveryTaskCode(p && p.contractCode, record.seq) || '—';
			}
		},
		{ title: '预计交车日期', dataIndex: 'planDeliveryDisplay', key: 'planDeliveryDisplay', width: 160, render: function (v) { return v || '—'; } },
		{ title: '交车数量', key: 'deliveryCount', width: 100, render: function (_, record) { return renderDeliveryPopover(record); } },
		{ title: '开始计费日期', dataIndex: 'billingStartDate', key: 'billingStartDate', width: 120, render: function (v) { return v || '—'; } },
		{ title: '是否需要退还车', dataIndex: 'needReturnCar', key: 'needReturnCar', width: 120, render: function (v) { return v || '—'; } },
		{ title: '创建人', dataIndex: 'creator', key: 'creator', width: 100, render: function (v) { return v || '—'; } },
		{ title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 110, render: function (v) { return v || '—'; } },
		{
			title: '操作',
			key: 'action',
			width: 200,
			fixed: 'right',
			render: function (_, record) {
				return React.createElement(Space, { size: 'small' },
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { goView(record); } }, '查看'),
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { goEdit(record); } }, '编辑'),
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { toggleEnable(record); } }, record.enabled ? '挂起' : '激活')
				);
			}
		}
	];

	function expandRowRender(record) {
		var rows = (record._detailList || []).map(function (r) {
			var o = {};
			for (var k in r) o[k] = r[k];
			o._parentRecord = record;
			return o;
		});

		return React.createElement('div', { style: { marginBottom: 0, paddingLeft: expandColumnWidth, boxSizing: 'border-box' } },
			React.createElement(Table, {
				rowKey: function (r) { return (record.contractCode || '') + '-' + (r.seq != null ? r.seq : Math.random()); },
				columns: subColumns,
				dataSource: rows,
				pagination: false,
				size: 'small',
				bordered: true,
				scroll: { x: 1400 }
			})
		);
	}

	return React.createElement('div', { style: layoutStyle },
		React.createElement('div', { style: { marginBottom: 16 } },
			React.createElement(Breadcrumb, { items: [{ title: '业务管理' }, { title: '交车任务' }] })
		),
		React.createElement(Card, { title: '筛选', style: cardStyle },
			React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', alignItems: 'start' } },
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '交车任务编码'),
					React.createElement(Input, {
						placeholder: '请输入交车任务编码，支持模糊搜索',
						allowClear: true,
						style: filterControlStyle,
						value: filterDeliveryTaskCode[0],
						onChange: function (e) { filterDeliveryTaskCode[1](e.target.value); }
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '合同编码'),
					React.createElement(Select, {
						placeholder: '请输入或选择合同编码，支持从输入框输入内容进行模糊搜索',
						allowClear: true,
						showSearch: true,
						style: filterControlStyle,
						value: filterContractCode[0],
						onChange: function (v) { filterContractCode[1](v); },
						options: filterOptions.contractCode,
						filterOption: selectFuzzy
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '项目名称'),
					React.createElement(Select, {
						placeholder: '请输入或选择项目名称，支持从输入框输入内容进行模糊搜索',
						allowClear: true,
						showSearch: true,
						style: filterControlStyle,
						value: filterProjectName[0],
						onChange: function (v) { filterProjectName[1](v); },
						options: filterOptions.projectName,
						filterOption: selectFuzzy
					})
				),
				React.createElement('div', { style: filterItemStyle },
					React.createElement('div', { style: filterLabelStyle }, '客户名称'),
					React.createElement(Select, {
						placeholder: '请输入或选择客户名称，支持从输入框输入内容进行模糊搜索',
						allowClear: true,
						showSearch: true,
						style: filterControlStyle,
						value: filterCustomerName[0],
						onChange: function (v) { filterCustomerName[1](v); },
						options: filterOptions.customerName,
						filterOption: selectFuzzy
					})
				)
			),
			React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
				React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询'),
				React.createElement(Button, { onClick: resetFilters }, '重置')
			)
		),
		React.createElement(Card, { title: '列表', style: cardStyle },
			React.createElement(Table, {
				rowKey: 'contractCode',
				columns: mainColumns,
				dataSource: paginatedMain,
				expandable: {
					expandedRowKeys: expandedRowKeys,
					onExpandedRowsChange: function (keys) { setExpandedRowKeys(keys && keys.length ? [keys[keys.length - 1]] : []); },
					expandedRowRender: expandRowRender,
					rowExpandable: function (record) { return record._detailList && record._detailList.length > 0; },
					columnWidth: expandColumnWidth
				},
				pagination: {
					current: currentPage,
					pageSize: pageSize,
					total: mainTableDataSource.length,
					showSizeChanger: true,
					showTotal: function (t) { return '共 ' + t + ' 条'; },
					pageSizeOptions: ['10', '20', '50', '100'],
					onChange: function (p, ps) { setCurrentPage(p); setPageSize(ps); },
					onShowSizeChange: function () { setCurrentPage(1); }
				},
				size: 'middle',
				bordered: true,
				scroll: { x: 1110 }
			})
		)
	);
};

// 【重要】必须使用 const Component 作为组件变量名
// 数字化资产ONEOS运管平台 - 业务管理 - 交车任务

const Component = function() {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Select = antd.Select;
	var Button = antd.Button;
	var Table = antd.Table;
	var Card = antd.Card;
	var Tabs = antd.Tabs;
	var DatePicker = antd.DatePicker;
	var Popover = antd.Popover;
	var Modal = antd.Modal;
	var message = antd.message;
	var App = antd.App;
	var RangePicker = DatePicker.RangePicker;

	// 筛选条件（表单输入）
	var _contractCode = useState(undefined);
	var _projectName = useState(undefined);
	var _customerName = useState(undefined);
	var _planDateRange = useState(null);
	var _creator = useState(undefined);
	// 已应用的筛选条件（点击查询后生效）
	var _applied = useState({
		contractCode: undefined,
		projectName: undefined,
		customerName: undefined,
		planDateRange: null,
		creator: undefined
	});

	// Tab：进行中 / 已完成
	var _activeTab = useState('ongoing');

	// 筛选展开（默认显示前 3 项，与车辆租赁合同一致）
	var _filterExpanded = useState(false);

	// 需求说明弹窗
	var _reqSpecOpen = useState(false);

	// 停用/启用：重新选择预计交车日期弹窗
	var _rescheduleModalVisible = useState(false);
	var _rescheduleTask = useState(null);
	var _rescheduleDateRange = useState(null);

	// 模拟选项（可模糊搜索）
	var contractOptions = [
		{ value: 'JXZL20260216YW101235A', label: 'JXZL20260216YW101235A' },
		{ value: 'JXZL20260216YW101236A', label: 'JXZL20260216YW101236A' },
		{ value: 'JXZL20260215YW101234A', label: 'JXZL20260215YW101234A' },
		{ value: 'SHZL20260210YW101200A', label: 'SHZL20260210YW101200A' }
	];
	var projectOptions = [
		{ value: 'p1', label: '嘉兴氢能运输项目' },
		{ value: 'p2', label: '上海物流租赁项目' },
		{ value: 'p3', label: '杭州城配租赁项目' }
	];
	var customerOptions = [
		{ value: 'c1', label: '嘉兴某某物流有限公司' },
		{ value: 'c2', label: '上海某某运输公司' },
		{ value: 'c3', label: '杭州某某租赁有限公司' }
	];
	var creatorOptions = [
		{ value: 'u1', label: '张经理' },
		{ value: 'u2', label: '李专员' },
		{ value: 'u3', label: '王专员' }
	];

	// 进行中列表数据（未完成交车单提交），用 state 以便停用/启用后刷新
	var _ongoingList = useState([
		{ id: 'o1', contractCode: 'JXZL20260216YW101235A', projectName: '嘉兴氢能运输项目', customerName: '嘉兴某某物流有限公司', deliveryCount: 2, deliveryRegion: '浙江省-嘉兴市', deliveryLocation: '嘉兴市南湖区科技大道1号', planDeliveryDisplay: '2026-03-01至2026-03-05', planDeliveryEnd: '2026-03-05', billingStartDate: '2026-03-01', creator: '张经理', createdAt: '2026-02-20', lastUpdater: '张经理', lastUpdatedAt: '2026-02-24', enabled: true },
		{ id: 'o2', contractCode: 'JXZL20260216YW101236A', projectName: '上海物流租赁项目', customerName: '上海某某运输公司', deliveryCount: 1, deliveryRegion: '上海市-上海市', deliveryLocation: '上海市浦东新区张江高科技园区', planDeliveryDisplay: '2026-03-10', planDeliveryEnd: '2026-03-10', billingStartDate: '-', creator: '李专员', createdAt: '2026-02-21', lastUpdater: '李专员', lastUpdatedAt: '2026-02-22', enabled: false },
		{ id: 'o3', contractCode: 'JXZL20260215YW101234A', projectName: '杭州城配租赁项目', customerName: '杭州某某租赁有限公司', deliveryCount: 3, deliveryRegion: '浙江省-杭州市', deliveryLocation: '杭州市余杭区未来科技城', planDeliveryDisplay: '2026-02-28至2026-03-02', planDeliveryEnd: '2026-03-02', billingStartDate: '2026-02-28', creator: '王专员', createdAt: '2026-02-18', lastUpdater: '王专员', lastUpdatedAt: '2026-02-25', enabled: true },
		{ id: 'o4', contractCode: 'JXZL20260101YW101200A', projectName: '嘉兴氢能运输项目', customerName: '嘉兴某某物流有限公司', deliveryCount: 1, deliveryRegion: '浙江省-嘉兴市', deliveryLocation: '嘉兴市秀洲区洪兴西路288号', planDeliveryDisplay: '2026-01-05至2026-01-10', planDeliveryEnd: '2026-01-10', billingStartDate: '-', creator: '张经理', createdAt: '2026-01-02', lastUpdater: '张经理', lastUpdatedAt: '2026-01-15', enabled: false },
		{ id: 'o5', contractCode: 'JXZL20260218YW101237A', projectName: '嘉兴氢能运输项目', customerName: '嘉兴某某物流有限公司', deliveryCount: 2, deliveryRegion: '浙江省-嘉兴市', deliveryLocation: '嘉兴市南湖区广益路与亚中路交叉口', planDeliveryDisplay: '2026-03-08至2026-03-12', planDeliveryEnd: '2026-03-12', billingStartDate: '-', creator: '张经理', createdAt: '2026-02-22', lastUpdater: '张经理', lastUpdatedAt: '2026-02-26', enabled: true },
		{ id: 'o6', contractCode: 'SHZL20260210YW101201A', projectName: '上海物流租赁项目', customerName: '上海某某运输公司', deliveryCount: 1, deliveryRegion: '上海市-上海市', deliveryLocation: '上海市闵行区申滨路1051号', planDeliveryDisplay: '2026-03-15', planDeliveryEnd: '2026-03-15', billingStartDate: '-', creator: '李专员', createdAt: '2026-02-19', lastUpdater: '李专员', lastUpdatedAt: '2026-02-23', enabled: true },
		{ id: 'o7', contractCode: 'JXZL20260220YW101238A', projectName: '杭州城配租赁项目', customerName: '杭州某某租赁有限公司', deliveryCount: 4, deliveryRegion: '浙江省-杭州市', deliveryLocation: '杭州市萧山区市心北路与建设一路交叉口', planDeliveryDisplay: '2026-03-20至2026-03-25', planDeliveryEnd: '2026-03-25', billingStartDate: '-', creator: '王专员', createdAt: '2026-02-23', lastUpdater: '王专员', lastUpdatedAt: '2026-02-27', enabled: true },
		{ id: 'o8', contractCode: 'JXZL20260214YW101233A', projectName: '嘉兴氢能运输项目', customerName: '嘉兴某某物流有限公司', deliveryCount: 1, deliveryRegion: '浙江省-嘉兴市', deliveryLocation: '嘉兴市经开区昌盛路与文昌路交叉口', planDeliveryDisplay: '2026-03-05', planDeliveryEnd: '2026-03-05', billingStartDate: '-', creator: '张经理', createdAt: '2026-02-17', lastUpdater: '李专员', lastUpdatedAt: '2026-02-24', enabled: true },
		{ id: 'o9', contractCode: 'SHZL20260212YW101202A', projectName: '上海物流租赁项目', customerName: '上海某某运输公司', deliveryCount: 2, deliveryRegion: '上海市-上海市', deliveryLocation: '上海市嘉定区安亭镇墨玉南路与博园路交叉口', planDeliveryDisplay: '2026-03-18至2026-03-22', planDeliveryEnd: '2026-03-22', billingStartDate: '-', creator: '李专员', createdAt: '2026-02-24', lastUpdater: '李专员', lastUpdatedAt: '2026-02-28', enabled: true },
		{ id: 'o10', contractCode: 'JXZL20260222YW101239A', projectName: '杭州城配租赁项目', customerName: '杭州某某租赁有限公司', deliveryCount: 3, deliveryRegion: '浙江省-杭州市', deliveryLocation: '杭州市西湖区文三路与古翠路交叉口', planDeliveryDisplay: '2026-03-25至2026-03-30', planDeliveryEnd: '2026-03-30', billingStartDate: '-', creator: '王专员', createdAt: '2026-02-25', lastUpdater: '王专员', lastUpdatedAt: '2026-02-28', enabled: true }
	]);
	var ongoingList = _ongoingList[0];
	var setOngoingList = _ongoingList[1];

	// 已完成列表数据（已提交交车单），交车数量可点开气泡
	var completedList = [
		{ id: 'c1', contractCode: 'JXZL20260215YW101234A', projectName: '杭州城配租赁项目', customerName: '杭州某某租赁有限公司', deliveryCount: 2, deliveryRegion: '浙江省-杭州市', deliveryLocation: '杭州市余杭区未来科技城', vehicles: [{ vehicleType: '4.5吨冷链车-轻型厢式货车', brand: '品牌A', model: '型号A1', plateNo: '浙A10001', actualDeliveryDate: '2026-02-28', deliverer: '运维李' }, { vehicleType: '18吨厢式货车-重型厢式货车', brand: '品牌B', model: '型号B1', plateNo: '浙B20002', actualDeliveryDate: '2026-03-01', deliverer: '运维王' }], planDeliveryDisplay: '2026-02-28至2026-03-01', billingStartDate: '2026-02-28', creator: '王专员', createdAt: '2026-02-18', lastUpdater: '王专员', lastUpdatedAt: '2026-03-01' },
		{ id: 'c2', contractCode: 'SHZL20260210YW101200A', projectName: '上海物流租赁项目', customerName: '上海某某运输公司', deliveryCount: 1, deliveryRegion: '上海市-上海市', deliveryLocation: '上海市浦东新区张江高科技园区', vehicles: [{ vehicleType: '18吨厢式货车-重型厢式货车', brand: '品牌B', model: '型号B1', plateNo: '沪A30003', actualDeliveryDate: '2026-02-25', deliverer: '运维赵' }], planDeliveryDisplay: '2026-02-25', billingStartDate: '2026-02-25', creator: '李专员', createdAt: '2026-02-15', lastUpdater: '李专员', lastUpdatedAt: '2026-02-25' },
		{ id: 'c3', contractCode: 'JXZL20260208YW101231A', projectName: '嘉兴氢能运输项目', customerName: '嘉兴某某物流有限公司', deliveryCount: 2, deliveryRegion: '浙江省-嘉兴市', deliveryLocation: '嘉兴市南湖区科技大道1号', vehicles: [{ vehicleType: '4.5吨冷链车-轻型厢式货车', brand: '品牌A', model: '型号A1', plateNo: '浙A10002', actualDeliveryDate: '2026-02-20', deliverer: '运维李' }, { vehicleType: '18吨厢式货车-重型厢式货车', brand: '品牌B', model: '型号B1', plateNo: '浙A10003', actualDeliveryDate: '2026-02-21', deliverer: '运维王' }], planDeliveryDisplay: '2026-02-20至2026-02-21', billingStartDate: '2026-02-20', creator: '张经理', createdAt: '2026-02-10', lastUpdater: '张经理', lastUpdatedAt: '2026-02-21' },
		{ id: 'c4', contractCode: 'SHZL20260205YW101198A', projectName: '上海物流租赁项目', customerName: '上海某某运输公司', deliveryCount: 1, deliveryRegion: '上海市-上海市', deliveryLocation: '上海市闵行区申滨路1051号', vehicles: [{ vehicleType: '18吨厢式货车-重型厢式货车', brand: '品牌B', model: '型号B2', plateNo: '沪B40004', actualDeliveryDate: '2026-02-18', deliverer: '运维赵' }], planDeliveryDisplay: '2026-02-18', billingStartDate: '2026-02-18', creator: '李专员', createdAt: '2026-02-08', lastUpdater: '李专员', lastUpdatedAt: '2026-02-18' },
		{ id: 'c5', contractCode: 'JXZL20260212YW101232A', projectName: '杭州城配租赁项目', customerName: '杭州某某租赁有限公司', deliveryCount: 3, deliveryRegion: '浙江省-杭州市', deliveryLocation: '杭州市萧山区市心北路与建设一路交叉口', vehicles: [{ vehicleType: '4.5吨冷链车-轻型厢式货车', brand: '品牌A', model: '型号A2', plateNo: '浙C50001', actualDeliveryDate: '2026-02-22', deliverer: '运维李' }, { vehicleType: '18吨厢式货车-重型厢式货车', brand: '品牌B', model: '型号B1', plateNo: '浙C50002', actualDeliveryDate: '2026-02-23', deliverer: '运维王' }, { vehicleType: '4.5吨货车-轻型厢式货车', brand: '品牌C', model: '型号C1', plateNo: '浙C50003', actualDeliveryDate: '2026-02-24', deliverer: '运维赵' }], planDeliveryDisplay: '2026-02-22至2026-02-24', billingStartDate: '2026-02-22', creator: '王专员', createdAt: '2026-02-14', lastUpdater: '王专员', lastUpdatedAt: '2026-02-24' },
		{ id: 'c6', contractCode: 'JXZL20260201YW101228A', projectName: '嘉兴氢能运输项目', customerName: '嘉兴某某物流有限公司', deliveryCount: 1, deliveryRegion: '浙江省-嘉兴市', deliveryLocation: '嘉兴市秀洲区洪兴西路288号', vehicles: [{ vehicleType: '4.5吨冷链车-轻型厢式货车', brand: '品牌A', model: '型号A1', plateNo: '浙A10004', actualDeliveryDate: '2026-02-15', deliverer: '运维李' }], planDeliveryDisplay: '2026-02-15', billingStartDate: '2026-02-15', creator: '张经理', createdAt: '2026-02-05', lastUpdater: '张经理', lastUpdatedAt: '2026-02-15' },
		{ id: 'c7', contractCode: 'SHZL20260203YW101199A', projectName: '上海物流租赁项目', customerName: '上海某某运输公司', deliveryCount: 2, deliveryRegion: '上海市-上海市', deliveryLocation: '上海市嘉定区安亭镇墨玉南路与博园路交叉口', vehicles: [{ vehicleType: '18吨厢式货车-重型厢式货车', brand: '品牌B', model: '型号B1', plateNo: '沪A30005', actualDeliveryDate: '2026-02-16', deliverer: '运维赵' }, { vehicleType: '4.5吨冷链车-轻型厢式货车', brand: '品牌A', model: '型号A1', plateNo: '沪A30006', actualDeliveryDate: '2026-02-17', deliverer: '运维李' }], planDeliveryDisplay: '2026-02-16至2026-02-17', billingStartDate: '2026-02-16', creator: '李专员', createdAt: '2026-02-06', lastUpdater: '李专员', lastUpdatedAt: '2026-02-17' },
		{ id: 'c8', contractCode: 'JXZL20260128YW101227A', projectName: '杭州城配租赁项目', customerName: '杭州某某租赁有限公司', deliveryCount: 2, deliveryRegion: '浙江省-杭州市', deliveryLocation: '杭州市西湖区文三路与古翠路交叉口', vehicles: [{ vehicleType: '18吨厢式货车-重型厢式货车', brand: '品牌B', model: '型号B2', plateNo: '浙B20004', actualDeliveryDate: '2026-02-10', deliverer: '运维王' }, { vehicleType: '4.5吨货车-轻型厢式货车', brand: '品牌C', model: '型号C1', plateNo: '浙B20005', actualDeliveryDate: '2026-02-11', deliverer: '运维赵' }], planDeliveryDisplay: '2026-02-10至2026-02-11', billingStartDate: '2026-02-10', creator: '王专员', createdAt: '2026-01-30', lastUpdater: '王专员', lastUpdatedAt: '2026-02-11' },
		{ id: 'c9', contractCode: 'JXZL20260206YW101230A', projectName: '嘉兴氢能运输项目', customerName: '嘉兴某某物流有限公司', deliveryCount: 1, deliveryRegion: '浙江省-嘉兴市', deliveryLocation: '嘉兴市经开区昌盛路与文昌路交叉口', vehicles: [{ vehicleType: '4.5吨冷链车-轻型厢式货车', brand: '品牌A', model: '型号A2', plateNo: '浙A10005', actualDeliveryDate: '2026-02-19', deliverer: '运维李' }], planDeliveryDisplay: '2026-02-19', billingStartDate: '2026-02-19', creator: '张经理', createdAt: '2026-02-09', lastUpdater: '张经理', lastUpdatedAt: '2026-02-19' },
		{ id: 'c10', contractCode: 'SHZL20260215YW101203A', projectName: '上海物流租赁项目', customerName: '上海某某运输公司', deliveryCount: 2, deliveryRegion: '上海市-上海市', deliveryLocation: '上海市浦东新区金桥镇金海路1000号', vehicles: [{ vehicleType: '18吨厢式货车-重型厢式货车', brand: '品牌B', model: '型号B1', plateNo: '沪C60001', actualDeliveryDate: '2026-02-26', deliverer: '运维赵' }, { vehicleType: '4.5吨冷链车-轻型厢式货车', brand: '品牌A', model: '型号A1', plateNo: '沪C60002', actualDeliveryDate: '2026-02-27', deliverer: '运维李' }], planDeliveryDisplay: '2026-02-26至2026-02-27', billingStartDate: '2026-02-26', creator: '李专员', createdAt: '2026-02-18', lastUpdater: '李专员', lastUpdatedAt: '2026-02-27' }
	];

	var applied = _applied[0];
	var setApplied = _applied[1];

	var getProjectLabel = function(v) { var o = projectOptions.find(function(x) { return x.value === v; }); return o ? o.label : v; };
	var getCustomerLabel = function(v) { var o = customerOptions.find(function(x) { return x.value === v; }); return o ? o.label : v; };
	var getCreatorLabel = function(v) { var o = creatorOptions.find(function(x) { return x.value === v; }); return o ? o.label : v; };

	var filterOngoing = function(list) {
		var a = applied;
		if (a.contractCode) list = list.filter(function(r) { return r.contractCode === a.contractCode; });
		if (a.projectName) { var pl = getProjectLabel(a.projectName); if (pl) list = list.filter(function(r) { return r.projectName === pl; }); }
		if (a.customerName) { var cl = getCustomerLabel(a.customerName); if (cl) list = list.filter(function(r) { return r.customerName === cl; }); }
		if (a.creator) { var ul = getCreatorLabel(a.creator); if (ul) list = list.filter(function(r) { return r.creator === ul; }); }
		if (a.planDateRange && a.planDateRange.length === 2 && window.dayjs) {
			var start = window.dayjs(a.planDateRange[0]).startOf('day');
			var end = window.dayjs(a.planDateRange[1]).endOf('day');
			list = list.filter(function(r) {
				var d = r.planDeliveryEnd ? window.dayjs(r.planDeliveryEnd) : null;
				return d && !d.isBefore(start) && !d.isAfter(end);
			});
		}
		return list;
	};

	var filteredOngoing = useMemo(function() {
		return filterOngoing(ongoingList.slice());
	}, [ongoingList, applied.contractCode, applied.projectName, applied.customerName, applied.creator, applied.planDateRange]);

	var filteredCompleted = useMemo(function() {
		var list = completedList.slice();
		if (applied.contractCode) list = list.filter(function(r) { return r.contractCode === applied.contractCode; });
		if (applied.projectName) { var pl = getProjectLabel(applied.projectName); if (pl) list = list.filter(function(r) { return r.projectName === pl; }); }
		if (applied.customerName) { var cl = getCustomerLabel(applied.customerName); if (cl) list = list.filter(function(r) { return r.customerName === cl; }); }
		if (applied.creator) { var ul = getCreatorLabel(applied.creator); if (ul) list = list.filter(function(r) { return r.creator === ul; }); }
		if (applied.planDateRange && applied.planDateRange.length === 2 && window.dayjs) {
			var start = window.dayjs(applied.planDateRange[0]).startOf('day');
			var end = window.dayjs(applied.planDateRange[1]).endOf('day');
			list = list.filter(function(r) {
				var planEnd = r.planDeliveryDisplay && r.planDeliveryDisplay.indexOf('至') >= 0
					? r.planDeliveryDisplay.split('至')[1]
					: r.planDeliveryDisplay;
				var d = planEnd ? window.dayjs(planEnd) : null;
				return d && !d.isBefore(start) && !d.isAfter(end);
			});
		}
		return list;
	}, [applied.contractCode, applied.projectName, applied.customerName, applied.creator, applied.planDateRange]);

	var handleQuery = function() {
		setApplied({
			contractCode: _contractCode[0],
			projectName: _projectName[0],
			customerName: _customerName[0],
			planDateRange: _planDateRange[0] && _planDateRange[0].length === 2 ? _planDateRange[0] : null,
			creator: _creator[0]
		});
		message.info('已按筛选条件查询');
	};

	var handleReset = function() {
		_contractCode[1](undefined);
		_projectName[1](undefined);
		_customerName[1](undefined);
		_planDateRange[1](null);
		_creator[1](undefined);
		setApplied({
			contractCode: undefined,
			projectName: undefined,
			customerName: undefined,
			planDateRange: null,
			creator: undefined
		});
	};

	var handleDisableEnable = function(record) {
		if (record.enabled) {
			Modal.confirm({
				title: '是否确认停用该交车任务？',
				okText: '确定',
				cancelText: '取消',
				onOk: function() {
					setOngoingList(function(prev) {
						return prev.map(function(r) { return r.id === record.id ? Object.assign({}, r, { enabled: false }) : r; });
					});
					message.success('已停用');
				}
			});
			return;
		}
		// 启用：判断预计交车结束日期是否已过期
		var dayjs = window.dayjs;
		var endDate = record.planDeliveryEnd ? (dayjs ? dayjs(record.planDeliveryEnd) : null) : null;
		var now = dayjs ? dayjs() : null;
		if (endDate && now && endDate.isBefore(now, 'day')) {
			_rescheduleTask[1](record);
			_rescheduleDateRange[1](null);
			_rescheduleModalVisible[1](true);
			return;
		}
		Modal.confirm({
			title: '是否确认启用该交车任务？',
			okText: '确定',
			cancelText: '取消',
			onOk: function() {
				setOngoingList(function(prev) {
					return prev.map(function(r) { return r.id === record.id ? Object.assign({}, r, { enabled: true }) : r; });
				});
				message.success('已启用');
			}
		});
	};

	var handleRescheduleConfirm = function() {
		var task = _rescheduleTask[0];
		var range = _rescheduleDateRange[0];
		if (!task || !range || range.length !== 2) {
			message.warning('请选择预计交车日期（单日请选择同一天为开始和结束）');
			return;
		}
		var dayjs = window.dayjs;
		var startStr = dayjs ? dayjs(range[0]).format('YYYY-MM-DD') : String(range[0]);
		var endStr = dayjs ? dayjs(range[1]).format('YYYY-MM-DD') : String(range[1]);
		var planDisplay = startStr === endStr ? startStr : startStr + '至' + endStr;
		setOngoingList(function(prev) {
			return prev.map(function(r) {
				if (r.id !== task.id) return r;
				return Object.assign({}, r, { planDeliveryDisplay: planDisplay, planDeliveryEnd: endStr, enabled: true });
			});
		});
		message.success('已重新选择预计交车日期并启用');
		_rescheduleModalVisible[1](false);
		_rescheduleTask[1](null);
		_rescheduleDateRange[1](null);
	};

	// 进行中表格列
	var ongoingColumns = [
		{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 180, ellipsis: true, fixed: 'left' },
		{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 140, ellipsis: true, fixed: 'left' },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 160, ellipsis: true, fixed: 'left' },
		{ title: '交车数量', dataIndex: 'deliveryCount', key: 'deliveryCount', width: 100 },
		{ title: '交车区域', dataIndex: 'deliveryRegion', key: 'deliveryRegion', width: 140 },
		{ title: '交车地点', dataIndex: 'deliveryLocation', key: 'deliveryLocation', width: 200, ellipsis: true },
		{ title: '预计交车日期', dataIndex: 'planDeliveryDisplay', key: 'planDeliveryDisplay', width: 180 },
		{ title: '开始计费日期', dataIndex: 'billingStartDate', key: 'billingStartDate', width: 120 },
		{ title: '创建人', dataIndex: 'creator', key: 'creator', width: 100 },
		{ title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
		{ title: '最后更新人', dataIndex: 'lastUpdater', key: 'lastUpdater', width: 100 },
		{ title: '最后更新时间', dataIndex: 'lastUpdatedAt', key: 'lastUpdatedAt', width: 120 },
		{
			title: '操作',
			key: 'action',
			width: 180,
			fixed: 'right',
			render: function(_, record) {
				return React.createElement('span', null,
					React.createElement(Button, { type: 'link', size: 'small', onClick: function() { message.info('请参照原型业务管理-交车任务页面'); } }, '查看'),
					React.createElement(Button, { type: 'link', size: 'small', onClick: function() { message.info('请参照原型业务管理-交车任务-编辑交车任务页面'); } }, '编辑'),
					React.createElement(Button, {
						type: 'link',
						size: 'small',
						onClick: function() { handleDisableEnable(record); }
					}, record.enabled ? '停用' : '启用')
				);
			}
		}
	];

	// 已完成表格列（交车数量重点色+气泡）
	var vehiclePopoverContent = function(vehicles) {
		if (!vehicles || !vehicles.length) return React.createElement('span', null, '-');
		var headers = ['车辆类型', '品牌', '型号', '车牌号', '实际交车日期', '交车人'];
		return React.createElement('div', { style: { padding: 4, minWidth: 420 } },
			React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12 } },
				React.createElement('thead', null,
					React.createElement('tr', null,
						headers.map(function(h) { return React.createElement('th', { key: h, style: { padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 600 } }, h); })
					)
				),
				React.createElement('tbody', null,
					vehicles.map(function(v, i) {
						return React.createElement('tr', { key: i },
							React.createElement('td', { style: { padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, v.vehicleType || '-'),
							React.createElement('td', { style: { padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, v.brand || '-'),
							React.createElement('td', { style: { padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, v.model || '-'),
							React.createElement('td', { style: { padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, v.plateNo || '-'),
							React.createElement('td', { style: { padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, v.actualDeliveryDate || '-'),
							React.createElement('td', { style: { padding: '6px 8px', borderBottom: '1px solid #f0f0f0' } }, v.deliverer || '-')
						);
					})
				)
			)
		);
	};

	var completedColumns = [
		{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 180, ellipsis: true, fixed: 'left' },
		{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 140, ellipsis: true, fixed: 'left' },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 160, ellipsis: true, fixed: 'left' },
		{
			title: '交车数量',
			dataIndex: 'deliveryCount',
			key: 'deliveryCount',
			width: 100,
			render: function(count, record) {
				var content = vehiclePopoverContent(record.vehicles);
				return React.createElement(Popover, { content: content, title: '交车车辆明细', trigger: 'click' },
					React.createElement('span', { style: { color: '#1890ff', cursor: 'pointer', fontWeight: 500 } }, count)
				);
			}
		},
		{ title: '交车区域', dataIndex: 'deliveryRegion', key: 'deliveryRegion', width: 140 },
		{ title: '交车地点', dataIndex: 'deliveryLocation', key: 'deliveryLocation', width: 200, ellipsis: true },
		{ title: '预计交车日期', dataIndex: 'planDeliveryDisplay', key: 'planDeliveryDisplay', width: 180 },
		{ title: '开始计费日期', dataIndex: 'billingStartDate', key: 'billingStartDate', width: 120 },
		{ title: '创建人', dataIndex: 'creator', key: 'creator', width: 100 },
		{ title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
		{ title: '最后更新人', dataIndex: 'lastUpdater', key: 'lastUpdater', width: 100 },
		{ title: '最后更新时间', dataIndex: 'lastUpdatedAt', key: 'lastUpdatedAt', width: 120 },
		{
			title: '操作',
			key: 'action',
			width: 80,
			fixed: 'right',
			render: function(_, record) {
				return React.createElement(Button, { type: 'link', size: 'small', onClick: function() { message.info('请参照原型业务管理-交车任务页面'); } }, '查看');
			}
		}
	];

	var filterOption = function(input, option) {
		var label = (option && option.label) ? String(option.label) : '';
		return label.toLowerCase().indexOf((input || '').toLowerCase()) >= 0;
	};

	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };

	var filterItems = [
		React.createElement('div', { key: 'contractCode', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '合同编码'),
			React.createElement(Select, {
				placeholder: '请输入或选择合同编码',
				style: filterControlStyle,
				value: _contractCode[0],
				onChange: function(v) { _contractCode[1](v); },
				options: contractOptions,
				showSearch: true,
				allowClear: true,
				filterOption: filterOption
			})),
		React.createElement('div', { key: 'projectName', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '项目名称'),
			React.createElement(Select, {
				placeholder: '请输入或选择项目名称',
				style: filterControlStyle,
				value: _projectName[0],
				onChange: function(v) { _projectName[1](v); },
				options: projectOptions,
				showSearch: true,
				allowClear: true,
				filterOption: filterOption
			})),
		React.createElement('div', { key: 'customerName', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '客户名称'),
			React.createElement(Select, {
				placeholder: '请输入或选择客户名称',
				style: filterControlStyle,
				value: _customerName[0],
				onChange: function(v) { _customerName[1](v); },
				options: customerOptions,
				showSearch: true,
				allowClear: true,
				filterOption: filterOption
			})),
		React.createElement('div', { key: 'planDate', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '预计交车日期'),
			React.createElement(RangePicker, {
				style: filterControlStyle,
				placeholder: ['请选择预计交车开始时间', '请选择预计交车结束时间'],
				value: _planDateRange[0] && _planDateRange[0].length === 2 && window.dayjs ? [_planDateRange[0][0], _planDateRange[0][1]] : null,
				onChange: function(dates) { _planDateRange[1](dates && dates.length === 2 ? dates : null); }
			})),
		React.createElement('div', { key: 'creator', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '创建人'),
			React.createElement(Select, {
				placeholder: '请输入或选择创建人',
				style: filterControlStyle,
				value: _creator[0],
				onChange: function(v) { _creator[1](v); },
				options: creatorOptions,
				showSearch: true,
				allowClear: true,
				filterOption: filterOption
			}))
	];

	var filterCount = _filterExpanded[0] ? 5 : 3;
	var filterNodes = [];
	for (var i = 0; i < filterCount && i < filterItems.length; i++) {
		filterNodes.push(filterItems[i]);
	}

	// 表格单元格一行显示、根据内容适应宽度
	var cellNoWrap = function() { return { style: { whiteSpace: 'nowrap' } }; };
	var ongoingColumnsWithNowrap = ongoingColumns.map(function(col) { return Object.assign({}, col, { onCell: cellNoWrap }); });
	var completedColumnsWithNowrap = completedColumns.map(function(col) { return Object.assign({}, col, { onCell: cellNoWrap }); });

	var layoutStyle = { padding: '16px 24px 48px', backgroundColor: '#f5f5f5', minHeight: '100vh' };

	var reqTitleStyle = { fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'rgba(0,0,0,0.85)' };
	var reqSectionStyle = { fontSize: 15, fontWeight: 600, marginTop: 16, marginBottom: 8, color: 'rgba(0,0,0,0.85)' };
	var reqSubStyle = { fontSize: 14, fontWeight: 500, marginLeft: 16, marginTop: 8, marginBottom: 4, color: 'rgba(0,0,0,0.85)' };
	var reqItemStyle = { fontSize: 13, marginLeft: 32, marginTop: 4, marginBottom: 2, lineHeight: 1.6, color: 'rgba(0,0,0,0.75)' };
	var reqSubItemStyle = { fontSize: 13, marginLeft: 48, marginTop: 2, marginBottom: 2, lineHeight: 1.6, color: 'rgba(0,0,0,0.7)' };
	var reqBlockStyle = { marginBottom: 8 };

	var reqSpecContent = React.createElement('div', { style: { padding: '0 4px' } },
		React.createElement('div', { style: reqTitleStyle }, '交车任务'),
		React.createElement('div', { style: reqBlockStyle },
			React.createElement('div', { style: reqSectionStyle }, '1.面包屑：'),
			React.createElement('div', { style: reqSubStyle }, '1.1.业务管理-交车任务')
		),
		React.createElement('div', { style: reqBlockStyle },
			React.createElement('div', { style: reqSectionStyle }, '2.筛选：'),
			React.createElement('div', { style: reqItemStyle }, '支持通过合同编码、项目名称、客户名称、预计交车日期、创建人进行筛选，右侧为查询、重置按钮；'),
			React.createElement('div', { style: reqItemStyle }, '2.1.合同编码：选择器，默认为所有合同；提示信息为：请输入或选择合同编码，支持从输入框输入内容进行模糊搜索，下拉显示结果；'),
			React.createElement('div', { style: reqItemStyle }, '2.2.项目名称：选择器，默认为所有项目；提示信息为：请输入或选择项目名称，支持从输入框输入内容进行模糊搜索，下拉显示结果；'),
			React.createElement('div', { style: reqItemStyle }, '2.3.客户名称：选择器，默认为所有客户；提示信息为：请输入或选择客户名称，支持从输入框输入内容进行模糊搜索，下拉显示结果；'),
			React.createElement('div', { style: reqItemStyle }, '2.4.预计交车日期：日期选择器，默认提示信息为：请选择预计交车开始时间 请选择预计交车结束时间，单输入框，双日历，支持时间段选择，精确至天，格式为：YYYY-MM-DD - YYYY-MM-DD；'),
			React.createElement('div', { style: reqItemStyle }, '2.5.创建人：选择器，默认为所有创建人；提示信息为：请输入或选择创建人，支持从输入框输入内容进行模糊搜索，下拉显示结果；'),
			React.createElement('div', { style: reqItemStyle }, '2.6.查询：点击查询，根据单个或多个筛选条件（且）联动表格进行查询；'),
			React.createElement('div', { style: reqItemStyle }, '2.7.重置：点击清空查询条件至默认')
		),
		React.createElement('div', { style: reqBlockStyle },
			React.createElement('div', { style: reqSectionStyle }, '3.列表：分为2个tab：进行中、已完成，右侧为新增；'),
			React.createElement('div', { style: reqSubStyle }, '3.1进行中：显示所有已新增成功，但未完成交车单提交的任务；列表展示以下内容：合同编码、项目名称、客户名称、交车数量、预计交车日期、开始计费日期、创建人、创建时间、最后更新人、最后更新时间、操作；'),
			React.createElement('div', { style: reqItemStyle }, '3.1.1合同编码：显示对应合同编码；'),
			React.createElement('div', { style: reqItemStyle }, '3.1.2.项目名称：显示对应项目名称；'),
			React.createElement('div', { style: reqItemStyle }, '3.1.3.客户名称：显示对应客户名称；'),
			React.createElement('div', { style: reqItemStyle }, '3.1.4.交车数量：显示交车数；'),
			React.createElement('div', { style: reqItemStyle }, '3.1.5.交车区域：显示交车省-市；'),
			React.createElement('div', { style: reqItemStyle }, '3.1.6.交车地点：显示交车详细地址；'),
			React.createElement('div', { style: reqItemStyle }, '3.1.7.预计交车日期：显示预计交车日期，支持某天或某个时间段，格式为YYYY-MM-DD或YYYY-MM-DD至YYYY-MM-DD；'),
			React.createElement('div', { style: reqItemStyle }, '3.1.8.开始计费日期：显示开始计费日期，格式为YYYY-MM-DD，在交车单完成电子签章后开始生效；'),
			React.createElement('div', { style: reqItemStyle }, '3.1.9.创建人：显示交车任务的创建人用户姓名；'),
			React.createElement('div', { style: reqItemStyle }, '3.1.10.创建时间：显示交车任务的创建时间，格式为YYYY-MM-DD；'),
			React.createElement('div', { style: reqItemStyle }, '3.1.11.最后更新人：显示交车任务的最后一次更新人用户姓名；'),
			React.createElement('div', { style: reqItemStyle }, '3.1.12.最后更新时间：显示交车任务的最后一次更新时间，格式为YYYY-MM-DD；'),
			React.createElement('div', { style: reqItemStyle }, '3.1.13.操作：支持查看、编辑、停用/启用；'),
			React.createElement('div', { style: reqSubItemStyle }, '3.1.13.1.查看：跳转查看交车任务；'),
			React.createElement('div', { style: reqSubItemStyle }, '3.1.13.2.编辑：跳转编辑交车任务；'),
			React.createElement('div', { style: reqSubItemStyle }, '3.1.13.3.停用/启用：任务创建后为启用状态，此处为停用，点击停用后，变为启用。停用状态的交车任务不会推送给对应区域运维人员，重新启用时判断预计交车结束日期是否已经过期，如已过期则启用时需要在弹出卡片中重新选择预计交车日期；'),
			React.createElement('div', { style: reqSubStyle }, '3.2.已完成：显示所有已新增成功并完成交车单提交的任务，列表展示以下内容：合同编码、项目名称、客户名称、交车数量、预计交车日期、开始计费日期、创建人、创建时间、最后更新人、最后更新时间、操作；'),
			React.createElement('div', { style: reqItemStyle }, '3.2.1.合同编码：显示对应合同编码；'),
			React.createElement('div', { style: reqItemStyle }, '3.2.2.项目名称：显示对应项目名称；'),
			React.createElement('div', { style: reqItemStyle }, '3.2.3.客户名称：显示对应客户名称；'),
			React.createElement('div', { style: reqItemStyle }, '3.2.4.交车数量：显示交车数，重点色显示，点击弹出气泡卡片，列表显示：车辆类型、品牌、型号、车牌号、实际交车日期、交车人；'),
			React.createElement('div', { style: reqSubItemStyle }, '3.2.4.1.车辆类型：显示车辆类型；'),
			React.createElement('div', { style: reqSubItemStyle }, '3.2.4.2.品牌：显示车辆品牌；'),
			React.createElement('div', { style: reqSubItemStyle }, '3.2.4.3.型号：显示车辆型号；'),
			React.createElement('div', { style: reqSubItemStyle }, '3.2.4.4.车牌号：显示交车车辆车牌号，如果该车还未交车则显示为-；'),
			React.createElement('div', { style: reqSubItemStyle }, '3.2.4.5.实际交车日期：显示实际交车日期，与列表中显示相同，格式为YYYY-MM-DD，如该车还未交车则显示为-；'),
			React.createElement('div', { style: reqSubItemStyle }, '3.2.4.6.交车人：显示实际交车人用户姓名，如该车还未还车则显示为-；'),
			React.createElement('div', { style: reqItemStyle }, '3.2.5.预计交车日期：显示预计交车日期，支持某天或某个时间段，格式为YYYY-MM-DD或YYYY-MM-DD至YYYY-MM-DD；'),
			React.createElement('div', { style: reqItemStyle }, '3.2.6.开始计费日期：显示开始计费日期，格式为YYYY-MM-DD，在交车单完成电子签章后开始生效；'),
			React.createElement('div', { style: reqItemStyle }, '3.2.7.创建人：显示交车任务的创建人用户姓名；'),
			React.createElement('div', { style: reqItemStyle }, '3.2.8.创建时间：显示交车任务的创建时间，格式为YYYY-MM-DD；'),
			React.createElement('div', { style: reqItemStyle }, '3.2.9.最后更新人：显示交车任务的最后一次更新人用户姓名；'),
			React.createElement('div', { style: reqItemStyle }, '3.2.10.最后更新时间：显示交车任务的最后一次更新时间，格式为YYYY-MM-DD；'),
			React.createElement('div', { style: reqItemStyle }, '3.2.11.操作：支持查看；')
		),
		React.createElement('div', { style: reqBlockStyle },
			React.createElement('div', { style: reqSectionStyle }, '4.列表右下方为分页功能，支持单页显示条目选择；')
		)
	);

	return React.createElement(App, null,
		React.createElement('div', { style: layoutStyle },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
				React.createElement(Breadcrumb, {
					items: [
						{ title: '业务管理' },
						{ title: '交车任务' }
					]
				}),
				React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function() { _reqSpecOpen[1](true); } }, '查看需求说明')
			),
			React.createElement(Card, { style: { marginBottom: 16 } },
				React.createElement('div', {
					style: {
						display: 'grid',
						gridTemplateColumns: '1fr 1fr 1fr',
						gap: '16px 24px',
						alignItems: 'start',
						flex: 1,
						minWidth: 0
					}
				}, filterNodes),
				React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
					React.createElement(Button, { onClick: handleReset }, '重置'),
					React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询'),
					React.createElement(Button, { type: 'link', size: 'small', onClick: function() { _filterExpanded[1](!_filterExpanded[0]); } }, _filterExpanded[0] ? '收起' : '展开')
				)
			),
			React.createElement(Card, null,
				React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
					React.createElement(Tabs, {
						activeKey: _activeTab[0],
						onChange: function(k) { _activeTab[1](k); },
						items: [
							{ key: 'ongoing', label: '进行中' },
							{ key: 'completed', label: '已完成' }
						]
					}),
					React.createElement(Button, { type: 'primary', onClick: function() { message.info('请参照原型业务管理-交车任务-新增交车任务页面'); } }, '新增')
				),
				_activeTab[0] === 'ongoing'
					? React.createElement(Table, {
						rowKey: 'id',
						columns: ongoingColumnsWithNowrap,
						dataSource: filteredOngoing,
						scroll: { x: 1860 },
						size: 'small',
						pagination: {
							showSizeChanger: true,
							showTotal: function(t) { return '共 ' + t + ' 条'; },
							pageSizeOptions: ['10', '20', '50', '100']
						}
					})
					: React.createElement(Table, {
						rowKey: 'id',
						columns: completedColumnsWithNowrap,
						dataSource: filteredCompleted,
						scroll: { x: 1860 },
						size: 'small',
						pagination: {
							showSizeChanger: true,
							showTotal: function(t) { return '共 ' + t + ' 条'; },
							pageSizeOptions: ['10', '20', '50', '100']
						}
					})
			),
			React.createElement(Modal, {
				title: '需求说明',
				open: _reqSpecOpen[0],
				onCancel: function() { _reqSpecOpen[1](false); },
				width: 720,
				footer: React.createElement(Button, { onClick: function() { _reqSpecOpen[1](false); } }, '关闭'),
				bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
			}, reqSpecContent),
			React.createElement(Modal, {
				title: '预计交车日期已过期，请重新选择预计交车日期',
				open: _rescheduleModalVisible[0],
				onCancel: function() {
					_rescheduleModalVisible[1](false);
					_rescheduleTask[1](null);
					_rescheduleDateRange[1](null);
				},
				onOk: handleRescheduleConfirm,
				okText: '确定',
				cancelText: '取消'
			}, React.createElement('div', { style: { padding: '8px 0' } },
				React.createElement('div', { style: { marginBottom: 8, color: '#666', fontSize: 13 } }, '支持选择单日或开始-结束时间段，单日时开始与结束选同一天即可。'),
				React.createElement('span', { style: { marginRight: 8 } }, '预计交车日期：'),
				React.createElement(RangePicker, {
					placeholder: ['请选择开始日期', '请选择结束日期（单日请选同一天）'],
					value: _rescheduleDateRange[0] && _rescheduleDateRange[0].length === 2 && window.dayjs ? [_rescheduleDateRange[0][0], _rescheduleDateRange[0][1]] : null,
					onChange: function(dates) { _rescheduleDateRange[1](dates && dates.length === 2 ? dates : null); }
				})
			))
		)
	);
};
*/
