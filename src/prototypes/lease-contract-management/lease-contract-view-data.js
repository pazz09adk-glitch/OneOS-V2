/**
 * 合同查看页：附件、操作记录、变更记录（原型样例）
 */

import { openContractAttachmentPreviewInNewTab, downloadContractAttachment } from './lease-contract-signing.js';

export var CHANGE_RECORD_TYPES = [
	{ key: 'tripartite', label: '转三方协议' },
	{ key: 'poa', label: '添加授权委托书' },
	{ key: 'extraFee', label: '附加费用' },
	{ key: 'ownerChange', label: '变更业务负责人' },
	{ key: 'terminate', label: '主动终止合同' },
];

function padMinute(value) {
	if (!value) return '-';
	var text = String(value).trim();
	if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(text)) return text.slice(0, 16);
	return text;
}

export function buildContractAttachments(record) {
	if (!record) return [];
	var code = record.contractCode || '租赁合同';
	var files = [];
	if (record.stampedContractFiles && record.stampedContractFiles.length) {
		files = record.stampedContractFiles.slice();
	} else if (record.onlineEsignContractFiles && record.onlineEsignContractFiles.length) {
		files = record.onlineEsignContractFiles.slice();
	} else if (record.onlineEsignCompletedAt || record.legalStampedContractUploaded) {
		files = [{ uid: 'esign-main', name: code + '-电子签章合同.pdf' }];
	}
	if (record.contractSigningMethod !== 'offline_manual' && !files.length && record.approvalStatus === '审批通过') {
		files.push({ uid: 'draft-main', name: code + '-租赁合同正文.pdf' });
	}
	return files;
}

export function buildContractOperationLogs(record) {
	if (!record) return [];
	var logs = [
		{
			id: 'op-create',
			action: '创建合同',
			operatorName: record.creator || '-',
			operateTime: padMinute(record.createTime),
			modifierName: record.updater && record.updater !== '-' ? record.updater : record.creator || '-',
			modifyTime: padMinute(record.updateTime && record.updateTime !== '-' ? record.updateTime : record.createTime),
		},
	];
	if (record.approvalStatus && record.approvalStatus !== '未提交' && record.approvalStatus !== '草稿') {
		logs.push({
			id: 'op-submit',
			action: '提交审核',
			operatorName: record.creator || '-',
			operateTime: padMinute(record.createTime),
			modifierName: record.updater || record.creator || '-',
			modifyTime: padMinute(record.updateTime),
		});
	}
	if (record.approvalStatus === '审批通过') {
		logs.push({
			id: 'op-approve',
			action: '审批通过',
			operatorName: record.businessOwner || '业务负责人',
			operateTime: padMinute(record.updateTime),
			modifierName: record.updater || record.businessOwner || '-',
			modifyTime: padMinute(record.updateTime),
		});
	}
	return logs;
}

export function buildContractChangeRecords(record) {
	if (!record) return [];
	var list = [];
	if (record.changeRecords && record.changeRecords.length) {
		return record.changeRecords.map(function (item, index) {
			return Object.assign({ id: item.id || ('chg-' + index) }, item);
		});
	}
	if (record.poaUploaded) {
		list.push({
			id: 'chg-poa',
			type: 'poa',
			typeLabel: '添加授权委托书',
			summary: '已维护授权委托书与受托人信息',
			operatorName: record.creator || '-',
			operateTime: padMinute(record.createTime),
			approvalStatus: '审批通过',
		});
	}
	if (record.contractApprovalType === '非标准合同') {
		list.push({
			id: 'chg-nonstd',
			type: 'extraFee',
			typeLabel: '附加费用',
			summary: '历史附加费用变更记录（原型样例）',
			operatorName: record.businessOwner || '-',
			operateTime: padMinute(record.updateTime),
			approvalStatus: '审批通过',
		});
	}
	if (record.terminatedBy) {
		list.push({
			id: 'chg-term',
			type: 'terminate',
			typeLabel: '主动终止合同',
			summary: record.remark || '合同已终止',
			operatorName: record.updater || record.businessOwner || '-',
			operateTime: padMinute(record.updateTime),
			approvalStatus: '审批通过',
		});
	}
	return list;
}

export function previewContractAttachment(file, record) {
	return openContractAttachmentPreviewInNewTab(file, record);
}

export function downloadContractAttachmentFile(file, record) {
	return downloadContractAttachment(file, record);
}
