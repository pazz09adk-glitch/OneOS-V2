/**
 * 租赁合同列表样例数据 — 字段与新增/编辑页表单结构对齐
 */

import { getLessorCompanyById } from '../contract-template-management/contract-template-vars.js';
import { getContractTemplateOption } from '../contract-template-management/contract-template-catalog.js';
import { getContractTypeLabel } from '../contract-template-management/contract-template-types.js';

export var SIGNING_COMPANY_LESSOR_IDS = {
	'嘉兴羚牛': 'jx',
	'上海羚牛': 'sh',
	'广东羚牛': 'gd',
};

export var PAYMENT_PERIOD_CYCLE_LABELS = {
	1: '月付',
	3: '季付',
	6: '半年付',
	12: '年付',
};

/** @deprecated 列表展示请用 formatPaymentPeriodLabel */
export var PAYMENT_PERIOD_LABELS = {
	1: '月付',
	3: '季付',
	6: '半年付',
	12: '年付',
};

export var PAYMENT_METHOD_LABELS = {
	advance: '先付后用',
	postpay: '先用后付',
};

export var HYDROGEN_PAYMENT_LABELS = {
	self: '自行解决',
	prepay: '预付款',
	month: '按月结算',
};

var LEGACY_PAYMENT_PERIOD_MAP = {
	'1个月': 1,
	'3个月': 3,
	'6个月': 6,
	'12个月': 12,
};

var LEGACY_HYDROGEN_PAYMENT_MAP = {
	'自行解决': 'self',
	'预付款': 'prepay',
	'按月结算': 'month',
};

export function formatPaymentPeriodLabel(period) {
	if (period == null || period === '') return '-';
	var months = typeof period === 'number' ? period : LEGACY_PAYMENT_PERIOD_MAP[period];
	if (months != null) return PAYMENT_PERIOD_CYCLE_LABELS[months] || '-';
	return String(period);
}

export function formatPaymentMethodLabel(method) {
	if (!method) return '-';
	return PAYMENT_METHOD_LABELS[method] || String(method);
}

export function formatHydrogenPaymentLabel(method) {
	if (!method) return '-';
	if (HYDROGEN_PAYMENT_LABELS[method]) return HYDROGEN_PAYMENT_LABELS[method];
	var code = LEGACY_HYDROGEN_PAYMENT_MAP[method];
	if (code) return HYDROGEN_PAYMENT_LABELS[code] || '-';
	return String(method);
}

export var MILEAGE_PERIOD_LABELS = {
	month: '每月',
	quarter: '每季度',
	year: '每年度',
};

/** 子表里程要求周期标签：每月 / 每季度 / 每年度 */
export var CONTRACT_MILEAGE_PERIOD_TAG_LABELS = {
	month: '每月',
	quarter: '每季度',
	year: '每年度',
};

export function getContractMileagePeriodTag(period) {
	return CONTRACT_MILEAGE_PERIOD_TAG_LABELS[period] || '';
}

export function formatContractMileageTargetKm(km) {
	if (km == null || km === '') return '-';
	var num = Number(km);
	if (!Number.isFinite(num)) return String(km);
	return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' km';
}

export function resolveContractVehicleMileageSource(vehicle) {
	if (!vehicle) return '人工';
	if (vehicle.mileageSource) return vehicle.mileageSource;
	if (vehicle.telematicsLinked === true || vehicle.onlineStatus === '在线') return '车机';
	if (vehicle.telematicsLinked === false && vehicle.gpsTime) return 'GPS';
	if (vehicle.gpsTime) return 'GPS';
	return '人工';
}

export function getContractVehicleMileageSourceTagClass(source) {
	if (source === '车机') return 'vm-tag vm-tag-teal';
	if (source === 'GPS') return 'vm-tag vm-tag-gps';
	return 'vm-tag vm-tag-manual';
}

export function computeContractVehicleRemainingMileage(record, vehicle) {
	if (!record || !record.hasMinimumMileage) return null;
	var target = Number(record.mileageTargetKm);
	if (!Number.isFinite(target)) return null;
	var progress = Number(vehicle && vehicle.mileageProgress);
	if (!Number.isFinite(progress)) progress = 0;
	return Math.max(0, Math.round(target * (100 - progress) / 100));
}

export function formatContractVehicleRemainingMileage(km) {
	if (km == null) return '—';
	return '剩余 ' + Number(km).toLocaleString('zh-CN') + ' km';
}

var CONTRACT_TYPE_FULL_NAME_FALLBACK = {
	'正式合同': '现代18吨正式合同',
	'试用合同': '现代18吨试用合同',
};

var RETURN_SETTLEMENT_STATUSES = ['待提交', '审批中', '已完成'];

export function parseContractDateOnly(raw) {
	if (raw == null || raw === '' || raw === '-') return null;
	var text = String(raw).trim().slice(0, 10);
	var parts = text.split('-');
	if (parts.length !== 3) return null;
	var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
	return Number.isNaN(date.getTime()) ? null : date;
}

export function formatContractPeriodStartDate(date) {
	if (!date) return '—';
	var y = date.getFullYear();
	var m = String(date.getMonth() + 1).padStart(2, '0');
	var d = String(date.getDate()).padStart(2, '0');
	return y + '-' + m + '-' + d;
}

/** 当期里程周期剩余天数（至周期结束日） */
export function computeMileagePeriodDaysRemaining(periodStartDate, mileagePeriod, referenceDate) {
	var end = computeCurrentMileagePeriodEnd(periodStartDate, mileagePeriod);
	if (!end) return null;
	var ref = referenceDate instanceof Date ? referenceDate : new Date();
	ref.setHours(0, 0, 0, 0);
	var endDay = new Date(end.getTime());
	endDay.setHours(0, 0, 0, 0);
	return Math.max(0, daysBetween(ref, endDay));
}

/** 当前统计周期内已完成里程（当前里程 − 周期起始里程） */
export function computeVehiclePeriodCompletedMileage(vehicle) {
	if (!vehicle) return null;
	var current = Number(vehicle.currentMileage);
	var start = Number(vehicle.periodStartMileage);
	if (!Number.isFinite(current) || !Number.isFinite(start)) return null;
	return Math.max(0, Math.round(current - start));
}

function daysBetween(startDate, endDate) {
	var ms = endDate.getTime() - startDate.getTime();
	return Math.max(0, Math.floor(ms / 86400000));
}

export function computeCurrentMileagePeriodStart(deliveryRaw, period, referenceDate) {
	var delivery = parseContractDateOnly(deliveryRaw);
	var ref = referenceDate instanceof Date ? referenceDate : (parseContractDateOnly(referenceDate) || new Date());
	if (!delivery) return null;
	if (period === 'month') {
		var monthStart = new Date(ref.getFullYear(), ref.getMonth(), delivery.getDate());
		if (monthStart > ref) monthStart.setMonth(monthStart.getMonth() - 1);
		if (monthStart < delivery) return new Date(delivery.getTime());
		return monthStart;
	}
	if (period === 'quarter') {
		var quarterStart = new Date(delivery.getTime());
		while (true) {
			var nextQuarter = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, quarterStart.getDate());
			if (nextQuarter > ref) return quarterStart;
			quarterStart = nextQuarter;
		}
	}
	if (period === 'year') {
		var yearStart = new Date(ref.getFullYear(), delivery.getMonth(), delivery.getDate());
		if (yearStart > ref) yearStart.setFullYear(yearStart.getFullYear() - 1);
		if (yearStart < delivery) return new Date(delivery.getTime());
		return yearStart;
	}
	return new Date(delivery.getTime());
}

export function estimatePeriodStartMileage(deliveryRaw, periodStart, deliveryMileage, currentMileage) {
	var delivery = parseContractDateOnly(deliveryRaw);
	var start = periodStart instanceof Date ? periodStart : parseContractDateOnly(periodStart);
	var deliveryMile = Number(deliveryMileage);
	var currentMile = Number(currentMileage);
	if (!Number.isFinite(deliveryMile)) deliveryMile = 0;
	if (!Number.isFinite(currentMile)) currentMile = deliveryMile;
	if (!delivery || !start) return deliveryMile;
	if (start.getTime() <= delivery.getTime()) return deliveryMile;
	var ref = new Date();
	var totalDays = Math.max(1, daysBetween(delivery, ref));
	var periodDays = Math.max(0, daysBetween(start, ref));
	var driven = Math.max(0, currentMile - deliveryMile);
	var ratioBeforePeriod = Math.max(0, Math.min(1, 1 - periodDays / totalDays));
	var startMileage = deliveryMile + Math.round(driven * ratioBeforePeriod);
	return Math.min(currentMile, Math.max(deliveryMile, startMileage));
}

/** 当前统计周期目标里程（周期起始里程 + 当期里程要求） */
export function computeVehiclePeriodTargetMileage(record, vehicle) {
	if (!record || !vehicle) return null;
	var startMileage = Number(vehicle.periodStartMileage);
	var targetKm = Number(record.mileageTargetKm);
	if (!Number.isFinite(startMileage) || !Number.isFinite(targetKm)) return null;
	return Math.round(startMileage + targetKm);
}

/** 当前里程统计周期的结束日（即下一周期起始日） */
export function computeCurrentMileagePeriodEnd(periodStart, period) {
	var start = periodStart instanceof Date ? periodStart : parseContractDateOnly(periodStart);
	if (!start) return null;
	if (period === 'month') {
		return new Date(start.getFullYear(), start.getMonth() + 1, start.getDate());
	}
	if (period === 'quarter') {
		return new Date(start.getFullYear(), start.getMonth() + 3, start.getDate());
	}
	if (period === 'year') {
		return new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());
	}
	return null;
}

