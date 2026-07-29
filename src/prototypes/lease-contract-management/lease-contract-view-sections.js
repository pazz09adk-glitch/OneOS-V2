/**
 * 合同查看页：对齐新增页左侧编辑区章节与字段
 */

import { getContractTemplateOption } from '../contract-template-management/contract-template-catalog.js';
import {
	getLessorCompanyById,
	getLeaseCustomerById,
	getCustomerInvoicePreview,
	getLessorAccountPreview,
	getLessorContactPreview,
	getCustomerContactPreview,
	MILEAGE_PERIOD_OPTIONS,
	PAYMENT_METHOD_OPTIONS,
	PAYMENT_PERIOD_OPTIONS,
	HYDROGEN_PAYMENT_METHOD_OPTIONS,
	CONTRACT_CODE_PREFIX,
} from '../contract-template-management/contract-template-vars.js';
import { buildLeaseContractEditFormState } from './lease-contract-edit-bridge.js';
import {
	formatContractDeliveryRegionLabel,
	formatContractDeliveryDateLabel,
	formatPaymentMethodLabel,
	formatPaymentPeriodLabel,
	formatHydrogenPaymentLabel,
	formatContractApprovalTypeLabel,
	formatMileageSummary,
	resolveContractDisplayStatus,
	getAuthorizedDelegates,
	isContractVehicleDelivered,
	isContractVehicleReturned,
	inferContractTemplateId,
	resolveContractTemplateTypeLabel,
} from './lease-contract-list-data.js';
import {
	formatContractSigningMethodLabel,
	resolveContractSigningMethod,
	getContractSigningSubLabel,
	isOfflineContractSigning,
} from './lease-contract-signing.js';

var SEAL_TYPE_LABELS = {
	contract: '合同章',
	official: '公章',
	legal_person: '法人章',
};

var VIEW_SECTIONS = [
	{ key: 'template', label: '选择模板', step: 1 },
	{ key: 'main', label: '主体合同', step: 2 },
	{ key: 'leaseOrder', label: '租赁订单', step: 3 },
	{ key: 'poa', label: '授权委托', step: 4, optional: true },
	{ key: 'remark', label: '合同备注', step: 5, optional: true },
	{ key: 'seal', label: '用章类型', step: 6 },
	{ key: 'attachments', label: '合同附件', viewExtra: true, step: 7 },
	{ key: 'audit', label: '建档信息', viewExtra: true, step: 8 },
	{ key: 'operations', label: '操作记录', viewExtra: true, step: 9 },
	{ key: 'changes', label: '变更记录', viewExtra: true, step: 10 },
];

function optionLabel(options, value) {
	if (!options || !options.length) return value || '-';
	var found = options.find(function (item) { return item.value === value; });
	return found ? found.label : (value != null && value !== '' ? String(value) : '-');
}

function signingExtras(record) {
	return {
		hasUploaded: Boolean(record.legalStampedContractUploaded || record.stampedContractFiles && record.stampedContractFiles.length),
	};
}

function resolveSigningSubLabel(record) {
	var signingSub = getContractSigningSubLabel(record, signingExtras(record));
	if (!signingSub || signingSub === '-') {
		var method = resolveContractSigningMethod(record.contractSigningMethod);
		signingSub = isOfflineContractSigning(method) ? '待补传' : '待签署';
	}
	return signingSub;
}

export function resolveViewFormContext(record) {
	if (!record) return null;
	var formState = buildLeaseContractEditFormState(record);
	if (!formState) return null;
	var lessor = getLessorCompanyById(formState.lessorId);
	var customer = getLeaseCustomerById(formState.customerId);
	return {
		formState: formState,
		lessor: lessor,
		customer: customer,
		lessorAccount: getLessorAccountPreview(lessor),
		lessorContact: getLessorContactPreview(lessor),
		customerContact: getCustomerContactPreview(customer),
		invoice: getCustomerInvoicePreview(customer),
	};
}

export function getViewSectionNavItems() {
	return VIEW_SECTIONS.slice();
}

