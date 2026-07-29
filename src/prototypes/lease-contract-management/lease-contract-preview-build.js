/**
 * 租赁合同预览 HTML 拼装：占位符替换 + 2.6.1 开票信息 + 里程标准 + 客户资质附件
 */
import { getContractTemplateBaseHtml } from '../contract-template-management/contract-template-catalog.js';
import { getTemplateSectionVehicleBindings } from '../contract-template-management/contract-template-store.js';
import { applyAttachmentSectionVehicleFilter, renumberAttachmentSections } from '../contract-template-management/contract-template-section-filter.js';
import { splitMonolithicHtml } from '../contract-template-management/contract-template-section-html.js';
import {
	applyTemplateVars,
	buildLeasePreviewVars,
	getLeaseCustomerById,
	getLessorCompanyById,
	getCustomerAttachmentPreviewUrl,
	CUSTOMER_CREDENTIAL_ITEMS,
	CONTRACT_CODE_PREFIX,
} from '../contract-template-management/contract-template-vars.js';
import { calcRentServiceSubtotal, formatExtraServicesPreviewLines, formatLeasePeriod, normalizeExtraServices, normalizeBrandModels, normalizePlateNos, formatBrandModelPair, PLATE_ACTUAL_DELIVERY, calcInsuredVehicleCount, getRowVehicleCountForPricing, normalizeDelegateRows, formatLeaseOrderDeliveryRegion, formatLeaseOrderDeliveryDate } from './lease-order-vars.js';
import {
	injectPrototypeVehicleClauses,
	collectVehicleKeysFromLeaseOrder,
	applyVehicleClausePreviewFilter,
} from './lease-contract-vehicle-clause.js';