export var MILEAGE_FORECAST_GAP_KM = 200;

export function estimateVehicleDailyAvgMileage7d(vehicle, record) {
	if (!vehicle) return 0;
	if (vehicle.dailyAvgMileage7d != null && Number.isFinite(Number(vehicle.dailyAvgMileage7d))) {
		return Math.max(0, Number(vehicle.dailyAvgMileage7d));
	}
	var target = Number(record && record.mileageTargetKm);
	var progress = Math.min(100, Math.max(0, Number(vehicle.mileageProgress) || 0));
	if (!Number.isFinite(target) || target <= 0) return 0;
	var drivenKm = target * progress / 100;
	return Math.max(0, Math.round(drivenKm / 7));
}

export function computeVehicleMileageForecastStatus(record, vehicle) {
	if (!record || !record.hasMinimumMileage || !vehicle) return null;
	if (!isContractVehicleDelivered(vehicle)) return null;
	var remainingKm = computeContractVehicleRemainingMileage(record, vehicle);
	if (remainingKm == null) return null;
	var deliveryRaw = vehicle.deliveryTime || vehicle.actualDelivery;
	var periodStart = computeCurrentMileagePeriodStart(deliveryRaw, record.mileagePeriod);
	var periodEnd = computeCurrentMileagePeriodEnd(periodStart, record.mileagePeriod);
	var daysLeft = periodEnd ? Math.max(0, daysBetween(new Date(), periodEnd)) : 0;
	var dailyAvg = estimateVehicleDailyAvgMileage7d(vehicle, record);
	var achievableKm = dailyAvg * daysLeft;
	if (achievableKm < remainingKm) return '预计无法完成';
	var gapKm = Math.abs(remainingKm - achievableKm);
	if (gapKm <= MILEAGE_FORECAST_GAP_KM) return '存在完成风险';
	return '预计可完成';
}

export function inferContractTemplateId(record) {
	if (record && record.contractTemplateId) return record.contractTemplateId;
	var contractType = record && record.contractType;
	if (contractType === '试用合同') {
		var vehicles = record.vehicles || [];
		var has18t = vehicles.some(function (vehicle) {
			var text = String(vehicle.model || vehicle.vehicleType || '');
			return /18/.test(text);
		});
		return has18t ? 'doc-5' : 'doc-4';
	}
	if (contractType === '正式合同') return 'doc-2';
	return '';
}

export function resolveContractTemplateTypeLabel(record) {
	if (!record) return '—';
	if (record.contractTemplateTypeLabel) return record.contractTemplateTypeLabel;
	var templateId = inferContractTemplateId(record);
	if (templateId) {
		var option = getContractTemplateOption(templateId);
		if (option && option.contractTypeLabel) return option.contractTypeLabel;
	}
	var shortType = record.contractType || '';
	if (CONTRACT_TYPE_FULL_NAME_FALLBACK[shortType]) return CONTRACT_TYPE_FULL_NAME_FALLBACK[shortType];
	return getContractTypeLabel(shortType);
}

/** 列表筛选：合同模板（合同名称维度，如正式合同 / 试用合同） */
export function resolveRecordContractTemplateCategory(record) {
	if (!record) return '';
	var templateId = record.contractTemplateId || inferContractTemplateId(record);
	var option = templateId ? getContractTemplateOption(templateId) : null;
	if (option && option.contractType) return option.contractType;
	return record.contractType || '';
}

/** 列表筛选：标准合同名称（已发布模板文档名，如 2026年标准商用车租赁合同） */
export function resolveRecordContractTemplateStandardName(record) {
	if (!record) return '';
	var templateId = record.contractTemplateId || inferContractTemplateId(record);
	if (!templateId) return '';
	var option = getContractTemplateOption(templateId);
	if (option) return option.title || option.fileName || templateId;
	return templateId;
}

export function getReturnSettlementStatusTone(status) {
	if (status === '已完成' || status === '已结算') return 'green';
	if (status === '审批中') return 'amber';
	if (status === '去处理' || status === '待提交') return 'blue';
	return 'gray';
}

/** 还车应结款内部状态 → 子表展示文案 */
export function resolveReturnSettlementDisplayLabel(status) {
	if (!status || status === '待提交' || status === '待处理') return '去处理';
	if (status === '审批中') return '审批中';
	if (status === '已完成' || status === '已结算') return '已完成';
	return '去处理';
}

/** 还车应结款子表点击行为：edit 编辑页 / view 查看页 / null 不可点 */
export function resolveReturnSettlementCellMode(status) {
	var label = resolveReturnSettlementDisplayLabel(status);
	if (label === '去处理') return 'edit';
	if (label === '已完成') return 'view';
	return null;
}

export function getReturnSettlementDisplayTone(displayLabel) {
	if (displayLabel === '已完成') return 'green';
	if (displayLabel === '审批中') return 'amber';
	if (displayLabel === '去处理') return 'blue';
	return 'gray';
}

export function resolveLeaseBillStatus(vehicle) {
	if (!isContractVehicleDelivered(vehicle)) return null;
	return vehicle.leaseBillStatus || '正常';
}

export function getLeaseBillStatusTone(status) {
	if (status === '欠费') return 'red';
	return 'green';
}

export function formatMileageSummary(record) {
	if (!record.hasMinimumMileage) return '无最低里程要求';
	var period = MILEAGE_PERIOD_LABELS[record.mileagePeriod] || '';
	var km = record.mileageTargetKm != null ? record.mileageTargetKm : '-';
	return period + km + ' 公里';
}

/** 合同子表车辆行：无里程要求时显示「无里程要求」 */
export function formatContractMileageRequirement(record) {
	if (!record || !record.hasMinimumMileage) return '无里程要求';
	var period = MILEAGE_PERIOD_LABELS[record.mileagePeriod] || '';
	var km = record.mileageTargetKm != null ? record.mileageTargetKm : '-';
	return period + km + ' 公里';
}

/** 与车辆管理 formatMileage 一致：车机在线且空值时展示 0 km */
export function formatContractVehicleCurrentMileage(mile, vehicle, emptyFallback) {
	var empty = emptyFallback != null ? emptyFallback : '—';
	var source = resolveContractVehicleMileageSource(vehicle);
	var forceZero = source === '车机' && vehicle && vehicle.onlineStatus === '在线';
	if (mile == null || mile === '' || mile === '-') {
		return forceZero ? '0 km' : empty;
	}
	var num = Number(mile);
	if (!Number.isFinite(num)) return String(mile);
	return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' km';
}

export function isContractVehicleMileageOnline(vehicle) {
	return vehicle && vehicle.onlineStatus === '在线';
}

export function formatDeliveryRegion(region) {
	if (!region || !region.length) return '-';
	return region.join(' / ');
}

export var DELIVERY_REGION_TBD_LABEL = '交还车时约定';

export var LEASE_DELIVERY_DATE_UNCONFIRMED_LABEL = '暂未确认';

export function isContractDeliveryRegionTbd(record) {
	if (!record) return false;
	return Boolean(record.deliveryRegionTbd || record.deliveryRegionMode === 'tbd');
}

export function isContractDeliveryDateUnconfirmed(record) {
	if (!record) return false;
	return Boolean(
		record.deliveryDateTbd
		|| record.deliveryDateMode === 'unconfirmed'
		|| isDeliveryDateTbd(record.deliveryDate)
		|| record.deliveryDate === LEASE_DELIVERY_DATE_UNCONFIRMED_LABEL,
	);
}

export function formatContractDeliveryRegionLabel(record) {
	if (!record) return '-';
	if (isContractDeliveryRegionTbd(record)) return DELIVERY_REGION_TBD_LABEL;
	return formatDeliveryRegion(record.deliveryRegion);
}

export function canEditContractDeliveryArrangement(record) {
	if (!record) return false;
	if (record.deliveryPlanLocked === true || record.pickupReceivableCompleted === true) {
		return false;
	}
	return (record.vehicles || []).some(function (vehicle) {
		return !isContractVehicleDelivered(vehicle);
	});
}

var LEGACY_CONTRACT_APPROVAL_TYPE_MAP = {
	'标准合同审批': '标准合同',
	'非标准合同审批': '非标准合同',
};

export function formatContractApprovalTypeLabel(value) {
	if (!value) return '-';
	return LEGACY_CONTRACT_APPROVAL_TYPE_MAP[value] || value;
}

export function getContractApprovalFlowKindLabel(record) {
	var label = formatContractApprovalTypeLabel(record && record.contractApprovalType);
	return label === '非标准合同' ? '非标准合同流程' : '标准合同流程';
}

var SAMPLE_AUTHORIZED_DELEGATES = [
	{ name: '王明', contact: '13900139001', idNumber: '330102199001011234' },
	{ name: '李华', contact: '13900139002', idNumber: '330102199002022345' },
	{ name: '赵强', contact: '13900139003', idNumber: '330102199003033456' },
	{ name: '陈静', contact: '13900139004', idNumber: '330102199004044567' },
	{ name: '周磊', contact: '13900139005', idNumber: '330102199005055678' },
];

export function buildAuthorizedDelegatesSample(count) {
	var total = Math.max(0, Number(count) || 0);
	var list = [];
	for (var i = 0; i < total; i++) {
		list.push(Object.assign({}, SAMPLE_AUTHORIZED_DELEGATES[i % SAMPLE_AUTHORIZED_DELEGATES.length]));
	}
	return list;
}

export function getAuthorizedDelegates(record) {
	if (record.authorizedDelegates && record.authorizedDelegates.length) {
		return record.authorizedDelegates;
	}
	if (record.poaUploaded === true && (record.delegateCount || 0) > 0) {
		return buildAuthorizedDelegatesSample(record.delegateCount);
	}
	return [];
}

