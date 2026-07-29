/**
 * Word 合同预览分页（与合同模板管理共用逻辑）
 */
import { V266_LEASE_DOCUMENT_HTML } from '../contract-template-management/v266-lease-document.js';

export function isWordFormattedDoc(html) {
	var source = String(html || '');
	return /ct-word-doc|ct-word-title|ct-word-doc--v266/.test(source)
		|| /class="p\d+"/.test(source)
		|| /font:\s*\d+(?:\.\d+)?px\s+Times/i.test(source);
}

function stripRiskRedlinePreviewFooters(html) {
	if (!html || typeof document === 'undefined') return String(html || '');
	var div = document.createElement('div');
	div.innerHTML = html;
	div.querySelectorAll('.ct-risk-redline__footer').forEach(function (el) {
		el.parentNode.removeChild(el);
	});
	return div.innerHTML;
}

function stripEmptyRiskRedlines(html) {
	if (!html || typeof document === 'undefined') return String(html || '');
	var div = document.createElement('div');
	div.innerHTML = html;
	div.querySelectorAll('.ct-risk-redline[data-risk-redline="1"]').forEach(function (el) {
		var inner = String(el.innerHTML || '')
			.replace(/<br\s*\/?>/gi, '')
			.replace(/&nbsp;/gi, '')
			.replace(/\u200b/g, '')
			.trim();
		var text = String(el.textContent || '').replace(/\s/g, '').trim();
		if (!inner && !text) {
			var parent = el.parentNode;
			if (parent) parent.removeChild(el);
		}
	});
	return div.innerHTML;
}

function fixWordPreviewHtml(html) {
	if (!html || typeof document === 'undefined') return String(html || '');
	var div = document.createElement('div');
	var cleaned = String(html)
		.replace(/<\/p><td[^>]*>[\s\S]*?<\/tr><\/tbody><\/table>/g, function (frag) {
			return frag.indexOf('<table') >= 0 ? frag : '</p>';
		});
	div.innerHTML = cleaned;
	div.querySelectorAll('table.ct-word-table').forEach(function (table) {
		var maxCols = 0;
		table.querySelectorAll('tr').forEach(function (tr) {
			var cols = 0;
			tr.querySelectorAll('td, th').forEach(function (td) {
				cols += parseInt(td.getAttribute('colspan') || '1', 10);
			});
			if (cols > maxCols) maxCols = cols;
		});
		if (maxCols <= 1) return;
		table.querySelectorAll('tr').forEach(function (tr) {
			var tds = tr.querySelectorAll('td, th');
			var cols = 0;
			tds.forEach(function (td) { cols += parseInt(td.getAttribute('colspan') || '1', 10); });
			if (tds.length === 1 && cols === 1) {
				tds[0].setAttribute('colspan', String(maxCols));
				tds[0].classList.add('ct-word-td-full');
			}
		});
	});
	return div.innerHTML;
}

export function ensureV266WordStyles(html) {
	var content = String(html || '');
	if (!isWordFormattedDoc(content) || typeof document === 'undefined') return content;

	var cssText = '';
	var match = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
	if (match) {
		cssText = match[1];
		content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/i, '');
	} else if (V266_LEASE_DOCUMENT_HTML) {
		var fullMatch = V266_LEASE_DOCUMENT_HTML.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
		if (fullMatch) cssText = fullMatch[1];
	}
	if (!cssText) return content;

	var styleEl = document.getElementById('ct-v266-word-styles');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'ct-v266-word-styles';
		document.head.appendChild(styleEl);
	}
	if (styleEl.textContent !== cssText) styleEl.textContent = cssText;

	if (content.indexOf('ct-word-doc--v266') < 0) {
		content = '<div class="ct-word-doc ct-word-doc--v266">' + content + '</div>';
	}
	return content;
}

export function prepareWordHtml(html) {
	var content = String(html || '');
	if (!content) return '';
	if (isWordFormattedDoc(content)) {
		content = ensureV266WordStyles(content);
		content = fixWordPreviewHtml(content);
		content = stripEmptyRiskRedlines(content);
		content = stripRiskRedlinePreviewFooters(content);
	}
	return content;
}

function isPageBreakNode(node) {
	if (!node || node.nodeType !== 1) return false;
	if (node.nodeName === 'HR' && (
		(node.classList && node.classList.contains('ct-page-break')) ||
		node.getAttribute('data-page-break')
	)) return true;
	return false;
}

export function paginateWordHtml(html) {
	var MM = 96 / 25.4;
	var contentH = Math.floor((297 - 25.4 * 2) * MM);
	var contentW = Math.floor((210 - 31.8 * 2) * MM);
	var fixed = prepareWordHtml(html);
	if (isWordFormattedDoc(html)) ensureV266WordStyles(html);
	var sandbox = document.createElement('div');
	sandbox.style.cssText = 'position:fixed;left:-20000px;top:0;visibility:hidden;pointer-events:none;';
	document.body.appendChild(sandbox);

	var measure = document.createElement('div');
	measure.className = 'ct-word-doc ct-word-doc--v266 ct-word-measure';
	measure.style.width = contentW + 'px';
	measure.style.boxSizing = 'border-box';
	measure.innerHTML = fixed;
	sandbox.appendChild(measure);

	var root = measure.querySelector('.ct-word-doc') || measure;
	var nodes = [];
	root.childNodes.forEach(function (n) {
		if (n.nodeType === 1) nodes.push(n);
		else if (n.nodeType === 3 && String(n.textContent || '').trim()) {
			var p = document.createElement('p');
			p.className = 'ct-word-body';
			p.textContent = n.textContent;
			nodes.push(p);
		}
	});

	var pageMeasure = document.createElement('div');
	pageMeasure.className = 'ct-word-doc ct-word-doc--v266 ct-word-measure';
	pageMeasure.style.width = contentW + 'px';
	pageMeasure.style.boxSizing = 'border-box';
	sandbox.appendChild(pageMeasure);

	var pages = [];
	nodes.forEach(function (node) {
		if (isPageBreakNode(node)) {
			if (pageMeasure.innerHTML.trim()) pages.push(pageMeasure.innerHTML);
			pageMeasure.innerHTML = '';
			return;
		}
		var clone = node.cloneNode(true);
		pageMeasure.appendChild(clone);
		if (pageMeasure.scrollHeight > contentH + 4) {
			pageMeasure.removeChild(clone);
			if (pageMeasure.innerHTML.trim()) pages.push(pageMeasure.innerHTML);
			pageMeasure.innerHTML = '';
			pageMeasure.appendChild(clone);
			if (pageMeasure.scrollHeight > contentH + 4) {
				pages.push(pageMeasure.innerHTML);
				pageMeasure.innerHTML = '';
			}
		}
	});
	if (pageMeasure.innerHTML.trim()) pages.push(pageMeasure.innerHTML);
	if (!pages.length) pages.push(fixed);

	document.body.removeChild(sandbox);
	return pages;
}