function escapeHtml(value) {
	return String(value != null ? value : '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function fillLabelInSlice(slice, label, value) {
	var safe = escapeHtml(value);
	var pattern = new RegExp('(' + label + '：)([\\s\\u00a0]*)(</p>)');
	return slice.replace(pattern, '$1 ' + safe + '$3');
}

function getContractCodeParts(form) {
	var code = form && form.contractCode ? String(form.contractCode).trim() : '';
	if (!code) return { full: '', suffix: '' };
	var prefix = CONTRACT_CODE_PREFIX || 'LNZLHT';
	if (code.indexOf(prefix) === 0) {
		return { full: code, suffix: code.slice(prefix.length) };
	}
	return { full: prefix + code, suffix: code };
}

/** 合同首页签章区乙方名称（模板该处无 {{customerName}} 占位符） */
export function applyCustomerPartyPatch(html, customer) {
	if (!html || !customer || !customer.name) return html;
	var safe = escapeHtml(customer.name);
	var pattern = /(<b>乙方<\/b><span class="s3" style="letter-spacing: 0\.1px"><b>（承租方）：<\/b><\/span>)([\s\u00a0]*)(（盖章）)/;
	return html.replace(pattern, '$1' + safe + '$3');
}

/** 2.6.1 乙方开票信息 */
export function applyInvoiceInfoPatch(html, customer) {
	if (!html || !customer) return html;
	var marker = '2.6.1 乙方开票信息如下';
	var start = html.indexOf(marker);
	if (start < 0) return html;
	var end = html.indexOf('2.6.2', start);
	if (end < 0) end = start + 1800;
	var head = html.slice(0, start);
	var slice = html.slice(start, end);
	var tail = html.slice(end);
	slice = fillLabelInSlice(slice, '企业名称', customer.companyName || customer.name || '');
	slice = fillLabelInSlice(slice, '开户银行', customer.bank || '');
	slice = fillLabelInSlice(slice, '银行账号', customer.bankAccount || '');
	slice = fillLabelInSlice(slice, '纳税人识别号', customer.taxId || customer.creditCode || '');
	slice = fillLabelInSlice(slice, '企业地址', customer.mailingAddress || customer.address || '');
	slice = fillLabelInSlice(slice, '企业电话', customer.companyPhone || '');
	return head + slice + tail;
}

function formatValidUntilLabel(value) {
	if (!value) return '2026年12月31日';
	var text = String(value).trim();
	if (/年.*月.*日/.test(text)) return text;
	var parts = text.split('-');
	if (parts.length === 3) {
		return parts[0] + '年' + parseInt(parts[1], 10) + '月' + parseInt(parts[2], 10) + '日';
	}
	return text;
}

/** 1.4.1–1.4.3 里程要求条款 */
export function applyMileageClausePatch(html, mileage) {
	if (!html || !mileage || !mileage.hasRequirement) return html;
	var km = mileage.targetKm != null ? mileage.targetKm : '';
	var period = mileage.period || 'month';
	html = fillMileageBracket(html, '1\\.4\\.1', '每月完成', period === 'month' ? km : '');
	html = fillMileageBracket(html, '1\\.4\\.2', '每季度完成', period === 'quarter' ? km : '');
	html = fillMileageBracket(html, '1\\.4\\.3', '每年度完成', period === 'year' ? km : '');
	return html;
}

function fillMileageBracket(html, clauseId, labelText, km) {
	var safe = escapeHtml(km);
	var pattern = new RegExp('(' + clauseId + '[\\s\\S]*?' + labelText + '【)\\s*([\\s\\u00a0]*)(】)');
	return html.replace(pattern, '$1' + safe + '$3');
}

/** 2.1.5 里程减免标准 */
export function applyMileageStandardPatch(html, mileage) {
	if (!html || !mileage) return html;
	var reduction = mileage.reductionYuan != null ? String(mileage.reductionYuan) : '2000';
	var validUntil = formatValidUntilLabel(mileage.validUntil);
	var threshold = mileage.hasRequirement
		? String(mileage.targetKm != null ? mileage.targetKm : 6000)
		: null;
	var start = html.indexOf('2.1.5');
	if (start < 0) return html;
	var end = html.indexOf('2.2', start);
	if (end < 0) end = start + 3500;
	var head = html.slice(0, start);
	var slice = html.slice(start, end);
	var tail = html.slice(end);
	if (threshold != null) {
		slice = slice.replace(/6000/g, threshold);
	}
	slice = slice.replace(/2000元\/辆/g, reduction + '元/辆');
	slice = slice.replace(/有效期至[^）)]+[）)]/, '有效期至' + validUntil + '止）');
	return head + slice + tail;
}

/** 2.1.1 付款周期：每【x】个自然月 */
export function applyPaymentPeriodPatch(html, feeInfo) {
	if (!html || !feeInfo) return html;
	var months = feeInfo.paymentPeriod != null ? String(feeInfo.paymentPeriod) : '';
	var paymentMethodLabel = feeInfo.paymentMethod === 'postpay' ? '先用后付' : '先付后用';
	var start = html.indexOf('2.1.1');
	if (start < 0) return html;
	var end = html.indexOf('2.1.2', start);
	if (end < 0) end = start + 800;
	var head = html.slice(0, start);
	var slice = html.slice(start, end);
	var tail = html.slice(end);
	slice = slice.replace(/(租金、服务费)(先付后用|先用后付)/, '$1' + escapeHtml(paymentMethodLabel));
	slice = slice.replace(/(每【)\s*([\s\u00a0]*)(】个自然月为一个付款周期)/, '$1' + escapeHtml(months) + '$3');
	return head + slice + tail;
}