/** 列表「受托人」列是否需提示补充授权委托书与受托人信息 */
export function needsContractDelegateSupplement(record) {
	if (!record) return false;
	if (record.delegateSupplementRequired === false) return false;
	if (record.poaUploaded === true && (record.delegateCount || 0) > 0 && getAuthorizedDelegates(record).length > 0) {
		return false;
	}
	return true;
}

/**
 * 在租车辆概览 — 品牌 / 型号 / 车型用例枚举（与主数据公告型号对齐）
 * 卡片按「品牌 + 型号」聚合；飞驰 49 吨牵引车头含 3 个公告型号子项。
 */
export var ON_LEASE_FLEET_VEHICLE_CASES = [
	{
		brand: '现代',
		model: '帕力安牌18吨双飞翼货车',
		officialModel: '帕力安牌XDQ5180XYKFCEV06',
		vehicleType: '重型厢式货车',
	},
	{
		brand: '楚风',
		model: '18吨厢式货车',
		officialModel: '楚风牌HQG5180XXYFCEV',
		vehicleType: '重型厢式货车',
	},
	{
		brand: '苏龙',
		model: '海格牌18吨双飞翼货车',
		officialModel: '海格牌KLQ5180XYKFCEV',
		vehicleType: '重型厢式货车',
	},
	{
		brand: '跃进',
		model: '4.5吨冷链车',
		officialModel: '跃进牌SH5047XLCZFFCEVMZ1',
		vehicleType: '轻型厢式货车',
	},
	{
		brand: '飞驰',
		model: '49吨牵引车头',
		officialModel: '飞驰牌FSQ4250SFFCEV',
		vehicleType: '重型半挂牵引车',
	},
	{
		brand: '飞驰',
		model: '49吨牵引车头',
		officialModel: '飞驰牌FSQ4250SFFCEV6',
		vehicleType: '重型半挂牵引车',
	},
	{
		brand: '飞驰',
		model: '49吨牵引车头',
		officialModel: '飞驰牌FSQ4250SFFCEV3',
		vehicleType: '重型半挂牵引车',
	},
];

function buildOnLeaseFleetDemoVehicles(cases) {
	var deliveryTimes = [
		'2025-01-08 09:00',
		'2025-01-12 10:30',
		'2025-01-15 14:00',
		'2025-02-01 08:00',
		'2025-02-05 11:00',
		'2025-02-06 13:20',
		'2025-02-08 16:45',
	];
	var plates = ['浙A88001', '浙A88002', '浙A88003', '浙A88004', '浙A88005', '浙A88006', '浙A88007'];
	return (cases || []).map(function (item, index) {
		return {
			brand: item.brand,
			model: item.model,
			officialModel: item.officialModel,
			vehicleType: item.vehicleType,
			plateNo: plates[index] || '-',
			actualDelivery: deliveryTimes[index] || '2025-02-01 09:00',
			deliveryPerson: '车队运维',
			leasePeriodMonths: 24,
		};
	});
}

