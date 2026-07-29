import { hasLeaseOrderRentBelowMinimum } from './lease-order-vars.js';
import {
	resolveContractApprovalType,
	isRiskRedlineContentModified,
	isPreviewNewClauseAdded,
	STANDARD_CONTRACT_APPROVAL,
	NONSTANDARD_CONTRACT_APPROVAL,
} from './lease-contract-risk-detect.js';

export { STANDARD_CONTRACT_APPROVAL, NONSTANDARD_CONTRACT_APPROVAL };

function isPostpayPaymentMethod(feeInfo) {
	return feeInfo && feeInfo.paymentMethod === 'postpay';
}

function isNonMonthlyPaymentPeriod(feeInfo) {
	var period = feeInfo && feeInfo.paymentPeriod;
	return period === 3 || period === 6 || period === 12;
}

function hasExtraOfficialSeal(sealTypes) {
	var types = sealTypes || [];
	return types.indexOf('official') >= 0 || types.indexOf('legal_person') >= 0;
}

/** 综合风控红线修改与租金低于下限等规则，判定审批类型 */
export function resolveLeaseContractApprovalType(baselineHtml, currentHtml, form) {
	if (form && hasLeaseOrderRentBelowMinimum(form.leaseOrder)) {
		return NONSTANDARD_CONTRACT_APPROVAL;
	}
	if (form && isPostpayPaymentMethod(form.feeInfo)) {
		return NONSTANDARD_CONTRACT_APPROVAL;
	}
	if (form && isNonMonthlyPaymentPeriod(form.feeInfo)) {
		return NONSTANDARD_CONTRACT_APPROVAL;
	}
	if (form && hasExtraOfficialSeal(form.sealTypes)) {
		return NONSTANDARD_CONTRACT_APPROVAL;
	}
	if (isPreviewNewClauseAdded(baselineHtml, currentHtml)) {
		return NONSTANDARD_CONTRACT_APPROVAL;
	}
	if (isRiskRedlineContentModified(baselineHtml, currentHtml)) {
		return NONSTANDARD_CONTRACT_APPROVAL;
	}
	return resolveContractApprovalType(baselineHtml, currentHtml);
}
