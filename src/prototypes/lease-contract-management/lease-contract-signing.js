import { getLeaseCustomerById } from '../contract-template-management/contract-template-vars.js';

export var CONTRACT_SIGNING_METHOD_ONLINE = 'online_esign';
export var CONTRACT_SIGNING_METHOD_OFFLINE = 'offline_manual';

var PARTY_B_CUSTOMER_IDS_BY_NAME = {
	'嘉兴某某物流有限公司': '1',
	'上海某某运输有限公司': '2',
	'杭州某某租赁有限公司': '3',
};

export var CONTRACT_SIGNING_METHOD_OPTIONS = [
	{ value: CONTRACT_SIGNING_METHOD_ONLINE, label: '线上电子签章' },
	{ value: CONTRACT_SIGNING_METHOD_OFFLINE, label: '线下人工上传' },
];

export function formatContractSigningMethodLabel(method) {
	if (method === CONTRACT_SIGNING_METHOD_OFFLINE) return '线下人工上传';
	if (method === CONTRACT_SIGNING_METHOD_ONLINE) return '线上电子签章';
	return '线上电子签章';
}

export function isOfflineContractSigning(method) {
	return method === CONTRACT_SIGNING_METHOD_OFFLINE;
}

export function resolveContractSigningMethod(method) {
	return method || CONTRACT_SIGNING_METHOD_ONLINE;
}

export function formatSigningStatusMinute(value) {
	if (!value) return null;
	var text = String(value).trim();
	if (!text || text === '-') return null;
	if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(text)) {
		return text.slice(0, 16);
	}
	if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(text)) {
		return text;
	}
	return text;
}

export function resolveOnlineEsignCompletedAt(record, completedAtOverride) {
	if (!record) return null;
	if (completedAtOverride && completedAtOverride[record.id]) {
		return completedAtOverride[record.id];
	}
	return record.onlineEsignCompletedAt || null;
}

export function resolveOfflineStampSupplementedAt(record, completedAtOverride) {
	if (!record) return null;
	if (completedAtOverride && completedAtOverride[record.id]) {
		return completedAtOverride[record.id];
	}
	return record.offlineStampSupplementedAt || null;
}

export function getContractSigningSubLabel(record, options) {
	options = options || {};
	var method = resolveContractSigningMethod(record && record.contractSigningMethod);
	var completedAtOverride = options.completedAtOverride || null;
	if (isOfflineContractSigning(method)) {
		if (!options.hasUploaded) return '待补传';
		return formatSigningStatusMinute(resolveOfflineStampSupplementedAt(record, completedAtOverride)) || '-';
	}
	return formatSigningStatusMinute(resolveOnlineEsignCompletedAt(record, completedAtOverride)) || '-';
}

export function getOnlineEsignContractFiles(record) {
	if (!record) return [];
	if (record.onlineEsignContractFiles && record.onlineEsignContractFiles.length) {
		return record.onlineEsignContractFiles;
	}
	if (resolveOnlineEsignCompletedAt(record, null)) {
		var code = record.contractCode || '租赁合同';
		return [{ uid: 'esign-' + (record.id || code), name: code + '-电子签章合同.pdf' }];
	}
	return [];
}

export function hasOnlineEsignCompleted(record, completedAtOverride) {
	return !!formatSigningStatusMinute(resolveOnlineEsignCompletedAt(record, completedAtOverride));
}

export function openOnlineEsignPreviewInNewTab(record) {
	var code = record && record.contractCode ? record.contractCode : '租赁合同';
	var customer = record && record.customerName ? record.customerName : '-';
	var principalPhone = record && record.customerPrincipalPhone ? record.customerPrincipalPhone : '-';
	var previewWindow = window.open('', '_blank');
	if (!previewWindow) {
		return false;
	}
	previewWindow.document.write(
		'<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8" />'
		+ '<title>' + code + ' · E签宝电子签章预览</title>'
		+ '<style>body{font-family:system-ui,-apple-system,sans-serif;margin:0;background:#f8fafc;color:#0f172a}'
		+ '.wrap{max-width:860px;margin:32px auto;padding:24px 28px;background:#fff;border:1px solid #e2e8f0;border-radius:12px}'
		+ 'h1{font-size:20px;margin:0 0 8px}p{margin:8px 0;color:#475569;line-height:1.6}'
		+ '.doc{margin-top:20px;padding:20px;border:1px dashed #cbd5e1;border-radius:8px;background:#f8fafc;min-height:320px}'
		+ '</style></head><body><div class="wrap">'
		+ '<h1>E签宝电子签章合同预览</h1>'
		+ '<p>合同编码：' + code + '</p>'
		+ '<p>乙方：' + customer + '</p>'
		+ '<p>乙方负责人手机号：' + principalPhone + '</p>'
		+ '<div class="doc"><p>此处为线上电子签章合同正文预览（原型）。</p><p>审批通过后，系统已向乙方负责人发送 E签宝签署链接。</p></div>'
		+ '</div></body></html>',
	);
	previewWindow.document.close();
	return true;
}

export function openContractAttachmentPreviewInNewTab(file, record) {
	var code = record && record.contractCode ? record.contractCode : '租赁合同';
	var fileName = file && file.name ? file.name : '附件';
	var previewWindow = window.open('', '_blank');
	if (!previewWindow) {
		return false;
	}
	previewWindow.document.write(
		'<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8" />'
		+ '<title>' + fileName + '</title>'
		+ '<style>body{font-family:system-ui,-apple-system,sans-serif;margin:0;background:#f1f5f9;color:#0f172a}'
		+ '.wrap{max-width:860px;margin:32px auto;padding:24px 28px;background:#fff;border:1px solid #e2e8f0;border-radius:12px}'
		+ 'h1{font-size:18px;margin:0 0 8px}p{margin:8px 0;color:#475569;line-height:1.6}'
		+ '.preview{margin-top:16px;padding:24px;border:1px dashed #cbd5e1;border-radius:8px;background:#f8fafc;min-height:280px}'
		+ '</style></head><body><div class="wrap">'
		+ '<h1>' + fileName + '</h1>'
		+ '<p>合同编码：' + code + '</p>'
		+ '<div class="preview"><p>线下人工上传附件预览（原型）。</p></div>'
		+ '</div></body></html>',
	);
	previewWindow.document.close();
	return true;
}

export function downloadContractAttachment(file, record) {
	var fileName = file && file.name ? file.name : '附件';
	var code = record && record.contractCode ? record.contractCode : '租赁合同';
	var blob = new Blob(['原型下载占位：' + code + ' / ' + fileName], { type: 'text/plain;charset=utf-8' });
	var url = URL.createObjectURL(blob);
	var link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
	return true;
}

export function resolvePartyBEmailForStamp(record) {
	if (!record) return '';
	if (record.customerPrincipalEmail) return record.customerPrincipalEmail;
	if (record.partyBEmail) return record.partyBEmail;
	var customerId = record.customerId || PARTY_B_CUSTOMER_IDS_BY_NAME[record.customerName] || '';
	var customer = getLeaseCustomerById(customerId);
	return customer && customer.email ? customer.email : '';
}

export function isPartyBEmailValid(email) {
	var value = (email || '').trim();
	if (!value) return false;
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function downloadPartyASignedContract(record) {
	var code = record && record.contractCode ? record.contractCode : '租赁合同';
	var fileName = code + '-甲方已签章.pdf';
	var blob = new Blob(['原型：' + code + ' 甲方已签章合同（请手动发送给乙方）'], { type: 'application/pdf' });
	var url = URL.createObjectURL(blob);
	var link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
	return true;
}