export var LEASE_CONTRACT_LIST_RECORDS = [
	{
		id: '1',
		contractCode: 'HT-ZL-2025-001',
		projectName: '嘉兴氢能示范项目',
		vehicleCount: 2,
		vehicles: [
			{ vehicleType: '4.5吨冷链车', brand: '现代', model: '帕力安牌4.5吨冷链车', plateNo: '浙A12345', actualDelivery: '2025-01-10 09:00', deliveryPerson: '张运维' },
			{ vehicleType: '18吨厢式货车', brand: '现代', model: '18吨氢燃料电池车', plateNo: '-', actualDelivery: '-', deliveryPerson: '-' },
		],
		approvalStatus: '未提交',
		contractStatus: '草稿',
		customerName: '嘉兴某某物流有限公司',
		signingCompany: '嘉兴羚牛',
		businessDept: '业务1部',
		businessOwner: '张经理',
		contractType: '正式合同',
		contractApprovalType: '标准合同',
		paymentPeriod: 1,
		hydrogenPaymentMethod: 'self',
		deliveryRegion: ['浙江省', '嘉兴市'],
		deliveryDate: '2025-03-01',
		deliveryDateChangeLogs: [
			{
				beforeDate: '2025-02-28',
				afterDate: '2025-03-01',
				operatorName: '张经理',
				operateTime: '2025-02-10 16:20:00',
			},
		],
		insuredVehicleCount: 2,
		thirdPartyLiabilityMillion: 200,
		hasMinimumMileage: true,
		mileagePeriod: 'month',
		mileageTargetKm: 6000,
		delegateCount: 0,
		poaUploaded: false,
		contractEndDate: '2026-02-16',
		contactName: '张三',
		contactPhone: '13800138001',
		creator: '张经理',
		createTime: '2025-01-05 10:00',
		updater: '-',
		updateTime: '-',
		remark: '草稿待完善',
		legalStampedContractUploaded: undefined,
	},
	{
		id: '2',
		contractCode: 'HT-ZL-2025-002',
		projectName: '上海物流租赁项目',
		vehicleCount: 1,
		vehicles: [
			{ vehicleType: '小客车', brand: '宇通', model: '氢燃料电池客车', plateNo: '沪D66666', actualDelivery: '2025-02-01 11:00', deliveryPerson: '王运维' },
		],
		approvalStatus: '未提交',
		contractStatus: '草稿',
		customerName: '上海某某运输有限公司',
		signingCompany: '上海羚牛',
		businessDept: '业务2部',
		businessOwner: '李专员',
		contractType: '试用合同',
		contractApprovalType: '非标准合同',
		paymentPeriod: 3,
		hydrogenPaymentMethod: 'prepay',
		deliveryRegion: ['上海市', '上海市'],
		deliveryDate: '2025-02-20',
		insuredVehicleCount: 1,
		thirdPartyLiabilityMillion: 100,
		hasMinimumMileage: false,
		mileagePeriod: 'month',
		mileageTargetKm: null,
		delegateCount: 1,
		contractEndDate: '2025-08-01',
		contactName: '李四',
		contactPhone: '13800138002',
		creator: '李专员',
		createTime: '2025-02-10 09:00',
		updater: '-',
		updateTime: '-',
		remark: '试用期 3 个月',
		legalStampedContractUploaded: undefined,
	},
	{
		id: '3',
		contractCode: 'HT-ZL-2025-003',
		projectName: '杭州城配租赁项目',
		vehicleCount: 1,
		vehicles: [
			{ vehicleType: '4.5吨货车', brand: '跃进', model: '4.2米冷链车', plateNo: '浙B20002', actualDelivery: '2025-02-15 08:30', deliveryPerson: '赵运维' },
		],
		approvalStatus: '待审批',
		contractStatus: '已提交审批',
		customerName: '杭州某某租赁有限公司',
		signingCompany: '嘉兴羚牛',
		businessDept: '业务3部',
		businessOwner: '王专员',
		contractType: '正式合同',
		contractApprovalType: '标准合同',
		paymentPeriod: 1,
		hydrogenPaymentMethod: 'self',
		deliveryRegion: ['浙江省', '杭州市'],
		deliveryDate: '2025-03-10',
		insuredVehicleCount: 1,
		thirdPartyLiabilityMillion: 200,
		hasMinimumMileage: true,
		mileagePeriod: 'quarter',
		mileageTargetKm: 18000,
		delegateCount: 2,
		poaUploaded: true,
		authorizedDelegates: [
			{ name: '王明', contact: '13900139001', idNumber: '330102199001011234' },
			{ name: '李华', contact: '13900139002', idNumber: '330102199002022345' },
		],
		poaRemark: '授权委托书已上传，两名受托人信息与现场核验一致。',
		contractEndDate: '2026-06-30',
		contactName: '王五',
		contactPhone: '13800138003',
		creator: '王专员',
		createTime: '2025-02-12 11:00',
		updater: '-',
		updateTime: '-',
		remark: '-',
		legalStampedContractUploaded: undefined,
		approvalFlowNodes: [
			{ nodeTitle: '业务负责人审批', result: 'pending', pendingApprovers: ['王专员'] },
		],
	},
	{
		id: '4',
		contractCode: 'HT-ZL-2025-004',
		projectName: '宁波冷链运输项目',
		vehicleCount: 2,
		vehicles: [
			{ vehicleType: '18吨双飞翼货车', brand: '苏龙', model: '9.6米氢燃料电池车', plateNo: '-', actualDelivery: '-', deliveryPerson: '-' },
			{ vehicleType: '49吨牵引车头', brand: '飞驰', model: '集卡头', plateNo: '浙C30003', actualDelivery: '2025-02-18 14:00', returnTime: '2025-04-01 09:00', deliveryPerson: '孙运维', returnSettlementStatus: '审批中', returnSettlementApprover: '赵主管、王财务', leaseBillStatus: '正常' },
		],
		approvalStatus: '审批中',
		contractStatus: '已提交审批',
		contractOriginFlow: 'renew',
		sourceContractCode: 'HT-ZL-2024-009',
		customerName: '嘉兴某某物流有限公司',
		signingCompany: '嘉兴羚牛',
		businessDept: '业务1部',
		businessOwner: '张经理',
		contractType: '正式合同',
		contractApprovalType: '非标准合同',
		paymentPeriod: 6,
		hydrogenPaymentMethod: 'prepay',
		deliveryRegion: ['浙江省', '宁波市'],
		deliveryDate: '2025-04-01',
		insuredVehicleCount: 2,
		thirdPartyLiabilityMillion: 300,
		hasMinimumMileage: true,
		mileagePeriod: 'month',
		mileageTargetKm: 8000,
		delegateCount: 1,
		poaUploaded: true,
		authorizedDelegates: [
			{ name: '孙丽华', contact: '13900139011', idNumber: '330102198803033210' },
		],
		poaRemark: '授权委托书已归档，受托人孙丽华为客户指定接车人。',
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
			{ nodeTitle: '业务服务主管审批', result: 'passed', operatorName: '姚守涛', operatorTime: '2026-04-29 17:57:15', comment: '租赁订单车辆配置与报价一致，同意进入下一节点。' },
			{ nodeTitle: '发起审批', result: 'passed', operatorName: '超级用户', operatorTime: '2026-04-28 17:44:45' },
			{ nodeTitle: '业务负责人审批', result: 'pending', pendingApprovers: ['超级用户', '金可鹏'] },
		],
	},
	{
		id: '5',
		contractCode: 'HT-ZL-2025-005',
		projectName: '苏州城配试点项目',
		vehicleCount: 1,
		vehicles: [
			{ vehicleType: '重型平板半挂车', brand: '飞驰', model: '半挂车', plateNo: '苏E50005', actualDelivery: '2025-02-20 09:00', returnTime: '2025-04-10 11:00', deliveryPerson: '周运维' },
		],
		approvalStatus: '审批中',
		contractStatus: '变更',
		customerName: '上海某某运输有限公司',
		signingCompany: '上海羚牛',
		businessDept: '业务2部',
		businessOwner: '李专员',
		contractType: '正式合同',
		contractApprovalType: '标准合同',
		paymentPeriod: 3,
		hydrogenPaymentMethod: 'self',
		deliveryRegion: ['江苏省', '苏州市'],
		deliveryDate: '2025-03-15',
		insuredVehicleCount: 1,
		thirdPartyLiabilityMillion: 200,
		hasMinimumMileage: false,
		mileagePeriod: 'month',
		mileageTargetKm: null,
		delegateCount: 0,
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
			{ nodeTitle: '法务审核', result: 'passed', operatorName: '李法务', operatorTime: '2025-02-21 18:00:00', comment: '变更后条款已复核，未发现新增合规风险。' },
			{ nodeTitle: '发起审批', result: 'passed', operatorName: '李专员', operatorTime: '2025-02-22 10:00:00', comment: '因客户增购 1 台车辆发起变更审批。' },
			{ nodeTitle: '业务负责人审批', result: 'pending', pendingApprovers: ['张经理', '赵总监'] },
		],
	},
	{
		id: '6',
		contractCode: 'HT-ZL-2025-006',
		projectName: '南京氢能示范项目',
		vehicleCount: 3,
		vehicles: [
			{ vehicleType: '4.5吨冷链车', brand: '现代', model: '帕力安牌4.5吨冷链车', plateNo: '苏A60006', actualDelivery: '2025-01-20 08:00', returnTime: '2025-06-01 10:00', deliveryPerson: '吴运维', leasePeriodMonths: 24 },
			{ vehicleType: '18吨厢式货车', brand: '现代', model: '18吨氢燃料电池车', plateNo: '苏A60007', actualDelivery: '2025-01-21 10:00', returnTime: '2025-06-01 10:00', deliveryPerson: '郑运维', leasePeriodMonths: 24 },
			{ vehicleType: '牵引车头', brand: '飞驰', model: '集卡头', plateNo: '苏A60008', actualDelivery: '2025-01-22 14:00', deliveryPerson: '冯运维', leasePeriodMonths: 24 },
		],
		approvalStatus: '审批通过',
		contractStatus: '合同进行中',
		customerName: '杭州某某租赁有限公司',
		signingCompany: '广东羚牛',
		businessDept: '业务3部',
		businessOwner: '王专员',
		contractType: '正式合同',
		contractApprovalType: '标准合同',
		paymentPeriod: 12,
		hydrogenPaymentMethod: 'prepay',
		deliveryRegion: ['江苏省', '南京市'],
		deliveryDate: '2025-01-15',
		insuredVehicleCount: 3,
		thirdPartyLiabilityMillion: 300,
		hasMinimumMileage: true,
		mileagePeriod: 'year',
		mileageTargetKm: 120000,
		delegateCount: 3,
		poaUploaded: true,
		authorizedDelegates: [
			{ name: '王明', contact: '13900139001', idNumber: '330102199001011234' },
			{ name: '李华', contact: '13900139002', idNumber: '330102199002022345' },
			{ name: '赵强', contact: '13900139003', idNumber: '330102199003033456' },
		],
		poaRemark: '三车批量合同授权委托书已上传，受托人名单与盖章扫描件一致。',
		contractEndDate: '2026-12-31',
		contactName: '周八',
		contactPhone: '13900139003',
		creator: '王专员',
		createTime: '2025-01-15 09:00',
		updater: '王专员',
		updateTime: '2025-01-25 11:00',
		remark: '-',
		contractSigningMethod: 'offline_manual',
		stampedContractFiles: [
			{ uid: 'stamp-6-1', name: 'HT-ZL-2025-006-盖章合同.pdf' },
			{ uid: 'stamp-6-2', name: 'HT-ZL-2025-006-授权委托书扫描件.jpg' },
		],
		offlineStampSupplementedAt: '2025-01-25 11:00',
		legalStampedContractUploaded: true,
		approvalFlowNodes: [
			{ nodeTitle: '法务审核', result: 'passed', operatorName: '陈法务', operatorTime: '2025-01-22 16:40:00', comment: '标准合同审批，正文无红线条款改动。' },
			{ nodeTitle: '业务负责人审批', result: 'passed', operatorName: '赵总监', operatorTime: '2025-01-20 11:05:00', comment: '客户为 A 级客户，三车批量租赁方案可行，同意通过。' },
			{ nodeTitle: '业务服务主管审批', result: 'passed', operatorName: '刘主管', operatorTime: '2025-01-18 15:20:00', comment: '氢费预付条款已与客户确认。' },
			{ nodeTitle: '发起审批', result: 'passed', operatorName: '王专员', operatorTime: '2025-01-16 09:30:00' },
		],
	},
	{
		id: '7',
		contractCode: 'HT-ZL-2025-007',
		projectName: '无锡试用租赁项目',
		vehicleCount: 1,
		vehicles: [
			{
				vehicleType: '小客车',
				brand: '宇通',
				model: '氢燃料电池客车',
				plateNo: '苏B70007',
				actualDelivery: '2025-02-01 09:30',
				returnTime: '2025-05-15 16:00',
				deliveryPerson: '陈运维',
				leasePeriodMonths: 3,
				extraServiceValues: ['wear-insurance'],
				extraFee: '80',
				extraFeeEffectiveDate: '2025-02-01',
				extraFeeBillingMode: '先付后用',
			},
		],
		approvalStatus: '审批通过',
		contractStatus: '合同进行中',
		customerName: '嘉兴某某物流有限公司',
		signingCompany: '嘉兴羚牛',
		businessDept: '业务1部',
		businessOwner: '张经理',
		contractType: '试用合同',
		contractApprovalType: '非标准合同',
		paymentPeriod: 1,
		hydrogenPaymentMethod: 'self',
		deliveryRegion: ['江苏省', '无锡市'],
		deliveryDate: '2025-02-05',
		insuredVehicleCount: 1,
		thirdPartyLiabilityMillion: 100,
		hasMinimumMileage: false,
		mileagePeriod: 'month',
		mileageTargetKm: null,
		delegateCount: 1,
		poaUploaded: true,
		authorizedDelegates: [
			{ name: '吴九', contact: '13900139004', idNumber: '320211199005051122' },
		],
		poaRemark: '试用合同授权委托书已维护，受托人吴九负责无锡区域接车。',
		contractEndDate: '2025-07-10',
		contactName: '吴九',
		contactPhone: '13900139004',
		creator: '张经理',
		createTime: '2025-01-28 10:00',
		updater: '-',
		updateTime: '-',
		remark: '试用 3 个月',
		contractSigningMethod: 'offline_manual',
		customerPrincipalPhone: '13900139004',
		customerPrincipalEmail: 'zhangsan@example.com',
		legalStampedContractUploaded: false,
		approvalFlowNodes: [
			{ nodeTitle: '法务审核', result: 'passed', operatorName: '周法务', operatorTime: '2025-01-30 17:10:00', comment: '试用合同条款已按非标准审批要求补充说明。' },
			{ nodeTitle: '业务负责人审批', result: 'passed', operatorName: '张经理', operatorTime: '2025-01-29 10:22:00', comment: '试用期 3 个月，到期后转正式合同。' },
			{ nodeTitle: '发起审批', result: 'passed', operatorName: '张经理', operatorTime: '2025-01-28 10:15:00' },
		],
	},
	{
		id: '8',
		contractCode: 'HT-ZL-2025-008',
		projectName: '常州物流合作项目',
		vehicleCount: 2,
		vehicles: [
			{ vehicleType: '集装箱半挂车', brand: '飞驰', model: '半挂车', plateNo: '-', actualDelivery: '-', deliveryPerson: '-' },
			{ vehicleType: '4.5吨货车', brand: '跃进', model: '4.2米冷链车', plateNo: '-', actualDelivery: '-', deliveryPerson: '-' },
		],
		approvalStatus: '审批驳回',
		contractStatus: '已提交审批',
		customerName: '上海某某运输有限公司',
		signingCompany: '上海羚牛',
		businessDept: '业务2部',
		businessOwner: '李专员',
		contractType: '正式合同',
		contractApprovalType: '标准合同',
		paymentPeriod: 3,
		hydrogenPaymentMethod: 'prepay',
		deliveryRegion: ['江苏省', '常州市'],
		deliveryDate: '2025-04-20',
		insuredVehicleCount: 2,
		thirdPartyLiabilityMillion: 200,
		hasMinimumMileage: true,
		mileagePeriod: 'month',
		mileageTargetKm: 5000,
		delegateCount: 2,
		contractEndDate: '2026-08-15',
		contactName: '郑十',
		contactPhone: '13900139005',
		creator: '李专员',
		createTime: '2025-02-20 14:00',
		updater: '李专员',
		updateTime: '2025-02-23 09:00',
		remark: '驳回原因：费用条款需调整',
		legalStampedContractUploaded: undefined,
		approvalFlowNodes: [
			{ nodeTitle: '发起审批', result: 'passed', operatorName: '李专员', operatorTime: '2025-02-20 14:30:00' },
			{ nodeTitle: '业务负责人审批', result: 'rejected', operatorName: '张经理', operatorTime: '2025-02-23 09:00:00', comment: '预付金额与商务报价不一致，请按最新报价单调整费用条款后重新提交。' },
		],
	},
	{
		id: '9',
		contractCode: 'HT-ZL-2024-009',
		projectName: '南通去年到期项目',
		vehicleCount: 2,
		vehicles: [
			{ vehicleType: '18吨双飞翼货车', brand: '苏龙', model: '9.6米氢燃料电池车', plateNo: '苏F90009', actualDelivery: '2024-03-01 09:00', returnTime: '2024-12-20 15:00', deliveryPerson: '褚运维', leasePeriodMonths: 12 },
			{ vehicleType: '4.5吨冷链车', brand: '现代', model: '帕力安牌4.5吨冷链车', plateNo: '苏F90010', actualDelivery: '2024-03-02 10:00', returnTime: '2024-12-20 15:00', deliveryPerson: '卫运维', leasePeriodMonths: 12 },
		],
		approvalStatus: '审批终止',
		contractStatus: '审批终止',
		terminatedBy: 'renewal',
		supersededByContractCode: 'HT-ZL-2025-012',
		customerName: '杭州某某租赁有限公司',
		signingCompany: '嘉兴羚牛',
		businessDept: '业务3部',
		businessOwner: '王专员',
		contractType: '正式合同',
		contractApprovalType: '标准合同',
		paymentPeriod: 6,
		hydrogenPaymentMethod: 'self',
		deliveryRegion: ['江苏省', '南通市'],
		deliveryDate: '2024-02-15',
		insuredVehicleCount: 2,
		thirdPartyLiabilityMillion: 200,
		hasMinimumMileage: true,
		mileagePeriod: 'quarter',
		mileageTargetKm: 15000,
		delegateCount: 0,
		contractEndDate: '2024-12-31',
		contactName: '王五',
		contactPhone: '13800138003',
		creator: '王专员',
		createTime: '2024-02-20 10:00',
		updater: '王专员',
		updateTime: '2024-12-20 16:00',
		remark: '已到期可续签',
		legalStampedContractUploaded: true,
		approvalFlowNodes: [
			{ nodeTitle: '法务审核', result: 'passed', operatorName: '陈法务', operatorTime: '2024-02-25 16:00:00', comment: '归档合同与系统版本一致。' },
			{ nodeTitle: '业务负责人审批', result: 'passed', operatorName: '王专员', operatorTime: '2024-02-22 14:30:00', comment: '南通区域试点项目，同意按标准流程审批。' },
			{ nodeTitle: '发起审批', result: 'passed', operatorName: '王专员', operatorTime: '2024-02-20 10:30:00' },
		],
	},
	{
		id: '10',
		contractCode: 'HT-ZL-2024-010',
		projectName: '镇江到期合同项目',
		vehicleCount: 1,
		vehicles: [
			{ vehicleType: '小客车', brand: '宇通', model: '氢燃料电池客车', plateNo: '苏L00100', actualDelivery: '2024-06-01 11:00', deliveryPerson: '蒋运维' },
		],
		approvalStatus: '审批通过',
		contractStatus: '已结束',
		contractOriginFlow: 'trialToFormal',
		sourceContractCode: 'HT-ZL-2025-007',
		customerName: '嘉兴某某物流有限公司',
		signingCompany: '嘉兴羚牛',
		businessDept: '业务1部',
		businessOwner: '张经理',
		contractType: '正式合同',
		contractApprovalType: '非标准合同',
		paymentPeriod: 1,
		hydrogenPaymentMethod: 'self',
		deliveryRegion: ['江苏省', '镇江市'],
		deliveryDate: '2024-05-10',
		insuredVehicleCount: 1,
		thirdPartyLiabilityMillion: 100,
		hasMinimumMileage: false,
		mileagePeriod: 'month',
		mileageTargetKm: null,
		delegateCount: 1,
		poaUploaded: true,
		authorizedDelegates: [
			{ name: '张三', contact: '13800138001', idNumber: '330102198501011234' },
		],
		poaRemark: '历史合同授权委托书已补录归档。',
		contractEndDate: '2025-01-15',
		contactName: '张三',
		contactPhone: '13800138001',
		creator: '张经理',
		createTime: '2024-05-20 09:00',
		updater: '张经理',
		updateTime: '2025-01-10 14:00',
		remark: '-',
		legalStampedContractUploaded: true,
		onlineEsignCompletedAt: '2024-05-25 16:30',
		approvalFlowNodes: [
			{ nodeTitle: '业务负责人审批', result: 'passed', operatorName: '张经理', operatorTime: '2024-05-22 11:00:00', comment: '单车试用转正式合作，条款无异常。' },
			{ nodeTitle: '发起审批', result: 'passed', operatorName: '张经理', operatorTime: '2024-05-20 09:10:00' },
		],
	},
	{
		id: '11',
		contractCode: 'HT-ZL-2025-011',
		projectName: '温州撤回示例项目',
		vehicleCount: 1,
		vehicles: [
			{ vehicleType: '4.5吨货车', brand: '跃进', model: '4.2米冷链车', plateNo: '-', actualDelivery: '-', deliveryPerson: '-' },
		],
		approvalStatus: '撤回',
		contractStatus: '草稿',
		customerName: '杭州某某租赁有限公司',
		signingCompany: '嘉兴羚牛',
		businessDept: '业务3部',
		businessOwner: '王专员',
		contractType: '正式合同',
		contractApprovalType: '标准合同',
		paymentPeriod: 1,
		hydrogenPaymentMethod: 'self',
		deliveryRegion: ['浙江省', '温州市'],
		deliveryDate: '2025-05-01',
		insuredVehicleCount: 1,
		thirdPartyLiabilityMillion: 200,
		hasMinimumMileage: false,
		mileagePeriod: 'month',
		mileageTargetKm: null,
		delegateCount: 0,
		contractEndDate: '2026-04-30',
		contactName: '王五',
		contactPhone: '13800138003',
		creator: '王专员',
		createTime: '2025-03-01 10:00',
		updater: '王专员',
		updateTime: '2025-03-02 15:00',
		remark: '提交后撤回',
		legalStampedContractUploaded: undefined,
	},
	{
		id: '12',
		contractCode: 'HT-ZL-2025-012',
		projectName: '长三角在租车队统计项目',
		vehicleCount: ON_LEASE_FLEET_VEHICLE_CASES.length,
		vehicles: buildOnLeaseFleetDemoVehicles(ON_LEASE_FLEET_VEHICLE_CASES),
		approvalStatus: '审批通过',
		contractStatus: '合同进行中',
		contractOriginFlow: 'renew',
		sourceContractCode: 'HT-ZL-2024-009',
		customerName: '嘉兴某某物流有限公司',
		signingCompany: '嘉兴羚牛',
		businessDept: '业务1部',
		businessOwner: '张经理',
		contractType: '正式合同',
		contractApprovalType: '标准合同',
		paymentPeriod: 3,
		hydrogenPaymentMethod: 'self',
		deliveryRegion: ['浙江省', '嘉兴市'],
		deliveryDate: '2025-01-05',
		insuredVehicleCount: ON_LEASE_FLEET_VEHICLE_CASES.length,
		thirdPartyLiabilityMillion: 300,
		hasMinimumMileage: false,
		mileagePeriod: 'month',
		mileageTargetKm: 8000,
		delegateCount: 2,
		poaUploaded: true,
		authorizedDelegates: [
			{ name: '陈静', contact: '13900139004', idNumber: '330102199004044567' },
			{ name: '周磊', contact: '13900139005', idNumber: '330102199005055678' },
		],
		poaRemark: '在租车队合同授权委托书已维护，两名受托人负责七车接还对接。',
		contractEndDate: '2027-01-31',
		contactName: '张三',
		contactPhone: '13800138001',
		creator: '张经理',
		createTime: '2025-01-05 10:00',
		updater: '张经理',
		updateTime: '2025-02-10 09:00',
		remark: '在租车辆概览用例合同（品牌/型号/车型与主数据枚举对齐）',
		legalStampedContractUploaded: true,
		onlineEsignCompletedAt: '2025-01-10 14:20',
		onlineEsignContractFiles: [
			{ uid: 'esign-12-1', name: 'HT-ZL-2025-012-电子签章合同.pdf' },
			{ uid: 'esign-12-2', name: 'HT-ZL-2025-012-补充协议电子签章.pdf' },
		],
		approvalFlowNodes: [
			{ nodeTitle: '法务审核', result: 'passed', operatorName: '陈法务', operatorTime: '2025-01-08 16:00:00', comment: '七车批量租赁，车型与公告型号已核对。' },
			{ nodeTitle: '业务负责人审批', result: 'passed', operatorName: '张经理', operatorTime: '2025-01-07 11:00:00', comment: '同意按标准合同审批。' },
			{ nodeTitle: '发起审批', result: 'passed', operatorName: '张经理', operatorTime: '2025-01-06 09:30:00' },
		],
	},
	{
		id: '13',
		contractCode: 'HT-ZL-2026-010',
		projectName: '宁波城配新车投放项目',
		vehicleCount: 4,
		vehicles: [
			{ vehicleType: '4.5吨冷链车', brand: '现代', model: '帕力安牌4.5吨冷链车', plateNo: '浙B88001', actualDelivery: '-', deliveryPerson: '-' },
			{ vehicleType: '4.5吨厢式货车', brand: '福田', model: '欧马可S3', plateNo: '浙B88002', actualDelivery: '-', deliveryPerson: '-' },
			{ vehicleType: '18吨厢式货车', brand: '东风', model: 'DFH1180', plateNo: '浙B88003', actualDelivery: '-', deliveryPerson: '-' },
			{ vehicleType: '4.5吨厢式货车', brand: '江淮', model: '格尔发K5', plateNo: '浙B88004', actualDelivery: '-', deliveryPerson: '-' },
		],
		approvalStatus: '审批通过',
		contractStatus: '合同进行中',
		contractOriginFlow: 'tripartite',
		sourceContractCode: 'HT-ZL-2025-006',
		customerName: '宁波某某供应链有限公司',
		signingCompany: '嘉兴羚牛',
		businessDept: '业务1部',
		businessOwner: '张经理',
		contractType: '正式合同',
		contractApprovalType: '标准合同',
		paymentPeriod: 3,
		hydrogenPaymentMethod: 'prepay',
		deliveryRegion: ['浙江省', '宁波市'],
		deliveryRegionMode: 'region',
		deliveryRegionTbd: false,
		deliveryDate: null,
		deliveryDateMode: 'unconfirmed',
		deliveryDateTbd: true,
		deliveryDateStart: null,
		deliveryDateEnd: null,
		pickupReceivableCreated: true,
		insuredVehicleCount: 4,
		thirdPartyLiabilityMillion: 200,
		hasMinimumMileage: true,
		mileagePeriod: 'month',
		mileageTargetKm: 6000,
		delegateCount: 1,
		poaUploaded: true,
		authorizedDelegates: [
			{ name: '林晓峰', contact: '13900139100', idNumber: '330102199101011234' },
		],
		poaRemark: '新车投放合同已审批通过，待业务办理提车应收款。',
		contractEndDate: '2027-03-14',
		contactName: '钱经理',
		contactPhone: '13800138100',
		creator: '张经理',
		createTime: '2026-02-20 09:00',
		updater: '张经理',
		updateTime: '2026-02-28 16:30',
		remark: '提车应收款「办理」演示用例：合同已提交审核并同步生成主记录，尚未办理提车。',
		legalStampedContractUploaded: true,
		onlineEsignCompletedAt: '2026-02-28 16:30',
		approvalFlowNodes: [
			{ nodeTitle: '法务审核', result: 'passed', operatorName: '陈法务', operatorTime: '2026-02-25 15:20:00', comment: '标准合同条款无修改，同意通过。' },
			{ nodeTitle: '业务负责人审批', result: 'passed', operatorName: '张经理', operatorTime: '2026-02-24 11:00:00', comment: '宁波城配新车投放方案可行，同意通过。' },
			{ nodeTitle: '发起审批', result: 'passed', operatorName: '张经理', operatorTime: '2026-02-22 10:00:00' },
		],
	},
];