export function formatSealTypesLabel(sealTypes) {
	if (!sealTypes || !sealTypes.length) return '合同章';
	return sealTypes.map(function (key) {
		return SEAL_TYPE_LABELS[key] || key;
	}).join('、');
}

export function resolveVehicleLeaseStatus(vehicle) {
	if (!vehicle) return { label: '待交车', tone: 'gray' };
	if (isContractVehicleReturned(vehicle)) return { label: '已还车', tone: 'gray' };
	if (isContractVehicleDelivered(vehicle)) return { label: '已交车', tone: 'green' };
	return { label: '待交车', tone: 'blue' };
}

export function buildContractViewSummary(record) {
	if (!record) return null;
	var displayStatus = resolveContractDisplayStatus(record);
	var signingMethod = resolveContractSigningMethod(record.contractSigningMethod);
	var signingSub = resolveSigningSubLabel(record);
	return {
		projectName: record.projectName || '-',
		contractCode: record.contractCode || '-',
		customerName: record.customerName || '-',
		displayStatus: displayStatus,
		approvalStatus: record.approvalStatus || '-',
		showApprovalBadge: shouldShowApprovalBadge(displayStatus, record.approvalStatus),
		contractType: record.contractType || '-',
		contractApprovalType: formatContractApprovalTypeLabel(record.contractApprovalType),
		signingMethodLabel: formatContractSigningMethodLabel(signingMethod),
		signingSubLabel: signingSub,
		vehicleCount: record.vehicleCount != null ? record.vehicleCount : (record.vehicles ? record.vehicles.length : 0),
		contractEndDate: record.contractEndDate || '-',
		businessOwner: record.businessOwner || '-',
	};
}

function shouldShowApprovalBadge(displayStatus, approvalStatus) {
	if (!approvalStatus || approvalStatus === '-') return false;
	if (approvalStatus === '审批通过' && displayStatus === '合同进行中') return false;
	return true;
}

export function buildContractViewTemplateFields(record) {
	if (!record) return [];
	var templateId = record.contractTemplateId || inferContractTemplateId(record);
	var option = templateId ? getContractTemplateOption(templateId) : null;
	var templateLabel = option && option.title
		? option.title
		: resolveContractTemplateTypeLabel(record);
	return [
		{ label: '合同模板', value: templateLabel },
		{ label: '合同签署方式', value: formatContractSigningMethodLabel(resolveContractSigningMethod(record.contractSigningMethod)) },
		{ label: '签署状态', value: resolveSigningSubLabel(record) },
		{ label: '审批类型', value: formatContractApprovalTypeLabel(record.contractApprovalType) },
	];
}

export function buildContractViewSigningFields(record, ctx) {
	if (!record) return [];
	var formState = ctx && ctx.formState;
	var code = record.contractCode || (formState && formState.contractCode
		? CONTRACT_CODE_PREFIX + formState.contractCode
		: '-');
	return [
		{ label: '合同编码', value: code, mono: true },
		{ label: '业务部门 / 业务人员', value: [record.businessDept, record.businessOwner].filter(Boolean).join(' / ') || '-' },
		{ label: '项目名称', value: record.projectName || '-', wide: true },
		{ label: '甲方', value: record.signingCompanyFullName || record.signingCompany },
		{ label: '乙方', value: record.customerName },
		{ label: '乙方负责人姓名', value: record.customerPrincipalName || (formState && formState.customerPrincipalName) || '-' },
		{ label: '乙方负责人手机号', value: record.customerPrincipalPhone || (formState && formState.customerPrincipalPhone) || '-', mono: true },
	];
}

export function buildContractViewLessorProfileFields(ctx) {
	if (!ctx || !ctx.lessorAccount) return [];
	var account = ctx.lessorAccount;
	var contact = ctx.lessorContact || {};
	return [
		{ label: '户名', value: account.accountName },
		{ label: '开户行', value: account.bankName },
		{ label: '账号', value: account.bankAccount, mono: true },
		{ label: '通讯地址', value: contact.mailAddress, wide: true },
		{ label: '联系人姓名', value: contact.contactName },
		{ label: '联系人电话', value: contact.contactPhone, mono: true },
		{ label: '邮箱', value: contact.email, wide: true },
	];
}

