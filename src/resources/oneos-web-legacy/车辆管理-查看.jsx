// 【重要】必须使用 const Component 作为组件变量名
// 运维管理 - 车辆数据 - 车辆详情（只读展示）

const Component = function () {
	var useState = React.useState;

	var antd = window.antd;
	var Breadcrumb = antd.Breadcrumb;
	var Card = antd.Card;
	var Tabs = antd.Tabs;
	var Table = antd.Table;
	var Tag = antd.Tag;
	var Badge = antd.Badge;
	var Alert = antd.Alert;
	var Button = antd.Button;
	var Tooltip = antd.Tooltip;
	var Select = antd.Select;
	var DatePicker = antd.DatePicker;
	var RangePicker = DatePicker.RangePicker;
	var message = antd.message;
	var Image = antd.Image;

	// 顶部概览 mock 数据（与图片一致）
	var overview = {
		plateNo: '浙F06900F',
		plateTag: '租赁',
		vin: 'LA9HE60A0NBAF4031',
		vehicleNo: '22FHD0007',
		owner: '浙江羚牛氢能科技有限公司',
		operateCompany: '羚牛运营（嘉兴）',
		vehicleSource: '自有',
		leaseCompany: '上海迅杰物流有限公司',
		contractNo: 'LNZLHTSH2023071301',
		// 与「车辆管理」列表一致：车辆状态、出库状态、证照状态、保险状态枚举见 web端/车辆管理.jsx 注释
		vehicleStatus: '已交车',
		outStatus: '无',
		licenseStatus: '正常',
		insuranceStatus: '正常',
		location: '浙江省嘉兴市平湖市XXXXXXXXXXX街道XXXXXXXXXXX号XXXXXXXx',
		bodyColor: '白色',
		purchaseDate: '2026-09-09',
		customerName: '上海迅杰物流有限公司',
		gpsLastTime: '2026-09-09 10:50',
		manufactureYear: '2025',
		parkingPlace: '-',
		bizDept: '业务三部',
		ratingTime: '2027-09-09',
		forceScrapDate: '2026-09-09',
		nextInspectionTime: '2026-09-09',
		bizManager: '金可鹏'
	};

	// 型号参数 tab 数据
	var modelParams = {
		brand: '苏龙',
		model: '海格牌KLQ5180XYKFCEV',
		vehicleType: '18吨双飞翼货车',
		fuelType: '氢',
		cabinColor: '绿牌',
		wholeSize: '5995mm x 2145mm x 3130mm'
	};
	var tireInfo = { tireCount: '8', tireSpec: '15/80R22.5' };
	var electricSystem = {
		batteryType: '磷酸铁锂',
		batteryVendor: 'xxxxxxxxxxxxx企业名称',
		capacity: '100000 kWh',
		range: '200 KM'
	};
	var hydrogenSystem = {
		vendor: '某某供氢系统科技有限公司',
		cylinderCapacity: 'xxx L',
		gaugeMode: 'MPa',
		range: '1000 KM'
	};
	var otherSystem = {
		coldMachineVendor: 'xxxxxxxx企业',
		stackVendor: 'XXXXXXXX企业'
	};

	/** 证照管理 Tab：八类证照只读展示（字段口径对齐「证照管理-编辑」） */
	var LICENSE_VIEW_ANCHOR_DATE = '2026-06-01';
	var licensePhotoPlaceholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="336" height="224"><rect fill="#f5f5f5" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#8c8c8c" font-size="14" font-family="system-ui,sans-serif">暂无影像</text></svg>');
	var licenseViewBundle = {
		driverLicense: {
			photos: ['https://picsum.photos/seed/vd-zjf-lic/600/400', 'https://picsum.photos/seed/vd-zjf-lic2/600/400'],
			regDate: '2025-07-01',
			issueDate: '2025-07-01',
			scrapDate: '2038-12-31',
			expireDate: '2027-07-31',
			shNextEvaluation: ''
		},
		transportLicense: {
			photos: ['https://picsum.photos/seed/vd-zjf-trans/600/400'],
			licenseNo: '浙字330482001234号',
			issueDate: '2025-07-15',
			expireDate: '2026-07-14',
			inspectValidUntil: '2026-07-20'
		},
		registrationCert: { photos: ['https://picsum.photos/seed/vd-zjf-reg/600/400'] },
		specialEquipCert: { photos: ['https://picsum.photos/seed/vd-zjf-spec/600/400'] },
		specialEquipDecal: {
			photos: ['https://picsum.photos/seed/vd-zjf-decal/600/400'],
			nextInspectDate: '2026-07-20'
		},
		hydrogenCard: {
			cardNo: 'H2-3304-0690-0088',
			cardType: '中石化加氢卡',
			balance: 8650.5,
			issueDate: '2025-03-10 10:15',
			issueUser: '能源管理部-张晓'
		},
		safetyValve: {
			photos: ['https://picsum.photos/seed/vd-zjf-valve/600/400'],
			inspectDate: '2025-05-10',
			nextInspectDate: '2026-05-09'
		},
		pressureGauge: {
			photos: ['https://picsum.photos/seed/vd-zjf-gauge/600/400'],
			inspectDate: '2025-12-15',
			nextInspectDate: '2026-06-14'
		}
	};
	var CERT_NAV_ITEMS = [
		{ key: 'driverLicense', label: '行驶证' },
		{ key: 'transportLicense', label: '道路运输证' },
		{ key: 'registrationCert', label: '登记证' },
		{ key: 'specialEquipCert', label: '特种设备使用登记证' },
		{ key: 'specialEquipDecal', label: '特种设备使用标识' },
		{ key: 'hydrogenCard', label: '加氢卡' },
		{ key: 'safetyValve', label: '安全阀' },
		{ key: 'pressureGauge', label: '压力表' }
	];

	var maintenanceList = [
		{ key: '1', item: '变速器油', kmCycle: '60000', monthCycle: '24', laborCost: '0', materialCost: '571', total: '571', lastKm: '' },
		{ key: '2', item: '变速器油', kmCycle: '60000', monthCycle: '24', laborCost: '0', materialCost: '571', total: '571', lastKm: '' },
		{ key: '3', item: '变速器油', kmCycle: '60000', monthCycle: '24', laborCost: '0', materialCost: '571', total: '571', lastKm: '5000' },
		{ key: '4', item: '变速器油', kmCycle: '60000', monthCycle: '24', laborCost: '0', materialCost: '571', total: '571', lastKm: '5000' },
		{ key: '5', item: '变速器油', kmCycle: '60000', monthCycle: '24', laborCost: '0', materialCost: '571', total: '571', lastKm: '5000' }
	];

	var activeTab = useState('model');
	var licenseActiveNav = useState('driverLicense');
	var rearFilterDraft = useState({ installRange: null, deviceType: undefined });
	var rearFilterApplied = useState({ installRange: null, deviceType: undefined });
	var leaseFilterDraft = useState({ contractCode: undefined, projectName: undefined, customerName: undefined });
	var leaseFilterApplied = useState({ contractCode: undefined, projectName: undefined, customerName: undefined });
	var accidentFilterDraft = useState({ accidentTimeRange: null, customerName: undefined });
	var accidentFilterApplied = useState({ accidentTimeRange: null, customerName: undefined });
	var violationFilterDraft = useState({ violationTimeRange: null, payStatus: undefined, violationCustomer: undefined });
	var violationFilterApplied = useState({ violationTimeRange: null, payStatus: undefined, violationCustomer: undefined });
	var moveRecordFilterDraft = useState({ moveStartRange: null, destination: undefined, moveType: undefined });
	var moveRecordFilterApplied = useState({ moveStartRange: null, destination: undefined, moveType: undefined });
	var transferRecordFilterDraft = useState({ transferDateRange: null, transferPerson: undefined, receivePerson: undefined });
	var transferRecordFilterApplied = useState({ transferDateRange: null, transferPerson: undefined, receivePerson: undefined });
	var insuranceFilterDraft = useState({ company: undefined, payTimeRange: null });
	var insuranceFilterApplied = useState({ company: undefined, payTimeRange: null });

	var rearDeviceTypeOptions = [
		{ value: 'GPS', label: 'GPS' },
		{ value: '尾板', label: '尾板' },
		{ value: '车身广告', label: '车身广告' },
		{ value: 'G7安全套件', label: 'G7安全套件' },
		{ value: 'G7普通设备', label: 'G7普通设备' },
		{ value: 'G7温控设备', label: 'G7温控设备' },
		{ value: '备胎', label: '备胎' }
	];
	var rearDeviceMockData = [
		{ key: 'rd1', deviceType: 'GPS', supplier: '深圳某某物联科技', actionType: '安装', actionTime: '2024-06-10 09:30', operator: '张三' },
		{ key: 'rd2', deviceType: '尾板', supplier: '上海凯卓液压设备', actionType: '安装', actionTime: '2024-07-02 14:15', operator: '李四' },
		{ key: 'rd3', deviceType: '车身广告', supplier: '广州传媒广告', actionType: '拆卸', actionTime: '2024-08-18 11:00', operator: '王五' },
		{ key: 'rd4', deviceType: 'G7安全套件', supplier: 'G7易流科技', actionType: '安装', actionTime: '2024-09-05 16:40', operator: '赵六' },
		{ key: 'rd5', deviceType: 'G7普通设备', supplier: 'G7易流科技', actionType: '拆卸', actionTime: '2024-10-12 08:20', operator: '张三' },
		{ key: 'rd6', deviceType: 'G7温控设备', supplier: 'G7易流科技', actionType: '安装', actionTime: '2024-11-01 13:45', operator: '陈静' },
		{ key: 'rd7', deviceType: '备胎', supplier: '某某汽配供应链', actionType: '安装', actionTime: '2024-11-20 10:00', operator: '李四' },
		{ key: 'rd8', deviceType: 'GPS', supplier: '深圳某某物联科技', actionType: '拆卸', actionTime: '2025-01-08 15:30', operator: '王五' }
	];

	function matchRearInstallRange(valStr, range) {
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
	function fmtRearActionTime(v) {
		if (v === null || v === undefined) return '-';
		var str = String(v).trim();
		if (!str) return '-';
		if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(str)) return str.slice(0, 16);
		if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str + ' 00:00';
		return str;
	}
	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}
	function fmtDateYMD(v) {
		if (v === null || v === undefined) return '-';
		var s = String(v).trim();
		if (!s || s === '-') return '-';
		if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
		try {
			var d = new Date(s.replace(/-/g, '/'));
			if (isNaN(d.getTime())) return s;
			var p2 = function (n) { return n < 10 ? '0' + n : '' + n; };
			return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
		} catch (e) {
			return s;
		}
	}

	var rearDraft = rearFilterDraft[0];
	var setRearDraft = rearFilterDraft[1];
	var rearApplied = rearFilterApplied[0];
	var setRearApplied = rearFilterApplied[1];
	var rearFiltered = rearDeviceMockData.filter(function (row) {
		if (!matchRearInstallRange(row.actionTime, rearApplied.installRange)) return false;
		if (rearApplied.deviceType && row.deviceType !== rearApplied.deviceType) return false;
		return true;
	});

	var leaseMockData = [
		{ key: 'ls1', contractCode: 'LNZLHTSH2023071301', projectName: '嘉兴冷链城配A线', customerName: '上海迅杰物流有限公司', deliveryDate: '2024-03-15', deliveryPerson: '金可鹏', returnDate: '2024-09-10', returnPerson: '王明' },
		{ key: 'ls2', contractCode: 'HT-2024-009', projectName: '平湖氢能示范运营', customerName: '上海迅杰物流有限公司', deliveryDate: '2025-01-08', deliveryPerson: '李华', returnDate: '-', returnPerson: '-' },
		{ key: 'ls3', contractCode: 'ZL-SH-2023-066', projectName: '上海港短驳项目', customerName: '江苏某某供应链有限公司', deliveryDate: '2023-11-20', deliveryPerson: '赵强', returnDate: '2024-05-30', returnPerson: '陈静' },
		{ key: 'ls4', contractCode: 'LNZLHTSH2023071301', projectName: '沪浙干线运输', customerName: '浙江某某快运', deliveryDate: '2022-08-01', deliveryPerson: '张三', returnDate: '2023-07-14', returnPerson: '李四' },
		{ key: 'ls5', contractCode: 'HT-2024-112', projectName: '长三角城配网络', customerName: '上海迅杰物流有限公司', deliveryDate: '2024-11-01', deliveryPerson: '周伟', returnDate: '2025-02-20', returnPerson: '吴芳' }
	];
	function leaseUniqOptions(rows, field) {
		var seen = {};
		var out = [];
		for (var i = 0; i < rows.length; i++) {
			var v = rows[i][field];
			if (v && v !== '-' && !seen[v]) {
				seen[v] = true;
				out.push({ value: v, label: v });
			}
		}
		return out;
	}
	var leaseContractOptions = leaseUniqOptions(leaseMockData, 'contractCode');
	var leaseProjectOptions = leaseUniqOptions(leaseMockData, 'projectName');
	var leaseCustomerOptions = leaseUniqOptions(leaseMockData, 'customerName');
	var leaseDraft = leaseFilterDraft[0];
	var setLeaseDraft = leaseFilterDraft[1];
	var leaseApplied = leaseFilterApplied[0];
	var setLeaseApplied = leaseFilterApplied[1];
	var leaseFiltered = leaseMockData.filter(function (row) {
		if (leaseApplied.contractCode && row.contractCode !== leaseApplied.contractCode) return false;
		if (leaseApplied.projectName && row.projectName !== leaseApplied.projectName) return false;
		if (leaseApplied.customerName && row.customerName !== leaseApplied.customerName) return false;
		return true;
	});

	function matchAccidentDateRange(valStr, range) {
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
	function cellOrDash(v) {
		if (v === null || v === undefined) return '-';
		var s = String(v).trim();
		return s ? s : '-';
	}

	var accidentMockData = [
		{
			key: 'ac1',
			accidentCode: 'SG202508250001',
			accidentTime: '2025-08-25',
			location: '北京市大兴区京开高速辅路K12段',
			accidentType: '撞固定物',
			customerName: '北京海龙运输有限公司',
			ourLossAmount: '',
			otherLossAmount: '',
			liability: '全责',
			status: '未结案',
			closeTime: '',
			otherFee: '',
			remark: ''
		},
		{
			key: 'ac2',
			accidentCode: 'SG202504180012',
			accidentTime: '2025-04-18',
			location: '上海市浦东新区外环高速出口匝道',
			accidentType: '追尾',
			customerName: '上海迅杰物流有限公司',
			ourLossAmount: '12800.00',
			otherLossAmount: '5600.00',
			liability: '主责',
			status: '已结案',
			closeTime: '2025-05-30',
			otherFee: '800.00',
			remark: '对方车辆已理赔完毕'
		},
		{
			key: 'ac3',
			accidentCode: 'SG202502030088',
			accidentTime: '2025-02-03',
			location: '浙江省嘉兴市平湖市乍兴公路与平廊线交叉口',
			accidentType: '剐蹭',
			customerName: '上海迅杰物流有限公司',
			ourLossAmount: '2100.00',
			otherLossAmount: '',
			liability: '同责',
			status: '未结案',
			closeTime: '',
			otherFee: '',
			remark: ''
		},
		{
			key: 'ac4',
			accidentCode: 'SG202411120156',
			accidentTime: '2024-11-12',
			location: '广东省深圳市南山区南海大道与东滨路交汇处',
			accidentType: '侧翻',
			customerName: '江苏某某供应链有限公司',
			ourLossAmount: '',
			otherLossAmount: '32000.00',
			liability: '次责',
			status: '已结案',
			closeTime: '2024-12-20',
			otherFee: '1200.50',
			remark: '货物转运产生费用'
		},
		{
			key: 'ac5',
			accidentCode: 'SG202409051203',
			accidentTime: '2024-09-05',
			location: '杭州市余杭区文一西路隧道内',
			accidentType: '撞固定物',
			customerName: '浙江某某快运有限公司',
			ourLossAmount: '8600.00',
			otherLossAmount: '',
			liability: '全责',
			status: '未结案',
			closeTime: '',
			otherFee: '',
			remark: '待交警责任认定书'
		}
	];
	var accidentCustomerOptions = leaseUniqOptions(accidentMockData, 'customerName');
	var accidentDraft = accidentFilterDraft[0];
	var setAccidentDraft = accidentFilterDraft[1];
	var accidentApplied = accidentFilterApplied[0];
	var setAccidentApplied = accidentFilterApplied[1];
	var accidentFiltered = accidentMockData.filter(function (row) {
		if (!matchAccidentDateRange(row.accidentTime, accidentApplied.accidentTimeRange)) return false;
		if (accidentApplied.customerName && row.customerName !== accidentApplied.customerName) return false;
		return true;
	});

	var violationPayStatusOptions = [
		{ value: '未缴费', label: '未缴费' },
		{ value: '已缴费', label: '已缴费' }
	];
	var violationMockData = [
		{
			key: 'vz1',
			violationCode: 'WZ202602010001',
			violationBehavior: '闯红灯',
			violationTime: '2026-02-01',
			fineAmount: '100.00',
			payStatus: '未缴费',
			points: '6',
			processed: '未处理',
			violationCustomer: '上海馨想事成物流有限公司',
			photo: '',
			remark: ''
		},
		{
			key: 'vz2',
			violationCode: 'WZ202511200088',
			violationBehavior: '超速20%以下',
			violationTime: '2025-11-20',
			fineAmount: '200.00',
			payStatus: '已缴费',
			points: '3',
			processed: '已处理',
			violationCustomer: '上海迅杰物流有限公司',
			photo: 'mock-url',
			remark: '线上已缴清'
		},
		{
			key: 'vz3',
			violationCode: 'WZ202508150045',
			violationBehavior: '违法停车',
			violationTime: '2025-08-15',
			fineAmount: '150.00',
			payStatus: '未缴费',
			points: '0',
			processed: '未处理',
			violationCustomer: '北京海龙运输有限公司',
			photo: '',
			remark: ''
		},
		{
			key: 'vz4',
			violationCode: 'WZ202506030112',
			violationBehavior: '不按导向车道行驶',
			violationTime: '2025-06-03',
			fineAmount: '100.00',
			payStatus: '已缴费',
			points: '2',
			processed: '已处理',
			violationCustomer: '江苏某某供应链有限公司',
			photo: '',
			remark: ''
		},
		{
			key: 'vz5',
			violationCode: 'WZ202503221956',
			violationBehavior: '闯禁令标志',
			violationTime: '2025-03-22',
			fineAmount: '100.00',
			payStatus: '未缴费',
			points: '3',
			processed: '未处理',
			violationCustomer: '上海馨想事成物流有限公司',
			photo: '',
			remark: '复议中'
		}
	];
	var violationCustomerOptions = leaseUniqOptions(violationMockData, 'violationCustomer');
	var violationDraft = violationFilterDraft[0];
	var setViolationDraft = violationFilterDraft[1];
	var violationApplied = violationFilterApplied[0];
	var setViolationApplied = violationFilterApplied[1];
	var violationFiltered = violationMockData.filter(function (row) {
		if (!matchAccidentDateRange(row.violationTime, violationApplied.violationTimeRange)) return false;
		if (violationApplied.payStatus && row.payStatus !== violationApplied.payStatus) return false;
		if (violationApplied.violationCustomer && row.violationCustomer !== violationApplied.violationCustomer) return false;
		return true;
	});

	var moveDestinationOptions = [
		{ value: '维修站', label: '维修站' },
		{ value: '停车场', label: '停车场' },
		{ value: '其他', label: '其他' }
	];
	var moveTypeFilterOptions = [
		{ value: '维修', label: '维修' },
		{ value: '保养', label: '保养' },
		{ value: '年审', label: '年审' },
		{ value: '其他', label: '其他' }
	];
	var moveRecordMockData = [
		{ key: 'mv1', moveStartAt: '2026-02-20 09:30', moveEndExpectedAt: '2026-02-22 18:00', approvalStatus: '待提交', destination: '维修站', destinationName: '天河氢能维修中心', moveType: '维修', expectedMileageKm: '45.5', startMileageKm: '15230.12', startElectricKwh: '68.40', startHydrogen: '28.30', h2Unit: 'MPa', creatorName: '张明', createTime: '2026-02-20 08:10' },
		{ key: 'mv2', moveStartAt: '2026-02-21 14:00', moveEndExpectedAt: '2026-02-21 17:30', approvalStatus: '审批中', destination: '停车场', destinationName: '西湖景区停车场', moveType: '保养', expectedMileageKm: '12.0', startMileageKm: '12010.00', startElectricKwh: '55.20', startHydrogen: '60.00', h2Unit: '%', creatorName: '王芳', createTime: '2026-02-21 13:20' },
		{ key: 'mv3', moveStartAt: '2026-02-24 08:15', moveEndExpectedAt: '2026-02-24 12:00', approvalStatus: '审批完成', destination: '其他', destinationName: '车管所检测线', moveType: '年审', expectedMileageKm: '8.2', startMileageKm: '8020.50', startElectricKwh: '62.10', startHydrogen: '55.00', h2Unit: '%', creatorName: '李华', createTime: '2026-02-24 07:50' },
		{ key: 'mv4', moveStartAt: '2026-02-25 10:00', moveEndExpectedAt: '2026-02-26 09:00', approvalStatus: '驳回', destination: '维修站', destinationName: '张江服务站', moveType: '其他', expectedMileageKm: '30.0', startMileageKm: '9800.00', startElectricKwh: '69.00', startHydrogen: '26.00', h2Unit: 'MPa', creatorName: '赵强', createTime: '2026-02-25 09:40' },
		{ key: 'mv5', moveStartAt: '2026-02-26 16:20', moveEndExpectedAt: '2026-02-27 10:00', approvalStatus: '撤回', destination: '停车场', destinationName: '宁波江北停车场', moveType: '维修', expectedMileageKm: '22.8', startMileageKm: '15010.00', startElectricKwh: '58.00', startHydrogen: '22.10', h2Unit: 'MPa', creatorName: '陈静', createTime: '2026-02-26 15:55' },
		{ key: 'mv6', moveStartAt: '2026-02-27 07:45', moveEndExpectedAt: '2026-02-27 19:00', approvalStatus: '审批中', destination: '维修站', destinationName: '苏州园区快修站', moveType: '保养', expectedMileageKm: '18.6', startMileageKm: '23105.80', startElectricKwh: '42.50', startHydrogen: '45.20', h2Unit: '%', creatorName: '张明', createTime: '2026-02-27 07:20' },
		{ key: 'mv7', moveStartAt: '2026-02-27 11:00', moveEndExpectedAt: '2026-02-28 17:30', approvalStatus: '审批完成', destination: '其他', destinationName: '顺义综合检测场', moveType: '年审', expectedMileageKm: '35.0', startMileageKm: '8890.00', startElectricKwh: '71.20', startHydrogen: '31.50', h2Unit: 'MPa', creatorName: '王芳', createTime: '2026-02-27 10:35' },
		{ key: 'mv8', moveStartAt: '2026-02-28 08:30', moveEndExpectedAt: '2026-02-28 14:00', approvalStatus: '待提交', destination: '停车场', destinationName: '两江新区枢纽停车场', moveType: '其他', expectedMileageKm: '6.5', startMileageKm: '17660.25', startElectricKwh: '48.90', startHydrogen: '58.00', h2Unit: '%', creatorName: '李华', createTime: '2026-02-28 08:05' },
		{ key: 'mv9', moveStartAt: '2026-02-28 13:15', moveEndExpectedAt: '2026-03-01 09:00', approvalStatus: '驳回', destination: '维修站', destinationName: '成都高新氢能维保站', moveType: '维修', expectedMileageKm: '52.3', startMileageKm: '34500.00', startElectricKwh: '33.60', startHydrogen: '24.80', h2Unit: 'MPa', creatorName: '赵强', createTime: '2026-02-28 12:50' },
		{ key: 'mv10', moveStartAt: '2026-03-01 06:00', moveEndExpectedAt: '2026-03-01 11:45', approvalStatus: '审批完成', destination: '其他', destinationName: '青岛港务临时停放点', moveType: '保养', expectedMileageKm: '15.0', startMileageKm: '11220.00', startElectricKwh: '65.00', startHydrogen: '62.50', h2Unit: '%', creatorName: '陈静', createTime: '2026-03-01 05:40' }
	];
	var moveRecordDraft = moveRecordFilterDraft[0];
	var setMoveRecordDraft = moveRecordFilterDraft[1];
	var moveRecordApplied = moveRecordFilterApplied[0];
	var setMoveRecordApplied = moveRecordFilterApplied[1];
	var moveRecordFiltered = moveRecordMockData.filter(function (row) {
		if (!matchAccidentDateRange(row.moveStartAt, moveRecordApplied.moveStartRange)) return false;
		if (moveRecordApplied.destination && row.destination !== moveRecordApplied.destination) return false;
		if (moveRecordApplied.moveType && row.moveType !== moveRecordApplied.moveType) return false;
		return true;
	});

	var transferMockData = [
		{ key: 'tp1', transferDate: '2026-02-20 09:30', departRegionText: '广东省-广州市', transferPerson: '张明', receiveRegionText: '浙江省-嘉兴市', receivePerson: '王芳', approvalStatus: '待提交', method: '第三方运输', reason: '场站资源调整', vehicleType: '厢式货车', brand: '东风', model: 'DFH1180', carrierName: '顺丰同城运输', departMileageKm: '15230.12', departHydrogen: '28.30', h2Unit: 'MPa', departElectricKwh: '68.40', departParking: '天河智慧停车场', createDate: '2026-02-20 08:10' },
		{ key: 'tp2', transferDate: '2026-02-22 14:10', departRegionText: '浙江省-杭州市', transferPerson: '李华', receiveRegionText: '上海市-上海市', receivePerson: '赵强', approvalStatus: '审批完成', method: '司机驾驶', reason: '项目调度需要', vehicleType: 'SUV', brand: '小鹏', model: 'P7', carrierName: '-', departMileageKm: '12010.00', departHydrogen: '60.00', h2Unit: '%', departElectricKwh: '55.20', departParking: '西湖景区停车场', createDate: '2026-02-22 12:40' },
		{ key: 'tp3', transferDate: '2026-02-24 11:05', departRegionText: '广东省-深圳市', transferPerson: '王芳', receiveRegionText: '浙江省-宁波市', receivePerson: '陈静', approvalStatus: '审批完成', method: '第三方运输', reason: '维修站资源调整', vehicleType: '轿车', brand: '比亚迪', model: '汉', carrierName: '德邦物流', departMileageKm: '8020.50', departHydrogen: '55.00', h2Unit: '%', departElectricKwh: '62.10', departParking: '南山科技园停车场', createDate: '2026-02-24 10:20' },
		{ key: 'tp4', transferDate: '2026-02-25 16:40', departRegionText: '浙江省-嘉兴市', transferPerson: '赵强', receiveRegionText: '上海市-上海市', receivePerson: '李华', approvalStatus: '待提交', method: '司机驾驶', reason: '项目调度需要', vehicleType: '轿车', brand: '蔚来', model: 'ET5', carrierName: '-', departMileageKm: '15010.00', departHydrogen: '22.10', h2Unit: 'MPa', departElectricKwh: '58.00', departParking: '宁波江北停车场', createDate: '2026-02-25 15:55' },
		{ key: 'tp5', transferDate: '2026-02-26 09:15', departRegionText: '上海市-上海市', transferPerson: '陈静', receiveRegionText: '广东省-广州市', receivePerson: '张明', approvalStatus: '审批驳回', method: '第三方运输', reason: '车辆调拨申请驳回样例', vehicleType: '厢式货车', brand: '福田', model: 'BJ1180', carrierName: '顺丰同城运输', departMileageKm: '9800.00', departHydrogen: '26.00', h2Unit: 'MPa', departElectricKwh: '69.00', departParking: '张江园区停车场', createDate: '2026-02-26 08:30' },
		{ key: 'tp6', transferDate: '2026-02-27 13:30', departRegionText: '浙江省-杭州市', transferPerson: '张明', receiveRegionText: '浙江省-嘉兴市', receivePerson: '王芳', approvalStatus: '撤回', method: '司机驾驶', reason: '计划变更，撤回申请', vehicleType: 'SUV', brand: '小鹏', model: 'P7', carrierName: '-', departMileageKm: '12100.20', departHydrogen: '58.00', h2Unit: '%', departElectricKwh: '54.80', departParking: '西湖景区停车场', createDate: '2026-02-27 12:45' },
		{ key: 'tp7', transferDate: '2026-02-28 08:50', departRegionText: '广东省-东莞市', transferPerson: '李华', receiveRegionText: '广东省-深圳市', receivePerson: '赵强', approvalStatus: '审批中', method: '第三方运输', reason: '跨区域调拨', vehicleType: '厢式货车', brand: '东风', model: 'DFH1180', carrierName: '中外运', departMileageKm: '15310.00', departHydrogen: '27.50', h2Unit: 'MPa', departElectricKwh: '67.20', departParking: '松山湖停车场', createDate: '2026-02-28 08:05' },
		{ key: 'tp8', transferDate: '2026-03-01 10:10', departRegionText: '浙江省-宁波市', transferPerson: '王芳', receiveRegionText: '上海市-上海市', receivePerson: '陈静', approvalStatus: '待提交', method: '司机驾驶', reason: '项目新增点位支持', vehicleType: '轿车', brand: '蔚来', model: 'ET5', carrierName: '-', departMileageKm: '15120.00', departHydrogen: '21.80', h2Unit: 'MPa', departElectricKwh: '57.50', departParking: '宁波江北停车场', createDate: '2026-03-01 09:30' },
		{ key: 'tp9', transferDate: '2026-03-02 15:25', departRegionText: '上海市-上海市', transferPerson: '赵强', receiveRegionText: '浙江省-杭州市', receivePerson: '李华', approvalStatus: '审批中', method: '第三方运输', reason: '场站容量调整', vehicleType: '厢式货车', brand: '福田', model: 'BJ1180', carrierName: '德邦物流', departMileageKm: '9850.00', departHydrogen: '24.20', h2Unit: 'MPa', departElectricKwh: '68.30', departParking: '张江园区停车场', createDate: '2026-03-02 14:40' },
		{ key: 'tp10', transferDate: '2026-03-03 09:05', departRegionText: '浙江省-嘉兴市', transferPerson: '陈静', receiveRegionText: '广东省-广州市', receivePerson: '张明', approvalStatus: '待提交', method: '第三方运输', reason: '车辆调拨支持新项目', vehicleType: 'SUV', brand: '小鹏', model: 'P7', carrierName: '顺丰同城运输', departMileageKm: '12220.00', departHydrogen: '56.00', h2Unit: '%', departElectricKwh: '53.90', departParking: '嘉兴南湖停车场', createDate: '2026-03-03 08:20' }
	];
	var transferPersonOptions = leaseUniqOptions(transferMockData, 'transferPerson');
	var transferReceivePersonOptions = leaseUniqOptions(transferMockData, 'receivePerson');
	var transferDraft = transferRecordFilterDraft[0];
	var setTransferDraft = transferRecordFilterDraft[1];
	var transferApplied = transferRecordFilterApplied[0];
	var setTransferApplied = transferRecordFilterApplied[1];
	var transferFiltered = transferMockData.filter(function (row) {
		if (!matchAccidentDateRange(row.transferDate, transferApplied.transferDateRange)) return false;
		if (transferApplied.transferPerson && row.transferPerson !== transferApplied.transferPerson) return false;
		if (transferApplied.receivePerson && row.receivePerson !== transferApplied.receivePerson) return false;
		return true;
	});

	var insuranceMockData = [
		{ key: 'ins1', company: '中国人民财产保险股份有限公司', insuranceType: '交强险', policyNo: 'PDZA202533048200000123', startDate: '2025-01-01', endDate: '2025-12-31', payTime: '2025-01-05', premium: '950.00', insuredName: '浙江羚牛氢能科技有限公司' },
		{ key: 'ins2', company: '中国人民财产保险股份有限公司', insuranceType: '商业险', policyNo: 'PDAA202533048200000456', startDate: '2025-01-01', endDate: '2025-12-31', payTime: '2025-01-05', premium: '12800.50', insuredName: '浙江羚牛氢能科技有限公司' },
		{ key: 'ins3', company: '中国平安财产保险股份有限公司', insuranceType: '承运人责任险', policyNo: 'PAIC-HY-2025-8899', startDate: '2025-03-15', endDate: '2026-03-14', payTime: '2025-03-10', premium: '5600.00', insuredName: '浙江羚牛氢能科技有限公司' },
		{ key: 'ins4', company: '中国太平洋财产保险股份有限公司', insuranceType: '交强险', policyNo: 'CPIC-JQ-2024-7788', startDate: '2024-06-01', endDate: '2025-05-31', payTime: '2024-05-28', premium: '880.00', insuredName: '上海迅杰物流有限公司' },
		{ key: 'ins5', company: '中国人寿财产保险股份有限公司', insuranceType: '商业险', policyNo: 'GPIC-SY-2025-1122', startDate: '2025-07-01', endDate: '2026-06-30', payTime: '2025-06-25', premium: '9850.00', insuredName: '浙江羚牛氢能科技有限公司' },
		{ key: 'ins6', company: '阳光财产保险股份有限公司', insuranceType: '交强险', policyNo: 'YGCI-JQ-2025-3301', startDate: '2025-09-01', endDate: '2026-08-31', payTime: '2025-08-28', premium: '950.00', insuredName: '浙江羚牛氢能科技有限公司' }
	];
	var insuranceCompanyOptions = leaseUniqOptions(insuranceMockData, 'company');
	var insuranceDraft = insuranceFilterDraft[0];
	var setInsuranceDraft = insuranceFilterDraft[1];
	var insuranceApplied = insuranceFilterApplied[0];
	var setInsuranceApplied = insuranceFilterApplied[1];
	var insuranceFiltered = insuranceMockData.filter(function (row) {
		if (insuranceApplied.company && row.company !== insuranceApplied.company) return false;
		if (!matchAccidentDateRange(row.payTime, insuranceApplied.payTimeRange)) return false;
		return true;
	});

	var filterLabelStyle = { marginBottom: 6, fontSize: 14, color: 'rgba(0,0,0,0.65)' };
	var filterItemStyle = { marginBottom: 12 };

	var styles = {
		page: { padding: '16px 24px 40px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontSize: 14 },
		breadcrumb: { marginBottom: 16, color: '#666' },
		breadcrumbSep: { margin: '0 8px', color: '#999' },
		card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' },
		cardBody: { padding: '20px 24px' },
		overviewHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
		plateNo: { fontSize: 18, fontWeight: 600, color: '#333' },
		overviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px' },
		overviewItem: { display: 'flex', gap: 8, minWidth: 0 },
		overviewLabel: { color: '#666', flex: '0 0 110px' },
		overviewValue: { color: '#333', flex: 1 },
		cardTitleBar: { display: 'flex', alignItems: 'center', marginBottom: 16, fontSize: 15, fontWeight: 500 },
		cardTitleBarLine: { width: 4, height: 16, backgroundColor: '#1890ff', marginRight: 8, borderRadius: 2 },
		infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 24px', marginBottom: 20 },
		infoItem: { display: 'flex', gap: 8 },
		infoLabel: { color: '#666', flex: '0 0 100px' },
		infoValue: { color: '#333' }
	};

	function InfoRow(props) {
		var val = props.value || '-';
		var valueNode = props.ellipsisWithTooltip
			? React.createElement(Tooltip, { title: val },
				React.createElement('span', {
					style: Object.assign({}, styles.overviewValue, { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' })
				}, val)
			)
			: React.createElement('span', { style: styles.overviewValue }, val);
		return React.createElement('div', { style: styles.overviewItem },
			React.createElement('span', { style: styles.overviewLabel }, props.label + '：'),
			valueNode
		);
	}

	function CardTitleWithBar(props) {
		return React.createElement('div', { style: styles.cardTitleBar },
			React.createElement('span', { style: styles.cardTitleBarLine }),
			props.title
		);
	}

	function LicViewFieldRow(label, value) {
		var show = value != null && String(value).trim() !== '' && String(value).trim() !== '—';
		return React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 10, fontSize: 14, lineHeight: '22px' } },
			React.createElement('span', { style: { color: 'rgba(0,0,0,0.45)', width: 168, flexShrink: 0 } }, label + '：'),
			React.createElement('span', { style: { color: 'rgba(0,0,0,0.85)' } }, show ? value : '—')
		);
	}

	function mergeLicViewStatus(a, b) {
		var rank = { error: 0, warning: 1, default: 2, success: 3, processing: 2 };
		var ra = rank[a] != null ? rank[a] : 9;
		var rb = rank[b] != null ? rank[b] : 9;
		return ra <= rb ? a : b;
	}

	function diffDaysFromAnchor(dateStr) {
		if (!dateStr) return null;
		var exp = new Date(dateStr);
		var today = new Date(LICENSE_VIEW_ANCHOR_DATE);
		exp.setHours(0, 0, 0, 0);
		today.setHours(0, 0, 0, 0);
		return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
	}

	function getLicViewBadgeStatus(key) {
		var item = licenseViewBundle[key];
		if (!item) return 'default';
		if (key === 'hydrogenCard') {
			return item.cardNo ? 'success' : 'default';
		}
		if (!item.photos || !item.photos.length) return 'default';
		if (key === 'driverLicense') {
			var dd = diffDaysFromAnchor(item.expireDate);
			if (dd == null) return 'success';
			if (dd <= 0) return 'error';
			if (dd <= 90) return 'warning';
			return 'success';
		}
		if (key === 'transportLicense') {
			var fromDate = function (d) {
				var days = diffDaysFromAnchor(d);
				if (days == null) return 'success';
				if (days <= 0) return 'error';
				if (days <= 60) return 'warning';
				return 'success';
			};
			return mergeLicViewStatus(fromDate(item.expireDate), fromDate(item.inspectValidUntil));
		}
		if (key === 'specialEquipDecal' || key === 'safetyValve' || key === 'pressureGauge') {
			var nd = diffDaysFromAnchor(item.nextInspectDate);
			if (nd == null) return 'success';
			if (nd <= 0) return 'error';
			if (nd <= 60) return 'warning';
			return 'success';
		}
		return 'success';
	}

	function scrollToLicenseAnchor(key, setActive) {
		setActive(key);
		var el = document.getElementById('vd-lic-' + key);
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function LicViewPhotoGrid(photos, photoLabel) {
		var list = photos && photos.length ? photos : [];
		if (!list.length) {
			return React.createElement('div', { style: { flexShrink: 0 } },
				React.createElement('div', { style: { marginBottom: 8, color: 'rgba(0,0,0,0.45)', fontSize: 13 } }, photoLabel || '证件照片'),
				React.createElement(Image, {
					width: 168,
					height: 112,
					style: { objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0', background: '#fafafa' },
					src: licensePhotoPlaceholder,
					alt: '暂无影像',
					preview: false
				})
			);
		}
		return React.createElement('div', { style: { flexShrink: 0 } },
			React.createElement('div', { style: { marginBottom: 8, color: 'rgba(0,0,0,0.45)', fontSize: 13 } },
				(photoLabel || '证件照片') + (list.length > 1 ? '（' + list.length + '张）' : '')
			),
			React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap' } },
				list.map(function (url, idx) {
					return React.createElement(Image, {
						key: idx,
						width: 168,
						height: 112,
						style: { objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0', background: '#fafafa' },
						src: url,
						alt: (photoLabel || '证照') + '-' + (idx + 1),
						preview: true
					});
				})
			)
		);
	}

	function LicViewCertCard(cfg) {
		var fields = cfg.fields || [];
		var right = fields.length
			? React.createElement('div', {
				style: { flex: 1, minWidth: 260, display: 'flex', alignItems: 'center', alignSelf: 'stretch' }
			}, React.createElement('div', { style: { width: '100%' } },
				fields.map(function (f, i) { return React.createElement('div', { key: i }, LicViewFieldRow(f.label, f.value)); })
			))
			: null;
		return React.createElement(Card, {
			id: 'vd-lic-' + cfg.id,
			size: 'small',
			style: { marginBottom: 16, scrollMarginTop: 72 },
			title: cfg.title
		},
			cfg.alertTop || null,
			React.createElement('div', { style: { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'stretch' } },
				LicViewPhotoGrid(cfg.photos, cfg.photoLabel),
				right
			),
			cfg.extraBottom || null
		);
	}

	function fmtH2Balance(n) {
		var num = Number(n);
		if (!Number.isFinite(num)) return '—';
		return '¥ ' + num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	var lic = licenseViewBundle;
	var licNavActive = licenseActiveNav[0];
	var setLicNavActive = licenseActiveNav[1];
	var isShPlate = String(overview.plateNo || '').indexOf('沪') === 0;

	var driverDays = diffDaysFromAnchor(lic.driverLicense.expireDate);
	var transportExpDays = diffDaysFromAnchor(lic.transportLicense.expireDate);
	var decalDays = diffDaysFromAnchor(lic.specialEquipDecal.nextInspectDate);

	var licenseIndexBar = React.createElement(Card, {
		size: 'small',
		style: { marginBottom: 16, borderRadius: 12, border: '1px solid #e2e8f0' },
		bodyStyle: { padding: '14px 16px' }
	},
		React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 } },
			React.createElement('span', { style: { fontSize: 14, fontWeight: 700, color: '#0f172a' } }, '证照分类索引'),
			React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, fontSize: 11, color: '#64748b' } },
				React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } }, React.createElement(Badge, { status: 'success' }), '正常'),
				React.createElement(Tooltip, { title: '行驶证≤90天 / 道路运输证≤60天 / 特种设备标识≤60天 / 安全阀≤60天 / 压力表≤60天' },
					React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'help' } }, React.createElement(Badge, { status: 'warning' }), '临期')
				),
				React.createElement(Tooltip, { title: '对应证件检验/有效期已到期' },
					React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'help' } }, React.createElement(Badge, { status: 'error' }), '已到期')
				),
				React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } }, React.createElement(Badge, { status: 'default' }), '未上传')
			)
		),
		React.createElement('div', {
			className: 'vd-lic-nav-grid',
			style: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 },
			role: 'navigation',
			'aria-label': '证照索引'
		},
			CERT_NAV_ITEMS.map(function (nav) {
				var active = licNavActive === nav.key;
				return React.createElement('button', {
					key: nav.key,
					type: 'button',
					onClick: function () { scrollToLicenseAnchor(nav.key, setLicNavActive); },
					style: {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 8,
						padding: '8px 12px',
						borderRadius: 8,
						fontSize: 13,
						fontWeight: active ? 600 : 500,
						color: active ? '#065f46' : '#475569',
						background: active ? '#ecfdf5' : '#f8fafc',
						border: active ? '1px solid #a7f3d0' : '1px solid #f1f5f9',
						cursor: 'pointer',
						textAlign: 'left'
					}
				},
					React.createElement('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, nav.label),
					React.createElement(Badge, { status: getLicViewBadgeStatus(nav.key) })
				);
			})
		)
	);

	var licenseManagementTabContent = React.createElement('div', { style: { padding: '0 4px' } },
		React.createElement('style', null, '@media (max-width:992px){.vd-lic-nav-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}'),
		licenseIndexBar,
		LicViewCertCard({
			id: 'driverLicense',
			title: '行驶证',
			photoLabel: '行驶证照片',
			photos: lic.driverLicense.photos,
			alertTop: driverDays != null && driverDays <= 90
				? React.createElement(Alert, {
					type: driverDays <= 0 ? 'error' : driverDays <= 30 ? 'error' : 'warning',
					showIcon: true,
					style: { marginBottom: 16, borderRadius: 8 },
					message: '行驶证检验临期提醒',
					description: driverDays <= 0
						? '检验有效期已到期，请尽快安排年检。'
						: ('距离检验有效期至还剩 ' + driverDays + ' 天（系统提前 90 天感知）。')
				})
				: null,
			fields: [
				{ label: '注册日期', value: lic.driverLicense.regDate },
				{ label: '发证日期', value: lic.driverLicense.issueDate },
				{ label: '强制报废日期', value: lic.driverLicense.scrapDate },
				{ label: '检验有效期至', value: lic.driverLicense.expireDate }
			],
			extraBottom: isShPlate && lic.driverLicense.shNextEvaluation
				? React.createElement('div', { style: { marginTop: 16, padding: 12, background: '#f5f3ff', borderRadius: 8, border: '1px solid #ddd6fe' } },
					LicViewFieldRow('下次等级评定时间', lic.driverLicense.shNextEvaluation)
				)
				: null
		}),
		LicViewCertCard({
			id: 'transportLicense',
			title: '道路运输证',
			photoLabel: '道路运输证照片',
			photos: lic.transportLicense.photos,
			alertTop: transportExpDays != null && transportExpDays <= 60
				? React.createElement(Alert, {
					type: transportExpDays <= 0 ? 'error' : transportExpDays <= 15 ? 'error' : 'warning',
					showIcon: true,
					style: { marginBottom: 16, borderRadius: 8 },
					message: '道路运输证临期提醒',
					description: '证件有效期距今日 ' + transportExpDays + ' 天（系统提前 60 天列入年审任务）。'
				})
				: null,
			fields: [
				{ label: '经营许可证号', value: lic.transportLicense.licenseNo },
				{ label: '核发时间', value: lic.transportLicense.issueDate },
				{ label: '证件有效期', value: lic.transportLicense.expireDate },
				{ label: '审验有效期', value: lic.transportLicense.inspectValidUntil }
			]
		}),
		LicViewCertCard({
			id: 'registrationCert',
			title: '登记证',
			photoLabel: '登记证照片',
			photos: lic.registrationCert.photos,
			fields: []
		}),
		LicViewCertCard({
			id: 'specialEquipCert',
			title: '特种设备使用登记证',
			photoLabel: '使用登记证照片',
			photos: lic.specialEquipCert.photos,
			fields: []
		}),
		LicViewCertCard({
			id: 'specialEquipDecal',
			title: '特种设备使用标识',
			photoLabel: '使用安全标识照片',
			photos: lic.specialEquipDecal.photos,
			alertTop: decalDays != null && decalDays <= 60
				? React.createElement(Alert, {
					type: decalDays <= 0 || decalDays <= 15 ? 'error' : 'warning',
					showIcon: true,
					style: { marginBottom: 16, borderRadius: 8 },
					message: '特种设备使用标识检验提醒',
					description: decalDays <= 0
						? ('下次检验日期已逾期 ' + Math.abs(decalDays) + ' 天。')
						: ('距离下次检验日期还剩 ' + decalDays + ' 天（提前 60 天感知）。')
				})
				: null,
			fields: [{ label: '下次检验日期', value: lic.specialEquipDecal.nextInspectDate }]
		}),
		React.createElement(Card, {
			id: 'vd-lic-hydrogenCard',
			size: 'small',
			style: { marginBottom: 16, scrollMarginTop: 72 },
			title: '加氢卡'
		},
			React.createElement('div', { style: { display: 'flex', gap: 24, flexWrap: 'wrap' } },
				React.createElement('div', {
					style: {
						flex: '0 0 280px',
						maxWidth: 320,
						padding: 20,
						borderRadius: 12,
						background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
						color: '#e2e8f0',
						boxShadow: '0 8px 24px rgba(15,23,42,0.15)'
					}
				},
					React.createElement('div', { style: { fontSize: 11, color: '#94a3b8', marginBottom: 8 } }, lic.hydrogenCard.cardType || '加氢卡'),
					React.createElement('div', { style: { fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 16, fontFamily: 'monospace' } },
						lic.hydrogenCard.cardNo || '—'
					),
					React.createElement('div', { style: { fontSize: 22, fontWeight: 800, color: '#34d399' } }, fmtH2Balance(lic.hydrogenCard.balance))
				),
				React.createElement('div', { style: { flex: 1, minWidth: 240 } },
					LicViewFieldRow('加氢卡号', lic.hydrogenCard.cardNo),
					LicViewFieldRow('卡类型', lic.hydrogenCard.cardType),
					LicViewFieldRow('实时余额', fmtH2Balance(lic.hydrogenCard.balance)),
					LicViewFieldRow('配发时间', lic.hydrogenCard.issueDate),
					LicViewFieldRow('配发经办人', lic.hydrogenCard.issueUser)
				)
			)
		),
		LicViewCertCard({
			id: 'safetyValve',
			title: '安全阀',
			photoLabel: '安全阀校验报告照片',
			photos: lic.safetyValve.photos,
			fields: [
				{ label: '检验日期', value: lic.safetyValve.inspectDate },
				{ label: '下次检验日期', value: lic.safetyValve.nextInspectDate }
			]
		}),
		LicViewCertCard({
			id: 'pressureGauge',
			title: '压力表',
			photoLabel: '压力表校验报告照片',
			photos: lic.pressureGauge.photos,
			fields: [
				{ label: '检验日期', value: lic.pressureGauge.inspectDate },
				{ label: '下次检验日期', value: lic.pressureGauge.nextInspectDate }
			]
		})
	);

	var tabItems = [
		{
			key: 'model',
			label: '型号参数',
			children: React.createElement('div', { style: { padding: '0 4px' } },
				React.createElement(Card, { size: 'small', style: { marginBottom: 16 } },
					React.createElement(CardTitleWithBar, { title: '型号参数' }),
					React.createElement('div', { style: styles.infoGrid },
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '品牌：'), React.createElement('span', { style: styles.infoValue }, modelParams.brand)),
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '型号：'), React.createElement('span', { style: styles.infoValue }, modelParams.model)),
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '车辆类型：'), React.createElement('span', { style: styles.infoValue }, modelParams.vehicleType)),
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '燃料种类：'), React.createElement('span', { style: styles.infoValue }, modelParams.fuelType)),
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '车厢颜色：'), React.createElement('span', { style: styles.infoValue }, modelParams.cabinColor)),
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '整车尺寸：'), React.createElement('span', { style: styles.infoValue }, modelParams.wholeSize))
					)
				),
				React.createElement(Card, { size: 'small', style: { marginBottom: 16 } },
					React.createElement(CardTitleWithBar, { title: '轮胎情况' }),
					React.createElement('div', { style: styles.infoGrid },
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '轮胎数量：'), React.createElement('span', { style: styles.infoValue }, tireInfo.tireCount)),
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '轮胎规格：'), React.createElement('span', { style: styles.infoValue }, tireInfo.tireSpec))
					)
				),
				React.createElement(Card, { size: 'small', style: { marginBottom: 16 } },
					React.createElement(CardTitleWithBar, { title: '电气系统' }),
					React.createElement('div', { style: styles.infoGrid },
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '电池类型：'), React.createElement('span', { style: styles.infoValue }, electricSystem.batteryType)),
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '电池厂家：'), React.createElement('span', { style: styles.infoValue }, electricSystem.batteryVendor)),
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '储电量：'), React.createElement('span', { style: styles.infoValue }, electricSystem.capacity)),
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '续航里程：'), React.createElement('span', { style: styles.infoValue }, electricSystem.range))
					)
				),
				React.createElement(Card, { size: 'small', style: { marginBottom: 16 } },
					React.createElement(CardTitleWithBar, { title: '供氢系统' }),
					React.createElement('div', { style: styles.infoGrid },
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '供氢系统厂家：'), React.createElement('span', { style: styles.infoValue }, hydrogenSystem.vendor)),
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '氢瓶容量：'), React.createElement('span', { style: styles.infoValue }, hydrogenSystem.cylinderCapacity)),
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '仪表盘模式：'), React.createElement('span', { style: styles.infoValue }, hydrogenSystem.gaugeMode)),
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '续航里程：'), React.createElement('span', { style: styles.infoValue }, hydrogenSystem.range))
					)
				),
				React.createElement(Card, { size: 'small', style: { marginBottom: 16 } },
					React.createElement(CardTitleWithBar, { title: '其他系统' }),
					React.createElement('div', { style: styles.infoGrid },
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '冷机生产企业：'), React.createElement('span', { style: styles.infoValue }, otherSystem.coldMachineVendor)),
						React.createElement('div', { style: styles.infoItem }, React.createElement('span', { style: styles.infoLabel }, '电堆生产企业：'), React.createElement('span', { style: styles.infoValue }, otherSystem.stackVendor))
					)
				),
				React.createElement(Card, { size: 'small' },
					React.createElement(CardTitleWithBar, { title: '保养参数' }),
					React.createElement(Table, {
						dataSource: maintenanceList,
						columns: [
							{ title: '序号', dataIndex: 'key', key: 'key', width: 60, render: function (_, __, i) { return i + 1; } },
							{ title: '养护项目', dataIndex: 'item', key: 'item', width: 120 },
							{ title: '保养公里周期(km)', dataIndex: 'kmCycle', key: 'kmCycle', width: 140 },
							{ title: '保养时间周期(月)', dataIndex: 'monthCycle', key: 'monthCycle', width: 140 },
							{ title: '工时费(元)', dataIndex: 'laborCost', key: 'laborCost', width: 100 },
							{ title: '材料费(元)', dataIndex: 'materialCost', key: 'materialCost', width: 100 },
							{ title: '合计', dataIndex: 'total', key: 'total', width: 80 },
							{ title: '上次保养公里数(KM)', dataIndex: 'lastKm', key: 'lastKm', render: function (v) { return v || '—'; } }
						],
						pagination: false,
						size: 'small',
						bordered: true
					})
				)
			)
		},
		{
			key: 'equip',
			label: '后装设备',
			children: React.createElement('div', { style: { padding: '0 4px' } },
				React.createElement(Card, { size: 'small', style: { marginBottom: 16 } },
					React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px', maxWidth: 900, alignItems: 'start' } },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '安装时间'),
							React.createElement(RangePicker, {
								style: { width: '100%' },
								value: rearDraft.installRange,
								onChange: function (v) { setRearDraft(function (p) { return Object.assign({}, p, { installRange: v }); }); },
								placeholder: ['开始日期', '结束日期']
							})
						),
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '设备类型'),
							React.createElement(Select, {
								placeholder: '请选择设备类型',
								style: { width: '100%' },
								value: rearDraft.deviceType,
								onChange: function (v) { setRearDraft(function (p) { return Object.assign({}, p, { deviceType: v }); }); },
								allowClear: true,
								options: rearDeviceTypeOptions
							})
						)
					),
					React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
						React.createElement(Button, { onClick: function () {
							var empty = { installRange: null, deviceType: undefined };
							setRearDraft(empty);
							setRearApplied(empty);
						} }, '重置'),
						React.createElement(Button, { type: 'primary', onClick: function () { setRearApplied(Object.assign({}, rearDraft)); } }, '查询')
					)
				),
				React.createElement(Table, {
					size: 'small',
					rowKey: 'key',
					bordered: true,
					dataSource: rearFiltered,
					columns: [
						{ title: '设备类型', dataIndex: 'deviceType', key: 'deviceType', width: 140 },
						{ title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 200, ellipsis: true },
						{ title: '类型', dataIndex: 'actionType', key: 'actionType', width: 90 },
						{ title: '安装/拆卸时间', dataIndex: 'actionTime', key: 'actionTime', width: 170, render: function (tv) { return fmtRearActionTime(tv); } },
						{ title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 }
					],
					scroll: { x: 800 },
					pagination: {
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: function (t) { return '共 ' + t + ' 条'; }
					}
				})
			)
		},
		{ key: 'license', label: '证照管理', children: licenseManagementTabContent },
		{
			key: 'lease',
			label: '租赁记录',
			children: React.createElement('div', { style: { padding: '0 4px' } },
				React.createElement(Card, { size: 'small', style: { marginBottom: 16 } },
					React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px', alignItems: 'start' } },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '合同编码'),
							React.createElement(Select, {
								placeholder: '请输入或选择合同编码',
								style: { width: '100%' },
								value: leaseDraft.contractCode,
								onChange: function (v) { setLeaseDraft(function (p) { return Object.assign({}, p, { contractCode: v }); }); },
								allowClear: true,
								showSearch: true,
								options: leaseContractOptions,
								filterOption: filterOption
							})
						),
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '项目名称'),
							React.createElement(Select, {
								placeholder: '请输入或选择项目名称',
								style: { width: '100%' },
								value: leaseDraft.projectName,
								onChange: function (v) { setLeaseDraft(function (p) { return Object.assign({}, p, { projectName: v }); }); },
								allowClear: true,
								showSearch: true,
								options: leaseProjectOptions,
								filterOption: filterOption
							})
						),
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '客户名称'),
							React.createElement(Select, {
								placeholder: '请输入或选择客户名称',
								style: { width: '100%' },
								value: leaseDraft.customerName,
								onChange: function (v) { setLeaseDraft(function (p) { return Object.assign({}, p, { customerName: v }); }); },
								allowClear: true,
								showSearch: true,
								options: leaseCustomerOptions,
								filterOption: filterOption
							})
						)
					),
					React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
						React.createElement(Button, { onClick: function () {
							var empty = { contractCode: undefined, projectName: undefined, customerName: undefined };
							setLeaseDraft(empty);
							setLeaseApplied(empty);
						} }, '重置'),
						React.createElement(Button, { type: 'primary', onClick: function () { setLeaseApplied(Object.assign({}, leaseDraft)); } }, '查询')
					)
				),
				React.createElement(Table, {
					size: 'small',
					rowKey: 'key',
					bordered: true,
					dataSource: leaseFiltered,
					columns: [
						{ title: '合同编码', dataIndex: 'contractCode', key: 'contractCode', width: 180, ellipsis: true },
						{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 160, ellipsis: true },
						{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 200, ellipsis: true },
						{ title: '交车日期', dataIndex: 'deliveryDate', key: 'deliveryDate', width: 120, render: function (tv) { return fmtDateYMD(tv); } },
						{ title: '交车人', dataIndex: 'deliveryPerson', key: 'deliveryPerson', width: 100 },
						{ title: '还车日期', dataIndex: 'returnDate', key: 'returnDate', width: 120, render: function (tv) { return fmtDateYMD(tv); } },
						{ title: '还车人', dataIndex: 'returnPerson', key: 'returnPerson', width: 100, render: function (tv) { return (tv && String(tv) !== '-') ? tv : '-'; } }
					],
					scroll: { x: 1100 },
					pagination: {
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: function (t) { return '共 ' + t + ' 条'; }
					}
				})
			)
		},
		{
			key: 'insurance',
			label: '保险记录',
			children: React.createElement('div', { style: { padding: '0 4px' } },
				React.createElement(Card, { size: 'small', style: { marginBottom: 16 } },
					React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px', maxWidth: 900, alignItems: 'start' } },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '保险公司'),
							React.createElement(Select, {
								placeholder: '请选择保险公司',
								style: { width: '100%' },
								value: insuranceDraft.company,
								onChange: function (v) { setInsuranceDraft(function (p) { return Object.assign({}, p, { company: v }); }); },
								allowClear: true,
								showSearch: true,
								options: insuranceCompanyOptions,
								filterOption: filterOption
							})
						),
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '保险缴费时间'),
							React.createElement(RangePicker, {
								style: { width: '100%' },
								value: insuranceDraft.payTimeRange,
								onChange: function (v) { setInsuranceDraft(function (p) { return Object.assign({}, p, { payTimeRange: v }); }); },
								placeholder: ['开始时间', '结束时间']
							})
						)
					),
					React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
						React.createElement(Button, { onClick: function () {
							var empty = { company: undefined, payTimeRange: null };
							setInsuranceDraft(empty);
							setInsuranceApplied(empty);
						} }, '重置'),
						React.createElement(Button, { type: 'primary', onClick: function () { setInsuranceApplied(Object.assign({}, insuranceDraft)); } }, '查询')
					)
				),
				React.createElement(Table, {
					size: 'small',
					rowKey: 'key',
					bordered: true,
					dataSource: insuranceFiltered,
					columns: [
						{ title: '保险公司', dataIndex: 'company', key: 'company', width: 220, ellipsis: true },
						{ title: '险种', dataIndex: 'insuranceType', key: 'insuranceType', width: 120 },
						{ title: '保单号', dataIndex: 'policyNo', key: 'policyNo', width: 200, ellipsis: true },
						{ title: '保险起期', dataIndex: 'startDate', key: 'startDate', width: 110, render: function (tv) { return fmtDateYMD(tv); } },
						{ title: '保险止期', dataIndex: 'endDate', key: 'endDate', width: 110, render: function (tv) { return fmtDateYMD(tv); } },
						{ title: '缴费时间', dataIndex: 'payTime', key: 'payTime', width: 110, render: function (tv) { return fmtDateYMD(tv); } },
						{ title: '保费（元）', dataIndex: 'premium', key: 'premium', width: 110, align: 'right' },
						{ title: '被保险人', dataIndex: 'insuredName', key: 'insuredName', width: 200, ellipsis: true }
					],
					scroll: { x: 1400 },
					pagination: {
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: function (t) { return '共 ' + t + ' 条'; }
					}
				})
			)
		},
		{ key: 'repair', label: '维修记录', children: React.createElement('div', { style: { padding: 24, color: '#999' } }, '暂无数据') },
		{ key: 'maintain', label: '保养记录', children: React.createElement('div', { style: { padding: 24, color: '#999' } }, '暂无数据') },
		{
			key: 'accident',
			label: '事故记录',
			children: React.createElement('div', { style: { padding: '0 4px' } },
				React.createElement(Card, { size: 'small', style: { marginBottom: 16 } },
					React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px', maxWidth: 900, alignItems: 'start' } },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '事故时间'),
							React.createElement(RangePicker, {
								style: { width: '100%' },
								value: accidentDraft.accidentTimeRange,
								onChange: function (v) { setAccidentDraft(function (p) { return Object.assign({}, p, { accidentTimeRange: v }); }); },
								placeholder: ['开始日期', '结束日期']
							})
						),
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '客户名称'),
							React.createElement(Select, {
								placeholder: '请输入或选择客户名称',
								style: { width: '100%' },
								value: accidentDraft.customerName,
								onChange: function (v) { setAccidentDraft(function (p) { return Object.assign({}, p, { customerName: v }); }); },
								allowClear: true,
								showSearch: true,
								options: accidentCustomerOptions,
								filterOption: filterOption
							})
						)
					),
					React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
						React.createElement(Button, { onClick: function () {
							var empty = { accidentTimeRange: null, customerName: undefined };
							setAccidentDraft(empty);
							setAccidentApplied(empty);
						} }, '重置'),
						React.createElement(Button, { type: 'primary', onClick: function () { setAccidentApplied(Object.assign({}, accidentDraft)); } }, '查询')
					)
				),
				React.createElement(Table, {
					size: 'small',
					rowKey: 'key',
					bordered: true,
					dataSource: accidentFiltered,
					columns: [
						{ title: '事故编码', dataIndex: 'accidentCode', key: 'accidentCode', width: 150, ellipsis: true },
						{ title: '事故时间', dataIndex: 'accidentTime', key: 'accidentTime', width: 110, render: function (tv) { return fmtDateYMD(tv); } },
						{ title: '事故地点', dataIndex: 'location', key: 'location', width: 220, ellipsis: true },
						{ title: '事故类型', dataIndex: 'accidentType', key: 'accidentType', width: 100 },
						{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 200, ellipsis: true },
						{ title: '我方定损金额', dataIndex: 'ourLossAmount', key: 'ourLossAmount', width: 120, render: function (tv) { return cellOrDash(tv); } },
						{ title: '对方定损金额', dataIndex: 'otherLossAmount', key: 'otherLossAmount', width: 120, render: function (tv) { return cellOrDash(tv); } },
						{ title: '责任划分', dataIndex: 'liability', key: 'liability', width: 90 },
						{ title: '事故状态', dataIndex: 'status', key: 'status', width: 90 },
						{ title: '结案时间', dataIndex: 'closeTime', key: 'closeTime', width: 110, render: function (tv) { return fmtDateYMD(tv); } },
						{ title: '其他费用', dataIndex: 'otherFee', key: 'otherFee', width: 100, render: function (tv) { return cellOrDash(tv); } },
						{ title: '备注', dataIndex: 'remark', key: 'remark', width: 160, ellipsis: true, render: function (tv) { return cellOrDash(tv); } }
					],
					scroll: { x: 1800 },
					pagination: {
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: function (t) { return '共 ' + t + ' 条'; }
					}
				})
			)
		},
		{ key: 'fault', label: '故障记录', children: React.createElement('div', { style: { padding: 24, color: '#999' } }, '暂无数据') },
		{
			key: 'violation',
			label: '违章记录',
			children: React.createElement('div', { style: { padding: '0 4px' } },
				React.createElement(Card, { size: 'small', style: { marginBottom: 16 } },
					React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px', alignItems: 'start' } },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '违法时间'),
							React.createElement(RangePicker, {
								style: { width: '100%' },
								value: violationDraft.violationTimeRange,
								onChange: function (v) { setViolationDraft(function (p) { return Object.assign({}, p, { violationTimeRange: v }); }); },
								placeholder: ['开始日期', '结束日期']
							})
						),
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '缴费状态'),
							React.createElement(Select, {
								placeholder: '请选择缴费状态',
								style: { width: '100%' },
								value: violationDraft.payStatus,
								onChange: function (v) { setViolationDraft(function (p) { return Object.assign({}, p, { payStatus: v }); }); },
								allowClear: true,
								options: violationPayStatusOptions
							})
						),
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '违章客户'),
							React.createElement(Select, {
								placeholder: '请输入或选择违章客户',
								style: { width: '100%' },
								value: violationDraft.violationCustomer,
								onChange: function (v) { setViolationDraft(function (p) { return Object.assign({}, p, { violationCustomer: v }); }); },
								allowClear: true,
								showSearch: true,
								options: violationCustomerOptions,
								filterOption: filterOption
							})
						)
					),
					React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
						React.createElement(Button, { onClick: function () {
							var empty = { violationTimeRange: null, payStatus: undefined, violationCustomer: undefined };
							setViolationDraft(empty);
							setViolationApplied(empty);
						} }, '重置'),
						React.createElement(Button, { type: 'primary', onClick: function () { setViolationApplied(Object.assign({}, violationDraft)); } }, '查询')
					)
				),
				React.createElement(Table, {
					size: 'small',
					rowKey: 'key',
					bordered: true,
					dataSource: violationFiltered,
					columns: [
						{ title: '违章编码', dataIndex: 'violationCode', key: 'violationCode', width: 150, ellipsis: true },
						{ title: '违法行为', dataIndex: 'violationBehavior', key: 'violationBehavior', width: 140, ellipsis: true },
						{ title: '违法时间', dataIndex: 'violationTime', key: 'violationTime', width: 110, render: function (tv) { return fmtDateYMD(tv); } },
						{ title: '罚款金额', dataIndex: 'fineAmount', key: 'fineAmount', width: 100, render: function (tv) { return cellOrDash(tv); } },
						{ title: '缴费状态', dataIndex: 'payStatus', key: 'payStatus', width: 90 },
						{ title: '计分值', dataIndex: 'points', key: 'points', width: 80 },
						{ title: '是否处理', dataIndex: 'processed', key: 'processed', width: 90 },
						{ title: '违章客户', dataIndex: 'violationCustomer', key: 'violationCustomer', width: 220, ellipsis: true },
						{
							title: '违章照片',
							key: 'photo',
							width: 100,
							render: function (_, r) {
								if (r.photo) {
									return React.createElement(Button, { type: 'link', size: 'small', onClick: function () { message.info('预览违章照片（原型）'); } }, '查看');
								}
								return '-';
							}
						},
						{ title: '备注', dataIndex: 'remark', key: 'remark', width: 140, ellipsis: true, render: function (tv) { return cellOrDash(tv); } }
					],
					scroll: { x: 1500 },
					pagination: {
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: function (t) { return '共 ' + t + ' 条'; }
					}
				})
			)
		},
		{
			key: 'change',
			label: '异动记录',
			children: React.createElement('div', { style: { padding: '0 4px' } },
				React.createElement(Card, { size: 'small', style: { marginBottom: 16 } },
					React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px', alignItems: 'start' } },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '异动开始日期'),
							React.createElement(RangePicker, {
								style: { width: '100%' },
								value: moveRecordDraft.moveStartRange,
								onChange: function (v) { setMoveRecordDraft(function (p) { return Object.assign({}, p, { moveStartRange: v }); }); },
								placeholder: ['开始日期', '结束日期']
							})
						),
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '异动目的地'),
							React.createElement(Select, {
								placeholder: '请选择异动目的地',
								style: { width: '100%' },
								value: moveRecordDraft.destination,
								onChange: function (v) { setMoveRecordDraft(function (p) { return Object.assign({}, p, { destination: v }); }); },
								allowClear: true,
								options: moveDestinationOptions
							})
						),
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '异动类型'),
							React.createElement(Select, {
								placeholder: '请选择异动类型',
								style: { width: '100%' },
								value: moveRecordDraft.moveType,
								onChange: function (v) { setMoveRecordDraft(function (p) { return Object.assign({}, p, { moveType: v }); }); },
								allowClear: true,
								options: moveTypeFilterOptions
							})
						)
					),
					React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
						React.createElement(Button, { onClick: function () {
							var empty = { moveStartRange: null, destination: undefined, moveType: undefined };
							setMoveRecordDraft(empty);
							setMoveRecordApplied(empty);
						} }, '重置'),
						React.createElement(Button, { type: 'primary', onClick: function () { setMoveRecordApplied(Object.assign({}, moveRecordDraft)); } }, '查询')
					)
				),
				React.createElement(Table, {
					size: 'small',
					rowKey: 'key',
					bordered: true,
					dataSource: moveRecordFiltered,
					columns: [
						{ title: '异动开始日期', dataIndex: 'moveStartAt', key: 'moveStartAt', width: 160, render: function (tv) { return fmtRearActionTime(tv); } },
						{ title: '异动预计结束日期', dataIndex: 'moveEndExpectedAt', key: 'moveEndExpectedAt', width: 170, render: function (tv) { return fmtRearActionTime(tv); } },
						{ title: '审批状态', dataIndex: 'approvalStatus', key: 'approvalStatus', width: 100 },
						{ title: '异动目的地', dataIndex: 'destination', key: 'destination', width: 100 },
						{ title: '目的地名称', dataIndex: 'destinationName', key: 'destinationName', width: 180, ellipsis: true },
						{ title: '异动类型', dataIndex: 'moveType', key: 'moveType', width: 90 },
						{ title: '预计异动里程（km）', dataIndex: 'expectedMileageKm', key: 'expectedMileageKm', width: 150 },
						{ title: '异动开始里程（km）', dataIndex: 'startMileageKm', key: 'startMileageKm', width: 150 },
						{ title: '异动开始电量（kWh）', dataIndex: 'startElectricKwh', key: 'startElectricKwh', width: 150 },
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
						{ title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160, render: function (tv) { return fmtRearActionTime(tv); } }
					],
					scroll: { x: 2000 },
					pagination: {
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: function (t) { return '共 ' + t + ' 条'; }
					}
				})
			)
		},
		{
			key: 'transfer',
			label: '调拨记录',
			children: React.createElement('div', { style: { padding: '0 4px' } },
				React.createElement(Card, { size: 'small', style: { marginBottom: 16 } },
					React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px', alignItems: 'start' } },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '调拨日期'),
							React.createElement(RangePicker, {
								style: { width: '100%' },
								value: transferDraft.transferDateRange,
								onChange: function (v) { setTransferDraft(function (p) { return Object.assign({}, p, { transferDateRange: v }); }); },
								placeholder: ['开始日期', '结束日期']
							})
						),
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '调拨人'),
							React.createElement(Select, {
								placeholder: '请输入或选择调拨人',
								style: { width: '100%' },
								value: transferDraft.transferPerson,
								onChange: function (v) { setTransferDraft(function (p) { return Object.assign({}, p, { transferPerson: v }); }); },
								allowClear: true,
								showSearch: true,
								options: transferPersonOptions,
								filterOption: filterOption
							})
						),
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '接收人'),
							React.createElement(Select, {
								placeholder: '请输入或选择接收人',
								style: { width: '100%' },
								value: transferDraft.receivePerson,
								onChange: function (v) { setTransferDraft(function (p) { return Object.assign({}, p, { receivePerson: v }); }); },
								allowClear: true,
								showSearch: true,
								options: transferReceivePersonOptions,
								filterOption: filterOption
							})
						)
					),
					React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
						React.createElement(Button, { onClick: function () {
							var empty = { transferDateRange: null, transferPerson: undefined, receivePerson: undefined };
							setTransferDraft(empty);
							setTransferApplied(empty);
						} }, '重置'),
						React.createElement(Button, { type: 'primary', onClick: function () { setTransferApplied(Object.assign({}, transferDraft)); } }, '查询')
					)
				),
				React.createElement(Table, {
					size: 'small',
					rowKey: 'key',
					bordered: true,
					dataSource: transferFiltered,
					columns: [
						{ title: '调拨日期', dataIndex: 'transferDate', key: 'transferDate', width: 160, render: function (tv) { return fmtRearActionTime(tv); } },
						{ title: '出发区域', dataIndex: 'departRegionText', key: 'departRegionText', width: 130 },
						{ title: '调拨人', dataIndex: 'transferPerson', key: 'transferPerson', width: 90 },
						{ title: '接收区域', dataIndex: 'receiveRegionText', key: 'receiveRegionText', width: 130 },
						{ title: '接收人', dataIndex: 'receivePerson', key: 'receivePerson', width: 90 },
						{ title: '审批状态', dataIndex: 'approvalStatus', key: 'approvalStatus', width: 100 },
						{ title: '调拨方式', dataIndex: 'method', key: 'method', width: 110 },
						{ title: '调拨原因', dataIndex: 'reason', key: 'reason', width: 160, ellipsis: true },
						{ title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 100 },
						{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 90 },
						{ title: '型号', dataIndex: 'model', key: 'model', width: 100, ellipsis: true },
						{ title: '运输方名称', dataIndex: 'carrierName', key: 'carrierName', width: 140, ellipsis: true, render: function (tv) { return (tv && String(tv) !== '-') ? tv : '—'; } },
						{ title: '出发里程（km）', dataIndex: 'departMileageKm', key: 'departMileageKm', width: 130 },
						{
							title: '出发氢量',
							key: 'departHydrogen',
							width: 110,
							render: function (_, r) {
								var u = r.h2Unit || '';
								return (r.departHydrogen != null && r.departHydrogen !== '') ? String(r.departHydrogen) + (u ? u : '') : '—';
							}
						},
						{ title: '出发电量（kWh）', dataIndex: 'departElectricKwh', key: 'departElectricKwh', width: 130 },
						{ title: '出发停车场', dataIndex: 'departParking', key: 'departParking', width: 150, ellipsis: true },
						{ title: '创建日期', dataIndex: 'createDate', key: 'createDate', width: 160, render: function (tv) { return fmtRearActionTime(tv); } }
					],
					scroll: { x: 2400 },
					pagination: {
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: function (t) { return '共 ' + t + ' 条'; }
					}
				})
			)
		}
	];

	var breadcrumbNodes = [
		React.createElement('span', { key: '1' }, '车辆管理'),
		React.createElement('span', { key: '2', style: styles.breadcrumbSep }, ' / '),
		React.createElement('span', { key: '3' }, '车辆数据'),
		React.createElement('span', { key: '4', style: styles.breadcrumbSep }, ' / '),
		React.createElement('span', { key: '5', style: { color: '#1890ff' } }, '详情')
	];

	return React.createElement('div', { style: styles.page },
		React.createElement('div', { style: styles.breadcrumb }, breadcrumbNodes),
		React.createElement('div', { style: styles.card },
			React.createElement('div', { style: styles.cardBody },
				React.createElement('div', { style: styles.overviewHeader },
					React.createElement('span', { style: styles.plateNo }, overview.plateNo),
					React.createElement(Tag, { color: 'blue' }, overview.plateTag)
				),
				React.createElement('div', { style: styles.overviewGrid },
					React.createElement(InfoRow, { label: '车架号', value: overview.vin }),
					React.createElement(InfoRow, { label: '车辆编号', value: overview.vehicleNo }),
					React.createElement(InfoRow, { label: '登记所有权', value: overview.owner }),
					React.createElement(InfoRow, { label: '运营公司', value: overview.operateCompany }),
					React.createElement(InfoRow, { label: '车辆来源', value: overview.vehicleSource }),
					React.createElement(InfoRow, { label: '租赁公司', value: overview.leaseCompany }),
					React.createElement(InfoRow, { label: '合同编号', value: overview.contractNo }),
					React.createElement(InfoRow, { label: '车辆状态', value: overview.vehicleStatus }),
					React.createElement(InfoRow, { label: '出库状态', value: overview.outStatus }),
					React.createElement(InfoRow, { label: '证照状态', value: overview.licenseStatus }),
					React.createElement(InfoRow, { label: '保险状态', value: overview.insuranceStatus }),
					React.createElement(InfoRow, { label: '车辆当前位置', value: overview.location, ellipsisWithTooltip: true }),
					React.createElement(InfoRow, { label: '车身颜色', value: overview.bodyColor }),
					React.createElement(InfoRow, { label: '采购入库日期', value: overview.purchaseDate }),
					React.createElement(InfoRow, { label: '客户名称', value: overview.customerName }),
					React.createElement(InfoRow, { label: 'GPS最后上传', value: overview.gpsLastTime }),
					React.createElement(InfoRow, { label: '出厂年份', value: overview.manufactureYear }),
					React.createElement(InfoRow, { label: '停车位置', value: overview.parkingPlace }),
					React.createElement(InfoRow, { label: '业务部门', value: overview.bizDept }),
					React.createElement(InfoRow, { label: '等评时间', value: overview.ratingTime }),
					React.createElement(InfoRow, { label: '强制报废期', value: overview.forceScrapDate }),
					React.createElement(InfoRow, { label: '下次年检时间', value: overview.nextInspectionTime }),
					React.createElement(InfoRow, { label: '业务负责人', value: overview.bizManager })
				)
			)
		),
		React.createElement('div', { style: Object.assign({}, styles.card, { marginBottom: 0 }) },
			React.createElement('div', { style: styles.cardBody },
				React.createElement(Tabs, {
					activeKey: activeTab[0],
					onChange: function (key) { activeTab[1](key); },
					items: tabItems,
					type: 'line'
				})
			)
		)
	);
};

if (typeof window !== 'undefined') {
	window.Component = Component;
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			var rootEl = document.getElementById('root');
			if (rootEl && window.ReactDOM && window.React) {
				var root = ReactDOM.createRoot(rootEl);
				root.render(React.createElement(Component));
			}
		});
	} else {
		var rootEl = document.getElementById('root');
		if (rootEl && window.ReactDOM && window.React) {
			var root = ReactDOM.createRoot(rootEl);
			root.render(React.createElement(Component));
		}
	}
}