export function getLeaseProjectNameOptions() {
	var seen = {};
	var options = [];
	LEASE_CONTRACT_LIST_RECORDS.forEach(function (record) {
		var name = record.projectName;
		if (!name || seen[name]) return;
		seen[name] = true;
		options.push({ value: name, label: name });
	});
	return options;
}

export function resolveSigningCompanyFullName(record) {
	var lessorId = record.lessorId || SIGNING_COMPANY_LESSOR_IDS[record.signingCompany];
	var lessor = getLessorCompanyById(lessorId || record.signingCompany);
	return lessor && lessor.legalName ? lessor.legalName : (record.signingCompany || '-');
}

export function getCurrentApproverLabel(record) {
	if (record.currentApprover) return record.currentApprover;
	var nodes = record.approvalFlowNodes || [];
	var pendingNode = null;
	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i].result === 'pending') {
			pendingNode = nodes[i];
			break;
		}
	}
	if (!pendingNode) return '';
	if (pendingNode.pendingApprovers && pendingNode.pendingApprovers.length) {
		return pendingNode.pendingApprovers.join('、');
	}
	return pendingNode.nodeTitle || '';
}

export function shouldHideCurrentApprover(approvalStatus) {
	return approvalStatus === '审批通过'
		|| approvalStatus === '审批驳回'
		|| approvalStatus === '审批终止'
		|| approvalStatus === '撤回';
}