export function buildContractViewCustomerProfileFields(ctx) {
	if (!ctx || !ctx.invoice) return [];
	var invoice = ctx.invoice;
	var contact = ctx.customerContact || {};
	return [
		{ label: '企业名称', value: invoice.companyName, wide: true },
		{ label: '开户银行', value: invoice.bank },
		{ label: '银行账号', value: invoice.bankAccount, mono: true },
		{ label: '纳税人识别号', value: invoice.taxId, mono: true },
		{ label: '企业地址', value: invoice.mailingAddress, wide: true },
		{ label: '企业电话', value: invoice.companyPhone, mono: true },
		{ label: '通讯地址', value: contact.mailAddress, wide: true },
		{ label: '联系人姓名', value: contact.contactName },
		{ label: '联系人电话', value: contact.contactPhone, mono: true },
		{ label: '邮箱', value: contact.email, wide: true },
	];
}

export function buildContractViewMileageFields(record, ctx) {
	if (!record) return [];
	var mileage = ctx && ctx.formState && ctx.formState.mileage;
	var hasRequirement = Boolean(record.hasMinimumMileage || (mileage && mileage.hasRequirement));
	var fields = [
		{ label: '是否有里程要求', value: hasRequirement ? '是' : '否' },
	];
	if (hasRequirement) {
		var periodLabel = optionLabel(MILEAGE_PERIOD_OPTIONS, record.mileagePeriod || (mileage && mileage.period));
		fields.push(
			{ label: '里程要求类型', value: periodLabel },
			{ label: '里程要求', value: formatMileageSummary(record) },
			{ label: '次月租金减免金额', value: record.mileageReductionYuan != null ? record.mileageReductionYuan + ' 元' : '-', mono: true },
			{ label: '减免有效期至', value: record.mileageValidUntil || '-', mono: true },
		);
	}
	return fields;
}

export function buildContractViewFeeFields(record, ctx) {
	if (!record) return [];
	var feeInfo = ctx && ctx.formState && ctx.formState.feeInfo;
	var paymentMethod = record.paymentMethod || (feeInfo && feeInfo.paymentMethod);
	var hydrogenMethod = record.hydrogenPaymentMethod || (feeInfo && feeInfo.hydrogenPaymentMethod);
	var fields = [
		{ label: '付款方式', value: formatPaymentMethodLabel(paymentMethod) },
		{ label: '付款周期', value: formatPaymentPeriodLabel(record.paymentPeriod != null ? record.paymentPeriod : (feeInfo && feeInfo.paymentPeriod)) },
		{ label: '氢费支付方式', value: formatHydrogenPaymentLabel(hydrogenMethod) },
	];
	if (hydrogenMethod === 'prepay' || record.prepayAmount != null) {
		fields.push({
			label: '预付款金额',
			value: record.prepayAmount != null ? record.prepayAmount + ' 元' : (feeInfo && feeInfo.prepayAmount != null ? feeInfo.prepayAmount + ' 元' : '-'),
			mono: true,
		});
	}
	if (hydrogenMethod === 'month' || record.payAheadWorkdays != null) {
		fields.push({
			label: '提前付款工作日',
			value: record.payAheadWorkdays != null ? record.payAheadWorkdays + ' 天' : (feeInfo && feeInfo.payAheadWorkdays != null ? feeInfo.payAheadWorkdays + ' 天' : '-'),
			mono: true,
		});
	}
	var diffPrice = record.returnHydrogenDiffUnitPrice != null
		? record.returnHydrogenDiffUnitPrice
		: (feeInfo && feeInfo.returnHydrogenDiffUnitPrice);
	fields.push({
		label: '还车氢量差单价',
		value: diffPrice != null ? diffPrice + ' 元/kg' : '-',
		mono: true,
	});
	return fields;
}

export function buildContractViewLeaseOrderMetaFields(record) {
	if (!record) return [];
	return [
		{ label: '交车区域', value: formatContractDeliveryRegionLabel(record), wide: true },
		{ label: '交车时间', value: formatContractDeliveryDateLabel(record), mono: true },
		{ label: '保险金额', value: record.thirdPartyLiabilityMillion != null ? record.thirdPartyLiabilityMillion + ' 万元' : '-', mono: true },
		{ label: '在保车辆数', value: record.insuredVehicleCount != null ? record.insuredVehicleCount + ' 辆' : '-', mono: true },
	];
}

