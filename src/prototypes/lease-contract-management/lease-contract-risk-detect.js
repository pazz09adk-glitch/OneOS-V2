/**
 * 租赁合同预览：检测风控红线条款（模板标记）是否被修改
 */

export var STANDARD_CONTRACT_APPROVAL = '标准合同';
export var NONSTANDARD_CONTRACT_APPROVAL = '非标准合同';

var RISK_SELECTOR = '.ct-risk-redline[data-risk-redline="1"]';
var LOCKED_SELECTOR = '[data-section-locked="1"], .ct-section-locked';

function normalizeRiskText(value) {
	return String(value || '')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/&nbsp;/gi, ' ')
		.replace(/\u200b/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function truncatePreviewText(value, maxLen) {
	var text = normalizeRiskText(value);
	if (!text) return '（空）';
	if (text.length <= maxLen) return text;
	return text.slice(0, maxLen) + '…';
}

function collectRiskSnapshots(html) {
	if (!html || typeof document === 'undefined') return [];
	var div = document.createElement('div');
	div.innerHTML = String(html || '');
	var list = [];
	div.querySelectorAll(RISK_SELECTOR).forEach(function (el, index) {
		list.push({
			id: el.getAttribute('data-risk-id') || ('risk-' + index),
			text: normalizeRiskText(el.innerHTML),
		});
	});
	return list;
}

function collectParagraphSnapshots(html) {
	if (!html || typeof document === 'undefined') return [];
	var div = document.createElement('div');
	div.innerHTML = String(html || '');
	var list = [];
	div.querySelectorAll('p, li, td, th').forEach(function (el, index) {
		var text = normalizeRiskText(el.textContent || '');
		if (!text || text.length < 8) return;
		list.push({
			id: 'block-' + index,
			text: text,
		});
	});
	return list;
}

/** 风控红线条款正文是否与基线不一致 */
export function isRiskRedlineContentModified(baselineHtml, currentHtml) {
	var baseline = collectRiskSnapshots(baselineHtml);
	var current = collectRiskSnapshots(currentHtml);
	if (!baseline.length && !current.length) return false;
	if (baseline.length !== current.length) return true;
	for (var i = 0; i < baseline.length; i++) {
		if (baseline[i].text !== current[i].text) return true;
	}
	return false;
}

/** 预览正文是否新增条款（相对基线出现新的段落块） */
export function isPreviewNewClauseAdded(baselineHtml, currentHtml) {
	var baseline = collectParagraphSnapshots(baselineHtml);
	var current = collectParagraphSnapshots(currentHtml);
	if (current.length > baseline.length) return true;
	var baselineSet = {};
	baseline.forEach(function (item) {
		baselineSet[item.text] = true;
	});
	for (var i = 0; i < current.length; i++) {
		if (!baselineSet[current[i].text]) return true;
	}
	return false;
}

/** 收集标准条款与修改后条款记录（原型对比） */
export function collectClauseChangeRecords(baselineHtml, currentHtml) {
	if (!baselineHtml || !currentHtml || typeof document === 'undefined') return [];
	var records = [];
	var baselineRisks = collectRiskSnapshots(baselineHtml);
	var currentRisks = collectRiskSnapshots(currentHtml);
	var maxRisk = Math.max(baselineRisks.length, currentRisks.length);
	for (var i = 0; i < maxRisk; i++) {
		var before = baselineRisks[i];
		var after = currentRisks[i];
		var beforeText = before ? before.text : '';
		var afterText = after ? after.text : '';
		if (beforeText === afterText) continue;
		records.push({
			id: (after && after.id) || (before && before.id) || ('risk-' + i),
			kind: 'risk',
			kindLabel: '风控红线',
			standardText: truncatePreviewText(beforeText, 180),
			modifiedText: truncatePreviewText(afterText, 180),
		});
	}

	var baselineBlocks = collectParagraphSnapshots(baselineHtml);
	var currentBlocks = collectParagraphSnapshots(currentHtml);
	var baselineMap = {};
	baselineBlocks.forEach(function (item) {
		baselineMap[item.text] = item;
	});
	currentBlocks.forEach(function (item, index) {
		if (baselineMap[item.text]) return;
		records.push({
			id: 'new-' + index,
			kind: 'new',
			kindLabel: '新增条款',
			standardText: '（标准合同无对应段落）',
			modifiedText: truncatePreviewText(item.text, 180),
		});
	});

	var currentMap = {};
	currentBlocks.forEach(function (item) {
		currentMap[item.text] = item;
	});
	baselineBlocks.forEach(function (item, index) {
		if (currentMap[item.text]) return;
		records.push({
			id: 'removed-' + index,
			kind: 'removed',
			kindLabel: '删除段落',
			standardText: truncatePreviewText(item.text, 180),
			modifiedText: '（已删除）',
		});
	});

	return records.slice(0, 12);
}

export function mergePreviewPages(pages) {
	return (pages || []).join('');
}

export function resolveContractApprovalType(baselineHtml, currentHtml) {
	return isRiskRedlineContentModified(baselineHtml, currentHtml)
		|| isPreviewNewClauseAdded(baselineHtml, currentHtml)
		? NONSTANDARD_CONTRACT_APPROVAL
		: STANDARD_CONTRACT_APPROVAL;
}