/** 2.2.1 氢费支付方式：按月结算时切换为月结算条款 */
export function applyHydrogenSettlementPatch(html, feeInfo) {
	if (!html || !feeInfo || feeInfo.hydrogenPaymentMethod !== 'month') return html;
	var start = html.indexOf('2.2.1');
	if (start < 0) return html;
	var end = html.indexOf('2.2.2', start);
	if (end < 0) end = html.indexOf('2.2.3', start);
	if (end < 0) end = start + 2200;
	var head = html.slice(0, start);
	var slice = html.slice(start, end);
	var tail = html.slice(end);
	var monthlyClause = '如需甲方安排加氢的，氢费按月结算：每月 1 日至当月最后一日为一个结算周期，'
		+ '次月 5 日前结清上月氢费；乙方应按对账单确认金额及时支付，逾期支付的，甲方有权暂停安排加氢，'
		+ '由此造成的一切损失由乙方承担，给甲方造成损失的，乙方还应承担赔偿责任。';
	slice = slice.replace(/<p class="p6 lc-h2-settlement-prototype"[\s\S]*?<\/p>/g, '');
	slice = slice.replace(
		/2\.2\.1[\s\S]*?<\/p>/,
		'2.2.1 ' + escapeHtml(monthlyClause) + '</p>',
	);
	return head + slice + tail;
}

/** 2.2.1 氢费支付：预付款走提车应收款；其他方式可回填提前工作日 */
export function applyFeeInfoPatch(html, feeInfo) {
	if (!html || !feeInfo) return html;
	if (feeInfo.hydrogenPaymentMethod === 'month') return html;
	var start = html.indexOf('2.2.1');
	if (start < 0) return html;
	var end = html.indexOf('2.2.2', start);
	if (end < 0) end = html.indexOf('2.2.3', start);
	if (end < 0) end = start + 2200;
	var head = html.slice(0, start);
	var slice = html.slice(start, end);
	var tail = html.slice(end);
	if (feeInfo.hydrogenPaymentMethod === 'prepay') {
		var prepayAmount = feeInfo.prepayAmount != null && feeInfo.prepayAmount !== ''
			? escapeHtml(String(feeInfo.prepayAmount))
			: '—';
		var prepayNote = '预付款金额 ' + prepayAmount + ' 元；无需单独约定支付时间，在实际提车时通过「提车应收款」分摊支付'
			+ '（全部提车一次性付清；分批提车可部分领取，末次提车须结清剩余金额，不可修改）。';
		slice = slice.replace(/(提前【)\s*([\s\u00a0]*)(】个工作日内)/, escapeHtml(prepayNote));
		return head + slice + tail;
	}
	var days = feeInfo.payAheadWorkdays != null ? String(feeInfo.payAheadWorkdays) : '';
	slice = slice.replace(/(提前【)\s*([\s\u00a0]*)(】个工作日内)/, '$1' + escapeHtml(days) + '$3');
	return head + slice + tail;
}

/** 2.2.5 还车氢量差单价：与左侧「还车氢量差单价」表单联动 */
export function applyReturnHydrogenDiffPatch(html, feeInfo) {
	if (!html || !feeInfo) return html;
	var price = feeInfo.returnHydrogenDiffUnitPrice != null && feeInfo.returnHydrogenDiffUnitPrice !== ''
		? escapeHtml(String(feeInfo.returnHydrogenDiffUnitPrice))
		: '';
	var start = html.indexOf('2.2.5');
	if (start < 0) return html;
	var end = html.indexOf('2.2.6', start);
	if (end < 0) end = html.indexOf('2.3', start);
	if (end < 0) end = start + 600;
	var head = html.slice(0, start);
	var slice = html.slice(start, end);
	var tail = html.slice(end);
	slice = slice.replace(/(则按照【)\s*([\s\u00a0]*)(】元\/公斤)/, '$1' + price + '$3');
	return head + slice + tail;
}