/** 合同审批是否已通过（仅通过后才有交车/还车等履约数据） */
export function isContractApprovalPassed(record) {
	return Boolean(record && String(record.approvalStatus || '').trim() === '审批通过');
}

export function formatContractHandoverMileage(mile) {
	if (mile == null || mile === '' || mile === '-') return '';
	var num = Number(mile);
	if (!Number.isFinite(num)) return String(mile);
	return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' km';
}

export function formatContractHandoverDateTimeMinute(raw) {
	if (raw == null || raw === '' || raw === '-') return '';
	var text = String(raw).trim().replace('T', ' ');
	var match = text.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
	if (match) return match[1] + ' ' + match[2];
	if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
	return text.slice(0, 16);
}

export var DELIVERY_DATE_TBD_LABEL = '暂未确定';

export function isDeliveryDateTbd(value) {
	return value === DELIVERY_DATE_TBD_LABEL || value === 'TBD';
}

export function formatContractDeliveryDateLabel(record) {
	if (!record) return '-';
	if (isContractDeliveryDateUnconfirmed(record)) return LEASE_DELIVERY_DATE_UNCONFIRMED_LABEL;
	if (record.deliveryDateStart && record.deliveryDateEnd) {
		return record.deliveryDateStart + ' ~ ' + record.deliveryDateEnd;
	}
	if (record.deliveryDateTbd || isDeliveryDateTbd(record.deliveryDate)) return LEASE_DELIVERY_DATE_UNCONFIRMED_LABEL;
	return record.deliveryDate || '-';
}

export function resolveVehicleDeliveryDateTbd(vehicle, record) {
	if (!vehicle || isContractVehicleDelivered(vehicle)) return false;
	if (vehicle.deliveryDateTbd != null) return Boolean(vehicle.deliveryDateTbd);
	if (!record) return false;
	return isContractDeliveryDateUnconfirmed(record);
}

export function resolveVehiclePlannedDeliveryDate(vehicle, record) {
	if (!vehicle) return null;
	if (isContractVehicleDelivered(vehicle)) {
		return vehicle.deliveryTime || vehicle.actualDelivery || null;
	}
	if (vehicle.plannedDeliveryDate != null && String(vehicle.plannedDeliveryDate).trim()) {
		return vehicle.plannedDeliveryDate;
	}
	return record ? record.deliveryDate || null : null;
}

export function formatVehicleDeliveryPlanDateLabel(vehicle, record) {
	if (!vehicle) return '-';
	if (isContractVehicleDelivered(vehicle)) {
		var deliveredAt = formatContractHandoverDateTimeMinute(vehicle.deliveryTime || vehicle.actualDelivery);
		return deliveredAt && deliveredAt !== '-' ? deliveredAt : '-';
	}
	if (resolveVehicleDeliveryDateTbd(vehicle, record)) return LEASE_DELIVERY_DATE_UNCONFIRMED_LABEL;
	var date = resolveVehiclePlannedDeliveryDate(vehicle, record);
	if (!date || isDeliveryDateTbd(date)) return LEASE_DELIVERY_DATE_UNCONFIRMED_LABEL;
	return date;
}

function addMonthsToDate(date, months) {
	var next = new Date(date.getTime());
	next.setMonth(next.getMonth() + months);
	return next;
}

export function getVehicleLeasePeriodMonths(vehicle, record) {
	if (vehicle && vehicle.leasePeriodMonths != null && vehicle.leasePeriodMonths !== '') {
		return Number(vehicle.leasePeriodMonths);
	}
	if (record && record.defaultLeasePeriodMonths != null) {
		return Number(record.defaultLeasePeriodMonths);
	}
	return 12;
}

export function isVehicleLeasePeriodExpired(vehicle, record, referenceDate) {
	if (!isContractVehicleDelivered(vehicle)) return false;
	var delivery = parseContractDateOnly(vehicle.deliveryTime || vehicle.actualDelivery);
	if (!delivery) return false;
	var months = getVehicleLeasePeriodMonths(vehicle, record);
	if (!Number.isFinite(months) || months <= 0) return false;
	var leaseEnd = addMonthsToDate(delivery, months);
	leaseEnd.setHours(23, 59, 59, 999);
	var ref = referenceDate || new Date();
	return ref.getTime() > leaseEnd.getTime();
}

/**
 * 合同状态标签：由保存/提交动作与审批状态共同决定。
 * - 仅保存 → 草稿
 * - 提交审批且未通过 → 已提交审批
 * - 提交审批且审批通过 → 合同进行中
 * - 提交审批且审批终止 → 已终止
 * - 提交审批且审批驳回 → 草稿
 */