export function buildContractViewSealTypes(record, ctx) {
	var sealTypes = record && record.sealTypes;
	if ((!sealTypes || !sealTypes.length) && ctx && ctx.formState) {
		sealTypes = ctx.formState.sealTypes;
	}
	return Array.isArray(sealTypes) && sealTypes.length ? sealTypes.slice() : ['contract'];
}

/** @deprecated 使用 buildContractViewSigningFields + 档案分组 */
export function buildContractViewPartyGroups(record) {
	if (!record) return [];
	return [
		{
			title: '签约主体',
			fields: [
				{ label: '签约公司（甲方）', value: record.signingCompany },
				{ label: '客户名称（乙方）', value: record.customerName, wide: true },
			],
		},
		{
			title: '联系与业务',
			fields: [
				{ label: '联系人', value: record.contactName },
				{ label: '联系电话', value: record.contactPhone, mono: true },
				{ label: '业务部门', value: record.businessDept },
				{ label: '业务负责人', value: record.businessOwner },
			],
		},
		{
			title: '合同属性',
			fields: [
				{ label: '合同类型', value: record.contractType },
				{ label: '审批类型', value: formatContractApprovalTypeLabel(record.contractApprovalType) },
				{ label: '用章类型', value: formatSealTypesLabel(record.sealTypes) },
			],
		},
		{
			title: '签署信息',
			fields: [
				{ label: '合同签署方式', value: formatContractSigningMethodLabel(resolveContractSigningMethod(record.contractSigningMethod)) },
				{ label: '签署状态', value: resolveSigningSubLabel(record) },
			],
		},
	];
}

/** @deprecated 使用 buildContractViewFeeFields + buildContractViewLeaseOrderMetaFields */
export function buildContractViewFeeGroups(record) {
	if (!record) return [];
	return [
		{
			title: '付款与结算',
			fields: buildContractViewFeeFields(record, resolveViewFormContext(record)),
		},
		{
			title: '交车与保险',
			fields: buildContractViewLeaseOrderMetaFields(record),
		},
	];
}

export function buildContractViewVehicleCards(record) {
	if (!record || !record.vehicles) return [];
	return record.vehicles.map(function (vehicle, index) {
		var status = resolveVehicleLeaseStatus(vehicle);
		return {
			id: 'view-vehicle-' + index,
			title: [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || ('车辆 ' + (index + 1)),
			status: status,
			fields: [
				{ label: '车辆类型', value: vehicle.vehicleType },
				{ label: '品牌 / 型号', value: [vehicle.brand, vehicle.model].filter(Boolean).join(' / ') },
				{ label: '车牌号', value: vehicle.plateNo, mono: true },
				{ label: '租金', value: vehicle.rent != null ? vehicle.rent + ' 元/月' : '-', mono: true },
				{ label: '服务费', value: vehicle.serviceFee != null ? vehicle.serviceFee + ' 元/月' : '-', mono: true },
				{ label: '保证金', value: vehicle.deposit != null ? vehicle.deposit + ' 元' : '-', mono: true },
				{ label: '租赁期限', value: vehicle.leasePeriodMonths != null ? vehicle.leasePeriodMonths + ' 个月' : '-' },
				{ label: '交车时间', value: vehicle.actualDelivery || vehicle.deliveryTime || '-' },
				{ label: '还车时间', value: vehicle.returnTime || '-' },
				{ label: '交车负责人', value: vehicle.deliveryPerson },
			],
		};
	});
}

export function buildContractViewAuditFields(record) {
	if (!record) return [];
	return [
		{ label: '创建人', value: record.creator },
		{ label: '创建时间', value: record.createTime, mono: true },
		{ label: '更新人', value: record.updater },
		{ label: '更新时间', value: record.updateTime, mono: true },
	];
}

export function buildContractPreviewFormFromRecord(record) {
	return buildLeaseContractEditFormState(record);
}