/** 附件1：租赁订单编号、甲乙方与车辆列表反写 */
export function applyLeaseOrderAttachmentPatch(html, form, customer, lessor) {
	if (!html) return html;
	var attachStart = html.indexOf('1：租赁订单');
	if (attachStart < 0) attachStart = html.indexOf('订单编号');
	if (attachStart < 0) return html;
	var attachEnd = html.indexOf('附件2', attachStart);
	if (attachEnd < 0) attachEnd = html.length;

	var head = html.slice(0, attachStart);
	var slice = html.slice(attachStart, attachEnd);
	var tail = html.slice(attachEnd);

	var codeParts = getContractCodeParts(form);
	var fullContractCode = escapeHtml(codeParts.full);
	var contractCodeSuffix = escapeHtml(codeParts.suffix);

	if (contractCodeSuffix) {
		slice = slice.replace(
			/(<span class="s13"[^>]*>LNZLHT<\/span><span class="s14"[^>]*>)\s*([\s\u00a0]*)(<\/span>)/,
			'$1' + contractCodeSuffix + '$3',
		);
	}

	if (fullContractCode) {
		slice = slice.replace(
			/(合同编号<span class="s2"[^>]*>)\s*([\s\u00a0]*)(<\/span>)/,
			'$1' + fullContractCode + '$3',
		);
	}

	if (customer && customer.name) {
		var customerName = escapeHtml(customer.name);
		slice = slice.replace(
			/(<b>乙方\(承租方\):[\s\u00a0]*<\/b><\/span><span class="s16"[^>]*><b>)\s*([\s\u00a0]*)(<\/b><\/span>)/,
			'$1' + customerName + '$3',
		);
	}

	var sigMarker = slice.indexOf('甲方（签章');
	if (sigMarker >= 0) {
		var sigSlice = slice.slice(sigMarker);
		if (lessor && lessor.legalName) {
			var lessorName = escapeHtml(lessor.legalName);
			sigSlice = sigSlice.replace(
				/(<td class="td12"[^>]*>\s*<p class="p(?:37|168)"[^>]*>)\s*<br\/>\s*(<\/p>)/,
				'$1' + lessorName + '$2',
			);
		}
		if (customer && customer.name) {
			var partyBName = escapeHtml(customer.name);
			sigSlice = sigSlice.replace(
				/(<td class="td13"[^>]*>\s*<p[^>]*>[\s\S]*?<b>：<\/b>)(<\/p>)/,
				'$1' + partyBName + '$2',
			);
		}
		slice = slice.slice(0, sigMarker) + sigSlice;
	}

	var orders = (form && form.leaseOrder && form.leaseOrder.rows)
		|| (form && form.leaseOrders)
		|| [];
	var leaseOrder = form && form.leaseOrder;
	if (orders.length > 0) {
		var rowsHtml = expandLeaseOrderPreviewRows(orders, leaseOrder).join('');
		var marker = '一、租赁车辆信息';
		var tableMarkerPos = slice.indexOf(marker);
		if (tableMarkerPos >= 0) {
			var tbodyEnd = slice.indexOf('</tbody>', tableMarkerPos);
			if (tbodyEnd >= 0) {
				slice = slice.slice(0, tbodyEnd) + rowsHtml + slice.slice(tbodyEnd);
			}
		}
	}

	if (leaseOrder) {
		slice = applyLeaseOrderSummaryPatch(slice, leaseOrder);
		slice = applyLeaseOrderDeliveryPatch(slice, leaseOrder);
	}

	return head + slice + tail;
}

function applyLeaseOrderSummaryPatch(slice, leaseOrder) {
	var insuredCount = calcInsuredVehicleCount(leaseOrder);
	var thirdParty = leaseOrder.thirdPartyLiabilityMillion != null && leaseOrder.thirdPartyLiabilityMillion !== ''
		? escapeHtml(leaseOrder.thirdPartyLiabilityMillion)
		: '';
	if (insuredCount > 0) {
		slice = slice.replace(
			/(租赁车辆含保险总计)\s*([\s\u00a0]*)(辆)/,
			'$1 ' + escapeHtml(insuredCount) + ' $3',
		);
	}
	if (thirdParty) {
		slice = slice.replace(
			/(三者责任险【)\s*([\s\u00a0]*)(】万元)/,
			'$1' + thirdParty + '$3',
		);
	}
	return slice;
}

