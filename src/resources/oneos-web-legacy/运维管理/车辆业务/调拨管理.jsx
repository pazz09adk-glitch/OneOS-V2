// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆业务 - 调拨管理（列表页）

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
	var Tabs = antd.Tabs;
	var Select = antd.Select;
	var DatePicker = antd.DatePicker;
	var Cascader = antd.Cascader;
	var message = antd.message;
	var Modal = antd.Modal;
	var Popover = antd.Popover;
	var List = antd.List;

	var RangePicker = DatePicker.RangePicker;

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	function fmtYMDHM(v) {
		if (v === null || v === undefined) return '-';
		var s = String(v).trim();
		if (!s) return '-';
		if (/^\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}/.test(s)) return s.slice(0, 16);
		if (/^\\d{4}-\\d{2}-\\d{2}$/.test(s)) return s + ' 00:00';
		try {
			var d = new Date(s.replace(/-/g, '/'));
			if (isNaN(d.getTime())) return s;
			var p2 = function (n) { return n < 10 ? '0' + n : '' + n; };
			return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
		} catch (e) {
			return s;
		}
	}

	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var tableSingleLineStyle = '.transfer-list-table .ant-table-thead th,.transfer-list-table .ant-table-tbody td{white-space:nowrap;}';

	var regionOptions = useMemo(function () {
		return [
			{ value: 'zhejiang', label: '浙江省', children: [{ value: 'hangzhou', label: '杭州市' }, { value: 'ningbo', label: '宁波市' }, { value: 'jiaxing', label: '嘉兴市' }] },
			{ value: 'shanghai', label: '上海市', children: [{ value: 'shanghai', label: '上海市' }] },
			{ value: 'guangdong', label: '广东省', children: [{ value: 'guangzhou', label: '广州市' }, { value: 'shenzhen', label: '深圳市' }, { value: 'dongguan', label: '东莞市' }] }
		];
	}, []);

	var userOptions = useMemo(function () {
		return [
			{ value: '张明', label: '张明' },
			{ value: '王芳', label: '王芳' },
			{ value: '李华', label: '李华' },
			{ value: '赵强', label: '赵强' },
			{ value: '陈静', label: '陈静' }
		];
	}, []);

	var methodOptions = useMemo(function () {
		return [
			{ value: '第三方运输', label: '第三方运输' },
			{ value: '司机驾驶', label: '司机驾驶' }
		];
	}, []);

	var approvalOptions = useMemo(function () {
		return [
			{ value: '待提交', label: '待提交' },
			{ value: '审批中', label: '审批中' },
			{ value: '审批完成', label: '审批完成' },
			{ value: '审批驳回', label: '审批驳回' },
			{ value: '撤回', label: '撤回' }
		];
	}, []);

	var filterExpandedState = useState(false);
	var filterExpanded = filterExpandedState[0];
	var setFilterExpanded = filterExpandedState[1];

	var draftState = useState({
		transferDateRange: null,
		transferPerson: undefined,
		receiveDateRange: null,
		receivePerson: undefined,
		departRegion: undefined,
		receiveRegion: undefined,
		method: undefined,
		bizApprovalStatus: undefined,
		opsApprovalStatus: undefined
	});
	var draft = draftState[0];
	var setDraft = draftState[1];

	var appliedState = useState({
		transferDateRange: null,
		transferPerson: undefined,
		receiveDateRange: null,
		receivePerson: undefined,
		departRegion: undefined,
		receiveRegion: undefined,
		method: undefined,
		bizApprovalStatus: undefined,
		opsApprovalStatus: undefined
	});
	var applied = appliedState[0];
	var setApplied = appliedState[1];

	var tabState = useState('in_progress');
	var tab = tabState[0];
	var setTab = tabState[1];

	var pageState = useState(1);
	var page = pageState[0];
	var setPage = pageState[1];
	var pageSizeState = useState(20);
	var pageSize = pageSizeState[0];
	var setPageSize = pageSizeState[1];

	var requirementModalState = useState(false);
	var requirementModalOpen = requirementModalState[0];
	var setRequirementModalOpen = requirementModalState[1];

	var requirementDocContent = [
		'一个「数字化资产ONEOS运管平台」中的「调拨管理」模块',
		'#面包屑：运维管理-车辆业务-调拨管理',
		'1.筛选：',
		'1.1.调拨日期：日期选择器，支持单输入框双日历进行开始-结束时间搜索；',
		'1.2.调拨人：选择器，支持输入框输入内容模糊搜索下拉选择对应调拨人，调拨人来自用户表；',
		'1.3.接收日期：日期选择器，支持单输入框双日历进行开始-结束时间搜索；',
		'1.4.接收人：选择器，支持输入框输入内容模糊搜索下拉选择对应接收人，接收人来自用户表；',
		'1.5.出发区域：级联地区选择器，省-市2级；',
		'1.6.调拨区域：级联地区选择器，省-市2级；',
		'1.7.调拨方式：选择器，选项为：第三方运输、司机驾驶；',
		'1.8.业务审批状态：选择器，选项为：待提交、审批中、审批完成、审批驳回、撤回；',
		'1.9.运维审批状态：选择器，选项为：待提交、审批中、审批完成、审批驳回、撤回；',
		'',
		'2.列表：分为进行中、历史记录2个tab；tab最右侧为新增、导出；',
		'2.1.进行中：',
		'2.1.1.调拨日期：显示调拨日期，格式为：YYYY-MM-DD HH:MM；',
		'2.1.2.业务审批状态：待提交、审批中、审批完成、驳回、撤回；',
		'2.1.3.运维审批状态：待提交、审批中、审批完成、驳回、撤回；',
		'2.1.4.出发区域：显示出发省-市，根据车辆出发时停车场区域获取；',
		'2.1.5.接收区域：显示接受省-市；',
		'2.1.6.调拨原因：显示调拨原因；',
		'2.1.7.车辆数：显示调拨车辆数，点击车辆数显示气泡卡片，卡片中显示列表，列表字段为：品牌、型号、车牌号；',
		'2.1.8.调拨人：显示表单创建人姓名；',
		'2.1.9.调拨方式：显示调拨方式，分为第三方运输、司机运输；',
		'2.1.10.运输负责人：显示调拨车辆对应运输负责人；',
		'2.1.11.运输方联系方式：显示调拨车辆对应运输方联系方式；',
		'2.1.12.接收人员：显示接收人姓名；',
		'2.1.13.创建日期：显示调拨申请创建日期，格式为：YYYY-MM-DD HH:MM；',
		'2.1.14.操作：查看、编辑、撤回、调拨信息、接收信息；',
		'2.1.14.1.编辑：业务审批状态或运维审批状态任意一个为「待提交/撤回/审批驳回」时显示；',
		'2.1.14.2.接收信息：运维审批状态为「审批中/审批完成」时显示；',
		'2.1.14.3.调拨信息：业务审批状态为「审批完成」且运维审批状态为空或「待提交」时显示；',
		'',
		'2.2.历史记录：',
		'2.2.1.调拨日期：显示调拨日期，格式为：YYYY-MM-DD HH:MM；',
		'2.2.2.业务审批状态：待提交、审批中、审批完成、驳回、撤回；',
		'2.2.3.运维审批状态：待提交、审批中、审批完成、驳回、撤回；',
		'2.2.4.出发区域：显示出发省-市，根据车辆出发时停车场区域获取；',
		'2.2.5.接收区域：显示接受省-市；',
		'2.2.6.调拨原因：显示调拨原因；',
		'2.2.7.车辆数：显示调拨车辆数，点击车辆数显示气泡卡片，卡片中显示列表，列表字段为：品牌、型号、车牌号；',
		'2.2.8.调拨人：显示表单创建人姓名；',
		'2.2.9.调拨方式：显示调拨方式，分为第三方运输、司机运输；',
		'2.2.10.运输负责人：显示调拨车辆对应运输负责人；',
		'2.2.11.运输方联系方式：显示调拨车辆对应运输方联系方式；',
		'2.2.12.接收人员：显示接收人姓名；',
		'2.2.13.接收时间：显示接收时间，格式为：YYYY-MM-DD HH:MM；',
		'2.2.14.接收区域：显示接受区域，停车场或其他；',
		'2.2.15.停车场/停车地址：显示停车场名称或停车地址；',
		'2.2.16.创建日期：显示调拨申请创建日期，格式为：YYYY-MM-DD HH:MM；',
		'2.2.17.操作：查看；'
	].join('\n');

	var listInProgressState = useState(function () {
		return [
			{
				id: 'tp1',
				transferDate: '2026-02-20 09:30',
				departRegionText: '广东省-广州市',
				receiveRegionText: '浙江省-嘉兴市',
				bizApprovalStatus: '待提交',
				opsApprovalStatus: '待提交',
				method: '第三方运输',
				reason: '场站资源调整',
				vehicles: [
					{ brand: '东风', model: 'DFH1180', plateNo: '粤A12345' },
					{ brand: '比亚迪', model: '汉', plateNo: '粤B11111' }
				],
				transferPerson: '张明',
				transportLeader: '周海',
				transportContact: '13800000001',
				receivePerson: '王芳',
				transferInfoStatus: '未填写',
				createDate: '2026-02-20 08:10'
			},
			{
				id: 'tp2',
				transferDate: '2026-02-22 14:10',
				departRegionText: '浙江省-杭州市',
				receiveRegionText: '上海市-上海市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '待提交',
				method: '司机驾驶',
				reason: '项目调度需要',
				vehicles: [
					{ brand: '小鹏', model: 'P7', plateNo: '浙A11111' },
					{ brand: '蔚来', model: 'ET5', plateNo: '浙B22222' },
					{ brand: '福田', model: 'BJ1180', plateNo: '沪A30003' }
				],
				transferPerson: '李华',
				transportLeader: '李华',
				transportContact: '13800000002',
				receivePerson: '赵强',
				transferInfoStatus: '已通过',
				createDate: '2026-02-22 12:40'
			},
			{
				id: 'tp3',
				transferDate: '2026-02-24 11:05',
				departRegionText: '广东省-深圳市',
				receiveRegionText: '浙江省-宁波市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '审批完成',
				method: '第三方运输',
				reason: '维修站资源调整',
				vehicles: [
					{ brand: '比亚迪', model: '汉', plateNo: '粤B11111' }
				],
				transferPerson: '王芳',
				transportLeader: '黄蕾',
				transportContact: '13800000003',
				receivePerson: '陈静',
				transferInfoStatus: '已通过',
				createDate: '2026-02-24 10:20'
			},
			{
				id: 'tp4',
				transferDate: '2026-02-25 16:40',
				departRegionText: '浙江省-嘉兴市',
				receiveRegionText: '上海市-上海市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '待提交',
				method: '司机驾驶',
				reason: '项目调度需要',
				vehicles: [
					{ brand: '蔚来', model: 'ET5', plateNo: '浙B22222' }
				],
				transferPerson: '赵强',
				transportLeader: '赵强',
				transportContact: '13800000004',
				receivePerson: '李华',
				transferInfoStatus: '未填写',
				createDate: '2026-02-25 15:55'
			},
			{
				id: 'tp5',
				transferDate: '2026-02-26 09:15',
				departRegionText: '上海市-上海市',
				receiveRegionText: '广东省-广州市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '审批中',
				method: '第三方运输',
				reason: '车辆调拨申请驳回样例',
				vehicles: [
					{ brand: '福田', model: 'BJ1180', plateNo: '沪A30003' },
					{ brand: '东风', model: 'DFH1180', plateNo: '粤A12345' }
				],
				transferPerson: '陈静',
				transportLeader: '周海',
				transportContact: '13800000005',
				receivePerson: '张明',
				transferInfoStatus: '未填写',
				createDate: '2026-02-26 08:30'
			},
			{
				id: 'tp6',
				transferDate: '2026-02-27 13:30',
				departRegionText: '浙江省-杭州市',
				receiveRegionText: '浙江省-嘉兴市',
				bizApprovalStatus: '撤回',
				opsApprovalStatus: '待提交',
				method: '司机驾驶',
				reason: '计划变更，撤回申请',
				vehicles: [
					{ brand: '小鹏', model: 'P7', plateNo: '浙A11111' }
				],
				transferPerson: '张明',
				transportLeader: '张明',
				transportContact: '13800000006',
				receivePerson: '王芳',
				transferInfoStatus: '未填写',
				createDate: '2026-02-27 12:45'
			},
			{
				id: 'tp7',
				transferDate: '2026-02-28 08:50',
				departRegionText: '广东省-东莞市',
				receiveRegionText: '广东省-深圳市',
				bizApprovalStatus: '审批中',
				opsApprovalStatus: '待提交',
				method: '第三方运输',
				reason: '跨区域调拨',
				vehicles: [
					{ brand: '东风', model: 'DFH1180', plateNo: '粤A12345' },
					{ brand: '福田', model: 'BJ1180', plateNo: '沪A30003' }
				],
				transferPerson: '李华',
				transportLeader: '黄蕾',
				transportContact: '13800000007',
				receivePerson: '赵强',
				transferInfoStatus: '未填写',
				createDate: '2026-02-28 08:05'
			},
			{
				id: 'tp8',
				transferDate: '2026-03-01 10:10',
				departRegionText: '浙江省-宁波市',
				receiveRegionText: '上海市-上海市',
				bizApprovalStatus: '待提交',
				opsApprovalStatus: '待提交',
				method: '司机驾驶',
				reason: '项目新增点位支持',
				vehicles: [
					{ brand: '蔚来', model: 'ET5', plateNo: '浙B22222' },
					{ brand: '小鹏', model: 'P7', plateNo: '浙A11111' }
				],
				transferPerson: '王芳',
				transportLeader: '王芳',
				transportContact: '13800000008',
				receivePerson: '陈静',
				transferInfoStatus: '未填写',
				createDate: '2026-03-01 09:30'
			},
			{
				id: 'tp9',
				transferDate: '2026-03-02 15:25',
				departRegionText: '上海市-上海市',
				receiveRegionText: '浙江省-杭州市',
				bizApprovalStatus: '审批中',
				opsApprovalStatus: '待提交',
				method: '第三方运输',
				reason: '场站容量调整',
				vehicles: [
					{ brand: '福田', model: 'BJ1180', plateNo: '沪A30003' }
				],
				transferPerson: '赵强',
				transportLeader: '周海',
				transportContact: '13800000009',
				receivePerson: '李华',
				transferInfoStatus: '未填写',
				createDate: '2026-03-02 14:40'
			},
			{
				id: 'tp10',
				transferDate: '2026-03-03 09:05',
				departRegionText: '浙江省-嘉兴市',
				receiveRegionText: '广东省-广州市',
				bizApprovalStatus: '待提交',
				opsApprovalStatus: '待提交',
				method: '第三方运输',
				reason: '车辆调拨支持新项目',
				vehicles: [
					{ brand: '小鹏', model: 'P7', plateNo: '浙A11111' },
					{ brand: '比亚迪', model: '汉', plateNo: '粤B11111' },
					{ brand: '福田', model: 'BJ1180', plateNo: '沪A30003' },
					{ brand: '蔚来', model: 'ET5', plateNo: '浙B22222' }
				],
				transferPerson: '陈静',
				transportLeader: '黄蕾',
				transportContact: '13800000010',
				receivePerson: '张明',
				transferInfoStatus: '未填写',
				createDate: '2026-03-03 08:20'
			}
		];
	});
	var listInProgress = listInProgressState[0];
	var setListInProgress = listInProgressState[1];

	var listHistory = useMemo(function () {
		return [
			{
				id: 'th1',
				transferDate: '2026-01-10 10:00',
				departRegionText: '上海市-上海市',
				receiveRegionText: '广东省-深圳市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '审批完成',
				method: '第三方运输',
				reason: '场站资源调整',
				vehicles: [
					{ brand: '福田', model: 'BJ1180', plateNo: '沪A30003' },
					{ brand: '东风', model: 'DFH1180', plateNo: '粤A12345' }
				],
				transferPerson: '张明',
				transportLeader: '周海',
				transportContact: '13800001001',
				receivePerson: '陈静',
				receiveTime: '2026-01-12 18:20',
				receiveAreaType: '停车场',
				parkingOrAddress: '南山科技园停车场',
				createDate: '2026-01-09 16:45'
			},
			{
				id: 'th2',
				transferDate: '2026-01-15 09:30',
				departRegionText: '广东省-广州市',
				receiveRegionText: '浙江省-杭州市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '审批完成',
				method: '司机驾驶',
				reason: '项目调度需要',
				vehicles: [
					{ brand: '东风', model: 'DFH1180', plateNo: '粤A12345' }
				],
				transferPerson: '王芳',
				transportLeader: '王芳',
				transportContact: '13800001002',
				receivePerson: '赵强',
				receiveTime: '2026-01-17 14:10',
				receiveAreaType: '其他',
				parkingOrAddress: '杭州市西湖区文三路 88 号',
				createDate: '2026-01-14 18:00'
			},
			{
				id: 'th3',
				transferDate: '2026-01-20 16:05',
				departRegionText: '浙江省-宁波市',
				receiveRegionText: '广东省-深圳市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '审批完成',
				method: '第三方运输',
				reason: '场站资源调整',
				vehicles: [
					{ brand: '蔚来', model: 'ET5', plateNo: '浙B22222' },
					{ brand: '比亚迪', model: '汉', plateNo: '粤B11111' }
				],
				transferPerson: '李华',
				transportLeader: '黄蕾',
				transportContact: '13800001003',
				receivePerson: '陈静',
				receiveTime: '2026-01-22 10:30',
				receiveAreaType: '停车场',
				parkingOrAddress: '南山科技园停车场',
				createDate: '2026-01-20 15:15'
			},
			{
				id: 'th4',
				transferDate: '2026-01-25 11:20',
				departRegionText: '上海市-上海市',
				receiveRegionText: '广东省-东莞市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '审批完成',
				method: '第三方运输',
				reason: '跨区域调拨',
				vehicles: [
					{ brand: '福田', model: 'BJ1180', plateNo: '沪A30003' }
				],
				transferPerson: '张明',
				transportLeader: '周海',
				transportContact: '13800001004',
				receivePerson: '王芳',
				receiveTime: '2026-01-27 19:45',
				receiveAreaType: '停车场',
				parkingOrAddress: '松山湖停车场',
				createDate: '2026-01-25 10:40'
			},
			{
				id: 'th5',
				transferDate: '2026-01-28 08:50',
				departRegionText: '广东省-深圳市',
				receiveRegionText: '浙江省-嘉兴市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '审批完成',
				method: '司机驾驶',
				reason: '项目新增点位支持',
				vehicles: [
					{ brand: '比亚迪', model: '汉', plateNo: '粤B11111' },
					{ brand: '小鹏', model: 'P7', plateNo: '浙A11111' }
				],
				transferPerson: '陈静',
				transportLeader: '陈静',
				transportContact: '13800001005',
				receivePerson: '李华',
				receiveTime: '2026-01-30 16:10',
				receiveAreaType: '其他',
				parkingOrAddress: '嘉兴市秀洲区中山西路 66 号',
				createDate: '2026-01-28 08:05'
			},
			{
				id: 'th6',
				transferDate: '2026-02-02 14:30',
				departRegionText: '浙江省-杭州市',
				receiveRegionText: '上海市-上海市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '审批完成',
				method: '第三方运输',
				reason: '场站容量调整',
				vehicles: [
					{ brand: '小鹏', model: 'P7', plateNo: '浙A11111' }
				],
				transferPerson: '赵强',
				transportLeader: '周海',
				transportContact: '13800001006',
				receivePerson: '张明',
				receiveTime: '2026-02-04 09:20',
				receiveAreaType: '停车场',
				parkingOrAddress: '张江园区停车场',
				createDate: '2026-02-02 13:45'
			},
			{
				id: 'th7',
				transferDate: '2026-02-05 10:10',
				departRegionText: '广东省-东莞市',
				receiveRegionText: '广东省-深圳市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '审批完成',
				method: '司机驾驶',
				reason: '场站资源调整',
				vehicles: [
					{ brand: '东风', model: 'DFH1180', plateNo: '粤A12345' },
					{ brand: '福田', model: 'BJ1180', plateNo: '沪A30003' }
				],
				transferPerson: '李华',
				transportLeader: '李华',
				transportContact: '13800001007',
				receivePerson: '陈静',
				receiveTime: '2026-02-07 18:30',
				receiveAreaType: '停车场',
				parkingOrAddress: '南山科技园停车场',
				createDate: '2026-02-05 09:20'
			},
			{
				id: 'th8',
				transferDate: '2026-02-08 15:40',
				departRegionText: '上海市-上海市',
				receiveRegionText: '浙江省-宁波市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '审批完成',
				method: '第三方运输',
				reason: '项目调度需要',
				vehicles: [
					{ brand: '福田', model: 'BJ1180', plateNo: '沪A30003' }
				],
				transferPerson: '张明',
				transportLeader: '周海',
				transportContact: '13800001008',
				receivePerson: '王芳',
				receiveTime: '2026-02-10 11:15',
				receiveAreaType: '停车场',
				parkingOrAddress: '宁波江北停车场',
				createDate: '2026-02-08 14:50'
			},
			{
				id: 'th9',
				transferDate: '2026-02-12 09:00',
				departRegionText: '浙江省-嘉兴市',
				receiveRegionText: '广东省-广州市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '审批完成',
				method: '第三方运输',
				reason: '车辆调拨支持新项目',
				vehicles: [
					{ brand: '小鹏', model: 'P7', plateNo: '浙A11111' },
					{ brand: '蔚来', model: 'ET5', plateNo: '浙B22222' }
				],
				transferPerson: '陈静',
				transportLeader: '黄蕾',
				transportContact: '13800001009',
				receivePerson: '赵强',
				receiveTime: '2026-02-14 17:20',
				receiveAreaType: '其他',
				parkingOrAddress: '广州市海珠区新港中路 18 号',
				createDate: '2026-02-12 08:15'
			},
			{
				id: 'th10',
				transferDate: '2026-02-16 13:10',
				departRegionText: '广东省-深圳市',
				receiveRegionText: '上海市-上海市',
				bizApprovalStatus: '审批完成',
				opsApprovalStatus: '审批完成',
				method: '司机驾驶',
				reason: '项目调度需要',
				vehicles: [
					{ brand: '比亚迪', model: '汉', plateNo: '粤B11111' }
				],
				transferPerson: '王芳',
				transportLeader: '王芳',
				transportContact: '13800001010',
				receivePerson: '李华',
				receiveTime: '2026-02-18 09:40',
				receiveAreaType: '停车场',
				parkingOrAddress: '张江园区停车场',
				createDate: '2026-02-16 12:20'
			}
		];
	}, []);

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

	function matchRegionText(text, cascaderVal) {
		if (!cascaderVal || cascaderVal.length < 2) return true;
		var map = {
			zhejiang: '浙江省', shanghai: '上海市', guangdong: '广东省',
			hangzhou: '杭州市', ningbo: '宁波市', jiaxing: '嘉兴市',
			guangzhou: '广州市', shenzhen: '深圳市', dongguan: '东莞市'
		};
		var pt = map[cascaderVal[0]] || '';
		var ct = map[cascaderVal[1]] || '';
		return String(text || '').indexOf(pt + '-' + ct) >= 0;
	}

	function applyFilters(list, isHistory) {
		return (list || []).filter(function (r) {
			if (applied.transferPerson && r.transferPerson !== applied.transferPerson) return false;
			if (applied.receivePerson && r.receivePerson !== applied.receivePerson) return false;
			if (applied.method && r.method !== applied.method) return false;
			if (applied.bizApprovalStatus && r.bizApprovalStatus !== applied.bizApprovalStatus) return false;
			if (applied.opsApprovalStatus && r.opsApprovalStatus !== applied.opsApprovalStatus) return false;
			if (!matchRange(r.transferDate, applied.transferDateRange)) return false;
			if (isHistory) {
				if (!matchRange(r.receiveTime, applied.receiveDateRange)) return false;
			}
			if (!matchRegionText(r.departRegionText, applied.departRegion)) return false;
			if (!matchRegionText(r.receiveRegionText, applied.receiveRegion)) return false;
			return true;
		});
	}

	var filteredInProgress = useMemo(function () { return applyFilters(listInProgress, false); }, [listInProgress, applied]);
	var filteredHistory = useMemo(function () { return applyFilters(listHistory, true); }, [listHistory, applied]);

	var pagedInProgress = useMemo(function () {
		var start = (page - 1) * pageSize;
		return filteredInProgress.slice(start, start + pageSize);
	}, [filteredInProgress, page, pageSize]);

	var pagedHistory = useMemo(function () {
		var start = (page - 1) * pageSize;
		return filteredHistory.slice(start, start + pageSize);
	}, [filteredHistory, page, pageSize]);

	var handleQuery = useCallback(function () {
		setApplied(Object.assign({}, draft));
		setPage(1);
	}, [draft]);

	var handleReset = useCallback(function () {
		var empty = {
			transferDateRange: null,
			transferPerson: undefined,
			receiveDateRange: null,
			receivePerson: undefined,
			departRegion: undefined,
			receiveRegion: undefined,
			method: undefined,
			bizApprovalStatus: undefined,
			opsApprovalStatus: undefined
		};
		setDraft(empty);
		setApplied(empty);
		setPage(1);
	}, []);

	var handleAdd = useCallback(function () { message.info('跳转调拨管理-新增（原型）'); }, []);
	var handleExport = useCallback(function () { message.success('导出（原型）'); }, []);

	var columnsInProgress = useMemo(function () {
		return [
			{ title: '调拨日期', dataIndex: 'transferDate', key: 'transferDate', width: 160, render: function (v) { return fmtYMDHM(v); } },
			{ title: '业务审批状态', dataIndex: 'bizApprovalStatus', key: 'bizApprovalStatus', width: 110 },
			{
				title: '运维审批状态',
				dataIndex: 'opsApprovalStatus',
				key: 'opsApprovalStatus',
				width: 110,
				render: function (v, r) {
					if (String(r && r.bizApprovalStatus ? r.bizApprovalStatus : '') === '待提交') return '-';
					return v || '-';
				}
			},
			{ title: '出发区域', dataIndex: 'departRegionText', key: 'departRegionText', width: 130 },
			{ title: '接收区域', dataIndex: 'receiveRegionText', key: 'receiveRegionText', width: 130 },
			{ title: '调拨原因', dataIndex: 'reason', key: 'reason', width: 160, ellipsis: true },
			{
				title: '车辆数',
				key: 'vehicleCount',
				width: 90,
				render: function (_, r) {
					var vs = (r && r.vehicles) || [];
					var cnt = vs.length;
					if (!cnt) return '-';
					var content = React.createElement('div', { style: { width: 320 } },
						React.createElement('div', { style: { fontWeight: 600, marginBottom: 8 } }, '车辆明细'),
						React.createElement(List, {
							size: 'small',
							dataSource: vs,
							renderItem: function (it) {
								return React.createElement(List.Item, null,
									React.createElement('div', { style: { display: 'flex', width: '100%', gap: 8 } },
										React.createElement('div', { style: { flex: 1, minWidth: 0 } }, (it && it.brand) || '-'),
										React.createElement('div', { style: { flex: 1, minWidth: 0 } }, (it && it.model) || '-'),
										React.createElement('div', { style: { width: 110, textAlign: 'right' } }, (it && it.plateNo) || '-')
									)
								);
							}
						})
					);
					return React.createElement(Popover, { content: content, trigger: 'click', placement: 'bottomLeft' },
						React.createElement(Button, { type: 'link', size: 'small' }, String(cnt))
					);
				}
			},
			{ title: '调拨人', dataIndex: 'transferPerson', key: 'transferPerson', width: 100 },
			{
				title: '调拨方式',
				dataIndex: 'method',
				key: 'method',
				width: 110,
				render: function (v) { return v === '司机驾驶' ? '司机运输' : (v || '-'); }
			},
			{ title: '运输负责人', dataIndex: 'transportLeader', key: 'transportLeader', width: 110 },
			{ title: '运输方联系方式', dataIndex: 'transportContact', key: 'transportContact', width: 130 },
			{ title: '接收人员', dataIndex: 'receivePerson', key: 'receivePerson', width: 100 },
			{ title: '创建日期', dataIndex: 'createDate', key: 'createDate', width: 160, render: function (v) { return fmtYMDHM(v); } },
			{
				title: '操作',
				key: 'action',
				width: 340,
				fixed: 'right',
				render: function (_, r) {
					var bizSt = String(r && r.bizApprovalStatus ? r.bizApprovalStatus : '');
					var opsSt = String(r && r.opsApprovalStatus ? r.opsApprovalStatus : '');
					var showEdit = bizSt === '待提交' || bizSt === '撤回' || bizSt === '审批驳回' || opsSt === '待提交' || opsSt === '撤回' || opsSt === '审批驳回';
					var canRevoke = bizSt === '审批中';
					var rowId = r && r.id;
					var showTransferInfo = bizSt === '审批完成' && (!opsSt || opsSt === '待提交');
					var showReceiveInfo = opsSt === '审批中' || opsSt === '审批完成';
					return React.createElement('span', { style: { display: 'inline-flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' } },
						React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('跳转调拨管理-查看页（原型）ID：' + rowId); } }, '查看'),
						showEdit ? React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('跳转调拨管理-编辑页（原型）ID：' + rowId); } }, '编辑') : null,
						showTransferInfo ? React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('跳转调拨管理-调拨信息页（原型）ID：' + rowId); } }, '调拨信息') : null,
						showReceiveInfo ? React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('跳转调拨管理-接收信息页（原型）ID：' + rowId); } }, '接收信息') : null,
						canRevoke ? React.createElement(Button, {
							type: 'link',
							size: 'small',
							danger: true,
							onClick: function () {
								Modal.confirm({
									title: '是否确认撤回？',
									content: '确认后该调拨单审批状态将变更为「撤回」。若该流程存在多个分支工作流，将按撤回节点回退到对应的前置操作状态（原型展示）。',
									okText: '确认',
									cancelText: '取消',
									onOk: function () {
										setListInProgress(function (prev) {
											return (prev || []).map(function (row) {
												if (row && row.id === rowId) return Object.assign({}, row, { bizApprovalStatus: '撤回', opsApprovalStatus: '撤回' });
												return row;
											});
										});
										message.success('已撤回，业务/运维审批状态已更新为撤回');
									}
								});
							}
						}, '撤回') : null
					);
				}
			}
		];
	}, [setListInProgress]);

	var columnsHistory = useMemo(function () {
		return [
			{ title: '调拨日期', dataIndex: 'transferDate', key: 'transferDate', width: 160, render: function (v) { return fmtYMDHM(v); } },
			{ title: '业务审批状态', dataIndex: 'bizApprovalStatus', key: 'bizApprovalStatus', width: 110 },
			{
				title: '运维审批状态',
				dataIndex: 'opsApprovalStatus',
				key: 'opsApprovalStatus',
				width: 110,
				render: function (v, r) {
					if (String(r && r.bizApprovalStatus ? r.bizApprovalStatus : '') === '待提交') return '-';
					return v || '-';
				}
			},
			{ title: '出发区域', dataIndex: 'departRegionText', key: 'departRegionText', width: 130 },
			{ title: '接收区域（省市）', dataIndex: 'receiveRegionText', key: 'receiveRegionText', width: 140 },
			{ title: '调拨原因', dataIndex: 'reason', key: 'reason', width: 160, ellipsis: true },
			{
				title: '车辆数',
				key: 'vehicleCount',
				width: 90,
				render: function (_, r) {
					var vs = (r && r.vehicles) || [];
					var cnt = vs.length;
					if (!cnt) return '-';
					var content = React.createElement('div', { style: { width: 320 } },
						React.createElement('div', { style: { fontWeight: 600, marginBottom: 8 } }, '车辆明细'),
						React.createElement(List, {
							size: 'small',
							dataSource: vs,
							renderItem: function (it) {
								return React.createElement(List.Item, null,
									React.createElement('div', { style: { display: 'flex', width: '100%', gap: 8 } },
										React.createElement('div', { style: { flex: 1, minWidth: 0 } }, (it && it.brand) || '-'),
										React.createElement('div', { style: { flex: 1, minWidth: 0 } }, (it && it.model) || '-'),
										React.createElement('div', { style: { width: 110, textAlign: 'right' } }, (it && it.plateNo) || '-')
									)
								);
							}
						})
					);
					return React.createElement(Popover, { content: content, trigger: 'click', placement: 'bottomLeft' },
						React.createElement(Button, { type: 'link', size: 'small' }, String(cnt))
					);
				}
			},
			{ title: '调拨人', dataIndex: 'transferPerson', key: 'transferPerson', width: 100 },
			{
				title: '调拨方式',
				dataIndex: 'method',
				key: 'method',
				width: 110,
				render: function (v) { return v === '司机驾驶' ? '司机运输' : (v || '-'); }
			},
			{ title: '运输负责人', dataIndex: 'transportLeader', key: 'transportLeader', width: 110 },
			{ title: '运输方联系方式', dataIndex: 'transportContact', key: 'transportContact', width: 130 },
			{ title: '接收人员', dataIndex: 'receivePerson', key: 'receivePerson', width: 100 },
			{ title: '接收时间', dataIndex: 'receiveTime', key: 'receiveTime', width: 160, render: function (v) { return fmtYMDHM(v); } },
			{ title: '接收区域', dataIndex: 'receiveAreaType', key: 'receiveAreaType', width: 100 },
			{ title: '停车场/停车地址', dataIndex: 'parkingOrAddress', key: 'parkingOrAddress', width: 180, ellipsis: true },
			{ title: '创建日期', dataIndex: 'createDate', key: 'createDate', width: 160, render: function (v) { return fmtYMDHM(v); } },
			{
				title: '操作',
				key: 'action',
				width: 100,
				fixed: 'right',
				render: function (_, r) {
					return React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('跳转调拨管理-查看页（原型）ID：' + r.id); } }, '查看');
				}
			}
		];
	}, []);

	var filterItems = [
		React.createElement('div', { key: 'transferDate', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '调拨日期'),
			React.createElement(RangePicker, { style: filterControlStyle, value: draft.transferDateRange, onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { transferDateRange: v }); }); }, placeholder: ['开始日期', '结束日期'] })
		),
		React.createElement('div', { key: 'transferPerson', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '调拨人'),
			React.createElement(Select, { placeholder: '请输入或选择调拨人', style: filterControlStyle, value: draft.transferPerson, onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { transferPerson: v }); }); }, allowClear: true, showSearch: true, options: userOptions, filterOption: filterOption })
		),
		React.createElement('div', { key: 'receiveDate', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '接收日期'),
			React.createElement(RangePicker, { style: filterControlStyle, value: draft.receiveDateRange, onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { receiveDateRange: v }); }); }, placeholder: ['开始日期', '结束日期'] })
		),
		React.createElement('div', { key: 'receivePerson', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '接收人'),
			React.createElement(Select, { placeholder: '请输入或选择接收人', style: filterControlStyle, value: draft.receivePerson, onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { receivePerson: v }); }); }, allowClear: true, showSearch: true, options: userOptions, filterOption: filterOption })
		),
		React.createElement('div', { key: 'departRegion', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '出发区域'),
			React.createElement(Cascader, { placeholder: '请选择出发区域', style: filterControlStyle, options: regionOptions, value: draft.departRegion, onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { departRegion: v }); }); }, allowClear: true })
		),
		React.createElement('div', { key: 'receiveRegion', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '调拨区域'),
			React.createElement(Cascader, { placeholder: '请选择调拨区域', style: filterControlStyle, options: regionOptions, value: draft.receiveRegion, onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { receiveRegion: v }); }); }, allowClear: true })
		),
		React.createElement('div', { key: 'method', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '调拨方式'),
			React.createElement(Select, { placeholder: '请选择调拨方式', style: filterControlStyle, value: draft.method, onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { method: v }); }); }, allowClear: true, options: methodOptions })
		),
		React.createElement('div', { key: 'bizApprovalStatus', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '业务审批状态'),
			React.createElement(Select, { placeholder: '请选择业务审批状态', style: filterControlStyle, value: draft.bizApprovalStatus, onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { bizApprovalStatus: v }); }); }, allowClear: true, options: approvalOptions })
		),
		React.createElement('div', { key: 'opsApprovalStatus', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '运维审批状态'),
			React.createElement(Select, { placeholder: '请选择运维审批状态', style: filterControlStyle, value: draft.opsApprovalStatus, onChange: function (v) { setDraft(function (p) { return Object.assign({}, p, { opsApprovalStatus: v }); }); }, allowClear: true, options: approvalOptions })
		)
	];

	var filterCount = filterExpanded ? 9 : 3;
	var filterNodes = [];
	for (var i = 0; i < filterCount && i < filterItems.length; i++) filterNodes.push(filterItems[i]);

	var tabItems = useMemo(function () {
		return [
			{
				key: 'in_progress',
				label: '进行中',
				children: React.createElement(Table, {
					rowKey: 'id',
					columns: columnsInProgress,
					dataSource: pagedInProgress,
					scroll: { x: 1850 },
					size: 'small',
					pagination: {
						current: page,
						pageSize: pageSize,
						total: filteredInProgress.length,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: function (t) { return '共 ' + t + ' 条'; },
						onChange: function (pg, ps) { setPage(pg); if (ps) setPageSize(ps); }
					}
				})
			},
			{
				key: 'history',
				label: '历史记录',
				children: React.createElement(Table, {
					rowKey: 'id',
					columns: columnsHistory,
					dataSource: pagedHistory,
					scroll: { x: 2100 },
					size: 'small',
					pagination: {
						current: page,
						pageSize: pageSize,
						total: filteredHistory.length,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: function (t) { return '共 ' + t + ' 条'; },
						onChange: function (pg, ps) { setPage(pg); if (ps) setPageSize(ps); }
					}
				})
			}
		];
	}, [columnsInProgress, columnsHistory, pagedInProgress, pagedHistory, page, pageSize, filteredInProgress.length, filteredHistory.length]);

	return React.createElement(App, null,
		React.createElement('div', { style: layoutStyle },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 } },
				React.createElement(Breadcrumb, { items: [{ title: '运维管理' }, { title: '车辆业务' }, { title: '调拨管理' }] }),
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
				React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px', alignItems: 'start', flex: 1, minWidth: 0 } }, filterNodes),
				React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 } },
					React.createElement(Button, { onClick: handleReset }, '重置'),
					React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询'),
					React.createElement(Button, { type: 'link', size: 'small', onClick: function () { setFilterExpanded(!filterExpanded); } }, filterExpanded ? '收起' : '展开')
				)
			),

			React.createElement(Card, null,
				React.createElement(React.Fragment, null,
					React.createElement('style', null, tableSingleLineStyle),
					React.createElement('div', { className: 'transfer-list-table' },
						React.createElement(Tabs, {
							activeKey: tab,
							onChange: function (k) { setTab(k); setPage(1); },
							tabBarExtraContent: React.createElement('div', { style: { display: 'flex', gap: 8 } },
								React.createElement(Button, { type: 'primary', onClick: handleAdd }, '新增'),
								React.createElement(Button, { onClick: handleExport }, '导出')
							),
							items: tabItems
						})
					)
				)
			)
		)
	);
};

