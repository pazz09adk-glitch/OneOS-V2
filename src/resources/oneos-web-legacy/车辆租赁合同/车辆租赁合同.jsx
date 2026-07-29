// 【重要】必须使用 const Component 作为组件变量名
// 业务管理 - 车辆租赁合同（列表页，租赁合同管理）

const Component = function() {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;
	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Select = antd.Select;
	var Input = antd.Input;
	var Button = antd.Button;
	var Table = antd.Table;
	var Space = antd.Space;
	var Card = antd.Card;
	var DatePicker = antd.DatePicker;
	var Popover = antd.Popover;
	var Tag = antd.Tag;
	var Avatar = antd.Avatar;
	var Dropdown = antd.Dropdown;
	var Modal = antd.Modal;
	var Upload = antd.Upload;
	var message = antd.message;
	var App = antd.App;

	var RangePicker = DatePicker.RangePicker;

	// 筛选展开（默认收起，只显示第一行 3 列）
	var _filterExpanded = useState(false);
	var _contractCode = useState(undefined);
	var _projectName = useState(undefined);
	var _customerName = useState(undefined);
	var _signingCompany = useState(undefined);
	var _approvalStatus = useState(['全部']);
	var _contractStatus = useState(['全部']);
	var _businessDept = useState([]);
	var _businessOwner = useState([]);
	var _contractType = useState(['全部']);
	var _contractApprovalType = useState(['全部']);
	var _creator = useState([]);
	var _endDateRange = useState(null);

	var _appliedFilter = useState({
		contractCode: undefined,
		projectName: undefined,
		customerName: undefined,
		signingCompany: undefined,
		approvalStatus: ['全部'],
		contractStatus: ['全部'],
		businessDept: [],
		businessOwner: [],
		contractType: ['全部'],
		contractApprovalType: ['全部'],
		creator: [],
		endDateRange: null
	});

	var _vehiclePopoverRecord = useState(null);
	var _deliveredPopoverRecord = useState(null);
	var _authorizedModalVisible = useState(false);
	var _authorizedModalRecord = useState(null);
	var _authorizedList = useState([{ name: '', phone: '', idCard: '' }]);
	var _extraFeeModalVisible = useState(false);
	var _extraFeeModalRecord = useState(null);
	var _extraFeeList = useState([]);
	var _deleteModalVisible = useState(false);
	var _deleteModalRecord = useState(null);
	var _withdrawModalVisible = useState(false);
	var _withdrawModalRecord = useState(null);
	var _terminateModalVisible = useState(false);
	var _terminateModalRecord = useState(null);
	var _requirementModalVisible = useState(false);
	var _stampModalVisible = useState(false);
	var _stampModalRecord = useState(null);
	var _stampFileList = useState([]);
	// 上传盖章合同完成后，按合同 id 记录已上传（原型：与列表 legalStampedContractUploaded 合并判断）
	var _stampedUploadedOverride = useState({});

	// 联调时：当前登录用户所属部门为法务部时为 true（原型默认 true 便于演示「上传盖章合同」）
	var isLegalDeptUser = true;

	// 模拟选项（与新增租赁合同保持一致）
	var contractCodeOptions = [
		{ value: 'HT-ZL-2025-001', label: 'HT-ZL-2025-001' },
		{ value: 'HT-ZL-2025-002', label: 'HT-ZL-2025-002' },
		{ value: 'HT-ZL-2025-003', label: 'HT-ZL-2025-003' },
		{ value: 'HT-ZL-2025-004', label: 'HT-ZL-2025-004' },
		{ value: 'HT-ZL-2025-005', label: 'HT-ZL-2025-005' },
		{ value: 'HT-ZL-2025-006', label: 'HT-ZL-2025-006' },
		{ value: 'HT-ZL-2025-007', label: 'HT-ZL-2025-007' },
		{ value: 'HT-ZL-2025-008', label: 'HT-ZL-2025-008' },
		{ value: 'HT-ZL-2024-009', label: 'HT-ZL-2024-009' },
		{ value: 'HT-ZL-2024-010', label: 'HT-ZL-2024-010' }
	];
	var projectNameOptions = [
		{ value: 'p1', label: '嘉兴氢能示范项目' },
		{ value: 'p2', label: '上海物流租赁项目' },
		{ value: 'p3', label: '杭州城配租赁项目' }
	];
	var customerNameOptions = [
		{ value: 'c1', label: '嘉兴某某物流有限公司' },
		{ value: 'c2', label: '上海某某运输公司' },
		{ value: 'c3', label: '杭州某某租赁有限公司' }
	];
	var signingCompanyOptions = [
		{ value: '嘉兴羚牛', label: '嘉兴羚牛' },
		{ value: '上海羚牛', label: '上海羚牛' },
		{ value: '广东羚牛', label: '广东羚牛' }
	];
	// 审批状态：待审批、审批中、审批通过、审批驳回、未提交（无已结束，已结束归属合同状态）
	var approvalStatusOptions = [
		{ value: '全部', label: '全部' },
		{ value: '待审批', label: '待审批' },
		{ value: '审批中', label: '审批中' },
		{ value: '审批通过', label: '审批通过' },
		{ value: '审批驳回', label: '审批驳回' },
		{ value: '未提交', label: '未提交' }
	];
	// 合同状态：草稿、变更、合同进行中、到期合同、已提交审批、已结束
	var contractStatusOptions = [
		{ value: '全部', label: '全部' },
		{ value: '草稿', label: '草稿' },
		{ value: '变更', label: '变更' },
		{ value: '合同进行中', label: '合同进行中' },
		{ value: '到期合同', label: '到期合同' },
		{ value: '已提交审批', label: '已提交审批' },
		{ value: '已结束', label: '已结束' }
	];
	var contractTypeOptions = [
		{ value: '全部', label: '全部' },
		{ value: '正式合同', label: '正式合同' },
		{ value: '试用合同', label: '试用合同' }
	];
	var contractApprovalTypeOptions = [
		{ value: '全部', label: '全部' },
		{ value: '标准合同审批', label: '标准合同审批' },
		{ value: '非标准合同审批', label: '非标准合同审批' }
	];
	var deptOptions = [
		{ value: '业务1部', label: '业务1部' },
		{ value: '业务2部', label: '业务2部' },
		{ value: '业务3部', label: '业务3部' }
	];
	var userOptions = [
		{ value: '张经理', label: '张经理' },
		{ value: '李专员', label: '李专员' },
		{ value: '王专员', label: '王专员' },
		{ value: '赵经理', label: '赵经理' },
		{ value: '钱专员', label: '钱专员' }
	];

	// 模拟列表数据：按审批状态 × 合同状态组合生成样例
	// 合同状态：草稿、变更、合同进行中、到期合同、已提交审批、已结束
	var rawList = [
		// 1. 未提交 + 草稿（仅保存未提交）
		{
			id: '1',
			contractCode: 'HT-ZL-2025-001',
			projectName: '嘉兴氢能示范项目',
			vehicleCount: 2,
			vehicles: [
				{ vehicleType: '4.5吨冷链车-轻型厢式货车', brand: '品牌A', model: '型号A1', plateNo: '浙A12345', actualDelivery: '2025-01-10 09:00', deliveryPerson: '张运维' },
				{ vehicleType: '18吨厢式货车-重型厢式货车', brand: '品牌B', model: '型号B1', plateNo: '-', actualDelivery: '2025-01-12 14:30', deliveryPerson: '李运维' }
			],
			approvalStatus: '未提交',
			contractStatus: '草稿',
			customerName: '嘉兴某某物流有限公司',
			signingCompany: '嘉兴羚牛',
			businessDept: '业务1部',
			businessOwner: '张经理',
			contractType: '正式合同',
			contractApprovalType: '标准合同审批',
			contractEndDate: '2026-02-16',
			contactName: '张三',
			contactPhone: '13800138001',
			creator: '张经理',
			createTime: '2025-01-05 10:00',
			updater: '-',
			updateTime: '-',
			remark: '草稿待完善',
			legalStampedContractUploaded: undefined
		},
		// 2. 未提交 + 草稿（试用合同）
		{
			id: '2',
			contractCode: 'HT-ZL-2025-002',
			projectName: '上海物流租赁项目',
			vehicleCount: 1,
			vehicles: [
				{ vehicleType: '公务用车/小客车-小型普通客车', brand: '品牌C', model: '型号C1', plateNo: '沪D66666', actualDelivery: '2025-02-01 11:00', deliveryPerson: '王运维' }
			],
			approvalStatus: '未提交',
			contractStatus: '草稿',
			customerName: '上海某某运输公司',
			signingCompany: '上海羚牛',
			businessDept: '业务2部',
			businessOwner: '李专员',
			contractType: '试用合同',
			contractApprovalType: '非标准合同审批',
			contractEndDate: '2025-08-01',
			contactName: '李四',
			contactPhone: '13800138002',
			creator: '李专员',
			createTime: '2025-02-10 09:00',
			updater: '-',
			updateTime: '-',
			remark: '试用期 3 个月',
			legalStampedContractUploaded: undefined
		},
		// 3. 待审批 + 已提交审批（初次提交，尚未有任何节点审批）
		{
			id: '3',
			contractCode: 'HT-ZL-2025-003',
			projectName: '杭州城配租赁项目',
			vehicleCount: 1,
			vehicles: [
				{ vehicleType: '4.5吨货车-轻型厢式货车', brand: '品牌A', model: '型号A2', plateNo: '浙B20002', actualDelivery: '2025-02-15 08:30', deliveryPerson: '赵运维' }
			],
			approvalStatus: '待审批',
			contractStatus: '已提交审批',
			customerName: '杭州某某租赁有限公司',
			signingCompany: '嘉兴羚牛',
			businessDept: '业务3部',
			businessOwner: '王专员',
			contractType: '正式合同',
			contractApprovalType: '标准合同审批',
			contractEndDate: '2026-06-30',
			contactName: '王五',
			contactPhone: '13800138003',
			creator: '王专员',
			createTime: '2025-02-12 11:00',
			updater: '-',
			updateTime: '-',
			remark: '-',
			legalStampedContractUploaded: undefined
		},
		// 4. 审批中 + 已提交审批（已有节点审批，未走完）
		{
			id: '4',
			contractCode: 'HT-ZL-2025-004',
			projectName: '宁波冷链运输项目',
			vehicleCount: 2,
			vehicles: [
				{ vehicleType: '18吨双飞翼货车-重型厢式货车', brand: '品牌B', model: '型号B2', plateNo: '-', actualDelivery: '2025-02-16 10:00', deliveryPerson: '钱运维' },
				{ vehicleType: '49吨牵引车头-重型半挂牵引车', brand: '品牌D', model: '型号D1', plateNo: '浙C30003', actualDelivery: '2025-02-18 14:00', deliveryPerson: '孙运维' }
			],
			approvalStatus: '审批中',
			contractStatus: '已提交审批',
			customerName: '嘉兴某某物流有限公司',
			signingCompany: '嘉兴羚牛',
			businessDept: '业务1部',
			businessOwner: '张经理',
			contractType: '正式合同',
			contractApprovalType: '非标准合同审批',
			contractEndDate: '2026-03-01',
			contactName: '赵六',
			contactPhone: '13900139001',
			creator: '张经理',
			createTime: '2025-02-14 09:00',
			updater: '李专员',
			updateTime: '2025-02-15 16:00',
			remark: '-',
			legalStampedContractUploaded: undefined,
			approvalFlowNodes: [
				{ nodeTitle: '业务服务主管审批', result: 'passed', operatorName: '姚守涛', operatorTime: '2026-04-29 17:57:15' },
				{ nodeTitle: '发起审批', result: 'passed', operatorName: '超级用户', operatorTime: '2026-04-28 17:44:45' },
				{ nodeTitle: '业务负责人审批', result: 'pending', pendingApprovers: ['超级用户', '金可鹏'] }
			]
		},
		// 5. 审批中 + 变更（已通过审批后做了变更并重新提交）
		{
			id: '5',
			contractCode: 'HT-ZL-2025-005',
			projectName: '苏州城配试点项目',
			vehicleCount: 1,
			vehicles: [
				{ vehicleType: '重型平板半挂车-重型平板半挂车', brand: '品牌D', model: '型号D2', plateNo: '苏E50005', actualDelivery: '2025-02-20 09:00', deliveryPerson: '周运维' }
			],
			approvalStatus: '审批中',
			contractStatus: '变更',
			customerName: '上海某某运输公司',
			signingCompany: '上海羚牛',
			businessDept: '业务2部',
			businessOwner: '李专员',
			contractType: '正式合同',
			contractApprovalType: '标准合同审批',
			contractEndDate: '2026-05-31',
			contactName: '孙七',
			contactPhone: '13900139002',
			creator: '李专员',
			createTime: '2025-02-18 10:00',
			updater: '李专员',
			updateTime: '2025-02-22 14:00',
			remark: '变更车辆数量',
			legalStampedContractUploaded: undefined,
			approvalFlowNodes: [
				{ nodeTitle: '法务审核', result: 'passed', operatorName: '李法务', operatorTime: '2025-02-21 18:00:00' },
				{ nodeTitle: '发起审批', result: 'passed', operatorName: '李专员', operatorTime: '2025-02-22 10:00:00' },
				{ nodeTitle: '业务负责人审批', result: 'pending', pendingApprovers: ['张经理', '赵总监'] }
			]
		},
		// 6. 审批通过 + 合同进行中（正式合同）
		{
			id: '6',
			contractCode: 'HT-ZL-2025-006',
			projectName: '南京氢能示范项目',
			vehicleCount: 3,
			vehicles: [
				{ vehicleType: '4.5吨冷链车-轻型厢式货车', brand: '品牌A', model: '型号A1', plateNo: '苏A60006', actualDelivery: '2025-01-20 08:00', deliveryPerson: '吴运维' },
				{ vehicleType: '18吨厢式货车-重型厢式货车', brand: '品牌B', model: '型号B1', plateNo: '苏A60007', actualDelivery: '2025-01-21 10:00', deliveryPerson: '郑运维' },
				{ vehicleType: '35吨牵引车头-重型半挂牵引车', brand: '品牌D', model: '型号D1', plateNo: '苏A60008', actualDelivery: '2025-01-22 14:00', deliveryPerson: '冯运维' }
			],
			approvalStatus: '审批通过',
			contractStatus: '合同进行中',
			customerName: '杭州某某租赁有限公司',
			signingCompany: '广东羚牛',
			businessDept: '业务3部',
			businessOwner: '王专员',
			contractType: '正式合同',
			contractApprovalType: '标准合同审批',
			contractEndDate: '2026-12-31',
			contactName: '周八',
			contactPhone: '13900139003',
			creator: '王专员',
			createTime: '2025-01-15 09:00',
			updater: '王专员',
			updateTime: '2025-01-25 11:00',
			remark: '-',
			legalStampedContractUploaded: true
		},
		// 7. 审批通过 + 合同进行中（试用合同，可转正式）；法务未上传盖章件时「更多」显示上传盖章合同（演示仅此合同编码为未上传）
		{
			id: '7',
			contractCode: 'HT-ZL-2025-007',
			projectName: '无锡试用租赁项目',
			vehicleCount: 1,
			vehicles: [
				{ vehicleType: '公务用车/小客车-小型普通客车', brand: '品牌C', model: '型号C2', plateNo: '苏B70007', actualDelivery: '2025-02-01 09:30', deliveryPerson: '陈运维' }
			],
			approvalStatus: '审批通过',
			contractStatus: '合同进行中',
			customerName: '嘉兴某某物流有限公司',
			signingCompany: '嘉兴羚牛',
			businessDept: '业务1部',
			businessOwner: '张经理',
			contractType: '试用合同',
			contractApprovalType: '非标准合同审批',
			contractEndDate: '2025-05-31',
			contactName: '吴九',
			contactPhone: '13900139004',
			creator: '张经理',
			createTime: '2025-01-28 10:00',
			updater: '-',
			updateTime: '-',
			remark: '试用 3 个月',
			legalStampedContractUploaded: false
		},
		// 8. 审批驳回 + 已提交审批（可编辑和重新提交）
		{
			id: '8',
			contractCode: 'HT-ZL-2025-008',
			projectName: '常州物流合作项目',
			vehicleCount: 2,
			vehicles: [
				{ vehicleType: '重型集装箱半挂车-重型集装箱半挂车', brand: '品牌D', model: '型号D1', plateNo: '-', actualDelivery: '-' },
				{ vehicleType: '4.5吨货车-轻型厢式货车', brand: '品牌A', model: '型号A2', plateNo: '-', actualDelivery: '-' }
			],
			approvalStatus: '审批驳回',
			contractStatus: '已提交审批',
			customerName: '上海某某运输公司',
			signingCompany: '上海羚牛',
			businessDept: '业务2部',
			businessOwner: '李专员',
			contractType: '正式合同',
			contractApprovalType: '标准合同审批',
			contractEndDate: '2026-08-15',
			contactName: '郑十',
			contactPhone: '13900139005',
			creator: '李专员',
			createTime: '2025-02-20 14:00',
			updater: '李专员',
			updateTime: '2025-02-23 09:00',
			remark: '驳回原因：费用条款需调整',
			legalStampedContractUploaded: undefined
		},
		// 9. 审批通过 + 到期合同（审批已通过但合同结束日期已过）
		{
			id: '9',
			contractCode: 'HT-ZL-2024-009',
			projectName: '南通去年到期项目',
			vehicleCount: 2,
			vehicles: [
				{ vehicleType: '18吨双飞翼货车-重型厢式货车', brand: '品牌B', model: '型号B1', plateNo: '苏F90009', actualDelivery: '2024-03-01 09:00', deliveryPerson: '褚运维' },
				{ vehicleType: '4.5吨冷链车-轻型厢式货车', brand: '品牌A', model: '型号A1', plateNo: '苏F90010', actualDelivery: '2024-03-02 10:00', deliveryPerson: '卫运维' }
			],
			approvalStatus: '审批通过',
			contractStatus: '到期合同',
			customerName: '杭州某某租赁有限公司',
			signingCompany: '嘉兴羚牛',
			businessDept: '业务3部',
			businessOwner: '王专员',
			contractType: '正式合同',
			contractApprovalType: '标准合同审批',
			contractEndDate: '2024-12-31',
			contactName: '王五',
			contactPhone: '13800138003',
			creator: '王专员',
			createTime: '2024-02-20 10:00',
			updater: '王专员',
			updateTime: '2024-12-20 16:00',
			remark: '已到期可续签',
			legalStampedContractUploaded: true
		},
		// 10. 审批通过 + 已结束（操作列终止合同并完成审核）
		{
			id: '10',
			contractCode: 'HT-ZL-2024-010',
			projectName: '镇江到期合同项目',
			vehicleCount: 1,
			vehicles: [
				{ vehicleType: '公务用车/小客车-小型普通客车', brand: '品牌C', model: '型号C1', plateNo: '苏L00100', actualDelivery: '2024-06-01 11:00', deliveryPerson: '蒋运维' }
			],
			approvalStatus: '审批通过',
			contractStatus: '已结束',
			customerName: '嘉兴某某物流有限公司',
			signingCompany: '嘉兴羚牛',
			businessDept: '业务1部',
			businessOwner: '张经理',
			contractType: '正式合同',
			contractApprovalType: '非标准合同审批',
			contractEndDate: '2025-01-15',
			contactName: '张三',
			contactPhone: '13800138001',
			creator: '张经理',
			createTime: '2024-05-20 09:00',
			updater: '张经理',
			updateTime: '2025-01-10 14:00',
			remark: '-',
			legalStampedContractUploaded: true
		}
	];

	var appliedFilter = _appliedFilter[0];
	var filteredList = useMemo(function() {
		var list = rawList.slice();
		var f = appliedFilter;
		if (f.contractCode) {
			list = list.filter(function(r) {
				return (r.contractCode || '').indexOf(f.contractCode) !== -1;
			});
		}
		if (f.projectName) {
			list = list.filter(function(r) { return r.projectName === f.projectName; });
		}
		if (f.customerName) {
			list = list.filter(function(r) { return r.customerName === f.customerName; });
		}
		if (f.signingCompany) {
			list = list.filter(function(r) { return r.signingCompany === f.signingCompany; });
		}
		var approval = f.approvalStatus;
		if (approval && approval.length > 0 && approval.indexOf('全部') === -1) {
			list = list.filter(function(r) { return approval.indexOf(r.approvalStatus) !== -1; });
		}
		var status = f.contractStatus;
		if (status && status.length > 0 && status.indexOf('全部') === -1) {
			list = list.filter(function(r) { return status.indexOf(r.contractStatus) !== -1; });
		}
		if (f.businessDept && f.businessDept.length > 0) {
			list = list.filter(function(r) { return f.businessDept.indexOf(r.businessDept) !== -1; });
		}
		if (f.businessOwner && f.businessOwner.length > 0) {
			list = list.filter(function(r) { return f.businessOwner.indexOf(r.businessOwner) !== -1; });
		}
		var type = f.contractType;
		if (type && type.length > 0 && type.indexOf('全部') === -1) {
			list = list.filter(function(r) { return type.indexOf(r.contractType) !== -1; });
		}
		var capType = f.contractApprovalType;
		if (capType && capType.length > 0 && capType.indexOf('全部') === -1) {
			list = list.filter(function(r) { return capType.indexOf(r.contractApprovalType) !== -1; });
		}
		if (f.creator && f.creator.length > 0) {
			list = list.filter(function(r) { return f.creator.indexOf(r.creator) !== -1; });
		}
		if (f.endDateRange && f.endDateRange.length === 2) {
			var start = '';
			var end = '';
			if (f.endDateRange[0] && f.endDateRange[0].format) {
				start = f.endDateRange[0].format('YYYY-MM-DD');
			}
			if (f.endDateRange[1] && f.endDateRange[1].format) {
				end = f.endDateRange[1].format('YYYY-MM-DD');
			}
			if (start || end) {
				list = list.filter(function(r) {
					var d = r.contractEndDate || '';
					if (start && d < start) return false;
					if (end && d > end) return false;
					return true;
				});
			}
		}
		return list;
	}, [rawList, appliedFilter]);

	var handleQuery = useCallback(function() {
		_appliedFilter[1]({
			contractCode: _contractCode[0],
			projectName: _projectName[0],
			customerName: _customerName[0],
			signingCompany: _signingCompany[0],
			approvalStatus: _approvalStatus[0] ? _approvalStatus[0].slice() : ['全部'],
			contractStatus: _contractStatus[0] ? _contractStatus[0].slice() : ['全部'],
			businessDept: _businessDept[0] ? _businessDept[0].slice() : [],
			businessOwner: _businessOwner[0] ? _businessOwner[0].slice() : [],
			contractType: _contractType[0] ? _contractType[0].slice() : ['全部'],
			contractApprovalType: _contractApprovalType[0] ? _contractApprovalType[0].slice() : ['全部'],
			creator: _creator[0] ? _creator[0].slice() : [],
			endDateRange: _endDateRange[0]
		});
	}, []);

	var handleReset = useCallback(function() {
		_contractCode[1](undefined);
		_projectName[1](undefined);
		_customerName[1](undefined);
		_signingCompany[1](undefined);
		_approvalStatus[1](['全部']);
		_contractStatus[1](['全部']);
		_businessDept[1]([]);
		_businessOwner[1]([]);
		_contractType[1](['全部']);
		_contractApprovalType[1](['全部']);
		_creator[1]([]);
		_endDateRange[1](null);
		_appliedFilter[1]({
			contractCode: undefined,
			projectName: undefined,
			customerName: undefined,
			signingCompany: undefined,
			approvalStatus: ['全部'],
			contractStatus: ['全部'],
			businessDept: [],
			businessOwner: [],
			contractType: ['全部'],
			contractApprovalType: ['全部'],
			creator: [],
			endDateRange: null
		});
	}, []);

	// 审批状态/合同状态/合同类型：「全部」与其它选项互斥，不能同时多选
	var handleApprovalStatusChange = useCallback(function(v) {
		if (!v || v.length === 0) { _approvalStatus[1](['全部']); return; }
		if (v.indexOf('全部') !== -1 && v.length > 1) {
			var prev = _approvalStatus[0] || [];
			var hadAllOnly = prev.length === 1 && prev.indexOf('全部') !== -1;
			if (hadAllOnly) {
				var next = [];
				for (var i = 0; i < v.length; i++) { if (v[i] !== '全部') next.push(v[i]); }
				_approvalStatus[1](next);
			} else {
				_approvalStatus[1](['全部']);
			}
			return;
		}
		_approvalStatus[1](v);
	}, []);
	var handleContractStatusChange = useCallback(function(v) {
		if (!v || v.length === 0) { _contractStatus[1](['全部']); return; }
		if (v.indexOf('全部') !== -1 && v.length > 1) {
			var prev = _contractStatus[0] || [];
			var hadAllOnly = prev.length === 1 && prev.indexOf('全部') !== -1;
			if (hadAllOnly) {
				var next = [];
				for (var j = 0; j < v.length; j++) { if (v[j] !== '全部') next.push(v[j]); }
				_contractStatus[1](next);
			} else {
				_contractStatus[1](['全部']);
			}
			return;
		}
		_contractStatus[1](v);
	}, []);
	var handleContractTypeChange = useCallback(function(v) {
		if (!v || v.length === 0) { _contractType[1](['全部']); return; }
		if (v.indexOf('全部') !== -1 && v.length > 1) {
			var prev = _contractType[0] || [];
			var hadAllOnly = prev.length === 1 && prev.indexOf('全部') !== -1;
			if (hadAllOnly) {
				var next = [];
				for (var k = 0; k < v.length; k++) { if (v[k] !== '全部') next.push(v[k]); }
				_contractType[1](next);
			} else {
				_contractType[1](['全部']);
			}
			return;
		}
		_contractType[1](v);
	}, []);
	var handleContractApprovalTypeChange = useCallback(function(v) {
		if (!v || v.length === 0) { _contractApprovalType[1](['全部']); return; }
		if (v.indexOf('全部') !== -1 && v.length > 1) {
			var prevA = _contractApprovalType[0] || [];
			var hadAllOnlyA = prevA.length === 1 && prevA.indexOf('全部') !== -1;
			if (hadAllOnlyA) {
				var nextA = [];
				for (var ia = 0; ia < v.length; ia++) { if (v[ia] !== '全部') nextA.push(v[ia]); }
				_contractApprovalType[1](nextA);
			} else {
				_contractApprovalType[1](['全部']);
			}
			return;
		}
		_contractApprovalType[1](v);
	}, []);

	var addAuthorizedRow = useCallback(function() {
		_authorizedList[1](function(prev) { return prev.concat([{ name: '', phone: '', idCard: '' }]); });
	}, []);
	var removeAuthorizedRow = useCallback(function(index) {
		_authorizedList[1](function(prev) {
			var list = prev.slice();
			list.splice(index, 1);
			if (list.length === 0) list = [{ name: '', phone: '', idCard: '' }];
			return list;
		});
	}, []);
	var updateAuthorizedRow = useCallback(function(index, field, value) {
		_authorizedList[1](function(prev) {
			var list = prev.slice();
			var row = list[index] || { name: '', phone: '', idCard: '' };
			var next = {};
			next[field] = value;
			list[index] = Object.assign({}, row, next);
			return list;
		});
	}, []);

	// 附加费用：服务项目枚举（与需求文档一致）
	var extraFeeServiceOptions = [
		{ value: '代处理费用', label: '代处理费用' }, { value: '罚款', label: '罚款' }, { value: '违章处理违约金', label: '违章处理违约金' }, { value: '未参加安全培训', label: '未参加安全培训' }, { value: '车辆出险', label: '车辆出险' }, { value: '年检年审违约', label: '年检年审违约' }, { value: '停车费', label: '停车费' }, { value: '设备损坏金（包含易损件）', label: '设备损坏金（包含易损件）' }, { value: '清洗费', label: '清洗费' }, { value: '上门收车人工费', label: '上门收车人工费' }, { value: '上门收车送车行驶费', label: '上门收车送车行驶费' }, { value: '上门收车基础服务费', label: '上门收车基础服务费' }, { value: '保险上浮', label: '保险上浮' }, { value: '保养费用', label: '保养费用' }, { value: '补办驾驶证', label: '补办驾驶证' }, { value: '补办牌照', label: '补办牌照' }, { value: '补办营运证', label: '补办营运证' }, { value: '补办加氢证', label: '补办加氢证' }, { value: '借用备用钥匙', label: '借用备用钥匙' }, { value: '补配钥匙', label: '补配钥匙' }, { value: '租金', label: '租金' }, { value: '氢气费-客', label: '氢气费-客' }, { value: '退还车氢量差', label: '退还车氢量差' }, { value: '能源费补缴', label: '能源费补缴' }, { value: '能源费退款', label: '能源费退款' }, { value: '送车上门人工费', label: '送车上门人工费' }, { value: '送车上门送车行驶费', label: '送车上门送车行驶费' }, { value: '送车上门基础服务费', label: '送车上门基础服务费' }, { value: '保证金', label: '保证金' }, { value: '氢气预付费', label: '氢气预付费' }, { value: '维修费用', label: '维修费用' }, { value: 'ETC-客', label: 'ETC-客' }, { value: 'ETC卡缺损费', label: 'ETC卡缺损费' }, { value: 'ETC设备缺损费', label: 'ETC设备缺损费' }, { value: '电费-客', label: '电费-客' }, { value: '未结算保养费', label: '未结算保养费' }, { value: '未结算维修费', label: '未结算维修费' }, { value: '车损费', label: '车损费' }, { value: '工具损坏或丢失费', label: '工具损坏或丢失费' }, { value: '证件费', label: '证件费' }, { value: '广告损坏费', label: '广告损坏费' }, { value: '送车服务费', label: '送车服务费' }, { value: '接车服务费', label: '接车服务费' }, { value: '补办行驶证', label: '补办行驶证' }, { value: '超赔险', label: '超赔险' }, { value: '轮胎磨损费', label: '轮胎磨损费' }, { value: '无忧包', label: '无忧包' }, { value: '轮胎保', label: '轮胎保' }, { value: '养护保', label: '养护保' }, { value: '尾板', label: '尾板' }
	];
	var updateExtraFeeRow = useCallback(function(index, field, value) {
		_extraFeeList[1](function(prev) {
			var list = prev.slice();
			var row = list[index] || {};
			var next = {};
			next[field] = value;
			list[index] = Object.assign({}, row, next);
			return list;
		});
	}, []);

	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var layoutStyle = { padding: '16px 24px', background: '#f5f5f5', minHeight: '100vh' };
	var tableSingleLineStyle = '.contract-list-table .ant-table-thead th,.contract-list-table .ant-table-tbody td{white-space:nowrap;}';

	// 租赁车辆数气泡：不含实际交车日期
	var vehicleColumnsRental = [
		{ title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 180 },
		{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 80 },
		{ title: '型号', dataIndex: 'model', key: 'model', width: 100 },
		{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100 }
	];
	// 已交车辆数气泡：含实际交车日期，后方增加交车人
	var vehicleColumnsDelivered = [
		{ title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 180 },
		{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 80 },
		{ title: '型号', dataIndex: 'model', key: 'model', width: 100 },
		{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100 },
		{ title: '实际交车日期', dataIndex: 'actualDelivery', key: 'actualDelivery', width: 140 },
		{ title: '交车人', dataIndex: 'deliveryPerson', key: 'deliveryPerson', width: 100 }
	];

	function approvalAvatarText(name) {
		if (!name) return '?';
		var s = String(name);
		return s.length <= 2 ? s : s.slice(-2);
	}

	function renderApprovalFlowContent(nodes) {
		var list = nodes && nodes.length ? nodes : [];
		if (!list.length) {
			return React.createElement('div', { style: { color: 'rgba(0,0,0,0.45)', fontSize: 13, padding: '4px 0' } }, '暂无审批节点明细');
		}
		return React.createElement(
			'div',
			{ style: { maxWidth: 360, paddingTop: 4 } },
			list.map(function(node, index) {
				var isLast = index === list.length - 1;
				var isPending = node.result === 'pending';
				var dot = React.createElement(
					Avatar,
					{
						size: 28,
						style: {
							backgroundColor: isPending ? '#1890ff' : '#f0f0f0',
							color: isPending ? '#fff' : 'rgba(0,0,0,0.45)',
							fontSize: 11,
							lineHeight: '28px',
							flexShrink: 0
						},
						children: isPending
							? React.createElement(
									'svg',
									{ viewBox: '0 0 24 24', width: 14, height: 14, fill: 'currentColor', style: { verticalAlign: 'middle' } },
									React.createElement('path', {
										d: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm5-9h2v2h-2V5zm0 4h2v2h-2V9z'
									})
								)
							: approvalAvatarText(node.operatorName)
					}
				);
				var body = React.createElement(
					'div',
					{ style: { flex: 1, paddingLeft: 12, paddingBottom: isLast ? 0 : 14, minWidth: 0 } },
					React.createElement(
						'div',
						{ style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 } },
						React.createElement('span', { style: { fontSize: 14, color: 'rgba(0,0,0,0.88)', fontWeight: 500 } }, node.nodeTitle || '-'),
						React.createElement(Tag, { color: isPending ? 'processing' : 'success', style: { margin: 0 } }, isPending ? '待审核' : '通过')
					),
					isPending && node.pendingApprovers && node.pendingApprovers.length
						? React.createElement(
								Space,
								{ size: [8, 8], wrap: true },
								node.pendingApprovers.map(function(apName, i) {
									return React.createElement(
										Tag,
										{
											key: i,
											style: {
												margin: 0,
												color: '#1890ff',
												background: '#e6f7ff',
												borderColor: '#91d5ff'
											}
										},
										React.createElement(
											'span',
											null,
											React.createElement(
												'svg',
												{
													viewBox: '0 0 24 24',
													width: 12,
													height: 12,
													fill: '#1890ff',
													style: { marginRight: 4, verticalAlign: '-2px' }
												},
												React.createElement('path', {
													d: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
												})
											),
											apName
										)
									);
								})
							)
						: React.createElement(
								'div',
								{ style: { fontSize: 13, color: 'rgba(0,0,0,0.45)' } },
								(node.operatorName || '') + (node.operatorTime ? '  ' + node.operatorTime : '')
							)
				);
				return React.createElement(
					'div',
					{ key: index, style: { display: 'flex', alignItems: 'stretch' } },
					React.createElement(
						'div',
						{
							style: {
								width: 36,
								flexShrink: 0,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center'
							}
						},
						React.createElement('div', { style: { lineHeight: 0 } }, dot),
						isLast
							? null
							: React.createElement('div', {
									style: {
										flex: 1,
										width: 2,
										minHeight: 12,
										marginTop: 4,
										background: '#f0f0f0',
										borderRadius: 1
									}
								})
					),
					body
				);
			})
		);
	}

	function getMoreMenuItems(record) {
		var status = record.contractStatus;
		var type = record.contractType;
		var approval = record.approvalStatus;
		var items = [];
		if (status === '草稿') {
			items.push({ key: 'edit', label: '编辑', onClick: function() { message.info('编辑（原型）'); } });
			items.push({ key: 'del', label: '删除合同', danger: true, onClick: function() { _deleteModalRecord[1](record); _deleteModalVisible[1](true); } });
		}
		if (status === '合同进行中') {
			items.push({ key: 'addVehicle', label: '新增车辆', onClick: function() { message.info('新增车辆（原型）'); } });
			items.push({ key: 'renew', label: '续签合同', onClick: function() { message.info('续签合同（原型）'); } });
			items.push({ key: 'authorized', label: '添加被授权人', onClick: function() { _authorizedModalRecord[1](record); _authorizedList[1]([{ name: '', phone: '', idCard: '' }]); _authorizedModalVisible[1](true); } });
			items.push({ key: 'extraFee', label: '附加费用', onClick: function() {
				_extraFeeModalRecord[1](record);
				var vehicles = record.vehicles || [];
				_extraFeeList[1](vehicles.map(function(v) {
					return {
						vehicleType: v.vehicleType || '-',
						brand: v.brand || '-',
						model: v.model || '-',
						plateNo: v.plateNo || '-',
						serviceItem: undefined,
						fee: '',
						effectiveDate: null
					};
				}));
				_extraFeeModalVisible[1](true);
			} });
			items.push({ key: 'toTripartite', label: '变更为三方合同', onClick: function() { message.info('变更为三方合同（原型）'); } });
			items.push({ key: 'terminate', label: '终止合同', danger: true, onClick: function() { _terminateModalRecord[1](record); _terminateModalVisible[1](true); } });
		}
		if (status === '到期合同') {
			items.push({ key: 'renew2', label: '续签合同', onClick: function() { message.info('续签合同（原型）'); } });
		}
		if (status === '已提交审批' && approval !== '审批驳回') {
			items.push({ key: 'withdraw', label: '撤回合同', onClick: function() { _withdrawModalRecord[1](record); _withdrawModalVisible[1](true); } });
		}
		if (approval === '审批驳回') {
			items.push({ key: 'editReject', label: '编辑', onClick: function() { message.info('编辑（原型）'); } });
		}
		if (type === '试用合同') {
			items.push({ key: 'toFormal', label: '转正式合同', onClick: function() { message.info('转正式合同（原型）'); } });
		}
		// 审批通过且法务审核环节尚未上传盖章合同附件时，法务部员工可在「更多」中上传（上传完成后入口关闭）
		if (approval === '审批通过' && isLegalDeptUser) {
			var needStampUpload = (record.legalStampedContractUploaded === false) && !(_stampedUploadedOverride[0][record.id] === true);
			if (needStampUpload) {
				items.push({
					key: 'uploadStamped',
					label: '上传盖章合同',
					onClick: function() {
						_stampModalRecord[1](record);
						_stampFileList[1]([]);
						_stampModalVisible[1](true);
					}
				});
			}
		}
		return items;
	}

	function getOperationButtons(record) {
		var menuItems = getMoreMenuItems(record);
		var moreDropdown = menuItems.length > 0
			? React.createElement(
				Dropdown,
				{
					menu: { items: menuItems },
					trigger: ['click']
				},
				React.createElement(Button, { type: 'link', size: 'small' }, '更多')
			)
			: null;
		return React.createElement(
			Space,
			{ size: 4, wrap: true },
			React.createElement(Button, { type: 'link', size: 'small', onClick: function() { message.info('查看（跳转车辆租赁合同-查看）'); } }, '查看'),
			moreDropdown
		);
	}

	var columns = [
		{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 140, fixed: 'left' },
		{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 140, fixed: 'left' },
		{
			title: '租赁车辆数',
			key: 'vehicleCount',
			width: 100,
			render: function(_, record) {
				var open = _vehiclePopoverRecord[0] && _vehiclePopoverRecord[0].id === record.id;
				var content = React.createElement('div', { style: { padding: 8 } },
					React.createElement(Table, {
						size: 'small',
						rowKey: function(r, i) { return String(i); },
						columns: vehicleColumnsRental,
						dataSource: record.vehicles || [],
						pagination: false,
						scroll: { x: 460 }
					})
				);
				return React.createElement(
					Popover,
					{
						content: content,
						title: '车辆明细',
						open: open,
						onOpenChange: function(visible) {
							if (!visible) _vehiclePopoverRecord[1](null);
							else _vehiclePopoverRecord[1](record);
						},
						trigger: 'click'
					},
					React.createElement('a', { style: { cursor: 'pointer', color: '#1890ff', fontWeight: 500 } }, record.vehicleCount)
				);
			}
		},
		{
			title: '已交车辆数',
			key: 'deliveredCount',
			width: 100,
			render: function(_, record) {
				var deliveredVehicles = (record.vehicles || []).filter(function(v) {
					var d = v.actualDelivery;
					return d && String(d).trim() && d !== '-';
				});
				var deliveredCount = deliveredVehicles.length;
				var open = _deliveredPopoverRecord[0] && _deliveredPopoverRecord[0].id === record.id;
				var content = React.createElement('div', { style: { padding: 8 } },
					React.createElement(Table, {
						size: 'small',
						rowKey: function(r, i) { return String(i); },
						columns: vehicleColumnsDelivered,
						dataSource: deliveredVehicles,
						pagination: false,
						scroll: { x: 700 }
					})
				);
				return React.createElement(
					Popover,
					{
						content: content,
						title: '已交车列表',
						open: open,
						onOpenChange: function(visible) {
							if (!visible) _deliveredPopoverRecord[1](null);
							else _deliveredPopoverRecord[1](record);
						},
						trigger: 'click'
					},
					React.createElement('a', { style: { cursor: 'pointer', color: '#1890ff', fontWeight: 500 } }, deliveredCount)
				);
			}
		},
		{
			title: '审批状态',
			dataIndex: 'approvalStatus',
			key: 'approvalStatus',
			width: 100,
			render: function(text, record) {
				if (text !== '审批中') return text;
				var nodes = record.approvalFlowNodes;
				return React.createElement(
					Popover,
					{
						content: renderApprovalFlowContent(nodes),
						trigger: 'hover',
						placement: 'rightTop',
						overlayInnerStyle: { maxWidth: 400 },
						mouseEnterDelay: 0.15
					},
					React.createElement(
						'span',
						{
							style: {
								cursor: 'help',
								borderBottom: '1px dashed rgba(0,0,0,0.35)',
								color: 'rgba(0,0,0,0.88)'
							}
						},
						text
					)
				);
			}
		},
		{ title: '合同状态', dataIndex: 'contractStatus', key: 'contractStatus', width: 110 },
		{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 140 },
		{ title: '签约公司', dataIndex: 'signingCompany', key: 'signingCompany', width: 100 },
		{ title: '业务部门', dataIndex: 'businessDept', key: 'businessDept', width: 100 },
		{ title: '业务负责人', dataIndex: 'businessOwner', key: 'businessOwner', width: 100 },
		{ title: '合同类型', dataIndex: 'contractType', key: 'contractType', width: 100 },
		{ title: '合同审批类型', dataIndex: 'contractApprovalType', key: 'contractApprovalType', width: 130 },
		{ title: '合同结束日期', dataIndex: 'contractEndDate', key: 'contractEndDate', width: 120 },
		{ title: '客户联系人', dataIndex: 'contactName', key: 'contactName', width: 100 },
		{ title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone', width: 120 },
		{ title: '创建人', dataIndex: 'creator', key: 'creator', width: 90 },
		{ title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 150 },
		{ title: '更新人', dataIndex: 'updater', key: 'updater', width: 90 },
		{ title: '最后更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 150 },
		{ title: '备注', dataIndex: 'remark', key: 'remark', width: 100, ellipsis: true },
		{ title: '操作', key: 'action', width: 140, fixed: 'right', render: function(_, record) { return getOperationButtons(record); } }
	];

	var filterItems = [
		React.createElement('div', { key: 'contractCode', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '合同编码'),
			React.createElement(Select, {
				placeholder: '请选择或输入合同编码',
				style: filterControlStyle,
				value: _contractCode[0],
				onChange: function(v) { _contractCode[1](v); },
				allowClear: true,
				showSearch: true,
				options: contractCodeOptions,
				filterOption: function(input, opt) {
					return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1;
				}
			})),
		React.createElement('div', { key: 'projectName', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '项目名称'),
			React.createElement(Select, {
				placeholder: '请选择或输入项目名称',
				style: filterControlStyle,
				value: _projectName[0],
				onChange: function(v) { _projectName[1](v); },
				allowClear: true,
				showSearch: true,
				options: projectNameOptions,
				filterOption: function(input, opt) {
					return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1;
				}
			})),
		React.createElement('div', { key: 'customerName', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '客户名称'),
			React.createElement(Select, {
				placeholder: '请选择或输入客户名称',
				style: filterControlStyle,
				value: _customerName[0],
				onChange: function(v) { _customerName[1](v); },
				allowClear: true,
				showSearch: true,
				options: customerNameOptions,
				filterOption: function(input, opt) {
					return (opt.label || '').toString().toLowerCase().indexOf((input || '').toLowerCase()) !== -1;
				}
			})),
		React.createElement('div', { key: 'signingCompany', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '签约公司'),
			React.createElement(Select, {
				placeholder: '请选择或输入签约公司名称',
				style: filterControlStyle,
				value: _signingCompany[0],
				onChange: function(v) { _signingCompany[1](v); },
				allowClear: true,
				options: signingCompanyOptions
			})),
		React.createElement('div', { key: 'approvalStatus', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '审批状态'),
			React.createElement(Select, {
				mode: 'multiple',
				placeholder: '请选择',
				style: filterControlStyle,
				value: _approvalStatus[0],
				onChange: handleApprovalStatusChange,
				options: approvalStatusOptions
			})),
		React.createElement('div', { key: 'contractStatus', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '合同状态'),
			React.createElement(Select, {
				mode: 'multiple',
				placeholder: '请选择',
				style: filterControlStyle,
				value: _contractStatus[0],
				onChange: handleContractStatusChange,
				options: contractStatusOptions
			})),
		React.createElement('div', { key: 'businessDept', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '业务部门'),
			React.createElement(Select, {
				mode: 'multiple',
				placeholder: '请选择或输入业务部门名称',
				style: filterControlStyle,
				value: _businessDept[0],
				onChange: function(v) { _businessDept[1](v); },
				options: deptOptions
			})),
		React.createElement('div', { key: 'businessOwner', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '业务负责人'),
			React.createElement(Select, {
				mode: 'multiple',
				placeholder: '请选择或输入业务负责人姓名',
				style: filterControlStyle,
				value: _businessOwner[0],
				onChange: function(v) { _businessOwner[1](v); },
				options: userOptions
			})),
		React.createElement('div', { key: 'contractType', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '合同类型'),
			React.createElement(Select, {
				mode: 'multiple',
				placeholder: '请选择',
				style: filterControlStyle,
				value: _contractType[0],
				onChange: handleContractTypeChange,
				options: contractTypeOptions
			})),
		React.createElement('div', { key: 'contractApprovalType', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '合同审批类型'),
			React.createElement(Select, {
				mode: 'multiple',
				placeholder: '请选择',
				style: filterControlStyle,
				value: _contractApprovalType[0],
				onChange: handleContractApprovalTypeChange,
				options: contractApprovalTypeOptions
			})),
		React.createElement('div', { key: 'creator', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '创建人'),
			React.createElement(Select, {
				mode: 'multiple',
				placeholder: '请选择或输入创建人姓名',
				style: filterControlStyle,
				value: _creator[0],
				onChange: function(v) { _creator[1](v); },
				options: userOptions
			})),
		React.createElement('div', { key: 'endDate', style: filterItemStyle },
			React.createElement('div', { style: filterLabelStyle }, '合同结束日期'),
			React.createElement(RangePicker, {
				style: filterControlStyle,
				placeholder: ['开始日期', '结束日期'],
				value: _endDateRange[0],
				onChange: function(v) { _endDateRange[1](v); }
			}))
	];

	var filterCount = _filterExpanded[0] ? 12 : 3;
	var filterNodes = [];
	for (var i = 0; i < filterCount && i < filterItems.length; i++) {
		filterNodes.push(filterItems[i]);
	}

	var reqTitleStyle = { fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'rgba(0,0,0,0.85)' };
	var reqSectionStyle = { fontSize: 15, fontWeight: 600, marginTop: 16, marginBottom: 8, color: 'rgba(0,0,0,0.85)' };
	var reqSubStyle = { fontSize: 14, fontWeight: 500, marginLeft: 16, marginTop: 8, marginBottom: 4, color: 'rgba(0,0,0,0.85)' };
	var reqItemStyle = { fontSize: 13, marginLeft: 32, marginTop: 4, marginBottom: 2, lineHeight: 1.6, color: 'rgba(0,0,0,0.75)' };
	var reqSubItemStyle = { fontSize: 13, marginLeft: 48, marginTop: 2, marginBottom: 2, lineHeight: 1.6, color: 'rgba(0,0,0,0.7)' };

	return React.createElement(App, null,
		React.createElement('div', { style: layoutStyle },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
				React.createElement(Breadcrumb, {
					items: [
						{ title: '业务管理' },
						{ title: '车辆租赁合同' }
					]
				}),
				React.createElement(Button, { type: 'link', style: { padding: 0 }, onClick: function() { _requirementModalVisible[1](true); } }, '查看需求说明')
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
			React.createElement('div', { style: { marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 } },
				React.createElement(Button, { onClick: function() { message.info('租赁费用模板（原型）'); } }, '租赁费用模板'),
				React.createElement('div', { style: { display: 'flex', gap: 8 } },
					React.createElement(Button, { type: 'primary', onClick: function() { message.info('请在原型菜单列表中点击：业务管理-车辆租赁合同-新建合同 查看具体原型'); } }, '新增'),
					React.createElement(Button, { onClick: function() { message.info('根据筛选条件，导出相应记录'); } }, '导出')
				)
			),
			React.createElement(Card, null,
				React.createElement(React.Fragment, null,
					React.createElement('style', null, tableSingleLineStyle),
					React.createElement('div', { className: 'contract-list-table' },
						React.createElement(Table, {
							rowKey: 'id',
							columns: columns,
							dataSource: filteredList,
							scroll: { x: 2400 },
							size: 'small',
							pagination: { showSizeChanger: true, showQuickJumper: true, showTotal: function(t) { return '共 ' + t + ' 条'; } }
						})
					)
				)
			),
			React.createElement(Modal, {
				title: '是否确认删除该合同草稿',
				open: _deleteModalVisible[0],
				onCancel: function() { _deleteModalVisible[1](false); _deleteModalRecord[1](null); },
				onOk: function() {
					message.success('已删除（原型）');
					_deleteModalVisible[1](false);
					_deleteModalRecord[1](null);
				},
				okText: '确定',
				cancelText: '取消'
			}),
			React.createElement(Modal, {
				title: '是否确认撤回该合同',
				open: _withdrawModalVisible[0],
				onCancel: function() { _withdrawModalVisible[1](false); _withdrawModalRecord[1](null); },
				onOk: function() {
					message.success('已撤回（原型）');
					_withdrawModalVisible[1](false);
					_withdrawModalRecord[1](null);
				},
				okText: '确定',
				cancelText: '取消'
			}),
			React.createElement(Modal, {
				title: '是否确认终止合同',
				open: _terminateModalVisible[0],
				onCancel: function() { _terminateModalVisible[1](false); _terminateModalRecord[1](null); },
				onOk: function() {
					message.success('已提交审核（原型），审核通过后合同状态变更为已结束');
					_terminateModalVisible[1](false);
					_terminateModalRecord[1](null);
				},
				okText: '提交审核',
				cancelText: '取消'
			}),
			React.createElement(Modal, {
				title: '添加被授权人',
				open: _authorizedModalVisible[0],
				onCancel: function() { _authorizedModalVisible[1](false); _authorizedModalRecord[1](null); },
				width: 640,
				footer: [
					React.createElement(Button, { key: 'cancel', onClick: function() { _authorizedModalVisible[1](false); _authorizedModalRecord[1](null); } }, '取消'),
					React.createElement(Button, { key: 'ok', type: 'primary', onClick: function() { message.success('已提交审核（原型）'); _authorizedModalVisible[1](false); _authorizedModalRecord[1](null); } }, '提交审核')
				]
			}, React.createElement('div', { style: { padding: '8px 0' } },
				React.createElement(Table, {
					rowKey: function(_, i) { return String(i); },
					size: 'small',
					columns: [
						{ title: '被授权人', key: 'name', width: 140, render: function(_, row, index) { return React.createElement(Input, { value: row.name, onChange: function(e) { updateAuthorizedRow(index, 'name', e.target.value); }, placeholder: '请输入' }); } },
						{ title: '被授权人联系电话', key: 'phone', width: 160, render: function(_, row, index) { return React.createElement(Input, { value: row.phone, onChange: function(e) { updateAuthorizedRow(index, 'phone', e.target.value); }, placeholder: '请输入' }); } },
						{ title: '被授权人身份证', key: 'idCard', width: 200, render: function(_, row, index) { return React.createElement(Input, { value: row.idCard, onChange: function(e) { updateAuthorizedRow(index, 'idCard', e.target.value); }, placeholder: '请输入' }); } },
						{ title: '操作', key: 'action', width: 80, render: function(_, row, index) { return React.createElement(Button, { type: 'link', size: 'small', danger: true, onClick: function() { removeAuthorizedRow(index); } }, '删除'); } }
					],
					dataSource: _authorizedList[0],
					pagination: false
				}),
				React.createElement(Button, { type: 'dashed', style: { marginTop: 12, width: '100%' }, onClick: addAuthorizedRow }, '添加一行')
			)),
			React.createElement(Modal, {
				title: '附加费用',
				open: _extraFeeModalVisible[0],
				onCancel: function() { _extraFeeModalVisible[1](false); _extraFeeModalRecord[1](null); _extraFeeList[1]([]); },
				width: 900,
				footer: [
					React.createElement(Button, { key: 'cancel', onClick: function() { _extraFeeModalVisible[1](false); _extraFeeModalRecord[1](null); _extraFeeList[1]([]); } }, '取消'),
					React.createElement(Button, { key: 'ok', type: 'primary', onClick: function() { message.success('已提交审核（原型）'); _extraFeeModalVisible[1](false); _extraFeeModalRecord[1](null); _extraFeeList[1]([]); } }, '提交审核')
				]
			}, React.createElement('div', { style: { padding: '8px 0' } },
				React.createElement(Table, {
					rowKey: function(_, i) { return String(i); },
					size: 'small',
					columns: [
						{ title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 160, render: function(v) { return v || '-'; } },
						{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 90, render: function(v) { return v || '-'; } },
						{ title: '型号', dataIndex: 'model', key: 'model', width: 100, render: function(v) { return v || '-'; } },
						{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100, render: function(v) { return v || '-'; } },
						{ title: '服务项目', key: 'serviceItem', width: 180, render: function(_, row, index) { return React.createElement(Select, { placeholder: '请选择', style: { width: '100%' }, value: row.serviceItem, onChange: function(v) { updateExtraFeeRow(index, 'serviceItem', v); }, options: extraFeeServiceOptions, allowClear: true }); } },
						{ title: '费用（元）', key: 'fee', width: 140, render: function(_, row, index) { return React.createElement(Input, { value: row.fee, onChange: function(e) { updateExtraFeeRow(index, 'fee', e.target.value); }, placeholder: '请输入', addonAfter: '元' }); } },
						{ title: '生效时间', key: 'effectiveDate', width: 140, render: function(_, row, index) { var dayjs = window.dayjs; var val = row.effectiveDate && dayjs ? dayjs(row.effectiveDate) : null; return React.createElement(DatePicker, { style: { width: '100%' }, placeholder: '请选择日期', value: val, onChange: function(date, dateString) { updateExtraFeeRow(index, 'effectiveDate', dateString || null); } }); } }
					],
					dataSource: _extraFeeList[0],
					pagination: false,
					scroll: { x: 920 }
				})
			)),
			React.createElement(Modal, {
				title: '上传盖章合同',
				open: _stampModalVisible[0],
				onCancel: function() {
					_stampModalVisible[1](false);
					_stampModalRecord[1](null);
					_stampFileList[1]([]);
				},
				width: 560,
				footer: [
					React.createElement(Button, { key: 'cancel', onClick: function() {
						_stampModalVisible[1](false);
						_stampModalRecord[1](null);
						_stampFileList[1]([]);
					} }, '取消'),
					React.createElement(Button, { key: 'ok', type: 'primary', onClick: function() {
						var rec = _stampModalRecord[0];
						var list = _stampFileList[0] || [];
						if (!list.length) {
							message.warning('请先选择要上传的文件');
							return;
						}
						var pending = list.some(function(f) { return f.status === 'uploading'; });
						if (pending) {
							message.warning('请等待文件上传完成');
							return;
						}
						_stampedUploadedOverride[1](function(prev) {
							var n = Object.assign({}, prev);
							if (rec) n[rec.id] = true;
							return n;
						});
						message.success('盖章合同已上传（原型）');
						_stampModalVisible[1](false);
						_stampModalRecord[1](null);
						_stampFileList[1]([]);
					} }, '确认上传')
				]
			}, React.createElement('div', { style: { padding: '8px 0' } },
				React.createElement('div', { style: { marginBottom: 12, fontSize: 14, color: 'rgba(0,0,0,0.65)' } },
					'合同编码：',
					React.createElement('span', { style: { color: 'rgba(0,0,0,0.85)', fontWeight: 500 } }, _stampModalRecord[0] ? _stampModalRecord[0].contractCode : '-')
				),
				React.createElement(Upload.Dragger, {
					multiple: true,
					fileList: _stampFileList[0],
					onChange: function(info) { _stampFileList[1](info.fileList); },
					customRequest: function(opts) {
						setTimeout(function() {
							if (opts.onSuccess) opts.onSuccess('ok');
						}, 200);
					},
					accept: '.pdf,.doc,.docx,image/*'
				}, React.createElement('p', { style: { margin: 0, padding: '20px 0' } }, '点击或拖拽文件到此区域上传；支持一次选择多个附件，可分批添加'))
			)),
			React.createElement(Modal, {
				title: '需求说明',
				open: _requirementModalVisible[0],
				onCancel: function() { _requirementModalVisible[1](false); },
				width: 720,
				footer: React.createElement(Button, { onClick: function() { _requirementModalVisible[1](false); } }, '关闭'),
				bodyStyle: { maxHeight: '70vh', overflow: 'auto' }
			}, React.createElement('div', { style: { padding: '8px 0' } },
				React.createElement('div', { style: reqTitleStyle }, '车辆租赁合同（2026年3月3日版本）'),
				React.createElement('div', { style: { fontSize: 14, marginBottom: 12, color: 'rgba(0,0,0,0.85)' } }, '一个「数字化资产ONEOS运管平台」中的「车辆租赁合同」模块'),
				React.createElement('div', { style: reqSectionStyle }, '1.面包屑：'),
				React.createElement('div', { style: reqSubStyle }, '1.1.业务管理-车辆租赁合同'),
				React.createElement('div', { style: reqSectionStyle }, '2.筛选：'),
				React.createElement('div', { style: reqSubStyle }, '2.1.支持通过合同编码、项目名称、客户名称、签约公司、审批状态、合同状态、业务部门、业务负责人、合同类型、合同审批类型、创建人、合同结束日期等条件进行筛选，右侧为重置、查询、展开/收起（筛选条件以3列显示，默认显示一行，点击展开/收起对筛选栏卡片进行展开/收起所有筛选条件），点击查询后，筛选条件与列表内容联动。点击重置会回到默认筛选条件并在列表展示结果：'),
				React.createElement('div', { style: reqItemStyle }, '2.1.1.合同编码：选择器，支持从输入框内输入内容进行模糊搜索，下拉显示匹配选项；'),
				React.createElement('div', { style: reqItemStyle }, '2.1.2.项目名称：选择器，支持从输入框内输入内容进行模糊搜索，下拉显示匹配选项；'),
				React.createElement('div', { style: reqItemStyle }, '2.1.3.客户名称：选择器，支持从输入框内输入内容进行模糊搜索，下拉显示匹配选项；'),
				React.createElement('div', { style: reqItemStyle }, '2.1.4.签约公司：选择器，显示租赁合同所有签约公司；'),
				React.createElement('div', { style: reqItemStyle }, '2.1.5.审批状态：选择器，支持全选或多选，选项为：全部、待审批、审批中、审批通过、审批驳回、未提交，默认显示全部；'),
				React.createElement('div', { style: reqItemStyle }, '2.1.6.合同状态：选择器，支持全选或多选，选项为：全部、草稿、变更、合同进行中、到期合同、已提交审批、已结束；'),
				React.createElement('div', { style: reqItemStyle }, '2.1.7.业务部门：选择器，支持全选或多选，拉取部门下所有业务相关部门；'),
				React.createElement('div', { style: reqItemStyle }, '2.1.8.业务负责人：选择器，支持全选或多选，拉取所有业务相关部门下所有用户姓名；'),
				React.createElement('div', { style: reqItemStyle }, '2.1.9.合同类型：选择器，支持全选或多选，选项为：全部、正式合同、试用合同；'),
				React.createElement('div', { style: reqItemStyle }, '2.1.10.合同审批类型：选择器，支持全选或多选，选项为：全部、标准合同审批、非标准合同审批；'),
				React.createElement('div', { style: reqItemStyle }, '2.1.11.创建人：选择器，支持全选或多选，拉取所有业务相关部门下所有用户姓名；'),
				React.createElement('div', { style: reqItemStyle }, '2.1.12.合同结束日期：日期选择器，支持单输入框内双日历选择开始-结束时间；'),
				React.createElement('div', { style: reqSectionStyle }, '3.列表：'),
				React.createElement('div', { style: reqSubStyle }, '3.1.列表展示所有租赁合同信息，字段依次为：合同编码、项目名称、租赁车辆数、已交车辆数、审批状态、合同状态、客户名称、签约公司、业务部门、业务负责人、合同类型、合同审批类型、合同结束日期、客户联系人、联系电话、创建人、创建时间、更新人、最后更新时间、备注、操作；列表右上角为新增、导出；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.1.合同编码：显示租赁合同对应合同编码；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.2.项目名称：显示租赁合同对应项目名称；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.3.租赁车辆数：显示租赁车辆数，点击显示气泡卡片，卡片中列表显示：车辆类型、品牌、型号、车牌号、实际交车日期；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.4.已交车辆数：显示已交车辆数，样式与交互同租赁车辆数，点击显示气泡卡片，卡片中显示已交车列表（同租赁车辆数列表结构）；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.3.1.车辆类型：4.5吨冷链车-轻型厢式货车、18吨双飞翼货车-重型厢式货车、49吨牵引车头-重型半挂牵引车、4.5吨货车-轻型厢式货车、18吨厢式货车-重型厢式货车、重型集装箱半挂车-重型集装箱半挂车、公务用车/小客车-小型普通客车、35吨牵引车头-重型半挂牵引车、重型平板半挂车-重型平板半挂车；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.3.2.品牌：显示租赁合同中对应车辆品牌；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.3.3.型号：显示租赁合同中对应车辆型号；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.3.4.车牌号：显示租赁合同中对应车牌号，无则显示为-，有则显示具体车牌号；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.3.5.实际交车日期：显示租赁合同中对应车辆对应实际交车日期，精确至分钟，格式为YYYY-MM-DD HH:MM;'),
				React.createElement('div', { style: reqItemStyle }, '3.1.4.审批状态：显示租赁合同实际审批状态，状态分为：待审批、审批中、审批通过、审批驳回、未提交；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.4.1.待审批：发起人已提交，但还没有任何流程节点完成审批；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.4.2.审批中：发起人已提交，已有1个以上节点完成审批，但未完成最终节点审批；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.4.3.审批通过：发起人已提交，最终节点完成审批；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.4.4.审批驳回：发起人已提交，任意流程节点驳回，该状态下操作列支持编辑和重新提交；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.4.5.未提交：发起人仅保存，但未提交审批；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.4.6.撤回：发起人主动撤回审批流程；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.5.合同状态：显示租赁合同状态，状态分为：草稿、变更、合同进行中、到期合同、已提交审批、已结束；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.5.1.草稿：发起人仅保存，但未提交审批；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.5.2.变更：发起人提交后，合同已通过审批的基础上，进行了「变更内容」操作，且已提交审批，但未完成最终节点审批；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.5.3.合同进行中：发起人提交后，合同完成最终节点审批；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.5.4.到期合同：发起人已提交，最终节点完成审批，但当前日期超过合同结束日期；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.5.5.已提交审批：发起人初次提交，但未完成最终节点审批；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.5.6.已结束：当前日期超过合同结束日期或在操作列终止合同并完成审核；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.6.客户名称：显示租赁合同创建时所选客户名称，客户名称来自「客户管理」-「客户名称」；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.7.签约公司：显示租赁合同创建时所选签约公司，签约公司来自组织机构表；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.8.业务部门：显示租赁合同创建时所选业务部门，业务部门来自部门表（业务组）；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.9.业务负责人：显示租赁合同创建时所选业务负责人，与业务部门联动，查询该业务组下人员；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.10.合同类型：显示租赁合同类型，类型包括：正式合同、试用合同，于创建租赁合同时选取；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.11.合同审批类型：显示租赁合同创建时所选合同审批类型，包括：标准合同审批、非标准合同审批；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.12.合同结束日期：显示租赁合同结束日期，精确至日，格式为YYYY-MM-DD；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.13.客户联系人：显示租赁合同客户联系人姓名，客户联系人姓名来自「客户管理」-「联系人」；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.14.联系电话：显示租赁合同客户联系电话，客户联系电话来自「客户管理」-「联系人手机」；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.15.创建人：显示租赁合同创建人姓名，取自操作用户姓名；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.16.创建时间：显示租赁合同创建时间，精确至分钟，格式为YYYY-MM-DD HH:MM;'),
				React.createElement('div', { style: reqItemStyle }, '3.1.17.更新人：显示租赁合同最后一次更新人姓名，取自操作用户姓名，如无则显示：-；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.18.最后更新时间：显示租赁合同最后一次更新时间，精确至分钟，格式为YYYY-MM-DD HH:MM，如无则显示：-;'),
				React.createElement('div', { style: reqItemStyle }, '3.1.19.备注：显示租赁合同创建时输入的备注信息，如无则显示：-；'),
				React.createElement('div', { style: reqItemStyle }, '3.1.20.操作：操作分为：查看、编辑、新增车辆、续签合同、删除合同、撤回合同、添加被授权人、附加费用、变更为三方合同、转正式合同、终止合同、上传盖章合同；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.1.查看：跳转车辆租赁合同-查看；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.2.编辑：当「合同状态」为「草稿」时显示，点击跳转编辑租赁合同页面，编辑租赁合同页面可输入项参考「新增租赁合同」页面，并支持对保存时已填内容进行修改；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.3.新增车辆：当「合同状态」为「合同进行中」时显示，仅能在租赁订单信息卡片下新订单中进行车辆新增；新增车辆提交后触发重新审核流程，审核通过后生效（不影响原有合同正常业务）；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.4.续签合同：当「合同状态」为「合同进行中」、「合同到期」时显示，点击跳转车辆租赁合同-续签合同页，提交时重新触发租赁合同审核流程；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.5.删除合同：当「合同状态」为「草稿」时显示，点击删除合同时进行二次确认，提示语：是否确认删除该合同草稿；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.6.撤回合同：当「合同状态」为「已提交审核」时显示，点击撤回合同时进行二次确认，提示语：是否确认撤回该合同；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.7.添加被授权人：当「合同状态」为「合同进行中」时显示，点击弹出卡片，卡片中可编辑被授权人、被授权人联系电话、被授权人身份证，同时支持添加一行、删除已有行等操作；添加被授权人触发重新审核流程，审核通过后生效；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.8.附加费用：当「合同状态」为「合同进行中」时显示，点击弹出卡片，卡片中显示该租赁合同内：车辆类型、品牌、型号、车牌号，同时可对服务项目、费用、生效时间进行编辑，触发租赁合同审核流程，审核通过后生效；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.8.1.服务项目：代处理费用、罚款、违章处理违约金、未参加安全培训、车辆出险、年检年审违约、停车费、设备损坏金（包含易损件）、清洗费、上门收车人工费、上门收车送车行驶费、上门收车基础服务费、保险上浮、保养费用、补办驾驶证、补办牌照、补办营运证、补办加氢证、借用备用钥匙、补配钥匙、租金、氢气费-客、退还车氢量差、能源费补缴、能源费退款、送车上门人工费、送车上门送车行驶费、送车上门基础服务费、保证金、氢气预付费、维修费用、ETC-客、ETC卡缺损费、ETC设备缺损费、电费-客、未结算保养费、未结算维修费、车损费、工具损坏或丢失费、证件费、广告损坏费、送车服务费、接车服务费、补办行驶证、超赔险、轮胎磨损费、无忧包、轮胎保、养护保、尾板；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.8.2.费用：输入框，后缀为元，支持2位小数输入；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.8.3.生效时间：日期选择器，精确至日；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.9.变更为三方合同：当「合同状态」为「合同进行中」时显示，点击跳转车辆租赁合同-变更为三方合同页面，提交时重新触发租赁合同审核流程；；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.10.转正式合同：当「合同类型」为「试用合同」时显示，点击后跳转车辆租赁合同-转正式合同页面，提交时重新触发租赁合同审核流程；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.11.终止合同：当「合同状态」为「合同进行中」时显示，点击后进行二次确认，提示语：是否确认终止合同，确认按钮为提交审核，会重新发起合同审核流程，审核通过后，合同状态变更为：已结束；'),
				React.createElement('div', { style: reqSubItemStyle }, '3.1.20.12.上传盖章合同：当「审批状态」为「审批通过」且法务审核环节尚未上传盖章合同附件时，在「更多」中显示，仅法务部员工可见并可操作；点击后弹出上传窗口，可浏览本地文件上传，支持多文件；上传完成后关闭该入口（列表不再展示「上传盖章合同」）；')
			))
		)
	);
};