function applyLeaseOrderDeliveryPatch(slice, leaseOrder) {
	var regionText = formatLeaseOrderDeliveryRegion(leaseOrder);
	if (regionText && regionText !== '-') {
		slice = slice.replace(
			/(车辆交付（交还）地点：)\s*([\s\u00a0]*)(。)/,
			'$1' + escapeHtml(regionText) + '$3',
		);
	}
	var dateText = formatLeaseOrderDeliveryDate(leaseOrder);
	if (dateText && dateText !== '-') {
		slice = slice.replace(
			/(车辆交付时间：)\s*([\s\u00a0\u2002]*年\s*[\s\u00a0\u2002]*月\s*[\s\u00a0\u2002]*日)/,
			'$1' + escapeHtml(dateText),
		);
	}
	return slice;
}

function expandLeaseOrderPreviewRows(orders, leaseOrder) {
	var rows = [];
	orders.forEach(function (row) {
		var brandModels = normalizeBrandModels(row);
		var plates = normalizePlateNos(row);
		var lineCount = Math.max(brandModels.length, plates.length, 1);
		for (var i = 0; i < lineCount; i++) {
			var pair = brandModels[i] || brandModels[0] || [];
			var plate = plates[i] || plates[0] || PLATE_ACTUAL_DELIVERY;
			rows.push(buildLeaseOrderPreviewRow(row, pair, plate, leaseOrder));
		}
	});
	return rows;
}

function buildLeaseOrderPreviewRow(row, brandModelPair, plate, leaseOrder) {
	var brandModelText = brandModelPair.length >= 2
		? escapeHtml(formatBrandModelPair(brandModelPair[0], brandModelPair[1]))
		: '';
	var brand = brandModelPair[0] ? escapeHtml(brandModelPair[0]) : '';
	var model = brandModelPair[1] ? escapeHtml(brandModelPair[1]) : '';
	var plateText = escapeHtml(plate || PLATE_ACTUAL_DELIVERY);
	var extraServices = normalizeExtraServices(row);
	var vehicleCount = getRowVehicleCountForPricing(row, leaseOrder || { rows: [row] });
	var subtotal = row.rentServiceSubtotal != null && row.rentServiceSubtotal !== ''
		? escapeHtml(row.rentServiceSubtotal)
		: (function () {
			var computed = calcRentServiceSubtotal(row.rent, row.serviceFee, vehicleCount);
			return computed != null ? escapeHtml(computed) : '';
		}());
	var rent = row.rent != null && row.rent !== '' ? escapeHtml(row.rent) : '';
	var serviceFee = row.serviceFee != null && row.serviceFee !== '' ? escapeHtml(row.serviceFee) : '';
	var deposit = row.deposit != null && row.deposit !== '' ? escapeHtml(row.deposit) : '';
	var extra = formatExtraServicesPreviewLines(extraServices).map(function (line) {
		return '<p style="margin:0;text-align:center;font:9px Times">' + escapeHtml(line) + '</p>';
	}).join('');
	var leasePeriod = escapeHtml(formatLeasePeriod(row));
	var border = 'border:1px solid #bfbfbf;padding:0 5px';
	var brandCell = brandModelText
		? '<p style="margin:0;text-align:center;font:9px Times"><b>' + brandModelText + '</b></p>'
		: '<p style="margin:0;text-align:center;font:9px Times"><b>' + brand + '</b></p>'
			+ '<p style="margin:0;text-align:center;font:9px Times">' + model + '</p>';
	return '<tr data-lc-lease-order-row="1">'
		+ '<td style="min-width:36px;' + border + '" valign="top">' + brandCell + '</td>'
		+ '<td style="min-width:51px;' + border + '" valign="middle">'
		+ '<p style="margin:0;text-align:center;font:9px Times">' + plateText + '</p></td>'
		+ '<td style="min-width:84px;' + border + '" valign="middle">'
		+ '<p style="margin:0;text-align:center;font:9px Times">' + subtotal + '</p></td>'
		+ '<td style="min-width:72px;' + border + '" valign="middle">'
		+ '<p style="margin:0;text-align:center;font:9px Times">' + rent + '</p></td>'
		+ '<td style="min-width:56px;' + border + '" valign="middle">'
		+ '<p style="margin:0;text-align:center;font:9px Times">' + serviceFee + '</p></td>'
		+ '<td style="min-width:88px;' + border + '" valign="middle">'
		+ '<p style="margin:0;text-align:center;font:9px Times">' + extra + '</p></td>'
		+ '<td style="min-width:41px;' + border + '" valign="middle">'
		+ '<p style="margin:0;text-align:center;font:9px Times">' + deposit + '</p></td>'
		+ '<td style="min-width:94px;' + border + '" valign="middle">'
		+ '<p style="margin:0;text-align:center;font:9px Times">' + leasePeriod + '</p></td>'
		+ '</tr>';
}

