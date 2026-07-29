/**
 * 租赁合同预览：条件条款（按订单车辆品牌型号命中显隐）
 */

export function vehicleBindingKey(binding) {
	return String(binding.brand || '') + '|' + String(binding.model || '');
}

export function parseVehicleClauseBindings(raw) {
	if (!raw) return [];
	try {
		var parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch (err) {
		return [];
	}
}

export function vehicleClauseMatchesPreview(bindings, selectedKeys) {
	var keys = selectedKeys || [];
	if (!keys.length) return false;
	var list = bindings || [];
	if (!list.length) return false;
	return list.some(function (item) {
		return keys.indexOf(vehicleBindingKey(item)) >= 0;
	});
}

function escapeAttr(value) {
	return String(value || '')
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;');
}

function unwrapVehicleClauseElement(clauseEl) {
	if (!clauseEl || !clauseEl.parentNode) return;
	var parent = clauseEl.parentNode;
	var footer = clauseEl.querySelector('.ct-vehicle-clause__footer');
	if (footer) footer.parentNode.removeChild(footer);
	while (clauseEl.firstChild) parent.insertBefore(clauseEl.firstChild, clauseEl);
	parent.removeChild(clauseEl);
}

/** 标准合同 V26.6 原型内置的条件条款定义（与模板注入点一致） */
export var PROTOTYPE_VEHICLE_CLAUSE_DEFS = [
	{
		id: 'lc-vc-18t-mileage',
		label: '2.1.5.4 持续达标减免',
		summary: '租赁期间每月行驶里程均满 6000 公里，可每月享受次月 2000 元/辆租金减免。',
		bindings: [{ brand: '现代', model: '18吨氢燃料电池车' }],
		paragraphMarker: '<b>2.1.5.4持续达标减免</b>',
	},
	{
		id: 'lc-vc-sl-mileage',
		label: '2.1.5.3 连续周期减免',
		summary: '单辆车连续两个月累计行驶里程达到 12000 公里，该两个月均能享受租金减免。',
		bindings: [{ brand: '苏龙', model: '9.6米氢燃料电池车' }],
		paragraphMarker: '<b>2.1.5.3连续周期减免：单辆车</b>',
	},
	{
		id: 'lc-vc-coldchain',
		label: '2.1.5.2 里程补足与累计',
		summary: '冷链车型次月里程可补足上月未达 6000 公里的差额部分。',
		bindings: [{ brand: '现代', model: '帕力安牌4.5吨冷链车' }],
		paragraphMarker: '<b>2.1.5.2里程补足与累计</b>',
	},
];

export function getMatchedPrototypeClauses(brand, model) {
	if (!brand || !model) return [];
	var key = vehicleBindingKey({ brand: brand, model: model });
	return PROTOTYPE_VEHICLE_CLAUSE_DEFS.filter(function (def) {
		return def.bindings.some(function (item) {
			return vehicleBindingKey(item) === key;
		});
	});
}

export function collectVehicleKeysFromLeaseOrder(form) {
	var rows = (form && form.leaseOrder && form.leaseOrder.rows) || [];
	var keys = [];
	rows.forEach(function (row) {
		var brandModels = row.brandModels || (row.brandModel && row.brandModel.length >= 2 ? [row.brandModel] : []);
		brandModels.forEach(function (pair) {
			if (pair && pair.length >= 2) {
				var key = vehicleBindingKey({ brand: pair[0], model: pair[1] });
				if (keys.indexOf(key) < 0) keys.push(key);
			}
		});
	});
	return keys;
}

function wrapClauseParagraph(html, def) {
	if (!html || html.indexOf('data-vehicle-clause-id="' + def.id + '"') >= 0) return html;
	var idx = html.indexOf(def.paragraphMarker);
	if (idx < 0) return html;
	var pStart = html.lastIndexOf('<p ', idx);
	var pEnd = html.indexOf('</p>', idx);
	if (pStart < 0 || pEnd < 0) return html;
	var paragraph = html.slice(pStart, pEnd + 4);
	if (paragraph.indexOf('ct-vehicle-clause') >= 0) return html;
	var wrapped = '<div class="ct-vehicle-clause" data-vehicle-clause="1" data-vehicle-clause-id="'
		+ def.id
		+ '" data-vehicle-bindings="'
		+ escapeAttr(JSON.stringify(def.bindings))
		+ '">'
		+ paragraph
		+ '</div>';
	return html.slice(0, pStart) + wrapped + html.slice(pEnd + 4);
}

function htmlHasVehicleClauseMarks(html) {
	var source = String(html || '');
	return source.indexOf('ct-vehicle-clause') >= 0 || source.indexOf('data-vehicle-clause') >= 0;
}

/** 为 V26.6 标准合同注入演示用条件条款包裹（正式环境由模板管理产出） */
export function injectPrototypeVehicleClauses(html) {
	var next = String(html || '');
	if (htmlHasVehicleClauseMarks(next)) return next;
	PROTOTYPE_VEHICLE_CLAUSE_DEFS.forEach(function (def) {
		next = wrapClauseParagraph(next, def);
	});
	return next;
}

export function applyVehicleClausePreviewFilter(html, selectedKeys) {
	if (!html || typeof document === 'undefined') return String(html || '');
	var div = document.createElement('div');
	div.innerHTML = html;
	var keys = selectedKeys || [];
	div.querySelectorAll('.ct-vehicle-clause[data-vehicle-clause="1"]').forEach(function (el) {
		var bindings = parseVehicleClauseBindings(el.getAttribute('data-vehicle-bindings'));
		if (!vehicleClauseMatchesPreview(bindings, keys)) {
			el.parentNode.removeChild(el);
		} else {
			unwrapVehicleClauseElement(el);
		}
	});
	return div.innerHTML;
}