export function resolveContractDisplayStatus(record) {
	if (!record) return '-';
	var approval = String(record.approvalStatus || '').trim();
	if (approval === '审批终止') return '已终止';
	if (approval === '审批驳回' || approval === '未提交' || approval === '撤回') return '草稿';
	if (approval === '审批通过') return '合同进行中';
	if (approval === '待审批' || approval === '审批中') return '已提交审批';
	return String(record.contractStatus || '').trim() || '草稿';
}

var PROJECT_INFO_ORIGIN_FLOW_LABELS = {
	renew: '续签',
	trialToFormal: '转正式',
	tripartite: '转三方',
};

function hasSubmittedContractForApproval(approval) {
	return Boolean(approval && approval !== '未提交');
}

/** 项目信息列：基础状态标签（草稿 / 已提交 / 进行中 / 已终止） */
export function resolveProjectInfoBaseStatus(record) {
	if (!record) return '草稿';
	var approval = String(record.approvalStatus || '').trim();
	if (approval === '未提交' || approval === '审批驳回' || approval === '撤回') return '草稿';
	if (approval === '审批终止') return '已终止';
	if (approval === '审批通过') return '进行中';
	if (approval === '待审批' || approval === '审批中') return '已提交';
	return '草稿';
}

/** 项目信息列：来源流程标签（续签 / 转正式 / 转三方），仅已提交审批后展示 */
export function resolveProjectInfoOriginTag(record) {
	if (!record) return null;
	var approval = String(record.approvalStatus || '').trim();
	if (!hasSubmittedContractForApproval(approval)) return null;
	var flow = String(record.contractOriginFlow || record._flowMode || '').trim();
	return PROJECT_INFO_ORIGIN_FLOW_LABELS[flow] || null;
}

/** 项目信息列：完整标签序列（来源标签在前，基础状态在后） */
export function resolveProjectInfoStatusTags(record) {
	var tags = [];
	var origin = resolveProjectInfoOriginTag(record);
	if (origin) tags.push(origin);
	tags.push(resolveProjectInfoBaseStatus(record));
	return tags;
}

export function projectInfoStatusTone(label) {
	switch (label) {
		case '进行中': return 'green';
		case '已提交': return 'blue';
		case '已终止': return 'red';
		case '续签':
		case '转正式':
		case '转三方': return 'amber';
		case '草稿':
		default: return 'gray';
	}
}

/** @deprecated 使用 resolveContractDisplayStatus */
export function resolveContractStatusByVehicleLease(record) {
	return resolveContractDisplayStatus(record);
}

export function isContractVehicleDelivered(vehicle) {
	var time = vehicle.deliveryTime || vehicle.actualDelivery;
	return Boolean(time && String(time).trim() && time !== '-');
}

export function isContractVehicleReturned(vehicle) {
	var time = vehicle.returnTime;
	return Boolean(time && String(time).trim() && time !== '-');
}

export function canContractVehicleReturn(vehicle, record) {
	if (record && !isContractApprovalPassed(record)) return false;
	return isContractVehicleDelivered(vehicle) && !isContractVehicleReturned(vehicle);
}

function getVehicleDeliveryTimestamp(vehicle) {
	var time = vehicle && (vehicle.deliveryTime || vehicle.actualDelivery);
	if (!time || String(time).trim() === '-') return null;
	var normalized = String(time).trim().replace(' ', 'T');
	var date = new Date(normalized);
	if (isNaN(date.getTime())) {
		date = parseContractDateOnly(time);
	}
	return date && !isNaN(date.getTime()) ? date.getTime() : null;
}

/** 合同中最后一辆「已交车但未还车」的车辆（按交车时间最晚） */
export function getLastDeliveredNotReturnedVehicle(record) {
	var vehicles = record && record.vehicles;
	if (!vehicles || !vehicles.length) return null;
	var lastVehicle = null;
	var lastTs = -1;
	for (var i = 0; i < vehicles.length; i++) {
		var vehicle = vehicles[i];
		if (!canContractVehicleReturn(vehicle, record)) continue;
		var ts = getVehicleDeliveryTimestamp(vehicle);
		if (ts == null) ts = i;
		if (ts >= lastTs) {
			lastTs = ts;
			lastVehicle = vehicle;
		}
	}
	return lastVehicle;
}

export function daysUntilContractValidityEnd(record) {
	if (!record || !record.contractEndDate) return null;
	var end = parseContractDateOnly(record.contractEndDate);
	if (!end) return null;
	var today = new Date();
	today.setHours(0, 0, 0, 0);
	end.setHours(0, 0, 0, 0);
	return Math.round((end.getTime() - today.getTime()) / 86400000);
}

/** KPI「临期合同」：存在在租车辆，且合同签订有效期距今日 ≤ 30 天 */
export function isContractExpiringForKpi(record) {
	if (!getLastDeliveredNotReturnedVehicle(record)) return false;
	var days = daysUntilContractValidityEnd(record);
	return days !== null && days >= 0 && days <= 30;
}

export function isContractMarkedTerminated(record) {
	if (!record) return false;
	var status = String(record.contractStatus || '').trim();
	if (status === '已终止' || status === '已结束') return true;
	if (record.supersededByContractId || record.supersededByContractCode) return true;
	if (record.terminatedBy === 'renewal' || record.terminatedBy === 'tripartite') return true;
	if (record.autoTerminatedByRenewal || record.autoTerminatedByTripartite) return true;
	return false;
}

export function contractAllVehiclesDeliveredAndReturned(record) {
	var vehicles = record && record.vehicles;
	if (!vehicles || !vehicles.length) return false;
	for (var i = 0; i < vehicles.length; i++) {
		var vehicle = vehicles[i];
		if (!isContractVehicleDelivered(vehicle)) return false;
		if (!isContractVehicleReturned(vehicle)) return false;
	}
	return true;
}

/** KPI「已终止」：全部车辆已还车，或续签/转三方后旧合同自动终止 */
export function isContractTerminatedForKpi(record) {
	if (isContractMarkedTerminated(record)) return true;
	return contractAllVehiclesDeliveredAndReturned(record);
}

/** 不计入在租统计的合同状态 */
var ON_LEASE_EXCLUDED_CONTRACT_STATUSES = ['草稿', '已提交审批', '审批终止'];

/** 当前在租：已交车、未还车，且合同处于履约期 */
export function isVehicleCurrentlyOnLease(vehicle, record) {
	if (!canContractVehicleReturn(vehicle, record)) return false;
	if (!record) return false;
	var status = String(record.contractStatus || '').trim();
	if (!status || ON_LEASE_EXCLUDED_CONTRACT_STATUSES.indexOf(status) >= 0) return false;
	return true;
}

/**
 * 按品牌 + 型号聚合在租车辆
 * @returns {Array<{ key: string, brand: string, model: string, vehicleType: string, count: number, entries: Array<{ vehicle: object, record: object }> }>}
 */
export function buildOnLeaseFleetByBrandModel(records) {
	var bucket = {};
	(records || []).forEach(function (record) {
		(record.vehicles || []).forEach(function (vehicle) {
			if (!isVehicleCurrentlyOnLease(vehicle, record)) return;
			var brand = String(vehicle.brand || '未知品牌').trim() || '未知品牌';
			var model = String(vehicle.model || '未知型号').trim() || '未知型号';
			var key = brand + '::' + model;
			if (!bucket[key]) {
				bucket[key] = {
					key: key,
					brand: brand,
					model: model,
					vehicleType: vehicle.vehicleType || '-',
					count: 0,
					entries: [],
				};
			}
			bucket[key].count += 1;
			bucket[key].entries.push({ vehicle: vehicle, record: record });
		});
	});
	return Object.keys(bucket).map(function (key) { return bucket[key]; }).sort(function (a, b) {
		if (b.count !== a.count) return b.count - a.count;
		return a.brand.localeCompare(b.brand, 'zh-CN') || a.model.localeCompare(b.model, 'zh-CN');
	});
}

export function computeContractOverallMileageProgress(record) {
	if (!record || !record.hasMinimumMileage) return null;
	var vehicles = record.vehicles || [];
	var total = 0;
	var count = 0;
	vehicles.forEach(function (vehicle) {
		if (!isContractVehicleDelivered(vehicle)) return;
		if (vehicle.mileageProgress == null) return;
		total += Math.min(100, Math.max(0, Number(vehicle.mileageProgress) || 0));
		count += 1;
	});
	if (count === 0) return 0;
	return Math.round(total / count);
}

export function computeContractMileageForecastStatus(record) {
	if (!record || !record.hasMinimumMileage) return null;
	var vehicles = record.vehicles || [];
	var statuses = [];
	vehicles.forEach(function (vehicle) {
		if (!isContractVehicleDelivered(vehicle)) return;
		var status = vehicle.mileageForecastStatus || computeVehicleMileageForecastStatus(record, vehicle);
		if (status) statuses.push(status);
	});
	if (statuses.length === 0) return null;
	if (statuses.some(function (status) { return status === '预计无法完成'; })) return '预计无法完成';
	if (statuses.some(function (status) { return status === '存在完成风险'; })) return '存在完成风险';
	return '预计可完成';
}

export function getContractMileageForecastStatusTone(status) {
	if (status === '预计可完成') return 'green';
	if (status === '存在完成风险') return 'amber';
	if (status === '预计无法完成') return 'red';
	return 'gray';
}