/** 授权委托书：受托人信息反写 */
export function applyPowerOfAttorneyPatch(html, form) {
	if (!html || !form || !form.powerOfAttorney) return html;
	var delegates = normalizeDelegateRows(form.powerOfAttorney.delegates || []);
	if (!delegates.length) return html;
	var marker = '授权委托书';
	var start = html.indexOf(marker);
	if (start < 0) return html;
	var sliceStart = html.lastIndexOf('<p', start);
	var sliceEnd = html.indexOf('附件', start + marker.length);
	if (sliceEnd < 0) sliceEnd = start + 4000;
	var head = html.slice(0, sliceStart >= 0 ? sliceStart : start);
	var slice = html.slice(sliceStart >= 0 ? sliceStart : start, sliceEnd);
	var tail = html.slice(sliceEnd);
	delegates.forEach(function (delegate, index) {
		var name = escapeHtml((delegate.name || '').trim());
		var contact = escapeHtml((delegate.contact || '').trim());
		var idNumber = escapeHtml((delegate.idNumber || '').trim());
		if (index === 0) {
			if (/受托人[：:]/u.test(slice)) {
				slice = slice.replace(/(受托人[：:]\s*)([\s\u00a0]*)/, '$1' + name + ' ');
			} else {
				slice = slice.replace(/(委托人[：:]\s*)([\s\u00a0]*)/, '$1' + name + ' ');
			}
			slice = slice.replace(/(联系电话[：:]\s*)([\s\u00a0]*)/, '$1' + contact + ' ');
			slice = slice.replace(/(身份证号码[：:]\s*)([\s\u00a0]*)/, '$1' + idNumber + ' ');
		}
	});
	return head + slice + tail;
}

function attachmentPlaceholderBlock(title, fileName, imageUrl) {
	if (imageUrl) {
		return '<div class="lc-preview-attach">'
			+ '<p class="p12" style="margin:12px 0 6px;text-align:center;font:10.5px Times;font-weight:700">' + escapeHtml(title) + '</p>'
			+ '<div class="lc-preview-attach__frame lc-preview-attach__frame--image">'
			+ '<img class="lc-preview-attach__image" src="' + imageUrl + '" alt="' + escapeHtml(title) + '" />'
			+ '</div></div>';
	}
	return '<div class="lc-preview-attach">'
		+ '<p class="p12" style="margin:12px 0 6px;text-align:center;font:10.5px Times;font-weight:700">' + escapeHtml(title) + '</p>'
		+ '<div class="lc-preview-attach__frame" role="img" aria-label="' + escapeHtml(title) + '">'
		+ '<span class="lc-preview-attach__file">' + escapeHtml(fileName || '附件') + '</span>'
		+ '</div></div>';
}

/** 合同尾页附上客户资质附件 */
export function appendCustomerCredentialAttachments(html, customer) {
	if (!html || !customer || !customer.attachments) return html;
	var blocks = [];
	CUSTOMER_CREDENTIAL_ITEMS.forEach(function (item, index) {
		if (index > 0 && index % 2 === 0) {
			blocks.push('<hr class="ct-page-break" data-page-break="1" />');
		}
		var file = customer.attachments[item.key];
		var previewUrl = getCustomerAttachmentPreviewUrl(customer, item.key, item.label);
		blocks.push(attachmentPlaceholderBlock(item.label, file && file.name, previewUrl));
	});
	var section = '<div class="lc-preview-credentials">'
		+ '<hr class="ct-page-break" data-page-break="1" />'
		+ '<p class="p12" style="margin:0 0 12px;text-align:center;font:12pt Times;font-weight:700">客户资质附件（乙方）</p>'
		+ blocks.join('')
		+ '</div>';
	var closeIdx = html.lastIndexOf('</div>');
	if (closeIdx < 0) return html + section;
	return html.slice(0, closeIdx) + section + html.slice(closeIdx);
}

