// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 异动管理（列表页）

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
	var message = antd.message;
	var Modal = antd.Modal;
	var Tabs = antd.Tabs;

	var RangePicker = DatePicker.RangePicker;

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function fmtYMDHM(v) {
		if (v === null || v === undefined) return '-';
		var s = String(v).trim();
		if (!s) return '-';
		if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(s)) return s.slice(0, 16);
		if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s + ' 00:00';
		try {
			var d = new Date(s.replace(/-/g, '/'));
			if (isNaN(d.getTime())) return s;
			var p2 = function (n) { return n < 10 ? '0' + n : '' + n; };
			return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
		} catch (e) {
			return s;
		}
	}

	function canShowMovementEdit(approvalStatus) {
		var s = String(approvalStatus || '');
		return s === '待提交' || s === '驳回' || s === '撤回';
	}

	/** 已结束异动（进入历史记录 Tab） */
	function isMovementEnded(r) {
		if (!r) return false;
		return !!(r.movementEndedAt || r.movementEnded);
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var tableSingleLineStyle = '.movement-list-table .ant-table-thead th,.movement-list-table .ant-table-tbody td{white-space:nowrap;}';
	var movementTabsBarStyle = '.movement-list-tabs .ant-tabs-nav{align-items:center;margin-bottom:0;}';

	var moveTypeOptions = useMemo(function () {
		return [
			{ value: '维修', label: '维修' },
			{ value: '保养', label: '保养' },
			{ value: '年审', label: '年审' },
			{ value: '其他', label: '其他' }
		];
	}, []);

	var plateOptions = useMemo(function () {
		return [
			{ value: '粤A12345', label: '粤A12345' },
			{ value: '粤B11111', label: '粤B11111' },
			{ value: '浙A11111', label: '浙A11111' },
			{ value: '浙B22222', label: '浙B22222' },
			{ value: '沪A30003', label: '沪A30003' },
			{ value: '苏E88888', label: '苏E88888' },
			{ value: '京A66666', label: '京A66666' },
			{ value: '渝A99999', label: '渝A99999' },
			{ value: '川A77777', label: '川A77777' },
			{ value: '鲁B55555', label: '鲁B55555' }
		];
	}, []);

	var draftState = useState({
		moveStartRange: null,
		moveTypes: [],
		plateNo: undefined
	});
	var draft = draftState[0];
	var setDraft = draftState[1];

	var appliedState = useState({
		moveStartRange: null,
		moveTypes: [],
		plateNo: undefined
	});
	var applied = appliedState[0];
	var setApplied = appliedState[1];

	var pageState = useState(1);
	var page = pageState[0];
	var setPage = pageState[1];
	var pageSizeState = useState(20);
	var pageSize = pageSizeState[0];
	var setPageSize = pageSizeState[1];

	var listTabState = useState('ongoing');
	var listTab = listTabState[0];
	var setListTab = listTabState[1];

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	var requirementDocContent = [
		'一个「数字化资产ONEOS运管平台」中的「异动管理」模块',
		'#面包屑：运维管理-车辆业务-异动管理',
		'',
		'1.筛选；',
		'1.1.异动开始日期：日期选择器，输入框支持双日历选择开始-结束时间；',
		'1.2.异动类型：选择器，选项包括：维修、保养、年审、其他，支持多选；',
		'1.3.车牌号：选择器，输入框支持模糊搜索下拉匹配结果；',
		'1.4.右侧为查询、重置按钮；',
		'',
		'2.列表：分为2个tab：进行中、历史记录；',
		'#进行中：',
		'2.1.异动开始日期：显示车辆异动开始日期，格式为：YYYY-MM-DD HH:MM；',
		'2.2.异动预计结束日期：显示车辆异动结束日期，格式为：YYYY-MM-DD HH:MM；',
		'2.3.审批状态：分为:待提交、审批中、审批完成、驳回、撤回；',
		'2.4.异动目的地：显示车辆异动目的地，选项包括：停车场、维修站、其他；',
		'2.5.目的地区域：列于目的地名称前方；格式为「省-市」。停车场：显示该停车场所属区域（停车场区域）；维修站：显示该维修站所属区域（维修站区域）；其他：显示新增/编辑时所选目的地所在区域（省-市级联）；',
		'2.6.目的地名称：显示车辆异动目的地名称；',
		'2.7.异动类型：显示车辆异动类型，选项包括：维修、保养、年审、其他；',
		'2.8.预计异动里程（km）：显示车辆预计异动里程；',
		'2.9.车牌号：显示车牌号；',
		'2.10.异动开始里程（km）：显示车辆异动开始里程；',
		'2.11.异动开始电量（kWh）：显示车辆异动开始电量；',
		'2.12.异动开始氢量：显示车辆异动开始氢量，带单位，单位根据型号参数表获取，分为%和MPa；',
		'2.13.创建人：显示发起人姓名；',
		'2.14.创建时间：显示发起时间，格式为：YYYY-MM-DD HH:MM；',
		'2.15.操作：查看、编辑、撤回、结束异动；',
		'     2.15.1.查看：点击跳转异动-查看页；',
		'     2.15.2.编辑：点击跳转异动-编辑页，只有审批状态为：待提交、驳回、撤回时显示编辑；',
		'     2.15.3.撤回：点击进行二次确认，确认后撤回该数据并将审批状态修改为：撤回；',
		'     2.15.4.结束异动：当审批状态为审批完成后显示结束异动，点击跳转异动-结束异动页；',
		'',
		'#历史记录：',
		'3.1.异动开始日期：显示车辆异动开始日期，格式为：YYYY-MM-DD HH:MM；',
		'3.2.异动预计结束日期：显示车辆异动结束日期，格式为：YYYY-MM-DD HH:MM；',
		'3.3.审批状态：分为:待提交、审批中、审批完成、驳回、撤回；',
		'3.4.异动目的地：显示车辆异动目的地，选项包括：停车场、维修站、其他；',
		'3.5.目的地区域：列于目的地名称前方；格式为「省-市」。停车场/维修站/其他三类含义同「进行中」列表 2.5；',
		'3.6.目的地名称：显示车辆异动目的地名称；',
		'3.7.异动类型：显示车辆异动类型，选项包括：维修、保养、年审、其他；',
		'3.8.预计异动里程（km）：显示车辆预计异动里程；',
		'3.9.车牌号：显示车牌号；',
		'3.10.异动开始里程（km）：显示车辆异动开始里程；',
		'3.11.异动结束里程（km）：显示车辆异动结束里程；',
		'3.12.异动开始电量（kWh）：显示车辆异动开始电量；',
		'3.13.异动结束电量（kWh）：显示车辆异动结束电量；',
		'3.14.异动开始氢量：显示车辆异动开始氢量，带单位，单位根据型号参数表获取，分为%和MPa；',
		'3.15.异动结束氢量：显示车辆异动结束氢量，带单位，单位根据型号参数表获取，分为%和MPa；',
		'3.16.创建人：显示发起人姓名；',
		'3.17.创建时间：显示发起时间，格式为：YYYY-MM-DD HH:MM；',
		'3.18.操作：查看；',
		'     3.18.1.查看：点击跳转异动-查看页；',
		'',
		'3.列表右下方为分页功能，支持单页显示条数设置；'
	].join('\n');

	var listState = useState(function () {
		return [
			{
				id: 'mv1',
				moveStartAt: '2026-02-20 09:30',
				moveEndExpectedAt: '2026-02-22 18:00',
				approvalStatus: '待提交',
				destination: '维修站',
				destinationName: '天河氢能维修中心',
				destinationRegionText: '广东省-广州市',
				moveType: '维修',
				expectedMileageKm: '45.5',
				plateNo: '粤A12345',
				startMileageKm: '15230.12',
				startElectricKwh: '68.40',
				startHydrogen: '28.30',
				h2Unit: 'MPa',
				creatorName: '张明',
				createTime: '2026-02-20 08:10'
			},
			{
				id: 'mv2',
				moveStartAt: '2026-02-21 14:00',
				moveEndExpectedAt: '2026-02-21 17:30',
				approvalStatus: '审批中',
				destination: '停车场',
				destinationName: '西湖景区停车场',
				destinationRegionText: '浙江省-杭州市',
				moveType: '保养',
				expectedMileageKm: '12.0',
				plateNo: '浙A11111',
				startMileageKm: '12010.00',
				startElectricKwh: '55.20',
				startHydrogen: '60.00',
				h2Unit: '%',
				creatorName: '王芳',
				createTime: '2026-02-21 13:20'
			},
			{
				id: 'mv3',
				moveStartAt: '2026-02-24 08:15',
				moveEndExpectedAt: '2026-02-24 12:00',
				approvalStatus: '审批完成',
				destination: '其他',
				destinationName: '车管所检测线',
				destinationRegionText: '广东省-深圳市',
				moveType: '年审',
				expectedMileageKm: '8.2',
				plateNo: '粤B11111',
				startMileageKm: '8020.50',
				startElectricKwh: '62.10',
				startHydrogen: '55.00',
				h2Unit: '%',
				creatorName: '李华',
				createTime: '2026-02-24 07:50'
			},
			{
				id: 'mv4',
				moveStartAt: '2026-02-25 10:00',
				moveEndExpectedAt: '2026-02-26 09:00',
				approvalStatus: '驳回',
				destination: '维修站',
				destinationName: '张江服务站',
				destinationRegionText: '上海市-上海市',
				moveType: '其他',
				expectedMileageKm: '30.0',
				plateNo: '沪A30003',
				startMileageKm: '9800.00',
				startElectricKwh: '69.00',
				startHydrogen: '26.00',
				h2Unit: 'MPa',
				creatorName: '赵强',
				createTime: '2026-02-25 09:40'
			},
			{
				id: 'mv5',
				moveStartAt: '2026-02-26 16:20',
				moveEndExpectedAt: '2026-02-27 10:00',
				approvalStatus: '撤回',
				destination: '停车场',
				destinationName: '宁波江北停车场',
				destinationRegionText: '浙江省-宁波市',
				moveType: '维修',
				expectedMileageKm: '22.8',
				plateNo: '浙B22222',
				startMileageKm: '15010.00',
				startElectricKwh: '58.00',
				startHydrogen: '22.10',
				h2Unit: 'MPa',
				creatorName: '陈静',
				createTime: '2026-02-26 15:55'
			},
			{
				id: 'mv6',
				moveStartAt: '2026-02-27 07:45',
				moveEndExpectedAt: '2026-02-27 19:00',
				approvalStatus: '审批中',
				destination: '维修站',
				destinationName: '苏州园区快修站',
				destinationRegionText: '江苏省-苏州市',
				moveType: '保养',
				expectedMileageKm: '18.6',
				plateNo: '苏E88888',
				startMileageKm: '23105.80',
				startElectricKwh: '42.50',
				startHydrogen: '45.20',
				h2Unit: '%',
				creatorName: '张明',
				createTime: '2026-02-27 07:20'
			},
			{
				id: 'mv7',
				moveStartAt: '2026-02-27 11:00',
				moveEndExpectedAt: '2026-02-28 17:30',
				approvalStatus: '审批完成',
				destination: '其他',
				destinationName: '顺义综合检测场',
				destinationRegionText: '北京市-北京市',
				moveType: '年审',
				expectedMileageKm: '35.0',
				plateNo: '京A66666',
				startMileageKm: '8890.00',
				startElectricKwh: '71.20',
				startHydrogen: '31.50',
				h2Unit: 'MPa',
				creatorName: '王芳',
				createTime: '2026-02-27 10:35'
			},
			{
				id: 'mv8',
				moveStartAt: '2026-02-28 08:30',
				moveEndExpectedAt: '2026-02-28 14:00',
				approvalStatus: '待提交',
				destination: '停车场',
				destinationName: '两江新区枢纽停车场',
				destinationRegionText: '重庆市-重庆市',
				moveType: '其他',
				expectedMileageKm: '6.5',
				plateNo: '渝A99999',
				startMileageKm: '17660.25',
				startElectricKwh: '48.90',
				startHydrogen: '58.00',
				h2Unit: '%',
				creatorName: '李华',
				createTime: '2026-02-28 08:05'
			},
			{
				id: 'mv9',
				moveStartAt: '2026-02-28 13:15',
				moveEndExpectedAt: '2026-03-01 09:00',
				approvalStatus: '驳回',
				destination: '维修站',
				destinationName: '成都高新氢能维保站',
				destinationRegionText: '四川省-成都市',
				moveType: '维修',
				expectedMileageKm: '52.3',
				plateNo: '川A77777',
				startMileageKm: '34500.00',
				startElectricKwh: '33.60',
				startHydrogen: '24.80',
				h2Unit: 'MPa',
				creatorName: '赵强',
				createTime: '2026-02-28 12:50'
			},
			{
				id: 'mv10',
				moveStartAt: '2026-03-01 06:00',
				moveEndExpectedAt: '2026-03-01 11:45',
				approvalStatus: '审批完成',
				destination: '其他',
				destinationName: '青岛港务临时停放点',
				destinationRegionText: '山东省-青岛市',
				moveType: '保养',
				expectedMileageKm: '15.0',
				plateNo: '鲁B55555',
				startMileageKm: '11220.00',
				startElectricKwh: '65.00',
				startHydrogen: '62.50',
				h2Unit: '%',
				creatorName: '陈静',
				createTime: '2026-03-01 05:40'
			},
			// 历史记录样例（已结束异动，共 10 条）
			{
				id: 'mv-h-01',
				moveStartAt: '2025-11-08 08:00',
				moveEndExpectedAt: '2025-11-10 18:00',
				approvalStatus: '审批完成',
				destination: '维修站',
				destinationName: '广州白云氢能维保中心',
				destinationRegionText: '广东省-广州市',
				moveType: '维修',
				expectedMileageKm: '28.5',
				plateNo: '粤A12345',
				startMileageKm: '14800.00',
				startElectricKwh: '70.00',
				startHydrogen: '30.00',
				h2Unit: 'MPa',
				creatorName: '张明',
				createTime: '2025-11-07 16:20',
				movementEndedAt: '2025-11-10 19:30',
				movementEnded: true
			},
			{
				id: 'mv-h-02',
				moveStartAt: '2025-11-15 09:30',
				moveEndExpectedAt: '2025-11-15 17:00',
				approvalStatus: '审批完成',
				destination: '停车场',
				destinationName: '深圳湾口岸停车场',
				destinationRegionText: '广东省-深圳市',
				moveType: '保养',
				expectedMileageKm: '15.2',
				plateNo: '粤B11111',
				startMileageKm: '9200.50',
				startElectricKwh: '58.30',
				startHydrogen: '62.00',
				h2Unit: '%',
				creatorName: '王芳',
				createTime: '2025-11-14 14:00',
				movementEndedAt: '2025-11-15 17:45',
				movementEnded: true
			},
			{
				id: 'mv-h-03',
				moveStartAt: '2025-12-02 07:15',
				moveEndExpectedAt: '2025-12-02 12:30',
				approvalStatus: '审批完成',
				destination: '其他',
				destinationName: '杭州车管所年检线',
				destinationRegionText: '浙江省-杭州市',
				moveType: '年审',
				expectedMileageKm: '9.8',
				plateNo: '浙A11111',
				startMileageKm: '11550.20',
				startElectricKwh: '64.00',
				startHydrogen: '48.50',
				h2Unit: '%',
				creatorName: '李华',
				createTime: '2025-12-01 18:10',
				movementEndedAt: '2025-12-02 13:20',
				movementEnded: true
			},
			{
				id: 'mv-h-04',
				moveStartAt: '2025-12-18 13:00',
				moveEndExpectedAt: '2025-12-20 09:00',
				approvalStatus: '审批完成',
				destination: '维修站',
				destinationName: '上海嘉定氢能服务站',
				destinationRegionText: '上海市-上海市',
				moveType: '维修',
				expectedMileageKm: '42.0',
				plateNo: '沪A30003',
				startMileageKm: '10100.00',
				startElectricKwh: '66.50',
				startHydrogen: '27.20',
				h2Unit: 'MPa',
				creatorName: '赵强',
				createTime: '2025-12-17 11:30',
				movementEndedAt: '2025-12-20 10:15',
				movementEnded: true
			},
			{
				id: 'mv-h-05',
				moveStartAt: '2026-01-05 10:20',
				moveEndExpectedAt: '2026-01-06 16:00',
				approvalStatus: '审批完成',
				destination: '停车场',
				destinationName: '南京南站枢纽停车场',
				destinationRegionText: '江苏省-南京市',
				moveType: '其他',
				expectedMileageKm: '19.6',
				plateNo: '苏E88888',
				startMileageKm: '22800.00',
				startElectricKwh: '45.80',
				startHydrogen: '50.00',
				h2Unit: '%',
				creatorName: '陈静',
				createTime: '2026-01-04 09:45',
				movementEndedAt: '2026-01-06 17:00',
				movementEnded: true
			},
			{
				id: 'mv-h-06',
				moveStartAt: '2026-01-12 08:45',
				moveEndExpectedAt: '2026-01-12 15:30',
				approvalStatus: '审批完成',
				destination: '维修站',
				destinationName: '北京亦庄氢能维修站',
				destinationRegionText: '北京市-北京市',
				moveType: '保养',
				expectedMileageKm: '11.3',
				plateNo: '京A66666',
				startMileageKm: '8750.00',
				startElectricKwh: '72.00',
				startHydrogen: '32.00',
				h2Unit: 'MPa',
				creatorName: '王芳',
				createTime: '2026-01-11 17:00',
				movementEndedAt: '2026-01-12 16:10',
				movementEnded: true
			},
			{
				id: 'mv-h-07',
				moveStartAt: '2026-01-22 14:00',
				moveEndExpectedAt: '2026-01-23 11:00',
				approvalStatus: '审批完成',
				destination: '其他',
				destinationName: '重庆两江新区检测站',
				destinationRegionText: '重庆市-重庆市',
				moveType: '年审',
				expectedMileageKm: '33.0',
				plateNo: '渝A99999',
				startMileageKm: '17200.00',
				startElectricKwh: '49.20',
				startHydrogen: '59.00',
				h2Unit: '%',
				creatorName: '李华',
				createTime: '2026-01-22 08:30',
				movementEndedAt: '2026-01-23 12:00',
				movementEnded: true
			},
			{
				id: 'mv-h-08',
				moveStartAt: '2026-02-01 09:00',
				moveEndExpectedAt: '2026-02-03 18:00',
				approvalStatus: '审批完成',
				destination: '维修站',
				destinationName: '成都龙泉驿维保基地',
				destinationRegionText: '四川省-成都市',
				moveType: '维修',
				expectedMileageKm: '55.8',
				plateNo: '川A77777',
				startMileageKm: '33800.00',
				startElectricKwh: '35.00',
				startHydrogen: '25.00',
				h2Unit: 'MPa',
				creatorName: '赵强',
				createTime: '2026-01-31 16:40',
				movementEndedAt: '2026-02-03 19:00',
				movementEnded: true
			},
			{
				id: 'mv-h-09',
				moveStartAt: '2026-02-10 06:30',
				moveEndExpectedAt: '2026-02-10 14:00',
				approvalStatus: '审批完成',
				destination: '停车场',
				destinationName: '青岛前湾港停车场',
				destinationRegionText: '山东省-青岛市',
				moveType: '保养',
				expectedMileageKm: '12.5',
				plateNo: '鲁B55555',
				startMileageKm: '11050.00',
				startElectricKwh: '63.80',
				startHydrogen: '61.00',
				h2Unit: '%',
				creatorName: '陈静',
				createTime: '2026-02-09 20:15',
				movementEndedAt: '2026-02-10 15:30',
				movementEnded: true
			},
			{
				id: 'mv-h-10',
				moveStartAt: '2026-02-18 11:20',
				moveEndExpectedAt: '2026-02-19 10:00',
				approvalStatus: '审批完成',
				destination: '其他',
				destinationName: '宁波北仑港区临时点',
				destinationRegionText: '浙江省-宁波市',
				moveType: '其他',
				expectedMileageKm: '24.0',
				plateNo: '浙B22222',
				startMileageKm: '14950.00',
				startElectricKwh: '57.00',
				startHydrogen: '23.50',
				h2Unit: 'MPa',
				creatorName: '张明',
				createTime: '2026-02-17 15:00',
				movementEndedAt: '2026-02-19 11:20',
				movementEnded: true
			}
		];
	});
	var list = listState[0];
	var setList = listState[1];

	function matchRange(valStr, range) {
		if (!range || !range[0] || !range[1]) return true;
		var s = '';
		var e = '';
		if (range[0] && range[0].format) s = range[0].format('YYYY-MM-DD');
		if (range[1] && range[1].format) e = range[1].format('YYYY-MM-DD');
		if (!s && !e) return true;
		var v = String(valStr || '').slice(0, 10);
		if (s && v < s) return false;
		if (e && v > e) return false;
		return true;
	}

	function applyFilters(rows) {
		return (rows || []).filter(function (r) {
			if (!matchRange(r.moveStartAt, applied.moveStartRange)) return false;
			if (applied.plateNo && r.plateNo !== applied.plateNo) return false;
			if (applied.moveTypes && applied.moveTypes.length > 0) {
				if (applied.moveTypes.indexOf(r.moveType) < 0) return false;
			}
			return true;
		});
	}

	var filtered = useMemo(function () {
		var base = applyFilters(list);
		if (listTab === 'ongoing') {
			return base.filter(function (r) { return !isMovementEnded(r); });
		}
		return base.filter(function (r) { return isMovementEnded(r); });
	}, [list, applied, listTab]);

	var paged = useMemo(function () {
		var start = (page - 1) * pageSize;
		return filtered.slice(start, start + pageSize);
	}, [filtered, page, pageSize]);

	var handleQuery = useCallback(function () {
		setApplied(Object.assign({}, draft));
		setPage(1);
	}, [draft]);

	var handleReset = useCallback(function () {
		var empty = { moveStartRange: null, moveTypes: [], plateNo: undefined };
		setDraft(empty);
		setApplied(empty);
		setPage(1);
	}, []);

	var handleAdd = useCallback(function () {
		message.info('跳转异动-新增页（原型，表单与编辑页一致，联调时按路由区分新建/编辑）');
	}, []);

	function fmtNowYMDHM() {
		var d = new Date();
		var p2 = function (n) { return n < 10 ? '0' + n : '' + n; };
		return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
	}

	var handleEndMovement = useCallback(function (recordId) {
		Modal.confirm({
			title: '确认结束异动',
			content: '确定结束该条异动吗？确认后将归档至「历史记录」，仅可查看。',
			okText: '确认结束',
			cancelText: '取消',
			onOk: function () {
				var endedAt = fmtNowYMDHM();
				setList(function (prev) {
					return (prev || []).map(function (row) {
						if (row.id !== recordId) return row;
						return Object.assign({}, row, { movementEndedAt: endedAt, movementEnded: true });
					});
				});
				message.success('结束异动成功');
			}
		});
	}, []);

	var handleWithdrawMovement = useCallback(function (recordId) {
		Modal.confirm({
			title: '确认撤回',
			content: '确定要撤回该条异动申请吗？确认后审批状态将变更为「撤回」，可再次编辑后提交。',
			okText: '确认撤回',
			cancelText: '取消',
			onOk: function () {
				setList(function (prev) {
					return (prev || []).map(function (row) {
						if (row.id !== recordId) return row;
						return Object.assign({}, row, { approvalStatus: '撤回' });
					});
				});
				message.success('撤回成功');
			}
		});
	}, []);

	function formatStartHydrogenForExport(r) {
		var u = r.h2Unit || '';
		if (r.startHydrogen == null || r.startHydrogen === '') return '-';
		return String(r.startHydrogen) + (u ? ' ' + u : '');
	}

	var handleExport = useCallback(function () {
		var rows = filtered;
		if (!rows || rows.length === 0) {
			message.warning('当前无数据可导出');
			return;
		}
		var escapeCsv = function (v) {
			var s = v == null ? '' : String(v);
			if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1 || s.indexOf('\r') !== -1) {
				return '"' + s.replace(/"/g, '""') + '"';
			}
			return s;
		};
		var headers = [
			'异动开始日期',
			'异动预计结束日期',
			'审批状态',
			'异动目的地',
			'目的地区域',
			'目的地名称',
			'异动类型',
			'预计异动里程（km）',
			'车牌号',
			'异动开始里程（km）',
			'异动开始电量（kWh）',
			'异动开始氢量',
			'创建人',
			'创建时间'
		];
		var rowToCells = function (r) {
			return [
				fmtYMDHM(r.moveStartAt),
				fmtYMDHM(r.moveEndExpectedAt),
				r.approvalStatus,
				r.destination,
				r.destinationRegionText != null && String(r.destinationRegionText).trim() ? r.destinationRegionText : '-',
				r.destinationName,
				r.moveType,
				r.expectedMileageKm,
				r.plateNo,
				r.startMileageKm,
				r.startElectricKwh,
				formatStartHydrogenForExport(r),
				r.creatorName,
				fmtYMDHM(r.createTime)
			];
		};
		var csv = headers.map(escapeCsv).join(',') + '\n';
		rows.forEach(function (r) {
			csv += rowToCells(r).map(escapeCsv).join(',') + '\n';
		});
		var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
		var url = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
		a.download = '异动管理导出_' + (listTab === 'ongoing' ? '进行中' : '历史记录') + '_' + new Date().getTime() + '.csv';
		a.click();
		URL.revokeObjectURL(url);
		message.success('已导出 ' + rows.length + ' 条记录');
	}, [filtered, listTab]);

	var columns = useMemo(function () {
		return [
			{ title: '异动开始日期', dataIndex: 'moveStartAt', key: 'moveStartAt', width: 160, render: function (v) { return fmtYMDHM(v); } },
			{ title: '异动预计结束日期', dataIndex: 'moveEndExpectedAt', key: 'moveEndExpectedAt', width: 170, render: function (v) { return fmtYMDHM(v); } },
			{ title: '审批状态', dataIndex: 'approvalStatus', key: 'approvalStatus', width: 100 },
			{ title: '异动目的地', dataIndex: 'destination', key: 'destination', width: 110 },
			{
				title: '目的地区域',
				dataIndex: 'destinationRegionText',
				key: 'destinationRegionText',
				width: 150,
				ellipsis: true,
				render: function (v) {
					return v != null && String(v).trim() ? String(v) : '-';
				}
			},
			{ title: '目的地名称', dataIndex: 'destinationName', key: 'destinationName', width: 160, ellipsis: true },
			{ title: '异动类型', dataIndex: 'moveType', key: 'moveType', width: 90 },
			{ title: '预计异动里程（km）', dataIndex: 'expectedMileageKm', key: 'expectedMileageKm', width: 150 },
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 110 },
			{ title: '异动开始里程（km）', dataIndex: 'startMileageKm', key: 'startMileageKm', width: 160 },
			{ title: '异动开始电量（kWh）', dataIndex: 'startElectricKwh', key: 'startElectricKwh', width: 160 },
			{
				title: '异动开始氢量',
				key: 'startHydrogen',
				width: 130,
				render: function (_, r) {
					var u = r.h2Unit || '';
					return (r.startHydrogen != null && r.startHydrogen !== '') ? String(r.startHydrogen) + (u ? ' ' + u : '') : '-';
				}
			},
			{ title: '创建人', dataIndex: 'creatorName', key: 'creatorName', width: 100 },
			{ title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160, render: function (v) { return fmtYMDHM(v); } },
			{
				title: '操作',
				key: 'action',
				width: 200,
				fixed: 'right',
				render: function (_, r) {
					var nodes = [
						React.createElement(Button, { key: 'view', type: 'link', size: 'small', onClick: function () { message.info('跳转异动-查看页（原型）ID：' + r.id); } }, '查看')
					];
					if (String(r.approvalStatus || '') === '审批中') {
						nodes.push(React.createElement(Button, {
							key: 'withdraw',
							type: 'link',
							size: 'small',
							danger: true,
							onClick: function () { handleWithdrawMovement(r.id); }
						}, '撤回'));
					}
					if (String(r.approvalStatus || '') === '审批完成' && !isMovementEnded(r)) {
						nodes.push(React.createElement(Button, {
							key: 'end',
							type: 'link',
							size: 'small',
							onClick: function () { handleEndMovement(r.id); }
						}, '结束异动'));
					}
					if (canShowMovementEdit(r.approvalStatus)) {
						nodes.push(React.createElement(Button, { key: 'edit', type: 'link', size: 'small', onClick: function () { message.info('跳转异动-编辑页（原型，表单与新增页一致）ID：' + r.id); } }, '编辑'));
					}
					return React.createElement(React.Fragment, null, nodes);
				}
			}
		];
	}, [handleWithdrawMovement, handleEndMovement]);

	return React.createElement(App, null,
		React.createElement('div', { style: layoutStyle },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 } },
				React.createElement(Breadcrumb, { items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '异动管理' }] }),
				React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function () { setRequirementModalOpen(true); } }, '查看需求说明')
			),

			React.createElement(Modal, {
				title: '需求说明',
				open: requirementModalOpen,
				onCancel: function () { setRequirementModalOpen(false); },
				width: 720,
				footer: React.createElement(Button, { onClick: function () { setRequirementModalOpen(false); } }, '关闭'),
				bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
			}, React.createElement('div', { style: { whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, color: 'rgba(0,0,0,0.85)' } }, requirementDocContent)),

			React.createElement(Card, { style: { marginBottom: 16 } },
				React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', alignItems: 'start' } },
					React.createElement('div', { style: filterItemStyle },
						React.createElement('div', { style: filterLabelStyle }, '异动开始日期'),
						React.createElement(RangePicker, {
							style: filterControlStyle,
							value: draft.moveStartRange,
							onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { moveStartRange: v }); }); },
							placeholder: ['开始日期', '结束日期'],
							showTime: false
						})
					),
					React.createElement('div', { style: filterItemStyle },
						React.createElement('div', { style: filterLabelStyle }, '异动类型'),
						React.createElement(Select, {
							mode: 'multiple',
							placeholder: '请选择异动类型（可多选）',
							style: filterControlStyle,
							value: draft.moveTypes,
							onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { moveTypes: v || [] }); }); },
							allowClear: true,
							options: moveTypeOptions,
							maxTagCount: 'responsive'
						})
					),
					React.createElement('div', { style: filterItemStyle },
						React.createElement('div', { style: filterLabelStyle }, '车牌号'),
						React.createElement(Select, {
							placeholder: '请输入或选择车牌号',
							style: filterControlStyle,
							value: draft.plateNo,
							onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { plateNo: v }); }); },
							allowClear: true,
							showSearch: true,
							options: plateOptions,
							filterOption: filterOption
						})
					)
				),
				React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
					React.createElement(Button, { onClick: handleReset }, '重置'),
					React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
				)
			),

			React.createElement(Card, null,
				React.createElement('style', null, movementTabsBarStyle),
				React.createElement(Tabs, {
					className: 'movement-list-tabs',
					activeKey: listTab,
					onChange: function (k) {
						setListTab(k);
						setPage(1);
					},
					destroyInactiveTabPane: true,
					tabBarExtraContent: React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
						React.createElement(Button, { type: 'primary', onClick: handleAdd }, '新增'),
						React.createElement(Button, { onClick: handleExport }, '导出')
					),
					tabBarStyle: { marginBottom: 0 },
					items: [
						{
							key: 'ongoing',
							label: '进行中',
							children: React.createElement('div', { style: { marginTop: 16 } },
								React.createElement('style', null, tableSingleLineStyle),
								React.createElement('div', { className: 'movement-list-table' },
									React.createElement(Table, {
										rowKey: 'id',
										columns: columns,
										dataSource: paged,
										scroll: { x: 2390 },
										size: 'small',
										pagination: {
											current: page,
											pageSize: pageSize,
											total: filtered.length,
											showSizeChanger: true,
											showQuickJumper: true,
											showTotal: function (t) { return '共 ' + t + ' 条'; },
											onChange: function (pg, ps) { setPage(pg); if (ps) setPageSize(ps); }
										}
									})
								)
							)
						},
						{
							key: 'history',
							label: '历史记录',
							children: React.createElement('div', { style: { marginTop: 16 } },
								React.createElement('style', null, tableSingleLineStyle),
								React.createElement('div', { className: 'movement-list-table' },
									React.createElement(Table, {
										rowKey: 'id',
										columns: columns,
										dataSource: paged,
										scroll: { x: 2390 },
										size: 'small',
										pagination: {
											current: page,
											pageSize: pageSize,
											total: filtered.length,
											showSizeChanger: true,
											showQuickJumper: true,
											showTotal: function (t) { return '共 ' + t + ' 条'; },
											onChange: function (pg, ps) { setPage(pg); if (ps) setPageSize(ps); }
										}
									})
								)
							)
						}
					]
				})
			)
		)
	);
};
