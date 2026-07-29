/**
 * 客户资质证照 OCR / 有效期校验（租赁合同签约信息）
 */

import { CUSTOMER_CREDENTIAL_ITEMS } from '../contract-template-management/contract-template-vars.js';

export var CREDENTIAL_EXPIRY_WARN_MONTHS = 3;

var STATUS_LABELS = {
	valid: '有效',
	expiring: '即将到期',
	expired: '已过期',
	unknown: '待识别',
};

function parseYmd(str) {
	if (!str) return null;
	var parts = String(str).trim().split('-');
	if (parts.length < 3) return null;
	var y = Number(parts[0]);
	var m = Number(parts[1]) - 1;
	var d = Number(parts[2]);
	if (!y || m < 0 || d < 1) return null;
	var date = new Date(y, m, d);
	date.setHours(23, 59, 59, 999);
	return date;
}

function addMonths(date, months) {
	var next = new Date(date.getTime());
	next.setMonth(next.getMonth() + months);
	return next;
}

export function getCredentialExpiryStatus(expiryDate, refDate) {
	var expiry = parseYmd(expiryDate);
	if (!expiry) return 'unknown';
	var now = refDate ? new Date(refDate) : new Date();
	now.setHours(0, 0, 0, 0);
	if (expiry.getTime() < now.getTime()) return 'expired';
	var warnBefore = addMonths(now, CREDENTIAL_EXPIRY_WARN_MONTHS);
	if (expiry.getTime() <= warnBefore.getTime()) return 'expiring';
	return 'valid';
}

export function getCredentialStatusLabel(status) {
	return STATUS_LABELS[status] || STATUS_LABELS.unknown;
}

export function getCustomerCredentialMeta(customer, key) {
	var file = customer && customer.attachments ? customer.attachments[key] : null;
	var expiryDate = file && file.expiryDate ? file.expiryDate : '';
	var status = getCredentialExpiryStatus(expiryDate);
	return {
		key: key,
		ocrVerified: Boolean(file && file.ocrVerified),
		expiryDate: expiryDate,
		status: status,
		statusLabel: getCredentialStatusLabel(status),
	};
}

export function summarizeCustomerCredentials(customer) {
	var items = CUSTOMER_CREDENTIAL_ITEMS.map(function (item) {
		var meta = getCustomerCredentialMeta(customer, item.key);
		return {
			key: item.key,
			label: item.label,
			ocrVerified: meta.ocrVerified,
			expiryDate: meta.expiryDate,
			status: meta.status,
			statusLabel: meta.statusLabel,
		};
	});
	var expired = items.filter(function (item) { return item.status === 'expired'; });
	var expiring = items.filter(function (item) { return item.status === 'expiring'; });
	return {
		items: items,
		expiredItems: expired,
		expiringItems: expiring,
		hasExpired: expired.length > 0,
		hasExpiring: expiring.length > 0,
		blocksContractSubmit: expired.length > 0,
	};
}

export function hasBlockingCustomerCredentials(customer) {
	if (!customer) return false;
	return summarizeCustomerCredentials(customer).blocksContractSubmit;
}

export function formatCredentialSubmitBlockMessage(summary) {
	if (!summary || !summary.hasExpired) return '';
	var names = summary.expiredItems.map(function (item) { return item.label; }).join('、');
	return '客户资质证照已过期（' + names + '），须由业管更新档案后方可提交新合同。';
}