export function enrichLeaseContractVehicle(vehicle, index, recordIndex, record) {
	var approvalPassed = isContractApprovalPassed(record);
	var rawDelivered = vehicle.actualDelivery && String(vehicle.actualDelivery).trim() && vehicle.actualDelivery !== '-';
	var delivered = approvalPassed && rawDelivered;
	var seed = (recordIndex || 0) * 10 + (index || 0);
	var demoDeliveryMiles = [25468, 6210, 31233, 48202, 12580];
	var demoReturnMiles = [25372, 127012, 11578];
	var demoCurrentMiles = [25468, 6210, 31233, 45822, 127012, 11578, 45195];
	var demoReturnPersons = ['刘洋', '李娜', '吴磊'];
	var hasExplicitReturn = approvalPassed
		&& vehicle.returnTime
		&& String(vehicle.returnTime).trim()
		&& vehicle.returnTime !== '-';
	var hasMinMileage = record && record.hasMinimumMileage;
	var progress = vehicle.mileageProgress;
	if (!hasMinMileage) {
		progress = null;
	} else if (progress == null) {
		if (!delivered) progress = 0;
		else progress = [38, 56, 72, 91][seed % 4];
	}
	var hasReturn = hasExplicitReturn || (progress >= 90 && delivered);
	var deliveryTime = vehicle.deliveryTime || (delivered ? vehicle.actualDelivery : null);
	var deliveryMileage = vehicle.deliveryMileage != null && vehicle.deliveryMileage !== ''
		? vehicle.deliveryMileage
		: (delivered ? demoDeliveryMiles[seed % demoDeliveryMiles.length] : null);
	var deliveryPerson = delivered
		? (vehicle.deliveryPerson && vehicle.deliveryPerson !== '-' ? vehicle.deliveryPerson : '张运维')
		: null;
	var returnTime = hasReturn
		? (hasExplicitReturn ? vehicle.returnTime : '2025-12-01 17:00')
		: null;
	var returnMileage = hasReturn
		? (vehicle.returnMileage != null && vehicle.returnMileage !== '' ? vehicle.returnMileage : demoReturnMiles[seed % demoReturnMiles.length])
		: null;
	var returnPerson = hasReturn
		? (vehicle.returnPerson && vehicle.returnPerson !== '-' ? vehicle.returnPerson : demoReturnPersons[seed % demoReturnPersons.length])
		: null;
	var currentMileage = vehicle.currentMileage != null && vehicle.currentMileage !== ''
		? vehicle.currentMileage
		: (delivered ? demoCurrentMiles[seed % demoCurrentMiles.length] : '-');
	var mileageSources = ['车机', 'GPS', '人工'];
	var mileageSource = vehicle.mileageSource || mileageSources[seed % mileageSources.length];
	var telematicsLinked = mileageSource === '车机';
	var gpsTime = mileageSource === 'GPS'
		? (vehicle.gpsTime || '2026-06-28 14:32:15')
		: (vehicle.gpsTime || null);
	var onlineStatus = vehicle.onlineStatus
		|| (mileageSource === '车机' ? '在线' : '离线');
	var pickupPaymentPaid = vehicle.pickupPaymentPaid;
	if (pickupPaymentPaid == null) {
		pickupPaymentPaid = delivered ? seed % 4 !== 1 : false;
	}
	var remainingMileage = computeContractVehicleRemainingMileage(record, { mileageProgress: progress });
	var deliveryRaw = deliveryTime || vehicle.actualDelivery;
	var periodStartDate = null;
	var periodStartMileage = null;
	if (delivered && hasMinMileage && record && record.mileagePeriod) {
		periodStartDate = computeCurrentMileagePeriodStart(deliveryRaw, record.mileagePeriod);
		periodStartMileage = estimatePeriodStartMileage(
			deliveryRaw,
			periodStartDate,
			deliveryMileage,
			currentMileage,
		);
	}
	var returnSettlementStatus = vehicle.returnSettlementStatus;
	if (returnSettlementStatus === '已结算') returnSettlementStatus = '已完成';
	if (hasReturn && !returnSettlementStatus) {
		returnSettlementStatus = RETURN_SETTLEMENT_STATUSES[seed % RETURN_SETTLEMENT_STATUSES.length];
	}
	var returnSettlementApprover = vehicle.returnSettlementApprover;
	if (hasReturn && returnSettlementStatus === '审批中' && !returnSettlementApprover) {
		var approverPool = ['王财务', '赵主管', '刘经理', '超级用户', '金可鹏'];
		if (seed % 3 === 0) {
			returnSettlementApprover = approverPool[seed % approverPool.length]
				+ '、' + approverPool[(seed + 1) % approverPool.length];
		} else {
			returnSettlementApprover = approverPool[seed % approverPool.length];
		}
	}
	var leaseBillStatus = vehicle.leaseBillStatus;
	if (delivered && !leaseBillStatus) {
		leaseBillStatus = seed % 5 === 0 ? '欠费' : '正常';
	}
	var dailyAvgMileage7d = vehicle.dailyAvgMileage7d;
	if (dailyAvgMileage7d == null && delivered && hasMinMileage && record) {
		var periodEndDate = computeCurrentMileagePeriodEnd(periodStartDate, record.mileagePeriod);
		var daysLeftDemo = periodEndDate ? Math.max(1, daysBetween(new Date(), periodEndDate)) : 30;
		var remainingDemo = remainingMileage != null ? remainingMileage : 0;
		var profile = seed % 3;
		if (profile === 0) {
			dailyAvgMileage7d = Math.max(1, Math.round((remainingDemo / daysLeftDemo) * 0.82));
		} else if (profile === 1) {
			dailyAvgMileage7d = Math.max(1, Math.round(remainingDemo / daysLeftDemo + 80));
		} else {
			dailyAvgMileage7d = Math.max(1, Math.round(remainingDemo / daysLeftDemo + 280));
		}
	}

	var enrichedVehicle = Object.assign({}, vehicle, {
		vin: vehicle.vin || (vehicle.plateNo && vehicle.plateNo !== '-'
			? 'LFWNKVPH8K1' + String(10000 + seed).slice(-5)
			: '-'),
		actualDelivery: delivered ? (vehicle.actualDelivery || deliveryTime || '-') : '-',
		deliveryTime: deliveryTime,
		deliveryMileage: deliveryMileage,
		deliveryPerson: deliveryPerson,
		returnTime: returnTime,
		returnMileage: returnMileage,
		returnPerson: returnPerson,
		mileageProgress: progress,
		currentMileage: currentMileage,
		onlineStatus: onlineStatus,
		mileageSource: mileageSource,
		telematicsLinked: telematicsLinked,
		gpsTime: gpsTime,
		pickupPaymentPaid: pickupPaymentPaid,
		remainingMileage: remainingMileage,
		periodStartDate: periodStartDate,
		periodStartMileage: periodStartMileage,
		returnSettlementStatus: hasReturn ? returnSettlementStatus : null,
		returnSettlementApprover: hasReturn && returnSettlementStatus === '审批中' ? returnSettlementApprover : null,
		leaseBillStatus: delivered ? leaseBillStatus : null,
		leasePeriodMonths: vehicle.leasePeriodMonths != null
			? vehicle.leasePeriodMonths
			: getVehicleLeasePeriodMonths(vehicle, record),
		plannedDeliveryDate: vehicle.plannedDeliveryDate != null
			? vehicle.plannedDeliveryDate
			: (delivered ? null : (record && record.deliveryDate) || null),
		deliveryDateTbd: vehicle.deliveryDateTbd != null
			? vehicle.deliveryDateTbd
			: (delivered ? false : resolveVehicleDeliveryDateTbd(vehicle, record)),
		dailyAvgMileage7d: dailyAvgMileage7d,
	});
	if (delivered && hasMinMileage && record) {
		enrichedVehicle.mileageForecastStatus = computeVehicleMileageForecastStatus(record, enrichedVehicle);
	}
	return enrichedVehicle;
}

export function resolveContractLastUpdateAudit(record) {
	if (!record) return { updater: '-', updateTime: '-' };
	var creator = record.creator && String(record.creator).trim() && record.creator !== '-'
		? String(record.creator).trim()
		: '-';
	var createTime = record.createTime && String(record.createTime).trim() && record.createTime !== '-'
		? String(record.createTime).trim()
		: '-';
	var updater = record.updater && String(record.updater).trim() && record.updater !== '-'
		? String(record.updater).trim()
		: creator;
	var updateTime = record.updateTime && String(record.updateTime).trim() && record.updateTime !== '-'
		? String(record.updateTime).trim()
		: createTime;
	return { updater: updater, updateTime: updateTime };
}

export function enrichLeaseContractRecord(record, recordIndex) {
	var lessorId = record.lessorId || SIGNING_COMPANY_LESSOR_IDS[record.signingCompany];
	var templateId = inferContractTemplateId(record);
	var lastUpdateAudit = resolveContractLastUpdateAudit(record);
	var enriched = Object.assign({}, record, {
		lessorId: lessorId,
		contractTemplateId: record.contractTemplateId || templateId,
		paymentMethod: record.paymentMethod || (recordIndex % 3 === 1 ? 'postpay' : 'advance'),
		signingCompanyFullName: resolveSigningCompanyFullName(Object.assign({}, record, { lessorId: lessorId })),
		updater: lastUpdateAudit.updater,
		updateTime: lastUpdateAudit.updateTime,
		vehicles: (record.vehicles || []).map(function (vehicle, index) {
			return enrichLeaseContractVehicle(vehicle, index, recordIndex, record);
		}),
	});
	enriched.contractTemplateTypeLabel = resolveContractTemplateTypeLabel(enriched);
	enriched.overallMileageProgress = computeContractOverallMileageProgress(enriched);
	enriched.overallMileageForecastStatus = computeContractMileageForecastStatus(enriched);
	enriched.contractStatus = resolveContractDisplayStatus(enriched);
	return enriched;
}

export function enrichLeaseContractListRecords(records) {
	return (records || []).map(function (record, index) {
		return enrichLeaseContractRecord(record, index);
	});
}
