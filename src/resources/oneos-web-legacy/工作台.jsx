// 【重要】必须使用 const Component 作为组件变量名
// 数字化资产 ONEOS 运管平台 - 工作台（参照原型布局 + Dashboard 风格）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var App = antd.App;
	var Row = antd.Row;
	var Col = antd.Col;
	var Card = antd.Card;
	var Statistic = antd.Statistic;
	var Tabs = antd.Tabs;
	var Badge = antd.Badge;
	var Breadcrumb = antd.Breadcrumb;
	var Button = antd.Button;
	var Dropdown = antd.Dropdown;
	var Space = antd.Space;
	var Modal = antd.Modal;
	var Popover = antd.Popover;
	var Table = antd.Table;
	var Select = antd.Select;
	var DatePicker = antd.DatePicker;
	var Tag = antd.Tag;
	var Typography = antd.Typography;
	var message = antd.message;
	var Tooltip = antd.Tooltip;
	var Input = antd.Input;
	var Checkbox = antd.Checkbox;

	var Text = Typography.Text;
	var Title = Typography.Title;
	var RangePicker = DatePicker.RangePicker;

	var pageBg = '#f5f7fa';
	var cardRadius = 12;
	var cardShadow = '0 1px 2px rgba(0,0,0,0.04), 0 6px 16px rgba(15,23,42,0.06)';
	var cardStyle = { borderRadius: cardRadius, boxShadow: cardShadow, border: '1px solid rgba(0,0,0,0.05)' };
	var pagePadY = 16;
	var pagePadX = 20;
	var layoutGutter = 16;
	var accentBlue = '#1677ff';
	var accentPurple = '#722ed1';
	var accentCyan = '#13c2c2';
	var accentOrange = '#fa8c16';
	var accentGeekblue = '#2f54eb';

	// 工作台卡片内待办 / 通知默认展示条数
	var wbDashPreviewMax = 5;
	var wbChartHeight = 168;
	var wbBarTrackH = 72;
	var wbBarWrapH = 96;

	function protoNav(hint) {
		message.info('跳转「' + hint + '」（原型，联调配置路由）');
	}

	function formatWorkbenchFinanceYuan(amount) {
		if (amount == null || typeof amount !== 'number' || isNaN(amount)) return '—';
		return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' 元';
	}

	function formatNoticeNow() {
		var d = new Date();
		var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
		return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
	}

	// 原型：管理员催办后写入操作员「通知中心」；联调时管理员姓名取当前登录用户
	var mockAdminDisplayName = '张明';
	// 原型用例：工作台问候展示名；联调时替换为当前登录用户姓名（如 JWT / 用户信息里的 displayName）
	var mockOperatorDisplayName = '陈思远';

	var noticeModalState = useState(false);
	var noticeModalOpen = noticeModalState[0];
	var setNoticeModalOpen = noticeModalState[1];

	var reportTabState = useState('task');
	var reportTab = reportTabState[0];
	var setReportTab = reportTabState[1];

	var roleTabState = useState('ops');
	var roleTab = roleTabState[0];
	var setRoleTab = roleTabState[1];

	var todoMoreModalState = useState(false);
	var todoMoreModalOpen = todoMoreModalState[0];
	var setTodoMoreModalOpen = todoMoreModalState[1];

	var overdueDeliveryModalState = useState(false);
	var overdueDeliveryModalOpen = overdueDeliveryModalState[0];
	var setOverdueDeliveryModalOpen = overdueDeliveryModalState[1];

	var overdueReturnModalState = useState(false);
	var overdueReturnModalOpen = overdueReturnModalState[0];
	var setOverdueReturnModalOpen = overdueReturnModalState[1];

	var inspectModalState = useState(false);
	var inspectModalOpen = inspectModalState[0];
	var setInspectModalOpen = inspectModalState[1];

	var genDeliveryPickOpenState = useState(false);
	var genDeliveryPickOpen = genDeliveryPickOpenState[0];
	var setGenDeliveryPickOpen = genDeliveryPickOpenState[1];
	var genDeliveryConfigOpenState = useState(false);
	var genDeliveryConfigOpen = genDeliveryConfigOpenState[0];
	var setGenDeliveryConfigOpen = genDeliveryConfigOpenState[1];
	var genDeliveryCustomerState = useState('');
	var genDeliveryCustomer = genDeliveryCustomerState[0];
	var setGenDeliveryCustomer = genDeliveryCustomerState[1];
	var genDeliveryProjectIdState = useState(undefined);
	var genDeliveryProjectId = genDeliveryProjectIdState[0];
	var setGenDeliveryProjectId = genDeliveryProjectIdState[1];
	var genDeliveryExpectedState = useState(null);
	var genDeliveryExpected = genDeliveryExpectedState[0];
	var setGenDeliveryExpected = genDeliveryExpectedState[1];
	var genDeliveryBillingState = useState(null);
	var genDeliveryBilling = genDeliveryBillingState[0];
	var setGenDeliveryBilling = genDeliveryBillingState[1];
	var genDeliverySelectedKeysState = useState([]);
	var genDeliverySelectedKeys = genDeliverySelectedKeysState[0];
	var setGenDeliverySelectedKeys = genDeliverySelectedKeysState[1];

	var genReturnPickOpenState = useState(false);
	var genReturnPickOpen = genReturnPickOpenState[0];
	var setGenReturnPickOpen = genReturnPickOpenState[1];
	var genReturnConfigOpenState = useState(false);
	var genReturnConfigOpen = genReturnConfigOpenState[0];
	var setGenReturnConfigOpen = genReturnConfigOpenState[1];
	var genReturnCustomerState = useState('');
	var genReturnCustomer = genReturnCustomerState[0];
	var setGenReturnCustomer = genReturnCustomerState[1];
	var genReturnProjectIdState = useState(undefined);
	var genReturnProjectId = genReturnProjectIdState[0];
	var setGenReturnProjectId = genReturnProjectIdState[1];
	var genReturnDateState = useState(null);
	var genReturnDate = genReturnDateState[0];
	var setGenReturnDate = genReturnDateState[1];
	var genReturnSelectedKeysState = useState([]);
	var genReturnSelectedKeys = genReturnSelectedKeysState[0];
	var setGenReturnSelectedKeys = genReturnSelectedKeysState[1];

	// 业管-能源部 · 独立卡片「本日导入加氢明细条数」：0 条时卡片内显示提示文案（联调接接口）
	var energyH2ImportTodayState = useState(0);
	var energyH2ImportTodayCount = energyH2ImportTodayState[0];

	// 财务部 · 独立卡片「能源账户充值金额」：元，null 表示无充值记录示意（联调接接口）
	var financeEnergyRechargeYuanState = useState(null);
	var financeEnergyRechargeYuan = financeEnergyRechargeYuanState[0];

	var todoMoreTypeState = useState(undefined);
	var todoMoreTaskType = todoMoreTypeState[0];
	var setTodoMoreTaskType = todoMoreTypeState[1];

	var todoMoreDateStartState = useState('');
	var todoMoreDateStart = todoMoreDateStartState[0];
	var setTodoMoreDateStart = todoMoreDateStartState[1];

	var todoMoreDateEndState = useState('');
	var todoMoreDateEnd = todoMoreDateEndState[0];
	var setTodoMoreDateEnd = todoMoreDateEndState[1];

	var todoMoreStatusState = useState(undefined);
	var todoMoreStatus = todoMoreStatusState[0];
	var setTodoMoreStatus = todoMoreStatusState[1];

	var todoBoardFilterState = useState('all');
	var todoBoardFilter = todoBoardFilterState[0];
	var setTodoBoardFilter = todoBoardFilterState[1];

	var warningDeptState = useState('ops');
	var warningDeptKey = warningDeptState[0];
	var setWarningDeptKey = warningDeptState[1];

	// 顶部警告卡片：按部门切换（逻辑见需求脑图「警告卡片」，联调接接口）
	var warningDeptOrder = useMemo(function () {
		return [
			{ key: 'ops', label: '运维' },
			{ key: 'business', label: '业管' },
			{ key: 'energy', label: '业管-能源部' },
			{ key: 'safety', label: '安全部' },
			{ key: 'finance', label: '财务部' },
			{ key: 'public', label: '流程审批' }
		];
	}, []);

	var warningDeptTabItems = useMemo(function () {
		return warningDeptOrder.map(function (d) {
			return { key: d.key, label: d.label };
		});
	}, [warningDeptOrder]);

	var warningCardsByDept = useMemo(function () {
		var g1 = 'linear-gradient(135deg,#fff1f0,#ffccc7)';
		var g2 = 'linear-gradient(135deg,#fff7e6,#ffd591)';
		var g3 = 'linear-gradient(135deg,#f9f0ff,#efdbff)';
		var g4 = 'linear-gradient(135deg,#f0f5ff,#d6e4ff)';
		var g5 = 'linear-gradient(135deg,#e6fffb,#b5f5ec)';
		return {
			ops: [
				{ key: 'w_ops_delivery', title: '超期未交车', value: 5, iconBg: g1, icon: '交', color: '#f5222d' },
				{ key: 'w_ops_return_cnt', title: '超期未还车数量', value: 3, iconBg: g2, icon: '还', color: accentOrange },
				{ key: 'w_ops_inspect', title: '年审/等级评定', value: 2, iconBg: g3, icon: '审', color: accentPurple },
				{ key: 'w_ops_maint', title: '超期未保养', value: 7, iconBg: g4, icon: '保', color: accentGeekblue },
				{ key: 'w_ops_settle_om', title: '超期未核对还车应结款', value: 1, iconBg: g5, icon: '款', color: accentCyan }
			],
			business: [
				{ key: 'w_biz_lease', title: '超期未核对租赁账单', value: 4, iconBg: g3, icon: '租', color: accentPurple },
				{ key: 'w_biz_pickup', title: '超期未核对提车应收款', value: 2, iconBg: g4, icon: '提', color: accentGeekblue },
				{ key: 'w_biz_return_bs', title: '超期未核对还车应结款', value: 3, iconBg: g1, icon: '结', color: '#f5222d' },
				{ key: 'w_biz_h2', title: '超期未核对氢费账单', value: 1, iconBg: g5, icon: '氢', color: accentCyan }
			],
			energy: [
				{ key: 'w_en_h2order', title: '超期未核对加氢订单', value: 6, iconBg: g5, icon: '氢', color: accentCyan },
				{ key: 'w_en_h2_import_today', title: '本日导入加氢明细条数', value: 0, iconBg: g5, icon: '录', color: accentCyan },
				{ key: 'w_en_return', title: '超期未核对还车应结款', value: 2, iconBg: g1, icon: '结', color: '#f5222d' }
			],
			safety: [
				{ key: 'w_safe_return', title: '超期未核对还车应结款', value: 1, iconBg: g1, icon: '结', color: '#f5222d' }
			],
			finance: [
				{ key: 'w_fin_lease_od', title: '租赁账单超期未收到款', value: 3, iconBg: g3, icon: '租', color: accentPurple },
				{ key: 'w_fin_lease_part', title: '租赁账单未收全款', value: 2, iconBg: g2, icon: '全', color: accentOrange },
				{ key: 'w_fin_pickup_od', title: '提车应收款超期未收到款', value: 2, iconBg: g4, icon: '提', color: accentGeekblue },
				{ key: 'w_fin_pickup_part', title: '提车应收款未收全款', value: 1, iconBg: g2, icon: '款', color: accentOrange },
				{ key: 'w_fin_return_od', title: '还车应结款超期未收到款', value: 4, iconBg: g1, icon: '逾', color: '#f5222d' },
				{ key: 'w_fin_return_part', title: '还车应结款未收全款', value: 2, iconBg: g1, icon: '结', color: '#cf1322' },
				{ key: 'w_fin_h2_od', title: '氢费账单超期未收到款', value: 1, iconBg: g5, icon: '氢', color: accentCyan },
				{ key: 'w_fin_energy_recharge', title: '能源账户充值金额', value: 0, iconBg: g5, icon: '充', color: accentCyan },
				{ key: 'w_fin_h2_part', title: '氢费账单未收全款', value: 1, iconBg: g5, icon: '费', color: '#13c2c2' }
			],
			public: [
				{ key: 'w_pub_audit', title: '超期未审核', value: 9, iconBg: g4, icon: '审', color: accentGeekblue }
			]
		};
	}, []);

	var warningCardsVisible = useMemo(function () {
		return warningCardsByDept[warningDeptKey] || warningCardsByDept.ops;
	}, [warningCardsByDept, warningDeptKey]);

	// 顶部警告卡标题旁提示：脑图「警告卡片」末级说明原文（与 assets 脑图截图一致）
	var workbenchWarningMetricHintByKey = useMemo(function () {
		return {
			w_ops_delivery: '超过交车结束时间未交',
			w_ops_return_cnt: '合同过期车辆未还',
			w_ops_inspect: '30天内未处理',
			w_ops_maint: '超过保养项维护里程\n超过保养项维护时间',
			w_ops_settle_om: '还车应结款超过15天未完成运维部还车应结款提交',
			w_biz_lease: '租赁账单生成7天以上未完成费用明细填报',
			w_biz_pickup: '提车应收款生成7天以上未完成费用明细填报',
			w_biz_return_bs: '还车应结款生成15天以上未完成业务服务部还车应结款提交',
			w_biz_h2: '租赁合同氢费为月结算时，超过30天间隔未生成新氢费账单',
			w_en_h2order: '加氢记录形成后1天以上未核对',
			w_en_h2_import_today: '展示当日已导入的加氢明细条数；为0时表示今日尚未导入，请确认是否有加氢明细需要导入。',
			w_en_return: '还车应结款生成15天以上未完成能源采购部还车应结款提交',
			w_safe_return: '还车应结款生成15天以上未完成安全部还车应结款提交',
			w_fin_lease_od: '租赁账单审核后到财务部7天以上未收到款项',
			w_fin_lease_part: '租赁账单审核后到账金额 < 应收金额',
			w_fin_pickup_od: '提车应收款审核后到财务部7天以上未收到款项',
			w_fin_pickup_part: '提车应收款审核后到账金额 < 应收金额',
			w_fin_return_od: '还车应结款为正数时超期未收到款',
			w_fin_return_part: '还车应结款审核后到账金额 < 应收金额',
			w_fin_h2_od: '氢费账单审核后到财务部7天以上未收到款项',
			w_fin_energy_recharge: '展示能源账户已充值金额；无记录时请确认是否有能源账户充值记录。',
			w_fin_h2_part: '氢费账单审核后到账金额 < 应收金额',
			w_pub_audit: '流程在当前流程超过24小时以上未审核'
		};
	}, []);

	// 工作台-超期未交车弹窗：预计交车结束日早于当前日期的示意数据（联调接接口）
	var overdueDeliveryMockRows = useMemo(function () {
		var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
		var fmt = function (d) {
			return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
		};
		var base = new Date();
		base.setHours(12, 0, 0, 0);
		var addDays = function (days) {
			var x = new Date(base.getTime());
			x.setDate(x.getDate() + days);
			return x;
		};
		var d1 = addDays(-9);
		var d2s = addDays(-24);
		var d2e = addDays(-17);
		var d3 = addDays(-5);
		var d4s = addDays(-40);
		var d4e = addDays(-32);
		var d5 = addDays(-2);
		return [
			{ id: 'wb_od_1', expectedDate: fmt(d1), contractCode: 'HT-ZL-2026-011', projectName: '嘉兴氢能示范项目', customerName: '嘉兴某某物流有限公司', deliveryRegion: '浙江省-嘉兴市', deliveryAddress: '嘉兴市南湖区科技大道1号', deliveryCount: 2, vehicleList: [{ vehicleType: '厢式货车', brand: '东风', model: 'DFH1180', plateNo: '-', deliveryTime: '-', deliveryPerson: '-' }, { vehicleType: '平板货车', brand: '福田', model: 'BJ1180', plateNo: '-', deliveryTime: '-', deliveryPerson: '-' }], createTime: fmt(addDays(-28)) + ' 09:00', createBy: '系统', lastModifyTime: fmt(addDays(-11)) + ' 14:30', lastModifyBy: '李四', assignedDeliveryPerson: '张三' },
			{ id: 'wb_od_2', expectedDate: fmt(d2s) + ' 至 ' + fmt(d2e), contractCode: 'HT-ZL-2026-012', projectName: '上海物流租赁项目', customerName: '上海某某运输公司', deliveryRegion: '上海市-上海市', deliveryAddress: '浦东新区张江高科技园区', deliveryCount: 1, vehicleList: [{ vehicleType: '厢式货车', brand: '江淮', model: 'HFC1180', plateNo: '-', deliveryTime: '-', deliveryPerson: '-' }], createTime: fmt(addDays(-30)) + ' 10:30', createBy: '王五', lastModifyTime: fmt(addDays(-20)) + ' 11:00', lastModifyBy: '王五', assignedDeliveryPerson: '李四' },
			{ id: 'wb_od_3', expectedDate: fmt(d3), contractCode: 'HT-ZL-2026-013', projectName: '杭州城配租赁项目', customerName: '杭州某某租赁有限公司', deliveryRegion: '浙江省-杭州市', deliveryAddress: '余杭区未来科技城', deliveryCount: 3, vehicleList: [{ vehicleType: '栏板货车', brand: '重汽', model: 'ZZ1180', plateNo: '-', deliveryTime: '-', deliveryPerson: '-' }, { vehicleType: '厢式货车', brand: '东风', model: 'DFH1190', plateNo: '-', deliveryTime: '-', deliveryPerson: '-' }, { vehicleType: '平板货车', brand: '福田', model: 'BJ1190', plateNo: '-', deliveryTime: '-', deliveryPerson: '-' }], createTime: fmt(addDays(-26)) + ' 14:00', createBy: '李四', lastModifyTime: fmt(addDays(-6)) + ' 09:15', lastModifyBy: '王五', assignedDeliveryPerson: '张三' },
			{ id: 'wb_od_4', expectedDate: fmt(d4s) + ' 至 ' + fmt(d4e), contractCode: 'HT-ZL-2026-014', projectName: '嘉兴氢能示范项目', customerName: '嘉兴某某物流有限公司', deliveryRegion: '浙江省-嘉兴市', deliveryAddress: '嘉兴市秀洲区洪兴西路288号', deliveryCount: 1, vehicleList: [{ vehicleType: '厢式货车', brand: '重汽', model: 'ZZ1160', plateNo: '-', deliveryTime: '-', deliveryPerson: '-' }], createTime: fmt(addDays(-45)) + ' 08:15', createBy: '张三', lastModifyTime: fmt(addDays(-33)) + ' 16:40', lastModifyBy: '张三', assignedDeliveryPerson: '李四' },
			{ id: 'wb_od_5', expectedDate: fmt(d5), contractCode: 'HT-ZL-2026-015', projectName: '上海物流租赁项目', customerName: '上海某某运输公司', deliveryRegion: '上海市-上海市', deliveryAddress: '闵行区莘庄工业区申富路669号', deliveryCount: 2, vehicleList: [{ vehicleType: '平板货车', brand: '福田', model: 'BJ1180', plateNo: '-', deliveryTime: '-', deliveryPerson: '-' }, { vehicleType: '栏板货车', brand: '东风', model: 'DFH1160', plateNo: '-', deliveryTime: '-', deliveryPerson: '-' }], createTime: fmt(addDays(-18)) + ' 11:20', createBy: '王五', lastModifyTime: fmt(addDays(-3)) + ' 10:05', lastModifyBy: '王五', assignedDeliveryPerson: '王五' }
		];
	}, []);

	var openOverdueDeliveryModal = useCallback(function () {
		setOverdueDeliveryModalOpen(true);
	}, []);

	// 工作台-超期未还车：与还车管理-待处理列表字段一致的示意数据（联调接接口）
	var overdueReturnMockRows = useMemo(function () {
		var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
		var fmtD = function (d) {
			return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
		};
		var fmtDt = function (d, hh, mm) {
			return fmtD(d) + ' ' + pad(hh) + ':' + pad(mm);
		};
		var base = new Date();
		base.setHours(12, 0, 0, 0);
		var addDays = function (days) {
			var x = new Date(base.getTime());
			x.setDate(x.getDate() + days);
			return x;
		};
		var a = addDays(-52);
		var b = addDays(-38);
		var c = addDays(-25);
		return [
			{ id: 'wb_or_1', deliveryTime: fmtDt(a, 9, 30), deliveryPerson: '张三', plateNo: '京A12345', vehicleType: '重型厢式货车', brand: '东风', model: 'DFH1180', vin: 'LGHXCAE28M1234567', contractCode: 'HT-ZL-2026-001', customerName: '嘉兴某某物流有限公司', projectName: '嘉兴氢能示范项目', dept: '华东业务部', bizOwner: '李经理', vehicleArrived: false },
			{ id: 'wb_or_2', deliveryTime: fmtDt(b, 14, 0), deliveryPerson: '李四', plateNo: '沪B20001', vehicleType: '厢式货车', brand: '福田', model: 'BJ1180', vin: 'LGHXCAE28M7654321', contractCode: 'HT-ZL-2026-002', customerName: '上海某某运输公司', projectName: '上海物流租赁项目', dept: '华东业务部', bizOwner: '王经理', vehicleArrived: true },
			{ id: 'wb_or_3', deliveryTime: fmtDt(c, 10, 15), deliveryPerson: '王五', plateNo: '浙A88888', vehicleType: '轻型厢式货车', brand: '江淮', model: 'HFC1180', vin: 'LGHXCAE28M8888888', contractCode: 'HT-ZL-2026-003', customerName: '杭州某某租赁有限公司', projectName: '杭州城配租赁项目', dept: '浙江业务部', bizOwner: '赵经理', vehicleArrived: false }
		];
	}, []);

	var openOverdueReturnModal = useCallback(function () {
		setOverdueReturnModalOpen(true);
	}, []);

	// 工作台-年审/等级评定：根据提供的列表要求展示示意数据
	var inspectMockRows = useMemo(function () {
		var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
		var fmtD = function (d) {
			return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
		};
		var base = new Date();
		base.setHours(12, 0, 0, 0);
		var addDays = function (days) {
			var x = new Date(base.getTime());
			x.setDate(x.getDate() + days);
			return x;
		};
		return [
			{ id: 'wb_insp_1', plateNo: '沪A12345', vehicleType: '重型厢式货车', brand: '东风', model: 'DFH1180', nextDate: fmtD(addDays(2)), remainDays: 2 },
			{ id: 'wb_insp_2', plateNo: '苏B88888', vehicleType: '厢式货车', brand: '福田', model: 'BJ1180', nextDate: fmtD(addDays(5)), remainDays: 5 },
			{ id: 'wb_insp_3', plateNo: '浙C66666', vehicleType: '轻型厢式货车', brand: '江淮', model: 'HFC1180', nextDate: fmtD(addDays(-1)), remainDays: -1 }
		];
	}, []);

	// 待办任务表（原型：任务类型、任务名称、状态、任务时间、操作）
	var dashboardTodoRows = useMemo(function () {
		return [
			{ id: '1', taskType: '交车', taskName: '顺通运输租赁苏龙18T（交车数：5）', genDate: '2026-03-26 20:08', path: 'web端/运维管理/车辆业务/交车管理.jsx', status: 'pending' },
			{ id: '2', taskType: '异动', taskName: '异动任务-魏山（异动车数：9）', genDate: '2026-03-27 12:26', path: 'web端/运维管理/车辆业务/异动管理-结束异动.jsx', status: 'overdue' },
			{ id: '3', taskType: '年审', taskName: '年审任务（沪A62261F）', genDate: '2026-03-27 16:32', path: 'web端/运维管理/车辆业务/异动管理.jsx', status: 'pending' },
			{ id: '4', taskType: '租赁账单', taskName: '御盛合-租赁苏龙18T（账单编号xxxxxxx）', genDate: '2026-03-28 00:00', path: 'web端/业务管理/租赁账单.jsx', status: 'pending' },
			{ id: '5', taskType: '还车应结款', taskName: '云通-租赁帕力安18T（粤AGP3649）', genDate: '2026-03-28 11:53', path: '/prototypes/vehicle-pickup-receivable', status: 'pending' }
		];
	}, []);

	var todoSummary = useMemo(function () {
		var p = 0, o = 0;
		dashboardTodoRows.forEach(function (r) {
			if (r.status === 'pending') p++;
			else if (r.status === 'overdue') o++;
		});
		return { pending: p, overdue: o };
	}, [dashboardTodoRows]);

	var dashboardTodoBoardRows = useMemo(function () {
		var rows = dashboardTodoRows.filter(function (r) {
			if (todoBoardFilter === 'all') return true;
			return r.status === todoBoardFilter;
		});
		rows.sort(function (a, b) {
			return String(b.genDate || '').localeCompare(String(a.genDate || ''));
		});
		return rows;
	}, [dashboardTodoRows, todoBoardFilter]);

	var dashboardTodoBoardPreviewRows = useMemo(function () {
		return dashboardTodoBoardRows.slice(0, wbDashPreviewMax);
	}, [dashboardTodoBoardRows]);

	// 全部待办弹窗：任务类型下拉展示业务全量类型（与示意数据并集，联调可改为接口枚举）
	var todoMoreTaskTypeFilterOptions = useMemo(function () {
		var catalog = [
			'交车', '调拨', '异动', '年审', '保险', '租赁账单', '审批中心', '还车应结款',
			'还车', '备车', '提车应收', '替换车', '违章', '事故', '充电', 'ETC', '能源账户', '氢费', '电费'
		];
		var seen = {};
		catalog.forEach(function (t) { seen[t] = true; });
		dashboardTodoRows.forEach(function (r) {
			if (r.taskType) seen[r.taskType] = true;
		});
		return Object.keys(seen).sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); }).map(function (t) {
			return { value: t, label: t };
		});
	}, [dashboardTodoRows]);

	var todoMoreStatusFilterOptions = useMemo(function () {
		return [
			{ value: 'pending', label: '待处理' },
			{ value: 'overdue', label: '已超时' },
			{ value: 'done', label: '已完成' }
		];
	}, []);

	var noticeListState = useState(function () {
		return [
			{ id: 'n1', time: '2026-02-27 08:00', type: '商业险到期提醒', content: '「粤A12345」商业险将在2026-04-15到期，请尽快处理', read: false },
			{ id: 'n2', time: '2026-02-26 18:00', type: '营运证到期提醒', content: '「粤B88888」营运证还有90天到期，请尽快更新营运证', read: false },
			{ id: 'n3', time: '2026-02-26 10:00', type: '行驶证到期提醒', content: '「浙A11111」行驶证还有90天到期，请尽快进行年审', read: false },
			{ id: 'n4', time: '2026-02-25 14:00', type: '租赁合同到期提醒', content: '「HT-2025-088」「某某产业园项目」还有30天到期，请尽快处理', read: false },
			{ id: 'n5', time: '2026-02-25 09:00', type: '租赁账单生成提醒', content: '「HT-2025-088」「某某产业园项目」「ZD-202602-031」已生成，请尽快处理', read: false },
			{ id: 'n6', time: '2026-02-24 11:00', type: '氢费余额不足提醒', content: '「某某物流」「华南干线项目」氢费余额已不足500元，请尽快通知客户处理', read: false },
			{ id: 'n7', time: '2026-02-24 08:30', type: '审批流程提醒', content: '「李四」「异动审核」审批节点已到达，请进行审批', read: false }
		];
	});
	var noticeList = noticeListState[0];
	var setNoticeList = noticeListState[1];

	var noticeNewCount = useMemo(function () {
		var n = 0;
		(noticeList || []).forEach(function (it) {
			if (!it.read) n++;
		});
		return n;
	}, [noticeList]);

	var markNoticeRead = useCallback(function (id) {
		setNoticeList(function (prev) {
			return (prev || []).map(function (n) {
				if (n.id !== id) return n;
				if (n.read) return n;
				return Object.assign({}, n, { read: true });
			});
		});
	}, []);

	var openNoticeModal = useCallback(function () {
		setNoticeModalOpen(true);
	}, []);

	var pushUrgeNotice = useCallback(function (taskRow) {
		var adminName = mockAdminDisplayName;
		var content = '（' + adminName + '）已对（' + taskRow.taskName + '）进行催办，请尽快处理';
		setNoticeList(function (prev) {
			return [{ id: 'urge-' + Date.now(), time: formatNoticeNow(), type: '催办提醒', content: content, read: false }].concat(prev || []);
		});
		message.success('催办提醒已推送至通知列表');
	}, []);

	var vehicleMonthBars = useMemo(function () {
		return [
			{ m: '3月', op: 62, idle: 18 }, { m: '4月', op: 65, idle: 16 }, { m: '5月', op: 68, idle: 15 },
			{ m: '6月', op: 70, idle: 14 }, { m: '7月', op: 72, idle: 13 }, { m: '8月', op: 75, idle: 12 },
			{ m: '9月', op: 78, idle: 12 }, { m: '10月', op: 80, idle: 11 }, { m: '11月', op: 82, idle: 11 },
			{ m: '12月', op: 85, idle: 10 }, { m: '1月', op: 88, idle: 10 }, { m: '2月', op: 90, idle: 9 }
		];
	}, []);

	var contractMonthBars = useMemo(function () {
		return [
			{ m: '3月', lease: 8, self: 3, renew: 2 }, { m: '4月', lease: 9, self: 3, renew: 2 }, { m: '5月', lease: 10, self: 4, renew: 3 },
			{ m: '6月', lease: 10, self: 4, renew: 3 }, { m: '7月', lease: 11, self: 4, renew: 4 }, { m: '8月', lease: 12, self: 5, renew: 3 },
			{ m: '9月', lease: 12, self: 5, renew: 4 }, { m: '10月', lease: 13, self: 5, renew: 5 }, { m: '11月', lease: 14, self: 6, renew: 4 },
			{ m: '12月', lease: 14, self: 6, renew: 5 }, { m: '1月', lease: 15, self: 6, renew: 5 }, { m: '2月', lease: 16, self: 7, renew: 6 }
		];
	}, []);

	// 任务处理情况：横轴员工、纵轴任务数（示意，联调接接口）
	var taskEmployeeBars = useMemo(function () {
		return [
			{ m: '陈思远', done: 18, overdue: 2 },
			{ m: '张明', done: 22, overdue: 1 },
			{ m: '李小琳', done: 15, overdue: 4 },
			{ m: '王强', done: 9, overdue: 3 },
			{ m: '赵敏', done: 24, overdue: 0 },
			{ m: '周杰', done: 11, overdue: 5 }
		];
	}, []);

	// 合同到账：应收 / 已收（元，示意；联调接接口）
	var contractPaymentDonut = useMemo(function () {
		return { receivable: 128500000, received: 94200000 };
	}, []);

	function renderBarGroup(items, k1, k2, c1, c2, labelMinWidth) {
		var max = 1;
		items.forEach(function (it) { max = Math.max(max, it[k1] + it[k2]); });
		var colMinW = labelMinWidth != null ? labelMinWidth : 28;
		return React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 5, height: wbBarWrapH, paddingTop: 8, overflowX: 'auto' } },
			items.map(function (it) {
				var h1 = Math.round((it[k1] / max) * 100);
				var h2 = Math.round((it[k2] / max) * 100);
				return React.createElement('div', { key: it.m, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: colMinW } },
					React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 3, height: wbBarTrackH } },
						React.createElement('div', { style: { width: 10, height: Math.max(h1, 4), background: c1, borderRadius: 3 } }),
						React.createElement('div', { style: { width: 10, height: Math.max(h2, 4), background: c2, borderRadius: 3 } })
					),
					React.createElement('span', { style: { fontSize: 11, color: 'rgba(0,0,0,0.45)', marginTop: 6, textAlign: 'center', maxWidth: colMinW + 24, wordBreak: 'break-all', lineHeight: 1.2 } }, it.m)
				);
			})
		);
	}

	// 合同情况：每月三组柱 — 租赁 / 自营 / 续签（数量）；纵轴刻度按全局最大单柱值
	function renderBarGroupTriple(items, k1, k2, k3, c1, c2, c3, labelMinWidth) {
		var max = 1;
		items.forEach(function (it) {
			max = Math.max(max, it[k1] || 0, it[k2] || 0, it[k3] || 0);
		});
		var colMinW = labelMinWidth != null ? labelMinWidth : 40;
		var barW = 8;
		return React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 6, height: wbBarWrapH, paddingTop: 8, overflowX: 'auto' } },
			items.map(function (it) {
				var h1 = Math.round(((it[k1] || 0) / max) * 100);
				var h2 = Math.round(((it[k2] || 0) / max) * 100);
				var h3 = Math.round(((it[k3] || 0) / max) * 100);
				return React.createElement('div', { key: it.m, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: colMinW } },
					React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 2, height: wbBarTrackH } },
						React.createElement('div', { style: { width: barW, height: Math.max(h1, (it[k1] || 0) > 0 ? 4 : 0), background: c1, borderRadius: 2 } }),
						React.createElement('div', { style: { width: barW, height: Math.max(h2, (it[k2] || 0) > 0 ? 4 : 0), background: c2, borderRadius: 2 } }),
						React.createElement('div', { style: { width: barW, height: Math.max(h3, (it[k3] || 0) > 0 ? 4 : 0), background: c3, borderRadius: 2 } })
					),
					React.createElement('span', { style: { fontSize: 11, color: 'rgba(0,0,0,0.45)', marginTop: 6, textAlign: 'center', maxWidth: colMinW + 20, wordBreak: 'break-all', lineHeight: 1.2 } }, it.m)
				);
			})
		);
	}

	// 任务处理情况：双柱在统计卡片内随 Tab 区域伸缩；含 Y/X 轴刻度与悬浮数据标签
	function renderTaskEmployeeBarChart(items, k1, k2, c1, c2, labelMinWidth) {
		var maxVal = 1;
		items.forEach(function (it) { maxVal = Math.max(maxVal, it[k1] + it[k2]); });
		var midVal = Math.max(0, Math.round(maxVal / 2));
		var colMinW = labelMinWidth != null ? labelMinWidth : 40;
		var axisMuted = '#707d8f';
		var axisLine = 'rgba(0,0,0,0.12)';

		function wrapColTooltip(it, rowKey, colNode) {
			var tipTitle = React.createElement('div', { style: { fontSize: 12, lineHeight: 1.6 } },
				React.createElement('div', { style: { fontWeight: 600, marginBottom: 4, color: 'rgba(0,0,0,0.88)' } }, it.m),
				React.createElement('div', { style: { color: c1 } }, '完成任务：' + it[k1]),
				React.createElement('div', { style: { color: c2 } }, '超时任务：' + it[k2])
			);
			if (Tooltip) {
				return React.createElement(Tooltip, { key: rowKey, title: tipTitle, placement: 'top', mouseEnterDelay: 0.05 }, colNode);
			}
			return React.cloneElement(colNode, { key: rowKey });
		}

		var barColumns = items.map(function (it) {
			var p1 = maxVal > 0 ? Math.round((it[k1] / maxVal) * 1000) / 10 : 0;
			var p2 = maxVal > 0 ? Math.round((it[k2] / maxVal) * 1000) / 10 : 0;
			var colInner = React.createElement('div', {
				style: {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					flex: '1 1 0',
					minWidth: colMinW,
					minHeight: 0,
					overflow: 'hidden',
					cursor: 'default'
				}
			},
				React.createElement('div', {
					className: 'workbench-task-bar-track',
					style: {
						flex: 1,
						width: '100%',
						minHeight: 48,
						display: 'flex',
						alignItems: 'flex-end',
						justifyContent: 'center',
						gap: 'clamp(2px, 6%, 8px)',
						boxSizing: 'border-box',
						padding: '4px 2px 0',
						position: 'relative',
						background: 'linear-gradient(to top, transparent 0%, transparent calc(50% - 0.5px), rgba(0,0,0,0.05) calc(50%), transparent calc(50% + 0.5px), transparent 100%)'
					}
				},
					React.createElement('div', {
						className: 'workbench-task-bar-pillar',
						style: {
							width: 'clamp(7px, 32%, 16px)',
							flex: '0 0 auto',
							height: it[k1] > 0 ? p1 + '%' : 0,
							minHeight: it[k1] > 0 ? 4 : 0,
							background: c1,
							borderRadius: 3,
							alignSelf: 'flex-end',
							transition: 'opacity .15s'
						}
					}),
					React.createElement('div', {
						className: 'workbench-task-bar-pillar',
						style: {
							width: 'clamp(7px, 32%, 16px)',
							flex: '0 0 auto',
							height: it[k2] > 0 ? p2 + '%' : 0,
							minHeight: it[k2] > 0 ? 4 : 0,
							background: c2,
							borderRadius: 3,
							alignSelf: 'flex-end',
							transition: 'opacity .15s'
						}
					})
				),
				React.createElement('span', {
					style: {
						flexShrink: 0,
						fontSize: 11,
						color: 'rgba(0,0,0,0.45)',
						marginTop: 6,
						textAlign: 'center',
						maxWidth: '100%',
						wordBreak: 'break-all',
						lineHeight: 1.2,
						paddingBottom: 2
					}
				}, it.m)
			);
			return wrapColTooltip(it, it.m, colInner);
		});

		return React.createElement('div', { className: 'workbench-task-chart-axes-wrap' },
			React.createElement('div', { className: 'workbench-task-chart-plot-row' },
				React.createElement('div', {
					className: 'workbench-task-y-title',
					style: {
						width: 22,
						flexShrink: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 11,
						color: axisMuted,
						fontWeight: 400,
						writingMode: 'vertical-rl',
						transform: 'rotate(180deg)',
						letterSpacing: 1,
						userSelect: 'none'
					}
				}, '任务数量'),
				React.createElement('div', {
					className: 'workbench-task-y-ticks',
					style: {
						width: 30,
						flexShrink: 0,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						alignItems: 'flex-end',
						padding: '6px 6px 6px 0',
						borderRight: '1px solid ' + axisLine,
						fontSize: 10,
						color: axisMuted,
						lineHeight: 1.2,
						boxSizing: 'border-box',
						userSelect: 'none'
					}
				},
					React.createElement('span', null, maxVal),
					React.createElement('span', null, midVal),
					React.createElement('span', null, '0')
				),
				React.createElement('div', {
					style: {
						flex: 1,
						minWidth: 0,
						display: 'flex',
						flexDirection: 'column',
						minHeight: 0
					}
				},
					React.createElement('div', { className: 'workbench-task-bar-chart' }, barColumns),
					React.createElement('div', {
						className: 'workbench-task-x-axis',
						style: {
							flexShrink: 0,
							borderTop: '1px solid ' + axisLine,
							textAlign: 'center',
							fontSize: 11,
							color: axisMuted,
							fontWeight: 400,
							paddingTop: 6,
							marginTop: 2,
							userSelect: 'none'
						}
					}, '员工')
				)
			)
		);
	}

	// 合同到账情况：环形图 — 全环面积对应应收款；分色为已收/未收；中心为已收款金额；扇区悬浮标签
	function formatContractMoneyBrief(n) {
		if (n == null || isNaN(n)) return '-';
		var v = Number(n);
		if (Math.abs(v) >= 100000000) return (v / 100000000).toFixed(2) + ' 亿元';
		if (Math.abs(v) >= 10000) {
			var w = v / 10000;
			var s = w % 1 === 0 ? w.toFixed(0) : w.toFixed(1);
			return s + ' 万元';
		}
		return v.toLocaleString('zh-CN') + ' 元';
	}

	function renderContractPaymentDonutChart(d) {
		var rec = Math.max(0, d.receivable || 0);
		var got = Math.max(0, Math.min(d.received || 0, rec));
		var pend = Math.max(0, rec - got);
		var ratio = rec > 0 ? got / rec : 0;
		var angleReceived = ratio * 360;
		var cReceived = '#1677ff';
		var cPending = '#d9d9d9';

		function donutSeg(cx, cy, r0, r1, a0, a1) {
			if (a1 - a0 < 0.04) return '';
			var rad = function (deg) { return (deg - 90) * Math.PI / 180; };
			var x1 = cx + r1 * Math.cos(rad(a0));
			var y1 = cy + r1 * Math.sin(rad(a0));
			var x2 = cx + r1 * Math.cos(rad(a1));
			var y2 = cy + r1 * Math.sin(rad(a1));
			var x3 = cx + r0 * Math.cos(rad(a1));
			var y3 = cy + r0 * Math.sin(rad(a1));
			var x4 = cx + r0 * Math.cos(rad(a0));
			var y4 = cy + r0 * Math.sin(rad(a0));
			var large = (a1 - a0) > 180 ? 1 : 0;
			return 'M' + x1 + ',' + y1 + ' A' + r1 + ',' + r1 + ' 0 ' + large + ' 1 ' + x2 + ',' + y2 + ' L' + x3 + ',' + y3 + ' A' + r0 + ',' + r0 + ' 0 ' + large + ' 0 ' + x4 + ',' + y4 + ' Z';
		}

		var cx = 100;
		var cy = 100;
		var r0 = 54;
		var r1 = 90;
		var pathReceived =
			angleReceived >= 359.95 ? donutSeg(cx, cy, r0, r1, 0, 360) : (angleReceived > 0.08 ? donutSeg(cx, cy, r0, r1, 0, angleReceived) : '');
		var pathPending =
			angleReceived <= 0.05 ? donutSeg(cx, cy, r0, r1, 0, 360) : (angleReceived < 359.92 ? donutSeg(cx, cy, r0, r1, angleReceived, 360) : '');

		var pctGot = rec > 0 ? ((got / rec) * 100).toFixed(1) : '0';
		var pctPend = rec > 0 ? ((pend / rec) * 100).toFixed(1) : '0';

		var tipReceived = React.createElement('div', { style: { fontSize: 12, lineHeight: 1.65 } },
			React.createElement('div', { style: { fontWeight: 600 } }, '已收款'),
			React.createElement('div', null, '金额：' + formatContractMoneyBrief(got)),
			React.createElement('div', { style: { color: 'rgba(0,0,0,0.55)' } }, '占应收款：' + pctGot + '%')
		);
		var tipPending = React.createElement('div', { style: { fontSize: 12, lineHeight: 1.65 } },
			React.createElement('div', { style: { fontWeight: 600 } }, '未到账'),
			React.createElement('div', null, '金额：' + formatContractMoneyBrief(pend)),
			React.createElement('div', { style: { color: 'rgba(0,0,0,0.55)' } }, '占应收款：' + pctPend + '%')
		);

		var pathRecvEl = pathReceived
			? React.createElement('path', {
				d: pathReceived,
				fill: cReceived,
				stroke: '#fff',
				strokeWidth: 1.5,
				style: { cursor: 'pointer' }
			})
			: null;
		var pathPendEl = pathPending
			? React.createElement('path', {
				d: pathPending,
				fill: cPending,
				stroke: '#fff',
				strokeWidth: 1.5,
				style: { cursor: 'pointer' }
			})
			: null;

		if (Tooltip && pathRecvEl) {
			pathRecvEl = React.createElement(Tooltip, { title: tipReceived, placement: 'top', mouseEnterDelay: 0.05 }, pathRecvEl);
		}
		if (Tooltip && pathPendEl) {
			pathPendEl = React.createElement(Tooltip, { title: tipPending, placement: 'top', mouseEnterDelay: 0.05 }, pathPendEl);
		}

		return React.createElement('div', { className: 'workbench-payment-donut-hold' },
			React.createElement('div', {
				className: 'workbench-payment-donut-inner',
				style: {
					position: 'relative',
					width: 'min(280px, 78%)',
					maxWidth: 300,
					aspectRatio: '1',
					flexShrink: 0
				}
			},
				React.createElement('svg', {
					viewBox: '0 0 200 200',
					width: '100%',
					height: '100%',
					style: { display: 'block' }
				},
					React.createElement('g', null, pathPendEl, pathRecvEl)
				),
				React.createElement('div', {
					style: {
						position: 'absolute',
						left: 0,
						right: 0,
						top: 0,
						bottom: 0,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						pointerEvents: 'none',
						padding: '0 12%',
						textAlign: 'center'
					}
				},
					React.createElement('span', { style: { fontSize: 12, color: 'rgba(0,0,0,0.45)', lineHeight: 1.4 } }, '已收款金额'),
					React.createElement('span', { style: { fontSize: 20, fontWeight: 600, color: 'rgba(0,0,0,0.88)', lineHeight: 1.35, marginTop: 4 } }, formatContractMoneyBrief(got)),
					React.createElement('span', { style: { fontSize: 11, color: 'rgba(0,0,0,0.38)', marginTop: 6 } }, '应收款 ' + formatContractMoneyBrief(rec))
				)
			),
			React.createElement('div', {
				style: {
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'center',
					gap: '16px 24px',
					marginTop: 14,
					fontSize: 12,
					color: 'rgba(0,0,0,0.55)'
				}
			},
				React.createElement('span', null,
					React.createElement('span', { style: { display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: cReceived, marginRight: 6, verticalAlign: 'middle' } }),
					'已收款 ',
					React.createElement('span', { style: { color: 'rgba(0,0,0,0.75)', fontWeight: 500 } }, formatContractMoneyBrief(got))
				),
				React.createElement('span', null,
					React.createElement('span', { style: { display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: cPending, marginRight: 6, verticalAlign: 'middle' } }),
					'未到账 ',
					React.createElement('span', { style: { fontWeight: 500, color: 'rgba(0,0,0,0.75)' } }, formatContractMoneyBrief(pend))
				)
			)
		);
	}

	// 原型「图示」区：仿 Dashboard 面积图占位
	function renderChartPlaceholder(caption, chartH) {
		var h = chartH != null ? chartH : wbChartHeight;
		var svgH = Math.max(72, Math.round(h * 0.55));
		return React.createElement('div', {
			style: {
				position: 'relative',
				height: h,
				borderRadius: 8,
				overflow: 'hidden',
				background: 'linear-gradient(180deg, rgba(22,119,255,0.08) 0%, rgba(22,119,255,0.02) 45%, #fff 100%)',
				border: '1px solid rgba(0,0,0,0.06)'
			}
		},
			React.createElement('svg', { viewBox: '0 0 800 200', preserveAspectRatio: 'none', style: { position: 'absolute', left: 0, right: 0, bottom: 28, height: svgH, width: '100%' } },
				React.createElement('defs', null,
					React.createElement('linearGradient', { id: 'areaGrad', x1: '0', y1: '0', x2: '0', y2: '1' },
						React.createElement('stop', { offset: '0%', stopColor: '#1677ff', stopOpacity: 0.35 }),
						React.createElement('stop', { offset: '100%', stopColor: '#1677ff', stopOpacity: 0.02 })
					)
				),
				React.createElement('path', {
					fill: 'url(#areaGrad)',
					d: 'M0,140 Q120,100 200,120 T400,80 T600,95 T800,70 L800,200 L0,200 Z'
				}),
				React.createElement('path', {
					fill: 'none',
					stroke: '#1677ff',
					strokeWidth: 2.5,
					d: 'M0,140 Q120,100 200,120 T400,80 T600,95 T800,70'
				})
			),
			React.createElement('div', {
				style: {
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%,-50%)',
					fontSize: 14,
					color: 'rgba(0,0,0,0.25)',
					pointerEvents: 'none',
					fontWeight: 500
				}
			}, caption || '图示 · 联调接入图表')
		);
	}

	var deliveryTaskProjectList = useMemo(function () {
		return [
			{
				id: 'p1',
				name: '嘉兴某某物流氢能运输项目',
				contractCode: 'JXZL20260216YW101235A',
				customerName: '嘉兴某某物流有限公司',
				deliveryRegion: '浙江省 / 嘉兴市',
				deliveryLocation: '浙江省嘉兴市南湖区科技大道1号',
				vehicles: [
					{ key: 'v1', seq: 1, brand: '东风', model: '氢燃料电池重卡 H31', plateNo: '浙A10001', vin: 'LFV2BJCH8K3123456', monthRent: '12800', serviceFee: '800', deposit: '30000', remark: '首车', deliveryStatus: 'submitted' },
					{ key: 'v1c', seq: 1, brand: '东风', model: '氢燃料电池重卡 H31', plateNo: '浙A10000', vin: 'LFV2BJCH8K3000001', monthRent: '12800', serviceFee: '800', deposit: '30000', remark: '已交车样例', deliveryStatus: 'completed' },
					{ key: 'v2', seq: 2, brand: '东风', model: '氢燃料电池重卡 H31', plateNo: '浙A10002', vin: 'LFV2BJCH8K3123457', monthRent: '12800', serviceFee: '800', deposit: '30000', remark: '', deliveryStatus: 'submitted' },
					{ key: 'v3', seq: 3, brand: '福田', model: '智蓝氢能轻卡', plateNo: '', vin: 'LZYTBACR2M1234567', monthRent: '8500', serviceFee: '500', deposit: '20000', remark: '待上牌', deliveryStatus: 'none' },
					{ key: 'v4', seq: 4, brand: '重汽', model: '豪沃氢能牵引车', plateNo: '浙F20001', vin: 'ZZ4257N386FZ12345', monthRent: '15000', serviceFee: '1000', deposit: '35000', remark: '', deliveryStatus: 'none' },
					{ key: 'v5', seq: 5, brand: '陕汽', model: '德龙氢能自卸', plateNo: '浙F20002', vin: 'SX1313GR456123456', monthRent: '13200', serviceFee: '880', deposit: '32000', remark: '固定线路', deliveryStatus: 'none' }
				]
			},
			{
				id: 'p2',
				name: '上海某某运输氢能租赁项目',
				contractCode: 'SHZL20260201YW200123A',
				customerName: '上海某某运输公司',
				deliveryRegion: '上海市 / 上海市',
				deliveryLocation: '上海市浦东新区张江高科技园区',
				vehicles: [
					{ key: 'v7', seq: 2, brand: '宇通', model: '氢能公交 ZK6126', plateNo: '沪B40001', vin: 'LZYTAGCF8K4567890', monthRent: '22000', serviceFee: '1200', deposit: '50000', remark: '示范线路', deliveryStatus: 'none' },
					{ key: 'v8', seq: 3, brand: '福田', model: '欧辉氢能大巴', plateNo: '', vin: 'LZYTBACR2M2345678', monthRent: '19800', serviceFee: '1100', deposit: '45000', remark: '', deliveryStatus: 'none' }
				]
			},
			{
				id: 'p3',
				name: '杭州某某租赁氢能项目',
				contractCode: 'HZZL20260115YW100089A',
				customerName: '杭州某某租赁有限公司',
				deliveryRegion: '浙江省 / 杭州市',
				deliveryLocation: '浙江省杭州市余杭区未来科技城',
				vehicles: [
					{ key: 'v11', seq: 3, brand: '东风', model: '氢燃料电池厢货', plateNo: '浙A50001', vin: 'LFV2BJCH8K5678901', monthRent: '9200', serviceFee: '520', deposit: '22000', remark: '城配', deliveryStatus: 'none' },
					{ key: 'v12', seq: 4, brand: '开沃', model: '创源氢能轻卡', plateNo: '浙A50002', vin: 'LJXTBACR9N6789012', monthRent: '8800', serviceFee: '480', deposit: '21000', remark: '', deliveryStatus: 'none' }
				]
			}
		];
	}, []);

	function filterProjectsByCustomer(customerName) {
		var kw = String(customerName || '').trim().toLowerCase();
		if (!kw) return deliveryTaskProjectList;
		return deliveryTaskProjectList.filter(function (p) {
			return (p.customerName || '').toLowerCase().indexOf(kw) !== -1;
		});
	}

	var genDeliveryCustomerOptions = useMemo(function () {
		var seen = {};
		var options = [];
		deliveryTaskProjectList.forEach(function (p) {
			var name = p.customerName;
			if (name && !seen[name]) {
				seen[name] = true;
				options.push({ value: name, label: name });
			}
		});
		return options;
	}, [deliveryTaskProjectList]);

	var genDeliveryProjectOptions = useMemo(function () {
		if (!genDeliveryCustomer) return [];
		return deliveryTaskProjectList.filter(function (p) {
			return p.customerName === genDeliveryCustomer;
		}).map(function (p) {
			return { value: p.id, label: p.name };
		});
	}, [genDeliveryCustomer, deliveryTaskProjectList]);

	var genReturnProjectOptions = useMemo(function () {
		return filterProjectsByCustomer(genReturnCustomer).map(function (p) {
			return { value: p.id, label: p.name };
		});
	}, [genReturnCustomer, deliveryTaskProjectList]);

	var selectedGenDeliveryProject = useMemo(function () {
		return deliveryTaskProjectList.find(function (p) { return p.id === genDeliveryProjectId; }) || null;
	}, [genDeliveryProjectId, deliveryTaskProjectList]);

	var selectedGenReturnProject = useMemo(function () {
		return deliveryTaskProjectList.find(function (p) { return p.id === genReturnProjectId; }) || null;
	}, [genReturnProjectId, deliveryTaskProjectList]);

	var genDeliveryVehicleList = useMemo(function () {
		if (!selectedGenDeliveryProject) return [];
		return (selectedGenDeliveryProject.vehicles || []).filter(function (v) {
			return v.deliveryStatus !== 'completed';
		});
	}, [selectedGenDeliveryProject]);

	var genDeliverySelectableVehicles = useMemo(function () {
		return genDeliveryVehicleList.filter(function (v) {
			return v.deliveryStatus === 'none';
		});
	}, [genDeliveryVehicleList]);

	var genReturnVehicleList = useMemo(function () {
		if (!selectedGenReturnProject) return [];
		return (selectedGenReturnProject.vehicles || []).filter(function (v) {
			return v.plateNo && v.deliveryStatus === 'completed';
		});
	}, [selectedGenReturnProject]);

	var genReturnSelectableVehicles = genReturnVehicleList;

	var genDeliveryRowSelection = useMemo(function () {
		return {
			selectedRowKeys: genDeliverySelectedKeys,
			onChange: function (keys) { setGenDeliverySelectedKeys(keys); },
			getCheckboxProps: function (record) {
				var disabled = record.deliveryStatus !== 'none';
				return {
					disabled: disabled,
					title: disabled ? (record.deliveryStatus === 'submitted' ? '该车辆已创建交车任务' : '该车辆已完成交车') : undefined
				};
			},
			selections: [
				{
					key: 'all',
					text: '全选可选车辆',
					onSelect: function () {
						setGenDeliverySelectedKeys(genDeliverySelectableVehicles.map(function (v) { return v.key; }));
					}
				},
				{ key: 'none', text: '清空选择', onSelect: function () { setGenDeliverySelectedKeys([]); } }
			]
		};
	}, [genDeliverySelectedKeys, genDeliverySelectableVehicles]);

	var genReturnRowSelection = useMemo(function () {
		return {
			selectedRowKeys: genReturnSelectedKeys,
			onChange: function (keys) { setGenReturnSelectedKeys(keys); },
			selections: [
				{
					key: 'all',
					text: '全选',
					onSelect: function () {
						setGenReturnSelectedKeys(genReturnSelectableVehicles.map(function (v) { return v.key; }));
					}
				},
				{ key: 'none', text: '清空选择', onSelect: function () { setGenReturnSelectedKeys([]); } }
			]
		};
	}, [genReturnSelectedKeys, genReturnSelectableVehicles]);

	function renderGenTaskLabel(text, required) {
		return React.createElement('label', { className: 'workbench-gen-task-form-label' },
			required ? React.createElement('span', { className: 'req' }, '*') : null,
			text
		);
	}

	function resetGenDeliveryFlow() {
		setGenDeliveryCustomer('');
		setGenDeliveryProjectId(undefined);
		setGenDeliveryExpected(null);
		setGenDeliveryBilling(null);
		setGenDeliverySelectedKeys([]);
	}

	function resetGenReturnFlow() {
		setGenReturnCustomer('');
		setGenReturnProjectId(undefined);
		setGenReturnDate(null);
		setGenReturnSelectedKeys([]);
	}

	function openGenDeliveryPick() {
		resetGenDeliveryFlow();
		setGenDeliveryPickOpen(true);
	}

	function openGenReturnPick() {
		resetGenReturnFlow();
		setGenReturnPickOpen(true);
	}

	function handleGenDeliveryNext() {
		if (!genDeliveryCustomer) {
			message.warning('请选择客户名称');
			return;
		}
		if (!genDeliveryProjectId) {
			message.warning('请选择项目名称');
			return;
		}
		setGenDeliveryExpected(null);
		setGenDeliveryBilling(null);
		setGenDeliverySelectedKeys([]);
		setGenDeliveryPickOpen(false);
		setGenDeliveryConfigOpen(true);
	}

	function handleGenDeliveryConfirm() {
		if (!genDeliveryExpected || !genDeliveryExpected.length) {
			message.warning('请选择预计交车日期');
			return;
		}
		if (!genDeliveryBilling) {
			message.warning('请选择开始计费日期');
			return;
		}
		if (!genDeliverySelectedKeys.length) {
			message.warning('请至少勾选一辆车辆');
			return;
		}
		setGenDeliveryConfigOpen(false);
		resetGenDeliveryFlow();
		message.success('已生成交车任务（原型）');
	}

	function handleGenReturnNext() {
		if (!genReturnCustomer.trim()) {
			message.warning('请输入客户名称');
			return;
		}
		if (!genReturnProjectId) {
			message.warning('请选择项目名称');
			return;
		}
		setGenReturnDate(null);
		setGenReturnSelectedKeys([]);
		setGenReturnPickOpen(false);
		setGenReturnConfigOpen(true);
	}

	function handleGenReturnConfirm() {
		if (!genReturnDate) {
			message.warning('请选择预计还车日期');
			return;
		}
		if (!genReturnSelectedKeys.length) {
			message.warning('请至少勾选一辆车辆');
			return;
		}
		setGenReturnConfigOpen(false);
		resetGenReturnFlow();
		message.success('已生成还车任务（原型）');
	}

	function handleQuickItemClick(it) {
		if (it.action === 'genDelivery') {
			openGenDeliveryPick();
			return;
		}
		if (it.action === 'genReturn') {
			openGenReturnPick();
			return;
		}
		if (it.p) protoNav(it.p);
	}

	var genDeliveryVehicleColumns = useMemo(function () {
		return [
			{ title: '序号', dataIndex: 'seq', key: 'seq', width: 56 },
			{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 88 },
			{ title: '型号', dataIndex: 'model', key: 'model', width: 140, ellipsis: true },
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100, render: function (v) { return v || '—'; } },
			{ title: '车辆识别代码', dataIndex: 'vin', key: 'vin', width: 168, ellipsis: true },
			{ title: '月租金', dataIndex: 'monthRent', key: 'monthRent', width: 88, render: function (v) { return v ? v + ' 元' : '—'; } },
			{ title: '备注', dataIndex: 'remark', key: 'remark', width: 100, ellipsis: true, render: function (v) { return v || '—'; } }
		];
	}, []);

	var genReturnVehicleColumns = useMemo(function () {
		return [
			{ title: '序号', dataIndex: 'seq', key: 'seq', width: 56 },
			{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 88 },
			{ title: '型号', dataIndex: 'model', key: 'model', width: 140, ellipsis: true },
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100 },
			{ title: '车辆识别代码', dataIndex: 'vin', key: 'vin', width: 168, ellipsis: true }
		];
	}, []);

	var quickByRole = useMemo(function () {
		return {
			ye: {
				label: '业管',
				items: [
					{ t: '生成交车任务', action: 'genDelivery', accent: 'primary' },
					{ t: '生成还车任务', action: 'genReturn', accent: 'orange' },
					{ t: '租赁合同', p: 'web端/车辆租赁合同/车辆租赁合同.jsx' },
					{ t: '提车应收款', p: '/prototypes/vehicle-pickup-receivable' },
					{ t: '租赁账单', p: 'web端/业务管理/租赁账单.jsx' },
					{ t: '还车应结款', p: 'web端/财务管理/还车应结款.jsx' },
					{ t: '能源账户', p: 'web端/业务管理/能源账户.jsx' },
					{ t: '氢费账单', p: 'web端/财务管理/氢费账单.jsx' },
					{ t: '电费账单', p: 'web端/财务管理/电费账单.jsx' },
					{ t: 'ETC账单', p: 'web端/业务管理/ETC管理.jsx' },
					{ t: '保险采购', p: 'web端/业务管理/保险采购.jsx' },
					{ t: '审批中心', p: 'web端/审批中心.jsx' },
					{ t: '意见建议', p: 'web端/意见建议.jsx' }
				]
			},
			yeEnergy: {
				label: '业管-能源部',
				items: [
					{ t: '站点信息', p: 'web端/加氢站管理/站点信息.jsx' },
					{ t: '加氢订单管理', p: 'web端/加氢站管理/加氢订单.jsx' },
					{ t: '意见建议', p: 'web端/意见建议.jsx' }
				]
			},
			ops: {
				label: '运维',
				items: [
					{ t: '车辆管理', p: 'web端/车辆管理.jsx' },
					{ t: '证照管理', p: 'web端/运维管理/车辆业务/证照管理.jsx' },
					{ t: '证照管理-编辑', p: 'web端/运维管理/车辆业务/证照管理-编辑.jsx' },
					{ t: '备车管理', p: 'web端/运维管理/车辆业务/备车管理.jsx' },
					{ t: '交车管理', p: 'web端/运维管理/车辆业务/交车管理.jsx' },
					{ t: '还车管理', p: 'web端/运维管理/车辆业务/还车管理.jsx' },
					{ t: '替换车管理', p: 'web端/运维管理/车辆业务/替换车管理.jsx' },
					{ t: '调拨管理', p: 'web端/运维管理/车辆业务/调拨管理.jsx' },
					{ t: '异动管理', p: 'web端/运维管理/车辆业务/异动管理.jsx' },
					{ t: '备件库管理', p: 'web端/运维管理/备件管理/备件库存.jsx' },
					{ t: '意见建议', p: 'web端/意见建议.jsx' }
				]
			},
			finance: {
				label: '财务',
				items: [
					{ t: '提车应收款', p: '/prototypes/vehicle-pickup-receivable' },
					{ t: '租赁账单', p: 'web端/财务管理/租赁账单.jsx' },
					{ t: '还车应结款', p: 'web端/财务管理/还车应结款.jsx' },
					{ t: '审批中心', p: 'web端/审批中心.jsx' },
					{ t: '充值单管理', p: 'web端/财务管理/充值单管理.jsx' },
					{ t: '意见建议', p: 'web端/意见建议.jsx' }
				]
			},
			safety: {
				label: '安全',
				items: [
					{ t: '违章管理', p: 'web端/安全管理/违章管理.jsx' },
					{ t: '事故管理', p: 'web端/安全管理/事故管理.jsx' },
					{ t: '司机管理', p: 'web端/安全管理/司机管理.jsx' },
					{ t: '安全培训资料', p: 'web端/安全管理/安全培训资料.jsx' },
					{ t: '安全培训记录', p: 'web端/安全管理/安全培训记录.jsx' },
					{ t: '意见建议', p: 'web端/意见建议.jsx' }
				]
			},
			legal: {
				label: '法务',
				items: [
					{ t: '审批中心', p: 'web端/审批中心.jsx' },
					{ t: '意见建议', p: 'web端/意见建议.jsx' }
				]
			}
		};
	}, []);

	var noticeColumns = useMemo(function () {
		return [
			{ title: '时间', dataIndex: 'time', key: 'time', width: 150 },
			{ title: '通知类型', dataIndex: 'type', key: 'type', width: 160 },
			{ title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
			{
				title: '状态',
				key: 'read',
				width: 72,
				render: function (_, record) {
					return record.read
						? React.createElement(Tag, { color: 'default', style: { margin: 0, fontSize: 11, lineHeight: '18px' } }, '已读')
						: React.createElement(Tag, { color: 'warning', style: { margin: 0, fontSize: 11, lineHeight: '18px' } }, '未读');
				}
			},
			{
				title: '操作',
				key: 'markRead',
				width: 88,
				render: function (_, record) {
					if (record.read) {
						return React.createElement(Text, { type: 'secondary', style: { fontSize: 12 } }, '—');
					}
					return React.createElement(Button, {
						type: 'link',
						size: 'small',
						style: { padding: 0, height: 'auto' },
						onClick: function () { markNoticeRead(record.id); }
					}, '设为已读');
				}
			}
		];
	}, [markNoticeRead]);

	var overdueDeliveryPopoverTableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 12 };
	var overdueDeliveryPopoverThStyle = { padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa', fontWeight: 600 };
	var overdueDeliveryPopoverTdStyle = { padding: '6px 8px', borderBottom: '1px solid #f0f0f0' };

	function renderOverdueDeliveryQuantity(record) {
		var list = record.vehicleList || [];
		var content = React.createElement('div', { style: { padding: 8, minWidth: 420 } },
			React.createElement('div', { style: { marginBottom: 8, fontWeight: 600 } }, '车辆明细'),
			React.createElement('table', { style: overdueDeliveryPopoverTableStyle },
				React.createElement('thead', null,
					React.createElement('tr', null,
						React.createElement('th', { style: overdueDeliveryPopoverThStyle }, '车辆类型'),
						React.createElement('th', { style: overdueDeliveryPopoverThStyle }, '品牌'),
						React.createElement('th', { style: overdueDeliveryPopoverThStyle }, '型号'),
						React.createElement('th', { style: overdueDeliveryPopoverThStyle }, '车牌号'),
						React.createElement('th', { style: overdueDeliveryPopoverThStyle }, '交车时间'),
						React.createElement('th', { style: overdueDeliveryPopoverThStyle }, '交车人员')
					)
				),
				React.createElement('tbody', null,
					list.map(function (v, i) {
						return React.createElement('tr', { key: i },
							React.createElement('td', { style: overdueDeliveryPopoverTdStyle }, v.vehicleType || '-'),
							React.createElement('td', { style: overdueDeliveryPopoverTdStyle }, v.brand || '-'),
							React.createElement('td', { style: overdueDeliveryPopoverTdStyle }, v.model || '-'),
							React.createElement('td', { style: overdueDeliveryPopoverTdStyle }, v.plateNo || '-'),
							React.createElement('td', { style: overdueDeliveryPopoverTdStyle }, (v.deliveryTime && v.deliveryTime !== '-') ? v.deliveryTime : '-'),
							React.createElement('td', { style: overdueDeliveryPopoverTdStyle }, v.deliveryPerson || '-')
						);
					})
				)
			)
		);
		return React.createElement(Popover, { content: content, title: null },
			React.createElement('span', { style: { color: '#1677ff', cursor: 'pointer', fontWeight: 600 } }, record.deliveryCount + ' 辆')
		);
	}

	var overdueReturnModalColumns = [
		{ title: '交车时间', dataIndex: 'deliveryTime', key: 'deliveryTime', width: 160 },
		{ title: '交车人', dataIndex: 'deliveryPerson', key: 'deliveryPerson', width: 90 },
		{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100 },
		{ title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 120, ellipsis: true },
		{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 80 },
		{ title: '型号', dataIndex: 'model', key: 'model', width: 110, ellipsis: true },
		{ title: '车辆识别代码', dataIndex: 'vin', key: 'vin', width: 160, ellipsis: true },
		{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 130, ellipsis: true },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 160, ellipsis: true },
		{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 140, ellipsis: true },
		{ title: '业务部门', dataIndex: 'dept', key: 'dept', width: 110, ellipsis: true },
		{ title: '业务负责人', dataIndex: 'bizOwner', key: 'bizOwner', width: 100 },
		{
			title: '操作',
			key: 'action',
			width: 160,
			fixed: 'right',
			render: function (_, record) {
				return React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
					record.vehicleArrived
						? React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: function () { message.info('跳转还车管理-还车页（原型）'); } }, '还车')
						: React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: function () { message.info('确认车辆到达（原型，联调对接还车管理）'); } }, '车辆到达')
				);
			}
		}
	];

	var inspectModalColumns = [
		{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 120 },
		{ title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 140 },
		{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
		{ title: '型号', dataIndex: 'model', key: 'model', width: 120 },
		{ title: '下次检验/等评日期', dataIndex: 'nextDate', key: 'nextDate', width: 160 },
		{ title: '剩余天数', dataIndex: 'remainDays', key: 'remainDays', width: 120, render: function(v) {
			return React.createElement(Text, { type: v < 0 ? 'danger' : undefined }, v + ' 天');
		} },
		{
			title: '操作',
			key: 'action',
			width: 80,
			fixed: 'right',
			render: function (_, record) {
				return React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: function () { message.info('跳转年审详情（原型）'); } }, '年审');
			}
		}
	];

	var overdueDeliveryModalColumns = [
		{ title: '预计交车时间', dataIndex: 'expectedDate', key: 'expectedDate', width: 220, ellipsis: true },
		{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 150, ellipsis: true },
		{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 150, ellipsis: true },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 160, ellipsis: true },
		{ title: '交车区域', dataIndex: 'deliveryRegion', key: 'deliveryRegion', width: 120, ellipsis: true },
		{ title: '交车地点', dataIndex: 'deliveryAddress', key: 'deliveryAddress', width: 200, ellipsis: true },
		{ title: '交车数量', key: 'deliveryCount', width: 90, render: function (_, r) { return renderOverdueDeliveryQuantity(r); } },
		{ title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160, ellipsis: true },
		{ title: '创建人', dataIndex: 'createBy', key: 'createBy', width: 90, ellipsis: true },
		{ title: '最后修改时间', dataIndex: 'lastModifyTime', key: 'lastModifyTime', width: 160, ellipsis: true },
		{ title: '最后修改人', dataIndex: 'lastModifyBy', key: 'lastModifyBy', width: 90, ellipsis: true },
		{ title: '操作', key: 'action', width: 88, fixed: 'right', render: function () {
			return React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('跳转交车管理-交车单（原型）'); } }, '交车单');
		} }
	];

	function renderTodoStatusCell(_, r) {
		if (r.status === 'pending') return React.createElement(Tag, { color: 'processing' }, '待处理');
		if (r.status === 'overdue') return React.createElement(Tag, { color: 'error' }, '已超时');
		if (r.status === 'done') return React.createElement(Tag, { color: 'success' }, '已完成');
		return React.createElement(Tag, null, r.status);
	}

	function renderTodoStatChip(filterKey, labelText, count, pillBg, numColor) {
		var selected = todoBoardFilter === filterKey;
		return React.createElement('span', {
			role: 'button',
			tabIndex: 0,
			onClick: function () { setTodoBoardFilter(filterKey); },
			onKeyDown: function (e) {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					setTodoBoardFilter(filterKey);
				}
			},
			style: {
				display: 'inline-flex',
				alignItems: 'center',
				gap: 4,
				padding: '3px 10px',
				borderRadius: 6,
				fontSize: 12,
				cursor: 'pointer',
				background: pillBg,
				boxShadow: selected ? '0 0 0 2px ' + numColor : undefined,
				outline: 'none'
			}
		},
			React.createElement('span', { style: { color: 'rgba(0,0,0,0.5)' } }, labelText),
			React.createElement('span', { style: { fontWeight: 600, color: numColor } }, count)
		);
	}

	var todoTableColumns = useMemo(function () {
		return [
			{ title: '任务类型', dataIndex: 'taskType', key: 'taskType', width: 100 },
			{ title: '任务名称', dataIndex: 'taskName', key: 'taskName', ellipsis: true },
			{
				title: '状态',
				key: 'status',
				width: 88,
				render: renderTodoStatusCell
			},
			{
				title: '任务时间',
				dataIndex: 'genDate',
				key: 'genDate',
				width: 160,
				showSorterTooltip: false,
				defaultSortOrder: 'descend',
				sorter: function (a, b) {
					return String(a.genDate || '').localeCompare(String(b.genDate || ''));
				}
			},
			{
				title: '操作',
				key: 'op',
				width: 128,
				align: 'right',
				render: function (_, r) {
					var isDone = r.status === 'done';
					var urgeBtn = !isDone
						? React.createElement(Button, {
							type: 'link',
							size: 'small',
							style: { padding: 0 },
							onClick: function () { pushUrgeNotice(r); }
						}, '催办')
						: null;
					var primaryLabel = isDone ? '查看' : '处理';
					return React.createElement(Space, { size: 4 },
						React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: function () { protoNav(r.path); } }, primaryLabel),
						urgeBtn
					);
				}
			}
		];
	}, [pushUrgeNotice]);

	var todoMoreModalColumns = useMemo(function () {
		return [
			{ title: '任务类型', dataIndex: 'taskType', key: 'taskType', width: 100 },
			{ title: '任务名称', dataIndex: 'taskName', key: 'taskName', ellipsis: true },
			{
				title: '状态',
				key: 'status',
				width: 88,
				render: renderTodoStatusCell
			},
			{
				title: '任务时间',
				dataIndex: 'genDate',
				key: 'genDate',
				width: 160,
				showSorterTooltip: false,
				defaultSortOrder: 'descend',
				sorter: function (a, b) {
					return String(a.genDate || '').localeCompare(String(b.genDate || ''));
				}
			},
			{
				title: '操作',
				key: 'op',
				width: 128,
				align: 'right',
				render: function (_, r) {
					var isDone = r.status === 'done';
					var urgeBtn = !isDone
						? React.createElement(Button, {
							type: 'link',
							size: 'small',
							style: { padding: 0 },
							onClick: function () { pushUrgeNotice(r); }
						}, '催办')
						: null;
					var primaryLabel = isDone ? '查看' : '处理';
					return React.createElement(Space, { size: 4 },
						React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: function () { protoNav(r.path); } }, primaryLabel),
						urgeBtn
					);
				}
			}
		];
	}, [pushUrgeNotice]);

	var todoMoreFilteredRows = useMemo(function () {
		var rows = dashboardTodoRows.filter(function (r) {
			if (todoMoreTaskType && r.taskType !== todoMoreTaskType) return false;
			if (todoMoreStatus && r.status !== todoMoreStatus) return false;
			if (todoMoreDateStart && r.genDate < todoMoreDateStart) return false;
			if (todoMoreDateEnd && r.genDate > todoMoreDateEnd) return false;
			return true;
		});
		rows.sort(function (a, b) {
			return String(b.genDate || '').localeCompare(String(a.genDate || ''));
		});
		return rows;
	}, [dashboardTodoRows, todoMoreTaskType, todoMoreStatus, todoMoreDateStart, todoMoreDateEnd]);

	var openTodoMoreModal = useCallback(function () {
		setTodoMoreTaskType(undefined);
		setTodoMoreStatus(undefined);
		setTodoMoreDateStart('');
		setTodoMoreDateEnd('');
		setTodoMoreModalOpen(true);
	}, []);

	var todoMoreRangeValue = useMemo(function () {
		var ds = todoMoreDateStart;
		var de = todoMoreDateEnd;
		if (!ds && !de) return null;
		var dayjs = typeof window !== 'undefined' ? window.dayjs : null;
		var moment = typeof window !== 'undefined' ? window.moment : null;
		if (dayjs) {
			return [
				ds ? dayjs(ds, 'YYYY-MM-DD') : null,
				de ? dayjs(de, 'YYYY-MM-DD') : null
			];
		}
		if (moment) {
			return [
				ds ? moment(ds, 'YYYY-MM-DD') : null,
				de ? moment(de, 'YYYY-MM-DD') : null
			];
		}
		return null;
	}, [todoMoreDateStart, todoMoreDateEnd]);

	function renderWorkbenchMetricHintIcon(cardKey) {
		var hint = workbenchWarningMetricHintByKey[cardKey];
		if (!hint) return null;
		var titleNode = React.createElement('div', { style: { maxWidth: 368, lineHeight: 1.65, fontSize: 12, textAlign: 'left', whiteSpace: 'pre-line' } }, hint);
		var stopBubble = function (e) {
			if (e && e.stopPropagation) e.stopPropagation();
		};
		return React.createElement(Tooltip, {
			title: titleNode,
			placement: 'top',
			mouseEnterDelay: 0.08,
			destroyTooltipOnHide: true
		},
			React.createElement('span', {
				className: 'workbench-metric-hint-icon',
				role: 'img',
				'aria-label': '指标说明',
				tabIndex: 0,
				style: {
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					marginLeft: 2,
					cursor: 'help',
					color: 'rgba(0,0,0,0.4)',
					flexShrink: 0,
					verticalAlign: 'middle',
					lineHeight: 1
				},
				onClick: stopBubble,
				onMouseDown: stopBubble,
				onKeyDown: function (e) {
					if (e.key === 'Enter' || e.key === ' ') stopBubble(e);
				}
			},
				React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 1024 1024', fill: 'currentColor', 'aria-hidden': true },
					React.createElement('path', { d: 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z' }),
					React.createElement('path', { d: 'M464 336a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm72 112h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z' })
				)
			)
		);
	}

	function renderVehicleMetricCard(s) {
		var onClick = s.onClick;
		var mw = s.minWidth != null ? s.minWidth : 128;
		var trailing = s.trailing;
		var valueRow = s.valueRow;
		var minCardH = 84;
		if (trailing || valueRow) minCardH = 96;
		var cardStyleMerged = Object.assign({}, cardStyle, {
			flex: 1,
			minWidth: mw,
			minHeight: minCardH,
			display: 'flex',
			flexDirection: 'column',
			height: '100%'
		});
		if (onClick) {
			cardStyleMerged.cursor = 'pointer';
		}
		return React.createElement(Card, {
			key: s.key,
			className: 'workbench-warning-metric-card',
			size: 'small',
			bordered: false,
			style: cardStyleMerged,
			bodyStyle: {
				padding: '14px 16px',
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				minHeight: 0
			},
			onClick: onClick,
			onKeyDown: onClick
				? function (e) {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						onClick(e);
					}
				}
				: undefined,
			tabIndex: onClick ? 0 : undefined,
			role: onClick ? 'button' : undefined
		},
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, width: '100%', boxSizing: 'border-box' } },
				React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 } },
					React.createElement('div', {
						style: {
							width: 40,
							height: 40,
							borderRadius: 10,
							background: s.iconBg,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: 16,
							fontWeight: 600,
							color: s.color,
							flexShrink: 0
						}
					}, s.icon),
					React.createElement('div', { style: { minWidth: 0 } },
						React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', marginBottom: 0 } },
							React.createElement('span', { style: { fontSize: 12, color: 'rgba(0,0,0,0.55)', lineHeight: 1.35 } }, s.title),
							renderWorkbenchMetricHintIcon(s.key)
						),
						valueRow != null
							? valueRow
							: React.createElement('div', { style: { fontSize: 22, fontWeight: 600, color: accentOrange, lineHeight: 1.2 } }, s.value)
					)
				),
				trailing || null
			)
		);
	}

	function renderWarningMetricCardItem(s) {
		var minW = 152;
		if (s.key === 'w_en_h2_import_today') minW = 280;
		if (s.key === 'w_fin_energy_recharge') minW = 260;
		var cardProps = {
			key: s.key,
			title: s.title,
			value: s.key === 'w_en_h2_import_today' ? energyH2ImportTodayCount : s.value,
			iconBg: s.iconBg,
			icon: s.icon,
			color: s.color,
			minWidth: minW,
			onClick: function () {
				if (s.key === 'w_ops_delivery') {
					openOverdueDeliveryModal();
					return;
				}
				if (s.key === 'w_ops_return_cnt') {
					openOverdueReturnModal();
					return;
				}
				if (s.key === 'w_ops_inspect') {
					setInspectModalOpen(true);
					return;
				}
				if (s.key === 'w_ops_maint') {
					message.info('未来上线，敬请期待');
					return;
				}
				message.info('「' + s.title + '」明细（原型，联调接口后打开列表）');
			}
		};
		if (s.key === 'w_en_h2_import_today') {
			cardProps.valueRow = energyH2ImportTodayCount > 0
				? React.createElement('div', { style: { fontSize: 22, fontWeight: 600, color: accentOrange, lineHeight: 1.2 } }, energyH2ImportTodayCount)
				: React.createElement('div', { style: { fontSize: 11, lineHeight: 1.45, display: 'block', color: accentOrange, fontWeight: 500 } },
					'今日还未导入任何加氢记录，请确认是否有加氢明细需要导入'
				);
		}
		if (s.key === 'w_fin_energy_recharge') {
			cardProps.value = financeEnergyRechargeYuan;
			cardProps.valueRow = financeEnergyRechargeYuan != null
				? React.createElement('div', { style: { fontSize: 22, fontWeight: 600, color: accentOrange, lineHeight: 1.2 } }, formatWorkbenchFinanceYuan(financeEnergyRechargeYuan))
				: React.createElement('div', { style: { fontSize: 11, lineHeight: 1.45, display: 'block', color: accentOrange, fontWeight: 500 } },
					'请确认是否有能源账户充值记录'
				);
		}
		return renderVehicleMetricCard(cardProps);
	}

	function renderNoticePanelCard() {
		var preview = (noticeList || []).slice(0, wbDashPreviewMax);
		var titleNode = React.createElement(Space, { size: 8, wrap: true, align: 'center' },
			React.createElement('span', { className: 'workbench-dash-pair-head-title' }, '通知'),
			noticeNewCount > 0
				? React.createElement(Badge, { count: noticeNewCount, style: { backgroundColor: '#fa8c16' } })
				: null
		);
		var lines = preview.map(function (n, idx) {
			var isLast = idx === preview.length - 1;
			return React.createElement('div', {
				key: n.id,
				className: 'workbench-notice-detail-line',
				style: {
					padding: '6px 0',
					borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.06)'
				}
			},
				React.createElement('div', { style: { fontSize: 11, color: 'rgba(0,0,0,0.45)', marginBottom: 4, lineHeight: 1.3 } },
					n.time,
					React.createElement('span', { style: { margin: '0 6px', color: 'rgba(0,0,0,0.25)' } }, '·'),
					n.type,
					!n.read
						? React.createElement(Tag, { color: 'warning', style: { marginLeft: 6, fontSize: 11, lineHeight: '18px', padding: '0 6px' } }, '未读')
						: null
				),
				React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%' } },
					React.createElement(Text, {
						ellipsis: { tooltip: true },
						style: { fontSize: 12, color: 'rgba(0,0,0,0.78)', display: 'block', lineHeight: 1.45, flex: 1, minWidth: 0 }
					}, n.content),
					!n.read
						? React.createElement(Button, {
							type: 'link',
							size: 'small',
							style: { padding: 0, flexShrink: 0, height: 'auto', lineHeight: 1.45, fontSize: 12 },
							onClick: function () { markNoticeRead(n.id); }
						}, '设为已读')
						: null
				)
			);
		});
		return React.createElement(Card, {
			key: 'notice-panel',
			className: 'workbench-notice-panel workbench-dash-pair-head',
			bordered: false,
			title: titleNode,
			style: Object.assign({}, cardStyle, { flex: 1, width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }),
			bodyStyle: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' },
			extra: React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: openNoticeModal }, '更多')
		},
			React.createElement('div', { className: 'workbench-dash-card-body-center' },
				preview.length === 0
					? React.createElement('div', { className: 'workbench-dash-card-body-inner workbench-dash-card-body-empty' },
						React.createElement(Text, { type: 'secondary', style: { fontSize: 12 } }, '暂无通知')
					)
					: React.createElement('div', { className: 'workbench-dash-card-body-inner workbench-notice-detail-scroll' }, lines)
			)
		);
	}

	var reportTabItems = useMemo(function () {
		return [
			{
				key: 'task',
				label: '任务处理情况',
				children: React.createElement('div', { className: 'workbench-task-report-pane' },
					React.createElement('div', { style: { flexShrink: 0, fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 8, lineHeight: 1.5 } },
						'横轴：员工 · 纵轴：任务数量 · ',
						React.createElement('span', { style: { color: '#52c41a', fontWeight: 500 } }, '■'),
						' 完成任务 ',
						React.createElement('span', { style: { color: '#f5222d', fontWeight: 500 } }, '■'),
						' 超时任务（示意）'
					),
					renderTaskEmployeeBarChart(taskEmployeeBars, 'done', 'overdue', '#52c41a', '#ff7875', 52)
				)
			},
			{
				key: 'payment',
				label: '合同到账情况',
				children: React.createElement('div', { className: 'workbench-payment-report-pane' },
					React.createElement('div', { style: { flexShrink: 0, fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 8, lineHeight: 1.5 } },
						'环形合计对应应收款金额；蓝色为已收款，灰色为未到账（示意，联调接接口）'
					),
					renderContractPaymentDonutChart(contractPaymentDonut)
				)
			},
			{
				key: 'contract',
				label: '合同情况',
				children: React.createElement('div', { style: { padding: '8px 0 0' } },
					React.createElement('div', { style: { fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 8, lineHeight: 1.5 } },
						'横轴：月份 · 纵轴：合同数量 · 近12个月 · ',
						React.createElement('span', { style: { color: '#722ed1', fontWeight: 500 } }, '■'),
						' 租赁合同 ',
						React.createElement('span', { style: { color: '#b37feb', fontWeight: 500 } }, '■'),
						' 自营合同 ',
						React.createElement('span', { style: { color: '#fa8c16', fontWeight: 500 } }, '■'),
						' 续签合同（示意）'
					),
					renderBarGroupTriple(contractMonthBars, 'lease', 'self', 'renew', '#722ed1', '#b37feb', '#fa8c16', 44)
				)
			},
			{
				key: 'vehicle',
				label: '车辆运营情况',
				children: React.createElement('div', { style: { padding: '8px 0 0' } },
					React.createElement('div', { style: { fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 8 } }, '近12个月 · 运营车辆 / 闲置车辆'),
					renderBarGroup(vehicleMonthBars, 'op', 'idle', '#1677ff', '#91caff')
				)
			}
		];
	}, [vehicleMonthBars, contractMonthBars, taskEmployeeBars, contractPaymentDonut]);

	var quickItems = quickByRole[roleTab] ? quickByRole[roleTab].items : [];

	var quickRoleKeys = ['ye', 'yeEnergy', 'ops', 'finance', 'safety', 'legal'];

	var roleSwitchMenuProps = useMemo(function () {
		return {
			items: quickRoleKeys.map(function (k) {
				return { key: k, label: quickByRole[k].label };
			}),
			selectable: true,
			selectedKeys: [roleTab],
			onClick: function (info) {
				if (info && info.key) setRoleTab(info.key);
			}
		};
	}, [quickByRole, roleTab]);

	var oneScreenCss =
		'.workbench-one-screen .workbench-report-tabs.ant-tabs{height:100%;display:flex;flex-direction:column;min-height:0}' +
		'.workbench-one-screen .workbench-report-tabs .ant-tabs-content-holder{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column}' +
		'.workbench-one-screen .workbench-report-tabs .ant-tabs-content{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column}' +
		'.workbench-one-screen .workbench-report-tabs .ant-tabs-content .ant-tabs-tabpane.ant-tabs-tabpane-active{flex:1;min-height:0!important;display:flex!important;flex-direction:column;overflow:hidden}' +
		'.workbench-one-screen .workbench-report-tabs .ant-tabs-content .ant-tabs-tabpane.ant-tabs-tabpane-hidden{display:none!important}' +
		'.workbench-task-report-pane{flex:1;min-height:0;display:flex;flex-direction:column;height:100%;padding:8px 0 0;box-sizing:border-box}' +
		'.workbench-task-chart-axes-wrap{flex:1;min-height:0;width:100%;display:flex;flex-direction:column;box-sizing:border-box}' +
		'.workbench-task-chart-plot-row{flex:1;min-height:0;display:flex;flex-direction:row;align-items:stretch;overflow:hidden;box-sizing:border-box}' +
		'.workbench-task-bar-chart{flex:1;min-height:80px;width:100%;display:flex;align-items:stretch;gap:6px;overflow-x:auto;overflow-y:hidden;box-sizing:border-box}' +
		'.workbench-payment-report-pane{flex:1;min-height:0;display:flex;flex-direction:column;height:100%;padding:8px 0 0;box-sizing:border-box;overflow:hidden}' +
		'.workbench-payment-donut-hold{flex:1;min-height:0;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:auto;box-sizing:border-box}' +
		'.workbench-main-split{display:flex!important;flex-direction:column!important;gap:' + layoutGutter + 'px;flex:1;min-height:0;width:100%;overflow:hidden}' +
		'.workbench-main-split>.ant-row.workbench-todo-notice-row,.workbench-main-split>.ant-row.workbench-report-quick-row{flex:1 1 0!important;min-height:0!important;height:auto!important;max-height:none!important;margin:0!important;overflow:hidden}' +
		'.workbench-todo-notice-row>.ant-col,.workbench-report-quick-row>.ant-col{display:flex!important;flex-direction:column;min-height:0}' +
		'.workbench-notice-slot,.workbench-todo-slot,.workbench-report-slot{min-height:0}' +
		'.workbench-dash-pair-head.ant-card .ant-card-head{min-height:56px;padding:0 18px;display:flex;align-items:center;border-bottom:1px solid rgba(0,0,0,0.06)}' +
		'.workbench-dash-pair-head.ant-card .ant-card-head-title,.workbench-dash-pair-head-title{font-size:16px;font-weight:600;line-height:24px;color:rgba(0,0,0,0.88)}' +
		'.workbench-dash-pair-head.ant-card .ant-card-extra{padding:0}' +
		'.workbench-dash-pair-head.ant-card .ant-card-body{padding-top:10px!important}' +
		'.workbench-dash-pair-head-sub{font-size:12px!important;line-height:20px!important}' +
		'.workbench-notice-panel.ant-card{height:100%;min-height:0;display:flex!important;flex-direction:column}' +
		'.workbench-notice-panel .ant-card-body{flex:1;min-height:0!important;display:flex!important;flex-direction:column}' +
		'.workbench-dash-card-body-center{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:flex-start;align-items:stretch;overflow:hidden;width:100%}' +
		'.workbench-dash-card-body-inner{width:100%;max-height:100%;overflow-x:auto;overflow-y:auto;flex:0 1 auto;min-height:0}' +
		'.workbench-dash-card-body-empty{display:flex;align-items:center;justify-content:center;min-height:120px}' +
		'.workbench-todo-slot .ant-card,.workbench-report-slot .ant-card{height:100%;min-height:0}' +
		'.workbench-report-tabs .ant-tabs-nav{margin-bottom:8px;}' +
		'.workbench-notice-inline-hint{font-size:11px;font-weight:500;color:#ad4e00;cursor:pointer;user-select:none;white-space:nowrap}' +
		'.workbench-notice-inline-hint:hover{color:#d46b08;text-decoration:underline}' +
		'.workbench-todo-table .ant-table-thead>tr>th{color:#707d8f!important;font-weight:400!important;font-size:12px!important;background:#f7f8fa!important;border-bottom:1px solid rgba(0,0,0,0.06)!important;padding:12px 12px!important}' +
		'.workbench-todo-table .ant-table-thead>tr>th::before{display:none!important}' +
		'.workbench-todo-table .ant-table-column-sorter{color:#98a1b0!important}' +
		'.workbench-todo-table .ant-table-column-sorter-up.active,.workbench-todo-table .ant-table-column-sorter-down.active{color:#707d8f!important}' +
		'.workbench-todo-table.ant-table-small .ant-table-thead>tr>th{padding:10px 12px!important}' +
		'.workbench-todo-table .ant-table-thead>tr>th.ant-table-column-sort{background:#f7f8fa!important}' +
		'.workbench-todo-table .ant-table-tbody>tr>td.ant-table-column-sort{background:#fff!important}' +
		'.workbench-todo-table .ant-table-tbody>tr.ant-table-row:hover>td.ant-table-column-sort{background:#fafafa!important}' +
		'.workbench-one-screen .workbench-quick-card.ant-card{display:flex;flex-direction:column;min-height:0;height:100%}' +
		'.workbench-one-screen .workbench-quick-card .ant-card-body{padding:0;flex:1;min-height:0;display:flex;flex-direction:column}' +
		'.workbench-quick-scroll{flex:1;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch}' +
		'.workbench-quick-item{display:flex;align-items:center;gap:6px;width:100%;box-sizing:border-box;padding:5px 6px;border-radius:6px;border:1px solid rgba(0,0,0,0.06);background:#fafafa;cursor:pointer;transition:border-color .15s,background .15s,box-shadow .15s;text-align:left;outline:none}' +
		'.workbench-quick-item:hover{border-color:rgba(22,119,255,0.22);background:#f3f8ff;box-shadow:0 1px 2px rgba(22,119,255,0.06)}' +
		'.workbench-quick-item:focus-visible{box-shadow:0 0 0 2px rgba(22,119,255,0.2)}' +
		'.workbench-quick-item-icon{flex-shrink:0;width:26px;height:26px;border-radius:6px;background:linear-gradient(135deg,#f0f5ff,#d6e4ff);line-height:26px;text-align:center;font-size:12px;font-weight:600;color:#1677ff}' +
		'.workbench-quick-item-label{flex:1;min-width:0;font-size:11px;line-height:1.3;color:rgba(0,0,0,0.78);word-break:break-word;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}' +
		'.workbench-quick-item--action{padding:7px 10px;min-height:38px}' +
		'.workbench-quick-item--primary{border-color:rgba(22,119,255,0.2);background:linear-gradient(135deg,#f8fbff 0%,#eef5ff 100%)}' +
		'.workbench-quick-item--primary:hover{border-color:rgba(22,119,255,0.35);background:linear-gradient(135deg,#f0f7ff 0%,#e6f0ff 100%)}' +
		'.workbench-quick-item--primary .workbench-quick-item-icon{background:linear-gradient(135deg,#1677ff,#4096ff);color:#fff;box-shadow:0 2px 6px rgba(22,119,255,0.25)}' +
		'.workbench-quick-item--orange{border-color:rgba(250,140,22,0.22);background:linear-gradient(135deg,#fffaf5 0%,#fff3e6 100%)}' +
		'.workbench-quick-item--orange:hover{border-color:rgba(250,140,22,0.38);background:linear-gradient(135deg,#fff7ef 0%,#ffebd6 100%)}' +
		'.workbench-quick-item--orange .workbench-quick-item-icon{background:linear-gradient(135deg,#fa8c16,#ffa940);color:#fff;box-shadow:0 2px 6px rgba(250,140,22,0.22)}' +
		'.workbench-quick-section-hint{font-size:11px;line-height:1.35;color:rgba(0,0,0,0.45);padding:0 4px 6px;font-weight:500;letter-spacing:0.02em}' +
		'.workbench-gen-task-modal .ant-modal-body{padding-top:14px}' +
		'.workbench-gen-task-form-label{display:block;margin-bottom:6px;font-size:13px;font-weight:500;color:rgba(0,0,0,0.88);line-height:1.4}' +
		'.workbench-gen-task-form-label .req{color:#ff4d4f;margin-right:4px}' +
		'.workbench-gen-task-section{background:#fafafa;border:1px solid rgba(0,0,0,0.06);border-radius:10px;padding:14px 16px;margin-bottom:14px}' +
		'.workbench-gen-task-readonly{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 16px;margin-bottom:4px}' +
		'.workbench-gen-task-readonly-item{font-size:12px;line-height:1.45;color:rgba(0,0,0,0.65)}' +
		'.workbench-gen-task-readonly-item strong{color:rgba(0,0,0,0.88);font-weight:500;margin-right:6px}' +
		'.workbench-gen-task-table-hint{font-size:12px;color:rgba(0,0,0,0.45);margin:4px 0 10px;line-height:1.45}' +
		'.workbench-header-warning-dept-tabs{flex-shrink:0;max-width:100%}' +
		'.workbench-header-warning-dept-tabs.ant-tabs{min-width:0}' +
		'.workbench-header-warning-dept-tabs .ant-tabs-nav{margin:0!important;min-height:32px}' +
		'.workbench-header-warning-dept-tabs .ant-tabs-nav::before{border-bottom:none!important}' +
		'.workbench-header-warning-dept-tabs .ant-tabs-tab{padding:4px 8px!important;font-size:12px}' +
		'.workbench-header-warning-dept-tabs .ant-tabs-nav-wrap{justify-content:flex-end}' +
		'.workbench-header-warning-dept-tabs .ant-tabs-content-holder{display:none!important}' +
		'.workbench-overdue-delivery-modal .ant-table-tbody>tr>td{color:#a8071a!important;background-color:#fff2f0!important;border-color:#ffccc7!important}' +
		'.workbench-overdue-delivery-modal .ant-table-tbody>tr>td.ant-table-cell-fix-left,.workbench-overdue-delivery-modal .ant-table-tbody>tr>td.ant-table-cell-fix-right{background-color:#fff2f0!important}' +
		'.workbench-overdue-delivery-modal .ant-table-tbody>tr:hover>td{background-color:#ffccc7!important;color:#a8071a!important}' +
		'.workbench-overdue-delivery-modal .ant-table-tbody>tr:hover>td.ant-table-cell-fix-left,.workbench-overdue-delivery-modal .ant-table-tbody>tr:hover>td.ant-table-cell-fix-right{background-color:#ffccc7!important}' +
		'.workbench-overdue-return-modal .ant-table-thead>tr>th,.workbench-overdue-return-modal .ant-table-tbody>tr>td{white-space:nowrap}' +
		'.workbench-overdue-return-modal .ant-table-tbody>tr>td{color:#ad4e00!important;background-color:#fff7e6!important;border-color:#ffd591!important}' +
		'.workbench-overdue-return-modal .ant-table-tbody>tr>td.ant-table-cell-fix-left,.workbench-overdue-return-modal .ant-table-tbody>tr>td.ant-table-cell-fix-right{background-color:#fff7e6!important}' +
		'.workbench-overdue-return-modal .ant-table-tbody>tr:hover>td{background-color:#ffe7ba!important;color:#ad4e00!important}' +
		'.workbench-overdue-return-modal .ant-table-tbody>tr:hover>td.ant-table-cell-fix-left,.workbench-overdue-return-modal .ant-table-tbody>tr:hover>td.ant-table-cell-fix-right{background-color:#ffe7ba!important}' +
		'.workbench-overdue-return-modal .ant-btn-link{color:#1677ff!important}' +
		'.workbench-warning-metric-card.ant-card{display:flex!important;flex-direction:column!important;height:100%!important;min-height:inherit}' +
		'.workbench-warning-metric-card.ant-card .ant-card-body{flex:1!important;display:flex!important;flex-direction:column!important;justify-content:center!important;min-height:0!important}' +
		'.workbench-metric-hint-icon:hover{color:rgba(22,119,255,0.9)!important}' +
		'.workbench-metric-hint-icon:focus-visible{outline:2px solid rgba(22,119,255,0.35);outline-offset:2px;border-radius:4px}' +
		'.workbench-one-screen .ant-breadcrumb{font-size:13px;line-height:1.5}' +
		'.workbench-one-screen .ant-breadcrumb a,.workbench-one-screen .ant-breadcrumb .ant-breadcrumb-link{color:rgba(0,0,0,0.65)}' +
		'.workbench-one-screen .ant-breadcrumb li:last-child .ant-breadcrumb-link{color:rgba(0,0,0,0.88);font-weight:500}' +
		'.workbench-report-tabs .ant-tabs-ink-bar{background:#1677ff;height:2px;border-radius:1px}' +
		'.workbench-report-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn{color:rgba(0,0,0,0.88);font-weight:600}' +
		'.workbench-report-slot .ant-card .ant-card-head{min-height:52px;padding:0 18px;border-bottom:1px solid rgba(0,0,0,0.06)}' +
		'.workbench-report-slot .ant-card .ant-card-head-title{font-size:16px;font-weight:600;color:rgba(0,0,0,0.88)}';

	return React.createElement(App, null,
		React.createElement('div', {
			className: 'workbench-one-screen',
			style: {
				boxSizing: 'border-box',
				height: '100vh',
				padding: pagePadY + 'px ' + pagePadX + 'px ' + pagePadY + 'px',
				background: pageBg,
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column'
			}
		},
			React.createElement('style', null, oneScreenCss),

			React.createElement('div', { style: { flexShrink: 0, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(0,0,0,0.06)' } },
				React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 10 } },
					React.createElement(Breadcrumb, { items: [{ title: '运管平台' }, { title: '工作台' }] }),
					React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', minWidth: 0 } },
						React.createElement(Tabs, {
							className: 'workbench-header-warning-dept-tabs',
							activeKey: warningDeptKey,
							onChange: setWarningDeptKey,
							size: 'small',
							items: warningDeptTabItems,
							tabBarGutter: 4
						})
					)
				),
				React.createElement(Title, { level: 5, style: { margin: 0, fontWeight: 600, fontSize: 18, color: 'rgba(0,0,0,0.88)', letterSpacing: '-0.01em' } }, '欢迎回来，' + mockOperatorDisplayName)
			),
			React.createElement('div', { style: { flexShrink: 0, marginBottom: 12, boxSizing: 'border-box' } },
				React.createElement('div', { className: 'workbench-top-metrics', style: { display: 'flex', flexWrap: 'wrap', gap: layoutGutter, alignItems: 'stretch' } },
					React.createElement('div', {
						className: 'workbench-warning-cards' + (warningDeptKey === 'finance' ? ' workbench-warning-cards--finance' : ''),
						style: warningDeptKey === 'finance'
							? { flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: layoutGutter, alignItems: 'stretch', minWidth: 0, width: '100%' }
							: { flex: '1 1 280px', display: 'flex', flexWrap: 'wrap', gap: layoutGutter, alignItems: 'stretch', minWidth: 0 }
					},
						warningDeptKey === 'finance'
							? [
								React.createElement('div', {
									key: 'wb-fin-row1',
									style: { display: 'flex', flexWrap: 'wrap', gap: layoutGutter, width: '100%', alignItems: 'stretch' }
								}, warningCardsVisible.slice(0, 5).map(function (s) { return renderWarningMetricCardItem(s); })),
								React.createElement('div', {
									key: 'wb-fin-row2',
									style: { display: 'flex', flexWrap: 'wrap', gap: layoutGutter, width: '100%', alignItems: 'stretch' }
								}, warningCardsVisible.slice(5).map(function (s) { return renderWarningMetricCardItem(s); }))
							]
							: warningCardsVisible.map(function (s) { return renderWarningMetricCardItem(s); })
					)
				)
			),
			React.createElement(Row, { gutter: [layoutGutter, layoutGutter], align: 'stretch', style: { flex: 1, minHeight: 0, overflow: 'hidden' } },
				React.createElement(Col, {
					xs: 24,
					lg: 24,
					xl: 24,
					className: 'workbench-main-split',
					style: { flex: 1, minHeight: 0, minWidth: 0, height: '100%' }
				},
					React.createElement(Row, {
						className: 'workbench-todo-notice-row',
						gutter: [layoutGutter, layoutGutter],
						align: 'stretch',
						wrap: true,
						style: { minHeight: 0, flex: '1 1 0', margin: 0 }
					},
						React.createElement(Col, {
							xs: 24,
							lg: 16,
							xl: 16,
							style: { display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }
						},
							React.createElement('div', { className: 'workbench-todo-slot', style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' } },
								React.createElement(Card, {
									className: 'workbench-dash-pair-head',
									title: React.createElement(Space, { size: 8, wrap: true, align: 'center' },
										React.createElement('span', { className: 'workbench-dash-pair-head-title' }, '待办任务'),
										React.createElement(Badge, { count: todoSummary.pending + todoSummary.overdue, style: { backgroundColor: accentBlue } }),
										renderTodoStatChip('all', '全部', dashboardTodoRows.length, 'rgba(0,0,0,0.04)', '#595959'),
										renderTodoStatChip('pending', '待处理', todoSummary.pending, 'rgba(22,119,255,0.06)', accentBlue),
										renderTodoStatChip('overdue', '已超时', todoSummary.overdue, 'rgba(245,34,45,0.06)', '#f5222d')
									),
									bordered: false,
									style: Object.assign({}, cardStyle, { flex: 1, width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }),
									bodyStyle: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' },
									extra: React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 }, onClick: openTodoMoreModal }, '更多')
								},
									React.createElement('div', { className: 'workbench-dash-card-body-center' },
										React.createElement('div', { className: 'workbench-dash-card-body-inner' },
											React.createElement(Table, {
												className: 'workbench-todo-table',
												size: 'small',
												rowKey: 'id',
												columns: todoTableColumns,
												dataSource: dashboardTodoBoardPreviewRows,
												pagination: false,
												scroll: { x: 704 }
											})
										)
									)
								)
							)
						),
						React.createElement(Col, {
							xs: 24,
							lg: 8,
							xl: 8,
							style: { display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }
						},
							React.createElement('div', { className: 'workbench-notice-slot', style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%' } },
								renderNoticePanelCard()
							)
						)
					),
					React.createElement(Row, {
						className: 'workbench-report-quick-row',
						gutter: [layoutGutter, layoutGutter],
						align: 'stretch',
						wrap: true,
						style: { minHeight: 0, flex: '1 1 0', margin: 0 }
					},
						React.createElement(Col, {
							xs: 24,
							lg: 16,
							xl: 16,
							style: { display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }
						},
							React.createElement('div', { className: 'workbench-report-slot', style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' } },
								React.createElement(Card, {
									title: '统计报表',
									bordered: false,
									style: Object.assign({}, cardStyle, { flex: 1, width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }),
									bodyStyle: { paddingTop: 4, paddingBottom: 8, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
								},
									React.createElement(Tabs, {
										className: 'workbench-report-tabs',
										activeKey: reportTab,
										onChange: setReportTab,
										items: reportTabItems,
										tabBarStyle: { marginBottom: 0 },
										style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }
									})
								)
							)
						),
						React.createElement(Col, {
							xs: 24,
							lg: 8,
							xl: 8,
							style: { display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }
						},
							React.createElement(Card, {
								className: 'workbench-quick-card',
								title: '快速入口',
								bordered: false,
								style: Object.assign({}, cardStyle, { flex: 1, width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }),
								bodyStyle: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', padding: 0 },
								extra: React.createElement(Dropdown, {
									menu: roleSwitchMenuProps,
									trigger: ['click'],
									placement: 'bottomRight'
								},
									React.createElement(Button, { type: 'link', size: 'small', style: { padding: 0 } }, '切换角色')
								)
							},
								React.createElement('div', { className: 'workbench-quick-scroll', style: { padding: '6px 6px 4px' } },
									quickItems.some(function (it) { return it.action; })
										? React.createElement('div', { className: 'workbench-quick-section-hint' }, '常用操作')
										: null,
									React.createElement(Row, { gutter: [6, 6], style: { marginBottom: quickItems.some(function (it) { return !it.action; }) ? 8 : 0 } },
										quickItems.filter(function (it) { return it.action; }).map(function (it, idx) {
											var accentClass = it.accent === 'orange' ? ' workbench-quick-item--orange' : ' workbench-quick-item--primary';
											return React.createElement(Col, { span: 24, key: it.t + '-action-' + idx },
												React.createElement('div', {
													className: 'workbench-quick-item workbench-quick-item--action' + accentClass,
													role: 'button',
													tabIndex: 0,
													onClick: function () { handleQuickItemClick(it); },
													onKeyDown: function (e) {
														if (e.key === 'Enter' || e.key === ' ') {
															e.preventDefault();
															handleQuickItemClick(it);
														}
													}
												},
													React.createElement('div', { className: 'workbench-quick-item-icon', 'aria-hidden': true }, it.t.charAt(0)),
													React.createElement('div', { className: 'workbench-quick-item-label' }, it.t)
												)
											);
										})
									),
									quickItems.some(function (it) { return !it.action; })
										? React.createElement('div', { className: 'workbench-quick-section-hint' }, '功能入口')
										: null,
									React.createElement(Row, { gutter: [6, 6], style: { marginBottom: 0 } },
										quickItems.filter(function (it) { return !it.action; }).map(function (it, idx) {
											return React.createElement(Col, { span: 12, key: it.t + '-' + idx },
												React.createElement('div', {
													className: 'workbench-quick-item',
													role: 'button',
													tabIndex: 0,
													onClick: function () { handleQuickItemClick(it); },
													onKeyDown: function (e) {
														if (e.key === 'Enter' || e.key === ' ') {
															e.preventDefault();
															handleQuickItemClick(it);
														}
													}
												},
													React.createElement('div', { className: 'workbench-quick-item-icon', 'aria-hidden': true }, it.t.charAt(0)),
													React.createElement('div', { className: 'workbench-quick-item-label' }, it.t)
												)
											);
										})
									)
								)
							)
						)
					)
				)
			),

			React.createElement(Modal, {
				title: '全部待办任务',
				open: todoMoreModalOpen,
				width: 960,
				onCancel: function () { setTodoMoreModalOpen(false); },
				footer: React.createElement(Button, { onClick: function () { setTodoMoreModalOpen(false); } }, '关闭'),
				destroyOnClose: true
			},
				React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
					React.createElement(Space, { wrap: true, align: 'center', size: [8, 8] },
						React.createElement(Text, { type: 'secondary', style: { fontSize: 12 } }, '任务类型'),
						React.createElement(Select, {
							allowClear: true,
							placeholder: '全部类型',
							style: { width: 160 },
							options: todoMoreTaskTypeFilterOptions,
							value: todoMoreTaskType,
							onChange: setTodoMoreTaskType,
							showSearch: true,
							optionFilterProp: 'label'
						}),
						React.createElement(Text, { type: 'secondary', style: { fontSize: 12 } }, '任务状态'),
						React.createElement(Select, {
							allowClear: true,
							placeholder: '全部状态',
							style: { width: 140 },
							options: todoMoreStatusFilterOptions,
							value: todoMoreStatus,
							onChange: setTodoMoreStatus
						}),
						React.createElement(Text, { type: 'secondary', style: { fontSize: 12 } }, '任务时间'),
						React.createElement(DatePicker.RangePicker, {
							style: { width: 140 },
							format: 'YYYY-MM-DD',
							placeholder: ['开始', '结束'],
							allowClear: true,
							value: todoMoreRangeValue,
							onChange: function (_dates, dateStrings) {
								if (!dateStrings || (!dateStrings[0] && !dateStrings[1])) {
									setTodoMoreDateStart('');
									setTodoMoreDateEnd('');
									return;
								}
								setTodoMoreDateStart(dateStrings[0] || '');
								setTodoMoreDateEnd(dateStrings[1] || '');
							}
						}),
						React.createElement(Button, {
							size: 'small',
							onClick: function () {
								setTodoMoreTaskType(undefined);
								setTodoMoreStatus(undefined);
								setTodoMoreDateStart('');
								setTodoMoreDateEnd('');
							}
						}, '重置')
					),
					React.createElement(Table, {
						className: 'workbench-todo-table',
						size: 'small',
						rowKey: 'id',
						columns: todoMoreModalColumns,
						dataSource: todoMoreFilteredRows,
						pagination: { pageSize: 10, showSizeChanger: false, showTotal: function (t) { return '共 ' + t + ' 条'; } },
						scroll: { x: 780, y: 360 }
					})
				)
			),

			React.createElement(Modal, {
				title: '通知消息',
				open: noticeModalOpen,
				width: 860,
				onCancel: function () { setNoticeModalOpen(false); },
				footer: React.createElement(Button, { onClick: function () { setNoticeModalOpen(false); } }, '关闭'),
				destroyOnClose: true
			},
				React.createElement(Table, {
					size: 'small',
					rowKey: 'id',
					columns: noticeColumns,
					dataSource: noticeList,
					pagination: { pageSize: 8, showSizeChanger: false },
					scroll: { x: 720 }
				})
			),

			React.createElement(Modal, {
				title: '超期未交车',
				open: overdueDeliveryModalOpen,
				width: 1280,
				onCancel: function () { setOverdueDeliveryModalOpen(false); },
				footer: React.createElement(Button, { onClick: function () { setOverdueDeliveryModalOpen(false); } }, '关闭'),
				destroyOnClose: true
			},
				React.createElement(Text, { type: 'secondary', style: { fontSize: 12, display: 'block', marginBottom: 10 } },
					'以下任务已超过预计交车结束日期，请与业管人员沟通交车是否延误，修改交车时间或及时处理'
				),
				React.createElement(Table, {
					className: 'workbench-overdue-delivery-modal',
					size: 'small',
					rowKey: 'id',
					columns: overdueDeliveryModalColumns,
					dataSource: overdueDeliveryMockRows,
					pagination: false,
					scroll: { x: 1620, y: 400 }
				})
			),

			React.createElement(Modal, {
				title: '超期未还车数量',
				open: overdueReturnModalOpen,
				width: 1320,
				onCancel: function () { setOverdueReturnModalOpen(false); },
				footer: React.createElement(Button, { onClick: function () { setOverdueReturnModalOpen(false); } }, '关闭'),
				destroyOnClose: true
			},
				React.createElement(Text, { type: 'secondary', style: { fontSize: 12, display: 'block', marginBottom: 10 } },
					'以下车辆已超过合同应还期限仍未完成还车流程，示意数据与还车管理-待处理列表字段一致（标橙提示）；联调接接口。'
				),
				React.createElement(Table, {
					className: 'workbench-overdue-return-modal',
					size: 'small',
					rowKey: 'id',
					columns: overdueReturnModalColumns,
					dataSource: overdueReturnMockRows,
					pagination: false,
					scroll: { x: 1780, y: 360 }
				})
			),

			React.createElement(Modal, {
				title: '年审/等级评定',
				open: inspectModalOpen,
				width: 1000,
				onCancel: function () { setInspectModalOpen(false); },
				footer: React.createElement(Button, { onClick: function () { setInspectModalOpen(false); } }, '关闭'),
				destroyOnClose: true
			},
				React.createElement(Table, {
					size: 'small',
					rowKey: 'id',
					columns: inspectModalColumns,
					dataSource: inspectMockRows,
					pagination: false,
					scroll: { x: 800, y: 360 }
				})
			),

			React.createElement(Modal, {
				className: 'workbench-gen-task-modal',
				title: '生成交车任务',
				open: genDeliveryPickOpen,
				width: 520,
				destroyOnClose: true,
				onCancel: function () {
					setGenDeliveryPickOpen(false);
					resetGenDeliveryFlow();
				},
				footer: React.createElement(Space, null,
					React.createElement(Button, {
						onClick: function () {
							setGenDeliveryPickOpen(false);
							resetGenDeliveryFlow();
						}
					}, '取消'),
					React.createElement(Button, { type: 'primary', onClick: handleGenDeliveryNext }, '生成')
				)
			},
				React.createElement('div', { className: 'workbench-gen-task-section' },
					React.createElement('div', { style: { marginBottom: 14 } },
						renderGenTaskLabel('客户名称', true),
						React.createElement(Select, {
							showSearch: true,
							allowClear: true,
							placeholder: '请选择客户名称',
							style: { width: '100%' },
							value: genDeliveryCustomer || undefined,
							options: genDeliveryCustomerOptions,
							optionFilterProp: 'label',
							onChange: function (val) {
								setGenDeliveryCustomer(val || '');
								setGenDeliveryProjectId(undefined);
							}
						})
					),
					React.createElement('div', null,
						renderGenTaskLabel('项目名称', true),
						React.createElement(Select, {
							showSearch: true,
							allowClear: true,
							placeholder: genDeliveryCustomer
								? (genDeliveryProjectOptions.length ? '请选择或搜索项目名称' : '该客户暂无可用项目')
								: '请先选择客户名称',
							style: { width: '100%' },
							value: genDeliveryProjectId,
							options: genDeliveryProjectOptions,
							optionFilterProp: 'label',
							disabled: !genDeliveryCustomer,
							onChange: function (val) { setGenDeliveryProjectId(val); }
						})
					)
				),
				React.createElement(Text, { type: 'secondary', style: { fontSize: 12 } }, '选择客户与项目后，将配置预计交车日期并勾选待交车辆。')
			),

			React.createElement(Modal, {
				className: 'workbench-gen-task-modal',
				title: '配置交车任务',
				open: genDeliveryConfigOpen,
				width: 980,
				destroyOnClose: true,
				onCancel: function () {
					setGenDeliveryConfigOpen(false);
					resetGenDeliveryFlow();
				},
				footer: React.createElement(Space, null,
					React.createElement(Button, {
						onClick: function () {
							setGenDeliveryConfigOpen(false);
							setGenDeliveryPickOpen(true);
						}
					}, '上一步'),
					React.createElement(Button, {
						onClick: function () {
							setGenDeliveryConfigOpen(false);
							resetGenDeliveryFlow();
						}
					}, '取消'),
					React.createElement(Button, { type: 'primary', onClick: handleGenDeliveryConfirm }, '确认生成')
				)
			},
				selectedGenDeliveryProject
					? React.createElement('div', { className: 'workbench-gen-task-readonly' },
						React.createElement('div', { className: 'workbench-gen-task-readonly-item' }, React.createElement('strong', null, '项目名称'), selectedGenDeliveryProject.name),
						React.createElement('div', { className: 'workbench-gen-task-readonly-item' }, React.createElement('strong', null, '合同编码'), selectedGenDeliveryProject.contractCode),
						React.createElement('div', { className: 'workbench-gen-task-readonly-item' }, React.createElement('strong', null, '客户名称'), selectedGenDeliveryProject.customerName),
						React.createElement('div', { className: 'workbench-gen-task-readonly-item' }, React.createElement('strong', null, '交车区域'), selectedGenDeliveryProject.deliveryRegion)
					)
					: null,
				React.createElement(Row, { gutter: [16, 12], style: { marginBottom: 12 } },
					React.createElement(Col, { xs: 24, md: 12 },
						renderGenTaskLabel('预计交车日期', true),
						React.createElement(RangePicker, {
							style: { width: '100%' },
							value: genDeliveryExpected,
							onChange: function (val) { setGenDeliveryExpected(val); },
							placeholder: ['开始日期', '结束日期']
						})
					),
					React.createElement(Col, { xs: 24, md: 12 },
						renderGenTaskLabel('开始计费日期', true),
						React.createElement(DatePicker, {
							style: { width: '100%' },
							value: genDeliveryBilling,
							onChange: function (val) { setGenDeliveryBilling(val); },
							placeholder: '请选择开始计费日期'
						})
					)
				),
				React.createElement('div', { className: 'workbench-gen-task-table-hint' },
					'勾选待交车辆；已创建交车任务或已完成交车的车辆不可选。'
				),
				React.createElement(Table, {
					size: 'small',
					rowKey: 'key',
					columns: genDeliveryVehicleColumns,
					dataSource: genDeliveryVehicleList,
					rowSelection: genDeliveryRowSelection,
					pagination: false,
					scroll: { x: 860, y: 280 },
					locale: { emptyText: '当前项目暂无可选车辆' }
				})
			),

			React.createElement(Modal, {
				className: 'workbench-gen-task-modal',
				title: '生成还车任务',
				open: genReturnPickOpen,
				width: 520,
				destroyOnClose: true,
				onCancel: function () {
					setGenReturnPickOpen(false);
					resetGenReturnFlow();
				},
				footer: React.createElement(Space, null,
					React.createElement(Button, {
						onClick: function () {
							setGenReturnPickOpen(false);
							resetGenReturnFlow();
						}
					}, '取消'),
					React.createElement(Button, { type: 'primary', onClick: handleGenReturnNext }, '生成')
				)
			},
				React.createElement('div', { className: 'workbench-gen-task-section' },
					React.createElement('div', { style: { marginBottom: 14 } },
						renderGenTaskLabel('客户名称', true),
						React.createElement(Input, {
							placeholder: '请输入客户名称',
							value: genReturnCustomer,
							onChange: function (e) {
								setGenReturnCustomer(e.target.value);
								setGenReturnProjectId(undefined);
							},
							allowClear: true
						})
					),
					React.createElement('div', null,
						renderGenTaskLabel('项目名称', true),
						React.createElement(Select, {
							showSearch: true,
							allowClear: true,
							placeholder: genReturnProjectOptions.length ? '请选择或搜索项目名称' : '暂无匹配项目，请调整客户名称',
							style: { width: '100%' },
							value: genReturnProjectId,
							options: genReturnProjectOptions,
							optionFilterProp: 'label',
							onChange: function (val) { setGenReturnProjectId(val); }
						})
					)
				),
				React.createElement(Text, { type: 'secondary', style: { fontSize: 12 } }, '选择客户与项目后，将配置预计还车日期并勾选待还车辆。')
			),

			React.createElement(Modal, {
				className: 'workbench-gen-task-modal',
				title: '配置还车任务',
				open: genReturnConfigOpen,
				width: 860,
				destroyOnClose: true,
				onCancel: function () {
					setGenReturnConfigOpen(false);
					resetGenReturnFlow();
				},
				footer: React.createElement(Space, null,
					React.createElement(Button, {
						onClick: function () {
							setGenReturnConfigOpen(false);
							setGenReturnPickOpen(true);
						}
					}, '上一步'),
					React.createElement(Button, {
						onClick: function () {
							setGenReturnConfigOpen(false);
							resetGenReturnFlow();
						}
					}, '取消'),
					React.createElement(Button, { type: 'primary', onClick: handleGenReturnConfirm }, '确认生成')
				)
			},
				selectedGenReturnProject
					? React.createElement('div', { className: 'workbench-gen-task-readonly' },
						React.createElement('div', { className: 'workbench-gen-task-readonly-item' }, React.createElement('strong', null, '项目名称'), selectedGenReturnProject.name),
						React.createElement('div', { className: 'workbench-gen-task-readonly-item' }, React.createElement('strong', null, '合同编码'), selectedGenReturnProject.contractCode),
						React.createElement('div', { className: 'workbench-gen-task-readonly-item' }, React.createElement('strong', null, '客户名称'), selectedGenReturnProject.customerName),
						React.createElement('div', { className: 'workbench-gen-task-readonly-item' }, React.createElement('strong', null, '交车区域'), selectedGenReturnProject.deliveryRegion)
					)
					: null,
				React.createElement('div', { style: { marginBottom: 12, maxWidth: 320 } },
					renderGenTaskLabel('预计还车日期', true),
					React.createElement(DatePicker, {
						style: { width: '100%' },
						value: genReturnDate,
						onChange: function (val) { setGenReturnDate(val); },
						placeholder: '请选择预计还车日期'
					})
				),
				React.createElement('div', { className: 'workbench-gen-task-table-hint' },
					'勾选已交车、待还车辆；仅展示可发起还车流程的车辆。'
				),
				React.createElement(Table, {
					size: 'small',
					rowKey: 'key',
					columns: genReturnVehicleColumns,
					dataSource: genReturnVehicleList,
					rowSelection: genReturnRowSelection,
					pagination: false,
					scroll: { x: 620, y: 280 },
					locale: { emptyText: '当前项目暂无已交车车辆' }
				})
			)
		)
	);
};
