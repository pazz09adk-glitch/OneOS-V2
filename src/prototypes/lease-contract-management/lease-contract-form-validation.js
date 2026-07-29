import {
	isDelegateRowComplete,
	isDelegateRowStarted,
	normalizeBrandModels,
} from './lease-order-vars.js';

function isMainContractFieldsComplete(form) {
	var contractCode = (form.contractCode || '').trim();
	if (!contractCode) return false;
	if (!form.lessorId) return false;
	if (!form.customerId) return false;
	if (!form.businessDept) return false;
	if (!form.businessOwner) return false;

	var mileage = form.mileage || {};
	if (mileage.hasRequirement) {
		if (!mileage.period) return false;
		if (mileage.targetKm == null || mileage.targetKm === '') return false;
		if (mileage.reductionYuan == null || mileage.reductionYuan === '') return false;
		if (!mileage.validUntil) return false;
	}

	var feeInfo = form.feeInfo || {};
	if (!feeInfo.paymentMethod) return false;
	if (feeInfo.paymentPeriod == null || feeInfo.paymentPeriod === '') return false;
	if (!feeInfo.hydrogenPaymentMethod) return false;

	if (feeInfo.hydrogenPaymentMethod === 'prepay') {
		if (feeInfo.prepayAmount == null || feeInfo.prepayAmount === '') return false;
	}

	if (feeInfo.returnHydrogenDiffUnitPrice == null || feeInfo.returnHydrogenDiffUnitPrice === '') {
		return false;
	}

	return true;
}

/** 主体合同信息卡片完成度 */
export function isMainContractFormComplete(form) {
	return isMainContractFieldsComplete(form);
}

/** 附件1：租赁订单卡片完成度 */
export function isLeaseOrderFormComplete(form) {
	var leaseOrder = form.leaseOrder || {};
	var rows = leaseOrder.rows || [];
	if (!rows.length) return false;
	return rows.some(function (row) {
		return normalizeBrandModels(row).length > 0;
	});
}

/** 授权委托书卡片完成度（提交前须至少一名完整委托人，且已填行须完整） */
export function isPowerOfAttorneyFormComplete(form) {
	var delegates = (form.powerOfAttorney && form.powerOfAttorney.delegates) || [];
	var started = delegates.filter(isDelegateRowStarted);
	if (!started.length) return false;
	return started.every(isDelegateRowComplete);
}

/** 授权委托书是否满足提交审核要求 */
export function isPowerOfAttorneySubmitReady(form) {
	var delegates = (form.powerOfAttorney && form.powerOfAttorney.delegates) || [];
	return delegates.some(isDelegateRowComplete);
}

/** 授权委托书是否有未完成行（用于徽章展示） */
export function isPowerOfAttorneyOptionalEmpty(form) {
	var delegates = (form.powerOfAttorney && form.powerOfAttorney.delegates) || [];
	return !delegates.some(isDelegateRowStarted);
}

/** 用章类型是否已选择 */
export function isSealTypeSelected(form) {
	if (Array.isArray(form.sealTypes)) {
		return form.sealTypes.length > 0;
	}
	return Boolean(form.sealType);
}

/** 转三方：丙方客户已选且不与乙方重复 */
export function isTripartitePartyComplete(form) {
	var thirdPartyCustomerId = (form.thirdPartyCustomerId || '').trim();
	if (!thirdPartyCustomerId) return false;
	if (form.customerId && thirdPartyCustomerId === form.customerId) return false;
	return true;
}

/** 判断新增租赁合同左侧表单必填项是否均已填写（提交审核） */
export function isLeaseContractFormComplete(form) {
	return isMainContractFieldsComplete(form)
		&& isLeaseOrderFormComplete(form)
		&& isPowerOfAttorneySubmitReady(form)
		&& isSealTypeSelected(form);
}