function stripUnresolvedPlaceholders(html) {
	return String(html || '').replace(/\{\{[^{}]+\}\}/g, '');
}

/** 添加授权委托书等场景：从完整合同 HTML 中截取授权委托书预览片段 */
export function extractPowerOfAttorneyPreviewHtml(html) {
	if (!html) return '';
	var sections = splitMonolithicHtml(html);
	var slice = String(sections.authorization || '').trim();
	if (!slice) return html;
	return '<div class="lc-preview-scoped-only lc-preview-poa-only" data-preview-scope="poa">'
		+ '<p class="lc-preview-scoped-only__banner" role="note">'
		+ '以下为授权委托书预览，主合同及其他附件无需重新签署。'
		+ '</p>'
		+ slice
		+ '</div>';
}

/** 新增车辆等场景：从完整合同 HTML 中截取附件1（租赁订单）预览片段 */
export function extractLeaseOrderAttachment1PreviewHtml(html) {
	if (!html) return '';
	var text = String(html);
	var markers = ['附件1', '1：租赁订单', '附件 1'];
	var start = -1;
	for (var i = 0; i < markers.length; i++) {
		var pos = text.indexOf(markers[i]);
		if (pos >= 0) {
			start = pos;
			break;
		}
	}
	if (start < 0) return text;

	var endMarkers = ['附件2', '附件 2', '附件二'];
	var end = text.length;
	for (var j = 0; j < endMarkers.length; j++) {
		var endPos = text.indexOf(endMarkers[j], start + 4);
		if (endPos >= 0 && endPos < end) end = endPos;
	}

	var slice = text.slice(start, end).trim();
	if (!slice) return text;
	return '<div class="lc-preview-scoped-only lc-preview-attachment1-only" data-preview-scope="attachment1">'
		+ '<p class="lc-preview-scoped-only__banner" role="note">'
		+ '以下为新增租赁订单附件1预览，主合同及其他附件无需重新签署。'
		+ '</p>'
		+ slice
		+ '</div>';
}

export function buildLeaseContractPreviewHtml(form) {
	var templateId = form && form.contractTemplateId;
	var base = getContractTemplateBaseHtml(templateId) || '';
	var sectionBindings = getTemplateSectionVehicleBindings(templateId);
	var vars = buildLeasePreviewVars(form || {});
	var html = stripUnresolvedPlaceholders(applyTemplateVars(base, vars));
	var vehicleKeys = collectVehicleKeysFromLeaseOrder(form);
	html = applyAttachmentSectionVehicleFilter(html, sectionBindings, vehicleKeys);
	html = renumberAttachmentSections(html);
	html = injectPrototypeVehicleClauses(html);
	var customer = getLeaseCustomerById(form && form.customerId);
	var lessor = getLessorCompanyById(form && form.lessorId);
	html = applyCustomerPartyPatch(html, customer);
	html = applyInvoiceInfoPatch(html, customer);
	html = applyMileageClausePatch(html, form && form.mileage);
	html = applyMileageStandardPatch(html, form && form.mileage);
	html = applyPaymentPeriodPatch(html, form && form.feeInfo);
	html = applyFeeInfoPatch(html, form && form.feeInfo);
	html = applyReturnHydrogenDiffPatch(html, form && form.feeInfo);
	html = applyHydrogenSettlementPatch(html, form && form.feeInfo);
	html = applyLeaseOrderAttachmentPatch(html, form, customer, lessor);
	html = applyPowerOfAttorneyPatch(html, form);
	html = appendCustomerCredentialAttachments(html, customer);
	html = applyVehicleClausePreviewFilter(html, vehicleKeys);
	return html;
}
